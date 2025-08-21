/**
 * Developer Page Component (Multitenant Version)
 * 開発者ページコンポーネント（マルチテナント対応版）
 */
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

export class DeveloperPage {
  constructor(app) {
    this.app = app;
    this.pendingAdmins = [];
    this.activeTenants = [];
    this.selectedTab = 'approvals';
  }

  async render() {
    return `
      <div class="developer-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="nav.developer">開発者管理</h1>
          <div>
            <button class="btn btn-info me-2" onclick="window.app.currentPage.showSystemStats()">
              <i class="fas fa-chart-line me-2"></i>システム統計
            </button>
            <button class="btn btn-success" id="invite-admin-btn">
              <i class="fas fa-envelope me-2"></i>管理者を招待
            </button>
          </div>
        </div>
        
        <!-- 統計カード -->
        <div class="row mb-4" id="stats-container" style="display: none;">
          <div class="col-md-3 mb-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">総テナント数</h5>
                <p class="card-text display-4" id="total-tenants">0</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">総ユーザー数</h5>
                <p class="card-text display-4" id="total-users">0</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">承認待ち</h5>
                <p class="card-text display-4 text-warning" id="pending-requests">0</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">アクティブ率</h5>
                <p class="card-text display-4 text-success" id="active-rate">0%</p>
              </div>
            </div>
          </div>
        </div>
        
        <ul class="nav nav-tabs mt-4 mb-3">
          <li class="nav-item">
            <button class="nav-link active" id="approvals-tab-btn" data-i18n="developer.admin_approvals">管理者承認</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="tenants-tab-btn" data-i18n="developer.tenant_management">テナント管理</button>
          </li>
        </ul>

        <div class="tab-content">
            <div id="approvals-view">
                <div class="card">
                    <div class="card-body">
                        <div id="pending-admins-list">
                          <div class="text-center p-3">
                            <div class="spinner-border text-primary" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="tenants-view" class="d-none">
                <div class="card">
                     <div class="card-body">
                        <div id="active-tenants-list">
                          <div class="text-center p-3">
                            <div class="spinner-border text-primary" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- 管理者招待モーダル -->
      <div class="modal fade" id="inviteAdminModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">管理者アカウントの招待</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="inviteAdminForm">
                <div class="mb-3">
                  <label for="adminCompanyName" class="form-label">企業名</label>
                  <input type="text" class="form-control" id="adminCompanyName" required>
                  <div class="invalid-feedback">企業名を入力してください（2文字以上）</div>
                </div>
                <div class="mb-3">
                  <label for="adminName" class="form-label">管理者氏名</label>
                  <input type="text" class="form-control" id="adminName" required>
                  <div class="invalid-feedback">氏名を入力してください（2文字以上）</div>
                </div>
                <div class="mb-3">
                  <label for="adminEmail" class="form-label">メールアドレス</label>
                  <input type="email" class="form-control" id="adminEmail" required>
                  <div class="invalid-feedback">有効なメールアドレスを入力してください</div>
                </div>
                <div class="mb-3">
                  <label for="adminPlan" class="form-label">プラン</label>
                  <select class="form-select" id="adminPlan" required>
                    <option value="trial">トライアル（30日間）</option>
                    <option value="basic">ベーシック</option>
                    <option value="premium">プレミアム</option>
                    <option value="enterprise">エンタープライズ</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
              <button type="button" class="btn btn-primary" id="send-admin-invitation-btn">
                <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                招待リンクを作成
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 招待リンク表示モーダル -->
      <div class="modal fade" id="adminInviteLinkModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">管理者招待リンク</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>以下のリンクをコピーして、招待する管理者に送信してください。</p>
              <div class="input-group">
                <input type="text" class="form-control" id="adminInviteLinkInput" readonly>
                <button class="btn btn-outline-secondary" id="copy-admin-link-btn" type="button">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <small class="text-muted">このリンクは7日間有効です。</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    if (!this.app.hasRole('developer')) {
      this.app.navigate('#/dashboard');
      return;
    }

    this.setupEventListeners();
    this.setupModals();
    await this.loadData();
    await this.loadSystemStats();
  }

  setupModals() {
    this.inviteAdminModal = new bootstrap.Modal(document.getElementById('inviteAdminModal'));
    this.inviteLinkModal = new bootstrap.Modal(document.getElementById('adminInviteLinkModal'));
  }

  setupEventListeners() {
    // タブ切り替え
    document.getElementById('approvals-tab-btn').addEventListener('click', () => this.switchTab('approvals'));
    document.getElementById('tenants-tab-btn').addEventListener('click', () => this.switchTab('tenants'));

    // 管理者招待ボタン
    document.getElementById('invite-admin-btn').addEventListener('click', () => this.openInviteAdminModal());
    document.getElementById('send-admin-invitation-btn').addEventListener('click', () => this.sendAdminInvitation());
    document.getElementById('copy-admin-link-btn').addEventListener('click', () => this.copyAdminInviteLink());

    // フォームバリデーション
    const form = document.getElementById('inviteAdminForm');
    form.addEventListener('input', (e) => this.validateField(e.target));

    // Event delegation for dynamic buttons
    document.querySelector('.tab-content').addEventListener('click', (e) => {
        const approveBtn = e.target.closest('.approve-admin-btn');
        if (approveBtn) this.approveAdmin(approveBtn.dataset.requestId, approveBtn.dataset.userId);

        const rejectBtn = e.target.closest('.reject-admin-btn');
        if (rejectBtn) this.rejectAdmin(rejectBtn.dataset.requestId, rejectBtn.dataset.userId);

        const resetPassBtn = e.target.closest('.reset-password-btn');
        if (resetPassBtn) this.sendPasswordReset(resetPassBtn.dataset.email);

        const toggleStatusBtn = e.target.closest('.toggle-status-btn');
        if (toggleStatusBtn) this.toggleTenantStatus(toggleStatusBtn.dataset.tenantId, toggleStatusBtn.dataset.status);
        
        const viewDetailsBtn = e.target.closest('.view-tenant-details-btn');
        if (viewDetailsBtn) this.viewTenantDetails(viewDetailsBtn.dataset.tenantId);
    });
  }

  validateField(field) {
    let isValid = false;
    const value = field.value.trim();

    switch(field.id) {
      case 'adminCompanyName':
        isValid = this.app.api.validateCompanyName(value);
        break;
      case 'adminName':
        isValid = this.app.api.validateName(value);
        break;
      case 'adminEmail':
        isValid = this.app.api.validateEmail(value);
        break;
    }

    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }

    return isValid;
  }

  validateForm() {
    const form = document.getElementById('inviteAdminForm');
    const fields = form.querySelectorAll('input[required]');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async loadSystemStats() {
    try {
      const db = getFirestore(this.app.auth.firebaseApp);
      
      // テナント統計
      const tenantsQuery = query(collection(db, "tenants"));
      const tenantsSnapshot = await getDocs(tenantsQuery);
      const totalTenants = tenantsSnapshot.size;
      const activeTenants = tenantsSnapshot.docs.filter(doc => doc.data().status === 'active').length;
      
      // ユーザー統計
      const usersQuery = query(collection(db, "global_users"));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;
      
      // 承認待ち統計
      const pendingQuery = query(collection(db, "admin_requests"), where("status", "==", "pending"));
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingRequests = pendingSnapshot.size;
      
      // 統計更新
      document.getElementById('total-tenants').textContent = totalTenants;
      document.getElementById('total-users').textContent = totalUsers;
      document.getElementById('pending-requests').textContent = pendingRequests;
      document.getElementById('active-rate').textContent = 
        totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) + '%' : '0%';
        
    } catch (error) {
      console.error("Failed to load system stats:", error);
    }
  }

  showSystemStats() {
    const container = document.getElementById('stats-container');
    container.style.display = container.style.display === 'none' ? 'flex' : 'none';
  }

  openInviteAdminModal() {
    const form = document.getElementById('inviteAdminForm');
    form.reset();
    form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
    
    this.inviteAdminModal.show();
  }

  async sendAdminInvitation() {
    if (!this.validateForm()) {
      this.app.showError('入力内容を確認してください');
      return;
    }

    const btn = document.getElementById('send-admin-invitation-btn');
    const spinner = btn.querySelector('.spinner-border');
    
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      const invitationData = {
        companyName: document.getElementById('adminCompanyName').value.trim(),
        name: document.getElementById('adminName').value.trim(),
        email: document.getElementById('adminEmail').value.trim().toLowerCase(),
        plan: document.getElementById('adminPlan').value,
        role: 'admin'
      };

      const token = await this.app.api.createAdminInvitation(invitationData);
      
      this.inviteAdminModal.hide();
      
      const url = `${window.location.origin}${window.location.pathname}#/register-admin?token=${token}`;
      document.getElementById('adminInviteLinkInput').value = url;
      
      this.inviteLinkModal.show();
      
    } catch (error) {
      this.app.showError('招待の作成に失敗しました: ' + error.message);
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  }

