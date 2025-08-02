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
    // The initial render will be a loading state, 
    // the actual form will be rendered in init() after token validation.
    return `
      <div id="register-page-container" class="d-flex align-items-center justify-content-center py-5 bg-light vh-100">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    this.token = params.get('token');
    
    await this.validateInvitation();
  }

  async validateInvitation() {
    const container = document.getElementById('register-page-container');

    if (!this.token) {
      container.innerHTML = this.renderError("招待トークンが見つかりません。");
      this.app.i18n.updateUI(container);
      return;
    }

    try {
      this.invitation = await this.app.api.getInvitation(this.token);
      if (!this.invitation || this.invitation.used) {
        container.innerHTML = this.renderError("この招待リンクは無効か、既に使用されています。");
        this.app.i18n.updateUI(container);
        return;
      }
      // Optional: Check for expiration if you add an expiry date to invitations
      
      container.innerHTML = this.renderForm();
      this.setupEventListeners();
      this.app.i18n.updateUI();

    } catch (error) {
      console.error("Invitation validation error:", error);
      container.innerHTML = this.renderError("招待情報の検証中にエラーが発生しました。");
      this.app.i18n.updateUI(container);
    }
  }

  renderForm() {
    return `
        <div class="card p-4 shadow-sm" style="width: 100%; max-width: 500px;">
            <h3 class="text-center mb-4" data-i18n="auth.register_user"></h3>
            <div class="alert alert-info">
                <p class="mb-1"><strong>${this.app.sanitizeHtml(this.invitation.companyName)}</strong>の一員として招待されています。</p>
                <p class="mb-0">役割: <span class="fw-bold" data-i18n="roles.${this.invitation.role}"></span></p>
            </div>
            <form id="registerForm" novalidate>
                <div class="mb-3">
                    <label for="name" class="form-label" data-i18n="auth.name"></label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label" data-i18n="auth.email"></label>
                    <input type="email" id="email" class="form-control" value="${this.app.sanitizeHtml(this.invitation.email)}" readonly>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="password" class="form-label" data-i18n="auth.password"></label>
                        <input type="password" id="password" class="form-control" required minlength="6">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="confirmPassword" class="form-label" data-i18n="auth.confirm_password"></label>
                        <input type="password" id="confirmPassword" class="form-control" required>
                        <div id="passwordMatch" class="mt-1 small"></div>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 btn-lg">
                    <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                    <span data-i18n="auth.register"></span>
                </button>
                <div class="text-center mt-3">
                    <a href="#/login" data-link data-i18n="common.back_to_login"></a>
                </div>
            </form>
        </div>
    `;
  }

  renderError(message) {
      return `
        <div class="card p-4 text-center">
            <h4 class="text-danger" data-i18n="common.error"></h4>
            <p>${this.app.sanitizeHtml(message)}</p>
            <a href="#/login" class="btn btn-primary mt-3" data-link data-i18n="common.back_to_login"></a>
        </div>
      `;
  }

  setupEventListeners() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    password.addEventListener('input', () => this.checkPasswordMatch());
    confirmPassword.addEventListener('input', () => this.checkPasswordMatch());
  }

  checkPasswordMatch() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const matchDiv = document.getElementById("passwordMatch");
    
    if (confirmPassword.length === 0) {
        matchDiv.innerHTML = "";
        return;
    }

    if (password === confirmPassword) {
        matchDiv.innerHTML = `<span class="text-success"><i class="fas fa-check"></i> ${this.app.i18n.t('errors.passwords_match') || 'パスワードが一致しました'}</span>`;
    } else {
        matchDiv.innerHTML = `<span class="text-danger"><i class="fas fa-times"></i> ${this.app.i18n.t('errors.passwords_not_match')}</span>`;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
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
            createdAt: serverTimestamp(),
        };

        await this.app.api.createUserProfile(userCredential.user.uid, profileData);
        await this.app.api.markInvitationAsUsed(this.invitation.id, userCredential.user.uid);

        this.app.showSuccess(this.app.i18n.t('messages.register_user_success'));
        this.app.navigate('#/login');

    } catch (err) {
        this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(err));
    } finally {
        spinner.classList.add('d-none');
        submitButton.disabled = false;
    }
  }
}
