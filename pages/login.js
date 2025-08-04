/**
 * Login Page Component (with debugging)
 * ログインページコンポーネント（デバッグ用）
 */
export class LoginPage {
  constructor(app) {
    this.app = app;
    this.isLoading = false;
  }

  async render() {
    // HTML構造は変更ありません
    return `
      <div class="login-page">
        <div class="container-fluid vh-100">
          <div class="row h-100">
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary text-white">
              <div class="text-center p-5">
                <i class="fas fa-hard-hat fa-5x mb-4 opacity-75"></i>
                <h1 class="display-4 fw-bold" data-i18n="app.system_name">評価管理システム</h1>
                <p class="lead" data-i18n="login.lead_text">建設業の特性に合わせた従業員評価管理システム</p>
              </div>
            </div>

            <div class="col-lg-6 d-flex align-items-center justify-content-center bg-light">
              <div class="login-form-container w-100" style="max-width: 400px;">
                <div class="card shadow-lg border-0">
                  <div class="card-body p-5">
                    <div class="text-center mb-4">
                      <h2 class="card-title h3 mb-2" data-i18n="auth.login">ログイン</h2>
                      <p class="text-muted" data-i18n="login.sign_in_hint">アカウント情報を入力してください</p>
                    </div>

                    <form id="loginForm">
                      <div class="mb-3">
                        <label for="email" class="form-label fw-bold" data-i18n="auth.email_label">メールアドレス</label>
                        <input type="email" class="form-control form-control-lg" id="email" required autocomplete="email" placeholder="user@example.com">
                      </div>
                      <div class="mb-4">
                        <label for="password" class="form-label fw-bold" data-i18n="auth.password_label">パスワード</label>
                        <input type="password" class="form-control form-control-lg" id="password" required autocomplete="current-password" placeholder="6文字以上">
                      </div>
                      <button type="submit" class="btn btn-primary btn-lg w-100" id="loginButton">
                        <span class="login-text"><i class="fas fa-sign-in-alt me-2"></i><span data-i18n="auth.login">ログイン</span></span>
                        <span class="login-spinner d-none"><span class="spinner-border spinner-border-sm me-2"></span><span data-i18n="auth.logging_in">ログイン中...</span></span>
                      </button>
                    </form>
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
    console.log("DEBUG: LoginPage init() - ページ初期化を開始します。"); // デバッグ用ログ①
    const form = document.getElementById("loginForm");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
      console.log("DEBUG: LoginPage init() - フォームにsubmitイベントを設定しました。"); // デバッグ用ログ②
    } else {
      console.error("DEBUG: LoginPage init() - エラー: loginFormが見つかりません！"); // デバッグ用ログ
    }

    this.app.i18n.updateUI();
  }

  async handleLogin() {
    console.log("DEBUG: handleLogin() - ログインボタンがクリックされ、処理を開始します。"); // デバッグ用ログ③

    if (this.isLoading) {
      console.log("DEBUG: handleLogin() - 処理中のため中断します。");
      return;
    }

    this.setLoadingState(true);
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      if (!email || !password) throw new Error(this.app.i18n.t("errors.email_password_required"));
      
      console.log(`DEBUG: handleLogin() - ログイン試行: ${email}`);
      await this.app.login(email, password);

    } catch (error) {
      console.error("DEBUG: handleLogin() - ログイン処理中にエラーが発生しました:", error);
      this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(error));
    } finally {
      console.log("DEBUG: handleLogin() - ログイン処理が完了し、ボタンの状態をリセットします。"); // デバッグ用ログ④
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
