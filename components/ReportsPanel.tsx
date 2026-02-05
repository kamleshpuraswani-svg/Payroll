import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, FileText, BellRing, ChevronRight, PlayCircle } from 'lucide-react';
import { StatutoryReport } from '../types';

interface ReportsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reports: StatutoryReport[];
}

const ReportsPanel: React.FC<ReportsPanelProps> = ({ isOpen, onClose, reports }) => {
  const [activeTab, setActiveTab] = useState('TDS');
  const tabs = ['TDS', 'PF', 'ESI', 'PT'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Due Soon': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Upcoming': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Safe': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div 
        className={`
          fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">Statutory Reports</h2>
                <p className="text-sm text-slate-500">14 reports due shortly</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2 border-b border-slate-100 flex gap-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-1 ${
                activeTab === tab 
                  ? 'border-rose-500 text-rose-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab} Compliance
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-3">
          {reports.map((report) => (
             <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {report.companyName.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 text-sm">{report.companyName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-xs font-medium text-slate-500">{report.reportType}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(report.status)}`}>
                             {report.status}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs text-slate-400 mb-1">Due Date</div>
                     <div className="text-sm font-semibold text-slate-800">{report.dueDate}</div>
                     <div className={`text-xs font-medium mt-0.5 ${report.daysRemaining <= 5 ? 'text-rose-600' : 'text-amber-600'}`}>
                       {report.daysRemaining} days left
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-sky-200">
                     <PlayCircle size={14} />
                     Generate Now
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors">
                     <BellRing size={14} />
                     Remind HR
                  </button>
               </div>
             </div>
          ))}
          
          <div className="text-center pt-4 pb-2">
             <p className="text-xs text-slate-400">All other reports are currently up to date.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsPanel;