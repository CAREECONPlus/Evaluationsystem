/**
 * API Module - Firestore operations (Complete Version) - 修正版
 * API モジュール - Firestore操作（完全版）
 */
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

export class API {
  constructor(app) {
    this.app = app;
    this.auth = app.auth;
    this.db = getFirestore(app.auth.firebaseApp);
    console.log("API: Initialized with shared Firestore instance from Auth");
  }

  // ===== Validation Methods =====

  /**
   * メールアドレスの検証
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * パスワードの検証
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return false;
    }
    
    return password.length >= 6;
  }

  /**
   * 名前の検証
   */
  validateName(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    return name.trim().length >= 2;
  }

  /**
   * 企業名の検証
   */
  validateCompanyName(companyName) {
    if (!companyName || typeof companyName !== 'string') {
      return false;
    }
    return companyName.trim().length >= 2;
  }

  // ===== Error Handling =====
  handleError(error, operation = '操作') {
    console.error(`API: Error in ${operation}:`, error);
    
    let userMessage = `${operation}中にエラーが発生しました。`;
    
    if (error.code === 'permission-denied') {
      userMessage = `${operation}の権限がありません。`;
    } else if (error.code === 'not-found') {
      userMessage = `${operation}で指定されたデータが見つかりません。`;
    } else if (error.code === 'unavailable') {
      userMessage = `サービスが一時的に利用できません。しばらく待ってから再試行してください。`;
    }
    
    // アプリケーション全体のエラーハンドラーを呼び出し（存在する場合）
    if (window.app && window.app.showError) {
      window.app.showError(userMessage);
    }
  }

  // ===== Utility Method =====
  serverTimestamp() {
    return serverTimestamp();
  }

  // ===== User Profile Management =====

  /**
   * ユーザープロファイルを取得（auth.jsで使用）
   */
  async getUserProfile(uid) {
    try {
      console.log("API: User profile found:", Object);
      console.log("API: User profile UID check:", uid);
      
      // まずusersコレクションから取得を試みる
      const userDoc = await getDoc(doc(this.db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: uid,
          uid: uid,
          ...userData
        };
      }

      // global_usersからも検索（メールベースなのでcurrentUserからメール取得）
      if (this.auth.currentUser && this.auth.currentUser.email) {
        const globalUserDoc = await getDoc(doc(this.db, "global_users", this.auth.currentUser.email));
        if (globalUserDoc.exists()) {
          const userData = globalUserDoc.data();
          return {
            id: this.auth.currentUser.email,
            uid: uid,
            ...userData
          };
        }
      }

      console.log("API: User profile not found for uid:", uid);
      return null;

    } catch (error) {
      console.error("API: Error getting user profile:", error);
      throw error;
    }
  }
  
