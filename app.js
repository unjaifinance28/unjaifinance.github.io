// ===== SUPABASE CLIENT =====
if (!window.supabase) throw new Error('Supabase CDN failed to load. Check the <script> tag order.');
const sb = window.supabase.createClient(
  'https://cucptovzyvrxvhpgppom.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Y3B0b3Z6eXZyeHZocGdwcG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTQxMDcsImV4cCI6MjA5NDY3MDEwN30.IG-Ly_Bv3pmYW5N2jscAQ_MDxXSY-SMX5lOs07aam5Q'
)

// ===== ROW MAPPERS (snake_case DB → camelCase JS) =====
const mapProduct = r => ({
  id: r.id, name: r.name,
  interestRate: r.interest_rate, interestType: r.interest_type,
  duration: r.duration, minAmount: r.min_amount, maxAmount: r.max_amount,
  description: r.description || '', status: r.status, createdAt: r.created_at,
  compound: r.compound || false,
  compoundDays: r.compound_days || 0,
  isVip: r.is_vip || false,
  vipCustomers: r.vip_customers || [],
  paymentType: r.payment_type || 'lump_sum',
});
const mapLoan = r => ({
  id: r.id, productId: r.product_id, productName: r.product_name,
  name: r.name, phone: r.phone, idCard: r.id_card, docType: r.doc_type, docImage: r.doc_image,
  workplace: r.occupation, income: r.income, address: r.address, note: r.note || '',
  amount: r.amount, duration: r.duration, totalDue: r.total_due,
  status: r.status, paidAmount: r.paid_amount || 0, createdAt: r.created_at,
  originalPrincipal: r.original_principal ?? r.amount,
  remainingPrincipal: r.remaining_principal ?? r.amount,
  interestPaid: r.interest_paid || 0,
  originalRate: r.original_rate || null,
  discountedRate: r.discounted_rate || null,
  discountApplied: r.discount_applied || 0,
  discountAmount: r.discount_amount || 0,
  dailyPayment: r.daily_payment || null,
  cycleSettled: r.cycle_settled || false,
});
const mapPayment = r => ({
  id: r.id, loanId: r.loan_id, amount: r.amount, method: r.method,
  note: r.note || '', date: r.date, ref: r.ref,
});
const mapExpense = r => ({
  id: r.id, category: r.category, amount: r.amount, note: r.note || '', date: r.date,
});
const mapDebt = r => ({
  id: r.id, creditor: r.creditor, amount: r.amount, rate: r.interest_rate,
  borrowDate: r.borrow_date, dueDate: r.due_date, note: r.note || '',
  status: r.status, createdAt: r.created_at,
});
const mapDebtPayment = r => ({
  id: r.id, debtId: r.debt_id, amount: r.amount, method: r.method,
  date: r.date, note: r.note || '',
});
const mapTopup = r => ({
  id: r.id, loanId: r.loan_id, amount: r.amount, note: r.note || '', date: r.date,
});
const mapCompoundHistory = r => ({
  id: r.id, loanId: r.loan_id,
  type: r.type || 'compound',
  oldPrincipal: r.old_principal, unpaidInterest: r.unpaid_interest,
  newPrincipal: r.new_principal, newTotalDue: r.new_total_due,
  note: r.note || '', date: r.date,
});
const mapVipInvitation = r => ({
  id: r.id, loanId: r.loan_id, productId: r.product_id,
  phone: r.phone, note: r.note || '', createdAt: r.created_at,
});
const mapCreditScore = r => ({
  id: r.id, loanId: r.loan_id,
  year: r.year,
  monthMarks: r.month_marks || {},
  score: r.score ?? 100,
  eligible: r.eligible ?? false,
  discountPercent: r.discount_percent || 0,
  discountApproved: r.discount_approved ?? false,
  discountUsed: r.discount_used ?? false,
  note: r.note || '',
  createdAt: r.created_at,
});

// ===== DATA STORE =====
// Supabase SQL migration — run once:
// alter table products add column if not exists compound_days int default 0;
// alter table loans add column if not exists original_principal numeric;
// alter table loans add column if not exists remaining_principal numeric;
// alter table loans add column if not exists interest_paid numeric default 0;
// update loans set original_principal = amount where original_principal is null;
// update loans set remaining_principal = amount where remaining_principal is null;
// alter table products add column if not exists payment_type text default 'lump_sum';
// alter table loans add column if not exists daily_payment numeric;
// alter table loans add column if not exists cycle_settled boolean default false;

