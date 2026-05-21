// ══ SHARED ══
function showToast(msg) {
  const t = document.getElementById('g-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function switchApp(id) {
  document.querySelectorAll('.app-wrap').forEach(function(a) {
    a.classList.remove('active');
    a.style.display = 'none';
  });
  // Update active state in switcher menu
  document.querySelectorAll('.asw-item').forEach(function(item) {
    item.classList.remove('active');
  });
  var switcherItem = document.querySelector('.asw-item[onclick*="switchAppMenu(\''+id+'\')"]');
  if (switcherItem) switcherItem.classList.add('active');
  var app = document.getElementById('app-' + id);
  if (!app) return;
  app.style.display = (id === 'staff' || id === 'portal' || id === 'landing' || id === 'kiosk') ? 'flex' : 'flex';
  app.classList.add('active');
  // Show/hide global nav
  var nav = document.getElementById('global-nav');
  var nameEl = document.getElementById('global-nav-app-name');
  var appNames = {staff:'Staff Dashboard',intake:'Self Registration',portal:'Patient Portal',register:'Self-Registration',followup:'Post-Visit Follow-Up',kiosk:'Kiosk Registration'};
  nav.classList.add('visible');
  var backBtn = nav.querySelector('.global-nav-back');
  var dividers = nav.querySelectorAll('.global-nav-divider');
  var labelEl = nav.querySelector('.global-nav-label');
  if(id === 'landing'){
    if(backBtn) backBtn.style.display = 'none';
    if(dividers[0]) dividers[0].style.display = 'none';
    if(labelEl) labelEl.style.display = 'none';
    if(dividers[1]) dividers[1].style.display = 'none';
    if(nameEl) nameEl.style.display = 'none';
  } else {
    if(backBtn) backBtn.style.display = '';
    if(dividers[0]) dividers[0].style.display = '';
    if(labelEl) labelEl.style.display = '';
    if(dividers[1]) dividers[1].style.display = '';
    if(nameEl){ nameEl.style.display = ''; nameEl.textContent = appNames[id] || id; }
  }
}

function launchApp(id, callback) {
  switchApp(id);
  if (typeof callback === 'function') setTimeout(callback, 80);
}

// ══ CROSS-APP NAVIGATION ══
// Launch intake app starting at screen N
function launchIntakeScreen(screenNum) {
  cur = screenNum || 0;
  const screens = document.querySelectorAll('#app-intake .screen');
  screens.forEach(s => s.classList.remove('active'));
  // Use ID-based selection so pre-flow screens don't shift indices
  const target = document.getElementById('s' + cur);
  if (target) target.classList.add('active');
  document.getElementById('prog-wrap').style.display = '';
  buildProgress();
  switchApp('intake');
  window.scrollTo(0, 0);
}

function lookupPatient() {
  const first = document.getElementById('lookup-first').value.trim().toLowerCase();
  const last  = document.getElementById('lookup-last').value.trim().toLowerCase();
  const dob   = document.getElementById('lookup-dob').value;
  const fb    = document.getElementById('lookup-feedback');

  if (!first || !last || !dob) {
    fb.style.display = 'block';
    fb.style.background = 'var(--red-bg)';
    fb.style.color = 'var(--red)';
    fb.textContent = 'Please enter your first name, last name, and date of birth.';
    document.getElementById('lookup-not-found').style.display = 'none';
    return;
  }

  const found = patients.find(p => {
    const parts = p.dob.split('/');
    const patDob = parts[2] + '-' + parts[0].padStart(2,'0') + '-' + parts[1].padStart(2,'0');
    const nameParts = p.name.toLowerCase().split(' ');
    return patDob === dob && nameParts[0] === first && nameParts[nameParts.length - 1] === last;
  });

  if (!found) {
    fb.style.display = 'block';
    fb.style.background = 'var(--red-bg)';
    fb.style.color = 'var(--red)';
    fb.textContent = "We couldn't find a matching record. Here's what you can do:";
    document.getElementById('lookup-not-found').style.display = 'flex';
    return;
  }

  fb.style.display = 'none';

  // Populate s0 appointment screen from found patient
  document.getElementById('s0-av').textContent       = found.init;
  document.getElementById('s0-name').textContent     = found.name;
  document.getElementById('s0-type-prov').textContent = found.type + ' · ' + found.provider;
  document.getElementById('s0-time').textContent     = 'Today at ' + found.time;
  document.getElementById('s0-provider').textContent = found.provider;
  document.getElementById('s0-type').textContent     = found.type;

  const lookupEl = document.getElementById('s-lookup');
  lookupEl.style.animation = 'so .2s ease forwards';
  setTimeout(() => {
    lookupEl.classList.remove('active');
    document.getElementById('prog-wrap').style.display = '';
    buildProgress();
    const s0 = document.getElementById('s0');
    s0.style.animation = '';
    s0.classList.add('active');
    s0.offsetHeight;
    s0.style.animation = 'si .3s ease';
    window.scrollTo(0, 0);
  }, 180);
}

function startIntakeDirectly() {
  const screens = document.querySelectorAll('#app-intake .screen');
  screens.forEach(s => s.classList.remove('active'));
  cur = 0;
  document.getElementById('prog-wrap').style.display = '';
  buildProgress();
  const s0 = document.getElementById('s0');
  s0.classList.add('active');
  switchApp('intake');
  window.scrollTo(0, 0);
}

function regLookupPatient() {
  const first = document.getElementById('reg-lookup-first').value.trim().toLowerCase();
  const last  = document.getElementById('reg-lookup-last').value.trim().toLowerCase();
  const dob   = document.getElementById('reg-lookup-dob').value;
  const fb    = document.getElementById('reg-lookup-feedback');

  if (!first || !last || !dob) {
    fb.style.display = 'block';
    fb.style.background = 'var(--red-bg)';
    fb.style.color = 'var(--red)';
    fb.textContent = 'Please enter your first name, last name, and date of birth.';
    return;
  }

  const found = patients.find(p => {
    const parts = p.dob.split('/');
    const patDob = parts[2] + '-' + parts[0].padStart(2,'0') + '-' + parts[1].padStart(2,'0');
    const nameParts = p.name.toLowerCase().split(' ');
    return patDob === dob && nameParts[0] === first && nameParts[nameParts.length - 1] === last;
  });

  fb.style.display = 'none';
  const lookupEl = document.getElementById('rs-lookup');

  function transitionTo(targetId) {
    lookupEl.style.animation = 'so .2s ease forwards';
    setTimeout(() => {
      lookupEl.classList.remove('active');
      const target = document.getElementById(targetId);
      if (target) {
        target.style.animation = '';
        target.classList.add('active');
        target.offsetHeight;
        target.style.animation = 'si .3s ease';
      }
      window.scrollTo(0, 0);
    }, 180);
  }

  if (found) {
    document.getElementById('rs-found-title').textContent = 'Welcome back, ' + found.name + '!';
    document.getElementById('rs-found-type').textContent = found.type;
    document.getElementById('rs-found-provider').textContent = found.provider;
    document.getElementById('rs-found-time').textContent = found.time;
    transitionTo('rs-found');
  } else {
    const first = document.getElementById('reg-lookup-first').value.trim();
    const last  = document.getElementById('reg-lookup-last').value.trim();
    const dob   = document.getElementById('reg-lookup-dob').value;
    const firstEl = document.getElementById('reg-first');
    const lastEl  = document.getElementById('reg-last');
    const dobEl   = document.getElementById('reg-dob');
    if (firstEl) firstEl.value = first;
    if (lastEl)  lastEl.value  = last;
    if (dobEl)   dobEl.value   = dob;
    transitionTo('rs0');
  }
}

// Launch portal app starting at view (home, appointments, health, documents, billing, messages, profile)
function launchPortalView(viewName) {
  switchApp('portal');
  setTimeout(() => {
    const navItems = document.querySelectorAll('.pni');
    const viewMap = {home:0, appointments:1, health:2, documents:3, billing:5, messages:6, profile:7};
    const idx = viewMap[viewName] !== undefined ? viewMap[viewName] : 0;
    if (navItems[idx]) {
      showPV(viewName || 'home', navItems[idx]);
    }
    window.scrollTo(0, 0);
  }, 80);
}

function showPV(id, btn) {
  document.querySelectorAll('.p-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.pni').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('pv-' + id);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  const titles = {home:'My Health Overview',appointments:'Appointments',health:'Health Summary',documents:'Documents & Records',prescriptions:'Prescriptions',billing:'Billing & Payments',messages:'Messages',profile:'Profile & Settings'};
  document.getElementById('p-title').textContent = titles[id] || id;
}

// ───── DATA ─────
const patients = [
  {id:0,name:"Shweta Singh",init:"SS",color:"pc4",dob:"11/11/2000",mrn:"UD-00850",time:"11:30 AM",type:"Acne Consult",provider:"Dr. Reyes",provColor:"pv1",status:"partial",ebStatus:"g",ebLabel:"Active",deductAmt:"$500",deductPct:60,copay:"$40",flags:["New"],phone:"(561) 555-0199",email:"ssingh@email.com",addr:"123 Brickell Ave, Miami FL",priorAuth:{status:"none"}},
];

let currentPatient = 0;
let checkedInIds = new Set();

// ───── RENDER TABLE ─────
function renderTable(filter='all', search='') {
  const tbody = document.getElementById('queue-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  patients.forEach((p, i) => {
    if(filter==='pending' && !['pending','partial'].includes(p.status)) return;
    if(filter==='complete' && p.status!=='complete') return;
    if(filter==='checkedin' && p.status!=='checkedin') return;
    if(search && !p.name.toLowerCase().includes(search.toLowerCase())) return;

    const isCheckedIn = checkedInIds.has(p.id);
    const statusMap = {
      complete: '<span class="spill s-done"><span class="sdot"></span>Pre-Registered</span>',
      partial:  '<span class="spill s-part"><span class="sdot"></span>Partial</span>',
      pending:  '<span class="spill s-pend"><span class="sdot"></span>Not Started</span>',
      checkedin:'<span class="spill s-in"><span class="sdot"></span>Checked In</span>',
    };
    const ebMap = {g:'g', r:'r', a:'a'};
    const deductColor = p.deductPct >= 80 ? 'var(--green)' : p.deductPct >= 40 ? 'var(--amber)' : 'var(--red)';
    const flagHtml = p.flags.map(f => {
      const cls = {OK:'ok',Ins:'i',Pay:'p',New:'n',Consent:'c'}[f] || 'ok';
      const labels = {OK:'✓ Clear',Ins:'Ins. Flag',Pay:'Balance Due',New:'New Pt',Consent:'Consent'}[f] || f;
      return `<span class="fl ${cls}">${labels}</span>`;
    }).join('');

    const actionHtml = isCheckedIn
      ? `<button class="ab done">✓ Checked In</button>`
      : `<button class="ab ci" onclick="event.stopPropagation();quickCheckin(${p.id})">Register</button>
         <button class="ab sm" onclick="event.stopPropagation();openMsgForPatient(${p.id})"><svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/></svg></button>`;

    const paStatus = p.priorAuth?.status || 'none';
    const paMap = {
      approved: '<span class="spill s-done"><span class="sdot"></span>Approved</span>',
      pending:  '<span class="spill s-pend"><span class="sdot"></span>Pending</span>',
      denied:   '<span class="spill s-fail"><span class="sdot"></span>Denied</span>',
      none:     '<span style="font-size:12px;color:var(--t3)">—</span>'
    };
    const hasPriorAuth = paStatus !== 'none';

    const tr = document.createElement('tr');
    tr.className = 'rw' + (isCheckedIn ? ' row-checked' : '');
    tr.onclick = () => openPanel(p.id);
    tr.innerHTML = `
      <td><div class="tdi"><div class="pcell">
        <div class="pav ${p.color}">${p.init}</div>
        <div><div class="pname">${p.name}${p.flags.includes('New')?'<span class="pnew">NEW</span>':''}</div><div class="pdob">DOB: ${p.dob} · ${p.mrn}</div></div>
      </div></div></td>
      <td><div class="tdi" style="flex-direction:column;align-items:flex-start;gap:1px"><span style="font-size:13.5px;font-weight:600;color:var(--t1)">${p.time}</span><span style="font-size:11.5px;color:var(--t3)">${p.type}</span></div></td>
      <td><div class="tdi"><span style="font-size:13px;color:var(--t1)">${p.provider}</span></div></td>
      <td><div class="tdi">${statusMap[p.status]}</div></td>
      <td><div class="tdi"><div class="ebcell">
        <div class="ebrow"><span class="eblbl">Status</span><span class="ebb ${ebMap[p.ebStatus]}">${p.ebLabel}</span></div>
        <div class="ebrow"><span class="eblbl">Co-pay</span><span style="font-size:12px;font-weight:600;color:var(--t1)">${p.copay}</span></div>
      </div></div></td>
      <td><div class="tdi"><div class="dcell">
        <span class="damt" style="color:${deductColor}">${p.deductAmt}</span>
        ${p.deductPct > 0 ? `<div class="dbar"><div class="dfill" style="width:${p.deductPct}%;background:${deductColor}"></div></div>` : ''}
        <span class="dcp">${p.deductPct}% met</span>
      </div></div></td>
      <td><div class="tdi">${paMap[paStatus]}</div></td>
      <td><div class="tdi"><div class="flags">${flagHtml}</div></div></td>
      <td><div class="tdi"><div class="acell">${actionHtml}</div></div></td>
    `;
    tbody.appendChild(tr);
  });
}

