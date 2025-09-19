import i18n from 'i18next';

/**
 * Helper function to dynamically load a language resource
 * This is useful for only loading language files when needed
 */
export async function loadLanguageResource(langCode: string): Promise<void> {
  try {
    // Dynamic import of language file
    const module = await import(`../locales/${langCode}.json`);
    
    // Add the resource to i18next if it hasn't been added already
    if (!i18n.hasResourceBundle(langCode, 'translations')) {
      i18n.addResourceBundle(langCode, 'translations', module.default || module);
    }
  } catch (error) {
    console.error(`Failed to load language resource for ${langCode}`, error);
  }
}

/**
 * Helper for switching languages dynamically
 * Example usage:
 * 
 * import { switchLanguage } from '../utils/languageUtils';
 * 
 * // When user selects a new language:
 * await switchLanguage('hi');
 */
export async function switchLanguage(langCode: string): Promise<void> {
  // Load the language resource if not already loaded
  await loadLanguageResource(langCode);
  
  // Change the i18n language
  await i18n.changeLanguage(langCode);
  
  // Optionally save the language preference to localStorage
  localStorage.setItem('preferredLanguage', langCode);
}
