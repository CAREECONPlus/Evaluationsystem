/**
 * Goal Approvals Page Component
 * 目標承認ページコンポーネント
 */
class GoalApprovalsPage {
  constructor(app) {
    this.app = app
    this.pendingGoals = []
    this.approvedGoals = []
    this.selectedTab = "pending"
  }

  /**
   * Render goal approvals page
   * 目標承認ページを描画
   */
  async render() {
    return `
            <div class="goal-approvals-page">
                <h1 data-i18n="goals.title">目標承認</h1>
                
                <!-- Statistics -->
                <div class="stats-grid mb-2">
                    <div class="stat-card">
                        <div class="stat-value" id="pendingCount">0</div>
                        <div class="stat-label">承認待ち</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="approvedCount">0</div>
                        <div class="stat-label">承認済み</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="totalUsersCount">0</div>
                        <div class="stat-label">総ユーザー数</div>
                    </div>
                </div>
                
                <!-- Tabs -->
                <div class="tabs">
                    <ul class="tab-nav">
                        <li>
                            <button class="tab-button ${this.selectedTab === "pending" ? "active" : ""}" 
                                    onclick="GoalApprovalsPage.switchTab('pending')">
                                承認待ち目標
                            </button>
                        </li>
                        <li>
                            <button class="tab-button ${this.selectedTab === "approved" ? "active" : ""}" 
                                    onclick="GoalApprovalsPage.switchTab('approved')">
                                承認済み目標
                            </button>
                        </li>
                    </ul>
                </div>
                
                <!-- Tab Content -->
                <div class="tab-content ${this.selectedTab === "pending" ? "active" : ""}" id="pendingTab">
                    <div class="card">
                        <div class="card-header">
                            <h3>承認待ち目標</h3>
                        </div>
                        <div class="card-body">
                            <div id="pendingGoalsContainer">
                                <div class="loading">読み込み中...</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content ${this.selectedTab === "approved" ? "active" : ""}" id="approvedTab">
                    <div class="card">
                        <div class="card-header">
                            <h3>承認済み目標</h3>
                        </div>
                        <div class="card-body">
                            <div id="approvedGoalsContainer">
                                <div class="loading">読み込み中...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Initialize goal approvals page
   * 目標承認ページを初期化
   */
  async init() {
    // Check permissions
    if (!this.app.hasRole("admin")) {
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

    // Load data
    await this.loadGoals()

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI()
    }
  }

  /**
   * Load goals data
   * 目標データを読み込み
   */
  async loadGoals() {
    try {
      // Mock data - implement actual API calls
      this.pendingGoals = [
        {
          id: "goal-1",
          userId: "user-1",
          userName: "田中太郎",
          userEmail: "tanaka@example.com",
          period: "2024-q1",
          goals: [
            { text: "プロジェクトの品質向上を図り、不具合率を10%削減する", weight: 40 },
            { text: "チームメンバーとの連携を強化し、作業効率を15%向上させる", weight: 35 },
            { text: "新技術の習得により、作業時間を20%短縮する", weight: 25 },
          ],
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: "pending_approval",
        },
        {
          id: "goal-2",
          userId: "user-2",
          userName: "佐藤花子",
          userEmail: "sato@example.com",
          period: "2024-q1",
          goals: [
            { text: "安全管理の徹底により、事故件数をゼロにする", weight: 50 },
            { text: "部下の指導を通じて、チーム全体のスキルアップを図る", weight: 30 },
            { text: "コスト削減により、予算を5%削減する", weight: 20 },
          ],
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "pending_approval",
        },
      ]

      this.approvedGoals = [
        {
          id: "goal-3",
          userId: "user-3",
          userName: "鈴木一郎",
          userEmail: "suzuki@example.com",
          period: "2024-q1",
          goals: [
            { text: "現場の安全性向上のため、安全講習を月2回実施する", weight: 60 },
            { text: "作業効率化のため、新しい工具の導入を検討する", weight: 40 },
          ],
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: "approved",
        },
      ]

      this.updateStatistics()
      this.renderPendingGoals()
      this.renderApprovedGoals()
    } catch (error) {
      console.error("Error loading goals:", error)
      this.app.showError("目標データの読み込みに失敗しました。")
    }
  }

  /**
   * Update statistics
   * 統計を更新
   */
  updateStatistics() {
    const pendingCountElement = document.getElementById("pendingCount")
    const approvedCountElement = document.getElementById("approvedCount")
    const totalUsersCountElement = document.getElementById("totalUsersCount")

    if (pendingCountElement) {
      pendingCountElement.textContent = this.pendingGoals.length
    }
    if (approvedCountElement) {
      approvedCountElement.textContent = this.approvedGoals.length
    }
    if (totalUsersCountElement) {
      // Mock total users count
      totalUsersCountElement.textContent = "12"
    }
  }

  /**
   * Render pending goals
   * 承認待ち目標を描画
   */
  renderPendingGoals() {
    const container = document.getElementById("pendingGoalsContainer")

    if (this.pendingGoals.length === 0) {
      container.innerHTML = "<p>承認待ちの目標はありません。</p>"
      return
    }

    container.innerHTML = this.pendingGoals
      .map(
        (goalSet) => `
            <div class="goal-approval-card" data-goal-id="${goalSet.id}">
                <div class="goal-approval-header">
                    <div class="user-info">
                        <h4>${this.app.sanitizeHtml(goalSet.userName)}</h4>
                        <p class="text-muted">${this.app.sanitizeHtml(goalSet.userEmail)}</p>
                        <p class="text-muted">期間: ${goalSet.period} | 申請日: ${this.app.formatDate(goalSet.submittedAt)}</p>
                    </div>
                    <div class="approval-actions">
                        <button class="btn btn-success" 
                                onclick="GoalApprovalsPage.approveGoals('${goalSet.id}')">
                            <span data-i18n="goals.approve">承認</span>
                        </button>
                        <button class="btn btn-danger" 
                                onclick="GoalApprovalsPage.rejectGoals('${goalSet.id}')">
                            <span data-i18n="goals.reject">差し戻し</span>
                        </button>
                    </div>
                </div>
                
                <div class="goals-list">
                    ${goalSet.goals
                      .map(
                        (goal, index) => `
                        <div class="goal-item">
                            <div class="goal-number">目標 ${index + 1}</div>
                            <div class="goal-content">
                                <div class="goal-text">${this.app.sanitizeHtml(goal.text)}</div>
                                <div class="goal-weight">ウェイト: ${goal.weight}%</div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                    
                    <div class="total-weight">
                        <strong>合計ウェイト: ${goalSet.goals.reduce((sum, goal) => sum + goal.weight, 0)}%</strong>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  /**
   * Render approved goals
   * 承認済み目標を描画
   */
  renderApprovedGoals() {
    const container = document.getElementById("approvedGoalsContainer")

    if (this.approvedGoals.length === 0) {
      container.innerHTML = "<p>承認済みの目標はありません。</p>"
      return
    }

    container.innerHTML = this.approvedGoals
      .map(
        (goalSet) => `
            <div class="goal-approval-card approved">
                <div class="goal-approval-header">
                    <div class="user-info">
                        <h4>${this.app.sanitizeHtml(goalSet.userName)}</h4>
                        <p class="text-muted">${this.app.sanitizeHtml(goalSet.userEmail)}</p>
                        <p class="text-muted">
                            期間: ${goalSet.period} | 
                            申請日: ${this.app.formatDate(goalSet.submittedAt)} | 
                            承認日: ${this.app.formatDate(goalSet.approvedAt)}
                        </p>
                    </div>
                    <div class="approval-status">
                        ${this.app.getStatusBadge("approved")}
                    </div>
                </div>
                
                <div class="goals-list">
                    ${goalSet.goals
                      .map(
                        (goal, index) => `
                        <div class="goal-item">
                            <div class="goal-number">目標 ${index + 1}</div>
                            <div class="goal-content">
                                <div class="goal-text">${this.app.sanitizeHtml(goal.text)}</div>
                                <div class="goal-weight">ウェイト: ${goal.weight}%</div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                    
                    <div class="total-weight">
                        <strong>合計ウェイト: ${goalSet.goals.reduce((sum, goal) => sum + goal.weight, 0)}%</strong>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  /**
   * Switch tab
   * タブを切り替え
   */
  static switchTab(tabName) {
    const page = window.app.currentPage
    if (!page) return

    page.selectedTab = tabName

    // Update tab buttons
    const tabButtons = document.querySelectorAll(".tab-button")
    tabButtons.forEach((btn) => btn.classList.remove("active"))
    event.target.classList.add("active")

    // Update tab content
    const tabContents = document.querySelectorAll(".tab-content")
    tabContents.forEach((content) => content.classList.remove("active"))
    document.getElementById(`${tabName}Tab`).classList.add("active")
  }

  /**
   * Approve goals
   * 目標を承認
   */
  static async approveGoals(goalId) {
    if (!confirm("この目標を承認しますか？")) {
      return
    }

    try {
      // Mock API call
      // await window.app.api.approveGoals(goalId)

      const page = window.app.currentPage
      if (!page) return

      // Move from pending to approved
      const goalIndex = page.pendingGoals.findIndex((g) => g.id === goalId)
      if (goalIndex !== -1) {
        const approvedGoal = page.pendingGoals[goalIndex]
        approvedGoal.status = "approved"
        approvedGoal.approvedAt = new Date()

        page.pendingGoals.splice(goalIndex, 1)
        page.approvedGoals.unshift(approvedGoal)

        page.updateStatistics()
        page.renderPendingGoals()
        page.renderApprovedGoals()
      }

      window.app.showSuccess("目標を承認しました。")
    } catch (error) {
      console.error("Error approving goals:", error)
      window.app.showError("目標の承認に失敗しました。")
    }
  }

  /**
   * Reject goals
   * 目標を差し戻し
   */
  static async rejectGoals(goalId) {
    const reason = prompt("差し戻しの理由を入力してください:")
    if (!reason) {
      return
    }

    try {
      // Mock API call
      // await window.app.api.rejectGoals(goalId, reason)

      const page = window.app.currentPage
      if (!page) return

      // Remove from pending goals
      page.pendingGoals = page.pendingGoals.filter((g) => g.id !== goalId)

      page.updateStatistics()
      page.renderPendingGoals()

      window.app.showSuccess("目標を差し戻しました。")
    } catch (error) {
      console.error("Error rejecting goals:", error)
      window.app.showError("目標の差し戻しに失敗しました。")
    }
  }
}

// Add goal-approvals-specific styles
const goalApprovalsStyles = `
<style>
.goal-approvals-page {
    max-width: 1200px;
    margin: 0 auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 5px;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
}

.tabs {
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
}

.tab-nav {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
}

.tab-nav li {
    margin-right: 5px;
}

.tab-button {
    background: none;
    border: none;
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    font-size: 1rem;
}

.tab-button:hover {
    background-color: #f8f9fa;
}

.tab-button.active {
    border-bottom-color: #007bff;
    color: #007bff;
    font-weight: 500;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.goal-approval-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.goal-approval-card.approved {
    border-color: #28a745;
    background: #f8fff9;
}

.goal-approval-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.user-info h4 {
    margin: 0 0 5px 0;
    color: #333;
}

.user-info p {
    margin: 0;
    font-size: 0.9rem;
}

.approval-actions {
    display: flex;
    gap: 10px;
}

.approval-status {
    display: flex;
    align-items: center;
}

.goals-list {
    background: #fafafa;
    border-radius: 6px;
    padding: 15px;
}

.goal-item {
    display: flex;
    margin-bottom: 15px;
    padding: 12px;
    background: white;
    border-radius: 4px;
    border-left: 4px solid #007bff;
}

.goal-item:last-of-type {
    margin-bottom: 0;
}

.goal-number {
    font-weight: bold;
    color: #007bff;
    min-width: 60px;
    font-size: 0.9rem;
}

.goal-content {
    flex: 1;
}

.goal-text {
    margin-bottom: 5px;
    line-height: 1.4;
}

.goal-weight {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.total-weight {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
    text-align: right;
    color: #007bff;
}

@media (max-width: 768px) {
    .goal-approval-header {
        flex-direction: column;
        gap: 15px;
    }
    
    .approval-actions {
        width: 100%;
        justify-content: stretch;
    }
    
    .approval-actions button {
        flex: 1;
    }
    
    .goal-item {
        flex-direction: column;
        gap: 8px;
    }
    
    .goal-number {
        min-width: auto;
    }
    
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
    }
    
    .stat-card {
        padding: 15px;
    }
    
    .stat-value {
        font-size: 1.5rem;
    }
}
</style>
`

// Inject goal-approvals styles
if (!document.getElementById("goal-approvals-styles")) {
  const styleElement = document.createElement("div")
  styleElement.id = "goal-approvals-styles"
  styleElement.innerHTML = goalApprovalsStyles
  document.head.appendChild(styleElement)
}

// Make GoalApprovalsPage globally available
window.GoalApprovalsPage = GoalApprovalsPage
