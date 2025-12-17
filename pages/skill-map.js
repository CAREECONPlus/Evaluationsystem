/**
 * Skill Map Page Component
 * スキルマップページ - 組織のスキル可視化
 *
 * Phase 2: Skill Dimension Feature Implementation
 */

export class SkillMapPage {
  constructor(app) {
    this.app = app;
    this.skillMapData = null;
    this.currentView = 'heatmap'; // 'heatmap' or 'matrix'
    this.chartInstance = null;
    this.selectedSkill = null;
    this.userRole = null;
  }

  async render() {
    return `
      <div class="skill-map-page p-4">
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h2 mb-1">
                <i class="fas fa-project-diagram me-2 text-primary"></i>
                スキルマップ
              </h1>
              <p class="text-muted mb-0">組織のスキル分布とギャップ分析</p>
            </div>
            <span class="badge bg-info fs-6">Phase 2 Feature</span>
          </div>
        </div>

        <!-- ビュー切り替えタブ -->
        <ul class="nav nav-tabs mb-4" id="skillMapTabs">
          <li class="nav-item">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#heatmap-view">
              <i class="fas fa-th me-2"></i>ヒートマップ
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#matrix-view">
              <i class="fas fa-table me-2"></i>スキルマトリクス
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#gap-analysis-view">
              <i class="fas fa-chart-bar me-2"></i>ギャップ分析
            </button>
          </li>
        </ul>

        <!-- タブコンテンツ -->
        <div class="tab-content">
          ${this.renderHeatmapView()}
          ${this.renderMatrixView()}
          ${this.renderGapAnalysisView()}
        </div>
      </div>
    `;
  }

