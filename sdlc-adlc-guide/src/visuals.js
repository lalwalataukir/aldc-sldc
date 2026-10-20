/* Visual builders. Each returns markup coloured only through design-system tokens.
   HTML/CSS is used wherever a visual must reflow on phones (bars, flows, timelines,
   grids); SVG for shapes that need geometry (lines, donuts, wireframes, the venn).
   Kinds name a token: think, observe, act, graph, final, bad, accent, muted, p2.
   When several kinds sit side by side as categories, use that order: it is the one
   that passed the colour-separation check. Every visual also carries words, so colour
   is never the only signal. */
const NS = "http://www.w3.org/2000/svg";
const f1 = n => n.toFixed(1);
const VC = k => `vc-${k || "muted"}`;
const LOGKIND = { "e-model": "think", "e-tool": "act", "e-res": "observe", "e-run": "final", "e-bad": "bad", "e-human": "accent" };
const ACRONYMS = { prd: "PRD", qa: "QA", pm: "PM", pr: "PR", ci: "CI", rm: "RM", p95: "p95" };
const pretty = s => s.split("_").map(w => ACRONYMS[w.toLowerCase()] || w).join(" ").replace(/^[a-z]/, c => c.toUpperCase());
const attr = s => String(s).replace(/<[^>]+>/g, "").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a).replace(/"/g, "&quot;");
const pct = (v, max) => (Math.max(0, Math.min(1, v / max)) * 100).toFixed(2) + "%";

/* A figure with a caption. o: {interactive, illustrative, title, cls, label} */
function fig(body, caption, o = {}) {
  const role = o.interactive ? 'role="group"' : 'role="img"';
  return `<figure class="fig${o.cls ? " " + o.cls : ""}"><div class="fig-body" ${role} aria-label="${attr(o.label || caption)}">${o.title ? `<p class="fig-title">${o.title}</p>` : ""}${body}</div><figcaption>${o.illustrative ? '<span class="tag">Illustrative</span> ' : ""}${caption}</figcaption></figure>`;
}

/* Horizontal bars. rows: {l, v, d (shown value), k}. o: {max, thr: {v, label}} */
function hbars(rows, o = {}) {
  const max = o.max || Math.max(...rows.map(r => r.v));
  const thr = o.thr ? ` style="--thr:${pct(o.thr.v, max)}"` : "";
  const head = o.thr ? `<div class="v-hb-row v-hb-head"><span></span><span class="v-hb-track"><b>${o.thr.label}</b></span><span></span></div>` : "";
  return `<div class="v-hb${o.thr ? " has-thr" : ""}"${thr}>${head}${rows.map(r => `<div class="v-hb-row ${VC(r.k)}" title="${attr(r.l)}: ${attr(r.d ?? r.v)}"><span class="v-hb-l">${r.l}</span><span class="v-hb-track"><i style="width:${pct(Math.max(r.v, max * 0.006), max)}"></i></span><span class="v-hb-v">${r.d ?? r.v}</span></div>`).join("")}</div>`;
}

/* Dots on a scale, for comparing versions against a threshold. rows: {l, pts: [{v, k, l}]} */
function dotRange(rows, o) {
  const frac = v => (v - o.min) / (o.max - o.min);
  const pos = v => pct(v - o.min, o.max - o.min);
  /* Points with the same value share one label; labels near the right edge hang leftwards. */
  const dots = r => r.pts.map((pt, j) => {
    const same = r.pts.filter(q => q.v === pt.v);
    if (same.length > 1 && same[0] !== pt) return `<i class="${VC(pt.k)}" style="left:${pos(pt.v)}"></i>`;
    const label = same.length > 1 ? `${same.map(q => q.l).join(" and ")} ${o.fmt(pt.v)}` : `${pt.l} ${o.fmt(pt.v)}`;
    return `<i class="${VC(pt.k)}" style="left:${pos(pt.v)}" title="${attr(label)}"><em class="${j ? "is-below" : ""}${frac(pt.v) > 0.8 ? " is-right" : ""}">${label}</em></i>`;
  }).join("");
  return `<div class="v-dr" style="--thr:${pos(o.thr)}"><div class="v-dr-scale"><span></span><span class="v-dr-axis"><span>${o.fmt(o.min)}</span><b>${o.thrLabel} ${o.fmt(o.thr)}</b><span>${o.fmt(o.max)}</span></span></div>${rows.map(r => `
    <div class="v-dr-row"><span class="v-dr-l">${r.l}</span><span class="v-dr-track">${dots(r)}</span></div>`).join("")}</div>`;
}

/* One bar split into parts, with an optional capacity. parts: {l, v, k}. o: {limit, limitLabel, unit} */
function stack(parts, o = {}) {
  const total = parts.reduce((a, p) => a + p.v, 0);
  const scale = Math.max(total, o.limit || 0) * (o.limit && total > o.limit ? 1 : 1.0);
  const over = o.limit && total > o.limit;
  return `<div class="v-stack${over ? " is-over" : ""}">
    <div class="v-stack-bar"${o.limit ? ` style="--lim:${pct(o.limit, scale)}"` : ""}>${parts.map(p => `<i class="${VC(p.k)}" style="width:${pct(p.v, scale)}" title="${attr(p.l)}: ${p.v.toLocaleString("en-US")}${o.unit || ""}"></i>`).join("")}${o.limit ? `<b class="v-stack-lim"><span>${o.limitLabel}</span></b>` : ""}</div>
    <ul class="v-legend">${parts.map(p => `<li class="${VC(p.k)}"><i></i>${p.l}<span>${p.v.toLocaleString("en-US")}${o.unit || ""}</span></li>`).join("")}<li class="v-legend-total">Total<span>${total.toLocaleString("en-US")}${o.unit || ""}${o.limit ? ` of ${o.limit.toLocaleString("en-US")}` : ""}</span></li></ul></div>`;
}

/* One square per unit. groups: {l, n, k} */
function waffle(groups, cols = 20) {
  return `<div class="v-waffle" style="--cols:${cols}">${groups.map(g => Array.from({ length: g.n }, () => `<i class="${VC(g.k)}"></i>`).join("")).join("")}</div>
    <ul class="v-legend">${groups.map(g => `<li class="${VC(g.k)}"><i></i>${g.l}<span>${g.n}</span></li>`).join("")}</ul>`;
}

/* A run of events, left to right on wide screens and top to bottom on phones.
   events: [time, logClass, event_name, text] (the same rows the event logs use) */
function timeline(events) {
  return `<ol class="v-tl">${events.map(([t, c, name, text]) => `<li class="${VC(LOGKIND[c])}"><span class="v-tl-t">${t}</span><span class="v-tl-dot" aria-hidden="true"></span><b>${pretty(name)}</b><span class="v-tl-x">${text}</span></li>`).join("")}</ol>`;
}

/* Boxes joined by labelled arrows. nodes: {t, s, k, chips: []}; edges: label or {l, k, dash} */
function flow(nodes, edges = [], o = {}) {
  const node = n => `<div class="v-node ${VC(n.k)}${n.dash ? " is-dash" : ""}">${n.tag ? `<span class="v-node-tag">${n.tag}</span>` : ""}<b>${n.t}</b>${n.s ? `<span>${n.s}</span>` : ""}${n.chips ? `<span class="v-chips">${n.chips.map(c => `<em>${c}</em>`).join("")}</span>` : ""}</div>`;
  const edge = e => { const x = typeof e === "object" ? e : { l: e }; return `<div class="v-edge ${VC(x.k)}${x.dash ? " is-dash" : ""}" aria-hidden="${x.l ? "false" : "true"}"><span>${x.l || ""}</span></div>`; };
  return `<div class="v-flow${o.vertical ? " is-vertical" : ""}">${nodes.map((n, i) => node(n) + (i < nodes.length - 1 ? edge(edges[i] || "") : "")).join("")}</div>`;
}

/* Stacked tiers, narrow at the top. tiers: {t, meta, k} from top to bottom */
function pyramid(tiers) {
  return `<div class="v-pyr">${tiers.map((t, i) => `<div class="v-pyr-tier ${VC(t.k)}" style="--w:${40 + (60 * i) / (tiers.length - 1)}%"><b>${t.t}</b><span>${t.meta}</span></div>`).join("")}</div>`;
}

/* Which tool is used across which stages. rows: {t, from, to, k, note} (stage indexes) */
function swimlane(stages, rows, id) {
  const n = stages.length;
  return `<div class="v-sw" data-swim="${id}" style="--n:${n}">
    <div class="v-sw-head"><span></span>${stages.map((s, i) => `<span title="${attr(s)}"><b>${i + 1}</b><em>${s}</em></span>`).join("")}</div>
    ${rows.map((r, i) => `<div class="v-sw-row"><span class="v-sw-t">${r.t}</span><span class="v-sw-lane">${stages.map(() => "<i></i>").join("")}<button type="button" class="v-sw-bar ${VC(r.k)}" style="grid-column:${r.from + 1} / ${r.to + 2}" data-i="${i}" aria-pressed="false">${stages.slice(r.from, r.to + 1).length > 1 ? `${stages[r.from]} → ${stages[r.to]}` : stages[r.from]}</button></span></div>`).join("")}
    <p class="v-note" aria-live="polite" data-notes="${attr(JSON.stringify(rows.map(r => [r.t, r.note])))}">Tap a tool to see what you'll do in it as PM.</p></div>`;
}

/* Likelihood × impact heatmap. items: {t, l, i, before, after} with l and i from 0 (low) to 2 (high) */
function riskMatrix(items, id) {
  const lv = ["Low", "Medium", "High"];
  let cells = "";
  for (let l = 2; l >= 0; l--) {
    cells += `<span class="v-rm-y">${lv[l]}</span>`;
    for (let i = 0; i <= 2; i++) {
      const here = items.map((x, j) => ({ ...x, j })).filter(x => x.l === l && x.i === i);
      cells += `<div class="v-rm-cell sev-${l + i}">${here.map(x => `<button type="button" class="v-rm-item" data-j="${x.j}" aria-pressed="false">${x.t}</button>`).join("")}</div>`;
    }
  }
  return `<div class="v-rm" data-risk="${id}" data-items="${attr(JSON.stringify(items))}">
    <div class="v-rm-grid"><span class="v-rm-axis-y">Likelihood</span>${cells}<span></span><span></span>${lv.map(x => `<span class="v-rm-x">${x}</span>`).join("")}<span class="v-rm-axis-x">Impact on clients and the bank</span></div>
    <div class="v-rm-note" aria-live="polite"><p class="muted">Tap a risk to see how it's caught before and after launch.</p></div></div>`;
}

/* A line chart. o: {x: labels, series: [{v, k, l}], y: {min, max, ticks, fmt}, goal: {v, l}, marks: [{i, l, k}], step} */
function lineChart(o) {
  const W = 520, H = o.h || 230, L = 46, R = 22, T = 22, B = 34;
  const n = o.x.length;
  const X = i => L + (i * (W - L - R)) / Math.max(n - 1, 1);
  const Y = v => T + (1 - (v - o.y.min) / (o.y.max - o.y.min)) * (H - T - B);
  const fmt = o.y.fmt || (v => v);
  let svg = "";
  o.y.ticks.forEach(t => { svg += `<line class="vs-grid" x1="${L}" x2="${W - R}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}"></line><text class="vs-ax" x="${L - 8}" y="${(Y(t) + 4).toFixed(1)}" text-anchor="end">${fmt(t)}</text>`; });
  o.x.forEach((l, i) => { if (l) svg += `<text class="vs-ax" x="${X(i).toFixed(1)}" y="${H - 12}" text-anchor="middle">${l}</text>`; });
  (o.marks || []).forEach(m => { svg += `<line class="vs-mark sk-${m.k || "muted"}" x1="${X(m.i).toFixed(1)}" x2="${X(m.i).toFixed(1)}" y1="${T - 6}" y2="${H - B}"></line><text class="vs-ml fk-${m.k || "muted"}" x="${(X(m.i) + (m.left ? -5 : 5)).toFixed(1)}" y="${T + 4}" text-anchor="${m.left ? "end" : "start"}">${m.l}</text>`; });
  if (o.goal) svg += `<line class="vs-thr" x1="${L}" x2="${W - R}" y1="${Y(o.goal.v).toFixed(1)}" y2="${Y(o.goal.v).toFixed(1)}"></line><text class="vs-ml fk-ink" x="${W - R}" y="${(Y(o.goal.v) - 6).toFixed(1)}" text-anchor="end">${o.goal.l}</text>`;
  o.series.forEach(s => {
    let d = "", pen = false, prev = null;
    s.v.forEach((v, i) => {
      if (v === null) { pen = false; return; }
      if (!pen) d += `M${X(i).toFixed(1)} ${Y(v).toFixed(1)}`;
      else if (o.step) d += `H${X(i).toFixed(1)}V${Y(v).toFixed(1)}`;
      else d += `L${X(i).toFixed(1)} ${Y(v).toFixed(1)}`;
      pen = true; prev = v;
    });
    svg += `<path class="vs-series sk-${s.k}" d="${d}"></path>`;
    s.v.forEach((v, i) => { if (v !== null) svg += `<circle class="vs-dot fk-${s.k}" cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4"><title>${attr(o.x[i] || "")} · ${s.l}: ${fmt(v)}</title></circle>`; });
    (s.labels || []).forEach(([i, text, above]) => { svg += `<text class="vs-val" x="${X(i).toFixed(1)}" y="${(Y(s.v[i]) + (above === false ? 18 : -10)).toFixed(1)}" text-anchor="middle">${text}</text>`; });
  });
  return `<svg class="v-line" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg}</svg>`;
}

/* Columns of counts. bins: {l, n}; markers: {at (bin units from the left), l, k} */
function histogram(bins, o = {}) {
  const max = Math.max(...bins.map(b => b.n));
  return `<div class="v-hist"><div class="v-hist-plot">${bins.map(b => `<span class="v-hist-col${b.k ? " " + VC(b.k) : ""}" title="${attr(b.l)}: ${b.n}%"><i style="height:${pct(b.n, max)}"></i></span>`).join("")}
    ${(o.markers || []).map(m => `<b class="v-hist-m ${VC(m.k)}" style="left:${pct(m.at, bins.length)}"><span>${m.l}</span></b>`).join("")}</div>
    <div class="v-hist-x">${bins.map(b => `<span>${b.l}</span>`).join("")}</div>${o.unit ? `<p class="v-hist-u">${o.unit}</p>` : ""}</div>`;
}

/* Spans on a time axis, like a trace view. spans: {l, s (start), d (duration), k} */
function waterfall(spans, total, ticks) {
  return `<div class="v-wf">${spans.map(sp => `<div class="v-wf-row ${VC(sp.k)}" title="${attr(sp.l)}: ${sp.d.toFixed(2)} s"><span class="v-wf-l">${sp.l}</span><span class="v-wf-track"><i style="left:${pct(sp.s, total)};width:${pct(Math.max(sp.d, total * 0.008), total)}"></i></span></div>`).join("")}
    <div class="v-wf-row v-wf-axis"><span></span><span class="v-wf-track">${ticks.map(t => `<em style="left:${pct(t, total)}">${t} s</em>`).join("")}</span></div></div>`;
}

/* Where you are in a lifecycle. names: stage names; cur: index */
function ribbon(names, cur, label) {
  return `<ol class="v-rib" aria-label="${attr(label)}: stage ${cur + 1} of ${names.length}">${names.map((n, i) => `<li class="${i < cur ? "is-past" : i === cur ? "is-cur" : ""}"${i === cur ? ' aria-current="step"' : ""}><b>${i + 1}</b><span>${n}</span></li>`).join("")}</ol>`;
}

/* A meter for a budget or limit */
function gauge(l, v, max, shown, bad) {
  return `<div class="v-gauge${bad ? " is-bad" : ""}"><span class="v-gauge-l">${l}</span><span class="v-gauge-t"><i style="width:${pct(v, max)}"></i></span><span class="v-gauge-v">${shown}</span></div>`;
}

/* Switch between views of the same figure. views: {label, html} */
function toggleViews(id, views) {
  return `<div class="v-tg" data-tg="${id}"><div class="v-tg-btns" role="group" aria-label="Choose a view">${views.map((v, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-v="${i}">${v.label}</button>`).join("")}</div>
    ${views.map((v, i) => `<div class="v-tg-view" data-view="${i}"${i ? " hidden" : ""}>${v.html}</div>`).join("")}</div>`;
}

/* Yes/no questions read top to bottom: a yes goes right to an outcome, a no goes down.
   steps: {q, yes: {t, k}} and a final {end: {t, k}}; ids let a scenario light its path. */
function ladder(steps, id) {
  return `<div class="v-lad" data-ladder="${id}">${steps.map((s, i) => s.end
    ? `<div class="v-lad-row"><div class="v-lad-out ${VC(s.end.k)}" data-node="end"><span class="v-lad-k">Otherwise</span><b>${s.end.t}</b></div></div>`
    : `<div class="v-lad-row"><div class="v-lad-q" data-node="q${i}"><span class="v-lad-k">Question ${i + 1}</span><b>${s.q}</b></div><span class="v-lad-yes" data-node="y${i}">yes</span><div class="v-lad-out ${VC(s.yes.k)}" data-node="o${i}"><b>${s.yes.t}</b></div></div><span class="v-lad-no" data-node="n${i}">no</span>`).join("")}</div>`;
}

/* ---------- Composite visuals for the running example ---------- */

/* The portfolio summary screen as a wireframe. mode: desktop | tablet | fixed */
function wireframe(mode) {
  const W = mode === "desktop" ? 400 : 260, H = mode === "fixed" ? 330 : 250;
  const donut = (cx, cy, r) => {
    const parts = [[64, "think", "Equity 64%"], [24.5, "observe", "Debt 24.5%"], [6.5, "act", "Gold 6.5%"], [5, "graph", "Cash 5%"]];
    let off = 0, s = "";
    parts.forEach(([v, k]) => { s += `<circle class="vs-donut sk-${k}" cx="${cx}" cy="${cy}" r="${r}" pathLength="100" stroke-dasharray="${v - 1} ${101 - v}" stroke-dashoffset="${-off + 25}"></circle>`; off += v; });
    return s;
  };
  const legend = (x, y) => [["think", "Equity 64%"], ["observe", "Debt 24.5%"], ["act", "Gold 6.5%"], ["graph", "Cash 5%"]].map(([k, t], i) => `<rect class="fk-${k}" x="${x}" y="${y + i * 15 - 8}" width="8" height="8" rx="2"></rect><text class="vs-m" x="${x + 13}" y="${y + i * 15}">${t}</text>`).join("");
  const line = (x, y, w, h) => `<rect class="vs-card" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"></rect><text class="vs-m" x="${x + 10}" y="${y + 16}">Performance vs benchmark</text>
    <polyline class="vs-series sk-accent" points="${[0, .18, .3, .45, .55, .7, .85, 1].map((p, i) => `${(x + 10 + p * (w - 20)).toFixed(0)},${(y + h - 10 - [10, 16, 13, 22, 20, 27, 24, 30][i] * (h - 30) / 32).toFixed(0)}`).join(" ")}"></polyline>
    <polyline class="vs-series sk-muted is-dash" points="${[0, .3, .55, .8, 1].map((p, i) => `${(x + 10 + p * (w - 20)).toFixed(0)},${(y + h - 10 - [8, 12, 16, 19, 22][i] * (h - 30) / 32).toFixed(0)}`).join(" ")}"></polyline>`;
  const table = (x, y, w, cols) => {
    const rows = [["Holding", "Value", "Weight", "1-year"], ["Infosys", "₹68,52,920", "14.2%", "−6.1%"], ["TCS", "₹55,98,160", "11.6%", "−2.4%"], ["HDFC Bank", "₹43,43,400", "9.0%", "+12.3%"]];
    const cw = (cols || 4) === 4 ? [0, .38, .66, .86] : [0, .55];
    return `<rect class="vs-card" x="${x}" y="${y}" width="${w}" height="74" rx="6"></rect>` + rows.map((r, i) => cw.map((c, j) => `<text class="${i ? "vs-t" : "vs-m"}" x="${x + 10 + c * w}" y="${y + 18 + i * 17}">${r[j]}</text>`).join("")).join("");
  };
  let s = `<rect class="vs-frame" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12"></rect>
    <text class="vs-h" x="16" y="26">Mehta family</text><text class="vs-m" x="${W - 16}" y="26" text-anchor="end">as of 30 Sep 2026</text>
    <rect class="vs-card" x="14" y="38" width="${mode === "desktop" ? 170 : W - 28}" height="52" rx="6"></rect><text class="vs-m" x="24" y="56">Total value</text><text class="vs-v" x="24" y="78">₹4,82,60,000</text>`;
  if (mode === "desktop") {
    s += donut(232, 64, 20) + legend(270, 50) + line(14, 100, W - 28, 64) + table(14, 172, W - 28);
  } else if (mode === "tablet") {
    s += `<g opacity=".95">${donut(46, 124, 20)}</g>${legend(84, 110)}` + line(14, 152, W - 28, 50).replace(/Performance vs benchmark/, "Performance");
    s += `<g class="vs-clip">${table(14, 210, 380)}</g><rect class="vs-bad" x="${W - 6}" y="206" width="${400 - W}" height="40" rx="4"></rect><text class="vs-badt" x="${W - 12}" y="${H - 6}" text-anchor="end">table runs off the screen</text>`;
  } else {
    s += donut(46, 124, 20) + legend(84, 110) + line(14, 156, W - 28, 56).replace(/Performance vs benchmark/, "Performance");
    s += `<rect class="vs-card" x="14" y="222" width="${W - 28}" height="96" rx="6"></rect><text class="vs-m" x="24" y="240">Top holdings · tap for all</text>` +
      [["Infosys", "14.2%"], ["TCS", "11.6%"], ["HDFC Bank", "9.0%"]].map(([a, b], i) => `<text class="vs-t" x="24" y="${262 + i * 20}">${a}</text><text class="vs-t" x="${W - 24}" y="${262 + i * 20}" text-anchor="end">${b}</text>`).join("");
  }
  return `<svg class="v-wire" viewBox="0 0 ${mode === "tablet" ? 400 : W} ${H}" style="max-width:${mode === "tablet" ? 400 : W}px" aria-hidden="true">${s}</svg>`;
}

/* The SDLC wheel and ADLC loop, drawn small and not clickable */
function miniLifecycles(which = "both") {
  const cell = (svg, t, s) => `<div class="v-mini"><div class="v-mini-svg">${svg}</div><b>${t}</b><span>${s}</span></div>`;
  const out = [];
  if (which !== "adlc") out.push(cell(wheelSvg(SDLC_STAGES, true), "SDLC · 7 stages", "Fixed behaviour. Specify it exactly, test pass/fail, ship."));
  if (which !== "sdlc") out.push(cell(loopSvg(ADLC_STAGES, true), "ADLC · 8 stages", "Probabilistic behaviour. Measure it, gate it, watch it, loop."));
  return `<div class="v-minis">${out.join("")}</div>`;
}
