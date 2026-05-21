'use strict';

/* ============================================================
   NAVBAR
============================================================ */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const mobileOverlay = document.getElementById('mobileOverlay');

// Scrolled shadow
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
  updateAOS();
}, { passive: true });

// Toggle mobile menu
function toggleMobileMenu(force) {
  const isOpen = force !== undefined ? force : !navLinks.classList.contains('open');
  hamburger.classList.toggle('open', isOpen);
  navLinks.classList.toggle('open', isOpen);
  mobileOverlay.classList.toggle('show', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMobileMenu());
mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));

// Close menu on nav-link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => toggleMobileMenu(false));
});

// Mobile sign-in / trial buttons inside menu
document.getElementById('openSigninMobile')?.addEventListener('click', () => {
  toggleMobileMenu(false);
  openModal('viewSignin');
});
document.getElementById('openTrialMobile')?.addEventListener('click', () => {
  toggleMobileMenu(false);
  openModal('viewRegStep1');
});


/* ============================================================
   AOS (Scroll Animations)
============================================================ */
const aosEls = document.querySelectorAll('[data-aos]');

function updateAOS() {
  aosEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('aos-animate');
    }
  });
}

// Run once on load + scroll
window.addEventListener('load', updateAOS);
setTimeout(updateAOS, 120);


/* ============================================================
   COUNTER ANIMATION
============================================================ */
let countersStarted = false;
const counterEls = document.querySelectorAll('.stat-number');

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  counterEls.forEach(el => {
    const target = +el.dataset.target;
    const duration = 1800;
    const steps = 60;
    let current = 0;
    const increment = target / steps;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, duration / steps);
  });
}

const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
  const statsObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { startCounters(); statsObs.disconnect(); }
  }, { threshold: 0.5 });
  statsObs.observe(statsSection);
}


/* ============================================================
   HERO CARD TILT
============================================================ */
const codeCard = document.querySelector('.code-card');
if (codeCard) {
  codeCard.addEventListener('mousemove', e => {
    const r = codeCard.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    codeCard.style.transform =
      `perspective(800px) rotateX(${(-y / r.height * 8).toFixed(2)}deg) rotateY(${(x / r.width * 8).toFixed(2)}deg) translateY(-6px)`;
  });
  codeCard.addEventListener('mouseleave', () => { codeCard.style.transform = ''; });
}


/* ============================================================
   SINGLE MODAL SYSTEM
============================================================ */
const mainModal      = document.getElementById('mainModal');
const modalCard      = document.getElementById('modalCard');
const modalClose     = document.getElementById('modalClose');
const modalBack      = document.getElementById('modalBack');
const modalBackText  = document.getElementById('modalBackText');
const modalProgressBar  = document.getElementById('modalProgressBar');
const modalProgressFill = document.getElementById('modalProgressFill');
const modalViews     = document.getElementById('modalViews');

let currentView = null;

// View configuration
const viewConfig = {
  viewSignin: {
    showProgress: false,
    showBack: false,
    progressWidth: '0%',
  },
  viewRegStep1: {
    showProgress: true,
    showBack: false,
    progressWidth: '50%',
  },
  viewRegStep2: {
    showProgress: true,
    showBack: true,
    backText: 'Back to age selection',
    backTarget: 'viewRegStep1',
    progressWidth: '100%',
  },
};

function openModal(viewId, direction = 'forward') {
  const view = document.getElementById(viewId);
  if (!view) return;

  // Show overlay
  mainModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (currentView === viewId) return;

  const exitClass = direction === 'back' ? 'view-exit-back' : 'view-exit-forward';
  const enterClass = direction === 'back' ? 'view-enter-back' : 'view-enter-forward';

  // Animate out previous view
  if (currentView) {
    const prevView = document.getElementById(currentView);
    if (prevView) {
      prevView.classList.remove('view-active');
      prevView.classList.add(exitClass);
      // After transition, fully hide it
      setTimeout(() => {
        prevView.classList.remove(exitClass);
      }, 340);
    }
  }

  // Prepare enter state (off-screen, no transition yet)
  view.classList.add(enterClass);
  // Force reflow so CSS sees the start state before adding active
  void view.offsetWidth;

  // Trigger transition to active
  requestAnimationFrame(() => {
    view.classList.remove(enterClass);
    view.classList.add('view-active');
  });

  currentView = viewId;

  // Configure modal chrome
  const cfg = viewConfig[viewId] || {};

  // Progress bar
  if (cfg.showProgress) {
    modalProgressBar.classList.add('show');
    setTimeout(() => { modalProgressFill.style.width = cfg.progressWidth || '0%'; }, 50);
  } else {
    modalProgressBar.classList.remove('show');
    modalProgressFill.style.width = cfg.progressWidth || '0%';
  }

  // Back button
  if (cfg.showBack) {
    modalBack.style.display = 'inline-flex';
    if (modalBackText) modalBackText.textContent = cfg.backText || 'Back';
    modalBack.dataset.target = cfg.backTarget || '';
  } else {
    modalBack.style.display = 'none';
  }

  // Scroll modal to top
  modalCard.scrollTop = 0;
}

