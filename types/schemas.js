/**
 * 型スキーマ定義 - TypeScript型定義付き
 * アプリケーション全体で使用される主要なデータ型のスキーマ定義
 * 
 * @fileoverview
 * このモジュールは以下のスキーマを定義します：
 * - ユーザー関連スキーマ
 * - 評価関連スキーマ
 * - 目標関連スキーマ
 * - 設定関連スキーマ
 * - 招待関連スキーマ
 * 
 * @typedef {import('./global.d.ts').User} User
 * @typedef {import('./global.d.ts').Evaluation} Evaluation
 * @typedef {import('./global.d.ts').Goal} Goal
 * @typedef {import('./global.d.ts').ApiResponse} ApiResponse
 * @typedef {import('./global.d.ts').FirebaseConfig} FirebaseConfig
 */

import { TYPES, registerSchema, registerValidator } from '../utils/type-validator.js';

// ===== カスタムバリデーターの登録 =====

/**
 * 職種IDバリデーター
 */
registerValidator('jobTypeId', (value) => {
  return typeof value === 'string' && value.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(value);
});

/**
 * テナントIDバリデーター
 */
registerValidator('tenantId', (value) => {
  return typeof value === 'string' && value.length >= 5 && /^[a-zA-Z0-9_-]+$/.test(value);
});

/**
 * 評価ステータスバリデーター
 */
registerValidator('evaluationStatus', (value) => {
  const validStatuses = ['draft', 'submitted', 'in_review', 'approved', 'rejected'];
  return validStatuses.includes(value);
});

/**
 * ユーザーロールバリデーター
 */
registerValidator('userRole', (value) => {
  const validRoles = ['developer', 'admin', 'evaluator', 'worker'];
  return validRoles.includes(value);
});

/**
 * 評価点バリデーター（1-5点）
 */
registerValidator('evaluationScore', (value) => {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
});

/**
 * パーセンテージバリデーター（0-100）
 */
registerValidator('percentage', (value) => {
  return typeof value === 'number' && value >= 0 && value <= 100;
});

// ===== ユーザー関連スキーマ =====

/**
 * ユーザープロフィールスキーマ
 */
registerSchema('UserProfile', {
  uid: {
    type: TYPES.STRING,
    required: true,
    minLength: 20,
    description: 'Firebase UID'
  },
  email: {
    type: 'email',
    required: true,
    description: 'メールアドレス'
  },
  name: {
    type: TYPES.STRING,
    required: true,
    minLength: 2,
    maxLength: 100,
    description: '氏名'
  },
  role: {
    type: 'userRole',
    required: true,
    description: 'ユーザーロール'
  },
  status: {
    type: TYPES.STRING,
    required: true,
    enum: ['active', 'inactive', 'pending'],
    description: 'ユーザーステータス'
  },
  tenantId: {
    type: 'tenantId',
    required: true,
    description: 'テナントID'
  },
  companyName: {
    type: TYPES.STRING,
    required: false,
    maxLength: 200,
    description: '会社名'
  },
  jobTypeIds: {
    type: TYPES.ARRAY,
    required: false,
    description: '担当職種IDリスト'
  },
  createdAt: {
    type: TYPES.DATE,
    required: true,
    description: '作成日時'
  },
  updatedAt: {
    type: TYPES.DATE,
    required: true,
    description: '更新日時'
  },
  lastLoginAt: {
    type: TYPES.DATE,
    required: false,
    description: '最終ログイン日時'
  }
});

/**
 * ユーザー作成リクエストスキーマ
 */
registerSchema('CreateUserRequest', {
  email: {
    type: 'email',
    required: true,
    description: 'メールアドレス'
  },
  password: {
    type: TYPES.STRING,
    required: true,
    minLength: 6,
    maxLength: 128,
    description: 'パスワード'
  },
  name: {
    type: TYPES.STRING,
    required: true,
    minLength: 2,
    maxLength: 100,
    description: '氏名'
  },
  role: {
    type: 'userRole',
    required: true,
    description: 'ユーザーロール'
  },
  companyName: {
    type: TYPES.STRING,
    required: false,
    maxLength: 200,
    description: '会社名'
  }
});

// ===== 評価関連スキーマ =====

/**
 * 評価データスキーマ
 */
