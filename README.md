# VapeTime Performance Bonus

Dashboard that reads live from Google Sheets. Static frontend + two Vercel serverless functions (`/api/login`, `/api/data`).
Your sheet ID, API key and password stay on the server (Vercel environment variables), never in the browser or in GitHub.

## Sheet layout (keep exactly like the Excel)
Tab 1 `Targets vs acheived`: month headers (e.g. NOVEMBER - 2025) above 5 columns each: Targets, Bonus Value, Projected Sales, Final Sales, Bonus Disbursed. The row starting with `SNO` is the first store row.
Tab 2 `MM wise bonus distribution`: header row starts with `MM` followed by month dates; one row per store, in the SAME order as tab 1.
New months and stores are picked up automatically. If you rename a tab, set TARGETS_TAB / BONUS_TAB.

## Environment variables
See `.env.example`. Set them in Vercel > Project > Settings > Environment Variables, then redeploy.

## Run locally
`npm i -g vercel` then copy `.env.example` to `.env`, fill it in, and run `vercel dev`.

## Quick local preview (no Vercel tools needed)
Requires Node 20.6+. Copy `.env.example` to `.env`, fill it in, then run `npm run dev` and open http://localhost:3000.
Do not double-click index.html: the login and data need the /api functions.
