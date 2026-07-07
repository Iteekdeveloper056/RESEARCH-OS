# ITEEK Router System — Quick Start

> **5-minute guide.** Add vendor-neutral LLM access to any build.
> Full spec: [../skills/iteek-router-system/SKILL.md](../skills/iteek-router-system/SKILL.md)

---

## When to use

- Any app that calls Claude, GPT, DeepSeek, Llama, etc.
- You want **one API key**, **model switching**, and **safe submission** without a backend.

**Don't use alone for:** self-learning memory → add [LEARN Quick Start](LEARN_QUICK_START.md).

---

## 5 steps

### 1. Copy the module
From the SKILL (§5), save as `js/router.js` in your project. Set your app name:

```js
OPENROUTER.appTitle = "Your App Name";
```

### 2. Get an OpenRouter key
1. Sign up at [openrouter.ai](https://openrouter.ai) · add credits ($5 min)
2. Create a key at [openrouter.ai/keys](https://openrouter.ai/keys)

### 3. Add a Settings field
```js
localStorage.setItem('openrouter_api_key', key.trim());
```
Use `type="password"`. Never hard-code or log the key.

### 4. Call the Router
```js
import { callLLM, callLLMWithFallback } from './router.js';

const messages = [
  { role: 'system', content: 'You are…' },
  { role: 'user', content: userText }
];

const result = await callLLMWithFallback(messages, { task: 'general' });
if (result.success) showAnswer(result.content);
else showError(result.error);  // never show the API key
```

### 5. Test connection
```js
import { testConnection } from './router.js';
const check = await testConnection();
// → { success, message }
```

---

## Safety checklist (always)

- [ ] Key in `localStorage` only — never in source code
- [ ] HTTPS only · key never logged or rendered
- [ ] Block send if no key · cap `max_tokens` per request
- [ ] Escape model output before showing in HTML
- [ ] Set a spend ceiling in the OpenRouter dashboard

Details: [../docs/ITEEK_ROUTER_IMPLEMENTATION.md](../docs/ITEEK_ROUTER_IMPLEMENTATION.md)

---

## Live reference

Research OS implements this today → `research-os/index.html` (`callAPI()`).

---

**Next:** need memory that improves over time? → [LEARN Quick Start](LEARN_QUICK_START.md)
