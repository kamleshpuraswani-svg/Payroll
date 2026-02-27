
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
    Check
} from 'lucide-react';

// --- Types ---

interface ComponentItem {
    id: string;
    name: string;
    amount: string; // Placeholder for preview
    type: 'Fixed' | 'Variable';
}

interface PayslipSection {
    id: string;
    title: string;
    type: 'earnings' | 'deductions' | 'reimbursements' | 'summary';
    items: ComponentItem[];
}

interface TemplateSettings {
    currency: string;
    dateFormat: string;
    showYTD: boolean;
    ytdStartMonth?: string;
    showEmployerContribution: boolean;
    employerContributionPosition?: 'Footer' | 'Separate Section';
    passwordProtect: boolean;
    salaryStructure?: string;
}

interface PayslipTemplate {
    id: string;
    name: string;
    status: 'Published' | 'Draft';
    isActive: boolean;
    createdBy: string;
    lastModified: string;
    sections: {
        earnings: ComponentItem[];
        deductions: ComponentItem[];
        reimbursements: ComponentItem[];
        summary: ComponentItem[];
    };
    settings: TemplateSettings;
    headerConfig: HeaderConfig;
}

interface HeaderConfig {
    logoPosition: 'Left' | 'Center' | 'Right';
    showLogo: boolean;
    showCompanyName: boolean;
    showCompanyAddress: boolean;
    payslipTitle: string;
    employeeFields: {
        name: boolean;
        id: boolean;
        designation: boolean;
        department: boolean;
        doj: boolean;
        bankAccount: boolean;
        pan: boolean;
        uan: boolean;
        location: boolean;
    };
}

// --- Mock Data ---

const MOCK_TEMPLATES: PayslipTemplate[] = [
    {
        id: '1',
        name: 'Standard Executive Payslip',
        status: 'Published',
        isActive: true,
        createdBy: 'Super Admin',
        lastModified: '03 Dec 2025',
        headerConfig: {
            logoPosition: 'Left',
            showLogo: true,
            showCompanyName: true,
            showCompanyAddress: true,
            payslipTitle: 'Salary Slip',
            employeeFields: { name: true, id: true, designation: true, department: true, doj: true, bankAccount: true, pan: true, uan: true, location: true }
        },
        sections: {
            earnings: [
                { id: 'e1', name: 'Basic Salary', amount: '25,000', type: 'Fixed' },
                { id: 'e2', name: 'House Rent Allowance', amount: '12,500', type: 'Fixed' },
                { id: 'e3', name: 'Special Allowance', amount: '8,500', type: 'Fixed' },
            ],
            deductions: [
                { id: 'd1', name: 'Provident Fund', amount: '1,800', type: 'Variable' },
                { id: 'd2', name: 'Professional Tax', amount: '200', type: 'Variable' },
            ],
            reimbursements: [
                { id: 'r1', name: 'Fuel Reimbursement', amount: '2,500', type: 'Variable' }
            ],
            summary: [
                { id: 's1', name: 'Net Pay', amount: '44,000', type: 'Fixed' }
            ]
        },
        settings: {
            currency: 'INR',
            dateFormat: 'DD MMM YYYY',
            showYTD: true,
            ytdStartMonth: 'April',
            showEmployerContribution: false,
            passwordProtect: true
        }
    },
    {
        id: '2',
        name: 'Intern Stipend Receipt',
        status: 'Draft',
        isActive: false,
        createdBy: 'Super Admin',
        lastModified: '1 week ago',
        headerConfig: {
            logoPosition: 'Center',
            showLogo: true,
            showCompanyName: true,
            showCompanyAddress: false,
            payslipTitle: 'Stipend Receipt',
            employeeFields: { name: true, id: true, designation: false, department: true, doj: true, bankAccount: true, pan: false, uan: false, location: false }
        },
        sections: {
            earnings: [
                { id: 'e99', name: 'Fixed Stipend', amount: '15,000', type: 'Fixed' }
            ],
            deductions: [],
            reimbursements: [],
            summary: []
        },
        settings: {
            currency: 'INR',
            dateFormat: 'DD MMM YYYY',
            showYTD: false,
            showEmployerContribution: false,
            passwordProtect: false
        }
    }
];

// --- Sub-Components ---

const HeaderConfigModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    config: HeaderConfig;
    onChange: (cfg: HeaderConfig) => void;
}> = ({ isOpen, onClose, config, onChange }) => {
    if (!isOpen) return null;

    const toggleField = (field: keyof HeaderConfig['employeeFields']) => {
        onChange({
            ...config,
            employeeFields: { ...config.employeeFields, [field]: !config.employeeFields[field] }
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Header Configuration</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Branding */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Branding & Layout</h4>
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
                            value={config.payslipTitle}
                            onChange={e => onChange({ ...config, payslipTitle: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    {/* Employee Fields */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Employee Details to Display</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(config.employeeFields).map(([key, value]) => {
                                const labels: Record<string, string> = { name: 'Employee Name', id: 'Employee ID', designation: 'Designation', department: 'Department', doj: 'Date of Joining', bankAccount: 'Bank Account', pan: 'PAN Number', uan: 'UAN', location: 'Address' };
                                if (key === 'location') return null;
                                return (
                                    <label key={key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={value as boolean}
                                            onChange={() => toggleField(key as keyof HeaderConfig['employeeFields'])}
                                            className="rounded text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="capitalize">{labels[key] || key}</span>
                                    </label>
                                )
                            })}
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

const AddComponentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    section: 'earnings' | 'deductions' | 'reimbursements' | 'summary' | null;
    onAdd: (items: ComponentItem[]) => void
}> = ({ isOpen, onClose, section, onAdd }) => {
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (section === 'summary') {
                setSelected(['Gross Earnings', 'Total Deductions', 'Net Pay']);
            } else {
                setSelected([]);
            }
        }
    }, [isOpen, section]);

    if (!isOpen || !section) return null;

    const options = {
        earnings: ['Basic Salary', 'HRA', 'Special Allowance', 'Bonus', 'Overtime', 'Arrears', 'Food Allowance', 'Shift Allowance'],
        deductions: ['Provident Fund', 'Professional Tax', 'Income Tax (TDS)', 'Loan Repayment', 'Salary Advance', 'LWF'],
        reimbursements: ['Medical', 'Fuel', 'Driver Salary', 'Telephone', 'Books & Periodicals'],
        summary: ['Gross Earnings', 'Total Deductions', 'Net Pay', 'CTC Monthly']
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
                <h3 className="font-bold text-slate-800 mb-4 capitalize">Add {section} Components</h3>
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

const SettingsConfigModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    type: 'YTD' | 'EMPLOYER' | 'PASSWORD' | null;
    settings: TemplateSettings;
    onSave: (s: TemplateSettings) => void;
}> = ({ isOpen, onClose, type, settings, onSave }) => {
    if (!isOpen || !type) return null;

    const handleSave = (updates: Partial<TemplateSettings>) => {
        onSave({ ...settings, ...updates });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4">
                    {type === 'YTD' && 'Configure YTD Columns'}
                    {type === 'EMPLOYER' && 'Employer Contribution Settings'}
                    {type === 'PASSWORD' && 'Password Protection'}
                </h3>

                <div className="space-y-4 mb-6">
                    {type === 'YTD' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year Start</label>
                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                                <option>April</option>
                                <option>January</option>
                            </select>
                        </div>
                    )}
                    {type === 'EMPLOYER' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Display Position</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="pos" defaultChecked className="text-purple-600 focus:ring-purple-500" />
                                    <span className="text-sm text-slate-700">Separate Section</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="pos" className="text-purple-600 focus:ring-purple-500" />
                                    <span className="text-sm text-slate-700">Footer Note</span>
                                </label>
                            </div>
                        </div>
                    )}
                    {type === 'PASSWORD' && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                            PDFs will be protected with the employee's PAN (first 4 chars) + DOB (DDMM).
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">Cancel</button>
                    <button onClick={() => handleSave(type === 'YTD' ? { showYTD: true } : type === 'EMPLOYER' ? { showEmployerContribution: true } : { passwordProtect: true })} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                        Enable
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const SalarySlipTemplate: React.FC = () => {
    const [view, setView] = useState<'LIST' | 'EDITOR' | 'VIEW'>('LIST');
    const [activeTab, setActiveTab] = useState<'EDITOR' | 'PREVIEW'>('EDITOR');

    // Persist templates in localStorage
    const [templates, setTemplates] = useState<PayslipTemplate[]>(() => {
        const saved = localStorage.getItem('collab_payslip_templates');
        return saved ? JSON.parse(saved) : MOCK_TEMPLATES;
    });

    // Save changes to localStorage
    useEffect(() => {
        localStorage.setItem('collab_payslip_templates', JSON.stringify(templates));
    }, [templates]);

    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    // Editor State
    const [templateName, setTemplateName] = useState('');
    const [sections, setSections] = useState<PayslipTemplate['sections']>({
        earnings: [], deductions: [], reimbursements: [], summary: []
    });
    const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(MOCK_TEMPLATES[0].headerConfig);
    const [settings, setSettings] = useState<TemplateSettings>(MOCK_TEMPLATES[0].settings);

    // Modal States
    const [headerConfigOpen, setHeaderConfigOpen] = useState(false);
    const [settingsModal, setSettingsModal] = useState<{ isOpen: boolean; type: 'YTD' | 'EMPLOYER' | 'PASSWORD' | null }>({ isOpen: false, type: null });
    const [addComponentModal, setAddComponentModal] = useState<{
        isOpen: boolean;
        section: 'earnings' | 'deductions' | 'reimbursements' | 'summary' | null
    }>({ isOpen: false, section: null });

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleCreate = () => {
        setEditingTemplateId(null);
        setTemplateName('');
        setSections({
            earnings: [],
            deductions: [],
            reimbursements: [],
            summary: [
                { id: `s_${Date.now()}_1`, name: 'Gross Earnings', amount: '0', type: 'Fixed' },
                { id: `s_${Date.now()}_2`, name: 'Total Deductions', amount: '0', type: 'Fixed' },
                { id: `s_${Date.now()}_3`, name: 'Net Pay', amount: '0', type: 'Fixed' }
            ]
        });
        setSettings(MOCK_TEMPLATES[0].settings); // Defaults
        setHeaderConfig(MOCK_TEMPLATES[0].headerConfig);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleEdit = (t: PayslipTemplate) => {
        setEditingTemplateId(t.id);
        setTemplateName(t.name);
        setSections(t.sections);
        setSettings(t.settings);
        setHeaderConfig(t.headerConfig);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleView = (t: PayslipTemplate) => {
        handleEdit(t);
        setView('VIEW');
    };

    const handleSave = (status: 'Published' | 'Draft') => {
        // Validation
        if (!templateName.trim()) {
            setValidationError('Template Name is required');
            return;
        }
        if (sections.earnings.length === 0 || sections.deductions.length === 0) {
            setValidationError('At least one component is required in both Earnings and Deductions sections.');
            return;
        }

        const newTemplate: PayslipTemplate = {
            id: editingTemplateId || Date.now().toString(),
            name: templateName,
            status,
            isActive: editingTemplateId ? (templates.find(t => t.id === editingTemplateId)?.isActive ?? true) : true,
            createdBy: 'Super Admin',
            lastModified: 'Just now',
            sections,
            settings,
            headerConfig
        };

        if (editingTemplateId) {
            setTemplates(prev => prev.map(t => t.id === editingTemplateId ? newTemplate : t));
        } else {
            setTemplates(prev => [...prev, newTemplate]);
        }
        setView('LIST');
        setValidationError(null);
    };

    const toggleSetting = (key: keyof TemplateSettings, modalType?: 'YTD' | 'EMPLOYER' | 'PASSWORD') => {
        if (view === 'VIEW') return;
        const currentVal = settings[key];
        if (!currentVal && modalType) {
            setSettingsModal({ isOpen: true, type: modalType });
        } else {
            setSettings({ ...settings, [key]: !currentVal });
        }
    };

    const toggleTemplateActive = (id: string) => {
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
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
    const formatCurrency = (amt: number) => amt.toLocaleString('en-IN', { maximumFractionDigits: 0 });

    // --- RENDER LIST ---
    if (view === 'LIST') {
        return (
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Salary Slip Templates</h2>
                    </div>
                    <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Create Salary Slip
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Template Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created By</th>
                                <th className="px-6 py-4">Last Updated By</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {templates.map(t => (
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
                                    <td className="px-6 py-4">{t.createdBy}</td>
                                    <td className="px-6 py-4">{t.lastModified}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleTemplateActive(t.id); }}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${t.isActive ? 'bg-purple-600' : 'bg-slate-300'}`}
                                                title={t.isActive ? "Deactivate Template" : "Activate Template"}
                                            >
                                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${t.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); handleView(t); }} className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-sky-600 rounded"><Eye size={16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="p-1.5 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded"><Edit2 size={16} /></button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                        <div className="text-xs text-slate-500 flex gap-2 items-center">
                            <span>Payslip Template</span>
                        </div>
                        {isReadOnly ? (
                            <h2 className="text-lg font-bold text-slate-800">{templateName}</h2>
                        ) : (
                            <input
                                type="text"
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                placeholder="Enter Template Name"
                                className={`text-lg font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none bg-transparent px-1 min-w-[300px] w-full ${validationError && !validationError.includes('Earnings') ? 'border-rose-300 bg-rose-50' : ''}`}
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
                            <button onClick={() => handleSave('Published')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2">
                                <Save size={16} /> Publish
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-200 bg-white shrink-0">
                <div className="flex gap-6">
                    <button onClick={() => setActiveTab('EDITOR')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'EDITOR' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}>Template Editor</button>
                    <button onClick={() => setActiveTab('PREVIEW')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PREVIEW' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}>Preview & History</button>
                </div>
            </div>

            {validationError && !validationError.includes('Earnings') && (
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
                                <div className="p-2 bg-slate-50 border-b border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Payslip Canvas</div>

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
                                                {headerConfig.showCompanyAddress && <p className="text-xs text-slate-500 mt-1">123 Business Park, Bangalore</p>}
                                            </div>
                                        </div>
                                        <div className="text-center mt-6 border-b border-slate-100 pb-4 mb-4">
                                            <h3 className="font-bold text-slate-700">{headerConfig.payslipTitle} <span className="font-normal text-slate-400">Nov 2025</span></h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                                            {headerConfig.employeeFields.name && <div>Employee Name: <span className="font-semibold text-slate-800">Priya Sharma</span></div>}
                                            {headerConfig.employeeFields.id && <div>Employee ID: <span className="font-semibold text-slate-800">TF00123</span></div>}
                                            {headerConfig.employeeFields.designation && <div>Designation: <span className="font-semibold text-slate-800">Senior Engineer</span></div>}
                                            {headerConfig.employeeFields.department && <div>Department: <span className="font-semibold text-slate-800">Engineering</span></div>}
                                            {headerConfig.employeeFields.doj && <div>Date of Joining: <span className="font-semibold text-slate-800">12 Jan 2023</span></div>}
                                            {headerConfig.employeeFields.location && <div>Address: <span className="font-semibold text-slate-800">Bangalore</span></div>}
                                            {headerConfig.employeeFields.pan && <div>PAN Number: <span className="font-semibold text-slate-800">ABCDE1234F</span></div>}
                                            {headerConfig.employeeFields.uan && <div>UAN: <span className="font-semibold text-slate-800">100900200300</span></div>}
                                            {headerConfig.employeeFields.bankAccount && <div>Bank Account: <span className="font-semibold text-slate-800">HDFC0001234</span></div>}
                                        </div>
                                    </div>

                                    {/* ERROR BANNER */}
                                    {validationError && validationError.includes('Earnings') && (
                                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2 text-rose-700 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle size={16} /> {validationError}
                                        </div>
                                    )}

                                    {/* Earnings & Deductions Grid */}
                                    <div className={`grid grid-cols-2 border rounded-xl overflow-hidden ${validationError && validationError.includes('Earnings') ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200'}`}>
                                        {/* Earnings */}
                                        <div className="border-r border-slate-200 flex flex-col">
                                            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 text-xs font-bold uppercase text-emerald-700">Earnings</div>
                                            <div className="p-4 space-y-2 flex-1">
                                                {sections.earnings.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm group">
                                                        <span className="text-slate-600">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">₹ {item.amount}</span>
                                                            {!isReadOnly && <X size={14} onClick={() => removeComponent('earnings', item.id)} className="text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100" />}
                                                        </div>
                                                    </div>
                                                ))}
                                                {!isReadOnly && (
                                                    <button onClick={() => setAddComponentModal({ isOpen: true, section: 'earnings' })} className="w-full py-2 border border-dashed border-emerald-200 rounded text-xs font-medium text-emerald-600 hover:bg-emerald-50 mt-2">
                                                        + Add Earning
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Deductions */}
                                        <div className="flex flex-col">
                                            <div className="bg-rose-50 px-4 py-2 border-b border-rose-100 text-xs font-bold uppercase text-rose-700">Deductions</div>
                                            <div className="p-4 space-y-2 flex-1">
                                                {sections.deductions.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm group">
                                                        <span className="text-slate-600">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">₹ {item.amount}</span>
                                                            {!isReadOnly && <X size={14} onClick={() => removeComponent('deductions', item.id)} className="text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100" />}
                                                        </div>
                                                    </div>
                                                ))}
                                                {!isReadOnly && (
                                                    <button onClick={() => setAddComponentModal({ isOpen: true, section: 'deductions' })} className="w-full py-2 border border-dashed border-rose-200 rounded text-xs font-medium text-rose-600 hover:bg-rose-50 mt-2">
                                                        + Add Deduction
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reimbursements Section */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 text-xs font-bold uppercase text-amber-700">Reimbursements & Benefits</div>
                                        <div className="p-4 space-y-2">
                                            {sections.reimbursements.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm group">
                                                    <span className="text-slate-600">{item.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-800">₹ {item.amount}</span>
                                                        {!isReadOnly && <X size={14} onClick={() => removeComponent('reimbursements', item.id)} className="text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100" />}
                                                    </div>
                                                </div>
                                            ))}
                                            {!isReadOnly && (
                                                <button onClick={() => setAddComponentModal({ isOpen: true, section: 'reimbursements' })} className="w-full py-2 border border-dashed border-amber-200 rounded text-xs font-medium text-amber-600 hover:bg-amber-50 mt-2">
                                                    + Add Reimbursement
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary Section */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold uppercase text-slate-600">Salary Summary</div>
                                        <div className="p-4 space-y-2">
                                            {sections.summary.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm group font-medium">
                                                    <span className="text-slate-700">{item.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900">₹ {item.amount}</span>
                                                        {!isReadOnly && <X size={14} onClick={() => removeComponent('summary', item.id)} className="text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100" />}
                                                    </div>
                                                </div>
                                            ))}
                                            {!isReadOnly && (
                                                <button onClick={() => setAddComponentModal({ isOpen: true, section: 'summary' })} className="w-full py-2 border border-dashed border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-slate-100 mt-2">
                                                    + Add Summary Item
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Right: Settings Sidebar */}
                        <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                            <h3 className="font-bold text-slate-800 mb-6">Settings</h3>
                            <div className="space-y-6">

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
                                                        ],
                                                        reimbursements: [
                                                            { id: 'r1', name: 'Fuel & Driver', amount: '0', type: 'Variable' },
                                                            { id: 'r2', name: 'Telephone / Internet', amount: '0', type: 'Variable' },
                                                            { id: 'r3', name: 'Books & Periodicals', amount: '0', type: 'Variable' },
                                                        ]
                                                    }));
                                                } else if (val === '2') {
                                                    setSections(prev => ({
                                                        ...prev,
                                                        earnings: [{ id: 'e99', name: 'Stipend', amount: '15,000', type: 'Fixed' }],
                                                        deductions: [],
                                                        reimbursements: []
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

                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Show YTD Columns</span>
                                            <div onClick={() => toggleSetting('showYTD', 'YTD')} className={`w-9 h-5 rounded-full relative transition-colors ${settings.showYTD ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showYTD ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Employer Contribution</span>
                                            <div onClick={() => toggleSetting('showEmployerContribution', 'EMPLOYER')} className={`w-9 h-5 rounded-full relative transition-colors ${settings.showEmployerContribution ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showEmployerContribution ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Password Protect PDF</span>
                                            <div onClick={() => toggleSetting('passwordProtect', 'PASSWORD')} className={`w-9 h-5 rounded-full relative transition-colors ${settings.passwordProtect ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.passwordProtect ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* PREVIEW TAB */
                    <div className="flex-1 bg-slate-100 p-8 flex justify-center overflow-y-auto">
                        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-12 flex flex-col relative text-slate-900" style={{ fontFamily: 'Times New Roman, serif' }}>

                            {/* Dynamic Header */}
                            <div className={`flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8 ${headerConfig.logoPosition === 'Right' ? 'flex-row-reverse' : ''} ${headerConfig.logoPosition === 'Center' ? 'flex-col items-center text-center' : ''}`}>
                                {headerConfig.showLogo && (
                                    <div className="w-20 h-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 mb-4 sm:mb-0 border border-slate-300">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <div className={`${headerConfig.logoPosition === 'Center' ? 'w-full text-center' : headerConfig.logoPosition === 'Left' ? 'text-right' : 'text-left'}`}>
                                    {headerConfig.showCompanyName && <h1 className="text-2xl font-bold uppercase tracking-wide">{headerConfig.showCompanyName ? 'TechFlow Systems Pvt Ltd' : ''}</h1>}
                                    {headerConfig.showCompanyAddress && <p className="text-sm text-slate-500 mt-1 max-w-xs ml-auto">123 Business Park, Sector 4, Bangalore - 560001</p>}
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold uppercase underline underline-offset-4">{headerConfig.payslipTitle}</h2>
                                <p className="text-sm font-medium mt-1">For the month of November 2025</p>
                            </div>

                            {/* Dynamic Employee Details */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm border-b border-slate-200 pb-6">
                                {headerConfig.employeeFields.name && <div className="flex"><span className="w-32 font-bold text-slate-600">Employee Name</span><span>: Priya Sharma</span></div>}
                                {headerConfig.employeeFields.id && <div className="flex"><span className="w-32 font-bold text-slate-600">Employee ID</span><span>: TF00912</span></div>}
                                {headerConfig.employeeFields.designation && <div className="flex"><span className="w-32 font-bold text-slate-600">Designation</span><span>: Senior Engineer</span></div>}
                                {headerConfig.employeeFields.department && <div className="flex"><span className="w-32 font-bold text-slate-600">Department</span><span>: Engineering</span></div>}
                                {headerConfig.employeeFields.doj && <div className="flex"><span className="w-32 font-bold text-slate-600">Date of Joining</span><span>: 12 Jan 2023</span></div>}
                                {headerConfig.employeeFields.location && <div className="flex"><span className="w-32 font-bold text-slate-600">Address</span><span>: Bangalore</span></div>}
                                {headerConfig.employeeFields.pan && <div className="flex"><span className="w-32 font-bold text-slate-600">PAN Number</span><span>: ABCDE1234F</span></div>}
                                {headerConfig.employeeFields.uan && <div className="flex"><span className="w-32 font-bold text-slate-600">UAN</span><span>: 100900200300</span></div>}
                                {headerConfig.employeeFields.bankAccount && <div className="flex"><span className="w-32 font-bold text-slate-600">Bank Account</span><span>: HDFC0001234</span></div>}
                            </div>

                            {/* Dynamic Earnings & Deductions Table */}
                            <table className="w-full border-collapse border border-slate-300 mb-8 text-sm">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className={`border border-slate-300 p-2 text-left ${settings.showYTD ? 'w-[25%]' : 'w-[35%]'}`}>Earnings</th>
                                        <th className={`border border-slate-300 p-2 text-right ${settings.showYTD ? 'w-[15%]' : 'w-[15%]'}`}>Amount</th>
                                        {settings.showYTD && <th className="border border-slate-300 p-2 text-right w-[10%] text-slate-500">YTD</th>}
                                        <th className={`border border-slate-300 p-2 text-left ${settings.showYTD ? 'w-[25%]' : 'w-[35%]'}`}>Deductions</th>
                                        <th className={`border border-slate-300 p-2 text-right ${settings.showYTD ? 'w-[15%]' : 'w-[15%]'}`}>Amount</th>
                                        {settings.showYTD && <th className="border border-slate-300 p-2 text-right w-[10%] text-slate-500">YTD</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: Math.max(sections.earnings.length, sections.deductions.length) }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="border-l border-r border-slate-300 p-2 text-left align-top">
                                                {sections.earnings[i]?.name}
                                            </td>
                                            <td className="border-r border-slate-300 p-2 text-right align-top">
                                                {sections.earnings[i] ? `₹ ${sections.earnings[i].amount}` : ''}
                                            </td>
                                            {settings.showYTD && (
                                                <td className="border-r border-slate-300 p-2 text-right align-top text-slate-500">
                                                    {sections.earnings[i] ? `₹ ${(parseAmount(sections.earnings[i].amount) * 8).toLocaleString('en-IN')}` : ''}
                                                </td>
                                            )}
                                            <td className="border-r border-slate-300 p-2 text-left align-top">
                                                {sections.deductions[i]?.name}
                                            </td>
                                            <td className="border-r border-slate-300 p-2 text-right align-top">
                                                {sections.deductions[i] ? `₹ ${sections.deductions[i].amount}` : ''}
                                            </td>
                                            {settings.showYTD && (
                                                <td className="border-r border-slate-300 p-2 text-right align-top text-slate-500">
                                                    {sections.deductions[i] ? `₹ ${(parseAmount(sections.deductions[i].amount) * 8).toLocaleString('en-IN')}` : ''}
                                                </td>
                                            )}
                                        </tr>
                                    ))}

                                    {settings.showEmployerContribution && (
                                        <tr className="bg-emerald-50 text-emerald-800 text-xs">
                                            <td className="border border-slate-300 p-2 text-left" colSpan={settings.showYTD ? 3 : 2}>
                                                <div className="font-semibold mb-1">Employer PF Contribution</div>
                                            </td>
                                            <td className="border border-slate-300 p-2 text-right align-top" colSpan={settings.showYTD ? 3 : 2}>
                                                ₹ 1,800
                                            </td>
                                        </tr>
                                    )}

                                    {/* Spacing Rows to ensure minimum height if needed */}
                                    {Math.max(sections.earnings.length, sections.deductions.length) < 3 && (
                                        <tr>
                                            <td className="border-l border-r border-slate-300 h-8"></td>
                                            <td className="border-r border-slate-300"></td>
                                            {settings.showYTD && <td className="border-r border-slate-300"></td>}
                                            <td className="border-r border-slate-300"></td>
                                            <td className="border-r border-slate-300"></td>
                                            {settings.showYTD && <td className="border-r border-slate-300"></td>}
                                        </tr>
                                    )}

                                    {/* Totals Row */}
                                    <tr className="bg-slate-50 font-bold">
                                        <td className="border border-slate-300 p-2 text-left">Total Earnings</td>
                                        <td className="border border-slate-300 p-2 text-right">
                                            ₹ {formatCurrency(sections.earnings.reduce((sum, item) => sum + parseAmount(item.amount), 0))}
                                        </td>
                                        {settings.showYTD && (
                                            <td className="border border-slate-300 p-2 text-right text-slate-500">
                                                ₹ {formatCurrency(sections.earnings.reduce((sum, item) => sum + parseAmount(item.amount), 0) * 8)}
                                            </td>
                                        )}
                                        <td className="border border-slate-300 p-2 text-left">Total Deductions</td>
                                        <td className="border border-slate-300 p-2 text-right">
                                            ₹ {formatCurrency(sections.deductions.reduce((sum, item) => sum + parseAmount(item.amount), 0) + (settings.showEmployerContribution ? 1800 : 0))}
                                        </td>
                                        {settings.showYTD && (
                                            <td className="border border-slate-300 p-2 text-right text-slate-500">
                                                ₹ {formatCurrency(sections.deductions.reduce((sum, item) => sum + parseAmount(item.amount), 0) * 8 + (settings.showEmployerContribution ? 1800 * 8 : 0))}
                                            </td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>

                            {/* Reimbursements (Optional) */}
                            {sections.reimbursements.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="font-bold text-sm mb-2 uppercase text-slate-600">Reimbursements & Benefits</h4>
                                    <table className="w-full border-collapse border border-slate-300 text-sm">
                                        <tbody>
                                            {sections.reimbursements.map((item, i) => (
                                                <tr key={i}>
                                                    <td className="border border-slate-300 p-2 w-[70%]">{item.name}</td>
                                                    <td className="border border-slate-300 p-2 text-right font-medium">₹ {item.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Net Pay */}
                            <div className="flex justify-end mb-12">
                                <div className="w-1/2 border-2 border-slate-800 p-4 flex justify-between items-center bg-slate-50">
                                    <div className="text-left">
                                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Net Payable</span>
                                        <span className="text-[10px] text-slate-400">(Earnings - Deductions)</span>
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
                                <p className="text-center text-xs text-slate-500 mb-1">This is a computer-generated document and does not require a signature.</p>
                                <p className="text-center text-[10px] text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <HeaderConfigModal isOpen={headerConfigOpen} onClose={() => setHeaderConfigOpen(false)} config={headerConfig} onChange={setHeaderConfig} />
            <SettingsConfigModal isOpen={settingsModal.isOpen} onClose={() => setSettingsModal({ isOpen: false, type: null })} type={settingsModal.type} settings={settings} onSave={s => setSettings(s)} />
            <AddComponentModal
                isOpen={addComponentModal.isOpen}
                onClose={() => setAddComponentModal({ isOpen: false, section: null })}
                section={addComponentModal.section}
                onAdd={addComponent}
            />
        </div>
    );
};

export default SalarySlipTemplate;
