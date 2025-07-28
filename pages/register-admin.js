/**
 * Register Admin Page Component
 * 管理者登録ページコンポーネント
 */
class RegisterAdminPage {
  constructor(app) {
    this.app = app
  }

  /**
   * Render register admin page
   * 管理者登録ページを描画
   */
  async render() {
    return `
            <div class="app-layout">
                <div class="main-content" id="mainContent">
                    <div class="content-wrapper">
                        <div class="row justify-content-center">
                            <div class="col-md-8 col-lg-6">
                                <div class="card">
                                    <div class="card-header">
                                        <h3 class="mb-0">
                                            <i class="fas fa-user-shield me-2"></i>
                                            <span data-i18n="registration.admin_registration_title">管理者アカウント登録</span>
                                        </h3>
                                        <p class="mb-0 mt-2 text-muted" data-i18n="registration.create_new_admin_account">新しい管理者アカウントを作成します</p>
                                    </div>
                                    <div class="card-body">
                                        <form id="registerAdminForm">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="firstName" class="form-label" data-i18n="common.first_name_label"></label>
                                                        <input type="text" class="form-control" id="firstName" required data-i18n-placeholder="common.first_name_placeholder">
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="lastName" class="form-label" data-i18n="common.last_name_label"></label>
                                                        <input type="text" class="form-control" id="lastName" required data-i18n-placeholder="common.last_name_placeholder">
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="email" class="form-label" data-i18n="auth.email_label"></label>
                                                <input type="email" class="form-control" id="email" required data-i18n-placeholder="auth.email_placeholder">
                                                <div class="form-text" data-i18n="auth.email_as_login_id"></div>
                                            </div>
                                            
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="password" class="form-label" data-i18n="auth.password_label"></label>
                                                        <input type="password" class="form-control" id="password" required 
                                                               minlength="8" onkeyup="window.app.currentPage.checkPasswordStrength()">
                                                        <div class="form-text" data-i18n="auth.password_min_length_hint"></div>
                                                        <div id="passwordStrength" class="password-strength"></div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="confirmPassword" class="form-label" data-i18n="auth.confirm_password_label"></label>
                                                        <input type="password" class="form-control" id="confirmPassword" required 
                                                               onkeyup="window.app.currentPage.checkPasswordMatch()">
                                                        <div id="passwordMatch" class="password-match"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="department" class="form-label" data-i18n="common.department_label"></label>
                                                <select class="form-select" id="department">
                                                    <option value="" data-i18n="common.select_department"></option>
                                                    <option value="management" data-i18n="departments.management"></option>
                                                    <option value="construction" data-i18n="departments.construction"></option>
                                                    <option value="engineering" data-i18n="departments.engineering"></option>
                                                    <option value="safety" data-i18n="departments.safety"></option>
                                                    <option value="hr" data-i18n="departments.hr"></option>
                                                    <option value="finance" data-i18n="departments.finance"></option>
                                                </select>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="position" class="form-label" data-i18n="common.position_label"></label>
                                                <input type="text" class="form-control" id="position" 
                                                       data-i18n-placeholder="common.position_placeholder">
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="phone" class="form-label" data-i18n="common.phone_label"></label>
                                                <input type="tel" class="form-control" id="phone" 
                                                       data-i18n-placeholder="common.phone_placeholder">
                                            </div>
                                            
                                            <div class="mb-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="canManageUsers" checked>
                                                    <label class="form-check-label" for="canManageUsers" data-i18n="permissions.manage_users"></label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="canManageEvaluations" checked>
                                                    <label class="form-check-label" for="canManageEvaluations" data-i18n="permissions.manage_evaluations"></label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="canViewReports" checked>
                                                    <label class="form-check-label" for="canViewReports" data-i18n="permissions.view_reports"></label>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-4">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="agreeTerms" required>
                                                    <label class="form-check-label" for="agreeTerms">
                                                        <a href="#" onclick="window.app.currentPage.showTerms()"><span data-i18n="registration.terms_of_service"></span></a><span data-i18n="common.agree_to_terms"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div class="d-grid gap-2">
                                                <button type="submit" class="btn btn-primary btn-lg" id="submitBtn" disabled>
                                                    <i class="fas fa-user-plus me-2"></i>
                                                    <span data-i18n="registration.create_admin_account"></span>
                                                </button>
                                                <a href="#/login" class="btn btn-outline-secondary" onclick="event.preventDefault(); window.app.navigate('/login')">
                                                    <i class="fas fa-arrow-left me-2"></i>
                                                    <span data-i18n="common.back_to_login"></span>
                                                </a>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Initialize page after render
   * ページ描画後の初期化
   */
  async afterRender() {
    this.setupEventListeners()
    this.checkFormValidity()
    if (this.app.i18n) {
      this.app.i18n.updateUI(); // 翻訳を適用
    }
    // フォーム送信ハンドラをインスタンスメソッドにバインド
    const form = document.getElementById("registerAdminForm");
    if (form) {
        form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  /**
   * Setup event listeners
   * イベントリスナーの設定
   */
  setupEventListeners() {
    const form = document.getElementById("registerAdminForm")
    const inputs = form.querySelectorAll("input, select")
    const agreeTerms = document.getElementById("agreeTerms")

    inputs.forEach((input) => {
      input.addEventListener("input", () => this.checkFormValidity())
      input.addEventListener("change", () => this.checkFormValidity())
    })

    agreeTerms.addEventListener("change", () => this.checkFormValidity())
  }

  /**
   * Check form validity
   * フォームの有効性をチェック
   */
  checkFormValidity() {
    const form = document.getElementById("registerAdminForm")
    const submitBtn = document.getElementById("submitBtn")
    const agreeTerms = document.getElementById("agreeTerms")
    const password = document.getElementById("password")
    const confirmPassword = document.getElementById("confirmPassword")

    const isValid =
      form.checkValidity() &&
      agreeTerms.checked &&
      password.value === confirmPassword.value &&
      password.value.length >= 8

    if(submitBtn) submitBtn.disabled = !isValid
  }

  /**
   * Check password strength
   * パスワード強度をチェック
   */
  checkPasswordStrength() {
    const password = document.getElementById("password").value
    const strengthDiv = document.getElementById("passwordStrength")

    let strength = 0
    const feedback = []

    if (password.length >= 8) strength++
    else feedback.push(this.app.i18n.t("forms.password_hint_length")) // 翻訳キー

    if (/[a-z]/.test(password)) strength++
    else feedback.push(this.app.i18n.t("forms.password_hint_lowercase")) // 翻訳キー

    if (/[A-Z]/.test(password)) strength++
    else feedback.push(this.app.i18n.t("forms.password_hint_uppercase")) // 翻訳キー

    if (/[0-9]/.test(password)) strength++
    else feedback.push(this.app.i18n.t("forms.password_hint_number")) // 翻訳キー

    if (/[^A-Za-z0-9]/.test(password)) strength++
    else feedback.push(this.app.i18n.t("forms.password_hint_symbol")) // 翻訳キー

    const levels = [
        this.app.i18n.t("forms.password_strength_very_weak"), // 非常に弱い
        this.app.i18n.t("forms.password_strength_weak"),      // 弱い
        this.app.i18n.t("forms.password_strength_normal"),     // 普通
        this.app.i18n.t("forms.password_strength_strong"),     // 強い
        this.app.i18n.t("forms.password_strength_very_strong") // 非常に強い
    ];
    const colors = ["#dc3545", "#fd7e14", "#ffc107", "#198754", "#0d6efd"]

    if(strengthDiv) {
        strengthDiv.innerHTML = `
            <div class="password-strength-bar">
                <div class="strength-level" style="width: ${(strength / 5) * 100}%; background-color: ${colors[strength - 1] || "#dc3545"}"></div>
            </div>
            <small class="text-muted">
                <span data-i18n="forms.password_strength">強度</span>: ${levels[strength - 1] || levels[0]}
                ${feedback.length > 0 ? ` (<span data-i18n="forms.required">必要</span>: ${feedback.join(", ")})` : ""}
            </small>
        `
        this.app.i18n.updateUI(strengthDiv); // 翻訳を適用
    }
    this.checkFormValidity(); // 強度チェック後にフォームの有効性を再確認
  }

  /**
   * Check password match
   * パスワード一致をチェック
   */
  checkPasswordMatch() {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const matchDiv = document.getElementById("passwordMatch")

    if (confirmPassword.length === 0) {
      if(matchDiv) matchDiv.innerHTML = ""
      this.checkFormValidity(); // 一致チェック後にフォームの有効性を再確認
      return
    }

    if(matchDiv) {
        if (password === confirmPassword) {
            matchDiv.innerHTML = `<small class="text-success"><i class="fas fa-check"></i> <span data-i18n="forms.password_match"></span></small>`
        } else {
            matchDiv.innerHTML = `<small class="text-danger"><i class="fas fa-times"></i> <span data-i18n="forms.password_mismatch"></span></small>`
        }
        this.app.i18n.updateUI(matchDiv); // 翻訳を適用
    }
    this.checkFormValidity(); // 一致チェック後にフォームの有効性を再確認
  }

  /**
   * Show terms modal
   * 利用規約モーダルを表示
   */
  showTerms() {
    const modal = `
            <div class="modal fade" id="termsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" data-i18n="registration.terms_of_service"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <h6 data-i18n="terms.article1_title"></h6>
                            <p data-i18n="terms.article1_content"></p>
                            
                            <h6 data-i18n="terms.article2_title"></h6>
                            <p data-i18n="terms.article2_content"></p>
                            
                            <h6 data-i18n="terms.article3_title"></h6>
                            <ul>
                                <li data-i18n="terms.article3_item1"></li>
                                <li data-i18n="terms.article3_item2"></li>
                                <li data-i18n="terms.article3_item3"></li>
                                <li data-i18n="terms.article3_item4"></li>
                            </ul>
                            
                            <h6 data-i18n="terms.article4_title"></h6>
                            <p data-i18n="terms.article4_content"></p>
                            
                            <h6 data-i18n="terms.article5_title"></h6>
                            <p data-i18n="terms.article5_content"></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.close"></button>
                        </div>
                    </div>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", modal)
    const modalElement = new window.bootstrap.Modal(document.getElementById("termsModal"))
    this.app.i18n.updateUI(document.getElementById("termsModal")); // モーダル内の翻訳を適用
    modalElement.show()

    document.getElementById("termsModal").addEventListener("hidden.bs.modal", function () {
      this.remove()
    })
  }

