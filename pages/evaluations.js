/**
 * Evaluations Page Component
 * 評価一覧ページコンポーネント
 */
class EvaluationsPage {
  constructor(app) {
    this.app = app;
    this.evaluations = [];
    this.filteredEvaluations = [];
    this.selectedEvaluation = null;
    this.currentView = "list";
    this.chart = null; // Chart.js インスタンスを保持
    this.evaluationPeriods = []; // 評価期間のデータ
  }

  async render() {
    return `
      <div class="evaluations-page">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h1 data-i18n="nav.evaluations"></h1>
          <div class="view-controls btn-group">
            <button class="btn btn-primary" id="listViewBtn" onclick="window.app.currentPage.switchView('list')" data-i18n="evaluations.list_view"></button>
            <button class="btn btn-outline-primary" id="chartViewBtn" onclick="window.app.currentPage.switchView('chart')" data-i18n="evaluations.chart_view"></button>
          </div>
        </div>
        
        <div class="view-content active" id="listView">
          <div class="card mb-3">
            <div class="card-body">
              <div class="filters-row">
                <div class="form-group">
                  <label for="periodFilter" class="form-label" data-i18n="evaluation.period"></label>
                  <select id="periodFilter" class="form-select"></select>
                </div>
                <div class="form-group">
                  <label for="statusFilter" class="form-label" data-i18n="users.status"></label>
                  <select id="statusFilter" class="form-select">
                    <option value="all" data-i18n="common.all"></option>
                    <option value="completed" data-i18n="status.completed"></option>
                    <option value="pending" data-i18n="status.pending"></option>
                    <option value="self_assessed" data-i18n="status.self_assessed"></option>
                    <option value="approved_by_evaluator" data-i18n="status.approved_by_evaluator"></option>
                    <option value="rejected" data-i18n="status.rejected"></option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="userFilter" class="form-label" data-i18n="evaluation.target"></label>
                  <input type="text" id="userFilter" class="form-control" data-i18n-placeholder="common.search_by_name">
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="table-responsive" id="evaluationsTableContainer"></div>
            </div>
          </div>
        </div>
        
        <div class="view-content" id="chartView" style="display: none;">
          <div class="chart-layout">
            <div class="card">
              <div class="card-header"><h5 data-i18n="evaluations.select_eval"></h5></div>
              <div class="card-body">
                <div class="list-group evaluation-list-group" id="evaluationSelector"></div>
              </div>
            </div>
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 data-i18n="evaluations.chart_title"></h5>
                <button class="btn btn-sm btn-outline-secondary" id="exportChartBtn" disabled onclick="window.app.currentPage.exportChart()">
                  <i class="fas fa-download me-1"></i><span data-i18n="common.export"></span>
                </button>
              </div>
              <div class="card-body">
                <div id="chartContainer" class="d-flex align-items-center justify-content-center" style="min-height: 400px;">
                  <div class="chart-placeholder text-center"><p data-i18n="evaluations.select_to_view_chart"></p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this; // 現在のページインスタンスを登録

    // 権限チェック
    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }

    // APIサービスが未初期化の場合に初期化を試みる
    if (!this.app.api) {
      this.app.api = new window.API();
      this.app.api.app = this.app;
      this.app.api.init();
    }

    await this.loadEvaluationPeriods(); // 評価期間を先にロード
    await this.loadEvaluations();       // 評価データをロード

    // 初期ビューのレンダリング
    this.renderListView();
    this.renderChartView();
    this.setupEventListeners();

    if (this.app.i18n) {
      this.app.i18n.updateUI(); // 初期UIの翻訳を適用
    }
  }

  setupEventListeners() {
    // フィルターのイベントリスナーを設定
    const userFilter   = document.getElementById('userFilter');
    const periodFilter = document.getElementById('periodFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (userFilter)   userFilter.addEventListener('keyup', this.app.debounce(() => this.filterEvaluations(), 300));
    if (periodFilter) periodFilter.addEventListener('change', () => this.filterEvaluations());
    if (statusFilter) statusFilter.addEventListener('change', () => this.filterEvaluations());
  }

  /**
   * Load evaluations based on user role and apply filters.
   */
  async loadEvaluations() {
    const tableContainer = document.getElementById("evaluationsTableContainer");
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">${this.app.i18n.t('common.loading')}</span>
          </div>
        </div>`;
      this.app.i18n.updateUI(tableContainer);
    }

