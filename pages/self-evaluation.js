// pages/self-evaluation.js - 一般ユーザー専用自己評価ページ

export class SelfEvaluationPage {
  constructor(app) {
    this.app = app;
    this.currentUser = null;
    this.periods = [];
    this.selectedPeriod = null;
    this.evaluationStructure = null;
    this.qualitativeGoals = [];
    this.evaluationData = {};
    this.existingEvaluation = null;
  }

  async render() {
    return `
      <div class="self-evaluation-page p-4">
        <div class="row">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h1><i class="fas fa-user-edit me-2"></i>自己評価入力</h1>
              <div class="d-flex gap-2">
                <button id="saveDraftBtn" class="btn btn-outline-secondary">
                  <i class="fas fa-save me-2"></i>下書き保存
                </button>
                <button id="submitSelfEvaluationBtn" class="btn btn-primary" disabled>
                  <i class="fas fa-paper-plane me-2"></i>評価者に送信
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 説明 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="alert alert-info">
              <h6><i class="fas fa-info-circle me-2"></i>自己評価について</h6>
              <p class="mb-0">
                あなた自身の評価を入力してください。入力後、評価者に送信できます。
                下書き保存を使用して、途中で保存することも可能です。
              </p>
            </div>
          </div>
        </div>

        <!-- 評価期間選択 -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">評価期間の選択</h6>
              </div>
              <div class="card-body">
                <select id="periodSelect" class="form-select">
                  <option value="">評価期間を選択してください</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">評価対象者</h6>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="avatar-sm me-3">
                    <span class="avatar-title rounded-circle bg-primary">
                      ${this.app.currentUser?.name?.substring(0, 2) || '??'}
                    </span>
                  </div>
                  <div>
                    <strong>${this.app.sanitizeHtml(this.app.currentUser?.name || '')}</strong>
                    <br>
                    <small class="text-muted">${this.app.sanitizeHtml(this.app.currentUser?.email || '')}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 自己評価フォーム -->
        <div id="evaluationFormContainer" class="d-none">
          <!-- フォームがここに挿入される -->
        </div>
      </div>
    `;
  }

  async init() {
    this.currentUser = this.app.currentUser;
    
    if (this.currentUser.role !== 'worker') {
      this.app.showError('この機能は一般ユーザー専用です');
      this.app.navigate('#/dashboard');
      return;
    }

    await this.loadInitialData();
    this.setupEventListeners();
  }

  async loadInitialData() {
    try {
      const settings = await this.app.api.getSettings();
      this.periods = settings.periods || [];
      this.renderPeriodSelect();
    } catch (error) {
      console.error('Self evaluation: Error loading periods:', error);
      this.app.showError('評価期間の読み込みに失敗しました');
    }
  }

  renderPeriodSelect() {
    const select = document.getElementById('periodSelect');
    if (!select) return;

    select.innerHTML = `
      <option value="">評価期間を選択してください</option>
      ${this.periods.map(period => 
        `<option value="${period.id}">${this.app.sanitizeHtml(period.name)}</option>`
      ).join('')}
    `;
  }

  setupEventListeners() {
    document.getElementById('periodSelect').addEventListener('change', (e) => {
      this.onPeriodChange(e.target.value);
    });

    document.getElementById('saveDraftBtn').addEventListener('click', () => {
      this.saveDraft();
    });

    document.getElementById('submitSelfEvaluationBtn').addEventListener('click', () => {
      this.submitSelfEvaluation();
    });
  }

  async onPeriodChange(periodId) {
    if (!periodId) {
      document.getElementById('evaluationFormContainer').classList.add('d-none');
      return;
    }

    this.selectedPeriod = this.periods.find(p => p.id === periodId);
    await this.loadEvaluationData();
    this.renderEvaluationForm();
  }

  async loadEvaluationData() {
    try {
      // 既存の評価をチェック
      const evaluations = await this.app.api.getEvaluations({
        targetUserId: this.currentUser.uid || this.currentUser.id,
        periodId: this.selectedPeriod.id
      });

      this.existingEvaluation = evaluations.find(e => 
        e.targetUserId === (this.currentUser.uid || this.currentUser.id) &&
        e.periodId === this.selectedPeriod.id
      );

      // 評価構造を取得
      if (this.currentUser.jobTypeId) {
        this.evaluationStructure = await this.app.api.getEvaluationStructure(this.currentUser.jobTypeId);
      }

      // 目標を取得
      const goals = await this.app.api.getGoals(this.currentUser.uid || this.currentUser.id, this.selectedPeriod.id);
      this.qualitativeGoals = goals?.goals || [];

    } catch (error) {
      console.error('Self evaluation: Error loading data:', error);
      this.app.showError('評価データの読み込みに失敗しました');
    }
  }