// ───── BAR CHART ─────
function buildChart() {
  const data = [
    {day:'Mon',sched:32,done:24},
    {day:'Tue',sched:35,done:28},
    {day:'Wed',sched:29,done:22},
    {day:'Thu',sched:38,done:31},
    {day:'Fri',sched:38,done:29},
    {day:'Sat',sched:20,done:16},
    {day:'Sun',sched:0,done:0},
  ];
  const max = 40;
  const wrap = document.getElementById('bar-chart');
  if (!wrap) return;
  wrap.innerHTML = '';
  data.forEach(d => {
    const grp = document.createElement('div');
    grp.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;padding-bottom:20px';
    const hSched = (d.sched/max)*130;
    const hDone = (d.done/max)*130;
    grp.innerHTML = `
      <div style="position:relative;width:100%;height:140px;display:flex;align-items:flex-end;justify-content:center;gap:2px">
        <div class="ch-bar" style="height:${hSched}px;background:var(--borderlt);border:1px solid var(--border);flex:1" data-v="${d.day}"></div>
        <div class="ch-bar" style="height:${hDone}px;background:var(--brand);flex:1;position:relative" data-v="">
          ${d.done>0?`<span class="ch-lbl" style="color:var(--brand)">${d.done}</span>`:''}
        </div>
      </div>
      <span style="font-size:10px;color:var(--t3);position:absolute;bottom:2px;left:50%;transform:translateX(-50%)">${d.day}</span>
    `;
    wrap.appendChild(grp);
  });
}

// ───── INTERACTIONS ─────
function showView(id, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-'+id).classList.add('active');
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  btn.classList.add('active');
  const titles = {dashboard:"Today's Registration",patients:"Patient Registry",schedule:"Schedule",messages:"Messages",analytics:"Analytics & Reports",reports:"Custom Reports",forms:"Form Builder",settings:"Settings",accelerator:"Appointment Accelerator",outreach:"Pre-Visit Outreach"};
  document.getElementById('view-title').textContent = titles[id] || id;
  onShowView(id);
}

function setQTab(btn, filter) {
  document.querySelectorAll('.qt').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderTable(filter, document.getElementById('search-inp').value);
}

function filterTable(val) {
  const activeFilter = document.querySelector('.qt.active');
  const filter = activeFilter ? (activeFilter.textContent.trim()==='All'?'all':activeFilter.textContent.includes('Attention')?'pending':activeFilter.textContent.includes('Ready')?'complete':'checkedin') : 'all';
  renderTable(filter, val);
}

function openPanel(id) {
  const p = patients[id];
  currentPatient = id;
  document.getElementById('sp-av').className = 'spav '+p.color;
  document.getElementById('sp-av').textContent = p.init;
  document.getElementById('sp-name').textContent = p.name;
  document.getElementById('sp-meta').textContent = `DOB: ${p.dob} · MRN: ${p.mrn} · ${p.type}`;
  document.getElementById('sp-dob').textContent = p.dob;
  document.getElementById('sp-phone').textContent = p.phone;
  document.getElementById('sp-email').textContent = p.email;
  document.getElementById('sp-addr').textContent = p.addr;
  document.getElementById('sp-time').textContent = p.time;
  document.getElementById('sp-type').textContent = p.type;
  document.getElementById('sp-prov').textContent = p.provider;

  // Populate Prior Auth sections
  const paContent = document.getElementById('sp-pa-content');
  const paInsurance = document.getElementById('sp-pa-insurance');
  const pa = p.priorAuth;
  const renderPAContent = () => {
    if (pa?.status && pa.status !== 'none') {
      const statusClass = pa.status === 'approved' ? 's-done' : pa.status === 'pending' ? 's-pend' : 's-fail';
      const statusLabel = pa.status.charAt(0).toUpperCase() + pa.status.slice(1);
      return `
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:13px;color:var(--t1);font-weight:600">${pa.procedure}</span>
            <span class="spill ${statusClass}"><span class="sdot"></span>${statusLabel}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="background:var(--surface);padding:10px;border-radius:8px">
              <div style="font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Payer</div>
              <div style="font-size:13px;font-weight:600;color:var(--t1)">${pa.payer}</div>
            </div>
            <div style="background:var(--surface);padding:10px;border-radius:8px">
              <div style="font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Submitted</div>
              <div style="font-size:13px;font-weight:600;color:var(--t1)">${pa.submittedDate}</div>
            </div>
          </div>
          ${pa.reason ? `<div style="background:var(--red-bg);padding:10px;border-radius:8px;font-size:12px;color:var(--red)"><strong>Note:</strong> ${pa.reason}</div>` : ''}
        </div>
      `;
    } else {
      return '<div style="padding:12px;background:var(--surface);border-radius:8px;font-size:13px;color:var(--t3);text-align:center">—</div>';
    }
  };
  paContent.innerHTML = renderPAContent();
  paInsurance.innerHTML = renderPAContent();

  setSPTab(document.querySelector('.spt.active') || document.querySelectorAll('.spt')[0], 'overview');
  document.querySelector('.spt').classList.add('active');
  document.getElementById('overlay').classList.add('open');
  document.getElementById('side-panel').classList.add('open');
}

function closePanel() {
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('side-panel').classList.remove('open');
}

function setSPTab(btn, tab) {
  document.querySelectorAll('.spt').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.spv').forEach(v=>v.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const el = document.getElementById('spv-'+tab);
  if(el) el.classList.add('active');
}

function doCheckIn() {
  const btn = document.getElementById('checkin-btn');
  checkedInIds.add(currentPatient);
  btn.textContent = '✓ Checked In';
  btn.style.background = 'var(--green)';
  showToast('Patient checked in successfully - PM system updated');
  setTimeout(() => {
    closePanel();
    renderTable('all', '');
  }, 1200);
}

function quickCheckin(id) {
  checkedInIds.add(id);
  patients[id].status = 'checkedin';
  renderTable('all', document.getElementById('search-inp').value);
  showToast(`${patients[id].name} checked in ✓`);
}

function openMsgForPatient(id) {
  showView('messages', document.querySelectorAll('.ni')[3]);
  showToast(`Opening message thread for ${patients[id].name}`);
}

function openThread(el, name, init, color, appt) {
  document.querySelectorAll('#view-messages .mc').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('t-av').className = 'mc-av '+color;
  document.getElementById('t-av').textContent = init;
  document.getElementById('t-name').textContent = name;
  document.getElementById('t-appt').textContent = appt+' · Dr. Reyes';
}

function sendMsg() {
  const inp = document.getElementById('msg-input');
  if(!inp.value.trim()) return;
  const msgs = document.getElementById('t-msgs');
  const div = document.createElement('div');
  div.className = 'mb out';
  div.textContent = inp.value;
  msgs.appendChild(div);
  const t = document.createElement('div');
  t.className = 'mb-t out';
  t.textContent = 'Sarah R. · Just now';
  msgs.appendChild(t);
  inp.value = '';
  msgs.scrollTop = msgs.scrollHeight;
}

