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
  async render(fullPath) {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")

    if (!token) {
      return `
                <div class="form-container">
                    <div class="alert alert-error">
                        <h3>無効なアクセス</h3>
                        <p>招待リンクが無効です。管理者にお問い合わせください。</p>
                        <a href="/login" class="btn btn-primary">ログインページに戻る</a>
                    </div>
                </div>
            `
    }

    try {
      this.invitation = await this.app.api.getInvitation(token)
    } catch (error) {
      return `
                <div class="form-container">
                    <div class="alert alert-error">
                        <h3>招待リンクエラー</h3>
                        <p>${error.message}</p>
                        <a href="/login" class="btn btn-primary">ログインページに戻る</a>
                    </div>
                </div>
            `
    }

    return `
            <div class="form-container">
                <h2>ユーザー登録</h2>
                <div class="alert alert-info">
                    <p><strong>招待情報:</strong></p>
                    <p>役割: ${this.getRoleDisplayName(this.invitation.role)}</p>
                    ${this.invitation.company ? `<p>企業: ${this.invitation.company}</p>` : ""}
                </div>
                
                <form id="registerForm" onsubmit="RegisterPage.handleSubmit(event)">
                    <input type="hidden" name="token" value="${token}">
                    
                    <div class="form-group">
                        <label for="name">氏名 *</label>
                        <input type="text" id="name" name="name" required 
                               placeholder="山田 太郎"
                               ${this.invitation.name ? `value="${this.invitation.name}"` : ""}>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">メールアドレス *</label>
                        <input type="email" id="email" name="email" required 
                               placeholder="user@example.com"
                               ${this.invitation.email ? `value="${this.invitation.email}" readonly` : ""}>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">パスワード *</label>
                        <input type="password" id="password" name="password" required 
                               minlength="6" placeholder="6文字以上">
                        <small class="text-muted">6文字以上で入力してください</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">パスワード確認 *</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required 
                               placeholder="パスワードを再入力">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" id="registerBtn">
                        登録申請
                    </button>
                </form>
                
                <div class="mt-2 text-center">
                    <a href="/login" onclick="RegisterPage.navigate('/login')">
                        ログインページに戻る
                    </a>
                </div>
                
                <div class="alert alert-warning mt-2">
                    <h4>登録について</h4>
                    <ul>
                        <li>登録後、管理者による承認が必要です</li>
                        <li>承認完了後、システムをご利用いただけます</li>
                        <li>承認状況については管理者にお問い合わせください</li>
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
      this.app.i18n.updateUI()
    }

    // Add password confirmation validation
    this.setupPasswordValidation()
  }

  /**
   * Setup password confirmation validation
   * パスワード確認バリデーションを設定
   */
  setupPasswordValidation() {
    const password = document.getElementById("password")
    const confirmPassword = document.getElementById("confirmPassword")

    if (!password || !confirmPassword) return

    const validatePasswords = () => {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("パスワードが一致しません")
      } else {
        confirmPassword.setCustomValidity("")
      }
    }

    password.addEventListener("input", validatePasswords)
    confirmPassword.addEventListener("input", validatePasswords)
  }

  /**
   * Get role display name
   * ロール表示名を取得
   */
  getRoleDisplayName(role) {
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
  static async handleSubmit(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)

    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    }

    const token = formData.get("token")

    // Validate password confirmation
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    if (password !== confirmPassword) {
      window.app.showError("パスワードが一致しません。")
      return
    }

    const registerBtn = document.getElementById("registerBtn")
    const originalText = registerBtn.textContent

    try {
      // Show loading state
      registerBtn.disabled = true
      registerBtn.textContent = "登録中..."

      // Register with invitation
      await window.app.api.registerWithInvitation(token, userData)

      // Show success message
      window.app.showSuccess("ユーザー登録申請を送信しました。承認をお待ちください。")

      // Navigate to login page
      setTimeout(() => {
        window.app.navigate("/login")
      }, 2000)
    } catch (error) {
      console.error("Register error:", error)

      let errorMessage = "登録申請に失敗しました。"
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "このメールアドレスは既に使用されています。"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "パスワードが弱すぎます。"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "メールアドレスの形式が正しくありません。"
      }

      window.app.showError(errorMessage)

      // Reset button
      registerBtn.disabled = false
      registerBtn.textContent = originalText
    }
  }

  /**
   * Navigate to path
   * パスに移動
   */
  static navigate(path) {
    event.preventDefault()
    window.app.navigate(path)
  }
}

// Make RegisterPage globally available
window.RegisterPage = RegisterPage
