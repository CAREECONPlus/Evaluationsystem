/**
 * APIファクトリー
 * 機能別に分割されたAPIモジュールを統合し、既存のAPI.jsと完全に互換性のあるインターフェースを提供
 */

import { UserAPI } from "./user-api.js";
import { EvaluationAPI } from "./evaluation-api.js";
import { GoalsAPI } from "./goals-api.js";
import { SettingsAPI } from "./settings-api.js";
import { InvitationAPI } from "./invitation-api.js";
import ErrorHandler from "../utils/error-handler.js";
import { getLogger } from "../utils/logger.js";

export class API {
  constructor(app) {
    this.app = app;
    this.errorHandler = new ErrorHandler(app);
    this.logger = getLogger('APIFactory');
    
    // 機能別APIインスタンスを作成
    this.userAPI = new UserAPI(app);
    this.evaluationAPI = new EvaluationAPI(app);
    this.goalsAPI = new GoalsAPI(app);
    this.settingsAPI = new SettingsAPI(app);
    this.invitationAPI = new InvitationAPI(app);
    
    this.logger.info("Factory initialized with modular APIs");
  }

  // ===== 共通プロパティとメソッド =====
  
  get db() {
    return this.app.auth.db;
  }

  get cache() {
    return this.userAPI.cache; // 共通キャッシュを使用
  }

  serverTimestamp() {
    return this.userAPI.serverTimestamp();
  }

  handleError(error, operation = '操作') {
    return this.errorHandler.handle(error, operation);
  }

  // ===== User Management Methods =====
  // UserAPIのメソッドを直接公開
  
  async getUserProfile(uid) {
    return await this.userAPI.getUserProfile(uid);
  }

  async getCurrentUserData() {
    return await this.userAPI.getCurrentUserData();
  }

  async createUserProfile(userData) {
    return await this.userAPI.createUserProfile(userData);
  }

  async getUsers(statusFilter = null) {
    return await this.userAPI.getUsers(statusFilter);
  }

  async getActiveUsers() {
    return await this.userAPI.getActiveUsers();
  }

  async getAllUsers() {
    return await this.userAPI.getAllUsers();
  }

  async getSubordinates() {
    return await this.userAPI.getSubordinates();
  }

  async getUser(userId) {
    return await this.userAPI.getUser(userId);
  }

  async updateUser(userId, updateData) {
    return await this.userAPI.updateUser(userId, updateData);
  }

  async deleteUser(userId) {
    return await this.userAPI.deleteUser(userId);
  }

  async updateUserStatus(userId, status) {
    return await this.userAPI.updateUserStatus(userId, status);
  }

  async updateUserRole(userId, role) {
    return await this.userAPI.updateUserRole(userId, role);
  }

  // ===== Evaluation Management Methods =====
  // EvaluationAPIのメソッドを直接公開

  async getEvaluations(filters = {}) {
    return await this.evaluationAPI.getEvaluations(filters);
  }

  async getEvaluation(evaluationId) {
    return await this.evaluationAPI.getEvaluation(evaluationId);
  }

  async getEvaluationById(evaluationId) {
    return await this.evaluationAPI.getEvaluationById(evaluationId);
  }

  async saveEvaluation(evaluationData) {
    return await this.evaluationAPI.saveEvaluation(evaluationData);
  }

  async createEvaluation(evaluationData) {
    return await this.evaluationAPI.createEvaluation(evaluationData);
  }

  async updateEvaluation(evaluationId, updateData) {
    return await this.evaluationAPI.updateEvaluation(evaluationId, updateData);
  }

  async updateEvaluationStatus(evaluationId, status, metadata = {}) {
    return await this.evaluationAPI.updateEvaluationStatus(evaluationId, status, metadata);
  }

  async deleteEvaluation(evaluationId) {
    return await this.evaluationAPI.deleteEvaluation(evaluationId);
  }

  async getEvaluationHistory(evaluationId) {
    return await this.evaluationAPI.getEvaluationHistory(evaluationId);
  }

  async getEvaluationStructure(jobTypeId) {
    return await this.evaluationAPI.getEvaluationStructure(jobTypeId);
  }

  async getRecentEvaluations() {
    return await this.evaluationAPI.getRecentEvaluations();
  }

  async getEvaluationChartData() {
    return await this.evaluationAPI.getEvaluationChartData();
  }

  // ===== Goals Management Methods =====
  // GoalsAPIのメソッドを直接公開

  async getGoalsByStatus(status) {
    return await this.goalsAPI.getGoalsByStatus(status);
  }

  async getGoals(userId, periodId) {
    return await this.goalsAPI.getGoals(userId, periodId);
  }

  async saveGoals(goalsData) {
    return await this.goalsAPI.saveGoals(goalsData);
  }

  async updateGoalStatus(goalId, status, metadata = {}) {
    return await this.goalsAPI.updateGoalStatus(goalId, status, metadata);
  }

  // ===== Settings Management Methods =====
  // SettingsAPIのメソッドを直接公開

  async getSettings() {
    return await this.settingsAPI.getSettings();
  }

  async saveSettings(settings) {
    return await this.settingsAPI.saveSettings(settings);
  }

  async saveJobType(jobTypeData) {
    return await this.settingsAPI.saveJobType(jobTypeData);
  }

  async saveEvaluationPeriod(periodData) {
    return await this.settingsAPI.saveEvaluationPeriod(periodData);
  }

  async saveEvaluationStructure(structureData) {
    return await this.settingsAPI.saveEvaluationStructure(structureData);
  }

