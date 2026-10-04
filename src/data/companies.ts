/*
  Companies shown in the Work section, top to bottom by `order`.
  A case belongs to a company when its `company` field matches `name`.
*/
export interface Company {
  name: string;
  order: number;
  href: string;
  logo: string; // base name in /public/images/logos
  logoWidth: number;
  logoHeight: number;
  logoDisplayHeight?: number;
  summary: { en: string; 'zh-tw': string };
}

export const companies: Company[] = [
  {
    name: 'PayPay',
    order: 1,
    href: 'https://paypay.ne.jp/',
    logo: 'paypay',
    logoWidth: 120,
    logoHeight: 30,
    summary: {
      en: 'I design how money moves in and out of the wallet for 65M+ users, from top-ups to ATMs to card payments.',
      'zh-tw': '我負責設計錢怎麼進出 PayPay 錢包，從加值、ATM 到信用卡付款，服務超過 6,500 萬位使用者。',
    },
  },
  {
    name: 'Carousell',
    order: 2,
    href: 'https://carousell.com/',
    logo: 'carousell',
    logoWidth: 405,
    logoHeight: 80,
    summary: {
      en: 'I worked on growth and engagement across Taiwan and Singapore, from the first sign-up to the notifications that bring people back.',
      'zh-tw': '我在台灣和新加坡市場負責成長與互動，從第一次註冊，到讓使用者回來的通知。',
    },
  },
];

export const aapd = {
  name: 'AAPD',
  href: 'https://aapd.com.tw/',
  logo: 'aapd',
  logoWidth: 161,
  logoHeight: 31,
  logoDisplayHeight: 15,
};
