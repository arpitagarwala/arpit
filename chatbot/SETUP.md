# Arpit's RAG Chatbot — Setup Guide

A real AI chatbot powered by **OpenRouter (free Nemotron model) + RAG** that runs **24/7 for free** on Cloudflare Workers.

---

## Quick Setup (~10 minutes)

### Step 1: Get OpenRouter API Key (FREE)

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign in / create account
3. Create an API key
4. Copy it — you'll need it in Step 3

> The Worker uses `nvidia/llama-3.3-nemotron-super-49b-v1:free` — a free model with no rate limits beyond OpenRouter's fair usage policy.

---

### Step 2: Create Cloudflare Account (FREE)

1. Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Create a free account (no credit card needed)

---

### Step 3: Deploy the Worker

Open a terminal in the `chatbot/` folder:

```bash
# Install dependencies
npm install

# Login to Cloudflare (opens browser)
npx wrangler login

# Create the KV namespace
npx wrangler kv namespace create "KNOWLEDGE_BASE"
# ↑ Copy the output ID

npx wrangler kv namespace create "KNOWLEDGE_BASE" --preview
# ↑ Copy the preview ID
```

Open `wrangler.toml` and paste the IDs:
```toml
id = "PASTE_ID_HERE"
preview_id = "PASTE_PREVIEW_ID_HERE"
```

Then deploy:
```bash
# Set your OpenRouter API key as a secret
npx wrangler secret put OPENROUTER_API_KEY
# ↑ Paste your key when prompted

# Deploy
npx wrangler deploy
```

You'll get a URL like: `https://arpit-chatbot.YOUR_SUB.workers.dev`

---

### Step 4: Add Training Data & Upload

Your training files go in `chatbot/data/` (`.txt`, `.md`, `.csv`).
A sample `arpit-portfolio.txt` is already included.

```bash
# Build the knowledge base (no API needed — runs locally)
node ingest.js

# Upload to Cloudflare KV
npx wrangler kv key put --binding=KNOWLEDGE_BASE "chunks" --path=knowledge-base.json
```

---

### Step 5: Update Frontend URL

Open `ai-assistant.html`, find this line (~line 154):
```javascript
const WORKER_URL = 'https://arpit-chatbot.YOUR_SUBDOMAIN.workers.dev';
```
Replace with your actual Worker URL from Step 3.

---

## Done! 🎉

Open `ai-assistant.html` and start chatting!

## Updating Data

When you add files to `data/`:
```bash
node ingest.js
npx wrangler kv key put --binding=KNOWLEDGE_BASE "chunks" --path=knowledge-base.json
```

## Changing the AI Model

To use a different free OpenRouter model, edit `worker.js` line 5:
```javascript
const MODEL = 'nvidia/llama-3.3-nemotron-super-49b-v1:free';
```
Browse free models at: [openrouter.ai/models?pricing=free](https://openrouter.ai/models?pricing=free)
