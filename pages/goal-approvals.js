/**
 * Goal Approvals Page Component
 * 目標承認ページコンポーネント
 */
class GoalApprovalsPage {
  constructor(app) {
    this.app = app;
    this.pendingGoals = [];
    this.approvedGoals = [];
    this.selectedTab = "pending";
  }

  async render() {
    return `
      <div class="goal-approvals-page p-4">
        <h1 data-i18n="nav.goal_approvals"></h1>
        
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title" data-i18n="goals.pending_goals"></h5>
                <p class="card-text display-4" id="pendingCount">0</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title" data-i18n="goals.approved_goals"></h5>
                <p class="card-text display-4" id="approvedCount">0</p>
              </div>
            </div>
          </div>
        </div>
        
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" id="pending-tab-btn" onclick="window.app.currentPage.switchTab('pending')" data-i18n="goals.pending_goals"></button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="approved-tab-btn" onclick="window.app.currentPage.switchTab('approved')" data-i18n="goals.approved_goals"></button>
          </li>
        </ul>
        
        <div id="pendingTabContent"></div>
        <div id="approvedTabContent" style="display: none;"></div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;

    if (!this.app.hasRole("admin")) {
      this.app.navigate("/dashboard");
      return;
    }

    await this.loadGoals();
    
    if (this.app.i18n) {
        this.app.i18n.updateUI();
    }
  }

  async loadGoals() {
    const pendingContent = document.getElementById("pendingTabContent");
    const approvedContent = document.getElementById("approvedTabContent");
    if(pendingContent) pendingContent.innerHTML = `<div class="card"><div class="card-body text-center p-5"><div class="spinner-border text-primary"></div></div></div>`;
    if(approvedContent) approvedContent.innerHTML = `<div class="card"><div class="card-body text-center p-5"><div class="spinner-border text-primary"></div></div></div>`;

    try {
      this.pendingGoals = await this.app.api.getQualitativeGoals(null, null, 'pending_approval');
      this.approvedGoals = await this.app.api.getQualitativeGoals(null, null, 'approved');
      
      this.renderAllTables();
      this.updateStatistics();
    } catch (error) {
      console.error("Error loading goals:", error);
      this.app.showError(this.app.i18n.t("errors.goals_load_failed"));
    }
  }

  updateStatistics() {
    const pendingCountEl = document.getElementById("pendingCount");
    const approvedCountEl = document.getElementById("approvedCount");
    if (pendingCountEl) pendingCountEl.textContent = this.pendingGoals.length;
    if (approvedCountEl) approvedCountEl.textContent = this.approvedGoals.length;
  }

  renderAllTables() {
    this.renderGoalsTable(this.pendingGoals, 'pending');
    this.renderGoalsTable(this.approvedGoals, 'approved');
  }

  renderGoalsTable(data, type) {
    const targetElementId = type === 'pending' ? 'pendingTabContent' : 'approvedTabContent';
    const container = document.getElementById(targetElementId);
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = `<div class="card"><div class="card-body text-center text-muted" data-i18n="common.no_data"></div></div>`;
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          ${data.map(goalSet => `
            <div class="goal-approval-card card mb-3">
              <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5>${this.app.sanitizeHtml(goalSet.userName)}</h5>
                  <small class="text-muted">${this.app.sanitizeHtml(goalSet.period)} / <span data-i18n="${type === 'pending' ? 'goals.submitted_at' : 'goals.approved_at'}"></span>: ${this.app.formatDate(type === 'pending' ? goalSet.submittedAt : goalSet.approvedAt)}</small>
                </div>
                ${type === 'pending' ? `
                <div class="approval-actions">
                  <button class="btn btn-success btn-sm me-2" onclick="window.app.currentPage.approveGoals('${goalSet.id}')" data-i18n="goals.approve"></button>
                  <button class="btn btn-danger btn-sm" onclick="window.app.currentPage.rejectGoals('${goalSet.id}')" data-i18n="goals.reject"></button>
                </div>` : `<span class="badge bg-success" data-i18n="status.approved"></span>`
                }
              </div>
              <div class="card-body">
                ${goalSet.goals.map(g => `<div class="goal-item p-2 border-bottom"><strong>${this.app.sanitizeHtml(g.weight)}%:</strong> ${this.app.sanitizeHtml(g.text)}</div>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.app.i18n.updateUI(container);
  }

  switchTab(tabName) {
    this.selectedTab = tabName;
    document.getElementById('pendingTabContent').style.display = tabName === 'pending' ? 'block' : 'none';
    document.getElementById('approvedTabContent').style.display = tabName === 'approved' ? 'block' : 'none';
    document.getElementById('pending-tab-btn').classList.toggle('active', tabName === 'pending');
    document.getElementById('approved-tab-btn').classList.toggle('active', tabName === 'approved');
  }

  async approveGoals(id) {
    if (!confirm(this.app.i18n.t('goals.confirm_approve'))) return;
    
    try {
        const goalIndex = this.pendingGoals.findIndex(g => g.id === id);
        if (goalIndex > -1) {
            const [approvedGoal] = this.pendingGoals.splice(goalIndex, 1);
            approvedGoal.status = 'approved';
            approvedGoal.approvedAt = new Date().toISOString();
            this.approvedGoals.push(approvedGoal);
            
            this.renderAllTables();
            this.updateStatistics();
            this.app.showSuccess(this.app.i18n.t('messages.approval_success'));
        }
    } catch (error) {
        this.app.showError(this.app.i18n.t('errors.approval_failed'));
    }
  }

  async rejectGoals(id) {
    if (!confirm(this.app.i18n.t('goals.confirm_reject'))) return;

    try {
        const goalIndex = this.pendingGoals.findIndex(g => g.id === id);
        if (goalIndex > -1) {
            this.pendingGoals.splice(goalIndex, 1);
            // In a real app, this would set the status to 'rejected'
            
            this.renderAllTables();
            this.updateStatistics();
            this.app.showSuccess(this.app.i18n.t('messages.rejection_success'));
        }
    } catch (error) {
        this.app.showError(this.app.i18n.t('errors.rejection_failed'));
    }
  }
}

window.GoalApprovalsPage = GoalApprovalsPage;
