/*
  All interface text in both languages.
  English is the default; Traditional Chinese (Taiwan) lives under /zh-tw.
*/
export const languages = {
  en: { label: 'EN', htmlLang: 'en', ogLocale: 'en_US', name: 'English' },
  'zh-tw': { label: '中', htmlLang: 'zh-Hant-TW', ogLocale: 'zh_TW', name: '繁體中文' },
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'meta.title': 'Chang Yu · Product Designer',
    'meta.description':
      'Senior Product Designer making complex things clear. Fintech at PayPay, growth at Carousell.',
    'section.work': 'Work',
    'section.tools': 'Tools I build',
    'footer.nav': 'Elsewhere',
    'footer.resume': 'Resume',
    'theme.label': 'Dark mode',
    'lang.switch': 'Language',
    'org.paypay': "Japan's largest mobile payment app",
    'org.carousell': 'Marketplace app across Southeast Asia and Taiwan',
    'org.aapd': 'Taiwan community for product builders',
    'preview.cover': 'cover',
  },
  'zh-tw': {
    'meta.title': 'Chang Yu · 產品設計師',
    'meta.description': '資深產品設計師，擅長把複雜的事情變清楚。曾任職 PayPay 與 Carousell。',
    'section.work': '作品',
    'section.tools': '我做的工具',
    'footer.nav': '其他連結',
    'footer.resume': '履歷',
    'theme.label': '深色模式',
    'lang.switch': '語言',
    'org.paypay': '日本最大的行動支付 App',
    'org.carousell': '橫跨東南亞與台灣的交易平台',
    'org.aapd': '台灣的產品人社群',
    'preview.cover': '封面',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];

export const t = (lang: Lang, key: UIKey): string => ui[lang][key] ?? ui[defaultLang][key];

/* Path helpers: English has no prefix, Chinese is under /zh-tw */
export const localizePath = (lang: Lang, path: string): string => {
  const clean = path === '/' ? '' : path;
  return lang === defaultLang ? path || '/' : `/zh-tw${clean}`;
};

export const getLangFromUrl = (url: URL): Lang =>
  url.pathname === '/zh-tw' || url.pathname.startsWith('/zh-tw/') ? 'zh-tw' : 'en';
