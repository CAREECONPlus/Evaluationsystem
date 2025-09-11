/**
 * Unified UI Components Library
 * 統合UIコンポーネントライブラリ
 */

class UIComponents {
  constructor() {
    this.loadingStates = new Set();
  }

  /**
   * ローディング状態の管理
   */
  setLoading(id, isLoading) {
    if (isLoading) {
      this.loadingStates.add(id);
    } else {
      this.loadingStates.delete(id);
    }
  }

  /**
   * ローディングスピナー
   */
  loadingSpinner(size = 'md', text = null) {
    const sizeClass = {
      sm: 'spinner-sm',
      md: '',
      lg: 'spinner-lg'
    }[size] || '';

    return `
      <div class="d-flex align-items-center justify-content-center p-4">
        <div class="spinner-border text-primary ${sizeClass}" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        ${text ? `<span class="ms-2 text-muted">${text}</span>` : ''}
      </div>
    `;
  }

  /**
   * エラー表示コンポーネント
   */
  errorMessage(message, type = 'danger', dismissible = true) {
    const alertClass = `alert-${type}`;
    const dismissibleClass = dismissible ? 'alert-dismissible' : '';
    const dismissButton = dismissible ? `
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    ` : '';

    return `
      <div class="alert ${alertClass} ${dismissibleClass} d-flex align-items-center" role="alert">
        <i class="fas ${this.getAlertIcon(type)} me-2"></i>
        <div class="flex-grow-1">${message}</div>
        ${dismissButton}
      </div>
    `;
  }

  /**
   * 成功メッセージ
   */
  successMessage(message, dismissible = true) {
    return this.errorMessage(message, 'success', dismissible);
  }

  /**
   * 警告メッセージ
   */
  warningMessage(message, dismissible = true) {
    return this.errorMessage(message, 'warning', dismissible);
  }

  /**
   * 情報メッセージ
   */
  infoMessage(message, dismissible = true) {
    return this.errorMessage(message, 'info', dismissible);
  }

