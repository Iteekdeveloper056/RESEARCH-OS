# ITEEK LEARN Builder — New Project Outline & Summary

> **Recommendation: build this as its own project/agent, separate from Research OS.**
> It shares the **ITEEK Router System** (LLM access) but has a different purpose, flow,
> and output. This document is the outline/summary to achieve that goal.

---

## 0. Naming (to avoid confusion)

| Name | What it is |
|---|---|
| **ITEEK LEARN Builder** | The **new project/agent** — interviews a person and generates their system. (This doc.) |
| **ITEEK LEARN.MD SYSTEM** | The **portable spec/output** it generates — the self-learning memory system (complete spec + Research OS reference instance). (`skills/iteek-learn-system/SKILL.md`) |
| **ITEEK Router System** | The **LLM layer** both projects call. (`skills/iteek-router-system/SKILL.md`) |
| **Research OS** | A **separate** research tool. Not this project. |

Builder = the factory. LEARN.MD = the product it ships. Router = the power supply.

---

## 1. Why Separate (rationale)

- **Different job:** Research OS answers questions; the Builder **asks** them and **produces documents**.
- **Different flow:** research is a short loop; the Builder is a guided, staged interview → generate → download.
- **Different output:** reports vs. a structured folder of `.md` files.
- **Clean separation:** keeps Research OS a focused research tool and lets the Builder evolve (domains, generators, self-learning) without collateral risk.
- **Reuse, not merge:** both consume the ITEEK Router System, so there's no duplication of the hard part (LLM access + safety).

**Verdict:** new project, new repo (or a clearly separate folder), shared skills.

---

## 2. Mission (one-liner)

**Interview any person about their business/life domain and generate a ready-to-use,
self-improving LLM system (a set of Markdown files) tailored to their goal.**

---

## 3. What It Produces

For each person, a downloadable system folder implementing the **ITEEK LEARN.MD SYSTEM**:

```
/<their-system>/
├── README.md                  # quick start
├── 00_TRUE_NAME.md            # identity, voice, goal
├── SKILL.md                   # portable LLM skill (drop into any model)
├── 01_KNOWLEDGE/              # frameworks, glossary, references
├── 02_PROCESS/                # daily / weekly / monthly rhythms
├── 03_MEMORY/                 # the self-learning layer (facts/signals/reviews)
├── 04_AGENTS/                 # domain-specific agent prompts
└── 05_TEMPLATES/              # reusable domain templates
```

The `03_MEMORY/` layer is what makes the output **self-learning** — it's the file
embodiment of the ITEEK LEARN.MD SYSTEM's four layers.

---

## 4. How It Differs From Research OS

| Aspect | Research OS | ITEEK LEARN Builder |
|---|---|---|
| Core verb | Research | Interview + Generate |
| Input | A query | Answers to guided questions |
| Output | Report / chat | A folder of `.md` files (ZIP) |
| LLM role | Answer questions | Ask smart follow-ups + draft documents |
| Reuse | Per query | Build once, use the system forever |
| Shared | — | **ITEEK Router System** (identical LLM layer) |

---

## 5. Architecture (static, no backend)

Same proven stack as Research OS — vanilla HTML/CSS/JS, no build step, GitHub Pages.

```
/iteek-learn-builder/
├── index.html                 # shell: welcome → interview → dashboard → preview → download
├── css/styles.css             # brand styling (sage/earth or new brand)
└── js/
    ├── router.js              # ITEEK Router System (callLLM) — from the skill
    ├── agent.js               # interviewer system prompt + behaviour
    ├── questions.js           # question bank (universal + per-domain)
    ├── profile.js             # tracks answers → structured profile
    ├── generator.js           # profile → the .md file set (implements LEARN.MD)
    ├── dashboard.js           # live build stats + folder tree
    ├── download.js            # ZIP (JSZip) + individual file download
    └── app.js                 # controller, routing, state, localStorage
```

**Dependencies:** JSZip (CDN) for the download package. Nothing else.

---

## 6. The Interviewer Agent

A single system prompt that runs a **staged, adaptive interview**:

- **Tone:** conversational, curious, decisive; one question at a time; confirm before moving on.
- **Adaptivity:** uses the ITEEK Router to ask smart follow-ups based on prior answers (not a static form).
- **Progress:** shows a progress ring + section checklist.
- **Escape hatch:** "skip to build" once required fields are captured.
- **Safety:** flags compliance-sensitive domains (health, finance, legal) and inserts disclaimers into generated files.

