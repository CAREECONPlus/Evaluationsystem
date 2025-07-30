/**
 * Dashboard Page Component
 * ダッシュボードページコンポーネント
 */
class DashboardPage {
  constructor(app) {
    this.app = app;
    this.stats = null;
    this.recentEvaluations = [];
    this.chartData = null;
    this.chart = null; // チャートインスタンスを保持
    this.currentChartType = "radar";
  }

  /**
   * Render dashboard page
   */
  async render() {
    return `
      <div class="dashboard-page p-4">
        <div class.="page-header mb-4">
          <h1 class="page-title h2 mb-1" data-i18n="nav.dashboard"></h1>
          <p class="page-subtitle text-muted mb-0" data-i18n="dashboard.system_overview"></p>
        </div>

        <div class="row mb-4" id="stats-cards-container"></div>

        <div class="row">
          <div class="col-lg-8 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0" data-i18n="dashboard.performance_analysis"></h5>
                <div class="chart-controls btn-group btn-group-sm">
                  <button type="button" class="btn btn-outline-primary active" data-chart="radar" onclick="window.app.currentPage.switchChartType('radar')"><i class="fas fa-chart-area me-1"></i><span data-i18n="dashboard.radar"></span></button>
                  <button type="button" class="btn btn-outline-primary" data-chart="bar" onclick="window.app.currentPage.switchChartType('bar')"><i class="fas fa-chart-bar me-1"></i><span data-i18n="dashboard.bar"></span></button>
                  <button type="button" class="btn btn-outline-primary" data-chart="line" onclick="window.app.currentPage.switchChartType('line')"><i class="fas fa-chart-line me-1"></i><span data-i18n="dashboard.line"></span></button>
                </div>
              </div>
              <div class="card-body">
                <div class="chart-container" style="position: relative; height: 400px;">
                  <canvas id="performanceChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white"><h5 class="card-title mb-0" data-i18n="dashboard.recent_evaluations"></h5></div>
              <div class="card-body" id="recent-evaluations-container"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize dashboard page
   */
  async init() {
    this.app.currentPage = this;
    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }
    await this.loadData();
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  /**
   * Load dashboard data
   */
  async loadData() {
    try {
      const [stats, recentEvaluations, chartData] = await Promise.all([
        this.app.api.getDashboardStats(),
        this.app.api.getRecentEvaluations(),
        this.app.api.getEvaluationChartData(),
      ]);
      this.stats = stats;
      this.recentEvaluations = recentEvaluations;
      this.chartData = chartData;

      this.renderStatsCards();
      this.renderRecentEvaluations();
      this.initializeChart();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.app.showError(this.app.i18n.t("errors.dashboard_load_failed"));
    }
  }

  renderStatsCards() {
    const container = document.getElementById("stats-cards-container");
    if (!container || !this.stats) return;
    const cards = [
      { titleKey: "dashboard.total_employees", value: this.stats.totalEmployees, icon: "fas fa-users" },
      { titleKey: "dashboard.pending_evaluations_count", value: this.stats.pendingEvaluations, icon: "fas fa-clock" },
      { titleKey: "dashboard.completed_evaluations_count", value: this.stats.completedEvaluations, icon: "fas fa-check-circle" },
      { titleKey: "dashboard.average_score", value: this.stats.averageScore.toFixed(1), icon: "fas fa-star" },
    ];
    container.innerHTML = cards.map(card => `
      <div class="col-md-3 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <i class="${card.icon} fa-2x text-primary mb-2"></i>
            <h3 class="card-title">${card.value}</h3>
            <p class="card-text text-muted" data-i18n="${card.titleKey}"></p>
          </div>
        </div>
      </div>`).join("");
  }

  renderRecentEvaluations() {
    const container = document.getElementById("recent-evaluations-container");
    if (!container) return;
    if (!this.recentEvaluations || this.recentEvaluations.length === 0) {
      container.innerHTML = `<p class="text-muted text-center" data-i18n="dashboard.no_recent_evaluations"></p>`;
      return;
    }
    container.innerHTML = `
      <div class="list-group list-group-flush">
        ${this.recentEvaluations.map(e => `
          <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1">${this.app.sanitizeHtml(e.employeeName)}</h6>
              <small>${this.app.formatDate(e.submittedAt)}</small>
            </div>
            <p class="mb-1">
              <span class="badge ${this.app.getStatusBadgeClass(e.status)}" data-i18n="status.${e.status}"></span>
            </p>
          </div>
        `).join("")}
      </div>`;
  }

  /**
   * ★★★ 修正: チャートの破棄と再生成を確実に行う ★★★
   */
  initializeChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas || !this.chartData) return;
    
    // 既存のチャートインスタンスを確実に破棄
    if (this.chart) {
      this.chart.destroy();
    }
    // Chart.js v3+では、グローバルなインスタンスも破棄できる
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    this.chart = new Chart(ctx, {
      type: this.currentChartType,
      data: this.chartData[this.currentChartType],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: this.currentChartType === 'radar' 
          ? { r: { beginAtZero: true, max: 100 } } 
          : { y: { beginAtZero: true } }
      }
    });
  }

  switchChartType(type) {
    this.currentChartType = type;
    document.querySelectorAll(".chart-controls .btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-chart="${type}"]`).classList.add("active");
    this.initializeChart(); // タイプを切り替えたら再初期化
  }
}

window.DashboardPage = DashboardPage;
