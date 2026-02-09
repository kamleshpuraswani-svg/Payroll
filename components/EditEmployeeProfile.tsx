
import React, { useState, useEffect, useRef } from 'react';
import {
   User,
   Camera,
   RefreshCw,
   CheckCircle,
   AlertCircle,
   Save,
   X,
   Building,
   CreditCard,
   FileText,
   Calculator,
   ArrowLeft,
   Briefcase,
   ShieldCheck,
   Search,
   Upload,
   ChevronDown,
   Calendar,
   Clock
} from 'lucide-react';

interface EditEmployeeProfileProps {
   onBack?: () => void;
   onViewHistory?: () => void;
   isReadOnly?: boolean;
}

const SALARY_STRUCTURES = [
   { id: 'S1', name: 'Standard IT 2025' },
   { id: 'S2', name: 'Standard Finance' },
   { id: 'S3', name: 'Internship Stipend' },
   { id: 'S4', name: 'Contractor Fixed' },
   { id: 'S5', name: 'Sales Commission Based' }
];

const EditEmployeeProfile: React.FC<EditEmployeeProfileProps> = ({ onBack, onViewHistory, isReadOnly = false }) => {
   const [ctc, setCtc] = useState<number>(1300000);
   const [regime, setRegime] = useState('New Regime (2025)');
   const [bankVerified, setBankVerified] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [selectedStructureId, setSelectedStructureId] = useState('S2');
   const [effectiveFrom, setEffectiveFrom] = useState('');
   const [errors, setErrors] = useState<{ effectiveFrom?: string }>({});

   // Refs to track initial values for change detection
   const initialValues = useRef({
      ctc: 1300000,
      structureId: 'S2'
   });

   // Helper to calculate estimated TDS for demo purposes
   const calculateEstTax = (amount: number, regimeType: 'OLD' | 'NEW') => {
      if (!amount) return 0;

      let taxable = amount;
      let tax = 0;

      if (regimeType === 'OLD') {
         // Estimate: Std Ded 50k + 80C 1.5L deduction assumption for quick calc
         taxable = Math.max(0, amount - 200000);

         // Old Slab: 2.5-5 (5%), 5-10 (20%), >10 (30%)
         if (taxable > 1000000) {
            tax += (taxable - 1000000) * 0.3;
            taxable = 1000000;
         }
         if (taxable > 500000) {
            tax += (taxable - 500000) * 0.2;
            taxable = 500000;
         }
         if (taxable > 250000) {
            tax += (taxable - 250000) * 0.05;
         }
      } else {
         // New Regime (FY 25-26): Std Ded 75k
         taxable = Math.max(0, amount - 75000);

         // New Slab: 0-4 (0), 4-8 (5), 8-12 (10), 12-16 (15), 16-20 (20), 20-24 (25), >24 (30)
         if (taxable > 2400000) { tax += (taxable - 2400000) * 0.3; taxable = 2400000; }
         if (taxable > 2000000) { tax += (taxable - 2000000) * 0.25; taxable = 2000000; }
         if (taxable > 1600000) { tax += (taxable - 1600000) * 0.20; taxable = 1600000; }
         if (taxable > 1200000) { tax += (taxable - 1200000) * 0.15; taxable = 1200000; }
         if (taxable > 800000) { tax += (taxable - 800000) * 0.10; taxable = 800000; }
         if (taxable > 400000) { tax += (taxable - 400000) * 0.05; }
      }

      // Add 4% Cess
      return Math.round(tax * 1.04);
   };

   // Salary Calculation
   const calculateSalary = (annualCtc: number) => {
      if (!annualCtc) return { basic: 0, hra: 0, special: 0, pfEmployer: 0, gratuity: 0, monthlyGross: 0, taxOld: 0, taxNew: 0 };

      const basic = annualCtc * 0.5;
      const hra = basic * 0.5;

      // PF Employer Contribution (12% of Basic, capped at 1800/mo usually, but using 21600 annual for demo)
      const pfEmployer = 21600;

      // Gratuity (4.81% of Basic approx)
      // Formula: (Basic / 26) * 15
      const gratuity = (basic / 26) * 15;

      const special = Math.max(0, annualCtc - basic - hra - pfEmployer - gratuity);

      // Monthly Gross = (Basic + HRA + Special) / 12
      const annualGross = basic + hra + special;
      const monthlyGross = annualGross / 12;

      const taxOld = calculateEstTax(annualCtc, 'OLD');
      const taxNew = calculateEstTax(annualCtc, 'NEW');

      return {
         basic,
         hra,
         special,
         pfEmployer,
         gratuity,
         monthlyGross,
         taxOld,
         taxNew
      };
   };

   const salary = calculateSalary(ctc);

   const handleSave = () => {
      // Check if critical fields changed
      const hasChanged = ctc !== initialValues.current.ctc || selectedStructureId !== initialValues.current.structureId;

      if (hasChanged && !effectiveFrom) {
         setErrors({ effectiveFrom: 'Effective From is mandatory when salary details are changed' });
         // Scroll to error
         const errorField = document.getElementById('effective-from-field');
         errorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
         return;
      }

      setIsSaving(true);
      setTimeout(() => {
         setIsSaving(false);
         if (onBack) onBack(); // Go back after save for demo flow
      }, 1500);
   };

   const formatCurrency = (amount: number) => {
      return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
   };

   return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
               <button
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
               >
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                     <span>Workforce</span>
                     <span>/</span>
                     <span>Employees</span>
                     <span>/</span>
                     <span>{isReadOnly ? 'View Profile' : 'Edit Profile'}</span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                     {isReadOnly ? 'Employee Profile' : 'Edit Payroll Profile'}
                     <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">Active</span>
                  </h1>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {/* Integration Badge */}


               {!isReadOnly ? (
                  <>
                     <button
                        onClick={onBack}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium text-sm shadow-sm flex items-center gap-2 transition-all disabled:opacity-70"
                     >
                        {isSaving ? (
                           <>Saving...</>
                        ) : (
                           <>
                              <Save size={16} /> Save Changes
                           </>
                        )}
                     </button>
                  </>
               ) : (
                  <button
                     onClick={onBack}
                     className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                  >
                     Close View
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* LEFT COLUMN: Forms */}
            <div className="xl:col-span-2 space-y-6">

               {/* 1. Identity & Basic Info */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User size={18} className="text-slate-400" /> Employee Details
                     </h3>
                     {!isReadOnly && (
                        <button className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
                           <RefreshCw size={12} /> Pull from HRMS
                        </button>
                     )}
                  </div>
                  <div className="p-6 flex flex-col sm:flex-row gap-6">
                     {/* Photo Upload */}
                     <div className="flex flex-col items-center gap-3">
                        <div className={`relative group ${isReadOnly ? '' : 'cursor-pointer'}`}>
                           <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-full h-full object-cover" />
                           </div>
                           {!isReadOnly && (
                              <>
                                 <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-slate-500 hover:text-sky-600 transition-colors">
                                    <Camera size={14} />
                                 </div>
                                 <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload size={20} className="text-white" />
                                 </div>
                              </>
                           )}
                        </div>
                        <span className="text-xs font-medium text-slate-400">TF00912</span>
                     </div>

                     {/* Fields */}
                     <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                              <input type="text" defaultValue="Priya Sharma" disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Designation</label>
                              <input type="text" defaultValue="Senior Software Engineer" disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
                              <select disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`}>
                                 <option>Engineering</option>
                                 <option>Product</option>
                                 <option>Design</option>
                                 <option>Sales</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date of Joining</label>
                              <input type="date" defaultValue="2023-01-12" disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Work Location</label>
                              <select disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`}>
                                 <option>Bangalore</option>
                                 <option>Mumbai</option>
                                 <option>Remote</option>
                              </select>
                           </div>
                        </div>


                     </div>
                  </div>
               </div>

               {/* 2. Bank Details */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Building size={18} className="text-slate-400" /> Bank Information
                     </h3>
                     {bankVerified ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                           <CheckCircle size={12} /> Verified
                        </span>
                     ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                           <AlertCircle size={12} /> Pending Verification
                        </span>
                     )}
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Number {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <input type="text" defaultValue="50100234567890" disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">IFSC Code {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="relative">
                           <input type="text" defaultValue="HDFC0001234" disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           {!isReadOnly && <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-600 hover:text-sky-700">VERIFY</button>}
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bank Name</label>
                        <input type="text" defaultValue="HDFC Bank" readOnly className="w-full px-3 py-2 border border-slate-100 bg-slate-50 rounded-lg text-sm text-slate-600 focus:outline-none cursor-not-allowed" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch</label>
                        <input type="text" defaultValue="Koramangala 4th Block" readOnly className="w-full px-3 py-2 border border-slate-100 bg-slate-50 rounded-lg text-sm text-slate-600 focus:outline-none cursor-not-allowed" />
                     </div>
                  </div>
               </div>

               {/* 3. Statutory & Tax */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-slate-400" /> Statutory & Tax Compliance
                     </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PAN Number {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="relative">
                           <input type="text" defaultValue="ABCDE1234F" disabled={isReadOnly} className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Aadhaar Number</label>
                        <div className="relative">
                           <input type="text" defaultValue="xxxx-xxxx-1234" disabled={isReadOnly} className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">UAN (PF)</label>
                        <input type="text" defaultValue="100900200300" disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tax Regime (FY 2025-26)</label>
                        <div className="relative">
                           <select
                              value={regime}
                              onChange={(e) => setRegime(e.target.value)}
                              disabled={isReadOnly}
                              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none ${isReadOnly ? 'bg-slate-50' : ''}`}
                           >
                              <option>New Regime (2025) - Default</option>
                              <option>Old Regime</option>
                           </select>
                           <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none opacity-0" size={14} />
                           {/* Just a spacer icon */}
                        </div>
                     </div>
                  </div>
               </div>

            </div>

            {/* RIGHT COLUMN: Salary Structure */}
            <div className="xl:col-span-1">
               <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-24">
                  <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white">
                     <h3 className="font-bold flex items-center gap-2">
                        <Calculator size={18} className="text-emerald-400" /> Salary Structure
                     </h3>
                  </div>

                  <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
                     {/* Structure Selector */}
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assigned Structure</label>
                        {isReadOnly ? (
                           <div className="font-medium text-slate-800 text-sm bg-white px-3 py-2 border border-slate-200 rounded-lg">
                              {SALARY_STRUCTURES.find(s => s.id === selectedStructureId)?.name || 'Not Assigned'}
                           </div>
                        ) : (
                           <div className="relative">
                              <select
                                 value={selectedStructureId}
                                 onChange={(e) => setSelectedStructureId(e.target.value)}
                                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none"
                              >
                                 {SALARY_STRUCTURES.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                 ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                           </div>
                        )}
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual CTC (₹)</label>
                        <div className="relative">
                           <input
                              type="number"
                              value={ctc}
                              disabled={isReadOnly}
                              onChange={(e) => setCtc(parseInt(e.target.value) || 0)}
                              className={`w-full pl-8 pr-4 py-3 text-lg font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm ${isReadOnly ? 'bg-slate-100 text-slate-600' : ''}`}
                           />
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        </div>
                        <div className="mt-2 text-xs text-right text-slate-500">
                           Monthly Gross: <span className="font-bold text-slate-700">₹ {formatCurrency(Math.round(salary.monthlyGross))}</span>
                        </div>
                     </div>

                     {/* Effective From Date Field */}
                     <div id="effective-from-field">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Effective From {(ctc !== initialValues.current.ctc || selectedStructureId !== initialValues.current.structureId) && !isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="relative">
                           <input
                              type="date"
                              value={effectiveFrom}
                              disabled={isReadOnly}
                              onChange={(e) => {
                                 setEffectiveFrom(e.target.value);
                                 if (errors.effectiveFrom) setErrors({});
                              }}
                              className={`w-full pl-10 pr-4 py-2 text-sm font-bold text-slate-800 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isReadOnly ? 'bg-slate-100 text-slate-500 border-slate-200' : errors.effectiveFrom ? 'border-rose-500' : 'border-slate-300 hover:border-slate-400'}`}
                           />
                           <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReadOnly ? 'text-slate-300' : 'text-slate-400'}`} />
                        </div>
                        {errors.effectiveFrom && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.effectiveFrom}</p>}
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead className="bg-white text-slate-500 border-b border-slate-100">
                           <tr>
                              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Component</th>
                              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Monthly</th>
                              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Annual</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           <tr>
                              <td className="px-4 py-2.5 text-slate-700 font-medium">Basic Salary</td>
                              <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(salary.basic / 12))}</td>
                              <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(salary.basic))}</td>
                           </tr>
                           <tr>
                              <td className="px-4 py-2.5 text-slate-700 flex items-center gap-1">
                                 HRA <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded border border-emerald-100">Exempt</span>
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(salary.hra / 12))}</td>
                              <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(salary.hra))}</td>
                           </tr>
                           <tr>
                              <td className="px-4 py-2.5 text-slate-700">Special Allowance</td>
                              <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(salary.special / 12))}</td>
                              <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(salary.special))}</td>
                           </tr>
                           <tr className="bg-slate-50/50">
                              <td className="px-4 py-2.5 text-slate-500 text-xs italic" colSpan={3}>Retirals (Employer Contribution)</td>
                           </tr>
                           <tr>
                              <td className="px-4 py-2.5 text-slate-700">PF (Employer)</td>
                              <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(salary.pfEmployer / 12))}</td>
                              <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(salary.pfEmployer))}</td>
                           </tr>
                           <tr>
                              <td className="px-4 py-2.5 text-slate-700">Gratuity</td>
                              <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(salary.gratuity / 12))}</td>
                              <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(salary.gratuity))}</td>
                           </tr>

                           {/* New Estimated TDS Section */}
                           <tr className="bg-slate-50/50">
                              <td className="px-4 py-2.5 text-slate-500 text-xs italic" colSpan={3}>Estimated Tax Deductions (Annual)</td>
                           </tr>
                           <tr>
                              <td className="px-4 py-2.5 text-slate-700">TDS (Old Regime)</td>
                              <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(salary.taxOld / 12))}</td>
                              <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(salary.taxOld)}</td>
                           </tr>
                           <tr>
                              <td className="px-4 py-2.5 text-slate-700">TDS (New Regime)</td>
                              <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(salary.taxNew / 12))}</td>
                              <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(salary.taxNew)}</td>
                           </tr>

                        </tbody>
                        <tfoot className="bg-slate-800 text-white border-t border-slate-200">
                           <tr>
                              <td className="px-4 py-3 font-bold">Total CTC</td>
                              <td className="px-4 py-3 text-right opacity-60 text-xs">-</td>
                              <td className="px-4 py-3 text-right font-bold">₹ {formatCurrency(ctc)}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>

                  {!isReadOnly && (
                     <div className="p-4 bg-yellow-50 border-t border-yellow-100 flex gap-3">
                        <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800 leading-relaxed">
                           Changes to CTC will be effective from the selected date. Arrears will be calculated automatically in the corresponding payroll run.
                        </p>
                     </div>
                  )}
               </div>
            </div>

         </div>
      </div>
   );
};

export default EditEmployeeProfile;
