/**
 * Settings Page Component - 完全修正版（モーダル問題・Firebase連携対応）
 * 設定ページコンポーネント
 */
export class SettingsPage {
  constructor(app) {
    this.app = app;
    this.settings = {
      jobTypes: [],
      periods: [],
      structures: {}
    };
    this.selectedJobTypeId = null;
    this.hasUnsavedChanges = false;
    this.editModal = null;
    this.isInitialized = false;
    this.modalCleanupTimer = null;
  }

  async render() {
    return `
      <div class="settings-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="settings.title">システム設定</h1>
          <button id="save-settings-btn" class="btn btn-success" disabled>
            <i class="fas fa-save me-2"></i><span data-i18n="settings.save_changes">変更を保存</span>
          </button>
        </div>
        
        <div class="row">
          <div class="col-lg-4 mb-4">
            <!-- 職種管理 -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0" data-i18n="settings.job_types">職種管理</h5>
                <button class="btn btn-sm btn-primary" id="add-job-type-btn">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="list-group list-group-flush" id="job-types-list">
                <div class="list-group-item text-center text-muted">
                  <div class="spinner-border spinner-border-sm" role="status"></div>
                  <span class="ms-2">読み込み中...</span>
                </div>
              </div>
            </div>
            
            <!-- 評価期間管理 -->
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0" data-i18n="settings.evaluation_periods">評価期間</h5>
                <button class="btn btn-sm btn-primary" id="add-period-btn">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="list-group list-group-flush" id="periods-list">
                <div class="list-group-item text-center text-muted">
                  <div class="spinner-border spinner-border-sm" role="status"></div>
                  <span class="ms-2">読み込み中...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-8">
            <!-- 評価構造エディタ -->
            <div class="card">
              <div class="card-body" id="structure-editor">
                <div class="text-center p-5 text-muted">
                  <i class="fas fa-arrow-left fa-2x mb-3"></i>
                  <p data-i18n="settings.select_job_type_hint">左のリストから職種を選択して評価項目を設定してください。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 編集モーダル -->
      <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editModalLabel">項目を編集</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editForm">
                <!-- フォーム内容は動的に生成 -->
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="cancel-modal-btn">キャンセル</button>
              <button type="button" class="btn btn-primary" id="save-modal-btn">保存</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    console.log("Settings: Starting initialization...");
    
    if (!this.app.hasRole('admin')) {
      this.app.navigate('#/dashboard');
      return;
    }
    
    this.app.currentPage = this;
    
    try {
      // ★★★ 最初にモーダルの残骸をクリーンアップ ★★★
      this.forceCleanupModals();
      
      // 基本的なイベントリスナーを設定
      this.setupBasicEventListeners();
      
      // データを読み込み
      await this.loadData();
      
      // モーダルを初期化（データ読み込み後）
      await this.initializeModal();
      
      // ページ離脱時の警告設定
      this.setupUnloadWarning();
      
      this.isInitialized = true;
      console.log("Settings: Initialization completed successfully");
      
    } catch (error) {
      console.error("Settings: Initialization error:", error);
      this.app.showError("設定ページの初期化に失敗しました: " + error.message);
    }
  }

  /**
   * モーダルの残骸を強制クリーンアップ
   */
  forceCleanupModals() {
    try {
      console.log("Settings: Force cleanup modals...");
      
      // bodyからmodal-openクラスを削除
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // 既存のモーダルバックドロップをすべて削除
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
        backdrop.remove();
      });
      
      // 既存のモーダルを非表示にする
      const existingModals = document.querySelectorAll('.modal');
      existingModals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
      });
      
      console.log("Settings: Modal cleanup completed");
    } catch (error) {
      console.error("Settings: Modal cleanup error:", error);
    }
  }

  setupBasicEventListeners() {
    try {
      console.log("Settings: Setting up basic event listeners...");
      
      // メインボタンのイベントリスナー
      document.addEventListener('click', (e) => {
        if (e.target.closest('#save-settings-btn')) {
          e.preventDefault();
          this.saveSettings();
        } else if (e.target.closest('#add-job-type-btn')) {
          e.preventDefault();
          this.openEditModal('jobType');
        } else if (e.target.closest('#add-period-btn')) {
          e.preventDefault();
          this.openEditModal('period');
        }
      });
      
      console.log("Settings: Basic event listeners setup completed");
    } catch (error) {
      console.error("Settings: Error setting up basic event listeners:", error);
    }
  }

  async initializeModal() {
    return new Promise((resolve) => {
      console.log("Settings: Initializing modal...");
      
      const initModal = () => {
        const modalElement = document.getElementById('editModal');
        if (modalElement) {
          try {
            // 既存のモーダルインスタンスを破棄
            const existingModal = bootstrap.Modal.getInstance(modalElement);
            if (existingModal) {
              existingModal.dispose();
            }
            
            this.editModal = new bootstrap.Modal(modalElement, {
              backdrop: 'static',
              keyboard: false
            });
            
            // モーダルイベントリスナー
            modalElement.addEventListener('hidden.bs.modal', () => {
              this.onModalHidden();
            });
            
            // モーダル内ボタンのイベントリスナー
            document.getElementById('save-modal-btn')?.addEventListener('click', () => {
              this.saveFromModal();
            });
            
            document.getElementById('cancel-modal-btn')?.addEventListener('click', () => {
              this.closeModal();
            });
            
            console.log("Settings: Modal initialized successfully");
            resolve();
          } catch (error) {
            console.error("Settings: Modal initialization error:", error);
            setTimeout(initModal, 200);
          }
        } else {
          setTimeout(initModal, 100);
        }
      };
      
      initModal();
    });
  }

  onModalHidden() {
    try {
      console.log("Settings: Modal hidden event");
      // モーダルが閉じた後の追加クリーンアップ
      this.forceCleanupModals();
    } catch (error) {
      console.error("Settings: Modal hidden event error:", error);
    }
  }

  async loadData() {
    try {
      console.log("Settings: Loading data from Firebase...");
      
      // Firebase接続確認
      if (!this.app.currentUser || !this.app.currentUser.tenantId) {
        throw new Error("認証情報またはテナント情報が見つかりません");
      }
      
      console.log("Settings: Current user tenantId:", this.app.currentUser.tenantId);
      
      this.settings = await this.app.api.getSettings();
      
      console.log("Settings: Loaded data:", {
        jobTypes: this.settings.jobTypes.length,
        periods: this.settings.periods.length,
        structures: Object.keys(this.settings.structures).length
      });
      
      this.renderAll();
      console.log("Settings: Data loaded and rendered successfully");
      
    } catch (error) {
      console.error("Settings: Error loading data:", error);
      
      // エラー時のダミーデータ表示
      this.renderErrorState();
      this.app.showError("設定データの読み込みに失敗しました: " + error.message);
    }
  }

  renderErrorState() {
    const jobTypesList = document.getElementById('job-types-list');
    const periodsList = document.getElementById('periods-list');
    
    if (jobTypesList) {
      jobTypesList.innerHTML = `
        <div class="list-group-item text-center text-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          データの読み込みに失敗しました
          <br>
          <button class="btn btn-sm btn-outline-primary mt-2" onclick="window.location.reload()">
            再読み込み
          </button>
        </div>
      `;
    }
    
    if (periodsList) {
      periodsList.innerHTML = `
        <div class="list-group-item text-center text-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          データの読み込みに失敗しました
          <br>
          <button class="btn btn-sm btn-outline-primary mt-2" onclick="window.location.reload()">
            再読み込み
          </button>
        </div>
      `;
    }
  }

  renderAll() {
    try {
      this.renderJobTypesList();
      this.renderPeriodsList();
      this.renderStructureEditor();
      this.app.i18n.updateUI();
    } catch (error) {
      console.error("Settings: Error rendering:", error);
    }
  }

  renderJobTypesList() {
    const list = document.getElementById('job-types-list');
    if (!list) return;
    
    if (this.settings.jobTypes.length === 0) {
      list.innerHTML = `
        <div class="list-group-item text-muted text-center">
          <i class="fas fa-info-circle me-2"></i>
          職種が登録されていません
          <br>
          <small>右上の「+」ボタンから職種を追加してください</small>
        </div>
      `;
      return;
    }

    list.innerHTML = this.settings.jobTypes.map(jt => `
      <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${this.selectedJobTypeId === jt.id ? 'active' : ''}" 
           data-job-type-id="${jt.id}">
        <span class="flex-grow-1 job-type-name">${this.app.sanitizeHtml(jt.name)}</span>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-sm border-0 edit-job-type-btn" data-job-type-id="${jt.id}" title="編集">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm border-0 delete-job-type-btn" data-job-type-id="${jt.id}" title="削除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // イベントリスナーを追加
    this.setupJobTypeEventListeners();
  }

