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

    // --- Developer & Registration ---
    async getPendingAdmins() {
        const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // ★★★ 修正済みの最終版 ★★★
    async getActiveTenants() {
        if (!this.app.hasRole('developer')) throw new Error("Permission denied.");
        
        const tenantsQuery = query(collection(this.db, "tenants"));
        const usersQuery = query(collection(this.db, "users"), where("role", "==", "admin"));

        // データを並行して取得
        const [tenantsSnap, usersSnap] = await Promise.all([
            getDocs(tenantsQuery),
            getDocs(usersQuery)
        ]);
        
        const tenants = tenantsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const adminUsers = usersSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));

        // テナント情報に、対応する管理者の情報を紐付ける
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
        // Firebase Cloud Functionsを呼び出すことを想定
        const approveAdminFunction = httpsCallable(this.functions, 'approveAdmin');
        await approveAdminFunction({ userId });
    }

    async updateTenantStatus(tenantId, status) {
        if (!this.app.hasRole('developer')) throw new Error("Permission denied.");
        const tenantRef = doc(this.db, "tenants", tenantId);
        await updateDoc(tenantRef, { status: status });
    }
    
    // (ここに他の全ての既存関数が続きます。ファイル全体をこのコードで置き換えてください)
    // --- Dashboard, Users, Evaluations, etc. ---
}
