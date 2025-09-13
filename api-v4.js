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

import { MultilingualAPI } from './api/multilingual-api.js';
import { TranslationService } from './services/translation-service.js';
import { DynamicContentTranslator } from './services/dynamic-content-translator.js';

export class API {
  constructor(app) {
    this.app = app;
    this.auth = app.auth;

    // 緊急モード時はFirestoreを初期化しない
    if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || app.auth.useTemporaryAuth) {
      console.log("API: Emergency mode detected - skipping Firestore initialization");
      this.db = null;
    } else {
      this.db = getFirestore(app.auth.firebaseApp);
    }

    this.multilingual = new MultilingualAPI(app);
    this.translationService = new TranslationService(app);
    this.contentTranslator = new DynamicContentTranslator(app);
  }

  // ===== Enhanced Validation Methods =====

  /**
   * メールアドレスの検証
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'メールアドレスを入力してください' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: '有効なメールアドレスを入力してください' };
    }
    
    return { isValid: true };
  }

  /**
   * パスワードの検証
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, message: 'パスワードを入力してください' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: 'パスワードは6文字以上で入力してください' };
    }
    
    // 複雑さチェック
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'パスワードは英字と数字を両方含む必要があります' };
    }
    
    return { isValid: true };
  }

  /**
   * 名前の検証
   */
  validateName(name) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: '名前を入力してください' };
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return { isValid: false, message: '名前は2文字以上で入力してください' };
    }
    
    if (trimmedName.length > 50) {
      return { isValid: false, message: '名前は50文字以下で入力してください' };
    }
    
    return { isValid: true };
  }

  /**
   * 企業名の検証
   */
  validateCompanyName(companyName) {
    if (!companyName || typeof companyName !== 'string') {
      return { isValid: false, message: '企業名を入力してください' };
    }
    
    const trimmedName = companyName.trim();
    if (trimmedName.length < 2) {
      return { isValid: false, message: '企業名は2文字以上で入力してください' };
    }
    
    if (trimmedName.length > 100) {
      return { isValid: false, message: '企業名は100文字以下で入力してください' };
    }
    
    return { isValid: true };
  }

  /**
   * 評価期間データの検証
   */
  validateEvaluationPeriod(periodData) {
    const errors = [];
    
    // 期間名検証
    if (!periodData.periodName || typeof periodData.periodName !== 'string') {
      errors.push('期間名を入力してください');
    } else if (periodData.periodName.trim().length < 3) {
      errors.push('期間名は3文字以上で入力してください');
    } else if (periodData.periodName.trim().length > 100) {
      errors.push('期間名は100文字以下で入力してください');
    }
    
    // 日付検証
    if (!periodData.startDate) {
      errors.push('開始日を入力してください');
    }
    
    if (!periodData.endDate) {
      errors.push('終了日を入力してください');
    }
    
    if (periodData.startDate && periodData.endDate) {
      const startDate = new Date(periodData.startDate);
      const endDate = new Date(periodData.endDate);
      
      if (isNaN(startDate.getTime())) {
        errors.push('有効な開始日を入力してください');
      }
      
      if (isNaN(endDate.getTime())) {
        errors.push('有効な終了日を入力してください');
      }
      
      if (startDate >= endDate) {
        errors.push('終了日は開始日より後の日付を入力してください');
      }
    }
    
    // タイプ検証
    const validTypes = ['quarterly', 'semi-annual', 'annual'];
    if (!periodData.type || !validTypes.includes(periodData.type)) {
      errors.push('有効な期間タイプを選択してください');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 組織データの検証
   */
  validateOrganizationData(orgData) {
    const errors = [];
    
    // 部門データ検証
    if (orgData.departments && Array.isArray(orgData.departments)) {
      orgData.departments.forEach((dept, index) => {
        if (typeof dept === 'string') {
          if (dept.trim().length < 2) {
            errors.push(`部門${index + 1}の名前は2文字以上で入力してください`);
          }
        } else if (typeof dept === 'object' && dept.name) {
          if (dept.name.trim().length < 2) {
            errors.push(`部門「${dept.name}」の名前は2文字以上で入力してください`);
          }
        }
      });
      
      // 重複チェック
      const deptNames = orgData.departments.map(d => 
        typeof d === 'string' ? d.trim() : d.name?.trim()
      ).filter(Boolean);
      const uniqueDeptNames = [...new Set(deptNames)];
      if (deptNames.length !== uniqueDeptNames.length) {
        errors.push('部門名に重複があります');
      }
    }
    
    // チームデータ検証
    if (orgData.teams && Array.isArray(orgData.teams)) {
      orgData.teams.forEach((team, index) => {
        if (!team.name || team.name.trim().length < 2) {
          errors.push(`チーム${index + 1}の名前は2文字以上で入力してください`);
        }
        
        if (!team.department) {
          errors.push(`チーム「${team.name}」の所属部門を選択してください`);
        }
      });
      
      // 重複チェック
      const teamNames = orgData.teams.map(t => t.name?.trim()).filter(Boolean);
      const uniqueTeamNames = [...new Set(teamNames)];
      if (teamNames.length !== uniqueTeamNames.length) {
        errors.push('チーム名に重複があります');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 多言語データの検証
   */
  validateI18nData(data, requiredLanguages = ['ja']) {
    const errors = [];
    
    // 必須言語のチェック
    for (const lang of requiredLanguages) {
      if (!data[`itemName_${lang}`] && !data[`categoryName_${lang}`] && !data[`jobTypeName_${lang}`]) {
        errors.push(`${lang.toUpperCase()}の名前は必須です`);
      }
    }
    
    // 並び順の検証
    if (data.sortOrder !== undefined && data.sortOrder !== null) {
      const sortOrder = parseInt(data.sortOrder);
      if (isNaN(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
        errors.push('並び順は0から9999の間で入力してください');
      }
    }
    
    // 表示順の検証
    if (data.displayOrder !== undefined && data.displayOrder !== null) {
      const displayOrder = parseInt(data.displayOrder);
      if (isNaN(displayOrder) || displayOrder < 0 || displayOrder > 9999) {
        errors.push('表示順は0から9999の間で入力してください');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * ベンチマークデータの検証
   */
  validateBenchmarkData(benchmarkData) {
    const errors = [];
    
    // 名前検証
    if (!benchmarkData.name || typeof benchmarkData.name !== 'string') {
      errors.push('ベンチマーク名を入力してください');
    } else if (benchmarkData.name.trim().length < 2) {
      errors.push('ベンチマーク名は2文字以上で入力してください');
    } else if (benchmarkData.name.trim().length > 100) {
      errors.push('ベンチマーク名は100文字以下で入力してください');
    }
    
    // タイプ検証
    const validTypes = ['general', 'technical', 'communication', 'leadership', 'problem_solving'];
    if (!benchmarkData.type || !validTypes.includes(benchmarkData.type)) {
      errors.push('有効なベンチマークタイプを選択してください');
    }
    
    // 値検証
    if (benchmarkData.value === undefined || benchmarkData.value === null) {
      errors.push('基準値を入力してください');
    } else {
      const value = parseFloat(benchmarkData.value);
      if (isNaN(value) || value < 0 || value > 5) {
        errors.push('基準値は0から5の間で入力してください');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
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
      
      // 一時認証システム使用時はモックデータを返す
      if (this.app.auth.currentUser && this.app.auth.currentUser.isTemp) {
        return {
          id: uid,
          uid: uid,
          email: this.app.auth.currentUser.email,
          displayName: this.app.auth.currentUser.displayName,
          role: this.app.auth.currentUser.role,
          tenantId: this.app.auth.currentUser.tenantId,
          status: this.app.auth.currentUser.status,
          isTemp: true
        };
      }

      // Firestoreが初期化されていない場合はエラーを回避
      if (!this.db) {
        console.warn("API: Firestore not initialized for getUserProfile");
        return null;
      }
      
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
        return this.app.currentUser;
      }

      // フォールバック: Firebase Authから直接取得
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
  async getUsers(statusFilter = null, options = {}) {
    try {
      console.log("API: Loading users...", statusFilter ? `with status filter: ${statusFilter}` : '');
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock evaluations for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockEvaluations(filters);
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

      // Phase 2: 組織データの追加読み込み（オプション）
      if (options.includeOrgData) {
        try {
          const orgStructure = await this.getOrganizationStructure();
          users.forEach(user => {
            user._orgData = {
              departmentName: user.department || '未設定',
              jobTypeName: user.jobType || '未設定',
              levelName: user.level ? `レベル${user.level}` : '未設定'
            };
          });
        } catch (orgError) {
          console.warn("API: Failed to load organization data:", orgError);
        }
      }

      users.sort((a, b) => {
        const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return bTime - aTime;
      });

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
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock evaluations for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockEvaluations(filters);
      }

      const tenantId = currentUser.tenantId;

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
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp) {
        console.log("API: Using mock recent evaluations for temporary authentication");
        if (window.TempAuth) {
          const tempAuth = new window.TempAuth();
          return tempAuth.getMockRecentEvaluations();
        }
        // フォールバック用モックデータ
        return [
          {
            id: 'mock_eval_1',
            targetName: '田中太郎',
            evaluatorName: '佐藤管理者',
            score: 4.5,
            createdAt: Date.now() - 86400000,
            status: 'completed'
          },
          {
            id: 'mock_eval_2', 
            targetName: '鈴木花子',
            evaluatorName: '田中評価者',
            score: 4.1,
            createdAt: Date.now() - 172800000,
            status: 'completed'
          }
        ];
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

      // ユーザー情報と期間情報を並行取得するためのPromise配列
      const enrichmentPromises = [];
      
      recentSnapshot.forEach((doc) => {
        const data = doc.data();
        const evaluation = {
          id: doc.id,
          ...data
        };
        recentEvaluations.push(evaluation);
        
        // ユーザー名と期間名を取得するPromiseを追加
        enrichmentPromises.push(this.enrichEvaluationData(evaluation, tenantId));
      });

      // 全ての追加情報を並行取得
      const enrichedResults = await Promise.allSettled(enrichmentPromises);
      
      // 成功したものだけを取得
      const finalEvaluations = enrichedResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      // 更新日時でソート
      finalEvaluations.sort((a, b) => {
        const aTime = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)) : new Date(0);
        const bTime = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)) : new Date(0);
        return bTime - aTime; // 降順
      });

      return finalEvaluations;

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
  async getEvaluations(filters = {}, options = {}) {
    try {
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock evaluations for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockEvaluations(filters);
      }

      const tenantId = currentUser.tenantId;

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

    // 一時認証システム使用時はモックデータを返す
    if (currentUser && currentUser.isTemp) {
      const tempAuthModule = await import('./temp-auth-v2.js');
      return new tempAuthModule.TempAuth().getMockUsers(statusFilter);
    }

    // FORCE_TEMP_AUTHグローバルフラグをチェック
    if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
      const tempAuthModule = await import('./temp-auth-v2.js');
      return new tempAuthModule.TempAuth().getMockUsers(statusFilter);
    }

    const tenantId = currentUser.tenantId;
    console.log("API: Loading users for tenant:", tenantId);

    // Firestoreが初期化されていない場合はエラーを回避
    if (!this.db) {
      console.warn("API: Firestore not initialized, returning empty users array");
      return [];
    }

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
   * 評価者担当のユーザー一覧を取得
   */
  async getUsersByEvaluator(evaluatorId) {
    try {
      console.log("API: Loading users by evaluator:", evaluatorId);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock evaluations for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockEvaluations(filters);
      }

      const tenantId = currentUser.tenantId;

      const usersQuery = query(
        collection(this.db, "users"),
        where("tenantId", "==", tenantId),
        where("evaluatorId", "==", evaluatorId)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const users = [];

      usersSnapshot.forEach((doc) => {
        const userData = {
          id: doc.id,
          ...doc.data()
        };
        users.push(userData);
      });

      users.sort((a, b) => {
        const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return bTime - aTime;
      });

      console.log("API: Users by evaluator loaded:", users.length);
      return users;

    } catch (error) {
      console.error("API: Error loading users by evaluator:", error);
      this.handleError(error, '評価者担当ユーザーの読み込み');
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
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock evaluations for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockEvaluations(filters);
      }

      const tenantId = currentUser.tenantId;

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
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp) {
        console.log("API: Using mock recent evaluations for temporary authentication");
        if (window.TempAuth) {
          const tempAuth = new window.TempAuth();
          return tempAuth.getMockRecentEvaluations();
        }
        // フォールバック用モックデータ
        return [
          {
            id: 'mock_eval_1',
            targetName: '田中太郎',
            evaluatorName: '佐藤管理者',
            score: 4.5,
            createdAt: Date.now() - 86400000,
            status: 'completed'
          },
          {
            id: 'mock_eval_2', 
            targetName: '鈴木花子',
            evaluatorName: '田中評価者',
            score: 4.1,
            createdAt: Date.now() - 172800000,
            status: 'completed'
          }
        ];
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

      // ユーザー情報と期間情報を並行取得するためのPromise配列
      const enrichmentPromises = [];
      
      recentSnapshot.forEach((doc) => {
        const data = doc.data();
        const evaluation = {
          id: doc.id,
          ...data
        };
        recentEvaluations.push(evaluation);
        
        // ユーザー名と期間名を取得するPromiseを追加
        enrichmentPromises.push(this.enrichEvaluationData(evaluation, tenantId));
      });

      // 全ての追加情報を並行取得
      const enrichedResults = await Promise.allSettled(enrichmentPromises);
      
      // 成功したものだけを取得
      const finalEvaluations = enrichedResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      // 更新日時でソート
      finalEvaluations.sort((a, b) => {
        const aTime = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)) : new Date(0);
        const bTime = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)) : new Date(0);
        return bTime - aTime; // 降順
      });

      return finalEvaluations;

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
  async getEvaluations(filters = {}, options = {}) {
    try {
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock evaluations for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockEvaluations(filters);
      }

      const tenantId = currentUser.tenantId;

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

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock goals for temporary authentication");
        // 簡単なモックデータを返す
        return [];
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

      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("テナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock settings for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockSettings();
      }

      const tenantId = currentUser.tenantId;

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

  /**
   * 評価職種の取得
   */
  async getJobTypes() {
    try {
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock job types for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockJobTypes();
      }

      const tenantId = currentUser.tenantId;
      const snapshot = await getDocs(
        query(
          collection(this.db, 'targetJobTypes'),
          where('tenantId', '==', tenantId)
        )
      );
      
      // クライアント側でソート
      const jobTypes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 名前でソート
      jobTypes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      return jobTypes;
    } catch (error) {
      console.error('Error fetching job types:', error);
      throw new Error('職種の取得に失敗しました');
    }
  }

  /**
   * 評価データにユーザー名と期間名を追加
   */
  async enrichEvaluationData(evaluation, tenantId) {
    try {
      let targetUserName = evaluation.targetUserName || '不明なユーザー';
      let periodName = evaluation.periodName || '期間未設定';
      
      // targetUserId から targetUserName を取得
      if (evaluation.targetUserId && !evaluation.targetUserName) {
        try {
          const userDoc = await getDoc(doc(this.db, "users", evaluation.targetUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            targetUserName = userData.name || userData.displayName || '不明なユーザー';
          }
        } catch (userError) {
          console.warn("Failed to fetch user data:", userError);
        }
      }
      
      // periodId から periodName を取得
      if (evaluation.periodId && !evaluation.periodName) {
        try {
          const periodQuery = query(
            collection(this.db, "evaluationPeriods"),
            where("tenantId", "==", tenantId),
            where("id", "==", evaluation.periodId)
          );
          const periodSnapshot = await getDocs(periodQuery);
          if (!periodSnapshot.empty) {
            const periodData = periodSnapshot.docs[0].data();
            periodName = periodData.name || '期間未設定';
          }
        } catch (periodError) {
          console.warn("Failed to fetch period data:", periodError);
        }
      }
      
      return {
        ...evaluation,
        targetUserName,
        periodName
      };
    } catch (error) {
      console.warn("Failed to enrich evaluation data:", error);
      return {
        ...evaluation,
        targetUserName: evaluation.targetUserName || '不明なユーザー',
        periodName: evaluation.periodName || '期間未設定'
      };
    }
  }

  // ===== Report Management =====

  /**
   * レポート統計データを取得
   */
  async getReportStatistics(timeRange = 'last6months') {
    try {
      console.log("API: Loading report statistics for range:", timeRange);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        throw new Error("ユーザー情報またはテナント情報が見つかりません");
      }

      // 一時認証システム使用時はモックデータを返す
      if (currentUser.isTemp || window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE) {
        console.log("API: Using mock evaluations for temporary authentication");
        const tempAuthModule = await import('./temp-auth-v2.js');
        const tempAuth = new tempAuthModule.TempAuth();
        return tempAuth.getMockEvaluations(filters);
      }

      const tenantId = currentUser.tenantId;
      console.log("API: Using tenantId for statistics:", tenantId);

      // 評価データを取得（日付フィルターなしでまず取得）
      const evaluationsQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId)
      );

      console.log("API: Executing evaluations query...");
      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      console.log("API: Found evaluations:", evaluationsSnapshot.size);

      const evaluations = [];
      evaluationsSnapshot.forEach((doc) => {
        const data = doc.data();
        evaluations.push({
          id: doc.id,
          ...data
        });
      });

      console.log("API: Processing", evaluations.length, "evaluations");

      // 時間範囲でクライアント側フィルタリング
      const dateFilter = this.getDateFilterForTimeRange(timeRange);
      let filteredEvaluations = evaluations;

      if (dateFilter) {
        filteredEvaluations = evaluations.filter(evaluation => {
          if (!evaluation.createdAt) return true; // createdAtがない場合は含める
          
          let evalDate;
          if (evaluation.createdAt.toDate) {
            // Firestore Timestamp
            evalDate = evaluation.createdAt.toDate();
          } else if (evaluation.createdAt instanceof Date) {
            evalDate = evaluation.createdAt;
          } else if (typeof evaluation.createdAt === 'string') {
            evalDate = new Date(evaluation.createdAt);
          } else {
            return true; // 不明な形式は含める
          }
          
          return evalDate >= dateFilter;
        });
      }

      console.log("API: Filtered evaluations:", filteredEvaluations.length);

      // 統計を計算
      const totalEvaluations = filteredEvaluations.length;
      const completedEvaluations = filteredEvaluations.filter(e => e.status === 'completed').length;
      
      // 平均スコア計算
      const completedWithScores = filteredEvaluations.filter(e => 
        e.status === 'completed' && 
        e.finalScore && 
        !isNaN(parseFloat(e.finalScore))
      );
      
      const averageScore = completedWithScores.length > 0 
        ? completedWithScores.reduce((sum, e) => sum + parseFloat(e.finalScore), 0) / completedWithScores.length
        : 0;

      // 改善率計算（簡易版）
      const improvementRate = Math.random() * 10; // ダミーデータ

      const statistics = {
        totalEvaluations,
        completedEvaluations,
        averageScore: Math.round(averageScore * 10) / 10, // 小数点1桁に丸める
        improvementRate: Math.round(improvementRate * 10) / 10
      };

      console.log("API: Report statistics calculated:", statistics);
      return statistics;

    } catch (error) {
      console.error("API: Error loading report statistics:", error);
      console.error("API: Error details:", error.message, error.stack);
      
      // エラーの場合はデフォルト統計を返す
      return {
        totalEvaluations: 0,
        completedEvaluations: 0,
        averageScore: 0,
        improvementRate: 0
      };
    }
  }

  /**
   * 評価リストを取得（レポート用）
   */
  async getEvaluationsList(options = {}) {
    try {
      console.log("API: Loading evaluations list for reports:", options);
      
      // 基本的な評価データを取得
      const evaluations = await this.getEvaluations({});
      console.log("API: Raw evaluations loaded:", evaluations.length);
      
      // 時間範囲でフィルタリング
      let filteredEvaluations = evaluations;
      if (options.timeRange) {
        const dateFilter = this.getDateFilterForTimeRange(options.timeRange);
        if (dateFilter) {
          filteredEvaluations = evaluations.filter(evaluation => {
            if (!evaluation.createdAt) return true;
            
            let evalDate;
            if (evaluation.createdAt.toDate) {
              evalDate = evaluation.createdAt.toDate();
            } else if (evaluation.createdAt instanceof Date) {
              evalDate = evaluation.createdAt;
            } else if (typeof evaluation.createdAt === 'string') {
              evalDate = new Date(evaluation.createdAt);
            } else {
              return true;
            }
            
            return evalDate >= dateFilter;
          });
        }
      }
      
      console.log("API: Filtered evaluations:", filteredEvaluations.length);
      
      // 追加データを付与
      const currentUser = await this.getCurrentUserData();
      if (currentUser && currentUser.tenantId) {
        try {
          const enrichedEvaluations = await Promise.all(
            filteredEvaluations.slice(0, 50).map(evaluation => 
              this.enrichEvaluationData(evaluation, currentUser.tenantId)
            )
          );
          return enrichedEvaluations;
        } catch (enrichError) {
          console.warn("API: Failed to enrich evaluations, returning basic data:", enrichError);
          return filteredEvaluations.slice(0, 50);
        }
      }

      return filteredEvaluations.slice(0, 50);

    } catch (error) {
      console.error("API: Error loading evaluations list:", error);
      // エラーの場合は空配列を返す
      return [];
    }
  }

  /**
   * パフォーマンストレンドデータを取得
   */
  async getPerformanceTrends(timeRange = 'last6months') {
    try {
      console.log("API: Loading performance trends for range:", timeRange);
      
      const currentUser = await this.getCurrentUserData();
      if (!currentUser || !currentUser.tenantId) {
        console.log("API: No user or tenant info, using default trend data");
        return this.getDefaultTrendData(timeRange);
      }

      // 簡易的なトレンドデータを生成
      const months = this.getMonthsForTimeRange(timeRange);
      const trendData = {
        labels: months,
        datasets: [{
          label: '平均スコア',
          data: months.map(() => 3.5 + Math.random() * 1.5), // ダミーデータ
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4
        }, {
          label: '完了率',
          data: months.map(() => 70 + Math.random() * 25), // ダミーデータ
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          yAxisID: 'y1'
        }]
      };

      console.log("API: Performance trends loaded with", months.length, "data points");
      return trendData;

    } catch (error) {
      console.error("API: Error loading performance trends:", error);
      // エラーの場合はデフォルトデータを返す
      return this.getDefaultTrendData(timeRange);
    }
  }

  /**
   * デフォルトのトレンドデータを取得
   */
  getDefaultTrendData(timeRange = 'last6months') {
    const months = this.getMonthsForTimeRange(timeRange);
    return {
      labels: months,
      datasets: [{
        label: '平均スコア',
        data: months.map(() => 3.0), // デフォルト値
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4
      }]
    };
  }

  /**
   * 時間範囲に応じた日付フィルターを生成
   */
  getDateFilterForTimeRange(timeRange) {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'last3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'thisyear':
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case 'all':
      default:
        return null;
    }

    return startDate;
  }

  /**
   * 時間範囲に応じた月のリストを生成
   */
  getMonthsForTimeRange(timeRange) {
    const months = [];
    const now = new Date();
    let monthCount = 6;

    switch (timeRange) {
      case 'last3months':
        monthCount = 3;
        break;
      case 'last6months':
        monthCount = 6;
        break;
      case 'thisyear':
        monthCount = now.getMonth() + 1;
        break;
      case 'all':
        monthCount = 12;
        break;
      default:
        monthCount = 6;
    }

    // 安全な月の生成
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`);
    }

    return months;
  }

  // ベンチマークデータ取得
  async getBenchmarkData(userId) {
    try {
      // 一時認証システム使用時はモックデータを返す
      if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || 
          (this.app.currentUser && this.app.currentUser.isTemp)) {
        const tempAuthModule = await import('./temp-auth-v2.js');
        return new tempAuthModule.TempAuth().getMockBenchmarkData();
      }

      // Firestore実装（未実装の場合はモックデータ返す）
      const tempAuthModule = await import('./temp-auth-v2.js');
      return new tempAuthModule.TempAuth().getMockBenchmarkData();
    } catch (error) {
      console.error("API: Error loading benchmark data:", error);
      throw error;
    }
  }

  // 評価期間取得
  async getEvaluationPeriods() {
    try {
      // 一時認証システム使用時はモックデータを返す
      if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || 
          (this.app.currentUser && this.app.currentUser.isTemp)) {
        const tempAuthModule = await import('./temp-auth-v2.js');
        return new tempAuthModule.TempAuth().getMockEvaluationPeriods();
      }

      // Firestore実装（未実装の場合はモックデータ返す）
      const tempAuthModule = await import('./temp-auth-v2.js');
      return new tempAuthModule.TempAuth().getMockEvaluationPeriods();
    } catch (error) {
      console.error("API: Error loading evaluation periods:", error);
      throw error;
    }
  }

  // 組織構造取得  
  async getOrganizationStructure() {
    try {
      // 一時認証システム使用時はモックデータを返す
      if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || 
          (this.app.currentUser && this.app.currentUser.isTemp)) {
        const tempAuthModule = await import('./temp-auth-v2.js');
        return new tempAuthModule.TempAuth().getMockOrganizationStructure();
      }

      // Firestore実装（未実装の場合はモックデータ返す）
      const tempAuthModule = await import('./temp-auth-v2.js');
      return new tempAuthModule.TempAuth().getMockOrganizationStructure();
    } catch (error) {
      console.error("API: Error loading organization structure:", error);
      throw error;
    }
  }
}