  /**
   * Handle form submission
   * フォーム送信処理
   */
  async handleSubmit(event) {
    event.preventDefault()

    const submitBtn = document.getElementById("submitBtn")
    const originalText = submitBtn.innerHTML

    try {
      submitBtn.disabled = true
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i><span data-i18n="common.creating"></span>`
      this.app.i18n.updateUI(submitBtn); // 翻訳を適用

      // 実際にはformData.get()はフォーム入力のname属性に依存
      const adminData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value, // In real app, password should not be directly passed or should be hashed
        department: document.getElementById("department").value,
        position: document.getElementById("position").value,
        phone: document.getElementById("phone").value,
        permissions: {
          canManageUsers: document.getElementById("canManageUsers").checked,
          canManageEvaluations: document.getElementById("canManageEvaluations").checked,
          canViewReports: document.getElementById("canViewReports").checked,
        },
        role: "admin",
        status: "developer_approval_pending", // 初回は開発者承認待ち
        createdAt: new Date().toISOString(),
        tenantId: "default", // For initial mock, tenantId is not yet assigned. Firebase function would assign it.
      }

      // Simulate API call for creating admin for approval
      // await this.app.api.createAdminForApproval(adminData); // ここにAPI呼び出しが入る

      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Show success message
      const alertDiv = document.createElement("div")
      alertDiv.className = "alert alert-success alert-dismissible fade show mt-3"
      alertDiv.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                <span data-i18n="messages.admin_registration_success"></span>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `
      this.app.i18n.updateUI(alertDiv); // 翻訳を適用

      const form = document.getElementById("registerAdminForm")
      form.parentNode.insertBefore(alertDiv, form)

      // Reset form
      form.reset()

      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.app.navigate("#/login")
      }, 3000)
    } catch (error) {
      console.error("Admin registration error:", error)

      let errorMessage = this.app.i18n.t("errors.registration_failed"); // 翻訳キー
      // Firebase Authenticationエラーコードに応じたメッセージ表示はAuthサービスで行う
      // 例: if (error.code === 'auth/email-already-in-use') errorMessage = this.app.i18n.t("errors.email_already_in_use");

      const alertDiv = document.createElement("div")
      alertDiv.className = "alert alert-danger alert-dismissible fade show mt-3"
      alertDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <span data-i18n="common.error_message_prefix"></span>${errorMessage}: ${this.app.sanitizeHtml(error.message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `
      this.app.i18n.updateUI(alertDiv); // 翻訳を適用

      const form = document.getElementById("registerAdminForm")
      form.parentNode.insertBefore(alertDiv, form)
    } finally {
      submitBtn.disabled = false
      submitBtn.innerHTML = originalText // 元のテキストに戻す
      this.app.i18n.updateUI(submitBtn); // 翻訳を適用
    }
  }
}

// Export for use in router
window.RegisterAdminPage = RegisterAdminPage

// Note: window.bootstrap is usually defined by the Bootstrap script itself.
// This line might not be necessary if Bootstrap is loaded correctly before this script.
// window.bootstrap = window.bootstrap || {}
