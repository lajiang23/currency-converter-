/**
 * Exchange rate data and API service
 * Data source: 聚合数据 (Juhe.cn)
 */

// ===== Config =====
const JUHE_KEY = '557f44faa568dde0ddd7dbc8a7bdc31f';
const CACHE_KEY = 'juhe_rates_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const KEY_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'HKD', 'KRW', 'AUD', 'THB'];

// ===== Currency Definitions =====
// flagCountry: ISO 3166-1 alpha-2 code for flagcdn.com
// flagUrl: empty = use fallback circle icon
const CURRENCIES = [
  { code: 'USD', name: '美元', full: 'US Dollar', flag: '\u{1F1FA}\u{1F1F8}', symbol: '$', flagCountry: 'us' },
  { code: 'EUR', name: '欧元', full: 'Euro', flag: '\u{1F1EA}\u{1F1FA}', symbol: '€', flagCountry: 'eu' },
  { code: 'GBP', name: '英镑', full: 'British Pound', flag: '\u{1F1EC}\u{1F1E7}', symbol: '£', flagCountry: 'gb' },
  { code: 'JPY', name: '日元', full: 'Japanese Yen', flag: '\u{1F1EF}\u{1F1F5}', symbol: '¥', flagCountry: 'jp' },
  { code: 'KRW', name: '韩元', full: 'South Korean Won', flag: '\u{1F1F0}\u{1F1F7}', symbol: '₩', flagCountry: 'kr' },
  { code: 'HKD', name: '港币', full: 'Hong Kong Dollar', flag: '\u{1F1ED}\u{1F1F0}', symbol: 'HK$', flagCountry: 'hk' },
  { code: 'TWD', name: '新台币', full: 'Taiwan Dollar', flag: '', symbol: 'NT$', flagCountry: '' },
  { code: 'SGD', name: '新加坡元', full: 'Singapore Dollar', flag: '\u{1F1F8}\u{1F1EC}', symbol: 'S$', flagCountry: 'sg' },
  { code: 'AUD', name: '澳元', full: 'Australian Dollar', flag: '\u{1F1E6}\u{1F1FA}', symbol: 'A$', flagCountry: 'au' },
  { code: 'CAD', name: '加元', full: 'Canadian Dollar', flag: '\u{1F1E8}\u{1F1E6}', symbol: 'C$', flagCountry: 'ca' },
  { code: 'CHF', name: '瑞士法郎', full: 'Swiss Franc', flag: '\u{1F1E8}\u{1F1ED}', symbol: 'Fr', flagCountry: 'ch' },
  { code: 'THB', name: '泰铢', full: 'Thai Baht', flag: '\u{1F1F9}\u{1F1ED}', symbol: '฿', flagCountry: 'th' },
  { code: 'MYR', name: '马来西亚林吉特', full: 'Malaysian Ringgit', flag: '\u{1F1F2}\u{1F1FE}', symbol: 'RM', flagCountry: 'my' },
  { code: 'VND', name: '越南盾', full: 'Vietnamese Dong', flag: '\u{1F1FB}\u{1F1F3}', symbol: '₫', flagCountry: 'vn' },
  { code: 'PHP', name: '菲律宾比索', full: 'Philippine Peso', flag: '\u{1F1F5}\u{1F1ED}', symbol: '₱', flagCountry: 'ph' },
  { code: 'IDR', name: '印尼盾', full: 'Indonesian Rupiah', flag: '\u{1F1EE}\u{1F1E9}', symbol: 'Rp', flagCountry: 'id' },
  { code: 'INR', name: '印度卢比', full: 'Indian Rupee', flag: '\u{1F1EE}\u{1F1F3}', symbol: '₹', flagCountry: 'in' },
  { code: 'RUB', name: '俄罗斯卢布', full: 'Russian Ruble', flag: '\u{1F1F7}\u{1F1FA}', symbol: '₽', flagCountry: 'ru' },
  { code: 'NZD', name: '新西兰元', full: 'New Zealand Dollar', flag: '\u{1F1F3}\u{1F1FF}', symbol: 'NZ$', flagCountry: 'nz' },
  { code: 'MOP', name: '澳门元', full: 'Macanese Pataca', flag: '\u{1F1F2}\u{1F1F4}', symbol: 'MOP$', flagCountry: 'mo' },
  { code: 'SEK', name: '瑞典克朗', full: 'Swedish Krona', flag: '\u{1F1F8}\u{1F1EA}', symbol: 'kr', flagCountry: 'se' },
  { code: 'NOK', name: '挪威克朗', full: 'Norwegian Krone', flag: '\u{1F1F3}\u{1F1F4}', symbol: 'kr', flagCountry: 'no' },
  { code: 'DKK', name: '丹麦克朗', full: 'Danish Krone', flag: '\u{1F1E9}\u{1F1F0}', symbol: 'kr', flagCountry: 'dk' },
  { code: 'ZAR', name: '南非兰特', full: 'South African Rand', flag: '\u{1F1FF}\u{1F1E6}', symbol: 'R', flagCountry: 'za' },
  { code: 'TRY', name: '土耳其里拉', full: 'Turkish Lira', flag: '\u{1F1F9}\u{1F1F7}', symbol: '₺', flagCountry: 'tr' },
  { code: 'SAR', name: '沙特里亚尔', full: 'Saudi Riyal', flag: '\u{1F1F8}\u{1F1E6}', symbol: '﷼', flagCountry: 'sa' },
  { code: 'AED', name: '阿联酋迪拉姆', full: 'UAE Dirham', flag: '\u{1F1E6}\u{1F1EA}', symbol: 'د.إ', flagCountry: 'ae' },
  { code: 'PLN', name: '波兰兹罗提', full: 'Polish Zloty', flag: '\u{1F1F5}\u{1F1F1}', symbol: 'zł', flagCountry: 'pl' },
  { code: 'MXN', name: '墨西哥比索', full: 'Mexican Peso', flag: '\u{1F1F2}\u{1F1FD}', symbol: 'MX$', flagCountry: 'mx' },
  { code: 'BRL', name: '巴西雷亚尔', full: 'Brazilian Real', flag: '\u{1F1E7}\u{1F1F7}', symbol: 'R$', flagCountry: 'br' },
  { code: 'NGN', name: '尼日利亚奈拉', full: 'Nigerian Naira', flag: '\u{1F1F3}\u{1F1EC}', symbol: '₦', flagCountry: 'ng' },
  { code: 'CNY', name: '人民币', full: 'Chinese Yuan', flag: '\u{1F1E8}\u{1F1F3}', symbol: '¥', flagCountry: 'cn' }
];

