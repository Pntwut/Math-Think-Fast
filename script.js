/* =========================================
   worksheet_math_p3 — script.js
   Logic: generate, render, toggle answers
   ========================================= */

let showAnswers = false;
let currentQuestions = [];

/* --- Utility --- */
function digits(n) {
  const d = [];
  for (let i = 0; i < 6; i++) { d.push(n % 10); n = Math.floor(n / 10); }
  return d;
}

function hasCarry(a, b) {
  let c = 0, found = false;
  const da = digits(a), db = digits(b);
  for (let i = 0; i < 6; i++) {
    const s = (da[i] || 0) + (db[i] || 0) + c;
    if (s >= 10) found = true;
    c = Math.floor(s / 10);
  }
  return found;
}

function hasBorrow(a, b) {
  let c = 0, found = false;
  const da = digits(a), db = digits(b);
  for (let i = 0; i < 6; i++) {
    const d = (da[i] || 0) - (db[i] || 0) - c;
    if (d < 0) found = true;
    c = d < 0 ? 1 : 0;
  }
  return found;
}

function fmt(n) {
  return n.toLocaleString('th-TH');
}

/* --- Generators --- */
function genAddition(id) {
  let a, b, tries = 0;
  do {
    a = Math.floor(Math.random() * 39000) + 10000;
    b = Math.floor(Math.random() * 39000) + 10000;
    tries++;
  } while ((a + b >= 100000 || !hasCarry(a, b)) && tries < 300);
  return { id, text: fmt(a) + ' + ' + fmt(b), answer: a + b };
}

function genSubtraction(id) {
  let a, b, tries = 0;
  do {
    a = Math.floor(Math.random() * 80000) + 10000;
    const minB = 10000;
    const maxB = Math.min(a - 1001, 89999);
    if (maxB < minB) { tries++; continue; }
    b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
    tries++;
  } while ((a - b < 1000 || !hasBorrow(a, b)) && tries < 300);
  return { id, text: fmt(a) + ' - ' + fmt(b), answer: a - b };
}

function genMultiplication(id) {
  const pool = [11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,31,32,33,34,41,42,43,51,52,61,71,81];
  const a = pool[Math.floor(Math.random() * pool.length)];
  const b = Math.floor(Math.random() * 7) + 3; // 3–9
  return { id, text: a + ' × ' + b, answer: a * b };
}

function genDivision(id) {
  const divs  = [2,3,4,5,6,7,8,9,10,11,12];
  const quots = [3,4,5,6,7,8,9,10,11,12];
  const b = divs[Math.floor(Math.random() * divs.length)];
  const q = quots[Math.floor(Math.random() * quots.length)];
  return { id, text: (b * q) + ' ÷ ' + b, answer: q };
}

function generateAll() {
  const list = [];
  for (let i = 1; i <= 3; i++) list.push(genAddition(i));
  for (let i = 4; i <= 6; i++) list.push(genSubtraction(i));
  for (let i = 7; i <= 8; i++) list.push(genMultiplication(i));
  for (let i = 9; i <= 10; i++) list.push(genDivision(i));
  return list;
}

/* --- Render --- */
function renderQuestions() {
  const container = document.getElementById('questions-grid');
  container.innerHTML = '';
  const color   = document.getElementById('select-color').value;
  const opacity = showAnswers ? '1' : '0';

  currentQuestions.forEach(q => {
    const row = document.createElement('div');
    row.className = 'q-row';
    row.innerHTML = `
      <span class="q-num">${q.id})</span>
      <span class="q-expr">${q.text}</span>
      <span class="q-eq">=</span>
      <div class="q-ans-wrap">
        <span class="q-ans-line"></span>
        <span class="q-ans-val ${color}" style="opacity:${opacity}">${fmt(q.answer)}</span>
      </div>`;
    container.appendChild(row);
  });
}

/* --- UI Actions --- */
function toggleAnswers() {
  showAnswers = !showAnswers;
  const btn = document.getElementById('btn-toggle');
  if (showAnswers) {
    btn.textContent = '🙈 ซ่อนเฉลย';
    btn.className = 'btn btn-gray';
  } else {
    btn.textContent = '👁️ แสดงเฉลย';
    btn.className = 'btn btn-green';
  }
  renderQuestions();
}

function generateNewQuestions() {
  currentQuestions = generateAll();
  renderQuestions();
}

function updateTitle() {
  const v = document.getElementById('input-title').value;
  document.getElementById('sheet-title').textContent =
    v || 'แบบฝึกหัดคณิตคิดเลขเร็ว ชั้นประถมศึกษาปีที่ 3';
}

function updateEdition() {
  const v = document.getElementById('input-edition').value;
  document.getElementById('edition-display').value = v;
}

function syncEdition(v) {
  document.getElementById('input-edition').value = v;
}

window.onload = generateNewQuestions;
