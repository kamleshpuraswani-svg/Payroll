
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
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
   employeeId?: string;
   onBack?: () => void;
   onViewHistory?: () => void;
   isReadOnly?: boolean;
}

const EditEmployeeProfile: React.FC<EditEmployeeProfileProps> = ({ employeeId, onBack, onViewHistory, isReadOnly = false }) => {
   const [fullName, setFullName] = useState('Loading...');
   const [designation, setDesignation] = useState('');
   const [department, setDepartment] = useState('Engineering');
   const [joiningDate, setJoiningDate] = useState('');
   const [location, setLocation] = useState('Bangalore');

   const [accountNumber, setAccountNumber] = useState('');
   const [ifscCode, setIfscCode] = useState('');
   const [bankName, setBankName] = useState('');
   const [branchName, setBranchName] = useState('');

   const [panNumber, setPanNumber] = useState('');
   const [aadhaarNumber, setAadhaarNumber] = useState('');
   const [uanNumber, setUanNumber] = useState('');

   const [ctc, setCtc] = useState<number>(0);
   const [regime, setRegime] = useState('New Regime (2025)');
   const [bankVerified, setBankVerified] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [selectedStructureId, setSelectedStructureId] = useState('');
   const [effectiveFrom, setEffectiveFrom] = useState('');
   const [errors, setErrors] = useState<{ effectiveFrom?: string }>({});
   const [arrearsPayoutDate, setArrearsPayoutDate] = useState('');
   const [statutoryDeductions, setStatutoryDeductions] = useState({
      providentFund: false,
      esi: false,
      professionalTax: true,
      gratuity: false,
      lwf: false,
      tds: false,
      nps: false
   });

   const [structureComponents, setStructureComponents] = useState<{ earnings: any[], deductions: any[] }>({ earnings: [], deductions: [] });
   const [statutorySettings, setStatutorySettings] = useState<any>(null);

   const [salaryStructures, setSalaryStructures] = useState<{ id: string, name: string, departments?: string[], designations?: string[], employees?: string[] }[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [employeeRawData, setEmployeeRawData] = useState<any>(null);

   // Refs to track initial values for change detection
   const initialValues = useRef({
      ctc: 0,
      structureId: ''
   });

   useEffect(() => {
      fetchSalaryStructures();
      if (employeeId) {
         fetchEmployeeData();
      }
      fetchStatutorySettings();
   }, [employeeId]);

   useEffect(() => {
      if (selectedStructureId) {
         fetchStructureDetails(selectedStructureId);
      }
   }, [selectedStructureId]);

   const fetchStatutorySettings = async () => {
      try {
         // Defaulting to MindInventory for now, ideally this would come from employee company info
         const target = 'MindInventory';
         const { data, error } = await supabase
            .from('operational_config')
            .select('config_key, config_value')
            .like('config_key', `%settings:bu:${target}`);

         if (!error && data) {
            const settings: any = {};
            data.forEach(item => {
               const key = item.config_key.split(':')[0];
               settings[key] = item.config_value;
            });
            setStatutorySettings(settings);
         }
      } catch (err) {
         console.error('Error fetching statutory settings:', err);
      }
   };

   const fetchStructureDetails = async (id: string) => {
      try {
         const { data, error } = await supabase
            .from('salary_structures')
            .select('earnings, deductions')
            .eq('id', id)
            .single();

         if (!error && data) {
            setStructureComponents({
               earnings: data.earnings || [],
               deductions: data.deductions || []
            });
         }
      } catch (err) {
         console.error('Error fetching structure details:', err);
      }
   };

   const fetchSalaryStructures = async () => {
      try {
         const { data, error } = await supabase
            .from('salary_structures')
            .select('id, name, departments, designations, status')
            .eq('status', 'Active');

         if (error) throw error;
         if (data) setSalaryStructures(data);
      } catch (error) {
         console.error('Error fetching structures:', error);
      }
   };

   const getFilteredStructures = () => {
      if (!salaryStructures.length) return [];
      
      const filtered = salaryStructures.filter(struct => {
         // Filter by Active status
         if (struct.status !== 'Active') return false;

         // Check if it has any restriction rules
         const hasRules = (struct.departments?.length ?? 0) > 0 || 
                         (struct.designations?.length ?? 0) > 0 || 
                         (struct.employees?.length ?? 0) > 0;
         
         // If No rules (unrestricted), it's global
         if (!hasRules) return true;

         // Check Department match
         if (department && struct.departments?.includes(department)) return true;

         // Check Designation match
         if (designation && struct.designations?.includes(designation)) return true;

         // Check Employee specific match
         const empId = employeeRawData?.eid || employeeId; 
         if (struct.employees?.some(e => 
            e.includes(fullName || '') || 
            (empId && e.includes(empId))
         )) return true;

         return false;
      });

      // Ensure currently selected structure is always visible if it exists
      if (selectedStructureId && !filtered.find(s => s.id === selectedStructureId)) {
        const current = salaryStructures.find(s => s.id === selectedStructureId);
        if (current) filtered.push(current);
      }

      return filtered;
   };

    const fetchEmployeeData = async () => {
       setIsLoading(true);
       try {
          // 1. Fetch main employee record
          const { data, error } = await supabase
             .from('employees')
             .select('*')
             .eq('id', employeeId)
             .single();
 
          if (error) throw error;
          if (data) {
             setFullName(data.name || '');
             setDesignation(data.designation || '');
             setDepartment(data.department || 'Engineering');
             setJoiningDate(data.join_date || '');
             setLocation(data.location || 'Bangalore');
 
             setAccountNumber(data.bank_account_no || '');
             setIfscCode(data.bank_ifsc || '');
             setBankName(data.bank_name || '');
             setBranchName(data.bank_branch || '');
 
             setPanNumber(data.pan_no || '');
             setAadhaarNumber(data.aadhaar_no || '');
             setUanNumber(data.uan_no || '');
 
             const fetchedCtc = Number(data.ctc) || 0;
             setCtc(fetchedCtc);
             setRegime(data.tax_regime || 'New Regime (2025)');
             setSelectedStructureId(data.salary_structure_id || '');
             setEffectiveFrom(data.effective_date || '');
 
             // 2. Fetch statutory deductions from operational_config (Workaround for missing column)
             try {
                const { data: configData, error: configError } = await supabase
                   .from('operational_config')
                   .select('config_value')
                   .eq('config_key', `emp_statutory:${employeeId}`)
                   .single();
 
                if (!configError && configData?.config_value) {
                   setStatutoryDeductions(prev => ({ ...prev, ...configData.config_value }));
                } else if (!data.statutory_deductions) {
                   // Fallback to default state if no config and no legacy column data
                }
             } catch (ce) {
                console.error('Error fetching employee statutory config:', ce);
             }

             // 3. Backward compatibility: If legacy column exists but config doesn't
             if (data.statutory_deductions) {
                try {
                   const savedDeductions = typeof data.statutory_deductions === 'string' 
                      ? JSON.parse(data.statutory_deductions) 
                      : data.statutory_deductions;
                   setStatutoryDeductions(prev => ({ ...prev, ...savedDeductions }));
                } catch (e) {
                   console.error('Error parsing statutory deductions:', e);
                }
             }
 
             initialValues.current = {
                ctc: fetchedCtc,
                structureId: data.salary_structure_id || ''
             };
             setEmployeeRawData(data);
          }
       } catch (error) {
          console.error('Error fetching employee:', error);
       } finally {
          setIsLoading(false);
       }
    };

   // Helper to calculate estimated TDS for demo purposes

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

   // Dynamic Salary Calculation
   const calculateSalary = (annualCtc: number) => {
      if (!annualCtc) return { earnings: [], employeeDeductions: [], employerContributions: [], annualGross: 0, monthlyGross: 0, taxOld: 0, taxNew: 0, basic: 0, special: 0 };

      const earnings: any[] = [];
      const employeeDeductions: any[] = [];
      const employerContributions: any[] = [];
      let totalEmployerContrib = 0;

      // Helper for component calculation
      const calcComp = (comp: any, baseValues: any) => {
         const calc = comp.calculation || '';
         if (calc.includes('Balancing Figure')) return 0;
         if (calc.includes('% of CTC')) return annualCtc * (parseFloat(calc) / 100);
         if (calc.includes('% of Basic')) return baseValues.basic * (parseFloat(calc) / 100);
         if (calc.includes('Fixed ₹')) return parseFloat(calc.replace(/[^\d.-]/g, '')) * 12;
         return 0;
      };

      // 1. Determine Basic Salary
      let basic = 0;
      const basicComp = structureComponents.earnings.find(c => c.name.toLowerCase().includes('basic'));
      if (basicComp) {
         basic = calcComp(basicComp, {});
      } else {
         basic = annualCtc * 0.5; // Default fallback
      }

      // 2. Pre-calculate fixed and formula-based Earnings
      structureComponents.earnings.forEach(comp => {
         if (comp.name.toLowerCase().includes('basic')) {
            earnings.push({ name: comp.name, annual: basic, monthly: basic / 12 });
         } else if (!comp.calculation.includes('Balancing Figure')) {
            const val = calcComp(comp, { basic });
            earnings.push({ name: comp.name, annual: val, monthly: val / 12 });
         }
      });

      // 3. Calculate Employer Contributions (Part of CTC)
      
      // PF Employer
      if (statutoryDeductions.providentFund && statutorySettings?.pf_settings) {
         const pfSet = statutorySettings.pf_settings;
         const rate = parseFloat(pfSet.emprRate || '12') / 100;
         const wageLimit = parseFloat(pfSet.pfWageCeiling || '15000');
         const pfBasis = Math.min(basic, wageLimit * 12);
         const pfContrib = Math.min(pfBasis * rate, (parseFloat(pfSet.emprLimit || '1800') * 12));
         employerContributions.push({ name: 'PF (Employer)', annual: pfContrib, monthly: pfContrib / 12 });
         totalEmployerContrib += pfContrib;
      } else if (statutoryDeductions.providentFund) {
         // Default logic if settings not fetched
         const pfContrib = Math.min(basic * 0.12, 1800 * 12);
         employerContributions.push({ name: 'PF (Employer)', annual: pfContrib, monthly: pfContrib / 12 });
         totalEmployerContrib += pfContrib;
      }

      // ESI Employer
      if (statutoryDeductions.esi && statutorySettings?.statutory_settings?.esi) {
         const esiSet = statutorySettings.statutory_settings.esi;
         const threshold = parseFloat(esiSet.threshold || '21000');
         const rate = parseFloat(esiSet.employer_rate || '3.25') / 100;
         const currentEarningsTotal = earnings.reduce((sum, e) => sum + e.annual, 0);
         if ((currentEarningsTotal / 12) <= threshold) {
            const esiContrib = currentEarningsTotal * rate;
            employerContributions.push({ name: 'ESI (Employer)', annual: esiContrib, monthly: esiContrib / 12 });
            totalEmployerContrib += esiContrib;
         }
      }

      // Gratuity Employer
      if (statutoryDeductions.gratuity) {
         const gratRate = parseFloat(statutorySettings?.config_value?.gratuityProvisionRate || '4.81') / 100;
         const gratContrib = basic * gratRate;
         employerContributions.push({ name: 'Gratuity', annual: gratContrib, monthly: gratContrib / 12 });
         totalEmployerContrib += gratContrib;
      }

      // LWF Employer
      if (statutoryDeductions.lwf) {
         const lwfEmpr = 40 * 12; // Static estimate
         employerContributions.push({ name: 'LWF (Employer)', annual: lwfEmpr, monthly: lwfEmpr / 12 });
         totalEmployerContrib += lwfEmpr;
      }

      // NPS Employer
      if (statutoryDeductions.nps) {
         const npsRate = parseFloat(statutorySettings?.config_value?.npsEmprRate || '10') / 100;
         const npsContrib = basic * npsRate;
         employerContributions.push({ name: 'NPS (Employer)', annual: npsContrib, monthly: npsContrib / 12 });
         totalEmployerContrib += npsContrib;
      }

      // 4. Calculate Balancing Figure (Special Allowance)
      const currentEarningsTotal = earnings.reduce((sum, e) => sum + e.annual, 0);
      const balancingComp = structureComponents.earnings.find(c => c.calculation.includes('Balancing Figure'));
      const specialVal = Math.max(0, annualCtc - currentEarningsTotal - totalEmployerContrib);
      
      const specialName = balancingComp ? balancingComp.name : 'Special Allowance';
      earnings.push({ name: specialName, annual: specialVal, monthly: specialVal / 12 });

      const annualGross = earnings.reduce((sum, e) => sum + e.annual, 0);
      const monthlyGross = annualGross / 12;

      // 5. Calculate Employee Deductions
      
      // PF Employee
      if (statutoryDeductions.providentFund) {
         const rate = 0.12;
         const pfEmp = Math.min(basic * rate, 1800 * 12);
         employeeDeductions.push({ name: 'PF (Employee)', annual: pfEmp, monthly: pfEmp / 12 });
      }

      // ESI Employee
      if (statutoryDeductions.esi && monthlyGross <= 21000) {
         const rate = 0.0075;
         const esiEmp = annualGross * rate;
         employeeDeductions.push({ name: 'ESI (Employee)', annual: esiEmp, monthly: esiEmp / 12 });
      }

      // Professional Tax
      if (statutoryDeductions.professionalTax && monthlyGross > 15000) {
         const ptVal = 200 * 12;
         employeeDeductions.push({ name: 'Professional Tax', annual: ptVal, monthly: ptVal / 12 });
      }

      // LWF Employee
      if (statutoryDeductions.lwf) {
         const lwfEmp = 20 * 12;
         employeeDeductions.push({ name: 'LWF', annual: lwfEmp, monthly: lwfEmp / 12 });
      }

      // NPS Employee
      if (statutoryDeductions.nps) {
         const npsEmpVal = basic * 0.10;
         employeeDeductions.push({ name: 'NPS (Employee)', annual: npsEmpVal, monthly: npsEmpVal / 12 });
      }

      // TDS / Income Tax
      const taxAnnual = regime.includes('Old') ? calculateEstTax(annualCtc, 'OLD') : calculateEstTax(annualCtc, 'NEW');
      if (statutoryDeductions.tds && taxAnnual > 0) {
         employeeDeductions.push({ name: 'Income Tax (TDS)', annual: taxAnnual, monthly: taxAnnual / 12 });
      }

      const taxOld = calculateEstTax(annualCtc, 'OLD');
      const taxNew = calculateEstTax(annualCtc, 'NEW');

      return {
         earnings,
         employeeDeductions,
         employerContributions,
         annualGross,
         monthlyGross,
         taxOld,
         taxNew,
         basic,
         special: specialVal
      };
   };
   const salary = calculateSalary(ctc);
   const totalDeductionsAnnual = salary.employeeDeductions.reduce((sum, d) => sum + d.annual, 0);
   const totalDeductionsMonthly = salary.employeeDeductions.reduce((sum, d) => sum + d.monthly, 0);
   const monthlyTakeHome = salary.monthlyGross - totalDeductionsMonthly;

   const handleSave = async () => {
      // Check if critical fields changed
      const hasChanged = ctc !== initialValues.current.ctc || selectedStructureId !== initialValues.current.structureId;

      if (hasChanged && !effectiveFrom) {
         setErrors({ effectiveFrom: 'Effective From is mandatory when salary details are changed' });
         // Scroll to error
         const errorField = document.getElementById('effective-from-field-main');
         errorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
         return;
      }

      setIsSaving(true);
      try {
         // 1. Fetch current EID/Company if needed
         const { data: currentEmp } = await supabase.from('employees').select('eid, company_id').eq('id', employeeId).single();

         // 2. Prepare employee updates
         const updates = {
            id: employeeId,
            eid: currentEmp?.eid,
            company_id: currentEmp?.company_id,
            name: fullName,
            designation,
            department,
            join_date: joiningDate || null,
            location,
            bank_account_no: accountNumber,
            bank_ifsc: ifscCode,
            bank_name: bankName,
            bank_branch: branchName,
            pan_no: panNumber,
            aadhaar_no: aadhaarNumber,
            uan_no: uanNumber,
            ctc: ctc.toString(), 
            tax_regime: regime,
            salary_structure_id: selectedStructureId || null,
            effective_date: effectiveFrom || null,
            last_updated_by: 'HR Manager'
         };

         // 3. Save main employee data
         const { error: empError } = await supabase
            .from('employees')
            .upsert(updates);

         if (empError) throw empError;

         // 4. Save statutory deductions to operational_config as a workaround
         const { error: configError } = await supabase
            .from('operational_config')
            .upsert({
               config_key: `emp_statutory:${employeeId}`,
               config_value: statutoryDeductions,
               updated_at: new Date().toISOString()
            }, { onConflict: 'config_key' });

         if (configError) {
             console.error('Error saving statutory deductions config:', configError);
         }

         if (onBack) onBack();
      } catch (error: any) {
         console.error('Detailed Save Error:', error);
         alert(`Failed to save changes: ${error.message || 'Unknown error'}. Please check console.`);
      } finally {
         setIsSaving(false);
      }
   };

   const formatCurrency = (amount: number) => {
      return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
   };

   return (
      <div className="p-4 lg:p-8 w-full space-y-6 animate-in fade-in duration-300">
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
                     <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">{isLoading ? 'Loading...' : 'Active'}</span>
                  </h1>
               </div>
            </div>

            <div className="flex items-center gap-3">
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
                  </div>
                  <div className="p-6 flex flex-col sm:flex-row gap-6">
                     {/* Photo Upload */}
                     <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                           <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-full h-full object-cover grayscale opacity-80" />
                           </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400">TF00912</span>
                     </div>
 
                     {/* Fields */}
                     <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                              <input type="text" value={fullName} disabled className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-50/50 focus:outline-none" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Designation</label>
                              <input type="text" value={designation} disabled className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-50/50 focus:outline-none" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
                              <input type="text" value={department} disabled className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-50/50 focus:outline-none" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date of Joining</label>
                              <input type="text" value={joiningDate} disabled className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-50/50 focus:outline-none" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Work Location</label>
                              <input type="text" value={location} disabled className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-50/50 focus:outline-none" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 2. Salary Information */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calculator size={18} className="text-slate-400" /> Salary Information
                     </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-6">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select salary structure {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                           {isReadOnly ? (
                              <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50">
                                 {salaryStructures.find(s => s.id === selectedStructureId)?.name || 'Not Assigned'}
                              </div>
                           ) : (
                              <div className="relative">
                                 <select
                                    value={selectedStructureId}
                                    onChange={(e) => setSelectedStructureId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 appearance-none"
                                 >
                                    <option value="">Select Structure</option>
                                    {getFilteredStructures().map(s => (
                                       <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                 </select>
                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                           )}
                        </div>

                        <div id="effective-from-field-main">
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Effective From {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                           <div className="relative">
                              <input
                                 type="date"
                                 value={effectiveFrom}
                                 disabled={isReadOnly}
                                 onChange={(e) => {
                                    setEffectiveFrom(e.target.value);
                                    if (errors.effectiveFrom) setErrors({});
                                 }}
                                 className={`w-full pl-10 pr-4 py-2 text-sm font-bold text-slate-800 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all ${isReadOnly ? 'bg-slate-50 text-slate-500 border-slate-200' : errors.effectiveFrom ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300'}`}
                              />
                              <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReadOnly ? 'text-slate-300' : 'text-slate-400'}`} />
                           </div>
                           {errors.effectiveFrom && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.effectiveFrom}</p>}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual CTC (₹) {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                           <div className="relative">
                              <input
                                 type="number"
                                 value={ctc || ''}
                                 disabled={isReadOnly}
                                 onChange={(e) => setCtc(parseInt(e.target.value) || 0)}
                                 className={`w-full pl-8 pr-4 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Arrears Payout Date {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                           <div className="relative">
                              <input
                                 type="date"
                                 value={arrearsPayoutDate}
                                 onChange={(e) => setArrearsPayoutDate(e.target.value)}
                                 disabled={isReadOnly}
                                 className={`w-full pl-10 pr-4 py-2 text-sm font-bold text-slate-800 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all ${isReadOnly ? 'bg-slate-50 text-slate-500 border-slate-200' : 'border-slate-200 hover:border-slate-300'}`}
                              />
                              <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReadOnly ? 'text-slate-300' : 'text-slate-400'}`} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="px-6 pb-8 pt-6 border-t border-slate-100 bg-slate-50/30">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Applicable Statutory Deductions</label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-6">
                        {[
                           { id: 'providentFund', label: 'Provident Fund' },
                           { id: 'esi', label: 'ESI' },
                           { id: 'professionalTax', label: 'Professional Tax' },
                           { id: 'gratuity', label: 'Gratuity' },
                           { id: 'lwf', label: 'LWF' },
                           { id: 'tds', label: 'TDS/Income Tax' },
                           { id: 'nps', label: 'NPS' }
                        ].map((comp) => (
                           <label key={comp.id} className="flex items-center gap-2.5 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${statutoryDeductions[comp.id as keyof typeof statutoryDeductions] ? 'bg-sky-600 border-sky-600 shadow-sm' : 'border-slate-300 bg-white group-hover:border-sky-400'}`}>
                                 {statutoryDeductions[comp.id as keyof typeof statutoryDeductions] && <CheckCircle size={14} className="text-white" />}
                              </div>
                              <input 
                                 type="checkbox" 
                                 className="hidden" 
                                 checked={statutoryDeductions[comp.id as keyof typeof statutoryDeductions]} 
                                 disabled={isReadOnly}
                                 onChange={() => !isReadOnly && setStatutoryDeductions(prev => ({ ...prev, [comp.id]: !prev[comp.id as keyof typeof statutoryDeductions] }))} 
                              />
                              <span className={`text-sm font-medium transition-colors ${statutoryDeductions[comp.id as keyof typeof statutoryDeductions] ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                 {comp.label}
                              </span>
                           </label>
                        ))}
                     </div>
                  </div>
               </div>

               {/* 3. Bank Details */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Building size={18} className="text-slate-400" /> Bank Information
                     </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Number {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">IFSC Code {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="relative">
                           <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           {!isReadOnly && <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-600 hover:text-sky-700">VERIFY</button>}
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bank Name</label>
                        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-2 border border-slate-100 bg-white rounded-lg text-sm text-slate-800 focus:outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch</label>
                        <input type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-2 border border-slate-100 bg-white rounded-lg text-sm text-slate-800 focus:outline-none" />
                     </div>
                  </div>
               </div>

               {/* 4. Statutory & Tax */}
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
                           <input type="text" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} disabled={isReadOnly} className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Aadhaar Number</label>
                        <div className="relative">
                           <input type="text" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} disabled={isReadOnly} className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">UAN (PF)</label>
                        <input type="text" value={uanNumber} onChange={(e) => setUanNumber(e.target.value)} disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
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
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: Salary Structure Sidebar */}
            <div className="xl:col-span-1">
               <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-24">
                  <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white">
                     <h3 className="font-bold flex items-center gap-2">
                        <Calculator size={18} className="text-emerald-400" /> Salary Structure
                     </h3>
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
                           <tr className="bg-slate-50/50">
                              <td className="px-4 py-2.5 text-slate-500 text-xs italic font-semibold" colSpan={3}>Earnings</td>
                           </tr>
                           {salary.earnings.map((comp, idx) => (
                              <tr key={idx}>
                                 <td className="px-4 py-2.5 text-slate-700 font-medium flex items-center gap-1">
                                    {comp.name} 
                                    {comp.name.toLowerCase().includes('hra') && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded border border-emerald-100">Exempt</span>}
                                 </td>
                                 <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(comp.monthly))}</td>
                                 <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(comp.annual))}</td>
                              </tr>
                           ))}

                           {salary.employeeDeductions.length > 0 && (
                              <>
                                 <tr className="bg-slate-50/50">
                                    <td className="px-4 py-2.5 text-slate-500 text-xs italic font-semibold" colSpan={3}>Deductions (Employee Share)</td>
                                 </tr>
                                 {salary.employeeDeductions.map((comp, idx) => (
                                    <tr key={`emp-ded-${idx}`}>
                                       <td className="px-4 py-2.5 text-slate-700">{comp.name}</td>
                                       <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(comp.monthly))}</td>
                                       <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(comp.annual))}</td>
                                    </tr>
                                 ))}
                              </>
                           )}

                           {salary.employerContributions.length > 0 && (
                              <>
                                 <tr className="bg-slate-50/50">
                                    <td className="px-4 py-2.5 text-slate-500 text-xs italic font-semibold" colSpan={3}>Employer Contributions</td>
                                 </tr>
                                 {salary.employerContributions.map((comp, idx) => (
                                    <tr key={`empr-cont-${idx}`}>
                                       <td className="px-4 py-2.5 text-slate-700">{comp.name}</td>
                                       <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(comp.monthly))}</td>
                                       <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(comp.annual))}</td>
                                    </tr>
                                 ))}
                              </>
                           )}
                        </tbody>
                        <tfoot className="bg-slate-800 text-white border-t border-slate-200">
                           <tr>
                              <td className="px-4 py-3 font-bold">Total CTC</td>
                              <td className="px-4 py-3 text-right opacity-60 text-xs">-</td>
                              <td className="px-4 py-3 text-right font-bold">₹ {formatCurrency(ctc)}</td>
                           </tr>
                           <tr className="border-t border-slate-700/50">
                              <td className="px-4 py-2.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Total Deductions</td>
                              <td className="px-4 py-2.5 text-right opacity-40 text-xs">-</td>
                              <td className="px-4 py-2.5 text-right font-bold text-rose-400">₹ {formatCurrency(Math.round(totalDeductionsAnnual))}</td>
                           </tr>
                           <tr>
                              <td className="px-4 py-2.5 font-bold text-slate-300">Total gross</td>
                              <td className="px-4 py-2.5 text-right opacity-40 text-xs">-</td>
                              <td className="px-4 py-2.5 text-right font-bold text-slate-100">₹ {formatCurrency(Math.round(salary.annualGross))}</td>
                           </tr>
                           <tr className="bg-slate-900 border-t border-slate-700">
                              <td className="px-4 py-3 font-bold text-emerald-400">Monthly take-home</td>
                              <td className="px-4 py-3 text-right opacity-40 text-xs text-slate-400">
                                 -₹{formatCurrency(Math.round(totalDeductionsMonthly))}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-400">
                                 ₹ {formatCurrency(Math.round(monthlyTakeHome))}
                              </td>
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
