/**
 * 評価管理API
 * 評価関連の全操作を担当
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

export class EvaluationAPI extends BaseAPI {
  constructor(app) {
    super(app);
  }

  /**
   * 評価一覧を取得
   */
  async getEvaluations(filters = {}) {
    try {
      const cacheKey = `evaluations_${JSON.stringify(filters)}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("EvaluationAPI: Loading evaluations...", filters);
      
      const tenantId = await this.getCurrentTenantId();
      console.log("EvaluationAPI: Loading evaluations for tenant:", tenantId);

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
      if (filters.status) {
        evaluationsQuery = query(evaluationsQuery, where("status", "==", filters.status));
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

      this.setCache(cacheKey, evaluations);
      console.log("EvaluationAPI: Evaluations loaded:", evaluations.length);
      return evaluations;

    } catch (error) {
      throw this.handleError(error, '評価一覧の読み込み');
    }
  }

  /**
   * 特定の評価を取得
   */
  async getEvaluation(evaluationId) {
    try {
      const cacheKey = `evaluation_${evaluationId}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("EvaluationAPI: Loading evaluation:", evaluationId);
      
      const evaluationDoc = await getDoc(doc(this.db, "evaluations", evaluationId));
      
      if (!evaluationDoc.exists()) {
        throw createError.notFound('評価', evaluationId);
      }

      const evaluation = {
        id: evaluationDoc.id,
        ...evaluationDoc.data()
      };

      this.setCache(cacheKey, evaluation);
      console.log("EvaluationAPI: Evaluation loaded:", evaluation);
      return evaluation;

    } catch (error) {
      throw this.handleError(error, '評価情報の読み込み');
    }
  }

  /**
   * IDで評価を取得（エイリアス）
   */
  async getEvaluationById(evaluationId) {
    return await this.getEvaluation(evaluationId);
  }

  /**
   * 評価を作成または更新
   */
  async saveEvaluation(evaluationData) {
    try {
      console.log("EvaluationAPI: Saving evaluation:", evaluationData);

      const tenantId = await this.getCurrentTenantId();

      // 必須フィールドの検証
      this.validateRequired(evaluationData, ['targetUserId', 'periodId']);

      // undefinedフィールドを除外
      const cleanData = this.cleanData(evaluationData);

      const evaluation = {
        ...cleanData,
        tenantId: tenantId,
        updatedAt: this.serverTimestamp()
      };

      let docRef;
      if (evaluationData.id) {
        // 更新
        docRef = doc(this.db, "evaluations", evaluationData.id);
        await updateDoc(docRef, evaluation);
      } else {
        // 新規作成
        evaluation.createdAt = this.serverTimestamp();
        docRef = doc(collection(this.db, "evaluations"));
        evaluation.id = docRef.id;
        await setDoc(docRef, evaluation);
      }
      
      // キャッシュをクリア
      this.clearCache('evaluation');

      console.log("EvaluationAPI: Evaluation saved successfully:", docRef.id);
      return { success: true, id: docRef.id };

    } catch (error) {
      throw this.handleError(error, '評価の保存');
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
      console.log("EvaluationAPI: Updating evaluation:", evaluationId, updateData);

      // 存在確認
      await this.checkExists('evaluations', evaluationId, '評価');

      // undefinedフィールドを除外
      const cleanData = this.cleanData(updateData);

      await updateDoc(doc(this.db, "evaluations", evaluationId), {
        ...cleanData,
        updatedAt: this.serverTimestamp()
      });

      // キャッシュをクリア
      this.clearCache('evaluation');

      console.log("EvaluationAPI: Evaluation updated successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '評価の更新');
    }
  }

  /**
   * 評価ステータスを更新
   */
  async updateEvaluationStatus(evaluationId, status, metadata = {}) {
    try {
      // ステータス値の検証
      const validStatuses = ['draft', 'self_assessed', 'pending_approval', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw createError.validation('status', `無効なステータス: ${status}`);
      }

      console.log("EvaluationAPI: Updating evaluation status:", evaluationId, status);

      const updateData = {
        status: status,
        updatedAt: this.serverTimestamp(),
        ...metadata
      };

      await updateDoc(doc(this.db, "evaluations", evaluationId), updateData);

      // キャッシュをクリア
      this.clearCache('evaluation');

      console.log("EvaluationAPI: Evaluation status updated successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '評価ステータスの更新');
    }
  }

  /**
   * 評価を削除
   */
  async deleteEvaluation(evaluationId) {
    try {
      console.log("EvaluationAPI: Deleting evaluation:", evaluationId);
      
      // 存在確認
      await this.checkExists('evaluations', evaluationId, '評価');

      // 管理者権限チェック
      this.checkPermission(['admin'], '評価の削除');

      await deleteDoc(doc(this.db, "evaluations", evaluationId));

      // キャッシュをクリア
      this.clearCache('evaluation');

      console.log("EvaluationAPI: Evaluation deleted successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '評価の削除');
    }
  }

  /**
   * 評価履歴を取得
   */
  async getEvaluationHistory(evaluationId) {
    try {
      console.log("EvaluationAPI: Loading evaluation history:", evaluationId);
      
      // 簡易的な履歴データを返す（実際の実装では履歴テーブルから取得）
      const evaluation = await this.getEvaluation(evaluationId);
      const history = [
        {
          status: evaluation.status,
          actor: evaluation.evaluatorName || 'システム',
          timestamp: evaluation.updatedAt || evaluation.createdAt,
          action: 'ステータス更新'
        }
      ];

      console.log("EvaluationAPI: Evaluation history loaded:", history);
      return history;

    } catch (error) {
      console.error("EvaluationAPI: Error loading evaluation history:", error);
      return [];
    }
  }

  /**
   * 評価構造を取得
   */
  async getEvaluationStructure(jobTypeId) {
    try {
      const cacheKey = `evaluation_structure_${jobTypeId}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("EvaluationAPI: Loading evaluation structure for job type:", jobTypeId);
      
      const tenantId = await this.getCurrentTenantId();
      
      // 評価構造を取得
      const structureQuery = query(
        collection(this.db, "evaluationStructures"),
        where("tenantId", "==", tenantId),
        where("jobTypeId", "==", jobTypeId)
      );

      const structureSnapshot = await getDocs(structureQuery);
      
      if (structureSnapshot.empty) {
        // デフォルト構造を返す
        const defaultStructure = {
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
        
        this.setCache(cacheKey, defaultStructure);
        return defaultStructure;
      }

      const structure = structureSnapshot.docs[0].data();
      this.setCache(cacheKey, structure);
      console.log("EvaluationAPI: Evaluation structure loaded:", structure);
      return structure;

    } catch (error) {
      console.error("EvaluationAPI: Error loading evaluation structure:", error);
      return { categories: [] };
    }
  }

  /**
   * 最近の評価を取得
   */
  async getRecentEvaluations(limitCount = 10) {
    try {
      const cacheKey = `recent_evaluations_${limitCount}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("EvaluationAPI: Loading recent evaluations...");
      
      const tenantId = await this.getCurrentTenantId();
      
      // 最近の評価を取得
      const recentQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId),
        orderBy("updatedAt", "desc"),
        limit(limitCount)
      );

      const recentSnapshot = await getDocs(recentQuery);
      const recentEvaluations = [];

      recentSnapshot.forEach((doc) => {
        recentEvaluations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      this.setCache(cacheKey, recentEvaluations, 60000); // 1分キャッシュ
      console.log("EvaluationAPI: Recent evaluations loaded:", recentEvaluations.length);
      return recentEvaluations;

    } catch (error) {
      console.error("EvaluationAPI: Error loading recent evaluations:", error);
      return []; // エラー時は空配列を返す
    }
  }

  /**
   * 評価チャートデータを取得（実際の評価データから生成）
   */
  async getEvaluationChartData(userId = null) {
    try {
      const cacheKey = `evaluation_chart_${userId || 'current'}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("EvaluationAPI: Loading evaluation chart data from real data...");

      const tenantId = await this.getCurrentTenantId();
      const currentUser = this.auth.currentUser;
      const targetUserId = userId || currentUser?.uid;

      // 完了済みの評価を取得
      let evaluationsQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId),
        where("status", "==", "completed")
      );

      // 特定ユーザーの評価を取得する場合
      if (targetUserId) {
        evaluationsQuery = query(
          collection(this.db, "evaluations"),
          where("tenantId", "==", tenantId),
          where("targetUserId", "==", targetUserId),
          where("status", "==", "completed")
        );
      }

      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      const evaluations = evaluationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`EvaluationAPI: Found ${evaluations.length} completed evaluations for chart`);

      if (evaluations.length === 0) {
        // 評価データがない場合は空のチャートデータを返す
        return {
          labels: [],
          datasets: []
        };
      }

      // 評価項目を収集（全評価から一意の項目を抽出）
      const criteriaSet = new Set();
      evaluations.forEach(evaluation => {
        if (evaluation.scores && typeof evaluation.scores === 'object') {
          Object.keys(evaluation.scores).forEach(key => criteriaSet.add(key));
        }
      });

      const criteria = Array.from(criteriaSet);

      if (criteria.length === 0) {
        console.warn("EvaluationAPI: No evaluation criteria found");
        return {
          labels: [],
          datasets: []
        };
      }

      // 日本語ラベルマッピング
      const labelMapping = {
        technical_skills: '技術力',
        communication: 'コミュニケーション',
        teamwork: 'チームワーク',
        problem_solving: '問題解決',
        safety_awareness: '安全意識',
        leadership: 'リーダーシップ',
        work_quality: '作業品質',
        efficiency: '効率性',
        reliability: '信頼性',
        initiative: '主体性'
      };

      const labels = criteria.map(c => labelMapping[c] || c);

      // ユーザー個人の平均スコアを計算
      const userScores = criteria.map(criterion => {
        const scores = evaluations
          .map(e => e.scores && e.scores[criterion] ? parseFloat(e.scores[criterion]) : null)
          .filter(score => score !== null && !isNaN(score));

        return scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;
      });

      // 全体平均を計算（組織全体の評価から）
      let allEvaluationsQuery = query(
        collection(this.db, "evaluations"),
        where("tenantId", "==", tenantId),
        where("status", "==", "completed")
      );

      const allEvaluationsSnapshot = await getDocs(allEvaluationsQuery);
      const allEvaluations = allEvaluationsSnapshot.docs.map(doc => doc.data());

      const organizationScores = criteria.map(criterion => {
        const scores = allEvaluations
          .map(e => e.scores && e.scores[criterion] ? parseFloat(e.scores[criterion]) : null)
          .filter(score => score !== null && !isNaN(score));

        return scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;
      });

      const chartData = {
        labels: labels,
        datasets: [{
          label: targetUserId ? 'あなたの評価' : '組織平均',
          data: userScores,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      };

      // ユーザー指定時は組織平均も追加
      if (targetUserId && allEvaluations.length > evaluations.length) {
        chartData.datasets.push({
          label: '組織平均',
          data: organizationScores,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        });
      }

      this.setCache(cacheKey, chartData, 300000); // 5分キャッシュ
      console.log("EvaluationAPI: Chart data loaded from real evaluations");
      return chartData;

    } catch (error) {
      console.error("EvaluationAPI: Error loading chart data:", error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * 評価統計を取得
   */
  async getEvaluationStats() {
    try {
      const cacheKey = 'evaluation_stats';
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const tenantId = await this.getCurrentTenantId();

      // 評価データを取得
      const evaluationsSnapshot = await getDocs(
        query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId))
      );

      const stats = {
        total: evaluationsSnapshot.size,
        byStatus: {},
        completionRate: 0,
        averageScore: 0
      };

      let completedCount = 0;
      let totalScore = 0;
      let scoredEvaluations = 0;

      evaluationsSnapshot.forEach(doc => {
        const evalData = doc.data();
        
        // ステータス別集計
        const status = evalData.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        if (evalData.status === 'completed') {
          completedCount++;
          
          // 平均スコア計算（総合スコアがある場合）
          if (evalData.totalScore) {
            totalScore += evalData.totalScore;
            scoredEvaluations++;
          }
        }
      });

      stats.completionRate = stats.total > 0 ? (completedCount / stats.total) * 100 : 0;
      stats.averageScore = scoredEvaluations > 0 ? totalScore / scoredEvaluations : 0;

      this.setCache(cacheKey, stats, 300000); // 5分キャッシュ
      return stats;

    } catch (error) {
      throw this.handleError(error, '評価統計の取得');
    }
  }

  /**
   * 評価検索
   */
  async searchEvaluations(searchTerm, filters = {}) {
    try {
      const allEvaluations = await this.getEvaluations(filters);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return allEvaluations;
      }

      const term = searchTerm.toLowerCase().trim();
      
      return allEvaluations.filter(evaluation => 
        evaluation.targetUserName?.toLowerCase().includes(term) ||
        evaluation.evaluatorName?.toLowerCase().includes(term) ||
        evaluation.periodName?.toLowerCase().includes(term) ||
        evaluation.comments?.toLowerCase().includes(term)
      );

    } catch (error) {
      throw this.handleError(error, '評価検索');
    }
  }
}