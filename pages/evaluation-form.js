/**
 * Evaluation Form Page Component (Revised for 2-column layout and Firebase Integration)
 * 評価フォームページコンポーネント（2カラムレイアウト改修・Firebase連携版）
 */
export class EvaluationFormPage {
  constructor(app) {
    this.app = app;
    this.evaluationData = {}; // { itemId: { selfScore, selfComment, evalScore, evalComment } }
    this.targetUser = null;
    this.selectedPeriod = null;
    this.evaluationStructure = null;
    this.qualitativeGoals = [];
    this.usersForEvaluation = [];
    this.periods = [];
    this.existingEvaluation = null; // To hold existing evaluation data if found
  }

  async render() {
    return `
      <div class="evaluation-form-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 data-i18n="evaluations.form_title"></h1>
            <button id="submit-eval-btn" class="btn btn-primary btn-lg" disabled>
                <i class="fas fa-paper-plane me-2"></i><span data-i18n="common.submit"></span>
            </button>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h5 class="mb-0" data-i18n="evaluations.target_info"></h5></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="targetUserSelect" class="form-label" data-i18n="evaluations.select_target_user"></label>
                        <select id="targetUserSelect" class="form-select"></select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="periodSelect" class="form-label" data-i18n="evaluations.select_period"></label>
                        <select id="periodSelect" class="form-select"></select>
                    </div>
                </div>
            </div>
        </div>

        <div id="form-columns" class="row g-4">
            <div class="col-12 text-center p-5">
                <p class="text-muted" data-i18n="evaluations.select_target_user"></p>
            </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    await this.loadInitialData();
    document.getElementById('targetUserSelect').addEventListener('change', () => this.onSelectionChange());
    document.getElementById('periodSelect').addEventListener('change', () => this.onSelectionChange());
    document.getElementById('submit-eval-btn').addEventListener('click', () => this.submitEvaluation());
  }

  async loadInitialData() {
    try {
        const settings = await this.app.api.getSettings();
        this.periods = settings.periods;

        const userSelect = document.getElementById('targetUserSelect');
        const currentUser = this.app.currentUser;

        if (this.app.hasRole('worker')) {
            this.usersForEvaluation = [currentUser];
            userSelect.innerHTML = `<option value="${currentUser.uid}" selected>${this.app.sanitizeHtml(currentUser.name)}</option>`;
            userSelect.disabled = true;
        } else { // admin or evaluator
            this.usersForEvaluation = await this.app.api.getSubordinates();
            // Also add self for self-evaluation
            if (!this.usersForEvaluation.find(u => u.id === currentUser.uid)) {
                this.usersForEvaluation.unshift(currentUser);
            }
            userSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` 
                + this.usersForEvaluation.map(u => `<option value="${u.id}">${this.app.sanitizeHtml(u.name)}</option>`).join('');
        }
        
