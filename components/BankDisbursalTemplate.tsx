
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Eye,
    Trash2,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    FileSpreadsheet,
    GripVertical,
    Download,
    Settings,
    Type,
    Database
} from 'lucide-react';

// --- Types ---

interface BankColumn {
    id: string;
    type: 'System' | 'Custom';
    fieldId?: string; // System field mapping ID
    customValue?: string; // Fixed value for custom columns
    headerName: string; // Output column header
    sampleValue: string;
    included: boolean;
}

interface BankTemplateSettings {
    fileType: 'Excel' | 'CSV' | 'TXT';
    fileNamePattern: string;
    narrationTemplate: string;
    amountFormat: '2 Decimals' | 'No Decimals';
    dateFormat: string;
    includeHeaderRow: boolean;
    leadingZeros: boolean;
    testMode: boolean;
    bankPreset: string; // e.g., 'Custom', 'HDFC', 'ICICI'
}

interface BankTemplate {
    id: string;
    name: string;
    status: 'Published' | 'Draft';
    isActive: boolean;
    lastModified: string;
    lastUpdatedBy: string;
    createdBy: string;
    columns: BankColumn[];
    settings: BankTemplateSettings;
}

// --- Mock Data ---

const SYSTEM_FIELDS = [
    { id: 'sr_no', label: 'Sr. No.', sample: '1' },
    { id: 'emp_name', label: 'Employee Name', sample: 'Priya Sharma' },
    { id: 'emp_id', label: 'Employee ID', sample: 'TF00912' },
    { id: 'bank_acc', label: 'Bank Account Number', sample: '000123456789' },
    { id: 'ifsc', label: 'IFSC Code', sample: 'HDFC0001234' },
    { id: 'bank_name', label: 'Bank Name', sample: 'HDFC Bank' },
    { id: 'net_pay', label: 'Net Salary Amount', sample: '128400.00' },
    { id: 'narration', label: 'Payment Reference / Narration', sample: 'Salary - Nov 2025' },
    { id: 'email', label: 'Employee Email', sample: 'priya@techflow.com' },
    { id: 'mobile', label: 'Employee Mobile', sample: '9876543210' },
    { id: 'uan', label: 'UAN', sample: '100900200300' },
    { id: 'pan', label: 'PAN', sample: 'ABCDE1234F' },
    { id: 'credit_date', label: 'Credit Date', sample: '30112025' },
    { id: 'debit_acc', label: 'Debit Account Number', sample: '999888777666' },
    { id: 'debit_ifsc', label: 'Debit Account IFSC', sample: 'HDFC0000240' },
    { id: 'trans_type', label: 'Transaction Type', sample: 'NEFT' },
    { id: 'cust_ref', label: 'Customer Reference', sample: 'SALNOV25001' },
    { id: 'amt_words', label: 'Amount in Words', sample: 'One Lakh Twenty Eight Thousand...' },
];

const DEFAULT_COLUMNS: BankColumn[] = SYSTEM_FIELDS.slice(0, 8).map(f => ({
    id: f.id,
    type: 'System',
    fieldId: f.id,
    headerName: f.label,
    sampleValue: f.sample,
    included: true
}));

const MOCK_BANK_TEMPLATES: BankTemplate[] = [
    {
        id: '1',
        name: 'Default Universal Format',
        status: 'Published',
        isActive: true,
        lastModified: '03 Dec 2025',
        lastUpdatedBy: 'Admin',
        createdBy: 'Admin',
        columns: DEFAULT_COLUMNS,
        settings: {
            fileType: 'Excel',
            fileNamePattern: '{{company}}_{{month}}_{{year}}_Salary',
            narrationTemplate: 'Salary Credit - {{month}} {{year}}',
            amountFormat: '2 Decimals',
            dateFormat: 'DDMMYYYY',
            includeHeaderRow: true,
            leadingZeros: true,
            testMode: false,
            bankPreset: 'Custom'
        }
    }
];

// --- Sub-Components ---

const AddBankColumnModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (cols: BankColumn[]) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!isOpen) return null;

    const toggleFieldSelection = (id: string) => {
        setSelectedFieldIds(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const handleAdd = () => {
        const newCols: BankColumn[] = selectedFieldIds.map(fid => {
            const field = SYSTEM_FIELDS.find(f => f.id === fid);
            return {
                id: `${fid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'System',
                fieldId: fid,
                headerName: field?.label || fid,
                sampleValue: field?.sample || '',
                included: true
            };
        });

        if (newCols.length > 0) {
            onAdd(newCols);
        }
        onClose();
        setSelectedFieldIds([]);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-visible flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm">Add New Column</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-left">Select Fields</label>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white hover:border-purple-300 transition-colors flex justify-between items-center cursor-pointer min-h-[42px]"
                        >
                            <div className="flex flex-wrap gap-1 items-center">
                                {selectedFieldIds.length === 0 ? (
                                    <span className="text-slate-400">Select multiple columns...</span>
                                ) : (
                                    <span className="text-slate-800 font-medium">
                                        {selectedFieldIds.length === 1
                                            ? SYSTEM_FIELDS.find(f => f.id === selectedFieldIds[0])?.label
                                            : `${selectedFieldIds.length} fields selected`}
                                    </span>
                                )}
                            </div>
                            <Plus size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-45' : ''}`} />
                        </div>

                        {/* Custom Dropdown Content */}
                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-[75]" onClick={() => setIsDropdownOpen(false)} />
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-[80] overflow-y-auto max-h-[250px] py-1 animate-in zoom-in-95 duration-100">
                                    {SYSTEM_FIELDS.map(f => (
                                        <div
                                            key={f.id}
                                            onClick={() => toggleFieldSelection(f.id)}
                                            className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 cursor-pointer group"
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFieldIds.includes(f.id) ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300 group-hover:border-purple-400'}`}>
                                                {selectedFieldIds.includes(f.id) && <Plus size={12} className="text-white rotate-45" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm ${selectedFieldIds.includes(f.id) ? 'text-purple-700 font-medium' : 'text-slate-700'}`}>{f.label}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">e.g. {f.sample}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg text-sm font-medium transition-colors">Cancel</button>
                    <button
                        onClick={handleAdd}
                        disabled={selectedFieldIds.length === 0}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Add Column{selectedFieldIds.length > 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const BankDisbursalTemplate: React.FC = () => {
    const [view, setView] = useState<'LIST' | 'EDITOR' | 'VIEW'>('LIST');
    const [activeTab, setActiveTab] = useState<'EDITOR' | 'PREVIEW'>('EDITOR');

    const handleToggleActive = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    };

    // Persist templates in localStorage
    const [templates, setTemplates] = useState<BankTemplate[]>(() => {
        const saved = localStorage.getItem('collab_bank_templates');
        return saved ? JSON.parse(saved) : MOCK_BANK_TEMPLATES;
    });

    useEffect(() => {
        localStorage.setItem('collab_bank_templates', JSON.stringify(templates));
    }, [templates]);

    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    // Editor State
    const [templateName, setTemplateName] = useState('');
    const [columns, setColumns] = useState<BankColumn[]>(DEFAULT_COLUMNS);
    const [settings, setSettings] = useState<BankTemplateSettings>(MOCK_BANK_TEMPLATES[0].settings);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Drag State
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Modal State
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

    const handleCreate = () => {
        setEditingTemplateId(null);
        setTemplateName('');
        setColumns(DEFAULT_COLUMNS);
        setSettings(MOCK_BANK_TEMPLATES[0].settings);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleEdit = (t: BankTemplate) => {
        setEditingTemplateId(t.id);
        setTemplateName(t.name);
        setColumns(t.columns);
        setSettings(t.settings);
        setActiveTab('EDITOR');
        setView('EDITOR');
    };

    const handleView = (t: BankTemplate) => {
        handleEdit(t);
        setView('VIEW');
    };

    const handleSave = (status: 'Published' | 'Draft') => {
        if (!templateName.trim()) {
            setValidationError('Template Name is required');
            return;
        }

        const includedCols = columns.filter(c => c.included);
        if (includedCols.length === 0) {
            setValidationError('At least one column must be included.');
            return;
        }

        const existingTemplate = editingTemplateId ? templates.find(t => t.id === editingTemplateId) : null;

        const newTemplate: BankTemplate = {
            id: editingTemplateId || Date.now().toString(),
            name: templateName,
            status,
            isActive: existingTemplate?.isActive ?? true,
            lastModified: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            lastUpdatedBy: 'Admin',
            createdBy: existingTemplate?.createdBy || 'Admin',
            columns,
            settings
        };

        if (editingTemplateId) {
            setTemplates(prev => prev.map(t => t.id === editingTemplateId ? newTemplate : t));
        } else {
            setTemplates(prev => [...prev, newTemplate]);
        }
        setView('LIST');
        setValidationError(null);
    };

    const toggleColumn = (id: string) => {
        setColumns(prev => prev.map(c => c.id === id ? { ...c, included: !c.included } : c));
    };

    const updateHeaderName = (id: string, name: string) => {
        setColumns(prev => prev.map(c => c.id === id ? { ...c, headerName: name } : c));
    };

    const handleAddColumn = (newCols: BankColumn[]) => {
        setColumns(prev => [...prev, ...newCols]);
    };

    const handleDeleteColumn = (id: string) => {
        setColumns(prev => prev.filter(c => c.id !== id));
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedItemIndex === null) return;
        if (draggedItemIndex === dropIndex) return;

        const newColumns = [...columns];
        const [draggedItem] = newColumns.splice(draggedItemIndex, 1);
        newColumns.splice(dropIndex, 0, draggedItem);

        setColumns(newColumns);
        setDraggedItemIndex(null);
    };

    // --- RENDER LIST ---
    if (view === 'LIST') {
        return (
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Bank Disbursal Formats</h2>
                    </div>
                    <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Create New Bank Format
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Template Name</th>
                                <th className="px-6 py-4">Format</th>
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
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
                                            <FileSpreadsheet size={12} /> {t.settings.fileType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${t.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {t.status === 'Published' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700">{t.createdBy}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 font-medium">{t.lastModified}</span>
                                            <span className="text-[10px] text-slate-400">by {t.lastUpdatedBy}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-4">
                                            <div
                                                onClick={(e) => handleToggleActive(t.id, e)}
                                                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${t.isActive ? 'bg-purple-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${t.isActive ? 'translate-x-5' : ''}`} />
                                            </div>
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
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

                <div className="text-center text-xs text-slate-400 mt-4">
                    1,156 companies are currently using this default disbursal format · Last published: 03 Dec 2025 · Supports HDFC, ICICI, Axis, SBI, Yes Bank
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
                            Bank Format
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
                            <Edit2 size={16} /> Edit Format
                        </button>
                    ) : (
                        <>
                            <button onClick={() => setView('LIST')} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                            <button onClick={() => handleSave('Draft')} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Save as Draft</button>
                            <button onClick={() => handleSave('Published')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2" title="Instantly updates format for all companies using default">
                                <Save size={16} /> Save
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-200 bg-white shrink-0">
                <div className="flex gap-6">
                    <button onClick={() => setActiveTab('EDITOR')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'EDITOR' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}>Format Builder</button>
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
                        {/* Column Mapper (Full Width) */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">Column Mapping</h3>
                                        <p className="text-xs text-slate-500">Configure and reorder columns for the export file</p>
                                    </div>
                                    <div className="flex gap-3">
                                        {!isReadOnly && (
                                            <button
                                                onClick={() => setIsAddColumnModalOpen(true)}
                                                className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <Plus size={14} /> Add Column
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-6 py-2 border-b border-slate-100 text-xs font-bold uppercase text-slate-400 grid grid-cols-[40px_1fr_1fr_1fr_auto] gap-4">
                                    <div>#</div>
                                    <div>Column Header Name</div>
                                    <div>Mapped To</div>
                                    <div>Sample Data</div>
                                    <div></div>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {columns.map((col, idx) => (
                                        <div
                                            key={col.id}
                                            draggable={!isReadOnly}
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragOver={(e) => handleDragOver(e, idx)}
                                            onDrop={(e) => handleDrop(e, idx)}
                                            className={`grid grid-cols-[40px_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-3 transition-colors ${!col.included ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'} ${draggedItemIndex === idx ? 'opacity-50 border-2 border-purple-300' : ''}`}
                                        >

                                            <div className="text-xs font-mono text-slate-400">{idx + 1}</div>

                                            <div>
                                                {isReadOnly ? (
                                                    <span className={`text-sm font-medium ${col.included ? 'text-slate-700' : 'text-slate-400'}`}>{col.headerName}</span>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={col.headerName}
                                                        disabled={!col.included}
                                                        onChange={(e) => updateHeaderName(col.id, e.target.value)}
                                                        className="w-full px-2 py-1 border border-transparent hover:border-slate-200 focus:border-purple-500 rounded text-sm font-medium text-slate-800 bg-transparent focus:bg-white transition-colors disabled:text-slate-400"
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                {col.type === 'System' ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Database size={12} className="text-slate-400" />
                                                        {SYSTEM_FIELDS.find(f => f.id === col.fieldId)?.label || 'Unknown'}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit">
                                                        <Type size={12} />
                                                        Fixed: {col.customValue}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit truncate max-w-full" title={col.sampleValue}>
                                                    {col.sampleValue}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!isReadOnly && (
                                                    <GripVertical size={16} className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500" />
                                                )}
                                                {!isReadOnly && (
                                                    <Trash2 size={14} onClick={() => handleDeleteColumn(col.id)} className="text-slate-300 cursor-pointer hover:text-rose-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* PREVIEW TAB */
                    <div className="flex-1 bg-slate-100 p-8 flex flex-col overflow-hidden">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><FileSpreadsheet size={20} /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">File Preview</h3>
                                        <p className="text-xs text-slate-500">{settings.fileNamePattern.replace('{{company}}', 'TechFlow').replace('{{month}}', 'Nov').replace('{{year}}', '2025')}.{settings.fileType.toLowerCase()}</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded shadow-sm hover:bg-slate-50 flex items-center gap-2">
                                    <Download size={14} /> Download Sample
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    {settings.includeHeaderRow && (
                                        <thead>
                                            <tr className="bg-slate-100">
                                                {columns.filter(c => c.included).map((col) => (
                                                    <th key={col.id} className="border border-slate-200 px-4 py-3 font-semibold text-slate-600 whitespace-nowrap min-w-[120px]">
                                                        {col.headerName}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                    )}
                                    <tbody>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((rowNum) => (
                                            <tr key={rowNum} className="hover:bg-slate-50 transition-colors">
                                                {columns.filter(c => c.included).map((col) => {
                                                    let cellValue = col.sampleValue;

                                                    if (col.type === 'Custom') {
                                                        cellValue = col.customValue || '';
                                                    } else {
                                                        // Simulate row variations for System Fields
                                                        if (col.fieldId === 'sr_no') cellValue = rowNum.toString();
                                                        if (col.fieldId === 'emp_name' && rowNum === 2) cellValue = 'Arjun Mehta';
                                                        if (col.fieldId === 'net_pay' && rowNum === 2) cellValue = '85400.00';
                                                        if (col.fieldId === 'bank_acc' && rowNum === 2) cellValue = '000987654321';
                                                    }

                                                    return (
                                                        <td key={col.id} className="border border-slate-200 px-4 py-2 text-slate-700 whitespace-nowrap">
                                                            {cellValue}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {settings.testMode && (
                                <div className="bg-amber-50 text-amber-800 text-xs font-bold text-center py-2 border-t border-amber-100">
                                    TEST PAYMENT - DO NOT PROCESS
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Column Modal */}
            <AddBankColumnModal
                isOpen={isAddColumnModalOpen}
                onClose={() => setIsAddColumnModalOpen(false)}
                onAdd={handleAddColumn}
            />
        </div>
    );
};

export default BankDisbursalTemplate;
