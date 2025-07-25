/**
 * Login Page Component
 * ログインページコンポーネント
 */
class LoginPage {
  constructor(app) {
    this.app = app
    this.isLoading = false
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
            <!-- Left Side - Branding -->
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary text-white">
              <div class="text-center">
                <div class="mb-4">
                  <i class="fas fa-hard-hat fa-5x mb-3 opacity-75"></i>
                </div>
                <h1 class="display-4 fw-bold mb-4">建設業従業員評価管理システム</h1>
                <p class="lead mb-4">効率的な人事評価で組織の成長を支援します</p>
                <div class="features">
                  <div class="row text-start">
                    <div class="col-md-6 mb-3">
                      <i class="fas fa-check-circle me-2"></i>
                      <span>簡単な評価管理</span>
                    </div>
                    <div class="col-md-6 mb-3">
                      <i class="fas fa-check-circle me-2"></i>
                      <span>リアルタイム分析</span>
                    </div>
                    <div class="col-md-6 mb-3">
                      <i class="fas fa-check-circle me-2"></i>
                      <span>多言語対応</span>
                    </div>
                    <div class="col-md-6 mb-3">
                      <i class="fas fa-check-circle me-2"></i>
                      <span>セキュアな環境</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side - Login Form -->
            <div class="col-lg-6 d-flex align-items-center justify-content-center">
              <div class="login-form-container w-100" style="max-width: 400px;">
                <div class="card shadow-lg border-0">
                  <div class="card-body p-5">
                    <!-- Logo for mobile -->
                    <div class="text-center d-lg-none mb-4">
                      <i class="fas fa-hard-hat fa-3x text-primary mb-2"></i>
                      <h4 class="text-primary">評価管理システム</h4>
                    </div>

                    <div class="text-center mb-4">
                      <h2 class="card-title h3 mb-2">ログイン</h2>
                      <p class="text-muted">アカウントにサインインしてください</p>
                    </div>

                    <!-- Login Form -->
                    <form id="loginForm" onsubmit="return false;">
                      <div class="mb-3">
                        <label for="email" class="form-label fw-bold">メールアドレス</label>
                        <div class="input-group">
                          <span class="input-group-text">
                            <i class="fas fa-envelope text-muted"></i>
                          </span>
                          <input 
                            type="email" 
                            class="form-control form-control-lg" 
                            id="email" 
                            name="email"
                            placeholder="example@company.com"
                            required
                            autocomplete="email"
                          >
                        </div>
                      </div>

                      <div class="mb-3">
                        <label for="password" class="form-label fw-bold">パスワード</label>
                        <div class="input-group">
                          <span class="input-group-text">
                            <i class="fas fa-lock text-muted"></i>
                          </span>
                          <input 
                            type="password" 
                            class="form-control form-control-lg" 
                            id="password" 
                            name="password"
                            placeholder="パスワードを入力"
                            required
                            autocomplete="current-password"
                          >
                        </div>
                      </div>

                      <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="rememberMe">
                        <label class="form-check-label" for="rememberMe">
                          ログイン状態を保持する
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        class="btn btn-primary btn-lg w-100 mb-3"
                        id="loginButton"
                        onclick="window.loginPage.handleLogin(event)"
                      >
                        <span class="login-text">
                          <i class="fas fa-sign-in-alt me-2"></i>
                          ログイン
                        </span>
                        <span class="login-spinner d-none">
                          <i class="fas fa-spinner fa-spin me-2"></i>
                          ログイン中...
                        </span>
                      </button>
                    </form>

                    <div class="text-center mb-3">
                      <a href="#" onclick="window.app.navigate('/register')" class="text-decoration-none">
                        <i class="fas fa-user-plus me-1"></i>
                        新規アカウント作成
                      </a>
                    </div>

                    <!-- Demo Accounts Section -->
                    <div class="demo-accounts">
                      <hr class="my-4">
                      <h6 class="text-center mb-3 text-muted">
                        <i class="fas fa-play-circle me-2"></i>
                        デモアカウント
                      </h6>
                      <div class="row g-2">
                        <div class="col-12">
                          <button 
                            type="button" 
                            class="btn btn-outline-success btn-sm w-100 demo-btn"
                            onclick="window.loginPage.loginDemo('admin')"
                          >
                            <i class="fas fa-user-shield me-2"></i>
                            <strong>管理者</strong>
                            <small class="d-block text-muted">admin@example.com</small>
                          </button>
                        </div>
                        <div class="col-12">
                          <button 
                            type="button" 
                            class="btn btn-outline-info btn-sm w-100 demo-btn"
                            onclick="window.loginPage.loginDemo('manager')"
                          >
                            <i class="fas fa-user-tie me-2"></i>
                            <strong>マネージャー</strong>
                            <small class="d-block text-muted">manager@example.com</small>
                          </button>
                        </div>
                        <div class="col-12">
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary btn-sm w-100 demo-btn"
                            onclick="window.loginPage.loginDemo('employee')"
                          >
                            <i class="fas fa-user me-2"></i>
                            <strong>従業員</strong>
                            <small class="d-block text-muted">employee@example.com</small>
                          </button>
                        </div>
                      </div>
                      <div class="text-center mt-3">
                        <small class="text-muted">
                          <i class="fas fa-info-circle me-1"></i>
                          デモアカウントはワンクリックでログインできます
                        </small>
                      </div>
                    </div>
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
   * Initialize login page
   * ログインページを初期化
   */
  async init() {
    try {
      console.log("Initializing login page...")

      // Hide header and sidebar for login page
      if (window.HeaderComponent) {
        window.HeaderComponent.hide()
      }
      if (window.SidebarComponent) {
        window.SidebarComponent.hide()
      }

      // Focus on email input after a short delay
      setTimeout(() => {
        const emailInput = document.getElementById("email")
        if (emailInput) {
          emailInput.focus()
        }
      }, 100)

      // Add enter key handler for form
      const form = document.getElementById("loginForm")
      if (form) {
        form.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && !this.isLoading) {
            this.handleLogin(e)
          }
        })
      }

