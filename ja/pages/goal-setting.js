/**
 * Goal Setting Page Component
 * 目標設定ページコンポーネント
 */
class GoalSettingPage {
  constructor(app) {
    this.app = app
    this.goals = []
    this.totalWeight = 0
    this.maxGoals = 5
    this.isSubmitted = false
  }

  /**
   * Render goal setting page
   * 目標設定ページを描画
   */
  async render() {
    return `
            <div class="goal-setting-page">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h1 data-i18n="goals.title">目標設定</h1>
                    <div class="goal-actions">
                        <button class="btn btn-secondary" onclick="GoalSettingPage.loadDraft()" id="loadDraftBtn">
                            下書きを読み込み
                        </button>
                        <button class="btn btn-primary" onclick="GoalSettingPage.saveDraft()" id="saveDraftBtn">
                            下書き保存
                        </button>
                        <button class="btn btn-success" onclick="GoalSettingPage.submitGoals()" 
                                id="submitBtn" disabled>
                            <span data-i18n="goals.apply">申請</span>
                        </button>
                    </div>
                </div>
                
                <!-- Instructions -->
                <div class="alert alert-info">
                    <h4>目標設定について</h4>
                    <ul>
                        <li>最大${this.maxGoals}つまでの目標を設定できます</li>
                        <li>各目標にウェイト（重要度）を設定してください</li>
                        <li>ウェイトの合計は100%である必要があります</li>
                        <li>申請後は管理者の承認が必要です</li>
                    </ul>
                </div>
                
                <!-- Current Status -->
                <div class="card mb-2" id="currentStatusCard" style="display: none;">
                    <div class="card-header">
                        <h3>現在の状態</h3>
                    </div>
                    <div class="card-body" id="currentStatusContent">
                    </div>
                </div>
                
                <!-- Goal Setting Form -->
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h3>目標設定フォーム</h3>
                            <div class="weight-indicator">
                                <span>合計ウェイト: </span>
                                <span id="totalWeight" class="weight-value">0</span>%
                                <span class="weight-status" id="weightStatus"></span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="goalsContainer">
                            <!-- Goals will be rendered here -->
                        </div>
                        
                        <button class="btn btn-primary" onclick="GoalSettingPage.addGoal()" 
                                id="addGoalBtn">
                            <span data-i18n="goals.add_goal">目標を追加</span>
                        </button>
                    </div>
                </div>
                
                <!-- Evaluation Period Selection -->
                <div class="card mt-2">
                    <div class="card-header">
                        <h3>評価期間</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="evaluationPeriod">評価期間を選択</label>
                            <select id="evaluationPeriod" class="form-control" onchange="GoalSettingPage.onPeriodChange()">
                                <option value="">選択してください</option>
                                <option value="2024-q1">2024年 第1四半期</option>
                                <option value="2024-q2">2024年 第2四半期</option>
                                <option value="2024-q3">2024年 第3四半期</option>
                                <option value="2024-q4">2024年 第4四半期</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Initialize goal setting page
   * 目標設定ページを初期化
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

    // Load existing goals
    await this.loadExistingGoals()

    // Initialize with one empty goal if none exist
    if (this.goals.length === 0) {
      this.addGoal()
    }

    this.renderGoals()
    this.updateWeightIndicator()

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI()
    }
  }

  /**
   * Load existing goals
   * 既存の目標を読み込み
   */
  async loadExistingGoals() {
    try {
      // Mock data - implement actual API call
      const existingGoals = []

      if (existingGoals.length > 0) {
        this.goals = existingGoals
        this.isSubmitted = existingGoals[0].status !== "draft"
        this.showCurrentStatus(existingGoals[0].status)
      }
    } catch (error) {
      console.error("Error loading existing goals:", error)
      this.app.showError("既存の目標の読み込みに失敗しました。")
    }
  }

  /**
   * Show current status
   * 現在の状態を表示
   */
  showCurrentStatus(status) {
    const card = document.getElementById("currentStatusCard")
    const content = document.getElementById("currentStatusContent")

    const statusMessages = {
      draft: "下書き保存済み",
      pending_approval: "承認待ち",
      approved: "承認済み",
      rejected: "差し戻し",
    }

    card.style.display = "block"
    content.innerHTML = `
            <div class="alert ${status === "approved" ? "alert-success" : status === "rejected" ? "alert-error" : "alert-warning"}">
                <strong>状態:</strong> ${statusMessages[status] || status}
                ${
                  status === "rejected"
                    ? '<p class="mt-1">管理者からのコメント: 目標の具体性を向上させてください。</p>'
                    : ""
                }
            </div>
        `
  }

  /**
   * Add new goal
   * 新しい目標を追加
   */
  static addGoal() {
    const page = window.app.currentPage
    if (!page) return

    if (page.goals.length >= page.maxGoals) {
      window.app.showError(`目標は最大${page.maxGoals}つまでです。`)
      return
    }

    const newGoal = {
      id: `goal-${Date.now()}`,
      text: "",
      weight: 0,
    }

    page.goals.push(newGoal)
    page.renderGoals()
    page.updateAddGoalButton()
  }

  /**
   * Remove goal
   * 目標を削除
   */
  static removeGoal(goalId) {
    const page = window.app.currentPage
    if (!page) return

    page.goals = page.goals.filter((goal) => goal.id !== goalId)
    page.renderGoals()
    page.updateWeightIndicator()
    page.updateAddGoalButton()
    page.updateSubmitButton()
  }

  /**
   * Update goal text
   * 目標テキストを更新
   */
  static updateGoalText(goalId, text) {
    const page = window.app.currentPage
    if (!page) return

    const goal = page.goals.find((g) => g.id === goalId)
    if (goal) {
      goal.text = text
      page.updateSubmitButton()
    }
  }

  /**
   * Update goal weight
   * 目標ウェイトを更新
   */
  static updateGoalWeight(goalId, weight) {
    const page = window.app.currentPage
    if (!page) return

    const goal = page.goals.find((g) => g.id === goalId)
    if (goal) {
      goal.weight = Number.parseInt(weight) || 0
      page.updateWeightIndicator()
      page.updateSubmitButton()
    }
  }

  /**
   * Render goals
   * 目標を描画
   */
  renderGoals() {
    const container = document.getElementById("goalsContainer")

    container.innerHTML = this.goals
      .map(
        (goal, index) => `
            <div class="goal-item" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h4>目標 ${index + 1}</h4>
                    <button class="btn btn-danger btn-sm" 
                            onclick="GoalSettingPage.removeGoal('${goal.id}')"
                            ${this.goals.length <= 1 ? "disabled" : ""}>
                        <span data-i18n="goals.remove_goal">削除</span>
                    </button>
                </div>
                
                <div class="goal-content">
                    <div class="form-group">
                        <label for="goalText-${goal.id}" data-i18n="goals.goal_text">目標内容</label>
                        <textarea id="goalText-${goal.id}" 
                                  class="form-control goal-text-input" 
                                  rows="3" 
                                  placeholder="具体的で測定可能な目標を記入してください"
                                  onchange="GoalSettingPage.updateGoalText('${goal.id}', this.value)"
                                  ${this.isSubmitted ? "readonly" : ""}>${this.app.sanitizeHtml(goal.text)}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="goalWeight-${goal.id}" data-i18n="goals.weight_percent">ウェイト（%）</label>
                        <input type="number" 
                               id="goalWeight-${goal.id}" 
                               class="form-control goal-weight-input" 
                               min="0" 
                               max="100" 
                               value="${goal.weight}"
                               onchange="GoalSettingPage.updateGoalWeight('${goal.id}', this.value)"
                               ${this.isSubmitted ? "readonly" : ""}>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  /**
   * Update weight indicator
   * ウェイト表示を更新
   */
  updateWeightIndicator() {
    this.totalWeight = this.goals.reduce((sum, goal) => sum + (goal.weight || 0), 0)

    const totalWeightElement = document.getElementById("totalWeight")
    const weightStatusElement = document.getElementById("weightStatus")

    if (totalWeightElement) {
      totalWeightElement.textContent = this.totalWeight
    }

    if (weightStatusElement) {
      if (this.totalWeight === 100) {
        weightStatusElement.textContent = "✓"
        weightStatusElement.className = "weight-status valid"
      } else if (this.totalWeight > 100) {
        weightStatusElement.textContent = "超過"
        weightStatusElement.className = "weight-status invalid"
      } else {
        weightStatusElement.textContent = "不足"
        weightStatusElement.className = "weight-status invalid"
      }
    }
  }

  /**
   * Update add goal button
   * 目標追加ボタンを更新
   */
  updateAddGoalButton() {
    const addBtn = document.getElementById("addGoalBtn")
    if (addBtn) {
      addBtn.disabled = this.goals.length >= this.maxGoals || this.isSubmitted
    }
  }

  /**
   * Update submit button
   * 申請ボタンを更新
   */
  updateSubmitButton() {
    const submitBtn = document.getElementById("submitBtn")
    if (submitBtn) {
      const isValid =
        this.totalWeight === 100 &&
        this.goals.length > 0 &&
        this.goals.every((goal) => goal.text.trim().length > 0) &&
        !this.isSubmitted

      submitBtn.disabled = !isValid
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
        goals: page.goals,
        period: document.getElementById("evaluationPeriod").value,
        status: "draft",
      }

      // Save to localStorage as fallback
      localStorage.setItem(`goals-draft-${window.app.currentUser.uid}`, JSON.stringify(draftData))

      // Mock API call
      // await window.app.api.saveGoalsDraft(draftData)

      window.app.showSuccess("下書きを保存しました。")
    } catch (error) {
      console.error("Error saving draft:", error)
      window.app.showError("下書きの保存に失敗しました。")
    }
  }

