// evaluations.js - 担当評価フィルタリング機能追加

export class EvaluationsPage {
  constructor(app) {
    this.app = app;
    this.evaluations = [];
    this.filteredEvaluations = [];
    this.users = [];
    this.periods = [];
    this.currentStatusFilter = 'all';
    this.currentUserFilter = 'all';
    this.currentPeriodFilter = 'all';
    this.currentAssignmentFilter = 'all'; // 新規追加: 担当フィルター
    this.searchTerm = '';
    this.isLoading = false;
  }

  async render() {
    const currentUser = this.app.currentUser;
    const isEvaluator = currentUser?.role === 'evaluator';
    const isAdmin = currentUser?.role === 'admin';

    return `
      <div class="container-fluid">
        <!-- ページヘッダー -->
        <div class="row mb-4">
          <div class="col">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="h3 mb-3">
                  <i class="fas fa-clipboard-list me-2"></i>
                  <span data-i18n="evaluations.title">評価一覧</span>
                </h1>
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                      <a href="#/dashboard" data-link data-i18n="nav.dashboard">ダッシュボード</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page" data-i18n="evaluations.title">評価一覧</li>
                  </ol>
                </nav>
              </div>
              <div>
                ${isEvaluator || isAdmin ? `
                <a href="#/evaluation-form" class="btn btn-primary" data-link>
                  <i class="fas fa-plus me-2"></i>
                  <span data-i18n="evaluations.new_evaluation">新規評価作成</span>
                </a>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- 統計サマリー -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="dashboard.total_evaluations">総評価数</h6>
                <h3 class="card-title mb-0">
                  <span id="totalEvaluations">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="dashboard.pending_evaluations">承認待ち</h6>
                <h3 class="card-title mb-0 text-warning">
                  <span id="pendingEvaluations">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="dashboard.completed_evaluations">完了済み</h6>
                <h3 class="card-title mb-0 text-success">
                  <span id="completedEvaluations">0</span>
                </h3>
              </div>
            </div>
          </div>
          ${isEvaluator ? `
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="evaluations.my_assignments">私の担当</h6>
                <h3 class="card-title mb-0 text-info">
                  <span id="myAssignedEvaluations">0</span>
                </h3>
              </div>
            </div>
          </div>
          ` : `
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="evaluations.in_progress">進行中</h6>
                <h3 class="card-title mb-0 text-info">
                  <span id="inProgressEvaluations">0</span>
                </h3>
              </div>
            </div>
          </div>
          `}
        </div>

        <!-- フィルターカード -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 mb-3 mb-md-0">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input type="text" 
                         class="form-control" 
                         id="evaluationSearchInput" 
                         data-i18n-placeholder="evaluations.search_placeholder" 
                         placeholder="評価対象者名で検索...">
                </div>
              </div>
              <div class="col-md-2 mb-3 mb-md-0">
                <select class="form-select" id="statusFilter">
                  <option value="all" data-i18n="evaluations.all_status">すべてのステータス</option>
                  <option value="draft" data-i18n="status.draft">下書き</option>
                  <option value="self_assessed" data-i18n="status.self_assessed">自己評価完了</option>
                  <option value="pending_approval" data-i18n="status.pending_approval">承認待ち</option>
                  <option value="completed" data-i18n="status.completed">完了</option>
                  <option value="in_progress" data-i18n="evaluations.in_progress">進行中</option>
                </select>
              </div>
              ${isAdmin ? `
              <div class="col-md-2 mb-3 mb-md-0">
                <select class="form-select" id="userFilter">
                  <option value="all" data-i18n="evaluations.all_users">すべてのユーザー</option>
                </select>
              </div>
              <div class="col-md-2 mb-3 mb-md-0">
                <select class="form-select" id="assignmentFilter">
                  <option value="all" data-i18n="evaluations.all_assignments">すべての担当</option>
                  <option value="assigned" data-i18n="evaluations.assigned">担当割り当て済み</option>
                  <option value="unassigned" data-i18n="evaluations.unassigned">担当未割り当て</option>
                  <option value="my_evaluations" data-i18n="evaluations.my_evaluations">私が評価者</option>
                </select>
              </div>
              ` : isEvaluator ? `
              <div class="col-md-2 mb-3 mb-md-0">
                <select class="form-select" id="assignmentFilter">
                  <option value="all" data-i18n="evaluations.all_assignments">すべての担当</option>
                  <option value="my_evaluations" data-i18n="evaluations.my_evaluations">私の担当評価</option>
                  <option value="others" data-i18n="evaluations.other_evaluators">他の評価者</option>
                </select>
              </div>
              <div class="col-md-2 mb-3 mb-md-0">
                <select class="form-select" id="priorityFilter">
                  <option value="all" data-i18n="common.all">すべて</option>
                  <option value="urgent" data-i18n="evaluations.urgent">緊急（承認待ち）</option>
                  <option value="this_week" data-i18n="evaluations.this_week">今週作成</option>
                </select>
              </div>
              ` : `
              <div class="col-md-4 mb-3 mb-md-0">
                <div class="text-muted small">
                  <i class="fas fa-info-circle me-1"></i>
                  <span data-i18n="evaluations.own_evaluations_only">あなたの評価のみ表示されます</span>
                </div>
              </div>
              `}
              <div class="col-md-3 text-md-end">
                <button class="btn btn-outline-secondary me-2" id="resetFiltersBtn">
                  <i class="fas fa-times me-2"></i>
                  <span data-i18n="evaluations.reset_filters">フィルターリセット</span>
                </button>
                <button class="btn btn-outline-info" id="exportEvaluationsBtn">
                  <i class="fas fa-download me-2"></i>
                  <span data-i18n="common.export">エクスポート</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 評価一覧テーブル -->
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0" data-i18n="evaluations.title">評価一覧</h5>
              <div class="d-flex align-items-center">
                <span class="text-muted me-3" id="evaluationCount">0<span data-i18n="evaluations.items_count">件</span></span>
                <div class="btn-group" role="group">
                  <button type="button" class="btn btn-sm btn-outline-secondary active" id="listViewBtn">
                    <i class="fas fa-list"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" id="cardViewBtn">
                    <i class="fas fa-th-large"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div id="evaluationTableContainer">
              <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden" data-i18n="common.loading">読み込み中...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init(params) {
    
    // URLパラメータから初期フィルターを設定
    if (params.get('filter')) {
      this.currentStatusFilter = params.get('filter');
    }
    if (params.get('assignment')) {
      this.currentAssignmentFilter = params.get('assignment');
    }

    // イベントリスナーの設定
    this.setupEventListeners();
    
    // データの読み込み
    await this.loadData();
    
    // 統計情報の更新
    this.updateStatistics();
    
    // フィルターの初期値を設定
    this.setInitialFilters();
  }

