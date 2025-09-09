/**
 * Multilingual Database Schema for Firestore
 * 多言語対応データベーススキーマ（Firestore用）
 */

/**
 * 評価項目多言語コレクション設計
 * Collection: evaluation_items_i18n
 * 
 * Document Structure:
 * {
 *   itemId: string,              // 評価項目ID
 *   languageCode: string,        // 言語コード (ja, en, vi)
 *   categoryName: string,        // カテゴリ名
 *   itemName: string,            // 項目名
 *   itemDescription: string,     // 項目説明
 *   sortOrder: number,           // 並び順
 *   createdAt: timestamp,        // 作成日時
 *   updatedAt: timestamp,        // 更新日時
 *   tenantId: string            // テナントID
 * }
 * 
 * Composite Index: itemId + languageCode + tenantId
 */
export const EVALUATION_ITEMS_I18N_SCHEMA = {
  collection: 'evaluation_items_i18n',
  fields: {
    itemId: { type: 'string', required: true },
    languageCode: { type: 'string', required: true, enum: ['ja', 'en', 'vi'] },
    categoryName: { type: 'string', required: false },
    itemName: { type: 'string', required: true },
    itemDescription: { type: 'string', required: false },
    sortOrder: { type: 'number', default: 0 },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp', required: true },
    tenantId: { type: 'string', required: true }
  },
  indexes: [
    ['itemId', 'languageCode', 'tenantId'],
    ['languageCode', 'tenantId'],
    ['categoryName', 'languageCode', 'tenantId'],
    ['sortOrder', 'languageCode', 'tenantId']
  ]
};

/**
 * カテゴリ多言語コレクション設計
 * Collection: categories_i18n
 * 
 * Document Structure:
 * {
 *   categoryId: string,          // カテゴリID
 *   languageCode: string,        // 言語コード (ja, en, vi)
 *   categoryName: string,        // カテゴリ名
 *   categoryDescription: string, // カテゴリ説明
 *   displayOrder: number,        // 表示順
 *   createdAt: timestamp,        // 作成日時
 *   updatedAt: timestamp,        // 更新日時
 *   tenantId: string            // テナントID
 * }
 * 
 * Composite Index: categoryId + languageCode + tenantId
 */
export const CATEGORIES_I18N_SCHEMA = {
  collection: 'categories_i18n',
  fields: {
    categoryId: { type: 'string', required: true },
    languageCode: { type: 'string', required: true, enum: ['ja', 'en', 'vi'] },
    categoryName: { type: 'string', required: true },
    categoryDescription: { type: 'string', required: false },
    displayOrder: { type: 'number', default: 0 },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp', required: true },
    tenantId: { type: 'string', required: true }
  },
  indexes: [
    ['categoryId', 'languageCode', 'tenantId'],
    ['languageCode', 'tenantId'],
    ['displayOrder', 'languageCode', 'tenantId']
  ]
};

/**
 * 職種多言語コレクション設計
 * Collection: job_types_i18n
 * 
 * Document Structure:
 * {
 *   jobTypeId: string,           // 職種ID
 *   languageCode: string,        // 言語コード (ja, en, vi)
 *   jobTypeName: string,         // 職種名
 *   jobTypeDescription: string,  // 職種説明
 *   createdAt: timestamp,        // 作成日時
 *   updatedAt: timestamp,        // 更新日時
 *   tenantId: string            // テナントID
 * }
 * 
 * Composite Index: jobTypeId + languageCode + tenantId
 */
export const JOB_TYPES_I18N_SCHEMA = {
  collection: 'job_types_i18n',
  fields: {
    jobTypeId: { type: 'string', required: true },
    languageCode: { type: 'string', required: true, enum: ['ja', 'en', 'vi'] },
    jobTypeName: { type: 'string', required: true },
    jobTypeDescription: { type: 'string', required: false },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp', required: true },
    tenantId: { type: 'string', required: true }
  },
  indexes: [
    ['jobTypeId', 'languageCode', 'tenantId'],
    ['languageCode', 'tenantId']
  ]
};

/**
 * 評価期間多言語コレクション設計
 * Collection: evaluation_periods_i18n
 * 
 * Document Structure:
 * {
 *   periodId: string,            // 期間ID
 *   languageCode: string,        // 言語コード (ja, en, vi)
 *   periodName: string,          // 期間名
 *   periodDescription: string,   // 期間説明
 *   createdAt: timestamp,        // 作成日時
 *   updatedAt: timestamp,        // 更新日時
 *   tenantId: string            // テナントID
 * }
 * 
 * Composite Index: periodId + languageCode + tenantId
 */
