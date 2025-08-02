/**
 * Evaluations Page Component (Revised for Admin View, Firebase Integrated)
 * 評価一覧ページコンポーネント（管理者向け改修版・Firebase連携対応）
 */
export class EvaluationsPage {
  constructor(app) {
    this.app = app;
    this.allEvaluations = [];
    this.filteredEvaluations = [];
    this.selectedTab = 'all'; // Default tab
  }

  /**
   * Renders the HTML content for the evaluations page.
   * 評価一覧ページのHTMLコンテンツを描画します。
   * @returns {string} HTML string for the page.
   */
  async render() {
    const showTabs = this.app.hasAnyRole(['admin', 'evaluator']);
    
    return `
      <div class.="evaluations-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="evaluations.title"></h1>
          ${!this.app.hasRole('admin') ? `
          <a href="#/evaluation-form" class="btn btn-primary" data-link>
            <i class="fas fa-plus me-1"></i><span data-i18n="evaluations.new_evaluation"></span>
          </a>
          ` : ''}
        </div>

        ${showTabs ? `
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" id="all-tab-btn" data-i18n="common.all"></button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="pending_approval-tab-btn">
              <span data-i18n="status.pending_approval"></span>
              <span class="badge bg-warning ms-1" id="pendingApprovalCount">0</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="completed-tab-btn" data-i18n="status.completed"></button>
          </li>
        </ul>
        ` : ''}

        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive" id="evaluationsTableContainer">
              <!-- Table will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initializes the page, sets up event listeners, and loads data.
   * ページを初期化し、イベントリスナーをセットアップし、データを読み込みます。
   */
  async init() {
    this.app.currentPage = this;
    if (!this.app.isAuthenticated()) {
      this.app.navigate("#/login");
      return;
    }
    
    if (this.app.hasAnyRole(['admin', 'evaluator'])) {
        this.selectedTab = 'all';
        document.getElementById('all-tab-btn').addEventListener('click', () => this.switchTab('all'));
        document.getElementById('pending_approval-tab-btn').addEventListener('click', () => this.switchTab('pending_approval'));
        document.getElementById('completed-tab-btn').addEventListener('click', () => this.switchTab('completed'));
    } else {
        // For workers, there are no tabs, so we can set a default filter if needed
        this.selectedTab = 'my_evaluations';
    }

    await this.loadEvaluations();
  }
  
  /**
   * Fetches evaluation data from Firebase and triggers rendering.
   * Firebaseから評価データを取得し、描画をトリガーします。
   */
  async loadEvaluations() {
    const tableContainer = document.getElementById("evaluationsTableContainer");
    tableContainer.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>`;
    
    try {
      this.allEvaluations = await this.app.api.getEvaluations();
      this.filterAndRender();
    } catch (e) {
      console.error("Error loading evaluations:", e);
      tableContainer.innerHTML = `<div class="text-center text-danger p-5" data-i18n="errors.loading_failed"></div>`;
      this.app.i18n.updateUI(tableContainer);
    }
  }

  /**
   * Filters evaluations based on the current user's role and selected tab, then renders the table.
   * 現在のユーザーの役割と選択されたタブに基づいて評価をフィルタリングし、テーブルを描画します。
   */
  filterAndRender() {
    const currentUser = this.app.currentUser;
    let evaluationsToDisplay = this.allEvaluations;

    // Filter by role first
    if (this.app.hasRole('evaluator')) {
        evaluationsToDisplay = this.allEvaluations.filter(e => e.evaluatorId === currentUser.uid || e.targetUserId === currentUser.uid);
    } else if (this.app.hasRole('worker')) {
        evaluationsToDisplay = this.allEvaluations.filter(e => e.targetUserId === currentUser.uid);
    }

    // Then filter by tab
    if (this.selectedTab !== 'all' && this.selectedTab !== 'my_evaluations') {
      this.filteredEvaluations = evaluationsToDisplay.filter(e => e.status === this.selectedTab);
    } else {
      this.filteredEvaluations = evaluationsToDisplay;
    }
    
    // Update pending count for admins/evaluators
    if (this.app.hasAnyRole(['admin', 'evaluator'])) {
        const pendingCount = evaluationsToDisplay.filter(e => e.status === 'pending_approval').length;
        const countEl = document.getElementById('pendingApprovalCount');
        if(countEl) countEl.textContent = pendingCount;
    }
    
    this.renderEvaluationsTable();
    this.app.i18n.updateUI();
  }
  
