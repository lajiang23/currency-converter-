App({
  globalData: {
    baseCurrency: 'CNY',
    currencies: null
  },

  onLaunch() {
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs.slice(0, 100));
  }
});
