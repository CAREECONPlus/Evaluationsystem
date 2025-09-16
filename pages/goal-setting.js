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
    this.existingGoalDoc = null;
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
              <label for="period-select" class="form-label" data-i18n="goals.select_evaluation_period"></label>
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
  
  async loadInitialData() {
    try {
      const settings = await this.app.api.getSettings();
      this.periods = settings.periods;
      this.renderPeriodSelect();
    } catch (error) {
      console.error("Error loading periods:", error);
      this.app.showError("評価期間の読み込みに失敗しました");
    }
  }

  renderPeriodSelect() {
    const select = document.getElementById('period-select');
    select.innerHTML = `
      <option value="" data-i18n="common.select"></option>
      ${this.periods.map(p => 
        `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`
      ).join('')}
    `;
  }

  setupEventListeners() {
    // Remove existing event listeners to prevent duplicates
    this.removeEventListeners();

    // Bind methods to prevent memory leaks
    this.boundOnPeriodChange = (e) => this.onPeriodChange(e);
    this.boundAddGoal = () => this.addGoal();
    this.boundSubmitGoals = () => this.submitGoals();

    // Add event listeners
    document.getElementById('period-select').addEventListener('change', this.boundOnPeriodChange);
    document.getElementById('add-goal-btn').addEventListener('click', this.boundAddGoal);
    document.getElementById('submit-goals-btn').addEventListener('click', this.boundSubmitGoals);
  }

  removeEventListeners() {
    if (this.boundOnPeriodChange) {
      const periodSelect = document.getElementById('period-select');
      if (periodSelect) periodSelect.removeEventListener('change', this.boundOnPeriodChange);
    }
    if (this.boundAddGoal) {
      const addBtn = document.getElementById('add-goal-btn');
      if (addBtn) addBtn.removeEventListener('click', this.boundAddGoal);
    }
    if (this.boundSubmitGoals) {
      const submitBtn = document.getElementById('submit-goals-btn');
      if (submitBtn) submitBtn.removeEventListener('click', this.boundSubmitGoals);
    }

    // Remove goal input listeners
    const container = document.getElementById('goals-container');
    if (container && this.boundGoalInputHandler) {
      container.removeEventListener('change', this.boundGoalInputHandler);
    }
  }

  setupGoalInputListeners() {
    const container = document.getElementById('goals-container');
    if (!container) return;

    // Remove existing listener to prevent duplicates
    if (this.boundGoalInputHandler) {
      container.removeEventListener('change', this.boundGoalInputHandler);
    }

    // Create bound handler
    this.boundGoalInputHandler = (e) => {
      if (e.target.classList.contains('goal-text')) {
        const index = parseInt(e.target.dataset.index);
        if (!isNaN(index) && this.goals[index]) {
          this.goals[index].text = e.target.value;
        }
      } else if (e.target.classList.contains('goal-weight')) {
        const index = parseInt(e.target.dataset.index);
        if (!isNaN(index) && this.goals[index]) {
          this.goals[index].weight = parseInt(e.target.value) || 0;
          this.updateTotalWeight();
        }
      }
    };

    // Add single delegated event listener
    container.addEventListener('change', this.boundGoalInputHandler);
  }

  async onPeriodChange(e) {
    this.selectedPeriodId = e.target.value;
    if (!this.selectedPeriodId) {
      this.goals = [];
      this.existingGoalDoc = null;
      this.renderGoals();
      return;
    }

    try {
      const existingGoals = await this.app.api.getGoals(
        this.app.currentUser.uid, 
        this.selectedPeriodId
      );
      
      if (existingGoals) {
        this.existingGoalDoc = existingGoals;
        this.goals = existingGoals.goals || [];
        this.renderStatusDisplay(existingGoals.status);
      } else {
        this.goals = [];
        this.existingGoalDoc = null;
        this.renderStatusDisplay(null);
      }
      
      this.renderGoals();
      this.updateTotalWeight();
    } catch (error) {
      console.error("Error loading goals:", error);
      this.app.showError("目標の読み込みに失敗しました");
    }
  }

  renderStatusDisplay(status) {
    const statusDisplay = document.getElementById('status-display');
    if (!status) {
      statusDisplay.innerHTML = '';
      return;
    }

    const statusClass = this.app.getStatusBadgeClass(status);
    statusDisplay.innerHTML = `
      <div class="alert alert-info">
        <span data-i18n="common.current_status"></span>: 
        <span class="badge ${statusClass}" data-i18n="status.${status}"></span>
      </div>
    `;
    this.app.i18n.updateUI(statusDisplay);
  }

  addGoal() {
    if (this.goals.length >= this.maxGoals) {
      this.app.showError(`最大${this.maxGoals}つまでの目標を設定できます`);
      return;
    }

    this.goals.push({
      text: '',
      weight: 0
    });
    
    this.renderGoals();
  }

  removeGoal(index) {
    this.goals.splice(index, 1);
    this.renderGoals();
    this.updateTotalWeight();
  }

  renderGoals() {
    const container = document.getElementById('goals-container');
    
    if (this.goals.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-bullseye fa-3x mb-3"></i>
          <p>目標を追加してください</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.goals.map((goal, index) => `
      <div class="goal-item mb-3 p-3 border rounded">
        <div class="row">
          <div class="col-md-7">
            <label class="form-label">目標 ${index + 1}</label>
            <input type="text" class="form-control goal-text" 
                   data-index="${index}" 
                   value="${this.app.sanitizeHtml(goal.text)}"
                   placeholder="目標を入力してください">
          </div>
          <div class="col-md-3">
            <label class="form-label">ウェイト (%)</label>
            <input type="number" class="form-control goal-weight" 
                   data-index="${index}" 
                   value="${goal.weight}"
                   min="0" max="100" step="5">
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-danger btn-sm w-100" 
                    onclick="window.app.currentPage.removeGoal(${index})">
              <i class="fas fa-trash"></i> 削除
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Event delegation to avoid duplicate listeners
    this.setupGoalInputListeners();
  }

  updateTotalWeight() {
    this.totalWeight = this.goals.reduce((sum, goal) => sum + (goal.weight || 0), 0);
    document.getElementById('total-weight').textContent = this.totalWeight;
    
    const submitBtn = document.getElementById('submit-goals-btn');
    submitBtn.disabled = this.totalWeight !== 100 || this.goals.length === 0;
    
    // 合計が100%でない場合は警告を表示
    if (this.totalWeight !== 100 && this.goals.length > 0) {
      document.getElementById('total-weight').parentElement.classList.add('text-danger');
    } else {
      document.getElementById('total-weight').parentElement.classList.remove('text-danger');
    }
  }

  async submitGoals() {
    if (this.totalWeight !== 100) {
        this.app.showError("合計ウェイトは100%にしてください。");
        return;
    }
    
    // 空の目標がないかチェック
    const emptyGoals = this.goals.filter(g => !g.text.trim());
    if (emptyGoals.length > 0) {
        this.app.showError("すべての目標にテキストを入力してください。");
        return;
    }
    
    if (!confirm(this.app.i18n.t('goals.confirm_apply'))) return;

    const period = this.periods.find(p => p.id === this.selectedPeriodId);
    const data = {
        id: this.existingGoalDoc?.id,
        userId: this.app.currentUser.uid,
        userName: this.app.currentUser.name,
        periodId: this.selectedPeriodId,
        periodName: period.name,
        goals: this.goals,
        status: 'pending_approval',
        tenantId: this.app.currentUser.tenantId,
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

  // Cleanup method to prevent memory leaks
  cleanup() {
    this.removeEventListeners();
  }
}
