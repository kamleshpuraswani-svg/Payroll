
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Save,
  GripVertical,
  X,
  AlertTriangle,
  Info,
  ChevronDown,
  Check
} from 'lucide-react';

// --- Types ---

interface SalaryComponent {
  id: string;
  name: string;
  calculation: string;
  type: 'Fixed' | 'Variable';
  taxStatus: 'Taxable' | 'Exempt' | 'Tax Deductible';
}

interface Structure {
  id: string;
  name: string;
  description: string;
  departments: string[];
  designations: string[];
  employees?: string[];
  employeeCount: number;
  status: 'Active' | 'Draft' | 'Archived' | 'Inactive';
  lastModified: string;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  benefits: SalaryComponent[];
  reimbursements: SalaryComponent[];
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  isDanger?: boolean;
}

interface SalaryStructureProps {
  embedded?: boolean;
  initialView?: 'LIST' | 'VIEW' | 'EDITOR';
  onBack?: () => void;
}

// --- Mock Options ---

const DEPARTMENTS = ['Software Engineering', 'Sales', 'Product', 'Finance', 'QA', 'Engineering', 'Marketing', 'Operations'];
const DESIGNATIONS = ['Senior Engineer', 'Sales Manager', 'Product Analyst', 'DevOps Engineer', 'Finance Associate', 'QA Lead', 'Designer', 'HR Manager'];
const EMPLOYEES_LIST = ['Priya Sharma (TF00912)', 'Arjun Mehta (AC04567)', 'Neha Kapoor (SU00234)', 'Rohan Desai (GL07890)', 'Vikram Singh (AC03987)', 'Ananya Patel (TF01145)', 'Amit Patel (TF02211)', 'Simran Kaur (GL09988)'];

// --- Mock Data ---

const MASTER_COMPONENTS: Record<string, SalaryComponent[]> = {
    earnings: [
        { id: 'm1', name: 'Basic Salary', calculation: '50% of CTC', type: 'Fixed', taxStatus: 'Taxable' },
        { id: 'm2', name: 'House Rent Allowance', calculation: '50% of Basic', type: 'Fixed', taxStatus: 'Exempt' },
        { id: 'm3', name: 'Special Allowance', calculation: 'Balancing Figure', type: 'Fixed', taxStatus: 'Taxable' },
        { id: 'm4', name: 'Conveyance Allowance', calculation: 'Fixed ₹1600', type: 'Fixed', taxStatus: 'Exempt' },
        { id: 'm5', name: 'Medical Allowance', calculation: 'Fixed ₹1250', type: 'Fixed', taxStatus: 'Exempt' },
        { id: 'm6', name: 'Leave Travel Allowance', calculation: 'Fixed', type: 'Fixed', taxStatus: 'Exempt' },
    ],
    deductions: [
        { id: 'd1', name: 'PF (Employee)', calculation: '12% of Basic', type: 'Variable', taxStatus: 'Tax Deductible' },
        { id: 'd2', name: 'Professional Tax', calculation: 'Slab Based', type: 'Variable', taxStatus: 'Tax Deductible' },
        { id: 'd3', name: 'Income Tax (TDS)', calculation: 'As per Tax Regime', type: 'Variable', taxStatus: 'Tax Deductible' },
    ],
    benefits: [
        { id: 'b1', name: 'PF (Employer)', calculation: '12% of Basic', type: 'Fixed', taxStatus: 'Exempt' },
        { id: 'b2', name: 'Gratuity', calculation: '4.81% of Basic', type: 'Fixed', taxStatus: 'Exempt' },
        { id: 'b3', name: 'Health Insurance', calculation: 'Fixed Premium', type: 'Fixed', taxStatus: 'Exempt' },
    ],
    reimbursements: [
        { id: 'r1', name: 'Fuel & Driver', calculation: 'On Actuals', type: 'Variable', taxStatus: 'Exempt' },
        { id: 'r2', name: 'Telephone / Internet', calculation: 'On Actuals', type: 'Variable', taxStatus: 'Exempt' },
        { id: 'r3', name: 'Books & Periodicals', calculation: 'On Actuals', type: 'Variable', taxStatus: 'Exempt' },
    ]
};

