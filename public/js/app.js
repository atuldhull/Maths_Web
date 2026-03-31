/* ═══════════════════════════════════════════════
   MATH COLLECTIVE — SHARED UI UTILITIES
   Injected on every page via <script src="/js/app.js">
═══════════════════════════════════════════════ */

/* ── Auth state check ── */
async function getAuthState() {
  try {
    const res = await fetch('/api/auth/me');
    return await res.json();
  } catch {
    return { loggedIn: false };
  }
}

/* ── Update navbar based on auth ── */
async function updateNav() {
  const state = await getAuthState();
  const loginBtn  = document.getElementById('nav-login-btn');
  const userPill  = document.getElementById('nav-user-pill');
  const arenaLink = document.getElementById('nav-arena-link');
  const role = state.user?.role;

  if (state.loggedIn) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (userPill)  {
      userPill.style.display = 'flex';
      const name = state.user.name || state.user.email?.split('@')[0] || 'Member';
      const avatarEl = userPill.querySelector('.mc-nav__avatar');
      const nameEl   = userPill.querySelector('.mc-nav__username');
      if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
      if (nameEl)   nameEl.textContent   = name;
      // Make the user pill route to their role home
      userPill.onclick = (e) => { e.preventDefault(); goToDefault(); };
    }
    if (arenaLink) {
      let dest = '/arena';
      let label = 'Arena';
      if (role === 'admin')    { dest = '/admin';        label = 'Admin'; }
      else if (role === 'teacher') { dest = '/teacher';  label = 'Teacher'; }
      else if (role === 'super_admin') { dest = '/super-admin'; label = 'Super Admin'; }
      arenaLink.href = dest;
      arenaLink.textContent = label;
    }
  } else {
    if (loginBtn)  loginBtn.style.display  = '';
    if (userPill)  userPill.style.display  = 'none';
    if (arenaLink) { arenaLink.href = '/arena'; arenaLink.textContent = 'Arena'; }
  }

  return state;
}

/* ── Logout helper ── */
async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (_) {
    // ignore network errors, fallback to client redirect
  }
  window.location.href = '/';
}

/* ── Unified navigation helpers ── */
const ROLE_REDIRECT = {
  super_admin: '/super-admin',
  admin: '/admin',
  teacher: '/teacher',
  student: '/dashboard',
};

async function goToDefault() {
  const state = await getAuthState();
  if (!state.loggedIn) {
    window.location.href = '/login?redirect=/dashboard';
    return;
  }
  const dest = ROLE_REDIRECT[state.user?.role] || '/dashboard';
  window.location.href = dest;
}

// Load Motion (Framer Motion for Web) lazily from CDN
const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionReady = null;
function loadMotion() {
  if (prefersReduceMotion) return Promise.reject('motion-disabled');
  if (window.motion) return Promise.resolve(window.motion);
  if (motionReady) return motionReady;
  motionReady = new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = 'https://cdn.jsdelivr.net/npm/motion@11.13.0/dist/motion.umd.min.js';
    tag.async = true;
    tag.onload = () => window.motion ? resolve(window.motion) : reject('motion-missing');
    tag.onerror = () => reject('motion-load-error');
    document.head.appendChild(tag);
  });
  return motionReady;
}

// Attach data-nav elements (optional progressive enhancement)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    const target = el.getAttribute('data-nav');
    if (!target) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (target === 'default') return goToDefault();
      window.location.href = target;
    });
  });

  // Highlight active nav link based on current path
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.mc-nav__links a, [data-nav-link]').forEach((a) => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    const targetsHome = ['/home', '/index', '/'];
    const isHome = targetsHome.includes(path) && targetsHome.includes(href);
    const match = isHome || (href !== '/' && path.startsWith(href));
    if (match) a.classList.add('is-active');
  });

  // Motion: page + component animations (safe, reduced-motion aware)
  loadMotion()
    .then(({ animate, stagger, inView }) => {
      // Entrance: navbar + hero-like sections
      const nav = document.querySelector('.mc-nav');
      if (nav) animate(nav, { opacity: [0, 1], y: [-14, 0] }, { duration: 0.5, easing: 'ease-out' });

      const heroBlocks = document.querySelectorAll('.hero, .page-hero, .hero-block, .page-shell .card');
      if (heroBlocks.length) {
        animate(
          heroBlocks,
          { opacity: [0, 1], y: [10, 0] },
          { delay: stagger(0.06), duration: 0.55, easing: 'ease-out' }
        );
      }

      // Page shell and sections for gentle entry
      const pageShell = document.querySelector('.page-shell');
      if (pageShell) animate(pageShell, { opacity: [0, 1], y: [8, 0] }, { duration: 0.45, easing: 'ease-out' });
      const sections = document.querySelectorAll('.section');
      if (sections.length) {
        animate(sections, { opacity: [0, 1], y: [12, 0] }, { delay: stagger(0.08), duration: 0.55, easing: 'ease-out' });
      }

      // Cards in grids lift in sequence
      const gridCards = document.querySelectorAll('.grid-auto .card, .grid-2 .card');
      if (gridCards.length) {
        animate(gridCards, { opacity: [0, 1], y: [12, 0] }, { delay: stagger(0.05), duration: 0.45, easing: 'ease-out' });
      }

      // Scroll reveal with Motion for elements already marked .reveal
      inView('.reveal', ({ target }) => {
        animate(
          target,
          { opacity: 1, y: 0 },
          { duration: 0.55, easing: 'ease-out' }
        );
      }, { margin: '-10% 0px' });

      // Micro-interactions: buttons & cards
      document.querySelectorAll('.btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => animate(btn, { scale: 1.02 }, { duration: 0.2 }));
        btn.addEventListener('mouseleave', () => animate(btn, { scale: 1 }, { duration: 0.2 }));
      });
      document.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('mouseenter', () => animate(card, { scale: 1.01 }, { duration: 0.25 }));
        card.addEventListener('mouseleave', () => animate(card, { scale: 1 }, { duration: 0.25 }));
      });
    })
    .catch(() => {
      // Fail silently if motion is blocked or unavailable
    });

  // Global floating background (lightweight canvas, non-blocking)
  initGlobalBG();
});

