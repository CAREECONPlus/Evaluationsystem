/**
 * Goal Setting Page Component
 * 目標設定ページコンポーネント
 */
class GoalSettingPage {
  constructor(app) {
    this.app = app;
    this.goals = [];
    this.totalWeight = 0;
    this.maxGoals = 5;
    this.isSubmitted = false;
    this.evaluationPeriods = []; // 評価期間データ
  }

  /**
   * Render goal setting page
   * 目標設定ページを描画
   */
  async render() {
    return `
            <div class="goal-setting-page">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h1 data-i18n="goals.title"></h1>
                    <div class="goal-actions">
                        <button class="btn btn-secondary" onclick="window.app.currentPage.loadDraft()" id="loadDraftBtn">
                            <span data-i18n="common.load_draft"></span>
                        </button>
                        <button class="btn btn-primary" onclick="window.app.currentPage.saveDraft()" id="saveDraftBtn">
                            <span data-i18n="common.save_draft"></span>
                        </button>
                        <button class="btn btn-success" onclick="window.app.currentPage.submitGoals()"
                                id="submitBtn" disabled>
                            <span data-i18n="goals.apply"></span>
                        </button>
                    </div>
                </div>

                <div class="alert alert-info">
                    <h4><span data-i18n="goals.about_goal_setting"></span></h4>
                    <ul>
                        <li><span data-i18n="goals.max_goals_info" data-i18n-params='{"maxGoals": ${this.maxGoals}}'></span></li>
                        <li><span data-i18n="goals.set_weights_info"></span></li>
                        <li><span data-i18n="goals.total_weight_100_info"></span></li>
                        <li><span data-i18n="goals.admin_approval_info"></span></li>
                    </ul>
                </div>

                <div class="card mb-2" id="currentStatusCard" style="display: none;">
                    <div class="card-header">
                        <h3 data-i18n="common.current_status"></h3>
                    </div>
                    <div class="card-body" id="currentStatusContent">
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h3 data-i18n="goals.goal_setting_form"></h3>
                            <div class="weight-indicator">
                                <span data-i18n="goals.total_weight"></span>: 
                                <span id="totalWeight" class="weight-value">0</span>%
                                <span class="weight-status" id="weightStatus"></span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="goalsContainer">
                        </div>

                        <button class="btn btn-primary" onclick="window.app.currentPage.addGoal()"
                                id="addGoalBtn">
                            <span data-i18n="goals.add_goal"></span>
                        </button>
                    </div>
                </div>

                <div class="card mt-2">
                    <div class="card-header">
                        <h3 data-i18n="evaluation.period"></h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="evaluationPeriod" class="form-label" data-i18n="goals.select_evaluation_period"></label>
                            <select id="evaluationPeriod" class="form-select" onchange="window.app.currentPage.onPeriodChange()">
                                <option value="" data-i18n="common.select"></option>
                                ${this.evaluationPeriods.map(period => `<option value="${period.id}">${this.app.sanitizeHtml(period.name)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Initialize goal setting page
   * 目標設定ページを初期化
   */
  async init() {
    this.app.currentPage = this;

    // Check permissions
    if (!this.app.hasAnyRole(["evaluator", "worker"])) {
      this.app.navigate("/dashboard");
      return;
    }

    // APIサービスが未初期化の場合に初期化を試みる
    if (!this.app.api) {
        this.app.api = new window.API();
        this.app.api.app = this.app;
        this.app.api.init();
    }

    await this.loadEvaluationPeriods(); // 評価期間を先にロード
    await this.loadExistingGoals(); // 既存の目標をロード

    // Initialize with one empty goal if none exist AND no goals were loaded
    if (this.goals.length === 0) {
      this.addGoal();
    }

    this.renderGoals();
    this.updateWeightIndicator();
    this.updateAddGoalButton();
    this.updateSubmitButton();

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  /**
   * Load existing goals
   * 既存の目標を読み込み
   */
  async loadExistingGoals() {
    try {
      const currentUser = this.app.currentUser;
      if (!currentUser) {
        this.app.showError(this.app.i18n.t("errors.login_required"));
        return;
      }
      
      const existingGoals = await this.app.api.getQualitativeGoals(currentUser.id);

      if (existingGoals.length > 0) {
        const latestGoalSet = existingGoals.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
        
        if (latestGoalSet) {
          this.goals = latestGoalSet.goals || [];
          this.isSubmitted = (latestGoalSet.status !== "draft" && latestGoalSet.status !== "rejected");
          
          const periodSelect = document.getElementById("evaluationPeriod");
          if (periodSelect && latestGoalSet.period) {
            periodSelect.value = latestGoalSet.period;
          }
          
          this.showCurrentStatus(latestGoalSet.status);
          if (this.isSubmitted) {
            this.disableForm();
          }
        }
      } else {
        const draft = await this.loadDraftFromLocalStorage();
        if (draft) {
          this.goals = draft.goals || [];
          const periodSelect = document.getElementById("evaluationPeriod");
          if (periodSelect && draft.period) {
            periodSelect.value = draft.period;
          }
          this.isSubmitted = draft.isSubmitted;
        }
      }
    } catch (error) {
      console.error("Error loading existing goals:", error);
      this.app.showError(this.app.i18n.t("errors.goals_load_failed"));
    }
  }

  /**
   * Load evaluation periods for dropdown
   */
  async loadEvaluationPeriods() {
      try {
          this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
          const periodSelect = document.getElementById("evaluationPeriod");
          if (periodSelect) {
              periodSelect.innerHTML = `<option value="" data-i18n="common.select">${this.app.i18n.t('common.select')}</option>` +
                                       this.evaluationPeriods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
              this.app.i18n.updateUI(periodSelect); // 翻訳適用
          }
      } catch (error) {
          console.error("Error loading evaluation periods:", error);
          this.app.showError(this.app.i18n.t("errors.evaluation_periods_load_failed"));
      }
  }

  /**
   * Show current status
   * 現在の状態を表示
   */
  showCurrentStatus(status) {
    const card = document.getElementById("currentStatusCard");
    const content = document.getElementById("currentStatusContent");

    const statusMessages = {
      draft: this.app.i18n.t("status.draft"),
      pending_approval: this.app.i18n.t("status.pending_approval"),
      approved: this.app.i18n.t("status.approved"),
      rejected: this.app.i18n.t("status.rejected"),
      self_assessed: this.app.i18n.t("status.self_assessed"),
      approved_by_evaluator: this.app.i18n.t("status.approved_by_evaluator"),
    };

    card.style.display = "block";
    content.innerHTML = `
            <div class="alert ${status === "approved" ? "alert-success" : status === "rejected" ? "alert-danger" : "alert-warning"}">
                <strong><span data-i18n="common.status"></span>:</strong> ${statusMessages[status] || status}
                ${
                  status === "rejected"
                    ? `<p class="mt-1"><span data-i18n="goals.admin_comment"></span>: <span data-i18n="goals.improve_goal_specificity"></span></p>`
                    : ""
                }
            </div>
        `;
    this.app.i18n.updateUI(content); // レンダリング後に翻訳を適用
  }

  /**
   * Add new goal
   */
  addGoal() {
    if (this.isSubmitted) {
      this.app.showWarning(this.app.i18n.t("messages.already_submitted_goals"));
      return;
    }
    if (this.goals.length >= this.maxGoals) {
      this.app.showError(this.app.i18n.t("errors.max_goals_reached", { maxGoals: this.maxGoals }));
      return;
    }

    const newGoal = {
      id: `goal-${this.app.generateId()}`, // appのgenerateIdを使用
      text: "",
      weight: 0,
    };

    this.goals.push(newGoal);
    this.renderGoals();
    this.updateAddGoalButton();
  }

  /**
   * Remove goal
   */
  removeGoal(goalId) {
    if (this.isSubmitted) {
      this.app.showWarning(this.app.i18n.t("messages.already_submitted_goals"));
      return;
    }
    if (this.goals.length <= 1) {
      this.app.showWarning(this.app.i18n.t("errors.cannot_delete_last_goal"));
      return;
    }
    this.goals = this.goals.filter((goal) => goal.id !== goalId);
    this.renderGoals();
    this.updateWeightIndicator();
    this.updateAddGoalButton();
    this.updateSubmitButton();
  }

  /**
   * Update goal text
   */
  updateGoalText(goalId, text) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (goal) {
      goal.text = text;
      this.updateSubmitButton();
    }
  }

  /**
   * Update goal weight
   */
  updateGoalWeight(goalId, weight) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (goal) {
      goal.weight = Number.parseInt(weight) || 0;
      this.updateWeightIndicator();
      this.updateSubmitButton();
    }
  }

  /**
   * Render goals
   * 目標を描画
   */
  renderGoals() {
    const container = document.getElementById("goalsContainer");
    if (!container) return;

    container.innerHTML = this.goals
      .map(
        (goal, index) => `
            <div class="goal-item" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h4><span data-i18n="goals.goal_number" data-i18n-params='{"number": ${index + 1}}'></span></h4>
                    <button class="btn btn-danger btn-sm"
                            onclick="window.app.currentPage.removeGoal('${goal.id}')"
                            ${this.goals.length <= 1 || this.isSubmitted ? "disabled" : ""}>
                        <span data-i18n="goals.remove_goal"></span>
                    </button>
                </div>

                <div class="goal-content">
                    <div class="form-group">
                        <label for="goalText-${goal.id}" class="form-label" data-i18n="goals.goal_text"></label>
                        <textarea id="goalText-${goal.id}"
                                  class="form-control goal-text-input"
                                  rows="3"
                                  data-i18n-placeholder="goals.goal_content_placeholder"
                                  oninput="window.app.currentPage.updateGoalText('${goal.id}', this.value)"
                                  ${this.isSubmitted ? "readonly" : ""}>${this.app.sanitizeHtml(goal.text)}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="goalWeight-${goal.id}" class="form-label" data-i18n="goals.weight_percent"></label>
                        <input type="number"
                               id="goalWeight-${goal.id}"
                               class="form-control goal-weight-input"
                               min="0"
                               max="100"
                               value="${goal.weight}"
                               oninput="window.app.currentPage.updateGoalWeight('${goal.id}', this.value)"
                               ${this.isSubmitted ? "readonly" : ""}>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");

      this.app.i18n.updateUI(container); // レンダリング後に翻訳を適用
  }

  /**
   * Update weight indicator
   * ウェイト表示を更新
   */
  updateWeightIndicator() {
    this.totalWeight = this.goals.reduce((sum, goal) => sum + (goal.weight || 0), 0);

    const totalWeightElement = document.getElementById("totalWeight");
    const weightStatusElement = document.getElementById("weightStatus");

    if (totalWeightElement) {
      totalWeightElement.textContent = this.totalWeight;
    }

    if (weightStatusElement) {
      if (this.totalWeight === 100) {
        weightStatusElement.textContent = this.app.i18n.t("common.valid_status");
        weightStatusElement.className = "weight-status valid";
      } else if (this.totalWeight > 100) {
        weightStatusElement.textContent = this.app.i18n.t("common.over_limit_status");
        weightStatusElement.className = "weight-status invalid";
      } else {
        weightStatusElement.textContent = this.app.i18n.t("common.insufficient_status");
        weightStatusElement.className = "weight-status invalid";
      }
    }
  }

  /**
   * Update add goal button
   * 目標追加ボタンを更新
   */
  updateAddGoalButton() {
    const addBtn = document.getElementById("addGoalBtn");
    if (addBtn) {
      addBtn.disabled = this.goals.length >= this.maxGoals || this.isSubmitted;
    }
  }

  /**
   * Update submit button
   * 申請ボタンを更新
   */
  updateSubmitButton() {
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      const period = document.getElementById("evaluationPeriod") ? document.getElementById("evaluationPeriod").value : "";
      const isValid =
        this.totalWeight === 100 &&
        this.goals.length > 0 &&
        this.goals.every((goal) => goal.text.trim().length > 0) &&
        period &&
        !this.isSubmitted; // 提出済みでない場合に有効

      submitBtn.disabled = !isValid;
    }
  }

  /**
   * Save draft to localStorage
   */
  async saveDraft() {
    try {
      if (!this.app.currentUser || !this.app.currentUser.id) {
        this.app.showError(this.app.i18n.t("errors.login_required_for_draft"));
        return;
      }
      const period = document.getElementById("evaluationPeriod")?.value;
      if (!period) {
          this.app.showError(this.app.i18n.t("errors.select_evaluation_period"));
          return;
      }

      const draftData = {
        goals: this.goals,
        period: period,
        status: "draft",
        isSubmitted: false, // 下書きなのでfalse
      };

      const userId = this.app.currentUser.id;
      localStorage.setItem(`goals-draft-${userId}`, JSON.stringify(draftData));

      this.app.showSuccess(this.app.i18n.t("messages.save_success"));
    } catch (error) {
      console.error("Error saving draft:", error);
      this.app.showError(this.app.i18n.t("errors.save_failed"));
    }
  }

  /**
   * Load draft from localStorage
   */
  async loadDraftFromLocalStorage() {
    try {
      const userId = this.app.currentUser?.id;
      if (!userId) return null; // ユーザーIDがない場合はロードしない
      
      const draftData = localStorage.getItem(`goals-draft-${userId}`);

      if (draftData) {
        const draft = JSON.parse(draftData);
        // ロードされたデータはisSubmittedをfalseとして扱う
        draft.isSubmitted = false; 
        this.app.showInfo(this.app.i18n.t("messages.draft_loaded"));
        return draft;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error loading draft from local storage:", error);
      return null;
    }
  }

  /**
   * Submit goals
   */
  async submitGoals() {
    const period = document.getElementById("evaluationPeriod").value;
    if (!period) {
      this.app.showError(this.app.i18n.t("errors.select_evaluation_period"));
      return;
    }

    if (!confirm(this.app.i18n.t("goals.confirm_submit"))) {
      return;
    }

    try {
      const goalsData = {
        userId: this.app.currentUser.id,
        userName: this.app.currentUser.name, // 追加
        tenantId: this.app.currentUser.tenantId,
        period: period,
        goals: this.goals,
        status: "pending_approval",
        submittedAt: new Date().toISOString(),
      };

      // Mock API call - 実際にはAPI.js経由でFirestoreに保存
      // await this.app.api.submitGoals(goalsData);
      // ここでは_mockQualitativeGoalsに直接追加するモックとする
      if (!this.app.api._mockQualitativeGoals) {
          this.app.api._mockQualitativeGoals = [];
      }
      this.app.api._mockQualitativeGoals.push(goalsData);


      // Clear draft
      const userId = this.app.currentUser?.id;
      if (userId) {
        localStorage.removeItem(`goals-draft-${userId}`);
      }

      this.isSubmitted = true;
      this.showCurrentStatus("pending_approval");
      this.renderGoals(); // Render again to disable inputs
      this.updateAddGoalButton();
      this.updateSubmitButton();
      this.disableForm(); // フォーム全体を無効化

      this.app.showSuccess(this.app.i18n.t("messages.goals_submitted"));
    } catch (error) {
      console.error("Error submitting goals:", error);
      this.app.showError(this.app.i18n.t("errors.submit_failed"));
    }
  }

  /**
   * Disable form elements after submission
   */
  disableForm() {
    const formElements = document.querySelectorAll('.goal-text-input, .goal-weight-input, #evaluationPeriod, #loadDraftBtn, #saveDraftBtn, #addGoalBtn, #submitBtn');
    formElements.forEach((el) => {
        if (el.tagName === 'BUTTON') {
            el.disabled = true;
        } else {
            el.readOnly = true;
        }
    });
    // Remove buttons explicitly
    document.querySelectorAll('.goal-item .btn-danger').forEach(btn => btn.disabled = true);
  }

  /**
   * Handle period change
   */
  onPeriodChange() {
    this.updateSubmitButton();
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
        align-items: flex-end; /* 右寄せにするために追加 */
        gap: 5px;
    }

    .goal-actions button {
        font-size: 0.9rem;
        padding: 8px 12px;
        width: 100%; /* フル幅にする */
    }
    
    /* 修正箇所: ここもカラム表示にするためFlexboxの方向を調整 */
    .d-flex.justify-content-between {
        flex-direction: column;
        align-items: stretch !important; /* 要素を横いっぱいに広げる */
    }

    .weight-indicator {
        font-size: 1rem;
        text-align: right;
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
`;

// Inject goal-setting styles
if (!document.getElementById("goal-setting-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "goal-setting-styles";
  styleElement.innerHTML = goalSettingStyles;
  document.head.appendChild(styleElement); // ここを修正しました (styleSheet -> styleElement)
}

window.GoalSettingPage = GoalSettingPage;
