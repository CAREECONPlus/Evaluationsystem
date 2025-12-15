/**
 * 職種別グラフ設定サービス
 * Job Type Specific Chart Configuration Service
 */

export class JobTypeChartConfig {
  constructor() {
    // 職種別の評価項目設定
    this.jobTypeConfigs = {
      // 建設・施工系
      '建設作業員': {
        primarySkills: ['technical_skills', 'safety_awareness', 'work_quality', 'teamwork'],
        chartType: 'radar',
        colors: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
        displayName: '建設作業員',
        category: 'construction'
      },
      '現場監督': {
        primarySkills: ['leadership', 'problem_solving', 'communication', 'safety_awareness', 'technical_skills'],
        chartType: 'radar',
        colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        displayName: '現場監督',
        category: 'construction'
      },
      '土木作業員': {
        primarySkills: ['technical_skills', 'safety_awareness', 'teamwork', 'work_quality'],
        chartType: 'radar',
        colors: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'],
        displayName: '土木作業員',
        category: 'construction'
      },

      // 設備系
      '電気工事': {
        primarySkills: ['technical_skills', 'safety_awareness', 'precision', 'problem_solving'],
        chartType: 'radar',
        colors: ['#3b82f6', '#f59e0b', '#06b6d4', '#10b981'],
        displayName: '電気工事',
        category: 'equipment'
      },
      '配管工事': {
        primarySkills: ['technical_skills', 'safety_awareness', 'work_quality', 'problem_solving'],
        chartType: 'radar',
        colors: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
        displayName: '配管工事',
        category: 'equipment'
      },

      // 仕上げ系
      '内装仕上げ': {
        primarySkills: ['technical_skills', 'work_quality', 'creativity', 'efficiency'],
        chartType: 'radar',
        colors: ['#3b82f6', '#10b981', '#ec4899', '#f59e0b'],
        displayName: '内装仕上げ',
        category: 'finishing'
      },
      '塗装': {
        primarySkills: ['technical_skills', 'work_quality', 'attention_to_detail', 'efficiency'],
        chartType: 'radar',
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
        displayName: '塗装',
        category: 'finishing'
      },

      // 管理系
      '施工管理': {
        primarySkills: ['leadership', 'communication', 'problem_solving', 'planning', 'safety_awareness'],
        chartType: 'radar',
        colors: ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
        displayName: '施工管理',
        category: 'management'
      },
      '品質管理': {
        primarySkills: ['attention_to_detail', 'analytical_skills', 'communication', 'technical_skills'],
        chartType: 'radar',
        colors: ['#8b5cf6', '#06b6d4', '#10b981', '#3b82f6'],
        displayName: '品質管理',
        category: 'management'
      },

      // デフォルト（職種未設定の場合）
      'default': {
        primarySkills: ['technical_skills', 'communication', 'teamwork', 'problem_solving', 'work_quality'],
        chartType: 'radar',
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
        displayName: '一般',
        category: 'general'
      }
    };

    // 評価項目の日本語ラベル
    this.skillLabels = {
      technical_skills: '技術力',
      communication: 'コミュニケーション',
      leadership: 'リーダーシップ',
      teamwork: 'チームワーク',
      problem_solving: '問題解決能力',
      safety_awareness: '安全意識',
      work_quality: '作業品質',
      efficiency: '効率性',
      creativity: '創造性',
      precision: '精密性',
      attention_to_detail: '細部への注意力',
      planning: '計画性',
      analytical_skills: '分析力',
      responsibility: '責任感'
    };

    // 評価項目の説明
    this.skillDescriptions = {
      technical_skills: '専門的な技術・知識の習熟度',
      communication: '効果的な意思疎通能力',
      leadership: 'チームを導く能力',
      teamwork: 'チーム内での協調性',
      problem_solving: '課題解決への取り組み',
      safety_awareness: '安全管理への意識',
      work_quality: '作業の正確性・品質',
      efficiency: '作業の効率性',
      creativity: '創意工夫する力',
      precision: '正確な作業能力',
      attention_to_detail: '細かい点への配慮',
      planning: '計画立案能力',
      analytical_skills: 'データ分析能力',
      responsibility: '責任を持つ姿勢'
    };
  }

