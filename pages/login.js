/**
 * Login Page Component
 * ログインページコンポーネント
 */
export class LoginPage {
  constructor(app) {
    this.app = app;
    this.isLoading = false;
  }

  /**
   * Render login page
   * ログインページを描画
   */
  async render() {
    // UIテキストをi18nで統一
    const appSystemName = this.app.i18n.t('app.system_name');
    const loginLead = this.app.i18n.t('login.lead_text');
    const loginTitle = this.app.i18n.t('auth.login');
    const signInHint = this.app.i18n.t('login.sign_in_hint');
    const emailLabel = this.app.i18n.t('auth.email_label');
    const emailPlaceholder = this.app.i18n.t('auth.email_placeholder');
    const passwordLabel = this.app.i18n.t('auth.password_label');
    const passwordPlaceholder = this.app.i18n.t('auth.password_placeholder');
    const loginButtonText = this.app.i18n.t('auth.login');
    const loggingInText = this.app.i18n.t('auth.logging_in');
    const orLoginDemo = this.app.i18n.t('login.or_login_demo');
    const adminRole = this.app.i18n.t('roles.admin');
    const evaluatorRole = this.app.i18n.t('roles.evaluator');
    const workerRole = this.app.i18n.t('roles.worker');

    return `
      <div class="login-page">
        <div class="container-fluid vh-100">
          <div class="row h-100">
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary text-white">
              <div class="text-center p-5">
                <i class="fas fa-hard-hat fa-5x mb-4 opacity-75"></i>
                <h1 class="display-4 fw-bold mb-4">${this.app.sanitizeHtml(appSystemName)}</h1>
                <p class="lead">${this.app.sanitizeHtml(loginLead)}</p>
              </div>
            </div>

            <div class="col-lg-6 d-flex align-items-center justify-content-center bg-light">
              <div class="login-form-container w-100" style="max-width: 400px;">
                <div class="card shadow-lg border-0">
                  <div class="card-body p-5">
                    <div class="text-center mb-4">
                      <h2 class="card-title h3 mb-2">${this.app.sanitizeHtml(loginTitle)}</h2>
                      <p class="text-muted">${this.app.sanitizeHtml(signInHint)}</p>
                    </div>

                    <form id="loginForm">
                      <div class="mb-3">
                        <label for="email" class="form-label fw-bold">${this.app.sanitizeHtml(emailLabel)}</label>
                        <input type="email" class="form-control form-control-lg" id="email" required autocomplete="email" placeholder="${this.app.sanitizeHtml(emailPlaceholder)}">
                      </div>
                      <div class="mb-4">
                        <label for="password" class="form-label fw-bold">${this.app.sanitizeHtml(passwordLabel)}</label>
                        <input type="password" class="form-control form-control-lg" id="password" required autocomplete="current-password" placeholder="${this.app.sanitizeHtml(passwordPlaceholder)}">
                      </div>
                      <button type="submit" class="btn btn-primary btn-lg w-100" id="loginButton">
                        <span class="login-text"><i class="fas fa-sign-in-alt me-2"></i>${this.app.sanitizeHtml(loginButtonText)}</span>
                        <span class="login-spinner d-none"><i class="fas fa-spinner fa-spin me-2"></i>${this.app.sanitizeHtml(loggingInText)}</span>
                      </button>
                    </form>

                    <hr class="my-4">
                    <h6 class="text-center text-muted mb-3">${this.app.sanitizeHtml(orLoginDemo)}</h6>
                    <div class="d-grid gap-2">
                      <button type="button" class="btn btn-outline-success demo-btn" id="demoAdminBtn">${this.app.sanitizeHtml(adminRole)} (admin@example.com)</button>
                      <button type="button" class="btn btn-outline-info demo-btn" id="demoEvaluatorBtn">${this.app.sanitizeHtml(evaluatorRole)} (manager@example.com)</button>
                      <button type="button" class="btn btn-outline-secondary demo-btn" id="demoWorkerBtn">${this.app.sanitizeHtml(workerRole)} (employee@example.com)</button>
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
    const demoAdminBtn = document.getElementById("demoAdminBtn");
    const demoEvaluatorBtn = document.getElementById("demoEvaluatorBtn");
    const demoWorkerBtn = document.getElementById("demoWorkerBtn");

    // form要素が存在することを確認してからイベントリスナーを設定
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // デモアカウントボタンのクリックイベント（同様にnullチェックを追加）
    if (demoAdminBtn) demoAdminBtn.addEventListener("click", () => this.loginDemo("admin"));
    if (demoEvaluatorBtn) demoEvaluatorBtn.addEventListener("click", () => this.loginDemo("evaluator"));
    if (demoWorkerBtn) demoWorkerBtn.addEventListener("click", () => this.loginDemo("worker"));

    // UI翻訳を適用 (レンダリング後にinitが呼ばれるため、ここでUIを更新)
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }

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
      // エラーメッセージはAppクラスのshowErrorでi18nから取得される
      if (!email || !password) throw new Error(this.app.i18n.t("errors.email_password_required")); // 翻訳キーを使用
      await this.app.login(email, password);
    } catch (error) {
      console.error("Login error:", error);
      // loginメソッド内で既にエラーメッセージがi18n化されている場合があるので、直接表示
      this.app.showError(error.message || this.app.i18n.t("errors.login_failed_generic")); // 翻訳キーを使用
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
      // フォームの入力値を設定
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      if (emailInput) emailInput.value = account.email;
      if (passwordInput) passwordInput.value = account.password;

      await this.app.login(account.email, account.password);
    } catch (error) {
      console.error("Demo login error:", error);
      this.app.showError(error.message || this.app.i18n.t("errors.demo_login_failed")); // 翻訳キーを使用
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
    // ロード状態が変化したらUIを更新して翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateUI(document.querySelector('.login-form-container'));
    }
  }
}
