// Document Signer - shared by established-patient flows (mobile + desktop)
// Renders a doc-list (#docs-list) on the Consents step, and a fullscreen reader+signer
// that opens when a row is tapped. Single source of truth for doc content + signing state.

(function(){
  var ICONS = {
    lock:    '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/></svg>',
    wallet:  '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/></svg>',
    medical: '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>',
    chevron: '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>',
    pencil:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    check:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
  };

  var DOCS = [
    {
      key: 'hipaa',
      title: 'HIPAA Privacy Notice',
      eyebrow: 'Notice of Privacy Practices',
      subtitle: 'How we use and protect your health information',
      icon: ICONS.lock, iconBg: '#F3F4F6', iconColor: '#1A1F2E',
      method: 'signature',
      body: ''
        + '<p><strong>Effective Date:</strong> January 1, 2024</p>'
        + '<p>This Notice describes how medical information about you may be used and disclosed by Dermatology of Boca ("the Practice") and how you can get access to this information. Please review it carefully.</p>'
        + '<h3>Our Commitment to Your Privacy</h3>'
        + '<p>The Practice is required by law to protect the privacy of your health information, provide you with this Notice of our legal duties and privacy practices, and follow the terms of the Notice currently in effect.</p>'
        + '<h3>How We May Use and Disclose Your Information</h3>'
        + '<p><strong>Treatment.</strong> We may use your health information to provide medical care, including sharing your information with other healthcare providers, laboratories, pharmacies, and specialists involved in your care.</p>'
        + '<p><strong>Payment.</strong> We may use and share your information to bill and receive payment from insurers, government programs, and you, including verifying coverage and obtaining prior authorization.</p>'
        + '<p><strong>Healthcare Operations.</strong> We may use your information to support business activities such as quality assessment, care coordination, staff training, audits, and practice management.</p>'
        + '<p><strong>Appointment Reminders.</strong> We may contact you to remind you of upcoming appointments via phone, text, or email.</p>'
        + '<h3>Your Rights</h3>'
        + '<ul>'
        + '<li><strong>Inspect and copy</strong> your medical record.</li>'
        + '<li><strong>Request corrections</strong> if you believe your record is incorrect.</li>'
        + '<li><strong>Request restrictions</strong> on certain uses or disclosures of your information.</li>'
        + '<li><strong>Receive confidential communications</strong> at an alternate location or by alternate means.</li>'
        + '<li><strong>Receive an accounting</strong> of certain disclosures we have made.</li>'
        + '<li><strong>Receive a paper copy</strong> of this Notice at any time.</li>'
        + '<li><strong>File a complaint</strong> if you believe your privacy rights have been violated.</li>'
        + '</ul>'
        + '<h3>Our Responsibilities</h3>'
        + '<ul>'
        + '<li>We are required by law to maintain the privacy of your health information.</li>'
        + '<li>We will notify you promptly if a breach occurs that may have compromised your information.</li>'
        + '<li>We must follow the duties and practices described in this Notice.</li>'
        + '</ul>'
        + '<h3>Questions or Complaints</h3>'
        + '<p>If you have questions about this Notice or wish to file a complaint, please contact our Privacy Officer at (561) 555-0100. You also have the right to file a complaint with the U.S. Department of Health and Human Services Office for Civil Rights. We will not retaliate against you for filing a complaint.</p>'
        + '<h3>Acknowledgment</h3>'
        + '<p>By signing below, you acknowledge that you have received and reviewed this Notice of Privacy Practices.</p>'
    },
    {
      key: 'fin',
      title: 'Financial Policy Agreement',
      eyebrow: 'Financial Responsibility',
      subtitle: 'Insurance, co-payments, billing, and missed-appointment policy',
      icon: ICONS.wallet, iconBg: '#E8E1F0', iconColor: '#8474A1',
      method: 'signature',
      body: ''
        + '<p>Thank you for choosing Dermatology of Boca. We are committed to providing you with excellent dermatologic care. The following outlines our financial policy.</p>'
        + '<h3>Insurance Coverage</h3>'
        + '<p>As a courtesy, we will bill your insurance company for services provided. However, you are ultimately responsible for any charges not covered by your insurance, including services deemed not medically necessary or considered cosmetic.</p>'
        + '<h3>Co-Payments, Deductibles &amp; Co-Insurance</h3>'
        + '<p>Co-payments are due at the time of service. Deductibles and co-insurance amounts not collected at the visit will be billed to you after your insurance has processed the claim.</p>'
        + '<h3>Non-Covered Services</h3>'
        + '<p>Some procedures (including most cosmetic services) are not covered by insurance. We will inform you of estimated charges before performing these services. Payment in full is expected at the time of service.</p>'
        + '<h3>Self-Pay Patients</h3>'
        + '<p>Patients without insurance are expected to pay in full at the time of service. Discounted self-pay rates may be available; please ask our front desk staff for details.</p>'
        + '<h3>Billing &amp; Past-Due Accounts</h3>'
        + '<p>Statements are mailed monthly. Outstanding balances are due within 30 days of the statement date. Accounts that remain unpaid after 90 days may be referred to a collection agency, and a collection fee may be added to your balance.</p>'
        + '<h3>Accepted Payment Methods</h3>'
        + '<p>We accept cash, personal checks, Visa, MasterCard, Discover, American Express, and major HSA / FSA cards. A $35 fee will be charged for any returned check.</p>'
        + '<h3>Missed Appointments</h3>'
        + '<p>We require at least 24 hours notice for any appointment cancellation. A $50 fee may be charged for appointments cancelled with less than 24 hours notice or for no-shows.</p>'
        + '<h3>Acknowledgment</h3>'
        + '<p>By signing below, you acknowledge that you have read, understand, and agree to this Financial Policy and accept responsibility for payment of all charges incurred for your care.</p>'
    },
    {
      key: 'auth',
      title: 'Treatment Authorization',
      eyebrow: 'Consent to Treat',
      subtitle: 'Authorize medical evaluations and release of info for billing',
      icon: ICONS.medical, iconBg: '#ECFDF5', iconColor: '#10B981',
      method: 'checkbox',
      checkboxText: 'I have read this authorization and consent to treatment by Dermatology of Boca. I also authorize release of medical information for insurance billing purposes.',
      body: ''
        + '<p>This document authorizes Dermatology of Boca and its providers to render dermatologic medical services to you. Please read carefully before consenting.</p>'
        + '<h3>Authorization for Treatment</h3>'
        + '<p>I authorize the providers and staff at Dermatology of Boca to perform the medical evaluations, examinations, diagnostic tests, and treatments deemed necessary or advisable by my treating provider during today\'s visit and any subsequent visits associated with this care.</p>'
        + '<h3>Procedures May Include</h3>'
        + '<ul>'
        + '<li>Skin examinations and screenings</li>'
        + '<li>Skin biopsies and minor surgical procedures</li>'
        + '<li>Cryotherapy (freezing of skin lesions)</li>'
        + '<li>Application of topical medications</li>'
        + '<li>Injectable treatments as clinically indicated</li>'
        + '<li>Laboratory testing of specimens collected during the visit</li>'
        + '</ul>'
        + '<h3>Risks, Benefits &amp; Alternatives</h3>'
        + '<p>My provider will discuss the nature, purpose, risks, benefits, and reasonable alternatives of any recommended procedure prior to performing it. I understand that medicine is not an exact science and that no guarantees have been made as to the results.</p>'
        + '<h3>Release for Insurance Billing</h3>'
        + '<p>I authorize the release of medical information to my insurance company and any other entity necessary to process claims and obtain payment for services rendered.</p>'
        + '<h3>Right to Refuse or Withdraw</h3>'
        + '<p>I understand that I have the right to refuse any specific treatment or to withdraw this authorization at any time, except where action has already been taken in reliance on it.</p>'
    }
  ];

  var SIGNATURE_NAME = 'John Doe';
  var signedState = { hipaa:false, fin:false, auth:false };
  var current = null;       // doc key currently open in reader
  var draftSigned = false;  // pending sign within current reader session

  function timeString(){
    var d = new Date();
    var h = d.getHours(); var m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
  }

  function docByKey(k){ for (var i=0;i<DOCS.length;i++) if (DOCS[i].key===k) return DOCS[i]; return null; }

  function statusPillHtml(key){
    return signedState[key]
      ? '<span class="doc-status-pill signed"><span class="doc-status-tick">' + ICONS.check + '</span>Signed</span>'
      : '<span class="doc-status-pill required">Signature required</span>';
  }

  function rowHtml(d){
    return '<button type="button" class="doc-row' + (signedState[d.key] ? ' signed' : '') + '" data-key="' + d.key + '" onclick="openDocSigner(\'' + d.key + '\')">'
      +   '<div class="doc-row-ic" style="background:' + d.iconBg + ';color:' + d.iconColor + '">' + d.icon + '</div>'
      +   '<div class="doc-row-main">'
      +     '<div class="doc-row-title">' + d.title + '</div>'
      +     '<div class="doc-row-sub">' + d.subtitle + '</div>'
      +   '</div>'
      +   '<div class="doc-row-status">' + statusPillHtml(d.key) + '</div>'
      +   '<div class="doc-row-arrow">' + ICONS.chevron + '</div>'
      + '</button>';
  }

  function renderList(){
    var list = document.getElementById('docs-list');
    if (!list) return;
    list.innerHTML = DOCS.map(rowHtml).join('');
  }

  function updateProgress(){
    var count = 0;
    DOCS.forEach(function(d){ if (signedState[d.key]) count++; });
    var el = document.getElementById('docs-signed-count');
    if (el) el.textContent = count;
    var totalEl = document.getElementById('docs-total-count');
    if (totalEl) totalEl.textContent = DOCS.length;
    var fill = document.getElementById('docs-progress-fill');
    if (fill) fill.style.width = ((count / DOCS.length) * 100) + '%';
    var btn = document.getElementById('consent-btn');
    if (btn) btn.disabled = count < DOCS.length;
  }

  function ensureReader(){
    if (document.getElementById('doc-reader')) return;
    var html = ''
      + '<div class="doc-reader" id="doc-reader" onclick="if(event.target===this)closeDocSigner()">'
      +   '<div class="doc-reader-inner" role="dialog" aria-modal="true" aria-labelledby="dr-title">'
      +     '<div class="doc-reader-head">'
      +       '<div>'
      +         '<div class="doc-reader-eyebrow" id="dr-eyebrow"></div>'
      +         '<div class="doc-reader-title" id="dr-title"></div>'
      +       '</div>'
      +       '<button type="button" class="doc-reader-close" onclick="closeDocSigner()" aria-label="Close">&times;</button>'
      +     '</div>'
      +     '<div class="doc-reader-body" id="dr-body"></div>'
      +     '<div class="doc-reader-sign" id="dr-sign"></div>'
      +     '<div class="doc-reader-foot">'
      +       '<button type="button" class="doc-reader-cancel" onclick="closeDocSigner()">Cancel</button>'
      +       '<button type="button" class="doc-reader-confirm" id="dr-confirm" onclick="confirmDocSign()" disabled>Save Signature</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);
  }

  function renderSignSection(d){
    var sec = document.getElementById('dr-sign');
    if (!sec) return;
    if (d.method === 'checkbox') {
      sec.innerHTML = ''
        + '<div class="dr-sign-lbl">Your acknowledgment</div>'
        + '<label class="dr-check-row" id="dr-check-wrap">'
        +   '<input type="checkbox" id="dr-check" onchange="toggleReaderCheck(this)"' + (draftSigned ? ' checked' : '') + '>'
        +   '<div class="dr-check-text">' + d.checkboxText + '</div>'
        + '</label>';
      if (draftSigned) document.getElementById('dr-check-wrap').classList.add('checked');
    } else {
      sec.innerHTML = ''
        + '<div class="dr-sign-lbl">Your signature</div>'
        + '<div class="dr-sig-area' + (draftSigned ? ' signed' : '') + '" id="dr-sig-area" onclick="signInReader()">'
        +   (draftSigned
              ? '<div class="dr-sig-script">' + SIGNATURE_NAME + '</div><div class="dr-sig-meta">Signed at ' + timeString() + ' today</div>'
              : '<div class="dr-sig-pencil">' + ICONS.pencil + '</div><div class="dr-sig-hint">Tap here to sign</div>')
        + '</div>';
    }
  }

  function updateConfirmBtn(){
    var btn = document.getElementById('dr-confirm');
    if (!btn) return;
    btn.disabled = !draftSigned;
    btn.textContent = draftSigned ? 'Save & Continue' : 'Save Signature';
  }

  window.openDocSigner = function(key){
    ensureReader();
    var d = docByKey(key);
    if (!d) return;
    current = key;
    draftSigned = signedState[key] === true;
    document.getElementById('dr-eyebrow').textContent = d.eyebrow;
    document.getElementById('dr-title').textContent = d.title;
    var bodyEl = document.getElementById('dr-body');
    bodyEl.innerHTML = d.body;
    bodyEl.scrollTop = 0;
    renderSignSection(d);
    updateConfirmBtn();
    document.getElementById('doc-reader').classList.add('show');
    document.body.classList.add('doc-reader-open');
    document.body.style.overflow = 'hidden';
  };

  window.closeDocSigner = function(){
    var m = document.getElementById('doc-reader');
    if (m) m.classList.remove('show');
    document.body.classList.remove('doc-reader-open');
    document.body.style.overflow = '';
    current = null;
    draftSigned = false;
  };

  window.signInReader = function(){
    if (draftSigned) return;
    draftSigned = true;
    var d = docByKey(current);
    if (d) renderSignSection(d);
    updateConfirmBtn();
  };

  window.toggleReaderCheck = function(input){
    draftSigned = !!input.checked;
    var wrap = document.getElementById('dr-check-wrap');
    if (wrap) wrap.classList.toggle('checked', draftSigned);
    updateConfirmBtn();
  };

  window.confirmDocSign = function(){
    if (!current || !draftSigned) return;
    signedState[current] = true;
    renderList();
    updateProgress();
    window.closeDocSigner();
  };

  function init(){
    renderList();
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') window.closeDocSigner();
  });
})();
