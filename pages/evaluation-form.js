/**
 * Evaluation Form Page Component
 * 評価フォームページコンポーネント
 */
class EvaluationFormPage {
  constructor(app) {
    this.app = app;
    this.evaluationStructure = null; // 評価項目（定量的・定性的）
    this.qualitativeGoals = [];      // 評価対象の目標
    this.evaluationData = { quantitative: {}, qualitative: {}, goals: {} }; // 入力データ
    this.currentStep = "quantitative"; // 現在の評価ステップ
    
    this.isViewMode = false;      // 表示専用モードか
    this.evaluationId = null;     // 表示モードで読み込む評価ID
    this.isSubmitted = false;     // 提出済みか

    this.targetUser = null;       // 評価対象者
    this.selectedPeriod = null;   // 選択された評価期間
    this.evaluationPeriods = [];  // 全ての評価期間
    this.usersForEvaluation = []; // 評価可能なユーザーリスト
  }

  /**
   * ページ全体のHTMLをレンダリング
   */
  async render() {
    const currentUser = this.app.currentUser;
    const canSelectUser = (this.app.hasAnyRole(['admin', 'evaluator']));

    return `
      <div class="evaluation-form-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="evaluation.title"></h1>
          <div class="evaluation-actions">
            <button class="btn btn-secondary" onclick="window.app.currentPage.saveDraft()" id="saveDraftBtn"><i class="fas fa-save me-2"></i><span data-i18n="common.save_draft"></span></button>
            <button class="btn btn-success" onclick="window.app.currentPage.submitEvaluation()" id="submitBtn" disabled><i class="fas fa-paper-plane me-2"></i><span data-i18n="evaluation.submit"></span></button>
          </div>
        </div>

        <div class="progress-indicator mb-4">
            <div class="progress-step active" data-step="quantitative"><div class="step-number">1</div><div class="step-label" data-i18n="evaluation.quantitative"></div></div>
            <div class="progress-step" data-step="qualitative"><div class="step-number">2</div><div class="step-label" data-i18n="evaluation.qualitative"></div></div>
            <div class="progress-step" data-step="goals"><div class="step-number">3</div><div class="step-label" data-i18n="evaluation.goal_achievement"></div></div>
        </div>

        <div class="card mb-4">
          <div class="card-header"><h5 class="mb-0" data-i18n="evaluation.target_info"></h5></div>
          <div class="card-body">
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
            </div>
            <div class="target-info mt-2 border-top pt-3">
              <div class="row">
                <div class="col-md-6"><strong><span data-i18n="evaluation.target_user"></span>:</strong> <span id="displayTargetUserName">N/A</span></div>
                <div class="col-md-6"><strong><span data-i18n="evaluation.job_type"></span>:</strong> <span id="displayTargetJobType">N/A</span></div>
                <div class="col-md-6"><strong><span data-i18n="evaluation.period_info"></span>:</strong> <span id="displayEvaluationPeriod">N/A</span></div>
                <div class="col-md-6"><strong><span data-i18n="evaluation.evaluator_name"></span>:</strong> <span>${this.app.sanitizeHtml(currentUser?.name || '')}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="evaluation-steps card">
          <div class="step-content active" id="quantitativeStep"></div>
          <div class="step-content" id="qualitativeStep" style="display: none;"></div>
          <div class="step-content" id="goalsStep" style="display: none;"></div>
        </div>
        
        <div class="step-navigation mt-4 d-flex justify-content-between">
          <button class="btn btn-secondary" onclick="window.app.currentPage.previousStep()" id="prevBtn" style="display: none;"><i class="fas fa-arrow-left me-2"></i><span data-i18n="common.previous"></span></button>
          <button class="btn btn-primary" onclick="window.app.currentPage.nextStep()" id="nextBtn"><span data-i18n="common.next"></span><i class="fas fa-arrow-right ms-2"></i></button>
        </div>
      </div>
    `;
  }

