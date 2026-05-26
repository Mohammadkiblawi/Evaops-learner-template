// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
let currentPanel = 'home';
let chartsInitialized = false;

function navigateTo(panel, navEl) {
  if (panel === currentPanel) { closeSidebar(); return; }

  const old = document.getElementById('panel-' + currentPanel);
  if (old) {
    old.style.animation = 'panelOut 0.3s cubic-bezier(0.4,0,0.2,1) both';
    setTimeout(() => { old.classList.remove('active'); old.style.animation = ''; }, 280);
  }

  setTimeout(() => {
    currentPanel = panel;
    const next = document.getElementById('panel-' + panel);
    if (next) { next.classList.add('active'); }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (navEl) navEl.classList.add('active');

    // Panel-specific inits & re-animations
    if (panel === 'home') {
      if (!chartsInitialized) { initCharts(); chartsInitialized = true; }
      animateSkillBars('.skill-fill','data-w');
      animateLpProgress();
      replayStatCards('#panel-home .stats-grid');
      animateGoalRing();
      staggerElements('#panel-home .activity-item', 60);
      staggerElements('#panel-home .upnext-item', 65);
    }
    if (panel === 'progress') {
      setTimeout(() => animateSkillBars('.prog-skill-fill','data-pw'), 150);
      initProgressChart();
      replayStatCards('#panel-progress .stats-grid');
      staggerElements('.prog-skill-item', 70);
      staggerElements('.milestone-item', 55);
    }
    if (panel === 'leaderboard') {
      renderFullLeaderboard();
      staggerElements('.lb-panel-filters .lb-panel-filter', 50);
    }
    if (panel === 'challenges') {
      replayStatCards('#panel-challenges .stats-grid');
      staggerElements('.challenge-card', 65);
    }
    if (panel === 'compete') {
      staggerElements('.compete-stat', 80);
      countUpElement('.compete-stats .compete-stat:nth-child(1) .cv', 38, 900);
      countUpElement('.compete-stats .compete-stat:nth-child(2) .cv', 28, 900);
      countUpElement('.compete-stats .compete-stat:nth-child(3) .cv', 10, 700);
      staggerElements('.match-row', 70);
    }
    if (panel === 'certificates') {
      staggerElements('.cert-card', 65);
    }
    if (panel === 'eva') {
      const msgs = document.getElementById('evaMessages');
      if (msgs) setTimeout(() => msgs.scrollTop = msgs.scrollHeight, 200);
    }

    closeSidebar();
    window.scrollTo({top:0, behavior:'smooth'});
  }, 150);
}

// ═══════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ═══════════════════════════════════════════════
//  SKILL BARS
// ═══════════════════════════════════════════════
function animateSkillBars(selector, attr) {
  document.querySelectorAll(selector).forEach((bar, i) => {
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = bar.getAttribute(attr) + '%'; }, 100 + i * 60);
  });
}

// ═══════════════════════════════════════════════
//  STAGGER HELPER — replays entrance animation
// ═══════════════════════════════════════════════
function staggerElements(selector, delayStep) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = '';
    el.style.animationDelay = (i * delayStep) + 'ms';
  });
}

// ═══════════════════════════════════════════════
//  RE-PLAY STAT CARDS
// ═══════════════════════════════════════════════
function replayStatCards(containerSelector) {
  const cards = document.querySelectorAll(containerSelector + ' .stat-card');
  cards.forEach((c, i) => {
    c.style.animation = 'none';
    c.offsetHeight;
    c.style.animation = '';
    c.style.animationDelay = (50 + i * 55) + 'ms';
    const val = c.querySelector('.stat-card-value');
    if (val) {
      val.style.animation = 'none'; val.offsetHeight; val.style.animation = '';
      val.style.animationDelay = (120 + i * 55) + 'ms';
    }
  });
}

