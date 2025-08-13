/**
 * Performance Optimization Module
 * パフォーマンス最適化機能
 */
export class PerformanceOptimizer {
  constructor(app) {
    this.app = app;
    this.observers = new Map();
    this.debounceTimers = new Map();
    this.throttleFlags = new Map();
    this.idleCallbacks = [];
  }

  init() {
    this.setupLazyLoading();
    this.setupIntersectionObserver();
    this.setupRequestIdleCallback();
  }

  // 画像の遅延読み込み
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    this.observers.set('images', imageObserver);
  }

  // コンポーネントの遅延レンダリング
  setupIntersectionObserver() {
    const lazyComponents = document.querySelectorAll('[data-lazy-component]');
    const componentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadComponent(entry.target);
          componentObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });

    lazyComponents.forEach(component => componentObserver.observe(component));
    this.observers.set('components', componentObserver);
  }

  loadComponent(element) {
    const componentName = element.dataset.lazyComponent;
    if (componentName && this.app.currentPage) {
      const method = `render${componentName}`;
      if (typeof this.app.currentPage[method] === 'function') {
        element.innerHTML = this.app.currentPage[method]();
      }
    }
  }

  // アイドル時の処理実行
  setupRequestIdleCallback() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.processIdleCallbacks();
      });
    }
  }

  processIdleCallbacks() {
    while (this.idleCallbacks.length > 0) {
      const callback = this.idleCallbacks.shift();
      callback();
    }
  }

  addIdleCallback(callback) {
    if ('requestIdleCallback' in window) {
      this.idleCallbacks.push(callback);
    } else {
      callback();
    }
  }

  // デバウンス機能
  debounce(key, callback, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
  }

  // スロットル機能
  throttle(key, callback, limit = 100) {
    if (!this.throttleFlags.get(key)) {
      this.throttleFlags.set(key, true);
      callback();
      
      setTimeout(() => {
        this.throttleFlags.set(key, false);
      }, limit);
    }
  }

  // 仮想スクロール（大量データ表示用）
  createVirtualScroll(container, items, itemHeight, renderItem) {
    const totalHeight = items.length * itemHeight;
    const visibleCount = Math.ceil(container.clientHeight / itemHeight);
    
    const scrollDiv = document.createElement('div');
    scrollDiv.style.height = `${totalHeight}px`;
    scrollDiv.style.position = 'relative';
    
    const renderVisibleItems = () => {
      const scrollTop = container.scrollTop;
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
      
      scrollDiv.innerHTML = '';
      
      for (let i = startIndex; i < endIndex; i++) {
        const itemDiv = renderItem(items[i], i);
        itemDiv.style.position = 'absolute';
        itemDiv.style.top = `${i * itemHeight}px`;
        itemDiv.style.height = `${itemHeight}px`;
        scrollDiv.appendChild(itemDiv);
      }
    };
    
    container.appendChild(scrollDiv);
    container.addEventListener('scroll', () => {
      this.throttle('virtual-scroll', renderVisibleItems, 16);
    });
    
    renderVisibleItems();
  }

  // メモリリークの防止
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    this.throttleFlags.clear();
    this.idleCallbacks = [];
  }

  // パフォーマンス計測
  measure(name, callback) {
    const startTime = performance.now();
    const result = callback();
    const endTime = performance.now();
    
    console.log(`Performance: ${name} took ${endTime - startTime}ms`);
    
    return result;
  }
}
