---
name: iteek-learn-system
title: ITEEK LEARN.MD SYSTEM
description: Complete portable self-learning system — submit this one file to any build or new Project/Agent. Fill the Submission Block, wire the 4-layer memory, and the build gains a local, consent-based system that improves every week. Includes Research OS reference instance, UX, rollout, and success criteria. No backend.
version: 1.1
author: ITEEK AI Solutions
created: 2026-07-07
license: MIT
pairs-with: skills/iteek-router-system/SKILL.md
tags: [iteek-learn, self-learning, memory, personalization, static-app, no-backend, portable, agent-spec]
compatible-with: [vanilla-js, react, vue, svelte, node, deno, edge-functions]
---

# ITEEK LEARN.MD SYSTEM

> **Submit this file to create a Project/Agent with the same self-learning goal.**
> Fill the **Submission Block** (§1) for the new business, wire the 4-layer memory as
> described, and the build stops starting from zero each time — it remembers, reuses, and
> reviews itself locally, with no backend.
>
> **LEARN** = memory + improvement. Pairs with the **ITEEK Router System** (LLM access).
> Together they make a build that gets smarter and stays cheap.
>
> Research OS is the first reference instance (§11). Every other business reuses §1–§10.

---

## 1. Submission Block (fill this per business / Project / Agent)

> This is the **only part you change** to reuse the system for a new build.

```yaml
# ── ITEEK LEARN — SUBMISSION ──
business_name:   "<e.g. Research OS | Holistic Wellness Co>"
operator:        "<who runs it>"
goal:            "<the one outcome the system should keep improving toward>"
domain:          "<business | research | wellness | content | support | sales | ...>"
storage_key:     "<app>_memory        # localStorage namespace, e.g. ros_memory"
success_metric:  "<how you'll know it's learning, e.g. higher 👍 rate, fewer re-asks>"
fact_cap:        40                    # max long-term facts kept
inject_cap:      12                    # max facts injected per LLM call (cost control)
review_cadence:  "weekly + monthly"    # rollup schedule
consent_mode:    "explicit"            # only user-confirmed items become long-term facts
```

Everything below is **reusable as-is** — it reads these parameters.

---

## 2. What It Does

Today most apps run **one-shot** interactions: ask → answer → forget. The next session
starts from zero.

The ITEEK LEARN.MD SYSTEM adds a lightweight **memory layer** on top of existing
`localStorage` state so any build:

1. **Remembers** durable facts, learned preferences, and per-response feedback.
2. **Reuses** that memory to improve future prompts and preselect the right defaults.
3. **Reviews** itself on a cadence (weekly/monthly) to promote patterns and prune noise.

All local, consent-based, and bounded — no server, no database, no build step, no data
leaving the device except what you already send to the LLM via the ITEEK Router System.

---

## 3. The 4 Memory Layers

Four layers, all JSON under `<storage_key>`, each with a clear job:

```
<storage_key>
├── facts        # durable, reusable knowledge (user-confirmed only)
├── preferences  # learned defaults (favorite mode/agent/model/format)
├── signals      # per-response feedback (👍/👎, saved, exported, edited)
└── reviews      # periodic rollups (weekly patterns, monthly insights)
```

| Layer | Job | Fuel |
|---|---|---|
| **Facts** | Long-term knowledge injected into prompts | Explicit "Save as fact" |
| **Preferences** | Preselect the right defaults | Usage frequency |
| **Signals** | Raw learning signal | 👍/👎, save, export, edit, regenerate |
| **Reviews** | Turn signals into insight | Cadence rollups |

### Layer detail

**Facts** — Short, reusable statements the user confirms once.
- Captured via **"Save as fact"** on any answer (no silent scraping).
- Injected as a compact "Known context" block in the system prompt.
- Capped at `fact_cap`; editable in a Memory panel.

**Preferences** — Derived from usage, not asked.
- Most-used mode/agent/depth/format/model → become new defaults.
- Example: "You usually pick Deep Dive for Competition Analysis" → preselect it.

