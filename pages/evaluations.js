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
    this.chart = null;
    this.evaluationPeriods = [];
  }

  /**
   * ページ全体のHTMLを返す
   */
  async render() {
    return `
      <div class="evaluations-page">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h1 data-i18n="nav.evaluations"></h1>
          <div class="d-flex align-items-center">
            <button class="btn btn-primary me-2" onclick="window.app.navigate('/evaluation-form')">
              <i class="fas fa-plus me-1"></i>
              <span data-i18n="evaluations.new_evaluation"></span>
            </button>
            <div class="view-controls btn-group">
              <button class="btn btn-primary" id="listViewBtn" onclick="window.app.currentPage.switchView('list')" data-i18n="evaluations.list_view"></button>
              <button class="btn btn-outline-primary" id="chartViewBtn" onclick="window.app.currentPage.switchView('chart')" data-i18n="evaluations.chart_view"></button>
            </div>
          </div>
        </div>

        <div class="view-content active" id="listView">
          <div class="card mb-3">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label for="periodFilter" class="form-label" data-i18n="evaluation.period"></label>
                  <select id="periodFilter" class="form-select"></select>
                </div>
                <div class="col-md-4">
                  <label for="statusFilter" class="form-label" data-i18n="users.status"></label>
                  <select id="statusFilter" class="form-select">
                    <option value="all" data-i18n="common.all"></option>
                    <option value="completed" data-i18n="status.completed"></option>
                    <option value="pending" data-i18n="status.pending"></option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label for="userFilter" class="form-label" data-i18n="evaluation.target"></label>
                  <input type="text" id="userFilter" class="form-control" data-i18n-placeholder="users.search_users">
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body p-0">
              <div class="table-responsive" id="evaluationsTableContainer"></div>
            </div>
          </div>
        </div>

        <div class="view-content" id="chartView" style="display: none;">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header"><h5 data-i18n="evaluations.select_eval"></h5></div>
                <div class="card-body">
                  <div class="list-group evaluation-list-group" id="evaluationSelector"></div>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 data-i18n="evaluations.chart_title"></h5>
                  <button class="btn btn-sm btn-outline-secondary" id="exportChartBtn" disabled onclick="window.app.currentPage.exportChart()">
                    <i class="fas fa-download me-1"></i><span data-i18n="common.export"></span>
                  </button>
                </div>
                <div class="card-body">
                  <div id="chartContainer" class="d-flex align-items-center justify-content-center" style="min-height: 400px;">
                    <div class="text-center"><p data-i18n="evaluations.select_to_view_chart"></p></div>
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
   * 初期化
   */
  async init() {
    this.app.currentPage = this;

    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }
    
    this.setupEventListeners();
    await this.loadInitialData();
    
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  /**
   * イベントリスナー設定
   */
  setupEventListeners() {
    document.getElementById('userFilter').addEventListener('keyup', this.app.debounce(() => this.filterAndRender(), 300));
    document.getElementById('periodFilter').addEventListener('change', () => this.filterAndRender());
    document.getElementById('statusFilter').addEventListener('change', () => this.filterAndRender());
  }
  
  /**
   * ページ初期データ（評価期間など）をロード
   */
  async loadInitialData() {
    try {
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      const periodFilter = document.getElementById("periodFilter");
      if (periodFilter) {
        periodFilter.innerHTML = `<option value="all" data-i18n="common.all"></option>` + 
          this.evaluationPeriods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
      }
      await this.loadEvaluations();
    } catch (e) {
      this.app.showError(this.app.i18n.t("errors.initial_data_load_failed"));
    }
  }

  /**
   * 評価データロード
   */
  async loadEvaluations() {
    const tblCont = document.getElementById("evaluationsTableContainer");
    if (tblCont) tblCont.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>`;
    
    try {
      this.evaluations = await this.app.api.getEvaluations();
      this.filterAndRender();
    } catch (e) {
      console.error("Error loading evaluations:", e);
      if (tblCont) tblCont.innerHTML = `<div class="text-center text-danger p-5">${this.app.i18n.t("errors.loading_failed")}</div>`;
    }
  }

  /**
   * フィルターを適用して再描画
   */
  filterAndRender() {
    const uq = document.getElementById("userFilter").value.toLowerCase();
    const pf = document.getElementById("periodFilter").value;
    const sf = document.getElementById("statusFilter").value;

    this.filteredEvaluations = this.evaluations.filter(e => {
      const mUser   = !uq || e.employeeName.toLowerCase().includes(uq);
      const mPeriod = pf === "all"  || e.period === pf;
      const mStatus = sf === "all"  || e.status === sf;
      return mUser && mPeriod && mStatus;
    });

    this.renderEvaluationsTable();
    this.renderChartView();
  }

  /**
   * ビューを切り替え
   */
  switchView(view) {
    this.currentView = view;
    document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
    document.getElementById('chartView').style.display = view === 'chart' ? 'block' : 'none';
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    document.getElementById('chartViewBtn').classList.toggle('active', view !== 'list');
  }

  /**
   * 評価テーブルを描画
   */
  renderEvaluationsTable() {
    const container = document.getElementById("evaluationsTableContainer");
    if (!container) return;
    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `<p class="text-center text-muted p-5" data-i18n="common.no_data"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }
    container.innerHTML = `
      <table class="table table-hover">
        <thead><tr>
          <th data-i18n="evaluation.target"></th><th data-i18n="evaluation.evaluator"></th><th data-i18n="evaluation.period"></th>
          <th data-i18n="users.status"></th><th data-i18n="evaluation.total_score"></th><th data-i18n="evaluation.submit_date"></th>
          <th data-i18n="users.actions"></th>
        </tr></thead>
        <tbody>
          ${this.filteredEvaluations.map(e => `
            <tr>
              <td>${this.app.sanitizeHtml(e.employeeName)}</td>
              <td>${this.app.sanitizeHtml(e.evaluatorName)}</td>
              <td>${this.app.sanitizeHtml(this.evaluationPeriods.find(p => p.id === e.period)?.name || e.period)}</td>
              <td><span class="badge ${this.app.getStatusBadgeClass(e.status)}">${this.app.i18n.t(`status.${e.status}`)}</span></td>
              <td>${e.totalScore ? e.totalScore.toFixed(1) : '-'}</td>
              <td>${this.app.formatDate(e.submittedAt)}</td>
              <td><button class="btn btn-sm btn-outline-primary" onclick="window.app.currentPage.viewEvaluationDetails('${e.id}')" data-i18n="common.details"></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    this.app.i18n.updateUI(container);
  }

  /**
   * チャートビューを描画
   */
  renderChartView() {
    const selector = document.getElementById('evaluationSelector');
    const completedEvals = this.filteredEvaluations.filter(e => e.status === 'completed');
    if (completedEvals.length === 0) {
      selector.innerHTML = `<p class="text-muted text-center" data-i18n="evaluations.no_completed_evals"></p>`;
      this.app.i18n.updateUI(selector);
      return;
    }
    selector.innerHTML = completedEvals.map(e => `
      <a href="#" class="list-group-item list-group-item-action" onclick="event.preventDefault(); window.app.currentPage.selectEvaluationForChart('${e.id}')" data-id="${e.id}">
        ${this.app.sanitizeHtml(e.employeeName)} <span class="badge bg-secondary float-end">${this.app.sanitizeHtml(this.evaluationPeriods.find(p => p.id === e.period)?.name || e.period)}</span>
      </a>
    `).join('');
  }

  /**
   * チャート表示対象の評価を選択
   */
  selectEvaluationForChart(evalId) {
    this.selectedEvaluation = this.evaluations.find(e => e.id === evalId);
    if (!this.selectedEvaluation) return;

    // アクティブな項目をハイライト
    document.querySelectorAll('#evaluationSelector .list-group-item').forEach(item => {
      item.classList.toggle('active', item.dataset.id === evalId);
    });

    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = `<canvas id="evaluationChart"></canvas>`;
    const canvas = document.getElementById('evaluationChart');

    if (this.chart) {
      this.chart.destroy();
    }
    
    this.chart = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: Object.keys(this.selectedEvaluation.data),
            datasets: [{
                label: `${this.selectedEvaluation.employeeName} (${this.selectedEvaluation.period})`,
                data: Object.values(this.selectedEvaluation.data).map(v => v * 20), // 5段階評価を100点満点に
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } }
        }
    });
    document.getElementById('exportChartBtn').disabled = false;
  }

  /**
   * チャートを画像としてエクスポート
   */
  exportChart() {
    if(this.chart) {
      const link = document.createElement('a');
      link.href = this.chart.toBase64Image();
      link.download = `evaluation-chart-${this.selectedEvaluation.employeeName}.png`;
      link.click();
    }
  }

  /**
   * 評価詳細を表示（今回は未実装）
   */
  viewEvaluationDetails(evalId) {
    this.app.showInfo(`評価詳細の表示 (ID: ${evalId}) は現在実装中です。`);
    // ここでモーダルを開くか、評価フォームページに遷移するロジックを実装
    // window.app.navigate(`/evaluation-form?id=${evalId}`);
  }
}

window.EvaluationsPage = EvaluationsPage;
