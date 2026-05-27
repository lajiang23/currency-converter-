const api = require('../../utils/api');

Page({
  data: {
    baseCurrency: api.getCurrency('CNY'),
    baseAmount: '1000',
    baseSymbol: '¥',
    currencies: [],
    displayList: [],
    searchQuery: ''
  },

  onLoad() {
    this.buildList();
  },

  buildList() {
    const base = this.data.baseCurrency.code;
    const all = api.getAllRates(base);
    const list = all.map(c => {
      const val = parseFloat(this.data.baseAmount || 0) * c.rate;
      const decimals = val >= 1000 ? 2 : (val >= 1 ? 4 : 6);
      return {
        ...c,
        formatted: val.toFixed(decimals),
        changePct: c.change,
        changeUp: c.changeUp
      };
    });
    this.setData({ currencies: list, displayList: this.filterList(list, this.data.searchQuery) });
  },

  onBaseAmountChange(e) {
    const val = e.detail.value.replace(/[^0-9.]/g, '');
    this.setData({ baseAmount: val || '0' }, () => this.buildList());
  },

  onSearch(e) {
    const q = e.detail.value.toLowerCase();
    this.setData({ searchQuery: q });
    const filtered = this.filterList(this.data.currencies, q);
    this.setData({ displayList: filtered });
  },

  filterList(list, query) {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.includes(q) ||
      c.full.toLowerCase().includes(q)
    );
  },

  onTabTap(e) {
    const tab = e.currentTarget.dataset.tab;
    const pages = {
      index: '/pages/index/index',
      multicurrency: '',
      chart: '/pages/chart/chart',
      profile: '/pages/profile/profile'
    };
    if (pages[tab]) {
      wx.reLaunch({ url: pages[tab] });
    }
  }
});
