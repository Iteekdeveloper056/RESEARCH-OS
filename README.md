# Research OS

**Canonical product:** browser-based AI research dashboard with login, 3-screen chat UI, and OpenRouter integration.

> This repo's primary app is `research-os/index.html` — a single self-contained file. Use this repo and branch `main`.

## Live URL

**https://iteekdeveloper056.github.io/RESEARCH-OS/research-os/**

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
- 6 specialized research agents + Ultimate Researcher system prompt
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
research-os/index.html  → Complete app (HTML + CSS + JS)
DEPLOY.md               → GitHub Pages setup guide
.github/workflows/      → Auto-deploy on push to main
```

## Repo Policy

| Branch / PR | Status |
|---|---|
| `main` | **Canonical** — use this |
| PR #1 (foundation UI) | Merged |
| PR #2, #3 (Python CLI / dev env) | Superseded — closed in favor of web dashboard |

A separate Python CLI agent was explored in another conversation (`cursor/build-research-os-agent-9813`). The **web dashboard on `main`** is the chosen product for daily use.

## License

MIT
