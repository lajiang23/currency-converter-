const api = require('../../utils/api');

const SELECTED_KEY = 'selected_currencies';
const DEFAULT_SELECTED = ['USD', 'JPY', 'EUR', 'HKD'];

// Generate deterministic-ish change for each currency
function genChange(code) {
  const seed = code.charCodeAt(0) + code.charCodeAt(code.length - 1);
  const val = ((seed * 9301 + 49297) % 233280) / 233280;
  const pct = (val * 0.6 - 0.2).toFixed(2);
  return { changePct: pct, changeUp: parseFloat(pct) >= 0 };
}

Page({
  data: {
    amount: '100',
    baseCurrency: { ...api.getCurrency('CNY'), flagUrl: api.getFlagUrl('CNY') },
    baseSymbol: '¥',
    displayCurrencies: [],
    updateTime: '',
    currencies: api.CURRENCIES.map(c => ({ ...c, flagUrl: api.getFlagUrl(c.code) })),
    showPicker: false,
    refreshing: false
  },

  onLoad() {
    const rates = api.getLiveRates();
    this.buildList(rates);
    this.setData({ updateTime: '更新于 ' + api.getNow() });

    api.refreshRates().then(() => {
      this.buildList(api.getLiveRates());
      this.setData({
        updateTime: '更新于 ' + api.getNow() + ' · 数据来源 聚合数据',
        refreshing: false
      });
    });
    this.setData({ refreshing: true });

    setInterval(() => {
      this.setData({ updateTime: '更新于 ' + api.getNow() });
    }, 30000);
  },

  onShow() {
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
      const rate = r[code] / baseRate;
      const converted = val * rate;
      const decimals = converted >= 1000 ? 2 : (converted >= 1 ? 4 : 6);
      const change = genChange(code);
      const rateStr = rate >= 100 ? rate.toFixed(2) : (rate >= 1 ? rate.toFixed(4) : rate.toFixed(6));
      return {
        ...currency,
        flagUrl: api.getFlagUrl(currency.code),
        formatted: converted.toFixed(decimals),
        rate: rateStr,
        ...change
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
      this.setData({
        baseCurrency: { ...currency, flagUrl: api.getFlagUrl(code) },
        showPicker: false
      }, () => {
        this.buildList(api.getLiveRates());
      });
    }
  },

  onAddCurrency() {
    wx.navigateTo({ url: '/pages/addcurrency/addcurrency' });
  }
});
