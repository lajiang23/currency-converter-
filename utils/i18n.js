/**
 * Internationalization module
 * Supports English (default) and Chinese
 * Language preference is persisted in storage
 */

const STORAGE_KEY = 'app_language';

const LOCALES = {
  en: {
    // Global / Tab bar
    tab_home: 'Home',
    tab_multicurrency: 'All Currencies',
    tab_chart: 'Charts',
    tab_profile: 'Profile',

    // Index page
    base_currency: 'Base Currency',
    change: 'Change',
    select_base: 'Select Base Currency',
    current_base: 'Current Base',
    currency_converter: 'Currency Converter',
    currencies_count: 'currencies',
    no_currencies: 'No currencies added yet',
    no_currencies_sub: 'Tap below to add currencies',
    add_currency: 'Add Currency',
    updated_at: 'Updated at',
    data_source: 'Data from Juhe.cn',
    delete_title: 'Delete Currency',
    delete_confirm: 'Remove {0} ({1})?',
    cancel: 'Cancel',
    delete: 'Delete',
    deleted: 'Deleted',

    // Multi-currency page
    base_amount: 'Base Amount ({0})',
    search_placeholder: 'Search currency name or code...',
    no_results: 'No matching currencies found',

    // Chart page
    period_1d: '1D',
    period_1w: '1W',
    period_1m: '1M',
    period_1y: '1Y',
    high: 'High',
    low: 'Low',
    open: 'Open',
    change_label: 'Change',
    tech_indicators: 'Technical Indicators',

    // Add currency page
    select_currencies: 'Select currencies',
    selected_count: '{0} selected',
    confirm: 'Confirm',

    // Profile page
    not_logged_in: 'Not logged in',
    days_used: '{0} days',
    conversions: '{0} conversions',
    pro_title: 'Unlock Pro Member',
    pro_desc: 'Ad-free · Unlimited Alerts · Deep Data',
    pro_price: '¥9.9/mo',
    menu_alerts: 'Rate Alerts',
    menu_favorites: 'Favorite Currencies',
    menu_history: 'History',
    menu_export: 'Export Data',
    menu_knowledge: 'Rate Knowledge',
    menu_settings: 'Settings',
    logout_title: 'Log Out',
    logout_confirm: 'Are you sure you want to log out?',
    logout_btn: 'Log Out',
    login_switch: 'Log In / Switch Account',
    app_version: 'Currency Converter v1.0.0',
    developing: '{0} (Coming Soon)'
  },

  zh: {
    tab_home: '首页',
    tab_multicurrency: '多币种',
    tab_chart: '走势',
    tab_profile: '我的',

    base_currency: '基准货币',
    change: '更换',
    select_base: '选择基准货币',
    current_base: '当前基准',
    currency_converter: '货币换算',
    currencies_count: '种货币',
    no_currencies: '还没有添加货币',
    no_currencies_sub: '点击下方按钮添加关注的币种',
    add_currency: '添加货币',
    updated_at: '更新于',
    data_source: '数据来源 聚合数据',
    delete_title: '删除货币',
    delete_confirm: '确定要移除 {0}（{1}）吗？',
    cancel: '取消',
    delete: '删除',
    deleted: '已删除',

    base_amount: '基准金额（{0}）',
    search_placeholder: '搜索货币名称或代码...',
    no_results: '未找到匹配的货币',

    period_1d: '1天',
    period_1w: '1周',
    period_1m: '1月',
    period_1y: '1年',
    high: '最高',
    low: '最低',
    open: '开盘',
    change_label: '涨跌',
    tech_indicators: '技术指标',

    select_currencies: '选择你要关注的货币',
    selected_count: '已选 {0} 项',
    confirm: '确定',

    not_logged_in: '未登录',
    days_used: '已使用 {0} 天',
    conversions: '换算 {0} 次',
    pro_title: '解锁 Pro 会员',
    pro_desc: '去广告 · 无限预警 · 深度数据',
    pro_price: '¥9.9/月',
    menu_alerts: '汇率预警',
    menu_favorites: '收藏货币',
    menu_history: '历史记录',
    menu_export: '数据导出',
    menu_knowledge: '汇率知识',
    menu_settings: '设置',
    logout_title: '退出登录',
    logout_confirm: '确定要退出当前账号吗？',
    logout_btn: '退出',
    login_switch: '登录 / 切换账号',
    app_version: '汇率换算 v1.0.0',
    developing: '{0}（开发中）'
  }
};

// Current language, initialized on first call
let currentLang = 'en';

/**
 * Format string with positional args: {0}, {1}, etc.
 */
function format(str, ...args) {
  if (!args || args.length === 0) return str;
  return str.replace(/\{(\d+)\}/g, (_, idx) => {
    const i = parseInt(idx, 10);
    return args[i] !== undefined ? args[i] : `{${idx}}`;
  });
}

/**
 * Translate a key with optional positional arguments
 * @param {string} key
 * @param  {...any} args
 * @returns {string}
 */
function t(key, ...args) {
  const locale = LOCALES[currentLang] || LOCALES.en;
  const str = locale[key];
  if (str === undefined) {
    // Fallback to English
    const fallback = LOCALES.en[key];
    return fallback !== undefined ? format(fallback, ...args) : key;
  }
  return format(str, ...args);
}

/**
 * Get all translated strings as a flat map (for page data binding)
 * @returns {Object}
 */
function getAllStrings() {
  return LOCALES[currentLang] || LOCALES.en;
}

/**
 * Get current language
 */
function getLang() {
  return currentLang;
}

/**
 * Set language and persist
 * @param {'en'|'zh'} lang
 */
function setLang(lang) {
  if (lang !== 'en' && lang !== 'zh') return;
  currentLang = lang;
  try {
    wx.setStorageSync(STORAGE_KEY, lang);
  } catch (e) { /* ignore */ }
}

/**
 * Initialize language from storage
 */
function init() {
  try {
    const saved = wx.getStorageSync(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') {
      currentLang = saved;
    }
  } catch (e) { /* ignore */ }
}

// Auto-init
init();

module.exports = {
  t,
  getAllStrings,
  getLang,
  setLang,
  init,
  // Constants
  LANGUAGES: [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'zh', label: '中文', short: '中' }
  ]
};