registerSchema('Evaluation', {
  id: {
    type: TYPES.STRING,
    required: true,
    description: '評価ID'
  },
  targetUserId: {
    type: TYPES.STRING,
    required: true,
    description: '被評価者UID'
  },
  evaluatorId: {
    type: TYPES.STRING,
    required: true,
    description: '評価者UID'
  },
  periodId: {
    type: TYPES.STRING,
    required: true,
    description: '評価期間ID'
  },
  jobTypeId: {
    type: 'jobTypeId',
    required: true,
    description: '職種ID'
  },
  status: {
    type: 'evaluationStatus',
    required: true,
    description: '評価ステータス'
  },
  totalScore: {
    type: TYPES.NUMBER,
    required: false,
    min: 1,
    max: 5,
    description: '総合評価点'
  },
  scores: {
    type: TYPES.OBJECT,
    required: true,
    description: '各項目の評価点'
  },
  comments: {
    type: TYPES.OBJECT,
    required: false,
    description: 'コメント'
  },
  tenantId: {
    type: 'tenantId',
    required: true,
    description: 'テナントID'
  },
  createdAt: {
    type: TYPES.DATE,
    required: true,
    description: '作成日時'
  },
  updatedAt: {
    type: TYPES.DATE,
    required: true,
    description: '更新日時'
  },
  submittedAt: {
    type: TYPES.DATE,
    required: false,
    description: '提出日時'
  }
});

/**
 * 評価項目スキーマ
 */
registerSchema('EvaluationItem', {
  id: {
    type: TYPES.STRING,
    required: true,
    description: '評価項目ID'
  },
  name: {
    type: TYPES.STRING,
    required: true,
    minLength: 1,
    maxLength: 200,
    description: '項目名'
  },
  description: {
    type: TYPES.STRING,
    required: false,
    maxLength: 1000,
    description: '項目説明'
  },
  weight: {
    type: 'percentage',
    required: true,
    description: '重要度（パーセンテージ）'
  },
  selfScore: {
    type: 'evaluationScore',
    required: false,
    description: '自己評価点'
  },
  evaluatorScore: {
    type: 'evaluationScore',
    required: false,
    description: '評価者評価点'
  },
  selfComment: {
    type: TYPES.STRING,
    required: false,
    maxLength: 2000,
    description: '自己評価コメント'
  },
  evaluatorComment: {
    type: TYPES.STRING,
    required: false,
    maxLength: 2000,
    description: '評価者コメント'
  }
});

// ===== 目標関連スキーマ =====

/**
 * 目標スキーマ
 */
registerSchema('Goal', {
  id: {
    type: TYPES.STRING,
    required: true,
    description: '目標ID'
  },
  userId: {
    type: TYPES.STRING,
    required: true,
    description: 'ユーザーUID'
  },
  periodId: {
    type: TYPES.STRING,
    required: true,
    description: '評価期間ID'
  },
  title: {
    type: TYPES.STRING,
    required: true,
    minLength: 1,
    maxLength: 200,
    description: '目標タイトル'
  },
  description: {
    type: TYPES.STRING,
    required: false,
    maxLength: 2000,
    description: '目標説明'
  },
  weight: {
    type: 'percentage',
    required: true,
    description: '重要度（パーセンテージ）'
  },
  status: {
    type: TYPES.STRING,
    required: true,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    description: '目標ステータス'
  },
  achievementRate: {
    type: 'percentage',
    required: false,
    description: '達成率'
  },
  selfEvaluation: {
    type: TYPES.STRING,
    required: false,
    maxLength: 2000,
    description: '自己評価'
  },
  supervisorEvaluation: {
    type: TYPES.STRING,
    required: false,
    maxLength: 2000,
    description: '上司評価'
  },
  tenantId: {
    type: 'tenantId',
    required: true,
    description: 'テナントID'
  },
  createdAt: {
    type: TYPES.DATE,
    required: true,
    description: '作成日時'
  },
  updatedAt: {
    type: TYPES.DATE,
    required: true,
    description: '更新日時'
  }
});

// ===== 設定関連スキーマ =====

/**
 * 職種スキーマ
 */
