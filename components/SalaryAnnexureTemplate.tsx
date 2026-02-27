
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
    Briefcase
} from 'lucide-react';

// --- Types ---

interface ComponentItem {
    id: string;
    name: string;
    amount: string;
    type: 'Fixed' | 'Variable' | 'Calculated';
}

interface AnnexureTemplateSettings {
    showPercentageColumn: boolean;
    showMonthlyColumn: boolean;
    showExemptTags: boolean;
    highlightBasicRule: boolean;
    includeEmployerContribution: boolean;
    showDisclaimer: boolean;
}

interface HeaderConfig {
    logoPosition: 'Left' | 'Center' | 'Right';
    showLogo: boolean;
    showCompanyName: boolean;
    showCompanyAddress: boolean;
    documentTitle: string;
    candidateFields: {
        name: boolean;
        designation: boolean;
        location: boolean;
        doj: boolean;
    };
}

interface AnnexureTemplate {
    id: string;
    name: string;
    status: 'Published' | 'Draft';
    lastModified: string;
    sections: {
        earnings: ComponentItem[];
        retirals: ComponentItem[];
        reimbursements: ComponentItem[];
        deductions: ComponentItem[];
    };
    settings: AnnexureTemplateSettings;
    headerConfig: HeaderConfig;
}

// --- Mock Data ---

const MOCK_ANNEXURE_TEMPLATES: AnnexureTemplate[] = [
    {
        id: '1',
        name: 'Standard Offer Annexure',
        status: 'Published',
        lastModified: '03 Dec 2025',
        headerConfig: {
            logoPosition: 'Left',
            showLogo: true,
            showCompanyName: true,
            showCompanyAddress: true,
            documentTitle: 'Annexure to Offer Letter – Compensation Details',
            candidateFields: { name: true, designation: true, location: true, doj: true }
        },
        sections: {
            earnings: [
                { id: 'e1', name: 'Basic Salary', amount: '7,40,000', type: 'Fixed' },
                { id: 'e2', name: 'House Rent Allowance', amount: '3,70,000', type: 'Fixed' },
                { id: 'e3', name: 'Special Allowance', amount: '4,50,000', type: 'Fixed' },
                { id: 'e4', name: 'Conveyance Allowance', amount: '19,200', type: 'Fixed' },
                { id: 'e5', name: 'LTA', amount: '50,000', type: 'Fixed' },
            ],
            retirals: [
                { id: 'b1', name: 'Employer PF Contribution', amount: '88,800', type: 'Calculated' },
                { id: 'b2', name: 'Gratuity', amount: '35,600', type: 'Calculated' },
                { id: 'b3', name: 'Group Medical Insurance', amount: '15,000', type: 'Fixed' },
            ],
            reimbursements: [
                { id: 'r1', name: 'Telephone & Internet', amount: '24,000', type: 'Variable' },
                { id: 'r2', name: 'Books & Periodicals', amount: '12,000', type: 'Variable' },
            ],
            deductions: [
                { id: 'd1', name: 'Employee PF', amount: '88,800', type: 'Calculated' },
                { id: 'd2', name: 'Professional Tax', amount: '2,400', type: 'Fixed' },
            ]
        },
        settings: {
            showPercentageColumn: true,
            showMonthlyColumn: true,
            showExemptTags: true,
            highlightBasicRule: true,
            includeEmployerContribution: true,
            showDisclaimer: true
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

    const toggleField = (field: keyof HeaderConfig['candidateFields']) => {
        onChange({
            ...config,
            candidateFields: { ...config.candidateFields, [field]: !config.candidateFields[field] }
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
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Branding</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" checked={config.showLogo} onChange={e => onChange({ ...config, showLogo: e.target.checked })} className="rounded text-purple-600 focus:ring-purple-500" />
                                <span className="text-sm font-medium text-slate-700">Show Company Logo</span>
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

                    {/* Candidate Fields */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Candidate Details</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.candidateFields.name} onChange={() => toggleField('name')} className="rounded text-purple-600 focus:ring-purple-500" /> Candidate Name
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.candidateFields.designation} onChange={() => toggleField('designation')} className="rounded text-purple-600 focus:ring-purple-500" /> Designation
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.candidateFields.location} onChange={() => toggleField('location')} className="rounded text-purple-600 focus:ring-purple-500" /> Location
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.candidateFields.doj} onChange={() => toggleField('doj')} className="rounded text-purple-600 focus:ring-purple-500" /> DOJ
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

const AddComponentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    section: 'earnings' | 'retirals' | 'reimbursements' | 'deductions' | null;
    onAdd: (items: ComponentItem[]) => void
}> = ({ isOpen, onClose, section, onAdd }) => {
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) setSelected([]);
    }, [isOpen]);

    if (!isOpen || !section) return null;

    const options = {
        earnings: ['Basic Salary', 'House Rent Allowance', 'Special Allowance', 'Conveyance Allowance', 'Medical Allowance', 'LTA', 'Variable Pay', 'Performance Bonus'],
        retirals: ['Employer PF Contribution', 'Gratuity', 'Group Medical Insurance', 'Group Accidental Insurance', 'NPS (Employer)'],
        reimbursements: ['Telephone & Internet', 'Books & Periodicals', 'Fuel Reimbursement', 'Driver Salary', 'Professional Development', 'Food Coupons'],
        deductions: ['Employee PF Contribution', 'Professional Tax', 'Income Tax (TDS)', 'Labour Welfare Fund']
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
            type: 'Fixed'
        }));
        onAdd(newItems);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col max-h-[80vh]">
                <h3 className="font-bold text-slate-800 mb-4 capitalize">Add {section} Component</h3>
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

