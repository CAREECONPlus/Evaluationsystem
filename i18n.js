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
        if (translation === undefined) {
          // console.warn("Translation missing for key:", key); // デバッグ用に有効化
          return key; // キーが見つからない場合はキー自体を返す
        }
      }
      let result = String(translation); // 翻訳が数値などの場合も文字列として扱う
      Object.keys(params).forEach(param => {
        // 正規表現で全ての出現箇所を置換
        result = result.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
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
      this.updateUI(); // UI全体を更新
      // 必要であれば現在のページを再ロードして内容を更新
      if (window.app?.router?.currentRoute) {
        // window.app.router.loadPage(window.app.router.currentRoute.substring(1), true); // ルーターで再ロードは行わない
      }
    } else {
      console.warn("Language not supported:", language);
    }
  }

  /**
   * DOM内のi18n属性を持つ要素を翻訳する。特定の要素以下のみ翻訳することも可能。
   * @param {HTMLElement} [root=document] 翻訳を適用するDOMのルート要素
   */
  updateUI(root = document) {
    // data-i18n 属性を持つ要素のテキストコンテンツを更新
    root.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const paramsAttr = el.getAttribute("data-i18n-params");
      let params = {};
      if (paramsAttr) { // paramsAttr が null や空文字列でないことを確認
        try {
          // JSONパース前にHTMLエンティティをデコード（例: &quot; -> "）
          const parser = new DOMParser();
          const doc = parser.parseFromString(`<!doctype html><body>${paramsAttr}`, 'text/html');
          const decodedParamsAttr = doc.body.textContent;
          params = JSON.parse(decodedParamsAttr);
        } catch (e) {
          console.error("Failed to parse data-i18n-params:", paramsAttr, e);
          params = {}; // パース失敗時は空のパラメータを使用
        }
      }
      if(key) el.textContent = this.t(key, params);
    });

    // data-i18n-placeholder 属性を持つ要素のプレースホルダーを更新
    root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if(key) el.placeholder = this.t(key);
    });
    // 今後必要であれば他の属性（data-i18n-titleなど）も追加
  }
}

window.I18n = I18n;
