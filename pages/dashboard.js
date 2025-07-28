/**
 * Dashboard Page Component (Final Layout Fix & Full Methods)
 * ダッシュボードページコンポーネント (最終レイアウト修正 & 完全版メソッド)
 */
class DashboardPage {
  constructor(app) {
    this.app = app;
    this.stats = null;
    this.recentEvaluations = [];
    this.chartData = null;
    this.chart = null;
  }

  async render() {
    await this.loadData();
    return `
      <div class="dashboard-page">
        <div class="page-header">
          <div class="row align-items-center">
            <div class="col">
              <h1 class="page-title h2 mb-1"><i class="fas fa-tachometer-alt me-2 text-primary"></i>ダッシュボード</h1>
              <p class="page-subtitle text-muted mb-0">システム概要と最新の活動状況</p>
            </div>
            <div class="col-auto">
              <button class="btn btn-outline-primary btn-sm" id="refreshDashboardBtn"><i class="fas fa-sync-alt me-1"></i>更新</button>
            </div>
          </div>
        </div>
        <div class="dashboard-content container-fluid">
          <div class="row mb-4">${this.renderStatsCards()}</div>
          <div class="row">
            <div class="col-lg-8 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0"><i class="fas fa-chart-radar me-2 text-info"></i>パフォーマンス分析</h5>
                  <div class="btn-group btn-group-sm" id="chartTypeBtnGroup">
                      <button type="button" class="btn btn-outline-primary active" data-chart-type="radar">レーダー</button>
                      <button type="button" class="btn btn-outline-primary" data-chart-type="bar">バー</button>
                      <button type="button" class="btn btn-outline-primary" data-chart-type="line">ライン</button>
                  </div>
                </div>
                <div class="card-body">
                  <div class="chart-container" style="position: relative; height: 350px;">
                    <canvas id="performanceChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white"><h5 class="card-title mb-0"><i class="fas fa-clock me-2 text-warning"></i>最近の評価</h5></div>
                <div class="card-body p-0">${this.renderRecentEvaluations()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    // レイアウトを強制的に修正するCSSをページの<head>に直接挿入
    const styleId = 'dashboard-layout-fix';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = `
      .main-content > .dashboard-page {
        padding: 0 !important;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 56px);
      }
      .dashboard-page .page-header {
        padding: 1.5rem;
        background-color: #fff;
        border-bottom: 1px solid #dee2e6;
        flex-shrink: 0;
      }
      .dashboard-page .dashboard-content {
        padding: 1.5rem;
        flex-grow: 1;
        overflow-y: auto;
      }
    `;

    this.setupEventListeners();
    this.initializeChart();
  }

  setupEventListeners() {
    document.getElementById('refreshDashboardBtn')?.addEventListener('click', () => this.refreshData());
    document.getElementById('chartTypeBtnGroup')?.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            this.switchChart(e.target.dataset.chartType);
        }
    });
  }

  async loadData() {
    // Mock data from api.js
    const api = this.app.api || new window.API();
    try {
        const [stats, recentEvaluations, chartData] = await Promise.all([
            api.getDashboardStats(),
            api.getRecentEvaluations(),
            api.getEvaluationChartData()
        ]);
        this.stats = stats;
        this.recentEvaluations = recentEvaluations;
        this.chartData = chartData;
    } catch (error) {
        console.error("Failed to load dashboard data", error);
        this.stats = { totalEmployees: 0, pendingEvaluations: 0, completedEvaluations: 0, averageScore: 0 };
        this.recentEvaluations = [];
        this.chartData = { radar: { labels: [], datasets: [] }, bar: { labels: [], datasets: [] }, line: { labels: [], datasets: [] } };
    }
  }

  renderStatsCards() {
    if (!this.stats) return "";
    const cards = [
      { title: "総従業員数", value: this.stats.totalEmployees, icon: "fas fa-users" },
      { title: "未完了評価", value: this.stats.pendingEvaluations, icon: "fas fa-clock" },
      { title: "完了評価", value: this.stats.completedEvaluations, icon: "fas fa-check-circle" },
      { title: "平均スコア", value: this.stats.averageScore.toFixed(1), icon: "fas fa-star" },
    ];
    const colors = ["bg-primary", "bg-warning", "bg-success", "bg-info"];

    return cards.map((card, index) => `
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card text-white shadow h-100 ${colors[index]}">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-uppercase mb-1">${card.title}</div>
                <div class="h5 mb-0 font-weight-bold">${card.value}</div>
              </div>
              <div class="col-auto"><i class="${card.icon} fa-2x opacity-75"></i></div>
            </div>
          </div>
        </div>
      </div>`).join('');
  }

  renderRecentEvaluations() {
    if (!this.recentEvaluations || this.recentEvaluations.length === 0) {
      return `<div class="text-center text-muted p-3">最近の評価はありません</div>`;
    }
    return `
      <ul class="list-group list-group-flush">
        ${this.recentEvaluations.map(e => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-0">${e.employeeName}</h6>
              <small class="text-muted">${e.department}</small>
            </div>
            <div class="text-end">
              <span class="badge ${e.status === 'completed' ? 'bg-success' : 'bg-warning'}">${e.status === 'completed' ? '完了' : '未完了'}</span>
              <div class="small text-muted mt-1">${e.date}</div>
            </div>
          </li>
        `).join('')}
      </ul>
      <div class="text-center mt-3">
        <a href="#" onclick="event.preventDefault(); window.app.navigate('/evaluations')" class="btn btn-sm btn-outline-primary">すべて表示</a>
      </div>
    `;
  }

  initializeChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    this.chart = new Chart(canvas.getContext('2d'), {
      type: 'radar',
      data: this.chartData.radar,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } }
      }
    });
  }
  
  switchChart(type) {
    if (!this.chart || !this.chartData[type]) return;

    // Update active button state
    document.querySelectorAll('#chartTypeBtnGroup button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.chartType === type);
    });

    this.chart.config.type = type;
    this.chart.data = this.chartData[type];
    this.chart.options.scales = (type === 'radar') 
        ? { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } } 
        : { y: { beginAtZero: true, max: 100 } };
    this.chart.update();
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if(refreshBtn) refreshBtn.disabled = true;

    await this.loadData();
    
    // Re-render the dynamic parts of the page
    document.querySelector('.row.mb-4').innerHTML = this.renderStatsCards();
    document.querySelector('.col-lg-4 .card-body').innerHTML = this.renderRecentEvaluations();
    this.initializeChart();

    if(refreshBtn) refreshBtn.disabled = false;
    this.app.showSuccess("ダッシュボードを更新しました。");
  }
}

window.DashboardPage = DashboardPage;
