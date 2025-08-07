/**
 * Dashboard Page Component (Stable Version with Error Handling)
 * ダッシュボードページコンポーネント（エラーハンドリング強化・安定版）
 */
export class DashboardPage {
  constructor(app) {
    this.app = app;
    this.stats = null;
    this.recentEvaluations = [];
    this.chartData = null;
    this.chart = null;
    this.currentChartType = "radar";
    this.isInitialized = false;
  }

  async render() {
    return `
      <div class="dashboard-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1" data-i18n="nav.dashboard">ダッシュボード</h1>
          <p class="page-subtitle text-muted mb-0" data-i18n="dashboard.system_overview">システム概要と最新の活動状況</p>
        </div>

        <div class="row mb-4" id="stats-cards-container">
          ${this.renderLoadingState('stats')}
        </div>

        <div class="row">
          <div class="col-lg-8 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0 card-title-icon"><i class="fas fa-chart-line me-2 text-primary"></i><span data-i18n="dashboard.performance_chart"></span></h5>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-secondary chart-type-btn active" data-type="radar"><i class="fas fa-spider-web"></i></button>
                    <button type="button" class="btn btn-outline-secondary chart-type-btn" data-type="bar"><i class="fas fa-chart-bar"></i></button>
                </div>
              </div>
              <div class="card-body" id="performance-chart-container">
                ${this.renderLoadingState('chart')}
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0 card-title-icon"><i class="fas fa-history me-2 text-primary"></i><span data-i18n="dashboard.recent_evaluations"></span></h5>
              </div>
              <div class="card-body p-0" id="recent-evaluations-container">
                ${this.renderLoadingState('list')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    if (this.isInitialized) return;
    try {
      await this.loadData();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log("Dashboard: Initialization completed successfully");
    } catch (error) {
      console.error("Dashboard: Initialization error:", error);
      this.renderErrorState();
      this.app.showError("ダッシュボードの読み込み中にエラーが発生しました。");
    }
  }

  renderLoadingState(type) {
      if (type === 'stats') {
          return `<div class="col-12"><div class="card card-body text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div></div>`;
      }
      return `<div class="d-flex justify-content-center align-items-center h-100 p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
  }

  async loadData() {
    console.log("Dashboard: Loading data...");
    
    if (!this.app.api) {
        throw new Error("APIが初期化されていません");
    }

    const [statsResult, evaluationsResult, chartDataResult] = await Promise.allSettled([
      this.app.api.getDashboardStats(),
      this.app.api.getRecentEvaluations(),
      this.app.api.getEvaluationChartData()
    ]);

    this.stats = statsResult.status === 'fulfilled' ? statsResult.value : this.getDefaultStats();
    if (statsResult.status === 'rejected') console.warn("Dashboard: Stats loading failed.", statsResult.reason);
    
    this.recentEvaluations = evaluationsResult.status === 'fulfilled' ? evaluationsResult.value : [];
    if (evaluationsResult.status === 'rejected') console.warn("Dashboard: Recent evaluations loading failed.", evaluationsResult.reason);

    this.chartData = chartDataResult.status === 'fulfilled' ? chartDataResult.value : this.getDefaultChartData();
    if (chartDataResult.status === 'rejected') console.warn("Dashboard: Chart data loading failed.", chartDataResult.reason);

    this.renderStatsCards();
    this.renderRecentEvaluations();
    this.initializeChart();
    this.app.i18n.updateUI();
  }
  
  getDefaultStats() {
    return { totalUsers: 0, completedEvaluations: 0, pendingEvaluations: 0 };
  }
  
  getDefaultChartData() {
      return { labels: [], datasets: [] };
  }
  
  renderStatsCards() {
    const container = document.getElementById("stats-cards-container");
    if (!container) return;
    
    const stats = this.stats || this.getDefaultStats();
    
    container.innerHTML = `
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-users fa-2x text-primary me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="dashboard.total_users">総ユーザー数</h6>
              <div class="card-title h4 mb-0">${stats.totalUsers}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-check-circle fa-2x text-success me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="dashboard.completed_evaluations">完了済み評価</h6>
              <div class="card-title h4 mb-0">${stats.completedEvaluations}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-hourglass-half fa-2x text-warning me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="dashboard.pending_evaluations">承認待ち評価</h6>
              <div class="card-title h4 mb-0">${stats.pendingEvaluations}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRecentEvaluations() {
    const container = document.getElementById("recent-evaluations-container");
    if (!container) return;

    if (!this.recentEvaluations || this.recentEvaluations.length === 0) {
      container.innerHTML = `<div class="text-center p-4 text-muted" data-i18n="dashboard.no_recent_evaluations">最近の評価はありません。</div>`;
      return;
    }

    container.innerHTML = `
      <ul class="list-group list-group-flush">
        ${this.recentEvaluations.map(e => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${this.app.sanitizeHtml(e.targetUserName)}</strong>
              <small class="d-block text-muted">${this.app.sanitizeHtml(e.periodName)}</small>
            </div>
            <span class="badge ${this.app.getStatusBadgeClass(e.status)}">${this.app.i18n.t(`status.${e.status}`)}</span>
          </li>
        `).join('')}
      </ul>
      <div class="card-footer text-center">
        <a href="#/evaluations" class="btn btn-sm btn-outline-primary" data-link data-i18n="common.view_all"></a>
      </div>
    `;
  }

  initializeChart() {
    const container = document.getElementById("performance-chart-container");
    if (!container) return;

    container.innerHTML = '<canvas id="performanceChart"></canvas>';
    const canvas = document.getElementById("performanceChart");

    if (typeof Chart === 'undefined') {
      console.error("Dashboard: Chart.js not available");
      container.innerHTML = `<div class="alert alert-warning text-center" data-i18n="errors.chart_library_failed"></div>`;
      return;
    }
    
    if (!this.chartData || this.chartData.labels.length === 0) {
        container.innerHTML = `<div class="alert alert-info text-center p-5" data-i18n="common.no_data"></div>`;
        return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas.getContext('2d'), {
      type: this.currentChartType,
      data: this.chartData,
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
  }
  
  setupEventListeners() {
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchChartType(e.currentTarget.dataset.type));
    });
  }

  switchChartType(type) {
    this.currentChartType = type;
    document.querySelectorAll('.chart-type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.chart-type-btn[data-type="${type}"]`).classList.add('active');
    this.initializeChart();
  }

  renderErrorState() {
    const container = document.getElementById("stats-cards-container");
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="card card-body text-center border-danger">
            <h5 class="text-danger" data-i18n="errors.loading_failed">データの読み込みに失敗しました。</h5>
            <p class="text-muted">時間をおいて再度お試しください。</p>
            <div class="mt-2">
              <button class="btn btn-sm btn-outline-primary" id="retry-load-btn">
                <i class="fas fa-redo me-1"></i><span data-i18n="common.retry">再試行</span>
              </button>
            </div>
          </div>
        </div>
      `;
      document.getElementById("recent-evaluations-container").innerHTML = '';
      document.getElementById("performance-chart-container").innerHTML = '';
      document.getElementById('retry-load-btn').addEventListener('click', () => this.retryLoad());
    }
  }

  async retryLoad() {
    document.getElementById("stats-cards-container").innerHTML = this.renderLoadingState('stats');
    document.getElementById("recent-evaluations-container").innerHTML = this.renderLoadingState('list');
    document.getElementById("performance-chart-container").innerHTML = this.renderLoadingState('chart');
    await this.loadData();
  }

  cleanup() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.isInitialized = false;
    console.log("Dashboard cleaned up.");
  }
}
