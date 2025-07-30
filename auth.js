/**
 * Authentication Service
 * 認証サービス
 */
class Auth {
  constructor(app) {
    this.app = app;
    this.currentUser = null;
    this.isInitialized = false;

    // --- ▼▼▼ 修正: 評価階層のデモデータ ▼▼▼ ---
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
        tenantId: "tenant-001",
        jobType: "管理職",
        evaluatorId: null, // 管理者は評価されない
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
        tenantId: "tenant-001",
        jobType: "現場監督",
        evaluatorId: "1", // マネージャーは管理者に評価される
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
        tenantId: "tenant-001",
        jobType: "建設作業員",
        evaluatorId: "2", // 従業員はマネージャーに評価される
      },
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
        evaluatorId: null,
      },
    ];
    // --- ▲▲▲ 修正 ▲▲▲ ---
  }

  /**
   * Initialize authentication service
   */
  async init() {
    try {
      console.log("Initializing Auth service...");
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const userFromDemo = this.demoUsers.find(u => u.id === parsedUser.id);
          if (userFromDemo) {
            this.currentUser = { ...userFromDemo };
            delete this.currentUser.password;
            this.app.currentUser = this.currentUser;
            console.log("Restored user session:", this.currentUser.email);
          } else {
            localStorage.removeItem("currentUser");
          }
        } catch (error) {
          console.warn("Failed to restore user session:", error);
          localStorage.removeItem("currentUser");
        }
      }
      this.isInitialized = true;
      console.log("Auth service initialized");
    } catch (error) {
      console.error("Failed to initialize Auth service:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error(this.app.i18n.t("errors.email_password_required"));
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      const user = this.demoUsers.find((u) => u.email === email && u.password === password);
      if (!user) {
        throw new Error(this.app.i18n.t("errors.invalid_email_password"));
      }
      if (user.status !== "active") {
        throw new Error(this.app.i18n.t("errors.account_inactive"));
      }
      user.lastLogin = new Date();
      this.currentUser = { ...user };
      delete this.currentUser.password;
      localStorage.setItem("currentUser", JSON.stringify({ id: this.currentUser.id }));
      console.log("Login successful:", this.currentUser);
      return this.currentUser;
    } catch (error) {
      console.error("Auth login failed:", error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.currentUser = null;
    this.app.currentUser = null;
    localStorage.removeItem("currentUser");
    console.log("Logout successful");
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }
  
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  hasAnyRole(roles) {
    return this.currentUser && roles.includes(this.currentUser.role);
  }
}

// Make Auth globally available
window.Auth = Auth;
