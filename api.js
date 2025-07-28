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
        { id: "4", name: "鈴木 三郎", email: "suzuki@example.com", role: "worker", status: "pending_approval", department: "建設部", createdAt: "2024-02-01", lastLogin: null, tenantId: "tenant-001", jobType: "建設作業員" },
        { id: "5", name: "佐藤花子（他テナント）", email: "sato.other@example.com", role: "worker", status: "active", department: "設計部", createdAt: "2024-01-01", lastLogin: "2024-01-18", tenantId: "tenant-002", jobType: "設計士" },
    ];

    this._mockEvaluations = [
        { id: "eval-1", employeeName: "従業員", employeeId: "3", evaluatorName: "マネージャー", evaluatorId: "2", department: "建設部", period: "2024-q1", status: "completed", submittedAt: "2024-01-20", totalScore: 84, data: { "技術スキル": 85, "コミュニケーション": 78, "リーダーシップ": 82, "安全管理": 95, "チームワーク": 88, "積極性": 76 }, tenantId: "tenant-001" },
        { id: "eval-2", employeeName: "従業員", employeeId: "3", evaluatorName: "マネージャー", evaluatorId: "2", department: "建設部", period: "2024-q2", status: "pending", submittedAt: null, totalScore: null, data: {}, tenantId: "tenant-001" },
        { id: "eval-3", employeeName: "田中太郎", employeeId: "worker1", evaluatorName: "マネージャー", evaluatorId: "2", department: "建設部", period: "2024-q1", status: "completed", submittedAt: "2024-01-15", totalScore: 75, data: { "技術スキル": 70, "コミュニケーション": 80, "リーダーシップ": 65, "安全管理": 85, "チームワーク": 75, "積極性": 80 }, tenantId: "tenant-001" },
        { id: "eval-4", employeeName: "マネージャー", employeeId: "2", evaluatorName: "管理者", evaluatorId: "1", department: "建設部", period: "2024-q1", status: "completed", submittedAt: "2024-01-25", totalScore: 90, data: { "技術スキル": 90, "コミュニケーション": 92, "リーダーシップ": 88, "安全管理": 95, "チームワーク": 90, "積極性": 85 }, tenantId: "tenant-001" },
        // 他テナントの評価
        { id: "eval-5", employeeName: "佐藤花子（他テナント）", employeeId: "5", evaluatorName: "管理者2", evaluatorId: "4", department: "設計部", period: "2024-q1", status: "completed", submittedAt: "2024-01-28", totalScore: 88, data: { "技術スキル": 88, "コミュニケーション": 85, "リーダーシップ": 90, "安全管理": 87, "チームワーク": 89, "積極性": 86 }, tenantId: "tenant-002" },
    ];

    this._mockQualitativeGoals = [
      { id: "goal-1", userId: "3", userName: "従業員", period: "2024-q1", submittedAt: new Date("2024-07-01"), goals: [{ text: "建設現場での安全手順を100%遵守し、ヒヤリハットをゼロにする。", weight: 100 }], status: "pending_approval", tenantId: "tenant-001" },
      { id: "goal-2", userId: "2", userName: "マネージャー", period: "2024-q1", submittedAt: new Date("2024-06-25"), goals: [{ text: "チームの平均評価スコアを85点以上にする。", weight: 60 }, { text: "部下のOJT計画を立案・実施し、全員のスキルアップを支援する。", weight: 40 }], status: "approved", tenantId: "tenant-001" },
      { id: "goal-3", userId: "worker1", userName: "田中 太郎", period: "2024-q1", submittedAt: new Date("2024-07-20"), goals: [{ text: "新規導入されたCADソフトウェアの基本操作を習得し、設計業務での利用を開始する。", weight: 60 }, { text: "週に一度、技術部内での知識共有会に参加し、自身の専門知識を深める。", weight: 40 }], status: "pending_approval", tenantId: "tenant-001" },
      // 他テナントの目標
      { id: "goal-4", userId: "5", userName: "佐藤花子（他テナント）", period: "2024-q1", submittedAt: new Date("2024-07-10"), goals: [{ text: "新しい設計ツールの習得。", weight: 100 }], status: "pending_approval", tenantId: "tenant-002" },
    ];

    this._mockJobTypes = [
        { id: "construction-worker", name: "建設作業員", order: 1, tenantId: "tenant-001" },
        { id: "site-supervisor", name: "現場監督", order: 2, tenantId: "tenant-001" },
        { id: "project-manager", name: "プロジェクトマネージャー", order: 3, tenantId: "tenant-001" },
        { id: "architect", name: "建築家", order: 4, tenantId: "tenant-002" }, // 他テナント
    ];

    this._mockEvaluationPeriods = [
        { id: "2024-q1", name: "2024年 第1四半期", startDate: "2024-01-01", endDate: "2024-03-31", tenantId: "tenant-001" },
        { id: "2024-q2", name: "2024年 第2四半期", startDate: "2024-04-01", endDate: "2024-06-30", tenantId: "tenant-001" },
        { id: "2024-q3", name: "2024年 第3四半期", startDate: "2024-07-01", endDate: "2024-09-30", tenantId: "tenant-001" },
        { id: "2024-q4", name: "2024年 第4四半期", startDate: "2024-10-01", endDate: "2024-12-31", tenantId: "tenant-001" },
        { id: "2025-q1", name: "2025年 第1四半期", startDate: "2025-01-01", endDate: "2025-03-31", tenantId: "tenant-002" }, // 他テナント
    ];
    
    // 評価構造モック (職種IDに紐づく)
    this._mockEvaluationStructures = {
        "construction-worker": {
            jobTypeId: "construction-worker",
            categories: [
              { id: "tech", name: "技術スキル", items: [ { id: "t1", name: "専門技術の習得度", type: "quantitative" }, { id: "t2", name: "問題解決能力", type: "quantitative" } ] },
              { id: "comm", name: "コミュニケーション", items: [ { id: "c1", name: "チームワーク", type: "qualitative" }, { id: "c2", name: "報告・連絡・相談", type: "qualitative" } ] },
              { id: "safety", name: "安全意識", items: [ { id: "s1", name: "安全規則の遵守", type: "quantitative" }, { id: "s2", name: "危険予知能力", type: "qualitative" } ] },
            ],
        },
        "site-supervisor": {
            jobTypeId: "site-supervisor",
            categories: [
              { id: "leadership", name: "リーダーシップ", items: [ { id: "l1", name: "部下への指導力", type: "quantitative" }, { id: "l2", name: "進捗管理能力", type: "qualitative" } ] },
              { id: "planning", name: "計画・実行", items: [ { id: "p1", name: "工程計画立案能力", type: "quantitative" } ] },
            ],
        },
        "project-manager": {
            jobTypeId: "project-manager",
            categories: [
              { id: "strategy", name: "戦略的思考", items: [ { id: "st1", name: "目標設定能力", type: "quantitative" } ]},
              { id: "risk", name: "リスク管理", items: [ { id: "r1", name: "課題解決能力", type: "qualitative" } ]},
            ],
        }
    };
  }

  /**
   * Helper to filter data by current user's tenantId
   */
  _filterByTenant(data) {
    if (!this.app || !this.app.currentUser || !this.app.currentUser.tenantId) {
      console.warn("Current user or tenantId not available for filtering.");
      return [];
    }
    const tenantId = this.app.currentUser.tenantId;
    return data.filter(item => item.tenantId === tenantId);
  }

  /**
   * Helper for API delay
   */
  async _simulateDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
   * ロールに応じてデータをフィルタリングする（モック）
   */
  async getDashboardStats() {
    await this._simulateDelay();

    const currentUser = this.app.currentUser;
    if (!currentUser) return null;

    let filteredEvaluations = this._filterByTenant(this._mockEvaluations);
    let filteredUsers = this._filterByTenant(this._mockUsers);

    if (currentUser.role === "worker") {
        // 作業員: 自分の評価のみを対象
        filteredEvaluations = filteredEvaluations.filter(e => e.employeeId === currentUser.id);
        filteredUsers = filteredUsers.filter(u => u.id === currentUser.id); // ユーザー統計は自分のみに限定
    } else if (currentUser.role === "evaluator") {
        // 評価者: 自分が評価した従業員と自分自身の評価を対象
        const managedUserIds = this._getManagedUserIds(currentUser.id); // 仮にマネージャーが評価する従業員IDのリストを取得
        filteredEvaluations = filteredEvaluations.filter(e => 
            e.evaluatorId === currentUser.id || e.employeeId === currentUser.id || managedUserIds.includes(e.employeeId)
        );
        filteredUsers = filteredUsers.filter(u => u.id === currentUser.id || managedUserIds.includes(u.id));
    }
    // adminの場合はフィルタリングしない（_filterByTenantでテナント内全て）

    const totalEmployees = filteredUsers.length;
    const completedEvaluations = filteredEvaluations.filter(e => e.status === "completed").length;
    const pendingEvaluations = filteredEvaluations.filter(e => e.status === "pending").length;
    const scores = filteredEvaluations.filter(e => e.totalScore !== null).map(e => e.totalScore);
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

    const stats = {
      totalEmployees,
      pendingEvaluations,
      completedEvaluations,
      averageScore,
    };

    console.log("Dashboard stats loaded:", stats)
    return stats
  }

  // マネージャーが評価する部下のIDを返すモック (実際のシステムでは関連テーブルから取得)
  _getManagedUserIds(managerId) {
      if (managerId === "2") { // マネージャー（ID:2）の場合
          return ["3", "worker1"]; // 従業員（ID:3）と田中太郎（worker1）を評価すると仮定
      }
      return [];
  }

  /**
   * Get recent evaluations
   * 最近の評価を取得
   * ロールに応じてデータをフィルタリングする（モック）
   */
  async getRecentEvaluations() {
    await this._simulateDelay(300);

    const currentUser = this.app.currentUser;
    if (!currentUser) return [];

    let evaluations = this._filterByTenant(this._mockEvaluations);

    if (currentUser.role === "worker") {
        // 作業員: 自分の評価のみ
        evaluations = evaluations.filter(e => e.employeeId === currentUser.id);
    } else if (currentUser.role === "evaluator") {
        // 評価者: 自分が評価した従業員の評価、または自分自身の評価
        const managedUserIds = this._getManagedUserIds(currentUser.id);
        evaluations = evaluations.filter(e => 
            e.evaluatorId === currentUser.id || e.employeeId === currentUser.id || managedUserIds.includes(e.employeeId)
        );
    }
    // adminの場合はテナント内の全て

    // 最新5件を返す
    return evaluations.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5);
  }

  /**
   * Get evaluation chart data
   * 評価チャートデータを取得
   * ロールに応じてデータをフィルタリングし、平均値を計算する（モック）
   * @param {string} scope 'all' or 'personal' (for manager/admin), 'personal' only for worker
   * @param {string} userId specific user ID for 'personal' scope
   */
  async getEvaluationChartData(scope = 'all', userId = null) {
    await this._simulateDelay(400);

    const currentUser = this.app.currentUser;
    if (!currentUser) return null;

    let targetEvaluations = this._filterByTenant(this._mockEvaluations);

    if (scope === 'personal' || currentUser.role === "worker") {
        // 個人のデータ、または作業員の場合は自分のデータに限定
        const targetId = userId || currentUser.id;
        targetEvaluations = targetEvaluations.filter(e => e.employeeId === targetId && e.status === "completed");
    } else if (currentUser.role === "evaluator") {
        // 評価者の「全体」スコープは、自分が評価した従業員の平均
        const managedUserIds = this._getManagedUserIds(currentUser.id);
        targetEvaluations = targetEvaluations.filter(e => managedUserIds.includes(e.employeeId) && e.status === "completed");
    } else if (currentUser.role === "admin") {
        // 管理者の「全体」スコープはテナント内の全評価
        targetEvaluations = targetEvaluations.filter(e => e.status === "completed");
    } else {
        // それ以外のロール（またはデータなし）
        targetEvaluations = [];
    }


    const aggregatedScores = {};
    let evaluationCount = 0;

    targetEvaluations.forEach(evalItem => {
        if (evalItem.data) {
            evaluationCount++;
            for (const key in evalItem.data) {
                if (evalItem.data.hasOwnProperty(key)) {
                    if (!aggregatedScores[key]) {
                        aggregatedScores[key] = 0;
                    }
                    aggregatedScores[key] += evalItem.data[key];
                }
            }
        }
    });

    const labels = Object.keys(aggregatedScores).sort(); // ラベルをソートして一貫性を持たせる
    const data = labels.map(label => evaluationCount > 0 ? (aggregatedScores[label] / evaluationCount) : 0);

    // 点数が平均なので、スケールを0-100に変換 (現在5段階評価なので20倍)
    const scaledData = data.map(val => val * 20);

    const chartData = {
        radar: {
            labels: labels,
            datasets: [
                {
                    label: (scope === 'personal' || currentUser.role === 'worker') ? this.app.i18n.t("dashboard.personal_score") : this.app.i18n.t("dashboard.average_score"),
                    data: scaledData,
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
            labels: labels,
            datasets: [
                {
                    label: (scope === 'personal' || currentUser.role === 'worker') ? this.app.i18n.t("dashboard.personal_score") : this.app.i18n.t("dashboard.average_score"),
                    data: scaledData,
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
            labels: ["1月", "2月", "3月", "4月", "5月", "6月"], // 月ごとのデータは別途必要
            datasets: [
                {
                    label: (scope === 'personal' || currentUser.role === 'worker') ? this.app.i18n.t("dashboard.personal_score_trend") : this.app.i18n.t("dashboard.average_score_trend"),
                    data: [82, 85, 78, 88, 92, 87], // モックデータ
                    fill: false,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.1,
                },
            ],
        },
    };

    console.log("Chart data loaded with scope:", scope, chartData);
    return chartData;
  }

  /**
   * Get user list
   * ユーザーリストを取得
   * ロールに応じてデータをフィルタリングする（モック）
   * @param {string} roleFilter オプションのロールフィルター
   */
  async getUsers(roleFilter = null) {
    await this._simulateDelay(600);

    const currentUser = this.app.currentUser;
    if (!currentUser) return [];

    let users = this._filterByTenant(this._mockUsers);

    if (currentUser.role === "evaluator") {
        // 評価者: 自分自身と、自分が評価するworkerのみ
        const managedUserIds = this._getManagedUserIds(currentUser.id);
        users = users.filter(u => u.id === currentUser.id || (u.role === "worker" && managedUserIds.includes(u.id)));
    } else if (currentUser.role === "worker") {
        // 作業員: 自分自身のみ
        users = users.filter(u => u.id === currentUser.id);
    }
    // adminはテナント内の全て

    if (roleFilter && roleFilter !== "all") {
        users = users.filter(user => user.role === roleFilter);
    }

    // パスワードなどの機密情報は除く
    return users.map(user => {
        const { password, ...rest } = user;
        return rest;
    });
  }

  /**
   * Get job types for current tenant (mock)
   * @returns {Array} List of job type objects
   */
  async getJobTypes() {
    await this._simulateDelay(200);
    return this._filterByTenant(this._mockJobTypes);
  }

  /**
   * Get evaluation periods for current tenant (mock)
   * @returns {Array} List of evaluation period objects
   */
  async getEvaluationPeriods() {
    await this._simulateDelay(200);
    return this._filterByTenant(this._mockEvaluationPeriods);
  }

  /**
   * Get evaluation structure by job type (mock)
   * @param {string} jobTypeId
   * @returns {Object} Evaluation structure object
   */
  async getEvaluationStructure(jobTypeId) {
      await this._simulateDelay(300);
      const structure = this._mockEvaluationStructures[jobTypeId];
      if (structure) {
          // テナントIDフィルタリングはJobTypesで既に行われている前提
          return JSON.parse(JSON.stringify(structure)); // deep copy
      }
      return { categories: [] };
  }

  /**
   * Get qualitative goals (mock)
   * @param {string} userId optional user ID
   * @param {string} periodId optional period ID
   * @param {string} status optional status filter
   */
  async getQualitativeGoals(userId = null, periodId = null, status = null) {
      await this._simulateDelay(400);
      const currentUser = this.app.currentUser;
      if (!currentUser) return [];

      let goals = this._filterByTenant(this._mockQualitativeGoals);

      if (userId) {
          goals = goals.filter(g => g.userId === userId);
      }
      if (periodId) {
          goals = goals.filter(g => g.period === periodId);
      }
      if (status) {
          goals = goals.filter(g => g.status === status);
      }

      // 評価者には自分の部下の pending/approved 目標、または自分の目標が見える
      if (currentUser.role === "evaluator") {
          const managedUserIds = this._getManagedUserIds(currentUser.id);
          goals = goals.filter(g => managedUserIds.includes(g.userId) || g.userId === currentUser.id);
      } else if (currentUser.role === "worker") {
          // 作業員には自分の目標のみ見える
          goals = goals.filter(g => g.userId === currentUser.id);
      }
      // adminはテナント内の全て

      return JSON.parse(JSON.stringify(goals)); // deep copy
  }

  /**
   * Create evaluation (mock)
   */
  async createEvaluation(evaluationData) {
    await this._simulateDelay(800);
    const newEvaluation = {
      id: "eval-" + Date.now().toString(),
      ...evaluationData,
      createdAt: new Date().toISOString(),
    };
    this._mockEvaluations.push(newEvaluation); // モックデータを更新
    console.log("Mock Evaluation created:", newEvaluation);
    return newEvaluation;
  }

  /**
   * Update evaluation (mock)
   */
  async updateEvaluation(id, evaluationData) {
    await this._simulateDelay(600);
    const index = this._mockEvaluations.findIndex(e => e.id === id);
    if (index > -1) {
        this._mockEvaluations[index] = { ...this._mockEvaluations[index], ...evaluationData, updatedAt: new Date().toISOString() };
        console.log("Mock Evaluation updated:", this._mockEvaluations[index]);
        return this._mockEvaluations[index];
    }
    throw new Error("Evaluation not found");
  }

  /**
   * Delete evaluation (mock)
   */
  async deleteEvaluation(id) {
    await this._simulateDelay(400);
    this._mockEvaluations = this._mockEvaluations.filter(e => e.id !== id);
    console.log("Mock Evaluation deleted:", id);
    return { success: true };
  }

  /**
   * Get evaluations (list)
   * ロールに応じてデータをフィルタリングする（モック）
   */
  async getEvaluations(filters = {}) {
    await this._simulateDelay(700);
    const currentUser = this.app.currentUser;
    if (!currentUser) return [];

    let evaluations = this._filterByTenant(this._mockEvaluations);

    // ロールとフィルターを適用
    if (currentUser.role === "worker") {
        evaluations = evaluations.filter(e => e.employeeId === currentUser.id);
    } else if (currentUser.role === "evaluator") {
        const managedUserIds = this._getManagedUserIds(currentUser.id);
        evaluations = evaluations.filter(e => 
            e.evaluatorId === currentUser.id || e.employeeId === currentUser.id || managedUserIds.includes(e.employeeId)
        );
    }
    // adminはテナント内の全て

    if (filters.period) {
        evaluations = evaluations.filter(e => e.period === filters.period);
    }
    if (filters.status) {
        evaluations = evaluations.filter(e => e.status === filters.status);
    }
    if (filters.targetUserName) {
        const lowerCaseQuery = filters.targetUserName.toLowerCase();
        evaluations = evaluations.filter(e => e.employeeName.toLowerCase().includes(lowerCaseQuery));
    }

    return JSON.parse(JSON.stringify(evaluations)); // deep copy
  }

  /**
   * Create invitation (mock)
   */
  async createInvitation(invitationData) {
      await this._simulateDelay(500);
      const newInvitation = {
          id: "inv-" + Date.now().toString(),
          token: Math.random().toString(36).substr(2, 10), // ランダムトークン
          ...invitationData,
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後に期限切れ
      };
      console.log("Mock Invitation created:", newInvitation);
      return newInvitation;
  }

  /**
   * Get invitation (mock)
   */
  async getInvitation(token) {
      await this._simulateDelay(300);
      // モックでは常に有効な招待を返す（デモ用）
      const mockInvitation = {
          id: 'mock-inv-valid',
          token: token,
          role: 'worker', // Example role for invited user
          company: 'デモ建設',
          email: `invited-${token.substring(0, 5)}@example.com`,
          used: false,
          expiresAt: Date.now() + 3600000 // 1 hour from now
      };
      console.log("Mock Invitation retrieved for token:", token, mockInvitation);
      return mockInvitation;
  }

  /**
   * Register user with invitation (mock)
   * (auth.jsのregisterメソッドを呼び出す)
   */
  async registerWithInvitation(token, userData) {
      await this._simulateDelay(1000);
      // ここでまず招待トークンの検証 (getInvitationを呼び出す)
      const invitation = await this.getInvitation(token);
      if (!invitation || invitation.used || new Date(invitation.expiresAt) < new Date()) {
          throw new Error("Invalid, expired, or used invitation token.");
      }

      // Authサービス経由でユーザーを登録
      // Authサービスは自身で_mockUsersを更新するため、API側では特に追加しない
      const newUser = await this.app.auth.register({
          ...userData,
          role: invitation.role,
          tenantId: invitation.tenantId || "tenant-001", // 招待にtenantIdがあればそれを使う
      });
      
      // 招待を「使用済み」に更新するモック (実際はFirestore更新)
      // invitation.used = true;
      // invitation.usedAt = new Date().toISOString();
      // invitation.usedBy = newUser.id;

      console.log("Mock registerWithInvitation successful. New user:", newUser);
      return newUser;
  }

  /**
   * Handle API errors
   * APIエラーを処理
   */
  handleError(error) {
    console.error("API Error:", error)

    if (error.code === "NETWORK_ERROR") {
      return this.app.i18n.t("errors.network");
    } else if (error.code === "UNAUTHORIZED") {
      return this.app.i18n.t("errors.unauthorized");
    } else if (error.code === "FORBIDDEN") {
      return this.app.i18n.t("errors.forbidden");
    } else if (error.code === "NOT_FOUND") {
      return this.app.i18n.t("errors.not_found");
    } else {
      return this.app.i18n.t("errors.system");
    }
  }
}

// Make API globally available
window.API = API
