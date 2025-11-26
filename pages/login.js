/**
 * Login Page Component
 * ログインページコンポーネント
 */
export class LoginPage {
  constructor(app) {
    this.app = app;
    this.isLoading = false;
    this.loginAttempts = 0;
    this.maxAttempts = 5;
    this.lockoutTime = 15 * 60 * 1000; // 15分
    this.isLockedOut = false;
    this.lockoutEndTime = null;
  }

  async render() {
    return `
      <div class="login-page">
        <div class="container-fluid vh-100">
          <div class="row h-100">
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center login-hero-section">
              <div class="text-center p-5 text-white">
                <div class="login-hero-icon mb-4">
                  <i class="fas fa-hard-hat fa-5x"></i>
                </div>
                <h1 class="display-4 fw-bold mb-3" data-i18n="app.system_name">評価管理システム</h1>
                <p class="lead opacity-90 mb-4" data-i18n="login.lead_text">建設業の特性に合わせた従業員評価管理システム</p>
                <div class="feature-badges">
                  <span class="feature-badge">
                    <i class="fas fa-shield-alt me-2"></i>セキュア
                  </span>
                  <span class="feature-badge">
                    <i class="fas fa-mobile-alt me-2"></i>レスポンシブ
                  </span>
                  <span class="feature-badge">
                    <i class="fas fa-globe me-2"></i>多言語対応
                  </span>
                </div>
              </div>
            </div>

            <div class="col-lg-6 d-flex align-items-center justify-content-center login-form-section">
              <div class="login-form-container w-100" style="max-width: 420px;">
                <div class="login-card">
                  <div class="card-body p-5">
                    <div class="text-center mb-5">
                      <div class="login-form-icon mb-3">
                        <i class="fas fa-user-circle fa-3x text-primary"></i>
                      </div>
                      <h2 class="card-title h3 mb-2 text-dark" data-i18n="auth.login">ログイン</h2>
                      <p class="text-muted" data-i18n="login.sign_in_hint">アカウント情報を入力してください</p>
                    </div>

                    <form id="loginForm">
                      <div class="mb-4">
                        <label for="email" class="form-label fw-semibold text-dark" data-i18n="auth.email_label">メールアドレス</label>
                        <div class="input-group input-group-lg">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="fas fa-envelope text-muted"></i>
                          </span>
                          <input type="email" class="form-control border-start-0 ps-0" id="email" required autocomplete="email" placeholder="user@example.com">
                        </div>
                      </div>
                      <div class="mb-4">
                        <label for="password" class="form-label fw-semibold text-dark" data-i18n="auth.password_label">パスワード</label>
                        <div class="input-group input-group-lg">
                          <span class="input-group-text bg-light border-end-0">
                            <i class="fas fa-lock text-muted"></i>
                          </span>
                          <input type="password" class="form-control border-start-0 ps-0" id="password" required autocomplete="current-password" placeholder="6文字以上">
                        </div>
                      </div>
                      <div class="d-grid mb-3">
                          <button type="submit" class="btn btn-primary btn-lg login-button" id="loginButton">
                            <span class="login-text">
                              <i class="fas fa-sign-in-alt me-2"></i>
                              <span data-i18n="auth.login">ログイン</span>
                            </span>
                            <span class="login-spinner d-none">
                              <span class="spinner-border spinner-border-sm me-2"></span>
                              <span data-i18n="auth.logging_in">ログイン中...</span>
                            </span>
                          </button>
                      </div>

                      <div class="text-center mt-3">
                        <button type="button" class="btn btn-link text-muted" id="forgot-password-btn">
                          <i class="fas fa-key me-1"></i>パスワードを忘れた方はこちら
                        </button>
                      </div>
                    </form>

                    <!-- Demo Accounts Section -->
                    <div class="demo-accounts-section mt-4 p-3 bg-light rounded">
                      <h6 class="text-center mb-3 text-muted">
                        <i class="fas fa-info-circle me-2"></i>デモアカウント
                      </h6>
                      <div class="row text-sm">
                        <div class="col-12 mb-2">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <strong class="text-primary">管理者:</strong><br>
                              <small><code>admin@demo.com</code> / <code>admin123</code></small>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-primary" data-demo-email="admin@demo.com" data-demo-password="admin123">
                              <i class="fas fa-user-cog"></i>
                            </button>
                          </div>
                        </div>
                        <div class="col-12 mb-2">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <strong class="text-success">評価者:</strong><br>
                              <small><code>evaluator@demo.com</code> / <code>eval123</code></small>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-success" data-demo-email="evaluator@demo.com" data-demo-password="eval123">
                              <i class="fas fa-user-check"></i>
                            </button>
                          </div>
                        </div>
                        <div class="col-12 mb-2">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <strong class="text-info">作業員:</strong><br>
                              <small><code>worker@demo.com</code> / <code>work123</code></small>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-info" data-demo-email="worker@demo.com" data-demo-password="work123">
                              <i class="fas fa-user"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <!-- 本番モードでは一時認証メッセージを非表示 -->
                    </div>

                    <div class="text-center mt-4">
                        <a href="#/register-admin" data-link data-i18n="auth.register_admin_link">管理者アカウントの新規登録はこちら</a>
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

  async init() {
    const form = document.getElementById("loginForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // パスワードリセットボタン
    const forgotPasswordBtn = document.getElementById("forgot-password-btn");
    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener("click", () => {
        this.handleForgotPassword();
      });
    }

    this.app.i18n.updateUI();

    // 🔧 改善：グローバル変数を使わずイベントデリゲーションでデモアカウント入力
    this.setupDemoAccountButtons();
  }

  /**
   * デモアカウント自動入力機能（イベントデリゲーション版）
   */
  setupDemoAccountButtons() {
    const demoSection = document.querySelector('.demo-accounts-section');
    if (!demoSection) return;

    demoSection.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-demo-email]');
      if (!button) return;

      const email = button.dataset.demoEmail;
      const password = button.dataset.demoPassword;

      if (email && password) {
        this.fillDemoCredentials(email, password);
      }
    });
  }

  /**
   * デモアカウント情報を入力フィールドに設定
   */
  fillDemoCredentials(email, password) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = password;

      // 入力フィールドをハイライト
      emailInput.classList.add('is-valid');
      passwordInput.classList.add('is-valid');

      setTimeout(() => {
        emailInput.classList.remove('is-valid');
        passwordInput.classList.remove('is-valid');
      }, 1000);
    }
  }

  async handleLogin() {
    if (this.isLoading) return;

    // ロックアウトチェック
    if (this.isLockedOut) {
      const remainingTime = Math.ceil((this.lockoutEndTime - Date.now()) / 1000 / 60);
      if (remainingTime > 0) {
        this.app.showError(`セキュリティのため、ログインが一時的にロックされています。${remainingTime}分後に再試行してください。`);
        return;
      } else {
        // ロックアウト期間が終了したらリセット
        this.resetLockout();
      }
    }

    this.setLoadingState(true);
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      if (!email || !password) throw new Error(this.app.i18n.t("errors.email_password_required"));

      await this.app.login(email, password);

      // ログイン成功時にカウントをリセット
      this.resetLockout();
    } catch (error) {
      // ログイン失敗時の処理
      this.loginAttempts++;
      console.warn(`Login attempt ${this.loginAttempts}/${this.maxAttempts} failed:`, error.code || error.message);

      if (this.loginAttempts >= this.maxAttempts) {
        this.isLockedOut = true;
        this.lockoutEndTime = Date.now() + this.lockoutTime;
        console.error('Account locked due to too many failed login attempts');
        this.app.showError(`ログインに${this.maxAttempts}回失敗しました。セキュリティのため、${this.lockoutTime / 60000}分間ロックされます。`);
      } else {
        const remainingAttempts = this.maxAttempts - this.loginAttempts;
        const errorMessage = this.app.auth?.getFirebaseAuthErrorMessage?.(error) || error.message || '認証エラーが発生しました';
        this.app.showError(`${errorMessage} (残り試行回数: ${remainingAttempts})`);
      }
    } finally {
      this.setLoadingState(false);
    }
  }

  resetLockout() {
    this.loginAttempts = 0;
    this.isLockedOut = false;
    this.lockoutEndTime = null;
  }

  async handleForgotPassword() {
    const email = document.getElementById("email").value.trim();

    if (!email) {
      const userEmail = prompt("パスワードリセットメールを送信するメールアドレスを入力してください:");
      if (!userEmail) return;

      try {
        await this.app.auth.sendPasswordResetEmail(userEmail);
        this.app.showSuccess(`${userEmail} にパスワードリセットメールを送信しました。`);
      } catch (error) {
        console.error("Password reset error:", error);
        this.app.showError("パスワードリセットメールの送信に失敗しました: " + error.message);
      }
    } else {
      try {
        await this.app.auth.sendPasswordResetEmail(email);
        this.app.showSuccess(`${email} にパスワードリセットメールを送信しました。`);
      } catch (error) {
        console.error("Password reset error:", error);
        this.app.showError("パスワードリセットメールの送信に失敗しました: " + error.message);
      }
    }
  }

  setLoadingState(loading) {
    this.isLoading = loading;
    const loginButton = document.getElementById("loginButton");
    const loginText = loginButton?.querySelector(".login-text");
    const loginSpinner = loginButton?.querySelector(".login-spinner");

    if (loginButton) loginButton.disabled = loading;
    loginText?.classList.toggle("d-none", loading);
    loginSpinner?.classList.toggle("d-none", !loading);
  }
}
