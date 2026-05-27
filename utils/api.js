/**
 * Exchange rate data and API service
 * MVP uses mock data; replace fetchRates() with real API call
 */

// 32 supported currencies
const CURRENCIES = [
  { code: 'USD', name: '美元', full: 'US Dollar', flag: '\u{1F1FA}\u{1F1F8}', symbol: '$' },
  { code: 'EUR', name: '欧元', full: 'Euro', flag: '\u{1F1EA}\u{1F1FA}', symbol: '€' },
  { code: 'GBP', name: '英镑', full: 'British Pound', flag: '\u{1F1EC}\u{1F1E7}', symbol: '£' },
  { code: 'JPY', name: '日元', full: 'Japanese Yen', flag: '\u{1F1EF}\u{1F1F5}', symbol: '¥' },
  { code: 'KRW', name: '韩元', full: 'South Korean Won', flag: '\u{1F1F0}\u{1F1F7}', symbol: '₩' },
  { code: 'HKD', name: '港币', full: 'Hong Kong Dollar', flag: '\u{1F1ED}\u{1F1F0}', symbol: 'HK$' },
  { code: 'TWD', name: '新台币', full: 'Taiwan Dollar', flag: '\u{1F1F9}\u{1F1FC}', symbol: 'NT$' },
  { code: 'SGD', name: '新加坡元', full: 'Singapore Dollar', flag: '\u{1F1F8}\u{1F1EC}', symbol: 'S$' },
  { code: 'AUD', name: '澳元', full: 'Australian Dollar', flag: '\u{1F1E6}\u{1F1FA}', symbol: 'A$' },
  { code: 'CAD', name: '加元', full: 'Canadian Dollar', flag: '\u{1F1E8}\u{1F1E6}', symbol: 'C$' },
  { code: 'CHF', name: '瑞士法郎', full: 'Swiss Franc', flag: '\u{1F1E8}\u{1F1ED}', symbol: 'Fr' },
  { code: 'THB', name: '泰铢', full: 'Thai Baht', flag: '\u{1F1F9}\u{1F1ED}', symbol: '฿' },
  { code: 'MYR', name: '马来西亚林吉特', full: 'Malaysian Ringgit', flag: '\u{1F1F2}\u{1F1FE}', symbol: 'RM' },
  { code: 'VND', name: '越南盾', full: 'Vietnamese Dong', flag: '\u{1F1FB}\u{1F1F3}', symbol: '₫' },
  { code: 'PHP', name: '菲律宾比索', full: 'Philippine Peso', flag: '\u{1F1F5}\u{1F1ED}', symbol: '₱' },
  { code: 'IDR', name: '印尼盾', full: 'Indonesian Rupiah', flag: '\u{1F1EE}\u{1F1E9}', symbol: 'Rp' },
  { code: 'INR', name: '印度卢比', full: 'Indian Rupee', flag: '\u{1F1EE}\u{1F1F3}', symbol: '₹' },
  { code: 'RUB', name: '俄罗斯卢布', full: 'Russian Ruble', flag: '\u{1F1F7}\u{1F1FA}', symbol: '₽' },
  { code: 'NZD', name: '新西兰元', full: 'New Zealand Dollar', flag: '\u{1F1F3}\u{1F1FF}', symbol: 'NZ$' },
  { code: 'MOP', name: '澳门元', full: 'Macanese Pataca', flag: '\u{1F1F2}\u{1F1F4}', symbol: 'MOP$' },
  { code: 'SEK', name: '瑞典克朗', full: 'Swedish Krona', flag: '\u{1F1F8}\u{1F1EA}', symbol: 'kr' },
  { code: 'NOK', name: '挪威克朗', full: 'Norwegian Krone', flag: '\u{1F1F3}\u{1F1F4}', symbol: 'kr' },
  { code: 'DKK', name: '丹麦克朗', full: 'Danish Krone', flag: '\u{1F1E9}\u{1F1F0}', symbol: 'kr' },
  { code: 'ZAR', name: '南非兰特', full: 'South African Rand', flag: '\u{1F1FF}\u{1F1E6}', symbol: 'R' },
  { code: 'TRY', name: '土耳其里拉', full: 'Turkish Lira', flag: '\u{1F1F9}\u{1F1F7}', symbol: '₺' },
  { code: 'SAR', name: '沙特里亚尔', full: 'Saudi Riyal', flag: '\u{1F1F8}\u{1F1E6}', symbol: '﷼' },
  { code: 'AED', name: '阿联酋迪拉姆', full: 'UAE Dirham', flag: '\u{1F1E6}\u{1F1EA}', symbol: 'د.إ' },
  { code: 'PLN', name: '波兰兹罗提', full: 'Polish Zloty', flag: '\u{1F1F5}\u{1F1F1}', symbol: 'zł' },
  { code: 'MXN', name: '墨西哥比索', full: 'Mexican Peso', flag: '\u{1F1F2}\u{1F1FD}', symbol: 'MX$' },
  { code: 'BRL', name: '巴西雷亚尔', full: 'Brazilian Real', flag: '\u{1F1E7}\u{1F1F7}', symbol: 'R$' },
  { code: 'NGN', name: '尼日利亚奈拉', full: 'Nigerian Naira', flag: '\u{1F1F3}\u{1F1EC}', symbol: '₦' },
  { code: 'CNY', name: '人民币', full: 'Chinese Yuan', flag: '\u{1F1E8}\u{1F1F3}', symbol: '¥' }
];

