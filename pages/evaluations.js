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
            <!-- 新規評価作成ボタン -->
            <button class="btn btn-primary me-2"
                    onclick="window.app.navigate('/evaluation-form')">
              <i class="fas fa-plus me-1"></i>
              <span data-i18n="evaluations.new_evaluation">新規評価</span>
            </button>
            <!-- リスト/チャート切り替え -->
            <div class="view-controls btn-group">
              <button class="btn btn-primary" id="listViewBtn"
                      onclick="window.app.currentPage.switchView('list')"
                      data-i18n="evaluations.list_view"></button>
              <button class="btn btn-outline-primary" id="chartViewBtn"
                      onclick="window.app.currentPage.switchView('chart')"
                      data-i18n="evaluations.chart_view"></button>
            </div>
          </div>
        </div>

        <!-- リストビュー -->
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
                  <input type="text" id="userFilter" class="form-control"
                         data-i18n-placeholder="common.search_by_name">
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

        <!-- チャートビュー -->
        <div class="view-content" id="chartView" style="display: none;">
          <div class="chart-layout">
            <div class="card">
              <div class="card-header">
                <h5 data-i18n="evaluations.select_eval"></h5>
              </div>
              <div class="card-body">
                <div class="list-group evaluation-list-group" id="evaluationSelector"></div>
              </div>
            </div>
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 data-i18n="evaluations.chart_title"></h5>
                <button class="btn btn-sm btn-outline-secondary" id="exportChartBtn" disabled
                        onclick="window.app.currentPage.exportChart()">
                  <i class="fas fa-download me-1"></i><span data-i18n="common.export"></span>
                </button>
              </div>
              <div class="card-body">
                <div id="chartContainer" class="d-flex align-items-center justify-content-center" 
                     style="min-height: 400px;">
                  <div class="chart-placeholder text-center">
                    <p data-i18n="evaluations.select_to_view_chart"></p>
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

    // 認証チェック
    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }

    // 1) まずページのHTMLを描画
    const content = document.getElementById("content");
    if (content) {
      content.innerHTML = await this.render();
    }

    // 2) 翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateUI(content);
    }

    // 3) フィルター要素のイベント登録
    this.setupEventListeners();

    // 4) データ読み込み
    await this.loadEvaluationPeriods();
    await this.loadEvaluations();

    // 5) 初期ビュー描画
    this.renderListView();
    this.renderChartView();
  }

  /**
   * フィルター要素にリスナーをセット
   */
  setupEventListeners() {
    const userFilter   = document.getElementById("userFilter");
    const periodFilter = document.getElementById("periodFilter");
    const statusFilter = document.getElementById("statusFilter");

    if (userFilter)   userFilter.addEventListener("keyup",   this.app.debounce(() => this.filterEvaluations(), 300));
    if (periodFilter) periodFilter.addEventListener("change", () => this.filterEvaluations());
    if (statusFilter) statusFilter.addEventListener("change", () => this.filterEvaluations());
  }

  /**
   * 評価期間ロード
   */
  async loadEvaluationPeriods() {
    try {
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      const periodFilter = document.getElementById("periodFilter");
      if (periodFilter) {
        periodFilter.innerHTML = `<option value="all" data-i18n="common.all">${this.app.i18n.t("common.all")}</option>`;
        this.evaluationPeriods.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = this.app.sanitizeHtml(p.name);
          periodFilter.appendChild(opt);
        });
        this.app.i18n.updateUI(periodFilter);
      }
    } catch (e) {
      console.error("Error loading periods:", e);
      this.app.showError(this.app.i18n.t("errors.evaluation_periods_load_failed"));
    }
  }

  /**
   * 評価データロード＋初期フィルタ
   */
  async loadEvaluations() {
    const tblCont = document.getElementById("evaluationsTableContainer");
    if (tblCont) {
      tblCont.innerHTML = `<div class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">${this.app.i18n.t("common.loading")}</span>
        </div>
      </div>`;
      this.app.i18n.updateUI(tblCont);
    }
    try {
      this.evaluations = await this.app.api.getEvaluations();
      this.filteredEvaluations = [...this.evaluations];
      this.filterEvaluations();
    } catch (e) {
      console.error("Error loading evaluations:", e);
      if (tblCont) {
        tblCont.innerHTML = `<div class="text-center text-danger p-5">
          ${this.app.i18n.t("errors.loading_failed")}
        </div>`;
        this.app.i18n.updateUI(tblCont);
      }
    }
  }

  /**
   * フィルター適用
   */
  filterEvaluations() {
    const uq = document.getElementById("userFilter").value.toLowerCase();
    const pf = document.getElementById("periodFilter").value;
    const sf = document.getElementById("statusFilter").value;

    this.filteredEvaluations = this.evaluations.filter(e => {
      const mUser   = !uq || e.employeeName.toLowerCase().includes(uq) || e.evaluatorName.toLowerCase().includes(uq);
      const mPeriod = pf === "all"  || e.period === pf;
      const mStatus = sf === "all"  || e.status === sf;
      return mUser && mPeriod && mStatus;
    });
    this.renderEvaluationsTable();
    this.renderChartView();
  }

  renderListView() {
    this.renderEvaluationsTable();
  }

  renderChartView() {
    // 省略（既存のまま）
  }

  renderEvaluationsTable() {
    const container = document.getElementById("evaluationsTableContainer");
    if (!container) return;
    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `<p class="text-muted text-center" data-i18n="common.no_data"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }
    const rows = this.filteredEvaluations.map(e => `
      <tr>
        <td>${this.app.sanitizeHtml(e.employeeName)}</td>
        <td>${this.app.sanitizeHtml(e.evaluatorName)}</td>
        <td>${this.app.sanitizeHtml(e.period)}</td>
        <td><span class="badge ${this.app.getStatusBadgeClass(e.status)}">
          ${this.app.i18n.t(`status.${e.status}`)}
        </span></td>
        <td>${e.totalScore ? `<span class="score-badge">${e.totalScore.toFixed(1)}</span>` : "-"}</td>
        <td>${e.submittedAt ? this.app.formatDate(e.submittedAt) : "-"}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary"
                  onclick="window.app.currentPage.viewEvaluationDetails('${e.id}')"
                  ${!e.totalScore ? "disabled" : ""}
                  data-i18n="common.details"></button>
        </td>
      </tr>
    `).join("");

    container.innerHTML = `
      <table class="table table-hover">
        <thead>
          <tr>
            <th data-i18n="evaluation.target"></th>
            <th data-i18n="evaluation.evaluator"></th>
            <th data-i18n="evaluation.period"></th>
            <th data-i18n="users.status"></th>
            <th data-i18n="evaluation.total_score"></th>
            <th data-i18n="evaluation.submit_date"></th>
            <th data-i18n="common.actions"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    this.app.i18n.updateUI(container);
  }

  /**
   * 詳細モーダル表示
   */
  viewEvaluationDetails(evalId) {
    // 既存の詳細モーダル生成ロジック
  }

  /**
   * チャートエクスポート 等...
   */
  exportChart() { /* 省略 */ }
}

// グローバル登録
window.EvaluationsPage = EvaluationsPage;
