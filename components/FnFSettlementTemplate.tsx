
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

interface FnFTemplateSettings {
  currency: string;
  dateFormat: string;
  showGratuityBreakdown: boolean;
  showYTD: boolean;
  includeForm16: boolean;
  passwordProtect: boolean;
}

interface FnFHeaderConfig {
  logoPosition: 'Left' | 'Center' | 'Right';
  showLogo: boolean;
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  documentTitle: string;
  employeeFields: {
    name: boolean;
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
  lastModified: string;
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
    lastModified: '03 Dec 2025',
    headerConfig: {
        logoPosition: 'Left',
        showLogo: true,
        showCompanyName: true,
        showCompanyAddress: true,
        documentTitle: 'Full and Final Settlement Statement',
        employeeFields: { name: true, id: true, designation: true, doj: true, dor: true, pan: true, uan: true }
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
      passwordProtect: true
    }
  }
];

// --- Sub-Components ---

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
                                 <input type="checkbox" checked={config.showLogo} onChange={e => onChange({...config, showLogo: e.target.checked})} className="rounded text-purple-600 focus:ring-purple-500" />
                                 <span className="text-sm font-medium text-slate-700">Show Company Logo</span>
                             </label>
                             <div className="grid grid-cols-2 gap-3">
                                 <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={config.showCompanyName} onChange={e => onChange({...config, showCompanyName: e.target.checked})} className="rounded text-purple-600 focus:ring-purple-500" />
                                    <span className="text-sm font-medium text-slate-700">Company Name</span>
                                 </label>
                                 <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={config.showCompanyAddress} onChange={e => onChange({...config, showCompanyAddress: e.target.checked})} className="rounded text-purple-600 focus:ring-purple-500" />
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
                                        onClick={() => onChange({...config, logoPosition: pos as any})}
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
                            onChange={e => onChange({...config, documentTitle: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    {/* Employee Fields */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Employee Details</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.name} onChange={() => toggleField('name')} className="rounded text-purple-600 focus:ring-purple-500" /> Name
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.id} onChange={() => toggleField('id')} className="rounded text-purple-600 focus:ring-purple-500" /> Employee ID
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.designation} onChange={() => toggleField('designation')} className="rounded text-purple-600 focus:ring-purple-500" /> Designation
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.doj} onChange={() => toggleField('doj')} className="rounded text-purple-600 focus:ring-purple-500" /> DOJ
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.dor} onChange={() => toggleField('dor')} className="rounded text-purple-600 focus:ring-purple-500" /> DOR (Relieving)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={config.employeeFields.pan} onChange={() => toggleField('pan')} className="rounded text-purple-600 focus:ring-purple-500" /> PAN
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

