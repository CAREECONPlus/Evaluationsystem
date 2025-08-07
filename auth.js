// careeconplus/evaluationsystem/Evaluationsystem-main/auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

/**
 * Authentication Service (Firebase Integrated) - 修正版
 * 認証サービス (Firebase連携版)
 */
export class Auth {
    constructor(app) {
        this.app = app;

        // Firebase設定をここに集約
        const firebaseConfig = {
            apiKey: "AIzaSyAK3wAWIZCultkSQfyse8L8Z-JNMEVK5Wk",
            authDomain: "hyouka-db.firebaseapp.com",
            projectId: "hyouka-db",
            storageBucket: "hyouka-db.appspot.com",
            messagingSenderId: "861016804589",
            appId: "1:861016804589:web:d911d516d6c79aa73690e4"
        };

        // ★★★ 修正点 1: 自身のクラス内でFirebase Appを初期化・保持 ★★★
        // window.firebaseに依存せず、常に有効なインスタンスを確保する
        this.firebaseApp = initializeApp(firebaseConfig);
        this.auth = getAuth(this.firebaseApp);
        this.db = getFirestore(this.firebaseApp);
        
        this.authStateInitialized = false;
    }

    /**
     * Initializes the authentication service and sets up an auth state listener.
     * 認証サービスを初期化し、認証状態リスナーをセットアップします。
     * @returns {Promise<void>} A promise that resolves when the initial auth state is determined.
     */
    init() {
        return new Promise((resolve) => {
            onAuthStateChanged(this.auth, async (user) => {
                const wasLoggedIn = !!this.app.currentUser;

                if (user) {
                    try {
                        const userProfile = await this.getUserProfile(user.uid);
                        if (userProfile && userProfile.status === 'active') {
                            this.app.currentUser = { uid: user.uid, ...userProfile };
                            console.log("Auth state changed: User is signed in and active.", this.app.currentUser.email);
                        } else {
                            this.app.currentUser = null;
                            if (userProfile && userProfile.status !== 'active') {
                                console.warn("User is not active. Status:", userProfile.status);
                                this.app.showError(this.app.i18n.t('errors.account_inactive'));
                            }
                            await signOut(this.auth);
                        }
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                        this.app.currentUser = null;
                        await signOut(this.auth);
                    }
                } else {
                    this.app.currentUser = null;
                    console.log("Auth state changed: User is signed out.");
                }
                
                const isLoggedIn = !!this.app.currentUser;
                if (this.authStateInitialized && wasLoggedIn !== isLoggedIn) {
                    this.app.router.route();
                }

                if (!this.authStateInitialized) {
                    this.authStateInitialized = true;
                    resolve(); 
                }
            });
        });
    }

    async getUserProfile(uid) {
        const userDocRef = doc(this.db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        return userDocSnap.exists() ? userDocSnap.data() : null;
    }

    async login(email, password) {
        await signInWithEmailAndPassword(this.auth, email, password);
    }

    async logout() {
        await signOut(this.auth);
    }
    
    async registerWithEmail(email, password) {
        return await createUserWithEmailAndPassword(this.auth, email, password);
    }

    async registerAndCreateProfile(userData, role, status) {
        const userCredential = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password);
        const user = userCredential.user;

        const userProfile = {
            name: userData.name,
            email: userData.email,
            companyName: userData.companyName || null,
            role: role,
            status: status,
            tenantId: userData.tenantId || null,
            createdAt: serverTimestamp(),
        };

        await setDoc(doc(this.db, "users", user.uid), userProfile);
        return userCredential;
    }
    
    async sendPasswordReset(email) {
        await sendPasswordResetEmail(this.auth, email);
    }
    
    getFirebaseAuthErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                 return this.app.i18n.t('errors.invalid_email_password');
            case 'auth/user-disabled':
                return this.app.i18n.t('errors.account_inactive');
            case 'auth/email-already-in-use':
                return this.app.i18n.t('errors.email_already_in_use');
            case 'auth/weak-password':
                return this.app.i18n.t('errors.weak_password');
            default:
                console.error("Unhandled Firebase Auth Error:", error);
                return this.app.i18n.t('errors.login_failed_generic');
        }
    }
}
