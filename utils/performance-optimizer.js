/**
 * Performance Optimizer - Phase 8
 * パフォーマンス最適化ユーティリティ
 */

export class PerformanceOptimizer {
  constructor() {
    this.observers = new Map();
    this.lazyLoadQueue = [];
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.initializationTasks = [];
    
    // Performance monitoring
    this.performanceMetrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0
    };
    
    this.init();
  }

  /**
   * Initialize performance optimizer
   */
  init() {
    this.setupIntersectionObserver();
    this.setupPerformanceMonitoring();
    this.setupImageLazyLoading();
    this.setupCodeSplitting();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.runInitializationTasks();
      });
    } else {
      this.runInitializationTasks();
    }
  }

  /**
   * Run initialization tasks
   */
  runInitializationTasks() {
    this.initializationTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Performance: Initialization task failed:', error);
      }
    });
  }

  /**
   * Add initialization task
   */
  addInitializationTask(task) {
    this.initializationTasks.push(task);
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('Performance: IntersectionObserver not supported');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          
          // Handle lazy loading
          if (target.dataset.src) {
            target.src = target.dataset.src;
            target.removeAttribute('data-src');
          }
          
          if (target.dataset.srcset) {
            target.srcset = target.dataset.srcset;
            target.removeAttribute('data-srcset');
          }
          
          // Handle lazy loaded components
          if (target.dataset.lazyComponent) {
            this.loadComponent(target.dataset.lazyComponent, target);
          }
          
          // Remove loading class
          target.classList.remove('lazy-loading');
          target.classList.add('lazy-loaded');
          
          observer.unobserve(target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    this.observers.set('intersection', observer);
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Performance Observer for Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance: LCP monitoring not supported');
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('Performance: FID monitoring not supported');
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            this.performanceMetrics.cumulativeLayoutShift += entry.value;
          }
        });
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance: CLS monitoring not supported');
      }
    }

    // Page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      }
    });
  }

  /**
   * Setup image lazy loading
   */
  setupImageLazyLoading() {
    this.addInitializationTask(() => {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.classList.add('lazy-loading');
        this.observers.get('intersection').observe(img);
      });
    });
  }

  /**
   * Setup code splitting and lazy loading
   */
  setupCodeSplitting() {
    this.moduleCache = new Map();
  }

  /**
   * Lazy load component
   */
  async loadComponent(componentName, targetElement) {
    try {
      if (!this.moduleCache.has(componentName)) {
        const module = await import(`../components/${componentName}.js`);
        this.moduleCache.set(componentName, module);
      }
      
      const module = this.moduleCache.get(componentName);
      if (module.default && typeof module.default === 'function') {
        const component = new module.default();
        if (component.render) {
          targetElement.innerHTML = await component.render();
        }
      }
    } catch (error) {
      console.error(`Performance: Failed to load component ${componentName}:`, error);
      targetElement.innerHTML = '<div class="error">コンポーネントの読み込みに失敗しました</div>';
    }
  }

  /**
   * Debounce function execution
   */
  debounce(key, func, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
  }

  /**
   * Throttle function execution
   */
  throttle(key, func, delay = 100) {
    if (this.throttleTimers.has(key)) {
      return;
    }
    
    func();
    const timer = setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);
    
    this.throttleTimers.set(key, timer);
  }

  /**
   * Optimize images
   */
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" for native lazy loading
      if (!img.hasAttribute('loading') && 'loading' in HTMLImageElement.prototype) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add proper sizing attributes
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        img.addEventListener('load', function() {
          if (!this.hasAttribute('width')) this.setAttribute('width', this.naturalWidth);
          if (!this.hasAttribute('height')) this.setAttribute('height', this.naturalHeight);
        });
      }
    });
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(resources = []) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.type === 'font') {
        link.as = 'font';
        link.type = resource.mimeType || 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.type === 'css') {
        link.as = 'style';
      } else if (resource.type === 'js') {
        link.as = 'script';
      } else if (resource.type === 'image') {
        link.as = 'image';
      }
      
      link.href = resource.url;
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize DOM operations
   */
  batchDOMUpdates(updates) {
    // Use DocumentFragment for batch updates
    const fragment = document.createDocumentFragment();
    
    updates.forEach(update => {
      if (update.type === 'create') {
        const element = document.createElement(update.tag);
        Object.entries(update.attributes || {}).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        if (update.content) element.textContent = update.content;
        if (update.html) element.innerHTML = update.html;
        fragment.appendChild(element);
      }
    });
    
    return fragment;
  }

  /**
   * Memory usage optimization
   */
  optimizeMemoryUsage() {
    // Clean up unused observers
    this.observers.forEach((observer, key) => {
      if (key !== 'intersection') {
        observer.disconnect();
        this.observers.delete(key);
      }
    });
    
    // Clear module cache if needed
    if (this.moduleCache.size > 50) {
      const entries = Array.from(this.moduleCache.entries());
      const toDelete = entries.slice(0, Math.floor(entries.length / 2));
      toDelete.forEach(([key]) => this.moduleCache.delete(key));
    }
    
    // Clear timer maps
    this.debounceTimers.clear();
    this.throttleTimers.clear();
  }

  /**
   * Measure and log performance
   */
  measurePerformance(label, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`Performance: ${label} took ${end - start} milliseconds`);
    return result;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    const metrics = this.getPerformanceMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
      recommendations: []
    };

    // Add recommendations based on metrics
    if (metrics.pageLoadTime > 3000) {
      report.recommendations.push('ページ読み込み時間が長すぎます。画像の最適化とコードの分割を検討してください。');
    }
    
    if (metrics.largestContentfulPaint > 2500) {
      report.recommendations.push('LCPが遅いです。重要なリソースのプリロードを検討してください。');
    }
    
    if (metrics.firstInputDelay > 100) {
      report.recommendations.push('FIDが高いです。メインスレッドの負荷を減らしてください。');
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      report.recommendations.push('レイアウトシフトが発生しています。画像にサイズ属性を追加してください。');
    }

    return report;
  }

  /**
   * Enable/disable animations based on user preference
   */
  respectUserPreferences() {
    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      
      // Disable CSS animations
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Service Worker registration for caching
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Performance: Service Worker registered successfully');
        return registration;
      } catch (error) {
        console.warn('Performance: Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.throttleTimers.clear();
    
    // Clear caches
    this.moduleCache.clear();
    this.lazyLoadQueue.length = 0;
    this.initializationTasks.length = 0;
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();