/* =========================================
   worksheet_math_p3 รอบ 2 — script.js
   บวก/ลบ หลักหมื่น | คูณ 2×2, 4×1 | หาร 2÷1, 3÷1
   ระคน: 2 ขั้นตอน มี/ไม่มีวงเล็บคละกัน
   ========================================= */

let showAnswers = false;
let questionsA  = [];
let questionsB  = [];

/* ---- Utility ---- */
function digits(n) {
  const d = [];
  for (let i = 0; i < 6; i++) { d.push(n % 10); n = Math.floor(n / 10); }
  return d;
}
function hasCarry(a, b) {
  let c = 0, found = false;
  const da = digits(a), db = digits(b);
  for (let i = 0; i < 6; i++) {
    const s = (da[i]||0) + (db[i]||0) + c;
    if (s >= 10) found = true;
    c = Math.floor(s / 10);
  }
  return found;
}
function hasBorrow(a, b) {
  let c = 0, found = false;
  const da = digits(a), db = digits(b);
  for (let i = 0; i < 6; i++) {
    const d = (da[i]||0) - (db[i]||0) - c;
    if (d < 0) found = true;
    c = d < 0 ? 1 : 0;
  }
  return found;
}
function fmt(n) { return n.toLocaleString('th-TH'); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ---- Generators พื้นฐาน ---- */

function genAdd(id) {
  let a, b, t = 0;
  do {
    a = rand(10000, 49999);
    b = rand(10000, 49999);
    t++;
  } while ((a + b > 99999 || !hasCarry(a, b)) && t < 300);
  return { id, text: `${fmt(a)} + ${fmt(b)}`, answer: a + b };
}

function genSub(id) {
  let a, b, t = 0;
  do {
    a = rand(20000, 99999);
    b = rand(10000, a - 1000);
    t++;
  } while ((a - b < 1000 || !hasBorrow(a, b)) && t < 300);
  return { id, text: `${fmt(a)} - ${fmt(b)}`, answer: a - b };
}

function genMul2x2(id) {
  const a = rand(12, 99);
  const b = rand(12, 99);
  return { id, text: `${a} × ${b}`, answer: a * b };
}

function genMul4x1(id) {
  const a = rand(1000, 9999);
  const b = rand(2, 9);
  return { id, text: `${fmt(a)} × ${b}`, answer: a * b };
}

function genDiv2x1(id) {
  const b = pick([2,3,4,5,6,7,8,9]);
  const q = pick([11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);
  return { id, text: `${b*q} ÷ ${b}`, answer: q };
}

function genDiv3x1(id) {
  const b = pick([2,3,4,5,6,7,8,9]);
  const q = pick([11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,30,40,50]);
  return { id, text: `${b*q} ÷ ${b}`, answer: q };
}

/* ---- Generator โจทย์ระคน 2 ขั้นตอน ---- */
// รูปแบบที่ใช้ (คละวงเล็บ/ไม่มีวงเล็บ):
//   แบบ A (มีวงเล็บ): (A × B) + C  |  (A × B) - C  |  (A ÷ B) + C  |  (A ÷ B) - C
//   แบบ B (ไม่มีวงเล็บ): A + B × C  |  A - B × C  |  A + B ÷ C  |  A - B ÷ C
//   ทั้งหมดคำนวณตามลำดับที่ถูกต้อง (คูณ/หารก่อน บวก/ลบทีหลัง)

function genMixed(id) {
  const useParens = Math.random() < 0.5;
  const templates = useParens ? genMixedWithParens() : genMixedNoParens();
  return { id, ...templates };
}

function genMixedWithParens() {
  // เลือกรูปแบบ: (mul/div) op add/sub
  const innerOp = pick(['mul', 'div']);
  const outerOp = pick(['+', '-']);

  let innerA, innerB, innerResult, text, answer;

  if (innerOp === 'mul') {
    // (A × B) ± C — ใช้คูณ 2×1 หลักให้ผลลัพธ์สมเหตุสมผล
    innerA = rand(12, 99);
    innerB = rand(2, 9);
    innerResult = innerA * innerB;
    const c = rand(10, 999);
    if (outerOp === '+') {
      text = `(${innerA} × ${innerB}) + ${fmt(c)}`;
      answer = innerResult + c;
    } else {
      // ให้ผลลัพธ์ไม่ติดลบ
      const safeC = Math.min(c, innerResult - 1);
      text = `(${innerA} × ${innerB}) - ${fmt(safeC)}`;
      answer = innerResult - safeC;
    }
  } else {
    // (A ÷ B) ± C — ใช้หาร 2÷1 ลงตัว
    innerB = pick([2,3,4,5,6,7,8,9]);
    const q = pick([11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);
    innerA = innerB * q;
    innerResult = q;
    const c = rand(10, 500);
    if (outerOp === '+') {
      text = `(${innerA} ÷ ${innerB}) + ${fmt(c)}`;
      answer = innerResult + c;
    } else {
      const safeC = Math.min(c, innerResult - 1);
      text = `(${innerA} ÷ ${innerB}) - ${fmt(safeC)}`;
      answer = innerResult - safeC;
    }
  }

  return { text, answer };
}

function genMixedNoParens() {
  // รูปแบบ A ± (B × C) หรือ A ± (B ÷ C) — คูณ/หารทำก่อน
  const innerOp = pick(['mul', 'div']);
  const outerOp = pick(['+', '-']);

  let innerB, innerC, innerResult, a, text, answer;

  if (innerOp === 'mul') {
    innerB = rand(12, 50);
    innerC = rand(2, 9);
    innerResult = innerB * innerC;
    a = rand(100, 9999);
    if (outerOp === '+') {
      text = `${fmt(a)} + ${innerB} × ${innerC}`;
      answer = a + innerResult;
    } else {
      text = `${fmt(a)} - ${innerB} × ${innerC}`;
      answer = a - innerResult;
    }
  } else {
    innerC = pick([2,3,4,5,6,7,8,9]);
    const q = pick([11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);
    innerB = innerC * q;
    innerResult = q;
    a = rand(100, 9999);
    if (outerOp === '+') {
      text = `${fmt(a)} + ${innerB} ÷ ${innerC}`;
      answer = a + innerResult;
    } else {
      text = `${fmt(a)} - ${innerB} ÷ ${innerC}`;
      answer = a - innerResult;
    }
  }

  return { text, answer };
}

/* ---- Build question set by type ---- */
function generateSet(type) {
  const list = [];

  if (type === 'add') {
    for (let i = 1; i <= 10; i++) list.push(genAdd(i));

  } else if (type === 'sub') {
    for (let i = 1; i <= 10; i++) list.push(genSub(i));

  } else if (type === 'mul') {
    for (let i = 1; i <= 5; i++) list.push(genMul2x2(i));
    for (let i = 6; i <= 10; i++) list.push(genMul4x1(i));

  } else if (type === 'div') {
    for (let i = 1; i <= 5; i++) list.push(genDiv2x1(i));
    for (let i = 6; i <= 10; i++) list.push(genDiv3x1(i));

  } else if (type === 'mixed') {
    // ระคน: 10 ข้อ ล้วนๆ (มี/ไม่มีวงเล็บคละกัน)
    for (let i = 1; i <= 10; i++) list.push(genMixed(i));

  } else {
    // คละ: บวก 2, ลบ 2, คูณ 2, หาร 2, ระคน 2
    list.push(genAdd(1));
    list.push(genAdd(2));
    list.push(genSub(3));
    list.push(genSub(4));
    list.push(genMul2x2(5));
    list.push(genMul4x1(6));
    list.push(genDiv2x1(7));
    list.push(genDiv3x1(8));
    list.push(genMixed(9));
    list.push(genMixed(10));
  }

  return list;
}

/* ---- Render ---- */
function renderHalf(questions, gridId) {
  const container = document.getElementById(gridId);
  container.innerHTML = '';
  const color   = document.getElementById('select-color').value;
  const opacity = showAnswers ? '1' : '0';

  questions.forEach(q => {
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

function renderAll() {
  renderHalf(questionsA, 'grid-a');
  renderHalf(questionsB, 'grid-b');
}

/* ---- UI Actions ---- */
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
  renderAll();
}

function generateNewQuestions() {
  const type = document.getElementById('select-type').value;
  questionsA = generateSet(type);
  questionsB = [...questionsA];
  renderAll();
}

function updateTitle() {
  const v = document.getElementById('input-title').value
    || 'แบบฝึกหัดคณิตคิดเลขเร็ว ชั้นประถมศึกษาปีที่ 3';
  document.getElementById('title-a').textContent = v;
  document.getElementById('title-b').textContent = v;
}

function updateEditionA() {
  document.getElementById('edition-a').value = document.getElementById('input-edition-a').value;
}
function updateEditionB() {
  document.getElementById('edition-b').value = document.getElementById('input-edition-b').value;
}
function syncEditionA(v) { document.getElementById('input-edition-a').value = v; }
function syncEditionB(v) { document.getElementById('input-edition-b').value = v; }

window.onload = generateNewQuestions;
