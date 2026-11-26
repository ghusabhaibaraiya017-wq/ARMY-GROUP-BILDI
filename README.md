# 🇮🇳 ARMY GROUP BILDI — App / PWA

Gujarati-first responsive Progressive Web App for ARMY GROUP BILDI.

## Stack
React, TypeScript, Vite, Tailwind CSS, Supabase JS and PWA support.

## Local setup
1. Install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Run `npm run dev`.

Only the Supabase publishable key belongs in browser code. Never use a service-role or secret key in this app.

## Deployment
GitHub Actions Pages deployment is configured in `.github/workflows/deploy.yml`. Add repository Actions variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` before enabling deployment.

## Languages
The language selector includes the 21 requested Indian languages. Translations are read from `post_translations` in the next implementation phase; currently the feed displays Gujarati source content.
