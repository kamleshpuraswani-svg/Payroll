
import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Shield, 
  ChevronRight,
  Receipt,
  FileText
} from 'lucide-react';

interface MyPayProps {
    onNavigateToTaxPlanning: () => void; 
    onNavigateToReimbursements: () => void; 
}

const MyPay: React.FC<MyPayProps> = ({ onNavigateToTaxPlanning, onNavigateToReimbursements }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
         <div>
             <h1 className="text-2xl font-bold text-slate-800">My Pay</h1>
             <p className="text-slate-500 mt-1">Summary of your earnings, deductions, and payout for Nov 2025.</p>
         </div>
         <div className="text-right">
             <p className="text-sm font-bold text-slate-400 uppercase">Next Pay Date</p>
             <p className="text-xl font-bold text-slate-800">30 Dec 2025</p>
         </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg"><DollarSign size={20} className="text-white" /></div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded text-sky-50">Net Pay</span>
          </div>
          <p className="text-3xl font-bold">₹ 1,28,400</p>
          <p className="text-sm text-sky-100 mt-1">Credited on 30 Nov 2025</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
             <h3 className="font-bold text-slate-700">Earnings</h3>
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <div>
              <p className="text-2xl font-bold text-slate-800">₹ 1,54,166</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full"></div>
              </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
             <h3 className="font-bold text-slate-700">Deductions</h3>
             <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><CreditCard size={18} /></div>
          </div>
          <div>
              <p className="text-2xl font-bold text-slate-800">₹ 25,766</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-rose-500 h-full w-[25%]"></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Includes TDS & PF</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={onNavigateToTaxPlanning}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <Shield size={24} />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Tax Planning</h4>
                          <p className="text-sm text-slate-500">Submit 80C proofs to save tax</p>
                      </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
              </div>
          </div>

          <div 
            onClick={onNavigateToReimbursements}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                          <Receipt size={24} />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Reimbursements</h4>
                          <p className="text-sm text-slate-500">Claim fuel, internet & books</p>
                      </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-amber-500" />
              </div>
          </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Recent Payroll Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
              {[
                  { title: 'Salary Credited', date: '30 Nov 2025', desc: 'Net Pay for Nov 2025', amount: '+ ₹1,28,400', type: 'credit' },
                  { title: 'Reimbursement Approved', date: '25 Nov 2025', desc: 'Internet Bill Oct 2025', amount: '+ ₹1,200', type: 'credit' },
                  { title: 'Income Tax Deducted', date: '30 Nov 2025', desc: 'TDS for Nov 2025', amount: '- ₹12,500', type: 'debit' },
              ].map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {item.type === 'credit' ? <DollarSign size={18} /> : <FileText size={18} />}
                          </div>
                          <div>
                              <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                              <p className="text-xs text-slate-500">{item.desc} • {item.date}</p>
                          </div>
                      </div>
                      <span className={`font-bold text-sm ${item.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {item.amount}
                      </span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default MyPay;
