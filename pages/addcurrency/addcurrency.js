const api = require('../../utils/api');

const SELECTED_KEY = 'selected_currencies';
const DEFAULT_SELECTED = ['USD', 'JPY', 'EUR', 'HKD'];

Page({
  data: {
    currencies: []
  },

  onLoad() {
    const selected = wx.getStorageSync(SELECTED_KEY) || DEFAULT_SELECTED;
    const list = api.CURRENCIES.filter(c => c.code !== 'CNY').map(c => ({
      ...c,
      checked: selected.includes(c.code)
    }));
    this.setData({ currencies: list });
  },

  onToggle(e) {
    const code = e.currentTarget.dataset.code;
    const list = this.data.currencies.map(c => {
      if (c.code === code) {
        return { ...c, checked: !c.checked };
      }
      return c;
    });
    this.setData({ currencies: list });
  },

  onConfirm() {
    const selected = this.data.currencies
      .filter(c => c.checked)
      .map(c => c.code);
    wx.setStorageSync(SELECTED_KEY, selected);
    wx.navigateBack();
  }
});
