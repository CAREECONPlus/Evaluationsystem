/**
 * Dashboard Page Component
 * ダッシュボードページコンポーネント
 */
class DashboardPage {
  constructor(app) {
    this.app = app
    this.stats = null
    this.recentEvaluations = []
    this.chartData = null
    this.chart = null // this.chart は引き続き新しいインスタンスを保持するために使います
    this.currentChartType = "radar"
  }

  /**
   * Render dashboard page
   * ダッシュボードページを描画
   */
  async render() {
    try {
      console.log("Rendering dashboard page...")

      // Load data first
      await this.loadData()

      return `
        <div class="dashboard-page">
          <div class="page-header mb-4">
            <div class="container-fluid">
              <div class="row align-items-center">
                <div class="col">
                  <h1 class="page-title h2 mb-1">
                    <i class="fas fa-tachometer-alt me-2 text-primary"></i>
                    ダッシュボード
                  </h1>
                  <p class="page-subtitle text-muted mb-0">
                    システム概要と最新の活動状況
                  </p>
                </div>
                <div class="col-auto">
                  <button class="btn btn-outline-primary btn-sm" onclick="window.dashboardPage.refreshData()">
                    <i class="fas fa-sync-alt me-1"></i>
                    更新
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="container-fluid">
            <div class="row mb-4">
              ${this.renderStatsCards()}
            </div>

            <div class="row">
              <div class="col-lg-8 mb-4">
                <div class="card shadow-sm h-100">
                  <div class="card-header bg-white border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-chart-radar me-2 text-info"></i>
                        パフォーマンス分析
                      </h5>
                      <div class="chart-controls">
                        <div class="btn-group btn-group-sm" role="group">
                          <button type="button" class="btn btn-outline-primary active" data-chart="radar" onclick="window.dashboardPage.switchChart('radar')">
                            <i class="fas fa-chart-area me-1"></i>
                            レーダー
                          </button>
                          <button type="button" class="btn btn-outline-primary" data-chart="bar" onclick="window.dashboardPage.switchChart('bar')">
                            <i class="fas fa-chart-bar me-1"></i>
                            バー
                          </button>
                          <button type="button" class="btn btn-outline-primary" data-chart="line" onclick="window.dashboardPage.switchChart('line')">
                            <i class="fas fa-chart-line me-1"></i>
                            ライン
                          </button>
                        </div>
                      </div>
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
                  <div class="card-header bg-white border-bottom">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-clock me-2 text-warning"></i>
                      最近の評価
                    </h5>
                  </div>
                  <div class="card-body">
                    ${this.renderRecentEvaluations()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    } catch (error) {
      console.error("Error rendering dashboard:", error)
      return `
        <div class="container-fluid">
          <div class="alert alert-danger">
            <h4><i class="fas fa-exclamation-triangle me-2"></i>エラー</h4>
            <p>ダッシュボードの読み込みに失敗しました。</p>
            <button class="btn btn-primary" onclick="location.reload()">
              <i class="fas fa-sync-alt me-1"></i>
              再読み込み
            </button>
          </div>
        </div>
      `
    }
  }

  /**
   * Initialize dashboard page
   * ダッシュボードページを初期化
   */
  async init() {
    try {
      console.log("Initializing dashboard page...")

      // Check authentication
      if (!this.app?.currentUser) {
        console.log("No authenticated user, redirecting to login")
        this.app?.navigate("/login")
        return
      }

      // Update header and sidebar
      if (window.HeaderComponent) {
        window.HeaderComponent.show(this.app.currentUser)
      }
      if (window.SidebarComponent) {
        window.SidebarComponent.show(this.app.currentUser)
      }

      // Initialize chart after DOM is ready
      setTimeout(() => {
        this.initializeChart()
      }, 100) // 短縮して描画を高速化

      console.log("Dashboard page initialized successfully")
    } catch (error) {
      console.error("Error initializing dashboard:", error)
      this.app?.showError("ダッシュボードの初期化に失敗しました。")
    }
  }

  /**
   * Load dashboard data
   * ダッシュボードデータを読み込み
   */
  async loadData() {
    try {
      console.log("Loading dashboard data...")

      if (!this.app?.api) {
        const apiInstance = new window.API()
        apiInstance.app = this.app
        apiInstance.init()
        this.app.api = apiInstance
      }

      const [stats, recentEvaluations, chartData] = await Promise.all([
        this.app.api.getDashboardStats(),
        this.app.api.getRecentEvaluations(),
        this.app.api.getEvaluationChartData(),
      ])

      this.stats = stats
      this.recentEvaluations = recentEvaluations
      this.chartData = chartData

      console.log("Dashboard data loaded successfully")
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      // Fallback data
      this.stats = { totalEmployees: 0, pendingEvaluations: 0, completedEvaluations: 0, averageScore: 0 }
      this.recentEvaluations = []
      this.chartData = { radar: { labels: [], datasets: [] } }
    }
  }

  /**
   * Render stats cards
   * 統計カードを描画
   */
  renderStatsCards() {
    if (!this.stats) return ""

    const cards = [
      { title: "総従業員数", value: this.stats.totalEmployees, icon: "fas fa-users", bgColor: "bg-primary" },
      { title: "未完了評価", value: this.stats.pendingEvaluations, icon: "fas fa-clock", bgColor: "bg-warning" },
      { title: "完了評価", value: this.stats.completedEvaluations, icon: "fas fa-check-circle", bgColor: "bg-success" },
      { title: "平均スコア", value: this.stats.averageScore.toFixed(1), icon: "fas fa-star", bgColor: "bg-info" },
    ]

    return cards.map(card => `
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card ${card.bgColor} text-white shadow h-100">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-uppercase mb-1" style="font-size: 0.7rem;">${card.title}</div>
                <div class="h4 mb-0 font-weight-bold">${card.value}</div>
              </div>
              <div class="col-auto"><i class="${card.icon} fa-2x opacity-75"></i></div>
            </div>
          </div>
        </div>
      </div>`).join("")
  }

  /**
   * Render recent evaluations
   * 最近の評価を描画
   */
  renderRecentEvaluations() {
    if (!this.recentEvaluations || this.recentEvaluations.length === 0) {
      return `<div class="text-center py-4"><i class="fas fa-inbox fa-3x text-muted mb-3"></i><p class="text-muted">最近の評価はありません</p></div>`
    }

    return `
      <div class="recent-evaluations">
        ${this.recentEvaluations.map(evaluation => `
          <div class="evaluation-item d-flex justify-content-between align-items-center py-3 border-bottom">
            <div class="evaluation-info">
              <h6 class="mb-1 fw-bold">${evaluation.employeeName}</h6>
              <small class="text-muted"><i class="fas fa-building me-1"></i>${evaluation.department}</small>
            </div>
            <div class="evaluation-status text-end">
              <span class="badge ${evaluation.status === "completed" ? "bg-success" : "bg-warning"} mb-1">
                ${evaluation.status === "completed" ? "完了" : "未完了"}
              </span>
              <div class="small text-muted"><i class="fas fa-calendar me-1"></i>${evaluation.date}</div>
              ${evaluation.score ? `<div class="small text-primary fw-bold">スコア: ${evaluation.score}点</div>` : ""}
            </div>
          </div>`).join("")}
      </div>
      <div class="text-center mt-3">
        <a href="#" onclick="window.app.navigate('/evaluations')" class="btn btn-sm btn-outline-primary">
          <i class="fas fa-list me-1"></i>すべて表示
        </a>
      </div>`
  }

  /**
   * Initialize performance chart
   * パフォーマンスチャートを初期化
   */
  initializeChart() {
    const canvas = document.getElementById("performanceChart")
    if (!canvas) {
      console.warn("Performance chart canvas not found")
      return
    }

    try {
      // ★★★ 修正点 ★★★
      // IDを使って既存のチャートインスタンスを確実に取得し、存在すれば破棄する
      const existingChart = Chart.getChart("performanceChart");
      if (existingChart) {
          existingChart.destroy();
      }

      if (typeof Chart === "undefined") {
        console.warn("Chart.js not loaded")
        this.showChartFallback(canvas)
        return
      }

      const ctx = canvas.getContext("2d")
      const chartData = this.chartData?.radar || {
        labels: ["データなし"],
        datasets: [{ label: "平均スコア", data: [0] }],
      }

      this.chart = new Chart(ctx, {
        type: "radar",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
          plugins: {
            legend: { position: "top" },
            tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.r}点` } },
          },
        },
      })

      console.log("Chart initialized successfully")
    } catch (error) {
      console.error("Error initializing chart:", error)
      this.showChartFallback(canvas)
    }
  }

  /**
   * Show chart fallback
   * チャートフォールバックを表示
   */
  showChartFallback(canvas) {
    const container = canvas.parentElement
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-chart-area fa-3x text-muted mb-3"></i>
          <p class="text-muted">チャートを読み込めませんでした</p>
          <button class="btn btn-sm btn-outline-primary" onclick="window.dashboardPage.initializeChart()">
            <i class="fas fa-sync-alt me-1"></i>再試行
          </button>
        </div>`
    }
  }

  /**
   * Switch chart type
   * チャートタイプを切り替え
   */
  switchChart(type) {
    try {
      if (!this.chart || !this.chartData) return;

      document.querySelectorAll(".chart-controls .btn").forEach(btn => btn.classList.remove("active"))
      document.querySelector(`[data-chart="${type}"]`).classList.add("active")

      const newData = this.chartData[type]
      if (newData) {
        this.chart.config.type = type
        this.chart.data = newData
        this.chart.options.scales = (type === 'radar') ? { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } } : { y: { beginAtZero: true, max: 100 } };
        this.chart.update()
      }
    } catch (error) {
      console.error("Error switching chart:", error)
    }
  }

  /**
   * Refresh dashboard data
   * ダッシュボードデータを更新
   */
  async refreshData() {
    const refreshBtn = document.querySelector('button[onclick="window.dashboardPage.refreshData()"]')
    try {
      if (refreshBtn) {
        refreshBtn.disabled = true
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>更新中...'
      }
      await this.loadData()
      
      const statsContainer = document.querySelector(".row.mb-4")
      if (statsContainer) statsContainer.innerHTML = this.renderStatsCards()
      
      const recentContainer = document.querySelector(".recent-evaluations")?.parentElement
      if (recentContainer) recentContainer.innerHTML = this.renderRecentEvaluations()
      
      this.initializeChart()
      this.app?.showSuccess("ダッシュボードを更新しました。")
    } catch (error) {
      console.error("Error refreshing dashboard:", error)
      this.app?.showError("ダッシュボードの更新に失敗しました。")
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>更新'
      }
    }
  }

  /**
   * Get days until deadline
   * 期限までの日数を取得
   */
  getDaysUntilDeadline() {
    const deadline = new Date("2025-09-30") // 未来の日付に更新
    const today = new Date()
    const diffTime = deadline - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }
}

// Make DashboardPage globally available
window.DashboardPage = DashboardPage
