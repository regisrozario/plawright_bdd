---
name: write-ui-test
description: Write a new Playwright-BDD UI test for this project (plawright_bdd) from a plain-English scenario. Explores the real apple.com flow live (read-only) via the Playwright MCP server to confirm actual selectors/behavior before writing the .feature file and step definitions, instead of guessing or trusting memory. Runs the new scenario twice to confirm it isn't flaky, then (only if fully covered and green) commits on a new branch, pushes and opens a PR automatically. Use when asked to "add a UI test for X", "write a BDD test for Y flow", or similar, for this project.
---

# Write UI Test (Playwright BDD)

Turns a plain-English scenario into a working Gherkin `.feature` + step-definition
pair in this repo, verified live against apple.com rather than written from
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
   Navigate apple.com, perform the scenario's actions (read-only — see
   Guardrails), and capture:
   - the real selectors involved — Apple's class names are hashed CSS modules
     (e.g. `ProductTile_pricing__mJzcd`), so prefer roles, `data-*` attributes
     and `[class*="Prefix_"]` matches over full class names (prefer what's actually in the DOM
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
   scratch. Don't report success after only one green run. (Two runs is the
   ceiling too — this is a production site, don't loop it.)

6. **Report concisely.** State which `.feature` scenario(s) and step file(s)
   were added/changed, confirm both verification runs passed, and flag anything
   observed live in step 2 that contradicted an existing page object or comment
   (e.g. "the locked-out error text is actually X, not what was assumed
   elsewhere") — that's a real signal worth surfacing, not just a side note.

7. **Open a PR automatically — only if everything is green.** The user has
   standing-authorised this skill to commit, push and open a PR without asking,
   but **only** when all of these hold:
   - every step of the requested scenario is in the `.feature` file — nothing
     dropped, stubbed or swapped for something else. If scope was trimmed (e.g.
     a guardrail forced stopping before "add to bag"), the user must have
     explicitly agreed to the trimmed version earlier in the conversation;
   - `npx tsc --noEmit` passes;
   - both verification runs in step 5 passed, from scratch, after the last code
     change;
   - no 403 / bot-challenge was hit.
   If any of these fails, don't commit; report what's missing instead.

   When they all hold:
   1. Branch off the current default branch (never commit to `main` directly):
      `git switch -c <short-kebab-name-for-the-scenario>`.
   2. Stage **only** the files this skill added/changed (`features/`, `steps/`,
      `pages/`, `fixtures/` as relevant) by explicit path — never `git add -A`;
      leave any unrelated working-tree changes alone and mention them.
   3. Commit with a short message naming the scenario (use the user's wording if
      they gave one), ending with the attribution line from the system prompt.
   4. `git push -u origin <branch>`.
   5. If `gh` is installed and authenticated (`gh auth status`), run
      `gh pr create --base main --title ... --body ...` and report the PR URL.
      Otherwise, say plainly that the PR was **not** created, give the
      `https://github.com/<owner>/<repo>/pull/new/<branch>` link printed by the
      push, and paste a ready-to-use title and body.
   PR body: Summary (scenario in one or two sentences, plus any read-only
   trimming), Changes (files), Notes (live findings from step 6), and a Test
   plan checklist (`tsc`, two separate full runs passed, no bot challenge).
   Never merge the PR, force-push, or push to `main`.

## Guardrails
- Stay within the MCP server's configured scope (apple.com) and the read-only
  rules in `CLAUDE.md`: public pages only, no sign-in, never add to bag, check
  out or submit forms, keep exploration to a handful of page loads. If a
  requested scenario needs any of those, say so and stop; don't write it.
- If you hit a 403 or a bot-challenge page, stop and report it; don't retry
  harder or try to evade detection.
- Don't modify unrelated scenarios/specs while adding a new one.
- Keep step definitions thin — they call page-object methods, they don't contain
  assertions-worth-of-logic inline beyond what the existing steps already do.
