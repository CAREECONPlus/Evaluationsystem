import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

/**
 * Authentication Service (Firebase Integrated)
 * 認証サービス (Firebase連携版)
 */
export class Auth {
    constructor(app) {
        this.app = app;
        this.auth = window.firebase.auth;
        this.db = window.firebase.db;
        this.authStateInitialized = false; // 初期化が完了したかどうかのフラグ
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
                            this.app.currentUser = { ...user, ...userProfile };
                            console.log("Auth state changed: User is signed in and active.", this.app.currentUser.email);
                        } else {
                            // プロファイルがない、またはアクティブでない場合はログアウトさせる
                            this.app.currentUser = null;
                            if (userProfile) {
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

                // ★★★ 修正点 ★★★
                // ログイン状態が変化した場合にのみ、画面の再描画（ルーティング）を実行
                const isLoggedIn = !!this.app.currentUser;
                if (this.authStateInitialized && wasLoggedIn !== isLoggedIn) {
                    this.app.router.route();
                }

                // 最初の認証状態チェックが完了したことを記録
                if (!this.authStateInitialized) {
                    this.authStateInitialized = true;
                    resolve(); 
                }
            });
        });
    }

    /**
     * Fetches a user's profile data from the 'users' collection in Firestore.
     * Firestoreの'users'コレクションからユーザープロファイルデータを取得します。
     * @param {string} uid - The user's unique ID.
     * @returns {Promise<object|null>} The user profile data or null if not found.
     */
    async getUserProfile(uid) {
        const userDocRef = doc(this.db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        return userDocSnap.exists() ? userDocSnap.data() : null;
    }

    /**
     * Signs in a user with their email and password.
     * メールアドレスとパスワードでユーザーをサインインさせます。
     */
    async login(email, password) {
        await signInWithEmailAndPassword(this.auth, email, password);
        // この後の画面遷移はonAuthStateChangedリスナーが担当
    }

    /**
     * Signs out the current user.
     * 現在のユーザーをサインアウトさせます。
     */
    async logout() {
        await signOut(this.auth);
    }

    /**
     * Registers a new user and creates their profile.
     * 新規ユーザーを登録し、プロファイルを作成します。
     */
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
    
    /**
     * Translates Firebase Auth error codes into user-friendly messages.
     * Firebase Authのエラーコードを分かりやすいメッセージに変換します。
     */
    getFirebaseAuthErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
            case 'auth/invalid-credential': // v9以降の一般的な認証エラー
                 return this.app.i18n.t('errors.invalid_email_password');
            case 'auth/user-disabled':
                return this.app.i18n.t('errors.account_inactive');
            case 'auth/email-already-in-use':
                return this.app.i18n.t('errors.email_already_in_use');
            case 'auth/weak-password':
                return this.app.i18n.t('errors.weak_password');
            default:
                console.error("Unhandled Firebase Auth Error:", error);
                return this.app.i18n.t('errors.login_failed_generic') || "ログイン中に予期せぬエラーが発生しました。";
        }
    }
}
