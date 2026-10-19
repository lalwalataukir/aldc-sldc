/* Rendering and interaction: tabs, section rail and progress, glossary popover,
   lifecycle maps, the simulated trace, quizzes, parallel tracks and scenarios. */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Glossary terms ---------- */
const TERM_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
/* seen: a Set per module, so only the first use in each module becomes a button. Pass null to mark every use. */
function markTerms(html, seen, used) {
  return html.replace(TERM_RE, (_, key, shown) => {
    const k = key.trim().toLowerCase();
    const text = shown || key;
    if (!TERMS[k]) { console.warn("Missing term:", k); return text; }
    if (used && !used.includes(k)) used.push(k);
    if (seen) { if (seen.has(k)) return text; seen.add(k); }
    return `<button class="term" type="button" data-term="${k}" aria-expanded="false">${text}</button>`;
  });
}

const pop = $("#termPop");
let popFor = null;
function closePop(returnFocus) {
  if (!popFor) return;
  popFor.setAttribute("aria-expanded", "false");
  if (returnFocus) popFor.focus();
  pop.hidden = true;
  popFor = null;
}
function openPop(btn) {
  if (popFor === btn) { closePop(); return; }
  closePop();
  const [t, d] = TERMS[btn.dataset.term];
  pop.innerHTML = `<strong id="termPopT">${t}</strong><span>${d}</span><button class="x" type="button">Close</button>`;
  pop.hidden = false;
  const r = btn.getBoundingClientRect();
  const w = pop.offsetWidth;
  const left = Math.max(16, Math.min(r.left, document.documentElement.clientWidth - w - 16));
  pop.style.left = left + window.scrollX + "px";
  pop.style.top = r.bottom + window.scrollY + 6 + "px";
  btn.setAttribute("aria-expanded", "true");
  popFor = btn;
}
document.addEventListener("click", e => {
  const term = e.target.closest(".term[data-term]");
  if (term) { openPop(term); return; }
  if (e.target.closest("#termPop .x")) { closePop(true); return; }
  if (popFor && !e.target.closest("#termPop")) closePop();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closePop(true); });

/* ---------- Module rendering ---------- */
const panels = $("#panels");
const NEXT = { sdlc: ["adlc", "Module 2 · How an AI agent gets built →"], adlc: ["compare", "Module 3 · Same feature, two lifecycles →"], compare: ["sdlc", "Back to Module 1 · How a fixed software feature gets built →"] };

function renderModule(m) {
  const seen = new Set();
  m.used = [];
  const hero = `<section class="hero"><span class="eyebrow">${m.eyebrow}</span><h1>${m.title}</h1><p class="lede">${m.lede}</p>
    <p class="hint"><span><span class="term">Dotted underlines</span> open a plain-language definition.</span><span>${m.sections.length} sections · progress is saved in this browser.</span></p></section>`;
  const secs = m.sections.map((s, i) => `<section class="sec" id="${s.id}" data-i="${i}" aria-labelledby="${s.id}-h">
      <div class="sec-h"><span class="eyebrow">${s.eyebrow}</span><h2 id="${s.id}-h">${s.title}</h2>${s.intro ? `<p class="intro">${s.intro}</p>` : ""}</div>
      ${s.body()}
      <div class="takeaway"><span class="k">What a PM should remember</span><p>${s.remember}</p></div></section>`).join("");
  const [nid, nlabel] = NEXT[m.id];
  const next = `<div class="next-module"><span class="eyebrow">${m.id === "compare" ? "Start again" : "Next module"}</span><button type="button" data-goto="${nid}">${nlabel}</button></div>`;
  const el = document.createElement("div");
  el.className = "panel";
  el.id = "panel-" + m.id;
  el.setAttribute("role", "tabpanel");
  el.setAttribute("aria-labelledby", "tab-" + m.id);
  el.hidden = true;
  el.innerHTML = markTerms(hero + secs + next, seen, m.used);
  const list = $("[data-termlist]", el);
  if (list) {
    const keys = m.used.slice().sort((a, b) => TERMS[a][0].localeCompare(TERMS[b][0]));
    list.innerHTML = keys.map(k => `<div><dt>${TERMS[k][0]}</dt><dd>${TERMS[k][1]}</dd></div>`).join("");
    $("[data-termcount]", el).textContent = keys.length + " terms";
  }
  panels.appendChild(el);
  m.el = el;
  m.secEls = $$(".sec", el);
}
panels.appendChild(renderHome());
MODULES.forEach(renderModule);

