/**
 * Evaluation Form Page Component
 * 評価フォームページコンポーネント
 */
class EvaluationFormPage {
  constructor(app) {
    this.app = app
    this.evaluationStructure = null
    this.qualitativeGoals = []
    this.evaluationData = {
      quantitative: {},
      qualitative: {},
      goals: {},
    }
    this.currentStep = "quantitative"
    this.isSubmitted = false
  }

  /**
   * Render evaluation form page
   * 評価フォームページを描画
   */
  async render() {
    return `
            <div class="evaluation-form-page">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h1 data-i18n="evaluation.title">評価入力</h1>
                    <div class="evaluation-actions">
                        <button class="btn btn-secondary" onclick="EvaluationFormPage.saveDraft()" id="saveDraftBtn">
                            下書き保存
                        </button>
                        <button class="btn btn-success" onclick="EvaluationFormPage.submitEvaluation()" 
                                id="submitBtn" disabled>
                            <span data-i18n="evaluation.submit">提出</span>
                        </button>
                    </div>
                </div>
                
                <!-- Progress Indicator -->
                <div class="progress-indicator mb-2">
                    <div class="progress-step ${this.currentStep === "quantitative" ? "active" : ""}" 
                         onclick="EvaluationFormPage.switchStep('quantitative')">
                        <div class="step-number">1</div>
                        <div class="step-label">定量的評価</div>
                    </div>
                    <div class="progress-step ${this.currentStep === "qualitative" ? "active" : ""}" 
                         onclick="EvaluationFormPage.switchStep('qualitative')">
                        <div class="step-number">2</div>
                        <div class="step-label">定性的評価</div>
                    </div>
                    <div class="progress-step ${this.currentStep === "goals" ? "active" : ""}" 
                         onclick="EvaluationFormPage.switchStep('goals')">
                        <div class="step-number">3</div>
                        <div class="step-label">目標評価</div>
                    </div>
                </div>
                
                <!-- Evaluation Target Info -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3>評価対象情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="target-info">
                            <div class="info-item">
                                <label>評価対象者:</label>
                                <span id="targetUserName">田中太郎</span>
                            </div>
                            <div class="info-item">
                                <label>職種:</label>
                                <span id="targetJobType">建設作業員</span>
                            </div>
                            <div class="info-item">
                                <label>評価期間:</label>
                                <span id="evaluationPeriod">2024年 第1四半期</span>
                            </div>
                            <div class="info-item">
                                <label>評価者:</label>
                                <span>${this.app.currentUser?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Evaluation Form Steps -->
                <div class="evaluation-steps">
                    <!-- Quantitative Evaluation -->
                    <div class="step-content ${this.currentStep === "quantitative" ? "active" : ""}" 
                         id="quantitativeStep">
                        <div class="card">
                            <div class="card-header">
                                <h3 data-i18n="evaluation.quantitative">定量的評価</h3>
                                <p class="text-muted">1-5点で評価してください（5が最高評価）</p>
                            </div>
                            <div class="card-body">
                                <div id="quantitativeForm">
                                    <div class="loading">読み込み中...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Qualitative Evaluation -->
                    <div class="step-content ${this.currentStep === "qualitative" ? "active" : ""}" 
                         id="qualitativeStep">
                        <div class="card">
                            <div class="card-header">
                                <h3 data-i18n="evaluation.qualitative">定性的評価</h3>
                                <p class="text-muted">1-5点で評価し、コメントを記入してください</p>
                            </div>
                            <div class="card-body">
                                <div id="qualitativeForm">
                                    <div class="loading">読み込み中...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Goals Evaluation -->
                    <div class="step-content ${this.currentStep === "goals" ? "active" : ""}" 
                         id="goalsStep">
                        <div class="card">
                            <div class="card-header">
                                <h3>目標達成度評価</h3>
                                <p class="text-muted">設定された目標の達成度を1-5点で評価してください</p>
                            </div>
                            <div class="card-body">
                                <div id="goalsForm">
                                    <div class="loading">読み込み中...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Navigation Buttons -->
                <div class="step-navigation">
                    <button class="btn btn-secondary" onclick="EvaluationFormPage.previousStep()" 
                            id="prevBtn" style="display: none;">
                        前へ
                    </button>
                    <button class="btn btn-primary" onclick="EvaluationFormPage.nextStep()" 
                            id="nextBtn">
                        次へ
                    </button>
                </div>
            </div>
        `
  }

