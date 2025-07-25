/**
 * Developer Page Component
 * 開発者ページコンポーネント
 */
class DeveloperPage {
  constructor(app) {
    this.app = app
  }

  /**
   * Render developer page
   * 開発者ページを描画
   */
  async render() {
    return `
            <div class="app-layout">
                <div class="main-content" id="mainContent">
                    <div class="content-wrapper">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h1>開発者ツール</h1>
                            <div class="developer-actions">
                                <button class="btn btn-outline-danger" onclick="DeveloperPage.clearAllData()">
                                    <i class="fas fa-trash me-2"></i>全データクリア
                                </button>
                            </div>
                        </div>

                        <!-- System Information -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">システム情報</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <table class="table table-sm">
                                            <tr>
                                                <td><strong>アプリケーション名:</strong></td>
                                                <td>建設業従業員評価管理システム</td>
                                            </tr>
                                            <tr>
                                                <td><strong>バージョン:</strong></td>
                                                <td>1.0.0</td>
                                            </tr>
                                            <tr>
                                                <td><strong>ビルド日:</strong></td>
                                                <td>${new Date().toLocaleDateString("ja-JP")}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>現在のユーザー:</strong></td>
                                                <td>${this.app.currentUser?.name || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>ユーザー役割:</strong></td>
                                                <td>${this.app.currentUser?.role || "N/A"}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div class="col-md-6">
                                        <table class="table table-sm">
                                            <tr>
                                                <td><strong>ブラウザ:</strong></td>
                                                <td>${navigator.userAgent.split(" ")[0]}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>言語:</strong></td>
                                                <td>${this.app.i18n?.getCurrentLanguage() || "ja"}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>画面サイズ:</strong></td>
                                                <td>${window.innerWidth} x ${window.innerHeight}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>ローカルストレージ使用量:</strong></td>
                                                <td id="storageUsage">計算中...</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Local Storage Data -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">ローカルストレージデータ</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>キー</th>
                                                <th>値</th>
                                                <th>サイズ</th>
                                                <th>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody id="localStorageTable">
                                            <tr>
                                                <td colspan="4" class="text-center">読み込み中...</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- API Test Tools -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">APIテストツール</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="apiEndpoint" class="form-label">エンドポイント</label>
                                            <input type="text" class="form-control" id="apiEndpoint" 
                                                   placeholder="/api/users" value="/api/users">
                                        </div>
                                        <div class="mb-3">
                                            <label for="apiMethod" class="form-label">メソッド</label>
                                            <select class="form-select" id="apiMethod">
                                                <option value="GET">GET</option>
                                                <option value="POST">POST</option>
                                                <option value="PUT">PUT</option>
                                                <option value="DELETE">DELETE</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="apiData" class="form-label">リクエストデータ (JSON)</label>
                                            <textarea class="form-control" id="apiData" rows="4" 
                                                      placeholder='{"key": "value"}'></textarea>
                                        </div>
                                        <button class="btn btn-primary" onclick="DeveloperPage.testAPI()">
                                            <i class="fas fa-play me-2"></i>APIテスト実行
                                        </button>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">レスポンス</label>
                                        <pre id="apiResponse" class="bg-light p-3 border rounded" style="height: 200px; overflow-y: auto;">
レスポンスがここに表示されます
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Mock Data Generator -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">モックデータ生成</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-3">
                                        <button class="btn btn-outline-primary w-100 mb-2" 
                                                onclick="DeveloperPage.generateMockUsers()">
                                            <i class="fas fa-users me-2"></i>ユーザーデータ
                                        </button>
                                    </div>
                                    <div class="col-md-3">
                                        <button class="btn btn-outline-primary w-100 mb-2" 
                                                onclick="DeveloperPage.generateMockGoals()">
                                            <i class="fas fa-bullseye me-2"></i>目標データ
                                        </button>
                                    </div>
                                    <div class="col-md-3">
                                        <button class="btn btn-outline-primary w-100 mb-2" 
                                                onclick="DeveloperPage.generateMockEvaluations()">
                                            <i class="fas fa-chart-bar me-2"></i>評価データ
                                        </button>
                                    </div>
                                    <div class="col-md-3">
                                        <button class="btn btn-outline-primary w-100 mb-2" 
                                                onclick="DeveloperPage.generateAllMockData()">
                                            <i class="fas fa-database me-2"></i>全データ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Console Logs -->
                        <div class="card">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">コンソールログ</h5>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="DeveloperPage.clearLogs()">
                                        <i class="fas fa-trash me-1"></i>クリア
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <pre id="consoleLogs" class="bg-dark text-light p-3 rounded" style="height: 300px; overflow-y: auto;">
コンソールログがここに表示されます
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Initialize developer page
   * 開発者ページを初期化
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

    // Load developer data
    this.loadLocalStorageData()
    this.calculateStorageUsage()
    this.setupConsoleCapture()

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI()
    }
  }

  /**
   * Load local storage data
   * ローカルストレージデータを読み込み
   */
  loadLocalStorageData() {
    const table = document.getElementById("localStorageTable")
    if (!table) return

    const rows = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      const size = new Blob([value]).size

      rows.push(`
                <tr>
                    <td><code>${this.app.sanitizeHtml(key)}</code></td>
                    <td class="text-truncate" style="max-width: 200px;" title="${this.app.sanitizeHtml(value)}">
                        ${this.app.sanitizeHtml(value.substring(0, 50))}${value.length > 50 ? "..." : ""}
                    </td>
                    <td>${size} bytes</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="DeveloperPage.removeStorageItem('${key}')">
                            削除
                        </button>
                    </td>
                </tr>
            `)
    }

    table.innerHTML =
      rows.length > 0
        ? rows.join("")
        : '<tr><td colspan="4" class="text-center text-muted">データがありません</td></tr>'
  }

  /**
   * Calculate storage usage
   * ストレージ使用量を計算
   */
  calculateStorageUsage() {
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      totalSize += new Blob([key + value]).size
    }

    const usageElement = document.getElementById("storageUsage")
    if (usageElement) {
      usageElement.textContent = `${(totalSize / 1024).toFixed(2)} KB`
    }
  }

  /**
   * Setup console capture
   * コンソールキャプチャを設定
   */
  setupConsoleCapture() {
    const logsElement = document.getElementById("consoleLogs")
    if (!logsElement) return

    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      originalLog.apply(console, args)
      this.addLogEntry("LOG", args.join(" "))
    }

    console.error = (...args) => {
      originalError.apply(console, args)
      this.addLogEntry("ERROR", args.join(" "))
    }

    console.warn = (...args) => {
      originalWarn.apply(console, args)
      this.addLogEntry("WARN", args.join(" "))
    }
  }

  /**
   * Add log entry
   * ログエントリを追加
   */
  addLogEntry(level, message) {
    const logsElement = document.getElementById("consoleLogs")
    if (!logsElement) return

    const timestamp = new Date().toLocaleTimeString("ja-JP")
    const logEntry = `[${timestamp}] ${level}: ${message}\n`

    logsElement.textContent += logEntry
    logsElement.scrollTop = logsElement.scrollHeight
  }

  /**
   * Test API endpoint
   * APIエンドポイントをテスト
   */
  static async testAPI() {
    const endpoint = document.getElementById("apiEndpoint").value
    const method = document.getElementById("apiMethod").value
    const dataText = document.getElementById("apiData").value
    const responseElement = document.getElementById("apiResponse")

    try {
      let data = null
      if (dataText.trim()) {
        data = JSON.parse(dataText)
      }

      const options = { method }
      if (data && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(data)
        options.headers = { "Content-Type": "application/json" }
      }

      // Mock API response
      const mockResponse = {
        status: 200,
        message: "Mock API response",
        data: { id: 1, name: "Test Data" },
        timestamp: new Date().toISOString(),
      }

      responseElement.textContent = JSON.stringify(mockResponse, null, 2)
      window.app.showSuccess("APIテストが完了しました。")
    } catch (error) {
      responseElement.textContent = `Error: ${error.message}`
      window.app.showError("APIテストでエラーが発生しました。")
    }
  }

  /**
   * Generate mock users
   * モックユーザーを生成
   */
  static generateMockUsers() {
    const mockUsers = [
      { id: 1, name: "田中太郎", email: "tanaka@example.com", role: "worker" },
      { id: 2, name: "佐藤花子", email: "sato@example.com", role: "worker" },
      { id: 3, name: "山田次郎", email: "yamada@example.com", role: "manager" },
    ]

    localStorage.setItem("mockUsers", JSON.stringify(mockUsers))
    window.app.showSuccess("モックユーザーデータを生成しました。")

    const page = window.app.currentPage
    if (page && page.loadLocalStorageData) {
      page.loadLocalStorageData()
      page.calculateStorageUsage()
    }
  }

  /**
   * Generate mock goals
   * モック目標を生成
   */
  static generateMockGoals() {
    const mockGoals = [
      { id: 1, userId: 1, text: "品質向上を図る", weight: 40, status: "pending" },
      { id: 2, userId: 2, text: "効率化を推進する", weight: 35, status: "approved" },
      { id: 3, userId: 3, text: "安全管理を強化する", weight: 25, status: "pending" },
    ]

    localStorage.setItem("mockGoals", JSON.stringify(mockGoals))
    window.app.showSuccess("モック目標データを生成しました。")

    const page = window.app.currentPage
    if (page && page.loadLocalStorageData) {
      page.loadLocalStorageData()
      page.calculateStorageUsage()
    }
  }

  /**
   * Generate mock evaluations
   * モック評価を生成
   */
  static generateMockEvaluations() {
    const mockEvaluations = [
      { id: 1, evaluatorId: 3, targetId: 1, period: "2024-q1", status: "completed", score: 4.2 },
      { id: 2, evaluatorId: 3, targetId: 2, period: "2024-q1", status: "in-progress", score: null },
    ]

    localStorage.setItem("mockEvaluations", JSON.stringify(mockEvaluations))
    window.app.showSuccess("モック評価データを生成しました。")

    const page = window.app.currentPage
    if (page && page.loadLocalStorageData) {
      page.loadLocalStorageData()
      page.calculateStorageUsage()
    }
  }

  /**
   * Generate all mock data
   * 全モックデータを生成
   */
  static generateAllMockData() {
    DeveloperPage.generateMockUsers()
    DeveloperPage.generateMockGoals()
    DeveloperPage.generateMockEvaluations()
    window.app.showSuccess("全モックデータを生成しました。")
  }

  /**
   * Remove storage item
   * ストレージアイテムを削除
   */
  static removeStorageItem(key) {
    if (confirm(`"${key}" を削除しますか？`)) {
      localStorage.removeItem(key)
      window.app.showSuccess("データを削除しました。")

      const page = window.app.currentPage
      if (page && page.loadLocalStorageData) {
        page.loadLocalStorageData()
        page.calculateStorageUsage()
      }
    }
  }

  /**
   * Clear all data
   * 全データをクリア
   */
  static clearAllData() {
    if (confirm("全てのローカルデータを削除しますか？この操作は取り消せません。")) {
      localStorage.clear()
      window.app.showSuccess("全データを削除しました。")

      const page = window.app.currentPage
      if (page && page.loadLocalStorageData) {
        page.loadLocalStorageData()
        page.calculateStorageUsage()
      }
    }
  }

  /**
   * Clear console logs
   * コンソールログをクリア
   */
  static clearLogs() {
    const logsElement = document.getElementById("consoleLogs")
    if (logsElement) {
      logsElement.textContent = "コンソールログがここに表示されます\n"
    }
  }
}

// Make DeveloperPage globally available
window.DeveloperPage = DeveloperPage
