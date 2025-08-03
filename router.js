/**
 * Evaluation Report Page Component
 * 評価レポートページコンポーネント
 */
export class EvaluationReportPage {
  constructor(app) {
    this.app = app;
    this.evaluation = null;
    this.chart = null; // 比較チャートのインスタンス
  }

  /**
   * ページ全体のHTMLをレンダリング
   */
  async render() {
    if (!this.evaluation) {
      return `<div class="p-5 text-center">${this.app.i18n.t('common.loading')}</div>`;
    }

    const { employeeName, jobType, evaluatorName, period, submittedAt } = this.evaluation;

    return `
      <div class="evaluation-report-page p-4">
        <div class="report-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3">${this.app.sanitizeHtml(period)} ${this.app.i18n.t('nav.reports')}</h1>
            <p class="text-muted mb-0">
              ${this.app.i18n.t('evaluation.target')}: ${this.app.sanitizeHtml(employeeName)} (${this.app.sanitizeHtml(jobType)})
            </p>
          </div>
          <button class="btn btn-outline-secondary" onclick="window.history.back()">
            <i class="fas fa-arrow-left me-2"></i>${this.app.i18n.t('common.back')}
          </button>
        </div>

        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#summary-tab">サマリー</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#comparison-tab">比較</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#history-tab">履歴</button>
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

  /**
   * サマリータブのコンテンツをレンダリング
   */
  renderSummaryTab() {
    // ダミーデータを使用
    const selfScore = 3.8;
    const evaluatorScore = 4.0;

    return `
      <div class="tab-pane fade show active" id="summary-tab">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4">総合評価</h4>
            <div class="row text-center mb-5">
              <div class="col-6">
                <h5>自己評価</h5>
                <p class="display-4">${selfScore.toFixed(1)}</p>
              </div>
              <div class="col-6">
                <h5>評価者評価</h5>
                <p class="display-4">${evaluatorScore.toFixed(1)}</p>
              </div>
            </div>

            <h4 class="card-title mb-3">定量的評価</h4>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>評価項目</th>
                    <th>自己評価</th>
                    <th>評価者評価</th>
                    <th>自己コメント</th>
                    <th>評価者コメント</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>クロス工事 (新規) / 下地処理</td>
                    <td class="text-center">4</td>
                    <td class="text-center">5</td>
                    <td>定期的な訓練と実践により基準を満たしています。</td>
                    <td>十分な技術レベルに達しており、さらなる向上が期待できます。</td>
                  </tr>
                  <tr>
                    <td>安全管理 / 道具・機械の使用方法</td>
                    <td class="text-center">4</td>
                    <td class="text-center">4</td>
                    <td>常に安全を意識して作業を行いました。</td>
                    <td>安全手順を遵守しており、他の模範となっています。</td>
                  </tr>
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
             <h4 class="card-title mb-4">評価スコア推移</h4>
             <div class="chart-container" style="height: 300px;">
                <canvas id="comparisonChart"></canvas>
             </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 履歴タブのコンテンツをレンダリング
   */
  renderHistoryTab() {
      return `
      <div class="tab-pane fade" id="history-tab">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-4">評価プロセス履歴</h4>
            <ul class="list-group">
              <li class="list-group-item">
                <strong>管理者承認・評価確定:</strong> 2023/10/15 14:10:33
              </li>
               <li class="list-group-item">
                <strong>一次承認:</strong> 2023/10/12 09:21:07
              </li>
              <li class="list-group-item">
                <strong>評価者評価入力:</strong> 2023/10/10 14:30:15
              </li>
              <li class="list-group-item">
                <strong>自己評価提出:</strong> 2023/10/05 13:24:36
              </li>
            </ul>
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
      
      // --- 権限チェック ---
      const currentUser = this.app.currentUser;
      const canView = 
        this.app.hasRole('admin') || // 管理者
        this.evaluation.employeeId === currentUser.id || // 本人
        this.evaluation.evaluatorId === currentUser.id;  // 評価者

      if (!canView) {
        this.app.showError("このレポートへのアクセス権がありません。");
        this.app.navigate('/evaluations');
        return;
      }

      const contentContainer = document.getElementById("content");
      contentContainer.innerHTML = await this.render();
      this.afterRender();
      this.app.i18n.updateUI();

    } catch (error) {
      console.error("Failed to load report:", error);
      this.app.showError("レポートの読み込みに失敗しました。");
      this.app.navigate('/evaluations');
    }
  }
  
  /**
   * ページ描画後の処理 (チャートの初期化など)
   */
  afterRender() {
    const canvas = document.getElementById("comparisonChart");
    if (canvas) {
      this.chart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['2022年下期', '2023年上期', '2023年下期'],
          datasets: [{
            label: '総合評価スコア',
            data: [3.5, 3.8, 4.1],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }
}