// ═══════════════════════════════════════════════
//  COUNT-UP NUMBERS
// ═══════════════════════════════════════════════
function countUpElement(selector, target, duration) {
  const el = document.querySelector(selector);
  if (!el) return;
  const start = Date.now();
  const suffix = el.textContent.replace(/[0-9,]/g,'').trim();
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + (suffix || '');
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ═══════════════════════════════════════════════
//  RIPPLE EFFECT
// ═══════════════════════════════════════════════
function addRipple(e) {

  const btn = e.currentTarget;
  // Safety check
  if (!(btn instanceof HTMLElement)) return;
  const rect = btn.getBoundingClientRect();
  const r = document.createElement('span');
  r.className = 'ripple-effect';
  r.style.left = `${e.clientX - rect.left - 3}px`;
  r.style.top  = `${e.clientY - rect.top - 3}px`;
  btn.appendChild(r);
  btn.classList.add('ripple-wrap');
  setTimeout(() => {
    r.remove();
  }, 600);
}
// ═══════════════════════════════════════════════
//  GOAL RING ANIMATE
// ═══════════════════════════════════════════════
function animateGoalRing() {
  const circle = document.getElementById('goalCircle');
  if (!circle) return;
  circle.style.strokeDashoffset = '188'; // start at 0 fill
  setTimeout(() => { circle.style.strokeDashoffset = '47'; }, 300); // 75% fill
}

// ═══════════════════════════════════════════════
//  HEATMAP (wave entrance)
// ═══════════════════════════════════════════════
const lvls = ['none','none','low','mid','high','mid','low','high','mid','none','low','high','high','mid','low','none','mid','high','mid','low','high','high','mid','low','none','mid','high','none','low','mid'];
const hg = document.getElementById('heatmapGrid');
lvls.forEach((l, i) => {
  const c = document.createElement('div');
  c.className = 'heatmap-cell ' + l;
  const xpMap = {none:0,low:Math.floor(Math.random()*80+40),mid:Math.floor(Math.random()*180+120),high:Math.floor(Math.random()*280+200)};
  c.title = xpMap[l] + ' XP';
  // Wave-in stagger
  c.style.animationDelay = (i * 18) + 'ms';
  // Tooltip on hover
  c.addEventListener('mouseenter', function() { this.title = xpMap[l] + ' XP earned'; });
  hg.appendChild(c);
});

// ═══════════════════════════════════════════════
//  LP PROGRESS
// ═══════════════════════════════════════════════
function animateLpProgress() {
  const el = document.getElementById('lpFill');
  if (el) { el.style.width = '0%'; setTimeout(() => { el.style.width = '60%'; }, 200); }
}

// ═══════════════════════════════════════════════
//  LP CONTENT
// ═══════════════════════════════════════════════
const lpData = {
  beginner: [
    { title:'The Fundamentals', badge:'done', nodes:[
      {type:'done',icon:'fa-solid fa-hashtag',label:'Variables & Types',xp:'+80 XP',side:'left'},
      {type:'done',icon:'fa-solid fa-terminal',label:'Print & Input',xp:'+80 XP',side:'right'},
      {type:'done',icon:'fa-solid fa-calculator',label:'Operators',xp:'+100 XP',side:'left'},
      {type:'boss',icon:'fa-solid fa-skull-crossbones',label:'Boss Fight',xp:'+250 XP',side:'right'},
    ]},
    { title:'Control Flow', badge:'active', nodes:[
      {type:'done',icon:'fa-solid fa-code-branch',label:'If / Else',xp:'+120 XP',side:'left'},
      {type:'current',icon:'fa-solid fa-rotate',label:'Loops',xp:'+150 XP',side:'right'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Nested Logic',xp:'+180 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Boss Fight',xp:'+300 XP',side:'right'},
    ]},
    { title:'Functions', badge:'locked', nodes:[
      {type:'locked',icon:'fa-solid fa-lock',label:'Defining',xp:'+100 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Parameters',xp:'+120 XP',side:'right'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Scope',xp:'+150 XP',side:'left'},
    ]},
  ],
  intermediate: [
    { title:'Data Structures', badge:'locked', nodes:[
      {type:'locked',icon:'fa-solid fa-lock',label:'Lists & Tuples',xp:'+150 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Dicts & Sets',xp:'+160 XP',side:'right'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Stacks & Queues',xp:'+200 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Boss Fight',xp:'+400 XP',side:'right'},
    ]},
    { title:'OOP', badge:'locked', nodes:[
      {type:'locked',icon:'fa-solid fa-lock',label:'Classes',xp:'+180 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Inheritance',xp:'+220 XP',side:'right'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Polymorphism',xp:'+250 XP',side:'left'},
    ]},
  ],
  advanced: [
    { title:'Algorithms', badge:'locked', nodes:[
      {type:'locked',icon:'fa-solid fa-lock',label:'Sorting',xp:'+200 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Binary Search',xp:'+220 XP',side:'right'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Graph Traversal',xp:'+300 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Boss Fight',xp:'+600 XP',side:'right'},
    ]},
    { title:'Systems', badge:'locked', nodes:[
      {type:'locked',icon:'fa-solid fa-lock',label:'Async Python',xp:'+280 XP',side:'left'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Concurrency',xp:'+320 XP',side:'right'},
      {type:'locked',icon:'fa-solid fa-lock',label:'Memory Mgmt',xp:'+350 XP',side:'left'},
    ]},
  ],
};

function renderLpBody(track) {
  const body = document.getElementById('lpBody');
  if (!body) return;
  const sections = lpData[track];
  let html = '';
  sections.forEach((sec, si) => {
    if (si > 0) html += `<div class="lp-divider"></div>`;
    const numStyle = sec.badge === 'active' ? 'background:var(--gradient2)' : sec.badge === 'locked' ? 'background:rgba(255,255,255,0.12)' : '';
    html += `<div class="lp-section" style="animation:fadeSlideUp 0.4s ease ${si*0.1}s both">
      <div class="lp-section-header">
        <div class="lp-section-num" style="${numStyle}">${si+1}</div>
        <span class="lp-section-title">${sec.title}</span>
        <span class="lp-section-badge ${sec.badge}">${sec.badge==='done'?'<i class="fa-solid fa-check fa-xs"></i> Complete':sec.badge==='active'?'<i class="fa-solid fa-play fa-xs"></i> In Progress':'<i class="fa-solid fa-lock fa-xs"></i> Locked'}</span>
      </div>
      <div class="nodes-path">`;
    sec.nodes.forEach((node, ni) => {
      html += `<div class="node-row ${node.side}" style="animation:fadeSlideUp 0.35s ease ${si*0.1 + ni*0.07}s both">
        <div class="node-item ${node.type}" onclick="nodeClick(this)">
          <div class="node-icon"><i class="${node.icon}"></i></div>
          <div><div class="node-label">${node.label}</div><div class="node-xp">${node.xp}</div></div>
        </div></div>`;
      if (ni < sec.nodes.length - 1) {
        const clr = node.type==='boss'?'rgba(255,107,157,0.5)':node.type==='current'?'rgba(0,212,255,0.4)':node.type==='locked'?'rgba(255,255,255,0.07)':'rgba(108,99,255,0.45)';
        const from = node.side==='left'?'60 0':'240 0';
        const to   = node.side==='left'?'240 36':'60 36';
        html += `<svg class="path-svg" viewBox="0 0 300 36" preserveAspectRatio="none">
          <path d="M ${from} Q 150 18 ${to}" stroke="${clr}" stroke-width="2" fill="none" stroke-dasharray="${node.type==='locked'?'4,4':'5,3'}"/>
        </svg>`;
      }
    });
    html += `</div></div>`;
  });
  body.style.opacity = '0'; body.style.transform = 'translateY(10px)';
  body.innerHTML = html;
  setTimeout(() => {
    body.style.transition = 'all 0.35s ease';
    body.style.opacity = '1'; body.style.transform = 'translateY(0)';
    // ╔══════════════════════════════════════════════╗
    // ║  ADDED: Init Tippy tooltips on new LP nodes  ║
    // ╚══════════════════════════════════════════════╝
    initLpTooltips();
  }, 30);
}

function nodeClick(el) {
  if (el.classList.contains('locked')) {
    // Shake for locked nodes
    el.style.animation = 'none'; el.offsetHeight;
    el.style.animation = 'shake 0.35s ease';
    return;
  }
  // Ripple
  const r = document.createElement('span');
  r.className = 'ripple-effect';
  r.style.left = '50%'; r.style.top = '50%';
  el.appendChild(r);
  el.style.transform = 'scale(0.93)';
  setTimeout(() => { el.style.transform = ''; r.remove(); }, 300);
}

function switchLpTab(btn, track) {
  document.querySelectorAll('.lp-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderLpBody(track);
}

// ═══════════════════════════════════════════════
//  GLOBAL LEADERBOARD (home panel)
// ═══════════════════════════════════════════════
const players = [
  {rank:1,ini:'SC',color:'linear-gradient(135deg,#ff6b9d,#ff4444)',name:'Sarah Chen',level:42,xp:'12,840',ch:89,trend:'+2',dir:'up'},
  {rank:2,ini:'MW',color:'linear-gradient(135deg,#06d6a0,#0099cc)',name:'Marcus Webb',level:41,xp:'12,390',ch:76,trend:'—',dir:'same'},
  {rank:3,ini:'PN',color:'linear-gradient(135deg,#ffd166,#ff9900)',name:'Priya Nair',level:39,xp:'11,750',ch:68,trend:'-1',dir:'down'},
  {rank:4,ini:'AK',color:'linear-gradient(135deg,#6c63ff,#a78bfa)',name:'Alex K.',level:38,xp:'11,420',ch:62,trend:'+3',dir:'up',you:true},
  {rank:5,ini:'TB',color:'linear-gradient(135deg,#00d4ff,#6c63ff)',name:'Tom Briscoe',level:36,xp:'10,890',ch:55,trend:'-2',dir:'down'},
  {rank:6,ini:'YT',color:'linear-gradient(135deg,#ff6b9d,#a78bfa)',name:'Yuki Tanaka',level:35,xp:'10,340',ch:51,trend:'+1',dir:'up'},
  {rank:7,ini:'DF',color:'linear-gradient(135deg,#06d6a0,#ffd166)',name:'Dana Flores',level:33,xp:'9,870',ch:44,trend:'—',dir:'same'},
  {rank:8,ini:'RS',color:'linear-gradient(135deg,#ff4444,#ff9900)',name:'Riku Sato',level:32,xp:'9,420',ch:40,trend:'-1',dir:'down'},
];

function renderGlbRows() {
  const c = document.getElementById('glbRows'); if (!c) return;
  const medals = ['<i class="fa-solid fa-medal" style="color:#ffd166"></i>','<i class="fa-solid fa-medal" style="color:#c0c0c0"></i>','<i class="fa-solid fa-medal" style="color:#cd7f32"></i>'];
  c.innerHTML = players.map((p,i) => `
    <div class="glb-row${p.you?' you-row':''}" style="animation:fadeSlideUp 0.4s ease ${i*0.05}s both">
      <div class="glb-rank ${i<3?['gold-t','silver-t','bronze-t'][i]:''}">${i<3?medals[i]:p.rank}</div>
      <div class="glb-player">
        <div class="glb-avatar" style="background:${p.color}">${p.ini}</div>
        <div><div class="glb-name">${p.name}${p.you?'<span class="glb-you-tag">YOU</span>':''}</div></div>
      </div>
      <div class="glb-level glb-level-col">Lv.${p.level}</div>
      <div class="glb-xp">${p.xp}</div>
      <div class="glb-trend ${p.dir}">${p.dir==='up'?'<i class="fa-solid fa-arrow-trend-up fa-xs"></i> +'+p.trend:p.dir==='down'?'<i class="fa-solid fa-arrow-trend-down fa-xs"></i> '+p.trend:'—'}</div>
    </div>`).join('');
}

function switchGlbTab(btn) {
  document.querySelectorAll('.global-lb-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const c = document.getElementById('glbRows');
  if (c) { c.style.opacity='0'; setTimeout(()=>{ renderGlbRows(); c.style.opacity='1'; }, 200); }
}

// ═══════════════════════════════════════════════
//  FULL LEADERBOARD PANEL
// ═══════════════════════════════════════════════
function renderFullLeaderboard() {
  const c = document.getElementById('lbFullRows'); if (!c) return;
  const medals = ['<i class="fa-solid fa-medal" style="color:#ffd166"></i>','<i class="fa-solid fa-medal" style="color:#c0c0c0"></i>','<i class="fa-solid fa-medal" style="color:#cd7f32"></i>'];
  c.innerHTML = players.map((p,i) => `
    <div class="lb-full-row${p.you?' you-row':''}" style="animation:fadeSlideUp 0.4s ease ${i*0.06}s both">
      <div class="glb-rank ${i<3?['gold-t','silver-t','bronze-t'][i]:''}">${i<3?medals[i]:p.rank}</div>
      <div class="glb-player">
        <div class="glb-avatar" style="background:${p.color}">${p.ini}</div>
        <div><div class="glb-name">${p.name}${p.you?'<span class="glb-you-tag">YOU</span>':''}</div></div>
      </div>
      <div class="glb-level">Lv.${p.level}</div>
      <div class="glb-xp">${p.xp}</div>
      <div style="font-size:0.75rem;color:var(--text-muted)">${p.ch}</div>
      <div class="glb-trend ${p.dir}">${p.dir==='up'?'<i class="fa-solid fa-arrow-trend-up fa-xs"></i>':p.dir==='down'?'<i class="fa-solid fa-arrow-trend-down fa-xs"></i>':'—'} ${p.trend}</div>
    </div>`).join('');
  document.querySelectorAll('.lb-panel-filter').forEach(f => {
    f.onclick = function() {
      document.querySelectorAll('.lb-panel-filter').forEach(x=>x.classList.remove('active'));
      this.classList.add('active');
      c.style.opacity='0';
      setTimeout(()=>{ renderFullLeaderboard(); c.style.transition='opacity 0.25s ease'; c.style.opacity='1'; }, 200);
    };
  });
}

// ═══════════════════════════════════════════════
//  CHARTS (Home)
// ═══════════════════════════════════════════════
function initCharts() {
  const xCtx = document.getElementById('xpChart');
  if (!xCtx) return;
  const xGrad = xCtx.getContext('2d').createLinearGradient(0,0,0,155);
  xGrad.addColorStop(0,'rgba(108,99,255,0.38)'); xGrad.addColorStop(1,'rgba(108,99,255,0)');
  new Chart(xCtx, {
    type:'line', data:{
      labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets:[{label:'XP',data:[320,480,680,820,760,920,600],borderColor:'#6c63ff',borderWidth:2.5,backgroundColor:xGrad,pointBackgroundColor:'#6c63ff',pointBorderColor:'#fff',pointBorderWidth:2,pointRadius:5,pointHoverRadius:8,tension:0.45,fill:true}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,10,26,0.95)',borderColor:'rgba(108,99,255,0.4)',borderWidth:1,titleColor:'#e8e8ff',bodyColor:'#8888bb',padding:10,cornerRadius:8}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}},min:0,max:1000}},animation:{duration:1400,easing:'easeOutQuart'}}
  });

  const rCtx = document.getElementById('radarChart');
  if (!rCtx) return;
  new Chart(rCtx, {
    type:'radar', data:{
      labels:['Python','DS&A','OOP','APIs','Automation','Debugging'],
      datasets:[{label:'Mastery',data:[82,67,74,55,88,70],borderColor:'#6c63ff',borderWidth:2,backgroundColor:'rgba(108,99,255,0.18)',pointBackgroundColor:'#6c63ff',pointBorderColor:'#fff',pointBorderWidth:1.5,pointRadius:4,pointHoverRadius:7}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,10,26,0.95)',borderColor:'rgba(108,99,255,0.4)',borderWidth:1,titleColor:'#e8e8ff',bodyColor:'#8888bb',cornerRadius:8}},scales:{r:{grid:{color:'rgba(255,255,255,0.07)'},angleLines:{color:'rgba(255,255,255,0.07)'},pointLabels:{color:'#8888bb',font:{size:11}},ticks:{display:false,stepSize:25},min:0,max:100}},animation:{duration:1600,easing:'easeOutQuart'}}
  });
}

// Progress Chart
let progressChartInst = null;
function initProgressChart() {
  const el = document.getElementById('progressChart'); if (!el) return;
  if (progressChartInst) return;
  const g = el.getContext('2d').createLinearGradient(0,0,0,180);
  g.addColorStop(0,'rgba(0,212,255,0.35)'); g.addColorStop(1,'rgba(0,212,255,0)');
  progressChartInst = new Chart(el, {
    type:'line', data:{
      labels:['Jan','Feb','Mar','Apr','May'],
      datasets:[{label:'XP',data:[1200,3400,5800,8900,11420],borderColor:'#00d4ff',borderWidth:2.5,backgroundColor:g,pointBackgroundColor:'#00d4ff',pointBorderColor:'#fff',pointBorderWidth:2,pointRadius:5,tension:0.4,fill:true}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,10,26,0.95)',borderColor:'rgba(0,212,255,0.4)',borderWidth:1,titleColor:'#e8e8ff',bodyColor:'#8888bb',cornerRadius:8}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}}}},animation:{duration:1400,easing:'easeOutQuart'}}
  });
}

// ═══════════════════════════════════════════════
//  EVA ADVISOR CHAT
// ═══════════════════════════════════════════════
const evaResponses = [
  "Great question! Based on your current progress, I recommend focusing on Web APIs next — it's your weakest area at 55%. I've queued up 3 targeted exercises for you! 🎯",
  "Your learning velocity is in the top 15% this week! 🚀 You're averaging 511 XP/day. Keep this pace and you'll hit Level 40 by June 8th.",
  "I noticed you solved 3 Data Structure problems yesterday — that boosted your DS&A skill from 63% to 67%. Impressive! 📈",
  "Here's your daily tip: When working with async Python, always use `asyncio.gather()` for concurrent tasks instead of running them sequentially. This can speed up I/O-bound code by 5-10x! ⚡",
  "For your code review: I'd suggest adding type hints to your functions — it'll make your code more readable and catch bugs early. Want me to generate an example? 🔍",
];
let evaRespIndex = 0;

function sendEvaMsg() {
  const input = document.getElementById('evaInput');
  const msgs = document.getElementById('evaMessages');
  if (!input || !msgs || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';

  // User message
  const userDiv = document.createElement('div');
  userDiv.className = 'msg user';
  userDiv.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-time">Just now</div>`;
  msgs.appendChild(userDiv);
  msgs.scrollTop = msgs.scrollHeight;
  input.focus();

  // Bot typing indicator
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    botDiv.innerHTML = `<div class="msg-bubble" style="color:var(--text-muted);font-style:italic">
      <i class="fa-solid fa-ellipsis fa-beat"></i> EVA is thinking...</div>`;
    msgs.appendChild(botDiv);
    msgs.scrollTop = msgs.scrollHeight;

    // Bot response
    setTimeout(() => {
      botDiv.innerHTML = `<div class="msg-bubble">
        <i class="fa-solid fa-robot fa-xs" style="color:var(--accent2);margin-right:5px"></i>
        ${evaResponses[evaRespIndex % evaResponses.length]}
      </div><div class="msg-time">Just now</div>`;
      evaRespIndex++;
      msgs.scrollTop = msgs.scrollHeight;
    }, 1200);
  }, 300);
}

function sendSuggestion(el) {
  const input = document.getElementById('evaInput');
  input.value = el.textContent.trim();
  sendEvaMsg();
}

// ═══════════════════════════════════════════════
//  SETTINGS TABS
// ═══════════════════════════════════════════════
function switchSettingsTab(el, tab) {
  document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  ['profile','notifications','appearance','privacy'].forEach(t => {
    const s = document.getElementById('settings-' + t);
    if (!s) return;
    if (t === tab) {
      s.style.display = 'block';
      s.style.animation = 'none'; s.offsetHeight;
      s.style.animation = 'fadeSlideUp 0.3s ease both';
    } else {
      s.style.display = 'none';
    }
  });
}

// ═══════════════════════════════════════════════
//  LP TABS mini lb
// ═══════════════════════════════════════════════
document.querySelectorAll('.lb-tabs .lb-tab').forEach(btn => {
  btn.onclick = function() {
    this.closest('.lb-tabs').querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  };
});

// ═══════════════════════════════════════════════
//  BUTTON RIPPLES — attach to all buttons
// ═══════════════════════════════════════════════
document.addEventListener('click', function(e) {
  const btn = e.target.closest('button, .ch-start-btn, .compete-btn, .eva-send');
  if (btn) addRipple(e);
});

// ═══════════════════════════════════════════════
//  SHAKE KEYFRAME (for locked nodes)
// ═══════════════════════════════════════════════
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake {
  0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)}
  60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }`;
document.head.appendChild(shakeStyle);

/*╔══════════════════════════════════════════════════════════╗
       ║  ADDED: Tippy.js tooltip initialisation for snake nodes  ║
       ╚══════════════════════════════════════════════════════════╝ */
// ── Node metadata keyed by label (matches lpData node labels) ──────
const LP_NODE_DATA = {
  // ── Beginner / The Fundamentals ──
  'Variables & Types': {
    icon: 'fa-solid fa-database', state: 'done', time: '15 min', xp: '+80 XP',
    desc: 'Store and name your data. Understand int, float, str, bool and how Python handles types at runtime.',
    tags: [{ l:'Data types', c:'' }, { l:'int / str / bool', c:'cyan' }, { l:'Type casting', c:'' }],
    btn: { label:'Review', icon:'fa-solid fa-rotate-left', type:'review' }
  },
  'Print & Input': {
    icon: 'fa-solid fa-terminal', state: 'done', time: '15 min', xp: '+80 XP',
    desc: 'Talk to your program. Display output with print() and read user input — the foundation of every interactive script.',
    tags: [{ l:'print()', c:'' }, { l:'input()', c:'cyan' }, { l:'f-strings', c:'green' }],
    btn: { label:'Review', icon:'fa-solid fa-rotate-left', type:'review' }
  },
  'Operators': {
    icon: 'fa-solid fa-calculator', state: 'done', time: '15 min', xp: '+100 XP',
    desc: 'Do maths and make comparisons. Arithmetic, comparison and logical operators are the engine of every expression.',
    tags: [{ l:'Arithmetic +-×÷', c:'' }, { l:'Comparison == !=', c:'' }, { l:'Logical and/or', c:'green' }],
    btn: { label:'Review', icon:'fa-solid fa-rotate-left', type:'review' }
  },
  // Boss Fight (Fundamentals) — matched by label + parent section title
  'Boss Fight_done': {
    icon: 'fa-solid fa-dragon', state: 'boss', time: '25 min', xp: '+250 XP',
    desc: 'Build a mini-calculator that handles all four operations and catches division by zero. Prove your basics mastery!',
    tags: [{ l:'All operators', c:'' }, { l:'Input validation', c:'amber' }, { l:'Error handling', c:'red' }],
    btn: { label:'Review', icon:'fa-solid fa-rotate-left', type:'review' }, done: true
  },
  // ── Beginner / Control Flow ──
  'If / Else': {
    icon: 'fa-solid fa-code-branch', state: 'done', time: '20 min', xp: '+120 XP',
    desc: 'Make decisions. Use if, elif and else to control which block of code runs based on a condition.',
    tags: [{ l:'Conditions', c:'' }, { l:'elif chains', c:'' }, { l:'Boolean logic', c:'cyan' }],
    btn: { label:'Review', icon:'fa-solid fa-rotate-left', type:'review' }
  },
  'Loops': {
    icon: 'fa-solid fa-arrows-rotate', state: 'current', time: '20 min', xp: '+150 XP',
    desc: 'Repeat actions without copying code. Master for loops and while loops to iterate over data and automate tasks.',
    tags: [{ l:'for loop', c:'' }, { l:'while loop', c:'cyan' }, { l:'break / continue', c:'amber' }],
    btn: { label:'Resume', icon:'fa-solid fa-play', type:'resume' }
  },
  'Nested Logic': {
    icon: 'fa-solid fa-sitemap', state: 'locked', time: '25 min', xp: '+180 XP',
    desc: 'Combine loops and conditionals inside each other to solve multi-layered problems step by step.',
    tags: [{ l:'Nesting', c:'' }, { l:'Indentation', c:'' }, { l:'Complexity', c:'red' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Boss Fight_cf_locked': {
    icon: 'fa-solid fa-shield-halved', state: 'locked', time: '30 min', xp: '+300 XP',
    desc: 'Complete Nested Logic first to unlock this challenge. Beat the control flow boss to advance to Functions!',
    tags: [{ l:'Control flow', c:'' }, { l:'Boss fight', c:'red' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  // ── Beginner / Functions ──
  'Defining': {
    icon: 'fa-solid fa-f', state: 'locked', time: '20 min', xp: '+100 XP',
    desc: 'Write reusable blocks of code. Define functions with def, run them anywhere, and stop repeating yourself.',
    tags: [{ l:'def keyword', c:'' }, { l:'return', c:'cyan' }, { l:'Reusability', c:'green' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Parameters': {
    icon: 'fa-solid fa-sliders', state: 'locked', time: '20 min', xp: '+120 XP',
    desc: 'Pass data into functions. Understand positional args, keyword args and default values to make functions flexible.',
    tags: [{ l:'Arguments', c:'' }, { l:'Defaults', c:'' }, { l:'*args / **kwargs', c:'amber' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Scope': {
    icon: 'fa-solid fa-eye', state: 'locked', time: '15 min', xp: '+150 XP',
    desc: 'Understand where variables live. Local vs global scope determines which parts of your code can read your data.',
    tags: [{ l:'Local', c:'' }, { l:'Global', c:'' }, { l:'Namespaces', c:'cyan' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  // ── Intermediate / Data Structures ──
  'Lists & Tuples': {
    icon: 'fa-solid fa-list', state: 'locked', time: '25 min', xp: '+150 XP',
    desc: 'Ordered collections of items. Lists are mutable; tuples are immutable. Learn indexing, slicing and list comprehensions.',
    tags: [{ l:'Indexing', c:'' }, { l:'Slicing', c:'cyan' }, { l:'Comprehensions', c:'green' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Dicts & Sets': {
    icon: 'fa-solid fa-table', state: 'locked', time: '25 min', xp: '+160 XP',
    desc: 'Key-value stores and unordered unique collections. Master .get(), .update(), set operations and dict comprehensions.',
    tags: [{ l:'Key-value', c:'' }, { l:'.get() / .update()', c:'cyan' }, { l:'Set ops', c:'amber' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Stacks & Queues': {
    icon: 'fa-solid fa-layer-group', state: 'locked', time: '30 min', xp: '+200 XP',
    desc: 'Implement LIFO and FIFO structures using lists and deque. Essential for algorithms and system design.',
    tags: [{ l:'LIFO / FIFO', c:'' }, { l:'deque', c:'cyan' }, { l:'Algorithms', c:'red' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Boss Fight_ds_locked': {
    icon: 'fa-solid fa-shield-halved', state: 'locked', time: '35 min', xp: '+400 XP',
    desc: 'Complete all Data Structures lessons to unlock this boss. Build a data pipeline that uses every structure.',
    tags: [{ l:'Data structures', c:'' }, { l:'Boss fight', c:'red' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  // ── Intermediate / OOP ──
  'Classes': {
    icon: 'fa-solid fa-cubes', state: 'locked', time: '30 min', xp: '+180 XP',
    desc: 'Define blueprints for objects. Learn __init__, attributes, methods and how classes model real-world things in code.',
    tags: [{ l:'__init__', c:'' }, { l:'self', c:'cyan' }, { l:'Methods', c:'' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Inheritance': {
    icon: 'fa-solid fa-diagram-project', state: 'locked', time: '30 min', xp: '+220 XP',
    desc: 'Extend existing classes. Child classes inherit parent behaviour — reuse, override and extend without duplication.',
    tags: [{ l:'super()', c:'' }, { l:'Override', c:'cyan' }, { l:'DRY principle', c:'green' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Polymorphism': {
    icon: 'fa-solid fa-shapes', state: 'locked', time: '25 min', xp: '+250 XP',
    desc: 'Same interface, different behaviour. Use duck typing and method overriding to write flexible, extensible systems.',
    tags: [{ l:'Duck typing', c:'' }, { l:'Method overriding', c:'cyan' }, { l:'Interfaces', c:'amber' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  // ── Advanced / Algorithms ──
  'Sorting': {
    icon: 'fa-solid fa-arrow-down-a-z', state: 'locked', time: '30 min', xp: '+200 XP',
    desc: 'Understand O(n log n) sorting algorithms. Compare bubble, merge and quicksort — and when to use Python\'s built-in sort.',
    tags: [{ l:'Bubble sort', c:'' }, { l:'Merge sort', c:'cyan' }, { l:'O(n log n)', c:'amber' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Binary Search': {
    icon: 'fa-solid fa-magnifying-glass', state: 'locked', time: '25 min', xp: '+220 XP',
    desc: 'Find items in sorted data in O(log n) time. A must-know algorithm for any coding interview.',
    tags: [{ l:'O(log n)', c:'cyan' }, { l:'Sorted arrays', c:'' }, { l:'Interviews', c:'green' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Graph Traversal': {
    icon: 'fa-solid fa-circle-nodes', state: 'locked', time: '40 min', xp: '+300 XP',
    desc: 'Navigate connected data with BFS and DFS. From social networks to route finders — graphs are everywhere.',
    tags: [{ l:'BFS', c:'' }, { l:'DFS', c:'cyan' }, { l:'Adjacency list', c:'amber' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Boss Fight_algo_locked': {
    icon: 'fa-solid fa-fire-flame-curved', state: 'locked', time: '50 min', xp: '+600 XP',
    desc: 'The hardest challenge yet. Solve 3 algorithm problems under time pressure. Unlock by completing all algorithm lessons.',
    tags: [{ l:'Algorithms', c:'' }, { l:'Timed challenge', c:'red' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  // ── Advanced / Systems ──
  'Async Python': {
    icon: 'fa-solid fa-bolt', state: 'locked', time: '35 min', xp: '+280 XP',
    desc: 'Write non-blocking code with asyncio. Use async/await to run I/O-bound tasks concurrently and boost performance.',
    tags: [{ l:'asyncio', c:'' }, { l:'async/await', c:'cyan' }, { l:'I/O-bound', c:'green' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Concurrency': {
    icon: 'fa-solid fa-gears', state: 'locked', time: '40 min', xp: '+320 XP',
    desc: 'Run tasks in parallel with threading and multiprocessing. Understand the GIL and choose the right tool.',
    tags: [{ l:'Threading', c:'' }, { l:'Multiprocessing', c:'cyan' }, { l:'GIL', c:'amber' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
  'Memory Mgmt': {
    icon: 'fa-solid fa-microchip', state: 'locked', time: '35 min', xp: '+350 XP',
    desc: 'Understand how Python allocates and frees memory. Reference counting, garbage collection and profiling leaks.',
    tags: [{ l:'Reference counting', c:'' }, { l:'GC', c:'cyan' }, { l:'Profiling', c:'red' }],
    btn: { label:'Locked', icon:'fa-solid fa-lock', type:'locked-btn' }
  },
};

// ── Resolve the correct data key for a node ─────────────────────────
// Boss Fight appears multiple times so we disambiguate by section badge
function resolveLpKey(label, type, sectionBadge) {
  if (label === 'Boss Fight') {
    if (type === 'done' || (type === 'boss' && sectionBadge === 'done')) return 'Boss Fight_done';
    const map = { active:'Boss Fight_cf_locked', locked_cf:'Boss Fight_cf_locked',
                  locked_ds:'Boss Fight_ds_locked', locked_algo:'Boss Fight_algo_locked' };
    // Use section title hint stored as data attribute
    return null; // resolved per-element below
  }
  return label;
}

// ── Build tooltip DOM element — zero inline onclick ──────────────────
function buildLpTooltip(nodeData, triggerEl) {
  const d = nodeData;

  // Card wrapper
  const card = document.createElement('div');
  card.className = 'lpt-card ' + d.state;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lpt-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  closeBtn.addEventListener('click', () => {
    if (triggerEl && triggerEl._tippy) triggerEl._tippy.hide();
  });
  card.appendChild(closeBtn);

  // Title row
  const titleRow = document.createElement('div');
  titleRow.className = 'lpt-title-row';
  const iconEl = document.createElement('div');
  iconEl.className = 'lpt-icon ' + d.state;
  iconEl.innerHTML = '<i class="' + d.icon + '"></i>';
  const titleEl = document.createElement('span');
  titleEl.className = 'lpt-title';
  titleEl.textContent = d.label || d._label;
  titleRow.appendChild(iconEl);
  titleRow.appendChild(titleEl);
  if (d.state === 'done' || d.done) {
    const chk = document.createElement('i');
    chk.className = 'fa-solid fa-circle-check lpt-check';
    titleRow.appendChild(chk);
  }
  card.appendChild(titleRow);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'lpt-meta';
  meta.innerHTML =
    '<span class="lpt-meta-item"><i class="fa-regular fa-clock"></i> ' + d.time + '</span>' +
    '<span class="lpt-meta-item xp"><i class="fa-solid fa-bolt"></i> ' + d.xp + '</span>';
  card.appendChild(meta);

  // Description
  const desc = document.createElement('p');
  desc.className = 'lpt-desc';
  desc.textContent = d.desc;
  card.appendChild(desc);

  // Tags
  const tagsEl = document.createElement('div');
  tagsEl.className = 'lpt-tags';
  d.tags.forEach(t => {
    const tag = document.createElement('span');
    tag.className = 'lpt-tag ' + (t.c || '');
    tag.textContent = t.l;
    tagsEl.appendChild(tag);
  });
  card.appendChild(tagsEl);

  // Divider
  const divEl = document.createElement('div');
  divEl.className = 'lpt-divider';
  card.appendChild(divEl);

  // CTA button
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'lpt-btn ' + d.btn.type;
  ctaBtn.innerHTML = '<i class="' + d.btn.icon + '"></i> ' + d.btn.label;
  ctaBtn.addEventListener('click', () => {
    if (d.btn.type === 'locked-btn') {
      // Shake the trigger element
      if (triggerEl) {
        triggerEl.style.animation = 'none'; triggerEl.offsetHeight;
        triggerEl.style.animation = 'shake 0.35s ease';
      }
      return;
    }
    if (triggerEl && triggerEl._tippy) triggerEl._tippy.hide();
    ctaBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { ctaBtn.style.transform = ''; }, 180);
  });
  card.appendChild(ctaBtn);

  return card;
}

// ── Boss Fight key lookup table by section index + track ────────────
const BOSS_KEYS_BY_SECTION = {
  // [track][sectionIndex] -> LP_NODE_DATA key
  beginner:     { 0:'Boss Fight_done', 1:'Boss Fight_cf_locked' },
  intermediate: { 0:'Boss Fight_ds_locked' },
  advanced:     { 0:'Boss Fight_algo_locked' },
};

// ── Initialise / re-initialise Tippy on all .node-item elements ─────
function initLpTooltips() {
  // Destroy any existing instances to avoid duplicates on tab switch
  document.querySelectorAll('.node-item').forEach(el => {
    if (el._tippy) el._tippy.destroy();
  });

  // Read current active track from active lp-tab
  const activeTab = document.querySelector('.lp-tab.active');
  const track = activeTab ? activeTab.textContent.trim().toLowerCase() : 'beginner';

  // Walk every section and node
  const sections = document.querySelectorAll('.lp-section');
  sections.forEach((sec, si) => {
    const nodeItems = sec.querySelectorAll('.node-item');
    nodeItems.forEach(el => {
      const labelEl = el.querySelector('.node-label');
      if (!labelEl) return;
      const label = labelEl.textContent.trim();

      // Resolve data key
      let dataKey = label;
      if (label === 'Boss Fight') {
        const bossMap = BOSS_KEYS_BY_SECTION[track] || {};
        dataKey = bossMap[si] || 'Boss Fight_done';
      }

      const nodeData = LP_NODE_DATA[dataKey];
      if (!nodeData) return;

      // Attach display label for tooltip title
      nodeData._label = label;

      // Tippy with DOM-element content — no inline JS anywhere
      tippy(el, {
        content: () => buildLpTooltip(nodeData, el),
        allowHTML: false,           // content is DOM, not string
        theme: 'lp-tooltip',
        animation: 'shift-away',
        placement: 'right',
        arrow: true,
        interactive: true,
        trigger: 'click',
        hideOnClick: 'toggle',
        appendTo: document.body,
        maxWidth: 288,
        offset: [0, 10],
        onShow() {
          // Close all other open LP tooltips
          document.querySelectorAll('.node-item').forEach(other => {
            if (other !== el && other._tippy) other._tippy.hide();
          });
        },
        popperOptions: {
          modifiers: [
            { name: 'flip',            options: { fallbackPlacements: ['left','top','bottom'] } },
            { name: 'preventOverflow', options: { padding: 10 } },
          ],
        },
      });
    });
  });
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // XP bar
  setTimeout(() => {
    const b = document.getElementById('profileXpBar');
    if (b) b.style.width = '86%';
  }, 400);

  // Home panel
  renderLpBody('beginner');
  animateLpProgress();
  // ADDED: init tooltips on first render
  setTimeout(initLpTooltips, 80);
  setTimeout(() => animateSkillBars('.skill-fill','data-w'), 500);
  setTimeout(() => { initCharts(); chartsInitialized = true; }, 300);
  renderGlbRows();

  // Goal ring
  animateGoalRing();

  // Home stat cards count-up
  setTimeout(() => {
    countUpElement('#panel-home .stat-card.gold .stat-card-value', 4, 800);
    countUpElement('#panel-home .stat-card.cyan .stat-card-value', 11420, 1000);
    countUpElement('#panel-home .stat-card.green .stat-card-value', 247, 900);
  }, 400);

  // Activity & upnext stagger
  staggerElements('.activity-item', 60);
  staggerElements('.upnext-item', 65);
});