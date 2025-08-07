// Firebase SDKから必要な関数をインポートします。
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc, writeBatch, getCountFromServer, limit, orderBy } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated) - 全機能実装版
 * Firebase FirestoreおよびFunctionsとのすべての通信を処理します。
 */
export class API {
  constructor(app) {
    this.app = app;

    if (!app.auth || !app.auth.firebaseApp) {
      console.error("API FATAL: Firebase App is not initialized in Auth module!");
      this.app.showError("アプリケーションの初期化に失敗しました。Authモジュールを確認してください。");
      return;
    }
    this.firebaseApp = app.auth.firebaseApp; 
    
    this.db = getFirestore(this.firebaseApp);
    this.functions = getFunctions(this.firebaseApp);

    console.log("API: Initialized successfully with Firebase App from Auth module.");
  }

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

  getCurrentTenantId() {
    if (this.app.hasRole('developer')) {
      return this.app.currentUser?.tenantId || null;
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
      return { totalUsers: usersSnapshot.data().count, completedEvaluations: completedEvalsSnapshot.data().count, pendingEvaluations: pendingEvalsSnapshot.data().count };
    } catch (error) { this.handleError(error, "ダッシュボード統計の取得"); }
  }

  async getRecentEvaluations() {
    try {
      const tenantId = this.getCurrentTenantId();
      if (!tenantId) return [];
      const q = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), orderBy("submittedAt", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) { this.handleError(error, "最近の評価の取得"); }
  }

