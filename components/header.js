// components/header.js - 通知バッジ機能追加 + i18n対応

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
              <span class="fw-bold" data-i18n="app.system_name">評価管理システム</span>
            </a>

            <!-- モバイル用メニューボタン -->
            <button class="navbar-toggler d-lg-none" type="button" id="sidebarToggle">
              <span class="navbar-toggler-icon"></span>
            </button>

            <!-- ナビゲーションメニュー -->
            <div class="navbar-nav ms-auto d-flex flex-row align-items-center">
              
              <!-- 🌐 言語切り替えUI -->
              <div class="nav-item me-3 d-none d-md-block">
                <select class="form-select form-select-sm border-0 bg-light" 
                        data-i18n-lang-switcher 
                        style="width: 130px; font-size: 0.875rem;"
                        data-i18n-title="common.language">
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                </select>
              </div>
              
              <!-- 通知ドロップダウン -->
              ${isEvaluator || isAdmin ? `
              <div class="nav-item dropdown me-3">
                <a class="nav-link position-relative" href="#" id="notificationDropdown" 
                   role="button" data-bs-toggle="dropdown" aria-expanded="false"
                   data-i18n-title="common.notifications">
                  <i class="fas fa-bell fa-lg"></i>
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                        id="headerNotificationBadge" style="display: none;">
                    0
                  </span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end notification-dropdown" 
                    aria-labelledby="notificationDropdown" style="width: 350px; max-height: 400px; overflow-y: auto;">
                  <li class="dropdown-header d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-bell me-2"></i><span data-i18n="common.notifications">通知</span></span>
                    <button class="btn btn-sm btn-outline-secondary" id="markAllNotificationsRead"
                            data-i18n="common.mark_all_read">
                      すべて既読
                    </button>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <div id="headerNotificationsList">
                    <li class="text-center py-3">
                      <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden" data-i18n="common.loading">読み込み中...</span>
                      </div>
                    </li>
                  </div>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-center" href="#/evaluations?filter=pending" data-link>
                      <i class="fas fa-list me-2"></i>
                      <span data-i18n="common.view_all_notifications">すべての通知を表示</span>
                    </a>
                  </li>
                </ul>
              </div>
              ` : ''}

              <!-- クイックアクション -->
              <div class="nav-item dropdown me-3">
                <a class="nav-link" href="#" id="quickActionDropdown" 
                   role="button" data-bs-toggle="dropdown" aria-expanded="false"
                   data-i18n-title="common.quick_actions">
                  <i class="fas fa-plus-circle fa-lg"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="quickActionDropdown">
                  ${isAdmin ? `
                  <li>
                    <a class="dropdown-item" href="#/users" data-link>
                      <i class="fas fa-user-plus me-2"></i>
                      <span data-i18n="users.invite_user">ユーザー招待</span>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/settings" data-link>
                      <i class="fas fa-cog me-2"></i>
                      <span data-i18n="nav.settings">システム設定</span>
                    </a>
                  </li>
                  ` : isEvaluator ? `
                  <li>
                    <a class="dropdown-item" href="#/evaluation-form" data-link>
                      <i class="fas fa-edit me-2"></i>
                      <span data-i18n="evaluation.new_evaluation">新規評価作成</span>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/evaluations?filter=pending" data-link>
                      <i class="fas fa-clipboard-check me-2"></i>
                      <span data-i18n="evaluation.pending_evaluations">承認待ち評価</span>
                    </a>
                  </li>
                  ` : `
                  <li>
                    <a class="dropdown-item" href="#/goal-setting" data-link>
                      <i class="fas fa-target me-2"></i>
                      <span data-i18n="nav.goal_setting">目標設定</span>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/evaluations" data-link>
                      <i class="fas fa-chart-bar me-2"></i>
                      <span data-i18n="evaluation.my_evaluations">マイ評価</span>
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
                      <i class="fas fa-user me-2"></i>
                      <span data-i18n="nav.profile">プロフィール</span>
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#/evaluations" data-link>
                      <i class="fas fa-chart-bar me-2"></i>
                      <span data-i18n="evaluation.my_evaluations">マイ評価</span>
                    </a>
                  </li>
                  <!-- モバイル用言語切り替え -->
                  <li class="d-block d-md-none">
                    <hr class="dropdown-divider">
                    <div class="dropdown-item-text">
                      <div class="d-flex align-items-center">
                        <i class="fas fa-language me-2"></i>
                        <select class="form-select form-select-sm" 
                                data-i18n-lang-switcher 
                                style="width: 120px;">
                          <option value="ja">🇯🇵 日本語</option>
                          <option value="en">🇺🇸 English</option>
                          <option value="vi">🇻🇳 Tiếng Việt</option>
                        </select>
                      </div>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" id="logoutBtn">
                      <i class="fas fa-sign-out-alt me-2"></i>
                      <span data-i18n="nav.logout">ログアウト</span>
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
    
    // 🌐 翻訳を適用
    if (window.i18n) {
      const headerElement = document.querySelector('.header');
      if (headerElement) {
        window.i18n.updateElement(headerElement);
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

  // ログアウト - 修正版
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation(); // イベントの伝播を停止
      
      try {
        console.log('Header: Logout button clicked');
        
        const confirmMessage = window.i18n ? 
          window.i18n.t('auth.confirm_logout') : 
          'ログアウトしてもよろしいですか？';
        
        // Bootstrapのドロップダウンを閉じる
        const dropdown = window.bootstrap?.Dropdown?.getInstance(logoutBtn.closest('.dropdown-toggle'));
        if (dropdown) {
          dropdown.hide();
        }
        
        const confirmed = await this.app.confirm(
          confirmMessage,
          window.i18n ? window.i18n.t('auth.logout') : 'ログアウト確認'
        );
        
        if (confirmed) {
          console.log('Header: User confirmed logout');
          
          // ログアウト処理を実行
          if (this.app.auth && typeof this.app.auth.logout === 'function') {
            await this.app.auth.logout();
            console.log('Header: Auth logout completed');
          } else {
            console.error('Header: Auth.logout method not found');
            throw new Error('認証システムが利用できません');
          }
          
          // ナビゲーションを実行
          if (typeof this.app.navigate === 'function') {
            this.app.navigate('#/login');
            console.log('Header: Navigated to login page');
          } else {
            window.location.hash = '#/login';
          }
        }
      } catch (error) {
        console.error('Header: Error during logout:', error);
        const errorMessage = window.i18n ? 
          window.i18n.t('errors.logout_failed') : 
          'ログアウト中にエラーが発生しました';
        this.app.showError(errorMessage);
      }
    });
  }

  // その他のイベントリスナー設定...
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

  // 言語切り替え後の追加処理
  document.addEventListener('change', (e) => {
    if (e.target.hasAttribute('data-i18n-lang-switcher')) {
      setTimeout(() => {
        this.updateRoleLabels();
        this.updateNotificationTitles();
      }, 100);
    }
  });
}

  // 🌐 役割ラベルを更新
  updateRoleLabels() {
    const currentUser = this.app.currentUser;
    if (!currentUser) return;

    const roleElements = document.querySelectorAll('.text-muted');
    roleElements.forEach(element => {
      if (element.textContent === this.getRoleLabel(currentUser.role, 'ja') ||
          element.textContent === this.getRoleLabel(currentUser.role, 'en') ||
          element.textContent === this.getRoleLabel(currentUser.role, 'vi')) {
        element.textContent = this.getRoleLabel(currentUser.role);
      }
    });
  }

  // 🌐 通知タイトルを更新
  updateNotificationTitles() {
    this.renderNotificationsList();
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
          message: window.i18n ? 
            window.i18n.t('notifications.evaluation_pending', { userName: evaluation.targetUserName || '不明' }) :
            `${evaluation.targetUserName || '不明'}さんの評価が承認待ちです`,
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
            message: window.i18n ? 
              window.i18n.t('notifications.admin_evaluation_pending', { 
                userName: evaluation.targetUserName || '不明',
                evaluatorName: stat.evaluatorName 
              }) :
              `${evaluation.targetUserName || '不明'}さんの評価が${stat.evaluatorName}の承認待ちです`,
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
      const noNotificationsText = window.i18n ? 
        window.i18n.t('common.no_notifications') : '通知はありません';
      
      container.innerHTML = `
        <li class="text-center py-3 text-muted">
          <i class="fas fa-bell-slash fa-2x mb-2"></i>
          <div>${noNotificationsText}</div>
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

      const successMessage = window.i18n ? 
        window.i18n.t('messages.mark_all_notifications_read') : 
        'すべての通知を既読にしました';
      this.app.showSuccess(successMessage);

    } catch (error) {
      console.error('Header: Error marking all notifications as read:', error);
      const errorMessage = window.i18n ? 
        window.i18n.t('errors.mark_notifications_failed') : 
        '通知の既読化に失敗しました';
      this.app.showError(errorMessage);
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
    if (window.i18n) {
      return window.i18n.t(`notifications.type.${type}`) || window.i18n.t('common.notification');
    }
    
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

      if (window.i18n) {
        if (diffMinutes < 1) {
          return window.i18n.t('time.just_now');
        } else if (diffMinutes < 60) {
          return window.i18n.t('time.minutes_ago', { count: diffMinutes });
        } else if (diffHours < 24) {
          return window.i18n.t('time.hours_ago', { count: diffHours });
        } else if (diffDays < 7) {
          return window.i18n.t('time.days_ago', { count: diffDays });
        } else {
          return this.app.formatDate(date);
        }
      } else {
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

  getRoleLabel(role, lang = null) {
    const currentLang = lang || (window.i18n ? window.i18n.getCurrentLanguage() : 'ja');
    
    if (window.i18n && !lang) {
      return window.i18n.t(`roles.${role}`) || role;
    }
    
    const labels = {
      ja: {
        admin: '管理者',
        evaluator: '評価者',
        worker: '一般ユーザー',
        developer: '開発者'
      },
      en: {
        admin: 'Administrator',
        evaluator: 'Evaluator',
        worker: 'Worker',
        developer: 'Developer'
      },
      vi: {
        admin: 'Quản trị viên',
        evaluator: 'Người đánh giá',
        worker: 'Công nhân',
        developer: 'Nhà phát triển'
      }
    };
    
    return labels[currentLang]?.[role] || role;
  }

  cleanup() {
    // 通知ポーリングを停止
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
      this.notificationTimer = null;
    }
    
    // i18nオブザーバーから削除
    if (window.i18n) {
      window.i18n.removeObserver(this.updateRoleLabels);
    }
    
    console.log('Header: Cleanup completed');
  }
}

