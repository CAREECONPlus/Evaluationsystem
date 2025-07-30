/**
 * Evaluation Form Page Component
 * 評価フォームページコンポーネント
 */
class EvaluationFormPage {
  constructor(app) {
    this.app = app;
    this.evaluationStructure = null;
    this.qualitativeGoals = [];
    this.evaluationData = { quantitative: {}, qualitative: {}, goals: {} };
    this.currentStep = "quantitative";
    
    // モード管理
    this.isViewMode = false;
    this.evaluationId = null;
    this.isSubmitted = false;

    // データ保持
    this.targetUser = null;
    this.selectedPeriod = null;
    this.evaluationPeriods = [];
    this.usersForEvaluation = [];
  }

  /**
   * Render evaluation form page
   */
  async render() {
    const titleKey = this.isViewMode ? "evaluation.details_title" : "evaluation.title";
    const userRole = this.app.currentUser?.role;
    const canSelectUser = (userRole === "evaluator" || userRole === "admin") && !this.isViewMode;

    return `
      <div class.="evaluation-form-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h1 data-i18n="${titleKey}"></h1>
          <div class="evaluation-actions">
            ${this.isViewMode ? `
              <button class="btn btn-secondary" onclick="window.app.navigate('/evaluations')">
                <i class="fas fa-arrow-left me-2"></i><span data-i18n="common.back_to_list"></span>
              </button>
            ` : `
              <button class="btn btn-secondary" onclick="window.app.currentPage.saveDraft()" id="saveDraftBtn"><span data-i18n="common.save_draft"></span></button>
              <button class="btn btn-success" onclick="window.app.currentPage.submitEvaluation()" id="submitBtn" disabled><span data-i18n="evaluation.submit"></span></button>
            `}
          </div>
        </div>

        <!-- Progress Indicator (View Modeでは非表示) -->
        ${!this.isViewMode ? `
        <div class="progress-indicator mb-2">
            <div class="progress-step active" data-step="quantitative" onclick="window.app.currentPage.switchStep('quantitative')"><div class="step-number">1</div><div class="step-label" data-i18n="evaluation.quantitative"></div></div>
            <div class="progress-step" data-step="qualitative" onclick="window.app.currentPage.switchStep('qualitative')"><div class="step-number">2</div><div class="step-label" data-i18n="evaluation.qualitative"></div></div>
            <div class="progress-step" data-step="goals" onclick="window.app.currentPage.switchStep('goals')"><div class="step-number">3</div><div class="step-label" data-i18n="evaluation.goal_achievement"></div></div>
        </div>` : ''}

        <div class="card mb-2">
          <div class="card-header"><h3 data-i18n="evaluation.target_info"></h3></div>
          <div class="card-body">
            <!-- User/Period Selection (New Mode Only) -->
            ${!this.isViewMode ? `
            <div class="row">
              ${canSelectUser ? `
              <div class="col-md-6 mb-3">
                <label for="targetUserSelect" class="form-label" data-i18n="evaluation.select_target_user"></label>
                <select id="targetUserSelect" class="form-select" onchange="window.app.currentPage.onTargetUserChange()"></select>
              </div>` : ''}
              <div class="col-md-6 mb-3">
                <label for="evaluationPeriodSelect" class="form-label" data-i18n="evaluation.select_period"></label>
                <select id="evaluationPeriodSelect" class="form-select" onchange="window.app.currentPage.onPeriodChange()"></select>
              </div>
            </div>` : ''}
            <!-- Target Info Display -->
            <div class="target-info mt-3">
              <div class="info-item"><label data-i18n="evaluation.target_user"></label><span id="displayTargetUserName"></span></div>
              <div class="info-item"><label data-i18n="evaluation.job_type"></label><span id="displayTargetJobType"></span></div>
              <div class="info-item"><label data-i18n="evaluation.period_info"></label><span id="displayEvaluationPeriod"></span></div>
              <div class="info-item"><label data-i18n="evaluation.evaluator_name"></label><span>${this.app.sanitizeHtml(this.app.currentUser?.name || '')}</span></div>
            </div>
          </div>
        </div>

        <!-- Evaluation Steps -->
        <div class="evaluation-steps">
          <div class="step-content active" id="quantitativeStep"></div>
          <div class="step-content" id="qualitativeStep"></div>
          <div class="step-content" id="goalsStep"></div>
        </div>

        <!-- Navigation Buttons (New Mode Only) -->
        ${!this.isViewMode ? `
        <div class="step-navigation">
          <button class="btn btn-secondary" onclick="window.app.currentPage.previousStep()" id="prevBtn" style="display: none;"><span data-i18n="common.previous"></span></button>
          <button class="btn btn-primary" onclick="window.app.currentPage.nextStep()" id="nextBtn"><span data-i18n="common.next"></span></button>
        </div>` : ''}
      </div>
    `;
  }

  /**
   * Initialize page
   */
  async init(params) {
    this.app.currentPage = this;
    
    this.evaluationId = params.get('id');
    this.isViewMode = !!this.evaluationId;

    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }
    
    if (this.isViewMode) {
      await this.loadEvaluationDetails();
    } else {
      await this.loadInitialDataForNewForm();
    }

