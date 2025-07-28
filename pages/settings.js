/**
 * Settings Page Component
 * 設定ページコンポーネント
 */
class SettingsPage {
  constructor(app) {
    this.app = app;
    this.jobTypes = [];
    this.selectedJobType = null;
    this.evaluationStructure = null;
    this.hasUnsavedChanges = false;
  }

  /**
   * Render settings page
   * 設定ページを描画
   */
  async render() {
    return `
            <div class="settings-page">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h1 data-i18n="settings.title">設定</h1>
                    <button class="btn btn-success" id="saveChangesBtn"
                            onclick="window.app.currentPage.saveChanges()" disabled>
                        <i class="fas fa-save me-2"></i><span data-i18n="settings.save_changes">変更を保存</span>
                    </button>
                </div>

                <div class="settings-layout">
                    <!-- Job Types Panel -->
                    <div class="settings-sidebar">
                        <div class="card">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h3 data-i18n="settings.job_types">対象職種</h3>
                                    <button class="btn btn-primary btn-sm"
                                            onclick="window.app.currentPage.showAddJobTypeModal()">
                                        <i class="fas fa-plus"></i> <span data-i18n="settings.add_job_type"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="jobTypesList">
                                    <div class="loading">読み込み中...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Evaluation Structure Panel -->
                    <div class="settings-main">
                        <div class="card">
                            <div class="card-header">
                                <h3 data-i18n="settings.evaluation_structure">評価構造</h3>
                            </div>
                            <div class="card-body">
                                <div id="evaluationStructureContainer">
                                    <div class="text-center text-muted p-5">
                                        <i class="fas fa-arrow-left me-2"></i>左側から職種を選択してください
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Job Type Modal -->
            <div class="modal fade" id="addJobTypeModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">職種を追加</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="addJobTypeForm" onsubmit="window.app.currentPage.handleAddJobType(event)">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label for="jobTypeName" class="form-label">職種名 *</label>
                                    <input type="text" class="form-control" id="jobTypeName" required>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                                <button type="submit" class="btn btn-primary">追加</button>
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
    const modalElement = document.getElementById('addJobTypeModal');
    if (modalElement && window.bootstrap) {
        this.addJobTypeModal = new window.bootstrap.Modal(modalElement);
    }

    // Load data
    await this.loadJobTypes();

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
      // Mock data
      this.jobTypes = [
        { id: "construction-worker", name: "建設作業員", order: 1 },
        { id: "site-supervisor", name: "現場監督", order: 2 },
        { id: "project-manager", name: "プロジェクトマネージャー", order: 3 },
      ];

      this.renderJobTypesList();
    } catch (error) {
      console.error("Error loading job types:", error);
      this.app.showError("職種データの読み込みに失敗しました。");
    }
  }

  /**
   * Render job types list
   * 職種リストを描画
   */
  renderJobTypesList() {
    const container = document.getElementById("jobTypesList");

    if (this.jobTypes.length === 0) {
      container.innerHTML = "<p>職種が登録されていません。</p>";
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
                                    onclick="event.stopPropagation(); window.app.currentPage.deleteJobType('${jobType.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </span>
                    </a>
                `,
                  )
                  .join("")}
            </div>
        `;
  }

  /**
   * Select job type
   * 職種を選択
   */
  async selectJobType(jobTypeId) {
    if (this.hasUnsavedChanges) {
        if(!confirm("未保存の変更があります。移動しますか？")) {
            return;
        }
    }
    this.selectedJobType = this.jobTypes.find((jt) => jt.id === jobTypeId);
    this.hasUnsavedChanges = false;
    document.getElementById("saveChangesBtn").disabled = true;
    this.renderJobTypesList();
    await this.loadEvaluationStructure(jobTypeId);
  }

  /**
   * Load evaluation structure for job type
   * 職種の評価構造を読み込み
   */
  async loadEvaluationStructure(jobTypeId) {
    try {
      // Mock data
      this.evaluationStructure = {
          jobTypeId,
          categories: [
            { id: `cat-${jobTypeId}-1`, name: "技術スキル", items: [ { id: `item-${jobTypeId}-1`, name: "専門技術", type: "quantitative" } ]},
            { id: `cat-${jobTypeId}-2`, name: "コミュニケーション", items: [ { id: `item-${jobTypeId}-2`, name: "チームワーク", type: "qualitative" } ]},
          ]
      };
      this.renderEvaluationStructure();
    } catch (error) {
      console.error("Error loading evaluation structure:", error);
      this.app.showError("評価構造の読み込みに失敗しました。");
    }
  }

  /**
   * Render evaluation structure
   * 評価構造を描画
   */
  renderEvaluationStructure() {
    const container = document.getElementById("evaluationStructureContainer");

    if (!this.selectedJobType) {
      container.innerHTML = `<div class="text-center text-muted p-5"><i class="fas fa-arrow-left me-2"></i>左側から職種を選択してください</div>`;
      return;
    }

    container.innerHTML = `
            <div class="evaluation-structure-editor">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4>${this.app.sanitizeHtml(this.selectedJobType.name)} の評価構造</h4>
                    <button class="btn btn-outline-primary btn-sm"
                            onclick="window.app.currentPage.addCategory()">
                        <i class="fas fa-plus me-2"></i><span data-i18n="settings.add_category">カテゴリを追加</span>
                    </button>
                </div>
                <div id="categoriesList">
                    ${this.evaluationStructure.categories.map((category, categoryIndex) => this.renderCategory(category, categoryIndex)).join("")}
                </div>
            </div>
        `;
  }
  
  renderCategory(category, categoryIndex) {
      return `
        <div class="card mb-3 category-card" data-category-index="${categoryIndex}">
            <div class="card-header category-header">
                <input type="text" class="form-control form-control-sm category-name-input"
                       value="${this.app.sanitizeHtml(category.name)}"
                       onchange="window.app.currentPage.updateCategoryName(${categoryIndex}, this.value)">
                <button class="btn btn-sm btn-outline-danger"
                        onclick="window.app.currentPage.deleteCategory(${categoryIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="list-group list-group-flush items-list">
                ${category.items.map((item, itemIndex) => this.renderItem(item, categoryIndex, itemIndex)).join("")}
                <div class="list-group-item">
                    <button class="btn btn-secondary btn-sm w-100 add-item-btn"
                            onclick="window.app.currentPage.addItem(${categoryIndex})">
                        <i class="fas fa-plus me-2"></i><span data-i18n="settings.add_item">項目を追加</span>
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
                   onchange="window.app.currentPage.updateItemName(${categoryIndex}, ${itemIndex}, this.value)">
            <select class="form-select form-select-sm"
                    onchange="window.app.currentPage.updateItemType(${categoryIndex}, ${itemIndex}, this.value)">
                <option value="quantitative" ${item.type === "quantitative" ? "selected" : ""}>定量的</option>
                <option value="qualitative" ${item.type === "qualitative" ? "selected" : ""}>定性的</option>
            </select>
            <button class="btn btn-sm btn-outline-danger"
                    onclick="window.app.currentPage.deleteItem(${categoryIndex}, ${itemIndex})">
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
        return e.returnValue = "未保存の変更があります。ページを離れますか？";
      }
    };
  }

  addCategory() {
    if (!this.evaluationStructure) return;
    const newCategory = { id: `category-${Date.now()}`, name: "新しいカテゴリ", items: [] };
    this.evaluationStructure.categories.push(newCategory);
    this.renderEvaluationStructure();
    this.markUnsavedChanges();
  }

  deleteCategory(categoryIndex) {
    if (!confirm("このカテゴリを削除しますか？カテゴリ内の項目もすべて削除されます。")) return;
    this.evaluationStructure.categories.splice(categoryIndex, 1);
    this.renderEvaluationStructure();
    this.markUnsavedChanges();
  }

  updateCategoryName(categoryIndex, newName) {
    this.evaluationStructure.categories[categoryIndex].name = newName;
    this.markUnsavedChanges();
  }

  addItem(categoryIndex) {
    const newItem = { id: `item-${Date.now()}`, name: "新しい項目", type: "quantitative" };
    this.evaluationStructure.categories[categoryIndex].items.push(newItem);
    this.renderEvaluationStructure();
    this.markUnsavedChanges();
  }

  deleteItem(categoryIndex, itemIndex) {
    if (!confirm("この項目を削除しますか？")) return;
    this.evaluationStructure.categories[categoryIndex].items.splice(itemIndex, 1);
    this.renderEvaluationStructure();
    this.markUnsavedChanges();
  }

  updateItemName(categoryIndex, itemIndex, newName) {
    this.evaluationStructure.categories[categoryIndex].items[itemIndex].name = newName;
    this.markUnsavedChanges();
  }

  updateItemType(categoryIndex, itemIndex, newType) {
    this.evaluationStructure.categories[categoryIndex].items[itemIndex].type = newType;
    this.markUnsavedChanges();
  }

  async saveChanges() {
    if (!this.evaluationStructure) return;
    try {
      // Mock API call
      console.log("Saving changes:", this.evaluationStructure);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      this.app.showSuccess("設定を保存しました。");
      this.hasUnsavedChanges = false;
      document.getElementById("saveChangesBtn").disabled = true;
    } catch (error) {
      console.error("Error saving settings:", error);
      this.app.showError("設定の保存に失敗しました。");
    }
  }

  showAddJobTypeModal() {
    if(this.addJobTypeModal) {
        document.getElementById('addJobTypeForm').reset();
        this.addJobTypeModal.show();
    }
  }

  async handleAddJobType(event) {
    event.preventDefault();
    const name = document.getElementById("jobTypeName").value;
    if (!name) return;

    try {
      const newJobType = { id: `job-type-${Date.now()}`, name: name, order: this.jobTypes.length + 1 };
      this.jobTypes.push(newJobType);
      this.renderJobTypesList();
      this.app.showSuccess("職種を追加しました。");
      if(this.addJobTypeModal) this.addJobTypeModal.hide();
    } catch (error) {
      console.error("Error adding job type:", error);
      this.app.showError("職種の追加に失敗しました。");
    }
  }
  
  async deleteJobType(jobTypeId) {
    if (!confirm("この職種を削除しますか？関連する評価構造も削除されます。")) return;
    
    try {
      this.jobTypes = this.jobTypes.filter((jt) => jt.id !== jobTypeId);
      if (this.selectedJobType?.id === jobTypeId) {
        this.selectedJobType = null;
        this.evaluationStructure = null;
        this.hasUnsavedChanges = false;
        document.getElementById("saveChangesBtn").disabled = true;
        this.renderEvaluationStructure();
      }
      this.renderJobTypesList();
      this.app.showSuccess("職種を削除しました。");
    } catch (error) {
      console.error("Error deleting job type:", error);
      this.app.showError("職種の削除に失敗しました。");
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
.job-type-actions {
    opacity: 0;
    transition: opacity 0.2s;
}
.list-group-item:hover .job-type-actions {
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
