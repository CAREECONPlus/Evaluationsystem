/**
 * Login Page Component
 * ログインページコンポーネント
 */
class LoginPage {
  constructor(app) {
    this.app = app;
    this.isLoading = false;
  }

  /**
   * Render login page
   * ログインページを描画
   */
  async render() {
    return `
      <div class="login-page">
        <div class="container-fluid vh-100">
          <div class="row h-100">
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary text-white">
              <div class="text-center p-5">
                <i class="fas fa-hard-hat fa-5x mb-4 opacity-75"></i>
                <h1 class="display-4 fw-bold mb-4">建設業従業員評価管理システム</h1>
                <p class="lead">効率的な人事評価で組織の成長を支援します</p>
              </div>
            </div>

            <div class="col-lg-6 d-flex align-items-center justify-content-center bg-light">
              <div class="login-form-container w-100" style="max-width: 400px;">
                <div class="card shadow-lg border-0">
                  <div class="card-body p-5">
                    <div class="text-center mb-4">
                      <h2 class="card-title h3 mb-2">ログイン</h2>
                      <p class="text-muted">アカウントにサインインしてください</p>
                    </div>

                    <form id="loginForm">
                      <div class="mb-3">
                        <label for="email" class="form-label fw-bold">メールアドレス</label>
                        <input type="email" class="form-control form-control-lg" id="email" required autocomplete="email" placeholder="example@company.com">
                      </div>
                      <div class="mb-4">
                        <label for="password" class="form-label fw-bold">パスワード</label>
                        <input type="password" class="form-control form-control-lg" id="password" required autocomplete="current-password" placeholder="パスワードを入力">
                      </div>
                      <button type="submit" class="btn btn-primary btn-lg w-100" id="loginButton">
                        <span class="login-text"><i class="fas fa-sign-in-alt me-2"></i>ログイン</span>
                        <span class="login-spinner d-none"><i class="fas fa-spinner fa-spin me-2"></i>ログイン中...</span>
                      </button>
                    </form>

                    <hr class="my-4">
                    <h6 class="text-center text-muted mb-3">またはデモアカウントでログイン</h6>
                    <div class="d-grid gap-2">
                      <button type="button" class="btn btn-outline-success demo-btn" id="demoAdminBtn">管理者 (admin@example.com)</button>
                      <button type="button" class="btn btn-outline-info demo-btn" id="demoEvaluatorBtn">評価者 (manager@example.com)</button>
                      <button type="button" class="btn btn-outline-secondary demo-btn" id="demoWorkerBtn">作業員 (employee@example.com)</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize login page
   * ログインページを初期化
   */
  async init() {
    console.log("Initializing login page...");

    // フォームとボタンへのイベントリスナーを設定
    const form = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");
    const demoAdminBtn = document.getElementById("demoAdminBtn");
    const demoEvaluatorBtn = document.getElementById("demoEvaluatorBtn");
    const demoWorkerBtn = document.getElementById("demoWorkerBtn");

    // フォーム送信イベント
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // デモアカウントボタンのクリックイベント
    demoAdminBtn.addEventListener("click", () => this.loginDemo("admin"));
    demoEvaluatorBtn.addEventListener("click", () => this.loginDemo("evaluator"));
    demoWorkerBtn.addEventListener("click", () => this.loginDemo("worker"));

    setTimeout(() => document.getElementById("email")?.focus(), 100);
    console.log("Login page initialized successfully");
  }

  /**
   * Handle login form submission
   * ログインフォーム送信を処理
   */
  async handleLogin() {
    if (this.isLoading) return;

    this.setLoadingState(true);
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      if (!email || !password) throw new Error("メールアドレスとパスワードを入力してください。");
      await this.app.login(email, password);
    } catch (error) {
      console.error("Login error:", error);
      this.app.showError(error.message || "ログインに失敗しました。");
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Handle demo login
   * デモログインを処理
   */
  async loginDemo(role) {
    if (this.isLoading) return;
    
    const accounts = {
      admin: { email: "admin@example.com", password: "password" },
      evaluator: { email: "manager@example.com", password: "password" },
      worker: { email: "employee@example.com", password: "password" },
    };

    const account = accounts[role];
    if (!account) return;

    this.setLoadingState(true);
    try {
      document.getElementById("email").value = account.email;
      document.getElementById("password").value = account.password;
      await this.app.login(account.email, account.password);
    } catch (error) {
      console.error("Demo login error:", error);
      this.app.showError(error.message || "デモログインに失敗しました。");
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Set loading state
   * ローディング状態を設定
   */
  setLoadingState(loading) {
    this.isLoading = loading;
    const loginButton = document.getElementById("loginButton");
    const loginText = loginButton?.querySelector(".login-text");
    const loginSpinner = loginButton?.querySelector(".login-spinner");
    const demoButtons = document.querySelectorAll('.demo-btn');

    if (loginButton) loginButton.disabled = loading;
    demoButtons.forEach(btn => btn.disabled = loading);

    if (loading) {
      loginText?.classList.add("d-none");
      loginSpinner?.classList.remove("d-none");
    } else {
      loginText?.classList.remove("d-none");
      loginSpinner?.classList.add("d-none");
    }
  }
}

window.LoginPage = LoginPage;
