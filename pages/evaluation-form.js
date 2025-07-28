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
                        <button class="btn btn-secondary" onclick="window.app.currentPage.saveDraft()" id="saveDraftBtn">
                            下書き保存
                        </button>
                        <button class="btn btn-success" onclick="window.app.currentPage.submitEvaluation()"
                                id="submitBtn" disabled>
                            <span data-i18n="evaluation.submit">提出</span>
                        </button>
                    </div>
                </div>

                <!-- Progress Indicator -->
                <div class="progress-indicator mb-2">
                    <div class="progress-step ${this.currentStep === "quantitative" ? "active" : ""}"
                         onclick="window.app.currentPage.switchStep('quantitative')">
                        <div class="step-number">1</div>
                        <div class="step-label">定量的評価</div>
                    </div>
                    <div class="progress-step ${this.currentStep === "qualitative" ? "active" : ""}"
                         onclick="window.app.currentPage.switchStep('qualitative')">
                        <div class="step-number">2</div>
                        <div class="step-label">定性的評価</div>
                    </div>
                    <div class="progress-step ${this.currentStep === "goals" ? "active" : ""}"
                         onclick="window.app.currentPage.switchStep('goals')">
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
                                <span>${this.app.currentUser?.name || ''}</span>
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
                    <button class="btn btn-secondary" onclick="window.app.currentPage.previousStep()"
                            id="prevBtn" style="display: none;">
                        前へ
                    </button>
                    <button class="btn btn-primary" onclick="window.app.currentPage.nextStep()"
                            id="nextBtn">
                        次へ
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

    // Load evaluation data
    await this.loadEvaluationData();
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
   * Load evaluation data
   * 評価データを読み込み
   */
  async loadEvaluationData() {
    try {
      // Mock data
      this.evaluationStructure = {
        categories: [
          { id: "tech", name: "技術スキル", items: [ { id: "t1", name: "専門技術の習得度", type: "quantitative" } ] },
          { id: "comm", name: "コミュニケーション", items: [ { id: "c1", name: "チームワーク", type: "qualitative" } ] },
        ],
      };
      this.qualitativeGoals = [ { id: "g1", text: "プロジェクトの品質向上", weight: 100 } ];
    } catch (error) {
      console.error("Error loading evaluation data:", error);
      this.app.showError("評価データの読み込みに失敗しました。");
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
    container.innerHTML = items.map(item => this.renderItem(item, 'quantitative')).join('');
  }

  /**
   * Render qualitative evaluation form
   * 定性的評価フォームを描画
   */
  renderQualitativeForm() {
    const container = document.getElementById("qualitativeForm");
     if(!container) return;
    const items = this.evaluationStructure.categories.flatMap(c => c.items.filter(i => i.type === 'qualitative').map(i => ({...i, categoryName: c.name})));
    container.innerHTML = items.map(item => this.renderItem(item, 'qualitative')).join('');
  }

  /**
   * Render goals evaluation form
   * 目標評価フォームを描画
   */
  renderGoalsForm() {
    const container = document.getElementById("goalsForm");
     if(!container) return;
    if (this.qualitativeGoals.length === 0) {
      container.innerHTML = "<p>評価対象の目標が設定されていません。</p>";
      return;
    }
    container.innerHTML = this.qualitativeGoals.map(goal => this.renderItem(goal, 'goals')).join('');
  }
  
  renderItem(item, type) {
    const isGoal = type === 'goals';
    const data = this.evaluationData[type][item.id] || {};
    
    return `
      <div class="evaluation-item mb-3 p-3 border rounded">
        <label class="item-name fw-bold">${this.app.sanitizeHtml(isGoal ? item.text : item.name)}</label>
        ${isGoal ? `<div class="text-muted small">ウェイト: ${item.weight}%</div>` : ''}
        <div class="rating-scale my-2">
          ${[1, 2, 3, 4, 5].map(score => `
            <label class="rating-option">
              <input type="radio" name="${type}-${item.id}" value="${score}"
                     onchange="window.app.currentPage.updateScore('${type}', '${item.id}', this.value)"
                     ${data.score == score ? 'checked' : ''}>
              <span class="rating-label">${score}</span>
            </label>
          `).join('')}
        </div>
        ${type !== 'quantitative' ? `
          <textarea class="form-control" placeholder="コメント"
                    onchange="window.app.currentPage.updateComment('${type}', '${item.id}', this.value)">${data.comment || ''}</textarea>
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
    if (!this.evaluationData[type][itemId]) this.evaluationData[type][itemId] = {};
    this.evaluationData[type][itemId].score = parseInt(score, 10);
    this.updateSubmitButtonState();
  }

  updateComment(type, itemId, comment) {
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

  async saveDraft() {
    try {
      localStorage.setItem(`evaluation-draft-${this.app.currentUser.id}`, JSON.stringify(this.evaluationData));
      this.app.showSuccess("下書きを保存しました。");
    } catch (error) {
      this.app.showError("下書きの保存に失敗しました。");
    }
  }

  async submitEvaluation() {
    if (!this.isEvaluationComplete()) {
      this.app.showError("すべての項目を評価してください。");
      return;
    }
    if (!confirm("評価を提出しますか？提出後は編集できません。")) return;

    try {
      console.log("Submitting evaluation:", this.evaluationData);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.removeItem(`evaluation-draft-${this.app.currentUser.id}`);
      this.isSubmitted = true;
      this.updateSubmitButtonState();
      
      // Disable form
      document.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);

      this.app.showSuccess("評価を提出しました。");
      setTimeout(() => this.app.navigate("/evaluations"), 2000);
    } catch (error) {
      this.app.showError("評価の提出に失敗しました。");
    }
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
.step-navigation { display: flex; justify-content: space-between; margin-top: 20px; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


window.EvaluationFormPage = EvaluationFormPage;
