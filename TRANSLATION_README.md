# Translation System Implementation

This project now includes a custom React Context-based internationalization (i18n) system that supports English and Turkish languages.

## Features

- **Language Support**: English (default) and Turkish
- **Persistent Storage**: Language preference is saved in localStorage
- **Easy Integration**: Simple hook-based API for components
- **No UI Changes**: Maintains the existing design while adding translation capability

## How It Works

### 1. I18nContext
The main translation context (`src/app/i18n/I18nContext.tsx`) provides:
- `locale`: Current language ('en' or 'tr')
- `setLocale`: Function to change language
- `t`: Translation function to get text in current language

### 2. Message Files
- `src/app/i18n/messages/en.ts`: English translations
- `src/app/i18n/messages/tr.ts`: Turkish translations

### 3. Language Switcher
A floating language switcher component (`src/app/components/LanguageSwitcher.tsx`) that appears on all translated pages.

## Usage

### In Components

```tsx
import { useI18n } from '../i18n/I18nContext'

export default function MyComponent() {
  const { t, locale, setLocale } = useI18n()
  
  return (
    <div>
      <h1>{t('main.title')}</h1>
      <p>Current language: {locale}</p>
      <button onClick={() => setLocale('tr')}>Switch to Turkish</button>
    </div>
  )
}
```

### Adding New Translations

1. Add the key to both message files:
   ```tsx
   // en.ts
   'new.key': 'English text'
   
   // tr.ts
   'new.key': 'Türkçe metin'
   ```

2. Use in components:
   ```tsx
   {t('new.key')}
   ```

## Translated Pages

The following pages now support translation:

### Main Pages
- **Main Page** (`/`): Landing page with features and login options
- **Get Started** (`/QR_Portal/get_started`): Contact form for new users
- **User Login** (`/QR_Portal/user_login`): Restaurant owner login page

### QR Portal Pages (Complete Translation Coverage)
- **User Dashboard** (`/QR_Portal/user_dashboard`): Complete dashboard with all sections
- **Order System** (`/QR_Portal/order_system`): Order management and real-time updates
- **Menu Page** (`/QR_Portal/menu/[companyId]`): Customer-facing menu with cart functionality

### Translation Coverage by Page Type

#### User Dashboard
- Navigation tabs and buttons
- Welcome messages
- Search functionality
- PDF upload interface
- Manual menu management
- Theme settings
- Analytics section
- Profile management

#### Order System
- Page titles and headers
- Loading and error states
- Order display information
- Confirmation dialogs
- Action buttons
- Status messages

#### Menu Page
- Shopping cart interface
- Cart actions (add, remove, clear)
- Confirmation dialogs
- Order placement flow
- Table number input
- Success messages

## Language Switcher

The language switcher appears as a floating button in the top-right corner of all translated pages. It shows:
- Globe icon
- Current language abbreviation (EN/TR)
- Tooltip with "Switch Language" text

## Technical Details

- **Context Provider**: Wraps the entire app in `src/app/layout.tsx`
- **Local Storage**: Language preference persists across browser sessions
- **Fallback**: Falls back to English if a translation key is missing
- **Type Safety**: Full TypeScript support with proper typing
- **Performance**: Lightweight implementation with minimal overhead

## Translation Keys Structure

The translation system uses a hierarchical key structure:

```
main.*           - Main page content
getStarted.*     - Get Started page
userLogin.*      - User login page
dashboard.*      - User dashboard
orderSystem.*    - Order management system
menu.*           - Customer menu interface
language.*       - Language switcher
```

## Future Enhancements

- Add more languages (Arabic, German, etc.)
- Dynamic language detection based on browser locale
- Server-side language detection
- Translation management system for content editors
- RTL language support
- Pluralization rules for different languages

## Notes

- The admin login section is intentionally excluded from translation as requested
- All QR Portal pages now have complete translation coverage
- Complex functionality like real-time orders and PDF handling remains unchanged
- The translation system is lightweight and doesn't impact performance
- All existing functionality and UI design is preserved

## Testing

To test the translation system:

1. **Visit any translated page** (main page, QR Portal pages)
2. **Click the language switcher** (globe icon in top-right)
3. **Verify text changes** to Turkish/English
4. **Check persistence** by refreshing the page
5. **Navigate between pages** to ensure language preference is maintained

The system provides a seamless bilingual experience across all customer-facing and restaurant management interfaces.