    this.updateUI();
  }
  
  /**
   * Load data for a new evaluation form
   */
  async loadInitialDataForNewForm() {
    try {
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      this.usersForEvaluation = await this.app.api.getUsers(); // Simplified for mock
      
      const userRole = this.app.currentUser?.role;
      if (userRole === "worker") {
        this.targetUser = this.app.currentUser;
      }
    } catch (e) {
      this.app.showError("Failed to load initial data.");
    }
  }

  /**
   * Load data for viewing an existing evaluation
   */
  async loadEvaluationDetails() {
    try {
      const data = await this.app.api.getEvaluationById(this.evaluationId);
      if (!data) {
        this.app.showError("評価データが見つかりません。");
        return;
      }
      this.evaluationData = data.data; // Scores and comments
      this.isSubmitted = true; // View mode implies it's submitted/completed

      const allUsers = await this.app.api.getUsers();
      this.targetUser = allUsers.find(u => u.id === data.employeeId);
      
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      this.selectedPeriod = this.evaluationPeriods.find(p => p.id === data.period);
      
      await this.loadStructureAndGoals();
    } catch (e) {
      this.app.showError("評価詳細の読み込みに失敗しました。");
    }
  }

  /**
   * Load structure and goals based on selected user/period
   */
  async loadStructureAndGoals() {
    if (!this.targetUser || !this.selectedPeriod) {
      this.clearForms();
      return;
    }
    try {
      const jobTypeId = this.app.api._mockJobTypes.find(jt => jt.name === this.targetUser.jobType)?.id;
      if(jobTypeId) {
        this.evaluationStructure = await this.app.api.getEvaluationStructure(jobTypeId);
      }
      this.qualitativeGoals = await this.app.api.getQualitativeGoals(this.targetUser.id, this.selectedPeriod.id);
    } catch(e) {
      this.app.showError("評価項目の読み込みに失敗しました。");
    }
  }

  /**
   * Update all UI elements based on current state
   */
  updateUI() {
    this.updateTargetDisplay();
    this.renderAllForms();
    if (!this.isViewMode) {
      this.updateProgressIndicator();
      this.updateNavigationButtons();
      this.updateSubmitButtonState();
    }
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  updateTargetDisplay() {
    // Populate dropdowns for new mode
    if (!this.isViewMode) {
      const userSelect = document.getElementById('targetUserSelect');
      if (userSelect) {
        userSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
          this.usersForEvaluation
            .filter(u => u.id !== this.app.currentUser.id)
            .map(u => `<option value="${u.id}">${this.app.sanitizeHtml(u.name)}</option>`).join('');
      }
      const periodSelect = document.getElementById('evaluationPeriodSelect');
      if (periodSelect) {
        periodSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
          this.evaluationPeriods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
      }
    }

    // Update display spans
    document.getElementById('displayTargetUserName').textContent = this.targetUser?.name || (this.app.currentUser.role === 'worker' ? this.app.currentUser.name : 'N/A');
    document.getElementById('displayTargetJobType').textContent = this.targetUser?.jobType || 'N/A';
    document.getElementById('displayEvaluationPeriod').textContent = this.selectedPeriod?.name || 'N/A';
  }
  
  renderAllForms() {
    this.renderFormContent('quantitative', 'quantitativeStep');
    this.renderFormContent('qualitative', 'qualitativeStep');
    this.renderFormContent('goals', 'goalsStep');
  }

  clearForms() {
    document.getElementById('quantitativeStep').innerHTML = '';
    document.getElementById('qualitativeStep').innerHTML = '';
    document.getElementById('goalsStep').innerHTML = '';
  }

  renderFormContent(type, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    let items = [];
    if (type === 'goals') {
      items = this.qualitativeGoals;
    } else if (this.evaluationStructure) {
      items = this.evaluationStructure.categories.flatMap(c => c.items.filter(i => i.type === type));
    }

    if (!this.targetUser || !this.selectedPeriod) {
      container.innerHTML = `<div class="text-center text-muted p-3" data-i18n="evaluation.select_target_and_period_hint"></div>`;
      this.app.i18n.updateUI(container);
      return;
    }
    
    if (items.length === 0) {
      container.innerHTML = `<p class="text-muted text-center p-3" data-i18n="evaluation.no_${type}_items"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = items.map(item => this.renderItem(item, type)).join('');
    this.app.i18n.updateUI(container);
  }

  renderItem(item, type) {
    const isGoal = type === 'goals';
    const data = this.evaluationData[type]?.[item.id] || {};
    const isDisabled = this.isViewMode || this.isSubmitted;

    return `
      <div class="card mb-3">
        <div class="card-body">
          <label class="item-name fw-bold">${this.app.sanitizeHtml(isGoal ? item.text : item.name)}</label>
          ${isGoal ? `<div class="text-muted small" data-i18n="evaluation.weight_display" data-i18n-params='{"weight": ${item.weight}}'></div>` : ''}
          <div class="rating-scale my-2">
            ${[1, 2, 3, 4, 5].map(score => `
              <label class="rating-option">
                <input type="radio" name="${type}-${item.id}" value="${score}"
                       onchange="window.app.currentPage.updateScore('${type}', '${item.id}', this.value)"
                       ${data.score == score ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                <span class="rating-label">${score}</span>
              </label>
            `).join('')}
          </div>
          ${type !== 'quantitative' ? `
            <textarea class="form-control" data-i18n-placeholder="evaluation.comment_placeholder"
                      oninput="window.app.currentPage.updateComment('${type}', '${item.id}', this.value)"
                      ${isDisabled ? 'readonly' : ''}>${this.app.sanitizeHtml(data.comment || '')}</textarea>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // ... (Other methods: switchStep, updateScore, updateComment, navigation, etc.)
}

window.EvaluationFormPage = EvaluationFormPage;