  /**
   * 現在のユーザーデータを取得
   */
  async getCurrentUserData() {
    try {
      // まずアプリに保存されている現在のユーザー情報を確認
      if (this.app && this.app.currentUser) {
        console.log("API: Using cached current user data:", this.app.currentUser);
        return this.app.currentUser;
      }

      // フォールバック: Firebase Authから直接取得
      if (!this.auth.currentUser) {
        console.log("API: No authenticated user");
        return null;
      }

      const uid = this.auth.currentUser.uid;
      const email = this.auth.currentUser.email;
      
      console.log("API: Current user data:");
      console.log("API: Resolved user UID:", uid);

      // グローバルユーザーデータを優先して取得
      if (email) {
        const globalUserDoc = await getDoc(doc(this.db, "global_users", email));
        if (globalUserDoc.exists()) {
          const data = globalUserDoc.data();
          console.log("API: Current user tenantId:", data.tenantId);
          return { id: email, ...data };
        }
      }

      // フォールバック: レガシーusersコレクション
      const userDoc = await getDoc(doc(this.db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("API: Current user tenantId:", data.tenantId);
        return { id: uid, ...data };
      }

      console.log("API: User profile not found for uid:", uid);
      return null;

    } catch (error) {
      console.error("API: Error getting current user data:", error);
      return null;
    }
  }

  /**
   * ユーザープロファイルを作成
   */
  async createUserProfile(userData) {
    try {
      // undefinedフィールドを除外する関数
      const cleanData = (obj) => {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };

      // データをクリーンアップ
      const cleanedUserData = cleanData(userData);
      
      console.log("API: Creating user profile with cleaned data:", cleanedUserData);

      // usersコレクションに保存
      await setDoc(doc(this.db, "users", userData.uid), {
        ...cleanedUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // global_usersにも保存（メールベース）
      if (userData.email) {
        await setDoc(doc(this.db, "global_users", userData.email), {
          ...cleanedUserData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      console.log("API: User profile created successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error creating user profile:", error);
      this.handleError(error, 'ユーザープロファイルの作成');
      throw error;
    }
  }

  /**
   * ユーザープロファイル更新
   */
  async updateUserProfile(uid, profileData) {
    try {
      console.log("API: Updating user profile:", uid, profileData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw new Error("認証が必要です");
      }

      // 権限チェック（自分のプロファイルのみ更新可能）
      if (uid !== this.auth.currentUser?.uid && !this.app.hasRole('admin')) {
        throw new Error("このプロファイルを更新する権限がありません");
      }

      // 更新データのクリーンアップ
      const cleanData = {};
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      }

      const updateData = {
        ...cleanData,
        updatedAt: serverTimestamp()
      };

      // usersコレクションの更新
      const userRef = doc(this.db, "users", uid);
      await updateDoc(userRef, updateData);

      // global_usersの更新（メールが存在する場合）
      if (this.auth.currentUser?.email) {
        const globalUserRef = doc(this.db, "global_users", this.auth.currentUser.email);
        const globalUserDoc = await getDoc(globalUserRef);
        if (globalUserDoc.exists()) {
          await updateDoc(globalUserRef, updateData);
        }
      }

      console.log("API: User profile updated successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error updating user profile:", error);
      this.handleError(error, 'プロファイル更新');
      throw error;
    }
  }

  /**
   * パスワード変更
   */
  async changePassword(currentPassword, newPassword) {
    try {
      console.log("API: Changing password for user");

      if (!this.auth.currentUser) {
        throw new Error("認証が必要です");
      }

      // Firebase Authのパスワード変更機能を使用
      const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
      );

      // 現在のパスワードで再認証
      const credential = EmailAuthProvider.credential(
        this.auth.currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(this.auth.currentUser, credential);

      // 新しいパスワードに変更
      await updatePassword(this.auth.currentUser, newPassword);

      console.log("API: Password changed successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error changing password:", error);
      
      // Firebase Authのエラーコードに応じたメッセージ
      if (error.code === 'auth/wrong-password') {
        throw new Error("現在のパスワードが正しくありません");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("新しいパスワードが弱すぎます");
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error("セキュリティのため、再ログインが必要です");
      }
      
      this.handleError(error, 'パスワード変更');
      throw error;
    }
  }

// ===== User Management =====

/**
   * テナント内のユーザー一覧を取得（修正版）
   */
  async getUsers(statusFilter = null) {
    try {
      console.log("API: Loading users...", statusFilter ? `with status filter: ${statusFilter}` : '');
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Loading users for tenant:", tenantId);

      const usersQuery = query(
        collection(this.db, "users"),
        where("tenantId", "==", tenantId)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const users = [];

      usersSnapshot.forEach((doc) => {
        const userData = {
          id: doc.id,
          ...doc.data()
        };
        
        if (statusFilter) {
          if (userData.status === statusFilter) {
            users.push(userData);
          }
        } else {
          users.push(userData);
        }
      });

      users.sort((a, b) => {
        const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return bTime - aTime;
      });

      console.log("API: Users loaded successfully:", users.length);
      return users;

    } catch (error) {
      console.error("API: Error loading users:", error);
      this.handleError(error, 'ユーザー一覧の読み込み');
      throw error;
    }
  }

  /**
   * アクティブユーザーのみ取得
   */
  async getActiveUsers() {
    return await this.getUsers('active');
  }

  /**
   * 全ユーザー取得（明示的メソッド）
   */
  async getAllUsers() {
    return await this.getUsers(null);
  }

  /**
   * 部下ユーザーの取得（評価者用）
   */
  async getSubordinates() {
    try {
      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw new Error("現在のユーザー情報が見つかりません");
      }

      // 直接getAllUsers()を呼んで無限再帰を避ける
      const allUsers = await this.getAllUsers();
      const subordinates = allUsers.filter(user => user.evaluatorId === currentUser.uid);
      
      console.log("API: Subordinates loaded:", subordinates.length);
      return subordinates;

    } catch (error) {
      console.error("API: Error loading subordinates:", error);
      throw error;
    }
  }

  /**
   * 特定のユーザー情報を取得
   */
  async getUser(userId) {
    try {
      console.log("API: Loading user:", userId);
      
      const userDoc = await getDoc(doc(this.db, "users", userId));
      
      if (!userDoc.exists()) {
        throw new Error("ユーザーが見つかりません");
      }

      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };

      console.log("API: User loaded:", userData);
      return userData;

    } catch (error) {
      console.error("API: Error loading user:", error);
      this.handleError(error, 'ユーザー情報の読み込み');
      throw error;
    }
  }

  /**
   * ユーザー情報を更新
   */
  async updateUser(userId, updateData) {
    try {
      console.log("API: Updating user:", userId, updateData);
      
      const userRef = doc(this.db, "users", userId);
      
      // undefinedフィールドを除外
      const cleanData = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      }

      await updateDoc(userRef, {
        ...cleanData,
        updatedAt: serverTimestamp()
      });

      // global_usersも更新（存在する場合）
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().email) {
        try {
          const globalUserRef = doc(this.db, "global_users", userDoc.data().email);
          await updateDoc(globalUserRef, {
            ...cleanData,
            updatedAt: serverTimestamp()
          });
        } catch (globalError) {
          console.warn("API: Failed to update global_users:", globalError);
        }
      }

      console.log("API: User updated successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error updating user:", error);
      this.handleError(error, 'ユーザー情報の更新');
      throw error;
    }
  }

  /**
   * ユーザーを削除
   */
  async deleteUser(userId) {
    try {
      console.log("API: Deleting user:", userId);
      
      // ユーザー情報を取得してメールアドレスを確認
      const userDoc = await getDoc(doc(this.db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      // usersコレクションから削除
      await deleteDoc(doc(this.db, "users", userId));

      // global_usersからも削除（存在する場合）
      if (userData && userData.email) {
        try {
          await deleteDoc(doc(this.db, "global_users", userData.email));
        } catch (globalError) {
          console.warn("API: Failed to delete from global_users:", globalError);
        }
      }

      console.log("API: User deleted successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error deleting user:", error);
      this.handleError(error, 'ユーザーの削除');
      throw error;
    }
  }

  /**
   * ユーザーのステータスを変更
   */
  async updateUserStatus(userId, status) {
    try {
      console.log("API: Updating user status:", userId, status);
      
      return await this.updateUser(userId, { status });

    } catch (error) {
      console.error("API: Error updating user status:", error);
      this.handleError(error, 'ユーザーステータスの更新');
      throw error;
    }
  }

  /**
   * ユーザーの役割を変更
   */
  async updateUserRole(userId, role) {
    try {
      console.log("API: Updating user role:", userId, role);
      
      return await this.updateUser(userId, { role });

    } catch (error) {
      console.error("API: Error updating user role:", error);
      this.handleError(error, 'ユーザー役割の更新');
      throw error;
    }
  }

  // ===== Invitation Management =====

  /**
   * 招待を取得
   */
  async getInvitation(token) {
    try {
      console.log("API: Getting invitation:", token);
      
      const invitationDoc = await getDoc(doc(this.db, "invitations", token));
      
      if (!invitationDoc.exists()) {
        return null;
      }

      const invitation = {
        id: invitationDoc.id,
        ...invitationDoc.data()
      };

      console.log("API: Invitation loaded:", invitation);
      return invitation;

    } catch (error) {
      console.error("API: Error getting invitation:", error);
      this.handleError(error, '招待情報の取得');
      throw error;
    }
  }

  /**
   * 招待コードを検証
   */
  async validateInvitationCode(code) {
    try {
      console.log("API: Validating invitation code:", code);
      
      // 招待コードのクエリ
      const invitationsQuery = query(
        collection(this.db, "invitations"),
        where("code", "==", code),
        where("used", "==", false),
        limit(1)
      );

      const invitationsSnapshot = await getDocs(invitationsQuery);
      
      if (invitationsSnapshot.empty) {
        throw new Error("無効な招待コードです");
      }

      const invitationDoc = invitationsSnapshot.docs[0];
      const invitation = {
        id: invitationDoc.id,
        ...invitationDoc.data()
      };

      // 有効期限チェック
      if (new Date(invitation.expiresAt) < new Date()) {
        throw new Error("招待コードの有効期限が切れています");
      }

      console.log("API: Invitation code validated:", invitation);
      return invitation;

    } catch (error) {
      console.error("API: Error validating invitation code:", error);
      this.handleError(error, '招待コードの検証');
      throw error;
    }
  }

  /**
   * 招待を使用済みにマーク
   */
  async markInvitationAsUsed(invitationId, userId) {
    try {
      console.log("API: Marking invitation as used:", { invitationId, userId });

      // 現在の招待データを取得
      const invitationRef = doc(this.db, "invitations", invitationId);
      const invitationDoc = await getDoc(invitationRef);
      
      if (!invitationDoc.exists()) {
        throw new Error("招待が見つかりません");
      }

      const currentData = invitationDoc.data();
      console.log("API: Current invitation data:", currentData);

      // 最小限のフィールドのみ更新
      const updateData = {
        used: true,
        usedBy: userId,
        usedAt: serverTimestamp()
      };

      console.log("API: Updating with data:", updateData);

      await updateDoc(invitationRef, updateData);
      console.log("API: Invitation marked as used successfully");

      return { success: true };

    } catch (error) {
      console.error("API: Error marking invitation as used:", error);
      this.handleError(error, '招待の使用済み更新');
      throw error;
    }
  }

  /**
   * 招待を作成
   */
  async createInvitation(invitationData) {
    try {
      console.log("API: Creating invitation:", invitationData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw new Error("現在のユーザー情報が取得できません");
      }

      // undefinedフィールドを除外
      const cleanData = {};
      for (const [key, value] of Object.entries(invitationData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      }

      // 招待IDを生成
      const invitationRef = doc(collection(this.db, "invitations"));
      
      const invitation = {
        id: invitationRef.id,
        ...cleanData,
        tenantId: currentUser.tenantId,
        companyName: currentUser.companyName,
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日後
      };

      await setDoc(invitationRef, invitation);
      
      console.log("API: Invitation created successfully:", invitationRef.id);
      return invitationRef.id; // トークンとしてIDを返す

    } catch (error) {
      console.error("API: Error creating invitation:", error);
      this.handleError(error, '招待の作成');
      throw error;
    }
  }

  /**
   * 管理者招待を作成（開発者用）
   */
  async createAdminInvitation(invitationData) {
    try {
      console.log("API: Creating admin invitation:", invitationData);

      // 招待IDを生成
      const invitationRef = doc(collection(this.db, "invitations"));
      
      const invitation = {
        id: invitationRef.id,
        ...invitationData,
        type: 'admin',
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日後
      };

      await setDoc(invitationRef, invitation);
      
      console.log("API: Admin invitation created successfully:", invitationRef.id);
      return invitationRef.id;

    } catch (error) {
      console.error("API: Error creating admin invitation:", error);
      this.handleError(error, '管理者招待の作成');
      throw error;
    }
  }

  // ===== Dashboard Management =====

  /**
   * ダッシュボード統計データを取得
   */
  async getDashboardStats() {
    try {
      console.log("API: Loading dashboard stats...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Loading dashboard stats for tenant:", tenantId);

      // 各統計データを並行取得
      const [usersSnapshot, evaluationsSnapshot, goalsSnapshot] = await Promise.all([
        getDocs(query(collection(this.db, "users"), where("tenantId", "==", tenantId))),
        getDocs(query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId))),
        getDocs(query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", tenantId)))
      ]);

      // 統計を計算
      const stats = {
        totalUsers: usersSnapshot.size,
        activeUsers: 0,
        totalEvaluations: evaluationsSnapshot.size,
        completedEvaluations: 0,
        totalGoals: goalsSnapshot.size,
        completedGoals: 0
      };

      // ユーザー統計
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.status === 'active') {
          stats.activeUsers++;
        }
      });

      // 評価統計
      evaluationsSnapshot.forEach(doc => {
        const evalData = doc.data();
        if (evalData.status === 'completed') {
          stats.completedEvaluations++;
        }
      });

      // 目標統計
      goalsSnapshot.forEach(doc => {
        const goalData = doc.data();
        if (goalData.status === 'completed') {
          stats.completedGoals++;
        }
      });

      console.log("API: Dashboard stats loaded:", stats);
      return stats;

    } catch (error) {
      console.error("API: Error loading dashboard stats:", error);
      this.handleError(error, 'ダッシュボード統計の読み込み');
      throw error;
    }
  }

  /**
   * 最近の評価を取得
   */
  async getRecentEvaluations() {
    try {
      console.log("API: Loading recent evaluations...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      
      // 最近の評価を取得（最大10件）
      const recentQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId),
        limit(10)
      );

      const recentSnapshot = await getDocs(recentQuery);
      const recentEvaluations = [];

      recentSnapshot.forEach((doc) => {
        recentEvaluations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // 更新日時でソート
      recentEvaluations.sort((a, b) => {
        const aTime = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)) : new Date(0);
        const bTime = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)) : new Date(0);
        return bTime - aTime; // 降順
      });

