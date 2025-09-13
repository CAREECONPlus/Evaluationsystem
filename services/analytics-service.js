/**
 * Analytics Service - Advanced Statistical Calculations
 * 分析サービス - 高度な統計計算
 */

export class AnalyticsService {
  constructor(app) {
    this.app = app;
  }

  /**
   * 完全な部門統計分析
   */
  async analyzeDepartmentPerformance(evaluations, organizationData) {
    try {
      const departmentStats = {};
      
      // 完了した評価のみを対象
      const completedEvaluations = evaluations.filter(e => 
        e.status === 'completed' && e.ratings && Object.keys(e.ratings).length > 0
      );

      // 部門ごとに分析
      for (const evaluation of completedEvaluations) {
        const userDepartment = evaluation.targetUserDepartment || '未配属';
        
        if (!departmentStats[userDepartment]) {
          departmentStats[userDepartment] = {
            name: userDepartment,
            totalEmployees: 0,
            completedEvaluations: 0,
            averageScore: 0,
            skillBreakdown: {},
            performanceDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
            trendData: [],
            participationRate: 0
          };
        }

        const deptStats = departmentStats[userDepartment];
        deptStats.completedEvaluations++;
        
        // スキル別スコア集計
        let totalScore = 0;
        let skillCount = 0;
        
        Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
          if (!deptStats.skillBreakdown[skill]) {
            deptStats.skillBreakdown[skill] = { total: 0, count: 0, average: 0 };
          }
          
          deptStats.skillBreakdown[skill].total += rating;
          deptStats.skillBreakdown[skill].count++;
          deptStats.skillBreakdown[skill].average = 
            deptStats.skillBreakdown[skill].total / deptStats.skillBreakdown[skill].count;
          
          totalScore += rating;
          skillCount++;
        });

        // 平均スコア計算
        const evaluationAverage = skillCount > 0 ? totalScore / skillCount : 0;
        deptStats.averageScore = 
          ((deptStats.averageScore * (deptStats.completedEvaluations - 1)) + evaluationAverage) 
          / deptStats.completedEvaluations;

        // パフォーマンス分布
        if (evaluationAverage >= 4.5) deptStats.performanceDistribution.excellent++;
        else if (evaluationAverage >= 3.5) deptStats.performanceDistribution.good++;
        else if (evaluationAverage >= 2.5) deptStats.performanceDistribution.average++;
        else deptStats.performanceDistribution.poor++;
      }

      // 部門の総従業員数を計算（organizationDataから取得可能な場合）
      await this.calculateDepartmentEmployeeCounts(departmentStats, organizationData);

