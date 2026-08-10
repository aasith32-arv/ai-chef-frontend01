# AI Chef — Frontend

Next.js client for **smart-chef-api01**.

## Food discovery

The public `/families` route provides category → dish family → recipe variety discovery. Family
pages use `/families/[slug]`, support cuisine/protein/difficulty/spice filters, and open the existing
`/recipe/[id]` detail experience. Broad search matches families and recipes by name, cuisine,
region, protein, and tags. All new labels use the English, Tamil, and Sinhala message catalog.

## AI Cooking Intelligence

Recipe detail pages now include a Cooking Plan experience alongside the original ingredients and
steps. The plan provides:

- personalized servings, spice, oil, salt, dietary, cookware, and texture controls;
- a stage timeline, temperature/heat guidance, and visual doneness estimates;
- texture, aroma, food transformation, warnings, and “Why this step?” explanations;
- Beginner Mode and optional Cooking Science details;
- ingredient substitutions and conservative troubleshooting;
- a mobile-friendly Cooking Mode with manual progression and independent start, pause, resume,
  reset, extend, and completion timer states.

The frontend uses the existing `NEXT_PUBLIC_API_URL`. No new frontend environment variable is
required.

## Admin Console

Authenticated Admins can open `/admin` from the header. The responsive console provides dashboard
statistics and management pages for recipes, dynamic ingredients, instructions, curated Cooking
Intelligence steps, dish families, categories, users, advertisements, subscriptions, and safe
runtime settings.

The route guard hides Admin screens from ordinary users, while the Flask API remains the security
authority for every request. Recipe edits use the same public recipe records and IDs, so discovery,
scaling, recommendations, favorites, shopping lists, AI fallback plans, and Guided Cooking remain
connected. Create the first Admin with the backend's interactive `flask create-admin` command; do
not add credentials or server secrets to this frontend.

## Run

1. Start API:

```bash
cd ../smart-chef-api01
.\.venv\Scripts\python.exe run.py
```

2. Select an AI provider and add its matching server-side key (for AI quantities + cooking steps):

In `smart-chef-api01/.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-real-key
GEMINI_MODEL=gemini-flash-latest
```

Or use OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-real-key
OPENAI_MODEL=gpt-4o-mini
```

Restart the API after saving.

3. Start this app:

```bash
cd ../ai-chef-frontend01
npm run dev
```

Pricing is available at `/pricing`. Checkout and billing-portal sessions are created by the Flask
API, so Stripe secret keys must never be added to the frontend environment.

### Vercel + Railway authentication

Production browser requests use the same-origin `/api/backend/v1/*` proxy to prevent third-party
cookie blocking between Vercel and Railway. Configure these Vercel environment variables and
redeploy:

```env
BACKEND_API_URL=https://your-api.up.railway.app
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/api/v1
```

`BACKEND_API_URL` is server-only. The public URL remains useful for local development and build-time
fallback, but production browser requests are always sent through the Vercel proxy.

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. **Discover** — category → family → authentic variety → existing recipe detail
2. **Calculate** — pick a variety → set people → get quantities + cooking steps (`POST /ai/plan`, falls back to local `/calculate`)
3. **Suggest** — enter pantry ingredients → AI dish ideas (`POST /ai/suggest`)
4. **Saved** — favorites (sign in required)

`NEXT_PUBLIC_API_URL` defaults to `http://127.0.0.1:5000`.