**Signals** — Cheap feedback on each response.
- 👍 / 👎, Saved, Exported, Copied, or heavy edit/regenerate.
- Shape: `{ id, refId, tag?, model, rating: 1|-1, kind, ts }`.

**Reviews** — Self-improvement loop on `review_cadence`.
- **Weekly:** top modes/agents, avg rating per model, most-saved topics.
- **Monthly:** promote recurring themes to Facts; prune stale facts.
- Surface as a "What it learned" digest.

---

## 4. Data Model (drop-in)

```js
const memory = {
  facts: [
    // { id, text, tag?, source: 'user', ts }
  ],
  preferences: {
    // mode, agent, depth, format, model — derived + manual override flag
  },
  signals: [
    // { id, refId, tag?, model, rating: 1|-1, kind:'save'|'export'|'rate'|'edit', ts }
  ],
  reviews: [
    // { period:'2026-W28', topModes:[], scores:{}, promoted:[], ts }
  ],
  version: 1
};

// namespaced by Submission Block storage_key
const STORAGE_KEY = '<app>_memory'; // e.g. ros_memory

function saveMemory(state) {
  if (state.autoSave) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.memory));
}
function loadMemory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
  catch { return null; }
}
```

Persist alongside your existing app state, gated by the same `autoSave` flag.

---

## 5. The Learning Loop

```
        ┌──────────────┐
        │  Use          │  user interacts; Router answers (existing flow)
        └──────┬───────┘
               │ capture cheap signals (👍/👎, saved, edited)
               ▼
        ┌──────────────┐
        │  Signals      │  <storage_key>.signals[]
        └──────┬───────┘
               │ weekly/monthly rollup
               ▼
        ┌──────────────┐
        │  Reviews      │  patterns → promote to Facts / update Preferences
        └──────┬───────┘
               │ inject into prompt builder + preselect defaults
               ▼
        ┌──────────────┐
        │  Better next  │  more context, fewer repeats, right defaults
        │  use          │
        └──────────────┘
```

The only step that touches the LLM is **bounded prompt injection** (§6). Everything else
is local bookkeeping.

---

## 6. Prompt Injection (bounded = safe + cheap)

```js
function buildLearnedContext(memory, tag) {
  const facts = (memory.facts || [])
    .filter(f => !f.tag || f.tag === tag)
    .slice(0, INJECT_CAP)                 // from Submission Block → bounds cost
    .map(f => `- ${f.text}`).join('\n');
  return facts
    ? `Known context about this operator (reuse, don't re-ask):\n${facts}`
    : '';
}

