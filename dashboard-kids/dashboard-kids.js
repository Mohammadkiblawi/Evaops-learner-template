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
   PROFILE AVATAR JIGGLE on click
═══════════════════════════════════════════════ */
document.getElementById('profileBtn')?.addEventListener('click', () => {
  showToast('info', 'CodeWizard — Level 19 Intermediate Coder 🧙');
});

  // Panel switcher
    function switchPanel(panelId, btn) {
      // Update sidebar nav active state
      document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Hide all mid panels
      document.querySelectorAll('.mid-panel').forEach(p => p.classList.remove('active'));

      // Toggle advisor full-width mode
      const grid = document.querySelector('.dash-grid');
      if (grid) grid.classList.toggle('advisor-mode', panelId === 'advisor');

      // Show target panel
      const target = document.getElementById('panel-' + panelId);
      if (target) {
        target.classList.add('active');
        // Re-trigger reveal animations for newly shown panel
        target.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), 50);
        });
        // Re-animate bars inside newly shown panel
        target.querySelectorAll('.quest-bar-fill[data-pct]').forEach(el => {
          el.style.width = '0';
          setTimeout(() => { el.style.width = el.dataset.pct + '%'; }, 150);
        });
        target.querySelectorAll('.mission-bar-fill[data-pct]').forEach(el => {
          el.style.width = '0';
          setTimeout(() => { el.style.width = el.dataset.pct + '%'; }, 200);
        });
      }

      // Hide / show right column for leaderboard full view
      const gridd = document.querySelector('.dash-grid');
      if (panelId === 'leaderboard-mid') {
        gridd.classList.add('hide-right');
      } else {
        gridd.classList.remove('hide-right');
      }
    }

    // Tab switcher for quests2 / badges2 panel
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          // Find sibling tabs in same container
          const tabsContainer = btn.closest('.dash-tabs');
          if (!tabsContainer) return;
          tabsContainer.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');

          // Find the panel section (parent of tabs)
          const section = tabsContainer.closest('.mid-panel') || tabsContainer.closest('.dash-col--mid');

          // Map tab names to panel IDs
          const panelMap = {
            'quests':  'panelQuests',
            'badges':  'panelBadges',
            'quests2': 'panelQuests2',
            'badges2': 'panelBadges2',
          };
          // Hide all tab panels in scope
          ['panelQuests','panelBadges','panelQuests2','panelBadges2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
          });
          const target = document.getElementById(panelMap[tab]);
          if (target) target.classList.remove('hidden');
        });
      });
    });

/* ═══════════════════════════════════════════════════════════
   ADVISOR PANEL LOGIC
═══════════════════════════════════════════════════════════ */

/* ── Grid mode toggle when Advisor is active ── */
// (handled directly inside switchPanel above)

/* ── EVA chat responses ── */
const evaResponses = [
  "Good thinking! What do you suppose happens if the guess is *lower* than the secret number?",
  "You're on the right track! Remember — Python's `if/elif/else` can handle exactly three outcomes. Sound familiar from Section 2?",
  "Think about it this way: if I have a number in mind and you guess too low, what should your program *say* to guide you?",
  "Almost there! What Python keyword creates a loop that keeps running until a condition is false?",
  "Interesting approach! Can you explain what you expect line 8 to do? Sometimes saying it out loud helps!",
  "Let's break it down. Step 3 says 'build the while loop' — what condition should make your loop *stop*?",
  "Great question! Instead of telling you directly, think about the `random` module you already imported. What function would give you a random integer?",
  "You've already solved harder problems than this! Look at your Section 1 — you used comparison operators there. Which ones might help now?",
];

let evaIdx = 0;

const chatMessages  = document.getElementById('advChatMessages');
const chatInput     = document.getElementById('advChatInput');
const chatSend      = document.getElementById('advChatSend');
const evaTyping     = document.getElementById('evaTyping');

function appendUserMsg(text) {
  const div = document.createElement('div');
  div.className = 'adv-msg user new';
  div.innerHTML = `
    <div class="adv-msg-bubble user-bubble"><p>${escHtml(text)}</p></div>
    <span class="adv-msg-meta">Me</span>`;
  chatMessages.appendChild(div);
  scrollChat();
}

function appendEvaMsg(text) {
  evaTyping.style.display = 'flex';
  scrollChat();
  setTimeout(() => {
    evaTyping.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'adv-msg eva new';
    div.innerHTML = `
      <div class="adv-msg-avatar">
        <img src="https://api.dicebear.com/8.x/bottts/svg?seed=EVA&backgroundColor=7c3aed" alt="EVA"/>
      </div>
      <div class="adv-msg-bubble"><p>${text}</p></div>`;
    chatMessages.appendChild(div);
    scrollChat();
  }, 1200 + Math.random() * 600);
}

function scrollChat() {
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = chatInput?.value.trim();
  if (!text) return;
  appendUserMsg(text);
  chatInput.value = '';
  const reply = evaResponses[evaIdx % evaResponses.length];
  evaIdx++;
  appendEvaMsg(reply);
}

chatSend?.addEventListener('click', sendMessage);
chatInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

/* Quick chips */
document.querySelectorAll('.adv-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (!chatInput) return;
    chatInput.value = chip.dataset.msg;
    sendMessage();
  });
});

/* ── Run button simulation ── */
const advRunBtn      = document.getElementById('advRunBtn');
const advOutputBody  = document.getElementById('advOutputBody');
const advOutputStatus = document.getElementById('advOutputStatus');

const runOutputLines = [
  { cls: 'cmd', text: '$ python main.py' },
  { cls: 'in',  text: '> Guess: 50' },
  { cls: 'err', text: '! No hint — add your if/else block' },
  { cls: 'in',  text: '> Guess: 75' },
  { cls: 'err', text: '! No hint — add your if/else block' },
  { cls: 'in',  text: '>' },
];

advRunBtn?.addEventListener('click', () => {
  advRunBtn.classList.add('running');
  advRunBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
  advOutputStatus.textContent = '● running';
  advOutputStatus.className = 'adv-output-status running';
  advOutputBody.innerHTML = '';

  runOutputLines.forEach((line, i) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = `adv-out-line ${line.cls}`;
      if (i === runOutputLines.length - 1) el.classList.add('cursor-blink');
      el.textContent = line.text;
      advOutputBody.appendChild(el);
      advOutputBody.scrollTop = advOutputBody.scrollHeight;
    }, 300 + i * 280);
  });

  setTimeout(() => {
    advRunBtn.classList.remove('running');
    advRunBtn.innerHTML = '<i class="fas fa-play"></i> Run';
    // EVA reacts to the run
    appendEvaMsg("I can see you ran the code! Your loop starts but doesn't give hints. What condition should you check <em>immediately after</em> the user types a number?");
  }, 300 + runOutputLines.length * 280 + 400);
});

/* ── Helper ── */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}