/**
 * API Module - Firestore operations
 * API モジュール - Firestore操作
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
  serverTimestamp 
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
      if (!this.auth.currentUser) {
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

  // ===== User Management =====

  /**
   * テナント内のユーザー一覧を取得
   */
  async getUsers() {
    try {
      console.log("API: Loading users...");
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Loading users for tenant:", tenantId);

      // テナント内のユーザーを取得
      const usersQuery = query(
        collection(this.db, "users"),
        where("tenantId", "==", tenantId),
        orderBy("createdAt", "desc")
      );

      const usersSnapshot = await getDocs(usersQuery);
      const users = [];

      usersSnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log("API: Users loaded:", users.length);
      return users;

    } catch (error) {
      console.error("API: Error loading users:", error);
      this.handleError(error, 'ユーザー一覧の読み込み');
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
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日後
      };

      await setDoc(invitationRef, invitation);
      
      console.log("API: Invitation created successfully:", invitationRef.id);
      return { success: true, id: invitationRef.id, ...invitation };

    } catch (error) {
      console.error("API: Error creating invitation:", error);
      this.handleError(error, '招待の作成');
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
      const structures = [];

      jobTypesSnapshot.forEach(doc => {
        jobTypes.push({ id: doc.id, ...doc.data() });
      });

      periodsSnapshot.forEach(doc => {
        periods.push({ id: doc.id, ...doc.data() });
      });

      structuresSnapshot.forEach(doc => {
        structures.push({ id: doc.id, ...doc.data() });
      });

      console.log("API: Settings loaded successfully:");
      console.log("- Job types:", jobTypes.length);
      console.log("- Periods:", periods.length);
      console.log("- Structures:", structures.length);

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
