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
   TrendingDown,
   PiggyBank,
   Shield,
   Calendar,
   Calculator,
   ArrowDown,
   RefreshCcw,
   Loader
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface DeclarationRow {
   id: number;
   section: string;
   title: string;
   amount: number;
   isExpanded: boolean;
   proofs: number;
   files: string[];
}

interface HouseRentDetails {
   id: number;
   from: string;
   to: string;
   amount: number;
   address: string;
   landlord: string;
   cityType: string;
   pan: string;
}

interface HomeLoanDetails {
   principal: number;
   interest: number;
   lender: string;
   lenderPan: string;
   sanctionDate: string;
   sanctionedAmount: number;
}

interface LetOutProperty {
   id: number;
   annualRent: number;
   municipalTaxes: number;
   hasHomeLoan: boolean;
   principal: number;
   interest: number;
   lender: string;
   lenderPan: string;
}

interface OtherIncomeDetails {
   otherSourceIncome: number;
   savingsInterest: number;
   fdInterest: number;
   nscInterest: number;
}

interface PreviousEmploymentDetails {
   employerName: string;
   employerPAN: string;
   employerAddress: string;
   employmentFrom: string;
   employmentTo: string;
   lastWorkingDay: string;
   totalTaxableSalary: number;
   professionalTax: number;
   providentFund: number;
   totalTDSDeducted: number;
   form12B: string;
}

interface TaxPlanningData {
   declarations: DeclarationRow[];
   hraEnabled: boolean;
   rentedHouses: HouseRentDetails[];
   homeLoanEnabled: boolean;
   homeLoanDetails: HomeLoanDetails;
   letOutEnabled: boolean;
   letOutProperties: LetOutProperty[];
   otherIncomeEnabled: boolean;
   otherIncomeDetails: OtherIncomeDetails;
   prevEmploymentEnabled: boolean;
   prevEmploymentDetails: PreviousEmploymentDetails;
   // Saved flags
   isHraSaved: boolean;
   isHomeLoanSaved: boolean;
   isLetOutSaved: boolean;
   isOtherIncomeSaved: boolean;
   isPrevEmploymentSaved: boolean;
}

const DEFAULT_PLANNING_DATA: TaxPlanningData = {
   declarations: [],
   hraEnabled: false,
   rentedHouses: [],
   homeLoanEnabled: false,
   homeLoanDetails: { principal: 0, interest: 0, lender: '', lenderPan: '', sanctionDate: '', sanctionedAmount: 0 },
   letOutEnabled: false,
   letOutProperties: [],
   otherIncomeEnabled: false,
   otherIncomeDetails: { otherSourceIncome: 0, savingsInterest: 0, fdInterest: 0, nscInterest: 0 },
   prevEmploymentEnabled: false,
   prevEmploymentDetails: {
      employerName: '',
      employerPAN: '',
      employerAddress: '',
      employmentFrom: '',
      employmentTo: '',
      lastWorkingDay: '',
      totalTaxableSalary: 0,
      professionalTax: 0,
      providentFund: 0,
      totalTDSDeducted: 0,
      form12B: ''
   },
   isHraSaved: false,
   isHomeLoanSaved: false,
   isLetOutSaved: false,
   isOtherIncomeSaved: false,
   isPrevEmploymentSaved: false
};

// Limits for Other Investments
const OTHER_SECTION_LIMITS: Record<string, number> = {
   "Section 80CCD(1B) - Additional Exemption on voluntary NPS": 50000,
   "Section 80CCG - Rajiv Gandhi Equity Saving Scheme (RGESS)": 25000,
   "Section 80DD - Treatment of dependent with disability": 75000,
   "Section 80DD - Treatment of dependent with severe disability": 125000,
   "Section 80DDB - Medical Treatment of Specified Diseases (Below 60 years)": 40000,
   "Section 80DDB - Medical Treatment of Specified Diseases (Above 60 years)": 100000,
};

const SECTION_80C_OPTIONS = [
   "Employee Provident Fund (EPF)",
   "Life Insurance Premium (LIC)",
   "Public Provident Fund (PPF)",
   "Unit-Linked Insurance Plan (ULIP)",
   "National Savings Certificate (NSC)",
   "Mutual Fund (MF)",
   "Children's Tuition Fees",
   "NABARD Bonds",
   "Voluntary Provident Fund (VPF)",
   "Tax-saving Fixed Deposit",
   "Equity Linked Saving Scheme (ELSS)",
   "Senior Citizens Savings Scheme (SCSS)",
   "Sukanya Samriddhi Yojana",
   "Principal repayment of home loan"
];

const SECTION_80D_OPTIONS = [
   "Self, Spouse, Children (below 60 years)",
   "Self, Spouse, Children, & Parents (below 60 years)",
   "Self, Spouse, Children (below 60 years) & Parents (Above 60 years)",
   "Self, Spouse, Children & Parents (Above 60 years)",
   "Members of HUF (below 60 years)",
   "Members of HUF (above 60 years)",
   "Preventive Health checkup for Self, Spouse, Children",
   "Preventive Health checkup for Self, Spouse, Children, & Parents (below 60 years)",
   "Preventive Health checkup for Self, Spouse, Children (below 60 years) & Parents (Above 60 years)",
   "Preventive Health checkup for Self, Spouse, Children & Parents (Above 60 years)",
   "Preventive Health checkup for Members of HUF (below 60 years)",
   "Preventive Health checkup for Members of HUF (above 60 years)"
];

const SECTION_OTHERS_OPTIONS = [
   "Section 80CCD(1B) - Additional Exemption on voluntary NPS",
   "Section 80E - Interest paid on Education Loan",
   "Section 80CCG - Rajiv Gandhi Equity Saving Scheme (RGESS)",
   "Section 80DD - Treatment of dependent with disability",
   "Section 80DD - Treatment of dependent with severe disability",
   "Section 80DDB - Medical Treatment of Specified Diseases (Below 60 years)",
   "Section 80DDB - Medical Treatment of Specified Diseases (Above 60 years)",
   "Section 80G - Donations"
];

// Mock Annual Income for calculation
const ANNUAL_GROSS_SALARY = 1800000;
const DEADLINE_DATE = new Date('2026-03-31');

