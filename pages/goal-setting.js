/**
 * Goal Setting Page Component (Firebase Integrated)
 * 目標設定ページコンポーネント（Firebase連携版）
 */
export class GoalSettingPage {
  constructor(app) {
    this.app = app;
    this.goals = [];
    this.periods = [];
    this.selectedPeriodId = null;
    this.existingGoalDoc = null; // To store the loaded goal document from Firestore
    this.totalWeight = 0;
    this.maxGoals = 5;
  }

  async render() {
    return `
      <div class="goal-setting-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="goals.title"></h1>
          <div class="goal-actions">
            <button class="btn btn-primary" id="submit-goals-btn" disabled>
                <i class="fas fa-paper-plane me-2"></i><span data-i18n="goals.apply"></span>
            </button>
          </div>
        </div>

        <div class="alert alert-info">
          <h4 class="alert-heading" data-i18n="goals.about_goal_setting"></h4>
          <ul>
            <li data-i18n="goals.max_goals_info" data-i18n-params='{"maxGoals": 5}'></li>
            <li data-i18n="goals.total_weight_100_info"></li>
            <li data-i18n="goals.admin_approval_info"></li>
          </ul>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="mb-3">
              <label for="period-select" class="form-label" data-i18n="goals.evaluation_period"></label>
              <select id="period-select" class="form-select"></select>
            </div>
            <hr>
            <div id="goals-container"></div>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <button class="btn btn-outline-secondary" id="add-goal-btn">
                    <i class="fas fa-plus me-2"></i><span data-i18n="goals.add_goal"></span>
                </button>
                <div class="fw-bold fs-5">
                    <span data-i18n="goals.total_weight"></span>: <span id="total-weight">0</span>%
                </div>
            </div>
            <div id="status-display" class="mt-3"></div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    await this.loadInitialData();
    this.setupEventListeners();
    this.app.i18n.updateUI();
  }
  
  // ... 他のメソッドは変更なし

  async submitGoals() {
    if (this.totalWeight !== 100) {
        this.app.showError("合計ウェイトは100%にしてください。");
        return;
    }
    if (!confirm(this.app.i18n.t('goals.confirm_apply'))) return;

    const period = this.periods.find(p => p.id === this.selectedPeriodId);
    const data = {
        id: this.existingGoalDoc?.id, // Pass ID for updates
        userId: this.app.currentUser.uid,
        userName: this.app.currentUser.name,
        periodId: this.selectedPeriodId,
        periodName: period.name,
        goals: this.goals,
        status: 'pending_approval',
        tenantId: this.app.currentUser.tenantId,
        // ★ 修正点: this.app.api経由で呼び出す
        submittedAt: this.app.api.serverTimestamp()
    };

    const btn = document.getElementById('submit-goals-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${this.app.i18n.t('common.loading')}`;

    try {
        await this.app.api.saveGoals(data);
        this.app.showSuccess(this.app.i18n.t('messages.save_success'));
        this.app.navigate('#/dashboard');
    } catch (e) {
        this.app.showError(e.message);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane me-2"></i><span data-i18n="goals.apply"></span>`;
        this.app.i18n.updateUI(btn);
    }
  }
  
  // ... 他のメソッドは変更なし
}
