// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
let currentPanel = 'home';
let chartsInitialized = false;

function navigateTo(panel, navEl) {
  if (panel === currentPanel) { closeSidebar(); return; }

  // Animate out
  const old = document.getElementById('panel-' + currentPanel);
  if (old) {
    old.style.animation = 'panelOut 0.3s cubic-bezier(0.4,0,0.2,1) both';
    setTimeout(() => { old.classList.remove('active'); old.style.animation = ''; }, 280);
  }

  setTimeout(() => {
    currentPanel = panel;
    const next = document.getElementById('panel-' + panel);
    if (next) { next.classList.add('active'); }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (navEl) navEl.classList.add('active');

    // Panel-specific inits
    if (panel === 'home' && !chartsInitialized) { initCharts(); chartsInitialized = true; }
    if (panel === 'home') { animateSkillBars('.skill-fill','data-w'); animateLpProgress(); }
    if (panel === 'progress') { setTimeout(() => animateSkillBars('.prog-skill-fill','data-pw'), 200); initProgressChart(); }
    if (panel === 'leaderboard') { renderFullLeaderboard(); }

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
  document.querySelectorAll(selector).forEach(bar => {
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = bar.getAttribute(attr) + '%'; }, 100);
  });
}

// ═══════════════════════════════════════════════
//  HEATMAP
// ═══════════════════════════════════════════════
const lvls = ['none','none','low','mid','high','mid','low','high','mid','none','low','high','high','mid','low','none','mid','high','mid','low','high','high','mid','low','none','mid','high','none','low','mid'];
const hg = document.getElementById('heatmapGrid');
lvls.forEach(l => {
  const c = document.createElement('div');
  c.className = 'heatmap-cell ' + l;
  const xpMap = {none:0,low:Math.floor(Math.random()*80+40),mid:Math.floor(Math.random()*180+120),high:Math.floor(Math.random()*280+200)};
  c.title = xpMap[l] + ' XP';
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
    html += `<div class="lp-section">
      <div class="lp-section-header">
        <div class="lp-section-num" style="${numStyle}">${si+1}</div>
        <span class="lp-section-title">${sec.title}</span>
        <span class="lp-section-badge ${sec.badge}">${sec.badge==='done'?'<i class="fa-solid fa-check fa-xs"></i> Complete':sec.badge==='active'?'<i class="fa-solid fa-play fa-xs"></i> In Progress':'<i class="fa-solid fa-lock fa-xs"></i> Locked'}</span>
      </div>
      <div class="nodes-path">`;
    sec.nodes.forEach((node, ni) => {
      html += `<div class="node-row ${node.side}"><div class="node-item ${node.type}" onclick="nodeClick(this)">
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
  }, 30);
}

function nodeClick(el) {
  if (el.classList.contains('locked')) return;
  el.style.transform = 'scale(0.93)';
  setTimeout(() => { el.style.transform = ''; }, 160);
}

function switchLpTab(btn, track) {
  document.querySelectorAll('.lp-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderLpBody(track);
}

// ═══════════════════════════════════════════════
//  GLOBAL LEADERBOARD (home panel mini)
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
  renderGlbRows();
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
      c.style.opacity='0'; setTimeout(()=>{renderFullLeaderboard();c.style.opacity='1';},200);
    };
  });
}

// ═══════════════════════════════════════════════
//  CHARTS (Home)
// ═══════════════════════════════════════════════
function initCharts() {
  // XP Chart
  const xCtx = document.getElementById('xpChart');
  if (!xCtx) return;
  const xGrad = xCtx.getContext('2d').createLinearGradient(0,0,0,155);
  xGrad.addColorStop(0,'rgba(108,99,255,0.38)'); xGrad.addColorStop(1,'rgba(108,99,255,0)');
  new Chart(xCtx, {
    type:'line', data:{
      labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets:[{label:'XP',data:[320,480,680,820,760,920,600],borderColor:'#6c63ff',borderWidth:2.5,backgroundColor:xGrad,pointBackgroundColor:'#6c63ff',pointBorderColor:'#fff',pointBorderWidth:2,pointRadius:5,pointHoverRadius:8,tension:0.45,fill:true}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,10,26,0.95)',borderColor:'rgba(108,99,255,0.4)',borderWidth:1,titleColor:'#e8e8ff',bodyColor:'#8888bb',padding:10,cornerRadius:8}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}},min:0,max:1000}},animation:{duration:1200,easing:'easeOutQuart'}}
  });

  // Radar
  const rCtx = document.getElementById('radarChart');
  if (!rCtx) return;
  new Chart(rCtx, {
    type:'radar', data:{
      labels:['Python','DS&A','OOP','APIs','Automation','Debugging'],
      datasets:[{label:'Mastery',data:[82,67,74,55,88,70],borderColor:'#6c63ff',borderWidth:2,backgroundColor:'rgba(108,99,255,0.18)',pointBackgroundColor:'#6c63ff',pointBorderColor:'#fff',pointBorderWidth:1.5,pointRadius:4,pointHoverRadius:7}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,10,26,0.95)',borderColor:'rgba(108,99,255,0.4)',borderWidth:1,titleColor:'#e8e8ff',bodyColor:'#8888bb',cornerRadius:8}},scales:{r:{grid:{color:'rgba(255,255,255,0.07)'},angleLines:{color:'rgba(255,255,255,0.07)'},pointLabels:{color:'#8888bb',font:{size:11}},ticks:{display:false,stepSize:25},min:0,max:100}},animation:{duration:1400,easing:'easeOutQuart'}}
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
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,10,26,0.95)',borderColor:'rgba(0,212,255,0.4)',borderWidth:1,titleColor:'#e8e8ff',bodyColor:'#8888bb',cornerRadius:8}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#8888bb',font:{size:11}}}},animation:{duration:1200,easing:'easeOutQuart'}}
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

  // Bot typing
  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    botDiv.innerHTML = `<div class="msg-bubble" style="color:var(--text-muted);font-style:italic"><i class="fa-solid fa-ellipsis fa-beat"></i> EVA is thinking...</div>`;
    msgs.appendChild(botDiv);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
      botDiv.innerHTML = `<div class="msg-bubble"><i class="fa-solid fa-robot fa-xs" style="color:var(--accent2);margin-right:5px"></i>${evaResponses[evaRespIndex % evaResponses.length]}</div><div class="msg-time">Just now</div>`;
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
    if (s) s.style.display = t === tab ? 'block' : 'none';
  });
}

// ═══════════════════════════════════════════════
//  LP TABS (mini lb)
// ═══════════════════════════════════════════════
document.querySelectorAll('.lb-tabs .lb-tab').forEach(btn => {
  btn.onclick = function() {
    this.closest('.lb-tabs').querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  };
});

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // XP bar
  setTimeout(() => {
    const b = document.getElementById('profileXpBar');
    if (b) b.style.width = '86%';
  }, 400);

  // Init home panel
  renderLpBody('beginner');
  animateLpProgress();
  setTimeout(() => animateSkillBars('.skill-fill','data-w'), 500);
  setTimeout(() => { initCharts(); chartsInitialized = true; }, 300);
  renderGlbRows();
});