  copyAdminInviteLink() {
    const input = document.getElementById('adminInviteLinkInput');
    navigator.clipboard.writeText(input.value).then(() => {
      this.app.showSuccess('リンクをコピーしました');
    }).catch(() => {
      input.select();
      document.execCommand('copy');
      this.app.showSuccess('リンクをコピーしました');
    });
  }

  async loadData() {
    const loadingHTML = `<div class="text-center p-3" data-i18n="common.loading"></div>`;
    document.getElementById('pending-admins-list').innerHTML = loadingHTML;
    document.getElementById('active-tenants-list').innerHTML = loadingHTML;
    this.app.i18n.updateUI();

    try {
      const db = getFirestore(this.app.auth.firebaseApp);
      
      // admin_requestsから承認待ちを取得
      const pendingQuery = query(collection(db, "admin_requests"), where("status", "==", "pending"));
      const pendingSnapshot = await getDocs(pendingQuery);
      
      // レガシーusersコレクションからも取得（後方互換性）
      const legacyQuery = query(collection(db, "users"), where("status", "==", "developer_approval_pending"));
      const legacySnapshot = await getDocs(legacyQuery);
      
      // データを統合
      const adminRequests = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        requestId: doc.id,
        ...doc.data()
      }));
      
      const legacyPending = legacySnapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        requestId: null,
        ...doc.data()
      }));
      
      // 重複を除去
      this.pendingAdmins = [...adminRequests];
      legacyPending.forEach(user => {
        if (!this.pendingAdmins.find(req => req.uid === user.uid)) {
          this.pendingAdmins.push(user);
        }
      });
      
      // アクティブテナントを取得
      const tenantsQuery = query(collection(db, "tenants"), where("status", "==", "active"));
      const tenantsSnapshot = await getDocs(tenantsQuery);
      
      // 各テナントの管理者情報を取得
      this.activeTenants = await Promise.all(
        tenantsSnapshot.docs.map(async (tenantDoc) => {
          const tenant = { id: tenantDoc.id, ...tenantDoc.data() };
          
          // 管理者情報を取得
          try {
            const adminQuery = query(
              collection(db, "global_users"),
              where("tenantId", "==", tenant.id),
              where("role", "==", "admin")
            );
            const adminSnapshot = await getDocs(adminQuery);
            
            if (!adminSnapshot.empty) {
              const admin = adminSnapshot.docs[0].data();
              tenant.adminName = admin.name;
              tenant.adminEmail = admin.email;
            }
          } catch (e) {
            console.log("Failed to get admin info for tenant:", tenant.id);
          }
          
          return tenant;
        })
      );
      
      this.renderLists();
    } catch (e) {
      console.error("Failed to load developer data:", e);
      this.app.showError(this.app.i18n.t('errors.loading_failed'));
    }
  }

  renderLists() {
    this.renderPendingList();
    this.renderTenantList();
    this.app.i18n.updateUI();
  }

  renderPendingList() {
    const container = document.getElementById('pending-admins-list');
    if (this.pendingAdmins.length === 0) {
      container.innerHTML = `
        <div class="text-center p-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">承認待ちの管理者はいません</p>
        </div>
      `;
      return;
    }
    container.innerHTML = this.createTable(this.pendingAdmins, true);
  }

  renderTenantList() {
    const container = document.getElementById('active-tenants-list');
     if (this.activeTenants.length === 0) {
      container.innerHTML = `
        <div class="text-center p-5">
          <i class="fas fa-building fa-3x text-muted mb-3"></i>
          <p class="text-muted">アクティブなテナントはありません</p>
        </div>
      `;
      return;
    }
    container.innerHTML = this.createTable(this.activeTenants, false);
  }

  createTable(data, isPending) {
    const headers = isPending 
        ? ['企業名', '氏名', 'メールアドレス', '申請日時', 'アクション']
        : ['企業名', '管理者', 'メールアドレス', 'プラン', 'ステータス', 'アクション'];

    return `
      <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(item => isPending ? this.renderPendingRow(item) : this.renderTenantRow(item)).join('')}
          </tbody>
        </table>
      </div>`;
  }

  renderPendingRow(admin) {
    const requestDate = admin.createdAt ? 
      (admin.createdAt.toDate ? admin.createdAt.toDate() : new Date(admin.createdAt)) : 
      new Date();
      
    return `
      <tr>
        <td>
          <strong>${this.app.sanitizeHtml(admin.companyName)}</strong>
          ${admin.requestType === 'new_tenant' ? '<span class="badge bg-info ms-2">新規</span>' : ''}
        </td>
        <td>${this.app.sanitizeHtml(admin.name)}</td>
        <td>${this.app.sanitizeHtml(admin.email)}</td>
        <td>${this.app.formatDate(requestDate, true)}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-success approve-admin-btn" 
                    data-request-id="${admin.requestId || admin.id}" 
                    data-user-id="${admin.uid}">
              <i class="fas fa-check me-1"></i>承認
            </button>
            <button class="btn btn-danger ms-1 reject-admin-btn" 
                    data-request-id="${admin.requestId || admin.id}"
                    data-user-id="${admin.uid}">
              <i class="fas fa-times me-1"></i>却下
            </button>
          </div>
        </td>
      </tr>`;
  }

  renderTenantRow(tenant) {
    const isActive = tenant.status === 'active';
    const planBadgeClass = {
      'trial': 'bg-secondary',
      'basic': 'bg-info',
      'premium': 'bg-primary',
      'enterprise': 'bg-success'
    };
    
    return `
        <tr>
            <td><strong>${this.app.sanitizeHtml(tenant.companyName)}</strong></td>
            <td>${this.app.sanitizeHtml(tenant.adminName || '未設定')}</td>
            <td>${this.app.sanitizeHtml(tenant.adminEmail || '未設定')}</td>
            <td><span class="badge ${planBadgeClass[tenant.plan] || 'bg-secondary'}">${tenant.plan || 'trial'}</span></td>
            <td><span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">${isActive ? 'アクティブ' : '停止中'}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info view-tenant-details-btn" 
                            data-tenant-id="${tenant.id}" 
                            title="詳細">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-secondary reset-password-btn" 
                            data-email="${tenant.adminEmail}" 
                            title="パスワードリセット">
                      <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-outline-danger toggle-status-btn" 
                            data-tenant-id="${tenant.id}" 
                            data-status="${tenant.status}" 
                            title="${isActive ? '利用停止' : '利用再開'}">
                        <i class="fas ${isActive ? 'fa-power-off' : 'fa-toggle-on'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
  }

  switchTab(tab) {
    this.selectedTab = tab;
    document.getElementById('approvals-view').classList.toggle('d-none', tab !== 'approvals');
    document.getElementById('tenants-view').classList.toggle('d-none', tab !== 'tenants');
    document.getElementById('approvals-tab-btn').classList.toggle('active', tab === 'approvals');
    document.getElementById('tenants-tab-btn').classList.toggle('active', tab === 'tenants');
  }

  async approveAdmin(requestId, userId) {
    if (!confirm('この管理者申請を承認し、新しいテナントを作成しますか？')) return;

    try {
      const db = getFirestore(this.app.auth.firebaseApp);
      
      // 申請情報を取得
      let requestData = null;
      let requestRef = null;
      
      if (requestId && requestId !== 'null') {
        // admin_requestsから取得
        requestRef = doc(db, "admin_requests", requestId);
        const requestDoc = await getDoc(requestRef);
        if (requestDoc.exists()) {
          requestData = requestDoc.data();
        }
      }
      
      // レガシーusersから取得（フォールバック）
      if (!requestData && userId) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          requestData = userDoc.data();
          requestData.uid = userId;
        }
      }
      
      if (!requestData) {
        throw new Error("申請情報が見つかりません");
      }
      
      console.log("Approving admin request:", requestData);
      
      // 新しいテナントIDを生成
      const tenantId = doc(collection(db, "tenants")).id;
      
      const batch = writeBatch(db);
      
      // 1. テナントを作成
      batch.set(doc(db, "tenants", tenantId), {
        tenantId: tenantId,
        adminId: requestData.uid,
        companyName: requestData.companyName,
        status: "active",
        plan: requestData.plan || "trial",
        maxUsers: requestData.plan === 'enterprise' ? 1000 : 
                 requestData.plan === 'premium' ? 100 : 
                 requestData.plan === 'basic' ? 20 : 10,
        createdAt: serverTimestamp(),
        metadata: {
          approvedBy: this.app.currentUser.uid,
          approvedAt: serverTimestamp()
        }
      });
      
      // 2. global_usersを更新または作成
      batch.set(doc(db, "global_users", requestData.email), {
        uid: requestData.uid,
        email: requestData.email,
        name: requestData.name,
        companyName: requestData.companyName,
        role: "admin",
        status: "active",
        tenantId: tenantId,
        plan: requestData.plan || "trial",
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // 3. レガシーusersコレクションも更新
      batch.set(doc(db, "users", requestData.uid), {
        uid: requestData.uid,
        email: requestData.email,
        name: requestData.name,
        companyName: requestData.companyName,
        role: "admin",
        status: "active",
        tenantId: tenantId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // 4. admin_requestsのステータスを更新
      if (requestRef) {
        batch.update(requestRef, {
          status: "approved",
          approvedBy: this.app.currentUser.uid,
          approvedAt: serverTimestamp(),
          tenantId: tenantId
        });
      }
      
      // 5. デフォルトの職種を作成
      const defaultJobTypes = ["営業", "作業員", "管理職", "技術職"];
      defaultJobTypes.forEach(jobType => {
        const ref = doc(collection(db, "targetJobTypes"));
        batch.set(ref, {
          name: jobType,
          tenantId: tenantId,
          createdAt: serverTimestamp()
        });
      });
      
      // 6. デフォルトの評価期間を作成
      const currentYear = new Date().getFullYear();
      const periods = [
        {
          name: `${currentYear}年 上半期`,
          startDate: `${currentYear}-04-01`,
          endDate: `${currentYear}-09-30`
        },
        {
          name: `${currentYear}年 下半期`,
          startDate: `${currentYear}-10-01`,
          endDate: `${currentYear + 1}-03-31`
        }
      ];
      
      periods.forEach(period => {
        const ref = doc(collection(db, "evaluationPeriods"));
        batch.set(ref, {
          ...period,
          tenantId: tenantId,
          createdAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      
      this.app.showSuccess(`テナント「${requestData.companyName}」を作成しました`);
      await this.loadData();
      await this.loadSystemStats();
      
    } catch (error) {
      console.error("Error approving admin:", error);
      this.app.showError('承認処理に失敗しました: ' + error.message);
    }
  }

  async rejectAdmin(requestId, userId) {
    const reason = prompt('却下理由を入力してください（任意）');
    if (reason === null) return;

    try {
      const db = getFirestore(this.app.auth.firebaseApp);
      const batch = writeBatch(db);
      
      // admin_requestsを更新
      if (requestId && requestId !== 'null') {
        batch.update(doc(db, "admin_requests", requestId), {
          status: "rejected",
          rejectedBy: this.app.currentUser.uid,
          rejectedAt: serverTimestamp(),
          rejectionReason: reason || "未承認"
        });
      }
      
      // usersコレクションも更新
      if (userId) {
        batch.update(doc(db, "users", userId), {
          status: "rejected",
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      
      this.app.showSuccess('申請を却下しました');
      await this.loadData();
      
    } catch (error) {
      console.error("Error rejecting admin:", error);
      this.app.showError('却下処理に失敗しました: ' + error.message);
    }
  }

  async sendPasswordReset(email) {
      if (!confirm(`${email} にパスワードリセットメールを送信しますか？`)) return;
      try {
          await this.app.auth.sendPasswordReset(email);
          this.app.showSuccess('パスワードリセットメールを送信しました');
      } catch (e) {
          this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(e));
      }
  }

  async toggleTenantStatus(tenantId, currentStatus) {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const confirmMessage = newStatus === 'active' ? 
        'このテナントを再度有効化しますか？' : 
        'このテナントを利用停止にしますか？管理者はログインできなくなります。';
      
      if (!confirm(confirmMessage)) return;

      try {
          await this.app.api.updateTenantStatus(tenantId, newStatus);
          this.app.showSuccess('テナントのステータスを更新しました');
          await this.loadData();
      } catch (e) {
          this.app.showError(e.message);
      }
  }
  
  async viewTenantDetails(tenantId) {
    // テナント詳細表示の実装（モーダルなど）
    this.app.showInfo(`テナントID: ${tenantId} の詳細表示機能は開発中です`);
  }
}
