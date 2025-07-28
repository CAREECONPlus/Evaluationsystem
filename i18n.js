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
      // 外部ファイルではなく、直接ここに翻訳を保持
      this.translations.ja = window.langJA;
      this.translations.en = window.langEN;
      this.translations.vi = window.langVI;
      
      const savedLanguage = localStorage.getItem("language") || "ja";
      this.currentLanguage = this.translations[savedLanguage] ? savedLanguage : "ja";

      this.isInitialized = true;
      console.log("I18n service initialized with language:", this.currentLanguage);
    } catch (error) {
      console.error("Failed to initialize I18n service:", error);
      throw error;
    }
  }

  /**
   * Get translation for key (e.g., "common.save" or "nav.dashboard")
   * ネストされたキーに対応する翻訳を取得
   */
  t(key, params = {}) {
    try {
      // ★★★ 修正点 ★★★
      // 'evaluation.title' のようなキーを分割して、ネストされたオブジェクトをたどる
      const keys = key.split('.');
      let translation = this.translations[this.currentLanguage];
      for (const k of keys) {
        translation = translation[k];
        if (translation === undefined) {
          return key; // 見つからなかった場合はキーをそのまま返す
        }
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
      // ヘッダーやサイドバーも再描画して言語を反映
      if (window.app && window.app.currentPage) {
        window.HeaderComponent.show(window.app.currentUser);
        window.SidebarComponent.show(window.app.currentUser);
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
      element.textContent = this.t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      element.placeholder = this.t(key);
    });
  }
}

// Make I18n globally available
window.I18n = I18n;

// Load language files into global variables
// 実際のプロジェクトでは非同期で読み込むべきですが、現在の構造に合わせてグローバル変数に格納します
fetch('./locales/ja.json').then(r => r.json()).then(data => window.langJA = data);
fetch('./locales/en.json').then(r => r.json()).then(data => window.langEN = data);
fetch('./locales/vi.json').then(r => r.json()).then(data => window.langVI = data);
