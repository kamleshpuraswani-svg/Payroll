
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Calendar, 
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Eye,
  Search,
  Archive,
  FileArchive,
  X,
  Zap,
  Filter
} from 'lucide-react';

const COLORS = {
  blue: '#3B82F6',
  teal: '#0EA5E9',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  slate: '#64748b',
  lightGray: '#F1F5F9'
};

interface TaxDocumentsModuleProps {
  onNavigateToPlanning?: () => void;
}

const FINANCIAL_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23'];

export const TaxDocumentsModule: React.FC<TaxDocumentsModuleProps> = ({ onNavigateToPlanning }) => {
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [selectedFY, setSelectedFY] = useState<string>('2025-26');
  const [fyDropdownOpen, setFyDropdownOpen] = useState(false);

  const handleDownload = (docTitle: string) => {
    const element = document.createElement("a");
    const file = new Blob([`Content for ${docTitle}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };


  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tax Documents</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Self-service portal for statutory forms and tax proofs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Financial Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFyDropdownOpen((prev: boolean) => !prev)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
            >
              <Calendar size={14} />
              FY {selectedFY}
              <ChevronDown size={14} className={`transition-transform ${fyDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {fyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                {FINANCIAL_YEARS.map(fy => (
                  <button
                    key={fy}
                    onClick={() => {
                      setSelectedFY(fy);
                      setFyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors
                      ${selectedFY === fy ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    FY {fy}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Unified Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DocCard 
          title="Tax Computation Sheet" 
          description="Detailed calculation of your projected tax for the current FY based on regime."
          status="ready"
          date={selectedFY === '2025-26' ? "Dec 15, 2025" : `March 31, 20${selectedFY.split('-')[1]}`}
          onPreview={() => setPreviewDoc(`Computation Sheet FY ${selectedFY}`)}
        />
        <DocCard 
          title="Investment Proof Report" 
          description="Consolidated summary of all investments declared and verified."
          status="ready"
          date={selectedFY === '2025-26' ? "Dec 1, 2025" : `Jan 15, 20${selectedFY.split('-')[1]}`}
          onPreview={() => setPreviewDoc(`Investment Proof Summary FY ${selectedFY}`)}
        />
        <DocCard 
          title="Form 16 (Part A & B)" 
          description="Consolidated salary TDS certificate. Available after the end of the financial year."
          status={selectedFY === '2025-26' ? "upcoming" : "ready"}
          date={selectedFY === '2025-26' ? "June 2026" : `June 12, 20${selectedFY.split('-')[1]}`}
          onPreview={selectedFY !== '2025-26' ? () => setPreviewDoc(`Form 16 FY ${selectedFY}`) : undefined}
        />
        <DocCard 
          title="TDS Certificate (Form 16A)" 
          description="Quarterly certificates for TDS deducted on non-salary components."
          status="ready"
          date={selectedFY === '2025-26' ? "Q2 Ready" : `Q4 Ref: 20${selectedFY.split('-')[1]}`}
          onPreview={() => setPreviewDoc(`Form 16A - ${selectedFY}`)}
        />
        <DocCard 
          title="Form 12BA" 
          description="Statement showing value of perquisites, other fringes and profits in lieu of salary."
          status={selectedFY === '2025-26' ? "na" : "ready"}
          date={selectedFY !== '2025-26' ? `June 15, 20${selectedFY.split('-')[1]}` : undefined}
          onPreview={selectedFY !== '2025-26' ? () => setPreviewDoc(`Form 12BA FY ${selectedFY}`) : undefined}
        />
      </div>

      {/* 4. Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-600"/>
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Document Preview: {previewDoc}</h3>
                 </div>
                 <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 bg-slate-200 p-10 flex flex-col items-center justify-center text-center">
                 <div className="w-64 h-80 bg-white shadow-2xl rounded-sm flex flex-col p-6 space-y-4">
                    <div className="h-4 w-3/4 bg-slate-100"></div>
                    <div className="h-2 w-full bg-slate-50"></div>
                    <div className="h-2 w-full bg-slate-50"></div>
                    <div className="h-2 w-1/2 bg-slate-50"></div>
                    <div className="mt-auto h-12 w-1/2 bg-blue-600/10 self-end rounded"></div>
                 </div>
                 <p className="text-slate-500 font-bold mt-8">Secure PDF Preview Instance</p>
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Encrypted • Authenticated</p>
              </div>
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setPreviewDoc(null)} className="px-6 h-11 rounded-lg font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all">Close</button>
                 <button 
                    onClick={() => handleDownload(previewDoc)}
                    className="px-10 h-11 bg-blue-600 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2"
                 >
                    <Download size={16}/> Download PDF
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/* --- Visual Atom Components --- */

const SummaryStat = ({ label, value, sub, highlight }: { label: string, value: string, sub?: string, highlight?: boolean }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-black ${highlight ? 'text-red-500' : 'text-slate-900'}`}>{value}</p>
    {sub && <p className="text-[10px] font-bold text-slate-400">{sub}</p>}
  </div>
);

const DocCard = ({ title, description, status, date, onPreview }: { title: string, description: string, status: 'ready' | 'upcoming' | 'na' | 'link', date?: string, onPreview?: () => void }) => {
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`Content for ${title}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`p-8 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md group flex flex-col justify-between
      ${status === 'upcoming' ? 'opacity-70 bg-slate-50/50' : ''}
    `}>
       <div className="space-y-4">
          <div className="flex justify-between items-start">
             <div className={`p-3 rounded-lg ${status === 'ready' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                <FileText size={24} />
             </div>
             {status === 'upcoming' && (
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200"><Clock size={12}/> Post-FY End</span>
                  <span className="text-[8px] font-bold text-blue-600 mt-1 uppercase">Available {date}</span>
                </div>
             )}
          </div>
          <div>
             <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h4>
             <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{description}</p>
          </div>
       </div>

       <div className="mt-8 flex gap-2">
          {status === 'ready' && (
             <>
               <button 
                  onClick={onPreview}
                  className="flex-1 h-11 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all"
               >
                  <Eye size={16}/> Preview
               </button>
               <button 
                  onClick={handleDownload}
                  className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center transition-all shadow-lg shadow-blue-100"
               >
                  <Download size={18}/>
               </button>
             </>
          )}
          {status === 'upcoming' && (
             <div className="w-full h-11 bg-slate-100 border border-slate-200 rounded-lg flex items-center px-4 gap-3 text-slate-400">
                <Lock size={16}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Locked until {date}</span>
             </div>
          )}
          {status === 'link' && (
             <button className="w-full h-11 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all">
                <ExternalLink size={16}/> Open External Portal
             </button>
          )}
          {status === 'na' && (
             <div className="h-11 w-full flex items-center justify-center text-[10px] font-bold text-slate-300 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">No report applicable for current status.</div>
          )}
       </div>
    </div>
  );
};

const DocTag = ({ label, tooltip }: { label: string, tooltip: string }) => (
  <div className="group relative">
     <div className="px-3 py-1.5 bg-white border border-blue-100 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest cursor-help shadow-sm hover:border-blue-600 transition-colors">
        {label}
     </div>
     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
     </div>
  </div>
);

export default TaxDocumentsModule;
