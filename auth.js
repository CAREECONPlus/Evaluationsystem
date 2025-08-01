import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

/**
 * Authentication Service (Firebase Integrated)
 * 認証サービス (Firebase連携版)
 */
export class Auth {
    constructor(app) {
        this.app = app;
        this.auth = window.firebase.auth;
        this.db = window.firebase.db;
    }

    /**
     * Initializes the authentication service and sets up an auth state listener.
     * 認証サービスを初期化し、認証状態リスナーをセットアップします。
     * @returns {Promise<void>} A promise that resolves when the initial auth state is determined.
     */
    init() {
        return new Promise((resolve) => {
            onAuthStateChanged(this.auth, async (user) => {
                if (user) {
                    console.log("Auth state changed: User is signed in.", user.uid);
                    try {
                        const userProfile = await this.getUserProfile(user.uid);
                        if (userProfile) {
                            // Combine auth data (like uid, email) with Firestore profile data
                            this.app.currentUser = { ...user, ...userProfile };
                            console.log("User profile loaded:", this.app.currentUser.email);
                        } else {
                            // This case might happen during registration before the profile is created
                            this.app.currentUser = user;
                            console.warn("User profile not found in Firestore for UID:", user.uid);
                        }
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                        this.app.currentUser = null;
                        await this.logout(); // Force logout on profile error
                    }
                } else {
                    console.log("Auth state changed: User is signed out.");
                    this.app.currentUser = null;
                }
                // Resolve the promise once the initial user state is known
                resolve(); 
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
        if (userDocSnap.exists()) {
            return userDocSnap.data();
        } else {
            return null;
        }
    }

    /**
     * Signs in a user with their email and password.
     * メールアドレスとパスワードでユーザーをサインインさせます。
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        await signInWithEmailAndPassword(this.auth, email, password);
    }

    /**
     * Signs out the current user.
     * 現在のユーザーをサインアウトさせます。
     */
    async logout() {
        await signOut(this.auth);
    }

    /**
     * Registers a new user with email and password, then creates their profile.
     * メールアドレスとパスワードで新規ユーザーを登録し、プロファイルを作成します。
     * @param {object} userData - User data including email, password, name, etc.
     * @param {string} role - The role of the new user.
     * @param {string} status - The initial status of the new user.
     * @returns {object} The created user credential.
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
            tenantId: userData.tenantId || null, // tenantId might be set later for admins
            createdAt: serverTimestamp(),
        };

        await setDoc(doc(this.db, "users", user.uid), userProfile);
        return userCredential;
    }

    /**
     * Sends a password reset email to the specified address.
     * 指定されたアドレスにパスワードリセットメールを送信します。
     * @param {string} email 
     */
    async sendPasswordReset(email) {
        await sendPasswordResetEmail(this.auth, email);
    }

    /**
     * Translates Firebase Auth error codes into user-friendly Japanese messages.
     * Firebase Authのエラーコードを分かりやすい日本語のメッセージに変換します。
     * @param {Error} error - The error object from Firebase Auth.
     * @returns {string} A user-friendly error message.
     */
    getFirebaseAuthErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return this.app.i18n.t('errors.invalid_email');
            case 'auth/user-disabled':
                return this.app.i18n.t('errors.account_inactive');
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return this.app.i18n.t('errors.invalid_email_password');
            case 'auth/email-already-in-use':
                return this.app.i18n.t('errors.email_already_in_use');
            case 'auth/weak-password':
                return this.app.i18n.t('errors.weak_password');
            default:
                console.error("Unhandled Firebase Auth Error:", error);
                return error.message;
        }
    }
}
