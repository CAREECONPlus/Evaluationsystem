import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
import { env as environment } from "./env.js"

export class Auth {
  constructor(app) {
    this.app = app
    this.firebaseApp = null
    this.auth = null
    this.db = null
    this.authStateUnsubscribe = null
    this.isInitialized = false
    
    console.log("Auth: Constructor completed, waiting for initialization")
  }

  async init() {
    try {
      console.log("Auth: Starting Firebase initialization...")
      
      // 環境変数からFirebase設定を取得
      const firebaseConfig = await environment.getFirebaseConfig()
      
      console.log("Auth: Firebase config loaded, initializing Firebase...")
      
      // Firebase初期化
      this.firebaseApp = initializeApp(firebaseConfig)
      this.auth = getAuth(this.firebaseApp)
      this.db = getFirestore(this.firebaseApp)
      
      this.isInitialized = true
      
      console.log("Auth: Firebase initialized successfully")
      console.log("Auth: Environment:", environment.isDevelopment() ? "development" : "production")
      
      return Promise.resolve()
      
    } catch (error) {
      console.error("Auth: Firebase initialization failed:", error)
      this.isInitialized = false
      throw error
    }
  }

  listenForAuthChanges() {
    return new Promise((resolve, reject) => {
      let isFirstCheck = true
      let timeoutId = null
      
      // タイムアウト設定（10秒）
      timeoutId = setTimeout(() => {
        console.warn("Auth: Authentication state check timeout")
        if (isFirstCheck) {
          isFirstCheck = false
          resolve() // タイムアウトでも初期化を続行
        }
      }, 10000)

      const handleAuthStateChange = async (user) => {
        try {
          // タイムアウトをクリア
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }

          if (user) {
            console.log("Auth: User detected, checking profile...")
            try {
              const userProfile = await this.app.api.getUserProfile(user.uid)
              if (userProfile && userProfile.status === "active") {
                console.log("Auth state changed: User is signed in and active.", user.email)
                
                // テナントIDを設定（修正追加）
                if (userProfile.tenantId) {
                  console.log("Auth: Setting tenant ID:", userProfile.tenantId)
                  this.app.api.setCurrentTenantId(userProfile.tenantId)
                } else if (userProfile.companyId) {
                  // 後方互換性のためcompanyIdも確認
                  console.log("Auth: Setting tenant ID from companyId:", userProfile.companyId)
                  this.app.api.setCurrentTenantId(userProfile.companyId)
                }
                
                this.app.updateUIForAuthState(userProfile)

                // ログイン直後の場合、ダッシュボードへ遷移
                if (!isFirstCheck && window.location.hash === "#/login") {
                  this.app.navigate("#/dashboard")
                }
              } else {
                console.log("Auth state changed: User is signed in but not active or profile not found.")
                await this.logout()
                this.app.updateUIForAuthState(null)
                if (!isFirstCheck) {
                  this.app.navigate("#/login")
                }
              }
            } catch (error) {
              console.error("Auth: Error fetching user profile.", error)
              if (this.isOperationCancelledError(error)) {
                console.log("Auth: Profile fetch cancelled - likely due to page reload")
                return
              }
              await this.logout()
              this.app.updateUIForAuthState(null)
              if (!isFirstCheck) {
                this.app.navigate("#/login")
              }
            }
          } else {
            console.log("Auth state changed: User is signed out.")
            
            // ログアウト時にテナントIDをクリア（修正追加）
            if (this.app.api) {
              this.app.api.setCurrentTenantId(null)
            }
            
            this.app.updateUIForAuthState(null)
            // ログアウト時はログインページへ
            if (
              !isFirstCheck &&
              window.location.hash !== "#/register" &&
              !window.location.hash.includes("/register-admin")
            ) {
              this.app.navigate("#/login")
            }
          }
        } catch (error) {
          if (this.isOperationCancelledError(error)) {
            console.log("Auth: State change cancelled - likely due to page reload")
            return
          }
          console.error("Auth: Unexpected error in auth state change handler:", error)
        }

        if (isFirstCheck) {
          isFirstCheck = false
          resolve()
        }
      }

      const handleAuthError = (error) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (this.isOperationCancelledError(error)) {
          console.log("Auth: State listener cancelled - likely due to page reload")
          if (isFirstCheck) {
            isFirstCheck = false
            resolve()
          }
          return
        }
        
        console.error("Auth: Error in auth state listener:", error)
        if (isFirstCheck) {
          isFirstCheck = false
          reject(error)
        }
      }

      try {
        const unsubscribe = onAuthStateChanged(
          this.auth,
          handleAuthStateChange,
          handleAuthError
        )
        
        this.authStateUnsubscribe = unsubscribe
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        console.error("Auth: Failed to set up auth state listener:", error)
        if (isFirstCheck) {
          isFirstCheck = false
          reject(error)
        }
      }
    })
  }

  isOperationCancelledError(error) {
    return error && error.message && error.message.includes("Operation cancelled")
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      
      // ログイン成功時にユーザー情報を取得してテナントIDを設定（修正追加）
      if (userCredential.user && this.app.api) {
        try {
          const userProfile = await this.app.api.getUserProfile(userCredential.user.uid)
          if (userProfile && userProfile.tenantId) {
            console.log("Auth: Setting tenant ID after login:", userProfile.tenantId)
            this.app.api.setCurrentTenantId(userProfile.tenantId)
          }
        } catch (error) {
          console.warn("Auth: Could not set tenant ID after login:", error)
        }
      }
      
      return userCredential
    } catch (error) {
      console.error("Auth: Login error:", error)
      throw error
    }
  }

  async logout() {
    try {
      // ログアウト前にテナントIDをクリア（修正追加）
      if (this.app.api) {
        this.app.api.setCurrentTenantId(null)
      }
      
      await signOut(this.auth)
    } catch (error) {
      console.error("Auth: Logout error:", error)
      // ログアウトエラーは無視して続行
    }
  }

  async registerWithEmail(email, password) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password)
    } catch (error) {
      console.error("Auth: Registration error:", error)
      throw error
    }
  }

  async registerAndCreateProfile(userData, role, status) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        userData.password
      )
      const user = userCredential.user

      const userProfile = {
        name: userData.name,
        email: userData.email,
        companyName: userData.companyName || null,
        role: role,
        status: status,
        tenantId: userData.tenantId || null,
        createdAt: serverTimestamp(),
      }

      await setDoc(doc(this.db, "users", user.uid), userProfile)
      
      // 登録成功時にテナントIDを設定（修正追加）
      if (userData.tenantId && this.app.api) {
        this.app.api.setCurrentTenantId(userData.tenantId)
      }
      
      return userCredential
    } catch (error) {
      console.error("Auth: Registration and profile creation error:", error)
      throw error
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(this.auth, email)
    } catch (error) {
      console.error("Auth: Password reset error:", error)
      throw error
    }
  }

  getFirebaseAuthErrorMessage(error) {
    switch (error.code) {
      case "auth/invalid-email":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return this.app.i18n.t("errors.invalid_email_password")
      case "auth/user-disabled":
        return this.app.i18n.t("errors.account_inactive")
      case "auth/email-already-in-use":
        return this.app.i18n.t("errors.email_already_in_use")
      case "auth/weak-password":
        return this.app.i18n.t("errors.weak_password")
      default:
        console.error("Unhandled Firebase Auth Error:", error)
        return this.app.i18n.t("errors.login_failed_generic")
    }
  }

  cleanup() {
    if (this.authStateUnsubscribe) {
      try {
        this.authStateUnsubscribe()
        this.authStateUnsubscribe = null
        console.log("Auth: Auth state listener cleaned up")
      } catch (error) {
        console.warn("Auth: Error during cleanup:", error)
      }
    }
  }
}
