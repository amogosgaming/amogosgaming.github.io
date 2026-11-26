/**
 * check.js — Блок Г. Санитарные расстояния, проезд, чек-лист из ТЗ.
 */
(function () {
  'use strict';

  const C = window.APP_CONFIG;
  const App = window.App;
  const softPercent = Math.round(C.distances.softTolerance * 100);

  function fmtM(value) {
    return App.Utils.num(value, Number.isInteger(value) ? 0 : 2);
  }

  // allowSoft === true только в режиме без РСО (ТЗ, п. 2).
  function evaluateDistance(options) {
    const { id, label, value, min, max } = options;
    const required = options.required !== false;
    const allowSoft = !!options.allowSoft;

    if (value == null) {
      return required
        ? { id, label, status: 'fail', message: 'Укажите расстояние — без него проверка невозможна.' }
        : { id, label, status: 'skip', message: 'Поле не заполнено — проверка не выполняется.' };
    }

    if (!Number.isFinite(value) || value < 0) {
      return { id, label, status: 'fail', message: 'Некорректное расстояние: нужно неотрицательное число.' };
    }

    if (max != null && value > max) {
      return {
        id, label, status: 'fail',
        message: fmtM(value) + ' м — больше ' + max + ' м. Слишком далеко от жителей.'
      };
    }

    if (value >= min) {
      const range = max != null ? min + '–' + max + ' м' : 'от ' + min + ' м';
      let message = fmtM(value) + ' м — в пределах нормы (' + range + ').';
      if (max == null && value > C.distances.max) {
        message += ' Верхний предел ' + C.distances.max + ' м для медорганизации не применяется.';
      }
      return { id, label, status: 'ok', message };
    }

    // Ниже минимума: послабление только без РСО.
    const softMin = min * (1 - C.distances.softTolerance);
    if (allowSoft && value + 1e-9 >= softMin) {
      return {
        id, label, status: 'warn',
        message: fmtM(value) + ' м — меньше минимума ' + min +
          ' м, но не более чем на ' + softPercent + '%. ' +
          'Допустимо только после санитарной оценки заявки.'
      };
    }

    let message = fmtM(value) + ' м — меньше минимума ' + min + ' м.';
    if (!allowSoft) {
      message += ' В режиме с РСО послабление ' + softPercent + '% не применяется.';
    }
    return { id, label, status: 'fail', message };
  }

  function evaluate(input) {
    input = input || {};
    const isRso = !!input.isRso;
    const siteType = input.siteType === 'closed' ? 'closed' : 'open';
    const allowSoft = !isRso;

    const houseMin = isRso ? C.distances.house.rso : C.distances.house.noRso;
    const playgroundMin = isRso ? C.distances.playground.rso : C.distances.playground.noRso;
    const medicalMin = isRso ? C.distances.medical.rso : C.distances.medical.noRso;

    const items = [
      evaluateDistance({
        id: 'house',
        label: 'До ближайшего жилого дома',
        value: input.houseDistance,
        min: houseMin,
        max: C.distances.max,
        allowSoft,
        required: true
      }),
      evaluateDistance({
        id: 'playground',
        label: 'До детской / спортивной площадки',
        value: input.playgroundDistance,
        min: playgroundMin,
        max: C.distances.max,
        allowSoft,
        required: true
      }),
      evaluateDistance({
        id: 'medical',
        label: 'До медицинской организации',
        value: input.medicalDistance,
        min: medicalMin,
        max: null, // верхний предел 100 м сюда не применяется
        allowSoft,
        required: C.distances.medical.required
      }),
      {
        id: 'turnaround',
        label: 'Сквозной проезд или разворотная площадка ' +
          C.access.turnaroundSide + '×' + C.access.turnaroundSide + ' м',
        status: input.turnaround ? 'ok' : 'fail',
        message: input.turnaround
          ? 'Подтверждено.'
          : 'Не подтверждено: без проезда/разворота площадка не соответствует ТЗ.'
      },
      {
        id: 'accessFree',
        label: 'Подъезд свободен: нет парковки, бордюров, деревьев',
        status: input.accessFree ? 'ok' : 'fail',
        message: input.accessFree
          ? 'Подтверждено.'
          : 'Не подтверждено: подъезд может быть заблокирован.'
      }
    ];

    C.checklist.forEach(function (entry) {
      if (entry.appliesTo === 'open' && siteType !== 'open') {
        items.push({
          id: 'check-' + entry.id,
          label: entry.label,
          status: 'skip',
          message: 'Не применяется для закрытой площадки.'
        });
        return;
      }

      const checked = !!(input.checklist && input.checklist[entry.id]);
      items.push({
        id: 'check-' + entry.id,
        label: entry.label,
        status: checked ? 'ok' : 'fail',
        message: checked
          ? 'Подтверждено.'
          : 'Пункт не подтверждён — отметьте после фактической проверки.'
      });
    });

    const applicable = items.filter(function (i) { return i.status !== 'skip'; });
    const passed = items.filter(function (i) { return i.status === 'ok'; }).length;
    const fails = items.filter(function (i) { return i.status === 'fail'; });
    const warns = items.filter(function (i) { return i.status === 'warn'; });

    const status = fails.length > 0 ? 'fail' : warns.length > 0 ? 'warn' : 'ok';
    const statusLabel = status === 'ok'
      ? 'Соответствует ТЗ'
      : status === 'warn' ? 'Требует санитарной оценки' : 'Есть нарушения';

    const complianceText = 'Площадка соответствует ТЗ: ' + passed + ' из ' + applicable.length;

    const normHint =
      'Дом и детская площадка: ' + houseMin + '–' + C.distances.max + ' м. ' +
      'Медорганизация: от ' + medicalMin + ' м. ' +
      (isRso
        ? 'РСО включён: послабление ' + softPercent + '% не применяется.'
        : 'РСО выключен: допускается послабление ' + softPercent + '% после санитарной оценки.');

    const issues = items.filter(function (i) {
      return i.status === 'fail' || i.status === 'warn';
    });

    return { status, statusLabel, complianceText, normHint, issues };
  }

  App.Check = { evaluate };
})();