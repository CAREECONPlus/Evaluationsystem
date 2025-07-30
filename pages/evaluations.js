/**
 * Evaluations Page Component
 * 評価一覧ページコンポーネント
 */
class EvaluationsPage {
  constructor(app) {
    this.app = app;
    this.allEvaluations = [];
    this.filteredEvaluations = [];
    this.selectedTab = 'pending'; // デフォルトは「承認待ち」タブ
  }

  /**
   * ページ全体のHTMLをレンダリング
   */
  async render() {
    const isAdmin = this.app.hasRole('admin');
    
    return `
      <div class="evaluations-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="nav.evaluations"></h1>
          <button class="btn btn-primary" onclick="window.app.navigate('/evaluation-form')">
            <i class="fas fa-plus me-1"></i>
            <span data-i18n="evaluations.new_evaluation"></span>
          </button>
        </div>

        ${isAdmin ? `
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" id="pending-tab" onclick="window.app.currentPage.switchTab('pending')">
              <span data-i18n="status.pending_approval"></span>
              <span class="badge bg-warning ms-1" id="pendingCount">0</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="completed-tab" onclick="window.app.currentPage.switchTab('completed')">
              <span data-i18n="status.completed"></span>
            </button>
          </li>
        </ul>
        ` : ''}
        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive" id="evaluationsTableContainer">
              </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * ページの初期化処理
   */
  async init() {
    this.app.currentPage = this;

    if (!this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }
    
    await this.loadEvaluations();
    
    // 管理者でない場合は、完了済みの評価のみ表示
    if (!this.app.hasRole('admin')) {
      this.selectedTab = 'completed';
    }

    this.filterAndRender();
    this.app.i18n.updateUI();
  }
  
  /**
   * APIから評価データを読み込む
   */
  async loadEvaluations() {
    const tableContainer = document.getElementById("evaluationsTableContainer");
    if (tableContainer) tableContainer.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>`;
    
    try {
      this.allEvaluations = await this.app.api.getEvaluations();
    } catch (e) {
      console.error("Error loading evaluations:", e);
      if (tableContainer) tableContainer.innerHTML = `<div class="text-center text-danger p-5">${this.app.i18n.t("errors.loading_failed")}</div>`;
    }
  }

  /**
   * 選択中のタブに応じて評価をフィルタリングして表示
   */
  filterAndRender() {
    // 役割に応じて表示する評価をフィルタリング
    if (this.app.hasRole('admin')) {
      this.filteredEvaluations = this.allEvaluations.filter(e => e.status === this.selectedTab);
      // 承認待ち件数を更新
      const pendingCount = this.allEvaluations.filter(e => e.status === 'pending').length;
      const pendingCountEl = document.getElementById('pendingCount');
      if (pendingCountEl) pendingCountEl.textContent = pendingCount;
    } else {
      // 管理者以外は自分の評価のみ表示
      this.filteredEvaluations = this.allEvaluations.filter(e => e.employeeId === this.app.currentUser.id);
    }
    this.renderEvaluationsTable();
  }

  /**
   * タブを切り替える
   */
  switchTab(tabName) {
    this.selectedTab = tabName;
    document.getElementById('pending-tab').classList.toggle('active', tabName === 'pending');
    document.getElementById('completed-tab').classList.toggle('active', tabName === 'completed');
    this.filterAndRender();
  }

  /**
   * 評価テーブルを描画
   */
  renderEvaluationsTable() {
    const container = document.getElementById("evaluationsTableContainer");
    if (!container) return;
    
    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `<p class="text-center text-muted p-5" data-i18n="common.no_data"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = `
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th data-i18n="evaluation.target"></th>
            <th data-i18n="evaluation.evaluator"></th>
            <th data-i18n="evaluation.period"></th>
            <th data-i18n="evaluation.total_score"></th>
            <th data-i18n="evaluation.submit_date"></th>
            <th data-i18n="users.actions"></th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredEvaluations.map(e => this.renderTableRow(e)).join('')}
        </tbody>
      </table>
    `;
    this.app.i18n.updateUI(container);
  }

  /**
   * テーブルの各行をレンダリング
   */
  renderTableRow(evaluation) {
    const isAdmin = this.app.hasRole('admin');
    const isPending = evaluation.status === 'pending';
    
    return `
      <tr>
        <td>${this.app.sanitizeHtml(evaluation.employeeName)}</td>
        <td>${this.app.sanitizeHtml(evaluation.evaluatorName)}</td>
        <td>${this.app.sanitizeHtml(evaluation.period)}</td>
        <td>${evaluation.totalScore ? evaluation.totalScore.toFixed(1) : '-'}</td>
        <td>${this.app.formatDate(evaluation.submittedAt)}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" onclick="window.app.currentPage.viewEvaluationDetails('${evaluation.id}')" title="${this.app.i18n.t('common.details')}"><i class="fas fa-eye"></i></button>
            
            ${isAdmin && isPending ? `
              <button class="btn btn-outline-success" onclick="window.app.currentPage.approveEvaluation('${evaluation.id}')" title="${this.app.i18n.t('goals.approve')}"><i class="fas fa-check"></i></button>
              <button class="btn btn-outline-danger" onclick="window.app.currentPage.rejectEvaluation('${evaluation.id}')" title="${this.app.i18n.t('goals.reject')}"><i class="fas fa-undo"></i></button>
            ` : ''}
            </div>
        </td>
      </tr>
    `;
  }
  
  /**
   * 評価を承認する
   */
  async approveEvaluation(evalId) {
    if (!confirm(this.app.i18n.t('goals.confirm_approve'))) return;
    
    const evaluation = this.allEvaluations.find(e => e.id === evalId);
    if (evaluation) {
      evaluation.status = 'completed'; // ステータスを更新
      // ここでAPIを呼び出す: await this.app.api.updateEvaluationStatus(evalId, 'completed');
      this.app.showSuccess(this.app.i18n.t('messages.approval_success'));
      this.filterAndRender(); // テーブルを再描画
    }
  }

  /**
   * 評価を差し戻す
   */
  async rejectEvaluation(evalId) {
    const reason = prompt(this.app.i18n.t('goals.rejection_reason_prompt'));
    if (reason === null) return; // キャンセルされた場合

    const evaluation = this.allEvaluations.find(e => e.id === evalId);
    if (evaluation) {
      evaluation.status = 'rejected'; // ステータスを更新
      // ここでAPIを呼び出す: await this.app.api.updateEvaluationStatus(evalId, 'rejected', reason);
      this.app.showSuccess(this.app.i18n.t('messages.rejection_success'));
      this.filterAndRender(); // テーブルを再描画
    }
  }
  
  /**
   * 評価詳細ページへ遷移（表示モード）
   */
  viewEvaluationDetails(evalId) {
    // 既存の評価IDをパラメータとして評価フォームページに遷移する
    // evaluation-form.js側でIDを検知し、表示モードでデータを読み込む想定
    this.app.navigate(`/evaluation-form?id=${evalId}`);
  }
}

window.EvaluationsPage = EvaluationsPage;
