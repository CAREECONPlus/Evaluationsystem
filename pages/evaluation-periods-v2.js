/**
 * Evaluation Periods Management Page - 評価期間設定ページ
 * Phase 4: 新機能 - 既存システムに影響なし
 */

export class EvaluationPeriodsPage {
  constructor(app) {
    this.app = app;
    this.isInitialized = false;
    this.currentUser = null;
    this.periods = [];
    this.editingPeriodId = null;
  }

  /**
   * ページの初期化
   */
  async init() {
    try {
      console.log("Evaluation Periods: Initializing...");
      
      // 管理者権限チェック
      this.currentUser = await this.app.api.getCurrentUserData();
      if (!this.currentUser || this.currentUser.role !== 'admin') {
        throw new Error('管理者権限が必要です');
      }

      await this.loadPeriods();
      this.isInitialized = true;
      
      console.log("Evaluation Periods: Initialized successfully");
    } catch (error) {
      console.error("Evaluation Periods: Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * 評価期間データの読み込み
   */
  async loadPeriods() {
    try {
      // Phase 2 APIを使用
      this.periods = await this.app.api.getEvaluationPeriods();
      console.log("Evaluation Periods: Data loaded successfully");
    } catch (error) {
      console.error("Evaluation Periods: Failed to load data:", error);
      this.periods = [];
    }
  }

  /**
   * ページのレンダリング（統合版：基本設定・職種別設定・期間管理）
   */
  render() {
    return `
      <div class="evaluation-periods-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1">
            <i class="fas fa-calendar-alt me-2"></i>評価期間管理
          </h1>
          <p class="page-subtitle text-dark mb-0">評価サイクル・職種別設定・期間管理の統合管理</p>
        </div>

        <!-- タブナビゲーション -->
        <ul class="nav nav-tabs mb-4" id="evaluationPeriodsTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="basic-settings-tab" data-bs-toggle="tab" data-bs-target="#basic-settings" type="button" role="tab" aria-controls="basic-settings" aria-selected="true">
              <i class="fas fa-cog me-2"></i>基本設定
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="job-specific-tab" data-bs-toggle="tab" data-bs-target="#job-specific" type="button" role="tab" aria-controls="job-specific" aria-selected="false">
              <i class="fas fa-users-cog me-2"></i>職種別設定
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="period-management-tab" data-bs-toggle="tab" data-bs-target="#period-management" type="button" role="tab" aria-controls="period-management" aria-selected="false">
              <i class="fas fa-calendar-check me-2"></i>期間管理
            </button>
          </li>
        </ul>

        <!-- タブコンテンツ -->
        <div class="tab-content" id="evaluationPeriodsTabContent">

          <!-- 基本設定タブ -->
          <div class="tab-pane fade show active" id="basic-settings" role="tabpanel" aria-labelledby="basic-settings-tab">
            ${this.renderBasicSettingsTab()}
          </div>

          <!-- 職種別設定タブ -->
          <div class="tab-pane fade" id="job-specific" role="tabpanel" aria-labelledby="job-specific-tab">
            ${this.renderJobSpecificTab()}
          </div>

          <!-- 期間管理タブ -->
          <div class="tab-pane fade" id="period-management" role="tabpanel" aria-labelledby="period-management-tab">
            ${this.renderPeriodManagementTab()}
          </div>

        </div>
      </div>
    `;
  }

  /**
   * 基本設定タブのレンダリング
   */
  renderBasicSettingsTab() {
    return `
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">全社共通評価サイクル設定</h5>
            </div>
            <div class="card-body">
              <form id="basicSettingsForm">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">評価サイクル</label>
                    <select class="form-select" id="evaluationCycle" required>
                      <option value="">選択してください</option>
                      <option value="quarterly">四半期評価（3ヶ月）</option>
                      <option value="semi-annual">半期評価（6ヶ月）</option>
                      <option value="annual">年次評価（12ヶ月）</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">評価年度開始月</label>
                    <select class="form-select" id="fiscalYearStart" required>
                      <option value="1">1月</option>
                      <option value="4" selected>4月</option>
                      <option value="7">7月</option>
                      <option value="10">10月</option>
                    </select>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">評価開始猶予期間（日）</label>
                    <input type="number" class="form-control" id="gracePeriodStart" value="7" min="0" max="30">
                    <small class="form-text text-muted">期間開始前に評価を開始できる日数</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">評価終了猶予期間（日）</label>
                    <input type="number" class="form-control" id="gracePeriodEnd" value="7" min="0" max="30">
                    <small class="form-text text-muted">期間終了後も評価を受け付ける日数</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">デフォルト期間テンプレート</label>
                  <textarea class="form-control" id="periodTemplate" rows="3"
                    placeholder="例: {year}年度 第{quarter}四半期評価">2024年度 第1四半期評価</textarea>
                  <small class="form-text text-muted">新しい期間作成時のデフォルト名称パターン</small>
                </div>

                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-outline-secondary me-2" id="resetBasicSettings">リセット</button>
                  <button type="submit" class="btn btn-primary">基本設定を保存</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">設定プレビュー</h6>
            </div>
            <div class="card-body">
              <div id="settingsPreview">
                <p class="text-muted">左側で設定を選択すると、プレビューが表示されます。</p>
              </div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-header">
              <h6 class="mb-0">設定ガイド</h6>
            </div>
            <div class="card-body">
              <small class="text-muted">
                <strong>四半期評価:</strong> 3ヶ月ごとの頻繁な評価<br>
                <strong>半期評価:</strong> 6ヶ月ごとのバランス型<br>
                <strong>年次評価:</strong> 年1回の包括的な評価
              </small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 職種別設定タブのレンダリング
   */
  renderJobSpecificTab() {
    return `
      <div class="row">
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">職種選択</h5>
            </div>
            <div class="list-group list-group-flush" id="jobTypesList">
              <div class="list-group-item text-center text-muted p-4">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                読み込み中...
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">職種別評価期間設定</h5>
              <span class="badge bg-secondary" id="selectedJobTypeBadge">職種を選択</span>
            </div>
            <div class="card-body" id="jobSpecificSettings">
              <div class="text-center p-5 text-muted">
                <i class="fas fa-arrow-left fa-2x mb-3"></i>
                <p>左のリストから職種を選択して、個別の評価期間設定を行ってください。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 期間管理タブのレンダリング（既存の期間管理機能）
   */
  renderPeriodManagementTab() {
    return `

        <!-- 期間概要 -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">総期間数</h6>
                <h3 class="card-title mb-0 text-primary" id="totalPeriods">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">実施中</h6>
                <h3 class="card-title mb-0 text-success" id="activePeriods">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">完了</h6>
                <h3 class="card-title mb-0 text-info" id="completedPeriods">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">予定</h6>
                <h3 class="card-title mb-0 text-warning" id="scheduledPeriods">-</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 期間管理 -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">評価期間一覧</h5>
            <button class="btn btn-primary" id="addPeriodBtn">
              <i class="fas fa-plus me-1"></i>新しい期間を追加
            </button>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label">ステータスでフィルター</label>
                <select class="form-select" id="statusFilter">
                  <option value="">すべて</option>
                  <option value="active">実施中</option>
                  <option value="completed">完了</option>
                  <option value="scheduled">予定</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">タイプでフィルター</label>
                <select class="form-select" id="typeFilter">
                  <option value="">すべて</option>
                  <option value="quarterly">四半期</option>
                  <option value="semi-annual">半期</option>
                  <option value="annual">年次</option>
                </select>
              </div>
              <div class="col-md-4 d-flex align-items-end">
                <button class="btn btn-outline-secondary" id="refreshBtn">
                  <i class="fas fa-sync-alt me-1"></i>更新
                </button>
              </div>
            </div>

            <div id="periodsList">
              <!-- 期間リストがここに表示されます -->
            </div>
          </div>
        </div>

        <!-- 期間追加/編集モーダル -->
        <div class="modal fade" id="periodModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="periodModalTitle">新しい評価期間</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="periodForm">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">期間名 <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="periodName" required>
                      <div class="form-text">例: 2024年第1四半期評価</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">タイプ <span class="text-danger">*</span></label>
                      <select class="form-select" id="periodType" required>
                        <option value="">選択してください</option>
                        <option value="quarterly">四半期</option>
                        <option value="semi-annual">半期</option>
                        <option value="annual">年次</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">開始日 <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" id="startDate" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">終了日 <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" id="endDate" required>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">ステータス</label>
                      <select class="form-select" id="periodStatus">
                        <option value="scheduled">予定</option>
                        <option value="active">実施中</option>
                        <option value="completed">完了</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">期間日数</label>
                      <input type="text" class="form-control" id="periodDuration" readonly>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">説明</label>
                    <textarea class="form-control" id="periodDescription" rows="3" 
                              placeholder="この評価期間に関する説明や特記事項"></textarea>
                  </div>

                  <!-- 評価期間の自動設定 -->
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    開始日・終了日を設定すると、期間日数が自動計算されます。
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-danger me-auto d-none" onclick="window.app.router.currentPageInstance.confirmDeletePeriod()">
                  <i class="fas fa-trash me-1"></i>削除
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                <button type="submit" class="btn btn-primary" form="periodForm">
                  <span class="submit-text">保存</span>
                  <span class="spinner-border spinner-border-sm ms-2 d-none" role="status"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
    `;
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // 期間追加ボタン
    const addPeriodBtn = document.getElementById('addPeriodBtn');
    if (addPeriodBtn) {
      addPeriodBtn.addEventListener('click', () => this.showAddPeriodModal());
    }

    // 期間フォーム送信
    const periodForm = document.getElementById('periodForm');
    if (periodForm) {
      periodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePeriod();
      });
    }

    // 更新ボタン
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }

    // フィルター変更
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');

    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterPeriods());
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', () => this.filterPeriods());
    }

