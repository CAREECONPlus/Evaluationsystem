/**
 * Register Page Component - 完全版（招待機能対応）
 * ユーザー登録ページ
 */

export class RegisterPage {
  constructor(app) {
    this.app = app;
    this.invitation = null;
    this.isLoading = false;
  }

  async render() {
    return `
      <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div class="row w-100 justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow-lg border-0">
              <div class="card-body p-5">
                <div id="register-container">
                  <!-- 初期状態：ローディング -->
                  <div id="loading-state" class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status">
                      <span class="visually-hidden">読み込み中...</span>
                    </div>
                    <p class="text-muted">招待情報を確認しています...</p>
                  </div>
                  
                  <!-- 招待情報表示エリア -->
                  <div id="invitation-info" class="d-none">
                    <div class="text-center mb-4">
                      <i class="fas fa-user-plus fa-3x text-primary mb-3"></i>
                      <h2 class="h4">ユーザー登録</h2>
                      <div class="alert alert-info mt-3">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong id="company-name"></strong>への招待を受けています
                      </div>
                    </div>
                  </div>
                  
                  <!-- 登録フォーム -->
                  <div id="register-form" class="d-none">
                    <form id="registrationForm">
                      <div class="mb-3">
                        <label for="name" class="form-label">氏名 <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="name" required>
                        <div class="invalid-feedback">氏名を入力してください</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="email" class="form-label">メールアドレス <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" id="email" required>
                        <div class="invalid-feedback">有効なメールアドレスを入力してください</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="password" class="form-label">パスワード <span class="text-danger">*</span></label>
                        <div class="input-group">
                          <input type="password" class="form-control" id="password" required minlength="6">
                          <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                            <i class="fas fa-eye"></i>
                          </button>
                        </div>
                        <div class="form-text">6文字以上で入力してください</div>
                        <div class="invalid-feedback">パスワードは6文字以上で入力してください</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="confirmPassword" class="form-label">パスワード（確認） <span class="text-danger">*</span></label>
                        <input type="password" class="form-control" id="confirmPassword" required>
                        <div class="invalid-feedback">パスワードが一致しません</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="department" class="form-label">部署</label>
                        <input type="text" class="form-control" id="department" placeholder="例: 工事部">
                      </div>
                      
                      <div class="mb-3">
                        <label for="phone" class="form-label">電話番号</label>
                        <input type="tel" class="form-control" id="phone" placeholder="090-1234-5678">
                      </div>
                      
                      <div class="mb-4">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="agreeTerms" required>
                          <label class="form-check-label" for="agreeTerms">
                            利用規約とプライバシーポリシーに同意します <span class="text-danger">*</span>
                          </label>
                          <div class="invalid-feedback">利用規約に同意してください</div>
                        </div>
                      </div>
                      
                      <button type="submit" class="btn btn-primary w-100" id="registerBtn">
                        <i class="fas fa-user-plus me-2"></i>登録する
                      </button>
                    </form>
                    
                    <div class="text-center mt-3">
                      <small class="text-muted">
                        すでにアカウントをお持ちですか？
                        <a href="#/login" class="text-decoration-none" data-link>ログイン</a>
                      </small>
                    </div>
                  </div>
                  
                  <!-- エラー表示エリア -->
                  <div id="error-state" class="d-none text-center">
                    <div class="mb-4">
                      <i class="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
                      <h2 class="text-danger mb-3">エラー</h2>
                      <p class="text-muted mb-4" id="error-message">招待トークンが見つかりません</p>
                    </div>
                    <a href="#/login" class="btn btn-primary" data-link>
                      <i class="fas fa-arrow-left me-2"></i>ログインページへ戻る
                    </a>
                  </div>
                  
                  <!-- 成功表示エリア -->
                  <div id="success-state" class="d-none text-center">
                    <div class="mb-4">
                      <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                      <h2 class="text-success mb-3">登録完了</h2>
                      <p class="text-muted mb-4">アカウントの登録が完了しました。ログインしてご利用ください。</p>
                    </div>
                    <a href="#/login" class="btn btn-success" data-link>
                      <i class="fas fa-sign-in-alt me-2"></i>ログインページへ
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 招待情報詳細 -->
            <div id="invitation-details" class="card mt-3 d-none">
              <div class="card-body">
                <h6 class="card-title">
                  <i class="fas fa-info-circle me-2"></i>招待情報
                </h6>
                <dl class="row mb-0">
                  <dt class="col-sm-4">会社名:</dt>
                  <dd class="col-sm-8" id="invitation-company"></dd>
                  <dt class="col-sm-4">招待者:</dt>
                  <dd class="col-sm-8" id="invitation-inviter"></dd>
                  <dt class="col-sm-4">役割:</dt>
                  <dd class="col-sm-8" id="invitation-role"></dd>
                  <dt class="col-sm-4">有効期限:</dt>
                  <dd class="col-sm-8" id="invitation-expires"></dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init(params) {
    console.log('Register: Initializing...', params);
    
    // URLパラメータから招待コードを取得
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const invitationCode = urlParams.get('code');
    
    console.log('Register: Invitation code from URL:', invitationCode);
    
    if (invitationCode) {
      try {
        console.log('Register: Validating invitation code...');
        this.invitation = await this.app.api.validateInvitationCode(invitationCode);
        console.log('Register: Invitation validated:', this.invitation);
        
        // 招待情報を表示
        this.displayInvitationInfo();
        
      } catch (error) {
        console.error('Register: Invalid invitation code:', error);
        this.showError('招待トークンが見つかりません。招待URLが正しいか確認してください。');
        return;
      }
    } else {
      console.log('Register: No invitation code provided');
      this.showError('招待コードが必要です。招待URLからアクセスしてください。');
      return;
    }
    
    this.setupEventListeners();
    this.hideLoading();
  }

  displayInvitationInfo() {
    // ローディングを隠す
    document.getElementById('loading-state').classList.add('d-none');
    
    // 招待情報を表示
    const invitationInfo = document.getElementById('invitation-info');
    const registerForm = document.getElementById('register-form');
    const invitationDetails = document.getElementById('invitation-details');
    
    invitationInfo.classList.remove('d-none');
    registerForm.classList.remove('d-none');
    invitationDetails.classList.remove('d-none');
    
    // 招待情報を設定
    document.getElementById('company-name').textContent = this.invitation.companyName || '組織';
    document.getElementById('invitation-company').textContent = this.invitation.companyName || '-';
    document.getElementById('invitation-inviter').textContent = this.invitation.inviterName || '-';
    document.getElementById('invitation-role').textContent = this.getRoleLabel(this.invitation.role);
    document.getElementById('invitation-expires').textContent = this.formatDate(this.invitation.expiresAt);
    
    // メールアドレスを事前入力（招待メールアドレスがある場合）
    if (this.invitation.email) {
      document.getElementById('email').value = this.invitation.email;
    }
  }

  showError(message) {
    // 他の要素を隠す
    document.getElementById('loading-state').classList.add('d-none');
    document.getElementById('invitation-info').classList.add('d-none');
    document.getElementById('register-form').classList.add('d-none');
    document.getElementById('invitation-details').classList.add('d-none');
    document.getElementById('success-state').classList.add('d-none');
    
    // エラー表示
    const errorState = document.getElementById('error-state');
    document.getElementById('error-message').textContent = message;
    errorState.classList.remove('d-none');
  }

  showSuccess() {
    // 他の要素を隠す
    document.getElementById('loading-state').classList.add('d-none');
    document.getElementById('invitation-info').classList.add('d-none');
    document.getElementById('register-form').classList.add('d-none');
    document.getElementById('invitation-details').classList.add('d-none');
    document.getElementById('error-state').classList.add('d-none');
    
    // 成功表示
    document.getElementById('success-state').classList.remove('d-none');
  }

  hideLoading() {
    document.getElementById('loading-state').classList.add('d-none');
  }

  setupEventListeners() {
    // フォーム送信
    const form = document.getElementById('registrationForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // パスワード表示/非表示
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
      togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
    }

    // パスワード確認バリデーション
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    if (password && confirmPassword) {
      confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
      password.addEventListener('input', () => this.validatePasswordMatch());
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isLoading) return;

    const form = event.target;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // パスワード一致チェック
    if (!this.validatePasswordMatch()) {
      return;
    }

    try {
      this.isLoading = true;
      this.app.showLoading('アカウントを作成中...');

      // フォームデータを取得
      const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        department: document.getElementById('department').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        // 招待情報から取得
        tenantId: this.invitation.tenantId,
        companyName: this.invitation.companyName,
        role: this.invitation.role || 'worker'
      };

      console.log('Register: Submitting registration...', { ...formData, password: '[HIDDEN]' });

      // アカウント作成
      const userCredential = await this.app.auth.registerWithEmail(formData.email, formData.password);
      console.log('Register: User account created:', userCredential.user.uid);

      // プロフィール作成
      const profileData = {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        phone: formData.phone,
        tenantId: formData.tenantId,
        companyName: formData.companyName,
        role: formData.role,
        status: 'active'
      };

      await this.app.api.createUserProfile(profileData);
      console.log('Register: User profile created');

      // 招待を使用済みにマーク
      await this.app.api.markInvitationAsUsed(this.invitation.id, userCredential.user.uid);
      console.log('Register: Invitation marked as used');

      // 成功画面を表示
      this.showSuccess();
      this.app.showSuccess('アカウントが作成されました。ログインしてご利用ください。');

    } catch (error) {
      console.error('Register: Registration failed:', error);
      this.handleRegistrationError(error);
    } finally {
      this.isLoading = false;
      this.app.hideLoading();
    }
  }

  handleRegistrationError(error) {
    let message = 'アカウントの作成に失敗しました。';
    
    if (error.code === 'auth/email-already-in-use') {
      message = 'このメールアドレスは既に使用されています。';
    } else if (error.code === 'auth/weak-password') {
      message = 'パスワードが弱すぎます。より強力なパスワードを選択してください。';
    } else if (error.code === 'auth/invalid-email') {
      message = 'メールアドレスの形式が正しくありません。';
    } else if (error.message) {
      message = error.message;
    }
    
    this.app.showError(message);
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('#togglePassword i');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }
  }

  validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword');
    const confirmPasswordValue = confirmPassword.value;
    
    if (password !== confirmPasswordValue) {
      confirmPassword.setCustomValidity('パスワードが一致しません');
      confirmPassword.classList.add('is-invalid');
      return false;
    } else {
      confirmPassword.setCustomValidity('');
      confirmPassword.classList.remove('is-invalid');
      return true;
    }
  }

  getRoleLabel(role) {
    const labels = {
      admin: '管理者',
      evaluator: '評価者',
      worker: '一般ユーザー',
      developer: '開発者'
    };
    return labels[role] || role;
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  cleanup() {
    // イベントリスナーのクリーンアップ
    const form = document.getElementById('registrationForm');
    if (form) {
      form.removeEventListener('submit', this.handleSubmit);
    }

    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
      togglePassword.removeEventListener('click', this.togglePasswordVisibility);
    }

    console.log('Register: Cleanup completed');
  }
}