  setupEventListeners() {
    // 検索
    const searchInput = document.getElementById('evaluationSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // ステータスフィルター
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => this.handleStatusFilter(e.target.value));
    }

    // ユーザーフィルター（管理者用）
    const userFilter = document.getElementById('userFilter');
    if (userFilter) {
      userFilter.addEventListener('change', (e) => this.handleUserFilter(e.target.value));
    }

    // 担当フィルター
    const assignmentFilter = document.getElementById('assignmentFilter');
    if (assignmentFilter) {
      assignmentFilter.addEventListener('change', (e) => this.handleAssignmentFilter(e.target.value));
    }

    // 優先度フィルター（評価者用）
    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => this.handlePriorityFilter(e.target.value));
    }

    // フィルターリセット
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => this.resetFilters());
    }

    // エクスポート
    const exportBtn = document.getElementById('exportEvaluationsBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportEvaluations());
    }

    // 表示形式切り替え
    const listViewBtn = document.getElementById('listViewBtn');
    const cardViewBtn = document.getElementById('cardViewBtn');
    if (listViewBtn) {
      listViewBtn.addEventListener('click', () => this.switchToListView());
    }
    if (cardViewBtn) {
      cardViewBtn.addEventListener('click', () => this.switchToCardView());
    }
  }

  async loadData() {
    this.isLoading = true;
    
    try {
      
      const currentUser = this.app.currentUser;
      
      // 役割に応じて異なるデータを読み込み
      if (currentUser.role === 'admin') {
        // 管理者：すべての評価を取得
        const evaluationsData = await this.app.api.getEvaluations();
        this.evaluations = Array.isArray(evaluationsData) ? evaluationsData : [];
        const usersData = await this.app.api.getUsers();
        this.users = Array.isArray(usersData) ? usersData : [];
      } else if (currentUser.role === 'evaluator') {
        // 評価者：すべての評価を取得（フィルタリングで担当分を表示）
        const evaluationsData = await this.app.api.getEvaluations();
        this.evaluations = Array.isArray(evaluationsData) ? evaluationsData : [];
        const usersData = await this.app.api.getUsersByEvaluator(currentUser.uid || currentUser.id);
        this.users = Array.isArray(usersData) ? usersData : [];
      } else {
        // 一般ユーザー：自分の評価のみ
        const evaluationsData = await this.app.api.getEvaluations({
          targetUserId: currentUser.uid || currentUser.id
        });
        this.evaluations = Array.isArray(evaluationsData) ? evaluationsData : [];
        this.users = [currentUser];
      }
      
      // 評価期間データを取得
      try {
        const settings = await this.app.api.getSettings();
        this.periods = Array.isArray(settings?.periods) ? settings.periods : [];
      } catch (error) {
        console.warn('EvaluationsPage: Could not load periods:', error);
        this.periods = [];
      }

      this.filteredEvaluations = [...this.evaluations];
      
      
      // ユーザーセレクトボックスを更新
      this.updateUserSelect();
      
      // テーブルを更新
      this.renderEvaluationTable();
      
    } catch (error) {
      console.error('EvaluationsPage: Failed to load evaluations:', error);
      this.app.showError('評価データの読み込みに失敗しました');
      
      // エラー時は空のデータで続行
      this.evaluations = [];
      this.filteredEvaluations = [];
      this.renderEvaluationTable();
      
    } finally {
      this.isLoading = false;
    }
  }

  updateUserSelect() {
    const userSelect = document.getElementById('userFilter');
    if (!userSelect) return;
    
    // 既存のオプションをクリア（最初のオプションは残す）
    while (userSelect.options.length > 1) {
      userSelect.remove(1);
    }
    
    // ユーザーオプションを追加
    this.users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.name} (${user.email})`;
      userSelect.appendChild(option);
    });
  }

  setInitialFilters() {
    // URLパラメータに基づいて初期フィルターを設定
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter && this.currentStatusFilter !== 'all') {
      statusFilter.value = this.currentStatusFilter;
    }

    const assignmentFilter = document.getElementById('assignmentFilter');
    if (assignmentFilter && this.currentAssignmentFilter !== 'all') {
      assignmentFilter.value = this.currentAssignmentFilter;
    }

    // 評価者の場合、デフォルトで自分の担当評価を表示
    if (this.app.currentUser?.role === 'evaluator' && this.currentAssignmentFilter === 'all') {
      this.currentAssignmentFilter = 'my_evaluations';
      if (assignmentFilter) {
        assignmentFilter.value = 'my_evaluations';
      }
    }

    // フィルターを適用
    this.applyFilters();
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase().trim();
    this.applyFilters();
  }

  handleStatusFilter(status) {
    this.currentStatusFilter = status;
    this.applyFilters();
  }

  handleUserFilter(userId) {
    this.currentUserFilter = userId;
    this.applyFilters();
  }

  handleAssignmentFilter(assignment) {
    this.currentAssignmentFilter = assignment;
    this.applyFilters();
  }

  handlePriorityFilter(priority) {
    this.currentPriorityFilter = priority;
    this.applyFilters();
  }

  applyFilters() {
    const currentUser = this.app.currentUser;
    
    this.filteredEvaluations = this.evaluations.filter(evaluation => {
      // ステータスフィルター
      if (this.currentStatusFilter !== 'all' && evaluation.status !== this.currentStatusFilter) {
        return false;
      }
      
      // ユーザーフィルター（管理者用）
      if (this.currentUserFilter !== 'all' && evaluation.targetUserId !== this.currentUserFilter) {
        return false;
      }
      
      // 担当フィルター
      if (this.currentAssignmentFilter !== 'all') {
        const evaluatorId = currentUser.uid || currentUser.id;
        
        switch (this.currentAssignmentFilter) {
          case 'my_evaluations':
            // 自分が評価者として担当する評価
            if (evaluation.evaluatorId !== evaluatorId) {
              return false;
            }
            break;
          case 'assigned':
            // 評価者が割り当てられている評価
            if (!evaluation.evaluatorId) {
              return false;
            }
            break;
          case 'unassigned':
            // 評価者が未割り当ての評価
            if (evaluation.evaluatorId) {
              return false;
            }
            break;
          case 'others':
            // 他の評価者が担当する評価
            if (!evaluation.evaluatorId || evaluation.evaluatorId === evaluatorId) {
              return false;
            }
            break;
        }
      }
      
      // 優先度フィルター（評価者用）
      if (this.currentPriorityFilter !== 'all') {
        switch (this.currentPriorityFilter) {
          case 'urgent':
            if (evaluation.status !== 'pending_approval') {
              return false;
            }
            break;
          case 'this_week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const createdAt = evaluation.createdAt ? 
              (evaluation.createdAt.toDate ? evaluation.createdAt.toDate() : new Date(evaluation.createdAt)) : 
              new Date(0);
            if (createdAt < weekAgo) {
              return false;
            }
            break;
        }
      }
      
      // 検索フィルター
      if (this.searchTerm) {
        const searchableText = [
          evaluation.targetUserName,
          evaluation.targetUserEmail,
          evaluation.evaluatorName,
          evaluation.notes
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(this.searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
    
    // テーブルを更新
    this.renderEvaluationTable();
    this.updateStatistics();
  }

  renderEvaluationTable() {
    const container = document.getElementById('evaluationTableContainer');
    if (!container) return;

    // 件数を更新
    const countElement = document.getElementById('evaluationCount');
    if (countElement) {
      countElement.innerHTML = `${this.filteredEvaluations.length}<span data-i18n="evaluations.items_count">件</span>`;
      // 翻訳を適用
      if (this.app.i18n) {
        this.app.i18n.updateElement(countElement);
      }
    }

    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-clipboard fa-3x text-muted mb-3"></i>
          <p class="text-muted" data-i18n="evaluations.no_matching_evaluations">条件に合致する評価が見つかりません</p>
          <button class="btn btn-outline-secondary" onclick="window.app.router.currentPageInstance.resetFilters()">
            <span data-i18n="evaluations.reset_filters">フィルターをリセット</span>
          </button>
        </div>
      `;
      // 翻訳を適用
      if (this.app.i18n) {
        this.app.i18n.updateElement(container);
      }
      return;
    }

    const currentUser = this.app.currentUser;
    const canEdit = currentUser.role === 'admin' || currentUser.role === 'evaluator';

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th data-i18n="evaluations.target_user">評価対象者</th>
              <th data-i18n="evaluations.evaluator">評価者</th>
              <th data-i18n="evaluations.period">評価期間</th>
              <th data-i18n="status.title">ステータス</th>
              <th data-i18n="common.created_at">作成日</th>
              <th data-i18n="evaluations.updated_at">更新日</th>
              <th data-i18n="evaluations.assignment_status">担当状況</th>
              <th data-i18n="common.actions">操作</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredEvaluations.map(evaluation => {
              const isMyEvaluation = evaluation.evaluatorId === (currentUser.uid || currentUser.id);
              const isAssigned = !!evaluation.evaluatorId;
              const canApprove = isMyEvaluation && evaluation.status === 'pending_approval';
              
              return `
                <tr class="${canApprove ? 'table-warning' : ''}">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">
                        <span class="avatar-title rounded-circle bg-primary">
                          ${this.getInitials(evaluation.targetUserName)}
                        </span>
                      </div>
                      <div>
                        <strong>${this.app.sanitizeHtml(evaluation.targetUserName || this.app.i18n.t('common.unknown'))}</strong>
                        <br><small class="text-muted">${this.app.sanitizeHtml(evaluation.targetUserEmail || '')}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    ${evaluation.evaluatorName ? 
                      `<span class="text-success">${this.app.sanitizeHtml(evaluation.evaluatorName)}</span>` :
                      `<span class="text-muted">${this.app.i18n.t('evaluations.unassigned')}</span>`
                    }
                    ${isMyEvaluation ? `<br><small class="badge bg-info">${this.app.i18n.t('evaluations.assigned_to_me')}</small>` : ''}
                  </td>
                  <td>${this.app.sanitizeHtml(evaluation.periodName || '-')}</td>
                  <td>
                    <span class="badge ${this.app.getStatusBadgeClass(evaluation.status)}">
                      ${this.getStatusLabel(evaluation.status)}
                    </span>
                    ${canApprove ? `<br><small class="text-warning"><i class="fas fa-exclamation-triangle me-1"></i>${this.app.i18n.t('evaluations.requires_approval')}</small>` : ''}
                  </td>
                  <td>${this.app.formatDate(evaluation.createdAt)}</td>
                  <td>${this.app.formatDate(evaluation.updatedAt)}</td>
                  <td>
                    ${isAssigned ? 
                      `<span class="badge bg-success">${this.app.i18n.t('evaluations.assigned')}</span>` :
                      `<span class="badge bg-warning">${this.app.i18n.t('evaluations.unassigned')}</span>`
                    }
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      ${evaluation.status === 'completed' ? `
                      <a href="#/evaluation-report?id=${evaluation.id}"
                         class="btn btn-sm btn-success"
                         data-link
                         title="レポート表示">
                        <i class="fas fa-chart-bar"></i>
                      </a>
                      ` : ''}
                      ${canEdit && evaluation.status === 'draft' ? `
                      <a href="#/evaluation-form?id=${evaluation.id}"
                         class="btn btn-sm btn-primary"
                         data-link
                         title="評価を開始">
                        <i class="fas fa-edit me-1"></i>
                        <span data-i18n="evaluations.start_evaluation">評価開始</span>
                      </a>
                      ` : ''}
                      ${canEdit && evaluation.status !== 'draft' && evaluation.status !== 'completed' ? `
                      <a href="#/evaluation-form?id=${evaluation.id}"
                         class="btn btn-sm btn-warning"
                         data-link
                         title="評価を続ける">
                        <i class="fas fa-edit me-1"></i>
                        <span data-i18n="evaluations.continue_evaluation">続ける</span>
                      </a>
                      ` : ''}
                      <a href="#/evaluation-form?id=${evaluation.id}"
                         class="btn btn-sm btn-outline-primary"
                         data-link
                         title="詳細表示">
                        <i class="fas fa-eye"></i>
                      </a>
                      ${canEdit && (isMyEvaluation || currentUser.role === 'admin') ? `
                      <button class="btn btn-sm btn-outline-warning"
                              onclick="window.app.router.currentPageInstance.quickApprove('${evaluation.id}')"
                              ${canApprove ? '' : 'disabled'}
                              title="承認">
                        <i class="fas fa-check"></i>
                      </button>
                      ` : ''}
                      ${currentUser.role === 'admin' ? `
                      <button class="btn btn-sm btn-outline-danger"
                              onclick="window.app.router.currentPageInstance.deleteEvaluation('${evaluation.id}')"
                              title="削除">
                        <i class="fas fa-trash"></i>
                      </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 動的生成されたテーブルに翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateElement(container);
    }
  }

  updateStatistics() {
    // 総評価数
    const totalElement = document.getElementById('totalEvaluations');
    if (totalElement) {
      totalElement.textContent = this.evaluations.length;
    }

    // 承認待ち
    const pendingCount = this.evaluations.filter(e => e.status === 'pending_approval').length;
    const pendingElement = document.getElementById('pendingEvaluations');
    if (pendingElement) {
      pendingElement.textContent = pendingCount;
    }

    // 完了済み
    const completedCount = this.evaluations.filter(e => e.status === 'completed').length;
    const completedElement = document.getElementById('completedEvaluations');
    if (completedElement) {
      completedElement.textContent = completedCount;
    }

    // 役割別統計
    const currentUser = this.app.currentUser;
    if (currentUser.role === 'evaluator') {
      // 評価者用統計
      const myAssignedCount = this.evaluations.filter(e => 
        e.evaluatorId === (currentUser.uid || currentUser.id)
      ).length;
      const myAssignedElement = document.getElementById('myAssignedEvaluations');
      if (myAssignedElement) {
        myAssignedElement.textContent = myAssignedCount;
      }

    } else if (currentUser.role === 'worker') {
      // 一般ユーザー用統計
      const inProgressCount = this.evaluations.filter(e => 
        e.status === 'in_progress' || e.status === 'self_assessed'
      ).length;
      const inProgressElement = document.getElementById('inProgressEvaluations');
      if (inProgressElement) {
        inProgressElement.textContent = inProgressCount;
      }

      const userCompletedElement = document.getElementById('userCompletedEvaluations');
      if (userCompletedElement) {
        userCompletedElement.textContent = completedCount;
      }
    }
  }

  async quickApprove(evaluationId) {
    try {
      const confirmed = await this.app.confirm(
        'この評価を承認しますか？',
        '評価の承認'
      );
      
      if (!confirmed) return;

      this.app.showLoading('承認中...');

      await this.app.api.updateEvaluationStatusWithNotification(
        evaluationId, 
        'completed',
        {
          approvedBy: this.app.currentUser.uid || this.app.currentUser.id,
          approvedAt: new Date().toISOString(),
          approverName: this.app.currentUser.name
        }
      );

      this.app.showSuccess('評価を承認しました');
      
      // データを再読み込み
      await this.loadData();

    } catch (error) {
      console.error('EvaluationsPage: Error approving evaluation:', error);
      this.app.showError('評価の承認に失敗しました');
    } finally {
      this.app.hideLoading();
    }
  }

  async deleteEvaluation(evaluationId) {
    try {
      const confirmed = await this.app.confirm(
        'この評価を削除してもよろしいですか？この操作は取り消せません。',
        '評価の削除'
      );
      
      if (!confirmed) return;

      this.app.showLoading('削除中...');

      await this.app.api.deleteEvaluation(evaluationId);

      // ローカルデータから削除
      this.evaluations = this.evaluations.filter(e => e.id !== evaluationId);
      this.applyFilters();

      this.app.showSuccess('評価を削除しました');

    } catch (error) {
      console.error('EvaluationsPage: Error deleting evaluation:', error);
      this.app.showError('評価の削除に失敗しました');
    } finally {
      this.app.hideLoading();
    }
  }

  resetFilters() {
    // フィルター値をリセット
    this.currentStatusFilter = 'all';
    this.currentUserFilter = 'all';
    this.currentAssignmentFilter = this.app.currentUser?.role === 'evaluator' ? 'my_evaluations' : 'all';
    this.currentPriorityFilter = 'all';
    this.searchTerm = '';

    // フォーム要素をリセット
    const elements = [
      'evaluationSearchInput',
      'statusFilter', 
      'userFilter',
      'assignmentFilter',
      'priorityFilter'
    ];

    elements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        if (element.type === 'text') {
          element.value = '';
        } else {
          element.value = elementId === 'assignmentFilter' && this.app.currentUser?.role === 'evaluator' 
            ? 'my_evaluations' : 'all';
        }
      }
    });

    // フィルターを適用
    this.applyFilters();

    this.app.showInfo('フィルターをリセットしました');
  }

  exportEvaluations() {
    try {
      // CSVデータを作成
      const headers = [
        '評価対象者名', 'メールアドレス', '評価者名', '評価期間', 
        'ステータス', '作成日', '更新日', '担当状況'
      ];
      
      const rows = this.filteredEvaluations.map(evaluation => [
        evaluation.targetUserName || '',
        evaluation.targetUserEmail || '',
        evaluation.evaluatorName || '未割り当て',
        evaluation.periodName || '',
        this.getStatusLabel(evaluation.status),
        this.app.formatDate(evaluation.createdAt),
        this.app.formatDate(evaluation.updatedAt),
        evaluation.evaluatorId ? '割り当て済み' : '未割り当て'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // ダウンロード
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `評価一覧_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.app.showSuccess('エクスポートが完了しました');
      
    } catch (error) {
      console.error('EvaluationsPage: Export error:', error);
      this.app.showError('エクスポートに失敗しました');
    }
  }

  switchToListView() {
    document.getElementById('listViewBtn').classList.add('active');
    document.getElementById('cardViewBtn').classList.remove('active');
    this.renderEvaluationTable();
  }

  switchToCardView() {
    document.getElementById('cardViewBtn').classList.add('active');
    document.getElementById('listViewBtn').classList.remove('active');
    this.renderEvaluationCards();
  }

  renderEvaluationCards() {
    const container = document.getElementById('evaluationTableContainer');
    if (!container) return;

    if (this.filteredEvaluations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-clipboard fa-3x text-muted mb-3"></i>
          <p class="text-muted">条件に合致する評価が見つかりません</p>
        </div>
      `;
      return;
    }

    const currentUser = this.app.currentUser;
    const canEdit = currentUser.role === 'admin' || currentUser.role === 'evaluator';

    const cardsHtml = `
      <div class="row">
        ${this.filteredEvaluations.map(evaluation => {
          const isMyEvaluation = evaluation.evaluatorId === (currentUser.uid || currentUser.id);
          const canApprove = isMyEvaluation && evaluation.status === 'pending_approval';
          
          return `
            <div class="col-md-6 col-lg-4 mb-4">
              <div class="card h-100 ${canApprove ? 'border-warning' : ''}">
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between mb-3">
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">
                        <span class="avatar-title rounded-circle bg-primary">
                          ${this.getInitials(evaluation.targetUserName)}
                        </span>
                      </div>
                      <div>
                        <h6 class="card-title mb-0">${this.app.sanitizeHtml(evaluation.targetUserName || '不明')}</h6>
                        <small class="text-muted">${this.app.sanitizeHtml(evaluation.targetUserEmail || '')}</small>
                      </div>
                    </div>
                    <span class="badge ${this.app.getStatusBadgeClass(evaluation.status)}">
                      ${this.getStatusLabel(evaluation.status)}
                    </span>
                  </div>
                  
                  <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="text-muted small">評価者:</span>
                      <span class="small ${evaluation.evaluatorName ? 'text-success' : 'text-warning'}">
                        ${evaluation.evaluatorName || '未割り当て'}
                        ${isMyEvaluation ? ' <i class="fas fa-user-check"></i>' : ''}
                      </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="text-muted small">期間:</span>
                      <span class="small">${evaluation.periodName || '-'}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted small">更新:</span>
                      <span class="small">${this.app.formatDate(evaluation.updatedAt)}</span>
                    </div>
                  </div>

                  ${canApprove ? `
                  <div class="alert alert-warning py-2 mb-3">
                    <small><i class="fas fa-exclamation-triangle me-1"></i>承認が必要です</small>
                  </div>
                  ` : ''}
                  
                  <div class="d-grid gap-2">
                    ${evaluation.status === 'completed' ? `
                    <a href="#/evaluation-report?id=${evaluation.id}"
                       class="btn btn-success btn-sm" data-link>
                      <i class="fas fa-chart-bar me-1"></i>レポート表示
                    </a>
                    ` : ''}
                    <a href="#/evaluation-form?id=${evaluation.id}"
                       class="btn btn-outline-primary btn-sm" data-link>
                      <i class="fas fa-eye me-1"></i>詳細表示
                    </a>
                    ${canApprove ? `
                    <button class="btn btn-warning btn-sm"
                            onclick="window.app.router.currentPageInstance.quickApprove('${evaluation.id}')">
                      <i class="fas fa-check me-1"></i>承認する
                    </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = cardsHtml;
  }

  // ヘルパーメソッド
  getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStatusLabel(status) {
    const labels = {
      'draft': '下書き',
      'self_assessed': '自己評価完了',
      'pending_approval': '承認待ち',
      'completed': '完了',
      'in_progress': '進行中'
    };
    return labels[status] || status;
  }

  cleanup() {
    // イベントリスナーのクリーンアップ
  }
}
