'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import BackButton from '@/components/BackButton/BackButton';
import styles from './expense-splitter.module.css';

interface Split {
  [person: string]: number;
}

interface Transaction {
  id: number;
  title: string;
  amount: number;
  paidBy: string;
  splits: Split;
  date: string;
}

interface Settlement {
  from: string;
  to: string;
  amt: number;
}

export default function ExpenseSplitterClient() {
  const [people, setPeople] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClient, setIsClient] = useState(false);

  // New Person
  const [newPersonName, setNewPersonName] = useState('');

  // New Expense
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [equalChecks, setEqualChecks] = useState<{ [person: string]: boolean }>({});
  const [customSplits, setCustomSplits] = useState<{ [person: string]: string }>({});
  const [percentSplits, setPercentSplits] = useState<{ [person: string]: string }>({});

  // Tabs
  const [activeTab, setActiveTab] = useState<'txn' | 'balance' | 'settle'>('txn');

  // Modals
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const [confirmModal, setConfirmModal] = useState<{ show: boolean, msg: string, onResolve: ((val: boolean) => void) | null }>({ show: false, msg: '', onResolve: null });
  const [editModal, setEditModal] = useState<{ show: boolean, value: string, idx: number }>({ show: false, value: '', idx: -1 });

  // Init
  useEffect(() => {
    setIsClient(true);
    const p = JSON.parse(localStorage.getItem('splitter-people') || '[]');
    const t = JSON.parse(localStorage.getItem('splitter-transactions') || '[]');
    setPeople(p);
    setTransactions(t);
  }, []);

  // Save
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('splitter-people', JSON.stringify(people));
      localStorage.setItem('splitter-transactions', JSON.stringify(transactions));
    }
  }, [people, transactions, isClient]);

  // Toast
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setShowToast(false), 2200);
  };

  // Format
  const fmt = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e7) return `₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `₹${(abs / 1e5).toFixed(2)} L`;
    return `₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const avClass = (i: number) => {
    const mod = i % 8;
    return (styles as any)[`av${mod}`] || styles.av0;
  };

  const initials = (name: string) => name.split(' ').map(w => w[0]?.toUpperCase()).join('').slice(0, 2);

  // Sync split checks when people change
  useEffect(() => {
    setEqualChecks(prev => {
      const next: any = {};
      people.forEach(p => next[p] = prev[p] !== undefined ? prev[p] : true);
      return next;
    });
  }, [people]);

  // Add Person
  const addPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    if (people.map(p => p.toLowerCase()).includes(name.toLowerCase())) {
      triggerToast('⚠️ Person already added');
      return;
    }
    setPeople([...people, name]);
    setNewPersonName('');
    triggerToast(`👤 ${name} added`);
  };

  // Delete Person
  const deletePerson = (idx: number) => {
    const name = people[idx];
    setConfirmModal({
      show: true,
      msg: `Remove "${name}"? Their related splits will be removed.`,
      onResolve: (ok) => {
        setConfirmModal({ show: false, msg: '', onResolve: null });
        if (ok) {
          setPeople(people.filter((_, i) => i !== idx));
          setTransactions(prev => prev.filter(tx => tx.paidBy !== name).map(tx => {
            const newSplits = { ...tx.splits };
            delete newSplits[name];
            return { ...tx, splits: newSplits };
          }));
          if (paidBy === name) setPaidBy('');
          triggerToast('🗑️ Person removed');
        }
      }
    });
  };

  // Edit Person
  const saveEditPerson = () => {
    const newName = editModal.value.trim();
    if (!newName) {
      setEditModal({ show: false, value: '', idx: -1 });
      return;
    }
    const idx = editModal.idx;
    const old = people[idx];
    
    const newPeople = [...people];
    newPeople[idx] = newName;
    setPeople(newPeople);

    setTransactions(prev => prev.map(tx => {
      let nextTx = { ...tx };
      if (nextTx.paidBy === old) nextTx.paidBy = newName;
      if (nextTx.splits[old] !== undefined) {
        nextTx.splits[newName] = nextTx.splits[old];
        delete nextTx.splits[old];
      }
      return nextTx;
    }));

    if (paidBy === old) setPaidBy(newName);
    
    setEditModal({ show: false, value: '', idx: -1 });
    triggerToast('✏️ Name updated');
  };

  // Add Expense
  const addExpense = () => {
    const title = expenseTitle.trim();
    const amount = parseFloat(expenseAmount);
    
    if (!title || isNaN(amount) || amount <= 0 || !paidBy) {
      triggerToast('⚠️ Please fill all fields'); return;
    }

    let splits: Split = {};

    if (splitType === 'equal') {
      const selected = Object.keys(equalChecks).filter(p => equalChecks[p]);
      if (!selected.length) { triggerToast('⚠️ Select at least one person'); return; }
      const share = parseFloat((amount / selected.length).toFixed(2));
      selected.forEach(p => splits[p] = share);
    } else if (splitType === 'custom') {
      let total = 0;
      people.forEach(p => {
        const v = parseFloat(customSplits[p] || '0');
        splits[p] = v;
        total += v;
      });
      if (Math.abs(total - amount) > 0.5) {
        triggerToast(`⚠️ Split total (${fmt(total)}) ≠ Amount (${fmt(amount)})`); return;
      }
    } else {
      let totalPct = 0;
      people.forEach(p => {
        totalPct += parseFloat(percentSplits[p] || '0');
      });
      if (Math.abs(totalPct - 100) > 0.5) {
        triggerToast(`⚠️ Percentages must add up to 100% (currently ${totalPct}%)`); return;
      }
      people.forEach(p => {
        splits[p] = parseFloat(((parseFloat(percentSplits[p] || '0') / 100) * amount).toFixed(2));
      });
    }

    const now = new Date();
    const date = `${now.getDate()} ${now.toLocaleString('en-IN', { month: 'short' })} ${now.getFullYear()}`;
    
    setTransactions([...transactions, { id: Date.now(), title, amount, paidBy, splits, date }]);
    setExpenseTitle('');
    setExpenseAmount('');
    triggerToast(`💸 "${title}" added`);
  };

  // Delete Expense
  const deleteTransaction = (idx: number) => {
    setConfirmModal({
      show: true,
      msg: 'Delete this expense?',
      onResolve: (ok) => {
        setConfirmModal({ show: false, msg: '', onResolve: null });
        if (ok) {
          setTransactions(transactions.filter((_, i) => i !== idx));
          triggerToast('🗑️ Expense deleted');
        }
      }
    });
  };

  // Export CSV
  const exportCSV = () => {
    if (!transactions.length) { triggerToast('No expenses to export'); return; }
    const header = 'Title,Amount,Paid By,Date,Split Details';
    const rows = transactions.map(t => {
      const splitStr = Object.entries(t.splits).map(([p, a]) => `${p}:${a}`).join(' | ');
      return `"${t.title}",${t.amount},"${t.paidBy}","${t.date || ""}"  ,"${splitStr}"`;
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'expenses.csv'; a.click();
    URL.revokeObjectURL(url);
    triggerToast('📥 Exported to CSV!');
  };

  // Compute Balances
  const computeBalances = () => {
    const bal: { [person: string]: number } = {};
    people.forEach(p => bal[p] = 0);
    transactions.forEach(t => {
      Object.entries(t.splits).forEach(([person, amt]) => {
        if (person in bal) {
          if (person !== t.paidBy) {
            bal[person] -= amt;
            if (t.paidBy in bal) bal[t.paidBy] += amt;
          }
        }
      });
    });
    return bal;
  };

  // Compute Settlement
  const computeSettlement = () => {
    const bal = computeBalances();
    const creditors = Object.entries(bal).filter(([, b]) => b > 0.01).map(([p, b]) => ({ p, b }));
    const debtors = Object.entries(bal).filter(([, b]) => b < -0.01).map(([p, b]) => ({ p, b: -b }));

    const settlements: Settlement[] = [];
    let ci = 0, di = 0;
    while (ci < creditors.length && di < debtors.length) {
      const c = creditors[ci], d = debtors[di];
      const amt = Math.min(c.b, d.b);
      settlements.push({ from: d.p, to: c.p, amt });
      c.b -= amt; d.b -= amt;
      if (c.b < 0.01) ci++;
      if (d.b < 0.01) di++;
    }
    return settlements;
  };

  if (!isClient) return <div className="min-h-screen bg-slate-950"></div>;

  const bal = computeBalances();
  const settlements = computeSettlement();
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-950 text-slate-100">
      <BackButton />

      {/* TOAST */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="px-5 py-2.5 rounded-xl text-sm font-semibold border shadow-lg bg-slate-800 text-slate-100 border-slate-700">
          {toastMsg}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/70">
          <div className="rounded-3xl shadow-2xl p-7 w-full max-w-xs mx-4 border bg-slate-800 border-slate-700">
            <p className="font-semibold text-center mb-5 text-slate-200">{confirmModal.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => confirmModal.onResolve?.(false)} className="flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-colors border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</button>
              <button onClick={() => confirmModal.onResolve?.(true)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/70">
          <div className="rounded-3xl shadow-2xl p-7 w-full max-w-xs mx-4 border bg-slate-800 border-slate-700">
            <h3 className="font-bold mb-4 text-center text-slate-100">Edit Name</h3>
            <input 
              autoFocus
              type="text" 
              value={editModal.value}
              onChange={e => setEditModal({...editModal, value: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && saveEditPerson()}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm mb-4 bg-slate-700 border-slate-600 text-slate-100"
            />
            <div className="flex gap-3">
              <button onClick={() => setEditModal({ show: false, value: '', idx: -1 })} className="flex-1 py-2.5 rounded-xl border font-semibold text-sm border-slate-600 text-slate-300">Cancel</button>
              <button onClick={saveEditPerson} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-5">
        
        <PageHeader
          title="Expense Splitter"
          subtitle="Split bills fairly. Settle up simply."
        />

        {/* STATS */}
        <div className={`grid grid-cols-3 gap-3 ${styles.fadeUp} ${styles.d2}`}>
          <div className={`${styles.appCard} rounded-2xl p-4 shadow border text-center bg-slate-800 border-slate-700/50`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">People</p>
            <p className="text-2xl font-extrabold text-cyan-400">{people.length}</p>
          </div>
          <div className={`${styles.appCard} rounded-2xl p-4 shadow border text-center bg-slate-800 border-slate-700/50`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Expenses</p>
            <p className="text-2xl font-extrabold text-violet-400">{transactions.length}</p>
          </div>
          <div className={`${styles.appCard} rounded-2xl p-4 shadow border text-center bg-slate-800 border-slate-700/50`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Total Spent</p>
            <p className="text-2xl font-extrabold text-green-400">{fmt(totalSpent)}</p>
          </div>
        </div>

        {/* PEOPLE CARD */}
        <div className={`${styles.fadeUp} ${styles.d3} ${styles.appCard} p-6 rounded-3xl shadow-xl border bg-slate-800 border-slate-700/50`}>
          <h2 className="font-bold flex items-center gap-2 mb-5 text-slate-200">
            <i className="ri-group-fill text-cyan-400"></i> People
          </h2>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Add person's name…"
              value={newPersonName}
              onChange={e => setNewPersonName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPerson()}
              className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
            />
            <button 
              onClick={addPerson}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md flex items-center gap-1.5"
            >
              <i className="ri-add-line text-base"></i> Add
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {!people.length && (
              <div className="col-span-full py-6 text-center text-sm text-slate-500">
                <i className="ri-user-add-line text-3xl block mb-2 opacity-40"></i>
                Add people to get started
              </div>
            )}
            {people.map((p, i) => (
              <div key={p} className={`${styles.slideIn} flex items-center gap-2 px-3 py-2.5 rounded-2xl border bg-slate-700/60 border-slate-600/50`}>
                <div className={`w-8 h-8 rounded-xl ${avClass(i)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{initials(p)}</div>
                <span className="text-sm font-semibold truncate flex-1 text-slate-200">{p}</span>
                <button onClick={() => setEditModal({ show: true, value: p, idx: i })} title="Edit" className="text-slate-400 hover:text-cyan-400 transition-colors"><i className="ri-edit-line text-sm"></i></button>
                <button onClick={() => deletePerson(i)} title="Remove" className="text-slate-400 hover:text-red-400 transition-colors"><i className="ri-user-unfollow-line text-sm"></i></button>
              </div>
            ))}
          </div>
        </div>

        {/* ADD EXPENSE CARD */}
        <div className={`${styles.fadeUp} ${styles.d4} ${styles.appCard} p-6 rounded-3xl shadow-xl border bg-slate-800 border-slate-700/50`}>
          <h2 className="font-bold flex items-center gap-2 mb-5 text-slate-200">
            <i className="ri-add-circle-fill text-cyan-400"></i> Add Expense
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input 
              type="text" 
              placeholder="Expense title e.g. Dinner"
              value={expenseTitle}
              onChange={e => setExpenseTitle(e.target.value)}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-cyan-400">₹</span>
              <input 
                type="number" 
                placeholder="Amount" 
                min="1"
                value={expenseAmount}
                onChange={e => setExpenseAmount(e.target.value)}
                className="w-full pl-7 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              />
            </div>
            <select 
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all bg-slate-700 border-slate-600 text-slate-100"
            >
              <option disabled value="">Paid by…</option>
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select 
              value={splitType}
              onChange={e => setSplitType(e.target.value)}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all bg-slate-700 border-slate-600 text-slate-100"
            >
              <option value="equal">Split equally</option>
              <option value="custom">Split by custom amount</option>
              <option value="percent">Split by percentage</option>
            </select>
          </div>

          {/* Split Inputs */}
          <div className="space-y-2 border-t pt-4 mt-2 border-slate-700/50">
            {!people.length && (
              <p className="text-sm text-center py-2 text-slate-500">Add people first to split expenses</p>
            )}
            
            {!!people.length && splitType === 'equal' && (
              <>
                <p className="text-xs mb-2 text-slate-400">Select who's included in the split:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {people.map((p, i) => (
                    <label key={p} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer hover:border-cyan-400/50 transition-all bg-slate-700/50 border-slate-600/50">
                      <input 
                        type="checkbox" 
                        checked={equalChecks[p] || false}
                        onChange={e => setEqualChecks({...equalChecks, [p]: e.target.checked})}
                        className={styles.personCheck}
                      />
                      <div className={`w-6 h-6 rounded-lg ${avClass(i)} flex items-center justify-center text-white text-xs font-bold`}>{initials(p)}</div>
                      <span className="text-sm font-medium truncate text-slate-200">{p}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {!!people.length && splitType === 'custom' && (
              <>
                <p className="text-xs mb-2 text-slate-400">Enter each person's share (must add up to total):</p>
                <div className="space-y-2">
                  {people.map((p, i) => (
                    <div key={p} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg ${avClass(i)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{initials(p)}</div>
                      <span className="text-sm font-medium flex-1 text-slate-200">{p}</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400">₹</span>
                        <input 
                          type="number" 
                          value={customSplits[p] || ''}
                          onChange={e => setCustomSplits({...customSplits, [p]: e.target.value})}
                          className="pl-6 pr-3 py-2 w-28 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-700 border-slate-600 text-slate-100" 
                          placeholder="0" 
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!!people.length && splitType === 'percent' && (
              <>
                <p className="text-xs mb-2 text-slate-400">Enter each person's percentage (must add up to 100%):</p>
                <div className="space-y-2">
                  {people.map((p, i) => (
                    <div key={p} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg ${avClass(i)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{initials(p)}</div>
                      <span className="text-sm font-medium flex-1 text-slate-200">{p}</span>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={percentSplits[p] || ''}
                          onChange={e => setPercentSplits({...percentSplits, [p]: e.target.value})}
                          className="pr-8 pl-3 py-2 w-24 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-700 border-slate-600 text-slate-100" 
                          placeholder="0" 
                          min="0" 
                          max="100"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <button 
            onClick={addExpense}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
          >
            <i className="ri-add-line text-lg"></i> Add Expense
          </button>
        </div>

        {/* TABS */}
        <div className={`${styles.fadeUp} ${styles.d5}`}>
          <div className="flex rounded-2xl p-1 border shadow mb-4 bg-slate-800 border-slate-700/50">
            <button 
              onClick={() => setActiveTab('txn')}
              className={`${styles.tabBtn} ${activeTab === 'txn' ? styles.tabBtnActive : ''} flex-1 py-2.5 rounded-xl text-sm font-bold`}
            >
              <i className="ri-receipt-line mr-1"></i> Transactions
            </button>
            <button 
              onClick={() => setActiveTab('balance')}
              className={`${styles.tabBtn} ${activeTab === 'balance' ? styles.tabBtnActive : ''} flex-1 py-2.5 rounded-xl text-sm font-bold`}
            >
              <i className="ri-scales-line mr-1"></i> Balances
            </button>
            <button 
              onClick={() => setActiveTab('settle')}
              className={`${styles.tabBtn} ${activeTab === 'settle' ? styles.tabBtnActive : ''} flex-1 py-2.5 rounded-xl text-sm font-bold`}
            >
              <i className="ri-check-double-line mr-1"></i> Settle Up
            </button>
          </div>

          {/* TRANSACTIONS PANEL */}
          {activeTab === 'txn' && (
            <div className={`${styles.appCard} p-6 rounded-3xl shadow-xl border bg-slate-800 border-slate-700/50`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-200">All Expenses</h3>
                <button 
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border hover:border-cyan-400 hover:text-cyan-400 text-xs font-semibold transition-all bg-slate-700 border-slate-600 text-slate-300"
                >
                  <i className="ri-download-2-line"></i> Export CSV
                </button>
              </div>
              <ul className="space-y-3">
                {!transactions.length && (
                  <li className="text-center py-10 text-slate-500">
                    <i className="ri-inbox-line text-4xl block mb-2 opacity-40"></i>
                    No expenses yet
                  </li>
                )}
                {transactions.map((t, i) => {
                  const pIdx = people.indexOf(t.paidBy);
                  const splitsStr = Object.entries(t.splits)
                    .filter(([, a]) => a > 0)
                    .map(([p, a]) => <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-slate-700">{p}: {fmt(a)}</span>);
                  
                  return (
                    <li key={t.id} className={`${styles.slideIn} rounded-2xl p-4 border transition-all bg-slate-700/50 border-slate-600/50 hover:border-cyan-400/40`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${avClass(pIdx >= 0 ? pIdx : 0)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{initials(t.paidBy)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold truncate text-slate-100">{t.title}</p>
                            <p className="font-extrabold flex-shrink-0 text-cyan-400">{fmt(t.amount)}</p>
                          </div>
                          <p className="text-xs mt-0.5 text-slate-400">
                            Paid by <span className="font-semibold text-slate-300">{t.paidBy}</span>
                            {t.date && ` · ${t.date}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">{splitsStr}</div>
                        </div>
                        <button 
                          onClick={() => deleteTransaction(i)} 
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all flex-shrink-0"
                        >
                          <i className="ri-delete-bin-line text-base"></i>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* BALANCES PANEL */}
          {activeTab === 'balance' && (
            <div className={`${styles.appCard} p-6 rounded-3xl shadow-xl border bg-slate-800 border-slate-700/50`}>
              <h3 className="font-bold mb-4 text-slate-200">Individual Balances</h3>
              <ul className="space-y-3">
                {!people.length && (
                  <li className="text-center py-10 text-slate-500">
                    <i className="ri-user-line text-4xl block mb-2 opacity-40"></i>
                    Add people to see balances
                  </li>
                )}
                {Object.entries(bal).map(([p, b], i) => {
                  const color = b > 0.01 ? 'text-green-400' : b < -0.01 ? 'text-red-400' : 'text-slate-400';
                  const bgColor = b > 0.01 ? 'bg-green-900/20' : b < -0.01 ? 'bg-red-900/20' : 'bg-slate-700/30';
                  const icon = b > 0.01 ? 'ri-arrow-down-circle-fill' : b < -0.01 ? 'ri-arrow-up-circle-fill' : 'ri-checkbox-circle-fill';
                  const label = b > 0.01 ? `gets back ${fmt(b)}` : b < -0.01 ? `owes ${fmt(Math.abs(b))}` : 'settled up ✓';
                  const pIdx = people.indexOf(p);

                  return (
                    <li key={p} className={`${styles.slideIn} flex items-center gap-3 ${bgColor} rounded-2xl p-4 border border-transparent hover:border-cyan-400/20 transition-all`}>
                      <div className={`w-10 h-10 rounded-xl ${avClass(pIdx >= 0 ? pIdx : i)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{initials(p)}</div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-200">{p}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 ${color}`}>
                        <i className={`${icon} text-lg`}></i>
                        <span className="font-bold text-sm">{label}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* SETTLE UP PANEL */}
          {activeTab === 'settle' && (
            <div className={`${styles.appCard} p-6 rounded-3xl shadow-xl border bg-slate-800 border-slate-700/50`}>
              <h3 className="font-bold mb-4 text-slate-200">Settlement Plan</h3>
              <div className="space-y-3">
                {(!people.length || !transactions.length) && (
                  <div className="text-center py-10 text-slate-500">
                    <i className="ri-check-line text-4xl block mb-2 opacity-40"></i>
                    Everyone is settled up!
                  </div>
                )}
                
                {(people.length > 0 && transactions.length > 0 && !settlements.length) && (
                  <div className="text-center py-10 font-bold text-green-400">
                    <i className="ri-checkbox-circle-line text-4xl block mb-2"></i>
                    All settled! 🎉
                  </div>
                )}

                {settlements.map((s, i) => {
                  const fromIdx = people.indexOf(s.from);
                  const toIdx = people.indexOf(s.to);
                  return (
                    <div key={i} className={`${styles.slideIn} flex items-center gap-3 rounded-2xl p-4 border bg-slate-700/40 border-slate-600/50`}>
                      <div className={`w-9 h-9 rounded-xl ${avClass(fromIdx >= 0 ? fromIdx : i)} flex items-center justify-center text-white text-xs font-bold`}>{initials(s.from)}</div>
                      <div className="flex-1 text-center">
                        <p className="text-xs mb-0.5 text-slate-400">pays</p>
                        <p className="font-extrabold text-lg text-cyan-400">{fmt(s.amt)}</p>
                      </div>
                      <i className={`ri-arrow-right-line text-xl ${styles.settleArrow} text-cyan-500`}></i>
                      <div className="flex-1 text-center">
                        <p className="text-xs mb-0.5 text-slate-400">to</p>
                        <p className="font-bold text-slate-200">{s.to}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-xl ${avClass(toIdx >= 0 ? toIdx : i + 1)} flex items-center justify-center text-white text-xs font-bold`}>{initials(s.to)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
