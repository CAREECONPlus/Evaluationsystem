/**
 * Internationalization (i18n) Service
 * 国際化（i18n）サービス
 */
class I18n {
  constructor() {
    // デフォルト言語を 'ja' に設定
    this.lang = "ja";
    this.translations = {};
    // サポートする言語のリスト
    this.supportedLanguages = ["ja", "en", "vi"];
  }

  /**
   * i18nサービスの初期化
   */
  async init() {
    // localStorageから言語設定を読み込む（なければデフォルトを使用）
    const lang = localStorage.getItem("lang") || this.lang;
    await this.setLanguage(lang);
  }

  /**
   * 言語を設定し、翻訳ファイルを読み込む
   * @param {string} lang - 言語コード (e.g., 'ja', 'en')
   */
  async setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      lang = "ja"; // サポートされていない言語の場合は日本語にフォールバック
    }
    this.lang = lang;
    localStorage.setItem("lang", lang); // 選択した言語を保存
    await this.loadTranslations(lang);
    this.updateUI(); // UIのテキストを更新
  }

  /**
   * 翻訳ファイルを非同期で読み込む
   * @param {string} lang - 言語コード
   */
  async loadTranslations(lang) {
    try {
      const response = await fetch(`/evaluationsystem/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.translations = await response.json();
    } catch (error) {
      console.error(`Could not load translation file for ${lang}:`, error);
      // エラーが発生した場合、デフォルトの日本語を試みる
      if (lang !== 'ja') {
        await this.loadTranslations('ja');
      }
    }
  }

  /**
   * キーに対応する翻訳テキストを返す
   * @param {string} key - 翻訳キー (e.g., 'nav.dashboard')
   * @param {object} params - 翻訳テキストに埋め込むパラメータ
   * @returns {string} 翻訳されたテキスト
   */
  t(key, params = {}) {
    // 'nav.dashboard' のようなキーを分割して、ネストされたオブジェクトから値を取得
    let translation = key.split('.').reduce((obj, k) => obj && obj[k], this.translations);
    if (translation) {
      // パラメータを置換 (e.g., '{{maxGoals}}' -> 5)
      for (const param in params) {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      }
    }
    // 翻訳が見つからない場合はキーをそのまま返す
    return translation || key;
  }

  /**
   * UI上のテキストを現在の言語に更新する
   * @param {HTMLElement} element - 更新対象の親要素 (デフォルトはdocument全体)
   */
  updateUI(element = document) {
    // 'data-i18n' 属性を持つ要素のテキストを更新
    element.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const params = JSON.parse(el.getAttribute("data-i18n-params") || "{}");
      el.textContent = this.t(key, params);
    });
    // 'data-i18n-placeholder' 属性を持つ入力フィールドのプレースホルダーを更新
    element.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.placeholder = this.t(key);
    });
  }

  /**
   * 現在の言語設定を返す
   * @returns {string} 現在の言語コード
   */
  getCurrentLanguage() {
    return this.lang;
  }
}

// グローバルスコープで利用可能にする
window.I18n = I18n;