function closeModal() {
  mainModal.classList.remove('active');
  document.body.style.overflow = '';
  // Reset after transition
  setTimeout(() => {
    if (currentView) {
      const v = document.getElementById(currentView);
      if (v) v.classList.remove('view-active');
    }
    currentView = null;
    clearAllErrors();
  }, 320);
}

// Close button
modalClose.addEventListener('click', closeModal);

// Backdrop click
document.getElementById('modalBackdrop').addEventListener('click', closeModal);

// Back button
modalBack.addEventListener('click', () => {
  const target = modalBack.dataset.target;
  if (target) openModal(target, 'back');
});

// ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mainModal.classList.contains('active')) closeModal();
});

// "data-goto" links inside modal
modalViews.addEventListener('click', e => {
  const link = e.target.closest('[data-goto]');
  if (link) {
    e.preventDefault();
    openModal(link.dataset.goto);
  }
});

// Trigger buttons
document.getElementById('openSignin')?.addEventListener('click', () => openModal('viewSignin'));
document.getElementById('openTrialNav')?.addEventListener('click', () => openModal('viewRegStep1'));
document.getElementById('openTrialHero')?.addEventListener('click', () => openModal('viewRegStep1'));
document.getElementById('openTrialCta')?.addEventListener('click', () => openModal('viewRegStep1'));
document.getElementById('watchDemo')?.addEventListener('click', () => openDemoModal());

/* ============================================================
   DEMO MODAL (separate, standalone)
============================================================ */
const demoModal = document.getElementById('demoModal');
const demoModalClose = document.getElementById('demoModalClose');
const demoModalBackdrop = document.getElementById('demoModalBackdrop');

function openDemoModal() {
  demoModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDemoModal() {
  demoModal.classList.remove('active');
  document.body.style.overflow = '';
}

demoModalClose?.addEventListener('click', closeDemoModal);
demoModalBackdrop?.addEventListener('click', closeDemoModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && demoModal?.classList.contains('active')) closeDemoModal();
});

document.querySelectorAll('.footer-signin-link').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); openModal('viewSignin'); });
});
document.querySelectorAll('.footer-create-link').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); openModal('viewRegStep1'); });
});


/* ============================================================
   PATH SELECTION (Step 1)
============================================================ */
document.querySelectorAll('.path-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.path-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    clearError('pathErr');
  });
});

document.getElementById('continueStep1')?.addEventListener('click', () => {
  const selected = document.querySelector('.path-option.selected');
  if (!selected) {
    showError('pathErr', 'Please select a learning path to continue.');
    shakePaths();
    return;
  }
  openModal('viewRegStep2');
});

function shakePaths() {
  const el = document.getElementById('pathOptions');
  el.classList.remove('shake-anim');
  void el.offsetWidth; // reflow
  el.classList.add('shake-anim');
  setTimeout(() => el.classList.remove('shake-anim'), 500);
}


/* ============================================================
   PASSWORD TOGGLE
============================================================ */
document.addEventListener('click', e => {
  const btn = e.target.closest('.toggle-pw');
  if (!btn) return;
  const input = document.getElementById(btn.dataset.target);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.querySelector('i').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
});


/* ============================================================
   VALIDATION HELPERS
============================================================ */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error', 'success'));
}

function setInputState(input, state) {
  input.classList.remove('error', 'success');
  if (state) input.classList.add(state);
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}
function validatePassword(val) {
  return val.length >= 8;
}


/* ============================================================
   SIGN IN FORM
============================================================ */
document.getElementById('signinForm')?.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  const emailEl = document.getElementById('siEmail');
  const passEl  = document.getElementById('siPassword');

  // Email
  if (!emailEl.value.trim()) {
    showError('siEmailErr', 'Email address is required.');
    setInputState(emailEl, 'error'); valid = false;
  } else if (!validateEmail(emailEl.value)) {
    showError('siEmailErr', 'Please enter a valid email address.');
    setInputState(emailEl, 'error'); valid = false;
  } else {
    clearError('siEmailErr');
    setInputState(emailEl, 'success');
  }

  // Password
  if (!passEl.value) {
    showError('siPasswordErr', 'Password is required.');
    setInputState(passEl, 'error'); valid = false;
  } else if (!validatePassword(passEl.value)) {
    showError('siPasswordErr', 'Password must be at least 8 characters.');
    setInputState(passEl, 'error'); valid = false;
  } else {
    clearError('siPasswordErr');
    setInputState(passEl, 'success');
  }

  if (!valid) return;

  // Simulate sign-in
  const btn = e.target.querySelector('.btn-modal-primary');
  setButtonLoading(btn, true, 'Signing In...');
  setTimeout(() => {
    setButtonLoading(btn, false, 'Sign In');
    closeModal();
    showToast('success', 'Welcome back! You have signed in successfully.', 'fa-check-circle');
  }, 1400);
});


