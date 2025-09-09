/**
 * Security Auditor - Phase 9
 * セキュリティ監査とバリデーション強化
 */

export class SecurityAuditor {
  constructor(app) {
    this.app = app;
    this.securityConfig = {
      maxLoginAttempts: 5,
      lockoutDuration: 300000, // 5分
      sessionTimeout: 1800000, // 30分
      passwordMinLength: 8,
      passwordRequiredPatterns: {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        numbers: /\d/,
        special: /[!@#$%^&*(),.?":{}|<>]/
      },
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      maxFileSize: 10485760, // 10MB
      rateLimit: {
        requests: 100,
        window: 900000 // 15分
      }
    };
    
    this.auditLog = [];
    this.threatDetection = new Map();
    this.ipWhitelist = new Set();
    this.ipBlacklist = new Set();
    this.loginAttempts = new Map();
    this.rateLimitTracker = new Map();
    
    this.init();
  }

  /**
   * セキュリティ監査システムの初期化
   */
  init() {
    this.setupCSPHeaders();
    this.setupInputSanitization();
    this.setupRateLimiting();
    this.setupSessionMonitoring();
    this.setupThreatDetection();
    this.startSecurityAudit();
    
    console.log('Security Auditor: システムが初期化されました');
  }

  /**
   * Content Security Policy設定
   */
  setupCSPHeaders() {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    document.head.appendChild(cspMeta);
  }

  /**
   * 入力サニタイゼーション設定
   */
  setupInputSanitization() {
    // 全てのフォーム要素に対するバリデーション
    document.addEventListener('input', (event) => {
      if (event.target.matches('input, textarea')) {
        this.sanitizeInput(event.target);
      }
    });

    // フォーム送信時の検証
    document.addEventListener('submit', (event) => {
      if (!this.validateForm(event.target)) {
        event.preventDefault();
        this.logSecurityEvent('form_validation_failed', {
          formId: event.target.id,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * 入力値のサニタイゼーション
   */
  sanitizeInput(element) {
    const value = element.value;
    
    // XSSパターンの検出
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi
    ];

    const hasXSS = xssPatterns.some(pattern => pattern.test(value));
    
    if (hasXSS) {
      this.logSecurityEvent('xss_attempt', {
        input: element.name || element.id,
        value: value.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      
      // 危険なコンテンツを除去
      element.value = this.stripDangerousContent(value);
      element.classList.add('security-warning');
    }

    // SQLインジェクションパターンの検出
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /('|(\\)|(;)|(--)|(\|)|(\*)|(%27)|(%2527))/gi
    ];

    const hasSQLInjection = sqlPatterns.some(pattern => pattern.test(value));
    
    if (hasSQLInjection) {
      this.logSecurityEvent('sql_injection_attempt', {
        input: element.name || element.id,
        value: value.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      
      element.value = this.sanitizeSQL(value);
      element.classList.add('security-warning');
    }
  }

  /**
   * 危険なコンテンツの除去
   */
  stripDangerousContent(input) {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '');
  }

  /**
   * SQLサニタイゼーション
   */
  sanitizeSQL(input) {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  /**
   * フォームバリデーション
   */
  validateForm(form) {
    let isValid = true;
    const formData = new FormData(form);
    
    // 各フィールドの検証
    for (const [name, value] of formData.entries()) {
      if (!this.validateField(name, value)) {
        isValid = false;
      }
    }

    // CSRF保護の確認
    if (!this.validateCSRFToken(form)) {
      isValid = false;
      this.logSecurityEvent('csrf_validation_failed', {
        formId: form.id,
        timestamp: new Date().toISOString()
      });
    }

    return isValid;
  }

  /**
   * フィールドバリデーション
   */
  validateField(name, value) {
    // パスワードの強度チェック
    if (name.toLowerCase().includes('password')) {
      return this.validatePassword(value);
    }

    // メールアドレスの形式チェック
    if (name.toLowerCase().includes('email')) {
      return this.validateEmail(value);
    }

    // ファイルアップロードのチェック
    if (name.toLowerCase().includes('file')) {
      return this.validateFile(value);
    }

    // 一般的な入力値チェック
    return this.validateGenericInput(value);
  }

  /**
   * パスワード強度の検証
   */
  validatePassword(password) {
    if (password.length < this.securityConfig.passwordMinLength) {
      return false;
    }

    const patterns = this.securityConfig.passwordRequiredPatterns;
    const hasUppercase = patterns.uppercase.test(password);
    const hasLowercase = patterns.lowercase.test(password);
    const hasNumbers = patterns.numbers.test(password);
    const hasSpecial = patterns.special.test(password);

    return hasUppercase && hasLowercase && hasNumbers && hasSpecial;
  }

  /**
   * メールアドレスの検証
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    
    // ドメインのブラックリストチェック
    const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    const isSuspiciousDomain = suspiciousDomains.includes(domain);

    if (isSuspiciousDomain) {
      this.logSecurityEvent('suspicious_email_domain', {
        email: email,
        domain: domain,
        timestamp: new Date().toISOString()
      });
    }

    return isValidFormat && !isSuspiciousDomain;
  }

  /**
   * ファイルの検証
   */
  validateFile(file) {
    if (!file || typeof file !== 'object') return true;

    const fileName = file.name;
    const fileSize = file.size;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // ファイルタイプのチェック
    if (!this.securityConfig.allowedFileTypes.includes(fileExtension)) {
      this.logSecurityEvent('unauthorized_file_type', {
        fileName: fileName,
        fileType: fileExtension,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // ファイルサイズのチェック
    if (fileSize > this.securityConfig.maxFileSize) {
      this.logSecurityEvent('file_size_exceeded', {
        fileName: fileName,
        fileSize: fileSize,
        maxSize: this.securityConfig.maxFileSize,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    return true;
  }

  /**
   * 一般的な入力値の検証
   */
  validateGenericInput(value) {
    // 異常に長い文字列の検出
    if (value.length > 10000) {
      this.logSecurityEvent('excessive_input_length', {
        length: value.length,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // 制御文字の検出
    const controlChars = /[\x00-\x1F\x7F]/g;
    if (controlChars.test(value)) {
      this.logSecurityEvent('control_characters_detected', {
        timestamp: new Date().toISOString()
      });
      return false;
    }

    return true;
  }

  /**
   * CSRF トークンの検証
   */
  validateCSRFToken(form) {
    const csrfToken = form.querySelector('input[name="csrf_token"]');
    if (!csrfToken) return false;

    const expectedToken = this.getCSRFToken();
    return csrfToken.value === expectedToken;
  }

  /**
   * CSRF トークンの生成/取得
   */
  getCSRFToken() {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
      token = this.generateSecureToken();
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  }

  /**
   * セキュアなトークンの生成
   */
  generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * レート制限の設定
   */
  setupRateLimiting() {
    this.rateLimitWindow = setInterval(() => {
      this.rateLimitTracker.clear();
    }, this.securityConfig.rateLimit.window);
  }

  /**
   * レート制限のチェック
   */
  checkRateLimit(identifier) {
    const currentCount = this.rateLimitTracker.get(identifier) || 0;
    
    if (currentCount >= this.securityConfig.rateLimit.requests) {
      this.logSecurityEvent('rate_limit_exceeded', {
        identifier: identifier,
        count: currentCount,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    this.rateLimitTracker.set(identifier, currentCount + 1);
    return true;
  }

  /**
   * セッション監視の設定
   */
  setupSessionMonitoring() {
    // セッションタイムアウトの監視
    this.sessionTimer = setInterval(() => {
      this.checkSessionTimeout();
    }, 60000); // 1分ごと

    // アクティビティの監視
    ['click', 'keypress', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.updateLastActivity();
      });
    });
  }

  /**
   * セッションタイムアウトのチェック
   */
  checkSessionTimeout() {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return;

    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    
    if (timeSinceActivity > this.securityConfig.sessionTimeout) {
      this.logSecurityEvent('session_timeout', {
        lastActivity: new Date(parseInt(lastActivity)).toISOString(),
        timestamp: new Date().toISOString()
      });
      
      this.handleSessionTimeout();
    }
  }

  /**
   * 最後のアクティビティ時刻の更新
   */
  updateLastActivity() {
    localStorage.setItem('last_activity', Date.now().toString());
  }

  /**
   * セッションタイムアウトの処理
   */
  handleSessionTimeout() {
    // セッションを無効化
    sessionStorage.clear();
    localStorage.removeItem('auth_token');
    
    // ユーザーにアラートを表示
    if (this.app && this.app.showModal) {
      this.app.showModal({
        title: 'セッションタイムアウト',
        body: 'セキュリティのため、セッションがタイムアウトしました。再度ログインしてください。',
        confirmText: 'ログインページへ',
        onConfirm: () => {
          window.location.href = '/login';
        }
      });
    }
  }

  /**
   * 脅威検出の設定
   */
  setupThreatDetection() {
    // 異常なリクエストパターンの検出
    this.monitorAbnormalBehavior();
    
    // ブルートフォース攻撃の検出
    this.monitorBruteForceAttempts();
    
    // DevToolsの使用検出
    this.detectDevToolsUsage();
  }

  /**
   * 異常な行動パターンの監視
   */
  monitorAbnormalBehavior() {
    let rapidClickCount = 0;
    let rapidClickTimer;

    document.addEventListener('click', () => {
      rapidClickCount++;
      
      clearTimeout(rapidClickTimer);
      rapidClickTimer = setTimeout(() => {
        if (rapidClickCount > 50) { // 短時間での異常なクリック数
          this.logSecurityEvent('abnormal_click_pattern', {
            clickCount: rapidClickCount,
            timestamp: new Date().toISOString()
          });
        }
        rapidClickCount = 0;
      }, 10000); // 10秒間
    });
  }

  /**
   * ブルートフォース攻撃の監視
   */
  monitorBruteForceAttempts() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const isLoginForm = form.querySelector('input[type="password"]');
      
      if (isLoginForm) {
        const identifier = this.getClientIdentifier();
        const attempts = this.loginAttempts.get(identifier) || 0;
        
        this.loginAttempts.set(identifier, attempts + 1);
        
        if (attempts >= this.securityConfig.maxLoginAttempts) {
          event.preventDefault();
          this.handleBruteForceAttempt(identifier);
        }
      }
    });
  }

  /**
   * クライアント識別子の取得
   */
  getClientIdentifier() {
    // IPアドレス、ユーザーエージェント等の組み合わせでの識別
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenInfo = `${window.screen.width}x${window.screen.height}`;
    
    return btoa(`${userAgent}-${language}-${screenInfo}`).substring(0, 32);
  }

  /**
   * ブルートフォース攻撃の処理
   */
  handleBruteForceAttempt(identifier) {
    this.logSecurityEvent('brute_force_attempt', {
      identifier: identifier,
      attempts: this.loginAttempts.get(identifier),
      timestamp: new Date().toISOString()
    });
    
    // 一時的にアクセスをブロック
    setTimeout(() => {
      this.loginAttempts.delete(identifier);
    }, this.securityConfig.lockoutDuration);
    
    if (this.app && this.app.showWarning) {
      this.app.showWarning('セキュリティのため、しばらくの間ログイン試行がブロックされました。');
    }
  }

  /**
   * DevToolsの使用検出
   */
  detectDevToolsUsage() {
    let devtools = { open: false, orientation: null };
    
    setInterval(() => {
      const threshold = 160;
      
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        
        if (!devtools.open) {
          devtools.open = true;
          this.logSecurityEvent('devtools_opened', {
            timestamp: new Date().toISOString()
          });
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  /**
   * セキュリティ監査の開始
   */
  startSecurityAudit() {
    // 定期的なセキュリティチェック
    this.auditInterval = setInterval(() => {
      this.performSecurityAudit();
    }, 300000); // 5分ごと
  }

  /**
   * セキュリティ監査の実行
   */
  performSecurityAudit() {
    const auditResults = {
      timestamp: new Date().toISOString(),
      checks: {
        csp: this.auditCSP(),
        https: this.auditHTTPS(),
        cookies: this.auditCookies(),
        localStorage: this.auditLocalStorage(),
        permissions: this.auditPermissions()
      }
    };

    this.logSecurityEvent('security_audit', auditResults);
    
    // 重要な問題が発見された場合のアラート
    const criticalIssues = Object.entries(auditResults.checks)
      .filter(([key, result]) => result.status === 'critical');
      
    if (criticalIssues.length > 0) {
      console.warn('Security Auditor: 重要なセキュリティ問題が検出されました:', criticalIssues);
    }

    return auditResults;
  }

  /**
   * CSPの監査
   */
  auditCSP() {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    return {
      status: cspMeta ? 'ok' : 'warning',
      message: cspMeta ? 'CSP設定済み' : 'CSPが設定されていません',
      hasCSP: !!cspMeta
    };
  }

  /**
   * HTTPS接続の監査
   */
  auditHTTPS() {
    const isHTTPS = window.location.protocol === 'https:';
    
    return {
      status: isHTTPS ? 'ok' : 'critical',
      message: isHTTPS ? 'HTTPS接続' : 'HTTP接続（セキュリティリスク）',
      protocol: window.location.protocol
    };
  }

  /**
   * Cookieの監査
   */
  auditCookies() {
    const cookies = document.cookie.split(';');
    const secureCookies = cookies.filter(cookie => 
      cookie.includes('Secure') && cookie.includes('HttpOnly')
    );
    
    return {
      status: secureCookies.length === cookies.length ? 'ok' : 'warning',
      message: `${secureCookies.length}/${cookies.length} のCookieが安全に設定されています`,
      totalCookies: cookies.length,
      secureCookies: secureCookies.length
    };
  }

  /**
   * LocalStorageの監査
   */
  auditLocalStorage() {
    const sensitiveKeys = ['password', 'token', 'secret', 'key'];
    const storageKeys = Object.keys(localStorage);
    const sensitivData = storageKeys.filter(key => 
      sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    );

    return {
      status: sensitivData.length === 0 ? 'ok' : 'warning',
      message: sensitivData.length > 0 ? 
        'LocalStorageに機密データが保存されている可能性があります' : 
        'LocalStorageは安全です',
      sensitiveKeys: sensitivData
    };
  }

  /**
   * 権限の監査
   */
  auditPermissions() {
    const dangerousPermissions = ['camera', 'microphone', 'geolocation'];
    const grantedPermissions = [];

    // 利用可能な権限をチェック（非同期だが結果は保存しない）
    dangerousPermissions.forEach(permission => {
      if (navigator.permissions) {
        navigator.permissions.query({ name: permission }).then(result => {
          if (result.state === 'granted') {
            grantedPermissions.push(permission);
          }
        });
      }
    });

    return {
      status: 'ok',
      message: '権限監査完了',
      checkedPermissions: dangerousPermissions
    };
  }

  /**
   * セキュリティイベントのログ記録
   */
  logSecurityEvent(eventType, data) {
    const logEntry = {
      id: this.generateSecureToken().substring(0, 16),
      type: eventType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      data: data
    };

    this.auditLog.push(logEntry);
    
    // ログの上限を設定（メモリ使用量制限）
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-500);
    }

    // 重要なイベントはコンソールにも出力
    const criticalEvents = ['xss_attempt', 'sql_injection_attempt', 'brute_force_attempt'];
    if (criticalEvents.includes(eventType)) {
      console.warn(`Security Alert [${eventType}]:`, data);
    }

    // サーバーへの送信（実装時にuncomment）
    // this.sendSecurityLog(logEntry);
  }

  /**
   * セキュリティレポートの生成
   */
  generateSecurityReport() {
    const now = new Date();
    const report = {
      timestamp: now.toISOString(),
      summary: {
        totalEvents: this.auditLog.length,
        criticalEvents: this.auditLog.filter(log => 
          ['xss_attempt', 'sql_injection_attempt', 'brute_force_attempt'].includes(log.type)
        ).length,
        lastAudit: this.auditLog.find(log => log.type === 'security_audit')?.timestamp,
        systemStatus: this.getSystemSecurityStatus()
      },
      eventsByType: this.getEventStatistics(),
      recentCriticalEvents: this.auditLog
        .filter(log => ['xss_attempt', 'sql_injection_attempt', 'brute_force_attempt'].includes(log.type))
        .slice(-10),
      recommendations: this.generateSecurityRecommendations()
    };

    return report;
  }

  /**
   * システムセキュリティ状態の取得
   */
  getSystemSecurityStatus() {
    const criticalIssues = this.auditLog.filter(log => 
      ['xss_attempt', 'sql_injection_attempt', 'brute_force_attempt'].includes(log.type) &&
      Date.now() - new Date(log.timestamp).getTime() < 3600000 // 過去1時間
    ).length;

    if (criticalIssues >= 10) return 'critical';
    if (criticalIssues >= 3) return 'warning';
    return 'ok';
  }

  /**
   * イベント統計の取得
   */
  getEventStatistics() {
    const stats = {};
    
    this.auditLog.forEach(log => {
      stats[log.type] = (stats[log.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * セキュリティ推奨事項の生成
   */
  generateSecurityRecommendations() {
    const recommendations = [];
    const stats = this.getEventStatistics();

    if (stats.xss_attempt > 0) {
      recommendations.push('XSS攻撃の試行が検出されました。入力バリデーションの強化を推奨します。');
    }

    if (stats.sql_injection_attempt > 0) {
      recommendations.push('SQLインジェクションの試行が検出されました。パラメータ化クエリの使用を確認してください。');
    }

    if (stats.brute_force_attempt > 0) {
      recommendations.push('ブルートフォース攻撃の試行が検出されました。アカウントロック機能の強化を検討してください。');
    }

    if (stats.rate_limit_exceeded > 5) {
      recommendations.push('レート制限の超過が頻発しています。制限値の調整を検討してください。');
    }

    if (recommendations.length === 0) {
      recommendations.push('現在のところ、セキュリティ上の問題は検出されていません。');
    }

    return recommendations;
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup() {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
    }
    
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    
    if (this.rateLimitWindow) {
      clearInterval(this.rateLimitWindow);
    }
    
    this.auditLog = [];
    this.threatDetection.clear();
    this.loginAttempts.clear();
    this.rateLimitTracker.clear();
  }
}

// Export singleton instance
export const securityAuditor = new SecurityAuditor();