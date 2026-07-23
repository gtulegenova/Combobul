# Combobul - Playwright QA Framework (Initial Scaffold)

This repository now includes an initial Playwright + TypeScript automation framework designed for:

- Desktop and mobile-style workflows
- Cross-browser coverage with Playwright projects
- QA-readable tests that mirror manual test-case flow through `test.step()`
- Migration of Ghost Inspector logic into maintainable Playwright test suites

## Current Framework Structure

```text
.
├── auth/
│   ├── auth.helper.ts
│   └── storage-state.helper.ts
├── fixtures/
│   └── base.fixture.ts
├── pages/
│   └── home.page.ts
├── scripts/
│   └── qa-runner.ts
├── tests/
│   ├── desktop/
│   │   └── smoke/
│   │       └── home.desktop.spec.ts
│   └── mobile/
│       └── smoke/
│           └── home.mobile.spec.ts
├── utils/
│   ├── env.ts
│   └── test-data.ts
├── .env.example
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

3. Create environment file:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with the correct application URL and QA credentials (never commit secrets).
   - If your login flow uses MFA, either set `QA_MFA_CODE` before a run or configure `QA_MFA_INBOX_URL` to auto-read the latest code.

## Run Commands

- Run all tests:

  ```bash
  npm test
  ```

- Run smoke tests:

  ```bash
  npm run test:smoke
  ```

- Run only desktop tests:

  ```bash
  npm run test:desktop
  ```

- Run only mobile tests:

  ```bash
  npm run test:mobile
  ```

- List all tests:

  ```bash
  npm run test:list
  ```

- Open HTML report:

  ```bash
  npm run report:open
  ```

- Run Ghost Inspector migration candidate (Add/Edit/Duplicate/Archive Both):

  ```bash
  npx playwright test tests/desktop/regression/target-audience-both.desktop.spec.ts --project=desktop-chromium
  ```

## Playwright Project Coverage

Defined in `playwright.config.ts`:

- `desktop-chromium`
- `desktop-firefox`
- `desktop-webkit` (Safari-like)
- `desktop-edge` (Edge channel where available)
- `mobile-chromium` (Pixel profile)
- `mobile-webkit` (iPhone/Safari-like profile)

Environment filters:

- `TAGS` for tag grep (for example: `@smoke|@mobile`)
- `BROWSERS` for explicit project selection (for example: `desktop-chromium,mobile-webkit`)

## Test Design Standards (QA-first)

1. Every user action should be wrapped in `test.step()`.
2. Keep test names behavior-focused (what user does + what should happen).
3. Prefer stable locators:
   - `getByRole`
   - `getByLabel`
   - `getByText`
   - `getByTestId`
4. Add assertions after critical actions (navigation, save, submit, transitions).
5. Keep one intent per test; keep reusable UI behavior in page objects.

## Recommended Naming Conventions

- Spec files: `<feature>.<desktop|mobile>.spec.ts`
  - Example: `checkout.desktop.spec.ts`
- Page objects: `<feature>.page.ts`
  - Example: `checkout.page.ts`
- Fixtures: `<scope>.fixture.ts`
  - Example: `auth.fixture.ts`
- Helpers: `<purpose>.helper.ts`
  - Example: `auth.helper.ts`
- Tags in describe/title:
  - `@smoke`
  - `@regression`
  - `@desktop`
  - `@mobile`
  - feature tags such as `@feature-home`, `@feature-checkout`

## Ghost Inspector Migration Checklist (Recommended)

Use this process for each Ghost Inspector test migrated:

1. **Capture source intent**
   - Record Ghost Inspector test name, original purpose, and business risk.
2. **Map every command**
   - Convert each Ghost Inspector command to one Playwright `test.step()` block.
3. **Preserve workflow depth**
   - Do not reduce steps or remove validations only to make migration faster.
4. **Select stable locators**
   - Replace brittle selectors with role/label/text/test-id locators.
5. **Add assertions**
   - Add assertions after critical actions and page transitions.
6. **Classify execution scope**
   - Tag test as `@smoke` or `@regression`, plus `@desktop`/`@mobile`.
7. **Place in correct structure**
   - Put test in `tests/desktop/...` or `tests/mobile/...` by workflow type.
8. **Extract reusable logic**
   - Move repeated UI actions into page objects/fixtures/helpers.
9. **Validate artifacts**
   - Confirm screenshots/video/trace are available for failure diagnostics.
10. **Review with QA**
    - Verify migrated test still reads like a manual QA scenario.

## Prototype Local QA Runner

The file `scripts/qa-runner.ts` is a starting point for an internal CLI runner.

Example usage:

```bash
npm run qa:runner -- --list
npm run qa:runner -- --project desktop-chromium --tags "@smoke|@desktop"
npm run qa:runner -- --project mobile-webkit --open-report
```

The runner currently supports:

- listing tests
- project filtering
- tag/name filtering
- opening report after execution

It can be expanded into a UI wrapper later (web or desktop) without changing test design.
