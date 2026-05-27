const AUTH_KEY = 'auth_user_info';

// Mock users for quick testing
const MOCK_USERS = [
  { nickName: '小明', avatarUrl: '' },
  { nickName: '张三', avatarUrl: '' },
  { nickName: '旅行者', avatarUrl: '' },
  { nickName: '投资人', avatarUrl: '' }
];

function randomMockUser() {
  return MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
}

/**
 * WeChat login — open-type getUserInfo
 * Returns user info from WeChat or null
 */
function wechatLogin() {
  return new Promise((resolve) => {
    wx.getUserProfile({
      desc: '用于展示用户头像和昵称',
      lang: 'zh_CN',
      success: (res) => {
        const user = res.userInfo || {};
        resolve({
          nickName: user.nickName || '微信用户',
          avatarUrl: user.avatarUrl || '',
          gender: user.gender || 0,
          province: user.province || '',
          city: user.city || '',
          fromWechat: true
        });
      },
      fail: () => {
        // User denied or API not available, return mock
        resolve(null);
      }
    });
  });
}

/**
 * Quick mock login — generates a random user
 */
function mockLogin() {
  const user = randomMockUser();
  return {
    ...user,
    fromWechat: false
  };
}

/**
 * Save user info to storage
 */
function saveUserInfo(user) {
  const info = {
    ...user,
    loginTime: Date.now()
  };
  wx.setStorageSync(AUTH_KEY, info);
  return info;
}

/**
 * Load saved user info
 */
function loadUserInfo() {
  try {
    const saved = wx.getStorageSync(AUTH_KEY);
    return saved || null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!loadUserInfo();
}

/**
 * Logout — clear saved user info
 */
function logout() {
  try {
    wx.removeStorageSync(AUTH_KEY);
  } catch (e) { /* ignore */ }
}

module.exports = {
  wechatLogin,
  mockLogin,
  saveUserInfo,
  loadUserInfo,
  isLoggedIn,
  logout
};
