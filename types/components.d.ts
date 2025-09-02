/**
 * コンポーネント関連の型定義
 */

// ページコンポーネントの共通インターface
export interface PageComponent {
  render(): string;
  init?(): void;
  destroy?(): void;
}

// ルート情報
export interface Route {
  path: string;
  component: PageComponent;
  requiresAuth?: boolean;
  roles?: UserRole[];
}

// チャートコンポーネント関連
export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface ChartOptions {
  title?: string;
  showLegend?: boolean;
  width?: number;
  height?: number;
  responsive?: boolean;
}

export interface PolygonChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// UIコンポーネント関連
export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface ModalOptions {
  title?: string;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
  backdrop?: boolean;
}

export interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  showInfo?: boolean;
}

// フォーム関連
export interface FormField {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// ナビゲーション関連
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: UserRole[];
}

// ヘッダー関連
export interface HeaderConfig {
  title: string;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  actions?: {
    label: string;
    action: () => void;
    icon?: string;
  }[];
}

// サイドバー関連
export interface SidebarConfig {
  items: NavigationItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

// テーブル関連
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
}

export interface TableData {
  columns: TableColumn[];
  rows: any[];
  pagination?: PaginationOptions;
  sorting?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

// アクセシビリティ関連
export interface AccessibilityConfig {
  highContrast?: boolean;
  largeText?: boolean;
  reducedMotion?: boolean;
  screenReader?: boolean;
}

// パフォーマンス監視関連
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

// エラーハンドリング関連
export interface ErrorBoundaryProps {
  fallback?: (error: Error) => string;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface ComponentError {
  component: string;
  error: Error;
  timestamp: Date;
  userAgent: string;
  url: string;
}

// イベント関連
export interface ComponentEvent {
  type: string;
  target: string;
  data?: any;
  timestamp: Date;
}

export interface EventListener {
  event: string;
  handler: (event: ComponentEvent) => void;
  once?: boolean;
}

// 型のre-export
export type { UserRole } from './global.d.ts';