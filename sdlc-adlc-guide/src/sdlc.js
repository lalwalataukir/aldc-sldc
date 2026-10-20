/* Module 1 · The software development life cycle, told through the portfolio summary screen. */
const SDLC_STAGES = [
  {
    id: "sdlc-planning", name: "Planning", rail: "Planning",
    title: "Planning · decide what to build and why",
    intro: "Planning is where the team agrees that a problem is worth solving, how big it is, and what success would look like. Nothing gets designed yet.",
    owner: ["PM"], with: ["Engineering lead", "Designer", "Business stakeholders"],
    what: [
      "The team looks at a problem, estimates how much it matters, and decides whether to spend time on it now. They agree on a goal and a rough size of the work.",
      "The decision lands on the [[roadmap]], the shared plan of what gets built in which order.",
    ],
    pm: ["Frame the problem in the user's words", "Size the opportunity with data", "Set one goal and one [[success metric]]", "Agree rough scope and timing with the engineering lead", "Get sign-off from [[stakeholder|stakeholders]]"],
    output: ["A one-page brief", "A roadmap item with a rough estimate", "A first success metric"],
    example: [
      "Relationship managers (the wealth managers who look after clients, called RMs here) spend about 20 minutes building a summary in a spreadsheet before every client meeting. The bank has 400 RMs.",
      "The goal is a <strong>portfolio summary</strong> screen that shows a client's total value, allocation and returns on one page, and cuts prep time below 5 minutes. Engineering sizes it at about six weeks for two engineers.",
    ],
    visual: () => `<div class="figs">${fig(hbars([{ l: "Prep time today", v: 20, d: "20 min", k: "bad" }, { l: "Goal with the new screen", v: 5, d: "5 min", k: "final" }], { max: 20 }) + `<div class="calc"><span>400 RMs</span>×<span>8 meetings a week</span>×<span>15 min saved</span>=<span><b>800 hours a week</b></span></div>`, "Sizing the opportunity: the time RMs spend on prep today, and what the goal frees up.", { illustrative: true, title: "Why it's worth building" })}
      ${fig(hbars([{ l: "v1 as agreed", v: 6, d: "6 weeks", k: "accent" }, { l: "With every request added", v: 26, d: "about 6 months", k: "bad" }], { max: 26 }) + `<div class="v-chips"><em>Backlog: tax-loss ideas</em><em>Backlog: goal tracking</em><em>Backlog: client PDF</em></div>`, "Scope creep in one picture: three extra asks would have quadrupled the timeline, so they wait in the backlog.", { illustrative: true, title: "What protecting scope saves" })}</div>`,
    wrong: {
      title: "Scope creep",
      what: "In the planning review, stakeholders ask for tax-loss suggestions, goal tracking and a client-facing PDF. The six-week project quietly becomes six months. This is [[scope creep]].",
      caught: "The PM checks every request against the one goal (meeting prep under 5 minutes). Requests that don't serve it go into the backlog for later, with a note on who asked.",
      timeline: [["Mon 10:00", "e-run", "planning_review", "goal agreed: prep under 5 min"], ["Mon 10:40", "e-tool", "scope_request", "+ tax-loss ideas, + goal tracking, + client PDF"], ["Mon 11:05", "e-bad", "estimate_change", "6 weeks → 6 months"], ["Mon 11:20", "e-human", "pm_decision", "keep v1 to the goal; 3 asks moved to backlog"]],
    },
  },
  {
    id: "sdlc-requirements", name: "Requirements", rail: "Requirements",
    title: "Requirements · write down exactly what it must do",
    intro: "Requirements turn the goal into precise, testable statements that designers, engineers and testers all read the same way.",
    owner: ["PM"], with: ["Designer", "Engineers", "QA", "Compliance"],
    what: [
      "The PM writes a [[PRD]] that describes the problem, the users, what's in and out of scope, and how success is measured.",
      "The work is then broken into [[user story|user stories]], each with [[acceptance criteria]]. These are the yes/no checks that say a story is done. [[non-functional requirement|Non-functional requirements]] cover speed, security and reliability.",
    ],
    pm: ["Write the PRD and user stories", "Write acceptance criteria that can be tested", "Define every business term (what does “return” mean?)", "Review with design, engineering, QA and compliance", "Keep a list of open questions until each one has an owner"],
    output: ["PRD", "User stories with acceptance criteria", "Non-functional requirements (for example, loads in under 2 seconds)", "Definitions of business terms"],
    example: [
      "The PM turns the goal into one user story with three testable acceptance criteria, plus a definitions section that says exactly which return to show.",
    ],
    visual: () => fig(`<div class="story"><div class="story-top"><b>PS-14</b><span>User story · portfolio summary v1</span></div>
        <h4>See a client's whole portfolio on one screen</h4>
        <p><q>As an RM, I want to see a client's total value, allocation and returns on one screen, so I can prepare for a meeting in minutes.</q></p>
        <span class="eyebrow">Acceptance criteria</span>
        <ul class="ac"><li>Total value matches the [[custodian]] statement at the last market close, to the rupee</li><li>Allocation adds up to 100%</li><li>The screen loads in under 2 seconds for 95% of opens</li></ul>
        <div class="story-defs"><span class="eyebrow">Definitions · same client, same year, two answers</span>${hbars([{ l: "Absolute return", v: 6.2, d: "6.2%", k: "muted" }, { l: "XIRR (counts the ₹50,00,000 March top-up)", v: 9.1, d: "9.1%", k: "accent" }], { max: 10 })}</div></div>`,
      "The user story as the team sees it in Jira. The definitions footer settles which return the screen shows.", { illustrative: true }),
    wrong: {
      title: "One word, two meanings",
      what: "The PRD says “show returns”. Engineering builds simple absolute return. The advisory team expects [[XIRR]], which accounts for when money went in and out. For a client who added ₹50,00,000 in March, the two numbers differ by several points.",
      caught: "QA writes test cases from the acceptance criteria before any code is written, and can't write the expected value for “returns”. The PM adds a definitions section: returns are XIRR since inception and absolute for the last 12 months.",
      timeline: [["Day 2", "e-run", "prd_review", "story PS-14 “show returns” approved"], ["Day 3", "e-tool", "qa_test_design", "PS-14: expected value unclear (absolute or XIRR?)"], ["Day 3", "e-bad", "open_question", "advisory expects XIRR; engineering assumed absolute"], ["Day 4", "e-human", "pm_update", "definitions added to PRD v1.2"]],
    },
  },
  {
    id: "sdlc-design", name: "Design", rail: "Design",
    title: "Design · decide how it looks and how it's built",
    intro: "Design has two halves. Product design decides what the user sees and does. Technical design decides how the system will work behind the screen.",
    owner: ["Designer", "Engineering lead"], with: ["PM", "Users for testing"],
    what: [
      "The designer sketches [[wireframe|wireframes]], then detailed mockups in Figma, then a clickable [[prototype]] that real users can try.",
      "Engineers write a technical design. It says which systems supply the data, how the [[frontend]] (what runs in the RM's app) talks to the [[backend]] (the servers) through an [[API]], and where the data lives in the [[database]].",
    ],
    pm: ["Check every design against the requirements", "Bring user feedback to design reviews", "Make trade-offs when the ideal design costs too much", "Join technical design reviews and ask what could fail", "Confirm what's in v1 and what waits"],
    output: ["Wireframes and Figma mockups", "A clickable prototype", "Usability test notes", "A technical design document with the API contract"],
    example: [
      "Four parts on one screen: total value, an allocation donut, performance against a benchmark, and the top holdings. Behind it, one API call returns everything from a [[cache]] rebuilt after each market close.",
    ],
    visual: () => fig(toggleViews("wire", [{ label: "Desktop mockup", html: wireframe("desktop") }, { label: "On a tablet", html: wireframe("tablet") }, { label: "Tablet, after the redesign", html: wireframe("fixed") }]),
        "The portfolio summary wireframe. Switch to the tablet view to see what the usability test found, then the fix.", { interactive: true, illustrative: true })
      + fig(flow([{ t: "RM app", s: "the frontend", k: "accent" }, { t: "Summary API", s: "GET /clients/{id}/summary", k: "think" }, { t: "Nightly cache", s: "rebuilt after market close", k: "observe" }, { t: "Source systems", chips: ["Portfolio system: holdings", "Market data: prices"], k: "muted" }], ["asks for one client", "reads", "refreshed from"]),
        "The technical design: how the screen gets its numbers in one fast call."),
    wrong: {
      title: "It only works on a large screen",
      what: "The mockups look clean on a desktop monitor. Most RMs use a tablet in client meetings, where the holdings table overflows and the charts shrink until they can't be read.",
      caught: "A usability test with five RMs, each using the prototype on a tablet, shows the problem in the first session. The designer reworks the layout before any code exists, when the fix still costs hours rather than weeks.",
      timeline: [["Week 2", "e-run", "design_review", "mockups approved on desktop"], ["Week 2", "e-tool", "usability_test", "5 RMs, prototype on tablet"], ["Week 2", "e-bad", "finding", "4 of 5 RMs could not read the holdings table"], ["Week 3", "e-human", "redesign", "stacked cards on tablet; table moves behind a tap"]],
    },
  },
  {
    id: "sdlc-build", name: "Build", rail: "Build",
    title: "Build · engineers write and review the code",
    intro: "Engineers turn the designs into working software, in small pieces that another engineer reviews before they're combined.",
    owner: ["Engineers"], with: ["PM", "Designer", "QA"],
    what: [
      "Code lives in a [[repository]], a shared folder with full history, usually on GitHub. Each change goes in as a [[pull request]]. That's a proposed change that another engineer checks in a [[code review]] before it's merged.",
      "Engineers also write automated tests alongside the code, and a [[CI/CD]] pipeline runs those tests on every change.",
    ],
    pm: ["Answer engineers' questions the same day", "Protect scope: new ideas go to the backlog", "Review work-in-progress demos", "Keep stakeholders updated on progress and risks", "Track [[tech debt]] the team chooses to take on"],
    output: ["Reviewed, merged code", "Automated tests", "A working build on a test environment", "Demo notes"],
    example: [
      "The backend team builds the summary endpoint and the frontend team builds the charts. Every change travels the same path into the main code.",
    ],
    visual: () => fig(flow([{ t: "Branch", s: "allocation-calc", k: "muted" }, { t: "Pull request #212", s: "the proposed change", k: "accent" }, { t: "CI runs tests", s: "1 unit test fails", k: "bad" }, { t: "Code review", s: "use market value, not cost", k: "act" }, { t: "Merged", s: "all tests pass", k: "final" }], ["opens", "triggers", "fix pushed", "approved"]),
      "How one change reaches the main code. The failing test and the reviewer both catch the allocation bug before it's merged. Below: the response an engineer sees from the finished endpoint."),
    extra: code([
      '<span class="c">// GET /clients/CL-20417/summary  (illustrative response)</span>',
      '{',
      '  <span class="k">"client"</span>: <span class="s">"Mehta family"</span>,',
      '  <span class="k">"as_of"</span>: <span class="s">"2026-09-30"</span>,',
      '  <span class="k">"total_value_inr"</span>: 48260000,',
      '  <span class="k">"allocation_pct"</span>: { <span class="k">"equity"</span>: 64.0, <span class="k">"debt"</span>: 24.5, <span class="k">"gold"</span>: 6.5, <span class="k">"cash"</span>: 5.0 },',
      '  <span class="k">"return_1y_pct"</span>: 9.8,',
      '  <span class="k">"xirr_since_inception_pct"</span>: 11.2',
      '}',
    ], "Example API response"),
    wrong: {
      title: "The right formula on the wrong number",
      what: "An engineer calculates allocation from the price the client paid ([[cost basis]]) instead of today's market value. The Mehta family's equity share shows 52% when it is really 64%.",
      caught: "A [[unit test]] written from the acceptance criteria compares the result with a hand-checked value and fails. The reviewer of the pull request spots the wrong field, and the change is fixed before it's merged.",
      timeline: [["14:02", "e-run", "pr_opened", "#212 allocation calc"], ["14:06", "e-tool", "ci_run", "unit tests started"], ["14:09", "e-bad", "test_failed", "allocation_equity expected 64.0, got 52.1"], ["14:30", "e-human", "review_comment", "use market_value, not cost_basis"]],
    },
  },
  {
    id: "sdlc-testing", name: "Testing", rail: "Testing",
    title: "Testing · prove it does what the requirements say",
    intro: "Testing checks the software against the acceptance criteria, then tries hard to break it with unusual cases.",
    owner: ["QA"], with: ["Engineers", "PM", "Real users for UAT"],
    what: [
      "[[QA]] engineers write test cases from the acceptance criteria and run them, many automatically, on a test copy of the system. They try [[edge case|edge cases]], the unusual inputs that break things.",
      "At the end, the PM and a few real users do [[UAT]] to confirm it solves the problem. That's covered in depth in the testing section below.",
    ],
    pm: ["Make sure every acceptance criterion has a test", "Supply realistic test data and edge cases", "Decide which bugs block release", "Run or organise UAT with real RMs", "Sign off when the release criteria are met"],
    output: ["Test cases", "A test report with pass/fail results", "A list of bugs with priorities", "UAT sign-off"],
    example: [
      "QA runs every acceptance criterion against a set of test clients chosen to break things, and compares each screen with the custodian statement for the same day.",
    ],
    visual: () => fig(`<div class="cov"><span class="h">Test client</span><span class="h">Value matches</span><span class="h">Allocation 100%</span><span class="h">Loads &lt; 2 s</span>
        ${[["Typical family · 14 holdings", 1, 1, 1], ["Large · 300 holdings", 1, 1, 1], ["US stocks priced in dollars", 1, 1, 1], ["New client · 0 holdings", 0, 0, 0]].map(([n, ...r]) => `<span class="r">${n}</span>${r.map(x => `<span class="${x ? "ok" : "no"}">${x ? "Pass" : "Fail"}</span>`).join("")}`).join("")}</div>`,
      "Test clients against acceptance criteria. One row of red is the release-blocking bug described below.", { illustrative: true }),
    wrong: {
      title: "The new client with nothing in the account",
      what: "A client who has just opened an account has zero holdings. The allocation calculation divides by a total of zero, and the whole screen fails to load.",
      caught: "QA's edge-case list includes “client with no holdings”. The test fails on the test environment, the bug is logged as release-blocking, and the screen now shows “No holdings yet” instead.",
      timeline: [["Day 18", "e-run", "test_suite", "142 cases started"], ["Day 18", "e-res", "results", "141 passed"], ["Day 18", "e-bad", "test_failed", "TC-88 client with zero holdings: screen error"], ["Day 19", "e-human", "triage", "P0, blocks release; fixed and re-tested"]],
    },
  },
  {
    id: "sdlc-deployment", name: "Deployment", rail: "Deployment",
    title: "Deployment · release it to real users, carefully",
    intro: "Deployment moves the tested software to the live system that real users touch, usually a little at a time.",
    owner: ["DevOps", "Engineers"], with: ["PM", "Support", "Training"],
    what: [
      "[[deployment|Deploying]] copies the new version from [[staging]] (a rehearsal copy of the system) to [[production]] (the real one).",
      "Teams often hide a new feature behind a [[feature flag]], a switch that turns it on for some users and off for others. If something breaks, they can turn the flag off or do a [[rollback]] to the previous version.",
    ],
    pm: ["Make the go or no-go call with engineering", "Write the [[release note]]", "Plan who gets it first", "Brief support and train users", "Watch the launch metrics on day one"],
    output: ["The release in production", "A release note", "A rollout plan", "A [[runbook]] for what to do if it breaks"],
    example: [
      "Version 1.0 goes to 40 of 400 RMs behind a feature flag. When it slows down, the flag goes off within minutes, and a fixed version reaches everyone a week later.",
    ],
    visual: () => {
      const x = ["Mon 9:00", "10:00", "10:42", "10:47", "Thu", "Next Mon"];
      const marks = [{ i: 2, l: "alert", k: "bad", left: true }, { i: 3, l: "flag off", k: "accent" }];
      return `<div class="figs">${fig(lineChart({ x, step: true, series: [{ v: [0, 10, 10, 0, 10, 100], k: "accent", l: "RMs with the new screen", labels: [[1, "10%"], [5, "100%", false]] }], y: { min: 0, max: 100, ticks: [0, 50, 100], fmt: v => v + "%" }, marks }), "Share of RMs who see the new screen.", { illustrative: true, title: "Who has it" })}
        ${fig(lineChart({ x, series: [{ v: [null, 1.6, 14.2, null, 1.4, 1.4], k: "bad", l: "p95 load time", labels: [[2, "14.2 s", false]] }], y: { min: 0, max: 16, ticks: [0, 4, 8, 12, 16], fmt: v => v + " s" }, goal: { v: 2, l: "target 2 s" }, marks }), "Load time for the slowest 5% of opens. The spike trips the alert; turning the flag off is the rollback.", { illustrative: true, title: "How fast it is" })}</div>`;
    },
    wrong: {
      title: "Slow in production, fast everywhere else",
      what: "Production has far more data than staging. For clients with more than 200 holdings, the summary takes 14 seconds and some requests time out.",
      caught: "Monitoring dashboards show the slowest 5% of loads (the [[p95]] time) jumping from 1.6 to 14 seconds within an hour of the flag opening. The team turns the flag off, fixes a missing database index, and releases again two days later.",
      timeline: [["10:00", "e-run", "flag_on", "portfolio_summary → 40 RMs"], ["10:42", "e-bad", "alert", "p95 load time 14.2 s (target 2 s)"], ["10:47", "e-human", "flag_off", "rollback to previous screen"], ["Thu", "e-run", "redeploy", "index added; p95 1.4 s"]],
    },
  },
  {
    id: "sdlc-maintenance", name: "Maintenance", rail: "Maintenance",
    title: "Maintenance · keep it working and improve it",
    intro: "After launch the software needs fixing, updating and improving. What the team learns here feeds the next round of planning.",
    owner: ["Engineers on call"], with: ["PM", "Support", "QA"],
    what: [
      "[[monitoring|Monitoring]] tools watch errors, speed and usage. Support passes on user complaints. The team fixes bugs in order of priority through [[bug triage]] and ships small updates.",
      "Usage data and feedback go into the next planning cycle, so the lifecycle starts again.",
    ],
    pm: ["Run weekly bug triage", "Balance fixes against new features", "Review the success metric against the goal", "Collect feedback for the next version", "Retire features nobody uses"],
    output: ["Bug fixes and small patch releases", "A metrics review", "A backlog for version 1.1"],
    example: [
      "Six weeks in, prep time is down from 20 minutes to 6, still short of the 5-minute goal. That gap, and RMs' request to compare two dates, go into planning for version 1.1.",
    ],
    visual: () => fig(lineChart({ x: ["Before", "Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"], series: [{ v: [20, 12, 9, 8, 7, 6.5, 6], k: "accent", l: "Median prep time", labels: [[0, "20 min"], [6, "6 min", false]] }], y: { min: 0, max: 22, ticks: [0, 5, 10, 15, 20], fmt: v => v }, goal: { v: 5, l: "goal 5 min" }, marks: [{ i: 4, l: "stale-prices alert", k: "bad" }] }),
      "Median meeting-prep time in minutes, week by week after launch. The success metric is close, not met.", { illustrative: true, title: "Is it working?" }),
    wrong: {
      title: "Stale prices that look fine",
      what: "The market-data vendor changes its file format. The nightly price update quietly fails, and the screen shows yesterday's prices as if they were current.",
      caught: "A freshness alert fires when any price is older than one trading day. The on-call engineer sees it before markets open, re-runs the import with the new format, and the screen gains a visible “prices as of” date.",
      timeline: [["02:00", "e-tool", "price_import", "vendor file received"], ["02:01", "e-bad", "parse_error", "unknown column “LTP_ADJ”; 0 rows loaded"], ["07:30", "e-bad", "freshness_alert", "prices older than 1 trading day"], ["08:10", "e-human", "on_call_fix", "import re-run; “prices as of” label added"]],
    },
  },
];

