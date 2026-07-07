# ITEEK LEARN.MD SYSTEM — Quick Start

> **5-minute guide.** Add self-learning memory to any build.
> Full spec: [../skills/iteek-learn-system/SKILL.md](../skills/iteek-learn-system/SKILL.md)

---

## When to use

- The **same person** returns repeatedly (coach, researcher, operator, client).
- You want the build to **remember facts**, **learn preferences**, and **improve weekly**.
- No backend — everything stays in the browser (`localStorage`).

**Pair with:** [Router Quick Start](ROUTER_QUICK_START.md) if the build also calls LLMs.

---

## 5 steps

### 1. Fill the Submission Block
Open the [LEARN SKILL](../skills/iteek-learn-system/SKILL.md) §1 and set:

```yaml
business_name:   "My Wellness App"
goal:            "Remember client context across sessions"
storage_key:     "wellness_memory"
fact_cap:        40
inject_cap:      12
consent_mode:    "explicit"
```

### 2. Add memory to state
```js
const STORAGE_KEY = 'wellness_memory'; // from Submission Block

state.memory = loadMemory() || { facts:[], preferences:{}, signals:[], reviews:[], version:1 };

function saveMemory() {
  if (state.autoSave) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.memory));
}
```

### 3. Capture signals (cheap feedback)
On each answer: 👍/👎, or when user saves/exports/copies.

```js
state.memory.signals.unshift({ id: Date.now(), refId, rating: 1, kind: 'rate', ts: Date.now() });
saveMemory();
```

### 4. Inject learned context (bounded)
Before each LLM call, prepend to your system prompt:

```js
function buildLearnedContext(memory, tag) {
  return (memory.facts || [])
    .filter(f => !f.tag || f.tag === tag)
    .slice(0, 12)  // inject_cap from Submission Block
    .map(f => `- ${f.text}`).join('\n');
}
```

### 5. Let users save facts
**"Save as fact"** button only — no silent scraping. User confirms what enters long-term memory.

---

## Rollout (ship in order)

1. Signals only (no prompt change)
2. Preferences (preselect defaults)
3. Facts + injection
4. Weekly reviews + "What it learned" digest
5. Memory panel (view / edit / reset)

---

## Safety checklist (always)

- [ ] Memory stays **local** — nothing new sent to a server
- [ ] Facts are **user-confirmed** only (`consent_mode: explicit`)
- [ ] `inject_cap` caps prompt size (controls token cost)
- [ ] "Reset learning" wipes `<storage_key>` only
- [ ] Escape all rendered output

---

## Reference instance

Research OS wiring example → LEARN SKILL **§12** (filled Submission Block + `buildPrompt` hook).

---

**Next:** need LLM calls? → [Router Quick Start](ROUTER_QUICK_START.md)
