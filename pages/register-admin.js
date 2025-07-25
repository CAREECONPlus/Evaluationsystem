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
                                            管理者アカウント登録
                                        </h3>
                                        <p class="mb-0 mt-2 text-muted">新しい管理者アカウントを作成します</p>
                                    </div>
                                    <div class="card-body">
                                        <form id="registerAdminForm" onsubmit="RegisterAdminPage.handleSubmit(event)">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="firstName" class="form-label">姓 *</label>
                                                        <input type="text" class="form-control" id="firstName" required>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="lastName" class="form-label">名 *</label>
                                                        <input type="text" class="form-control" id="lastName" required>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="email" class="form-label">メールアドレス *</label>
                                                <input type="email" class="form-control" id="email" required>
                                                <div class="form-text">このメールアドレスがログインIDになります</div>
                                            </div>
                                            
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="password" class="form-label">パスワード *</label>
                                                        <input type="password" class="form-control" id="password" required 
                                                               minlength="8" onkeyup="RegisterAdminPage.checkPasswordStrength()">
                                                        <div class="form-text">8文字以上で入力してください</div>
                                                        <div id="passwordStrength" class="password-strength"></div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label for="confirmPassword" class="form-label">パスワード確認 *</label>
                                                        <input type="password" class="form-control" id="confirmPassword" required 
                                                               onkeyup="RegisterAdminPage.checkPasswordMatch()">
                                                        <div id="passwordMatch" class="password-match"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="department" class="form-label">部署</label>
                                                <select class="form-select" id="department">
                                                    <option value="">部署を選択してください</option>
                                                    <option value="management">経営管理</option>
                                                    <option value="construction">建設部</option>
                                                    <option value="engineering">技術部</option>
                                                    <option value="safety">安全管理部</option>
                                                    <option value="hr">人事部</option>
                                                    <option value="finance">経理部</option>
                                                </select>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="position" class="form-label">役職</label>
                                                <input type="text" class="form-control" id="position" 
                                                       placeholder="例: 部長、課長、主任">
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label for="phone" class="form-label">電話番号</label>
                                                <input type="tel" class="form-control" id="phone" 
                                                       placeholder="例: 090-1234-5678">
                                            </div>
                                            
                                            <div class="mb-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="canManageUsers" checked>
                                                    <label class="form-check-label" for="canManageUsers">
                                                        ユーザー管理権限
                                                    </label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="canManageEvaluations" checked>
                                                    <label class="form-check-label" for="canManageEvaluations">
                                                        評価管理権限
                                                    </label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="canViewReports" checked>
                                                    <label class="form-check-label" for="canViewReports">
                                                        レポート閲覧権限
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-4">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="agreeTerms" required>
                                                    <label class="form-check-label" for="agreeTerms">
                                                        <a href="#" onclick="RegisterAdminPage.showTerms()">利用規約</a>に同意します *
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div class="d-grid gap-2">
                                                <button type="submit" class="btn btn-primary btn-lg" id="submitBtn" disabled>
                                                    <i class="fas fa-user-plus me-2"></i>
                                                    管理者アカウントを作成
                                                </button>
                                                <a href="#/login" class="btn btn-outline-secondary">
                                                    <i class="fas fa-arrow-left me-2"></i>
                                                    ログインページに戻る
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

    submitBtn.disabled = !isValid
  }

  /**
   * Check password strength
   * パスワード強度をチェック
   */
  static checkPasswordStrength() {
    const password = document.getElementById("password").value
    const strengthDiv = document.getElementById("passwordStrength")

    let strength = 0
    const feedback = []

    if (password.length >= 8) strength++
    else feedback.push("8文字以上")

    if (/[a-z]/.test(password)) strength++
    else feedback.push("小文字")

    if (/[A-Z]/.test(password)) strength++
    else feedback.push("大文字")

    if (/[0-9]/.test(password)) strength++
    else feedback.push("数字")

    if (/[^A-Za-z0-9]/.test(password)) strength++
    else feedback.push("記号")

    const levels = ["非常に弱い", "弱い", "普通", "強い", "非常に強い"]
    const colors = ["#dc3545", "#fd7e14", "#ffc107", "#198754", "#0d6efd"]

    strengthDiv.innerHTML = `
            <div class="password-strength-bar">
                <div class="strength-level" style="width: ${(strength / 5) * 100}%; background-color: ${colors[strength - 1] || "#dc3545"}"></div>
            </div>
            <small class="text-muted">
                強度: ${levels[strength - 1] || levels[0]}
                ${feedback.length > 0 ? ` (必要: ${feedback.join(", ")})` : ""}
            </small>
        `
  }

  /**
   * Check password match
   * パスワード一致をチェック
   */
  static checkPasswordMatch() {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const matchDiv = document.getElementById("passwordMatch")

    if (confirmPassword.length === 0) {
      matchDiv.innerHTML = ""
      return
    }

    if (password === confirmPassword) {
      matchDiv.innerHTML = '<small class="text-success"><i class="fas fa-check"></i> パスワードが一致しています</small>'
    } else {
      matchDiv.innerHTML = '<small class="text-danger"><i class="fas fa-times"></i> パスワードが一致しません</small>'
    }
  }

  /**
   * Show terms modal
   * 利用規約モーダルを表示
   */
  static showTerms() {
    const modal = `
            <div class="modal fade" id="termsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">利用規約</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <h6>第1条（適用）</h6>
                            <p>本規約は、建設業従業員評価管理システムの利用に関して適用されます。</p>
                            
                            <h6>第2条（利用資格）</h6>
                            <p>本システムは、管理者権限を付与された者のみが利用できます。</p>
                            
                            <h6>第3条（禁止事項）</h6>
                            <ul>
                                <li>システムの不正利用</li>
                                <li>他者のアカウントの無断使用</li>
                                <li>機密情報の外部漏洩</li>
                                <li>システムの改ざんや破壊行為</li>
                            </ul>
                            
                            <h6>第4条（個人情報の取扱い）</h6>
                            <p>収集した個人情報は、評価管理の目的でのみ使用し、適切に保護します。</p>
                            
                            <h6>第5条（責任の制限）</h6>
                            <p>システムの利用により生じた損害について、当社は責任を負いません。</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", modal)
    const modalElement = window.bootstrap.Modal(document.getElementById("termsModal"))
    modalElement.show()

    document.getElementById("termsModal").addEventListener("hidden.bs.modal", function () {
      this.remove()
    })
  }

  /**
   * Handle form submission
   * フォーム送信処理
   */
  static async handleSubmit(event) {
    event.preventDefault()

    const submitBtn = document.getElementById("submitBtn")
    const originalText = submitBtn.innerHTML

    try {
      submitBtn.disabled = true
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>作成中...'

      const formData = new FormData(event.target)
      const adminData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        department: document.getElementById("department").value,
        position: document.getElementById("position").value,
        phone: document.getElementById("phone").value,
        permissions: {
          canManageUsers: document.getElementById("canManageUsers").checked,
          canManageEvaluations: document.getElementById("canManageEvaluations").checked,
          canViewReports: document.getElementById("canViewReports").checked,
        },
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
        tenantId: "default", // In real app, this would be dynamic
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real implementation, call API to create admin user
      // const result = await api.createAdminUser(adminData)

      // Show success message
      const alertDiv = document.createElement("div")
      alertDiv.className = "alert alert-success alert-dismissible fade show"
      alertDiv.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                管理者アカウントが正常に作成されました。
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `

      const form = document.getElementById("registerAdminForm")
      form.parentNode.insertBefore(alertDiv, form)

      // Reset form
      form.reset()

      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.hash = "#/login"
      }, 3000)
    } catch (error) {
      console.error("Admin registration error:", error)

      const alertDiv = document.createElement("div")
      alertDiv.className = "alert alert-danger alert-dismissible fade show"
      alertDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                管理者アカウントの作成に失敗しました: ${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `

      const form = document.getElementById("registerAdminForm")
      form.parentNode.insertBefore(alertDiv, form)
    } finally {
      submitBtn.disabled = false
      submitBtn.innerHTML = originalText
    }
  }
}

// Export for use in router
window.RegisterAdminPage = RegisterAdminPage

// Import Bootstrap
window.bootstrap = window.bootstrap || {}
