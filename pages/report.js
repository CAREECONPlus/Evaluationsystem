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
  }

  async render() {
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

          <!-- スコア比較とランキング -->
          <div class="row mb-4">
            <div class="col-lg-6 mb-4">
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
            <div class="col-lg-6 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white">
                  <h5 class="mb-0 card-title-icon">
                    <i class="fas fa-trophy me-2 text-primary"></i>
                    <span data-i18n="reports.top_performers">高評価者ランキング</span>
                  </h5>
                </div>
                <div class="card-body">
                  <div id="topPerformersTable">
                    <!-- ランキングテーブルがここに挿入されます -->
                  </div>
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

    if (this.isInitialized) return;

    try {
      await this.loadReportData();
      this.setupEventListeners();
      this.applyTranslations();
      this.isInitialized = true;
    } catch (error) {
      console.error("Reports: Initialization error:", error);
      this.renderErrorState();
      this.app.showError("レポートの読み込み中にエラーが発生しました。");
    }
  }

  async loadReportData() {
    if (!this.app.api) {
      throw new Error("APIが初期化されていません");
    }

    // ローディング表示
    document.getElementById('loading-container').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';

    try {
      // 複数のAPIを並列で呼び出し
      const [statsResult, evaluationsResult, trendsResult] = await Promise.allSettled([
        this.app.api.getReportStatistics(this.currentTimeRange),
        this.app.api.getEvaluationsList({ timeRange: this.currentTimeRange }),
        this.app.api.getPerformanceTrends(this.currentTimeRange)
      ]);

      // 結果を処理
      this.reportData = {
        statistics: statsResult.status === 'fulfilled' ? statsResult.value : this.getDefaultStats(),
        evaluations: evaluationsResult.status === 'fulfilled' ? evaluationsResult.value : [],
        trends: trendsResult.status === 'fulfilled' ? trendsResult.value : this.getDefaultTrends()
      };

      // エラーログ
      if (statsResult.status === 'rejected') console.warn("Reports: Statistics loading failed:", statsResult.reason);
      if (evaluationsResult.status === 'rejected') console.warn("Reports: Evaluations loading failed:", evaluationsResult.reason);
      if (trendsResult.status === 'rejected') console.warn("Reports: Trends loading failed:", trendsResult.reason);

      // UIの更新
      this.renderStatsCards();
      this.renderCharts();
      this.renderTopPerformers();
      this.renderDetailedTable();

      // ローディング表示を隠してメインコンテンツを表示
      document.getElementById('loading-container').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';

    } catch (error) {
      console.error("Reports: Data loading failed:", error);
      this.renderErrorState();
      throw error;
    }
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

  renderStatsCards() {
    const container = document.getElementById("stats-cards");
    if (!container) return;

    const stats = this.reportData.statistics || this.getDefaultStats();

    container.innerHTML = `
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-primary">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-clipboard-list fa-2x text-primary me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.total_evaluations">総評価数</h6>
              <div class="card-title h4 mb-0">${stats.totalEvaluations}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-success">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-check-circle fa-2x text-success me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.completed_evaluations">完了済み評価</h6>
              <div class="card-title h4 mb-0">${stats.completedEvaluations}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-info">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-star fa-2x text-info me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.average_score">平均スコア</h6>
              <div class="card-title h4 mb-0">${stats.averageScore.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card shadow-sm h-100 border-warning">
          <div class="card-body d-flex align-items-center">
            <i class="fas fa-chart-line fa-2x text-warning me-3"></i>
            <div>
              <h6 class="card-subtitle text-muted mb-1" data-i18n="reports.improvement_rate">改善率</h6>
              <div class="card-title h4 mb-0">${stats.improvementRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 翻訳を適用
    this.applyTranslationsToElement(container);
  }

  renderCharts() {
    this.renderPerformanceTrendChart();
    this.renderStatusDistributionChart();
    this.renderScoreComparisonChart();
    
    if (this.app.hasRole('admin')) {
      this.renderAdminCharts();
    }
  }

  renderPerformanceTrendChart() {
    const canvas = document.getElementById('performanceTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstances.performanceTrend) {
      this.chartInstances.performanceTrend.destroy();
    }

    const ctx = canvas.getContext('2d');
    const trends = this.reportData.trends || this.getDefaultTrends();

    this.chartInstances.performanceTrend = new Chart(ctx, {
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
              text: '期間'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  }

  renderStatusDistributionChart() {
    const canvas = document.getElementById('statusDistributionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstances.statusDistribution) {
      this.chartInstances.statusDistribution.destroy();
    }

    // ステータス分布データを計算
    const evaluations = this.reportData.evaluations || [];
    const statusCounts = evaluations.reduce((acc, evaluation) => {
      acc[evaluation.status] = (acc[evaluation.status] || 0) + 1;
      return acc;
    }, {});

    const ctx = canvas.getContext('2d');
    
    this.chartInstances.statusDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts).map(status => this.getStatusDisplayName(status)),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            '#28a745',
            '#ffc107', 
            '#dc3545',
            '#17a2b8',
            '#6c757d'
          ]
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

  renderScoreComparisonChart() {
    const canvas = document.getElementById('scoreComparisonChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstances.scoreComparison) {
      this.chartInstances.scoreComparison.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // 自己評価vs評価者評価のデータを生成（ダミーデータ）
    const categories = ['コミュニケーション', '技術力', '責任感', '協調性', 'リーダーシップ'];
    const selfScores = [4.2, 3.8, 4.5, 4.1, 3.6];
    const evaluatorScores = [4.0, 4.2, 4.3, 4.0, 3.8];

    this.chartInstances.scoreComparison = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [{
          label: '自己評価',
          data: selfScores,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        }, {
          label: '評価者評価',
          data: evaluatorScores,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)'
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

  renderAdminCharts() {
    // 部署別比較チャート
    this.renderDepartmentComparisonChart();
    // 評価者効率チャート
    this.renderEvaluatorEfficiencyChart();
  }

  renderDepartmentComparisonChart() {
    const canvas = document.getElementById('departmentComparisonChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstances.departmentComparison) {
      this.chartInstances.departmentComparison.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // ダミーデータ
    const departments = ['開発部', '営業部', '管理部', '人事部'];
    const scores = [4.2, 3.8, 4.0, 3.9];

    this.chartInstances.departmentComparison = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departments,
        datasets: [{
          label: '平均スコア',
          data: scores,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5
          }
        },
        plugins: {
          title: {
            display: true,
            text: '部署別平均スコア'
          }
        }
      }
    });
  }

  renderEvaluatorEfficiencyChart() {
    const canvas = document.getElementById('evaluatorEfficiencyChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstances.evaluatorEfficiency) {
      this.chartInstances.evaluatorEfficiency.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // ダミーデータ
    const evaluators = ['田中', '佐藤', '山田', '鈴木'];
    const efficiency = [92, 88, 95, 85];

    this.chartInstances.evaluatorEfficiency = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: evaluators,
        datasets: [{
          label: '評価完了率(%)',
          data: efficiency,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          title: {
            display: true,
            text: '評価者別完了率'
          }
        }
      }
    });
  }

  renderTopPerformers() {
    const container = document.getElementById('topPerformersTable');
    if (!container) return;

    // ダミーデータ
    const topPerformers = [
      { name: '山田太郎', department: '開発部', score: 4.8, improvement: '+0.3' },
      { name: '佐藤花子', department: '営業部', score: 4.7, improvement: '+0.2' },
      { name: '田中次郎', department: '管理部', score: 4.6, improvement: '+0.1' },
      { name: '鈴木一郎', department: '開発部', score: 4.5, improvement: '+0.4' },
      { name: '高橋美香', department: '人事部', score: 4.4, improvement: '±0.0' }
    ];

    container.innerHTML = `
      <div class="list-group">
        ${topPerformers.map((performer, index) => `
          <div class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <span class="badge bg-primary rounded-pill me-3">${index + 1}</span>
              <div>
                <div class="fw-bold">${this.app.sanitizeHtml(performer.name)}</div>
                <small class="text-muted">${this.app.sanitizeHtml(performer.department)}</small>
              </div>
            </div>
            <div class="text-end">
              <div class="fw-bold text-primary">${performer.score}</div>
              <small class="text-muted">${performer.improvement}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
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

    // データを再読み込み
    await this.loadReportData();
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>更新中...';
      refreshBtn.disabled = true;
    }

    try {
      await this.loadReportData();
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

  cleanup() {
    // チャートインスタンスを破棄
    Object.values(this.chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.chartInstances = {};
    this.isInitialized = false;
  }
}