  async init(params) {
    this.app.currentPage = this;
    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }
    await this.loadInitialData();
    this.updateUI();
  }
  
  async loadInitialData() {
    try {
      const currentUser = this.app.currentUser;
      const allUsers = await this.app.api.getUsers();
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      
      if (this.app.hasAnyRole(['admin', 'evaluator'])) {
        this.usersForEvaluation = allUsers.filter(u => u.evaluatorId === currentUser.id);
      }
      if (this.app.hasRole('worker')) {
        this.targetUser = currentUser;
      }
      if (this.app.hasRole('evaluator')) {
         this.usersForEvaluation.unshift(currentUser);
      }
    } catch (e) {
      this.app.showError("初期データの読み込みに失敗しました。");
      console.error(e);
    }
  }

  async loadStructureAndGoals() {
    this.clearForms();
    if (!this.targetUser || !this.selectedPeriod) return;

    try {
      this.evaluationStructure = await this.app.api.getEvaluationStructure(this.targetUser.jobType);
      this.qualitativeGoals = await this.app.api.getQualitativeGoals(this.targetUser.id, this.selectedPeriod.id, 'approved');
      this.renderAllForms();
      this.updateUI();
    } catch(e) {
      this.app.showError("評価項目の読み込みに失敗しました。");
      console.error(e);
    }
  }

  updateUI() {
    this.populateDropdowns();
    this.updateTargetDisplay();
    this.updateProgressIndicator();
    this.updateNavigationButtons();
    this.app.i18n.updateUI();
  }
  
  populateDropdowns() {
    const userSelect = document.getElementById('targetUserSelect');
    if (userSelect) {
      const selfStr = this.app.i18n.t("evaluation.self_assessment");
      userSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
        this.usersForEvaluation
          .map(u => `<option value="${u.id}">${this.app.sanitizeHtml(u.name)} ${u.id === this.app.currentUser.id ? `(${selfStr})` : ''}</option>`).join('');
    }
    
    const periodSelect = document.getElementById('evaluationPeriodSelect');
    if (periodSelect) {
      periodSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
        this.evaluationPeriods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
    }
  }

  updateTargetDisplay() {
    document.getElementById('displayTargetUserName').textContent = this.targetUser?.name || 'N/A';
    document.getElementById('displayTargetJobType').textContent = this.targetUser?.jobType || 'N/A';
    document.getElementById('displayEvaluationPeriod').textContent = this.selectedPeriod?.name || 'N/A';
  }
  
  renderAllForms() {
    this.renderFormContent('quantitative');
    this.renderFormContent('qualitative');
    this.renderFormContent('goals');
  }

  clearForms() {
    document.getElementById('quantitativeStep').innerHTML = '';
    document.getElementById('qualitativeStep').innerHTML = '';
    document.getElementById('goalsStep').innerHTML = '';
  }

  renderFormContent(type) {
    const container = document.getElementById(`${type}Step`);
    if (!container) return;
    
    let items = [];
    let titleKey = '';

    if (type === 'quantitative' || type === 'qualitative') {
        items = this.evaluationStructure?.categories
            .flatMap(cat => cat.items.filter(item => item.type === type).map(item => ({...item, categoryName: cat.name}))) || [];
        titleKey = `evaluation.${type}`;
    } else if (type === 'goals') {
        items = this.qualitativeGoals[0]?.goals || [];
        titleKey = 'evaluation.goal_achievement';
    }

    if (items.length === 0) {
      container.innerHTML = `<div class="card-body text-center text-muted p-5" data-i18n="evaluation.no_${type}_items"></div>`;
      return;
    }
    
    container.innerHTML = `
      <div class="card-body">
        <h4 class="card-title mb-4" data-i18n="${titleKey}"></h4>
        ${items.map(item => this.renderItem(item, type)).join('')}
      </div>
    `;
  }

  /**
   * 個別の評価項目を描画
   */
  renderItem(item, type) {
    // ▼▼▼ 修正箇所: item.text と item.name の両方に対応 ▼▼▼
    const itemNameOrText = item.text || item.name || '';
    const itemId = item.id || itemNameOrText.slice(0, 10);
    // ▲▲▲ 修正箇所 ▲▲▲
    const isGoal = type === 'goals';
    
    return `
      <div class="evaluation-item mb-4">
        <label class="form-label fw-bold">${isGoal ? `${this.app.sanitizeHtml(item.text)} (<span data-i18n="evaluation.weight_display" data-i18n-params='{"weight": ${item.weight}}'></span>)` : `${this.app.sanitizeHtml(item.categoryName)} - ${this.app.sanitizeHtml(item.name)}`}</label>
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <input type="number" class="form-control" min="1" max="5" placeholder="${this.app.i18n.t('evaluation.score_hint')}" onchange="window.app.currentPage.updateEvaluationData('${type}', '${itemId}', 'score', this.value)">
          </div>
          <div class="col-md-8">
             <input type="text" class="form-control" placeholder="${this.app.i18n.t('evaluation.comment_placeholder')}" onchange="window.app.currentPage.updateEvaluationData('${type}', '${itemId}', 'comment', this.value)">
          </div>
        </div>
      </div>
    `;
  }
  
  onTargetUserChange(userId) {
    const allUsers = this.usersForEvaluation.concat(this.app.hasRole('worker') ? [this.app.currentUser] : []);
    this.targetUser = allUsers.find(u => u.id === userId);
    this.loadStructureAndGoals();
  }
  
  onPeriodChange(periodId) {
    this.selectedPeriod = this.evaluationPeriods.find(p => p.id === periodId);
    if(this.targetUser) {
        this.loadStructureAndGoals();
    }
  }

  updateEvaluationData(type, itemId, field, value) {
      if (!this.evaluationData[type][itemId]) {
          this.evaluationData[type][itemId] = {};
      }
      this.evaluationData[type][itemId][field] = value;
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
    
    prevBtn.style.display = this.currentStep === 'quantitative' ? 'none' : 'inline-block';
    nextBtn.style.display = this.currentStep === 'goals' ? 'none' : 'inline-block';
    
    if (!this.targetUser || !this.selectedPeriod) {
        nextBtn.style.display = 'none';
    }
  }

  saveDraft() {
    const draftData = {
      targetUserId: this.targetUser?.id,
      periodId: this.selectedPeriod?.id,
      evaluationData: this.evaluationData,
    };
    localStorage.setItem(`evaluation-draft-${this.app.currentUser.id}`, JSON.stringify(draftData));
    this.app.showSuccess('下書きを保存しました。');
  }

  submitEvaluation() {
    if (confirm(this.app.i18n.t('evaluation.confirm_submit'))) {
      console.log('Submitting evaluation:', this.evaluationData);
      this.app.showSuccess('評価を提出しました。');
      this.app.navigate('/evaluations');
    }
  }
}

window.EvaluationFormPage = EvaluationFormPage;
