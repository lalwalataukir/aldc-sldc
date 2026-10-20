/* The landing page: the guide's cover. A short thesis, the one feature built two ways,
   the three modules in reading order with progress, and how to use the guide. */
const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>';

const MODULE_CARDS = {
  sdlc: {
    sum: "The software development life cycle, stage by stage, through the portfolio summary screen.",
    chips: [["requirements", "c-chain"], ["pass/fail tests", "c-obs"], ["feature flags", "c-act"]],
    points: ["Seven stages, each with its owner, the PM's job, the output and what goes wrong", "Waterfall, Agile, Scrum and Kanban, with sprints, standups and retros", "Unit, integration, end-to-end and user acceptance testing", "Staging, feature flags, rollbacks, bug triage and versioning"],
    meta: ["clickable lifecycle wheel", "5-question quiz", "cheat sheet"],
  },
  adlc: {
    sum: "The agent development life cycle, through the portfolio assistant that answers free-form questions.",
    chips: [["probabilistic", "c-plan"], ["evals", "c-obs"], ["guardrails", "c-act"]],
    points: ["Eight stages, from “do we need an agent?” to monitoring", "Golden datasets, LLM-as-judge, human review and regression tests", "Seven agent risks, from hallucination to financial advice", "Traces, feedback, cost, latency and model upgrades"],
    meta: ["clickable loop", "step-through agent trace", "5-question quiz", "cheat sheet"],
  },
  compare: {
    sum: "Both lifecycles side by side, and what changes for you as the PM.",
    chips: [["side by side", "c-chain"], ["decision guide", "c-plan"]],
    points: ["Parallel tracks: click a stage to see its match", "Nine differences in one table", "Acceptance criteria and success metrics for both versions", "Software, an agent or both: three wealth scenarios"],
    meta: ["clickable parallel tracks", "3 scenarios", "combined cheat sheet"],
    hint: "Best after modules 1 and 2.",
  },
};