const TaxPlanning: React.FC = () => {
   const [view, setView] = useState<'DASHBOARD' | 'PLANNING' | 'CALCULATOR'>('DASHBOARD');
   const [expandedYear, setExpandedYear] = useState<string | null>('FY 2024-25');

   // Persisted States
   const [declarationStatus, setDeclarationStatus] = useState<'NEW' | 'DRAFT' | 'SUBMITTED'>('NEW'); // Fetched from DB

   // Regime State
   const [planningRegime, setPlanningRegime] = useState<'OLD' | 'NEW'>('OLD'); // Default, will fetch from DB
   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState<'CALCULATOR' | 'DECLARATION'>('DECLARATION');

   // State Management (Initialized with Defaults)
   const [declarations, setDeclarations] = useState<DeclarationRow[]>(DEFAULT_PLANNING_DATA.declarations);

   // HRA
   const [hraEnabled, setHraEnabled] = useState<boolean>(DEFAULT_PLANNING_DATA.hraEnabled);
   const [isHraSaved, setIsHraSaved] = useState<boolean>(DEFAULT_PLANNING_DATA.isHraSaved);
   const [rentedHouses, setRentedHouses] = useState<HouseRentDetails[]>(DEFAULT_PLANNING_DATA.rentedHouses);

   // Home Loan
   const [homeLoanEnabled, setHomeLoanEnabled] = useState<boolean>(DEFAULT_PLANNING_DATA.homeLoanEnabled);
   const [isHomeLoanSaved, setIsHomeLoanSaved] = useState<boolean>(DEFAULT_PLANNING_DATA.isHomeLoanSaved);
   const [homeLoanDetails, setHomeLoanDetails] = useState<HomeLoanDetails>(DEFAULT_PLANNING_DATA.homeLoanDetails);

   // Let Out Property
   const [letOutEnabled, setLetOutEnabled] = useState<boolean>(DEFAULT_PLANNING_DATA.letOutEnabled);
   const [isLetOutSaved, setIsLetOutSaved] = useState<boolean>(DEFAULT_PLANNING_DATA.isLetOutSaved);
   const [letOutProperties, setLetOutProperties] = useState<LetOutProperty[]>(DEFAULT_PLANNING_DATA.letOutProperties);

   // Other Income
   const [otherIncomeEnabled, setOtherIncomeEnabled] = useState<boolean>(DEFAULT_PLANNING_DATA.otherIncomeEnabled);
   const [isOtherIncomeSaved, setIsOtherIncomeSaved] = useState<boolean>(DEFAULT_PLANNING_DATA.isOtherIncomeSaved);
   const [otherIncomeDetails, setOtherIncomeDetails] = useState<OtherIncomeDetails>(DEFAULT_PLANNING_DATA.otherIncomeDetails);

   // Previous Employment
   const [prevEmploymentEnabled, setPrevEmploymentEnabled] = useState<boolean>(DEFAULT_PLANNING_DATA.prevEmploymentEnabled);
   const [isPrevEmploymentSaved, setIsPrevEmploymentSaved] = useState<boolean>(DEFAULT_PLANNING_DATA.isPrevEmploymentSaved);
   const [prevEmploymentDetails, setPrevEmploymentDetails] = useState<PreviousEmploymentDetails>(DEFAULT_PLANNING_DATA.prevEmploymentDetails);

   // UI States
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Calculator State
   const [calcSalary, setCalcSalary] = useState(ANNUAL_GROSS_SALARY);
   const [calc80C, setCalc80C] = useState(0);
   const [calc80D, setCalc80D] = useState(0);
   const [calc80G, setCalc80G] = useState(0);
   const [calc80TTA, setCalc80TTA] = useState(0);
   const [calc80EEA, setCalc80EEA] = useState(0);
   const [calc80CCD, setCalc80CCD] = useState(0);
   const [calc80CCD2, setCalc80CCD2] = useState(0);

   const [calcOtherDeductions, setCalcOtherDeductions] = useState(0);
   const [calcHRA, setCalcHRA] = useState(0);
   const [calcHomeLoanInterestSelf, setCalcHomeLoanInterestSelf] = useState(0);
   const [calcHomeLoanInterestLetOut, setCalcHomeLoanInterestLetOut] = useState(0);
   const [calcExemptAllowances, setCalcExemptAllowances] = useState(0);
   const [calcRentalIncome, setCalcRentalIncome] = useState(0);
   const [calcInterestIncome, setCalcInterestIncome] = useState(0);
   const [calcDigitalAssetsIncome, setCalcDigitalAssetsIncome] = useState(0);
   const [calcOtherIncome, setCalcOtherIncome] = useState(0);
   const [calcStep, setCalcStep] = useState<'BASIC' | 'INCOME' | 'DEDUCTION' | 'SUMMARY'>('BASIC');
   const [calcSummaryRegime, setCalcSummaryRegime] = useState<'OLD' | 'NEW'>('NEW');
   const [calcAgeGroup, setCalcAgeGroup] = useState<'0-60' | '60-80' | '80+'>('0-60');
   const [calcFY, setCalcFY] = useState('FY 2026-27');

   // --- Supabase Integration ---
   const EMPLOYEE_ID = '1'; // Hardcoded for prototype (Priya Sharma)
   const FINANCIAL_YEAR = '2025-2026';

   // Fetch Data
   useEffect(() => {
      const fetchData = async () => {
         setIsLoading(true);
         try {
            const { data, error } = await supabase
               .from('tax_declarations')
               .select('*')
               .eq('employee_id', EMPLOYEE_ID)
               .eq('financial_year', FINANCIAL_YEAR)
               .maybeSingle();

            if (error) throw error;

            if (data) {
               setPlanningRegime(data.regime as 'OLD' | 'NEW' || 'OLD');
               setDeclarationStatus(data.status === 'Submitted' ? 'SUBMITTED' : data.status === 'Draft' ? 'DRAFT' : 'NEW');

               if (data.declaration_data) {
                  const savedData = data.declaration_data as TaxPlanningData;
                  setDeclarations(savedData.declarations || []);

                  setHraEnabled(savedData.hraEnabled);
                  setIsHraSaved(savedData.isHraSaved);
                  setRentedHouses(savedData.rentedHouses || []);

                  setHomeLoanEnabled(savedData.homeLoanEnabled);
                  setIsHomeLoanSaved(savedData.isHomeLoanSaved);
                  setHomeLoanDetails(savedData.homeLoanDetails || DEFAULT_PLANNING_DATA.homeLoanDetails);

                  setLetOutEnabled(savedData.letOutEnabled);
                  setIsLetOutSaved(savedData.isLetOutSaved);
                  setLetOutProperties(savedData.letOutProperties || []);

                  setOtherIncomeEnabled(savedData.otherIncomeEnabled);
                  setIsOtherIncomeSaved(savedData.isOtherIncomeSaved);
                  setOtherIncomeDetails(savedData.otherIncomeDetails || DEFAULT_PLANNING_DATA.otherIncomeDetails);

                  setPrevEmploymentEnabled(savedData.prevEmploymentEnabled);
                  setIsPrevEmploymentSaved(savedData.isPrevEmploymentSaved);
                  setPrevEmploymentDetails(savedData.prevEmploymentDetails || DEFAULT_PLANNING_DATA.prevEmploymentDetails);
               }
            }
         } catch (error) {
            console.error('Error fetching tax declaration:', error);
         } finally {
            setIsLoading(false);
         }
      };

      fetchData();
   }, []);

   // Save Data
   const saveData = async () => {
      // Prepare JSONB blob
      const currentData: TaxPlanningData = {
         declarations,
         hraEnabled,
         rentedHouses,
         homeLoanEnabled,
         homeLoanDetails,
         letOutEnabled,
         letOutProperties,
         otherIncomeEnabled,
         otherIncomeDetails,
         prevEmploymentEnabled,
         prevEmploymentDetails,
         isHraSaved,
         isHomeLoanSaved,
         isLetOutSaved,
         isOtherIncomeSaved,
         isPrevEmploymentSaved
      };

      try {
         const { error } = await supabase
            .from('tax_declarations')
            .upsert({
               id: `TD-${EMPLOYEE_ID}-${FINANCIAL_YEAR}`,
               employee_id: EMPLOYEE_ID,
               financial_year: FINANCIAL_YEAR,
               regime: planningRegime,
               status: declarationStatus === 'SUBMITTED' ? 'Submitted' : 'Draft',
               declaration_data: currentData,
               last_updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

         if (error) throw error;
      } catch (err) {
         console.error("Error saving to Supabase:", err);
      }
   };

   // Auto-save on any change
   useEffect(() => {
      if (!isLoading) {
         const timer = setTimeout(() => {
            saveData();
         }, 1000); // 1s debounce
         return () => clearTimeout(timer);
      }
   }, [
      declarations, hraEnabled, rentedHouses, homeLoanEnabled, homeLoanDetails,
      letOutEnabled, letOutProperties, otherIncomeEnabled, otherIncomeDetails,
      prevEmploymentEnabled, prevEmploymentDetails, planningRegime,
      isHraSaved, isHomeLoanSaved, isLetOutSaved, isOtherIncomeSaved, isPrevEmploymentSaved,
      isLoading
   ]);

   // Read Only Logic
   const isDeadlinePassed = new Date() > DEADLINE_DATE;
   const isReadOnly = declarationStatus === 'SUBMITTED' || isDeadlinePassed;

   const fileInputRef = useRef<HTMLInputElement>(null);
   const [activeUploadId, setActiveUploadId] = useState<number | null>(null);

   // --- Real-time Tax Calculation Logic ---

   const taxCalc = useMemo(() => {
      // 0. Total Income (Salary + Other Sources + Prev Employment)
      const totalOtherIncome = otherIncomeEnabled ? (otherIncomeDetails.otherSourceIncome + otherIncomeDetails.savingsInterest + otherIncomeDetails.fdInterest + otherIncomeDetails.nscInterest) : 0;
      const prevEmpIncome = prevEmploymentEnabled ? prevEmploymentDetails.totalTaxableSalary : 0;
      const grossTotalIncome = ANNUAL_GROSS_SALARY + totalOtherIncome + prevEmpIncome;

      // 1. Calculate Total 80C
      const investments80C = declarations.filter((d: DeclarationRow) => d.section === '80C').reduce((sum: number, d: DeclarationRow) => sum + d.amount, 0);
      const hlPrincipal = homeLoanEnabled ? (homeLoanDetails.principal || 0) : 0;
      // Let out principal is also part of 80C usually, but let's keep it simple or sum it
      const letOutPrincipal = letOutEnabled ? letOutProperties.reduce((sum: number, p: LetOutProperty) => sum + (p.hasHomeLoan ? p.principal : 0), 0) : 0;
      const prevEmpPF = prevEmploymentEnabled ? prevEmploymentDetails.providentFund : 0;

      const total80C = Math.min(investments80C + hlPrincipal + letOutPrincipal + prevEmpPF, 150000);

      // 2. Calculate 80D
      const investments80D = declarations.filter((d: DeclarationRow) => d.section === '80D').reduce((sum: number, d: DeclarationRow) => sum + d.amount, 0);
      const total80D = Math.min(investments80D, 100000); // Simplified cap for Self+Parents

      // 3. HRA Exemption (Simplified)
      // Actual HRA logic: Min(Actual HRA, Rent - 10% Basic, 50% Basic)
      // Assume Basic = 50% of Gross
      const basicSalary = ANNUAL_GROSS_SALARY * 0.5;
      const hraReceived = basicSalary * 0.4; // 40% of basic usually
      const totalRentPaid = hraEnabled ? rentedHouses.reduce((sum: number, h: HouseRentDetails) => sum + (h.amount * 12), 0) : 0;
      const rentMinus10Basic = Math.max(0, totalRentPaid - (basicSalary * 0.1));
      const hraExemption = Math.min(hraReceived, rentMinus10Basic);

      // 4. Section 24 (Home Loan Interest)
      const selfOccupiedInterest = homeLoanEnabled ? Math.min(homeLoanDetails.interest, 200000) : 0;
      const letOutLoss = letOutEnabled ? letOutProperties.reduce((sum: number, p: LetOutProperty) => {
         const nav = Math.max(0, p.annualRent - p.municipalTaxes);
         const stdDed = nav * 0.3;
         const interest = p.hasHomeLoan ? p.interest : 0;
         return (nav - stdDed - interest); // Negative value is loss
      }, 0) : 0;

      // Loss from house property can be set off against salary up to 2L
      const totalHousePropertyLoss = Math.min(Math.abs(Math.min(0, letOutLoss - selfOccupiedInterest)), 200000);

      // 5. Other Deductions
      const otherDeductions = declarations.filter((d: DeclarationRow) => d.section === 'OTHERS').reduce((sum: number, d: DeclarationRow) => {
         const limit = OTHER_SECTION_LIMITS[d.title];
         return sum + (limit ? Math.min(d.amount, limit) : d.amount);
      }, 0);

      // 6. Section 80TTA (Savings Interest Deduction for Old Regime, max 10k)
      const ded80TTA = otherIncomeEnabled ? Math.min(otherIncomeDetails.savingsInterest, 10000) : 0;

      // Previous Employment PT
      const prevEmpPT = prevEmploymentEnabled ? prevEmploymentDetails.professionalTax : 0;

      const totalDeductionsOld = total80C + total80D + hraExemption + totalHousePropertyLoss + otherDeductions + ded80TTA + prevEmpPT + 50000; // + Std Deduction

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
   }, [declarations, hraEnabled, rentedHouses, homeLoanEnabled, homeLoanDetails, letOutEnabled, letOutProperties, otherIncomeEnabled, otherIncomeDetails, prevEmploymentEnabled, prevEmploymentDetails]);


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
         const fileNames = Array.from(e.target.files).map((f: File) => f.name);
         setDeclarations(declarations.map((d: DeclarationRow) => {
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
      setDeclarations(declarations.map((d: DeclarationRow) => {
         if (d.id === rowId) {
            const newFiles = d.files.filter((f: string) => f !== fileName);
            return { ...d, files: newFiles, proofs: newFiles.length };
         }
         return d;
      }));
   };

   // HRA Handlers
   const updateHouse = (id: number, field: string, value: any) => {
      setRentedHouses(rentedHouses.map((h: HouseRentDetails) => h.id === id ? { ...h, [field]: value } : h));
   };

   const removeHouse = (id: number) => {
      setRentedHouses(rentedHouses.filter((h: HouseRentDetails) => h.id !== id));
   };

   // Let Out Handlers
   const updateLetOutProperty = (id: number, field: string, value: any) => {
      setLetOutProperties(letOutProperties.map((p: LetOutProperty) => p.id === id ? { ...p, [field]: value } : p));
   };

   const removeLetOutProperty = (id: number) => {
      setLetOutProperties(letOutProperties.filter((p: LetOutProperty) => p.id !== id));
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
      { code: 'PREV_EMPLOYMENT', name: 'Previous Employment Income', description: 'Declare income and tax details from your previous workplace within this FY.', limit: 'Gross Total Income', availableInNew: true },
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
                  <Layers size={28} className="text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-slate-800">My Investments</h1>
                  <p className="text-slate-500 text-sm">Manage your tax declarations and proofs</p>
               </div>
            </div>

         </div>

         {/* Green Banner */}
         <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0"><Clock size={20} /></div>
            <p className="text-sm font-bold text-emerald-800">Investment Declarations Open – Submit by 31 Mar 2026</p>
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
                  <div className="flex flex-col sm:flex-row gap-4">
                     <button
                        onClick={() => setView('PLANNING')}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 group whitespace-nowrap"
                     >
                        {declarationStatus === 'NEW' ? 'Start Planning' : declarationStatus === 'DRAFT' ? 'Continue Planning' : 'View Submission'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                     <button
                        onClick={() => setView('CALCULATOR')}
                        className="px-8 py-4 bg-[#3B3F8C] hover:bg-[#2D306F] text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border border-indigo-400/20 shadow-lg whitespace-nowrap"
                     >
                        <Plus size={20} className="rotate-45" /> Income Tax Calculator
                     </button>
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-sm font-medium text-slate-500">
                     <span className="flex items-center gap-2"><Clock size={16} /> Window closes Mar 31</span>
                     <span className="text-amber-500 font-bold">25 days remaining</span>
                     {declarationStatus === 'DRAFT' && <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-xs">Draft Saved</span>}
                     {declarationStatus === 'SUBMITTED' && <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs flex items-center gap-1"><CheckCircle size={10} /> Submitted</span>}
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
                           <FileText size={20} />
                        </div>
                        <span className={`font-bold text-lg ${expandedYear === data.year ? 'text-slate-700' : 'text-slate-600'}`}>{data.year}</span>
                     </div>
                     {expandedYear === data.year ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
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
                                          <CheckCircle size={14} /> {item.status}
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

   const renderCalculator = () => {
      const grossIncome = calcSalary + calcInterestIncome + calcRentalIncome + calcDigitalAssetsIncome + calcOtherIncome - calcExemptAllowances;
      const total80C = Math.min(calc80C, 150000);
      const total80D = Math.min(calc80D, 100000);
      const total80TTA = Math.min(calc80TTA, 10000);
      const total80CCD = Math.min(calc80CCD, 50000);
      const totalDeductionsOld = total80C + total80D + total80TTA + total80CCD + calc80G + calc80EEA + calc80CCD2 + calcOtherDeductions + calcHRA + 50000; // Std Ded included

      interface TaxBreakdown {
         totalIncome: number;
         exemptAllowances: number;
         standardDeduction: number;
         chapterVIA: number;
         taxableIncome: number;
         incomeTax: number;
         surcharge: number;
         cess: number;
         totalTax: number;
      }

      const calculate = (income: number, deductions: number, regime: 'OLD' | 'NEW', ageGroup: string): TaxBreakdown => {
         let taxableIncome = 0;
         let tax = 0;
         const stdDed = regime === 'NEW' ? 75000 : 50000;
         const exempt = calcExemptAllowances;
         const chapterVIA = regime === 'NEW' ? 0 : (total80C + total80D + total80TTA + total80CCD + calc80G + calc80EEA + calc80CCD2 + calcOtherDeductions + calcHRA);

         const totalIncBase = calcSalary + calcInterestIncome + calcRentalIncome + calcDigitalAssetsIncome + calcOtherIncome;
         const grossTotal = totalIncBase - exempt;

         // Adjusted Taxable Income
         if (regime === 'OLD') {
            taxableIncome = Math.max(0, grossTotal - deductions);
            let limit1 = 250000;
            if (ageGroup === '60-80') limit1 = 300000;
            if (ageGroup === '80+') limit1 = 500000;

            if (taxableIncome > 1000000) { tax += (taxableIncome - 1000000) * 0.3; taxableIncome = 1000000; }
            if (taxableIncome > 500000) { tax += (taxableIncome - 500000) * 0.2; taxableIncome = 500000; }
            if (taxableIncome > limit1) { tax += (taxableIncome - limit1) * 0.05; }
         } else {
            taxableIncome = Math.max(0, grossTotal - stdDed);
            if (taxableIncome > 2400000) { tax += (taxableIncome - 2400000) * 0.3; taxableIncome = 2400000; }
            if (taxableIncome > 2000000) { tax += (taxableIncome - 2000000) * 0.25; taxableIncome = 2000000; }
            if (taxableIncome > 1600000) { tax += (taxableIncome - 1600000) * 0.20; taxableIncome = 1600000; }
            if (taxableIncome > 1200000) { tax += (taxableIncome - 1200000) * 0.15; taxableIncome = 1200000; }
            if (taxableIncome > 800000) { tax += (taxableIncome - 800000) * 0.10; taxableIncome = 800000; }
            if (taxableIncome > 400000) { tax += (taxableIncome - 400000) * 0.05; }
         }

         const cess = Math.round(tax * 0.04);
         return {
            totalIncome: totalIncBase,
            exemptAllowances: exempt,
            standardDeduction: stdDed,
            chapterVIA: chapterVIA,
            taxableIncome: regime === 'OLD' ? Math.max(0, grossTotal - deductions) : Math.max(0, grossTotal - stdDed),
            incomeTax: tax,
            surcharge: 0, // Placeholder
            cess: cess,
            totalTax: tax + cess
         };
      };

      const oldResult = calculate(grossIncome, totalDeductionsOld, 'OLD', calcAgeGroup);
      const newResult = calculate(grossIncome, 0, 'NEW', calcAgeGroup);
      const oldTax = oldResult.totalTax;
      const newTax = newResult.totalTax;

      const steps = [
         { id: 'BASIC', label: 'Basic details' },
         { id: 'INCOME', label: 'Income details' },
         { id: 'DEDUCTION', label: 'Deduction' }
      ] as const;

      return (
         <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
               <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                     <Calculator className="text-blue-600" /> Income Tax Calculator
                  </h1>
                  <p className="text-sm text-slate-500 font-medium italic">Simulate different scenarios to find your optimal tax regime</p>
               </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-0">
               <div className="grid grid-cols-12">
                  {/* Left Main Content */}
                  <div className={`col-span-12 ${calcStep !== 'BASIC' ? 'lg:col-span-8 border-r' : ''} border-slate-200`}>
                     {/* Calculator Tabs */}
                     {calcStep !== 'SUMMARY' && (
                        <div className="flex border-b border-slate-200 px-8 pt-6">
                           {steps.map((step) => (
                              <button
                                 key={step.id}
                                 onClick={() => setCalcStep(step.id)}
                                 className={`px-6 py-4 text-sm font-bold transition-all relative ${calcStep === step.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                 {step.label}
                                 {calcStep === step.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-in fade-in slide-in-from-bottom-1"></div>}
                              </button>
                           ))}
                        </div>
                     )}

                     <div className="p-10">
                        {calcStep === 'BASIC' && (
                           <div className="space-y-10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-600 ml-1">Financial year</label>
                                    <div className="relative">
                                       <select
                                          value={calcFY}
                                          onChange={(e) => setCalcFY(e.target.value)}
                                          className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none overflow-hidden text-ellipsis whitespace-nowrap"
                                       >
                                          <option>FY 2026-2027 (Return to be filed between 1st April 2027 - 31st March 2028)</option>
                                          <option>FY 2025-2026 (Return to be filed between 1st April 2026 - 31st March 2027)</option>
                                       </select>
                                       <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-600 ml-1">Age group</label>
                                    <div className="relative">
                                       <select
                                          value={calcAgeGroup}
                                          onChange={(e) => setCalcAgeGroup(e.target.value as any)}
                                          className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none"
                                       >
                                          <option value="0-60">0-60</option>
                                          <option value="60-80">60-80</option>
                                          <option value="80+">80+</option>
                                       </select>
                                       <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <h3 className="text-xl font-black text-center text-slate-800">Income Tax Slab Rates</h3>
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* New Regime Table */}
                                    <div className="space-y-4">
                                       <p className="text-center font-bold text-slate-600">New Regime Slab Rates</p>
                                       <table className="w-full border-collapse rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                             <tr>
                                                <th className="px-6 py-4 text-left border-b border-slate-100">Income Tax Slabs (Rs.)</th>
                                                <th className="px-6 py-4 text-left border-b border-slate-100">Income Tax Rates</th>
                                             </tr>
                                          </thead>
                                          <tbody className="text-sm font-bold text-slate-700">
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">Up to 4 lakh</td><td className="px-6 py-3.5 text-slate-400">Nil</td></tr>
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">4 lakh to 8 lakh</td><td className="px-6 py-3.5">5%</td></tr>
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">8 lakh to 12 lakh</td><td className="px-6 py-3.5">10%</td></tr>
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">12 lakh to 16 lakh</td><td className="px-6 py-3.5">15%</td></tr>
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">16 lakh to 20 lakh</td><td className="px-6 py-3.5">20%</td></tr>
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">20 lakh to 24 lakh</td><td className="px-6 py-3.5">25%</td></tr>
                                             <tr className=""><td className="px-6 py-3.5">Above 24 lakh</td><td className="px-6 py-3.5">30%</td></tr>
                                          </tbody>
                                       </table>
                                    </div>
                                    {/* Old Regime Table */}
                                    <div className="space-y-4">
                                       <p className="text-center font-bold text-slate-600">Old Regime Slab Rates</p>
                                       <table className="w-full border-collapse rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                             <tr>
                                                <th className="px-6 py-4 text-left border-b border-slate-100">Income Tax Slabs (Rs.)</th>
                                                <th className="px-6 py-4 text-left border-b border-slate-100">Income Tax Rates</th>
                                             </tr>
                                          </thead>
                                          <tbody className="text-sm font-bold text-slate-700">
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">Up to 2.5 lakh</td><td className="px-6 py-3.5 text-slate-400">Nil</td></tr>
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">2.5 lakh - 5 lakh</td><td className="px-6 py-3.5">5%</td></tr>
                                             <tr className="border-b border-slate-50"><td className="px-6 py-3.5">5 lakh - 10 lakh</td><td className="px-6 py-3.5">20%</td></tr>
                                             <tr className=""><td className="px-6 py-3.5">Above 10 lakh</td><td className="px-6 py-3.5">30%</td></tr>
                                          </tbody>
                                       </table>
                                       <p className="text-[10px] text-slate-400 italic text-right px-2">* Slab rates vary for resident senior and super senior citizens.</p>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex justify-center pt-10">
                                 <button
                                    onClick={() => setCalcStep('INCOME')}
                                    className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all border border-blue-500"
                                 >
                                    Continue
                                 </button>
                              </div>
                           </div>
                        )}

                        {calcStep === 'INCOME' && (
                           <div className="space-y-10 animate-fade-in-up">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                 {/* Column 1 */}
                                 <div className="space-y-8">
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Income from Salary</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcSalary || ''}
                                             onChange={(e) => setCalcSalary(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Income from interest</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcInterestIncome || ''}
                                             onChange={(e) => setCalcInterestIncome(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Rental income received</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcRentalIncome || ''}
                                             onChange={(e) => setCalcRentalIncome(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Income from digital assets</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcDigitalAssetsIncome || ''}
                                             onChange={(e) => setCalcDigitalAssetsIncome(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>
                                 </div>

                                 {/* Column 2 */}
                                 <div className="space-y-8">
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Exempt allowances</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcExemptAllowances || ''}
                                             onChange={(e) => setCalcExemptAllowances(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Interest on home loan - Self occupied</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcHomeLoanInterestSelf || ''}
                                             onChange={(e) => setCalcHomeLoanInterestSelf(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Interest on Home Loan- Let Out</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcHomeLoanInterestLetOut || ''}
                                             onChange={(e) => setCalcHomeLoanInterestLetOut(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Other income</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcOtherIncome || ''}
                                             onChange={(e) => setCalcOtherIncome(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex justify-center gap-6 pt-10">
                                 <button
                                    onClick={() => setCalcStep('BASIC')}
                                    className="px-10 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all min-w-[160px]"
                                 >
                                    Back
                                 </button>
                                 <button
                                    onClick={() => setCalcStep('DEDUCTION')}
                                    className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all min-w-[160px]"
                                 >
                                    Continue
                                 </button>
                              </div>
                           </div>
                        )}

                        {calcStep === 'DEDUCTION' && (
                           <div className="space-y-10 animate-fade-in-up">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                 {/* Column 1 */}
                                 <div className="space-y-8">
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Basic deductions - 80C</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calc80C || ''}
                                             onChange={(e) => setCalc80C(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Medical insurance - 80D</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calc80D || ''}
                                             onChange={(e) => setCalc80D(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Interest on housing loan - 80EEA</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calc80EEA || ''}
                                             onChange={(e) => setCalc80EEA(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Employer's contribution to NPS - 80CCD(2)</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calc80CCD2 || ''}
                                             onChange={(e) => setCalc80CCD2(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>
                                 </div>

                                 {/* Column 2 */}
                                 <div className="space-y-8">
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Interest from deposits - 80TTA</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calc80TTA || ''}
                                             onChange={(e) => setCalc80TTA(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Donations to charity - 80G</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calc80G || ''}
                                             onChange={(e) => setCalc80G(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Employee's contribution to NPS - 80CCD</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calc80CCD || ''}
                                             onChange={(e) => setCalc80CCD(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center pr-1">
                                          <label className="text-sm font-bold text-slate-600">Any other deduction</label>
                                          <Info size={16} className="text-slate-400 cursor-help" />
                                       </div>
                                       <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={calcOtherDeductions || ''}
                                             onChange={(e) => setCalcOtherDeductions(Number(e.target.value))}
                                             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500 transition-all"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex justify-center gap-6 pt-10">
                                 <button
                                    onClick={() => setCalcStep('INCOME')}
                                    className="px-10 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all min-w-[170px]"
                                 >
                                    Back
                                 </button>
                                 <button
                                    onClick={() => setCalcStep('SUMMARY')}
                                    className="px-10 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-all min-w-[170px]"
                                 >
                                    View Calculation
                                 </button>
                              </div>
                           </div>
                        )}

                        {calcStep === 'SUMMARY' && (
                           <div className="space-y-10 animate-fade-in-up transition-all duration-500">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                 <div className="flex items-center gap-4">
                                    <button
                                       onClick={() => setCalcStep('DEDUCTION')}
                                       className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                       <ArrowLeft size={20} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                       <h2 className="text-2xl font-bold text-slate-800">Summary - {calcFY} (AY 2026-2027)</h2>
                                       <Info size={18} className="text-slate-400" />
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-6">
                                    <button onClick={() => { setCalcFY('FY 2026-27'); setCalcStep('BASIC'); }} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                                       <ArrowDown size={14} /> Calculate for FY 2026-2027
                                    </button>
                                    <button onClick={() => setCalcStep('BASIC')} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                                       <RefreshCcw size={14} /> Recalculate
                                    </button>
                                 </div>
                              </div>

                              <div className="flex border-b border-slate-100 gap-8">
                                 <button
                                    onClick={() => setCalcSummaryRegime('NEW')}
                                    className={`px-4 py-3 text-sm font-bold transition-all relative ${calcSummaryRegime === 'NEW' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                    New regime
                                    {calcSummaryRegime === 'NEW' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
                                 </button>
                                 <button
                                    onClick={() => setCalcSummaryRegime('OLD')}
                                    className={`px-4 py-3 text-sm font-bold transition-all relative ${calcSummaryRegime === 'OLD' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                    Old regime
                                    {oldTax <= newTax && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-tighter">Recommended</span>}
                                    {calcSummaryRegime === 'OLD' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
                                 </button>
                                 {newTax < oldTax && <span className="self-center text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-tighter">Recommended</span>}
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                 {/* Visualization Section */}
                                 <div className="lg:col-span-5 space-y-12">
                                    <div className="relative h-64 border-l border-b border-slate-100 flex items-end justify-around pb-2 px-8">
                                       {/* Mock Chart based on actual values */}
                                       <div className="flex flex-col items-center gap-2 w-12 group">
                                          <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-blue-200" style={{ height: '95%' }}></div>
                                          <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                                       </div>
                                       <div className="flex flex-col items-center gap-2 w-12 group">
                                          <div className="w-full bg-blue-900 rounded-t-lg transition-all group-hover:bg-slate-800" style={{ height: `${Math.min(100, (oldResult.exemptAllowances + oldResult.standardDeduction + oldResult.chapterVIA) / oldResult.totalIncome * 100)}%` }}></div>
                                          <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                                       </div>
                                       <div className="flex flex-col items-center gap-2 w-12 group">
                                          <div className="w-full bg-blue-400 rounded-t-lg transition-all group-hover:bg-blue-500" style={{ height: `${Math.min(100, oldResult.taxableIncome / oldResult.totalIncome * 100)}%` }}></div>
                                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                       </div>
                                       <div className="flex flex-col items-center gap-2 w-12 group">
                                          <div className="w-full bg-emerald-400 rounded-t-lg transition-all group-hover:bg-emerald-500" style={{ height: `${Math.min(100, oldResult.totalTax / oldResult.totalIncome * 100 * 5)}%` }}></div>
                                          <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                       </div>

                                       <div className="absolute left-0 right-0 top-1/4 border-t border-slate-50 opacity-50"></div>
                                       <div className="absolute left-0 right-0 top-2/4 border-t border-slate-50 opacity-50"></div>
                                       <div className="absolute left-0 right-0 top-3/4 border-t border-slate-50 opacity-50"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 text-xs font-bold text-slate-500 pl-4">
                                       <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-100 rounded-sm"></div> Total income
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div> Taxable income
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-900 rounded-sm"></div> Deduction
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div> Tax payable
                                       </div>
                                    </div>
                                 </div>

                                 {/* Detailed Cards Section */}
                                 <div className="lg:col-span-7 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       {/* Total Income Card */}
                                       <div className="bg-slate-50/50 rounded-[28px] p-8 border border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total income</p>
                                          <p className="text-4xl font-black text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? newResult.totalIncome : oldResult.totalIncome).toLocaleString()}</p>
                                       </div>

                                       {/* Taxable Income Card */}
                                       <div className="bg-slate-50/50 rounded-[28px] p-8 border border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Taxable income</p>
                                          <p className="text-4xl font-black text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? newResult.taxableIncome : oldResult.taxableIncome).toLocaleString()}</p>
                                       </div>

                                       {/* Exemptions Breakdown Card */}
                                       <div className="bg-slate-50/50 rounded-[28px] p-8 border border-slate-100 space-y-6">
                                          <div className="text-center">
                                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Exemption and deduction</p>
                                             <p className="text-4xl font-black text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? (newResult.exemptAllowances + newResult.standardDeduction) : (oldResult.exemptAllowances + oldResult.standardDeduction + oldResult.chapterVIA)).toLocaleString()}</p>
                                          </div>
                                          <div className="pt-6 border-t border-slate-200/60 space-y-4">
                                             <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Exempt Allowances</span>
                                                <span className="text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? newResult.exemptAllowances : oldResult.exemptAllowances).toLocaleString()}</span>
                                             </div>
                                             <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Standard Deductions</span>
                                                <span className="text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? newResult.standardDeduction : oldResult.standardDeduction).toLocaleString()}</span>
                                             </div>
                                             <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Chapter VI A Deductions</span>
                                                <span className="text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? 0 : oldResult.chapterVIA).toLocaleString()}</span>
                                             </div>
                                          </div>
                                       </div>

                                       {/* Tax Payable Breakdown Card */}
                                       <div className="bg-slate-50/50 rounded-[28px] p-8 border border-slate-100 space-y-6">
                                          <div className="text-center">
                                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tax payable</p>
                                             <p className="text-4xl font-black text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? newResult.totalTax : oldResult.totalTax).toLocaleString()}</p>
                                          </div>
                                          <div className="pt-6 border-t border-slate-200/60 space-y-4">
                                             <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Income tax</span>
                                                <span className="text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? newResult.incomeTax : oldResult.incomeTax).toLocaleString()}</span>
                                             </div>
                                             <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Surcharge</span>
                                                <span className="text-slate-800">₹ 0</span>
                                             </div>
                                             <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Health and education cess</span>
                                                <span className="text-slate-800">₹ {(calcSummaryRegime === 'NEW' ? newResult.cess : oldResult.cess).toLocaleString()}</span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Right Sidebar: Tax Liability Summary */}
                  {calcStep !== 'BASIC' && calcStep !== 'SUMMARY' && (
                     <div className="col-span-12 lg:col-span-4 bg-slate-50/50 p-8 h-full">
                        <div className="sticky top-8 space-y-8">
                           <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
                              <h3 className="text-xl font-bold text-center text-slate-800">Tax Liability Summary</h3>

                              <div className="space-y-6">
                                 <div className="text-center">
                                    <p className="text-sm font-medium text-slate-400 mb-1">Old Regime</p>
                                    <p className="text-2xl font-black text-slate-900">₹ {oldTax.toLocaleString()}</p>
                                 </div>

                                 <div className="flex items-center justify-center gap-4">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase italic">vs</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                 </div>

                                 <div className="text-center">
                                    <p className="text-sm font-medium text-slate-400 mb-1">New Regime</p>
                                    <p className="text-2xl font-black text-slate-900">₹ {newTax.toLocaleString()}</p>
                                 </div>
                              </div>

                              <div className={`p-6 rounded-2xl text-center transition-all ${newTax <= oldTax ? 'bg-emerald-50 border border-emerald-100' : 'bg-blue-50 border border-blue-100'}`}>
                                 <p className={`text-sm font-bold mb-1 ${newTax <= oldTax ? 'text-emerald-600' : 'text-blue-600'}`}>You save</p>
                                 <p className={`text-3xl font-black ${newTax <= oldTax ? 'text-emerald-700' : 'text-blue-700'}`}>₹ {Math.abs(oldTax - newTax).toLocaleString()}</p>
                              </div>

                           </div>

                           <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 items-start">
                              <Info size={18} className="text-amber-500 mt-1 shrink-0" />
                              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                 Standard deduction of ₹75,000 is included in New Regime calculation for FY 2025-26.
                              </p>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      );
   };

   return (
      <div className="pb-10 max-w-[1400px] mx-auto">
         {view === 'DASHBOARD' ? renderDashboard() : view === 'CALCULATOR' ? renderCalculator() : (
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
               <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4">
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

                  if (section.code === 'PREV_EMPLOYMENT') {
                     return (
                        <div key={section.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                              <div>
                                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{section.name}</h3>
                                 <p className="text-[10px] text-slate-400 font-bold mt-0.5">{section.description}</p>
                              </div>

                              <div className="flex items-center gap-4">
                                 {prevEmploymentEnabled && (
                                    <button
                                       onClick={() => !isReadOnly && setIsPrevEmploymentSaved(!isPrevEmploymentSaved)}
                                       disabled={isReadOnly}
                                       className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPrevEmploymentSaved ? 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                       title={isPrevEmploymentSaved ? "Edit Details" : "Save Details"}
                                    >
                                       {isPrevEmploymentSaved ? <Edit2 size={14} /> : <Check size={16} />}
                                    </button>
                                 )}

                                 <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold ${prevEmploymentEnabled ? 'text-blue-600' : 'text-slate-400'}`}>{prevEmploymentEnabled ? 'Yes' : 'No'}</span>
                                    <button
                                       onClick={() => {
                                          if (!isPrevEmploymentSaved && !isReadOnly) {
                                             setPrevEmploymentEnabled(!prevEmploymentEnabled);
                                             if (prevEmploymentEnabled) setIsPrevEmploymentSaved(false);
                                          }
                                       }}
                                       disabled={isPrevEmploymentSaved || isReadOnly}
                                       className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${prevEmploymentEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'} ${(isPrevEmploymentSaved || isReadOnly) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                       <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                    </button>
                                 </div>
                              </div>
                           </div>

                           {prevEmploymentEnabled && (
                              <div className={`p-6 space-y-6 animate-fade-in-up ${isPrevEmploymentSaved ? 'opacity-70' : ''}`}>
                                 <div className="grid grid-cols-12 gap-6">
                                    {/* --- New Employer Fields --- */}
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Previous Employer Name</label>
                                       <div className="relative">
                                          <input
                                             type="text"
                                             value={prevEmploymentDetails.employerName || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, employerName: e.target.value })}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50"
                                             placeholder="Enter company name"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Previous Employer PAN</label>
                                       <div className="relative">
                                          <input
                                             type="text"
                                             value={prevEmploymentDetails.employerPAN || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             maxLength={10}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, employerPAN: e.target.value.toUpperCase() })}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50 uppercase"
                                             placeholder="ABCDE1234F"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Previous Employer Address</label>
                                       <div className="relative">
                                          <textarea
                                             value={prevEmploymentDetails.employerAddress || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, employerAddress: e.target.value })}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50 min-h-[80px] resize-none"
                                             placeholder="Enter full address"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Employment From</label>
                                       <div className="relative">
                                          <input
                                             type="date"
                                             value={prevEmploymentDetails.employmentFrom || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             min="2025-04-01"
                                             max="2026-03-31"
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, employmentFrom: e.target.value })}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Employment To</label>
                                       <div className="relative">
                                          <input
                                             type="date"
                                             value={prevEmploymentDetails.employmentTo || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             min={prevEmploymentDetails.employmentFrom}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, employmentTo: e.target.value })}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Last Working Day</label>
                                       <div className="relative">
                                          <input
                                             type="date"
                                             value={prevEmploymentDetails.lastWorkingDay || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, lastWorkingDay: e.target.value })}
                                             className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 h-px bg-slate-100 my-2"></div>

                                    <div className="col-span-12 md:col-span-6">
                                       <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                          Total Taxable Salary
                                          <div className="group relative">
                                             <Info size={12} className="text-slate-400 cursor-help" />
                                             <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] font-normal rounded-lg shadow-xl z-50 normal-case leading-relaxed">
                                                Gross salary minus exemptions like HRA or LTA
                                                <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-800"></div>
                                             </div>
                                          </div>
                                       </label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={prevEmploymentDetails.totalTaxableSalary || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, totalTaxableSalary: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Total TDS Deducted</label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={prevEmploymentDetails.totalTDSDeducted || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, totalTDSDeducted: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Professional Tax (PT)</label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={prevEmploymentDetails.professionalTax || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, professionalTax: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                          Provident Fund (PF)
                                          <div className="group relative">
                                             <Info size={12} className="text-slate-400 cursor-help" />
                                             <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] font-normal rounded-lg shadow-xl z-50 normal-case leading-relaxed">
                                                Employee’s contribution to PF
                                                <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-800"></div>
                                             </div>
                                          </div>
                                       </label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={prevEmploymentDetails.providentFund || ''}
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => setPrevEmploymentDetails({ ...prevEmploymentDetails, providentFund: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Form 12B (PDF Only)</label>
                                       <div className="relative border border-slate-200 rounded-lg p-3 bg-slate-50">
                                          <input
                                             type="file"
                                             accept="application/pdf"
                                             disabled={isPrevEmploymentSaved || isReadOnly}
                                             onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                   if (e.target.files[0].type === 'application/pdf') {
                                                      setPrevEmploymentDetails({ ...prevEmploymentDetails, form12B: e.target.files[0].name });
                                                   } else {
                                                      alert("Only PDF files are allowed");
                                                      e.target.value = '';
                                                   }
                                                }
                                             }}
                                             className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                                          />
                                          {prevEmploymentDetails.form12B && (
                                             <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 p-1.5 rounded border border-emerald-100 w-fit">
                                                <Check size={12} /> Selected: {prevEmploymentDetails.form12B}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  }

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
                                       {index > 0 && !isHraSaved && !isReadOnly && <div className="absolute top-0 right-0"><button onClick={() => removeHouse(house.id)} className="text-red-500"><X size={16} /></button></div>}
                                       <h4 className="text-sm font-bold text-slate-800 mb-4">House Rent Details {rentedHouses.length > 1 ? `#${index + 1}` : ''}</h4>

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
                                       <Plus size={16} className="bg-blue-100 rounded-full p-0.5" /> Add Rented House
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
                                    {/* Loan Sanction Details */}
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                          Loan Sanction Date
                                          <div className="group relative">
                                             <Info size={12} className="text-slate-400 cursor-help" />
                                             <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] font-normal rounded-lg shadow-xl z-50 normal-case leading-relaxed">
                                                Enter the date when your home loan was officially approved/sanctioned by the lender. This date is mentioned in your loan sanction letter.
                                                <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-800"></div>
                                             </div>
                                          </div>
                                       </label>
                                       <input
                                          type="date"
                                          max={new Date().toISOString().split('T')[0]}
                                          value={homeLoanDetails.sanctionDate}
                                          disabled={isHomeLoanSaved || isReadOnly}
                                          onChange={(e) => setHomeLoanDetails({ ...homeLoanDetails, sanctionDate: e.target.value })}
                                          className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50 ${homeLoanDetails.sanctionDate && new Date(homeLoanDetails.sanctionDate) > new Date() ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                                             }`}
                                       />
                                       {homeLoanDetails.sanctionDate && new Date(homeLoanDetails.sanctionDate) > new Date() && (
                                          <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                                             <AlertTriangle size={10} /> Invalid Loan sanction date
                                          </p>
                                       )}
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                          Sanctioned Loan Amount
                                          <div className="group relative">
                                             <Info size={12} className="text-slate-400 cursor-help" />
                                             <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] font-normal rounded-lg shadow-xl z-50 normal-case leading-relaxed">
                                                Enter the total home loan amount approved by your lender (as mentioned in your loan sanction letter).
                                                <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-800"></div>
                                             </div>
                                          </div>
                                       </label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={homeLoanDetails.sanctionedAmount}
                                             disabled={isHomeLoanSaved || isReadOnly}
                                             onChange={(e) => setHomeLoanDetails({ ...homeLoanDetails, sanctionedAmount: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>

                                    {/* Principal */}
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Principal Paid on Home Loan</label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={homeLoanDetails.principal}
                                             disabled={isHomeLoanSaved || isReadOnly}
                                             onChange={(e) => setHomeLoanDetails({ ...homeLoanDetails, principal: Number(e.target.value) })}
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
                                             onChange={(e) => setHomeLoanDetails({ ...homeLoanDetails, interest: Number(e.target.value) })}
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
                                          onChange={(e) => setHomeLoanDetails({ ...homeLoanDetails, lender: e.target.value })}
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
                                          onChange={(e) => setHomeLoanDetails({ ...homeLoanDetails, lenderPan: e.target.value })}
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
                              <div className="p-6 space-y-8">
                                 {letOutProperties.map((prop, index) => (
                                    <div key={prop.id} className={`space-y-6 animate-fade-in-up ${isLetOutSaved ? 'opacity-70' : ''}`}>
                                       <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                          <h4 className="text-sm font-bold text-slate-800">Property Details {letOutProperties.length > 1 ? `#${index + 1}` : ''}</h4>
                                          {index > 0 && !isLetOutSaved && !isReadOnly && (
                                             <button onClick={() => removeLetOutProperty(prop.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors">
                                                <Trash2 size={16} />
                                             </button>
                                          )}
                                       </div>

                                       <div className="grid grid-cols-12 gap-6">
                                          <div className="col-span-12 md:col-span-6">
                                             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Annual Rent Received</label>
                                             <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input
                                                   type="number"
                                                   value={prop.annualRent}
                                                   disabled={isLetOutSaved || isReadOnly}
                                                   onChange={(e) => updateLetOutProperty(prop.id, 'annualRent', Number(e.target.value))}
                                                   className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                />
                                             </div>
                                          </div>
                                          <div className="col-span-12 md:col-span-6">
                                             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Municipal Taxes Paid</label>
                                             <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input
                                                   type="number"
                                                   value={prop.municipalTaxes}
                                                   disabled={isLetOutSaved || isReadOnly}
                                                   onChange={(e) => updateLetOutProperty(prop.id, 'municipalTaxes', Number(e.target.value))}
                                                   className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                />
                                             </div>
                                          </div>

                                          <div className="col-span-12">
                                             <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                   type="checkbox"
                                                   checked={prop.hasHomeLoan}
                                                   disabled={isLetOutSaved || isReadOnly}
                                                   onChange={(e) => updateLetOutProperty(prop.id, 'hasHomeLoan', e.target.checked)}
                                                   className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                />
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Does this property have a home loan?</span>
                                             </label>
                                          </div>

                                          {prop.hasHomeLoan && (
                                             <div className="col-span-12 grid grid-cols-12 gap-6 pt-2 animate-in slide-in-from-top-2">
                                                <div className="col-span-12 md:col-span-6">
                                                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Principal Paid</label>
                                                   <div className="relative">
                                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                      <input
                                                         type="number"
                                                         value={prop.principal}
                                                         disabled={isLetOutSaved || isReadOnly}
                                                         onChange={(e) => updateLetOutProperty(prop.id, 'principal', Number(e.target.value))}
                                                         className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                      />
                                                   </div>
                                                </div>
                                                <div className="col-span-12 md:col-span-6">
                                                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest Paid</label>
                                                   <div className="relative">
                                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                      <input
                                                         type="number"
                                                         value={prop.interest}
                                                         disabled={isLetOutSaved || isReadOnly}
                                                         onChange={(e) => updateLetOutProperty(prop.id, 'interest', Number(e.target.value))}
                                                         className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                                      />
                                                   </div>
                                                </div>
                                                <div className="col-span-12 md:col-span-6">
                                                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Lender Name</label>
                                                   <input
                                                      type="text"
                                                      value={prop.lender}
                                                      disabled={isLetOutSaved || isReadOnly}
                                                      onChange={(e) => updateLetOutProperty(prop.id, 'lender', e.target.value)}
                                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 disabled:bg-slate-50"
                                                   />
                                                </div>
                                                <div className="col-span-12 md:col-span-6">
                                                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Lender PAN</label>
                                                   <input
                                                      type="text"
                                                      value={prop.lenderPan}
                                                      disabled={isLetOutSaved || isReadOnly}
                                                      onChange={(e) => updateLetOutProperty(prop.id, 'lenderPan', e.target.value)}
                                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 uppercase disabled:bg-slate-50"
                                                   />
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 ))}

                                 {!isLetOutSaved && !isReadOnly && (
                                    <button
                                       onClick={() => setLetOutProperties([...letOutProperties, { id: Date.now(), annualRent: 0, municipalTaxes: 0, hasHomeLoan: false, principal: 0, interest: 0, lender: '', lenderPan: '' }])}
                                       className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1"
                                    >
                                       <Plus size={16} className="bg-blue-100 rounded-full p-0.5" /> Add Let Out Property
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
                                 <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Any Other Income (Interest, etc.)</label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={otherIncomeDetails.otherSourceIncome}
                                             disabled={isOtherIncomeSaved || isReadOnly}
                                             onChange={(e) => setOtherIncomeDetails({ ...otherIncomeDetails, otherSourceIncome: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest from Savings Account</label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={otherIncomeDetails.savingsInterest}
                                             disabled={isOtherIncomeSaved || isReadOnly}
                                             onChange={(e) => setOtherIncomeDetails({ ...otherIncomeDetails, savingsInterest: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                       <p className="text-[10px] text-slate-400 mt-1 italic">Deduction up to ₹10,000 under 80TTA applied in Old Regime only</p>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest from Fixed Deposits (FDs)</label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={otherIncomeDetails.fdInterest}
                                             disabled={isOtherIncomeSaved || isReadOnly}
                                             onChange={(e) => setOtherIncomeDetails({ ...otherIncomeDetails, fdInterest: Number(e.target.value) })}
                                             className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 text-right disabled:bg-slate-50"
                                          />
                                       </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Interest from NSC</label>
                                       <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                          <input
                                             type="number"
                                             value={otherIncomeDetails.nscInterest}
                                             disabled={isOtherIncomeSaved || isReadOnly}
                                             onChange={(e) => setOtherIncomeDetails({ ...otherIncomeDetails, nscInterest: Number(e.target.value) })}
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
                     return (
                        <div key={section.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
                           {/* Section Header */}
                           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center group cursor-pointer" onClick={() => !isReadOnly && addNewRow(section.code)}>
                              <div>
                                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{section.name}</h3>
                                 <p className="text-[10px] text-slate-400 font-bold mt-0.5">{section.description}</p>
                              </div>
                              {!isReadOnly && (
                                 <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                    <Plus size={16} />
                                 </button>
                              )}
                           </div>

                           {/* Section Rows */}
                           <div className="divide-y divide-slate-100">
                              {declarations.filter(d => d.section === section.code).map((row) => (
                                 <div key={row.id} className="p-6 space-y-4 animate-in slide-in-from-left-2">
                                    <div className="flex flex-col md:flex-row gap-4">
                                       <div className="flex-1">
                                          {['80C', '80D', 'OTHERS'].includes(section.code) ? (
                                             <select
                                                value={row.title}
                                                disabled={isReadOnly}
                                                onChange={(e) => setDeclarations(declarations.map(d => d.id === row.id ? { ...d, title: e.target.value } : d))}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all disabled:opacity-70 appearance-none bg-[url('data:image/svg%2Bxml%3Bcharset%3DUS-ASCII,%3Csvg%2520xmlns%3D%2522http%3A%252F%252Fwww.w3.org%252F2000%252Fsvg%2522%2520width%3D%2522292.4%2522%2520height%3D%2522292.4%2522%3E%253Cpath%2520fill%3D%2522%252364748b%2522%2520d%3D%2522M287%252069.4a17.6%252017.6%25200%25200%25200-13-5.4H18.4c-5%25200-9.3%25201.8-12.9%25205.4A17.6%252017.6%25200%25200%25200%25200%252082.2c0%25205%25201.8%25209.3%25205.4%252012.9l128%2520127.9c3.6%25203.6%25207.8%25205.4%252012.8%25205.4s9.2-1.8%252012.8-5.4L287%252095c3.5-3.5%25205.4-7.8%25205.4-12.8%25200-5-1.9-9.2-5.5-12.8z%2522%252F%3E%253C%252Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
                                             >
                                                <option value="">Select Investment Type</option>
                                                {(section.code === '80C' ? SECTION_80C_OPTIONS :
                                                   section.code === '80D' ? SECTION_80D_OPTIONS :
                                                      SECTION_OTHERS_OPTIONS).map(opt => (
                                                         <option key={opt} value={opt}>{opt}</option>
                                                      ))}
                                             </select>
                                          ) : (
                                             <input
                                                type="text"
                                                placeholder="Investment Description (e.g. LIC Policy #123)"
                                                value={row.title}
                                                disabled={isReadOnly}
                                                onChange={(e) => setDeclarations(declarations.map(d => d.id === row.id ? { ...d, title: e.target.value } : d))}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all disabled:opacity-70"
                                             />
                                          )}
                                       </div>
                                       <div className="w-full md:w-48">
                                          <div className="relative">
                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                                             <input
                                                type="number"
                                                placeholder="0"
                                                value={row.amount || ''}
                                                disabled={isReadOnly}
                                                onChange={(e) => handleAmountChange(row.id, e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all text-right disabled:opacity-70"
                                             />
                                          </div>
                                          {getLimitWarning(row.title, row.amount) && (
                                             <p className="text-[10px] text-rose-500 font-bold mt-1 text-right">{getLimitWarning(row.title, row.amount)}</p>
                                          )}
                                       </div>
                                       {!isReadOnly && (
                                          <button onClick={() => handleDeleteRow(row.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group">
                                             <Trash2 size={18} />
                                          </button>
                                       )}
                                    </div>

                                    {/* Proof Uploads Area */}
                                    <div className="bg-slate-50/50 rounded-xl p-4 border border-dashed border-slate-200">
                                       <div className="flex flex-wrap gap-2 items-center">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">Proofs:</span>
                                          {row.files.map((file, fIdx) => (
                                             <div key={fIdx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 group shadow-sm animate-in zoom-in-95">
                                                <Paperclip size={12} className="text-blue-500" />
                                                <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">{file}</span>
                                                {!isReadOnly && (
                                                   <button onClick={() => deleteFile(row.id, file)} className="text-slate-300 hover:text-rose-500">
                                                      <X size={12} />
                                                   </button>
                                                )}
                                             </div>
                                          ))}

                                          {!isReadOnly && (
                                             <button
                                                onClick={() => {
                                                   setActiveUploadId(row.id);
                                                   fileInputRef.current?.click();
                                                }}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-blue-100"
                                             >
                                                <CloudUpload size={14} /> Upload Proof
                                             </button>
                                          )}

                                          {row.files.length === 0 && isReadOnly && (
                                             <span className="text-xs text-slate-400 italic">No proofs uploaded</span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              ))}

                              {declarations.filter(d => d.section === section.code).length === 0 && (
                                 <div className="px-6 py-10 text-center">
                                    <p className="text-sm text-slate-400 font-medium">No items declared in this section</p>
                                    {!isReadOnly && (
                                       <button
                                          onClick={() => addNewRow(section.code)}
                                          className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                                       >
                                          + Add First Investment
                                       </button>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  }
               })}

               {/* Action Buttons */}
               <div className="pt-8 flex flex-col items-center gap-6">
                  {isReadOnly ? (
                     <div className="flex flex-col items-center gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl flex items-center gap-3">
                           <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-500/20">
                              <Check size={24} />
                           </div>
                           <div>
                              <h4 className="font-bold text-emerald-800">Declarations Submitted Successfully</h4>
                              <p className="text-xs text-emerald-600">Your tax planning for FY 2025-26 is now locked and under review.</p>
                           </div>
                        </div>
                        <button
                           onClick={() => setView('DASHBOARD')}
                           className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 transition-colors"
                        >
                           <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                     </div>
                  ) : (
                     <>
                        <div className="flex items-center gap-4">
                           <button
                              onClick={onDraft}
                              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold transition-all shadow-sm"
                           >
                              Save as Draft
                           </button>
                           <button
                              onClick={onSubmitClick}
                              className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                           >
                              <Send size={18} /> Submit Declarations
                           </button>
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                           <Shield size={14} /> All data is securely encrypted and stored as per company policy
                        </p>
                     </>
                  )}
               </div>
            </div>
         )}

         {/* Confirmation Modal */}
         {showConfirmModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
               <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                  <div className="p-8">
                     <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                        <Send size={32} />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-3">Submit Declarations?</h3>
                     <p className="text-slate-500 leading-relaxed mb-8">
                        You are about to submit your tax declarations for <strong>FY 2025-26</strong> using the <strong>{planningRegime} Regime</strong>.
                        Ensure all details and proofs are accurate. You can edit this until the deadline (31 Mar 2026).
                     </p>

                     <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                        <div className="flex justify-between items-center mb-3 text-sm">
                           <span className="text-slate-500 font-medium">Selected Regime</span>
                           <span className="font-bold text-slate-900">{planningRegime} Regime</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500 font-medium">Projected Tax Liability</span>
                           <span className="text-lg font-black text-blue-600">₹ {(planningRegime === 'OLD' ? taxCalc.oldRegimeTax : taxCalc.newRegimeTax).toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <button
                           onClick={() => setShowConfirmModal(false)}
                           className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-colors"
                        >
                           Not yet
                        </button>
                        <button
                           onClick={onConfirmSubmit}
                           disabled={isSubmitting}
                           className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                        >
                           {isSubmitting ? (
                              <>
                                 <Loader2 size={20} className="animate-spin" /> Submitting...
                              </>
                           ) : (
                              'Yes, Submit'
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default TaxPlanning;