const MOCK_STRUCTURES: Structure[] = [
  { 
      id: '1', 
      name: 'Standard IT Structure 2025', 
      description: 'Regular structure for FT employees', 
      departments: ['Software Engineering', 'QA'],
      designations: ['Senior Engineer', 'DevOps Engineer', 'QA Lead'],
      employees: [],
      employeeCount: 1240, 
      status: 'Active', 
      lastModified: '2 days ago',
      earnings: [MASTER_COMPONENTS.earnings[0], MASTER_COMPONENTS.earnings[1], MASTER_COMPONENTS.earnings[2]],
      deductions: [MASTER_COMPONENTS.deductions[0], MASTER_COMPONENTS.deductions[1]],
      benefits: [MASTER_COMPONENTS.benefits[0]],
      reimbursements: []
  },
  { 
      id: '2', 
      name: 'Internship Stipend', 
      description: 'Fixed stipend for interns', 
      departments: ['Software Engineering', 'Product'],
      designations: ['Senior Engineer'],
      employees: [],
      employeeCount: 45, 
      status: 'Active', 
      lastModified: '1 week ago',
      earnings: [{ id: 'm99', name: 'Stipend', calculation: 'Fixed', type: 'Fixed', taxStatus: 'Taxable' }],
      deductions: [],
      benefits: [],
      reimbursements: []
  },
];

// --- Helper Components ---

const InfoTip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1.5 cursor-help align-middle">
      <Info size={14} className="text-slate-400 hover:text-purple-600 transition-colors" />
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-[100] text-center leading-relaxed normal-case font-normal">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
);

