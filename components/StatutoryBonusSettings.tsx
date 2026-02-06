import React, { useState } from 'react';
import {
  Save,
  Edit2,
  Award,
  Info,
  ChevronDown,
  Check,
  AlertCircle,
  Calendar,
  Building,
  Users,
  Calculator,
  Clock,
  FileSpreadsheet,
  Bell,
  Zap,
  ShieldCheck,
  Download,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Printer,
  X,
  UserCheck,
  FileSignature,
  Building2,
  FileCheck,
  Stamp
} from 'lucide-react';

// --- Types & Interfaces for Report ---

interface BonusRecord {
  sn: number;
  empId: string;
  name: string;
  relationName: string;
  designation: string;
  doj: string;
  department: string;
  monthlyWages: number;
  workingDays: number;
  wagesEarned: number;
  calculationBase: number;
  bonusPercentage: number;
  bonusPayable: number;
  deductions: number;
  netBonus: number;
  paymentDate: string;
  paymentMode: string;
  remarks: string;
}

const StatutoryBonusSettings: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showFormC, setShowFormC] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingFormC, setIsExportingFormC] = useState(false);

  // Section 1 - General / Applicability
  const [enableBonus, setEnableBonus] = useState(true);
  const [has20Employees, setHas20Employees] = useState(true);
  const [establishmentDate, setEstablishmentDate] = useState('2020-04-01');
  const [accountingYear, setAccountingYear] = useState('April - March');

  // Section 2 - Eligibility Criteria
  const [wageCeiling, setWageCeiling] = useState('21000');
  const [minDaysWorked, setMinDaysWorked] = useState('30');
  const [excludedCategories, setExcludedCategories] = useState<string[]>(['Apprentices']);
  const [applySpecialMinUnder15, setApplySpecialMinUnder15] = useState(true);

  // Section 3 - Calculation Base & Limits
  const [calcComponents, setCalcComponents] = useState<string[]>(['Basic Salary', 'Dearness Allowance (DA)']);
  const [calcCeiling, setCalcCeiling] = useState('7000');
  const [useStateMinWage, setUseStateMinWage] = useState(true);
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [decisionMethod, setDecisionMethod] = useState('Auto: Minimum 8.33%');
  const [manualBonusRate, setManualBonusRate] = useState('8.33');

  // Section 4 - Payout & Processing
  const [payoutFrequency, setPayoutFrequency] = useState('Annual');
  const [monthlyAccrual, setMonthlyAccrual] = useState(true);
  const [accrualMethod, setAccrualMethod] = useState('Monthly provisioning (accrue 8.33%/12 in each payroll)');
  const [prorateJoiners, setProrateJoiners] = useState(true);
  const [excludeLop, setExcludeLop] = useState(true);
  const [paymentMode, setPaymentMode] = useState('Add as separate line in payslip');

  // Section 5 - Compliance & Reporting
  const [autoIncludePayslip, setAutoIncludePayslip] = useState(true);
  const [treatAsTaxable, setTreatAsTaxable] = useState(true);
  const [alertDelayedPayout, setAlertDelayedPayout] = useState(true);
  const [yearEndWizard, setYearEndWizard] = useState(true);

  // Backup State for Cancel
  const [backup, setBackup] = useState<any>(null);

  // --- Mock Data for Bonus Register ---
  const MOCK_BONUS_DATA: BonusRecord[] = [
    { sn: 1, empId: 'E001', name: 'Arjun Mehta', relationName: 'Suresh Mehta', designation: 'Senior Analyst', doj: '15-Jun-2022', department: 'Operations', monthlyWages: 18000, workingDays: 310, wagesEarned: 216000, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 6997, deductions: 0, netBonus: 6997, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: 'Good Performance' },
    { sn: 2, empId: 'E002', name: 'Priya Sharma', relationName: 'Ravi Sharma', designation: 'Developer', doj: '01-Jan-2023', department: 'Engineering', monthlyWages: 20500, workingDays: 365, wagesEarned: 246000, calculationBase: 7000, bonusPercentage: 10.00, bonusPayable: 8400, deductions: 0, netBonus: 8400, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: '-' },
    { sn: 3, empId: 'E003', name: 'Rahul Varma', relationName: 'K. Varma', designation: 'Clerk', doj: '12-Mar-2024', department: 'Admin', monthlyWages: 12000, workingDays: 280, wagesEarned: 144000, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 6997, deductions: 0, netBonus: 6997, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: '-' },
    { sn: 4, empId: 'E004', name: 'Sita Gupta', relationName: 'Alok Gupta', designation: 'Technician', doj: '05-Sep-2021', department: 'Maintenance', monthlyWages: 15000, workingDays: 320, wagesEarned: 180000, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 6997, deductions: 0, netBonus: 6997, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: '-' },
    { sn: 5, empId: 'E005', name: 'Kunal Singh', relationName: 'Manish Singh', designation: 'Sales Exec', doj: '20-Nov-2024', department: 'Sales', monthlyWages: 19000, workingDays: 130, wagesEarned: 95000, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 2500, deductions: 0, netBonus: 2500, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: 'Pro-rata applied' },
    { sn: 6, empId: 'E006', name: 'Sneha Kapur', relationName: 'V. Kapur', designation: 'Intern', doj: '01-Oct-2025', department: 'HR', monthlyWages: 10000, workingDays: 61, wagesEarned: 20000, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 1166, deductions: 0, netBonus: 1166, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: 'New Joinee' },
    { sn: 7, empId: 'E007', name: 'Vikram Rao', relationName: 'D. Rao', designation: 'Operator', doj: '15-Aug-2020', department: 'Production', monthlyWages: 14500, workingDays: 340, wagesEarned: 174000, calculationBase: 7000, bonusPercentage: 12.00, bonusPayable: 10080, deductions: 500, netBonus: 9580, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: 'Damage recovery' },
    { sn: 8, empId: 'E008', name: 'Anita Desai', relationName: 'Raj Desai', designation: 'Support Staff', doj: '10-Feb-2022', department: 'Admin', monthlyWages: 11000, workingDays: 350, wagesEarned: 132000, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 6997, deductions: 0, netBonus: 6997, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: '-' },
    { sn: 9, empId: 'E009', name: 'Rajesh Kooth', relationName: 'N. Kooth', designation: 'Store Keeper', doj: '01-Apr-2023', department: 'Logistics', monthlyWages: 16000, workingDays: 365, wagesEarned: 192000, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 6997, deductions: 0, netBonus: 6997, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: '-' },
    { sn: 10, empId: 'E010', name: 'Deepika P.', relationName: 'M. Padukone', designation: 'Receptionist', doj: '15-May-2025', department: 'Admin', monthlyWages: 13000, workingDays: 200, wagesEarned: 86667, calculationBase: 7000, bonusPercentage: 8.33, bonusPayable: 3848, deductions: 0, netBonus: 3848, paymentDate: '30-Nov-2025', paymentMode: 'Bank Transfer', remarks: '-' }
  ];

  const handleGenerateRegister = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowRegister(true);
    }, 1200);
  };

  const handleExportFormC = () => {
    setIsExportingFormC(true);
    setTimeout(() => {
      setIsExportingFormC(false);
      setShowFormC(true);
    }, 1500);
  };

  const handleEdit = () => {
    setBackup({
      enableBonus, has20Employees, establishmentDate, accountingYear,
      wageCeiling, minDaysWorked, excludedCategories, applySpecialMinUnder15,
      calcComponents, calcCeiling, useStateMinWage, selectedState, decisionMethod, manualBonusRate,
      payoutFrequency, monthlyAccrual, accrualMethod, prorateJoiners, excludeLop, paymentMode,
      autoIncludePayslip, treatAsTaxable, alertDelayedPayout, yearEndWizard
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (backup) {
      setEnableBonus(backup.enableBonus);
      setHas20Employees(backup.has20Employees);
      setEstablishmentDate(backup.establishmentDate);
      setAccountingYear(backup.accountingYear);
      setWageCeiling(backup.wageCeiling);
      setMinDaysWorked(backup.minDaysWorked);
      setExcludedCategories(backup.excludedCategories);
      setApplySpecialMinUnder15(backup.applySpecialMinUnder15);
      setCalcComponents(backup.calcComponents);
      setCalcCeiling(backup.calcCeiling);
      setUseStateMinWage(backup.useStateMinWage);
      setSelectedState(backup.selectedState);
      setDecisionMethod(backup.decisionMethod);
      setManualBonusRate(backup.manualBonusRate);
      setPayoutFrequency(backup.payoutFrequency);
      setMonthlyAccrual(backup.monthlyAccrual);
      setAccrualMethod(backup.accrualMethod);
      setProrateJoiners(backup.prorateJoiners);
      setExcludeLop(backup.excludeLop);
      setPaymentMode(backup.paymentMode);
      setAutoIncludePayslip(backup.autoIncludePayslip);
      setTreatAsTaxable(backup.treatAsTaxable);
      setAlertDelayedPayout(backup.alertDelayedPayout);
      setYearEndWizard(backup.yearEndWizard);
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const toggleArray = (arr: string[], setArr: (val: string[]) => void, item: string) => {
    if (!isEditing) return;
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1 align-middle">
      <Info size={14} className="text-slate-300 hover:text-indigo-500 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );

  const handleDownloadDocument = (title: string) => {
    const element = document.createElement("a");
    const file = new Blob([`Official Document: ${title}\nPrescribed under Payment of Bonus Act, 1965\nGenerated on: ${new Date().toLocaleString()}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- Form C View ---
  if (showFormC) {
    const totalBonusPaid = MOCK_BONUS_DATA.reduce((sum, item) => sum + item.netBonus, 0);
    const totalWagesEarned = MOCK_BONUS_DATA.reduce((sum, item) => sum + item.wagesEarned, 0);
    const avgBonusPercent = (totalBonusPaid / totalWagesEarned * 100).toFixed(2);

    return (
      <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col animate-in fade-in duration-300 overflow-hidden">
        {/* Action Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 z-10 shadow-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowFormC(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <FileSignature className="text-indigo-600" size={24} /> Form C Return
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Payment of Bonus Act, 1965 • Rule 4</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs flex items-center gap-2">
              <Printer size={16} /> Print Official Form
            </button>
            <button
              onClick={() => handleDownloadDocument("Form_C_Return_2025_26")}
              className="px-6 py-2 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black shadow-lg transition-all flex items-center gap-2"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 overflow-auto p-12 bg-slate-100">
          <div className="max-w-[1000px] mx-auto bg-white shadow-2xl p-16 flex flex-col relative text-slate-900" style={{ fontFamily: 'Times New Roman, serif' }}>

            {/* Official Header */}
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold uppercase mb-2">FORM 'C'</h1>
              <p className="text-sm font-bold uppercase mb-1">[See Rule 4]</p>
              <h2 className="text-lg font-bold uppercase border-b-2 border-slate-800 inline-block pb-1">Combined Bonus Register and Annual Return</h2>
              <p className="text-xs mt-4 italic">To be submitted to the Inspector within the prescribed time limit under the Payment of Bonus Act, 1965</p>
            </div>

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none select-none">
              <h1 className="text-9xl font-black">ORIGINAL</h1>
            </div>

            {/* PART A - Employer Details */}
            <section className="mb-10">
              <h3 className="text-sm font-bold uppercase bg-slate-100 p-2 border-l-4 border-slate-800 mb-4">PART A - Employer Details</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm px-2">
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">1. Name & Address of Establishment</span><span className="font-bold">TechFlow Systems Pvt Ltd, 123 Business Park, Sector 4, Bangalore</span></div>
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">2. Type of Establishment</span><span className="font-bold">IT Services / Technology</span></div>
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">3. Registration Number</span><span className="font-bold">KA-BLR-00921-2020</span></div>
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">4. Name of Employer</span><span className="font-bold">Kavita Sharma (HR Head)</span></div>
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">5. Contact Email</span><span className="font-bold">compliance@techflow.com</span></div>
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">6. Phone Number</span><span className="font-bold">+91 98765 43210</span></div>
              </div>
            </section>

            {/* PART B - Accounting Year Details */}
            <section className="mb-10">
              <h3 className="text-sm font-bold uppercase bg-slate-100 p-2 border-l-4 border-slate-800 mb-4">PART B - Accounting Year Details</h3>
              <div className="grid grid-cols-3 gap-6 text-sm px-2">
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">Accounting Year Period</span><span className="font-bold">01-Apr-2025 to 31-Mar-2026</span></div>
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">Date of Completion</span><span className="font-bold">31-Mar-2026</span></div>
                <div className="flex flex-col"><span className="font-bold text-slate-500 uppercase text-[10px]">Primary Payout Date</span><span className="font-bold">30-Nov-2025</span></div>
              </div>
            </section>

            {/* PART C - Table */}
            <section className="mb-10">
              <h3 className="text-sm font-bold uppercase bg-slate-100 p-2 border-l-4 border-slate-800 mb-4">PART C - Employee & Bonus Details</h3>
              <div className="border border-slate-800">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-800">
                      <th className="p-2 border-r border-slate-800 text-center">SN</th>
                      <th className="p-2 border-r border-slate-800 text-left">Employee Name</th>
                      <th className="p-2 border-r border-slate-800 text-left">Father's Name</th>
                      <th className="p-2 border-r border-slate-800 text-center">Days Worked</th>
                      <th className="p-2 border-r border-slate-800 text-right">Wages Earned</th>
                      <th className="p-2 border-r border-slate-800 text-right">Bonus Payable</th>
                      <th className="p-2 border-r border-slate-800 text-right">Net Paid</th>
                      <th className="p-2 text-center">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_BONUS_DATA.slice(0, 10).map((row) => (
                      <tr key={row.empId} className="border-b border-slate-400">
                        <td className="p-2 border-r border-slate-400 text-center">{row.sn}</td>
                        <td className="p-2 border-r border-slate-400 font-bold uppercase">{row.name}</td>
                        <td className="p-2 border-r border-slate-400">{row.relationName}</td>
                        <td className="p-2 border-r border-slate-400 text-center">{row.workingDays}</td>
                        <td className="p-2 border-r border-slate-400 text-right">₹{row.wagesEarned.toLocaleString()}</td>
                        <td className="p-2 border-r border-slate-400 text-right font-bold">₹{row.bonusPayable.toLocaleString()}</td>
                        <td className="p-2 border-r border-slate-400 text-right font-bold">₹{row.netBonus.toLocaleString()}</td>
                        <td className="p-2"><div className="w-16 h-6 border-b border-slate-300 mx-auto"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PART D - Summary */}
            <section className="mb-10">
              <h3 className="text-sm font-bold uppercase bg-slate-100 p-2 border-l-4 border-slate-800 mb-4">PART D - Summary & Totals</h3>
              <div className="grid grid-cols-2 gap-4 text-sm px-2">
                <div className="flex justify-between border-b border-slate-100 pb-2"><span>Total employees worked during the year:</span><span className="font-bold">452</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span>Total employees eligible for bonus:</span><span className="font-bold">10</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span>Total bonus amount paid:</span><span className="font-bold">₹{totalBonusPaid.toLocaleString()}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span>Percentage of bonus paid:</span><span className="font-bold">{avgBonusPercent}%</span></div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded text-xs leading-relaxed italic">
                * Allocable surplus calculated as per Fourth Schedule of the Act. No pending disputes or cases recorded for this accounting year.
              </div>
            </section>

            {/* PART E - Declaration */}
            <section className="mt-auto">
              <h3 className="text-sm font-bold uppercase bg-slate-100 p-2 border-l-4 border-slate-800 mb-8">PART E - Declaration</h3>
              <p className="text-sm mb-12 italic leading-relaxed">
                I hereby certify that the particulars given above are correct and that the bonus has been paid to the employees listed herein at the rates specified in accordance with the provisions of the Payment of Bonus Act, 1965.
              </p>

              <div className="flex justify-between items-end">
                <div className="space-y-4">
                  <p className="text-sm">Place: <span className="font-bold border-b border-slate-400 min-w-[100px] inline-block">Bangalore</span></p>
                  <p className="text-sm">Date: <span className="font-bold border-b border-slate-400 min-w-[100px] inline-block">{new Date().toLocaleDateString()}</span></p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-48 h-12 border-b-2 border-slate-800 mx-auto mb-2 flex items-center justify-center text-slate-300 italic text-xs">E-Signed by Authorized Signatory</div>
                  <p className="text-sm font-black uppercase">Authorized Signatory</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">TechFlow Systems Pvt Ltd</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Company Seal</p>
                </div>
              </div>
            </section>

            <footer className="mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-400 italic text-center">
              This is a statutory document generated by CollabCRM Payroll System. Verification Code: TC-BONS-2026-X99
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // --- Bonus Register View ---
  if (showRegister) {
    const totalBonus = MOCK_BONUS_DATA.reduce((sum, item) => sum + item.netBonus, 0);
    const totalWages = MOCK_BONUS_DATA.reduce((sum, item) => sum + item.wagesEarned, 0);
    const avgBonus = totalBonus / MOCK_BONUS_DATA.length;

    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in fade-in duration-300 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowRegister(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <FileText className="text-indigo-600" size={24} /> Statutory Bonus Register
              </h2>
              <p className="text-xs text-slate-500 font-medium">Payment of Bonus Act, 1965 • FY 2025-26</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs flex items-center gap-2">
              <Printer size={16} /> Print
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs flex items-center gap-2">
              <Download size={16} /> Export PDF
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2">
              <FileSpreadsheet size={16} /> Download Excel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-[1800px] mx-auto space-y-8">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Eligible Employees</p>
                <div className="flex items-end gap-2">
                  <h4 className="text-3xl font-black text-slate-900">10</h4>
                  <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5"><Check size={14} /> 100% Validated</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bonus Payable</p>
                <h4 className="text-3xl font-black text-indigo-600">₹{totalBonus.toLocaleString()}</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Wages Considered</p>
                <h4 className="text-3xl font-black text-slate-800">₹{totalWages.toLocaleString()}</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Bonus per Emp</p>
                <h4 className="text-3xl font-black text-slate-800">₹{avgBonus.toLocaleString()}</h4>
              </div>
            </div>

            {/* Main Report Table Container */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 font-black">TC</div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">TechFlow Systems Pvt Ltd</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">123 Business Park, Sector 4, Bangalore - 560001</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <select className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option>FY 2025-26</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option>All Departments</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-5 border-r border-slate-100 text-center">SN</th>
                      <th className="px-6 py-5 border-r border-slate-100">Employee Details</th>
                      <th className="px-6 py-5 border-r border-slate-100">Statutory Info</th>
                      <th className="px-6 py-5 border-r border-slate-100">Work Info</th>
                      <th className="px-6 py-5 border-r border-slate-100 text-right">Wages Earned</th>
                      <th className="px-6 py-5 border-r border-slate-100 text-right">Calc Base</th>
                      <th className="px-6 py-5 border-r border-slate-100 text-center">Bonus %</th>
                      <th className="px-6 py-5 border-r border-slate-100 text-right">Payable</th>
                      <th className="px-6 py-5 border-r border-slate-100 text-right">Deduct.</th>
                      <th className="px-6 py-5 border-r border-slate-100 text-right bg-indigo-50/30 text-indigo-600">Net Paid</th>
                      <th className="px-6 py-5 border-r border-slate-100 text-center">Payment Info</th>
                      <th className="px-6 py-5 text-center">Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_BONUS_DATA.map((row) => (
                      <tr key={row.empId} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-5 text-center font-bold text-slate-400">{row.sn}</td>
                        <td className="px-6 py-5">
                          <p className="font-black text-slate-800">{row.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{row.empId}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-600">F/S: {row.relationName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{row.designation}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-medium text-slate-600">{row.department}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">DOJ: {row.doj}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="font-black text-slate-700">₹{row.wagesEarned.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{row.workingDays} Days</p>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-slate-800">₹{row.calculationBase.toLocaleString()}</td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md font-black text-slate-600">{row.bonusPercentage}%</span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-slate-800">₹{row.bonusPayable.toLocaleString()}</td>
                        <td className="px-6 py-5 text-right font-black text-rose-500">{row.deductions > 0 ? `-₹${row.deductions}` : '-'}</td>
                        <td className="px-6 py-5 text-right font-black text-indigo-700 bg-indigo-50/10">₹{row.netBonus.toLocaleString()}</td>
                        <td className="px-6 py-5 text-center">
                          <p className="font-bold text-slate-600">{row.paymentMode}</p>
                          <p className="text-[9px] text-slate-400 uppercase mt-0.5">{row.paymentDate}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-24 h-8 border border-slate-100 rounded-lg bg-slate-50/50"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authorized Signatory</p>
                    <div className="h-12 w-48 border-b-2 border-slate-300"></div>
                    <p className="text-[10px] font-bold text-slate-500 mt-2">Kavita Sharma (HR Head)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Finance Controller</p>
                    <div className="h-12 w-48 border-b-2 border-slate-300"></div>
                    <p className="text-[10px] font-bold text-slate-500 mt-2">Rajesh Kumar</p>
                  </div>
                </div>
                <div className="text-right text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-widest">Generated by CollabCRM Payroll</p>
                  <p className="text-[10px] mt-1 font-medium italic">Computer generated statutory register. Does not require manual stamp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50">
      <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Award className="text-indigo-600" size={28} />
              Statutory Bonus Settings
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Compliance rules for the Payment of Bonus Act, 1965.</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={handleCancel} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm transition-all">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all"><Save size={18} /> Save Settings</button>
              </>
            ) : (
              <button onClick={handleEdit} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-sm shadow-sm flex items-center gap-2 transition-all"><Edit2 size={18} /> Edit Configuration</button>
            )}
          </div>
        </div>

        {/* Section 1 - General / Applicability */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600"><Building size={20} /></div>
              <h3 className="font-bold text-slate-800">General / Applicability</h3>
            </div>
            <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
              <input type="checkbox" checked={enableBonus} onChange={() => isEditing && setEnableBonus(!enableBonus)} disabled={!isEditing} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {enableBonus && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
              <div className="space-y-4">
                <label className="flex items-start gap-3 group cursor-pointer">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${has20Employees ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                    {has20Employees && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={has20Employees} onChange={() => isEditing && setHas20Employees(!has20Employees)} disabled={!isEditing} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Company has ≥20 employees</span>
                    <p className="text-xs text-slate-400 mt-1">Auto-detected from current workforce strength.</p>
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Establishment Year</label>
                  <input type="date" value={establishmentDate} onChange={(e) => setEstablishmentDate(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Accounting Year</label>
                  <div className="relative">
                    <select value={accountingYear} onChange={(e) => setAccountingYear(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white appearance-none focus:outline-none focus:border-indigo-500 disabled:bg-slate-50">
                      <option>April - March</option>
                      <option>January - December</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {enableBonus && (
          <>
            {/* Section 2 - Eligibility Criteria */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600"><Users size={20} /></div>
                <h3 className="font-bold text-slate-800">Eligibility Criteria</h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">Salary Ceiling <Tooltip text="Basic + DA must be less than or equal to this limit to be eligible." /></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input type="number" value={wageCeiling} onChange={(e) => setWageCeiling(e.target.value)} disabled={!isEditing} className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Min Days Worked <Tooltip text="Minimum number of days employee must work in an accounting year to qualify." /></label>
                    <div className="relative">
                      <input type="number" value={minDaysWorked} onChange={(e) => setMinDaysWorked(e.target.value)} disabled={!isEditing} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold uppercase tracking-widest">Days</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Exclude Categories</label>
                  <div className="flex wrap gap-4">
                    {['Apprentices', 'Under 15 years old', 'Dismissed for misconduct', 'Part-time / Contract'].map(cat => (
                      <label key={cat} className={`flex items-center gap-3 px-4 py-3 border rounded-2xl transition-all ${isEditing ? 'cursor-pointer hover:border-indigo-300' : 'cursor-default opacity-80'} ${excludedCategories.includes(cat) ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200'}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${excludedCategories.includes(cat) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {excludedCategories.includes(cat) && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={excludedCategories.includes(cat)} onChange={() => toggleArray(excludedCategories, setExcludedCategories, cat)} disabled={!isEditing} />
                        <span className={`text-sm font-bold ${excludedCategories.includes(cat) ? 'text-indigo-900' : 'text-slate-600'}`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3 group cursor-pointer">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${applySpecialMinUnder15 ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                    {applySpecialMinUnder15 && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={applySpecialMinUnder15} onChange={() => isEditing && setApplySpecialMinUnder15(!applySpecialMinUnder15)} disabled={!isEditing} />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Apply special minimum for employees &lt;15 years (₹60)</span>
                    <p className="text-xs text-slate-400 mt-1">Standard minimum for others is ₹100.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 3 - Calculation Base & Limits */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600"><Calculator size={20} /></div>
                <h3 className="font-bold text-slate-800">Calculation Base & Limits</h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Calculation Components <Tooltip text="Salary parts considered for computing bonus amount." /></label>
                  <div className="flex wrap gap-4">
                    {['Basic Salary', 'Dearness Allowance (DA)', 'HRA', 'Conveyance'].map(comp => (
                      <label key={comp} className={`flex items-center gap-3 px-4 py-3 border rounded-2xl transition-all ${isEditing ? 'cursor-pointer hover:border-indigo-300' : 'cursor-default opacity-80'} ${calcComponents.includes(comp) ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200'}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${calcComponents.includes(comp) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {calcComponents.includes(comp) && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={calcComponents.includes(comp)} onChange={() => toggleArray(calcComponents, setCalcComponents, comp)} disabled={!isEditing} />
                        <span className={`text-sm font-bold ${calcComponents.includes(comp) ? 'text-indigo-900' : 'text-slate-600'}`}>{comp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Bonus Calculation Ceiling</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input type="number" value={calcCeiling} onChange={(e) => setCalcCeiling(e.target.value)} disabled={!isEditing} className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium italic">If Basic + DA &gt; ceiling → calculate bonus on ceiling amount.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                        <input type="checkbox" checked={useStateMinWage} onChange={() => isEditing && setUseStateMinWage(!useStateMinWage)} disabled={!isEditing} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-700">Use State Minimum Wage if higher</span>
                        {useStateMinWage && (
                          <div className="relative mt-2">
                            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!isEditing} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white appearance-none focus:outline-none focus:border-indigo-500 disabled:bg-slate-50">
                              <option>Karnataka</option>
                              <option>Maharashtra</option>
                              <option>Delhi</option>
                              <option>Tamil Nadu</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Min Bonus</p>
                      <p className="text-2xl font-black text-slate-900">8.33%</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Bonus</p>
                      <p className="text-2xl font-black text-slate-900">20%</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Decision Method</label>
                      <div className="relative">
                        <select value={decisionMethod} onChange={(e) => setDecisionMethod(e.target.value)} disabled={!isEditing} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-white appearance-none focus:outline-none focus:border-indigo-500 disabled:bg-slate-50">
                          <option>Auto: Minimum 8.33%</option>
                          <option>Manual: HR enters 8.33–20%</option>
                          <option>Profit-linked (Custom Rule)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      {decisionMethod === 'Manual: HR enters 8.33–20%' && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                          <label className="block text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center">Manual Bonus Percentage (%)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={manualBonusRate}
                              onChange={(e) => setManualBonusRate(e.target.value)}
                              disabled={!isEditing}
                              min="8.33"
                              max="20"
                              step="0.01"
                              className="w-full px-4 py-3 border border-indigo-200 bg-indigo-50/30 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:border-indigo-500 disabled:bg-slate-50"
                              placeholder="8.33 - 20.00"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">%</span>
                          </div>
                          {(parseFloat(manualBonusRate) < 8.33 || parseFloat(manualBonusRate) > 20) && (
                            <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1.5">
                              <AlertCircle size={12} /> Range must be between 8.33% and 20%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 - Payout & Processing */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600"><Clock size={20} /></div>
                <h3 className="font-bold text-slate-800">Payout & Processing</h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Payout Frequency</label>
                    <div className="flex gap-6">
                      {['Annual', 'Monthly Accrual'].map(f => (
                        <label key={f} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${payoutFrequency === f ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                            {payoutFrequency === f && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                          </div>
                          <input type="radio" className="hidden" checked={payoutFrequency === f} onChange={() => isEditing && setPayoutFrequency(f)} disabled={!isEditing} />
                          <span className={`text-sm font-bold ${payoutFrequency === f ? 'text-slate-800' : 'text-slate-500'}`}>{f}</span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Accrual Method</label>
                      <div className="space-y-3">
                        {[
                          'Monthly provisioning (accrue 8.33%/12 in each payroll)',
                          'Year-end lump sum only'
                        ].map(method => (
                          <label key={method} className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${accrualMethod === method ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                              {accrualMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                            </div>
                            <input type="radio" className="hidden" checked={accrualMethod === method} onChange={() => isEditing && setAccrualMethod(method)} disabled={!isEditing} />
                            <span className={`text-sm font-bold ${accrualMethod === method ? 'text-slate-800' : 'text-slate-500'}`}>{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Proration & LOP Rules</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 group cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${prorateJoiners ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                          {prorateJoiners && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={prorateJoiners} onChange={() => isEditing && setProrateJoiners(!prorateJoiners)} disabled={!isEditing} />
                        <span className="text-sm font-bold text-slate-700">Prorate for joiners/leavers based on days worked</span>
                      </label>
                      <label className="flex items-center gap-3 group cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${excludeLop ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                          {excludeLop && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={excludeLop} onChange={() => isEditing && setExcludeLop(!excludeLop)} disabled={!isEditing} />
                        <span className="text-sm font-bold text-slate-700">Exclude Loss of Pay (LOP) days from calculation</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Payment Mode</label>
                  <div className="relative max-w-md">
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} disabled={!isEditing} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-white appearance-none focus:outline-none focus:border-indigo-500 disabled:bg-slate-50">
                      <option>Add as separate line in payslip</option>
                      <option>Lump-sum payment run (Off-cycle)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 - Compliance & Reporting */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600"><ShieldCheck size={20} /></div>
                <h3 className="font-bold text-slate-800">Compliance & Reporting</h3>
              </div>
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${autoIncludePayslip ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                        {autoIncludePayslip && <Check size={14} className="text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={autoIncludePayslip} onChange={() => isEditing && setAutoIncludePayslip(!autoIncludePayslip)} disabled={!isEditing} />
                      <span className="text-sm font-bold text-slate-700">Auto Include in Payslip (show as "Statutory Bonus")</span>
                    </label>
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${treatAsTaxable ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                        {treatAsTaxable && <Check size={14} className="text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={treatAsTaxable} onChange={() => isEditing && setTreatAsTaxable(!treatAsTaxable)} disabled={!isEditing} />
                      <span className="text-sm font-bold text-slate-700">Treat as taxable salary (auto-include in TDS)</span>
                    </label>
                  </div>
                  <div className="flex wrap gap-3 pt-2">
                    <button
                      onClick={handleGenerateRegister}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
                      {isGenerating ? 'Generating...' : 'Generate Bonus Register'}
                    </button>
                    <button
                      onClick={handleExportFormC}
                      disabled={isExportingFormC}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isExportingFormC ? <Loader2 className="animate-spin" size={16} /> : <FileCheck size={16} />}
                      {isExportingFormC ? 'Preparing Form C...' : 'Export Form C'}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notification & Automation</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Alert if payout delayed &gt;8 months</span>
                      <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                        <input type="checkbox" checked={alertDelayedPayout} onChange={() => isEditing && setAlertDelayedPayout(!alertDelayedPayout)} disabled={!isEditing} className="sr-only peer" />
                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Year-end processing wizard</span>
                      <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                        <input type="checkbox" checked={yearEndWizard} onChange={() => isEditing && setYearEndWizard(!yearEndWizard)} disabled={!isEditing} className="sr-only peer" />
                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Recommended Defaults info box */}
            <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Recommended Defaults (2026)</h4>
                </div>
                <div className="flex flex-wrap gap-x-12 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-indigo-300">Eligibility ceiling</p>
                    <p className="text-sm font-bold">₹21,000 / month</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-indigo-300">Calculation ceiling</p>
                    <p className="text-sm font-bold">₹7,000 / month <span className="text-[10px] opacity-60 font-normal ml-1">(or state min wage)</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-indigo-300">Min / Max %</p>
                    <p className="text-sm font-bold">8.33% / 20.00%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-indigo-300">Min Amount</p>
                    <p className="text-sm font-bold">₹100 <span className="text-[10px] opacity-60 font-normal ml-1">(₹60 for &lt;15 yrs)</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-indigo-300">Days Required</p>
                    <p className="text-sm font-bold">30 Days</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default StatutoryBonusSettings;