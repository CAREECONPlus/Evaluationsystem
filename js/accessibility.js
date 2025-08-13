/**
 * Accessibility Helper
 * アクセシビリティ機能
 */
export class AccessibilityHelper {
  constructor(app) {
    this.app = app;
    this.announcer = null;
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupHighContrast();
  }

  setupKeyboardNavigation() {
    // Escキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
          const bsModal = bootstrap.Modal.getInstance(modal);
          if (bsModal) bsModal.hide();
        });
      }
    });

    // Tabキーでのフォーカス管理
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }

  setupScreenReaderSupport() {
    // 動的コンテンツ更新の通知
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'visually-hidden';
    document.body.appendChild(this.announcer);
  }

  announce(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
      setTimeout(() => {
        this.announcer.textContent = '';
      }, 1000);
    }
  }

  setupHighContrast() {
    const stored = localStorage.getItem('highContrast');
    if (stored === 'true') {
      document.body.classList.add('high-contrast');
    }
  }

  toggleHighContrast() {
    const isEnabled = document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', isEnabled);
    this.announce(isEnabled ? 'ハイコントラストモード有効' : 'ハイコントラストモード無効');
  }

  // フォーム要素にARIA属性を追加
  enhanceForm(formElement) {
    if (!formElement) return;
    
    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const label = formElement.querySelector(`label[for="${input.id}"]`);
      if (label) {
        input.setAttribute('aria-label', label.textContent);
      }
      
      if (input.hasAttribute('required')) {
        input.setAttribute('aria-required', 'true');
      }
      
      // エラー表示用
      const errorDiv = input.nextElementSibling;
      if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
        input.setAttribute('aria-describedby', errorDiv.id || `error-${input.id}`);
        if (!errorDiv.id) errorDiv.id = `error-${input.id}`;
      }
    });
  }

  // ボタンにARIA属性を追加
  enhanceButton(button) {
    if (!button) return;
    
    if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
      const icon = button.querySelector('i');
      if (icon) {
        const label = icon.className.includes('fa-edit') ? '編集' :
                     icon.className.includes('fa-trash') ? '削除' :
                     icon.className.includes('fa-save') ? '保存' :
                     icon.className.includes('fa-close') ? '閉じる' : 'ボタン';
        button.setAttribute('aria-label', label);
      }
    }
  }

  // ページ全体のアクセシビリティを向上
  enhancePage() {
    // すべてのフォームを強化
    document.querySelectorAll('form').forEach(form => this.enhanceForm(form));
    
    // アイコンのみのボタンを強化
    document.querySelectorAll('button').forEach(button => this.enhanceButton(button));
    
    // 画像にalt属性を追加
    document.querySelectorAll('img:not([alt])').forEach(img => {
      img.setAttribute('alt', '');
    });
  }
}