/* ---------- Tabs, rail, progress ---------- */
const tabs = $$(".modtab");
const rail = $("#rail");
const railCount = $("#railCount");
const bar = $("#progressBar");
const read = new Set(store.get("sldc.read", []));
const scrollPos = {};
let cur = null;       // the open module, or null on the home page
let curKey = null;    // "home" or a module id
let lastSaved = store.get("sldc.last", null);
const homeEl = $("#panel-home");
const railRow = $(".railrow");

function railHtml(m) {
  return m.sections.map((s, i) => `<a href="#${s.id}" data-i="${i}"><span class="n">${i + 1}</span>${s.rail}<span class="rd"${read.has(s.id) ? "" : " hidden"}>✓</span></a>`).join("");
}
/* id is "home" or a module id */
function setModule(id, opts = {}) {
  const m = MODULES.find(x => x.id === id) || null;
  const key = m ? m.id : "home";
  if (curKey && curKey !== key) scrollPos[curKey] = window.scrollY;
  closePop();
  MODULES.forEach(x => { x.el.hidden = x !== m; });
  homeEl.hidden = !!m;
  railRow.hidden = !m;
  tabs.forEach(t => {
    const on = t.dataset.mod === key;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
  });
  rail.innerHTML = m ? railHtml(m) : "";
  cur = m;
  curKey = key;
  if (!m) refreshHome(read);
  if (opts.section) {
    const target = document.getElementById(opts.section);
    if (target) target.scrollIntoView();
  } else if (opts.restore !== false) {
    window.scrollTo(0, scrollPos[key] || 0);
  }
  if (opts.hash !== false) history.replaceState(null, "", "#" + (opts.section || key));
  onScroll();
}
/* Follow a #hash: home, a module, or a section inside one. */
function route(hash) {
  const h = decodeURIComponent(hash.replace(/^#/, ""));
  const mod = MODULES.find(m => m.id === h);
  const owner = MODULES.find(m => m.sections.some(s => s.id === h));
  if (mod) setModule(mod.id, { hash: false });
  else if (owner) setModule(owner.id, { section: h, hash: false });
  else setModule("home", { hash: false, restore: h === "home" });
}
window.addEventListener("hashchange", () => route(location.hash));
tabs.forEach(t => t.addEventListener("click", () => setModule(t.dataset.mod)));
$(".modtabs").addEventListener("keydown", e => {
  const i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  let j = null;
  if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
  if (e.key === "ArrowLeft") j = (i + tabs.length - 1) % tabs.length;
  if (e.key === "Home") j = 0;
  if (e.key === "End") j = tabs.length - 1;
  if (j === null) return;
  e.preventDefault();
  tabs[j].focus();
  setModule(tabs[j].dataset.mod);
});
rail.addEventListener("click", e => {
  const a = e.target.closest("a[data-i]");
  if (!a) return;
  e.preventDefault();
  const id = a.getAttribute("href").slice(1);
  document.getElementById(id).scrollIntoView();
  history.replaceState(null, "", "#" + id);
});
document.addEventListener("click", e => {
  const g = e.target.closest("[data-goto]");
  if (g) { setModule(g.dataset.goto, { restore: false }); window.scrollTo(0, 0); $("#tab-" + g.dataset.goto).focus(); }
});

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    if (!cur) { bar.style.width = "0%"; return; }
    const topH = $("#topbar").offsetHeight + 24;
    const vh = window.innerHeight;
    let active = 0;
    let changed = false;
    cur.secEls.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top <= topH) active = i;
      if (r.bottom < vh * 0.6 && r.bottom > 0 && !read.has(s.id)) { read.add(s.id); changed = true; }
    });
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atEnd) {
      active = cur.secEls.length - 1;
      cur.secEls.forEach(s => { if (s.getBoundingClientRect().top < vh && !read.has(s.id)) { read.add(s.id); changed = true; } });
    }
    if (changed) store.set("sldc.read", Array.from(read));
    const links = $$("a", rail);
    links.forEach((a, i) => {
      a.classList.toggle("is-active", i === active);
      if (i === active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      $(".rd", a).hidden = !read.has(cur.sections[i].id);
    });
    const act = links[active];
    if (act) {
      const left = act.offsetLeft - rail.offsetLeft;
      if (left < rail.scrollLeft || left + act.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = left - 24;
    }
    const activeId = cur.sections[active].id;
    if (activeId !== lastSaved) { lastSaved = activeId; store.set("sldc.last", activeId); }
    const nRead = cur.sections.filter(s => read.has(s.id)).length;
    railCount.innerHTML = `${active + 1} / ${cur.sections.length}<span class="long"> · ${nRead} read</span>`;
    const top = cur.el.offsetTop;
    const span = cur.el.offsetHeight - vh + 80;
    const pct = Math.max(0, Math.min(1, (window.scrollY - top + 80) / Math.max(span, 1)));
    bar.style.width = (pct * 100).toFixed(1) + "%";
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

/* ---------- Theme ---------- */
const themeBtn = $("#themeBtn");
function effectiveTheme() {
  const set = document.documentElement.getAttribute("data-theme");
  if (set) return set;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function syncThemeBtn() {
  const next = effectiveTheme() === "dark" ? "Light" : "Dark";
  themeBtn.textContent = next;
  themeBtn.setAttribute("aria-label", "Switch to " + next.toLowerCase() + " theme");
}
themeBtn.addEventListener("click", () => {
  const next = effectiveTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("guides.theme", next); } catch (e) { /* storage unavailable */ }
  syncThemeBtn();
});
syncThemeBtn();
new MutationObserver(syncThemeBtn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", syncThemeBtn);

/* ---------- Lifecycle maps ---------- */
const NS = "http://www.w3.org/2000/svg";
const f1 = n => n.toFixed(1);

function wheelSvg(stages) {
  const cx = 260, cy = 260, R = 246, r = 118, n = stages.length, step = (Math.PI * 2) / n;
  const pt = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  const segs = stages.map((s, i) => {
    const a0 = -Math.PI / 2 + i * step, a1 = a0 + step, am = (a0 + a1) / 2;
    const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, a0), [lx, ly] = pt((R + r) / 2, am);
    const d = `M${f1(x0)} ${f1(y0)} A${R} ${R} 0 0 1 ${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} A${r} ${r} 0 0 0 ${f1(x3)} ${f1(y3)} Z`;
    return `<g class="seg" data-i="${i}" tabindex="0" role="button" aria-label="Stage ${i + 1}: ${s.name}"><path d="${d}"></path><text class="num" x="${f1(lx)}" y="${f1(ly - 10)}" text-anchor="middle">${i + 1}</text><text x="${f1(lx)}" y="${f1(ly + 10)}" text-anchor="middle">${s.name}</text></g>`;
  }).join("");
  return `<svg viewBox="0 0 520 520" role="group" aria-label="SDLC wheel with ${n} stages">${segs}
    <circle class="hub" cx="${cx}" cy="${cy}" r="${r - 10}"></circle>
    <text class="hub-t" x="${cx}" y="${cy - 6}" text-anchor="middle">SDLC</text>
    <text class="hub-s" x="${cx}" y="${cy + 18}" text-anchor="middle">7 stages, clockwise</text>
    <text class="hub-s" x="${cx}" y="${cy + 36}" text-anchor="middle">maintenance feeds planning</text></svg>`;
}

function loopSvg(stages) {
  const cx = 360, cy = 272, rx = 270, ry = 206, hw = 84, hh = 26;
  const subs = ["is an agent needed?", "job, tools, guardrails", "instructions and data", "plan, act, observe", "score many cases", "attack it first", "gates, human approval", "traces, cost, feedback"];
  const pos = stages.map((s, i) => { const a = -Math.PI / 2 + i * (Math.PI / 4); return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const edgePt = ([x, y], dx, dy, gap) => {
    const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    const len = Math.hypot(dx, dy);
    return [x + dx * s + (dx / len) * gap, y + dy * s + (dy / len) * gap];
  };
  let edges = "";
  for (let i = 0; i < stages.length - 1; i++) {
    const [a, b] = [pos[i], pos[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1];
    const [x1, y1] = edgePt(a, dx, dy, 3), [x2, y2] = edgePt(b, -dx, -dy, 6);
    edges += `<line class="edge" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" marker-end="url(#ahLoop)"></line>`;
  }
  const m = pos[7], d = pos[1];
  edges += `<path class="edge-back" d="M${f1(m[0] + hw + 3)} ${f1(m[1] + 6)} Q ${cx} ${f1(m[1] + 92)} ${f1(d[0] - hw - 7)} ${f1(d[1] + 6)}" marker-end="url(#ahBack)"></path>
    <text class="lbl-accent" x="${cx}" y="${f1(m[1] + 74)}" text-anchor="middle">findings go back to design</text>`;
  const nodes = stages.map((s, i) => { const [x, y] = pos[i];
    return `<g class="node" data-i="${i}" tabindex="0" role="button" aria-label="Stage ${i + 1}: ${s.name}"><rect x="${f1(x - hw)}" y="${f1(y - hh)}" width="${hw * 2}" height="${hh * 2}" rx="10"></rect><text class="ttl" x="${f1(x)}" y="${f1(y - 3)}" text-anchor="middle"><tspan class="nn">${i + 1} · </tspan>${s.short}</text><text class="sub" x="${f1(x)}" y="${f1(y + 15)}" text-anchor="middle">${subs[i]}</text></g>`; }).join("");
  return `<svg viewBox="0 0 720 544" role="group" aria-label="ADLC loop with ${stages.length} stages">
    <defs><marker id="ahLoop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrowhead" d="M0 0 L10 5 L0 10 z"></path></marker>
    <marker id="ahBack" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrow-accent" d="M0 0 L10 5 L0 10 z"></path></marker></defs>
    ${edges}
    <text class="hub-t" x="${cx}" y="${cy + 28}" text-anchor="middle">ADLC</text>
    <text class="hub-s" x="${cx}" y="${cy + 52}" text-anchor="middle">8 stages, clockwise, never finished</text>
    ${nodes}</svg>`;
}

function setupMap(root, stages, kind) {
  const svgHost = $("[data-svg]", root), detail = $("[data-detail]", root);
  svgHost.innerHTML = kind === "sdlc" ? wheelSvg(stages) : loopSvg(stages);
  const items = $$(kind === "sdlc" ? ".seg" : ".node", svgHost);
  const state = { i: 0, bad: false };
  function draw(focusSwitch) {
    const s = stages[state.i];
    items.forEach((g, i) => { g.classList.toggle("is-sel", i === state.i && !state.bad); g.classList.toggle("is-bad", i === state.i && state.bad); g.setAttribute("aria-pressed", i === state.i); });
    detail.classList.toggle("is-bad", state.bad);
    const owner = `Owner: ${s.owner.join(" and ")}`;
    const body = state.bad
      ? `<div class="wrong-h"><span class="kind k-bad">Goes wrong</span><b>${s.wrong.title}</b></div><p>${s.wrong.what}</p>${log(s.wrong.timeline)}<p><strong>How it's caught.</strong> ${s.wrong.caught}</p>`
      : `<p>${s.what[0]}</p>${dl([["What the PM does", s.pm.slice(0, 3).join(". ") + "."], ["What it produces", s.output.join(" · ")]])}`;
    detail.innerHTML = markTerms(`<div class="detail-top"><span class="eyebrow">Stage ${state.i + 1} of ${stages.length} · ${owner}</span>
      <button class="switch" type="button" aria-pressed="${state.bad}" data-act="bad"><span class="knob"></span>What could go wrong</button></div>
      <h3>${s.name}</h3>${body}
      <div class="controls"><button class="btn btn-sm" type="button" data-act="prev"${state.i === 0 ? " disabled" : ""}>◀ Previous stage</button><button class="btn btn-sm" type="button" data-act="next"${state.i === stages.length - 1 ? " disabled" : ""}>Next stage ▶</button><span class="grow"></span><a class="more" href="#${s.id}" data-jump="${s.id}">Read the full stage →</a></div>`, null);
    if (focusSwitch) $("[data-act=bad]", detail).focus();
  }
  function pick(i) { state.i = i; draw(); }
  items.forEach((g, i) => {
    g.addEventListener("click", () => pick(i));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(i); } });
  });
  detail.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (b) {
      if (b.dataset.act === "bad") { state.bad = !state.bad; draw(true); }
      if (b.dataset.act === "prev" && state.i > 0) { state.i--; draw(); $("[data-act=prev]", detail).disabled ? $("[data-act=next]", detail).focus() : $("[data-act=prev]", detail).focus(); }
      if (b.dataset.act === "next" && state.i < stages.length - 1) { state.i++; draw(); $("[data-act=next]", detail).disabled ? $("[data-act=prev]", detail).focus() : $("[data-act=next]", detail).focus(); }
      return;
    }
    const j = e.target.closest("[data-jump]");
    if (j) { e.preventDefault(); document.getElementById(j.dataset.jump).scrollIntoView(); history.replaceState(null, "", "#" + j.dataset.jump); }
  });
  draw();
}
setupMap($("[data-map=sdlc]"), SDLC_STAGES, "sdlc");
setupMap($("[data-map=adlc]"), ADLC_STAGES, "adlc");

