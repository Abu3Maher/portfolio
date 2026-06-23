---
name: unit-testing
description: Write unit tests for the Sufra dashboard project using Vitest and TypeScript. Use this skill whenever the user asks to add, write, or run unit tests.
---

## Project test setup

- **Runner**: Vitest (`vitest.config.ts` at dashboard root)
- **Environment**: `node` — no DOM, no Vue, no Nuxt runtime
- **Test files**: `tests/**/*.test.ts`
- **Globals**: disabled — always import `describe`, `it`, `expect` from `'vitest'`
- **Run**: `pnpm test` or `npx vitest run` from `sufra-dashboard/`

## Core pattern: extract pure helpers, test those

API handlers and composables depend on Nuxt context (`useI18n`, `$larafetch`, `getStoreContext`, `serverSupabaseServiceRole`) which cannot run in a plain node environment. **Never mock these.** Instead:

1. Extract the pure business logic into a `*.helpers.ts` file alongside the handler/composable
2. Export only pure functions (no framework imports)
3. Import and test those functions directly

**Example** — existing pattern in `app/composables/useSalesReport.helpers.ts` tested by `tests/sales-report.test.ts`.

## File conventions

```
tests/
  <domain>/
    <concern>.test.ts     # e.g. tests/customers/debt-computation.test.ts
  sales-report.test.ts    # existing reference
```

Helper files live next to their source:
```
app/composables/useSalesReport.helpers.ts   ← pure functions
server/api/dashboard/customers/customers.helpers.ts  ← extracted from handlers
```

## Test file structure

```typescript
import { describe, expect, it } from 'vitest'
import { myPureFunction } from '../../path/to/helpers'

// ─── fixtures ───────────────────────────────────────────────────────────────

function makeXxx(overrides: Partial<Xxx> = {}): Xxx {
  return { field: 'default', ...overrides }
}

// ─── describe block ──────────────────────────────────────────────────────────

describe('myPureFunction — <what it computes>', () => {
  it('<specific behaviour in plain English>', () => {
    const result = myPureFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Writing good tests

**Test names**: plain English sentence — what the function does, not how. "sums revenue across non-cancelled orders" not "test revenue sum".

**One assertion per test** unless the assertions together form a single logical claim (e.g. checking both `length` and `content` of the same array).

**Cover**:
- Happy path (typical valid input)
- Empty / zero input
- Boundary values (min, max, exactly-at-limit)
- Edge cases specific to the domain (e.g. debt = 0 should not appear in owes_me or i_owe filter)

**Avoid**:
- Testing framework behaviour (Zod already tests its own parsing)
- Reproducing the implementation in the test
- `beforeEach` setup that makes individual tests unreadable in isolation

## Zod schema tests

Export schemas from their handler file:
```typescript
// in handler file
export const CreateCustomerSchema = z.object({ ... })
```

Test with `safeParse`, not `parse` (don't throw in tests):
```typescript
it('rejects name longer than 255 chars', () => {
  const result = CreateCustomerSchema.safeParse({ name: 'x'.repeat(256) })
  expect(result.success).toBe(false)
})

it('accepts valid phone in international format', () => {
  const result = CreateCustomerSchema.safeParse({ name: 'Ali', phone: '+970599123456' })
  expect(result.success).toBe(true)
})
```

## Running tests

```bash
# run all tests once
npx vitest run

# watch mode during development
npx vitest

# run a single file
npx vitest run tests/customers/debt-computation.test.ts
```

After writing tests, always run them and fix any failures before reporting done.
