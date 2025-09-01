// components/header.js - 通知バッジ機能追加

export class HeaderComponent {
  constructor(app) {
    this.app = app;
    this.notifications = [];
    this.notificationTimer = null;
  }

  render() {
    const currentUser = this.app.currentUser;
    if (!currentUser) return '';

    const isEvaluator = currentUser.role === 'evaluator';
    const isAdmin = currentUser.role === 'admin';

    return `
      <header class="header bg-white shadow-sm border-bottom">
        <nav class="navbar navbar-expand-lg navbar-light px-4">
          <div class="container-fluid p-0">
            <!-- ブランド -->
            <a class="navbar-brand d-flex align-items-center" href="#/dashboard" data-link>
              <i class="fas fa-hard-hat text-primary me-2"></i>
              <span class="fw-bold">評価管理システム</span>
            </a>

            <!-- モバイル用メニューボタン -->
            <button class="navbar-toggler d-lg-none" type="button" id="sidebarToggle">
              <span class="navbar-toggler-icon"></span>
            </button>

            <!-- ナビゲーションメニュー -->
            <div class="navbar-nav ms-auto d-flex flex-row align-items-center">
              
              <!-- 通知ドロップダウン -->
              ${isEvaluator || isAdmin ? `
              <div class="nav-item dropdown me-3">
                <a class="nav-link position-relative" href="#" id="notificationDropdown" 
                   role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-bell fa-lg"></i>
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                        id="headerNotificationBadge" style="display: none;">
                    0
                  </span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end notification-dropdown" 
                    aria-labelledby="notificationDropdown" style="width: 350px; max-height: 400px; overflow-y: auto;">
                  <li class="dropdown-header d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-bell me-2"></i>通知</span>
                    <button class="btn btn-sm btn-outline-secondary" id="markAllNotificationsRead">
                      すべて既読
                    </button>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <div id="headerNotificationsList">
                    <li class="text-center py-3">
                      <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">読み込み中...</span>
                      </div>
                    </li>
                  </div>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-center" href="#/evaluations?filter=pending" data-link>
                      <i class="fas fa-list me-2"></i>すべての通知を表示
                    </a>
                  </li>
                </ul>
              </div>
              ` : ''}

              <!-- クイックアクション -->
              <div class="nav-item dropdown me-3">
                <a class="nav-link" href="#" id="quickActionDropdown" 
                   role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-plus-circle fa-lg"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="quickActionDropdown">
                  ${isAdmin ? `
                  <li>
                    <a class="dropdown-item" href="#/users" data-link>
                      <i class="fas fa-user-plus me-2"></i>ユーザー招待
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/settings" data-link>
                      <i class="fas fa-cog me-2"></i>システム設定
                    </a>
                  </li>
                  ` : isEvaluator ? `
                  <li>
                    <a class="dropdown-item" href="#/evaluation-form" data-link>
                      <i class="fas fa-edit me-2"></i>新規評価作成
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/evaluations?filter=pending" data-link>
                      <i class="fas fa-clipboard-check me-2"></i>承認待ち評価
                    </a>
                  </li>
                  ` : `
                  <li>
                    <a class="dropdown-item" href="#/goal-setting" data-link>
                      <i class="fas fa-target me-2"></i>目標設定
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/evaluations" data-link>
                      <i class="fas fa-chart-bar me-2"></i>マイ評価
                    </a>
                  </li>
                  `}
                </ul>
              </div>

              <!-- ユーザーメニュー -->
              <div class="nav-item dropdown">
                <a class="nav-link d-flex align-items-center" href="#" id="userDropdown" 
                   role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <div class="avatar-sm me-2">
                    <span class="avatar-title rounded-circle bg-primary">
                      ${this.getInitials(currentUser.name)}
                    </span>
                  </div>
                  <div class="d-none d-md-block">
                    <div class="fw-semibold">${this.app.sanitizeHtml(currentUser.name)}</div>
                    <small class="text-muted">${this.getRoleLabel(currentUser.role)}</small>
                  </div>
                  <i class="fas fa-chevron-down ms-2"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li class="dropdown-header">
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">
                        <span class="avatar-title rounded-circle bg-primary">
                          ${this.getInitials(currentUser.name)}
                        </span>
                      </div>
                      <div>
                        <div class="fw-semibold">${this.app.sanitizeHtml(currentUser.name)}</div>
                        <small class="text-muted">${this.app.sanitizeHtml(currentUser.email)}</small>
                      </div>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#/profile" data-link>
                      <i class="fas fa-user me-2"></i>プロフィール
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/evaluations" data-link>
                      <i class="fas fa-chart-bar me-2"></i>マイ評価
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" id="logoutBtn">
                      <i class="fas fa-sign-out-alt me-2"></i>ログアウト
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </header>
    `;
  }

