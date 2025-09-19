# Internationalization (i18n) in Sagar Setu App

This project uses `react-i18next` for internationalization (i18n) to support multiple languages.

## Key Features

- **Lazy Loading**: Translations are loaded on-demand, reducing the initial bundle size
- **Automatic Language Detection**: Detects the user's browser language
- **Persistent Preferences**: Saves language selection to localStorage
- **Structured Translations**: Organized by namespaces for better management

## Usage

### Basic Usage

Use the `useTranslation` hook in your components:

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
};
```

### Switching Languages

Use the language selector component to switch languages:

```tsx
import NewLanguageSelector from './components/NewLanguageSelector';

const App = () => {
  return (
    <div>
      <NewLanguageSelector />
      {/* Rest of your app */}
    </div>
  );
};
```

### Adding New Languages

1. Create a new JSON file in the `src/locales/` directory (e.g., `fr.json`)
2. Copy the structure from `en.json` and translate the values
3. The language will be automatically available in the language selector

## Translation Files

Translations are stored in JSON files in the `src/locales/` directory:

- `en.json`: English translations
- `hi.json`: Hindi translations
- etc...

Each file follows a nested structure:

```json
{
  "nav": {
    "home": "Home",
    "reports": "Reports"
  },
  "home": {
    "title": "Fish Zone Predictor"
  }
}
```

## Advanced Usage

For advanced use cases like dynamic loading or namespace management, see the `src/utils/languageUtils.ts` file.
