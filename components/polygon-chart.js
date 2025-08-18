/**
 * Improved Polygon Chart Component
 * 改良版ポリゴンチャートコンポーネント
 */
class PolygonChart {
  constructor(canvas, options = {}) {
    if (!canvas || !canvas.getContext) {
      console.error('PolygonChart: Invalid canvas element provided');
      return;
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.options = {
      size: 300,
      levels: 5,
      maxValue: 5,
      strokeColor: "#333",
      fillColor: "rgba(54, 162, 235, 0.2)",
      pointColor: "#36A2EB",
      gridColor: "#ddd",
      labelColor: "#666",
      fontSize: 12,
      fontFamily: "'Noto Sans JP', sans-serif",
      lineWidth: 2,
      pointRadius: 4,
      labelPadding: 20,
      animationDuration: 1000,
      showValues: false,
      centerText: null,
      responsive: true,
      ...options,
    };

    this.data = [];
    this.labels = [];
    this.animationFrame = null;
    this.isAnimating = false;
    this.currentData = [];

    this.init();
  }

  /**
   * Initialize the chart
   * チャートを初期化
   */
  init() {
    try {
      this.setupCanvas();
      this.setupEventListeners();
      console.log('PolygonChart: Initialized successfully');
    } catch (error) {
      console.error('PolygonChart: Initialization failed', error);
    }
  }

  /**
   * Setup canvas dimensions and properties
   * キャンバスの寸法とプロパティを設定
   */
  setupCanvas() {
    const size = this.options.size;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    this.canvas.width = size * devicePixelRatio;
    this.canvas.height = size * devicePixelRatio;
    
    // Set display size (CSS pixels)
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    
    // Scale the context to ensure correct drawing operations
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Set canvas style for responsive design
    if (this.options.responsive) {
      this.canvas.style.maxWidth = "100%";
      this.canvas.style.height = "auto";
    }

    this.center = { x: size / 2, y: size / 2 };
    this.radius = (size / 2) * 0.7; // Reduced to make room for labels
    
    // Set canvas accessibility attributes
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'ポリゴンチャート');
  }

  /**
   * Setup event listeners
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // Resize handling
    if (this.options.responsive) {
      const resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      resizeObserver.observe(this.canvas.parentElement || this.canvas);
    }

    // Mouse interactions
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  /**
   * Handle resize events
   * リサイズイベントを処理
   */
  handleResize() {
    const container = this.canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const newSize = Math.min(containerWidth, this.options.size);
    
    if (newSize !== this.getCurrentSize()) {
      this.options.size = newSize;
      this.setupCanvas();
      this.render();
    }
  }

  /**
   * Get current canvas size
   * 現在のキャンバスサイズを取得
   */
  getCurrentSize() {
    return parseInt(this.canvas.style.width) || this.options.size;
  }

  /**
   * Handle mouse move events
   * マウス移動イベントを処理
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is over a data point
    const hoveredPoint = this.getPointAtPosition(x, y);
    if (hoveredPoint !== null) {
      this.canvas.style.cursor = 'pointer';
      this.showTooltip(hoveredPoint, x, y);
    } else {
      this.canvas.style.cursor = 'default';
      this.hideTooltip();
    }
  }

  /**
   * Handle mouse leave events
   * マウス離脱イベントを処理
   */
  handleMouseLeave() {
    this.canvas.style.cursor = 'default';
    this.hideTooltip();
  }