/* ============================================================
   REGISTER FORM (Step 2)
============================================================ */
document.getElementById('registerForm')?.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  const nameEl    = document.getElementById('regName');
  const emailEl   = document.getElementById('regEmail');
  const passEl    = document.getElementById('regPassword');
  const confirmEl = document.getElementById('regConfirm');
  const agreeEl   = document.getElementById('agreeTerms');

  // Name
  if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
    showError('regNameErr', 'Please enter your full name (min. 2 characters).');
    setInputState(nameEl, 'error'); valid = false;
  } else {
    clearError('regNameErr'); setInputState(nameEl, 'success');
  }

  // Email
  if (!emailEl.value.trim()) {
    showError('regEmailErr', 'Email address is required.');
    setInputState(emailEl, 'error'); valid = false;
  } else if (!validateEmail(emailEl.value)) {
    showError('regEmailErr', 'Please enter a valid email address.');
    setInputState(emailEl, 'error'); valid = false;
  } else {
    clearError('regEmailErr'); setInputState(emailEl, 'success');
  }

  // Password
  if (!passEl.value) {
    showError('regPasswordErr', 'Password is required.');
    setInputState(passEl, 'error'); valid = false;
  } else if (!validatePassword(passEl.value)) {
    showError('regPasswordErr', 'Min. 8 characters.');
    setInputState(passEl, 'error'); valid = false;
  } else {
    clearError('regPasswordErr'); setInputState(passEl, 'success');
  }

  // Confirm
  if (!confirmEl.value) {
    showError('regConfirmErr', 'Please confirm your password.');
    setInputState(confirmEl, 'error'); valid = false;
  } else if (confirmEl.value !== passEl.value) {
    showError('regConfirmErr', 'Passwords do not match.');
    setInputState(confirmEl, 'error'); valid = false;
  } else {
    clearError('regConfirmErr'); setInputState(confirmEl, 'success');
  }

  // Terms
  if (!agreeEl.checked) {
    showError('agreeErr', 'You must agree to the Terms of Service to continue.');
    valid = false;
  } else {
    clearError('agreeErr');
  }

  if (!valid) return;

  // Simulate register
  const btn = e.target.querySelector('.btn-modal-primary');
  setButtonLoading(btn, true, 'Creating account...');
  setTimeout(() => {
    setButtonLoading(btn, false, null, true);
    closeModal();
    showToast('success', 'Account created! Welcome to EVAOPS Academy.', 'fa-rocket');
  }, 1600);
});


/* ============================================================
   BUTTON LOADING STATE
============================================================ */
function setButtonLoading(btn, loading, text, isSuccess) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    btn.style.opacity = '0.8';
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    if (isSuccess) {
      btn.innerHTML = `<i class="fas fa-check"></i> Done!`;
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
      btn.innerHTML = btn.dataset.originalHtml || text;
    }
  }
}


/* ============================================================
   TOAST NOTIFICATIONS
============================================================ */
const toastContainer = document.getElementById('toastContainer');

function showToast(type, message, icon) {
  const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const iconClass = icon || iconMap[type] || 'fa-info-circle';

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <span class="toast-msg">${message}</span>
  `;
  toastContainer.appendChild(toast);

  // Auto remove
  setTimeout(() => removeToast(toast), 4000);
  toast.addEventListener('click', () => removeToast(toast));
}

function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 320);
}


/* ============================================================
   SHAKE KEYFRAME (injected once)
============================================================ */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  .shake-anim {
    animation: shakePaths 0.45s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes shakePaths {
    0%, 100% { transform: translateX(0); }
    15%       { transform: translateX(-7px); }
    30%       { transform: translateX(7px); }
    45%       { transform: translateX(-5px); }
    60%       { transform: translateX(5px); }
    75%       { transform: translateX(-3px); }
    90%       { transform: translateX(3px); }
  }
`;
document.head.appendChild(shakeStyle);


/* ============================================================
   SMOOTH SCROLL
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});