  setupJobTypeEventListeners() {
    const list = document.getElementById('job-types-list');
    if (!list) return;
    
    // 職種選択のイベントリスナー
    list.querySelectorAll('[data-job-type-id]').forEach(item => {
      if (!item.classList.contains('btn')) {
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.btn')) {
            this.selectJobType(item.dataset.jobTypeId);
          }
        });
      }
    });

    // 編集ボタンのイベントリスナー
    list.querySelectorAll('.edit-job-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditModal('jobType', btn.dataset.jobTypeId);
      });
    });

    // 削除ボタンのイベントリスナー
    list.querySelectorAll('.delete-job-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteJobType(btn.dataset.jobTypeId);
      });
    });
  }

  renderPeriodsList() {
    const list = document.getElementById('periods-list');
    if (!list) return;
    
    if (this.settings.periods.length === 0) {
      list.innerHTML = `
        <div class="list-group-item text-muted text-center">
          <i class="fas fa-info-circle me-2"></i>
          評価期間が登録されていません
          <br>
          <small>右上の「+」ボタンから評価期間を追加してください</small>
        </div>
      `;
      return;
    }

    list.innerHTML = this.settings.periods.map(p => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-bold">${this.app.sanitizeHtml(p.name)}</div>
          <small class="text-muted">
            ${this.app.formatDate(p.startDate)} - ${this.app.formatDate(p.endDate)}
          </small>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-sm border-0 edit-period-btn" data-period-id="${p.id}" title="編集">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm border-0 delete-period-btn" data-period-id="${p.id}" title="削除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // イベントリスナーを追加
    this.setupPeriodEventListeners();
  }

  setupPeriodEventListeners() {
    const list = document.getElementById('periods-list');
    if (!list) return;
    
    // 編集ボタンのイベントリスナー
    list.querySelectorAll('.edit-period-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal('period', btn.dataset.periodId));
    });

    // 削除ボタンのイベントリスナー
    list.querySelectorAll('.delete-period-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deletePeriod(btn.dataset.periodId));
    });
  }

  selectJobType(id) {
    if (this.hasUnsavedChanges && !confirm('保存されていない変更があります。ページを離れてもよろしいですか？')) {
      return;
    }
    
    this.selectedJobTypeId = id;
    this.markAsSaved();
    this.renderAll();
  }

  renderStructureEditor() {
    const editor = document.getElementById('structure-editor');
    if (!editor) return;
    
    if (!this.selectedJobTypeId) {
      editor.innerHTML = `
        <div class="text-center p-5 text-muted">
          <i class="fas fa-arrow-left fa-2x mb-3"></i>
          <p data-i18n="settings.select_job_type_hint">左のリストから職種を選択して評価項目を設定してください。</p>
        </div>
      `;
      return;
    }
    
    const jobType = this.settings.jobTypes.find(jt => jt.id === this.selectedJobTypeId);
    if (!jobType) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId] || { 
      id: this.selectedJobTypeId, 
      categories: [] 
    };

    editor.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4>${this.app.sanitizeHtml(jobType.name)} の評価構造</h4>
        <button class="btn btn-outline-primary add-category-btn">
          <i class="fas fa-plus me-2"></i>カテゴリを追加
        </button>
      </div>
      <div id="categories-container">
        ${structure.categories.length > 0 ? 
          structure.categories.map((cat, catIndex) => this.renderCategory(cat, catIndex)).join('') :
          `<div class="text-center p-4 text-muted border rounded">
             <i class="fas fa-folder-plus fa-2x mb-3"></i>
             <p>「カテゴリを追加」ボタンから評価カテゴリを作成してください。</p>
           </div>`
        }
      </div>
    `;

    // カテゴリ追加ボタンのイベントリスナー
    const addCategoryBtn = editor.querySelector('.add-category-btn');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.openEditModal('category'));
    }
  }

  renderCategory(category, catIndex) {
    return `
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${this.app.sanitizeHtml(category.name)}</h6>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary border-0 edit-category-btn" data-category-id="${category.id}" title="編集">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-outline-danger border-0 delete-category-btn" data-category-id="${category.id}" title="削除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="list-group">
            ${(category.items || []).map(item => `
              <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${this.app.sanitizeHtml(item.name)}</span>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary border-0 edit-item-btn" data-item-id="${item.id}" data-category-id="${category.id}" title="編集">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn btn-outline-danger border-0 delete-item-btn" data-item-id="${item.id}" data-category-id="${category.id}" title="削除">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
            <div class="list-group-item">
              <button class="btn btn-sm btn-outline-secondary w-100 add-item-btn" data-category-id="${category.id}">
                <i class="fas fa-plus me-2"></i>項目を追加
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  openEditModal(type, id = null, parentId = null) {
    try {
      console.log("Settings: Opening edit modal for", type, id);
      
      // モーダルがない場合は処理を停止
      if (!this.editModal) {
        console.error("Settings: Modal not initialized");
        this.app.showError("モーダルが初期化されていません");
        return;
      }

      // 現在表示されているモーダルを強制的に閉じる
      this.forceCleanupModals();
      
      const form = document.getElementById('editForm');
      const label = document.getElementById('editModalLabel');
      
      if (!form || !label) {
        console.error("Settings: Modal form elements not found");
        return;
      }

      // フォームのリセット
      form.innerHTML = '';
      form.dataset.type = type;
      form.dataset.id = id || '';
      form.dataset.parentId = parentId || '';

      let titleText = '';
      let entity = {};

      // データの取得と表示設定
      if (id) {
        titleText = `${this.getTypeDisplayName(type)}を編集`;
        entity = this.findEntity(type, id, parentId);
      } else {
        titleText = `${this.getTypeDisplayName(type)}を追加`;
      }

      label.textContent = titleText;

      // フォーム内容の生成
      if (type === 'jobType' || type === 'category' || type === 'item') {
        form.innerHTML = `
          <div class="mb-3">
            <label for="entityName" class="form-label">名前</label>
            <input type="text" class="form-control" id="entityName" value="${this.app.sanitizeHtml(entity.name || '')}" required>
          </div>
        `;
      } else if (type === 'period') {
        form.innerHTML = `
          <div class="mb-3">
            <label for="entityName" class="form-label">期間名</label>
            <input type="text" class="form-control" id="entityName" value="${this.app.sanitizeHtml(entity.name || '')}" required>
          </div>
          <div class="mb-3">
            <label for="startDate" class="form-label">開始日</label>
            <input type="date" class="form-control" id="startDate" value="${entity.startDate || ''}" required>
          </div>
          <div class="mb-3">
            <label for="endDate" class="form-label">終了日</label>
            <input type="date" class="form-control" id="endDate" value="${entity.endDate || ''}" required>
          </div>
        `;
      }

      // モーダルを表示
      setTimeout(() => {
        this.editModal.show();
      }, 100);
      
    } catch (error) {
      console.error("Settings: Error opening modal:", error);
      this.app.showError("モーダルの表示に失敗しました: " + error.message);
    }
  }

  closeModal() {
    try {
      if (this.editModal) {
        this.editModal.hide();
      }
      // 追加のクリーンアップ
      setTimeout(() => {
        this.forceCleanupModals();
      }, 300);
    } catch (error) {
      console.error("Settings: Error closing modal:", error);
      this.forceCleanupModals();
    }
  }

  getTypeDisplayName(type) {
    const typeNames = {
      jobType: '職種',
      period: '評価期間',
      category: 'カテゴリ',
      item: '評価項目'
    };
    return typeNames[type] || type;
  }

  findEntity(type, id, parentId) {
    try {
      if (type === 'jobType') {
        return this.settings.jobTypes.find(e => e.id === id) || {};
      } else if (type === 'period') {
        return this.settings.periods.find(e => e.id === id) || {};
      } else if (type === 'category') {
        const structure = this.settings.structures[this.selectedJobTypeId];
        return structure?.categories.find(e => e.id === id) || {};
      } else if (type === 'item') {
        const structure = this.settings.structures[this.selectedJobTypeId];
        const category = structure?.categories.find(c => c.id === parentId);
        return category?.items.find(e => e.id === id) || {};
      }
      return {};
    } catch (error) {
      console.error("Settings: Error finding entity:", error);
      return {};
    }
  }

  saveFromModal() {
    try {
      const form = document.getElementById('editForm');
      if (!form) return;

      const { type, id, parentId } = form.dataset;
      const name = document.getElementById('entityName')?.value;

      if (!name) {
        this.app.showError("名前を入力してください");
        return;
      }

      if (type === 'jobType') {
        this.saveJobType(id, name);
      } else if (type === 'period') {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        this.savePeriod(id, name, startDate, endDate);
      } else if (type === 'category') {
        this.saveCategory(id, name);
      } else if (type === 'item') {
        this.saveItem(id, name, parentId);
      }

      this.closeModal();
      this.markUnsaved();
      this.renderAll();
      
      this.app.showSuccess(`${this.getTypeDisplayName(type)}を${id ? '更新' : '追加'}しました`);
      
    } catch (error) {
      console.error("Settings: Error saving from modal:", error);
      this.app.showError("保存に失敗しました: " + error.message);
    }
  }

  saveJobType(id, name) {
    if (id) {
      const jobType = this.settings.jobTypes.find(e => e.id === id);
      if (jobType) jobType.name = name;
    } else {
      const newId = `jt_${Date.now()}`;
      this.settings.jobTypes.push({ id: newId, name });
      this.settings.structures[newId] = { id: newId, categories: [] };
    }
  }

  savePeriod(id, name, startDate, endDate) {
    if (!startDate || !endDate) {
      this.app.showError("開始日と終了日を入力してください");
      return;
    }

    if (id) {
      const period = this.settings.periods.find(e => e.id === id);
      if (period) {
        period.name = name;
        period.startDate = startDate;
        period.endDate = endDate;
      }
    } else {
      this.settings.periods.push({ 
        id: `p_${Date.now()}`, 
        name, 
        startDate, 
        endDate 
      });
    }
  }

  saveCategory(id, name) {
    if (!this.selectedJobTypeId) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    if (id) {
      const category = structure.categories.find(e => e.id === id);
      if (category) category.name = name;
    } else {
      structure.categories.push({ 
        id: `cat_${Date.now()}`, 
        name, 
        items: [] 
      });
    }
  }

  saveItem(id, name, parentId) {
    if (!this.selectedJobTypeId || !parentId) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    const category = structure.categories.find(c => c.id === parentId);
    
    if (category) {
      if (id) {
        const item = category.items.find(e => e.id === id);
        if (item) item.name = name;
      } else {
        category.items.push({ 
          id: `item_${Date.now()}`, 
          name 
        });
      }
    }
  }

  deleteJobType(id) {
    if (!confirm('この職種を削除しますか？関連する評価構造も削除されます。')) return;
    
    this.settings.jobTypes = this.settings.jobTypes.filter(jt => jt.id !== id);
    delete this.settings.structures[id];
    
    if (this.selectedJobTypeId === id) {
      this.selectedJobTypeId = null;
    }
    
    this.markUnsaved();
    this.renderAll();
    this.app.showSuccess('職種を削除しました');
  }

  deletePeriod(id) {
    if (!confirm('この評価期間を削除しますか？')) return;
    
    this.settings.periods = this.settings.periods.filter(p => p.id !== id);
    this.markUnsaved();
    this.renderAll();
    this.app.showSuccess('評価期間を削除しました');
  }

  markUnsaved() {
    this.hasUnsavedChanges = true;
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) saveBtn.disabled = false;
  }
  
  markAsSaved() {
    this.hasUnsavedChanges = false;
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) saveBtn.disabled = true;
  }

  setupUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        return e.returnValue = '保存されていない変更があります。ページを離れてもよろしいですか？';
      }
    });
  }

  async saveSettings() {
    const btn = document.getElementById('save-settings-btn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> 保存中...`;
    
    try {
      console.log("Settings: Saving settings to Firebase...");
      await this.app.api.saveSettings(this.settings);
      this.markAsSaved();
      this.app.showSuccess('設定を保存しました');
      console.log("Settings: Settings saved successfully");
    } catch (error) {
      console.error("Settings: Save error:", error);
      this.app.showError('設定の保存に失敗しました: ' + error.message);
      btn.disabled = false;
    } finally {
      btn.innerHTML = originalText;
    }
  }

  // クリーンアップメソッド
  cleanup() {
    console.log("Settings: Starting cleanup...");
    
    try {
      // モーダルのクリーンアップ
      if (this.editModal) {
        this.editModal.dispose();
        this.editModal = null;
      }
      
      // 強制的なモーダルクリーンアップ
      this.forceCleanupModals();
      
      // タイマーのクリーンアップ
      if (this.modalCleanupTimer) {
        clearTimeout(this.modalCleanupTimer);
        this.modalCleanupTimer = null;
      }
      
      // ページ離脱警告のクリーンアップ
      window.removeEventListener('beforeunload', this.unloadHandler);
      
      console.log("Settings: Cleanup completed");
    } catch (error) {
      console.error("Settings: Cleanup error:", error);
    }
  }

  // ページから離れることができるかチェック
  canLeave() {
    if (this.hasUnsavedChanges) {
      return confirm('保存されていない変更があります。ページを離れてもよろしいですか？');
    }
    return true;
  }
}
