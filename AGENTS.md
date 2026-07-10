# RESEARCH-OS

## Cursor Cloud specific instructions

### What this project is
RESEARCH-OS ("Research OS") is a **static, single-file web app** — a research
dashboard. The entire application is `research-os/index.html` with inline CSS and
inline JavaScript. There is **no package manager, no build step, no backend, and
no database**.

Reusable LLM / learning specs live under `iteek-systems/` (Router + LEARN skills).

### Local environment variables (`.env.local`)
Secrets for this repo are documented in **`.env.local.example`**.

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM calls |

**How to set them:**

1. **Local machine:** `cp .env.local.example .env.local` then fill in values.
   `.env.local` is gitignored — never commit it.
2. **Cursor Cloud:** add the same names/values in the environment **Secrets** tab
   (recommended). Do not bake keys into snapshots or source.
3. **Browser app (`research-os/index.html`):** the UI does **not** read `.env.local`.
   Paste the key on the login / Settings screen; it stays in `localStorage` only
   and is sent only to OpenRouter over HTTPS.

### Running the app (dev)
Serve the folder with any static file server (Python 3 and Node are preinstalled):

```
python3 -m http.server 8000 --directory research-os
```

Then open `http://localhost:8000/index.html`. Node alternative: `npx serve research-os`.

There is no hot-reload — after editing `research-os/index.html`, refresh the browser.

### Lint / test / build
There is **no lint, test, or build tooling** in this repository. It is plain static
HTML, so "build" is a no-op. If tooling is added later, document it here.

### Gotchas
- Fonts may load from a CDN; offline, text falls back to system fonts.
- API calls need a valid OpenRouter key (UI Settings or `OPENROUTER_API_KEY` for
  any future server/CLI tooling).
- Never hard-code keys, log Authorization headers, or commit `.env` / `.env.local`.
