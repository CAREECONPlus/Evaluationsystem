/**
 * UI Animation Module
 * UIアニメーション機能
 */
export class AnimationHelper {
  constructor(app) {
    this.app = app;
  }

  init() {
    this.setupPageTransitions();
    this.setupElementAnimations();
  }

  // ページ遷移アニメーション
  setupPageTransitions() {
    document.addEventListener('DOMContentLoaded', () => {
      const content = document.getElementById('content');
      if (content) {
        content.style.opacity = '0';
        this.fadeIn(content, 300);
      }
    });
  }

  // 要素のアニメーション設定
  setupElementAnimations() {
    // カードのホバーエフェクト
    this.addHoverEffect('.card');
    
    // ボタンのクリックエフェクト
    this.addClickEffect('.btn');
    
    // フォームフィールドのフォーカスエフェクト
    this.addFocusEffect('input, select, textarea');
  }

  // フェードイン
  fadeIn(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  }

  // フェードアウト
  fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  // スライドイン
  slideIn(element, direction = 'left', duration = 300) {
    const distance = direction === 'left' || direction === 'right' ? '100%' : '50px';
    const axis = direction === 'left' || direction === 'right' ? 'X' : 'Y';
    const sign = direction === 'left' || direction === 'up' ? '-' : '';
    
    element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
    element.style.transform = `translate${axis}(${sign}${distance})`;
    element.style.opacity = '0';
    
    requestAnimationFrame(() => {
      element.style.transform = 'translate(0, 0)';
      element.style.opacity = '1';
    });
  }

  // スライドアウト
  slideOut(element, direction = 'left', duration = 300) {
    return new Promise(resolve => {
      const distance = direction === 'left' || direction === 'right' ? '100%' : '50px';
      const axis = direction === 'left' || direction === 'right' ? 'X' : 'Y';
      const sign = direction === 'right' || direction === 'down' ? '' : '-';
      
      element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
      element.style.transform = `translate${axis}(${sign}${distance})`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  // ホバーエフェクト追加
  addHoverEffect(selector) {
    document.addEventListener('mouseover', (e) => {
      const element = e.target.closest(selector);
      if (element) {
        element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const element = e.target.closest(selector);
      if (element) {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '';
      }
    });
  }

  // クリックエフェクト追加
  addClickEffect(selector) {
    document.addEventListener('click', (e) => {
      const element = e.target.closest(selector);
      if (element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 100);
      }
    });
  }

  // フォーカスエフェクト追加
  addFocusEffect(selector) {
    document.addEventListener('focusin', (e) => {
      if (e.target.matches(selector)) {
        e.target.style.transition = 'box-shadow 0.3s ease';
        e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.25)';
      }
    });
    
    document.addEventListener('focusout', (e) => {
      if (e.target.matches(selector)) {
        e.target.style.boxShadow = '';
      }
    });
  }

  // ローディングスピナー表示
  showSpinner(element) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border spinner-border-sm';
    spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
    element.appendChild(spinner);
    return spinner;
  }

  // スケルトンローディング
  showSkeleton(element, lines = 3) {
    element.innerHTML = Array(lines).fill(0).map(() => 
      '<div class="skeleton-line mb-2"></div>'
    ).join('');
  }

  // リップルエフェクト
  addRippleEffect(element) {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    
    element.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }
}
