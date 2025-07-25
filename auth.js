/**
 * Authentication Service
 * 認証サービス
 */
class Auth {
  constructor(app) {
    this.app = app
    this.currentUser = null
    this.isInitialized = false

    // Demo users for authentication
    this.demoUsers = [
      {
        id: "1",
        email: "admin@example.com",
        password: "password",
        name: "管理者",
        role: "admin",
        status: "active",
        createdAt: new Date("2024-01-01"),
        lastLogin: null,
      },
      {
        id: "2",
        email: "manager@example.com",
        password: "password",
        name: "マネージャー",
        role: "evaluator",
        status: "active",
        createdAt: new Date("2024-01-01"),
        lastLogin: null,
      },
      {
        id: "3",
        email: "employee@example.com",
        password: "password",
        name: "従業員",
        role: "worker",
        status: "active",
        createdAt: new Date("2024-01-01"),
        lastLogin: null,
      },
    ]
  }

  /**
   * Initialize authentication service
   * 認証サービスを初期化
   */
  async init() {
    try {
      console.log("Initializing Auth service...")

      // Check for existing session
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser)
          this.app.currentUser = this.currentUser
          console.log("Restored user session:", this.currentUser.email)
        } catch (error) {
          console.warn("Failed to restore user session:", error)
          localStorage.removeItem("currentUser")
        }
      }

      this.isInitialized = true
      console.log("Auth service initialized")
    } catch (error) {
      console.error("Failed to initialize Auth service:", error)
      throw error
    }
  }

  /**
   * Login user
   * ユーザーをログイン
   */
  async login(email, password) {
    try {
      console.log("Auth.login called with:", email)

      if (!email || !password) {
        throw new Error("メールアドレスとパスワードを入力してください。")
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user in demo users
      const user = this.demoUsers.find((u) => u.email === email && u.password === password)

      if (!user) {
        throw new Error("メールアドレスまたはパスワードが正しくありません。")
      }

      if (user.status !== "active") {
        throw new Error("アカウントが無効です。管理者にお問い合わせください。")
      }

      // Update last login
      user.lastLogin = new Date()

      // Set current user
      this.currentUser = { ...user }
      delete this.currentUser.password // Remove password from session

      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser))

      console.log("Login successful:", this.currentUser)
      return this.currentUser
    } catch (error) {
      console.error("Auth login failed:", error)
      throw error
    }
  }

  /**
   * Logout user
   * ユーザーをログアウト
   */
  logout() {
    try {
      console.log("Logging out user:", this.currentUser?.email)

      this.currentUser = null
      this.app.currentUser = null

      // Clear localStorage
      localStorage.removeItem("currentUser")

      console.log("Logout successful")
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    }
  }

  /**
   * Get current user
   * 現在のユーザーを取得
   */
  getCurrentUser() {
    return this.currentUser
  }

  /**
   * Check if user is authenticated
   * ユーザーが認証されているかチェック
   */
  isAuthenticated() {
    return !!this.currentUser
  }

  /**
   * Check if user has specific role
   * ユーザーが特定のロールを持っているかチェック
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role
  }

  /**
   * Check if user has any of the specified roles
   * ユーザーが指定されたロールのいずれかを持っているかチェック
   */
  hasAnyRole(roles) {
    return this.currentUser && roles.includes(this.currentUser.role)
  }

  /**
   * Register new user
   * 新しいユーザーを登録
   */
  async register(userData) {
    try {
      console.log("Registering new user:", userData.email)

      // Validate required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error("必須項目を入力してください。")
      }

      // Check if user already exists
      const existingUser = this.demoUsers.find((u) => u.email === userData.email)
      if (existingUser) {
        throw new Error("このメールアドレスは既に登録されています。")
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create new user
      const newUser = {
        id: this.generateId(),
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role || "employee",
        status: "pending_approval",
        createdAt: new Date(),
        lastLogin: null,
      }

      // Add to demo users
      this.demoUsers.push(newUser)

      console.log("User registered successfully:", newUser.email)
      return { ...newUser, password: undefined } // Don't return password
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  /**
   * Change password
   * パスワードを変更
   */
  async changePassword(currentPassword, newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error("ログインが必要です。")
      }

      // Find user in demo users
      const user = this.demoUsers.find((u) => u.id === this.currentUser.id)
      if (!user || user.password !== currentPassword) {
        throw new Error("現在のパスワードが正しくありません。")
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update password
      user.password = newPassword

      console.log("Password changed successfully")
      return true
    } catch (error) {
      console.error("Password change failed:", error)
      throw error
    }
  }

  /**
   * Generate unique ID
   * ユニークIDを生成
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
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
   * Validate password strength
   * パスワードの強度を検証
   */
  isValidPassword(password) {
    // At least 6 characters
    return password && password.length >= 6
  }
}

// Make Auth globally available
window.Auth = Auth
