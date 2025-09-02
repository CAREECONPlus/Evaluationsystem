/**
 * 目標管理API
 * 目標設定・承認関連の全操作を担当
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

export class GoalsAPI extends BaseAPI {
  constructor(app) {
    super(app);
  }

  /**
   * ステータス別目標取得
   */
  async getGoalsByStatus(status) {
    try {
      const cacheKey = `goals_by_status_${status}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("GoalsAPI: Loading goals by status:", status);
      
      const tenantId = await this.getCurrentTenantId();
      
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

      // 更新日時でソート
      goals.sort((a, b) => {
        const aTime = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)) : new Date(0);
        const bTime = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)) : new Date(0);
        return bTime - aTime; // 降順
      });

      this.setCache(cacheKey, goals);
      console.log("GoalsAPI: Goals loaded by status:", goals.length);
      return goals;

    } catch (error) {
      throw this.handleError(error, '目標の読み込み');
    }
  }

  /**
   * ユーザーの目標を取得
   */
  async getGoals(userId, periodId) {
    try {
      const cacheKey = `goals_${userId}_${periodId}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("GoalsAPI: Loading goals for user:", userId, "period:", periodId);
      
      const tenantId = await this.getCurrentTenantId();
      
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

      this.setCache(cacheKey, goals);
      console.log("GoalsAPI: Goals loaded:", goals);
      return goals;

    } catch (error) {
      console.error("GoalsAPI: Error loading goals:", error);
      return null;
    }
  }

  /**
   * 目標を保存
   */
  async saveGoals(goalsData) {
    try {
      console.log("GoalsAPI: Saving goals:", goalsData);

      const tenantId = await this.getCurrentTenantId();

      // 必須フィールドの検証
      this.validateRequired(goalsData, ['userId', 'periodId']);

      // 目標データの検証
      if (goalsData.goals && Array.isArray(goalsData.goals)) {
        let totalWeight = 0;
        
        goalsData.goals.forEach((goal, index) => {
          if (!goal.title || goal.title.trim() === '') {
            throw createError.validation(`goals[${index}].title`, '目標のタイトルは必須です');
          }
          
          if (!goal.weight || goal.weight < 0 || goal.weight > 100) {
            throw createError.validation(`goals[${index}].weight`, '重みは0-100の範囲で設定してください');
          }
          
          totalWeight += goal.weight;
        });

        // 重みの合計チェック
        if (Math.abs(totalWeight - 100) > 0.01) {
          throw createError.validation('goals.weight', '目標の重みの合計は100%である必要があります');
        }
      }

      const cleanData = this.cleanData({
        ...goalsData,
        tenantId: tenantId,
        updatedAt: this.serverTimestamp()
      });

      let docRef;
      if (goalsData.id) {
        // 更新
        docRef = doc(this.db, "qualitativeGoals", goalsData.id);
        await updateDoc(docRef, cleanData);
      } else {
        // 新規作成
        cleanData.createdAt = this.serverTimestamp();
        docRef = doc(collection(this.db, "qualitativeGoals"));
        cleanData.id = docRef.id;
        await setDoc(docRef, cleanData);
      }

      // キャッシュをクリア
      this.clearCache('goals_');

      console.log("GoalsAPI: Goals saved successfully:", docRef.id);
      return { success: true, id: docRef.id };

    } catch (error) {
      throw this.handleError(error, '目標の保存');
    }
  }

  /**
   * 目標ステータスを更新
   */
  async updateGoalStatus(goalId, status, metadata = {}) {
    try {
      // ステータス値の検証
      const validStatuses = ['draft', 'pending_approval', 'approved', 'rejected', 'completed'];
      if (!validStatuses.includes(status)) {
        throw createError.validation('status', `無効なステータス: ${status}`);
      }

      console.log("GoalsAPI: Updating goal status:", goalId, status);

      const updateData = {
        status: status,
        updatedAt: this.serverTimestamp(),
        ...this.cleanData(metadata)
      };

      await updateDoc(doc(this.db, "qualitativeGoals", goalId), updateData);

      // キャッシュをクリア
      this.clearCache('goals_');

      console.log("GoalsAPI: Goal status updated successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '目標ステータスの更新');
    }
  }

  /**
   * 目標を承認
   */
  async approveGoal(goalId, approverId, comments = '') {
    try {
      // 管理者権限チェック
      this.checkPermission(['admin'], '目標の承認');

      const metadata = {
        approvedBy: approverId,
        approvedAt: this.serverTimestamp(),
        approvalComments: comments
      };

      return await this.updateGoalStatus(goalId, 'approved', metadata);

    } catch (error) {
      throw this.handleError(error, '目標の承認');
    }
  }

  /**
   * 目標を却下
   */
  async rejectGoal(goalId, rejectedBy, reason = '') {
    try {
      // 管理者権限チェック
      this.checkPermission(['admin'], '目標の却下');

      const metadata = {
        rejectedBy: rejectedBy,
        rejectedAt: this.serverTimestamp(),
        rejectionReason: reason
      };

      return await this.updateGoalStatus(goalId, 'rejected', metadata);

    } catch (error) {
      throw this.handleError(error, '目標の却下');
    }
  }

  /**
   * 承認待ちの目標を取得
   */
  async getPendingApprovalGoals() {
    try {
      return await this.getGoalsByStatus('pending_approval');
    } catch (error) {
      throw this.handleError(error, '承認待ち目標の取得');
    }
  }

  /**
   * 承認済みの目標を取得
   */
  async getApprovedGoals() {
    try {
      return await this.getGoalsByStatus('approved');
    } catch (error) {
      throw this.handleError(error, '承認済み目標の取得');
    }
  }

  /**
   * ユーザーの全期間の目標を取得
   */
  async getUserAllGoals(userId) {
    try {
      const cacheKey = `user_all_goals_${userId}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("GoalsAPI: Loading all goals for user:", userId);
      
      const tenantId = await this.getCurrentTenantId();
      
      const goalsQuery = query(
        collection(this.db, "qualitativeGoals"),
        where("tenantId", "==", tenantId),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const goalsSnapshot = await getDocs(goalsQuery);
      const goals = [];

      goalsSnapshot.forEach((doc) => {
        goals.push({
          id: doc.id,
          ...doc.data()
        });
      });

      this.setCache(cacheKey, goals);
      console.log("GoalsAPI: All user goals loaded:", goals.length);
      return goals;

    } catch (error) {
      throw this.handleError(error, 'ユーザーの全目標の取得');
    }
  }

  /**
   * 目標の進捗を更新
   */
  async updateGoalProgress(goalId, progressData) {
    try {
      console.log("GoalsAPI: Updating goal progress:", goalId, progressData);

      // 存在確認
      await this.checkExists('qualitativeGoals', goalId, '目標');

      // 進捗データの検証
      if (progressData.goals && Array.isArray(progressData.goals)) {
        progressData.goals.forEach((goal, index) => {
          if (goal.progress !== undefined) {
            if (typeof goal.progress !== 'number' || goal.progress < 0 || goal.progress > 100) {
              throw createError.validation(`goals[${index}].progress`, '進捗は0-100の範囲で設定してください');
            }
          }
        });
      }

      const updateData = this.cleanData({
        ...progressData,
        updatedAt: this.serverTimestamp()
      });

      await updateDoc(doc(this.db, "qualitativeGoals", goalId), updateData);

      // キャッシュをクリア
      this.clearCache('goals_');

      console.log("GoalsAPI: Goal progress updated successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '目標進捗の更新');
    }
  }

  /**
   * 目標統計を取得
   */
  async getGoalsStats() {
    try {
      const cacheKey = 'goals_stats';
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const tenantId = await this.getCurrentTenantId();

      // 目標データを取得
      const goalsSnapshot = await getDocs(
        query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", tenantId))
      );

      const stats = {
        total: goalsSnapshot.size,
        byStatus: {},
        completionRate: 0,
        averageProgress: 0
      };

      let completedCount = 0;
      let totalProgress = 0;
      let goalsWithProgress = 0;

      goalsSnapshot.forEach(doc => {
        const goalData = doc.data();
        
        // ステータス別集計
        const status = goalData.status || 'draft';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        if (goalData.status === 'completed') {
          completedCount++;
        }

        // 平均進捗計算
        if (goalData.goals && Array.isArray(goalData.goals)) {
          goalData.goals.forEach(goal => {
            if (goal.progress !== undefined) {
              totalProgress += goal.progress;
              goalsWithProgress++;
            }
          });
        }
      });

      stats.completionRate = stats.total > 0 ? (completedCount / stats.total) * 100 : 0;
      stats.averageProgress = goalsWithProgress > 0 ? totalProgress / goalsWithProgress : 0;

      this.setCache(cacheKey, stats, 300000); // 5分キャッシュ
      return stats;

    } catch (error) {
      throw this.handleError(error, '目標統計の取得');
    }
  }

  /**
   * 目標テンプレートを取得
   */
  async getGoalTemplates() {
    try {
      const cacheKey = 'goal_templates';
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      // サンプルテンプレートを返す（実際の実装ではDBから取得）
      const templates = [
        {
          id: 'template_1',
          name: '技術向上',
          description: '技術スキルの向上を目指す目標',
          goals: [
            { title: '新技術の習得', weight: 40, description: '新しい技術を学習し実践する' },
            { title: '資格取得', weight: 30, description: '業務に関連する資格を取得する' },
            { title: 'スキル向上', weight: 30, description: '既存スキルをさらに向上させる' }
          ]
        },
        {
          id: 'template_2',
          name: 'チームワーク強化',
          description: 'チーム内のコミュニケーション改善',
          goals: [
            { title: 'コミュニケーション改善', weight: 50, description: 'チーム内の情報共有を改善する' },
            { title: 'サポート活動', weight: 30, description: '同僚のサポートを積極的に行う' },
            { title: 'チーム貢献', weight: 20, description: 'チーム全体の成果に貢献する' }
          ]
        }
      ];

      this.setCache(cacheKey, templates, 3600000); // 1時間キャッシュ
      return templates;

    } catch (error) {
      throw this.handleError(error, '目標テンプレートの取得');
    }
  }
}