/**
 * Skill Trend Report Page Component
 * スキル推移レポートページ - 組織全体のスキル成長トレンド分析
 *
 * Phase 2 Step 4b: Skill Trend Analysis Feature
 */

export class SkillTrendReportPage {
  constructor(app) {
    this.app = app;
    this.trendData = null;
    this.chartInstances = {};
    this.userRole = null;
    this.selectedPeriod = 'all'; // 'all', 'last6months', 'last12months', 'custom'
    this.customStartDate = null;
    this.customEndDate = null;
  }

  async render() {
    return `
      <div class="skill-trend-report-page p-4">
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h2 mb-1">
                <i class="fas fa-chart-line me-2 text-primary"></i>
                スキル推移レポート
              </h1>
              <p class="text-muted mb-0">組織全体のスキル成長トレンド分析</p>
            </div>
            <span class="badge bg-info fs-6">Phase 2 Feature</span>
          </div>
        </div>

        <!-- 期間選択エリア -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-calendar-alt me-2"></i>分析期間の選択
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">期間</label>
                <select
                  id="periodSelector"
                  class="form-select"
                  onchange="window.app.currentPage.changePeriod(this.value)"
                >
                  <option value="all">全期間</option>
                  <option value="last6months">過去6ヶ月</option>
                  <option value="last12months">過去12ヶ月</option>
                  <option value="custom">カスタム期間</option>
                </select>
              </div>
              <div class="col-md-4 mb-3" id="customStartDateContainer" style="display: none;">
                <label class="form-label">開始日</label>
                <input
                  type="date"
                  id="customStartDate"
                  class="form-control"
                  onchange="window.app.currentPage.updateCustomPeriod()"
                />
              </div>
              <div class="col-md-4 mb-3" id="customEndDateContainer" style="display: none;">
                <label class="form-label">終了日</label>
                <input
                  type="date"
                  id="customEndDate"
                  class="form-control"
                  onchange="window.app.currentPage.updateCustomPeriod()"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- レポート表示エリア -->
        <div id="reportContainer">
          <div class="text-center py-5">
            <i class="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i>
            <p class="text-muted">データを読み込んでいます...</p>
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

    // 権限チェック
    this.userRole = this.app.currentUser?.role || 'worker';
    const canViewReport = this.userRole === 'admin' || this.userRole === 'evaluator';

    if (!canViewReport) {
      this.app.showError('スキル推移レポートを表示する権限がありません');
      this.app.navigate('#/dashboard');
      return;
    }

    try {
      await this.loadData();

      const contentContainer = document.getElementById("content");
      contentContainer.innerHTML = await this.render();

      this.afterRender();
    } catch (error) {
      console.error('Skill Trend Report: Failed to initialize:', error);
      this.app.showError('スキル推移レポートの読み込みに失敗しました');
    }
  }

  async loadData() {
    try {
      // 全評価データを取得
      const evaluations = await this.app.api.getEvaluations({}) || [];

      // スキルディメンションデータを持つ評価のみフィルタ
      const skillEvaluations = evaluations.filter(e =>
        e.skillDimensionScores &&
        Object.keys(e.skillDimensionScores).length > 0 &&
        e.evaluatedAt
      );

      // 日付順にソート
      skillEvaluations.sort((a, b) => {
        const dateA = this.parseDate(a.evaluatedAt);
        const dateB = this.parseDate(b.evaluatedAt);
        return dateA - dateB;
      });

      // トレンドデータを生成
      this.trendData = this.generateTrendData(skillEvaluations);

      console.log('Skill Trend Report: Data loaded', {
        evaluations: skillEvaluations.length,
        periods: this.trendData.periods.length
      });

    } catch (error) {
      console.error('Skill Trend Report: Failed to load data:', error);
      this.trendData = this.getEmptyTrendData();
    }
  }

  generateTrendData(evaluations) {
    if (evaluations.length === 0) {
      return this.getEmptyTrendData();
    }

    // 評価を月ごとにグループ化
    const monthlyData = {};
    const allSkills = new Set();

    evaluations.forEach(evaluation => {
      const date = this.parseDate(evaluation.evaluatedAt);
      const monthKey = this.formatMonthKey(date);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: date,
          evaluations: [],
          skillTotals: {},
          skillCounts: {}
        };
      }

      monthlyData[monthKey].evaluations.push(evaluation);

      // スキルスコアを集計
      Object.entries(evaluation.skillDimensionScores).forEach(([skill, score]) => {
        allSkills.add(skill);

        if (!monthlyData[monthKey].skillTotals[skill]) {
          monthlyData[monthKey].skillTotals[skill] = 0;
          monthlyData[monthKey].skillCounts[skill] = 0;
        }

        monthlyData[monthKey].skillTotals[skill] += score;
        monthlyData[monthKey].skillCounts[skill]++;
      });
    });

    // 月ごとの平均を計算
    const periods = Object.keys(monthlyData).sort().map(monthKey => {
      const data = monthlyData[monthKey];
      const skillAverages = {};

      Object.keys(data.skillTotals).forEach(skill => {
        skillAverages[skill] = data.skillTotals[skill] / data.skillCounts[skill];
      });

      return {
        monthKey: monthKey,
        date: data.date,
        evaluationCount: data.evaluations.length,
        skillAverages: skillAverages
      };
    });

    return {
      periods: periods,
      allSkills: Array.from(allSkills),
      totalEvaluations: evaluations.length
    };
  }

  getEmptyTrendData() {
    return {
      periods: [],
      allSkills: [],
      totalEvaluations: 0
    };
  }

  afterRender() {
    this.renderReport();
  }

  changePeriod(period) {
    this.selectedPeriod = period;

    const customStartContainer = document.getElementById('customStartDateContainer');
    const customEndContainer = document.getElementById('customEndDateContainer');

    if (period === 'custom') {
      customStartContainer.style.display = 'block';
      customEndContainer.style.display = 'block';
    } else {
      customStartContainer.style.display = 'none';
      customEndContainer.style.display = 'none';
      this.renderReport();
    }
  }

  updateCustomPeriod() {
    const startDate = document.getElementById('customStartDate').value;
    const endDate = document.getElementById('customEndDate').value;

    if (startDate && endDate) {
      this.customStartDate = new Date(startDate);
      this.customEndDate = new Date(endDate);
      this.renderReport();
    }
  }

  filterDataByPeriod() {
    if (!this.trendData || this.trendData.periods.length === 0) {
      return this.trendData;
    }

    let filteredPeriods = [...this.trendData.periods];

    if (this.selectedPeriod === 'last6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filteredPeriods = filteredPeriods.filter(p => p.date >= sixMonthsAgo);
    } else if (this.selectedPeriod === 'last12months') {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      filteredPeriods = filteredPeriods.filter(p => p.date >= twelveMonthsAgo);
    } else if (this.selectedPeriod === 'custom' && this.customStartDate && this.customEndDate) {
      filteredPeriods = filteredPeriods.filter(p =>
        p.date >= this.customStartDate && p.date <= this.customEndDate
      );
    }

    return {
      ...this.trendData,
      periods: filteredPeriods
    };
  }

  renderReport() {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    const filteredData = this.filterDataByPeriod();

    if (filteredData.periods.length === 0) {
      container.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          選択した期間にデータがありません
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <!-- サマリーカード -->
      <div class="row mb-4">
        ${this.renderSummaryCards(filteredData)}
      </div>

      <!-- 全体トレンドチャート -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-chart-line me-2"></i>組織全体のスキル成長トレンド
          </h5>
        </div>
        <div class="card-body">
          <canvas id="overallTrendChart"></canvas>
        </div>
      </div>

      <!-- スキル別トレンドチャート -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-layer-group me-2"></i>スキルディメンション別トレンド
          </h5>
        </div>
        <div class="card-body">
          <canvas id="skillBySkillTrendChart"></canvas>
        </div>
      </div>

      <!-- 成長率分析 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-percentage me-2"></i>スキル成長率分析
          </h5>
        </div>
        <div class="card-body">
          ${this.renderGrowthAnalysis(filteredData)}
        </div>
      </div>

      <!-- 詳細データテーブル -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-table me-2"></i>期間別詳細データ
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            ${this.renderDetailTable(filteredData)}
          </div>
        </div>
      </div>
    `;

    // チャートを描画
    setTimeout(() => {
      this.renderOverallTrendChart(filteredData);
      this.renderSkillBySkillTrendChart(filteredData);
    }, 100);
  }

