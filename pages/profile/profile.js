const i18n = require('../../utils/i18n');

Page({
  data: {
    lang: i18n.getLang(),
    _: i18n.getAllStrings()
  },

  onShow() {
    const lang = i18n.getLang();
    if (lang !== this.data.lang) {
      this.setData({ lang, _: i18n.getAllStrings() });
    }
  },

  onProTap() {
    wx.showModal({
      title: 'Pro',
      content: this.data.lang === 'en'
        ? 'Ad-free · Unlimited Alerts · Data Export · VIP Charts\n\n¥9.9/mo or ¥68/yr'
        : '去广告 · 无限预警 · 历史数据导出 · VIP 走势\n\n¥9.9/月 或 ¥68/年',
      confirmText: this.data.lang === 'en' ? 'Subscribe' : '立即开通',
      cancelText: this.data.lang === 'en' ? 'Cancel' : '再看看',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: this.data.lang === 'en' ? 'Coming soon' : '即将开通，敬请期待',
            icon: 'none'
          });
        }
      }
    });
  },

  onMenuTap(e) {
    const action = e.currentTarget.dataset.action;
    const titles = {
      alerts: this.data.lang === 'en' ? 'Rate Alerts' : '汇率预警',
      favorites: this.data.lang === 'en' ? 'Favorite Currencies' : '收藏货币',
      history: this.data.lang === 'en' ? 'History' : '历史记录',
      export: this.data.lang === 'en' ? 'Export Data' : '数据导出',
      knowledge: this.data.lang === 'en' ? 'Rate Knowledge' : '汇率知识',
      settings: this.data.lang === 'en' ? 'Settings' : '设置'
    };
    const dev = this.data.lang === 'en' ? ' (Coming Soon)' : '（开发中）';
    wx.showToast({ title: titles[action] + dev, icon: 'none', duration: 1500 });
  },

  onTabTap(e) {
    const tab = e.currentTarget.dataset.tab;
    const pages = {
      index: '/pages/index/index',
      multicurrency: '/pages/multicurrency/multicurrency',
      chart: '/pages/chart/chart',
      profile: ''
    };
    if (pages[tab]) {
      wx.reLaunch({ url: pages[tab] });
    }
  }
});
