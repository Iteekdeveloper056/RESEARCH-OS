# Research OS — Self-Learning System (Outline & Best Setup)

> Scope: **Research OS only** (`research-os/index.html`). This is a design outline for
> turning the current stateless research dashboard into a system that **learns from every
> research session** and gets more useful over time — while staying a static, no-backend,
> browser-only app.
>
> **This is the Research OS instance of the portable
> [ITEEK LEARN.MD SYSTEM](../skills/iteek-learn-system/SKILL.md)**
> (`storage_key: ros_memory`). To create the same self-learning goal for another business,
> submit that system file with its Submission Block filled in — no need to rewrite this
> design.

---

## 1. Summary

Today Research OS runs **one-shot** research: you pick an agent + model, ask a question,
get an answer, and it's stored as chat history. It does **not** learn — the next query
starts from zero.

A **Self-Learning System** adds a lightweight **memory layer** on top of the existing
`localStorage` state so the app:

1. **Remembers** what was researched, which answers were useful, and your preferences.
2. **Reuses** that memory to improve future prompts (better context, less repetition).
3. **Reviews** itself on a cadence (weekly/monthly) to surface patterns and prune noise.

All of this fits the current architecture — no server, no database, no build step.

---

## 2. What Already Exists (foundation to build on)

Grounded in the live code:

| Piece | Where | Reuse for learning |
|---|---|---|
| `state` (user, apiKey, model, projects) | `research-os/index.html` | Add a `memory` slice |
| `localStorage` keys `ros_data`, `ros_session`, `ros_model` | `SK` object | Add `ros_memory` |
| Projects → Chats → Messages | `saveData()` / `loadData()` | Source signal for learning |
| Agents + model router + fallbacks | `AGENTS`, `MODELS`, `FALLBACKS` | Personalize per-agent defaults |
| System prompt composition | `buildPrompt(agent)` | Inject learned context |

The self-learning layer **wraps** these — it does not replace them.

---

## 3. Best Setup — The 4 Memory Layers

Keep it simple. Four layers, all JSON in `localStorage`, each with a clear job.

```
ros_memory
├── facts        # durable, reusable knowledge ("our ICP is X", "prefer tables")
├── preferences  # learned UI/behaviour defaults (favorite agent, depth, format, model)
├── signals      # per-response feedback (👍/👎, saved, exported, edited)
└── reviews      # periodic rollups (weekly patterns, monthly insights)
```

### Layer 1 — Facts (long-term knowledge)
Short, reusable statements the user confirms once and wants applied to future research.
- Captured via an explicit **"Save as fact"** action on any answer (no silent scraping).
- Injected into the system prompt as a compact "Known context" block.
- Capped (e.g. 40 facts) and editable in a Memory panel.

### Layer 2 — Preferences (behavioural defaults)
Derived from usage, not asked:
- Most-used **agent**, **depth**, **format**, **model** → become the new defaults.
- "You usually pick Deep Dive for Competition Analysis" → preselect it.

### Layer 3 — Signals (feedback per response)
The raw learning fuel. On each assistant message, capture cheap signals:
- 👍 / 👎, "Saved", "Exported", "Copied", or heavy edit/regenerate.
- Each signal is `{chatId, msgId, agent, model, depth, rating, ts}`.

### Layer 4 — Reviews (self-improvement loop)
On a cadence, roll signals up into insights:
- **Weekly:** top agents, avg rating per model, most-saved topics.
- **Monthly:** promote recurring themes to Facts; demote/prune stale facts.
- Surface as a small "What Research OS learned" digest.

---

## 4. The Learning Loop (how it improves each cycle)

```
        ┌──────────────┐
        │  Research     │  user asks; Router answers (existing flow)
        └──────┬───────┘
               │ capture cheap signals (👍/👎, saved, edited)
               ▼
        ┌──────────────┐
        │  Signals      │  ros_memory.signals[]
        └──────┬───────┘
               │ weekly/monthly rollup
               ▼
        ┌──────────────┐
        │  Reviews      │  patterns → promote to Facts / update Preferences
        └──────┬───────┘
               │ inject into buildPrompt() + preselect defaults
               ▼
        ┌──────────────┐
        │  Better next  │  more context, fewer repeats, right model by default
        │  research     │
        └──────────────┘
```