  renderSummaryCards(data) {
    if (data.periods.length === 0) return '';

    const latestPeriod = data.periods[data.periods.length - 1];
    const firstPeriod = data.periods[0];

    // 最新の総合平均
    const latestScores = Object.values(latestPeriod.skillAverages);
    const latestAvg = latestScores.length > 0
      ? latestScores.reduce((a, b) => a + b, 0) / latestScores.length
      : 0;

    // 最初の総合平均
    const firstScores = Object.values(firstPeriod.skillAverages);
    const firstAvg = firstScores.length > 0
      ? firstScores.reduce((a, b) => a + b, 0) / firstScores.length
      : 0;

    // 成長率
    const growthRate = firstAvg > 0 ? ((latestAvg - firstAvg) / firstAvg) * 100 : 0;

    // 最も成長したスキル
    let maxGrowth = 0;
    let maxGrowthSkill = '';

    data.allSkills.forEach(skill => {
      const first = firstPeriod.skillAverages[skill] || 0;
      const latest = latestPeriod.skillAverages[skill] || 0;
      const growth = latest - first;

      if (growth > maxGrowth) {
        maxGrowth = growth;
        maxGrowthSkill = skill;
      }
    });

    const skillNameMap = this.getSkillNameMap();

    return `
      <div class="col-md-3 mb-3">
        <div class="card">
          <div class="card-body">
            <h6 class="card-subtitle mb-3 text-muted">
              <i class="fas fa-chart-bar me-2"></i>現在の総合平均
            </h6>
            <div class="display-6 mb-2">${latestAvg.toFixed(2)}</div>
            <small class="text-muted">/ 5.0</small>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card ${growthRate >= 0 ? 'border-success' : 'border-danger'}">
          <div class="card-body">
            <h6 class="card-subtitle mb-3 text-muted">
              <i class="fas fa-arrow-trend-up me-2"></i>成長率
            </h6>
            <div class="display-6 mb-2 ${growthRate >= 0 ? 'text-success' : 'text-danger'}">
              ${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%
            </div>
            <small class="text-muted">期間内</small>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card border-primary">
          <div class="card-body">
            <h6 class="card-subtitle mb-3 text-muted">
              <i class="fas fa-trophy me-2"></i>最高成長スキル
            </h6>
            <div class="fs-6 mb-2 text-primary">
              ${this.app.sanitizeHtml(skillNameMap[maxGrowthSkill] || maxGrowthSkill)}
            </div>
            <small class="text-muted">+${maxGrowth.toFixed(2)} ポイント</small>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card">
          <div class="card-body">
            <h6 class="card-subtitle mb-3 text-muted">
              <i class="fas fa-calendar-check me-2"></i>分析期間
            </h6>
            <div class="fs-6 mb-2">
              ${data.periods.length} ヶ月
            </div>
            <small class="text-muted">${this.formatDate(firstPeriod.date)} 〜 ${this.formatDate(latestPeriod.date)}</small>
          </div>
        </div>
      </div>
    `;
  }