function sendNudge() { showToast('SMS nudge sent to Marcus Thompson for 10:15 AM appointment'); }

function toggleSwitcher(e) {
  e.stopPropagation();
  document.getElementById('asw-menu').classList.toggle('open');
}
function switchAppMenu(id) {
  document.getElementById('asw-menu').classList.remove('open');
  switchApp(id);
}
document.addEventListener('click', function() {
  var m = document.getElementById('asw-menu');
  if (m) m.classList.remove('open');
});

function openPortalThread(el, name, init, color, subj) {
  document.querySelectorAll('#pv-messages .mc').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  const av = document.getElementById('pt-av');
  av.style.background = color;
  av.textContent = init;
  document.getElementById('pt-name').textContent = name;
  document.getElementById('pt-subj').textContent = subj;
}

function sendPortalMsg() {
  const inp = document.getElementById('portal-msg-input');
  if(!inp.value.trim()) return;
  const msgs = document.getElementById('pt-msgs');
  const div = document.createElement('div');
  div.className = 'mb out';
  div.textContent = inp.value;
  msgs.appendChild(div);
  const t = document.createElement('div');
  t.className = 'mb-t out';
  t.textContent = 'Marcus T. · Just now';
  msgs.appendChild(t);
  inp.value = '';
  msgs.scrollTop = msgs.scrollHeight;
}

/* showToast aliased to showToastG */

// INIT
switchApp('landing'); // show nav switcher on landing
renderTable('all','');
buildChart();

const STEPS = ['Verify','Demographics','Insurance','Health History','Consents','Payment','Complete'];
let cur = 0;

function buildProgress() {
  const wrap = document.getElementById('prog-steps');
  if (!wrap) return;
  wrap.innerHTML = '';
  STEPS.forEach((s,i) => {
    const d = document.createElement('div');
    d.className = 'ps' + (i < cur ? ' done' : i === cur ? ' active' : '');
    wrap.appendChild(d);
  });
  document.getElementById('prog-count').textContent = `Step ${Math.min(cur+1, STEPS.length)} of ${STEPS.length}`;
  if(cur >= STEPS.length) {
    document.getElementById('prog-wrap').style.display = 'none';
  }
}

function next() {
  const old = document.getElementById('s'+cur);
  old.style.animation = 'so .2s ease forwards';
  setTimeout(() => {
    old.classList.remove('active');
    cur++;
    buildProgress();
    const nxt = document.getElementById('s'+cur);
    if(nxt) {
      nxt.style.animation = '';
      nxt.classList.add('active');
      nxt.offsetHeight;
      nxt.style.animation = 'si .3s ease';
      // Initialize payment screen
      if(cur === 6) {
        initPaymentScreen();
      }
    }
    window.scrollTo(0,0);
  }, 180);
}

function selectOption(radio, groupId) {
  const group = document.getElementById(groupId);
  const buttons = group.querySelectorAll('.opt-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  radio.closest('.opt-btn').classList.add('selected');
}

function checkDOB() {
  const v = document.getElementById('dob-input').value;
  const fb = document.getElementById('dob-feedback');
  if(v === '1989-04-12') {
    fb.style.display = 'block';
    fb.style.background = 'var(--green-bg)';
    fb.style.color = 'var(--green)';
    fb.textContent = '✓ Date of birth verified';
  } else if(v) {
    fb.style.display = 'block';
    fb.style.background = 'var(--red-bg)';
    fb.style.color = 'var(--red)';
    fb.textContent = '✗ Date of birth does not match our records';
  } else {
    fb.style.display = 'none';
  }
}

function sendOTP() {
  document.getElementById('send-otp-btn').textContent = '✓ Code Sent to (561) 400-••••';
  document.getElementById('send-otp-btn').style.background = 'var(--green)';
  document.getElementById('otp-card').style.display = 'block';
  showToast('Verification code sent!');
  setTimeout(() => {
    ['o1','o2','o3','o4'].forEach((id,i) => {
      const vals = ['2','8','4','1'];
      setTimeout(() => {
        const el = document.getElementById(id);
        el.value = vals[i];
        el.classList.add('filled');
      }, i*120);
    });
    setTimeout(otpDone, 600);
  }, 600);
}

function otpNext(el, nextId) {
  if(el.value) {
    el.classList.add('filled');
    const nxt = document.getElementById(nextId);
    if(nxt) nxt.focus();
  }
}

function otpDone() {
  showToast('Identity verified ✓');
}

function selOpt(el, cardId) {
  const card = document.getElementById(cardId);
  card.querySelectorAll('.qopt').forEach(o => o.classList.remove('sel','sel-no'));
  el.classList.add('sel');
  card.classList.add('answered');
}

function toggleTag(el) {
  el.classList.toggle('sel');
}

function simulateUpload(id, side) {
  const el = document.getElementById(id);
  el.classList.add('done');
  el.innerHTML = `<div style="font-size:24px;margin-bottom:4px">✓</div><div style="font-size:13px;font-weight:600;color:var(--green)">${side} Uploaded</div>`;
  showToast(`Insurance card ${side.toLowerCase()} uploaded`);
}

let hipSigned = false, finSigned = false, authChecked = false;
function sign(sigId, statusId) {
  const el = document.getElementById(sigId);
  const ph = document.getElementById(sigId+'-ph');
  el.classList.add('signed');
  el.innerHTML = '<div class="sig-text">Marcus Thompson</div>';
  document.getElementById(statusId).textContent = '✓ Signed - ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  document.getElementById(statusId).style.color = 'var(--green)';
  if(sigId==='sig-hipaa') hipSigned = true;
  if(sigId==='sig-fin') finSigned = true;
  checkConsentBtn();
  showToast('Signature captured & timestamped');
}
function checkAuth() {
  authChecked = document.getElementById('auth-check').checked;
  checkConsentBtn();
}
function checkConsentBtn() {
  const btn = document.getElementById('consent-btn');
  btn.disabled = !(hipSigned && finSigned && authChecked);
}

let paySkipped = false;
let selectedPlanMonths = 0;
let selectedPlanMonthly = 0;
let hasExistingPlan = true; // Set to true to show existing plan card

function initPaymentScreen() {
  const existingCard = document.getElementById('existing-plan-card');
  if (hasExistingPlan) {
    existingCard.style.display = 'block';
  } else {
    existingCard.style.display = 'none';
  }
}

function selectPay(el) {
  document.querySelectorAll('.pm').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
}

function selectExistingPlan(el) {
  document.querySelectorAll('.pm').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
  showToast('Existing plan selected');
}

function goToPayPlanSetup() {
  const screens = document.querySelectorAll('#app-intake .screen');
  screens[cur].classList.remove('active');
  cur = 6.5; // Use decimal for sub-screens
  screens[6].style.display = 'none';
  const s6a = document.getElementById('s6a');
  s6a.style.display = 'flex';
  s6a.classList.add('active');
  window.scrollTo(0, 0);
}

function selectPayPlanDuration(el, months, monthly) {
  document.querySelectorAll('.plan-opt').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
  el.querySelector('.plan-opt-radio').style.opacity = '1';
  selectedPlanMonths = months;
  selectedPlanMonthly = monthly;
  document.getElementById('plan-next-btn').disabled = false;
}

function goToPayPlanReview() {
  if (!selectedPlanMonths) {
    showToast('Please select a plan duration');
    return;
  }
  // Update review screen
  document.getElementById('plan-duration-display').textContent = selectedPlanMonths + ' months';
  document.getElementById('plan-monthly-display').textContent = '$' + selectedPlanMonthly.toFixed(2);
  document.getElementById('plan-count-display').textContent = selectedPlanMonths;
  document.getElementById('plan-payment-display').textContent = '$' + selectedPlanMonthly.toFixed(2);

  const s6a = document.getElementById('s6a');
  const s6b = document.getElementById('s6b');
  s6a.classList.remove('active');
  s6a.style.display = 'none';
  s6b.classList.add('active');
  s6b.style.display = 'flex';
  window.scrollTo(0, 0);
}

function goToPaymentMethod() {
  const s6b = document.getElementById('s6b');
  const s6 = document.getElementById('s6');
  s6b.classList.remove('active');
  s6b.style.display = 'none';
  s6.classList.add('active');
  s6.style.display = 'flex';
  window.scrollTo(0, 0);
  showToast('Payment plan selected: $' + selectedPlanMonthly.toFixed(2) + '/month for ' + selectedPlanMonths + ' months');
}

function goBackPayment() {
  const s6a = document.getElementById('s6a');
  const s6b = document.getElementById('s6b');
  const s6 = document.getElementById('s6');

  if (s6a.classList.contains('active')) {
    s6a.classList.remove('active');
    s6a.style.display = 'none';
    s6.classList.add('active');
    s6.style.display = 'flex';
  } else if (s6b.classList.contains('active')) {
    s6b.classList.remove('active');
    s6b.style.display = 'none';
    s6a.classList.add('active');
    s6a.style.display = 'flex';
  }
  window.scrollTo(0, 0);
}

function processPayment() {
  const selected = document.querySelector('.pm.sel');
  if (!selected) {
    showToast('Please select a payment method');
    return;
  }

  const btn = document.getElementById('pay-btn');
  btn.textContent = 'Processing…';
  btn.disabled = true;

  const paymentAmount = selectedPlanMonths > 0 ? selectedPlanMonthly : 380;
  const paymentDesc = selectedPlanMonths > 0 ? 'First payment of $' + selectedPlanMonthly.toFixed(2) : 'Payment of $380.00';

  setTimeout(() => {
    showToast(paymentDesc + ' successful ✓');
    setTimeout(() => {
      cur = 6; // Reset to regular screen number
      next();
    }, 800);
  }, 1200);
}

function skipPayment() {
  paySkipped = true;
  document.getElementById('pay-confirm-title').textContent = 'Pay at Front Desk';
  document.getElementById('pay-confirm-sub').textContent = 'Balance of $380.00 to be collected on arrival';
  cur = 6;
  next();
}

/* showToast aliased to showToastG */

buildProgress();

// ══ INIT ══
renderTable('all', '');
buildChart();
buildProgress();


// ══════════════════════════════════════
// WALK-IN MODAL
// ══════════════════════════════════════
function openWalkinModal() {
  document.getElementById('walkin-modal').style.display = 'flex';
}
function closeWalkinModal() {
  document.getElementById('walkin-modal').style.display = 'none';
}
function submitWalkin() {
  const name = document.getElementById('wi-name').value.trim();
  if(!name){ showToast('Please enter patient name'); return; }
  showToast('Walk-in registered: ' + name + ' · Queued for Dr. Reyes');
  closeWalkinModal();
  // Add to table
  const p = {id:99,name:name,init:name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2),
    color:'pc6',dob:'-',mrn:'UD-WALK',time:'Walk-in',type:document.getElementById('wi-type').value,
    provider:'Dr. Reyes',provColor:'pv1',status:'partial',ebStatus:'a',ebLabel:'Verify',
    deductAmt:'-',deductPct:0,copay:'-',flags:['New'],phone:'-',email:'-',addr:'-'};
  patients.push(p);
  renderTable('all','');
}

