# Deploy Research OS (GitHub Pages)

Research OS is a static site — no build step. One-time GitHub setup makes it live at:

**https://iteekdeveloper056.github.io/RESEARCH-OS/research-os/**

## One-time setup (2 minutes)

1. Open **https://github.com/Iteekdeveloper056/RESEARCH-OS/settings/pages**
2. Under **Build and deployment** → **Source**, select **GitHub Actions**
3. Save

The `Deploy GitHub Pages` workflow runs automatically on every push to `main`.

## Verify deployment

1. Go to **https://github.com/Iteekdeveloper056/RESEARCH-OS/actions**
2. Open the latest **Deploy GitHub Pages** run — it should show green ✓
3. Visit the live URL above

## Local use (no deploy needed)

```bash
git clone https://github.com/Iteekdeveloper056/RESEARCH-OS.git
cd RESEARCH-OS
python3 -m http.server 8080
```

Open **http://localhost:8080/research-os/**

## Troubleshooting

| Issue | Fix |
|---|---|
| Pages workflow fails with "Pages not enabled" | Complete step 2 above in repo Settings |
| API calls fail locally | Use `python3 -m http.server` instead of opening the file directly |
| 401 Invalid API key | Settings → paste your [OpenRouter key](https://openrouter.ai/keys) |
| 402 Insufficient credits | Add credits at [openrouter.ai](https://openrouter.ai) |
