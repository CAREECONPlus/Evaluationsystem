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
        tenantId: "tenant-001", // 追加: テナントID
        jobType: "管理職", // 追加: 職種
      },
      {
        id: "2",
        email: "manager@example.com",
        password: "password",
        name: "マネージャー",
        role: "evaluator", // 評価者 (マネージャー)
        status: "active",
        createdAt: new Date("2024-01-01"),
        lastLogin: null,
        tenantId: "tenant-001", // 追加: テナントID
        jobType: "現場監督", // 追加: 職種
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
        tenantId: "tenant-001", // 追加: テナントID
        jobType: "建設作業員", // 追加: 職種
      },
      // テナントを跨ぐテスト用ユーザー（必要に応じて）
      {
        id: "4",
        email: "admin2@example.com",
        password: "password",
        name: "管理者2",
        role: "admin",
        status: "active",
        createdAt: new Date("2024-01-05"),
        lastLogin: null,
        tenantId: "tenant-002",
        jobType: "管理職",
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
          // localStorageに保存されているユーザーIDでdemoUsersから完全なユーザー情報を取得
          const parsedUser = JSON.parse(savedUser);
          const userFromDemo = this.demoUsers.find(u => u.id === parsedUser.id);

          if (userFromDemo) {
            this.currentUser = { ...userFromDemo };
            delete this.currentUser.password; // パスワードはセッションから除く
            this.app.currentUser = this.currentUser;
            console.log("Restored user session:", this.currentUser.email);
          } else {
            // demoUsersに存在しない場合はセッションをクリア
            console.warn("User in localStorage not found in demoUsers. Clearing session.");
            localStorage.removeItem("currentUser");
          }
        } catch (error) {
          console.warn("Failed to restore user session:", error);
          localStorage.removeItem("currentUser");
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
        throw new Error(this.app.i18n.t("errors.email_password_required"));
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user in demo users
      const user = this.demoUsers.find((u) => u.email === email && u.password === password)

      if (!user) {
        throw new Error(this.app.i18n.t("errors.invalid_email_password"));
      }

      if (user.status !== "active") {
        throw new Error(this.app.i18n.t("errors.account_inactive"));
      }

      // Update last login
      user.lastLogin = new Date();

      // Set current user
      this.currentUser = { ...user };
      delete this.currentUser.password; // Remove password from session

      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify({ id: this.currentUser.id, email: this.currentUser.email })); // パスワードなしの最小限の情報

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
   * Register new user (from invitation link)
   * 新しいユーザーを登録
   */
  async register(userData) {
    try {
      console.log("Registering new user:", userData.email)

      // Validate required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error(this.app.i18n.t("errors.required_fields_missing"));
      }

      // Check if user already exists
      const existingUser = this.demoUsers.find((u) => u.email === userData.email)
      if (existingUser) {
        throw new Error(this.app.i18n.t("errors.email_already_in_use"));
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create new user
      const newUser = {
        id: this.generateId(),
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role || "worker", // 招待で指定されたロール、なければworker
        status: "pending_approval", // 承認待ちで作成
        createdAt: new Date(),
        lastLogin: null,
        tenantId: userData.tenantId || "tenant-001", // 招待で指定されたテナントID、なければデフォルト
        jobType: userData.jobType || "未設定", // 招待で指定された職種、なければ未設定
      }

      // Add to demo users (in a real app, this would be a backend call)
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
        throw new Error(this.app.i18n.t("errors.login_required"));
      }

      // Find user in demo users
      const user = this.demoUsers.find((u) => u.id === this.currentUser.id)
      if (!user || user.password !== currentPassword) {
        throw new Error(this.app.i18n.t("errors.invalid_current_password"));
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
