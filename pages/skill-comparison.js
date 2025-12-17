/**
 * Skill Comparison Page Component
 * スキルディメンション比較ページ - 複数ワーカーのスキル比較
 *
 * Phase 2 Step 4a: Skill Dimension Comparison Feature
 */

export class SkillComparisonPage {
  constructor(app) {
    this.app = app;
    this.selectedWorkers = [];
    this.allWorkers = [];
    this.evaluationsData = {};
    this.chartInstances = {};
    this.userRole = null;
  }

  async render() {
    return `
      <div class="skill-comparison-page p-4">
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h2 mb-1">
                <i class="fas fa-balance-scale me-2 text-primary"></i>
                スキルディメンション比較
              </h1>
              <p class="text-muted mb-0">複数のワーカーのスキルを比較分析</p>
            </div>
            <span class="badge bg-info fs-6">Phase 2 Feature</span>
          </div>
        </div>

        <!-- ワーカー選択エリア -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-user-check me-2"></i>比較対象ワーカーの選択
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-8 mb-3">
                <label class="form-label">ワーカーを選択（最大5名）</label>
                <select
                  id="workerSelector"
                  class="form-select"
                  onchange="window.app.currentPage.addWorker(this.value)"
                >
                  <option value="">-- ワーカーを選択 --</option>
                </select>
              </div>
              <div class="col-md-4 mb-3 d-flex align-items-end">
                <button
                  class="btn btn-outline-secondary w-100"
                  onclick="window.app.currentPage.clearSelection()"
                >
                  <i class="fas fa-times me-2"></i>選択をクリア
                </button>
              </div>
            </div>

            <!-- 選択されたワーカー表示 -->
            <div id="selectedWorkersContainer" class="mt-3">
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                比較したいワーカーを選択してください（最大5名）
              </div>
            </div>
          </div>
        </div>

        <!-- 比較結果表示エリア -->
        <div id="comparisonResultsContainer">
          <!-- ここに比較結果が表示される -->
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
    const canViewComparison = this.userRole === 'admin' || this.userRole === 'evaluator';

    if (!canViewComparison) {
      this.app.showError('スキル比較を表示する権限がありません');
      this.app.navigate('#/dashboard');
      return;
    }

    try {
      await this.loadData();

      const contentContainer = document.getElementById("content");
      contentContainer.innerHTML = await this.render();

      this.afterRender();
    } catch (error) {
      console.error('Skill Comparison: Failed to initialize:', error);
      this.app.showError('スキル比較ページの読み込みに失敗しました');
    }
  }

  async loadData() {
    try {
      // 全評価データを取得
      const evaluations = await this.app.api.getEvaluations({}) || [];

      // スキルディメンションデータを持つ評価のみフィルタ
      const skillEvaluations = evaluations.filter(e =>
        e.skillDimensionScores && Object.keys(e.skillDimensionScores).length > 0
      );

      // ユーザー情報を取得
      const users = await this.app.api.getUsers({}) || [];

      // ワーカーのみフィルタ（評価データがあるワーカー）
      const workerIds = [...new Set(skillEvaluations.map(e => e.targetUserId))];
      this.allWorkers = users.filter(u => workerIds.includes(u.id));

      // 評価データをワーカーごとに整理
      this.evaluationsData = {};
      skillEvaluations.forEach(evaluation => {
        const userId = evaluation.targetUserId;
        if (!this.evaluationsData[userId]) {
          this.evaluationsData[userId] = [];
        }
        this.evaluationsData[userId].push(evaluation);
      });

      console.log('Skill Comparison: Data loaded', {
        workers: this.allWorkers.length,
        evaluations: skillEvaluations.length
      });

    } catch (error) {
      console.error('Skill Comparison: Failed to load data:', error);
      this.allWorkers = [];
      this.evaluationsData = {};
    }
  }

  afterRender() {
    this.populateWorkerSelector();
  }

  populateWorkerSelector() {
    const selector = document.getElementById('workerSelector');
    if (!selector) return;

    selector.innerHTML = '<option value="">-- ワーカーを選択 --</option>';

    this.allWorkers.forEach(worker => {
      const option = document.createElement('option');
      option.value = worker.id;
      option.textContent = worker.name || worker.displayName || `User ${worker.id.substring(0, 6)}`;
      selector.appendChild(option);
    });
  }

  addWorker(workerId) {
    if (!workerId) return;

    // 既に選択されているかチェック
    if (this.selectedWorkers.includes(workerId)) {
      this.app.showError('このワーカーは既に選択されています');
      return;
    }

    // 最大5名まで
    if (this.selectedWorkers.length >= 5) {
      this.app.showError('最大5名まで選択できます');
      return;
    }

    this.selectedWorkers.push(workerId);
    this.updateSelectedWorkersDisplay();
    this.updateComparisonResults();

    // セレクターをリセット
    document.getElementById('workerSelector').value = '';
  }

  removeWorker(workerId) {
    this.selectedWorkers = this.selectedWorkers.filter(id => id !== workerId);
    this.updateSelectedWorkersDisplay();
    this.updateComparisonResults();
  }

  clearSelection() {
    this.selectedWorkers = [];
    this.updateSelectedWorkersDisplay();
    this.updateComparisonResults();
  }

  updateSelectedWorkersDisplay() {
    const container = document.getElementById('selectedWorkersContainer');
    if (!container) return;

    if (this.selectedWorkers.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          比較したいワーカーを選択してください（最大5名）
        </div>
      `;
      return;
    }

