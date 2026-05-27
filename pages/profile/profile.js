const auth = require('../../utils/auth');
const util = require('../../utils/util');

Page({
  data: {
    userInfo: { nickName: '未登录' },
    initial: 'M',
    loggedIn: false,
    usedDays: 0,
    convertCount: 0
  },

  onShow() {
    this.loadUserData();
  },

  loadUserData() {
    const user = auth.loadUserInfo();
    if (user) {
      const days = Math.floor((Date.now() - user.loginTime) / 86400000) || 1;
      const initial = user.nickName ? user.nickName.charAt(0).toUpperCase() : 'M';
      this.setData({
        userInfo: user,
        initial,
        loggedIn: true,
        usedDays: days,
        convertCount: days * 6 + Math.floor(Math.random() * 10)
      });
    }
  },

  onProTap() {
    wx.showModal({
      title: 'Pro 会员',
      content: '去广告 · 无限预警 · 历史数据导出 · VIP 走势\n\n¥9.9/月 或 ¥68/年',
      confirmText: '立即开通',
      cancelText: '再看看',
      success: (res) => {
        if (res.confirm) {
          util.showToast('即将开通，敬请期待');
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
    util.showToast((titles[action] || action) + '（开发中）');
  },

  onLogin() {
    wx.reLaunch({ url: '/pages/login/login' });
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      cancelText: '取消',
      confirmText: '退出',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          this.setData({
            userInfo: { nickName: '未登录' },
            initial: 'M',
            loggedIn: false,
            usedDays: 0,
            convertCount: 0
          });
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
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
