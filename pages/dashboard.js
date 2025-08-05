/**
 * Dashboard Page Component (Stable Version with Error Handling)
 * ダッシュボードページコンポーネント（エラーハンドリング強化版）
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

  /**
   * Render dashboard page
   * ダッシュボードページを描画します
   */
  async render() {
    return `
      <div class="dashboard-page p-4">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1" data-i18n="nav.dashboard">ダッシュボード</h1>
          <p class="page-subtitle text-muted mb-0" data-i18n="dashboard.system_overview">システム概要と最新の活動状況</p>
        </div>

        <div class="row mb-4" id="stats-cards-container">
          <div class="col-12">
            <div class="d-flex justify-content-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-8 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0" data-i18n="dashboard.performance_analysis">パフォーマンス分析</h5>
                <div class="chart-controls btn-group btn-group-sm">
                  <button type="button" class="btn btn-outline-primary active" data-chart="radar">
                    <i class="fas fa-chart-area me-1"></i><span data-i18n="dashboard.radar">レーダー</span>
                  </button>
                  <button type="button" class="btn btn-outline-primary" data-chart="bar">
                    <i class="fas fa-chart-bar me-1"></i><span data-i18n="dashboard.bar">バー</span>
                  </button>
                  <button type="button" class="btn btn-outline-primary" data-chart="line">
                    <i class="fas fa-chart-line me-1"></i><span data-i18n="dashboard.line">ライン</span>
                  </button>
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
              <div class="card-header bg-white">
                <h5 class="card-title mb-0" data-i18n="dashboard.recent_evaluations">最近の評価</h5>
              </div>
              <div class="card-body" id="recent-evaluations-container">
                <div class="d-flex justify-content-center">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize dashboard page
   * ダッシュボードページを初期化します
   */
  async init() {
    console.log("Dashboard: Starting initialization...");
    
    this.app.currentPage = this;
    
    // 認証チェック
    if (!this.app.isAuthenticated()) {
      console.log("Dashboard: User not authenticated, redirecting to login");
      this.app.navigate("#/login");
      return;
    }

    try {
      // イベントリスナーを設定
      this.setupEventListeners();
      
      // データを読み込み
      await this.loadData();
      
      this.isInitialized = true;
      console.log("Dashboard: Initialization completed successfully");
      
    } catch (error) {
      console.error("Dashboard: Initialization error:", error);
      
      // エラーが発生してもダッシュボードを表示
      this.renderErrorState();
      
      // エラーメッセージを表示
      this.app.showError("ダッシュボードの読み込み中にエラーが発生しました。");
    }
  }

  setupEventListeners() {
    try {
      // チャート切り替えボタンのイベントリスナー
      document.addEventListener('click', (e) => {
        const chartBtn = e.target.closest('[data-chart]');
        if (chartBtn && chartBtn.closest('.dashboard-page')) {
          this.switchChartType(chartBtn.dataset.chart);
        }
      });
      
      console.log("Dashboard: Event listeners setup completed");
    } catch (error) {
      console.error("Dashboard: Error setting up event listeners:", error);
    }
  }

  /**
   * Load dashboard data from Firebase
   * Firebaseからダッシュボードのデータを読み込みます
   */
  async loadData() {
    try {
      console.log("Dashboard: Loading data...");
      
      // 並列でデータを取得（エラーが発生しても他の処理を続行）
      const [stats, recentEvaluations, chartData] = await Promise.allSettled([
        this.loadStats(),
        this.loadRecentEvaluations(),
        this.loadChartData()
      ]);

      // 統計データの処理
      if (stats.status === 'fulfilled') {
        this.stats = stats.value;
      } else {
        console.error("Dashboard: Error loading stats:", stats.reason);
        this.stats = { totalUsers: 0, completedEvaluations: 0, pendingEvaluations: 0 };
      }

      // 最近の評価データの処理
      if (recentEvaluations.status === 'fulfilled') {
        this.recentEvaluations = recentEvaluations.value;
      } else {
        console.error("Dashboard: Error loading recent evaluations:", recentEvaluations.reason);
        this.recentEvaluations = [];
      }

      // チャートデータの処理
      if (chartData.status === 'fulfilled') {
        this.chartData = chartData.value;
      } else {
        console.error("Dashboard: Error loading chart data:", chartData.reason);
        this.chartData = this.getDefaultChartData();
      }

      // UIを更新
      this.renderStatsCards();
      this.renderRecentEvaluations();
      this.initializeChart();
      this.app.i18n.updateUI();

      console.log("Dashboard: Data loading completed");
      
    } catch (error) {
      console.error("Dashboard: Fatal error loading data:", error);
      throw error;
    }
  }

  async loadStats() {
    try {
      return await this.app.api.getDashboardStats();
    } catch (error) {
      console.error("Dashboard: Stats loading error:", error);
      return { totalUsers: 0, completedEvaluations: 0, pendingEvaluations: 0 };
    }
  }

  async loadRecentEvaluations() {
    try {
      return await this.app.api.getRecentEvaluations();
    } catch (error) {
      console.error("Dashboard: Recent evaluations loading error:", error);
      return [];
    }
  }

  async loadChartData() {
    try {
      return await this.app.api.getEvaluationChartData();
    } catch (error) {
      console.error("Dashboard: Chart data loading error:", error);
      return this.getDefaultChartData();
    }
  }

  getDefaultChartData() {
    const chartLabels = [
      this.app.i18n.t('chart_items.technical_skill'),
      this.app.i18n.t('chart_items.quality'),
      this.app.i18n.t('chart_items.safety'),
      this.app.i18n.t('chart_items.cooperation'),
      this.app.i18n.t('chart_items.diligence')
    ];
    
    const defaultData = {
      labels: chartLabels,
      datasets: [
        { 
          label: this.app.i18n.t('dashboard.personal_score'), 
          data: [0, 0, 0, 0, 0], 
          backgroundColor: 'rgba(54, 162, 235, 0.2)', 
          borderColor: 'rgb(54, 162, 235)' 
        }
      ]
    };
    
    return { radar: defaultData, bar: defaultData, line: defaultData };
  }

  /**
   * Renders the statistics cards.
   * 統計カードを描画します。
   */
  renderStatsCards() {
    const container = document.getElementById("stats-cards-container");
    if (!container) return;
    
    try {
      const cards = [
        { 
          titleKey: "dashboard.total_employees", 
          value: this.stats?.totalUsers || 0, 
          icon: "fas fa-users", 
          color: "primary" 
        },
        { 
          titleKey: "dashboard.pending_evaluations_count", 
          value: this.stats?.pendingEvaluations || 0, 
          icon: "fas fa-clock", 
          color: "warning" 
        },
        { 
          titleKey: "dashboard.completed_evaluations_count", 
          value: this.stats?.completedEvaluations || 0, 
          icon: "fas fa-check-circle", 
          color: "success" 
        },
      ];

      container.innerHTML = cards.map(card => `
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm h-100 border-0">
            <div class="card-body text-center">
              <div class="mb-3">
                <i class="${card.icon} fa-2x text-${card.color}"></i>
              </div>
              <h3 class="card-title display-6 fw-bold text-${card.color}">${card.value}</h3>
              <p class="card-text text-muted" data-i18n="${card.titleKey}"></p>
            </div>
          </div>
        </div>
      `).join("");
      
    } catch (error) {
      console.error("Dashboard: Error rendering stats cards:", error);
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            統計データの表示中にエラーが発生しました。
          </div>
        </div>
      `;
    }
  }

  /**
   * Renders the list of recent evaluations.
   * 最近の評価リストを描画します。
   */
  renderRecentEvaluations() {
    const container = document.getElementById("recent-evaluations-container");
    if (!container) return;
    
    try {
      if (!this.recentEvaluations || this.recentEvaluations.length === 0) {
        container.innerHTML = `
          <div class="text-center text-muted py-4">
            <i class="fas fa-clipboard-list fa-2x mb-3 opacity-50"></i>
            <p data-i18n="dashboard.no_recent_evaluations">最近の評価はありません</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = `
        <div class="list-group list-group-flush">
          ${this.recentEvaluations.map(e => `
            <a href="#/report?id=${e.id}" class="list-group-item list-group-item-action border-0" data-link>
              <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">${this.app.sanitizeHtml(e.targetUserName || '名前なし')}</h6>
                  <small class="text-muted">${this.app.formatDate(e.submittedAt)}</small>
                </div>
                <span class="badge ${this.app.getStatusBadgeClass(e.status)}" data-i18n="status.${e.status}"></span>
              </div>
            </a>
          `).join("")}
        </div>
      `;
      
    } catch (error) {
      console.error("Dashboard: Error rendering recent evaluations:", error);
      container.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          評価データの表示中にエラーが発生しました。
        </div>
      `;
    }
  }

  /**
   * Initializes or updates the performance chart.
   * パフォーマンスチャートを初期化または更新します。
   */
  initializeChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas || !this.chartData) return;
    
    try {
      // 既存のチャートを破棄
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }

      const ctx = canvas.getContext("2d");
      
      // Chart.jsが利用可能かチェック
      if (typeof Chart === 'undefined') {
        console.error("Dashboard: Chart.js not available");
        canvas.parentElement.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-chart-area me-2"></i>
            チャートライブラリが読み込まれていません。
          </div>
        `;
        return;
      }

      this.chart = new Chart(ctx, {
        type: this.currentChartType,
        data: this.chartData[this.currentChartType],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: this.currentChartType === 'radar' 
            ? { 
                r: { 
                  beginAtZero: true, 
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  pointLabels: {
                    font: {
                      size: 12
                    }
                  }
                } 
              } 
            : { 
                y: { 
                  beginAtZero: true,
                  max: 100
                } 
              }
        }
      });
      
      console.log("Dashboard: Chart initialized successfully");
      
    } catch (error) {
      console.error("Dashboard: Error initializing chart:", error);
      const chartContainer = canvas.parentElement;
      if (chartContainer) {
        chartContainer.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-chart-area me-2"></i>
            チャートの表示中にエラーが発生しました。
          </div>
        `;
      }
    }
  }

  /**
   * Switches the chart type and re-initializes the chart.
   * チャートの種類を切り替えて再初期化します。
   * @param {string} type - 'radar', 'bar', or 'line'
   */
  switchChartType(type) {
    if (!['radar', 'bar', 'line'].includes(type)) {
      console.error("Dashboard: Invalid chart type:", type);
      return;
    }
    
    try {
      this.currentChartType = type;
      
      // ボタンの状態を更新
      document.querySelectorAll(".chart-controls .btn").forEach(btn => {
        btn.classList.remove("active");
      });
      
      const activeBtn = document.querySelector(`[data-chart="${type}"]`);
      if (activeBtn) {
        activeBtn.classList.add("active");
      }
      
      // チャートを再初期化
      this.initializeChart();
      
      console.log("Dashboard: Chart type switched to:", type);
      
    } catch (error) {
      console.error("Dashboard: Error switching chart type:", error);
    }
  }

  /**
   * Renders error state when initialization fails
   * 初期化失敗時のエラー状態を描画
   */
  renderErrorState() {
    try {
      const container = document.getElementById("stats-cards-container");
      if (container) {
        container.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger">
              <h4 class="alert-heading">
                <i class="fas fa-exclamation-triangle me-2"></i>
                読み込みエラー
              </h4>
              <p>ダッシュボードデータの読み込み中にエラーが発生しました。</p>
              <hr>
              <button class="btn btn-outline-danger" onclick="window.location.reload()">
                <i class="fas fa-redo me-2"></i>ページを再読み込み
              </button>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error("Dashboard: Error rendering error state:", error);
    }
  }

  /**
   * Cleanup method
   * クリーンアップメソッド
   */
  cleanup() {
    try {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      console.log("Dashboard: Cleanup completed");
    } catch (error) {
      console.error("Dashboard: Cleanup error:", error);
    }
  }
}
