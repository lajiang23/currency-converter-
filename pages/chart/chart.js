const api = require('../../utils/api');

Page({
  data: {
    baseCode: 'CNY',
    targetCode: 'USD',
    period: '1W',
    currentPrice: '',
    changePct: '',
    changeUp: true,
    highPrice: '',
    lowPrice: '',
    openPrice: '',
    ma5: '',
    ma20: '',
    rsi: '',
    volatility: '',
    chartData: null,
    canvasReady: false
  },

  onLoad() {
    this.loadData();
  },

  onReady() {
    this.setData({ canvasReady: true });
    // Draw after layout — try, then retry on next frame if canvas not ready
    wx.nextTick(() => {
      if (this.data.chartData) this.drawChart();
    });
  },

  loadData() {
    const data = api.generateChartData(this.data.period, this.data.baseCode, this.data.targetCode);
    const points = data.points;
    const values = points.map(p => p.value);

    // Technical indicators
    const ma5 = this.calcMA(values, 5);
    const ma20 = this.calcMA(values, 20);
    const rsi = this.calcRSI(values, 14);
    const vol = this.calcVolatility(values);

    this.setData({
      chartData: data,
      currentPrice: values[values.length - 1].toFixed(6),
      changePct: data.change,
      changeUp: data.changeUp,
      highPrice: data.high.toFixed(6),
      lowPrice: data.low.toFixed(6),
      openPrice: values[0].toFixed(6),
      ma5: ma5.toFixed(6),
      ma20: ma20.toFixed(6),
      rsi: rsi.toFixed(1),
      volatility: (vol * 100).toFixed(2) + '%'
    }, () => {
      if (this.data.canvasReady) {
        wx.nextTick(() => this.drawChart());
      }
    });
  },

  onPeriodChange(e) {
    const period = e.currentTarget.dataset.period;
    this.setData({ period }, () => this.loadData());
  },

  calcMA(values, n) {
    if (values.length < n) return values.reduce((a, b) => a + b, 0) / values.length;
    const slice = values.slice(-n);
    return slice.reduce((a, b) => a + b, 0) / n;
  },

  calcRSI(values, n) {
    if (values.length < n + 1) return 50;
    const changes = [];
    for (let i = values.length - n; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }
    const gains = changes.filter(c => c > 0);
    const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / n : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / n : 0.0001;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  },

  calcVolatility(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sqDiffs = values.map(v => (v - mean) ** 2);
    const std = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);
    return std / mean;
  },

  drawChart() {
    const data = this.data.chartData;
    if (!data || !data.points || data.points.length < 2) return;

    const query = wx.createSelectorQuery();
    query.select('.chart-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio || 2;
        const width = res[0].width;
        const height = res[0].height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        this.renderChart(ctx, width, height, data);
      });
  },

  renderChart(ctx, w, h, data) {
    const points = data.points;
    const values = points.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 0.001;

    const pad = { top: 20, bottom: 24, left: 20, right: 20 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    // Map data to pixel coordinates
    const toX = (i) => pad.left + (i / (values.length - 1)) * chartW;
    const toY = (v) => pad.top + (1 - (v - min) / range) * chartH;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 0.5;
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = pad.top + (i / gridCount) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      const val = max - (i / gridCount) * range;
      ctx.fillText(val.toFixed(4), pad.left - 4, y);
    }

    // Gradient fill under line
    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, 'rgba(26,115,232,0.12)');
    grad.addColorStop(1, 'rgba(26,115,232,0.01)');

    ctx.beginPath();
    ctx.moveTo(toX(0), pad.top + chartH);
    values.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(values.length - 1), pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    values.forEach((v, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(v));
      else ctx.lineTo(toX(i), toY(v));
    });
    ctx.strokeStyle = '#1A73E8';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Current price dot
    const lastX = toX(values.length - 1);
    const lastY = toY(values[values.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1A73E8';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current price label
    const label = values[values.length - 1].toFixed(4);
    ctx.font = '600 10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const lw = ctx.measureText(label).width + 16;
    const lh = 20;
    const lx = Math.min(lastX, w - pad.right - lw / 2);
    const lx2 = Math.max(lx, pad.left + lw / 2);
    const ly = Math.max(lastY - 14, pad.top + 2);

    ctx.fillStyle = '#1A73E8';
    roundRect(ctx, lx2 - lw / 2, ly - lh, lw, lh, 4);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, lx2, ly - lh / 2);

    // Time labels (first, middle, last)
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    const indices = [0, Math.floor(values.length / 2), values.length - 1];
    indices.forEach(i => {
      const x = toX(i);
      const t = new Date(points[i].time);
      const label = this.data.period === '1D'
        ? `${String(t.getHours()).padStart(2, '0')}:00`
        : `${t.getMonth() + 1}/${t.getDate()}`;
      ctx.fillText(label, x, h - pad.bottom + 6);
    });
  },

  // ===== Tab Navigation =====
  onTabTap(e) {
    const tab = e.currentTarget.dataset.tab;
    const pages = {
      index: '/pages/index/index',
      multicurrency: '/pages/multicurrency/multicurrency',
      chart: '',
      profile: '/pages/profile/profile'
    };
    if (pages[tab]) {
      wx.reLaunch({ url: pages[tab] });
    }
  }
});

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
