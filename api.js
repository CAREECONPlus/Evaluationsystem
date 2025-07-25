/**
 * API Service
 * APIサービス
 */
class API {
  constructor() {
    this.app = null
    this.baseURL = "/api"
    this.isInitialized = false
  }

  /**
   * Initialize API service
   * APIサービスを初期化
   */
  init() {
    try {
      console.log("Initializing API service...")
      this.isInitialized = true
      console.log("API service initialized")
    } catch (error) {
      console.error("Failed to initialize API service:", error)
      throw error
    }
  }

  /**
   * Get dashboard statistics
   * ダッシュボード統計を取得
   */
  async getDashboardStats() {
    try {
      console.log("Getting dashboard stats...")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data
      const stats = {
        totalEmployees: 25,
        pendingEvaluations: 8,
        completedEvaluations: 17,
        averageScore: 87.5,
      }

      console.log("Dashboard stats loaded:", stats)
      return stats
    } catch (error) {
      console.error("Error getting dashboard stats:", error)
      throw error
    }
  }

  /**
   * Get recent evaluations
   * 最近の評価を取得
   */
  async getRecentEvaluations() {
    try {
      console.log("Getting recent evaluations...")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Mock data
      const evaluations = [
        {
          id: "1",
          employeeName: "田中太郎",
          department: "建設部",
          status: "completed",
          date: "2024-01-15",
          score: 85,
        },
        {
          id: "2",
          employeeName: "佐藤花子",
          department: "設計部",
          status: "pending",
          date: "2024-01-14",
          score: null,
        },
        {
          id: "3",
          employeeName: "鈴木一郎",
          department: "営業部",
          status: "completed",
          date: "2024-01-13",
          score: 92,
        },
        {
          id: "4",
          employeeName: "高橋美咲",
          department: "総務部",
          status: "pending",
          date: "2024-01-12",
          score: null,
        },
        {
          id: "5",
          employeeName: "山田健太",
          department: "建設部",
          status: "completed",
          date: "2024-01-11",
          score: 78,
        },
      ]

      console.log("Recent evaluations loaded:", evaluations.length)
      return evaluations
    } catch (error) {
      console.error("Error getting recent evaluations:", error)
      throw error
    }
  }

  /**
   * Get evaluation chart data
   * 評価チャートデータを取得
   */
  async getEvaluationChartData() {
    try {
      console.log("Getting evaluation chart data...")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Mock chart data
      const chartData = {
        radar: {
          labels: ["技術力", "コミュニケーション", "リーダーシップ", "安全管理", "チームワーク", "積極性"],
          datasets: [
            {
              label: "平均スコア",
              data: [85, 78, 82, 95, 88, 76],
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              pointBackgroundColor: "rgba(54, 162, 235, 1)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            },
          ],
        },
        bar: {
          labels: ["技術力", "コミュニケーション", "リーダーシップ", "安全管理", "チームワーク", "積極性"],
          datasets: [
            {
              label: "平均スコア",
              data: [85, 78, 82, 95, 88, 76],
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 205, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
                "rgba(153, 102, 255, 0.8)",
                "rgba(255, 159, 64, 0.8)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 205, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        line: {
          labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
          datasets: [
            {
              label: "平均スコア推移",
              data: [82, 85, 78, 88, 92, 87],
              fill: false,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.1,
            },
          ],
        },
      }

      console.log("Chart data loaded")
      return chartData
    } catch (error) {
      console.error("Error getting chart data:", error)
      throw error
    }
  }

  /**
   * Get user list
   * ユーザーリストを取得
   */
  async getUsers() {
    try {
      console.log("Getting users...")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Mock user data
      const users = [
        {
          id: "1",
          name: "管理者",
          email: "admin@example.com",
          role: "admin",
          status: "active",
          department: "管理部",
          createdAt: "2024-01-01",
          lastLogin: "2024-01-20",
        },
        {
          id: "2",
          name: "マネージャー",
          email: "manager@example.com",
          role: "manager",
          status: "active",
          department: "建設部",
          createdAt: "2024-01-01",
          lastLogin: "2024-01-19",
        },
        {
          id: "3",
          name: "従業員",
          email: "employee@example.com",
          role: "employee",
          status: "active",
          department: "建設部",
          createdAt: "2024-01-01",
          lastLogin: "2024-01-18",
        },
      ]

      console.log("Users loaded:", users.length)
      return users
    } catch (error) {
      console.error("Error getting users:", error)
      throw error
    }
  }

  /**
   * Create evaluation
   * 評価を作成
   */
  async createEvaluation(evaluationData) {
    try {
      console.log("Creating evaluation:", evaluationData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock response
      const evaluation = {
        id: Date.now().toString(),
        ...evaluationData,
        createdAt: new Date().toISOString(),
        status: "draft",
      }

      console.log("Evaluation created:", evaluation.id)
      return evaluation
    } catch (error) {
      console.error("Error creating evaluation:", error)
      throw error
    }
  }

  /**
   * Update evaluation
   * 評価を更新
   */
  async updateEvaluation(id, evaluationData) {
    try {
      console.log("Updating evaluation:", id, evaluationData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Mock response
      const evaluation = {
        id,
        ...evaluationData,
        updatedAt: new Date().toISOString(),
      }

      console.log("Evaluation updated:", id)
      return evaluation
    } catch (error) {
      console.error("Error updating evaluation:", error)
      throw error
    }
  }

  /**
   * Delete evaluation
   * 評価を削除
   */
  async deleteEvaluation(id) {
    try {
      console.log("Deleting evaluation:", id)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400))

      console.log("Evaluation deleted:", id)
      return { success: true }
    } catch (error) {
      console.error("Error deleting evaluation:", error)
      throw error
    }
  }

  /**
   * Get evaluations
   * 評価リストを取得
   */
  async getEvaluations(filters = {}) {
    try {
      console.log("Getting evaluations with filters:", filters)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 700))

      // Mock evaluation data
      const evaluations = [
        {
          id: "1",
          employeeName: "田中太郎",
          evaluatorName: "佐藤マネージャー",
          department: "建設部",
          period: "2024-Q1",
          status: "completed",
          scores: {
            technical: 85,
            communication: 78,
            leadership: 82,
            safety: 95,
            teamwork: 88,
            initiative: 76,
          },
          overallScore: 84,
          createdAt: "2024-01-15",
          completedAt: "2024-01-20",
        },
        {
          id: "2",
          employeeName: "佐藤花子",
          evaluatorName: "田中マネージャー",
          department: "設計部",
          period: "2024-Q1",
          status: "pending",
          scores: null,
          overallScore: null,
          createdAt: "2024-01-14",
          completedAt: null,
        },
      ]

      console.log("Evaluations loaded:", evaluations.length)
      return evaluations
    } catch (error) {
      console.error("Error getting evaluations:", error)
      throw error
    }
  }

  /**
   * Handle API errors
   * APIエラーを処理
   */
  handleError(error) {
    console.error("API Error:", error)

    if (error.code === "NETWORK_ERROR") {
      return "ネットワークエラーが発生しました。"
    } else if (error.code === "UNAUTHORIZED") {
      return "認証が必要です。"
    } else if (error.code === "FORBIDDEN") {
      return "アクセス権限がありません。"
    } else if (error.code === "NOT_FOUND") {
      return "データが見つかりません。"
    } else {
      return "エラーが発生しました。"
    }
  }
}

// Make API globally available
window.API = API