  async getEvaluationChartData() {
    try {
        const tenantId = this.getCurrentTenantId();
        if (!tenantId) return { radar: {}, bar: {}, line: {} };
        // NOTE: 本番環境ではより複雑な集計が必要です。これはダミー実装です。
        const labels = ['技術力', '品質', '安全', '協調性', '勤怠'];
        const personalScores = [3, 4, 3, 5, 4]; // ダミーデータ
        const averageScores = [3.5, 3.8, 4.1, 4.0, 4.5]; // ダミーデータ

        const chartData = {
            labels,
            datasets: [{
                label: this.app.i18n.t('dashboard.personal_score'),
                data: personalScores,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
            }, {
                label: this.app.i18n.t('dashboard.department_average'),
                data: averageScores,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
            }]
        };
        return { radar: chartData, bar: chartData, line: chartData };
    } catch (error) { this.handleError(error, "チャートデータの取得"); }
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
        getDocs(jobTypesQuery), getDocs(periodsQuery), getDocs(structuresQuery)
      ]);
      const structures = {};
      structuresSnap.forEach(docSnap => { structures[docSnap.id] = {id: docSnap.id, ...docSnap.data()}; });
      return {
        jobTypes: jobTypesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        periods: periodsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        structures
      };
    } catch (error) { this.handleError(error, "設定データの取得"); }
  }
  
  async saveSettings(settings) {
    try {
        const tenantId = this.getCurrentTenantId();
        const batch = writeBatch(this.db);

        const collections = {
            targetJobTypes: settings.jobTypes,
            evaluationPeriods: settings.periods,
            evaluationStructures: Object.values(settings.structures)
        };

        for (const [colName, docs] of Object.entries(collections)) {
            docs.forEach(data => {
                const { id, ...rest } = data;
                const ref = doc(this.db, colName, id);
                batch.set(ref, { ...rest, tenantId });
            });
        }
        await batch.commit();
    } catch (error) {
        this.handleError(error, "設定の保存");
    }
  }

  async getJobTypes() {
    try {
        const tenantId = this.getCurrentTenantId();
        if (!tenantId) return [];
        const q = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", tenantId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { this.handleError(error, "職種リストの取得"); }
  }

  // --- User Management & Invitations ---
  async getUsers(status) {
    try {
      const tenantId = this.getCurrentTenantId();
      if (!tenantId) return [];
      const q = query(collection(this.db, "users"), where("tenantId", "==", tenantId), where("status", "==", status));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) { this.handleError(error, "ユーザーリストの取得"); }
  }

  async getSubordinates() {
    try {
        const tenantId = this.getCurrentTenantId();
        const evaluatorId = this.app.currentUser.uid;
        if (!tenantId) return [];
        const q = query(collection(this.db, "users"), where("tenantId", "==", tenantId), where("evaluatorId", "==", evaluatorId), where("status", "==", "active"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e) { this.handleError(e, "部下リストの取得"); }
  }

  async updateUserStatus(userId, status) {
      const userRef = doc(this.db, "users", userId);
      await updateDoc(userRef, { status: status });
  }

  async deleteUser(userId) {
      const userRef = doc(this.db, "users", userId);
      await deleteDoc(userRef);
  }
  
  async updateUser(userId, data) {
      const userRef = doc(this.db, "users", userId);
      await updateDoc(userRef, data);
  }

  async createInvitation(invitationData) {
      const token = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const invitationRef = doc(this.db, "invitations", token);
      await setDoc(invitationRef, {
          ...invitationData,
          tenantId: this.getCurrentTenantId(),
          companyName: this.app.currentUser.companyName,
          used: false,
          createdAt: serverTimestamp(),
      });
      return token;
  }
  
  async getInvitation(token) {
      const invitationRef = doc(this.db, "invitations", token);
      const docSnap = await getDoc(invitationRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
  
  async markInvitationAsUsed(token, userId) {
      const invitationRef = doc(this.db, "invitations", token);
      await updateDoc(invitationRef, { used: true, usedBy: userId, usedAt: serverTimestamp() });
  }
  
  async createUserProfile(uid, profileData) {
      await setDoc(doc(this.db, "users", uid), profileData);
  }
  
  // --- Goals ---
  async getGoalsByStatus(status) {
    try {
        const tenantId = this.getCurrentTenantId();
        if (!tenantId) return [];
        const q = query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", tenantId), where("status", "==", status));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e) { this.handleError(e, "目標リストの取得"); }
  }

  async getGoals(userId, periodId) {
      const q = query(collection(this.db, "qualitativeGoals"), where("userId", "==", userId), where("periodId", "==", periodId), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const d = snapshot.docs[0];
      return { id: d.id, ...d.data() };
  }
  
  async saveGoals(data) {
    const { id, ...goalData } = data;
    if (id) {
        const ref = doc(this.db, "qualitativeGoals", id);
        await updateDoc(ref, goalData);
    } else {
        const ref = doc(collection(this.db, "qualitativeGoals"));
        await setDoc(ref, goalData);
    }
  }

  async updateGoalStatus(id, status) {
      const ref = doc(this.db, "qualitativeGoals", id);
      await updateDoc(ref, { status });
  }
  
  // --- Evaluations ---
  async getEvaluations() {
    try {
        const tenantId = this.getCurrentTenantId();
        if (!tenantId) return [];
        const q = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { this.handleError(e, "評価一覧の取得"); }
  }
  
  async getEvaluationById(id) {
      const ref = doc(this.db, "evaluations", id);
      const docSnap = await getDoc(ref);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
  
  async getEvaluationHistory(id) {
      const evaluation = await this.getEvaluationById(id);
      if (!evaluation) return [];
      // NOTE: 本番環境では監査ログ用の別コレクションを引くべきです。これは簡易実装です。
      return [
          { status: 'pending_submission', actor: evaluation.targetUserName, timestamp: evaluation.createdAt },
          { status: 'self_assessed', actor: evaluation.targetUserName, timestamp: evaluation.submittedAt },
          { status: 'pending_approval', actor: evaluation.evaluatorName, timestamp: evaluation.submittedAt },
      ].filter(item => item.timestamp);
  }
  
  async saveEvaluation(data) {
    const { id, ...evalData } = data;
    if (id) {
        const ref = doc(this.db, "evaluations", id);
        await updateDoc(ref, evalData);
    } else {
        const ref = doc(collection(this.db, "evaluations"));
        await setDoc(ref, evalData);
    }
  }

  async updateEvaluationStatus(evalId, status, extraData = {}) {
      const ref = doc(this.db, "evaluations", evalId);
      await updateDoc(ref, { status, ...extraData });
  }

  async getEvaluationStructure(jobTypeId) {
      if (!jobTypeId) return null;
      const ref = doc(this.db, "evaluationStructures", jobTypeId);
      const docSnap = await getDoc(ref);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  // --- Developer ---
  async getPendingAdmins() {
    try {
      const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) { this.handleError(error, "承認待ち管理者リストの取得"); }
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
        const companyName = tenant.companyName || admin?.companyName || '名称未設定';
        return { ...tenant, adminName: admin?.name || 'N/A', adminEmail: admin?.email || 'N/A', companyName };
      });
    } catch (error) { this.handleError(error, "アクティブテナントの取得"); }
  }

  async approveAdmin(userId) {
    try {
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      const userRef = doc(this.db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) throw new Error("User not found");
      const companyName = userDoc.data()?.companyName || '名称未設定';
      const tenantId = doc(collection(this.db, "tenants")).id;
      const tenantRef = doc(this.db, "tenants", tenantId);
      const batch = writeBatch(this.db);
      batch.update(userRef, { status: 'active', tenantId: tenantId });
      batch.set(tenantRef, { adminId: userId, companyName: companyName, status: 'active', createdAt: serverTimestamp() });
      await batch.commit();
    } catch (error) { this.handleError(error, "管理者の承認"); }
  }

  async updateTenantStatus(tenantId, status) {
    if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
    const ref = doc(this.db, "tenants", tenantId);
    await updateDoc(ref, { status });
  }
}
