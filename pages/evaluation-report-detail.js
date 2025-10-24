/**
 * Evaluation Report Page Component (完全実装版)
 * 評価レポートページコンポーネント
 */
import { DynamicContentTranslator } from '../services/dynamic-content-translator.js';

export class EvaluationReportDetailPage {
  constructor(app) {
    this.app = app;
    this.evaluation = null;
    this.history = [];
    this.chart = null;
    this.processedScores = {};
    this.contentTranslator = new DynamicContentTranslator(app);
    this.multilingualData = {
      categories: [],
      evaluationItems: [],
      jobTypes: []
    };
    this.currentLanguage = app.i18n.getCurrentLanguage();
  }

  async render() {
    if (!this.evaluation || !this.processedScores) {
      return `<div class="p-5 text-center" data-i18n="common.loading"></div>`;
    }

    const { targetUserName, periodName } = this.evaluation;

    return `
      <div class="evaluation-report-page p-4">
        <div class="report-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3">${this.app.sanitizeHtml(periodName)} <span data-i18n="nav.reports"></span></h1>
            <p class="text-muted mb-0">
              <span data-i18n="evaluation.target"></span>: ${this.app.sanitizeHtml(targetUserName)}
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
    const overallScore = this.processedScores.overall || 0;
    const quantScores = this.processedScores.quantitative || {};
    const qualScores = this.processedScores.qualitative || {};

    return `
      <div class="tab-pane fade show active" id="summary-tab">
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card text-center">
              <div class="card-body">
                <h4 class="card-title" data-i18n="report.overall_evaluation"></h4>
                <div class="display-1 text-primary">${overallScore.toFixed(1)}</div>
                <div class="text-muted">/ 5.0</div>
              </div>
            </div>
          </div>
          <div class="col-md-8 mb-4">
            <div class="card">
              <div class="card-body">
                <h4 class="card-title mb-4" data-i18n="report.detailed_scores"></h4>
                <canvas id="summaryChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4">評価詳細</h4>
            ${Object.entries(quantScores).map(([category, scores]) => `
              <div class="mb-4">
                <h5 class="border-bottom pb-2 mb-3">
                  ${this.app.sanitizeHtml(category)}
                  <span class="badge bg-primary float-end">平均: ${scores.final}</span>
                </h5>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>評価項目</th>
                        <th class="text-center" style="width: 120px;">自己評価</th>
                        <th class="text-center" style="width: 120px;">評価者評価</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${Object.entries(scores.items || {}).map(([itemName, itemScores]) => `
                        <tr>
                          <td>${this.app.sanitizeHtml(itemName)}</td>
                          <td class="text-center">
                            ${itemScores.self !== null ? `
                              <span class="badge bg-info">${itemScores.self}</span>
                            ` : '-'}
                          </td>
                          <td class="text-center">
                            ${itemScores.evaluator !== null ? `
                              <span class="badge bg-success">${itemScores.evaluator}</span>
                            ` : '-'}
                          </td>
                        </tr>
                      `).join('')}
                      <tr class="table-active fw-bold">
                        <td>カテゴリ平均</td>
                        <td class="text-center">${scores.self}</td>
                        <td class="text-center">${scores.evaluator}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            `).join('')}

            ${this.evaluation.ratings?.comment_self || this.evaluation.ratings?.comment_evaluator ? `
            <div class="mt-4">
              <h5 class="border-bottom pb-2 mb-3">コメント</h5>
              ${this.evaluation.ratings?.comment_self ? `
              <div class="card mb-3">
                <div class="card-header bg-info text-white">
                  <i class="fas fa-user me-2"></i>自己評価コメント
                </div>
                <div class="card-body">
                  <p class="mb-0">${this.app.sanitizeHtml(this.evaluation.ratings.comment_self)}</p>
                </div>
              </div>
              ` : ''}
              ${this.evaluation.ratings?.comment_evaluator ? `
              <div class="card">
                <div class="card-header bg-success text-white">
                  <i class="fas fa-user-tie me-2"></i>評価者コメント
                </div>
                <div class="card-body">
                  <p class="mb-0">${this.app.sanitizeHtml(this.evaluation.ratings.comment_evaluator)}</p>
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderComparisonTab() {
    return `
      <div class="tab-pane fade" id="comparison-tab">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4" data-i18n="report.score_comparison"></h4>
            <canvas id="comparisonChart"></canvas>
          </div>
        </div>
      </div>
    `;
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
      this.app.navigate("#/login");
      return;
    }

    try {
      // 多言語データと評価データを並行で読み込み
      await this.loadMultilingualData();

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
        this.app.navigate('#/evaluations');
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
      this.app.navigate('#/evaluations');
    }
  }

  async loadMultilingualData() {
    try {
      const data = await this.app.api.multilingualAPI.getAllI18nData(this.currentLanguage);
      this.multilingualData = {
        categories: data.categories || [],
        evaluationItems: data.evaluationItems || [],
        jobTypes: data.jobTypes || [],
        periods: data.periods || []
      };
      console.log('Loaded multilingual data for report:', this.multilingualData);
    } catch (error) {
      console.error('Error loading multilingual data:', error);
      // エラーが発生してもレポート表示は続行
    }
  }

  getCategoryName(categoryId) {
    const category = this.multilingualData.categories.find(c => c.categoryId === categoryId);
    return category ? category.categoryName : categoryId;
  }

  getItemName(itemId) {
    const item = this.multilingualData.evaluationItems.find(i => i.itemId === itemId);
    return item ? item.itemName : itemId;
  }

  async processEvaluationData() {
    if (!this.evaluation.ratings) {
      this.processedScores = {
        quantitative: {},
        qualitative: {},
        overall: 0
      };
      return;
    }

    const ratings = this.evaluation.ratings;
    const quantScores = {};
    const qualScores = {};
    const categoryItems = {};
    let totalScore = 0;
    let scoreCount = 0;

    // 定量的評価の処理
    Object.keys(ratings).forEach(key => {
      if (key.startsWith('quant_')) {
        const parts = key.split('_');
        const categoryId = parts[1];
        const itemId = parts[2];
        const type = parts[3]; // 'self' or 'evaluator'

        // カテゴリ名を取得
        const categoryName = this.getCategoryName(categoryId) || `カテゴリ ${categoryId}`;
        const itemName = this.getItemName(itemId) || `項目 ${itemId}`;

        if (!quantScores[categoryName]) {
          quantScores[categoryName] = {
            self: 0,
            evaluator: 0,
            count: 0,
            items: []
          };
        }

        // アイテム詳細を記録
        if (!categoryItems[categoryName]) {
          categoryItems[categoryName] = {};
        }
        if (!categoryItems[categoryName][itemName]) {
          categoryItems[categoryName][itemName] = { self: null, evaluator: null };
        }

        const score = parseInt(ratings[key]);
        if (type === 'self') {
          quantScores[categoryName].self += score;
          categoryItems[categoryName][itemName].self = score;
        } else if (type === 'evaluator') {
          quantScores[categoryName].evaluator += score;
          categoryItems[categoryName][itemName].evaluator = score;
        }
        quantScores[categoryName].count++;
      } else if (key.startsWith('qual_')) {
        const [, index, type] = key.split('_');
        const goalKey = `目標 ${index}`;

        if (!qualScores[goalKey]) {
          qualScores[goalKey] = {};
        }
        qualScores[goalKey][type] = ratings[key];
      }
    });

    // 平均値の計算
    Object.keys(quantScores).forEach(category => {
      const scores = quantScores[category];
      if (scores.count > 0) {
        const itemCount = scores.count / 2; // self と evaluator の2つずつあるため
        scores.self = (scores.self / itemCount).toFixed(1);
        scores.evaluator = (scores.evaluator / itemCount).toFixed(1);
        scores.final = ((parseFloat(scores.self) + parseFloat(scores.evaluator)) / 2).toFixed(1);
        totalScore += parseFloat(scores.final);
        scoreCount++;
      }
      // アイテム詳細を追加
      scores.items = categoryItems[category] || {};
    });

    // 総合スコアの計算
    const overallScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    this.processedScores = {
      quantitative: quantScores,
      qualitative: qualScores,
      overall: overallScore
    };
  }

  afterRender() {
    this.initializeCharts();
    this.setupTabListeners();
  }

  initializeCharts() {
    // サマリーチャート
    const summaryCanvas = document.getElementById('summaryChart');
    if (summaryCanvas && typeof Chart !== 'undefined') {
      const categories = Object.keys(this.processedScores.quantitative);
      const selfScores = categories.map(cat => parseFloat(this.processedScores.quantitative[cat].self) || 0);
      const evaluatorScores = categories.map(cat => parseFloat(this.processedScores.quantitative[cat].evaluator) || 0);

      new Chart(summaryCanvas.getContext('2d'), {
        type: 'radar',
        data: {
          labels: categories,
          datasets: [{
            label: '自己評価',
            data: selfScores,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
          }, {
            label: '評価者評価',
            data: evaluatorScores,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            r: {
              beginAtZero: true,
              max: 5
            }
          }
        }
      });
    }

    // 比較チャート
    const comparisonCanvas = document.getElementById('comparisonChart');
    if (comparisonCanvas && typeof Chart !== 'undefined') {
      const categories = Object.keys(this.processedScores.quantitative);
      const finalScores = categories.map(cat => parseFloat(this.processedScores.quantitative[cat].final) || 0);

      new Chart(comparisonCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: categories,
          datasets: [{
            label: '最終スコア',
            data: finalScores,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 5
            }
          }
        }
      });
    }
  }

  setupTabListeners() {
    // Bootstrap タブのイベントリスナー設定（必要に応じて）
  }
}
