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
  quests: document.getElementById('panelQuests2'),
  badges: document.getElementById('panelBadges2'),
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
      const grid = document.querySelector('.dash-grid');
      if (panelId === 'leaderboard-mid') {
        grid.classList.add('hide-right');
      } else {
        grid.classList.remove('hide-right');
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
   ADVISOR PANEL
═══════════════════════════════════════════════════════════ */
const evaResponses = [
  "Good thinking! What do you suppose happens if the guess is <em>lower</em> than the secret number?",
  "You're on the right track! Python's <code>if/elif/else</code> can handle exactly three outcomes. Sound familiar from Section 2?",
  "Think about it this way: if I have a number in mind and you guess too low, what should your program <em>say</em> to guide you?",
  "Almost there! What Python keyword creates a loop that keeps running until a condition is false?",
  "Can you explain what you expect line 8 to do? Sometimes saying it out loud helps!",
  "Let's break it down. Step 3 says 'build the while loop' — what condition should make your loop <em>stop</em>?",
  "You've already solved harder problems! Look at Section 1 — you used comparison operators there. Which ones might help now?",
];
let evaIdx = 0;

const advChatMessages = document.getElementById('advChatMessages');
const advChatInput    = document.getElementById('advChatInput');
const advChatSend     = document.getElementById('advChatSend');
const evaTyping       = document.getElementById('evaTyping');

function advScrollChat() { if (advChatMessages) advChatMessages.scrollTop = advChatMessages.scrollHeight; }

function advAppendUser(text) {
  const d = document.createElement('div');
  d.className = 'adv-msg user new';
  d.innerHTML = `<div class="adv-msg-bubble user-bubble"><p>${escHtml(text)}</p></div><span class="adv-msg-meta">Me</span>`;
  advChatMessages.appendChild(d);
  advScrollChat();
}

function advAppendEva(html) {
  if (evaTyping) evaTyping.style.display = 'flex';
  advScrollChat();
  setTimeout(() => {
    if (evaTyping) evaTyping.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'adv-msg eva new';
    d.innerHTML = `<div class="adv-msg-avatar"><img src="https://api.dicebear.com/8.x/bottts/svg?seed=EVA&backgroundColor=7c3aed" alt="EVA"/></div><div class="adv-msg-bubble"><p>${html}</p></div>`;
    advChatMessages.appendChild(d);
    advScrollChat();
  }, 1000 + Math.random() * 500);
}

function advSend() {
  const text = advChatInput?.value.trim();
  if (!text) return;
  advAppendUser(text);
  advChatInput.value = '';
  advAppendEva(evaResponses[evaIdx++ % evaResponses.length]);
}

advChatSend?.addEventListener('click', advSend);
advChatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') advSend(); });
document.querySelectorAll('.adv-chip').forEach(c => {
  c.addEventListener('click', () => { if (advChatInput) { advChatInput.value = c.dataset.msg; advSend(); } });
});

const advRunBtn = document.getElementById('advRunBtn');
const advOutputBody = document.getElementById('advOutputBody');
const advOutputStatus = document.getElementById('advOutputStatus');
const runLines = [
  {cls:'cmd',text:'$ python main.py'},{cls:'in',text:'> Guess: 50'},
  {cls:'err',text:'! No hint — add your if/else block'},{cls:'in',text:'> Guess: 75'},
  {cls:'err',text:'! No hint — add your if/else block'},{cls:'in',text:'>'},
];
advRunBtn?.addEventListener('click', () => {
  advRunBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
  if (advOutputBody) advOutputBody.innerHTML = '';
  runLines.forEach((l,i) => setTimeout(() => {
    const el = document.createElement('div');
    el.className = `adv-out-line ${l.cls}`;
    if (i === runLines.length-1) el.classList.add('cursor-blink');
    el.textContent = l.text;
    advOutputBody?.appendChild(el);
    if (advOutputBody) advOutputBody.scrollTop = advOutputBody.scrollHeight;
  }, 300 + i*260));
  setTimeout(() => {
    advRunBtn.innerHTML = '<i class="fas fa-play"></i> Run';
    advAppendEva("I can see you ran the code! Your loop starts but doesn't give hints. What condition should you check <em>immediately after</em> the user types a number?");
  }, 300 + runLines.length * 260 + 400);
});

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }


