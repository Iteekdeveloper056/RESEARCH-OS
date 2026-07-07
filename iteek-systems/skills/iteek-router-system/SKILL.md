---
name: iteek-router-system
description: The ITEEK Router System — vendor-neutral LLM access for any static/serverless web app, built on OpenRouter. One API key, many models, with auto-routing, fallback, cost tiers, and browser-only key storage. Drop into any Claude/GPT/agent build.
version: 1.0
author: ITEEK AI Solutions
created: 2026-07-07
license: MIT
provider: OpenRouter (https://openrouter.ai)
tags: [iteek-router, openrouter, llm, api, vendor-neutral, static-app, agent, no-backend]
compatible-with: [vanilla-js, react, vue, svelte, node, deno, edge-functions]
---

# ITEEK Router System (SKILL)

> **The ITEEK Router System** is a complete, portable pattern for wiring **any** build to
> **any** LLM through a single endpoint. It is built on **OpenRouter** as the underlying
> provider — no backend, no SDK, no lock-in. This is the exact pattern used in
> **Research OS**, generalized so you can reuse it in every future ITEEK agent and
> open-source system.
>
> Throughout this document, "the Router" = the ITEEK Router System; "OpenRouter" = the
> upstream API it calls.

---

## 1. What This Skill Does

Gives an app **one function** — `callLLM(messages, options)` — that can talk to Claude,
GPT, Gemini, DeepSeek, Llama, GLM, MiniMax, Kimi, and hundreds of other models by
changing a single `model` string. It adds the production concerns that a raw `fetch`
call skips:

- **Vendor neutrality** — swap models without changing code
- **Auto-routing** — pick a model based on task/depth/cost
- **Fallback chains** — auto-retry a different model when one is unavailable
- **Typed error handling** — map HTTP status → user-facing message + action
- **Browser-only key storage** — key lives in `localStorage`, never on a server
- **Cost tiers** — route bulk work to cheap models, voice-critical work to premium

---

## 2. When to Use This Skill

Activate when:

- Building a **static / serverless** web app that needs LLM calls
- You want to **avoid vendor lock-in** (start on Claude, switch to GPT later, free)
- You want **one billing account** across many model providers
- You need **graceful degradation** (fallback when a model is rate-limited/down)
- You're shipping **open source** and can't ship your own API keys

Don't use when:

- You need provider-only features not proxied by OpenRouter (some beta endpoints)
- You require server-side key secrecy for untrusted users → put the call behind your
  own backend proxy instead (see §11)
- You need fine-grained, provider-specific SDK ergonomics (tool-use schemas, etc.)

---

## 3. Core Concepts

OpenRouter exposes an **OpenAI-compatible** Chat Completions API. If you know the
OpenAI `/chat/completions` shape, you already know 90% of this.

| Concept | What it is |
|---|---|
| **Endpoint** | `https://openrouter.ai/api/v1/chat/completions` |
| **Auth** | `Authorization: Bearer <OPENROUTER_API_KEY>` |
| **Model ID** | `provider/model` string, e.g. `anthropic/claude-sonnet-4.6` |
| **Attribution** | Optional `HTTP-Referer` + `X-Title` headers (ranking + dashboards) |
| **Key check** | `GET https://openrouter.ai/api/v1/auth/key` validates a key + returns limits |

---

## 4. The Request Contract

### Endpoint
```
POST https://openrouter.ai/api/v1/chat/completions
```

### Headers
```json
{
  "Authorization": "Bearer sk-or-v1-...",
  "Content-Type": "application/json",
  "HTTP-Referer": "https://your-app.example",
  "X-Title": "Your App Name"
}
```

> `HTTP-Referer` and `X-Title` are optional but recommended — they identify your app on
> the OpenRouter leaderboard and in your usage dashboard. In the browser use
> `location.origin`.

### Body
```json
{
  "model": "anthropic/claude-sonnet-4.6",
  "messages": [
    { "role": "system", "content": "You are..." },
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": false
}
```

### Success response (shape you consume)
```json
{
  "model": "anthropic/claude-sonnet-4.6",
  "choices": [{ "message": { "role": "assistant", "content": "..." } }],
  "usage": { "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0 }
}
```

Consume it as: `data.choices?.[0]?.message?.content`.

---

## 5. Reference Implementation (drop-in, framework-agnostic)

Save as `openrouter.js`. Works in any ES module context (browser, Deno, Node 18+).

```js
// openrouter.js — vendor-neutral LLM access
// One function to rule them all: callLLM(messages, options)

export const OPENROUTER = {
  baseUrl: "https://openrouter.ai/api/v1/chat/completions",
  authUrl: "https://openrouter.ai/api/v1/auth/key",
  appTitle: "Your App Name",

  // Model registry — add/remove freely. `id` is the only value the API needs.
  models: {
    primary:    { label: "Claude Sonnet 4.6", id: "anthropic/claude-sonnet-4.6" },
    fast:       { label: "Claude Haiku 4.5",  id: "anthropic/claude-haiku-4.5" },
    premium:    { label: "Claude Opus 4.1",   id: "anthropic/claude-opus-4.1" },
    budget:     { label: "DeepSeek V3.2",     id: "deepseek/deepseek-v3.2" },
    variations: { label: "Llama 3.3 70B",     id: "meta-llama/llama-3.3-70b-instruct" },
  },

  // Ordered fallback chain (cheap/available → premium). Keys must exist in `models`.
  fallbacks: ["fast", "budget", "variations", "primary"],

  // Task → model routing. Extend for your own task types.
  route(task = "general") {
    const map = {
      "voice-critical": "primary",
      "bulk-drafts":    "fast",
      "high-volume":    "budget",
      "variation":      "variations",
      "premium":        "premium",
      "general":        "primary",
    };
    return map[task] || "primary";
  },
};

// Where the key lives. Browser: localStorage. Swap for env/secret store elsewhere.
function getApiKey() {
  if (typeof localStorage !== "undefined") return localStorage.getItem("openrouter_api_key");
  if (typeof process !== "undefined") return process.env.OPENROUTER_API_KEY;
  return null;
}

// Status → { message, retry?, action? }. Customize copy for your UI.
export const ERROR_MAP = {
  401:       { message: "Invalid API key. Check settings." },
  402:       { message: "Insufficient credits. Add funds at openrouter.ai." },
  403:       { message: "This model requires access or is region-locked." },
  404:       { message: "Model unavailable. Retrying a fallback…", retry: true },
  429:       { message: "Rate limited. Try again shortly or switch models." },
  500:       { message: "Provider error. Try again shortly.", retry: true },
  502:       { message: "Upstream gateway error. Retrying…", retry: true },
  network:   { message: "Connection failed. Check your internet." },
};

/**
 * The single entry point.
 * @param {Array<{role,content}>} messages  OpenAI-style message array
 * @param {object} options { modelKey, modelId, temperature, maxTokens, signal }
 * @returns {Promise<{success, content?, model?, usage?, status?, error?}>}
 */
export async function callLLM(messages, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, status: 401, error: "No API key set.", needsKey: true };
  }

  const modelId =
    options.modelId ||
    OPENROUTER.models[options.modelKey]?.id ||
    OPENROUTER.models.primary.id;

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": OPENROUTER.appTitle,
  };
  if (typeof location !== "undefined") headers["HTTP-Referer"] = location.origin;

  let res;
  try {
    res = await fetch(OPENROUTER.baseUrl, {
      method: "POST",
      headers,
      signal: options.signal,
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        stream: false,
      }),
    });
  } catch (err) {
    return { success: false, status: "network", error: err.message };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, status: res.status, error: body.error?.message || `Error ${res.status}` };
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { success: false, status: 500, error: "Empty response." };

  return { success: true, content, model: data.model, usage: data.usage };
}

/**
 * callLLM + automatic fallback across OPENROUTER.fallbacks on retryable errors.
 */
export async function callLLMWithFallback(messages, options = {}) {
  const first = options.modelKey || OPENROUTER.route(options.task);
  const chain = [first, ...OPENROUTER.fallbacks.filter((k) => k !== first)];

  let last;
  for (const modelKey of chain) {
    const result = await callLLM(messages, { ...options, modelKey });
    if (result.success) return { ...result, modelKey };
    last = result;
    const rule = ERROR_MAP[result.status];
    if (!rule?.retry) break; // non-retryable → stop immediately
  }
  return last;
}

/** Validate a key + read rate/credit limits. */
export async function testConnection() {
  const apiKey = getApiKey();
  if (!apiKey) return { success: false, message: "No API key set." };
  try {
    const res = await fetch(OPENROUTER.authUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) return { success: false, message: `Invalid API key (${res.status}).` };
    const data = await res.json();
    return { success: true, message: `Connected — ${data.data?.label || "active"}`, info: data.data };
  } catch (err) {
    return { success: false, message: `Connection failed: ${err.message}` };
  }
}
```

---

## 6. Depth / Cost Tiers (optional but recommended)

Bind token budget, temperature, and default model to a single "depth" selector. This is
how you keep costs predictable and let users trade speed for quality.

```js
export const DEPTH = {
  "Quick Scan":     { maxTokens: 800,  temperature: 0.5, modelKey: "fast" },
  "Standard":       { maxTokens: 1500, temperature: 0.6, modelKey: "primary" },
  "Deep Dive":      { maxTokens: 3000, temperature: 0.7, modelKey: "primary" },
  "Comprehensive":  { maxTokens: 6000, temperature: 0.7, modelKey: "premium" },
};

// Usage:
const d = DEPTH[selectedDepth] || DEPTH["Standard"];
const result = await callLLM(messages, {
  modelKey: d.modelKey, maxTokens: d.maxTokens, temperature: d.temperature,
});
```

Add **format instructions** the same way (append to the system prompt):

```js
export const FORMATS = {
  Summary: "Format as a concise executive summary.",
  Report: "Format as a structured report with headings.",
  Bullets: "Format as organized bullet points.",
  Table: "Use markdown tables where appropriate.",
};
```

---

## 7. System Prompt Composition

Build the system prompt from layers so agents stay composable:

```js
function buildSystemPrompt({ globalPrompt, agentPrompt, format }) {
  return [globalPrompt, agentPrompt, FORMATS[format]]
    .filter(Boolean)
    .join("\n\n");
}

const messages = [
  { role: "system", content: buildSystemPrompt({ globalPrompt, agentPrompt, format }) },
  ...conversationHistory, // [{role:'user'|'assistant', content}]
];
```

This is exactly how multiple agents share one transport: each agent is just a different
`agentPrompt` + `modelKey`, calling the same `callLLM`.

---

## 8. Multimodal / Attachments

OpenRouter accepts OpenAI-style content arrays for models that support vision. Convert
a plain message into API form only when images/files are present:

```js
function messageToAPI(msg) {
  if (!msg.images?.length && !msg.files?.length) {
    return { role: msg.role, content: msg.content };
  }
  const parts = [];
  if (msg.content) parts.push({ type: "text", content: msg.content });
  for (const img of msg.images || []) {
    parts.push({ type: "image_url", image_url: { url: img.dataUrl } }); // base64 or URL
  }
  for (const f of msg.files || []) {
    parts.push({ type: "text", content: `\n\n--- ${f.name} ---\n${f.text.slice(0, 40000)}` });
  }
  return { role: msg.role, content: parts };
}
```

> Guardrails that worked well in production: cap at **20 files**, **512 KB each**, and
> slice pasted text to **~40 K chars** so you don't blow the context window or bill.

---

## 9. Streaming (optional)

For token-by-token UI, set `stream: true` and read the SSE body:

```js
async function streamLLM(messages, { modelId, headers, onToken }) {
  const res = await fetch(OPENROUTER.baseUrl, {
    method: "POST", headers,
    body: JSON.stringify({ model: modelId, messages, stream: true }),
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep the last, possibly-partial frame
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (delta) onToken(delta); // append to UI
      } catch { /* ignore keep-alive / partial frames */ }
    }
  }
}
```

---

## 10. Error Handling Pattern

Never surface a raw stack trace. Map status → friendly message + optional action:

```js
function handleError(result, ui) {
  const rule = ERROR_MAP[result.status] || { message: result.error || "Request failed." };
  ui.toast(rule.message, "error");
  if (result.status === 401) ui.openSettings(); // prompt for a key
}
```

The retryable statuses (`404`, `500`, `502`) are already honored by
`callLLMWithFallback` in §5.

---

## 11. Security Model

| Concern | Guidance |
|---|---|
| **Key storage** | `localStorage` is fine for **single-user / bring-your-own-key** apps. The key never leaves the browser except to OpenRouter over HTTPS. |
| **Shared devices** | Don't persist the key; prompt each session. |
| **Untrusted users / public keys** | Do **not** ship your own key to the browser. Put `callLLM` behind a tiny backend proxy (edge function) that injects the key server-side and rate-limits per user. The client code stays identical — only `baseUrl` changes to your proxy. |
| **Spend caps** | Set hard credit limits in the OpenRouter dashboard. Route bulk work to cheap models (§6). |
| **Prompt injection** | Treat model output and any fetched/pasted content as untrusted; sanitize before rendering (escape HTML). |

Backend-proxy variant (only the URL and key source change):

```js
// client stays the same; point baseUrl at your function:
OPENROUTER.baseUrl = "/api/llm"; // your edge function forwards to OpenRouter with a server key
```

---

## 12. Adapting This to a New Agent (checklist)

1. Copy `openrouter.js` into the project.
2. Set `OPENROUTER.appTitle` to your app name.
3. Edit `OPENROUTER.models` — keep only the models you want; IDs from
   [openrouter.ai/models](https://openrouter.ai/models).
4. Define each agent as `{ prompt, modelKey }` and pass into `buildSystemPrompt`.
5. (Optional) Add `DEPTH` / `FORMATS` selectors for cost/quality control.
6. Wire a Settings UI: an input that writes `localStorage.openrouter_api_key`, plus a
   "Test Connection" button calling `testConnection()`.
7. Call `callLLMWithFallback(messages, { task })` from your send handler.
8. Map errors through `ERROR_MAP`.

That's a complete, swappable LLM backend for any agent — in one file.

---

## 13. Cost Reference (approximate, verify live)

| Model | ~Input / Output per 1M tokens | Use for |
|---|---|---|
| Claude Opus 4.1 | $15 / $75 | Hero content, hardest reasoning |
| Claude Sonnet 4.6 | $3 / $15 | Voice-critical, default quality |
| Claude Haiku 4.5 | $0.80 / $4 | Fast bulk drafts |
| Llama 3.3 70B | $0.59 / $0.79 | Open-source general tasks |
| DeepSeek V3.2 | $0.07 / $0.28 | High-volume cheap drafts |

> Prices change — treat this as a routing heuristic, not a contract. Always confirm at
> [openrouter.ai/models](https://openrouter.ai/models).

---

## 14. Gotchas Learned in Production

- **Model IDs drift.** Providers rename/deprecate. Keep IDs in one registry (`OPENROUTER.models`) so a rename is a one-line fix. A `404` means "bad/absent model id" more often than "outage" — the fallback chain covers it.
- **Empty `choices`.** Some providers return `200` with no content on a safety refusal. Treat empty content as an error (§5 does this).
- **CORS is fine from the browser** — OpenRouter allows direct browser calls, which is what makes the no-backend pattern possible.
- **`max_tokens` is a cap, not a target.** Set per depth tier to bound cost.
- **Attribution headers** improve nothing functionally but help you read your own usage dashboard — set `X-Title` per app.

---

**END OF SKILL**
