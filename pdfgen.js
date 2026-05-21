// ===== PDF / PRINT ENGINE =====

function printDoc(html) {
  let area = document.getElementById('printArea');
  if (!area) {
    area = document.createElement('div');
    area.id = 'printArea';
    document.body.appendChild(area);
  }
  area.innerHTML = html;
  window.print();
  setTimeout(() => { area.innerHTML = ''; }, 1500);
}

function docHeader(title, subtitle, refNo) {
  const now = new Date().toLocaleDateString('lo-LA', { year:'numeric', month:'long', day:'numeric' });
  return `
  <div class="doc-header">
    <div class="doc-logo-wrap">
      <div class="doc-logo">🏦</div>
      <div>
        <div class="doc-company">Unjai Finance</div>
        <div class="doc-company-sub">ສິນເຊື່ອສ່ວນບຸກຄົນ | 020 96498301</div>
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-date">ວັນທີ: ${now}</div>
      ${refNo ? `<div class="doc-ref">ເລກທີ: ${refNo}</div>` : ''}
    </div>
  </div>
  <div class="doc-title-block">
    <div class="doc-title">${title}</div>
    ${subtitle ? `<div class="doc-subtitle">${subtitle}</div>` : ''}
  </div>`;
}

function docFooter(note) {
  return `
  <div class="doc-footer">
    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">ລາຍເຊັນຜູ້ສະໝັກ / ຜູ້ກູ້</div>
        <div class="sig-date">ວັນທີ: ________________</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">ລາຍເຊັນພະນັກງານ</div>
        <div class="sig-date">ວັນທີ: ________________</div>
      </div>
      <div class="sig-box">
        <div class="sig-stamp">ກ/ສ</div>
        <div class="sig-label">ກ/ສ ຂອງບໍລິສັດ</div>
      </div>
    </div>
    ${note ? `<div class="doc-note">* ${note}</div>` : ''}
    <div class="doc-footer-bar">
      📞 020 96498301 &nbsp;|&nbsp; Unjai Finance
    </div>
  </div>`;
}

