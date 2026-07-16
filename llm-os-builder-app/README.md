# LLM OS Builder App

> **A complete web application for the LLM OS Builder Agent.**
> **Chat interface, OpenRouter integration, profile builder, file generator, template browser.**

---

## What This Is

A static web app that wraps the LLM OS Builder Agent in a beautiful, functional UI. Operators (business owners, founders) interact with the agent via chat to build their own self-improving LLM OS.

**Features:**
- 💬 **Chat interface** — Natural conversation with the agent
- 🧭 **Guided Discovery** — 38 questions across 7 sections
- 👤 **Profile builder** — Real-time profile generation as you chat
- 📦 **Deliverables generator** — Auto-generates True Name + True Process + SKILL.md
- 🎯 **Industry templates** — 10 pre-built templates per business type
- 🔧 **Troubleshooting playbook** — Common issues + fixes
- 🌐 **OpenRouter routing** — Vendor-neutral LLM access

---

## Architecture

```
/llm-os-builder-app/
├── index.html              # Main app shell
├── css/
│   └── styles.css          # Sage green brand styling
├── js/
│   ├── agent-config.js     # System prompt + behaviour
│   ├── templates.js        # 10 industry templates
│   ├── troubleshoot.js     # 10 common issues + fixes
│   ├── api.js              # OpenRouter integration + routing
│   ├── profile-builder.js  # Track operator discovery answers
│   ├── file-generator.js   # Generate True Name + Process + Skill
│   └── app.js              # Main controller
└── README.md               # This file
```

**Total size:** ~80KB (fast loading, no build step)

---

## Quick Start

### Option A: Open Locally (No Deploy)

1. **Extract the zip** to any folder
2. **Open `index.html`** in your browser (Chrome, Firefox, Safari, Edge)
3. **Click ⚙️ Settings** → Add your OpenRouter API key
4. **Click "Start New Engagement"** → Begin Discovery

**That's it.** No build, no server, no dependencies.

### Option B: Deploy to Static Host

Works on:
- Netlify (drag + drop)
- Vercel (drag + drop)
- Cloudflare Pages
- GitHub Pages
- Any static host

**Steps:**
1. Upload the unzipped folder to your host
2. Get public URL
3. Share with operators

---

## Setup — OpenRouter API Key

The app uses **OpenRouter** for vendor-neutral LLM access.

**Why OpenRouter?**
- Single API key for many models
- Vendor-neutral (Claude, GPT-4, DeepSeek, Llama, etc.)
- Cost-optimized routing
- Auto-fallback capabilities
- Future-proof (new models available without code changes)

### Get Your OpenRouter API Key

1. Go to https://openrouter.ai
2. Sign up (email + password)
3. Add credits ($5 minimum)
4. Go to https://openrouter.ai/keys
5. Create new key
6. Copy key (starts with `sk-or-v1-...`)

### Add to App

1. Open app
2. Click ⚙️ Settings (top right)
3. Paste API key
4. Click "Test Connection" to verify
5. Save

**Key is stored locally in browser only.** Never sent anywhere except OpenRouter.

---

## Model Routing

The app routes tasks to different models based on need:

| Task Type | Model | Why |
|---|---|---|
| Voice-critical content | `anthropic/claude-sonnet-4.6` | Highest quality voice |
| Bulk drafts | `anthropic/claude-haiku-4.5` | Fast + cheap |
| Template filling | `deepseek/deepseek-v4-flash` | ~25x cheaper |
| Variations | `meta-llama/llama-3.3-70b` | Alternative perspective |
| Premium quality | `anthropic/claude-opus-4.1` | Best of best |
| Local free | `ollama/llama-3.1-8b` | Free if you have Ollama |

**Default:** Claude Sonnet 4.6 (best balance for most use cases)

You can switch models in Settings.

---

## How Operators Use It

### Flow

1. **Welcome screen** → Operator sees features + starts engagement
2. **Quick onboarding** → Name + business + type + stage + budget (30 sec)
3. **Chat opens** → Agent greets them
4. **Discovery** → Agent asks questions naturally across conversation
5. **Profile builds** → Sidebar tracks what's been captured
6. **Architecture** → Agent recommends LLM stack after 10+ answers
7. **Build** → Operator clicks "Generate True Name" → File downloads
8. **Deploy** → Operator follows deployment guidance

### Time

- **Quick onboarding:** 30 sec
- **Discovery:** 30-60 min (or skip to architecture)
- **Architecture:** 5 min
- **Build:** Auto-generated, instant
- **Deploy:** 1-2 hours with operator

---

## What Gets Generated

After Discovery (10+ questions completed), the app generates:

### 1. TRUE_NAME.md
Brand master file containing:
- Business identity
- Voice definition (3 words + banned phrases + references)
- Frameworks & methodology
- Audience profile
- Goals & metrics
- Constraints
- Compliance requirements
- Architecture decision

### 2. TRUE_PROCESS_CONTENT.md
Content production playbook with:
- Voice check before writing
- 5 quality gates (Voice, Specificity, Customer-centric, Compliance, Format)
- 8-step process
- Routing logic (which LLM for which task)
- Improvement loop

### 3. SKILL.md
Portable LLM skill (YAML frontmatter) with:
- Voice definition
- Invocation template
- Quality gates
- Content patterns
- Examples (operator adds 5)

**All 3 files are Markdown** — easy to edit, version control, share.

---

## Local Storage

The app stores data locally:

- **API key** (Settings)
- **Selected model**
- **Agent mode**
- **Current operator**
- **Current profile**
- **Chat history**
- **Past operators list**

**To clear all data:** Settings → Clear All Local Data

