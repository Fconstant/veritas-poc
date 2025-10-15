# Internationalization (i18n) Implementation

## Overview

The Veritas frontend application has been fully internationalized to support multiple languages. Currently, the application supports:
- **Portuguese (Brazil)** - `pt-BR` (default)
- **English (US)** - `en-US`

## Architecture

### Core Files

1. **Translation Files**
   - `frontend/src/lib/i18n/locales/pt-BR.json` - Portuguese translations
   - `frontend/src/lib/i18n/locales/en-US.json` - English translations

2. **Type Definitions**
   - `frontend/src/lib/i18n/types.ts` - TypeScript interface for translation keys

3. **Context & Provider**
   - `frontend/src/lib/i18n/I18nContext.tsx` - React Context for i18n state management
   - Provides `useI18n()` hook for accessing translations
   - Handles locale persistence via localStorage (`veritas_locale` key)
   - Updates HTML `lang` attribute automatically

4. **UI Components**
   - `frontend/src/app/shared/components/LanguageSwitcher.tsx` - Language selection component
   - Two variants: `default` (full buttons) and `compact` (dropdown with Globe icon)

## Usage

### Basic Translation

```typescript
import { useI18n } from '@/lib/i18n/I18nContext';

function MyComponent() {
  const { t } = useI18n();
  
  return <h1>{t.common.appName}</h1>;
}
```

### Translation with Interpolation

For dynamic values, use the `interpolate` function:

```typescript
import { useI18n, interpolate } from '@/lib/i18n/I18nContext';

function MyComponent() {
  const { t } = useI18n();
  const count = 5;
  
  const message = interpolate(t.results.export.totalClaims, { count });
  // Result: "Total de afirmações verificadas: 5" (PT-BR)
  // Result: "Total verified claims: 5" (EN-US)
  
  return <p>{message}</p>;
}
```

### Changing Language

```typescript
import { useI18n } from '@/lib/i18n/I18nContext';

function MyComponent() {
  const { locale, setLocale } = useI18n();
  
  return (
    <button onClick={() => setLocale('en-US')}>
      Switch to English
    </button>
  );
}
```

## Translation Structure

The translation files are organized by feature/component:

```json
{
  "common": { /* Shared strings */ },
  "metadata": { /* Page metadata */ },
  "header": { /* Header component */ },
  "hero": { /* Hero section */ },
  "verificationForm": { /* Verification form */ },
  "apiSetup": { /* API setup page */ },
  "confirmationDialog": { /* Confirmation dialogs */ },
  "results": { /* Results page */ },
  "toast": { /* Toast notifications */ },
  "errors": { /* Error messages */ },
  "comingSoon": { /* Coming soon features */ }
}
```

## Internationalized Components

### Shared Components
- ✅ Header
- ✅ ApiSetupPage
- ✅ ApiKeyCard
- ✅ ConfirmationDialog
- ✅ ComingSoonBanner
- ✅ LoadingSpinner
- ✅ LanguageSwitcher

### Home Page Components
- ✅ HeroSection
- ✅ VerificationForm
- ✅ HomePage
- ✅ HomePageToast

### Results Page Components
- ✅ ResultsPage (including export text generation)
- ✅ ResultsPanel
- ✅ ResultsHeader
- ✅ ProcessedTextPanel

## Features

### Locale Persistence
- User's language preference is saved to `localStorage` with key `veritas_locale`
- Automatically loads on app initialization
- Persists across browser sessions

### HTML Lang Attribute
- The `<html lang>` attribute is automatically updated when the locale changes
- Improves accessibility and SEO

### Type Safety
- All translation keys are typed via the `TranslationKeys` interface
- TypeScript will catch missing or incorrect translation keys at compile time

### Interpolation
- Dynamic values can be inserted into translations using `{{variable}}` syntax
- The `interpolate()` function replaces placeholders with actual values

## Adding New Translations

1. **Add the key to both translation files:**
   - `frontend/src/lib/i18n/locales/pt-BR.json`
   - `frontend/src/lib/i18n/locales/en-US.json`

2. **Update the TypeScript interface:**
   - `frontend/src/lib/i18n/types.ts`

3. **Use in components:**
   ```typescript
   const { t } = useI18n();
   return <div>{t.yourSection.yourKey}</div>;
   ```

## Adding New Languages

1. **Create a new translation file:**
   - `frontend/src/lib/i18n/locales/[locale].json`
   - Copy structure from `pt-BR.json` or `en-US.json`

2. **Update the I18nContext:**
   - Add the new locale to the `translations` object in `I18nContext.tsx`

3. **Update the LanguageSwitcher:**
   - Add the new language option to the switcher component

## Testing

The application has been successfully built and all components compile without errors. To test:

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test language switching:**
   - Use the language switcher in the header (Globe icon)
   - Verify all text changes to the selected language
   - Check that the preference persists after page reload

3. **Test all pages:**
   - Home page (`/`)
   - Results page (`/results`)
   - API Setup page (`/setup`)

## Notes

- All user-facing text has been internationalized
- Console messages and debug logs remain in their original language
- Storybook files are not internationalized as they are development-only
- The interpolation syntax uses `{{variable}}` format for consistency

