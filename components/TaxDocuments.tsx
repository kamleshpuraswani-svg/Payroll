
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Calendar, 
  PieChart as PieChartIcon, 
  ArrowRight,
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  blue: '#3B82F6',
  teal: '#0EA5E9',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  slate: '#64748b',
  lightGray: '#F1F5F9'
};

interface DocProps {
  title: string;
  description: string;
  status: 'ready' | 'upcoming' | 'na' | 'link';
  date?: string;
  type?: string;
}

const ARCHIVE_DATA = [
  { fy: '2024-25', docs: [
    { title: 'Form 16 (Part A & B)', type: 'Statutory', date: 'June 12, 2025' },
    { title: 'Tax Computation Sheet', type: 'Calculation', date: 'March 31, 2025' },
    { title: 'Form 12BA', type: 'Perquisites', date: 'June 12, 2025' },
    { title: 'ITR V Acknowledgement', type: 'Filing', date: 'July 20, 2025' }
  ]},
  { fy: '2023-24', docs: [
    { title: 'Form 16 (Part A & B)', type: 'Statutory', date: 'June 10, 2024' },
    { title: 'Tax Computation Sheet', type: 'Calculation', date: 'March 31, 2024' },
    { title: 'Rent Receipt Bundle', type: 'Proof', date: 'Jan 15, 2024' }
  ]},
  { fy: '2022-23', docs: [
    { title: 'Form 16 (Part A & B)', type: 'Statutory', date: 'June 08, 2023' },
    { title: 'Tax Computation Sheet', type: 'Calculation', date: 'March 31, 2023' }
  ]}
];

interface TaxDocumentsModuleProps {
  onNavigateToPlanning?: () => void;
}

export const TaxDocumentsModule: React.FC<TaxDocumentsModuleProps> = ({ onNavigateToPlanning }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'archives'>('current');
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const availableYears = useMemo(() => ARCHIVE_DATA.map(y => y.fy), []);

  const filteredArchives = useMemo(() => {
    return ARCHIVE_DATA
      .filter(year => selectedYear === 'all' || year.fy === selectedYear)
      .map(year => ({
        ...year,
        docs: year.docs.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          year.fy.includes(searchQuery)
        )
      })).filter(year => year.docs.length > 0);
  }, [searchQuery, selectedYear]);

  const handleDownload = (docTitle: string) => {
    const element = document.createElement("a");
    const file = new Blob([`Content for ${docTitle}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  const handleExportZip = () => {
    const element = document.createElement("a");
    const file = new Blob(['Mock ZIP Content'], {type: 'application/zip'});
    element.href = URL.createObjectURL(file);
    element.download = `Tax_Documents_Export.zip`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
      {/* 1. Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tax Documents</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Self-service portal for statutory forms and tax proofs.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2
              ${activeTab === 'current' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}
            `}
          >
            <Zap size={14} /> Current FY
          </button>
          <button 
            onClick={() => setActiveTab('archives')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2
              ${activeTab === 'archives' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}
            `}
          >
            <Archive size={14} /> Archives
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <>
          {/* 3. Document Grid - Current */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DocCard 
              title="Tax Computation Sheet" 
              description="Detailed calculation of your projected tax for the current FY based on regime."
              status="ready"
              date="Dec 15, 2025"
              onPreview={() => setPreviewDoc('Computation Sheet FY 25-26')}
            />
            <DocCard 
              title="Investment Proof Report" 
              description="Consolidated summary of all investments declared and verified."
              status="ready"
              date="Dec 1, 2025"
              onPreview={() => setPreviewDoc('Investment Proof Summary')}
            />
            <DocCard 
              title="Form 16 (Part A & B)" 
              description="Consolidated salary TDS certificate. Available after the end of the financial year."
              status="upcoming"
              date="June 2026"
            />
            <DocCard 
              title="TDS Certificate (Form 16A)" 
              description="Quarterly certificates for TDS deducted on non-salary components."
              status="ready"
              date="Q2 Ready"
              onPreview={() => setPreviewDoc('Form 16A - Q2')}
            />
            <DocCard 
              title="AIS / TIS Summary" 
              description="Annual Information Statement from Income Tax Dept. View for reconciliation."
              status="link"
              date="Updated: Nov 2025"
            />
            <DocCard 
              title="Form 12BA" 
              description="Statement showing value of perquisites, other fringes and profits in lieu of salary."
              status="na"
            />
          </div>
        </>
      ) : (
        /* 4. Archives View */
        <div className="space-y-8 animate-fade-in">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                       type="text" 
                       placeholder="Search by doc name..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                 </div>
                 
                 <div className="relative">
                    <select 
                       value={selectedYear}
                       onChange={(e) => setSelectedYear(e.target.value)}
                       className="appearance-none pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer"
                    >
                       <option value="all">All Years</option>
                       {availableYears.map(year => (
                          <option key={year} value={year}>FY {year}</option>
                       ))}
                    </select>
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing {filteredArchives.reduce((acc, curr) => acc + curr.docs.length, 0)} items
                 </span>
                 <button 
                    onClick={handleExportZip}
                    className="flex items-center gap-2 px-6 h-12 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                 >
                    <FileArchive size={18}/> Export (ZIP)
                 </button>
              </div>
           </div>

           <div className="space-y-12">
              {filteredArchives.map((year) => (
                <div key={year.fy} className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-4 py-1 rounded-full border border-slate-200">Financial Year {year.fy}</h3>
                      <div className="h-px flex-1 bg-slate-200"></div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {year.docs.map((doc, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><FileText size={20}/></div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{doc.type}</span>
                           </div>
                           <h4 className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-6">{doc.date}</p>
                           
                           <div className="flex gap-2">
                              <button 
                                 onClick={() => setPreviewDoc(`${doc.title} FY ${year.fy}`)}
                                 className="flex-1 h-9 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-all"
                              >
                                 <Eye size={12}/> Preview
                              </button>
                              <button 
                                 onClick={() => handleDownload(`${doc.title} ${year.fy}`)}
                                 className="w-9 h-9 bg-slate-100 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
                              >
                                 <Download size={14}/>
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
              {filteredArchives.length === 0 && (
                 <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                       <Search size={32}/>
                    </div>
                    <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No matching historical records</p>
                    <button 
                       onClick={() => {setSelectedYear('all'); setSearchQuery('');}}
                       className="mt-4 text-blue-600 font-bold text-xs hover:underline"
                    >
                       Reset Filters
                    </button>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Preview Modal */}
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
             {status === 'ready' && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100"><CheckCircle2 size={12}/> Ready</span>}
             {status === 'upcoming' && (
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200"><Clock size={12}/> Post-FY End</span>
                  <span className="text-[8px] font-bold text-blue-600 mt-1 uppercase">Available {date}</span>
                </div>
             )}
             {status === 'na' && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Not Applicable</span>}
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