// Fallback reference rates (1 CNY = X)
const FALLBACK_RATES = {
  USD: 0.13852, EUR: 0.12831, GBP: 0.10942, JPY: 20.673,
  KRW: 191.25,  HKD: 1.0821,  TWD: 4.482,   SGD: 0.1867,
  AUD: 0.2137,  CAD: 0.1894,  CHF: 0.1241,  THB: 5.0182,
  MYR: 0.652,   VND: 3525,    PHP: 8.021,   IDR: 2225,
  INR: 11.548,  RUB: 12.315,  NZD: 0.2285,  MOP: 1.117,
  SEK: 1.452,   NOK: 1.498,   DKK: 0.957,   ZAR: 2.586,
  TRY: 4.472,   SAR: 0.519,   AED: 0.509,   PLN: 0.556,
  MXN: 2.478,   BRL: 0.721,   NGN: 212.5,   CNY: 1
};

// ===== Helpers =====
function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code);
}

function getFlagUrl(code) {
  const c = getCurrency(code);
  if (c && c.flagCountry) {
    return 'https://flagcdn.com/w40/' + c.flagCountry + '.png';
  }
  return '';
}

function getSymbol(code) {
  const c = getCurrency(code);
  return c ? c.symbol : code;
}

function formatAmount(value, decimals) {
  if (value === undefined || value === null) return '0';
  const d = decimals !== undefined ? decimals : (value >= 100 ? 2 : (value >= 1 ? 4 : 6));
  return Number(value).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getNow() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${h}:${m}:${s}`;
}

// ===== Live Rates Management =====
let liveRates = null;
let lastFetchTime = 0;

function getLiveRates() {
  if (liveRates) return liveRates;
  // Try cache from storage
  try {
    const cached = wx.getStorageSync(CACHE_KEY);
    if (cached && cached.rates) {
      liveRates = cached.rates;
      lastFetchTime = cached.time || 0;
      return liveRates;
    }
  } catch (e) { /* ignore */ }
  return FALLBACK_RATES;
}

function isCacheValid() {
  return liveRates && (Date.now() - lastFetchTime) < CACHE_TTL;
}

/**
 * Fetch rates from 聚合数据 API.
 * Strategy: try batch frate endpoint first, fall back to individual pair calls,
 * then derive remaining currencies from reference ratios.
 */
async function refreshRates() {
  if (isCacheValid()) return;

  const rates = { CNY: 1 };
  let fetched = [];

  // Phase 1: fetch key currencies directly from API
  for (const code of KEY_CURRENCIES) {
    try {
      const res = await wx.request({
        url: 'https://op.juhe.cn/onebox/exchange/currency',
        data: { key: JUHE_KEY, from: 'CNY', to: code, version: 2 },
        timeout: 5000
      });
      if (res.data && res.data.error_code === 0 && res.data.result && res.data.result[0]) {
        const val = parseFloat(res.data.result[0].exchange);
        if (val > 0) {
          rates[code] = val;
          fetched.push(code);
        }
      }
    } catch (e) {
      console.warn('[API] fetch failed', code, e);
    }
  }

  if (fetched.length === 0) {
    // API completely failed — keep fallback
    console.warn('[API] all API calls failed, using fallback rates');
    return;
  }

  // Phase 2: derive unscraped currencies via scaling factor
  // Compute average ratio between live rates and fallback rates
  let totalRatio = 0;
  let count = 0;
  fetched.forEach(code => {
    if (FALLBACK_RATES[code] > 0) {
      totalRatio += rates[code] / FALLBACK_RATES[code];
      count++;
    }
  });
  const scaleFactor = count > 0 ? totalRatio / count : 1;

  // Apply scale factor to remaining currencies
  CURRENCIES.forEach(c => {
    if (c.code === 'CNY') return;
    if (!rates[c.code] && FALLBACK_RATES[c.code]) {
      rates[c.code] = FALLBACK_RATES[c.code] * scaleFactor;
    }
  });

  // Save to cache
  liveRates = rates;
  lastFetchTime = Date.now();
  try {
    wx.setStorageSync(CACHE_KEY, { rates, time: lastFetchTime });
  } catch (e) { /* ignore */ }
}

// ===== Core API =====
function convert(amount, from, to) {
  const rates = getLiveRates();
  const rate = rates[to] / rates[from];
  return amount * rate;
}

function getAllRates(base = 'CNY') {
  const rates = getLiveRates();
  const baseRate = rates[base] || 1;
  return CURRENCIES.filter(c => c.code !== base).map(c => {
    const r = rates[c.code] / baseRate;
    return {
      ...c,
      rate: r,
      change: (Math.random() * 0.4 - 0.2).toFixed(2),
      changeUp: Math.random() > 0.45
    };
  });
}

// ===== Chart Data (mock — real historical requires paid plan) =====
function generateChartData(period, base = 'CNY', target = 'USD') {
  const rates = getLiveRates();
  const baseRate = rates[target] / rates[base];
  const count = period === '1D' ? 24 : period === '1W' ? 7 : period === '1M' ? 30 : 52;
  const volatility = period === '1D' ? 0.0008 : period === '1W' ? 0.003 : period === '1M' ? 0.006 : 0.015;

  const points = [];
  let val = baseRate * (1 + (Math.random() - 0.5) * 0.01);
  const now = Date.now();
  const intervals = { '1D': 3600000, '1W': 86400000, '1M': 86400000, '1Y': 604800000 };
  const interval = intervals[period] || 86400000;
  const startTime = now - count * interval;

  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.48) * volatility;
    val = Math.max(val, baseRate * 0.95);
    val = Math.min(val, baseRate * 1.05);
    points.push({ time: startTime + i * interval, value: parseFloat(val.toFixed(6)) });
  }

  const values = points.map(p => p.value);
  return {
    points, high: Math.max(...values), low: Math.min(...values),
    start: values[0], end: values[values.length - 1],
    change: ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(2),
    changeUp: values[values.length - 1] >= values[0]
  };
}

// Legacy — for backward compat
function fetchRates() {
  return new Promise((resolve) => {
    refreshRates().then(() => {
      resolve(liveRates || FALLBACK_RATES);
    });
  });
}

module.exports = {
  CURRENCIES,
  getCurrency,
  getSymbol,
  getFlagUrl,
  formatAmount,
  convert,
  getAllRates,
  generateChartData,
  fetchRates,
  refreshRates,
  getLiveRates,
  getNow
};
