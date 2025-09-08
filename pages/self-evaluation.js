/**
 * Reports Overview Page Component
 * レポート概要ページコンポーネント - 権限別表示対応
 */
export class EvaluationReportPage {
  constructor(app) {
    this.app = app;
    this.reportData = null;
    this.chartInstances = {};
    this.isInitialized = false;
    this.currentTimeRange = 'last6months';
    this.userRole = this.getUserRole();
  }

  getUserRole() {
    if (this.app.hasRole('admin')) return 'admin';
    if (this.app.hasRole('evaluator')) return 'evaluator';
    return 'worker';
  }

  async render() {
    return `
      <div class="reports-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1" data-i18n="nav.reports">レポート</h1>
          <p class="page-subtitle text-dark mb-0" data-i18n="reports.subtitle">${this.getSubtitleByRole()}</p>
        </div>

        ${this.renderTimeRangeSelector()}

        <!-- データ読み込み中の表示 -->
        <div id="loading-container" class="text-center p-5">
          ${this.renderLoadingState()}
        </div>

        <!-- メインコンテンツ -->
        <div id="main-content" style="display: none;">
          ${this.renderContentByRole()}
        </div>
      </div>
    `;
  }

  getSubtitleByRole() {
    switch (this.userRole) {
      case 'admin':
        return '全社評価データの分析とスキルマップ';
      case 'evaluator':
        return 'あなたと担当者の評価データ分析';
      case 'worker':
      default:
        return 'あなたの評価データと成長分析';
    }
  }

