/* Module 3 · SDLC versus ADLC, side by side. */
const TRACK_LINKS = {
  "sdlc-planning": { to: ["adlc-framing"], h: "Planning becomes problem framing", note: "Both decide whether the work is worth doing. Framing adds a harder question: does this need an agent, or would a screen or a fixed workflow do? It also sets a risk rating, because an agent's mistakes can be harder to spot." },
  "sdlc-requirements": { to: ["adlc-design", "adlc-prompt"], h: "Requirements split into an agent spec and a prompt", note: "Instead of one PRD with exact acceptance criteria, you write a job description, a tool and permission list, a never-do list, and a system prompt in plain language. Success becomes thresholds measured across a dataset." },
  "sdlc-design": { to: ["adlc-design"], h: "Design becomes agent design", note: "Screen design still matters, but the core design decisions are which tools the agent can use, what each tool can reach, and where a human must approve." },
  "sdlc-build": { to: ["adlc-loop"], h: "Build becomes building the agent loop", note: "Engineers still write and review code, but the main thing they build is a loop around a model, with limits on steps, time and cost, and tracing on every step." },
  "sdlc-testing": { to: ["adlc-eval", "adlc-safety"], h: "Testing splits into evaluation and red-teaming", note: "Pass/fail tests still cover the code and tools. The agent's answers are scored across a golden dataset, and a separate red team attacks it on purpose." },
  "sdlc-deployment": { to: ["adlc-rollout"], h: "Deployment becomes a gated, human-checked rollout", note: "Feature flags still help, but each stage has a quality gate, people review answers before they reach clients, and the stages last weeks rather than days." },
  "sdlc-maintenance": { to: ["adlc-monitor"], h: "Maintenance becomes continuous improvement", note: "Beyond bugs and uptime, you monitor answer quality, cost per question and safety. Quality can drift with no code change, so findings feed straight back into agent design." },
  "adlc-framing": { to: ["sdlc-planning"], h: "Problem framing, compared with planning", note: "Same goal, harder question. Planning asks whether to build. Framing also asks whether the problem is open-ended enough to justify an agent's cost and risk." },
  "adlc-design": { to: ["sdlc-requirements", "sdlc-design"], h: "Agent design covers requirements and design", note: "The agent spec does the job of both the PRD and the technical design. The PM's biggest lever is the tool and permission list, which software never needed in this form." },
  "adlc-prompt": { to: ["sdlc-requirements"], h: "Prompt design is requirements in a new form", note: "The system prompt is a requirement the model reads directly. Changing one sentence changes behaviour, so it needs the review and versioning you'd give code." },
  "adlc-loop": { to: ["sdlc-build"], h: "The agent loop, compared with build", note: "Code review and CI stay. What's new is limits, tool error handling, and tracing every step, because the path through the loop differs from run to run." },
  "adlc-eval": { to: ["sdlc-testing"], h: "Evaluation, compared with testing", note: "Pass/fail on fixed cases becomes scored quality across a dataset. “Done” means meeting thresholds agreed in advance, and the dataset keeps growing after launch." },
  "adlc-safety": { to: ["sdlc-testing"], h: "Red-teaming adds a stage testing barely had", note: "Security testing exists in software, but agents can be talked into misbehaving through ordinary language and documents, so attacking them becomes a stage of its own." },
  "adlc-rollout": { to: ["sdlc-deployment"], h: "Staged rollout, compared with deployment", note: "Software moves from flag to full release in days. An agent moves through shadow mode and pilots with human approval, gated on quality scores." },
  "adlc-monitor": { to: ["sdlc-maintenance"], h: "Monitoring, compared with maintenance", note: "Maintenance fixes what breaks. Agent monitoring also catches quality that slowly gets worse, cost creep and new attack patterns, and it loops back to design rather than only to planning." },
};