  renderEvaluationForm() {
    const container = document.getElementById('evaluationFormContainer');
    
    let formHtml = '<div class="row">';

    // 定量的評価
    if (this.evaluationStructure?.categories) {
      formHtml += `
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>スキル・能力評価</h6>
            </div>
            <div class="card-body">
              ${this.renderSkillEvaluation()}
            </div>
          </div>
        </div>
      `;
    }

    // 目標達成度評価
    if (this.qualitativeGoals.length > 0) {
      formHtml += `
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0"><i class="fas fa-bullseye me-2"></i>目標達成度</h6>
            </div>
            <div class="card-body">
              ${this.renderGoalEvaluation()}
            </div>
          </div>
        </div>
      `;
    }

    formHtml += '</div>';

    // 自己評価コメント
    formHtml += `
      <div class="card mt-4">
        <div class="card-header">
          <h6 class="mb-0"><i class="fas fa-comment me-2"></i>自己評価コメント</h6>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">今期の振り返り・成果</label>
            <textarea class="form-control evaluation-input" id="achievementComment" rows="4" 
                      placeholder="今期に達成した成果や頑張った点を具体的に記入してください..."></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">改善点・今後の課題</label>
            <textarea class="form-control evaluation-input" id="improvementComment" rows="4" 
                      placeholder="改善したい点や今後の課題について記入してください..."></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">今後の目標・やりたいこと</label>
            <textarea class="form-control evaluation-input" id="futureGoalComment" rows="4" 
                      placeholder="次期に向けた目標や取り組みたいことを記入してください..."></textarea>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = formHtml;
    container.classList.remove('d-none');

    // 既存データをロード
    this.loadExistingData();
    this.setupFormValidation();
  }

  renderSkillEvaluation() {
    let html = '<div class="evaluation-section">';
    
    this.evaluationStructure.categories.forEach((category, catIndex) => {
      html += `<h6 class="text-primary mb-3">${this.app.sanitizeHtml(category.name)}</h6>`;
      
      category.items.forEach((item, itemIndex) => {
        const key = `skill_${catIndex}_${itemIndex}`;
        html += `
          <div class="mb-4">
            <label class="form-label fw-semibold">${this.app.sanitizeHtml(item.name)}</label>
            <div class="rating-buttons d-flex gap-2 mb-2">
              ${[1,2,3,4,5].map(score => `
                <button type="button" class="btn btn-outline-primary rating-btn flex-fill" 
                        data-key="${key}" data-value="${score}">
                  ${score}<br><small>${this.getScoreLabel(score)}</small>
                </button>
              `).join('')}
            </div>
            <input type="hidden" class="evaluation-input" data-key="${key}" required>
          </div>
        `;
      });
    });
    
    html += '</div>';
    return html;
  }

  renderGoalEvaluation() {
    let html = '<div class="goal-evaluation-section">';
    
    this.qualitativeGoals.forEach((goal, index) => {
      const key = `goal_${index}`;
      html += `
        <div class="mb-4">
          <label class="form-label fw-semibold">${this.app.sanitizeHtml(goal.text)}</label>
          <small class="text-muted d-block mb-2">ウェイト: ${goal.weight}%</small>
          <div class="rating-buttons d-flex gap-2 mb-2">
            ${[1,2,3,4,5].map(score => `
              <button type="button" class="btn btn-outline-success rating-btn flex-fill" 
                      data-key="${key}" data-value="${score}">
                ${score}<br><small>${this.getAchievementLabel(score)}</small>
              </button>
            `).join('')}
          </div>
          <input type="hidden" class="evaluation-input" data-key="${key}" required>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  getScoreLabel(score) {
    const labels = { 1: '要改善', 2: '基準以下', 3: '標準', 4: '良好', 5: '優秀' };
    return labels[score] || '';
  }

  getAchievementLabel(score) {
    const labels = { 1: '未達成', 2: '一部達成', 3: '概ね達成', 4: '達成', 5: '大幅達成' };
    return labels[score] || '';
  }

  setupFormValidation() {
    // 評価ボタンのクリック処理
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.dataset.key;
        const value = btn.dataset.value;
        
        // 同じキーのボタンから active を削除
        document.querySelectorAll(`[data-key="${key}"]`).forEach(b => 
          b.classList.remove('btn-primary', 'btn-success')
        );
        
        // クリックされたボタンを active にする
        if (btn.classList.contains('btn-outline-primary')) {
          btn.classList.remove('btn-outline-primary');
          btn.classList.add('btn-primary');
        } else if (btn.classList.contains('btn-outline-success')) {
          btn.classList.remove('btn-outline-success');
          btn.classList.add('btn-success');
        }
        
        // hidden input に値をセット
        const input = document.querySelector(`input[data-key="${key}"]`);
        if (input) {
          input.value = value;
        }
        
        this.validateForm();
      });
    });

    // テキストエリアの変更監視
    document.querySelectorAll('.evaluation-input').forEach(input => {
      input.addEventListener('input', () => this.validateForm());
    });
  }

  validateForm() {
    const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    let completedCount = 0;

    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
      } else {
        completedCount++;
      }
    });

    const progress = requiredInputs.length > 0 ? (completedCount / requiredInputs.length) * 100 : 100;
    
    const submitBtn = document.getElementById('submitSelfEvaluationBtn');
    if (submitBtn) {
      submitBtn.disabled = !isValid;
      
      if (progress < 100) {
        submitBtn.innerHTML = `<i class="fas fa-paper-plane me-2"></i>評価者に送信 (${Math.round(progress)}%完了)`;
      } else {
        submitBtn.innerHTML = `<i class="fas fa-paper-plane me-2"></i>評価者に送信`;
      }
    }

    return isValid;
  }

  loadExistingData() {
    if (!this.existingEvaluation) return;

    const ratings = this.existingEvaluation.ratings || {};
    
    // 評価値をロード
    Object.keys(ratings).forEach(key => {
      const input = document.querySelector(`input[data-key="${key}"]`);
      if (input) {
        input.value = ratings[key];
        
        // ボタンの状態を更新
        const btn = document.querySelector(`[data-key="${key}"][data-value="${ratings[key]}"]`);
        if (btn) {
          btn.click();
        }
      }
    });

    // コメントをロード
    if (ratings.achievementComment) {
      document.getElementById('achievementComment').value = ratings.achievementComment;
    }
    if (ratings.improvementComment) {
      document.getElementById('improvementComment').value = ratings.improvementComment;
    }
    if (ratings.futureGoalComment) {
      document.getElementById('futureGoalComment').value = ratings.futureGoalComment;
    }

    this.validateForm();
  }

  collectEvaluationData() {
    const data = {};
    
    // 評価値を収集
    document.querySelectorAll('input[data-key]').forEach(input => {
      if (input.value) {
        data[input.dataset.key] = parseInt(input.value);
      }
    });

    // コメントを収集
    const achievementComment = document.getElementById('achievementComment')?.value.trim();
    const improvementComment = document.getElementById('improvementComment')?.value.trim();
    const futureGoalComment = document.getElementById('futureGoalComment')?.value.trim();

    if (achievementComment) data.achievementComment = achievementComment;
    if (improvementComment) data.improvementComment = improvementComment;
    if (futureGoalComment) data.futureGoalComment = futureGoalComment;

    return data;
  }

  async saveDraft() {
    try {
      const data = this.collectEvaluationData();
      await this.saveEvaluation('draft', data);
      this.app.showSuccess('下書きを保存しました');
    } catch (error) {
      console.error('Self evaluation: Draft save failed:', error);
      this.app.showError('下書きの保存に失敗しました');
    }
  }

  async submitSelfEvaluation() {
    if (!this.validateForm()) {
      this.app.showError('すべての項目を入力してください');
      return;
    }

    const confirmed = await this.app.confirm(
      '自己評価を評価者に送信しますか？送信後は編集できなくなります。',
      '自己評価送信確認'
    );

    if (!confirmed) return;

    try {
      const data = this.collectEvaluationData();
      await this.saveEvaluation('self_assessed', data);
      this.app.showSuccess('自己評価を評価者に送信しました');
      this.app.navigate('#/evaluations');
    } catch (error) {
      console.error('Self evaluation: Submit failed:', error);
      this.app.showError('自己評価の送信に失敗しました');
    }
  }

  async saveEvaluation(status, ratings) {
    const evaluationData = {
      id: this.existingEvaluation?.id,
      tenantId: this.currentUser.tenantId,
      targetUserId: this.currentUser.uid || this.currentUser.id,
      targetUserName: this.currentUser.name,
      targetUserEmail: this.currentUser.email,
      jobTypeId: this.currentUser.jobTypeId,
      periodId: this.selectedPeriod.id,
      periodName: this.selectedPeriod.name,
      evaluatorId: this.currentUser.evaluatorId,
      status: status,
      ratings: ratings,
      type: 'self_assessment',
      submittedAt: status === 'self_assessed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    const result = await this.app.api.saveEvaluation(evaluationData);
    
    if (result.success) {
      this.existingEvaluation = { ...evaluationData, id: result.id };
    }

    return result;
  }
}
