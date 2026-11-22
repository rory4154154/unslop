// Bean-temperature curve for batch B-1184. Actual to 8:42 (204°C, first crack 7:58), then the planned finish to drop at about 13:35 (64% through at 8:42).
const ROAST = {
  actual: [[0.08,200],[0.5,140],[1.2,96],[2,108],[3,128],[4,146],[5,161],[6,174],[7,186],[7.97,196],[8.7,204]],
  plan: [[8.7,204],[9.5,209],[10.5,213.5],[11.5,217],[12.5,219.5],[13.58,221]],
};
function roastCurve({ w = 640, h = 220, dark = true, pad = { l: 44, r: 8, t: 26, b: 26 } } = {}) {
  const X = (m) => pad.l + (m / 14) * (w - pad.l - pad.r);
  const Y = (c) => pad.t + (1 - (c - 80) / (240 - 80)) * (h - pad.t - pad.b);
  const path = (pts) => {
    const P = pts.map(([m, c]) => [X(m), Y(c)]);
    let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  };
  const grid = dark ? 'rgba(239,233,225,.08)' : 'rgba(31,27,22,.07)', lab = dark ? '#A89F94' : '#736A5F', line = dark ? '#E8743B' : '#C4501A', plan = dark ? 'rgba(239,233,225,.35)' : 'rgba(31,27,22,.3)';
  const ys = [100, 150, 200].map((c) => `<line x1="${pad.l}" x2="${w - pad.r}" y1="${Y(c)}" y2="${Y(c)}" stroke="${grid}"/><text x="${pad.l - 8}" y="${Y(c) + 4}" text-anchor="end">${c}°</text>`).join('');
  const xs = [0, 3, 6, 9, 12].map((m) => `<text x="${X(m)}" y="${h - 6}" text-anchor="middle">${m}:00</text>`).join('');
  const fc = X(7.97), now = [X(8.7), Y(204)];
  return `<svg class="curve" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="IBM Plex Mono, monospace" font-size="11" fill="${lab}" role="img" aria-label="Bean temperature, 204 degrees at 8 minutes 42, first crack at 7 minutes 58">
    ${ys}${xs}
    <g class="fc"><line x1="${fc}" x2="${fc}" y1="${pad.t}" y2="${h - pad.b}" stroke="${lab}" stroke-dasharray="2 4"/><text x="${fc}" y="${pad.t - 10}" text-anchor="middle">First crack 7:58</text></g>
    <text class="drop" x="${X(13.58)}" y="${Y(221) - 12}" text-anchor="end">Drop about 13:35</text>
    <path class="plan" d="${path(ROAST.plan)}" fill="none" stroke="${plan}" stroke-width="1.5" stroke-dasharray="4 5"/>
    <path class="act" d="${path(ROAST.actual)}" fill="none" stroke="${line}" stroke-width="2.25" stroke-linecap="round"/>
    <circle class="now" cx="${now[0]}" cy="${now[1]}" r="4.5" fill="${line}" stroke="${dark ? '#1E1A17' : '#fff'}" stroke-width="2"/>
  </svg>`;
}