**No server. No cloud. Privacy-first.**

---

## Browser Compatibility

Works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Requires:**
- JavaScript enabled
- localStorage enabled
- Internet connection (for LLM API calls)

---

## Customisation

### Change Branding

Edit `css/styles.css`:

```css
:root {
  --sage-primary: #5B7B6F;    /* Change to your brand color */
  --sage-dark: #3A5A4F;
  --copper-accent: #C17F59;
  --gold-accent: #8B6914;
}
```

### Add Industry Templates

Edit `js/templates.js` — add new template object to `INDUSTRY_TEMPLATES` array.

### Customise Agent Voice

Edit `js/agent-config.js` — modify `systemPrompt`.

### Add Troubleshooting Issues

Edit `js/troubleshoot.js` — add new issue object to `TROUBLESHOOT_ISSUES` array.

---

## Deployment

### Netlify (Recommended — Free + Easy)

1. Go to https://app.netlify.com/drop
2. Drag the unzipped folder onto the page
3. Wait 30 seconds
4. Get URL like `https://random-name-123.netlify.app`
5. Done. Share URL.

### Vercel

```bash
npm i -g vercel
cd llm-os-builder-app
vercel
```

Follow prompts. Get URL.

### GitHub Pages

1. Push folder to GitHub repo
2. Settings → Pages → Source: main branch / root
3. Get URL like `https://username.github.io/repo-name/`

### Self-Host

Any static file server works:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

---

## Costs (For Operators Using This App)

### OpenRouter Pricing (Approximate)

| Model | Cost per 1M tokens |
|---|---|
| Claude Sonnet 4.6 | $3 input / $15 output |
| Claude Haiku 4.5 | $0.80 input / $4 output |
| Claude Opus 4.1 | $15 input / $75 output |
| DeepSeek V4 Flash | $0.07 input / $0.28 output |
| Llama 3.3 70B | $0.59 input / $0.79 output |

### Typical Operator Usage

- **Discovery phase (30-60 min):** ~$0.50-$2 (mostly Claude Sonnet)
- **Architecture + Build:** ~$0.30-$1
- **Ongoing operations (monthly):** $5-$50 depending on volume

**Most operators spend $10-$30/month total.**

---

## Security

- ✅ API key stored in localStorage only (never transmitted except to OpenRouter)
- ✅ No backend, no server, no database
- ✅ No analytics, no tracking
- ✅ HTTPS-only (when deployed to https host)
- ⚠️ API key visible to anyone with browser access (use private device)

**For shared devices:** Don't save API key. Re-enter each time.

---

## Troubleshooting

### "API key not set" message
→ Open Settings (⚙️) → Add OpenRouter API key → Test connection

### "Network error" or "API error 401"
→ API key invalid. Check Settings → Test Connection

### "API error 429" (rate limit)
→ Too many requests. Wait a minute, retry.

### App loads but chat doesn't work
→ Check browser console (F12) for errors. Verify API key in Settings.

### Profile not building
→ Profile currently requires manual marking. Future version will auto-extract.

### Files won't download
→ Check browser download permissions. Some mobile browsers block downloads.

---

## Roadmap

### v1.0 (Current)
- ✅ Chat interface
- ✅ OpenRouter integration
- ✅ Profile builder
- ✅ File generator
- ✅ Templates browser
- ✅ Troubleshooting

### v1.1 (Next)
- Auto profile extraction from agent responses
- Voice scoring on outputs
- Edit history tracking
- Multi-language support

### v2.0 (Future)
- Backend with persistent storage
- Team collaboration
- Voice training (upload sample content)
- Analytics dashboard
- White-label for agencies

---

## For Joe / ITEEK Specifically

### Use Cases

1. **Your own brands:** Apply to remaining ITEEK brands (OffGrid056, Te Oranga, etc.)
2. **External clients:** Offer as service ($2-5k setup + $500/mo support)
3. **License to consultants:** Sell the kit
4. **SaaS product:** Add backend + multi-tenant
5. **Training tool:** Teach consultants how to build LLM OS for clients

### Monetisation Options

**Service:**
- Setup: $2,000-$5,000
- Monthly support: $300-$1,000
- White-glove: $10,000+

**Product (SaaS):**
- Free tier: 1 operator, basic features
- Pro: $49/month, unlimited operators, all templates
- Enterprise: $499/month, white-label, priority support

**License:**
- One-time: $497-$1,997
- Annual: $297-$997/year (includes updates)

---

## Tech Stack

- **Frontend:** Vanilla HTML5 + CSS3 + JavaScript (ES6+)
- **No build step** — Direct browser execution
- **No framework** — Lightweight, fast, portable
- **Storage:** localStorage (5-10MB capacity)
- **API:** OpenRouter (REST)
- **Deployment:** Any static host

---

## File Sizes

| File | Size |
|---|---|
| index.html | ~13 KB |
| styles.css | ~22 KB |
| agent-config.js | ~6 KB |
| templates.js | ~8 KB |
| troubleshoot.js | ~5 KB |
| api.js | ~4 KB |
| profile-builder.js | ~9 KB |
| file-generator.js | ~13 KB |
| app.js | ~25 KB |
| **Total** | **~105 KB** |

Fast loading, no dependencies, runs anywhere.

---

## License

© 2026 Joe Gates / ITEEK AI Solutions
All rights reserved.

For licensing inquiries: joe056@iteek.io

---

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review `TROUBLESHOOTING_PLAYBOOK.md` in agent files
3. Test with different model (cheaper if Claude Opus is slow)
4. Clear local data and retry

---

**Version:** 1.0
**Built:** 4 July 2026
**Status:** Production-ready