  init() {
    console.log('Header: Initializing...');
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // 通知の読み込み（評価者・管理者のみ）
    const currentUser = this.app.currentUser;
    if (currentUser && (currentUser.role === 'evaluator' || currentUser.role === 'admin')) {
      this.loadNotifications();
      this.startNotificationPolling();
    }
  }

  setupEventListeners() {
    // サイドバートグル
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.app.sidebar.toggle();
      });
    }

    // ログアウト
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
      const confirmed = await this.app.confirm(
        'ログアウトしてもよろしいですか？',
        'ログアウト確認'
      );
      
      if (confirmed) {
        console.log('Header: Logging out user...');
        await this.app.logout();
        console.log('Header: User logged out successfully');
      }
    } catch (error) {
      console.error('Header: Error during logout:', error);
      this.app.showError('ログアウト中にエラーが発生しました');
    }
  });
}

    // 通知全既読ボタン
    const markAllReadBtn = document.getElementById('markAllNotificationsRead');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => this.markAllNotificationsAsRead());
    }

    // 通知ドロップダウンが開かれた時に通知を更新
    const notificationDropdown = document.getElementById('notificationDropdown');
    if (notificationDropdown) {
      notificationDropdown.addEventListener('show.bs.dropdown', () => {
        this.loadNotifications();
      });
    }
  }

  async loadNotifications() {
    try {
      console.log('Header: Loading notifications...');
      
      // 評価者・管理者の場合のみ承認待ち評価を通知として取得
      const currentUser = this.app.currentUser;
      if (!currentUser) return;

      let notifications = [];
      
      if (currentUser.role === 'evaluator') {
        // 評価者：自分の担当する承認待ち評価
        const pendingEvaluations = await this.app.api.getPendingEvaluationsForCurrentUser();
        notifications = pendingEvaluations.map(evaluation => ({
          id: `eval_${evaluation.id}`,
          type: 'evaluation_pending',
          message: `${evaluation.targetUserName || '不明'}さんの評価が承認待ちです`,
          createdAt: evaluation.createdAt,
          evaluationId: evaluation.id,
          read: false
        }));
        
      } else if (currentUser.role === 'admin') {
        // 管理者：すべての承認待ち評価
        const pendingStats = await this.app.api.getPendingEvaluationStats();
        notifications = pendingStats.byEvaluator.flatMap(stat => 
          stat.evaluations.slice(0, 3).map(evaluation => ({
            id: `eval_${evaluation.id}`,
            type: 'evaluation_pending',
            message: `${evaluation.targetUserName || '不明'}さんの評価が${stat.evaluatorName}の承認待ちです`,
            createdAt: evaluation.createdAt,
            evaluationId: evaluation.id,
            evaluatorName: stat.evaluatorName,
            read: false
          }))
        );
      }

      // 通知データから取得した通知も追加
      try {
        const systemNotifications = await this.app.api.getNotifications();
        notifications = [...notifications, ...systemNotifications.slice(0, 10)];
      } catch (error) {
        console.warn('Header: Could not load system notifications:', error);
      }

      // 作成日時でソート（新しい順）
      notifications.sort((a, b) => {
        const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return bTime - aTime;
      });

      this.notifications = notifications.slice(0, 15); // 最大15件
      
      // 通知バッジとリストを更新
      this.updateNotificationBadge();
      this.renderNotificationsList();

      console.log('Header: Notifications loaded:', this.notifications.length);

    } catch (error) {
      console.error('Header: Error loading notifications:', error);
    }
  }

  updateNotificationBadge() {
    const badge = document.getElementById('headerNotificationBadge');
    if (!badge) return;

    const unreadCount = this.notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = 'inline-block';
      
      // 通知音を再生（オプション）
      this.playNotificationSound();
    } else {
      badge.style.display = 'none';
    }
  }

  renderNotificationsList() {
    const container = document.getElementById('headerNotificationsList');
    if (!container) return;

    if (this.notifications.length === 0) {
      container.innerHTML = `
        <li class="text-center py-3 text-muted">
          <i class="fas fa-bell-slash fa-2x mb-2"></i>
          <div>通知はありません</div>
        </li>
      `;
      return;
    }

    const notificationHtml = this.notifications.map(notification => `
      <li>
        <a class="dropdown-item notification-item py-3 ${notification.read ? 'text-muted' : ''}" 
           href="${notification.evaluationId ? `#/evaluation-form?id=${notification.evaluationId}` : '#'}" 
           data-id="${notification.id}"
           data-link>
          <div class="d-flex align-items-start">
            <div class="me-2 mt-1">
              ${notification.read ? 
                '<i class="fas fa-circle text-muted" style="font-size: 8px;"></i>' :
                '<i class="fas fa-circle text-primary" style="font-size: 8px;"></i>'
              }
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold mb-1">${this.getNotificationTitle(notification.type)}</div>
              <div class="small ${notification.read ? 'text-muted' : ''}">${this.app.sanitizeHtml(notification.message)}</div>
              <div class="small text-muted mt-1">
                <i class="fas fa-clock me-1"></i>
                ${this.getRelativeTime(notification.createdAt)}
              </div>
            </div>
            <div class="ms-2">
              ${notification.type === 'evaluation_pending' ? 
                '<i class="fas fa-exclamation-triangle text-warning"></i>' :
                '<i class="fas fa-info-circle text-info"></i>'
              }
            </div>
          </div>
        </a>
      </li>
    `).join('');

    container.innerHTML = notificationHtml;

    // 通知クリック時の既読処理
    container.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const notificationId = item.dataset.id;
        if (notificationId && !item.classList.contains('text-muted')) {
          this.markNotificationAsRead(notificationId);
        }
      });
    });
  }

  async markNotificationAsRead(notificationId) {
    try {
      // システム通知の場合のみAPIで既読処理
      if (!notificationId.startsWith('eval_')) {
        await this.app.api.markNotificationAsRead(notificationId);
      }
      
      // ローカルデータを更新
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }

      // UIを更新
      this.updateNotificationBadge();
      this.renderNotificationsList();

    } catch (error) {
      console.error('Header: Error marking notification as read:', error);
    }
  }

  async markAllNotificationsAsRead() {
    try {
      // システム通知のみAPIで既読処理
      const systemNotifications = this.notifications.filter(n => !n.id.startsWith('eval_') && !n.read);
      
      await Promise.all(systemNotifications.map(notification => 
        this.app.api.markNotificationAsRead(notification.id)
      ));

      // すべての通知をローカルで既読に
      this.notifications.forEach(notification => {
        notification.read = true;
      });

      // UIを更新
      this.updateNotificationBadge();
      this.renderNotificationsList();

      this.app.showSuccess('すべての通知を既読にしました');

    } catch (error) {
      console.error('Header: Error marking all notifications as read:', error);
      this.app.showError('通知の既読化に失敗しました');
    }
  }

  startNotificationPolling() {
    // 2分ごとに通知をチェック
    this.notificationTimer = setInterval(() => {
      console.log('Header: Polling notifications...');
      this.loadNotifications();
    }, 2 * 60 * 1000);
  }

  playNotificationSound() {
    try {
      // シンプルなビープ音（オプション機能）
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // 音声再生エラーは無視
      console.debug('Header: Could not play notification sound:', error);
    }
  }

  getNotificationTitle(type) {
    const titles = {
      'evaluation_pending': '評価承認待ち',
      'evaluation_completed': '評価完了',
      'user_assigned': 'ユーザー割り当て',
      'system_update': 'システム更新',
      'reminder': 'リマインダー'
    };
    return titles[type] || '通知';
  }

  getRelativeTime(timestamp) {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return 'たった今';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分前`;
      } else if (diffHours < 24) {
        return `${diffHours}時間前`;
      } else if (diffDays < 7) {
        return `${diffDays}日前`;
      } else {
        return this.app.formatDate(date);
      }
    } catch (error) {
      return this.app.formatDate(timestamp);
    }
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

  getRoleLabel(role) {
    const labels = {
      admin: '管理者',
      evaluator: '評価者',
      worker: '一般ユーザー',
      developer: '開発者'
    };
    return labels[role] || role;
  }

  cleanup() {
    // 通知ポーリングを停止
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
      this.notificationTimer = null;
    }
    
    console.log('Header: Cleanup completed');
  }
}
