/**
 * Evaluation Form Page Component
 * 評価フォームページコンポーネント
 */
class EvaluationFormPage {
  constructor(app) {
    this.app = app;
    this.evaluationStructure = null;
    this.qualitativeGoals = [];
    this.evaluationData = {
      quantitative: {},
      qualitative: {},
      goals: {},
    };
    this.currentStep = "quantitative";
    this.isSubmitted = false;
    this.targetUser = null; // 評価対象ユーザー
    this.selectedPeriod = null; // 選択された評価期間
    this.evaluationPeriods = []; // 利用可能な評価期間
    this.usersForEvaluation = []; // 評価対象として選べるユーザー (マネージャー・管理者向け)
  }

  /**
   * Render evaluation form page
   * 評価フォームページを描画
   */
  async render() {
    const userRole = this.app.currentUser?.role;
    const isEvaluatorOrAdmin = userRole === "evaluator" || userRole === "admin";

    return `
            <div class="evaluation-form-page">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h1 data-i18n="evaluation.title"></h1>
                    <div class="evaluation-actions">
                        <button class="btn btn-secondary" onclick="window.app.currentPage.saveDraft()" id="saveDraftBtn">
                            <span data-i18n="common.save_draft"></span>
                        </button>
                        <button class="btn btn-success" onclick="window.app.currentPage.submitEvaluation()"
                                id="submitBtn" disabled>
                            <span data-i18n="evaluation.submit"></span>
                        </button>
                    </div>
                </div>

                <div class="progress-indicator mb-2">
                    <div class="progress-step ${this.currentStep === "quantitative" ? "active" : ""}"
                         onclick="window.app.currentPage.switchStep('quantitative')">
                        <div class="step-number">1</div>
                        <div class="step-label" data-i18n="evaluation.quantitative"></div>
                    </div>
                    <div class="progress-step ${this.currentStep === "qualitative" ? "active" : ""}"
                         onclick="window.app.currentPage.switchStep('qualitative')">
                        <div class="step-number">2</div>
                        <div class="step-label" data-i18n="evaluation.qualitative"></div>
                    </div>
                    <div class="progress-step ${this.currentStep === "goals" ? "active" : ""}"
                         onclick="window.app.currentPage.switchStep('goals')">
                        <div class="step-number">3</div>
                        <div class="step-label" data-i18n="evaluation.goal_achievement">目標達成度評価</div>
                    </div>
                </div>

                <div class="card mb-2">
                    <div class="card-header">
                        <h3 data-i18n="evaluation.target_info">評価対象情報</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            ${isEvaluatorOrAdmin ? `
                            <div class="col-md-6 mb-3">
                                <label for="targetUserSelect" class="form-label" data-i18n="evaluation.select_target_user">評価対象者を選択</label>
                                <select id="targetUserSelect" class="form-select" onchange="window.app.currentPage.onTargetUserChange()" ${this.isSubmitted ? 'disabled' : ''}>
                                    <option value="" data-i18n="common.select"></option>
                                    ${this.usersForEvaluation.map(user => `<option value="${user.id}" ${this.targetUser?.id === user.id ? 'selected' : ''}>${this.app.sanitizeHtml(user.name)}</option>`).join('')}
                                </select>
                            </div>
                            ` : ''}
                            <div class="col-md-6 mb-3">
                                <label for="evaluationPeriodSelect" class="form-label" data-i18n="evaluation.select_period">評価期間を選択</label>
                                <select id="evaluationPeriodSelect" class="form-select" onchange="window.app.currentPage.onPeriodChange()" ${this.isSubmitted ? 'disabled' : ''}>
                                    <option value="" data-i18n="common.select"></option>
                                    ${this.evaluationPeriods.map(period => `<option value="${period.id}" ${this.selectedPeriod?.id === period.id ? 'selected' : ''}>${this.app.sanitizeHtml(period.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="target-info mt-3">
                            <div class="info-item">
                                <label data-i18n="evaluation.target_user">評価対象者:</label>
                                <span id="displayTargetUserName">${this.app.sanitizeHtml(this.targetUser?.name || this.app.currentUser?.name || '')}</span>
                            </div>
                            <div class="info-item">
                                <label data-i18n="evaluation.job_type">職種:</label>
                                <span id="displayTargetJobType">${this.app.sanitizeHtml(this.targetUser?.jobType || 'N/A')}</span>
                            </div>
                            <div class="info-item">
                                <label data-i18n="evaluation.period_info">評価期間:</label>
                                <span id="displayEvaluationPeriod">${this.app.sanitizeHtml(this.selectedPeriod?.name || 'N/A')}</span>
                            </div>
                            <div class="info-item">
                                <label data-i18n="evaluation.evaluator_name">評価者:</label>
                                <span>${this.app.sanitizeHtml(this.app.currentUser?.name || '')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="evaluation-steps">
                    <div class="step-content ${this.currentStep === "quantitative" ? "active" : ""}"
                         id="quantitativeStep">
                        <div class="card">
                            <div class="card-header">
                                <h3 data-i18n="evaluation.quantitative"></h3>
                                <p class="text-muted" data-i18n="evaluation.score_hint"></p>
                            </div>
                            <div class="card-body">
                                <div id="quantitativeForm">
                                    <div class="loading"><span data-i18n="common.loading"></span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="step-content ${this.currentStep === "qualitative" ? "active" : ""}"
                         id="qualitativeStep">
                        <div class="card">
                            <div class="card-header">
                                <h3 data-i18n="evaluation.qualitative"></h3>
                                <p class="text-muted" data-i18n="evaluation.score_comment_hint"></p>
                            </div>
                            <div class="card-body">
                                <div id="qualitativeForm">
                                    <div class="loading"><span data-i18n="common.loading"></span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="step-content ${this.currentStep === "goals" ? "active" : ""}"
                         id="goalsStep">
                        <div class="card">
                            <div class="card-header">
                                <h3 data-i18n="evaluation.goal_achievement"></h3>
                                <p class="text-muted" data-i18n="evaluation.goal_achievement_hint"></p>
                            </div>
                            <div class="card-body">
                                <div id="goalsForm">
                                    <div class="loading"><span data-i18n="common.loading"></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="step-navigation">
                    <button class="btn btn-secondary" onclick="window.app.currentPage.previousStep()"
                            id="prevBtn" style="display: none;">
                        <span data-i18n="common.previous"></span>
                    </button>
                    <button class="btn btn-primary" onclick="window.app.currentPage.nextStep()"
                            id="nextBtn">
                        <span data-i18n="common.next"></span>
                    </button>
                </div>
            </div>
        `;
  }

  /**
   * Initialize evaluation form page
   * 評価フォームページを初期化
   */
  async init() {
    this.app.currentPage = this;
    
    // Check permissions
    if (!this.app.hasAnyRole(["evaluator", "worker"])) {
      this.app.navigate("/dashboard");
      return;
    }

    // ログインユーザーが評価対象ユーザーの初期値
    this.targetUser = this.app.currentUser;

    await this.loadInitialData(); // 評価期間、評価対象ユーザーのリストをロード
    await this.loadEvaluationData(); // 評価構造、目標をロード
    this.updateUI();
  }
  
  updateUI() {
    this.renderCurrentStepContent();
    this.updateProgressIndicator();
    this.updateNavigationButtons();
    this.updateSubmitButtonState();
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  /**
   * Load initial data like evaluation periods and users for evaluation
   */
  async loadInitialData() {
      try {
          // 評価期間をロード (settings.js からコピー)
          this.evaluationPeriods = [
              { id: "2024-q1", name: "2024年 第1四半期" },
              { id: "2024-q2", name: "2024年 第2四半期" },
              { id: "2024-q3", name: "2024年 第3四半期" },
              { id: "2024-q4", name: "2024年 第4四半期" },
          ];
          const periodSelect = document.getElementById("evaluationPeriodSelect");
          if (periodSelect) {
              periodSelect.innerHTML = `<option value="" data-i18n="common.select">${this.app.i18n.t('common.select')}</option>` + 
                                       this.evaluationPeriods.map(p => `<option value="${p.id}">${this.app.sanitizeHtml(p.name)}</option>`).join('');
              this.app.i18n.updateUI(periodSelect); // 翻訳適用
          }

          // 評価対象ユーザーをロード
          const userRole = this.app.currentUser?.role;
          if (userRole === "evaluator" || userRole === "admin") {
              // マネージャー/管理者 は部下（worker/evaluator）を選択できるようにする
              // 現状はモックデータから適当にフィルタリング
              const allUsers = [
                  { id: "1", name: "田中 太郎", jobType: "建設作業員", role: "worker" },
                  { id: "2", name: "佐藤 花子", jobType: "現場監督", role: "evaluator" }, // 自身も評価対象
                  { id: "3", name: "鈴木 一郎", jobType: "建設作業員", role: "worker" },
              ];
              this.usersForEvaluation = allUsers.filter(u => u.id !== this.app.currentUser.id); // 自分自身は評価対象リストから除く

              const targetUserSelect = document.getElementById("targetUserSelect");
              if (targetUserSelect) {
                  targetUserSelect.innerHTML = `<option value="" data-i18n="common.select">${this.app.i18n.t('common.select')}</option>` +
                                               this.usersForEvaluation.map(user => `<option value="${user.id}">${this.app.sanitizeHtml(user.name)}</option>`).join('');
                  this.app.i18n.updateUI(targetUserSelect); // 翻訳適用
              }
          } else { // worker
              // 作業員は自分自身のみ
              this.usersForEvaluation = [this.app.currentUser];
          }

          // URLパラメータから評価対象ユーザーと期間をロードするロジックを追加することも可能

          // ロードされた評価データがあれば、それに基づいて初期選択を設定
          const draft = await this.loadDraftFromLocalStorage();
          if (draft) {
              this.evaluationData = draft.evaluationData || this.evaluationData;
              this.isSubmitted = draft.isSubmitted;
              if (draft.targetUser) {
                  this.targetUser = draft.targetUser;
                  const targetSelect = document.getElementById("targetUserSelect");
                  if (targetSelect) targetSelect.value = draft.targetUser.id;
              }
              if (draft.selectedPeriod) {
                  this.selectedPeriod = draft.selectedPeriod;
                  const periodSelect = document.getElementById("evaluationPeriodSelect");
                  if (periodSelect) periodSelect.value = draft.selectedPeriod.id;
              }
          }

          // 最終的な表示ユーザー/期間を確定
          if (this.app.currentUser?.role === "worker" && !this.targetUser) {
              this.targetUser = this.app.currentUser; // 作業員は常に自分を評価
          }
          if (!this.selectedPeriod && this.evaluationPeriods.length > 0) {
              // デフォルトで最新の評価期間を選択 (ここでは最初の期間とする)
              this.selectedPeriod = this.evaluationPeriods[0];
              const periodSelect = document.getElementById("evaluationPeriodSelect");
              if (periodSelect) periodSelect.value = this.selectedPeriod.id;
          }

          this.updateTargetDisplay(); // 評価対象者・期間の表示を更新
          this.toggleFormVisibility(); // フォームの表示/非表示を制御
          if (this.isSubmitted) this.disableForm(); // 提出済みの場合はフォームを無効化

      } catch (error) {
          console.error("Error loading initial evaluation data:", error);
          this.app.showError(this.app.i18n.t("errors.initial_eval_data_load_failed"));
      }
  }

  updateTargetDisplay() {
      const displayTargetUserName = document.getElementById("displayTargetUserName");
      const displayTargetJobType = document.getElementById("displayTargetJobType");
      const displayEvaluationPeriod = document.getElementById("displayEvaluationPeriod");

      if (displayTargetUserName) displayTargetUserName.textContent = this.app.sanitizeHtml(this.targetUser?.name || this.app.currentUser?.name || 'N/A');
      if (displayTargetJobType) displayTargetJobType.textContent = this.app.sanitizeHtml(this.targetUser?.jobType || 'N/A');
      if (displayEvaluationPeriod) displayEvaluationPeriod.textContent = this.app.sanitizeHtml(this.selectedPeriod?.name || 'N/A');
  }

  toggleFormVisibility() {
      const formSteps = document.querySelector(".evaluation-steps");
      const submitBtn = document.getElementById("submitBtn");
      const saveDraftBtn = document.getElementById("saveDraftBtn");
      const navButtons = document.querySelector(".step-navigation");

      const isReady = this.targetUser && this.selectedPeriod;

      if (formSteps) formSteps.style.display = isReady ? 'block' : 'none';
      if (submitBtn) submitBtn.style.display = isReady ? 'inline-block' : 'none';
      if (saveDraftBtn) saveDraftBtn.style.display = isReady ? 'inline-block' : 'none';
      if (navButtons) navButtons.style.display = isReady ? 'flex' : 'none';

      if (isReady) {
          // 評価構造や目標を再ロード・レンダリング
          this.loadEvaluationData();
          this.updateSubmitButtonState(); // 選択後、改めてボタン状態を更新
      }
  }

  async onTargetUserChange() {
      const selectElement = document.getElementById("targetUserSelect");
      const userId = selectElement.value;
      this.targetUser = this.usersForEvaluation.find(u => u.id === userId);
      this.updateTargetDisplay();
      this.toggleFormVisibility();
      await this.loadEvaluationData(); // 評価対象が変更されたらデータを再ロード
  }

  async onPeriodChange() {
      const selectElement = document.getElementById("evaluationPeriodSelect");
      const periodId = selectElement.value;
      this.selectedPeriod = this.evaluationPeriods.find(p => p.id === periodId);
      this.updateTargetDisplay();
      this.toggleFormVisibility();
      await this.loadEvaluationData(); // 期間が変更されたらデータを再ロード
  }


  /**
   * Load evaluation data (structure and goals) for the selected user/period
   * 評価データを読み込み
   */
  async loadEvaluationData() {
    if (!this.targetUser || !this.selectedPeriod) {
        // 対象ユーザーか期間が選択されていない場合はデータロードしない
        console.log("Evaluation target user or period not selected. Skipping data load.");
        return;
    }

    const quantitativeForm = document.getElementById("quantitativeForm");
    const qualitativeForm = document.getElementById("qualitativeForm");
    const goalsForm = document.getElementById("goalsForm");

    if (quantitativeForm) quantitativeForm.innerHTML = `<div class="loading"><span data-i18n="common.loading"></span></div>`;
    if (qualitativeForm) qualitativeForm.innerHTML = `<div class="loading"><span data-i18n="common.loading"></span></div>`;
    if (goalsForm) goalsForm.innerHTML = `<div class="loading"><span data-i18n="common.loading"></span></div>`;
    if (this.app.i18n) this.app.i18n.updateUI(); // ロードメッセージの翻訳

    try {
      // Mock data - 実際にはAPIから取得する
      // 評価構造 (targetUserのjobTypeに基づいて)
      const mockStructures = {
          "建設作業員": {
              categories: [
                { id: "tech", name: "技術スキル", items: [ { id: "t1", name: "専門技術の習得度", type: "quantitative" }, { id: "t2", name: "問題解決能力", type: "quantitative" } ] },
                { id: "comm", name: "コミュニケーション", items: [ { id: "c1", name: "チームワーク", type: "qualitative" }, { id: "c2", name: "報告・連絡・相談", type: "qualitative" } ] },
                { id: "safety", name: "安全意識", items: [ { id: "s1", name: "安全規則の遵守", type: "quantitative" }, { id: "s2", name: "危険予知能力", type: "qualitative" } ] },
              ],
          },
          "現場監督": {
              categories: [
                { id: "leadership", name: "リーダーシップ", items: [ { id: "l1", name: "部下への指導力", type: "quantitative" }, { id: "l2", name: "進捗管理能力", type: "qualitative" } ] },
                { id: "planning", name: "計画・実行", items: [ { id: "p1", name: "工程計画立案能力", type: "quantitative" } ] },
              ],
          }
      };
      this.evaluationStructure = mockStructures[this.targetUser.jobType] || { categories: [] };

      // 目標データ (targetUserとselectedPeriodに基づいて)
      const mockGoals = {
          "employee@example.com-2024-q1": [ // 作業員IDと期間
              { id: "g1", text: "建設現場での安全手順を100%遵守し、ヒヤリハットをゼロにする。", weight: 100 },
          ],
          "employee@example.com-2024-q2": [
              { id: "g3", text: "新しい重機の操作方法を習得し、作業効率を10%向上させる。", weight: 70 },
              { id: "g4", text: "月1回、安全衛生委員会で改善提案を行う。", weight: 30 },
          ],
          "manager@example.com-2024-q1": [ // 評価者IDと期間
              { id: "g5", text: "チームの平均評価スコアを85点以上にする。", weight: 60 },
              { id: "g6", text: "部下のOJT計画を立案・実施し、全員のスキルアップを支援する。", weight: 40 },
          ]
      };
      // API呼び出し例:
      // this.evaluationStructure = await this.app.api.getEvaluationStructure(this.targetUser.jobType, this.app.currentUser.tenantId);
      // this.qualitativeGoals = await this.app.api.getQualitativeGoals(this.targetUser.id, this.selectedPeriod.id, 'approved');
      this.qualitativeGoals = mockGoals[`${this.targetUser.email}-${this.selectedPeriod.id}`] || [];

      // 既存の評価データをロード（下書きまたは提出済み）
      const loadedEvaluation = await this.loadDraftFromLocalStorage(); // localStorageから下書きを読み込む
      if (loadedEvaluation) {
          this.evaluationData = loadedEvaluation.evaluationData || this.evaluationData;
          this.isSubmitted = loadedEvaluation.isSubmitted;
      }
      
      this.renderCurrentStepContent();
      this.updateSubmitButtonState(); // ロード後にボタン状態を更新
      if (this.isSubmitted) this.disableForm(); // 提出済みの場合はフォームを無効化

    } catch (error) {
      console.error("Error loading evaluation data:", error);
      this.app.showError(this.app.i18n.t("errors.evaluation_data_load_failed"));
    }
  }

  /**
   * Render content for the current step
   * 現在のステップのコンテンツを描画
   */
  renderCurrentStepContent() {
    switch (this.currentStep) {
      case "quantitative": this.renderQuantitativeForm(); break;
      case "qualitative": this.renderQualitativeForm(); break;
      case "goals": this.renderGoalsForm(); break;
    }
  }

  /**
   * Render quantitative evaluation form
   * 定量的評価フォームを描画
   */
  renderQuantitativeForm() {
    const container = document.getElementById("quantitativeForm");
    if(!container) return;
    const items = this.evaluationStructure.categories.flatMap(c => c.items.filter(i => i.type === 'quantitative').map(i => ({...i, categoryName: c.name})));
    if (items.length === 0) {
        container.innerHTML = `<p class="text-muted text-center" data-i18n="evaluation.no_quantitative_items"></p>`;
        this.app.i18n.updateUI(container);
        return;
    }
    container.innerHTML = items.map(item => this.renderItem(item, 'quantitative')).join('');
    this.app.i18n.updateUI(container);
  }

  /**
   * Render qualitative evaluation form
   * 定性的評価フォームを描画
   */
  renderQualitativeForm() {
    const container = document.getElementById("qualitativeForm");
     if(!container) return;
    const items = this.evaluationStructure.categories.flatMap(c => c.items.filter(i => i.type === 'qualitative').map(i => ({...i, categoryName: c.name})));
    if (items.length === 0) {
        container.innerHTML = `<p class="text-muted text-center" data-i18n="evaluation.no_qualitative_items"></p>`;
        this.app.i18n.updateUI(container);
        return;
    }
    container.innerHTML = items.map(item => this.renderItem(item, 'qualitative')).join('');
    this.app.i18n.updateUI(container);
  }

  /**
   * Render goals evaluation form
   * 目標評価フォームを描画
   */
  renderGoalsForm() {
    const container = document.getElementById("goalsForm");
     if(!container) return;
    if (this.qualitativeGoals.length === 0) {
      container.innerHTML = `<p class="text-muted text-center" data-i18n="evaluation.no_goals_set"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }
    container.innerHTML = this.qualitativeGoals.map(goal => this.renderItem(goal, 'goals')).join('');
    this.app.i18n.updateUI(container);
  }
  
  renderItem(item, type) {
    const isGoal = type === 'goals';
    const data = this.evaluationData[type][item.id] || {};
    
    return `
      <div class="evaluation-item mb-3 p-3 border rounded">
        <label class="item-name fw-bold">${this.app.sanitizeHtml(isGoal ? item.text : item.name)}</label>
        ${isGoal ? `<div class="text-muted small" data-i18n="evaluation.weight_display" data-i18n-params='{"weight": ${item.weight}}'></div>` : ''}
        <div class="rating-scale my-2">
          ${[1, 2, 3, 4, 5].map(score => `
            <label class="rating-option">
              <input type="radio" name="${type}-${item.id}" value="${score}"
                     onchange="window.app.currentPage.updateScore('${type}', '${item.id}', this.value)"
                     ${data.score == score ? 'checked' : ''}
                     ${this.isSubmitted ? 'disabled' : ''}>
              <span class="rating-label">${score}</span>
            </label>
          `).join('')}
        </div>
        ${type !== 'quantitative' ? `
          <textarea class="form-control" data-i18n-placeholder="evaluation.comment_placeholder"
                    onchange="window.app.currentPage.updateComment('${type}', '${item.id}', this.value)"
                    ${this.isSubmitted ? 'readonly' : ''}>${this.app.sanitizeHtml(data.comment || '')}</textarea>
        ` : ''}
      </div>
    `;
  }

  switchStep(stepName) {
    this.currentStep = stepName;
    
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    // Show current step
    const currentStepEl = document.getElementById(`${stepName}Step`);
    if(currentStepEl) currentStepEl.classList.add('active');

    this.updateUI();
  }

  updateScore(type, itemId, score) {
    if (this.isSubmitted) return; // 提出済みの場合は更新しない
    if (!this.evaluationData[type][itemId]) this.evaluationData[type][itemId] = {};
    this.evaluationData[type][itemId].score = parseInt(score, 10);
    this.updateSubmitButtonState();
  }

  updateComment(type, itemId, comment) {
    if (this.isSubmitted) return; // 提出済みの場合は更新しない
    if (!this.evaluationData[type][itemId]) this.evaluationData[type][itemId] = {};
    this.evaluationData[type][itemId].comment = comment;
  }
  
  updateProgressIndicator() {
      document.querySelectorAll('.progress-step').forEach(el => el.classList.remove('active'));
      const activeStep = document.querySelector(`.progress-step[onclick*="'${this.currentStep}'"]`);
      if(activeStep) activeStep.classList.add('active');
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const steps = ["quantitative", "qualitative", "goals"];
    const currentIndex = steps.indexOf(this.currentStep);

    if (prevBtn) prevBtn.style.display = currentIndex > 0 ? "inline-block" : "none";
    if (nextBtn) nextBtn.style.display = currentIndex < steps.length - 1 ? "inline-block" : "none";
  }

  updateSubmitButtonState() {
    const submitBtn = document.getElementById("submitBtn");
    if (!submitBtn) return;
    submitBtn.disabled = !this.isEvaluationComplete() || this.isSubmitted;
  }

  isEvaluationComplete() {
    if (!this.evaluationStructure) return false;

    const allItems = this.evaluationStructure.categories.flatMap(c => c.items);
    const quantitativeItems = allItems.filter(i => i.type === 'quantitative');
    const qualitativeItems = allItems.filter(i => i.type === 'qualitative');

    const quantComplete = quantitativeItems.every(item => this.evaluationData.quantitative[item.id]?.score);
    const qualComplete = qualitativeItems.every(item => this.evaluationData.qualitative[item.id]?.score);
    const goalsComplete = this.qualitativeGoals.every(goal => this.evaluationData.goals[goal.id]?.score);

    return quantComplete && qualComplete && goalsComplete;
  }

  nextStep() {
    const steps = ["quantitative", "qualitative", "goals"];
    const currentIndex = steps.indexOf(this.currentStep);
    if (currentIndex < steps.length - 1) {
      this.switchStep(steps[currentIndex + 1]);
    }
  }

  previousStep() {
    const steps = ["quantitative", "qualitative", "goals"];
    const currentIndex = steps.indexOf(this.currentStep);
    if (currentIndex > 0) {
      this.switchStep(steps[currentIndex - 1]);
    }
  }

  /**
   * Save draft to localStorage (mock)
   */
  async saveDraft() {
    if (!this.targetUser || !this.selectedPeriod) {
        this.app.showError(this.app.i18n.t("errors.select_target_period_first"));
        return;
    }
    try {
      const draftData = {
        evaluationData: this.evaluationData,
        targetUser: this.targetUser,
        selectedPeriod: this.selectedPeriod,
        isSubmitted: false,
        timestamp: new Date().toISOString()
      };
      // ユーザー、評価対象、期間で一意のキー
      const key = `evaluation-draft-${this.app.currentUser.id}-${this.targetUser.id}-${this.selectedPeriod.id}`;
      localStorage.setItem(key, JSON.stringify(draftData));
      this.app.showSuccess(this.app.i18n.t("messages.save_success"));
    } catch (error) {
      console.error("Error saving draft:", error);
      this.app.showError(this.app.i18n.t("errors.save_failed"));
    }
  }

  /**
   * Load draft from localStorage (mock)
   */
  async loadDraftFromLocalStorage() {
      if (!this.targetUser || !this.selectedPeriod) return null; // 対象ユーザーか期間が選択されていない場合はロードしない

      try {
          const key = `evaluation-draft-${this.app.currentUser.id}-${this.targetUser.id}-${this.selectedPeriod.id}`;
          const draftData = localStorage.getItem(key);
          if (draftData) {
              const draft = JSON.parse(draftData);
              this.app.showInfo(this.app.i18n.t("messages.draft_loaded"));
              return draft;
          }
      } catch (error) {
          console.error("Error loading draft from local storage:", error);
      }
      return null;
  }


  async submitEvaluation() {
    if (!this.targetUser || !this.selectedPeriod) {
        this.app.showError(this.app.i18n.t("errors.select_target_period_first"));
        return;
    }
    if (!this.isEvaluationComplete()) {
      this.app.showError(this.app.i18n.t("errors.fill_all_eval_items"));
      return;
    }
    if (!confirm(this.app.i18n.t("evaluation.confirm_submit"))) return;

    try {
      const evaluationToSubmit = {
        evaluatorId: this.app.currentUser.id,
        targetUserId: this.targetUser.id,
        periodId: this.selectedPeriod.id,
        tenantId: this.app.currentUser.tenantId, // テナントIDも送信
        evaluationData: this.evaluationData,
        status: "self_assessed", // 仮のステータス
        submittedAt: new Date().toISOString(),
      };
      console.log("Submitting evaluation:", evaluationToSubmit);
      // Mock API call
      // await this.app.api.submitEvaluation(evaluationToSubmit);

      // Simulate success and save to localStorage (submitted state)
      const key = `evaluation-draft-${this.app.currentUser.id}-${this.targetUser.id}-${this.selectedPeriod.id}`;
      localStorage.setItem(key, JSON.stringify({ ...evaluationToSubmit, isSubmitted: true }));


      this.isSubmitted = true;
      this.updateSubmitButtonState();
      this.disableForm(); // フォーム全体を無効化

      this.app.showSuccess(this.app.i18n.t("messages.evaluation_submitted"));
      setTimeout(() => this.app.navigate("/evaluations"), 2000);
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      this.app.showError(this.app.i18n.t("errors.submit_failed"));
    }
  }

  disableForm() {
    const formElements = document.querySelectorAll('#evaluationForm .form-control, #evaluationForm .btn, #evaluationForm input[type="radio"]');
    formElements.forEach(el => {
        el.disabled = true;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' && el.type !== 'radio') {
            el.readOnly = true;
        }
    });
    // 特定のボタンを再有効化したい場合はここに追加
    const saveDraftBtn = document.getElementById("saveDraftBtn");
    if (saveDraftBtn) saveDraftBtn.disabled = true;
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.disabled = true;
  }
}

// Add styles
const styles = `
.progress-indicator { display: flex; justify-content: space-around; }
.progress-step { cursor: pointer; text-align: center; padding: 10px; border-bottom: 3px solid transparent; }
.progress-step.active { border-bottom-color: #0d6efd; font-weight: bold; }
.step-content { display: none; }
.step-content.active { display: block; }
.rating-scale { display: flex; gap: 5px; }
.rating-option { padding: 5px; }
.rating-option input[type="radio"] {
    display: none;
}
.rating-option span {
    display: inline-block;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    background-color: #f8f9fa;
    transition: background-color 0.2s, border-color 0.2s;
}
.rating-option input[type="radio"]:checked + span {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
}
.step-navigation { display: flex; justify-content: space-between; margin-top: 20px; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


window.EvaluationFormPage = EvaluationFormPage;
