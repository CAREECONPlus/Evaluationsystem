// Firebase SDKから必要な関数をインポートします。
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc, writeBatch, getCountFromServer, limit, orderBy } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated) - 修正版
 * Firebase FirestoreおよびFunctionsとのすべての通信を処理します。
 */
export class API {
  constructor(app) {
    this.app = app;

    // ★★★ 修正点 1: Authモジュールから初期化済みインスタンスを受け取る ★★★
    // window.firebaseに依存せず、app.authが初期化したfirebaseAppを直接参照する。
    // これにより、APIがAuthより先に初期化されることがなくなり、レースコンディションが解消される。
    if (!app.auth || !app.auth.firebaseApp) {
      console.error("API FATAL: Firebase App is not initialized in Auth module!");
      this.app.showError("アプリケーションの初期化に失敗しました。Authモジュールを確認してください。");
      return;
    }
    this.firebaseApp = app.auth.firebaseApp; 
    
    // ★★★ 修正点 2: 受け取ったインスタンスで各サービスを初期化 ★★★
    this.db = getFirestore(this.firebaseApp);
    this.functions = getFunctions(this.firebaseApp);

    console.log("API: Initialized successfully with Firebase App from Auth module.");
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
    // developerロールの場合はtenantIdがないため、エラーをスローしないように変更
    if (this.app.hasRole('developer')) {
      const tenantId = this.app.currentUser?.tenantId;
      if (tenantId) return tenantId;
      // developerが特定のテナントで操作する場合はtenantIdが設定されている想定
      // 設定されていない場合は、テナントに依存しない操作とみなす
      return null;
    }
    
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
      if (!tenantId) return { totalUsers: 0, completedEvaluations: 0, pendingEvaluations: 0 };

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
      if (!tenantId) return { jobTypes: [], periods: [], structures: {} };

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
      if (!tenantId) return [];

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
      const usersQuery = query(collection(this.db, "users"), where("role", "==", "admin"), where("status", "==", "active"));
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
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      
      const tenantId = doc(collection(this.db, "tenants")).id;
      const userRef = doc(this.db, "users", userId);
      const tenantRef = doc(this.db, "tenants", tenantId);
      const userDoc = await getDoc(userRef);
      const companyName = userDoc.data()?.companyName || '名称未設定';

      const batch = writeBatch(this.db);
      batch.update(userRef, { status: 'active', tenantId: tenantId });
      batch.set(tenantRef, { adminId: userId, companyName: companyName, status: 'active', createdAt: serverTimestamp() });
      
      await batch.commit();
      console.log("API: Admin approved:", userId);
    } catch (error) {
      this.handleError(error, "管理者の承認");
    }
  }

  // (他のメソッドは変更なしのため省略)
}
