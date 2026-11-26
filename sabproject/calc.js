/**
 * calc.js — Блок А. Расчёт количества контейнеров.
 */
(function () {
  'use strict';

  const C = window.APP_CONFIG;
  const App = (window.App = window.App || {});

  const nf0 = new Intl.NumberFormat(C.meta.locale, { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat(C.meta.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  App.Utils = {
    num(value, digits) {
      const v = Number(value);
      if (!Number.isFinite(v)) return '—';
      return digits === 2 ? nf2.format(v) : nf0.format(v);
    },

    money(value) {
      const v = Number(value);
      if (!Number.isFinite(v)) return '—';
      return nf0.format(Math.round(v)) + ' ' + C.meta.currency;
    },

    plural(n, one, few, many) {
      const abs = Math.abs(Math.round(Number(n))) % 100;
      const last = abs % 10;
      if (abs > 10 && abs < 20) return many;
      if (last === 1) return one;
      if (last >= 2 && last <= 4) return few;
      return many;
    }
  };

  function parseResidents(raw) {
    const value = String(raw == null ? '' : raw).trim();

    if (value === '') return { ok: false, error: 'Введите число жителей.' };
    if (!/^\d+$/.test(value)) {
      return { ok: false, error: 'Только целое число без букв, точек и знаков.' };
    }

    const n = Number(value);
    if (!Number.isSafeInteger(n)) return { ok: false, error: 'Слишком большое число.' };
    if (n < C.validation.residentsMin) {
      return { ok: false, error: 'Минимальное число жителей — ' + C.validation.residentsMin + '.' };
    }
    if (n > C.validation.residentsMax) {
      return { ok: false, error: 'Максимум для расчёта — ' + C.validation.residentsMax + ' жителей.' };
    }

    return { ok: true, value: n };
  }

  function compute(input) {
    input = input || {};

    let residents = Number(input.residents);
    if (!Number.isFinite(residents) || residents < C.validation.residentsMin) {
      residents = C.defaults.residents;
    }
    residents = Math.min(
      Math.max(Math.round(residents), C.validation.residentsMin),
      C.validation.residentsMax
    );

    const isRso = !!input.isRso;
    const season = input.season === 'winter' ? 'winter' : 'summer';
    const daysBetween = C.waste.daysBetween[season];

    // суточный объём = жители × норматив / 365
    const dailyVolume = residents * C.waste.normPerCapitaYear / C.waste.daysPerYear;
    // объём между вывозами = суточный × дни × коэффициент запаса
    const volumeBetween = dailyVolume * daysBetween * C.waste.reserveFactor;

    const totalContainers = Math.max(
      C.waste.minContainers,
      Math.ceil(volumeBetween / C.waste.containerVolume)
    );

    // РСО: 30% оранжевых, остальное — зелёные (округление вверх).
    const orangeTotal = isRso ? Math.ceil(totalContainers * C.waste.rsoShare) : 0;
    const greenTotal = totalContainers - orangeTotal;

    const limitTotal = isRso ? C.limits.maxContainersRso : C.limits.maxContainersNoRso;
    const limitOrange = C.limits.maxOrange;

    const exceedsLimit = totalContainers > limitTotal || orangeTotal > limitOrange;

    // Минимум площадок, чтобы контейнеры влезли в лимиты.
    let sites = 1;
    if (exceedsLimit) {
      sites = Math.max(
        1,
        Math.ceil(totalContainers / limitTotal),
        orangeTotal > 0 ? Math.ceil(orangeTotal / limitOrange) : 1
      );
    }

    // Делим поровну с округлением вверх; если после округления площадка
    // снова не влезает в лимит — добавляем ещё площадку.
    let greenPerSite = greenTotal;
    let orangePerSite = orangeTotal;
    for (let guard = 0; guard < 1000; guard += 1) {
      greenPerSite = Math.ceil(greenTotal / sites);
      orangePerSite = Math.ceil(orangeTotal / sites);
      if (greenPerSite + orangePerSite <= limitTotal && orangePerSite <= limitOrange) break;
      sites += 1;
    }

    const totalPerSite = greenPerSite + orangePerSite;
    const installedTotal = totalPerSite * sites;

    let limitMessage = '';
    if (sites > 1) {
      const sitesWord = App.Utils.plural(sites, 'площадка', 'площадки', 'площадок');
      limitMessage = 'Превышен лимит ТЗ на одну площадку. Нужно ' +
        sites + ' ' + sitesWord + ' (контейнеры разделены поровну).';
    }

    const limitDetails = [];
    if (totalContainers > limitTotal) {
      limitDetails.push('Расчётных контейнеров: ' + totalContainers +
        ', лимит на площадку: ' + limitTotal + '.');
    }
    if (orangeTotal > limitOrange) {
      limitDetails.push('Оранжевых: ' + orangeTotal +
        ', лимит на площадку: ' + limitOrange + '.');
    }

    return {
      isRso, daysBetween, volumeBetween, totalContainers,
      kgoPerSite: C.limits.kgoPerSite,
      sites, exceedsLimit, limitMessage, limitDetails,
      greenPerSite, orangePerSite, totalPerSite, installedTotal
    };
  }

  App.Calc = { parseResidents, compute };
})();