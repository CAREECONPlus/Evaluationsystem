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
    this.chartDataAll = null; // 全体のチャートデータ
    this.chartDataPersonal = null; // 個人のチャートデータ
    this.currentChartScope = "all"; // 'all' or 'personal'
  }

  /**
   * Render dashboard page
   * ダッシュボードページを描画
   */
  async render() {
    try {
      console.log("Rendering dashboard page...");

      // Load data first
      await this.loadData();

      const userRole = this.app.currentUser?.role;
      const isManagerOrAdmin = userRole === "manager" || userRole === "admin";

      return `
        <div class="dashboard-page">
          <div class="page-header mb-4">
            <div class="container-fluid">
              <div class="row align-items-center">
                <div class="col">
                  <h1 class="page-title h2 mb-1">
                    <i class="fas fa-tachometer-alt me-2 text-primary"></i>
                    <span data-i18n="nav.dashboard"></span>
                  </h1>
                  <p class="page-subtitle text-muted mb-0">
                    <span data-i18n="dashboard.system_overview">システム概要と最新の活動状況</span>
                  </p>
                </div>
                <div class="col-auto">
                  <button class="btn btn-outline-primary btn-sm" onclick="window.app.currentPage.refreshData()">
                    <i class="fas fa-sync-alt me-1"></i>
                    <span data-i18n="common.refresh">更新</span>
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
                        <span data-i18n="dashboard.performance_analysis">パフォーマンス分析</span>
                      </h5>
                      <div class="chart-controls">
                        ${isManagerOrAdmin ? `
                          <div class="btn-group btn-group-sm me-2" role="group">
                            <button type="button" class="btn btn-outline-secondary ${this.currentChartScope === 'all' ? 'active' : ''}" data-scope="all" onclick="window.app.currentPage.switchChartScope('all')">
                              <span data-i18n="dashboard.overall_scope">全体</span>
                            </button>
                            <button type="button" class="btn btn-outline-secondary ${this.currentChartScope === 'personal' ? 'active' : ''}" data-scope="personal" onclick="window.app.currentPage.switchChartScope('personal')">
                              <span data-i18n="dashboard.personal_scope">個人</span>
                            </button>
                          </div>
                        ` : ''}
                        <div class="btn-group btn-group-sm" role="group">
                          <button type="button" class="btn btn-outline-primary ${this.currentChartType === 'radar' ? 'active' : ''}" data-chart="radar" onclick="window.app.currentPage.switchChartType('radar')">
                            <i class="fas fa-chart-area me-1"></i>
                            <span data-i18n="dashboard.radar">レーダー</span>
                          </button>
                          <button type="button" class="btn btn-outline-primary ${this.currentChartType === 'bar' ? 'active' : ''}" data-chart="bar" onclick="window.app.currentPage.switchChartType('bar')">
                            <i class="fas fa-chart-bar me-1"></i>
                            <span data-i18n="dashboard.bar">バー</span>
                          </button>
                          <button type="button" class="btn btn-outline-primary ${this.currentChartType === 'line' ? 'active' : ''}" data-chart="line" onclick="window.app.currentPage.switchChartType('line')">
                            <i class="fas fa-chart-line me-1"></i>
                            <span data-i18n="dashboard.line">ライン</span>
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
                      <span data-i18n="dashboard.recent_evaluations">最近の評価</span>
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
      `;
    } catch (error) {
      console.error("Error rendering dashboard:", error);
      return `
        <div class="container-fluid">
          <div class="alert alert-danger">
            <h4><i class="fas fa-exclamation-triangle me-2"></i><span data-i18n="common.error"></span></h4>
            <p><span data-i18n="dashboard.load_error">ダッシュボードの読み込みに失敗しました。</span></p>
            <button class="btn btn-primary" onclick="location.reload()">
              <i class="fas fa-sync-alt me-1"></i>
              <span data-i18n="common.reload">再読み込み</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Initialize dashboard page
   * ダッシュボードページを初期化
   */
  async init() {
    try {
      console.log("Initializing dashboard page...");
      
      this.app.currentPage = this;

      // Check authentication
      if (!this.app?.currentUser) {
        console.log("No authenticated user, redirecting to login");
        this.app?.navigate("/login");
        return;
      }

      // Update header and sidebar (App.jsで制御されるが念のため)
      if (window.HeaderComponent) {
        window.HeaderComponent.show(this.app.currentUser);
      }
      if (window.SidebarComponent) {
        window.SidebarComponent.show(this.app.currentUser);
      }

      // Initialize chart after DOM is ready
      setTimeout(() => {
        this.initializeChart();
      }, 100);

      // UI翻訳を適用
      if (this.app.i18n) {
        this.app.i18n.updateUI();
      }

      console.log("Dashboard page initialized successfully");
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      this.app?.showError(this.app.i18n.t("errors.dashboard_init_failed"));
    }
  }

  /**
   * Load dashboard data
   * ダッシュボードデータを読み込み
   */
  async loadData() {
    try {
      console.log("Loading dashboard data...");

      if (!this.app?.api) {
        const apiInstance = new window.API();
        apiInstance.app = this.app;
        apiInstance.init();
        this.app.api = apiInstance;
      }

      const userRole = this.app.currentUser?.role;
      const currentUserId = this.app.currentUser?.id;

      let statsPromise;
      let recentEvaluationsPromise;
      let chartDataPromise;

      // ロールに基づいたデータ取得ロジック
      if (userRole === "admin") {
        // 管理者: 全テナントの統計、全ての最近の評価、全体のチャートデータ
        statsPromise = this.app.api.getDashboardStats(); // 現在のモックは全体データ
        recentEvaluationsPromise = this.app.api.getRecentEvaluations(); // 現在のモックは全体データ
        chartDataPromise = this.app.api.getEvaluationChartData(); // 現在のモックは全体データ
      } else if (userRole === "manager") {
        // マネージャー: チームの統計、チームの最近の評価、チームと個人のチャートデータ
        statsPromise = this.app.api.getDashboardStats(); // モックデータではチームの概念がないため、一旦全体
        recentEvaluationsPromise = this.app.api.getRecentEvaluations(); // モックデータではチームの概念がないため、一旦全体
        
        // チャートデータは「全体」と「個人」の両方を持つ
        const allChartData = await this.app.api.getEvaluationChartData(); // 全体データ
        const personalChartData = this.getPersonalChartData(allChartData, currentUserId); // 個人のモックデータ生成
        this.chartDataAll = allChartData;
        this.chartDataPersonal = personalChartData;
        chartDataPromise = Promise.resolve(allChartData); // 初期表示は全体
      } else if (userRole === "worker") {
        // 作業員: 個人の統計、個人の最近の評価、個人のチャートデータ
        statsPromise = this.app.api.getDashboardStats(); // モックデータでは個人の統計がないため、一旦全体
        recentEvaluationsPromise = this.app.api.getRecentEvaluations(); // モックデータでは個人にフィルタリング
        chartDataPromise = Promise.resolve(this.getPersonalChartData(await this.app.api.getEvaluationChartData(), currentUserId)); // 個人のモックデータ生成
      }

      const [stats, recentEvaluations, chartData] = await Promise.all([
        statsPromise,
        recentEvaluationsPromise,
        chartDataPromise,
      ]);

      this.stats = stats;
      
      // 最近の評価データをロールに基づいてフィルタリング（モック）
      if (userRole === "worker") {
        this.recentEvaluations = recentEvaluations.filter(evalItem => evalItem.employeeName === this.app.currentUser.name); // 例: 従業員名でフィルタ
      } else if (userRole === "manager") {
        // マネージャーの場合、自分が評価した従業員、または自分の評価を表示する
        this.recentEvaluations = recentEvaluations.filter(evalItem => 
            evalItem.evaluatorName === this.app.currentUser.name || evalItem.employeeName === this.app.currentUser.name
        );
      } else {
        this.recentEvaluations = recentEvaluations;
      }
      
      // チャートデータの初期設定
      if (userRole === "manager") {
          this.chartData = this.chartDataAll; // マネージャーは初期は全体を表示
          this.currentChartScope = "all";
      } else if (userRole === "worker") {
          this.chartData = this.chartDataPersonal; // 作業員は個人を表示
          this.currentChartScope = "personal";
      } else { // admin
          this.chartData = chartData;
          this.currentChartScope = "all";
      }

      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback data
      this.stats = { totalEmployees: 0, pendingEvaluations: 0, completedEvaluations: 0, averageScore: 0 };
      this.recentEvaluations = [];
      this.chartData = { radar: { labels: [], datasets: [] }, bar: { labels: [], datasets: [] }, line: { labels: [], datasets: [] } };
      this.chartDataAll = null;
      this.chartDataPersonal = null;
      this.app.showError(this.app.i18n.t("errors.dashboard_load_failed"));
    }
  }

  // 個人のチャートデータを生成するモック関数
  getPersonalChartData(allChartData, userId) {
      // 例として、従業員ユーザー（id=3）のデータに固定
      // 実際にはAPIで個人の評価データを取得する
      if (userId === "3") { // employee@example.com のID
          return {
              radar: {
                  labels: ["技術力", "コミュニケーション", "リーダーシップ", "安全管理", "チームワーク", "積極性"],
                  datasets: [
                      {
                          label: "従業員個人のスコア",
                          data: [75, 80, 70, 90, 85, 70], // 個人向けの異なるデータ
                          backgroundColor: "rgba(255, 99, 132, 0.2)",
                          borderColor: "rgba(255, 99, 132, 1)",
                          borderWidth: 2,
                          pointBackgroundColor: "rgba(255, 99, 132, 1)",
                          pointBorderColor: "#fff",
                          pointHoverBackgroundColor: "#fff",
                          pointHoverBorderColor: "rgba(255, 99, 132, 1)",
                      },
                  ],
              },
              bar: {
                  labels: ["技術力", "コミュニケーション", "リーダーシップ", "安全管理", "チームワーク", "積極性"],
                  datasets: [
                      {
                          label: "従業員個人のスコア",
                          data: [75, 80, 70, 90, 85, 70],
                          backgroundColor: [
                              "rgba(255, 99, 132, 0.8)",
                              "rgba(54, 162, 235, 0.8)",
                              "rgba(255, 205, 86, 0.8)",
                              "rgba(75, 192, 192, 0.8)",
                              "rgba(153, 102, 255, 0.8)",
                              "rgba(255, 159, 64, 0.8)",
                          ],
                          borderColor: [
                              "rgba(255, 99, 132, 1)",
                              "rgba(54, 162, 235, 1)",
                              "rgba(255, 205, 86, 1)",
                              "rgba(75, 192, 192, 1)",
                              "rgba(153, 102, 255, 1)",
                              "rgba(255, 159, 64, 1)",
                          ],
                          borderWidth: 1,
                      },
                  ],
              },
              line: {
                  labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
                  datasets: [
                      {
                          label: "従業員個人のスコア推移",
                          data: [70, 75, 80, 78, 85, 82],
                          fill: false,
                          borderColor: "rgba(255, 99, 132, 1)",
                          backgroundColor: "rgba(255, 99, 132, 0.2)",
                          tension: 0.1,
                      },
                  ],
              },
          };
      }
      return { radar: { labels: [], datasets: [] }, bar: { labels: [], datasets: [] }, line: { labels: [], datasets: [] } }; // それ以外のユーザーは空
  }


  /**
   * Render stats cards
   * 統計カードを描画
   */
  renderStatsCards() {
    if (!this.stats) return "";

    const cards = [
      { titleKey: "dashboard.total_employees", value: this.stats.totalEmployees, icon: "fas fa-users", bgColor: "bg-primary" },
      { titleKey: "dashboard.pending_evaluations_count", value: this.stats.pendingEvaluations, icon: "fas fa-clock", bgColor: "bg-warning" },
      { titleKey: "dashboard.completed_evaluations_count", value: this.stats.completedEvaluations, icon: "fas fa-check-circle", bgColor: "bg-success" },
      { titleKey: "dashboard.average_score", value: this.stats.averageScore.toFixed(1), icon: "fas fa-star", bgColor: "bg-info" },
    ];

    const userRole = this.app.currentUser?.role;

    // 作業員アカウントの場合、一部の統計情報を非表示にするか、個人の情報に調整する (現在は表示)
    // 今後のバックエンド実装で個人の統計情報が提供されるようになれば、そのデータを使う
    if (userRole === "worker") {
        // 例えば、作業員は「総従業員数」や「未完了評価（全体）」は不要、個人の評価数のみ
        // 現時点ではモックの制約でそのまま表示
        // return `<div class="col-xl-3 col-md-6 mb-4">...個人の統計カードのみ...</div>`;
    }


    return cards.map(card => `
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card ${card.bgColor} text-white shadow h-100">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-uppercase mb-1" style="font-size: 0.7rem;" data-i18n="${card.titleKey}"></div>
                <div class="h4 mb-0 font-weight-bold">${card.value}</div>
              </div>
              <div class="col-auto"><i class="${card.icon} fa-2x opacity-75"></i></div>
            </div>
          </div>
        </div>
      </div>`).join("");
  }

  /**
   * Render recent evaluations
   * 最近の評価を描画
   */
  renderRecentEvaluations() {
    if (!this.recentEvaluations || this.recentEvaluations.length === 0) {
      return `<div class="text-center py-4"><i class="fas fa-inbox fa-3x text-muted mb-3"></i><p class="text-muted" data-i18n="dashboard.no_recent_evaluations"></p></div>`;
    }

    return `
      <div class="recent-evaluations">
        ${this.recentEvaluations.map(evaluation => `
          <div class="evaluation-item d-flex justify-content-between align-items-center py-3 border-bottom">
            <div class="evaluation-info">
              <h6 class="mb-1 fw-bold">${this.app.sanitizeHtml(evaluation.employeeName)}</h6>
              <small class="text-muted"><i class="fas fa-building me-1"></i>${this.app.sanitizeHtml(evaluation.department)}</small>
            </div>
            <div class="evaluation-status text-end">
              <span class="badge ${evaluation.status === "completed" ? "bg-success" : "bg-warning"} mb-1" data-i18n="status.${evaluation.status}">
              </span>
              <div class="small text-muted"><i class="fas fa-calendar me-1"></i>${this.app.formatDate(evaluation.date)}</div>
              ${evaluation.score ? `<div class="small text-primary fw-bold" data-i18n="evaluation.score_display" data-i18n-params='{"score": ${evaluation.score}}'></div>` : ""}
            </div>
          </div>`).join("")}
      </div>
      <div class="text-center mt-3">
        <a href="#" onclick="window.app.navigate('/evaluations')" class="btn btn-sm btn-outline-primary">
          <i class="fas fa-list me-1"></i><span data-i18n="common.view_all">すべて表示</span>
        </a>
      </div>`;
  }

  /**
   * Initialize performance chart
   * パフォーマンスチャートを初期化
   */
  initializeChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas) {
      console.warn("Performance chart canvas not found");
      return;
    }

    try {
      if (this.chart) {
        this.chart.destroy();
      }

      if (typeof Chart === "undefined") {
        console.warn("Chart.js not loaded");
        this.showChartFallback(canvas);
        return;
      }

      const ctx = canvas.getContext("2d");
      // 現在のスコープに応じたチャートデータをセット
      const activeChartData = this.currentChartScope === 'personal' && this.chartDataPersonal ? this.chartDataPersonal[this.currentChartType] : this.chartData[this.currentChartType];
      
      const chartDataToRender = activeChartData || {
        labels: [this.app.i18n.t("common.no_data")],
        datasets: [{ label: this.app.i18n.t("evaluation.average_score"), data: [0] }],
      };

      this.chart = new Chart(ctx, {
        type: this.currentChartType,
        data: chartDataToRender,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: (this.currentChartType === 'radar') 
            ? { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, backdropColor: "rgba(255, 255, 255, 0.75)" }, grid: { color: "#e0e0e0" }, angleLines: { color: "#e0e0e0" } } } 
            : { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
          plugins: {
            legend: { position: "top" },
            tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.raw}点` } },
          },
        },
      });

      console.log("Chart initialized successfully with type:", this.currentChartType, "scope:", this.currentChartScope);
    } catch (error) {
      console.error("Error initializing chart:", error);
      this.showChartFallback(canvas);
    }
  }

  /**
   * Show chart fallback
   * チャートフォールバックを表示
   */
  showChartFallback(canvas) {
    const container = canvas.parentElement;
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-chart-area fa-3x text-muted mb-3"></i>
          <p class="text-muted" data-i18n="dashboard.chart_load_error"></p>
          <button class="btn btn-sm btn-outline-primary" onclick="window.app.currentPage.initializeChart()">
            <i class="fas fa-sync-alt me-1"></i><span data-i18n="common.retry">再試行</span>
          </button>
        </div>`;
      this.app.i18n.updateUI(container); // 翻訳適用
    }
  }

  /**
   * Switch chart type
   * チャートタイプを切り替え
   */
  switchChartType(type) {
    try {
      if (!this.chart || !this.chartData) return;

      document.querySelectorAll(".chart-controls .btn-group button[data-chart]").forEach(btn => btn.classList.remove("active"));
      const activeButton = document.querySelector(`[data-chart="${type}"]`);
      if(activeButton) {
        activeButton.classList.add("active");
      }

      this.currentChartType = type;
      // 現在のスコープに応じたチャートデータを取得
      const activeChartData = this.currentChartScope === 'personal' && this.chartDataPersonal ? this.chartDataPersonal[type] : this.chartData[type];
      
      if (activeChartData) {
        this.chart.config.type = type;
        this.chart.data = activeChartData;
        this.chart.options.scales = (type === 'radar') 
            ? { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, backdropColor: "rgba(255, 255, 255, 0.75)" }, grid: { color: "#e0e0e0" }, angleLines: { color: "#e0e0e0" } } } 
            : { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } };
        this.chart.update();
      }
    } catch (error) {
      console.error("Error switching chart type:", error);
      this.app.showError(this.app.i18n.t("errors.chart_switch_failed"));
    }
  }

  /**
   * Switch chart scope (all / personal)
   * チャートの表示範囲を切り替え (全体 / 個人)
   */
  switchChartScope(scope) {
      try {
          if (!this.chart || (!this.chartDataAll && !this.chartDataPersonal)) return;

          document.querySelectorAll(".chart-controls .btn-group button[data-scope]").forEach(btn => btn.classList.remove("active"));
          const activeButton = document.querySelector(`[data-scope="${scope}"]`);
          if(activeButton) {
              activeButton.classList.add("active");
          }

          this.currentChartScope = scope;
          let newChartData = null;

          if (scope === 'all' && this.chartDataAll) {
              newChartData = this.chartDataAll[this.currentChartType];
          } else if (scope === 'personal' && this.chartDataPersonal) {
              newChartData = this.chartDataPersonal[this.currentChartType];
          } else {
              this.app.showWarning(this.app.i18n.t("warnings.no_data_for_scope"));
              return;
          }

          if (newChartData) {
              this.chart.data = newChartData;
              this.chart.update();
          } else {
              this.app.showError(this.app.i18n.t("errors.chart_data_unavailable"));
          }
      } catch (error) {
          console.error("Error switching chart scope:", error);
          this.app.showError(this.app.i18n.t("errors.chart_scope_switch_failed"));
      }
  }


  /**
   * Refresh dashboard data
   * ダッシュボードデータを更新
   */
  async refreshData() {
    const refreshBtn = document.querySelector('button[onclick="window.app.currentPage.refreshData()"]');
    try {
      if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i><span data-i18n="common.refreshing"></span>`;
        this.app.i18n.updateUI(refreshBtn); // 翻訳適用
      }
      await this.loadData();
      
      const statsContainer = document.querySelector(".row.mb-4");
      if (statsContainer) statsContainer.innerHTML = this.renderStatsCards();
      
      const recentContainerParent = document.querySelector(".recent-evaluations")?.parentElement;
      if (recentContainerParent) recentContainerParent.innerHTML = this.renderRecentEvaluations();
      
      this.initializeChart(); // チャートも再初期化

      // 各要素の翻訳を再度適用
      if (this.app.i18n) {
        this.app.i18n.updateUI(document.getElementById('dashboard-page')); // ダッシュボード全体のコンテナに適用
      }

      this.app?.showSuccess(this.app.i18n.t("messages.dashboard_updated"));
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      this.app?.showError(this.app.i18n.t("errors.dashboard_refresh_failed"));
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `<i class="fas fa-sync-alt me-1"></i><span data-i18n="common.refresh"></span>`;
        this.app.i18n.updateUI(refreshBtn); // 翻訳適用
      }
    }
  }

  /**
   * Get days until deadline
   * 期限までの日数を取得
   */
  getDaysUntilDeadline() {
    const deadline = new Date("2025-09-30");
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}

// Make DashboardPage globally available
window.DashboardPage = DashboardPage;