  renderTimeRangeSelector() {
    // 作業員は期間選択を簡素化
    if (this.userRole === 'worker') {
      return `
        <div class="card mb-4">
          <div class="card-body py-2">
            <div class="row align-items-center">
              <div class="col-md-8">
                <div class="btn-group" role="group" id="timeRangeButtons">
                  <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'last6months' ? 'active' : ''}" data-range="last6months">
                    <span data-i18n="reports.last_6_months">過去6ヶ月</span>
                  </button>
                  <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'thisyear' ? 'active' : ''}" data-range="thisyear">
                    <span data-i18n="reports.this_year">今年</span>
                  </button>
                  <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'all' ? 'active' : ''}" data-range="all">
                    <span data-i18n="reports.all_time">全期間</span>
                  </button>
                </div>
              </div>
              <div class="col-md-4 text-md-end mt-2 mt-md-0">
                <button class="btn btn-outline-secondary btn-sm" id="refreshDataBtn">
                  <i class="fas fa-sync-alt me-1"></i>
                  <span data-i18n="common.refresh">更新</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 評価者・管理者は全期間選択可能
    return `
      <div class="card mb-4">
        <div class="card-body py-2">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="btn-group" role="group" id="timeRangeButtons">
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'last3months' ? 'active' : ''}" data-range="last3months">
                  <span data-i18n="reports.last_3_months">過去3ヶ月</span>
                </button>
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'last6months' ? 'active' : ''}" data-range="last6months">
                  <span data-i18n="reports.last_6_months">過去6ヶ月</span>
                </button>
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'thisyear' ? 'active' : ''}" data-range="thisyear">
                  <span data-i18n="reports.this_year">今年</span>
                </button>
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'all' ? 'active' : ''}" data-range="all">
                  <span data-i18n="reports.all_time">全期間</span>
                </button>
              </div>
            </div>
            <div class="col-md-4 text-md-end mt-2 mt-md-0">
              <button class="btn btn-outline-secondary btn-sm" id="refreshDataBtn">
                <i class="fas fa-sync-alt me-1"></i>
                <span data-i18n="common.refresh">更新</span>
              </button>
            </div>
          </div>
        </div>
      `;
  }

  renderContentByRole() {
    switch (this.userRole) {
      case 'admin':
        return this.renderAdminContent();
      case 'evaluator':
        return this.renderEvaluatorContent();
      case 'worker':
      default:
        return this.renderWorkerContent();
    }
  }

  renderWorkerContent() {
    return `
      <!-- 個人統計カード -->
      <div class="row mb-4" id="personal-stats-cards">
        <!-- 個人統計カードがここに動的に挿入されます -->
      </div>

      <!-- 個人パフォーマンス分析 -->
      <div class="row mb-4">
        <div class="col-lg-8 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-chart-line me-2 text-primary"></i>
                <span data-i18n="reports.personal_performance">あなたのパフォーマンス推移</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="personalPerformanceChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-chart-radar me-2 text-primary"></i>
                <span data-i18n="reports.skill_balance">スキルバランス</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="personalSkillChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 成長分析と改善提案 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-lightbulb me-2 text-primary"></i>
                <span data-i18n="reports.improvement_suggestions">成長分析と改善提案</span>
              </h5>
            </div>
            <div class="card-body" id="improvementSuggestions">
              <!-- 改善提案がここに挿入されます -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEvaluatorContent() {
    return `
      <!-- 統計カード -->
      <div class="row mb-4" id="stats-cards">
        <!-- 統計カードがここに動的に挿入されます -->
      </div>

      <!-- チャートセクション -->
      <div class="row mb-4">
        <div class="col-lg-8 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-chart-line me-2 text-primary"></i>
                <span data-i18n="reports.team_performance">チーム・個人パフォーマンス推移</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="performanceTrendChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-chart-pie me-2 text-primary"></i>
                <span data-i18n="reports.evaluation_status">評価ステータス分布</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="statusDistributionChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 担当者一覧と比較 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-users me-2 text-primary"></i>
                <span data-i18n="reports.team_overview">担当者概要</span>
              </h5>
            </div>
            <div class="card-body">
              <div id="teamMembersOverview">
                <!-- 担当者一覧がここに挿入されます -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 詳細テーブル -->
      <div class="card">
        <div class="card-header bg-white">
          <h5 class="mb-0 card-title-icon">
            <i class="fas fa-table me-2 text-primary"></i>
            <span data-i18n="reports.detailed_data">詳細データ</span>
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover" id="detailedDataTable">
              <thead>
                <tr>
                  <th data-i18n="evaluation.period">評価期間</th>
                  <th data-i18n="evaluation.target">対象者</th>
                  <th data-i18n="evaluation.score">スコア</th>
                  <th data-i18n="evaluation.status">ステータス</th>
                  <th data-i18n="common.actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <!-- データが動的に挿入されます -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderAdminContent() {
    return `
      <!-- 統計カード -->
      <div class="row mb-4" id="stats-cards">
        <!-- 統計カードがここに動的に挿入されます -->
      </div>

      <!-- 全社スキルマップ -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-primary">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0 card-title-icon text-primary">
                <i class="fas fa-sitemap me-2"></i>
                <span data-i18n="reports.company_skill_map">全社スキルマップ</span>
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-lg-8 mb-3">
                  <canvas id="skillMapChart"></canvas>
                </div>
                <div class="col-lg-4 mb-3">
                  <div id="skillAnalysis">
                    <!-- スキル分析がここに挿入されます -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- チャートセクション -->
      <div class="row mb-4">
        <div class="col-lg-8 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-chart-line me-2 text-primary"></i>
                <span data-i18n="reports.performance_trend">パフォーマンス推移</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="performanceTrendChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-chart-pie me-2 text-primary"></i>
                <span data-i18n="reports.evaluation_status">評価ステータス分布</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="statusDistributionChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 部署別分析 -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-building me-2 text-primary"></i>
                <span data-i18n="reports.department_comparison">部署別比較</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="departmentComparisonChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-chart-bar me-2 text-primary"></i>
                <span data-i18n="reports.evaluator_efficiency">評価者効率</span>
              </h5>
            </div>
            <div class="card-body">
              <canvas id="evaluatorEfficiencyChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 詳細テーブル -->
      <div class="card">
        <div class="card-header bg-white">
          <h5 class="mb-0 card-title-icon">
            <i class="fas fa-table me-2 text-primary"></i>
            <span data-i18n="reports.detailed_data">詳細データ</span>
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover" id="detailedDataTable">
              <thead>
                <tr>
                  <th data-i18n="evaluation.period">評価期間</th>
                  <th data-i18n="evaluation.target">対象者</th>
                  <th data-i18n="evaluation.evaluator">評価者</th>
                  <th data-i18n="evaluation.score">スコア</th>
                  <th data-i18n="evaluation.status">ステータス</th>
                  <th data-i18n="common.actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <!-- データが動的に挿入されます -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderLoadingState() {
    return `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3" data-i18n="common.loading_data">データを読み込み中...</p>
    `;
  }

  async init() {
    this.app.currentPage = this;
    
    if (!this.app.isAuthenticated()) {
      this.app.navigate("#/login");
      return;
    }

    // 既存のチャートをクリーンアップ
    this.cleanup();

    try {
      await this.loadReportData();
      this.setupEventListeners();
      this.applyTranslations();
      this.isInitialized = true;
    } catch (error) {
      console.error("Reports: Initialization error:", error);
      this.renderErrorState();
      this.app.showError("レポートの読み込み中にエラーが発生しました。");
    }
  }

  async loadReportData() {
    if (!this.app.api) {
      throw new Error("APIが初期化されていません");
    }

    // ローディング表示
    document.getElementById('loading-container').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';

    try {
      // 権限に応じてAPIコールを分岐
      let apiCalls = [];
      
      switch (this.userRole) {
        case 'admin':
          apiCalls = [
            this.app.api.getReportStatistics(this.currentTimeRange),
            this.app.api.getEvaluationsList({ timeRange: this.currentTimeRange }),
            this.app.api.getPerformanceTrends(this.currentTimeRange),
            this.app.api.getSkillMapData(this.currentTimeRange),
            this.app.api.getDepartmentStatistics(this.currentTimeRange)
          ];
          break;
        case 'evaluator':
          apiCalls = [
            this.app.api.getMyEvaluatorStatistics(this.currentTimeRange),
            this.app.api.getMyTeamEvaluations(this.currentTimeRange),
            this.app.api.getMyTeamPerformanceTrends(this.currentTimeRange)
          ];
          break;
        case 'worker':
        default:
          apiCalls = [
            this.app.api.getMyPersonalStatistics(this.currentTimeRange),
            this.app.api.getMyEvaluationHistory(this.currentTimeRange),
            this.app.api.getMyPerformanceTrends(this.currentTimeRange)
          ];
          break;
      }

      const results = await Promise.allSettled(apiCalls);

      // 結果を処理
      this.reportData = this.processApiResults(results);

      // UIの更新
      this.renderStatsCards();
      this.renderCharts();
      this.renderDetailedTable();

      // 権限別の追加処理
      if (this.userRole === 'admin') {
        this.renderSkillMapAnalysis();
      } else if (this.userRole === 'evaluator') {
        this.renderTeamOverview();
      } else if (this.userRole === 'worker') {
        this.renderImprovementSuggestions();
      }

      // ローディング表示を隠してメインコンテンツを表示
      document.getElementById('loading-container').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';

    } catch (error) {
      console.error("Reports: Data loading failed:", error);
      this.renderErrorState();
      throw error;
    }
  }

  processApiResults(results) {
    switch (this.userRole) {
      case 'admin':
        return {
          statistics: results[0].status === 'fulfilled' ? results[0].value : this.getDefaultStats(),
          evaluations: results[1].status === 'fulfilled' ? results[1].value : [],
          trends: results[2].status === 'fulfilled' ? results[2].value : this.getDefaultTrends(),
          skillMap: results[3].status === 'fulfilled' ? results[3].value : this.getDefaultSkillMap(),
          departmentStats: results[4].status === 'fulfilled' ? results[4].value : []
        };
      case 'evaluator':
        return {
          statistics: results[0].status === 'fulfilled' ? results[0].value : this.getDefaultStats(),
          evaluations: results[1].status === 'fulfilled' ? results[1].value : [],
          trends: results[2].status === 'fulfilled' ? results[2].value : this.getDefaultTrends()
        };
      case 'worker':
      default:
        return {
          personalStats: results[0].status === 'fulfilled' ? results[0].value : this.getDefaultPersonalStats(),
          evaluationHistory: results[1].status === 'fulfilled' ? results[1].value : [],
          trends: results[2].status === 'fulfilled' ? results[2].value : this.getDefaultTrends()
        };
    }
  }

  getDefaultStats() {
    return {
      totalEvaluations: 0,
      completedEvaluations: 0,
      averageScore: 0,
      improvementRate: 0
    };
  }

  getDefaultPersonalStats() {
    return {
      totalEvaluations: 0,
      averageScore: 0,
      improvementRate: 0,
      strongestSkill: '未設定',
      weakestSkill: '未設定'
    };
  }

  getDefaultTrends() {
    return {
      labels: [],
      datasets: []
    };
  }

  getDefaultSkillMap() {
    return {
      skills: [],
      levels: [],
      gaps: []
    };
  }

  renderStatsCards() {
    const container = document.getElementById("stats-cards");
    if (!container) return;

    switch (this.userRole) {
      case 'worker':
        this.renderPersonalStatsCards(container);
        break;
      case 'evaluator':
      case 'admin':
      default:
        this.renderGeneralStatsCards(container);
        break;
    }
  }

  renderPersonalStatsCards(container) {
    const stats = this.reportData.personalStats || this.getDefaultPersonalStats();

    container.innerHTML = `
      <div class="col-md-6 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-primary">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-user fa-2x text-primary me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.my_evaluations">私の評価数</h6>
              <div class="card-title h4 mb-0">${stats.totalEvaluations}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-info">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-star fa-2x text-info me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.my_average_score">私の平均スコア</h6>
              <div class="card-title h4 mb-0">${stats.averageScore.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-success">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-chart-line fa-2x text-success me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.improvement_rate">改善率</h6>
              <div class="card-title h4 mb-0">${stats.improvementRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-warning">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-trophy fa-2x text-warning me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.strongest_skill">最も優れたスキル</h6>
              <div class="card-title h6 mb-0">${stats.strongestSkill}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.applyTranslationsToElement(container);
  }

  renderGeneralStatsCards(container) {
    const stats = this.reportData.statistics || this.getDefaultStats();

    container.innerHTML = `
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-primary">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-clipboard-list fa-2x text-primary me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.total_evaluations">総評価数</h6>
              <div class="card-title h4 mb-0">${stats.totalEvaluations}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-success">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-check-circle fa-2x text-success me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.completed_evaluations">完了済み評価</h6>
              <div class="card-title h4 mb-0">${stats.completedEvaluations}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-info">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-star fa-2x text-info me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.average_score">平均スコア</h6>
              <div class="card-title h4 mb-0">${stats.averageScore.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-warning">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-chart-line fa-2x text-warning me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.improvement_rate">改善率</h6>
              <div class="card-title h4 mb-0">${stats.improvementRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.applyTranslationsToElement(container);
  }

  renderCharts() {
    // すべてのチャートを先に破棄
    this.destroyAllCharts();
    
    // 少し待ってからチャートを再作成
    setTimeout(() => {
      switch (this.userRole) {
        case 'admin':
          this.renderPerformanceTrendChart();
          this.renderStatusDistributionChart();
          this.renderSkillMapChart();
          this.renderDepartmentComparisonChart();
          this.renderEvaluatorEfficiencyChart();
          break;
        case 'evaluator':
          this.renderPerformanceTrendChart();
          this.renderStatusDistributionChart();
          break;
        case 'worker':
        default:
          this.renderPersonalPerformanceChart();
          this.renderPersonalSkillChart();
          break;
      }
    }, 100);
  }

  renderPersonalPerformanceChart() {
    const canvas = document.getElementById('personalPerformanceChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    try {
      const ctx = canvas.getContext('2d');
      const trends = this.reportData.trends || this.getDefaultTrends();

      this.chartInstances.personalPerformance = new Chart(ctx, {
        type: 'line',
        data: trends,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              title: {
                display: true,
                text: 'スコア'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          }
        }
      });
    } catch (error) {
      console.error("Reports: Failed to create personal performance chart:", error);
    }
  }

  renderPersonalSkillChart() {
    const canvas = document.getElementById('personalSkillChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    try {
      const ctx = canvas.getContext('2d');
      
      // 個人スキルデータ（ダミー）
      const skills = ['コミュニケーション', '技術力', '責任感', '協調性', 'リーダーシップ'];
      const scores = [4.2, 3.8, 4.5, 4.1, 3.6];

      this.chartInstances.personalSkill = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: skills,
          datasets: [{
            label: 'あなたのスコア',
            data: scores,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              max: 5
            }
          }
        }
      });
    } catch (error) {
      console.error("Reports: Failed to create personal skill chart:", error);
    }
  }

  renderSkillMapChart() {
    const canvas = document.getElementById('skillMapChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    try {
      const ctx = canvas.getContext('2d');
      
      // スキルマップデータ（ダミー）
      const skills = ['技術力', 'コミュニケーション', '責任感', '協調性', 'リーダーシップ', '創造性'];
      const currentLevels = [4.2, 3.8, 4.0, 4.1, 3.5, 3.2];
      const targetLevels = [4.5, 4.2, 4.3, 4.2, 4.0, 3.8];

      this.chartInstances.skillMap = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: skills,
          datasets: [{
            label: '現在のレベル',
            data: currentLevels,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)'
          }, {
            label: '目標レベル',
            data: targetLevels,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            borderDash: [5, 5]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              max: 5
            }
          }
        }
      });
    } catch (error) {
      console.error("Reports: Failed to create skill map chart:", error);
    }
  }

  renderSkillMapAnalysis() {
    const container = document.getElementById('skillAnalysis');
    if (!container) return;

    // スキル分析データ（ダミー）
    const analysis = {
      strongAreas: ['責任感', '協調性'],
      weakAreas: ['創造性', 'リーダーシップ'],
      improvements: ['技術力の向上傾向', 'コミュニケーション能力の安定']
    };

    container.innerHTML = `
      <div class="skill-analysis">
        <div class="mb-3">
          <h6 class="text-success mb-2">
            <i class="fas fa-thumbs-up me-1"></i>組織の強み
          </h6>
          <div class="skill-tags">
            ${analysis.strongAreas.map(skill => `
              <span class="badge bg-success me-1 mb-1">${skill}</span>
            `).join('')}
          </div>
        </div>
        
        <div class="mb-3">
          <h6 class="text-warning mb-2">
            <i class="fas fa-exclamation-triangle me-1"></i>改善が必要な領域
          </h6>
          <div class="skill-tags">
            ${analysis.weakAreas.map(skill => `
              <span class="badge bg-warning me-1 mb-1">${skill}</span>
            `).join('')}
          </div>
        </div>
        
        <div class="mb-3">
          <h6 class="text-info mb-2">
            <i class="fas fa-chart-line me-1"></i>改善傾向
          </h6>
          <ul class="list-unstyled">
            ${analysis.improvements.map(improvement => `
              <li class="text-muted mb-1">
                <i class="fas fa-arrow-up text-success me-1"></i>${improvement}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  renderTeamOverview() {
    const container = document.getElementById('teamMembersOverview');
    if (!container) return;

    // 担当者データ（ダミー）
    const teamMembers = [
      { name: '田中太郎', score: 4.2, trend: 'up', evaluationCount: 3 },
      { name: '佐藤花子', score: 3.8, trend: 'stable', evaluationCount: 2 },
      { name: '山田次郎', score: 4.0, trend: 'down', evaluationCount: 4 }
    ];

    container.innerHTML = `
      <div class="row">
        ${teamMembers.map(member => `
          <div class="col-md-4 mb-3">
            <div class="card border-light">
              <div class="card-body text-center">
                <h6 class="card-title">${this.app.sanitizeHtml(member.name)}</h6>
                <div class="mb-2">
                  <span class="h4 text-primary">${member.score}</span>
                  <i class="fas fa-arrow-${member.trend === 'up' ? 'up text-success' : member.trend === 'down' ? 'down text-danger' : 'right text-warning'} ms-1"></i>
                </div>
                <small class="text-muted">評価回数: ${member.evaluationCount}</small>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderImprovementSuggestions() {
    const container = document.getElementById('improvementSuggestions');
    if (!container) return;

    // 改善提案データ（ダミー）
    const suggestions = [
      {
        category: '技術力向上',
        suggestions: ['新技術の学習時間を週2時間確保', '社内勉強会への積極的参加']
      },
      {
        category: 'コミュニケーション',
        suggestions: ['チーム内での発言回数を増やす', '他部署との連携プロジェクトに参加']
      }
    ];

    container.innerHTML = `
      <div class="row">
        ${suggestions.map(category => `
          <div class="col-md-6 mb-3">
            <div class="improvement-category">
              <h6 class="text-primary mb-3">
                <i class="fas fa-target me-1"></i>${category.category}
              </h6>
              <ul class="list-group list-group-flush">
                ${category.suggestions.map(suggestion => `
                  <li class="list-group-item px-0 py-2">
                    <i class="fas fa-check text-success me-2"></i>${suggestion}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 以下、既存のメソッド群（Chart.js関連、イベントハンドラー等）は省略
  // renderPerformanceTrendChart, renderStatusDistributionChart, 
  // renderDepartmentComparisonChart, renderEvaluatorEfficiencyChart,
  // destroyAllCharts, setupEventListeners, handleTimeRangeChange,
  // refreshData, renderDetailedTable等は既存のコードを使用

  destroyAllCharts() {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        try {
          chart.destroy();
        } catch (error) {
          console.warn("Reports: Error destroying chart:", error);
        }
      }
    });
    this.chartInstances = {};
  }

  setupEventListeners() {
    // 期間選択ボタン
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTimeRangeChange(e.target.dataset.range));
    });

    // データ更新ボタン
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }
  }

  async handleTimeRangeChange(newRange) {
    if (newRange === this.currentTimeRange) return;

    this.currentTimeRange = newRange;

    // ボタンの状態更新
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.range === newRange) {
        btn.classList.add('active');
      }
    });

    // データを再読み込み
    await this.loadReportData();
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>更新中...';
      refreshBtn.disabled = true;
    }

    try {
      await this.loadReportData();
    } finally {
      if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>更新';
        refreshBtn.disabled = false;
      }
    }
  }

  renderDetailedTable() {
    const tbody = document.querySelector('#detailedDataTable tbody');
    if (!tbody) return;

    const evaluations = this.reportData.evaluations || this.reportData.evaluationHistory || [];
    
    if (evaluations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted p-4">
            <span data-i18n="common.no_data">データがありません</span>
          </td>
        </tr>
      `;
      return;
    }

    // 権限に応じてテーブルの列を調整
    const isWorker = this.userRole === 'worker';
    const columnCount = isWorker ? 5 : 6;

    tbody.innerHTML = evaluations.slice(0, 20).map(evaluation => {
      let row = `
        <td>${this.app.sanitizeHtml(evaluation.periodName || '未設定')}</td>
        <td>${this.app.sanitizeHtml(evaluation.targetUserName || '不明')}</td>
      `;
      
      if (!isWorker) {
        row += `<td>${this.app.sanitizeHtml(evaluation.evaluatorName || '未割当')}</td>`;
      }
      
      row += `
        <td>
          <span class="badge bg-info">${evaluation.finalScore || '未評価'}</span>
        </td>
        <td>
          <span class="badge ${this.getStatusBadgeClass(evaluation.status)}">
            ${this.getStatusDisplayName(evaluation.status)}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="window.app.navigate('#/evaluation-report?id=${evaluation.id}')">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      `;
      
      return `<tr>${row}</tr>`;
    }).join('');

    this.applyTranslationsToElement(tbody);
  }

  getStatusDisplayName(status) {
    const statusNames = {
      draft: '下書き',
      submitted: '提出済み',
      in_review: '審査中',
      approved: '承認済み',
      rejected: '差し戻し',
      completed: '完了'
    };
    return statusNames[status] || status;
  }

  getStatusBadgeClass(status) {
    const badgeClasses = {
      draft: 'bg-secondary',
      submitted: 'bg-primary',
      in_review: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
      completed: 'bg-info'
    };
    return badgeClasses[status] || 'bg-secondary';
  }

  applyTranslations() {
    const reportsContainer = document.querySelector('.reports-page');
    if (reportsContainer && this.app.i18n) {
      this.app.i18n.updateElement(reportsContainer);
    }
  }

  applyTranslationsToElement(element) {
    if (element && this.app.i18n) {
      this.app.i18n.updateElement(element);
    }
  }

  renderErrorState() {
    const container = document.getElementById("loading-container");
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger text-center">
          <h5 class="text-danger" data-i18n="errors.loading_failed">データの読み込みに失敗しました</h5>
          <p class="text-muted">時間をおいて再度お試しください。</p>
          <button class="btn btn-outline-danger" onclick="window.location.reload()">
            <i class="fas fa-redo me-1"></i><span data-i18n="common.retry">再試行</span>
          </button>
        </div>
      `;
      this.applyTranslationsToElement(container);
    }
  }

  cleanup() {
    this.destroyAllCharts();
    this.isInitialized = false;
    
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.replaceWith(refreshBtn.cloneNode(true));
    }
    
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.replaceWith(btn.cloneNode(true));
    });
  }

  // Chart.js関連のメソッドは既存のものを継承
  renderPerformanceTrendChart() {
    const canvas = document.getElementById('performanceTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    try {
      const ctx = canvas.getContext('2d');
      const trends = this.reportData.trends || this.getDefaultTrends();

      this.chartInstances.performanceTrend = new Chart(ctx, {
        type: 'line',
        data: trends,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              title: {
                display: true,
                text: 'スコア'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error("Reports: Failed to create performance trend chart:", error);
    }
  }

  renderStatusDistributionChart() {
    const canvas = document.getElementById('statusDistributionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    try {
      const evaluations = this.reportData.evaluations || this.reportData.evaluationHistory || [];
      const statusCounts = evaluations.reduce((acc, evaluation) => {
        acc[evaluation.status] = (acc[evaluation.status] || 0) + 1;
        return acc;
      }, {});

      const ctx = canvas.getContext('2d');
      
      this.chartInstances.statusDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts).map(status => this.getStatusDisplayName(status)),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
              '#28a745',
              '#ffc107', 
              '#dc3545',
              '#17a2b8',
              '#6c757d'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    } catch (error) {
      console.error("Reports: Failed to create status distribution chart:", error);
    }
  }

  renderDepartmentComparisonChart() {
    const canvas = document.getElementById('departmentComparisonChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    try {
      const ctx = canvas.getContext('2d');
      const departments = ['開発部', '営業部', '管理部', '人事部'];
      const scores = [4.2, 3.8, 4.0, 3.9];

      this.chartInstances.departmentComparison = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: departments,
          datasets: [{
            label: '平均スコア',
            data: scores,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 5
            }
          },
          plugins: {
            title: {
              display: true,
              text: '部署別平均スコア'
            }
          }
        }
      });
    } catch (error) {
      console.error("Reports: Failed to create department comparison chart:", error);
    }
  }

  renderEvaluatorEfficiencyChart() {
    const canvas = document.getElementById('evaluatorEfficiencyChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    try {
      const ctx = canvas.getContext('2d');
      const evaluators = ['田中', '佐藤', '山田', '鈴木'];
      const efficiency = [92, 88, 95, 85];

      this.chartInstances.evaluatorEfficiency = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: evaluators,
          datasets: [{
            label: '評価完了率(%)',
            data: efficiency,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              max: 100
            }
          },
          plugins: {
            title: {
              display: true,
              text: '評価者別完了率'
            }
          }
        }
      });
    } catch (error) {
      console.error("Reports: Failed to create evaluator efficiency chart:", error);
    }
  }
}