function initGlobalBG() {
  if (prefersReduceMotion) return;
  const skip = ['/super-admin', '/live-quiz', '/quiz-play', '/teacher', '/admin'];
  const path = window.location.pathname;
  if (skip.some(p => path.startsWith(p))) return;
  if (document.getElementById('global-bg-canvas')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'global-bg-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '0',
    pointerEvents: 'none',
    opacity: '0.25',
  });
  const attach = () => document.body.appendChild(canvas);
  if (document.body) attach(); else window.addEventListener('DOMContentLoaded', attach, { once: true });

  const ctx = canvas.getContext('2d');
  const NUM = 28;
  const parts = Array.from({ length: NUM }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 2,
    speed: 0.1 + Math.random() * 0.25,
    angle: Math.random() * Math.PI * 2,
    drift: (-0.5 + Math.random()) * 0.002,
  }));

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function step() {
    if (document.hidden) { requestAnimationFrame(step); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(124,58,237,0.55)';
    parts.forEach(p => {
      p.angle += p.drift;
      p.y += p.speed / 600;
      p.x += Math.cos(p.angle) * 0.0008;
      if (p.y > 1) p.y = 0;
      if (p.x > 1) p.x = 0;
      if (p.x < 0) p.x = 1;
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }
  step();
}

/* ── Navigate to arena (auth-gated) ── */
async function goToArena() {
  const state = await getAuthState();
  window.location.href = state.loggedIn ? '/arena' : '/login?redirect=/arena';
}

/* ── Scroll reveal ── */
function initReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // Respect user motion preference

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Formula cycler ── */
const FORMULAS = [
  "e^(iπ) + 1 = 0  —  Euler's Identity",
  "∫₋∞^∞ e^(−x²) dx = √π  —  Gaussian Integral",
  "∑_{n=1}^∞ 1/n² = π²/6  —  Basel Problem",
  "φ = (1 + √5) / 2 ≈ 1.618  —  Golden Ratio",
  "P(A|B) = P(B|A)·P(A) / P(B)  —  Bayes' Theorem",
  "d/dx[eˣ] = eˣ  —  Euler's Number",
  "a² + b² = c²  —  Pythagorean Theorem",
  "F(n) = F(n−1) + F(n−2)  —  Fibonacci Sequence",
];
let _formulaIdx = 0;

function cycleFormula(displayId = 'formula-display') {
  const el = document.getElementById(displayId);
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    _formulaIdx = (_formulaIdx + 1) % FORMULAS.length;
    el.textContent = FORMULAS[_formulaIdx];
    el.style.opacity = '1';
  }, 300);
}

function startFormulaCycle(displayId, interval = 5000) {
  const el = document.getElementById(displayId);
  if (!el) return;
  el.style.transition = 'opacity 0.3s ease';
  el.textContent = FORMULAS[0];
  setInterval(() => cycleFormula(displayId), interval);
}

/* ── Auto-init on DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  initReveal();
});


/* ── Dark / Light Mode ── */
function initTheme() {
  const saved = localStorage.getItem('mc-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mc-theme', next);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

/* ── Challenge Search ── */
async function searchChallenges(query) {
  if (!query || query.length < 2) return [];
  try {
    const res  = await fetch('/api/challenge/all');
    const data = await res.json();
    const q    = query.toLowerCase();
    return (data || []).filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.difficulty || '').toLowerCase().includes(q)
    ).slice(0, 6);
  } catch { return []; }
}

// Call initTheme immediately
initTheme();





/* ═══════════════════════════════════════════════════════
   REAL-TIME NOTIFICATION BELL
   Injected on every page via app.js
═══════════════════════════════════════════════════════ */

