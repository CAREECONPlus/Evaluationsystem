/**
 * Reports Overview Page Component
 * レポート概要ページコンポーネント - 過去の評価との比較と統計情報
 */
export class EvaluationReportPage {
  constructor(app) {
    this.app = app;
    this.reportData = null;
    this.chartInstances = {};
    this.isInitialized = false;
    this.currentTimeRange = 'last6months';
    
    // 権限別設定
    this.currentUser = null;
    this.userRole = null;
    this.isWorker = false;
    this.isEvaluator = false;
    this.isAdmin = false;
    this.subordinateIds = [];
  }

  async render() {
    // 権限情報を初期化
    await this.initializeUserPermissions();
    
    // 権限別レンダリング
    if (this.isWorker) {
      return this.renderWorkerView();
    } else if (this.isEvaluator) {
      return this.renderEvaluatorView();
    } else if (this.isAdmin) {
      return this.renderAdminView();
    }
    
    // フォールバック（権限不明時）
    return this.renderDefaultView();
  }

  /**
   * ユーザー権限の初期化
   */
  async initializeUserPermissions() {
    try {
      this.currentUser = this.app.currentUser || this.app.auth.user;
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      this.userRole = this.currentUser.role || 'worker';
      this.isWorker = this.userRole === 'worker';
      this.isEvaluator = this.userRole === 'evaluator';
      this.isAdmin = this.userRole === 'admin';

      // 評価者の場合は担当する作業員IDを取得
      if (this.isEvaluator) {
        this.subordinateIds = await this.getSubordinateIds();
      }

      console.log(`Reports: User role initialized - ${this.userRole}`);
    } catch (error) {
      console.error('Reports: Failed to initialize user permissions:', error);
      this.userRole = 'worker';
      this.isWorker = true;
    }
  }

  /**
   * 担当作業員IDの取得
   */
  async getSubordinateIds() {
    try {
      const subordinates = await this.app.api.getSubordinates();
      return subordinates.map(user => user.id) || [];
    } catch (error) {
      console.error('Reports: Failed to get subordinates:', error);
      return [];
    }
  }

  /**
   * 権限に応じたデータアクセス制御
   */
  
  /**
   * 作業員用データ取得
   */
  async loadWorkerData() {
    try {
      const userId = this.currentUser.uid || this.currentUser.id;
      console.log('Reports: Loading worker data for user:', userId);
      
      // 実際の評価データを取得
      const evaluations = await this.app.api.getEvaluations({
        targetUserId: userId
      });

      const filteredEvaluations = this.filterEvaluationsByTimeRange(evaluations);
      
      return {
        evaluations: filteredEvaluations,
        statistics: this.calculateWorkerStatistics(filteredEvaluations),
        trends: this.calculatePersonalTrends(filteredEvaluations),
        improvements: this.analyzeImprovements(filteredEvaluations),
        strengths: this.analyzeStrengths(filteredEvaluations)
      };
    } catch (error) {
      console.error('Reports: Failed to load worker data:', error);
      return this.getDefaultWorkerData();
    }
  }

  /**
   * 評価者用データ取得
   */
  async loadEvaluatorData() {
    try {
      const userId = this.currentUser.uid || this.currentUser.id;
      console.log('Reports: Loading evaluator data for user:', userId);

      // 個人の評価データ
      const personalData = await this.loadWorkerData();

      // 担当者の評価データを取得
      const allEvaluations = await this.app.api.getEvaluations({
        evaluatorId: userId
      });

      const filteredEvaluations = this.filterEvaluationsByTimeRange(allEvaluations);
      
      // 担当者リストを取得
      const subordinateUsers = await this.app.api.getUsers({
        evaluatorId: userId
      }) || [];

      return {
        personal: personalData,
        subordinates: filteredEvaluations,
        subordinateList: subordinateUsers,
        progress: this.calculateEvaluationProgress(filteredEvaluations),
        subordinateStats: this.calculateSubordinateStatistics(filteredEvaluations)
      };
    } catch (error) {
      console.error('Reports: Failed to load evaluator data:', error);
      return this.getDefaultEvaluatorData();
    }
  }

  /**
   * 管理者用データ取得
   */
  async loadAdminData() {
    try {
      console.log('Reports: Loading admin data for organization');

      // 個人の評価データ
      const personalData = await this.loadWorkerData();

      // 組織全体の評価データを取得
      const allEvaluations = await this.app.api.getEvaluations({});
      const filteredEvaluations = this.filterEvaluationsByTimeRange(allEvaluations);
      
      // 全ユーザー情報を取得
      const allUsers = await this.app.api.getUsers({}) || [];
      
      return {
        personal: personalData,
        allEvaluations: filteredEvaluations,
        organizationStats: this.calculateOrganizationStatistics(filteredEvaluations),
        skillAnalysis: this.analyzeOrganizationSkills(filteredEvaluations),
        departmentAnalysis: this.analyzeDepartmentPerformance(filteredEvaluations, allUsers),
        userList: allUsers
      };
    } catch (error) {
      console.error('Reports: Failed to load admin data:', error);
      return this.getDefaultAdminData();
    }
  }

  /**
   * データ処理ヘルパーメソッド
   */
  
  /**
   * 時間範囲によるフィルタリング
   */
  filterEvaluationsByTimeRange(evaluations) {
    if (!evaluations || evaluations.length === 0) return [];
    
    const now = new Date();
    let startDate;
    
    switch (this.currentTimeRange) {
      case 'last3months':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'last6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case 'thisyear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        return evaluations;
    }
    
    return evaluations.filter(evaluation => {
      const evalDate = new Date(evaluation.evaluatedAt || evaluation.updatedAt || evaluation.createdAt);
      return evalDate >= startDate;
    });
  }

  /**
   * 作業員統計の計算
   */
  calculateWorkerStatistics(evaluations) {
    if (!evaluations || evaluations.length === 0) {
      return this.getDefaultStats();
    }

    const completedEvaluations = evaluations.filter(e => e.status === 'completed');
    const scores = completedEvaluations.map(e => parseFloat(e.finalScore) || 0).filter(s => s > 0);
    
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    // 改善率の計算（前回と今回の比較）
    let improvementRate = 0;
    if (scores.length >= 2) {
      const recentScores = scores.slice(-2);
      improvementRate = ((recentScores[1] - recentScores[0]) / recentScores[0]) * 100;
    }

    return {
      totalEvaluations: evaluations.length,
      completedEvaluations: completedEvaluations.length,
      averageScore: averageScore,
      improvementRate: improvementRate
    };
  }