// Supabase SQL — run once to create the compound_history table:
// create table compound_history (
//   id text primary key,
//   loan_id text,
//   type text default 'compound',   -- 'compound' | 'cycle_interest'
//   old_principal numeric,
//   unpaid_interest numeric,
//   new_principal numeric,
//   new_total_due numeric,
//   note text,
//   date timestamptz default now()
// );
// alter table compound_history add column if not exists type text default 'compound';
// alter table compound_history enable row level security;
// create policy "allow all" on compound_history for all using (true) with check (true);

// Supabase SQL — VIP Product System (run once):
// alter table products add column if not exists is_vip boolean default false;
// alter table products add column if not exists vip_customers jsonb default '[]';
// create table vip_invitations (
//   id text primary key, loan_id text, product_id text,
//   phone text, note text, created_at timestamptz default now()
// );
// alter table vip_invitations enable row level security;
// create policy "allow all" on vip_invitations for all using (true) with check (true);

// Supabase SQL — Annual Credit Score System (run once):
// create table credit_scores (
//   id text primary key, loan_id text, year int,
//   month_marks jsonb default '{}', score int default 100,
//   eligible boolean default false, discount_percent numeric default 0,
//   discount_approved boolean default false, discount_used boolean default false,
//   note text, created_at timestamptz default now()
// );
// alter table credit_scores enable row level security;
// create policy "allow all" on credit_scores for all using (true) with check (true);
// alter table loans add column if not exists original_rate numeric;
// alter table loans add column if not exists discounted_rate numeric;
// alter table loans add column if not exists discount_applied numeric default 0;

// Supabase SQL — run once to create the topups table:
// create table topups (
//   id text primary key,
//   loan_id text,
//   amount numeric,
//   note text,
//   date timestamptz default now()
// );
// alter table topups enable row level security;
// create policy "allow all" on topups for all using (true) with check (true);

