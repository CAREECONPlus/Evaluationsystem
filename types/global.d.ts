/**
 * グローバル型定義
 */

// Firebase関連の型定義
declare global {
  interface Window {
    firebase: any;
    firebaseConfig: any;
    configManager: any;
    getConfig: any;
    env: any;
    Environment: any;
  }
}

// モジュール宣言
declare module '*.json' {
  const value: any;
  export default value;
}

// Firebase型定義
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// 環境設定型定義
export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  APP_NAME?: string;
  APP_VERSION?: string;
  SUPPORT_EMAIL?: string;
}

// ユーザー関連型定義
export type UserRole = 'developer' | 'admin' | 'evaluator' | 'worker';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  companyName?: string;
  jobTypeIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// 評価関連型定義
export type EvaluationStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';

export interface Evaluation {
  id: string;
  targetUserId: string;
  evaluatorId: string;
  periodId: string;
  jobTypeId: string;
  status: EvaluationStatus;
  totalScore?: number;
  scores: Record<string, number>;
  comments?: Record<string, string>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

export interface EvaluationItem {
  id: string;
  name: string;
  description?: string;
  weight: number;
  selfScore?: number;
  evaluatorScore?: number;
  selfComment?: string;
  evaluatorComment?: string;
}

// 目標関連型定義
export type GoalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Goal {
  id: string;
  userId: string;
  periodId: string;
  title: string;
  description?: string;
  weight: number;
  status: GoalStatus;
  achievementRate?: number;
  selfEvaluation?: string;
  supervisorEvaluation?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 職種関連型定義
export interface JobType {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 評価期間関連型定義
export type EvaluationPeriodStatus = 'upcoming' | 'active' | 'completed';

export interface EvaluationPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: EvaluationPeriodStatus;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 招待関連型定義
export interface Invitation {
  id: string;
  code: string;
  email: string;
  role: UserRole;
  used: boolean;
  tenantId: string;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
}

// API関連型定義
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface ApiError {
  message: string;
  code: number;
  details?: any;
}

export {};