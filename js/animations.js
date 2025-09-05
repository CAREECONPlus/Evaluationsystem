/**
 * UI Animation Module
 * UIアニメーション機能
 */
export class AnimationHelper {
  constructor(app) {
    this.app = app;
    this.runningAnimations = new Set();
    this.animationPreference = this.getAnimationPreference();
  }

  init() {
    this.setupPageTransitions();
    this.setupElementAnimations();
    this.setupScrollAnimations();
    this.respectMotionPreferences();
  }

  // ユーザーのモーション設定を確認
  getAnimationPreference() {
    // prefers-reduced-motionの確認
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    return !prefersReducedMotion.matches;
  }

  respectMotionPreferences() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    prefersReducedMotion.addEventListener('change', (e) => {
      this.animationPreference = !e.matches;
      if (!this.animationPreference) {
        this.disableAnimations();
      } else {
        this.enableAnimations();
      }
    });
  }

  disableAnimations() {
    document.body.classList.add('animations-disabled');
    this.runningAnimations.forEach(animation => {
      if (animation.cancel) animation.cancel();
    });
    this.runningAnimations.clear();
  }

  enableAnimations() {
    document.body.classList.remove('animations-disabled');
  }

  // ページ遷移アニメーション
  setupPageTransitions() {
    // ページ読み込み時のフェードイン
    document.addEventListener('DOMContentLoaded', () => {
      const content = document.getElementById('content');
      if (content && this.animationPreference) {
        this.fadeIn(content, 300);
      }
    });

    // ルート変更時のアニメーション
    if (this.app.router) {
      this.setupRouterAnimations();
    }
  }

  setupRouterAnimations() {
    // ルート変更時のアニメーション
    window.addEventListener('hashchange', () => {
      if (this.animationPreference) {
        this.animatePageTransition();
      }
    });
  }

  animatePageTransition() {
    const content = document.getElementById('content');
    if (!content) return;

    // フェードアウト → フェードイン
    this.fadeOut(content, 150).then(() => {
      // 少し遅延させてからフェードイン
      setTimeout(() => {
        this.fadeIn(content, 150);
      }, 50);
    });
  }

  // 要素のアニメーション設定
  setupElementAnimations() {
    if (!this.animationPreference) return;

    // カードのホバーエフェクト
    this.addHoverEffect('.card');
    
    // ボタンのクリックエフェクト
    this.addClickEffect('.btn');
    
    // フォームフィールドのフォーカスエフェクト
    this.addFocusEffect('input, select, textarea');
    
    // モーダルのアニメーション
    this.setupModalAnimations();
    
    // トーストのアニメーション
    this.setupToastAnimations();
  }

  // スクロールアニメーション
  setupScrollAnimations() {
    if (!this.animationPreference || !('IntersectionObserver' in window)) return;

    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animationType = element.dataset.scrollAnimation || 'fadeInUp';
          this.animateElement(element, animationType);
          animateOnScroll.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // data-scroll-animation属性を持つ要素を監視
    document.querySelectorAll('[data-scroll-animation]').forEach(el => {
      animateOnScroll.observe(el);
    });
  }

  // 基本的なアニメーション関数

  // フェードイン
  fadeIn(element, duration = 300) {
    if (!this.animationPreference) {
      element.style.opacity = '1';
      return Promise.resolve();
    }

    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      
      // フォースリフロー
      element.offsetHeight;
      
      element.style.opacity = '1';
      
      const animation = setTimeout(() => {
        this.runningAnimations.delete(animation);
        resolve();
      }, duration);
      
      this.runningAnimations.add(animation);
    });
  }

  // フェードアウト
  fadeOut(element, duration = 300) {
    if (!this.animationPreference) {
      element.style.opacity = '0';
      return Promise.resolve();
    }

    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '0';
      
      const animation = setTimeout(() => {
        this.runningAnimations.delete(animation);
        resolve();
      }, duration);
      
      this.runningAnimations.add(animation);
    });
  }

  // スライドイン
  slideIn(element, direction = 'left', duration = 300) {
    if (!this.animationPreference) {
      element.style.transform = 'translate(0, 0)';
      element.style.opacity = '1';
      return Promise.resolve();
    }

    return new Promise(resolve => {
      const distance = direction === 'left' || direction === 'right' ? '100%' : '50px';
      const axis = direction === 'left' || direction === 'right' ? 'X' : 'Y';
      const sign = direction === 'left' || direction === 'up' ? '-' : '';
      
      element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
      element.style.transform = `translate${axis}(${sign}${distance})`;
      element.style.opacity = '0';
      
      // フォースリフロー
      element.offsetHeight;
      
      element.style.transform = 'translate(0, 0)';
      element.style.opacity = '1';
      
      const animation = setTimeout(() => {
        this.runningAnimations.delete(animation);
        resolve();
      }, duration);
      
      this.runningAnimations.add(animation);
    });
  }

  // スライドアウト
  slideOut(element, direction = 'left', duration = 300) {
    if (!this.animationPreference) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      const distance = direction === 'left' || direction === 'right' ? '100%' : '50px';
      const axis = direction === 'left' || direction === 'right' ? 'X' : 'Y';
      const sign = direction === 'right' || direction === 'down' ? '' : '-';
      
      element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
      element.style.transform = `translate${axis}(${sign}${distance})`;
      element.style.opacity = '0';
      
      const animation = setTimeout(() => {
        this.runningAnimations.delete(animation);
        resolve();
      }, duration);
      
      this.runningAnimations.add(animation);
    });
  }

  // スケールアニメーション
  scale(element, fromScale = 0, toScale = 1, duration = 300) {
    if (!this.animationPreference) {
      element.style.transform = `scale(${toScale})`;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      element.style.transition = `transform ${duration}ms ease-out`;
      element.style.transform = `scale(${fromScale})`;
      
      // フォースリフロー
      element.offsetHeight;
      
      element.style.transform = `scale(${toScale})`;
      
      const animation = setTimeout(() => {
        this.runningAnimations.delete(animation);
        resolve();
      }, duration);
      
      this.runningAnimations.add(animation);
    });
  }

  // 回転アニメーション
  rotate(element, fromDegree = 0, toDegree = 360, duration = 500) {
    if (!this.animationPreference) {
      element.style.transform = `rotate(${toDegree}deg)`;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      element.style.transition = `transform ${duration}ms ease-in-out`;
      element.style.transform = `rotate(${fromDegree}deg)`;
      
      // フォースリフロー
      element.offsetHeight;
      
      element.style.transform = `rotate(${toDegree}deg)`;
      
      const animation = setTimeout(() => {
        this.runningAnimations.delete(animation);
        element.style.transform = ''; // リセット
        resolve();
      }, duration);
      
      this.runningAnimations.add(animation);
    });
  }

  // インタラクションエフェクト

  // ホバーエフェクト追加
  addHoverEffect(selector) {
    if (!this.animationPreference) return;

    document.addEventListener('mouseover', (e) => {
      const element = e.target.closest(selector);
      if (element && !element.dataset.animating) {
        element.dataset.animating = 'true';
        element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const element = e.target.closest(selector);
      if (element && element.dataset.animating) {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '';
        setTimeout(() => {
          delete element.dataset.animating;
        }, 200);
      }
    });
  }

  // クリックエフェクト追加
  addClickEffect(selector) {
    if (!this.animationPreference) return;

    document.addEventListener('mousedown', (e) => {
      const element = e.target.closest(selector);
      if (element) {
        element.style.transition = 'transform 0.1s ease';
        element.style.transform = 'scale(0.95)';
      }
    });

    document.addEventListener('mouseup', (e) => {
      const element = e.target.closest(selector);
      if (element) {
        element.style.transform = 'scale(1)';
      }
    });
  }

  // フォーカスエフェクト追加
  addFocusEffect(selector) {
    if (!this.animationPreference) return;

    document.addEventListener('focusin', (e) => {
      if (e.target.matches(selector)) {
        e.target.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
        e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.25)';
      }
    });
    
    document.addEventListener('focusout', (e) => {
      if (e.target.matches(selector)) {
        e.target.style.boxShadow = '';
      }
    });
  }

  // モーダルアニメーション
  setupModalAnimations() {
    if (!this.animationPreference) return;

    // モーダル表示時のアニメーション
    document.addEventListener('show.bs.modal', (e) => {
      const modal = e.target;
      const modalDialog = modal.querySelector('.modal-dialog');
      if (modalDialog) {
        this.scale(modalDialog, 0.7, 1, 300);
        this.fadeIn(modal, 300);
      }
    });

    // モーダル非表示時のアニメーション
    document.addEventListener('hide.bs.modal', (e) => {
      const modal = e.target;
      const modalDialog = modal.querySelector('.modal-dialog');
      if (modalDialog) {
        this.scale(modalDialog, 1, 0.7, 200);
        this.fadeOut(modal, 200);
      }
    });
  }

  // トーストアニメーション
  setupToastAnimations() {
    if (!this.animationPreference) return;

    // MutationObserverでトーストの追加を監視
    const toastObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('toast')) {
            this.animateToastIn(node);
          }
        });
      });
    });

    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
      toastObserver.observe(toastContainer, { childList: true });
    }
  }

  animateToastIn(toast) {
    this.slideIn(toast, 'right', 300);
  }

  // 汎用的なアニメーション関数
  animateElement(element, animationType, duration = 500) {
    if (!this.animationPreference) return Promise.resolve();

    switch (animationType) {
      case 'fadeIn':
        return this.fadeIn(element, duration);
      case 'fadeOut':
        return this.fadeOut(element, duration);
      case 'slideInLeft':
        return this.slideIn(element, 'left', duration);
      case 'slideInRight':
        return this.slideIn(element, 'right', duration);
      case 'slideInUp':
        return this.slideIn(element, 'up', duration);
      case 'slideInDown':
        return this.slideIn(element, 'down', duration);
      case 'scaleIn':
        return this.scale(element, 0, 1, duration);
      case 'scaleOut':
        return this.scale(element, 1, 0, duration);
      case 'rotate':
        return this.rotate(element, 0, 360, duration);
      case 'bounce':
        return this.bounce(element, duration);
      case 'pulse':
        return this.pulse(element, duration);
      default:
        return Promise.resolve();
    }
  }

  // バウンスアニメーション
  bounce(element, duration = 600) {
    if (!this.animationPreference) return Promise.resolve();

    return new Promise(resolve => {
      const keyframes = [
        { transform: 'translateY(0)', offset: 0 },
        { transform: 'translateY(-20px)', offset: 0.25 },
        { transform: 'translateY(0)', offset: 0.5 },
        { transform: 'translateY(-10px)', offset: 0.75 },
        { transform: 'translateY(0)', offset: 1 }
      ];

      if (element.animate) {
        const animation = element.animate(keyframes, {
          duration: duration,
          easing: 'ease-out'
        });

        this.runningAnimations.add(animation);
        
        animation.addEventListener('finish', () => {
          this.runningAnimations.delete(animation);
          resolve();
        });
      } else {
        // フォールバック
        element.style.animation = `bounce ${duration}ms ease-out`;
        const fallback = setTimeout(() => {
          element.style.animation = '';
          this.runningAnimations.delete(fallback);
          resolve();
        }, duration);
        this.runningAnimations.add(fallback);
      }
    });
  }

  // パルスアニメーション
  pulse(element, duration = 1000) {
    if (!this.animationPreference) return Promise.resolve();

    return new Promise(resolve => {
      const keyframes = [
        { transform: 'scale(1)', opacity: '1', offset: 0 },
        { transform: 'scale(1.05)', opacity: '0.7', offset: 0.5 },
        { transform: 'scale(1)', opacity: '1', offset: 1 }
      ];

      if (element.animate) {
        const animation = element.animate(keyframes, {
          duration: duration,
          easing: 'ease-in-out'
        });

        this.runningAnimations.add(animation);
        
        animation.addEventListener('finish', () => {
          this.runningAnimations.delete(animation);
          resolve();
        });
      } else {
        // フォールバック
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        const fallback = setTimeout(() => {
          element.style.animation = '';
          this.runningAnimations.delete(fallback);
          resolve();
        }, duration);
        this.runningAnimations.add(fallback);
      }
    });
  }

  // ローディングスピナー表示
  showSpinner(element, size = 'normal') {
    const sizeClass = size === 'small' ? 'spinner-border-sm' : '';
    const spinner = document.createElement('div');
    spinner.className = `spinner-border ${sizeClass}`;
    spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
    
    if (this.animationPreference) {
      spinner.style.opacity = '0';
      element.appendChild(spinner);
      this.fadeIn(spinner, 200);
    } else {
      element.appendChild(spinner);
    }
    
    return spinner;
  }

  // スケルトンローディング
  showSkeleton(element, lines = 3) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-container';
    
    for (let i = 0; i < lines; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton-line mb-2';
      if (i === lines - 1) {
        line.style.width = '60%'; // 最後の行は短く
      }
      skeleton.appendChild(line);
    }
    
    element.innerHTML = '';
    element.appendChild(skeleton);
    
    if (this.animationPreference) {
      this.fadeIn(skeleton, 200);
    }
  }

  // リップルエフェクト
  addRippleEffect(element) {
    if (!this.animationPreference) return;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    
    element.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;
      
      element.appendChild(ripple);
      
      const cleanup = setTimeout(() => {
        ripple.remove();
        this.runningAnimations.delete(cleanup);
      }, 600);
      
      this.runningAnimations.add(cleanup);
    });
  }

  // シーケンシャルアニメーション
  sequence(animations, delay = 100) {
    if (!this.animationPreference) {
      return Promise.all(animations.map(anim => anim()));
    }

    return animations.reduce((promise, animation, index) => {
      return promise.then(() => {
        if (index > 0) {
          return new Promise(resolve => {
            const timeout = setTimeout(() => {
              this.runningAnimations.delete(timeout);
              resolve();
            }, delay);
            this.runningAnimations.add(timeout);
          });
        }
      }).then(() => animation());
    }, Promise.resolve());
  }

  // パラレルアニメーション
  parallel(animations) {
    return Promise.all(animations.map(anim => anim()));
  }

  // アニメーション状態の確認
  isAnimating() {
    return this.runningAnimations.size > 0;
  }

  // 全アニメーションの停止
  stopAllAnimations() {
    this.runningAnimations.forEach(animation => {
      if (animation.cancel) {
        animation.cancel();
      } else if (typeof animation === 'number') {
        clearTimeout(animation);
      }
    });
    this.runningAnimations.clear();
  }

  // クリーンアップ
  cleanup() {
    this.stopAllAnimations();
    console.log('Animation helper cleaned up');
  }
}
