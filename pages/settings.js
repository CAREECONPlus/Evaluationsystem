/**
 * Settings Page Component
 * 設定ページコンポーネント
 */
class SettingsPage {
  constructor(app) {
    this.app = app
    this.jobTypes = []
    this.selectedJobType = null
    this.evaluationStructure = null
    this.hasUnsavedChanges = false
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
                            onclick="SettingsPage.saveChanges()" disabled>
                        <span data-i18n="settings.save_changes">変更を保存</span>
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
                                            onclick="SettingsPage.showAddJobTypeModal()">
                                        <span data-i18n="settings.add_job_type">職種を追加</span>
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
                                <div id="evaluationStructure">
                                    <p class="text-center text-muted">
                                        左側から職種を選択してください
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Initialize settings page
   * 設定ページを初期化
   */
  async init() {
    // Check permissions
    if (!this.app.hasRole("admin")) {
      this.app.navigate("/dashboard")
      return
    }

    // Update header and sidebar
    if (window.HeaderComponent) {
      window.HeaderComponent.update(this.app.currentUser)
    }
    if (window.SidebarComponent) {
      window.SidebarComponent.update(this.app.currentUser)
    }

    // Load data
    await this.loadJobTypes()

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI()
    }

    // Setup beforeunload warning for unsaved changes
    this.setupUnsavedChangesWarning()
  }

  /**
   * Load job types
   * 職種を読み込み
   */
  async loadJobTypes() {
    try {
      // Mock data - implement actual API call
      this.jobTypes = [
        { id: "construction-worker", name: "建設作業員", order: 1 },
        { id: "site-supervisor", name: "現場監督", order: 2 },
        { id: "project-manager", name: "プロジェクトマネージャー", order: 3 },
      ]

      this.renderJobTypesList()
    } catch (error) {
      console.error("Error loading job types:", error)
      this.app.showError("職種データの読み込みに失敗しました。")
    }
  }

