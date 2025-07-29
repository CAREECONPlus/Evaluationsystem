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
      <div class="settings-page">
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
                <h3 data-i18n="settings.job_types"></h3>
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

            <!-- 評価期間（管理者のみ表示） -->
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h3 data-i18n="settings.evaluation_periods"></h3>
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
                <h3 data-i18n="settings.evaluation_structure"></h3>
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
                  <label for="jobTypeName" class="form-label"
                         data-i18n="settings.job_type_name_label"></label>
                  <input type="text" class="form-control" id="jobTypeName" required
                         data-i18n-placeholder="settings.job_type_name_placeholder">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        data-i18n="common.cancel"></button>
                <button type="submit" class="btn btn-primary" data-i18n="common.add"></button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 評価期間追加／編集モーダル -->
      <div class="modal fade" id="addPeriodModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="periodModalTitle" data-i18n="settings.add_period"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="addPeriodForm" onsubmit="window.app.currentPage.handleAddEditPeriod(event)">
              <input type="hidden" id="periodId">
              <div class="modal-body">
                <div class="mb-3">
                  <label for="periodName" class="form-label"
                         data-i18n="settings.period_name_label"></label>
                  <input type="text" class="form-control" id="periodName" required
                         data-i18n-placeholder="settings.period_name_placeholder">
                </div>
                <div class="mb-3">
                  <label for="periodStartDate" class="form-label"
                         data-i18n="settings.start_date_label"></label>
                  <input type="date" class="form-control" id="periodStartDate" required>
                </div>
                <div class="mb-3">
                  <label for="periodEndDate" class="form-label"
                         data-i18n="settings.end_date_label"></label>
                  <input type="date" class="form-control" id="periodEndDate" required>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        data-i18n="common.cancel"></button>
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
   * 設定ページを初期化
   */
  async init() {
    this.app.currentPage = this;

    // 権限チェック（管理者のみアクセス）
    if (!this.app.hasAnyRole(['admin'])) {
      this.app.navigate("/dashboard");
      return;
    }

    // Header/Sidebar 更新
    window.HeaderComponent?.update(this.app.currentUser);
    window.SidebarComponent?.update(this.app.currentUser);

    // モーダルインスタンス作成
    const jobModalEl = document.getElementById('addJobTypeModal');
    if (jobModalEl) this.addJobTypeModal = new bootstrap.Modal(jobModalEl);
    const periodModalEl = document.getElementById('addPeriodModal');
    if (periodModalEl) this.addPeriodModal = new bootstrap.Modal(periodModalEl);

    // データ読み込み
    await this.loadJobTypes();
    await this.loadEvaluationPeriods();

    // 翻訳適用
    this.app.i18n.updateUI();

    // 未保存警告設定
    this.setupUnsavedChangesWarning();
  }

  /**
   * Load job types (mock or via API)
   */
  async loadJobTypes() {
    try {
      // TODO: this.jobTypes = await this.app.api.getJobTypes();
      this.jobTypes = [
        { id: "construction-worker", name: "建設作業員", order: 1 },
        { id: "site-supervisor",   name: "現場監督",   order: 2 },
        { id: "project-manager",   name: "プロジェクトマネージャー", order: 3 },
      ];
      this.evaluationStructures = {
        "construction-worker": {
          jobTypeId: "construction-worker",
          categories: [
            { id: "cat-cw-tech", name: "技術スキル", items: [
              { id: "item-cw-tech1", name: "専門技術の習得度", type: "quantitative" }
            ]},
            { id: "cat-cw-safety", name: "安全管理", items: [
              { id: "item-cw-safety1", name: "安全意識と遵守", type: "qualitative" }
            ]},
          ]
        },
        "site-supervisor": {
          jobTypeId: "site-supervisor",
          categories: [
            { id: "cat-ss-leadership", name: "リーダーシップ", items: [
              { id: "item-ss-lead1", name: "指示・指導能力", type: "quantitative" }
            ]},
            { id: "cat-ss-comm", name: "コミュニケーション", items: [
              { id: "item-ss-comm1", name: "関係者との連携", type: "qualitative" }
            ]},
          ]
        },
        "project-manager": {
          jobTypeId: "project-manager",
          categories: [
            { id: "cat-pm-strategy", name: "戦略的思考", items: [
              { id: "item-pm-strat1", name: "目標設定能力", type: "quantitative" }
            ]},
            { id: "cat-pm-risk", name: "リスク管理", items: [
              { id: "item-pm-risk1", name: "課題解決能力", type: "qualitative" }
            ]},
          ]
        }
      };

      this.renderJobTypesList();
    } catch (error) {
      console.error("Error loading job types:", error);
      this.app.showError(this.app.i18n.t("errors.job_types_load_failed"));
    }
  }

  /**
   * Render job types list
   */
  renderJobTypesList() {
    const container = document.getElementById("jobTypesList");
    if (!container) return;

    if (this.jobTypes.length === 0) {
      container.innerHTML = `<p data-i18n="settings.no_job_types"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = `
      <div class="list-group">
        ${this.jobTypes.map((jt) => `
          <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${this.selectedJobType?.id===jt.id?"active":""}"
             onclick="event.preventDefault(); window.app.currentPage.selectJobType('${jt.id}')">
            ${this.app.sanitizeHtml(jt.name)}
            <button class="btn btn-sm btn-outline-danger"
                    onclick="event.stopPropagation(); window.app.currentPage.deleteJobType('${jt.id}')"
                    title="${this.app.i18n.t('common.delete')}">
              <i class="fas fa-trash"></i>
            </button>
          </a>
        `).join("")}
      </div>
    `;
    this.app.i18n.updateUI(container);
  }

  /**
   * Show 'Add Job Type' modal
   */
  showAddJobTypeModal() {
    if (!this.addJobTypeModal) return;
    document.getElementById("jobTypeName").value = "";
    this.addJobTypeModal.show();
    this.app.i18n.updateUI(document.getElementById("addJobTypeModal"));
  }

  /**
   * Handle add job type form submit
   */
  async handleAddJobType(event) {
    event.preventDefault();
    const name = document.getElementById("jobTypeName").value.trim();
    if (!name) {
      this.app.showError(this.app.i18n.t("errors.job_type_name_required"));
      return;
    }
    try {
      const newJob = { id:`job-${Date.now()}`, name, order:this.jobTypes.length+1 };
      this.jobTypes.push(newJob);
      this.renderJobTypesList();
      this.markUnsavedChanges();
      this.app.showSuccess(this.app.i18n.t("messages.add_job_type_success"));
      this.addJobTypeModal.hide();
    } catch (error) {
      console.error("Error adding job type:", error);
      this.app.showError(this.app.i18n.t("errors.add_job_type_failed"));
    }
  }

  /**
   * Delete a job type
   */
  async deleteJobType(jobTypeId) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_job_type"))) return;
    try {
      this.jobTypes = this.jobTypes.filter(jt=>jt.id!==jobTypeId);
      delete this.evaluationStructures[jobTypeId];
      if (this.selectedJobType?.id===jobTypeId) {
        this.selectedJobType = null;
        this.renderEvaluationStructure();
      }
      this.renderJobTypesList();
      this.markUnsavedChanges();
      this.app.showSuccess(this.app.i18n.t("messages.delete_job_type_success"));
    } catch (error) {
      console.error("Error deleting job type:", error);
      this.app.showError(this.app.i18n.t("errors.delete_job_type_failed"));
    }
  }

  /**
   * Select a job type
   */
  selectJobType(jobTypeId) {
    if (this.hasUnsavedChanges) {
      if (!confirm(this.app.i18n.t("messages.unsaved_changes_confirm"))) return;
    }
    this.selectedJobType = this.jobTypes.find(jt=>jt.id===jobTypeId);
    this.hasUnsavedChanges = false;
    document.getElementById("saveChangesBtn").disabled = true;
    this.renderJobTypesList();
    this.renderEvaluationStructure();
  }

  /**
   * Render evaluation structure for selected job type
   */
  renderEvaluationStructure() {
    const container = document.getElementById("evaluationStructureContainer");
    if (!container) return;

    if (!this.selectedJobType) {
      container.innerHTML = `
        <div class="text-center text-muted p-5">
          <i class="fas fa-arrow-left me-2"></i>
          <span data-i18n="settings.select_job_type_hint"></span>
        </div>`;
      this.app.i18n.updateUI(container);
      return;
    }

    const struct = this.evaluationStructures[this.selectedJobType.id];
    if (!struct) {
      container.innerHTML = `
        <div class="text-center text-muted p-5">
          <span data-i18n="settings.no_structure_for_job_type"></span>
        </div>`;
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = `
      <div class="evaluation-structure-editor">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4>${this.app.sanitizeHtml(this.selectedJobType.name)} <span data-i18n="settings.evaluation_structure_of"></span></h4>
          <button class="btn btn-outline-primary btn-sm" onclick="window.app.currentPage.addCategory()">
            <i class="fas fa-plus me-2"></i><span data-i18n="settings.add_category"></span>
          </button>
        </div>
        <div id="categoriesList">
          ${struct.categories.map((cat,ci)=>this.renderCategory(cat,ci)).join("")}
        </div>
      </div>`;
    this.app.i18n.updateUI(container);
  }

  renderCategory(category, categoryIndex) {
    return `
      <div class="card mb-3 category-card" data-category-index="${categoryIndex}">
        <div class="card-header d-flex align-items-center">
          <input type="text" class="form-control form-control-sm category-name-input"
                 value="${this.app.sanitizeHtml(category.name)}"
                 onchange="window.app.currentPage.updateCategoryName(${categoryIndex}, this.value)"
                 data-i18n-placeholder="settings.category_name_placeholder">
          <button class="btn btn-sm btn-outline-danger ms-2"
                  onclick="window.app.currentPage.deleteCategory(${categoryIndex})"
                  title="${this.app.i18n.t('common.delete')}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="list-group list-group-flush items-list">
          ${category.items.map((item,itemIndex)=>this.renderItem(item,categoryIndex,itemIndex)).join("")}
          <div class="list-group-item">
            <button class="btn btn-secondary btn-sm w-100"
                    onclick="window.app.currentPage.addItem(${categoryIndex})">
              <i class="fas fa-plus me-2"></i><span data-i18n="settings.add_item"></span>
            </button>
          </div>
        </div>
      </div>`;
  }

  renderItem(item, categoryIndex, itemIndex) {
    return `
      <div class="list-group-item item-row" data-item-index="${itemIndex}">
        <input type="text" class="form-control form-control-sm"
               value="${this.app.sanitizeHtml(item.name)}"
               onchange="window.app.currentPage.updateItemName(${categoryIndex},${itemIndex}, this.value)"
               data-i18n-placeholder="settings.item_name_placeholder">
        <select class="form-select form-select-sm"
                onchange="window.app.currentPage.updateItemType(${categoryIndex},${itemIndex}, this.value)">
          <option value="quantitative" ${item.type==="quantitative"?"selected":""} data-i18n="settings.quantitative"></option>
          <option value="qualitative" ${item.type==="qualitative"?"selected":""} data-i18n="settings.qualitative"></option>
        </select>
        <button class="btn btn-sm btn-outline-danger ms-2"
                onclick="window.app.currentPage.deleteItem(${categoryIndex},${itemIndex})"
                title="${this.app.i18n.t('common.delete')}">
          <i class="fas fa-times"></i>
        </button>
      </div>`;
  }

  addCategory() {
    if (!this.selectedJobType) return;
    const struct = this.evaluationStructures[this.selectedJobType.id] || { jobTypeId:this.selectedJobType.id, categories:[] };
    struct.categories.push({ id:`cat-${Date.now()}`, name:this.app.i18n.t("settings.new_category"), items:[] });
    this.evaluationStructures[this.selectedJobType.id] = struct;
    this.renderEvaluationStructure();
    this.markUnsavedChanges();
  }

  deleteCategory(categoryIndex) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_category"))) return;
    const struct = this.evaluationStructures[this.selectedJobType.id];
    if (struct) {
      struct.categories.splice(categoryIndex,1);
      this.renderEvaluationStructure();
      this.markUnsavedChanges();
    }
  }

  updateCategoryName(categoryIndex, newName) {
    const struct = this.evaluationStructures[this.selectedJobType.id];
    if (struct) {
      struct.categories[categoryIndex].name = newName;
      this.markUnsavedChanges();
    }
  }

  addItem(categoryIndex) {
    const struct = this.evaluationStructures[this.selectedJobType.id];
    if (struct) {
      struct.categories[categoryIndex].items.push({ id:`item-${Date.now()}`, name:this.app.i18n.t("settings.new_item"), type:"quantitative" });
      this.renderEvaluationStructure();
      this.markUnsavedChanges();
    }
  }

  deleteItem(categoryIndex, itemIndex) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_item"))) return;
    const struct = this.evaluationStructures[this.selectedJobType.id];
    if (struct) {
      struct.categories[categoryIndex].items.splice(itemIndex,1);
      this.renderEvaluationStructure();
      this.markUnsavedChanges();
    }
  }

  updateItemName(categoryIndex, itemIndex, newName) {
    const struct = this.evaluationStructures[this.selectedJobType.id];
    if (struct) {
      struct.categories[categoryIndex].items[itemIndex].name = newName;
      this.markUnsavedChanges();
    }
  }

  updateItemType(categoryIndex, itemIndex, newType) {
    const struct = this.evaluationStructures[this.selectedJobType.id];
    if (struct) {
      struct.categories[categoryIndex].items[itemIndex].type = newType;
      this.markUnsavedChanges();
    }
  }

  /**
   * Load evaluation periods (mock or via API)
   */
  async loadEvaluationPeriods() {
    try {
      // TODO: this.evaluationPeriods = await this.app.api.getEvaluationPeriods();
      this.evaluationPeriods = [
        { id:"2024-q1", name:"2024年 第1四半期", startDate:"2024-01-01", endDate:"2024-03-31" },
        { id:"2024-q2", name:"2024年 第2四半期", startDate:"2024-04-01", endDate:"2024-06-30" },
      ];
      this.renderEvaluationPeriodsList();
    } catch (error) {
      console.error("Error loading evaluation periods:", error);
      this.app.showError(this.app.i18n.t("errors.evaluation_periods_load_failed"));
    }
  }

  /**
   * Render evaluation periods list
   */
  renderEvaluationPeriodsList() {
    const container = document.getElementById("evaluationPeriodsList");
    if (!container) return;

    if (this.evaluationPeriods.length === 0) {
      container.innerHTML = `<p data-i18n="settings.no_evaluation_periods"></p>`;
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = `
      <div class="list-group">
        ${this.evaluationPeriods.map(p=>`
          <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              ${this.app.sanitizeHtml(p.name)}<br>
              <small class="text-muted">
                ${this.app.formatDate(p.startDate)} – ${this.app.formatDate(p.endDate)}
              </small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-1"
                      onclick="window.app.currentPage.showEditPeriodModal('${p.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger"
                      onclick="window.app.currentPage.deletePeriod('${p.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `).join("")}
      </div>`;
    this.app.i18n.updateUI(container);
  }

  /**
   * Show 'Add Period' modal
   */
  showAddPeriodModal() {
    document.getElementById("addPeriodForm").reset();
    document.getElementById("periodId").value = "";
    document.getElementById("periodModalTitle").textContent = this.app.i18n.t("settings.add_period");
    this.addPeriodModal?.show();
    this.app.i18n.updateUI(document.getElementById("addPeriodModal"));
  }

  /**
   * Show 'Edit Period' modal
   */
  showEditPeriodModal(periodId) {
    const p = this.evaluationPeriods.find(x=>x.id===periodId);
    if (!p) {
      this.app.showError(this.app.i18n.t("errors.period_not_found"));
      return;
    }
    document.getElementById("addPeriodForm").reset();
    document.getElementById("periodId").value = p.id;
    document.getElementById("periodName").value = p.name;
    document.getElementById("periodStartDate").value = p.startDate;
    document.getElementById("periodEndDate").value = p.endDate;
    document.getElementById("periodModalTitle").textContent = this.app.i18n.t("settings.edit_period");
    this.addPeriodModal?.show();
    this.app.i18n.updateUI(document.getElementById("addPeriodModal"));
  }

  /**
   * Handle add/edit period form submit
   */
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

    try {
      if (id) {
        const idx = this.evaluationPeriods.findIndex(x=>x.id===id);
        if (idx > -1) {
          this.evaluationPeriods[idx] = { id, name, startDate, endDate };
          this.app.showSuccess(this.app.i18n.t("messages.update_period_success"));
        }
      } else {
        this.evaluationPeriods.push({ id:`period-${Date.now()}`, name, startDate, endDate });
        this.app.showSuccess(this.app.i18n.t("messages.add_period_success"));
      }
      this.renderEvaluationPeriodsList();
      this.markUnsavedChanges();
      this.addPeriodModal?.hide();
    } catch (error) {
      console.error("Error saving period:", error);
      this.app.showError(this.app.i18n.t("errors.save_period_failed"));
    }
  }

  /**
   * Delete a period
   */
  async deletePeriod(periodId) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_period"))) return;
    this.evaluationPeriods = this.evaluationPeriods.filter(x=>x.id!==periodId);
    this.renderEvaluationPeriodsList();
    this.markUnsavedChanges();
    this.app.showSuccess(this.app.i18n.t("messages.delete_period_success"));
  }

  /**
   * Warn user on unsaved changes
   */
  setupUnsavedChangesWarning() {
    window.onbeforeunload = e => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        return e.returnValue = this.app.i18n.t("messages.unsaved_changes_warning");
      }
    };
  }

  /**
   * Mark unsaved changes
   */
  markUnsavedChanges() {
    this.hasUnsavedChanges = true;
    document.getElementById("saveChangesBtn").disabled = false;
  }

  /**
   * Save all changes (job types, structures, periods)
   */
  async saveChanges() {
    try {
      // TODO: API に送信する場合の処理
      const payload = {
        jobTypes: this.jobTypes,
        evaluationStructures: this.evaluationStructures,
        evaluationPeriods: this.evaluationPeriods
      };
      console.log("Saving settings payload:", payload);
      // await this.app.api.saveSettings(payload);

      // Mock 保存完了まで少し待機
      await new Promise(r=>setTimeout(r,300));

      this.hasUnsavedChanges = false;
      document.getElementById("saveChangesBtn").disabled = true;
      this.app.showSuccess(this.app.i18n.t("messages.settings_saved"));
    } catch (error) {
      console.error("Error saving settings:", error);
      this.app.showError(this.app.i18n.t("errors.save_settings_failed"));
    }
  }
}

// Add settings-specific styles
const settingsStyles = `
<style>
.settings-page {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}
.settings-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  flex-grow: 1;
  overflow: hidden;
}
.settings-sidebar .card, .settings-main .card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.settings-sidebar .card-body, .settings-main .card-body {
  overflow-y: auto;
}
.job-type-actions, .period-actions {
  opacity: 0;
  transition: opacity 0.2s;
}
.list-group-item:hover .job-type-actions,
.list-group-item:hover .period-actions {
  opacity: 1;
}
.evaluation-structure-editor {
  height: 100%;
}
.category-card {
  background: #f8f9fa;
}
.category-header {
  display: flex;
  gap: 10px;
  align-items: center;
}
.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
}
.add-item-btn {
  border-style: dashed;
}
@media (max-width: 992px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .settings-page {
    height: auto;
  }
}
</style>
`;
if (!document.getElementById("settings-styles")) {
  const styleEl = document.createElement("div");
  styleEl.id = "settings-styles";
  styleEl.innerHTML = settingsStyles;
  document.head.appendChild(styleEl);
}

// Export globally
window.SettingsPage = SettingsPage;
