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
  key: string; // used for copy keys: company.<key>.summary and org.<key>
}

export const companies: Company[] = [
  {
    name: 'PayPay',
    key: 'paypay',
    order: 1,
    href: 'https://paypay.ne.jp/',
    logo: 'paypay',
    logoWidth: 120,
    logoHeight: 30,
  },
  {
    name: 'Carousell',
    key: 'carousell',
    order: 2,
    href: 'https://carousell.com/',
    logo: 'carousell',
    logoWidth: 405,
    logoHeight: 80,
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
