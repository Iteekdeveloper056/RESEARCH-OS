# ITEEK Router System — Implementation Guide

> A short, practical guide to implementing the **ITEEK Router System** in any build,
> using **Research OS** as the reference. The Router is the vendor-neutral LLM layer
> (built on OpenRouter) documented in
> [`skills/iteek-router-system/SKILL.md`](../skills/iteek-router-system/SKILL.md).
>
> This guide's priority: **submitting the API request safely.**

---

## 1. What You're Implementing

One function — `callLLM(messages, options)` — that any screen calls to reach any model
through a single endpoint, with routing, fallback, and typed errors. The full reference
module lives in the SKILL. This guide is the "how to wire it up + keep it safe" companion.

In Research OS the equivalent live code is `callAPI()` in `research-os/index.html`
(POST to `https://openrouter.ai/api/v1/chat/completions`).

---

## 2. Implementation in 6 Steps

### Step 1 — Add the Router module
Copy the reference `openrouter.js` from the SKILL (§5) into your project, or reuse the
inline `callAPI()` pattern already in `research-os/index.html`. Set the app title:

```js
OPENROUTER.appTitle = "Research OS"; // shows in your OpenRouter dashboard
```

### Step 2 — Define your models + routing
Trim `OPENROUTER.models` to what you actually use, and set a fallback chain. Research OS
uses depth-based routing (`Quick Scan → Comprehensive`) mapped to models.

### Step 3 — Collect the key (never hard-code it)
Provide a Settings/login field that writes the key to `localStorage` only:

```js
localStorage.setItem('openrouter_api_key', key.trim());
```

### Step 4 — Build messages
`[{role:'system', content: buildPrompt(agent)}, ...history]`. Keep injected context
bounded (see the Self-Learning doc) to control tokens/cost.

### Step 5 — Submit safely
Call the Router. **All safety rules in §3 apply here.**

### Step 6 — Handle the result + errors
Map status → friendly message; auto-retry the fallback chain on retryable errors
(404/500/502). Never surface a raw stack trace or the key.

---

## 3. Safe API Submission (the important part)

### 3.1 Key handling
- **Store client-side only.** Key lives in `localStorage` (`openrouter_api_key`). It is
  sent **only** to OpenRouter over HTTPS, never to your own server or logs.
- **Never hard-code** a key in source, and never commit one. `.env`/secrets for any
  server variant; `localStorage` for the browser.
- **Never render the key.** Use `type="password"` inputs; never echo it in the DOM,
  toasts, or `console.log`.
- **Redact on error.** When showing API errors, print `error.message` only — never the
  request headers (which contain the bearer token).

```js
// GOOD — token only in the header, never logged
const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'X-Title': OPENROUTER.appTitle,
};
if (typeof location !== 'undefined') headers['HTTP-Referer'] = location.origin;
// BAD — console.log(headers)  ❌ leaks the key
```

### 3.2 Transport
- **HTTPS only.** The endpoint is `https://…`; never downgrade to `http`.
- **No proxies you don't control.** Point `baseUrl` only at OpenRouter or your own
  trusted edge function.

### 3.3 Validate before you send
- **Require a key** — if missing, stop and open Settings (don't fire a keyless request).
- **Trim + sanity-check** the key (`sk-or-` prefix is a good soft check).
- **Bound the payload** — cap history length, injected facts, and attached text
  (Research OS caps: 20 files, 512 KB each, ~40 K chars pasted) so you can't accidentally
  send a huge, expensive request.

```js
const apiKey = localStorage.getItem('openrouter_api_key');
if (!apiKey) { openSettings(); return; }          // never submit without a key
if (messages.length > MAX_TURNS) messages = trim(messages);
```

### 3.4 Control cost at submit time
- Set **`max_tokens`** per depth tier (cap, not target).
- Route **bulk** work to cheap models, **voice/quality-critical** to premium (SKILL §6).
- Set a **hard credit ceiling** in the OpenRouter dashboard as a backstop.

### 3.5 Fail safely
- **Typed errors → friendly copy** via an error map (401/402/429/404/500/network).
- **Auto-fallback** only on retryable statuses; stop immediately on 401/402/403.
- **Timeouts/cancellation:** pass an `AbortController` `signal` so a user can cancel and
  you don't hang a request.

```js
const ctrl = new AbortController();
const result = await callLLM(messages, { modelKey, signal: ctrl.signal });
// ctrl.abort() on user cancel / navigation
```

### 3.6 Treat all model output + user content as untrusted
- **Escape before rendering** (Research OS uses an `esc()` helper). Never inject raw model
  text as HTML.
- **Don't execute** returned code/links automatically.

---

## 4. Safe-Submission Checklist

Copy this into any build review:

- [ ] Key stored in `localStorage`/secret store — **never hard-coded or committed**
- [ ] Key sent **only** to OpenRouter (or your own trusted proxy), over **HTTPS**
- [ ] Key **never logged, rendered, or included** in error output
- [ ] Request **blocked if no key** (opens Settings instead)
- [ ] `max_tokens` + payload caps set (history, attachments, injected context)
- [ ] Hard **credit ceiling** set in the OpenRouter dashboard
- [ ] Errors mapped to friendly messages; **fallback only on retryable** statuses
- [ ] `AbortController` wired for cancel/timeout
- [ ] All model output + user content **escaped** before rendering
- [ ] "Clear all data" wipes the key + local state

---

## 5. Public / Multi-User Builds (when localStorage isn't enough)

`localStorage` is correct for **single-user, bring-your-own-key** apps like Research OS.
If you ever serve **untrusted users with a shared key**, do **not** ship the key to the
browser. Instead:

1. Add a tiny **edge function / backend proxy** that stores the key server-side.
2. Point the Router at it: `OPENROUTER.baseUrl = '/api/llm'`.
3. The proxy injects the bearer token, enforces **per-user rate limits + spend caps**,
   and forwards to OpenRouter.

The client code is unchanged — only `baseUrl` and the key source move server-side.

---

## 6. Where This Lives in Research OS

| Concern | Reference |
|---|---|
| Submit request | `callAPI()` in `research-os/index.html` |
| Key storage | `openrouter_api_key` in `localStorage` |
| Routing / depth | `MODELS`, `DEPTH`, `resolveModel()` |
| Fallback | `retryFallback()` + `FALLBACKS` |
| Errors | `errorHandlers` + `showError()` |
| Full pattern | [`skills/iteek-router-system/SKILL.md`](../skills/iteek-router-system/SKILL.md) |

---

**In one line:** implement the Router by copying its module, collecting the key into
`localStorage`, and submitting through `callLLM` — with the key never logged/rendered,
HTTPS only, payload + `max_tokens` capped, retryable-only fallback, and all output
escaped.
