/**
 * scheme.js — Блок В. Габариты и SVG-схема площадки (вид сверху).
 */
(function () {
  'use strict';

  const C = window.APP_CONFIG;
  const App = window.App;
  const D = C.scheme;
  const V = D.visual;

  const COLORS = {
    base: '#f3f5f2',
    baseStroke: '#d4dad4',
    fence: '#38453c',
    post: '#28332c',
    green: '#3b7f58',
    greenLid: '#275b3f',
    orange: '#cf6a17',
    orangeLid: '#9f4d0f',
    kgoStroke: '#b08a3a',
    dim: '#4a554c',
    label: '#243027',
    slope: '#2f6b4a',
    openFront: '#b8c3ba'
  };

  function positiveInt(value) {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function compute(input) {
    input = input || {};
    const green = positiveInt(input.greenPerSite);
    const orange = positiveInt(input.orangePerSite);
    const closed = input.siteType === 'closed';
    const containers = Math.max(1, green + orange);

    // ширина = N * ширина контейнера + (N−1) * зазор + зазор до КГО + ширина КГО + 2 * отступ
    const width =
      containers * D.containerWidth +
      (containers - 1) * D.gapBetweenContainers +
      D.gapBeforeKgo +
      D.kgoWidth +
      2 * D.fenceOffset;

    const depth = D.containerDepth + 2 * D.fenceOffset;
    const area = width * depth;
    const perimeter = closed ? 2 * (width + depth) : width + 2 * depth;

    return {
      closed, green, orange, containers,
      width, depth, area, perimeter,
      fenceSides: closed ? 4 : 3
    };
  }

  function render(target, geometry) {
    if (!target || !geometry) return;

    const { green, orange, containers: n } = geometry;

    // Масштаб по ширине — чтобы подписи оставались читаемыми.
    const scale = Math.max(
      V.minScalePxPerMeter,
      Math.min(V.maxScalePxPerMeter, V.targetWidthPx / Math.max(geometry.width, 1))
    );

    const W = geometry.width * scale;
    const H = geometry.depth * scale;
    const x0 = V.margin.left;
    const y0 = V.margin.top;
    const xF = x0 + W;
    const yF = y0 + H;
    const viewW = W + V.margin.left + V.margin.right;
    const viewH = H + V.margin.top + V.margin.bottom;

    const pad = D.fenceOffset * scale;
    const cw = D.containerWidth * scale;
    const ch = D.containerDepth * scale;
    const gap = D.gapBetweenContainers * scale;
    const gapKgo = D.gapBeforeKgo * scale;
    const kgoW = D.kgoWidth * scale;
    const rowY = y0 + pad;
    const startX = x0 + pad;

    const greenSpan = green > 0 ? green * cw + (green - 1) * gap : 0;
    const orangeX = startX + (green > 0 ? greenSpan + gap : 0);
    const orangeSpan = orange > 0 ? orange * cw + (orange - 1) * gap : 0;
    const containersSpan = n * cw + (n - 1) * gap;
    const kgoX = startX + containersSpan + gapKgo;

    const p = v => Math.round(v * 100) / 100;
    const esc = v => String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const fmt = v => App.Utils.num(v, 2);

    const parts = [];
    parts.push('<style>text{font-family:Arial, Helvetica, sans-serif}</style>');

    parts.push(
      '<defs>' +
        '<marker id="dimArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
          '<path d="M0,0 L10,5 L0,10 Z" fill="' + COLORS.dim + '"></path>' +
        '</marker>' +
        '<marker id="slopeArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">' +
          '<path d="M0,0 L10,5 L0,10 Z" fill="' + COLORS.slope + '"></path>' +
        '</marker>' +
        '<pattern id="kgoHatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
          '<rect width="9" height="9" fill="#fbf7ea"></rect>' +
          '<line x1="0" y1="0" x2="0" y2="9" stroke="#c9a24a" stroke-width="2"></line>' +
        '</pattern>' +
      '</defs>'
    );

    // основание
    parts.push(
      '<rect x="' + p(x0) + '" y="' + p(y0) + '" width="' + p(W) + '" height="' + p(H) +
      '" rx="2" fill="' + COLORS.base + '" stroke="' + COLORS.baseStroke + '" stroke-width="1.4"></rect>'
    );

    // контейнеры
    const drawContainer = function (x, fill, lid, label, textColor) {
      const lidH = Math.max(6, ch * 0.16);
      return (
        '<g>' +
          '<rect x="' + p(x) + '" y="' + p(rowY) + '" width="' + p(cw) + '" height="' + p(ch) +
            '" rx="3" fill="' + fill + '" stroke="' + lid + '" stroke-width="1.2"></rect>' +
          '<rect x="' + p(x + 3) + '" y="' + p(rowY + 3) + '" width="' + p(cw - 6) + '" height="' + p(lidH) +
            '" rx="2" fill="' + lid + '" opacity="0.92"></rect>' +
          '<text x="' + p(x + cw / 2) + '" y="' + p(rowY + ch / 2 + ch * 0.08) +
            '" text-anchor="middle" font-size="' + V.font.small +
            '" font-weight="600" fill="' + textColor + '">' + esc(label) + '</text>' +
        '</g>'
      );
    };

    for (let i = 0; i < green; i += 1) {
      parts.push(drawContainer(startX + i * (cw + gap), COLORS.green, COLORS.greenLid, 'Смешанные', '#ffffff'));
    }
    for (let i = 0; i < orange; i += 1) {
      parts.push(drawContainer(orangeX + i * (cw + gap), COLORS.orange, COLORS.orangeLid, 'Пластик', '#2b1700'));
    }

    // отсек КГО
    parts.push(
      '<rect x="' + p(kgoX) + '" y="' + p(rowY) + '" width="' + p(kgoW) + '" height="' + p(ch) +
        '" rx="3" fill="url(#kgoHatch)" stroke="' + COLORS.kgoStroke +
        '" stroke-width="1.4" stroke-dasharray="6 3"></rect>' +
      '<text x="' + p(kgoX + kgoW / 2) + '" y="' + p(rowY + ch / 2 - 14) +
        '" text-anchor="middle" font-size="' + V.font.small +
        '" fill="#7a5700">Отсек</text>' +
      '<text x="' + p(kgoX + kgoW / 2) + '" y="' + p(rowY + ch / 2 + 1) +
        '" text-anchor="middle" font-size="' + (V.font.base + 1) +
        '" font-weight="800" fill="#6d4c00">КГО</text>' +
      '<text x="' + p(kgoX + kgoW / 2) + '" y="' + p(rowY + ch / 2 + 15) +
        '" text-anchor="middle" font-size="' + (V.font.small - 1) +
        '" fill="#7a5700">' + fmt(D.kgoWidth) + ' м</text>'
    );

    // подписи групп
    if (green > 0) {
      parts.push(
        '<text x="' + p(startX + greenSpan / 2) + '" y="' + p(y0 - 14) +
          '" text-anchor="middle" font-size="' + V.font.base +
          '" font-weight="700" fill="' + COLORS.greenLid + '">Смешанные</text>'
      );
    }
    if (orange > 0) {
      parts.push(
        '<text x="' + p(orangeX + orangeSpan / 2) + '" y="' + p(y0 - 14) +
          '" text-anchor="middle" font-size="' + V.font.base +
          '" font-weight="700" fill="' + COLORS.orangeLid + '">Пластик</text>'
      );
    }

    // ограждение
    const fence = function (d) {
      parts.push(
        '<path d="' + d + '" fill="none" stroke="' + COLORS.fence +
        '" stroke-width="' + V.fenceStroke + '" stroke-linecap="round"></path>'
      );
    };

    if (geometry.closed) {
      const gate = Math.min(D.gateWidth * scale, W * 0.4);
      const gateStart = x0 + (W - gate) / 2;
      const gateEnd = gateStart + gate;

      fence('M ' + p(x0) + ' ' + p(y0) + ' H ' + p(xF));
      fence('M ' + p(x0) + ' ' + p(y0) + ' V ' + p(yF));
      fence('M ' + p(xF) + ' ' + p(y0) + ' V ' + p(yF));
      fence('M ' + p(x0) + ' ' + p(yF) + ' H ' + p(gateStart));
      fence('M ' + p(gateEnd) + ' ' + p(yF) + ' H ' + p(xF));

      // створки ворот, открытые наружу
      parts.push(
        '<path d="M ' + p(gateStart) + ' ' + p(yF) + ' L ' + p(gateStart + gate * 0.45) + ' ' + p(yF + gate * 0.16) +
          '" fill="none" stroke="' + COLORS.fence + '" stroke-width="' + V.fenceStroke +
          '" stroke-linecap="round"></path>' +
        '<path d="M ' + p(gateEnd) + ' ' + p(yF) + ' L ' + p(gateEnd - gate * 0.45) + ' ' + p(yF + gate * 0.16) +
          '" fill="none" stroke="' + COLORS.fence + '" stroke-width="' + V.fenceStroke +
          '" stroke-linecap="round"></path>' +
        '<text x="' + p(x0 + W / 2) + '" y="' + p(yF - 5) +
          '" text-anchor="middle" font-size="' + V.font.small +
          '" font-weight="600" fill="' + COLORS.label + '">Ворота</text>'
      );
    } else {
      fence('M ' + p(x0) + ' ' + p(y0) + ' H ' + p(xF));
      fence('M ' + p(x0) + ' ' + p(y0) + ' V ' + p(yF));
      fence('M ' + p(xF) + ' ' + p(y0) + ' V ' + p(yF));
      // передняя сторона открыта
      parts.push(
        '<line x1="' + p(x0) + '" y1="' + p(yF) + '" x2="' + p(xF) + '" y2="' + p(yF) +
        '" stroke="' + COLORS.openFront + '" stroke-width="2.5" stroke-dasharray="7 7"></line>'
      );
    }

    // столбы
    const postR = V.fenceStroke * 0.85;
    [[x0, y0], [xF, y0], [x0, yF], [xF, yF]].forEach(function (pt) {
      parts.push(
        '<circle cx="' + p(pt[0]) + '" cy="' + p(pt[1]) + '" r="' + p(postR) +
        '" fill="' + COLORS.post + '"></circle>'
      );
    });

    // уклон к проезжей части
    const slopeY = yF + 52;
    const arrowY = yF + 66;
    const cx = x0 + W / 2;
    const half = Math.min(74, Math.max(38, W * 0.22));

    parts.push(
      '<text x="' + p(cx) + '" y="' + p(slopeY) +
        '" text-anchor="middle" font-size="11.5" font-weight="600" fill="' + COLORS.slope +
        '">→ к проезжей части, ' + D.slopePercent.min + '–' + D.slopePercent.max + '%</text>' +
      '<line x1="' + p(cx - half) + '" y1="' + p(arrowY) + '" x2="' + p(cx + half) + '" y2="' + p(arrowY) +
        '" stroke="' + COLORS.slope + '" stroke-width="2.2" marker-end="url(#slopeArrow)"></line>'
    );

    // размер: ширина
    const dimY = yF + 92;
    parts.push(
      '<line x1="' + p(x0) + '" y1="' + p(yF + 4) + '" x2="' + p(x0) + '" y2="' + p(dimY + 9) +
        '" stroke="' + COLORS.dim + '" stroke-width="1"></line>' +
      '<line x1="' + p(xF) + '" y1="' + p(yF + 4) + '" x2="' + p(xF) + '" y2="' + p(dimY + 9) +
        '" stroke="' + COLORS.dim + '" stroke-width="1"></line>' +
      '<line x1="' + p(x0) + '" y1="' + p(dimY) + '" x2="' + p(xF) + '" y2="' + p(dimY) +
        '" stroke="' + COLORS.dim + '" stroke-width="1.2" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)"></line>' +
      '<text x="' + p(x0 + W / 2) + '" y="' + p(dimY + 20) +
        '" text-anchor="middle" font-size="' + V.font.base + '" font-weight="600" fill="' + COLORS.dim +
        '">Ширина: ' + fmt(geometry.width) + ' м</text>'
    );

    // размер: глубина
    const dimX = xF + 50;
    const depthLabelX = dimX + 18;
    const depthLabelY = y0 + H / 2;
    parts.push(
      '<line x1="' + p(xF + 4) + '" y1="' + p(y0) + '" x2="' + p(dimX + 9) + '" y2="' + p(y0) +
        '" stroke="' + COLORS.dim + '" stroke-width="1"></line>' +
      '<line x1="' + p(xF + 4) + '" y1="' + p(yF) + '" x2="' + p(dimX + 9) + '" y2="' + p(yF) +
        '" stroke="' + COLORS.dim + '" stroke-width="1"></line>' +
      '<line x1="' + p(dimX) + '" y1="' + p(y0) + '" x2="' + p(dimX) + '" y2="' + p(yF) +
        '" stroke="' + COLORS.dim + '" stroke-width="1.2" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)"></line>' +
      '<text x="' + p(depthLabelX) + '" y="' + p(depthLabelY) +
        '" transform="rotate(-90 ' + p(depthLabelX) + ' ' + p(depthLabelY) + ')"' +
        ' text-anchor="middle" dy="4" font-size="' + V.font.base +
        '" font-weight="600" fill="' + COLORS.dim +
        '">Глубина: ' + fmt(geometry.depth) + ' м</text>'
    );

    const ariaLabel =
      'Схема контейнерной площадки: ширина ' + fmt(geometry.width) +
      ' м, глубина ' + fmt(geometry.depth) + ' м, площадь ' + fmt(geometry.area) +
      ' кв. м. ' + (geometry.closed ? 'Закрытая, 4 стороны ограждения.' : 'Открытая, 3 стороны ограждения.');

    target.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + p(viewW) + ' ' + p(viewH) +
      '" width="' + p(viewW) + '" height="' + p(viewH) + '" role="img" aria-label="' + esc(ariaLabel) +
      '" preserveAspectRatio="xMinYMin meet">' + parts.join('') + '</svg>';
  }

  App.Scheme = { compute, render };
})();