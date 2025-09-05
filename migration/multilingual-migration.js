/**
 * Multilingual Data Migration Script
 * 多言語データ移行スクリプト
 */
import { MultilingualAPI } from '../api/multilingual-api.js';
import { INITIAL_I18N_DATA } from '../database-schema-i18n.js';

export class MultilingualMigration {
  constructor(app) {
    this.app = app;
    this.api = app.api;
    this.multilingualAPI = new MultilingualAPI(app);
  }

  /**
   * 完全な多言語移行プロセス
   */
  async performFullMigration() {
    try {
      console.log('Starting multilingual data migration...');
      
      const migrationResults = {
        categories: { migrated: 0, errors: [] },
        jobTypes: { migrated: 0, errors: [] },
        evaluationItems: { migrated: 0, errors: [] },
        evaluationPeriods: { migrated: 0, errors: [] }
      };

      // 1. カテゴリの移行
      await this.migrateCategoriesData(migrationResults.categories);
      
      // 2. 職種の移行
      await this.migrateJobTypesData(migrationResults.jobTypes);
      
      // 3. 評価項目の移行
      await this.migrateEvaluationItemsData(migrationResults.evaluationItems);
      
      // 4. 評価期間の移行
      await this.migrateEvaluationPeriodsData(migrationResults.evaluationPeriods);

      console.log('Migration completed:', migrationResults);
      return {
        success: true,
        results: migrationResults,
        message: 'Multilingual data migration completed successfully'
      };
      
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Multilingual data migration failed'
      };
    }
  }

  /**
   * カテゴリデータの移行
   */
  async migrateCategoriesData(results) {
    try {
      // 初期データからカテゴリを移行
      for (const category of INITIAL_I18N_DATA.categories) {
        try {
          await this.multilingualAPI.saveCategoryI18n(category.categoryId, category.translations);
          results.migrated++;
          console.log(`Migrated category: ${category.categoryId}`);
        } catch (error) {
          results.errors.push({
            type: 'category',
            id: category.categoryId,
            error: error.message
          });
          console.error(`Failed to migrate category ${category.categoryId}:`, error);
        }
      }
      
      // 既存のFirestoreデータがある場合の移行処理
      await this.migrateExistingCategories(results);
      
    } catch (error) {
      console.error('Error migrating categories:', error);
      throw error;
    }
  }

  /**
   * 既存のカテゴリデータの移行
   */
  async migrateExistingCategories(results) {
    try {
      // Firestoreの既存カテゴリコレクションを確認
      // この部分は既存のデータ構造に応じて実装が必要
      
      // 例: categories コレクションが存在する場合
      /*
      const categoriesSnapshot = await getDocs(collection(this.api.db, 'categories'));
      
      categoriesSnapshot.forEach(async (doc) => {
        const categoryData = doc.data();
        const categoryId = doc.id;
        
        // 既存データを多言語形式に変換
        const translations = {
          ja: {
            categoryName: categoryData.name || categoryData.categoryName,
            categoryDescription: categoryData.description || '',
            displayOrder: categoryData.order || 0
          },
          en: {
            categoryName: await this.translateText(categoryData.name, 'ja', 'en'),
            categoryDescription: await this.translateText(categoryData.description, 'ja', 'en'),
            displayOrder: categoryData.order || 0
          },
          vi: {
            categoryName: await this.translateText(categoryData.name, 'ja', 'vi'),
            categoryDescription: await this.translateText(categoryData.description, 'ja', 'vi'),
            displayOrder: categoryData.order || 0
          }
        };
        
        try {
          await this.multilingualAPI.saveCategoryI18n(categoryId, translations);
          results.migrated++;
        } catch (error) {
          results.errors.push({
            type: 'existing_category',
            id: categoryId,
            error: error.message
          });
        }
      });
      */
      
    } catch (error) {
      console.error('Error migrating existing categories:', error);
    }
  }

  /**
   * 職種データの移行
   */
  async migrateJobTypesData(results) {
    try {
      // 初期データから職種を移行
      for (const jobType of INITIAL_I18N_DATA.jobTypes) {
        try {
          await this.multilingualAPI.saveJobTypeI18n(jobType.jobTypeId, jobType.translations);
          results.migrated++;
          console.log(`Migrated job type: ${jobType.jobTypeId}`);
        } catch (error) {
          results.errors.push({
            type: 'jobType',
            id: jobType.jobTypeId,
            error: error.message
          });
          console.error(`Failed to migrate job type ${jobType.jobTypeId}:`, error);
        }
      }
      
      // 既存のFirestoreデータがある場合の移行処理
      await this.migrateExistingJobTypes(results);
      
    } catch (error) {
      console.error('Error migrating job types:', error);
      throw error;
    }
  }

  /**
   * 既存の職種データの移行
   */
  async migrateExistingJobTypes(results) {
    try {
      // この部分は既存のデータ構造に応じて実装
      console.log('Migrating existing job types...');
    } catch (error) {
      console.error('Error migrating existing job types:', error);
    }
  }

  /**
   * 評価項目データの移行
   */
  async migrateEvaluationItemsData(results) {
    try {
      // 既存の評価項目データを多言語化
      // この部分は既存のデータ構造に応じて実装が必要
      
      // サンプル評価項目データ
      const sampleEvaluationItems = [
        {
          itemId: 'technical_skill_basic',
          translations: {
            ja: { 
              categoryName: '技術力', 
              itemName: '基礎技術力', 
              itemDescription: '業務に必要な基本的な技術知識と技能',
              sortOrder: 1
            },
            en: { 
              categoryName: 'Technical Skills', 
              itemName: 'Basic Technical Skills', 
              itemDescription: 'Basic technical knowledge and skills required for work',
              sortOrder: 1
            },
            vi: { 
              categoryName: 'Kỹ năng kỹ thuật', 
              itemName: 'Kỹ năng kỹ thuật cơ bản', 
              itemDescription: 'Kiến thức và kỹ năng kỹ thuật cơ bản cần thiết cho công việc',
              sortOrder: 1
            }
          }
        },
        {
          itemId: 'communication_teamwork',
          translations: {
            ja: { 
              categoryName: 'コミュニケーション', 
              itemName: 'チームワーク', 
              itemDescription: 'チームメンバーとの協調性と連携能力',
              sortOrder: 2
            },
            en: { 
              categoryName: 'Communication', 
              itemName: 'Teamwork', 
              itemDescription: 'Cooperation and collaboration skills with team members',
              sortOrder: 2
            },
            vi: { 
              categoryName: 'Giao tiếp', 
              itemName: 'Làm việc nhóm', 
              itemDescription: 'Khả năng hợp tác và phối hợp với các thành viên trong nhóm',
              sortOrder: 2
            }
          }
        }
      ];
      
      for (const item of sampleEvaluationItems) {
        try {
          await this.multilingualAPI.saveEvaluationItemI18n(item.itemId, item.translations);
          results.migrated++;
          console.log(`Migrated evaluation item: ${item.itemId}`);
        } catch (error) {
          results.errors.push({
            type: 'evaluationItem',
            id: item.itemId,
            error: error.message
          });
          console.error(`Failed to migrate evaluation item ${item.itemId}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Error migrating evaluation items:', error);
      throw error;
    }
  }

  /**
   * 評価期間データの移行
   */
  async migrateEvaluationPeriodsData(results) {
    try {
      // サンプル評価期間データ
      const samplePeriods = [
        {
          periodId: 'period_2024_q1',
          translations: {
            ja: { 
              periodName: '2024年度第1四半期', 
              periodDescription: '2024年4月-6月の評価期間'
            },
            en: { 
              periodName: '2024 Q1', 
              periodDescription: 'Evaluation period for April-June 2024'
            },
            vi: { 
              periodName: 'Quý 1 năm 2024', 
              periodDescription: 'Kỳ đánh giá từ tháng 4-6 năm 2024'
            }
          }
        },
        {
          periodId: 'period_2024_q2',
          translations: {
            ja: { 
              periodName: '2024年度第2四半期', 
              periodDescription: '2024年7月-9月の評価期間'
            },
            en: { 
              periodName: '2024 Q2', 
              periodDescription: 'Evaluation period for July-September 2024'
            },
            vi: { 
              periodName: 'Quý 2 năm 2024', 
              periodDescription: 'Kỳ đánh giá từ tháng 7-9 năm 2024'
            }
          }
        }
      ];
      
      for (const period of samplePeriods) {
        try {
          await this.multilingualAPI.saveEvaluationPeriodI18n(period.periodId, period.translations);
          results.migrated++;
          console.log(`Migrated evaluation period: ${period.periodId}`);
        } catch (error) {
          results.errors.push({
            type: 'evaluationPeriod',
            id: period.periodId,
            error: error.message
          });
          console.error(`Failed to migrate evaluation period ${period.periodId}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Error migrating evaluation periods:', error);
      throw error;
    }
  }

  /**
   * テキスト翻訳（将来のPhase 3で実装予定）
   */
  async translateText(text, sourceLang, targetLang) {
    // Phase 3で自動翻訳APIを実装する予定
    // 現在は簡単な置換またはデフォルト値を返す
    
    const basicTranslations = {
      'ja_to_en': {
        '技術力': 'Technical Skills',
        'コミュニケーション': 'Communication',
        'リーダーシップ': 'Leadership',
        '問題解決': 'Problem Solving'
      },
      'ja_to_vi': {
        '技術力': 'Kỹ năng kỹ thuật',
        'コミュニケーション': 'Giao tiếp',
        'リーダーシップ': 'Khả năng lãnh đạo',
        '問題解決': 'Giải quyết vấn đề'
      }
    };
    
    const translationKey = `${sourceLang}_to_${targetLang}`;
    const translations = basicTranslations[translationKey];
    
    if (translations && translations[text]) {
      return translations[text];
    }
    
    // 翻訳が見つからない場合は元のテキストを返す
    return text;
  }

  /**
   * 移行状況の確認
   */
  async checkMigrationStatus() {
    try {
      const status = {
        categories: await this.multilingualAPI.getCategoriesI18n('ja'),
        jobTypes: await this.multilingualAPI.getJobTypesI18n('ja'),
        evaluationItems: await this.multilingualAPI.getEvaluationItemsI18n('ja'),
        evaluationPeriods: await this.multilingualAPI.getEvaluationPeriodsI18n('ja')
      };
      
      return {
        success: true,
        status: {
          categoriesCount: status.categories.length,
          jobTypesCount: status.jobTypes.length,
          evaluationItemsCount: status.evaluationItems.length,
          evaluationPeriodsCount: status.evaluationPeriods.length
        }
      };
      
    } catch (error) {
      console.error('Error checking migration status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}