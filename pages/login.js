/**
 * Login Page Component
 * ログインページコンポーネント
 */
export class LoginPage {
  constructor(app) {
    this.app = app;
    this.isLoading = false;
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
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="fillDemoCredentials('admin@demo.com', 'admin123')">
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
                            <button type="button" class="btn btn-sm btn-outline-success" onclick="fillDemoCredentials('evaluator@demo.com', 'eval123')">
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
                            <button type="button" class="btn btn-sm btn-outline-info" onclick="fillDemoCredentials('worker@demo.com', 'work123')">
                              <i class="fas fa-user"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <small class="text-muted d-block text-center mt-2">
                        <i class="fas fa-clock me-1"></i>一時認証システム使用中
                      </small>
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
    this.app.i18n.updateUI();
    
    // デモアカウント自動入力機能
    window.fillDemoCredentials = (email, password) => {
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
    };
  }

  async handleLogin() {
    if (this.isLoading) return;
    this.setLoadingState(true);
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      if (!email || !password) throw new Error(this.app.i18n.t("errors.email_password_required"));
      await this.app.login(email, password);
    } catch (error) {
      this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(error));
    } finally {
      this.setLoadingState(false);
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