  /**
   * 個人評価推移の計算
   */
  calculatePersonalTrends(evaluations) {
    if (!evaluations || evaluations.length === 0) {
      return { labels: [], datasets: [] };
    }

    const completedEvaluations = evaluations
      .filter(e => e.status === 'completed' && e.finalScore)
      .sort((a, b) => new Date(a.evaluatedAt || a.updatedAt) - new Date(b.evaluatedAt || b.updatedAt));
    
    if (completedEvaluations.length === 0) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: completedEvaluations.map(e => this.formatDate(e.evaluatedAt || e.updatedAt)),
      datasets: [{
        label: '総合評価',
        data: completedEvaluations.map(e => parseFloat(e.finalScore) || 0),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  /**
   * 改善ポイントの分析
   */
  analyzeImprovements(evaluations) {
    if (!evaluations || evaluations.length === 0) return [];

    const latestEvaluation = evaluations
      .filter(e => e.status === 'completed' && e.ratings)
      .sort((a, b) => new Date(b.evaluatedAt || b.updatedAt) - new Date(a.evaluatedAt || a.updatedAt))[0];

    if (!latestEvaluation || !latestEvaluation.ratings) return [];

    const improvements = [];
    const ratings = latestEvaluation.ratings;
    
    // スコアが3以下の項目を改善ポイントとする
    Object.keys(ratings).forEach(key => {
      const score = parseFloat(ratings[key]);
      if (score > 0 && score <= 3 && !key.includes('Comment')) {
        improvements.push({
          category: this.getSkillCategoryName(key),
          currentScore: score,
          targetScore: Math.min(score + 1, 5),
          advice: this.generateAdvice(key, score)
        });
      }
    });

    return improvements.slice(0, 5); // 上位5つまで
  }

  /**
   * 強みの分析
   */
  analyzeStrengths(evaluations) {
    if (!evaluations || evaluations.length === 0) return [];

    const latestEvaluation = evaluations
      .filter(e => e.status === 'completed' && e.ratings)
      .sort((a, b) => new Date(b.evaluatedAt || b.updatedAt) - new Date(a.evaluatedAt || a.updatedAt))[0];

    if (!latestEvaluation || !latestEvaluation.ratings) return [];

    const strengths = [];
    const ratings = latestEvaluation.ratings;
    
    // スコアが4以上の項目を強みとする
    Object.keys(ratings).forEach(key => {
      const score = parseFloat(ratings[key]);
      if (score >= 4 && !key.includes('Comment')) {
        strengths.push({
          category: this.getSkillCategoryName(key),
          score: score,
          description: this.generateStrengthDescription(key, score)
        });
      }
    });

    return strengths.slice(0, 5); // 上位5つまで
  }

  calculateEvaluationProgress(subordinateEvaluations) {
    if (!subordinateEvaluations || subordinateEvaluations.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = subordinateEvaluations.filter(e => e.status === 'completed').length;
    const total = subordinateEvaluations.length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * デフォルトデータ
   */
  getDefaultWorkerData() {
    return {
      evaluations: [],
      statistics: this.getDefaultStats(),
      trends: { labels: [], datasets: [] }
    };
  }

  getDefaultEvaluatorData() {
    return {
      personal: this.getDefaultWorkerData(),
      subordinates: [],
      subordinateList: [],
      progress: { completed: 0, total: 0, percentage: 0 }
    };
  }

  getDefaultAdminData() {
    return {
      personal: this.getDefaultWorkerData(),
      allEvaluations: [],
      organizationStats: this.getDefaultOrgStats(),
      skillAnalysis: this.getDefaultSkillData(),
      departmentAnalysis: []
    };
  }

  getDefaultOrgStats() {
    return {
      totalEmployees: 45,
      evaluationRate: 78,
      averageScore: 4.0,
      topSkills: ['責任感', '協調性', '学習意欲'],
      weakSkills: ['リーダーシップ', '技術力', 'コミュニケーション']
    };
  }

  getDefaultSkillData() {
    return {
      topSkills: [
        { name: '責任感', score: '4.6' },
        { name: '協調性', score: '4.4' },
        { name: '学習意欲', score: '4.3' },
        { name: '時間管理', score: '4.2' },
        { name: '問題解決', score: '4.1' }
      ],
      improvementAreas: [
        { name: 'リーダーシップ', score: '2.4' },
        { name: '技術力', score: '2.6' },
        { name: 'コミュニケーション', score: '2.7' }
      ],
      skillDistribution: {
        '初級': 25,
        '中級': 35,
        '上級': 30,
        'エキスパート': 10
      }
    };
  }

  /**
   * 作業員向けレポート表示
   */
  renderWorkerView() {
    return `
      <div class="reports-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1">
            <i class="fas fa-user-chart me-2"></i>個人レポート
          </h1>
          <p class="page-subtitle text-dark mb-0">あなたの評価データの分析と推移</p>
        </div>

        ${this.renderCommonTimeRangeSelector()}

        <!-- 個人統計サマリー -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">総合評価</h6>
                <h3 class="card-title mb-0 text-primary" id="personalOverallScore">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">前回比較</h6>
                <h3 class="card-title mb-0 text-success" id="personalScoreChange">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">改善項目</h6>
                <h3 class="card-title mb-0 text-warning" id="improvementCount">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">強み項目</h6>
                <h3 class="card-title mb-0 text-info" id="strengthCount">-</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- スコア推移と項目別分析 -->
        <div class="row mb-4">
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-chart-line me-2 text-primary"></i>評価推移
                </h5>
              </div>
              <div class="card-body">
                <canvas id="personalTrendChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-radar-chart me-2 text-primary"></i>項目別評価
                </h5>
              </div>
              <div class="card-body">
                <canvas id="personalRadarChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 改善ポイントと強み -->
        <div class="row mb-4">
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-exclamation-triangle me-2 text-warning"></i>改善ポイント
                </h5>
              </div>
              <div class="card-body">
                <div id="improvementPoints">
                  <div class="text-center py-4">
                    <div class="spinner-border text-warning" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-star me-2 text-success"></i>あなたの強み
                </h5>
              </div>
              <div class="card-body">
                <div id="strengthPoints">
                  <div class="text-center py-4">
                    <div class="spinner-border text-success" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 評価者向けレポート表示
   */
  renderEvaluatorView() {
    return `
      <div class="reports-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1">
            <i class="fas fa-users-cog me-2"></i>評価者レポート
          </h1>
          <p class="page-subtitle text-dark mb-0">担当者の評価状況と個人データ</p>
        </div>

        ${this.renderCommonTimeRangeSelector()}

        <!-- 担当者概要 -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">担当者数</h6>
                <h3 class="card-title mb-0 text-primary" id="subordinateCount">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">評価完了率</h6>
                <h3 class="card-title mb-0 text-success" id="evaluationProgress">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">平均評価</h6>
                <h3 class="card-title mb-0 text-warning" id="averageScore">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">個人評価</h6>
                <h3 class="card-title mb-0 text-info" id="personalScore">-</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 担当者リストと個人チャート -->
        <div class="row mb-4">
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-list-ul me-2 text-primary"></i>担当者評価状況
                </h5>
              </div>
              <div class="card-body">
                <div id="subordinateList">
                  <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-chart-line me-2 text-primary"></i>個人評価推移
                </h5>
              </div>
              <div class="card-body">
                <canvas id="evaluatorPersonalChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 担当者比較チャート -->
        <div class="card mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="fas fa-chart-bar me-2 text-primary"></i>担当者比較分析
            </h5>
          </div>
          <div class="card-body">
            <canvas id="subordinateComparisonChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 管理者向けレポート表示
   */
  renderAdminView() {
    return `
      <div class="reports-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1">
            <i class="fas fa-chart-network me-2"></i>組織スキルマップ
          </h1>
          <p class="page-subtitle text-dark mb-0">全社員の能力分析と組織の強み・弱み</p>
        </div>

        ${this.renderCommonTimeRangeSelector()}

        <!-- 組織概要統計 -->
        <div class="row mb-4">
          <div class="col-md-2 mb-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">総従業員数</h6>
                <h3 class="card-title mb-0 text-primary" id="totalEmployees">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-2 mb-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">評価完了率</h6>
                <h3 class="card-title mb-0 text-success" id="orgEvaluationRate">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-2 mb-3">
            <div class="card border-warning">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">組織平均</h6>
                <h3 class="card-title mb-0 text-warning" id="orgAverageScore">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-2 mb-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">強いスキル</h6>
                <h3 class="card-title mb-0 text-info" id="topSkillCount">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-2 mb-3">
            <div class="card border-danger">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">弱いスキル</h6>
                <h3 class="card-title mb-0 text-danger" id="weakSkillCount">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-2 mb-3">
            <div class="card border-secondary">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">個人評価</h6>
                <h3 class="card-title mb-0 text-secondary" id="adminPersonalScore">-</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- スキルマップと分析 -->
        <div class="row mb-4">
          <div class="col-lg-8 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-map me-2 text-primary"></i>組織スキルマップ
                </h5>
              </div>
              <div class="card-body">
                <canvas id="organizationSkillMap"></canvas>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-chart-pie me-2 text-primary"></i>スキル分布
                </h5>
              </div>
              <div class="card-body">
                <canvas id="skillDistributionChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 強み・弱み分析 -->
        <div class="row mb-4">
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-thumbs-up me-2 text-success"></i>組織の強み
                </h5>
              </div>
              <div class="card-body">
                <div id="organizationStrengths">
                  <div class="text-center py-4">
                    <div class="spinner-border text-success" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-exclamation-triangle me-2 text-danger"></i>改善が必要な分野
                </h5>
              </div>
              <div class="card-body">
                <div id="organizationWeaknesses">
                  <div class="text-center py-4">
                    <div class="spinner-border text-danger" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 部門別・職種別分析 -->
        <div class="row mb-4">
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-building me-2 text-primary"></i>部門別パフォーマンス
                </h5>
              </div>
              <div class="card-body">
                <canvas id="departmentPerformanceChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <i class="fas fa-briefcase me-2 text-primary"></i>職種別スキル分析
                </h5>
              </div>
              <div class="card-body">
                <canvas id="jobTypeSkillChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 共通期間選択UI
   */
  renderCommonTimeRangeSelector() {
    return `
      <div class="card mb-4">
        <div class="card-body py-2">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="btn-group" role="group" id="timeRangeButtons">
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'last3months' ? 'active' : ''}" data-range="last3months">
                  過去3ヶ月
                </button>
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'last6months' ? 'active' : ''}" data-range="last6months">
                  過去6ヶ月
                </button>
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'thisyear' ? 'active' : ''}" data-range="thisyear">
                  今年
                </button>
                <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'all' ? 'active' : ''}" data-range="all">
                  全期間
                </button>
              </div>
            </div>
            <div class="col-md-4 text-md-end mt-2 mt-md-0">
              <button class="btn btn-outline-secondary btn-sm" id="refreshDataBtn">
                <i class="fas fa-sync-alt me-1"></i>更新
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * デフォルト表示（フォールバック）
   */
  renderDefaultView() {
    return `
      <div class="reports-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1" data-i18n="nav.reports">レポート</h1>
          <p class="page-subtitle text-dark mb-0" data-i18n="reports.subtitle">評価データの分析と比較</p>
        </div>

        <!-- 期間選択 -->
        <div class="card mb-4">
          <div class="card-body py-2">
            <div class="row align-items-center">
              <div class="col-md-8">
                <div class="btn-group" role="group" id="timeRangeButtons">
                  <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'last3months' ? 'active' : ''}" data-range="last3months">
                    <span data-i18n="reports.last_3_months">過去3ヶ月</span>
                  </button>
                  <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'last6months' ? 'active' : ''}" data-range="last6months">
                    <span data-i18n="reports.last_6_months">過去6ヶ月</span>
                  </button>
                  <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'thisyear' ? 'active' : ''}" data-range="thisyear">
                    <span data-i18n="reports.this_year">今年</span>
                  </button>
                  <button type="button" class="btn btn-outline-primary time-range-btn ${this.currentTimeRange === 'all' ? 'active' : ''}" data-range="all">
                    <span data-i18n="reports.all_time">全期間</span>
                  </button>
                </div>
              </div>
              <div class="col-md-4 text-md-end mt-2 mt-md-0">
                <button class="btn btn-outline-secondary btn-sm" id="refreshDataBtn">
                  <i class="fas fa-sync-alt me-1"></i>
                  <span data-i18n="common.refresh">更新</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- データ読み込み中の表示 -->
        <div id="loading-container" class="text-center p-5">
          ${this.renderLoadingState()}
        </div>

        <!-- メインコンテンツ -->
        <div id="main-content" style="display: none;">
          <!-- 統計カード -->
          <div class="row mb-4" id="stats-cards">
            <!-- 統計カードがここに動的に挿入されます -->
          </div>

          <!-- チャートセクション -->
          <div class="row mb-4">
            <div class="col-lg-8 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 class="mb-0 card-title-icon">
                    <i class="fas fa-chart-line me-2 text-primary"></i>
                    <span data-i18n="reports.performance_trend">パフォーマンス推移</span>
                  </h5>
                </div>
                <div class="card-body">
                  <canvas id="performanceTrendChart"></canvas>
                </div>
              </div>
            </div>
            <div class="col-lg-4 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white">
                  <h5 class="mb-0 card-title-icon">
                    <i class="fas fa-chart-pie me-2 text-primary"></i>
                    <span data-i18n="reports.evaluation_status">評価ステータス分布</span>
                  </h5>
                </div>
                <div class="card-body">
                  <canvas id="statusDistributionChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- スコア比較 -->
          <div class="row mb-4">
            <div class="col-lg-12 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white">
                  <h5 class="mb-0 card-title-icon">
                    <i class="fas fa-chart-radar me-2 text-primary"></i>
                    <span data-i18n="reports.score_comparison">スコア比較</span>
                  </h5>
                </div>
                <div class="card-body">
                  <canvas id="scoreComparisonChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- 管理者専用セクション -->
          ${this.renderAdminSection()}

          <!-- 詳細テーブル -->
          <div class="card">
            <div class="card-header bg-white">
              <h5 class="mb-0 card-title-icon">
                <i class="fas fa-table me-2 text-primary"></i>
                <span data-i18n="reports.detailed_data">詳細データ</span>
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover" id="detailedDataTable">
                  <thead>
                    <tr>
                      <th data-i18n="evaluation.period">評価期間</th>
                      <th data-i18n="evaluation.target">対象者</th>
                      <th data-i18n="evaluation.evaluator">評価者</th>
                      <th data-i18n="evaluation.score">スコア</th>
                      <th data-i18n="evaluation.status">ステータス</th>
                      <th data-i18n="common.actions">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- データが動的に挿入されます -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderLoadingState() {
    return `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3" data-i18n="common.loading_data">データを読み込み中...</p>
    `;
  }

  renderAdminSection() {
    if (!this.app.hasRole('admin')) {
      return '';
    }

    return `
      <div class="row mb-4" id="admin-section">
        <div class="col-12">
          <div class="card shadow-sm border-info">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0 card-title-icon text-info">
                <i class="fas fa-user-shield me-2"></i>
                <span data-i18n="reports.admin_analytics">管理者分析</span>
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-lg-6 mb-3">
                  <canvas id="departmentComparisonChart"></canvas>
                </div>
                <div class="col-lg-6 mb-3">
                  <canvas id="evaluatorEfficiencyChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    
    if (!this.app.isAuthenticated()) {
      this.app.navigate("#/login");
      return;
    }

    // 既存のチャートをクリーンアップ
    this.cleanup();

    try {
      // 権限別データ読み込み
      await this.loadRoleBasedData();
      this.setupEventListeners();
      this.applyTranslations();
      this.isInitialized = true;
    } catch (error) {
      console.error("Reports: Initialization error:", error);
      this.renderErrorState();
      this.app.showError("レポートの読み込み中にエラーが発生しました。");
    }
  }

  /**
   * 権限別データ読み込み
   */
  async loadRoleBasedData() {
    // ローディング状態の表示
    this.showLoadingState();

    try {
      if (this.isWorker) {
        this.reportData = await this.loadWorkerData();
        await this.renderWorkerCharts();
      } else if (this.isEvaluator) {
        this.reportData = await this.loadEvaluatorData();
        await this.renderEvaluatorCharts();
      } else if (this.isAdmin) {
        this.reportData = await this.loadAdminData();
        await this.renderAdminCharts();
      }

      // ローディング状態を隠す
      this.hideLoadingState();
      
    } catch (error) {
      console.error("Reports: Role-based data loading failed:", error);
      this.renderErrorState();
      throw error;
    }
  }

  /**
   * ローディング状態の表示/非表示
   */
  showLoadingState() {
    const loadingElements = document.querySelectorAll('.spinner-border');
    loadingElements.forEach(element => {
      element.style.display = 'block';
    });
  }

  hideLoadingState() {
    const loadingElements = document.querySelectorAll('.spinner-border');
    loadingElements.forEach(element => {
      element.style.display = 'none';
    });
  }

  /**
   * 作業員用チャート描画
   */
  async renderWorkerCharts() {
    try {
      // 既存のチャートを破棄
      this.destroyAllCharts();

      // 統計カードの更新
      this.updateWorkerStats();
      
      // チャートの描画
      await this.renderPersonalTrendChart();
      await this.renderPersonalRadarChart();
      await this.renderImprovementPoints();
      await this.renderStrengthPoints();

      console.log("Reports: Worker charts rendered successfully");
    } catch (error) {
      console.error("Reports: Failed to render worker charts:", error);
    }
  }

  /**
   * 作業員統計カードの更新
   */
  updateWorkerStats() {
    const stats = this.reportData.statistics || this.getDefaultStats();
    const evaluations = this.reportData.evaluations || [];
    
    // 総合評価
    const overallElement = document.getElementById('personalOverallScore');
    if (overallElement) {
      const latestScore = evaluations.length > 0 ? evaluations[evaluations.length - 1]?.finalScore : 0;
      overallElement.textContent = latestScore ? latestScore.toFixed(1) : '-';
    }

    // 前回比較
    const changeElement = document.getElementById('personalScoreChange');
    if (changeElement && evaluations.length >= 2) {
      const current = evaluations[evaluations.length - 1]?.finalScore || 0;
      const previous = evaluations[evaluations.length - 2]?.finalScore || 0;
      const change = current - previous;
      changeElement.textContent = change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
      changeElement.className = `card-title mb-0 text-${change >= 0 ? 'success' : 'danger'}`;
    }

    // 改善項目数と強み項目数
    const improvementElement = document.getElementById('improvementCount');
    const strengthElement = document.getElementById('strengthCount');
    const improvements = this.reportData?.improvements || [];
    const strengths = this.reportData?.strengths || [];
    if (improvementElement) improvementElement.textContent = improvements.length.toString();
    if (strengthElement) strengthElement.textContent = strengths.length.toString();
  }

  /**
   * 個人評価推移チャート
   */
  async renderPersonalTrendChart() {
    const canvas = document.getElementById('personalTrendChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render personal trend chart");
      return;
    }

    const ctx = canvas.getContext('2d');
    const trends = this.reportData.trends || { labels: [], datasets: [] };

    this.chartInstances.personalTrend = new Chart(ctx, {
      type: 'line',
      data: trends,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: 'スコア'
            }
          },
          x: {
            title: {
              display: true,
              text: '評価期間'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  /**
   * 個人項目別レーダーチャート
   */
  async renderPersonalRadarChart() {
    const canvas = document.getElementById('personalRadarChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render personal radar chart");
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // 実際の評価データからレーダーチャートデータを生成
    const radarData = this.generateRadarChartData();
    const categories = radarData.labels;
    const currentScores = radarData.current;
    const previousScores = radarData.previous;

    this.chartInstances.personalRadar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [{
          label: '今回評価',
          data: currentScores,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        }, {
          label: '前回評価',
          data: previousScores,
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          pointBackgroundColor: 'rgba(255, 159, 64, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 5
          }
        }
      }
    });
  }

  /**
   * 改善ポイント表示
   */
  async renderImprovementPoints() {
    const container = document.getElementById('improvementPoints');
    if (!container) return;

    // 実際の評価データから改善ポイントを生成
    const improvements = this.reportData?.improvements || [];
    
    if (improvements.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
          <p class="text-muted">現在特に改善が必要な項目はありません</p>
        </div>
      `;
      return;
    }

    container.innerHTML = improvements.map(item => `
      <div class="mb-3 p-3 border-start border-warning border-3 bg-light">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0 fw-bold">${item.category}</h6>
          <span class="badge bg-warning text-dark">${item.currentScore} → ${item.targetScore}</span>
        </div>
        <p class="mb-0 text-muted small">${item.advice}</p>
      </div>
    `).join('');
  }

  /**
   * 強みポイント表示
   */
  async renderStrengthPoints() {
    const container = document.getElementById('strengthPoints');
    if (!container) return;

    // 実際の評価データから強みポイントを生成
    const strengths = this.reportData?.strengths || [];
    
    if (strengths.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-search fa-3x text-muted mb-3"></i>
          <p class="text-muted">強みを分析するには評価データが必要です</p>
        </div>
      `;
      return;
    }

    container.innerHTML = strengths.map(item => `
      <div class="mb-3 p-3 border-start border-success border-3 bg-light">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0 fw-bold">${item.category}</h6>
          <span class="badge bg-success">${item.score}</span>
        </div>
        <p class="mb-0 text-muted small">${item.description}</p>
      </div>
    `).join('');
  }

  /**
   * 評価者用チャート描画
   */
  async renderEvaluatorCharts() {
    try {
      // 既存のチャートを破棄
      this.destroyAllCharts();

      // 統計カードの更新
      this.updateEvaluatorStats();
      
      // チャートとリストの描画
      await this.renderSubordinateList();
      await this.renderEvaluatorPersonalChart();
      await this.renderSubordinateComparisonChart();

      console.log("Reports: Evaluator charts rendered successfully");
    } catch (error) {
      console.error("Reports: Failed to render evaluator charts:", error);
    }
  }

  /**
   * 評価者統計カードの更新
   */
  updateEvaluatorStats() {
    const data = this.reportData || this.getDefaultEvaluatorData();
    const progress = data.progress || { completed: 0, total: 0, percentage: 0 };
    const personalStats = data.personal.statistics || this.getDefaultStats();
    const subordinates = data.subordinateList || [];
    
    // 担当者数
    const subordinateCountElement = document.getElementById('subordinateCount');
    if (subordinateCountElement) {
      subordinateCountElement.textContent = subordinates.length.toString();
    }

    // 評価完了率
    const progressElement = document.getElementById('evaluationProgress');
    if (progressElement) {
      progressElement.textContent = `${progress.percentage}%`;
    }

    // 平均評価（担当者の平均）
    const averageElement = document.getElementById('averageScore');
    if (averageElement) {
      averageElement.textContent = personalStats.averageScore ? personalStats.averageScore.toFixed(1) : '-';
    }

    // 個人評価
    const personalElement = document.getElementById('personalScore');
    if (personalElement) {
      const personalEvaluations = data?.personal?.evaluations || [];
      const latestScore = personalEvaluations.length > 0 ? personalEvaluations[personalEvaluations.length - 1]?.finalScore : 0;
      personalElement.textContent = latestScore ? latestScore.toFixed(1) : '-';
    }
  }

  /**
   * 担当者リスト表示
   */
  async renderSubordinateList() {
    const container = document.getElementById('subordinateList');
    if (!container) return;

    const data = this.reportData || this.getDefaultEvaluatorData();
    const subordinates = data.subordinateList || [];
    const subordinateEvaluations = data.subordinates || [];

    if (subordinates.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="fas fa-users fa-3x mb-3"></i>
          <p>担当する作業員がいません</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="list-group">
        ${subordinates.map(subordinate => {
          const evaluation = subordinateEvaluations.find(e => e.targetUserId === subordinate.id);
          const latestScore = evaluation ? evaluation.finalScore : null;
          const status = evaluation ? evaluation.status : 'not_started';
          
          return `
            <div class="list-group-item d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <div class="fw-bold">${this.app.sanitizeHtml(subordinate.name || '未設定')}</div>
                  <small class="text-muted">${this.app.sanitizeHtml(subordinate.jobType || '未設定')}</small>
                </div>
              </div>
              <div class="text-end">
                <div class="fw-bold ${latestScore ? 'text-primary' : 'text-muted'}">
                  ${latestScore ? latestScore.toFixed(1) : '-'}
                </div>
                <small class="badge ${this.getStatusBadgeClass(status)}">
                  ${this.getStatusDisplayName(status)}
                </small>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * 評価者個人チャート
   */
  async renderEvaluatorPersonalChart() {
    const canvas = document.getElementById('evaluatorPersonalChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render evaluator personal chart");
      return;
    }

    const ctx = canvas.getContext('2d');
    const data = this.reportData || this.getDefaultEvaluatorData();
    const personalTrends = data.personal.trends || { labels: [], datasets: [] };

    this.chartInstances.evaluatorPersonal = new Chart(ctx, {
      type: 'line',
      data: personalTrends,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: 'スコア'
            }
          },
          x: {
            title: {
              display: true,
              text: '評価期間'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  /**
   * 担当者比較チャート
   */
  async renderSubordinateComparisonChart() {
    const canvas = document.getElementById('subordinateComparisonChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render subordinate comparison chart");
      return;
    }

    const ctx = canvas.getContext('2d');
    const data = this.reportData || this.getDefaultEvaluatorData();
    const subordinates = data.subordinateList || [];
    const subordinateEvaluations = data.subordinates || [];

    // 担当者のスコアを取得
    const labels = subordinates.map(s => s.name || '未設定');
    const scores = subordinates.map(subordinate => {
      const evaluation = subordinateEvaluations.find(e => e.targetUserId === subordinate.id);
      return evaluation ? evaluation.finalScore || 0 : 0;
    });

    // 色の配列
    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)', 
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)'
    ];

    this.chartInstances.subordinateComparison = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '最新評価スコア',
          data: scores,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: 'スコア'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  /**
   * 管理者用チャート描画
   */
  async renderAdminCharts() {
    try {
      // 既存のチャートを破棄
      this.destroyAllCharts();

      // 統計カードの更新
      this.updateAdminStats();
      
      // チャートと分析データの描画
      await this.renderOrganizationSkillMap();
      await this.renderSkillDistributionChart();
      await this.renderOrganizationStrengths();
      await this.renderOrganizationWeaknesses();
      await this.renderDepartmentPerformanceChart();
      await this.renderJobTypeSkillChart();

      console.log("Reports: Admin charts rendered successfully");
    } catch (error) {
      console.error("Reports: Failed to render admin charts:", error);
    }
  }

  /**
   * 管理者統計カードの更新
   */
  updateAdminStats() {
    const data = this.reportData || this.getDefaultAdminData();
    const orgStats = data.organizationStats || this.getDefaultOrgStats();
    const skillAnalysis = data.skillAnalysis || this.getDefaultSkillData();
    const personalStats = data.personal.statistics || this.getDefaultStats();
    
    // 総従業員数
    const totalEmployeesElement = document.getElementById('totalEmployees');
    if (totalEmployeesElement) {
      totalEmployeesElement.textContent = orgStats.totalEmployees.toString();
    }

    // 評価完了率
    const evaluationRateElement = document.getElementById('orgEvaluationRate');
    if (evaluationRateElement) {
      evaluationRateElement.textContent = `${orgStats.evaluationRate}%`;
    }

    // 組織平均
    const averageScoreElement = document.getElementById('orgAverageScore');
    if (averageScoreElement) {
      const avgScore = orgStats?.averageScore || 0;
      averageScoreElement.textContent = avgScore.toFixed(1);
    }

    // 強いスキル
    const topSkillElement = document.getElementById('topSkillCount');
    if (topSkillElement) {
      const topSkills = skillAnalysis?.topSkills || [];
      topSkillElement.textContent = topSkills.length.toString();
    }

    // 弱いスキル
    const weakSkillElement = document.getElementById('weakSkillCount');
    if (weakSkillElement) {
      const improvementAreas = skillAnalysis?.improvementAreas || [];
      weakSkillElement.textContent = improvementAreas.length.toString();
    }

    // 個人評価
    const personalElement = document.getElementById('adminPersonalScore');
    if (personalElement) {
      const personalEvaluations = data?.personal?.evaluations || [];
      const latestScore = personalEvaluations.length > 0 ? personalEvaluations[personalEvaluations.length - 1]?.finalScore : 0;
      personalElement.textContent = latestScore ? latestScore.toFixed(1) : '-';
    }
  }

  /**
   * 組織スキルマップ
   */
  async renderOrganizationSkillMap() {
    const canvas = document.getElementById('organizationSkillMap');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render organization skill map");
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // スキルマップのダミーデータ
    const skillCategories = ['技術力', 'コミュニケーション', '責任感', '協調性', 'リーダーシップ', '問題解決', '学習意欲', '時間管理'];
    const departmentData = [
      {
        label: '開発部',
        data: [4.5, 3.8, 4.2, 4.0, 3.9, 4.3, 4.1, 3.7],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)'
      },
      {
        label: '営業部',
        data: [3.2, 4.6, 4.1, 4.3, 4.2, 3.8, 3.9, 4.0],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)'
      },
      {
        label: '管理部',
        data: [3.5, 4.2, 4.5, 4.1, 4.0, 4.2, 3.8, 4.3],
        backgroundColor: 'rgba(255, 205, 86, 0.6)',
        borderColor: 'rgba(255, 205, 86, 1)'
      },
      {
        label: '人事部',
        data: [3.3, 4.4, 4.3, 4.5, 3.8, 4.0, 4.1, 4.2],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)'
      }
    ];

    this.chartInstances.organizationSkillMap = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: skillCategories,
        datasets: departmentData
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  /**
   * スキル分布チャート
   */
  async renderSkillDistributionChart() {
    const canvas = document.getElementById('skillDistributionChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render skill distribution chart");
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // スキルレベル分布のダミーデータ
    const skillLevels = ['初級', '中級', '上級', 'エキスパート'];
    const distribution = [25, 35, 30, 10]; // パーセンテージ

    this.chartInstances.skillDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: skillLevels,
        datasets: [{
          data: distribution,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  /**
   * 組織の強み表示
   */
  async renderOrganizationStrengths() {
    const container = document.getElementById('organizationStrengths');
    if (!container) return;

    // 組織の強みのダミーデータ
    const strengths = [
      {
        skill: '責任感',
        avgScore: 4.6,
        coverage: 92,
        description: '全社的に高い責任感を持って業務に取り組む文化が定着している'
      },
      {
        skill: '協調性',
        avgScore: 4.4,
        coverage: 89,
        description: 'チームワークを重視し、部署間の連携も良好である'
      },
      {
        skill: '学習意欲',
        avgScore: 4.3,
        coverage: 85,
        description: '新しい技術や知識の習得に積極的な社員が多い'
      },
      {
        skill: '時間管理',
        avgScore: 4.2,
        coverage: 88,
        description: 'プロジェクトの納期管理と効率的な作業進行が得意'
      },
      {
        skill: '問題解決',
        avgScore: 4.1,
        coverage: 83,
        description: '論理的思考で課題解決に取り組む能力が高い'
      }
    ];

    container.innerHTML = strengths.map(item => `
      <div class="mb-3 p-3 border-start border-success border-3 bg-light">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0 fw-bold text-success">${item.skill}</h6>
          <div class="text-end">
            <span class="badge bg-success me-2">${item.avgScore}</span>
            <small class="text-muted">${item.coverage}%</small>
          </div>
        </div>
        <p class="mb-0 text-muted small">${item.description}</p>
      </div>
    `).join('');
  }

  /**
   * 組織の弱み表示
   */
  async renderOrganizationWeaknesses() {
    const container = document.getElementById('organizationWeaknesses');
    if (!container) return;

    // 組織の弱みのダミーデータ
    const weaknesses = [
      {
        skill: 'リーダーシップ',
        avgScore: 3.4,
        coverage: 58,
        description: 'マネジメント層の育成とリーダーシップスキル向上が課題',
        recommendation: '管理職研修とメンタリング制度の強化を推奨'
      },
      {
        skill: '技術力（新技術）',
        avgScore: 3.6,
        coverage: 62,
        description: '最新技術への対応力にばらつきがある',
        recommendation: '技術研修の充実と専門性向上支援が必要'
      },
      {
        skill: 'コミュニケーション',
        avgScore: 3.7,
        coverage: 71,
        description: '部署間やチーム内での情報共有に改善の余地あり',
        recommendation: 'コミュニケーション研修と情報共有ツールの活用促進'
      }
    ];

    container.innerHTML = weaknesses.map(item => `
      <div class="mb-3 p-3 border-start border-danger border-3 bg-light">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0 fw-bold text-danger">${item.skill}</h6>
          <div class="text-end">
            <span class="badge bg-danger me-2">${item.avgScore}</span>
            <small class="text-muted">${item.coverage}%</small>
          </div>
        </div>
        <p class="mb-2 text-muted small">${item.description}</p>
        <div class="alert alert-warning py-1 px-2 mb-0">
          <small><i class="fas fa-lightbulb me-1"></i><strong>改善提案:</strong> ${item.recommendation}</small>
        </div>
      </div>
    `).join('');
  }

  /**
   * 部門別パフォーマンスチャート
   */
  async renderDepartmentPerformanceChart() {
    const canvas = document.getElementById('departmentPerformanceChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render department performance chart");
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // 実際の部門データから生成
    const departmentAnalysis = this.reportData?.departmentAnalysis;
    const departments = departmentAnalysis?.departments || ['開発部', '営業部', '管理部', '人事部'];
    const currentScores = departments.map(dept => 
      departmentAnalysis?.averageScores?.[dept] || 0
    );
    const previousScores = departments.map(() => 0); // 前期データは要実装

    this.chartInstances.departmentPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departments,
        datasets: [
          {
            label: '今期',
            data: currentScores,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: '前期',
            data: previousScores,
            backgroundColor: 'rgba(255, 159, 64, 0.8)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: '平均スコア'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  /**
   * 職種別スキル分析チャート
   */
  async renderJobTypeSkillChart() {
    const canvas = document.getElementById('jobTypeSkillChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn("Reports: Cannot render job type skill chart");
      return;
    }

    const ctx = canvas.getContext('2d');
    
    // 職種別スキルデータ
    const jobTypes = ['エンジニア', 'セールス', 'マネージャー', 'スペシャリスト'];
    const skillScores = [4.2, 3.8, 3.9, 4.0];

    this.chartInstances.jobTypeSkill = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: jobTypes,
        datasets: [{
          label: '平均スキルスコア',
          data: skillScores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: 'スコア'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }


  getDefaultStats() {
    return {
      totalEvaluations: 0,
      completedEvaluations: 0,
      averageScore: 0,
      improvementRate: 0
    };
  }

  getDefaultTrends() {
    return {
      labels: [],
      datasets: []
    };
  }



  destroyAllCharts() {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        try {
          chart.destroy();
        } catch (error) {
          console.warn("Reports: Error destroying chart:", error);
        }
      }
    });
    this.chartInstances = {};
  }



  renderDetailedTable() {
    const tbody = document.querySelector('#detailedDataTable tbody');
    if (!tbody) return;

    const evaluations = this.reportData.evaluations || [];
    
    if (evaluations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted p-4">
            <span data-i18n="common.no_data">データがありません</span>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = evaluations.slice(0, 20).map(evaluation => `
      <tr>
        <td>${this.app.sanitizeHtml(evaluation.periodName || '未設定')}</td>
        <td>${this.app.sanitizeHtml(evaluation.targetUserName || '不明')}</td>
        <td>${this.app.sanitizeHtml(evaluation.evaluatorName || '未割当')}</td>
        <td>
          <span class="badge bg-info">${evaluation.finalScore || '未評価'}</span>
        </td>
        <td>
          <span class="badge ${this.getStatusBadgeClass(evaluation.status)}">
            ${this.getStatusDisplayName(evaluation.status)}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="window.app.navigate('#/evaluation-report?id=${evaluation.id}')">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // 翻訳を適用
    this.applyTranslationsToElement(tbody);
  }

  setupEventListeners() {
    // 期間選択ボタン
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTimeRangeChange(e.target.dataset.range));
    });

    // データ更新ボタン
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }
  }

  async handleTimeRangeChange(newRange) {
    if (newRange === this.currentTimeRange) return;

    this.currentTimeRange = newRange;

    // ボタンの状態更新
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.range === newRange) {
        btn.classList.add('active');
      }
    });

    // 権限別データの再読み込み
    await this.loadRoleBasedData();
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>更新中...';
      refreshBtn.disabled = true;
    }

    try {
      await this.loadRoleBasedData();
    } finally {
      if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>更新';
        refreshBtn.disabled = false;
      }
    }
  }

  getStatusDisplayName(status) {
    const statusNames = {
      draft: '下書き',
      submitted: '提出済み',
      in_review: '審査中',
      approved: '承認済み',
      rejected: '差し戻し',
      completed: '完了'
    };
    return statusNames[status] || status;
  }

  getStatusBadgeClass(status) {
    const badgeClasses = {
      draft: 'bg-secondary',
      submitted: 'bg-primary',
      in_review: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
      completed: 'bg-info'
    };
    return badgeClasses[status] || 'bg-secondary';
  }

  applyTranslations() {
    const reportsContainer = document.querySelector('.reports-page');
    if (reportsContainer && this.app.i18n) {
      this.app.i18n.updateElement(reportsContainer);
    }
  }

  applyTranslationsToElement(element) {
    if (element && this.app.i18n) {
      this.app.i18n.updateElement(element);
    }
  }

  renderErrorState() {
    const container = document.getElementById("loading-container");
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger text-center">
          <h5 class="text-danger" data-i18n="errors.loading_failed">データの読み込みに失敗しました</h5>
          <p class="text-muted">時間をおいて再度お試しください。</p>
          <button class="btn btn-outline-danger" onclick="window.location.reload()">
            <i class="fas fa-redo me-1"></i><span data-i18n="common.retry">再試行</span>
          </button>
        </div>
      `;
      this.applyTranslationsToElement(container);
    }
  }

  /**
   * スキルカテゴリ名を取得
   */
  getSkillCategoryName(key) {
    const categoryMap = {
      'technical': '技術スキル',
      'communication': 'コミュニケーション', 
      'leadership': 'リーダーシップ',
      'teamwork': 'チームワーク',
      'problemSolving': '問題解決',
      'timeManagement': '時間管理',
      'responsibility': '責任感',
      'creativity': '創造性',
      'learningAbility': '学習能力',
      'adaptability': '適応力'
    };
    return categoryMap[key] || key;
  }

  /**
   * 改善アドバイスを生成
   */
  generateAdvice(category, score) {
    const adviceMap = {
      'technical': 'より専門的な知識の習得と実践経験を積むことをお勧めします',
      'communication': 'チーム内での積極的な意見交換を心がけ、プレゼンテーション能力の向上に取り組みましょう',
      'leadership': '後輩指導の機会を増やし、リーダーとしての経験を積むことが重要です',
      'teamwork': 'チームメンバーとの協調性を更に高め、共同作業のスキルを磨きましょう',
      'problemSolving': '論理的思考力を鍛え、複雑な問題に対するアプローチ方法を学びましょう',
      'timeManagement': 'スケジュール管理ツールの活用と優先順位の設定を見直しましょう',
      'responsibility': '任された業務への責任感を更に高め、完遂率の向上を目指しましょう',
      'creativity': '新しいアイデアの創出に挑戦し、創造的思考を養いましょう',
      'learningAbility': '継続的な学習習慣を身につけ、新しい知識の吸収に努めましょう',
      'adaptability': '変化に対する柔軟性を高め、新しい環境への適応力を向上させましょう'
    };
    return adviceMap[category] || 'この分野でのスキル向上に取り組むことをお勧めします';
  }

  /**
   * 強みの説明を生成
   */
  generateStrengthDescription(category, score) {
    const descriptionMap = {
      'technical': '専門的な技術力と実践的な知識に優れています',
      'communication': 'コミュニケーション能力が高く、効果的な意思疎通ができています',
      'leadership': 'リーダーシップを発揮し、チームを適切に導く能力があります',
      'teamwork': 'チームワークに優れ、協調性を持って業務に取り組んでいます',
      'problemSolving': '問題解決能力が高く、論理的なアプローチで課題に取り組めています',
      'timeManagement': '時間管理が得意で、効率的に業務を進めることができています',
      'responsibility': '責任感が強く、与えられた仕事を確実に完遂する能力があります',
      'creativity': '創造性に富み、新しいアイデアや解決策を提案できています',
      'learningAbility': '学習意欲が高く、新しい知識や技術の習得に積極的です',
      'adaptability': '適応力があり、変化する環境に柔軟に対応できています'
    };
    return descriptionMap[category] || 'この分野で優秀な能力を発揮しています';
  }

  /**
   * 部下の統計を計算
   */
  calculateSubordinateStatistics(evaluations) {
    if (!evaluations || evaluations.length === 0) {
      return {
        averageScore: 0,
        completionRate: 0,
        improvementRate: 0,
        totalEvaluated: 0
      };
    }

    const completedEvaluations = evaluations.filter(e => e.status === 'completed');
    const totalScore = completedEvaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0);
    
    return {
      averageScore: completedEvaluations.length > 0 ? totalScore / completedEvaluations.length : 0,
      completionRate: (completedEvaluations.length / evaluations.length) * 100,
      improvementRate: this.calculateImprovementRate(evaluations),
      totalEvaluated: evaluations.length
    };
  }

  /**
   * 改善率を計算
   */
  calculateImprovementRate(evaluations) {
    // 過去の評価と比較して改善率を算出
    const improved = evaluations.filter(e => {
      return e.previousScore && e.totalScore > e.previousScore;
    });
    
    return evaluations.length > 0 ? (improved.length / evaluations.length) * 100 : 0;
  }

  /**
   * 組織統計を計算
   */
  calculateOrganizationStatistics(allEvaluations) {
    if (!allEvaluations || allEvaluations.length === 0) {
      return {
        totalEmployees: 0,
        evaluationRate: 0,
        averageScore: 0,
        strongSkills: 0,
        weakSkills: 0
      };
    }

    const completedEvaluations = allEvaluations.filter(e => e.status === 'completed');
    const totalScore = completedEvaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0);
    const avgScore = completedEvaluations.length > 0 ? totalScore / completedEvaluations.length : 0;
    
    // ユニークなユーザー数を算出
    const uniqueUsers = new Set(allEvaluations.map(e => e.targetUserId)).size;
    
    return {
      totalEmployees: uniqueUsers,
      evaluationRate: allEvaluations.length > 0 ? (completedEvaluations.length / allEvaluations.length) * 100 : 0,
      averageScore: avgScore,
      strongSkills: this.countSkillsAboveThreshold(completedEvaluations, 4.0),
      weakSkills: this.countSkillsBelowThreshold(completedEvaluations, 3.0)
    };
  }

  /**
   * 閾値以上のスキル数をカウント
   */
  countSkillsAboveThreshold(evaluations, threshold) {
    return evaluations.reduce((count, evaluation) => {
      if (evaluation.ratings) {
        const highRatings = Object.values(evaluation.ratings).filter(rating => rating >= threshold);
        return count + highRatings.length;
      }
      return count;
    }, 0);
  }

  /**
   * 閾値以下のスキル数をカウント
   */
  countSkillsBelowThreshold(evaluations, threshold) {
    return evaluations.reduce((count, evaluation) => {
      if (evaluation.ratings) {
        const lowRatings = Object.values(evaluation.ratings).filter(rating => rating <= threshold);
        return count + lowRatings.length;
      }
      return count;
    }, 0);
  }

  /**
   * 評価進捗を計算
   */
  calculateEvaluationProgress(evaluations) {
    const total = evaluations.length;
    const completed = evaluations.filter(e => e.status === 'completed').length;
    
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * 組織のスキル分析
   */
  analyzeOrganizationSkills(evaluations) {
    const completedEvaluations = evaluations.filter(e => e.status === 'completed' && e.ratings);
    
    if (completedEvaluations.length === 0) {
      return {
        topSkills: [],
        improvementAreas: [],
        skillDistribution: {}
      };
    }

    const skillAverages = {};
    const skillCounts = {};

    // 各スキルの平均値を計算
    completedEvaluations.forEach(evaluation => {
      if (evaluation.ratings) {
        Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
          if (!skillAverages[skill]) {
            skillAverages[skill] = 0;
            skillCounts[skill] = 0;
          }
          skillAverages[skill] += rating;
          skillCounts[skill]++;
        });
      }
    });

    // 平均値を計算
    Object.keys(skillAverages).forEach(skill => {
      skillAverages[skill] = skillAverages[skill] / skillCounts[skill];
    });

    // トップスキルと改善が必要なスキルを抽出
    const skillEntries = Object.entries(skillAverages);
    const topSkills = skillEntries
      .filter(([_, score]) => score >= 4.0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, score]) => ({
        name: this.getSkillCategoryName(skill),
        score: score.toFixed(1)
      }));

    const improvementAreas = skillEntries
      .filter(([_, score]) => score < 3.0)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([skill, score]) => ({
        name: this.getSkillCategoryName(skill),
        score: score.toFixed(1)
      }));

    return {
      topSkills,
      improvementAreas,
      skillDistribution: skillAverages
    };
  }

  /**
   * レーダーチャートデータを生成
   */
  generateRadarChartData() {
    const evaluations = this.reportData?.evaluations || [];
    const completedEvaluations = evaluations.filter(e => e.status === 'completed' && e.ratings);
    
    if (completedEvaluations.length === 0) {
      return {
        labels: ['コミュニケーション', '技術力', '責任感', '協調性', 'リーダーシップ'],
        current: [0, 0, 0, 0, 0],
        previous: [0, 0, 0, 0, 0]
      };
    }

    // 最新の評価データを取得
    const latestEvaluation = completedEvaluations[0];
    const previousEvaluation = completedEvaluations[1]; // 2番目に新しい評価

    const skillCategories = ['communication', 'technical', 'responsibility', 'teamwork', 'leadership'];
    const labels = skillCategories.map(skill => this.getSkillCategoryName(skill));
    
    const current = skillCategories.map(skill => 
      latestEvaluation.ratings?.[skill] || 0
    );
    
    const previous = skillCategories.map(skill => 
      previousEvaluation?.ratings?.[skill] || 0
    );

    return { labels, current, previous };
  }

  /**
   * 部門別パフォーマンス分析
   */
  analyzeDepartmentPerformance(evaluations, users) {
    // 簡易的な部門分析（実際は部門データが必要）
    const completedEvaluations = evaluations.filter(e => e.status === 'completed');
    
    if (completedEvaluations.length === 0 || !users || users.length === 0) {
      return {
        departments: [],
        averageScores: {},
        improvementRates: {}
      };
    }

    // 部門別にデータを集計（サンプル実装）
    const departmentData = {
      '開発部': { scores: [], count: 0 },
      '営業部': { scores: [], count: 0 },
      '管理部': { scores: [], count: 0 },
      '人事部': { scores: [], count: 0 }
    };

    completedEvaluations.forEach(evaluation => {
      // 実際の実装では、ユーザーの部門情報を使用
      const departments = Object.keys(departmentData);
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      
      if (evaluation.totalScore) {
        departmentData[randomDept].scores.push(evaluation.totalScore);
        departmentData[randomDept].count++;
      }
    });

    const averageScores = {};
    Object.entries(departmentData).forEach(([dept, data]) => {
      if (data.scores.length > 0) {
        averageScores[dept] = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
      } else {
        averageScores[dept] = 0;
      }
    });

    return {
      departments: Object.keys(departmentData),
      averageScores,
      improvementRates: {} // 実装可能
    };
  }

  cleanup() {
    // チャートインスタンスを破棄
    this.destroyAllCharts();
    this.isInitialized = false;
    
    // イベントリスナーもクリーンアップ
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.replaceWith(refreshBtn.cloneNode(true));
    }
    
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.replaceWith(btn.cloneNode(true));
    });
  }
}