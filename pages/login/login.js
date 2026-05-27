const auth = require('../../utils/auth');

Page({
  data: {
    loggingIn: false
  },

  /**
   * WeChat authorization login
   */
  async onWechatLogin() {
    if (this.data.loggingIn) return;
    this.setData({ loggingIn: true });

    wx.showLoading({ title: '登录中...', mask: true });

    try {
      let user = await auth.wechatLogin();

      // If WeChat auth was denied or failed, fallback to mock
      if (!user) {
        user = auth.mockLogin();
      }

      auth.saveUserInfo(user);

      wx.hideLoading();
      this.setData({ loggingIn: false });

      // Navigate to home page
      wx.reLaunch({ url: '/pages/index/index' });
    } catch (e) {
      wx.hideLoading();
      this.setData({ loggingIn: false });
      // Fallback — mock login
      const user = auth.mockLogin();
      auth.saveUserInfo(user);
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  /**
   * Quick mock login (for dev testing)
   */
  onMockLogin() {
    if (this.data.loggingIn) return;
    this.setData({ loggingIn: true });

    wx.showLoading({ title: '进入...', mask: true });

    setTimeout(() => {
      const user = auth.mockLogin();
      auth.saveUserInfo(user);
      wx.hideLoading();
      this.setData({ loggingIn: false });
      wx.reLaunch({ url: '/pages/index/index' });
    }, 600);
  },

  onLoad() {
    // If already logged in, skip login page
    if (auth.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  }
});