  /**
   * Initialize evaluation form page
   * 評価フォームページを初期化
   */
  async init() {
    // Check permissions
    if (!this.app.hasRole("evaluator") && !this.app.hasRole("worker")) {
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

    // Load evaluation data
    await this.loadEvaluationData()

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI()
    }
  }

  /**
   * Load evaluation data
   * 評価データを読み込み
   */
  async loadEvaluationData() {
    try {
      // Mock evaluation structure
      this.evaluationStructure = {
        categories: [
          {
            id: "technical-skills",
            name: "技術スキル",
            items: [
              { id: "skill-1", name: "専門技術の習得度", type: "quantitative" },
              { id: "skill-2", name: "作業効率", type: "quantitative" },
              { id: "skill-3", name: "品質管理", type: "quantitative" },
            ],
          },
          {
            id: "communication",
            name: "コミュニケーション",
            items: [
              { id: "comm-1", name: "チームワーク", type: "qualitative" },
              { id: "comm-2", name: "報告・連絡・相談", type: "qualitative" },
              { id: "comm-3", name: "指導力", type: "qualitative" },
            ],
          },
          {
            id: "attitude",
            name: "勤務態度",
            items: [
              { id: "att-1", name: "積極性", type: "qualitative" },
              { id: "att-2", name: "責任感", type: "quantitative" },
              { id: "att-3", name: "安全意識", type: "quantitative" },
            ],
          },
        ],
      }

      // Mock qualitative goals
      this.qualitativeGoals = [
        {
          id: "goal-1",
          text: "プロジェクトの品質向上を図り、不具合率を10%削減する",
          weight: 40,
        },
        {
          id: "goal-2",
          text: "チームメンバーとの連携を強化し、作業効率を15%向上させる",
          weight: 35,
        },
        {
          id: "goal-3",
          text: "新技術の習得により、作業時間を20%短縮する",
          weight: 25,
        },
      ]

      this.renderCurrentStep()
    } catch (error) {
      console.error("Error loading evaluation data:", error)
      this.app.showError("評価データの読み込みに失敗しました。")
    }
  }

  /**
   * Render current step
   * 現在のステップを描画
   */
  renderCurrentStep() {
    switch (this.currentStep) {
      case "quantitative":
        this.renderQuantitativeForm()
        break
      case "qualitative":
        this.renderQualitativeForm()
        break
      case "goals":
        this.renderGoalsForm()
        break
    }

    this.updateNavigationButtons()
  }

