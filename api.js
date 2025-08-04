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
        const q = query(collection(this.db, "evaluations"), 
            where("tenantId", "==", this.app.currentUser.tenantId),
            orderBy("submittedAt", "desc"),
            limit(5)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async getEvaluationChartData() {
        const dummyData = {
            labels: ['技術力', '品質', '安全', '協調性', '勤怠'],
            datasets: [{
                label: 'あなたのスコア', data: [4, 5, 3, 4, 5],
                backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)',
            }, {
                label: '部署平均', data: [3.5, 4.2, 4.1, 3.8, 4.5],
                backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgb(255, 99, 132)',
            }]
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

    // --- Developer & Registration ---
    async getPendingAdmins() {
        const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    
    // ★★★ 修正点：不足していた関数を追加 ★★★
    async getActiveTenants() {
        if (!this.app.hasRole('developer')) throw new Error("Permission denied.");
        const tenantsQuery = query(collection(this.db, "tenants"));
        const usersQuery = query(collection(this.db, "users"), where("role", "==", "admin"));

        const [tenantsSnap, usersSnap] = await Promise.all([getDocs(tenantsQuery), getDocs(usersSnap)]);
        
        const tenants = tenantsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const adminUsers = usersSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));

        // Map admin user details to their respective tenant
        return tenants.map(tenant => {
            const admin = adminUsers.find(u => u.tenantId === tenant.id);
            return {
                ...tenant,
                adminName: admin ? admin.name : 'N/A',
                adminEmail: admin ? admin.email : 'N/A',
            };
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

    // (他の既存の関数は省略)
}
