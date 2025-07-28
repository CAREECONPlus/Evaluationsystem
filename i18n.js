/**
 * Internationalization Service
 * 国際化サービス
 */
class I18n {
  constructor() {
    this.currentLanguage = "ja";
    this.translations = {};
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log("Initializing I18n service...");
      const [ja, en, vi] = await Promise.all([
        fetch('./locales/ja.json').then(res => res.json()),
        fetch('./locales/en.json').then(res => res.json()),
        fetch('./locales/vi.json').then(res => res.json())
      ]);
      this.translations = { ja, en, vi };
      const savedLanguage = localStorage.getItem("language") || "ja";
      this.currentLanguage = this.translations[savedLanguage] ? savedLanguage : "ja";
      this.isInitialized = true;
      console.log("I18n service initialized with language:", this.currentLanguage);
    } catch (error) {
      console.error("Failed to initialize I18n service:", error);
      throw error;
    }
  }

  t(key, params = {}) {
    try {
      const keys = key.split('.');
      let translation = this.translations[this.currentLanguage];
      for (const k of keys) {
        translation = translation?.[k];
        if (translation === undefined) return key;
      }
      let result = translation;
      Object.keys(params).forEach(param => {
        result = result.replace(`{{${param}}}`, params[param]);
      });
      return result;
    } catch (error) {
      console.warn("Translation error for key:", key, error);
      return key;
    }
  }

  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem("language", language);
      this.updateUI();
      if (window.app?.router?.currentPageInstance) {
        window.app.router.loadPage(window.app.router.currentRoute.substring(1), true);
      }
    } else {
      console.warn("Language not supported:", language);
    }
  }

  updateUI() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if(key) el.textContent = this.t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if(key) el.placeholder = this.t(key);
    });
  }
}

window.I18n = I18n;