// ══════════════════════════════════════
// BROADCAST SMS MODAL
// ══════════════════════════════════════
function openBroadcastModal() {
  document.getElementById('broadcast-modal').style.display = 'flex';
}
function closeBroadcastModal() {
  document.getElementById('broadcast-modal').style.display = 'none';
}
function sendBroadcast() {
  const msg = document.getElementById('bc-msg').value.trim();
  if(!msg){ showToast('Please enter a message'); return; }
  const count = document.getElementById('bc-filter').value === 'all' ? 38 :
    document.getElementById('bc-filter').value === 'pending' ? 9 : 14;
  showToast('SMS broadcast sent to ' + count + ' patients ✓');
  closeBroadcastModal();
}

// ══════════════════════════════════════
// APPOINTMENT ACCELERATOR
// ══════════════════════════════════════
const openSlots = [
  {time:'10:00 AM',provider:'Dr. Reyes',type:'Acne Follow-up (30 min)',reason:'No-show - Kevin M.',room:'Room 2A',match:{name:'Elena Vasquez',init:'EV',score:98},filled:false},
  {time:'11:30 AM',provider:'Dr. Nguyen',type:'Skin Check (20 min)',reason:'Cancellation - Patricia L.',room:'Room 1B',match:{name:'Omar Patel',init:'OP',score:89},filled:false},
  {time:'1:45 PM',provider:'Dr. Patel',type:'New Patient (45 min)',reason:'Rescheduled - Thomas W.',room:'Room 3C',match:{name:'Claire Bennett',init:'CB',score:95},filled:false},
  {time:'3:00 PM',provider:'Dr. Reyes',type:'Cosmetic Consult (30 min)',reason:'No-show - Brian K.',room:'Room 2A',match:{name:'Tanya Moore',init:'TM',score:91},filled:false},
];
const waitlistData = [
  {name:'Elena Vasquez',init:'EV',color:'pc2',requested:'Any this week',provider:'Dr. Reyes',flex:'High',score:98},
  {name:'Omar Patel',init:'OP',color:'pc7',requested:'Afternoons',provider:'Dr. Nguyen',flex:'Medium',score:89},
  {name:'Claire Bennett',init:'CB',color:'pc5',requested:'ASAP',provider:'Any',flex:'High',score:95},
  {name:'Raj Krishnan',init:'RK',color:'pc3',requested:'Morning only',provider:'Dr. Patel',flex:'Low',score:72},
  {name:'Tanya Moore',init:'TM',color:'pc4',requested:'This week',provider:'Dr. Reyes',flex:'High',score:91},
  {name:'Samuel Park',init:'SP',color:'pc8',requested:'Any',provider:'Dr. Nguyen',flex:'High',score:87},
  {name:'Marcus Johnson',init:'MJ',color:'pc1',requested:'Next 2 weeks',provider:'Dr. Reyes',flex:'Medium',score:85},
  {name:'Jennifer Lee',init:'JL',color:'pc6',requested:'Any',provider:'Any',flex:'High',score:93},
  {name:'David Chen',init:'DC',color:'pc9',requested:'Weekends only',provider:'Dr. Patel',flex:'Low',score:68},
  {name:'Sarah Martinez',init:'SM',color:'pc10',requested:'This week',provider:'Dr. Nguyen',flex:'High',score:90},
  {name:'Robert Williams',init:'RW',color:'pc11',requested:'Any this week',provider:'Any',flex:'Medium',score:82},
];

function renderAccelerator() {
  // Open slots
  const slotList = document.getElementById('open-slots-list');
  if(!slotList) return;
  slotList.innerHTML = openSlots.map((s,i) => `
    <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--borderlt);${s.filled?'opacity:.5':''}" id="slot-${i}">
      <div style="width:54px;height:54px;background:${s.filled?'var(--green-bg)':'var(--red-bg)'};border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;border:1px solid ${s.filled?'rgba(16,185,129,.2)':'rgba(239,68,68,.15)'}">
        <div style="font-size:11px;font-weight:700;color:${s.filled?'var(--green)':'var(--red)'}">${s.time.split(' ')[1]}</div>
        <div style="font-size:13px;font-weight:700;color:${s.filled?'var(--green)':'var(--red)'}">${s.time.split(' ')[0]}</div>
      </div>
      <div style="flex:1">
        <div style="font-size:13.5px;font-weight:700;color:var(--t1)">${s.type}</div>
        <div style="font-size:12px;color:var(--t2);margin-top:2px">${s.provider} · ${s.room}</div>
        <div style="font-size:11.5px;color:var(--t3);margin-top:1px">Opened by: ${s.reason}</div>
      </div>
      ${s.match ? `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--brand-lt);border-radius:9px;border:1px solid var(--brand-border)">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">${s.match.init}</div>
          <div><div style="font-size:12.5px;font-weight:600;color:var(--t1)">${s.match.name}</div><div style="font-size:11px;color:var(--brand)">✦ AI Match ${s.match.score}%</div></div>
        </div>` : ''}
      ${s.filled ? `<span style="font-size:12px;font-weight:700;background:var(--green-bg);color:var(--green);padding:6px 14px;border-radius:8px;white-space:nowrap">✓ Filled</span>` : `
        <div style="display:flex;gap:7px">
          ${s.match ? `<button onclick="fillSlot(${i})" style="padding:7px 14px;background:var(--brand);color:#fff;border:none;border-radius:7px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:'Inter','Roboto',sans-serif">Confirm & SMS</button>` : ''}
          <button onclick="showToast('Manual patient search opened')" style="padding:7px 12px;background:var(--white);color:var(--t2);border:1px solid var(--border);border-radius:7px;font-size:12.5px;font-weight:500;cursor:pointer;font-family:'Roboto',sans-serif">Find Patient</button>
        </div>`}
    </div>`).join('');

  // Waitlist
  const tbody = document.getElementById('waitlist-body');
  if(!tbody) return;
  let rows = '';
  for(let i=0; i<waitlistData.length; i++) {
    const w = waitlistData[i];
    const bgColor = w.flex==='High'?'var(--green-bg)':w.flex==='Medium'?'var(--amber-bg)':'var(--red-bg)';
    const textColor = w.flex==='High'?'var(--green)':w.flex==='Medium'?'var(--amber)':'var(--red)';
    rows += `<tr style="border-bottom:1px solid var(--borderlt)">
      <td style="padding:8px 12px"><div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;background:var(--navy);flex-shrink:0">${w.init}</div><span style="font-size:12.5px;font-weight:600;color:var(--t1)">${w.name}</span></div></td>
      <td style="padding:8px 12px;font-size:12px;color:var(--t2)">${w.requested}</td>
      <td style="padding:8px 12px;font-size:12px;color:var(--t2)">${w.provider}</td>
      <td style="padding:8px 12px"><span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:8px;background:${bgColor};color:${textColor}">${w.flex}</span></td>
      <td style="padding:8px 12px"><div style="display:flex;align-items:center;gap:6px"><div style="width:45px;height:4px;background:var(--border);border-radius:2px;overflow:hidden"><div style="width:${w.score}%;height:100%;background:var(--brand);border-radius:2px"></div></div><span style="font-size:11px;font-weight:700;color:var(--brand)">${w.score}%</span></div></td>
      <td style="padding:8px 12px"><button onclick="showToast('SMS sent to ${w.name}')" style="padding:4px 10px;background:var(--brand);color:#fff;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Inter','Roboto',sans-serif">Notify</button></td>
    </tr>`;
  }
  tbody.innerHTML = rows;
}

function runAccelerator() {
  const btn = document.querySelector('[onclick="runAccelerator()"]');
  btn.textContent = '✦ Running AI Match…';
  btn.disabled = true;
  showToast('AI scanning 11 waitlisted patients against 4 open slots…');
  setTimeout(() => {
    openSlots[0].match = waitlistData[0];
    openSlots[1].match = waitlistData[2];
    openSlots[2].match = waitlistData[3];
    openSlots[3].match = waitlistData[4];
    document.getElementById('acc-matched').textContent = '4';
    document.getElementById('acc-revenue').textContent = '$680';
    renderAccelerator();
    btn.textContent = '✓ Matched 4 Patients';
    btn.style.background = 'var(--green)';
    btn.disabled = false;
    showToast('AI matched 4 patients to open slots - review and confirm below');
  }, 1800);
}

function fillSlot(i) {
  openSlots[i].filled = true;
  showToast(openSlots[i].match.name + ' booked for ' + openSlots[i].time + ' · SMS sent ✓');
  renderAccelerator();
}

function fillAllSlots() {
  openSlots.forEach((s,i) => { if(s.match && !s.filled) s.filled = true; });
  showToast('All matched patients notified and booked ✓');
  renderAccelerator();
}

function showAcceleratorConfig() {
  document.getElementById('acc-config-modal').style.display = 'flex';
}

function closeAcceleratorConfig() {
  document.getElementById('acc-config-modal').style.display = 'none';
}

