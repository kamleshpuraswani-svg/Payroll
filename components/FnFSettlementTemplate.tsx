import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Eye,
    Trash2,
    Save,
    X,
    Settings,
    CheckCircle,
    AlertCircle,
    FileText,
    ChevronLeft,
    Image as ImageIcon,
    Check,
    Briefcase,
    Calculator,
    Search,
    Users,
    ChevronDown,
    Info,
    Building2
} from 'lucide-react';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];
import { supabase } from '../services/supabaseClient';

// --- Types ---

interface ComponentItem {
    id: string;
    name: string;
    amount: string;
    type: 'Fixed' | 'Variable' | 'Calculated';
}

interface FnFTemplateSettings {
    currency: string;
    dateFormat: string;
    showGratuityBreakdown: boolean;
    showYTD: boolean;
    includeForm16: boolean;
    passwordProtect: boolean;
    decimalPlaces?: string;
    salaryStructure?: string;
}

interface FnFHeaderConfig {
    logoPosition: 'Left' | 'Center' | 'Right';
    showLogo: boolean;
    showCompanyName: boolean;
    showCompanyAddress: boolean;
    documentTitle: string;
    employeeFields: {
        name: boolean;
        department: boolean;
        id: boolean;
        designation: boolean;
        doj: boolean;
        dor: boolean; // Date of Relieving
        pan: boolean;
        uan: boolean;
    };
}

interface FnFTemplate {
    id: string;
    name: string;
    status: 'Published' | 'Draft';
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    sections: {
        earnings: ComponentItem[];
        deductions: ComponentItem[];
    };
    settings: FnFTemplateSettings;
    headerConfig: FnFHeaderConfig;
}

// --- Mock Data ---

const MOCK_FNF_TEMPLATES: FnFTemplate[] = [
    {
        id: '1',
        name: 'Standard F&F Settlement',
        status: 'Published',
        createdBy: 'Super Admin',
        lastUpdatedBy: '03 Dec 2025',
        isActive: true,
        headerConfig: {
            logoPosition: 'Left',
            showLogo: true,
            showCompanyName: true,
            showCompanyAddress: true,
            documentTitle: 'Full and Final Settlement Statement',
            employeeFields: { name: true, department: true, id: true, designation: true, doj: true, dor: true, pan: true, uan: true }
        },
        sections: {
            earnings: [
                { id: 'e1', name: 'Last Month Salary', amount: '45,000', type: 'Variable' },
                { id: 'e2', name: 'Pending Salary (Prorated)', amount: '12,500', type: 'Calculated' },
                { id: 'e3', name: 'Leave Encashment', amount: '42,000', type: 'Calculated' },
                { id: 'e4', name: 'Gratuity', amount: '68,400', type: 'Calculated' },
                { id: 'e5', name: 'Performance Bonus', amount: '25,000', type: 'Variable' },
            ],
            deductions: [
                { id: 'd1', name: 'Provident Fund (Final)', amount: '3,600', type: 'Variable' },
                { id: 'd2', name: 'Income Tax (TDS)', amount: '4,200', type: 'Variable' },
                { id: 'd3', name: 'Notice Pay Recovery', amount: '0', type: 'Variable' },
                { id: 'd4', name: 'Laptop Damage Recovery', amount: '380', type: 'Fixed' },
            ]
        },
        settings: {
            currency: 'INR',
            dateFormat: 'DD MMM YYYY',
            showGratuityBreakdown: true,
            showYTD: false,
            includeForm16: true,
            passwordProtect: true,
            decimalPlaces: '2'
        }
    }
];

// --- Sub-Components ---

const LeaveEncashmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedComponents: string[];
    onToggleComponent: (comp: string) => void;
}> = ({ isOpen, onClose, selectedComponents, onToggleComponent }) => {
    if (!isOpen) return null;

    const options = ["Basic Salary", "Dearness Allowance (DA)", "HRA", "Special Allowance"];

    const getFormulaDisplay = () => {
        const active = options.filter(opt => selectedComponents.includes(opt));
        if (active.length === 0) return "(None Selected) / Divisor";
        const labels = active.map(a => a.replace(" Salary", "").replace(" Allowance", ""));
        return `(${labels.join(" + ")}) / Divisor`;
    };

    return (
        <div className="fixed inset-0 z-[150] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-[-20px_0_50px_-15px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-200">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-br from-white to-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Leave Encashment</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Configure components for daily rate calculation</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white hover:shadow-lg hover:border-slate-200 border border-transparent rounded-2xl text-slate-400 hover:text-rose-500 transition-all duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
                    {/* Component Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Users size={16} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-700 tracking-tight">Components for Encashment</h4>
                        </div>

                        <div className="grid gap-3">
                            {options.map(opt => (
                                <label
                                    key={opt}
                                    className={`relative group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${selectedComponents.includes(opt)
                                        ? 'bg-purple-50/30 border-purple-200 shadow-[0_4px_12px_-4px_rgba(147,51,234,0.1)]'
                                        : 'bg-white border-slate-100 hover:border-slate-300/60 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${selectedComponents.includes(opt)
                                        ? 'bg-purple-600 border-purple-600 scale-110 shadow-lg shadow-purple-200'
                                        : 'border-slate-200 bg-white group-hover:border-purple-300'
                                        }`}>
                                        {selectedComponents.includes(opt) && <Check size={14} className="text-white stroke-[4]" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedComponents.includes(opt)}
                                        onChange={() => onToggleComponent(opt)}
                                    />
                                    <div className="flex-1">
                                        <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${selectedComponents.includes(opt) ? 'text-purple-900' : 'text-slate-600'
                                            }`}>
                                            {opt}
                                        </span>
                                    </div>
                                    {selectedComponents.includes(opt) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Formula Preview with Glassmorphism */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative p-6 bg-white border border-indigo-100/50 rounded-3xl space-y-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <Calculator size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Formula Preview</h5>
                                        <p className="text-[10px] text-indigo-500 mt-0.5 font-bold">LIVE CALCULATION LOGIC</p>
                                    </div>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-full text-indigo-400">
                                    <Info size={14} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm group/code overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        Daily Rate Logic
                                    </p>
                                    <div className="font-mono text-[12px] leading-relaxed transition-all duration-300">
                                        <span className="text-slate-500 font-bold">Daily Rate = </span>
                                        <span className="text-indigo-600 font-bold tracking-tight bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{getFormulaDisplay()}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm group/code overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                        Final Payable
                                    </p>
                                    <div className="font-mono text-[12px] leading-relaxed">
                                        <span className="text-purple-600 font-bold">Encashment = </span>
                                        <span className="text-slate-700 font-bold">Daily Rate × </span>
                                        <span className="text-indigo-600 font-bold">Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                        <Save size={18} />
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const FnFHeaderConfigModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    config: FnFHeaderConfig;
    onChange: (cfg: FnFHeaderConfig) => void;
}> = ({ isOpen, onClose, config, onChange }) => {
    if (!isOpen) return null;

    const toggleField = (field: keyof FnFHeaderConfig['employeeFields']) => {
        onChange({
            ...config,
            employeeFields: { ...config.employeeFields, [field]: !config.employeeFields[field] }
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">F&F Header Configuration</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Branding */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Branding</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" checked={config.showLogo} onChange={e => onChange({ ...config, showLogo: e.target.checked })} className="rounded text-purple-600 focus:ring-purple-500" />
                                <span className="text-sm font-medium text-slate-700">Company Logo</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={config.showCompanyName} onChange={e => onChange({ ...config, showCompanyName: e.target.checked })} className="rounded text-purple-600 focus:ring-purple-500" />
                                    <span className="text-sm font-medium text-slate-700">Company Name</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={config.showCompanyAddress} onChange={e => onChange({ ...config, showCompanyAddress: e.target.checked })} className="rounded text-purple-600 focus:ring-purple-500" />
                                    <span className="text-sm font-medium text-slate-700">Address</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">Logo Position</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['Left', 'Center', 'Right'].map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => onChange({ ...config, logoPosition: pos as any })}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${config.logoPosition === pos ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {pos}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Document Title */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Document Title</h4>
                        <input
                            type="text"
                            value={config.documentTitle}
                            onChange={e => onChange({ ...config, documentTitle: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    {/* Employee Fields */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Employee Details</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.name} onChange={() => toggleField('name')} className="rounded text-purple-600 focus:ring-purple-500" /> Employee Name
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.id} onChange={() => toggleField('id')} className="rounded text-purple-600 focus:ring-purple-500" /> Employee ID
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.designation} onChange={() => toggleField('designation')} className="rounded text-purple-600 focus:ring-purple-500" /> Designation
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.department} onChange={() => toggleField('department')} className="rounded text-purple-600 focus:ring-purple-500" /> Department
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.doj} onChange={() => toggleField('doj')} className="rounded text-purple-600 focus:ring-purple-500" /> Date of Joining
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.dor} onChange={() => toggleField('dor')} className="rounded text-purple-600 focus:ring-purple-500" /> DOR (Relieving)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.pan} onChange={() => toggleField('pan')} className="rounded text-purple-600 focus:ring-purple-500" /> PAN Number
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.uan} onChange={() => toggleField('uan')} className="rounded text-purple-600 focus:ring-purple-500" /> UAN
                            </label>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors">Done</button>
                </div>
            </div>
        </div>
    );
};

const AddFnFComponentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    section: 'earnings' | 'deductions' | null;
    onAdd: (items: ComponentItem[]) => void
}> = ({ isOpen, onClose, section, onAdd }) => {
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) setSelected([]);
    }, [isOpen]);

    if (!isOpen || !section) return null;

    const options = {
        earnings: ['Last Month Salary', 'Pending Salary', 'Leave Encashment', 'Gratuity', 'Performance Bonus', 'Notice Period Pay', 'Expense Reimbursement', 'Medical Claim'],
        deductions: ['Notice Pay Recovery', 'Loan Outstanding', 'Salary Advance', 'Laptop Damage', 'ID Card Loss', 'Excess Leave Deduction', 'TDS (Tax)', 'PF (Employee Contribution)']
    };

    const currentOptions = options[section] || [];

    const toggle = (name: string) => {
        setSelected(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
    };

    const handleAdd = () => {
        const newItems: ComponentItem[] = selected.map(name => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name,
            amount: '0',
            type: 'Variable'
        }));
        onAdd(newItems);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col max-h-[80vh]">
                <h3 className="font-bold text-slate-800 mb-4 capitalize">Add F&F {section}</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {currentOptions.map(name => (
                        <div key={name} onClick={() => toggle(name)} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selected.includes(name) ? 'bg-purple-50 border-purple-200' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.includes(name) ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300'}`}>
                                {selected.includes(name) && <Check size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${selected.includes(name) ? 'text-purple-900' : 'text-slate-700'}`}>{name}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button onClick={onClose} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handleAdd} disabled={selected.length === 0} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                        Add Selected ({selected.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

interface FnFSettlementTemplateProps {
    userRole?: string;
}

const FnFSettlementTemplate: React.FC<FnFSettlementTemplateProps> = ({ userRole }) => {
    const [view, setView] = useState<'LIST' | 'EDITOR' | 'VIEW'>('LIST');
    const [activeTab, setActiveTab] = useState<'EDITOR' | 'PREVIEW' | 'CONFIG'>('EDITOR');

    // --- Supabase Persistence ---
    const [templates, setTemplates] = useState<FnFTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');

    const fetchPaygroups = async () => {
        try {
            const { data, error } = await supabase
                .from('paygroups')
                .select('*')
                .order('name');
            if (error) throw error;
            setPaygroups(data || []);
        } catch (err) {
            console.error('Error fetching paygroups:', err);
        }
    };

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const [type, id] = selectedTarget.split(':');
            const { data, error } = await supabase
                .from('document_templates')
                .select('*')
                .eq('type', 'fnf_settlement')
                .eq('target_type', type)
                .eq('target_id', id);

            if (error) throw error;

            if (data && data.length > 0) {
                const formattedTemplates: FnFTemplate[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    status: item.status as 'Published' | 'Draft',
                    isActive: item.is_active,
                    createdBy: item.created_by || 'Admin',
                    lastUpdatedBy: new Date(item.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    sections: item.content.sections,
                    settings: item.settings,
                    headerConfig: item.content.headerConfig
                }));
                setTemplates(formattedTemplates);
            } else {
                setTemplates(MOCK_FNF_TEMPLATES);
            }
        } catch (err) {
            console.error('Error fetching templates:', err);
            setTemplates(MOCK_FNF_TEMPLATES);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
        fetchPaygroups();
    }, [selectedTarget]);

    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    // Leave Encashment State
    const [showLeaveEncashmentModal, setShowLeaveEncashmentModal] = useState(false);
    const [encashmentComponents, setEncashmentComponents] = useState<string[]>(["Basic Salary", "Dearness Allowance (DA)"]);

    // Editor State
    const [templateName, setTemplateName] = useState('');
    const [sections, setSections] = useState<FnFTemplate['sections']>({ earnings: [], deductions: [] });
    const [headerConfig, setHeaderConfig] = useState<FnFHeaderConfig>(MOCK_FNF_TEMPLATES[0].headerConfig);
    const [settings, setSettings] = useState<FnFTemplateSettings>(MOCK_FNF_TEMPLATES[0].settings);

    // Modal States
    const [headerConfigOpen, setHeaderConfigOpen] = useState(false);
    const [addComponentModal, setAddComponentModal] = useState<{ isOpen: boolean; section: 'earnings' | 'deductions' | null }>({ isOpen: false, section: null });
    const [validationError, setValidationError] = useState<string | null>(null);

    // --- Template Mapping Configuration ---
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<string[]>(["Engineering", "Product", "Sales", "HR", "Marketing", "Finance"]);
    const [availableDesignations, setAvailableDesignations] = useState<string[]>(["Software Engineer", "Product Manager", "Designer", "HR Manager", "Sales Lead", "QA Analyst"]);
    const [templateMapping, setTemplateMapping] = useState({
        departments: ["Engineering", "Product"] as string[],
        designations: ["Software Engineer", "Product Manager"] as string[],
        employees: [] as any[]
    });
    const [activeMappingDropdown, setActiveMappingDropdown] = useState<'departments' | 'designations' | 'employees' | null>(null);
    const [mappingSearch, setMappingSearch] = useState('');
    const [isTemplateMappingOpen, setIsTemplateMappingOpen] = useState(true);

    const fetchEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('id, name, eid, avatar_url, department, designation')
                .eq('status', 'Active')
                .order('name');
            if (error) throw error;
            if (data) {
                setAllEmployees(data);

                // Extract unique departments and designations
                const depts = Array.from(new Set(data.map(e => e.department).filter(Boolean))) as string[];
                const desigs = Array.from(new Set(data.map((e: any) => e.designation).filter(Boolean))) as string[];

                if (depts.length > 0) setAvailableDepartments(depts.sort());
                if (desigs.length > 0) setAvailableDesignations(desigs.sort());

                // Prefill dummy employee data if empty
                if (templateMapping.employees.length === 0 && data.length > 0) {
                    setTemplateMapping(prev => ({
                        ...prev,
                        employees: data.slice(0, 2)
                    }));
                }
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'CONFIG') {
            fetchEmployees();
        }
    }, [activeTab]);

    const handleSelectMapping = (type: 'departments' | 'designations' | 'employees', value: any) => {
        setTemplateMapping(prev => {
            const current = (prev[type] as any[]);
            const identifier = type === 'employees' ? value.id : value;
            const exists = current.find(item => (type === 'employees' ? item.id === identifier : item === identifier));

            if (exists) {
                return {
                    ...prev,
                    [type]: current.filter(item => (type === 'employees' ? item.id !== identifier : item !== identifier))
                };
            }
            return {
                ...prev,
                [type]: [...current, value]
            };
        });
    };

    const handleRemoveMapping = (type: 'departments' | 'designations' | 'employees', value: any) => {
        setTemplateMapping(prev => ({
            ...prev,
            [type]: (prev[type] as any[]).filter(item => (type === 'employees' ? item.id !== value : item !== value))
        }));
    };

    const renderMappingSelector = (type: 'departments' | 'designations' | 'employees', label: string) => {
        const selected = templateMapping[type] as any[];
        const isOpen = activeMappingDropdown === type;
        const options = type === 'employees'
            ? allEmployees
            : (type === 'departments' ? availableDepartments : availableDesignations);

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                </div>

                <div className="relative">
                    <div
                        className="min-h-[46px] p-2 bg-white border border-slate-200 rounded-xl flex flex-wrap gap-2 items-center cursor-text focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all"
                        onClick={() => setActiveMappingDropdown(type)}
                    >
                        {selected.map(item => {
                            const isEmployee = type === 'employees';
                            const id = isEmployee ? item.id : item;
                            const name = isEmployee ? item.name : item;
                            return (
                                <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-lg text-xs font-bold text-purple-700 animate-in zoom-in-95 duration-200">
                                    {name}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveMapping(type, id); }}
                                        className="p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            );
                        })}
                        <input
                            type="text"
                            placeholder={selected.length === 0 ? "Select options..." : ""}
                            className="flex-1 min-w-[150px] bg-transparent border-none text-sm font-semibold text-slate-700 focus:outline-none focus:ring-0 p-1"
                            value={isOpen ? mappingSearch : ''}
                            onChange={(e) => setMappingSearch(e.target.value)}
                            onFocus={() => setActiveMappingDropdown(type)}
                        />
                        <div className="flex items-center gap-2 pr-1">
                            {selected.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setTemplateMapping(prev => ({ ...prev, [type]: [] })); }}
                                    className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMappingDropdown(null)}></div>
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="p-3 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder={`Search ${label.toLowerCase()}...`}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all"
                                            value={mappingSearch}
                                            onChange={(e) => setMappingSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    {options
                                        .filter(opt => {
                                            const search = mappingSearch.toLowerCase();
                                            if (type === 'employees') {
                                                return opt.name.toLowerCase().includes(search) || opt.eid.toLowerCase().includes(search);
                                            }
                                            return opt.toLowerCase().includes(search);
                                        })
                                        .map(opt => {
                                            const isEmployee = type === 'employees';
                                            const isSelected = isEmployee
                                                ? selected.find(e => e.id === opt.id)
                                                : selected.includes(opt);
                                            const id = isEmployee ? opt.id : opt;

                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => handleSelectMapping(type, opt)}
                                                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${isSelected ? 'bg-purple-50 text-purple-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                                >
                                                    {isEmployee ? (
                                                        <>
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                                                                {opt.avatar_url ? <img src={opt.avatar_url} alt="" className="w-full h-full object-cover" /> : opt.name.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className="text-sm font-bold truncate tracking-tight">{opt.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{opt.department} • {opt.eid}</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex-1 text-left min-w-0 p-1">
                                                            <p className="text-sm font-bold truncate tracking-tight">{opt}</p>
                                                        </div>
                                                    )}
                                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-200'}`}>
                                                        {isSelected && <Check size={12} className="text-white" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    {options.filter(opt => {
                                        const search = mappingSearch.toLowerCase();
                                        if (type === 'employees') {
                                            return opt.name.toLowerCase().includes(search) || opt.eid.toLowerCase().includes(search);
                                        }
                                        return opt.toLowerCase().includes(search);
                                    }).length === 0 && (
                                            <div className="py-8 text-center bg-slate-50 rounded-2xl m-2 border border-dashed border-slate-200">
                                                <p className="text-sm font-bold text-slate-400">No {label.toLowerCase()} found</p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const handleCreate = () => {
        setEditingTemplateId(null);
        setTemplateName('');
        setSections({ earnings: [], deductions: [] });
        setSettings(MOCK_FNF_TEMPLATES[0].settings);
        setHeaderConfig(MOCK_FNF_TEMPLATES[0].headerConfig);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleEdit = (t: FnFTemplate) => {
        setEditingTemplateId(t.id);
        setTemplateName(t.name);
        setSections(t.sections);
        setSettings(t.settings);
        setHeaderConfig(t.headerConfig);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleView = (t: FnFTemplate) => {
        handleEdit(t);
        setView('VIEW');
    };

    const handleSave = async (status: 'Published' | 'Draft') => {
        if (!templateName.trim()) {
            setValidationError('Template Name is required');
            return;
        }
        if (sections.earnings.length === 0) {
            setValidationError('At least one earning/dues component is required.');
            return;
        }

        const [targetType, targetId] = selectedTarget.split(':');
        const templateData = {
            name: templateName,
            status,
            type: 'fnf_settlement',
            target_type: targetType,
            target_id: targetId,
            content: {
                sections,
                headerConfig
            },
            settings,
            is_active: editingTemplateId ? (templates.find(t => t.id === editingTemplateId)?.isActive ?? true) : true,
            updated_at: new Date().toISOString()
        };

        try {
            if (editingTemplateId) {
                const { error } = await supabase
                    .from('document_templates')
                    .update(templateData)
                    .eq('id', editingTemplateId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('document_templates')
                    .insert([{ ...templateData, created_by: 'Super Admin' }]);
                if (error) throw error;
            }

            await fetchTemplates();
            setView('LIST');
            setValidationError(null);
        } catch (err) {
            console.error('Error saving template:', err);
            setValidationError('Failed to save template to database.');
        }
    };

    const handleToggleActive = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const template = templates.find(t => t.id === id);
        if (!template) return;

        const newActiveState = !template.isActive;
        try {
            const { error } = await supabase
                .from('document_templates')
                .update({ is_active: newActiveState })
                .eq('id', id);
            if (error) throw error;
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: newActiveState } : t));
        } catch (err) {
            console.error('Error toggling active state:', err);
        }
    };

    const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            const { error } = await supabase
                .from('document_templates')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchTemplates();
        } catch (err) {
            console.error('Error deleting template:', err);
        }
    };

    const toggleEncashmentComponent = (comp: string) => {
        setEncashmentComponents(prev =>
            prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
        );
    };

    const addComponent = (items: ComponentItem[]) => {
        if (!addComponentModal.section) return;
        setSections(prev => ({
            ...prev,
            [addComponentModal.section!]: [...prev[addComponentModal.section!], ...items]
        }));
    };

    const removeComponent = (section: keyof typeof sections, id: string) => {
        setSections(prev => ({ ...prev, [section]: prev[section].filter(i => i.id !== id) }));
    };

    const parseAmount = (amt: string) => parseFloat(amt.replace(/,/g, '')) || 0;
    const formatCurrency = (amt: number) => {
        const decimals = parseInt(settings.decimalPlaces || '0', 10);
        return amt.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    // --- RENDER LIST ---
    if (view === 'LIST') {
        return (
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Full & Final Settlement</h2>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <FileText size={12} />
                            Manage and Publish F&F settlement templates
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all appearance-none shadow-sm"
                            >
                                <optgroup label="Business Units">
                                    {BUSINESS_UNITS.map(bu => (
                                        <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                    ))}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Briefcase size={20} /></div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-purple-900">Default Full & Final Settlement Template</h3>
                        <p className="text-xs text-purple-700 mt-1">This is the global default Full & Final Settlement template. All companies will use this for F&F unless they create a custom version.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowLeaveEncashmentModal(true)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all"
                        >
                            <Settings size={16} /> Leave Encashment Settings
                        </button>
                        <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-sm flex items-center gap-2">
                            Create Payslip
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Template Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created By</th>
                                <th className="px-6 py-4">Last Modified By</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Loading templates...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : templates.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No templates found. Create your first one!
                                    </td>
                                </tr>
                            ) : templates.map(t => (
                                <tr key={t.id} onClick={() => handleView(t)} className="hover:bg-slate-50 cursor-pointer group">
                                    <td className="px-6 py-4 font-medium text-slate-800">{t.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${t.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {t.status === 'Published' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">{t.createdBy}</td>
                                    <td className="px-6 py-4">{t.lastUpdatedBy}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-3">
                                            <div
                                                onClick={(e) => handleToggleActive(t.id, e)}
                                                className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${t.isActive ? 'bg-purple-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${t.isActive ? 'translate-x-4' : ''}`} />
                                            </div>
                                            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); handleView(t); }} className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-sky-600 rounded" title="View"><Eye size={16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="p-1.5 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded" title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={(e) => handleDeleteTemplate(t.id, e)} className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-center text-xs text-slate-400 mt-4">
                    1,156 companies are currently using this default F&F template · Last published: 03 Dec 2025
                </div>

                <LeaveEncashmentModal
                    isOpen={showLeaveEncashmentModal}
                    onClose={() => setShowLeaveEncashmentModal(false)}
                    selectedComponents={encashmentComponents}
                    onToggleComponent={toggleEncashmentComponent}
                />
            </div>
        );
    }

    // --- RENDER EDITOR / VIEW ---
    const isReadOnly = view === 'VIEW';

    return (
        <div className="w-full h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-300 bg-slate-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft size={20} /></button>
                    <div>
                        {isReadOnly ? (
                            <h2 className="text-lg font-bold text-slate-800">{templateName}</h2>
                        ) : (
                            <input
                                type="text"
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                placeholder="Enter Template Name"
                                className="text-lg font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none bg-transparent px-1"
                            />
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {isReadOnly ? (
                        <button onClick={() => setView('EDITOR')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2">
                            <Edit2 size={16} /> Edit Template
                        </button>
                    ) : (
                        <>
                            <button onClick={() => setView('LIST')} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                            <button onClick={() => handleSave('Draft')} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Save as Draft</button>
                            <button onClick={() => handleSave('Published')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2" title="Will instantly update F&F template for all companies using default">
                                <Save size={16} /> {userRole === 'HR_MANAGER' ? 'Save' : 'Publish'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-200 bg-white shrink-0">
                <div className="flex gap-6">
                    <button onClick={() => setActiveTab('EDITOR')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'EDITOR' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}>Template Editor</button>
                    <button onClick={() => setActiveTab('PREVIEW')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PREVIEW' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}>Preview</button>
                </div>
            </div>

            {validationError && (
                <div className="bg-rose-50 px-6 py-2 text-xs text-rose-600 font-medium border-b border-rose-100 flex items-center gap-2">
                    <AlertCircle size={14} /> {validationError}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'EDITOR' ? (
                    <>
                        {/* Left: Builder Canvas */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-4xl mx-auto bg-white shadow-sm border border-slate-200 min-h-[800px] flex flex-col relative rounded-xl overflow-hidden">
                                <div className="p-2 bg-slate-50 border-b border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">F&F Settlement Canvas</div>

                                <div className="p-8 space-y-8">
                                    {/* Header Block */}
                                    <div className={`relative border border-slate-100 rounded-xl p-6 transition-all group ${!isReadOnly ? 'hover:border-purple-200 hover:shadow-sm' : ''}`}>
                                        {!isReadOnly && <button onClick={() => setHeaderConfigOpen(true)} className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-slate-200 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-purple-600"><Settings size={14} /></button>}

                                        <div className={`flex justify-between items-start ${headerConfig.logoPosition === 'Right' ? 'flex-row-reverse' : ''} ${headerConfig.logoPosition === 'Center' ? 'flex-col items-center text-center' : ''}`}>
                                            {headerConfig.showLogo && (
                                                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 mb-4 sm:mb-0"><ImageIcon size={24} /></div>
                                            )}
                                            <div className={`${headerConfig.logoPosition === 'Center' ? 'w-full text-center' : headerConfig.logoPosition === 'Left' ? 'text-right' : 'text-left'}`}>
                                                {headerConfig.showCompanyName && <h2 className="font-bold text-lg text-slate-800">Company Name</h2>}
                                                {headerConfig.showCompanyAddress && <p className="text-xs text-slate-500 mt-1">Address Line 1, City - Zipcode</p>}
                                            </div>
                                        </div>
                                        <div className="text-center mt-6 border-b border-slate-100 pb-4 mb-4">
                                            <h3 className="font-bold text-slate-800 underline underline-offset-4">{headerConfig.documentTitle}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                                            {headerConfig.employeeFields.name && <div>Employee Name: <span className="font-semibold text-slate-800">Employee Name</span></div>}
                                            {headerConfig.employeeFields.id && <div>ID: <span className="font-semibold text-slate-800">EMP001</span></div>}
                                            {headerConfig.employeeFields.designation && <div>Designation: <span className="font-semibold text-slate-800">Designation</span></div>}
                                            {headerConfig.employeeFields.department && <div>Department: <span className="font-semibold text-slate-800">Department</span></div>}
                                            {headerConfig.employeeFields.doj && <div>Date of Joining: <span className="font-semibold text-slate-800">DD/MM/YYYY</span></div>}
                                            {headerConfig.employeeFields.dor && <div>DOR (Relieving): <span className="font-semibold text-slate-800">DD/MM/YYYY</span></div>}
                                            {headerConfig.employeeFields.pan && <div>PAN Number: <span className="font-semibold text-slate-800">XXXXX1234X</span></div>}
                                            {headerConfig.employeeFields.uan && <div>UAN: <span className="font-semibold text-slate-800">100900200300</span></div>}
                                        </div>
                                    </div>

                                    {/* Earnings & Deductions Tables */}
                                    <div className="space-y-6">
                                        {/* Earnings */}
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 text-xs font-bold uppercase text-emerald-700">Earnings / Dues</div>
                                            <div className="p-4 space-y-2">
                                                {sections.earnings.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm group border-b border-slate-50 pb-2 last:border-0">
                                                        <span className="text-slate-600">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">₹ {item.amount}</span>
                                                            {!isReadOnly && <X size={14} onClick={() => removeComponent('earnings', item.id)} className="text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100" />}
                                                        </div>
                                                    </div>
                                                ))}
                                                {!isReadOnly && (
                                                    <button onClick={() => setAddComponentModal({ isOpen: true, section: 'earnings' })} className="w-full py-2 border border-dashed border-emerald-200 rounded text-xs font-medium text-emerald-600 hover:bg-emerald-50 mt-2">
                                                        + Add Earning / Due
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Deductions */}
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-rose-50 px-4 py-2 border-b border-rose-100 text-xs font-bold uppercase text-rose-700">Deductions / Recoveries</div>
                                            <div className="p-4 space-y-2">
                                                {sections.deductions.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm group border-b border-slate-50 pb-2 last:border-0">
                                                        <span className="text-slate-600">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">₹ {item.amount}</span>
                                                            {!isReadOnly && <X size={14} onClick={() => removeComponent('deductions', item.id)} className="text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100" />}
                                                        </div>
                                                    </div>
                                                ))}
                                                {!isReadOnly && (
                                                    <button onClick={() => setAddComponentModal({ isOpen: true, section: 'deductions' })} className="w-full py-2 border border-dashed border-rose-200 rounded text-xs font-medium text-rose-600 hover:bg-rose-50 mt-2">
                                                        + Add Deduction / Recovery
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Section */}
                                    <div className="mt-8 pt-8 border-t border-slate-200">
                                        <div className="flex justify-between items-end gap-12">
                                            <div className="flex-1 border-t border-slate-300 pt-2">
                                                <p className="text-sm font-bold text-slate-800">Authorized Signatory</p>
                                                <p className="text-xs text-slate-500">For Company Name</p>
                                            </div>
                                            <div className="flex-1 border-t border-slate-300 pt-2 text-right">
                                                <p className="text-sm font-bold text-slate-800">Employee Signature</p>
                                                <p className="text-xs text-slate-500">Received the above amount in full and final settlement</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-xs text-slate-400 text-center">
                                            Date: DD/MM/YYYY &nbsp; | &nbsp; Place: Bangalore
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Right: Settings Panel */}
                        <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-slate-800 mb-6">Settings</h3>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 text-left">Salary Structure Mapping</label>
                                    <select
                                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors mb-6"
                                        value={settings.salaryStructure || ''}
                                        onChange={(e) => {
                                            if (view !== 'VIEW') {
                                                const val = e.target.value;
                                                setSettings({ ...settings, salaryStructure: val });
                                                if (val === '1') {
                                                    setSections(prev => ({
                                                        ...prev,
                                                        earnings: [
                                                            { id: 'e1', name: 'Basic Salary', amount: '25,000', type: 'Fixed' },
                                                            { id: 'e2', name: 'House Rent Allowance', amount: '12,500', type: 'Fixed' },
                                                            { id: 'e3', name: 'Special Allowance', amount: '8,500', type: 'Fixed' },
                                                        ],
                                                        deductions: [
                                                            { id: 'd1', name: 'PF (Employee)', amount: '1,800', type: 'Variable' },
                                                            { id: 'd2', name: 'Professional Tax', amount: '200', type: 'Variable' },
                                                            { id: 'd3', name: 'Income Tax (TDS)', amount: '0', type: 'Variable' },
                                                        ]
                                                    }));
                                                } else if (val === '2') {
                                                    setSections(prev => ({
                                                        ...prev,
                                                        earnings: [{ id: 'e99', name: 'Stipend', amount: '15,000', type: 'Fixed' }],
                                                        deductions: []
                                                    }));
                                                }
                                            }
                                        }}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select Structure</option>
                                        <option value="1">Standard IT Structure 2025</option>
                                        <option value="2">Internship Stipend</option>
                                    </select>
                                </div>

                                <div className="space-y-8">
                                    <div className="mt-6">
                                        <label className="block text-sm font-bold text-slate-800 uppercase mb-3">DISPLAY SETTINGS</label>
                                        <div className="space-y-4">
                                            <label className="flex items-start justify-between cursor-pointer p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">Show YTD Columns</div>
                                                    <div className="text-sm text-slate-600 mt-1">Add year-to-date totals section</div>
                                                </div>
                                                <div className="mt-1">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.showYTD}
                                                        onChange={(e) => setSettings({...settings, showYTD: e.target.checked})}
                                                        className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                    />
                                                </div>
                                            </label>

                                            <label className="flex items-start justify-between cursor-pointer p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">Password Protect PDF</div>
                                                    <div className="text-sm text-slate-600 mt-1">Secure PDF with password</div>
                                                </div>
                                                <div className="mt-1">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={settings.passwordProtect}
                                                        onChange={(e) => setSettings({...settings, passwordProtect: e.target.checked})}
                                                        className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                    />
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <label className="block text-base font-bold text-slate-800 mb-3">Decimal Places</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                value={settings.decimalPlaces || '2'}
                                                onChange={(e) => setSettings({...settings, decimalPlaces: e.target.value})}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base font-medium bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'PREVIEW' ? (
                    /* PREVIEW TAB */
                    <div className="flex-1 bg-slate-100 p-8 flex justify-center overflow-y-auto">
                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-12 flex flex-col relative text-slate-900" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {/* ... existing preview content ... */}
                            <div className={`flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8 ${headerConfig.logoPosition === 'Right' ? 'flex-row-reverse' : ''} ${headerConfig.logoPosition === 'Center' ? 'flex-col items-center text-center' : ''}`}>
                                {headerConfig.showLogo && (
                                    <div className="w-20 h-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 mb-4 sm:mb-0 border border-slate-300">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <div className={`${headerConfig.logoPosition === 'Center' ? 'w-full text-center' : headerConfig.logoPosition === 'Left' ? 'text-right' : 'text-left'}`}>
                                    {headerConfig.showCompanyName && <h1 className="text-2xl font-bold uppercase tracking-wide">TechFlow Systems Pvt Ltd</h1>}
                                    {headerConfig.showCompanyAddress && <p className="text-sm text-slate-500 mt-1 max-w-xs ml-auto">123 Business Park, Sector 4, Bangalore - 560001</p>}
                                </div>
                            </div>
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold uppercase underline underline-offset-4">{headerConfig.documentTitle}</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm border-b border-slate-200 pb-6">
                                {headerConfig.employeeFields.name && <div className="flex"><span className="w-36 font-bold text-slate-600">Employee Name</span><span>: Arjun Mehta</span></div>}
                                {headerConfig.employeeFields.id && <div className="flex"><span className="w-36 font-bold text-slate-600">Employee ID</span><span>: TF00888</span></div>}
                                {headerConfig.employeeFields.designation && <div className="flex"><span className="w-36 font-bold text-slate-600">Designation</span><span>: Product Manager</span></div>}
                                {headerConfig.employeeFields.department && <div className="flex"><span className="w-36 font-bold text-slate-600">Department</span><span>: Software Engineering</span></div>}
                                {headerConfig.employeeFields.doj && <div className="flex"><span className="w-36 font-bold text-slate-600">Date of Joining</span><span>: 15 Mar 2022</span></div>}
                                {headerConfig.employeeFields.dor && <div className="flex"><span className="w-36 font-bold text-slate-600">Date of Relieving</span><span>: 30 Nov 2025</span></div>}
                                {headerConfig.employeeFields.pan && <div className="flex"><span className="w-36 font-bold text-slate-600">PAN Number</span><span>: ABCDE1234F</span></div>}
                                {headerConfig.employeeFields.uan && <div className="flex"><span className="w-36 font-bold text-slate-600">UAN</span><span>: 100900200300</span></div>}
                            </div>
                            <div className="mb-6">
                                <h4 className="font-bold text-sm mb-2 uppercase text-slate-600">Earnings & Dues</h4>
                                <table className="w-full border-collapse border border-slate-300 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="border border-slate-300 p-2 text-left">Description</th>
                                            <th className="border border-slate-300 p-2 text-right w-40">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sections.earnings.map((item, i) => (
                                            <tr key={i}>
                                                <td className="border border-slate-300 p-2">{item.name}</td>
                                                <td className="border border-slate-300 p-2 text-right">{item.amount}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-emerald-50 font-bold">
                                            <td className="border border-slate-300 p-2 text-right">Total Earnings (A)</td>
                                            <td className="border border-slate-300 p-2 text-right">
                                                {formatCurrency(sections.earnings.reduce((sum, item) => sum + parseAmount(item.amount), 0))}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mb-8">
                                <h4 className="font-bold text-sm mb-2 uppercase text-slate-600">Deductions & Recoveries</h4>
                                <table className="w-full border-collapse border border-slate-300 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="border border-slate-300 p-2 text-left">Description</th>
                                            <th className="border border-slate-300 p-2 text-right w-40">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sections.deductions.map((item, i) => (
                                            <tr key={i}>
                                                <td className="border border-slate-300 p-2">{item.name}</td>
                                                <td className="border border-slate-300 p-2 text-right">{item.amount}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-rose-50 font-bold">
                                            <td className="border border-slate-300 p-2 text-right">Total Deductions (B)</td>
                                            <td className="border border-slate-300 p-2 text-right">
                                                {formatCurrency(sections.deductions.reduce((sum, item) => sum + parseAmount(item.amount), 0))}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end mb-12">
                                <div className="w-full border-2 border-slate-800 p-4 flex justify-between items-center bg-slate-50">
                                    <div className="text-left">
                                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Net Payable Amount</span>
                                        <span className="text-[10px] text-slate-400">(Total Earnings - Total Deductions)</span>
                                    </div>
                                    <span className="font-bold text-2xl text-slate-900">
                                        ₹ {formatCurrency(
                                            sections.earnings.reduce((sum, item) => sum + parseAmount(item.amount), 0) -
                                            sections.deductions.reduce((sum, item) => sum + parseAmount(item.amount), 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-auto pt-8 border-t border-slate-300">
                                <div className="flex justify-between items-end gap-12">
                                    <div className="flex-1 text-left">
                                        <div className="h-16 mb-2"></div>
                                        <div className="border-t border-slate-400 pt-2">
                                            <p className="text-sm font-bold text-slate-800">Authorized Signatory</p>
                                            <p className="text-xs text-slate-500">For TechFlow Systems Pvt Ltd</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <div className="h-16 mb-2"></div>
                                        <div className="border-t border-slate-400 pt-2">
                                            <p className="text-sm font-bold text-slate-800">Employee Signature</p>
                                            <p className="text-xs text-slate-500">Received the above amount in full and final settlement</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 text-xs text-slate-400 text-center">
                                    Date: {new Date().toLocaleDateString()} &nbsp; | &nbsp; Place: Bangalore
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* CONFIGURATION TAB */
                    <div className="flex-1 bg-slate-50/50 p-4 lg:p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Template Mapping Section */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <button
                                    onClick={() => setIsTemplateMappingOpen(!isTemplateMappingOpen)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors rounded-t-3xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                                            <Users size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-slate-800">Template Mapping</h3>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-transform duration-300 ${isTemplateMappingOpen ? 'rotate-180 bg-slate-50' : ''}`}>
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </button>

                                {isTemplateMappingOpen && (
                                    <div className="px-6 pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="grid grid-cols-1 gap-8">
                                            {renderMappingSelector('departments', 'Department')}
                                            {renderMappingSelector('designations', 'Designation')}
                                            {renderMappingSelector('employees', 'Employee')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <FnFHeaderConfigModal isOpen={headerConfigOpen} onClose={() => setHeaderConfigOpen(false)} config={headerConfig} onChange={setHeaderConfig} />
            <AddFnFComponentModal
                isOpen={addComponentModal.isOpen}
                onClose={() => setAddComponentModal({ isOpen: false, section: null })}
                section={addComponentModal.section}
                onAdd={addComponent}
            />
        </div>
    );
};

export default FnFSettlementTemplate;