  /**
   * Load draft
   * 下書きを読み込み
   */
  static async loadDraft() {
    const page = window.app.currentPage
    if (!page) return

    try {
      // Load from localStorage as fallback
      const draftData = localStorage.getItem(`goals-draft-${window.app.currentUser.uid}`)

      if (draftData) {
        const draft = JSON.parse(draftData)
        page.goals = draft.goals || []

        if (draft.period) {
          document.getElementById("evaluationPeriod").value = draft.period
        }

        page.renderGoals()
        page.updateWeightIndicator()
        page.updateSubmitButton()

        window.app.showSuccess("下書きを読み込みました。")
      } else {
        window.app.showError("保存された下書きがありません。")
      }
    } catch (error) {
      console.error("Error loading draft:", error)
      window.app.showError("下書きの読み込みに失敗しました。")
    }
  }

  /**
   * Submit goals
   * 目標を申請
   */
  static async submitGoals() {
    const page = window.app.currentPage
    if (!page) return

    const period = document.getElementById("evaluationPeriod").value
    if (!period) {
      window.app.showError("評価期間を選択してください。")
      return
    }

    if (!confirm("目標を申請しますか？申請後は編集できません。")) {
      return
    }

    try {
      const goalsData = {
        userId: window.app.currentUser.uid,
        tenantId: window.app.currentUser.tenantId,
        period: period,
        goals: page.goals,
        status: "pending_approval",
        submittedAt: new Date(),
      }

      // Mock API call
      // await window.app.api.submitGoals(goalsData)

      // Clear draft
      localStorage.removeItem(`goals-draft-${window.app.currentUser.uid}`)

      page.isSubmitted = true
      page.showCurrentStatus("pending_approval")
      page.renderGoals()
      page.updateAddGoalButton()
      page.updateSubmitButton()

      // Disable form elements
      const inputs = document.querySelectorAll(".goal-text-input, .goal-weight-input")
      inputs.forEach((input) => (input.readOnly = true))

      window.app.showSuccess("目標を申請しました。承認をお待ちください。")
    } catch (error) {
      console.error("Error submitting goals:", error)
      window.app.showError("目標の申請に失敗しました。")
    }
  }

