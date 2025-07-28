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

      // Load data first before rendering static parts dependent on data
      // これにより、renderが完了する前にデータが確実にロードされる
      await this.loadData(); 

      const userRole = this.app.currentUser?.role;
      const isManagerOrAdmin = userRole === "evaluator" || userRole === "admin"; // マネージャー（evaluator）または管理者

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
                    <span data-i18n="dashboard.system_overview"></span>
                  </p>
                </div>
                <div class="col-auto">
                  <button class="btn btn-outline-primary btn-sm" onclick="window.app.currentPage.refreshData()">
                    <i class="fas fa-sync-alt me-1"></i>
                    <span data-i18n="common.refresh"></span>
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
                        <span data-i18n="dashboard.performance_analysis"></span>
                      </h5>
                      <div class="chart-controls">
                        ${isManagerOrAdmin ? `
                          <div class="btn-group btn-group-sm me-2" role="group">
                            <button type="button" class="btn btn-outline-secondary ${this.currentChartScope === 'all' ? 'active' : ''}" data-scope="all" onclick="window.app.currentPage.switchChartScope('all')">
                              <span data-i18n="dashboard.overall_scope"></span>
                            </button>
                            <button type="button" class="btn btn-outline-secondary ${this.currentChartScope === 'personal' ? 'active' : ''}" data-scope="personal" onclick="window.app.currentPage.switchChartScope('personal')">
                              <span data-i18n="dashboard.personal_scope"></span>
                            </button>
                          </div>
                        ` : ''}
                        <div class="btn-group btn-group-sm" role="group">
                          <button type="button" class="btn btn-outline-primary ${this.currentChartType === 'radar' ? 'active' : ''}" data-chart="radar" onclick="window.app.currentPage.switchChartType('radar')">
                            <i class="fas fa-chart-area me-1"></i>
                            <span data-i18n="dashboard.radar"></span>
                          </button>
                          <button type="button" class="btn btn-outline-primary ${this.currentChartType === 'bar' ? 'active' : ''}" data-chart="bar" onclick="window.app.currentPage.switchChartType('bar')">
                            <i class="fas fa-chart-bar me-1"></i>
                            <span data-i18n="dashboard.bar"></span>
                          </button>
                          <button type="button" class="btn btn-outline-primary ${this.currentChartType === 'line' ? 'active' : ''}" data-chart="line" onclick="window.app.currentPage.switchChartType('line')">
                            <i class="fas fa-chart-line me-1"></i>
                            <span data-i18n="dashboard.line"></span>
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
                      <span data-i18n="dashboard.recent_evaluations"></span>
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
            <p><span data-i18n="dashboard.load_error"></span></p>
            <button class="btn btn-primary" onclick="location.reload()">
              <i class="fas fa-sync-alt me-1"></i>
              <span data-i18n="common.reload"></span>
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
        window.HeaderComponent.show(); // 引数なしで呼び出す
      }
      if (window.SidebarComponent) {
        window.SidebarComponent.show(); // 引数なしで呼び出す
      }

      // UI翻訳を適用
      if (this.app.i18n) {
        this.app.i18n.updateUI();
      }
      
      // render()メソッド内でawait this.loadData()が呼ばれ、その中でinitializeChart()も呼ばれる
      // そのため、init()で直接initializeChart()を呼ぶ必要はない

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

      // APIサービスが未初期化の場合に初期化を試みる
      if (!this.app?.api) {
        this.app.api = new window.API();
        this.app.api.app = this.app;
        this.app.api.init();
      }

      const currentUser = this.app.currentUser;
      if (!currentUser) {
        throw new Error("Current user is not defined.");
      }

      // ロールに基づいたチャートデータの取得
      if (currentUser.role === "worker") {
          // 作業員: 個人のチャートデータのみ
          this.chartDataPersonal = await this.app.api.getEvaluationChartData('personal', currentUser.id);
          this.chartDataAll = null; // 全体データはなし
          this.chartData = this.chartDataPersonal; // 初期は個人スコープ
          this.currentChartScope = "personal";
      } else if (currentUser.role === "evaluator") {
          // 評価者: チーム全体のチャートデータと個人のチャートデータ
          this.chartDataAll = await this.app.api.getEvaluationChartData('team', currentUser.id); // 'team'スコープを追加想定
          this.chartDataPersonal = await this.app.api.getEvaluationChartData('personal', currentUser.id);
          this.chartData = this.chartDataAll; // 初期は全体スコープ
          this.currentChartScope = "all";
      } else if (currentUser.role === "admin") {
          // 管理者: 全テナントのチャートデータ
          this.chartDataAll = await this.app.api.getEvaluationChartData('all');
          this.chartDataPersonal = await this.app.api.getEvaluationChartData('personal', currentUser.id); // 管理者自身の個人データも取得
          this.chartData = this.chartDataAll; // 初期は全体スコープ
          this.currentChartScope = "all";
      }
      
      // 統計と最近の評価の取得
      this.stats = await this.app.api.getDashboardStats(); // API内でロールフィルタリング済み
      this.recentEvaluations = await this.app.api.getRecentEvaluations(); // API内でロールフィルタリング済み

      console.log("Dashboard data loaded successfully");

      // データロードが完了したらチャートを初期化
      // render() メソッドが await this.loadData() を呼ぶため、ここで initializeChart() を呼ぶことで、
      // DOMレンダリング後にデータが揃った状態でチャートが描画されることを保証する
      this.initializeChart();

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
              <span class="badge ${this.app.getStatusBadgeClass(evaluation.status)} mb-1" data-i18n="status.${evaluation.status}">
              </span>
              <div class="small text-muted"><i class="fas fa-calendar me-1"></i>${this.app.formatDate(evaluation.submittedAt || evaluation.date)}</div>
              ${evaluation.totalScore ? `<div class="small text-primary fw-bold" data-i18n="evaluation.score_display" data-i18n-params='{"score": ${evaluation.totalScore}}'></div>` : ""}
            </div>
          </div>`).join("")}
      </div>
      <div class="text-center mt-3">
        <a href="#" onclick="window.app.navigate('/evaluations')" class="btn btn-sm btn-outline-primary">
          <i class="fas fa-list me-1"></i><span data-i18n="common.view_all"></span>
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
      console.warn("Performance chart canvas not found. Attempting fallback.");
      this.showChartFallback(null); // canvasがない場合もフォールバック表示
      return;
    }

    try {
      if (this.chart) {
        this.chart.destroy();
      }

      if (typeof Chart === "undefined") {
        console.warn("Chart.js not loaded.");
        this.showChartFallback(canvas);
        return;
      }

      const ctx = canvas.getContext("2d");
      // 現在のスコープに応じたチャートデータをセット
      const activeChartDataContainer = this.currentChartScope === 'personal' ? this.chartDataPersonal : this.chartDataAll;
      
      const chartDataToRender = activeChartDataContainer && activeChartDataContainer[this.currentChartType] ? activeChartDataContainer[this.currentChartType] : {
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
    const container = canvas ? canvas.parentElement : document.querySelector('.chart-container'); // canvasがnullの場合もコンテナを探す
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-chart-area fa-3x text-muted mb-3"></i>
          <p class="text-muted" data-i18n="dashboard.chart_load_error"></p>
          <button class="btn btn-sm btn-outline-primary" onclick="window.app.currentPage.initializeChart()">
            <i class="fas fa-sync-alt me-1"></i><span data-i18n="common.retry"></span>
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
      // chartDataAllやchartDataPersonalがnullの場合があるのでチェック
      const activeChartDataContainer = this.currentChartScope === 'personal' ? this.chartDataPersonal : this.chartDataAll;
      if (!activeChartDataContainer) {
        this.app.showWarning(this.app.i18n.t("warnings.no_data_for_scope"));
        return;
      }

      document.querySelectorAll(".chart-controls .btn-group button[data-chart]").forEach(btn => btn.classList.remove("active"));
      const activeButton = document.querySelector(`[data-chart="${type}"]`);
      if(activeButton) {
        activeButton.classList.add("active");
      }

      this.currentChartType = type;
      // 現在のスコープに応じたチャートデータを取得
      const newChartData = activeChartDataContainer[type];
      
      if (this.chart && newChartData) {
        this.chart.config.type = type;
        this.chart.data = newChartData;
        this.chart.options.scales = (type === 'radar') 
            ? { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, backdropColor: "rgba(255, 255, 255, 0.75)" }, grid: { color: "#e0e0e0" }, angleLines: { color: "#e0e0e0" } } } 
            : { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } };
        this.chart.update();
      } else {
        this.app.showError(this.app.i18n.t("errors.chart_data_unavailable"));
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
          // chartDataAllやchartDataPersonalがnullの場合があるのでチェック
          if (!this.chartDataAll && !this.chartDataPersonal) {
              this.app.showWarning(this.app.i18n.t("warnings.no_data_for_scope"));
              return;
          }

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
              // データがない場合はチャートをクリア
              if (this.chart) {
                this.chart.destroy();
                this.chart = null;
              }
              this.showChartFallback(null); // フォールバック表示
              return;
          }

          if (this.chart && newChartData) {
              this.chart.data = newChartData;
              this.chart.update();
          } else if (newChartData) { // チャートがまだ初期化されていないがデータはある場合
              this.initializeChart(); // 再初期化
          }
          else {
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
      await this.loadData(); // データ再ロード
      
      // UI要素を再レンダリング (render()でまとめて行う方が確実だが、部分更新の例として)
      const statsContainer = document.querySelector(".row.mb-4");
      if (statsContainer) statsContainer.innerHTML = this.renderStatsCards();
      
      const recentContainerParent = document.querySelector(".recent-evaluations")?.parentElement;
      if (recentContainerParent) recentContainerParent.innerHTML = this.renderRecentEvaluations();
      
      // チャートはloadData()の最後で initializeChart() が呼ばれるため、ここでは不要

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
