/**
 * Evaluation Form Page Component (完全実装版)
 * 評価フォームページコンポーネント
 */
export class EvaluationFormPage {
  constructor(app) {
    this.app = app;
    this.evaluationData = {};
    this.targetUser = null;
    this.selectedPeriod = null;
    this.evaluationStructure = null;
    this.qualitativeGoals = [];
    this.usersForEvaluation = [];
    this.periods = [];
    this.existingEvaluation = null;
  }

  async render() {
    return `
      <div class="evaluation-form-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 data-i18n="evaluations.form_title"></h1>
            <button id="submit-eval-btn" class="btn btn-primary btn-lg" disabled>
                <i class="fas fa-paper-plane me-2"></i><span data-i18n="common.submit"></span>
            </button>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h5 class="mb-0" data-i18n="evaluations.target_info"></h5></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="target-user-select" class="form-label" data-i18n="evaluations.target_user"></label>
                        <select id="target-user-select" class="form-select"></select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="period-select" class="form-label" data-i18n="evaluations.evaluation_period"></label>
                        <select id="period-select" class="form-select"></select>
                    </div>
                </div>
            </div>
        </div>
        <div id="evaluation-content" class="d-none">
            <!-- Evaluation form will be rendered here -->
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    await this.loadInitialData();
    this.setupEventListeners();
    this.app.i18n.updateUI();
  }

  async loadInitialData() {
    try {
      // 評価対象ユーザーと評価期間のリストを取得
      const currentUser = this.app.currentUser;
      
      if (currentUser.role === 'worker') {
        // 作業員は自分のみを評価対象とする
        this.usersForEvaluation = [currentUser];
      } else if (currentUser.role === 'evaluator') {
        // 評価者は自分と部下を評価対象とする
        const subordinates = await this.app.api.getSubordinates();
        this.usersForEvaluation = [currentUser, ...subordinates];
      } else if (currentUser.role === 'admin') {
        // 管理者は全ユーザーを評価対象とする
        this.usersForEvaluation = await this.app.api.getUsers('active');
      }

      // 評価期間を取得
      const settings = await this.app.api.getSettings();
      this.periods = settings.periods;
      
      this.renderUserSelect();
      this.renderPeriodSelect();
    } catch (error) {
      console.error("Error loading initial data:", error);
      this.app.showError("初期データの読み込みに失敗しました");
    }
  }

  renderUserSelect() {
    const select = document.getElementById('target-user-select');
    select.innerHTML = `
      <option value="" data-i18n="common.select"></option>
      ${this.usersForEvaluation.map(user => 
        `<option value="${user.id}">${this.app.sanitizeHtml(user.name)}</option>`
      ).join('')}
    `;
  }

  renderPeriodSelect() {
    const select = document.getElementById('period-select');
    select.innerHTML = `
      <option value="" data-i18n="common.select"></option>
      ${this.periods.map(period => 
        `<option value="${period.id}">${this.app.sanitizeHtml(period.name)}</option>`
      ).join('')}
    `;
  }

  setupEventListeners() {
    document.getElementById('target-user-select').addEventListener('change', () => this.onSelectionChange());
    document.getElementById('period-select').addEventListener('change', () => this.onSelectionChange());
    document.getElementById('submit-eval-btn').addEventListener('click', () => this.submitEvaluation());
  }

  async onSelectionChange() {
    const userId = document.getElementById('target-user-select').value;
    const periodId = document.getElementById('period-select').value;

    if (!userId || !periodId) {
      document.getElementById('evaluation-content').classList.add('d-none');
      document.getElementById('submit-eval-btn').disabled = true;
      return;
    }

    this.targetUser = this.usersForEvaluation.find(u => u.id === userId);
    this.selectedPeriod = this.periods.find(p => p.id === periodId);

    await this.loadEvaluationForm();
  }

  async loadEvaluationForm() {
    try {
      // 既存の評価データを取得
      this.existingEvaluation = await this.app.api.getEvaluationById(
        this.targetUser.id, 
        this.selectedPeriod.id
      );

      // 評価構造を取得
      if (this.targetUser.jobTypeId) {
        this.evaluationStructure = await this.app.api.getEvaluationStructure(this.targetUser.jobTypeId);
      }

      // 個人目標を取得
      const goals = await this.app.api.getGoals(this.targetUser.id, this.selectedPeriod.id);
      this.qualitativeGoals = goals ? goals.goals : [];

      this.renderEvaluationForm();
      document.getElementById('evaluation-content').classList.remove('d-none');
      document.getElementById('submit-eval-btn').disabled = false;

    } catch (error) {
      console.error("Error loading evaluation form:", error);
      this.app.showError("評価フォームの読み込みに失敗しました");
    }
  }

  renderEvaluationForm() {
    const container = document.getElementById('evaluation-content');
    const isReadonly = this.existingEvaluation?.status === 'completed';
    const isSelfEvaluation = this.targetUser.id === this.app.currentUser.uid;

    let formHTML = '<div class="row">';

    // 定量的評価セクション
    if (this.evaluationStructure && this.evaluationStructure.categories) {
      formHTML += `
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">定量的評価</h5>
            </div>
            <div class="card-body">
              ${this.renderQuantitativeSection(isReadonly, isSelfEvaluation)}
            </div>
          </div>
        </div>
      `;
    }

    // 定性的評価（目標達成度）セクション
    if (this.qualitativeGoals.length > 0) {
      formHTML += `
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">目標達成度評価</h5>
            </div>
            <div class="card-body">
              ${this.renderQualitativeSection(isReadonly, isSelfEvaluation)}
            </div>
          </div>
        </div>
      `;
    }

    formHTML += '</div>';

    // 総合コメントセクション
    formHTML += `
      <div class="card mt-4">
        <div class="card-header">
          <h5 class="mb-0">総合コメント</h5>
        </div>
        <div class="card-body">
          ${this.renderCommentSection(isReadonly, isSelfEvaluation)}
        </div>
      </div>
    `;

    container.innerHTML = formHTML;
    this.loadExistingData();
  }

  renderQuantitativeSection(isReadonly, isSelfEvaluation) {
    let html = '<div class="table-responsive"><table class="table">';
    html += '<thead><tr><th>カテゴリ</th><th>評価項目</th>';
    
    if (isSelfEvaluation) {
      html += '<th>自己評価</th>';
    } else {
      html += '<th>自己評価</th><th>評価者評価</th>';
    }
    html += '</tr></thead><tbody>';

    this.evaluationStructure.categories.forEach((category, catIndex) => {
      category.items.forEach((item, itemIndex) => {
        const key = `quant_${catIndex}_${itemIndex}`;
        html += `
          <tr>
            <td>${this.app.sanitizeHtml(category.name)}</td>
            <td>${this.app.sanitizeHtml(item.name)}</td>
        `;
        
        if (isSelfEvaluation) {
          html += `
            <td>
              <select class="form-select form-select-sm" data-eval-key="${key}_self" ${isReadonly ? 'disabled' : ''}>
                <option value="">-</option>
                ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
              </select>
            </td>
          `;
        } else {
          html += `
            <td>
              <select class="form-select form-select-sm" data-eval-key="${key}_self" disabled>
                <option value="">-</option>
                ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
              </select>
            </td>
            <td>
              <select class="form-select form-select-sm" data-eval-key="${key}_evaluator" ${isReadonly ? 'disabled' : ''}>
                <option value="">-</option>
                ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
              </select>
            </td>
          `;
        }
        html += '</tr>';
      });
    });

    html += '</tbody></table></div>';
    return html;
  }

  renderQualitativeSection(isReadonly, isSelfEvaluation) {
    let html = '<div class="table-responsive"><table class="table">';
    html += '<thead><tr><th>目標</th><th>ウェイト</th>';
    
    if (isSelfEvaluation) {
      html += '<th>自己評価</th>';
    } else {
      html += '<th>自己評価</th><th>評価者評価</th>';
    }
    html += '</tr></thead><tbody>';

    this.qualitativeGoals.forEach((goal, index) => {
      const key = `qual_${index}`;
      html += `
        <tr>
          <td>${this.app.sanitizeHtml(goal.text)}</td>
          <td>${goal.weight}%</td>
      `;
      
      if (isSelfEvaluation) {
        html += `
          <td>
            <select class="form-select form-select-sm" data-eval-key="${key}_self" ${isReadonly ? 'disabled' : ''}>
              <option value="">-</option>
              ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </td>
        `;
      } else {
        html += `
          <td>
            <select class="form-select form-select-sm" data-eval-key="${key}_self" disabled>
              <option value="">-</option>
              ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </td>
          <td>
            <select class="form-select form-select-sm" data-eval-key="${key}_evaluator" ${isReadonly ? 'disabled' : ''}>
              <option value="">-</option>
              ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </td>
        `;
      }
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  }

  renderCommentSection(isReadonly, isSelfEvaluation) {
    let html = '';
    
    if (isSelfEvaluation) {
      html += `
        <div class="mb-3">
          <label class="form-label">自己評価コメント</label>
          <textarea class="form-control" rows="3" data-eval-key="comment_self" ${isReadonly ? 'disabled' : ''}></textarea>
        </div>
      `;
    } else {
      html += `
        <div class="mb-3">
          <label class="form-label">自己評価コメント</label>
          <textarea class="form-control" rows="3" data-eval-key="comment_self" disabled></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">評価者コメント</label>
          <textarea class="form-control" rows="3" data-eval-key="comment_evaluator" ${isReadonly ? 'disabled' : ''}></textarea>
        </div>
      `;
    }
    
    return html;
  }

  loadExistingData() {
    if (!this.existingEvaluation) return;
    
    const ratings = this.existingEvaluation.ratings || {};
    
    // すべての評価要素に既存データをロード
    document.querySelectorAll('[data-eval-key]').forEach(element => {
      const key = element.dataset.evalKey;
      if (ratings[key] !== undefined) {
        element.value = ratings[key];
      }
    });
  }

  collectEvaluationData() {
    const data = {};
    
    document.querySelectorAll('[data-eval-key]').forEach(element => {
      const key = element.dataset.evalKey;
      const value = element.value;
      if (value) {
        data[key] = element.tagName === 'SELECT' ? parseInt(value) : value;
      }
    });
    
    this.evaluationData = data;
  }

  async submitEvaluation() {
    if (!confirm(this.app.i18n.t('evaluations.confirm_submit'))) return;

    this.collectEvaluationData();

    const currentUser = this.app.currentUser;
    const isSelfEvaluation = this.targetUser.id === currentUser.uid;
    let status = this.existingEvaluation?.status || 'pending_submission';

    if (isSelfEvaluation) {
        status = 'self_assessed';
    } else if (this.app.hasAnyRole(['admin', 'evaluator'])) {
        status = 'pending_approval';
    }

    const data = {
        id: this.existingEvaluation?.id,
        tenantId: currentUser.tenantId,
        targetUserId: this.targetUser.id,
        targetUserName: this.targetUser.name,
        jobTypeId: this.targetUser.jobTypeId,
        periodId: this.selectedPeriod.id,
        periodName: this.selectedPeriod.name,
        evaluatorId: isSelfEvaluation ? this.targetUser.evaluatorId : currentUser.uid,
        evaluatorName: isSelfEvaluation ? 
            (this.usersForEvaluation.find(u => u.id === this.targetUser.evaluatorId)?.name || '') : 
            currentUser.name,
        ratings: this.evaluationData,
        status: status,
        submittedAt: this.app.api.serverTimestamp()
    };

    const btn = document.getElementById('submit-eval-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${this.app.i18n.t('common.loading')}`;

    try {
        await this.app.api.saveEvaluation(data);
        this.app.showSuccess(this.app.i18n.t('messages.save_success'));
        this.app.navigate('#/evaluations');
    } catch (e) {
        this.app.showError(e.message);
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane me-2"></i><span data-i18n="common.submit"></span>`;
        this.app.i18n.updateUI(btn);
    }
  }
}
