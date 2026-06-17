
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
   Clock,
   Info,
   Plus,
   Pencil
} from 'lucide-react';

const EFFECTIVE_MONTHS = (() => {
   const months: string[] = [];
   const start = new Date(2024, 3, 1); // April 2024
   for (let i = 0; i < 36; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      months.push(d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }));
   }
   return months;
})();

interface EditEmployeeProfileProps {
   employeeId?: string;
   onBack?: () => void;
   onViewHistory?: () => void;
   isReadOnly?: boolean;
   userRole?: string;
}

const EditEmployeeProfile: React.FC<EditEmployeeProfileProps> = ({ employeeId, onBack, onViewHistory, isReadOnly = false, userRole }) => {
   const [fullName, setFullName] = useState('Loading...');
   const [designation, setDesignation] = useState('');
   const [department, setDepartment] = useState('Engineering');
   const [joiningDate, setJoiningDate] = useState('');
   const [location, setLocation] = useState('Bangalore');

   const [accountNumber, setAccountNumber] = useState('');
   const [ifscCode, setIfscCode] = useState('');
   const [bankName, setBankName] = useState('');
   const [branchName, setBranchName] = useState('');
   const [bankPayMode, setBankPayMode] = useState<'Online Transfer' | 'Cash' | 'Cheque'>('Online Transfer');

   const [panNumber, setPanNumber] = useState('');
   const [aadhaarNumber, setAadhaarNumber] = useState('');
   const [uanNumber, setUanNumber] = useState('');
   const [pfNumber, setPfNumber] = useState('');
   const [esiNumber, setEsiNumber] = useState('');
   const [pranNumber, setPranNumber] = useState('');

   const [ctc, setCtc] = useState<number>(0);
   const [annualGross, setAnnualGross] = useState<number>(0);
   const [manualAnnualGross, setManualAnnualGross] = useState<number | null>(null);
   const [regime, setRegime] = useState('New Regime (2025)');
   const [bankVerified, setBankVerified] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [selectedStructureId, setSelectedStructureId] = useState('');
   const [effectiveFrom, setEffectiveFrom] = useState('');
   const [salaryPayMode, setSalaryPayMode] = useState('Bank Transfer');
   const [errors, setErrors] = useState<{ effectiveFrom?: string; pranNumber?: string; vpfAmount?: string; vpfPercentage?: string; vpfEffectiveFrom?: string }>({});
   const [arrearsPayoutDate, setArrearsPayoutDate] = useState('');
   const [appraisalMonth, setAppraisalMonth] = useState('');
   const [statutoryDeductions, setStatutoryDeductions] = useState({
      providentFund: false,
      esi: false,
      professionalTax: true,
      gratuity: false,
      lwf: false,
      tds: false,
      nps: false,
      vpf: false
   });

   const [vpfAmount, setVpfAmount] = useState('');
   const [vpfPercentage, setVpfPercentage] = useState('');
   const [vpfEffectiveFrom, setVpfEffectiveFrom] = useState('');

   const [structureComponents, setStructureComponents] = useState<{ earnings: any[], deductions: any[] }>({ earnings: [], deductions: [] });
    const [statutorySettings, setStatutorySettings] = useState<any>(null);
    const [globalRoundOff, setGlobalRoundOff] = useState<'floor' | 'ceiling' | 'nearest_full' | 'nearest_half'>('floor');
    const [salaryInputBasis, setSalaryInputBasis] = useState<'CTC' | 'Gross'>('CTC');

   const [salaryStructures, setSalaryStructures] = useState<{ id: string, name: string, departments?: string[], designations?: string[], employees?: string[] }[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [employeeRawData, setEmployeeRawData] = useState<any>(null);

   const [componentOverrides, setComponentOverrides] = useState<Record<string, number>>({});
   const [isSalaryStructureEditable, setIsSalaryStructureEditable] = useState(false);
   const [salaryStructure, setSalaryStructure] = useState<any>(null);
   const [hasInitializedSalaryStructure, setHasInitializedSalaryStructure] = useState(false);
   const [additionalComponents, setAdditionalComponents] = useState<{ id: string; name: string; type: 'Earning' | 'Deduction'; calculation: string; amount: number; effectiveFrom: string; }[]>([]);
   const [showAddExtraCompModal, setShowAddExtraCompModal] = useState(false);
   const [masterSalaryComps, setMasterSalaryComps] = useState<any[]>([]);
   const [selectedMasterCompId, setSelectedMasterCompId] = useState('');
   const [extraCompEffectiveFrom, setExtraCompEffectiveFrom] = useState('');
   const [selectedCompType, setSelectedCompType] = useState<'Earnings' | 'Deductions'>('Earnings');
   const [flatAmountInput, setFlatAmountInput] = useState('');

   // Refs to track initial values for change detection
   const initialValues = useRef({
      ctc: 0,
      annualGross: 0,
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
      } else {
         setStructureComponents({ earnings: [], deductions: [] });
      }
   }, [selectedStructureId]);

   useEffect(() => {
      if (structureComponents.earnings.length > 0 && !hasInitializedSalaryStructure && ctc > 0) {
         const initialSalary = calculateSalary(ctc);
         setSalaryStructure(initialSalary);
         setHasInitializedSalaryStructure(true);
      }
   }, [structureComponents, ctc, hasInitializedSalaryStructure]);

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

         const { data: roundOffData } = await supabase
            .from('operational_config')
            .select('config_value')
            .eq('config_key', 'round_off_settings')
            .maybeSingle();
         if (roundOffData && roundOffData.config_value) {
            setGlobalRoundOff((roundOffData.config_value as any).round_off_rule || 'floor');
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

   const fetchMasterComponents = async () => {
      try {
         const { data } = await supabase
            .from('salary_components')
            .select('id, name, category, calculation');
         if (data) setMasterSalaryComps(data);
      } catch (err) {
         console.error('Error fetching master components:', err);
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
             const fetchedAnnualGross = Number(data.annual_gross) || 0;
             setCtc(fetchedCtc);
             setAnnualGross(fetchedAnnualGross);
             if (fetchedAnnualGross > 0) setManualAnnualGross(fetchedAnnualGross);
             setRegime(data.tax_regime || 'New Regime (2025)');
             setSelectedStructureId(data.salary_structure_id || '');
             setEffectiveFrom(data.effective_date || '');
             setSalaryPayMode(data.salary_pay_mode || 'Bank Transfer');
 
             // 2. Fetch statutory deductions from operational_config (Workaround for missing column)
             try {
                const { data: configData, error: configError } = await supabase
                   .from('operational_config')
                   .select('config_value')
                   .eq('config_key', `emp_statutory:${employeeId}`)
                   .single();
 
                if (!configError && configData?.config_value) {
                   setStatutoryDeductions(prev => ({ ...prev, ...configData.config_value }));
                   if (configData.config_value.arrears_payout_month) {
                      setArrearsPayoutDate(configData.config_value.arrears_payout_month);
                   }
                   if (configData.config_value.appraisal_month) {
                      setAppraisalMonth(configData.config_value.appraisal_month);
                   }
                    if (configData.config_value.pf_no) {
                       setPfNumber(configData.config_value.pf_no);
                    }
                    if (configData.config_value.esi_no) {
                       setEsiNumber(configData.config_value.esi_no);
                    }
                    if (configData.config_value.pran_no) {
                       setPranNumber(configData.config_value.pran_no);
                    }
                    if (configData.config_value.salary_input_basis) {
                       setSalaryInputBasis(configData.config_value.salary_input_basis);
                    }
                     if (configData.config_value.vpfAmount) {
                        setVpfAmount(configData.config_value.vpfAmount);
                     }
                     if (configData.config_value.vpfPercentage) {
                        setVpfPercentage(configData.config_value.vpfPercentage);
                     }
                     if (configData.config_value.vpfEffectiveFrom) {
                        setVpfEffectiveFrom(configData.config_value.vpfEffectiveFrom);
                     }
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
                annualGross: fetchedAnnualGross,
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
    function calculateSalary(annualCtc: number) {
      const earnings: any[] = [];
      const employeeDeductions: any[] = [];
      const employerContributions: any[] = [];
      let totalEmployerContrib = 0;

      const applyRoundOff = (value: number): number => {
         if (globalRoundOff === 'ceiling') {
            return Math.ceil(value);
         } else if (globalRoundOff === 'nearest_full') {
            return Math.round(value);
         } else if (globalRoundOff === 'nearest_half') {
            return Math.round(value * 2) / 2;
         } else {
            return Math.floor(value);
         }
      };

      // Helper for component calculation
      const calcComp = (comp: any, baseValues: any) => {
         const calc = comp.calculation || '';
         let val = 0;
         if (calc.includes('Balancing Figure')) val = 0;
         else if (calc.includes('% of CTC')) val = annualCtc * (parseFloat(calc) / 100);
         else if (calc.includes('% of Basic')) val = baseValues.basic * (parseFloat(calc) / 100);
         else if (calc.includes('Fixed ₹')) val = parseFloat(calc.replace(/[^\d.-]/g, '')) * 12;
         return applyRoundOff(val);
      };

      // 1. Determine Basic Salary
      let basic = 0;
      const basicComp = structureComponents.earnings.find(c => c.name.toLowerCase().includes('basic'));
      if (basicComp) {
         basic = calcComp(basicComp, {});
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
            const esiContrib = applyRoundOff(currentEarningsTotal * rate);
            employerContributions.push({ name: 'ESI (Employer)', annual: esiContrib, monthly: esiContrib / 12 });
            totalEmployerContrib += esiContrib;
         }
      }

      // Gratuity Employer
      if (statutoryDeductions.gratuity) {
         const gratRate = parseFloat(statutorySettings?.config_value?.gratuityProvisionRate || '4.81') / 100;
         const gratContrib = applyRoundOff(basic * gratRate);
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
      
      if (balancingComp) {
         earnings.push({ name: balancingComp.name, annual: specialVal, monthly: specialVal / 12 });
      }

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
         const esiEmp = applyRoundOff(annualGross * rate);
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

      // VPF Employee
      if (statutoryDeductions.vpf) {
         let vpfEmpAnnual = 0;
         if (vpfAmount) {
            const amt = parseFloat(vpfAmount) || 0;
            vpfEmpAnnual = amt * 12;
         } else if (vpfPercentage) {
            const pct = parseFloat(vpfPercentage) || 0;
            vpfEmpAnnual = basic * (pct / 100);
         }
         if (vpfEmpAnnual > 0) {
            employeeDeductions.push({ name: 'Voluntary Provident Fund (VPF)', annual: vpfEmpAnnual, monthly: vpfEmpAnnual / 12 });
         }
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
   }
   const salary = calculateSalary(ctc);
   const activeSalary = salaryStructure || salary;

   const findCtcForGross = (targetGross: number): number => {
      if (!targetGross || targetGross <= 0) return 0;
      let low = targetGross;
      let high = targetGross * 2;
      let tolerance = 0.5;
      let iterations = 0;
      
      while (low < high && iterations < 100) {
         let mid = (low + high) / 2;
         let computed = calculateSalary(mid);
         if (Math.abs(computed.annualGross - targetGross) < tolerance) {
            return Math.round(mid);
         }
         if (computed.annualGross > targetGross) {
            high = mid;
         } else {
            low = mid;
         }
         iterations++;
      }
      return Math.round((low + high) / 2);
   };

   const calcExtraCompAmount = (calculation: string): number => {
      const calc = calculation || '';
      if (calc.includes('% of CTC')) return ctc * (parseFloat(calc) / 100);
      if (calc.includes('% of Basic')) return activeSalary.basic * (parseFloat(calc) / 100);
      if (calc.includes('% of Gross')) return activeSalary.annualGross * (parseFloat(calc) / 100);
      if (calc.includes('Fixed ₹') || calc.includes('Flat ₹')) return parseFloat(calc.replace(/[^\d.]/g, '')) * 12;
      return 0;
   };

   const totalDeductionsAnnual = activeSalary.employeeDeductions.reduce((sum, d) => sum + d.annual, 0);
   const totalDeductionsMonthly = activeSalary.employeeDeductions.reduce((sum, d) => sum + d.monthly, 0);
   const additionalEarningsMonthly = additionalComponents.filter(c => c.type === 'Earning').reduce((sum, c) => sum + c.amount / 12, 0);
   const additionalDeductionsMonthly = additionalComponents.filter(c => c.type === 'Deduction').reduce((sum, c) => sum + c.amount / 12, 0);
   const monthlyTakeHome = activeSalary.monthlyGross + additionalEarningsMonthly - totalDeductionsMonthly - additionalDeductionsMonthly;

   const handleSave = async () => {
       const hasChanged = ctc !== initialValues.current.ctc || selectedStructureId !== initialValues.current.structureId;
       const validationErrors: any = {};

       if (hasChanged && !effectiveFrom) {
          validationErrors.effectiveFrom = 'Effective From is mandatory when salary details are changed';
       }

       if (userRole === 'HR_MANAGER' && statutoryDeductions.nps) {
          if (!pranNumber || pranNumber.length !== 12 || !/^\d{12}$/.test(pranNumber)) {
             validationErrors.pranNumber = 'PRAN Number must be exactly 12 digits.';
          }
       }

       if (statutoryDeductions.vpf) {
          if (!vpfAmount && !vpfPercentage) {
             validationErrors.vpfAmount = 'Either Fixed Amount or Percentage is required.';
             validationErrors.vpfPercentage = 'Either Fixed Amount or Percentage is required.';
          } else if (vpfAmount) {
             const amt = parseInt(vpfAmount, 10);
             if (isNaN(amt) || amt < 1 || amt > 999999) {
                validationErrors.vpfAmount = 'Fixed Amount must be between 1 and 999999.';
             }
          } else if (vpfPercentage) {
             const pct = parseInt(vpfPercentage, 10);
             if (isNaN(pct) || pct < 1 || pct > 99) {
                validationErrors.vpfPercentage = 'Percentage must be between 1 and 99.';
             }
          }
          if (!vpfEffectiveFrom) {
             validationErrors.vpfEffectiveFrom = 'Effective From month is required.';
          } else {
             const d = new Date();
             const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
             if (vpfEffectiveFrom < currentMonthStr) {
                validationErrors.vpfEffectiveFrom = 'Effective From cannot be a past month.';
             }
          }
       }

       if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          
          if (validationErrors.effectiveFrom) {
             document.getElementById('effective-from-field-main')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (validationErrors.pranNumber) {
             document.getElementById('pran-number-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (validationErrors.vpfAmount || validationErrors.vpfPercentage || validationErrors.vpfEffectiveFrom) {
             document.getElementById('vpf-effective-from-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
       }

       setErrors({});

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
            annual_gross: (manualAnnualGross !== null ? manualAnnualGross : activeSalary.annualGross).toString(),
            tax_regime: regime,
            salary_structure_id: selectedStructureId || null,
            effective_date: effectiveFrom || null,
            salary_pay_mode: salaryPayMode,
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
               config_value: { 
                  ...statutoryDeductions, 
                  arrears_payout_month: arrearsPayoutDate,
                  appraisal_month: appraisalMonth,
                  pf_no: pfNumber,
                  esi_no: esiNumber,
                  pran_no: pranNumber,
                  salary_input_basis: salaryInputBasis,
                  vpfAmount,
                  vpfPercentage,
                  vpfEffectiveFrom
               },
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
      <>
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
                           <>Submitting...</>
                        ) : (
                           <>
                              <Save size={16} /> Submit
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
                                 disabled={isReadOnly || salaryInputBasis === 'Gross'}
                                 onChange={(e) => {
                                    setCtc(parseInt(e.target.value) || 0);
                                    setManualAnnualGross(null);
                                 }}
                                 className={`w-full pl-8 pr-4 py-2 text-sm font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                                    isReadOnly || salaryInputBasis === 'Gross'
                                       ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                                       : 'text-slate-800 bg-white border-slate-200 hover:border-slate-300'
                                 }`}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Arrears Payout Month {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                           <div className="relative">
                              <select
                                 value={arrearsPayoutDate}
                                 onChange={(e) => setArrearsPayoutDate(e.target.value)}
                                 disabled={isReadOnly}
                                 className={`w-full pl-10 pr-4 py-2 text-sm font-bold text-slate-800 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-500 border-slate-200' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                 <option value="">Select Payout Month</option>
                                 {EFFECTIVE_MONTHS.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                 ))}
                              </select>
                              <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReadOnly ? 'text-slate-300' : 'text-slate-400'}`} />
                              {!isReadOnly && <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="px-6 pb-8 pt-6 border-t border-slate-100 bg-slate-50/30">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Applicable Statutory Deductions <span className="text-rose-500">*</span></label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-6">
                        {[
                           { id: 'providentFund', label: 'Provident Fund' },
                           { id: 'esi', label: 'ESI' },
                           { id: 'professionalTax', label: 'Professional Tax' },
                           { id: 'gratuity', label: 'Gratuity' },
                           { id: 'lwf', label: 'LWF' },
                           { id: 'tds', label: 'TDS/Income Tax' },
                           { id: 'nps', label: 'NPS' },
                           { id: 'vpf', label: 'Voluntary Provident Fund (VPF)' }
                        ].filter(comp => !(userRole === 'HR_MANAGER' && comp.id === 'tds')).map((comp) => (
                           <label key={comp.id} className="flex items-center gap-2.5 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${statutoryDeductions[comp.id as keyof typeof statutoryDeductions] ? 'bg-sky-600 border-sky-600 shadow-sm' : 'border-slate-300 bg-white group-hover:border-sky-400'}`}>
                                 {statutoryDeductions[comp.id as keyof typeof statutoryDeductions] && <CheckCircle size={14} className="text-white" />}
                              </div>
                              <input 
                                 type="checkbox" 
                                 className="hidden" 
                                 checked={statutoryDeductions[comp.id as keyof typeof statutoryDeductions]} 
                                 disabled={isReadOnly}
                                 onChange={() => {
                                    if (!isReadOnly) {
                                       setStatutoryDeductions(prev => {
                                          const nextVal = !prev[comp.id as keyof typeof statutoryDeductions];
                                          if (comp.id === 'vpf' && !nextVal) {
                                             setVpfAmount('');
                                             setVpfPercentage('');
                                             setVpfEffectiveFrom('');
                                             setErrors(prevErr => {
                                                const { vpfAmount: _a, vpfPercentage: _p, vpfEffectiveFrom: _e, ...rest } = prevErr;
                                                return rest;
                                             });
                                          }
                                          return { ...prev, [comp.id]: nextVal };
                                       });
                                    }
                                 }} 
                              />
                              <span className={`text-sm font-medium transition-colors ${statutoryDeductions[comp.id as keyof typeof statutoryDeductions] ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                 {comp.label}
                              </span>
                           </label>
                        ))}
                     </div>

                     {statutoryDeductions.vpf && (
                         <div className="mt-6 pt-6 border-t border-slate-200/60 animate-in slide-in-from-top-4 duration-300 space-y-4">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Voluntary Provident Fund (VPF) Configuration</h4>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 max-w-3xl">
                               <div className="w-full md:w-[30%]">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Fixed Amount (Monthly)</label>
                                  <div className="relative">
                                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                     <input 
                                        type="text" 
                                        value={vpfAmount} 
                                        onChange={e => {
                                           const val = e.target.value.replace(/[^0-9]/g, '');
                                           setVpfAmount(val);
                                           if (val) setVpfPercentage('');
                                        }} 
                                        disabled={isReadOnly}
                                        placeholder="Enter fixed amount"
                                        className={`w-full pl-9 pr-4 py-3 bg-white border rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none ${errors.vpfAmount ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200'}`}
                                     />
                                  </div>
                                  {errors.vpfAmount && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.vpfAmount}</p>}
                               </div>
                               <div className="flex items-center justify-center font-black text-slate-400 text-xs px-2 pt-2 md:pt-4">
                                  OR
                               </div>
                               <div className="w-full md:w-[30%]">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Percentage (%)</label>
                                  <div className="relative">
                                     <input 
                                        type="text" 
                                        value={vpfPercentage} 
                                        onChange={e => {
                                           const val = e.target.value.replace(/[^0-9]/g, '');
                                           setVpfPercentage(val);
                                           if (val) setVpfAmount('');
                                        }} 
                                        disabled={isReadOnly}
                                        placeholder="Enter percentage"
                                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none pr-8 ${errors.vpfPercentage ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200'}`}
                                     />
                                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                                  </div>
                                  {errors.vpfPercentage && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.vpfPercentage}</p>}
                               </div>

                               <div className="w-full md:w-[35%] md:ml-auto" id="vpf-effective-from-field">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Effective From <span className="text-rose-500">*</span></label>
                                  <div className="relative">
                                     <input 
                                        type="month" 
                                        value={vpfEffectiveFrom} 
                                        onChange={e => setVpfEffectiveFrom(e.target.value)} 
                                        disabled={isReadOnly}
                                        min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })()}
                                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none ${errors.vpfEffectiveFrom ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200'}`}
                                     />
                                  </div>
                                  {errors.vpfEffectiveFrom && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.vpfEffectiveFrom}</p>}
                               </div>
                            </div>
                         </div>
                      )}
                  </div>
               </div>

               {/* 3. Bank Details */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Building size={18} className="text-slate-400" /> Bank Information
                     </h3>
                  </div>
                  <div className="p-6 space-y-4">
                     {/* Salary Pay Modes radio */}
                     <div className="pb-4 border-b border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Salary Pay Mode {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="flex flex-wrap gap-6">
                           {(['Online Transfer', 'Cash', 'Cheque'] as const).map((mode) => (
                              <label key={mode} className="flex items-center gap-2 cursor-pointer group">
                                 <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${bankPayMode === mode ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}
                                    onClick={() => !isReadOnly && setBankPayMode(mode)}
                                 >
                                    {bankPayMode === mode && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                 </div>
                                 <input type="radio" className="hidden" checked={bankPayMode === mode} onChange={() => !isReadOnly && setBankPayMode(mode)} />
                                 <span className={`text-sm font-medium ${bankPayMode === mode ? 'text-slate-900' : 'text-slate-600'}`}>{mode}</span>
                              </label>
                           ))}
                        </div>
                     </div>

                     {/* Bank fields */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Number {!isReadOnly && bankPayMode === 'Online Transfer' && <span className="text-rose-500">*</span>}</label>
                           <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">IFSC Code {!isReadOnly && bankPayMode === 'Online Transfer' && <span className="text-rose-500">*</span>}</label>
                           <div className="relative">
                              <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bank Name {!isReadOnly && bankPayMode === 'Online Transfer' && <span className="text-rose-500">*</span>}</label>
                           <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-2 border border-slate-100 bg-white rounded-lg text-sm text-slate-800 focus:outline-none" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch {!isReadOnly && bankPayMode === 'Online Transfer' && <span className="text-rose-500">*</span>}</label>
                           <input type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-2 border border-slate-100 bg-white rounded-lg text-sm text-slate-800 focus:outline-none" />
                        </div>
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
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Aadhaar Number {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="relative">
                           <input type="text" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} disabled={isReadOnly} className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                           <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PF Number {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="relative group">
                           <input type="text" value={pfNumber} onChange={(e) => setPfNumber(e.target.value.toUpperCase())} disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} placeholder="AA/BBB/1234567/000/7654321" />
                           <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-10 leading-relaxed">
                              Format: AA/BBB/1234567/000/7654321 (Region/Office/EstID/Extension/MemberID)
                           </div>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">UAN Number {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <input type="text" value={uanNumber} onChange={(e) => setUanNumber(e.target.value)} disabled={isReadOnly} className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ESI Number</label>
                        <input 
                           type="text" 
                           value={esiNumber} 
                           onChange={(e) => {
                              const val = e.target.value;
                              const cleanVal = val.replace(/\D/g, '');
                              if (cleanVal.length <= 10) {
                                 setEsiNumber(cleanVal);
                              }
                           }} 
                           disabled={isReadOnly} 
                           placeholder="Enter ESI Number" 
                           className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : ''}`} 
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tax Regime {!isReadOnly && <span className="text-rose-500">*</span>}</label>
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
                     {userRole === 'HR_MANAGER' && (
                        <div id="pran-number-field">
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PRAN Number {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                           <input
                              type="text"
                              value={pranNumber}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 const cleanVal = val.replace(/\D/g, '');
                                 if (cleanVal.length <= 12) {
                                    setPranNumber(cleanVal);
                                    if (errors.pranNumber) {
                                       setErrors(prev => {
                                          const { pranNumber, ...rest } = prev;
                                          return rest;
                                       });
                                    }
                                 }
                              }}
                              disabled={isReadOnly}
                              placeholder="Enter 12-digit PRAN number"
                              className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${isReadOnly ? 'bg-slate-50' : errors.pranNumber ? 'border-rose-500' : 'border-slate-200'}`}
                           />
                           {errors.pranNumber && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.pranNumber}</p>}
                        </div>
                     )}
                  </div>
               </div>

               {/* 5. General Information */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Info size={18} className="text-slate-400" /> General Information
                     </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Appraisal Month {!isReadOnly && <span className="text-rose-500">*</span>}</label>
                        <div className="relative">
                           <select
                              value={appraisalMonth}
                              onChange={(e) => setAppraisalMonth(e.target.value)}
                              disabled={isReadOnly}
                              className={`w-full pl-10 pr-4 py-2 text-sm font-bold text-slate-800 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-500 border-slate-200' : 'border-slate-200 hover:border-slate-300'}`}
                           >
                              <option value="">Select Month</option>
                              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                 <option key={m} value={m}>{m}</option>
                              ))}
                           </select>
                           <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReadOnly ? 'text-slate-300' : 'text-slate-400'}`} />
                           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
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
                     {!isReadOnly && (
                        <div className="flex items-center gap-2">
                           <button
                              onClick={() => {
                                 const result = calculateSalary(ctc);
                                 setSalaryStructure(result);
                                 setComponentOverrides({});
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all shadow-sm"
                           >
                              Calculate
                           </button>
                           <button
                              onClick={() => setIsSalaryStructureEditable(!isSalaryStructureEditable)}
                              className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${isSalaryStructureEditable ? 'text-emerald-400' : 'text-slate-300'}`}
                              title="Edit Component Values"
                           >
                              <Pencil size={14} />
                           </button>
                        </div>
                     )}
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
                           {activeSalary.earnings.map((comp, idx) => {
                              const overrideAnnual = componentOverrides[comp.name];
                              const displayAnnual = overrideAnnual !== undefined ? overrideAnnual : Math.round(comp.annual);
                              const displayMonthly = Math.round(displayAnnual / 12);
                              return (
                              <tr key={idx}>
                                 <td className="px-4 py-2.5 text-slate-700 font-medium flex items-center gap-1">
                                    {comp.name}
                                    {comp.name.toLowerCase().includes('hra') && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded border border-emerald-100">Exempt</span>}
                                 </td>
                                 <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(displayMonthly)}</td>
                                 <td className="px-4 py-2.5 text-right text-slate-800 font-medium">
                                    {!isReadOnly && isSalaryStructureEditable ? (
                                       <input
                                          type="number"
                                          value={displayAnnual}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComponentOverrides(prev => ({ ...prev, [comp.name]: parseInt(e.target.value) || 0 }))}
                                          className="w-24 text-right px-2 py-0.5 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-sky-500 bg-white"
                                       />
                                    ) : (
                                       <>₹ {formatCurrency(displayAnnual)}</>
                                    )}
                                 </td>
                              </tr>
                              );
                           })}
                           {additionalComponents.filter(c => c.type === 'Earning').map((comp) => (
                              <tr key={`extra-earn-${comp.id}`} className="bg-violet-50/40">
                                 <td className="px-4 py-2.5 text-slate-700 font-medium">
                                    <div className="flex items-center gap-1.5">
                                       {comp.name}
                                       <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 rounded border border-violet-200 font-bold">Custom</span>
                                       {!isReadOnly && (
                                          <button
                                             onClick={() => setAdditionalComponents(prev => prev.filter(c => c.id !== comp.id))}
                                             className="ml-1 text-rose-400 hover:text-rose-600"
                                             title="Remove"
                                          >
                                             <X size={12} />
                                          </button>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(comp.amount / 12))}</td>
                                 <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(comp.amount))}</td>
                              </tr>
                           ))}

                           {(activeSalary.employeeDeductions.length > 0 || additionalComponents.some(c => c.type === 'Deduction')) && (
                              <>
                                 <tr className="bg-slate-50/50">
                                    <td className="px-4 py-2.5 text-slate-500 text-xs italic font-semibold" colSpan={3}>Deductions (Employee Share)</td>
                                 </tr>
                                 {activeSalary.employeeDeductions.map((comp, idx) => (
                                    <tr key={`emp-ded-${idx}`}>
                                       <td className="px-4 py-2.5 text-slate-700">{comp.name}</td>
                                       <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(comp.monthly))}</td>
                                       <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(comp.annual))}</td>
                                    </tr>
                                 ))}
                                 {additionalComponents.filter(c => c.type === 'Deduction').map((comp) => (
                                    <tr key={`extra-ded-${comp.id}`} className="bg-violet-50/40">
                                       <td className="px-4 py-2.5 text-slate-700">
                                          <div className="flex items-center gap-1.5">
                                             {comp.name}
                                             <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 rounded border border-violet-200 font-bold">Custom</span>
                                             {!isReadOnly && (
                                                <button
                                                   onClick={() => setAdditionalComponents(prev => prev.filter(c => c.id !== comp.id))}
                                                   className="ml-1 text-rose-400 hover:text-rose-600"
                                                   title="Remove"
                                                >
                                                   <X size={12} />
                                                </button>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-4 py-2.5 text-right text-slate-600">₹ {formatCurrency(Math.round(comp.amount / 12))}</td>
                                       <td className="px-4 py-2.5 text-right text-slate-800 font-medium">₹ {formatCurrency(Math.round(comp.amount))}</td>
                                    </tr>
                                 ))}
                              </>
                           )}

                           {activeSalary.employerContributions.length > 0 && (
                              <>
                                 <tr className="bg-slate-50/50">
                                    <td className="px-4 py-2.5 text-slate-500 text-xs italic font-semibold" colSpan={3}>Employer Contributions</td>
                                 </tr>
                                 {activeSalary.employerContributions.map((comp, idx) => (
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
                              <td className="px-4 py-2.5 text-right font-bold text-slate-100">₹ {formatCurrency(Math.round(activeSalary.annualGross))}</td>
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

      {/* Add Extra Salary Component Modal */}
      {showAddExtraCompModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Add Extra Salary Component</h2>
                  <button
                     onClick={() => { setShowAddExtraCompModal(false); setSelectedMasterCompId(''); setExtraCompEffectiveFrom(''); setSelectedCompType('Earnings'); setFlatAmountInput(''); }}
                     className="p-2 hover:bg-slate-100 rounded-full"
                  >
                     <X size={18} className="text-slate-500" />
                  </button>
               </div>
               <div className="p-6 space-y-5">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Component Type</label>
                     <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                           onClick={() => { setSelectedCompType('Earnings'); setSelectedMasterCompId(''); }}
                           className={`flex-1 py-2 text-sm font-semibold transition-colors ${selectedCompType === 'Earnings' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                        >
                           Earning
                        </button>
                        <button
                           onClick={() => { setSelectedCompType('Deductions'); setSelectedMasterCompId(''); }}
                           className={`flex-1 py-2 text-sm font-semibold transition-colors border-l border-slate-200 ${selectedCompType === 'Deductions' ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                        >
                           Deduction
                        </button>
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Component</label>
                     <select
                        value={selectedMasterCompId}
                        onChange={(e) => { setSelectedMasterCompId(e.target.value); setFlatAmountInput(''); }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                     >
                        <option value="">-- Select a component --</option>
                        {masterSalaryComps
                           .filter(mc => mc.category === selectedCompType && !additionalComponents.some(ac => ac.id === mc.id))
                           .map(mc => (
                              <option key={mc.id} value={mc.id}>{mc.name}</option>
                           ))
                        }
                     </select>
                  </div>

                  {selectedMasterCompId && (() => {
                     const mc = masterSalaryComps.find(c => c.id === selectedMasterCompId);
                     if (!mc) return null;
                     const isFlat = !mc.calculation || (!mc.calculation.includes('% of') && !mc.calculation.includes('Balancing'));
                     const annual = isFlat
                        ? (parseFloat(flatAmountInput || '0') * 12)
                        : calcExtraCompAmount(mc.calculation || '');
                     return (
                        <div className="space-y-3">
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Formula</label>
                              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">{mc.calculation || 'Flat Amount'}</div>
                           </div>
                           {isFlat ? (
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    Amount (Monthly) <span className="text-rose-500">*</span>
                                 </label>
                                 <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₹</span>
                                    <input
                                       type="number"
                                       value={flatAmountInput}
                                       onChange={(e) => setFlatAmountInput(e.target.value)}
                                       placeholder="Enter monthly amount"
                                       className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                    />
                                 </div>
                                 {flatAmountInput && parseFloat(flatAmountInput) > 0 && (
                                    <p className="text-xs text-slate-500 mt-1.5">Annual: ₹ {formatCurrency(Math.round(parseFloat(flatAmountInput) * 12))}</p>
                                 )}
                              </div>
                           ) : (
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Calculated Amount</label>
                                 <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-800 flex justify-between">
                                    <span>₹ {formatCurrency(Math.round(annual / 12))} / month</span>
                                    <span className="text-emerald-600 font-medium">₹ {formatCurrency(Math.round(annual))} / year</span>
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })()}

                  <div className="flex gap-3 justify-end pt-2">
                     <button
                        onClick={() => { setShowAddExtraCompModal(false); setSelectedMasterCompId(''); setExtraCompEffectiveFrom(''); setSelectedCompType('Earnings'); setFlatAmountInput(''); }}
                        className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={() => {
                           const mc = masterSalaryComps.find(c => c.id === selectedMasterCompId);
                           if (!mc) return;
                           const isFlat = !mc.calculation || (!mc.calculation.includes('% of') && !mc.calculation.includes('Balancing'));
                           const annual = isFlat
                              ? (parseFloat(flatAmountInput || '0') * 12)
                              : calcExtraCompAmount(mc.calculation || '');
                           setAdditionalComponents(prev => [...prev, {
                              id: mc.id,
                              name: mc.name,
                              type: mc.category === 'Earnings' ? 'Earning' : 'Deduction',
                              calculation: mc.calculation || '',
                              amount: annual,
                              effectiveFrom: ''
                           }]);
                           setShowAddExtraCompModal(false);
                           setSelectedMasterCompId('');
                           setFlatAmountInput('');
                        }}
                        disabled={(() => {
                           if (!selectedMasterCompId) return true;
                           const mc = masterSalaryComps.find(c => c.id === selectedMasterCompId);
                           if (!mc) return true;
                           const isFlat = !mc.calculation || (!mc.calculation.includes('% of') && !mc.calculation.includes('Balancing'));
                           return isFlat && (!flatAmountInput || parseFloat(flatAmountInput) <= 0);
                        })()}
                        className="px-4 py-2 text-sm text-white bg-sky-600 rounded-lg hover:bg-sky-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Add
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
      </>
   );
};

export default EditEmployeeProfile;
