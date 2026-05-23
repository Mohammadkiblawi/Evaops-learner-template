'use strict';

/* ═══════════════════════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// Also force-trigger all visible ones on load
function triggerVisible() {
  revealEls.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('load', triggerVisible);
setTimeout(triggerVisible, 100);


/* ═══════════════════════════════════════════════
   ANIMATED BARS (XP fill, quest bars, mission bar)
═══════════════════════════════════════════════ */
function animateBars() {
  // Profile XP bar
  document.querySelectorAll('.profile-xp-fill').forEach(el => {
    const pct = el.dataset.pct || 0;
    setTimeout(() => { el.style.width = pct + '%'; }, 300);
  });

  // XP SVG ring
  const ring = document.getElementById('xpRingFill');
  if (ring) {
    const circumference = 2 * Math.PI * 52; // 326.7
    const pct = 0.85; // 85% progress
    setTimeout(() => {
      ring.style.strokeDashoffset = circumference * (1 - pct);
    }, 400);
  }

  // Mission bar
  document.querySelectorAll('.mission-bar-fill').forEach(el => {
    const pct = el.dataset.pct || 0;
    setTimeout(() => { el.style.width = pct + '%'; }, 500);
  });

  // Quest bars
  document.querySelectorAll('.quest-bar-fill').forEach(el => {
    const pct = el.dataset.pct || 0;
    setTimeout(() => { el.style.width = pct + '%'; }, 600);
  });
}

window.addEventListener('load', animateBars);


/* ═══════════════════════════════════════════════
   NAVBAR – hamburger + scroll shadow
═══════════════════════════════════════════════ */
const dashNav       = document.getElementById('dashNav');
const dashHamburger = document.getElementById('dashHamburger');
const dashNavLinks  = document.getElementById('dashNavLinks');
const dashMobOverlay = document.getElementById('dashMobOverlay');

window.addEventListener('scroll', () => {
  dashNav.style.boxShadow = window.scrollY > 8
    ? '0 4px 24px rgba(124,58,237,0.12)'
    : '0 2px 20px rgba(124,58,237,0.07)';
}, { passive: true });

function toggleMobMenu(force) {
  const isOpen = force !== undefined ? force : !dashNavLinks.classList.contains('open');
  dashHamburger.classList.toggle('open', isOpen);
  dashNavLinks.classList.toggle('open', isOpen);
  dashMobOverlay.classList.toggle('show', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
dashHamburger.addEventListener('click', () => toggleMobMenu());
dashMobOverlay.addEventListener('click', () => toggleMobMenu(false));
dashNavLinks.querySelectorAll('.dash-nav-link').forEach(link => {
  link.addEventListener('click', () => toggleMobMenu(false));
});


/* ═══════════════════════════════════════════════
   TABS (Active Quests / My Badges)
═══════════════════════════════════════════════ */
const tabs = document.querySelectorAll('.dash-tab');
const panels = {
  quests: document.getElementById('panelQuests'),
  badges: document.getElementById('panelBadges'),
};

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    Object.entries(panels).forEach(([key, panel]) => {
      if (key === target) {
        panel.classList.remove('hidden');
        // Re-animate quest bars if switching back
        panel.querySelectorAll('.quest-bar-fill').forEach(el => {
          el.style.width = '0';
          setTimeout(() => { el.style.width = (el.dataset.pct || 0) + '%'; }, 80);
        });
        // Re-reveal badges
        panel.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), 60);
        });
      } else {
        panel.classList.add('hidden');
      }
    });
  });
});


/* ═══════════════════════════════════════════════
   CONFETTI ENGINE
═══════════════════════════════════════════════ */
const canvas = document.getElementById('confettiCanvas');
const ctx    = canvas.getContext('2d');
let confettiParticles = [];
let confettiRAF = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const COLORS = ['#7c3aed','#a855f7','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316'];

function launchConfetti(count = 120) {
  resizeCanvas();
  confettiParticles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height * 0.3,
    r: 5 + Math.random() * 6,
    d: 1.5 + Math.random() * 2.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt: Math.random() * 20 - 10,
    tiltAngle: 0,
    tiltSpeed: 0.04 + Math.random() * 0.06,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    opacity: 1,
  }));

  if (confettiRAF) cancelAnimationFrame(confettiRAF);
  let frame = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    confettiParticles.forEach(p => {
      if (p.y > canvas.height + 30 || p.opacity <= 0) return;
      alive = true;
      p.tiltAngle += p.tiltSpeed;
      p.y += p.d;
      p.x += Math.sin(p.tiltAngle) * 1.5;
      if (frame > 120) p.opacity -= 0.012;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tiltAngle);
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    frame++;
    if (alive) confettiRAF = requestAnimationFrame(drawConfetti);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  drawConfetti();
}


/* ═══════════════════════════════════════════════
   XP TOAST
═══════════════════════════════════════════════ */
const xpToast = document.getElementById('xpToast');
function showXPToast(msg = '+50 XP earned!') {
  xpToast.querySelector('span').textContent = msg;
  xpToast.classList.add('show');
  setTimeout(() => xpToast.classList.remove('show'), 2800);
}


