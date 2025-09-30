export type Lang = 'sr' | 'en';

type Dict = Record<string, string>;

const dict: Record<Lang, Dict> = {
  sr: {
    subtitle: 'Калкулатор рамова за слике',
    paintingDimensions: 'Димензије слике',
    widthCm: 'Ширина (cm)',
    heightCm: 'Висина (cm)',
    layers: 'Слојеви',
    paspartu: 'Паспарту',
    add: 'Додај',
    frame: 'Рам',
    secondFrame: 'Други рам',
    unitPrice: 'Цена по m',
    wasteKerf: 'Отпад / Рез',
    applyToAll: 'Примени на све',
    wastePercentLabel: 'Отпад (%) [3.0–5.0]',
    summary: 'Сажетак',
    item: 'Ставка',
    sizeCm: 'Величина (cm)',
    lengthCm: 'Дужина (cm)',
    price: 'Цена',
    grandTotal: 'Укупно',
    getMobileApp: 'Преузми мобилну апликацију',
    required: 'обавезно',
    ok: 'ок',
    iosAppStore: 'iOS App Store',
    androidPlayStore: 'Android Play Store',
    paintingLine: 'Слика: {w} × {h} cm',
    wasteApplied: 'Примењен отпад: {p}%',
    egNumber: 'нпр. {n}',
  },
  en: {
    subtitle: 'Painting frame calculator',
    paintingDimensions: 'Painting dimensions',
    widthCm: 'Width (cm)',
    heightCm: 'Height (cm)',
    layers: 'Layers',
    paspartu: 'Paspartu',
    add: 'Add',
    frame: 'Frame',
    secondFrame: 'Second frame',
    unitPrice: 'Unit price',
    wasteKerf: 'Waste / Kerf',
    applyToAll: 'Apply to all',
    wastePercentLabel: 'Waste (%) [3.0–5.0]',
    summary: 'Summary',
    item: 'Item',
    sizeCm: 'Size (cm)',
    lengthCm: 'Length (cm)',
    price: 'Price',
    grandTotal: 'Grand total',
    getMobileApp: 'Get the mobile app',
    required: 'required',
    ok: 'ok',
    iosAppStore: 'iOS App Store',
    androidPlayStore: 'Android Play Store',
    paintingLine: 'Painting: {w} × {h} cm',
    wasteApplied: 'Waste applied: {p}%',
    egNumber: 'e.g. {n}',
  },
};

let current: Lang = 'sr';

export function setLang(lang: Lang) {
  current = lang;
}

export function t(key: keyof typeof dict['sr'], vars?: Record<string, string | number>): string {
  const table = dict[current] || dict.sr;
  let s = table[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`{${k}}`, 'g'), String(v));
    }
  }
  return s;
}

const i18n = { t, setLang };
export default i18n;