/* Four differences you can see at a glance, each drawn twice: software on the left, the agent on the right. */
const PATHS = { software: ["q0", "y0", "o0"], agent: ["q0", "n0", "q1", "n1", "end"], mix: ["q0", "n0", "q1", "y1", "o1"] };
function glance() {
  const box2 = (h, a, sa, b, sb) => `<div><h4>${h}</h4><div class="glance-pair"><div><span>Software</span>${a}<p>${sa}</p></div><div><span>Agent</span>${b}<p>${sb}</p></div></div></div>`;
  const svg = inner => `<svg viewBox="0 0 120 60" aria-hidden="true">${inner}</svg>`;
  const squares = (n, bad = []) => Array.from({ length: n }, (_, i) => `<rect x="${8 + (i % 8) * 13}" y="${12 + Math.floor(i / 8) * 13}" width="10" height="10" rx="2" class="fk-${bad.includes(i) ? "bad" : "final"}"></rect>`).join("");
  const bars = [6, 10, 18, 30, 40, 26].map((h, i) => `<rect x="${10 + i * 17}" y="${52 - h}" width="13" height="${h}" rx="2" class="fk-${i < 1 ? "bad" : "accent"}"></rect>`).join("");
  return `<div class="glance" role="list">${[
    box2("How testing works", svg(squares(16)), "every case passes or fails", svg(bars), "a spread of scores"),
    box2("Behaviour over time", svg('<polyline class="vs-series sk-observe" points="8,30 112,30"></polyline>'), "flat until someone deploys", svg('<line class="vs-mark sk-bad" x1="64" x2="64" y1="6" y2="54"></line><polyline class="vs-series sk-accent" points="8,22 40,20 64,21 80,34 112,38"></polyline>'), "drops after a model update"),
    box2("Cost as usage grows", svg('<polyline class="vs-series sk-observe" points="8,50 112,47"></polyline>'), "close to zero per use", svg('<polyline class="vs-series sk-accent" points="8,52 112,10"></polyline>'), "every question costs money"),
    box2("How it's released", svg('<polyline class="vs-series sk-observe" points="8,52 30,52 30,44 50,44 50,10 112,10"></polyline>'), "flag, then everyone, in days", svg('<polyline class="vs-series sk-accent" points="8,52 26,52 26,48 52,48 52,38 80,38 80,10 112,10"></polyline><circle class="fk-accent" cx="52" cy="48" r="3"></circle><circle class="fk-accent" cx="80" cy="38" r="3"></circle>'), "gated stages over weeks"),
  ].map(x => x.replace("<div><h4>", '<div role="listitem"><h4>')).join("")}</div>`;
}

const SCENARIOS = [
  { s: "Every month, each client receives a PDF statement with holdings, transactions and returns, in a format the regulator expects.", a: "software",
    why: "<strong>Regular software.</strong> The output is identical in shape every time, every figure must be exact, and the format is regulated. Nothing here is open-ended, so an agent would only add cost and risk." },
  { s: "Before calling clients, RMs want to ask things like “Which of my clients are most exposed to the fall in mid-cap funds, and why?”", a: "agent",
    why: "<strong>An agent, read-only and with guardrails.</strong> The questions are open-ended, need several data lookups, and the value is in the plain-language explanation. The agent informs the RM; it never contacts clients or trades." },
  { s: "Each quarter, find clients whose allocation has drifted more than 5% from their model portfolio, propose rebalancing trades, and explain them to the client.", a: "mix",
    why: "<strong>A mix.</strong> A rules engine (regular software) calculates drift and proposes trades, because that must be exact and auditable. An agent drafts the plain-language explanation for each client. The RM approves before anything is sent." },
];

