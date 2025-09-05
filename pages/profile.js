/**
 * Profile Page Component
 * プロフィール管理ページコンポーネント
 */
export class ProfilePage {
  constructor(app) {
    this.app = app;
    this.currentUser = null;
    this.userProfile = null;
    this.jobTypes = [];
    this.isEditing = false;
    this.originalData = null;
  }

  async render() {
    return `
      <div class="profile-page p-md-4 p-3">
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="page-title h2 mb-1" data-i18n="nav.profile">プロフィール</h1>
              <p class="page-subtitle text-muted mb-0" data-i18n="profile.subtitle">個人情報とアカウント設定の管理</p>
            </div>
            <div>
              <button type="button" class="btn btn-primary" id="edit-profile-btn">
                <i class="fas fa-edit me-2"></i><span data-i18n="common.edit">編集</span>
              </button>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                
                <!-- プロフィール画像セクション -->
                <div class="text-center mb-4 pb-4 border-bottom">
                  <div class="position-relative d-inline-block">
                    <div class="profile-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                         style="width: 120px; height: 120px; font-size: 48px;" id="profile-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary position-absolute bottom-0 end-0 rounded-circle" 
                            id="change-avatar-btn" style="display: none;">
                      <i class="fas fa-camera"></i>
                    </button>
                  </div>
                  <h3 class="mt-3 mb-1" id="profile-display-name">読み込み中...</h3>
                  <p class="text-muted mb-0" id="profile-role-display">--</p>
                </div>

                <!-- 基本情報フォーム -->
                <form id="profile-form" class="needs-validation" novalidate>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label required" data-i18n="common.last_name">姓</label>
                      <input type="text" class="form-control" id="lastName" required readonly>
                      <div class="invalid-feedback" data-i18n="validation.last_name_required">姓を入力してください</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label required" data-i18n="common.first_name">名</label>
                      <input type="text" class="form-control" id="firstName" required readonly>
                      <div class="invalid-feedback" data-i18n="validation.first_name_required">名を入力してください</div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label required" data-i18n="common.email">メールアドレス</label>
                      <input type="email" class="form-control" id="email" required readonly>
                      <div class="invalid-feedback" data-i18n="validation.email_invalid">正しいメールアドレスを入力してください</div>
                      <small class="form-text text-muted" data-i18n="profile.email_change_note">メールアドレスの変更は管理者にお問い合わせください</small>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="phoneNumber" class="form-label" data-i18n="common.phone_number">電話番号</label>
                      <input type="tel" class="form-control" id="phoneNumber" readonly>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="department" class="form-label" data-i18n="common.department">部署</label>
                      <input type="text" class="form-control" id="department" readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="position" class="form-label" data-i18n="common.position">役職</label>
                      <input type="text" class="form-control" id="position" readonly>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="jobTypes" class="form-label" data-i18n="common.job_types">職種</label>
                    <div id="jobTypes" class="form-control-plaintext">
                      <div id="job-types-badges">読み込み中...</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="bio" class="form-label" data-i18n="profile.bio">自己紹介</label>
                    <textarea class="form-control" id="bio" rows="4" readonly 
                              data-i18n-placeholder="profile.bio_placeholder"></textarea>
                  </div>

                  <!-- 編集モード時のボタン -->
                  <div class="form-actions mt-4" id="form-actions" style="display: none;">
                    <div class="d-flex gap-2 justify-content-end">
                      <button type="button" class="btn btn-outline-secondary" id="cancel-edit-btn">
                        <i class="fas fa-times me-2"></i><span data-i18n="common.cancel">キャンセル</span>
                      </button>
                      <button type="submit" class="btn btn-primary" id="save-profile-btn">
                        <i class="fas fa-save me-2"></i><span data-i18n="common.save">保存</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- パスワード変更セクション -->
            <div class="card shadow-sm mt-4">
              <div class="card-header bg-light">
                <h5 class="mb-0 card-title-icon">
                  <i class="fas fa-lock me-2 text-primary"></i>
                  <span data-i18n="profile.password_change">パスワード変更</span>
                </h5>
              </div>
              <div class="card-body">
                <form id="password-form" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label for="currentPassword" class="form-label required" data-i18n="profile.current_password">現在のパスワード</label>
                    <input type="password" class="form-control" id="currentPassword" required>
                    <div class="invalid-feedback" data-i18n="validation.current_password_required">現在のパスワードを入力してください</div>
                  </div>
                  <div class="mb-3">
                    <label for="newPassword" class="form-label required" data-i18n="profile.new_password">新しいパスワード</label>
                    <input type="password" class="form-control" id="newPassword" required minlength="8">
                    <div class="invalid-feedback" data-i18n="validation.password_length">パスワードは8文字以上で入力してください</div>
                    <small class="form-text text-muted" data-i18n="profile.password_requirements">8文字以上、英数字記号を含む</small>
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label required" data-i18n="profile.confirm_password">パスワード確認</label>
                    <input type="password" class="form-control" id="confirmPassword" required>
                    <div class="invalid-feedback" data-i18n="validation.password_mismatch">パスワードが一致しません</div>
                  </div>
                  <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-warning">
                      <i class="fas fa-key me-2"></i><span data-i18n="profile.change_password">パスワード変更</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- アカウント情報セクション -->
            <div class="card shadow-sm mt-4">
              <div class="card-header bg-light">
                <h5 class="mb-0 card-title-icon">
                  <i class="fas fa-info-circle me-2 text-primary"></i>
                  <span data-i18n="profile.account_info">アカウント情報</span>
                </h5>
              </div>
              <div class="card-body">
                <div class="row text-sm">
                  <div class="col-md-6 mb-2">
                    <strong data-i18n="profile.user_id">ユーザーID:</strong>
                    <span id="user-id" class="text-muted">--</span>
                  </div>
                  <div class="col-md-6 mb-2">
                    <strong data-i18n="profile.registration_date">登録日:</strong>
                    <span id="registration-date" class="text-muted">--</span>
                  </div>
                  <div class="col-md-6 mb-2">
                    <strong data-i18n="profile.last_login">最終ログイン:</strong>
                    <span id="last-login" class="text-muted">--</span>
                  </div>
                  <div class="col-md-6 mb-2">
                    <strong data-i18n="profile.account_status">アカウント状態:</strong>
                    <span id="account-status" class="badge bg-success">アクティブ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    try {
      this.currentUser = this.app.currentUser;
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      await this.loadUserProfile();
      await this.loadJobTypes();
      this.bindEvents();
      this.updateUI();
      
    } catch (error) {
      console.error('Profile: Initialization failed:', error);
      this.app.showError('プロフィールの読み込みに失敗しました');
    }
  }

  async loadUserProfile() {
    try {
      this.userProfile = await this.app.api.getUserProfile(this.currentUser.uid);
    } catch (error) {
      console.error('Profile: Failed to load user profile:', error);
      throw error;
    }
  }

  async loadJobTypes() {
    try {
      this.jobTypes = await this.app.api.getJobTypes();
    } catch (error) {
      console.error('Profile: Failed to load job types:', error);
      this.jobTypes = [];
    }
  }

  updateUI() {
    try {
      if (!this.userProfile) return;

      const profile = this.userProfile;

      // 基本情報の表示
      document.getElementById('profile-display-name').textContent = 
        `${profile.lastName || ''} ${profile.firstName || ''}`.trim() || 'ユーザー名未設定';
      
      document.getElementById('profile-role-display').textContent = 
        this.app.i18n.t(`roles.${profile.role}`) || profile.role;

      // プロフィールアバターの更新
      const avatar = document.getElementById('profile-avatar');
      if (profile.firstName || profile.lastName) {
        const initials = `${profile.lastName?.charAt(0) || ''}${profile.firstName?.charAt(0) || ''}`;
        avatar.innerHTML = initials || '<i class="fas fa-user"></i>';
      }

      // フォームフィールドの更新
      this.setFormValue('lastName', profile.lastName);
      this.setFormValue('firstName', profile.firstName);
      this.setFormValue('email', profile.email);
      this.setFormValue('phoneNumber', profile.phoneNumber);
      this.setFormValue('department', profile.department);
      this.setFormValue('position', profile.position);
      this.setFormValue('bio', profile.bio);

      // 職種バッジの表示
      this.updateJobTypesBadges();

      // アカウント情報の表示
      document.getElementById('user-id').textContent = profile.id || this.currentUser.uid;
      document.getElementById('registration-date').textContent = 
        profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('ja-JP') : '--';
      document.getElementById('last-login').textContent = 
        profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString('ja-JP') : '--';

    } catch (error) {
      console.error('Profile: UI update failed:', error);
    }
  }

  updateJobTypesBadges() {
    const container = document.getElementById('job-types-badges');
    if (!container || !this.userProfile?.jobTypes) {
      container.innerHTML = '<span class="text-muted">職種が設定されていません</span>';
      return;
    }

    const badges = this.userProfile.jobTypes
      .map(jobTypeId => {
        const jobType = this.jobTypes.find(jt => jt.id === jobTypeId);
        return jobType ? 
          `<span class="badge bg-primary me-2">${this.escapeHtml(jobType.name)}</span>` : 
          '';
      })
      .filter(badge => badge)
      .join('');

    container.innerHTML = badges || '<span class="text-muted">職種が設定されていません</span>';
  }

  setFormValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value || '';
    }
  }

  bindEvents() {
    // 編集モード切り替え
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      this.toggleEditMode(true);
    });

    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
      this.toggleEditMode(false);
    });

    // プロフィール保存
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProfileSave();
    });

    // パスワード変更
    document.getElementById('password-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePasswordChange();
    });

    // パスワード確認の検証
    const confirmPassword = document.getElementById('confirmPassword');
    const newPassword = document.getElementById('newPassword');
    
    if (confirmPassword && newPassword) {
      confirmPassword.addEventListener('input', () => {
        if (confirmPassword.value !== newPassword.value) {
          confirmPassword.setCustomValidity('パスワードが一致しません');
        } else {
          confirmPassword.setCustomValidity('');
        }
      });
    }
  }

  toggleEditMode(isEdit) {
    this.isEditing = isEdit;
    
    const editBtn = document.getElementById('edit-profile-btn');
    const formActions = document.getElementById('form-actions');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    
    // 編集可能なフィールド
    const editableFields = ['lastName', 'firstName', 'phoneNumber', 'department', 'position', 'bio'];
    
    editableFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.readOnly = !isEdit;
        if (isEdit) {
          field.classList.add('form-control');
          field.classList.remove('form-control-plaintext');
        } else {
          field.classList.remove('form-control');
          field.classList.add('form-control-plaintext');
        }
      }
    });

    // ボタンの表示/非表示
    if (editBtn) editBtn.style.display = isEdit ? 'none' : 'inline-block';
    if (formActions) formActions.style.display = isEdit ? 'block' : 'none';
    if (changeAvatarBtn) changeAvatarBtn.style.display = isEdit ? 'block' : 'none';

    if (isEdit) {
      // 編集開始時に元データを保存
      this.originalData = {
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        bio: document.getElementById('bio').value
      };
    } else if (this.originalData) {
      // キャンセル時に元データを復元
      Object.keys(this.originalData).forEach(key => {
        this.setFormValue(key, this.originalData[key]);
      });
    }
  }

  async handleProfileSave() {
    try {
      const form = document.getElementById('profile-form');
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const saveBtn = document.getElementById('save-profile-btn');
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>保存中...';
      saveBtn.disabled = true;

      // フォームデータの収集
      const formData = {
        lastName: document.getElementById('lastName').value.trim(),
        firstName: document.getElementById('firstName').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        department: document.getElementById('department').value.trim(),
        position: document.getElementById('position').value.trim(),
        bio: document.getElementById('bio').value.trim()
      };

      // プロフィール更新API呼び出し
      await this.app.api.updateUserProfile(this.currentUser.uid, formData);

      // ローカルデータの更新
      this.userProfile = { ...this.userProfile, ...formData };
      
      this.app.showSuccess('プロフィールを更新しました');
      this.toggleEditMode(false);
      this.updateUI();

    } catch (error) {
      console.error('Profile: Save failed:', error);
      this.app.showError('プロフィールの保存に失敗しました');
    } finally {
      const saveBtn = document.getElementById('save-profile-btn');
      if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>保存';
        saveBtn.disabled = false;
      }
    }
  }

  async handlePasswordChange() {
    try {
      const form = document.getElementById('password-form');
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword !== confirmPassword) {
        this.app.showError('新しいパスワードが一致しません');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>変更中...';
      submitBtn.disabled = true;

      // パスワード変更API呼び出し
      await this.app.api.changePassword(currentPassword, newPassword);

      this.app.showSuccess('パスワードを変更しました');
      form.reset();
      form.classList.remove('was-validated');

    } catch (error) {
      console.error('Profile: Password change failed:', error);
      let errorMessage = 'パスワードの変更に失敗しました';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = '現在のパスワードが正しくありません';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます';
      }
      
      this.app.showError(errorMessage);
    } finally {
      const submitBtn = document.getElementById('password-form').querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-key me-2"></i>パスワード変更';
        submitBtn.disabled = false;
      }
    }
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  cleanup() {
    // イベントリスナーのクリーンアップは必要に応じて実装
    this.isEditing = false;
    this.originalData = null;
  }
}