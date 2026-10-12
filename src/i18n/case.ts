/*
  Small interface words inside case study components, in both languages.
  Components read the language from the page URL, so MDX doesn't need to pass it.
*/
import { getLangFromUrl, type Lang } from './ui';

const text = {
  en: {
    before: 'Before',
    after: 'After',
    steps: (n: number) => `${n} steps`,
    compareFlows: 'Compare the flows',
    dragScreens: 'Drag to compare the old and new screens',
    dragFlows: 'Drag to compare the old and new flows',
    scrollPhone: 'Scroll inside the phone',
    flowSteps: 'Steps in the flow',
    versions: 'Versions',
    hypothesis: 'Hypothesis',
    placeholder: 'Image placeholder',
  },
  'zh-tw': {
    before: '改版前',
    after: '改版後',
    steps: (n: number) => `${n} 個步驟`,
    compareFlows: '比較改版前後的流程',
    dragScreens: '拖曳比較新舊畫面',
    dragFlows: '拖曳比較新舊流程',
    scrollPhone: '在手機裡捲動',
    flowSteps: '流程步驟',
    versions: '版本',
    hypothesis: '假設',
    placeholder: '圖片預留位置',
  },
} as const;

export const caseText = (url: URL) => text[getLangFromUrl(url) as Lang];
