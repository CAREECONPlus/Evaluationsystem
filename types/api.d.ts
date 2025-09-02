/**
 * API関連の型定義
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  code: number;
  type?: string;
  details?: any;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// ユーザー管理API
export interface UserCreateRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyName?: string;
  jobTypeIds?: string[];
}

export interface UserUpdateRequest {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  companyName?: string;
  jobTypeIds?: string[];
}

// 評価管理API
export interface EvaluationCreateRequest {
  targetUserId: string;
  periodId: string;
  jobTypeId: string;
}

export interface EvaluationUpdateRequest {
  scores?: Record<string, number>;
  comments?: Record<string, string>;
  status?: EvaluationStatus;
}

export interface EvaluationSubmitRequest {
  scores: Record<string, number>;
  comments?: Record<string, string>;
}

// 目標管理API
export interface GoalCreateRequest {
  title: string;
  description?: string;
  weight: number;
  periodId: string;
}

export interface GoalUpdateRequest {
  title?: string;
  description?: string;
  weight?: number;
  achievementRate?: number;
  selfEvaluation?: string;
  supervisorEvaluation?: string;
  status?: GoalStatus;
}

// 職種管理API
export interface JobTypeCreateRequest {
  id: string;
  name: string;
  description?: string;
}

export interface JobTypeUpdateRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// 招待管理API
export interface InvitationCreateRequest {
  email: string;
  role: UserRole;
}

export interface InvitationResponse {
  id: string;
  code: string;
  email: string;
  role: UserRole;
  used: boolean;
  createdAt: string;
  expiresAt: string;
}

// 設定管理API
export interface SettingsUpdateRequest {
  [key: string]: any;
}

// API関数の型定義
export interface ApiModule {
  // ユーザー管理
  getUsers: (options?: PaginationOptions) => Promise<PaginatedResponse<User>>;
  getUser: (id: string) => Promise<ApiResponse<User>>;
  createUser: (data: UserCreateRequest) => Promise<ApiResponse<User>>;
  updateUser: (id: string, data: UserUpdateRequest) => Promise<ApiResponse<User>>;
  deleteUser: (id: string) => Promise<ApiResponse<void>>;
  
  // 評価管理
  getEvaluations: (options?: PaginationOptions & { userId?: string; periodId?: string }) => Promise<PaginatedResponse<Evaluation>>;
  getEvaluation: (id: string) => Promise<ApiResponse<Evaluation>>;
  createEvaluation: (data: EvaluationCreateRequest) => Promise<ApiResponse<Evaluation>>;
  updateEvaluation: (id: string, data: EvaluationUpdateRequest) => Promise<ApiResponse<Evaluation>>;
  submitEvaluation: (id: string, data: EvaluationSubmitRequest) => Promise<ApiResponse<Evaluation>>;
  deleteEvaluation: (id: string) => Promise<ApiResponse<void>>;
  
  // 目標管理
  getGoals: (options?: PaginationOptions & { userId?: string; periodId?: string }) => Promise<PaginatedResponse<Goal>>;
  getGoal: (id: string) => Promise<ApiResponse<Goal>>;
  createGoal: (data: GoalCreateRequest) => Promise<ApiResponse<Goal>>;
  updateGoal: (id: string, data: GoalUpdateRequest) => Promise<ApiResponse<Goal>>;
  deleteGoal: (id: string) => Promise<ApiResponse<void>>;
  
  // 職種管理
  getJobTypes: () => Promise<ApiResponse<JobType[]>>;
  getJobType: (id: string) => Promise<ApiResponse<JobType>>;
  createJobType: (data: JobTypeCreateRequest) => Promise<ApiResponse<JobType>>;
  updateJobType: (id: string, data: JobTypeUpdateRequest) => Promise<ApiResponse<JobType>>;
  deleteJobType: (id: string) => Promise<ApiResponse<void>>;
  
  // 招待管理
  getInvitations: () => Promise<ApiResponse<InvitationResponse[]>>;
  createInvitation: (data: InvitationCreateRequest) => Promise<ApiResponse<InvitationResponse>>;
  validateInvitationCode: (code: string) => Promise<ApiResponse<InvitationResponse>>;
  useInvitation: (code: string) => Promise<ApiResponse<void>>;
  
  // 設定管理
  getSettings: () => Promise<ApiResponse<Record<string, any>>>;
  updateSettings: (data: SettingsUpdateRequest) => Promise<ApiResponse<Record<string, any>>>;
}

// 型の再エクスポート
export type { User, UserRole, UserStatus } from './global.d.ts';
export type { Evaluation, EvaluationStatus } from './global.d.ts';
export type { Goal, GoalStatus } from './global.d.ts';
export type { JobType } from './global.d.ts';