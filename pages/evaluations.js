/**
 * Evaluations Page Component (Revised for Admin View)
 * 評価一覧ページコンポーネント（管理者向け改修版）
 */
class EvaluationsPage {
  constructor(app) {
    this.app = app;
    this.allEvaluations = [];
    this.filteredEvaluations = [];
    this.selectedTab = 'all'; // デフォルトタブを「すべて」に設定
  }

  /**
   * ページ全体のHTMLをレンダリング
   */
  async render() {
    const showTabs = this.app.hasAnyRole(['admin', 'evaluator']);
    
    return `
      <div class="evaluations-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="nav.evaluations"></h1>
          ${!this.app.hasRole('admin') ? `
          <button class="btn btn-primary" onclick="window.app.navigate('/evaluation-form')">
            <i class="fas fa-plus me-1"></i><span data-i18n="evaluations.new_evaluation"></span>
          </button>
          ` : ''}
        </div>

        ${showTabs ? `
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link" id="all-tab" onclick="window.app.currentPage.switchTab('all')">
              <span data-i18n="common.all"></span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="pending_approval-tab" onclick="window.app.currentPage.switchTab('pending_approval')">
              <span data-i18n="status.pending_approval"></span>
              <span class="badge bg-warning ms-1" id="pendingApprovalCount">0</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="completed-tab" onclick="window.app.currentPage.switchTab('completed')">
              <span data-i18n="status.completed"></span>
            </button>
          </li>
        </ul>
        ` : ''}

        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive" id="evaluationsTableContainer">
              </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * ページの初期化処理
   */
  async init() {
    this.app.currentPage = this;
    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }
    
    await this.loadEvaluations();
    
    if (this.app.hasRole('admin') || this.app.hasRole('evaluator')) {
        this.selectedTab = 'all';
    } else {
        this.selectedTab = 'my_evaluations';
    }

    this.filterAndRender();
    this.updateActiveTab();
    this.app.i18n.updateUI();
  }
  
  /**
   * APIから評価データを読み込む
   */
  async loadEvaluations() {
    const tableContainer = document.getElementById("evaluationsTableContainer");
    if (tableContainer) tableContainer.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>`;
    
    try {
      this.allEvaluations = await this.app.api.getEvaluations();
    } catch (e) {
      console.error("Error loading evaluations:", e);
      if (tableContainer) tableContainer.innerHTML = `<div class="text-center text-danger p-5">${this.app.i18n.t("errors.loading_failed")}</div>`;
    }
  }

  /**
   * 評価をフィルタリングして表示
   */
  filterAndRender() {
    const currentUser = this.app.currentUser;
    let evaluations = this.allEvaluations;

    if (this.app.hasRole('evaluator')) {
        evaluations = this.allEvaluations.filter(e => e.evaluatorId === currentUser.id || e.employeeId === currentUser.id);
    } else if (this.app.hasRole('worker')) {
        evaluations = this.allEvaluations.filter(e => e.employeeId === currentUser.id);
    }

    if (this.selectedTab !== 'all' && this.selectedTab !== 'my_evaluations') {
      this.filteredEvaluations = evaluations.filter(e => e.status === this.selectedTab);
    } else {
      this.filteredEvaluations = evaluations;
    }
    
    if (this.app.hasAnyRole(['admin', 'evaluator'])) {
        const pendingCount = evaluations.filter(e => e.status === 'pending_approval').length;
        const countEl = document.getElementById('pendingApprovalCount');
        if(countEl) countEl.textContent = pendingCount;
    }
    
    this.renderEvaluationsTable();
  }
  
  /**
   * アクティブなタブのUIを更新
   */
  updateActiveTab() {
    const tabContainer = document.querySelector('.nav-tabs');
    if (!tabContainer) return;
    tabContainer.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.getElementById(`${this.selectedTab}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
  }

  /**
   * タブを切り替える
   */
  switchTab(tabName) {
    this.selectedTab = tabName;
    this.updateActiveTab();
    this.filterAndRender();
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
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th data-i18n="evaluation.period"></th>
            <th data-i18n="evaluation.target"></th>
            <th data-i18n="evaluation.evaluator"></th>
            <th data-i18n="users.status"></th>
            <th data-i18n="evaluation.total_score"></th>
            <th data-i18n="users.actions"></th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredEvaluations.map(e => this.renderTableRow(e)).join('')}
        </tbody>
      </table>
    `;
    this.app.i18n.updateUI(container);
  }

  /**
   * テーブルの各行を描画
   */
  renderTableRow(evaluation) {
    const isAdmin = this.app.hasRole('admin');
    const isPendingApproval = evaluation.status === 'pending_approval';
    
    return `
      <tr>
        <td>${this.app.sanitizeHtml(evaluation.period)}</td>
        <td>${this.app.sanitizeHtml(evaluation.employeeName)}</td>
        <td>${this.app.sanitizeHtml(evaluation.evaluatorName)}</td>
        <td>
          <span class="badge ${this.app.getStatusBadgeClass(evaluation.status)}">
            ${this.app.i18n.t(`status.${evaluation.status}`)}
          </span>
        </td>
        <td>${evaluation.totalScore ? evaluation.totalScore.toFixed(1) : '-'}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" onclick="window.app.currentPage.viewEvaluationReport('${evaluation.id}')" title="${this.app.i18n.t('common.details')}"><i class="fas fa-eye"></i></button>
            
            ${isAdmin && isPendingApproval ? `
              <button class="btn btn-outline-success" onclick="window.app.currentPage.approveEvaluation('${evaluation.id}')" title="${this.app.i18n.t('goals.approve')}"><i class="fas fa-check"></i></button>
              <button class="btn btn-outline-danger" onclick="window.app.currentPage.rejectEvaluation('${evaluation.id}')" title="${this.app.i18n.t('goals.reject')}"><i class="fas fa-undo"></i></button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }
  
  /**
   * 評価を承認する（管理者用）
   */
  async approveEvaluation(evalId) {
    if (!confirm(this.app.i18n.t('goals.confirm_approve'))) return;
    const evaluation = this.allEvaluations.find(e => e.id === evalId);
    if (evaluation) {
      evaluation.status = 'completed';
      this.app.showSuccess(this.app.i18n.t('messages.approval_success'));
      this.filterAndRender();
    }
  }

  /**
   * 評価を差し戻す（管理者用）
   */
  async rejectEvaluation(evalId) {
    const reason = prompt(this.app.i18n.t('goals.rejection_reason_prompt'));
    if (reason === null) return;
    const evaluation = this.allEvaluations.find(e => e.id === evalId);
    if (evaluation) {
      evaluation.status = 'rejected';
      this.app.showSuccess(this.app.i18n.t('messages.rejection_success'));
      this.filterAndRender();
    }
  }
  
  /**
   * 評価レポートページへ遷移
   */
  viewEvaluationReport(evalId) {
    this.app.navigate(`/report?id=${evalId}`);
  }
}

window.EvaluationsPage = EvaluationsPage;