  async getTenant(tenantId) {
    return await this.settingsAPI.getTenant(tenantId);
  }

  async updateTenantStatus(tenantId, status) {
    return await this.settingsAPI.updateTenantStatus(tenantId, status);
  }

  async testConnection() {
    return await this.settingsAPI.testConnection();
  }

  // ===== Invitation Management Methods =====
  // InvitationAPIのメソッドを直接公開

  async getInvitation(token) {
    return await this.invitationAPI.getInvitation(token);
  }

  async validateInvitationCode(code) {
    return await this.invitationAPI.validateInvitationCode(code);
  }

  async markInvitationAsUsed(invitationId, userId) {
    return await this.invitationAPI.markInvitationAsUsed(invitationId, userId);
  }

  async createInvitation(invitationData) {
    return await this.invitationAPI.createInvitation(invitationData);
  }

  async createAdminInvitation(invitationData) {
    return await this.invitationAPI.createAdminInvitation(invitationData);
  }

  // ===== Dashboard Methods =====
  // ダッシュボード用の統合メソッド

  async getDashboardStats() {
    try {
      this.logger.info("Loading dashboard stats...");
      
      // 各APIから統計を並行取得
      const [userStats, evaluationStats, goalStats] = await Promise.all([
        this.userAPI.getUserStats().catch(() => ({})),
        this.evaluationAPI.getEvaluationStats().catch(() => ({})),
        this.goalsAPI.getGoalsStats().catch(() => ({}))
      ]);

      const stats = {
        // ユーザー統計
        totalUsers: userStats.total || 0,
        activeUsers: userStats.byStatus?.active || 0,
        
        // 評価統計
        totalEvaluations: evaluationStats.total || 0,
        completedEvaluations: evaluationStats.byStatus?.completed || 0,
        
        // 目標統計
        totalGoals: goalStats.total || 0,
        completedGoals: goalStats.byStatus?.completed || 0
      };

      this.logger.info("Dashboard stats loaded:", stats);
      return stats;

    } catch (error) {
      throw this.handleError(error, 'ダッシュボード統計の読み込み');
    }
  }

  // ===== Validation Methods (Legacy Compatibility) =====
  // 既存コードとの互換性のため

  validateEmail(email) {
    return this.userAPI.validateEmail(email);
  }

  validatePassword(password) {
    return this.userAPI.validatePassword(password);
  }

  validateName(name) {
    return this.userAPI.validateName(name);
  }

  validateCompanyName(companyName) {
    if (!companyName || typeof companyName !== 'string') {
      return false;
    }
    return companyName.trim().length >= 2;
  }

  // ===== Utility Methods =====
  
  /**
   * 全APIのキャッシュをクリア
   */
  clearAllCache() {
    this.userAPI.clearCache();
    this.evaluationAPI.clearCache();
    this.goalsAPI.clearCache();
    this.settingsAPI.clearCache();
    this.invitationAPI.clearCache();
  }

  /**
   * デバッグ情報を出力
   */
  debug() {
    this.logger.group('API Factory Debug Info');
    this.logger.info('User API Cache Size:', this.userAPI.cache.size);
    this.logger.info('Error Handler Stats:', this.errorHandler.getErrorStats());
    
    // 各APIのデバッグ情報
    this.userAPI.debug();
    this.evaluationAPI.debug();
    this.goalsAPI.debug();
    this.settingsAPI.debug();
    this.invitationAPI.debug();
    this.logger.groupEnd();
  }

  /**
   * API健全性チェック
   */
  async healthCheck() {
    try {
      const health = {
        database: false,
        userAPI: false,
        evaluationAPI: false,
        goalsAPI: false,
        settingsAPI: false,
        invitationAPI: false,
        timestamp: new Date().toISOString()
      };

      // データベース接続テスト
      try {
        await this.testConnection();
        health.database = true;
      } catch (error) {
        this.logger.warn('Database health check failed:', error);
      }

      // 各APIの簡単な動作チェック
      try {
        await this.getCurrentUserData();
        health.userAPI = true;
      } catch (error) {
        this.logger.warn('UserAPI health check failed:', error);
      }

      try {
        await this.getEvaluations({ limit: 1 });
        health.evaluationAPI = true;
      } catch (error) {
        this.logger.warn('EvaluationAPI health check failed:', error);
      }

      try {
        await this.goalsAPI.getGoalsStats();
        health.goalsAPI = true;
      } catch (error) {
        this.logger.warn('GoalsAPI health check failed:', error);
      }

      try {
        await this.getSettings();
        health.settingsAPI = true;
      } catch (error) {
        this.logger.warn('SettingsAPI health check failed:', error);
      }

      try {
        await this.invitationAPI.getInvitations({ limit: 1 });
        health.invitationAPI = true;
      } catch (error) {
        this.logger.warn('InvitationAPI health check failed:', error);
      }

      const healthyAPIs = Object.values(health).filter(status => status === true).length - 1; // timestampを除く
      const totalAPIs = Object.keys(health).length - 1;
      
      this.logger.info(`API Health Check: ${healthyAPIs}/${totalAPIs} APIs healthy`);
      return health;

    } catch (error) {
      this.logger.error('API health check failed:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStats() {
    return {
      errorStats: this.errorHandler.getErrorStats(),
      cacheStats: {
        userAPI: this.userAPI.cache.size,
        evaluationAPI: this.evaluationAPI.cache.size,
        goalsAPI: this.goalsAPI.cache.size,
        settingsAPI: this.settingsAPI.cache.size,
        invitationAPI: this.invitationAPI.cache.size
      }
    };
  }
}