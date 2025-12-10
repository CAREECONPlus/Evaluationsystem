/**
 * Evaluation Form Page Component (完全実装版)
 * 評価フォームページコンポーネント
 */
import { DynamicContentTranslator } from '../services/dynamic-content-translator.js';

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
    this.isReadOnly = false;
    this.isDraft = false;
    this.contentTranslator = new DynamicContentTranslator(app);
    this.multilingualData = {
      categories: [],
      evaluationItems: [],
      jobTypes: []
    };
    this.currentLanguage = app.i18n.getCurrentLanguage();
  }

  async render() {
    return `
      <div class="evaluation-form-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 data-i18n="evaluations.form_title">評価入力フォーム</h1>
            <div class="evaluation-actions">
                <button id="save-draft-btn" class="btn btn-outline-secondary me-2" style="display:none;">
                    <i class="fas fa-save me-2"></i><span data-i18n="common.save_draft">下書き保存</span>
                </button>
                <button id="submit-evaluation-btn" class="btn btn-primary btn-lg" disabled>
                    <i class="fas fa-paper-plane me-2"></i><span data-i18n="common.submit">提出</span>
                </button>
            </div>
        </div>

        <!-- ステータス表示 -->
        <div id="evaluation-status" class="alert d-none mb-4"></div>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0" data-i18n="evaluations.target_info">評価対象情報</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="target-user-select" class="form-label" data-i18n="evaluations.target_user">評価対象者</label>
                        <select id="target-user-select" class="form-select">
                            <option value="" data-i18n="common.select">選択してください</option>
                        </select>
                        <div class="invalid-feedback">評価対象者を選択してください</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="period-select" class="form-label" data-i18n="evaluations.evaluation_period">評価期間</label>
                        <select id="period-select" class="form-select">
                            <option value="" data-i18n="common.select">選択してください</option>
                        </select>
                        <div class="invalid-feedback">評価期間を選択してください</div>
                    </div>
                </div>
                
                <!-- 対象者詳細情報 -->
                <div id="target-user-info" class="mt-3 p-3 bg-light rounded d-none">
                    <div class="row">
                        <div class="col-md-4">
                            <strong>氏名:</strong> <span id="target-user-name"></span>
                        </div>
                        <div class="col-md-4">
                            <strong>職種:</strong> <span id="target-user-job-type"></span>
                        </div>
                        <div class="col-md-4">
                            <strong>評価者:</strong> <span id="target-user-evaluator"></span>
                        </div>
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

  async init(params) {
    this.app.currentPage = this;

    // URLパラメータから評価IDを取得
    const evaluationId = params ? params.get('id') : null;

    await this.loadInitialData();

    // 既存の評価を読み込む
    if (evaluationId) {
      await this.loadExistingEvaluation(evaluationId);
    }

    this.setupEventListeners();
    this.app.i18n.updateUI();
  }

  async loadExistingEvaluation(evaluationId) {
    try {
      const evaluation = await this.app.api.getEvaluationById(evaluationId);

      if (!evaluation) {
        this.app.showError('評価が見つかりませんでした');
        this.app.navigate('#/evaluations');
        return;
      }

      // アクセス権限チェック
      const currentUser = this.app.currentUser;
      const canView = currentUser.role === 'admin' ||
                     evaluation.targetUserId === currentUser.uid ||
                     evaluation.evaluatorId === currentUser.uid;

      if (!canView) {
        this.app.showError('この評価を閲覧する権限がありません');
        this.app.navigate('#/evaluations');
        return;
      }

      this.existingEvaluation = evaluation;

      // 完了済みの場合は読み取り専用モード
      if (evaluation.status === 'completed') {
        this.isReadOnly = true;
      }

      // 対象者と期間を設定
      setTimeout(async () => {
        const targetUserSelect = document.getElementById('target-user-select');
        const periodSelect = document.getElementById('period-select');

        if (evaluation.targetUserId && targetUserSelect) {
          targetUserSelect.value = evaluation.targetUserId;
          targetUserSelect.disabled = true;
          targetUserSelect.dispatchEvent(new Event('change'));
        }

        if (evaluation.periodId && periodSelect) {
          // ユーザー選択後に期間を設定
          setTimeout(() => {
            periodSelect.value = evaluation.periodId;
            periodSelect.disabled = true;
            periodSelect.dispatchEvent(new Event('change'));

            // 評価データを復元
            if (evaluation.ratings) {
              setTimeout(() => {
                this.restoreEvaluationData(evaluation.ratings);
              }, 500);
            }
          }, 300);
        }
      }, 300);

    } catch (error) {
      console.error('Error loading existing evaluation:', error);
      this.app.showError('評価の読み込みに失敗しました');
    }
  }

  restoreEvaluationData(ratings) {
    // フォーム入力値を復元
    Object.keys(ratings).forEach(key => {
      const element = document.querySelector(`[data-evaluation-key="${key}"]`);
      if (element) {
        element.value = ratings[key];
      }
    });

    // バリデーションを実行
    this.validateForm();
  }

  async loadInitialData() {
    try {
      const currentUser = this.app.currentUser;
      
      // 並行でデータを取得
      const [usersData, settings, multilingualData] = await Promise.all([
        this.loadUsersData(currentUser),
        this.app.api.getSettings(),
        this.loadMultilingualData()
      ]);
      
      this.usersForEvaluation = usersData;
      this.periods = settings.periods;
      this.multilingualData = multilingualData;
      
      console.log("Loaded multilingual data:", this.multilingualData);
      
      this.renderUserSelect();
      this.renderPeriodSelect();
      
    } catch (error) {
      console.error("Error loading initial data:", error);
      this.app.showError("初期データの読み込みに失敗しました");
    }
  }

  /**
   * ユーザーデータの読み込み（権限に応じて）
   */
  async loadUsersData(currentUser) {
    try {
      // 権限に応じて評価対象者を取得
      if (currentUser.role === 'worker') {
        return [currentUser];
      } else if (currentUser.role === 'evaluator') {
        const subordinates = await this.app.api.getSubordinates();
        return [currentUser, ...subordinates];
      } else if (currentUser.role === 'admin') {
        return await this.app.api.getUsers('active');
      }
      return [currentUser];
    } catch (error) {
      console.error('Error loading users data:', error);
      return [currentUser];
    }
  }

  /**
   * 多言語データの読み込み
   */
  async loadMultilingualData() {
    try {
      if (this.app.api.multilingual) {
        const data = await this.app.api.multilingual.getAllI18nData(this.currentLanguage);
        return data;
      }
      return {
        categories: [],
        evaluationItems: [],
        jobTypes: [],
        evaluationPeriods: []
      };
    } catch (error) {
      console.error('Error loading multilingual data:', error);
      return {
        categories: [],
        evaluationItems: [],
        jobTypes: [],
        evaluationPeriods: []
      };
    }
  }

  renderUserSelect(filteredUserIds = null) {
    const select = document.getElementById('target-user-select');
    if (!select) return;

    // フィルタリングされたユーザーリストを使用
    let usersToShow = this.usersForEvaluation;
    if (filteredUserIds && filteredUserIds.length > 0) {
      usersToShow = this.usersForEvaluation.filter(user => filteredUserIds.includes(user.id));
    }

    select.innerHTML = `
      <option value="" data-i18n="common.select">選択してください</option>
      ${usersToShow.map(user =>
        `<option value="${user.id}">${this.app.sanitizeHtml(user.name)}</option>`
      ).join('')}
    `;

    // オプションがない場合のメッセージ
    if (usersToShow.length === 0) {
      select.innerHTML = `<option value="" disabled>この期間で評価可能なユーザーがいません</option>`;
    }
  }

  renderPeriodSelect() {
    const select = document.getElementById('period-select');
    if (!select) return;

    select.innerHTML = `
      <option value="" data-i18n="common.select">選択してください</option>
      ${(this.periods || []).map(period =>
        `<option value="${period.id}">${this.app.sanitizeHtml(period.name)}</option>`
      ).join('')}
    `;
  }

  setupEventListeners() {
    document.getElementById('target-user-select').addEventListener('change', () => this.onSelectionChange());
    document.getElementById('period-select').addEventListener('change', () => this.onPeriodChange());
    document.getElementById('submit-evaluation-btn').addEventListener('click', () => this.submitEvaluation());
    document.getElementById('save-draft-btn').addEventListener('click', () => this.saveDraft());
  }

  /**
   * 期間選択時の処理（未完了の評価のみフィルタリング）
   */
  async onPeriodChange() {
    const periodId = document.getElementById('period-select').value;
    const userSelect = document.getElementById('target-user-select');
    const previouslySelectedUserId = userSelect.value; // 現在選択されているユーザーIDを保存

    if (!periodId) {
      // 期間が未選択の場合は全ユーザーを表示
      this.renderUserSelect();
      userSelect.value = '';
      document.getElementById('evaluation-content').classList.add('d-none');
      document.getElementById('target-user-info').classList.add('d-none');
      document.getElementById('submit-evaluation-btn').disabled = true;
      return;
    }

    try {
      // この期間の全評価を取得
      const evaluations = await this.app.api.getEvaluations({ periodId: periodId });

      // 完了済み評価のユーザーIDリストを作成
      const completedUserIds = evaluations
        .filter(e => e.status === 'completed')
        .map(e => e.targetUserId);

      // 未完了または評価が存在しないユーザーのみをフィルタリング
      const availableUserIds = this.usersForEvaluation
        .filter(user => !completedUserIds.includes(user.id))
        .map(user => user.id);

      // ユーザーリストを更新
      this.renderUserSelect(availableUserIds);

      // 以前選択されていたユーザーが利用可能なリストに含まれている場合は選択を保持
      if (previouslySelectedUserId && availableUserIds.includes(previouslySelectedUserId)) {
        userSelect.value = previouslySelectedUserId;
      } else {
        // 以前の選択が利用できない場合のみクリア
        userSelect.value = '';
        document.getElementById('evaluation-content').classList.add('d-none');
        document.getElementById('target-user-info').classList.add('d-none');
        document.getElementById('submit-evaluation-btn').disabled = true;
      }

    } catch (error) {
      console.error('Error filtering users by period:', error);
      // エラー時は全ユーザーを表示
      this.renderUserSelect();
      // エラー時も以前の選択を保持しようと試みる
      if (previouslySelectedUserId) {
        userSelect.value = previouslySelectedUserId;
      }
    }

    // 選択変更処理を呼び出す
    this.onSelectionChange();
  }

  async onSelectionChange() {
    const userId = document.getElementById('target-user-select').value;
    const periodId = document.getElementById('period-select').value;

    if (!userId || !periodId) {
      document.getElementById('evaluation-content').classList.add('d-none');
      document.getElementById('target-user-info').classList.add('d-none');
      document.getElementById('submit-evaluation-btn').disabled = true;
      this.hideStatus();
      return;
    }

    this.targetUser = this.usersForEvaluation.find(u => u.id === userId);
    this.selectedPeriod = this.periods.find(p => p.id === periodId);

    // 対象者情報を表示
    this.renderTargetUserInfo();
    
    // バリデーション
    const validationResult = await this.validateUserForEvaluation();
    if (!validationResult.isValid) {
      this.showStatus(validationResult.message, 'warning');
      document.getElementById('evaluation-content').classList.add('d-none');
      document.getElementById('submit-evaluation-btn').disabled = true;
      return;
    }

    await this.loadEvaluationForm();
  }

  renderTargetUserInfo() {
    const infoDiv = document.getElementById('target-user-info');
    const jobType = this.usersForEvaluation.find(u => u.jobTypeId === this.targetUser.jobTypeId);
    const evaluator = this.usersForEvaluation.find(u => u.id === this.targetUser.evaluatorId);
    
    document.getElementById('target-user-name').textContent = this.targetUser.name;
    document.getElementById('target-user-job-type').textContent = jobType?.name || '未設定';
    document.getElementById('target-user-evaluator').textContent = evaluator?.name || '未設定';
    
    infoDiv.classList.remove('d-none');
  }

  async validateUserForEvaluation() {
    // 職種設定チェック
    if (!this.targetUser.jobTypeId) {
      return {
        isValid: false,
        message: '対象者に職種が設定されていません。管理者に連絡してください。'
      };
    }

    // 既存評価の重複チェック
    try {
      const existingEvaluations = await this.app.api.getEvaluations({
        targetUserId: this.targetUser.id,
        periodId: this.selectedPeriod.id
      });

      const duplicateEvaluation = existingEvaluations.find(evaluation => 
        evaluation.targetUserId === this.targetUser.id && 
        evaluation.periodId === this.selectedPeriod.id
      );

      if (duplicateEvaluation) {
        if (duplicateEvaluation.status === 'completed') {
          this.existingEvaluation = duplicateEvaluation;
          this.isReadOnly = true;
          return {
            isValid: true,
            message: 'この評価は既に完了しています。（閲覧モード）'
          };
        } else if (duplicateEvaluation.status === 'draft') {
          this.existingEvaluation = duplicateEvaluation;
          this.isDraft = true;
          return {
            isValid: true,
            message: '下書きが見つかりました。続きから編集できます。'
          };
        }
      }
    } catch (error) {
      console.error("Error checking existing evaluations:", error);
    }

    return { isValid: true, message: null };
  }

  async loadEvaluationForm() {
    try {
      // 評価構造を取得
      if (this.targetUser.jobTypeId) {
        this.evaluationStructure = await this.app.api.getEvaluationStructure(this.targetUser.jobTypeId);
      }

      // 個人目標を取得
      const goals = await this.app.api.getGoals(this.targetUser.id, this.selectedPeriod.id);
      this.qualitativeGoals = goals?.goals || [];

      this.renderEvaluationForm();
      document.getElementById('evaluation-content').classList.remove('d-none');
      
      // ボタンの状態設定
      if (this.isReadOnly) {
        document.getElementById('submit-evaluation-btn').style.display = 'none';
        document.getElementById('save-draft-btn').style.display = 'none';
        this.showStatus('この評価は完了済みです。', 'info');
      } else {
        document.getElementById('submit-evaluation-btn').disabled = false;
        document.getElementById('save-draft-btn').style.display = 'inline-block';
        
        if (this.isDraft) {
          this.showStatus('下書きから復元しました。', 'info');
        }
      }

    } catch (error) {
      console.error("Error loading evaluation form:", error);
      this.app.showError("評価フォームの読み込みに失敗しました");
    }
  }

  renderEvaluationForm() {
    const container = document.getElementById('evaluation-content');
    const isSelfEvaluation = this.targetUser.id === this.app.currentUser.uid;

    let formHTML = '<div class="row">';

    // 定量的評価セクション
    if (this.evaluationStructure && this.evaluationStructure.categories) {
      formHTML += `
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-chart-bar me-2"></i>定量的評価
              </h5>
            </div>
            <div class="card-body">
              ${this.renderQuantitativeSection(isSelfEvaluation)}
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
              <h5 class="mb-0">
                <i class="fas fa-bullseye me-2"></i>目標達成度評価
              </h5>
            </div>
            <div class="card-body">
              ${this.renderQualitativeSection(isSelfEvaluation)}
            </div>
          </div>
        </div>
      `;
    } else {
      formHTML += `
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-bullseye me-2"></i>目標達成度評価
              </h5>
            </div>
            <div class="card-body">
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                評価対象の目標が設定されていません。
              </div>
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
          <h5 class="mb-0">
            <i class="fas fa-comment me-2"></i>総合コメント
          </h5>
        </div>
        <div class="card-body">
          ${this.renderCommentSection(isSelfEvaluation)}
        </div>
      </div>
    `;

    container.innerHTML = formHTML;
    this.loadExistingData();
    this.setupFormValidation();
  }

  renderQuantitativeSection(isSelfEvaluation) {
    let html = '<div class="table-responsive"><table class="table table-sm">';
    html += '<thead><tr><th style="width: 25%;">カテゴリ</th><th style="width: 35%;">評価項目</th>';
    
    if (isSelfEvaluation) {
      html += '<th style="width: 40%;">自己評価</th>';
    } else {
      html += '<th style="width: 20%;">自己評価</th><th style="width: 20%;">評価者評価</th>';
    }
    html += '</tr></thead><tbody>';

    this.evaluationStructure.categories.forEach((category, catIndex) => {
      category.items.forEach((item, itemIndex) => {
        const key = `quant_${catIndex}_${itemIndex}`;
        html += `
          <tr>
            <td><small class="fw-bold">${this.app.sanitizeHtml(category.name)}</small></td>
            <td><small>${this.app.sanitizeHtml(item.name)}</small></td>
        `;
        
        if (isSelfEvaluation) {
          html += `
            <td>
              <select class="form-select form-select-sm evaluation-input" data-evaluation-key="${key}_self" ${this.isReadOnly ? 'disabled' : ''} required>
                <option value="">選択してください</option>
                ${[1,2,3,4,5].map(n => `<option value="${n}">${n} - ${this.getScoreLabel(n)}</option>`).join('')}
              </select>
            </td>
          `;
        } else {
          html += `
            <td>
              <select class="form-select form-select-sm" data-evaluation-key="${key}_self" disabled>
                <option value="">-</option>
                ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
              </select>
            </td>
            <td>
              <select class="form-select form-select-sm evaluation-input" data-evaluation-key="${key}_evaluator" ${this.isReadOnly ? 'disabled' : ''} required>
                <option value="">選択してください</option>
                ${[1,2,3,4,5].map(n => `<option value="${n}">${n} - ${this.getScoreLabel(n)}</option>`).join('')}
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

  getScoreLabel(score) {
    const labels = {
      1: '要改善',
      2: '基準以下', 
      3: '標準',
      4: '良好',
      5: '優秀'
    };
    return labels[score] || '';
  }

  renderQualitativeSection(isSelfEvaluation) {
    let html = '<div class="table-responsive"><table class="table table-sm">';
    html += '<thead><tr><th style="width: 50%;">目標</th><th style="width: 15%;">ウェイト</th>';
    
    if (isSelfEvaluation) {
      html += '<th style="width: 35%;">自己評価</th>';
    } else {
      html += '<th style="width: 17.5%;">自己評価</th><th style="width: 17.5%;">評価者評価</th>';
    }
    html += '</tr></thead><tbody>';

    this.qualitativeGoals.forEach((goal, index) => {
      const key = `qual_${index}`;
      html += `
        <tr>
          <td><small>${this.app.sanitizeHtml(goal.text)}</small></td>
          <td><small class="fw-bold">${goal.weight}%</small></td>
      `;
      
      if (isSelfEvaluation) {
        html += `
          <td>
            <select class="form-select form-select-sm evaluation-input" data-evaluation-key="${key}_self" ${this.isReadOnly ? 'disabled' : ''} required>
              <option value="">選択してください</option>
              ${[1,2,3,4,5].map(n => `<option value="${n}">${n} - ${this.getAchievementLabel(n)}</option>`).join('')}
            </select>
          </td>
        `;
      } else {
        html += `
          <td>
            <select class="form-select form-select-sm" data-evaluation-key="${key}_self" disabled>
              <option value="">-</option>
              ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </td>
          <td>
            <select class="form-select form-select-sm evaluation-input" data-evaluation-key="${key}_evaluator" ${this.isReadOnly ? 'disabled' : ''} required>
              <option value="">選択してください</option>
              ${[1,2,3,4,5].map(n => `<option value="${n}">${n} - ${this.getAchievementLabel(n)}</option>`).join('')}
            </select>
          </td>
        `;
      }
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  }

  getAchievementLabel(score) {
    const labels = {
      1: '未達成',
      2: '一部達成',
      3: '概ね達成',
      4: '達成',
      5: '大幅達成'
    };
    return labels[score] || '';
  }

  renderCommentSection(isSelfEvaluation) {
    let html = '';
    
    if (isSelfEvaluation) {
      html += `
        <div class="mb-3">
          <label class="form-label fw-bold">自己評価コメント</label>
          <textarea class="form-control evaluation-input" rows="4" data-evaluation-key="comment_self" 
                    placeholder="今期の振り返り、頑張った点、改善したい点などを記入してください..." 
                    ${this.isReadOnly ? 'disabled' : ''}></textarea>
          <small class="form-text text-muted">※ 具体的なエピソードを交えて記入してください</small>
        </div>
      `;
    } else {
      html += `
        <div class="mb-3">
          <label class="form-label fw-bold">自己評価コメント</label>
          <textarea class="form-control" rows="3" data-evaluation-key="comment_self" disabled 
                    placeholder="対象者の自己評価コメントが表示されます"></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label fw-bold">評価者コメント</label>
          <textarea class="form-control evaluation-input" rows="4" data-evaluation-key="comment_evaluator" 
                    placeholder="評価対象者の成果、強み、改善点、今後の期待などを記入してください..." 
                    ${this.isReadOnly ? 'disabled' : ''}></textarea>
          <small class="form-text text-muted">※ 建設的なフィードバックを心がけてください</small>
        </div>
      `;
    }
    
    return html;
  }

  setupFormValidation() {
    // リアルタイムバリデーション
    document.querySelectorAll('.evaluation-input').forEach(input => {
      input.addEventListener('change', () => this.validateForm());
      input.addEventListener('input', () => this.validateForm());
    });
  }

  validateForm() {
    const requiredInputs = document.querySelectorAll('.evaluation-input[required]');
    let isValid = true;
    let completedCount = 0;

    requiredInputs.forEach(input => {
      if (!input.value) {
        isValid = false;
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
        completedCount++;
      }
    });

    // 進捗表示
    const progressPercent = requiredInputs.length > 0 ? (completedCount / requiredInputs.length) * 100 : 100;
    
    const submitBtn = document.getElementById('submit-evaluation-btn');
    if (submitBtn && !this.isReadOnly) {
      submitBtn.disabled = !isValid;
      
      if (progressPercent < 100) {
        submitBtn.innerHTML = `<i class="fas fa-paper-plane me-2"></i>提出 (${Math.round(progressPercent)}%完了)`;
      } else {
        submitBtn.innerHTML = `<i class="fas fa-paper-plane me-2"></i>提出`;
      }
    }

    return isValid;
  }

  loadExistingData() {
    if (!this.existingEvaluation || !this.existingEvaluation.ratings) return;
    
    const ratings = this.existingEvaluation.ratings;
    
    // すべての評価要素に既存データをロード
    document.querySelectorAll('[data-evaluation-key]').forEach(element => {
      const key = element.dataset.evaluationKey;
      if (ratings[key] !== undefined) {
        element.value = ratings[key];
      }
    });

    // バリデーション実行
    this.validateForm();
  }

  collectEvaluationData() {
    const data = {};
    
    document.querySelectorAll('[data-evaluation-key]').forEach(element => {
      const key = element.dataset.evaluationKey;
      const value = element.value.trim();
      if (value) {
        data[key] = element.tagName === 'SELECT' ? parseInt(value) : value;
      }
    });
    
    this.evaluationData = data;
    return data;
  }

  async saveDraft() {
    if (this.isReadOnly) return;

    const data = this.collectEvaluationData();
    await this.saveEvaluationWithStatus('draft');
    this.app.showSuccess('下書きを保存しました');
  }

  async submitEvaluation() {
    if (this.isReadOnly) return;
    
    if (!this.validateForm()) {
      this.app.showError('未入力の項目があります。すべて入力してから提出してください。');
      return;
    }

    if (!confirm(this.app.i18n.t('evaluations.confirm_submit'))) return;

    this.collectEvaluationData();

    const currentUser = this.app.currentUser;
    const isSelfEvaluation = this.targetUser.id === currentUser.uid;
    
    // ステータス決定ロジック
    let status = 'completed';
    if (isSelfEvaluation) {
        status = 'self_assessed';
    } else if (this.app.hasAnyRole(['evaluator'])) {
        status = 'pending_approval';
    } else if (this.app.hasRole('admin')) {
        status = 'completed';
    }

    await this.saveEvaluationWithStatus(status);
    
    this.app.showSuccess('評価を提出しました');
    this.app.navigate('#/evaluations');
  }

  async saveEvaluationWithStatus(status) {
    const currentUser = this.app.currentUser;
    const isSelfEvaluation = this.targetUser.id === currentUser.uid;

    const data = {
        id: this.existingEvaluation?.id,
        tenantId: currentUser.tenantId,
        targetUserId: this.targetUser.id,
        targetUserName: this.targetUser.name,
        targetUserEmail: this.targetUser.email,
        jobTypeId: this.targetUser.jobTypeId,
        periodId: this.selectedPeriod.id,
        periodName: this.selectedPeriod.name,
        evaluatorId: isSelfEvaluation ? this.targetUser.evaluatorId : currentUser.uid,
        evaluatorName: isSelfEvaluation ? 
            (this.usersForEvaluation.find(u => u.id === this.targetUser.evaluatorId)?.name || '') : 
            currentUser.name,
        ratings: this.evaluationData,
        status: status,
        submittedAt: this.app.api.serverTimestamp(),
        updatedAt: this.app.api.serverTimestamp()
    };

    const btn = document.getElementById('submit-evaluation-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${this.app.i18n.t('common.loading')}`;
    }

    try {
        await this.app.api.saveEvaluation(data);
    } catch (error) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-paper-plane me-2"></i><span data-i18n="common.submit"></span>`;
            this.app.i18n.updateUI(btn);
        }
        throw error;
    }
  }

  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('evaluation-status');
    statusDiv.className = `alert alert-${type}`;
    statusDiv.innerHTML = `<i class="fas fa-info-circle me-2"></i>${message}`;
    statusDiv.classList.remove('d-none');
  }

  hideStatus() {
    const statusDiv = document.getElementById('evaluation-status');
    statusDiv.classList.add('d-none');
  }

  // ページから離れる際のチェック
  hasUnsavedChanges() {
    if (this.isReadOnly) return false;
    
    const inputs = document.querySelectorAll('.evaluation-input');
    for (let input of inputs) {
      if (input.value.trim()) {
        return true;
      }
    }
    return false;
  }
}
