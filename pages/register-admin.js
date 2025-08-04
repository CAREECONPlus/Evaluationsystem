/**
 * Register Admin Page Component (Firebase Integrated & UX Improved)
 * 管理者登録ページコンポーネント（Firebase連携・UX改善版）
 */
export class RegisterAdminPage {
  constructor(app) {
    this.app = app;
  }

  async render() {
    return `
      <div class="d-flex align-items-center justify-content-center py-5 bg-light vh-100">
        <div id="register-admin-container" class="card p-4 shadow-sm" style="width: 100%; max-width: 600px;">
            <h3 class="text-center mb-4" data-i18n="auth.register_admin">管理者アカウント登録</h3>
            <form id="registerAdminForm" novalidate>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="companyName" class="form-label" data-i18n="auth.company">企業名</label>
                        <input type="text" id="companyName" class="form-control" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="name" class="form-label" data-i18n="auth.name">氏名</label>
                        <input type="text" id="name" class="form-control" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label" data-i18n="auth.email">メールアドレス</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="password" class="form-label" data-i18n="auth.password">パスワード</label>
                        <input type="password" id="password" class="form-control" required minlength="6">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="confirmPassword" class="form-label" data-i18n="auth.confirm_password">パスワード確認</label>
                        <input type="password" id="confirmPassword" class="form-control" required>
                        <div id="passwordMatch" class="form-text"></div>
                    </div>
                </div>
                
                <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-lg">
                        <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                        <span data-i18n="auth.register">登録申請を行う</span>
                    </button>
                </div>
                <div class="text-center mt-3">
                    <a href="#/login" data-link data-i18n="common.back_to_login">ログインページに戻る</a>
                </div>
            </form>
        </div>
      </div>`;
  }

  async init() {
    this.app.currentPage = this;
    this.setupEventListeners();
    this.app.i18n.updateUI();
  }

  setupEventListeners() {
    const form = document.getElementById('registerAdminForm');
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
        matchDiv.textContent = "";
        return;
    }

    if (password === confirmPassword) {
        matchDiv.textContent = this.app.i18n.t('errors.passwords_match') || 'パスワードが一致しました';
        matchDiv.className = 'form-text text-success';
    } else {
        matchDiv.textContent = this.app.i18n.t('errors.passwords_not_match') || 'パスワードが一致しません';
        matchDiv.className = 'form-text text-danger';
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');

    if (document.getElementById('password').value !== document.getElementById('confirmPassword').value) {
        this.app.showError(this.app.i18n.t('errors.passwords_not_match'));
        return;
    }

    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    const userData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        name: document.getElementById('name').value,
        companyName: document.getElementById('companyName').value,
    };

    try {
        await this.app.auth.registerAndCreateProfile(userData, 'admin', 'developer_approval_pending');
        
        // ★★★ 修正点：申請成功後にメッセージ画面に切り替える ★★★
        const container = document.getElementById('register-admin-container');
        container.innerHTML = `
            <div class="text-center">
                <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h4 data-i18n="messages.register_admin_success">登録申請が完了しました</h4>
                <p class="text-muted" data-i18n="messages.register_admin_success_detail">システム開発者による承認をお待ちください。</p>
                <a href="#/login" class="btn btn-primary mt-3" data-link data-i18n="common.back_to_login">ログインページに戻る</a>
            </div>
        `;
        this.app.i18n.updateUI(container);

    } catch (err) {
        this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(err));
        spinner.classList.add('d-none');
        submitButton.disabled = false;
    }
  }
}
