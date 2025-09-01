export class DashboardPage {
  constructor(app) {
    this.app = app;
    this.stats = {};
    this.recentEvaluations = [];
    this.chartData = {};
    this.pendingEvaluations = []; // 承認待ち評価
    this.notifications = []; // 通知
    this.refreshTimer = null;
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
                <h1 class="h3 mb-1">
                  <i class="fas fa-tachometer-alt me-2"></i>
                  ダッシュボード
                </h1>
                <p class="text-muted mb-0">
                  <i class="fas fa-user me-1"></i>
                  ${this.app.sanitizeHtml(currentUser?.name || '')}さん、おかえりなさい
                </p>
              </div>
              <div>
                <button class="btn btn-outline-secondary btn-sm" id="refreshDashboard">
                  <i class="fas fa-sync-alt me-1"></i>
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- アラート（評価者用承認待ち通知） -->
        ${isEvaluator || isAdmin ? `
        <div id="pendingAlert" class="alert alert-warning d-none" role="alert">
          <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle fa-lg me-3"></i>
            <div class="flex-grow-1">
              <strong>承認待ちの評価があります</strong>
              <p class="mb-0" id="pendingAlertText">確認が必要な評価が <span id="pendingCount">0</span> 件あります。</p>
            </div>
            <a href="#/evaluations?filter=pending" class="btn btn-warning btn-sm" data-link>
              <i class="fas fa-clipboard-check me-1"></i>
              確認する
            </a>
          </div>
        </div>
        ` : ''}

        <!-- 統計カード -->
        <div class="row mb-4">
          ${isAdmin ? `
          <!-- 管理者用統計 -->
          <div class="col-md-3 mb-3">
            <div class="card border-primary h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">総ユーザー数</h6>
                    <h3 class="card-title mb-0" id="totalUsers">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-primary">
                    <i class="fas fa-users fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">完了評価</h6>
                    <h3 class="card-title mb-0" id="completedEvaluations">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-success">
                    <i class="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">承認待ち</h6>
                    <h3 class="card-title mb-0" id="pendingEvaluations">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-warning">
                    <i class="fas fa-clock fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">未割り当て</h6>
                    <h3 class="card-title mb-0" id="unassignedUsers">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-info">
                    <i class="fas fa-user-slash fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ` : isEvaluator ? `
          <!-- 評価者用統計 -->
          <div class="col-md-4 mb-3">
            <div class="card border-primary h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">担当ユーザー</h6>
                    <h3 class="card-title mb-0" id="assignedUsers">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-primary">
                    <i class="fas fa-users fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card border-warning h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">承認待ち</h6>
                    <h3 class="card-title mb-0 text-warning" id="myPendingEvaluations">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-warning">
                    <i class="fas fa-exclamation-circle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card border-success h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">今月完了</h6>
                    <h3 class="card-title mb-0" id="completedThisMonth">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-success">
                    <i class="fas fa-chart-line fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ` : `
          <!-- 一般ユーザー用統計 -->
          <div class="col-md-4 mb-3">
            <div class="card border-primary h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">マイ評価</h6>
                    <h3 class="card-title mb-0" id="myEvaluations">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-primary">
                    <i class="fas fa-user-check fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card border-info h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">進行中</h6>
                    <h3 class="card-title mb-0" id="inProgressEvaluations">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-info">
                    <i class="fas fa-tasks fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card border-success h-100">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">完了済み</h6>
                    <h3 class="card-title mb-0" id="userCompletedEvaluations">
                      <span class="spinner-border spinner-border-sm"></span>
                    </h3>
                  </div>
                  <div class="text-success">
                    <i class="fas fa-check-double fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          `}
        </div>

        <div class="row">
          <!-- 承認待ち評価一覧（評価者・管理者用） -->
          ${isEvaluator || isAdmin ? `
          <div class="col-lg-8 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="fas fa-clipboard-list me-2"></i>
                  承認待ち評価
                </h5>
                <a href="#/evaluations?filter=pending" class="btn btn-sm btn-outline-primary" data-link>
                  すべて表示
                </a>
              </div>
              <div class="card-body">
                <div id="pendingEvaluationsList">
                  <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">読み込み中...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ` : `
          <!-- 最近の評価活動（一般ユーザー用） -->
          <div class="col-lg-8 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="fas fa-history me-2"></i>
                  最近の評価活動
                </h5>
                <a href="#/evaluations" class="btn btn-sm btn-outline-primary" data-link>
                  すべて表示
                </a>
              </div>
              <div class="card-body">
                <div id="recentEvaluationsList">
                  <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">読み込み中...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          `}

          <!-- サイドパネル -->
          <div class="col-lg-4">
            <!-- クイックアクション -->
            <div class="card mb-4">
              <div class="card-header">
                <h6 class="card-title mb-0">
                  <i class="fas fa-bolt me-2"></i>
                  クイックアクション
                </h6>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  ${isAdmin ? `
                  <a href="#/users" class="btn btn-outline-primary" data-link>
                    <i class="fas fa-users me-2"></i>
                    ユーザー管理
                  </a>
                  <a href="#/settings" class="btn btn-outline-secondary" data-link>
                    <i class="fas fa-cog me-2"></i>
                    システム設定
                  </a>
                  ` : isEvaluator ? `
                  <a href="#/evaluations?filter=pending" class="btn btn-outline-warning" data-link>
                    <i class="fas fa-clipboard-check me-2"></i>
                    評価を承認する
                  </a>
                  <a href="#/evaluation-form" class="btn btn-outline-primary" data-link>
                    <i class="fas fa-edit me-2"></i>
                    新しい評価
                  </a>
                  ` : `
                  <a href="#/goal-setting" class="btn btn-outline-primary" data-link>
                    <i class="fas fa-target me-2"></i>
                    目標を設定
                  </a>
                  <a href="#/evaluations" class="btn btn-outline-secondary" data-link>
                    <i class="fas fa-chart-bar me-2"></i>
                    マイ評価
                  </a>
                  `}
                </div>
              </div>
            </div>

            <!-- 通知パネル -->
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-0">
                  <i class="fas fa-bell me-2"></i>
                  通知
                  <span class="badge bg-primary ms-1" id="notificationBadge">0</span>
                </h6>
                <button class="btn btn-sm btn-outline-secondary" id="markAllAsRead">
                  すべて既読
                </button>
              </div>
              <div class="card-body p-0">
                <div id="notificationsList" style="max-height: 300px; overflow-y: auto;">
                  <div class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">読み込み中...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 評価者統計（管理者用） -->
        ${isAdmin ? `
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-users-cog me-2"></i>
                  評価者別統計
                </h5>
              </div>
              <div class="card-body">
                <div id="evaluatorStatsContainer">
                  <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">読み込み中...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }

  async init() {
    console.log('Dashboard: Initializing...');
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // データの読み込み
    await this.loadData();
    
    // 自動更新を開始
    this.startAutoRefresh();
  }

  setupEventListeners() {
    // 更新ボタン
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData());
    }

    // 通知すべて既読ボタン
    const markAllReadBtn = document.getElementById('markAllAsRead');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => this.markAllNotificationsAsRead());
    }
  }

async loadData() {
  try {
    console.log('Dashboard: Loading data...');
    
    const currentUser = this.app.currentUser;
    if (!currentUser) {
      console.error('Dashboard: No current user');
      // 自動更新タイマーを停止して無限ループを防ぐ
      this.cleanup();
      // ログインページへリダイレクト
      if (this.app && this.app.navigate) {
        this.app.navigate('#/login');
      }
      return;
    }

      // 役割に応じて異なるデータを読み込み
      if (currentUser.role === 'admin') {
        await this.loadAdminData();
      } else if (currentUser.role === 'evaluator') {
        await this.loadEvaluatorData();
      } else {
        await this.loadWorkerData();
      }

      // 共通データ
      await this.loadNotifications();

      console.log('Dashboard: Data loading completed');

    } catch (error) {
      console.error('Dashboard: Error loading data:', error);
      this.app.showError('ダッシュボードデータの読み込みに失敗しました');
    }
  }

  async loadAdminData() {
    try {
      // 管理者用統計データを並行読み込み
      const [stats, pendingStats, unassignedUsers, evaluatorStats] = await Promise.all([
        this.app.api.getDashboardStats(),
        this.app.api.getPendingEvaluationStats(),
        this.app.api.getUnassignedUsers(),
        this.app.api.getEvaluatorStats()
      ]);

     // 統計カードを更新
const totalUsersEl = document.getElementById('totalUsers');
const completedEvaluationsEl = document.getElementById('completedEvaluations');
const pendingEvaluationsEl = document.getElementById('pendingEvaluations');
const unassignedUsersEl = document.getElementById('unassignedUsers');

if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers || 0;
if (completedEvaluationsEl) completedEvaluationsEl.textContent = stats.completedEvaluations || 0;
if (pendingEvaluationsEl) pendingEvaluationsEl.textContent = pendingStats.totalPending || 0;
if (unassignedUsersEl) unassignedUsersEl.textContent = unassignedUsers.length || 0;

      // 承認待ちアラートを表示
      if (pendingStats.totalPending > 0) {
        this.showPendingAlert(pendingStats.totalPending);
      }

      // 評価者統計を表示
      this.renderEvaluatorStats(evaluatorStats);

      // 承認待ち評価リストを表示
      this.renderPendingEvaluations(pendingStats.byEvaluator);

    } catch (error) {
      console.error('Dashboard: Error loading admin data:', error);
    }
  }

  async loadEvaluatorData() {
    try {
      // 評価者用データを読み込み
      const [workload, pendingEvaluations] = await Promise.all([
        this.app.api.getEvaluatorWorkload(this.app.currentUser.uid || this.app.currentUser.id),
        this.app.api.getPendingEvaluationsForCurrentUser()
      ]);

     // 統計カードを更新
const assignedUsersEl = document.getElementById('assignedUsers');
const myPendingEvaluationsEl = document.getElementById('myPendingEvaluations');
const completedThisMonthEl = document.getElementById('completedThisMonth');

if (assignedUsersEl) assignedUsersEl.textContent = workload.assignedUsers || 0;
if (myPendingEvaluationsEl) myPendingEvaluationsEl.textContent = workload.pendingEvaluations || 0;
if (completedThisMonthEl) completedThisMonthEl.textContent = workload.completedThisMonth || 0;

      // 承認待ちアラートを表示
      if (workload.pendingEvaluations > 0) {
        this.showPendingAlert(workload.pendingEvaluations);
      }

      // 承認待ち評価リストを表示
      this.renderPendingEvaluationsList(pendingEvaluations);

    } catch (error) {
      console.error('Dashboard: Error loading evaluator data:', error);
    }
  }

  async loadWorkerData() {
    try {
      // 一般ユーザー用データを読み込み
      const evaluations = await this.app.api.getEvaluations({
        targetUserId: this.app.currentUser.uid || this.app.currentUser.id
      });

      const myEvaluations = evaluations.length || 0;
      const inProgress = evaluations.filter(e => e.status === 'in_progress' || e.status === 'self_assessed').length || 0;
      const completed = evaluations.filter(e => e.status === 'completed').length || 0;

      // 統計カードを更新
const myEvaluationsEl = document.getElementById('myEvaluations');
const inProgressEvaluationsEl = document.getElementById('inProgressEvaluations');
const userCompletedEvaluationsEl = document.getElementById('userCompletedEvaluations');

if (myEvaluationsEl) myEvaluationsEl.textContent = myEvaluations;
if (inProgressEvaluationsEl) inProgressEvaluationsEl.textContent = inProgress;
if (userCompletedEvaluationsEl) userCompletedEvaluationsEl.textContent = completed;

      // 最近の評価活動を表示
      this.renderRecentEvaluations(evaluations.slice(0, 5));

    } catch (error) {
      console.error('Dashboard: Error loading worker data:', error);
    }
  }

  async loadNotifications() {
    try {
      const notifications = await this.app.api.getNotifications();
      this.notifications = notifications || [];
      
 // 通知バッジを更新
const notificationBadgeEl = document.getElementById('notificationBadge');
if (notificationBadgeEl) {
  notificationBadgeEl.textContent = unreadCount;
}

// 通知リストを表示
const notificationsListEl = document.getElementById('notificationsList');
if (notificationsListEl) {
  this.renderNotifications();
} else {
  console.warn('Dashboard: notificationsList element not found');
}

    } catch (error) {
      console.error('Dashboard: Error loading notifications:', error);
      document.getElementById('notificationsList').innerHTML = `
        <div class="text-center py-3 text-muted">
          <i class="fas fa-exclamation-triangle me-2"></i>
          通知の読み込みに失敗しました
        </div>
      `;
    }
  }

  showPendingAlert(count) {
    const alertElement = document.getElementById('pendingAlert');
    const countElement = document.getElementById('pendingCount');
    
    if (alertElement && countElement) {
      countElement.textContent = count;
      alertElement.classList.remove('d-none');
    }
  }

  renderEvaluatorStats(stats) {
    const container = document.getElementById('evaluatorStatsContainer');
    if (!container) return;

    if (!stats || stats.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-users-slash fa-2x mb-2"></i>
          <p>評価者データがありません</p>
        </div>
      `;
      return;
    }

    const tableHtml = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>評価者名</th>
              <th>担当ユーザー</th>
              <th>承認待ち</th>
              <th>今月完了</th>
              <th>作業負荷</th>
            </tr>
          </thead>
          <tbody>
            ${stats.map(evaluator => {
              const workloadLevel = evaluator.pendingEvaluations > 10 ? 'danger' : 
                                   evaluator.pendingEvaluations > 5 ? 'warning' : 'success';
              const workloadText = evaluator.pendingEvaluations > 10 ? '高' : 
                                   evaluator.pendingEvaluations > 5 ? '中' : '低';
              
              return `
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">
                        <span class="avatar-title rounded-circle bg-primary">
                          ${evaluator.name ? evaluator.name.substring(0, 2) : '?'}
                        </span>
                      </div>
                      <div>
                        <strong>${this.app.sanitizeHtml(evaluator.name || '不明')}</strong>
                        <br><small class="text-muted">${evaluator.department || '部署未設定'}</small>
                      </div>
                    </div>
                  </td>
                  <td>${evaluator.assignedUsers || 0}人</td>
                  <td>
                    <span class="badge bg-warning">${evaluator.pendingEvaluations || 0}</span>
                  </td>
                  <td>${evaluator.completedThisMonth || 0}</td>
                  <td>
                    <span class="badge bg-${workloadLevel}">${workloadText}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHtml;
  }

  renderPendingEvaluations(evaluatorStats) {
    const container = document.getElementById('pendingEvaluationsList');
    if (!container) return;

    if (!evaluatorStats || evaluatorStats.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-check-circle fa-2x mb-2"></i>
          <p>承認待ちの評価はありません</p>
        </div>
      `;
      return;
    }

    const listHtml = evaluatorStats.slice(0, 5).map(stat => `
      <div class="d-flex align-items-center justify-content-between py-3 border-bottom">
        <div>
          <strong>${this.app.sanitizeHtml(stat.evaluatorName)}</strong>
          <br>
          <small class="text-muted">
            <i class="fas fa-clock me-1"></i>
            ${stat.count}件の承認待ち評価
          </small>
        </div>
        <div>
          <span class="badge bg-warning">${stat.count}</span>
        </div>
      </div>
    `).join('');

    container.innerHTML = listHtml || `
      <div class="text-center py-4 text-muted">
        <p>承認待ちの評価はありません</p>
      </div>
    `;
  }

  renderPendingEvaluationsList(evaluations) {
    const container = document.getElementById('pendingEvaluationsList');
    if (!container) return;

    if (!evaluations || evaluations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-check-circle fa-2x mb-2"></i>
          <p>承認待ちの評価はありません</p>
        </div>
      `;
      return;
    }

    const listHtml = evaluations.slice(0, 5).map(evaluation => `
      <div class="d-flex align-items-center justify-content-between py-3 border-bottom">
        <div>
          <strong>${this.app.sanitizeHtml(evaluation.targetUserName || '不明')}</strong>
          <br>
          <small class="text-muted">
            <i class="fas fa-calendar me-1"></i>
            ${this.app.formatDate(evaluation.createdAt)}
          </small>
        </div>
        <div>
          <a href="#/evaluation-form?id=${evaluation.id}" class="btn btn-sm btn-outline-primary" data-link>
            確認
          </a>
        </div>
      </div>
    `).join('');

    container.innerHTML = listHtml;
  }

  renderRecentEvaluations(evaluations) {
    const container = document.getElementById('recentEvaluationsList');
    if (!container) return;

    if (!evaluations || evaluations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-clipboard-list fa-2x mb-2"></i>
          <p>評価活動がありません</p>
        </div>
      `;
      return;
    }

    const listHtml = evaluations.map(evaluation => {
      const statusClass = this.app.getStatusBadgeClass(evaluation.status);
      const statusLabel = this.getStatusLabel(evaluation.status);
      
      return `
        <div class="d-flex align-items-center justify-content-between py-3 border-bottom">
          <div>
            <strong>${this.app.sanitizeHtml(evaluation.evaluatorName || '評価者未設定')}</strong>
            <br>
            <small class="text-muted">
              <i class="fas fa-calendar me-1"></i>
              ${this.app.formatDate(evaluation.updatedAt || evaluation.createdAt)}
            </small>
          </div>
          <div>
            <span class="badge ${statusClass}">${statusLabel}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = listHtml;
  }

  renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    if (!this.notifications || this.notifications.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-bell-slash fa-2x mb-2"></i>
          <p>通知はありません</p>
        </div>
      `;
      return;
    }

    const notificationHtml = this.notifications.slice(0, 10).map(notification => `
      <div class="notification-item p-3 border-bottom ${notification.read ? '' : 'bg-light'}" 
           data-id="${notification.id}">
        <div class="d-flex align-items-start">
          <div class="me-2">
            ${notification.read ? 
              '<i class="fas fa-circle text-muted" style="font-size: 8px;"></i>' :
              '<i class="fas fa-circle text-primary" style="font-size: 8px;"></i>'
            }
          </div>
          <div class="flex-grow-1">
            <p class="mb-1 ${notification.read ? 'text-muted' : ''}">${this.app.sanitizeHtml(notification.message)}</p>
            <small class="text-muted">
              <i class="fas fa-clock me-1"></i>
              ${this.app.formatDate(notification.createdAt, true)}
            </small>
          </div>
          ${!notification.read ? `
            <button class="btn btn-sm btn-outline-secondary mark-read-btn" data-id="${notification.id}">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    container.innerHTML = notificationHtml;

    // 既読ボタンのイベントリスナー
    container.querySelectorAll('.mark-read-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.markNotificationAsRead(btn.dataset.id);
      });
    });
  }

  async markNotificationAsRead(notificationId) {
    try {
      await this.app.api.markNotificationAsRead(notificationId);
      
      // ローカルデータを更新
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }

      // UIを更新
      this.renderNotifications();
      
      // バッジを更新
      const unreadCount = this.notifications.filter(n => !n.read).length;
      document.getElementById('notificationBadge').textContent = unreadCount;

    } catch (error) {
      console.error('Dashboard: Error marking notification as read:', error);
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const unreadNotifications = this.notifications.filter(n => !n.read);
      
      await Promise.all(unreadNotifications.map(notification => 
        this.app.api.markNotificationAsRead(notification.id)
      ));

      // ローカルデータを更新
      this.notifications.forEach(notification => {
        notification.read = true;
      });

      // UIを更新
      this.renderNotifications();
      document.getElementById('notificationBadge').textContent = '0';

      this.app.showSuccess('すべての通知を既読にしました');

    } catch (error) {
      console.error('Dashboard: Error marking all notifications as read:', error);
      this.app.showError('通知の既読化に失敗しました');
    }
  }

  startAutoRefresh() {
    // 5分ごとに自動更新
    this.refreshTimer = setInterval(() => {
      console.log('Dashboard: Auto-refresh triggered');
      this.loadData();
    }, 5 * 60 * 1000);
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
    // 自動更新タイマーをクリア
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    console.log('Dashboard: Cleanup completed');
  }
}
