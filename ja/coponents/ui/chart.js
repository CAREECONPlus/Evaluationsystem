/**
 * Chart Component for rendering various chart types
 * 各種チャートを描画するためのチャートコンポーネント
 */
class Chart {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.options = {
      type: "radar",
      responsive: true,
      maintainAspectRatio: false,
      ...options,
    }
    this.data = null
    this.animationId = null
    this.colors = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#17a2b8"]
  }

  /**
   * Set chart data
   * チャートデータを設定
   */
  setData(data) {
    this.data = data
    return this
  }

  /**
   * Set chart type
   * チャートタイプを設定
   */
  setType(type) {
    this.options.type = type
    return this
  }

  /**
   * Render the chart
   * チャートを描画
   */
  render() {
    if (!this.data) {
      console.warn("No data provided for chart")
      return
    }

    this.clear()

    switch (this.options.type) {
      case "radar":
        this.renderRadarChart()
        break
      case "bar":
        this.renderBarChart()
        break
      case "line":
        this.renderLineChart()
        break
      default:
        console.warn(`Chart type ${this.options.type} not supported`)
        this.renderRadarChart()
    }
  }

  /**
   * Clear the canvas
   * キャンバスをクリア
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Render radar chart
   * レーダーチャートを描画
   */
  renderRadarChart() {
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    const radius = Math.min(centerX, centerY) - 50
    const labels = this.data.labels || []
    const datasets = this.data.datasets || []

    // Draw grid
    this.drawRadarGrid(centerX, centerY, radius, labels.length)

    // Draw labels
    this.drawRadarLabels(centerX, centerY, radius, labels)

    // Draw datasets
    datasets.forEach((dataset, index) => {
      this.drawRadarDataset(centerX, centerY, radius, dataset, labels.length, index)
    })

    // Draw legend
    this.drawLegend(datasets)
  }

  /**
   * Draw radar grid
   * レーダーグリッドを描画
   */
  drawRadarGrid(centerX, centerY, radius, numPoints) {
    this.ctx.strokeStyle = "#e0e0e0"
    this.ctx.lineWidth = 1

    // Draw concentric circles
    for (let i = 1; i <= 5; i++) {
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI)
      this.ctx.stroke()
    }

    // Draw radial lines
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      this.ctx.beginPath()
      this.ctx.moveTo(centerX, centerY)
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
    }
  }

  /**
   * Draw radar labels
   * レーダーラベルを描画
   */
  drawRadarLabels(centerX, centerY, radius, labels) {
    this.ctx.fillStyle = "#333"
    this.ctx.font = "12px Arial"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"

    labels.forEach((label, index) => {
      const angle = (2 * Math.PI * index) / labels.length - Math.PI / 2
      const labelRadius = radius + 20
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius

      this.ctx.fillText(label, x, y)
    })
  }

  /**
   * Draw radar dataset
   * レーダーデータセットを描画
   */
  drawRadarDataset(centerX, centerY, radius, dataset, numPoints, datasetIndex) {
    const color = this.colors[datasetIndex % this.colors.length]
    const data = dataset.data || []
    const maxValue = 5 // Assuming max value is 5

    // Draw filled area
    this.ctx.fillStyle = color + "40" // Add transparency
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 2
    this.ctx.beginPath()

    data.forEach((value, i) => {
      const angle = (2 * Math.PI * i) / numPoints - Math.PI / 2
      const dataRadius = (radius * value) / maxValue
      const x = centerX + Math.cos(angle) * dataRadius
      const y = centerY + Math.sin(angle) * dataRadius

      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })

    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()

    // Draw points
    this.ctx.fillStyle = color
    data.forEach((value, i) => {
      const angle = (2 * Math.PI * i) / numPoints - Math.PI / 2
      const dataRadius = (radius * value) / maxValue
      const x = centerX + Math.cos(angle) * dataRadius
      const y = centerY + Math.sin(angle) * dataRadius

      this.ctx.beginPath()
      this.ctx.arc(x, y, 4, 0, 2 * Math.PI)
      this.ctx.fill()
    })
  }

  /**
   * Render bar chart
   * バーチャートを描画
   */
  renderBarChart() {
    const padding = 50
    const chartWidth = this.canvas.width - 2 * padding
    const chartHeight = this.canvas.height - 2 * padding
    const labels = this.data.labels || []
    const datasets = this.data.datasets || []
    const barWidth = chartWidth / labels.length / datasets.length
    const maxValue = 5

    // Draw axes
    this.drawAxes(padding, chartWidth, chartHeight)

    // Draw bars
    datasets.forEach((dataset, datasetIndex) => {
      const color = this.colors[datasetIndex % this.colors.length]
      this.ctx.fillStyle = color

      dataset.data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight
        const x = padding + index * (chartWidth / labels.length) + datasetIndex * barWidth
        const y = padding + chartHeight - barHeight

        this.ctx.fillRect(x, y, barWidth * 0.8, barHeight)
      })
    })

    // Draw labels
    this.drawBarLabels(padding, chartWidth, chartHeight, labels)
    this.drawLegend(datasets)
  }

  /**
   * Render line chart
   * ラインチャートを描画
   */
  renderLineChart() {
    const padding = 50
    const chartWidth = this.canvas.width - 2 * padding
    const chartHeight = this.canvas.height - 2 * padding
    const labels = this.data.labels || []
    const datasets = this.data.datasets || []
    const maxValue = 5

    // Draw axes
    this.drawAxes(padding, chartWidth, chartHeight)

    // Draw lines
    datasets.forEach((dataset, datasetIndex) => {
      const color = this.colors[datasetIndex % this.colors.length]
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = 2
      this.ctx.beginPath()

      dataset.data.forEach((value, index) => {
        const x = padding + (index / (labels.length - 1)) * chartWidth
        const y = padding + chartHeight - (value / maxValue) * chartHeight

        if (index === 0) {
          this.ctx.moveTo(x, y)
        } else {
          this.ctx.lineTo(x, y)
        }
      })

      this.ctx.stroke()

      // Draw points
      this.ctx.fillStyle = color
      dataset.data.forEach((value, index) => {
        const x = padding + (index / (labels.length - 1)) * chartWidth
        const y = padding + chartHeight - (value / maxValue) * chartHeight

        this.ctx.beginPath()
        this.ctx.arc(x, y, 4, 0, 2 * Math.PI)
        this.ctx.fill()
      })
    })

    // Draw labels
    this.drawBarLabels(padding, chartWidth, chartHeight, labels)
    this.drawLegend(datasets)
  }

  /**
   * Draw chart axes
   * チャート軸を描画
   */
  drawAxes(padding, chartWidth, chartHeight) {
    this.ctx.strokeStyle = "#333"
    this.ctx.lineWidth = 1

    // Y-axis
    this.ctx.beginPath()
    this.ctx.moveTo(padding, padding)
    this.ctx.lineTo(padding, padding + chartHeight)
    this.ctx.stroke()

    // X-axis
    this.ctx.beginPath()
    this.ctx.moveTo(padding, padding + chartHeight)
    this.ctx.lineTo(padding + chartWidth, padding + chartHeight)
    this.ctx.stroke()
  }

  /**
   * Draw bar chart labels
   * バーチャートのラベルを描画
   */
  drawBarLabels(padding, chartWidth, chartHeight, labels) {
    this.ctx.fillStyle = "#333"
    this.ctx.font = "12px Arial"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "top"

    labels.forEach((label, index) => {
      const x = padding + (index + 0.5) * (chartWidth / labels.length)
      const y = padding + chartHeight + 10
      this.ctx.fillText(label, x, y)
    })
  }

  /**
   * Draw legend
   * 凡例を描画
   */
  drawLegend(datasets) {
    const legendY = 20
    let legendX = 20

    datasets.forEach((dataset, index) => {
      const color = this.colors[index % this.colors.length]

      // Draw color box
      this.ctx.fillStyle = color
      this.ctx.fillRect(legendX, legendY, 15, 15)

      // Draw label
      this.ctx.fillStyle = "#333"
      this.ctx.font = "12px Arial"
      this.ctx.textAlign = "left"
      this.ctx.textBaseline = "middle"
      this.ctx.fillText(dataset.label, legendX + 20, legendY + 7)

      legendX += this.ctx.measureText(dataset.label).width + 50
    })
  }

  /**
   * Update chart with new data
   * 新しいデータでチャートを更新
   */
  update(newData) {
    this.data = newData
    this.render()
  }

  /**
   * Destroy chart and cleanup
   * チャートを破棄してクリーンアップ
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.clear()
  }

  /**
   * Animate chart
   * チャートをアニメーション
   */
  animate(duration = 1000) {
    // Simple animation implementation
    let startTime = null
    const originalData = JSON.parse(JSON.stringify(this.data))

    const animateFrame = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Animate data values
      this.data.datasets.forEach((dataset, datasetIndex) => {
        dataset.data = originalData.datasets[datasetIndex].data.map((value) => value * progress)
      })

      this.render()

      if (progress < 1) {
        requestAnimationFrame(animateFrame)
      } else {
        // Restore original data
        this.data = originalData
        this.render()
      }
    }

    requestAnimationFrame(animateFrame)
  }
}

// Make Chart globally available
window.Chart = Chart

// Export for different module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = Chart
}
if (typeof exports !== "undefined") {
  exports.Chart = Chart
}