      return departmentStats;
    } catch (error) {
      console.error('Analytics: Error in department performance analysis:', error);
      return {};
    }
  }

  /**
   * 時系列トレンド分析
   */
  async analyzePerformanceTrends(evaluations, timeRange = '6months') {
    try {
      const trendData = [];
      const currentDate = new Date();
      
      // 期間設定
      let months = 6;
      switch (timeRange) {
        case '3months': months = 3; break;
        case '12months': months = 12; break;
        case 'thisyear': 
          months = currentDate.getMonth() + 1; 
          break;
      }

      // 月別データ構造を初期化
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        trendData.push({
          period: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
          averageScore: 0,
          completedEvaluations: 0,
          participationRate: 0,
          skillTrends: {}
        });
      }

      // 完了した評価を月別に分類
      const completedEvaluations = evaluations.filter(e => 
        e.status === 'completed' && e.completedAt && e.ratings
      );

      completedEvaluations.forEach(evaluation => {
        const completedDate = evaluation.completedAt.toDate ? 
          evaluation.completedAt.toDate() : new Date(evaluation.completedAt);
        
        const monthKey = `${completedDate.getFullYear()}/${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
        const trendPoint = trendData.find(t => t.period === monthKey);
        
        if (trendPoint) {
          trendPoint.completedEvaluations++;
          
          // スコア集計
          let totalScore = 0;
          let skillCount = 0;
          
          Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
            if (!trendPoint.skillTrends[skill]) {
              trendPoint.skillTrends[skill] = { total: 0, count: 0 };
            }
            
            trendPoint.skillTrends[skill].total += rating;
            trendPoint.skillTrends[skill].count++;
            totalScore += rating;
            skillCount++;
          });
          
          const evaluationAverage = skillCount > 0 ? totalScore / skillCount : 0;
          trendPoint.averageScore = 
            ((trendPoint.averageScore * (trendPoint.completedEvaluations - 1)) + evaluationAverage) 
            / trendPoint.completedEvaluations;
        }
      });

      // スキル別平均を計算
      trendData.forEach(trendPoint => {
        Object.keys(trendPoint.skillTrends).forEach(skill => {
          const skillData = trendPoint.skillTrends[skill];
          skillData.average = skillData.count > 0 ? skillData.total / skillData.count : 0;
        });
      });

      return trendData;
    } catch (error) {
      console.error('Analytics: Error in trend analysis:', error);
      return [];
    }
  }

  /**
   * 詳細スキル分析
   */
  async analyzeDetailedSkills(evaluations, categories = null) {
    try {
      const skillAnalysis = {
        overallMetrics: {
          totalEvaluations: 0,
          averageScore: 0,
          standardDeviation: 0,
          skillCount: 0
        },
        skillCategories: {},
        correlationMatrix: {},
        improvementRecommendations: [],
        strengthAreas: []
      };

      const completedEvaluations = evaluations.filter(e => 
        e.status === 'completed' && e.ratings && Object.keys(e.ratings).length > 0
      );

      if (completedEvaluations.length === 0) {
        return skillAnalysis;
      }

      // 全スキルデータを収集
      const allSkillScores = {};
      const allScores = [];

      completedEvaluations.forEach(evaluation => {
        Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
          if (!allSkillScores[skill]) {
            allSkillScores[skill] = [];
          }
          allSkillScores[skill].push(rating);
          allScores.push(rating);
        });
      });

      // 基本統計
      skillAnalysis.overallMetrics.totalEvaluations = completedEvaluations.length;
      skillAnalysis.overallMetrics.averageScore = this.calculateMean(allScores);
      skillAnalysis.overallMetrics.standardDeviation = this.calculateStandardDeviation(allScores);
      skillAnalysis.overallMetrics.skillCount = Object.keys(allSkillScores).length;

      // スキル別詳細分析
      Object.entries(allSkillScores).forEach(([skill, scores]) => {
        const category = this.categorizeSkill(skill, categories);
        
        if (!skillAnalysis.skillCategories[category]) {
          skillAnalysis.skillCategories[category] = {
            name: category,
            skills: {},
            categoryAverage: 0,
            skillCount: 0
          };
        }

        const skillStats = {
          name: skill,
          scores: scores,
          average: this.calculateMean(scores),
          median: this.calculateMedian(scores),
          standardDeviation: this.calculateStandardDeviation(scores),
          min: Math.min(...scores),
          max: Math.max(...scores),
          distribution: this.calculateDistribution(scores),
          improvementPotential: this.calculateImprovementPotential(scores),
          consistency: this.calculateConsistency(scores)
        };

        skillAnalysis.skillCategories[category].skills[skill] = skillStats;
        skillAnalysis.skillCategories[category].skillCount++;
      });

      // カテゴリ平均を計算
      Object.values(skillAnalysis.skillCategories).forEach(category => {
        const skillAverages = Object.values(category.skills).map(s => s.average);
        category.categoryAverage = this.calculateMean(skillAverages);
      });

      // 改善推奨事項を生成
      skillAnalysis.improvementRecommendations = this.generateImprovementRecommendations(skillAnalysis);
      skillAnalysis.strengthAreas = this.identifyStrengthAreas(skillAnalysis);

      // 相関分析
      skillAnalysis.correlationMatrix = this.calculateCorrelationMatrix(allSkillScores);

      return skillAnalysis;
    } catch (error) {
      console.error('Analytics: Error in detailed skills analysis:', error);
      return { overallMetrics: {}, skillCategories: {}, correlationMatrix: {} };
    }
  }

  /**
   * ベンチマーク比較分析
   */
  async analyzeBenchmarkComparison(evaluations, benchmarkData) {
    try {
      const comparison = {
        overallComparison: { current: 0, benchmark: 0, difference: 0, performance: 'average' },
        skillComparisons: {},
        departmentComparisons: {},
        recommendedActions: []
      };

      const completedEvaluations = evaluations.filter(e => 
        e.status === 'completed' && e.ratings
      );

      if (completedEvaluations.length === 0 || !benchmarkData || benchmarkData.length === 0) {
        return comparison;
      }

      // ベンチマークデータをマップに変換
      const benchmarkMap = {};
      benchmarkData.forEach(benchmark => {
        benchmarkMap[benchmark.type || benchmark.name] = benchmark.value || 3.0;
      });

      // 全体比較
      const allScores = [];
      completedEvaluations.forEach(evaluation => {
        const scores = Object.values(evaluation.ratings);
        allScores.push(...scores);
      });

      const currentAverage = this.calculateMean(allScores);
      const overallBenchmark = benchmarkMap['general'] || 3.0;
      
      comparison.overallComparison = {
        current: parseFloat(currentAverage.toFixed(2)),
        benchmark: overallBenchmark,
        difference: parseFloat((currentAverage - overallBenchmark).toFixed(2)),
        performance: this.classifyPerformance(currentAverage, overallBenchmark)
      };

      // スキル別比較
      const skillAverages = this.calculateSkillAverages(completedEvaluations);
      
      Object.entries(skillAverages).forEach(([skill, average]) => {
        const skillType = this.mapSkillToBenchmarkType(skill);
        const benchmark = benchmarkMap[skillType] || benchmarkMap['general'] || 3.0;
        
        comparison.skillComparisons[skill] = {
          current: parseFloat(average.toFixed(2)),
          benchmark: benchmark,
          difference: parseFloat((average - benchmark).toFixed(2)),
          performance: this.classifyPerformance(average, benchmark),
          priority: this.calculateImprovementPriority(average, benchmark)
        };
      });

      // 改善推奨アクションを生成
      comparison.recommendedActions = this.generateBenchmarkRecommendations(comparison);

      return comparison;
    } catch (error) {
      console.error('Analytics: Error in benchmark comparison:', error);
      return { overallComparison: {}, skillComparisons: {}, recommendedActions: [] };
    }
  }

  // ===== ユーティリティメソッド =====

  calculateMean(values) {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateMedian(values) {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  calculateStandardDeviation(values) {
    if (!values || values.length === 0) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = this.calculateMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  calculateDistribution(values) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    values.forEach(val => {
      const rounded = Math.round(val);
      if (distribution[rounded] !== undefined) {
        distribution[rounded]++;
      }
    });
    return distribution;
  }

  calculateImprovementPotential(scores) {
    const average = this.calculateMean(scores);
    const maxPossible = 5.0;
    return Math.max(0, maxPossible - average);
  }

  calculateConsistency(scores) {
    const stdDev = this.calculateStandardDeviation(scores);
    // 一貫性は標準偏差の逆数（低いほど一貫性が高い）
    return Math.max(0, 5 - stdDev * 2);
  }

  categorizeSkill(skill, categories) {
    // デフォルトのカテゴリマッピング
    const defaultCategories = {
      'communication': ['コミュニケーション', '報告', '連絡', '相談', '伝達'],
      'technical': ['技術', 'スキル', '専門', '知識', 'プログラミング'],
      'leadership': ['リーダー', '指導', '統率', '管理', 'マネジメント'],
      'teamwork': ['チーム', '協調', '協力', '連携', 'コラボレーション'],
      'problem_solving': ['問題解決', '課題', '分析', '改善', '解決']
    };

    if (categories) {
      // カスタムカテゴリが提供されている場合
      for (const [categoryName, categoryData] of Object.entries(categories)) {
        if (categoryData.skills && categoryData.skills.includes(skill)) {
          return categoryName;
        }
      }
    }

    // デフォルトのカテゴリマッピング
    for (const [category, keywords] of Object.entries(defaultCategories)) {
      if (keywords.some(keyword => skill.includes(keyword))) {
        return category;
      }
    }

    return 'その他';
  }

  calculateSkillAverages(evaluations) {
    const skillTotals = {};
    const skillCounts = {};

    evaluations.forEach(evaluation => {
      Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
        if (!skillTotals[skill]) {
          skillTotals[skill] = 0;
          skillCounts[skill] = 0;
        }
        skillTotals[skill] += rating;
        skillCounts[skill]++;
      });
    });

    const averages = {};
    Object.keys(skillTotals).forEach(skill => {
      averages[skill] = skillTotals[skill] / skillCounts[skill];
    });

    return averages;
  }

  classifyPerformance(current, benchmark) {
    const difference = current - benchmark;
    if (difference >= 0.5) return 'excellent';
    if (difference >= 0.2) return 'good';
    if (difference >= -0.2) return 'average';
    if (difference >= -0.5) return 'below_average';
    return 'poor';
  }

  mapSkillToBenchmarkType(skill) {
    const mapping = {
      'technical': ['技術', 'スキル', '専門'],
      'communication': ['コミュニケーション', '報告', '連絡'],
      'leadership': ['リーダー', '指導', '管理'],
      'problem_solving': ['問題解決', '課題', '分析']
    };

    for (const [type, keywords] of Object.entries(mapping)) {
      if (keywords.some(keyword => skill.includes(keyword))) {
        return type;
      }
    }

    return 'general';
  }

  calculateImprovementPriority(current, benchmark) {
    const gap = benchmark - current;
    if (gap >= 1.0) return 'high';
    if (gap >= 0.5) return 'medium';
    if (gap >= 0.2) return 'low';
    return 'none';
  }

  generateImprovementRecommendations(skillAnalysis) {
    const recommendations = [];
    
    Object.values(skillAnalysis.skillCategories).forEach(category => {
      Object.values(category.skills).forEach(skill => {
        if (skill.average < 3.0 && skill.improvementPotential > 1.0) {
          recommendations.push({
            skill: skill.name,
            category: category.name,
            currentScore: skill.average,
            improvementPotential: skill.improvementPotential,
            priority: skill.average < 2.5 ? 'high' : 'medium',
            suggestion: this.generateSkillImprovement(skill.name, skill.average)
          });
        }
      });
    });

    return recommendations.sort((a, b) => b.improvementPotential - a.improvementPotential);
  }

  generateSkillImprovement(skillName, currentScore) {
    // スキル固有の改善提案を生成
    const suggestions = {
      'コミュニケーション': '定期的な1on1ミーティングの実施と積極的な意見交換を推奨',
      '技術力': '技術研修への参加と実践的なプロジェクトでのスキル向上を推奨',
      'リーダーシップ': 'プロジェクトリーダーの経験とメンタリング研修を推奨'
    };

    return suggestions[skillName] || '継続的な学習と実践を通じた改善を推奨';
  }

  identifyStrengthAreas(skillAnalysis) {
    const strengths = [];
    
    Object.values(skillAnalysis.skillCategories).forEach(category => {
      Object.values(category.skills).forEach(skill => {
        if (skill.average >= 4.0 && skill.consistency >= 3.5) {
          strengths.push({
            skill: skill.name,
            category: category.name,
            score: skill.average,
            consistency: skill.consistency
          });
        }
      });
    });

    return strengths.sort((a, b) => b.score - a.score);
  }

  calculateCorrelationMatrix(skillScores) {
    const skills = Object.keys(skillScores);
    const correlations = {};

    skills.forEach(skill1 => {
      correlations[skill1] = {};
      skills.forEach(skill2 => {
        if (skill1 !== skill2) {
          correlations[skill1][skill2] = this.calculateCorrelation(
            skillScores[skill1], 
            skillScores[skill2]
          );
        }
      });
    });

    return correlations;
  }

  calculateCorrelation(values1, values2) {
    const n = Math.min(values1.length, values2.length);
    if (n === 0) return 0;

    const mean1 = this.calculateMean(values1);
    const mean2 = this.calculateMean(values2);

    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  generateBenchmarkRecommendations(comparison) {
    const recommendations = [];
    
    Object.entries(comparison.skillComparisons).forEach(([skill, data]) => {
      if (data.priority === 'high') {
        recommendations.push({
          type: 'skill_improvement',
          skill: skill,
          message: `${skill}のスコア向上が急務です（現在: ${data.current}, 目標: ${data.benchmark}）`,
          priority: 'high'
        });
      }
    });

    if (comparison.overallComparison.performance === 'poor') {
      recommendations.push({
        type: 'overall_improvement',
        message: '全体的なパフォーマンス向上のための包括的な改善計画が必要です',
        priority: 'critical'
      });
    }

    return recommendations;
  }

  /**
   * 作業員統計の計算 - report.jsで使用
   */
  async calculateWorkerStatistics(evaluations) {
    try {
      const stats = {
        totalWorkers: 0,
        completedEvaluations: 0,
        averageScore: 0,
        skillBreakdown: {},
        departmentStats: {},
        performanceDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
        participationRate: 0
      };

      // 完了した評価のみを対象
      const completedEvaluations = evaluations.filter(e =>
        e.status === 'completed' && e.ratings && Object.keys(e.ratings).length > 0
      );

      if (completedEvaluations.length === 0) {
        return stats;
      }

      stats.completedEvaluations = completedEvaluations.length;

      // ユニークワーカーの計算
      const uniqueWorkers = new Set(completedEvaluations.map(e => e.targetUserId));
      stats.totalWorkers = uniqueWorkers.size;

      // 全スコアを収集
      const allScores = [];
      const skillTotals = {};
      const skillCounts = {};
      const departments = {};

      completedEvaluations.forEach(evaluation => {
        const department = evaluation.targetUserDepartment || '未配属';

        // 部門統計
        if (!departments[department]) {
          departments[department] = {
            count: 0,
            totalScore: 0,
            averageScore: 0
          };
        }
        departments[department].count++;

        // スキル別集計
        let evaluationScore = 0;
        let skillCount = 0;

        Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
          if (!skillTotals[skill]) {
            skillTotals[skill] = 0;
            skillCounts[skill] = 0;
          }
          skillTotals[skill] += rating;
          skillCounts[skill]++;
          evaluationScore += rating;
          skillCount++;
          allScores.push(rating);
        });

        const avgScore = skillCount > 0 ? evaluationScore / skillCount : 0;
        departments[department].totalScore += avgScore;

        // パフォーマンス分布
        if (avgScore >= 4.5) stats.performanceDistribution.excellent++;
        else if (avgScore >= 3.5) stats.performanceDistribution.good++;
        else if (avgScore >= 2.5) stats.performanceDistribution.average++;
        else stats.performanceDistribution.poor++;
      });

      // 平均スコア計算
      stats.averageScore = allScores.length > 0 ?
        parseFloat((allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(2)) : 0;

      // スキル別平均
      Object.keys(skillTotals).forEach(skill => {
        stats.skillBreakdown[skill] = {
          average: parseFloat((skillTotals[skill] / skillCounts[skill]).toFixed(2)),
          count: skillCounts[skill]
        };
      });

      // 部門別平均
      Object.keys(departments).forEach(dept => {
        departments[dept].averageScore = departments[dept].count > 0 ?
          parseFloat((departments[dept].totalScore / departments[dept].count).toFixed(2)) : 0;
      });
      stats.departmentStats = departments;

      // 参加率（仮定: 全従業員数が分からないため、完了評価数 / ユニークワーカー数）
      stats.participationRate = stats.totalWorkers > 0 ?
        parseFloat(((stats.completedEvaluations / stats.totalWorkers) * 100).toFixed(1)) : 0;

      return stats;
    } catch (error) {
      console.error('Analytics: Error calculating worker statistics:', error);
      return {
        totalWorkers: 0,
        completedEvaluations: 0,
        averageScore: 0,
        skillBreakdown: {},
        departmentStats: {},
        performanceDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
        participationRate: 0
      };
    }
  }

  /**
   * トレンドデータの分析 - report.jsで使用
   */
  async analyzeTrendData(evaluations, timeRange = '6months') {
    try {
      const trendAnalysis = {
        periods: [],
        overallTrend: 'stable',
        growthRate: 0,
        insights: [],
        recommendations: []
      };

      // 期間設定
      const currentDate = new Date();
      let months = 6;
      switch (timeRange) {
        case '3months': months = 3; break;
        case '12months': months = 12; break;
        case 'thisyear': months = currentDate.getMonth() + 1; break;
      }

      // 完了した評価をフィルター
      const completedEvaluations = evaluations.filter(e =>
        e.status === 'completed' && e.completedAt && e.ratings
      );

      if (completedEvaluations.length === 0) {
        return trendAnalysis;
      }

      // 月別データ構造を初期化
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        trendAnalysis.periods.push({
          period: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          averageScore: 0,
          completedCount: 0,
          workerCount: 0,
          skillTrends: {}
        });
      }

      // 評価を月別に分類して統計を計算
      completedEvaluations.forEach(evaluation => {
        const completedDate = evaluation.completedAt.toDate ?
          evaluation.completedAt.toDate() : new Date(evaluation.completedAt);

        const monthKey = `${completedDate.getFullYear()}/${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
        const period = trendAnalysis.periods.find(p => p.period === monthKey);

        if (period) {
          period.completedCount++;

          // スコア集計
          let totalScore = 0;
          let skillCount = 0;

          Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
            if (!period.skillTrends[skill]) {
              period.skillTrends[skill] = { total: 0, count: 0, average: 0 };
            }

            period.skillTrends[skill].total += rating;
            period.skillTrends[skill].count++;
            totalScore += rating;
            skillCount++;
          });

          // 期間内の平均スコアを更新
          const evaluationAverage = skillCount > 0 ? totalScore / skillCount : 0;
          period.averageScore = period.completedCount === 1 ?
            evaluationAverage :
            ((period.averageScore * (period.completedCount - 1)) + evaluationAverage) / period.completedCount;
        }
      });

      // スキル別平均を計算
      trendAnalysis.periods.forEach(period => {
        Object.keys(period.skillTrends).forEach(skill => {
          const skillData = period.skillTrends[skill];
          skillData.average = skillData.count > 0 ?
            parseFloat((skillData.total / skillData.count).toFixed(2)) : 0;
        });

        // ユニークワーカー数の計算（近似）
        period.workerCount = Math.ceil(period.completedCount * 0.8); // 仮定値
        period.averageScore = parseFloat(period.averageScore.toFixed(2));
      });

      // トレンド分析
      const validPeriods = trendAnalysis.periods.filter(p => p.completedCount > 0);
      if (validPeriods.length >= 2) {
        const firstPeriod = validPeriods[0];
        const lastPeriod = validPeriods[validPeriods.length - 1];

        trendAnalysis.growthRate = firstPeriod.averageScore > 0 ?
          parseFloat((((lastPeriod.averageScore - firstPeriod.averageScore) / firstPeriod.averageScore) * 100).toFixed(1)) : 0;

        if (trendAnalysis.growthRate > 5) trendAnalysis.overallTrend = 'improving';
        else if (trendAnalysis.growthRate < -5) trendAnalysis.overallTrend = 'declining';
        else trendAnalysis.overallTrend = 'stable';

        // インサイト生成
        if (trendAnalysis.overallTrend === 'improving') {
          trendAnalysis.insights.push('パフォーマンスが継続的に改善しています');
        } else if (trendAnalysis.overallTrend === 'declining') {
          trendAnalysis.insights.push('パフォーマンスの低下傾向が見られます');
          trendAnalysis.recommendations.push('改善施策の検討が必要です');
        }
      }

      return trendAnalysis;
    } catch (error) {
      console.error('Analytics: Error analyzing trend data:', error);
      return {
        periods: [],
        overallTrend: 'stable',
        growthRate: 0,
        insights: [],
        recommendations: []
      };
    }
  }

  /**
   * 個人トレンド分析 - report.jsで使用
   */
  async calculatePersonalTrends(evaluations, userId, timeRange = '6months') {
    try {
      const personalTrends = {
        userId: userId,
        timeRange: timeRange,
        periods: [],
        overallTrend: 'stable',
        skillTrends: {},
        improvements: [],
        recommendations: []
      };

      // ユーザーの評価をフィルター
      const userEvaluations = evaluations.filter(e =>
        (e.targetUserId === userId || e.evaluatorId === userId) &&
        e.status === 'completed' &&
        e.ratings
      );

      if (userEvaluations.length === 0) {
        return personalTrends;
      }

      // 期間設定
      const currentDate = new Date();
      let months = 6;
      switch (timeRange) {
        case '3months': months = 3; break;
        case '12months': months = 12; break;
        case 'thisyear': months = currentDate.getMonth() + 1; break;
      }

      // 月別データ構造を初期化
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        personalTrends.periods.push({
          period: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          averageScore: 0,
          evaluationCount: 0,
          skills: {}
        });
      }

      // 評価を月別に分類
      userEvaluations.forEach(evaluation => {
        const completedDate = evaluation.completedAt?.toDate ?
          evaluation.completedAt.toDate() : new Date(evaluation.completedAt || evaluation.createdAt);

        const monthKey = `${completedDate.getFullYear()}/${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
        const period = personalTrends.periods.find(p => p.period === monthKey);

        if (period) {
          period.evaluationCount++;

          let totalScore = 0;
          let skillCount = 0;

          Object.entries(evaluation.ratings).forEach(([skill, rating]) => {
            if (!period.skills[skill]) {
              period.skills[skill] = { total: 0, count: 0, average: 0 };
            }
            period.skills[skill].total += rating;
            period.skills[skill].count++;

            totalScore += rating;
            skillCount++;
          });

          // 期間平均スコア更新
          const evaluationAverage = skillCount > 0 ? totalScore / skillCount : 0;
          period.averageScore = period.evaluationCount === 1 ?
            evaluationAverage :
            ((period.averageScore * (period.evaluationCount - 1)) + evaluationAverage) / period.evaluationCount;
        }
      });

      // スキル別平均を計算
      personalTrends.periods.forEach(period => {
        Object.keys(period.skills).forEach(skill => {
          const skillData = period.skills[skill];
          skillData.average = skillData.count > 0 ?
            parseFloat((skillData.total / skillData.count).toFixed(2)) : 0;
        });
        period.averageScore = parseFloat(period.averageScore.toFixed(2));
      });

      // 全体的なスキルトレンドを計算
      const allSkills = new Set();
      personalTrends.periods.forEach(period => {
        Object.keys(period.skills).forEach(skill => allSkills.add(skill));
      });

      allSkills.forEach(skill => {
        const skillScores = personalTrends.periods
          .filter(p => p.skills[skill] && p.skills[skill].count > 0)
          .map(p => p.skills[skill].average);

        if (skillScores.length >= 2) {
          const firstScore = skillScores[0];
          const lastScore = skillScores[skillScores.length - 1];
          const growthRate = firstScore > 0 ?
            ((lastScore - firstScore) / firstScore) * 100 : 0;

          personalTrends.skillTrends[skill] = {
            scores: skillScores,
            growthRate: parseFloat(growthRate.toFixed(1)),
            trend: growthRate > 5 ? 'improving' : growthRate < -5 ? 'declining' : 'stable',
            currentScore: lastScore,
            initialScore: firstScore
          };
        }
      });

      // 総合トレンド判定
      const validPeriods = personalTrends.periods.filter(p => p.evaluationCount > 0);
      if (validPeriods.length >= 2) {
        const firstPeriod = validPeriods[0];
        const lastPeriod = validPeriods[validPeriods.length - 1];
        const overallGrowth = firstPeriod.averageScore > 0 ?
          ((lastPeriod.averageScore - firstPeriod.averageScore) / firstPeriod.averageScore) * 100 : 0;

        personalTrends.overallTrend = overallGrowth > 5 ? 'improving' :
          overallGrowth < -5 ? 'declining' : 'stable';
      }

      return personalTrends;
    } catch (error) {
      console.error('Analytics: Error calculating personal trends:', error);
      return {
        userId: userId,
        timeRange: timeRange,
        periods: [],
        overallTrend: 'stable',
        skillTrends: {},
        improvements: [],
        recommendations: []
      };
    }
  }

  async calculateDepartmentEmployeeCounts(departmentStats, organizationData) {
    try {
      if (organizationData && organizationData.departments) {
        // 組織データから各部門の従業員数を取得
        const allUsers = await this.app.api.getUsers();

        Object.keys(departmentStats).forEach(deptName => {
          const deptUsers = allUsers.filter(user => user.department === deptName);
          departmentStats[deptName].totalEmployees = deptUsers.length;

          // 参加率を計算
          if (departmentStats[deptName].totalEmployees > 0) {
            departmentStats[deptName].participationRate =
              (departmentStats[deptName].completedEvaluations / departmentStats[deptName].totalEmployees) * 100;
          }
        });
      }
    } catch (error) {
      console.warn('Analytics: Could not calculate employee counts:', error);
    }
  }
}