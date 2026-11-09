# Coffee Chemistry

A Boston café matchmaking demo built by Miya with Lovable: daily check-ins become café and drink recommendations, followed by matches, café relationships, loyalty rewards, and business dashboards.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
npm test
npm run build
```

## Features and architecture

- React 19, TypeScript, TanStack Start, Tailwind CSS 4, shadcn/ui, and Nitro.
- 30 Boston cafés; deterministic recommendation ranking and monetization rules.
- Optional Lovable AI Gateway for preference refinement, recommendation copy, and barista chat.
- Browser localStorage for demo profiles, history, loyalty, and café relationships; no database or authentication.
- `/`, `/cafes`, `/passport`, `/profile`, `/shop`, and `/admin` routes.
- Owner and admin dashboards use seeded demo data, not real merchant accounts or transactions.

## Vercel

The Vite build uses Nitro's `vercel` preset and generates `.vercel/output`. Vercel uses the TanStack Start framework, `npm ci`, and `npm run build`.

The core recommendation demo needs no environment variables. Live AI features require a valid `LOVABLE_API_KEY` configured as a server-side Vercel environment variable. No credentials are included. Without it, recommendations use the existing rule-based fallback and barista chat is unavailable. Deploying the source does not migrate Lovable-managed secrets.

Café ratings, hours, offers, reviews, and business metrics are demo estimates. Six generated café photos are reused. Browser data does not transfer from the Lovable origin to the Vercel origin.

## Migration changes

Replaced the Lovable/Cloudflare Vite wrapper with standard TanStack Start, React, Tailwind, and Nitro plugins; added Vercel configuration and an npm lockfile. Fixed calendar-day handling in demo history across daylight-saving transitions, with a regression test. Original product design and recommendation rules are preserved.

Validation: 49 unit tests pass, including tests run in `America/New_York`; the Vercel production build passes.