const SDLC_REMEMBER = [
  "Agree one goal and one success metric before anyone designs anything.",
  "If QA can't write a test from your acceptance criterion, rewrite the criterion.",
  "Test designs with real users on their real devices before any code is written.",
  "Your fastest contribution during build is a same-day answer to a blocking question.",
  "Every acceptance criterion needs a test, and every test needs realistic data, edge cases included.",
  "Release to a small group behind a flag, and know how to turn it off before you turn it on.",
  "Monitor whether the data is correct, not only whether the app is up.",
];

MODULES.push({
  id: "sdlc", tab: "SDLC", example: "Portfolio summary",
  eyebrow: "Module 1 of 3 · The software development life cycle",
  title: "How a fixed software feature gets built",
  lede: "Follow one feature, the <strong>portfolio summary</strong> screen, from idea to its sixth week in production. Along the way you'll learn what each team does, what <strong>you</strong> do as the PM, and where things usually go wrong.",
  sections: [
    {
      id: "sdlc-why", rail: "Why", eyebrow: "Section 1 · Foundations",
      title: "What the SDLC is and why it exists",
      intro: "Building software involves many people making many decisions. The SDLC is the shared order those decisions happen in.",
      body: () => [
        prose(
          "The [[SDLC|software development life cycle]] is the sequence a team follows to turn an idea into working software and keep it working. It has seven stages: planning, requirements, design, build, testing, deployment and maintenance.",
          "It exists because mistakes get more expensive the later you find them, so the SDLC puts the cheap checks first."
        ),
        fig(hbars([{ l: "Planning", v: 1, d: "1×", k: "accent" }, { l: "Requirements", v: 3, d: "3×", k: "accent" }, { l: "Design", v: 5, d: "5×", k: "accent" }, { l: "Build", v: 10, d: "10×", k: "accent" }, { l: "Testing", v: 15, d: "15×", k: "accent" }, { l: "In production", v: 65, d: "30–100×", k: "bad" }], { max: 65 }),
          "Relative cost of fixing the same mistake, by the stage where it's found: a conversation, then a redesign, a rewrite, and finally an apology to users.", { illustrative: true, title: "The later you find it, the more it costs" }),
        grid(3, [
          box("The running example", p("A <strong>portfolio summary</strong> screen in the app RMs use. It pulls one client's holdings and shows the same fixed charts and numbers every time."), { tag: "Portfolio summary", accent: true }),
          box("Why it suits the SDLC", p("The output is fully predictable. The same holdings always give the same total, so you can write exact rules and test them with a clear pass or fail.")),
          box("The client in every example", p("The Mehta family, an illustrative client: 14 holdings, total value ₹4,82,60,000 at the end of September 2026.")),
        ]),
        callout("Plain definition.", "A lifecycle is a loop, not a line. What you learn in maintenance becomes the input to the next round of planning."),
      ].join(""),
      remember: "The SDLC exists to find mistakes while they are still cheap to fix.",
    },
    {
      id: "sdlc-map", rail: "Map", eyebrow: "Section 2 · Interactive",
      title: "Explore the lifecycle wheel",
      intro: "Click or tab to a stage to see its summary. Turn on “What could go wrong” to replay a scripted failure from the portfolio summary project.",
      body: () => `<div class="mapper" data-map="sdlc"><figure><div class="diagram" data-svg></div><figcaption>Seven stages run clockwise. Maintenance feeds back into planning for the next version.</figcaption></figure><div class="detail" data-detail aria-live="polite"></div></div>`,
      remember: "Every stage has an owner, an output and a typical failure. Know all three for each stage.",
    },
    ...SDLC_STAGES.map((s, i) => ({
      id: s.id, rail: s.rail, eyebrow: `Stage ${i + 1} of 7 · ${s.name}`, title: s.title, intro: s.intro,
      body: () => stageBody(s, "Portfolio summary", i, SDLC_STAGES, "SDLC lifecycle"), remember: SDLC_REMEMBER[i],
    })),
    {
      id: "sdlc-methods", rail: "Methods", eyebrow: "Section 10 · Ways of working",
      title: "Waterfall, Agile, Scrum and Kanban",
      intro: "The seven stages are always there. Methodologies differ in how big each pass through them is, and how often the team loops.",
      body: () => [
        fig(`<div class="wa">
          <div class="wa-row"><b>Waterfall</b><div class="wa-track">${[["Plan", 1, "think"], ["Requirements", 2, "observe"], ["Design", 2, "act"], ["Build", 4, "graph"], ["Test", 2, "final"], ["Release", 1, "accent"]].map(([t, w, k], i, a) => `<span class="${VC(k)}${i === a.length - 1 ? " ship" : ""}" style="--w:${w}">${t}</span>`).join("")}</div></div>
          <div class="wa-row"><b>Agile</b><div class="wa-track">${[1, 2, 3, 4, 5, 6].map(n => `<span class="vc-accent ship" style="--w:2">Sprint ${n}</span>`).join("")}</div></div>
          <div class="wa-axis"><span></span><span><em>Week 1</em><em>Week 12</em></span></div></div>`,
          "The same 12 weeks, two ways. Waterfall makes one pass and users see something at the end; Agile ships a working piece every two weeks (green dot) and adjusts as it learns.", { title: "One big pass, or many small ones" }),
        grid(2, [
          box("Waterfall", p("Each stage finishes before the next starts. <strong>Fits when</strong> requirements are fixed up front, like a regulator-mandated report."), { tag: "One big pass" }),
          box("Agile", p("[[Agile]] means small increments, shown often, with the plan changing as you learn. <strong>Fits</strong> most product work."), { tag: "Many small passes", accent: true }),
          box("Scrum", p("A popular way to do Agile, with fixed [[sprint|sprints]] and set meetings. <strong>Fits</strong> a stable team building over months."), { tag: "Fixed timeboxes" }),
          box("Kanban", p("Work flows across a board with a cap on work in progress, a [[WIP limit]]. <strong>Fits</strong> unpredictable work like support fixes."), { tag: "Continuous flow" }),
        ]),
        fig(`<div class="kanban">
          <div><h5>To do</h5><p>Compare two dates<em>PS-31 · story</em></p><p>Export summary as PDF<em>PS-27 · story</em></p><p>Rename “Other” asset class<em>PS-35 · bug</em></p></div>
          <div><h5>In progress <b>3 of 3</b></h5><p>Show REITs as their own asset class<em>PS-29 · story</em></p><p>“Prices as of” label<em>PS-33 · bug</em></p><p>Faster load for 300+ holdings<em>PS-30 · tech debt</em></p></div>
          <div><h5>Done</h5><p>Zero-holdings empty state<em>PS-22 · bug</em></p><p>XIRR definition in tooltip<em>PS-24 · story</em></p></div></div>`,
          "A Kanban board for the summary screen after launch. “In progress” is full at its WIP limit of 3, so nothing new starts until something finishes.", { illustrative: true, title: "Kanban: pull work, cap what's in progress" }),
        sub("The Scrum rhythm in one two-week sprint"),
        `<div class="sprint" role="img" aria-label="A ten-working-day sprint: planning on day 1, daily standups, backlog grooming on day 6, review and retro on day 10">${["Plan", "Standup", "Standup", "Standup", "Standup", "Groom", "Standup", "Standup", "Standup", "Review · Retro"].map((t, i) => `<div class="${[0, 5, 9].includes(i) ? "hi" : ""}"><b>D${i + 1}</b>${t}</div>`).join("")}</div>`,
        grid(2, [
          box("Sprint planning · day 1", p("The team pulls the top stories from the [[backlog]] and estimates them in [[story points]].")),
          box("Daily standup · 15 minutes", p("A [[standup]]: done, next, blocked. Listen for blockers you can clear.")),
          box("Backlog grooming · mid-sprint", p("Make the next stories ready: acceptance criteria written, questions answered.")),
          box("Review and retro · last day", p("Demo what's finished, then a [[retrospective|retro]] on how the team worked.")),
        ]),
        callout("For the portfolio summary.", "Three two-week sprints: the API and value card, then the charts, then the holdings table and bug fixes, each ending with a demo to five RMs."),
      ].join(""),
      remember: "Pick the method that matches how predictable your work is. Most product teams use a flavour of Agile.",
    },
    {
      id: "sdlc-testing-deep", rail: "Testing types", eyebrow: "Section 11 · Testing in depth",
      title: "Four kinds of test, from small to whole",
      intro: "Tests come in sizes. Small tests are fast and many; large tests are slow and few. Together they catch different problems.",
      body: () => [
        fig(pyramid([
          { t: "User acceptance testing", meta: "5 real RMs · days · owned by the PM", k: "accent" },
          { t: "End-to-end tests", meta: "about 12 journeys · minutes · QA", k: "act" },
          { t: "Integration tests", meta: "about 60 checks · seconds · engineers", k: "observe" },
          { t: "Unit tests", meta: "thousands · milliseconds · engineers", k: "think" },
        ]), "The test pyramid: many fast, cheap tests at the bottom, a few slow, human ones at the top.", { illustrative: true }),
        dl([
          ["Unit test · one function", "Holdings worth ₹64 and ₹36 give an allocation of 64% and 36%."],
          ["[[integration test|Integration test]] · two parts together", "Asking the API for client CL-20417 returns the 14 holdings stored for that client in the [[database]]."],
          ["[[end-to-end test|End-to-end test]] · a whole journey", "An automated browser logs in as an RM, searches “Mehta”, opens the summary and sees ₹4,82,60,000."],
          ["[[UAT]] · real users", "Five RMs prepare for real upcoming meetings using only the new screen."],
        ]),
        sub("What a test report looks like"),
        log([
          ["09:14:02", "e-run", "suite_start", "portfolio-summary v1.0.0-rc2 · 142 cases"],
          ["09:14:03", "e-res", "PASS", "unit/allocation_sums_to_100"],
          ["09:14:03", "e-res", "PASS", "unit/xirr_matches_reference"],
          ["09:14:09", "e-res", "PASS", "integration/summary_api_returns_14_holdings"],
          ["09:15:40", "e-bad", "FAIL", "e2e/new_client_zero_holdings: expected “No holdings yet”, got error 500"],
          ["09:16:12", "e-res", "PASS", "e2e/usd_holdings_converted_at_close_rate"],
          ["09:16:30", "e-run", "suite_end", "141 passed · 1 failed · release blocked"],
        ]),
        callout("What pass/fail means.", "A test compares the actual result with the expected one: match is a pass, anything else a fail. Regular software is [[deterministic]], so one failing test is a real bug, not bad luck, and it blocks the release until it's fixed or accepted in writing."),
        p("[[regression testing|Regression testing]] re-runs all the old tests after every change, to prove nothing that used to work has broken."),
      ].join(""),
      remember: "Ask “which test would catch this?” for every risk. If none would, add one.",
    },
    {
      id: "sdlc-release", rail: "Release", eyebrow: "Section 12 · Release and after launch",
      title: "Staging, flags, rollbacks, triage and versions",
      intro: "Shipping is not one moment. These five practices make releases safe to do often.",
      body: () => [
        fig(flow([{ t: "Code", s: "merged to main", k: "muted" }, { t: "CI", s: "tests pass", k: "final" }, { t: "Staging", s: "rehearsal copy, masked data", k: "observe" }, { t: "Production", s: "the real system", k: "accent", chips: ["flag: 10% of RMs", "then 100%"] }], ["builds", "deploys", "deploys behind a flag"])
          + `<div class="habit"><b>Rollback</b><span>Production misbehaves</span><span aria-hidden="true">→</span><span class="bad">flag off or previous version</span><span>in minutes, then fix calmly on staging</span></div>`,
          "The path every release takes. The flag decides who sees it; the rollback is the way back.", { title: "From merged code to real users" }),
        grid(2, [
          box("Staging versus production", p("[[staging|Staging]] rehearses the release; [[production|production]] is the real thing. Make them match, including data size.")),
          box("Feature flags", p("A [[feature flag]] separates “deployed” from “visible”: ship it off, then turn it on for 10%, a branch, or staff.")),
          box("Rollbacks", p("A [[rollback]] returns to the last good version. If a fix must go out fast instead, that's a [[hotfix]].")),
          box("Versioning", `<div class="versions" aria-label="Version 2.3.1"><span class="ma">2</span>.<span class="mi">3</span>.<span class="pa">1</span></div>` + p("[[semantic versioning|Semantic versioning]]: MAJOR (may break things) . MINOR (new feature) . PATCH (bug fix). The summary launched as 1.0.0.")),
        ]),
        sub("Bug triage: deciding what to fix first"),
        p("In [[bug triage]], the team ranks each new bug by how bad it is and how many people it hits:"),
        `<div class="prio-row">
          <div class="prio p0c"><span class="pt"><span class="pb p0">P0</span>Drop everything</span><p>Wrong money figures, data shown to the wrong user, or the screen is down for everyone.</p><span class="rule">Fix now · hotfix or rollback</span></div>
          <div class="prio p1c"><span class="pt"><span class="pb p1">P1</span>Fix this sprint</span><p>A key flow is broken for some users, such as dollar holdings shown in the wrong currency.</p><span class="rule">Next release</span></div>
          <div class="prio p2c"><span class="pt"><span class="pb p2">P2</span>Schedule it</span><p>Cosmetic or rare, such as a chart label overlapping on one small phone.</p><span class="rule">Backlog</span></div>
        </div>`,
      ].join(""),
      remember: "Make releases small and reversible. A flag and a five-minute rollback are worth more than a perfect launch plan.",
    },
    {
      id: "sdlc-tools", rail: "Tools", eyebrow: "Section 13 · Tools by stage",
      title: "The tools you'll see at each stage",
      intro: "Most teams use some version of these. Names vary by company; the jobs are the same.",
      body: () => [
        fig(swimlane(SDLC_STAGES.map(s => s.name), [
          { t: "Jira", from: 0, to: 6, k: "accent", note: "Tracks the backlog, stories, bugs and sprints as tickets. You'll write stories, rank the backlog and triage bugs here." },
          { t: "Confluence", from: 0, to: 2, k: "observe", note: "A shared wiki for long documents. You'll write the PRD, decision logs and release notes here." },
          { t: "Figma", from: 2, to: 2, k: "graph", note: "Design files and clickable prototypes. You'll comment on designs and run prototype tests." },
          { t: "GitHub", from: 3, to: 4, k: "think", note: "Hosts the code, pull requests and reviews. You'll read pull request descriptions and link them to stories." },
          { t: "CI/CD", from: 3, to: 5, k: "final", note: "[[CI/CD]] tools such as GitHub Actions run tests on every change and deploy passing code. You'll check whether a release is blocked and why." },
          { t: "Sentry", from: 5, to: 6, k: "bad", note: "[[error tracking|Error tracking]]: every crash, with where it happened. You'll watch error counts on launch day and feed triage." },
          { t: "Dashboards", from: 5, to: 6, k: "act", note: "Usage and speed charts in tools like Datadog or Amplitude. You'll track the success metric and adoption." },
        ], "sdlc"), "Which tool is used across which stages. Tap a tool to see what you'll do in it as PM.", { interactive: true }),
      ].join(""),
      remember: "Learn where your team keeps the truth: tickets in Jira, decisions in Confluence, code in GitHub, errors in Sentry.",
    },
    {
      id: "sdlc-quiz", rail: "Quiz", eyebrow: "Section 14 · Check yourself",
      title: "Five questions on the SDLC",
      intro: "Pick an answer to see whether it's right and why.",
      body: () => quizSet("q-sdlc", [
        { q: "Which document describes what to build and why, before design starts?", opts: ["A release note", "A product requirements document (PRD)", "A test report"], a: 1, why: "The PRD captures the problem, users, scope and success measures. Release notes and test reports come much later." },
        { q: "Which acceptance criterion is most useful to QA?", opts: ["The summary should feel fast and accurate", "Total value matches the custodian statement to the rupee, and the screen loads in under 2 seconds for 95% of opens", "Engineering will make the summary as good as possible"], a: 1, why: "A good acceptance criterion is testable with a clear yes or no. “Feel fast” can't be tested." },
        { q: "The screen crashes for new clients with no holdings. Which practice most likely catches this before release?", opts: ["An edge-case test written from the acceptance criteria", "UAT on the PM's favourite client", "A feature flag"], a: 0, why: "Edge-case tests deliberately try unusual inputs like zero holdings. A flag limits damage after release; it doesn't find the bug." },
        { q: "You open a feature flag to 40 RMs and the slowest 5% of loads jump to 14 seconds. What's the safest first move?", opts: ["Ask RMs to refresh the page", "Change code directly in production", "Turn the flag off, then investigate"], a: 2, why: "Turning the flag off is a fast, reversible rollback. Fix the cause calmly, re-test on staging, then release again." },
        { q: "Your team handles a steady stream of small data fixes with no fixed release dates. Which method fits best?", opts: ["Waterfall", "Kanban", "Scrum with four-week sprints"], a: 1, why: "Kanban suits unpredictable, continuous work. Fixed sprints and big up-front plans add delay here." },
      ]),
      remember: "If you got one wrong, reread that stage's “goes wrong” card. That's where the lesson is.",
    },
    {
      id: "sdlc-cheat", rail: "Cheat sheet", eyebrow: "Section 15 · One page",
      title: "SDLC cheat sheet",
      intro: "Everything in this module on one page.",
      body: () => cheatSheet({
        eyebrow: "Module 1 · SDLC", title: "The SDLC on one page", visual: () => miniLifecycles("sdlc"),
        formula: "Plan → <em>Requirements</em> → Design → Build → <em>Test</em> → Deploy → Maintain → plan again",
        blocks: [
          { h: "Stage → main output", ordered: true, items: ["Planning → brief, goal, success metric", "Requirements → PRD, user stories, acceptance criteria", "Design → mockups, prototype, technical design", "Build → reviewed code and tests", "Testing → test report, bug list, UAT sign-off", "Deployment → release, release note, runbook", "Maintenance → fixes, metrics review, next backlog"] },
          { h: "Your job as PM", items: ["Own the why and the success metric", "Write testable acceptance criteria", "Define every business term", "Protect scope; park extras in the backlog", "Make the go or no-go call with engineering", "Run triage and close the loop with users"] },
          { h: "Tests, small to large", items: ["Unit: one function", "Integration: two parts together", "End-to-end: the whole user journey", "UAT: real users confirm it solves the problem", "Regression: re-run everything after a change"] },
          { h: "Safe releases", items: ["Rehearse on staging", "Ship behind a feature flag", "Roll out to a small group first", "Roll back in minutes if metrics slip", "Number releases MAJOR.MINOR.PATCH", "Triage bugs P0, P1, P2"] },
        ],
        checks: { h: "Questions to ask your team", items: ["Which acceptance criterion does this test cover?", "What happens with zero, one and a very large number of items?", "How do we turn this off if it misbehaves?", "Does staging match production for data size?", "What alert tells us the data is stale or wrong?"] },
      }),
      remember: "Regular software is predictable, so you can specify it exactly and test it with pass or fail.",
    },
  ],
});
