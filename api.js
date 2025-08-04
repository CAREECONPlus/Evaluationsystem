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
    getCountFromServer,
    limit,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated) - Complete Version
 * APIサービス (Firestore連携版) - 完成版
 */
export class API {
    constructor(app) {
        this.app = app;
        this.db = window.firebase.db;
        this.functions = window.firebase.functions;
    }

    // --- Dashboard ---
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

    async getRecentEvaluations() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "evaluations"), where("tenantId", "==", this.app.currentUser.tenantId), orderBy("submittedAt", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async getEvaluationChartData() {
        const dummyData = {
            labels: ['技術力', '品質', '安全', '協調性', '勤怠'],
            datasets: [
                { label: 'あなたのスコア', data: [4, 5, 3, 4, 5], backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)' },
                { label: '部署平均', data: [3.5, 4.2, 4.1, 3.8, 4.5], backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgb(255, 99, 132)' }
            ]
        };
        return { radar: dummyData, bar: dummyData, line: dummyData };
    }

    // --- User Management ---
    async getUsers(status) {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "users"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", status));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async getSubordinates() {
        if (!this.app.currentUser?.tenantId || !this.app.currentUser.uid) return [];
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
    
    async createInvitation(invitationData) {
        if (!this.app.hasRole('admin')) throw new Error("Permission denied.");
        const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
        const now = new Date();
        const expiresAt = new Date(now.setDate(now.getDate() + 7));
        const docData = {
            ...invitationData,
            tenantId: this.app.currentUser.tenantId,
            companyName: this.app.currentUser.companyName,
            token: token,
            used: false,
            createdAt: serverTimestamp(),
            expiresAt: expiresAt,
            type: 'user'
        };
        await addDoc(collection(this.db, "invitations"), docData);
        return token;
    }

    // --- Evaluations & Goals ---
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
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
    }

    async getGoalsByStatus(status) {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", status));
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
        structuresSnap.forEach(docSnap => { structures[docSnap.id] = {id: docSnap.id, ...docSnap.data()}; });
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
    
    async getJobTypes() {
        if (!this.app.currentUser?.tenantId) return [];
        const q = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", this.app.currentUser.tenantId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // --- Developer & Registration ---
    async getPendingAdmins() {
        const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    
    async getActiveTenants() {
        if (!this.app.hasRole('developer')) throw new Error("Permission denied.");
        const tenantsQuery = query(collection(this.db, "tenants"));
        const usersQuery = query(collection(this.db, "users"), where("role", "==", "admin"));
        const [tenantsSnap, usersSnap] = await Promise.all([getDocs(tenantsQuery), getDocs(usersQuery)]);
        const tenants = tenantsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const adminUsers = usersSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
        return tenants.map(tenant => {
            const admin = adminUsers.find(u => u.tenantId === tenant.id);
            return { ...tenant, adminName: admin ? admin.name : 'N/A', adminEmail: admin ? admin.email : 'N/A' };
        });
    }

    async approveAdmin(userId) {
        const approveAdminFunction = httpsCallable(this.functions, 'approveAdmin');
        await approveAdminFunction({ userId });
    }

    async updateTenantStatus(tenantId, status) {
        if (!this.app.hasRole('developer')) throw new Error("Permission denied.");
        const tenantRef = doc(this.db, "tenants", tenantId);
        await updateDoc(tenantRef, { status: status });
    }
}
