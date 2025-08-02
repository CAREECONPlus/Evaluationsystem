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
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <label for="period-select" class="form-label mb-0" data-i18n="evaluations.select_period"></label>
                <select id="period-select" class="form-select d-inline-block w-auto ms-2"></select>
            </div>
            <div class="weight-indicator fw-bold">
              <span data-i18n="goals.total_weight"></span>: 
              <span id="total-weight" class="ms-2">0%</span>
            </div>
          </div>
          <div class="card-body">
            <div id="goals-container">
                <p class="text-muted text-center" data-i18n="goals.select_evaluation_period"></p>
            </div>
            <button id="add-goal-btn" class="btn btn-secondary mt-3" disabled>
                <i class="fas fa-plus me-2"></i><span data-i18n="goals.add_goal"></span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    if (!this.app.hasAnyRole(['evaluator', 'worker'])) {
        this.app.navigate('#/dashboard');
        return;
    }

    document.getElementById('period-select').addEventListener('change', (e) => this.loadGoalsForPeriod(e.target.value));
    document.getElementById('add-goal-btn').addEventListener('click', () => this.addGoal());
    document.getElementById('submit-goals-btn').addEventListener('click', () => this.submitGoals());

    await this.loadPeriods();
  }

  async loadPeriods() {
      try {
          const settings = await this.app.api.getSettings();
          this.periods = settings.periods;
          const select = document.getElementById('period-select');
          select.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` + 
              this.periods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
          this.app.i18n.updateUI();
      } catch(e) {
          this.app.showError("評価期間の読み込みに失敗しました。");
          console.error(e);
      }
  }

  async loadGoalsForPeriod(periodId) {
    this.selectedPeriodId = periodId;
    const container = document.getElementById('goals-container');
    const addBtn = document.getElementById('add-goal-btn');
    
    if (!periodId) {
        container.innerHTML = `<p class="text-muted text-center" data-i18n="goals.select_evaluation_period"></p>`;
        addBtn.disabled = true;
        this.app.i18n.updateUI(container);
        this.updateTotalWeight();
        return;
    }

    try {
        this.existingGoalDoc = await this.app.api.getGoals(this.app.currentUser.uid, periodId);
        this.goals = this.existingGoalDoc ? this.existingGoalDoc.goals : [{ text: '', weight: 0 }];
        addBtn.disabled = false;
        this.renderGoals();
    } catch(e) {
        this.app.showError("目標データの読み込みに失敗しました。");
        console.error(e);
    }
  }

  renderGoals() {
    const container = document.getElementById('goals-container');
    const isEditable = !this.existingGoalDoc || this.existingGoalDoc.status === 'draft' || this.existingGoalDoc.status === 'rejected';

    container.innerHTML = this.goals.map((goal, index) => `
        <div class="row g-2 mb-2 align-items-center">
            <div class="col">
                <textarea class="form-control" rows="2" placeholder="目標内容" ${!isEditable ? 'readonly' : ''} oninput="window.app.currentPage.updateGoal(${index}, 'text', this.value)">${this.app.sanitizeHtml(goal.text)}</textarea>
            </div>
            <div class="col-auto">
                <input type="number" class="form-control" placeholder="ウェイト(%)" style="width: 120px;" min="0" max="100" ${!isEditable ? 'readonly' : ''} oninput="window.app.currentPage.updateGoal(${index}, 'weight', this.value)" value="${goal.weight || ''}">
            </div>
            <div class="col-auto">
                ${isEditable ? `<button class="btn btn-sm btn-outline-danger" onclick="window.app.currentPage.removeGoal(${index})"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        </div>
    `).join('');

    document.getElementById('add-goal-btn').disabled = !isEditable || this.goals.length >= this.maxGoals;
    this.updateTotalWeight();
  }

  updateGoal(index, key, value) {
    this.goals[index][key] = (key === 'weight') ? Number(value) : value;
    this.updateTotalWeight();
  }

  addGoal() {
    if (this.goals.length < this.maxGoals) {
      this.goals.push({ text: '', weight: 0 });
      this.renderGoals();
    }
  }

  removeGoal(index) {
      if (this.goals.length > 1) {
          this.goals.splice(index, 1);
          this.renderGoals();
      }
  }

  updateTotalWeight() {
    const total = this.goals.reduce((sum, goal) => sum + (goal.weight || 0), 0);
    this.totalWeight = total;
    
    const totalEl = document.getElementById('total-weight');
    totalEl.textContent = `${total}%`;
    totalEl.classList.toggle('text-success', total === 100);
    totalEl.classList.toggle('text-danger', total !== 100);

    const isEditable = !this.existingGoalDoc || this.existingGoalDoc.status === 'draft' || this.existingGoalDoc.status === 'rejected';
    document.getElementById('submit-goals-btn').disabled = total !== 100 || !isEditable;
  }

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
        submittedAt: serverTimestamp()
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
}