      console.log("Login page initialized successfully")
    } catch (error) {
      console.error("Error initializing login page:", error)
    }
  }

  /**
   * Handle login form submission
   * ログインフォーム送信を処理
   */
  async handleLogin(event) {
    event.preventDefault()

    if (this.isLoading) return

    try {
      this.isLoading = true
      this.setLoadingState(true)

      const email = document.getElementById("email").value.trim()
      const password = document.getElementById("password").value

      console.log("Attempting login with:", email)

      // Validate inputs
      if (!email || !password) {
        throw new Error("メールアドレスとパスワードを入力してください。")
      }

      if (!this.isValidEmail(email)) {
        throw new Error("有効なメールアドレスを入力してください。")
      }

      // Call app login method
      await this.app.login(email, password)

      console.log("Login successful, redirecting...")
    } catch (error) {
      console.error("Login error:", error)
      this.app.showError(error.message || "ログインに失敗しました。メールアドレスとパスワードを確認してください。")
    } finally {
      this.isLoading = false
      this.setLoadingState(false)
    }
  }

  /**
   * Handle demo login
   * デモログインを処理
   */
  async loginDemo(role) {
    if (this.isLoading) return

    const demoAccounts = {
      admin: { email: "admin@example.com", password: "password" },
      manager: { email: "manager@example.com", password: "password" },
      employee: { email: "employee@example.com", password: "password" },
    }

    const account = demoAccounts[role]
    if (!account) {
      this.app.showError("無効なデモアカウントです。")
      return
    }

    try {
      this.isLoading = true
      this.setLoadingState(true)

      // Fill form fields
      document.getElementById("email").value = account.email
      document.getElementById("password").value = account.password

      // Add visual feedback
      const demoButtons = document.querySelectorAll(".demo-btn")
      demoButtons.forEach((btn) => (btn.disabled = true))

      // Perform login
      await this.app.login(account.email, account.password)
    } catch (error) {
      console.error("Demo login error:", error)
      this.app.showError(error.message || "デモログインに失敗しました。")
    } finally {
      this.isLoading = false
      this.setLoadingState(false)

      // Re-enable demo buttons
      const demoButtons = document.querySelectorAll(".demo-btn")
      demoButtons.forEach((btn) => (btn.disabled = false))
    }
  }

  /**
   * Set loading state
   * ローディング状態を設定
   */
  setLoadingState(loading) {
    const loginButton = document.getElementById("loginButton")
    const loginText = loginButton?.querySelector(".login-text")
    const loginSpinner = loginButton?.querySelector(".login-spinner")

    if (loading) {
      if (loginButton) loginButton.disabled = true
      if (loginText) loginText.classList.add("d-none")
      if (loginSpinner) loginSpinner.classList.remove("d-none")
    } else {
      if (loginButton) loginButton.disabled = false
      if (loginText) loginText.classList.remove("d-none")
      if (loginSpinner) loginSpinner.classList.add("d-none")
    }
  }

  /**
   * Validate email format
   * メールアドレスの形式を検証
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Clear form
   * フォームをクリア
   */
  clearForm() {
    const form = document.getElementById("loginForm")
    if (form) {
      form.reset()
    }
  }
}

// Make LoginPage globally available
window.LoginPage = LoginPage