  renderHeatmapView() {
    return `
      <div class="tab-pane fade show active" id="heatmap-view">
        <div class="row">
          <!-- スキル統計カード -->
          <div class="col-md-3 mb-4">
            <div class="card">
              <div class="card-body">
                <h6 class="card-subtitle mb-3 text-muted">
                  <i class="fas fa-users me-2"></i>対象従業員
                </h6>
                <div class="display-6 mb-2" id="totalEmployees">-</div>
                <small class="text-muted">評価済み従業員数</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card">
              <div class="card-body">
                <h6 class="card-subtitle mb-3 text-muted">
                  <i class="fas fa-brain me-2"></i>追跡スキル
                </h6>
                <div class="display-6 mb-2" id="totalSkills">-</div>
                <small class="text-muted">スキルディメンション数</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card border-success">
              <div class="card-body">
                <h6 class="card-subtitle mb-3 text-success">
                  <i class="fas fa-arrow-up me-2"></i>高スキル領域
                </h6>
                <div class="display-6 mb-2 text-success" id="highSkillCount">-</div>
                <small class="text-muted">平均4.0以上</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card border-warning">
              <div class="card-body">
                <h6 class="card-subtitle mb-3 text-warning">
                  <i class="fas fa-exclamation-triangle me-2"></i>強化必要領域
                </h6>
                <div class="display-6 mb-2 text-warning" id="lowSkillCount">-</div>
                <small class="text-muted">平均3.0未満</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ヒートマップチャート -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-fire me-2"></i>スキルヒートマップ
            </h5>
          </div>
          <div class="card-body">
            <div id="skillHeatmapContainer">
              <div class="empty-state py-5">
                <i class="fas fa-spinner fa-spin fa-3x mb-3"></i>
                <p>スキルデータを読み込んでいます...</p>
              </div>
            </div>
            <canvas id="skillHeatmap" style="display:none;"></canvas>
          </div>
        </div>

        <!-- トップスキル & ボトムスキル -->
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">
                  <i class="fas fa-trophy me-2"></i>組織の強みスキル (Top 5)
                </h5>
              </div>
              <div class="card-body">
                <div id="topSkillsList">
                  <div class="text-center py-3">
                    <i class="fas fa-spinner fa-spin"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0">
                  <i class="fas fa-wrench me-2"></i>改善が必要なスキル (Bottom 5)
                </h5>
              </div>
              <div class="card-body">
                <div id="bottomSkillsList">
                  <div class="text-center py-3">
                    <i class="fas fa-spinner fa-spin"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMatrixView() {
    return `
      <div class="tab-pane fade" id="matrix-view">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-table me-2"></i>従業員×スキル マトリクス
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <div id="skillMatrixContainer">
                <div class="text-center py-5">
                  <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
                  <p>マトリクスを生成しています...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderGapAnalysisView() {
    return `
      <div class="tab-pane fade" id="gap-analysis-view">
        <div class="row">
          <div class="col-12 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-chart-bar me-2"></i>スキルギャップ分析
                </h5>
              </div>
              <div class="card-body">
                <canvas id="skillGapChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-clipboard-list me-2"></i>推奨アクション
                </h5>
              </div>
              <div class="card-body">
                <div id="recommendedActions">
                  <div class="text-center py-3">
                    <i class="fas fa-spinner fa-spin"></i>
                  </div>
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

    // 権限チェック
    this.userRole = this.app.currentUser?.role || 'worker';
    const canViewSkillMap = this.userRole === 'admin' || this.userRole === 'evaluator';

    if (!canViewSkillMap) {
      this.app.showError('スキルマップを表示する権限がありません');
      this.app.navigate('#/dashboard');
      return;
    }

    try {
      // データを読み込んでレンダリング
      await this.loadSkillMapData();

      const contentContainer = document.getElementById("content");
      contentContainer.innerHTML = await this.render();

      // チャートとビジュアライゼーションを描画
      this.afterRender();

    } catch (error) {
      console.error('Skill Map: Failed to initialize:', error);
      this.app.showError('スキルマップの読み込みに失敗しました');
    }
  }

  async loadSkillMapData() {
    try {
      // 全評価データを取得
      const evaluations = await this.app.api.getEvaluations({}) || [];

      // スキルディメンションデータを持つ評価のみフィルタ
      const skillEvaluations = evaluations.filter(e =>
        e.skillDimensionScores && Object.keys(e.skillDimensionScores).length > 0
      );

      // ユーザー情報を取得
      const users = await this.app.api.getUsers({}) || [];

      // スキルマップデータを生成
      this.skillMapData = this.generateSkillMapData(skillEvaluations, users);

      console.log('Skill Map Data loaded:', this.skillMapData);

    } catch (error) {
      console.error('Skill Map: Failed to load data:', error);
      this.skillMapData = this.getEmptySkillMapData();
    }
  }

  generateSkillMapData(evaluations, users) {
    if (evaluations.length === 0) {
      return this.getEmptySkillMapData();
    }

    // スキルディメンションごとの平均スコアを計算
    const skillAverages = {};
    const skillCounts = {};
    const userSkills = {};

    evaluations.forEach(evaluation => {
      const userId = evaluation.targetUserId;
      const scores = evaluation.skillDimensionScores;

      if (!userSkills[userId]) {
        userSkills[userId] = {};
      }

      Object.entries(scores).forEach(([skill, score]) => {
        // 全体平均用
        if (!skillAverages[skill]) {
          skillAverages[skill] = 0;
          skillCounts[skill] = 0;
        }
        skillAverages[skill] += score;
        skillCounts[skill]++;

        // ユーザーごとのスキル
        if (!userSkills[userId][skill]) {
          userSkills[userId][skill] = [];
        }
        userSkills[userId][skill].push(score);
      });
    });

    // 平均を計算
    const finalSkillAverages = {};
    Object.keys(skillAverages).forEach(skill => {
      finalSkillAverages[skill] = skillAverages[skill] / skillCounts[skill];
    });

    // ユーザーごとの最新スキルスコアを計算
    const userSkillAverages = {};
    Object.entries(userSkills).forEach(([userId, skills]) => {
      userSkillAverages[userId] = {};
      Object.entries(skills).forEach(([skill, scores]) => {
        // 最新のスコアを使用
        userSkillAverages[userId][skill] = scores[scores.length - 1];
      });
    });

    return {
      skillAverages: finalSkillAverages,
      userSkills: userSkillAverages,
      users: users,
      totalEmployees: Object.keys(userSkills).length,
      totalSkills: Object.keys(finalSkillAverages).length,
      evaluations: evaluations
    };
  }

  getEmptySkillMapData() {
    return {
      skillAverages: {},
      userSkills: {},
      users: [],
      totalEmployees: 0,
      totalSkills: 0,
      evaluations: []
    };
  }

  afterRender() {
    // 統計カードを更新
    this.updateStatCards();

    // ヒートマップを描画
    this.renderSkillHeatmap();

    // トップ/ボトムスキルリストを表示
    this.renderTopBottomSkills();

    // マトリクスを表示
    this.renderSkillMatrix();

    // ギャップ分析チャートを表示
    this.renderGapAnalysisChart();

    // 推奨アクションを表示
    this.renderRecommendedActions();
  }

  updateStatCards() {
    const data = this.skillMapData;

    document.getElementById('totalEmployees').textContent = data.totalEmployees || '0';
    document.getElementById('totalSkills').textContent = data.totalSkills || '0';

    // 高スキル領域カウント (平均4.0以上)
    const highSkills = Object.values(data.skillAverages).filter(avg => avg >= 4.0).length;
    document.getElementById('highSkillCount').textContent = highSkills.toString();

    // 低スキル領域カウント (平均3.0未満)
    const lowSkills = Object.values(data.skillAverages).filter(avg => avg < 3.0).length;
    document.getElementById('lowSkillCount').textContent = lowSkills.toString();
  }

  renderSkillHeatmap() {
    const container = document.getElementById('skillHeatmapContainer');
    const canvas = document.getElementById('skillHeatmap');

    if (!this.skillMapData || this.skillMapData.totalSkills === 0) {
      container.innerHTML = `
        <div class="empty-state py-5">
          <i class="fas fa-chart-area fa-3x mb-3 text-muted"></i>
          <p>スキルディメンションデータがありません</p>
          <small class="text-muted">評価にskillDimensionScoresが必要です</small>
        </div>
      `;
      return;
    }

    container.style.display = 'none';
    canvas.style.display = 'block';

    // 簡易ヒートマップ（バーチャート形式）
    const skillNames = Object.keys(this.skillMapData.skillAverages);
    const skillScores = Object.values(this.skillMapData.skillAverages);

    const skillNameMap = this.getSkillNameMap();
    const labels = skillNames.map(skill => skillNameMap[skill] || skill);

    const ctx = canvas.getContext('2d');

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '組織平均スコア',
          data: skillScores,
          backgroundColor: skillScores.map(score => {
            if (score >= 4.0) return 'rgba(40, 167, 69, 0.8)';
            if (score >= 3.0) return 'rgba(0, 123, 255, 0.8)';
            if (score >= 2.0) return 'rgba(255, 193, 7, 0.8)';
            return 'rgba(220, 53, 69, 0.8)';
          }),
          borderColor: skillScores.map(score => {
            if (score >= 4.0) return 'rgba(40, 167, 69, 1)';
            if (score >= 3.0) return 'rgba(0, 123, 255, 1)';
            if (score >= 2.0) return 'rgba(255, 193, 7, 1)';
            return 'rgba(220, 53, 69, 1)';
          }),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: 'スキルスコア'
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
                return 'スコア: ' + context.parsed.x.toFixed(2) + ' / 5.0';
              }
            }
          }
        }
      }
    });
  }

  renderTopBottomSkills() {
    const skillAverages = this.skillMapData.skillAverages;
    if (!skillAverages || Object.keys(skillAverages).length === 0) {
      document.getElementById('topSkillsList').innerHTML = '<p class="text-muted">データなし</p>';
      document.getElementById('bottomSkillsList').innerHTML = '<p class="text-muted">データなし</p>';
      return;
    }

    const skillNameMap = this.getSkillNameMap();
    const sortedSkills = Object.entries(skillAverages).sort((a, b) => b[1] - a[1]);

    // Top 5
    const topSkills = sortedSkills.slice(0, 5);
    const topHTML = topSkills.map(([skill, score]) => `
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <strong>${this.app.sanitizeHtml(skillNameMap[skill] || skill)}</strong>
        </div>
        <div>
          <span class="badge bg-success fs-6">${score.toFixed(2)}</span>
        </div>
      </div>
    `).join('');

    // Bottom 5
    const bottomSkills = sortedSkills.slice(-5).reverse();
    const bottomHTML = bottomSkills.map(([skill, score]) => `
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <strong>${this.app.sanitizeHtml(skillNameMap[skill] || skill)}</strong>
        </div>
        <div>
          <span class="badge bg-warning fs-6">${score.toFixed(2)}</span>
        </div>
      </div>
    `).join('');

    document.getElementById('topSkillsList').innerHTML = topHTML;
    document.getElementById('bottomSkillsList').innerHTML = bottomHTML;
  }

  renderSkillMatrix() {
    const container = document.getElementById('skillMatrixContainer');

    if (!this.skillMapData || this.skillMapData.totalEmployees === 0) {
      container.innerHTML = '<p class="text-muted text-center py-5">データがありません</p>';
      return;
    }

    const userSkills = this.skillMapData.userSkills;
    const users = this.skillMapData.users;
    const allSkills = Object.keys(this.skillMapData.skillAverages);
    const skillNameMap = this.getSkillNameMap();

    let tableHTML = '<table class="table table-bordered table-sm">';
    tableHTML += '<thead class="table-light"><tr><th>従業員</th>';

    allSkills.forEach(skill => {
      tableHTML += `<th class="text-center" style="min-width: 80px;">${this.app.sanitizeHtml(skillNameMap[skill] || skill)}</th>`;
    });

    tableHTML += '</tr></thead><tbody>';

    Object.entries(userSkills).forEach(([userId, skills]) => {
      const user = users.find(u => u.id === userId);
      const userName = user?.name || user?.displayName || `User ${userId.substring(0, 6)}`;

      tableHTML += `<tr><td><strong>${this.app.sanitizeHtml(userName)}</strong></td>`;

      allSkills.forEach(skill => {
        const score = skills[skill];
        if (score !== undefined) {
          const colorClass = score >= 4.0 ? 'table-success' : score >= 3.0 ? 'table-primary' : score >= 2.0 ? 'table-warning' : 'table-danger';
          tableHTML += `<td class="text-center ${colorClass}">${score.toFixed(1)}</td>`;
        } else {
          tableHTML += '<td class="text-center text-muted">-</td>';
        }
      });

      tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
  }

  renderGapAnalysisChart() {
    const canvas = document.getElementById('skillGapChart');
    if (!canvas || typeof Chart === 'undefined') return;

    // 目標スコア (4.0) とのギャップを計算
    const skillAverages = this.skillMapData.skillAverages;
    if (!skillAverages || Object.keys(skillAverages).length === 0) {
      canvas.parentElement.innerHTML = '<p class="text-center text-muted py-5">データがありません</p>';
      return;
    }

    const target = 4.0;
    const skillNameMap = this.getSkillNameMap();
    const labels = Object.keys(skillAverages).map(s => skillNameMap[s] || s);
    const currentScores = Object.values(skillAverages);
    const gaps = currentScores.map(score => Math.max(0, target - score));

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '現在のスコア',
          data: currentScores,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }, {
          label: 'ギャップ（目標4.0との差）',
          data: gaps,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            stacked: true
          },
          x: {
            stacked: true
          }
        }
      }
    });
  }

  renderRecommendedActions() {
    const container = document.getElementById('recommendedActions');
    const skillAverages = this.skillMapData.skillAverages;

    if (!skillAverages || Object.keys(skillAverages).length === 0) {
      container.innerHTML = '<p class="text-muted">データがありません</p>';
      return;
    }

    const skillNameMap = this.getSkillNameMap();
    const lowSkills = Object.entries(skillAverages)
      .filter(([_, score]) => score < 3.5)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5);

    if (lowSkills.length === 0) {
      container.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle me-2"></i>
          すべてのスキルディメンションが良好なレベルです！
        </div>
      `;
      return;
    }

    const actionsHTML = lowSkills.map(([skill, score]) => `
      <div class="alert alert-warning d-flex align-items-start">
        <i class="fas fa-lightbulb fa-2x me-3"></i>
        <div>
          <h6 class="alert-heading">${this.app.sanitizeHtml(skillNameMap[skill] || skill)} の強化</h6>
          <p class="mb-1">現在のスコア: <strong>${score.toFixed(2)}</strong> / 5.0</p>
          <small>推奨アクション: ${skill}に関するトレーニングプログラムの実施、またはメンタリングの強化を検討してください。</small>
        </div>
      </div>
    `).join('');

    container.innerHTML = actionsHTML;
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
}
