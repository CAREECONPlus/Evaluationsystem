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
      <div class="goal-approvals-page">
        <h1 data-i18n="nav.goal_approvals">目標承認</h1>
        
        <div class="stats-grid mb-2">
          <div class="stat-card">
            <div class="stat-value" id="pendingCount">0</div>
            <div class="stat-label" data-i18n="goals.pending_goals">承認待ち目標</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="approvedCount">0</div>
            <div class="stat-label" data-i18n="goals.approved_goals">承認済み目標</div>
          </div>
        </div>
        
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" id="pending-tab-btn" onclick="window.goalapprovalsPage.switchTab('pending')" data-i18n="goals.pending_goals">承認待ち目標</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="approved-tab-btn" onclick="window.goalapprovalsPage.switchTab('approved')" data-i18n="goals.approved_goals">承認済み目標</button>
          </li>
        </ul>
        
        <div id="pendingTabContent">
          ${this.renderGoalsTable(this.pendingGoals, 'pending')}
        </div>
        <div id="approvedTabContent" style="display: none;">
          ${this.renderGoalsTable(this.approvedGoals, 'approved')}
        </div>
      </div>
    `;
  }

  async init() {
    if (!this.app.hasRole("admin")) {
      this.app.navigate("/dashboard");
      return;
    }
    await this.loadGoals();
    this.updateStatistics();
    
    // インスタンスをグローバルに設定してボタンからアクセスできるようにする
    window.goalapprovalsPage = this;
  }

  async loadGoals() {
    // Mock data
    this.pendingGoals = [
      { id: "goal-1", userName: "田中 太郎", period: "2024-q1", submittedAt: new Date(), goals: [{ text: "品質向上", weight: 100 }] },
    ];
    this.approvedGoals = [
      { id: "goal-2", userName: "佐藤 花子", period: "2024-q1", approvedAt: new Date(), goals: [{ text: "安全第一", weight: 100 }] },
    ];
  }

  updateStatistics() {
    document.getElementById("pendingCount").textContent = this.pendingGoals.length;
    document.getElementById("approvedCount").textContent = this.approvedGoals.length;
  }

  renderGoalsTable(data, type) {
    if (data.length === 0) {
      return `<div class="card"><div class="card-body text-center text-muted" data-i18n="common.no_data">データがありません</div></div>`;
    }
    return `
      <div class="card">
        <div class="card-body">
          ${data.map(goalSet => `
            <div class="goal-approval-card">
              <div class="goal-approval-header">
                <div class="user-info">
                  <h5>${goalSet.userName}</h5>
                  <small class="text-muted">${goalSet.period} / ${type === 'pending' ? '申請日' : '承認日'}: ${this.app.formatDate(type === 'pending' ? goalSet.submittedAt : goalSet.approvedAt)}</small>
                </div>
                ${type === 'pending' ? `
                <div class="approval-actions">
                  <button class="btn btn-success btn-sm" onclick="window.goalapprovalsPage.approveGoals('${goalSet.id}')" data-i18n="goals.approve">承認</button>
                  <button class="btn btn-danger btn-sm" onclick="window.goalapprovalsPage.rejectGoals('${goalSet.id}')" data-i18n="goals.reject">差し戻し</button>
                </div>` : `<span class="badge bg-success" data-i18n="status.approved">承認済み</span>`
                }
              </div>
              <div class="goals-list">
                ${goalSet.goals.map(g => `<div class="goal-item"><strong>${g.weight}%:</strong> ${g.text}</div>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    document.getElementById('pendingTabContent').style.display = tabName === 'pending' ? 'block' : 'none';
    document.getElementById('approvedTabContent').style.display = tabName === 'approved' ? 'block' : 'none';
    document.getElementById('pending-tab-btn').classList.toggle('active', tabName === 'pending');
    document.getElementById('approved-tab-btn').classList.toggle('active', tabName === 'approved');
  }

  approveGoals(id) { alert(`ID: ${id} を承認 (モック)`); }
  rejectGoals(id) { alert(`ID: ${id} を差し戻し (モック)`); }
}

window.GoalApprovalsPage = GoalApprovalsPage;
