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

      // 各言語のJSONファイルを非同期で読み込む
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
      Object.keys(params).forEach((param) => {
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
      
      // ページコンテンツが存在すれば、UIを再描画して言語を完全に反映させる
      if (window.app && window.app.router && window.app.router.currentPageInstance) {
        window.app.router.loadPage(window.app.router.currentPageInstance.constructor.name.replace('Page','').toLowerCase(), true);
      }
      console.log("Language changed to:", language);
    } else {
      console.warn("Language not supported:", language);
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  updateUI() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if(key) element.textContent = this.t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if(key) element.placeholder = this.t(key);
    });
  }
}

window.I18n = I18n;
