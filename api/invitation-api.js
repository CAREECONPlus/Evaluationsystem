/**
 * 招待管理API
 * 招待関連の全操作を担当
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

export class InvitationAPI extends BaseAPI {
  constructor(app) {
    super(app);
  }

  /**
   * 招待を取得
   */
  async getInvitation(token) {
    try {
      const cacheKey = `invitation_${token}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("InvitationAPI: Getting invitation:", token);
      
      const invitationDoc = await getDoc(doc(this.db, "invitations", token));
      
      if (!invitationDoc.exists()) {
        return null;
      }

      const invitation = {
        id: invitationDoc.id,
        ...invitationDoc.data()
      };

      // 有効期限チェック
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        throw createError.validation('invitation', '招待コードの有効期限が切れています');
      }

      this.setCache(cacheKey, invitation, 600000); // 10分キャッシュ
      console.log("InvitationAPI: Invitation loaded:", invitation);
      return invitation;

    } catch (error) {
      throw this.handleError(error, '招待情報の取得');
    }
  }

  /**
   * 招待コードを検証
   */
  async validateInvitationCode(code) {
    try {
      console.log("InvitationAPI: Validating invitation code:", code);
      
      if (!code || code.trim() === '') {
        throw createError.validation('code', '招待コードが指定されていません');
      }

      // 招待コードのクエリ
      const invitationsQuery = query(
        collection(this.db, "invitations"),
        where("code", "==", code),
        where("used", "==", false),
        limit(1)
      );

      const invitationsSnapshot = await getDocs(invitationsQuery);
      
      if (invitationsSnapshot.empty) {
        throw createError.validation('code', '無効な招待コードです');
      }

      const invitationDoc = invitationsSnapshot.docs[0];
      const invitation = {
        id: invitationDoc.id,
        ...invitationDoc.data()
      };

      // 有効期限チェック
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        throw createError.validation('code', '招待コードの有効期限が切れています');
      }

      console.log("InvitationAPI: Invitation code validated:", invitation);
      return invitation;

    } catch (error) {
      throw this.handleError(error, '招待コードの検証');
    }
  }

  /**
   * 招待を使用済みにマーク
   */
  async markInvitationAsUsed(invitationId, userId) {
    try {
      console.log("InvitationAPI: Marking invitation as used:", { invitationId, userId });

      // 現在の招待データを取得
      const invitationRef = doc(this.db, "invitations", invitationId);
      const invitationDoc = await getDoc(invitationRef);
      
      if (!invitationDoc.exists()) {
        throw createError.notFound('招待', invitationId);
      }

      const currentData = invitationDoc.data();
      
      // 既に使用済みかチェック
      if (currentData.used) {
        throw createError.validation('invitation', 'この招待コードは既に使用済みです');
      }

      console.log("InvitationAPI: Current invitation data:", currentData);

      // 最小限のフィールドのみ更新
      const updateData = {
        used: true,
        usedBy: userId,
        usedAt: this.serverTimestamp()
      };

      console.log("InvitationAPI: Updating with data:", updateData);

      await updateDoc(invitationRef, updateData);
      
      // キャッシュをクリア
      this.clearCache(`invitation_${invitationId}`);

      console.log("InvitationAPI: Invitation marked as used successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '招待の使用済み更新');
    }
  }

  /**
   * 招待を作成
   */
  async createInvitation(invitationData) {
    try {
      console.log("InvitationAPI: Creating invitation:", invitationData);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw createError.permission('招待の作成', '現在のユーザー情報が取得できません');
      }

      // 管理者権限チェック
      this.checkPermission(['admin'], '招待の作成');

      // 必須フィールドの検証
      this.validateRequired(invitationData, ['role', 'email']);
      this.validateEmail(invitationData.email);

      // ロールの検証
      const validRoles = ['admin', 'evaluator', 'worker'];
      if (!validRoles.includes(invitationData.role)) {
        throw createError.validation('role', `無効な役割: ${invitationData.role}`);
      }

      // 招待コードを生成
      const invitationCode = this.generateInvitationCode();

      // undefinedフィールドを除外
      const cleanData = this.cleanData(invitationData);

      // 招待IDを生成
      const invitationRef = doc(collection(this.db, "invitations"));
      
      const invitation = {
        id: invitationRef.id,
        code: invitationCode,
        ...cleanData,
        tenantId: currentUser.tenantId,
        companyName: currentUser.companyName,
        invitedBy: currentUser.uid,
        inviterName: currentUser.name,
        used: false,
        createdAt: this.serverTimestamp(),
        expiresAt: invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日後
      };

      await setDoc(invitationRef, invitation);
      
      console.log("InvitationAPI: Invitation created successfully:", invitationRef.id);
      return { 
        success: true, 
        id: invitationRef.id, 
        code: invitationCode,
        expiresAt: invitation.expiresAt
      };

    } catch (error) {
      throw this.handleError(error, '招待の作成');
    }
  }

  /**
   * 管理者招待を作成（開発者用）
   */
  async createAdminInvitation(invitationData) {
    try {
      console.log("InvitationAPI: Creating admin invitation:", invitationData);

      // 開発者権限チェック
      this.checkPermission(['developer'], '管理者招待の作成');

      // 必須フィールドの検証
      this.validateRequired(invitationData, ['email', 'companyName']);
      this.validateEmail(invitationData.email);

      // 招待コードを生成
      const invitationCode = this.generateInvitationCode();

      // 招待IDを生成
      const invitationRef = doc(collection(this.db, "invitations"));
      
      const invitation = {
        id: invitationRef.id,
        code: invitationCode,
        ...this.cleanData(invitationData),
        type: 'admin',
        role: 'admin',
        used: false,
        createdAt: this.serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7日後
      };

      await setDoc(invitationRef, invitation);
      
      console.log("InvitationAPI: Admin invitation created successfully:", invitationRef.id);
      return { 
        success: true, 
        id: invitationRef.id, 
        code: invitationCode,
        expiresAt: invitation.expiresAt
      };

    } catch (error) {
      throw this.handleError(error, '管理者招待の作成');
    }
  }

  /**
   * 招待一覧を取得
   */
  async getInvitations(filters = {}) {
    try {
      const cacheKey = `invitations_${JSON.stringify(filters)}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("InvitationAPI: Loading invitations...", filters);

      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw createError.permission('招待一覧の取得', '現在のユーザー情報が取得できません');
      }

      let invitationsQuery = query(collection(this.db, "invitations"));

      // テナント別フィルタリング（管理者以外）
      if (currentUser.role !== 'developer') {
        invitationsQuery = query(invitationsQuery, where("tenantId", "==", currentUser.tenantId));
      }

      // ステータスフィルタ
      if (filters.used !== undefined) {
        invitationsQuery = query(invitationsQuery, where("used", "==", filters.used));
      }

      // ロールフィルタ
      if (filters.role) {
        invitationsQuery = query(invitationsQuery, where("role", "==", filters.role));
      }

      // 作成日でソート
      invitationsQuery = query(invitationsQuery, orderBy("createdAt", "desc"));

      const invitationsSnapshot = await getDocs(invitationsQuery);
      const invitations = [];

      invitationsSnapshot.forEach((doc) => {
        const invitationData = doc.data();
        
        // 有効期限チェック
        const isExpired = invitationData.expiresAt && new Date(invitationData.expiresAt) < new Date();
        
        invitations.push({
          id: doc.id,
          ...invitationData,
          isExpired
        });
      });

      this.setCache(cacheKey, invitations, 300000); // 5分キャッシュ
      console.log("InvitationAPI: Invitations loaded:", invitations.length);
      return invitations;

    } catch (error) {
      throw this.handleError(error, '招待一覧の読み込み');
    }
  }

  /**
   * 招待を削除
   */
  async deleteInvitation(invitationId) {
    try {
      console.log("InvitationAPI: Deleting invitation:", invitationId);

      // 存在確認
      await this.checkExists('invitations', invitationId, '招待');

      // 管理者権限チェック
      this.checkPermission(['admin'], '招待の削除');

      await deleteDoc(doc(this.db, "invitations", invitationId));

      // キャッシュをクリア
      this.clearCache('invitation');

      console.log("InvitationAPI: Invitation deleted successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '招待の削除');
    }
  }

  /**
   * 招待統計を取得
   */
  async getInvitationStats() {
    try {
      const cacheKey = 'invitation_stats';
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const currentUser = await this.getCurrentUserData();
      if (!currentUser) {
        throw createError.permission('招待統計の取得', '現在のユーザー情報が取得できません');
      }

      const invitations = await this.getInvitations();
      
      const stats = {
        total: invitations.length,
        used: invitations.filter(inv => inv.used).length,
        expired: invitations.filter(inv => inv.isExpired && !inv.used).length,
        pending: invitations.filter(inv => !inv.used && !inv.isExpired).length,
        byRole: {}
      };

      // ロール別統計
      invitations.forEach(invitation => {
        const role = invitation.role || 'unknown';
        if (!stats.byRole[role]) {
          stats.byRole[role] = { total: 0, used: 0, pending: 0 };
        }
        stats.byRole[role].total++;
        if (invitation.used) {
          stats.byRole[role].used++;
        } else if (!invitation.isExpired) {
          stats.byRole[role].pending++;
        }
      });

      this.setCache(cacheKey, stats, 300000); // 5分キャッシュ
      return stats;

    } catch (error) {
      throw this.handleError(error, '招待統計の取得');
    }
  }

  /**
   * 招待を受諾してアカウントを作成
   */
  async acceptInvitation(invitationCode, userData) {
    try {
      console.log("InvitationAPI: Accepting invitation:", { code: invitationCode, userData: { ...userData, password: '[HIDDEN]' } });

      // 招待コードを検証
      const invitation = await this.validateInvitationCode(invitationCode);
      
      if (!invitation) {
        throw createError.validation('code', "無効な招待コードです");
      }

      // メールアドレスが一致するかチェック
      if (invitation.email !== userData.email) {
        throw createError.validation('email', "招待されたメールアドレスと異なります");
      }

      // Firebase Authenticationでユーザー作成
      const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        userData.password
      );

      const user = userCredential.user;
      console.log("InvitationAPI: Firebase user created:", user.uid);

      // Firestoreにユーザー情報を保存
      const userDoc = {
        uid: user.uid,
        email: userData.email,
        name: userData.name,
        role: invitation.role,
        status: 'active',
        tenantId: invitation.tenantId,
        jobTypeIds: [],
        createdAt: this.serverTimestamp(),
        updatedAt: this.serverTimestamp(),
        invitationId: invitation.id,
        registeredVia: 'invitation'
      };

      await setDoc(doc(this.db, "users", user.uid), userDoc);
      console.log("InvitationAPI: User document created in Firestore");

      // 招待を使用済みにマーク
      await this.markInvitationAsUsed(invitation.id, user.uid);
      console.log("InvitationAPI: Invitation marked as used");

      // キャッシュをクリア
      this.clearCache('invitation');
      this.clearCache('user');

      return {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          role: invitation.role
        },
        message: "アカウントが正常に作成されました"
      };

    } catch (error) {
      console.error("InvitationAPI: Error accepting invitation:", error);
      
      // Firebase Authのエラーハンドリング
      if (error.code === 'auth/email-already-in-use') {
        throw createError.validation('email', "このメールアドレスは既に使用されています");
      } else if (error.code === 'auth/weak-password') {
        throw createError.validation('password', "パスワードが弱すぎます");
      } else if (error.code === 'auth/invalid-email') {
        throw createError.validation('email', "無効なメールアドレスです");
      }
      
      throw this.handleError(error, '招待の受諾');
    }
  }

  /**
   * 招待コードを生成
   */
  generateInvitationCode() {
    // 8文字のランダムな英数字コードを生成
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 招待リンクを生成
   */
  generateInvitationLink(invitationCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}#/register?code=${invitationCode}`;
  }

  /**
   * 期限切れの招待をクリーンアップ
   */
  async cleanupExpiredInvitations() {
    try {
      console.log("InvitationAPI: Cleaning up expired invitations...");

      // 管理者権限チェック
      this.checkPermission(['admin'], '期限切れ招待のクリーンアップ');

      const currentUser = await this.getCurrentUserData();
      const now = new Date().toISOString();

      // 期限切れの未使用招待を取得
      const expiredQuery = query(
        collection(this.db, "invitations"),
        where("tenantId", "==", currentUser.tenantId),
        where("used", "==", false),
        where("expiresAt", "<", now)
      );

      const expiredSnapshot = await getDocs(expiredQuery);
      let deletedCount = 0;

      // バッチで削除
      const deletePromises = expiredSnapshot.docs.map(async (doc) => {
        try {
          await deleteDoc(doc.ref);
          deletedCount++;
        } catch (error) {
          console.warn(`Failed to delete expired invitation ${doc.id}:`, error);
        }
      });

      await Promise.all(deletePromises);

      // キャッシュをクリア
      this.clearCache('invitation');

      console.log(`InvitationAPI: Cleaned up ${deletedCount} expired invitations`);
      return { success: true, deletedCount };

    } catch (error) {
      throw this.handleError(error, '期限切れ招待のクリーンアップ');
    }
  }
}