/* ═══════════════════════════════════════════════════════════
   1v1 COMPETE PANEL
═══════════════════════════════════════════════════════════ */

/* ── Phase references ── */
const phaseMatchmaking = document.getElementById('phaseMatchmaking');
const phaseCountdown   = document.getElementById('phaseCountdown');
const phaseBattle      = document.getElementById('phaseBattle');
const phaseResult      = document.getElementById('phaseResult');
const competeStartBtn  = document.getElementById('competeStartBtn');
const newMatchBtn      = document.getElementById('newMatchBtn');

let battleTimer = null;
let battleSeconds = 245; // 4:05

function showPhase(phase) {
  [phaseMatchmaking, phaseCountdown, phaseBattle, phaseResult].forEach(p => {
    if (p) p.classList.add('hidden');
  });
  if (phase) phase.classList.remove('hidden');
}

/* ── Countdown ── */
function startCountdown(from, onDone) {
  showPhase(phaseCountdown);
  const numEl  = document.getElementById('countdownNum');
  const ringEl = document.getElementById('countdownRingFill');
  const circ   = 326.7;
  let n = from;

  function tick() {
    if (!numEl) return;
    numEl.textContent = n;
    numEl.style.animation = 'none';
    void numEl.offsetWidth;
    numEl.style.animation = 'countPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both';
    if (ringEl) ringEl.style.strokeDashoffset = circ * (1 - n / from);
    if (n <= 0) { onDone(); return; }
    n--;
    setTimeout(tick, 1000);
  }
  tick();
}

/* ── Battle simulation ── */
function startBattle() {
  showPhase(phaseBattle);
  if (newMatchBtn) newMatchBtn.style.display = 'none';

  // Reset state
  battleSeconds = 245;
  updateTimerDisplay();
  setTestDots('youTestDots', 0, 'you-pass');
  setTestDots('oppTestDots', 0, 'pass');
  setTestFill('youTestsFill', 0);
  setTestFill('oppTestsFill', 0);
  setTestsVal('youTestsVal', 0, 8);
  setTestsVal('oppTestsVal', 0, 8);
  hideEl('youEvaHint'); hideEl('oppEvaHint');
  hideEl('youStatusDone'); showEl('youStatusCoding');

  // Timer countdown
  const timerFill = document.getElementById('battleTimerFill');
  battleTimer = setInterval(() => {
    battleSeconds--;
    updateTimerDisplay();
    if (timerFill) timerFill.style.width = (battleSeconds / 245 * 100) + '%';
    if (battleSeconds <= 0) { clearInterval(battleTimer); showResult(); }
  }, 1000);

  // Simulate YOU passing tests progressively
  const youSchedule = [4000, 6000, 9000, 12000, 16000, 20000, 26000, 34000];
  let youPassed = 0;
  youSchedule.forEach((t, i) => setTimeout(() => {
    youPassed = i + 1;
    setTestDots('youTestDots', youPassed, 'you-pass');
    setTestFill('youTestsFill', (youPassed/8)*100);
    setTestsVal('youTestsVal', youPassed, 8);
    addCommentary(`CodeWizard checks ${youPassed === 8 ? '15' : (youPassed * 2).toString()} first — smart optimization!`,
      'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Maria');
    if (youPassed === 8) {
      hideEl('youStatusCoding'); showEl('youStatusDone');
      showEvaHint('youEvaHint', 'youEvaHintText', 'EVA: CodeWizard passing all 8 test cases!');
      clearInterval(battleTimer);
      setTimeout(showResult, 1200);
    }
  }, t));

  // Simulate OPPONENT passing tests
  const oppSchedule = [5000, 8000, 13000, 18000, 24000];
  let oppPassed = 0;
  oppSchedule.forEach((t, i) => setTimeout(() => {
    oppPassed = i + 1;
    setTestDots('oppTestDots', oppPassed, 'pass');
    setTestFill('oppTestsFill', (oppPassed/8)*100);
    setTestsVal('oppTestsVal', oppPassed, 8);
    if (i === 1) addCommentary('PyMaster99 seems to be missing a condition...', null, true);
    if (i === 3) showEvaHint('oppEvaHint','oppEvaHintText','EVA: PyMaster99 seems to be missing a condition...');
  }, t));

  // Simulate opponent code typing
  simulateTyping('oppCodePre', `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        # missing buzz case
    return result`, 30);

  simulateTyping('youCodePre', `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
    return result

fizzbuzz(n)`, 22);
}