---

## 7. Question Framework (scalable)

Two-tier bank so new domains are cheap to add:

- **Universal (5–8):** who it's for, operator, goal, context, success metric, constraints.
- **Domain-specific (8–12):** per domain (business, holistic wellness, learning, creative, financial, etc.).

Start with the domains you care about first (e.g. **business** + **holistic wellness**),
then extend `questions.js`. Each domain is just a new array — no code changes.

> Design choice: keep the *required* set small (fast path to a usable system), and let the
> agent optionally deepen via adaptive follow-ups routed through the ITEEK Router.

---

## 8. Generation (profile → documents)

`generator.js` maps the collected profile to the file set. Two modes:

1. **Template mode (MVP):** deterministic — fill Markdown templates from answers. Fast,
   free, works offline. No API needed.
2. **LLM-enriched mode (v1.1):** use the **ITEEK Router** to draft richer sections
   (voice examples, tailored processes) with the safety rules from the Router
   implementation guide (key never logged, `max_tokens` caps, fallback, escaping).

Ship template mode first; layer LLM enrichment behind the API key.

---

## 9. User Flow (5 views)

```
Welcome → pick domain (business, holistic wellness, …)
Interview → adaptive Q&A, progress ring, skip-to-build
Dashboard → live stats (files, folders, size, completeness) + tree
Preview → browse/search generated files, view before download
Download → ZIP or individual files, package preview, next steps
```

---

## 10. State & Persistence

- `localStorage` for: API key (`openrouter_api_key`), current profile, answers, domain, past builds.
- Same **consent-based, local-only** posture as Research OS.
- "Clear all data" wipes everything; keys never leave the device except to OpenRouter.

---

## 11. Integration With the ITEEK Systems

- **ITEEK Router System** → `js/router.js`. All LLM calls go through `callLLM`, following the
  safe-submission rules (see `docs/ITEEK_ROUTER_IMPLEMENTATION.md`).
- **ITEEK LEARN.MD SYSTEM** → the **output spec**. The Builder's `generator.js` produces
  files that implement that system (esp. the `03_MEMORY/` self-learning layer). Fill the
  system's Submission Block from the interview answers.

This is the payoff of the earlier work: the Builder **consumes both skills** rather than
reinventing them.

---

## 12. MVP Scope (what to build first)

**MVP (template mode, no API required):**
1. Welcome + 2 domains (business, holistic wellness)
2. Interview with universal + domain questions (static + progress)
3. Template generator → the `.md` file set
4. Preview + ZIP download

**v1.1 (adds the Router):**
5. Settings + API key + Test Connection (ITEEK Router)
6. LLM-enriched generation + adaptive follow-ups
7. More domains

**v1.2:**
8. Save/load builds, edit files in-browser, "what it learned" review digest

---

## 13. Deployment

- **Own repo recommended** (e.g. `ITEEK-LEARN-BUILDER`) with the same GitHub Pages
  workflow already used here (`.github/workflows/deploy-pages.yml`).
- If kept in this repo temporarily, isolate under `/iteek-learn-builder/` with its own
  entry point — but a separate repo best matches "totally different project."

---

## 14. Success Criteria

- A non-technical person completes an interview and downloads a working system in **<15 min**.
- Generated `SKILL.md` drops into Claude/ChatGPT and immediately behaves in-domain.
- New domains add via `questions.js` only (no core changes).
- Zero data leaves the device except LLM calls (opt-in, via the Router).

---

## 15. Open Decisions (need your call)

1. **Repo:** new standalone repo, or a folder here for now?
2. **First domains:** confirm **business + holistic wellness** as MVP set (others next).
3. **MVP generation:** template-only first (no API), then add Router enrichment? (Recommended.)
4. **Brand:** reuse the sage/earth palette, or a distinct ITEEK LEARN brand?
5. **Depth:** small required question set + adaptive follow-ups (recommended) vs. a fixed long form.

---

**In one line:** build **ITEEK LEARN Builder** as its own static project that interviews a
person, then generates their **ITEEK LEARN.MD SYSTEM** files — reusing the **ITEEK Router
System** for any LLM work — kept fully separate from Research OS.