const DOC_CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI','Noto Sans Lao',Arial,sans-serif; color:#212121; font-size:13px; }
  .doc-page { max-width:750px; margin:0 auto; padding:32px 40px; }
  .watermark {
    position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg);
    font-size:72px; font-weight:900; color:rgba(46,125,50,0.05); z-index:0;
    pointer-events:none; white-space:nowrap; letter-spacing:8px;
  }
  .doc-header {
    display:flex; justify-content:space-between; align-items:flex-start;
    border-bottom:3px solid #2e7d32; padding-bottom:16px; margin-bottom:20px; position:relative; z-index:1;
  }
  .doc-logo-wrap { display:flex; align-items:center; gap:12px; }
  .doc-logo { width:52px; height:52px; background:#2e7d32; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; }
  .doc-company { font-size:20px; font-weight:800; color:#1b5e20; }
  .doc-company-sub { font-size:11px; color:#757575; margin-top:2px; }
  .doc-meta { text-align:right; }
  .doc-date { font-size:12px; color:#757575; }
  .doc-ref { font-size:13px; font-weight:700; color:#2e7d32; margin-top:4px; }
  .doc-title-block { text-align:center; margin:20px 0 24px; position:relative; z-index:1; }
  .doc-title { font-size:20px; font-weight:800; color:#1b5e20; letter-spacing:1px; }
  .doc-subtitle { font-size:12px; color:#757575; margin-top:4px; }
  .section-label {
    background:#2e7d32; color:white; padding:6px 14px; font-size:12px; font-weight:700;
    border-radius:6px; margin:20px 0 12px; letter-spacing:0.5px; position:relative; z-index:1;
  }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; position:relative; z-index:1; }
  .info-grid.cols3 { grid-template-columns:1fr 1fr 1fr; }
  .info-item { background:#f9fbe7; border:1px solid #c8e6c9; border-radius:8px; padding:10px 12px; }
  .info-item.full { grid-column:1/-1; }
  .info-item.highlight { background:#e8f5e9; border-color:#a5d6a7; }
  .info-label { font-size:10px; color:#757575; margin-bottom:3px; text-transform:uppercase; letter-spacing:0.5px; }
  .info-value { font-size:14px; font-weight:700; color:#1b5e20; }
  .info-value.lg { font-size:17px; }
  .status-pill {
    display:inline-block; padding:4px 12px; border-radius:50px; font-size:11px; font-weight:700;
  }
  .pill-pending { background:#fff3e0; color:#e65100; }
  .pill-active { background:#e3f2fd; color:#1565c0; }
  .pill-approved { background:#e8f5e9; color:#1b5e20; }
  .pill-completed { background:#f3e5f5; color:#6a1b9a; }
  .pill-rejected { background:#ffebee; color:#c62828; }
  table { width:100%; border-collapse:collapse; font-size:12px; position:relative; z-index:1; margin-top:12px; }
  thead { background:#2e7d32; color:white; }
  thead th { padding:9px 10px; text-align:left; font-weight:600; }
  tbody tr:nth-child(even) { background:#f1f8e9; }
  tbody tr:last-child { background:#e8f5e9; font-weight:700; border-top:2px solid #2e7d32; }
  tbody td { padding:8px 10px; border-bottom:1px solid #e0e0e0; }
  .progress-wrap { margin:12px 0; position:relative; z-index:1; }
  .progress-bg { background:#e0e0e0; border-radius:50px; height:10px; overflow:hidden; }
  .progress-fg { height:100%; background:linear-gradient(90deg,#2e7d32,#4caf50); border-radius:50px; }
  .receipt-box {
    border:2px solid #2e7d32; border-radius:12px; padding:20px 24px; margin:20px 0;
    background:#f9fbe7; text-align:center; position:relative; z-index:1;
  }
  .receipt-amount { font-size:32px; font-weight:900; color:#1b5e20; margin:8px 0; }
  .receipt-ref { font-size:12px; color:#757575; margin-top:4px; }
  .receipt-method { display:inline-block; background:#2e7d32; color:white; padding:3px 10px; border-radius:50px; font-size:11px; margin-top:8px; }
  .divider { border:none; border-top:1px dashed #a5d6a7; margin:16px 0; position:relative; z-index:1; }
  .doc-footer { margin-top:32px; position:relative; z-index:1; }
  .sig-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:20px; }
  .sig-box { text-align:center; }
  .sig-line { border-bottom:1px solid #424242; margin-bottom:6px; height:50px; }
  .sig-label { font-size:11px; color:#424242; font-weight:600; }
  .sig-date { font-size:10px; color:#757575; margin-top:4px; }
  .sig-stamp {
    width:60px; height:60px; border:2px dashed #2e7d32; border-radius:50%;
    display:flex; align-items:center; justify-content:center; margin:0 auto 6px;
    color:#2e7d32; font-size:13px; font-weight:700;
  }
  .doc-note { font-size:10px; color:#757575; font-style:italic; margin-bottom:12px; }
  .doc-footer-bar { background:#1b5e20; color:rgba(255,255,255,0.85); padding:8px 16px; border-radius:6px; font-size:10px; text-align:center; }
  .history-table tbody tr:last-child { background:#fff; font-weight:400; border-top:none; }
  @media print {
    @page { size:A4; margin:10mm 12mm; }
    .doc-page { padding:16px 20px; }
  }
`;

// ===== 1. LOAN APPLICATION =====
function printLoanApplication(loan) {
  if (!loan) { showToast('ບໍ່ມີຂໍ້ມູນ', 'error'); return; }
  const total = calcTotal(loan.amount, loan.rate || 1.5, loan.duration);
  const monthly = calcMonthly(loan.amount, loan.rate || 1.5, loan.duration);
  const interest = total - loan.amount;

  printDoc(`<!DOCTYPE html><html lang="lo"><head><meta charset="UTF-8"/>
  <style>${DOC_CSS}</style></head><body>
  <div class="watermark">UNJAI</div>
  <div class="doc-page">
    ${docHeader('ໃບສະໝັກກູ້ເງິນ', 'Loan Application Form', loan.id)}

    <div class="section-label">👤 ຂໍ້ມູນຜູ້ສະໝັກ</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">ຊື່-ນາມສະກຸນ</div><div class="info-value">${loan.name}</div></div>
      <div class="info-item"><div class="info-label">ເບີໂທລະສັບ</div><div class="info-value">${loan.phone}</div></div>
      <div class="info-item"><div class="info-label">ເລກບັດປະຈຳຕົວ</div><div class="info-value">${loan.idCard || '-'}</div></div>
      <div class="info-item"><div class="info-label">ອາຊີບ</div><div class="info-value">${loan.occupation || '-'}</div></div>
      <div class="info-item"><div class="info-label">ລາຍໄດ້ຕໍ່ເດືອນ</div><div class="info-value">${formatMoney(loan.income || 0)}</div></div>
      <div class="info-item full"><div class="info-label">ທີ່ຢູ່</div><div class="info-value">${loan.address || '-'}</div></div>
    </div>

    <div class="section-label">💰 ຂໍ້ມູນເງິນກູ້</div>
    <div class="info-grid cols3">
      <div class="info-item highlight"><div class="info-label">ຈຳນວນເງິນກູ້</div><div class="info-value lg">${formatMoney(loan.amount)}</div></div>
      <div class="info-item highlight"><div class="info-label">ໄລຍະເວລາ</div><div class="info-value lg">${loan.durationDisplay || (loan.duration + ' ເດືອນ')}</div></div>
      <div class="info-item highlight"><div class="info-label">ດອກເບ້ຍ</div><div class="info-value lg">${loan.rateDisplay || ((loan.rate || 1.5) + '% / ເດືອນ')}</div></div>
      <div class="info-item"><div class="info-label">ດອກເບ້ຍທັງໝົດ</div><div class="info-value">${formatMoney(interest)}</div></div>
      <div class="info-item"><div class="info-label">ຄ່າງວດ/ເດືອນ</div><div class="info-value">${formatMoney(monthly)}</div></div>
      <div class="info-item"><div class="info-label">ຍອດຕ້ອງຊຳລະທັງໝົດ</div><div class="info-value">${formatMoney(total)}</div></div>
      <div class="info-item"><div class="info-label">ຈຸດປະສົງ</div><div class="info-value">${loan.purpose || '-'}</div></div>
      <div class="info-item"><div class="info-label">ສະຖານະ</div>
        <div class="info-value"><span class="status-pill pill-${loan.status||'pending'}">${{pending:'⏳ ລໍຖ້າ',approved:'✅ ອະນຸມັດ',active:'🔵 ດຳເນີນ',completed:'🎉 ສຳເລັດ',rejected:'❌ ປະຕິເສດ'}[loan.status]||'ລໍຖ້າ'}</span></div>
      </div>
      <div class="info-item"><div class="info-label">ວັນທີສະໝັກ</div><div class="info-value">${formatDate(loan.createdAt)}</div></div>
    </div>

    <div class="section-label">📋 ເງື່ອນໄຂ</div>
    <div style="font-size:11px; color:#424242; line-height:1.8; position:relative; z-index:1; padding:0 4px;">
      1. ຜູ້ສະໝັກຕ້ອງຊຳລະຄ່າງວດຕາມກຳນົດ ທຸກວັນທີ 1 ຂອງທຸກເດືອນ<br/>
      2. ການຊຳລະລ່າຊ້າຈະເກີດຄ່າປັບ 2% ຕໍ່ເດືອນ ຂອງຈຳນວນທີ່ຄ້າງ<br/>
      3. ສາມາດຊຳລະລ່ວງໜ້າໂດຍບໍ່ມີຄ່າທຳນຽມ<br/>
      4. ຂໍ້ມູນທີ່ຕື່ມໃນຟອມນີ້ ຖືເປັນຄວາມຈິງ ຖ້າບໍ່ຈິງຈະຖືກດຳເນີນຄະດີ
    </div>

    ${docFooter('ເອກະສານນີ້ອອກໂດຍ Unjai Finance')}
  </div></body></html>`);
}

// ===== 2. PAYMENT SCHEDULE =====
function printSchedule(schedule, principal, rate, months, type) {
  if (!schedule || !schedule.length) { showToast('ກົດ "ຄຳນວນ" ກ່ອນ', 'error'); return; }
  const totalPay = schedule.reduce((s, r) => s + r.payment, 0);
  const totalInt = totalPay - principal;
  const typeNames = { simple:'ດອກເບ້ຍງ່າຍ', compound:'ດອກເບ້ຍທົບຕົ້ນ', reducing:'ຍອດຫຼຸດລົງ' };

  const rows = schedule.map((r, i) => `
    <tr>
      <td style="text-align:center; font-weight:600;">${r.n}</td>
      <td>${Math.round(r.payment).toLocaleString('lo-LA')}</td>
      <td>${Math.round(r.principal).toLocaleString('lo-LA')}</td>
      <td style="color:#c62828;">${Math.round(r.interest).toLocaleString('lo-LA')}</td>
      <td>${Math.round(r.balance).toLocaleString('lo-LA')}</td>
    </tr>`).join('');

  printDoc(`<!DOCTYPE html><html lang="lo"><head><meta charset="UTF-8"/>
  <style>${DOC_CSS}</style></head><body>
  <div class="watermark">UNJAI</div>
  <div class="doc-page">
    ${docHeader('ຕາຕະລາງການຊຳລະເງິນກູ້', 'Loan Repayment Schedule')}

    <div class="section-label">📊 ສະຫຼຸບ</div>
    <div class="info-grid cols3">
      <div class="info-item highlight"><div class="info-label">ເງິນຕົ້ນ</div><div class="info-value lg">${formatMoney(Math.round(principal))}</div></div>
      <div class="info-item highlight"><div class="info-label">ໄລຍະເວລາ</div><div class="info-value lg">${months} ເດືອນ</div></div>
      <div class="info-item highlight"><div class="info-label">ດອກເບ້ຍ/ເດືອນ</div><div class="info-value lg">${rate}%</div></div>
      <div class="info-item"><div class="info-label">ປະເພດຄຳນວນ</div><div class="info-value">${typeNames[type]||type}</div></div>
      <div class="info-item"><div class="info-label">ດອກເບ້ຍທັງໝົດ</div><div class="info-value" style="color:#c62828;">${formatMoney(Math.round(totalInt))}</div></div>
      <div class="info-item"><div class="info-label">ຍອດຕ້ອງຊຳລະ</div><div class="info-value">${formatMoney(Math.round(totalPay))}</div></div>
    </div>

    <div class="section-label">📅 ຕາຕະລາງ</div>
    <table>
      <thead><tr>
        <th style="text-align:center;">ງວດ</th>
        <th>ຊຳລະ (ກີບ)</th><th>ເງິນຕົ້ນ (ກີບ)</th>
        <th>ດອກເບ້ຍ (ກີບ)</th><th>ຍອດຄ້າງ (ກີບ)</th>
      </tr></thead>
      <tbody>
        ${rows}
        <tr>
          <td style="text-align:center; font-weight:700;">ລວມ</td>
          <td>${Math.round(totalPay).toLocaleString('lo-LA')}</td>
          <td>${Math.round(principal).toLocaleString('lo-LA')}</td>
          <td style="color:#c62828;">${Math.round(totalInt).toLocaleString('lo-LA')}</td>
          <td>0</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:20px; font-size:10px; color:#757575; position:relative; z-index:1;">
      * ຕາຕະລາງນີ້ເປັນການຄາດຄະເນ ອາດມີການປ່ຽນແປງຕາມເງື່ອນໄຂ ແລະ ນະໂຍບາຍຂອງບໍລິສັດ
    </div>
    ${docFooter()}
  </div></body></html>`);
}

// ===== 3. LOAN STATUS REPORT =====
function printStatusReport(loan, payments) {
  if (!loan) { showToast('ບໍ່ມີຂໍ້ມູນ', 'error'); return; }
  const total = calcTotal(loan.amount, loan.rate || 1.5, loan.duration);
  const monthly = calcMonthly(loan.amount, loan.rate || 1.5, loan.duration);
  const paid = loan.paidAmount || 0;
  const remain = Math.max(0, total - paid);
  const pct = Math.min(100, Math.round((paid / total) * 100));
  const methodNames = { bcel:'BCEL OnePay', ldb:'LDB', cash:'ເງິນສົດ', transfer:'ໂອນເງິນ' };
  const statusInfo = { pending:'ລໍຖ້າກວດສອບ', approved:'ອະນຸມັດແລ້ວ', active:'ກຳລັງດຳເນີນ', completed:'ສຳເລັດ', rejected:'ປະຕິເສດ' };

  const payRows = payments.length > 0
    ? payments.map((p, i) => `<tr>
        <td style="text-align:center;">${i+1}</td>
        <td>${formatDate(p.date)}</td>
        <td>${p.ref}</td>
        <td>${methodNames[p.method]||p.method}</td>
        <td style="font-weight:700; color:#1b5e20;">${formatMoney(p.amount)}</td>
      </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center; padding:16px; color:#757575;">ຍັງບໍ່ມີການຊຳລະ</td></tr>`;

  printDoc(`<!DOCTYPE html><html lang="lo"><head><meta charset="UTF-8"/>
  <style>${DOC_CSS}</style></head><body>
  <div class="watermark">UNJAI</div>
  <div class="doc-page">
    ${docHeader('ລາຍງານສະຖານະເງິນກູ້', 'Loan Status Report', loan.id)}

    <div class="section-label">👤 ຂໍ້ມູນຜູ້ກູ້</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">ຊື່-ນາມສະກຸນ</div><div class="info-value">${loan.name}</div></div>
      <div class="info-item"><div class="info-label">ເບີໂທລະສັບ</div><div class="info-value">${loan.phone}</div></div>
      <div class="info-item"><div class="info-label">ວັນທີສະໝັກ</div><div class="info-value">${formatDate(loan.createdAt)}</div></div>
      <div class="info-item"><div class="info-label">ສະຖານະ</div>
        <div class="info-value"><span class="status-pill pill-${loan.status}">${statusInfo[loan.status]||'-'}</span></div>
      </div>
    </div>

    <div class="section-label">💰 ຂໍ້ມູນເງິນກູ້</div>
    <div class="info-grid cols3">
      <div class="info-item highlight"><div class="info-label">ວົງເງິນກູ້</div><div class="info-value lg">${formatMoney(loan.amount)}</div></div>
      <div class="info-item highlight"><div class="info-label">ຊຳລະແລ້ວ</div><div class="info-value lg" style="color:#1b5e20;">${formatMoney(paid)}</div></div>
      <div class="info-item highlight"><div class="info-label">ຍັງເຫຼືອ</div><div class="info-value lg" style="color:#c62828;">${formatMoney(remain)}</div></div>
      <div class="info-item"><div class="info-label">ໄລຍະ</div><div class="info-value">${loan.durationDisplay || (loan.duration + ' ເດືອນ')}</div></div>
      <div class="info-item"><div class="info-label">ດອກເບ້ຍ</div><div class="info-value">${loan.rateDisplay || ((loan.rate||1.5) + '% / ເດືອນ')}</div></div>
      <div class="info-item"><div class="info-label">ຄ່າງວດ/ເດືອນ</div><div class="info-value">${formatMoney(monthly)}</div></div>
    </div>

    <div style="position:relative; z-index:1; margin:16px 0 8px;">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#757575; margin-bottom:4px;">
        <span>ຄວາມຄືບໜ້າການຊຳລະ</span><span>${pct}%</span>
      </div>
      <div class="progress-wrap"><div class="progress-bg">
        <div class="progress-fg" style="width:${pct}%;"></div>
      </div></div>
      <div style="display:flex; justify-content:space-between; font-size:10px; color:#757575; margin-top:3px;">
        <span>ຊຳລະ ${formatMoney(paid)}</span><span>ຍັງເຫຼືອ ${formatMoney(remain)}</span>
      </div>
    </div>

    <div class="section-label">🧾 ປະຫວັດການຊຳລະ (${payments.length} ລາຍການ)</div>
    <table class="history-table">
      <thead><tr>
        <th style="text-align:center;">#</th>
        <th>ວັນທີ</th><th>ເລກອ້າງອີງ</th><th>ວິທີ</th><th>ຈຳນວນ (ກີບ)</th>
      </tr></thead>
      <tbody>${payRows}</tbody>
    </table>

    ${docFooter('ເອກະສານນີ້ອອກໂດຍ Unjai Finance. ຕິດຕໍ່ 020 96498301')}
  </div></body></html>`);
}

// ===== 4. PAYMENT RECEIPT =====
function printReceipt(payment, loan) {
  if (!payment || !loan) { showToast('ບໍ່ມີຂໍ້ມູນ', 'error'); return; }
  const total = calcTotal(loan.amount, loan.rate || 1.5, loan.duration);
  const paid = loan.paidAmount || 0;
  const remain = Math.max(0, total - paid);
  const methodNames = { bcel:'BCEL OnePay', ldb:'ທະນາຄານ LDB', cash:'ເງິນສົດ', transfer:'ໂອນເງິນ' };

  printDoc(`<!DOCTYPE html><html lang="lo"><head><meta charset="UTF-8"/>
  <style>${DOC_CSS}</style></head><body>
  <div class="watermark">UNJAI</div>
  <div class="doc-page">
    ${docHeader('ໃບຮັບເງິນຊຳລະ', 'Payment Receipt', payment.ref)}

    <div class="receipt-box">
      <div style="font-size:14px; color:#757575;">ຈຳນວນທີ່ຊຳລະ</div>
      <div class="receipt-amount">${formatMoney(payment.amount)}</div>
      <div class="receipt-ref">ໝາຍເລກ: ${payment.ref}</div>
      <div><span class="receipt-method">${methodNames[payment.method]||payment.method}</span></div>
      <div style="font-size:11px; color:#757575; margin-top:8px;">ວັນ-ເວລາ: ${new Date(payment.date).toLocaleString('lo-LA')}</div>
    </div>

    <div class="section-label">👤 ຂໍ້ມູນຜູ້ຊຳລະ</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">ຊື່-ນາມສະກຸນ</div><div class="info-value">${loan.name}</div></div>
      <div class="info-item"><div class="info-label">ເບີໂທລະສັບ</div><div class="info-value">${loan.phone}</div></div>
      <div class="info-item"><div class="info-label">ລະຫັດຄຳຂໍ</div><div class="info-value">${loan.id}</div></div>
      <div class="info-item"><div class="info-label">ວັນທີຊຳລະ</div><div class="info-value">${formatDate(payment.date)}</div></div>
    </div>

    <div class="section-label">💰 ສຸດທ</div>
    <div class="info-grid cols3">
      <div class="info-item"><div class="info-label">ຍອດລວມທັງໝົດ</div><div class="info-value">${formatMoney(total)}</div></div>
      <div class="info-item highlight"><div class="info-label">ຊຳລະລວມ</div><div class="info-value" style="color:#1b5e20;">${formatMoney(paid)}</div></div>
      <div class="info-item"><div class="info-label">ຍັງເຫຼືອ</div><div class="info-value" style="color:${remain>0?'#c62828':'#1b5e20'};">${remain > 0 ? formatMoney(remain) : '✅ ຊຳລະຄົບ'}</div></div>
    </div>

    <hr class="divider"/>
    <div style="text-align:center; font-size:11px; color:#757575; position:relative; z-index:1; margin-bottom:16px;">
      ✅ ໃບຮັບເງິນນີ້ ເປັນຫຼັກຖານການຊຳລະທີ່ຖືກຕ້ອງ ກະລຸນາເກັບໄວ້ເປັນຫຼັກຖານ
    </div>

    ${docFooter('ສຳລັບຂໍ້ສົງໄສ ຕິດຕໍ່ Unjai Finance 020 96498301')}
  </div></body></html>`);
}