function updateAccThreshold(val) {
  document.getElementById('acc-threshold-val').textContent = val + '%';
}

function toggleAccSetting(el) {
  const isOn = el.style.background === 'var(--green)';
  el.style.background = isOn ? 'var(--border)' : 'var(--green)';
  el.querySelector('div').style.left = isOn ? '3px' : 'auto';
  el.querySelector('div').style.right = isOn ? 'auto' : '3px';
}

function saveAcceleratorConfig() {
  closeAcceleratorConfig();
  showToast('Accelerator settings saved ✓');
}

// ══════════════════════════════════════
// SCHEDULE / CALENDAR
// ══════════════════════════════════════
const calAppts = [
  {time:'9:00',dur:30,pat:'Marcus Thompson',type:'Acne Follow-up',col:'#6366F1',room:'2A',status:'checkedin'},
  {time:'9:15',dur:20,pat:'Sandra Okafor',type:'Skin Check',col:'#EC4899',room:'1B',status:'complete'},
  {time:'9:30',dur:45,pat:'James Whitfield',type:'Psoriasis Consult',col:'#14B8A6',room:'3C',status:'pending'},
  {time:'9:45',dur:30,pat:'Priya Mehta',type:'Cosmetic Consult',col:'#6366F1',room:'2A',status:'checkedin'},
  {time:'10:00',dur:30,pat:'David Chen',type:'Eczema Review',col:'#EC4899',room:'1B',status:'complete'},
  {time:'10:15',dur:20,pat:'Linda Russo',type:'Annual Skin Exam',col:'#14B8A6',room:'3C',status:'pending'},
  {time:'10:30',dur:30,pat:'Kevin O\u2019Brien',type:'Acne Treatment',col:'#6366F1',room:'2A',status:'complete'},
  {time:'10:45',dur:45,pat:'Aisha Williams',type:'New Patient',col:'#EC4899',room:'1B',status:'partial'},
  {time:'11:00',dur:30,pat:'Robert Harmon',type:'Mohs Consult',col:'#14B8A6',room:'3C',status:'checkedin'},
  {time:'11:15',dur:20,pat:'Jessica Torres',type:'Rosacea Follow-up',col:'#6366F1',room:'2A',status:'pending'},
  {time:'1:00',dur:30,pat:'Grace Kim',type:'New Patient',col:'#6366F1',room:'2B',status:'complete'},
  {time:'1:30',dur:20,pat:'Bernard Walsh',type:'Acne Follow-up',col:'#EC4899',room:'1A',status:'pending'},
  {time:'2:00',dur:45,pat:'Natalie Chen',type:'Skin Biopsy',col:'#14B8A6',room:'3A',status:'complete'},
  {time:'2:30',dur:30,pat:'George Osei',type:'Psoriasis',col:'#6366F1',room:'2B',status:'pending'},
];

