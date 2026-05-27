const util = require('../../utils/util');

Page({
  data: {},

  onProTap() {
    wx.showModal({
      title: 'Pro 会员',
      content: '去广告 · 无限预警 · 历史数据导出 · VIP 走势\n\n¥9.9/月 或 ¥68/年',
      confirmText: '立即开通',
      cancelText: '再看看',
      success: (res) => {
        if (res.confirm) {
          util.showToast('即将开通，敬请期待', 'none');
        }
      }
    });
  },

  onMenuTap(e) {
    const action = e.currentTarget.dataset.action;
    const titles = {
      alerts: '汇率预警',
      favorites: '收藏货币',
      history: '历史记录',
      export: '数据导出',
      knowledge: '汇率知识',
      settings: '设置'
    };
    const title = titles[action] || action;
    wx.showToast({
      title: title + '（开发中）',
      icon: 'none',
      duration: 1500
    });
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
