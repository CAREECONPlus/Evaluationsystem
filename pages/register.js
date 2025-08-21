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

  async handleRegistration(event) {
    event.preventDefault();
    const form = event.target;
    
    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      this.app.showError('パスワードが一致しません');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    const userData = {
      email: this.invitation.email, // 招待情報から取得
      password: password,
      name: document.getElementById('name').value.trim()
    };

    try {
      console.log("Register: Starting registration process...");
      
      // Step 1: Firebase Authにユーザーを作成
      const userCredential = await this.app.auth.registerWithEmail(userData.email, userData.password);
      console.log("Register: Firebase Auth user created:", userCredential.user.uid);

      // Step 2: ユーザープロファイルを作成（undefinedフィールドを除外）
      const profileData = {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        role: this.invitation.role,
        tenantId: this.invitation.tenantId,
        status: 'active',
        createdAt: new Date().toISOString(),
        invitationId: this.invitation.id
      };

      // undefinedフィールドを除外する関数
      const cleanData = (obj) => {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };

      // 招待タイプに応じた追加フィールド（undefinedチェック付き）
      if (this.invitation.role === 'evaluator' && this.invitation.evaluatorId) {
        profileData.evaluatorId = this.invitation.evaluatorId;
      }
      
      if (this.invitation.targetJobTypeId) {
        profileData.targetJobTypeId = this.invitation.targetJobTypeId;
      }

      // 評価対象者の場合
      if (this.invitation.role === 'worker') {
        if (this.invitation.evaluatorId) {
          profileData.evaluatorId = this.invitation.evaluatorId;
        }
        if (this.invitation.targetUserId) {
          profileData.targetUserId = this.invitation.targetUserId;
        }
      }

      // undefinedフィールドをクリーンアップ
      const cleanedProfileData = cleanData(profileData);
      console.log("Register: Creating profile with data:", cleanedProfileData);

      await this.app.api.createUserProfile(cleanedProfileData);
      console.log("Register: User profile created successfully");

      // Step 3: 招待を使用済みにマーク
      await this.app.api.markInvitationAsUsed(this.invitation.id, userCredential.user.uid);
      console.log("Register: Invitation marked as used");

      // Step 4: 成功画面を表示
      this.showSuccessScreen(userData.name, this.invitation.role);

    } catch (err) {
      console.error("Register: Registration error:", err);
      
      let errorMessage = "登録処理中にエラーが発生しました。";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "このメールアドレスは既に使用されています。既存アカウントでログインするか、パスワードリセットをお試しください。";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "パスワードは6文字以上で設定してください。";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "有効なメールアドレスを入力してください。";
      } else if (err.message && err.message.includes('invitation')) {
        errorMessage = "招待情報が無効または期限切れです。";
      } else if (err.message && err.message.includes('undefined')) {
        errorMessage = "データ構造に問題があります。管理者にお問い合わせください。";
      } else if (err.code === 'permission-denied') {
        errorMessage = "アクセス権限がありません。管理者にお問い合わせください。";
      }
      
      this.app.showError(errorMessage);
      spinner.classList.add('d-none');
      submitButton.disabled = false;
    }
  }

  showSuccessScreen(name, role) {
    const container = document.getElementById('register-page-container');
    container.innerHTML = `
      <div class="card shadow-sm" style="max-width: 500px;">
        <div class="card-body text-center p-5">
          <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
          <h4 class="mb-3">登録完了</h4>
          <p class="text-muted mb-3">
            ${this.app.sanitizeHtml(name)}さん、登録が完了しました。<br>
            役割: <strong data-i18n="roles.${role}"></strong>
          </p>
          <div class="d-grid">
            <a href="#/login" class="btn btn-primary btn-lg" data-link>
              <i class="fas fa-sign-in-alt me-2"></i>ログインする
            </a>
          </div>
        </div>
      </div>
    `;
    
    this.app.i18n.updateUI(container);
  }

  cleanup() {
    // ページのクリーンアップ処理
    this.invitation = null;
    this.token = null;
  }
}