/* ---------- Simulated trace ---------- */
(function trace() {
  const root = $("#traceDemo");
  const q = k => $(`[data-t=${k}]`, root);
  const steps = TRACE.steps;
  let n = 0, prev = 0;
  function draw() {
    const shown = steps.slice(0, n);
    q("timeline").innerHTML = shown.length
      ? shown.map((s, i) => `<div class="step ${s.cls || ""}${i === n - 1 ? " s-current" : ""}${i < prev || n < prev ? " s-still" : ""}"><div class="step-h"><span class="step-n">Step ${i + 1}</span><span class="kind ${s.kind}">${s.label}</span><span class="step-t">${s.title}</span></div>${s.html}</div>`).join("")
      : `<p class="demo-empty">Press <strong>Next step</strong> to start the run. Each step shows what the agent thought or did, in order.</p>`;
    const lines = shown.flatMap(s => s.log);
    q("log").innerHTML = lines.length ? log(lines).replace(/^<div class="log" role="log">|<\/div>$/g, "") : `<div><span class="t">--.--</span>  waiting for run_start</div>`;
    const sum = shown.reduce((a, s) => ({ lat: a.lat + s.dt, tok: a.tok + s.tokens, cost: a.cost + s.cost }), { lat: 0, tok: 0, cost: 0 });
    q("lat").textContent = sum.lat.toFixed(2) + " s";
    q("cost").textContent = "$" + sum.cost.toFixed(3);
    q("tok").textContent = sum.tok.toLocaleString("en-US");
    q("spans").textContent = lines.filter(l => ["e-model", "e-tool", "e-bad"].includes(l[1])).length;
    q("n").textContent = n;
    const last = shown[n - 1];
    q("phase").textContent = !last ? "Ready" : n === steps.length ? "Run complete · waiting for the RM to review the draft" : `${last.label} · ${last.title}`;
    $$(".phase", root).forEach(ph => ph.classList.toggle("is-on", !!last && ph.classList.contains(last.phase)));
    q("back").disabled = n === 0;
    q("next").disabled = n === steps.length;
    q("reset").disabled = n === 0;
    const tl = q("timeline"); tl.scrollTop = tl.scrollHeight;
    const lg = q("log"); lg.scrollTop = lg.scrollHeight;
    prev = n;
  }
  root.addEventListener("click", e => {
    const b = e.target.closest("button[data-t]");
    if (!b) return;
    if (b.dataset.t === "next" && n < steps.length) n++;
    if (b.dataset.t === "back" && n > 0) n--;
    if (b.dataset.t === "reset") n = 0;
    draw();
    if (b.disabled) q(n === 0 ? "next" : "back").focus();
  });
  draw();
})();