const DB = {
  products: [], loans: [], payments: [], expenses: [], debts: [], debtPayments: [], topups: [], compoundHistory: [], creditScores: [], vipInvitations: [],

  async loadAll() {
    console.log('[DB] loadAll: fetching from Supabase...');
    const [p, l, pay, exp, dbt, dpay, top, cph, cs, vi] = await Promise.all([
      sb.from('products').select('*'),
      sb.from('loans').select('*'),
      sb.from('payments').select('*'),
      sb.from('expenses').select('*'),
      sb.from('debts').select('*'),
      sb.from('debt_payments').select('*'),
      sb.from('topups').select('*'),
      sb.from('compound_history').select('*'),
      sb.from('credit_scores').select('*'),
      sb.from('vip_invitations').select('*'),
    ]);
    // Core tables — fail loudly if missing
    const errors = [
      p.error   && `products: ${p.error.message}`,
      l.error   && `loans: ${l.error.message}`,
      pay.error && `payments: ${pay.error.message}`,
      exp.error && `expenses: ${exp.error.message}`,
      dbt.error && `debts: ${dbt.error.message}`,
      dpay.error && `debt_payments: ${dpay.error.message}`,
    ].filter(Boolean);
    if (errors.length) {
      console.error('[DB] loadAll errors:', errors);
      throw new Error(errors.join(' | '));
    }
    this.products     = (p.data   || []).map(mapProduct);
    this.loans        = (l.data   || []).map(mapLoan);
    this.payments     = (pay.data || []).map(mapPayment);
    this.expenses     = (exp.data || []).map(mapExpense);
    this.debts        = (dbt.data || []).map(mapDebt);
    this.debtPayments = (dpay.data || []).map(mapDebtPayment);
    // Optional tables — warn and default to [] if not yet created
    if (top.error) console.warn('[DB] topups not ready:', top.error.message);
    if (cph.error) console.warn('[DB] compound_history not ready:', cph.error.message);
    if (cs.error)  console.warn('[DB] credit_scores not ready:', cs.error.message);
    if (vi.error)  console.warn('[DB] vip_invitations not ready:', vi.error.message);
    this.topups          = top.error ? [] : (top.data || []).map(mapTopup);
    this.compoundHistory = cph.error ? [] : (cph.data || []).map(mapCompoundHistory);
    this.creditScores    = cs.error  ? [] : (cs.data  || []).map(mapCreditScore);
    this.vipInvitations  = vi.error  ? [] : (vi.data  || []).map(mapVipInvitation);
    console.log(`[DB] loadAll: ${this.products.length} products, ${this.loans.length} loans, ${this.payments.length} payments`);
  },

  async addProduct(data) {
    const id = 'PRD' + Date.now().toString().slice(-6);
    const core = {
      id, name: data.name, interest_rate: data.interestRate, interest_type: data.interestType,
      duration: data.duration, min_amount: data.minAmount, max_amount: data.maxAmount,
      description: data.description || '', status: 'active', created_at: new Date().toISOString(),
    };
    let { data: r, error } = await sb.from('products').insert({
      ...core,
      compound: data.compound || false,
      compound_days: data.compoundDays || 0,
      is_vip: data.isVip || false,
      vip_customers: data.vipCustomers || [],
      payment_type: data.paymentType || 'lump_sum',
    }).select().single();
    if (error) ({ data: r, error } = await sb.from('products').insert(core).select().single());
    if (error) throw error;
    const p = mapProduct(r);
    this.products.push(p);
    return p;
  },

  async updateProduct(id, data) {
    const core = {};
    if (data.name         !== undefined) core.name          = data.name;
    if (data.interestRate !== undefined) core.interest_rate = data.interestRate;
    if (data.interestType !== undefined) core.interest_type = data.interestType;
    if (data.duration     !== undefined) core.duration      = data.duration;
    if (data.minAmount    !== undefined) core.min_amount    = data.minAmount;
    if (data.maxAmount    !== undefined) core.max_amount    = data.maxAmount;
    if (data.description  !== undefined) core.description   = data.description;
    if (data.status       !== undefined) core.status        = data.status;
    const ext = {};
    if (data.compound     !== undefined) ext.compound       = data.compound;
    if (data.compoundDays !== undefined) ext.compound_days  = data.compoundDays;
    if (data.isVip        !== undefined) ext.is_vip         = data.isVip;
    if (data.vipCustomers !== undefined) ext.vip_customers  = data.vipCustomers;
    if (data.paymentType  !== undefined) ext.payment_type   = data.paymentType;
    let { error } = await sb.from('products').update({ ...core, ...ext }).eq('id', id);
    if (error && Object.keys(ext).length) {
      ({ error } = await sb.from('products').update(core).eq('id', id));
    }
    if (error) throw error;
    const i = this.products.findIndex(p => p.id === id);
    if (i >= 0) this.products[i] = { ...this.products[i], ...data };
  },

  async deleteProduct(id) {
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw error;
    this.products = this.products.filter(p => p.id !== id);
  },

  async addLoan(data) {
    const id = 'LAO' + Date.now().toString().slice(-6);
    const core = {
      id, product_id: data.productId, product_name: data.productName,
      name: data.name, phone: data.phone, id_card: data.idCard,
      doc_type: data.docType, doc_image: data.docImage,
      occupation: data.workplace, income: data.income,
      address: data.address, note: data.note || '',
      amount: data.amount, duration: data.duration, total_due: data.totalDue,
      status: 'pending', paid_amount: 0,
      created_at: new Date().toISOString(),
    };
    // Try with interest-tracking columns; fall back to core if migrations not yet run
    let { data: r, error } = await sb.from('loans').insert({
      ...core,
      original_principal: data.amount,
      remaining_principal: data.amount,
      interest_paid: 0,
      daily_payment: data.dailyPayment || null,
    }).select().single();
    if (error) ({ data: r, error } = await sb.from('loans').insert(core).select().single());
    if (error) throw error;
    const loan = mapLoan(r);
    this.loans.push(loan);
    return loan;
  },

  async updateLoanStatus(id, newStatus) {
    const { error } = await sb.from('loans').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
    const loan = this.loans.find(l => l.id === id);
    if (loan) loan.status = newStatus;
  },

  async deleteLoan(id) {
    await sb.from('payments').delete().eq('loan_id', id);
    await sb.from('topups').delete().eq('loan_id', id);
    await sb.from('compound_history').delete().eq('loan_id', id);
    await sb.from('credit_scores').delete().eq('loan_id', id);
    await sb.from('vip_invitations').delete().eq('loan_id', id);
    const { error } = await sb.from('loans').delete().eq('id', id);
    if (error) throw error;
    this.loans           = this.loans.filter(l => l.id !== id);
    this.payments        = this.payments.filter(p => p.loanId !== id);
    this.topups          = this.topups.filter(t => t.loanId !== id);
    this.compoundHistory = this.compoundHistory.filter(h => h.loanId !== id);
    this.creditScores    = this.creditScores.filter(s => s.loanId !== id);
    this.vipInvitations  = this.vipInvitations.filter(v => v.loanId !== id);
  },

  getLoanPayments(loanId) {
    return this.payments.filter(p => p.loanId === loanId);
  },

  getLoanTopups(loanId) {
    return this.topups.filter(t => t.loanId === loanId);
  },

  getCompoundHistory(loanId) {
    return this.compoundHistory.filter(h => h.loanId === loanId);
  },

  async addCompoundInterest(loanId, note) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('ບໍ່ພົບສັນຍາກູ້');
    const product = this.products.find(p => p.id === loan.productId);
    if (!product) throw new Error('ບໍ່ພົບຜະລິດຕະພັນ');

    const curPrincipal = loan.remainingPrincipal ?? loan.amount;
    const interestDue  = Math.max(0, loan.totalDue - curPrincipal);
    if (interestDue <= 0) throw new Error('ດອກຊຳລະຄົບແລ້ວ — ບໍ່ຕ້ອງທົບຕົ້ນ');

    const newPrincipal  = curPrincipal + interestDue;
    const effectiveRate = loan.discountedRate != null ? loan.discountedRate : product.interestRate;
    const effProduct    = { ...product, interestRate: effectiveRate };
    const cycleInterest = Math.round(newPrincipal * effectiveRate / 100);
    const newTotalDue   = calcLoanTotal(effProduct, newPrincipal, loan.duration);
    const id = 'CPD' + Date.now();

    const { data: hr, error: herr } = await sb.from('compound_history').insert({
      id, loan_id: loanId,
      old_principal:   curPrincipal,
      unpaid_interest: interestDue,
      new_principal:   newPrincipal,
      new_total_due:   newTotalDue,
      note: note || '',
      date: new Date().toISOString(),
    }).select().single();
    if (herr) throw herr;

    // Append a human-readable line to the loan notes (in addition to compound_history).
    const noteLine = `ທົບຕົ້ນ ${new Date().toLocaleDateString('lo-LA')}: +${formatMoney(interestDue)}`;
    const newNote  = loan.note ? `${loan.note}\n${noteLine}` : noteLine;

    // cycle_settled = true closes the rolled-over cycle: the unpaid interest is now part of
    // the principal and the new (higher-principal) cycle starts fresh, so nothing is shown as
    // still-owed and the compound decision does not immediately re-trigger on the same loan.
    const cycleStartDate = new Date().toISOString();
    let { error: upErr } = await sb.from('loans').update({
      remaining_principal: newPrincipal,
      total_due:           newTotalDue,
      interest_paid:       0,
      cycle_settled:       true,
      note:                newNote,
      cycle_start_date:    cycleStartDate,
      cycle_interest:      cycleInterest,
    }).eq('id', loanId);
    if (upErr) {
      const { error: upErr2 } = await sb.from('loans').update({ total_due: newTotalDue, note: newNote }).eq('id', loanId);
      if (upErr2) throw upErr2;
    }

    this.compoundHistory.push(mapCompoundHistory(hr));
    loan.remainingPrincipal = newPrincipal;
    loan.totalDue           = newTotalDue;
    loan.interestPaid       = 0;
    loan.cycleSettled       = true;
    loan.cycleStartDate     = cycleStartDate;
    loan.cycleInterest      = cycleInterest;
    loan.note               = newNote;
  },

  // Charge a new interest cycle manually. Inserts a 'cycle_interest' record into
  // compound_history and bumps total_due so the next payment splits correctly.
  // Only allowed when the previous cycle is fully settled (no outstanding interest).
  async addCycleInterest(loanId) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('ບໍ່ພົບສັນຍາກູ້');
    const product = this.products.find(p => p.id === loan.productId);
    if (!product) throw new Error('ບໍ່ພົບຜະລິດຕະພັນ');

    const principal   = loan.remainingPrincipal ?? loan.amount;
    const interestDue = Math.max(0, (loan.totalDue || 0) - principal);
    if (interestDue > 0) throw new Error('ດອກງວດກ່ອນຍັງຄ້າງຢູ່ — ກະລຸນາຊຳລະດອກເກົ່າກ່ອນ');

    if (product.paymentType === 'daily_installment')
      throw new Error('ສິນຄ້ານີ້ເປັນການຜ່ອນລາຍວັນ — ດອກຄິດໄວ້ລ່ວງໜ້າແລ້ວ ບໍ່ຕ້ອງຄິດໃໝ່');

    const effectiveRate = loan.discountedRate != null ? loan.discountedRate : product.interestRate;
    if (effectiveRate === 0) throw new Error('ດອກ 0% — ບໍ່ຕ້ອງຄິດດອກ');

    const effProduct     = { ...product, interestRate: effectiveRate };
    const interestAmount = Math.max(0, Math.round(calcLoanTotal(effProduct, principal, loan.duration) - principal));
    if (interestAmount <= 0) throw new Error('ດອກທີ່ຄຳນວນໄດ້ເທົ່າກັບ 0');

    const newTotalDue = principal + interestAmount;
    const id = 'CIN' + Date.now();

    const { data: hr, error: herr } = await sb.from('compound_history').insert({
      id, loan_id: loanId,
      type:            'cycle_interest',
      old_principal:   principal,
      unpaid_interest: interestAmount,
      new_principal:   principal,
      new_total_due:   newTotalDue,
      note:            '',
      date:            new Date().toISOString(),
    }).select().single();
    if (herr) throw herr;

    const { error: upErr } = await sb.from('loans').update({ total_due: newTotalDue }).eq('id', loanId);
    if (upErr) throw upErr;

    this.compoundHistory.push(mapCompoundHistory(hr));
    loan.totalDue = newTotalDue;
  },

  // Reject / waive compounding: write off the unpaid interest for the current cycle and
  // close it. The customer is then left owing only the principal; interest_paid (real cash
  // collected) is preserved so the admin interest-earned reports stay accurate.
  async rejectCompoundInterest(loanId) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('ບໍ່ພົບສັນຍາກູ້');

    const curPrincipal = loan.remainingPrincipal ?? loan.amount;
    const interestDue  = Math.max(0, (loan.totalDue || 0) - curPrincipal);
    if (interestDue <= 0) throw new Error('ບໍ່ມີດອກຄ້າງ');

    const newTotalDue = curPrincipal; // unpaid interest written off
    const noteLine = `ປະຕິເສດທົບຕົ້ນ ${new Date().toLocaleDateString('lo-LA')}: ຍົກເວັ້ນດອກ ${formatMoney(interestDue)}`;
    const newNote  = loan.note ? `${loan.note}\n${noteLine}` : noteLine;

    let { error: upErr } = await sb.from('loans').update({
      total_due:     newTotalDue,
      cycle_settled: true,
      note:          newNote,
    }).eq('id', loanId);
    if (upErr) {
      const { error: upErr2 } = await sb.from('loans').update({ total_due: newTotalDue, note: newNote }).eq('id', loanId);
      if (upErr2) throw upErr2;
    }

    loan.totalDue     = newTotalDue;
    loan.cycleSettled = true;
    loan.note         = newNote;
  },

  async addTopup(loanId, amount, note) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('ບໍ່ພົບສັນຍາກູ້');
    const product = this.products.find(p => p.id === loan.productId);
    if (!product) throw new Error('ບໍ່ພົບຜະລິດຕະພັນ');
    const id = 'TOP' + Date.now();
    const { data: r, error } = await sb.from('topups').insert({
      id, loan_id: loanId, amount, note: note || '', date: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    const newAmount             = loan.amount + amount;
    const newOriginalPrincipal  = (loan.originalPrincipal ?? loan.amount) + amount;
    const newRemainingPrincipal = (loan.remainingPrincipal ?? loan.amount) + amount;
    // Interest is NOT pre-baked here — admin charges it manually via addCycleInterest.
    // total_due = principal only; the "ຄິດດອກໃໝ່" button will add interest when ready.
    const effectiveRate  = loan.discountedRate != null ? loan.discountedRate : product.interestRate;
    const newTotalDue    = newRemainingPrincipal;
    const cycleInterest  = Math.round(newRemainingPrincipal * effectiveRate / 100);
    const cycleStartDate = new Date().toISOString();
    // cycle_settled = true closes the current interest cycle: the payment made before the
    // top-up counts as full settlement, so the loan detail page shows 0 still-owed and no
    // compound warning for this cycle. (Compounding likewise closes its rolled-over cycle.)
    let { error: upErr } = await sb.from('loans').update({
      amount: newAmount, total_due: newTotalDue,
      original_principal:  newOriginalPrincipal,
      remaining_principal: newRemainingPrincipal,
      cycle_settled:       true,
      cycle_start_date:    cycleStartDate,
      cycle_interest:      cycleInterest,
    }).eq('id', loanId);
    if (upErr) {
      const { error: upErr2 } = await sb.from('loans').update({
        amount: newAmount, total_due: newTotalDue,
      }).eq('id', loanId);
      if (upErr2) throw upErr2;
    }
    this.topups.push(mapTopup(r));
    loan.amount              = newAmount;
    loan.totalDue            = newTotalDue;
    loan.originalPrincipal   = newOriginalPrincipal;
    loan.remainingPrincipal  = newRemainingPrincipal;
    loan.cycleSettled        = true;
    loan.cycleStartDate      = cycleStartDate;
    loan.cycleInterest       = cycleInterest;
  },

  // Recalculate total_due from the ORIGINAL loan amount and the product's current rate.
  // Fixes loans whose total_due was saved incorrectly at creation time. Honours a
  // Credit-Score discount if one was applied (uses discountedRate when present), and
  // respects the product's interest type (flat vs daily) via calcLoanTotal.
  async recalcTotalDue(loanId) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('ບໍ່ພົບສັນຍາກູ້');
    const product = this.products.find(p => p.id === loan.productId);
    if (!product) throw new Error('ບໍ່ພົບຜະລິດຕະພັນ');
    const effectiveRate = loan.discountedRate != null ? loan.discountedRate : product.interestRate;
    const effProduct    = { ...product, interestRate: effectiveRate };
    const oldTotalDue   = loan.totalDue;
    const newTotalDue   = calcLoanTotal(effProduct, loan.amount, loan.duration);
    console.log('[recalcTotalDue]', loanId, {
      amount: loan.amount, duration: loan.duration,
      productRate: product.interestRate, interestType: product.interestType,
      discountedRate: loan.discountedRate, effectiveRate,
      oldTotalDue, newTotalDue,
    });
    const { error } = await sb.from('loans').update({ total_due: newTotalDue }).eq('id', loanId);
    if (error) throw error;
    loan.totalDue = newTotalDue;
    return { oldTotalDue, newTotalDue };
  },

  async addPayment(loanId, amount, method, note) {
    const ref  = 'PAY' + Date.now().toString().slice(-8);
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('ບໍ່ພົບສັນຍາກູ້');

    const curPrincipal = loan.remainingPrincipal ?? loan.amount;
    const interestDue  = Math.max(0, loan.totalDue - curPrincipal);
    const isZeroInterest = (loan.totalDue || 0) <= (loan.amount || 0);

    let interestCollected, principalReduced;
    if (isZeroInterest || interestDue === 0) {
      // 0% interest loan — entire payment reduces principal directly
      interestCollected = 0;
      principalReduced  = amount;
    } else if (amount >= interestDue) {
      interestCollected = interestDue;
      principalReduced  = amount - interestDue;
    } else {
      interestCollected = amount;
      principalReduced  = 0;
    }

    const newRemainingPrincipal = Math.max(0, curPrincipal - principalReduced);
    const newTotalDue           = Math.max(0, loan.totalDue - amount);
    const newPaid               = (loan.paidAmount || 0) + amount;
    const newInterestPaid       = (loan.interestPaid || 0) + interestCollected;

    const { data: r, error } = await sb.from('payments').insert({
      id: ref, loan_id: loanId, amount, method, note: note || '',
      date: new Date().toISOString(), ref,
    }).select().single();
    if (error) throw error;
    // Try full update with tracking columns; fall back to minimal if columns missing
    let { error: upErr } = await sb.from('loans').update({
      paid_amount:           newPaid,
      remaining_principal:   newRemainingPrincipal,
      total_due:             newTotalDue,
      interest_paid:         newInterestPaid,
    }).eq('id', loanId);
    if (upErr) {
      const { error: upErr2 } = await sb.from('loans').update({
        paid_amount: newPaid,
        total_due:   newTotalDue,
      }).eq('id', loanId);
      if (upErr2) throw upErr2;
    }
    const payment = mapPayment(r);
    this.payments.push(payment);
    loan.paidAmount          = newPaid;
    loan.remainingPrincipal  = newRemainingPrincipal;
    loan.totalDue            = newTotalDue;
    loan.interestPaid        = newInterestPaid;
    return payment;
  },

  async addExpense(data) {
    const id = 'EXP' + Date.now();
    const { data: r, error } = await sb.from('expenses').insert({
      id, category: data.category, amount: data.amount,
      note: data.note || '', date: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    const e = mapExpense(r);
    this.expenses.push(e);
    return e;
  },

  async deleteExpense(id) {
    const { error } = await sb.from('expenses').delete().eq('id', id);
    if (error) throw error;
    this.expenses = this.expenses.filter(e => e.id !== id);
  },

  async addDebt(data) {
    const id = 'DBT' + Date.now();
    const { data: r, error } = await sb.from('debts').insert({
      id, creditor: data.creditor, amount: data.amount, interest_rate: data.rate,
      borrow_date: data.borrowDate || null, due_date: data.dueDate || null,
      note: data.note || '', status: 'active',
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    const d = mapDebt(r);
    this.debts.push(d);
    return d;
  },

  async updateDebt(id, data) {
    const row = {};
    if (data.status !== undefined) row.status = data.status;
    const { error } = await sb.from('debts').update(row).eq('id', id);
    if (error) throw error;
    const i = this.debts.findIndex(d => d.id === id);
    if (i >= 0) this.debts[i] = { ...this.debts[i], ...data };
  },

  async deleteDebt(id) {
    await sb.from('debt_payments').delete().eq('debt_id', id);
    const { error } = await sb.from('debts').delete().eq('id', id);
    if (error) throw error;
    this.debts        = this.debts.filter(d => d.id !== id);
    this.debtPayments = this.debtPayments.filter(p => p.debtId !== id);
  },

  // ====== VIP METHODS ======
  async addVipInvitation(loanId, productId, phone, note) {
    const id = 'VIP' + Date.now();
    const cleanPhone = phone.replace(/\s/g, '');
    const { data: r, error } = await sb.from('vip_invitations').insert({
      id, loan_id: loanId, product_id: productId,
      phone: cleanPhone, note: note || '',
    }).select().single();
    if (error) throw error;
    this.vipInvitations.push(mapVipInvitation(r));
    // Also add phone to product's vip_customers if not already there
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const existing = (product.vipCustomers || []).map(v => v.replace(/\D/g, ''));
      if (!existing.includes(cleanPhone.replace(/\D/g, ''))) {
        const newPhones = [...(product.vipCustomers || []), cleanPhone];
        await this.updateProduct(productId, { vipCustomers: newPhones });
      }
    }
  },

  // ====== CREDIT SCORE METHODS ======
  async getOrCreateCreditScore(loanId, year) {
    let cs = this.creditScores.find(s => s.loanId === loanId && s.year === year);
    if (cs) return cs;
    const id = 'CS' + loanId + '_' + year;
    const { data: r, error } = await sb.from('credit_scores').insert({
      id, loan_id: loanId, year, month_marks: {}, score: 100,
      eligible: false, discount_percent: 0,
      discount_approved: false, discount_used: false, note: '',
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    cs = mapCreditScore(r);
    this.creditScores.push(cs);
    return cs;
  },

  async updateMonthMark(loanId, year, month, status) {
    const cs = await this.getOrCreateCreditScore(loanId, year);
    const newMarks = { ...cs.monthMarks };
    if (status === '') {
      delete newMarks[month];
    } else {
      newMarks[month] = status;
    }
    const marks         = Object.values(newMarks);
    const lateCount     = marks.filter(m => m === 'late').length;
    const compoundCount = marks.filter(m => m === 'compound').length;
    const newScore      = Math.max(0, 100 - lateCount * 5 - compoundCount * 15);
    const loan          = this.loans.find(l => l.id === loanId);
    const loanYear      = loan ? new Date(loan.createdAt).getFullYear() : year;
    const onTimeCount   = marks.filter(m => m === 'normal').length;
    const eligible      = loanYear < year && onTimeCount >= 10 && compoundCount === 0;
    const { error } = await sb.from('credit_scores').update({
      month_marks: newMarks, score: newScore, eligible,
    }).eq('id', cs.id);
    if (error) throw error;
    cs.monthMarks = newMarks;
    cs.score      = newScore;
    cs.eligible   = eligible;
  },

  async saveDiscount(loanId, year, discountPercent, note) {
    const cs = await this.getOrCreateCreditScore(loanId, year);
    const { error } = await sb.from('credit_scores').update({
      discount_percent: discountPercent,
      discount_approved: true,
      note: note || '',
    }).eq('id', cs.id);
    if (error) throw error;
    cs.discountPercent  = discountPercent;
    cs.discountApproved = true;
    cs.note             = note || '';
  },

  getCustomerDiscount(phone) {
    const loans = this.loans.filter(l => l.phone.replace(/\D/g,'') === phone.replace(/\D/g,''));
    for (const loan of loans) {
      const cs = this.creditScores.find(
        s => s.loanId === loan.id && s.discountApproved && !s.discountUsed && s.discountPercent > 0
      );
      if (cs) return { cs, loan };
    }
    return null;
  },

  async markDiscountUsed(scoreId) {
    const { error } = await sb.from('credit_scores').update({ discount_used: true }).eq('id', scoreId);
    if (error) throw error;
    const cs = this.creditScores.find(s => s.id === scoreId);
    if (cs) cs.discountUsed = true;
  },

  async addDebtPayment(debtId, amount, method, payDate, note) {
    const debt = this.debts.find(d => d.id === debtId);
    if (!debt) return null;
    const id = 'DPAY' + Date.now();
    const { data: r, error } = await sb.from('debt_payments').insert({
      id, debt_id: debtId, amount, method: method || 'cash',
      date: payDate ? new Date(payDate).toISOString() : new Date().toISOString(),
      note: note || '',
    }).select().single();
    if (error) throw error;
    const p = mapDebtPayment(r);
    this.debtPayments.push(p);
    const totalRepaid = this.debtPayments.filter(x => x.debtId === debtId).reduce((s, x) => s + x.amount, 0);
    if (totalRepaid >= debt.amount && debt.status !== 'settled') {
      await this.updateDebt(debtId, { status: 'settled' });
    }
    return p;
  },
};

// ===== UTILS =====
function calcLoanTotal(product, amount, customDays) {
  if (product.interestRate === 0) return amount;
  const days = customDays || product.duration || 30;
  if (product.interestType === 'flat')
    return Math.round(amount * (1 + product.interestRate / 100));
  return Math.round(amount * (1 + (product.interestRate / 100) * days));
}

function formatMoney(n) {
  if (n == null || isNaN(n)) return '0 ກີບ';
  return new Intl.NumberFormat('lo-LA').format(Math.round(n)) + ' ກີບ';
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('lo-LA', { year:'numeric', month:'long', day:'numeric' });
}

function showToast(msg, type='success') {
  let t = document.getElementById('toast');
  if (!t) { t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3200);
}

// ===== MONEY INPUT FORMATTING =====
function formatMoneyInput(input) {
  let val = input.value.replace(/,/g, '').replace(/[^0-9]/g, '');
  if (val) input.value = parseInt(val).toLocaleString('en-US');
  else input.value = '';
}
function getMoneyValue(input) {
  return parseFloat((input.value || '').replace(/,/g, '')) || 0;
}

// ===== WORKPLACE OPTIONS =====
async function loadWorkplaceOptions() {
  const DEFAULTS = ["ພະນັກງານລັດ","ພະນັກງານເອກະຊົນ","ເຈົ້າຂອງທຸລະກິດ","ຄ້າຂາຍ","ອາວະກາດສຶກສາ","ອື່ນໆ"];
  try {
    const { data } = await sb.from('app_settings').select('value').eq('key','workplace_options').single();
    if (data?.value) {
      const opts = JSON.parse(data.value);
      if (Array.isArray(opts) && opts.length) return opts;
    }
  } catch(e) {}
  return DEFAULTS;
}

// ===== ARROW KEY NAVIGATION between form fields =====
document.addEventListener('keydown', function(e) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const el = e.target;
  if (el.tagName !== 'INPUT') return;
  const t = (el.type || '').toLowerCase();
  if (['checkbox', 'radio', 'file', 'submit', 'button', 'reset', 'number'].includes(t)) return;
  e.preventDefault();
  const dir = e.key === 'ArrowDown' ? 1 : -1;
  const all = Array.from(document.querySelectorAll(
    'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
  )).filter(el => {
    if (el.offsetParent === null) return false;
    const s = window.getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden';
  });
  const idx = all.indexOf(el);
  if (idx !== -1 && all[idx + dir]) all[idx + dir].focus();
});
