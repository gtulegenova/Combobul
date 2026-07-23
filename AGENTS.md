# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Combobul** Playwright + TypeScript E2E test framework. It is a test
runner, not a deployable app — there is **no server/database to boot** and no local
application under test bundled in the repo. Standard install/run commands live in
`README.md` (`npm install`, `npx playwright install`, `npm test`, `npm run test:smoke`,
`npm run test:desktop`, `npm run test:mobile`, `npm run test:list`, `npm run qa:runner`).

Non-obvious notes for running/testing here:

- **Tests need a live target app.** Specs drive a browser against `BASE_URL` (see
  `.env.example`) and expect specific markers on the landing page: role `banner`, role
  `main`, `data-testid="home-title"`, `data-testid="primary-action"`, and a menu button
  whose accessible name matches `/menu|navigation/i` (see `pages/home.page.ts`). With no
  `BASE_URL`, `playwright.config.ts` only prints a warning and navigation tests fail.
- **No target app ships with this repo.** To smoke-verify the framework end-to-end locally,
  serve a minimal static HTML page exposing the markers above and point `BASE_URL` at it,
  e.g. `BASE_URL=http://127.0.0.1:8099 npm run test:smoke`.
- **`desktop-edge` project needs the real Edge (`msedge`) channel**, which
  `npx playwright install` does NOT provide. Running the full suite fails that project.
  Exclude it via the `BROWSERS` env filter (e.g.
  `BROWSERS=desktop-chromium,desktop-firefox,desktop-webkit,mobile-chromium,mobile-webkit`)
  or install Edge separately (`npx playwright install msedge`).
- **No lint step and no build step exist.** There is no ESLint config/dependency (the
  `eslint-disable` comments are inert) and no `build`/`typecheck` npm script. Playwright
  transpiles TS via esbuild at runtime, so tests run without a compile step. A strict
  `npx tsc --noEmit` currently surfaces one pre-existing type nit in `playwright.config.ts`
  (`project.name` is `string | undefined`); it does not affect test execution.
- **Env filters:** `TAGS` (grep by tag, e.g. `@smoke|@mobile`) and `BROWSERS` (select
  Playwright projects) are read in `playwright.config.ts`.
- Browsers install to `~/.cache/ms-playwright`. HTML report is written to
  `playwright-report/`; open it with `npm run report:open`.
