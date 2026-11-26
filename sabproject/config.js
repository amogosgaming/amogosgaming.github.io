/**
 * config.js — нормативы, размеры, лимиты, цены и ссылки.
 */
window.APP_CONFIG = {
  meta: {
    orgName: 'АО «Спецавтобаза»',
    footerText: 'Прототип. Расчёты по ТЗ АО «Спецавтобаза» и СанПиН 2.1.3684-21. Цены — оценочные.',
    currency: '₽',
    locale: 'ru-RU'
  },

  validation: {
    residentsMin: 1,       // ТЗ, п. 4: число жителей — целое положительное
    residentsMax: 5000,    // ТЗ: демо-диапазон до 5000 жителей
    distanceMin: 0,        // расстояние не может быть отрицательным
    distanceMax: 10000     // ДОПУЩЕНИЕ: технический предел ввода, чтобы не ловить 100000
  },

  defaults: {
    residents: 500,        // демо-значение из ТЗ
    siteType: 'open',      // 'open' | 'closed'
    isRso: true,           // демо: раздельный сбор включён
    season: 'summer',      // 'summer' | 'winter'
    houseDistance: 30,     // демо-значение для первичной отрисовки
    playgroundDistance: 50,// демо-значение для первичной отрисовки
    medicalDistance: '',   // необязательное поле
    turnaround: true,      // по умолчанию считаем, что проезд есть
    accessFree: true       // по умолчанию считаем, что подъезд свободен
  },

  waste: {
    // ДОПУЩЕНИЕ — подставить официальный норматив накопления ТКО
    // Свердловской области для МКД со ссылкой на нормативный акт.
    // В демо принято 1,9 м³ на жителя в год.
    normPerCapitaYear: 1.9,
    daysPerYear: 365,                  // календарный год
    containerVolume: 1.1,              // ТЗ, п. 4: объём евроконтейнера, м³
    rsoShare: 0.30,                    // ТЗ, п. 4: доля оранжевых контейнеров при РСО
    reserveFactor: 1.25,               // ДОПУЩЕНИЕ: коэффициент запаса
    minContainers: 1,                  // ДОПУЩЕНИЕ: минимум один контейнер на площадку
    // СанПиН 2.1.3684-21: летом — ежедневный вывоз, зимой — не реже 1 раза в 3 суток
    daysBetween: {
      summer: 1,
      winter: 3
    }
  },

  limits: {
    maxContainersNoRso: 8,   // ТЗ, п. 2: без РСО — не более 8 контейнеров на площадку
    maxContainersRso: 12,    // ТЗ, п. 2: с РСО — не более 12 контейнеров на площадку
    maxOrange: 4,            // ТЗ, п. 2: не более 4 оранжевых на площадку
    maxKgo: 2,               // ТЗ, п. 2: не более 2 бункеров/отсеков КГО
    kgoPerSite: 1            // ТЗ, п. 5: один отсек КГО на площадку
  },

  scheme: {
    // Габариты евроконтейнера 1,1 м³ по паспорту производителя:
    // 1370 × 1070 мм. ДОПУЩЕНИЕ: типовая модель, уточнить по паспорту закупки.
    containerWidth: 1.37,
    containerDepth: 1.07,
    gapBetweenContainers: 0.35, // ТЗ, п. 6: зазор между контейнерами, м
    gapBeforeKgo: 0.35,         // ТЗ, п. 6: зазор перед отсеком КГО, м
    kgoWidth: 1.5,              // ТЗ, п. 5: ширина отсека КГО, м
    fenceOffset: 0.3,           // ДОПУЩЕНИЕ: отступ от контейнера до ограждения, м
    gateWidth: 1.8,             // ДОПУЩЕНИЕ: ширина ворот закрытой площадки, м
    fenceHeight: { min: 1.0, max: 1.5, allowed: 1.8 }, // ТЗ, п. 5: 1–1,5 м, допускается до 1,8 м
    fenceSolidLow: { min: 1.0, max: 1.2 },             // ТЗ, п. 5: сплошной низ 1–1,2 м
    slopePercent: { min: 5, max: 10 },                 // ТЗ, п. 6: уклон 5–10%
    // Только оформление SVG (не нормативы):
    visual: {
      targetWidthPx: 900,          // желаемая ширина схемы до масштабирования
      minScalePxPerMeter: 55,      // ниже не уменьшаем, иначе не читаются подписи
      maxScalePxPerMeter: 110,     // выше не увеличиваем для узких схем
      margin: { top: 46, right: 100, bottom: 124, left: 24 },
      font: { small: 10, base: 12 },
      fenceStroke: 7
    }
  },

  access: {
    turnaroundSide: 12 // ТЗ, п. 3: разворотная площадка / сквозной проезд 12 × 12 м
  },

  distances: {
    softTolerance: 0.25, // ТЗ, п. 2: послабление 25% только для режима без РСО
    max: 100,            // ТЗ, п. 2: верхняя граница для жилого дома и детской площадки
    house: {
      noRso: 20,         // ТЗ, п. 2: без РСО — от 20 м
      rso: 8             // ТЗ, п. 2: с РСО — от 8 м
    },
    playground: {
      noRso: 20,         // ТЗ, п. 2: без РСО — от 20 м
      rso: 8             // ТЗ, п. 2: с РСО — от 8 м
    },
    medical: {
      noRso: 25,         // ТЗ, п. 2: без РСО — от 25 м
      rso: 10,           // ТЗ, п. 2: с РСО — от 10 м
      required: false    // поле необязательное
    }
  },

  // Статический чек-лист самопроверки из ТЗ.
  // appliesTo: 'all' — всегда; 'open' — только для открытой площадки (педальные крышки).
  checklist: [
    { id: 'surface', label: 'Твёрдое покрытие (бетон / асфальт)', appliesTo: 'all' },
    { id: 'slope', label: 'Уклон 5–10% в сторону проезжей части', appliesTo: 'all' },
    { id: 'level', label: 'В один уровень с проезжей частью', appliesTo: 'all' },
    { id: 'fenceHeight', label: 'Высота ограждения 1–1,5 м (до 1,8 м)', appliesTo: 'all' },
    { id: 'fenceSolid', label: 'Сплошной низ ограждения 1–1,2 м', appliesTo: 'all' },
    { id: 'pedal', label: 'Педальные крышки', appliesTo: 'open' },
    { id: 'marking', label: 'Маркировка владельца площадки', appliesTo: 'all' },
    { id: 'sign', label: 'Информационная табличка', appliesTo: 'all' }
  ],

  budget: {
    markupPercent: 15,        // ДОПУЩЕНИЕ: наценка подрядчика, %
    installationPercent: 18,  // ДОПУЩЕНИЕ: монтаж, % от суммы материалов
    perSite: {
      gate: 1,                // ТЗ: ворота — 1 шт. на закрытую площадку
      lighting: 1,            // ТЗ: освещение — 1 комплект на площадку
      sign: 1                 // ТЗ: информационная табличка — 1 шт. на площадку
    },
    // ДОПУЩЕНИЕ: все цены — демо, заменить на коммерческие предложения.
    // isEstimate: true включает бейдж «демо-цена» в смете.
    items: [
      { id: 'containerGreen', name: 'Евроконтейнер 1,1 м³, зелёный', unit: 'шт.', price: 12500, isEstimate: true },
      { id: 'containerOrange', name: 'Евроконтейнер сетчатый, оранжевый', unit: 'шт.', price: 14000, isEstimate: true },
      { id: 'pedal', name: 'Педальный механизм', unit: 'шт.', price: 2500, isEstimate: true },
      { id: 'base', name: 'Основание (бетон / асфальт)', unit: 'м²', price: 2200, isEstimate: true },
      { id: 'fence', name: 'Ограждение', unit: 'п.м.', price: 3500, isEstimate: true },
      { id: 'gate', name: 'Ворота', unit: 'шт.', price: 45000, isEstimate: true },
      { id: 'kgo', name: 'Отсек КГО', unit: 'шт.', price: 85000, isEstimate: true },
      { id: 'lighting', name: 'Освещение', unit: 'комплект', price: 28000, isEstimate: true },
      { id: 'sign', name: 'Информационная табличка с QR', unit: 'шт.', price: 4500, isEstimate: true },
      { id: 'installation', name: 'Монтаж (% от суммы материалов)', unit: '%', price: null }
    ]
  },

  qr: {
    defaultId: 'ЕКБ-0001',
    defaultAddress: 'ул. Сулимова, 23, Екатеринбург',
    schedule: {
      tko: {
        summer: 'Ежедневно (лето)',
        winter: 'Раз в 3 дня (зима)',
        note: 'График вывоза уточняйте у регионального оператора.'
      },
      // ДОПУЩЕНИЕ: демо-расписание, заменить на фактическое.
      kgo: {
        text: '1-е и 3-е воскресенье месяца, 09:00–18:00'
      }
    },
    rsoRules: {
      can: ['ПЭТ-бутылки', 'Флаконы и канистры', 'Пакеты и плёнка', 'Чистая упаковка'],
      cannot: ['Пищевые отходы', 'Стекло и бумага', 'Грязная упаковка', 'Опасные отходы']
    }
  },

  links: {
    // Заглушка: заменить на реальную ссылку Google Forms.
    complaintFormUrl: 'https://docs.google.com/forms/d/1BsYRQ9GtayDWIejOzcRmEQmfJdDKMej0DI1e-wmpwPg/',
    complaintIdParam: 'id' // id площадки подставляется в query-параметр формы
  },

  contacts: {
    phone: '8 800 775 00 96',
    site: 'sab-ekb.ru'
  }
};
