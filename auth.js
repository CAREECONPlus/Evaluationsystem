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

export class Auth {
    constructor(app) {
        this.app = app;
        const firebaseConfig = {
            apiKey: "AIzaSyAK3wAWIZCultkSQfyse8L8Z-JNMEVK5Wk",
            authDomain: "hyouka-db.firebaseapp.com",
            projectId: "hyouka-db",
            storageBucket: "hyouka-db.appspot.com",
            messagingSenderId: "861016804589",
            appId: "1:861016804589:web:d911d516d6c79aa73690e4"
        };
        this.firebaseApp = initializeApp(firebaseConfig);
        this.auth = getAuth(this.firebaseApp);
        this.db = getFirestore(this.firebaseApp);
        this.authStateResolved = false;
    }

    async init() {
        console.log("Auth: Module initialized.");
        return Promise.resolve();
    }

    listenForAuthChanges() {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
                if (user) {
                    try {
                        const userProfile = await this.app.api.getUserProfile(user.uid);
                        if (userProfile && userProfile.status === 'active') {
                            console.log("Auth state changed: User is signed in and active.", user.email);
                            this.app.updateUIForAuthState(userProfile);
                            
                            // 初回認証チェック時のみ、ダッシュボードへリダイレクト
                            if (!this.authStateResolved && window.location.hash === '#/login') {
                                window.location.hash = '#/dashboard';
                            }
                        } else {
                            console.log("Auth state changed: User is signed in but not active or profile not found.");
                            await this.logout();
                            this.app.updateUIForAuthState(null);
                        }
                    } catch (error) {
                        console.error("Auth: Error fetching user profile.", error);
                        await this.logout();
                        this.app.updateUIForAuthState(null);
                    }
                } else {
                    console.log("Auth state changed: User is signed out.");
                    this.app.updateUIForAuthState(null);
                    
                    // ログアウト時、保護されたページにいる場合はログインページへ
                    if (window.location.hash && window.location.hash !== '#/login' && 
                        window.location.hash !== '#/register' && 
                        window.location.hash !== '#/register-admin') {
                        window.location.hash = '#/login';
                    }
                }
                
                // 初回の認証状態チェックが完了
                if (!this.authStateResolved) {
                    this.authStateResolved = true;
                    resolve();
                }
            });
        });
    }

    async login(email, password) {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        // ログイン成功後、onAuthStateChangedがダッシュボードへのリダイレクトを処理
        return userCredential;
    }

    async logout() {
        await signOut(this.auth);
        // ログアウト後、onAuthStateChangedがログインページへのリダイレクトを処理
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
            case 'auth/network-request-failed':
                return 'ネットワークエラーが発生しました。接続を確認してください。';
            case 'auth/too-many-requests':
                return 'ログイン試行回数が多すぎます。しばらくしてからお試しください。';
            default:
                console.error("Unhandled Firebase Auth Error:", error);
                return this.app.i18n.t('errors.login_failed_generic');
        }
    }
}