  /**
   * Handle click events
   * クリックイベントを処理
   */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedPoint = this.getPointAtPosition(x, y);
    if (clickedPoint !== null) {
      this.onPointClick(clickedPoint);
    }
  }

  /**
   * Get point at specific position
   * 特定の位置のポイントを取得
   */
  getPointAtPosition(x, y) {
    if (!this.data.length) return null;

    for (let i = 0; i < this.data.length; i++) {
      const point = this.getDataPointPosition(i);
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      
      if (distance <= this.options.pointRadius + 5) {
        return i;
      }
    }
    
    return null;
  }

  /**
   * Get data point position
   * データポイントの位置を取得
   */
  getDataPointPosition(index) {
    const value = Math.min(this.currentData[index] || 0, this.options.maxValue);
    const angle = (index * 2 * Math.PI) / this.data.length - Math.PI / 2;
    const dataRadius = (this.radius * value) / this.options.maxValue;
    
    return {
      x: this.center.x + Math.cos(angle) * dataRadius,
      y: this.center.y + Math.sin(angle) * dataRadius
    };
  }

  /**
   * Show tooltip
   * ツールチップを表示
   */
  showTooltip(pointIndex, x, y) {
    // Create or update tooltip
    let tooltip = document.getElementById('polygon-chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'polygon-chart-tooltip';
      tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      `;
      document.body.appendChild(tooltip);
    }

    const rect = this.canvas.getBoundingClientRect();
    const label = this.labels[pointIndex] || `項目 ${pointIndex + 1}`;
    const value = this.data[pointIndex] || 0;
    
    tooltip.innerHTML = `${label}: ${value}`;
    tooltip.style.left = `${rect.left + x + 10}px`;
    tooltip.style.top = `${rect.top + y - 30}px`;
    tooltip.style.display = 'block';
  }

  /**
   * Hide tooltip
   * ツールチップを非表示
   */
  hideTooltip() {
    const tooltip = document.getElementById('polygon-chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Handle point click
   * ポイントクリックを処理
   */
  onPointClick(pointIndex) {
    const event = new CustomEvent('polygonPointClick', {
      detail: {
        index: pointIndex,
        label: this.labels[pointIndex],
        value: this.data[pointIndex]
      }
    });
    this.canvas.dispatchEvent(event);
  }

  /**
   * Set chart data with validation
   * バリデーション付きでチャートデータを設定
   */
  setData(data, labels) {
    try {
      // Validate data
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('PolygonChart: Invalid data provided');
        return;
      }

      // Ensure all data values are numbers
      this.data = data.map(value => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : Math.max(0, num);
      });

      // Set labels
      this.labels = labels || this.data.map((_, index) => `項目 ${index + 1}`);

      // Ensure labels array matches data length
      while (this.labels.length < this.data.length) {
        this.labels.push(`項目 ${this.labels.length + 1}`);
      }

      // Initialize current data for animation
      this.currentData = new Array(this.data.length).fill(0);

      // Update accessibility
      this.updateAccessibility();

      // Render with animation
      this.animateToData();
      
    } catch (error) {
      console.error('PolygonChart: Error setting data', error);
    }
  }

  /**
   * Update accessibility attributes
   * アクセシビリティ属性を更新
   */
  updateAccessibility() {
    const description = this.labels.map((label, index) => 
      `${label}: ${this.data[index]}`
    ).join(', ');
    
    this.canvas.setAttribute('aria-label', `ポリゴンチャート: ${description}`);
  }

  /**
   * Animate to new data
   * 新しいデータにアニメーション
   */
  animateToData() {
    if (this.isAnimating) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.isAnimating = true;
    const startTime = performance.now();
    const startData = [...this.currentData];
    const targetData = [...this.data];

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.options.animationDuration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate data
      this.currentData = startData.map((start, index) => {
        const target = targetData[index];
        return start + (target - start) * eased;
      });

      this.render();

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.currentData = [...targetData];
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Render the complete chart
   * 完全なチャートをレンダリング
   */
  render() {
    try {
      this.clear();
      this.drawGrid();
      this.drawLabels();
      this.drawData();
      this.drawCenterText();
    } catch (error) {
      console.error('PolygonChart: Render error', error);
    }
  }

  /**
   * Clear the canvas
   * キャンバスをクリア
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw grid lines and background
   * グリッド線と背景を描画
   */
  drawGrid() {
    const { levels, gridColor } = this.options;
    const { center, radius } = this;

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    // Draw concentric polygons
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius * level) / levels;
      this.drawPolygon(center, levelRadius, this.data.length);
    }

    // Draw radial lines
    for (let i = 0; i < this.data.length; i++) {
      const angle = (i * 2 * Math.PI) / this.data.length - Math.PI / 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;

      this.ctx.beginPath();
      this.ctx.moveTo(center.x, center.y);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }

    // Draw level indicators
    this.drawLevelIndicators();
  }

  /**
   * Draw level indicators
   * レベルインジケーターを描画
   */
  drawLevelIndicators() {
    const { levels, fontSize, fontFamily, labelColor } = this.options;
    
    this.ctx.fillStyle = labelColor;
    this.ctx.font = `${fontSize - 2}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (let level = 1; level <= levels; level++) {
      const value = (this.options.maxValue * level) / levels;
      const levelRadius = (this.radius * level) / levels;
      
      // Position indicator at the top
      const x = this.center.x;
      const y = this.center.y - levelRadius;
      
      this.ctx.fillText(value.toFixed(1), x, y - 5);
    }
  }

  /**
   * Draw a polygon
   * ポリゴンを描画
   */
  drawPolygon(center, radius, sides) {
    if (sides < 3) return;

    this.ctx.beginPath();

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.closePath();
    this.ctx.stroke();
  }

  /**
   * Draw labels around the chart
   * チャートの周りにラベルを描画
   */
  drawLabels() {
    const { center, radius } = this;
    const { labelColor, fontSize, fontFamily, labelPadding } = this.options;

    this.ctx.fillStyle = labelColor;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (let i = 0; i < this.labels.length; i++) {
      const angle = (i * 2 * Math.PI) / this.labels.length - Math.PI / 2;
      const labelRadius = radius + labelPadding;
      const x = center.x + Math.cos(angle) * labelRadius;
      const y = center.y + Math.sin(angle) * labelRadius;

      // Adjust text alignment based on position
      this.adjustTextAlignment(angle);
      
      this.ctx.fillText(this.labels[i], x, y);
    }
  }

  /**
   * Adjust text alignment based on angle
   * 角度に基づいてテキスト配置を調整
   */
  adjustTextAlignment(angle) {
    const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
    
    if (normalizedAngle > Math.PI * 0.25 && normalizedAngle < Math.PI * 0.75) {
      this.ctx.textAlign = "left";
    } else if (normalizedAngle > Math.PI * 1.25 && normalizedAngle < Math.PI * 1.75) {
      this.ctx.textAlign = "right";
    } else {
      this.ctx.textAlign = "center";
    }
    
    if (normalizedAngle > Math.PI * 0.75 && normalizedAngle < Math.PI * 1.25) {
      this.ctx.textBaseline = "top";
    } else if (normalizedAngle < Math.PI * 0.25 || normalizedAngle > Math.PI * 1.75) {
      this.ctx.textBaseline = "bottom";
    } else {
      this.ctx.textBaseline = "middle";
    }
  }

  /**
   * Draw the data polygon and points
   * データポリゴンとポイントを描画
   */
  drawData() {
    if (this.currentData.length === 0) return;

    const { center, radius } = this;
    const { maxValue, fillColor, strokeColor, pointColor, lineWidth, pointRadius, showValues } = this.options;

    // Draw filled area
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = lineWidth;

    this.ctx.beginPath();

    for (let i = 0; i < this.currentData.length; i++) {
      const value = Math.min(this.currentData[i], maxValue);
      const angle = (i * 2 * Math.PI) / this.currentData.length - Math.PI / 2;
      const dataRadius = (radius * value) / maxValue;
      const x = center.x + Math.cos(angle) * dataRadius;
      const y = center.y + Math.sin(angle) * dataRadius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Draw data points
    this.ctx.fillStyle = pointColor;

    for (let i = 0; i < this.currentData.length; i++) {
      const value = Math.min(this.currentData[i], maxValue);
      const angle = (i * 2 * Math.PI) / this.currentData.length - Math.PI / 2;
      const dataRadius = (radius * value) / maxValue;
      const x = center.x + Math.cos(angle) * dataRadius;
      const y = center.y + Math.sin(angle) * dataRadius;

      this.ctx.beginPath();
      this.ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Draw values if enabled
      if (showValues) {
        this.ctx.fillStyle = this.options.labelColor;
        this.ctx.font = `${this.options.fontSize - 2}px ${this.options.fontFamily}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.data[i].toFixed(1), x, y - pointRadius - 8);
        this.ctx.fillStyle = pointColor;
      }
    }
  }

  /**
   * Draw center text if specified
   * 中央テキストを描画（指定されている場合）
   */
  drawCenterText() {
    if (!this.options.centerText) return;

    const { center } = this;
    const { labelColor, fontSize, fontFamily } = this.options;

    this.ctx.fillStyle = labelColor;
    this.ctx.font = `bold ${fontSize + 2}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.ctx.fillText(this.options.centerText, center.x, center.y);
  }

  /**
   * Update chart with new data (with animation)
   * 新しいデータでチャートを更新（アニメーション付き）
   */
  updateData(newData, newLabels) {
    this.setData(newData, newLabels);
  }

  /**
   * Update chart options
   * チャートオプションを更新
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.setupCanvas();
    this.render();
  }

  /**
   * Export chart as image
   * チャートを画像としてエクスポート
   */
  exportAsImage(format = "png") {
    try {
      return this.canvas.toDataURL(`image/${format}`);
    } catch (error) {
      console.error('PolygonChart: Export failed', error);
      return null;
    }
  }

  /**
   * Destroy the chart and cleanup
   * チャートを破棄してクリーンアップ
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.hideTooltip();
    
    // Remove tooltip if it exists
    const tooltip = document.getElementById('polygon-chart-tooltip');
    if (tooltip) {
      tooltip.remove();
    }

    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    console.log('PolygonChart: Destroyed');
  }
}

// Make PolygonChart globally available
window.PolygonChart = PolygonChart;

export default PolygonChart;
