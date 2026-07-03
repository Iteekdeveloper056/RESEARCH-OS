# RESEARCH-OS

## Cursor Cloud specific instructions

### What this project is
RESEARCH-OS ("Research OS") is a **static, single-file web app** — a dark-themed research
dashboard. The entire application is `research-os/index.html` with inline CSS and inline
JavaScript, loading fonts from a public CDN. There is **no package manager, no build step,
no backend, and no database**.

> Note: The `research-os/index.html` app currently lives in a separate feature branch / PR
> (the foundation UI shell). On `main` the repo may only contain this file and the README
> until that PR is merged. Once present, run it as described below.

### Running the app (dev)
Serve the folder with any static file server; nothing needs to be installed (Python 3 and
Node are preinstalled):

```
python3 -m http.server 8000 --directory research-os
```

Then open `http://localhost:8000/index.html`. Node alternative: `npx serve research-os`.

There is no hot-reload — after editing `research-os/index.html`, just refresh the browser.

### Lint / test / build
There is **no lint, test, or build tooling** in this repository. It is plain static HTML,
so "build" is a no-op and there is nothing to compile. If tooling is added later, document
it here.

### Gotchas
- The app is fully client-side; the "OpenRouter Connected" status and model options are
  static UI (the top-level JS handlers are currently stubs in the foundation shell), so
  clicking "Run Research" may not trigger dynamic behavior yet. Native form controls
  (query textarea, Model/Depth/Format dropdowns) are interactive.
- Fonts load from Google Fonts over the network; if offline, text falls back to system
  fonts but layout still renders.
