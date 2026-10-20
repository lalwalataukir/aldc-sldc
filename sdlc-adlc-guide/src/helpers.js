/* Markup helpers. Content files call these to build sections from the design system's
   component classes. Text may mark a glossary term as [[key]] or [[key|shown text]]. */
"use strict";
const MODULES = [];

const p = (...ps) => ps.map(x => `<p>${x}</p>`).join("");
const prose = (...ps) => `<div class="prose">${p(...ps)}</div>`;
const ul = items => `<ul class="clean">${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
const tag = (t, accent) => `<span class="tag${accent ? " accent" : ""}">${t}</span>`;
const grid = (n, items) => `<div class="grid g${n}">${items.join("")}</div>`;
const sub = t => `<h3 class="sub">${t}</h3>`;

function box(title, body, o = {}) {
  return `<div class="box${o.tint ? " tint" : ""}">${o.tag ? tag(o.tag, o.accent) : ""}${title ? `<h4>${title}</h4>` : ""}${body}</div>`;
}
function callout(lead, text) {
  return `<div class="callout"><b>${lead}</b> ${text}</div>`;
}
/* rows: arrays of cells; a cell may be {v, cls} */
function table(head, rows, caption) {
  const cell = (c, tagName) => {
    if (c && typeof c === "object") return `<${tagName} class="${c.cls || ""}">${c.v}</${tagName}>`;
    return `<${tagName}>${c}</${tagName}>`;
  };
  return `<div class="tablewrap"><table>${caption ? `<caption class="sr">${caption}</caption>` : ""}<thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => cell(c, "td")).join("")}</tr>`).join("")}</tbody></table></div>`;
}
/* lines: [time, eventClass, eventName, rest] */
function log(lines) {
  return `<div class="log" role="log">${lines.map(([t, c, e, rest]) => `<div><span class="t">${t}</span>  <span class="${c}">${e}</span>${rest ? "  " + rest : ""}</div>`).join("")}</div>`;
}
/* lines are pre-escaped HTML; use <span class="c|k|s"> for comment, keyword, string */
function code(lines, label) {
  return `<pre class="code"${label ? ` aria-label="${label}"` : ""}>${lines.map(l => `<span class="ln">${l || " "}</span>`).join("")}</pre>`;
}
function checklist(items) {
  return `<ul class="check-list">${items.map((t, i) => `<li><span class="q">${i + 1}</span><span>${t}</span></li>`).join("")}</ul>`;
}
function dl(pairs) {
  return `<dl class="dl">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
}
function mistakes(list) {
  return `<div class="mistakes">${list.map((m, i) => `<div class="mistake"><div class="num">${i + 1}</div><h4>${m.title}</h4>${m.habit ? `<p class="habit"><b>SDLC habit</b><span>${m.habit[0]}</span><span aria-hidden="true">→</span><span class="bad">breaks</span><span>${m.habit[1]}</span></p>` : ""}<dl><dt>What it looks like</dt><dd>${m.looks}</dd><dt>Why it hurts</dt><dd>${m.why}</dd><dt>Fix</dt><dd>${m.fix}</dd></dl></div>`).join("")}</div>`;
}
function metrics(list) {
  return `<div class="kv">${list.map(([v, k, warn]) => `<div class="metric${warn ? " warn" : ""}"><span class="v">${v}</span><span class="k">${k}</span></div>`).join("")}</div>`;
}

/* A lifecycle stage, rendered with the same six parts every time: where it sits in the
   lifecycle, who owns it, the running example (with its visual), what happens, what the
   PM does, what it produces, and what goes wrong drawn as an incident timeline. */
function stageBody(s, exampleName, i, all, lifecycle) {
  const owners = `<div class="owners"><span class="eyebrow">Owner</span>${s.owner.map(o => tag(o, true)).join("")}<span class="gap"></span><span class="eyebrow">With</span>${s.with.map(o => tag(o)).join("")}</div>`;
  return [
    ribbon(all.map(x => x.short || x.name), i, lifecycle),
    owners,
    `<div class="ex">${tag("Running example · " + exampleName)}${p(...s.example)}${s.visual ? s.visual() : ""}</div>`,
    grid(3, [
      box("What happens", p(...s.what)),
      box("What the PM does", ul(s.pm)),
      box("What it produces", ul(s.output)),
    ]),
    s.extra || "",
    `<div class="wrong"><div class="wrong-h"><span class="kind k-bad">Goes wrong</span><b>${s.wrong.title}</b></div>${timeline(s.wrong.timeline)}${dl([["What happens", s.wrong.what], ["How the team catches it", s.wrong.caught]])}</div>`,
  ].join("");
}

/* questions: {q, opts: [], a: index, why} */
function quizSet(id, questions) {
  return `<div class="quizset" data-quiz="${id}"><div class="ring-wrap"><svg class="v-ring" viewBox="0 0 52 52" aria-hidden="true"><circle class="bg" cx="26" cy="26" r="22"></circle><circle class="fg" cx="26" cy="26" r="22" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"></circle></svg><p class="quiz-score" aria-live="polite">Answered <b data-n>0</b> of ${questions.length} · right <b data-r>0</b></p></div>${questions.map((x, qi) => `
    <div class="quiz" data-a="${x.a}"><span class="quiz-label">Check your understanding · Question ${qi + 1} of ${questions.length}</span>
    <p class="quiz-q" id="${id}-q${qi}">${x.q}</p>
    <div class="quiz-opts" role="group" aria-labelledby="${id}-q${qi}">${x.opts.map((o, oi) => `<button class="opt" type="button" data-i="${oi}"><span class="l">${"ABCD"[oi]}</span><span>${o}</span></button>`).join("")}</div>
    <p class="quiz-fb" aria-live="polite" data-why="${x.why.replace(/"/g, "&quot;")}"></p></div>`).join("")}</div>`;
}

/* sheet: {title, formula, blocks: [{h, items, ordered}], checks: {h, items}} */
function cheatSheet(sh) {
  const block = b => `<div class="cheat-block"><h4>${b.h}</h4>${b.ordered ? `<ol>${b.items.map(i => `<li>${i}</li>`).join("")}</ol>` : `<ul>${b.items.map(i => `<li>${i}</li>`).join("")}</ul>`}</div>`;
  return `<div class="cheat"><div class="cheat-head"><span class="eyebrow">${sh.eyebrow}</span><h3>${sh.title}</h3><p class="formula">${sh.formula}</p></div>${sh.visual ? sh.visual() : ""}
    <div class="cheat-grid">${sh.blocks.map(block).join("")}</div>
    ${sh.checks ? `<div class="cheat-block"><h4>${sh.checks.h}</h4>${checklist(sh.checks.items)}</div>` : ""}
    <details class="terms"><summary>Every term in this module<span data-termcount></span></summary><dl class="terms-list" data-termlist></dl></details></div>`;
}
