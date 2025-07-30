/**
 * Goal Setting Page Component
 * 目標設定ページコンポーネント
 */
class GoalSettingPage {
  constructor(app) {
    this.app = app;
    this.goals = [];
    this.totalWeight = 0;
    this.maxGoals = 5;
    this.isSubmitted = false;
    this.evaluationPeriods = []; // 評価期間データ
  }

  /**
   * Render goal setting page
   */
  async render() {
    return `
      <div class="goal-setting-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h1 data-i18n="goals.title"></h1>
          <div class="goal-actions">
            <button class="btn btn-secondary" onclick="window.app.currentPage.loadDraft()" id="loadDraftBtn"><span data-i18n="common.load_draft"></span></button>
            <button class="btn btn-primary" onclick="window.app.currentPage.saveDraft()" id="saveDraftBtn"><span data-i18n="common.save_draft"></span></button>
            <button class="btn btn-success" onclick="window.app.currentPage.submitGoals()" id="submitBtn" disabled><span data-i18n="goals.apply"></span></button>
          </div>
        </div>

        <div class="alert alert-info">
          <h4 data-i18n="goals.about_goal_setting"></h4>
          <ul>
            <li data-i18n="goals.max_goals_info" data-i18n-params='{"maxGoals": ${this.maxGoals}}'></li>
            <li data-i18n="goals.set_weights_info"></li>
            <li data-i18n="goals.total_weight_100_info"></li>
            <li data-i18n="goals.admin_approval_info"></li>
          </ul>
        </div>

        <div class="card mb-2" id="currentStatusCard" style="display: none;">
          <div class="card-header"><h3 data-i18n="common.current_status"></h3></div>
          <div class="card-body" id="currentStatusContent"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h3 data-i18n="goals.goal_setting_form"></h3>
              <div class="weight-indicator">
                <span data-i18n="goals.total_weight"></span>: 
                <span id="totalWeight" class="weight-value">0</span>%
                <span class="weight-status" id="weightStatus"></span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div id="goalsContainer"></div>
            <button class="btn btn-primary" onclick="window.app.currentPage.addGoal()" id="addGoalBtn"><span data-i18n="goals.add_goal"></span></button>
          </div>
        </div>

        <div class="card mt-2">
          <div class="card-header"><h3 data-i18n="evaluation.period"></h3></div>
          <div class="card-body">
            <div class="form-group">
              <label for="evaluationPeriod" class="form-label" data-i18n="goals.select_evaluation_period"></label>
              <select id="evaluationPeriod" class="form-select" onchange="window.app.currentPage.onPeriodChange()"></select>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize goal setting page
   */
  async init() {
    this.app.currentPage = this;

    if (!this.app.hasAnyRole(["evaluator", "worker"])) {
      this.app.navigate("/dashboard");
      return;
    }

    await this.loadEvaluationPeriods();
    await this.loadExistingGoals();

    if (this.goals.length === 0) {
      this.addGoal();
    }

    this.renderGoals();
    this.updateUI();

    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  updateUI() {
    this.updateWeightIndicator();
    this.updateAddGoalButton();
    this.updateSubmitButton();
  }
  
  async loadEvaluationPeriods() {
      try {
          this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
          const periodSelect = document.getElementById("evaluationPeriod");
          if (periodSelect) {
              periodSelect.innerHTML = `<option value="" data-i18n="common.select"></option>` +
                                       this.evaluationPeriods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
          }
      } catch (error) {
          this.app.showError(this.app.i18n.t("errors.evaluation_periods_load_failed"));
      }
  }

  async loadExistingGoals() {
    try {
      const existingGoals = await this.app.api.getQualitativeGoals(this.app.currentUser.id);
      const latestGoalSet = existingGoals.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
      
      if (latestGoalSet) {
        this.goals = latestGoalSet.goals || [];
        this.isSubmitted = (latestGoalSet.status !== "draft" && latestGoalSet.status !== "rejected");
        
        const periodSelect = document.getElementById("evaluationPeriod");
        if (periodSelect) periodSelect.value = latestGoalSet.period;
        
        this.showCurrentStatus(latestGoalSet.status);
        if (this.isSubmitted) this.disableForm();
      }
    } catch (error) {
      this.app.showError(this.app.i18n.t("errors.goals_load_failed"));
    }
  }

  showCurrentStatus(status) {
    const card = document.getElementById("currentStatusCard");
    const content = document.getElementById("currentStatusContent");
    if(!card || !content) return;

    card.style.display = "block";
    content.innerHTML = `<div class="alert alert-info"><strong><span data-i18n="common.status"></span>:</strong> <span data-i18n="status.${status}"></span></div>`;
    this.app.i18n.updateUI(content);
  }

  addGoal() {
    if (this.isSubmitted) return;
    if (this.goals.length >= this.maxGoals) {
      this.app.showError(this.app.i18n.t("errors.max_goals_reached", { maxGoals: this.maxGoals }));
      return;
    }
    this.goals.push({ id: `goal-${this.app.generateId()}`, text: "", weight: 0 });
    this.renderGoals();
    this.updateUI();
  }

  removeGoal(goalId) {
    if (this.isSubmitted) return;
    if (this.goals.length <= 1) return;
    this.goals = this.goals.filter((goal) => goal.id !== goalId);
    this.renderGoals();
    this.updateUI();
  }

  updateGoalText(goalId, text) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (goal) goal.text = text;
    this.updateSubmitButton();
  }

  updateGoalWeight(goalId, weight) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (goal) goal.weight = Number.parseInt(weight) || 0;
    this.updateWeightIndicator();
    this.updateSubmitButton();
  }

  renderGoals() {
    const container = document.getElementById("goalsContainer");
    if (!container) return;
    container.innerHTML = this.goals.map((goal, index) => `
      <div class="goal-item" data-goal-id="${goal.id}">
        <div class="goal-header">
          <h4><span data-i18n="goals.goal_number" data-i18n-params='{"number": ${index + 1}}'></span></h4>
          <button class="btn btn-danger btn-sm" onclick="window.app.currentPage.removeGoal('${goal.id}')" ${this.goals.length <= 1 || this.isSubmitted ? "disabled" : ""}>
            <span data-i18n="goals.remove_goal"></span>
          </button>
        </div>
        <div class="goal-content">
          <div class="form-group">
            <label for="goalText-${goal.id}" class="form-label" data-i18n="goals.goal_text"></label>
            <textarea id="goalText-${goal.id}" class="form-control" rows="3" data-i18n-placeholder="goals.goal_content_placeholder" oninput="window.app.currentPage.updateGoalText('${goal.id}', this.value)" ${this.isSubmitted ? "readonly" : ""}>${this.app.sanitizeHtml(goal.text)}</textarea>
          </div>
          <div class="form-group">
            <label for="goalWeight-${goal.id}" class="form-label" data-i18n="goals.weight_percent"></label>
            <input type="number" id="goalWeight-${goal.id}" class="form-control" min="0" max="100" value="${goal.weight}" oninput="window.app.currentPage.updateGoalWeight('${goal.id}', this.value)" ${this.isSubmitted ? "readonly" : ""}>
          </div>
        </div>
      </div>`).join("");
    this.app.i18n.updateUI(container);
  }

  updateWeightIndicator() {
    this.totalWeight = this.goals.reduce((sum, goal) => sum + (goal.weight || 0), 0);
    const totalWeightEl = document.getElementById("totalWeight");
    const weightStatusEl = document.getElementById("weightStatus");
    if (totalWeightEl) totalWeightEl.textContent = this.totalWeight;
    if (weightStatusEl) {
      if (this.totalWeight === 100) {
        weightStatusEl.textContent = this.app.i18n.t("common.valid_status");
        weightStatusEl.className = "weight-status text-success";
      } else {
        weightStatusEl.textContent = this.totalWeight > 100 ? this.app.i18n.t("common.over_limit_status") : this.app.i18n.t("common.insufficient_status");
        weightStatusEl.className = "weight-status text-danger";
      }
    }
  }

  updateAddGoalButton() {
    const addBtn = document.getElementById("addGoalBtn");
    if (addBtn) addBtn.disabled = this.goals.length >= this.maxGoals || this.isSubmitted;
  }

  updateSubmitButton() {
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      const period = document.getElementById("evaluationPeriod")?.value;
      submitBtn.disabled = !(this.totalWeight === 100 && this.goals.length > 0 && this.goals.every(g => g.text.trim()) && period && !this.isSubmitted);
    }
  }

  async saveDraft() {
    const userId = this.app.currentUser.id;
    localStorage.setItem(`goals-draft-${userId}`, JSON.stringify({ goals: this.goals, period: document.getElementById("evaluationPeriod").value }));
    this.app.showSuccess(this.app.i18n.t("messages.save_success"));
  }

  async loadDraft() {
    const userId = this.app.currentUser.id;
    const draftData = localStorage.getItem(`goals-draft-${userId}`);
    if (draftData) {
      const draft = JSON.parse(draftData);
      this.goals = draft.goals || [];
      document.getElementById("evaluationPeriod").value = draft.period || "";
      this.renderGoals();
      this.updateUI();
      this.app.showInfo(this.app.i18n.t("messages.draft_loaded"));
    } else {
      this.app.showWarning(this.app.i18n.t("errors.no_draft_found"));
    }
  }

  async submitGoals() {
    if (!confirm(this.app.i18n.t("goals.confirm_submit"))) return;
    this.isSubmitted = true;
    this.disableForm();
    this.app.showSuccess(this.app.i18n.t("messages.goals_submitted"));
    // API call logic here
  }

  disableForm() {
    document.querySelectorAll('.goal-setting-page input, .goal-setting-page textarea, .goal-setting-page select, .goal-setting-page button').forEach(el => el.disabled = true);
  }

  onPeriodChange() {
    this.updateSubmitButton();
  }
}

window.GoalSettingPage = GoalSettingPage;
