// ===== SUPABASE CLIENT =====
const SUPABASE_URL = 'https://cucptovzyvrxvhpgppom.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Y3B0b3Z6eXZyeHZocGdwcG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzI4NzgsImV4cCI6MjA2MzEwODg3OH0.Yd3ggSRRpEIAGARIbMGDMBLFCJPNQlpb0DLkZ-9XMXY';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== ROW MAPPERS (snake_case DB → camelCase JS) =====
const mapProduct = r => ({
  id: r.id, name: r.name,
  interestRate: r.interest_rate, interestType: r.interest_type,
  duration: r.duration, minAmount: r.min_amount, maxAmount: r.max_amount,
  description: r.description || '', status: r.status, createdAt: r.created_at,
});
const mapLoan = r => ({
  id: r.id, productId: r.product_id, productName: r.product_name,
  name: r.name, phone: r.phone, idCard: r.id_card, docType: r.doc_type, docImage: r.doc_image,
  occupation: r.occupation, income: r.income, address: r.address, note: r.note || '',
  amount: r.amount, duration: r.duration, totalDue: r.total_due,
  status: r.status, paidAmount: r.paid_amount || 0, createdAt: r.created_at,
});
const mapPayment = r => ({
  id: r.id, loanId: r.loan_id, amount: r.amount, method: r.method,
  note: r.note || '', date: r.date, ref: r.ref,
});
const mapExpense = r => ({
  id: r.id, category: r.category, amount: r.amount, note: r.note || '', date: r.date,
});
const mapDebt = r => ({
  id: r.id, creditor: r.creditor, amount: r.amount, rate: r.rate,
  borrowDate: r.borrow_date, dueDate: r.due_date, note: r.note || '',
  status: r.status, settledDate: r.settled_date, createdAt: r.created_at,
});
const mapDebtPayment = r => ({
  id: r.id, debtId: r.debt_id, amount: r.amount, method: r.method,
  date: r.date, note: r.note || '', createdAt: r.created_at,
});

// ===== DATA STORE =====
const DB = {
  products: [], loans: [], payments: [], expenses: [], debts: [], debtPayments: [],

  async loadAll() {
    const [p, l, pay, exp, dbt, dpay] = await Promise.all([
      sb.from('products').select('*'),
      sb.from('loans').select('*'),
      sb.from('payments').select('*'),
      sb.from('expenses').select('*'),
      sb.from('debts').select('*'),
      sb.from('debt_payments').select('*'),
    ]);
    if (p.error)    console.error('products:', p.error);
    if (l.error)    console.error('loans:', l.error);
    if (pay.error)  console.error('payments:', pay.error);
    if (exp.error)  console.error('expenses:', exp.error);
    if (dbt.error)  console.error('debts:', dbt.error);
    if (dpay.error) console.error('debt_payments:', dpay.error);
    this.products     = (p.data   || []).map(mapProduct);
    this.loans        = (l.data   || []).map(mapLoan);
    this.payments     = (pay.data || []).map(mapPayment);
    this.expenses     = (exp.data || []).map(mapExpense);
    this.debts        = (dbt.data || []).map(mapDebt);
    this.debtPayments = (dpay.data || []).map(mapDebtPayment);
  },

  async addProduct(data) {
    const id = 'PRD' + Date.now().toString().slice(-6);
    const { data: r, error } = await sb.from('products').insert({
      id, name: data.name, interest_rate: data.interestRate, interest_type: data.interestType,
      duration: data.duration, min_amount: data.minAmount, max_amount: data.maxAmount,
      description: data.description || '', status: 'active', created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    const p = mapProduct(r);
    this.products.push(p);
    return p;
  },

  async updateProduct(id, data) {
    const row = {};
    if (data.name         !== undefined) row.name          = data.name;
    if (data.interestRate !== undefined) row.interest_rate = data.interestRate;
    if (data.interestType !== undefined) row.interest_type = data.interestType;
    if (data.duration     !== undefined) row.duration      = data.duration;
    if (data.minAmount    !== undefined) row.min_amount    = data.minAmount;
    if (data.maxAmount    !== undefined) row.max_amount    = data.maxAmount;
    if (data.description  !== undefined) row.description   = data.description;
    if (data.status       !== undefined) row.status        = data.status;
    const { error } = await sb.from('products').update(row).eq('id', id);
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
    const { data: r, error } = await sb.from('loans').insert({
      id, product_id: data.productId, product_name: data.productName,
      name: data.name, phone: data.phone, id_card: data.idCard,
      doc_type: data.docType, doc_image: data.docImage,
      occupation: data.occupation, income: data.income,
      address: data.address, note: data.note || '',
      amount: data.amount, duration: data.duration, total_due: data.totalDue,
      status: 'pending', paid_amount: 0, created_at: new Date().toISOString(),
    }).select().single();
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
    const { error } = await sb.from('loans').delete().eq('id', id);
    if (error) throw error;
    this.loans    = this.loans.filter(l => l.id !== id);
    this.payments = this.payments.filter(p => p.loanId !== id);
  },

  getLoanPayments(loanId) {
    return this.payments.filter(p => p.loanId === loanId);
  },

  async addPayment(loanId, amount, method, note) {
    const ref = 'PAY' + Date.now().toString().slice(-8);
    const loan = this.loans.find(l => l.id === loanId);
    const newPaid = (loan ? loan.paidAmount : 0) + amount;
    const { data: r, error } = await sb.from('payments').insert({
      id: ref, loan_id: loanId, amount, method, note: note || '',
      date: new Date().toISOString(), ref,
    }).select().single();
    if (error) throw error;
    const { error: upErr } = await sb.from('loans').update({ paid_amount: newPaid }).eq('id', loanId);
    if (upErr) throw upErr;
    const payment = mapPayment(r);
    this.payments.push(payment);
    if (loan) loan.paidAmount = newPaid;
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
      id, creditor: data.creditor, amount: data.amount, rate: data.rate,
      borrow_date: data.borrowDate || null, due_date: data.dueDate || null,
      note: data.note || '', status: 'active',
      settled_date: null, created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    const d = mapDebt(r);
    this.debts.push(d);
    return d;
  },

  async updateDebt(id, data) {
    const row = {};
    if (data.status      !== undefined) row.status       = data.status;
    if (data.settledDate !== undefined) row.settled_date = data.settledDate;
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

  async addDebtPayment(debtId, amount, method, payDate, note) {
    const debt = this.debts.find(d => d.id === debtId);
    if (!debt) return null;
    const id = 'DPAY' + Date.now();
    const { data: r, error } = await sb.from('debt_payments').insert({
      id, debt_id: debtId, amount, method: method || 'cash',
      date: payDate ? new Date(payDate).toISOString() : new Date().toISOString(),
      note: note || '', created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    const p = mapDebtPayment(r);
    this.debtPayments.push(p);
    const totalRepaid = this.debtPayments.filter(x => x.debtId === debtId).reduce((s, x) => s + x.amount, 0);
    if (totalRepaid >= debt.amount && debt.status !== 'settled') {
      await this.updateDebt(debtId, { status: 'settled', settledDate: new Date().toISOString() });
    }
    return p;
  },
};

// ===== UTILS =====
function calcLoanTotal(product, amount, customDays) {
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