    try {
      // APIから評価データを取得。APIサービス内でロールに応じたフィルタリングが行われる想定。
      this.evaluations = await this.app.api.getEvaluations();
      this.filteredEvaluations = [...this.evaluations]; // 初期フィルタリング済みデータ
      this.filterEvaluations(); // 初期フィルターを適用してレンダリング

    } catch (error) {
      console.error("Error loading evaluations:", error);
      this.app.showError(this.app.i18n.t("errors.evaluation_load_failed"));
      if (tableContainer) {
        tableContainer.innerHTML = `
          <div class="text-center text-danger p-5">
            ${this.app.i18n.t('errors.loading_failed')}
          </div>`;
        this.app.i18n.updateUI(tableContainer);
      }
    }
  }
  
  /**
   * Load evaluation periods for filter dropdown.
   */
  async loadEvaluationPeriods() {
    try {
      // APIから評価期間を取得
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();

      const periodFilter = document.getElementById("periodFilter");
      if (periodFilter) {
        periodFilter.innerHTML = `<option value="all" data-i18n="common.all">${this.app.i18n.t('common.all')}</option>`;
        this.evaluationPeriods.forEach(period => {
          const option = document.createElement("option");
          option.value = period.id;
          option.textContent = this.app.sanitizeHtml(period.name);
          periodFilter.appendChild(option);
        });
        this.app.i18n.updateUI(periodFilter); // 翻訳適用
      }
    } catch (error) {
      console.error("Error loading evaluation periods for filter:", error);
      this.app.showError(this.app.i18n.t("errors.evaluation_periods_load_failed"));
    }
  }

  /**
   * Apply filters (user input, period, status) to evaluations.
   */
  filterEvaluations() {
    const userFilterEl    = document.getElementById('userFilter');
    const periodFilterEl  = document.getElementById('periodFilter');
    const statusFilterEl  = document.getElementById('statusFilter');

    // nullチェックを入れて例外を防止
    const userQuery         = userFilterEl    ? userFilterEl.value.toLowerCase()    : '';
    const periodFilterValue = periodFilterEl  ? periodFilterEl.value                 : 'all';
    const statusFilterValue = statusFilterEl  ? statusFilterEl.value                 : 'all';

    this.filteredEvaluations = this.evaluations.filter(e => {
      const matchesUser   = !userQuery || e.employeeName.toLowerCase().includes(userQuery) || e.evaluatorName.toLowerCase().includes(userQuery);
      const matchesPeriod = periodFilterValue === "all" || e.period === periodFilterValue;
      const matchesStatus = statusFilterValue === "all" || e.status === statusFilterValue;
      return matchesUser && matchesPeriod && matchesStatus;
    });
    this.renderEvaluationsTable();
    this.renderChartView(); // フィルターが変更されたらチャートビューも更新
  }

  /**
   * Switch between list view and chart view.
   */
  switchView(view) {
    this.currentView = view;
    document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
    document.getElementById('chartView').style.display = view === 'chart' ? 'block' : 'none';
    
    document.getElementById('listViewBtn').classList.toggle('btn-primary', view === 'list');
    document.getElementById('listViewBtn').classList.toggle('btn-outline-primary', view !== 'list');
    document.getElementById('chartViewBtn').classList.toggle('btn-primary', view === 'chart');
    document.getElementById('chartViewBtn').classList.toggle('btn-outline-primary', view !== 'chart');

    if (view === 'chart') {
      this.selectedEvaluation = null;
      document.getElementById('exportChartBtn').disabled = true;
      const chartContainer = document.getElementById('chartContainer');
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      if (chartContainer) {
        chartContainer.innerHTML = `<div class="chart-placeholder text-center"><p data-i18n="evaluations.select_to_view_chart"></p></div>`;
        this.app.i18n.updateUI(chartContainer);
      }
      this.renderChartView();
    }
  }

  renderListView() {
    this.renderEvaluationsTable();
  }
  
  /**
   * Render the list of completed evaluations for chart selection.
   */
  renderChartView() {
    const selector = document.getElementById('evaluationSelector');
    const completedEvals = this.evaluations.filter(e => e.status === 'completed');
    if (!selector) return;

    if (completedEvals.length === 0) {
      selector.innerHTML = `<p class="text-muted text-center" data-i18n="evaluations.no_completed_evals"></p>`;
      this.app.i18n.updateUI(selector);
      return;
    }
    selector.innerHTML = completedEvals.map(e => `
      <a href="#" class="list-group-item list-group-item-action" data-id="${e.id}"
         onclick="event.preventDefault(); window.app.currentPage.selectEvaluationForChart('${e.id}');">
        ${this.app.sanitizeHtml(e.employeeName)} <span class="badge bg-secondary float-end">${this.app.sanitizeHtml(e.period)}</span>
      </a>
    `).join('');
    this.app.i18n.updateUI(selector);
  }

  /**
   * Render the main evaluations table.
   */
  renderEvaluationsTable() {
    const container = document.getElementById('evaluationsTableContainer');
    if (!container) return;

    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `<p class="text-muted text-center" data-i18n="common.no_data"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }
    const tableRows = this.filteredEvaluations.map(e => `
      <tr>
        <td>${this.app.sanitizeHtml(e.employeeName)}</td>
        <td>${this.app.sanitizeHtml(e.evaluatorName)}</td>
        <td>${this.app.sanitizeHtml(e.period)}</td>
        <td><span class="badge ${this.app.getStatusBadgeClass(e.status)}">${this.app.i18n.t(`status.${e.status}`)}</span></td>
        <td>${e.totalScore ? `<span class="score-badge">${e.totalScore.toFixed(1)}</span>` : '-'}</td>
        <td>${e.submittedAt ? this.app.formatDate(e.submittedAt) : '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${e.id}" 
                  onclick="window.app.currentPage.viewEvaluationDetails('${e.id}')" 
                  ${!e.totalScore ? 'disabled' : ''} data-i18n="common.details"></button>
        </td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <table class="table table-hover">
        <thead><tr>
          <th data-i18n="evaluation.target"></th><th data-i18n="evaluation.evaluator"></th><th data-i18n="evaluation.period"></th>
          <th data-i18n="users.status"></th><th data-i18n="evaluation.total_score"></th><th data-i18n="evaluation.submit_date"></th>
          <th data-i18n="common.actions"></th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    this.app.i18n.updateUI(container);
  }
  
  /**
   * Select an evaluation to display in the chart.
   */
  selectEvaluationForChart(evalId) {
    /* 省略: 既存ロジック */
  }
  
  /**
   * Export the currently displayed chart as an image.
   */
  exportChart() {
    /* 省略: 既存ロジック */
  }

  /**
   * Show evaluation details in a modal.
   */
  viewEvaluationDetails(evalId) {
    /* 省略: 既存ロジック */
  }
}

// 評価一覧ページ固有のスタイル（styles.cssで管理されていなければ）
const evaluationsStyles = `
<style>
.filters-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 15px;
}
.filters-row .form-group {
    flex: 1;
    min-width: 150px;
}
.chart-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
}
.evaluation-list-group {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #e9ecef;
    border-radius: 0.375rem;
}
.score-badge {
    display: inline-block;
    padding: 0.3em 0.6em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.375rem;
    color: #fff;
    background-color: #0d6efd;
}
@media (max-width: 992px) {
    .chart-layout {
        grid-template-columns: 1fr;
    }
}
</style>
`;

if (!document.getElementById("evaluations-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "evaluations-styles";
  styleElement.innerHTML = evaluationsStyles;
  document.head.appendChild(styleElement);
}

window.EvaluationsPage = EvaluationsPage;
