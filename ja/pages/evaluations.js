/**
 * Evaluations Page Component
 * 評価一覧ページコンポーネント
 */
class EvaluationsPage {
  constructor(app) {
    this.app = app
    this.evaluations = []
    this.selectedEvaluation = null
    this.currentView = "list"
    this.polygonChart = null
  }

  /**
   * Render evaluations page
   * 評価一覧ページを描画
   */
  async render() {
    return `
            <div class="evaluations-page">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h1 data-i18n="evaluation.title">評価一覧</h1>
                    <div class="view-controls">
                        <button class="btn ${this.currentView === "list" ? "btn-primary" : "btn-secondary"}" 
                                onclick="EvaluationsPage.switchView('list')">
                            一覧表示
                        </button>
                        <button class="btn ${this.currentView === "chart" ? "btn-primary" : "btn-secondary"}" 
                                onclick="EvaluationsPage.switchView('chart')">
                            チャート表示
                        </button>
                    </div>
                </div>
                
                <!-- Filters -->
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label for="periodFilter">評価期間</label>
                                <select id="periodFilter" class="form-control" onchange="EvaluationsPage.applyFilters()">
                                    <option value="">すべて</option>
                                    <option value="2024-q1">2024年 第1四半期</option>
                                    <option value="2024-q2">2024年 第2四半期</option>
                                    <option value="2024-q3">2024年 第3四半期</option>
                                    <option value="2024-q4">2024年 第4四半期</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="statusFilter">ステータス</label>
                                <select id="statusFilter" class="form-control" onchange="EvaluationsPage.applyFilters()">
                                    <option value="">すべて</option>
                                    <option value="completed">完了</option>
                                    <option value="pending">未完了</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="userFilter">対象者</label>
                                <input type="text" id="userFilter" class="form-control" 
                                       placeholder="名前で検索..." onchange="EvaluationsPage.applyFilters()">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- List View -->
                <div class="view-content ${this.currentView === "list" ? "active" : ""}" id="listView">
                    <div class="card">
                        <div class="card-header">
                            <h3>評価一覧</h3>
                        </div>
                        <div class="card-body">
                            <div id="evaluationsTable">
                                <div class="loading">読み込み中...</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Chart View -->
                <div class="view-content ${this.currentView === "chart" ? "active" : ""}" id="chartView">
                    <div class="chart-layout">
                        <!-- Chart Selection -->
                        <div class="chart-sidebar">
                            <div class="card">
                                <div class="card-header">
                                    <h3>評価選択</h3>
                                </div>
                                <div class="card-body">
                                    <div id="evaluationSelector">
                                        <div class="loading">読み込み中...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Chart Display -->
                        <div class="chart-main">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h3>評価チャート</h3>
                                        <div class="chart-controls">
                                            <button class="btn btn-secondary btn-sm" 
                                                    onclick="EvaluationsPage.exportChart()" id="exportBtn" disabled>
                                                チャートを保存
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="chartContainer">
                                        <div class="chart-placeholder">
                                            <p>評価を選択してチャートを表示してください</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Chart Details -->
                            <div class="card mt-2" id="chartDetailsCard" style="display: none;">
                                <div class="card-header">
                                    <h3>評価詳細</h3>
                                </div>
                                <div class="card-body">
                                    <div id="chartDetails"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Initialize evaluations page
   * 評価一覧ページを初期化
   */
  async init() {
    // Check permissions
    if (!this.app.hasRole("admin") && !this.app.hasRole("evaluator") && !this.app.hasRole("worker")) {
      this.app.navigate("/dashboard")
      return
    }

    // Update header and sidebar
    if (window.HeaderComponent) {
      window.HeaderComponent.update(this.app.currentUser)
    }
    if (window.SidebarComponent) {
      window.SidebarComponent.update(this.app.currentUser)
    }

    // Load evaluations
    await this.loadEvaluations()

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI()
    }
  }

  /**
   * Load evaluations data
   * 評価データを読み込み
   */
  async loadEvaluations() {
    try {
      // Mock evaluations data
      this.evaluations = [
        {
          id: "eval-1",
          targetUserId: "user-1",
          targetUserName: "田中太郎",
          evaluatorId: "evaluator-1",
          evaluatorName: "山田管理者",
          period: "2024-q1",
          status: "completed",
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          quantitative: {
            "skill-1": 4,
            "skill-2": 3,
            "skill-3": 4,
            "att-2": 5,
            "att-3": 4,
          },
          qualitative: {
            "comm-1": { score: 4, comment: "チームワークが良好で、積極的に協力している" },
            "comm-2": { score: 3, comment: "報告は適切だが、もう少し詳細があると良い" },
            "comm-3": { score: 4, comment: "後輩への指導が丁寧で分かりやすい" },
            "att-1": { score: 5, comment: "非常に積極的で、新しい課題にも前向きに取り組む" },
          },
          goals: {
            "goal-1": { score: 4, comment: "品質向上に向けた取り組みが見られ、目標をほぼ達成" },
            "goal-2": { score: 3, comment: "チーム連携は改善されたが、効率向上はまだ途中段階" },
            "goal-3": { score: 5, comment: "新技術の習得が早く、作業時間短縮を大幅に達成" },
          },
          totalScore: 4.1,
        },
        {
          id: "eval-2",
          targetUserId: "user-2",
          targetUserName: "佐藤花子",
          evaluatorId: "evaluator-1",
          evaluatorName: "山田管理者",
          period: "2024-q1",
          status: "completed",
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          quantitative: {
            "skill-1": 5,
            "skill-2": 4,
            "skill-3": 5,
            "att-2": 5,
            "att-3": 5,
          },
          qualitative: {
            "comm-1": { score: 5, comment: "優れたリーダーシップでチームを牽引している" },
            "comm-2": { score: 4, comment: "報告・連絡が的確で、情報共有が円滑" },
            "comm-3": { score: 5, comment: "部下の指導に優れ、チーム全体のスキル向上に貢献" },
            "att-1": { score: 4, comment: "積極的で責任感が強い" },
          },
          goals: {
            "goal-1": { score: 5, comment: "安全管理を徹底し、事故ゼロを達成" },
            "goal-2": { score: 4, comment: "部下の指導を通じてチーム力向上を実現" },
            "goal-3": { score: 3, comment: "コスト削減は進行中だが、目標達成まであと一歩" },
          },
          totalScore: 4.5,
        },
        {
          id: "eval-3",
          targetUserId: "user-3",
          targetUserName: "鈴木一郎",
          evaluatorId: "evaluator-2",
          evaluatorName: "田中評価者",
          period: "2024-q1",
          status: "pending",
          submittedAt: null,
          totalScore: null,
        },
      ]

      this.renderCurrentView()
    } catch (error) {
      console.error("Error loading evaluations:", error)
      this.app.showError("評価データの読み込みに失敗しました。")
    }
  }

  /**
   * Render current view
   * 現在のビューを描画
   */
  renderCurrentView() {
    if (this.currentView === "list") {
      this.renderEvaluationsList()
    } else if (this.currentView === "chart") {
      this.renderEvaluationSelector()
    }
  }

  /**
   * Render evaluations list
   * 評価一覧を描画
   */
  renderEvaluationsList() {
    const container = document.getElementById("evaluationsTable")

    if (this.evaluations.length === 0) {
      container.innerHTML = "<p>評価データがありません。</p>"
      return
    }

    container.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>対象者</th>
                            <th>評価者</th>
                            <th>期間</th>
                            <th>ステータス</th>
                            <th>総合スコア</th>
                            <th>提出日</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.evaluations
                          .map(
                            (evaluation) => `
                            <tr>
                                <td>${this.app.sanitizeHtml(evaluation.targetUserName)}</td>
                                <td>${this.app.sanitizeHtml(evaluation.evaluatorName)}</td>
                                <td>${evaluation.period}</td>
                                <td>${this.app.getStatusBadge(evaluation.status)}</td>
                                <td>
                                    ${
                                      evaluation.totalScore
                                        ? `<span class="score-badge">${evaluation.totalScore.toFixed(1)}</span>`
                                        : "-"
                                    }
                                </td>
                                <td>
                                    ${evaluation.submittedAt ? this.app.formatDate(evaluation.submittedAt) : "-"}
                                </td>
                                <td>
                                    <button class="btn btn-primary btn-sm" 
                                            onclick="EvaluationsPage.viewDetails('${evaluation.id}')"
                                            ${evaluation.status !== "completed" ? "disabled" : ""}>
                                        詳細
                                    </button>
                                    ${
                                      evaluation.status === "completed"
                                        ? `
                                        <button class="btn btn-secondary btn-sm" 
                                                onclick="EvaluationsPage.viewChart('${evaluation.id}')">
                                            チャート
                                        </button>
                                    `
                                        : ""
                                    }
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `
  }

  /**
   * Render evaluation selector for chart view
   * チャートビュー用の評価選択を描画
   */
  renderEvaluationSelector() {
    const container = document.getElementById("evaluationSelector")
    const completedEvaluations = this.evaluations.filter((e) => e.status === "completed")

    if (completedEvaluations.length === 0) {
      container.innerHTML = "<p>完了した評価がありません。</p>"
      return
    }

    container.innerHTML = `
            <div class="evaluation-list">
                ${completedEvaluations
                  .map(
                    (evaluation) => `
                    <div class="evaluation-item ${this.selectedEvaluation?.id === evaluation.id ? "selected" : ""}" 
                         onclick="EvaluationsPage.selectEvaluation('${evaluation.id}')">
                        <div class="evaluation-info">
                            <div class="evaluation-name">${this.app.sanitizeHtml(evaluation.targetUserName)}</div>
                            <div class="evaluation-period">${evaluation.period}</div>
                            <div class="evaluation-score">スコア: ${evaluation.totalScore.toFixed(1)}</div>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `
  }

  /**
   * Switch view
   * ビューを切り替え
   */
  static switchView(viewName) {
    const page = window.app.currentPage
    if (!page) return

    page.currentView = viewName

    // Update view controls
    const viewControls = document.querySelectorAll(".view-controls button")
    viewControls.forEach((btn) => {
      btn.className = btn.onclick.toString().includes(viewName) ? "btn btn-primary" : "btn btn-secondary"
    })

    // Update view content
    const viewContents = document.querySelectorAll(".view-content")
    viewContents.forEach((content) => content.classList.remove("active"))
    document.getElementById(`${viewName}View`).classList.add("active")

    page.renderCurrentView()
  }

  /**
   * Apply filters
   * フィルターを適用
   */
  static applyFilters() {
    const page = window.app.currentPage
    if (!page) return

    const periodFilter = document.getElementById("periodFilter").value
    const statusFilter = document.getElementById("statusFilter").value
    const userFilter = document.getElementById("userFilter").value.toLowerCase()

    // Mock filtering - implement actual filtering logic
    console.log("Applying filters:", { periodFilter, statusFilter, userFilter })

    page.renderCurrentView()
  }

  /**
   * View evaluation details
   * 評価詳細を表示
   */
  static viewDetails(evaluationId) {
    const page = window.app.currentPage
    if (!page) return

    const evaluation = page.evaluations.find((e) => e.id === evaluationId)
    if (!evaluation) return

    const modal = document.createElement("div")
    modal.className = "modal show"
    modal.innerHTML = `
            <div class="modal-content evaluation-details-modal">
                <div class="modal-header">
                    <h3 class="modal-title">評価詳細 - ${page.app.sanitizeHtml(evaluation.targetUserName)}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="evaluation-summary">
                        <div class="summary-item">
                            <label>評価期間:</label>
                            <span>${evaluation.period}</span>
                        </div>
                        <div class="summary-item">
                            <label>評価者:</label>
                            <span>${page.app.sanitizeHtml(evaluation.evaluatorName)}</span>
                        </div>
                        <div class="summary-item">
                            <label>総合スコア:</label>
                            <span class="score-badge large">${evaluation.totalScore.toFixed(1)}</span>
                        </div>
                    </div>
                    
                    <div class="evaluation-sections">
                        <div class="section">
                            <h4>定量的評価</h4>
                            <div class="scores-grid">
                                ${Object.entries(evaluation.quantitative)
                                  .map(
                                    ([key, score]) => `
                                    <div class="score-item">
                                        <span class="score-label">${key}:</span>
                                        <span class="score-value">${score}</span>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                        
                        <div class="section">
                            <h4>定性的評価</h4>
                            <div class="qualitative-items">
                                ${Object.entries(evaluation.qualitative)
                                  .map(
                                    ([key, data]) => `
                                    <div class="qualitative-item">
                                        <div class="item-header">
                                            <span class="item-name">${key}</span>
                                            <span class="item-score">${data.score}</span>
                                        </div>
                                        <div class="item-comment">${page.app.sanitizeHtml(data.comment)}</div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                        
                        <div class="section">
                            <h4>目標達成度評価</h4>
                            <div class="goals-items">
                                ${Object.entries(evaluation.goals)
                                  .map(
                                    ([key, data]) => `
                                    <div class="goal-item">
                                        <div class="item-header">
                                            <span class="item-name">${key}</span>
                                            <span class="item-score">${data.score}</span>
                                        </div>
                                        <div class="item-comment">${page.app.sanitizeHtml(data.comment)}</div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        閉じる
                    </button>
                </div>
            </div>
        `

    document.body.appendChild(modal)
  }

  /**
   * View evaluation chart
   * 評価チャートを表示
   */
  static viewChart(evaluationId) {
    const page = window.app.currentPage
    if (!page) return

    page.currentView = "chart"
    page.selectedEvaluation = page.evaluations.find((e) => e.id === evaluationId)

    // Switch to chart view
    EvaluationsPage.switchView("chart")
    EvaluationsPage.selectEvaluation(evaluationId)
  }

  /**
   * Select evaluation for chart
   * チャート用の評価を選択
   */
  static selectEvaluation(evaluationId) {
    const page = window.app.currentPage
    if (!page) return

    page.selectedEvaluation = page.evaluations.find((e) => e.id === evaluationId)
    page.renderEvaluationSelector()
    page.renderChart()
  }

  /**
   * Render chart
   * チャートを描画
   */
  renderChart() {
    const container = document.getElementById("chartContainer")
    const detailsCard = document.getElementById("chartDetailsCard")
    const exportBtn = document.getElementById("exportBtn")

    if (!this.selectedEvaluation) {
      container.innerHTML = '<div class="chart-placeholder"><p>評価を選択してチャートを表示してください</p></div>'
      detailsCard.style.display = "none"
      exportBtn.disabled = true
      return
    }

    // Create chart canvas
    container.innerHTML = `
            <div class="chart-wrapper">
                <canvas id="evaluationChart" width="400" height="400"></canvas>
            </div>
        `

    // Initialize polygon chart
    const PolygonChart = window.PolygonChart // Declare the variable here
    this.polygonChart = new PolygonChart("evaluationChart", {
      width: 400,
      height: 400,
      centerX: 200,
      centerY: 200,
      radius: 150,
      maxValue: 5,
    })

    // Prepare chart data
    const chartData = []
    const chartLabels = []

    // Add quantitative scores
    Object.entries(this.selectedEvaluation.quantitative).forEach(([key, score]) => {
      chartData.push(score)
      chartLabels.push(key)
    })

    // Add qualitative scores
    Object.entries(this.selectedEvaluation.qualitative).forEach(([key, data]) => {
      chartData.push(data.score)
      chartLabels.push(key)
    })

    // Add goal scores
    Object.entries(this.selectedEvaluation.goals).forEach(([key, data]) => {
      chartData.push(data.score)
      chartLabels.push(key)
    })

    // Set chart data
    this.polygonChart.setData(chartData, chartLabels)

    // Show details
    this.renderChartDetails()
    detailsCard.style.display = "block"
    exportBtn.disabled = false
  }

  /**
   * Render chart details
   * チャート詳細を描画
   */
  renderChartDetails() {
    const container = document.getElementById("chartDetails")

    container.innerHTML = `
            <div class="chart-details-content">
                <div class="details-summary">
                    <h5>${this.app.sanitizeHtml(this.selectedEvaluation.targetUserName)} の評価結果</h5>
                    <p>評価期間: ${this.selectedEvaluation.period}</p>
                    <p>総合スコア: <span class="score-badge large">${this.selectedEvaluation.totalScore.toFixed(1)}</span></p>
                </div>
                
                <div class="score-breakdown">
                    <div class="breakdown-section">
                        <h6>定量的評価</h6>
                        <div class="score-items">
                            ${Object.entries(this.selectedEvaluation.quantitative)
                              .map(
                                ([key, score]) => `
                                <div class="score-item">
                                    <span class="item-name">${key}</span>
                                    <span class="item-score">${score}/5</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                    
                    <div class="breakdown-section">
                        <h6>定性的評価</h6>
                        <div class="score-items">
                            ${Object.entries(this.selectedEvaluation.qualitative)
                              .map(
                                ([key, data]) => `
                                <div class="score-item">
                                    <span class="item-name">${key}</span>
                                    <span class="item-score">${data.score}/5</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                    
                    <div class="breakdown-section">
                        <h6>目標達成度</h6>
                        <div class="score-items">
                            ${Object.entries(this.selectedEvaluation.goals)
                              .map(
                                ([key, data]) => `
                                <div class="score-item">
                                    <span class="item-name">${key}</span>
                                    <span class="item-score">${data.score}/5</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Export chart
   * チャートをエクスポート
   */
  static exportChart() {
    const page = window.app.currentPage
    if (!page || !page.polygonChart || !page.selectedEvaluation) return

    const filename = `evaluation-chart-${page.selectedEvaluation.targetUserName}-${page.selectedEvaluation.period}.png`
    page.polygonChart.exportAsImage(filename)
  }
}

// Add evaluations-specific styles
const evaluationsStyles = `
<style>
.evaluations-page {
    max-width: 1400px;
    margin: 0 auto;
}

.view-controls {
    display: flex;
    gap: 10px;
}

.filters-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    align-items: end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.filter-group label {
    font-weight: 500;
    font-size: 0.9rem;
    color: #666;
}

.view-content {
    display: none;
}

.view-content.active {
    display: block;
}

.score-badge {
    background-color: #007bff;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: bold;
}

.score-badge.large {
    padding: 6px 12px;
    font-size: 1.1rem;
}

.chart-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    height: calc(100vh - 200px);
}

.chart-sidebar {
    height: fit-content;
}

.chart-main {
    height: fit-content;
}

.evaluation-list {
    max-height: 400px;
    overflow-y: auto;
}

.evaluation-item {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
}

.evaluation-item:hover {
    background-color: #f8f9fa;
    border-color: #007bff;
}

.evaluation-item.selected {
    background-color: #e3f2fd;
    border-color: #007bff;
}

.evaluation-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.evaluation-name {
    font-weight: 600;
    color: #333;
}

.evaluation-period {
    font-size: 0.9rem;
    color: #666;
}

.evaluation-score {
    font-size: 0.9rem;
    color: #007bff;
    font-weight: 500;
}

.chart-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    background-color: #f8f9fa;
    border-radius: 8px;
    color: #666;
}

.chart-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.evaluation-details-modal .modal-content {
    max-width: 800px;
    width: 90%;
}

.evaluation-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.summary-item label {
    font-weight: 500;
    color: #666;
    font-size: 0.9rem;
}

.summary-item span {
    font-weight: 600;
    color: #333;
}

.evaluation-sections {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.section h4 {
    color: #007bff;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 2px solid #007bff;
}

.scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
}

.score-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.score-label {
    font-size: 0.9rem;
    color: #666;
}

.score-value {
    font-weight: bold;
    color: #007bff;
}

.qualitative-items,
.goals-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.qualitative-item,
.goal-item {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #007bff;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.item-name {
    font-weight: 500;
    color: #333;
}

.item-score {
    font-weight: bold;
    color: #007bff;
    background-color: white;
    padding: 4px 8px;
    border-radius: 12px;
}

.item-comment {
    color: #666;
    line-height: 1.4;
    font-style: italic;
}

.chart-details-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.details-summary {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.details-summary h5 {
    color: #007bff;
    margin-bottom: 10px;
}

.score-breakdown {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.breakdown-section h6 {
    color: #333;
    margin-bottom: 10px;
    font-weight: 600;
}

.score-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
}

@media (max-width: 992px) {
    .chart-layout {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .filters-row {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .view-controls {
        flex-direction: column;
        gap: 5px;
    }
    
    .evaluation-summary {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .scores-grid {
        grid-template-columns: 1fr;
    }
    
    .score-items {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 576px) {
    .evaluations-page {
        margin: 0 10px;
    }
    
    .chart-wrapper {
        padding: 10px;
    }
    
    .evaluation-item {
        padding: 12px;
    }
    
    .item-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
}
</style>
`

// Inject evaluations styles
if (!document.getElementById("evaluations-styles")) {
  const styleElement = document.createElement("div")
  styleElement.id = "evaluations-styles"
  styleElement.innerHTML = evaluationsStyles
  document.head.appendChild(styleElement)
}

// Make EvaluationsPage globally available
window.EvaluationsPage = EvaluationsPage