// prepend to your existing system prompt builder:
const learned = buildLearnedContext(state.memory, currentTag);
if (learned) parts.unshift(learned);
```

> `inject_cap` bounds how many extra tokens each call carries — this is the cost governor.
> Never inject unbounded history or silent chat scraping.

---

## 7. UX Additions (small, non-intrusive)

| Element | Purpose |
|---|---|
| 👍 / 👎 on each answer | Feed `signals` |
| "Save as fact" button | Promote an answer/snippet to `facts` |
| **Memory panel** | View/edit facts, see preferences, clear memory |
| "What it learned" digest | Show weekly/monthly review output |
| Reset learning | One click to wipe `<storage_key>` only |

Keep signals **passive** where possible (save/export already happen) so users don't have
to rate everything.

---

## 8. Applying to a New Business / Project / Agent

1. **Copy** this file into the new build (or submit it when creating the Agent).
2. **Fill** the Submission Block (§1) — name, goal, `storage_key`, caps, metric.
3. **Add** `state.memory` + `save/loadMemory()` using your `storage_key`.
4. **Capture signals** — 👍/👎 + reuse existing save/export actions.
5. **Inject** `buildLearnedContext()` into your prompt builder.
6. **Schedule reviews** — weekly/monthly rollups; promote patterns to facts.
7. **Add a Memory panel** — view/edit facts, reset learning.

Result: the new build pursues its own `goal` and improves toward its own
`success_metric`, using the same proven pattern.

---

## 9. Privacy & Safety (always on)

- **Local only** — memory lives in `localStorage`; nothing new leaves the device.
- **Consent-based** — only user-confirmed items become long-term `facts` (`consent_mode: explicit`).
- **Bounded** — `fact_cap` + `inject_cap` prevent runaway size and token cost.
- **Erasable** — "Reset learning" wipes `<storage_key>`; "Clear all data" removes everything.
- **Untrusted input** — treat memory as user text: inject as plain context, escape all rendered output.

---

## 10. Rollout Order (each step shippable)

1. **Signals only** — add 👍/👎 + capture save/export. No prompt change. (Pure data.)
2. **Preferences** — derive + preselect defaults from usage.
3. **Facts + injection** — "Save as fact" + `buildLearnedContext()`.
4. **Reviews** — weekly/monthly rollups + "What it learned" digest.
5. **Memory panel** — full view/edit/reset UI.

Each phase is independently useful and reversible.

---

## 11. Success Criteria

- Users **re-ask less** (facts reused across sessions).
- **Higher 👍 rate** and more saved/exported answers over time.
- **Right mode/agent/model preselected** for common tasks.
- **Zero** new network calls or off-device storage.
- Measurable progress toward the Submission Block `success_metric`.

---

## 12. Reference Instance — Research OS

> First deployment of this system. Use as a worked example when wiring a new Project/Agent.

### Submission Block (filled)

```yaml
business_name:   "Research OS"
operator:        "<logged-in user>"
goal:            "Deliver better research with less repetition across sessions"
domain:          "research"
storage_key:     "ros_memory"
success_metric:  "Higher 👍 rate; fewer re-asks; right agent/model preselected"
fact_cap:        40
inject_cap:      12
review_cadence:  "weekly + monthly"
consent_mode:    "explicit"
```

### What exists today (foundation to build on)

| Piece | Where (`research-os/index.html`) | Reuse for learning |
|---|---|---|
| `state` (user, apiKey, model, projects) | global `state` | Add `state.memory` slice |
| `localStorage` keys | `SK`: `ros_session`, `ros_data`, `ros_model` | Add `ros_memory` |
| Projects → Chats → Messages | `saveData()` / `loadData()` | Source for signals |
| Agents + model router | `AGENTS`, `MODELS`, `FALLBACKS` | Per-agent preferences |
| System prompt | `buildPrompt(agent)` | Inject `buildLearnedContext()` |

The self-learning layer **wraps** these — it does not replace them.

### Research OS prompt injection (concrete)

```js
function buildLearnedContext(memory, agent) {
  const facts = (memory.facts || [])
    .filter(f => !f.agent || f.agent === agent)
    .slice(0, 12)
    .map(f => `- ${f.text}`).join('\n');
  return facts
    ? `Known context about this operator (reuse, don't re-ask):\n${facts}`
    : '';
}

// inside buildPrompt(agent):
const learned = buildLearnedContext(state.memory, agent);
if (learned) parts.unshift(learned);
```

### Research OS UX targets

| Element | Location | Purpose |
|---|---|---|
| 👍 / 👎 | Each assistant message | Feed `ros_memory.signals` |
| "Save as fact" | Message toolbar | Promote to `ros_memory.facts` |
| Memory panel | Screen 3 tab | View/edit facts, preferences, reset |
| "What it learned" | Digest modal | Weekly/monthly review output |

---

## 13. Related Systems

| System | Role | Location |
|---|---|---|
| **ITEEK Router System** | LLM access (pair with LEARN) | `skills/iteek-router-system/SKILL.md` |
| **Router implementation guide** | Safe API submission | `docs/ITEEK_ROUTER_IMPLEMENTATION.md` |
| **ITEEK LEARN Builder** | Separate Project/Agent that interviews + generates LEARN files | `docs/ITEEK_LEARN_BUILDER_PROJECT.md` |
| **Research OS** | Live research app (separate product; uses Router) | `research-os/index.html` |

---

**In one line:** fill the Submission Block, submit this MD to any Project/Agent, wire the
4 local memory layers + bounded injection — and that build gets a consent-based,
self-improving system with no backend and no privacy trade-off.
