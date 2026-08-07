# AI Chef — Frontend

Next.js client for **smart-chef-api**.

## Run

1. Start API:

```bash
cd ../smart-chef-api
.\.venv\Scripts\python.exe run.py
```

2. Add your OpenAI key (for AI quantities + cooking steps):

In `smart-chef-api/.env`:

```
OPENAI_API_KEY=sk-your-real-key
OPENAI_MODEL=gpt-4o-mini
```

Restart the API after saving.

3. Start this app:

```bash
cd ../frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. **Calculate** — pick Biryani / Kottu / Fried Rice (or type any dish) → set people → get quantities + cook steps (`POST /ai/plan`, falls back to local `/calculate`)
2. **Suggest** — enter pantry ingredients → AI dish ideas (`POST /ai/suggest`)
3. **Saved** — favorites (sign in required)

`NEXT_PUBLIC_API_URL` defaults to `http://127.0.0.1:5000`.
