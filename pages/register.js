/**
 * Register Page Component (for invited users)
 * ユーザー登録ページコンポーネント（招待者向け）
 */
export class RegisterPage {
  constructor(app) {
    this.app = app;
    this.invitation = null;
    this.token = null;
  }

  async render() {
    return `
      <div id="register-page-container" class="d-flex align-items-center justify-content-center py-5 bg-light vh-100">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }

  async init(params) {
    this.app.currentPage = this;
    this.token = params.get('token');
    
    if (!this.token) {
      this.renderError('招待トークンが見つかりません');
      return;
    }

    try {
      this.invitation = await this.app.api.getInvitation(this.token);
      
      if (!this.invitation) {
        this.renderError('無効な招待リンクです');
        return;
      }
      
      if (this.invitation.used) {
        this.renderError('この招待リンクは既に使用されています');
        return;
      }
      
      if (new Date(this.invitation.expiresAt) < new Date()) {
        this.renderError('この招待リンクは有効期限が切れています');
        return;
      }
      
      this.renderRegistrationForm();
      
    } catch (error) {
      console.error("Error loading invitation:", error);
      this.renderError('招待情報の読み込みに失敗しました');
    }
  }

  renderError(message) {
    const container = document.getElementById('register-page-container');
    container.innerHTML = `
      <div class="card shadow-sm" style="max-width: 500px;">
        <div class="card-body text-center p-5">
          <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4 class="mb-3">エラー</h4>
          <p class="text-muted">${message}</p>
          <a href="#/login" class="btn btn-primary mt-3" data-link>
            <i class="fas fa-arrow-left me-2"></i>ログインページへ戻る
          </a>
        </div>
      </div>
    `;
  }

  renderRegistrationForm() {
    const container = document.getElementById('register-page-container');
    container.innerHTML = `
      <div class="card shadow-sm" style="max-width: 500px; width: 100%;">
        <div class="card-body p-4">
          <h3 class="text-center mb-4" data-i18n="auth.register_user">ユーザー登録</h3>
          
          <div class="alert alert-info">
            <small>
              <strong>企業:</strong> ${this.app.sanitizeHtml(this.invitation.companyName)}<br>
              <strong>役割:</strong> <span data-i18n="roles.${this.invitation.role}"></span><br>
              <strong>メールアドレス:</strong> ${this.app.sanitizeHtml(this.invitation.email)}
            </small>
          </div>
          
          <form id="registrationForm">
            <div class="mb-3">
              <label for="name" class="form-label" data-i18n="auth.name">氏名</label>
              <input type="text" class="form-control" id="name" required>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label" data-i18n="auth.password">パスワード</label>
              <input type="password" class="form-control" id="password" required minlength="6">
              <small class="form-text text-muted">6文字以上で入力してください</small>
            </div>
            
            <div class="mb-3">
              <label for="confirmPassword" class="form-label" data-i18n="auth.confirm_password">パスワード確認</label>
              <input type="password" class="form-control" id="confirmPassword" required>
              <div id="passwordMatch" class="form-text"></div>
            </div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg">
                <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                <span data-i18n="auth.register">登録</span>
              </button>
            </div>
          </form>
          
          <div class="text-center mt-3">
            <a href="#/login" data-link data-i18n="common.back_to_login">ログインページに戻る</a>
          </div>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
    this.app.i18n.updateUI(container);
  }

  setupEventListeners() {
    const form = document.getElementById('registrationForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    form.addEventListener('submit', (e) => this.handleRegistration(e));
    password.addEventListener('input', () => this.checkPasswordMatch());
    confirmPassword.addEventListener('input', () => this.checkPasswordMatch());
  }

  checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchDiv = document.getElementById('passwordMatch');
    
    if (confirmPassword.length === 0) {
      matchDiv.textContent = '';
      return;
    }
    
    if (password === confirmPassword) {
      matchDiv.textContent = 'パスワードが一致しました';
      matchDiv.className = 'form-text text-success';
    } else {
      matchDiv.textContent = 'パスワードが一致しません';
      matchDiv.className = 'form-text text-danger';
    }
  }

  async handleRegistration(e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');

    const password = document.getElementById('password').value;
    if (password !== document.getElementById('confirmPassword').value) {
        this.app.showError(this.app.i18n.t('errors.passwords_not_match'));
        return;
    }

    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    const userData = {
        email: this.invitation.email,
        password: password,
        name: document.getElementById('name').value,
        tenantId: this.invitation.tenantId,
        evaluatorId: this.invitation.evaluatorId,
        jobTypeId: this.invitation.jobTypeId,
    };

    try {
        const userCredential = await this.app.auth.registerWithEmail(userData.email, userData.password);
        
        const profileData = {
            name: userData.name,
            email: userData.email,
            role: this.invitation.role,
            status: 'pending_approval',
            tenantId: userData.tenantId,
            evaluatorId: userData.evaluatorId,
            jobTypeId: userData.jobTypeId,
            createdAt: this.app.api.serverTimestamp(),
        };

        await this.app.api.createUserProfile(userCredential.user.uid, profileData);
        await this.app.api.markInvitationAsUsed(this.invitation.id, userCredential.user.uid);

        this.app.showSuccess(this.app.i18n.t('messages.register_user_success'));
        this.app.navigate('#/login');

    } catch (err) {
        this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(err));
        spinner.classList.add('d-none');
        submitButton.disabled = false;
    }
  }
}
