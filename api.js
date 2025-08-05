// Firebase SDKから必要な関数をインポートします。バージョンを最新のv11系統に統一します。
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc, writeBatch, getCountFromServer, limit, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated) - Firebase連携完全版
 * Firebase FirestoreおよびFunctionsとのすべての通信を処理します。
 */
export class API {
  constructor(app) {
    // メインのAppインスタンスへの参照を保持します。
    this.app = app;

    // ★★★ エラー修正の核心部分 ★★★
    // グローバルな `window.firebase` に依存するのではなく、
    // Authモジュールで初期化済みの `firebaseApp` インスタンスを直接受け取ります。
    if (!app.auth || !app.auth.firebaseApp) {
      console.error("API FATAL: Firebase App is not initialized in Auth module!");
      this.app.showError("アプリケーションの初期化に失敗しました。Authモジュールを確認してください。");
      return;
    }
    this.firebaseApp = app.auth.firebaseApp; 
    
    // 受け取った `firebaseApp` を使って、各サービスを正しく初期化します。
    this.db = getFirestore(this.firebaseApp);
    this.functions = getFunctions(this.firebaseApp); // これでFunctionsが正しく初期化されます。

    console.log("API: Initialized successfully");
  }

  /**
   * エラーハンドリング共通処理
   */
  handleError(error, operation) {
    console.error(`API: Error in ${operation}:`, error);
    const message = error.code ? {
      'permission-denied': "権限がありません。管理者に連絡してください。",
      'not-found': "データが見つかりません。",
      'unavailable': "サービスが一時的に利用できません。しばらくしてからお試しください。",
    }[error.code] || `${operation}でエラーが発生しました: ${error.message}` : error.message;
    
    this.app.showError(message);
    throw new Error(message);
  }

  /**
   * 現在のユーザーのテナントIDを取得
   */
  getCurrentTenantId() {
    const tenantId = this.app.currentUser?.tenantId;
    if (!tenantId) {
      throw new Error("テナント情報が見つかりません。再度ログインしてください。");
    }
    return tenantId;
  }

  // --- Dashboard ---
  async getDashboardStats() {
    try {
      const tenantId = this.getCurrentTenantId();
      const usersQuery = query(collection(this.db, "users"), where("tenantId", "==", tenantId), where("status", "==", "active"));
      const completedEvalsQuery = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), where("status", "==", "completed"));
      const pendingEvalsQuery = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), where("status", "in", ['pending_submission', 'pending_evaluation', 'pending_approval', 'self_assessed', 'rejected', 'draft']));

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
    } catch (error) {
      this.handleError(error, "ダッシュボード統計の取得");
    }
  }

  // --- Settings ---
  async getSettings() {
    try {
      const tenantId = this.getCurrentTenantId();
      const jobTypesQuery = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", tenantId));
      const periodsQuery = query(collection(this.db, "evaluationPeriods"), where("tenantId", "==", tenantId));
      const structuresQuery = query(collection(this.db, "evaluationStructures"), where("tenantId", "==", tenantId));

      const [jobTypesSnap, periodsSnap, structuresSnap] = await Promise.all([
        getDocs(jobTypesQuery),
        getDocs(periodsQuery),
        getDocs(structuresQuery)
      ]);

      const structures = {};
      structuresSnap.forEach(docSnap => { structures[docSnap.id] = {id: docSnap.id, ...docSnap.data()}; });

      return {
        jobTypes: jobTypesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        periods: periodsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        structures
      };
    } catch (error) {
      this.handleError(error, "設定データの取得");
    }
  }

  // --- User Management ---
  async getUsers(status) {
    try {
      const tenantId = this.getCurrentTenantId();
      const q = query(collection(this.db, "users"), where("tenantId", "==", tenantId), where("status", "==", status));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      this.handleError(error, "ユーザーリストの取得");
    }
  }

  // --- Developer & Registration ---
  async getPendingAdmins() {
    try {
      const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      this.handleError(error, "承認待ち管理者リストの取得");
    }
  }

  async getActiveTenants() {
    try {
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      
      const tenantsQuery = query(collection(this.db, "tenants"));
      const usersQuery = query(collection(this.db, "users"), where("role", "==", "admin"));
      const [tenantsSnap, usersSnap] = await Promise.all([getDocs(tenantsQuery), getDocs(usersQuery)]);
      
      const tenants = tenantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const adminUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return tenants.map(tenant => {
        const admin = adminUsers.find(u => u.tenantId === tenant.id);
        return { ...tenant, adminName: admin?.name || 'N/A', adminEmail: admin?.email || 'N/A' };
      });
    } catch (error) {
      this.handleError(error, "アクティブテナントの取得");
    }
  }

  async approveAdmin(userId) {
    try {
      // セキュリティのため、この操作はCloud Functions経由で行うことを強く推奨します。
      // ここではクライアントサイドで実装しますが、本番環境ではFunctionsに移行してください。
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      
      const tenantId = doc(collection(this.db, "tenants")).id;
      const userRef = doc(this.db, "users", userId);
      const tenantRef = doc(this.db, "tenants", tenantId);

      const batch = writeBatch(this.db);
      batch.update(userRef, { status: 'active', tenantId: tenantId });
      batch.set(tenantRef, { adminId: userId, status: 'active', createdAt: serverTimestamp() });
      
      await batch.commit();
      console.log("API: Admin approved:", userId);
    } catch (error) {
      this.handleError(error, "管理者の承認");
    }
  }

  // ... 他のすべてのメソッドは、ご提示いただいたコードのままで問題ありません ...
  // (getEvaluationHistory, getEvaluationChartData, saveSettings, etc.)
}
