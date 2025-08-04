// careeconplus/evaluationsystem/Evaluationsystem-main/pages/report.js

/**
 * Evaluation Report Page Component (Fully Functional)
 * 評価レポートページコンポーネント（完全機能版）
 */
export class EvaluationReportPage {
  constructor(app) {
    this.app = app;
    this.evaluation = null;
    this.chart = null; 
    this.processedScores = {}; // To store calculated scores
  }

  /**
   * ページ全体のHTMLをレンダリング
   */
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
              <span data-i18n="evaluation.target">: ${this.app.sanitizeHtml(targetUserName)} (${this.app.sanitizeHtml(jobTypeName)})</span>
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
        </ul>

        <div class="tab-content">
          ${this.renderSummaryTab()}
          ${this.renderComparisonTab()}
        </div>
      </div>
    `;
  }

  /**
   * サマリータブのコンテンツをレンダリング
   */
  renderSummaryTab() {
    const { selfAverage, evaluatorAverage, categories } = this.processedScores;

    return `
      <div class="tab-pane fade show active" id="summary-tab">
        <div class="card mb-4">
          <div class="card-body">
            <h4 class="card-title mb-4" data-i18n="report.overall_evaluation"></h4>
            <div class="row text-center mb-5">
              <div class="col-6 border-end">
                <h5 data-i18n="evaluation.self_assessment"></h5>
                <p class="display-4">${selfAverage.toFixed(1)}</p>
              </div>
              <div class="col-6">
                <h5 data-i18n="evaluation.evaluator_assessment"></h5>
                <p class="display-4">${evaluatorAverage.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
            <div class="card-body">
            <h4 class="card-title mb-3" data-i18n="report.detailed_scores"></h4>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th data-i18n="evaluation.category"></th>
                    <th data-i18n="evaluation.item"></th>
                    <th data-i18n="evaluation.self_assessment_score"></th>
                    <th data-i18n="evaluation.evaluator_assessment_score"></th>
                    <th data-i18n="report.self_comment"></th>
                    <th data-i18n="report.evaluator_comment"></th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.values(categories).map(cat => `
                    ${cat.items.map((item, index) => `
                      <tr>
                        ${index === 0 ? `<td rowspan="${cat.items.length}" class="align-middle fw-bold">${this.app.sanitizeHtml(cat.name)}</td>` : ''}
                        <td>${this.app.sanitizeHtml(item.name)}</td>
                        <td class="text-center">${item.selfScore || '-'}</td>
                        <td class="text-center">${item.evalScore || '-'}</td>
                        <td>${this.app.sanitizeHtml(item.selfComment || '')}</td>
                        <td>${this.app.sanitizeHtml(item.evalComment || '')}</td>
                      </tr>
                    `).join('')}
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * 比較タブのコンテンツをレンダリング
   */
  renderComparisonTab() {
    return `
      <div class="tab-pane fade" id="comparison-tab">
        <div class="card">
          <div class="card-body">
             <h4 class="card-title mb-4" data-i18n="report.score_comparison"></h4>
             <div class="chart-container" style="height: 400px;">
                <canvas id="comparisonChart"></canvas>
             </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * ページの初期化処理
   */
  async init(params) {
    this.app.currentPage = this;
    const evaluationId = params.get('id');

    if (!this.app.isAuthenticated() || !evaluationId) {
      this.app.navigate("/login");
      return;
    }

    try {
      this.evaluation = await this.app.api.getEvaluationById(evaluationId);
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

  /**
   * 評価データをチャートやテーブルで使いやすいように処理する
   */
  async processEvaluationData() {
      if (!this.evaluation?.ratings) {
          this.processedScores = { selfAverage: 0, evaluatorAverage: 0, categories: {} };
          return;
      }
      
      const structure = await this.app.api.getEvaluationStructure(this.evaluation.jobTypeId);
      if (!structure) {
           this.processedScores = { selfAverage: 0, evaluatorAverage: 0, categories: {} };
           return;
      }

      let selfTotal = 0, evalTotal = 0, selfCount = 0, evalCount = 0;
      const categories = {};

      structure.categories.forEach(cat => {
          categories[cat.id] = { name: cat.name, items: [] };
          cat.items.forEach(item => {
              const rating = this.evaluation.ratings[item.id] || {};
              const selfScore = Number(rating.selfScore) || null;
              const evalScore = Number(rating.evalScore) || null;

              if(selfScore) { selfTotal += selfScore; selfCount++; }
              if(evalScore) { evalTotal += evalScore; evalCount++; }

              categories[cat.id].items.push({
                  name: item.name,
                  selfScore: selfScore,
                  evalScore: evalScore,
                  selfComment: rating.selfComment,
                  evalComment: rating.evalComment
              });
          });
      });

      this.processedScores = {
          selfAverage: selfCount > 0 ? selfTotal / selfCount : 0,
          evaluatorAverage: evalCount > 0 ? evalTotal / evalCount : 0,
          categories: categories
      };
  }
  
  /**
   * ページ描画後の処理 (チャートの初期化など)
   */
  afterRender() {
    const canvas = document.getElementById("comparisonChart");
    if (!canvas) return;

    const labels = Object.values(this.processedScores.categories).map(c => c.name);
    const selfScores = Object.values(this.processedScores.categories).map(c => {
        const catScores = c.items.map(i => i.selfScore).filter(s => s !== null);
        return catScores.length > 0 ? catScores.reduce((a, b) => a + b, 0) / catScores.length : 0;
    });
    const evalScores = Object.values(this.processedScores.categories).map(c => {
        const catScores = c.items.map(i => i.evalScore).filter(s => s !== null);
        return catScores.length > 0 ? catScores.reduce((a, b) => a + b, 0) / catScores.length : 0;
    });

    this.chart = new Chart(canvas.getContext('2d'), {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: this.app.i18n.t('evaluation.self_assessment'),
          data: selfScores,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2
        }, {
          label: this.app.i18n.t('evaluation.evaluator_assessment'),
          data: evalScores,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, max: 5, stepSize: 1 } }
      }
    });
  }
}
