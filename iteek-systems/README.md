# ITEEK Systems

> **Reusable platform specs for any ITEEK build.** Apps (like Research OS) live in their
> own folders/repos; **this folder is where you find the shared skills.**

---

## Start here

| I want to… | Read this |
|---|---|
| Add LLM access to any app | [Router Quick Start](guides/ROUTER_QUICK_START.md) |
| Add self-learning memory to any app | [LEARN Quick Start](guides/LEARN_QUICK_START.md) |

---

## Full specifications

| System | Skill (complete spec) | Guide (short) |
|---|---|---|
| **ITEEK Router System** | [skills/iteek-router-system/SKILL.md](skills/iteek-router-system/SKILL.md) | [guides/ROUTER_QUICK_START.md](guides/ROUTER_QUICK_START.md) |
| **ITEEK LEARN.MD SYSTEM** | [skills/iteek-learn-system/SKILL.md](skills/iteek-learn-system/SKILL.md) | [guides/LEARN_QUICK_START.md](guides/LEARN_QUICK_START.md) |

---

## Additional docs

| Doc | Purpose |
|---|---|
| [docs/ITEEK_ROUTER_IMPLEMENTATION.md](docs/ITEEK_ROUTER_IMPLEMENTATION.md) | Safe API submission (detailed) |
| [docs/ITEEK_LEARN_BUILDER_PROJECT.md](docs/ITEEK_LEARN_BUILDER_PROJECT.md) | Future interview → generate app (separate product) |

---

## How this relates to Research OS

| Location | What |
|---|---|
| **`iteek-systems/`** (this folder) | Platform skills — copy into any project |
| **`research-os/`** (sibling folder) | Research OS **app** — uses the Router pattern today |

Research OS is a **product**. ITEEK Systems are **building blocks**.

---

## Using in a new Project / Agent

1. Copy `iteek-systems/` into your repo (or submodule it).
2. Read the **Quick Start** for each skill you need.
3. For LEARN: fill **§1 Submission Block** in the LEARN SKILL.
4. Pair **Router + LEARN** when the build both talks to LLMs and should improve over time.

---

© 2026 ITEEK AI Solutions · MIT License
