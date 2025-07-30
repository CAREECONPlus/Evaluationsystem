/**
 * API Service
 * APIサービス
 */
class API {
  constructor() {
    this.app = null
    this.baseURL = "/api"
    this.isInitialized = false

    // Mock data storage (for frontend simulation)
    this._mockUsers = [
        { id: "1", name: "管理者", email: "admin@example.com", role: "admin", status: "active", department: "管理部", createdAt: "2024-01-01", lastLogin: "2024-01-20", tenantId: "tenant-001", jobType: "管理職" },
        { id: "2", name: "マネージャー", email: "manager@example.com", role: "evaluator", status: "active", department: "建設部", createdAt: "2024-01-01", lastLogin: "2024-01-19", tenantId: "tenant-001", jobType: "現場監督" },
        { id: "3", name: "従業員", email: "employee@example.com", role: "worker", status: "active", department: "建設部", createdAt: "2024-01-01", lastLogin: "2024-01-18", tenantId: "tenant-001", jobType: "建設作業員" },
    ];

    this._mockEvaluations = [
        { id: "eval-1", employeeName: "従業員", employeeId: "3", evaluatorName: "マネージャー", evaluatorId: "2", department: "建設部", period: "2024-q1", status: "completed", submittedAt: "2024-01-20", totalScore: 4.2, data: { "技術スキル": 4, "コミュニケーション": 5, "安全管理": 3.5 }, tenantId: "tenant-001" },
        { id: "eval-2", employeeName: "従業員", employeeId: "3", evaluatorName: "マネージャー", evaluatorId: "2", department: "建設部", period: "2024-q2", status: "pending", submittedAt: null, totalScore: null, data: {}, tenantId: "tenant-001" },
        { id: "eval-3", employeeName: "マネージャー", employeeId: "2", evaluatorName: "管理者", evaluatorId: "1", department: "建設部", period: "2024-q1", status: "completed", submittedAt: "2024-01-25", totalScore: 4.8, data: { "リーダーシップ": 5, "計画・実行": 4.5 }, tenantId: "tenant-001" },
    ];

    this._mockQualitativeGoals = [
      { id: "goal-1", userId: "3", userName: "従業員", period: "2024-q1", submittedAt: new Date("2024-07-01"), goals: [{ text: "安全手順を100%遵守する。", weight: 100 }], status: "approved", tenantId: "tenant-001" },
      { id: "goal-2", userId: "2", userName: "マネージャー", period: "2024-q1", submittedAt: new Date("2024-06-25"), goals: [{ text: "チームの平均スコアを4.5以上にする。", weight: 100 }], status: "approved", tenantId: "tenant-001" },
    ];

    this._mockJobTypes = [
        { id: "construction-worker", name: "建設作業員", order: 1, tenantId: "tenant-001" },
        { id: "site-supervisor", name: "現場監督", order: 2, tenantId: "tenant-001" },
    ];

    this._mockEvaluationPeriods = [
        { id: "2024-q1", name: "2024年 第1四半期", startDate: "2024-01-01", endDate: "2024-03-31", tenantId: "tenant-001" },
        { id: "2024-q2", name: "2024年 第2四半期", startDate: "2024-04-01", endDate: "2024-06-30", tenantId: "tenant-001" },
    ];
    
    this._mockEvaluationStructures = {
        "construction-worker": {
            jobTypeId: "construction-worker",
            categories: [
              { id: "tech", name: "技術スキル", items: [ { id: "t1", name: "専門技術の習得度", type: "quantitative" } ] },
              { id: "comm", name: "コミュニケーション", items: [ { id: "c1", name: "チームワーク", type: "qualitative" } ] },
              { id: "safety", name: "安全管理", items: [ { id: "s1", name: "安全規則の遵守", type: "quantitative" } ] },
            ],
        },
        "site-supervisor": {
            jobTypeId: "site-supervisor",
            categories: [
              { id: "leadership", name: "リーダーシップ", items: [ { id: "l1", name: "部下への指導力", type: "qualitative" } ] },
              { id: "planning", name: "計画・実行", items: [ { id: "p1", name: "工程計画立案能力", type: "quantitative" } ] },
            ],
        }
    };
  }

  _filterByTenant(data) {
    const tenantId = this.app?.currentUser?.tenantId;
    if (!tenantId) return [];
    return data.filter(item => item.tenantId === tenantId);
  }

  async _simulateDelay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  init() {
    this.isInitialized = true;
    console.log("API service initialized");
  }

  // ... (getDashboardStats, getRecentEvaluations, etc. remain the same) ...
  
  async getEvaluations(filters = {}) {
    await this._simulateDelay();
    // In a real app, you'd apply filters on the backend. Here we filter the mock data.
    return this._filterByTenant(this._mockEvaluations);
  }

  /**
   * ★★★ 追加: IDで単一の評価データを取得する ★★★
   * @param {string} evaluationId - The ID of the evaluation to retrieve.
   * @returns {Promise<Object|null>} The evaluation data or null if not found.
   */
  async getEvaluationById(evaluationId) {
    await this._simulateDelay();
    const evaluation = this._mockEvaluations.find(e => e.id === evaluationId);
    
    // Ensure the user has permission to view this evaluation (tenant check)
    if (evaluation && this.app?.currentUser?.tenantId === evaluation.tenantId) {
      return JSON.parse(JSON.stringify(evaluation)); // Return a deep copy
    }
    
    return null; // Not found or no permission
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

  async getQualitativeGoals(userId, periodId) {
    await this._simulateDelay();
    return this._filterByTenant(this._mockQualitativeGoals).filter(g => g.userId === userId && g.period === periodId && g.status === 'approved');
  }

  async getEvaluationStructure(jobTypeId) {
    await this._simulateDelay();
    return this._mockEvaluationStructures[jobTypeId] || { categories: [] };
  }

  async getAllEvaluationStructures() {
    await this._simulateDelay();
    return JSON.parse(JSON.stringify(this._mockEvaluationStructures));
  }

  // ... (Other methods like saveSettings, etc.)
}

window.API = API;
