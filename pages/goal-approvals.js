/**
 * Goal Approvals Page Component
 * 目標承認ページコンポーネント
 */
class GoalApprovalsPage {
  constructor(app) {
    this.app = app;
    this.pendingGoals = [];
    this.approvedGoals = [];
    this.selectedTab = "pending";
  }

  async render() {
    return `
      <div class="goal-approvals-page">
        <h1 data-i18n="nav.goal_approvals"></h1>
        
        <div class="stats-grid mb-2">
          <div class="stat-card">
            <div class="stat-value" id="pendingCount">0</div>
            <div class="stat-label" data-i18n="goals.pending_goals"></div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="approvedCount">0</div>
            <div class="stat-label" data-i18n="goals.approved_goals"></div>
          </div>
        </div>
        
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link ${this.selectedTab === 'pending' ? 'active' : ''}" id="pending-tab-btn" onclick="window.app.currentPage.switchTab('pending')" data-i18n="goals.pending_goals"></button>
          </li>
          <li class="nav-item">
            <button class="nav-link ${this.selectedTab === 'approved' ? 'active' : ''}" id="approved-tab-btn" onclick="window.app.currentPage.switchTab('approved')" data-i18n="goals.approved_goals"></button>
          </li>
        </ul>
        
        <div id="pendingTabContent" style="display: ${this.selectedTab === 'pending' ? 'block' : 'none'};">
          ${this.renderGoalsTable(this.pendingGoals, 'pending')}
        </div>
        <div id="approvedTabContent" style="display: ${this.selectedTab === 'approved' ? 'block' : 'none'};">
          ${this.renderGoalsTable(this.approvedGoals, 'approved')}
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this; // 現在のページインスタンスを登録

    // 権限チェック
    if (!this.app.hasRole("admin")) {
      this.app.navigate("/dashboard");
      return;
    }

    // Header and Sidebarの更新はAppクラスで制御されているため不要だが、念のため
    if (window.HeaderComponent) {
      window.HeaderComponent.update(this.app.currentUser);
    }
    if (window.SidebarComponent) {
      window.SidebarComponent.update(this.app.currentUser);
    }

    await this.loadGoals();
    this.updateStatistics();
    
    if (this.app.i18n) {
        this.app.i18n.updateUI(); // 初期UIの翻訳を適用
    }
  }

  async loadGoals() {
    // ロード中表示
    const pendingContent = document.getElementById("pendingTabContent");
    const approvedContent = document.getElementById("approvedTabContent");
    if(pendingContent) pendingContent.innerHTML = `<div class="card"><div class="card-body text-center text-muted p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">${this.app.i18n.t('common.loading')}</span></div></div></div>`;
    if(approvedContent) approvedContent.innerHTML = `<div class="card"><div class="card-body text-center text-muted p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">${this.app.i18n.t('common.loading')}</span></div></div></div>`;

    try {
      // Mock data - 実際にはAPIから取得する
      // pendingGoals: statusが'pending_approval'の目標
      this.pendingGoals = [
        { id: "goal-1", userName: "田中 太郎", userId: "employee1", period: "2024-q1", submittedAt: new Date(), goals: [{ text: "建設現場での安全手順を100%遵守し、ヒヤリハットをゼロにする。", weight: 100 }] },
        { id: "goal-3", userName: "鈴木 一郎", userId: "employee3", period: "2024-q1", submittedAt: new Date("2024-07-20"), goals: [{ text: "新規導入されたCADソフトウェアの基本操作を習得し、設計業務での利用を開始する。", weight: 60 }, { text: "週に一度、技術部内での知識共有会に参加し、自身の専門知識を深める。", weight: 40 }] },
      ];
      // approvedGoals: statusが'approved'の目標
      this.approvedGoals = [
        { id: "goal-2", userName: "佐藤 花子", userId: "employee2", period: "2024-q1", approvedAt: new Date("2024-07-15"), goals: [{ text: "プロジェクトAの鉄骨工事において、計画通りの品質基準を達成し、手戻り作業を5%削減する。", weight: 70 }, { text: "新入社員3名に対し、OJTを通じて基本的な現場作業スキルを指導し、習得度を80%以上にする。", weight: 30 }] },
      ];
      
      // API呼び出し例:
      // this.pendingGoals = await this.app.api.getQualitativeGoals({ status: 'pending_approval' });
      // this.approvedGoals = await this.app.api.getQualitativeGoals({ status: 'approved' });

      // ロード後にテーブルをレンダリング
      this.renderGoalsTable(this.pendingGoals, 'pending');
      this.renderGoalsTable(this.approvedGoals, 'approved');

    } catch (error) {
      console.error("Error loading goals:", error);
      this.app.showError(this.app.i18n.t("errors.goals_load_failed"));
      if(pendingContent) pendingContent.innerHTML = `<div class="card"><div class="card-body text-center text-danger p-5">${this.app.i18n.t('errors.loading_failed')}</div></div>`;
      if(approvedContent) approvedContent.innerHTML = `<div class="card"><div class="card-body text-center text-danger p-5">${this.app.i18n.t('errors.loading_failed')}</div></div>`;
    }
  }

  updateStatistics() {
    const pendingCountEl = document.getElementById("pendingCount");
    const approvedCountEl = document.getElementById("approvedCount");

    if (pendingCountEl) pendingCountEl.textContent = this.pendingGoals.length;
    if (approvedCountEl) approvedCountEl.textContent = this.approvedGoals.length;
  }

  renderGoalsTable(data, type) {
    const targetElementId = type === 'pending' ? 'pendingTabContent' : 'approvedTabContent';
    const container = document.getElementById(targetElementId);
    if (!container) return ''; // コンテナがない場合は空文字列を返す

    if (data.length === 0) {
      container.innerHTML = `<div class="card"><div class="card-body text-center text-muted" data-i18n="common.no_data"></div></div>`;
      this.app.i18n.updateUI(container); // 翻訳適用
      return; // HTMLを直接返すのではなく、innerHTMLを更新する形に変更
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          ${data.map(goalSet => `
            <div class="goal-approval-card card mb-3">
              <div class="card-header goal-approval-header d-flex justify-content-between align-items-center">
                <div class="user-info">
                  <h5>${this.app.sanitizeHtml(goalSet.userName)}</h5>
                  <small class="text-muted">${this.app.sanitizeHtml(goalSet.period)} / ${type === 'pending' ? this.app.i18n.t('goals.submitted_at') : this.app.i18n.t('goals.approved_at')}: ${this.app.formatDate(type === 'pending' ? goalSet.submittedAt : goalSet.approvedAt)}</small>
                </div>
                ${type === 'pending' ? `
                <div class="approval-actions">
                  <button class="btn btn-success btn-sm me-2" onclick="window.app.currentPage.approveGoals('${goalSet.id}')" data-i18n="goals.approve"></button>
                  <button class="btn btn-danger btn-sm" onclick="window.app.currentPage.rejectGoals('${goalSet.id}')" data-i18n="goals.reject"></button>
                </div>` : `<span class="badge bg-success" data-i18n="status.approved"></span>`
                }
              </div>
              <div class="card-body goals-list">
                ${goalSet.goals.map(g => `<div class="goal-item"><strong>${this.app.sanitizeHtml(g.weight)}%:</strong> ${this.app.sanitizeHtml(g.text)}</div>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.app.i18n.updateUI(container); // 翻訳適用
  }

  switchTab(tabName) {
    this.selectedTab = tabName; // 現在のタブを更新
    document.getElementById('pendingTabContent').style.display = tabName === 'pending' ? 'block' : 'none';
    document.getElementById('approvedTabContent').style.display = tabName === 'approved' ? 'block' : 'none';
    document.getElementById('pending-tab-btn').classList.toggle('active', tabName === 'pending');
    document.getElementById('approved-tab-btn').classList.toggle('active', tabName === 'approved');
  }

  async approveGoals(id) {
    if (!confirm(this.app.i18n.t('goals.confirm_approve'))) { // 翻訳キーを使用
        return;
    }
    try {
        console.log(`Approving goal ID: ${id}`);
        // Mock data update
        const goalIndex = this.pendingGoals.findIndex(g => g.id === id);
        if (goalIndex > -1) {
            const [approvedGoal] = this.pendingGoals.splice(goalIndex, 1);
            approvedGoal.status = 'approved';
            approvedGoal.approvedAt = new Date();
            this.approvedGoals.push(approvedGoal);
            
            this.renderGoalsTable(this.pendingGoals, 'pending');
            this.renderGoalsTable(this.approvedGoals, 'approved');
            this.updateStatistics();
            this.app.showSuccess(this.app.i18n.t('messages.approval_success')); // 翻訳キーを使用
        }
        // API呼び出し例: await this.app.api.approveGoal(id);
    } catch (error) {
        console.error("Error approving goal:", error);
        this.app.showError(this.app.i18n.t('errors.approval_failed')); // 翻訳キーを使用
    }
  }

  async rejectGoals(id) {
    if (!confirm(this.app.i18n.t('goals.confirm_reject'))) { // 翻訳キーを使用
        return;
    }
    try {
        console.log(`Rejecting goal ID: ${id}`);
        // Mock data update
        const goalIndex = this.pendingGoals.findIndex(g => g.id === id);
        if (goalIndex > -1) {
            const [rejectedGoal] = this.pendingGoals.splice(goalIndex, 1);
            rejectedGoal.status = 'rejected';
            // rejectedGoals配列に移動することも可能だが、今回はpendingから削除のみ
            
            this.renderGoalsTable(this.pendingGoals, 'pending');
            this.updateStatistics();
            this.app.showSuccess(this.app.i18n.t('messages.rejection_success')); // 翻訳キーを使用
        }
        // API呼び出し例: await this.app.api.rejectGoal(id);
    } catch (error) {
        console.error("Error rejecting goal:", error);
        this.app.showError(this.app.i18n.t('errors.rejection_failed')); // 翻訳キーを使用
    }
  }
}

// Add goal-approvals-specific styles
const goalApprovalsStyles = `
<style>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}
.stat-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #007bff;
}
.stat-label {
    font-size: 0.9rem;
    color: #6c757d;
}
.goal-approval-card .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}
.goal-approval-header .user-info h5 {
    margin-bottom: 0;
}
.goals-list .goal-item {
    border-bottom: 1px dashed #eee;
    padding: 8px 0;
}
.goals-list .goal-item:last-child {
    border-bottom: none;
}
</style>
`;

if (!document.getElementById("goal-approvals-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "goal-approvals-styles";
  styleElement.innerHTML = goalApprovalsStyles;
  document.head.appendChild(styleElement);
}

window.GoalApprovalsPage = GoalApprovalsPage;
