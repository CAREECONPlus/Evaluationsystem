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
import environment from "./env.js"

export class Auth {
  constructor(app) {
    this.app = app
    this.firebaseApp = null
    this.auth = null
    this.db = null
    this.authStateUnsubscribe = null
    this.isInitialized = false
    
  }

  async init() {
    try {
      
      // 環境変数からFirebase設定を取得
      const firebaseConfig = await environment.getFirebaseConfig()
      
      
      // Firebase設定の妥当性チェック
      if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
        throw new Error("Firebase configuration is incomplete. Missing projectId or apiKey.")
      }
      
      // Firebase初期化
      this.firebaseApp = initializeApp(firebaseConfig)
      this.auth = getAuth(this.firebaseApp)
      
      // Firestore初期化を遅延させる
      setTimeout(() => {
        this.initializeFirestore()
      }, 100)
      
      this.isInitialized = true
      
      
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
            try {
              const userProfile = await this.app.api.getUserProfile(user.uid)
              if (userProfile && userProfile.status === "active") {
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
            
            // 手動ログアウト以外の場合のみUI更新とリダイレクトを実行
            // （手動ログアウトの場合はapp.js側で処理済み）
            if (!this.app.currentUser) {
              console.log("Auth: User already cleared by manual logout, skipping duplicate processing")
              return
            }
            
            // ユーザー状態をクリア
            this.app.currentUser = null
            this.app.updateUIForAuthState(null)
            
            // 自動ログアウト時のみリダイレクト
            if (
              !isFirstCheck &&
              window.location.hash !== "#/register" &&
              !window.location.hash.includes("/register-admin") &&
              window.location.hash !== "#/login"
            ) {
              console.log("Auth: Redirecting to login page after automatic logout")
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
      await signInWithEmailAndPassword(this.auth, email, password)
    } catch (error) {
      console.error("Auth: Login error:", error)
      throw error
    }
  }

  async logout() {
    console.log("Auth: logout() called")
    
    if (!this.isInitialized) {
      console.error("Auth: Firebase not initialized")
      throw new Error("Firebase が初期化されていません")
    }
    
    if (!this.auth) {
      console.error("Auth: Firebase auth not available")
      throw new Error("Firebase認証が利用できません")
    }
    
    try {
      console.log("Auth: Calling Firebase signOut()...")
      await signOut(this.auth)
      console.log("Auth: Firebase signOut() completed successfully")
      
      // 認証関連ストレージのクリーンアップ
      this.cleanupAuthStorage()
      
    } catch (error) {
      console.error("Auth: Logout error:", error)
      // エラーが発生してもクリーンアップは実行
      this.cleanupAuthStorage()
      // エラーは再スローせず、警告として扱う
      console.warn("Auth: Logout completed with warnings")
    }
  }

  // Firestore初期化メソッド（遅延実行）
  initializeFirestore() {
    try {
      if (!this.firebaseApp) {
        console.warn("Auth: Firebase app not available for Firestore initialization")
        return
      }
      
      console.log("Auth: Initializing Firestore...")
      this.db = getFirestore(this.firebaseApp)
      
      // Firestoreの接続確認
      if (this.db && this.db.app && this.db.app.options) {
        console.log("Auth: Firestore initialized successfully")
      } else {
        console.warn("Auth: Firestore initialization may be incomplete")
        this.db = null
      }
    } catch (firestoreError) {
      console.error("Auth: Firestore initialization failed:", firestoreError)
      this.db = null
    }
  }

  cleanupAuthStorage() {
    try {
      // ローカルストレージのクリア
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('firebase:') || key.includes('auth'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        console.log("Auth: Cleaned up local storage auth keys")
      }
      
      // セッションストレージのクリア
      if (typeof sessionStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.startsWith('firebase:') || key.includes('auth'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key))
        console.log("Auth: Cleaned up session storage auth keys")
      }
    } catch (cleanupError) {
      console.warn("Auth: Storage cleanup failed:", cleanupError)
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
