/**
 * Main Application Class
 * メインアプリケーションクラス
 */
class App {
  constructor() {
    this.currentUser = null;
    this.currentPage = null;
    this.isInitialized = false;

    // Firebase configuration
    this.firebaseConfig = {
      apiKey: "demo-api-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "demo-app-id",
    };

    // Initialize modules after DOM is ready
    this.i18n = null;
    this.api = null;
    this.auth = null;
    this.router = null;
  }

  /**
   * Initialize application
   * アプリケーションを初期化
   */
  async init() {
    try {
      console.log("Starting application initialization...");

      // Initialize Firebase (if firebase script is loaded)
      if (typeof window.firebase !== "undefined") {
        window.firebase.initializeApp(this.firebaseConfig);
        console.log("Firebase initialized");
      }

      // Initialize core modules
      console.log("Initializing I18n...");
      this.i18n = new window.I18n();
      await this.i18n.init();

      console.log("Initializing API...");
      this.api = new window.API();
      this.api.app = this; // Set app reference
      this.api.init();

      console.log("Initializing Auth...");
      this.auth = new window.Auth(this);
      await this.auth.init();

      // HeaderComponent と SidebarComponent に app インスタンスを設定
      if (window.HeaderComponent) {
        window.HeaderComponent.app = this;
      }
      if (window.SidebarComponent) {
        window.SidebarComponent.app = this;
      }

      console.log("Initializing Router...");
      // 第2引数に GitHub Pages 等でのベースパスを指定してください
      this.router = new window.Router(this, '/EvaluationSystem');
      await this.router.init();

      this.isInitialized = true;
      console.log("Application initialized successfully");

      // Show app and hide loading screen
      this.showApp();
    } catch (error) {
      console.error("Failed to initialize application:", error);
      const msg = this.i18n
        ? this.i18n.t("errors.app_init_failed")
        : "アプリケーションの初期化に失敗しました";
      this.showError(msg);
    }
  }

  /**
   * Show app and hide loading screen
   * アプリを表示し、ローディング画面を非表示にする
   */
  showApp() {
    const loadingScreen = document.getElementById("loading-screen");
    const appEl = document.getElementById("app");

    if (loadingScreen) loadingScreen.style.display = "none";
    if (appEl) appEl.classList.remove("d-none");

    // 初回ロード時は router.init() がすでに現在のパスを処理済みなので、
    // ここで無条件に再度 navigate を呼ばないようにしています。
  }

  /**
   * Login user
   * ユーザーをログイン
   */
  async login(email, password) {
    try {
      if (!this.auth) {
        throw new Error(this.i18n.t("errors.auth_service_not_initialized"));
      }
      if (!email || !password) {
        throw new Error(this.i18n.t("errors.email_password_required"));
      }

      const user = await this.auth.login(email, password);
      if (!user) {
        throw new Error(this.i18n.t("errors.login_failed_generic"));
      }
      this.currentUser = user;
      this.showSuccess(this.i18n.t("messages.login_success", { userName: user.name }));
      setTimeout(() => this.navigate("/dashboard"), 500);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  }

  /**
   * Navigate to a specific route
   * 特定のルートに移動
   */
  navigate(path) {
    if (this.router) {
      this.router.navigate(path);
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  /**
   * Show toast notifications...
   * （省略：showSuccess/showError/showToast などは元のまま）
   */

  // ... 以下、他のユーティリティメソッドもすべて元のまま継承してください ...
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing app...");
  try {
    window.app = new App();
    await window.app.init();
    console.log("App initialization complete");
  } catch (err) {
    console.error("App initialization failed:", err);
    // ローディング画面にエラーメッセージを表示するなどのハンドリングを入れてください
  }
});

// Handle global errors / unhandledrejection
window.addEventListener("error", (e) => {
  e.preventDefault();
  window.app?.handleError(e.error);
});
window.addEventListener("unhandledrejection", (e) => {
  e.preventDefault();
  window.app?.handleError(e.reason);
});

// グローバル公開
window.App = App;
