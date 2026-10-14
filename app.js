// Medborgerskabsprøven practice app. Plain JavaScript, no build step.
// Data: window.SHEETS (sheets.js) and window.QUESTIONS (questions/ark-NN.js).
// Progress and settings are stored in this browser's localStorage.

const SHEETS = window.SHEETS;
const QUESTIONS = window.QUESTIONS;
const SHEET = Object.fromEntries(SHEETS.map(s => [s.ark, s]));
const PDF_FILE = "laeremateriale.pdf";
const STORAGE_KEY = "mbp-progress-v1";
const SELECTION_KEY = "mbp-selection-v1";
const EXAM = { questions: 25, minutes: 30, passAt: 20 }; // the real exam
const app = document.getElementById("app");

// ---------- Storage ----------
// progress[id] = { seen, correct, lastCorrect, lastSeen }

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}
let progress = load(STORAGE_KEY, {});

function record(id, isCorrect) {
  const p = progress[id] || { seen: 0, correct: 0 };
  p.seen += 1;
  if (isCorrect) p.correct += 1;
  p.lastCorrect = isCorrect;
  p.lastSeen = Date.now();
  progress[id] = p;
  save(STORAGE_KEY, progress);
}

// ---------- Helpers ----------

function esc(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function questionsFor(ark) {
  return QUESTIONS.filter(q => q.ark === ark);
}
function accuracy(questions) {
  let seen = 0, correct = 0;
  questions.forEach(q => { if (progress[q.id]) { seen += progress[q.id].seen; correct += progress[q.id].correct; } });
  return seen ? Math.round(100 * correct / seen) : null;
}

// Simple spaced repetition: questions you got wrong last time come first,
// then questions you have never seen, then the ones you answered correctly
// longest ago.
function priority(q) {
  const p = progress[q.id];
  if (!p) return 1;
  return p.lastCorrect ? 2 : 0;
}
function lastSeen(q) {
  return progress[q.id] ? progress[q.id].lastSeen : 0;
}
function pickQuestions(pool, count) {
  return shuffle(pool)
    .sort((a, b) => priority(a) - priority(b) || lastSeen(a) - lastSeen(b))
    .slice(0, count);
}

// Mock exam: like the real exam, spread the 25 questions over as many
// different fact sheets as possible.
function pickExam() {
  const bySheet = shuffle(SHEETS.map(s => shuffle(questionsFor(s.ark))).filter(qs => qs.length));
  const picked = [];
  for (let round = 0; picked.length < EXAM.questions && bySheet.some(qs => qs[round]); round++) {
    bySheet.forEach(qs => { if (qs[round] && picked.length < EXAM.questions) picked.push(qs[round]); });
  }
  return shuffle(picked);
}

// ---------- Home screen ----------

function showHome() {
  stopTimer();
  const seen = QUESTIONS.filter(q => progress[q.id]);
  const mistakes = QUESTIONS.filter(q => progress[q.id] && !progress[q.id].lastCorrect);
  const acc = accuracy(QUESTIONS);
  const selected = new Set(load(SELECTION_KEY, SHEETS.map(s => s.ark)));
  const groups = [...new Set(SHEETS.map(s => s.group))];

  app.innerHTML = `
    <h1>Medborgerskabsprøven</h1>
    <p class="muted">Øvelse baseret på Læremateriale til Medborgerskabsprøven (aug. 2026)</p>

    <div class="card stats">
      <div class="stat"><b>${seen.length}/${QUESTIONS.length}</b><span class="muted">spørgsmål set</span></div>
      <div class="stat"><b>${acc === null ? "–" : acc + "%"}</b><span class="muted">rigtige svar</span></div>
      <div class="stat"><b>${mistakes.length}</b><span class="muted">at øve igen</span></div>
    </div>

    <div class="card">
      <h2>Prøveeksamen</h2>
      <p class="muted">${EXAM.questions} spørgsmål fra alle emner · ${EXAM.minutes} minutter · bestået ved ${EXAM.passAt} rigtige. Du får svarene til sidst, som til den rigtige prøve.</p>
      <button class="primary" id="exam">Start prøveeksamen</button>
    </div>

    <div class="card">
      <h2>Øv emner</h2>
      <div class="row">
        <button class="link" id="all">Vælg alle</button>
        <button class="link" id="none">Fravælg alle</button>
      </div>
      ${groups.map(group => `
        <fieldset>
          <legend><label><input type="checkbox" class="group" data-group="${esc(group)}"> ${esc(group)}</label></legend>
          ${SHEETS.filter(s => s.group === group).map(s => sheetRow(s, selected)).join("")}
        </fieldset>`).join("")}
      <label for="count" class="field">Antal spørgsmål</label>
      <select id="count">
        <option value="10">10</option>
        <option value="25" selected>25</option>
        <option value="50">50</option>
        <option value="9999">Alle valgte</option>
      </select>
      <button class="primary" id="start">Start øvelse</button>
      ${mistakes.length ? `<button class="primary secondary" id="mistakes">Øv mine fejl (${mistakes.length})</button>` : ""}
      <p class="muted small">Spørgsmål, du har svaret forkert på, kommer først, derefter nye spørgsmål.</p>
    </div>

    <div class="card">
      <h2>Backup af fremgang</h2>
      <p class="muted small">Din fremgang gemmes kun i denne browser. Gem en backup-fil, eller flyt fremgang mellem PC og telefon.</p>
      <div class="row">
        <button id="export">Gem backup</button>
        <label class="button">Indlæs backup<input type="file" id="import" accept=".json,application/json" hidden></label>
      </div>
      <p><button class="link" id="reset">Nulstil al fremgang</button></p>
    </div>
  `;

  // Topic selection
  const boxes = [...app.querySelectorAll("input.sheet")];
  const groupBoxes = [...app.querySelectorAll("input.group")];
  function sync() {
    const chosen = boxes.filter(b => b.checked).map(b => Number(b.value));
    save(SELECTION_KEY, chosen);
    groupBoxes.forEach(g => {
      const inGroup = boxes.filter(b => b.dataset.group === g.dataset.group);
      const on = inGroup.filter(b => b.checked).length;
      g.checked = on === inGroup.length;
      g.indeterminate = on > 0 && on < inGroup.length;
    });
    const n = QUESTIONS.filter(q => chosen.includes(q.ark)).length;
    document.getElementById("start").textContent = `Start øvelse (${n} spørgsmål valgt)`;
    document.getElementById("start").disabled = n === 0;
  }
  boxes.forEach(b => b.onchange = sync);
  groupBoxes.forEach(g => g.onchange = () => {
    boxes.filter(b => b.dataset.group === g.dataset.group).forEach(b => b.checked = g.checked);
    sync();
  });
  document.getElementById("all").onclick = () => { boxes.forEach(b => b.checked = true); sync(); };
  document.getElementById("none").onclick = () => { boxes.forEach(b => b.checked = false); sync(); };
  sync();

  document.getElementById("start").onclick = () => {
    const chosen = new Set(boxes.filter(b => b.checked).map(b => Number(b.value)));
    const count = Number(document.getElementById("count").value);
    startPractice(pickQuestions(QUESTIONS.filter(q => chosen.has(q.ark)), count));
  };
  const mistakesBtn = document.getElementById("mistakes");
  if (mistakesBtn) mistakesBtn.onclick = () => startPractice(shuffle(mistakes));
  document.getElementById("exam").onclick = startExam;

  // Backup
  document.getElementById("export").onclick = exportProgress;
  document.getElementById("import").onchange = importProgress;
  const resetBtn = document.getElementById("reset");
  resetBtn.onclick = () => {
    if (resetBtn.dataset.confirm) {
      progress = {};
      save(STORAGE_KEY, progress);
      showHome();
    } else {
      resetBtn.dataset.confirm = "1";
      resetBtn.textContent = "Er du sikker? Klik igen for at slette al fremgang";
    }
  };
}

function sheetRow(s, selected) {
  const qs = questionsFor(s.ark);
  const seen = qs.filter(q => progress[q.id]).length;
  const acc = accuracy(qs);
  return `
    <div class="sheet">
      <label>
        <input type="checkbox" class="sheet" value="${s.ark}" data-group="${esc(s.group)}"
          ${selected.has(s.ark) ? "checked" : ""} ${qs.length ? "" : "disabled"}>
        <span>${s.ark}. ${esc(s.name)}
          <span class="muted small">· ${seen}/${qs.length} set${acc === null ? "" : ` · ${acc}% rigtige`}</span>
        </span>
      </label>
      <a class="small" href="${esc(s.audio)}" target="_blank" rel="noopener" title="Lyt til fakta-arket (officiel lydfil)">Lyt</a>
    </div>`;
}

function exportProgress() {
  const data = { app: "medborgerskabsproeven", exported: new Date().toISOString(), progress };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `medborgerskab-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  file.text().then(text => {
    const data = JSON.parse(text);
    if (!data || typeof data.progress !== "object") throw new Error("bad file");
    // Merge: keep whichever record of each question is the most recent.
    Object.entries(data.progress).forEach(([id, p]) => {
      if (!progress[id] || (p.lastSeen || 0) > (progress[id].lastSeen || 0)) progress[id] = p;
    });
    save(STORAGE_KEY, progress);
    showHome();
  }).catch(() => {
    event.target.value = "";
    event.target.closest(".card").insertAdjacentHTML("beforeend",
      `<p class="verdict bad">Filen kunne ikke læses. Vælg en backup-fil fra denne app.</p>`);
  });
}

// ---------- Practice mode (feedback after each question) ----------

let session = null; // { mode, questions, index, answers: [chosen index or null] }

function startPractice(questions) {
  session = { mode: "practice", questions, index: 0, answers: [] };
  showPracticeQuestion();
}

function showPracticeQuestion() {
  const q = session.questions[session.index];
  const order = shuffle(q.options.map((_, i) => i)); // learn the answer, not its position

  app.innerHTML = `
    <div class="top">
      <span class="muted">Spørgsmål ${session.index + 1} af ${session.questions.length} · Fakta-ark ${q.ark}</span>
      <button class="link" id="quit">Afslut</button>
    </div>
    <div class="card">
      <h2>${esc(q.q)}</h2>
      ${order.map(i => `<button class="option" data-i="${i}">${esc(q.options[i])}</button>`).join("")}
      <div id="feedback"></div>
    </div>
  `;
  document.getElementById("quit").onclick = showResult;
  app.querySelectorAll(".option").forEach(btn => btn.onclick = () => answerPractice(q, Number(btn.dataset.i)));
}

function answerPractice(q, chosen) {
  const isCorrect = chosen === q.answer;
  record(q.id, isCorrect);
  session.answers[session.index] = chosen;

  app.querySelectorAll(".option").forEach(btn => {
    const i = Number(btn.dataset.i);
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    else if (i === chosen) btn.classList.add("wrong");
  });

  const last = session.index === session.questions.length - 1;
  document.getElementById("feedback").innerHTML = `
    <p class="verdict ${isCorrect ? "good" : "bad"}">
      ${isCorrect ? "Rigtigt!" : `Forkert – det rigtige svar er: ${esc(q.options[q.answer])}`}
    </p>
    <p>${esc(q.explanation)}</p>
    ${sourceHtml(q)}
    <button class="primary" id="next">${last ? "Se resultat" : "Næste spørgsmål"}</button>
  `;
  document.getElementById("next").onclick = () => {
    if (last) return showResult();
    session.index += 1;
    showPracticeQuestion();
  };
  document.getElementById("next").focus();
}

function sourceHtml(q) {
  return `
    <div class="source">
      <span class="muted small">Kilde: Fakta-ark ${q.ark} (${esc(SHEET[q.ark].name)}), side ${q.page}</span>
      <blockquote>“${esc(q.quote)}”</blockquote>
      <a href="${PDF_FILE}#page=${q.page}" target="_blank" rel="noopener">Åbn lærematerialet på side ${q.page}</a>
    </div>`;
}

// ---------- Mock exam (answers shown only at the end) ----------

let timer = null;

function startExam() {
  const questions = pickExam();
  session = {
    mode: "exam", questions, index: 0, answers: new Array(questions.length).fill(null),
    orders: questions.map(q => shuffle(q.options.map((_, i) => i))),
    endsAt: Date.now() + EXAM.minutes * 60 * 1000,
  };
  timer = setInterval(tick, 1000);
  showExamQuestion();
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function tick() {
  const left = Math.max(0, session.endsAt - Date.now());
  const el = document.getElementById("clock");
  if (el) el.textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, "0")}`;
  if (left === 0) finishExam(true);
}

function showExamQuestion() {
  const i = session.index;
  const q = session.questions[i];
  const answered = session.answers.filter(a => a !== null).length;
  const last = i === session.questions.length - 1;

  app.innerHTML = `
    <div class="top">
      <span class="muted">Spørgsmål ${i + 1} af ${session.questions.length} · ${answered} besvaret</span>
      <b id="clock"></b>
    </div>
    <div class="card">
      <h2>${esc(q.q)}</h2>
      ${session.orders[i].map(o => `
        <button class="option ${session.answers[i] === o ? "chosen" : ""}" data-i="${o}">${esc(q.options[o])}</button>`).join("")}
    </div>
    <div class="row">
      <button id="prev" ${i === 0 ? "disabled" : ""}>Forrige</button>
      <button id="next">${last ? "Til aflevering" : "Næste"}</button>
    </div>
    <div class="dots">
      ${session.questions.map((_, n) => `<button class="dot ${session.answers[n] !== null ? "done" : ""} ${n === i ? "here" : ""}" data-n="${n}">${n + 1}</button>`).join("")}
    </div>
    <button class="primary" id="submit">Aflevér prøven</button>
  `;
  tick();
  app.querySelectorAll(".option").forEach(btn => btn.onclick = () => {
    session.answers[i] = Number(btn.dataset.i);
    app.querySelectorAll(".option").forEach(b => b.classList.toggle("chosen", b === btn));
    app.querySelector(`.dot[data-n="${i}"]`).classList.add("done");
  });
  app.querySelectorAll(".dot").forEach(btn => btn.onclick = () => { session.index = Number(btn.dataset.n); showExamQuestion(); });
  document.getElementById("prev").onclick = () => { session.index -= 1; showExamQuestion(); };
  document.getElementById("next").onclick = () => {
    if (last) return document.getElementById("submit").focus();
    session.index += 1;
    showExamQuestion();
  };

  const submit = document.getElementById("submit");
  submit.onclick = () => {
    const missing = session.answers.filter(a => a === null).length;
    if (missing && !submit.dataset.confirm) {
      submit.dataset.confirm = "1";
      submit.textContent = `${missing} spørgsmål er ikke besvaret. Klik igen for at aflevere`;
      return;
    }
    finishExam(false);
  };
}

function finishExam(timeUp) {
  stopTimer();
  session.questions.forEach((q, n) => record(q.id, session.answers[n] === q.answer));
  session.timeUp = timeUp;
  showResult();
}

// ---------- Result (both modes) ----------

function showResult() {
  stopTimer();
  const { questions, answers, mode } = session;
  const done = mode === "exam" ? questions.length : answers.length; // practice: only answered ones
  const results = questions.slice(0, done).map((q, n) => ({ q, chosen: answers[n], correct: answers[n] === q.answer }));
  const right = results.filter(r => r.correct).length;
  const wrong = results.filter(r => !r.correct);
  const pct = results.length ? Math.round(100 * right / results.length) : 0;
  const passed = mode === "exam" ? right >= EXAM.passAt : pct >= 80;

  app.innerHTML = `
    <h1>${mode === "exam" ? "Resultat af prøveeksamen" : "Resultat"}</h1>
    ${session.timeUp ? `<p class="verdict bad">Tiden er gået.</p>` : ""}
    <div class="card">
      <h2>${right} af ${results.length} rigtige (${pct}%)</h2>
      <p class="verdict ${passed ? "good" : "bad"}">
        ${mode === "exam"
          ? (passed ? "Bestået!" : `Ikke bestået – der skal ${EXAM.passAt} rigtige til.`)
          : (passed ? "Det svarer til bestået (mindst 80%)." : "Til prøven skal du have mindst 80% rigtige (20 af 25).")}
      </p>
    </div>
    ${wrong.length ? `
      <div class="card">
        <h2>Dine fejl</h2>
        ${wrong.map(r => `
          <div class="review">
            <b>${esc(r.q.q)}</b>
            <p>Dit svar: ${r.chosen === null ? "<i>ikke besvaret</i>" : esc(r.q.options[r.chosen])}<br>
               Rigtigt svar: <b>${esc(r.q.options[r.q.answer])}</b></p>
            <p>${esc(r.q.explanation)}</p>
            ${sourceHtml(r.q)}
          </div>`).join("")}
      </div>` : ""}
    <button class="primary" id="home">Tilbage til start</button>
  `;
  document.getElementById("home").onclick = showHome;
  window.scrollTo(0, 0);
}

// ---------- Start ----------

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => { /* offline mode not available */ });
}
showHome();
