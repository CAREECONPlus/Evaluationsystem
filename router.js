// router.js

class Router {
  constructor() {
    // ブラウザの「戻る／進む」や hash の変更をキャッチ
    window.addEventListener('popstate', () => this.loadPage());
    window.addEventListener('hashchange', () => this.loadPage());
  }

  init() {
    this.loadPage();
  }

  /**
   * 現在のハッシュから「#/foo/bar」を切り出し、
   * path = '/foo/bar' として loadPage 内で使う
   */
  loadPage() {
    // デフォルトはルート
    const raw = window.location.hash || '#/';
    const path = raw.slice(1);  // 先頭の '#' を除去
    this.renderRoute(path);
  }

  /**
   * 画面遷移
   * @param {string} path '/dashboard' や '/evaluations' など
   */
  navigate(path) {
    // ハッシュ付きで履歴に積む
    history.pushState(null, '', '#' + path);
    this.loadPage();
  }

  /**
   * path によってページコンポーネントを切り替え
   */
  renderRoute(path) {
    switch (path) {
      case '/':
      case '/dashboard':
        window.app.loadDashboard();
        break;
      case '/evaluations':
        window.app.loadEvaluationsPage();
        break;
      case '/settings':
        window.app.loadSettingsPage();
        break;
      // ... 他のルート
      default:
        window.app.loadNotFoundPage();
    }
  }
}

// グローバルにひとつだけ作る
window.app.router = new Router();
window.addEventListener('DOMContentLoaded', () => {
  window.app.router.init();
});