/* ── Result ── */
function showResult() {
  clearInterval(battleTimer);
  showPhase(phaseResult);
  if (newMatchBtn) newMatchBtn.style.display = 'inline-flex';
  addCommentary('CodeWizard passing all 8 test cases!',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Maria');
  launchConfetti && launchConfetti(80);
  showXPToast && showXPToast('+50 XP — You won the battle!');
}

/* ── New match ── */
function resetCompete() {
  showPhase(phaseMatchmaking);
  if (newMatchBtn) newMatchBtn.style.display = 'none';
  clearInterval(battleTimer);
  // Clear commentary except first 2 items
  const cl = document.getElementById('competeCommentary');
  if (cl) {
    while (cl.children.length > 2) cl.removeChild(cl.lastChild);
  }
}

competeStartBtn?.addEventListener('click', () => {
  startCountdown(3, () => startBattle());
});

newMatchBtn?.addEventListener('click', resetCompete);

/* ── Quick Chat ── */
const competeChatLog   = document.getElementById('competeChatLog');
const competeChatInput = document.getElementById('competeChatInput');
const competeChatSend  = document.getElementById('competeChatSend');

function sendCompeteChat(text) {
  if (!competeChatLog || !text.trim()) return;
  const d = document.createElement('div');
  d.className = 'compete-chat-msg you-msg new';
  d.innerHTML = `<span><strong>You:</strong> ${escHtml(text)}</span>`;
  competeChatLog.appendChild(d);
  competeChatLog.scrollTop = competeChatLog.scrollHeight;
}

document.querySelectorAll('.compete-emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => sendCompeteChat(btn.dataset.chat));
});
competeChatSend?.addEventListener('click', () => {
  sendCompeteChat(competeChatInput?.value || '');
  if (competeChatInput) competeChatInput.value = '';
});
competeChatInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    sendCompeteChat(competeChatInput.value);
    competeChatInput.value = '';
  }
});

/* ── Helpers ── */
function setTestDots(id, passed, cls) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  wrap.querySelectorAll('.tdot').forEach((d, i) => {
    d.classList.remove('pass','you-pass');
    if (i < passed) d.classList.add(cls);
  });
}

function setTestFill(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = pct + '%';
}

function setTestsVal(id, passed, total) {
  const el = document.getElementById(id);
  if (el) el.textContent = `${passed}/${total}`;
}

function showEvaHint(cardId, textId, text) {
  const card = document.getElementById(cardId);
  const textEl = document.getElementById(textId);
  if (card) card.style.display = 'flex';
  if (textEl) textEl.textContent = text;
}

function hideEl(id) { const e = document.getElementById(id); if (e) e.classList.add('hidden'); }
function showEl(id) { const e = document.getElementById(id); if (e) e.classList.remove('hidden'); }

function addCommentary(text, avatarSrc, isWarning = false) {
  const list = document.getElementById('competeCommentary');
  if (!list) return;
  const li = document.createElement('li');
  li.className = `commentary-item${isWarning ? ' system' : ''} new`;
  if (avatarSrc && !isWarning) {
    li.innerHTML = `<img src="${avatarSrc}" class="commentary-avatar" alt=""/><p>${escHtml(text)}</p>`;
  } else {
    const icon = isWarning ? 'fa-triangle-exclamation' : 'fa-circle-info';
    li.innerHTML = `<div class="commentary-sys-icon"><i class="fas ${icon}"></i></div><p>${escHtml(text)}</p>`;
  }
  list.appendChild(li);
  list.scrollTop = list.scrollHeight;
}

function updateTimerDisplay() {
  const el = document.getElementById('battleTimerVal');
  if (!el) return;
  const m = Math.floor(Math.max(0, battleSeconds) / 60);
  const s = Math.max(0, battleSeconds) % 60;
  el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
  if (battleSeconds <= 30) el.style.color = '#ef4444';
}

