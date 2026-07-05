# Research OS

Live AI research dashboard with login, 3-screen chat UI, and OpenRouter integration.

## Live URL

**https://iteekdeveloper056.github.io/RESEARCH-OS/research-os/**

(Also available at repo root — redirects automatically)

## 3-Screen UI

| Screen | Panel | Contents |
|---|---|---|
| **Screen 1** | Left sidebar | Menu, Projects, Chats |
| **Screen 2** | Center | Chat messages + message input bar |
| **Screen 3** | Right panel | Active agent, model router, depth/format options |

On mobile, use the bottom tab bar to switch between screens.

## Quick Start

1. Open the live URL (or `research-os/index.html` locally)
2. Enter your name and [OpenRouter API key](https://openrouter.ai/keys)
3. Click **Launch Dashboard**
4. Select an agent on Screen 3, type a message on Screen 2, press Enter

## Local Development

```bash
python3 -m http.server 8080
# Open http://localhost:8080/research-os/
```

## Features

- Login dashboard with session persistence
- Projects & chat history (localStorage)
- 6 research agents with specialized prompts
- Model router with auto-fallback on errors
- Mobile-responsive 3-screen layout

## File Structure

```
index.html              → Redirects to research-os/
research-os/index.html  → Complete self-contained app
.github/workflows/      → GitHub Pages deployment
```