      console.log("API: Recent evaluations loaded:", recentEvaluations.length);
      return recentEvaluations;

    } catch (error) {
      console.error("API: Error loading recent evaluations:", error);
      return []; // エラー時は空配列を返す
    }
  }

  /**
   * 評価チャートデータを取得
   */
  async getEvaluationChartData() {
    try {
      console.log("API: Loading evaluation chart data...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        return { labels: [], datasets: [] };
      }

      // サンプルチャートデータを生成（実際の実装では評価データから生成）
      const chartData = {
        labels: ['技術力', 'コミュニケーション', 'チームワーク', '問題解決', '安全意識'],
        datasets: [{
          label: 'あなたの評価',
          data: [4.2, 3.8, 4.5, 3.9, 4.7],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)'
        }, {
          label: '部署平均',
          data: [3.8, 3.6, 4.1, 3.7, 4.3],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)'
        }]
      };

      console.log("API: Chart data loaded");
      return chartData;

    } catch (error) {
      console.error("API: Error loading chart data:", error);
      return { labels: [], datasets: [] };
    }
  }

  // ===== Evaluation Management =====

  /**
   * 評価一覧を取得
   */
  async getEvaluations(filters = {}) {
    try {
      console.log("API: Loading evaluations...", filters);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Loading evaluations for tenant:", tenantId);

      // クエリを構築
      let evaluationsQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId)
      );

      // フィルターを適用
      if (filters.targetUserId) {
        evaluationsQuery = query(evaluationsQuery, where("targetUserId", "==", filters.targetUserId));
      }
      if (filters.periodId) {
        evaluationsQuery = query(evaluationsQuery, where("periodId", "==", filters.periodId));
      }

      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      const evaluations = [];

      evaluationsSnapshot.forEach((doc) => {
        evaluations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // クライアント側でソート
      evaluations.sort((a, b) => {
        const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return bTime - aTime; // 降順
      });

      console.log("API: Evaluations loaded:", evaluations.length);
      return evaluations;

    } catch (error) {
      console.error("API: Error loading evaluations:", error);
      this.handleError(error, '評価一覧の読み込み');
      throw error;
    }
  }

/**　
 * テナント内のユーザー一覧を取得（修正版）
 */
