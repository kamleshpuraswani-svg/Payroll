
import React, { useState } from 'react';
import {
  Plus, Wallet, Clock, CheckCircle, TrendingUp, History, Search,
  FileText, ArrowUpRight, AlertTriangle, ChevronRight, PieChart as PieChartIcon,
  Eye, Edit2, Layers, FileWarning, X, Sigma, ChevronDown, Tag, CreditCard, Calendar, Activity, Banknote
} from 'lucide-react';
import { BudgetCategory, WalletMetric, ReimbursementCategory } from '../../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'];

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return ''; }
};

export const Dashboard = ({ wallet, budgets, claims, loans, onNewClaim, onEditClaim, onViewClaim, onViewLoans }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectedPanel, setShowRejectedPanel] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewClaim, setViewClaim] = useState<any>(null);

  // Filter for history table
  const allHistoryClaims = claims.filter((c: any) => c.status !== 'draft');

  // Dummy claims to always show in the table
  const DUMMY_CLAIMS = [
    { id: 'CLM-00124', name: 'Client Meeting - Food & Cab', category: 'TRAVEL', items: [{ merchant: 'Uber', amount: 750, reason: 'Cab to client office for Q4 meeting', expenseDate: '2025-12-05' }, { merchant: 'Swiggy', amount: 500, reason: 'Lunch with client', expenseDate: '2025-12-05' }], submittedAt: '2025-12-06', createdAt: '2025-12-05T10:00:00Z', modifiedAt: '2025-12-06T14:30:00Z', status: 'settled' },
    { id: 'CLM-00123', name: 'Broadband Subscription - Dec', category: 'BROADBAND', items: [{ merchant: 'Airtel', amount: 999, reason: 'Monthly broadband reimbursement - Dec 2025', expenseDate: '2025-12-01' }], submittedAt: '2025-12-01', createdAt: '2025-12-01T09:00:00Z', modifiedAt: '2025-12-02T11:00:00Z', status: 'approved' },
    { id: 'CLM-00122', name: 'Team Lunch - Q4 Review', category: 'MEAL', items: [{ merchant: 'Barbeque Nation', amount: 3200, reason: 'Team lunch for Q4 performance review', expenseDate: '2025-11-28' }], submittedAt: '2025-11-28', createdAt: '2025-11-28T13:00:00Z', modifiedAt: '2025-11-29T10:00:00Z', status: 'approved' },
    { id: 'CLM-00121', name: 'Mobile Recharge - Nov', category: 'MOBILE', items: [{ merchant: 'Jio', amount: 599, reason: 'Monthly mobile reimbursement - Nov 2025', expenseDate: '2025-11-15' }], submittedAt: '2025-11-15', createdAt: '2025-11-15T11:00:00Z', modifiedAt: '2025-11-16T09:00:00Z', status: 'settled' },
    { id: 'CLM-00120', name: 'Flight - Bangalore to Mumbai', category: 'TRAVEL', items: [{ merchant: 'IndiGo', amount: 5800, reason: 'Business travel to Mumbai for client presentation', expenseDate: '2025-11-10' }], submittedAt: '2025-11-10', createdAt: '2025-11-10T08:00:00Z', modifiedAt: '2025-11-11T16:00:00Z', status: 'approved' },
    { id: 'CLM-00119', name: 'AWS Certification Course', category: 'LEARNING', items: [{ merchant: 'Coursera', amount: 4500, reason: 'AWS Solutions Architect certification fee', expenseDate: '2025-10-22' }], submittedAt: '2025-10-22', createdAt: '2025-10-22T14:00:00Z', modifiedAt: null, status: 'pending' },
    { id: 'CLM-00118', name: 'Hotel Stay - Client Visit', category: 'TRAVEL', items: [{ merchant: 'Marriott', amount: 7200, reason: '2-night hotel stay for client visit in Mumbai', expenseDate: '2025-10-15' }], submittedAt: '2025-10-15', createdAt: '2025-10-15T09:00:00Z', modifiedAt: '2025-10-17T12:00:00Z', status: 'settled' },
    { id: 'CLM-00117', name: 'Internet Bill - Oct', category: 'BROADBAND', items: [{ merchant: 'ACT Fibernet', amount: 1299, reason: 'Monthly broadband reimbursement - Oct 2025', expenseDate: '2025-10-05' }], submittedAt: '2025-10-05', createdAt: '2025-10-05T10:00:00Z', modifiedAt: '2025-10-06T08:00:00Z', status: 'approved' },
  ];

  const mergedClaims = [
    ...allHistoryClaims,
    ...DUMMY_CLAIMS.filter(d => !allHistoryClaims.find((c: any) => c.id === d.id))
  ];

  // Mock data for the rejected claims panel
  const rejectedClaims = [
    {
      id: 'CLM-REJ-01',
      name: 'Team Dinner with Client',
      title: 'Team Dinner with Client', // Keep for panel display if needed
      date: '12 Nov 2025',
      category: ReimbursementCategory.MEAL,
      status: 'action_required',
      amount: '₹ 4,500',
      items: [{ id: '1', merchant: 'Paradise Biryani', amount: 4500, date: '2025-11-12', notes: 'Includes alcohol charges which are non-reimbursable.' }],
      submittedAt: '12 Nov 2025',
      reason: 'Alcohol charges are not reimbursable as per company policy section 4.2. Please submit food bill only.',
      actionNote: 'Alcohol charges are not reimbursable as per company policy section 4.2. Please submit food bill only.',
      approvalHistory: [
        { date: '13 Nov 2025', actor: 'Priya Sharma (Finance)', action: 'Rejected', comment: 'Alcohol content in bill' }
      ]
    },
    {
      id: 'CLM-REJ-02',
      name: 'Cab to Airport',
      title: 'Cab to Airport',
      date: '05 Nov 2025',
      category: ReimbursementCategory.TRAVEL,
      status: 'action_required',
      amount: '₹ 850',
      items: [{ id: '1', merchant: 'Uber', amount: 850, date: '2025-11-05', notes: 'Airport drop for client meeting' }],
      submittedAt: '05 Nov 2025',
      reason: 'Duplicate claim detected. This ride was already claimed in Report #CLM-09.',
      actionNote: 'Duplicate claim detected. This ride was already claimed in Report #CLM-09.',
      approvalHistory: [
        { date: '06 Nov 2025', actor: 'Automated System', action: 'Rejected', comment: 'Duplicate ID detected' }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reimbursements</h1>
        </div>
        <button
          onClick={onNewClaim}
          className="bg-blue-600 text-white px-8 h-14 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center gap-3"
        >
          Create New Claim
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={20} /></div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{new Date().getFullYear()}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Entitlement</p>
            <p className="text-2xl font-black text-slate-900">₹{wallet.entitlement.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Estimated Tax Benefit</p>
            <p className="text-2xl font-black text-slate-900">₹{(wallet.utilized * 0.3).toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pending Approval</p>
            <p className="text-2xl font-black text-slate-900">₹{wallet.pending.toLocaleString()}</p>
          </div>

          {/* Total Claims Submitted */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Layers size={20} /></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Claims Submitted</p>
            <p className="text-2xl font-black text-slate-900">12</p>
          </div>



          {/* Rejected Claims */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <div className="flex justify-between mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileWarning size={20} /></div>
              <button
                onClick={() => setShowRejectedPanel(true)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="View Rejected Claims"
              >
                <Eye size={18} />
              </button>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rejected Claims</p>
            <p className="text-2xl font-black text-slate-900">2</p>
          </div>
        </div>

        {/* Budget Progress Bars - Compact Layout */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Category Utilization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((b: BudgetCategory, i: number) => (
              <div key={b.category} className="space-y-2 group">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-700 capitalize">{b.category.toLowerCase()}</span>
                  <span className="text-xs font-black text-slate-900">₹{b.utilized.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">/ ₹{b.limit.toLocaleString()}</span></span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110" style={{ width: `${(b.utilized / b.limit) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            Claims
          </h3>
          <div className="flex items-center gap-3">
            {/* Lookup Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
              >
                <Sigma size={18} className="text-blue-600" />
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                    Select Filter Field
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                    <Tag size={16} className="text-slate-400" /> Description
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                    <Layers size={16} className="text-slate-400" /> Category
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                    <CreditCard size={16} className="text-slate-400" /> Merchant/Payee
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                    <Calendar size={16} className="text-slate-400" /> Date of Expense
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                    <Activity size={16} className="text-slate-400" /> Status
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Filter by description or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-6 py-3 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Description/Reason</th>
                <th className="px-6 py-5">Merchant/Payee</th>
                <th className="px-6 py-5 text-right">Amount</th>
                <th className="px-6 py-5">Expense Date</th>
                <th className="px-6 py-5">Created By</th>
                <th className="px-6 py-5">Last Modified By</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mergedClaims.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).map((claim: any) => {
                const isSettled = claim.status === 'settled' || claim.status === 'approved';
                const merchant = claim.items?.length > 0
                  ? (claim.items.length > 1
                    ? `${claim.items[0].merchant || 'N/A'} +${claim.items.length - 1} more`
                    : (claim.items[0].merchant || 'N/A'))
                  : 'N/A';

                const firstReason = claim.items?.[0]?.reason || claim.name;
                const description = claim.items?.length > 1
                  ? `${firstReason} +${claim.items.length - 1} more`
                  : firstReason;

                const modifiedBy = claim.status === 'settled' || claim.status === 'approved' ? 'Finance Team' : null;
                const modifiedAt = claim.modifiedAt || (modifiedBy ? claim.createdAt : null);

                return (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{claim.category}</span>
                    </td>
                    <td className="px-6 py-5 max-w-[200px]">
                      <p className="text-sm font-bold text-slate-900 truncate" title={description}>{description}</p>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-600">{merchant}</td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">₹{claim.items.reduce((s: number, i: any) => s + i.amount, 0).toLocaleString()}</td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-500">{claim.submittedAt}</td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-700">Priya Sharma</p>
                      {claim.createdAt && <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(claim.createdAt)}</p>}
                    </td>
                    <td className="px-6 py-5">
                      {modifiedBy ? (
                        <>
                          <p className="text-xs font-bold text-slate-700">{modifiedBy}</p>
                          {modifiedAt && <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(modifiedAt)}</p>}
                        </>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewClaim(claim)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEditClaim(claim)}
                          disabled={isSettled}
                          className={`p-2 rounded-lg transition-colors ${isSettled
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          title={isSettled ? "Editing disabled for settled claims" : "Edit Claim"}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim View Panel */}
      {viewClaim && (
        <ClaimViewPanel
          claim={viewClaim}
          onClose={() => setViewClaim(null)}
          onEdit={(c: any) => { setViewClaim(null); onEditClaim(c); }}
        />
      )}

      {/* Rejected Claims Panel */}
      {showRejectedPanel && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowRejectedPanel(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-l border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-red-600 rounded-lg shadow-sm"><FileWarning size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-800">Rejected Claims</h3>
                  <p className="text-xs text-slate-500">2 claims require attention</p>
                </div>
              </div>
              <button onClick={() => setShowRejectedPanel(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {rejectedClaims.map((claim) => (
                <div key={claim.id} className="p-4 rounded-xl border border-red-100 bg-red-50/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{claim.title}</h4>
                      <p className="text-xs text-slate-500">{claim.date}</p>
                    </div>
                    <span className="font-black text-slate-900 text-sm">{claim.amount}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-red-100">
                    <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Rejection Reason</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{claim.reason}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowRejectedPanel(false);
                        setViewClaim(claim);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      View Full Details <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowRejectedPanel(false)} className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors">
                Close Panel
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let classes = "bg-slate-100 text-slate-600 border-slate-200";
  if (status === 'settled' || status === 'approved') classes = "bg-emerald-50 text-emerald-700 border-emerald-100";
  else if (status === 'pending') classes = "bg-amber-50 text-amber-700 border-amber-100";
  else if (status === 'action_required') classes = "bg-red-50 text-red-700 border-red-200";

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${classes}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const ClaimViewPanel = ({ claim, onClose, onEdit }: { claim: any; onClose: () => void; onEdit: (c: any) => void }) => {
  const isSettled = claim.status === 'settled' || claim.status === 'approved';
  const total = claim.items?.reduce((s: number, i: any) => s + (i.amount || 0), 0) || 0;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Claim Details</p>
            <h2 className="text-lg font-black text-slate-900">{claim.name || claim.id}</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isSettled && (
              <button
                onClick={() => onEdit(claim)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 transition-colors shadow-sm"
                title="Edit Claim"
              >
                <Edit2 size={14} /> Edit
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/40">
          {/* Summary strip */}
          <div className="px-6 py-5 bg-white border-b border-slate-100 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
              <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded uppercase tracking-wide">{claim.category}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-lg font-black text-slate-900">₹{total.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <StatusBadge status={claim.status} />
            </div>
          </div>

          {/* Meta */}
          <div className="px-6 py-5 bg-white border-b border-slate-100 grid grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created By</p>
              <p className="text-sm font-bold text-slate-800">Priya Sharma</p>
              {claim.createdAt && <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(claim.createdAt)}</p>}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Modified By</p>
              {(claim.status === 'settled' || claim.status === 'approved') ? (
                <>
                  <p className="text-sm font-bold text-slate-800">Finance Team</p>
                  {claim.modifiedAt && <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(claim.modifiedAt)}</p>}
                </>
              ) : (
                <p className="text-sm text-slate-300">—</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted Date</p>
              <p className="text-sm font-bold text-slate-800">{claim.submittedAt || '—'}</p>
            </div>
          </div>

          {/* Expense Items */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Expense Items</p>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {claim.items?.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Merchant</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {claim.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-800 leading-snug">{item.reason || item.description || '—'}</p>
                          {item.project && <p className="text-[10px] text-slate-400 mt-0.5 uppercase">{item.project}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-medium">{item.merchant || '—'}</td>
                        <td className="px-4 py-3">
                          {item.category && <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{item.category}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-medium whitespace-nowrap">
                          {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-900">₹{(item.amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50/50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Total</td>
                      <td className="px-4 py-3 text-right text-base font-black text-blue-600">₹{total.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="px-4 py-6 text-xs text-slate-400 text-center">No expense items found.</p>
              )}
            </div>
          </div>

          {/* Action Note / Rejection Reason */}
          {claim.actionNote && (
            <div className="px-6 pb-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Action Note</p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs text-red-700 leading-relaxed">{claim.actionNote}</p>
              </div>
            </div>
          )}

          {/* Approval History */}
          {claim.approvalHistory?.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Approval History</p>
              <div className="space-y-2">
                {claim.approvalHistory.map((log: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: log.action === 'Rejected' ? '#EF4444' : '#10B981' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">{log.actor} · <span className="font-medium text-slate-500">{log.action}</span></p>
                      {log.comment && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{log.comment}</p>}
                    </div>
                    <p className="text-[10px] text-slate-400 shrink-0">{log.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Components kept for potential future use or to avoid undefined variable errors, although unused in this specific rendering.
const ActiveClaimCard = ({ claim, onEdit }: any) => {
  const statusColors: any = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    action_required: 'bg-red-50 text-red-700 border-red-200',
    settled: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };

  const steps = [
    { label: 'Submitted', done: true },
    { label: 'Verified', done: claim.status === 'pending' || claim.status === 'settled' },
    { label: 'Approved', done: claim.status === 'settled' }
  ];

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border tracking-widest ${statusColors[claim.status]}`}>
            {claim.status.replace('_', ' ')}
          </div>
          <button onClick={onEdit} className="text-slate-300 hover:text-blue-600 group-hover:text-blue-600 transition-all">
            <ArrowUpRight size={20} />
          </button>
        </div>

        <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{claim.name}</h4>
        <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1 uppercase tracking-widest">
          {claim.category} • {claim.items.length} LINE ITEMS
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center px-1">
          {steps.map((s, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full border-2 ${s.done ? 'bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-white border-slate-200'}`}></div>
                <span className={`text-[8px] font-black uppercase ${s.done ? 'text-slate-900' : 'text-slate-300'}`}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-[2px] mb-4 ${s.done ? 'bg-blue-600' : 'bg-slate-100'}`}></div>}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between items-end pt-2">
          <p className="text-xl font-black text-slate-900">₹{claim.items.reduce((s: number, i: any) => s + i.amount, 0).toLocaleString()}</p>
          {claim.status === 'action_required' && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
        </div>
      </div>
    </div>
  );
};

const DraftClaimCard = ({ claim, onEdit }: any) => (
  <div className="bg-slate-50 border border-slate-200 border-dashed p-8 rounded-xl flex flex-col justify-between min-h-[220px] group cursor-pointer hover:bg-white hover:border-blue-300 transition-all" onClick={onEdit}>
    <div>
      <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-400 tracking-widest">DRAFT</span>
      <h4 className="font-black text-slate-700 mt-6 group-hover:text-blue-600">{claim.name || 'Untitled Draft'}</h4>
      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{claim.category}</p>
    </div>
    <div className="flex justify-between items-end">
      <p className="text-lg font-black text-slate-400 group-hover:text-slate-900 transition-colors">₹{claim.items.reduce((s: number, i: any) => s + i.amount, 0).toLocaleString()}</p>
      <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">Finish Claim <ChevronRight size={12} /></button>
    </div>
  </div>
);
