import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    writeBatch,
    getCountFromServer
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated)
 * APIサービス (Firestore連携版)
 * This class handles all communication with the Firestore database.
 * このクラスはFirestoreデータベースとのすべての通信を処理します。
 */
export class API {
    constructor(app) {
        this.app = app;
        this.db = window.firebase.db;
        this.functions = window.firebase.functions;
    }

    // --- Dashboard ---
    /**
     * Fetches statistics for the dashboard.
     * ダッシュボード用の統計データを取得します。
     * @returns {Promise<object>} An object with stats.
     */
    async getDashboardStats() {
        if (!this.app.currentUser?.tenantId) return { totalUsers: 0, completedEvaluations: 0, pendingEvaluations: 0 };
        const tenantId = this.app.currentUser.tenantId;
        
        const usersQuery = query(collection(this.db, "users"), where("tenantId", "==", tenantId));
        const completedEvalsQuery = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), where("status", "==", "completed"));
        const pendingEvalsQuery = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), where("status", "!=", "completed"));

        const [usersSnapshot, completedEvalsSnapshot, pendingEvalsSnapshot] = await Promise.all([
            getCountFromServer(usersQuery),
            getCountFromServer(completedEvalsQuery),
            getCountFromServer(pendingEvalsQuery)
        ]);

        return {
            totalUsers: usersSnapshot.data().count,
            completedEvaluations: completedEvalsSnapshot.data().count,
            pendingEvaluations: pendingEvalsSnapshot.data().count
        };
    }

    // --- User Management ---
    /**
     * Fetches users by their status for the current tenant.
     * 現在のテナントのユーザーステータスに基づいてユーザーを取得します。
     * @param {string} status - The user status ('active', 'pending_approval').
     * @returns {Promise<Array>} An array of user objects.
     */
    async getUsers(status) {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "users"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", status));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /**
     * Fetches subordinates for the current user (evaluator).
     * 現在のユーザー（評価者）の部下を取得します。
     * @returns {Promise<Array>} An array of subordinate user objects.
     */
    async getSubordinates() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "users"), where("tenantId", "==", this.app.currentUser.tenantId), where("evaluatorId", "==", this.app.currentUser.uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /**
     * Updates a user's status in Firestore.
     * Firestoreでユーザーステータスを更新します。
     * @param {string} userId - The ID of the user to update.
     * @param {string} status - The new status.
     */
    async updateUserStatus(userId, status) {
        const userDocRef = doc(this.db, "users", userId);
        await updateDoc(userDocRef, { status: status });
    }

    /**
     * Deletes a user document from Firestore.
     * Firestoreからユーザードキュメントを削除します。
     * @param {string} userId - The ID of the user to delete.
     */
    async deleteUser(userId) {
        // Note: This only deletes the Firestore record. The Auth user needs to be deleted separately via a Cloud Function for security reasons.
        // 注意: これはFirestoreのレコードのみを削除します。Authユーザーはセキュリティ上の理由からCloud Function経由で別途削除する必要があります。
        const userDocRef = doc(this.db, "users", userId);
        await deleteDoc(userDocRef);
    }

    // --- Evaluations & Goals ---
    /**
     * Fetches all evaluations for the current tenant.
     * 現在のテナントのすべての評価を取得します。
     * @returns {Promise<Array>} An array of evaluation objects.
     */
    async getEvaluations() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "evaluations"), where("tenantId", "==", this.app.currentUser.tenantId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /**
     * Fetches a single evaluation by its ID.
     * IDで単一の評価を取得します。
     * @param {string} id - The evaluation document ID.
     * @returns {Promise<object|null>} The evaluation object or null.
     */
    async getEvaluationById(id) {
        const docRef = doc(this.db, "evaluations", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().tenantId === this.app.currentUser.tenantId) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }
    
    /**
     * Saves or updates an evaluation document.
     * 評価ドキュメントを保存または更新します。
     * @param {object} data - The evaluation data.
     */
    async saveEvaluation(data) {
        if (data.id) {
            const docRef = doc(this.db, "evaluations", data.id);
            await updateDoc(docRef, data);
        } else {
            await addDoc(collection(this.db, "evaluations"), data);
        }
    }

    /**
     * Fetches goals for a specific user and period.
     * 特定のユーザーと期間の目標を取得します。
     * @returns {Promise<object|null>} The goal document object or null.
     */
    async getGoals(userId, periodId) {
        if (!this.app.currentUser?.tenantId) return null;
        const q = query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", this.app.currentUser.tenantId), where("userId", "==", userId), where("periodId", "==", periodId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Fetches all goals pending approval for the current tenant.
     * 現在のテナントで承認待ちのすべての目標を取得します。
     * @returns {Promise<Array>} An array of goal objects.
     */
    async getPendingGoals() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", "pending_approval"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /**
     * Saves or updates a goal document.
     * 目標ドキュメントを保存または更新します。
     * @param {object} goalData - The goal data.
     */
    async saveGoals(goalData) {
        if (goalData.id) {
            const docRef = doc(this.db, "qualitativeGoals", goalData.id);
            await updateDoc(docRef, goalData);
        } else {
            await addDoc(collection(this.db, "qualitativeGoals"), goalData);
        }
    }

    /**
     * Updates the status of a goal document.
     * 目標ドキュメントのステータスを更新します。
     * @param {string} goalId - The ID of the goal document.
     * @param {string} status - The new status.
     */
    async updateGoalStatus(goalId, status) {
        const docRef = doc(this.db, "qualitativeGoals", goalId);
        await updateDoc(docRef, { status });
    }

    // --- Settings ---
    /**
     * Fetches all settings data for the current tenant.
     * 現在のテナントのすべての設定データを取得します。
     * @returns {Promise<object>} An object containing jobTypes, periods, and structures.
     */
    async getSettings() {
        if (!this.app.currentUser?.tenantId) return { jobTypes: [], periods: [], structures: {} };
        const tenantId = this.app.currentUser.tenantId;
        const jobTypesQuery = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", tenantId));
        const periodsQuery = query(collection(this.db, "evaluationPeriods"), where("tenantId", "==", tenantId));
        const structuresQuery = query(collection(this.db, "evaluationStructures"), where("tenantId", "==", tenantId));
        
        const [jobTypesSnap, periodsSnap, structuresSnap] = await Promise.all([
            getDocs(jobTypesQuery),
            getDocs(periodsQuery),
            getDocs(structuresSnap)
        ]);

        const structures = {};
        structuresSnap.forEach(doc => { structures[doc.id] = doc.data(); });

        return {
            jobTypes: jobTypesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            periods: periodsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            structures
        };
    }

    /**
     * Saves all settings changes in a single batch operation.
     * すべての設定変更を単一のバッチ操作で保存します。
     * @param {object} settings - The settings object to save.
     */
    async saveSettings(settings) {
        const batch = writeBatch(this.db);
        const tenantId = this.app.currentUser.tenantId;

        settings.jobTypes.forEach(jt => batch.set(doc(this.db, "targetJobTypes", jt.id), { ...jt, tenantId }));
        settings.periods.forEach(p => batch.set(doc(this.db, "evaluationPeriods", p.id), { ...p, tenantId }));
        Object.values(settings.structures).forEach(s => batch.set(doc(this.db, "evaluationStructures", s.id), { ...s, tenantId }));
        
        await batch.commit();
    }

    // --- Developer & Registration ---
    /**
     * Fetches admin accounts pending developer approval.
     * 開発者の承認待ちの管理者アカウントを取得します。
     * @returns {Promise<Array>} An array of pending admin user objects.
     */
    async getPendingAdmins() {
        const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /**
     * Approves an admin account (requires a Cloud Function).
     * 管理者アカウントを承認します（Cloud Functionが必要です）。
     * @param {string} userId - The ID of the user to approve.
     */
    async approveAdmin(userId) {
        const approveAdminFunction = httpsCallable(this.functions, 'approveAdmin');
        await approveAdminFunction({ userId });
    }
}
