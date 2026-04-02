---
applyTo: "**/*.page.ts"
---

# Playwright Page Object Model (POM) Rules

These rules apply to all files matching `**/*.page.ts` within the CIBC TestForge AI framework.

## Flat Design — No Inheritance

**FORBIDDEN:**
```typescript
// ❌ Never do this
class WireTransferPage extends BasePage { ... }
```

**REQUIRED — Composition:**
```typescript
// ✅ Correct pattern: accept `page` as a constructor argument
export function createWireTransferPage(page: Page) {
  return {
    recipientInput: () => page.getByTestId('recipient-input'),
    amountInput:    () => page.getByTestId('amount-input'),
    submitButton:   () => page.getByTestId('submit-wire-btn'),

    async fillRecipient(name: string) {
      await this.recipientInput().fill(name);
    },
    async fillAmount(amount: string) {
      await this.amountInput().fill(amount);
    },
    async submit() {
      await this.submitButton().click();
    },
  };
}
```

## Locator Strategy
1. Prefer `page.getByTestId()` whenever the DOM element has a `data-testid` attribute.
2. Fall back to `page.getByRole()` with an explicit `name` for interactive elements.
3. Use `page.getByLabel()` for form fields linked to `<label>` elements.
4. **Never** use raw CSS selectors or XPath unless absolutely unavoidable — document why if you must.

## What Belongs in a POM File
- Locator accessors (as arrow functions returning `Locator`)
- Action methods (click, fill, navigate)
- Wait helpers specific to the page (e.g., `waitForTableToLoad`)

## What Does NOT Belong in a POM File
- `expect()` assertions — these belong exclusively in `tests/steps/`
- Test data — this belongs in `data/sit1/` or `data/uat/`
- Business logic or calculations
