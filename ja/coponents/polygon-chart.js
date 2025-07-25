/**
 * Polygon Chart Component
 * ポリゴンチャートコンポーネント
 */
class PolygonChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
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
      ...options,
    }

    this.data = []
    this.labels = []

    this.setupCanvas()
  }

  /**
   * Setup canvas dimensions
   * キャンバスの寸法を設定
   */
  setupCanvas() {
    const size = this.options.size
    this.canvas.width = size
    this.canvas.height = size

    // Set canvas style size for responsive design
    this.canvas.style.width = "100%"
    this.canvas.style.height = "auto"
    this.canvas.style.maxWidth = `${size}px`

    this.center = { x: size / 2, y: size / 2 }
    this.radius = (size / 2) * 0.8
  }

  /**
   * Set chart data
   * チャートデータを設定
   */
  setData(data, labels) {
    this.data = data
    this.labels = labels
    this.render()
  }

  /**
   * Render the chart
   * チャートをレンダリング
   */
  render() {
    this.clear()
    this.drawGrid()
    this.drawLabels()
    this.drawData()
  }

  /**
   * Clear canvas
   * キャンバスをクリア
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Draw grid lines
   * グリッド線を描画
   */
  drawGrid() {
    const { levels, gridColor } = this.options
    const { center, radius } = this

    this.ctx.strokeStyle = gridColor
    this.ctx.lineWidth = 1

    // Draw concentric polygons
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius * level) / levels
      this.drawPolygon(center, levelRadius, this.data.length)
    }

    // Draw radial lines
    for (let i = 0; i < this.data.length; i++) {
      const angle = (i * 2 * Math.PI) / this.data.length - Math.PI / 2
      const x = center.x + Math.cos(angle) * radius
      const y = center.y + Math.sin(angle) * radius

      this.ctx.beginPath()
      this.ctx.moveTo(center.x, center.y)
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
    }
  }

  /**
   * Draw polygon
   * ポリゴンを描画
   */
  drawPolygon(center, radius, sides) {
    this.ctx.beginPath()

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
      const x = center.x + Math.cos(angle) * radius
      const y = center.y + Math.sin(angle) * radius

      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }

    this.ctx.closePath()
    this.ctx.stroke()
  }

  /**
   * Draw labels
   * ラベルを描画
   */
  drawLabels() {
    const { center, radius } = this
    const { labelColor, fontSize } = this.options

    this.ctx.fillStyle = labelColor
    this.ctx.font = `${fontSize}px Arial`
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"

    for (let i = 0; i < this.labels.length; i++) {
      const angle = (i * 2 * Math.PI) / this.labels.length - Math.PI / 2
      const labelRadius = radius + 20
      const x = center.x + Math.cos(angle) * labelRadius
      const y = center.y + Math.sin(angle) * labelRadius

      this.ctx.fillText(this.labels[i], x, y)
    }
  }

  /**
   * Draw data
   * データを描画
   */
  drawData() {
    if (this.data.length === 0) return

    const { center, radius } = this
    const { maxValue, fillColor, strokeColor, pointColor } = this.options

    // Draw filled area
    this.ctx.fillStyle = fillColor
    this.ctx.strokeStyle = strokeColor
    this.ctx.lineWidth = 2

    this.ctx.beginPath()

    for (let i = 0; i < this.data.length; i++) {
      const value = Math.min(this.data[i], maxValue)
      const angle = (i * 2 * Math.PI) / this.data.length - Math.PI / 2
      const dataRadius = (radius * value) / maxValue
      const x = center.x + Math.cos(angle) * dataRadius
      const y = center.y + Math.sin(angle) * dataRadius

      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }

    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()

    // Draw data points
    this.ctx.fillStyle = pointColor

    for (let i = 0; i < this.data.length; i++) {
      const value = Math.min(this.data[i], maxValue)
      const angle = (i * 2 * Math.PI) / this.data.length - Math.PI / 2
      const dataRadius = (radius * value) / maxValue
      const x = center.x + Math.cos(angle) * dataRadius
      const y = center.y + Math.sin(angle) * dataRadius

      this.ctx.beginPath()
      this.ctx.arc(x, y, 4, 0, 2 * Math.PI)
      this.ctx.fill()
    }
  }

  /**
   * Update chart with animation
   * アニメーション付きでチャートを更新
   */
  updateData(newData, newLabels) {
    const oldData = [...this.data]
    const steps = 30
    let currentStep = 0

    const animate = () => {
      currentStep++
      const progress = currentStep / steps

      // Interpolate between old and new data
      this.data = oldData.map((oldValue, index) => {
        const newValue = newData[index] || 0
        return oldValue + (newValue - oldValue) * progress
      })

      this.labels = newLabels
      this.render()

      if (currentStep < steps) {
        requestAnimationFrame(animate)
      } else {
        this.data = newData
        this.labels = newLabels
      }
    }

    animate()
  }

  /**
   * Resize chart
   * チャートをリサイズ
   */
  resize(newSize) {
    this.options.size = newSize
    this.setupCanvas()
    this.render()
  }

  /**
   * Export chart as image
   * チャートを画像としてエクスポート
   */
  exportAsImage(format = "png") {
    return this.canvas.toDataURL(`image/${format}`)
  }
}

// Make PolygonChart globally available
window.PolygonChart = PolygonChart