const FnFSettlementTemplate: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'EDITOR' | 'VIEW'>('LIST');
  const [activeTab, setActiveTab] = useState<'EDITOR' | 'PREVIEW'>('EDITOR');
  
  // Persist templates in localStorage
  const [templates, setTemplates] = useState<FnFTemplate[]>(() => {
    const saved = localStorage.getItem('collab_fnf_templates');
    return saved ? JSON.parse(saved) : MOCK_FNF_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem('collab_fnf_templates', JSON.stringify(templates));
  }, [templates]);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Editor State
  const [templateName, setTemplateName] = useState('');
  const [sections, setSections] = useState<FnFTemplate['sections']>({ earnings: [], deductions: [] });
  const [headerConfig, setHeaderConfig] = useState<FnFHeaderConfig>(MOCK_FNF_TEMPLATES[0].headerConfig);
  const [settings, setSettings] = useState<FnFTemplateSettings>(MOCK_FNF_TEMPLATES[0].settings);

  // Modal States
  const [headerConfigOpen, setHeaderConfigOpen] = useState(false);
  const [addComponentModal, setAddComponentModal] = useState<{ isOpen: boolean; section: 'earnings' | 'deductions' | null }>({ isOpen: false, section: null });
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const handleSave = (status: 'Published' | 'Draft') => {
      if (!templateName.trim()) {
          setValidationError('Template Name is required');
          return;
      }
      if (sections.earnings.length === 0) {
          setValidationError('At least one earning/dues component is required.');
          return;
      }

      const newTemplate: FnFTemplate = {
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
                 <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Briefcase size={20}/></div>
                 <div>
                     <h3 className="text-sm font-bold text-purple-900">Default Full & Final Settlement Template</h3>
                     <p className="text-xs text-purple-700 mt-1">This is the global default Full & Final Settlement template. All companies will use this for F&F unless they create a custom version.</p>
                 </div>
                 <button onClick={handleCreate} className="ml-auto px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-sm flex items-center gap-2">
                     <Plus size={16} /> Create New Version
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
                                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                        t.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {t.status === 'Published' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{t.lastModified}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); handleView(t); }} className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-sky-600 rounded"><Eye size={16}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="p-1.5 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded"><Edit2 size={16}/></button>
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
                   <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft size={20}/></button>
                   <div>
                       <div className="text-xs text-slate-500 flex gap-2 items-center">
                           <span>F&F Template</span> <span className="text-slate-300">/</span> <span className="uppercase font-bold text-xs text-purple-600">{view} MODE</span>
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
                           <button onClick={() => handleSave('Published')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2" title="Will instantly update F&F template for all companies using default">
                               <Save size={16} /> Publish Globally
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
                                <div className="p-2 bg-slate-50 border-b border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">F&F Settlement Canvas</div>
                                
                                <div className="p-8 space-y-8">
                                    {/* Header Block */}
                                    <div className={`relative border border-slate-100 rounded-xl p-6 transition-all group ${!isReadOnly ? 'hover:border-purple-200 hover:shadow-sm' : ''}`}>
                                        {!isReadOnly && <button onClick={() => setHeaderConfigOpen(true)} className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-slate-200 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-purple-600"><Settings size={14}/></button>}
                                        
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
                                            {headerConfig.employeeFields.name && <div>Name: <span className="font-semibold text-slate-800">Employee Name</span></div>}
                                            {headerConfig.employeeFields.id && <div>ID: <span className="font-semibold text-slate-800">EMP001</span></div>}
                                            {headerConfig.employeeFields.designation && <div>Designation: <span className="font-semibold text-slate-800">Designation</span></div>}
                                            {headerConfig.employeeFields.doj && <div>DOJ: <span className="font-semibold text-slate-800">DD/MM/YYYY</span></div>}
                                            {headerConfig.employeeFields.dor && <div>DOR (Relieving): <span className="font-semibold text-slate-800">DD/MM/YYYY</span></div>}
                                            {headerConfig.employeeFields.pan && <div>PAN: <span className="font-semibold text-slate-800">XXXXX1234X</span></div>}
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

                       {/* Right: Settings Sidebar */}
                       <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
                            <h3 className="font-bold text-slate-800 mb-6">Settings</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Global Options</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Gratuity Breakdown</span>
                                            <div onClick={() => setSettings({...settings, showGratuityBreakdown: !settings.showGratuityBreakdown})} className={`w-9 h-5 rounded-full relative transition-colors ${settings.showGratuityBreakdown ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.showGratuityBreakdown ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Include Form 16 Ref</span>
                                            <div onClick={() => setSettings({...settings, includeForm16: !settings.includeForm16})} className={`w-9 h-5 rounded-full relative transition-colors ${settings.includeForm16 ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.includeForm16 ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-sm text-slate-700">Password Protect PDF</span>
                                            <div onClick={() => setSettings({...settings, passwordProtect: !settings.passwordProtect})} className={`w-9 h-5 rounded-full relative transition-colors ${settings.passwordProtect ? 'bg-purple-600' : 'bg-slate-200'}`}>
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
                                       <ImageIcon size={32}/>
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
                           
                           {/* Employee Details - Arjun Mehta */}
                           <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm border-b border-slate-200 pb-6">
                               {headerConfig.employeeFields.name && <div className="flex"><span className="w-36 font-bold text-slate-600">Employee Name</span><span>: Arjun Mehta</span></div>}
                               {headerConfig.employeeFields.id && <div className="flex"><span className="w-36 font-bold text-slate-600">Employee ID</span><span>: TF00888</span></div>}
                               {headerConfig.employeeFields.designation && <div className="flex"><span className="w-36 font-bold text-slate-600">Designation</span><span>: Product Manager</span></div>}
                               {headerConfig.employeeFields.doj && <div className="flex"><span className="w-36 font-bold text-slate-600">Date of Joining</span><span>: 15 Mar 2022</span></div>}
                               {headerConfig.employeeFields.dor && <div className="flex"><span className="w-36 font-bold text-slate-600">Date of Relieving</span><span>: 30 Nov 2025</span></div>}
                               {headerConfig.employeeFields.pan && <div className="flex"><span className="w-36 font-bold text-slate-600">PAN</span><span>: ABCDE1234F</span></div>}
                               {headerConfig.employeeFields.uan && <div className="flex"><span className="w-36 font-bold text-slate-600">UAN</span><span>: 100900200300</span></div>}
                           </div>

                           {/* Earnings Table */}
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

                           {/* Deductions Table */}
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

                           {/* Net Pay */}
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

                           {/* Signature Blocks */}
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
               )}
           </div>

           {/* Modals */}
           <FnFHeaderConfigModal isOpen={headerConfigOpen} onClose={() => setHeaderConfigOpen(false)} config={headerConfig} onChange={setHeaderConfig} />
           <AddFnFComponentModal 
              isOpen={addComponentModal.isOpen} 
              onClose={() => setAddComponentModal({isOpen: false, section: null})} 
              section={addComponentModal.section}
              onAdd={addComponent} 
           />
      </div>
  );
};

export default FnFSettlementTemplate;
    