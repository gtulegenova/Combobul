# Playwright Naming Conventions

## Files and Folders

- Test specs: `<feature>.<desktop|mobile>.spec.ts`
  - `login.desktop.spec.ts`
  - `search.mobile.spec.ts`
- Page objects: `<feature>.page.ts`
  - `login.page.ts`
- Fixtures: `<scope>.fixture.ts`
  - `base.fixture.ts`
- Helpers: `<purpose>.helper.ts`
  - `auth.helper.ts`
- Test data builders: `<domain>-data.ts`
  - `order-data.ts`

## Test Titles

Use behavior + expectation phrasing:

`"<persona> can <action> and <expected outcome>"`

Example:

`"Returning customer can apply a promo code and see updated total"`

## Step Titles

Use action-oriented, manual-test-like phrasing:

- `Open checkout page`
- `Fill required shipping fields`
- `Submit order`
- `Validate order confirmation number is displayed`

## Tags

Include tags in `describe` and/or test titles:

- Scope: `@smoke`, `@regression`
- Device: `@desktop`, `@mobile`
- Feature: `@feature-checkout`, `@feature-auth`
- Optional environment: `@staging`, `@prod-safe`