export const EVALUATION_PERIODS_I18N_SCHEMA = {
  collection: 'evaluation_periods_i18n',
  fields: {
    periodId: { type: 'string', required: true },
    languageCode: { type: 'string', required: true, enum: ['ja', 'en', 'vi'] },
    periodName: { type: 'string', required: true },
    periodDescription: { type: 'string', required: false },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp', required: true },
    tenantId: { type: 'string', required: true }
  },
  indexes: [
    ['periodId', 'languageCode', 'tenantId'],
    ['languageCode', 'tenantId']
  ]
};

/**
 * 多言語マスターデータの初期データ
 */
export const INITIAL_I18N_DATA = {
  // 評価カテゴリ
  categories: [
    {
      categoryId: 'technical_skills',
      translations: {
        ja: { categoryName: '技術力', categoryDescription: '専門技術に関する能力' },
        en: { categoryName: 'Technical Skills', categoryDescription: 'Professional technical abilities' },
        vi: { categoryName: 'Kỹ năng kỹ thuật', categoryDescription: 'Khả năng kỹ thuật chuyên môn' }
      }
    },
    {
      categoryId: 'communication',
      translations: {
        ja: { categoryName: 'コミュニケーション', categoryDescription: '意思疎通とチームワーク' },
        en: { categoryName: 'Communication', categoryDescription: 'Communication and teamwork' },
        vi: { categoryName: 'Giao tiếp', categoryDescription: 'Giao tiếp và làm việc nhóm' }
      }
    },
    {
      categoryId: 'leadership',
      translations: {
        ja: { categoryName: 'リーダーシップ', categoryDescription: 'チームを導く能力' },
        en: { categoryName: 'Leadership', categoryDescription: 'Ability to lead teams' },
        vi: { categoryName: 'Khả năng lãnh đạo', categoryDescription: 'Khả năng lãnh đạo nhóm' }
      }
    },
    {
      categoryId: 'problem_solving',
      translations: {
        ja: { categoryName: '問題解決', categoryDescription: '課題に対する解決能力' },
        en: { categoryName: 'Problem Solving', categoryDescription: 'Ability to solve challenges' },
        vi: { categoryName: 'Giải quyết vấn đề', categoryDescription: 'Khả năng giải quyết thách thức' }
      }
    }
  ],
  
  // 職種
  jobTypes: [
    {
      jobTypeId: 'engineer',
      translations: {
        ja: { jobTypeName: 'エンジニア', jobTypeDescription: '技術開発・設計担当' },
        en: { jobTypeName: 'Engineer', jobTypeDescription: 'Technical development and design' },
        vi: { jobTypeName: 'Kỹ sư', jobTypeDescription: 'Phát triển và thiết kế kỹ thuật' }
      }
    },
    {
      jobTypeId: 'manager',
      translations: {
        ja: { jobTypeName: 'マネージャー', jobTypeDescription: 'チーム管理・統括' },
        en: { jobTypeName: 'Manager', jobTypeDescription: 'Team management and supervision' },
        vi: { jobTypeName: 'Quản lý', jobTypeDescription: 'Quản lý và giám sát nhóm' }
      }
    },
    {
      jobTypeId: 'construction_worker',
      translations: {
        ja: { jobTypeName: '作業員', jobTypeDescription: '現場作業担当' },
        en: { jobTypeName: 'Construction Worker', jobTypeDescription: 'Field work operations' },
        vi: { jobTypeName: 'Công nhân xây dựng', jobTypeDescription: 'Hoạt động làm việc tại công trường' }
      }
    },
    {
      jobTypeId: 'supervisor',
      translations: {
        ja: { jobTypeName: '監督者', jobTypeDescription: '現場監督・品質管理' },
        en: { jobTypeName: 'Supervisor', jobTypeDescription: 'Site supervision and quality control' },
        vi: { jobTypeName: 'Giám sát viên', jobTypeDescription: 'Giám sát công trường và kiểm soát chất lượng' }
      }
    }
  ]
};

/**
 * 組織構造コレクション設計
 * Collection: organizations
 * 
 * Document Structure:
 * {
 *   organizationId: string,      // 組織ID
 *   tenantId: string,           // テナントID
 *   departments: array,          // 部門リスト
 *   teams: array,               // チームリスト
 *   hierarchy: object,          // 組織階層構造
 *   createdAt: timestamp,       // 作成日時
 *   updatedAt: timestamp        // 更新日時
 * }
 */
export const ORGANIZATIONS_SCHEMA = {
  collection: 'organizations',
  fields: {
    organizationId: { type: 'string', required: true },
    tenantId: { type: 'string', required: true },
    departments: { type: 'object', default: [] },
    teams: { type: 'object', default: [] },
    hierarchy: { type: 'object', default: {} },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp', required: true }
  },
  indexes: [
    ['tenantId'],
    ['organizationId', 'tenantId']
  ]
};

