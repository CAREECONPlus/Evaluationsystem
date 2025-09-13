/**
 * Multilingual API Module
 * 多言語対応API モジュール
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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { 
  EVALUATION_ITEMS_I18N_SCHEMA,
  CATEGORIES_I18N_SCHEMA,
  JOB_TYPES_I18N_SCHEMA,
  EVALUATION_PERIODS_I18N_SCHEMA,
  INITIAL_I18N_DATA,
  validateI18nData
} from '../database-schema-i18n.js';

export class MultilingualAPI {
  constructor(app) {
    this.app = app;
    this.auth = app.auth;

    // 緊急モード時はFirestoreを初期化しない
    if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || app.auth.useTemporaryAuth) {
      console.log("MultilingualAPI: Emergency mode detected - skipping Firestore initialization");
      this.db = null;
    } else {
      this.db = getFirestore(app.auth.firebaseApp);
    }

    this.supportedLanguages = ['ja', 'en', 'vi'];
  }

  /**
   * テナントIDを取得
   */
  async getTenantId() {
    // 一時認証システム使用時の対応
    if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || this.app.currentUser?.isTemp) {
      return this.app.currentUser?.tenantId || 'demo-tenant';
    }

    const currentUser = this.auth.user || this.auth.currentUser || this.app.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return currentUser.tenantId || 'default';
  }

  // ===== 評価項目多言語管理 =====

  /**
   * 評価項目を多言語で取得
   */
  async getEvaluationItemsI18n(languageCode = 'ja', categoryName = null) {
    try {
      const tenantId = await this.getTenantId();
      
      let q = query(
        collection(this.db, EVALUATION_ITEMS_I18N_SCHEMA.collection),
        where('languageCode', '==', languageCode),
        where('tenantId', '==', tenantId),
        orderBy('sortOrder')
      );

      if (categoryName) {
        q = query(
          collection(this.db, EVALUATION_ITEMS_I18N_SCHEMA.collection),
          where('languageCode', '==', languageCode),
          where('tenantId', '==', tenantId),
          where('categoryName', '==', categoryName),
          orderBy('sortOrder')
        );
      }

      const querySnapshot = await getDocs(q);
      const items = [];
      
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return items;
    } catch (error) {
      console.error('Error getting evaluation items i18n:', error);
      throw error;
    }
  }

  /**
   * 評価項目を多言語で保存
   */
  async saveEvaluationItemI18n(itemId, translations) {
    try {
      const tenantId = await this.getTenantId();
      const batch = writeBatch(this.db);
      
      for (const languageCode of this.supportedLanguages) {
        if (translations[languageCode]) {
          const docRef = doc(this.db, EVALUATION_ITEMS_I18N_SCHEMA.collection, `${itemId}_${languageCode}`);
          const data = {
            itemId,
            languageCode,
            tenantId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...translations[languageCode]
          };

          // データ検証
          const errors = validateI18nData(data, EVALUATION_ITEMS_I18N_SCHEMA);
          if (errors.length > 0) {
            throw new Error(`Validation errors for ${languageCode}: ${errors.join(', ')}`);
          }

          batch.set(docRef, data);
        }
      }

      await batch.commit();
      return { success: true, itemId };
    } catch (error) {
      console.error('Error saving evaluation item i18n:', error);
      throw error;
    }
  }

  // ===== カテゴリ多言語管理 =====

  /**
   * カテゴリを多言語で取得
   */
  async getCategoriesI18n(languageCode = 'ja') {
    try {
      const tenantId = await this.getTenantId();
      
      const q = query(
        collection(this.db, CATEGORIES_I18N_SCHEMA.collection),
        where('languageCode', '==', languageCode),
        where('tenantId', '==', tenantId),
        orderBy('displayOrder')
      );

      const querySnapshot = await getDocs(q);
      const categories = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return categories;
    } catch (error) {
      console.error('Error getting categories i18n:', error);
      throw error;
    }
  }

  /**
   * カテゴリを多言語で保存
   */
  async saveCategoryI18n(categoryId, translations) {
    try {
      const tenantId = await this.getTenantId();
      const batch = writeBatch(this.db);
      
      for (const languageCode of this.supportedLanguages) {
        if (translations[languageCode]) {
          const docRef = doc(this.db, CATEGORIES_I18N_SCHEMA.collection, `${categoryId}_${languageCode}`);
          const data = {
            categoryId,
            languageCode,
            tenantId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...translations[languageCode]
          };

          // データ検証
          const errors = validateI18nData(data, CATEGORIES_I18N_SCHEMA);
          if (errors.length > 0) {
            throw new Error(`Validation errors for ${languageCode}: ${errors.join(', ')}`);
          }

          batch.set(docRef, data);
        }
      }

      await batch.commit();
      return { success: true, categoryId };
    } catch (error) {
      console.error('Error saving category i18n:', error);
      throw error;
    }
  }

  // ===== 職種多言語管理 =====

  /**
   * 職種を多言語で取得
   */
  async getJobTypesI18n(languageCode = 'ja') {
    try {
      const tenantId = await this.getTenantId();
      
      const q = query(
        collection(this.db, JOB_TYPES_I18N_SCHEMA.collection),
        where('languageCode', '==', languageCode),
        where('tenantId', '==', tenantId)
      );

      const querySnapshot = await getDocs(q);
      const jobTypes = [];
      
      querySnapshot.forEach((doc) => {
        jobTypes.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return jobTypes;
    } catch (error) {
      console.error('Error getting job types i18n:', error);
      throw error;
    }
  }

  /**
   * 職種を多言語で保存
   */
  async saveJobTypeI18n(jobTypeId, translations) {
    try {
      const tenantId = await this.getTenantId();
      const batch = writeBatch(this.db);
      
      for (const languageCode of this.supportedLanguages) {
        if (translations[languageCode]) {
          const docRef = doc(this.db, JOB_TYPES_I18N_SCHEMA.collection, `${jobTypeId}_${languageCode}`);
          const data = {
            jobTypeId,
            languageCode,
            tenantId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...translations[languageCode]
          };

          // データ検証
          const errors = validateI18nData(data, JOB_TYPES_I18N_SCHEMA);
          if (errors.length > 0) {
            throw new Error(`Validation errors for ${languageCode}: ${errors.join(', ')}`);
          }

          batch.set(docRef, data);
        }
      }

      await batch.commit();
      return { success: true, jobTypeId };
    } catch (error) {
      console.error('Error saving job type i18n:', error);
      throw error;
    }
  }

  // ===== 評価期間多言語管理 =====

  /**
   * 評価期間を多言語で取得
   */
  async getEvaluationPeriodsI18n(languageCode = 'ja') {
    try {
      const tenantId = await this.getTenantId();
      
      const q = query(
        collection(this.db, EVALUATION_PERIODS_I18N_SCHEMA.collection),
        where('languageCode', '==', languageCode),
        where('tenantId', '==', tenantId)
      );

      const querySnapshot = await getDocs(q);
      const periods = [];
      
      querySnapshot.forEach((doc) => {
        periods.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return periods;
    } catch (error) {
      console.error('Error getting evaluation periods i18n:', error);
      throw error;
    }
  }

  /**
   * 評価期間を多言語で保存
   */
  async saveEvaluationPeriodI18n(periodId, translations) {
    try {
      const tenantId = await this.getTenantId();
      const batch = writeBatch(this.db);
      
      for (const languageCode of this.supportedLanguages) {
        if (translations[languageCode]) {
          const docRef = doc(this.db, EVALUATION_PERIODS_I18N_SCHEMA.collection, `${periodId}_${languageCode}`);
          const data = {
            periodId,
            languageCode,
            tenantId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...translations[languageCode]
          };

          // データ検証
          const errors = validateI18nData(data, EVALUATION_PERIODS_I18N_SCHEMA);
          if (errors.length > 0) {
            throw new Error(`Validation errors for ${languageCode}: ${errors.join(', ')}`);
          }

          batch.set(docRef, data);
        }
      }

      await batch.commit();
      return { success: true, periodId };
    } catch (error) {
      console.error('Error saving evaluation period i18n:', error);
      throw error;
    }
  }

  // ===== データ移行・初期化 =====

  /**
   * 初期多言語データのセットアップ
   */
  async setupInitialI18nData() {
    try {
      const tenantId = await this.getTenantId();
      
      // カテゴリの初期化
      for (const category of INITIAL_I18N_DATA.categories) {
        await this.saveCategoryI18n(category.categoryId, category.translations);
      }

      // 職種の初期化
      for (const jobType of INITIAL_I18N_DATA.jobTypes) {
        await this.saveJobTypeI18n(jobType.jobTypeId, jobType.translations);
      }

      return { success: true, message: 'Initial i18n data setup completed' };
    } catch (error) {
      console.error('Error setting up initial i18n data:', error);
      throw error;
    }
  }

  /**
   * 既存データの多言語移行
   */
  async migrateExistingData() {
    try {
      console.log('Migration process started...');
      
      // 移行クラスを動的にインポート
      const { MultilingualMigration } = await import('../migration/multilingual-migration.js');
      const migration = new MultilingualMigration(this.app);
      
      // 完全移行を実行
      const result = await migration.performFullMigration();
      
      if (result.success) {
        return { 
          success: true, 
          message: 'Data migration completed successfully',
          results: result.results
        };
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('Error migrating existing data:', error);
      throw error;
    }
  }

  // ===== ユーティリティメソッド =====

  /**
   * 多言語データの一括取得
   */
  async getAllI18nData(languageCode = 'ja') {
    try {
      const [categories, jobTypes, evaluationItems, evaluationPeriods] = await Promise.all([
        this.getCategoriesI18n(languageCode),
        this.getJobTypesI18n(languageCode),
        this.getEvaluationItemsI18n(languageCode),
        this.getEvaluationPeriodsI18n(languageCode)
      ]);

      return {
        categories,
        jobTypes,
        evaluationItems,
        evaluationPeriods,
        language: languageCode
      };
    } catch (error) {
      console.error('Error getting all i18n data:', error);
      throw error;
    }
  }

  /**
   * サポート言語の取得
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * 言語コードの検証
   */
  validateLanguageCode(languageCode) {
    return this.supportedLanguages.includes(languageCode);
  }
}