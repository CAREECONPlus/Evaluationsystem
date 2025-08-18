/**
 * Settings Page Component - 修正版
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
      await this.loadData();
      this.setupEventListeners();
      this.setupUnloadWarning();
      this.isInitialized = true;
      console.log("Settings: Initialization completed successfully");
    } catch (error) {
      console.error("Settings: Initialization error:", error);
      this.app.showError("設定ページの初期化に失敗しました: " + error.message);
    }
  }

  async loadData() {
    try {
      console.log("Settings: Loading data from Firebase...");
      
      if (!this.app.currentUser) {
        throw new Error("ユーザーが認証されていません");
      }
      
      if (!this.app.hasRole('admin')) {
        throw new Error("設定ページにアクセスする権限がありません");
      }
      
      if (!this.app.currentUser.tenantId) {
        console.warn("Settings: TenantId is missing. Creating empty settings structure.");
        this.settings = {
          jobTypes: [],
          periods: [],
          structures: {}
        };
        this.renderAll();
        this.showEmptyStateMessage();
        return;
      }
      
      this.showLoadingState();
      this.settings = await this.app.api.getSettings();
      console.log("Settings: Data loaded successfully:", this.settings);
      this.renderAll();
      
    } catch (error) {
      console.error("Settings: Error loading data:", error);
      this.renderErrorState(error.message);
      
      if (error.message.includes("タイムアウト")) {
        this.app.showError("設定の読み込みがタイムアウトしました。ページを再読み込みしてください。");
      } else if (error.message.includes("権限")) {
        this.app.showError("設定にアクセスする権限がありません。管理者に連絡してください。");
      } else if (error.message.includes("認証")) {
        this.app.showError("認証が必要です。再度ログインしてください。");
        this.app.navigate("#/login");
      } else {
        this.app.showError("設定データの読み込みに失敗しました: " + error.message);
      }
    }
  }

  showLoadingState() {
    const jobTypesList = document.getElementById('job-types-list');
    const periodsList = document.getElementById('periods-list');
    const structureEditor = document.getElementById('structure-editor');
    
    const loadingHTML = `
      <div class="list-group-item text-center text-muted p-4">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        読み込み中...
      </div>
    `;
    
    if (jobTypesList) jobTypesList.innerHTML = loadingHTML;
    if (periodsList) periodsList.innerHTML = loadingHTML;
    if (structureEditor) structureEditor.innerHTML = loadingHTML;
  }

  showEmptyStateMessage() {
    const jobTypesList = document.getElementById('job-types-list');
    const periodsList = document.getElementById('periods-list');
    
    if (jobTypesList) {
      jobTypesList.innerHTML = `
        <div class="list-group-item text-center text-info p-4">
          <i class="fas fa-info-circle fa-2x mb-3"></i>
          <h6>初期設定が必要です</h6>
          <p class="mb-0 small">「+」ボタンから職種と評価期間を追加してください</p>
        </div>
      `;
    }
    
    if (periodsList) {
      periodsList.innerHTML = `
        <div class="list-group-item text-center text-info p-4">
          <i class="fas fa-calendar-plus fa-2x mb-3"></i>
          <h6>評価期間を追加</h6>
          <p class="mb-0 small">「+」ボタンから評価期間を設定してください</p>
        </div>
      `;
    }
  }

  renderErrorState(errorMessage = "データの読み込みに失敗しました") {
    const jobTypesList = document.getElementById('job-types-list');
    const periodsList = document.getElementById('periods-list');
    const structureEditor = document.getElementById('structure-editor');
    
    const errorHTML = `
      <div class="list-group-item text-center text-danger p-4">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h6>エラー</h6>
        <p class="mb-3 small">${this.app.sanitizeHtml(errorMessage)}</p>
        <button class="btn btn-sm btn-outline-primary" onclick="window.location.reload()">
          <i class="fas fa-redo me-1"></i>再読み込み
        </button>
      </div>
    `;
    
    if (jobTypesList) jobTypesList.innerHTML = errorHTML;
    if (periodsList) periodsList.innerHTML = errorHTML;
    if (structureEditor) {
      structureEditor.innerHTML = `
        <div class="text-center p-5 text-danger">
          <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <h5>設定の読み込みに失敗しました</h5>
          <p class="text-muted">${this.app.sanitizeHtml(errorMessage)}</p>
          <button class="btn btn-outline-primary" onclick="window.location.reload()">
            <i class="fas fa-redo me-2"></i>ページを再読み込み
          </button>
        </div>
      `;
    }
  }

  setupEventListeners() {
    try {
      console.log("Settings: Setting up event listeners...");
      
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.settings-page')) return;
        
        const target = e.target.closest('[id], [data-action]');
        if (!target) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const action = target.id || target.dataset.action;
        
        switch (action) {
          case 'save-settings-btn':
            this.saveSettings();
            break;
          case 'add-job-type-btn':
            this.openSimplePrompt('職種', '職種名を入力してください', '例: 建設作業員')
              .then(name => {
                if (name) {
                  this.saveJobType(null, name);
                  this.markUnsaved();
                  this.renderAll();
                  this.app.showSuccess('職種を追加しました');
                }
              });
            break;
          case 'add-period-btn':
            this.openPeriodDialog()
              .then(result => {
                if (result) {
                  this.savePeriod(null, result.name, result.startDate, result.endDate);
                  this.markUnsaved();
                  this.renderAll();
                  this.app.showSuccess('評価期間を追加しました');
                }
              });
            break;
          default:
            // データ属性を使ったイベント処理
            if (target.dataset.jobTypeId && !target.closest('.btn')) {
              this.selectJobType(target.dataset.jobTypeId);
            } else if (target.dataset.action) {
              this.handleDataAction(target);
            }
        }
      });
      
      console.log("Settings: Event listeners setup completed");
    } catch (error) {
      console.error("Settings: Error setting up event listeners:", error);
    }
  }

  handleDataAction(element) {
    const action = element.dataset.action;
    const id = element.dataset.id;
    const parentId = element.dataset.parentId;
    
    switch (action) {
      case 'edit-job-type':
        this.editJobType(id);
        break;
      case 'delete-job-type':
        this.deleteJobType(id);
        break;
      case 'edit-period':
        this.editPeriod(id);
        break;
      case 'delete-period':
        this.deletePeriod(id);
        break;
      case 'add-category':
        this.addCategory();
        break;
      case 'edit-category':
        this.editCategory(id);
        break;
      case 'delete-category':
        this.deleteCategory(id);
        break;
      case 'add-item':
        this.addItem(parentId);
        break;
      case 'edit-item':
        this.editItem(id, parentId);
        break;
      case 'delete-item':
        this.deleteItem(id, parentId);
        break;
    }
  }

  async openSimplePrompt(title, message, placeholder = '') {
    return new Promise((resolve) => {
      const input = prompt(`${title}\n\n${message}`, placeholder);
      resolve(input?.trim() || null);
    });
  }

  async openPeriodDialog() {
    return new Promise((resolve) => {
      const name = prompt('評価期間名を入力してください', '例: 2025年 上半期');
      if (!name) {
        resolve(null);
        return;
      }
      
      const startDate = prompt('開始日を入力してください (YYYY-MM-DD)', '2025-01-01');
      if (!startDate) {
        resolve(null);
        return;
      }
      
      const endDate = prompt('終了日を入力してください (YYYY-MM-DD)', '2025-06-30');
      if (!endDate) {
        resolve(null);
        return;
      }
      
      resolve({ name: name.trim(), startDate, endDate });
    });
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
          <button class="btn btn-outline-primary btn-sm border-0" data-action="edit-job-type" data-id="${jt.id}" title="編集">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm border-0" data-action="delete-job-type" data-id="${jt.id}" title="削除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
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
          <button class="btn btn-outline-primary btn-sm border-0" data-action="edit-period" data-id="${p.id}" title="編集">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm border-0" data-action="delete-period" data-id="${p.id}" title="削除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
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
        <button class="btn btn-outline-primary" data-action="add-category">
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
  }

  renderCategory(category, catIndex) {
    return `
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${this.app.sanitizeHtml(category.name)}</h6>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary border-0" data-action="edit-category" data-id="${category.id}" title="編集">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-outline-danger border-0" data-action="delete-category" data-id="${category.id}" title="削除">
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
                  <button class="btn btn-outline-primary border-0" data-action="edit-item" data-id="${item.id}" data-parent-id="${category.id}" title="編集">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn btn-outline-danger border-0" data-action="delete-item" data-id="${item.id}" data-parent-id="${category.id}" title="削除">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
            <div class="list-group-item">
              <button class="btn btn-sm btn-outline-secondary w-100" data-action="add-item" data-parent-id="${category.id}">
                <i class="fas fa-plus me-2"></i>項目を追加
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 各種操作メソッド
  editJobType(id) {
    const jobType = this.settings.jobTypes.find(jt => jt.id === id);
    if (!jobType) return;
    
    this.openSimplePrompt('職種編集', '職種名を入力してください', jobType.name)
      .then(name => {
        if (name && name !== jobType.name) {
          this.saveJobType(id, name);
          this.markUnsaved();
          this.renderAll();
          this.app.showSuccess('職種を更新しました');
        }
      });
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

  editPeriod(id) {
    const period = this.settings.periods.find(p => p.id === id);
    if (!period) return;
    
    this.openPeriodDialog()
      .then(result => {
        if (result) {
          this.savePeriod(id, result.name, result.startDate, result.endDate);
          this.markUnsaved();
          this.renderAll();
          this.app.showSuccess('評価期間を更新しました');
        }
      });
  }

  deletePeriod(id) {
    if (!confirm('この評価期間を削除しますか？')) return;
    
    this.settings.periods = this.settings.periods.filter(p => p.id !== id);
    this.markUnsaved();
    this.renderAll();
    this.app.showSuccess('評価期間を削除しました');
  }

  addCategory() {
    if (!this.selectedJobTypeId) return;
    
    this.openSimplePrompt('カテゴリ追加', 'カテゴリ名を入力してください', '例: 技術スキル')
      .then(name => {
        if (name) {
          this.saveCategory(null, name);
          this.markUnsaved();
          this.renderAll();
          this.app.showSuccess('カテゴリを追加しました');
        }
      });
  }

  editCategory(id) {
    if (!this.selectedJobTypeId) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    const category = structure?.categories.find(c => c.id === id);
    if (!category) return;
    
    this.openSimplePrompt('カテゴリ編集', 'カテゴリ名を入力してください', category.name)
      .then(name => {
        if (name && name !== category.name) {
          this.saveCategory(id, name);
          this.markUnsaved();
          this.renderAll();
          this.app.showSuccess('カテゴリを更新しました');
        }
      });
  }

  deleteCategory(id) {
    if (!confirm('このカテゴリを削除しますか？カテゴリ内の項目も削除されます。')) return;
    
    if (!this.selectedJobTypeId) return;
    const structure = this.settings.structures[this.selectedJobTypeId];
    structure.categories = structure.categories.filter(c => c.id !== id);
    
    this.markUnsaved();
    this.renderAll();
    this.app.showSuccess('カテゴリを削除しました');
  }

  addItem(parentId) {
    this.openSimplePrompt('評価項目追加', '評価項目名を入力してください', '例: 図面の読解力')
      .then(name => {
        if (name) {
          this.saveItem(null, name, parentId);
          this.markUnsaved();
          this.renderAll();
          this.app.showSuccess('評価項目を追加しました');
        }
      });
  }

  editItem(id, parentId) {
    if (!this.selectedJobTypeId || !parentId) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    const category = structure?.categories.find(c => c.id === parentId);
    const item = category?.items.find(i => i.id === id);
    if (!item) return;
    
    this.openSimplePrompt('評価項目編集', '評価項目名を入力してください', item.name)
      .then(name => {
        if (name && name !== item.name) {
          this.saveItem(id, name, parentId);
          this.markUnsaved();
          this.renderAll();
          this.app.showSuccess('評価項目を更新しました');
        }
      });
  }

  deleteItem(id, parentId) {
    if (!confirm('この評価項目を削除しますか？')) return;
    
    if (!this.selectedJobTypeId || !parentId) return;
    const structure = this.settings.structures[this.selectedJobTypeId];
    const category = structure?.categories.find(c => c.id === parentId);
    
    if (category) {
      category.items = category.items.filter(i => i.id !== id);
      this.markUnsaved();
      this.renderAll();
      this.app.showSuccess('評価項目を削除しました');
    }
  }

  // データ保存メソッド
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
    
    if (!this.settings.structures[this.selectedJobTypeId]) {
      this.settings.structures[this.selectedJobTypeId] = { id: this.selectedJobTypeId, categories: [] };
    }
    
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
    const category = structure?.categories.find(c => c.id === parentId);
    
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

  cleanup() {
    console.log("Settings: Starting cleanup...");
    
    try {
      window.removeEventListener('beforeunload', this.unloadHandler);
      console.log("Settings: Cleanup completed");
    } catch (error) {
      console.error("Settings: Cleanup error:", error);
    }
  }

  canLeave() {
    if (this.hasUnsavedChanges) {
      return confirm('保存されていない変更があります。ページを離れてもよろしいですか？');
    }
    return true;
  }
}
