// router.js

/**
 * シンプルな SPA ルーター（History API ベース）
 * App インスタンスと、URL → ページクラスのマッピングを受け取って動作します。
 */
class Router {
  /**
   * @param {object} app - グローバル App インスタンス
   * @param {string} basePath - index.html をホストしているベースパス（例: '/EvaluationSystem'）
   */
  constructor(app, basePath = '') {
    this.app = app;
    this.basePath = basePath.replace(/\/$/, ''); // 末尾スラッシュを取り除く
    // URL パス（basePath を除いたもの）とページクラスの対応表
    this.routes = {
      '/': window.DashboardPage,
      '/dashboard': window.DashboardPage,
      '/login': window.LoginPage,
      '/register': window.RegisterPage,
      '/register-admin': window.RegisterAdminPage,
      '/users': window.UserManagementPage,
      '/settings': window.SettingsPage,
      '/goal-setting': window.GoalSettingPage,
      '/goal-approvals': window.GoalApprovalsPage,
      '/evaluation-form': window.EvaluationFormPage,
      '/evaluations': window.EvaluationsPage,
      '/developer': window.DeveloperPage
    };

    // ブラウザの「戻る／進む」ボタンに反応
    window.addEventListener('popstate', () => {
      this.loadPage(location.pathname);
    });
  }

  /** ルーターを開始します（App.init() 内から呼び出してください） */
  async init() {
    // 初回ロード時に現在の URL を読み込み
    await this.loadPage(location.pathname);
  }

  /**
   * 指定パスのページを読み込んで描画します。
   * @param {string} fullPath - 例 '/EvaluationSystem/dashboard' など
   */
  async loadPage(fullPath) {
    // basePath を取り除いた部分をキーに使う
    let path = fullPath.replace(this.basePath, '') || '/';

    // クエリやハッシュを取り除く
    path = path.replace(/\?.*$/, '').replace(/#.*$/, '');

    const PageClass = this.routes[path];
    if (!PageClass) {
      // ルート未定義の場合はダッシュボードへリダイレクト
      return this.navigate('/dashboard');
    }

    // ページコンポーネント生成 → render() → init()
    this.app.currentPage = new PageClass(this.app);
    const html = await this.app.currentPage.render();
    document.getElementById('content').innerHTML = html;
    await this.app.currentPage.init();

    // i18n があれば翻訳更新
    if (this.app.i18n) {
      this.app.i18n.updateUI(document.getElementById('content'));
    }
  }

  /**
   * アプリからプログラム的にルート遷移するために使います。
   * history.pushState ＋ loadPage を同時に行います。
   * @param {string} path - basePath を除いたパス（例 '/dashboard'）
   */
  navigate(path) {
    const full = this.basePath + path;
    history.pushState({}, '', full);
    return this.loadPage(full);
  }
}

// グローバルで使えるように
window.Router = Router;