/**
 * 評価期間コレクション設計
 * Collection: evaluation_periods
 * 
 * Document Structure:
 * {
 *   periodId: string,           // 期間ID
 *   tenantId: string,          // テナントID
 *   periodName: string,        // 期間名
 *   startDate: timestamp,      // 開始日
 *   endDate: timestamp,        // 終了日
 *   type: string,              // 期間タイプ (quarterly, semi-annual, annual)
 *   status: string,            // ステータス (active, completed, scheduled)
 *   createdAt: timestamp,      // 作成日時
 *   updatedAt: timestamp       // 更新日時
 * }
 */
export const EVALUATION_PERIODS_SCHEMA = {
  collection: 'evaluation_periods',
  fields: {
    periodId: { type: 'string', required: true },
    tenantId: { type: 'string', required: true },
    periodName: { type: 'string', required: true },
    startDate: { type: 'timestamp', required: true },
    endDate: { type: 'timestamp', required: true },
    type: { type: 'string', required: true, enum: ['quarterly', 'semi-annual', 'annual'] },
    status: { type: 'string', required: true, enum: ['active', 'completed', 'scheduled'] },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp', required: true }
  },
  indexes: [
    ['tenantId'],
    ['tenantId', 'status'],
    ['tenantId', 'type'],
    ['startDate', 'endDate']
  ]
};

/**
 * 評価履歴コレクション設計
 * Collection: evaluation_history
 * 
 * Document Structure:
 * {
 *   historyId: string,         // 履歴ID
 *   evaluationId: string,      // 評価ID
 *   userId: string,            // 評価対象ユーザーID
 *   periodId: string,          // 期間ID
 *   tenantId: string,          // テナントID
 *   scores: object,            // スコア詳細
 *   ratings: object,           // 評価詳細
 *   totalScore: number,        // 総合スコア
 *   status: string,            // ステータス
 *   createdAt: timestamp,      // 作成日時
 *   completedAt: timestamp     // 完了日時
 * }
 */
export const EVALUATION_HISTORY_SCHEMA = {
  collection: 'evaluation_history',
  fields: {
    historyId: { type: 'string', required: true },
    evaluationId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    periodId: { type: 'string', required: true },
    tenantId: { type: 'string', required: true },
    scores: { type: 'object', default: {} },
    ratings: { type: 'object', default: {} },
    totalScore: { type: 'number', default: 0 },
    status: { type: 'string', required: true },
    createdAt: { type: 'timestamp', required: true },
    completedAt: { type: 'timestamp', required: false }
  },
  indexes: [
    ['tenantId'],
    ['userId', 'tenantId'],
    ['periodId', 'tenantId'],
    ['userId', 'periodId', 'tenantId']
  ]
};

/**
 * 拡張ユーザープロファイルスキーマ
 * 既存のusersコレクションに追加されるオプショナルフィールド
 */
export const EXTENDED_USER_FIELDS = {
  // 組織情報
  department: { type: 'string', required: false },
  jobType: { type: 'string', required: false },
  level: { type: 'number', required: false },
  teamId: { type: 'string', required: false },
  
  // 人事情報
  hireDate: { type: 'timestamp', required: false },
  position: { type: 'string', required: false },
  
  // 評価設定
  evaluationSettings: { type: 'object', default: {} },
  
  // メタデータ
  lastLoginAt: { type: 'timestamp', required: false },
  profileCompleteness: { type: 'number', default: 0 }
};

/**
 * データ検証関数
 */
export function validateI18nData(data, schema) {
  const errors = [];
  
  for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
    const value = data[fieldName];
    
    // 必須チェック
    if (fieldConfig.required && (value === undefined || value === null)) {
      errors.push(`${fieldName} is required`);
      continue;
    }
    
    // 型チェック
    if (value !== undefined && value !== null) {
      const expectedType = fieldConfig.type;
      const actualType = typeof value;
      
      if (expectedType === 'timestamp' && !(value instanceof Date)) {
        errors.push(`${fieldName} must be a timestamp`);
      } else if (expectedType !== 'timestamp' && expectedType !== actualType) {
        errors.push(`${fieldName} must be of type ${expectedType}`);
      }
    }
    
    // 列挙値チェック
    if (fieldConfig.enum && value && !fieldConfig.enum.includes(value)) {
      errors.push(`${fieldName} must be one of: ${fieldConfig.enum.join(', ')}`);
    }
  }
  
  return errors;
}