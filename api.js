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
 */
export class API {
    constructor(app) {
        this.app = app;
        this.db = window.firebase.db;
        this.functions = window.firebase.functions;
    }

    // --- Dashboard ---
    // ... (existing getDashboardStats method remains unchanged)
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
    // ... (existing user management methods remain unchanged)
    async getUsers(status) {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "users"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", status));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async getSubordinates() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "users"), where("tenantId", "==", this.app.currentUser.tenantId), where("evaluatorId", "==", this.app.currentUser.uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async updateUserStatus(userId, status) {
        const userDocRef = doc(this.db, "users", userId);
        await updateDoc(userDocRef, { status: status });
    }

    async deleteUser(userId) {
        const userDocRef = doc(this.db, "users", userId);
        await deleteDoc(userDocRef);
    }
    
    /**
     * Creates a user invitation document in Firestore.
     * Firestoreにユーザー招待ドキュメントを作成します。
     * @param {object} invitationData - The data for the invitation.
     * @returns {Promise<string>} The generated invitation token.
     */
    async createInvitation(invitationData) {
        if (!this.app.hasRole('admin')) throw new Error("Permission denied.");

        // Generate a secure random token
        const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
        const now = new Date();
        const expiresAt = new Date(now.setDate(now.getDate() + 7)); // Invitation expires in 7 days

        const docData = {
            ...invitationData,
            tenantId: this.app.currentUser.tenantId,
            companyName: this.app.currentUser.companyName,
            token: token,
            used: false,
            createdAt: serverTimestamp(),
            expiresAt: expiresAt,
            type: 'user' // Differentiate from admin invitations if any
        };

        await addDoc(collection(this.db, "invitations"), docData);
        return token;
    }

    // --- Evaluations & Goals ---
    // ... (existing evaluation & goal methods remain unchanged)
    async getEvaluations() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "evaluations"), where("tenantId", "==", this.app.currentUser.tenantId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async getEvaluationById(id) {
        const docRef = doc(this.db, "evaluations", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().tenantId === this.app.currentUser.tenantId) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }
    
    async saveEvaluation(data) {
        if (data.id) {
            const docRef = doc(this.db, "evaluations", data.id);
            await updateDoc(docRef, data);
        } else {
            await addDoc(collection(this.db, "evaluations"), data);
        }
    }

    async getGoals(userId, periodId) {
        if (!this.app.currentUser?.tenantId) return null;
        const q = query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", this.app.currentUser.tenantId), where("userId", "==", userId), where("periodId", "==", periodId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    async getPendingGoals() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", "pending_approval"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async saveGoals(goalData) {
        if (goalData.id) {
            const docRef = doc(this.db, "qualitativeGoals", goalData.id);
            await updateDoc(docRef, goalData);
        } else {
            await addDoc(collection(this.db, "qualitativeGoals"), goalData);
        }
    }

    async updateGoalStatus(goalId, status) {
        const docRef = doc(this.db, "qualitativeGoals", goalId);
        await updateDoc(docRef, { status });
    }

    // --- Settings ---
    // ... (existing settings methods remain unchanged)
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

    async saveSettings(settings) {
        const batch = writeBatch(this.db);
        const tenantId = this.app.currentUser.tenantId;

        settings.jobTypes.forEach(jt => batch.set(doc(this.db, "targetJobTypes", jt.id), { ...jt, tenantId }));
        settings.periods.forEach(p => batch.set(doc(this.db, "evaluationPeriods", p.id), { ...p, tenantId }));
        Object.values(settings.structures).forEach(s => batch.set(doc(this.db, "evaluationStructures", s.id), { ...s, tenantId }));
        
        await batch.commit();
    }
    
    /**
     * Fetches job types for the current tenant.
     * 現在のテナントの職種を取得します。
     * @returns {Promise<Array>} An array of job type objects.
     */
    async getJobTypes() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", this.app.currentUser.tenantId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }


    // --- Developer & Registration ---
    // ... (existing developer & registration methods remain unchanged)
    async getPendingAdmins() {
        const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async approveAdmin(userId) {
        const approveAdminFunction = httpsCallable(this.functions, 'approveAdmin');
        await approveAdminFunction({ userId });
    }
}