// 🌐 レガシー関数（互換性のため残す）
function createHeader() {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <!-- ブランドロゴ -->
                <a class="navbar-brand" href="#dashboard" data-i18n="app.system_name">
                    <i class="fas fa-hard-hat me-2"></i>
                    建設業評価管理システム
                </a>

                <!-- モバイルメニューボタン -->
                <button class="navbar-toggler d-lg-none" type="button" id="sidebarToggle">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- ナビゲーションメニュー（デスクトップ） -->
                <div class="navbar-nav d-none d-lg-flex">
                    <a class="nav-link" href="#dashboard" data-i18n="nav.dashboard">ダッシュボード</a>
                    <a class="nav-link" href="#users" data-i18n="nav.users">ユーザー管理</a>
                    <a class="nav-link" href="#evaluations" data-i18n="nav.evaluations">評価一覧</a>
                    <a class="nav-link" href="#evaluation" data-i18n="nav.evaluation">評価入力</a>
                </div>

                <!-- 右側のUIエリア -->
                <div class="d-flex align-items-center">
                    <!-- 🌐 言語切り替えUI -->
                    <div class="me-3">
                        <select class="form-select form-select-sm bg-light text-dark border-0" 
                                data-i18n-lang-switcher 
                                style="width: 130px; font-size: 0.875rem;"
                                data-i18n-title="common.language">
                            <option value="ja">🇯🇵 日本語</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                        </select>
                    </div>

                    <!-- ユーザーメニュー -->
                    <div class="dropdown">
                        <button class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center" 
                                type="button" 
                                id="userDropdown" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false">
                            <i class="fas fa-user-circle me-2"></i>
                            <span id="currentUserName" data-i18n="common.user">ユーザー</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li>
                                <a class="dropdown-item" href="#profile">
                                    <i class="fas fa-user me-2"></i>
                                    <span data-i18n="nav.profile">プロフィール</span>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="#settings">
                                    <i class="fas fa-cog me-2"></i>
                                    <span data-i18n="nav.settings">設定</span>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item text-danger" href="#" id="logoutBtn">
                                    <i class="fas fa-sign-out-alt me-2"></i>
                                    <span data-i18n="nav.logout">ログアウト</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// ヘッダーを描画し、翻訳を適用
function renderHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;

    // HTMLを生成
    headerContainer.innerHTML = createHeader();

    // 🌐 翻訳を適用
    if (window.i18n) {
        window.i18n.updateElement(headerContainer);
        
        // 現在のユーザー名を表示
        updateCurrentUserDisplay();
    }

    // イベントリスナーを設定
    setupHeaderEventListeners();
}

