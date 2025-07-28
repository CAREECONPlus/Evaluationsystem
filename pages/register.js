/**
 * Register Page Component (with invitation token)
 * 登録ページコンポーネント（招待トークン付き）
 */
class RegisterPage {
  constructor(app) {
    this.app = app
    this.invitation = null
  }

  /**
   * Render register page
   * 登録ページを描画
   */
  async render() {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")

    if (!token) {
      return `
                <div class="form-container text-center p-4">
                    <div class="alert alert-danger">
                        <h3><span data-i18n="errors.invalid_access_title">無効なアクセス</span></h3>
                        <p><span data-i18n="errors.invalid_invitation_link">招待リンクが無効です。管理者にお問い合わせください。</span></p>
                        <a href="#/login" class="btn btn-primary mt-3" onclick="event.preventDefault(); window.app.navigate('/login')">
                            <span data-i18n="common.back_to_login"></span>
                        </a>
                    </div>
                </div>
            `
    }

    try {
      // Mock API call to get invitation details
      // In real app: this.invitation = await this.app.api.getInvitation(token);
      this.invitation = {
          id: 'mock-inv-123',
          token: token,
          role: 'worker', // example role
          company: 'モック建設株式会社', // example company
          email: 'invited-user@example.com', // example email
          used: false,
          expiresAt: Date.now() + 3600000 // 1 hour from now
      };

      if (!this.invitation || this.invitation.used || this.invitation.expiresAt < Date.now()) {
          let errorMessageKey = "errors.invalid_invitation_link";
          if (this.invitation?.used) errorMessageKey = "errors.used_invitation";
          else if (this.invitation?.expiresAt < Date.now()) errorMessageKey = "errors.expired_invitation";

          return `
                <div class="form-container text-center p-4">
                    <div class="alert alert-danger">
                        <h3><span data-i18n="errors.invitation_link_error_title">招待リンクエラー</span></h3>
                        <p data-i18n="${errorMessageKey}"></p>
                        <a href="#/login" class="btn btn-primary mt-3" onclick="event.preventDefault(); window.app.navigate('/login')">
                            <span data-i18n="common.back_to_login"></span>
                        </a>
                    </div>
                </div>
            `;
      }
      
    } catch (error) {
      return `
                <div class="form-container text-center p-4">
                    <div class="alert alert-danger">
                        <h3><span data-i18n="errors.invitation_link_error_title">招待リンクエラー</span></h3>
                        <p>${this.app.sanitizeHtml(error.message)}</p>
                        <a href="#/login" class="btn btn-primary mt-3" onclick="event.preventDefault(); window.app.navigate('/login')">
                            <span data-i18n="common.back_to_login"></span>
                        </a>
                    </div>
                </div>
            `
    }

    return `
            <div class="form-container p-4">
                <h2 class="text-center mb-4" data-i18n="registration.user_registration_title"></h2>
                <div class="alert alert-info">
                    <p><strong><span data-i18n="registration.invitation_info_title"></span></strong></p>
                    <p><span data-i18n="registration.invited_role"></span>: ${this.getRoleDisplayName(this.invitation.role)}</p>
                    ${this.invitation.company ? `<p><span data-i18n="auth.company_name_label"></span>: ${this.app.sanitizeHtml(this.invitation.company)}</p>` : ""}
                    ${this.invitation.email ? `<p><span data-i18n="auth.email_address_label"></span>: ${this.app.sanitizeHtml(this.invitation.email)}</p>` : ""}
                </div>
                
                <form id="registerForm">
                    <input type="hidden" name="token" value="${this.app.sanitizeHtml(token)}">
                    
                    <div class="mb-3">
                        <label for="name" class="form-label" data-i18n="auth.full_name_label"></label>
                        <input type="text" id="name" name="name" class="form-control" required 
                               data-i18n-placeholder="auth.full_name_placeholder"
                               value="${this.app.sanitizeHtml(this.invitation.name || '')}">
                    </div>
                    
                    <div class="mb-3">
                        <label for="email" class="form-label" data-i18n="auth.email_label"></label>
                        <input type="email" id="email" name="email" class="form-control" required 
                               data-i18n-placeholder="auth.email_placeholder"
                               value="${this.app.sanitizeHtml(this.invitation.email || '')}" ${this.invitation.email ? 'readonly' : ''}>
                    </div>
                    
                    <div class="mb-3">
                        <label for="password" class="form-label" data-i18n="auth.password_label"></label>
                        <input type="password" id="password" name="password" class="form-control" required 
                               minlength="6" data-i18n-placeholder="auth.password_min_hint">
                        <small class="text-muted" data-i18n="auth.password_min_length_hint_long"></small>
                    </div>
                    
                    <div class="mb-3">
                        <label for="confirmPassword" class="form-label" data-i18n="auth.confirm_password_label"></label>
                        <input type="password" id="confirmPassword" name="confirmPassword" class="form-control" required 
                               data-i18n-placeholder="auth.re_enter_password">
                        <div id="passwordMatch" class="mt-1"></div>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary btn-lg" id="registerBtn">
                            <span data-i18n="registration.register_application"></span>
                        </button>
                    </div>
                </form>
                
                <div class="mt-3 text-center">
                    <a href="#/login" onclick="event.preventDefault(); window.app.navigate('/login')">
                        <span data-i18n="common.back_to_login"></span>
                    </a>
                </div>
                
                <div class="alert alert-warning mt-3">
                    <h4><span data-i18n="registration.about_registration_title"></span></h4>
                    <ul>
                        <li data-i18n="registration.approval_required_after_reg"></li>
                        <li data-i18n="registration.approval_completion_info"></li>
                        <li data-i18n="registration.contact_admin_for_status"></li>
                    </ul>
                </div>
            </div>
        `
  }

