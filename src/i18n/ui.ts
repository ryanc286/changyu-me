import copy from './copy.json';
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

/* All copy lives in copy.json (synced with Notion). One entry per key, both languages. */

type Entry = { key: string; en: string; 'zh-tw': string };
const table = new Map((copy as Entry[]).map((e) => [e.key, e]));

export type UIKey = string;

export const t = (lang: Lang, key: UIKey): string => {
  const e = table.get(key);
  if (!e) throw new Error(`Missing copy key: ${key}`);
  // Empty Chinese falls back to English; an empty English stays empty (e.g. no result yet)
  return (lang === 'zh-tw' && e['zh-tw']) || e.en;
};

/* Optional text: returns '' instead of failing when the key is missing */
export const tOpt = (lang: Lang, key: UIKey): string => (table.has(key) ? t(lang, key) : '');

/* Path helpers: English has no prefix, Chinese is under /zh-tw */
export const localizePath = (lang: Lang, path: string): string => {
  const clean = path === '/' ? '' : path;
  return lang === defaultLang ? path || '/' : `/zh-tw${clean}`;
};

export const getLangFromUrl = (url: URL): Lang =>
  url.pathname === '/zh-tw' || url.pathname.startsWith('/zh-tw/') ? 'zh-tw' : 'en';
