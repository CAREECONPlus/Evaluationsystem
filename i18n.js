/**
 * Internationalization (i18n) Service
 * 国際化（i18n）サービス
 */
export class I18n {
  constructor() {
    this.lang = "ja";
    this.translations = {};
    this.supportedLanguages = ["ja", "en", "vi"];
  }

  /**
   * Initializes the service by setting the language.
   * 言語を設定してサービスを初期化します。
   */
  async init() {
    const lang = localStorage.getItem("lang") || this.lang;
    await this.setLanguage(lang);
  }

  /**
   * Sets the application language, loads translations, and updates the UI.
   * アプリケーションの言語を設定し、翻訳を読み込み、UIを更新します。
   * @param {string} lang - The language code (e.g., 'ja', 'en').
   */
  async setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      lang = "ja"; // Default to Japanese if language is not supported
    }
    this.lang = lang;
    localStorage.setItem("lang", lang);
    await this.loadTranslations(lang);
    if (window.app) { // Ensure app is initialized before updating UI
        window.app.header?.update();
        window.app.sidebar?.update();
        window.app.router?.route(); // Re-route to re-render the current page with new language
    }
  }

  /**
   * Loads the translation file for the specified language.
   * 指定された言語の翻訳ファイルを読み込みます。
   * @param {string} lang - The language code.
   */
  async loadTranslations(lang) {
    try {
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.translations = await response.json();
    } catch (error) {
      console.error(`Could not load translation file for ${lang}:`, error);
      // Fallback to Japanese if the selected language file fails to load
      if (lang !== 'ja') {
        await this.loadTranslations('ja');
      }
    }
  }

  /**
   * Translates a key into the current language.
   * キーを現在の言語に翻訳します。
   * @param {string} key - The key to translate (e.g., 'nav.dashboard').
   * @param {object} params - Parameters to replace in the translation string.
   * @returns {string} The translated string.
   */
  t(key, params = {}) {
    let translation = key.split('.').reduce((obj, k) => obj && obj[k], this.translations);
    if (translation) {
      for (const param in params) {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      }
    }
    return translation || key; // Return the key itself if translation not found
  }

  /**
   * Updates all elements with data-i18n attributes in the UI.
   * UI内のdata-i18n属性を持つすべての要素を更新します。
   * @param {HTMLElement} element - The parent element to update (defaults to document).
   */
  updateUI(element = document) {
    element.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const params = JSON.parse(el.getAttribute("data-i18n-params") || "{}");
      el.textContent = this.t(key, params);
    });
    element.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.placeholder = this.t(key);
    });
  }
}
