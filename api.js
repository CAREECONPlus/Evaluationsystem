// Firebase SDKから必要な関数をインポートします。
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc, writeBatch, getCountFromServer, limit, orderBy } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated) - 完全修正版
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
    // serverTimestampを直接エクスポート
    this.serverTimestamp = serverTimestamp;

    console.log("API: Initialized successfully with Firebase App from Auth module.");
  }

  handleError(error, operation) {
    console.error(`API: Error in ${operation}:`, error);
    const message = error.code ? {
      'permission-denied': "権限がありません。Firestoreのセキュリティルールを確認してください。",
      'not-found': "データが見つかりません。",
      'unavailable': "サービスが一時的に利用できません。しばらくしてからもう一度お試しください。",
      'unauthenticated': "認証が必要です。再度ログインしてください。"
    }[error.code] || `エラー: ${error.message}` : `予期せぬエラーが発生しました: ${operation}`;
    
    this.app.showError(message);
    throw error;
  }

  // --- User and Tenant Management ---

  async getUserProfile(uid) {
    try {
      const userDocRef = doc(this.db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      this.handleError(error, `ユーザープロファイルの取得 (uid: ${uid})`);
    }
  }
  
  async createUserProfile(uid, profileData) {
    try {
      await setDoc(doc(this.db, "users", uid), {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      this.handleError(error, "ユーザープロファイルの作成");
    }
  }

  async getUsers(status = 'active') {
    try {
      const q = query(collection(this.db, "users"), 
        where("tenantId", "==", this.app.currentUser.tenantId),
        where("status", "==", status)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.handleError(error, `ユーザーリストの取得 (status: ${status})`);
    }
  }

  async getSubordinates() {
    try {
        const q = query(collection(this.db, "users"),
            where("tenantId", "==", this.app.currentUser.tenantId),
            where("evaluatorId", "==", this.app.currentUser.uid),
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        this.handleError(error, "部下一覧の取得");
    }
  }

  async updateUser(userId, data) {
    try {
      const userRef = doc(this.db, "users", userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      this.handleError(error, `ユーザー情報の更新 (userId: ${userId})`);
    }
  }

  // 新規追加: ユーザーステータス更新
  async updateUserStatus(userId, status) {
    try {
      await updateDoc(doc(this.db, "users", userId), { 
        status: status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      this.handleError(error, `ユーザーステータスの更新 (userId: ${userId})`);
    }
  }

  // 新規追加: ユーザー削除
  async deleteUser(userId) {
    try {
      await deleteDoc(doc(this.db, "users", userId));
    } catch (error) {
      this.handleError(error, `ユーザーの削除 (userId: ${userId})`);
    }
  }
  
  async createInvitation(invitationData) {
    try {
        const invitationRef = doc(collection(this.db, "invitations"));
        const token = invitationRef.id;
        await setDoc(invitationRef, {
            ...invitationData,
            token: token,
            tenantId: this.app.currentUser.tenantId,
            companyName: this.app.currentUser.companyName,
            used: false,
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        return token;
    } catch (error) {
        this.handleError(error, "招待の作成");
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
            usedAt: serverTimestamp(),
            usedBy: userId
        });
    } catch (error) {
        this.handleError(error, "招待の使用済み更新");
    }
  }

  // --- Settings ---

  async getSettings() {
    try {
        const tenantId = this.app.currentUser.tenantId;
        const jobTypesQuery = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", tenantId));
        const periodsQuery = query(collection(this.db, "evaluationPeriods"), where("tenantId", "==", tenantId));
        const structuresQuery = query(collection(this.db, "evaluationStructures"), where("tenantId", "==", tenantId));

        const [jobTypesSnap, periodsSnap, structuresSnap] = await Promise.all([
            getDocs(jobTypesQuery),
            getDocs(periodsQuery),
            getDocs(structuresQuery)
        ]);

        const structures = {};
        structuresSnap.docs.forEach(doc => {
            structures[doc.data().jobTypeId] = { id: doc.id, ...doc.data() };
        });

        return {
            jobTypes: jobTypesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            periods: periodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            structures: structures
        };
    } catch (error) {
        this.handleError(error, "設定情報の取得");
    }
  }

  // 新規追加: 職種リストの取得
  async getJobTypes() {
    try {
        const q = query(collection(this.db, "targetJobTypes"), 
            where("tenantId", "==", this.app.currentUser.tenantId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        this.handleError(error, "職種リストの取得");
    }
  }

  async getEvaluationStructure(jobTypeId) {
      try {
          const q = query(collection(this.db, "evaluationStructures"), 
              where("jobTypeId", "==", jobTypeId), 
              where("tenantId", "==", this.app.currentUser.tenantId));
          const snapshot = await getDocs(q);
          if(snapshot.empty) return null;
          return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      } catch (error) {
          this.handleError(error, `評価構造の取得 (jobTypeId: ${jobTypeId})`);
      }
  }

  async saveSettings(settings) {
    const batch = writeBatch(this.db);
    const tenantId = this.app.currentUser.tenantId;
    
    try {
      // 職種の保存
      settings.jobTypes.forEach(jt => {
          const ref = jt.id && !jt.id.startsWith('jt_') 
              ? doc(this.db, "targetJobTypes", jt.id) 
              : doc(collection(this.db, "targetJobTypes"));
          batch.set(ref, { 
              name: jt.name,
              tenantId: tenantId,
              updatedAt: serverTimestamp()
          }, { merge: true });
      });
      
      // 評価期間の保存
      settings.periods.forEach(period => {
          const ref = period.id && !period.id.startsWith('p_')
              ? doc(this.db, "evaluationPeriods", period.id)
              : doc(collection(this.db, "evaluationPeriods"));
          batch.set(ref, {
              name: period.name,
              startDate: period.startDate,
              endDate: period.endDate,
              tenantId: tenantId,
              updatedAt: serverTimestamp()
          }, { merge: true });
      });
      
      // 評価構造の保存
      Object.keys(settings.structures).forEach(jobTypeId => {
          const structure = settings.structures[jobTypeId];
          if (structure && structure.categories) {
              const ref = structure.id && !structure.id.startsWith('struct_')
                  ? doc(this.db, "evaluationStructures", structure.id)
                  : doc(collection(this.db, "evaluationStructures"));
              batch.set(ref, {
                  jobTypeId: jobTypeId,
                  categories: structure.categories,
                  tenantId: tenantId,
                  updatedAt: serverTimestamp()
              }, { merge: true });
          }
      });
      
      await batch.commit();
    } catch (error) {
      this.handleError(error, "設定の保存");
    }
  }

  // --- Evaluations ---
  
  async getEvaluations(filters = {}) {
    try {
        let q = query(collection(this.db, "evaluations"), 
            where("tenantId", "==", this.app.currentUser.tenantId));
        if (filters.status) {
            q = query(q, where("status", "==", filters.status));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        this.handleError(error, "評価リストの取得");
    }
  }

  async getEvaluationById(evaluationId) {
    try {
      const evalDoc = await getDoc(doc(this.db, "evaluations", evaluationId));
      if (!evalDoc.exists()) return null;
      return { id: evalDoc.id, ...evalDoc.data() };
    } catch (error) {
      this.handleError(error, `評価詳細の取得`);
    }
  }
  
  async getEvaluationHistory(evaluationId) {
    // 評価履歴の取得（簡易実装）
    return [
      { status: 'created', actor: 'System', timestamp: new Date() },
      { status: 'self_assessed', actor: 'Worker', timestamp: new Date() },
      { status: 'completed', actor: 'Admin', timestamp: new Date() }
    ];
  }

  async saveEvaluation(data) {
    try {
        const evalRef = data.id ? doc(this.db, "evaluations", data.id) : doc(collection(this.db, "evaluations"));
        await setDoc(evalRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        this.handleError(error, "評価データの保存");
    }
  }

  async updateEvaluationStatus(evalId, status, additionalData = {}) {
      try {
          const evalRef = doc(this.db, "evaluations", evalId);
          await updateDoc(evalRef, { 
              status: status,
              ...additionalData,
              updatedAt: serverTimestamp()
          });
      } catch (error) {
          this.handleError(error, `評価ステータスの更新 (id: ${evalId})`);
      }
  }

  // --- Goals ---

  async getGoals(userId, periodId) {
      try {
          const q = query(collection(this.db, "qualitativeGoals"),
              where("tenantId", "==", this.app.currentUser.tenantId),
              where("userId", "==", userId),
              where("periodId", "==", periodId)
          );
          const snapshot = await getDocs(q);
          if (snapshot.empty) return null;
          return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      } catch (error) {
          this.handleError(error, "個人目標の取得");
      }
  }

  async getGoalsByStatus(status) {
    try {
        const q = query(collection(this.db, "qualitativeGoals"), 
            where("tenantId", "==", this.app.currentUser.tenantId),
            where("status", "==", status)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        this.handleError(error, `目標リストの取得 (status: ${status})`);
    }
  }

  async saveGoals(data) {
    try {
        const goalRef = data.id ? doc(this.db, "qualitativeGoals", data.id) : doc(collection(this.db, "qualitativeGoals"));
        await setDoc(goalRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        this.handleError(error, "個人目標の保存");
    }
  }
  
  async updateGoalStatus(goalId, status) {
    try {
        const goalRef = doc(this.db, "qualitativeGoals", goalId);
        await updateDoc(goalRef, { 
            status: status,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        this.handleError(error, `目標ステータスの更新 (id: ${goalId})`);
    }
  }

  // --- Dashboard ---

  async getDashboardStats() {
    try {
        const currentUser = this.app.currentUser;
        if (!currentUser || !currentUser.tenantId) throw new Error("User not authenticated or tenantId is missing");

        const usersRef = collection(this.db, "users");
        const evaluationsRef = collection(this.db, "evaluations");

        const tenantId = currentUser.tenantId;
        const totalUsersQuery = query(usersRef, where("tenantId", "==", tenantId), where("status", "==", "active"));
        const completedQuery = query(evaluationsRef, where("tenantId", "==", tenantId), where("status", "==", "completed"));
        const pendingQuery = query(evaluationsRef, where("tenantId", "==", tenantId), where("status", "in", ["pending_approval", "self_assessed"]));

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
        const q = query(collection(this.db, "evaluations"), 
            where("tenantId", "==", this.app.currentUser.tenantId), 
            orderBy("updatedAt", "desc"), 
            limit(5));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        // updatedAtフィールドがない場合のフォールバック
        console.warn("Recent evaluations query failed, trying without ordering:", error);
        try {
            const q = query(collection(this.db, "evaluations"), 
                where("tenantId", "==", this.app.currentUser.tenantId), 
                limit(5));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (fallbackError) {
            this.handleError(fallbackError, "最近の評価取得");
        }
    }
  }

  async getEvaluationChartData() {
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
  
  // --- Developer-specific methods ---
  async getPendingAdmins() {
    try {
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { 
      this.handleError(error, "承認待ち管理者リストの取得"); 
    }
  }

  async getActiveTenants() {
    try {
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      const tenantsQuery = query(collection(this.db, "tenants"), where("status", "==", "active"));
      const usersQuery = query(collection(this.db, "users"), where("role", "==", "admin"), where("status", "==", "active"));
      const [tenantsSnap, usersSnap] = await Promise.all([getDocs(tenantsQuery), getDocs(usersQuery)]);
      
      const adminUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return tenantsSnap.docs.map(tenantDoc => {
        const tenant = { id: tenantDoc.id, ...tenantDoc.data() };
        const admin = adminUsers.find(u => u.tenantId === tenant.id);
        const companyName = tenant.companyName || admin?.companyName || '名称未設定';
        return { 
          ...tenant, 
          adminName: admin?.name || 'N/A', 
          adminEmail: admin?.email || 'N/A', 
          companyName 
        };
      });
    } catch (error) { 
      this.handleError(error, "アクティブテナントの取得"); 
    }
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
      batch.update(userRef, { 
        status: 'active', 
        tenantId: tenantId,
        updatedAt: serverTimestamp()
      });
      batch.set(tenantRef, { 
        adminId: userId, 
        companyName: companyName, 
        status: 'active', 
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error) { 
      this.handleError(error, "管理者アカウントの承認"); 
    }
  }

  // 新規追加: テナントステータス更新
  async updateTenantStatus(tenantId, status) {
    try {
      if (!this.app.hasRole('developer')) throw new Error("開発者権限が必要です");
      await updateDoc(doc(this.db, "tenants", tenantId), { 
        status: status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      this.handleError(error, `テナントステータスの更新 (tenantId: ${tenantId})`);
    }
  }
}