  /**
   * Render job types list
   * 職種リストを描画
   */
  renderJobTypesList() {
    const container = document.getElementById("jobTypesList")

    if (this.jobTypes.length === 0) {
      container.innerHTML = "<p>職種が登録されていません。</p>"
      return
    }

    container.innerHTML = `
            <div class="job-types-list">
                ${this.jobTypes
                  .map(
                    (jobType) => `
                    <div class="job-type-item ${this.selectedJobType?.id === jobType.id ? "active" : ""}" 
                         onclick="SettingsPage.selectJobType('${jobType.id}')">
                        <div class="job-type-name">${this.app.sanitizeHtml(jobType.name)}</div>
                        <div class="job-type-actions">
                            <button class="btn btn-sm btn-secondary" 
                                    onclick="event.stopPropagation(); SettingsPage.editJobType('${jobType.id}')">
                                編集
                            </button>
                            <button class="btn btn-sm btn-danger" 
                                    onclick="event.stopPropagation(); SettingsPage.deleteJobType('${jobType.id}')">
                                削除
                            </button>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `
  }

  /**
   * Select job type
   * 職種を選択
   */
  static async selectJobType(jobTypeId) {
    const page = window.app.currentPage
    if (!page) return

    page.selectedJobType = page.jobTypes.find((jt) => jt.id === jobTypeId)
    page.renderJobTypesList()
    await page.loadEvaluationStructure(jobTypeId)
  }

  /**
   * Load evaluation structure for job type
   * 職種の評価構造を読み込み
   */
  async loadEvaluationStructure(jobTypeId) {
    try {
      const tenantId = this.app.currentUser.tenantId
      this.evaluationStructure = await this.app.api.getEvaluationStructure(tenantId, jobTypeId)

      if (!this.evaluationStructure) {
        // Create default structure
        this.evaluationStructure = {
          jobTypeId,
          categories: [
            {
              id: "technical-skills",
              name: "技術スキル",
              items: [
                { id: "skill-1", name: "専門技術", type: "quantitative" },
                { id: "skill-2", name: "作業効率", type: "quantitative" },
              ],
            },
            {
              id: "communication",
              name: "コミュニケーション",
              items: [
                { id: "comm-1", name: "チームワーク", type: "qualitative" },
                { id: "comm-2", name: "報告・連絡", type: "qualitative" },
              ],
            },
          ],
        }
      }

      this.renderEvaluationStructure()
    } catch (error) {
      console.error("Error loading evaluation structure:", error)
      this.app.showError("評価構造の読み込みに失敗しました。")
    }
  }

  /**
   * Render evaluation structure
   * 評価構造を描画
   */
  renderEvaluationStructure() {
    const container = document.getElementById("evaluationStructure")

    if (!this.evaluationStructure) {
      container.innerHTML = '<p class="text-center text-muted">職種を選択してください</p>'
      return
    }

    container.innerHTML = `
            <div class="evaluation-structure-editor">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4>${this.selectedJobType.name} の評価構造</h4>
                    <button class="btn btn-primary btn-sm" 
                            onclick="SettingsPage.addCategory()">
                        <span data-i18n="settings.add_category">カテゴリを追加</span>
                    </button>
                </div>
                
                <div class="categories-list">
                    ${this.evaluationStructure.categories
                      .map(
                        (category, categoryIndex) => `
                        <div class="category-card" data-category-index="${categoryIndex}">
                            <div class="category-header">
                                <input type="text" class="category-name-input" 
                                       value="${this.app.sanitizeHtml(category.name)}"
                                       onchange="SettingsPage.updateCategoryName(${categoryIndex}, this.value)">
                                <button class="btn btn-danger btn-sm" 
                                        onclick="SettingsPage.deleteCategory(${categoryIndex})">
                                    削除
                                </button>
                            </div>
                            
                            <div class="items-list">
                                ${category.items
                                  .map(
                                    (item, itemIndex) => `
                                    <div class="item-row" data-item-index="${itemIndex}">
                                        <input type="text" class="item-name-input" 
                                               value="${this.app.sanitizeHtml(item.name)}"
                                               onchange="SettingsPage.updateItemName(${categoryIndex}, ${itemIndex}, this.value)">
                                        <select class="item-type-select" 
                                                onchange="SettingsPage.updateItemType(${categoryIndex}, ${itemIndex}, this.value)">
                                            <option value="quantitative" ${item.type === "quantitative" ? "selected" : ""}>
                                                定量的
                                            </option>
                                            <option value="qualitative" ${item.type === "qualitative" ? "selected" : ""}>
                                                定性的
                                            </option>
                                        </select>
                                        <button class="btn btn-danger btn-sm" 
                                                onclick="SettingsPage.deleteItem(${categoryIndex}, ${itemIndex})">
                                            削除
                                        </button>
                                    </div>
                                `,
                                  )
                                  .join("")}
                                
                                <button class="btn btn-secondary btn-sm add-item-btn" 
                                        onclick="SettingsPage.addItem(${categoryIndex})">
                                    <span data-i18n="settings.add_item">項目を追加</span>
                                </button>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `
  }

  /**
   * Mark as having unsaved changes
   * 未保存の変更ありとしてマーク
   */
  markUnsavedChanges() {
    this.hasUnsavedChanges = true
    const saveBtn = document.getElementById("saveChangesBtn")
    if (saveBtn) {
      saveBtn.disabled = false
    }
  }

  /**
   * Setup unsaved changes warning
   * 未保存変更の警告を設定
   */
  setupUnsavedChangesWarning() {
    window.addEventListener("beforeunload", (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = "未保存の変更があります。ページを離れますか？"
      }
    })
  }

  /**
   * Add category
   * カテゴリを追加
   */
  static addCategory() {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    const newCategory = {
      id: `category-${Date.now()}`,
      name: "新しいカテゴリ",
      items: [],
    }

    page.evaluationStructure.categories.push(newCategory)
    page.renderEvaluationStructure()
    page.markUnsavedChanges()
  }

  /**
   * Delete category
   * カテゴリを削除
   */
  static deleteCategory(categoryIndex) {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    if (!confirm("このカテゴリを削除しますか？")) return

    page.evaluationStructure.categories.splice(categoryIndex, 1)
    page.renderEvaluationStructure()
    page.markUnsavedChanges()
  }

  /**
   * Update category name
   * カテゴリ名を更新
   */
  static updateCategoryName(categoryIndex, newName) {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    page.evaluationStructure.categories[categoryIndex].name = newName
    page.markUnsavedChanges()
  }

  /**
   * Add item to category
   * カテゴリに項目を追加
   */
  static addItem(categoryIndex) {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    const newItem = {
      id: `item-${Date.now()}`,
      name: "新しい項目",
      type: "quantitative",
    }

    page.evaluationStructure.categories[categoryIndex].items.push(newItem)
    page.renderEvaluationStructure()
    page.markUnsavedChanges()
  }

  /**
   * Delete item
   * 項目を削除
   */
  static deleteItem(categoryIndex, itemIndex) {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    if (!confirm("この項目を削除しますか？")) return

    page.evaluationStructure.categories[categoryIndex].items.splice(itemIndex, 1)
    page.renderEvaluationStructure()
    page.markUnsavedChanges()
  }

  /**
   * Update item name
   * 項目名を更新
   */
  static updateItemName(categoryIndex, itemIndex, newName) {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    page.evaluationStructure.categories[categoryIndex].items[itemIndex].name = newName
    page.markUnsavedChanges()
  }

  /**
   * Update item type
   * 項目タイプを更新
   */
  static updateItemType(categoryIndex, itemIndex, newType) {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    page.evaluationStructure.categories[categoryIndex].items[itemIndex].type = newType
    page.markUnsavedChanges()
  }

  /**
   * Save changes
   * 変更を保存
   */
  static async saveChanges() {
    const page = window.app.currentPage
    if (!page || !page.evaluationStructure) return

    try {
      const tenantId = window.app.currentUser.tenantId
      await window.app.api.saveEvaluationStructure(tenantId, page.selectedJobType.id, page.evaluationStructure)

      window.app.showSuccess("設定を保存しました。")
      page.hasUnsavedChanges = false

      const saveBtn = document.getElementById("saveChangesBtn")
      if (saveBtn) {
        saveBtn.disabled = true
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      window.app.showError("設定の保存に失敗しました。")
    }
  }

  /**
   * Show add job type modal
   * 職種追加モーダルを表示
   */
  static showAddJobTypeModal() {
    const modal = document.createElement("div")
    modal.className = "modal show"
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">職種を追加</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addJobTypeForm" onsubmit="SettingsPage.handleAddJobType(event)">
                        <div class="form-group">
                            <label for="jobTypeName">職種名</label>
                            <input type="text" id="jobTypeName" name="name" required 
                                   placeholder="例: 建設作業員">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" 
                                    onclick="this.closest('.modal').remove()">
                                キャンセル
                            </button>
                            <button type="submit" class="btn btn-primary">
                                追加
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `

    document.body.appendChild(modal)
  }

  /**
   * Handle add job type form submission
   * 職種追加フォーム送信を処理
   */
  static async handleAddJobType(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const name = formData.get("name")

    const page = window.app.currentPage
    if (!page) return

    try {
      // Mock implementation - add to local array
      const newJobType = {
        id: `job-type-${Date.now()}`,
        name: name,
        order: page.jobTypes.length + 1,
      }

      page.jobTypes.push(newJobType)
      page.renderJobTypesList()

      window.app.showSuccess("職種を追加しました。")
      form.closest(".modal").remove()
    } catch (error) {
      console.error("Error adding job type:", error)
      window.app.showError("職種の追加に失敗しました。")
    }
  }

  /**
   * Edit job type
   * 職種を編集
   */
  static editJobType(jobTypeId) {
    // Implementation for job type editing
    window.app.showError("職種編集機能は実装中です。")
  }

  /**
   * Delete job type
   * 職種を削除
   */
  static async deleteJobType(jobTypeId) {
    if (!confirm("この職種を削除しますか？関連する評価データも削除されます。")) {
      return
    }

    const page = window.app.currentPage
    if (!page) return

    try {
      // Mock implementation - remove from local array
      page.jobTypes = page.jobTypes.filter((jt) => jt.id !== jobTypeId)
      page.renderJobTypesList()

      // Clear evaluation structure if this job type was selected
      if (page.selectedJobType?.id === jobTypeId) {
        page.selectedJobType = null
        page.evaluationStructure = null
        const container = document.getElementById("evaluationStructure")
        container.innerHTML = '<p class="text-center text-muted">職種を選択してください</p>'
      }

      window.app.showSuccess("職種を削除しました。")
    } catch (error) {
      console.error("Error deleting job type:", error)
      window.app.showError("職種の削除に失敗しました。")
    }
  }
}

// Add settings-specific styles
const settingsStyles = `
<style>
.settings-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    height: calc(100vh - 140px);
}

.settings-sidebar {
    height: fit-content;
}

.settings-main {
    height: fit-content;
}

.job-types-list {
    max-height: 400px;
    overflow-y: auto;
}

.job-type-item {
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.job-type-item:hover {
    background-color: #f8f9fa;
    border-color: #007bff;
}

.job-type-item.active {
    background-color: #e3f2fd;
    border-color: #007bff;
}

.job-type-name {
    font-weight: 500;
}

.job-type-actions {
    display: flex;
    gap: 5px;
}

.evaluation-structure-editor {
    max-height: 600px;
    overflow-y: auto;
}

.category-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    padding: 15px;
    background: #fafafa;
}

.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.category-name-input {
    font-size: 1.1rem;
    font-weight: 600;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    flex: 1;
    margin-right: 10px;
}

.items-list {
    background: white;
    border-radius: 4px;
    padding: 10px;
}

.item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.item-name-input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 6px 10px;
}

.item-type-select {
    width: 120px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 6px 10px;
}

.add-item-btn {
    width: 100%;
    margin-top: 10px;
    border: 2px dashed #ddd;
    background: transparent;
    color: #666;
}

.add-item-btn:hover {
    border-color: #007bff;
    color: #007bff;
    background: #f8f9fa;
}

@media (max-width: 992px) {
    .settings-layout {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .category-header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
    
    .item-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
    
    .item-type-select {
        width: 100%;
    }
}
</style>
`

// Inject settings styles
if (!document.getElementById("settings-styles")) {
  const styleElement = document.createElement("div")
  styleElement.id = "settings-styles"
  styleElement.innerHTML = settingsStyles
  document.head.appendChild(styleElement)
}

// Make SettingsPage globally available
window.SettingsPage = SettingsPage
