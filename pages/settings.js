// careeconplus/evaluationsystem/Evaluationsystem-main/pages/settings.js

/**
 * Settings Page Component (Firebase Integrated & Fully Functional)
 * 設定ページコンポーネント（Firebase連携・完全機能版）
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
      <div class="settings-page p-4">
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
                <button class="btn btn-sm btn-primary" id="add-job-type-btn" title="職種を追加"><i class="fas fa-plus"></i></button>
              </div>
              <div class="list-group list-group-flush" id="job-types-list"></div>
            </div>
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0" data-i18n="settings.evaluation_periods"></h5>
                <button class="btn btn-sm btn-primary" id="add-period-btn" title="期間を追加"><i class="fas fa-plus"></i></button>
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
      </div>
      ${this.renderPeriodModal()}
    `;
  }

  async init() {
    if (this.app.currentUser.role !== 'admin') {
      this.app.navigate('#/dashboard');
      return;
    }
    this.app.currentPage = this;
    
    await this.loadData();
    this.setupEventListeners();
    
    window.onbeforeunload = (e) => {
        if (this.hasUnsavedChanges) {
            e.preventDefault();
            return e.returnValue = this.app.i18n.t('settings.unsaved_warning');
        }
    };
  }

  setupEventListeners() {
      document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
      document.getElementById('add-job-type-btn').addEventListener('click', () => this.addJobType());
      document.getElementById('add-period-btn').addEventListener('click', () => this.openPeriodModal());
      
      const periodModal = document.getElementById('periodModal');
      periodModal.addEventListener('click', (e) => {
          if (e.target.id === 'save-period-btn') {
              this.savePeriod();
          }
      });
  }

  async loadData() {
    try {
        this.settings = await this.app.api.getSettings();
        this.renderSidebars();
        this.app.i18n.updateUI();
    } catch(e) {
        this.app.showError(this.app.i18n.t('errors.loading_failed'));
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
            <span>
                <button class="btn btn-sm btn-outline-primary border-0 me-1" data-edit-id="${jt.id}" title="編集"><i class="fas fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger border-0" data-delete-id="${jt.id}" title="削除"><i class="fas fa-trash"></i></button>
            </span>
        </a>`).join('');
    
    list.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const editBtn = e.target.closest('[data-edit-id]');
            const deleteBtn = e.target.closest('[data-delete-id]');

            if (editBtn) {
                this.editJobType(editBtn.dataset.editId);
            } else if (deleteBtn) {
                this.deleteJobType(deleteBtn.dataset.deleteId);
            } else {
                this.selectJobType(a.dataset.id);
            }
        });
    });
  }

  renderPeriodsList() {
    const list = document.getElementById('periods-list');
    list.innerHTML = this.settings.periods.map(p => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <div>${this.app.sanitizeHtml(p.name)}</div>
                <small class="text-muted">${this.app.formatDate(p.startDate)} - ${this.app.formatDate(p.endDate)}</small>
            </div>
            <span>
                <button class="btn btn-sm btn-outline-primary border-0 me-1" onclick="window.app.currentPage.openPeriodModal('${p.id}')" title="編集"><i class="fas fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger border-0" onclick="window.app.currentPage.deletePeriod('${p.id}')" title="削除"><i class="fas fa-trash"></i></button>
            </span>
        </div>`).join('');
  }

  selectJobType(id) {
    if (this.hasUnsavedChanges && !confirm(this.app.i18n.t('settings.unsaved_warning'))) {
        return;
    }
    this.selectedJobTypeId = id;
    this.hasUnsavedChanges = false; // Reset on selection change
    document.getElementById('save-settings-btn').disabled = true;
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

    editor.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>${this.app.sanitizeHtml(jobType.name)} <span data-i18n="settings.evaluation_structure_of"></span></h4>
            <button class="btn btn-outline-primary" id="add-category-btn"><i class="fas fa-plus me-2"></i><span data-i18n="settings.add_category"></span></button>
        </div>
        <div id="categories-container" class="accordion">
            ${structure.categories.map((cat, catIndex) => this.renderCategory(cat, catIndex)).join('') || `<p class="text-muted text-center p-3" data-i18n="settings.no_categories_hint"></p>`}
        </div>
    `;
    this.app.i18n.updateUI(editor);
    this.setupStructureEditorEventListeners();
  }

  setupStructureEditorEventListeners() {
      document.getElementById('add-category-btn').addEventListener('click', () => this.addCategory());
      
      const container = document.getElementById('categories-container');
      container.addEventListener('click', e => {
          const target = e.target;
          if(target.closest('[data-action="add-item"]')) {
              const catIndex = target.closest('[data-action="add-item"]').dataset.catIndex;
              this.addItem(catIndex);
          }
          if(target.closest('[data-action="delete-category"]')) {
              const catIndex = target.closest('[data-action="delete-category"]').dataset.catIndex;
              this.deleteCategory(catIndex);
          }
           if(target.closest('[data-action="delete-item"]')) {
              const catIndex = target.closest('[data-action="delete-item"]').dataset.catIndex;
              const itemIndex = target.closest('[data-action="delete-item"]').dataset.itemIndex;
              this.deleteItem(catIndex, itemIndex);
          }
      });
      container.addEventListener('input', e => {
          const target = e.target;
          const catIndex = target.dataset.catIndex;
          const itemIndex = target.dataset.itemIndex;
          if (target.matches('[data-role="category-name"]')) {
              this.updateCategoryName(catIndex, target.value);
          }
          if (target.matches('[data-role="item-name"]')) {
              this.updateItemName(catIndex, itemIndex, target.value);
          }
      });
  }

  renderCategory(category, catIndex) {
      const isExpanded = true; 
      return `
      <div class="accordion-item" id="category-${catIndex}">
        <h2 class="accordion-header">
          <button class="accordion-button ${isExpanded ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${catIndex}">
            <input type="text" class="form-control form-control-sm border-0 fw-bold" value="${this.app.sanitizeHtml(category.name)}" data-role="category-name" data-cat-index="${catIndex}" placeholder="${this.app.i18n.t('settings.category_name_placeholder')}">
          </button>
        </h2>
        <div id="collapse-${catIndex}" class="accordion-collapse collapse ${isExpanded ? 'show' : ''}">
          <div class="accordion-body">
            <ul class="list-group">
                ${category.items.map((item, itemIndex) => this.renderItem(item, catIndex, itemIndex)).join('')}
                <li class="list-group-item d-grid">
                    <button class="btn btn-sm btn-outline-secondary" data-action="add-item" data-cat-index="${catIndex}"><i class="fas fa-plus me-1"></i><span data-i18n="settings.add_item"></span></button>
                </li>
            </ul>
            <div class="mt-3 text-end">
                <button class="btn btn-sm btn-danger" data-action="delete-category" data-cat-index="${catIndex}"><i class="fas fa-trash me-1"></i><span data-i18n="settings.delete_category"></span></button>
            </div>
          </div>
        </div>
      </div>
      `;
  }
  
  renderItem(item, catIndex, itemIndex) {
      return `
      <li class="list-group-item d-flex align-items-center">
          <input type="text" class="form-control form-control-sm border-0" value="${this.app.sanitizeHtml(item.name)}" data-role="item-name" data-cat-index="${catIndex}" data-item-index="${itemIndex}" placeholder="${this.app.i18n.t('settings.item_name_placeholder')}">
          <button class="btn btn-sm btn-outline-danger border-0" data-action="delete-item" data-cat-index="${catIndex}" data-item-index="${itemIndex}" title="項目を削除"><i class="fas fa-times"></i></button>
      </li>
      `;
  }
  
  addJobType() {
    const name = prompt(this.app.i18n.t('settings.job_type_name_placeholder'));
    if (name) {
      const newJobType = { id: `jt_${Date.now()}`, name };
      this.settings.jobTypes.push(newJobType);
      this.settings.structures[newJobType.id] = { id: newJobType.id, name: name, categories: [] };
      this.markUnsaved();
      this.renderJobTypesList();
    }
  }

  editJobType(id) {
    const jobType = this.settings.jobTypes.find(jt => jt.id === id);
    const newName = prompt(this.app.i18n.t('settings.edit_job_type_name_placeholder'), jobType.name);
    if (newName && newName !== jobType.name) {
      jobType.name = newName;
      this.markUnsaved();
      this.renderJobTypesList();
    }
  }

  deleteJobType(id) {
    if (confirm(this.app.i18n.t('settings.confirm_delete_job_type'))) {
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

  addCategory() {
      if (!this.selectedJobTypeId) return;
      this.settings.structures[this.selectedJobTypeId].categories.push({ id: `cat_${Date.now()}`, name: '', items: [] });
      this.markUnsaved();
      this.renderStructureEditor();
  }
  
  updateCategoryName(catIndex, name) {
      this.settings.structures[this.selectedJobTypeId].categories[catIndex].name = name;
      this.markUnsaved();
  }

  deleteCategory(catIndex) {
      if(confirm(this.app.i18n.t('settings.confirm_delete_category'))) {
          this.settings.structures[this.selectedJobTypeId].categories.splice(catIndex, 1);
          this.markUnsaved();
          this.renderStructureEditor();
      }
  }

  addItem(catIndex) {
      this.settings.structures[this.selectedJobTypeId].categories[catIndex].items.push({ id: `item_${Date.now()}`, name: '' });
      this.markUnsaved();
      this.renderStructureEditor();
  }
  
  updateItemName(catIndex, itemIndex, name) {
      this.settings.structures[this.selectedJobTypeId].categories[catIndex].items[itemIndex].name = name;
      this.markUnsaved();
  }

  deleteItem(catIndex, itemIndex) {
      if(confirm(this.app.i18n.t('settings.confirm_delete_item'))) {
          this.settings.structures[this.selectedJobTypeId].categories[catIndex].items.splice(itemIndex, 1);
          this.markUnsaved();
          this.renderStructureEditor();
      }
  }
  
  renderPeriodModal() {
      return `
      <div class="modal fade" id="periodModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="periodModalLabel"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="periodForm">
                <input type="hidden" id="periodId">
                <div class="mb-3">
                  <label for="periodName" class="form-label" data-i18n="settings.period_name_label"></label>
                  <input type="text" class="form-control" id="periodName" required>
                </div>
                <div class="mb-3">
                  <label for="startDate" class="form-label" data-i18n="settings.start_date_label"></label>
                  <input type="date" class="form-control" id="startDate" required>
                </div>
                <div class="mb-3">
                  <label for="endDate" class="form-label" data-i18n="settings.end_date_label"></label>
                  <input type="date" class="form-control" id="endDate" required>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
              <button type="button" class="btn btn-primary" id="save-period-btn" data-i18n="common.save"></button>
            </div>
          </div>
        </div>
      </div>
      `;
  }

  openPeriodModal(id = null) {
      const modalEl = document.getElementById('periodModal');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      const form = document.getElementById('periodForm');
      form.reset();
      const modalLabel = document.getElementById('periodModalLabel');

      if (id) {
          modalLabel.textContent = this.app.i18n.t('settings.edit_period');
          const period = this.settings.periods.find(p => p.id === id);
          document.getElementById('periodId').value = period.id;
          document.getElementById('periodName').value = period.name;
          document.getElementById('startDate').value = period.startDate.split('T')[0]; // Format for date input
          document.getElementById('endDate').value = period.endDate.split('T')[0];
      } else {
          modalLabel.textContent = this.app.i18n.t('settings.add_period');
      }
      this.app.i18n.updateUI(modalEl);
      modal.show();
  }

  savePeriod() {
      const id = document.getElementById('periodId').value;
      const name = document.getElementById('periodName').value;
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;

      if (!name || !startDate || !endDate) {
          this.app.showError(this.app.i18n.t('errors.all_fields_required'));
          return;
      }
      
      if (id) {
          const period = this.settings.periods.find(p => p.id === id);
          period.name = name;
          period.startDate = startDate;
          period.endDate = endDate;
      } else {
          this.settings.periods.push({
              id: `p_${Date.now()}`,
              name,
              startDate,
              endDate
          });
      }
      this.markUnsaved();
      this.renderPeriodsList();
      bootstrap.Modal.getInstance(document.getElementById('periodModal')).hide();
  }

  deletePeriod(id) {
      if(confirm(this.app.i18n.t('settings.confirm_delete_period'))) {
          this.settings.periods = this.settings.periods.filter(p => p.id !== id);
          this.markUnsaved();
          this.renderPeriodsList();
      }
  }

  markUnsaved() {
    this.hasUnsavedChanges = true;
    document.getElementById('save-settings-btn').disabled = false;
  }

  async saveSettings() {
    const btn = document.getElementById('save-settings-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${this.app.i18n.t('common.loading')}`;
    try {
      await this.app.api.saveSettings(this.settings);
      this.hasUnsavedChanges = false;
      this.app.showSuccess(this.app.i18n.t('messages.save_success'));
    } catch (e) {
      this.app.showError(e.message);
    } finally {
        btn.disabled = true; // Still disabled until next change
        btn.innerHTML = `<i class="fas fa-save me-2"></i><span data-i18n="settings.save_changes"></span>`;
        this.app.i18n.updateUI(btn);
    }
  }
}
