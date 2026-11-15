# Playwright Automation Framework (BDD)

Real, runnable **Playwright Test + playwright-bdd** (TypeScript) boilerplate built
for interview prep for **Senior QA Automation Architect, Apple Store Online**
(see `../Interview_Prep/Apple_QA_Architect/`). Runs **read-only** against live
[apple.com](https://www.apple.com) (switched from saucedemo.com on 2026-11-14).

> **Scope / risk.** Apple's terms of use prohibit robots and scraping, and the
> site has bot detection. This suite is limited to public pages and
> low-volume browsing: no sign-in, no add-to-bag or checkout, 1 worker, no
> retries, CI on manual trigger only. See `CLAUDE.md` for the full rules. The
> previous saucedemo scenarios are in git history (commit `55c19b4`).

## Setup already done
- `npm install` (installs `@playwright/test` pinned to **1.55.1** — latest, 1.65,
  dropped macOS Ventura/mac13 support on this machine; 1.55.1 is the lowest
  version that both runs here and isn't caught by the browser-download
  SSL-verification advisory GHSA-7mvr-c777-76hp, fixed in 1.55.1+. Also installs
  `playwright-bdd` 9.2.1.)
- `npx playwright install chromium`
- `npx tsc --noEmit` — should report no errors (`tsconfig.json` needs
  `"types": ["node"]` since this TypeScript version, 7.0.2, no longer
  auto-includes `@types/node` without it, and has no explicit
  `moduleResolution` since `"node"`/`"node10"` is deprecated/removed here)

To add Firefox/WebKit: `npx playwright install firefox webkit`, then uncomment
the matching `projects` entries in `playwright.config.ts`.

## Run it
```
npm test              # bddgen (compiles .feature -> specs) then playwright test
npm run test:headed   # same, with a visible browser
npm run test:ui       # same, Playwright's interactive UI mode
npm run generate      # just run bddgen on its own (e.g. to inspect .features-gen/)
npm run report        # open the last HTML report
```
Every `test*` script runs `bddgen` first — Gherkin `.feature` files aren't
runnable directly, they get compiled into real Playwright spec files in
`.features-gen/` (gitignored) before Playwright's runner ever sees them.

## Structure
```
features/     Gherkin .feature files — the BDD scenarios, business-readable
steps/        Given/When/Then step definitions (createBdd) implementing each
              feature's steps, plus tag-scoped Before/After hooks
pages/        Page Object Model classes (BasePage with the shared global nav +
              HomePage, ProductListingPage, BagPage)
fixtures/     pages.fixture.ts — extends playwright-bdd's own `test` with the
              page objects as injected fixtures (the DI mechanism)
utils/        Framework-level helpers (mockRoute.ts — page.route() mock factory)
.features-gen/  Generated output of bddgen — gitignored, never hand-edited
```

See `../Interview_Prep/Apple_QA_Architect/` for the rest of the weekend's general
coding/verbal prep (this folder only holds the real, working Playwright code).

## What each feature demonstrates
- `features/global_navigation.feature` + `steps/navigation.steps.ts` — a
  Scenario Outline over the shared `#globalnav` (Mac, iPhone): the nav is
  modelled once on `BasePage` because every apple.com page has it.
- `features/bag.feature` + `steps/bag.steps.ts` — new-visitor empty-bag check
  (read-only; never adds items).
- `features/product_content_validation.feature` + `steps/product.steps.ts`
  — the actual shape of the job's "content validation" mandate, on the real
  Apple Store: scrape every product tile on `/mac/` and assert a non-empty name
  and a well-formed `From $X` starting price. Point the same `getAllProducts()`
  scrape at two surfaces (two viewports, two locales,
  etc.) and diff the results to get the cross-platform check from
  `../Interview_Prep/Apple_QA_Architect/08_content_validation_diff.py`. Tagged
  `@content-validation`, which is what the tag-scoped hooks in
  `steps/hooks.steps.ts` key off of.
- `features/mock_route.feature` + `steps/mock_route.steps.ts` — `page.route()`
  component mocking, self-contained (no dependency on any real site's API
  shape) so it's a clean 2-minute interview walkthrough.
- `steps/hooks.steps.ts` — `Before`/`After` hooks scoped to the
  `@content-validation` tag via `createBdd(test).Before({ tags: '...' }, fn)`,
  not run for every scenario. Real use: data-integrity-specific logging/
  alerting kept separate from hooks that should fire for everything.

## Talking points this maps to
- **BDD with Playwright** — Gherkin scenarios compile into native Playwright
  Test specs (not a separate Cucumber runner), so you keep fixtures, parallel
  execution, tracing, and reporting while gaining business-readable specs and
  tag-based scenario/hook filtering.
- **POM** (`pages/`) — locators built lazily in page object constructors, no
  test logic baked into page classes.
- **Dependency injection via fixtures** (`fixtures/pages.fixture.ts`) — step
  definitions declare what they need; construction lives in one place.
- **Component mocking** (`utils/mockRoute.ts`, `mock_route.feature`) — isolate
  a UI assertion from a real backend.
- **Tag-scoped hooks** (`steps/hooks.steps.ts`) — different setup/teardown
  behavior for different categories of scenario without branching inside a
  shared hook.
- **Resilient locators on a real site** — Apple's hashed CSS-module classes
  force prefix/data-attribute/role selectors and a `visible: true` filter
  (the gallery renders hidden duplicate tiles), a realistic talking point.
- **Content validation at scale** — `ProductListingPage.getAllProducts()` is the
  primitive; the cross-platform diff logic already exists in
  `Interview_Prep/Apple_QA_Architect/08_content_validation_diff.py`.
- **CI integration** (`.github/workflows/playwright.yml`) — not wired to a real
  remote yet (this folder isn't a git repo), but shows the pipeline shape:
  install, `bddgen`, run, upload the HTML report as an artifact.

## Playwright MCP (agentic layer)
`@playwright/mcp` is installed as a devDependency and registered as an MCP
server in this folder's `.mcp.json` (open Claude Code with `plawright_bdd/` as
the project root to load it). Once a client loads
that config, an LLM agent gets real browser-control tools (navigate, click,
snapshot the accessibility tree, extract text) instead of a fixed script —
this is the mechanism behind the showcase project in
`../Interview_Prep/Apple_QA_Architect/00_playwright_mcp_showcase_project.md`.

Config (`.mcp.json`):
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y", "@playwright/mcp@latest",
        "--isolated",
        "--allowed-origins", "https://www.apple.com;https://apple.com",
        "--output-dir", ".../Playwright_Automation_Framework/.mcp-output",
        "--save-session"
      ]
    }
  }
}
```
- `--isolated` — in-memory browser profile, nothing persisted to disk between
  sessions (no lingering apple.com cookies/state).
- `--allowed-origins` — restricts the browser to apple.com. **Read the
  fine print**: Playwright MCP's own docs say this is *not* a security
  boundary and doesn't affect redirects — treat it as an intent guard/defense
  in depth, not a guarantee the agent can never navigate elsewhere.
- `--save-session` + `--output-dir .mcp-output` (gitignored) — every MCP
  session gets saved here; this is the actual "capture the tool-call trace"
  artifact the showcase doc calls out as the interview deliverable.

`npm run mcp` runs the same server standalone (useful to sanity-check it boots,
or to point a different MCP client at it manually) — restart/reload your MCP
client to pick up config changes; Claude Code does not hot-reload `.mcp.json`.

## Next step (stretch goal)
Use the MCP tools above to actually build the agentic content-validation demo
end to end and save a transcript — see
`../Interview_Prep/Apple_QA_Architect/00_playwright_mcp_showcase_project.md`
for the walkthrough and the interview talking points it sets up.
