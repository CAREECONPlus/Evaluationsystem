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
                <div class="form-group"><label for="periodFilter" class="form-label" data-i18n="evaluation.period"></label><select id="periodFilter" class="form-select"></select></div>
                <div class="form-group"><label for="statusFilter" class="form-label" data-i18n="users.status"></label><select id="statusFilter" class="form-select">
                    <option value="all" data-i18n="common.all"></option>
                    <option value="completed" data-i18n="status.completed"></option>
                    <option value="pending" data-i18n="status.pending"></option>
                    <option value="self_assessed" data-i18n="status.self_assessed"></option>
                    <option value="approved_by_evaluator" data-i18n="status.approved_by_evaluator"></option>
                    <option value="rejected" data-i18n="status.rejected"></option>
                </select></div>
                <div class="form-group"><label for="userFilter" class="form-label" data-i18n="evaluation.target"></label><input type="text" id="userFilter" class="form-control" data-i18n-placeholder="common.search_by_name"></div>
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
    await this.loadEvaluations(); // その後、評価データをロード

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
    const userFilter = document.getElementById('userFilter');
    const periodFilter = document.getElementById('periodFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (userFilter) userFilter.addEventListener('keyup', this.app.debounce(() => {
      this.filterEvaluations();
    }, 300));
    if (periodFilter) periodFilter.addEventListener('change', () => this.filterEvaluations());
    if (statusFilter) statusFilter.addEventListener('change', () => this.filterEvaluations());
  }

  /**
   * Load evaluations based on user role and apply filters.
   */
  async loadEvaluations() {
    const tableContainer = document.getElementById("evaluationsTableContainer");
    if(tableContainer) {
      tableContainer.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">${this.app.i18n.t('common.loading')}</span></div></div>`;
      this.app.i18n.updateUI(tableContainer);
    }

    try {
      // APIから評価データを取得。APIサービス内でロールに応じたフィルタリングが行われる想定。
      this.evaluations = await this.app.api.getEvaluations();
      this.filteredEvaluations = [...this.evaluations]; // 初期フィルタリング済みデータ
      this.filterEvaluations(); // ロード後、初期フィルターを適用してレンダリング

    } catch (error) {
      console.error("Error loading evaluations:", error);
      this.app.showError(this.app.i18n.t("errors.evaluation_load_failed"));
      if(tableContainer) tableContainer.innerHTML = `<div class="text-center text-danger p-5">${this.app.i18n.t('errors.loading_failed')}</div>`;
      this.app.i18n.updateUI(tableContainer);
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
    const userQuery = document.getElementById('userFilter').value.toLowerCase();
    const periodFilterValue = document.getElementById('periodFilter').value;
    const statusFilterValue = document.getElementById('statusFilter').value;

    this.filteredEvaluations = this.evaluations.filter(e => {
      const matchesUser = userQuery === "" || e.employeeName.toLowerCase().includes(userQuery) || e.evaluatorName.toLowerCase().includes(userQuery);
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
      // チャートビューに切り替わったら、選択状態のリセットとチャートの再描画を試みる
      this.selectedEvaluation = null;
      document.getElementById('exportChartBtn').disabled = true;
      const chartContainer = document.getElementById('chartContainer');
      if (this.chart) {
        this.chart.destroy(); // 既存のチャートを破棄
        this.chart = null;
      }
      if (chartContainer) {
          chartContainer.innerHTML = `<div class="chart-placeholder text-center"><p data-i18n="evaluations.select_to_view_chart"></p></div>`;
          this.app.i18n.updateUI(chartContainer); // 翻訳適用
      }
      this.renderChartView(); // チャート選択リストを再レンダリング
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
    // チャート表示は完了済み評価のみを対象とする
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
    this.app.i18n.updateUI(container); // 翻訳適用
  }
  
  /**
   * Select an evaluation to display in the chart.
   */
  selectEvaluationForChart(evalId) {
    this.selectedEvaluation = this.evaluations.find(e => e.id === evalId);
    if (!this.selectedEvaluation) {
      this.app.showError(this.app.i18n.t("errors.evaluation_not_found"));
      return;
    }

    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) return;
    
    // アクティブなリストアイテムをハイライト
    document.querySelectorAll('.evaluation-list-group .list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.evaluation-list-group a[data-id="${evalId}"]`).classList.add('active');


    chartContainer.innerHTML = `<canvas id="evaluationChart"></canvas>`;
    const canvas = document.getElementById('evaluationChart');

    if (this.chart) {
        this.chart.destroy();
    }
    
    // データは平均スコアなので、最大値100を基準にする
    // APIモックではすでに100点スケールで返されているため、そのまま使用
    const chartDataValues = Object.values(this.selectedEvaluation.data);

    this.chart = new Chart(canvas.getContext('2d'), {
        type: 'radar', // ダッシュボードのChart.jsを使用
        data: {
            labels: Object.keys(this.selectedEvaluation.data),
            datasets: [{
                label: `${this.app.sanitizeHtml(this.selectedEvaluation.employeeName)} (${this.app.sanitizeHtml(this.selectedEvaluation.period)})`,
                data: chartDataValues,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                pointBackgroundColor: "rgba(54, 162, 235, 1)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100, // スケールを100点満点にする
                    ticks: {
                        stepSize: 20,
                        backdropColor: "rgba(255, 255, 255, 0.75)"
                    },
                    grid: {
                        color: "#e0e0e0"
                    },
                    angleLines: {
                        color: "#e0e0e0"
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}点`;
                        }
                    }
                }
            }
        }
    });
    document.getElementById('exportChartBtn').disabled = false;
  }
  
  /**
   * Export the currently displayed chart as an image.
   */
  exportChart() {
    if(this.chart) {
      const canvas = document.getElementById('evaluationChart');
      if (canvas) {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${this.app.i18n.t('evaluation.chart')}-${this.selectedEvaluation.employeeName}.png`;
          link.click();
          this.app.showSuccess(this.app.i18n.t("messages.export_success"));
      } else {
          this.app.showError(this.app.i18n.t("errors.chart_not_found_for_export"));
      }
    } else {
        this.app.showError(this.app.i18n.t("errors.no_chart_to_export"));
    }
  }

  /**
   * Show evaluation details in a modal.
   */
  viewEvaluationDetails(evalId) {
    const evaluation = this.evaluations.find(e => e.id === evalId);
    if (!evaluation) {
        this.app.showError(this.app.i18n.t("errors.evaluation_not_found"));
        return;
    }

    const modalContent = `
        <h5 class="mb-3">${this.app.sanitizeHtml(evaluation.employeeName)} の評価詳細 (${this.app.sanitizeHtml(evaluation.period)})</h5>
        <div class="row mb-2">
            <div class="col-sm-4 fw-bold" data-i18n="evaluation.evaluator"></div>
            <div class="col-sm-8">${this.app.sanitizeHtml(evaluation.evaluatorName)}</div>
        </div>
        <div class="row mb-2">
            <div class="col-sm-4 fw-bold" data-i18n="users.status"></div>
            <div class="col-sm-8"><span class="badge ${this.app.getStatusBadgeClass(evaluation.status)}">${this.app.i18n.t(`status.${evaluation.status}`)}</span></div>
        </div>
        <div class="row mb-2">
            <div class="col-sm-4 fw-bold" data-i18n="evaluation.total_score"></div>
            <div class="col-sm-8">${evaluation.totalScore ? evaluation.totalScore.toFixed(1) : '-'}</div>
        </div>
        <div class="row mb-2">
            <div class="col-sm-4 fw-bold" data-i18n="evaluation.submit_date"></div>
            <div class="col-sm-8">${evaluation.submittedAt ? this.app.formatDate(evaluation.submittedAt) : '-'}</div>
        </div>
        <h6 class="mt-4 mb-2" data-i18n="evaluation.scores_by_category">項目別スコア:</h6>
        <ul class="list-group list-group-flush">
            ${Object.entries(evaluation.data).map(([key, value]) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${this.app.sanitizeHtml(key)}</span>
                    <span class="badge bg-primary rounded-pill">${value}</span>
                </li>
            `).join('')}
        </ul>
    `;

    // 汎用モーダルを生成して表示
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = 'evaluationDetailsModal';
    modalDiv.tabIndex = '-1';
    modalDiv.setAttribute('aria-hidden', 'true'); // accessibility
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" data-i18n="evaluation.details">評価詳細</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${this.app.i18n.t('common.close')}"></button>
                </div>
                <div class="modal-body">
                    ${modalContent}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.close"></button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
    const detailModal = new window.bootstrap.Modal(document.getElementById('evaluationDetailsModal'));
    detailModal.show();

    // モーダル内の翻訳を更新
    this.app.i18n.updateUI(modalDiv);

    // モーダルが閉じられたらDOMから削除
    modalDiv.addEventListener('hidden.bs.modal', () => {
        modalDiv.remove();
    });
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
    border: 1px solid #e9ecef; /* Added border for better visibility */
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
    background-color: #0d6efd; /* Bootstrap primary color */
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
