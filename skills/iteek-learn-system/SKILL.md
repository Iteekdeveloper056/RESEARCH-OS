---
name: iteek-learn-system
title: ITEEK LEARN.MD SYSTEM
description: A portable, drop-in self-learning layer for any app or business build. Submit this one MD, fill the submission block, and the build gains a local, consent-based memory that improves every week — no backend. First deployed in Research OS.
version: 1.0
author: ITEEK AI Solutions
created: 2026-07-07
license: MIT
pairs-with: skills/iteek-router-system/SKILL.md
tags: [iteek-learn, self-learning, memory, personalization, static-app, no-backend, portable]
compatible-with: [vanilla-js, react, vue, svelte, node, deno, edge-functions]
---

# ITEEK LEARN.MD SYSTEM

> **Submit this file to give any build the same self-learning goal.** Fill in the
> **Submission Block** (§1) for the new business, drop the file into the project, and wire
> the 4-layer memory as described. The system is business-agnostic — Research OS is just
> the first instance.
>
> Pairs with the **ITEEK Router System** (the LLM layer). LEARN = memory + improvement;
> Router = model access. Together they make a build that gets smarter and stays cheap.

---

## 1. Submission Block (fill this per business)

> This is the only part you change to reuse the system for a new business/goal.

```yaml
# ── ITEEK LEARN — SUBMISSION ──
business_name:   "<e.g. Research OS>"
operator:        "<who runs it>"
goal:            "<the one outcome the system should keep improving toward>"
domain:          "<business | research | content | support | sales | ...>"
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

Adds a **memory layer** so a build stops starting from zero each time. It:

1. **Remembers** durable facts, learned preferences, and per-answer feedback.
2. **Reuses** them to improve future prompts and preselect the right defaults.
3. **Reviews** itself on a cadence to promote patterns and prune noise.

All local (`localStorage`), consent-based, and bounded so it never leaks data or blows
token cost.

---

## 3. The 4 Memory Layers (the reusable core)

```
<storage_key>
├── facts        # durable, reusable knowledge (user-confirmed only)
├── preferences  # learned defaults (favorite mode/model/format)
├── signals      # per-response feedback (👍/👎, saved, exported, edited)
└── reviews      # periodic rollups (weekly patterns, monthly insights)
```

| Layer | Job | Fuel |
|---|---|---|
| **Facts** | Long-term knowledge injected into prompts | Explicit "Save as fact" |
| **Preferences** | Preselect the right defaults | Usage frequency |
| **Signals** | Raw learning signal | 👍/👎, save, export, edit |
| **Reviews** | Turn signals into insight | Cadence rollups |

---

## 4. Data Model (drop-in)

```js
const memory = {
  facts:       [], // { id, text, tag?, source:'user', ts }
  preferences: {}, // derived defaults + manual override flag
  signals:     [], // { id, refId, mode, model, rating:1|-1, kind, ts }
  reviews:     [], // { period, topModes:[], scores:{}, promoted:[], ts }
  version: 1
};

// namespaced by the Submission Block's storage_key
function saveMemory(state){ if(state.autoSave) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.memory)); }
function loadMemory(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null } }
```

---

## 5. The Learning Loop

```
Use → capture Signals → weekly/monthly Reviews → promote to Facts / update Preferences
    → inject bounded context + preselect defaults → better next use
```

The only step that touches the LLM is **bounded prompt injection** (§6). Everything else
is local bookkeeping.

---

## 6. Prompt Injection (bounded = safe + cheap)

```js
function buildLearnedContext(memory, tag){
  const facts = (memory.facts||[])
    .filter(f => !f.tag || f.tag === tag)
    .slice(0, INJECT_CAP)                 // from Submission Block → bounds cost
    .map(f => `- ${f.text}`).join('\n');
  return facts ? `Known context (reuse, don't re-ask):\n${facts}` : '';
}
// prepend the result to your existing system prompt builder
```

> `INJECT_CAP` bounds how many extra tokens each call carries — this is the cost governor.

---

## 7. Applying It to a New Business (the "submit" flow)

1. **Copy** this file into the new build.
2. **Fill** the Submission Block (§1) — name, goal, `storage_key`, caps, metric.
3. **Add** the memory slice + `save/loadMemory()` using your `storage_key`.
4. **Capture signals** — 👍/👎 + reuse existing save/export actions.
5. **Inject** `buildLearnedContext()` into your prompt builder.
6. **Schedule reviews** — weekly/monthly rollups; promote patterns to facts.
7. **Add a Memory panel** — view/edit facts, reset learning.

Result: the new business build now pursues its own `goal` and improves toward its own
`success_metric`, using the same proven pattern.

---

## 8. Privacy & Safety (always on)

- **Local only** — memory lives in `localStorage`; nothing new leaves the device.
- **Consent-based** — only user-confirmed items become long-term `facts` (`consent_mode: explicit`).
- **Bounded** — `fact_cap` + `inject_cap` prevent runaway size and cost.
- **Erasable** — "Reset learning" wipes `<storage_key>`; existing "Clear all data" removes everything.
- **Untrusted input** — treat memory as user text: inject as plain context, escape all rendered output.

---

## 9. Rollout Order (each step shippable)

1. Signals only (pure data, no prompt change)
2. Preferences (preselect defaults)
3. Facts + injection
4. Reviews (rollups + "what it learned" digest)
5. Memory panel (view/edit/reset)

---

## 10. Reference Instance

- **Research OS** implements this system — see
  [`docs/RESEARCH_OS_SELF_LEARNING.md`](../../docs/RESEARCH_OS_SELF_LEARNING.md)
  (`storage_key: ros_memory`).
- Pairs with [`skills/iteek-router-system/SKILL.md`](../iteek-router-system/SKILL.md).

---

**In one line:** fill the Submission Block, drop this MD into any build, wire the 4 local
memory layers + bounded injection — and that business gets the same consent-based,
self-improving system, with no backend and no privacy trade-off.
