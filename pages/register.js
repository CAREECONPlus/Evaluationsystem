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

  // ... 他のメソッドは変更なし

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
            // ★ 修正点: this.app.api経由で呼び出す
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
  
  // ... 他のメソッドは変更なし
}