const SalaryAnnexureTemplate: React.FC = () => {
    const [view, setView] = useState<'LIST' | 'EDITOR' | 'VIEW'>('LIST');
    const [activeTab, setActiveTab] = useState<'EDITOR' | 'PREVIEW'>('EDITOR');

    // Persist templates in localStorage
    const [templates, setTemplates] = useState<AnnexureTemplate[]>(() => {
        const saved = localStorage.getItem('collab_annexure_templates');
        return saved ? JSON.parse(saved) : MOCK_ANNEXURE_TEMPLATES;
    });

    useEffect(() => {
        localStorage.setItem('collab_annexure_templates', JSON.stringify(templates));
    }, [templates]);

    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    // Editor State
    const [templateName, setTemplateName] = useState('');
    const [sections, setSections] = useState<AnnexureTemplate['sections']>({ earnings: [], retirals: [], reimbursements: [], deductions: [] });
    const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(MOCK_ANNEXURE_TEMPLATES[0].headerConfig);
    const [settings, setSettings] = useState<AnnexureTemplateSettings>(MOCK_ANNEXURE_TEMPLATES[0].settings);

    // Modal States
    const [headerConfigOpen, setHeaderConfigOpen] = useState(false);
    const [addComponentModal, setAddComponentModal] = useState<{ isOpen: boolean; section: 'earnings' | 'retirals' | 'reimbursements' | 'deductions' | null }>({ isOpen: false, section: null });
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleCreate = () => {
        setEditingTemplateId(null);
        setTemplateName('');
        setSections({ earnings: [], retirals: [], reimbursements: [], deductions: [] });
        setSettings(MOCK_ANNEXURE_TEMPLATES[0].settings);
        setHeaderConfig(MOCK_ANNEXURE_TEMPLATES[0].headerConfig);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleEdit = (t: AnnexureTemplate) => {
        setEditingTemplateId(t.id);
        setTemplateName(t.name);
        setSections(t.sections);
        setSettings(t.settings);
        setHeaderConfig(t.headerConfig);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleView = (t: AnnexureTemplate) => {
        handleEdit(t);
        setView('VIEW');
    };

    const handleSave = (status: 'Published' | 'Draft') => {
        if (!templateName.trim()) {
            setValidationError('Template Name is required');
            return;
        }
        if (sections.earnings.length === 0) {
            setValidationError('At least one earning component is required.');
            return;
        }

        const newTemplate: AnnexureTemplate = {
            id: editingTemplateId || Date.now().toString(),
            name: templateName,
            status,
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
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Briefcase size={20} /></div>
                    <div>
                        <h3 className="text-sm font-bold text-purple-900">Default Salary Annexure Template</h3>
                        <p className="text-xs text-purple-700 mt-1">This is the global default Salary Annexure (Offer Letter CTC Breakup) template. All companies will use this in offer letters unless they create a custom version.</p>
                    </div>
                    <button onClick={handleCreate} className="ml-auto px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Create Annexure
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Template Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Modified</th>
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
                                    <td className="px-6 py-4">{t.lastModified}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleView(t); }} className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-sky-600 rounded"><Eye size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="p-1.5 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded"><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-center text-xs text-slate-400 mt-4">
                    1,156 companies are currently using this default annexure template · Last published: 03 Dec 2025
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
                        <div className="text-xs text-slate-500 font-medium">
                            Salary Annexure
                        </div>
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
                            <button onClick={() => handleSave('Published')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2" title="Will update annexure template for all companies using default">
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
                                <div className="p-2 bg-slate-50 border-b border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Annexure Canvas</div>

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
                                            {headerConfig.candidateFields.name && <div>Candidate Name: <span className="font-semibold text-slate-800">Priya Sharma</span></div>}
                                            {headerConfig.candidateFields.designation && <div>Designation: <span className="font-semibold text-slate-800">Software Engineer</span></div>}
                                            {headerConfig.candidateFields.location && <div>Location: <span className="font-semibold text-slate-800">Bangalore</span></div>}
                                            {headerConfig.candidateFields.doj && <div>DOJ: <span className="font-semibold text-slate-800">DD/MM/YYYY</span></div>}
                                        </div>
                                    </div>

                                    {/* Annual CTC Table Sections */}
                                    <div className="space-y-6">

                                        {/* A. Earnings */}
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 text-xs font-bold uppercase text-emerald-700">A. Annual Earnings</div>
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
                                                        + Add Earnings Component
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* B. Retirals */}
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-sky-50 px-4 py-2 border-b border-sky-100 text-xs font-bold uppercase text-sky-700">B. Retirals & Benefits</div>
                                            <div className="p-4 space-y-2">
                                                {sections.retirals.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm group border-b border-slate-50 pb-2 last:border-0">
                                                        <span className="text-slate-600">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">₹ {item.amount}</span>
                                                            {!isReadOnly && <X size={14} onClick={() => removeComponent('retirals', item.id)} className="text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100" />}
                                                        </div>
                                                    </div>
                                                ))}
                                                {!isReadOnly && (
                                                    <button onClick={() => setAddComponentModal({ isOpen: true, section: 'retirals' })} className="w-full py-2 border border-dashed border-sky-200 rounded text-xs font-medium text-sky-600 hover:bg-sky-50 mt-2">
                                                        + Add Retiral / Benefit
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* C. Reimbursements */}
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 text-xs font-bold uppercase text-amber-700">C. Reimbursements</div>
                                            <div className="p-4 space-y-2">
                                                {sections.reimbursements.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm group border-b border-slate-50 pb-2 last:border-0">
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

                                        {/* D. Deductions */}
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-rose-50 px-4 py-2 border-b border-rose-100 text-xs font-bold uppercase text-rose-700">D. Standard Deductions</div>
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
                                                        + Add Deduction
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Footer Section */}
                                    <div className="mt-8 pt-8 border-t border-slate-200">
                                        <p className="text-xs text-slate-500 italic text-center">Note: TDS will be deducted as per prevailing Income Tax rules</p>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Right: Settings Sidebar */}
                        <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                            <h3 className="font-bold text-slate-800 mb-6">Settings</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Table Columns</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Show % of CTC</span>
                                            <div onClick={() => setSettings({ ...settings, showPercentageColumn: !settings.showPercentageColumn })} className={`w-9 h-5 rounded-full relative transition-colors ${settings.showPercentageColumn ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showPercentageColumn ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Show Monthly</span>
                                            <div onClick={() => setSettings({ ...settings, showMonthlyColumn: !settings.showMonthlyColumn })} className={`w-9 h-5 rounded-full relative transition-colors ${settings.showMonthlyColumn ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showMonthlyColumn ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Display Options</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Show Exempt Tags</span>
                                            <div onClick={() => setSettings({ ...settings, showExemptTags: !settings.showExemptTags })} className={`w-9 h-5 rounded-full relative transition-colors ${settings.showExemptTags ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showExemptTags ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Highlight Basic ≥50%</span>
                                            <div onClick={() => setSettings({ ...settings, highlightBasicRule: !settings.highlightBasicRule })} className={`w-9 h-5 rounded-full relative transition-colors ${settings.highlightBasicRule ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.highlightBasicRule ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Show Disclaimer</span>
                                            <div onClick={() => setSettings({ ...settings, showDisclaimer: !settings.showDisclaimer })} className={`w-9 h-5 rounded-full relative transition-colors ${settings.showDisclaimer ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showDisclaimer ? 'translate-x-4' : ''}`} />
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

                            {/* Header */}
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

                            {/* Candidate Details */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm border-b border-slate-200 pb-6">
                                {headerConfig.candidateFields.name && <div className="flex"><span className="w-36 font-bold text-slate-600">Candidate Name</span><span>: Priya Sharma</span></div>}
                                {headerConfig.candidateFields.designation && <div className="flex"><span className="w-36 font-bold text-slate-600">Designation</span><span>: Software Engineer</span></div>}
                                {headerConfig.candidateFields.location && <div className="flex"><span className="w-36 font-bold text-slate-600">Location</span><span>: Bangalore</span></div>}
                                {headerConfig.candidateFields.doj && <div className="flex"><span className="w-36 font-bold text-slate-600">Date of Joining</span><span>: 15 Dec 2025</span></div>}
                            </div>

                            {/* CTC Table */}
                            <table className="w-full border-collapse border border-slate-300 text-sm mb-8">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="border border-slate-300 p-2 text-left">Components</th>
                                        {settings.showMonthlyColumn && <th className="border border-slate-300 p-2 text-right">Monthly (₹)</th>}
                                        <th className="border border-slate-300 p-2 text-right">Annual (₹)</th>
                                        {settings.showPercentageColumn && <th className="border border-slate-300 p-2 text-right">% of CTC</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Earnings */}
                                    <tr className="bg-emerald-50"><td colSpan={4} className="border border-slate-300 p-2 font-bold text-emerald-800">A. Earnings</td></tr>
                                    {sections.earnings.map((item, i) => (
                                        <tr key={`e-${i}`}>
                                            <td className="border border-slate-300 p-2">
                                                {item.name}
                                                {settings.showExemptTags && (item.name.includes('HRA') || item.name.includes('Conveyance') || item.name.includes('LTA')) && <span className="ml-2 text-[10px] bg-slate-100 px-1 rounded text-slate-500">Exempt</span>}
                                                {settings.highlightBasicRule && item.name.includes('Basic') && <span className="ml-2 text-emerald-600 text-xs">✔ ≥50%</span>}
                                            </td>
                                            {settings.showMonthlyColumn && <td className="border border-slate-300 p-2 text-right">{formatCurrency(parseAmount(item.amount) / 12)}</td>}
                                            <td className="border border-slate-300 p-2 text-right">{item.amount}</td>
                                            {settings.showPercentageColumn && <td className="border border-slate-300 p-2 text-right text-slate-500">{((parseAmount(item.amount) / 1850000) * 100).toFixed(1)}%</td>}
                                        </tr>
                                    ))}

                                    {/* Retirals */}
                                    <tr className="bg-sky-50"><td colSpan={4} className="border border-slate-300 p-2 font-bold text-sky-800">B. Retirals & Benefits</td></tr>
                                    {sections.retirals.map((item, i) => (
                                        <tr key={`b-${i}`}>
                                            <td className="border border-slate-300 p-2">{item.name}</td>
                                            {settings.showMonthlyColumn && <td className="border border-slate-300 p-2 text-right">{formatCurrency(parseAmount(item.amount) / 12)}</td>}
                                            <td className="border border-slate-300 p-2 text-right">{item.amount}</td>
                                            {settings.showPercentageColumn && <td className="border border-slate-300 p-2 text-right text-slate-500">{((parseAmount(item.amount) / 1850000) * 100).toFixed(1)}%</td>}
                                        </tr>
                                    ))}

                                    {/* Reimbursements */}
                                    <tr className="bg-amber-50"><td colSpan={4} className="border border-slate-300 p-2 font-bold text-amber-800">C. Reimbursements</td></tr>
                                    {sections.reimbursements.map((item, i) => (
                                        <tr key={`r-${i}`}>
                                            <td className="border border-slate-300 p-2">{item.name}</td>
                                            {settings.showMonthlyColumn && <td className="border border-slate-300 p-2 text-right">{formatCurrency(parseAmount(item.amount) / 12)}</td>}
                                            <td className="border border-slate-300 p-2 text-right">{item.amount}</td>
                                            {settings.showPercentageColumn && <td className="border border-slate-300 p-2 text-right text-slate-500">{((parseAmount(item.amount) / 1850000) * 100).toFixed(1)}%</td>}
                                        </tr>
                                    ))}

                                    {/* Total CTC */}
                                    <tr className="bg-slate-800 text-white font-bold">
                                        <td className="border border-slate-300 p-3">Total Cost to Company (A+B+C)</td>
                                        {settings.showMonthlyColumn && <td className="border border-slate-300 p-3 text-right">₹ 1,54,166</td>}
                                        <td className="border border-slate-300 p-3 text-right text-lg">₹ 18,50,000</td>
                                        {settings.showPercentageColumn && <td className="border border-slate-300 p-3 text-right">100%</td>}
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mb-8">
                                <p className="font-bold text-sm text-slate-800 mb-1">Amount in Words:</p>
                                <p className="text-sm text-slate-600 italic">Rupees Eighteen Lakh Fifty Thousand Only</p>
                            </div>

                            {/* Deductions (Informational) */}
                            <div className="mb-8">
                                <h4 className="font-bold text-sm mb-2 uppercase text-rose-700">D. Estimated Deductions (From Monthly Salary)</h4>
                                <table className="w-full border-collapse border border-slate-300 text-sm">
                                    <tbody>
                                        {sections.deductions.map((item, i) => (
                                            <tr key={`d-${i}`}>
                                                <td className="border border-slate-300 p-2 w-[70%]">{item.name}</td>
                                                <td className="border border-slate-300 p-2 text-right text-rose-600">₹ {item.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary & Disclaimer */}
                            <div className="mt-auto pt-8 border-t border-slate-300">
                                <div className="bg-slate-50 p-4 border border-slate-200 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700">Approximate Monthly Take Home</span>
                                        <span className="text-lg font-bold text-slate-900">₹ 1,28,000</span>
                                    </div>
                                    {settings.showDisclaimer && <p className="text-xs text-slate-500 italic">* TDS will be deducted as per prevailing Income Tax rules. Professional Tax is subject to state laws.</p>}
                                </div>
                                <div className="mt-8 flex justify-between items-end">
                                    <div className="border-t border-slate-400 pt-2 w-48">
                                        <p className="text-sm font-bold text-slate-800">Authorized Signatory</p>
                                    </div>
                                    <div className="border-t border-slate-400 pt-2 w-48 text-right">
                                        <p className="text-sm font-bold text-slate-800">Candidate Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <HeaderConfigModal isOpen={headerConfigOpen} onClose={() => setHeaderConfigOpen(false)} config={headerConfig} onChange={setHeaderConfig} />
            <AddComponentModal
                isOpen={addComponentModal.isOpen}
                onClose={() => setAddComponentModal({ isOpen: false, section: null })}
                section={addComponentModal.section}
                onAdd={addComponent}
            />
        </div>
    );
};

export default SalaryAnnexureTemplate;