  /**
   * Render quantitative evaluation form
   * 定量的評価フォームを描画
   */
  renderQuantitativeForm() {
    const container = document.getElementById("quantitativeForm")
    const quantitativeItems = this.getItemsByType("quantitative")

    container.innerHTML = `
            <div class="evaluation-categories">
                ${this.evaluationStructure.categories
                  .map((category) => {
                    const categoryItems = category.items.filter((item) => item.type === "quantitative")
                    if (categoryItems.length === 0) return ""

                    return `
                        <div class="category-section">
                            <h4 class="category-title">${this.app.sanitizeHtml(category.name)}</h4>
                            <div class="evaluation-items">
                                ${categoryItems
                                  .map(
                                    (item) => `
                                    <div class="evaluation-item">
                                        <div class="item-info">
                                            <label class="item-name">${this.app.sanitizeHtml(item.name)}</label>
                                        </div>
                                        <div class="rating-input">
                                            <div class="rating-scale">
                                                ${[1, 2, 3, 4, 5]
                                                  .map(
                                                    (score) => `
                                                    <label class="rating-option">
                                                        <input type="radio" 
                                                               name="quantitative-${item.id}" 
                                                               value="${score}"
                                                               onchange="EvaluationFormPage.updateScore('quantitative', '${item.id}', ${score})"
                                                               ${this.evaluationData.quantitative[item.id] === score ? "checked" : ""}>
                                                        <span class="rating-label">${score}</span>
                                                    </label>
                                                `,
                                                  )
                                                  .join("")}
                                            </div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                  })
                  .join("")}
            </div>
        `
  }

  /**
   * Render qualitative evaluation form
   * 定性的評価フォームを描画
   */
  renderQualitativeForm() {
    const container = document.getElementById("qualitativeForm")

    container.innerHTML = `
            <div class="evaluation-categories">
                ${this.evaluationStructure.categories
                  .map((category) => {
                    const categoryItems = category.items.filter((item) => item.type === "qualitative")
                    if (categoryItems.length === 0) return ""

                    return `
                        <div class="category-section">
                            <h4 class="category-title">${this.app.sanitizeHtml(category.name)}</h4>
                            <div class="evaluation-items">
                                ${categoryItems
                                  .map(
                                    (item) => `
                                    <div class="evaluation-item qualitative">
                                        <div class="item-info">
                                            <label class="item-name">${this.app.sanitizeHtml(item.name)}</label>
                                        </div>
                                        <div class="rating-input">
                                            <div class="rating-scale">
                                                ${[1, 2, 3, 4, 5]
                                                  .map(
                                                    (score) => `
                                                    <label class="rating-option">
                                                        <input type="radio" 
                                                               name="qualitative-${item.id}" 
                                                               value="${score}"
                                                               onchange="EvaluationFormPage.updateScore('qualitative', '${item.id}', ${score})"
                                                               ${this.evaluationData.qualitative[item.id]?.score === score ? "checked" : ""}>
                                                        <span class="rating-label">${score}</span>
                                                    </label>
                                                `,
                                                  )
                                                  .join("")}
                                            </div>
                                        </div>
                                        <div class="comment-input">
                                            <textarea class="form-control" 
                                                      placeholder="評価の理由やコメントを記入してください"
                                                      rows="3"
                                                      onchange="EvaluationFormPage.updateComment('qualitative', '${item.id}', this.value)">${this.evaluationData.qualitative[item.id]?.comment || ""}</textarea>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                  })
                  .join("")}
            </div>
        `
  }

  /**
   * Render goals evaluation form
   * 目標評価フォームを描画
   */
  renderGoalsForm() {
    const container = document.getElementById("goalsForm")

    if (this.qualitativeGoals.length === 0) {
      container.innerHTML = "<p>評価対象の目標が設定されていません。</p>"
      return
    }

    container.innerHTML = `
            <div class="goals-evaluation">
                ${this.qualitativeGoals
                  .map(
                    (goal, index) => `
                    <div class="goal-evaluation-item">
                        <div class="goal-header">
                            <h5>目標 ${index + 1} (ウェイト: ${goal.weight}%)</h5>
                        </div>
                        <div class="goal-text">
                            ${this.app.sanitizeHtml(goal.text)}
                        </div>
                        <div class="goal-rating">
                            <label class="rating-label-text">達成度評価:</label>
                            <div class="rating-scale">
                                ${[1, 2, 3, 4, 5]
                                  .map(
                                    (score) => `
                                    <label class="rating-option">
                                        <input type="radio" 
                                               name="goal-${goal.id}" 
                                               value="${score}"
                                               onchange="EvaluationFormPage.updateScore('goals', '${goal.id}', ${score})"
                                               ${this.evaluationData.goals[goal.id]?.score === score ? "checked" : ""}>
                                        <span class="rating-label">${score}</span>
                                    </label>
                                `,
                                  )
                                  .join("")}
                            </div>
                            <div class="rating-description">
                                <small class="text-muted">
                                    1: 未達成 | 2: 一部達成 | 3: 概ね達成 | 4: 達成 | 5: 大幅に達成
                                </small>
                            </div>
                        </div>
                        <div class="goal-comment">
                            <textarea class="form-control" 
                                      placeholder="達成状況の詳細や根拠を記入してください"
                                      rows="3"
                                      onchange="EvaluationFormPage.updateComment('goals', '${goal.id}', this.value)">${this.evaluationData.goals[goal.id]?.comment || ""}</textarea>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `
  }

  /**
   * Get items by type
   * タイプ別に項目を取得
   */
  getItemsByType(type) {
    const items = []
    this.evaluationStructure.categories.forEach((category) => {
      category.items.forEach((item) => {
        if (item.type === type) {
          items.push({ ...item, categoryName: category.name })
        }
      })
    })
    return items
  }

  /**
   * Switch step
   * ステップを切り替え
   */
  static switchStep(stepName) {
    const page = window.app.currentPage
    if (!page) return

    page.currentStep = stepName
    page.renderCurrentStep()
  }

  /**
   * Update score
   * スコアを更新
   */
  static updateScore(type, itemId, score) {
    const page = window.app.currentPage
    if (!page) return

    if (type === "quantitative") {
      page.evaluationData.quantitative[itemId] = Number.parseInt(score)
    } else if (type === "qualitative") {
      if (!page.evaluationData.qualitative[itemId]) {
        page.evaluationData.qualitative[itemId] = {}
      }
      page.evaluationData.qualitative[itemId].score = Number.parseInt(score)
    } else if (type === "goals") {
      if (!page.evaluationData.goals[itemId]) {
        page.evaluationData.goals[itemId] = {}
      }
      page.evaluationData.goals[itemId].score = Number.parseInt(score)
    }

    page.updateSubmitButton()
  }

  /**
   * Update comment
   * コメントを更新
   */
  static updateComment(type, itemId, comment) {
    const page = window.app.currentPage
    if (!page) return

    if (type === "qualitative") {
      if (!page.evaluationData.qualitative[itemId]) {
        page.evaluationData.qualitative[itemId] = {}
      }
      page.evaluationData.qualitative[itemId].comment = comment
    } else if (type === "goals") {
      if (!page.evaluationData.goals[itemId]) {
        page.evaluationData.goals[itemId] = {}
      }
      page.evaluationData.goals[itemId].comment = comment
    }
  }

  /**
   * Update navigation buttons
   * ナビゲーションボタンを更新
   */
  updateNavigationButtons() {
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    const steps = ["quantitative", "qualitative", "goals"]
    const currentIndex = steps.indexOf(this.currentStep)

    if (prevBtn) {
      prevBtn.style.display = currentIndex > 0 ? "inline-block" : "none"
    }

    if (nextBtn) {
      if (currentIndex < steps.length - 1) {
        nextBtn.textContent = "次へ"
        nextBtn.onclick = () => EvaluationFormPage.nextStep()
      } else {
        nextBtn.style.display = "none"
      }
    }
  }

  /**
   * Update submit button
   * 提出ボタンを更新
   */
  updateSubmitButton() {
    const submitBtn = document.getElementById("submitBtn")
    if (!submitBtn) return

    const isComplete = this.isEvaluationComplete()
    submitBtn.disabled = !isComplete || this.isSubmitted
  }

  /**
   * Check if evaluation is complete
   * 評価が完了しているかチェック
   */
  isEvaluationComplete() {
    // Check quantitative items
    const quantitativeItems = this.getItemsByType("quantitative")
    for (const item of quantitativeItems) {
      if (!this.evaluationData.quantitative[item.id]) {
        return false
      }
    }

    // Check qualitative items
    const qualitativeItems = this.getItemsByType("qualitative")
    for (const item of qualitativeItems) {
      if (!this.evaluationData.qualitative[item.id]?.score) {
        return false
      }
    }

    // Check goals
    for (const goal of this.qualitativeGoals) {
      if (!this.evaluationData.goals[goal.id]?.score) {
        return false
      }
    }

    return true
  }

  /**
   * Next step
   * 次のステップ
   */
  static nextStep() {
    const page = window.app.currentPage
    if (!page) return

    const steps = ["quantitative", "qualitative", "goals"]
    const currentIndex = steps.indexOf(page.currentStep)

    if (currentIndex < steps.length - 1) {
      page.currentStep = steps[currentIndex + 1]
      page.renderCurrentStep()
    }
  }

  /**
   * Previous step
   * 前のステップ
   */
  static previousStep() {
    const page = window.app.currentPage
    if (!page) return

    const steps = ["quantitative", "qualitative", "goals"]
    const currentIndex = steps.indexOf(page.currentStep)

    if (currentIndex > 0) {
      page.currentStep = steps[currentIndex - 1]
      page.renderCurrentStep()
    }
  }

  /**
   * Save draft
   * 下書きを保存
   */
  static async saveDraft() {
    const page = window.app.currentPage
    if (!page) return

    try {
      const draftData = {
        evaluationData: page.evaluationData,
        currentStep: page.currentStep,
        targetUserId: "user-1", // Mock target user ID
        period: "2024-q1",
      }

      // Save to localStorage as fallback
      localStorage.setItem(`evaluation-draft-${window.app.currentUser.uid}`, JSON.stringify(draftData))

      window.app.showSuccess("下書きを保存しました。")
    } catch (error) {
      console.error("Error saving draft:", error)
      window.app.showError("下書きの保存に失敗しました。")
    }
  }

  /**
   * Submit evaluation
   * 評価を提出
   */
  static async submitEvaluation() {
    const page = window.app.currentPage
    if (!page) return

    if (!page.isEvaluationComplete()) {
      window.app.showError("すべての項目を評価してください。")
      return
    }

    if (!confirm("評価を提出しますか？提出後は編集できません。")) {
      return
    }

    try {
      const evaluationData = {
        evaluatorId: window.app.currentUser.uid,
        targetUserId: "user-1", // Mock target user ID
        tenantId: window.app.currentUser.tenantId,
        period: "2024-q1",
        quantitative: page.evaluationData.quantitative,
        qualitative: page.evaluationData.qualitative,
        goals: page.evaluationData.goals,
        status: "completed",
        submittedAt: new Date(),
      }

      // Mock API call
      // await window.app.api.saveEvaluation(evaluationData)

      // Clear draft
      localStorage.removeItem(`evaluation-draft-${window.app.currentUser.uid}`)

      page.isSubmitted = true
      page.updateSubmitButton()

      // Disable all form inputs
      const inputs = document.querySelectorAll("input, textarea")
      inputs.forEach((input) => (input.disabled = true))

      window.app.showSuccess("評価を提出しました。")

      // Navigate to evaluations list after a delay
      setTimeout(() => {
        window.app.navigate("/evaluations")
      }, 2000)
    } catch (error) {
      console.error("Error submitting evaluation:", error)
      window.app.showError("評価の提出に失敗しました。")
    }
  }
}

// Add evaluation-form-specific styles
const evaluationFormStyles = `
<style>
.evaluation-form-page {
  max-width: 1000px;
  margin: 0 auto;
}

.evaluation-actions {
  display: flex;
  gap: 10px;
}

.progress-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
  min-width: 120px;
}

.progress-step:hover {
  background-color: #f8f9fa;
}

.progress-step.active {
  background-color: #e3f2fd;
  color: #007bff;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 5px;
}

.progress-step.active .step-number {
  background-color: #007bff;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  text-align: center;
}

.target-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.info-item span {
  font-weight: 600;
  color: #333;
}

.step-content {
  display: none;
}

.step-content.active {
  display: block;
}

.category-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.category-title {
  color: #007bff;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff;
}

.evaluation-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.evaluation-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.evaluation-item.qualitative {
  padding-bottom: 15px;
}

.item-info {
  margin-bottom: 15px;
}

.item-name {
  font-weight: 500;
  font-size: 1.1rem;
  color: #333;
}

.rating-input {
  margin-bottom: 15px;
}

.rating-scale {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.rating-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.rating-option:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.rating-option input[type="radio"] {
  margin-bottom: 5px;
  transform: scale(1.2);
}

.rating-label {
  font-weight: bold;
  color: #007bff;
}

.comment-input {
  margin-top: 15px;
}

.comment-input textarea {
  resize: vertical;
}

.goals-evaluation {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.goal-evaluation-item {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.goal-header h5 {
  color: #007bff;
  margin-bottom: 10px;
}

.goal-text {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  line-height: 1.5;
  border: 1px solid #ddd;
}

.goal-rating {
  margin-bottom: 15px;
}

.rating-label-text {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.rating-description {
  margin-top: 10px;
  text-align: center;
}

.goal-comment textarea {
  resize: vertical;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .evaluation-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .progress-indicator {
    flex-direction: column;
    gap: 10px;
  }
  
  .progress-step {
    flex-direction: row;
    min-width: auto;
    width: 100%;
    justify-content: center;
    gap: 10px;
  }
  
  .target-info {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .rating-scale {
    gap: 10px;
  }
  
  .rating-option {
    padding: 8px;
  }
  
  .category-section {
    padding: 15px;
  }
  
  .evaluation-item {
    padding: 15px;
  }
  
  .goal-evaluation-item {
    padding: 15px;
  }
}

@media (max-width: 576px) {
  .rating-scale {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .step-navigation {
    flex-direction: column;
    gap: 10px;
  }
  
  .step-navigation button {
    width: 100%;
  }
}
</style>
`

// Inject evaluation-form styles
if (!document.getElementById("evaluation-form-styles")) {
  const styleElement = document.createElement("div")
  styleElement.id = "evaluation-form-styles"
  styleElement.innerHTML = evaluationFormStyles
  document.head.appendChild(styleElement)
}

// Make EvaluationFormPage globally available
window.EvaluationFormPage = EvaluationFormPage
