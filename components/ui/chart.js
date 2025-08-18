/**
 * Base Chart Class
 * チャート基底クラス
 */
export class BaseChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = null;
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      ...options
    };
    
    this.data = {
      labels: [],
      datasets: []
    };
  }

  /**
   * Check if Chart.js is available
   * Chart.jsが利用可能かチェック
   */
  static isChartJSAvailable() {
    return typeof Chart !== 'undefined';
  }

  /**
   * Initialize chart
   * チャートを初期化
   */
  init(type = 'line') {
    if (!BaseChart.isChartJSAvailable()) {
      console.warn('Chart.js is not available');
      this.renderFallback();
      return false;
    }

    try {
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(this.ctx, {
        type: type,
        data: this.data,
        options: this.options
      });

      return true;
    } catch (error) {
      console.error('Chart initialization failed:', error);
      this.renderFallback();
      return false;
    }
  }

  /**
   * Update chart data
   * チャートデータを更新
   */
  updateData(newData) {
    if (!this.chart) {
      console.warn('Chart not initialized');
      return;
    }

    this.data = { ...this.data, ...newData };
    this.chart.data = this.data;
    this.chart.update();
  }

  /**
   * Update chart options
   * チャートオプションを更新
   */
  updateOptions(newOptions) {
    if (!this.chart) {
      console.warn('Chart not initialized');
      return;
    }

    this.options = { ...this.options, ...newOptions };
    this.chart.options = this.options;
    this.chart.update();
  }

  /**
   * Render fallback when Chart.js is not available
   * Chart.jsが利用できない場合のフォールバック表示
   */
  renderFallback() {
    const container = this.canvas.parentElement;
    if (!container) return;

    container.innerHTML = `
      <div class="chart-fallback d-flex align-items-center justify-content-center h-100 p-4">
        <div class="text-center">
          <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">チャートを表示できません</h5>
          <p class="text-muted mb-0">Chart.jsライブラリの読み込みに失敗しました</p>
          <button class="btn btn-outline-primary btn-sm mt-2" onclick="location.reload()">
            <i class="fas fa-redo me-1"></i>再読み込み
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Destroy chart
   * チャートを破棄
   */
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  /**
   * Export chart as image
   * チャートを画像としてエクスポート
   */
  exportAsImage(format = 'png') {
    if (!this.chart) {
      console.warn('Chart not initialized');
      return null;
    }

    try {
      return this.chart.toBase64Image(format);
    } catch (error) {
      console.error('Chart export failed:', error);
      return null;
    }
  }

  /**
   * Resize chart
   * チャートをリサイズ
   */
  resize() {
    if (this.chart) {
      this.chart.resize();
    }
  }
}

/**
 * Line Chart Class
 * 線グラフクラス
 */
export class LineChart extends BaseChart {
  constructor(canvas, options = {}) {
    const lineOptions = {
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      elements: {
        line: {
          tension: 0.3
        },
        point: {
          radius: 4,
          hoverRadius: 6
        }
      },
      ...options
    };

    super(canvas, lineOptions);
  }

  init() {
    return super.init('line');
  }
}

/**
 * Bar Chart Class
 * 棒グラフクラス
 */
export class BarChart extends BaseChart {
  constructor(canvas, options = {}) {
    const barOptions = {
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      ...options
    };

    super(canvas, barOptions);
  }

  init() {
    return super.init('bar');
  }
}

/**
 * Radar Chart Class
 * レーダーチャートクラス
 */
export class RadarChart extends BaseChart {
  constructor(canvas, options = {}) {
    const radarOptions = {
      scales: {
        r: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          pointLabels: {
            font: {
              size: 12
            }
          }
        }
      },
      elements: {
        line: {
          borderWidth: 2
        },
        point: {
          borderWidth: 2,
          radius: 4,
          hoverRadius: 6
        }
      },
      ...options
    };

    super(canvas, radarOptions);
  }

  init() {
    return super.init('radar');
  }
}

/**
 * Pie Chart Class
 * 円グラフクラス
 */
export class PieChart extends BaseChart {
  constructor(canvas, options = {}) {
    const pieOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      ...options
    };

    super(canvas, pieOptions);
  }

  init() {
    return super.init('pie');
  }
}

/**
 * Doughnut Chart Class
 * ドーナツグラフクラス
 */
export class DoughnutChart extends BaseChart {
  constructor(canvas, options = {}) {
    const doughnutOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%',
      ...options
    };

    super(canvas, doughnutOptions);
  }

  init() {
    return super.init('doughnut');
  }
}

/**
 * Chart Factory
 * チャートファクトリー
 */
export class ChartFactory {
  static create(type, canvas, options = {}) {
    switch (type.toLowerCase()) {
      case 'line':
        return new LineChart(canvas, options);
      case 'bar':
        return new BarChart(canvas, options);
      case 'radar':
        return new RadarChart(canvas, options);
      case 'pie':
        return new PieChart(canvas, options);
      case 'doughnut':
        return new DoughnutChart(canvas, options);
      default:
        console.warn(`Unsupported chart type: ${type}`);
        return new BaseChart(canvas, options);
    }
  }

  static isSupported(type) {
    const supportedTypes = ['line', 'bar', 'radar', 'pie', 'doughnut'];
    return supportedTypes.includes(type.toLowerCase());
  }
}

// グローバルに公開
window.BaseChart = BaseChart;
window.LineChart = LineChart;
window.BarChart = BarChart;
window.RadarChart = RadarChart;
window.PieChart = PieChart;
window.DoughnutChart = DoughnutChart;
window.ChartFactory = ChartFactory;
