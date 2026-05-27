const api = require('../../utils/api');

const SELECTED_KEY = 'selected_currencies';
const DEFAULT_SELECTED = ['USD', 'JPY', 'EUR', 'HKD'];

Page({
  data: {
    amount: '100',
    baseCurrency: api.getCurrency('CNY'),
    baseSymbol: '¥',
    displayCurrencies: [],
    updateTime: '',
    currencies: api.CURRENCIES,
    // Picker
    showPicker: false
  },

  onLoad() {
    const rates = api.getLiveRates();
    this.buildList(rates);
    this.setData({ updateTime: '更新于 ' + api.getNow() });

    // Silently refresh rates from API
    api.refreshRates().then(() => {
      this.buildList(api.getLiveRates());
      this.setData({ updateTime: '更新于 ' + api.getNow() + ' · 数据来源 聚合数据' });
    });

    setInterval(() => {
      this.setData({ updateTime: '更新于 ' + api.getNow() });
    }, 30000);
  },

  onShow() {
    // Rebuild list when returning from addcurrency page
    this.buildList(api.getLiveRates());
  },

  buildList(rates) {
    const r = rates || api.getLiveRates();
    const base = this.data.baseCurrency.code;
    const selected = wx.getStorageSync(SELECTED_KEY) || DEFAULT_SELECTED;
    const baseRate = r[base] || 1;
    const val = parseFloat(this.data.amount) || 0;

    const list = selected.map(code => {
      const currency = api.getCurrency(code);
      if (!currency) return null;
      const converted = val * (r[code] / baseRate);
      const decimals = converted >= 1000 ? 2 : (converted >= 1 ? 4 : 6);
      return {
        ...currency,
        formatted: converted.toFixed(decimals)
      };
    }).filter(Boolean);

    this.setData({
      displayCurrencies: list,
      baseSymbol: api.getSymbol(base)
    });
  },

  onAmountInput(e) {
    const val = e.detail.value.replace(/[^0-9.]/g, '');
    this.setData({ amount: val || '0' }, () => {
      this.buildList(api.getLiveRates());
    });
  },

  // ===== Base Currency =====
  onChangeBase() {
    this.setData({ showPicker: true });
  },

  onPickerClose() {
    this.setData({ showPicker: false });
  },

  onPickerSelect(e) {
    const code = e.currentTarget.dataset.code;
    const currency = api.getCurrency(code);
    if (currency) {
      this.setData({ baseCurrency: currency, showPicker: false }, () => {
        this.buildList(api.getLiveRates());
      });
    }
  },

  // ===== Add Currency =====
  onAddCurrency() {
    wx.navigateTo({ url: '/pages/addcurrency/addcurrency' });
  }
});