MODULES.push({
  id: "compare", tab: "Compare", example: "Both versions",
  eyebrow: "Module 3 of 3 · SDLC versus ADLC",
  title: "Same feature, two lifecycles",
  lede: "You've seen the <strong>portfolio summary</strong> built as regular software and the <strong>portfolio assistant</strong> built as an agent. This module puts them side by side so you can see <strong>what carries over and what changes for you</strong>.",
  sections: [
    {
      id: "cmp-tracks", rail: "Tracks", eyebrow: "Section 1 · Interactive",
      title: "The two lifecycles as parallel tracks",
      intro: "Click a stage in either track. Its counterpart in the other track lights up, with a note on what changes.",
      body: () => [
        prose("The [[SDLC]] and the [[ADLC]] cover the same ground: decide, specify, design, build, check, release and run. The ADLC has more stages because an [[agent]]'s behaviour is [[probabilistic]], and that needs extra steps to measure and control."),
        `<div class="tracks" data-tracks>
          <div class="track"><div class="track-h"><b>SDLC</b><span>Portfolio summary · 7 stages</span></div>${SDLC_STAGES.map((s, i) => `<button class="tstage" type="button" data-id="${s.id}" aria-pressed="false"><span class="n">${i + 1}</span><span>${s.name}</span></button>`).join("")}</div>
          <div class="track"><div class="track-h"><b>ADLC</b><span>Portfolio assistant · 8 stages</span></div>${ADLC_STAGES.map((s, i) => `<button class="tstage" type="button" data-id="${s.id}" aria-pressed="false"><span class="n">${i + 1}</span><span>${s.short}</span></button>`).join("")}</div>
        </div>
        <div class="tnote" data-tnote aria-live="polite"></div>`,
      ].join(""),
      remember: "Every SDLC stage has an ADLC counterpart. The agent version adds measurement and control at each one.",
    },
    {
      id: "cmp-table", rail: "Table", eyebrow: "Section 2 · Comparison",
      title: "Nine differences, side by side",
      intro: "The same nine questions, answered for each version of the running example.",
      body: () => glance() + table(["Dimension", "Portfolio summary (SDLC)", "Portfolio assistant (ADLC)"], [
        ["How requirements are written", "A [[PRD]] and [[user story|user stories]] with exact [[acceptance criteria]].<span class=\"eg\">“Total value matches the custodian statement to the rupee.”</span>", "An agent spec, a [[system prompt]], and example questions with good answers. Success is a threshold across a [[golden dataset|dataset]].<span class=\"eg\">“98% of figures match tool data on 150 questions.”</span>"],
        ["What “done” means", "Every acceptance criterion passes and [[UAT]] is signed off.", "[[eval|Eval]] scores meet the agreed thresholds, [[red-teaming|red-team]] findings are closed, and the rollout gates are passed. It is never fully finished."],
        ["How testing works", "Pass/fail. The software is [[deterministic]]: the same input always gives the same output, so one failure is a real bug.", "Scored quality. Answers are graded by rules, an [[LLM-as-judge|LLM judge]] and humans across many cases, and you look at rates."],
        ["Can behaviour change without a code change?", "Rarely. It changes when someone deploys, or when data or configuration changes.", "Yes. A prompt edit, a [[model upgrade|model update]] from the provider, or new documents in the context can all change answers. The same question can also get different answers."],
        ["Cost per use", "Close to zero per screen view once built.", "Every question costs money in model [[token|tokens]], about $0.02 typically and more for long questions. Cost needs a budget and alerts."],
        ["Failure types", "Crashes, wrong calculations, slow loads. Usually visible.", "Confident wrong answers ([[hallucination|hallucinations]]), wrong [[tool]] calls, loops, [[prompt injection]], [[data leakage|data leaks]], advice. These often look like success."],
        ["Who is involved", "PM, designer, engineers, QA, DevOps, compliance at review points.", "All of those, plus AI engineers, domain experts who grade answers, a security red team, and compliance throughout."],
        ["Release approach", "[[feature flag|Feature flag]] to a small group, then everyone, over days.", "[[shadow mode|Shadow mode]], then a pilot with [[human-in-the-loop|human approval]] of every answer, then gradual expansion gated on scores, over weeks."],
        ["What monitoring looks like", "Errors, uptime, load time, usage, data freshness.", "All of those, plus [[trace|traces]] of each run, sampled quality scores, feedback, cost per question, and drift after model changes."],
      ], "SDLC versus ADLC"),
      remember: "The biggest shift is from “does it pass?” to “how often is it good enough, and is that still true today?”",
    },
    {
      id: "cmp-same", rail: "Same", eyebrow: "Section 3 · What carries over",
      title: "What stays the same",
      intro: "Most of good product practice carries straight over. Agents add to it; they don't replace it.",
      body: () => [
        fig(`<svg class="venn-svg" viewBox="0 0 520 210" aria-hidden="true">
            <circle class="venn-a" cx="200" cy="105" r="98"></circle><circle class="venn-b" cx="320" cy="105" r="98"></circle>
            <text class="vs-h" x="140" y="100" text-anchor="middle">SDLC</text><text class="vs-ax" x="140" y="120" text-anchor="middle">3 practices</text>
            <text class="vs-h" x="260" y="100" text-anchor="middle">Both</text><text class="vs-ax" x="260" y="120" text-anchor="middle">6 practices</text>
            <text class="vs-h" x="380" y="100" text-anchor="middle">ADLC</text><text class="vs-ax" x="380" y="120" text-anchor="middle">5 practices</text></svg>
          <div class="venn-cols">
            <div><h5 style="color:var(--observe)">Software only</h5><ul><li>Exact acceptance criteria</li><li>Pass/fail test suites</li><li>Release in days behind a flag</li></ul></div>
            <div><h5>Both · unchanged</h5><ul><li>Start from the user's problem: RMs lose 20 minutes per meeting</li><li>One owner, one goal, one metric</li><li>Write decisions and definitions down</li><li>Small, reversible releases</li><li>Evidence before release</li><li>Feedback, retros and compliance review after launch</li></ul></div>
            <div><h5 style="color:var(--accent)">Agent only</h5><ul><li>Golden datasets and scored evals</li><li>Red-teaming</li><li>Human approval of outputs</li><li>A budget for cost per use</li><li>Watching for quality drift</li></ul></div></div>`,
          "Most good product practice sits in the overlap. The agent side adds to it; it doesn't replace it.", { title: "What the two lifecycles share" }),
      ].join(""),
      remember: "If you're a good software PM, you already have most of the habits an agent PM needs.",
    },
    {
      id: "cmp-changes", rail: "PM changes", eyebrow: "Section 4 · What changes for you",
      title: "What changes for the PM",
      intro: "Four parts of the job work differently. Each shows how it was done before and how it's done now.",
      body: () => [
        `<div class="grid g2">${[
          ["Writing requirements", "PRD and stories", '<span class="glyph" style="--c:var(--observe)"><i style="width:34px;height:42px"></i></span>', "Spec, prompt and 150 examples", '<span class="glyph" style="--c:var(--accent)"><i style="width:22px;height:28px"></i><i style="width:22px;height:34px"></i><i style="width:22px;height:42px"></i></span>', "A job description, a tool and permission list, a never-do list, prompt wording, and example answers."],
          ["Defining success metrics", "2 numbers", '<span class="glyph" style="--c:var(--observe)"><i style="width:14px;height:20px"></i><i style="width:14px;height:32px"></i></span>', "5 numbers", '<span class="glyph" style="--c:var(--accent)"><i style="width:10px;height:20px"></i><i style="width:10px;height:32px"></i><i style="width:10px;height:26px"></i><i style="width:10px;height:38px"></i><i style="width:10px;height:14px"></i></span>', "Adoption and time saved, plus quality rate, cost per question, [[latency]] at [[p95]] and safety findings."],
          ["Running QA", "Cases pass or fail", '<span class="glyph" style="--c:var(--final)">' + '<i style="width:9px;height:9px"></i>'.repeat(6) + '</span>', "A scored dataset", '<span class="glyph" style="--c:var(--accent);max-width:90px">' + Array.from({ length: 24 }, (_, i) => `<i style="width:9px;height:9px${[7, 18].includes(i) ? ";background:var(--bad)" : ""}"></i>`).join("") + '</span>', "Owning a golden dataset, reading the scored failures, and deciding what is good enough."],
          ["Planning launches", "A flag and a date", '<span class="glyph" style="--c:var(--observe)"><i style="width:22px;height:10px"></i><i style="width:22px;height:40px"></i></span>', "Gated stages over weeks", '<span class="glyph" style="--c:var(--accent)"><i style="width:14px;height:6px"></i><i style="width:14px;height:14px"></i><i style="width:14px;height:24px"></i><i style="width:14px;height:42px"></i></span>', "Shadow mode, a pilot, written quality gates, human approval and weeks of review."],
        ].map(([h, a, ga, b, gb, txt]) => box(h, `<div class="ft"><div><em>Before</em>${ga}<span class="small">${a}</span></div><span aria-hidden="true">→</span><div><em>Now</em>${gb}<span class="small">${b}</span></div></div>` + p(txt))).join("")}</div>`,
        sub("Acceptance criteria and success metrics, side by side"),
        `<div class="crit">
          ${box("Portfolio summary · acceptance criterion", `<p><q>Given a client with at least one holding, when the RM opens the summary, the total value equals the custodian's end-of-day value to the rupee, and the screen loads within 2 seconds for 95% of opens.</q></p>`, { tag: "SDLC" })}
          ${box("Portfolio assistant · acceptance criterion", `<p><q>On the 150-question golden dataset, at least 98% of answers use only figures returned by tools, 100% of advice-bait questions are declined with the approved wording, and average expert helpfulness is at least 4 out of 5.</q></p>`, { tag: "ADLC", accent: true })}
          ${box("Portfolio summary · success metric", `<p><q>Median meeting-prep time falls from 20 minutes to under 5 within one quarter, and 70% of RMs open the screen at least weekly.</q></p>`, { tag: "SDLC" })}
          ${box("Portfolio assistant · success metric", `<p><q>RMs rate 80% of answers useful, the thumbs-down rate stays under 5%, p95 cost stays under $0.05 per question, and sampled compliance reviews find zero breaches.</q></p>`, { tag: "ADLC", accent: true })}
        </div>`,
        callout("Notice the shape.", "The software criterion is about one case and is true or false. The agent criterion is about rates across many cases, and it includes safety and cost."),
      ].join(""),
      remember: "Write agent requirements as rates over a dataset, and always include a safety and a cost threshold.",
    },
    {
      id: "cmp-decide", rail: "Decide", eyebrow: "Section 5 · Decision guide",
      title: "Regular software, an agent, or both?",
      intro: "Use the simplest thing that works. Answer three questions, then try the scenarios.",
      body: () => [
        fig(ladder([
          { q: "Should the output be the same every time, with exact figures?", yes: { t: "Regular software", k: "observe" } },
          { q: "Does part of the job still need exact, auditable figures?", yes: { t: "A mix: rules calculate, an agent explains, a person approves", k: "act" } },
          { end: { t: "An agent, read-only, with guardrails", k: "accent" } },
        ], "decide") + `<div class="v-tg-btns" role="group" aria-label="Show the path for a scenario"><span class="small muted">Show the path for:</span>${SCENARIOS.map((x, i) => `<button type="button" class="chip" data-path="${x.a}" aria-pressed="false">Scenario ${i + 1}</button>`).join("")}</div>`,
          "Three questions, in order. Pick a scenario below, or tap a button, to light up its path.", { interactive: true, title: "Software, agent or both?" }),
        sub("Three wealth-management scenarios"),
        `<div class="grid g3" data-scenarios>${SCENARIOS.map((x, i) => `<div class="scen" data-a="${x.a}"><span class="eyebrow">Scenario ${i + 1}</span><p class="s">${x.s}</p><div class="opts" role="group" aria-label="Your answer for scenario ${i + 1}">${[["software", "Software"], ["agent", "Agent"], ["mix", "Mix"]].map(([v, l]) => `<button class="chip" type="button" data-v="${v}" aria-pressed="false">${l}</button>`).join("")}</div><div class="verdict" aria-live="polite" data-why="${x.why.replace(/"/g, "&quot;")}"></div></div>`).join("")}</div>`,
      ].join(""),
      remember: "Default to regular software. Add an agent only for the open-ended part, and keep a human in front of clients.",
    },
    {
      id: "cmp-mistakes", rail: "Mistakes", eyebrow: "Section 6 · Common mistakes",
      title: "Three mistakes teams make when they treat an agent like regular software",
      intro: "Each one comes from an SDLC habit that worked well and stops working here.",
      body: () => mistakes([
        { title: "Testing a handful of cases once", habit: ["Test a few cases, then ship", "answers vary from run to run"], looks: "“QA tried 20 questions and they all looked fine, so let's ship.”", why: "A probabilistic system can pass 20 tries and fail on the 21st. Easy hand-picked questions hide real weaknesses.", fix: "Build a golden dataset from real questions, set thresholds before scoring, and re-run it on every prompt, tool or model change." },
        { title: "Treating launch as the finish line", habit: ["Launch, then move on", "quality can drift with no code change"], looks: "Dashboards track uptime and errors only, and nobody owns answer quality after launch.", why: "Answers can get worse after a model update or new data with no code change, and no error will fire.", fix: "Name an owner for weekly trace and feedback review, run a daily automated eval, and send findings back to design." },
        { title: "Relying on the prompt for safety", habit: ["Write the rule in the spec", "a prompt is not a control"], looks: "“The prompt says never give advice and never show other clients' data, so we're covered.”", why: "Prompts can be ignored, misread or overridden by injected text. Instructions are not controls.", fix: "Enforce permissions inside the tools, add [[guardrail]] checks outside the model, and require human approval for anything client-facing." },
      ]),
      remember: "Instructions are not controls. Put the things that must never happen in code and in process.",
    },
    {
      id: "cmp-cheat", rail: "Cheat sheet", eyebrow: "Section 7 · One page",
      title: "Combined cheat sheet",
      intro: "Both lifecycles and the differences that matter, on one page.",
      body: () => cheatSheet({
        eyebrow: "Module 3 · SDLC versus ADLC", title: "Two lifecycles on one page", visual: () => miniLifecycles("both"),
        formula: "Software: <em>specify exactly</em>, test pass/fail, ship. Agent: <em>specify behaviour</em>, score quality, gate, watch, repeat.",
        blocks: [
          { h: "Stage pairs", items: ["Planning ↔ Problem framing", "Requirements ↔ Agent design + Prompts", "Design ↔ Agent design", "Build ↔ Agent loop", "Testing ↔ Evaluation + Red-teaming", "Deployment ↔ Staged rollout", "Maintenance ↔ Monitoring, looping back to design"] },
          { h: "What changes", items: ["Exact criteria → rates over a dataset", "Pass/fail → scored quality", "Behaviour fixed until deploy → can change with no code change", "Near-zero cost per use → cost per question", "Visible failures → failures that look like success", "Days to roll out → weeks with human approval"] },
          { h: "What stays", items: ["Start from the user's problem", "One owner, one goal, one metric", "Write decisions down", "Small, reversible releases", "Evidence before release", "Feedback shapes the next version"] },
          { h: "Software, agent or both?", items: ["Exact, fixed, regulated → software", "Open-ended, multi-lookup, explained in words → agent", "Exact calculation plus explanation → both, with human approval"] },
        ],
        checks: { h: "Before you start any agent project, ask", items: ["Which part of this is truly open-ended?", "What must never happen, and what code prevents it?", "What dataset and thresholds define “good enough”?", "Who reviews quality every week after launch?", "How do we switch back to the previous prompt or model?"] },
      }),
      remember: "Keep the product habits, change how you specify, test, launch and monitor.",
    },
  ],
});
