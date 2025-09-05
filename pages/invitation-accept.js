/**
 * Invitation Accept Page
 * 招待受諾ページ
 */

import { validateToken } from '../utils/token-generator.js';

export class InvitationAcceptPage {
  constructor(app) {
    this.app = app;
    this.invitationCode = null;
    this.invitationData = null;
    this.isLoading = false;
    this.isProcessing = false;
  }

  async render() {
    return `
      <div class="invitation-accept-page">
        <!-- ヘッダー部分 -->
        <div class="container-fluid bg-primary text-white py-4">
          <div class="row">
            <div class="col-12 text-center">
              <h1 class="h2 mb-2">
                <i class="fas fa-envelope-open me-2"></i>
                招待を受け取りました
              </h1>
              <p class="mb-0">組織への参加手続きを完了してください</p>
            </div>
          </div>
        </div>

        <!-- メインコンテンツ -->
        <div class="container py-5">
          <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
              
              <!-- 招待情報カード -->
              <div class="card shadow-sm border-0 mb-4" id="invitation-info-card">
                <div class="card-body p-4 text-center">
                  <div class="spinner-border text-primary mb-3" role="status" id="loading-spinner">
                    <span class="visually-hidden">招待情報を読み込み中...</span>
                  </div>
                  <p class="text-muted mb-0">招待情報を確認しています...</p>
                </div>
              </div>

              <!-- 登録フォーム -->
              <div class="card shadow-sm border-0" id="registration-form-card" style="display: none;">
                <div class="card-header bg-light border-0 py-3">
                  <h5 class="card-title mb-0 text-center">
                    <i class="fas fa-user-plus me-2"></i>
                    アカウント作成
                  </h5>
                </div>
                <div class="card-body p-4">
                  <form id="registration-form" novalidate>
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="first-name" class="form-label">姓</label>
                          <input type="text" class="form-control" id="first-name" required>
                          <div class="invalid-feedback">姓を入力してください。</div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="last-name" class="form-label">名</label>
                          <input type="text" class="form-control" id="last-name" required>
                          <div class="invalid-feedback">名を入力してください。</div>
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="email" class="form-label">メールアドレス</label>
                      <input type="email" class="form-control" id="email" readonly>
                      <small class="form-text text-muted">招待されたメールアドレスです（変更できません）</small>
                    </div>

                    <div class="mb-3">
                      <label for="password" class="form-label">パスワード</label>
                      <div class="input-group">
                        <input type="password" class="form-control" id="password" required minlength="6">
                        <button class="btn btn-outline-secondary" type="button" id="toggle-password">
                          <i class="fas fa-eye" id="password-icon"></i>
                        </button>
                      </div>
                      <div class="invalid-feedback">パスワードは6文字以上で入力してください。</div>
                      <small class="form-text text-muted">6文字以上の安全なパスワードを設定してください</small>
                    </div>

                    <div class="mb-3">
                      <label for="password-confirm" class="form-label">パスワード確認</label>
                      <input type="password" class="form-control" id="password-confirm" required>
                      <div class="invalid-feedback">パスワードが一致しません。</div>
                    </div>

                    <div class="mb-4">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="terms-agree" required>
                        <label class="form-check-label" for="terms-agree">
                          <a href="#" class="text-decoration-none">利用規約</a> および 
                          <a href="#" class="text-decoration-none">プライバシーポリシー</a> に同意します
                        </label>
                        <div class="invalid-feedback">利用規約への同意が必要です。</div>
                      </div>
                    </div>

                    <div class="d-grid">
                      <button type="submit" class="btn btn-primary btn-lg" id="register-button">
                        <span class="spinner-border spinner-border-sm d-none me-2" role="status" id="register-spinner"></span>
                        <i class="fas fa-user-check me-2"></i>
                        アカウントを作成
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- エラー表示 -->
              <div class="alert alert-danger d-none" role="alert" id="error-alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <span id="error-message">エラーが発生しました。</span>
              </div>

              <!-- 成功表示 -->
              <div class="alert alert-success d-none" role="alert" id="success-alert">
                <i class="fas fa-check-circle me-2"></i>
                <span id="success-message">登録が完了しました。</span>
              </div>
            </div>
          </div>
        </div>

        <!-- フッター -->
        <footer class="bg-light py-4 mt-5">
          <div class="container">
            <div class="row">
              <div class="col-12 text-center">
                <p class="text-muted mb-2">
                  <small>招待リンクに問題がある場合は、システム管理者にお問い合わせください。</small>
                </p>
                <p class="text-muted mb-0">
                  <small>&copy; 2024 建設業評価管理システム</small>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  async init(params) {
    
    // URLパラメータから招待コードを取得
    this.invitationCode = params.get('code');
    
    if (!this.invitationCode) {
      this.showError('招待コードが見つかりません。URLを確認してください。');
      return;
    }

    // 招待コードの形式チェック
    if (!validateToken(this.invitationCode, 'invitation')) {
      this.showError('無効な招待コードです。');
      return;
    }

    // イベントリスナーの設定
    this.setupEventListeners();

    // 招待情報の読み込み
    await this.loadInvitationInfo();
  }

  setupEventListeners() {
    // パスワード表示切り替え
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
      togglePassword.addEventListener('click', this.togglePasswordVisibility.bind(this));
    }

    // パスワード確認のリアルタイムバリデーション
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password-confirm');
    
    if (password && passwordConfirm) {
      passwordConfirm.addEventListener('input', this.validatePasswordMatch.bind(this));
    }

    // 登録フォームの送信
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
      registrationForm.addEventListener('submit', this.handleRegistration.bind(this));
    }
  }

  async loadInvitationInfo() {
    try {
      this.isLoading = true;
      this.showLoading();


      // 招待情報を取得
      const response = await this.app.api.validateInvitationCode(this.invitationCode);
      
      if (!response || !response.success) {
        throw new Error(response?.message || '招待情報の取得に失敗しました。');
      }

      this.invitationData = response.data;

      // 招待情報を表示
      this.displayInvitationInfo();
      this.showRegistrationForm();

    } catch (error) {
      console.error('InvitationAccept: Failed to load invitation info:', error);
      
      let errorMessage = '招待情報の読み込みに失敗しました。';
      
      if (error.message.includes('expired')) {
        errorMessage = 'この招待は有効期限が切れています。新しい招待を依頼してください。';
      } else if (error.message.includes('used')) {
        errorMessage = 'この招待は既に使用されています。';
      } else if (error.message.includes('not found')) {
        errorMessage = '招待が見つかりません。招待コードを確認してください。';
      }
      
      this.showError(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  displayInvitationInfo() {
    const card = document.getElementById('invitation-info-card');
    if (!card || !this.invitationData) return;

    const roleName = this.getRoleDisplayName(this.invitationData.role);
    const companyName = this.invitationData.companyName || 'お客様の組織';

    card.innerHTML = `
      <div class="card-body p-4 text-center">
        <div class="mb-3">
          <i class="fas fa-building fa-3x text-primary mb-2"></i>
          <h4 class="card-title">${this.app.sanitizeHtml(companyName)}</h4>
        </div>
        
        <div class="row text-center mb-4">
          <div class="col-md-6">
            <div class="p-3 bg-light rounded">
              <i class="fas fa-envelope text-primary mb-2"></i>
              <h6 class="mb-1">招待されたメール</h6>
              <p class="mb-0 small text-muted">${this.app.sanitizeHtml(this.invitationData.email)}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 bg-light rounded">
              <i class="fas fa-user-tag text-success mb-2"></i>
              <h6 class="mb-1">役割</h6>
              <span class="badge bg-success">${roleName}</span>
            </div>
          </div>
        </div>

        ${this.invitationData.message ? `
          <div class="alert alert-info">
            <i class="fas fa-comment me-2"></i>
            <strong>メッセージ:</strong> ${this.app.sanitizeHtml(this.invitationData.message)}
          </div>
        ` : ''}

        <p class="text-success mb-0">
          <i class="fas fa-check-circle me-2"></i>
          招待は有効です。アカウントを作成してください。
        </p>
      </div>
    `;
  }

  showRegistrationForm() {
    const formCard = document.getElementById('registration-form-card');
    const emailField = document.getElementById('email');
    
    if (formCard && this.invitationData) {
      formCard.style.display = 'block';
      
      if (emailField) {
        emailField.value = this.invitationData.email;
      }
    }
  }

  togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordField && passwordIcon) {
      const isPassword = passwordField.type === 'password';
      passwordField.type = isPassword ? 'text' : 'password';
      passwordIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
  }

  validatePasswordMatch() {
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password-confirm');
    
    if (password && passwordConfirm) {
      const isMatch = password.value === passwordConfirm.value;
      
      passwordConfirm.setCustomValidity(isMatch ? '' : 'パスワードが一致しません');
      
      if (passwordConfirm.value.length > 0) {
        passwordConfirm.classList.toggle('is-valid', isMatch);
        passwordConfirm.classList.toggle('is-invalid', !isMatch);
      }
    }
  }

  async handleRegistration(event) {
    event.preventDefault();
    
    if (this.isProcessing) return;

    const form = event.target;
    const registerButton = document.getElementById('register-button');
    const registerSpinner = document.getElementById('register-spinner');

    // フォームバリデーション
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // パスワード一致確認
    this.validatePasswordMatch();
    const passwordConfirm = document.getElementById('password-confirm');
    if (!passwordConfirm.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    try {
      this.isProcessing = true;
      this.hideAlerts();

      // ボタン状態更新
      registerButton.disabled = true;
      registerSpinner.classList.remove('d-none');

      // フォームデータを収集
      const formData = this.collectFormData();
      

      // アカウント作成APIを呼び出し
      const response = await this.app.api.acceptInvitation(this.invitationCode, formData);
      
      if (!response || !response.success) {
        throw new Error(response?.message || '登録に失敗しました。');
      }

      // 成功処理
      this.showSuccess('アカウントが正常に作成されました。ログインページに移動します...');
      
      // 少し待ってからログインページにリダイレクト
      setTimeout(() => {
        this.app.navigate('#/login');
      }, 2000);

    } catch (error) {
      console.error('InvitationAccept: Registration failed:', error);
      
      let errorMessage = 'アカウント作成に失敗しました。';
      
      if (error.message.includes('email')) {
        errorMessage = 'このメールアドレスは既に登録されています。';
      } else if (error.message.includes('expired')) {
        errorMessage = '招待の有効期限が切れています。新しい招待を依頼してください。';
      } else if (error.message.includes('used')) {
        errorMessage = 'この招待は既に使用されています。';
      }
      
      this.showError(errorMessage);
      
    } finally {
      this.isProcessing = false;
      registerButton.disabled = false;
      registerSpinner.classList.add('d-none');
    }
  }

  collectFormData() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const password = document.getElementById('password').value;
    
    return {
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email: this.invitationData.email,
      password,
      role: this.invitationData.role
    };
  }

  getRoleDisplayName(role) {
    const roleNames = {
      admin: '管理者',
      evaluator: '評価者',
      worker: '一般ユーザー',
      developer: '開発者'
    };
    
    return roleNames[role] || role;
  }

  showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.style.display = 'block';
    }
  }

  showError(message) {
    this.hideAlerts();
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    
    if (errorAlert && errorMessage) {
      errorMessage.textContent = message;
      errorAlert.classList.remove('d-none');
      
      // エラー位置までスクロール
      errorAlert.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showSuccess(message) {
    this.hideAlerts();
    const successAlert = document.getElementById('success-alert');
    const successMessage = document.getElementById('success-message');
    
    if (successAlert && successMessage) {
      successMessage.textContent = message;
      successAlert.classList.remove('d-none');
      
      // 成功メッセージ位置までスクロール
      successAlert.scrollIntoView({ behavior: 'smooth' });
    }
  }

  hideAlerts() {
    const errorAlert = document.getElementById('error-alert');
    const successAlert = document.getElementById('success-alert');
    
    if (errorAlert) errorAlert.classList.add('d-none');
    if (successAlert) successAlert.classList.add('d-none');
  }

  cleanup() {
    // イベントリスナーのクリーンアップは自動的に行われる（要素削除時）
    this.invitationData = null;
    this.isLoading = false;
    this.isProcessing = false;
    
  }
}