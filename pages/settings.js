/**
 * Settings Page Component (Firebase Integrated & Fully Functional with Modals)
 * 設定ページコンポーネント（Firebase連携・モーダルによる完全機能版）
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
      ${this.renderEditModal()}
    `;
  }

  async init() {
    if (this.app.currentUser.role !== 'admin') {
      this.app.navigate('#/dashboard');
      return;
    }
    this.app.currentPage = this;
    this.editModal = new bootstrap.Modal(document.getElementById('editModal'));
    
    await this.loadData();
    this.setupEventListeners();
    
    window.onbeforeunload = (e) => {
        if (this.hasUnsavedChanges) {
            e.preventDefault();
            return e.returnValue = this.app.i18n.t('settings.unsaved_warning');
        }
    };
  }
  
  // ... (The rest of the file is heavily modified, so replace the whole file)

  setupEventListeners() {
      document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
      document.getElementById('add-job-type-btn').addEventListener('click', () => this.openEditModal('jobType'));
      document.getElementById('add-period-btn').addEventListener('click', () => this.openEditModal('period'));
      document.getElementById('save-modal-btn').addEventListener('click', () => this.saveFromModal());
  }

  async loadData() {
    try {
        this.settings = await this.app.api.getSettings();
        this.renderAll();
    } catch(e) {
        this.app.showError(this.app.i18n.t('errors.loading_failed'));
        console.error(e);
    }
  }

  renderAll() {
      this.renderJobTypesList();
      this.renderPeriodsList();
      this.renderStructureEditor();
      this.app.i18n.updateUI();
  }

  renderJobTypesList() {
    const list = document.getElementById('job-types-list');
    list.innerHTML = this.settings.jobTypes.map(jt => `
        <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${this.selectedJobTypeId === jt.id ? 'active' : ''}" data-id="${jt.id}">
            <span class="flex-grow-1">${this.app.sanitizeHtml(jt.name)}</span>
            <span class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary border-0" onclick="event.stopPropagation(); window.app.currentPage.openEditModal('jobType', '${jt.id}')"><i class="fas fa-pen"></i></button>
                <button class="btn btn-outline-danger border-0" onclick="event.stopPropagation(); window.app.currentPage.deleteJobType('${jt.id}')"><i class="fas fa-trash"></i></button>
            </span>
        </a>`).join('') || `<li class="list-group-item text-muted" data-i18n="settings.no_job_types"></li>`;
    list.querySelectorAll('a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); this.selectJobType(a.dataset.id); }));
  }

  renderPeriodsList() {
    const list = document.getElementById('periods-list');
    list.innerHTML = this.settings.periods.map(p => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <div>${this.app.sanitizeHtml(p.name)}</div>
                <small class="text-muted">${this.app.formatDate(p.startDate)} - ${this.app.formatDate(p.endDate)}</small>
            </div>
            <span class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary border-0" onclick="window.app.currentPage.openEditModal('period', '${p.id}')"><i class="fas fa-pen"></i></button>
                <button class="btn btn-outline-danger border-0" onclick="window.app.currentPage.deletePeriod('${p.id}')"><i class="fas fa-trash"></i></button>
            </span>
        </div>`).join('') || `<li class="list-group-item text-muted" data-i18n="settings.no_evaluation_periods"></li>`;
  }

  selectJobType(id) {
    if (this.hasUnsavedChanges && !confirm(this.app.i18n.t('settings.unsaved_warning'))) return;
    this.selectedJobTypeId = id;
    this.markAsSaved();
    this.renderAll();
  }

  renderStructureEditor() {
    const editor = document.getElementById('structure-editor');
    if (!this.selectedJobTypeId) {
      editor.innerHTML = `<div class="text-center p-5 text-muted" data-i18n="settings.select_job_type_hint"></div>`;
      return;
    }
    
    const jobType = this.settings.jobTypes.find(jt => jt.id === this.selectedJobTypeId);
    const structure = this.settings.structures[this.selectedJobTypeId] || { id: this.selectedJobTypeId, categories: [] };

    editor.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>${this.app.sanitizeHtml(jobType.name)} <span data-i18n="settings.evaluation_structure_of"></span></h4>
            <button class="btn btn-outline-primary" onclick="window.app.currentPage.openEditModal('category')"><i class="fas fa-plus me-2"></i><span data-i18n="settings.add_category"></span></button>
        </div>
        <div id="categories-container" class="accordion">
            ${structure.categories.map((cat, catIndex) => this.renderCategory(cat, catIndex)).join('') || `<p class="text-muted text-center p-3" data-i18n="settings.no_categories_hint"></p>`}
        </div>
    `;
  }

  renderCategory(category, catIndex) {
      return `
      <div class="accordion-item">
        <h2 class="accordion-header d-flex align-items-center">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${catIndex}">${this.app.sanitizeHtml(category.name)}</button>
          <div class="btn-group btn-group-sm p-2">
             <button class="btn btn-outline-primary border-0" onclick="window.app.currentPage.openEditModal('category', '${category.id}')"><i class="fas fa-pen"></i></button>
             <button class="btn btn-outline-danger border-0" onclick="window.app.currentPage.deleteCategory('${category.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </h2>
        <div id="collapse-${catIndex}" class="accordion-collapse collapse show">
          <div class="accordion-body">
            <ul class="list-group">
                ${category.items.map((item) => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${this.app.sanitizeHtml(item.name)}
                        <span class="btn-group btn-group-sm">
                           <button class="btn btn-outline-primary border-0" onclick="window.app.currentPage.openEditModal('item', '${item.id}', '${category.id}')"><i class="fas fa-pen"></i></button>
                           <button class="btn btn-outline-danger border-0" onclick="window.app.currentPage.deleteItem('${item.id}', '${category.id}')"><i class="fas fa-trash"></i></button>
                        </span>
                    </li>
                `).join('')}
                <li class="list-group-item d-grid">
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.app.currentPage.openEditModal('item', null, '${category.id}')"><i class="fas fa-plus me-1"></i><span data-i18n="settings.add_item"></span></button>
                </li>
            </ul>
          </div>
        </div>
      </div>`;
  }

  renderEditModal() {
      return `<div class="modal fade" id="editModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title" id="editModalLabel"></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><form id="editForm"></form></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
          <button type="button" class="btn btn-primary" id="save-modal-btn" data-i18n="common.save"></button>
        </div>
      </div></div></div>`;
  }
  
  openEditModal(type, id = null, parentId = null) {
      const form = document.getElementById('editForm');
      const label = document.getElementById('editModalLabel');
      form.innerHTML = '';
      form.dataset.type = type;
      form.dataset.id = id;
      form.dataset.parentId = parentId;

      let titleKey = `settings.add_${type}`;
      let entity = {};

      if (id) {
          titleKey = `settings.edit_${type}`;
          if (type === 'jobType') entity = this.settings.jobTypes.find(e => e.id === id);
          if (type === 'period') entity = this.settings.periods.find(e => e.id === id);
          if (type === 'category') entity = this.settings.structures[this.selectedJobTypeId].categories.find(e => e.id === id);
          if (type === 'item') entity = this.settings.structures[this.selectedJobTypeId].categories.find(c => c.id === parentId).items.find(e => e.id === id);
      }
      
      label.setAttribute('data-i18n', titleKey);

      if (type === 'jobType' || type === 'category' || type === 'item') {
          form.innerHTML = `<div class="mb-3"><label for="name" class="form-label" data-i18n="settings.name_label"></label><input type="text" id="name" class="form-control" value="${this.app.sanitizeHtml(entity.name || '')}" required></div>`;
      } else if (type === 'period') {
          form.innerHTML = `
              <div class="mb-3"><label for="name" class="form-label" data-i18n="settings.period_name_label"></label><input type="text" id="name" class="form-control" value="${this.app.sanitizeHtml(entity.name || '')}" required></div>
              <div class="mb-3"><label for="startDate" class="form-label" data-i18n="settings.start_date_label"></label><input type="date" id="startDate" class="form-control" value="${entity.startDate ? entity.startDate.split('T')[0] : ''}" required></div>
              <div class="mb-3"><label for="endDate" class="form-label" data-i18n="settings.end_date_label"></label><input type="date" id="endDate" class="form-control" value="${entity.endDate ? entity.endDate.split('T')[0] : ''}" required></div>`;
      }
      
      this.app.i18n.updateUI(form.parentElement.parentElement);
      this.editModal.show();
  }

  saveFromModal() {
      const form = document.getElementById('editForm');
      const { type, id, parentId } = form.dataset;
      const name = form.querySelector('#name')?.value;

      if (type === 'jobType') {
          if (!name) return;
          if (id) this.settings.jobTypes.find(e => e.id === id).name = name;
          else {
              const newId = `jt_${Date.now()}`;
              this.settings.jobTypes.push({ id: newId, name });
              this.settings.structures[newId] = { id: newId, categories: [] };
          }
      } else if (type === 'period') {
          const startDate = form.querySelector('#startDate').value;
          const endDate = form.querySelector('#endDate').value;
          if (!name || !startDate || !endDate) return;
          if (id) Object.assign(this.settings.periods.find(e => e.id === id), { name, startDate, endDate });
          else this.settings.periods.push({ id: `p_${Date.now()}`, name, startDate, endDate });
      } else if (type === 'category') {
          if (!name) return;
          const structure = this.settings.structures[this.selectedJobTypeId];
          if (id) structure.categories.find(e => e.id === id).name = name;
          else structure.categories.push({ id: `cat_${Date.now()}`, name, items: [] });
      } else if (type === 'item') {
          if (!name) return;
          const category = this.settings.structures[this.selectedJobTypeId].categories.find(c => c.id === parentId);
          if (id) category.items.find(e => e.id === id).name = name;
          else category.items.push({ id: `item_${Date.now()}`, name });
      }

      this.markUnsaved();
      this.renderAll();
      this.editModal.hide();
  }

  deleteJobType(id) {
      if (!confirm(this.app.i18n.t('settings.confirm_delete_job_type'))) return;
      this.settings.jobTypes = this.settings.jobTypes.filter(jt => jt.id !== id);
      delete this.settings.structures[id];
      if (this.selectedJobTypeId === id) this.selectedJobTypeId = null;
      this.markUnsaved();
      this.renderAll();
  }

  deletePeriod(id) {
      if (!confirm(this.app.i18n.t('settings.confirm_delete_period'))) return;
      this.settings.periods = this.settings.periods.filter(p => p.id !== id);
      this.markUnsaved();
      this.renderAll();
  }

  deleteCategory(id) {
      if (!confirm(this.app.i18n.t('settings.confirm_delete_category'))) return;
      const structure = this.settings.structures[this.selectedJobTypeId];
      structure.categories = structure.categories.filter(c => c.id !== id);
      this.markUnsaved();
      this.renderAll();
  }
  
  deleteItem(id, parentId) {
      if (!confirm(this.app.i18n.t('settings.confirm_delete_item'))) return;
      const category = this.settings.structures[this.selectedJobTypeId].categories.find(c => c.id === parentId);
      category.items = category.items.filter(i => i.id !== id);
      this.markUnsaved();
      this.renderAll();
  }

  markUnsaved() {
    this.hasUnsavedChanges = true;
    document.getElementById('save-settings-btn').disabled = false;
  }
  
  markAsSaved() {
      this.hasUnsavedChanges = false;
      document.getElementById('save-settings-btn').disabled = true;
  }

  async saveSettings() {
    const btn = document.getElementById('save-settings-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${this.app.i18n.t('common.loading')}`;
    try {
      await this.app.api.saveSettings(this.settings);
      this.markAsSaved();
      this.app.showSuccess(this.app.i18n.t('messages.save_success'));
    } catch (e) {
      this.app.showError(e.message);
      btn.disabled = false;
    } finally {
        btn.innerHTML = `<i class="fas fa-save me-2"></i><span data-i18n="settings.save_changes"></span>`;
        this.app.i18n.updateUI(btn);
    }
  }
}