        const periodSelect = document.getElementById('periodSelect');
        periodSelect.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` 
            + this.periods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
        
        this.app.i18n.updateUI();
    } catch(e) {
        this.app.showError("初期データの読み込みに失敗しました。");
        console.error(e);
    }
  }

  async onSelectionChange() {
    const userId = document.getElementById('targetUserSelect').value;
    const periodId = document.getElementById('periodSelect').value;
    const formContainer = document.getElementById('form-columns');
    const submitBtn = document.getElementById('submit-eval-btn');

    if (!userId || !periodId) {
        formContainer.innerHTML = `<div class="col-12 text-center p-5"><p class="text-muted" data-i18n="evaluations.select_target_user"></p></div>`;
        this.app.i18n.updateUI(formContainer);
        submitBtn.disabled = true;
        return;
    }

    this.targetUser = this.usersForEvaluation.find(u => u.id === userId);
    this.selectedPeriod = this.periods.find(p => p.id === periodId);
    
    try {
        // Fetch all necessary data in parallel
        const [structure, goals, existingEval] = await Promise.all([
            this.app.api.getEvaluationStructure(this.targetUser.jobTypeId),
            this.app.api.getGoals(this.targetUser.id, this.selectedPeriod.id, 'approved'),
            this.app.api.getEvaluation(this.targetUser.id, this.selectedPeriod.id)
        ]);

        this.evaluationStructure = structure;
        this.qualitativeGoals = goals ? goals.goals : [];
        this.existingEvaluation = existingEval;
        this.evaluationData = existingEval ? existingEval.ratings : {};
        
        this.renderForm();
        submitBtn.disabled = false;
    } catch(e) {
        this.app.showError("評価フォームの生成に失敗しました。");
        console.error(e);
    }
  }

  renderForm() {
    const container = document.getElementById('form-columns');
    const currentUser = this.app.currentUser;
    const isSelfEvaluation = currentUser.uid === this.targetUser.id;
    
    // Determine who can edit which column
    const canEditSelf = isSelfEvaluation;
    const canEditEval = !isSelfEvaluation && this.app.hasAnyRole(['admin', 'evaluator']);

    container.innerHTML = `
        <div class="col-lg-6">
            <div class="card h-100">
                <div class="card-header"><h5 data-i18n="evaluation.self_assessment"></h5></div>
                <div class="card-body">${this.renderItems('self', canEditSelf)}</div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card h-100">
                <div class="card-header"><h5 data-i18n="evaluation.evaluator_assessment"></h5></div>
                <div class="card-body">${this.renderItems('eval', canEditEval)}</div>
            </div>
        </div>`;
    this.app.i18n.updateUI(container);
  }

  renderItems(type, canEdit) {
    let html = '';
    if (!this.evaluationStructure) return `<p class="text-muted" data-i18n="settings.no_structure_for_job_type"></p>`;

    // Render items from structure
    this.evaluationStructure.categories.forEach(cat => {
        html += `<h6>${this.app.sanitizeHtml(cat.name)}</h6>`;
        cat.items.forEach(item => {
            html += this.renderSingleItem(item, type, canEdit, false);
        });
    });

    // Render items from goals
    html += `<h6 class="mt-4" data-i18n="evaluation.goal_achievement"></h6>`;
    if (this.qualitativeGoals.length > 0) {
        this.qualitativeGoals.forEach(goal => {
            html += this.renderSingleItem(goal, type, canEdit, true);
        });
    } else {
        html += `<p class="text-muted" data-i18n="evaluation.no_goals_set"></p>`;
    }
    
    return html;
  }

  renderSingleItem(item, type, canEdit, isGoal) {
      const itemId = isGoal ? `goal_${item.text.replace(/\s/g, '_')}` : item.id;
      const ratingData = this.evaluationData[itemId] || {};
      const score = ratingData[`${type}Score`] || '';
      const comment = ratingData[`${type}Comment`] || '';

      return `
          <div class="mb-3">
              <label class="form-label fw-bold">${this.app.sanitizeHtml(isGoal ? item.text : item.name)} ${isGoal ? `<span class="fw-normal text-muted">(${item.weight}%)</span>` : ''}</label>
              <input type="number" class="form-control mb-1" placeholder="${this.app.i18n.t('evaluation.score')}" min="1" max="5" ${canEdit ? '' : 'readonly'} value="${score}" oninput="window.app.currentPage.updateData('${itemId}', '${isGoal ? item.name : ''}', '${type}Score', this.value)">
              <textarea class="form-control" rows="2" placeholder="${this.app.i18n.t('evaluation.comment')}" ${canEdit ? '' : 'readonly'} oninput="window.app.currentPage.updateData('${itemId}', '${isGoal ? item.name : ''}', '${type}Comment', this.value)">${this.app.sanitizeHtml(comment)}</textarea>
          </div>
      `;
  }

  updateData(itemId, itemName, field, value) {
    if (!this.evaluationData[itemId]) this.evaluationData[itemId] = { itemName: itemName };
    this.evaluationData[itemId][field] = value;
  }

  async submitEvaluation() {
    if (!confirm(this.app.i18n.t('evaluations.confirm_submit'))) return;
    
    const currentUser = this.app.currentUser;
    const isSelfEvaluation = currentUser.uid === this.targetUser.id;
    let status = this.existingEvaluation?.status || 'pending_submission';

    if (isSelfEvaluation) {
        status = 'self_assessed';
    } else if (this.app.hasAnyRole(['admin', 'evaluator'])) {
        // Assuming self-assessment is done, evaluator completes it.
        status = 'completed'; // Or 'approved_by_evaluator' if there's another step
    }

    const data = {
        id: this.existingEvaluation?.id,
        tenantId: currentUser.tenantId,
        targetUserId: this.targetUser.id,
        targetUserName: this.targetUser.name,
        periodId: this.selectedPeriod.id,
        periodName: this.selectedPeriod.name,
        evaluatorId: this.targetUser.evaluatorId || null,
        evaluatorName: isSelfEvaluation ? this.targetUser.evaluatorName : currentUser.name,
        ratings: this.evaluationData,
        status: status,
        submittedAt: serverTimestamp()
    };

    const btn = document.getElementById('submit-eval-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${this.app.i18n.t('common.loading')}`;

    try {
        await this.app.api.saveEvaluation(data);
        this.app.showSuccess(this.app.i18n.t('messages.save_success'));
        this.app.navigate('#/evaluations');
    } catch (e) {
        this.app.showError(e.message);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane me-2"></i><span data-i18n="common.submit"></span>`;
        this.app.i18n.updateUI(btn);
    }
  }
}