(function initNotifications() {

  // ── Styles ──
  const S = document.createElement('style');
  S.textContent = `
    #notif-bell-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-right: 0.5rem;
    }
    #notif-bell {
      width: 36px; height: 36px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      transition: all 0.2s;
      position: relative;
      color: var(--text-2, #94a3b8);
    }
    #notif-bell:hover {
      background: rgba(124,58,237,0.15);
      border-color: rgba(124,58,237,0.4);
      color: #a78bfa;
    }
    #notif-bell.has-unread {
      animation: bell-ring 0.6s ease-in-out;
      border-color: rgba(124,58,237,0.5);
      color: #a78bfa;
    }
    @keyframes bell-ring {
      0%,100% { transform: rotate(0); }
      20% { transform: rotate(-15deg); }
      40% { transform: rotate(15deg); }
      60% { transform: rotate(-10deg); }
      80% { transform: rotate(10deg); }
    }
    #notif-badge {
      position: absolute;
      top: -5px; right: -5px;
      min-width: 16px; height: 16px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border-radius: 99px;
      border: 2px solid var(--bg, #0a0f1e);
      font-size: 0.6rem; font-weight: 700;
      color: white; font-family: 'Space Mono', monospace;
      display: none; align-items: center; justify-content: center;
      padding: 0 3px;
      box-shadow: 0 2px 8px rgba(239,68,68,0.6);
    }
    #notif-badge.show { display: flex; }

    /* Dropdown */
    #notif-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 360px;
      background: #0d1117;
      border: 1px solid rgba(124,58,237,0.3);
      border-radius: 16px;
      box-shadow: 0 16px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03);
      z-index: 5000;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-8px) scale(0.97);
      transform-origin: top right;
      transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    #notif-dropdown.open {
      opacity: 1; pointer-events: all;
      transform: translateY(0) scale(1);
    }

    .notif-hdr {
      padding: 1rem 1.25rem 0.75rem;
      background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.06));
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex; align-items: center; justify-content: space-between;
    }
    .notif-hdr-title {
      font-family: 'Syne', sans-serif;
      font-size: 0.95rem; font-weight: 800; color: #f1f5f9;
    }
    .notif-hdr-actions { display: flex; gap: 0.5rem; }
    .notif-act-btn {
      background: none; border: none; cursor: pointer;
      font-size: 0.7rem; color: #64748b;
      font-family: 'Space Mono', monospace;
      padding: 3px 8px; border-radius: 5px;
      transition: all 0.15s;
    }
    .notif-act-btn:hover { background: rgba(255,255,255,0.06); color: #a78bfa; }

    .notif-list {
      max-height: 380px;
      overflow-y: auto;
    }
    .notif-list::-webkit-scrollbar { width: 3px; }
    .notif-list::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 99px; }

    .notif-item {
      display: flex; gap: 0.75rem; align-items: flex-start;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }
    .notif-item:hover { background: rgba(255,255,255,0.03); }
    .notif-item.unread { background: rgba(124,58,237,0.06); }
    .notif-item.unread::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: linear-gradient(135deg, #7c3aed, #3b82f6);
      border-radius: 0 2px 2px 0;
    }
    .notif-icon {
      width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
    }
    .notif-icon.info        { background: rgba(59,130,246,0.15); }
    .notif-icon.success     { background: rgba(74,222,128,0.12); }
    .notif-icon.warning     { background: rgba(251,191,36,0.12); }
    .notif-icon.test        { background: rgba(59,130,246,0.15); }
    .notif-icon.project     { background: rgba(251,191,36,0.12); }
    .notif-icon.leaderboard { background: rgba(251,191,36,0.15); }
    .notif-icon.certificate { background: rgba(74,222,128,0.12); }
    .notif-icon.announcement{ background: rgba(124,58,237,0.15); }

    .notif-body { flex: 1; min-width: 0; }
    .notif-title {
      font-size: 0.84rem; font-weight: 600; color: #f1f5f9;
      margin-bottom: 2px; line-height: 1.35;
    }
    .notif-text { font-size: 0.77rem; color: #64748b; line-height: 1.5; }
    .notif-time {
      font-size: 0.62rem; color: #334155;
      font-family: 'Space Mono', monospace;
      margin-top: 4px;
    }

    .notif-empty {
      padding: 2.5rem 1.5rem;
      text-align: center;
      color: #334155;
      font-size: 0.85rem;
    }
    .notif-empty-icon { font-size: 2rem; margin-bottom: 0.5rem; }

    /* NEW notification toast pop-in */
    #notif-toast-stack {
      position: fixed; top: 4.5rem; right: 1.5rem;
      z-index: 9000;
      display: flex; flex-direction: column; gap: 0.5rem;
      pointer-events: none;
    }
    .notif-toast {
      background: #0d1117;
      border: 1px solid rgba(124,58,237,0.4);
      border-radius: 12px;
      padding: 0.875rem 1.1rem;
      display: flex; gap: 0.75rem; align-items: flex-start;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
      min-width: 300px; max-width: 360px;
      pointer-events: all;
      animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes toastIn {
      from { opacity:0; transform: translateX(60px) scale(0.9); }
      to   { opacity:1; transform: translateX(0) scale(1); }
    }
    .notif-toast.out {
      animation: toastOut 0.3s ease-in forwards;
    }
    @keyframes toastOut {
      to { opacity:0; transform: translateX(60px) scale(0.9); }
    }
    .notif-toast-icon { font-size: 1.25rem; flex-shrink: 0; margin-top: 1px; }
    .notif-toast-body { flex: 1; }
    .notif-toast-title { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
    .notif-toast-text  { font-size: 0.75rem; color: #64748b; line-height: 1.5; }
    .notif-toast-close {
      background: none; border: none; cursor: pointer;
      color: #334155; font-size: 0.85rem; padding: 0; line-height: 1;
      flex-shrink: 0;
    }
    .notif-toast-close:hover { color: #94a3b8; }

    @media(max-width:480px) {
      #notif-dropdown { width: calc(100vw - 2rem); right: -4rem; }
    }
  `;
  document.head.appendChild(S);

  // ── Inject bell into navbar ──
  document.addEventListener('DOMContentLoaded', () => {
    const actions = document.querySelector('.mc-nav__actions');
    if (!actions) return;

    const wrap = document.createElement('div');
    wrap.id = 'notif-bell-wrap';
    wrap.innerHTML = `
      <button id="notif-bell" onclick="notifToggle()" title="Notifications">
        🔔
        <span id="notif-badge"></span>
      </button>
      <div id="notif-dropdown">
        <div class="notif-hdr">
          <span class="notif-hdr-title">Notifications</span>
          <div class="notif-hdr-actions">
            <button class="notif-act-btn" onclick="notifMarkAll()">✓ Mark all read</button>
            <button class="notif-act-btn" onclick="notifClear()">🗑 Clear</button>
          </div>
        </div>
        <div class="notif-list" id="notif-list">
          <div class="notif-empty"><div class="notif-empty-icon">🔔</div>No notifications yet</div>
        </div>
      </div>
    `;

    // Insert before the login button
    const loginBtn = actions.querySelector('#nav-login-btn');
    if (loginBtn) actions.insertBefore(wrap, loginBtn);
    else actions.prepend(wrap);

    // Toast stack (guard body availability)
    const injectToastStack = () => document.body.insertAdjacentHTML('beforeend', '<div id="notif-toast-stack"></div>');
    if (document.body) injectToastStack();
    else window.addEventListener('DOMContentLoaded', injectToastStack, { once: true });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        document.getElementById('notif-dropdown')?.classList.remove('open');
      }
    });

    // Init
    initNotifSocket();
    loadNotifications();
    setInterval(loadNotifications, 60000); // refresh every minute
  });

  const NOTIF_ICONS = {
    info: '💬', success: '✅', warning: '⚠️',
    test: '📋', project: '🚀', leaderboard: '🏆',
    certificate: '🎓', announcement: '📢',
  };

  let notifOpen  = false;
  let notifCache = [];

  // ── Socket.io real-time ──
  function initNotifSocket() {
    if (typeof io === 'undefined') return;
    const sock = io();
    sock.on('connect', () => {
      // Register user for notifications
      getAuthState().then(state => {
        if (!state.loggedIn) return;
        sock.emit('register_user', state.user.id);

        // Emit presence so admin can see active users
        const page = window.location.pathname;
        sock.emit('presence', {
          userId: state.user.id,
          name:   state.user.name || 'Member',
          page,
        });
      });
    });

    // Re-emit presence on page navigation (SPA-style) or every 30s
    setInterval(() => {
      getAuthState().then(state => {
        if (!state.loggedIn) return;
        sock.emit('presence', {
          userId: state.user.id,
          name:   state.user.name || 'Member',
          page:   window.location.pathname,
        });
      });
    }, 30000);
    sock.on('notification', (notif) => {
      notifCache.unshift(notif);
      updateBadge(notifCache.filter(n => !n.is_read).length);
      renderNotifList();
      showToast(notif);
      // Ring the bell
      const bell = document.getElementById('notif-bell');
      if (bell) { bell.classList.remove('has-unread'); void bell.offsetWidth; bell.classList.add('has-unread'); }
      // Browser push notification
      triggerBrowserPush(notif);
    });
  }

  // ── Browser push permission + trigger ──
  async function triggerBrowserPush(notif) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      new Notification(notif.title, {
        body: notif.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag:  notif.id || 'mc-notif',
      });
    }
  }

  // ── Load notifications from API ──
  async function loadNotifications() {
    try {
      const res  = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      notifCache = data.notifications || [];
      updateBadge(data.unread || 0);
      if (notifOpen) renderNotifList();
    } catch {}
  }

  function updateBadge(count) {
    const badge = document.getElementById('notif-badge');
    const bell  = document.getElementById('notif-bell');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.add('show');
      bell?.classList.add('has-unread');
    } else {
      badge.classList.remove('show');
      bell?.classList.remove('has-unread');
    }
  }

  function renderNotifList() {
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (!notifCache.length) {
      list.innerHTML = `<div class="notif-empty"><div class="notif-empty-icon">🔔</div>You're all caught up!</div>`;
      return;
    }

    list.innerHTML = notifCache.map(n => {
      const icon = NOTIF_ICONS[n.type] || '💬';
      const time = timeAgo(n.created_at);
      return `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="notifClick('${n.id}','${n.link||''}')">
          <div class="notif-icon ${n.type}">${icon}</div>
          <div class="notif-body">
            <div class="notif-title">${n.title}</div>
            <div class="notif-text">${n.body}</div>
            <div class="notif-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Toggle dropdown ──
  window.notifToggle = function() {
    notifOpen = !notifOpen;
    const dd = document.getElementById('notif-dropdown');
    if (notifOpen) {
      dd.classList.add('open');
      renderNotifList();
    } else {
      dd.classList.remove('open');
    }
  };

  // ── Click notification ──
  window.notifClick = async function(id, link) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    const n = notifCache.find(x => x.id === id);
    if (n) n.is_read = true;
    updateBadge(notifCache.filter(x => !x.is_read).length);
    renderNotifList();
    if (link) window.location.href = link;
  };

  // ── Mark all read ──
  window.notifMarkAll = async function() {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    notifCache.forEach(n => n.is_read = true);
    updateBadge(0);
    renderNotifList();
  };

  // ── Clear all ──
  window.notifClear = async function() {
    await fetch('/api/notifications/clear', { method: 'DELETE' });
    notifCache = [];
    updateBadge(0);
    renderNotifList();
  };

  // ── Show toast ──
  function showToast(notif) {
    const stack = document.getElementById('notif-toast-stack');
    if (!stack) return;
    const icon  = NOTIF_ICONS[notif.type] || '💬';
    const toast = document.createElement('div');
    toast.className = 'notif-toast';
    toast.id = 'toast-' + Date.now();
    toast.innerHTML = `
      <div class="notif-toast-icon">${icon}</div>
      <div class="notif-toast-body">
        <div class="notif-toast-title">${notif.title}</div>
        <div class="notif-toast-text">${notif.body}</div>
      </div>
      <button class="notif-toast-close" onclick="dismissToast('${toast.id}')">✕</button>
    `;
    stack.appendChild(toast);
    if (notif.link) toast.style.cursor = 'pointer';
    if (notif.link) toast.addEventListener('click', (e) => { if (!e.target.classList.contains('notif-toast-close')) window.location.href = notif.link; });
    setTimeout(() => dismissToast(toast.id), 5000);
  }

  window.dismissToast = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  };

  // ── Time ago helper ──
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

})();



/* ═══════════════════════════════════════════════════════════════
   ΣBot v4 — The Most Dramatic Math AI in Engineering Education
   Pages it lives on: home, arena, dashboard, history, winners,
                      contact, events, about, profile, gallery
   Pages it HIDES on: teacher, live-quiz, quiz-play, tests, admin
═══════════════════════════════════════════════════════════════ */

(function initSigmaBot() {

  // Ensure DOM is ready so body/head exist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSigmaBot, { once: true });
    return;
  }

  // ── PAGE BLACKLIST — bot hides here ──
  const HIDE_ON = ['/teacher', '/live-quiz', '/quiz-play', '/tests', '/admin', '/login', '/register'];
  const path = window.location.pathname;
  if (HIDE_ON.some(p => path.startsWith(p))) return;

  // ── INJECT STYLES ──
  const S = document.createElement('style');
  S.textContent = `
  /* ═══ ORB ═══ */
  #sb-orb {
    position:fixed; bottom:1.75rem; right:1.75rem;
    width:64px; height:64px; border-radius:50%;
    border:none; cursor:pointer; z-index:9999;
    background:none; padding:0; outline:none;
  }
  .sb-orb-ring {
    position:absolute; inset:0; border-radius:50%;
    border:1.5px solid rgba(124,58,237,0.5);
    animation:sbRingOut 2.4s ease-out infinite;
  }
  .sb-orb-ring:nth-child(2){animation-delay:.8s;}
  .sb-orb-ring:nth-child(3){animation-delay:1.6s;}
  @keyframes sbRingOut{
    0%  {transform:scale(1);opacity:.7}
    100%{transform:scale(2.6);opacity:0}
  }
  .sb-orb-core {
    position:absolute; inset:6px; border-radius:50%;
    background:conic-gradient(from 0deg, #7c3aed, #3b82f6, #06b6d4, #a855f7, #7c3aed);
    animation:sbCoreSpin 4s linear infinite;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 24px rgba(124,58,237,0.7), 0 0 60px rgba(124,58,237,0.3);
  }
  @keyframes sbCoreSpin{to{filter:hue-rotate(360deg);}}
  .sb-orb-core::before {
    content:''; position:absolute; inset:3px; border-radius:50%;
    background:#070b14;
  }
  .sb-orb-sigma {
    position:relative; z-index:1;
    font-family:'Space Mono',monospace; font-size:1.5rem;
    font-weight:700; color:white;
    text-shadow:0 0 20px rgba(167,139,250,0.9);
    animation:sbSigmaFloat 2s ease-in-out infinite;
  }
  @keyframes sbSigmaFloat{
    0%,100%{transform:translateY(0);}
    50%{transform:translateY(-3px);}
  }
  .sb-orb-dot {
    position:absolute; top:4px; right:4px;
    width:13px; height:13px;
    background:radial-gradient(circle, #4ade80, #22c55e);
    border-radius:50%; border:2px solid #070b14;
    animation:sbDotPulse 1.8s ease-in-out infinite;
    box-shadow:0 0 8px rgba(74,222,128,0.8);
  }
  @keyframes sbDotPulse{0%,100%{transform:scale(1);}60%{transform:scale(1.3);}}
  #sb-orb:hover .sb-orb-core {
    box-shadow:0 0 40px rgba(124,58,237,0.9), 0 0 80px rgba(124,58,237,0.4);
    animation:sbCoreSpin .8s linear infinite;
  }
  #sb-orb.open .sb-orb-sigma { content:'✕'; }
  #sb-orb.open .sb-orb-core {
    background:conic-gradient(from 0deg,#ef4444,#dc2626,#7c3aed,#ef4444);
  }

  /* Tooltip */
  #sb-tip {
    position:absolute; right:74px; top:50%;
    transform:translateY(-50%);
    background:rgba(7,11,20,0.96);
    border:1px solid rgba(124,58,237,0.5);
    color:#f1f5f9; padding:7px 14px; border-radius:10px;
    font-size:0.74rem; white-space:nowrap;
    font-family:'Space Mono',monospace;
    opacity:0; pointer-events:none;
    transition:opacity .2s, transform .2s;
    box-shadow:0 4px 20px rgba(0,0,0,0.5);
    transform:translateY(-50%) translateX(4px);
  }
  #sb-tip::after {
    content:''; position:absolute;
    right:-7px; top:50%; transform:translateY(-50%);
    border:7px solid transparent;
    border-left-color:rgba(124,58,237,0.5);
    border-right-width:0;
  }
  #sb-orb:hover #sb-tip {
    opacity:1; transform:translateY(-50%) translateX(0);
  }

  /* ═══ PANEL ═══ */
  #sb-panel {
    position:fixed; bottom:5.75rem; right:1.75rem;
    width:390px; height:600px;
    z-index:9998; border-radius:28px;
    display:flex; flex-direction:column;
    overflow:hidden;
    opacity:0; pointer-events:none;
    transform:scale(0.75) translateY(60px) rotateX(8deg);
    transform-origin:bottom right;
    transition:all .4s cubic-bezier(0.34,1.56,0.64,1);
  }
  #sb-panel.open {
    opacity:1; pointer-events:all;
    transform:scale(1) translateY(0) rotateX(0);
  }

  /* Glass background */
  .sb-glass {
    position:absolute; inset:0; border-radius:28px;
    background:rgba(7,11,20,0.92);
    backdrop-filter:blur(20px);
    border:1px solid rgba(124,58,237,0.25);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04),
      0 32px 100px rgba(0,0,0,0.8),
      inset 0 1px 0 rgba(255,255,255,0.06),
      0 0 60px rgba(124,58,237,0.08);
  }
  /* Flowing border */
  .sb-glass::before {
    content:''; position:absolute; inset:-1px; border-radius:29px;
    background:linear-gradient(90deg,
      transparent 0%,
      rgba(124,58,237,0.8) 20%,
      rgba(59,130,246,0.6) 40%,
      rgba(6,182,212,0.7) 60%,
      rgba(168,85,247,0.8) 80%,
      transparent 100%
    );
    background-size:300% 100%;
    animation:sbBorderFlow 3s linear infinite;
    z-index:-1;
    mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite:exclude;
    padding:1px;
  }
  @keyframes sbBorderFlow{
    0%{background-position:0% 50%}
    100%{background-position:300% 50%}
  }

  /* Particle canvas */
  #sb-particles {
    position:absolute; inset:0; border-radius:28px;
    pointer-events:none; z-index:0; opacity:0.4;
  }

  /* ── HEADER ── */
  #sb-hdr {
    position:relative; z-index:1; flex-shrink:0;
    padding:1.1rem 1.25rem 0.85rem;
    background:linear-gradient(135deg,
      rgba(124,58,237,0.18) 0%,
      rgba(59,130,246,0.1) 50%,
      rgba(6,182,212,0.06) 100%);
    border-bottom:1px solid rgba(255,255,255,0.05);
    display:flex; align-items:center; gap:.875rem;
  }
  .sb-av {
    width:46px; height:46px; border-radius:14px; flex-shrink:0;
    position:relative; overflow:visible;
    background:linear-gradient(135deg,#7c3aed,#3b82f6);
    display:flex; align-items:center; justify-content:center;
    font-family:'Space Mono',monospace;
    font-size:1.3rem; font-weight:700; color:#fff;
    box-shadow:0 4px 20px rgba(124,58,237,0.5);
  }
  .sb-av::after {
    content:''; position:absolute; inset:-3px; border-radius:17px;
    background:conic-gradient(from 0deg,#7c3aed,#3b82f6,#06b6d4,#7c3aed);
    z-index:-1; animation:sbCoreSpin 3s linear infinite;
    opacity:.6;
  }
  .sb-av-dot {
    position:absolute; bottom:-2px; right:-2px;
    width:12px; height:12px;
    background:radial-gradient(#4ade80,#22c55e);
    border-radius:50%; border:2px solid #070b14;
    box-shadow:0 0 6px rgba(74,222,128,0.8);
  }
  .sb-name {
    font-family:'Syne',sans-serif; font-size:1.05rem;
    font-weight:800; color:#f1f5f9; letter-spacing:-.02em;
  }
  .sb-sub {
    font-size:.66rem; color:#4ade80; margin-top:2px;
    font-family:'Space Mono',monospace;
    display:flex; align-items:center; gap:5px;
  }
  .sb-sub-dot {
    width:5px; height:5px; background:#4ade80; border-radius:50%;
    animation:sbDotPulse 1.8s infinite;
    box-shadow:0 0 5px rgba(74,222,128,0.7);
  }
  .sb-x {
    width:32px; height:32px; border-radius:9px; flex-shrink:0;
    background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.08);
    color:#475569; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:.9rem; transition:all .15s;
  }
  .sb-x:hover{background:rgba(239,68,68,0.15);color:#f87171;border-color:rgba(239,68,68,0.3);}

  /* ── QUICK MODES ── */
  #sb-modes {
    position:relative; z-index:1; flex-shrink:0;
    display:flex; gap:.35rem; padding:.55rem .9rem;
    border-bottom:1px solid rgba(255,255,255,0.04);
    overflow-x:auto; background:rgba(0,0,0,0.15);
  }
  #sb-modes::-webkit-scrollbar{display:none}
  .sb-m {
    padding:4px 11px; border-radius:99px; white-space:nowrap;
    border:1px solid rgba(124,58,237,0.3);
    background:rgba(124,58,237,0.07);
    color:#a78bfa; font-size:.67rem; cursor:pointer;
    font-family:'Space Mono',monospace;
    transition:all .2s; letter-spacing:.03em;
  }
  .sb-m:hover {
    background:rgba(124,58,237,0.22);
    border-color:rgba(124,58,237,0.65);
    color:#c4b5fd;
    box-shadow:0 0 14px rgba(124,58,237,0.35), inset 0 0 8px rgba(124,58,237,0.1);
    transform:translateY(-1px);
  }

  /* ── TICKER ── */
  #sb-tick {
    position:relative; z-index:1; flex-shrink:0;
    padding:.35rem .9rem; overflow:hidden;
    background:rgba(124,58,237,0.05);
    border-bottom:1px solid rgba(124,58,237,0.1);
    font-size:.63rem; color:rgba(167,139,250,.7);
    font-family:'Space Mono',monospace;
  }
  .sb-tick-inner{display:inline-block;animation:sbTick 30s linear infinite}
  @keyframes sbTick{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}

  /* ── MESSAGES ── */
  #sb-msgs {
    position:relative; z-index:1; flex:1;
    overflow-y:auto; padding:.9rem;
    display:flex; flex-direction:column; gap:.9rem;
    min-height:0;
  }
  #sb-msgs::-webkit-scrollbar{width:3px}
  #sb-msgs::-webkit-scrollbar-thumb{background:rgba(124,58,237,.35);border-radius:99px}

  .sb-row {
    display:flex; gap:.55rem; align-items:flex-end;
    animation:sbMsgIn .35s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes sbMsgIn{
    from{opacity:0;transform:translateY(16px) scale(.92)}
    to  {opacity:1;transform:translateY(0) scale(1)}
  }
  .sb-row.user{flex-direction:row-reverse}

  .sb-rav {
    width:28px; height:28px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:.72rem; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace;
    background:linear-gradient(135deg,#7c3aed,#3b82f6);
    box-shadow:0 2px 8px rgba(124,58,237,.4);
  }
  .sb-row.user .sb-rav{background:linear-gradient(135deg,#334155,#475569)}

  .sb-bwrap{display:flex;flex-direction:column;max-width:80%;gap:3px}
  .sb-row.user .sb-bwrap{align-items:flex-end}

  .sb-bub {
    padding:.7rem 1rem; border-radius:18px;
    font-size:.83rem; line-height:1.75;
    color:#e2e8f0; word-break:break-word;
  }
  .sb-row.bot .sb-bub {
    background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:4px 18px 18px 18px;
  }
  .sb-row.user .sb-bub {
    background:linear-gradient(135deg,#7c3aed,#3b82f6);
    border-radius:18px 4px 18px 18px;
    color:#fff;
    box-shadow:0 4px 16px rgba(124,58,237,.35);
  }
  .sb-t {font-size:.58rem;color:#334155;font-family:'Space Mono',monospace;padding:0 3px}

  /* Typing */
  .sb-typing .sb-bub {
    display:flex;align-items:center;gap:5px;padding:.85rem 1rem
  }
  .sb-td {
    width:7px;height:7px;border-radius:50%;
    background:linear-gradient(135deg,#7c3aed,#3b82f6);
    animation:sbTD 1.3s ease-in-out infinite;
  }
  .sb-td:nth-child(2){animation-delay:.17s}
  .sb-td:nth-child(3){animation-delay:.34s}
  @keyframes sbTD{
    0%,80%,100%{transform:translateY(0) scale(1);opacity:.5}
    40%{transform:translateY(-9px) scale(1.25);opacity:1;box-shadow:0 4px 12px rgba(124,58,237,.6)}
  }

  /* ── INPUT ── */
  #sb-in-area {
    position:relative;z-index:1;flex-shrink:0;
    padding:.8rem .9rem;
    border-top:1px solid rgba(255,255,255,.05);
    display:flex;gap:.5rem;align-items:flex-end;
    background:rgba(0,0,0,.25);
  }
  #sb-inp {
    flex:1;
    background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.08);
    border-radius:13px;
    padding:.6rem .9rem;
    font-size:.83rem; color:#f1f5f9;
    font-family:inherit; resize:none; outline:none;
    min-height:40px; max-height:110px;
    line-height:1.5;
    transition:border-color .2s,box-shadow .2s;
  }
  #sb-inp:focus{
    border-color:rgba(124,58,237,.55);
    box-shadow:0 0 0 3px rgba(124,58,237,.12),0 0 20px rgba(124,58,237,.08);
  }
  #sb-inp::placeholder{color:#334155}
  #sb-btn {
    width:42px;height:42px;flex-shrink:0;
    background:linear-gradient(135deg,#7c3aed,#3b82f6);
    border:none;border-radius:13px;cursor:pointer;
    color:#fff;font-size:1.1rem;
    display:flex;align-items:center;justify-content:center;
    transition:all .2s;
    box-shadow:0 4px 16px rgba(124,58,237,.45);
  }
  #sb-btn:hover:not(:disabled){
    transform:scale(1.1) rotate(-8deg);
    box-shadow:0 6px 24px rgba(124,58,237,.7);
  }
  #sb-btn:disabled{opacity:.3;cursor:not-allowed;transform:none}
  #sb-btn.spin{animation:sbSpin .8s linear infinite}
  @keyframes sbSpin{to{transform:rotate(360deg)}}

  /* ── Reaction flash ── */
  .sb-reaction {
    position:absolute;
    font-size:1.8rem;
    pointer-events:none;
    animation:sbReact 1.2s ease-out forwards;
    z-index:100;
  }
  @keyframes sbReact{
    0%  {transform:translateY(0) scale(0);opacity:1}
    60% {transform:translateY(-40px) scale(1.3);opacity:1}
    100%{transform:translateY(-80px) scale(1);opacity:0}
  }

  @media(max-width:500px){
    #sb-panel{right:.5rem;left:.5rem;width:auto;bottom:4.75rem;height:78vh}
    #sb-orb{bottom:1rem;right:1rem}
  }
  `;
  document.head.appendChild(S);

  // ── INJECT HTML ──
  const injectUI = () => document.body.insertAdjacentHTML('beforeend', `
    <button id="sb-orb" onclick="sbT()" aria-label="ΣBot Math Assistant">
      <div class="sb-orb-ring"></div>
      <div class="sb-orb-ring"></div>
      <div class="sb-orb-ring"></div>
      <div class="sb-orb-core">
        <span class="sb-orb-sigma" id="sb-sigma-txt">Σ</span>
      </div>
      <div class="sb-orb-dot"></div>
      <div id="sb-tip">🧮 Ask ΣBot anything!</div>
    </button>

    <div id="sb-panel">
      <div class="sb-glass"></div>
      <canvas id="sb-particles"></canvas>

      <div id="sb-hdr">
        <div class="sb-av">Σ<div class="sb-av-dot"></div></div>
        <div style="flex:1">
          <div class="sb-name">ΣBot</div>
          <div class="sb-sub">
            <div class="sb-sub-dot"></div>
            Math Overlord · Always Online
          </div>
        </div>
        <button class="sb-x" onclick="sbT()" title="Close">✕</button>
      </div>

      <div id="sb-modes">
        <button class="sb-m" onclick="sbQ('💡 Give me a hint — no spoilers!')">💡 Hint</button>
        <button class="sb-m" onclick="sbQ('Explain this step by step like I am 5')">🍼 ELI5</button>
        <button class="sb-m" onclick="sbQ('Drop a wild math fun fact right now')">🤯 Fun Fact</button>
        <button class="sb-m" onclick="sbQ('What mistakes do students usually make here?')">💀 Mistakes</button>
        <button class="sb-m" onclick="sbQ('Real world use of this topic?')">🌍 Real World</button>
        <button class="sb-m" onclick="sbQ('Roast my understanding of this topic')">🔥 Roast Me</button>
      </div>

      <div id="sb-tick">
        <span class="sb-tick-inner">
          ✦ e^(iπ)+1=0 — The equation that broke Euler's brain ✦ Every mathematician has tried to prove Goldbach's Conjecture. None succeeded. It's been 270 years. ✦ P(A|B)=P(B|A)P(A)/P(B) — Bayes' Theorem: when life gives you evidence, update your beliefs ✦ The Gaussian Integral ∫e^(-x²)dx=√π has no elementary antiderivative. Wild. ✦ Σ(1/n²)=π²/6 — Basel Problem: took 90 years to solve ✦
        </span>
      </div>

      <div id="sb-msgs"></div>

      <div id="sb-in-area">
        <textarea id="sb-inp" placeholder="Ask anything mathematical..." rows="1"
          onkeydown="sbKey(event)" oninput="sbResize(this)"></textarea>
        <button id="sb-btn" onclick="sbSend()">↑</button>
      </div>
    </div>
  `);
  if (document.body) injectUI(); else window.addEventListener('DOMContentLoaded', injectUI, { once: true });

  // ── PARTICLE SYSTEM ──
  const canvas = document.getElementById('sb-particles');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let pAnim;

  function resizeCanvas() {
    const panel = document.getElementById('sb-panel');
    canvas.width  = panel.offsetWidth;
    canvas.height = panel.offsetHeight;
  }

  function spawnParticles() {
    particles = Array.from({length: 18}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.4 + 0.1,
      c: ['#7c3aed','#3b82f6','#06b6d4','#a855f7'][Math.floor(Math.random()*4)],
    }));
  }

  function animParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.o;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    pAnim = requestAnimationFrame(animParticles);
  }

  // ── STATE ──
  let sbOpen = false, sbBusy = false, sbHist = [];

  const REACTS = ['🔥','✨','💡','🎯','🧠','⚡','🚀','💥','🎉','🤯'];
  const GREETS = [
    "**ΣBot online. Weapons loaded. Math engaged.** 🚀\n\nI'm your AI math overlord — part genius, part stand-up comedian, fully committed to your academic survival.\n\nAsk me anything. I don't judge. I only calculate. 🧮",
    "**Ah, a new challenger approaches!** 👀\n\nI'm ΣBot — the math assistant who actually shows up, never cancels office hours, and finds eigenvalues *genuinely* exciting.\n\nWhat beast shall we slay today? 💀",
    "**[ΣBot has entered the chat]** ⚡\n\nReady to make mathematics feel less like suffering and more like a superpower.\n\nDropping knowledge bombs since 2026. What's your question? 🎯",
  ];

  function rnd(a) { return a[Math.floor(Math.random()*a.length)]; }

  // ── TOGGLE ──
  window.sbT = function() {
    sbOpen = !sbOpen;
    const panel = document.getElementById('sb-panel');
    const orb   = document.getElementById('sb-orb');
    const sigTxt = document.getElementById('sb-sigma-txt');

    if (sbOpen) {
      panel.classList.add('open');
      orb.classList.add('open');
      sigTxt.textContent = '✕';
      resizeCanvas();
      spawnParticles();
      cancelAnimationFrame(pAnim);
      animParticles();
      if (!sbHist.length) sbAddMsg('bot', rnd(GREETS));
      setTimeout(() => { document.getElementById('sb-inp').focus(); sbScroll(); }, 400);
    } else {
      panel.classList.remove('open');
      orb.classList.remove('open');
      sigTxt.textContent = 'Σ';
      cancelAnimationFrame(pAnim);
    }
  };

  // ── QUICK PROMPTS ──
  window.sbQ = function(t) {
    document.getElementById('sb-inp').value = t;
    sbSend();
  };

  // ── KEYBOARD ──
  window.sbKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sbSend(); }
  };

  // ── RESIZE ──
  window.sbResize = function(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  };

  // ── CONTEXT ──
  function sbCtx() {
    const t = document.getElementById('challenge-title')?.textContent?.trim();
    const q = document.getElementById('challenge-question')?.textContent?.trim();
    const d = document.getElementById('difficulty-badge')?.textContent?.trim();
    if (t && q) return `Challenge: "${t}" [${d||'?'}]\nQuestion: ${q}`;
    return null;
  }

  // ── REACTION EMOJI ──
  function spawnReact(el) {
    const rect  = el.getBoundingClientRect();
    const panel = document.getElementById('sb-panel');
    const pr    = panel.getBoundingClientRect();
    const span  = document.createElement('span');
    span.className = 'sb-reaction';
    span.textContent = rnd(REACTS);
    span.style.left = (rect.left - pr.left + Math.random()*40) + 'px';
    span.style.top  = (rect.top  - pr.top ) + 'px';
    panel.appendChild(span);
    setTimeout(() => span.remove(), 1200);
  }

  // ── SEND ──
  window.sbSend = async function() {
    if (sbBusy) return;
    const inp  = document.getElementById('sb-inp');
    const text = inp.value.trim();
    if (!text) { sbShake(); return; }

    inp.value = ''; inp.style.height = 'auto';
    const userRow = sbAddMsg('user', text);
    sbHist.push({ role:'user', content:text });

    sbBusy = true;
    const btn = document.getElementById('sb-btn');
    btn.disabled = true; btn.classList.add('spin'); btn.textContent = '◌';

    const tid = sbTyping();

    try {
      const res  = await fetch('/api/bot/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: sbHist, challengeContext: sbCtx() }),
      });
      const data = await res.json();
      sbRmTyping(tid);

      const reply = res.ok ? data.reply : '⚠️ ' + (data.error || 'Even geniuses have bad days. Try again!');
      const botRow = sbAddMsg('bot', reply);

      // Spawn reaction emoji on correct/encouraging responses
      if (res.ok) {
        sbHist.push({ role:'assistant', content: data.reply });
        if (sbHist.length > 20) sbHist = sbHist.slice(-20);
        const msgEl = document.getElementById(botRow);
        if (msgEl) setTimeout(() => spawnReact(msgEl), 300);
      }

    } catch {
      sbRmTyping(tid);
      sbAddMsg('bot', '📡 Lost signal to the math dimension. Reconnecting...');
    } finally {
      sbBusy = false;
      btn.disabled = false; btn.classList.remove('spin'); btn.textContent = '↑';
      document.getElementById('sb-inp').focus();
    }
  };

  // ── ADD MESSAGE ──
  function sbAddMsg(role, content) {
    const id   = 'sbm-' + Date.now();
    const msgs = document.getElementById('sb-msgs');
    const now  = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

    let av = role === 'bot' ? 'Σ' : '?';
    if (role === 'user') {
      const el = document.querySelector('.mc-nav__avatar');
      if (el) av = el.textContent.trim().charAt(0).toUpperCase() || '?';
    }

    const row = document.createElement('div');
    row.className = `sb-row ${role}`;
    row.id = id;
    row.innerHTML = `
      <div class="sb-rav">${av}</div>
      <div class="sb-bwrap">
        <div class="sb-bub">${sbRender(content)}</div>
        <div class="sb-t">${now}</div>
      </div>
    `;
    msgs.appendChild(row);
    sbScroll();
    return id;
  }

  // ── TYPING ──
  function sbTyping() {
    const id  = 'sbt-' + Date.now();
    const row = document.createElement('div');
    row.className = 'sb-row bot sb-typing'; row.id = id;
    row.innerHTML = `<div class="sb-rav">Σ</div><div class="sb-bwrap"><div class="sb-bub"><div class="sb-td"></div><div class="sb-td"></div><div class="sb-td"></div></div></div>`;
    document.getElementById('sb-msgs').appendChild(row);
    sbScroll();
    return id;
  }
  function sbRmTyping(id) { document.getElementById(id)?.remove(); }

  function sbScroll() {
    const m = document.getElementById('sb-msgs');
    if (m) requestAnimationFrame(() => { m.scrollTop = m.scrollHeight; });
  }

  function sbShake() {
    const el = document.getElementById('sb-inp');
    el.style.borderColor = 'rgba(239,68,68,.6)';
    el.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.12)';
    el.style.transform   = 'translateX(-4px)';
    setTimeout(() => { el.style.transform = 'translateX(4px)'; }, 80);
    setTimeout(() => { el.style.transform = ''; el.style.borderColor = ''; el.style.boxShadow = ''; }, 160);
    el.focus();
  }

  // ── MARKDOWN RENDERER ──
  function sbRender(raw) {
    let t = raw
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // LaTeX \[ ... \] blocks
    t = t.replace(/\\\[[\s\S]*?\\\]/g, m => {
      const inner = m.replace(/^\\\[|\\\]$/g,'').trim();
      return `<span style="display:inline-block;background:rgba(124,58,237,.14);border:1px solid rgba(124,58,237,.3);padding:3px 10px;border-radius:7px;font-family:monospace;font-size:.85em;margin:2px 0;">${inner}</span>`;
    });

    // \boxed{x} → green bold
    t = t.replace(/\\boxed\{([^}]+)\}/g,'<strong style="color:#4ade80;font-size:1.08em;text-shadow:0 0 8px rgba(74,222,128,.4);">$1</strong>');

    // $$ and $
    t = t.replace(/\$\$([^$]+)\$\$/g,'<span style="background:rgba(124,58,237,.1);padding:2px 7px;border-radius:5px;font-family:monospace;">$1</span>');
    t = t.replace(/\$([^$\n]+)\$/g,  '<span style="background:rgba(124,58,237,.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:.85em;">$1</span>');

    // Headings → colored bold
    t = t.replace(/^###\s*(.+)$/gm,'<strong style="color:#c4b5fd;font-size:.9em;display:block;margin-top:8px;letter-spacing:.02em;">$1</strong>');
    t = t.replace(/^##\s*(.+)$/gm, '<strong style="color:#c4b5fd;display:block;margin-top:8px;">$1</strong>');
    t = t.replace(/^#\s*(.+)$/gm,  '<strong style="color:#a78bfa;font-size:1.05em;display:block;margin-top:8px;">$1</strong>');

    // **bold**
    t = t.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');

    // *italic*
    t = t.replace(/\*([^*\n]+)\*/g,'<em style="color:#a78bfa;">$1</em>');

    // `code`
    t = t.replace(/`([^`]+)`/g,'<code style="background:rgba(124,58,237,.18);padding:1px 6px;border-radius:4px;font-family:Space Mono,monospace;font-size:.8em;color:#c4b5fd;">$1</code>');

    // Numbered steps
    t = t.replace(/^(\d+\.\s.+)$/gm,'<div style="padding:3px 0 3px 10px;border-left:2px solid rgba(124,58,237,.6);margin:4px 0;color:#e2e8f0;">$1</div>');

    // Newlines
    t = t.replace(/\n/g,'<br>');

    return t;
  }

})();
