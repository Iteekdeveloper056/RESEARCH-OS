# RESEARCH-OS

**Research-OS** is a runnable implementation of the *Ultimate AI Researcher & Builder* persona: a research analyst, AI-agent architect, automation consultant, prompt engineer, and technical writer rolled into one system prompt, wired up to a real multi-model backend so it can actually be used.

- The full persona/system prompt lives in [`research_os/prompts/system_prompt.md`](research_os/prompts/system_prompt.md) and is loaded verbatim at runtime — it is not just documentation, it is the code's behavior.
- The agent talks to any model reachable through **your OpenRouter API key** (OpenAI, Anthropic, Google, Meta/Llama, Mistral, DeepSeek, xAI, and 300+ others) via one unified, OpenAI-compatible API.
- It ships with a pluggable web-search tool, a local "Task Learning Record" log (the persona's self-improvement loop), and both a scriptable CLI and an interactive chat mode.

## Verified facts vs. limitations (read this first)

| Claim | Status |
|---|---|
| OpenRouter (`https://openrouter.ai/api/v1`) exposes a single, OpenAI-compatible `chat/completions` + `models` API that routes to 300+ hosted models from many vendors, authenticated with a Bearer API key. | **Verified** against OpenRouter's official docs (openrouter.ai/docs) as of 2026-07-05. |
| "Access to all LLMs available with my Cursor account" from a standalone script/repo outside the Cursor product. | **Not possible today.** Cursor does not publish a public API that lets an external program authenticate as your Cursor subscription and call the models configured inside Cursor's own IDE/agent chat. Model selection inside Cursor happens in the Cursor UI itself (this is where the model that is building this repo is running). There is no documented way to re-export that access to a plain Python CLI. |
| Practical resolution implemented here. | Research-OS gets you the broadest **practical** multi-LLM access available to a standalone codebase: bring your own `OPENROUTER_API_KEY` and call essentially any major model family through one interface. This satisfies the spirit of "access to many LLMs with one key" using a real, verifiable product rather than an invented Cursor capability. |

If Cursor ever ships a public "use my subscription's models from outside the IDE" API, the provider layer in `research_os/providers/` is the place to add a second backend — the CLI and agent core do not assume OpenRouter is the only provider.

## Architecture

```
research_os/
├── prompts/system_prompt.md   # The persona, loaded verbatim as the system message
├── config.py                  # Env-var driven settings (no hard-coded secrets)
├── persona.py                 # Loads the prompt + response-mode instruction snippets
├── providers/openrouter.py    # OpenAI-compatible client: chat_completion(), list_models()
├── tools/web_search.py        # Tavily-backed search tool with honest "unavailable" fallback
├── memory/learning_log.py     # Parses "## Task Learning Record" sections, stores as JSONL
├── core/agent.py              # Orchestrates one turn: persona + search context + mode + call
└── cli.py                     # `research-os models|ask|chat|learnings`
```

Flow for one turn: **user input → (optional) web_search tool call → response-mode instruction → OpenRouter chat completion → reply + parsed Task Learning Record → local learning log**.

## Setup

### Prerequisites

- Python 3.10+
- An [OpenRouter](https://openrouter.ai/keys) API key (required)
- Optionally, a [Tavily](https://tavily.com) API key to enable live web search for time-sensitive claims

### Install

```bash
pip install -e .          # installs the research-os CLI
# or, without installing as a package:
pip install -r requirements.txt
```

### Configure secrets

Copy `.env.example` to `.env` and fill in your keys, **or** export them directly:

```bash
cp .env.example .env
# edit .env and set OPENROUTER_API_KEY=... (and optionally TAVILY_API_KEY=...)
```

Never commit `.env` or paste real keys into code — `.env` is already in `.gitignore`.

If you're running this from a Cursor Cloud Agent, add `OPENROUTER_API_KEY` (and optionally `TAVILY_API_KEY`) under **Cursor Dashboard → Cloud Agents → Secrets** so they're injected automatically into future agent runs.

## Usage

```bash
# List every model currently available through your OpenRouter key
research-os models --search claude

# One-shot question, forcing a response mode
research-os ask "Compare Tavily, Serper, and Brave Search for an agent's search tool" --mode strategic

# One-shot question, pick a specific model
research-os ask "Draft a system prompt for a customer-support agent" --model anthropic/claude-sonnet-4 --mode builder

# Interactive session (in-chat commands: /mode <fast|tutorial|strategic|builder|onestep|auto>, /reset, /exit)
research-os chat --model openai/gpt-5.2

# Review the persona's self-recorded lessons from past tasks
research-os learnings --limit 5
```

Every `ask`/`chat` turn asks the model to close with a `## Task Learning Record` section (per the persona's self-learning loop); when present, it's parsed and appended to `~/.research_os/learning_log.jsonl` (override the directory with `RESEARCH_OS_HOME`). Nothing is sent anywhere except your OpenRouter/Tavily calls — the learning log is a local file you can inspect, edit, or delete at any time.

## Testing

```bash
pip install -e ".[dev]"
pytest -v
```

The test suite (19 tests) mocks all HTTP calls (via `responses`) so it runs with no network access and no real API key: OpenRouter client behavior, the search-tool fallback path, learning-record parsing/storage, agent orchestration, and the CLI commands (via Click's `CliRunner`) are all covered. A full end-to-end smoke test (`research-os models` / `ask` / `chat` against a real local mock HTTP server standing in for OpenRouter) was also run manually during development to confirm the compiled CLI binary works, not just the unit-tested functions.

## Security & privacy notes

- Secrets are read only from environment variables / `.env`; none are hard-coded.
- The web-search tool fails closed: if no `TAVILY_API_KEY` is set, the agent is told explicitly that it has no live verification and must disclose that instead of fabricating sources.
- The learning log never stores secrets — only task metadata (objective, approach, lessons) extracted from the model's own reply text.

## Extending

- **Add another model provider:** implement the same `chat_completion` / `list_models` interface as `research_os/providers/openrouter.py` and swap it into `ResearchOSAgent`.
- **Add another search backend:** extend `research_os/tools/web_search.py`; keep the same "explicitly report unavailable" contract instead of ever fabricating results.
- **Change the persona:** edit `research_os/prompts/system_prompt.md` directly — it is read fresh from disk (cached per process) and is the single source of truth for the agent's behavior.
