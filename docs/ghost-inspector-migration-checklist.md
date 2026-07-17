# Ghost Inspector to Playwright Migration Checklist

## 1) Source Assessment

- Capture Ghost Inspector test name and business scenario.
- Record related Jira ticket(s), comments, and acceptance criteria.
- Identify whether test is desktop, mobile, or both.

## 2) Command Mapping

- Export or copy Ghost Inspector command sequence.
- Map **every** logical command to a planned `test.step()` block.
- Keep the same scenario depth; do not shorten test behavior.

## 3) Locator Modernization

- Replace brittle selectors with stable locator strategy:
  1. `getByRole`
  2. `getByLabel`
  3. `getByText`
  4. `getByTestId`
- Add missing `data-testid` requests to product/dev when required.

## 4) Assertion Design

- Add assertions after high-risk actions:
  - navigation
  - form submissions
  - async updates
  - success/error message rendering
- Validate both positive and relevant negative states when needed.

## 5) Framework Placement

- Add test under `tests/desktop` or `tests/mobile` by workflow type.
- Extract reusable interactions into page objects (`pages/`).
- Place cross-test setup in fixtures (`fixtures/`) and helpers (`auth/`, `utils/`).

## 6) Tagging and Execution Scope

- Apply baseline tags:
  - `@desktop` or `@mobile`
  - `@smoke` or `@regression`
  - feature tag such as `@feature-profile`
- Ensure tags align with planned CI gating strategy.

## 7) Diagnostics and Reporting

- Confirm Playwright failure artifacts are generated:
  - screenshot
  - video
  - trace
  - HTML report
- Ensure `test.step()` names are readable in report output.

## 8) QA Review Sign-off

- Validate migrated test reads like a manual QA case.
- Compare outcomes against Ghost Inspector baseline behavior.
- Document known gaps or selector debt in Jira comments.
