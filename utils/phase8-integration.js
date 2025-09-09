/**
 * Phase 8 Integration - UX Enhancement Bootstrap
 * Phase 8統合 - UX強化統合スクリプト
 */

import { performanceOptimizer } from './performance-optimizer.js';
import { accessibilityEnhancer } from './accessibility-enhancer.js';
import { enhancedI18n } from './i18n-enhanced.js';

class Phase8Integration {
  constructor() {
    this.initialized = false;
    this.components = new Map();
    
    this.init();
  }

  /**
   * Initialize Phase 8 enhancements
   */
  async init() {
    if (this.initialized) return;

    console.log('Phase 8: Initializing UX enhancements...');

    try {
      // Initialize core systems
      await this.initializeCore();
      
      // Setup integrations
      this.setupIntegrations();
      
      // Apply enhancements to existing content
      this.enhanceExistingContent();
      
      // Setup monitoring and maintenance
      this.setupMonitoring();
      
      this.initialized = true;
      console.log('Phase 8: UX enhancements initialized successfully');
      
      // Trigger initialization complete event
      this.triggerInitializationEvent();
      
    } catch (error) {
      console.error('Phase 8: Failed to initialize UX enhancements:', error);
    }
  }

  /**
   * Initialize core systems
   */
  async initializeCore() {
    // Performance optimizer is already initialized
    // Accessibility enhancer is already initialized
    // Enhanced i18n is already initialized
    
    // Wait for all systems to be ready
    await Promise.all([
      this.waitForSystem('performanceOptimizer'),
      this.waitForSystem('accessibilityEnhancer'), 
      this.waitForSystem('enhancedI18n')
    ]);
  }

  /**
   * Wait for system to be ready
   */
  async waitForSystem(systemName) {
    return new Promise((resolve) => {
      const checkSystem = () => {
        let ready = false;
        
        switch (systemName) {
          case 'performanceOptimizer':
            ready = performanceOptimizer && typeof performanceOptimizer.init === 'function';
            break;
          case 'accessibilityEnhancer':
            ready = accessibilityEnhancer && typeof accessibilityEnhancer.announce === 'function';
            break;
          case 'enhancedI18n':
            ready = enhancedI18n && typeof enhancedI18n.t === 'function';
            break;
        }
        
        if (ready) {
          resolve();
        } else {
          setTimeout(checkSystem, 50);
        }
      };
      
      checkSystem();
    });
  }

  /**
   * Setup integrations between systems
   */
  setupIntegrations() {
    // Performance + Accessibility integration
    this.integratePerfomanceAccessibility();
    
    // i18n + Accessibility integration
    this.integrateI18nAccessibility();
    
    // Performance + i18n integration
    this.integratePerformanceI18n();
    
    // Cross-system event handling
    this.setupCrossSystemEvents();
  }

  /**
   * Integrate performance optimizer with accessibility enhancer
   */
  integratePerfomanceAccessibility() {
    // Announce when lazy loading completes
    const originalLoadComponent = performanceOptimizer.loadComponent.bind(performanceOptimizer);
    performanceOptimizer.loadComponent = async (componentName, targetElement) => {
      const result = await originalLoadComponent(componentName, targetElement);
      
      // Announce to screen readers
      accessibilityEnhancer.announce(
        `コンポーネント ${componentName} が読み込まれました`,
        'polite'
      );
      
      return result;
    };

    // Respect reduced motion preferences for performance animations
    performanceOptimizer.addInitializationTask(() => {
      performanceOptimizer.respectUserPreferences();
    });
  }

  /**
   * Integrate i18n with accessibility enhancer
   */
  integrateI18nAccessibility() {
    // Update screen reader announcements when language changes
    document.addEventListener('languagechange', (event) => {
      const { newLanguage } = event.detail;
      
      accessibilityEnhancer.announce(
        enhancedI18n.t('message.languageChanged', { language: enhancedI18n.getLanguageDisplayName(newLanguage) }),
        'assertive'
      );
    });

    // Translate accessibility announcements
    const originalAnnounce = accessibilityEnhancer.announce.bind(accessibilityEnhancer);
    accessibilityEnhancer.announce = (message, priority = 'polite') => {
      // Try to translate if it looks like a translation key
      const translatedMessage = message.includes('.') ? enhancedI18n.t(message, {}, enhancedI18n.getCurrentLanguage()) : message;
      return originalAnnounce(translatedMessage, priority);
    };
  }

