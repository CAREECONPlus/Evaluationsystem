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
    
    this.isViewMode = false;
    this.evaluationId = null;
    this.isSubmitted = false;

    this.targetUser = null;
    this.selectedPeriod = null;
    this.evaluationPeriods = [];
    this.usersForEvaluation = [];
  }

  async render() {
    const titleKey = this.isViewMode ? "evaluation.details_title" : "evaluation.title";
    const userRole = this.app.currentUser?.role;
    const canSelectUser = (userRole === "evaluator" || userRole === "admin") && !this.isViewMode;

    return `
      <div class="evaluation-form-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h1 data-i18n="${titleKey}"></h1>
          <div class="evaluation-actions">
            ${this.isViewMode ? `
              <button class="btn btn-secondary" onclick="window.app.navigate('/evaluations')" data-link>
                <i class="fas fa-arrow-left me-2"></i><span data-i18n="common.back_to_list"></span>
              </button>
            ` : `
              <button class="btn btn-secondary" onclick="window.app.currentPage.saveDraft()" id="saveDraftBtn"><span data-i18n="common.save_draft"></span></button>
              <button class="btn btn-success" onclick="window.app.currentPage.submitEvaluation()" id="submitBtn" disabled><span data-i18n="evaluation.submit"></span></button>
            `}
          </div>
        </div>

        ${!this.isViewMode ? `
        <div class="progress-indicator mb-4">
            <div class="progress-step active" data-step="quantitative" onclick="window.app.currentPage.switchStep('quantitative')"><div class="step-number">1</div><div class="step-label" data-i18n="evaluation.quantitative"></div></div>
            <div class="progress-step" data-step="qualitative" onclick="window.app.currentPage.switchStep('qualitative')"><div class="step-number">2</div><div class="step-label" data-i18n="evaluation.qualitative"></div></div>
            <div class="progress-step" data-step="goals" onclick="window.app.currentPage.switchStep('goals')"><div class="step-number">3</div><div class="step-label" data-i18n="evaluation.goal_achievement"></div></div>
        </div>` : ''}

        <div class="card mb-3">
          <div class="card-header"><h3 class="h5" data-i18n="evaluation.target_info"></h3></div>
          <div class="card-body">
            ${!this.isViewMode ? `
            <div class="row">
              ${canSelectUser ? `
              <div class="col-md-6 mb-3">
                <label for="targetUserSelect" class="form-label" data-i18n="evaluation.select_target_user"></label>
                <select id="targetUserSelect" class="form-select" onchange="window.app.currentPage.onTargetUserChange(this.value)"></select>
              </div>` : ''}
              <div class="col-md-6 mb-3">
                <label for="evaluationPeriodSelect" class="form-label" data-i18n="evaluation.select_period"></label>
                <select id="evaluationPeriodSelect" class="form-select" onchange="window.app.currentPage.onPeriodChange(this.value)"></select>
              </div>
            </div>` : ''}
            <div class="target-info mt-2">
              <div class="row">
                <div class="col-md-6"><strong><span data-i18n="evaluation.target_user"></span>:</strong> <span id="displayTargetUserName">N/A</span></div>
                <div class="col-md-6"><strong><span data-i18n="evaluation.job_type"></span>:</strong> <span id="displayTargetJobType">N/A</span></div>
                <div class="col-md-6"><strong><span data-i18n="evaluation.period_info"></span>:</strong> <span id="displayEvaluationPeriod">N/A</span></div>
                <div class="col-md-6"><strong><span data-i18n="evaluation.evaluator_name"></span>:</strong> <span>${this.app.sanitizeHtml(this.app.currentUser?.name || '')}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="evaluation-steps">
          <div class="step-content active" id="quantitativeStep"></div>
          <div class="step-content" id="qualitativeStep" style="display: none;"></div>
          <div class="step-content" id="goalsStep" style="display: none;"></div>
        </div>

        ${!this.isViewMode ? `
        <div class="step-navigation mt-3 d-flex justify-content-between">
          <button class="btn btn-secondary" onclick="window.app.currentPage.previousStep()" id="prevBtn" style="display: none;"><i class="fas fa-arrow-left me-2"></i><span data-i18n="common.previous"></span></button>
          <button class="btn btn-primary" onclick="window.app.currentPage.nextStep()" id="nextBtn"><span data-i18n="common.next"></span><i class="fas fa-arrow-right ms-2"></i></button>
        </div>` : ''}
      </div>
    `;
  }

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
  
  async loadInitialDataForNewForm() {
    try {
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      this.usersForEvaluation = await this.app.api.getUsers();
      if (this.app.hasRole("worker")) {
        this.targetUser = this.app.currentUser;
      }
    } catch (e) {
      this.app.showError("初期データの読み込みに失敗しました。");
    }
  }

  async loadEvaluationDetails() {
    // ...
  }

  async loadStructureAndGoals() {
    if (!this.targetUser || !this.selectedPeriod) {
      this.clearForms();
      return;
    }
    try {
      const allJobTypes = await this.app.api.getJobTypes();
      const jobType = allJobTypes.find(jt => jt.name === this.targetUser.jobType);
      if (jobType) {
        this.evaluationStructure = await this.app.api.getEvaluationStructure(jobType.id);
      }
      this.qualitativeGoals = await this.app.api.getQualitativeGoals(this.targetUser.id, this.selectedPeriod.id, 'approved');
      this.updateUI(); // データをロードした後にUIを更新
    } catch(e) {
      this.app.showError("評価項目の読み込みに失敗しました。");
      this.clearForms();
    }
  }

  updateUI() {
    this.updateTargetDisplay();
    this.renderAllForms();
    if (!this.isViewMode) {
      this.updateProgressIndicator();
      this.updateNavigationButtons();
    }
    this.app.i18n.updateUI();
  }

  updateTargetDisplay() {
    if (!this.isViewMode) {
      const userSelect = document.getElementById('targetUserSelect');
      if (userSelect) {
        userSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
          this.usersForEvaluation
            .filter(u => u.id !== this.app.currentUser.id)
            .map(u => `<option value="${u.id}" ${this.targetUser?.id === u.id ? 'selected' : ''}>${this.app.sanitizeHtml(u.name)}</option>`).join('');
      }
      const periodSelect = document.getElementById('evaluationPeriodSelect');
      if (periodSelect) {
        periodSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
          this.evaluationPeriods.map(p => `<option value="${p.id}" ${this.selectedPeriod?.id === p.id ? 'selected' : ''}>${this.app.sanitizeHtml(p.name)}</option>`).join('');
      }
    }

    document.getElementById('displayTargetUserName').textContent = this.targetUser?.name || 'N/A';
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
    // ...
  }

  renderItem(item, type) {
    // ...
  }

  // --- 追加・修正した関数群 ---
  onTargetUserChange(userId) {
    this.targetUser = this.usersForEvaluation.find(u => u.id === userId);
    this.loadStructureAndGoals();
  }
  
  onPeriodChange(periodId) {
    this.selectedPeriod = this.evaluationPeriods.find(p => p.id === periodId);
    this.loadStructureAndGoals();
  }

  switchStep(step) {
    this.currentStep = step;
    document.querySelectorAll('.step-content').forEach(el => el.style.display = 'none');
    document.getElementById(`${step}Step`).style.display = 'block';
    this.updateProgressIndicator();
    this.updateNavigationButtons();
  }

  nextStep() {
    const steps = ['quantitative', 'qualitative', 'goals'];
    const currentIndex = steps.indexOf(this.currentStep);
    if (currentIndex < steps.length - 1) {
      this.switchStep(steps[currentIndex + 1]);
    }
  }

  previousStep() {
    const steps = ['quantitative', 'qualitative', 'goals'];
    const currentIndex = steps.indexOf(this.currentStep);
    if (currentIndex > 0) {
      this.switchStep(steps[currentIndex - 1]);
    }
  }

  updateProgressIndicator() {
    document.querySelectorAll('.progress-step').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.step === this.currentStep) {
        el.classList.add('active');
      }
    });
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!prevBtn || !nextBtn) return;
    
    if (this.currentStep === 'quantitative') {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'inline-block';
    } else if (this.currentStep === 'goals') {
      prevBtn.style.display = 'inline-block';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'inline-block';
      nextBtn.style.display = 'inline-block';
    }
  }

  saveDraft() {
    // localStorageに下書きを保存するロジック
    const draftData = {
      targetUserId: this.targetUser?.id,
      periodId: this.selectedPeriod?.id,
      evaluationData: this.evaluationData,
    };
    localStorage.setItem(`evaluation-draft-${this.app.currentUser.id}`, JSON.stringify(draftData));
    this.app.showSuccess('下書きを保存しました。');
  }

  submitEvaluation() {
    // 提出処理のロジック
    if (confirm(this.app.i18n.t('evaluation.confirm_submit'))) {
      console.log('Submitting evaluation:', this.evaluationData);
      // ここでAPIを呼び出す
      this.app.showSuccess('評価を提出しました。');
      this.app.navigate('/evaluations');
    }
  }
}

window.EvaluationFormPage = EvaluationFormPage;
