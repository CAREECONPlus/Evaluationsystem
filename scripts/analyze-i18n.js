/**
 * i18n分析実行スクリプト
 */

// i18n.jsから翻訳データを読み込み
import { BUILT_IN_TRANSLATIONS } from '../i18n.js';
import I18nAnalyzer from '../utils/i18n-analyzer.js';
import { getLogger } from '../utils/logger.js';

// ファイルシステムアクセス用のモックデータ（実際のファイル内容）
const sourceFiles = {
  'pages/dashboard.js': `
    data-i18n="nav.dashboard"
    data-i18n="dashboard.total_users"
    data-i18n="dashboard.completed_evaluations"
    this.app.i18n.t('dashboard.no_recent_evaluations')
  `,
  'pages/login.js': `
    data-i18n="app.system_name"
    data-i18n="auth.login"
    data-i18n="auth.email"
    data-i18n="auth.password"
    this.app.i18n.t("errors.email_password_required")
  `,
  'pages/evaluations.js': `
    data-i18n="evaluations.title"
    data-i18n="evaluations.form_title"
    data-i18n="evaluations.target_user"
    data-i18n="evaluations.evaluator"
    data-i18n="common.loading"
  `,
  'pages/user-management.js': `
    data-i18n="users.title"
    data-i18n="users.invite_user"
    data-i18n="roles.admin"
    data-i18n="roles.evaluator"
    data-i18n="common.cancel"
  `,
  'pages/settings.js': `
    data-i18n="settings.title"
    data-i18n="settings.job_types"
    data-i18n="settings.evaluation_periods"
  `,
  'pages/goal-setting.js': `
    data-i18n="goals.title"
    data-i18n="goals.add_goal"
    data-i18n="common.loading"
  `,
  'router.js': `
    this.app.i18n.t("app.system_name")
  `,
  'components/sidebar.js': `
    data-i18n="nav.dashboard"
    data-i18n="nav.evaluations"
    data-i18n="nav.users"
    data-i18n="nav.settings"
    data-i18n="nav.logout"
  `
};

async function runAnalysis() {
  const logger = getLogger('I18nAnalysis');
  logger.info('Starting i18n analysis...');

  const analyzer = new I18nAnalyzer();

  try {
    // 利用可能な翻訳キーをスキャン
    analyzer.scanAvailableKeys(BUILT_IN_TRANSLATIONS);

    // ソースファイルから使用済みキーを抽出
    Object.entries(sourceFiles).forEach(([filename, content]) => {
      analyzer.analyzeFileContent(filename, content);
    });

    // レポート生成
    const report = analyzer.generateOptimizationReport();
    
    // レポート出力
    analyzer.printReport(report);

    // 最適化された翻訳データを生成
    const optimizedTranslations = analyzer.generateOptimizedTranslations(BUILT_IN_TRANSLATIONS);
    
    logger.group('Optimization Results');
    logger.info(`Original size: ${JSON.stringify(BUILT_IN_TRANSLATIONS).length} characters`);
    logger.info(`Optimized size: ${JSON.stringify(optimizedTranslations).length} characters`);
    
    const reduction = (1 - JSON.stringify(optimizedTranslations).length / JSON.stringify(BUILT_IN_TRANSLATIONS).length) * 100;
    logger.info(`Size reduction: ${reduction.toFixed(1)}%`);
    logger.groupEnd();

    return {
      report,
      optimizedTranslations,
      reduction
    };

  } catch (error) {
    logger.error('Analysis failed:', error);
    throw error;
  }
}

// 分析実行
if (typeof window !== 'undefined') {
  // ブラウザ環境でのテスト
  window.runI18nAnalysis = runAnalysis;
  
  // すぐに実行
  runAnalysis().then(result => {
    console.log('I18n analysis completed successfully:', result);
  }).catch(error => {
    console.error('I18n analysis failed:', error);
  });
}

export { runAnalysis };