  /**
   * 職種に応じた設定を取得
   * @param {string} jobTypeName - 職種名
   * @returns {Object} 職種別設定
   */
  getConfigForJobType(jobTypeName) {
    if (!jobTypeName || jobTypeName === '') {
      return this.jobTypeConfigs['default'];
    }

    // 完全一致を試みる
    if (this.jobTypeConfigs[jobTypeName]) {
      return this.jobTypeConfigs[jobTypeName];
    }

    // 部分一致を試みる
    const matchedKey = Object.keys(this.jobTypeConfigs).find(key =>
      jobTypeName.includes(key) || key.includes(jobTypeName)
    );

    if (matchedKey) {
      return this.jobTypeConfigs[matchedKey];
    }

    // デフォルト設定を返す
    return this.jobTypeConfigs['default'];
  }

  /**
   * 評価項目のラベルを取得
   * @param {string} skillKey - 評価項目キー
   * @returns {string} 日本語ラベル
   */
  getSkillLabel(skillKey) {
    return this.skillLabels[skillKey] || skillKey;
  }

  /**
   * 評価項目の説明を取得
   * @param {string} skillKey - 評価項目キー
   * @returns {string} 説明文
   */
  getSkillDescription(skillKey) {
    return this.skillDescriptions[skillKey] || '';
  }

  /**
   * 職種別のレーダーチャート設定を生成
   * @param {string} jobTypeName - 職種名
   * @param {Object} evaluationData - 評価データ
   * @returns {Object} Chart.js用設定オブジェクト
   */
  generateRadarChartConfig(jobTypeName, evaluationData) {
    const config = this.getConfigForJobType(jobTypeName);
    const labels = config.primarySkills.map(skill => this.getSkillLabel(skill));
    const data = config.primarySkills.map(skill => evaluationData[skill] || 0);

    return {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: config.displayName,
          data: data,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: config.colors[0],
          borderWidth: 2,
          pointBackgroundColor: config.colors[0],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: config.colors[0]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value;
              }
            },
            pointLabels: {
              font: {
                size: 12
              }
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
                return context.label + ': ' + context.parsed.r.toFixed(1);
              }
            }
          }
        }
      }
    };
  }

  /**
   * 職種別の棒グラフ設定を生成（比較用）
   * @param {string} jobTypeName - 職種名
   * @param {Object} currentData - 現在の評価データ
   * @param {Object} previousData - 前回の評価データ
   * @returns {Object} Chart.js用設定オブジェクト
   */
  generateBarChartConfig(jobTypeName, currentData, previousData = null) {
    const config = this.getConfigForJobType(jobTypeName);
    const labels = config.primarySkills.map(skill => this.getSkillLabel(skill));
    const currentValues = config.primarySkills.map(skill => currentData[skill] || 0);

    const datasets = [{
      label: '現在',
      data: currentValues,
      backgroundColor: config.colors[0] + '80',
      borderColor: config.colors[0],
      borderWidth: 1
    }];

    if (previousData) {
      const previousValues = config.primarySkills.map(skill => previousData[skill] || 0);
      datasets.push({
        label: '前回',
        data: previousValues,
        backgroundColor: '#94a3b8' + '80',
        borderColor: '#94a3b8',
        borderWidth: 1
      });
    }

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: previousData !== null,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(1);
              }
            }
          }
        }
      }
    };
  }

  /**
   * 全職種のリストを取得
   * @returns {Array} 職種名のリスト
   */
  getAllJobTypes() {
    return Object.keys(this.jobTypeConfigs).filter(key => key !== 'default');
  }

  /**
   * カテゴリ別に職種を取得
   * @param {string} category - カテゴリ名
   * @returns {Array} 職種名のリスト
   */
  getJobTypesByCategory(category) {
    return Object.entries(this.jobTypeConfigs)
      .filter(([key, config]) => config.category === category && key !== 'default')
      .map(([key, config]) => ({
        name: key,
        displayName: config.displayName
      }));
  }
}

// シングルトンインスタンスをエクスポート
export const jobTypeChartConfig = new JobTypeChartConfig();