  /**
   * Renders the evaluations table with the filtered data.
   * フィルタリングされたデータで評価テーブルを描画します。
   */
  renderEvaluationsTable() {
    const container = document.getElementById("evaluationsTableContainer");
    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `<p class="text-center text-muted p-5" data-i18n="common.no_data"></p>`;
      return;
    }

    container.innerHTML = `
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th data-i18n="evaluations.period"></th>
            <th data-i18n="evaluations.target_user"></th>
            <th data-i18n="evaluations.evaluator"></th>
            <th data-i18n="users.status"></th>
            <th data-i18n="evaluations.total_score"></th>
            <th data-i18n="users.actions"></th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredEvaluations.map(e => this.renderTableRow(e)).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Renders a single row for the evaluations table.
   * 評価テーブルの単一行を描画します。
   * @param {object} evaluation - The evaluation data for the row.
   * @returns {string} The HTML string for the table row.
   */
  renderTableRow(evaluation) {
    const isAdmin = this.app.hasRole('admin');
    const isPendingApproval = evaluation.status === 'pending_approval';
    
    return `
      <tr>
        <td>${this.app.sanitizeHtml(evaluation.periodName)}</td>
        <td>${this.app.sanitizeHtml(evaluation.targetUserName)}</td>
        <td>${this.app.sanitizeHtml(evaluation.evaluatorName)}</td>
        <td>
          <span class="badge ${this.app.getStatusBadgeClass(evaluation.status)}" data-i18n="status.${evaluation.status}"></span>
        </td>
        <td>${evaluation.totalScore ? evaluation.totalScore.toFixed(1) : '-'}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <a href="#/report?id=${evaluation.id}" class="btn btn-outline-secondary" title="${this.app.i18n.t('common.details')}" data-link><i class="fas fa-eye"></i></a>
            
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
   * Switches the active tab and re-filters the data.
   * アクティブなタブを切り替えてデータを再フィルタリングします。
   * @param {string} tabName - The name of the tab to switch to.
   */
  switchTab(tabName) {
    this.selectedTab = tabName;
    document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${tabName}-tab-btn`).classList.add('active');
    this.filterAndRender();
  }

  /**
   * Approves an evaluation (for admins).
   * 評価を承認します（管理者向け）。
   * @param {string} evalId - The ID of the evaluation to approve.
   */
  async approveEvaluation(evalId) {
    if (!confirm(this.app.i18n.t('goals.confirm_approve'))) return;
    try {
        await this.app.api.updateEvaluationStatus(evalId, 'completed');
        this.app.showSuccess(this.app.i18n.t('messages.approval_success'));
        await this.loadEvaluations(); // Refresh data from Firestore
    } catch(e) {
        this.app.showError(e.message);
    }
  }

  /**
   * Rejects an evaluation (for admins).
   * 評価を差し戻します（管理者向け）。
   * @param {string} evalId - The ID of the evaluation to reject.
   */
  async rejectEvaluation(evalId) {
    const reason = prompt(this.app.i18n.t('goals.rejection_reason_prompt'));
    if (reason === null) return; // User cancelled prompt
    try {
        await this.app.api.updateEvaluationStatus(evalId, 'rejected', { rejectionReason: reason });
        this.app.showSuccess(this.app.i18n.t('messages.rejection_success'));
        await this.loadEvaluations(); // Refresh data from Firestore
    } catch(e) {
        this.app.showError(e.message);
    }
  }
}
