/**
 * Internationalization (i18n) Service
 * 国際化（i18n）サービス
 */
class I18n {
  constructor() {
    this.lang = "ja";
    this.translations = {};
    this.supportedLanguages = ["ja", "en", "vi"];
  }

  async init() {
    const lang = localStorage.getItem("lang") || this.lang;
    await this.setLanguage(lang);
  }

  async setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      lang = "ja";
    }
    this.lang = lang;
    localStorage.setItem("lang", lang);
    await this.loadTranslations(lang);
    this.updateUI();
  }

  async loadTranslations(lang) {
    try {
      // パスから /EvaluationSystem を削除
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.translations = await response.json();
    } catch (error) {
      console.error(`Could not load translation file for ${lang}:`, error);
      if (lang !== 'ja') {
        await this.loadTranslations('ja');
      }
    }
  }

  t(key, params = {}) {
    let translation = key.split('.').reduce((obj, k) => obj && obj[k], this.translations);
    if (translation) {
      for (const param in params) {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      }
    }
    return translation || key;
  }

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

  getCurrentLanguage() {
    return this.lang;
  }
}

window.I18n = I18n;
