/**
 * API Service
 * APIサービス
 */
class API {
  constructor() {
    this.app = null
    this.baseURL = "/api"
    this.isInitialized = false

    // Mock data storage
    this._mockUsers = [
        { id: "1", name: "管理者", email: "admin@example.com", role: "admin", status: "active", createdAt: "2024-01-01", tenantId: "tenant-001", jobType: "管理職" },
        { id: "2", name: "マネージャー", email: "manager@example.com", role: "evaluator", status: "active", createdAt: "2024-01-01", tenantId: "tenant-001", jobType: "現場監督" },
        { id: "3", name: "従業員", email: "employee@example.com", role: "worker", status: "active", createdAt: "2024-01-01", tenantId: "tenant-001", jobType: "建設作業員" },
    ];
    this._mockEvaluations = [
        { id: "eval-1", employeeName: "従業員", employeeId: "3", evaluatorName: "マネージャー", period: "2024-q1", status: "completed", submittedAt: "2024-01-20", totalScore: 4.2, data: { "技術スキル": 85, "コミュニケーション": 78, "安全管理": 95 }, tenantId: "tenant-001" },
        { id: "eval-2", employeeName: "マネージャー", employeeId: "2", evaluatorName: "管理者", period: "2024-q1", status: "completed", submittedAt: "2024-01-25", totalScore: 4.8, data: { "リーダーシップ": 92, "計画・実行": 88 }, tenantId: "tenant-001" },
    ];
    this._mockQualitativeGoals = [
      { id: "goal-1", userId: "3", userName: "従業員", period: "2024-q1", submittedAt: new Date("2024-07-01"), goals: [{ text: "安全手順遵守", weight: 100 }], status: "approved", tenantId: "tenant-001" },
    ];
    this._mockJobTypes = [
        { id: "construction-worker", name: "建設作業員", tenantId: "tenant-001" },
        { id: "site-supervisor", name: "現場監督", tenantId: "tenant-001" },
    ];
    this._mockEvaluationPeriods = [
        { id: "2024-q1", name: "2024年 第1四半期", startDate: "2024-01-01", endDate: "2024-03-31", tenantId: "tenant-001" },
        { id: "2024-q2", name: "2024年 第2四半期", startDate: "2024-04-01", endDate: "2024-06-30", tenantId: "tenant-001" },
    ];
    this._mockEvaluationStructures = {
        "construction-worker": { categories: [{ name: "技術スキル", items: [{ name: "専門技術", type: "quantitative" }] }] },
        "site-supervisor": { categories: [{ name: "リーダーシップ", items: [{ name: "指導力", type: "qualitative" }] }] }
    };
  }

  init() { this.isInitialized = true; }
  async _simulateDelay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }
  _filterByTenant(data) {
    const tenantId = this.app?.currentUser?.tenantId;
    return tenantId ? data.filter(item => item.tenantId === tenantId) : [];
  }

  /**
   * ★★★ 追加: ダッシュボードの統計情報を取得する関数 ★★★
   */
  async getDashboardStats() {
    await this._simulateDelay();
    const evaluations = this._filterByTenant(this._mockEvaluations);
    return {
      totalEmployees: this._filterByTenant(this._mockUsers).length,
      pendingEvaluations: evaluations.filter(e => e.status === "pending").length,
      completedEvaluations: evaluations.filter(e => e.status === "completed").length,
      averageScore: 4.5, // Mock data
    };
  }

  /**
   * ★★★ 追加: ダッシュボードの最近の評価を取得する関数 ★★★
   */
  async getRecentEvaluations() {
    await this._simulateDelay();
    return this._filterByTenant(this._mockEvaluations).slice(0, 5);
  }

  /**
   * ★★★ 追加: ダッシュボード用チャートデータを取得する関数 ★★★
   */
  async getEvaluationChartData() {
    await this._simulateDelay();
    const labels = ["技術力", "コミュニケーション", "リーダーシップ", "安全管理", "チームワーク"];
    const generateData = () => labels.map(() => Math.random() * 80 + 20); // 20-100のランダムデータ
    return {
      radar: {
        labels,
        datasets: [{ label: "平均スコア", data: generateData(), backgroundColor: "rgba(54, 162, 235, 0.2)", borderColor: "rgb(54, 162, 235)" }]
      },
      bar: {
        labels,
        datasets: [{ label: "平均スコア", data: generateData(), backgroundColor: "rgba(75, 192, 192, 0.6)" }]
      },
      line: {
        labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
        datasets: [{ label: "スコア推移", data: [65, 59, 80, 81, 56, 55], fill: false, borderColor: "rgb(255, 99, 132)" }]
      }
    };
  }

  async getEvaluations() {
    await this._simulateDelay();
    return this._filterByTenant(this._mockEvaluations);
  }

  async getEvaluationById(evaluationId) {
    await this._simulateDelay();
    return this._filterByTenant(this._mockEvaluations).find(e => e.id === evaluationId) || null;
  }

  async getUsers() {
    await this._simulateDelay();
    return this._filterByTenant(this._mockUsers);
  }

  async getEvaluationPeriods() {
    await this._simulateDelay();
    return this._filterByTenant(this._mockEvaluationPeriods);
  }
  
  async getJobTypes() {
    await this._simulateDelay();
    return this._filterByTenant(this._mockJobTypes);
  }

  async getQualitativeGoals(userId, periodId, status) {
    await this._simulateDelay();
    let goals = this._filterByTenant(this._mockQualitativeGoals);
    if (userId) goals = goals.filter(g => g.userId === userId);
    if (periodId) goals = goals.filter(g => g.period === periodId);
    if (status) goals = goals.filter(g => g.status === status);
    return goals;
  }

  async getEvaluationStructure(jobTypeId) {
    await this._simulateDelay();
    return this._mockEvaluationStructures[jobTypeId] || { categories: [] };
  }

  async getAllEvaluationStructures() {
    await this._simulateDelay();
    return JSON.parse(JSON.stringify(this._mockEvaluationStructures));
  }
}

window.API = API;
