// Firebase SDKから必要な関数をインポートします。
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc, writeBatch, getCountFromServer, limit, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

/**
 * API Service (最小構成版)
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
    this.serverTimestamp = serverTimestamp;
    // キャッシュ機能は一時的に無効化
    this.cache = null;

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

  async createAdminInvitation(invitationData) {
    try {
        if (!this.app.hasRole('developer')) {
            throw new Error("開発者権限が必要です");
        }
        
        const invitationRef = doc(collection(this.db, "invitations"));
        const token = invitationRef.id;
        await setDoc(invitationRef, {
            ...invitationData,
            type: 'admin',
            token: token,
            used: false,
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        
        return token;
    } catch (error) {
        this.handleError(error, "管理者招待の作成");
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

  // --- Goals Management ---

  async getGoals(userId, periodId) {
    try {
        const q = query(collection(this.db, "qualitativeGoals"), 
            where("userId", "==", userId),
            where("periodId", "==", periodId),
            where("tenantId", "==", this.app.currentUser.tenantId)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
        this.handleError(error, "目標の取得");
    }
  }

  async saveGoals(goalData) {
    try {
        if (goalData.id && !goalData.id.startsWith('goal_')) {
            // 既存の目標を更新
            const goalRef = doc(this.db, "qualitativeGoals", goalData.id);
            await updateDoc(goalRef, {
                goals: goalData.goals,
                status: goalData.status,
                submittedAt: goalData.submittedAt,
                updatedAt: serverTimestamp()
            });
        } else {
            // 新規目標を作成
            const goalRef = await addDoc(collection(this.db, "qualitativeGoals"), {
                userId: goalData.userId,
                userName: goalData.userName,
                periodId: goalData.periodId,
                periodName: goalData.periodName,
                goals: goalData.goals,
                status: goalData.status,
                tenantId: goalData.tenantId,
                submittedAt: goalData.submittedAt,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return goalRef.id;
        }
    } catch (error) {
        this.handleError(error, "目標の保存");
    }
  }

  async getGoalsByStatus(status) {
    try {
        const q = query(collection(this.db, "qualitativeGoals"),
            where("tenantId", "==", this.app.currentUser.tenantId),
            where("status", "==", status),
            orderBy("submittedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        this.handleError(error, `目標の取得 (status: ${status})`);
    }
  }

  async updateGoalStatus(goalId, status, additionalData = {}) {
    try {
        const goalRef = doc(this.db, "qualitativeGoals", goalId);
        await updateDoc(goalRef, {
            status: status,
            updatedAt: serverTimestamp(),
            ...additionalData
        });
    } catch (error) {
        this.handleError(error, "目標ステータスの更新");
    }
  }

  // --- Evaluations Management ---

  async getEvaluations(filters = {}) {
    try {
        let q = query(collection(this.db, "evaluations"),
            where("tenantId", "==", this.app.currentUser.tenantId),
            orderBy("updatedAt", "desc")
        );

        // フィルターがある場合は追加
        if (filters.targetUserId) {
            q = query(q, where("targetUserId", "==", filters.targetUserId));
        }
        if (filters.periodId) {
            q = query(q, where("periodId", "==", filters.periodId));
        }
        if (filters.status) {
            q = query(q, where("status", "==", filters.status));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        this.handleError(error, "評価一覧の取得");
    }
  }

  async saveEvaluation(evaluationData) {
    try {
        if (evaluationData.id && !evaluationData.id.startsWith('eval_')) {
            // 既存の評価を更新
            const evalRef = doc(this.db, "evaluations", evaluationData.id);
            await updateDoc(evalRef, {
                ratings: evaluationData.ratings,
                status: evaluationData.status,
                submittedAt: evaluationData.submittedAt,
                updatedAt: evaluationData.updatedAt
            });
        } else {
            // 新規評価を作成
            const evalRef = await addDoc(collection(this.db, "evaluations"), {
                tenantId: evaluationData.tenantId,
                targetUserId: evaluationData.targetUserId,
                targetUserName: evaluationData.targetUserName,
                targetUserEmail: evaluationData.targetUserEmail,
                jobTypeId: evaluationData.jobTypeId,
                periodId: evaluationData.periodId,
                periodName: evaluationData.periodName,
                evaluatorId: evaluationData.evaluatorId,
                evaluatorName: evaluationData.evaluatorName,
                ratings: evaluationData.ratings,
                status: evaluationData.status,
                submittedAt: evaluationData.submittedAt,
                createdAt: serverTimestamp(),
                updatedAt: evaluationData.updatedAt
            });
            return evalRef.id;
        }
    } catch (error) {
        this.handleError(error, "評価の保存");
    }
  }

  async updateEvaluationStatus(evaluationId, status, additionalData = {}) {
    try {
        const evalRef = doc(this.db, "evaluations", evaluationId);
        await updateDoc(evalRef, {
            status: status,
            updatedAt: serverTimestamp(),
            ...additionalData
        });
    } catch (error) {
        this.handleError(error, "評価ステータスの更新");
    }
  }

  async getEvaluationById(evaluationId) {
    try {
        const evalRef = doc(this.db, "evaluations", evaluationId);
        const evalDoc = await getDoc(evalRef);
        if (evalDoc.exists()) {
            return { id: evalDoc.id, ...evalDoc.data() };
        }
        return null;
    } catch (error) {
        this.handleError(error, `評価の取得 (id: ${evaluationId})`);
    }
  }

  async getEvaluationHistory(evaluationId) {
    try {
        // 簡単な履歴シミュレーション（実際の実装では別コレクションまたは履歴フィールドを使用）
        const evaluation = await this.getEvaluationById(evaluationId);
        if (!evaluation) return [];

        const history = [];
        
        // 作成時
        if (evaluation.createdAt) {
            history.push({
                status: 'created',
                timestamp: evaluation.createdAt,
                actor: evaluation.targetUserName
            });
        }

        // 提出時
        if (evaluation.submittedAt && evaluation.status !== 'draft') {
            history.push({
                status: evaluation.status === 'self_assessed' ? 'self_assessed' : 'submitted',
                timestamp: evaluation.submittedAt,
                actor: evaluation.status === 'self_assessed' ? evaluation.targetUserName : evaluation.evaluatorName
            });
        }

        // 完了時
        if (evaluation.status === 'completed' && evaluation.updatedAt) {
            history.push({
                status: 'completed',
                timestamp: evaluation.updatedAt,
                actor: 'System'
            });
        }

        return history.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        this.handleError(error, "評価履歴の取得");
    }
  }

  // --- Dashboard (修正版) ---

  async getDashboardStats() {
    try {
      const currentUser = this.app.currentUser;
      if (!currentUser) throw new Error("User not authenticated");
      
      // 開発者の場合は全テナントの統計を取得
      if (currentUser.role === 'developer') {
        const usersRef = collection(this.db, "users");
        const evaluationsRef = collection(this.db, "evaluations");
        
        const totalUsersQuery = query(usersRef, where("status", "==", "active"));
        const completedQuery = query(evaluationsRef, where("status", "==", "completed"));
        const pendingQuery = query(evaluationsRef, where("status", "in", ["pending_approval", "self_assessed"]));
        
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
      }
      
      // 通常のユーザーの場合
      if (!currentUser.tenantId) throw new Error("tenantId is missing");
      
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
      const currentUser = this.app.currentUser;
      if (!currentUser) throw new Error("User not authenticated");
      
      let q;
      
      // 開発者の場合は全テナントから取得
      if (currentUser.role === 'developer') {
        q = query(collection(this.db, "evaluations"), 
          orderBy("updatedAt", "desc"),
          limit(5));
      } else {
        // 通常のユーザーの場合
        if (!currentUser.tenantId) throw new Error("tenantId is missing");
        
        q = query(collection(this.db, "evaluations"), 
          where("tenantId", "==", currentUser.tenantId), 
          orderBy("updatedAt", "desc"),
          limit(5));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.handleError(error, "最近の評価取得");
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

  // --- データバリデーション ---
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password) {
    return password && password.length >= 6;
  }

  validateName(name) {
    return name && name.trim().length >= 2;
  }

  validateCompanyName(companyName) {
    return companyName && companyName.trim().length >= 2;
  }

  validateWeight(weight) {
    return weight >= 0 && weight <= 100;
  }
}
