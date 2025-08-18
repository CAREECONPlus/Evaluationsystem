import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js"

export class Auth {
  constructor(app) {
    this.app = app
    const firebaseConfig = {
      apiKey: "AIzaSyAK3wAWIZCultkSQfyse8L8Z-JNMEVK5Wk",
      authDomain: "hyouka-db.firebaseapp.com",
      projectId: "hyouka-db",
      storageBucket: "hyouka-db.appspot.com",
      messagingSenderId: "861016804589",
      appId: "1:861016804589:web:d911d516d6c79aa73690e4",
    }
    this.firebaseApp = initializeApp(firebaseConfig)
    this.auth = getAuth(this.firebaseApp)
    this.db = getFirestore(this.firebaseApp)
  }

  async init() {
    console.log("Auth: Module initialized.")
    return Promise.resolve()
  }

  listenForAuthChanges() {
    return new Promise((resolve) => {
      let isFirstCheck = true
      const unsubscribe = onAuthStateChanged(
        this.auth,
        async (user) => {
          try {
            if (user) {
              try {
                const userProfile = await this.app.api.getUserProfile(user.uid)
                if (userProfile && userProfile.status === "active") {
                  console.log("Auth state changed: User is signed in and active.", user.email)
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
                if (error.message && error.message.includes("Operation cancelled")) {
                  console.log("[v0] Auth operation cancelled - likely due to page reload")
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
            if (error.message && error.message.includes("Operation cancelled")) {
              console.log("[v0] Auth state change cancelled - likely due to page reload")
              return
            }
            console.error("Auth: Unexpected error in auth state change handler:", error)
          }

          if (isFirstCheck) {
            isFirstCheck = false
            resolve()
          }
        },
        (error) => {
          if (error.message && error.message.includes("Operation cancelled")) {
            console.log("[v0] Auth state listener cancelled - likely due to page reload")
            return
          }
          console.error("Auth: Error in auth state listener:", error)
        },
      )

      this.authStateUnsubscribe = unsubscribe
    })
  }

  async login(email, password) {
    await signInWithEmailAndPassword(this.auth, email, password)
  }

  async logout() {
    await signOut(this.auth)
  }

  async registerWithEmail(email, password) {
    return await createUserWithEmailAndPassword(this.auth, email, password)
  }

  async registerAndCreateProfile(userData, role, status) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password)
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
  }

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(this.auth, email)
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
      this.authStateUnsubscribe()
      this.authStateUnsubscribe = null
    }
  }
}
