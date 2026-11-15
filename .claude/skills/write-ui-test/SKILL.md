---
name: write-ui-test
description: Write a new Playwright-BDD UI test for this project (plawright_bdd) from a plain-English scenario. Explores the real saucedemo.com flow live via the Playwright MCP server to confirm actual selectors/behavior before writing the .feature file and step definitions, instead of guessing or trusting memory. Runs the new scenario twice to confirm it isn't flaky before finishing. Use when asked to "add a UI test for X", "write a BDD test for Y flow", or similar, for this project.
---

# Write UI Test (Playwright BDD)

Turns a plain-English scenario into a working Gherkin `.feature` + step-definition
pair in this repo, verified live against saucedemo.com rather than written from
assumption. The point of this skill is the verification step — don't skip it even
when the flow "obviously" matches something already in `pages/`.

## Inputs
A scenario description (e.g. "user adds two items to the cart, removes one, cart
badge should show 1"). If the ask is vague ("write a test for checkout"), ask one
clarifying question about the specific expected outcome before proceeding — don't
guess what "should work" means.

## Workflow

1. **Read before writing.** Check `features/*.feature` and `steps/*.steps.ts` for
   existing step phrasing that already covers part of the scenario (e.g. "I am
   logged in as {string}", "I am on the login page"). Reuse exact existing step
   text wherever the scenario's wording matches — don't invent a near-duplicate
   phrasing for something that already exists. Check `pages/*.page.ts` for
   locators/methods that already model the elements involved.

2. **Confirm the flow live, don't recall it.** Before writing a single line of
   Gherkin or step code, drive the actual scenario through the Playwright MCP
   server (tools appear as `mcp__playwright__browser_*` — navigate, snapshot,
   click, type, etc.; load the schema via ToolSearch if not already available).
   Navigate saucedemo.com, perform the scenario's actions, and capture:
   - the real selectors/test-ids involved (prefer what's actually in the DOM
     over what a page object's existing comments claim — if a page object is
     stale, note it, don't silently trust it)
   - the real resulting state/error text, verbatim (e.g. don't assume an error
     message's wording — read it from the live snapshot)
   If MCP tools aren't available in this session (server not loaded), say so
   explicitly and ask whether to proceed on existing page-object code as a
   best-effort fallback, clearly flagged as unverified, or wait for the MCP
   server to be loaded.

3. **Write the `.feature` file.** Add a `Scenario` (or `Scenario Outline` if the
   ask has multiple example rows) to the relevant existing feature file, or a new
   one under `features/` if it's a genuinely new area. Match the existing style:
   `Given`/`When`/`Then`, tag with something like `@content-validation` only if
   it's genuinely in that category, don't invent new tags without reason.

4. **Write/extend step definitions.** Add new `Given`/`When`/`Then` steps in the
   most thematically relevant `steps/*.steps.ts` file (or a new file if the
   scenario doesn't fit an existing theme) via `createBdd(test)`, importing `test`
   from `../fixtures/pages.fixture`. If the scenario touches page elements with no
   existing Page Object method, add the method to the relevant `pages/*.page.ts`
   class using the selectors confirmed in step 2 — don't put raw selectors
   directly in step files; that breaks the POM convention this project uses
   everywhere else.

5. **Run it twice before calling it done.** Run `npx bddgen && npx playwright
   test <path to the new/changed feature>` **twice, as two separate full runs**
   (not relying on Playwright's built-in retry — that masks exactly the
   flakiness this is checking for). Both runs must pass. If either run fails or
   the two runs disagree, treat that as a real finding: debug why (timing,
   selector too broad, test isolation issue), fix it, and run twice again from
   scratch. Don't report success after only one green run.

6. **Report concisely.** State which `.feature` scenario(s) and step file(s)
   were added/changed, confirm both verification runs passed, and flag anything
   observed live in step 2 that contradicted an existing page object or comment
   (e.g. "the locked-out error text is actually X, not what was assumed
   elsewhere") — that's a real signal worth surfacing, not just a side note.

## Guardrails
- Stay within the MCP server's configured scope (saucedemo.com) — this project
  deliberately avoids pointing automation at any real production site; don't
  navigate elsewhere during exploration even if it would be "faster to check."
- Don't modify unrelated scenarios/specs while adding a new one.
- Keep step definitions thin — they call page-object methods, they don't contain
  assertions-worth-of-logic inline beyond what the existing steps already do.