/* ---------- Quizzes ---------- */
$$(".quizset").forEach(set => {
  const score = () => {
    const done = $$(".quiz[data-done]", set);
    $("[data-n]", set).textContent = done.length;
    $("[data-r]", set).textContent = done.filter(x => x.dataset.done === "right").length;
  };
  set.addEventListener("click", e => {
    const opt = e.target.closest(".opt");
    if (!opt) return;
    const quiz = opt.closest(".quiz");
    if (quiz.dataset.done) return;
    const a = Number(quiz.dataset.a), i = Number(opt.dataset.i);
    const opts = $$(".opt", quiz);
    opts[a].classList.add("right");
    if (i !== a) opt.classList.add("wrong");
    opts.forEach(o => { o.disabled = true; });
    const fb = $(".quiz-fb", quiz);
    fb.innerHTML = (i === a ? "<b>Right.</b> " : `<b>Not quite.</b> The answer is ${"ABCD"[a]}. `) + fb.dataset.why;
    quiz.dataset.done = i === a ? "right" : "wrong";
    score();
  });
});

/* ---------- Parallel tracks ---------- */
(function tracks() {
  const root = $("[data-tracks]");
  const note = $("[data-tnote]");
  const all = $$(".tstage", root);
  const nameOf = id => { const s = SDLC_STAGES.find(x => x.id === id) || ADLC_STAGES.find(x => x.id === id); return s.short || s.name; };
  const side = id => (id.startsWith("sdlc") ? "SDLC" : "ADLC");
  function pick(id) {
    const link = TRACK_LINKS[id];
    all.forEach(b => {
      const sel = b.dataset.id === id, match = link.to.includes(b.dataset.id);
      b.classList.toggle("is-sel", sel);
      b.classList.toggle("is-match", match);
      b.setAttribute("aria-pressed", sel);
    });
    note.innerHTML = markTerms(`<span class="pair">${side(id)} · ${nameOf(id)} ↔ ${side(link.to[0])} · ${link.to.map(nameOf).join(" + ")}</span><h3>${link.h}</h3><p>${link.note}</p>`, null);
  }
  root.addEventListener("click", e => { const b = e.target.closest(".tstage"); if (b) pick(b.dataset.id); });
  pick(SDLC_STAGES[0].id);
})();

/* ---------- Decision scenarios ---------- */
$$("[data-scenarios] .scen").forEach(card => {
  card.addEventListener("click", e => {
    const b = e.target.closest(".chip[data-v]");
    if (!b) return;
    const right = b.dataset.v === card.dataset.a;
    $$(".chip", card).forEach(c => { c.setAttribute("aria-pressed", c === b); c.classList.remove("ok", "no"); });
    b.classList.add(right ? "ok" : "no");
    const v = $(".verdict", card);
    v.innerHTML = `<p>${right ? "<b>Right.</b>" : "<b>Not quite.</b>"} ${v.dataset.why}</p>`;
  });
});

/* ---------- Start: the landing page unless the link names a module or section ---------- */
route(location.hash);