async getUsers(statusFilter = null) {
  try {
    console.log("API: Loading users...", statusFilter ? `with status filter: ${statusFilter}` : '');
    
    const currentUser = await this.getCurrentUserData();
    if (!currentUser || !currentUser.tenantId) {
      throw new Error("ユーザー情報またはテナント情報が見つかりません");
    }

    const tenantId = currentUser.tenantId;
    console.log("API: Loading users for tenant:", tenantId);

    // Firestoreクエリを構築
    const usersQuery = query(
      collection(this.db, "users"),
      where("tenantId", "==", tenantId)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const users = [];

    usersSnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data()
      };
      
      // ステータスフィルタリング
      if (statusFilter) {
        if (userData.status === statusFilter) {
          users.push(userData);
        }
      } else {
        users.push(userData);
      }
    });

    // クライアント側でソート
    users.sort((a, b) => {
      const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
      const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
      return bTime - aTime; // 降順
    });

    console.log("API: Users loaded successfully:", users.length);
    return users;

  } catch (error) {
    console.error("API: Error loading users:", error);
    this.handleError(error, 'ユーザー一覧の読み込み');
    throw error;
  }
}

// ✅ 便利メソッドの追加（オプション）

/**
 * アクティブユーザーのみ取得
 */
async getActiveUsers() {
  return await this.getUsers('active');
}

/**
 * 全ユーザー取得（明示的）
 */
