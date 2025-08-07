/**
 * Evaluation Form Page Component (Revised for 2-column layout and Firebase Integration)
 * 評価フォームページコンポーネント（2カラムレイアウト改修・Firebase連携版）
 */
export class EvaluationFormPage {
  constructor(app) {
    this.app = app;
    this.evaluationData = {};
    this.targetUser = null;
    this.selectedPeriod = null;
    this.evaluationStructure = null;
    this.qualitativeGoals = [];
    this.usersForEvaluation = [];
    this.periods = [];
    this.existingEvaluation = null;
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
                        <label for="target-user-select" class="form-label" data-i18n="evaluations.target_user"></label>
                        <select id="target-user-select" class="form-select"></select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="period-select" class="form-label" data-i18n="evaluations.evaluation_period"></label>
                        <select id="period-select" class="form-select"></select>
                    </div>
                </div>
            </div>
        </div>
        <div id="evaluation-content" class="d-none">
            <!-- Evaluation form will be rendered here -->
        </div>
      </div>
    `;
  }

  // ... 他のメソッドは変更なし
  
  async submitEvaluation() {
    if (!confirm(this.app.i18n.t('evaluations.confirm_submit'))) return;

    const currentUser = this.app.currentUser;
    const isSelfEvaluation = this.targetUser.id === currentUser.uid;
    let status = this.existingEvaluation?.status || 'pending_submission';

    if (isSelfEvaluation) {
        status = 'self_assessed';
    } else if (this.app.hasAnyRole(['admin', 'evaluator'])) {
        status = 'pending_approval'; // Now goes to admin for final approval
    }

    const data = {
        id: this.existingEvaluation?.id,
        tenantId: currentUser.tenantId,
        targetUserId: this.targetUser.id,
        targetUserName: this.targetUser.name,
        jobTypeId: this.targetUser.jobTypeId,
        periodId: this.selectedPeriod.id,
        periodName: this.selectedPeriod.name,
        evaluatorId: this.targetUser.evaluatorId || null,
        evaluatorName: isSelfEvaluation ? this.usersForEvaluation.find(u => u.id === this.targetUser.evaluatorId)?.name : currentUser.name,
        ratings: this.evaluationData,
        status: status,
        // ★ 修正点: this.app.api経由で呼び出す
        submittedAt: this.app.api.serverTimestamp()
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
  
  // ... 他のメソッドは変更なし
}