// 現在のユーザー名を表示
function updateCurrentUserDisplay() {
    const currentUserElement = document.getElementById('currentUserName');
    if (currentUserElement && window.app && window.app.currentUser) {
        currentUserElement.textContent = window.app.currentUser.name || 
          (window.i18n ? window.i18n.t('common.user') : 'ユーザー');
    }
}

// ヘッダーのイベントリスナーを設定
function setupHeaderEventListeners() {
    // サイドバートグルボタン
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar-container');
            const backdrop = document.getElementById('sidebar-backdrop');
            
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
            if (backdrop) {
                backdrop.classList.toggle('show');
            }
        });
    }

    // ログアウトボタン
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // 確認ダイアログ
            const confirmMessage = window.i18n ? 
              window.i18n.t('auth.confirm_logout') : 
              'ログアウトしますか？';
            const confirmLogout = confirm(confirmMessage);
            
            if (confirmLogout && window.app) {
                try {
                    await window.app.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                    const errorMessage = window.i18n ? 
                      window.i18n.t('errors.logout_failed') : 
                      'ログアウトに失敗しました';
                    alert(errorMessage);
                }
            }
        });
    }

    // 言語切り替えの変更を監視（i18n.js が自動的に処理するが、追加処理が必要な場合）
    const langSwitcher = document.querySelector('[data-i18n-lang-switcher]');
    if (langSwitcher) {
        langSwitcher.addEventListener('change', () => {
            // 言語切り替え後に現在のユーザー名表示を更新
            setTimeout(() => {
                updateCurrentUserDisplay();
            }, 100);
        });
    }
}

// 言語が変更された時の処理（オブザーバー）
function onLanguageChanged() {
    updateCurrentUserDisplay();
    
    // 他の動的コンテンツも更新
    if (window.app && window.app.currentPage) {
        // ページタイトルの更新
        updatePageTitle();
    }
}

// ページタイトルを更新
function updatePageTitle() {
    if (window.i18n) {
        // ページごとのタイトル設定
        const currentPage = window.app?.currentPage || 'dashboard';
        const newTitle = window.i18n.t(`${currentPage}.title`) + ' - ' + window.i18n.t('app.system_name');
        document.title = newTitle;
    }
}

// i18nのオブザーバーに登録
if (window.i18n) {
    window.i18n.addObserver(onLanguageChanged);
}

// エクスポート
export { renderHeader, updateCurrentUserDisplay };
