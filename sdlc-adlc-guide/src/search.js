/* Site-wide search, after the one in how-ai-agents-work and pm-fundamentals.
   A Search button in the top bar (or / and Ctrl/Cmd+K) opens a dialog over the page.
   The index is built from the rendered modules the first time search opens: one entry per
   section and sub-section, plus every glossary term. Picking a result opens the module,
   scrolls to the section and highlights the matched words. */
(function search() {
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MAX = 30;
  const SUGGEST = ["acceptance criteria", "feature flag", "rollback", "golden dataset", "prompt injection", "p95", "red-teaming", "UAT"];
  const KIND = { Stage: "k-call", Section: "k-res", Term: "k-think" };

  /* ---------- Dialog ---------- */
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "gs-btn";
  btn.id = "gsBtn";
  btn.setAttribute("aria-label", "Search the guide");
  btn.innerHTML = SEARCH_ICON + '<span class="gs-l">Search</span><kbd>/</kbd>';
  $("#themeBtn").before(btn);

  const ov = document.createElement("div");
  ov.className = "gs-ov";
  ov.hidden = true;
  ov.innerHTML = `<div class="gs-box" role="dialog" aria-modal="true" aria-label="Search the guide">
      <div class="gs-top">${SEARCH_ICON}<label class="sr" for="gsIn">Search the guide</label>
        <input class="gs-in" id="gsIn" type="search" autocomplete="off" spellcheck="false" placeholder="Search stages, sections and terms" role="combobox" aria-expanded="true" aria-controls="gsList" aria-autocomplete="list">
        <button type="button" class="gs-x" id="gsClose">Esc</button></div>
      <div class="gs-meta" id="gsMeta" aria-live="polite"></div>
      <ul class="gs-list" id="gsList" role="listbox" aria-label="Results"></ul>
      <div class="gs-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
    </div>`;
  document.body.appendChild(ov);
  const input = $("#gsIn"), list = $("#gsList"), meta = $("#gsMeta");

  /* ---------- Index ---------- */
  let INDEX = null;
  /* Replace every tag with a space so text from neighbouring blocks doesn't run together. */
  const decoder = document.createElement("textarea");
  const textOf = node => { decoder.innerHTML = node.innerHTML.replace(/<[^>]+>/g, " "); return decoder.value.replace(/\s+/g, " ").replace(/ ([.,;:!?)])/g, "$1").trim(); };
  function buildIndex() {
    const entries = [];
    MODULES.forEach((m, mi) => {
      m.sections.forEach(s => {
        const sec = document.getElementById(s.id).cloneNode(true);
        $$("svg, .quiz-opts, .quiz-fb, .quiz-score, details.terms, .takeaway .k, [data-detail], [data-tnote], .verdict, .controls, .statusbar", sec).forEach(n => n.remove());
        const h = textOf($("h2", sec));
        const kind = /^Stage /.test(s.eyebrow) ? "Stage" : "Section";
        const where = `Module ${mi + 1} · ${m.tab} › ${s.eyebrow.split(" · ")[0]}`;
        let sub = "", buf = [];
        const flush = () => { const t = buf.join(" ").trim(); if (t) entries.push({ kind, mod: m.id, sec: s.id, where, h, s: sub, t }); buf = []; };
        Array.from(sec.children).forEach(ch => {
          if (ch.matches("h3.sub")) { flush(); sub = textOf(ch); return; }
          buf.push(textOf(ch));
        });
        flush();
      });
    });
    Object.entries(TERMS).forEach(([key, [name, def]]) => entries.push({ kind: "Term", key, where: "Glossary", h: name, s: "", t: def }));
    return entries;
  }

  /* ---------- Matching ---------- */
  function run(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return { words, results: [] };
    const phrase = words.join(" ");
    const out = [];
    INDEX.forEach((e, order) => {
      const h = e.h.toLowerCase(), s = e.s.toLowerCase(), t = e.t.toLowerCase();
      let score = 0;
      for (const w of words) {
        const inH = h.includes(w), inS = s.includes(w), n = t.split(w).length - 1;
        if (!inH && !inS && !n) return;
        score += (inH ? 8 : 0) + (inS ? 5 : 0) + Math.min(n, 3);
        if (e.kind === "Term" && inH) score += 6;
        if (new RegExp("\\b" + reEsc(w) + "\\b").test(h + " " + s)) score += 3;
      }
      if (words.length > 1 && (h.includes(phrase) || s.includes(phrase) || t.includes(phrase))) score += 6;
      if (e.kind === "Term" && h === phrase) score += 20;
      out.push({ e, score, order });
    });
    out.sort((a, b) => b.score - a.score || a.order - b.order);
    return { words, results: out.slice(0, MAX) };
  }
  const mark = (text, words) => words.reduce((html, w) => html.replace(new RegExp("\\b(" + reEsc(esc(w)) + ")", "gi"), "<mark>$1</mark>"), esc(text));
  function snippet(text, words) {
    const lower = text.toLowerCase();
    let at = -1;
    for (const w of words) { const i = lower.indexOf(w); if (i >= 0 && (at < 0 || i < at)) at = i; }
    let start = Math.max(0, at - 70);
    const end = Math.min(text.length, start + 190);
    if (start > 0) { const sp = text.indexOf(" ", start); if (sp > 0 && sp < at) start = sp + 1; }
    return (start > 0 ? "…" : "") + mark(text.slice(start, end), words) + (end < text.length ? "…" : "");
  }

  /* ---------- Rendering ---------- */
  let results = [], words = [], active = -1, lastFocus = null;
  function render() {
    const q = input.value.trim();
    if (!q) {
      results = []; active = -1;
      meta.textContent = `${INDEX.length} sections and terms across 3 modules`;
      list.innerHTML = `<li class="gs-empty"><p>Try one of these:</p><div class="chips">${SUGGEST.map(x => `<button type="button" class="chip" data-q="${esc(x)}">${esc(x)}</button>`).join("")}</div></li>`;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    ({ words, results } = run(q));
    active = results.length ? 0 : -1;
    if (!results.length) {
      meta.textContent = "";
      list.innerHTML = `<li class="gs-empty">No matches for “${esc(q)}”. Try a shorter or different word.</li>`;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    meta.textContent = results.length === MAX ? `Top ${MAX} results` : `${results.length} result${results.length === 1 ? "" : "s"}`;
    list.innerHTML = results.map(({ e }, i) => `<li role="option" id="gsOpt${i}" aria-selected="${i === active}"><a href="#${e.sec || ""}" tabindex="-1" data-i="${i}">
        <span class="gs-row"><span class="kind ${KIND[e.kind]}">${e.kind}</span><span class="gs-where">${esc(e.where)}</span></span>
        <span class="gs-h">${mark(e.h, words)}${e.s ? ` <span>› ${mark(e.s, words)}</span>` : ""}</span>
        <span class="gs-snip">${snippet(e.t, words)}</span></a></li>`).join("");
    input.setAttribute("aria-activedescendant", "gsOpt0");
  }
  function setActive(i) {
    const opts = $$('[role="option"]', list);
    if (!opts.length) return;
    active = (i + opts.length) % opts.length;
    opts.forEach((o, k) => o.setAttribute("aria-selected", String(k === active)));
    opts[active].scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", "gsOpt" + active);
  }

  /* ---------- Going to a result ---------- */
  function clearHits() {
    $$("mark.gs-hit").forEach(m => { const p = m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); });
  }
  function markHits(root, ws) {
    const re = new RegExp("\\b(" + ws.filter(w => w.length >= 2 || ws.length === 1).map(reEsc).join("|") + ")", "gi");
    const nodes = [];
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement.closest("svg, script, style, .quiz-fb, mark") || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(node => {
      const text = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(text)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let pos = 0, m;
      while ((m = re.exec(text))) {
        if (m.index > pos) frag.appendChild(document.createTextNode(text.slice(pos, m.index)));
        const mk = document.createElement("mark");
        mk.className = "gs-hit";
        mk.textContent = m[0];
        frag.appendChild(mk);
        pos = m.index + m[0].length;
      }
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }
  function visible(el) { return el && el.offsetParent !== null; }
  function go(i) {
    const r = results[i];
    if (!r) return;
    const e = r.e;
    close(false);
    clearHits();
    const smooth = { behavior: reduceMotion ? "auto" : "smooth", block: "center" };
    if (e.kind === "Term") {
      const order = [cur, ...MODULES.filter(m => m !== cur)].filter(Boolean);
      let btn = null, mod = null;
      for (const m of order) { btn = $(`.term[data-term="${e.key}"]`, m.el); if (btn) { mod = m; break; } }
      if (!btn) return;
      const sec = btn.closest(".sec");
      setModule(mod.id, { section: sec.id });
      if (!visible(btn)) { const d = btn.closest("details"); if (d) d.open = true; }
      btn.scrollIntoView(smooth);
      setTimeout(() => { btn.focus({ preventScroll: true }); openPop(btn); }, reduceMotion ? 0 : 350);
      return;
    }
    setModule(e.mod, { section: e.sec });
    const sec = document.getElementById(e.sec);
    let scope = sec;
    if (e.s) { const h3 = $$("h3.sub", sec).find(h => textOf(h) === e.s); if (h3) scope = h3; }
    markHits(sec, words);
    const hits = $$("mark.gs-hit", sec).filter(visible);
    const inScope = scope === sec ? hits : hits.filter(m => scope.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING);
    const target = inScope[0] || hits[0] || scope;
    target.scrollIntoView(smooth);
    const flash = target.closest("p, li, td, .box, .ex, .wrong, h2, h3, h4, .quiz") || target;
    flash.classList.add("gs-flash");
    setTimeout(() => flash.classList.remove("gs-flash"), 1800);
  }

  /* ---------- Open and close ---------- */
  function open(q) {
    if (!INDEX) INDEX = buildIndex();
    closePop();
    lastFocus = document.activeElement;
    ov.hidden = false;
    document.documentElement.classList.add("gs-open");
    if (typeof q === "string") input.value = q;
    render();
    input.focus();
    input.select();
  }
  function close(restore = true) {
    if (ov.hidden) return;
    ov.hidden = true;
    document.documentElement.classList.remove("gs-open");
    if (restore && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.openSearch = open;

  btn.addEventListener("click", () => open());
  document.addEventListener("click", e => { if (e.target.closest("[data-search-open]")) open(); });
  $("#gsClose").addEventListener("click", () => close());
  ov.addEventListener("mousedown", e => { if (e.target === ov) close(); });
  input.addEventListener("input", render);
  list.addEventListener("click", e => {
    const chip = e.target.closest(".chip[data-q]");
    if (chip) { input.value = chip.dataset.q; render(); input.focus(); return; }
    const a = e.target.closest("a[data-i]");
    if (!a) return;
    e.preventDefault();
    go(+a.dataset.i);
  });
  list.addEventListener("mousemove", e => { const a = e.target.closest("a[data-i]"); if (a && +a.dataset.i !== active) setActive(+a.dataset.i); });
  ov.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter" && e.target === input && active >= 0) { e.preventDefault(); go(active); }
    else if (e.key === "Tab") { e.preventDefault(); (document.activeElement === input ? $("#gsClose") : input).focus(); }
  });
  document.addEventListener("keydown", e => {
    const typing = e.target.closest && e.target.closest("input, textarea, select, [contenteditable]");
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ov.hidden ? open() : close(); }
    else if (e.key === "/" && !typing && ov.hidden && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); open(); }
  });
})();
