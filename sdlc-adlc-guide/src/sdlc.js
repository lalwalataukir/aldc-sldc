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
      "The goal is a <strong>portfolio summary</strong> screen in the RM app that shows a client's total value, asset allocation and returns on one page. Success means prep time falls below 5 minutes. The engineering lead sizes it at about six weeks for two engineers.",
    ],
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
      "<strong>User story:</strong> “As an RM, I want to see a client's total value, allocation and returns on one screen, so I can prepare for a meeting in minutes.”",
      "<strong>Acceptance criteria:</strong> given a client with holdings, when the RM opens the summary, the total value matches the [[custodian]] statement at the last market close to the rupee. Allocation adds up to 100%. The screen loads in under 2 seconds for 95% of opens.",
    ],
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
      "Top of the screen: total value and change since last close. Then a donut chart of allocation (equity, debt, gold, cash), a line chart of performance against a benchmark, and a table of the top 10 holdings.",
      "Technical design: a new endpoint returns one summary per client. Prices come from the market-data feed and holdings from the portfolio system. Results are [[cache|cached]] after each market close so the screen loads fast.",
    ],
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
      "The backend team builds the summary endpoint. The frontend team builds the charts and table. Below is the kind of response an engineer sees when the app asks for the Mehta family's summary.",
    ],
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
      "Test clients include a typical family, a client with 300 holdings, a client with US stocks priced in dollars, and a new client with no holdings yet. Each test compares the screen with the custodian statement for the same day.",
    ],
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
      "Version 1.0 goes to 40 RMs in one branch through a feature flag. After a week of clean metrics and good feedback, the flag is opened to all 400 RMs.",
    ],
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
      "Six weeks in, median prep time is 6 minutes, down from 20, but still above the 5-minute goal. RMs ask for a way to compare two dates. Both go into planning for version 1.1.",
    ],
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
          "It exists because mistakes get more expensive the later you find them. A wrong assumption costs a conversation in planning, a redesign in design, a rewrite in build, and an apology in production. The SDLC puts the cheap checks first."
        ),
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
      body: () => stageBody(s, "Portfolio summary"), remember: SDLC_REMEMBER[i],
    })),
    {
      id: "sdlc-methods", rail: "Methods", eyebrow: "Section 10 · Ways of working",
      title: "Waterfall, Agile, Scrum and Kanban",
      intro: "The seven stages are always there. Methodologies differ in how big each pass through them is, and how often the team loops.",
      body: () => [
        grid(2, [
          box("Waterfall", p("Each stage finishes completely before the next starts: all requirements, then all design, then all build. Change late in the project is expensive.") + p("<strong>Fits when</strong> requirements are fixed and known up front, such as a regulator-mandated report format with a hard deadline."), { tag: "One big pass" }),
          box("Agile", p("A mindset rather than a process. [[Agile]] means building in small increments, showing working software often, and changing the plan as you learn.") + p("<strong>Fits when</strong> you'll learn what users need by putting something in front of them, which is most product work."), { tag: "Many small passes", accent: true }),
          box("Scrum", p("A popular way to do Agile. Work happens in fixed [[sprint|sprints]], usually two weeks long, with set meetings and roles: a product owner (often the PM) and a scrum master who runs the process.") + p("<strong>Fits when</strong> a stable team builds a product over months and benefits from a steady rhythm."), { tag: "Fixed timeboxes" }),
          box("Kanban", p("Work flows across a board (to do, in progress, done) with no sprints. The team caps how many items can be in progress at once, called a [[WIP limit]].") + p("<strong>Fits when</strong> work arrives unpredictably, like support fixes and small data requests."), { tag: "Continuous flow" }),
        ]),
        sub("The Scrum rhythm in one two-week sprint"),
        `<div class="sprint" role="img" aria-label="A ten-working-day sprint: planning on day 1, daily standups, backlog grooming on day 6, review and retro on day 10">${["Plan", "Standup", "Standup", "Standup", "Standup", "Groom", "Standup", "Standup", "Standup", "Review · Retro"].map((t, i) => `<div class="${[0, 5, 9].includes(i) ? "hi" : ""}"><b>D${i + 1}</b>${t}</div>`).join("")}</div>`,
        grid(2, [
          box("Sprint and sprint planning", p("A [[sprint]] is a fixed period, usually two weeks, in which the team commits to finishing a set of stories. In sprint planning on day one, the team pulls the top stories from the [[backlog]] (the ranked list of all future work) and estimates them in [[story points]].")),
          box("Daily standup", p("A [[standup]] is a 15-minute daily check-in. Each person says what they did, what's next, and what is blocking them. As PM, listen for blockers you can clear, such as a missing definition or a slow approval.")),
          box("Backlog grooming", p("Also called refinement. Mid-sprint, the PM and team review upcoming stories so they're clear, estimated and ready. A story is ready when its acceptance criteria are written and its questions answered.")),
          box("Sprint review and retro", p("In the review, the team demos what it finished to stakeholders. In the [[retrospective|retro]], the team discusses only how it worked: what went well, what didn't, and one thing to change next sprint.")),
        ]),
        callout("For the portfolio summary.", "The team ran three two-week sprints. Sprint 1 built the API and the total value card. Sprint 2 built the charts. Sprint 3 built the holdings table and fixed bugs. Each sprint ended with a demo to five RMs."),
      ].join(""),
      remember: "Pick the method that matches how predictable your work is. Most product teams use a flavour of Agile.",
    },
    {
      id: "sdlc-testing-deep", rail: "Testing types", eyebrow: "Section 11 · Testing in depth",
      title: "Four kinds of test, from small to whole",
      intro: "Tests come in sizes. Small tests are fast and many; large tests are slow and few. Together they catch different problems.",
      body: () => [
        grid(2, [
          box("Unit test", p("Checks one small piece of code on its own, such as the function that calculates allocation. It runs in milliseconds, and teams have thousands.") + p("<strong>Example:</strong> holdings worth ₹64 and ₹36 give an allocation of 64% and 36%."), { tag: "Smallest · fastest" }),
          box("Integration test", p("An [[integration test]] checks that two parts work together, such as the summary API and the portfolio [[database]].") + p("<strong>Example:</strong> asking the API for client CL-20417 returns the 14 holdings stored for that client.")),
          box("End-to-end test", p("An [[end-to-end test]] drives the real app the way a user would, from login to the finished screen, usually with an automated browser.") + p("<strong>Example:</strong> an RM logs in, searches “Mehta”, opens the summary, and sees ₹4,82,60,000.")),
          box("User acceptance testing", p("[[UAT]] is when real users try the finished feature on realistic data and confirm it solves their problem. It is the last check before release, and the PM usually owns it.") + p("<strong>Example:</strong> five RMs prepare for real upcoming meetings using only the new screen."), { tag: "Largest · human", accent: true }),
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
        callout("What pass/fail means.", "A test sets up an input, runs the code, and compares the actual result with the expected result. If they match, it passes; if not, it fails. Because regular software is [[deterministic]] (the same input always gives the same output), one failing test is a real bug, not bad luck. A failing test blocks the release until someone fixes it or decides, in writing, to accept it."),
        p("Teams also run [[regression testing]]: re-running all the old tests after every change to prove nothing that used to work has broken."),
      ].join(""),
      remember: "Ask “which test would catch this?” for every risk. If none would, add one.",
    },
    {
      id: "sdlc-release", rail: "Release", eyebrow: "Section 12 · Release and after launch",
      title: "Staging, flags, rollbacks, triage and versions",
      intro: "Shipping is not one moment. These five practices make releases safe to do often.",
      body: () => [
        grid(2, [
          box("Staging versus production", p("[[staging|Staging]] is a full copy of the system with fake or masked data, used to rehearse a release. [[production|Production]] is the real system that RMs and clients use. Staging should match production as closely as possible. The day-one slowdown in the deployment stage happened because it didn't.")),
          box("Feature flags", p("A [[feature flag]] lets the team ship code that stays switched off, then turn it on for 10% of users, one branch, or only internal staff. It separates “the code is deployed” from “users can see it”.")),
          box("Rollbacks", p("A [[rollback]] returns production to the last good version. A team that can roll back in five minutes can afford to release often. If the fix has to go out in a hurry instead, that's a [[hotfix]].")),
          box("Versioning", p("[[semantic versioning|Semantic versioning]] numbers each release MAJOR.MINOR.PATCH.") + `<div class="versions" aria-label="Version 2.3.1"><span class="ma">2</span>.<span class="mi">3</span>.<span class="pa">1</span></div>` + p("Major means a big change that may break things. Minor means a new feature. Patch means a bug fix. The portfolio summary launched as 1.0.0, and the date comparison will ship as 1.1.0.")),
        ]),
        sub("Bug triage: deciding what to fix first"),
        p("In [[bug triage]], the team ranks each new bug by how bad it is and how many people it hits. A common scale:"),
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
        table(["Tool", "What it's for", "Stages", "What you'll do in it as PM"], [
          ["Jira", "Tracks the backlog, stories, bugs and sprints as tickets on a board.", "Planning to maintenance", "Write stories, rank the backlog, triage bugs"],
          ["Confluence", "A shared wiki for long documents.", "Planning, requirements, design", "Write the PRD, decision logs and release notes"],
          ["Figma", "Design files and clickable prototypes.", "Design", "Comment on designs, run prototype tests"],
          ["GitHub", "Hosts the code repository, pull requests and code reviews.", "Build, testing", "Read pull request descriptions; link them to stories"],
          ["CI/CD pipeline", "[[CI/CD]] tools such as GitHub Actions or Jenkins run tests on every change and deploy passing code.", "Build, testing, deployment", "Check whether a release is blocked and why"],
          ["Sentry or similar", "[[error tracking|Error tracking]]: records every crash with details of where it happened.", "Deployment, maintenance", "Watch error counts on launch day; feed triage"],
          ["Dashboards", "Usage and speed charts, for example in Datadog, Grafana or Amplitude.", "Deployment, maintenance", "Track the success metric and adoption"],
        ], "SDLC tools by stage"),
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
        eyebrow: "Module 1 · SDLC", title: "The SDLC on one page",
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