function buildCalendar() {
  const timeCol = document.getElementById('time-col');
  const reyesCol = document.getElementById('col-reyes');
  const nguyenCol = document.getElementById('col-nguyen');
  const patelCol = document.getElementById('col-patel');
  const calGrid = document.getElementById('cal-grid');
  if(!timeCol) return;

  const startH = 8, endH = 18;
  const totalMins = (endH - startH) * 60;
  const pxPerMin = 2.2;
  const totalH = totalMins * pxPerMin;

  // Set explicit height on grid container and its row
  if(calGrid) {
    calGrid.style.gridTemplateRows = totalH + 'px';
    calGrid.style.minHeight = totalH + 'px';
  }
  [timeCol, reyesCol, nguyenCol, patelCol].forEach(c => {
    c.style.height = totalH + 'px';
    c.style.minHeight = totalH + 'px';
    c.style.position = 'relative';
  });

  // Time labels
  timeCol.innerHTML = '';
  for(let h = startH; h <= endH; h++) {
    const top = (h - startH) * 60 * pxPerMin;
    const lbl = document.createElement('div');
    lbl.style.cssText = `position:absolute;top:${top}px;left:0;right:0;padding:0 8px;font-size:10.5px;font-weight:600;color:var(--t3);transform:translateY(-6px);border-top:1px solid var(--borderlt);`;
    lbl.textContent = h <= 12 ? h + ':00 AM' : (h-12) + ':00 PM';
    if(h===12) lbl.textContent = '12:00 PM';
    timeCol.appendChild(lbl);
  }

  // Hour lines on provider cols
  [reyesCol, nguyenCol, patelCol].forEach(c => {
    c.innerHTML = '';
    for(let h = startH; h <= endH; h++) {
      const line = document.createElement('div');
      line.style.cssText = `position:absolute;top:${(h-startH)*60*pxPerMin}px;left:0;right:0;border-top:1px solid var(--borderlt);pointer-events:none;`;
      c.appendChild(line);
    }
    // Half-hour lines
    for(let h = startH; h < endH; h++) {
      const line = document.createElement('div');
      line.style.cssText = `position:absolute;top:${((h-startH)*60+30)*pxPerMin}px;left:0;right:0;border-top:1px dashed var(--borderlt);pointer-events:none;`;
      c.appendChild(line);
    }
    // Click to add
    c.addEventListener('click', e => {
      if(e.target !== c) return;
      showToast('New appointment at this time slot');
    });
  });

  // Distribute appointments across providers
  const reyesAppts = calAppts.filter((_,i) => i%3===0);
  const nguyenAppts = calAppts.filter((_,i) => i%3===1);
  const patelAppts = calAppts.filter((_,i) => i%3===2);

  function addAppt(col, appt) {
    const [hh,mm] = appt.time.split(':').map(Number);
    const top = ((hh - startH) * 60 + mm) * pxPerMin;
    const height = Math.max(appt.dur * pxPerMin - 3, 26);
    const el = document.createElement('div');
    const statusColor = appt.status==='checkedin'?'var(--blue)':appt.status==='complete'?'var(--green)':appt.status==='partial'?'var(--amber)':'var(--red)';
    el.style.cssText = `position:absolute;top:${top+1}px;left:4px;right:4px;height:${height}px;background:${appt.col}18;border-left:3px solid ${appt.col};border-radius:0 6px 6px 0;padding:4px 7px;cursor:pointer;overflow:hidden;transition:box-shadow .15s;`;
    el.innerHTML = `
      <div style="font-size:11.5px;font-weight:700;color:${appt.col};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${appt.pat}</div>
      ${height > 34 ? `<div style="font-size:10.5px;color:var(--t2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${appt.type}</div>` : ''}
    `;
    el.onmouseover = () => el.style.boxShadow = 'var(--sh2)';
    el.onmouseout = () => el.style.boxShadow = 'none';
    el.onclick = () => showToast(appt.pat + ' · ' + appt.type + ' · ' + appt.time);
    col.appendChild(el);
  }

  reyesAppts.forEach(a => addAppt(reyesCol, a));
  nguyenAppts.forEach(a => addAppt(nguyenCol, a));
  patelAppts.forEach(a => addAppt(patelCol, a));

  // Current time indicator
  const now = new Date();
  const nowMins = (now.getHours() - startH) * 60 + now.getMinutes();
  if(nowMins >= 0 && nowMins <= totalMins) {
    [reyesCol, nguyenCol, patelCol].forEach(c => {
      const line = document.createElement('div');
      line.style.cssText = `position:absolute;top:${nowMins*pxPerMin}px;left:0;right:0;height:2px;background:var(--red);z-index:5;pointer-events:none;`;
      line.innerHTML = '<div style="width:8px;height:8px;border-radius:50%;background:var(--red);position:absolute;left:-4px;top:-3px"></div>';
      c.appendChild(line);
    });
  }
}

function setCalView(view, btn) {
  document.querySelectorAll('[onclick^="setCalView"]').forEach(b => {
    b.style.background = 'var(--white)'; b.style.color = 'var(--t2)'; b.style.borderColor = 'var(--border)'; b.style.fontWeight = '500';
  });
  btn.style.background = 'var(--brand)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--brand)'; btn.style.fontWeight = '600';
  showToast(view === 'week' ? 'Week view - coming soon' : 'Day view active');
}

// ══════════════════════════════════════
// SETTINGS TABS
// ══════════════════════════════════════
function setSettingsTab(id, btn) {
  document.querySelectorAll('.stabv').forEach(v => v.style.display = 'none');
  document.querySelectorAll('.stab').forEach(b => {
    b.style.background = 'var(--white)'; b.style.color = 'var(--t2)'; b.style.fontWeight = '500';
  });
  document.getElementById('stab-'+id).style.display = 'flex';
  btn.style.background = 'var(--brand-lt)'; btn.style.color = 'var(--brand)'; btn.style.fontWeight = '600';
}

// Re-run render when switching to these views

// Post-navigation hooks (called from showView below)
function onShowView(id) {
  if(id === 'accelerator') { renderAccelerator(); }
  if(id === 'schedule') { setTimeout(buildCalendar, 50); }
  if(id === 'patients') { renderPatientsTable(allPatients); }
}


function updateBCCount() {
  const counts = {all:38,pending:9,noreg:8,provider:14};
  const v = document.getElementById('bc-filter').value;
  document.getElementById('bc-recipients').textContent = (counts[v]||38) + ' patients';
}
function applyBCTemplate(sel) {
  const templates = {
    delay: 'Dermatology of Boca: Your provider is running approximately 15 minutes behind schedule today. We apologize for the inconvenience. Your appointment time is being adjusted.',
    cancel: 'Dermatology of Boca: Unfortunately your provider has had to cancel today. Please call us at (561) 555-0100 to reschedule at your earliest convenience.',
    checkin: "Dermatology of Boca: Don't forget to complete your digital registration before arriving! It only takes 3 minutes: [link]. Thank you!",
  };
  if(templates[sel.value]) {
    document.getElementById('bc-msg').value = templates[sel.value];
  }
}
document.getElementById('bc-msg') && document.getElementById('bc-msg').addEventListener('input', function() {
  document.getElementById('bc-charcount').textContent = this.value.length + ' / 160 characters';
});

// ═══════ PATIENTS TABLE ═══════
const allPatients = [
  {name:"Marcus Thompson",init:"MT",col:"#6366F1",dob:"04/12/1989",age:37,phone:"(561) 400-2291",email:"m.thompson@email.com",provider:"Dr. Reyes",last:"Mar 21, 2026",ins:"BCBS Florida",status:"active",mrn:"UD-00421"},
  {name:"Sandra Okafor",init:"SO",col:"#14B8A6",dob:"07/22/1975",age:50,phone:"(561) 312-0988",email:"sokafor@gmail.com",provider:"Dr. Nguyen",last:"Mar 21, 2026",ins:"Aetna PPO",status:"active",mrn:"UD-00187"},
  {name:"James Whitfield",init:"JW",col:"#3B82F6",dob:"11/05/1982",age:43,phone:"(561) 778-2200",email:"jwhit@email.com",provider:"Dr. Patel",last:"Mar 21, 2026",ins:"Self-Pay",status:"active",mrn:"UD-00309"},
  {name:"Priya Mehta",init:"PM",col:"#8B5CF6",dob:"03/14/1991",age:35,phone:"(561) 900-1234",email:"priya.m@email.com",provider:"Dr. Reyes",last:"Mar 21, 2026",ins:"United Health",status:"active",mrn:"UD-00556"},
  {name:"David Chen",init:"DC",col:"#F97316",dob:"09/30/1968",age:57,phone:"(561) 444-7890",email:"dchen@work.com",provider:"Dr. Nguyen",last:"Mar 21, 2026",ins:"BCBS Florida",status:"active",mrn:"UD-00098"},
  {name:"Linda Russo",init:"LR",col:"#EC4899",dob:"06/18/1958",age:67,phone:"(561) 211-5566",email:"lrusso@aol.com",provider:"Dr. Patel",last:"Feb 14, 2026",ins:"Medicare",status:"active",mrn:"UD-00712"},
  {name:"Kevin OBrien",init:"KO",col:"#10B981",dob:"02/27/1979",age:47,phone:"(561) 600-3344",email:"kobrien@email.com",provider:"Dr. Reyes",last:"Feb 08, 2026",ins:"Cigna",status:"active",mrn:"UD-00433"},
  {name:"Aisha Williams",init:"AW",col:"#F59E0B",dob:"12/04/1995",age:30,phone:"(561) 730-8899",email:"aisha.w@email.com",provider:"Dr. Nguyen",last:"Mar 21, 2026",ins:"Humana",status:"new",mrn:"UD-00821"},
  {name:"Robert Harmon",init:"RH",col:"#6366F1",dob:"08/16/1952",age:73,phone:"(561) 277-1122",email:"rharmon@email.com",provider:"Dr. Patel",last:"Mar 21, 2026",ins:"Medicare",status:"active",mrn:"UD-00044"},
  {name:"Jessica Torres",init:"JT",col:"#8B5CF6",dob:"05/09/1987",age:38,phone:"(561) 988-0021",email:"jtorres@gmail.com",provider:"Dr. Reyes",last:"Jan 12, 2026",ins:"Self-Pay",status:"active",mrn:"UD-00615"},
];

function renderPatientsTable(list) {
  const tbody = document.getElementById('pt-tbody');
  if(!tbody) return;
  tbody.innerHTML = list.map(p => {
    const sc = p.status==='new'?'var(--blue)':p.status==='inactive'?'var(--t3)':'var(--green)';
    const sb = p.status==='new'?'var(--blue-bg)':p.status==='inactive'?'var(--surface)':'var(--green-bg)';
    const sl = p.status==='new'?'New':p.status==='inactive'?'Inactive':'Active';
    return `<tr style="border-bottom:1px solid var(--borderlt);cursor:pointer" onclick="openPanel(0)" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background=''">
      <td style="padding:11px 14px"><div style="display:flex;align-items:center;gap:9px"><div style="width:32px;height:32px;border-radius:50%;background:${p.col};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">${p.init}</div><div><div style="font-size:13px;font-weight:600;color:var(--t1)">${p.name}</div><div style="font-size:11px;color:var(--t3)">${p.mrn}</div></div></div></td>
      <td style="padding:11px 14px;font-size:12.5px;color:var(--t2)">${p.dob}<br><span style="color:var(--t3)">${p.age} yrs</span></td>
      <td style="padding:11px 14px;font-size:12.5px;color:var(--t2)">${p.phone}<br><span style="color:var(--t3)">${p.email}</span></td>
      <td style="padding:11px 14px;font-size:12.5px;color:var(--t2)">${p.provider}</td>
      <td style="padding:11px 14px;font-size:12.5px;color:var(--t2)">${p.last}</td>
      <td style="padding:11px 14px;font-size:12.5px;color:var(--t2)">${p.ins}</td>
      <td style="padding:11px 14px"><span style="font-size:11.5px;font-weight:600;padding:3px 9px;border-radius:10px;background:${sb};color:${sc}">${sl}</span></td>
      <td style="padding:11px 14px"><button onclick="event.stopPropagation();openPanel(0)" style="padding:5px 11px;border:1px solid var(--border);border-radius:6px;background:var(--white);color:var(--t2);font-size:12px;cursor:pointer;font-family:Roboto,sans-serif">View</button></td>
    </tr>`;
  }).join('');
}

function filterPatients(val) {
  const search = (val || document.getElementById('pt-search').value || '').toLowerCase();
  const filtered = allPatients.filter(p => !search || p.name.toLowerCase().includes(search) || p.mrn.toLowerCase().includes(search) || p.phone.includes(search));
  renderPatientsTable(filtered);
}

const formData = {
  'New Self Registration': {desc:'24 fields · Shown to: New patients only · Trigger: First appointment',sections:[{title:'Personal Information',color:'brand',fields:[{num:1,name:'First Name',type:'Text',req:'Required'},{num:2,name:'Last Name',type:'Text',req:'Required'},{num:3,name:'Date of Birth',type:'Date',req:'Required'},{num:4,name:'Preferred Language',type:'Select',req:'Optional'}]},{title:'Insurance & Coverage',color:'navy',ai:true,cond:'Show only when: eligibility check fails OR first visit',fields:[{num:5,name:'Insurance Card (Front)',type:'Upload',req:'Conditional'},{num:6,name:'Insurance Card (Back)',type:'Upload',req:'Conditional'}]}]},
  'Return Visit': {desc:'12 fields · Shown to: Returning patients · Trigger: Follow-up appointment',sections:[{title:'Current Status',color:'brand',fields:[{num:1,name:'How are you feeling?',type:'Text',req:'Optional'},{num:2,name:'Any changes since last visit?',type:'Text',req:'Optional'}]},{title:'Update Insurance',color:'navy',fields:[{num:3,name:'Insurance still valid?',type:'Choice',req:'Optional'}]}]},
  'HIPAA Consent': {desc:'Consent doc · Standard template',sections:[{title:'Acknowledgment',color:'brand',fields:[{num:1,name:'Patient name',type:'Text',req:'Required'},{num:2,name:'I acknowledge HIPAA notice',type:'Choice',req:'Required'}]},{title:'Signature',color:'navy',fields:[{num:3,name:'Patient signature',type:'Signature',req:'Required'},{num:4,name:'Date',type:'Date',req:'Required'}]}]},
  'Financial Policy': {desc:'Consent doc · Payment terms',sections:[{title:'Payment Terms',color:'brand',fields:[{num:1,name:'Agree to copay at visit?',type:'Choice',req:'Required'},{num:2,name:'Payment method',type:'Select',req:'Required'}]},{title:'Insurance',color:'navy',fields:[{num:3,name:'Insurance claim approval',type:'Choice',req:'Optional'}]}]},
  'Derm History': {desc:'18 fields · Medical history questionnaire',sections:[{title:'Medical History',color:'brand',fields:[{num:1,name:'Current skin conditions',type:'Text',req:'Required'},{num:2,name:'Previous treatments',type:'Text',req:'Optional'},{num:3,name:'Medications',type:'Text',req:'Optional'}]},{title:'Allergies',color:'navy',ai:true,field:[{num:4,name:'Known allergies',type:'Text',req:'Required'}]}]},
  'Post-Visit Survey': {desc:'6 fields · Satisfaction survey',sections:[{title:'Experience',color:'brand',fields:[{num:1,name:'How satisfied are you?',type:'Choice',req:'Required'},{num:2,name:'Would recommend?',type:'Choice',req:'Required'},{num:3,name:'Additional feedback',type:'Text',req:'Optional'}]}]}
};

function selectForm(el, name) {
  document.querySelectorAll('.form-item').forEach(f => {
    f.style.borderLeftColor = 'transparent';
    f.style.background = '';
  });
  el.style.borderLeftColor = 'var(--brand)';
  el.style.background = 'var(--brand-lt)';
  const titleEl = document.getElementById('form-editor-title');
  const descEl = titleEl?.parentElement.querySelector('div:nth-child(2)');
  const contentEl = titleEl?.parentElement.parentElement.parentElement.querySelector('[style*="flex:1"]');

  if(titleEl) titleEl.textContent = name;
  if(descEl && formData[name]) descEl.textContent = formData[name].desc;

  if(contentEl && formData[name]) {
    let html = '<div style="padding:10px 14px;background:var(--orange-lt);border-radius:8px;border:1px solid rgba(232,101,45,.2);font-size:12.5px;color:var(--t2);display:flex;align-items:center;gap:7px;margin-bottom:10px"><svg width="14" height="14" viewBox="0 0 20 20" fill="var(--brand)"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg><span><strong style="color:var(--brand)">AI Logic Active:</strong> Questions adapt based on patient data. Drag to reorder.</span></div>';

    formData[name].sections.forEach((sec,si) => {
      const colorMap = {brand:'var(--brand)',navy:'var(--navy)',green:'var(--green)',purple:'var(--purple)'};
      html += `<div style="border:1.5px solid ${sec.color==='brand'?'var(--brand-border)':'var(--border)'};border-radius:10px;padding:14px;margin-bottom:10px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><div style="display:flex;align-items:center;gap:7px"><span style="font-size:11px;font-weight:700;background:${colorMap[sec.color]||'var(--navy)'};color:#fff;padding:2px 7px;border-radius:6px">SECTION</span><span style="font-size:13.5px;font-weight:700;color:var(--t1)">${sec.title}</span></div><div style="display:flex;align-items:center;gap:6px"><${sec.ai?'span style="font-size:11px;font-weight:600;background:var(--brand-lt);color:var(--brand);padding:2px 7px;border-radius:6px">✦ AI Logic</span':''}><button onclick="showToast('Section settings opened')" style="padding:3px 8px;border:1px solid var(--border);border-radius:5px;background:var(--white);font-size:11.5px;color:var(--t2);cursor:pointer;font-family:'Roboto',sans-serif">Edit</button></div></div>${sec.cond?`<div style="font-size:11.5px;color:var(--t3);padding:8px 10px;background:var(--surface);border-radius:6px;margin-bottom:8px">${sec.cond}</div>`:''}`;

      html += '<div style="display:flex;flex-direction:column;gap:7px">';
      (sec.fields || sec.field || []).forEach(f => {
        html += `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--white);border-radius:8px;border:1px solid var(--borderlt)"><div style="width:16px;height:16px;border-radius:50%;background:${colorMap[sec.color]||'var(--navy)'};display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;font-weight:700;flex-shrink:0">${f.num}</div><span style="font-size:12.5px;font-weight:500;color:var(--t1);flex:1">${f.name}</span><span style="font-size:11px;background:var(--surface);color:var(--t3);padding:2px 7px;border-radius:5px">${f.type}</span><span style="font-size:11px;background:${f.req==='Required'?'var(--red-bg)':f.req==='Conditional'?'var(--amber-bg)':'var(--surface)'};color:${f.req==='Required'?'var(--red)':f.req==='Conditional'?'var(--amber)':'var(--t3)'};padding:2px 7px;border-radius:5px">${f.req}</span><button onclick="showToast('Field settings opened')" style="padding:3px 7px;border:1px solid var(--border);border-radius:5px;background:var(--white);font-size:11px;color:var(--t2);cursor:pointer;font-family:'Roboto',sans-serif">✎</button></div>`;
      });
      html += '</div></div>';
    });
    html += '<button onclick="showToast(\'New section added\')" style="width:100%;padding:11px;border:2px dashed var(--border);border-radius:10px;background:transparent;color:var(--t3);font-size:13px;font-weight:500;cursor:pointer;font-family:\'Roboto\',sans-serif;transition:all .15s" onmouseover="this.style.borderColor=\'var(--orange)\';this.style.color=\'var(--orange)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--t3)\'">' + '+ Add Section' + '</button>';
    contentEl.innerHTML = html;
  }
}




