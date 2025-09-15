/**
 * Settings Page Component - 完全修正版
 * prompt()問題とUI更新問題の解決
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
                <div class="list-group-item text-center text-muted p-4">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                  読み込み中...
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
                <div class="list-group-item text-center text-muted p-4">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                  読み込み中...
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
    } catch (error) {
      console.error("Settings: Initialization error:", error);
      this.app.showError("設定ページの初期化に失敗しました: " + error.message);
    }
  }

  async loadData() {
    try {
      
      if (!this.app.currentUser?.tenantId) {
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
      this.renderAll();
      
    } catch (error) {
      console.error("Settings: Error loading data:", error);
      this.renderErrorState(error.message);
      this.app.showError("設定データの読み込みに失敗しました: " + error.message);
    }
  }

  showLoadingState() {
    const loadingHTML = `
      <div class="list-group-item text-center text-muted p-4">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        読み込み中...
      </div>
    `;
    
    const jobTypesList = document.getElementById('job-types-list');
    const periodsList = document.getElementById('periods-list');
    const structureEditor = document.getElementById('structure-editor');
    
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
    
    const containers = ['job-types-list', 'periods-list'];
    containers.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.innerHTML = errorHTML;
    });
    
    const structureEditor = document.getElementById('structure-editor');
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
    // 既存のイベントリスナーを削除
    if (this.boundHandlers) {
      document.removeEventListener('click', this.boundHandlers.click);
      document.removeEventListener('input', this.boundHandlers.input);
      document.removeEventListener('change', this.boundHandlers.change);
    }
    
    // バインドされたハンドラーを保存
    this.boundHandlers = {
      click: this.handleClick.bind(this),
      input: this.handleInput.bind(this),
      change: this.handleChange.bind(this)
    };
    
    // イベント委譲を使用してシンプルに実装
    document.addEventListener('click', this.boundHandlers.click);
    document.addEventListener('input', this.boundHandlers.input);
    document.addEventListener('change', this.boundHandlers.change);
  }

  handleClick(e) {
    // 設定ページ外のクリックは無視
    if (!e.target.closest('.settings-page')) return;
    
    const target = e.target.closest('button[id], [data-action]');
    if (!target) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // IDベースの処理
    if (target.id) {
      switch (target.id) {
        case 'save-settings-btn':
          this.saveSettings();
          break;
        case 'add-job-type-btn':
          this.addJobType();
          break;
        case 'add-period-btn':
          this.addPeriod();
          break;
      }
      return;
    }
    
    // data-action属性の処理
    const action = target.dataset.action;
    const id = target.dataset.id;
    const parentId = target.dataset.parentId;
    
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
      case 'select-job-type':
        this.selectJobType(id);
        break;
    }
  }

  handleInput(e) {
    if (!e.target.closest('.settings-page')) return;
    // 入力時の処理（必要に応じて実装）
  }

  handleChange(e) {
    if (!e.target.closest('.settings-page')) return;
    // 変更時の処理（必要に応じて実装）
  }

  // 🔧 修正版：Bootstrapモーダルベースの入力（バックドロップ問題修正）
  async promptForValue(title, message, placeholder = '', currentValue = '') {
    return new Promise((resolve) => {
      const modalId = `inputModal_${Date.now()}`;
      let modalInstance = null;
      let isResolved = false;
      
      const cleanup = () => {
        if (modalInstance) {
          try {
            modalInstance.dispose();
          } catch (e) {
            console.warn('Modal dispose error:', e);
          }
          modalInstance = null;
        }
        
        // 全ての関連要素を削除
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          modalElement.remove();
        }
        
        // バックドロップを確実に削除
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // bodyの状態をリセット
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };

      const safeResolve = (value) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(value);
        }
      };

      // 既存のモーダルとバックドロップを完全にクリーンアップ
      const existingModals = document.querySelectorAll('[id^="inputModal"]');
      existingModals.forEach(modal => modal.remove());
      
      const existingBackdrops = document.querySelectorAll('.modal-backdrop');
      existingBackdrops.forEach(backdrop => backdrop.remove());
      
      // bodyの状態をリセット
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${this.app.sanitizeHtml(title)}</h5>
                <button type="button" class="btn-close" id="modal-close-btn"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label for="inputValue" class="form-label">${this.app.sanitizeHtml(message)}</label>
                  <input type="text" class="form-control" id="inputValue" placeholder="${this.app.sanitizeHtml(placeholder)}" value="${this.app.sanitizeHtml(currentValue)}">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="modal-cancel-btn">キャンセル</button>
                <button type="button" class="btn btn-primary" id="confirmInput">確認</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // 新しいモーダルを追加
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      const modalElement = document.getElementById(modalId);
      const inputField = document.getElementById('inputValue');
      const confirmBtn = document.getElementById('confirmInput');
      const cancelBtn = document.getElementById('modal-cancel-btn');
      const closeBtn = document.getElementById('modal-close-btn');
      
      modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });

      // 確認ボタンのイベント
      confirmBtn.addEventListener('click', () => {
        const value = inputField.value.trim();
        if (value) {
          safeResolve(value);
        } else {
          inputField.classList.add('is-invalid');
          inputField.focus();
        }
      });

      // キャンセルボタンのイベント
      cancelBtn.addEventListener('click', () => {
        safeResolve(null);
      });

      // 閉じるボタンのイベント
      closeBtn.addEventListener('click', () => {
        safeResolve(null);
      });

      // Enterキーでも確認
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          confirmBtn.click();
        }
      });

      // Escapeキーでキャンセル
      modalElement.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          safeResolve(null);
        }
      });

      // 予期しないモーダル非表示時のクリーンアップ
      modalElement.addEventListener('hidden.bs.modal', () => {
        if (!isResolved) {
          safeResolve(null);
        }
      });

      // モーダル表示
      modalInstance.show();
      
      // フォーカス設定
      modalElement.addEventListener('shown.bs.modal', () => {
        inputField.focus();
        inputField.select();
      });

      // タイムアウト保護（30秒後に自動クローズ）
      setTimeout(() => {
        if (!isResolved) {
          console.warn('Modal timeout, force closing');
          safeResolve(null);
        }
      }, 30000);
    });
  }

  async addJobType() {
    try {
      const name = await this.promptForValue(
        '職種追加', 
        '職種名を入力してください',
        '例: 建設作業員'
      );
      
      if (name && name.length > 0) {
        this.saveJobType(null, name);
        this.markUnsaved();
        this.renderAll();
        this.app.showSuccess('職種を追加しました');
      }
    } catch (error) {
      console.error("Settings: Error adding job type:", error);
      this.app.showError('職種の追加に失敗しました');
    }
  }

  async addPeriod() {
    try {
      const name = await this.promptForValue(
        '評価期間追加',
        '期間名を入力してください',
        '例: 2025年 上半期'
      );
      
      if (!name) return;
      
      const startDate = await this.promptForValue(
        '開始日設定',
        '開始日を入力してください (YYYY-MM-DD)',
        new Date().toISOString().split('T')[0]
      );
      
      if (!startDate) return;
      
      const endDate = await this.promptForValue(
        '終了日設定',
        '終了日を入力してください (YYYY-MM-DD)',
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      
      if (!endDate) return;
      
      this.savePeriod(null, name, startDate, endDate);
      this.markUnsaved();
      this.renderAll();
      this.app.showSuccess('評価期間を追加しました');
    } catch (error) {
      console.error("Settings: Error adding period:", error);
      this.app.showError('評価期間の追加に失敗しました');
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
        <div class="list-group-item text-muted text-center p-4">
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
           data-action="select-job-type" data-id="${jt.id}">
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
    
    if (!this.settings.periods || this.settings.periods.length === 0) {
      list.innerHTML = `
        <div class="list-group-item text-muted text-center p-4">
          <i class="fas fa-info-circle me-2"></i>
          評価期間が登録されていません
          <br>
          <small>右上の「+」ボタンから評価期間を追加してください</small>
        </div>
      `;
      return;
    }

    list.innerHTML = (this.settings.periods || []).map(p => `
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
  async editJobType(id) {
    const jobType = this.settings.jobTypes.find(jt => jt.id === id);
    if (!jobType) return;
    
    const name = await this.promptForValue('職種編集', '職種名を入力してください', '', jobType.name);
    
    if (name && name !== jobType.name) {
      this.saveJobType(id, name);
      this.markUnsaved();
      this.renderAll();
      this.app.showSuccess('職種を更新しました');
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

  async editPeriod(id) {
    const period = this.settings.periods.find(p => p.id === id);
    if (!period) return;
    
    const name = await this.promptForValue('評価期間編集', '期間名を入力してください', '', period.name);
    if (!name) return;
    
    const startDate = await this.promptForValue('開始日編集', '開始日を入力してください (YYYY-MM-DD)', '', period.startDate);
    if (!startDate) return;
    
    const endDate = await this.promptForValue('終了日編集', '終了日を入力してください (YYYY-MM-DD)', '', period.endDate);
    if (!endDate) return;
    
    this.savePeriod(id, name, startDate, endDate);
    this.markUnsaved();
    this.renderAll();
    this.app.showSuccess('評価期間を更新しました');
  }

  deletePeriod(id) {
    if (!confirm('この評価期間を削除しますか？')) return;
    
    this.settings.periods = this.settings.periods.filter(p => p.id !== id);
    this.markUnsaved();
    this.renderAll();
    this.app.showSuccess('評価期間を削除しました');
  }

  async addCategory() {
    if (!this.selectedJobTypeId) return;
    
    const name = await this.promptForValue('カテゴリ追加', 'カテゴリ名を入力してください', '例: 技術スキル');
    
    if (name) {
      this.saveCategory(null, name);
      this.markUnsaved();
      this.renderAll();
      this.app.showSuccess('カテゴリを追加しました');
    }
  }

  async editCategory(id) {
    if (!this.selectedJobTypeId) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    const category = structure?.categories.find(c => c.id === id);
    if (!category) return;
    
    const name = await this.promptForValue('カテゴリ編集', 'カテゴリ名を入力してください', '', category.name);
    
    if (name && name !== category.name) {
      this.saveCategory(id, name);
      this.markUnsaved();
      this.renderAll();
      this.app.showSuccess('カテゴリを更新しました');
    }
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

  async addItem(parentId) {
    if (!this.selectedJobTypeId || !parentId) return;
    
    const name = await this.promptForValue('項目追加', '評価項目名を入力してください', '例: コミュニケーション能力');
    
    if (name) {
      this.saveItem(null, name, parentId);
      this.markUnsaved();
      this.renderAll();
      this.app.showSuccess('評価項目を追加しました');
    }
  }

  async editItem(id, parentId) {
    if (!this.selectedJobTypeId || !parentId) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    const category = structure?.categories.find(c => c.id === parentId);
    const item = category?.items.find(i => i.id === id);
    if (!item) return;
    
    const name = await this.promptForValue('項目編集', '評価項目名を入力してください', '', item.name);
    
    if (name && name !== item.name) {
      this.saveItem(id, name, parentId);
      this.markUnsaved();
      this.renderAll();
      this.app.showSuccess('評価項目を更新しました');
    }
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
    if (!name || name.length === 0) return;
    
    if (id) {
      const jobType = this.settings.jobTypes.find(e => e.id === id);
      if (jobType) {
        jobType.name = name;
      }
    } else {
      const newId = `jt_${Date.now()}`;
      const newJobType = { id: newId, name: name };
      this.settings.jobTypes.push(newJobType);
      this.settings.structures[newId] = { id: newId, categories: [] };
    }
  }

  savePeriod(id, name, startDate, endDate) {
    if (!startDate || !endDate || !name) {
      this.app.showError("すべてのフィールドを入力してください");
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
      const newPeriod = { 
        id: `p_${Date.now()}`, 
        name: name, 
        startDate: startDate, 
        endDate: endDate 
      };
      this.settings.periods.push(newPeriod);
    }
  }

  saveCategory(id, name) {
    if (!this.selectedJobTypeId || !name) return;
    
    if (!this.settings.structures[this.selectedJobTypeId]) {
      this.settings.structures[this.selectedJobTypeId] = { id: this.selectedJobTypeId, categories: [] };
    }
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    
    if (id) {
      const category = structure.categories.find(e => e.id === id);
      if (category) {
        category.name = name;
      }
    } else {
      const newCategory = { 
        id: `cat_${Date.now()}`, 
        name: name, 
        items: [] 
      };
      structure.categories.push(newCategory);
    }
  }

  saveItem(id, name, parentId) {
    if (!this.selectedJobTypeId || !parentId || !name) return;
    
    const structure = this.settings.structures[this.selectedJobTypeId];
    const category = structure?.categories.find(c => c.id === parentId);
    
    if (category) {
      if (id) {
        const item = category.items.find(e => e.id === id);
        if (item) {
          item.name = name;
        }
      } else {
        const newItem = { 
          id: `item_${Date.now()}`, 
          name: name 
        };
        category.items.push(newItem);
      }
    }
  }

  markUnsaved() {
    this.hasUnsavedChanges = true;
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i class="fas fa-save me-2"></i>変更を保存`;
      saveBtn.classList.remove('btn-success');
      saveBtn.classList.add('btn-warning');
    } else {
    }
  }
  
  markAsSaved() {
    this.hasUnsavedChanges = false;
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.classList.remove('btn-warning');
      saveBtn.classList.add('btn-success');
    } else {
    }
  }

  setupUnloadWarning() {
    this.unloadHandler = (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        return e.returnValue = '保存されていない変更があります。ページを離れてもよろしいですか？';
      }
    };
    window.addEventListener('beforeunload', this.unloadHandler);
  }

  // 🔧 完全修正版: saveSettings メソッド
  async saveSettings() {
    const btn = document.getElementById('save-settings-btn');
    if (!btn) {
      console.error("Settings: Save button not found");
      return;
    }
    
    // 🔧 修正: 元の状態を保存
    const originalText = btn.innerHTML;
    const originalClass = btn.className;
    const originalDisabled = btn.disabled;
    
    // 🔧 新規追加: タイムアウト設定（30秒）
    let timeoutId = null;
    
    
    try {
      // ローディング状態に設定
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> 保存中...`;
      btn.className = 'btn btn-info';
      
      // 🔧 新規追加: 30秒後に強制的にUI復元
      timeoutId = setTimeout(() => {
        const currentBtn = document.getElementById('save-settings-btn');
        if (currentBtn) {
          currentBtn.disabled = false;
          currentBtn.innerHTML = originalText;
          currentBtn.className = originalClass;
        }
        this.app.showWarning('保存処理がタイムアウトしました。再度お試しください。');
      }, 30000);
      
      
      // 🔧 修正: Promise.race でタイムアウト制御
      const savePromise = this.app.api.saveSettings(this.settings);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Save timeout')), 25000);
      });
      
      await Promise.race([savePromise, timeoutPromise]);
      
      // 🔧 修正: タイムアウトをクリア
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      
      // 🔧 修正: 成功時のUI更新を確実に実行
      this.markAsSaved();
      this.app.showSuccess('設定を保存しました');
      
      // 🔧 修正: ボタン状態を成功表示に変更
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-check me-2"></i>保存完了`;
      btn.className = 'btn btn-success';
      
      // 🔧 修正: 3秒後に元の状態に戻す
      setTimeout(() => {
        try {
          const currentBtn = document.getElementById('save-settings-btn');
          if (currentBtn) {
            currentBtn.disabled = true; // 変更がないため無効化
            currentBtn.innerHTML = `<i class="fas fa-save me-2"></i>変更を保存`;
            currentBtn.className = 'btn btn-success';
          }
        } catch (resetError) {
          // Error resetting button state - silent fail
        }
      }, 3000);
      
    } catch (error) {
      console.error("Settings: Save error:", error);
      
      // 🔧 修正: タイムアウトをクリア
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // 🔧 修正: エラー時のUI復元を確実に実行
      try {
        const currentBtn = document.getElementById('save-settings-btn');
        if (currentBtn) {
          currentBtn.disabled = false;
          currentBtn.innerHTML = originalText;
          currentBtn.className = originalClass;
        }
      } catch (uiError) {
        console.error("Settings: Error restoring button UI:", uiError);
      }
      
      // 🔧 修正: エラーメッセージの改善
      if (error.message === 'Save timeout') {
        this.app.showError('保存処理がタイムアウトしました。ネットワーク接続を確認してください。');
      } else {
        this.app.showError('設定の保存に失敗しました: ' + error.message);
      }
    }
  }

  // 🔧 新規追加: 強制UI復元機能（デバッグ用）
  resetSaveButtonState() {
    const btn = document.getElementById('save-settings-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-save me-2"></i>変更を保存`;
      btn.className = 'btn btn-success';
    }
  }

  cleanup() {
    try {
      // イベントリスナーのクリーンアップ
      if (this.boundHandlers) {
        document.removeEventListener('click', this.boundHandlers.click);
        document.removeEventListener('input', this.boundHandlers.input);
        document.removeEventListener('change', this.boundHandlers.change);
        this.boundHandlers = null;
      }
      
      if (this.unloadHandler) {
        window.removeEventListener('beforeunload', this.unloadHandler);
      }
      
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
