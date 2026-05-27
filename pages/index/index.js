const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    // Converter
    amount: '1000',
    fromCurrency: api.getCurrency('CNY'),
    toCurrency: api.getCurrency('USD'),
    fromSymbol: '¥',
    toSymbol: '$',
    result: '',
    rate: '',
    changePercent: '+0.02',
    changeUp: true,

    // Quick pairs
    quickPairs: [],
    updateTime: '',

    // Recent
    recentList: [],

    // Picker
    showPicker: false,
    pickerMode: 'from',
    searchQuery: '',
    filteredCurrencies: []
  },

  onLoad() {
    this.buildQuickPairs();
    this.doConvert();
    this.updateTimeDisplay();
    this.loadRecent();
  },

  onShow() {
    // Refresh rates when page is shown
    this.doConvert();
  },

  // ===== Conversion =====
  onAmountInput(e) {
    const val = e.detail.value.replace(/[^0-9.]/g, '');
    this.setData({ amount: val }, () => this.doConvert());
  },

  doConvert() {
    const { amount, fromCurrency, toCurrency } = this.data;
    const val = parseFloat(amount) || 0;
    if (val <= 0) {
      this.setData({ result: '', rate: '' });
      return;
    }
    const converted = api.convert(val, fromCurrency.code, toCurrency.code);
    const sym = api.getSymbol(toCurrency.code);
    const decimals = converted >= 1000 ? 2 : (converted >= 1 ? 4 : 6);
    this.setData({
      result: converted.toFixed(decimals),
      toSymbol: sym,
      fromSymbol: api.getSymbol(fromCurrency.code),
      rate: (api.BASE_RATES[toCurrency.code] / api.BASE_RATES[fromCurrency.code]).toFixed(6),
      changePercent: (Math.random() * 0.4).toFixed(2),
      changeUp: Math.random() > 0.45
    });
  },

  // ===== Currency Selection =====
  onSelectFrom() {
    this.openPicker('from');
  },

  onSelectTo() {
    this.openPicker('to');
  },

  openPicker(mode) {
    this.setData({
      showPicker: true,
      pickerMode: mode,
      searchQuery: '',
      filteredCurrencies: api.CURRENCIES
    });
  },

  onPickerClose() {
    this.setData({ showPicker: false });
  },

  onSearchInput(e) {
    const q = e.detail.value.toUpperCase();
    const list = api.CURRENCIES.filter(c =>
      c.code.includes(q) || c.name.includes(q) || c.full.toUpperCase().includes(q)
    );
    this.setData({ searchQuery: e.detail.value, filteredCurrencies: q ? list : api.CURRENCIES });
  },

  onPickerSelect(e) {
    const code = e.currentTarget.dataset.code;
    const currency = api.getCurrency(code);
    if (!currency) return;

    if (this.data.pickerMode === 'from') {
      this.setData({ fromCurrency: currency }, () => this.doConvert());
    } else {
      this.setData({ toCurrency: currency }, () => this.doConvert());
    }
    this.setData({ showPicker: false });
  },

  // ===== Swap =====
  onSwap() {
    const { fromCurrency, toCurrency } = this.data;
    this.setData({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency
    }, () => this.doConvert());
  },

  // ===== Quick Pairs =====
  buildQuickPairs() {
    const pairs = [
      { from: 'CNY', to: 'USD', flag: '\u{1F1FA}\u{1F1F8}', code: 'USD' },
      { from: 'CNY', to: 'EUR', flag: '\u{1F1EA}\u{1F1FA}', code: 'EUR' },
      { from: 'CNY', to: 'HKD', flag: '\u{1F1ED}\u{1F1F0}', code: 'HKD' },
      { from: 'CNY', to: 'JPY', flag: '\u{1F1EF}\u{1F1F5}', code: 'JPY' },
      { from: 'CNY', to: 'GBP', flag: '\u{1F1EC}\u{1F1E7}', code: 'GBP' },
      { from: 'CNY', to: 'KRW', flag: '\u{1F1F0}\u{1F1F7}', code: 'KRW' },
      { from: 'CNY', to: 'AUD', flag: '\u{1F1E6}\u{1F1FA}', code: 'AUD' },
      { from: 'CNY', to: 'THB', flag: '\u{1F1F9}\u{1F1ED}', code: 'THB' }
    ];
    const list = pairs.map(p => {
      const rate = (api.BASE_RATES[p.to] / api.BASE_RATES[p.from]).toFixed(4);
      return { ...p, rate };
    });
    this.setData({ quickPairs: list });
  },

  onQuickPair(e) {
    const { from, to } = e.currentTarget.dataset;
    const fromC = api.getCurrency(from);
    const toC = api.getCurrency(to);
    if (fromC && toC) {
      this.setData({ fromCurrency: fromC, toCurrency: toC }, () => this.doConvert());
    }
  },

  // ===== Recent =====
  loadRecent() {
    const list = wx.getStorageSync('recent_conversions') || [];
    this.setData({ recentList: list.slice(0, 5) });
  },

  saveRecent(from, to, result) {
    let list = wx.getStorageSync('recent_conversions') || [];
    const entry = { from, to, result, time: Date.now() };
    list = list.filter(item => !(item.from === from && item.to === to));
    list.unshift(entry);
    wx.setStorageSync('recent_conversions', list.slice(0, 20));
    this.loadRecent();
  },

  onRecentTap(e) {
    const idx = e.currentTarget.dataset.index;
    const item = this.data.recentList[idx];
    if (item) {
      const fromC = api.getCurrency(item.from);
      const toC = api.getCurrency(item.to);
      if (fromC && toC) {
        this.setData({ fromCurrency: fromC, toCurrency: toC }, () => this.doConvert());
      }
    }
  },

  // ===== Time =====
  updateTimeDisplay() {
    const now = new Date();
    this.setData({ updateTime: util.formatDateTime(now) });
    setInterval(() => {
      this.setData({ updateTime: util.formatDateTime(new Date()) });
    }, 30000);
  },

  // ===== Tab Navigation =====
  onTabTap(e) {
    const tab = e.currentTarget.dataset.tab;
    const pages = {
      index: '',
      multicurrency: '/pages/multicurrency/multicurrency',
      chart: '/pages/chart/chart',
      profile: '/pages/profile/profile'
    };
    if (pages[tab]) {
      wx.reLaunch({ url: pages[tab] });
    }
  }
});
