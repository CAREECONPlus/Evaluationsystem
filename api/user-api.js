/**
 * ユーザー管理API
 * ユーザー関連の全操作を担当
 */

import { 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { BaseAPI } from "./base-api.js";
import { createError } from "../utils/error-handler.js";

export class UserAPI extends BaseAPI {
  constructor(app) {
    super(app);
  }

  /**
   * ユーザープロファイルを取得（auth.jsで使用）
   */
  async getUserProfile(uid) {
    try {
      const cacheKey = `user_profile_${uid}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      // まずusersコレクションから取得を試みる
      const userDoc = await getDoc(doc(this.db, "users", uid));
      if (userDoc.exists()) {
        const userData = {
          id: uid,
          uid: uid,
          ...userDoc.data()
        };
        this.setCache(cacheKey, userData);
        return userData;
      }

      // global_usersからも検索（メールベースなのでcurrentUserからメール取得）
      if (this.app.auth.auth.currentUser && this.app.auth.auth.currentUser.email) {
        const globalUserDoc = await getDoc(doc(this.db, "global_users", this.app.auth.auth.currentUser.email));
        if (globalUserDoc.exists()) {
          const userData = {
            id: this.app.auth.auth.currentUser.email,
            uid: uid,
            ...globalUserDoc.data()
          };
          this.setCache(cacheKey, userData);
          return userData;
        }
      }

      return null;

    } catch (error) {
      throw this.handleError(error, 'ユーザープロファイルの取得');
    }
  }

  /**
   * ユーザープロファイルを作成
   */
  async createUserProfile(userData) {
    try {
      // 必須フィールドの検証
      this.validateRequired(userData, ['uid', 'name', 'email']);
      this.validateEmail(userData.email);
      this.validateName(userData.name);

      // データをクリーンアップ
      const cleanedUserData = this.cleanData(userData);
      
      console.log("UserAPI: Creating user profile with cleaned data:", cleanedUserData);

      // usersコレクションに保存
      await setDoc(doc(this.db, "users", userData.uid), {
        ...cleanedUserData,
        createdAt: this.serverTimestamp(),
        updatedAt: this.serverTimestamp()
      });

      // global_usersにも保存（メールベース）
      if (userData.email) {
        await setDoc(doc(this.db, "global_users", userData.email), {
          ...cleanedUserData,
          createdAt: this.serverTimestamp(),
          updatedAt: this.serverTimestamp()
        });
      }

      // キャッシュをクリア
      this.clearCache('user_');

      console.log("UserAPI: User profile created successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, 'ユーザープロファイルの作成');
    }
  }

  /**
   * テナント内のユーザー一覧を取得（統合版）
   */
  async getUsers(statusFilter = null) {
    try {
      const cacheKey = `users_${statusFilter || 'all'}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("UserAPI: Loading users...", statusFilter ? `with status filter: ${statusFilter}` : '');
      
      const tenantId = await this.getCurrentTenantId();
      console.log("UserAPI: Loading users for tenant:", tenantId);

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

      this.setCache(cacheKey, users);
      console.log("UserAPI: Users loaded successfully:", users.length);
      return users;

    } catch (error) {
      throw this.handleError(error, 'ユーザー一覧の読み込み');
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
        throw createError.permission('部下ユーザーの取得', '現在のユーザー情報が見つかりません');
      }

      const allUsers = await this.getAllUsers();
      const subordinates = allUsers.filter(user => user.evaluatorId === currentUser.uid);
      
      console.log("UserAPI: Subordinates loaded:", subordinates.length);
      return subordinates;

    } catch (error) {
      throw this.handleError(error, '部下ユーザーの読み込み');
    }
  }

  /**
   * 特定のユーザー情報を取得
   */
  async getUser(userId) {
    try {
      const cacheKey = `user_${userId}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("UserAPI: Loading user:", userId);
      
      const userDoc = await getDoc(doc(this.db, "users", userId));
      
      if (!userDoc.exists()) {
        throw createError.notFound('ユーザー', userId);
      }

      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };

      this.setCache(cacheKey, userData);
      console.log("UserAPI: User loaded:", userData);
      return userData;

    } catch (error) {
      throw this.handleError(error, 'ユーザー情報の読み込み');
    }
  }

  /**
   * ユーザー情報を更新
   */
  async updateUser(userId, updateData) {
    try {
      console.log("UserAPI: Updating user:", userId, updateData);
      
      const userRef = doc(this.db, "users", userId);
      
      // 存在確認
      await this.checkExists('users', userId, 'ユーザー');
      
      // データをクリーンアップ
      const cleanData = this.cleanData(updateData);

      await updateDoc(userRef, {
        ...cleanData,
        updatedAt: this.serverTimestamp()
      });

      // global_usersも更新（存在する場合）
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().email) {
        try {
          const globalUserRef = doc(this.db, "global_users", userDoc.data().email);
          await updateDoc(globalUserRef, {
            ...cleanData,
            updatedAt: this.serverTimestamp()
          });
        } catch (globalError) {
          console.warn("UserAPI: Failed to update global_users:", globalError);
        }
      }

      // キャッシュをクリア
      this.clearCache('user_');

      console.log("UserAPI: User updated successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, 'ユーザー情報の更新');
    }
  }

  /**
   * ユーザーを削除
   */
  async deleteUser(userId) {
    try {
      console.log("UserAPI: Deleting user:", userId);
      
      // 存在確認とデータ取得
      const userDoc = await this.checkExists('users', userId, 'ユーザー');
      const userData = userDoc.data();

      // 管理者権限チェック
      this.checkPermission(['admin'], 'ユーザーの削除');

      // usersコレクションから削除
      await deleteDoc(doc(this.db, "users", userId));

      // global_usersからも削除（存在する場合）
      if (userData && userData.email) {
        try {
          await deleteDoc(doc(this.db, "global_users", userData.email));
        } catch (globalError) {
          console.warn("UserAPI: Failed to delete from global_users:", globalError);
        }
      }

      // キャッシュをクリア
      this.clearCache('user_');

      console.log("UserAPI: User deleted successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, 'ユーザーの削除');
    }
  }

  /**
   * ユーザーのステータスを変更
   */
  async updateUserStatus(userId, status) {
    try {
      // ステータス値の検証
      const validStatuses = ['active', 'suspended', 'pending_approval', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw createError.validation('status', `無効なステータス: ${status}`);
      }

      console.log("UserAPI: Updating user status:", userId, status);
      return await this.updateUser(userId, { status });

    } catch (error) {
      throw this.handleError(error, 'ユーザーステータスの更新');
    }
  }

  /**
   * ユーザーの役割を変更
   */
  async updateUserRole(userId, role) {
    try {
      // ロール値の検証
      const validRoles = ['developer', 'admin', 'evaluator', 'worker'];
      if (!validRoles.includes(role)) {
        throw createError.validation('role', `無効な役割: ${role}`);
      }

      // 管理者権限チェック
      this.checkPermission(['admin'], 'ユーザー役割の変更');

      console.log("UserAPI: Updating user role:", userId, role);
      return await this.updateUser(userId, { role });

    } catch (error) {
      throw this.handleError(error, 'ユーザー役割の更新');
    }
  }

  /**
   * ユーザー検索
   */
  async searchUsers(searchTerm, filters = {}) {
    try {
      const allUsers = await this.getUsers(filters.status);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return allUsers;
      }

      const term = searchTerm.toLowerCase().trim();
      
      return allUsers.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.companyName?.toLowerCase().includes(term)
      );

    } catch (error) {
      throw this.handleError(error, 'ユーザー検索');
    }
  }

  /**
   * ユーザー統計を取得
   */
  async getUserStats() {
    try {
      const cacheKey = 'user_stats';
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const allUsers = await this.getAllUsers();
      
      const stats = {
        total: allUsers.length,
        byStatus: {},
        byRole: {},
        recentRegistrations: 0
      };

      // 1週間前の日付
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      allUsers.forEach(user => {
        // ステータス別集計
        const status = user.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // ロール別集計
        const role = user.role || 'unknown';
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;

        // 最近の登録数
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        if (createdAt && createdAt > weekAgo) {
          stats.recentRegistrations++;
        }
      });

      this.setCache(cacheKey, stats, 30000); // 30秒キャッシュ
      return stats;

    } catch (error) {
      throw this.handleError(error, 'ユーザー統計の取得');
    }
  }
}