function simulateTyping(elId, code, speed) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent = code.slice(0, i);
    i += Math.ceil(Math.random() * 3 + 1);
    if (i >= code.length) { el.textContent = code; clearInterval(interval); }
  }, speed);
}

/* ── Switch panel grid mode ── */
const _origSwitchPanel = typeof switchPanel !== 'undefined' ? switchPanel : null;
// Patch the grid toggle inside the existing switchPanel via event
document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    const grid = document.querySelector('.dash-grid');
    if (!grid) return;
    if (panel === 'compete' || panel === 'advisor') {
      grid.classList.add('fullwidth-mid');
      grid.classList.remove('hide-right');
    } else if (panel === 'leaderboard-mid') {
      grid.classList.add('hide-right');
      grid.classList.remove('fullwidth-mid');
    } else {
      grid.classList.remove('hide-right','fullwidth-mid');
    }
  });
});

/*╔══════════════════════════════════════════════════════════╗
       ║  ADDED: Tippy.js tooltip initialisation for snake nodes  ║
       ╚══════════════════════════════════════════════════════════╝ */

   (function() {
 
    // ── Node data definitions ──────────────────────────────────
    // Each entry: { title, icon, state, time, xp, desc, tags[], btn }
    // state: 'done' | 'active' | 'locked' | 'boss'
    // btn: { label, icon, type: 'start'|'review'|'locked-btn' }
    const NODE_DATA = {
      'variables-done': {
        title: 'Variables',
        icon: 'fa-solid fa-code',
        state: 'done',
        time: '15 min',
        xp: '+25 XP',
        desc: 'Learn how to store and name data in Python. Variables are the building blocks of every program.',
        tags: [{ label: 'Data types', cls: '' }, { label: 'Naming rules', cls: '' }, { label: 'Assignment', cls: 'green' }],
        btn: { label: 'Review', icon: 'fa-solid fa-rotate-left', type: 'review' }
      },
      'print-done': {
        title: 'Print & Input',
        icon: 'fa-solid fa-terminal',
        state: 'done',
        time: '20 min',
        xp: '+30 XP',
        desc: 'Talk to your program! Display messages with print() and collect user responses with input().',
        tags: [{ label: 'print()', cls: '' }, { label: 'input()', cls: 'green' }, { label: 'Formatting', cls: '' }],
        btn: { label: 'Review', icon: 'fa-solid fa-rotate-left', type: 'review' }
      },
      'operators-done': {
        title: 'Operators',
        icon: 'fa-solid fa-calculator',
        state: 'done',
        time: '15 min',
        xp: '+25 XP',
        desc: 'Do maths and make comparisons. Operators are the symbols that tell Python what to do with your data.',
        tags: [{ label: 'Arithmetic +-×÷', cls: '' }, { label: 'Comparison == !=', cls: '' }, { label: 'Logical and / or', cls: 'green' }],
        btn: { label: 'Review', icon: 'fa-solid fa-rotate-left', type: 'review' }
      },
      'boss1-done': {
        title: 'Boss Fight',
        icon: 'fa-solid fa-dragon',
        state: 'boss',
        time: '25 min',
        xp: '+60 XP',
        desc: 'Time to prove your skills! Build a mini-calculator that handles all four operations and catches division by zero.',
        tags: [{ label: 'All operators', cls: '' }, { label: 'Input validation', cls: '' }, { label: 'Error handling', cls: 'orange' }],
        btn: { label: 'Review', icon: 'fa-solid fa-rotate-left', type: 'review' },
        done: true
      },
      'ifelse-done': {
        title: 'If / Else',
        icon: 'fa-solid fa-code-branch',
        state: 'done',
        time: '20 min',
        xp: '+30 XP',
        desc: 'Make decisions in your code. Use if, elif and else to choose what your program does next.',
        tags: [{ label: 'Conditions', cls: '' }, { label: 'elif chains', cls: '' }, { label: 'Boolean logic', cls: 'green' }],
        btn: { label: 'Review', icon: 'fa-solid fa-rotate-left', type: 'review' }
      },
      'loops-active': {
        title: 'Loops',
        icon: 'fa-solid fa-arrows-rotate',
        state: 'active',
        time: '20 min',
        xp: '+30 XP',
        desc: 'Loop until something changes. While loops keep going as long as a condition stays true. Master repetition!',
        tags: [{ label: 'while loop', cls: '' }, { label: 'Infinite loops', cls: 'orange' }, { label: 'Loop counter', cls: '' }],
        btn: { label: 'Start Now', icon: 'fa-solid fa-rocket', type: 'start' }
      },
      'nested-locked': {
        title: 'Nested Logic',
        icon: 'fa-solid fa-sitemap',
        state: 'locked',
        time: '25 min',
        xp: '+40 XP',
        desc: 'Combine if statements and loops inside each other to solve more complex problems step by step.',
        tags: [{ label: 'Nesting', cls: '' }, { label: 'Indentation', cls: '' }, { label: 'Complexity', cls: 'red' }],
        btn: { label: 'Locked', icon: 'fa-solid fa-lock', type: 'locked-btn' }
      },
      'boss2-locked': {
        title: 'Boss Fight',
        icon: 'fa-solid fa-shield-halved',
        state: 'locked',
        time: '30 min',
        xp: '+80 XP',
        desc: 'Complete Nested Logic first to unlock this challenge. Beat the control flow boss to advance!',
        tags: [{ label: 'Control flow', cls: '' }, { label: 'Challenge', cls: 'red' }],
        btn: { label: 'Locked', icon: 'fa-solid fa-lock', type: 'locked-btn' }
      },
      'defining-locked': {
        title: 'Defining Functions',
        icon: 'fa-solid fa-function',
        state: 'locked',
        time: '20 min',
        xp: '+35 XP',
        desc: 'Write reusable blocks of code. Functions let you name and repeat actions without copying code.',
        tags: [{ label: 'def keyword', cls: '' }, { label: 'return', cls: '' }, { label: 'Reusability', cls: 'green' }],
        btn: { label: 'Locked', icon: 'fa-solid fa-lock', type: 'locked-btn' }
      },
      'parameters-locked': {
        title: 'Parameters',
        icon: 'fa-solid fa-sliders',
        state: 'locked',
        time: '20 min',
        xp: '+35 XP',
        desc: 'Pass information into your functions. Parameters make functions flexible and powerful.',
        tags: [{ label: 'Arguments', cls: '' }, { label: 'Defaults', cls: '' }, { label: 'Keyword args', cls: 'green' }],
        btn: { label: 'Locked', icon: 'fa-solid fa-lock', type: 'locked-btn' }
      },
      'scope-locked': {
        title: 'Scope',
        icon: 'fa-solid fa-eye',
        state: 'locked',
        time: '15 min',
        xp: '+30 XP',
        desc: 'Understand where variables live. Local vs global scope controls which parts of code can see your data.',
        tags: [{ label: 'Local', cls: '' }, { label: 'Global', cls: '' }, { label: 'Namespaces', cls: 'orange' }],
        btn: { label: 'Locked', icon: 'fa-solid fa-lock', type: 'locked-btn' }
      },
      'boss3-locked': {
        title: 'Boss Fight',
        icon: 'fa-solid fa-fire-flame-curved',
        state: 'locked',
        time: '35 min',
        xp: '+100 XP',
        desc: 'The ultimate Functions challenge. Complete all function lessons to unlock this final boss!',
        tags: [{ label: 'Functions', cls: '' }, { label: 'Final boss', cls: 'red' }],
        btn: { label: 'Locked', icon: 'fa-solid fa-lock', type: 'locked-btn' }
      },
    };
 
    // ── Build tooltip as a real DOM element (no inline onclick) ──
    // This avoids ALL quote-escaping / SyntaxError issues in Tippy content.
    function buildTooltip(key, triggerEl) {
      const d = NODE_DATA[key];
 
      // Root card
      const card = document.createElement('div');
      card.className = 'tt-card';
      card.setAttribute('data-key', key);
 
      // ── Close button — JS listener, zero inline HTML ──
      const closeBtn = document.createElement('button');
      closeBtn.className = 'tt-close';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      closeBtn.addEventListener('click', function() {
        if (triggerEl && triggerEl._tippy) triggerEl._tippy.hide();
      });
      card.appendChild(closeBtn);
 
      // ── Title row ──
      const titleRow = document.createElement('div');
      titleRow.className = 'tt-title-row';
      titleRow.innerHTML =
        `<div class="tt-title-icon ${d.state}"><i class="${d.icon}"></i></div>` +
        `<span class="tt-title">${d.title}</span>` +
        ((d.state === 'done' || d.done) ? '<i class="fa-solid fa-circle-check tt-check"></i>' : '');
      card.appendChild(titleRow);
 
      // ── Meta ──
      const meta = document.createElement('div');
      meta.className = 'tt-meta';
      meta.innerHTML =
        `<span class="tt-meta-item time"><i class="fa-regular fa-clock"></i> ${d.time}</span>` +
        `<span class="tt-meta-item xp"><i class="fa-solid fa-bolt"></i> ${d.xp}</span>`;
      card.appendChild(meta);
 
      // ── Description ──
      const desc = document.createElement('p');
      desc.className = 'tt-desc';
      desc.textContent = d.desc;
      card.appendChild(desc);
 
      // ── Tags ──
      const tags = document.createElement('div');
      tags.className = 'tt-tags';
      d.tags.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'tt-tag ' + (t.cls || '');
        tag.textContent = t.label;
        tags.appendChild(tag);
      });
      card.appendChild(tags);
 
      // ── Divider ──
      const div = document.createElement('div');
      div.className = 'tt-divider';
      card.appendChild(div);
 
      // ── CTA button — JS listener, zero inline HTML ──
      const ctaBtn = document.createElement('button');
      ctaBtn.className = 'tt-btn ' + d.btn.type;
      ctaBtn.innerHTML = `<i class="${d.btn.icon}"></i> ${d.btn.label}`;
      ctaBtn.addEventListener('click', function() {
        if (d.btn.type === 'locked-btn') return;
        if (triggerEl && triggerEl._tippy) triggerEl._tippy.hide();
        ctaBtn.style.transform = 'scale(0.95)';
        setTimeout(() => { ctaBtn.style.transform = ''; }, 200);
      });
      card.appendChild(ctaBtn);
 
      return card;
    }
 
    // ── Initialise Tippy on all [data-node] icons ──────────────
    function initTooltips() {
      const icons = document.querySelectorAll('[data-node]');
      if (!icons.length) return;
 
      icons.forEach(el => {
        const key = el.getAttribute('data-node');
 
        tippy(el, {
          content: buildTooltip(key, el),
          allowHTML: true,
          theme: 'node-tooltip',
          animation: 'shift-away',
          placement: 'right',          // default: right of node
          arrow: true,
          interactive: true,           // allow clicking inside tooltip
          trigger: 'click',            // tap/click opens; tap outside closes
          hideOnClick: 'toggle',
          appendTo: document.body,     // avoid clipping inside overflow containers
          maxWidth: 300,
          offset: [0, 12],
          popperOptions: {
            modifiers: [
              {
                name: 'flip',
                options: {
                  // On narrow screens flip to top/bottom instead of left/right
                  fallbackPlacements: ['top', 'bottom', 'left'],
                },
              },
              {
                name: 'preventOverflow',
                options: { padding: 12 },
              },
            ],
          },
          // Store instance ref on root for close button
          onShow(instance) {
            // Close any other open tooltips when a new one opens
            document.querySelectorAll('[data-node]').forEach(icon => {
              if (icon !== el && icon._tippy) icon._tippy.hide();
            });
          },
        });
      });
    }
 
    // ── Run after DOM ready ────────────────────────────────────
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
      initTooltips();
    }
 
    // Re-init when the learning path panel becomes visible
    // (since panels are hidden/shown dynamically)
    const origSwitch = window.switchPanel;
    window.switchPanel = function(panelId, btn) {
      if (origSwitch) origSwitch(panelId, btn);
      if (panelId === 'learning-path') {
        setTimeout(initTooltips, 200);
      }
    };
 
  })();