async getAllUsers() {
  return await this.getUsers(null);
}

  /**
   * 部下ユーザーの取得（評価者用）
   */
  async getSubordinates() {
    try {
      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw new Error("現在のユーザー情報が見つかりません");
      }

      const allUsers = await this.getUsers();
      // 評価者IDが現在のユーザーのUIDと一致するユーザーを取得
      const subordinates = allUsers.filter(user => user.evaluatorId === currentUser.uid);
      
      console.log("API: Subordinates loaded:", subordinates.length);
      return subordinates;

    } catch (error) {
      console.error("API: Error loading subordinates:", error);
      throw error;
    }
  }

  /**
   * 特定のユーザー情報を取得
   */
  async getUser(userId) {
    try {
      console.log("API: Loading user:", userId);
      
      const userDoc = await getDoc(doc(this.db, "users", userId));
      
      if (!userDoc.exists()) {
        throw new Error("ユーザーが見つかりません");
      }

      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };

      console.log("API: User loaded:", userData);
      return userData;

    } catch (error) {
      console.error("API: Error loading user:", error);
      this.handleError(error, 'ユーザー情報の読み込み');
      throw error;
    }
  }

  /**
   * ユーザー情報を更新
   */
  async updateUser(userId, updateData) {
    try {
      console.log("API: Updating user:", userId, updateData);
      
      const userRef = doc(this.db, "users", userId);
      
      // undefinedフィールドを除外
      const cleanData = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      }

      await updateDoc(userRef, {
        ...cleanData,
        updatedAt: serverTimestamp()
      });

      // global_usersも更新（存在する場合）
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().email) {
        try {
          const globalUserRef = doc(this.db, "global_users", userDoc.data().email);
          await updateDoc(globalUserRef, {
            ...cleanData,
            updatedAt: serverTimestamp()
          });
        } catch (globalError) {
          console.warn("API: Failed to update global_users:", globalError);
        }
      }

      console.log("API: User updated successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error updating user:", error);
      this.handleError(error, 'ユーザー情報の更新');
      throw error;
    }
  }

  /**
   * ユーザーを削除
   */
  async deleteUser(userId) {
    try {
      console.log("API: Deleting user:", userId);
      
      // ユーザー情報を取得してメールアドレスを確認
      const userDoc = await getDoc(doc(this.db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      // usersコレクションから削除
      await deleteDoc(doc(this.db, "users", userId));

      // global_usersからも削除（存在する場合）
      if (userData && userData.email) {
        try {
          await deleteDoc(doc(this.db, "global_users", userData.email));
        } catch (globalError) {
          console.warn("API: Failed to delete from global_users:", globalError);
        }
      }

      console.log("API: User deleted successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error deleting user:", error);
      this.handleError(error, 'ユーザーの削除');
      throw error;
    }
  }

  /**
   * ユーザーのステータスを変更
   */
  async updateUserStatus(userId, status) {
    try {
      console.log("API: Updating user status:", userId, status);
      
      return await this.updateUser(userId, { status });

    } catch (error) {
      console.error("API: Error updating user status:", error);
      this.handleError(error, 'ユーザーステータスの更新');
      throw error;
    }
  }

  /**
   * ユーザーの役割を変更
   */
  async updateUserRole(userId, role) {
    try {
      console.log("API: Updating user role:", userId, role);
      
      return await this.updateUser(userId, { role });

    } catch (error) {
      console.error("API: Error updating user role:", error);
      this.handleError(error, 'ユーザー役割の更新');
      throw error;
    }
  }

  // ===== Invitation Management =====

  /**
   * 招待を取得
   */
  async getInvitation(token) {
    try {
      console.log("API: Getting invitation:", token);
      
      const invitationDoc = await getDoc(doc(this.db, "invitations", token));
      
      if (!invitationDoc.exists()) {
        return null;
      }

      const invitation = {
        id: invitationDoc.id,
        ...invitationDoc.data()
      };

      console.log("API: Invitation loaded:", invitation);
      return invitation;

    } catch (error) {
      console.error("API: Error getting invitation:", error);
      this.handleError(error, '招待情報の取得');
      throw error;
    }
  }

  /**
   * 招待コードを検証
   */
  async validateInvitationCode(code) {
    try {
      console.log("API: Validating invitation code:", code);
      
      // 招待コードのクエリ
      const invitationsQuery = query(
        collection(this.db, "invitations"),
        where("code", "==", code),
        where("used", "==", false),
        limit(1)
      );

      const invitationsSnapshot = await getDocs(invitationsQuery);
      
      if (invitationsSnapshot.empty) {
        throw new Error("無効な招待コードです");
      }

      const invitationDoc = invitationsSnapshot.docs[0];
      const invitation = {
        id: invitationDoc.id,
        ...invitationDoc.data()
      };

      // 有効期限チェック
      if (new Date(invitation.expiresAt) < new Date()) {
        throw new Error("招待コードの有効期限が切れています");
      }

      console.log("API: Invitation code validated:", invitation);
      return invitation;

    } catch (error) {
      console.error("API: Error validating invitation code:", error);
      this.handleError(error, '招待コードの検証');
      throw error;
    }
  }

  /**
   * 招待を使用済みにマーク
   */
  async markInvitationAsUsed(invitationId, userId) {
    try {
      console.log("API: Marking invitation as used:", { invitationId, userId });

      // 現在の招待データを取得
      const invitationRef = doc(this.db, "invitations", invitationId);
      const invitationDoc = await getDoc(invitationRef);
      
      if (!invitationDoc.exists()) {
        throw new Error("招待が見つかりません");
      }

      const currentData = invitationDoc.data();
      console.log("API: Current invitation data:", currentData);

      // 最小限のフィールドのみ更新
      const updateData = {
        used: true,
        usedBy: userId,
        usedAt: serverTimestamp()
      };

      console.log("API: Updating with data:", updateData);

      await updateDoc(invitationRef, updateData);
      console.log("API: Invitation marked as used successfully");

      return { success: true };

    } catch (error) {
      console.error("API: Error marking invitation as used:", error);
      this.handleError(error, '招待の使用済み更新');
      throw error;
    }
  }

  /**
   * 招待を作成
   */
  async createInvitation(invitationData) {
    try {
      console.log("API: Creating invitation:", invitationData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw new Error("現在のユーザー情報が取得できません");
      }

      // undefinedフィールドを除外
      const cleanData = {};
      for (const [key, value] of Object.entries(invitationData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      }

      // 招待IDを生成
      const invitationRef = doc(collection(this.db, "invitations"));
      
      const invitation = {
        id: invitationRef.id,
        ...cleanData,
        tenantId: currentUser.tenantId,
        companyName: currentUser.companyName,
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日後
      };

      await setDoc(invitationRef, invitation);
      
      console.log("API: Invitation created successfully:", invitationRef.id);
      return invitationRef.id; // トークンとしてIDを返す

    } catch (error) {
      console.error("API: Error creating invitation:", error);
      this.handleError(error, '招待の作成');
      throw error;
    }
  }

  /**
   * 管理者招待を作成（開発者用）
   */
  async createAdminInvitation(invitationData) {
    try {
      console.log("API: Creating admin invitation:", invitationData);

      // 招待IDを生成
      const invitationRef = doc(collection(this.db, "invitations"));
      
      const invitation = {
        id: invitationRef.id,
        ...invitationData,
        type: 'admin',
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日後
      };

      await setDoc(invitationRef, invitation);
      
      console.log("API: Admin invitation created successfully:", invitationRef.id);
      return invitationRef.id;

    } catch (error) {
      console.error("API: Error creating admin invitation:", error);
      this.handleError(error, '管理者招待の作成');
      throw error;
    }
  }

  // ===== Dashboard Management =====

  /**
   * ダッシュボード統計データを取得
   */
  async getDashboardStats() {
    try {
      console.log("API: Loading dashboard stats...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Loading dashboard stats for tenant:", tenantId);

      // 各統計データを並行取得
      const [usersSnapshot, evaluationsSnapshot, goalsSnapshot] = await Promise.all([
        getDocs(query(collection(this.db, "users"), where("tenantId", "==", tenantId))),
        getDocs(query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId))),
        getDocs(query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", tenantId)))
      ]);

      // 統計を計算
      const stats = {
        totalUsers: usersSnapshot.size,
        activeUsers: 0,
        totalEvaluations: evaluationsSnapshot.size,
        completedEvaluations: 0,
        totalGoals: goalsSnapshot.size,
        completedGoals: 0
      };

      // ユーザー統計
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.status === 'active') {
          stats.activeUsers++;
        }
      });

      // 評価統計
      evaluationsSnapshot.forEach(doc => {
        const evalData = doc.data();
        if (evalData.status === 'completed') {
          stats.completedEvaluations++;
        }
      });

      // 目標統計
      goalsSnapshot.forEach(doc => {
        const goalData = doc.data();
        if (goalData.status === 'completed') {
          stats.completedGoals++;
        }
      });

      console.log("API: Dashboard stats loaded:", stats);
      return stats;

    } catch (error) {
      console.error("API: Error loading dashboard stats:", error);
      this.handleError(error, 'ダッシュボード統計の読み込み');
      throw error;
    }
  }

  /**
   * 最近の評価を取得
   */
  async getRecentEvaluations() {
    try {
      console.log("API: Loading recent evaluations...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      
      // 最近の評価を取得（最大10件）
      const recentQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId),
        limit(10)
      );

      const recentSnapshot = await getDocs(recentQuery);
      const recentEvaluations = [];

      recentSnapshot.forEach((doc) => {
        recentEvaluations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // 更新日時でソート
      recentEvaluations.sort((a, b) => {
        const aTime = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)) : new Date(0);
        const bTime = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)) : new Date(0);
        return bTime - aTime; // 降順
      });

      console.log("API: Recent evaluations loaded:", recentEvaluations.length);
      return recentEvaluations;

    } catch (error) {
      console.error("API: Error loading recent evaluations:", error);
      return []; // エラー時は空配列を返す
    }
  }

  /**
   * 評価チャートデータを取得
   */
  async getEvaluationChartData() {
    try {
      console.log("API: Loading evaluation chart data...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        return { labels: [], datasets: [] };
      }

      // サンプルチャートデータを生成（実際の実装では評価データから生成）
      const chartData = {
        labels: ['技術力', 'コミュニケーション', 'チームワーク', '問題解決', '安全意識'],
        datasets: [{
          label: 'あなたの評価',
          data: [4.2, 3.8, 4.5, 3.9, 4.7],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)'
        }, {
          label: '部署平均',
          data: [3.8, 3.6, 4.1, 3.7, 4.3],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)'
        }]
      };

      console.log("API: Chart data loaded");
      return chartData;

    } catch (error) {
      console.error("API: Error loading chart data:", error);
      return { labels: [], datasets: [] };
    }
  }

  // ===== Evaluation Management =====

  /**
   * 評価一覧を取得
   */
  async getEvaluations(filters = {}) {
    try {
      console.log("API: Loading evaluations...", filters);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Loading evaluations for tenant:", tenantId);

      // クエリを構築
      let evaluationsQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId)
      );

      // フィルターを適用
      if (filters.targetUserId) {
        evaluationsQuery = query(evaluationsQuery, where("targetUserId", "==", filters.targetUserId));
      }
      if (filters.periodId) {
        evaluationsQuery = query(evaluationsQuery, where("periodId", "==", filters.periodId));
      }

      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      const evaluations = [];

      evaluationsSnapshot.forEach((doc) => {
        evaluations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // クライアント側でソート
      evaluations.sort((a, b) => {
        const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return bTime - aTime; // 降順
      });

      console.log("API: Evaluations loaded:", evaluations.length);
      return evaluations;

    } catch (error) {
      console.error("API: Error loading evaluations:", error);
      this.handleError(error, '評価一覧の読み込み');
      throw error;
    }
  }

  /**
   * 特定の評価を取得
   */
  async getEvaluation(evaluationId) {
    try {
      console.log("API: Loading evaluation:", evaluationId);
      
      const evaluationDoc = await getDoc(doc(this.db, "evaluations", evaluationId));
      
      if (!evaluationDoc.exists()) {
        throw new Error("評価が見つかりません");
      }

      const evaluation = {
        id: evaluationDoc.id,
        ...evaluationDoc.data()
      };

      console.log("API: Evaluation loaded:", evaluation);
      return evaluation;

    } catch (error) {
      console.error("API: Error loading evaluation:", error);
      this.handleError(error, '評価情報の読み込み');
      throw error;
    }
  }

  /**
   * IDで評価を取得
   */
  async getEvaluationById(evaluationId) {
    return await this.getEvaluation(evaluationId);
  }

  /**
   * 評価を作成または更新
   */
  async saveEvaluation(evaluationData) {
    try {
      console.log("API: Saving evaluation:", evaluationData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      // undefinedフィールドを除外
      const cleanData = {};
      for (const [key, value] of Object.entries(evaluationData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      }

      const evaluation = {
        ...cleanData,
        tenantId: currentUser.tenantId,
        updatedAt: serverTimestamp()
      };

      let docRef;
      if (evaluationData.id) {
        // 更新
        docRef = doc(this.db, "evaluations", evaluationData.id);
        await updateDoc(docRef, evaluation);
      } else {
        // 新規作成
        evaluation.createdAt = serverTimestamp();
        docRef = doc(collection(this.db, "evaluations"));
        evaluation.id = docRef.id;
        await setDoc(docRef, evaluation);
      }
      
      console.log("API: Evaluation saved successfully:", docRef.id);
      return { success: true, id: docRef.id };

    } catch (error) {
      console.error("API: Error saving evaluation:", error);
      this.handleError(error, '評価の保存');
      throw error;
    }
  }

  /**
   * 評価を作成
   */
  async createEvaluation(evaluationData) {
    return await this.saveEvaluation(evaluationData);
  }

  /**
   * 評価を更新
   */
  async updateEvaluation(evaluationId, updateData) {
    try {
      console.log("API: Updating evaluation:", evaluationId, updateData);

      // undefinedフィールドを除外
      const cleanData = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      }

      await updateDoc(doc(this.db, "evaluations", evaluationId), {
        ...cleanData,
        updatedAt: serverTimestamp()
      });

      console.log("API: Evaluation updated successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error updating evaluation:", error);
      this.handleError(error, '評価の更新');
      throw error;
    }
  }

  /**
   * 評価ステータスを更新
   */
  async updateEvaluationStatus(evaluationId, status, metadata = {}) {
    try {
      console.log("API: Updating evaluation status:", evaluationId, status);

      const updateData = {
        status: status,
        updatedAt: serverTimestamp(),
        ...metadata
      };

      await updateDoc(doc(this.db, "evaluations", evaluationId), updateData);

      console.log("API: Evaluation status updated successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error updating evaluation status:", error);
      this.handleError(error, '評価ステータスの更新');
      throw error;
    }
  }

  /**
   * 評価を削除
   */
  async deleteEvaluation(evaluationId) {
    try {
      console.log("API: Deleting evaluation:", evaluationId);
      
      await deleteDoc(doc(this.db, "evaluations", evaluationId));

      console.log("API: Evaluation deleted successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error deleting evaluation:", error);
      this.handleError(error, '評価の削除');
      throw error;
    }
  }

  /**
   * 評価履歴を取得
   */
  async getEvaluationHistory(evaluationId) {
    try {
      console.log("API: Loading evaluation history:", evaluationId);
      
      // 簡易的な履歴データを返す（実際の実装では履歴テーブルから取得）
      const evaluation = await this.getEvaluation(evaluationId);
      const history = [
        {
          status: evaluation.status,
          actor: evaluation.evaluatorName || 'システム',
          timestamp: evaluation.updatedAt || evaluation.createdAt
        }
      ];

      console.log("API: Evaluation history loaded:", history);
      return history;

    } catch (error) {
      console.error("API: Error loading evaluation history:", error);
      return [];
    }
  }

  /**
   * 評価構造を取得
   */
  async getEvaluationStructure(jobTypeId) {
    try {
      console.log("API: Loading evaluation structure for job type:", jobTypeId);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      
      // 評価構造を取得
      const structureQuery = query(
        collection(this.db, "evaluationStructures"),
        where("tenantId", "==", tenantId),
        where("jobTypeId", "==", jobTypeId)
      );

      const structureSnapshot = await getDocs(structureQuery);
      
      if (structureSnapshot.empty) {
        // デフォルト構造を返す
        return {
          categories: [
            {
              id: 'default_cat_1',
              name: '技術スキル',
              items: [
                { id: 'item_1', name: '専門知識' },
                { id: 'item_2', name: '作業効率' }
              ]
            },
            {
              id: 'default_cat_2',
              name: 'コミュニケーション',
              items: [
                { id: 'item_3', name: '報告・連絡' },
                { id: 'item_4', name: 'チームワーク' }
              ]
            }
          ]
        };
      }

      const structure = structureSnapshot.docs[0].data();
      console.log("API: Evaluation structure loaded:", structure);
      return structure;

    } catch (error) {
      console.error("API: Error loading evaluation structure:", error);
      return { categories: [] };
    }
  }

  // ===== Goals Management =====

  /**
   * ステータス別目標取得
   */
  async getGoalsByStatus(status) {
    try {
      console.log("API: Loading goals by status:", status);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      
      const goalsQuery = query(
        collection(this.db, "qualitativeGoals"),
        where("tenantId", "==", tenantId),
        where("status", "==", status)
      );

      const goalsSnapshot = await getDocs(goalsQuery);
      const goals = [];

      goalsSnapshot.forEach((doc) => {
        goals.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log("API: Goals loaded by status:", goals.length);
      return goals;

    } catch (error) {
      console.error("API: Error loading goals by status:", error);
      this.handleError(error, '目標の読み込み');
      throw error;
    }
  }

  /**
   * ユーザーの目標を取得
   */
  async getGoals(userId, periodId) {
    try {
      console.log("API: Loading goals for user:", userId, "period:", periodId);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      
      const goalsQuery = query(
        collection(this.db, "qualitativeGoals"),
        where("tenantId", "==", tenantId),
        where("userId", "==", userId),
        where("periodId", "==", periodId)
      );

      const goalsSnapshot = await getDocs(goalsQuery);
      
      if (goalsSnapshot.empty) {
        return null;
      }

      const goalDoc = goalsSnapshot.docs[0];
      const goals = {
        id: goalDoc.id,
        ...goalDoc.data()
      };

      console.log("API: Goals loaded:", goals);
      return goals;

    } catch (error) {
      console.error("API: Error loading goals:", error);
      return null;
    }
  }

  /**
   * 目標を保存
   */
  async saveGoals(goalsData) {
    try {
      console.log("API: Saving goals:", goalsData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const cleanData = {
        ...goalsData,
        tenantId: currentUser.tenantId,
        updatedAt: serverTimestamp()
      };

      let docRef;
      if (goalsData.id) {
        // 更新
        docRef = doc(this.db, "qualitativeGoals", goalsData.id);
        await updateDoc(docRef, cleanData);
      } else {
        // 新規作成
        cleanData.createdAt = serverTimestamp();
        docRef = doc(collection(this.db, "qualitativeGoals"));
        cleanData.id = docRef.id;
        await setDoc(docRef, cleanData);
      }

      console.log("API: Goals saved successfully:", docRef.id);
      return { success: true, id: docRef.id };

    } catch (error) {
      console.error("API: Error saving goals:", error);
      this.handleError(error, '目標の保存');
      throw error;
    }
  }

  /**
   * 目標ステータスを更新
   */
  async updateGoalStatus(goalId, status, metadata = {}) {
    try {
      console.log("API: Updating goal status:", goalId, status);

      const updateData = {
        status: status,
        updatedAt: serverTimestamp(),
        ...metadata
      };

      await updateDoc(doc(this.db, "qualitativeGoals", goalId), updateData);

      console.log("API: Goal status updated successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error updating goal status:", error);
      this.handleError(error, '目標ステータスの更新');
      throw error;
    }
  }

  // ===== Settings Management =====

  /**
   * テナントの設定データを取得
   */
  async getSettings() {
    try {
      console.log("API: Loading settings...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Loading settings for tenant:", tenantId);

      console.log("API: Fetching settings data...");

      // 各設定データを並行取得
      const [jobTypesSnapshot, periodsSnapshot, structuresSnapshot] = await Promise.all([
        getDocs(query(collection(this.db, "targetJobTypes"), where("tenantId", "==", tenantId))),
        getDocs(query(collection(this.db, "evaluationPeriods"), where("tenantId", "==", tenantId))),
        getDocs(query(collection(this.db, "evaluationStructures"), where("tenantId", "==", tenantId)))
      ]);

      // データを整形
      const jobTypes = [];
      const periods = [];
      const structures = {};

      jobTypesSnapshot.forEach(doc => {
        jobTypes.push({ id: doc.id, ...doc.data() });
      });

      periodsSnapshot.forEach(doc => {
        periods.push({ id: doc.id, ...doc.data() });
      });

      structuresSnapshot.forEach(doc => {
        const data = doc.data();
        structures[data.jobTypeId || doc.id] = { id: doc.id, ...data };
      });

      console.log("API: Settings loaded successfully:");
      console.log("- Job types:", jobTypes.length);
      console.log("- Periods:", periods.length);
      console.log("- Structures:", Object.keys(structures).length);

      return {
        jobTypes,
        periods,
        structures,
        tenantId
      };

    } catch (error) {
      console.error("API: Error loading settings:", error);
      this.handleError(error, '設定データの読み込み');
      throw error;
    }
  }

  /**
   * 設定を保存
   */
  async saveSettings(settings) {
    try {
      console.log("API: Saving settings...", settings);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      const batch = writeBatch(this.db);

      // 職種を保存
      for (const jobType of settings.jobTypes) {
        const jobTypeRef = doc(this.db, "targetJobTypes", jobType.id);
        batch.set(jobTypeRef, {
          ...jobType,
          tenantId: tenantId,
          updatedAt: serverTimestamp()
        });
      }

      // 評価期間を保存
      for (const period of settings.periods) {
        const periodRef = doc(this.db, "evaluationPeriods", period.id);
        batch.set(periodRef, {
          ...period,
          tenantId: tenantId,
          updatedAt: serverTimestamp()
        });
      }

      // 評価構造を保存
      for (const [jobTypeId, structure] of Object.entries(settings.structures)) {
        const structureRef = doc(this.db, "evaluationStructures", structure.id);
        batch.set(structureRef, {
          ...structure,
          jobTypeId: jobTypeId,
          tenantId: tenantId,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();

      console.log("API: Settings saved successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error saving settings:", error);
      this.handleError(error, '設定の保存');
      throw error;
    }
  }

  /**
   * 職種を作成/更新
   */
  async saveJobType(jobTypeData) {
    try {
      console.log("API: Saving job type:", jobTypeData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const data = {
        ...jobTypeData,
        tenantId: currentUser.tenantId,
        updatedAt: serverTimestamp()
      };

      if (jobTypeData.id) {
        // 更新
        await updateDoc(doc(this.db, "targetJobTypes", jobTypeData.id), data);
      } else {
        // 新規作成
        data.createdAt = serverTimestamp();
        const docRef = doc(collection(this.db, "targetJobTypes"));
        await setDoc(docRef, { ...data, id: docRef.id });
      }

      console.log("API: Job type saved successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error saving job type:", error);
      this.handleError(error, '職種の保存');
      throw error;
    }
  }

  /**
   * 評価期間を作成/更新
   */
  async saveEvaluationPeriod(periodData) {
    try {
      console.log("API: Saving evaluation period:", periodData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const data = {
        ...periodData,
        tenantId: currentUser.tenantId,
        updatedAt: serverTimestamp()
      };

      if (periodData.id) {
        // 更新
        await updateDoc(doc(this.db, "evaluationPeriods", periodData.id), data);
      } else {
        // 新規作成
        data.createdAt = serverTimestamp();
        const docRef = doc(collection(this.db, "evaluationPeriods"));
        await setDoc(docRef, { ...data, id: docRef.id });
      }

      console.log("API: Evaluation period saved successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error saving evaluation period:", error);
      this.handleError(error, '評価期間の保存');
      throw error;
    }
  }

  /**
   * 評価構造を作成/更新
   */
  async saveEvaluationStructure(structureData) {
    try {
      console.log("API: Saving evaluation structure:", structureData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      const data = {
        ...structureData,
        tenantId: currentUser.tenantId,
        updatedAt: serverTimestamp()
      };

      if (structureData.id) {
        // 更新
        await updateDoc(doc(this.db, "evaluationStructures", structureData.id), data);
      } else {
        // 新規作成
        data.createdAt = serverTimestamp();
        const docRef = doc(collection(this.db, "evaluationStructures"));
        await setDoc(docRef, { ...data, id: docRef.id });
      }

      console.log("API: Evaluation structure saved successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error saving evaluation structure:", error);
      this.handleError(error, '評価構造の保存');
      throw error;
    }
  }

  // ===== Utility Methods =====

  /**
   * テナント情報を取得
   */
  async getTenant(tenantId) {
    try {
      const tenantDoc = await getDoc(doc(this.db, "tenants", tenantId));
      
      if (!tenantDoc.exists()) {
        return null;
      }

      return {
        id: tenantDoc.id,
        ...tenantDoc.data()
      };

    } catch (error) {
      console.error("API: Error getting tenant:", error);
      return null;
    }
  }

  /**
   * テナントステータスを更新
   */
  async updateTenantStatus(tenantId, status) {
    try {
      console.log("API: Updating tenant status:", tenantId, status);

      await updateDoc(doc(this.db, "tenants", tenantId), {
        status: status,
        updatedAt: serverTimestamp()
      });

      console.log("API: Tenant status updated successfully");
      return { success: true };

    } catch (error) {
      console.error("API: Error updating tenant status:", error);
      this.handleError(error, 'テナントステータスの更新');
      throw error;
    }
  }

  /**
   * データベース接続テスト
   */
  async testConnection() {
    try {
      console.log("API: Testing database connection...");
      
      // テストコレクションに読み書きテスト
      const testRef = doc(this.db, "_test", "connection_test");
      await setDoc(testRef, {
        timestamp: serverTimestamp(),
        test: true
      });

      const testDoc = await getDoc(testRef);
      
      if (testDoc.exists()) {
        console.log("API: Database connection test successful");
        await deleteDoc(testRef); // クリーンアップ
        return true;
      } else {
        console.error("API: Database connection test failed");
        return false;
      }

    } catch (error) {
      console.error("API: Database connection test error:", error);
      return false;
    }
  }
}

/**

評価職種の取得
*/
async getJobTypes() {
try {
const tenantId = await this.getCurrentTenantId();
const snapshot = await getDocs(
query(
collection(db, 'targetJobTypes'),
where('tenantId', '==', tenantId),
orderBy('name')
)
);
return snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));
} catch (error) {
console.error('Error fetching job types:', error);
throw new Error('職種の取得に失敗しました');
}
}

/**

評価職種の作成
*/
async createJobType(jobTypeData) {
try {
const tenantId = await this.getCurrentTenantId();
const currentUser = auth.currentUser;
const docRef = await addDoc(collection(db, 'targetJobTypes'), {
...jobTypeData,
tenantId,
createdAt: serverTimestamp(),
createdBy: currentUser.uid,
updatedAt: serverTimestamp()
});
// 評価構造の初期化（空のカテゴリで作成）
await this.initializeEvaluationStructure(docRef.id);
return docRef.id;
} catch (error) {
console.error('Error creating job type:', error);
throw new Error('職種の作成に失敗しました');
}
}

/**

評価職種の更新
*/
async updateJobType(jobTypeId, updates) {
try {
const tenantId = await this.getCurrentTenantId();
// 権限チェック
const jobTypeDoc = await getDoc(doc(db, 'targetJobTypes', jobTypeId));
if (!jobTypeDoc.exists() || jobTypeDoc.data().tenantId !== tenantId) {
throw new Error('権限がありません');
}
await updateDoc(doc(db, 'targetJobTypes', jobTypeId), {
...updates,
updatedAt: serverTimestamp()
});
return true;
} catch (error) {
console.error('Error updating job type:', error);
throw new Error('職種の更新に失敗しました');
}
}

/**

評価職種の削除
*/
async deleteJobType(jobTypeId) {
try {
const tenantId = await this.getCurrentTenantId();
// 権限チェック
const jobTypeDoc = await getDoc(doc(db, 'targetJobTypes', jobTypeId));
if (!jobTypeDoc.exists() || jobTypeDoc.data().tenantId !== tenantId) {
throw new Error('権限がありません');
}
// この職種を使用しているユーザーがいないかチェック
const usersSnapshot = await getDocs(
query(
collection(db, 'users'),
where('tenantId', '==', tenantId),
where('jobTypeIds', 'array-contains', jobTypeId)
)
);
if (!usersSnapshot.empty) {
throw new Error('この職種は使用中のため削除できません');
}
// 関連する評価構造も削除
const structureSnapshot = await getDocs(
query(
collection(db, 'evaluationStructures'),
where('targetJobTypeId', '==', jobTypeId)
)
);
const batch = writeBatch(db);
structureSnapshot.docs.forEach(doc => {
batch.delete(doc.ref);
});
batch.delete(doc(db, 'targetJobTypes', jobTypeId));
await batch.commit();
return true;
} catch (error) {
console.error('Error deleting job type:', error);
throw new Error(error.message || '職種の削除に失敗しました');
}
}

/**

評価構造の初期化
*/
async initializeEvaluationStructure(jobTypeId) {
try {
const tenantId = await this.getCurrentTenantId();
await addDoc(collection(db, 'evaluationStructures'), {
targetJobTypeId: jobTypeId,
tenantId,
categories: [],
createdAt: serverTimestamp(),
updatedAt: serverTimestamp()
});
return true;
} catch (error) {
console.error('Error initializing evaluation structure:', error);
throw new Error('評価構造の初期化に失敗しました');
}
}

/**

ユーザーに職種を設定（複数選択対応）
*/
async updateUserJobTypes(userId, jobTypeIds) {
try {
const tenantId = await this.getCurrentTenantId();
// ユーザーの権限チェック
const userDoc = await getDoc(doc(db, 'users', userId));
if (!userDoc.exists() || userDoc.data().tenantId !== tenantId) {
throw new Error('権限がありません');
}
// 職種IDの検証
for (const jobTypeId of jobTypeIds) {
const jobTypeDoc = await getDoc(doc(db, 'targetJobTypes', jobTypeId));
if (!jobTypeDoc.exists() || jobTypeDoc.data().tenantId !== tenantId) {
throw new Error(無効な職種ID: ${jobTypeId});
}
}
await updateDoc(doc(db, 'users', userId), {
jobTypeIds: jobTypeIds,
updatedAt: serverTimestamp()
});
return true;
} catch (error) {
console.error('Error updating user job types:', error);
throw new Error('ユーザーの職種設定に失敗しました');
}
}

/**

ユーザーの職種情報を取得
*/
async getUserJobTypes(userId) {
try {
const userDoc = await getDoc(doc(db, 'users', userId));
if (!userDoc.exists()) {
throw new Error('ユーザーが見つかりません');
}
const userData = userDoc.data();
const jobTypeIds = userData.jobTypeIds || [];
if (jobTypeIds.length === 0) {
return [];
}
// 職種の詳細情報を取得
const jobTypes = [];
for (const jobTypeId of jobTypeIds) {
const jobTypeDoc = await getDoc(doc(db, 'targetJobTypes', jobTypeId));
if (jobTypeDoc.exists()) {
jobTypes.push({
id: jobTypeDoc.id,
...jobTypeDoc.data()
});
}
}
return jobTypes;
} catch (error) {
console.error('Error fetching user job types:', error);
throw new Error('ユーザーの職種情報の取得に失敗しました');
}
}
</artifact>