    const workersHTML = this.selectedWorkers.map(workerId => {
      const worker = this.allWorkers.find(w => w.id === workerId);
      const workerName = worker?.name || worker?.displayName || `User ${workerId.substring(0, 6)}`;

      return `
        <div class="badge bg-primary me-2 mb-2 p-2 fs-6">
          <i class="fas fa-user me-2"></i>
          ${this.app.sanitizeHtml(workerName)}
          <button
            class="btn btn-sm btn-link text-white p-0 ms-2"
            onclick="window.app.currentPage.removeWorker('${workerId}')"
            style="text-decoration: none;"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="d-flex flex-wrap">
        ${workersHTML}
      </div>
      <small class="text-muted mt-2 d-block">
        ${this.selectedWorkers.length} / 5 名選択中
      </small>
    `;
  }

  updateComparisonResults() {
    const container = document.getElementById('comparisonResultsContainer');
    if (!container) return;

    if (this.selectedWorkers.length === 0) {
      container.innerHTML = '';
      return;
    }

    // 比較データを生成
    const comparisonData = this.generateComparisonData();

    container.innerHTML = `
      <!-- レーダーチャート比較 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-chart-radar me-2"></i>スキルレーダーチャート比較
          </h5>
        </div>
        <div class="card-body">
          <canvas id="comparisonRadarChart"></canvas>
        </div>
      </div>

      <!-- スキル詳細比較テーブル -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-table me-2"></i>スキルスコア詳細比較
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            ${this.renderComparisonTable(comparisonData)}
          </div>
        </div>
      </div>

      <!-- 平均スコア比較 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-chart-bar me-2"></i>平均スコア比較
          </h5>
        </div>
        <div class="card-body">
          <canvas id="comparisonBarChart"></canvas>
        </div>
      </div>

      <!-- 統計サマリー -->
      <div class="row">
        ${this.renderStatisticsSummary(comparisonData)}
      </div>
    `;

    // チャートを描画
    setTimeout(() => {
      this.renderComparisonRadarChart(comparisonData);
      this.renderComparisonBarChart(comparisonData);
    }, 100);
  }

  generateComparisonData() {
    const data = {
      workers: [],
      skills: new Set(),
      allSkillNames: []
    };

    this.selectedWorkers.forEach(workerId => {
      const worker = this.allWorkers.find(w => w.id === workerId);
      const evaluations = this.evaluationsData[workerId] || [];

      // 最新の評価を取得
      const latestEvaluation = evaluations[evaluations.length - 1];
      const skillScores = latestEvaluation?.skillDimensionScores || {};

      // スキル名を収集
      Object.keys(skillScores).forEach(skill => data.skills.add(skill));

      data.workers.push({
        id: workerId,
        name: worker?.name || worker?.displayName || `User ${workerId.substring(0, 6)}`,
        skillScores: skillScores,
        evaluationCount: evaluations.length
      });
    });

    data.allSkillNames = Array.from(data.skills);
    return data;
  }

  renderComparisonTable(data) {
    const skillNameMap = this.getSkillNameMap();

    let html = '<table class="table table-bordered table-hover">';
    html += '<thead class="table-light"><tr><th>スキルディメンション</th>';

    data.workers.forEach(worker => {
      html += `<th class="text-center">${this.app.sanitizeHtml(worker.name)}</th>`;
    });

    html += '<th class="text-center">平均</th></tr></thead><tbody>';

    data.allSkillNames.forEach(skill => {
      html += '<tr>';
      html += `<td><strong>${this.app.sanitizeHtml(skillNameMap[skill] || skill)}</strong></td>`;

      let total = 0;
      let count = 0;

      data.workers.forEach(worker => {
        const score = worker.skillScores[skill];
        if (score !== undefined) {
          const colorClass = this.getScoreColorClass(score);
          html += `<td class="text-center ${colorClass}"><strong>${score.toFixed(1)}</strong></td>`;
          total += score;
          count++;
        } else {
          html += '<td class="text-center text-muted">-</td>';
        }
      });

      const avg = count > 0 ? total / count : 0;
      const avgColorClass = this.getScoreColorClass(avg);
      html += `<td class="text-center ${avgColorClass}"><strong>${avg.toFixed(1)}</strong></td>`;

      html += '</tr>';
    });

    // 各ワーカーの平均行を追加
    html += '<tr class="table-active"><td><strong>総合平均</strong></td>';
    data.workers.forEach(worker => {
      const scores = Object.values(worker.skillScores);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const colorClass = this.getScoreColorClass(avg);
      html += `<td class="text-center ${colorClass}"><strong>${avg.toFixed(2)}</strong></td>`;
    });

    // 全体の平均
    let grandTotal = 0;
    let grandCount = 0;
    data.workers.forEach(worker => {
      const scores = Object.values(worker.skillScores);
      grandTotal += scores.reduce((a, b) => a + b, 0);
      grandCount += scores.length;
    });
    const grandAvg = grandCount > 0 ? grandTotal / grandCount : 0;
    const grandColorClass = this.getScoreColorClass(grandAvg);
    html += `<td class="text-center ${grandColorClass}"><strong>${grandAvg.toFixed(2)}</strong></td>`;

    html += '</tr></tbody></table>';

    return html;
  }

  renderStatisticsSummary(data) {
    const skillNameMap = this.getSkillNameMap();

    // 各ワーカーの統計を計算
    const stats = data.workers.map(worker => {
      const scores = Object.values(worker.skillScores);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const max = scores.length > 0 ? Math.max(...scores) : 0;
      const min = scores.length > 0 ? Math.min(...scores) : 0;

      // 最高スキルと最低スキル
      let highestSkill = '';
      let lowestSkill = '';
      let highestScore = 0;
      let lowestScore = 5;

      Object.entries(worker.skillScores).forEach(([skill, score]) => {
        if (score > highestScore) {
          highestScore = score;
          highestSkill = skill;
        }
        if (score < lowestScore) {
          lowestScore = score;
          lowestSkill = skill;
        }
      });

      return {
        worker: worker,
        avg: avg,
        max: max,
        min: min,
        highestSkill: skillNameMap[highestSkill] || highestSkill,
        lowestSkill: skillNameMap[lowestSkill] || lowestSkill,
        highestScore: highestScore,
        lowestScore: lowestScore
      };
    });

    return stats.map(stat => `
      <div class="col-md-${12 / Math.min(data.workers.length, 3)} mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h6 class="mb-0">
              <i class="fas fa-user me-2"></i>${this.app.sanitizeHtml(stat.worker.name)}
            </h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">総合平均</span>
                <span class="badge bg-primary fs-6">${stat.avg.toFixed(2)}</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar" role="progressbar" style="width: ${(stat.avg / 5) * 100}%"></div>
              </div>
            </div>

            <div class="mb-2">
              <small class="text-muted d-block">最高スキル</small>
              <strong class="text-success">
                <i class="fas fa-arrow-up me-1"></i>${this.app.sanitizeHtml(stat.highestSkill)} (${stat.highestScore.toFixed(1)})
              </strong>
            </div>

            <div>
              <small class="text-muted d-block">改善領域</small>
              <strong class="text-warning">
                <i class="fas fa-arrow-down me-1"></i>${this.app.sanitizeHtml(stat.lowestSkill)} (${stat.lowestScore.toFixed(1)})
              </strong>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderComparisonRadarChart(data) {
    const canvas = document.getElementById('comparisonRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const skillNameMap = this.getSkillNameMap();
    const labels = data.allSkillNames.map(s => skillNameMap[s] || s);

    const datasets = data.workers.map((worker, index) => {
      const scores = data.allSkillNames.map(skill => worker.skillScores[skill] || 0);
      const colors = [
        { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
        { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
        { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
        { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' },
        { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' }
      ];

      const color = colors[index % colors.length];

      return {
        label: worker.name,
        data: scores,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 2,
        pointBackgroundColor: color.border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color.border
      };
    });

    const ctx = canvas.getContext('2d');

    if (this.chartInstances.radar) {
      this.chartInstances.radar.destroy();
    }

    this.chartInstances.radar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
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
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.r.toFixed(1);
              }
            }
          }
        }
      }
    });
  }

  renderComparisonBarChart(data) {
    const canvas = document.getElementById('comparisonBarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = data.workers.map(w => w.name);
    const averages = data.workers.map(worker => {
      const scores = Object.values(worker.skillScores);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });

    const ctx = canvas.getContext('2d');

    if (this.chartInstances.bar) {
      this.chartInstances.bar.destroy();
    }

    this.chartInstances.bar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '平均スキルスコア',
          data: averages,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
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
            display: false
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

  getScoreColorClass(score) {
    if (score >= 4.0) return 'table-success';
    if (score >= 3.0) return 'table-primary';
    if (score >= 2.0) return 'table-warning';
    return 'table-danger';
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