The only new API-affecting step is **prompt injection** in `buildPrompt()` — everything
else is local bookkeeping.

---

## 5. Minimal Data Model

```js
// New localStorage key: ros_memory
const memory = {
  facts: [
    // { id, text, agent?, source: 'user', ts }
  ],
  preferences: {
    // agent, depth, format, model — derived, with a manual override flag
  },
  signals: [
    // { id, chatId, msgId, agent, model, depth, rating: 1|-1, kind:'save'|'export'|'rate'|'edit', ts }
  ],
  reviews: [
    // { period:'2026-W28', topAgents:[], modelScores:{}, promotedFacts:[], ts }
  ],
  version: 1
};
```

Persist alongside existing state (same `autoSave` gate):

```js
const SK = { session:'ros_session', data:'ros_data', model:'ros_model', memory:'ros_memory' };
function saveMemory(){ if(state.autoSave) localStorage.setItem(SK.memory, JSON.stringify(state.memory)); }
function loadMemory(){ try { return JSON.parse(localStorage.getItem(SK.memory)) || null } catch { return null } }
```

---

## 6. Prompt Injection (the one place it touches the LLM)

Extend the existing `buildPrompt(agent)` to prepend learned context — kept short and
bounded so it never blows the token budget:

```js
function buildLearnedContext(memory, agent){
  const facts = (memory.facts||[])
    .filter(f => !f.agent || f.agent === agent)
    .slice(0, 12)                       // hard cap → predictable cost
    .map(f => `- ${f.text}`).join('\n');
  return facts ? `Known context about this operator (reuse, don't re-ask):\n${facts}` : '';
}

// inside buildPrompt(agent), before returning:
const learned = buildLearnedContext(state.memory, agent);
if (learned) parts.unshift(learned);
```

> Cost control: the cap (e.g. 12 facts) bounds how many extra tokens each call carries.

---

## 7. UX Additions (small, non-intrusive)

| Element | Purpose |
|---|---|
| 👍 / 👎 on each answer | Feed `signals` |
| "Save as fact" button | Promote an answer/snippet to `facts` |
| **Memory panel** (Screen 3 tab) | View/edit facts, see preferences, clear memory |
| "What it learned" digest | Show weekly/monthly review output |
| Reset learning | One click to wipe `ros_memory` only |

Keep signals **passive** where possible (save/export already happen) so users don't have
to rate everything.

---

## 8. Privacy & Safety (non-negotiable for this design)

- **Local only.** Memory lives in `localStorage`; nothing new is sent to any server.
- **Consent-based facts.** Only user-confirmed items enter long-term `facts` — no silent
  profiling of chat content.
- **Bounded injection.** Caps on facts + length prevent runaway prompt size (and cost).
- **Easy erasure.** "Reset learning" and existing "Clear all data" fully remove it.
- **Treat memory as untrusted input** when injecting: it's user text, so keep it in the
  system prompt as plain context, and continue escaping all rendered output.

---

## 9. Rollout Order (incremental, each step shippable)

1. **Signals only** — add 👍/👎 + capture save/export. No prompt change. (Pure data.)
2. **Preferences** — derive + preselect defaults from usage.
3. **Facts + injection** — "Save as fact" + `buildLearnedContext()`.
4. **Reviews** — weekly/monthly rollups + "What it learned" digest.
5. **Memory panel** — full view/edit/reset UI.

Each phase is independently useful and reversible.

---

## 10. Success Criteria

- Users **re-ask less** (facts reused across chats).
- **Higher 👍 rate** and more saved/exported answers over time.
- **Right model/agent preselected** for the user's common tasks.
- **Zero** new network calls or stored-off-device data.

---

**In one line:** add a capped, consent-based, local `ros_memory` layer (facts /
preferences / signals / reviews) that feeds a bounded context block into the existing
`buildPrompt()` — turning Research OS into a system that quietly gets better every week,
with no backend and no privacy trade-off.