  /**
   * Initialize register page
   * 登録ページを初期化
   */
  async init() {
    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }

    // Add password confirmation validation
    this.setupPasswordValidation();

    // フォーム送信ハンドラをインスタンスメソッドにバインド
    const form = document.getElementById("registerForm");
    if (form) {
        form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  /**
   * Setup password confirmation validation
   * パスワード確認バリデーションを設定
   */
  setupPasswordValidation() {
    const password = document.getElementById("password")
    const confirmPassword = document.getElementById("confirmPassword")
    const passwordMatchDiv = document.getElementById("passwordMatch")


    if (!password || !confirmPassword || !passwordMatchDiv) return

    const validatePasswords = () => {
      if (confirmPassword.value.length === 0) {
          passwordMatchDiv.innerHTML = "";
          confirmPassword.setCustomValidity("");
          return;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity(this.app.i18n.t("forms.passwords_not_match"));
        passwordMatchDiv.innerHTML = `<small class="text-danger"><i class="fas fa-times"></i> ${this.app.i18n.t("forms.passwords_not_match")}</small>`;
      } else {
        confirmPassword.setCustomValidity("");
        passwordMatchDiv.innerHTML = `<small class="text-success"><i class="fas fa-check"></i> ${this.app.i18n.t("forms.password_match_success")}</small>`;
      }
      this.app.i18n.updateUI(passwordMatchDiv); // 翻訳を適用
    }

    password.addEventListener("input", validatePasswords);
    confirmPassword.addEventListener("input", validatePasswords);
  }

  /**
   * Get role display name
   * ロール表示名を取得
   */
  getRoleDisplayName(role) {
    if (this.app && this.app.i18n) {
      return this.app.i18n.t('roles.' + role);
    }
    const roleNames = {
      admin: "管理者",
      evaluator: "評価者",
      worker: "作業員",
    }
    return roleNames[role] || role
  }

  /**
   * Handle register form submission
   * 登録フォーム送信を処理
   */
  async handleSubmit(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)

    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: this.invitation?.role, // 招待からロールを取得
      company: this.invitation?.company, // 招待から企業名を取得
    }

    const token = formData.get("token")

    // Validate password confirmation
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    if (password !== confirmPassword) {
      this.app.showError(this.app.i18n.t("forms.passwords_not_match_error")); // 翻訳キー
      return;
    }

    const registerBtn = document.getElementById("registerBtn")
    const originalText = registerBtn.innerHTML;

    try {
      // Show loading state
      if(registerBtn) {
          registerBtn.disabled = true;
          registerBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i><span data-i18n="common.registering"></span>`;
          this.app.i18n.updateUI(registerBtn);
      }
      
      // Register with invitation (mock)
      // await this.app.api.registerWithInvitation(token, userData);
      console.log("Registering with invitation (mock):", userData, "Token:", token);
      
      // Simulate user creation and invitation update
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In real app, update invitation status to used and create user with pending_approval status

      // Show success message
      this.app.showSuccess(this.app.i18n.t("messages.registration_submitted")); // 翻訳キー

      // Navigate to login page
      setTimeout(() => {
        window.app.navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);

      let errorMessage = this.app.i18n.t("errors.registration_failed");
      // Firebase Authenticationエラーコードに応じたメッセージ表示はAuthサービスで行う
      // 例: if (error.code === "auth/email-already-in-use") errorMessage = this.app.i18n.t("errors.email_already_in_use");
      
      this.app.showError(`${errorMessage}: ${this.app.sanitizeHtml(error.message)}`);

      // Reset button
      if(registerBtn) {
          registerBtn.disabled = false;
          registerBtn.innerHTML = originalText;
          this.app.i18n.updateUI(registerBtn);
      }
    }
  }
}

// Make RegisterPage globally available
window.RegisterPage = RegisterPage;