const MultiSelect: React.FC<{
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    disabled?: boolean;
    info?: string;
}> = ({ label, options, selected, onChange, disabled, info }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (opt: string) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(i => i !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    return (
        <div className="flex-1 min-w-[200px]" ref={containerRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                {label}
                {info && <InfoTip text={info} />}
            </label>
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-2 border rounded-lg text-sm flex justify-between items-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${disabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-purple-300'}`}
                >
                    <span className={`truncate pr-4 ${selected.length > 0 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {selected.length > 0 ? selected.join(', ') : `Select ${label}...`}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="max-h-60 overflow-y-auto p-1">
                            {options.map(opt => (
                                <div
                                    key={opt}
                                    onClick={() => toggleOption(opt)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${selected.includes(opt) ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.includes(opt) ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300'}`}>
                                        {selected.includes(opt) && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Components ---

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-slate-200" style={{ borderColor: isDanger ? '#e11d48' : '#f59e0b' }}>
        <div className="p-6 text-center">
           <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
              <AlertTriangle size={28} />
           </div>
           <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
           <div className="text-sm text-slate-500 mb-6">
             {message}
           </div>
           
           <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                 Cancel
              </button>
              <button 
                onClick={onConfirm} 
                className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium shadow-sm transition-colors ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                 {confirmLabel}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

interface AddComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: 'earnings' | 'deductions' | 'benefits' | 'reimbursements';
    onAdd: (components: SalaryComponent[]) => void;
    existingIds: string[];
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({ isOpen, onClose, category, onAdd, existingIds }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const availableComponents = MASTER_COMPONENTS[category].filter(c => !existingIds.includes(c.id));
    const filteredComponents = availableComponents.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    };

    const handleAdd = () => {
        const componentsToAdd = availableComponents.filter(c => selectedIds.includes(c.id));
        onAdd(componentsToAdd);
        onClose();
        setSelectedIds([]);
        setSearchTerm('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 capitalize">Add {category} Component</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search components..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" 
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredComponents.length > 0 ? filteredComponents.map(comp => (
                        <label key={comp.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                            <input 
                                type="checkbox" 
                                checked={selectedIds.includes(comp.id)}
                                onChange={() => toggleSelection(comp.id)}
                                className="rounded text-purple-600 focus:ring-purple-500" 
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-sm text-slate-800">{comp.name}</div>
                                <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                                    <span>{comp.calculation}</span> • <span>{comp.type}</span>
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{comp.taxStatus}</span>
                        </label>
                    )) : (
                        <p className="text-center text-slate-400 text-sm py-4">No components found.</p>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg text-sm font-medium transition-colors">Cancel</button>
                    <button onClick={handleAdd} disabled={selectedIds.length === 0} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        Add Selected ({selectedIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const HRSalaryStructure: React.FC<SalaryStructureProps> = ({ embedded, initialView = 'LIST', onBack }) => {
  const [view, setView] = useState<'LIST' | 'VIEW' | 'EDITOR'>(initialView);
  
  // Persist structures in localStorage
  const [structures, setStructures] = useState<Structure[]>(() => {
    const saved = localStorage.getItem('collab_salary_structures');
    return saved ? JSON.parse(saved) : MOCK_STRUCTURES;
  });

  // Save changes to localStorage whenever structures change
  useEffect(() => {
    localStorage.setItem('collab_salary_structures', JSON.stringify(structures));
  }, [structures]);

  const [activeStructureId, setActiveStructureId] = useState<string | null>(null);

  // Editor State
  const [structureName, setStructureName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [earnings, setEarnings] = useState<SalaryComponent[]>([]);
  const [deductions, setDeductions] = useState<SalaryComponent[]>([]);
  const [benefits, setBenefits] = useState<SalaryComponent[]>([]);
  const [reimbursements, setReimbursements] = useState<SalaryComponent[]>([]);
  const [errors, setErrors] = useState<{name?: string, earnings?: string, deductions?: string}>({});

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<'earnings' | 'deductions' | 'benefits' | 'reimbursements'>('earnings');
  
  // Delete State (unused in list now but kept for editor if needed)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const openAddModal = (category: typeof addModalCategory) => {
      setAddModalCategory(category);
      setIsAddModalOpen(true);
  };

  const handleCreateClick = () => {
    setActiveStructureId(null);
    setStructureName('');
    setDescription('');
    setSelectedDepartments([]);
    setSelectedDesignations([]);
    setSelectedEmployees([]);
    setEarnings([]);
    setDeductions([]);
    setBenefits([]);
    setReimbursements([]);
    setErrors({});
    setView('EDITOR');
  };

  const handleViewClick = (structure: Structure) => {
    setActiveStructureId(structure.id);
    setStructureName(structure.name);
    setDescription(structure.description);
    setSelectedDepartments(structure.departments || []);
    setSelectedDesignations(structure.designations || []);
    setSelectedEmployees(structure.employees || []);
    setEarnings(structure.earnings);
    setDeductions(structure.deductions);
    setBenefits(structure.benefits);
    setReimbursements(structure.reimbursements);
    setErrors({});
    setView('VIEW');
  };

  const handleEditMode = () => {
      setView('EDITOR');
  };

  const handleBack = () => {
    if (onBack) {
        onBack();
    } else {
        setView('LIST');
        setActiveStructureId(null);
    }
  };

  const removeComponent = (id: string, list: SalaryComponent[], setList: React.Dispatch<React.SetStateAction<SalaryComponent[]>>) => {
      setList(list.filter(c => c.id !== id));
  };

  const handleAddComponents = (newComponents: SalaryComponent[]) => {
      if (addModalCategory === 'earnings') setEarnings(prev => [...prev, ...newComponents]);
      if (addModalCategory === 'deductions') setDeductions(prev => [...prev, ...newComponents]);
      if (addModalCategory === 'benefits') setBenefits(prev => [...prev, ...newComponents]);
      if (addModalCategory === 'reimbursements') setReimbursements(prev => [...prev, ...newComponents]);
  };

  const handleSaveStructure = (status: 'Active' | 'Draft') => {
      // Validation
      const newErrors: any = {};
      if (!structureName.trim()) newErrors.name = 'Structure Name is required';
      if (earnings.length === 0) newErrors.earnings = 'At least one earning component is required';
      if (deductions.length === 0) newErrors.deductions = 'At least one deduction component is required';

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
      }

      const newStructure: Structure = {
          id: activeStructureId || Date.now().toString(),
          name: structureName,
          description,
          departments: selectedDepartments,
          designations: selectedDesignations,
          employees: selectedEmployees,
          employeeCount: activeStructureId ? (structures.find(s => s.id === activeStructureId)?.employeeCount || 0) : 0,
          status: status,
          lastModified: 'Just now',
          earnings,
          deductions,
          benefits,
          reimbursements
      };

      if (activeStructureId) {
          setStructures(prev => prev.map(s => s.id === activeStructureId ? newStructure : s));
      } else {
          setStructures(prev => [...prev, newStructure]);
      }
      
      if (onBack) {
          onBack();
      } else {
          setView('LIST');
      }
  };

  const toggleStructureStatus = (id: string) => {
    setStructures(prev => prev.map(s => {
        if (s.id === id) {
            return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' };
        }
        return s;
    }));
  };

  const infoMessage = "If no department and designation selected, it will assigned to all employees.";

  // Helper Wrapper for embedded scrolling
  const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (embedded) {
      return (
        <div className="h-full overflow-y-auto">
          <div className="p-6 w-full space-y-6 animate-in fade-in duration-300 pb-20">
            {children}
          </div>
        </div>
      );
    }
    return (
      <div className="h-full overflow-y-auto">
         <div className="p-4 lg:p-8 w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
            {children}
         </div>
      </div>
    );
  };

  // --- Render Editor / View ---
  if (view === 'EDITOR' || view === 'VIEW') {
    const isReadOnly = view === 'VIEW';
    const currentStructure = activeStructureId ? structures.find(s => s.id === activeStructureId) : null;
    const isDraft = currentStructure?.status === 'Draft';
    
    const publishLabel = isDraft || !activeStructureId ? 'Submit' : 'Update';

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <span>Salary Structures</span>
                            <span>/</span>
                            <span>{activeStructureId ? (isReadOnly ? 'View' : 'Edit') : 'Create'}</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">
                            {activeStructureId 
                                ? (isReadOnly ? structureName : `Edit Default Salary Structure | ${structureName}`) 
                                : 'Create Salary Structure'}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleBack} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
                        {isReadOnly ? 'Back' : 'Cancel'}
                    </button>
                    {!isReadOnly ? (
                        <>
                            <button onClick={() => handleSaveStructure('Draft')} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
                                Save as Draft
                            </button>
                            <button onClick={() => handleSaveStructure('Active')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors flex items-center gap-2">
                                <Save size={16} /> {publishLabel}
                            </button>
                        </>
                    ) : (
                         <button onClick={handleEditMode} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors flex items-center gap-2">
                             <Edit2 size={16} /> Edit Structure
                         </button>
                    )}
                </div>
            </div>

            {/* Main Form Area */}
            <div className="grid grid-cols-1 gap-8">
                {/* Left Column: Builder */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Structure Name <span className="text-rose-500">*</span></label>
                                {isReadOnly ? (
                                    <div className="text-sm font-semibold text-slate-800 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{structureName}</div>
                                ) : (
                                    <>
                                        <input 
                                            type="text" 
                                            value={structureName} 
                                            onChange={e => setStructureName(e.target.value)} 
                                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${errors.name ? 'border-rose-500' : 'border-slate-200'}`}
                                            placeholder="e.g. Standard IT Structure 2025"
                                        />
                                        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                                    </>
                                )}
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <MultiSelect 
                                    label="Department" 
                                    options={DEPARTMENTS} 
                                    selected={selectedDepartments} 
                                    onChange={setSelectedDepartments}
                                    disabled={isReadOnly}
                                    info={infoMessage}
                                />
                                <MultiSelect 
                                    label="Designation" 
                                    options={DESIGNATIONS} 
                                    selected={selectedDesignations} 
                                    onChange={setSelectedDesignations}
                                    disabled={isReadOnly}
                                    info={infoMessage}
                                />
                                <MultiSelect 
                                    label="Employees" 
                                    options={EMPLOYEES_LIST} 
                                    selected={selectedEmployees} 
                                    onChange={setSelectedEmployees}
                                    disabled={isReadOnly}
                                    info="Assign specific employees directly."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                            {isReadOnly ? (
                                <div className="text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{description || '-'}</div>
                            ) : (
                                <textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    rows={2}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                                    placeholder="Brief description of this salary structure..."
                                />
                            )}
                        </div>
                    </div>

                    {/* Earnings Section */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                            <h3 className="font-bold text-emerald-800 text-sm">1. Earnings</h3>
                            {errors.earnings && <span className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.earnings}</span>}
                        </div>
                        <div className="p-4 space-y-2">
                            {earnings.map((comp, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm group">
                                    {!isReadOnly && <GripVertical size={16} className="text-slate-300 cursor-move" />}
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-slate-800">{comp.name}</div>
                                        <div className="text-xs text-slate-500">{comp.calculation}</div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{comp.type}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${comp.taxStatus === 'Taxable' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>{comp.taxStatus}</span>
                                    {!isReadOnly && (
                                        <button onClick={() => removeComponent(comp.id, earnings, setEarnings)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <button onClick={() => openAddModal('earnings')} className="w-full py-2 border-2 border-dashed border-emerald-100 rounded-lg text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={16} /> Add Earning Component
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="px-6 py-3 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
                            <h3 className="font-bold text-rose-800 text-sm">2. Deductions</h3>
                             {errors.deductions && <span className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.deductions}</span>}
                        </div>
                        <div className="p-4 space-y-2">
                            {deductions.map((comp, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm group">
                                    {!isReadOnly && <GripVertical size={16} className="text-slate-300 cursor-move" />}
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-slate-800">{comp.name}</div>
                                        <div className="text-xs text-slate-500">{comp.calculation}</div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{comp.type}</span>
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{comp.taxStatus}</span>
                                    {!isReadOnly && (
                                        <button onClick={() => removeComponent(comp.id, deductions, setDeductions)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <button onClick={() => openAddModal('deductions')} className="w-full py-2 border-2 border-dashed border-rose-100 rounded-lg text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={16} /> Add Deduction Component
                                </button>
                            )}
                        </div>
                    </div>

                     {/* Benefits Section */}
                     <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="px-6 py-3 bg-sky-50 border-b border-sky-100">
                            <h3 className="font-bold text-sky-800 text-sm">3. Benefits (Employer Contribution)</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {benefits.map((comp, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm group">
                                    {!isReadOnly && <GripVertical size={16} className="text-slate-300 cursor-move" />}
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-slate-800">{comp.name}</div>
                                        <div className="text-xs text-slate-500">{comp.calculation}</div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{comp.type}</span>
                                    {!isReadOnly && (
                                        <button onClick={() => removeComponent(comp.id, benefits, setBenefits)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <button onClick={() => openAddModal('benefits')} className="w-full py-2 border-2 border-dashed border-sky-100 rounded-lg text-sky-600 text-sm font-medium hover:bg-sky-50 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={16} /> Add Benefit Component
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reimbursements Section */}
                     <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                            <h3 className="font-bold text-amber-800 text-sm">4. Reimbursements</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {reimbursements.map((comp, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm group">
                                    {!isReadOnly && <GripVertical size={16} className="text-slate-300 cursor-move" />}
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-slate-800">{comp.name}</div>
                                        <div className="text-xs text-slate-500">{comp.calculation}</div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{comp.type}</span>
                                    {!isReadOnly && (
                                        <button onClick={() => removeComponent(comp.id, reimbursements, setReimbursements)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <button onClick={() => openAddModal('reimbursements')} className="w-full py-2 border-2 border-dashed border-amber-100 rounded-lg text-amber-600 text-sm font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={16} /> Add Reimbursement Component
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddComponentModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                category={addModalCategory}
                onAdd={handleAddComponents}
                existingIds={[...earnings, ...deductions, ...benefits, ...reimbursements].map(c => c.id)}
            />
        </ContentWrapper>
    );
  }

  // --- Render List View ---
  return (
    <ContentWrapper>
        {/* Header */}
        {!embedded && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    Salary Structures
                </h1>
                <p className="text-slate-500 mt-1">Define salary templates to assign to employees.</p>
                </div>
            </div>
        )}

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="w-full sm:w-auto flex items-center gap-3">
              <button onClick={handleCreateClick} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm transition-colors flex items-center gap-2">
                 <Plus size={18} /> Create Salary Structure
              </button>
           </div>
           <div className="w-full sm:w-auto flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input type="text" placeholder="Search structures..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
              </div>
              <div className="relative">
                 <select className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Draft</option>
                 </select>
                 <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
           </div>
        </div>

        {/* List Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Structure Name</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Designation</th>
                        <th className="px-6 py-4">Employees</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Last Modified</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {structures.map((item) => {
                        const isArchived = item.status === 'Archived';
                        
                        return (
                            <tr key={item.id} className={`hover:bg-slate-50 transition-colors group ${isArchived ? 'opacity-60 bg-slate-50' : ''}`}>
                                <td className="px-6 py-4 font-semibold text-slate-800">{item.name}</td>
                                <td className="px-6 py-4 text-slate-500 truncate max-w-[180px]">
                                    {item.departments && item.departments.length > 0 ? item.departments.join(', ') : 'All'}
                                </td>
                                <td className="px-6 py-4 text-slate-500 truncate max-w-[180px]">
                                    {item.designations && item.designations.length > 0 ? item.designations.join(', ') : 'All'}
                                </td>
                                <td className="px-6 py-4">{item.employeeCount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                        item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                        item.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                        {item.status === 'Active' ? <CheckCircle size={12} /> : item.status === 'Draft' ? <AlertCircle size={12} /> : <X size={12}/>}
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">{item.lastModified}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-4">
                                        <button 
                                          onClick={() => toggleStructureStatus(item.id)}
                                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${item.status === 'Active' ? 'bg-purple-600' : 'bg-slate-300'}`}
                                          title={item.status === 'Active' ? "Deactivate" : "Activate"}
                                        >
                                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleViewClick(item); handleEditMode(); }} 
                                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors" 
                                          title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </ContentWrapper>
  );
};

export default HRSalaryStructure;
