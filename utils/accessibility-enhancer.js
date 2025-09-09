/**
 * Accessibility Enhancer - Phase 8  
 * アクセシビリティ強化ユーティリティ
 */

export class AccessibilityEnhancer {
  constructor() {
    this.focusableElements = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(',');
    
    this.trapFocusElements = new Map();
    this.announcements = [];
    this.keyboardNavigation = new Map();
    
    this.init();
  }

  /**
   * Initialize accessibility enhancements
   */
  init() {
    this.setupAriaLiveRegion();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupHighContrastMode();
    this.setupReducedMotion();
    this.setupSkipLinks();
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.enhanceExistingContent();
      });
    } else {
      this.enhanceExistingContent();
    }
  }

  /**
   * Setup ARIA live region for announcements
   */
  setupAriaLiveRegion() {
    // Create polite live region
    const politeRegion = document.createElement('div');
    politeRegion.id = 'aria-live-polite';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    document.body.appendChild(politeRegion);

    // Create assertive live region
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'aria-live-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    document.body.appendChild(assertiveRegion);
  }

  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
    const region = document.getElementById(regionId);
    
    if (region) {
      // Clear previous message
      region.textContent = '';
      
      // Add new message after a brief delay
      setTimeout(() => {
        region.textContent = message;
        this.announcements.push({
          message,
          priority,
          timestamp: new Date().toISOString()
        });
      }, 100);
    }
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Global keyboard event handler
    document.addEventListener('keydown', (event) => {
      this.handleGlobalKeydown(event);
    });

    // Focus visible indicator
    document.addEventListener('focusin', (event) => {
      this.handleFocusIn(event);
    });

    document.addEventListener('focusout', (event) => {
      this.handleFocusOut(event);
    });
  }

  /**
   * Handle global keyboard events
   */
  handleGlobalKeydown(event) {
    const { key, target, ctrlKey, altKey, shiftKey } = event;

    // Handle Escape key
    if (key === 'Escape') {
      this.handleEscapeKey(event);
    }

    // Handle Tab key for focus traps
    if (key === 'Tab') {
      this.handleTabKey(event);
    }

    // Handle Arrow keys for custom navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      this.handleArrowKeys(event);
    }

    // Handle Enter and Space for activation
    if (key === 'Enter' || key === ' ') {
      this.handleActivationKeys(event);
    }

    // Skip links shortcut (Alt + S)
    if (altKey && key.toLowerCase() === 's') {
      this.showSkipLinks();
      event.preventDefault();
    }
  }

  /**
   * Handle Escape key press
   */
  handleEscapeKey(event) {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"]:not([hidden])');
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1];
      this.closeModal(lastModal);
      event.preventDefault();
      return;
    }

    // Close dropdowns
    const expandedDropdowns = document.querySelectorAll('[aria-expanded="true"]');
    expandedDropdowns.forEach(dropdown => {
      dropdown.setAttribute('aria-expanded', 'false');
      const targetId = dropdown.getAttribute('aria-controls');
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) target.setAttribute('hidden', '');
      }
    });
  }

  /**
   * Handle Tab key for focus traps
   */
  handleTabKey(event) {
    const activeTraps = Array.from(this.trapFocusElements.keys()).filter(element => 
      !element.hasAttribute('hidden') && element.offsetParent !== null
    );

    if (activeTraps.length === 0) return;

    const currentTrap = activeTraps[activeTraps.length - 1];
    const focusableElements = this.getFocusableElements(currentTrap);
    
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const currentFocus = document.activeElement;

    if (event.shiftKey) {
      if (currentFocus === firstFocusable) {
        lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      if (currentFocus === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Handle arrow keys for navigation
   */
  handleArrowKeys(event) {
    const { target, key } = event;
    
    // Handle menu/list navigation
    if (target.getAttribute('role') === 'menuitem' || 
        target.closest('[role="menu"], [role="menubar"], [role="listbox"]')) {
      this.handleMenuNavigation(event);
    }

    // Handle tab navigation
    if (target.getAttribute('role') === 'tab') {
      this.handleTabNavigation(event);
    }
  }

  /**
   * Handle menu navigation with arrow keys
   */
  handleMenuNavigation(event) {
    const { target, key } = event;
    const menu = target.closest('[role="menu"], [role="menubar"], [role="listbox"]');
    if (!menu) return;

    const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"], [role="option"]'));
    const currentIndex = menuItems.indexOf(target);

    let newIndex;
    if (key === 'ArrowUp') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
      event.preventDefault();
    } else if (key === 'ArrowDown') {
      newIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
      event.preventDefault();
    }

    if (newIndex !== undefined) {
      menuItems[newIndex].focus();
    }
  }

  /**
   * Handle tab navigation with arrow keys
   */
  handleTabNavigation(event) {
    const { target, key } = event;
    const tabList = target.closest('[role="tablist"]');
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.indexOf(target);

    let newIndex;
    if (key === 'ArrowLeft') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      event.preventDefault();
    } else if (key === 'ArrowRight') {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      event.preventDefault();
    }

    if (newIndex !== undefined) {
      this.activateTab(tabs[newIndex]);
    }
  }

  /**
   * Handle activation keys (Enter, Space)
   */
  handleActivationKeys(event) {
    const { target, key } = event;
    
    // Skip if target is already an interactive element
    if (target.matches('button, input, textarea, select, a[href]')) return;

    // Handle custom interactive elements
    if (target.hasAttribute('role') && 
        ['button', 'tab', 'menuitem', 'option'].includes(target.getAttribute('role'))) {
      
      if (key === 'Enter' || (key === ' ' && target.getAttribute('role') === 'button')) {
        target.click();
        event.preventDefault();
      }
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      :focus-visible {
        outline: 2px solid #005fcc;
        outline-offset: 2px;
      }
      
      .focus-visible {
        outline: 2px solid #005fcc;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Handle focus in events
   */
  handleFocusIn(event) {
    const target = event.target;
    
    // Add visual focus indicator for keyboard users
    if (this.isKeyboardUser()) {
      target.classList.add('focus-visible');
    }
  }

  /**
   * Handle focus out events
   */
  handleFocusOut(event) {
    const target = event.target;
    target.classList.remove('focus-visible');
  }

  /**
   * Detect if user is using keyboard navigation
   */
  isKeyboardUser() {
    return document.querySelector('body').hasAttribute('data-keyboard-navigation');
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Detect screen reader usage
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.setAttribute('data-keyboard-navigation', '');
      }
    });

    // Add screen reader specific content
    this.addScreenReaderContent();
  }

  /**
   * Add content specifically for screen readers
   */
  addScreenReaderContent() {
    // Add main landmark if missing
    if (!document.querySelector('main, [role="main"]')) {
      const main = document.querySelector('#main-content');
      if (main) {
        main.setAttribute('role', 'main');
      }
    }

    // Add navigation landmark
    const nav = document.querySelector('nav, #sidebar');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'メインナビゲーション');
    }
  }

  /**
   * Setup high contrast mode support
   */
  setupHighContrastMode() {
    // Detect high contrast mode
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.classList.add('high-contrast');
    }

    // Add high contrast toggle
    this.addHighContrastToggle();
  }

  /**
   * Add high contrast mode toggle
   */
  addHighContrastToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'accessibility-toggle high-contrast-toggle';
    toggle.setAttribute('aria-label', 'ハイコントラストモードを切り替え');
    toggle.innerHTML = '<i class="fas fa-adjust"></i>';
    
    toggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('high-contrast');
      const isEnabled = document.documentElement.classList.contains('high-contrast');
      this.announce(isEnabled ? 'ハイコントラストモードを有効にしました' : 'ハイコントラストモードを無効にしました');
    });

    // Add to accessibility controls
    this.addToAccessibilityControls(toggle);
  }

  /**
   * Setup reduced motion support
   */
  setupReducedMotion() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
    }
  }

  /**
   * Setup skip links
   */
  setupSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">メインコンテンツにスキップ</a>
      <a href="#sidebar" class="skip-link">ナビゲーションにスキップ</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);

    // Style skip links
    const style = document.createElement('style');
    style.textContent = `
      .skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 10000;
      }
      
      .skip-link {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 0 0 8px 0;
      }
      
      .skip-link:focus {
        position: static;
        width: auto;
        height: auto;
        left: 0;
        top: 0;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show skip links
   */
  showSkipLinks() {
    const skipLinks = document.querySelector('.skip-links');
    if (skipLinks) {
      const firstLink = skipLinks.querySelector('.skip-link');
      if (firstLink) {
        firstLink.focus();
      }
    }
  }

  /**
   * Trap focus within element
   */
  trapFocus(element) {
    this.trapFocusElements.set(element, true);
    
    // Focus first focusable element
    const focusableElements = this.getFocusableElements(element);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Release focus trap
   */
  releaseFocusTrap(element) {
    this.trapFocusElements.delete(element);
  }

  /**
   * Get focusable elements within container
   */
  getFocusableElements(container) {
    return Array.from(container.querySelectorAll(this.focusableElements))
      .filter(element => {
        return element.offsetParent !== null && 
               !element.hasAttribute('disabled') && 
               element.tabIndex !== -1;
      });
  }

  /**
   * Enhance existing content for accessibility
   */
  enhanceExistingContent() {
    this.enhanceImages();
    this.enhanceButtons();
    this.enhanceForms();
    this.enhanceTables();
    this.enhanceModals();
    this.enhanceCharts();
  }

  /**
   * Enhance images with alt text
   */
  enhanceImages() {
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      img.setAttribute('alt', '');
    });
  }

  /**
   * Enhance buttons with proper labels
   */
  enhanceButtons() {
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      const text = button.textContent.trim();
      const icon = button.querySelector('i');
      
      if (!text && icon) {
        const iconClass = Array.from(icon.classList).find(cls => cls.startsWith('fa-'));
        if (iconClass) {
          const label = this.getIconLabel(iconClass);
          button.setAttribute('aria-label', label);
        }
      }
    });
  }

  /**
   * Get accessible label for icon
   */
  getIconLabel(iconClass) {
    const iconLabels = {
      'fa-edit': '編集',
      'fa-trash': '削除',
      'fa-save': '保存',
      'fa-cancel': 'キャンセル',
      'fa-search': '検索',
      'fa-plus': '追加',
      'fa-download': 'ダウンロード',
      'fa-upload': 'アップロード',
      'fa-print': '印刷',
      'fa-share': '共有',
      'fa-copy': 'コピー',
      'fa-paste': '貼り付け'
    };
    
    return iconLabels[iconClass] || 'アクション';
  }

  /**
   * Enhance forms with proper labels and descriptions
   */
  enhanceForms() {
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const label = input.closest('.form-group')?.querySelector('label');
      if (label && !label.getAttribute('for')) {
        const id = input.id || `input-${Math.random().toString(36).substr(2, 9)}`;
        input.id = id;
        label.setAttribute('for', id);
      }
    });

    // Add required field indicators
    const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');
    requiredFields.forEach(field => {
      if (!field.getAttribute('aria-required')) {
        field.setAttribute('aria-required', 'true');
      }
    });
  }

  /**
   * Enhance tables with proper headers
   */
  enhanceTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const headers = table.querySelectorAll('th');
      headers.forEach((header, index) => {
        if (!header.id) {
          header.id = `header-${index}-${Math.random().toString(36).substr(2, 9)}`;
        }
      });

      const cells = table.querySelectorAll('td');
      cells.forEach(cell => {
        const headerIndex = Array.from(cell.parentElement.children).indexOf(cell);
        const header = headers[headerIndex];
        if (header && !cell.getAttribute('headers')) {
          cell.setAttribute('headers', header.id);
        }
      });
    });
  }

  /**
   * Enhance modals with proper ARIA
   */
  enhanceModals() {
    const modals = document.querySelectorAll('.modal:not([role])');
    modals.forEach(modal => {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      
      const title = modal.querySelector('.modal-title, h1, h2, h3, h4, h5, h6');
      if (title && !title.id) {
        const id = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
        title.id = id;
        modal.setAttribute('aria-labelledby', id);
      }
    });
  }

  /**
   * Enhance charts with data tables
   */
  enhanceCharts() {
    const charts = document.querySelectorAll('canvas[role="img"]');
    charts.forEach(chart => {
      if (!chart.getAttribute('aria-label')) {
        chart.setAttribute('aria-label', 'データチャート');
      }
    });
  }

  /**
   * Close modal and return focus
   */
  closeModal(modal) {
    modal.setAttribute('hidden', '');
    this.releaseFocusTrap(modal);
    
    // Return focus to trigger element
    const triggerId = modal.dataset.triggerId;
    if (triggerId) {
      const trigger = document.getElementById(triggerId);
      if (trigger) {
        trigger.focus();
      }
    }
  }

  /**
   * Activate tab
   */
  activateTab(tab) {
    const tabList = tab.closest('[role="tablist"]');
    const tabs = tabList.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    // Deactivate all tabs
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });

    // Hide all panels
    panels.forEach(panel => {
      panel.setAttribute('hidden', '');
    });

    // Activate selected tab
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();

    // Show corresponding panel
    const panelId = tab.getAttribute('aria-controls');
    if (panelId) {
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.removeAttribute('hidden');
      }
    }
  }

  /**
   * Add element to accessibility controls
   */
  addToAccessibilityControls(element) {
    let controls = document.querySelector('.accessibility-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'accessibility-controls';
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', 'アクセシビリティ設定');
      document.body.appendChild(controls);

      // Style controls
      const style = document.createElement('style');
      style.textContent = `
        .accessibility-controls {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 9999;
          display: flex;
          gap: 8px;
        }
        
        .accessibility-toggle {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .accessibility-toggle:hover {
          background: rgba(0, 0, 0, 0.9);
        }
      `;
      document.head.appendChild(style);
    }
    
    controls.appendChild(element);
  }

  /**
   * Get accessibility audit report
   */
  getAccessibilityAudit() {
    const issues = [];
    
    // Check for missing alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length}個の画像にalt属性がありません`);
    }
    
    // Check for missing form labels
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (inputsWithoutLabels.length > 0) {
      issues.push(`${inputsWithoutLabels.length}個の入力フィールドにラベルがありません`);
    }
    
    // Check for insufficient color contrast (simplified check)
    const lowContrastElements = document.querySelectorAll('*[style*="color"]');
    // This would need a more sophisticated contrast calculation
    
    return {
      timestamp: new Date().toISOString(),
      issues: issues,
      announcements: this.announcements,
      focusTraps: this.trapFocusElements.size
    };
  }
}

// Export singleton instance
export const accessibilityEnhancer = new AccessibilityEnhancer();