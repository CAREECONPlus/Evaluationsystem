/**
 * Settings Page Component (Firebase Integrated & Modal Issues Fixed)
 * 設定ページコンポーネント（Firebase連携・モーダル問題修正版）
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel">キャンセル</button>
              <button type="button" class="btn btn-primary" id="save-modal-btn" data-i18n="common.save">保存</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    if (!this.app.hasRole('admin')) {
      this.app.navigate('#/dashboard');
      return;
    }
    
    this.app.currentPage = this;
    
    try {
      console.log("Settings: Initializing...");
      
      // モーダルの初期化（DOM要素が存在することを確認）
      await this.initializeModal();
      
      // データの読み込み
      await this.loadData();
      
      // イベントリスナーの設定
      this.setupEventListeners();
      
      // ページ離脱時の警告設定
      this.setupUnloadWarning();
      
      this.isInitialized = true;
      console.log("Settings: Initialization completed");
      
    } catch (error) {
      console.error("Settings: Initialization error:", error);
      this.app.showError("設定ページの初期化に失敗しました: " + error.message);
    }
  }

  async initializeModal() {
    return new Promise((resolve) => {
      // DOMが完全に構築されるまで待機
      const checkModal = () => {
        const modalElement = document.getElementById('editModal');
        if (modalElement) {
          try {
            this.editModal = new bootstrap.Modal(modalElement, {
              backdrop: 'static',
              keyboard: false
            });
            console.log("Settings: Modal initialized");
            resolve();
          } catch (error) {
            console.error("Settings: Modal initialization error:", error);
            setTimeout(checkModal, 100);
          }
        } else {
          setTimeout(checkModal, 100);
        }
      };
      checkModal();
    });
  }

  setupEventListeners() {
    try {
      // メインボタンのイベントリスナー
      const saveBtn = document.getElementById('save-settings-btn');
      const addJobTypeBtn = document.getElementById('add-job-type-btn');
      const addPeriodBtn = document.getElementById('add-period-btn');
      const saveModalBtn = document.getElementById('save-modal-btn');

      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveSettings());
      }
      
      if (addJobTypeBtn) {
        addJobTypeBtn.addEventListener('click', () => this.openEditModal('jobType'));
      }
      
      if (addPeriodBtn) {
        addPeriodBtn.addEventListener('click', () => this.openEditModal('period'));
      }
      
      if (saveModalBtn) {
        saveModalBtn.addEventListener('click', () => this.saveFromModal());
      }

      console.log("Settings: Event listeners setup completed");
    } catch (error) {
      console.error("Settings: Error setting up event listeners:", error);
    }
  }

  setupUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        return e.returnValue = this.app.i18n.t('settings.unsaved_warning');
      }
    });
  }

  async loadData() {
    try {
      console.log("Settings: Loading data...");
      this.settings = await this.app.api.getSettings();
      this.renderAll();
      console.log("Settings: Data loaded successfully");
    } catch (error) {
      console.error("Settings: Error loading data:", error);
      this.app.showError("設定データの読み込みに失敗しました: " + error.message);
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
      list.innerHTML = `<div class="list-group-item text-muted text-center">職種が登録されていません</div>`;
      return;
    }

    list.innerHTML = this.settings.jobTypes.map(jt => `
      <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${this.selectedJobTypeId === jt.id ? 'active' : ''}" 
           data-id="${jt.id}">
        <span class="flex-grow-1">${this.app.sanitizeHtml(jt.name)}</span>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-sm border-0 edit-job-type-btn" data-id="${jt.id}" title="編集">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm border-0 delete-job-type-btn" data-id="${jt.id}" title="削除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // イベントリスナーを追加
    list.querySelectorAll('[data-id]').forEach(item => {
      if (!item.classList.contains('btn')) {
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.btn')) {
            this.selectJobType(item.dataset.id);
          }
        });
      }
    });

    list.querySelectorAll('.edit-job-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditModal('jobType', btn.dataset.id);
      });
    });

    list.querySelectorAll('.delete-job-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteJobType(btn.dataset.id);
      });
    });
  }

  renderPeriodsList() {
    const list = document.getElementById('periods-list');
    if (!list) return;
    
    if (this.settings.periods.length === 0) {
      list.innerHTML = `<div class="list-group-item text-muted text-center">評価期間が登録されていません</div>`;
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
          <button class="btn btn-outline-primary btn-sm border-0 edit-period-btn" data-id="${p.id}" title="編集">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm border-0 delete-period-btn" data-id="${p.id}" title="削除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // イベントリスナーを追加
    list.querySelectorAll('.edit-period-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal('period', btn.dataset.id));
    });

    list.querySelectorAll('.delete-period-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deletePeriod(btn.dataset.id));
    });
  }

  selectJobType(id) {
    if (this.hasUnsavedChanges && !confirm(this.app.i18n.t('settings.unsaved_warning'))) {
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
          `<div class="text-center p-4 text-muted">
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
            <button class="btn btn-outline-primary border-0 edit-category-btn" data-id="${category.id}" title="編集">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-outline-danger border-0 delete-category-btn" data-id="${category.id}" title="削除">
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
                  <button class="btn btn-outline-primary border-0 edit-item-btn" data-id="${item.id}" data-category-id="${category.id}" title="編集">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn btn-outline-danger border-0 delete-item-btn" data-id="${item.id}" data-category-id="${category.id}" title="削除">
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
    if (!this.editModal) {
      console.error("Settings: Modal not initialized");
      return;
    }

    try {
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

      this.editModal.show();
    } catch (error) {
      console.error("Settings: Error opening modal:", error);
      this.app.showError("モーダルの表示に失敗しました");
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

      this.editModal.hide();
      this.markUnsaved();
      this.renderAll();
    } catch (error) {
      console.error("Settings: Error saving from modal:", error);
      this.app.showError("保存に失敗しました");
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
  }

  deletePeriod(id) {
    if (!confirm('この評価期間を削除しますか？')) return;
    
    this.settings.periods = this.settings.periods.filter(p => p.id !== id);
    this.markUnsaved();
    this.renderAll();
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

  async saveSettings() {
    const btn = document.getElementById('save-settings-btn');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> 保存中...`;
    
    try {
      await this.app.api.saveSettings(this.settings);
      this.markAsSaved();
      this.app.showSuccess('設定を保存しました');
    } catch (error) {
      console.error("Settings: Save error:", error);
      this.app.showError('設定の保存に失敗しました: ' + error.message);
      btn.disabled = false;
    } finally {
      btn.innerHTML = `<i class="fas fa-save me-2"></i>変更を保存`;
    }
  }

  // クリーンアップメソッド
  cleanup() {
    if (this.editModal) {
      try {
        this.editModal.dispose();
      } catch (error) {
        console.warn("Settings: Modal disposal error:", error);
      }
    }
    
    window.removeEventListener('beforeunload', this.unloadHandler);
    console.log("Settings: Cleanup completed");
  }

  // ページから離れることができるかチェック
  canLeave() {
    if (this.hasUnsavedChanges) {
      return confirm(this.app.i18n.t('settings.unsaved_warning'));
    }
    return true;
  }
}
