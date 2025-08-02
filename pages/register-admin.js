/**
 * Register Admin Page Component (Firebase Integrated)
 * 管理者登録ページコンポーネント（Firebase連携版）
 */
export class RegisterAdminPage {
  constructor(app) {
    this.app = app;
  }

  async render() {
    // This HTML structure is based on the user's provided, more detailed version.
    return `
      <div class="d-flex align-items-center justify-content-center py-5 bg-light">
        <div class="card p-4 shadow-sm" style="width: 100%; max-width: 600px;">
            <h3 class="text-center mb-4" data-i18n="auth.register_admin"></h3>
            <form id="registerAdminForm" novalidate>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="companyName" class="form-label" data-i18n="auth.company"></label>
                        <input type="text" id="companyName" class="form-control" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="name" class="form-label" data-i18n="auth.name"></label>
                        <input type="text" id="name" class="form-control" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label" data-i18n="auth.email"></label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="password" class="form-label" data-i18n="auth.password"></label>
                        <input type="password" id="password" class="form-control" required minlength="6">
                        <div id="passwordStrength" class="mt-1"></div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="confirmPassword" class="form-label" data-i18n="auth.confirm_password"></label>
                        <input type="password" id="confirmPassword" class="form-control" required>
                        <div id="passwordMatch" class="mt-1"></div>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 btn-lg">
                    <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                    <span data-i18n="auth.register_admin"></span>
                </button>
                <div class="text-center mt-3">
                    <a href="#/login" data-link data-i18n="common.back_to_login"></a>
                </div>
            </form>
        </div>
      </div>`;
  }

  async init() {
    this.app.currentPage = this;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById('registerAdminForm');
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
        matchDiv.innerHTML = `<small class="text-success"><i class="fas fa-check"></i> ${this.app.i18n.t('errors.passwords_match') || 'パスワードが一致しました'}</small>`;
    } else {
        matchDiv.innerHTML = `<small class="text-danger"><i class="fas fa-times"></i> ${this.app.i18n.t('errors.passwords_not_match')}</small>`;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        this.app.showError(this.app.i18n.t('errors.passwords_not_match'));
        return;
    }

    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    const userData = {
        email: document.getElementById('email').value,
        password: password,
        name: document.getElementById('name').value,
        companyName: document.getElementById('companyName').value,
    };

    try {
        // The auth.registerAndCreateProfile method handles both Auth creation and Firestore profile creation.
        await this.app.auth.registerAndCreateProfile(
            userData, 
            'admin', 
            'developer_approval_pending'
        );

        this.app.showSuccess(this.app.i18n.t('messages.register_admin_success'));
        this.app.navigate('#/login');

    } catch (err) {
        this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(err));
    } finally {
        spinner.classList.add('d-none');
        submitButton.disabled = false;
    }
  }
}
