/**
 * Register Admin Page Component (Multitenant Version)
 * 管理者登録ページコンポーネント（マルチテナント対応版）
 */
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

export class RegisterAdminPage {
  constructor(app) {
    this.app = app;
  }

  async render() {
    return `
      <div class="d-flex align-items-center justify-content-center py-5 bg-light vh-100">
        <div id="register-admin-container" class="card p-4 shadow-sm" style="width: 100%; max-width: 600px;">
            <h3 class="text-center mb-4" data-i18n="auth.register_admin">管理者アカウント登録</h3>
            <div class="alert alert-info mb-4">
              <h6 class="alert-heading">新規テナント登録</h6>
              <small>このフォームから新しい企業（テナント）の管理者として登録申請ができます。承認後、従業員の管理や評価システムの利用が可能になります。</small>
            </div>
            <form id="registerAdminForm" novalidate>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="companyName" class="form-label" data-i18n="auth.company">企業名</label>
                        <input type="text" id="companyName" class="form-control" required>
                        <div class="invalid-feedback">企業名を入力してください</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="name" class="form-label" data-i18n="auth.name">氏名</label>
                        <input type="text" id="name" class="form-control" required>
                        <div class="invalid-feedback">氏名を入力してください</div>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label" data-i18n="auth.email">メールアドレス</label>
                    <input type="email" id="email" class="form-control" required>
                    <div class="invalid-feedback">有効なメールアドレスを入力してください</div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="password" class="form-label" data-i18n="auth.password">パスワード</label>
                        <input type="password" id="password" class="form-control" required minlength="6">
                        <small class="form-text text-muted">6文字以上で入力してください</small>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="confirmPassword" class="form-label" data-i18n="auth.confirm_password">パスワード確認</label>
                        <input type="password" id="confirmPassword" class="form-control" required>
                        <div id="passwordMatch" class="form-text"></div>
                    </div>
                </div>
                
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="agreeTerms" required>
                    <label class="form-check-label" for="agreeTerms">
                        <small>利用規約とプライバシーポリシーに同意します</small>
                    </label>
                    <div class="invalid-feedback">利用規約への同意が必要です</div>
                </div>
                
                <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-lg">
                        <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                        <span data-i18n="auth.register">テナント登録申請</span>
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
    
    // フォームバリデーション
    form.addEventListener('input', (e) => {
      if (e.target.checkValidity()) {
        e.target.classList.remove('is-invalid');
        e.target.classList.add('is-valid');
      } else {
        e.target.classList.remove('is-valid');
        e.target.classList.add('is-invalid');
      }
    });
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
        matchDiv.textContent = "パスワードが一致しました";
        matchDiv.className = 'form-text text-success';
        document.getElementById("confirmPassword").classList.remove('is-invalid');
        document.getElementById("confirmPassword").classList.add('is-valid');
    } else {
        matchDiv.textContent = "パスワードが一致しません";
        matchDiv.className = 'form-text text-danger';
        document.getElementById("confirmPassword").classList.remove('is-valid');
        document.getElementById("confirmPassword").classList.add('is-invalid');
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // フォームバリデーション
    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add('was-validated');
      return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');

    if (document.getElementById('password').value !== document.getElementById('confirmPassword').value) {
        this.app.showError('パスワードが一致しません');
        return;
    }
    
    if (!document.getElementById('agreeTerms').checked) {
        this.app.showError('利用規約に同意してください');
        return;
    }

    spinner.classList.remove('d-none');
    submitButton.disabled = true;

    const userData = {
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value,
        name: document.getElementById('name').value.trim(),
        companyName: document.getElementById('companyName').value.trim(),
    };
    
    let userCredential = null;
    let adminRequestId = null;
    const registrationResults = {
        authUser: false,
        adminRequest: false,
        globalUser: false,
        legacyUser: false
    };

    try {
        console.log("RegisterAdmin: Starting registration process...");
        
        // Step 1: Firebase Authにユーザーを作成（最重要）
        userCredential = await this.app.auth.registerWithEmail(userData.email, userData.password);
        registrationResults.authUser = true;
        console.log("RegisterAdmin: ✅ Firebase Auth user created:", userCredential.user.uid);
        
        const db = getFirestore(this.app.auth.firebaseApp);
        
        // Step 2: admin_requestsに申請を作成（最優先 - 認証不要で作成可能）
        try {
            const requestRef = doc(collection(db, "admin_requests"));
            await setDoc(requestRef, {
                requestId: requestRef.id,
                uid: userCredential.user.uid,
                email: userData.email,
                name: userData.name,
                companyName: userData.companyName,
                status: 'pending',
                requestType: 'new_tenant',
                plan: 'trial',
                createdAt: serverTimestamp(),
                metadata: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    timestamp: new Date().toISOString(),
                    ip: 'client-side'
                }
            });
            adminRequestId = requestRef.id;
            registrationResults.adminRequest = true;
            console.log("RegisterAdmin: ✅ Admin request created:", adminRequestId);
        } catch (adminError) {
            console.error("RegisterAdmin: ❌ Admin request failed:", adminError);
            // admin_requestsの作成失敗は致命的
            throw new Error("申請の作成に失敗しました。管理者にお問い合わせください。");
        }
        
        // Step 3: global_usersに作成（オプション）
        try {
            await setDoc(doc(db, "global_users", userData.email), {
                uid: userCredential.user.uid,
                email: userData.email,
                name: userData.name,
                companyName: userData.companyName,
                role: 'admin',
                status: 'pending_approval',
                tenantId: null,
                plan: 'trial',
                createdAt: serverTimestamp(),
                registrationRequestId: adminRequestId
            });
            registrationResults.globalUser = true;
            console.log("RegisterAdmin: ✅ Global user created");
        } catch (globalError) {
            console.warn("RegisterAdmin: ⚠️ Global user creation failed (non-critical):", globalError);
        }
        
        // Step 4: usersコレクション（レガシー）への保存（オプション）
        try {
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: userData.email,
                name: userData.name,
                companyName: userData.companyName,
                role: 'admin',
                status: 'developer_approval_pending',
                tenantId: null,
                createdAt: serverTimestamp(),
                registrationRequestId: adminRequestId
            });
            registrationResults.legacyUser = true;
            console.log("RegisterAdmin: ✅ Legacy user created");
        } catch (userError) {
            console.warn("RegisterAdmin: ⚠️ Legacy user creation failed (non-critical):", userError);
        }
        
        // 登録結果をログ出力
        console.log("RegisterAdmin: Registration summary:", registrationResults);
        
        // 成功画面表示（最低限admin_requestが成功していれば成功とみなす）
        if (registrationResults.authUser && registrationResults.adminRequest) {
            this.showSuccessScreen(adminRequestId, userData, registrationResults);
        } else {
            throw new Error("必要な登録処理が完了しませんでした。");
        }

    } catch (err) {
        console.error("RegisterAdmin: Registration error:", err);
        
        // 重要：Firebase Authユーザーは削除しない！
        // 理由：admin_requestが成功していれば、後で承認時に紐付けできるため
        
        // ただし、Firebase Auth作成も失敗している場合は、何もできない
        if (!registrationResults.authUser) {
            console.log("RegisterAdmin: Firebase Auth creation failed, no cleanup needed");
        } else {
            console.log("RegisterAdmin: Firebase Auth user preserved for future approval process");
        }
        
        // エラーメッセージの表示
        const errorMessage = this.getErrorMessage(err);
        this.app.showError(errorMessage);
        
        // UI復旧
        spinner.classList.add('d-none');
        submitButton.disabled = false;
    }
  }

  showSuccessScreen(requestId, userData, results) {
    let statusDetails = "";
    if (results.legacyUser && results.globalUser) {
        statusDetails = "<small class='text-success'>✅ 全てのデータベースに正常に登録されました</small>";
    } else {
        statusDetails = "<small class='text-warning'>⚠️ 一部のデータベース登録に失敗しましたが、申請は受理されました</small>";
    }

    const container = document.getElementById('register-admin-container');
    container.innerHTML = `
        <div class="text-center">
            <i class="fas fa-check-circle fa-5x text-success mb-4"></i>
            <h3 class="mb-3">テナント登録申請完了</h3>
            <div class="alert alert-success">
                <h5 class="alert-heading">申請を受け付けました</h5>
                <hr>
                <p class="mb-2"><strong>申請番号:</strong> ${requestId.slice(0, 8).toUpperCase()}</p>
                <p class="mb-2"><strong>企業名:</strong> ${this.app.sanitizeHtml(userData.companyName)}</p>
                <p class="mb-1"><strong>管理者:</strong> ${this.app.sanitizeHtml(userData.name)}</p>
                ${statusDetails}
            </div>
            <div class="card bg-light mt-4">
                <div class="card-body">
                    <h6 class="card-title">次のステップ</h6>
                    <ol class="text-start mb-0">
                        <li>システム管理者が申請内容を確認します（通常1-2営業日）</li>
                        <li>承認後、登録メールアドレスに通知が送信されます</li>
                        <li>通知メール内のリンクからログインしてください</li>
                        <li>初回ログイン時に初期設定を行います</li>
                    </ol>
                </div>
            </div>
            <div class="alert alert-info mt-3">
                <small><strong>重要:</strong> アカウントが作成されています。承認完了後、このメールアドレスとパスワードでログインできます。</small>
            </div>
            <div class="mt-4">
                <a href="#/login" class="btn btn-primary btn-lg" data-link>
                    <i class="fas fa-arrow-left me-2"></i>ログインページに戻る
                </a>
            </div>
        </div>
    `;
  }

  getErrorMessage(err) {
    // Firebase Auth エラー
    if (err.code === 'auth/email-already-in-use') {
      return "このメールアドレスは既に使用されています。既存アカウントでログインするか、パスワードリセットをお試しください。";
    } else if (err.code === 'auth/weak-password') {
      return "パスワードは6文字以上で設定してください。";
    } else if (err.code === 'auth/invalid-email') {
      return "有効なメールアドレスを入力してください。";
    } else if (err.code === 'auth/network-request-failed') {
      return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
    }
    
    // Firestore エラー
    if (err.code === 'permission-denied') {
      return "一部のデータベース操作で権限エラーが発生しましたが、アカウント作成と申請は完了しています。";
    } else if (err.code === 'unavailable') {
      return "サービスが一時的に利用できません。しばらく待ってから再試行してください。";
    } else if (err.code === 'deadline-exceeded') {
      return "処理がタイムアウトしました。再試行してください。";
    }
    
    // カスタムエラー
    if (err.message) {
      return err.message;
    }
    
    // 一般的なエラー
    return "登録処理中にエラーが発生しました。しばらく待ってから再試行してください。";
  }
}
