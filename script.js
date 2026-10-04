/* ============================================================
   Интерактив: тема, меню, анимации, счётчики, тренажёр промптов
   ============================================================ */

// ---------- Тёмная / светлая тема ----------
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme');
if (saved) root.dataset.theme = saved;
updateThemeIcon();

themeBtn.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
  updateThemeIcon();
});

function updateThemeIcon() {
  themeBtn.textContent = root.dataset.theme === 'light' ? '☀' : '☾';
}

// ---------- Мобильное меню ----------
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ---------- Появление секций при скролле ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Анимированные числа в hero ----------
const numIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, dur = 1200, t0 = performance.now();
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    numIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat-num').forEach(el => numIO.observe(el));

// ---------- Полоски диаграммы ----------
const barIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.bar-fill').forEach(f => f.style.width = f.dataset.w + '%');
    barIO.unobserve(e.target);
  });
}, { threshold: 0.3 });
const bars = document.querySelector('.bars');
if (bars) barIO.observe(bars);

// ---------- Подсветка активного пункта меню ----------
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...nav.querySelectorAll('a')];
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  let current = null;
  for (const s of sections) if (s.offsetTop <= y) current = s.id;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}, { passive: true });

// ---------- Счётчик «вайба» ----------
const vibeCount = document.getElementById('vibeCount');
const vibeMsg = document.getElementById('vibeMsg');
let vibe = 0;
const messages = [
  'Нейросеть думает… готово ✨',
  'Промпт принят, код генерируется ⚡',
  'Вайб усиливается 📈',
  'Ещё одна итерация — ещё лучше 😎',
  'Похоже, это работает с первого раза! 🤯',
  'ИИ одобряет ваш стиль 🧠',
];
document.getElementById('vibeBtn').addEventListener('click', () => {
  vibe += Math.floor(Math.random() * 13) + 7;
  animateTo(vibeCount, +vibeCount.textContent, vibe, 400);
  vibeMsg.textContent = messages[Math.floor(Math.random() * messages.length)];
});
document.getElementById('vibeReset').addEventListener('click', () => {
  animateTo(vibeCount, +vibeCount.textContent, 0, 300);
  vibe = 0;
  vibeMsg.textContent = 'Чистый лист. Новый проект? 🚀';
});
function animateTo(el, from, to, dur) {
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(from + (to - from) * p);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

// ---------- Тренажёр промптов ----------
const selects = ['pRole', 'pTask', 'pFormat', 'pLimit'].map(id => document.getElementById(id));
const labOutput = document.getElementById('labOutput');
const labVerdict = document.getElementById('labVerdict');

selects.forEach(s => s.addEventListener('change', buildPrompt));

function buildPrompt() {
  const parts = selects.map(s => s.value).filter(Boolean);
  if (parts.length === 0) {
    labOutput.textContent = '…твой промпт появится здесь';
    labOutput.classList.remove('filled');
    labVerdict.textContent = '';
    return;
  }
  // склейка: роль + задача + формат + ограничение
  let text = parts[0];
  if (parts[1]) text += ', ' + parts[1].replace(/^(объясни|проверь|составь)/, '$1');
  if (parts[2]) text += '. Ответ нужен: ' + parts[2];
  if (parts[3]) text += '. Ограничение: ' + parts[3];
  text += '.';
  labOutput.textContent = text;
  labOutput.classList.add('filled');

  if (parts.length === 4) {
    labVerdict.textContent = '🔥 Отличный промпт: есть роль, задача, формат и ограничение — ответ будет точным.';
    labVerdict.className = 'lab-verdict ok';
  } else if (parts.length >= 2) {
    labVerdict.textContent = '👍 Неплохо, но добавь все 4 элемента — тогда ИИ поймёт задачу почти однозначно.';
    labVerdict.className = 'lab-verdict mid';
  } else {
    labVerdict.textContent = '🤔 Слишком общий запрос — ИИ угадывать не обязан, добавь деталей.';
    labVerdict.className = 'lab-verdict mid';
  }
}
