/**
 * budget.js — Блок Д. Смета на одну площадку и итог за все площадки.
 * Количества берутся из результатов calc.js (Блок А) и scheme.js (Блок В).
 */
(function () {
  'use strict';

  const C = window.APP_CONFIG;
  const App = window.App;

  function quantityFor(id, ctx) {
    switch (id) {
      case 'containerGreen':  return ctx.greenPerSite;
      case 'containerOrange': return ctx.orangePerSite;
      // педальные крышки есть только на открытой площадке
      case 'pedal':           return ctx.closed ? 0 : ctx.containersPerSite;
      // площадь основания из Блока В, округляем до 0.01 м² —
      // иначе qty*price не сойдётся с тем, что видит пользователь
      case 'base':            return Math.round(ctx.area * 100) / 100;
      case 'fence':           return Math.round(ctx.perimeter * 100) / 100;
      case 'gate':            return ctx.closed ? C.budget.perSite.gate : 0;
      case 'kgo':             return C.limits.kgoPerSite;
      case 'lighting':        return C.budget.perSite.lighting;
      case 'sign':            return C.budget.perSite.sign;
      default:                return 0;
    }
  }

  function compute(input) {
    input = input || {};
    const calc = input.calc || {};
    const scheme = input.scheme || {};

    const sites = Math.max(1, Math.floor(Number(calc.sites) || 1));
    const ctx = {
      closed: input.siteType === 'closed',
      greenPerSite: Math.max(0, Math.floor(Number(calc.greenPerSite) || 0)),
      orangePerSite: Math.max(0, Math.floor(Number(calc.orangePerSite) || 0)),
      containersPerSite: Math.max(0, Math.floor(Number(calc.totalPerSite) || 0)),
      area: Math.max(0, Number(scheme.area) || 0),
      perimeter: Math.max(0, Number(scheme.perimeter) || 0)
    };

    const rows = [];
    let materials = 0;

    C.budget.items.forEach(function (item) {
      if (item.id === 'installation') return;

      const qty = quantityFor(item.id, ctx);
      const sum = item.price == null ? 0 : Math.round(qty * item.price);
      materials += sum;

      rows.push({
        id: item.id,
        name: item.name,
        unit: item.unit,
        qty,
        price: item.price,
        isEstimate: !!item.isEstimate,
        sum
      });
    });

    // монтаж — процент от материалов
    const installation = Math.round(materials * C.budget.installationPercent / 100);
    rows.push({
      id: 'installation',
      name: 'Монтаж',
      unit: '%',
      qty: C.budget.installationPercent,
      price: null,
      sum: installation
    });

    const cost = materials + installation;
    const markup = Math.round(cost * C.budget.markupPercent / 100);
    const total = cost + markup;

    return {
      rows,
      sites,
      installationPercent: C.budget.installationPercent,
      cost,
      markup,
      markupPercent: C.budget.markupPercent,
      total,
      totalAll: total * sites
    };
  }

  App.Budget = { compute };
})();