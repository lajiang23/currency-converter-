const api = require('../../utils/api');
const i18n = require('../../utils/i18n');

const SELECTED_KEY = 'selected_currencies';
const DEFAULT_SELECTED = ['USD', 'JPY', 'EUR', 'HKD'];
const AD_UNIT_ID = ''; // ← Set your WeChat Ad unit ID here

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
    refreshing: false,
    lang: i18n.getLang(),
    _: i18n.getAllStrings(),
    adUnitId: AD_UNIT_ID
  },

  onLoad() {
    const rates = api.getLiveRates();
    this.buildList(rates);
    this.updateTimeStr();

    api.refreshRates().then(() => {
      this.buildList(api.getLiveRates());
      this.setData({
        updateTime: this.l('updated_at') + ' ' + api.getNow() + ' · ' + this.l('data_source'),
        refreshing: false
      });
    });
    this.setData({ refreshing: true });

    setInterval(() => {
      this.updateTimeStr();
    }, 30000);
  },

  onShow() {
    this.buildList(api.getLiveRates());
  },

  /**
   * Shortcut for i18n.t with current lang context
   */
  l(key, ...args) {
    return i18n.t(key, ...args);
  },

  /**
   * Update time string with current locale
   */
  updateTimeStr() {
    this.setData({ updateTime: this.l('updated_at') + ' ' + api.getNow() });
  },

  /**
   * Toggle language and reload
   */
  onToggleLang() {
    const newLang = this.data.lang === 'en' ? 'zh' : 'en';
    i18n.setLang(newLang);
    this.setData({
      lang: newLang,
      _: i18n.getAllStrings()
    });
    this.updateTimeStr();
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
  },

  // ===== Delete Currency =====
  onDeleteCurrency(e) {
    const code = e.currentTarget.dataset.code;
    const currency = api.getCurrency(code);
    if (!currency) return;

    const title = this.l('delete_title');
    const content = this.l('delete_confirm', currency.name, currency.code);

    wx.showModal({
      title,
      content,
      cancelText: this.l('cancel'),
      confirmText: this.l('delete'),
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          const selected = wx.getStorageSync(SELECTED_KEY) || DEFAULT_SELECTED;
          const updated = selected.filter(c => c !== code);
          wx.setStorageSync(SELECTED_KEY, updated);
          this.buildList(api.getLiveRates());
          wx.showToast({ title: this.l('deleted'), icon: 'success', duration: 1200 });
        }
      }
    });
  },

  // ===== Ad Events =====
  onAdLoad() {
    // Ad loaded successfully
  },
  onAdError(e) {
    console.warn('[Ad] error', e.detail);
  }
});
