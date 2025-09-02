/**
 * 設定管理API
 * システム設定関連の全操作を担当
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
  getDocs,
  writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { BaseAPI } from "./base-api.js";
import { createError } from "../utils/error-handler.js";

export class SettingsAPI extends BaseAPI {
  constructor(app) {
    super(app);
  }

  /**
   * テナントの設定データを取得
   */
  async getSettings() {
    try {
      const cacheKey = 'tenant_settings';
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      console.log("SettingsAPI: Loading settings...");
      
      const tenantId = await this.getCurrentTenantId();
      console.log("SettingsAPI: Loading settings for tenant:", tenantId);

      console.log("SettingsAPI: Fetching settings data...");

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

      const settings = {
        jobTypes,
        periods,
        structures,
        tenantId
      };

      this.setCache(cacheKey, settings);

      console.log("SettingsAPI: Settings loaded successfully:");
      console.log("- Job types:", jobTypes.length);
      console.log("- Periods:", periods.length);
      console.log("- Structures:", Object.keys(structures).length);

      return settings;

    } catch (error) {
      throw this.handleError(error, '設定データの読み込み');
    }
  }

  /**
   * 設定を保存
   */
  async saveSettings(settings) {
    try {
      console.log("SettingsAPI: Saving settings...", settings);

      const tenantId = await this.getCurrentTenantId();

      // 管理者権限チェック
      this.checkPermission(['admin'], '設定の保存');

      const batch = writeBatch(this.db);

      // 職種を保存
      if (settings.jobTypes && Array.isArray(settings.jobTypes)) {
        for (const jobType of settings.jobTypes) {
          const jobTypeRef = doc(this.db, "targetJobTypes", jobType.id);
          batch.set(jobTypeRef, {
            ...this.cleanData(jobType),
            tenantId: tenantId,
            updatedAt: this.serverTimestamp()
          });
        }
      }

      // 評価期間を保存
      if (settings.periods && Array.isArray(settings.periods)) {
        for (const period of settings.periods) {
          const periodRef = doc(this.db, "evaluationPeriods", period.id);
          batch.set(periodRef, {
            ...this.cleanData(period),
            tenantId: tenantId,
            updatedAt: this.serverTimestamp()
          });
        }
      }

      // 評価構造を保存
      if (settings.structures && typeof settings.structures === 'object') {
        for (const [jobTypeId, structure] of Object.entries(settings.structures)) {
          const structureRef = doc(this.db, "evaluationStructures", structure.id);
          batch.set(structureRef, {
            ...this.cleanData(structure),
            jobTypeId: jobTypeId,
            tenantId: tenantId,
            updatedAt: this.serverTimestamp()
          });
        }
      }

      await batch.commit();

      // キャッシュをクリア
      this.clearCache('tenant_settings');

      console.log("SettingsAPI: Settings saved successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '設定の保存');
    }
  }

  /**
   * 職種を作成/更新
   */
  async saveJobType(jobTypeData) {
    try {
      console.log("SettingsAPI: Saving job type:", jobTypeData);

      const tenantId = await this.getCurrentTenantId();

      // 管理者権限チェック
      this.checkPermission(['admin'], '職種の保存');

      // 必須フィールドの検証
      this.validateRequired(jobTypeData, ['name']);

      const data = this.cleanData({
        ...jobTypeData,
        tenantId: tenantId,
        updatedAt: this.serverTimestamp()
      });

      if (jobTypeData.id) {
        // 更新
        await updateDoc(doc(this.db, "targetJobTypes", jobTypeData.id), data);
      } else {
        // 新規作成
        data.createdAt = this.serverTimestamp();
        const docRef = doc(collection(this.db, "targetJobTypes"));
        await setDoc(docRef, { ...data, id: docRef.id });
      }

      // キャッシュをクリア
      this.clearCache('tenant_settings');

      console.log("SettingsAPI: Job type saved successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '職種の保存');
    }
  }

  /**
   * 評価期間を作成/更新
   */
  async saveEvaluationPeriod(periodData) {
    try {
      console.log("SettingsAPI: Saving evaluation period:", periodData);

      const tenantId = await this.getCurrentTenantId();

      // 管理者権限チェック
      this.checkPermission(['admin'], '評価期間の保存');

      // 必須フィールドの検証
      this.validateRequired(periodData, ['name', 'startDate', 'endDate']);

      // 日付の検証
      const startDate = new Date(periodData.startDate);
      const endDate = new Date(periodData.endDate);
      
      if (startDate >= endDate) {
        throw createError.validation('dates', '開始日は終了日より前である必要があります');
      }

      const data = this.cleanData({
        ...periodData,
        tenantId: tenantId,
        updatedAt: this.serverTimestamp()
      });

      if (periodData.id) {
        // 更新
        await updateDoc(doc(this.db, "evaluationPeriods", periodData.id), data);
      } else {
        // 新規作成
        data.createdAt = this.serverTimestamp();
        const docRef = doc(collection(this.db, "evaluationPeriods"));
        await setDoc(docRef, { ...data, id: docRef.id });
      }

      // キャッシュをクリア
      this.clearCache('tenant_settings');

      console.log("SettingsAPI: Evaluation period saved successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '評価期間の保存');
    }
  }

  /**
   * 評価構造を作成/更新
   */
  async saveEvaluationStructure(structureData) {
    try {
      console.log("SettingsAPI: Saving evaluation structure:", structureData);

      const tenantId = await this.getCurrentTenantId();

      // 管理者権限チェック
      this.checkPermission(['admin'], '評価構造の保存');

      // 必須フィールドの検証
      this.validateRequired(structureData, ['jobTypeId']);

      const data = this.cleanData({
        ...structureData,
        tenantId: tenantId,
        updatedAt: this.serverTimestamp()
      });

      if (structureData.id) {
        // 更新
        await updateDoc(doc(this.db, "evaluationStructures", structureData.id), data);
      } else {
        // 新規作成
        data.createdAt = this.serverTimestamp();
        const docRef = doc(collection(this.db, "evaluationStructures"));
        await setDoc(docRef, { ...data, id: docRef.id });
      }

      // キャッシュをクリア
      this.clearCache('tenant_settings');

      console.log("SettingsAPI: Evaluation structure saved successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '評価構造の保存');
    }
  }

  /**
   * 職種を削除
   */
  async deleteJobType(jobTypeId) {
    try {
      console.log("SettingsAPI: Deleting job type:", jobTypeId);

      const tenantId = await this.getCurrentTenantId();

      // 管理者権限チェック
      this.checkPermission(['admin'], '職種の削除');

      // 存在確認
      await this.checkExists('targetJobTypes', jobTypeId, '職種');

      // この職種を使用しているユーザーがいないかチェック
      const usersSnapshot = await getDocs(
        query(
          collection(this.db, 'users'),
          where('tenantId', '==', tenantId),
          where('jobTypeIds', 'array-contains', jobTypeId)
        )
      );

      if (!usersSnapshot.empty) {
        throw createError.validation('jobType', 'この職種は使用中のため削除できません');
      }

      // 関連する評価構造も削除
      const structureSnapshot = await getDocs(
        query(
          collection(this.db, 'evaluationStructures'),
          where('jobTypeId', '==', jobTypeId)
        )
      );

      const batch = writeBatch(this.db);
      structureSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      batch.delete(doc(this.db, 'targetJobTypes', jobTypeId));

      await batch.commit();

      // キャッシュをクリア
      this.clearCache('tenant_settings');

      console.log("SettingsAPI: Job type deleted successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, '職種の削除');
    }
  }

  /**
   * システム設定を取得
   */
  async getSystemSettings() {
    try {
      const cacheKey = 'system_settings';
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      // デフォルトシステム設定
      const systemSettings = {
        maxGoalsPerUser: 5,
        evaluationScaleMin: 1,
        evaluationScaleMax: 5,
        defaultLanguage: 'ja',
        sessionTimeoutMinutes: 60,
        maxFileUploadSizeMB: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        notificationSettings: {
          emailEnabled: true,
          pushEnabled: false,
          reminderDays: [7, 3, 1]
        }
      };

      this.setCache(cacheKey, systemSettings, 3600000); // 1時間キャッシュ
      return systemSettings;

    } catch (error) {
      throw this.handleError(error, 'システム設定の取得');
    }
  }

  /**
   * テナント情報を取得
   */
  async getTenant(tenantId = null) {
    try {
      const targetTenantId = tenantId || await this.getCurrentTenantId();
      const cacheKey = `tenant_${targetTenantId}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const tenantDoc = await getDoc(doc(this.db, "tenants", targetTenantId));
      
      if (!tenantDoc.exists()) {
        throw createError.notFound('テナント', targetTenantId);
      }

      const tenant = {
        id: tenantDoc.id,
        ...tenantDoc.data()
      };

      this.setCache(cacheKey, tenant);
      return tenant;

    } catch (error) {
      throw this.handleError(error, 'テナント情報の取得');
    }
  }

  /**
   * テナントステータスを更新
   */
  async updateTenantStatus(tenantId, status) {
    try {
      console.log("SettingsAPI: Updating tenant status:", tenantId, status);

      // 開発者権限チェック
      this.checkPermission(['developer'], 'テナントステータスの更新');

      // ステータス値の検証
      const validStatuses = ['active', 'suspended', 'pending', 'deleted'];
      if (!validStatuses.includes(status)) {
        throw createError.validation('status', `無効なステータス: ${status}`);
      }

      await updateDoc(doc(this.db, "tenants", tenantId), {
        status: status,
        updatedAt: this.serverTimestamp()
      });

      // キャッシュをクリア
      this.clearCache(`tenant_${tenantId}`);

      console.log("SettingsAPI: Tenant status updated successfully");
      return { success: true };

    } catch (error) {
      throw this.handleError(error, 'テナントステータスの更新');
    }
  }

  /**
   * データベース接続テスト
   */
  async testConnection() {
    try {
      console.log("SettingsAPI: Testing database connection...");
      
      // テストコレクションに読み書きテスト
      const testRef = doc(this.db, "_test", "connection_test");
      await setDoc(testRef, {
        timestamp: this.serverTimestamp(),
        test: true
      });

      const testDoc = await getDoc(testRef);
      
      if (testDoc.exists()) {
        console.log("SettingsAPI: Database connection test successful");
        await deleteDoc(testRef); // クリーンアップ
        return { success: true, message: 'データベース接続は正常です' };
      } else {
        console.error("SettingsAPI: Database connection test failed");
        return { success: false, message: 'データベース接続テストに失敗しました' };
      }

    } catch (error) {
      console.error("SettingsAPI: Database connection test error:", error);
      throw this.handleError(error, 'データベース接続テスト');
    }
  }

  /**
   * 設定のバックアップを作成
   */
  async backupSettings() {
    try {
      console.log("SettingsAPI: Creating settings backup...");

      // 管理者権限チェック
      this.checkPermission(['admin'], '設定のバックアップ');

      const settings = await this.getSettings();
      const backup = {
        ...settings,
        backupDate: new Date().toISOString(),
        version: '1.0.0'
      };

      console.log("SettingsAPI: Settings backup created");
      return backup;

    } catch (error) {
      throw this.handleError(error, '設定のバックアップ');
    }
  }

  /**
   * 設定統計を取得
   */
  async getSettingsStats() {
    try {
      const settings = await this.getSettings();
      
      const stats = {
        jobTypesCount: settings.jobTypes.length,
        periodsCount: settings.periods.length,
        structuresCount: Object.keys(settings.structures).length,
        activeJobTypes: settings.jobTypes.filter(jt => jt.status === 'active').length,
        activePeriods: settings.periods.filter(p => {
          const now = new Date();
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          return now >= start && now <= end;
        }).length
      };

      return stats;

    } catch (error) {
      throw this.handleError(error, '設定統計の取得');
    }
  }
}