/* ═══════════════════════════════════════════════
   LEVEL-UP MODAL
═══════════════════════════════════════════════ */
const lvlupOverlay = document.getElementById('lvlupOverlay');
const lvlupClose   = document.getElementById('lvlupClose');

function showLevelUp() {
  lvlupOverlay.classList.add('show');
  launchConfetti(160);
}
lvlupClose.addEventListener('click', () => {
  lvlupOverlay.classList.remove('show');
  if (confettiRAF) { cancelAnimationFrame(confettiRAF); ctx.clearRect(0,0,canvas.width,canvas.height); }
});


/* ═══════════════════════════════════════════════
   QUEST "Continue" BUTTONS
═══════════════════════════════════════════════ */
document.querySelectorAll('.quest-continue').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    showXPToast('+50 XP earned!');
    // Simulate progress on the bar
    const bar = btn.closest('.quest-card').querySelector('.quest-bar-fill');
    if (bar) {
      const current = parseFloat(bar.style.width || bar.dataset.pct) || 0;
      const next = Math.min(100, current + 10);
      bar.style.width = next + '%';
      const pctEl = btn.closest('.quest-card').querySelector('.quest-pct');
      if (pctEl) pctEl.textContent = Math.round(next) + '%';
    }
  });
});


/* ═══════════════════════════════════════════════
   PROFILE STAT CLICK → XP gain animation
═══════════════════════════════════════════════ */
document.querySelectorAll('.profile-stat').forEach(stat => {
  stat.addEventListener('click', () => {
    showXPToast('+25 XP bonus!');
    stat.style.transform = 'scale(1.12)';
    setTimeout(() => { stat.style.transform = ''; }, 300);
  });
});


/* ═══════════════════════════════════════════════
   LEADERBOARD "See all" → demo
═══════════════════════════════════════════════ */
document.getElementById('seeAllBtn')?.addEventListener('click', () => {
  showToast('info', '284 players are competing this week! 🏆');
});


/* ═══════════════════════════════════════════════
   COURSES BUTTON
═══════════════════════════════════════════════ */
document.getElementById('coursesBtn')?.addEventListener('click', () => {
  window.location.href = 'children.html';
});


/* ═══════════════════════════════════════════════
   LEADERBOARD ITEM HOVER SPARKLE
═══════════════════════════════════════════════ */
document.querySelectorAll('.lb-item').forEach((item, i) => {
  item.addEventListener('click', () => {
    const name = item.querySelector('.lb-name')?.textContent?.trim() || 'Player';
    const xp   = item.querySelector('.lb-xp')?.textContent?.trim() || '';
    showToast('info', `${name} — ${xp}`);
  });
});


/* ═══════════════════════════════════════════════
   FRIEND ACTIVITY CLICK
═══════════════════════════════════════════════ */
document.querySelectorAll('.friend-item').forEach(item => {
  item.addEventListener('click', () => {
    const name = item.querySelector('strong')?.textContent || 'Friend';
    showToast('success', `Say hi to ${name}! 👋`);
  });
});


/* ═══════════════════════════════════════════════
   BADGE ITEM CLICK → celebrate
═══════════════════════════════════════════════ */
document.querySelectorAll('.badge-item.earned').forEach(item => {
  item.addEventListener('click', () => {
    const name = item.querySelector('span')?.textContent || 'Badge';
    showToast('success', `You earned the "${name}" badge! 🎖️`);
    launchConfetti(60);
  });
});


/* ═══════════════════════════════════════════════
   MISSION BAR CLICK → level-up demo
═══════════════════════════════════════════════ */
document.querySelector('.mission-card')?.addEventListener('click', () => {
  showXPToast('+500 XP earned!');
  setTimeout(() => showLevelUp(), 800);
});


/* ═══════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════ */
const toastContainer = document.getElementById('toastContainer');

function showToast(type, message) {
  const icons = { success: 'fa-check-circle', info: 'fa-circle-info', error: 'fa-exclamation-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon"></i><span class="toast-msg">${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => removeToast(toast), 3500);
  toast.addEventListener('click', () => removeToast(toast));
}
function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 320);
}


/* ═══════════════════════════════════════════════
   KEYBOARD SHORTCUT: press "L" to trigger level-up (demo)
═══════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'l' || e.key === 'L') showLevelUp();
});


/* ═══════════════════════════════════════════════
   PROFILE AVATAR JIGGLE on click
═══════════════════════════════════════════════ */
document.getElementById('profileBtn')?.addEventListener('click', () => {
  showToast('info', 'CodeWizard — Level 19 Intermediate Coder 🧙');
});


/* ═══════════════════════════════════════════════
   IDLE XP DRIP – shows XP toast every 45s (demo)
═══════════════════════════════════════════════ */
setInterval(() => {
  const msgs = ['+10 XP — keep it up!', '+15 XP — nice streak!', '+5 XP — you rock!'];
  showXPToast(msgs[Math.floor(Math.random() * msgs.length)]);
}, 45000);
