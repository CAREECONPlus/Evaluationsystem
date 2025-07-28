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
    this.evaluationPeriods = []; // 新しい評価期間を保持する配列
    this.addPeriodModal = null; // 評価期間追加モーダル
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
                        <i class="fas fa-save me-2"></i><span data-i18n="settings.save_changes"></span>
                    </button>
                </div>

                <div class="settings-layout">
                    <div class="settings-sidebar">
                        <div class="card mb-3">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h3 data-i18n="settings.job_types"></h3>
                                    <button class="btn btn-primary btn-sm"
                                            onclick="window.app.currentPage.showAddJobTypeModal()">
                                        <i class="fas fa-plus"></i> <span data-i18n="settings.add_job_type"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="jobTypesList">
                                    <div class="loading"><span data-i18n="common.loading"></span></div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h3 data-i18n="settings.evaluation_periods">評価期間</h3>
                                    <button class="btn btn-primary btn-sm"
                                            onclick="window.app.currentPage.showAddPeriodModal()">
                                        <i class="fas fa-plus"></i> <span data-i18n="settings.add_period">期間を追加</span>
                                    </button>
                                </div>
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
                                        <i class="fas fa-arrow-left me-2"></i><span data-i18n="settings.select_job_type_hint"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

            <div class="modal fade" id="addPeriodModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="periodModalTitle" data-i18n="settings.add_period">評価期間を追加</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="addPeriodForm" onsubmit="window.app.currentPage.handleAddEditPeriod(event)">
                            <input type="hidden" id="periodId">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label for="periodName" class="form-label" data-i18n="settings.period_name_label">期間名 *</label>
                                    <input type="text" class="form-control" id="periodName" required data-i18n-placeholder="settings.period_name_placeholder">
                                </div>
                                <div class="mb-3">
                                    <label for="periodStartDate" class="form-label" data-i18n="settings.start_date_label">開始日 *</label>
                                    <input type="date" class="form-control" id="periodStartDate" required>
                                </div>
                                <div class="mb-3">
                                    <label for="periodEndDate" class="form-label" data-i18n="settings.end_date_label">終了日 *</label>
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
   * 設定ページを初期化
   */
  async init() {
    this.app.currentPage = this;

    // Check permissions
    if (!this.app.hasRole("admin")) {
      this.app.navigate("/dashboard");
      return;
    }

    // Update header and sidebar
    if (window.HeaderComponent) {
      window.HeaderComponent.update(this.app.currentUser);
    }
    if (window.SidebarComponent) {
      window.SidebarComponent.update(this.app.currentUser);
    }
    
    // モーダルのインスタンスを準備
    const addJobTypeModalEl = document.getElementById('addJobTypeModal');
    if (addJobTypeModalEl && window.bootstrap) {
        this.addJobTypeModal = new window.bootstrap.Modal(addJobTypeModalEl);
    }
    const addPeriodModalEl = document.getElementById('addPeriodModal');
    if (addPeriodModalEl && window.bootstrap) {
        this.addPeriodModal = new window.bootstrap.Modal(addPeriodModalEl);
    }

    // Load data
    await this.loadJobTypes();
    await this.loadEvaluationPeriods(); // 評価期間のロード

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }

    // Setup beforeunload warning for unsaved changes
    this.setupUnsavedChangesWarning();
  }

  /**
   * Load job types
   * 職種を読み込み
   */
  async loadJobTypes() {
    try {
      // Mock data - 実際にはAPIから取得する
      this.jobTypes = [
        { id: "construction-worker", name: "建設作業員", order: 1 },
        { id: "site-supervisor", name: "現場監督", order: 2 },
        { id: "project-manager", name: "プロジェクトマネージャー", order: 3 },
      ];
      // API呼び出し例: this.jobTypes = await this.app.api.getJobTypes(this.app.currentUser.tenantId);

      // 各職種の評価構造もロード（または、選択時に個別にロード）
      // 現状はモックとして各職種に評価構造を持たせる
      this.evaluationStructures = {
          "construction-worker": {
              jobTypeId: "construction-worker",
              categories: [
                { id: "cat-cw-tech", name: "技術スキル", items: [ { id: "item-cw-tech1", name: "専門技術の習得度", type: "quantitative" } ]},
                { id: "cat-cw-safety", name: "安全管理", items: [ { id: "item-cw-safety1", name: "安全意識と遵守", type: "qualitative" } ]},
              ]
          },
          "site-supervisor": {
              jobTypeId: "site-supervisor",
              categories: [
                { id: "cat-ss-leadership", name: "リーダーシップ", items: [ { id: "item-ss-lead1", name: "指示・指導能力", type: "quantitative" } ]},
                { id: "cat-ss-comm", name: "コミュニケーション", items: [ { id: "item-ss-comm1", name: "関係者との連携", type: "qualitative" } ]},
              ]
          },
          "project-manager": {
              jobTypeId: "project-manager",
              categories: [
                { id: "cat-pm-strategy", name: "戦略的思考", items: [ { id: "item-pm-strat1", name: "目標設定能力", type: "quantitative" } ]},
                { id: "cat-pm-risk", name: "リスク管理", items: [ { id: "item-pm-risk1", name: "課題解決能力", type: "qualitative" } ]},
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
   * 職種リストを描画
   */
  renderJobTypesList() {
    const container = document.getElementById("jobTypesList");
    if(!container) return;

    if (this.jobTypes.length === 0) {
      container.innerHTML = `<p data-i18n="settings.no_job_types"></p>`; // 翻訳キー
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = `
            <div class="list-group">
                ${this.jobTypes
                  .map(
                    (jobType) => `
                    <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${this.selectedJobType?.id === jobType.id ? "active" : ""}"
                       onclick="event.preventDefault(); window.app.currentPage.selectJobType('${jobType.id}')">
                        ${this.app.sanitizeHtml(jobType.name)}
                        <span class="job-type-actions">
                            <button class="btn btn-sm btn-outline-danger"
                                    onclick="event.stopPropagation(); window.app.currentPage.deleteJobType('${jobType.id}')"
                                    title="${this.app.i18n.t('common.delete')}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </span>
                    </a>
                `,
                  )
                  .join("")}
            </div>
        `;
    this.app.i18n.updateUI(container); // 翻訳適用
  }

  /**
   * Load evaluation periods
   * 評価期間を読み込み
   */
  async loadEvaluationPeriods() {
    try {
        // Mock data - 実際にはAPIから取得する
        this.evaluationPeriods = [
            { id: "2024-q1", name: "2024年 第1四半期", startDate: "2024-01-01", endDate: "2024-03-31" },
            { id: "2024-q2", name: "2024年 第2四半期", startDate: "2024-04-01", endDate: "2024-06-30" },
        ];
        // API呼び出し例: this.evaluationPeriods = await this.app.api.getEvaluationPeriods(this.app.currentUser.tenantId);
        this.renderEvaluationPeriodsList();
    } catch (error) {
        console.error("Error loading evaluation periods:", error);
        this.app.showError(this.app.i18n.t("errors.evaluation_periods_load_failed"));
    }
  }

  /**
   * Render evaluation periods list
   * 評価期間リストを描画
   */
  renderEvaluationPeriodsList() {
    const container = document.getElementById("evaluationPeriodsList");
    if(!container) return;

    if (this.evaluationPeriods.length === 0) {
      container.innerHTML = `<p data-i18n="settings.no_evaluation_periods"></p>`; // 翻訳キー
      this.app.i18n.updateUI(container);
      return;
    }

    container.innerHTML = `
            <div class="list-group">
                ${this.evaluationPeriods
                  .map(
                    (period) => `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            ${this.app.sanitizeHtml(period.name)} <br>
                            <small class="text-muted">${this.app.formatDate(period.startDate)} - ${this.app.formatDate(period.endDate)}</small>
                        </div>
                        <span class="period-actions">
                            <button class="btn btn-sm btn-outline-primary me-1"
                                    onclick="window.app.currentPage.showEditPeriodModal('${period.id}')"
                                    title="${this.app.i18n.t('common.edit')}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger"
                                    onclick="window.app.currentPage.deletePeriod('${period.id}')"
                                    title="${this.app.i18n.t('common.delete')}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
    this.app.i18n.updateUI(container); // 翻訳適用
  }


  /**
   * Select job type
   * 職種を選択
   */
  async selectJobType(jobTypeId) {
    if (this.hasUnsavedChanges) {
        if(!confirm(this.app.i18n.t("messages.unsaved_changes_confirm"))) { // 翻訳キー
            return;
        }
    }
    this.selectedJobType = this.jobTypes.find((jt) => jt.id === jobTypeId);
    this.hasUnsavedChanges = false;
    document.getElementById("saveChangesBtn").disabled = true;
    this.renderJobTypesList(); // アクティブ状態を更新するため再描画
    this.renderEvaluationStructure(); // 選択した職種の評価構造を表示
  }

  /**
   * Load evaluation structure for job type
   * 職種の評価構造を読み込み
   * NOTE: このメソッドはselectJobTypeから呼ばれるため、mockStructuresから直接取得する
   */
  renderEvaluationStructure() {
    const container = document.getElementById("evaluationStructureContainer");
    if (!container) return;

    if (!this.selectedJobType) {
      container.innerHTML = `<div class="text-center text-muted p-5"><i class="fas fa-arrow-left me-2"></i><span data-i18n="settings.select_job_type_hint"></span></div>`; // 翻訳キー
      this.app.i18n.updateUI(container);
      return;
    }

    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (!currentStructure) {
        container.innerHTML = `<div class="text-center text-muted p-5"><span data-i18n="settings.no_structure_for_job_type">この職種には評価構造が設定されていません。</span></div>`; // 翻訳キー
        this.app.i18n.updateUI(container);
        return;
    }

    container.innerHTML = `
            <div class="evaluation-structure-editor">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4>${this.app.sanitizeHtml(this.selectedJobType.name)} <span data-i18n="settings.evaluation_structure_of">の評価構造</span></h4>
                    <button class="btn btn-outline-primary btn-sm"
                            onclick="window.app.currentPage.addCategory()">
                        <i class="fas fa-plus me-2"></i><span data-i18n="settings.add_category"></span>
                    </button>
                </div>
                <div id="categoriesList">
                    ${currentStructure.categories.map((category, categoryIndex) => this.renderCategory(category, categoryIndex)).join("")}
                </div>
            </div>
        `;
    this.app.i18n.updateUI(container); // 翻訳適用
  }
  
  renderCategory(category, categoryIndex) {
      return `
        <div class="card mb-3 category-card" data-category-index="${categoryIndex}">
            <div class="card-header category-header">
                <input type="text" class="form-control form-control-sm category-name-input"
                       value="${this.app.sanitizeHtml(category.name)}"
                       onchange="window.app.currentPage.updateCategoryName(${categoryIndex}, this.value)"
                       data-i18n-placeholder="settings.category_name_placeholder">
                <button class="btn btn-sm btn-outline-danger"
                        onclick="window.app.currentPage.deleteCategory(${categoryIndex})"
                        title="${this.app.i18n.t('common.delete')}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="list-group list-group-flush items-list">
                ${category.items.map((item, itemIndex) => this.renderItem(item, categoryIndex, itemIndex)).join("")}
                <div class="list-group-item">
                    <button class="btn btn-secondary btn-sm w-100 add-item-btn"
                            onclick="window.app.currentPage.addItem(${categoryIndex})">
                        <i class="fas fa-plus me-2"></i><span data-i18n="settings.add_item"></span>
                    </button>
                </div>
            </div>
        </div>
      `;
  }

  renderItem(item, categoryIndex, itemIndex) {
      return `
        <div class="list-group-item item-row" data-item-index="${itemIndex}">
            <input type="text" class="form-control form-control-sm"
                   value="${this.app.sanitizeHtml(item.name)}"
                   onchange="window.app.currentPage.updateItemName(${categoryIndex}, ${itemIndex}, this.value)"
                   data-i18n-placeholder="settings.item_name_placeholder">
            <select class="form-select form-select-sm"
                    onchange="window.app.currentPage.updateItemType(${categoryIndex}, ${itemIndex}, this.value)">
                <option value="quantitative" ${item.type === "quantitative" ? "selected" : ""} data-i18n="settings.quantitative"></option>
                <option value="qualitative" ${item.type === "qualitative" ? "selected" : ""} data-i18n="settings.qualitative"></option>
            </select>
            <button class="btn btn-sm btn-outline-danger"
                    onclick="window.app.currentPage.deleteItem(${categoryIndex}, ${itemIndex})"
                    title="${this.app.i18n.t('common.delete')}">
                <i class="fas fa-times"></i>
            </button>
        </div>
      `;
  }


  markUnsavedChanges() {
    this.hasUnsavedChanges = true;
    document.getElementById("saveChangesBtn").disabled = false;
  }

  setupUnsavedChangesWarning() {
    window.onbeforeunload = (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        return e.returnValue = this.app.i18n.t("messages.unsaved_changes_warning"); // 翻訳キー
      }
    };
  }

  addCategory() {
    if (!this.selectedJobType) return;
    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (!currentStructure) { // 構造が存在しない場合は初期化
        this.evaluationStructures[this.selectedJobType.id] = { jobTypeId: this.selectedJobType.id, categories: [] };
    }
    const newCategory = { id: `category-${Date.now()}`, name: this.app.i18n.t("settings.new_category"), items: [] }; // 翻訳キー
    this.evaluationStructures[this.selectedJobType.id].categories.push(newCategory);
    this.renderEvaluationStructure();
    this.markUnsavedChanges();
  }

  deleteCategory(categoryIndex) {
    if (!this.selectedJobType) return;
    if (!confirm(this.app.i18n.t("settings.confirm_delete_category"))) return; // 翻訳キー
    
    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (currentStructure) {
      currentStructure.categories.splice(categoryIndex, 1);
      this.renderEvaluationStructure();
      this.markUnsavedChanges();
    }
  }

  updateCategoryName(categoryIndex, newName) {
    if (!this.selectedJobType) return;
    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (currentStructure && currentStructure.categories[categoryIndex]) {
      currentStructure.categories[categoryIndex].name = newName;
      this.markUnsavedChanges();
    }
  }

  addItem(categoryIndex) {
    if (!this.selectedJobType) return;
    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (currentStructure && currentStructure.categories[categoryIndex]) {
        const newItem = { id: `item-${Date.now()}`, name: this.app.i18n.t("settings.new_item"), type: "quantitative" }; // 翻訳キー
        currentStructure.categories[categoryIndex].items.push(newItem);
        this.renderEvaluationStructure();
        this.markUnsavedChanges();
    }
  }

  deleteItem(categoryIndex, itemIndex) {
    if (!this.selectedJobType) return;
    if (!confirm(this.app.i18n.t("settings.confirm_delete_item"))) return; // 翻訳キー
    
    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (currentStructure && currentStructure.categories[categoryIndex]) {
      currentStructure.categories[categoryIndex].items.splice(itemIndex, 1);
      this.renderEvaluationStructure();
      this.markUnsavedChanges();
    }
  }

  updateItemName(categoryIndex, itemIndex, newName) {
    if (!this.selectedJobType) return;
    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (currentStructure && currentStructure.categories[categoryIndex] && currentStructure.categories[categoryIndex].items[itemIndex]) {
      currentStructure.categories[categoryIndex].items[itemIndex].name = newName;
      this.markUnsavedChanges();
    }
  }

  updateItemType(categoryIndex, itemIndex, newType) {
    if (!this.selectedJobType) return;
    const currentStructure = this.evaluationStructures[this.selectedJobType.id];
    if (currentStructure && currentStructure.categories[categoryIndex] && currentStructure.categories[categoryIndex].items[itemIndex]) {
      currentStructure.categories[categoryIndex].items[itemIndex].type = newType;
      this.markUnsavedChanges();
    }
  }

  async saveChanges() {
    if (!this.selectedJobType) {
        this.app.showError(this.app.i18n.t("errors.no_job_type_selected")); // 翻訳キー
        return;
    }
    if (!this.evaluationStructures[this.selectedJobType.id]) {
        this.app.showWarning(this.app.i18n.t("warnings.no_changes_to_save")); // 翻訳キー
        return;
    }
    
    try {
      // Mock API call
      console.log("Saving changes for job type:", this.selectedJobType.id, this.evaluationStructures[this.selectedJobType.id]);
      // 職種と評価期間をまとめて保存するモック
      const dataToSave = {
          jobTypes: this.jobTypes,
          evaluationStructures: this.evaluationStructures,
          evaluationPeriods: this.evaluationPeriods
      };
      localStorage.setItem(`settings-data-${this.app.currentUser.tenantId}`, JSON.stringify(dataToSave));

      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      this.app.showSuccess(this.app.i18n.t("messages.settings_saved")); // 翻訳キー
      this.hasUnsavedChanges = false;
      document.getElementById("saveChangesBtn").disabled = true;
    } catch (error) {
      console.error("Error saving settings:", error);
      this.app.showError(this.app.i18n.t("errors.save_settings_failed")); // 翻訳キー
    }
  }

  showAddJobTypeModal() {
    if(this.addJobTypeModal) {
        document.getElementById('addJobTypeForm').reset();
        document.getElementById('jobTypeName').value = ''; // 確実にクリア
        this.addJobTypeModal.show();
        this.app.i18n.updateUI(document.getElementById('addJobTypeModal')); // モーダル内の翻訳を更新
    }
  }

  async handleAddJobType(event) {
    event.preventDefault();
    const name = document.getElementById("jobTypeName").value.trim();
    if (!name) {
        this.app.showError(this.app.i18n.t("errors.job_type_name_required"));
        return;
    }

    try {
      const newJobType = { id: `job-type-${Date.now()}`, name: name, order: this.jobTypes.length + 1 };
      this.jobTypes.push(newJobType);
      this.renderJobTypesList();
      this.markUnsavedChanges(); // 新しい職種が追加されたら変更ありとマーク
      this.app.showSuccess(this.app.i18n.t("messages.add_job_type_success"));
      if(this.addJobTypeModal) this.addJobTypeModal.hide();
    } catch (error) {
      console.error("Error adding job type:", error);
      this.app.showError(this.app.i18n.t("errors.add_job_type_failed"));
    }
  }
  
  async deleteJobType(jobTypeId) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_job_type"))) return; // 翻訳キー
    
    try {
      this.jobTypes = this.jobTypes.filter((jt) => jt.id !== jobTypeId);
      // 関連する評価構造も削除（モック）
      delete this.evaluationStructures[jobTypeId];

      if (this.selectedJobType?.id === jobTypeId) {
        this.selectedJobType = null;
        this.renderEvaluationStructure(); // 空の状態をレンダリング
      }
      this.renderJobTypesList();
      this.markUnsavedChanges(); // 職種が削除されたら変更ありとマーク
      this.app.showSuccess(this.app.i18n.t("messages.delete_job_type_success"));
    } catch (error) {
      console.error("Error deleting job type:", error);
      this.app.showError(this.app.i18n.t("errors.delete_job_type_failed"));
    }
  }

  showAddPeriodModal() {
    if (this.addPeriodModal) {
      document.getElementById('addPeriodForm').reset();
      document.getElementById('periodId').value = '';
      document.getElementById('periodModalTitle').textContent = this.app.i18n.t("settings.add_period");
      this.addPeriodModal.show();
      this.app.i18n.updateUI(document.getElementById('addPeriodModal'));
    }
  }

  showEditPeriodModal(periodId) {
    const period = this.evaluationPeriods.find(p => p.id === periodId);
    if (!period) {
        this.app.showError(this.app.i18n.t("errors.period_not_found"));
        return;
    }
    if (this.addPeriodModal) {
        document.getElementById('addPeriodForm').reset();
        document.getElementById('periodId').value = period.id;
        document.getElementById('periodName').value = period.name;
        document.getElementById('periodStartDate').value = period.startDate;
        document.getElementById('periodEndDate').value = period.endDate;
        document.getElementById('periodModalTitle').textContent = this.app.i18n.t("settings.edit_period");
        this.addPeriodModal.show();
        this.app.i18n.updateUI(document.getElementById('addPeriodModal'));
    }
  }

  async handleAddEditPeriod(event) {
    event.preventDefault();
    const periodId = document.getElementById('periodId').value;
    const name = document.getElementById('periodName').value.trim();
    const startDate = document.getElementById('periodStartDate').value;
    const endDate = document.getElementById('periodEndDate').value;

    if (!name || !startDate || !endDate) {
        this.app.showError(this.app.i18n.t("errors.all_fields_required"));
        return;
    }

    const periodData = { name, startDate, endDate };

    try {
      if (periodId) { // Edit existing period
        const index = this.evaluationPeriods.findIndex(p => p.id === periodId);
        if (index > -1) {
          this.evaluationPeriods[index] = { ...this.evaluationPeriods[index], ...periodData };
          this.app.showSuccess(this.app.i18n.t("messages.update_period_success"));
        }
      } else { // Add new period
        const newPeriod = { id: `period-${Date.now()}`, ...periodData };
        this.evaluationPeriods.push(newPeriod);
        this.app.showSuccess(this.app.i18n.t("messages.add_period_success"));
      }
      this.renderEvaluationPeriodsList();
      this.markUnsavedChanges();
      if(this.addPeriodModal) this.addPeriodModal.hide();
    } catch (error) {
      console.error("Error saving evaluation period:", error);
      this.app.showError(this.app.i18n.t("errors.save_period_failed"));
    }
  }

  async deletePeriod(periodId) {
    if (!confirm(this.app.i18n.t("settings.confirm_delete_period"))) return;
    
    try {
      this.evaluationPeriods = this.evaluationPeriods.filter(p => p.id !== periodId);
      this.renderEvaluationPeriodsList();
      this.markUnsavedChanges();
      this.app.showSuccess(this.app.i18n.t("messages.delete_period_success"));
    } catch (error) {
      console.error("Error deleting evaluation period:", error);
      this.app.showError(this.app.i18n.t("errors.delete_period_failed"));
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
.list-group-item:hover .job-type-actions, .list-group-item:hover .period-actions {
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
  const styleElement = document.createElement("div");
  styleElement.id = "settings-styles";
  styleElement.innerHTML = settingsStyles;
  document.head.appendChild(styleElement);
}

// Make SettingsPage globally available
window.SettingsPage = SettingsPage;
