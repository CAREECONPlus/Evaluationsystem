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
    this.polygonChart = null;
  }

  async render() {
    return `
      <div class="evaluations-page">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h1 data-i18n="nav.evaluations"></h1>
          <div class="view-controls btn-group">
            <button class="btn btn-primary" id="listViewBtn" data-i18n="evaluations.list_view"></button>
            <button class="btn btn-outline-primary" id="chartViewBtn" data-i18n="evaluations.chart_view"></button>
          </div>
        </div>
        
        <div class="view-content active" id="listView">
          <div class="card mb-3">
            <div class="card-body">
              <div class="filters-row">
                <div class="form-group"><label for="periodFilter" data-i18n="evaluation.period"></label><select id="periodFilter" class="form-select"></select></div>
                <div class="form-group"><label for="statusFilter" data-i18n="users.status"></label><select id="statusFilter" class="form-select"></select></div>
                <div class="form-group"><label for="userFilter" data-i18n="evaluation.target"></label><input type="text" id="userFilter" class="form-control" data-i18n-placeholder="common.search_by_name"></div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="table-responsive" id="evaluationsTableContainer"></div>
            </div>
          </div>
        </div>
        
        <div class="view-content" id="chartView">
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
                <button class="btn btn-sm btn-outline-secondary" id="exportChartBtn" disabled data-i18n="common.export"></button>
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
    await this.loadEvaluations();
    this.filteredEvaluations = [...this.evaluations];
    this.renderListView();
    this.renderChartView();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('listViewBtn').addEventListener('click', () => this.switchView('list'));
    document.getElementById('chartViewBtn').addEventListener('click', () => this.switchView('chart'));
    document.getElementById('exportChartBtn').addEventListener('click', () => this.exportChart());

    const userFilter = document.getElementById('userFilter');
    userFilter.addEventListener('keyup', () => {
      this.filterData(userFilter.value);
    });
  }

  async loadEvaluations() {
    // Mock data
    this.evaluations = [
      { id: "eval-1", targetUserName: "田中 太郎", evaluatorName: "山田 管理者", period: "2024-q1", status: "completed", submittedAt: new Date(), totalScore: 4.1, data: { "技術力": 4, "協調性": 5, "積極性": 3, "安全管理": 5, "リーダーシップ": 4 } },
      { id: "eval-2", targetUserName: "佐藤 花子", evaluatorName: "山田 管理者", period: "2024-q1", status: "completed", submittedAt: new Date(), totalScore: 4.5, data: { "技術力": 5, "協調性": 4, "積極性": 5, "安全管理": 5, "リーダーシップ": 4 } },
      { id: "eval-3", targetUserName: "鈴木 一郎", evaluatorName: "田中 評価者", period: "2024-q1", status: "pending", submittedAt: null, totalScore: null, data: {} },
    ];
  }
  
  filterData(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredEvaluations = this.evaluations.filter(e => e.targetUserName.toLowerCase().includes(lowerQuery));
    this.renderEvaluationsTable();
  }

  switchView(view) {
    this.currentView = view;
    document.getElementById('listView').classList.toggle('active', view === 'list');
    document.getElementById('chartView').classList.toggle('active', view === 'chart');
    document.getElementById('listViewBtn').classList.toggle('btn-primary', view === 'list');
    document.getElementById('listViewBtn').classList.toggle('btn-outline-primary', view !== 'list');
    document.getElementById('chartViewBtn').classList.toggle('btn-primary', view === 'chart');
    document.getElementById('chartViewBtn').classList.toggle('btn-outline-primary', view !== 'chart');
  }

  renderListView() {
    this.renderEvaluationsTable();
  }
  
  renderChartView() {
    const selector = document.getElementById('evaluationSelector');
    const completedEvals = this.evaluations.filter(e => e.status === 'completed');
    if (completedEvals.length === 0) {
      selector.innerHTML = `<p class="text-muted text-center" data-i18n="evaluations.no_completed_evals"></p>`;
      return;
    }
    selector.innerHTML = completedEvals.map(e => `
      <a href="#" class="list-group-item list-group-item-action" data-id="${e.id}">
        ${e.targetUserName} <span class="badge bg-secondary float-end">${e.period}</span>
      </a>
    `).join('');
    
    selector.querySelectorAll('.list-group-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectEvaluationForChart(item.dataset.id);
        selector.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  renderEvaluationsTable() {
    const container = document.getElementById('evaluationsTableContainer');
    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `<p class="text-muted text-center" data-i18n="common.no_data"></p>`;
      return;
    }
    const tableRows = this.filteredEvaluations.map(e => `
      <tr>
        <td>${e.targetUserName}</td>
        <td>${e.evaluatorName}</td>
        <td>${e.period}</td>
        <td><span class="badge ${e.status === 'completed' ? 'bg-success' : 'bg-warning'}">${this.app.i18n.t(`status.${e.status}`)}</span></td>
        <td>${e.totalScore ? `<span class="score-badge">${e.totalScore.toFixed(1)}</span>` : '-'}</td>
        <td>${e.submittedAt ? this.app.formatDate(e.submittedAt) : '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${e.id}" ${!e.totalScore ? 'disabled' : ''} data-i18n="common.details"></button>
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
  }
  
  selectEvaluationForChart(evalId) {
    this.selectedEvaluation = this.evaluations.find(e => e.id === evalId);
    if (!this.selectedEvaluation) return;

    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = `<canvas id="evaluationChart"></canvas>`;
    const canvas = document.getElementById('evaluationChart');

    if (this.polygonChart) {
        this.polygonChart.destroy();
    }
    
    this.polygonChart = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: Object.keys(this.selectedEvaluation.data),
            datasets: [{
                label: `${this.selectedEvaluation.targetUserName} (${this.selectedEvaluation.period})`,
                data: Object.values(this.selectedEvaluation.data),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } }
        }
    });
    document.getElementById('exportChartBtn').disabled = false;
  }
  
  exportChart() {
    if(this.polygonChart) {
      const link = document.createElement('a');
      link.href = this.polygonChart.toBase64Image();
      link.download = `evaluation-chart-${this.selectedEvaluation.targetUserName}.png`;
      link.click();
    }
  }
}

window.EvaluationsPage = EvaluationsPage;
