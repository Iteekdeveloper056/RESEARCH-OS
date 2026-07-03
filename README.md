# Research OS

A self-contained research dashboard powered by [OpenRouter](https://openrouter.ai). Six specialized research agents, intelligent model routing, and a polished dark-theme UI — all in a single HTML file.

## Quick Start

1. Open `research-os/index.html` in any modern browser
2. Go to **Settings** and paste your [OpenRouter API key](https://openrouter.ai/keys)
3. Select a research agent, enter a query, and click **▶ Run Research**

No build step, no server required.

## Features

- **6 Research Agents** — Business, Software & Tech, AI Tools, Sales, Marketing, Competition
- **Model Router** — Auto Router or manual selection (Claude, GLM, DeepSeek)
- **Depth & Format** — Quick Scan through Comprehensive; Summary, Report, Bullets, or Table output
- **Error Handling** — Specific messages for auth, credits, rate limits, model unavailability (with automatic fallback), and network errors
- **Activity Logs** — Track research runs and settings changes
- **Copy & Export** — Copy results to clipboard or export as Markdown

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` / `Cmd` + `Enter` | Run research |
| `Escape` | Close panels and modals |

## Auto Router

When **Auto Router** is selected, the model is chosen by research depth:

| Depth | Model |
|---|---|
| Quick Scan | GLM 4.7 Flash |
| Standard | GLM 4.7 |
| Deep Dive | Claude Sonnet 4.6 |
| Comprehensive | Claude Opus 4.5 |

On model unavailability (404), Research OS automatically retries with fallback models: GLM Flash → DeepSeek → GLM → Claude Sonnet.

## Error Handling

| Code | Message | Action |
|---|---|---|
| 401 | Invalid API key | Opens Settings |
| 402 | Insufficient credits | — |
| 429 | Rate limited | — |
| 404 | Model unavailable | Auto-retry with fallback |
| 500 | Server error | — |
| Network | Connection failed | — |

## Local Storage

Settings and results are persisted in the browser:

- `openrouter_api_key` — API key
- `research_os_default_agent` — Default agent
- `research_os_current_model` — Selected model
- `research_os_system_prompt` — Global system prompt
- `research_os_results` — Recent results (up to 20)
- `research_os_activity` — Activity log (up to 50 entries)

## File Structure

```
research-os/
└── index.html    # Complete self-contained app (HTML + CSS + JS)
```

## License

MIT
