# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Playwright Test + playwright-bdd (TypeScript) UI automation framework, BDD-style
(Gherkin `.feature` files + step definitions), demoed against
[saucedemo.com](https://www.saucedemo.com) — a public Sauce Labs storefront built
specifically for automation practice. This target is deliberate, not incidental:
tests here must not be pointed at a real production site (e.g. Apple's actual
store) without that decision being explicitly re-opened — scripted/automated
traffic against a live e-commerce platform the user doesn't control risks ToS
violations and bot-detection blocking.

## Commands

```
npm test              # bddgen then playwright test (all scenarios, headed Chromium, records video)
npm run test:headed   # same, explicit --headed
npm run test:ui       # same, Playwright's interactive UI mode
npm run test:chromium # same, --project=chromium explicitly
npm run generate       # just bddgen, no test run (inspect .features-gen/ output)
npm run report         # open the last HTML report
npx tsc --noEmit       # typecheck
npm run mcp            # boot the Playwright MCP server standalone (sanity check / manual client)
```

**Every `test*` script runs `bddgen` first.** Gherkin `.feature` files are not
directly runnable — `bddgen` compiles them into real Playwright spec files under
`.features-gen/` (gitignored, never hand-edited) before Playwright's runner sees
them. Running `npx playwright test` directly without `bddgen` first will run
against a stale or empty `.features-gen/`.

To run a single scenario: `npx bddgen && npx playwright test features/login` (or
any path/substring `playwright test` normally accepts — it matches against the
generated spec paths under `.features-gen/`, not the `.feature` files directly).

To add Firefox/WebKit: `npx playwright install firefox webkit`, then uncomment
the corresponding `projects` entries in `playwright.config.ts` (currently
Chromium-only, headed, with video recording on).

## Architecture

Request flow for a single scenario, across the files that have to agree with each
other for anything to work:

```
features/*.feature  (Gherkin: Given/When/Then, human-readable)
        |  bddgen compiles this using the step defs below
        v
.features-gen/**     (generated Playwright spec files — never edit directly)
        |  imports `test` from fixtures/pages.fixture.ts
        v
steps/*.steps.ts     (createBdd(test).Given/When/Then — glue between Gherkin text
                       and Page Object calls)
        |  destructures injected page-object fixtures
        v
fixtures/pages.fixture.ts  (extends playwright-bdd's `test`, injects loginPage/
                            inventoryPage/cartPage as fixtures — the DI layer)
        |  constructs
        v
pages/*.page.ts      (Page Object Model: BasePage + LoginPage, InventoryPage,
                       CartPage — locators + page interactions, no assertions)
```

**Non-obvious constraint**: `fixtures/pages.fixture.ts` must extend `test`
imported from `playwright-bdd`, not from `@playwright/test` directly —
`createBdd()` throws `"createBdd() should use 'test' extended from
playwright-bdd"` otherwise. This is specific to playwright-bdd 9.x; its own
README/older docs describe an `importTestFrom` config option that is now
deprecated in favor of this extend-from-playwright-bdd pattern plus including
the fixtures file in `defineBddConfig()`'s `steps` glob (see
`playwright.config.ts`) so `bddgen` discovers the fixture file's exported `test`
automatically.

**Step-arity check**: a Cucumber-expression placeholder like `{string}` in a
`.feature` file requires a matching parameter in the step definition function
even if the step body never reads it — `bddgen` fails generation otherwise
(`Function has N arguments, but expected N+1`). Don't drop unused placeholder
params from step signatures.

**Tag-scoped hooks**: `steps/hooks.steps.ts` has `Before`/`After` hooks scoped
via `createBdd(test).Before({ tags: '@content-validation' }, fn)` — these only
fire for scenarios carrying that tag (currently one scenario in
`features/inventory_content_validation.feature`), not globally. Use this pattern
for setup/teardown that's specific to a category of scenario rather than adding
branches to a hook that runs for everything.

**TypeScript config quirks** (this environment has unusually new `typescript`
and `@types/node` versions pinned): `tsconfig.json` has no explicit
`moduleResolution` (the installed TS version removed/deprecated `"node"`/
`"node10"`) and requires `"types": ["node"]` explicitly (this TS version stopped
auto-including `@types/node` without it).

**Playwright version pin**: `@playwright/test` is pinned to `1.55.1`, not latest.
Latest (1.65 at time of writing) dropped macOS Ventura support on the dev
machine; versions below 1.55.1 are caught by a browser-download SSL-verification
advisory (GHSA-7mvr-c777-76hp). 1.55.1 is the version that satisfies both
constraints — don't bump without re-checking both.

## Playwright MCP integration

`@playwright/mcp` is a devDependency here, but the MCP server registration lives
one level up, at `../.mcp.json` (the Claude Code project root), not inside this
folder — that's where Claude Code (or any MCP client) reads project-scoped MCP
servers from. It's configured with `--isolated`, `--allowed-origins` scoped to
saucedemo.com, and `--save-session --output-dir .mcp-output` (gitignored) so
every agent-driven session leaves a transcript. **`--allowed-origins` is
explicitly documented by Playwright MCP as not a security boundary** (doesn't
affect redirects, isn't strictly enforced) — treat it as an intent guard
consistent with the saucedemo-only decision above, not a guarantee.

## Adding new UI tests

Use the `write-ui-test` skill (`.claude/skills/write-ui-test/SKILL.md`) rather
than writing `.feature`/step files ad hoc. It encodes the project's conventions
(reuse existing step phrasing, put locators in `pages/*.page.ts` not inline in
steps, verify the real flow live via Playwright MCP before writing anything
instead of guessing selectors, run the new scenario twice as separate full runs
before declaring it done — not relying on Playwright's built-in retry, which
would mask the flakiness that check exists to catch).