  /**
   * Handle period change
   * 期間変更を処理
   */
  static onPeriodChange() {
    const page = window.app.currentPage
    if (!page) return

    page.updateSubmitButton()
  }
}

// Add goal-setting-specific styles
const goalSettingStyles = `
<style>
.goal-setting-page {
    max-width: 1000px;
    margin: 0 auto;
}

.goal-actions {
    display: flex;
    gap: 10px;
}

.weight-indicator {
    font-size: 1.1rem;
    font-weight: 500;
}

.weight-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #007bff;
}

.weight-status {
    margin-left: 10px;
    font-weight: bold;
}

.weight-status.valid {
    color: #28a745;
}

.weight-status.invalid {
    color: #dc3545;
}

.goal-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background: #fafafa;
}

.goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.goal-header h4 {
    margin: 0;
    color: #007bff;
}

.goal-content {
    display: grid;
    grid-template-columns: 1fr 150px;
    gap: 20px;
    align-items: start;
}

.goal-text-input {
    resize: vertical;
    min-height: 80px;
}

.goal-weight-input {
    text-align: center;
    font-size: 1.1rem;
    font-weight: bold;
}

@media (max-width: 768px) {
    .goal-actions {
        flex-direction: column;
        gap: 5px;
    }
    
    .goal-actions button {
        font-size: 0.9rem;
        padding: 8px 12px;
    }
    
    .weight-indicator {
        font-size: 1rem;
        text-align: center;
        margin-top: 10px;
    }
    
    .goal-content {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .goal-header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
}

@media (max-width: 576px) {
    .goal-setting-page {
        margin: 0 10px;
    }
    
    .goal-item {
        padding: 15px;
    }
}
</style>
`

// Inject goal-setting styles
if (!document.getElementById("goal-setting-styles")) {
  const styleElement = document.createElement("div")
  styleElement.id = "goal-setting-styles"
  styleElement.innerHTML = goalSettingStyles
  document.head.appendChild(styleElement)
}

// Make GoalSettingPage globally available
window.GoalSettingPage = GoalSettingPage
