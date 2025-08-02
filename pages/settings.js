/**
 * Settings Page Component (Firebase Integrated)
 * 設定ページコンポーネント（Firebase連携版）
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
  }

  async render() {
    return `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 data-i18n="settings.title"></h1>
        <button id="save-settings-btn" class="btn btn-success" disabled>
          <i class="fas fa-save me-2"></i><span data-i18n="settings.save_changes"></span>
        </button>
      </div>
      <div class="settings-layout">
        <div class="settings-sidebar">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0" data-i18n="settings.job_types"></h5>
              <button class="btn btn-sm btn-primary" id="add-job-type-btn"><i class="fas fa-plus"></i></button>
            </div>
            <div class="list-group list-group-flush" id="job-types-list"></div>
          </div>
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0" data-i18n="settings.evaluation_periods"></h5>
              <button class="btn btn-sm btn-primary" id="add-period-btn"><i class="fas fa-plus"></i></button>
            </div>
            <div class="list-group list-group-flush" id="periods-list"></div>
          </div>
        </div>
        <div class="settings-main card">
          <div class="card-body" id="structure-editor">
            <div class="text-center p-5 text-muted" data-i18n="settings.select_job_type_hint"></div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    if (this.app.currentUser.role !== 'admin') {
      this.app.navigate('#/dashboard');
      return;
    }
    this.app.currentPage = this;
    
    document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
    document.getElementById('add-job-type-btn').addEventListener('click', () => this.addJobType());
    document.getElementById('add-period-btn').addEventListener('click', () => this.addPeriod());

    await this.loadData();
    
    window.onbeforeunload = (e) => {
        if (this.hasUnsavedChanges) {
            e.preventDefault();
            return e.returnValue = this.app.i18n.t('settings.unsaved_warning');
        }
    };
  }

  async loadData() {
    try {
        this.settings = await this.app.api.getSettings();
        this.renderSidebars();
        this.app.i18n.updateUI();
    } catch(e) {
        this.app.showError("設定データの読み込みに失敗しました。");
        console.error(e);
    }
  }

  renderSidebars() {
    this.renderJobTypesList();
    this.renderPeriodsList();
  }

  renderJobTypesList() {
    const list = document.getElementById('job-types-list');
    list.innerHTML = this.settings.jobTypes.map(jt => `
        <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${this.selectedJobTypeId === jt.id ? 'active' : ''}" data-id="${jt.id}">
            ${this.app.sanitizeHtml(jt.name)}
            <button class="btn btn-sm btn-outline-danger border-0" data-delete-id="${jt.id}"><i class="fas fa-trash"></i></button>
        </a>`).join('');
    
    list.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.closest('button')) {
                this.deleteJobType(e.target.closest('button').dataset.deleteId);
            } else {
                this.selectJobType(a.dataset.id);
            }
        });
    });
  }

  renderPeriodsList() {
    const list = document.getElementById('periods-list');
    list.innerHTML = this.settings.periods.map(p => `
        <div class="list-group-item">
            <div>${this.app.sanitizeHtml(p.name)}</div>
            <small class="text-muted">${this.app.formatDate(p.startDate)} - ${this.app.formatDate(p.endDate)}</small>
        </div>`).join('');
  }

  selectJobType(id) {
    if (this.hasUnsavedChanges && !confirm(this.app.i18n.t('settings.unsaved_warning'))) {
        return;
    }
    this.selectedJobTypeId = id;
    this.renderStructureEditor();
    this.renderJobTypesList();
  }

  renderStructureEditor() {
    const editor = document.getElementById('structure-editor');
    if (!this.selectedJobTypeId) {
      editor.innerHTML = `<div class="text-center p-5 text-muted" data-i18n="settings.select_job_type_hint"></div>`;
      this.app.i18n.updateUI(editor);
      return;
    }
    
    const jobType = this.settings.jobTypes.find(jt => jt.id === this.selectedJobTypeId);
    const structure = this.settings.structures[this.selectedJobTypeId] || { id: this.selectedJobTypeId, categories: [] };

    let html = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>${this.app.sanitizeHtml(jobType.name)} <span data-i18n="settings.evaluation_structure_of"></span></h4>
            <button class="btn btn-outline-primary btn-sm" id="add-category-btn"><i class="fas fa-plus me-2"></i><span data-i18n="settings.add_category"></span></button>
        </div>
        <div id="categories-container">
            ${structure.categories.map((cat, catIndex) => this.renderCategory(cat, catIndex)).join('')}
        </div>
    `;
    editor.innerHTML = html;
    document.getElementById('add-category-btn').addEventListener('click', () => this.addCategory());
    this.app.i18n.updateUI(editor);
  }

  renderCategory(category, catIndex) { /* ... UI for category ... */ return ''; }
  
  addJobType() {
    const name = prompt(this.app.i18n.t('settings.job_type_name'));
    if (name) {
      this.settings.jobTypes.push({ id: `jt_${Date.now()}`, name });
      this.markUnsaved();
      this.renderJobTypesList();
    }
  }

  deleteJobType(id) {
    if (confirm('この職種を削除しますか？')) {
        this.settings.jobTypes = this.settings.jobTypes.filter(jt => jt.id !== id);
        delete this.settings.structures[id];
        if (this.selectedJobTypeId === id) {
            this.selectedJobTypeId = null;
            this.renderStructureEditor();
        }
        this.markUnsaved();
        this.renderJobTypesList();
    }
  }

  addPeriod() { /* ... Logic to show a modal for adding a period ... */ }

  markUnsaved() {
    this.hasUnsavedChanges = true;
    document.getElementById('save-settings-btn').disabled = false;
  }

  async saveSettings() {
    const btn = document.getElementById('save-settings-btn');
    btn.disabled = true;
    try {
      await this.app.api.saveSettings(this.settings);
      this.hasUnsavedChanges = false;
      this.app.showSuccess(this.app.i18n.t('messages.save_success'));
    } catch (e) {
      this.app.showError(e.message);
      btn.disabled = false;
    }
  }
}