function renderHome() {
  const el = document.createElement("div");
  el.className = "panel home";
  el.id = "panel-home";
  el.setAttribute("role", "tabpanel");
  el.setAttribute("aria-labelledby", "tab-home");
  el.innerHTML = `
    <section class="hero home-hero"><div class="hero-text">
      <span class="eyebrow">Interactive guide for product managers · 3 modules</span>
      <h1>How software and AI agents get built, for product managers</h1>
      <p class="lede">One wealth-management feature, built two ways. First as a <strong>portfolio summary</strong> screen, built with the software development life cycle. Then as a <strong>portfolio assistant</strong>, an AI agent built with the agent development life cycle. Each module stands on its own, explains every term in plain language, and ends with a quiz and a one-page cheat sheet.</p>
      <div class="btnrow" data-home-cta></div>
      <button class="search-hero" type="button" data-search-open>${SEARCH_ICON}<span>Search stages, sections and terms, e.g. rollback, golden dataset</span><kbd class="kbd">/</kbd></button>
    </div><div class="hero-art">${miniLifecycles("both")}</div></section>

    <section class="twoways" aria-labelledby="twoh">
      <div class="deep-head"><span class="eyebrow">The running example</span><h2 id="twoh">One feature, built two ways</h2></div>
      <div class="grid g2">
        <div class="box">
          ${tag("Built as software · Module 1")}
          <h4>Portfolio summary</h4>
          <p>A screen in the relationship manager's app that pulls a client's holdings and shows fixed charts and numbers. The same input gives the same output, every time.</p>
          ${wireframe("desktop")}
        </div>
        <div class="box">
          ${tag("Built as an agent · Module 2", true)}
          <h4>Portfolio assistant</h4>
          <p>Answers a wealth manager's free-form questions about a client's portfolio, using tools to fetch data and explain it. Answers can vary, so quality is measured rather than assumed.</p>
          <div class="chat"><p class="q">Why is the Mehta portfolio down this quarter?</p>
            <div class="a"><span>Down 4.1% in Q3 against −1.6% for the benchmark, mostly from its 38.4% weight in IT stocks.</span><small>3 tool calls · 4.5 s · $0.035 · draft for your review</small></div></div>
          <div class="phase-strip" aria-label="The agent loop"><span class="vc-think">think</span><span class="vc-act">act</span><span class="vc-observe">observe</span><span class="vc-final">final</span></div>
        </div>
      </div>
      <p class="small muted">The Mehta family and every figure in this guide are illustrative.</p>
    </section>

    <section class="home-mods" aria-labelledby="modh">
      <div class="deep-head"><span class="eyebrow">Modules</span><h2 id="modh">Read them in order, or start anywhere</h2></div>
      <div class="modules three">${MODULES.map((m, i) => {
        const c = MODULE_CARDS[m.id];
        return `<article class="module" data-card="${m.id}">
          <span class="num">${i + 1}</span>
          <h2><a href="#${m.id}">${m.title}</a></h2>
          <p class="sum">${c.sum}</p>
          <div class="chips">${c.chips.map(([t, cls]) => `<span class="chip ${cls}">${t}</span>`).join("")}</div>
          <ul>${c.points.map(x => `<li>${x}</li>`).join("")}</ul>
          <div class="meta"><span data-minutes></span><span>${m.sections.length} sections</span>${c.meta.map(x => `<span>${x}</span>`).join("")}</div>
          <div class="meter-row"><div class="v-cells" aria-hidden="true">${m.sections.map(() => "<i></i>").join("")}</div><span class="mono small" data-read></span></div>
          <span class="cta" aria-hidden="true" data-cta>Start module ${i + 1} →</span>
          ${c.hint ? `<p class="hint-line">${c.hint}</p>` : ""}
        </article>`;
      }).join("")}</div>
    </section>

    <section class="how" aria-labelledby="howh">
      <div class="deep-head"><span class="eyebrow">Before you start</span><h2 id="howh">How to use this guide</h2></div>
      <div class="tips">
        <div class="tip"><b>Tap dotted terms</b><p>The first time a technical word appears in a module, it has a dotted underline. Tap it for a plain-language definition.</p></div>
        <div class="tip"><b>Break things on purpose</b><p>Each lifecycle map has a “What could go wrong” switch that replays a realistic failure and how the team caught it.</p></div>
        <div class="tip"><b>Search anything</b><p>Press <kbd class="kbd">/</kbd> or use Search in the top bar to find any stage, section or term across all three modules.</p></div>
        <div class="tip"><b>Keep the cheat sheets</b><p>Each module ends with a one-page summary, every term it uses, and the questions to ask your team.</p></div>
      </div>
    </section>`;
  return el;
}

/* Called each time the home view is shown: progress, reading time and the resume button. */
function refreshHome(read) {
  const el = $("#panel-home");
  MODULES.forEach((m, i) => {
    const card = $(`[data-card="${m.id}"]`, el);
    const done = m.sections.filter(s => read.has(s.id)).length;
    const words = (m.el.textContent.match(/\S+/g) || []).length;
    $("[data-minutes]", card).textContent = `about ${Math.max(5, Math.round(words / 200 / 5) * 5)} min`;
    $$(".v-cells i", card).forEach((c, j) => c.classList.toggle("is-read", read.has(m.sections[j].id)));
    $("[data-read]", card).textContent = `${done} of ${m.sections.length} read`;
    $("[data-cta]", card).textContent = done === m.sections.length ? `Review module ${i + 1} →` : done ? `Continue module ${i + 1} →` : `Start module ${i + 1} →`;
  });
  const last = store.get("sldc.last", null);
  const lastMod = last && MODULES.find(m => m.sections.some(s => s.id === last));
  const cta = $("[data-home-cta]", el);
  if (lastMod) {
    const s = lastMod.sections.find(x => x.id === last);
    cta.innerHTML = `<a class="btn btn-primary" href="#${s.id}">Continue: ${lastMod.tab} · ${s.rail}</a><a class="btn" href="#${MODULES[0].id}">Start from module 1</a>`;
  } else {
    cta.innerHTML = `<a class="btn btn-primary" href="#${MODULES[0].id}">Start module 1 · SDLC</a><a class="btn" href="#compare">Jump to the comparison</a>`;
  }
}