  /**
   * Integrate performance optimizer with i18n
   */
  integratePerformanceI18n() {
    // Lazy load translation files
    const originalChangeLanguage = enhancedI18n.changeLanguage.bind(enhancedI18n);
    enhancedI18n.changeLanguage = async (language) => {
      // Use performance optimizer's debounce for language changes
      return new Promise((resolve) => {
        performanceOptimizer.debounce('language-change', async () => {
          const result = await originalChangeLanguage(language);
          resolve(result);
        }, 300);
      });
    };
  }

  /**
   * Setup cross-system event handling
   */
  setupCrossSystemEvents() {
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - optimize performance
        performanceOptimizer.stopAutoRefresh?.();
      } else {
        // Page is visible - resume operations
        performanceOptimizer.startAutoRefresh?.();
      }
    });

    // Handle connection changes
    if (navigator.onLine !== undefined) {
      window.addEventListener('online', () => {
        accessibilityEnhancer.announce('message.connectionRestored', 'assertive');
      });
      
      window.addEventListener('offline', () => {
        accessibilityEnhancer.announce('message.connectionLost', 'assertive');
      });
    }

    // Handle resize for responsive updates
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResponsiveUpdates();
      }, 250);
    });
  }

  /**
   * Handle responsive updates on window resize
   */
  handleResponsiveUpdates() {
    // Update layout-dependent accessibility features
    accessibilityEnhancer.enhanceExistingContent();
    
    // Optimize performance for new viewport
    performanceOptimizer.optimizeImages();
    
    // Update responsive text if needed
    enhancedI18n.updateTranslatableElements();
  }

  /**
   * Enhance existing content with Phase 8 improvements
   */
  enhanceExistingContent() {
    // Add responsive classes to existing elements
    this.addResponsiveClasses();
    
    // Enhance forms with better UX
    this.enhanceForms();
    
    // Add loading states
    this.addLoadingStates();
    
    // Setup progressive enhancement
    this.setupProgressiveEnhancement();
  }

  /**
   * Add responsive classes to existing elements
   */
  addResponsiveClasses() {
    // Add responsive classes to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      if (!card.classList.contains('animate-fade-in')) {
        card.classList.add('animate-fade-in');
      }
    });

    // Add responsive classes to tables
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      if (!table.closest('.table-responsive')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    // Add responsive classes to buttons
    const buttonGroups = document.querySelectorAll('.btn-group');
    buttonGroups.forEach(group => {
      group.classList.add('flex', 'flex-wrap', 'gap-2');
    });
  }

  /**
   * Enhance forms with better UX
   */
  enhanceForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Add form validation enhancements
      this.enhanceFormValidation(form);
      
      // Add loading states for form submission
      this.addFormLoadingStates(form);
      
      // Add keyboard navigation improvements
      this.enhanceFormKeyboardNavigation(form);
    });
  }

  /**
   * Enhance form validation
   */
  enhanceFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Add real-time validation
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // Add input formatters
      if (input.type === 'email') {
        input.addEventListener('input', () => {
          this.formatEmailInput(input);
        });
      }
      
      if (input.type === 'tel') {
        input.addEventListener('input', () => {
          this.formatPhoneInput(input);
        });
      }
    });
  }

  /**
   * Validate field and show feedback
   */
  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    // Required field validation
    if (input.hasAttribute('required') && !value) {
      isValid = false;
      message = enhancedI18n.t('validation.required');
    }

    // Email validation
    if (input.type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      message = enhancedI18n.t('validation.email');
    }

    // Length validation
    if (input.hasAttribute('minlength') && value.length < parseInt(input.getAttribute('minlength'))) {
      isValid = false;
      message = enhancedI18n.t('validation.minLength', { min: input.getAttribute('minlength') });
    }

    // Update UI
    this.updateFieldValidationUI(input, isValid, message);
  }

  /**
   * Update field validation UI
   */
  updateFieldValidationUI(input, isValid, message) {
    // Remove existing feedback
    const existingFeedback = input.parentNode.querySelector('.field-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Update input classes
    input.classList.remove('is-valid', 'is-invalid');
    input.classList.add(isValid ? 'is-valid' : 'is-invalid');

    // Add feedback message if invalid
    if (!isValid && message) {
      const feedback = document.createElement('div');
      feedback.className = 'field-feedback text-danger text-sm mt-1';
      feedback.textContent = message;
      feedback.setAttribute('role', 'alert');
      input.parentNode.appendChild(feedback);
    }

    // Update ARIA attributes
    if (!isValid) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', input.id + '-error');
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  /**
   * Add form loading states
   */
  addFormLoadingStates(form) {
    form.addEventListener('submit', (event) => {
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        
        const originalText = submitButton.textContent;
        submitButton.textContent = enhancedI18n.t('common.loading');
        
        // Re-enable after 3 seconds if form is still processing
        setTimeout(() => {
          if (submitButton.disabled) {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.textContent = originalText;
          }
        }, 3000);
      }
    });
  }

  /**
   * Add loading states to async operations
   */
  addLoadingStates() {
    // Add loading states to buttons that trigger async operations
    const asyncButtons = document.querySelectorAll('[data-async]');
    
    asyncButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        this.showLoadingState(button);
      });
    });
  }

  /**
   * Show loading state for element
   */
  showLoadingState(element) {
    element.classList.add('loading');
    element.disabled = true;
    
    const originalContent = element.innerHTML;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + enhancedI18n.t('common.loading');
    
    // Store original content for restoration
    element.dataset.originalContent = originalContent;
  }

  /**
   * Hide loading state for element
   */
  hideLoadingState(element) {
    element.classList.remove('loading');
    element.disabled = false;
    
    if (element.dataset.originalContent) {
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
  }

  /**
   * Setup progressive enhancement
   */
  setupProgressiveEnhancement() {
    // Enhance elements as they become visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.progressivelyEnhance(entry.target);
        }
      });
    });

    // Observe elements that benefit from progressive enhancement
    const enhanceableElements = document.querySelectorAll('.chart-container, .data-table, .complex-form');
    enhanceableElements.forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Progressively enhance element
   */
  progressivelyEnhance(element) {
    if (element.classList.contains('chart-container')) {
      this.enhanceChart(element);
    } else if (element.classList.contains('data-table')) {
      this.enhanceDataTable(element);
    } else if (element.classList.contains('complex-form')) {
      this.enhanceComplexForm(element);
    }
  }

  /**
   * Setup monitoring and maintenance
   */
  setupMonitoring() {
    // Performance monitoring
    setInterval(() => {
      const metrics = performanceOptimizer.getPerformanceMetrics();
      this.logPerformanceMetrics(metrics);
    }, 60000); // Every minute

    // Accessibility audit
    setInterval(() => {
      const audit = accessibilityEnhancer.getAccessibilityAudit();
      this.logAccessibilityAudit(audit);
    }, 300000); // Every 5 minutes

    // Memory cleanup
    setInterval(() => {
      performanceOptimizer.optimizeMemoryUsage();
    }, 600000); // Every 10 minutes
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics(metrics) {
    if (metrics.pageLoadTime > 3000) {
      console.warn('Phase 8: Page load time is high:', metrics.pageLoadTime);
    }
  }

  /**
   * Log accessibility audit
   */
  logAccessibilityAudit(audit) {
    if (audit.issues.length > 0) {
      console.warn('Phase 8: Accessibility issues detected:', audit.issues);
    }
  }

  /**
   * Utility methods
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  formatEmailInput(input) {
    // Basic email formatting (lowercase)
    input.value = input.value.toLowerCase().trim();
  }

  formatPhoneInput(input) {
    // Basic phone formatting (remove non-digits)
    let value = input.value.replace(/\D/g, '');
    
    // Format as needed based on length
    if (value.length >= 10) {
      value = value.replace(/(\d{3})(\d{4})(\d{3,4})/, '$1-$2-$3');
    }
    
    input.value = value;
  }

  /**
   * Trigger initialization complete event
   */
  triggerInitializationEvent() {
    const event = new CustomEvent('phase8Initialized', {
      detail: {
        timestamp: new Date().toISOString(),
        features: [
          'responsive-design',
          'performance-optimization',
          'accessibility-enhancement',
          'i18n-system',
          'progressive-enhancement'
        ]
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      components: Array.from(this.components.keys()),
      performanceMetrics: performanceOptimizer.getPerformanceMetrics(),
      accessibilityAudit: accessibilityEnhancer.getAccessibilityAudit(),
      i18nStats: enhancedI18n.getTranslationStats()
    };
  }
}

// Export singleton instance
export const phase8Integration = new Phase8Integration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    phase8Integration.init();
  });
} else {
  phase8Integration.init();
}