// ══════════════════════════════════════
// NEW PATIENT SELF-REGISTRATION
// ══════════════════════════════════════
const REG_STEPS = ['Create Account','Verify Phone','Contact & Address','Insurance','Book Appointment','Done'];
let regCur = 0;

function regBuildProgress() {
  const wrap = document.getElementById('reg-prog-steps');
  if(!wrap) return;
  wrap.innerHTML = '';
  REG_STEPS.forEach(function(s,i) {
    const d = document.createElement('div');
    d.className = 'ps' + (i < regCur ? ' done' : i === regCur ? ' active' : '');
    wrap.appendChild(d);
  });
  const cnt = document.getElementById('reg-prog-count');
  if(cnt) cnt.textContent = 'Step ' + (Math.min(regCur+1, REG_STEPS.length)) + ' of ' + REG_STEPS.length;
  const wrap2 = document.getElementById('reg-prog-wrap');
  if(wrap2) wrap2.style.display = regCur >= REG_STEPS.length ? 'none' : 'block';
}

function regNext() {
  const old = document.getElementById('rs' + regCur);
  if(old) {
    old.style.animation = 'so .2s ease forwards';
    setTimeout(function() {
      old.classList.remove('active');
      regCur++;
      regBuildProgress();
      const nxt = document.getElementById('rs' + regCur);
      if(nxt) { nxt.style.animation = ''; nxt.classList.add('active'); }
      window.scrollTo(0,0);
    }, 180);
  }
}

function regOtp(el, nextId) {
  if(el.value) {
    el.classList.add('filled');
    const nxt = document.getElementById(nextId);
    if(nxt) nxt.focus();
  }
}

function regOtpDone() {
  const btn = document.getElementById('reg-verify-btn');
  if(btn) btn.disabled = false;
  showToast('Phone verified!');
}

function regAutoOtp() {
  const ids = ['ro1','ro2','ro3','ro4'];
  const vals = ['5','2','1','9'];
  ids.forEach(function(id, i) {
    setTimeout(function() {
      const el = document.getElementById(id);
      if(el) { el.value = vals[i]; el.classList.add('filled'); }
      if(i === 3) regOtpDone();
    }, i * 120);
  });
}

function toggleRegSelfPay(chk) {
  const sections = document.getElementById('reg-ins-sections');
  if (sections) sections.style.display = chk.checked ? 'none' : '';
}

function selectRegIns(el, type) {
  document.querySelectorAll('.reg-ins-opt').forEach(function(o) {
    o.style.borderColor = 'var(--border)';
    o.style.background = 'var(--white)';
  });
  el.style.borderColor = 'var(--brand)';
  el.style.background = 'var(--brand-lt)';
  const form = document.getElementById('reg-ins-form');
  if(form) form.style.display = type === 'self' ? 'none' : 'block';
  showToast(type === 'self' ? 'Self-pay selected' : 'Insurance form ready');
}

function regUpload(id, side) {
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('done');
  el.innerHTML = '<div style="font-size:24px;margin-bottom:4px">✓</div><div style="font-size:13px;font-weight:600;color:var(--green)">' + side + ' Uploaded</div>';
  showToast('Insurance card ' + side.toLowerCase() + ' saved');
}

function selectProvider(el) {
  document.querySelectorAll('.prov-opt').forEach(function(o) {
    o.style.borderColor = 'var(--border)';
    o.style.background = 'var(--white)';
  });
  el.style.borderColor = 'var(--brand)';
  el.style.background = 'var(--brand-lt)';
}

function selectSlot(el) {
  document.querySelectorAll('.slot-opt').forEach(function(o) {
    o.style.borderColor = 'var(--border)';
    o.style.background = 'var(--white)';
    o.querySelector('div').style.color = 'var(--t3)';
  });
  el.style.borderColor = 'var(--brand)';
  el.style.background = 'var(--brand-lt)';
  el.querySelector('div').style.color = 'var(--brand)';
}

// ══════════════════════════════════════
// POST-VISIT FOLLOW-UP
// ══════════════════════════════════════
let fuCur = 0;
let starRating = 0;

function fuNext() {
  const old = document.getElementById('fu' + fuCur);
  if(old) {
    old.style.animation = 'so .2s ease forwards';
    setTimeout(function() {
      old.classList.remove('active');
      fuCur++;
      const nxt = document.getElementById('fu' + fuCur);
      if(nxt) { nxt.style.animation = ''; nxt.classList.add('active'); }
      window.scrollTo(0,0);
    }, 180);
  }
}

function rateStar(n) {
  starRating = n;
  const stars = document.querySelectorAll('.star');
  const labels = ['','Poor','Fair','Good','Great','Excellent!'];
  stars.forEach(function(s, i) {
    s.style.filter = i < n ? 'grayscale(0)' : 'grayscale(1)';
    s.style.transform = i < n ? 'scale(1.15)' : 'scale(1)';
  });
  const lbl = document.getElementById('star-label');
  if(lbl) { lbl.textContent = labels[n]; lbl.style.color = 'var(--brand)'; }
}

function fuSelect(el, cls) {
  document.querySelectorAll(cls).forEach(function(o) {
    o.classList.remove('sel');
  });
  el.classList.add('sel');
}

function sentSelect(el, cls) {
  document.querySelectorAll(cls).forEach(function(o) {
    o.classList.remove('sel');
  });
  el.classList.add('sel');
}

// ══════════════════════════════════════
// KIOSK CHECK-IN
// ══════════════════════════════════════
function kioskStart() {
  document.getElementById('kiosk-idle').style.display = 'none';
  const flow = document.getElementById('kiosk-flow');
  flow.style.display = 'flex';
  showKioskStep(0);
}