  /**
   * アラートアイコンを取得
   */
  getAlertIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      danger: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
  }

  /**
   * 空の状態表示
   */
  emptyState(icon, title, description, actionButton = null) {
    return `
      <div class="empty-state text-center py-5">
        <div class="empty-state-icon mb-3">
          <i class="fas ${icon} fa-3x text-muted"></i>
        </div>
        <h5 class="empty-state-title text-muted">${title}</h5>
        <p class="empty-state-description text-muted mb-3">${description}</p>
        ${actionButton || ''}
      </div>
    `;
  }

  /**
   * 統計カード
   */
  statsCard(icon, title, value, subtitle = null, color = 'primary') {
    return `
      <div class="card stats-card h-100 shadow-sm">
        <div class="card-body d-flex align-items-center">
          <div class="stats-icon me-3">
            <div class="stats-icon-wrapper bg-${color} bg-opacity-10">
              <i class="fas ${icon} fa-2x text-${color}"></i>
            </div>
          </div>
          <div class="stats-content flex-grow-1">
            <div class="stats-title text-muted small mb-1">${title}</div>
            <div class="stats-value h3 mb-0 fw-bold text-dark">${value}</div>
            ${subtitle ? `<div class="stats-subtitle text-muted small">${subtitle}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * ユーザーアバター
   */
  userAvatar(user, size = 'md') {
    const sizeClass = {
      sm: 'avatar-sm',
      md: 'avatar-md', 
      lg: 'avatar-lg'
    }[size] || 'avatar-md';

    const initials = this.getInitials(user.name || user.email);
    
    return `
      <div class="user-avatar ${sizeClass}">
        ${user.photoURL ? 
          `<img src="${user.photoURL}" alt="${user.name}" class="avatar-img">` :
          `<div class="avatar-placeholder">${initials}</div>`
        }
      </div>
    `;
  }

  /**
   * ユーザーの頭文字を取得
   */
  getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * 役割バッジ
   */
  roleBadge(role) {
    const roleConfig = {
      admin: { text: '管理者', color: 'danger' },
      evaluator: { text: '評価者', color: 'warning' },
      worker: { text: '作業員', color: 'primary' },
      viewer: { text: '閲覧者', color: 'secondary' }
    };

    const config = roleConfig[role] || { text: role, color: 'secondary' };
    
    return `<span class="badge bg-${config.color}">${config.text}</span>`;
  }

  /**
   * ステータスバッジ
   */
  statusBadge(status) {
    const statusConfig = {
      active: { text: 'アクティブ', color: 'success' },
      inactive: { text: '非アクティブ', color: 'secondary' },
      pending: { text: '保留中', color: 'warning' },
      suspended: { text: '停止中', color: 'danger' }
    };

    const config = statusConfig[status] || { text: status, color: 'secondary' };
    
    return `<span class="badge bg-${config.color}">${config.text}</span>`;
  }

  /**
   * スコア表示
   */
  scoreDisplay(score, maxScore = 5) {
    const percentage = (score / maxScore) * 100;
    let colorClass = 'success';
    
    if (percentage < 40) colorClass = 'danger';
    else if (percentage < 70) colorClass = 'warning';
    
    return `
      <div class="score-display d-flex align-items-center">
        <div class="score-value me-2">
          <span class="h6 mb-0 text-${colorClass}">${score.toFixed(1)}</span>
          <span class="text-muted">/${maxScore}</span>
        </div>
        <div class="score-bar flex-grow-1">
          <div class="progress progress-sm">
            <div class="progress-bar bg-${colorClass}" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * アクションボタン
   */
  actionButton(icon, text, onClick, variant = 'primary', size = 'sm') {
    return `
      <button class="btn btn-${variant} btn-${size} action-btn" onclick="${onClick}">
        <i class="fas ${icon} me-1"></i>${text}
      </button>
    `;
  }

  /**
   * テーブル行のアクションドロップダウン
   */
  actionDropdown(actions) {
    const actionItems = actions.map(action => 
      action.divider ? '<li><hr class="dropdown-divider"></li>' :
      `<li><a class="dropdown-item" onclick="${action.onClick}">
        <i class="fas ${action.icon} me-2"></i>${action.text}
      </a></li>`
    ).join('');

    return `
      <div class="dropdown">
        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        <ul class="dropdown-menu">
          ${actionItems}
        </ul>
      </div>
    `;
  }

  /**
   * 確認ダイアログ
   */
  confirmDialog(title, message, onConfirm, onCancel = null) {
    const dialogId = 'confirm-dialog-' + Date.now();
    
    const dialogHTML = `
      <div class="modal fade" id="${dialogId}" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onclick="${onCancel || ''}">
                <span data-i18n="common.cancel">キャンセル</span>
              </button>
              <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="${onConfirm}">
                <span data-i18n="common.confirm">確認</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // ダイアログをDOMに追加
    const dialogElement = document.createElement('div');
    dialogElement.innerHTML = dialogHTML;
    document.body.appendChild(dialogElement.firstElementChild);

    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById(dialogId));
    modal.show();

    // モーダルが閉じられたらDOMから削除
    document.getElementById(dialogId).addEventListener('hidden.bs.modal', () => {
      document.getElementById(dialogId).remove();
    });
  }

  /**
   * トースト通知
   */
  showToast(message, type = 'info', duration = 3000) {
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
      <div id="${toastId}" class="toast" role="alert">
        <div class="toast-header">
          <i class="fas ${this.getAlertIcon(type)} me-2 text-${type}"></i>
          <strong class="me-auto">通知</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

    // トーストコンテナがなければ作成
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }

    // トーストを追加
    const toastElement = document.createElement('div');
    toastElement.innerHTML = toastHTML;
    toastContainer.appendChild(toastElement.firstElementChild);

    // トーストを表示
    const toast = new bootstrap.Toast(document.getElementById(toastId), {
      delay: duration
    });
    toast.show();

    // トーストが閉じられたらDOMから削除
    document.getElementById(toastId).addEventListener('hidden.bs.toast', () => {
      document.getElementById(toastId).remove();
    });
  }

  /**
   * フォームグループ（ラベル + 入力フィールド）
   */
  formGroup(label, input, helpText = null, required = false) {
    const requiredMark = required ? '<span class="text-danger">*</span>' : '';
    const helpBlock = helpText ? `<div class="form-text">${helpText}</div>` : '';

    return `
      <div class="mb-3">
        <label class="form-label">${label} ${requiredMark}</label>
        ${input}
        ${helpBlock}
      </div>
    `;
  }

  /**
   * CSS クラスとスタイルを追加
   */
  injectStyles() {
    const styles = `
      <style>
        /* UI Components Styles */
        .stats-card {
          border: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }

        .stats-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-sm { width: 32px; height: 32px; }
        .avatar-md { width: 40px; height: 40px; }
        .avatar-lg { width: 48px; height: 48px; }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #6c757d;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75em;
          font-weight: 600;
        }

        .progress-sm {
          height: 4px;
        }

        .score-display .progress {
          height: 6px;
          background-color: #e9ecef;
        }

        .empty-state {
          max-width: 400px;
          margin: 0 auto;
        }

        .empty-state-icon {
          opacity: 0.5;
        }

        .action-btn {
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .toast-container {
          z-index: 1060;
        }

        /* 一時認証の視覚的インジケーター */
        .temp-auth-indicator {
          background: linear-gradient(45deg, #ffc107, #fd7e14);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
      </style>
    `;

    if (!document.querySelector('#ui-components-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'ui-components-styles';
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
    }
  }
}

// シングルトンインスタンス
const ui = new UIComponents();

// グローバルに公開
window.UI = ui;

// CSS自動注入
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ui.injectStyles();
  });
}

export { UIComponents };
export default ui;