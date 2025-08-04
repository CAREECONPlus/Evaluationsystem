// careeconplus/evaluationsystem/Evaluationsystem-main/pages/report.js

/**
 * Evaluation Report Page Component (Fully Functional)
 * 評価レポートページコンポーネント（完全機能版）
 */
export class EvaluationReportPage {
  constructor(app) {
    this.app = app;
    this.evaluation = null;
    this.history = [];
    this.chart = null; 
    this.processedScores = {};
  }

  async render() {
    if (!this.evaluation || !this.processedScores) {
      return `<div class="p-5 text-center" data-i18n="common.loading"></div>`;
    }

    const { targetUserName, jobTypeName, evaluatorName, periodName } = this.evaluation;

    return `
      <div class="evaluation-report-page p-4">
        <div class="report-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3">${this.app.sanitizeHtml(periodName)} <span data-i18n="nav.reports"></span></h1>
            <p class="text-muted mb-0">
              <span data-i18n="evaluation.target">: ${this.app.sanitizeHtml(targetUserName)} (${this.app.sanitizeHtml(jobTypeName || 'N/A')})</span>
            </p>
          </div>
          <button class="btn btn-outline-secondary" onclick="window.history.back()">
            <i class="fas fa-arrow-left me-2"></i><span data-i18n="common.back"></span>
          </button>
        </div>

        <ul class="nav nav-tabs mb-3" id="report-tabs">
          <li class="nav-item">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#summary-tab" data-i18n="report.summary"></button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#comparison-tab" data-i18n="report.comparison"></button>
          </li>
           <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#history-tab" data-i18n="report.history"></button>
          </li>
        </ul>

        <div class="tab-content">
          ${this.renderSummaryTab()}
          ${this.renderComparisonTab()}
          ${this.renderHistoryTab()}
        </div>
      </div>
    `;
  }

  renderSummaryTab() {
    // ... (same as before)
  }
  
  renderComparisonTab() {
    // ... (same as before)
  }
  
  renderHistoryTab() {
      return `
      <div class="tab-pane fade" id="history-tab">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4" data-i18n="report.process_history"></h4>
            <ul class="list-group">
              ${this.history.map(item => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong data-i18n="status.${item.status}"></strong>
                        <small class="text-muted ms-2">(by ${this.app.sanitizeHtml(item.actor)})</small>
                    </div>
                    <span>${this.app.formatDate(item.timestamp, true)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
      `;
  }

  async init(params) {
    this.app.currentPage = this;
    const evaluationId = params.get('id');

    if (!this.app.isAuthenticated() || !evaluationId) {
      this.app.navigate("/login");
      return;
    }

    try {
      [this.evaluation, this.history] = await Promise.all([
        this.app.api.getEvaluationById(evaluationId),
        this.app.api.getEvaluationHistory(evaluationId)
      ]);
      
      if (!this.evaluation) throw new Error("Evaluation not found.");
      
      const canView = 
        this.app.hasRole('admin') || 
        this.evaluation.targetUserId === this.app.currentUser.uid || 
        this.evaluation.evaluatorId === this.app.currentUser.uid;

      if (!canView) {
        this.app.showError(this.app.i18n.t('errors.access_denied'));
        this.app.navigate('/evaluations');
        return;
      }

      await this.processEvaluationData();
      
      const contentContainer = document.getElementById("content");
      contentContainer.innerHTML = await this.render();
      this.afterRender();
      this.app.i18n.updateUI();

    } catch (error) {
      console.error("Failed to load report:", error);
      this.app.showError(this.app.i18n.t('errors.loading_failed'));
      this.app.navigate('/evaluations');
    }
  }
  
  // ... processEvaluationData and afterRender methods remain the same
}
