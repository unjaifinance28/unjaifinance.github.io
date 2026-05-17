// ===== DATA STORE =====
const DB = {
  products: JSON.parse(localStorage.getItem('lao_products') || '[]'),
  loans:    JSON.parse(localStorage.getItem('lao_loans')    || '[]'),
  payments: JSON.parse(localStorage.getItem('lao_payments') || '[]'),
  expenses: JSON.parse(localStorage.getItem('lao_expenses') || '[]'),
  debts:        JSON.parse(localStorage.getItem('lao_debts')         || '[]'),
  debtPayments: JSON.parse(localStorage.getItem('lao_debt_payments') || '[]'),

  save() {
    localStorage.setItem('lao_products',      JSON.stringify(this.products));
    localStorage.setItem('lao_loans',         JSON.stringify(this.loans));
    localStorage.setItem('lao_payments',      JSON.stringify(this.payments));
    localStorage.setItem('lao_expenses',      JSON.stringify(this.expenses));
    localStorage.setItem('lao_debts',         JSON.stringify(this.debts));
    localStorage.setItem('lao_debt_payments', JSON.stringify(this.debtPayments));
  },

  addProduct(data) {
    const id = 'PRD' + Date.now().toString().slice(-6);
    const p = { id, ...data, status: 'active', createdAt: new Date().toISOString() };
    this.products.push(p);
    this.save();
    return p;
  },
  updateProduct(id, data) {
    const i = this.products.findIndex(p => p.id === id);
    if (i >= 0) { this.products[i] = { ...this.products[i], ...data }; this.save(); }
  },
  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.save();
  },

  addLoan(data) {
    const id = 'LAO' + Date.now().toString().slice(-6);
    const loan = { id, ...data, status: 'pending', createdAt: new Date().toISOString(), paidAmount: 0 };
    this.loans.push(loan);
    this.save();
    return loan;
  },
  getLoanPayments(loanId) {
    return this.payments.filter(p => p.loanId === loanId);
  },
  addPayment(loanId, amount, method, note) {
    const ref = 'PAY' + Date.now().toString().slice(-8);
    const loan = this.loans.find(l => l.id === loanId);
    if (loan) {
      loan.paidAmount = (loan.paidAmount || 0) + amount;
    }
    const payment = { id: ref, loanId, amount, method, note: note || '', date: new Date().toISOString(), ref };
    this.payments.push(payment);
    this.save();
    return payment;
  },
  addExpense(data) {
    const e = { id: 'EXP' + Date.now(), date: new Date().toISOString(), ...data };
    this.expenses.push(e);
    this.save();
    return e;
  },

  addDebt(data) {
    const d = { id: 'DBT' + Date.now(), status: 'active', settledDate: null, createdAt: new Date().toISOString(), ...data };
    this.debts.push(d);
    this.save();
    return d;
  },
  updateDebt(id, data) {
    const i = this.debts.findIndex(d => d.id === id);
    if (i >= 0) { this.debts[i] = { ...this.debts[i], ...data }; this.save(); }
  },
  deleteDebt(id) {
    this.debts = this.debts.filter(d => d.id !== id);
    this.debtPayments = this.debtPayments.filter(p => p.debtId !== id);
    this.save();
  },
  addDebtPayment(debtId, amount, method, payDate, note) {
    const debt = this.debts.find(d => d.id === debtId);
    if (!debt) return null;
    const p = {
      id: 'DPAY' + Date.now(),
      debtId, amount,
      method: method || 'cash',
      date: payDate ? new Date(payDate).toISOString() : new Date().toISOString(),
      note: note || '',
      createdAt: new Date().toISOString()
    };
    this.debtPayments.push(p);
    const totalRepaid = this.debtPayments.filter(x => x.debtId === debtId).reduce((s, x) => s + x.amount, 0);
    if (totalRepaid >= debt.amount && debt.status !== 'settled') {
      debt.status = 'settled';
      debt.settledDate = new Date().toISOString();
    }
    this.save();
    return p;
  }
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