    // 日付変更で期間計算
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    if (startDate && endDate) {
      startDate.addEventListener('change', () => this.calculateDuration());
      endDate.addEventListener('change', () => this.calculateDuration());
    }

    // 基本設定フォーム
    const basicSettingsForm = document.getElementById('basicSettingsForm');
    if (basicSettingsForm) {
      basicSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveBasicSettings();
      });
    }

    // 基本設定のリセットボタン
    const resetBasicSettings = document.getElementById('resetBasicSettings');
    if (resetBasicSettings) {
      resetBasicSettings.addEventListener('click', () => {
        this.resetBasicSettings();
      });
    }
  }

  /**
   * 統計の更新
   */
  updateStatistics() {
    const stats = this.calculateStatistics();
    
    document.getElementById('totalPeriods').textContent = stats.total;
    document.getElementById('activePeriods').textContent = stats.active;
    document.getElementById('completedPeriods').textContent = stats.completed;
    document.getElementById('scheduledPeriods').textContent = stats.scheduled;
  }

  /**
   * 統計の計算
   */
  calculateStatistics() {
    return {
      total: this.periods.length,
      active: this.periods.filter(p => p.status === 'active').length,
      completed: this.periods.filter(p => p.status === 'completed').length,
      scheduled: this.periods.filter(p => p.status === 'scheduled').length
    };
  }

  /**
   * 期間リストの表示
   */
  renderPeriodsList() {
    const container = document.getElementById('periodsList');
    if (!container) return;

    const filteredPeriods = this.getFilteredPeriods();
    
    if (filteredPeriods.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="fas fa-calendar fa-3x mb-3"></i>
          <p>評価期間が登録されていません</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>期間名</th>
              <th>タイプ</th>
              <th>期間</th>
              <th>日数</th>
              <th>ステータス</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPeriods.map(period => `
              <tr>
                <td>
                  <strong>${period.name}</strong>
                  ${period.description ? `<br><small class="text-muted">${period.description}</small>` : ''}
                </td>
                <td>
                  <span class="badge bg-info">${this.getTypeLabel(period.type)}</span>
                </td>
                <td>
                  <small>
                    ${this.formatDate(period.startDate)}<br>
                    ～ ${this.formatDate(period.endDate)}
                  </small>
                </td>
                <td>${this.calculatePeriodDuration(period.startDate, period.endDate)}日</td>
                <td>
                  <span class="badge ${this.getStatusBadgeClass(period.status)}">
                    ${this.getStatusLabel(period.status)}
                  </span>
                </td>
                <td>
                  <button class="btn btn-outline-primary btn-sm me-1" onclick="window.app.router.currentPageInstance.editPeriod('${period.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm" onclick="window.app.router.currentPageInstance.confirmDeletePeriod('${period.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * フィルター適用
   */
  getFilteredPeriods() {
    const statusFilter = document.getElementById('statusFilter')?.value;
    const typeFilter = document.getElementById('typeFilter')?.value;

    return this.periods.filter(period => {
      const matchesStatus = !statusFilter || period.status === statusFilter;
      const matchesType = !typeFilter || period.type === typeFilter;
      return matchesStatus && matchesType;
    });
  }

  /**
   * 期間フィルターの適用
   */
  filterPeriods() {
    this.renderPeriodsList();
  }

  /**
   * 期間追加モーダルの表示
   */
  showAddPeriodModal() {
    this.editingPeriodId = null;
    document.getElementById('periodModalTitle').textContent = '新しい評価期間';

    // 削除ボタンを非表示（新規追加時）
    const deleteBtn = document.querySelector('#periodModal .btn-outline-danger');
    if (deleteBtn) deleteBtn.style.display = 'none';

    document.getElementById('periodForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('periodModal'));
    modal.show();
  }

  /**
   * 期間編集
   */
  editPeriod(periodId) {
    const period = this.periods.find(p => p.id === periodId);
    if (!period) return;

    this.editingPeriodId = periodId;
    document.getElementById('periodModalTitle').textContent = '評価期間の編集';

    // 削除ボタンを表示（編集時）
    const deleteBtn = document.querySelector('#periodModal .btn-outline-danger');
    if (deleteBtn) deleteBtn.style.display = 'inline-block';

    // フォームにデータを設定
    document.getElementById('periodName').value = period.name || '';
    document.getElementById('periodType').value = period.type || '';
    document.getElementById('startDate').value = this.formatDateForInput(period.startDate);
    document.getElementById('endDate').value = this.formatDateForInput(period.endDate);
    document.getElementById('periodStatus').value = period.status || 'scheduled';
    document.getElementById('periodDescription').value = period.description || '';

    this.calculateDuration();

    const modal = new bootstrap.Modal(document.getElementById('periodModal'));
    modal.show();
  }

  /**
   * 期間の保存
   */
  async savePeriod() {
    const form = document.getElementById('periodForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const periodData = {
      name: document.getElementById('periodName').value,
      type: document.getElementById('periodType').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      status: document.getElementById('periodStatus').value,
      description: document.getElementById('periodDescription').value || ''
    };

    try {
      const submitBtn = document.querySelector('#periodModal .btn-primary');
      const spinner = submitBtn.querySelector('.spinner-border');
      const submitText = submitBtn.querySelector('.submit-text');

      submitBtn.disabled = true;
      spinner.classList.remove('d-none');
      submitText.textContent = '保存中...';

      if (this.editingPeriodId) {
        // 更新処理（将来実装）
        await this.app.api.updateEvaluationPeriod(this.editingPeriodId, periodData);
        console.log('Evaluation Periods: Period updated:', this.editingPeriodId);
      } else {
        // 新規追加 - Firebase APIを使用
        await this.app.api.saveEvaluationPeriod(periodData);
        console.log('Evaluation Periods: New period saved to Firebase');
      }

      // データの再読み込み
      await this.loadPeriods();
      this.renderPeriodsList();
      this.updateStatistics();

      // モーダルを閉じる
      const modal = bootstrap.Modal.getInstance(document.getElementById('periodModal'));
      modal.hide();

      this.app.showSuccess('評価期間を保存しました');

    } catch (error) {
      console.error('Evaluation Periods: Failed to save period:', error);
      this.app.showError('評価期間の保存に失敗しました: ' + error.message);
    } finally {
      const submitBtn = document.querySelector('#periodModal .btn-primary');
      const spinner = submitBtn.querySelector('.spinner-border');
      const submitText = submitBtn.querySelector('.submit-text');

      submitBtn.disabled = false;
      spinner.classList.add('d-none');
      submitText.textContent = '保存';
    }
  }

  /**
   * 期間削除の確認
   */
  confirmDeletePeriod(periodId = null) {
    const targetId = periodId || this.editingPeriodId;
    if (!targetId) return;

    const period = this.periods.find(p => p.id === targetId);
    if (!period) return;

    this.editingPeriodId = targetId;

    if (confirm(`評価期間「${period.name}」を削除してもよろしいですか？\n\n※この操作は取り消せません。`)) {
      this.deletePeriod();
    }
  }

  /**
   * 期間削除
   */
  async deletePeriod() {
    try {
      // Firebase APIを使用した削除処理（将来実装）
      // await this.app.api.deleteEvaluationPeriod(this.editingPeriodId);

      // 現在はローカル配列から削除
      this.periods = this.periods.filter(p => p.id !== this.editingPeriodId);

      this.renderPeriodsList();
      this.updateStatistics();

      // モーダルを閉じる
      const periodModal = bootstrap.Modal.getInstance(document.getElementById('periodModal'));
      if (periodModal) periodModal.hide();

      this.app.showSuccess('評価期間を削除しました');

    } catch (error) {
      console.error('Evaluation Periods: Failed to delete period:', error);
      this.app.showError('評価期間の削除に失敗しました: ' + error.message);
    }
  }

  /**
   * データの更新
   */
  async refreshData() {
    try {
      await this.loadPeriods();
      this.renderPeriodsList();
      this.updateStatistics();
      console.log('Evaluation Periods: Data refreshed');
    } catch (error) {
      console.error('Evaluation Periods: Failed to refresh data:', error);
    }
  }

  /**
   * 期間計算
   */
  calculateDuration() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      document.getElementById('periodDuration').value = `${diffDays}日`;
    }
  }

  /**
   * 期間計算（データ用）
   */
  calculatePeriodDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 今四半期設定
   */
  setCurrentQuarter() {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const year = now.getFullYear();
    
    const startMonth = quarter * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);

    document.getElementById('startDate').value = this.formatDateForInput(startDate);
    document.getElementById('endDate').value = this.formatDateForInput(endDate);
    document.getElementById('periodName').value = `${year}年第${quarter + 1}四半期評価`;
    document.getElementById('periodType').value = 'quarterly';
    
    this.calculateDuration();
  }

  /**
   * 次四半期設定
   */
  setNextQuarter() {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const nextQuarter = (quarter + 1) % 4;
    const year = nextQuarter === 0 ? now.getFullYear() + 1 : now.getFullYear();
    
    const startMonth = nextQuarter * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);

    document.getElementById('startDate').value = this.formatDateForInput(startDate);
    document.getElementById('endDate').value = this.formatDateForInput(endDate);
    document.getElementById('periodName').value = `${year}年第${nextQuarter + 1}四半期評価`;
    document.getElementById('periodType').value = 'quarterly';
    
    this.calculateDuration();
  }

  /**
   * 今年度設定
   */
  setCurrentYear() {
    const now = new Date();
    const year = now.getFullYear();
    
    const startDate = new Date(year, 3, 1); // 4月1日
    const endDate = new Date(year + 1, 2, 31); // 3月31日

    document.getElementById('startDate').value = this.formatDateForInput(startDate);
    document.getElementById('endDate').value = this.formatDateForInput(endDate);
    document.getElementById('periodName').value = `${year}年度評価`;
    document.getElementById('periodType').value = 'annual';
    
    this.calculateDuration();
  }

  /**
   * ユーティリティメソッド
   */
  getTypeLabel(type) {
    const typeMap = {
      'quarterly': '四半期',
      'semi-annual': '半期',
      'annual': '年次'
    };
    return typeMap[type] || type;
  }

  getStatusLabel(status) {
    const statusMap = {
      'scheduled': '予定',
      'active': '実施中',
      'completed': '完了'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status) {
    const classMap = {
      'scheduled': 'bg-warning',
      'active': 'bg-success',
      'completed': 'bg-info'
    };
    return classMap[status] || 'bg-secondary';
  }

  formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP');
  }

  formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * ページの表示後処理
   */
  async postRender() {
    try {
      // ルーターが既にinit()を呼び出しているため、ここでは呼び出さない
      this.setupEventListeners();
      this.updateStatistics();
      this.renderPeriodsList();

      // グローバル参照を設定
      window.evaluationPeriodsPage = this;

      console.log("Evaluation Periods: Page rendered successfully");
    } catch (error) {
      console.error("Evaluation Periods: Failed to post-render:", error);
      this.app.showError('ページの初期化に失敗しました');
    }
  }

  /**
   * 基本設定の保存
   */
  async saveBasicSettings() {
    try {
      const basicSettings = {
        evaluationCycle: document.getElementById('evaluationCycle').value,
        fiscalYearStart: parseInt(document.getElementById('fiscalYearStart').value),
        gracePeriodStart: parseInt(document.getElementById('gracePeriodStart').value),
        gracePeriodEnd: parseInt(document.getElementById('gracePeriodEnd').value),
        periodTemplate: document.getElementById('periodTemplate').value
      };

      console.log('Evaluation Periods: Saving basic settings:', basicSettings);

      // 将来実装: Firebase APIで保存
      // await this.app.api.saveEvaluationSettings(basicSettings);

      this.app.showSuccess('基本設定を保存しました');

    } catch (error) {
      console.error('Evaluation Periods: Failed to save basic settings:', error);
      this.app.showError('基本設定の保存に失敗しました: ' + error.message);
    }
  }

  /**
   * 基本設定のリセット
   */
  resetBasicSettings() {
    document.getElementById('evaluationCycle').value = '';
    document.getElementById('fiscalYearStart').value = '4';
    document.getElementById('gracePeriodStart').value = '7';
    document.getElementById('gracePeriodEnd').value = '7';
    document.getElementById('periodTemplate').value = '2024年度 第1四半期評価';

    this.app.showSuccess('基本設定をリセットしました');
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    this.isInitialized = false;
    this.editingPeriodId = null;
    // グローバル参照をクリア
    if (window.evaluationPeriodsPage === this) {
      window.evaluationPeriodsPage = null;
    }
  }
}

// グローバル参照用
window.evaluationPeriodsPage = null;

// ページインスタンスの設定
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.router && window.app.router.currentPageInstance) {
      window.evaluationPeriodsPage = window.app.router.currentPageInstance;
    }
  });
}