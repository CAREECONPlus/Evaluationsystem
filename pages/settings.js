/**
 * Settings Page Component
 * 設定ページコンポーネント
 */
class SettingsPage {
  constructor(app) {
    this.app = app;
    this.jobTypes = [];
    this.evaluationStructures = {}; // 職種ごとの評価構造を保持
    this.selectedJobType = null;
    this.hasUnsavedChanges = false;
    this.addJobTypeModal = null;
    this.evaluationPeriods = []; // 評価期間を保持する配列
    this.addPeriodModal = null;  // 評価期間追加／編集モーダル
  }

  /**
   * Render settings page
   * 設定ページを描画
   */
  async render() {
    return `
      <div class="settings-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h1 data-i18n="settings.title"></h1>
          <button class="btn btn-success" id="saveChangesBtn"
                  onclick="window.app.currentPage.saveChanges()" disabled>
            <i class="fas fa-save me-2"></i>
            <span data-i18n="settings.save_changes"></span>
          </button>
        </div>

        <div class="settings-layout">
          <div class="settings-sidebar">
            <!-- 職種リスト -->
            <div class="card mb-3">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 data-i18n="settings.job_types"></h5>
                <button class="btn btn-primary btn-sm"
                        onclick="window.app.currentPage.showAddJobTypeModal()">
                  <i class="fas fa-plus"></i>
                  <span data-i18n="settings.add_job_type"></span>
                </button>
              </div>
              <div class="card-body">
                <div id="jobTypesList">
                  <div class="loading"><span data-i18n="common.loading"></span></div>
                </div>
              </div>
            </div>

            <!-- ★★★ 機能追加: 評価期間 ★★★ -->
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 data-i18n="settings.evaluation_periods"></h5>
                <button class="btn btn-primary btn-sm"
                        onclick="window.app.currentPage.showAddPeriodModal()">
                  <i class="fas fa-plus"></i>
                  <span data-i18n="settings.add_period"></span>
                </button>
              </div>
              <div class="card-body">
                <div id="evaluationPeriodsList">
                  <div class="loading"><span data-i18n="common.loading"></span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-main">
            <div class="card">
              <div class="card-header">
                <h5 data-i18n="settings.evaluation_structure"></h5>
              </div>
              <div class="card-body">
                <div id="evaluationStructureContainer">
                  <div class="text-center text-muted p-5">
                    <i class="fas fa-arrow-left me-2"></i>
                    <span data-i18n="settings.select_job_type_hint"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 職種追加モーダル -->
      <div class="modal fade" id="addJobTypeModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" data-i18n="settings.add_job_type"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="addJobTypeForm" onsubmit="window.app.currentPage.handleAddJobType(event)">
              <div class="modal-body">
                <div class="mb-3">
                  <label for="jobTypeName" class="form-label" data-i18n="settings.job_type_name_label"></label>
                  <input type="text" class="form-control" id="jobTypeName" required data-i18n-placeholder="settings.job_type_name_placeholder">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
                <button type="submit" class="btn btn-primary" data-i18n="common.add"></button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- ★★★ 機能追加: 評価期間追加／編集モーダル ★★★ -->
      <div class="modal fade" id="addPeriodModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="periodModalTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="addPeriodForm" onsubmit="window.app.currentPage.handleAddEditPeriod(event)">
              <input type="hidden" id="periodId">
              <div class="modal-body">
                <div class="mb-3">
                  <label for="periodName" class="form-label" data-i18n="settings.period_name_label"></label>
                  <input type="text" class="form-control" id="periodName" required data-i18n-placeholder="settings.period_name_placeholder">
                </div>
                <div class="mb-3">
                  <label for="periodStartDate" class="form-label" data-i18n="settings.start_date_label"></label>
                  <input type="date" class="form-control" id="periodStartDate" required>
                </div>
                <div class="mb-3">
                  <label for="periodEndDate" class="form-label" data-i18n="settings.end_date_label"></label>
                  <input type="date" class="form-control" id="periodEndDate" required>
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

  /**
   * Initialize settings page
   */
  async init() {
    this.app.currentPage = this;

    if (!this.app.hasAnyRole(['admin'])) {
      this.app.navigate("/dashboard");
      return;
    }

    const jobModalEl = document.getElementById('addJobTypeModal');
    if (jobModalEl) this.addJobTypeModal = new bootstrap.Modal(jobModalEl);
    const periodModalEl = document.getElementById('addPeriodModal');
    if (periodModalEl) this.addPeriodModal = new bootstrap.Modal(periodModalEl);

    await this.loadJobTypes();
    await this.loadEvaluationPeriods();

    this.app.i18n.updateUI();
    this.setupUnsavedChangesWarning();
  }

  // --- Job Types Methods ---
  async loadJobTypes() {
    try {
      this.jobTypes = await this.app.api.getJobTypes();
      this.evaluationStructures = await this.app.api.getAllEvaluationStructures(); // Assuming an API method
      this.renderJobTypesList();
    } catch (error) {
      this.app.showError(this.app.i18n.t("errors.job_types_load_failed"));
    }
  }

  renderJobTypesList() {
    const container = document.getElementById("jobTypesList");
    if (!container) return;
    container.innerHTML = `<div class="list-group">${this.jobTypes.map(jt => `
        <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${this.selectedJobType?.id === jt.id ? "active" : ""}"
           onclick="event.preventDefault(); window.app.currentPage.selectJobType('${jt.id}')">
          ${this.app.sanitizeHtml(jt.name)}
          <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); window.app.currentPage.deleteJobType('${jt.id}')" title="${this.app.i18n.t('common.delete')}"><i class="fas fa-trash"></i></button>
        </a>`).join("")}</div>`;
  }

  showAddJobTypeModal() {
    document.getElementById("addJobTypeForm").reset();
    this.addJobTypeModal?.show();
  }

  async handleAddJobType(event) {
    event.preventDefault();
    const name = document.getElementById("jobTypeName").value.trim();
    if (!name) return;
    const newJob = { id: `job-${this.app.generateId()}`, name, order: this.jobTypes.length + 1 };
    this.jobTypes.push(newJob);
    this.renderJobTypesList();
    this.markUnsavedChanges();
    this.app.showSuccess(this.app.i18n.t("messages.add_job_type_success"));
    this.addJobTypeModal.hide();
  }

  async deleteJobType(jobTypeId) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_job_type"))) return;
    this.jobTypes = this.jobTypes.filter(jt => jt.id !== jobTypeId);
    delete this.evaluationStructures[jobTypeId];
    if (this.selectedJobType?.id === jobTypeId) {
      this.selectedJobType = null;
      this.renderEvaluationStructure();
    }
    this.renderJobTypesList();
    this.markUnsavedChanges();
  }

  selectJobType(jobTypeId) {
    if (this.hasUnsavedChanges && !confirm(this.app.i18n.t("messages.unsaved_changes_confirm"))) return;
    this.selectedJobType = this.jobTypes.find(jt => jt.id === jobTypeId);
    this.hasUnsavedChanges = false;
    document.getElementById("saveChangesBtn").disabled = true;
    this.renderJobTypesList();
    this.renderEvaluationStructure();
  }

  // --- Evaluation Structure Methods ---
  renderEvaluationStructure() {
    // ... (This part remains the same as your existing logic, just ensure all text uses i18n)
    const container = document.getElementById("evaluationStructureContainer");
    if (!container) return;

    if (!this.selectedJobType) {
      container.innerHTML = `<div class="text-center text-muted p-5"><i class="fas fa-arrow-left me-2"></i><span data-i18n="settings.select_job_type_hint"></span></div>`;
      this.app.i18n.updateUI(container);
      return;
    }
    // ... rest of the rendering logic
  }
  
  // --- ★★★ Evaluation Periods Methods ★★★ ---
  async loadEvaluationPeriods() {
    try {
      this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      this.renderEvaluationPeriodsList();
    } catch (error) {
      this.app.showError(this.app.i18n.t("errors.evaluation_periods_load_failed"));
    }
  }

  renderEvaluationPeriodsList() {
    const container = document.getElementById("evaluationPeriodsList");
    if (!container) return;
    container.innerHTML = `<div class="list-group">${this.evaluationPeriods.map(p => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            ${this.app.sanitizeHtml(p.name)}<br>
            <small class="text-muted">${this.app.formatDate(p.startDate)} – ${this.app.formatDate(p.endDate)}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="window.app.currentPage.showEditPeriodModal('${p.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="window.app.currentPage.deletePeriod('${p.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`).join("")}</div>`;
  }

  showAddPeriodModal() {
    document.getElementById("addPeriodForm").reset();
    document.getElementById("periodId").value = "";
    document.getElementById("periodModalTitle").textContent = this.app.i18n.t("settings.add_period");
    this.addPeriodModal?.show();
  }

  showEditPeriodModal(periodId) {
    const p = this.evaluationPeriods.find(x => x.id === periodId);
    if (!p) return;
    document.getElementById("periodId").value = p.id;
    document.getElementById("periodName").value = p.name;
    document.getElementById("periodStartDate").value = p.startDate;
    document.getElementById("periodEndDate").value = p.endDate;
    document.getElementById("periodModalTitle").textContent = this.app.i18n.t("settings.edit_period");
    this.addPeriodModal?.show();
  }

  async handleAddEditPeriod(event) {
    event.preventDefault();
    const id = document.getElementById("periodId").value;
    const name = document.getElementById("periodName").value.trim();
    const startDate = document.getElementById("periodStartDate").value;
    const endDate = document.getElementById("periodEndDate").value;

    if (!name || !startDate || !endDate) {
      this.app.showError(this.app.i18n.t("errors.all_fields_required"));
      return;
    }

    if (id) {
      const idx = this.evaluationPeriods.findIndex(x => x.id === id);
      if (idx > -1) this.evaluationPeriods[idx] = { id, name, startDate, endDate };
    } else {
      this.evaluationPeriods.push({ id: `period-${this.app.generateId()}`, name, startDate, endDate });
    }
    this.renderEvaluationPeriodsList();
    this.markUnsavedChanges();
    this.addPeriodModal?.hide();
  }

  async deletePeriod(periodId) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_period"))) return;
    this.evaluationPeriods = this.evaluationPeriods.filter(x => x.id !== periodId);
    this.renderEvaluationPeriodsList();
    this.markUnsavedChanges();
  }
  
  // --- Common Methods ---
  setupUnsavedChangesWarning() {
    window.onbeforeunload = e => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        return e.returnValue = this.app.i18n.t("messages.unsaved_changes_warning");
      }
    };
  }

  markUnsavedChanges() {
    this.hasUnsavedChanges = true;
    document.getElementById("saveChangesBtn").disabled = false;
  }

  async saveChanges() {
    try {
      await this.app.api.saveSettings({
        jobTypes: this.jobTypes,
        evaluationStructures: this.evaluationStructures,
        evaluationPeriods: this.evaluationPeriods
      });
      this.hasUnsavedChanges = false;
      document.getElementById("saveChangesBtn").disabled = true;
      this.app.showSuccess(this.app.i18n.t("messages.settings_saved"));
    } catch (error) {
      this.app.showError(this.app.i18n.t("errors.save_settings_failed"));
    }
  }
}

window.SettingsPage = SettingsPage;