  renderOverallTrendChart(data) {
    const canvas = document.getElementById('overallTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = data.periods.map(p => this.formatDate(p.date));
    const averages = data.periods.map(period => {
      const scores = Object.values(period.skillAverages);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });

    const ctx = canvas.getContext('2d');

    if (this.chartInstances.overall) {
      this.chartInstances.overall.destroy();
    }

    this.chartInstances.overall = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '組織平均スキルスコア',
          data: averages,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 0.5
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'スコア: ' + context.parsed.y.toFixed(2);
              }
            }
          }
        }
      }
    });
  }

  renderSkillBySkillTrendChart(data) {
    const canvas = document.getElementById('skillBySkillTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const skillNameMap = this.getSkillNameMap();
    const labels = data.periods.map(p => this.formatDate(p.date));

    const colors = [
      { border: 'rgba(54, 162, 235, 1)', bg: 'rgba(54, 162, 235, 0.1)' },
      { border: 'rgba(255, 99, 132, 1)', bg: 'rgba(255, 99, 132, 0.1)' },
      { border: 'rgba(75, 192, 192, 1)', bg: 'rgba(75, 192, 192, 0.1)' },
      { border: 'rgba(255, 206, 86, 1)', bg: 'rgba(255, 206, 86, 0.1)' },
      { border: 'rgba(153, 102, 255, 1)', bg: 'rgba(153, 102, 255, 0.1)' },
      { border: 'rgba(255, 159, 64, 1)', bg: 'rgba(255, 159, 64, 0.1)' },
      { border: 'rgba(99, 255, 132, 1)', bg: 'rgba(99, 255, 132, 0.1)' },
      { border: 'rgba(255, 99, 255, 1)', bg: 'rgba(255, 99, 255, 0.1)' }
    ];

    const datasets = data.allSkills.map((skill, index) => {
      const skillData = data.periods.map(period => period.skillAverages[skill] || null);
      const color = colors[index % colors.length];

      return {
        label: skillNameMap[skill] || skill,
        data: skillData,
        borderColor: color.border,
        backgroundColor: color.bg,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      };
    });

    const ctx = canvas.getContext('2d');

    if (this.chartInstances.skillBySkill) {
      this.chartInstances.skillBySkill.destroy();
    }

    this.chartInstances.skillBySkill = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 0.5
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 20,
              padding: 10
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + (context.parsed.y !== null ? context.parsed.y.toFixed(2) : 'N/A');
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  renderGrowthAnalysis(data) {
    if (data.periods.length < 2) {
      return '<p class="text-muted">成長率を計算するには少なくとも2つの評価期間が必要です</p>';
    }

    const skillNameMap = this.getSkillNameMap();
    const firstPeriod = data.periods[0];
    const lastPeriod = data.periods[data.periods.length - 1];

    const growthData = data.allSkills.map(skill => {
      const firstScore = firstPeriod.skillAverages[skill] || 0;
      const lastScore = lastPeriod.skillAverages[skill] || 0;
      const growth = lastScore - firstScore;
      const growthPercent = firstScore > 0 ? (growth / firstScore) * 100 : 0;

      return {
        skill: skill,
        skillName: skillNameMap[skill] || skill,
        firstScore: firstScore,
        lastScore: lastScore,
        growth: growth,
        growthPercent: growthPercent
      };
    });

    // 成長率でソート
    growthData.sort((a, b) => b.growth - a.growth);

    let html = '<div class="row">';

    // トップ3成長スキル
    html += '<div class="col-md-6 mb-3">';
    html += '<h6 class="text-success mb-3"><i class="fas fa-arrow-up me-2"></i>最も成長したスキル</h6>';
    growthData.slice(0, 3).forEach((item, index) => {
      html += `
        <div class="d-flex justify-content-between align-items-center mb-3 p-2 border-start border-success border-3">
          <div>
            <strong>${index + 1}. ${this.app.sanitizeHtml(item.skillName)}</strong>
            <div class="small text-muted">${item.firstScore.toFixed(2)} → ${item.lastScore.toFixed(2)}</div>
          </div>
          <div class="text-end">
            <div class="badge bg-success">${item.growth >= 0 ? '+' : ''}${item.growth.toFixed(2)}</div>
            <div class="small text-muted">${item.growthPercent >= 0 ? '+' : ''}${item.growthPercent.toFixed(1)}%</div>
          </div>
        </div>
      `;
    });
    html += '</div>';

    // ボトム3スキル（改善が必要）
    html += '<div class="col-md-6 mb-3">';
    html += '<h6 class="text-warning mb-3"><i class="fas fa-exclamation-triangle me-2"></i>改善が必要なスキル</h6>';
    growthData.slice(-3).reverse().forEach((item, index) => {
      html += `
        <div class="d-flex justify-content-between align-items-center mb-3 p-2 border-start border-warning border-3">
          <div>
            <strong>${index + 1}. ${this.app.sanitizeHtml(item.skillName)}</strong>
            <div class="small text-muted">${item.firstScore.toFixed(2)} → ${item.lastScore.toFixed(2)}</div>
          </div>
          <div class="text-end">
            <div class="badge bg-warning">${item.growth >= 0 ? '+' : ''}${item.growth.toFixed(2)}</div>
            <div class="small text-muted">${item.growthPercent >= 0 ? '+' : ''}${item.growthPercent.toFixed(1)}%</div>
          </div>
        </div>
      `;
    });
    html += '</div>';

    html += '</div>';

    return html;
  }

  renderDetailTable(data) {
    const skillNameMap = this.getSkillNameMap();

    let html = '<table class="table table-striped table-hover">';
    html += '<thead class="table-light"><tr><th>期間</th><th class="text-center">評価数</th>';

    data.allSkills.forEach(skill => {
      html += `<th class="text-center">${this.app.sanitizeHtml(skillNameMap[skill] || skill)}</th>`;
    });

    html += '<th class="text-center">平均</th></tr></thead><tbody>';

    data.periods.forEach(period => {
      html += '<tr>';
      html += `<td><strong>${this.formatDate(period.date)}</strong></td>`;
      html += `<td class="text-center">${period.evaluationCount}</td>`;

      let total = 0;
      let count = 0;

      data.allSkills.forEach(skill => {
        const score = period.skillAverages[skill];
        if (score !== undefined) {
          html += `<td class="text-center">${score.toFixed(2)}</td>`;
          total += score;
          count++;
        } else {
          html += '<td class="text-center text-muted">-</td>';
        }
      });

      const avg = count > 0 ? total / count : 0;
      html += `<td class="text-center"><strong>${avg.toFixed(2)}</strong></td>`;

      html += '</tr>';
    });

    html += '</tbody></table>';

    return html;
  }

  parseDate(dateValue) {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (dateValue && dateValue.toDate) {
      return dateValue.toDate();
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    return new Date();
  }

  formatDate(date) {
    if (!(date instanceof Date)) {
      date = this.parseDate(date);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}/${month}`;
  }

  formatMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  getSkillNameMap() {
    return {
      technical_skills: '技術スキル',
      communication: 'コミュニケーション',
      teamwork: 'チームワーク',
      leadership: 'リーダーシップ',
      problem_solving: '問題解決力',
      safety_awareness: '安全意識',
      efficiency: '作業効率',
      work_quality: '作業品質',
      precision: '精密性',
      creativity: '創造性',
      planning: '計画性',
      analytical_skills: '分析力',
      responsibility: '責任感',
      attention_to_detail: '注意力'
    };
  }

  cleanup() {
    // チャートインスタンスのクリーンアップ
    Object.values(this.chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.chartInstances = {};
  }
}
