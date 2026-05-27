const api = require('../../utils/api');
const i18n = require('../../utils/i18n');

const SELECTED_KEY = 'selected_currencies';
const DEFAULT_SELECTED = ['USD', 'JPY', 'EUR', 'HKD'];

Page({
  data: {
    currencies: [],
    checkedCount: 0,
    _: i18n.getAllStrings()
  },

  onLoad() {
    this.setData({ _: i18n.getAllStrings() });
    this.buildList();
  },

  buildList() {
    const selected = wx.getStorageSync(SELECTED_KEY) || DEFAULT_SELECTED;
    const list = api.CURRENCIES.filter(c => c.code !== 'CNY').map(c => ({
      ...c,
      flagUrl: api.getFlagUrl(c.code),
      checked: selected.includes(c.code)
    }));
    const count = list.filter(c => c.checked).length;
    this.setData({
      currencies: list,
      checkedCount: count,
      selectedCountLabel: i18n.t('selected_count', count)
    });
  },

  onToggle(e) {
    const code = e.currentTarget.dataset.code;
    let count = this.data.checkedCount;
    const list = this.data.currencies.map(c => {
      if (c.code === code) {
        const newChecked = !c.checked;
        count += newChecked ? 1 : -1;
        return { ...c, checked: newChecked };
      }
      return c;
    });
    this.setData({
      currencies: list,
      checkedCount: count,
      selectedCountLabel: i18n.t('selected_count', count)
    });
  },

  onConfirm() {
    const selected = this.data.currencies
      .filter(c => c.checked)
      .map(c => c.code);
    wx.setStorageSync(SELECTED_KEY, selected);
    wx.navigateBack();
  }
});
