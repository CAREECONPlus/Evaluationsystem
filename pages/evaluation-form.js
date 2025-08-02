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
    this.periodModal = null;
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

      <!-- Period Modal -->
      <div class="modal fade" id="periodModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="periodModalTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="periodForm">
              <div class="modal-body">
                  <input type="hidden" id="periodId">
                  <div class="mb-3">
                      <label for="periodName" class="form-label" data-i18n="settings.period_name_label"></label>
                      <input type="text" id="periodName" class="form-control" required>
                  </div>
                  <div class="mb-3">
                      <label for="periodStartDate" class="form-label" data-i18n="settings.start_date_label"></label>
                      <input type="date" id="periodStartDate" class="form-control" required>
                  </div>
                  <div class="mb-3">
                      <label for="periodEndDate" class="form-label" data-i18n="settings.end_date_label"></label>
                      <input type="date" id="periodEndDate" class="form-control" required>
                  </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
                <button type="submit" class="btn btn-primary" data-i18n="common.save"></button>
              </div>
            </form>
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
    
    this.periodModal = new bootstrap.Modal(document.getElementById('periodModal'));

    document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
    document.getElementById('add-job-type-btn').addEventListener('click', () => this.addJobType());
    document.getElementById('add-period-btn').addEventListener('click', () => this.showPeriodModal());
    document.getElementById('periodForm').addEventListener('submit', (e) => this.handlePeriodFormSubmit(e));

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
            <button class="btn btn-sm btn-outline-danger border-0" data-delete-id="${jt.id}" title="削除"><i class="fas fa-trash"></i></button>
        </a>`).join('');
    
    list.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const deleteButton = e.target.closest('button');
            if (deleteButton) {
                e.stopPropagation();
                this.deleteJobType(deleteButton.dataset.deleteId);
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
            <div>
                <button class="btn btn-sm btn-outline-primary border-0" title="編集" onclick="window.app.currentPage.showPeriodModal('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger border-0" title="削除" onclick="window.app.currentPage.deletePeriod('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>
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

    editor.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>${this.app.sanitizeHtml(jobType.name)} <span data-i18n="settings.evaluation_structure_of"></span></h4>
            <button class="btn btn-outline-primary btn-sm" id="add-category-btn"><i class="fas fa-plus me-2"></i><span data-i18n="settings.add_category"></span></button>
        </div>
        <div id="categories-container">
            ${structure.categories.map((cat, catIndex) => this.renderCategory(cat, catIndex)).join('')}
        </div>`;
        
    document.getElementById('add-category-btn').addEventListener('click', () => this.addCategory());
    this.app.i18n.updateUI(editor);
  }

  renderCategory(category, catIndex) {
    return `
        <div class="card mb-3 bg-light">
            <div class="card-header d-flex align-items-center">
                <input type="text" class="form-control fw-bold" value="${this.app.sanitizeHtml(category.name)}" onchange="window.app.currentPage.updateCategoryName(${catIndex}, this.value)">
                <button class="btn btn-sm btn-outline-danger border-0 ms-2" onclick="window.app.currentPage.deleteCategory(${catIndex})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="list-group list-group-flush">
                ${category.items.map((item, itemIndex) => this.renderItem(item, catIndex, itemIndex)).join('')}
                <div class="list-group-item">
                    <button class="btn btn-secondary btn-sm w-100" onclick="window.app.currentPage.addItem(${catIndex})"><i class="fas fa-plus me-2"></i><span data-i18n="settings.add_item"></span></button>
                </div>
            </div>
        </div>`;
  }

  renderItem(item, catIndex, itemIndex) {
      return `
        <div class="list-group-item d-flex align-items-center gap-2">
            <input type="text" class="form-control form-control-sm" value="${this.app.sanitizeHtml(item.name)}" onchange="window.app.currentPage.updateItem(${catIndex}, ${itemIndex}, 'name', this.value)">
            <select class="form-select form-select-sm" style="width: 150px;" onchange="window.app.currentPage.updateItem(${catIndex}, ${itemIndex}, 'type', this.value)">
                <option value="quantitative" ${item.type === 'quantitative' ? 'selected' : ''} data-i18n="settings.quantitative"></option>
                <option value="qualitative" ${item.type === 'qualitative' ? 'selected' : ''} data-i18n="settings.qualitative"></option>
            </select>
            <button class="btn btn-sm btn-outline-danger border-0" onclick="window.app.currentPage.deleteItem(${catIndex}, ${itemIndex})"><i class="fas fa-times"></i></button>
        </div>`;
  }
  
  addJobType() {
    const name = prompt(this.app.i18n.t('settings.job_type_name'));
    if (name && name.trim()) {
      const newId = `jt_${Date.now()}`;
      this.settings.jobTypes.push({ id: newId, name: name.trim() });
      this.settings.structures[newId] = { id: newId, categories: [] };
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

  showPeriodModal(id = null) {
    const form = document.getElementById('periodForm');
    form.reset();
    const title = document.getElementById('periodModalTitle');
    if (id) {
        const period = this.settings.periods.find(p => p.id === id);
        title.textContent = this.app.i18n.t('settings.edit_period');
        document.getElementById('periodId').value = period.id;
        document.getElementById('periodName').value = period.name;
        document.getElementById('periodStartDate').value = period.startDate;
        document.getElementById('periodEndDate').value = period.endDate;
    } else {
        title.textContent = this.app.i18n.t('settings.add_period');
    }
    this.periodModal.show();
  }

  handlePeriodFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('periodId').value;
    const name = document.getElementById('periodName').value;
    const startDate = document.getElementById('periodStartDate').value;
    const endDate = document.getElementById('periodEndDate').value;

    if (id) { // Edit
        const index = this.settings.periods.findIndex(p => p.id === id);
        this.settings.periods[index] = { id, name, startDate, endDate };
    } else { // Add
        this.settings.periods.push({ id: `p_${Date.now()}`, name, startDate, endDate });
    }
    this.markUnsaved();
    this.renderPeriodsList();
    this.periodModal.hide();
  }

  deletePeriod(id) {
      if (confirm(this.app.i18n.t('settings.confirm_delete_period'))) {
          this.settings.periods = this.settings.periods.filter(p => p.id !== id);
          this.markUnsaved();
          this.renderPeriodsList();
      }
  }

  addCategory() {
    const name = prompt(this.app.i18n.t('settings.category_name_placeholder'));
    if (name && name.trim()) {
        this.settings.structures[this.selectedJobTypeId].categories.push({ name: name.trim(), items: [] });
        this.markUnsaved();
        this.renderStructureEditor();
    }
  }

  deleteCategory(catIndex) {
      if (confirm(this.app.i18n.t('settings.confirm_delete_category'))) {
          this.settings.structures[this.selectedJobTypeId].categories.splice(catIndex, 1);
          this.markUnsaved();
          this.renderStructureEditor();
      }
  }

  updateCategoryName(catIndex, name) {
      this.settings.structures[this.selectedJobTypeId].categories[catIndex].name = name;
      this.markUnsaved();
  }

  addItem(catIndex) {
      const name = prompt(this.app.i18n.t('settings.item_name_placeholder'));
      if (name && name.trim()) {
          this.settings.structures[this.selectedJobTypeId].categories[catIndex].items.push({ name: name.trim(), type: 'quantitative' });
          this.markUnsaved();
          this.renderStructureEditor();
      }
  }

  deleteItem(catIndex, itemIndex) {
      if (confirm(this.app.i18n.t('settings.confirm_delete_item'))) {
          this.settings.structures[this.selectedJobTypeId].categories[catIndex].items.splice(itemIndex, 1);
          this.markUnsaved();
          this.renderStructureEditor();
      }
  }
  
  updateItem(catIndex, itemIndex, key, value) {
      this.settings.structures[this.selectedJobTypeId].categories[catIndex].items[itemIndex][key] = value;
      this.markUnsaved();
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
        btn.disabled = true; // Keep it disabled after save
        btn.innerHTML = `<i class="fas fa-save me-2"></i><span data-i18n="settings.save_changes"></span>`;
        this.app.i18n.updateUI(btn);
    }
  }
}
