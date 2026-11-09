<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Recommendations
- Café ranking rules live as pure functions in src/lib/reco/engine.ts (tested in engine.test.ts); AI only adjusts needs and writes card copy in ai.server.ts, so scoring stays deterministic and testable.
- Monetization rules (promoted boost, paid-match fee, active offers) are pure functions in src/lib/reco/engine.ts so they are unit-tested; the paid-match ledger and demo-time override live in browser storage until accounts exist.
- The home route is a stage machine (onboarding → check-in → brewing → deck) with UI pieces in src/components/coffee/; keep one route so the QR demo stays a single URL.
- Home-screen engagement rules (rating prompt, deals, passport stamps/badges) are pure functions in src/lib/reco/passport.ts with tests; demo history is seeded once per browser from src/lib/reco/seed.ts.
- Business dashboards (/shop, /admin) compute ROI and unit economics with pure functions in src/lib/biz/economics.ts (tested) over deterministic seed data in src/lib/biz/seed.ts, so judge-facing numbers are stable and reproducible.
- Loyalty rules (Beans, stages, weekly streak, challenges, friend boost) are pure functions in src/lib/reco/loyalty.ts with tests; state is one browser-storage object seeded by demoLoyalty().