function showKioskStep(n) {
  ['ks0','ks1','ks2','ks3'].forEach(function(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
  const el = document.getElementById('ks' + n);
  if(el) el.style.display = 'flex';
}

function kioskFindAppt() {
  const dob = document.getElementById('kiosk-dob');
  if(dob && dob.value) {
    showToast('Appointment found for Marcus Thompson');
    setTimeout(function() { showKioskStep(1); }, 600);
  } else {
    showToast('Please enter your date of birth');
  }
}

function kioskConfirm() {
  showToast('Identity confirmed');
  setTimeout(function() { showKioskStep(2); }, 400);
}

function kioskComplete() {
  showToast('Checking you in...');
  setTimeout(function() { showKioskStep(3); }, 800);
}

function kioskReset() {
  fuCur = 0;
  document.getElementById('kiosk-flow').style.display = 'none';
  document.getElementById('kiosk-idle').style.display = 'flex';
  showKioskStep(0);
}

function kioskGoToPayment() {
  document.getElementById('ks2').style.display = 'none';
  document.getElementById('ks-pay').style.display = 'flex';
}

function kioskProcessPayment() {
  const payBtn = event.target;
  const origText = payBtn.textContent;
  payBtn.textContent = 'Processing...';
  payBtn.disabled = true;
  showToast('Processing payment...');
  setTimeout(function() {
    document.getElementById('ks-pay').style.display = 'none';
    document.getElementById('ks3').style.display = 'flex';
    showToast('Payment of $40.00 successful ✓');
  }, 1200);
}

function kioskSkipPayment() {
  document.getElementById('ks-pay').style.display = 'none';
  document.getElementById('ks3').style.display = 'flex';
  showToast('Payment skipped - will collect at checkout');
}

// ═══════════════════════════════════════
// PRE-VISIT OUTREACH
// ═══════════════════════════════════════

let pvoCur = 0;
let pvoSelection = '';

function launchOutreach(startAt) {
  pvoCur = startAt || 0;
  const screens = document.querySelectorAll('#app-outreach .screen');
  screens.forEach(s => s.classList.remove('active'));
  if (screens[pvoCur]) {
    screens[pvoCur].classList.add('active');
  }
  switchApp('outreach');
}

function pvoNext() {
  const screens = document.querySelectorAll('#app-outreach .screen');
  screens[pvoCur].classList.remove('active');
  pvoCur = Math.min(pvoCur + 1, screens.length - 1);
  screens[pvoCur].classList.add('active');

  // Update confirmation screen based on selection
  if (pvoCur === 4) {
    const titleMap = {
      confirm: "You're Confirmed!",
      telehealth: "Telehealth Confirmed!",
      reschedule: "Reschedule Requested",
      cancel: "Appointment Cancelled"
    };
    const descMap = {
      confirm: "See you soon, Sarah",
      telehealth: "Video call scheduled with Dr. Reyes",
      reschedule: "We'll help you find a new time",
      cancel: "We hope to see you soon"
    };
    const headlineMap = {
      confirm: "Appointment Confirmed",
      telehealth: "Telehealth Visit Confirmed",
      reschedule: "Reschedule Request Submitted",
      cancel: "Appointment Cancelled"
    };

    const sel = pvoSelection || 'confirm';
    document.getElementById('pvo-title').textContent = titleMap[sel] || titleMap.confirm;
    document.getElementById('pvo-desc').textContent = descMap[sel] || descMap.confirm;
    document.getElementById('pvo-headline').textContent = headlineMap[sel] || headlineMap.confirm;

    // Show/hide intake card based on selection
    const intakeCard = document.getElementById('pvo-intake-card');
    if (sel === 'confirm') {
      intakeCard.style.display = 'block';
    } else {
      intakeCard.style.display = 'none';
    }
  }
}

function pvoSelect(type) {
  pvoSelection = type;
  pvoNext();
}

// ═══════════════════════════════════════
// MESSAGE PREVIEW MODAL - OUTREACH
// ═══════════════════════════════════════
const messages = {
  'Marcus Thompson': {
    'email-t5': { type: '📧 Email', time: 'T-5 Days', subject: 'Appointment Reminder - March 21', body: 'Hi Marcus,\n\nThis is a reminder that you have an appointment with Dr. Isabel Reyes on Friday, March 21, 2026 at 10:15 AM for your acne follow-up visit.\n\nLocation: Dermatology of Boca, 2200 N Congress Ave, Miami, FL 33127\nProvider: Dr. Isabel Reyes, MD\n\nPlease plan to arrive 10 minutes early. To confirm your appointment or make changes, reply to this message or call us at (305) 555-0100.\n\nBest regards,\nDermatology of Boca Team' },
    'sms-t5': { type: '💬 SMS', time: 'T-5 Days', subject: 'Appointment Confirmed', body: 'Hi Marcus! Reminder: Your appointment with Dr. Reyes is Friday Mar 21 at 10:15 AM. Reply CONFIRM to confirm, RESCHEDULE to change, or CANCEL. Call (305) 555-0100 to speak with us.' },
    'sms-t2': { type: '💬 SMS', time: 'T-2 Days', subject: 'Confirm Appointment', body: 'Marcus, this is a reminder: appointment with Dr. Reyes in 2 days (Mar 21, 10:15 AM). Still coming? Reply CONFIRM or call us back.' },
    'call-t1': { type: '📞 Call', time: 'T-1 Day', subject: 'IVR Message', body: 'Hello, this is a reminder from Dermatology of Boca. You have an appointment with Dr. Isabel Reyes tomorrow, March 21st at 10:15 AM. To confirm your appointment, press 1. To request a telehealth visit, press 2. To reschedule, press 3. To cancel, press 4. Thank you.' },
    'sms-t1': { type: '💬 SMS', time: 'T-1 Day', subject: 'Final Reminder', body: 'Final reminder: Your appointment is tomorrow (Mar 21) at 10:15 AM with Dr. Reyes. See you soon! Call (305) 555-0100 with any questions.' }
  },
  'Sarah Chen': {
    'email-t5': { type: '📧 Email', time: 'T-5 Days', subject: 'Appointment Reminder - March 22', body: 'Hi Sarah,\n\nThis is a reminder about your upcoming appointment with Dr. Nguyen on Saturday, March 22, 2026 at 2:30 PM.\n\nVisit Type: Skin Check & Biopsy (45 minutes)\nLocation: Dermatology of Boca\n\nPlease bring your insurance card and photo ID. If you need to reschedule or have questions, please contact us at (305) 555-0100.\n\nWe look forward to seeing you!' },
    'sms-t5': { type: '💬 SMS', time: 'T-5 Days', subject: 'Appointment Reminder', body: 'Sarah, reminder: Your appointment with Dr. Nguyen is Sat Mar 22 at 2:30 PM for skin check & biopsy. Please reply CONFIRM or call (305) 555-0100.' },
    'sms-t2': { type: '💬 SMS', time: 'T-2 Days', subject: 'Still Coming?', body: 'Hi Sarah, 2 days until your appointment with Dr. Nguyen (Mar 22, 2:30 PM). Please confirm you\'re still coming by replying CONFIRM.' }
  },
  'James Rodriguez': {
    'email-t5': { type: '📧 Email', time: 'T-5 Days', subject: 'Appointment Reminder - March 19', body: 'Hi James,\n\nWe wanted to remind you about your psoriasis consultation appointment on Wednesday, March 19, 2026 at 1:00 PM with Dr. Patel.\n\nPlease bring any recent medical records and insurance information. To confirm or if you have questions, call us at (305) 555-0100.\n\nBest regards,\nDermatology of Boca' },
    'sms-t5': { type: '💬 SMS', time: 'T-5 Days', subject: 'Appointment Reminder', body: 'James, reminder: Appointment with Dr. Patel for psoriasis consultation on Wed Mar 19 at 1:00 PM. Please confirm by replying CONFIRM.' },
    'sms-t2': { type: '💬 SMS', time: 'T-2 Days', subject: 'Confirm Appointment', body: 'Appointment reminder: Dr. Patel on Mar 19 at 1:00 PM. Still planning to come? Reply CONFIRM or call us.' },
    'call-t1': { type: '📞 Call', time: 'T-1 Day', subject: 'IVR Delivery Failed', body: '(Failed to deliver - invalid phone number on file)' }
  },
  'Emily Wong': {
    'email-t5': { type: '📧 Email', time: 'T-5 Days', subject: 'Appointment Reminder - March 25', body: 'Hi Emily,\n\nJust a friendly reminder about your upcoming appointment with Dr. Reyes on Tuesday, March 25, 2026 at 11:00 AM.\n\nVisit Type: Cosmetic Consult\n\nWe\'re excited to discuss your aesthetic goals with you. Please reply to confirm or call (305) 555-0100 if you have any questions.\n\nWarm regards,\nDermatology of Boca Team' },
    'sms-t5': { type: '💬 SMS', time: 'T-5 Days', subject: 'Appointment Reminder', body: 'Emily, reminder: Cosmetic consult with Dr. Reyes on Tue Mar 25 at 11:00 AM. Please confirm by replying CONFIRM. Call (305) 555-0100 with questions.' }
  }
};

function showMessageModal(patient, date, messageType, status) {
  const modal = document.getElementById('message-modal');
  const patientInfo = document.getElementById('modal-patient-info');
  const container = document.getElementById('modal-messages-container');

  patientInfo.textContent = patient + ' · ' + date;
  container.innerHTML = '';

  const patientMessages = messages[patient] || {};

  if (messageType === 'all') {
    // Show all messages
    Object.entries(patientMessages).forEach(([key, msg]) => {
      container.innerHTML += createMessageCard(msg);
    });
  } else {
    // Show specific message
    const msg = patientMessages[messageType];
    if (msg) {
      container.innerHTML = createMessageCard(msg);
    }
  }

  modal.style.display = 'flex';
}

function createMessageCard(msg) {
  const bgColor = msg.type.includes('📧') ? '#F0F7FF' : msg.type.includes('📞') ? '#FEF3C7' : '#E0F2FE';
  const borderColor = msg.type.includes('📧') ? '#BAE6FD' : msg.type.includes('📞') ? '#FDE68A' : '#7DD3FC';

  return `
    <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;color:var(--t1)">${msg.type}</div>
        <div style="font-size:11px;color:var(--t3);background:var(--surface);padding:3px 8px;border-radius:4px">${msg.time}</div>
      </div>
      <div style="background:var(--white);border-radius:8px;padding:12px;border:1px solid var(--borderlt);margin-bottom:12px">
        <div style="font-size:12px;font-weight:600;color:var(--t1);margin-bottom:8px">${msg.subject}</div>
        <div style="font-size:12px;color:var(--t2);white-space:pre-wrap;line-height:1.5;font-family:'Roboto',sans-serif">${msg.body}</div>
      </div>
    </div>
  `;
}

// ══ REPORTS ══
let activeReport = 'intake';

function switchReport(type) {
  document.querySelectorAll('[id^="report-"]').forEach(r => r.style.display = 'none');
  document.querySelectorAll('[data-report]').forEach(item => item.classList.remove('active-report'));
  const report = document.getElementById('report-' + type);
  if (report) {
    report.style.display = 'block';
    activeReport = type;
    const reportItem = document.querySelector('[data-report="' + type + '"]');
    if (reportItem) reportItem.classList.add('active-report');
  }
}

// ══ PRESCRIPTION RENEWAL ══
function requestRxRenewal(rxName) {
  const button = event.target;
  button.disabled = true;
  button.textContent = '⏳ Requesting...';
  button.style.opacity = '0.7';

  setTimeout(() => {
    const newHtml = `
      <div style="background:var(--green-bg);border:1px solid var(--border);border-radius:6px;padding:8px 12px">
        <span style="font-size:11.5px;font-weight:600;color:var(--green)">✓ Request received</span>
      </div>
    `;
    button.parentElement.innerHTML = newHtml;
    showToast(`Renewal request sent for ${rxName} - Staff will review shortly`);
  }, 800);
}

// Init registration progress on load
regBuildProgress();

// Init reports selection
switchReport('intake');

// Init accelerator
renderAccelerator();

