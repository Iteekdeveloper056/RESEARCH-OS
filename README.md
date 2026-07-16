# Research OS

**Canonical product:** browser-based AI research dashboard with login, 3-screen chat UI, and OpenRouter integration.

> This repo's primary app is `research-os/index.html` — a single self-contained file. Use this repo and branch `main`.

## ITEEK Platform (reusable skills — any project)

Looking for the **Router** or **LEARN** systems? They live in **`iteek-systems/`** — not inside the Research OS app.

| System | Quick Start | Full spec |
|---|---|---|
| **ITEEK Router System** (LLM access) | [ROUTER_QUICK_START.md](iteek-systems/guides/ROUTER_QUICK_START.md) | [SKILL.md](iteek-systems/skills/iteek-router-system/SKILL.md) |
| **ITEEK LEARN.MD SYSTEM** (self-learning memory) | [LEARN_QUICK_START.md](iteek-systems/guides/LEARN_QUICK_START.md) | [SKILL.md](iteek-systems/skills/iteek-learn-system/SKILL.md) |

→ Full index: [iteek-systems/README.md](iteek-systems/README.md)

## Live Apps

| App | URL |
|---|---|
| **Research OS** | https://iteekdeveloper056.github.io/RESEARCH-OS/research-os/ |
| **LLM OS Builder** | https://iteekdeveloper056.github.io/RESEARCH-OS/llm-os-builder-app/ |

> First-time? Enable GitHub Pages: [DEPLOY.md](DEPLOY.md) (one-time, 2 min)

## Quick Start

1. Open the [live URL](https://iteekdeveloper056.github.io/RESEARCH-OS/research-os/) or run locally:
   ```bash
   python3 -m http.server 8080
   # → http://localhost:8080/research-os/
   ```
2. **Login:** enter your name + [OpenRouter API key](https://openrouter.ai/keys)
3. **Screen 3 (right):** pick a research agent
4. **Screen 2 (center):** type a message, press Enter
5. **Screen 1 (left):** manage projects and chats

## 3-Screen UI

| Screen | Panel | Purpose |
|---|---|---|
| **1** | Left sidebar | Menu, Projects, Chats |
| **2** | Center | Chat thread + message input bar |
| **3** | Right panel | Agent switcher, model router, depth/format |

Mobile: bottom tabs switch between screens.

## Research Agents

| Agent | Focus |
|---|---|
| 💼 Business Research | Market analysis, industry trends |
| 💻 Software & Tech | Tech stacks, frameworks, architecture |
| 🤖 AI Tools & Trends | Model comparisons, emerging tech |
| 📈 Sales Intelligence | Leads, prospects, pipeline |
| 🎯 Marketing Research | Campaigns, audiences, positioning |
| ⚔️ Competition Analysis | Competitors, SWOT, benchmarking |

## Features

- Login dashboard with session persistence
- Projects & multi-chat history (localStorage)
- 6 specialized research agents with tailored system prompts
- Model router (Auto, Claude, GLM, DeepSeek) with fallback on errors
- Export chats as Markdown
- Mobile-responsive 3-screen layout

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |
| `Escape` | Close panels/modals |

## Project Structure

```
index.html              → Redirects to research-os/
research-os/index.html  → Research OS app (HTML + CSS + JS)
iteek-systems/          → ITEEK Router + LEARN skills (reusable platform specs)
  guides/               → Short quick-start guides
  skills/               → Full SKILL.md specifications
  docs/                 → Implementation + builder project outlines
DEPLOY.md               → GitHub Pages setup guide
.github/workflows/      → Auto-deploy on push to main
```

## Repo Policy

`main` is the only active branch. Use `research-os/index.html` as the product.

## License

MIT
