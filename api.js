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

    if (!app.auth || !app.auth.firebaseApp) {
      console.error("API FATAL: Firebase App is not initialized in Auth module!");
      this.app.showError("アプリケーションの初期化に失敗しました。Authモジュールを確認してください。");
      return;
    }
    this.firebaseApp = app.auth.firebaseApp; 
    
    this.db = getFirestore(this.firebaseApp);
    this.functions = getFunctions(this.firebaseApp);
    
    // ★ 修正点: serverTimestampをクラスのプロパティとして利用可能にする
    this.serverTimestamp = serverTimestamp;

    console.log("API: Initialized successfully with Firebase App from Auth module.");
  }

  handleError(error, operation) {
    console.error(`API: Error in ${operation}:`, error);
    const message = error.code ? {
      'permission-denied': "権限がありません。管理者に連絡してください。",
      'not-found': "データが見つかりません。",
      'unavailable': "サービスが一時的に利用できません。しばらくしてからもう一度お試しください。",
      'unauthenticated': "認証が必要です。再度ログインしてください。"
    }[error.code] || `エラー: ${error.message}` : `予期せぬエラーが発生しました: ${operation}`;
    
    this.app.showError(message);
    throw error;
  }

  async getUserProfile(uid) {
    try {
      const userDocRef = doc(this.db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return { uid: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      this.handleError(error, `ユーザープロファイルの取得 (uid: ${uid})`);
    }
  }

  async createUserProfile(uid, profileData) {
    try {
      await setDoc(doc(this.db, "users", uid), profileData);
    } catch (error) {
      this.handleError(error, "ユーザープロファイルの作成");
    }
  }
  
  // 他のすべてのAPIメソッドは変更なし...
  // (getPendingAdmins, getActiveTenants, approveAdmin, etc.)
  // 以下、既存のAPIメソッドが続きます。
  
  async getPendingAdmins() {
    try {
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { this.handleError(error, "承認待ち管理者リストの取得"); }
  }

  async getActiveTenants() {
    try {
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      const tenantsQuery = query(collection(this.db, "tenants"), where("status", "==", "active"));
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
      batch.set(tenantRef, { adminId: userId, companyName: companyName, status: 'active', createdAt: this.serverTimestamp() });
      await batch.commit();
    } catch (error) { this.handleError(error, "管理者アカウントの承認"); }
  }
  
  async saveGoals(data) {
    try {
        const goalRef = data.id ? doc(this.db, "qualitativeGoals", data.id) : doc(collection(this.db, "qualitativeGoals"));
        await setDoc(goalRef, data, { merge: true });
    } catch (error) {
        this.handleError(error, "個人目標の保存");
    }
  }
  
  async saveEvaluation(data) {
    try {
        const evalRef = data.id ? doc(this.db, "evaluations", data.id) : doc(collection(this.db, "evaluations"));
        await setDoc(evalRef, data, { merge: true });
    } catch (error) {
        this.handleError(error, "評価データの保存");
    }
  }
  
  async getInvitation(token) {
    try {
        const q = query(collection(this.db, "invitations"), where("token", "==", token));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
        this.handleError(error, "招待情報の取得");
    }
  }

  async markInvitationAsUsed(invitationId, userId) {
    try {
        const invitationRef = doc(this.db, "invitations", invitationId);
        await updateDoc(invitationRef, {
            used: true,
            usedAt: this.serverTimestamp(),
            usedBy: userId
        });
    } catch (error) {
        this.handleError(error, "招待の使用済み更新");
    }
  }
  
  async getDashboardStats() {
    try {
        const currentUser = this.app.currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        const usersRef = collection(this.db, "users");
        const evaluationsRef = collection(this.db, "evaluations");

        let totalUsersQuery, completedQuery, pendingQuery;

        if (this.app.hasRole('developer')) {
            totalUsersQuery = query(usersRef, where("status", "==", "active"));
            completedQuery = query(evaluationsRef, where("status", "==", "completed"));
            pendingQuery = query(evaluationsRef, where("status", "in", ["pending_approval", "self_assessed"]));
        } else {
            const tenantId = currentUser.tenantId;
            totalUsersQuery = query(usersRef, where("tenantId", "==", tenantId), where("status", "==", "active"));
            completedQuery = query(evaluationsRef, where("tenantId", "==", tenantId), where("status", "==", "completed"));
            pendingQuery = query(evaluationsRef, where("tenantId", "==", tenantId), where("status", "in", ["pending_approval", "self_assessed"]));
        }

        const [totalUsersSnap, completedSnap, pendingSnap] = await Promise.all([
            getCountFromServer(totalUsersQuery),
            getCountFromServer(completedQuery),
            getCountFromServer(pendingQuery)
        ]);

        return {
            totalUsers: totalUsersSnap.data().count,
            completedEvaluations: completedSnap.data().count,
            pendingEvaluations: pendingSnap.data().count,
        };
    } catch (error) {
        this.handleError(error, "ダッシュボード統計の取得");
    }
  }
  
  async getRecentEvaluations() {
    try {
        const currentUser = this.app.currentUser;
        let q;
        if (this.app.hasRole('developer')) {
            q = query(collection(this.db, "evaluations"), orderBy("submittedAt", "desc"), limit(5));
        } else {
            q = query(collection(this.db, "evaluations"), where("tenantId", "==", currentUser.tenantId), orderBy("submittedAt", "desc"), limit(5));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        this.handleError(error, "最近の評価取得");
    }
  }

  async getEvaluationChartData() {
    // このメソッドはデモ用です。実際のアプリケーションでは、
    // より複雑な集計ロジックやCloud Functionsの利用を検討してください。
    try {
        return {
            labels: ["技術力", "品質", "安全", "協調性", "勤怠"],
            datasets: [{
                label: '部署平均',
                data: [4.2, 3.8, 4.5, 4.0, 4.8],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
            }, {
                label: 'あなたの評価',
                data: [4.5, 4.0, 4.8, 4.2, 5.0],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
            }]
        };
    } catch (error) {
        this.handleError(error, "チャートデータ取得");
    }
  }

  // ... 他の既存のAPIメソッド
}