registerSchema('JobType', {
  id: {
    type: 'jobTypeId',
    required: true,
    description: '職種ID'
  },
  name: {
    type: TYPES.STRING,
    required: true,
    minLength: 1,
    maxLength: 100,
    description: '職種名'
  },
  description: {
    type: TYPES.STRING,
    required: false,
    maxLength: 500,
    description: '職種説明'
  },
  status: {
    type: TYPES.STRING,
    required: true,
    enum: ['active', 'inactive'],
    description: 'ステータス'
  },
  tenantId: {
    type: 'tenantId',
    required: true,
    description: 'テナントID'
  },
  createdAt: {
    type: TYPES.DATE,
    required: true,
    description: '作成日時'
  },
  updatedAt: {
    type: TYPES.DATE,
    required: true,
    description: '更新日時'
  }
});

/**
 * 評価期間スキーマ
 */
registerSchema('EvaluationPeriod', {
  id: {
    type: TYPES.STRING,
    required: true,
    description: '評価期間ID'
  },
  name: {
    type: TYPES.STRING,
    required: true,
    minLength: 1,
    maxLength: 100,
    description: '期間名'
  },
  startDate: {
    type: TYPES.STRING,
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    description: '開始日（YYYY-MM-DD形式）'
  },
  endDate: {
    type: TYPES.STRING,
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    description: '終了日（YYYY-MM-DD形式）'
  },
  status: {
    type: TYPES.STRING,
    required: true,
    enum: ['upcoming', 'active', 'completed'],
    description: 'ステータス'
  },
  tenantId: {
    type: 'tenantId',
    required: true,
    description: 'テナントID'
  },
  createdAt: {
    type: TYPES.DATE,
    required: true,
    description: '作成日時'
  },
  updatedAt: {
    type: TYPES.DATE,
    required: true,
    description: '更新日時'
  },
  customValidator: (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start >= end) {
      return '開始日は終了日より前である必要があります';
    }
    return true;
  }
});

// ===== 招待関連スキーマ =====

/**
 * 招待スキーマ
 */
registerSchema('Invitation', {
  id: {
    type: TYPES.STRING,
    required: true,
    description: '招待ID'
  },
  code: {
    type: TYPES.STRING,
    required: true,
    pattern: /^[A-Z0-9]{8}$/,
    description: '招待コード（8文字の英数字）'
  },
  email: {
    type: 'email',
    required: true,
    description: '招待されるメールアドレス'
  },
  role: {
    type: 'userRole',
    required: true,
    description: '招待するロール'
  },
  used: {
    type: TYPES.BOOLEAN,
    required: true,
    description: '使用済みフラグ'
  },
  tenantId: {
    type: 'tenantId',
    required: true,
    description: 'テナントID'
  },
  invitedBy: {
    type: TYPES.STRING,
    required: true,
    description: '招待者UID'
  },
  createdAt: {
    type: TYPES.DATE,
    required: true,
    description: '作成日時'
  },
  expiresAt: {
    type: TYPES.DATE,
    required: true,
    description: '有効期限'
  },
  usedAt: {
    type: TYPES.DATE,
    required: false,
    description: '使用日時'
  },
  usedBy: {
    type: TYPES.STRING,
    required: false,
    description: '使用者UID'
  }
});

// ===== API関連スキーマ =====

/**
 * APIレスポンススキーマ
 */
registerSchema('APIResponse', {
  success: {
    type: TYPES.BOOLEAN,
    required: true,
    description: 'API成功フラグ'
  },
  data: {
    type: TYPES.OBJECT,
    required: false,
    description: 'レスポンスデータ'
  },
  error: {
    type: TYPES.OBJECT,
    required: false,
    description: 'エラー情報'
  },
  timestamp: {
    type: TYPES.DATE,
    required: true,
    description: 'レスポンス時刻'
  }
});

/**
 * エラー情報スキーマ
 */
registerSchema('ErrorInfo', {
  type: {
    type: TYPES.STRING,
    required: true,
    enum: ['ValidationError', 'PermissionError', 'NotFoundError', 'SystemError'],
    description: 'エラー種別'
  },
  message: {
    type: TYPES.STRING,
    required: true,
    minLength: 1,
    maxLength: 500,
    description: 'エラーメッセージ'
  },
  code: {
    type: TYPES.STRING,
    required: false,
    description: 'エラーコード'
  },
  details: {
    type: TYPES.OBJECT,
    required: false,
    description: 'エラー詳細情報'
  }
});

// 型安全なヘルパー関数をエクスポート
import typeValidator from '../utils/type-validator.js';