// careeconplus/evaluationsystem/Evaluationsystem-main/pages/goal-approvals.js

/**
 * Goal Approvals Page Component (Firebase Integrated)
 * 目標承認ページコンポーネント（Firebase連携版）
 */
export class GoalApprovalsPage {
  constructor(app) {
    this.app = app;
    this.pendingGoals = [];
    this.approvedGoals = [];
    this.selectedTab = "pending";
  }

  async render() {
    return `
      <div class="goal-approvals-page p-4">
        <h1 data-i18n="goals.approvals_title" class="mb-4"></h1>
        
        <div class="row mb-4">
          <div class="col-md-6 mb-3 mb-md-0">
            <div class="card text-center h-100">
              <div class="card-body">
                <h5 class="card-title text-muted" data-i18n="goals.pending_goals"></h5>
                <p class="card-text display-4 fw-bold" id="pendingCount">0</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card text-center h-100">
              <div class="card-body">
                <h5 class="card-title text-muted" data-i18n="goals.approved_goals"></h5>
                <p class="card-text display-4 fw-bold" id="approvedCount">0</p>
              </div>
            </div>
          </div>
        </div>
        
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" id="pending-tab-btn" data-i18n="goals.pending_goals"></button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="approved-tab-btn" data-i18n="goals.approved_goals"></button>
          </li>
        </ul>
        
        <div id="pending-goals-view"></div>
        <div id="approved-goals-view" class="d-none"></div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    if (!this.app.hasRole("admin")) {
      this.app.navigate("#/dashboard");
      return;
    }

    document.getElementById('pending-tab-btn').addEventListener('click', () => this.switchTab('pending'));
    document.getElementById('approved-tab-btn').addEventListener('click', () => this.switchTab('approved'));

    await this.loadGoals();
  }

  async loadGoals() {
    const pendingView = document.getElementById('pending-goals-view');
    const loadingHTML = `<div class="card card-body text-center"><div class="spinner-border spinner-border-sm" role="status"></div></div>`;
    pendingView.innerHTML = loadingHTML;

    try {
      [this.pendingGoals, this.approvedGoals] = await Promise.all([
        this.app.api.getGoalsByStatus('pending_approval'),
        this.app.api.getGoalsByStatus('approved')
      ]);
      this.renderLists();
      this.updateStatistics();
      this.app.i18n.updateUI();
    } catch (error) {
      console.error("Error loading goals:", error);
      this.app.showError("目標データの読み込みに失敗しました。");
    }
  }

  updateStatistics() {
    document.getElementById("pendingCount").textContent = this.pendingGoals.length;
    document.getElementById("approvedCount").textContent = this.approvedGoals.length;
  }

  renderLists() {
    document.getElementById('pending-goals-view').innerHTML = this.createGoalList(this.pendingGoals, true);
    document.getElementById('approved-goals-view').innerHTML = this.createGoalList(this.approvedGoals, false);
  }

  createGoalList(goalDocs, isPending) {
    if (goalDocs.length === 0) {
        return `<div class="card card-body text-center" data-i18n="common.no_data"></div>`;
    }

    return goalDocs.map(goalDoc => `
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5>${this.app.sanitizeHtml(goalDoc.userName)}</h5>
            <small class="text-muted">${this.app.sanitizeHtml(goalDoc.periodName)} / <span data-i18n="goals.submitted_at"></span>: ${this.app.formatDate(goalDoc.submittedAt)}</small>
          </div>
          ${isPending ? `
          <div class="approval-actions">
            <button class="btn btn-success btn-sm me-2" onclick="window.app.currentPage.updateStatus('${goalDoc.id}', 'approved')"><i class="fas fa-check me-1"></i><span data-i18n="goals.approve"></span></button>
            <button class="btn btn-danger btn-sm" onclick="window.app.currentPage.updateStatus('${goalDoc.id}', 'rejected')"><i class="fas fa-undo me-1"></i><span data-i18n="goals.reject"></span></button>
          </div>` 
          : `<span class="badge bg-success" data-i18n="status.approved"></span>`}
        </div>
        <ul class="list-group list-group-flush">
          ${goalDoc.goals.map(g => `<li class="list-group-item"><strong>${this.app.sanitizeHtml(g.weight)}%:</strong> ${this.app.sanitizeHtml(g.text)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  switchTab(tabName) {
    this.selectedTab = tabName;
    document.getElementById('pending-goals-view').classList.toggle('d-none', tabName !== 'pending');
    document.getElementById('approved-goals-view').classList.toggle('d-none', tabName !== 'approved');
    document.getElementById('pending-tab-btn').classList.toggle('active', tabName === 'pending');
    document.getElementById('approved-tab-btn').classList.toggle('active', tabName === 'approved');
  }

  async updateStatus(id, status) {
    const confirmKey = status === 'approved' ? 'goals.confirm_approve' : 'goals.confirm_reject';
    if (!confirm(this.app.i18n.t(confirmKey))) return;

    try {
        await this.app.api.updateGoalStatus(id, status);
        const successKey = status === 'approved' ? 'goals.approve_success' : 'goals.reject_success';
        this.app.showSuccess(this.app.i18n.t(successKey));
        await this.loadGoals(); // Refresh data from Firestore
    } catch(e) {
        this.app.showError(e.message);
    }
  }
}