// Rates based on 1 CNY
const BASE_RATES = {
  USD: 0.13852, EUR: 0.12831, GBP: 0.10942, JPY: 20.673,
  KRW: 191.25,  HKD: 1.0821,  TWD: 4.482,   SGD: 0.1867,
  AUD: 0.2137,  CAD: 0.1894,  CHF: 0.1241,  THB: 5.0182,
  MYR: 0.652,   VND: 3525,    PHP: 8.021,   IDR: 2225,
  INR: 11.548,  RUB: 12.315,  NZD: 0.2285,  MOP: 1.117,
  SEK: 1.452,   NOK: 1.498,   DKK: 0.957,   ZAR: 2.586,
  TRY: 4.472,   SAR: 0.519,   AED: 0.509,   PLN: 0.556,
  MXN: 2.478,   BRL: 0.721,   NGN: 212.5,   CNY: 1
};

function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code);
}

function getSymbol(code) {
  const c = getCurrency(code);
  return c ? c.symbol : code;
}

function formatAmount(value, decimals) {
  if (value === undefined || value === null) return '0';
  const d = decimals !== undefined ? decimals : (value >= 100 ? 2 : (value >= 1 ? 4 : 6));
  return value.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function convert(amount, from, to) {
  const rate = BASE_RATES[to] / BASE_RATES[from];
  return amount * rate;
}

function getAllRates(base = 'CNY') {
  const baseRate = BASE_RATES[base] || 1;
  return CURRENCIES.filter(c => c.code !== base).map(c => ({
    ...c,
    rate: BASE_RATES[c.code] / baseRate,
    change: (Math.random() * 0.4 - 0.2).toFixed(2),
    changeUp: Math.random() > 0.45
  }));
}

// Mock chart data generator
function generateChartData(period, base = 'CNY', target = 'USD') {
  const baseRate = BASE_RATES[target] / BASE_RATES[base];
  const count = period === '1D' ? 24 : period === '1W' ? 7 : period === '1M' ? 30 : 52;
  const volatility = period === '1D' ? 0.0008 : period === '1W' ? 0.003 : period === '1M' ? 0.006 : 0.015;

  const points = [];
  let val = baseRate * (1 + (Math.random() - 0.5) * 0.01);

  const now = Date.now();
  const intervals = {
    '1D': 3600000,      // 1 hour
    '1W': 86400000,     // 1 day
    '1M': 86400000,     // 1 day
    '1Y': 604800000     // 1 week
  };
  const interval = intervals[period] || 86400000;
  const startTime = now - count * interval;

  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.48) * volatility;
    val = Math.max(val, baseRate * 0.95);
    val = Math.min(val, baseRate * 1.05);
    points.push({
      time: startTime + i * interval,
      value: parseFloat(val.toFixed(6))
    });
  }

  const values = points.map(p => p.value);
  const high = Math.max(...values);
  const low = Math.min(...values);
  const start = values[0];
  const end = values[values.length - 1];
  const change = ((end - start) / start * 100).toFixed(2);

  return { points, high, low, start, end, change, changeUp: change >= 0 };
}

// Mock fetch — replace with real API
function fetchRates() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rates = {};
      CURRENCIES.forEach(c => {
        if (c.code !== 'CNY') {
          const jitter = 1 + (Math.random() - 0.5) * 0.002;
          rates[c.code] = BASE_RATES[c.code] * jitter;
        }
      });
      rates.CNY = 1;
      resolve(rates);
    }, 200);
  });
}

module.exports = {
  CURRENCIES,
  BASE_RATES,
  getCurrency,
  getSymbol,
  formatAmount,
  convert,
  getAllRates,
  generateChartData,
  fetchRates
};
