
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  CloudUpload, 
  FileText, 
  Upload, 
  Paperclip, 
  Save, 
  Send, 
  Clock, 
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle,
  ArrowLeft,
  Briefcase,
  Lock,
  AlertTriangle,
  Loader2,
  Zap,
  TrendingDown
} from 'lucide-react';

interface DeclarationRow {
  id: number;
  section: string;
  title: string;
  amount: number;
  isExpanded: boolean;
  proofs: number;
  files: string[];
}

// Limits for Other Investments
const OTHER_SECTION_LIMITS: Record<string, number> = {
  "Section 80CCD(1B) - Additional Exemption on voluntary NPS": 50000,
  "Section 80CCG - Rajiv Gandhi Equity Saving Scheme (RGESS)": 25000,
  "Section 80DD - Treatment of dependent with disability": 75000,
  "Section 80DD - Treatment of dependent with severe disability": 125000,
  "Section 80DDB - Medical Treatment of Specified Diseases (Below 60 years)": 40000,
  "Section 80DDB - Medical Treatment of Specified Diseases (Above 60 years)": 100000,
};

// Mock Annual Income for calculation
const ANNUAL_GROSS_SALARY = 1800000;
const DEADLINE_DATE = new Date('2026-01-20');

const TaxPlanning: React.FC = () => {
  const [view, setView] = useState<'DASHBOARD' | 'PLANNING'>('DASHBOARD');
  const [expandedYear, setExpandedYear] = useState<string | null>('FY 2024-25');
  
  // Persisted States
  const [declarationStatus, setDeclarationStatus] = useState<'NEW' | 'DRAFT' | 'SUBMITTED'>(() => 
    (localStorage.getItem('tp_status') as any) || 'NEW'
  );
  
  // Regime State
  const [planningRegime, setPlanningRegime] = useState<'OLD' | 'NEW'>('OLD');
  
  const [declarations, setDeclarations] = useState<DeclarationRow[]>(() => {
    const saved = localStorage.getItem('tp_declarations');
    return saved ? JSON.parse(saved) : [
      { id: 1, section: '80C', title: 'Life Insurance Premium (LIC)', amount: 0, isExpanded: false, proofs: 0, files: [] },
      { id: 2, section: '80D', title: 'Self, Spouse, Children (below 60 years)', amount: 0, isExpanded: false, proofs: 0, files: [] }
    ];
  });

  const [hraEnabled, setHraEnabled] = useState(() => localStorage.getItem('tp_hra_enabled') === 'true');
  const [isHraSaved, setIsHraSaved] = useState(() => localStorage.getItem('tp_hra_saved') === 'true');
  const [rentedHouses, setRentedHouses] = useState(() => {
    const saved = localStorage.getItem('tp_rented_houses');
    return saved ? JSON.parse(saved) : [{ id: 1, from: '', to: '', amount: 0, address: '', landlord: '', cityType: 'Non-Metro', pan: '' }];
  });

  const [homeLoanEnabled, setHomeLoanEnabled] = useState(() => localStorage.getItem('tp_hl_enabled') === 'true');
  const [isHomeLoanSaved, setIsHomeLoanSaved] = useState(() => localStorage.getItem('tp_hl_saved') === 'true');
  const [homeLoanDetails, setHomeLoanDetails] = useState(() => {
    const saved = localStorage.getItem('tp_hl_details');
    return saved ? JSON.parse(saved) : { principal: 0, interest: 0, lender: '', lenderPan: '' };
  });

  const [letOutEnabled, setLetOutEnabled] = useState(() => localStorage.getItem('tp_lo_enabled') === 'true');
  const [isLetOutSaved, setIsLetOutSaved] = useState(() => localStorage.getItem('tp_lo_saved') === 'true');
  const [letOutProperties, setLetOutProperties] = useState(() => {
     const saved = localStorage.getItem('tp_lo_props');
     return saved ? JSON.parse(saved) : [{ id: 1, annualRent: 0, municipalTaxes: 0, hasHomeLoan: false, principal: 0, interest: 0, lender: '', lenderPan: '' }];
  });

  // Other Income State
  const [otherIncomeEnabled, setOtherIncomeEnabled] = useState(() => localStorage.getItem('tp_oi_enabled') === 'true');
  const [isOtherIncomeSaved, setIsOtherIncomeSaved] = useState(() => localStorage.getItem('tp_oi_saved') === 'true');
  const [otherIncomeDetails, setOtherIncomeDetails] = useState(() => {
    const saved = localStorage.getItem('tp_oi_details');
    return saved ? JSON.parse(saved) : { otherSourceIncome: 0, savingsInterest: 0, fdInterest: 0, nscInterest: 0 };
  });

  // UI States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persistence Effects
  useEffect(() => localStorage.setItem('tp_status', declarationStatus), [declarationStatus]);
  useEffect(() => localStorage.setItem('tp_declarations', JSON.stringify(declarations)), [declarations]);
  useEffect(() => localStorage.setItem('tp_hra_enabled', String(hraEnabled)), [hraEnabled]);
  useEffect(() => localStorage.setItem('tp_hra_saved', String(isHraSaved)), [isHraSaved]);
  useEffect(() => localStorage.setItem('tp_rented_houses', JSON.stringify(rentedHouses)), [rentedHouses]);
  useEffect(() => localStorage.setItem('tp_hl_enabled', String(homeLoanEnabled)), [homeLoanEnabled]);
  useEffect(() => localStorage.setItem('tp_hl_saved', String(isHomeLoanSaved)), [isHomeLoanSaved]);
  useEffect(() => localStorage.setItem('tp_hl_details', JSON.stringify(homeLoanDetails)), [homeLoanDetails]);
  useEffect(() => localStorage.setItem('tp_lo_enabled', String(letOutEnabled)), [letOutEnabled]);
  useEffect(() => localStorage.setItem('tp_lo_saved', String(isLetOutSaved)), [isLetOutSaved]);
  useEffect(() => localStorage.setItem('tp_lo_props', JSON.stringify(letOutProperties)), [letOutProperties]);
  useEffect(() => localStorage.setItem('tp_oi_enabled', String(otherIncomeEnabled)), [otherIncomeEnabled]);
  useEffect(() => localStorage.setItem('tp_oi_saved', String(isOtherIncomeSaved)), [isOtherIncomeSaved]);
  useEffect(() => localStorage.setItem('tp_oi_details', JSON.stringify(otherIncomeDetails)), [otherIncomeDetails]);

  // Read Only Logic
  const isDeadlinePassed = new Date() > DEADLINE_DATE;
  const isReadOnly = declarationStatus === 'SUBMITTED' || isDeadlinePassed;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);

  // --- Real-time Tax Calculation Logic ---
  
  const taxCalc = useMemo(() => {
    // 0. Total Income (Salary + Other Sources)
    const totalOtherIncome = otherIncomeEnabled ? (otherIncomeDetails.otherSourceIncome + otherIncomeDetails.savingsInterest + otherIncomeDetails.fdInterest + otherIncomeDetails.nscInterest) : 0;
    const grossTotalIncome = ANNUAL_GROSS_SALARY + totalOtherIncome;

    // 1. Calculate Total 80C
    const investments80C = declarations.filter(d => d.section === '80C').reduce((sum, d) => sum + d.amount, 0);
    const hlPrincipal = homeLoanEnabled ? (homeLoanDetails.principal || 0) : 0;
    // Let out principal is also part of 80C usually, but let's keep it simple or sum it
    const letOutPrincipal = letOutEnabled ? letOutProperties.reduce((sum, p) => sum + (p.hasHomeLoan ? p.principal : 0), 0) : 0;
    
    const total80C = Math.min(investments80C + hlPrincipal + letOutPrincipal, 150000);

    // 2. Calculate 80D
    const investments80D = declarations.filter(d => d.section === '80D').reduce((sum, d) => sum + d.amount, 0);
    const total80D = Math.min(investments80D, 100000); // Simplified cap for Self+Parents

    // 3. HRA Exemption (Simplified)
    // Actual HRA logic: Min(Actual HRA, Rent - 10% Basic, 50% Basic)
    // Assume Basic = 50% of Gross
    const basicSalary = ANNUAL_GROSS_SALARY * 0.5;
    const hraReceived = basicSalary * 0.4; // 40% of basic usually
    const totalRentPaid = hraEnabled ? rentedHouses.reduce((sum, h) => sum + (h.amount * 12), 0) : 0;
    const rentMinus10Basic = Math.max(0, totalRentPaid - (basicSalary * 0.1));
    const hraExemption = Math.min(hraReceived, rentMinus10Basic);

    // 4. Section 24 (Home Loan Interest)
    const selfOccupiedInterest = homeLoanEnabled ? Math.min(homeLoanDetails.interest, 200000) : 0;
    const letOutLoss = letOutEnabled ? letOutProperties.reduce((sum, p) => {
        const nav = Math.max(0, p.annualRent - p.municipalTaxes);
        const stdDed = nav * 0.3;
        const interest = p.hasHomeLoan ? p.interest : 0;
        return (nav - stdDed - interest); // Negative value is loss
    }, 0) : 0;
    
    // Loss from house property can be set off against salary up to 2L
    const totalHousePropertyLoss = Math.min(Math.abs(Math.min(0, letOutLoss - selfOccupiedInterest)), 200000);

    // 5. Other Deductions
    const otherDeductions = declarations.filter(d => d.section === 'OTHERS').reduce((sum, d) => {
        const limit = OTHER_SECTION_LIMITS[d.title];
        return sum + (limit ? Math.min(d.amount, limit) : d.amount);
    }, 0);

    // 6. Section 80TTA (Savings Interest Deduction for Old Regime, max 10k)
    const ded80TTA = otherIncomeEnabled ? Math.min(otherIncomeDetails.savingsInterest, 10000) : 0;

    const totalDeductionsOld = total80C + total80D + hraExemption + totalHousePropertyLoss + otherDeductions + ded80TTA + 50000; // + Std Deduction

    // Tax Calculations
    const calculateTaxLiability = (regime: 'OLD' | 'NEW') => {
        let taxableIncome = 0;
        let tax = 0;

        if (regime === 'OLD') {
            taxableIncome = Math.max(0, grossTotalIncome - totalDeductionsOld);
            // Old Slab (FY 25-26 Assumed same)
            if (taxableIncome > 1000000) { tax += (taxableIncome - 1000000) * 0.3; taxableIncome = 1000000; }
            if (taxableIncome > 500000) { tax += (taxableIncome - 500000) * 0.2; taxableIncome = 500000; }
            if (taxableIncome > 250000) { tax += (taxableIncome - 250000) * 0.05; }
        } else {
            // New Regime (FY 25-26 Budget) - Std Ded 75k
            taxableIncome = Math.max(0, grossTotalIncome - 75000);
            
            // New Slabs
            if (taxableIncome > 2400000) { tax += (taxableIncome - 2400000) * 0.3; taxableIncome = 2400000; }
            if (taxableIncome > 2000000) { tax += (taxableIncome - 2000000) * 0.25; taxableIncome = 2000000; }
            if (taxableIncome > 1600000) { tax += (taxableIncome - 1600000) * 0.20; taxableIncome = 1600000; }
            if (taxableIncome > 1200000) { tax += (taxableIncome - 1200000) * 0.15; taxableIncome = 1200000; }
            if (taxableIncome > 800000) { tax += (taxableIncome - 800000) * 0.10; taxableIncome = 800000; }
            if (taxableIncome > 400000) { tax += (taxableIncome - 400000) * 0.05; }
        }
        return Math.round(tax * 1.04); // 4% Cess
    };

    return {
        oldRegimeTax: calculateTaxLiability('OLD'),
        newRegimeTax: calculateTaxLiability('NEW'),
        totalDeductionsOld,
        grossTotalIncome
    };
  }, [declarations, hraEnabled, rentedHouses, homeLoanEnabled, homeLoanDetails, letOutEnabled, letOutProperties, otherIncomeEnabled, otherIncomeDetails]);


  // Helper for limit checking
  const getLimitWarning = (title: string, amount: number) => {
    const limit = OTHER_SECTION_LIMITS[title];
    if (limit && amount > limit) {
      return `Max limit is ₹${limit.toLocaleString()}`;
    }
    return null;
  };

  // Generic Handlers
  const addNewRow = (section: string) => {
    setDeclarations([...declarations, {
        id: Date.now(),
        section,
        title: '',
        amount: 0,
        isExpanded: true,
        proofs: 0,
        files: []
    }]);
  };

  const handleDeleteRow = (id: number) => {
     setDeclarations(declarations.filter((d) => d.id !== id));
  };

  const handleAmountChange = (id: number, value: string) => {
    setDeclarations(declarations.map(d => d.id === id ? { ...d, amount: parseFloat(value) || 0 } : d));
  };

  const toggleExpand = (id: number) => {
    setDeclarations(declarations.map(d => d.id === id ? { ...d, isExpanded: !d.isExpanded } : d));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeUploadId && e.target.files && e.target.files.length > 0) {
        const fileNames = Array.from(e.target.files).map((f: any) => f.name);
        setDeclarations(declarations.map(d => {
            if (d.id === activeUploadId) {
                return { 
                    ...d, 
                    files: [...d.files, ...fileNames], 
                    proofs: d.proofs + fileNames.length 
                };
            }
            return d;
        }));
    }
    setActiveUploadId(null);
  };

  const deleteFile = (rowId: number, fileName: string) => {
      setDeclarations(declarations.map(d => {
          if (d.id === rowId) {
              const newFiles = d.files.filter(f => f !== fileName);
              return { ...d, files: newFiles, proofs: newFiles.length };
          }
          return d;
      }));
  };

  // HRA Handlers
  const updateHouse = (id: number, field: string, value: any) => {
      setRentedHouses(rentedHouses.map(h => h.id === id ? { ...h, [field]: value } : h));
  };
  
  const removeHouse = (id: number) => {
      setRentedHouses(rentedHouses.filter(h => h.id !== id));
  };

  // Let Out Handlers
  const updateLetOutProperty = (id: number, field: string, value: any) => {
      setLetOutProperties(letOutProperties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeLetOutProperty = (id: number) => {
      setLetOutProperties(letOutProperties.filter(p => p.id !== id));
  };

  const onDraft = () => {
      setDeclarationStatus('DRAFT');
      setView('DASHBOARD');
  };

  const onSubmitClick = () => {
      setShowConfirmModal(true);
  };

  const onConfirmSubmit = () => {
      setIsSubmitting(true);
      setTimeout(() => {
          setDeclarationStatus('SUBMITTED');
          setIsSubmitting(false);
          setShowConfirmModal(false);
          setView('DASHBOARD');
      }, 1500);
  };

  const sections = [
    { code: 'HRA', name: 'Do you stay in a Rented house?', description: 'Rent paid for accommodation', limit: 'Exemption based on Rent Paid', availableInNew: false },
    { code: 'HOME_LOAN', name: 'Are you paying a home loan on a self-occupied home?', description: 'Principal & Interest deduction', limit: 'Sec 80C & Sec 24', availableInNew: false },
    { code: 'LET_OUT', name: 'Do you have a let out property with or without rental income?', description: 'Rental Income & Interest Deduction', limit: 'Income from House Property', availableInNew: false },
    { code: 'OTHER_INCOME', name: 'Other Sources of Income', description: 'Declare income from other sources including savings interest.', limit: 'Taxable Income', availableInNew: true },
    { code: '80C', name: 'Section 80C', description: 'Declare investments such as LIC premium, mutual funds and PPF under this section. The maximum tax saving limit is 1,50,000 INR under this section.', limit: '', availableInNew: false },
    { code: '80D', name: 'Section 80D', description: 'Declare the mediclaim insurance policies for yourself, spouse, children and parents. The maximum tax saving limit is 1,00,000 INR under this section.', limit: '', availableInNew: false },
    { code: 'OTHERS', name: 'Other Investments & Exemptions', description: 'Declare other investments & exemptions such as Voluntary NPS, Interest Paid on Education Loan and Medical Expenses under this section.', limit: '', availableInNew: true },
  ];

  const historyData = [
    {
      year: 'FY 2024-25',
      items: [
        { type: '80C Investments', amount: 150000, date: '15 Jan 2025', status: 'Approved' },
        { type: 'Medical Insurance (80D)', amount: 25000, date: '12 Jan 2025', status: 'Approved' },
        { type: 'HRA Rent Receipts', amount: 240000, date: '10 Jan 2025', status: 'Approved' }
      ]
    },
    {
      year: 'FY 2023-24',
      items: [
        { type: '80C Investments', amount: 150000, date: '20 Jan 2024', status: 'Approved' },
        { type: 'Medical Insurance (80D)', amount: 20000, date: '18 Jan 2024', status: 'Approved' },
        { type: 'HRA Rent Receipts', amount: 216000, date: '15 Jan 2024', status: 'Approved' }
      ]
    },
    {
      year: 'FY 2022-23',
      items: [
         { type: '80C Investments', amount: 145000, date: '22 Jan 2023', status: 'Approved' },
         { type: 'Medical Insurance (80D)', amount: 15000, date: '22 Jan 2023', status: 'Approved' }
      ]
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
       {/* My Investments Header Card */}
       <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center">
                <Layers size={28} className="text-blue-600"/>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
             </div>
             <div>
                 <h1 className="text-2xl font-bold text-slate-800">My Investments</h1>
                 <p className="text-slate-500 text-sm">Manage your tax declarations and proofs</p>
             </div>
          </div>
          <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block mr-2"></span> Simulate Rejection
              </button>
               <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lock Declarations
               </button>
          </div>
       </div>

       {/* Green Banner */}
       <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0"><Clock size={20}/></div>
          <p className="text-sm font-bold text-emerald-800">Investment Declarations Open – Submit by 15 Jan 2026</p>
       </div>

       {/* Hero Card */}
       <div className="bg-[#0f172a] rounded-[32px] p-10 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-40 translate-x-40 blur-3xl pointer-events-none"></div>
          
          <div className="space-y-8 z-10 max-w-xl relative">
             <div>
                <h2 className="text-4xl font-bold mb-3 tracking-tight">Tax Planning FY 2025-26</h2>
                <p className="text-slate-400 text-lg leading-relaxed">Optimize your taxes. Compare regimes, declare investments, and upload proofs to save maximum tax.</p>
             </div>
             
             <div>
                <button 
                  onClick={() => setView('PLANNING')} 
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center gap-3 shadow-lg shadow-blue-900/20 group"
                >
                   {declarationStatus === 'NEW' ? 'Start Planning' : declarationStatus === 'DRAFT' ? 'Continue Planning' : 'View Submission'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </button>
                <div className="flex items-center gap-6 mt-4 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-2"><Clock size={16}/> Window closes Jan 20</span>
                    <span className="text-amber-500 font-bold">25 days remaining</span>
                    {declarationStatus === 'DRAFT' && <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-xs">Draft Saved</span>}
                    {declarationStatus === 'SUBMITTED' && <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs flex items-center gap-1"><CheckCircle size={10}/> Submitted</span>}
                </div>
             </div>
          </div>
          
          {/* TDS Projection Box - Dynamic */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl w-full lg:w-96 backdrop-blur-md relative z-10">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Current TDS Projection</p>
             <div className="space-y-5">
                <div className="flex justify-between items-center">
                   <span className="text-base font-bold text-white">New Regime</span>
                   <span className="text-2xl font-bold text-emerald-400">₹ {taxCalc.newRegimeTax.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-700/50"></div>
                <div className="flex justify-between items-center">
                   <span className="text-base font-medium text-slate-400">Old Regime</span>
                   <span className="text-xl font-bold text-slate-500">₹ {taxCalc.oldRegimeTax.toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                   {taxCalc.oldRegimeTax < taxCalc.newRegimeTax ? (
                       <p className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                           <TrendingDown size={14} /> Old Regime saves ₹ {(taxCalc.newRegimeTax - taxCalc.oldRegimeTax).toLocaleString()}
                       </p>
                   ) : (
                       <p className="text-xs text-blue-400 font-bold flex items-center gap-2">
                           <Zap size={14} /> New Regime saves ₹ {(taxCalc.oldRegimeTax - taxCalc.newRegimeTax).toLocaleString()}
                       </p>
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Previous Declarations */}
       <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 pl-1">Previous FY Declarations</h3>
          
          {historyData.map((data) => (
             <div key={data.year} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                <div 
                   onClick={() => setExpandedYear(expandedYear === data.year ? null : data.year)}
                   className={`px-8 py-5 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors ${expandedYear === data.year ? 'bg-slate-50/50 border-b border-slate-200' : ''}`}
                >
                   <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-lg transition-colors ${expandedYear === data.year ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          <FileText size={20}/>
                       </div>
                       <span className={`font-bold text-lg ${expandedYear === data.year ? 'text-slate-700' : 'text-slate-600'}`}>{data.year}</span>
                   </div>
                   {expandedYear === data.year ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                </div>
                
                {expandedYear === data.year && (
                   <div className="p-0 animate-in fade-in slide-in-from-top-2 duration-200">
                      <table className="w-full text-left text-sm">
                          <thead className="text-[11px] font-bold text-slate-400 uppercase bg-white border-b border-slate-100">
                              <tr>
                                  <th className="px-8 py-4 tracking-wider">Declaration Type</th>
                                  <th className="px-8 py-4 tracking-wider">Amount</th>
                                  <th className="px-8 py-4 tracking-wider">Date</th>
                                  <th className="px-8 py-4 text-right tracking-wider">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {data.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-8 py-5 font-bold text-slate-700">{item.type}</td>
                                      <td className="px-8 py-5 font-bold text-slate-900">₹ {item.amount.toLocaleString()}</td>
                                      <td className="px-8 py-5 text-slate-500 font-medium">{item.date}</td>
                                      <td className="px-8 py-5 text-right">
                                          <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1.5">
                                              <CheckCircle size={14}/> {item.status}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                   </div>
                )}
             </div>
          ))}
       </div>
    </div>
  );

  return (
     <div className="pb-10 max-w-[1400px] mx-auto">
        {view === 'DASHBOARD' ? renderDashboard() : (
           <div className="space-y-6 animate-fade-in-up">
              
              {/* Planning Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('DASHBOARD')}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Tax Planning {declarationStatus === 'SUBMITTED' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-2 align-middle border border-emerald-200">Submitted</span>}</h1>
                        <p className="text-sm text-slate-500 font-medium">Select your regime and declare investments</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     {/* Edit Button for Submitted Mode */}
                     {isReadOnly && !isDeadlinePassed && (
                        <button 
                            onClick={() => setDeclarationStatus('DRAFT')}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Edit2 size={16} /> Edit Declaration
                        </button>
                     )}

                     {/* Regime Switcher / Display */}
                     {isReadOnly ? (
                        <div className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm border ${planningRegime === 'OLD' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                           {planningRegime === 'OLD' ? 'Old Regime Selected' : 'New Regime Selected'}
                           <CheckCircle size={16} className="fill-current" />
                        </div>
                     ) : (
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button 
                                onClick={() => setPlanningRegime('OLD')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${planningRegime === 'OLD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Old Regime
                            </button>
                            <button 
                                onClick={() => setPlanningRegime('NEW')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${planningRegime === 'NEW' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                New Regime <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">Default</span>
                            </button>
                        </div>
                     )}
                  </div>
              </div>

              {/* Sticky Calculation Bar */}
              <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4">
                 <div className="flex items-center gap-6 divide-x divide-slate-200">
                     <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Income</p>
                         <p className="text-lg font-bold text-slate-800">₹ {taxCalc.grossTotalIncome.toLocaleString()}</p>
                     </div>
                     <div className="pl-6">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Deductions (Old)</p>
                         <p className="text-lg font-bold text-emerald-600">₹ {taxCalc.totalDeductionsOld.toLocaleString()}</p>
                     </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                     <div className={`px-4 py-2 rounded-xl border flex flex-col items-center ${planningRegime === 'OLD' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Old Tax Liability</p>
                         <p className={`text-xl font-black ${planningRegime === 'OLD' ? 'text-blue-700' : 'text-slate-700'}`}>₹ {taxCalc.oldRegimeTax.toLocaleString()}</p>
                     </div>
                     <div className={`px-4 py-2 rounded-xl border flex flex-col items-center ${planningRegime === 'NEW' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">New Tax Liability</p>
                         <p className={`text-xl font-black ${planningRegime === 'NEW' ? 'text-blue-700' : 'text-slate-700'}`}>₹ {taxCalc.newRegimeTax.toLocaleString()}</p>
                     </div>
                 </div>
              </div>

              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              
              {/* Sections Rendering */}
              {planningRegime === 'NEW' && (
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                     <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                     <p className="text-sm text-blue-800">
                         <strong>New Regime Selected:</strong> Most deductions like 80C, 80D, HRA, and Home Loan interest are not applicable. Standard Deduction of ₹75,000 is automatically applied. You may still declare specific investments under 'Others' if eligible (e.g. Employer NPS).
                     </p>
                 </div>
              )}

              {sections.map((section) => {
                 // Skip incompatible sections if New Regime is selected
                 if (planningRegime === 'NEW' && !section.availableInNew) return null;

                 if (section.code === 'HRA') {
                    return (
                       <div key={section.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                             <div>
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{section.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{section.description}</p>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                {hraEnabled && (
                                  <button 
                                      onClick={() => !isReadOnly && setIsHraSaved(!isHraSaved)}
                                      disabled={isReadOnly}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isHraSaved ? 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title={isHraSaved ? "Edit Details" : "Save Details"}
                                  >
                                      {isHraSaved ? <Edit2 size={14} /> : <Check size={16} />}
                                  </button>
                                )}

                                {/* Toggle Switch */}
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold ${hraEnabled ? 'text-blue-600' : 'text-slate-400'}`}>{hraEnabled ? 'Yes' : 'No'}</span>
                                    <button 
                                       onClick={() => {
                                          if (!isHraSaved && !isReadOnly) {
                                            setHraEnabled(!hraEnabled);
                                            if (hraEnabled) setIsHraSaved(false);
                                          }
                                       }}
                                       disabled={isHraSaved || isReadOnly}
                                       className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${hraEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'} ${(isHraSaved || isReadOnly) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                       <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                    </button>
                                </div>
                             </div>
                          </div>

                          {hraEnabled && (
                             <div className="p-6 space-y-6">
                                {rentedHouses.map((house, index) => (
                                   <div key={house.id} className={`relative animate-fade-in-up ${isHraSaved ? 'opacity-70' : ''}`}>
                                      {index > 0 && !isHraSaved && !isReadOnly && <div className="absolute top-0 right-0"><button onClick={() => removeHouse(house.id)} className="text-red-500"><X size={16}/></button></div>}
                                      <h4 className="text-sm font-bold text-slate-800 mb-4">House Rent Details {rentedHouses.length > 1 ? `#${index+1}` : ''}</h4>
                                      
                                      <div className="grid grid-cols-12 gap-6">
                                         {/* Row 1 */}
                                         <div className="col-span-6">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Rental Period</label>
                                            <div className="flex items-center gap-2">
                                               <input 
                                                 type="date" 
                                                 value={house.from} 
                                                 disabled={isHraSaved || isReadOnly}
                                                 onChange={(e) => updateHouse(house.id, 'from', e.target.value)}
                                                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50" 
                                               />
                                               <span className="text-slate-400 text-xs">To</span>
                                               <input 
                                                 type="date" 
                                                 value={house.to}
                                                 disabled={isHraSaved || isReadOnly}
                                                 onChange={(e) => updateHouse(house.id, 'to', e.target.value)}
                                                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50"
                                               />
                                            </div>
                                         </div>
                                         <div className="col-span-6 md:col-span-4 md:col-start-9">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Amount / Month</label>
                                            <div className="relative">
                                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                               <input 
                                                  type="number" 
                                                  value={house.amount}
                                                  disabled={isHraSaved || isReadOnly}
                                                  onChange={(e) => updateHouse(house.id, 'amount', Number(e.target.value))}
                                                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                               />
                                            </div>
                                         </div>

                                         {/* Row 2 */}
                                         <div className="col-span-12">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Address</label>
                                            <input 
                                              type="text" 
                                              value={house.address}
                                              disabled={isHraSaved || isReadOnly}
                                              onChange={(e) => updateHouse(house.id, 'address', e.target.value)}
                                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50" 
                                            />
                                         </div>

                                         {/* Row 3 */}
                                         <div className="col-span-12">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Landlord Name</label>
                                            <input 
                                              type="text" 
                                              value={house.landlord}
                                              disabled={isHraSaved || isReadOnly}
                                              onChange={(e) => updateHouse(house.id, 'landlord', e.target.value)}
                                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50" 
                                            />
                                         </div>

                                         {/* Row 4 */}
                                         <div className="col-span-4">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Urbanization Type</label>
                                            <select 
                                              value={house.cityType}
                                              disabled={isHraSaved || isReadOnly}
                                              onChange={(e) => updateHouse(house.id, 'cityType', e.target.value)}
                                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 bg-white disabled:bg-slate-50"
                                            >
                                               <option>Metro</option>
                                               <option>Non-Metro</option>
                                            </select>
                                         </div>
                                          <div className="col-span-5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">LANDLORD'S PAN</label>
                                            <input 
                                              type="text" 
                                              value={house.pan}
                                              disabled={isHraSaved || isReadOnly}
                                              onChange={(e) => updateHouse(house.id, 'pan', e.target.value)}
                                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 uppercase disabled:bg-slate-50" 
                                            />
                                         </div>
                                      </div>
                                   </div>
                                ))}

                                {!isHraSaved && !isReadOnly && (
                                  <button 
                                     onClick={() => setRentedHouses([...rentedHouses, { id: Date.now(), from: '', to: '', amount: 0, address: '', landlord: '', cityType: 'Non-Metro', pan: '' }])}
                                     className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1"
                                  >
                                     <Plus size={16} className="bg-blue-100 rounded-full p-0.5"/> Add Rented House
                                  </button>
                                )}
                             </div>
                          )}
                       </div>
                    );
                 } else if (section.code === 'HOME_LOAN') {
                    return (
                       <div key={section.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                             <div>
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{section.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{section.description}</p>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                {homeLoanEnabled && (
                                  <button 
                                      onClick={() => !isReadOnly && setIsHomeLoanSaved(!isHomeLoanSaved)}
                                      disabled={isReadOnly}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isHomeLoanSaved ? 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title={isHomeLoanSaved ? "Edit Details" : "Save Details"}
                                  >
                                      {isHomeLoanSaved ? <Edit2 size={14} /> : <Check size={16} />}
                                  </button>
                                )}

                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold ${homeLoanEnabled ? 'text-blue-600' : 'text-slate-400'}`}>{homeLoanEnabled ? 'Yes' : 'No'}</span>
                                    <button 
                                       onClick={() => {
                                          if (!isHomeLoanSaved && !isReadOnly) {
                                            setHomeLoanEnabled(!homeLoanEnabled);
                                            if (homeLoanEnabled) setIsHomeLoanSaved(false);
                                          }
                                       }}
                                       disabled={isHomeLoanSaved || isReadOnly}
                                       className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${homeLoanEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'} ${(isHomeLoanSaved || isReadOnly) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                       <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                    </button>
                                </div>
                             </div>
                          </div>

                          {homeLoanEnabled && (
                             <div className={`p-6 space-y-6 animate-fade-in-up ${isHomeLoanSaved ? 'opacity-70' : ''}`}>
                                <div className="grid grid-cols-12 gap-6">
                                   {/* Principal */}
                                   <div className="col-span-12 md:col-span-6">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Principal Paid on Home Loan</label>
                                      <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input 
                                              type="number" 
                                              value={homeLoanDetails.principal}
                                              disabled={isHomeLoanSaved || isReadOnly}
                                              onChange={(e) => setHomeLoanDetails({...homeLoanDetails, principal: Number(e.target.value)})}
                                              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-1 italic">This will be automatically included in the 80C section</p>
                                   </div>

                                   {/* Interest */}
                                   <div className="col-span-12 md:col-span-6">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest Paid on Home Loan</label>
                                      <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input 
                                              type="number" 
                                              value={homeLoanDetails.interest}
                                              disabled={isHomeLoanSaved || isReadOnly}
                                              onChange={(e) => setHomeLoanDetails({...homeLoanDetails, interest: Number(e.target.value)})}
                                              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-1 italic">This will be automatically included in the Section 24</p>
                                   </div>

                                   {/* Lender Name */}
                                   <div className="col-span-12">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Name of the Lender</label>
                                      <input 
                                          type="text" 
                                          value={homeLoanDetails.lender}
                                          disabled={isHomeLoanSaved || isReadOnly}
                                          onChange={(e) => setHomeLoanDetails({...homeLoanDetails, lender: e.target.value})}
                                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50" 
                                      />
                                   </div>

                                   {/* Lender PAN */}
                                   <div className="col-span-12 md:col-span-6">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Lender PAN</label>
                                      <input 
                                          type="text" 
                                          value={homeLoanDetails.lenderPan}
                                          disabled={isHomeLoanSaved || isReadOnly}
                                          onChange={(e) => setHomeLoanDetails({...homeLoanDetails, lenderPan: e.target.value})}
                                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 uppercase disabled:bg-slate-50" 
                                      />
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    );
                 } else if (section.code === 'LET_OUT') {
                    return (
                       <div key={section.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                             <div>
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{section.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{section.description}</p>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                {letOutEnabled && (
                                  <button 
                                      onClick={() => !isReadOnly && setIsLetOutSaved(!isLetOutSaved)}
                                      disabled={isReadOnly}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLetOutSaved ? 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title={isLetOutSaved ? "Edit Details" : "Save Details"}
                                  >
                                      {isLetOutSaved ? <Edit2 size={14} /> : <Check size={16} />}
                                  </button>
                                )}

                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold ${letOutEnabled ? 'text-blue-600' : 'text-slate-400'}`}>{letOutEnabled ? 'Yes' : 'No'}</span>
                                    <button 
                                       onClick={() => {
                                          if (!isLetOutSaved && !isReadOnly) {
                                            setLetOutEnabled(!letOutEnabled);
                                            if (letOutEnabled) setIsLetOutSaved(false);
                                          }
                                       }}
                                       disabled={isLetOutSaved || isReadOnly}
                                       className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${letOutEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'} ${(isLetOutSaved || isReadOnly) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                       <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                    </button>
                                </div>
                             </div>
                          </div>

                          {letOutEnabled && (
                             <div className={`p-6 space-y-8 animate-fade-in-up ${isLetOutSaved ? 'opacity-70' : ''}`}>
                                {letOutProperties.map((property, index) => {
                                   const nav = Math.max(0, property.annualRent - property.municipalTaxes);
                                   const stdDed = Math.round(nav * 0.3);
                                   const netIncome = nav - stdDed - (property.hasHomeLoan ? property.interest : 0);
                                   
                                   return (
                                   <div key={property.id} className="relative border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                                      {index > 0 && !isLetOutSaved && !isReadOnly && <div className="absolute top-0 right-0"><button onClick={() => removeLetOutProperty(property.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button></div>}
                                      <h4 className="text-sm font-bold text-slate-800 mb-4">Property Details {letOutProperties.length > 1 ? `#${index+1}` : ''}</h4>
                                      
                                      <div className="grid grid-cols-12 gap-6">
                                         {/* Annual Rent */}
                                         <div className="col-span-12 md:col-span-6">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Annual Rent Received</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={property.annualRent}
                                                    disabled={isLetOutSaved || isReadOnly}
                                                    onChange={(e) => updateLetOutProperty(property.id, 'annualRent', Number(e.target.value))}
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                />
                                            </div>
                                         </div>

                                         {/* Municipal Taxes */}
                                         <div className="col-span-12 md:col-span-6">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Municipal Taxes Paid</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={property.municipalTaxes}
                                                    disabled={isLetOutSaved || isReadOnly}
                                                    onChange={(e) => updateLetOutProperty(property.id, 'municipalTaxes', Number(e.target.value))}
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                />
                                            </div>
                                         </div>

                                         {/* Net Annual Value */}
                                         <div className="col-span-12 md:col-span-6">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Net Annual Value</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={nav}
                                                    disabled={true}
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 bg-slate-100 outline-none text-right cursor-not-allowed"
                                                />
                                            </div>
                                         </div>

                                         {/* Standard Deduction */}
                                         <div className="col-span-12 md:col-span-6">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Standard Deduction (@ 30% of Net Annual Value)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={stdDed}
                                                    disabled={true}
                                                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 bg-slate-100 outline-none text-right cursor-not-allowed"
                                                />
                                            </div>
                                         </div>

                                         {/* Checkbox */}
                                         <div className="col-span-12">
                                            <label className="flex items-center gap-2 cursor-pointer w-fit">
                                               <input 
                                                  type="checkbox" 
                                                  checked={property.hasHomeLoan}
                                                  disabled={isLetOutSaved || isReadOnly}
                                                  onChange={(e) => updateLetOutProperty(property.id, 'hasHomeLoan', e.target.checked)}
                                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                               />
                                               <span className="text-sm font-medium text-slate-700">Repaying Home Loan for This Property</span>
                                            </label>
                                         </div>

                                         {/* Home Loan Fields - Conditional */}
                                         {property.hasHomeLoan && (
                                            <>
                                                <div className="col-span-12 md:col-span-6 animate-fade-in">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Principal Paid On Home Loan</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                        <input 
                                                            type="number" 
                                                            value={property.principal}
                                                            disabled={isLetOutSaved || isReadOnly}
                                                            onChange={(e) => updateLetOutProperty(property.id, 'principal', Number(e.target.value))}
                                                            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-12 md:col-span-6 animate-fade-in">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest Paid on Home Loan</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                        <input 
                                                            type="number" 
                                                            value={property.interest}
                                                            disabled={isLetOutSaved || isReadOnly}
                                                            onChange={(e) => updateLetOutProperty(property.id, 'interest', Number(e.target.value))}
                                                            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-12 md:col-span-6 animate-fade-in">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Name of the Lender</label>
                                                    <input 
                                                        type="text" 
                                                        value={property.lender}
                                                        disabled={isLetOutSaved || isReadOnly}
                                                        onChange={(e) => updateLetOutProperty(property.id, 'lender', e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50" 
                                                    />
                                                </div>
                                                <div className="col-span-12 md:col-span-6 animate-fade-in">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Lender PAN</label>
                                                    <input 
                                                        type="text" 
                                                        value={property.lenderPan}
                                                        disabled={isLetOutSaved || isReadOnly}
                                                        onChange={(e) => updateLetOutProperty(property.id, 'lenderPan', e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 uppercase disabled:bg-slate-50" 
                                                    />
                                                </div>
                                            </>
                                         )}

                                         {/* Net Income/Loss */}
                                         <div className="col-span-12">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Net Income/Loss from House Property</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={netIncome}
                                                    disabled={true}
                                                    className={`w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none text-right cursor-not-allowed bg-slate-100 ${netIncome < 0 ? 'text-red-500' : 'text-slate-900'}`}
                                                />
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                   );
                                })}

                                {!isLetOutSaved && !isReadOnly && (
                                  <button 
                                     onClick={() => setLetOutProperties([...letOutProperties, { 
                                       id: Date.now(), 
                                       annualRent: 0, 
                                       municipalTaxes: 0, 
                                       hasHomeLoan: false,
                                       principal: 0,
                                       interest: 0,
                                       lender: '',
                                       lenderPan: ''
                                     }])}
                                     className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1"
                                  >
                                     <Plus size={16} className="bg-blue-100 rounded-full p-0.5"/> Add a Let Out Property
                                  </button>
                                )}
                             </div>
                          )}
                       </div>
                    );
                 } else if (section.code === 'OTHER_INCOME') {
                    return (
                       <div key={section.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                             <div>
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{section.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{section.description}</p>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                {otherIncomeEnabled && (
                                  <button 
                                      onClick={() => !isReadOnly && setIsOtherIncomeSaved(!isOtherIncomeSaved)}
                                      disabled={isReadOnly}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOtherIncomeSaved ? 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title={isOtherIncomeSaved ? "Edit Details" : "Save Details"}
                                  >
                                      {isOtherIncomeSaved ? <Edit2 size={14} /> : <Check size={16} />}
                                  </button>
                                )}

                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold ${otherIncomeEnabled ? 'text-blue-600' : 'text-slate-400'}`}>{otherIncomeEnabled ? 'Yes' : 'No'}</span>
                                    <button 
                                       onClick={() => {
                                          if (!isOtherIncomeSaved && !isReadOnly) {
                                            setOtherIncomeEnabled(!otherIncomeEnabled);
                                            if (otherIncomeEnabled) setIsOtherIncomeSaved(false);
                                          }
                                       }}
                                       disabled={isOtherIncomeSaved || isReadOnly}
                                       className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${otherIncomeEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'} ${(isOtherIncomeSaved || isReadOnly) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                       <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                    </button>
                                </div>
                             </div>
                          </div>

                          {otherIncomeEnabled && (
                             <div className={`p-6 space-y-6 animate-fade-in-up ${isOtherIncomeSaved ? 'opacity-70' : ''}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="col-span-1 md:col-span-2">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Income from other sources</label>
                                      <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input 
                                              type="number" 
                                              value={otherIncomeDetails.otherSourceIncome}
                                              disabled={isOtherIncomeSaved || isReadOnly}
                                              onChange={(e) => setOtherIncomeDetails({...otherIncomeDetails, otherSourceIncome: Number(e.target.value)})}
                                              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                      </div>
                                   </div>

                                   <div className="col-span-1 md:col-span-2">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest Earned from Savings Deposit</label>
                                      <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input 
                                              type="number" 
                                              value={otherIncomeDetails.savingsInterest}
                                              disabled={isOtherIncomeSaved || isReadOnly}
                                              onChange={(e) => setOtherIncomeDetails({...otherIncomeDetails, savingsInterest: Number(e.target.value)})}
                                              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                      </div>
                                   </div>

                                   <div className="col-span-1 md:col-span-2">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest Earned from Fixed Deposit</label>
                                      <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input 
                                              type="number" 
                                              value={otherIncomeDetails.fdInterest}
                                              disabled={isOtherIncomeSaved || isReadOnly}
                                              onChange={(e) => setOtherIncomeDetails({...otherIncomeDetails, fdInterest: Number(e.target.value)})}
                                              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                      </div>
                                   </div>

                                   <div className="col-span-1 md:col-span-2">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest Earned from National Savings Certificates</label>
                                      <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input 
                                              type="number" 
                                              value={otherIncomeDetails.nscInterest}
                                              disabled={isOtherIncomeSaved || isReadOnly}
                                              onChange={(e) => setOtherIncomeDetails({...otherIncomeDetails, nscInterest: Number(e.target.value)})}
                                              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                      </div>
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    );
                 } else {
                    // Generic Section Render
                    const total80C = declarations.filter(d => d.section === '80C').reduce((sum, d) => sum + d.amount, 0);
                    
                    return (
                       <div key={section.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                             <div>
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{section.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{section.description}{section.limit ? ` • ${section.limit}` : ''}</p>
                             </div>
                             {!isReadOnly && (
                                <button onClick={() => addNewRow(section.code)} className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all">
                                    <Plus size={14}/> Add
                                </button>
                             )}
                          </div>
                          
                          {section.code === '80C' && total80C > 150000 && (
                              <div className="px-6 py-2 bg-amber-50 text-amber-700 text-xs font-bold border-b border-amber-100 flex items-center gap-2">
                                  <Info size={14} /> Section 80C deduction is capped at ₹1,50,000.
                              </div>
                          )}
                          
                          <div className="divide-y divide-slate-100">
                             {declarations.filter((d) => d.section === section.code).length > 0 ? (
                                <>
                                   <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      <div className="col-span-4">{(section.code === '80C' || section.code === '80D' || section.code === 'OTHERS') ? 'Investment' : 'Description'}</div>
                                      <div className="col-span-3">{(section.code === '80C' || section.code === '80D' || section.code === 'OTHERS') ? 'Amount' : 'Declared Amount (₹)'}</div>
                                      <div className="col-span-3">{(section.code === '80C' || section.code === '80D' || section.code === 'OTHERS') ? 'Upload Proofs' : 'Proofs Uploaded'}</div>
                                      <div className="col-span-2 text-right">Actions</div>
                                   </div>
                                   
                                   {declarations.filter((d) => d.section === section.code).map((row: DeclarationRow) => (
                                      <React.Fragment key={row.id}>
                                         <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/30 ${row.isExpanded ? 'bg-blue-50/30' : ''}`}>
                                            {/* Section Info */}
                                            <div className="col-span-4">
                                               {section.code === '80C' ? (
                                                  <select
                                                     className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-sm font-medium text-slate-900 pb-1 cursor-pointer disabled:border-transparent disabled:bg-transparent"
                                                     value={row.title}
                                                     disabled={isReadOnly}
                                                     onChange={(e) => {
                                                        const newTitle = e.target.value;
                                                        setDeclarations(declarations.map((d) => d.id === row.id ? { ...d, title: newTitle } : d));
                                                     }}
                                                  >
                                                     <option value="" disabled>Select Investment Type</option>
                                                     <option value="Employee Provident Fund (EPF)">Employee Provident Fund (EPF)</option>
                                                     <option value="Life Insurance Premium (LIC)">Life Insurance Premium (LIC)</option>
                                                     <option value="Public Provident Fund (PPF)">Public Provident Fund (PPF)</option>
                                                     <option value="Unit-Linked Insurance Plan (ULIP)">Unit-Linked Insurance Plan (ULIP)</option>
                                                     <option value="National Savings Certificate (NSC)">National Savings Certificate (NSC)</option>
                                                     <option value="Mutual Fund (MF)">Mutual Fund (MF)</option>
                                                     <option value="Children’s Tuition Fees">Children’s Tuition Fees</option>
                                                     <option value="NABARD Bonds">NABARD Bonds</option>
                                                     <option value="Voluntary Provident Fund (VPF)">Voluntary Provident Fund (VPF)</option>
                                                     <option value="Tax-saving Fixed Deposit">Tax-saving Fixed Deposit</option>
                                                     <option value="Equity Linked Saving Scheme (ELSS)">Equity Linked Saving Scheme (ELSS)</option>
                                                     <option value="Senior Citizens Savings Scheme (SCSS)">Senior Citizens Savings Scheme (SCSS)</option>
                                                     <option value="Sukanya Samriddhi Yojana">Sukanya Samriddhi Yojana</option>
                                                     <option value="Principal repayment of home loan">Principal repayment of home loan</option>
                                                  </select>
                                               ) : section.code === '80D' ? (
                                                  <select
                                                     className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-sm font-medium text-slate-900 pb-1 cursor-pointer disabled:border-transparent disabled:bg-transparent"
                                                     value={row.title}
                                                     disabled={isReadOnly}
                                                     onChange={(e) => {
                                                        const newTitle = e.target.value;
                                                        setDeclarations(declarations.map((d) => d.id === row.id ? { ...d, title: newTitle } : d));
                                                     }}
                                                  >
                                                     <option value="" disabled>Select Investment Type</option>
                                                     <option value="Self, Spouse, Children (below 60 years)">Self, Spouse, Children (below 60 years)</option>
                                                     <option value="Self, Spouse, Children, & Parents (below 60 years)">Self, Spouse, Children, & Parents (below 60 years)</option>
                                                     <option value="Self, Spouse, Children (below 60 years) & Parents (Above 60 years)">Self, Spouse, Children (below 60 years) & Parents (Above 60 years)</option>
                                                     <option value="Self, Spouse, Children & Parents (Above 60 years)">Self, Spouse, Children & Parents (Above 60 years)</option>
                                                     <option value="Members of HUF (below 60 years)">Members of HUF (below 60 years)</option>
                                                     <option value="Members of HUF (above 60 years)">Members of HUF (above 60 years)</option>
                                                     <option value="Preventive Health checkup for Self, Spouse, Children">Preventive Health checkup for Self, Spouse, Children</option>
                                                     <option value="Preventive Health checkup for Self, Spouse, Children, & Parents (below 60 years)">Preventive Health checkup for Self, Spouse, Children, & Parents (below 60 years)</option>
                                                     <option value="Preventive Health checkup for Self, Spouse, Children (below 60 years) & Parents (Above 60 years)">Preventive Health checkup for Self, Spouse, Children (below 60 years) & Parents (Above 60 years)</option>
                                                     <option value="Preventive Health checkup for Self, Spouse, Children & Parents (Above 60 years)">Preventive Health checkup for Self, Spouse, Children & Parents (Above 60 years)</option>
                                                     <option value="Preventive Health checkup for Members of HUF (below 60 years)">Preventive Health checkup for Members of HUF (below 60 years)</option>
                                                     <option value="Preventive Health checkup for Members of HUF (above 60 years)">Preventive Health checkup for Members of HUF (above 60 years)</option>
                                                  </select>
                                               ) : section.code === 'OTHERS' ? (
                                                  <select
                                                     className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-sm font-medium text-slate-900 pb-1 cursor-pointer disabled:border-transparent disabled:bg-transparent"
                                                     value={row.title}
                                                     disabled={isReadOnly}
                                                     onChange={(e) => {
                                                        const newTitle = e.target.value;
                                                        setDeclarations(declarations.map((d) => d.id === row.id ? { ...d, title: newTitle } : d));
                                                     }}
                                                  >
                                                     <option value="" disabled>Select Investment Type</option>
                                                     <option value="Section 80CCD(1B) - Additional Exemption on voluntary NPS">Section 80CCD(1B) - Additional Exemption on voluntary NPS</option>
                                                     <option value="Section 80E - Interest paid on Education Loan">Section 80E - Interest paid on Education Loan</option>
                                                     <option value="Section 80CCG - Rajiv Gandhi Equity Saving Scheme (RGESS)">Section 80CCG - Rajiv Gandhi Equity Saving Scheme (RGESS)</option>
                                                     <option value="Section 80DD - Treatment of dependent with disability">Section 80DD - Treatment of dependent with disability</option>
                                                     <option value="Section 80DD - Treatment of dependent with severe disability">Section 80DD - Treatment of dependent with severe disability</option>
                                                     <option value="Section 80DDB - Medical Treatment of Specified Diseases (Below 60 years)">Section 80DDB - Medical Treatment of Specified Diseases (Below 60 years)</option>
                                                     <option value="Section 80DDB - Medical Treatment of Specified Diseases (Above 60 years)">Section 80DDB - Medical Treatment of Specified Diseases (Above 60 years)</option>
                                                     <option value="Section 80G - Donations">Section 80G - Donations</option>
                                                  </select>
                                               ) : (
                                                  <input 
                                                    type="text" 
                                                    placeholder="Enter description (e.g. LIC Policy No...)"
                                                    className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 pb-1 disabled:border-transparent disabled:bg-transparent"
                                                    value={row.title}
                                                    disabled={isReadOnly}
                                                    onChange={(e) => {
                                                       const newTitle = e.target.value;
                                                       setDeclarations(declarations.map((d) => d.id === row.id ? { ...d, title: newTitle } : d));
                                                    }}
                                                  />
                                               )}
                                            </div>

                                            {/* Amount Input */}
                                            <div className="col-span-3">
                                               <div className="relative group">
                                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold group-hover:text-blue-500">₹</span>
                                                  <input 
                                                    type="number" 
                                                    value={row.amount} 
                                                    disabled={isReadOnly}
                                                    onChange={(e) => handleAmountChange(row.id, e.target.value)}
                                                    className={`w-full pl-7 pr-3 py-2 bg-white border rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-blue-300 disabled:bg-slate-50 disabled:text-slate-500 ${
                                                        section.code === 'OTHERS' && getLimitWarning(row.title, row.amount) ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-200' : 'border-slate-200'
                                                    }`}
                                                  />
                                               </div>
                                               {section.code === 'OTHERS' && getLimitWarning(row.title, row.amount) && (
                                                   <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                                                       <AlertTriangle size={10} /> {getLimitWarning(row.title, row.amount)}
                                                   </p>
                                               )}
                                            </div>

                                            {/* Proofs Badge & Toggle */}
                                            <div className="col-span-3 flex items-center gap-2">
                                               <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${row.proofs > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                  <Paperclip size={12}/> {row.proofs}
                                               </span>
                                               <button 
                                                  onClick={() => toggleExpand(row.id)}
                                                  className={`p-1.5 rounded-lg border transition-all ${row.isExpanded ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-500'}`}
                                                  title="Upload Proofs"
                                               >
                                                  <Upload size={14}/>
                                               </button>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-2 flex justify-end gap-2">
                                               {!isReadOnly && (
                                                <button onClick={() => handleDeleteRow(row.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={14}/>
                                                </button>
                                               )}
                                            </div>
                                         </div>

                                         {/* Expandable Upload Area */}
                                         {row.isExpanded && (
                                            <div className="col-span-12 px-6 pb-6 pt-2 bg-slate-50/50 border-b border-slate-100">
                                               {!isReadOnly && (
                                                <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center transition-colors hover:bg-blue-50/30 hover:border-blue-300 group cursor-pointer"
                                                    onClick={() => { setActiveUploadId(row.id); fileInputRef.current?.click(); }}
                                                >
                                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform group-hover:text-blue-500 group-hover:bg-white">
                                                        <CloudUpload size={20}/>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-600">Click to upload proofs for {row.section}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                                </div>
                                               )}
                                               
                                               {/* File Thumbnails */}
                                               {row.files.length > 0 && (
                                                  <div className="flex flex-wrap gap-3 mt-4">
                                                     {row.files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                           <FileText size={14} className="text-blue-500"/>
                                                           <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">{file}</span>
                                                           {!isReadOnly && (
                                                            <button onClick={() => deleteFile(row.id, file)} className="text-slate-300 hover:text-red-500 transition-colors ml-1">
                                                                <X size={12}/>
                                                            </button>
                                                           )}
                                                        </div>
                                                     ))}
                                                  </div>
                                               )}
                                            </div>
                                         )}
                                      </React.Fragment>
                                   ))}
                                </>
                             ) : (
                                <div className="p-8 text-center text-slate-400 italic text-sm">
                                   No declarations added for {section.name}. Click "Add" to begin.
                                </div>
                             )}
                          </div>
                       </div>
                    );
                 }
              })}

              {/* Submission Controls */}
              <div className="space-y-4">
                 {/* Draft Banner */}
                 {!isReadOnly && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full"><Clock size={16}/></div>
                      <p className="text-xs font-bold text-amber-800">Currently in Draft – You can edit until submission or deadline.</p>
                  </div>
                 )}

                 <div className="flex gap-4">
                    {!isReadOnly && (
                        <button 
                        onClick={onDraft}
                        className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all"
                        >
                        <Save size={16}/> Save as Draft
                        </button>
                    )}
                    
                    <div className="flex-1 relative group">
                       <button 
                          onClick={!isReadOnly ? onSubmitClick : undefined}
                          disabled={isReadOnly}
                          className={`w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all ${isReadOnly ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'}`}
                       >
                          {isReadOnly ? (
                            declarationStatus === 'SUBMITTED' ? <><Lock size={16}/> Declarations Submitted</> : <><Lock size={16}/> Deadline Passed</>
                          ) : (
                            <><Send size={16}/> Submit Declarations</>
                          )}
                       </button>
                       {isReadOnly ? (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                             Edit not allowed after submission. Contact HR for changes.
                          </div>
                       ) : (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                             Once submitted, you cannot edit. Final for TDS calculation.
                          </div>
                       )}
                    </div>
                 </div>
                 
                 <p className="text-center text-[10px] font-medium text-slate-400 italic">
                    After 15 Jan 2026, declarations will lock automatically.
                 </p>
              </div>

              {/* Footer Info */}
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-center justify-center gap-3">
                 <Info size={18} className="text-blue-600"/>
                 <p className="text-xs font-medium text-blue-800">
                    Accurate declarations reduce your TDS. Max 80C limit: <span className="font-bold">₹1,50,000</span>. Contact HR for help.
                 </p>
              </div>
           </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center border-t-8 border-emerald-500 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <Send size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Submit Tax Declarations?</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                   Are you sure you want to submit your investment proofs? Once submitted, you <span className="font-bold text-slate-700">cannot edit</span> them. This will be considered final for TDS calculation.
                </p>
                <div className="flex gap-3">
                   <button 
                     onClick={() => setShowConfirmModal(false)}
                     disabled={isSubmitting}
                     className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                   >
                      Cancel
                   </button>
                   <button 
                     onClick={onConfirmSubmit}
                     disabled={isSubmitting}
                     className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                   >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} /> Confirm
                        </>
                      )}
                   </button>
                </div>
             </div>
          </div>
        )}
     </div>
  );
};

export default TaxPlanning;
