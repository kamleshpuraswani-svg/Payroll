import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    FileText,
    Download,
    Eye,
    Mail,
    RefreshCw,
    MoreHorizontal,
    CheckCircle,
    AlertTriangle,
    XCircle,
    File,
    FileBadge,
    Receipt,
    PenTool,
    MessageSquare,
    ChevronDown,
    X,
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    Calendar,
    User,
    Briefcase,
    ChevronRight,
    Loader2,
    Edit2,
    Check,
    Clock,
    Send,
    Type,
    Image as ImageIcon
} from 'lucide-react';

// --- Types ---

interface Note {
    id: string;
    text: string;
    author: string;
    timestamp: string;
    type: 'NOTE' | 'SYSTEM';
}

interface DocumentItem {
    id: string;
    employee_name: string;
    employee_id: string;
    type: 'Offer Letter' | 'Form 16' | 'Salary Revision' | 'F&F' | 'Reimbursement' | 'Bonus Letter' | 'Relieving Letter' | 'Investment Proof' | 'Probation Confirmation';
    title: string;
    generated_date: string;
    status: 'Sent' | 'Draft' | 'Pending Signature' | 'Expired' | 'Approved' | 'Viewed' | 'Downloaded' | 'Rejected' | 'Signed';
    last_activity?: string;
    generated_by: string;
    template_used: string;
    version: number;
    size: string;
    // Mock history for demo
    history?: Note[];
}

const MOCK_DOCUMENTS: DocumentItem[] = [
    {
        id: 'DOC-001',
        employee_name: 'Priya Sharma',
        employee_id: 'TF00912',
        type: 'Offer Letter',
        title: 'Appointment Letter & Annexure',
        generated_date: '12 Jan 2023',
        status: 'Viewed',
        last_activity: 'Viewed 15 Jan',
        generated_by: 'Kavita Sharma (HR)',
        template_used: 'Standard Offer 2023',
        version: 1,
        size: '1.2 MB',
        history: [
            { id: 'h1', text: 'Document Generated', author: 'System', timestamp: '12 Jan 2023, 10:00 AM', type: 'SYSTEM' },
            { id: 'h2', text: 'Sent to Priya Sharma', author: 'Kavita Sharma', timestamp: '12 Jan 2023, 10:05 AM', type: 'SYSTEM' },
        ]
    },
    {
        id: 'DOC-002',
        employee_name: 'Arjun Mehta',
        employee_id: 'AC04567',
        type: 'Form 16',
        title: 'Form 16 FY 2024-25',
        generated_date: '15 Jun 2025',
        status: 'Downloaded',
        last_activity: 'Downloaded yesterday',
        generated_by: 'System (Auto)',
        template_used: 'Tax Certificate v2',
        version: 1,
        size: '450 KB'
    },
    {
        id: 'DOC-003',
        employee_name: 'Neha Kapoor',
        employee_id: 'SU00234',
        type: 'Salary Revision',
        title: 'Increment Letter Q4 2025',
        generated_date: '01 Dec 2025',
        status: 'Draft',
        last_activity: 'Edited 2 mins ago',
        generated_by: 'Kavita Sharma (HR)',
        template_used: 'Increment Template A',
        version: 3,
        size: '180 KB'
    },
    {
        id: 'DOC-004',
        employee_name: 'Rohan Desai',
        employee_id: 'GL07890',
        type: 'F&F',
        title: 'F&F Settlement Nov 2025',
        generated_date: '30 Nov 2025',
        status: 'Pending Signature',
        last_activity: 'Sent for e-sign 1 day ago',
        generated_by: 'Rajesh Kumar (Finance)',
        template_used: 'Full & Final v4',
        version: 1,
        size: '2.1 MB'
    },
    {
        id: 'DOC-005',
        employee_name: 'Ananya Patel',
        employee_id: 'TF01145',
        type: 'Reimbursement',
        title: 'Telephone Bills Oct-Nov',
        generated_date: '05 Dec 2025',
        status: 'Approved',
        last_activity: 'Approved by Manager',
        generated_by: 'Ananya Patel',
        template_used: 'N/A (Upload)',
        version: 1,
        size: '3.5 MB'
    },
    {
        id: 'DOC-006',
        employee_name: 'Vikram Singh',
        employee_id: 'AC03987',
        type: 'Bonus Letter',
        title: 'Diwali Bonus 2025',
        generated_date: '20 Oct 2025',
        status: 'Sent',
        last_activity: 'Email sent 20 Oct',
        generated_by: 'System (Auto)',
        template_used: 'Bonus Distribution',
        version: 1,
        size: '120 KB'
    },
    {
        id: 'DOC-007',
        employee_name: 'Amit Patel',
        employee_id: 'TF02211',
        type: 'Relieving Letter',
        title: 'Relieving & Experience Letter',
        generated_date: '28 Nov 2025',
        status: 'Sent',
        last_activity: 'Email sent 28 Nov',
        generated_by: 'Kavita Sharma (HR)',
        template_used: 'Exit Pack Standard',
        version: 1,
        size: '800 KB'
    },
    {
        id: 'DOC-008',
        employee_name: 'Simran Kaur',
        employee_id: 'GL09988',
        type: 'Investment Proof',
        title: '80C Declarations',
        generated_date: '10 Dec 2025',
        status: 'Pending Signature',
        last_activity: 'Uploaded by Employee',
        generated_by: 'Simran Kaur',
        template_used: 'N/A',
        version: 2,
        size: '5.6 MB'
    },
    {
        id: 'DOC-009',
        employee_name: 'Rahul Sharma',
        employee_id: 'TF00112',
        type: 'Probation Confirmation',
        title: 'Confirmation Letter',
        generated_date: '15 Nov 2025',
        status: 'Viewed',
        last_activity: 'Viewed 16 Nov',
        generated_by: 'Kavita Sharma (HR)',
        template_used: 'Confirmation v1',
        version: 1,
        size: '200 KB'
    },
    {
        id: 'DOC-010',
        employee_name: 'Priya Desai',
        employee_id: 'SU00555',
        type: 'Form 16',
        title: 'Form 16 FY 2024-25',
        generated_date: '15 Jun 2025',
        status: 'Sent',
        last_activity: 'Email sent 15 Jun',
        generated_by: 'System (Auto)',
        template_used: 'Tax Certificate v2',
        version: 1,
        size: '450 KB'
    }
];

// --- Additional Mock Data for Drill Downs ---
const MOCK_FORMS_16 = Array.from({ length: 15 }).map((_, i) => ({
    ...MOCK_DOCUMENTS[1],
    id: `F16-${i}`,
    employee_name: ['Arjun Mehta', 'Priya Desai', 'Vikram Singh', 'Rahul Sharma', 'Ananya Patel'][i % 5],
    employee_id: `TF00${800 + i}`,
    status: i % 3 === 0 ? 'Downloaded' : i % 2 === 0 ? 'Sent' : 'Viewed'
}));

const MOCK_PENDING_PROOFS = [
    { ...MOCK_DOCUMENTS[7], id: 'PRF-1', employeeName: 'Simran Kaur', title: '80C Declarations (LIC, PPF)', generatedDate: '2 Days ago' },
    { ...MOCK_DOCUMENTS[7], id: 'PRF-2', employeeName: 'Rajesh Koothrappali', title: 'HRA Rent Receipts', generatedDate: 'Yesterday' },
    { ...MOCK_DOCUMENTS[7], id: 'PRF-3', employeeName: 'Penny Hofstadter', title: 'Medical Bills Reimbursement', generatedDate: 'Today' },
    { ...MOCK_DOCUMENTS[7], id: 'PRF-4', employeeName: 'Leonard Hofstadter', title: 'LTA Proofs', generatedDate: '3 Days ago' },
    { ...MOCK_DOCUMENTS[7], id: 'PRF-5', employeeName: 'Sheldon Cooper', title: 'Train Tickets (Travel)', generatedDate: '4 Hours ago' },
];

// --- Sub-Modals for Document Details ---

const EmailDocumentModal: React.FC<{ doc: DocumentItem; onClose: () => void; onSend: () => void }> = ({ doc, onClose, onSend }) => {
    const [sending, setSending] = useState(false);

    const handleSend = () => {
        setSending(true);
        setTimeout(() => {
            onSend();
            setSending(false);
        }, 1500);
    };

    return (
        <div className="absolute inset-0 z-[80] flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md"><Mail size={14} /></div>
                        Email Document
                    </h4>
                    <button onClick={onClose}><X size={16} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">To</label>
                        <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                            <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{doc?.employee_name || 'N/A'}</span>
                            <span className="text-xs text-slate-400 flex-1">({doc?.employee_id || 'N/A'}@collabcrm.com)</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                        <input type="text" defaultValue={`IMPORTANT: ${doc.title}`} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Message</label>
                        <textarea className="w-full h-24 p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none" defaultValue={`Please find attached the ${doc.title}. Let us know if you have questions.`}></textarea>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <FileText size={16} className="text-rose-500" />
                        <span className="text-xs text-slate-600 truncate flex-1">{doc.title}.pdf</span>
                        <span className="text-xs text-slate-400">{doc.size}</span>
                    </div>
                </div>

                <div className="flex gap-2 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
                        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {sending ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminSigningModal: React.FC<{ onClose: () => void; onSign: () => void }> = ({ onClose, onSign }) => {
    const [signatureType, setSignatureType] = useState<'TYPE' | 'DRAW'>('TYPE');
    const [typedName, setTypedName] = useState('');
    const [isSigning, setIsSigning] = useState(false);

    const handleSign = () => {
        setIsSigning(true);
        setTimeout(() => {
            onSign();
            setIsSigning(false);
        }, 1500);
    };

    return (
        <div className="absolute inset-0 z-[80] flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md"><PenTool size={14} /></div>
                        Sign Document
                    </h4>
                    <button onClick={onClose}><X size={16} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="mb-4 flex border border-slate-200 rounded-lg p-1 bg-slate-50">
                    <button
                        onClick={() => setSignatureType('TYPE')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${signatureType === 'TYPE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Type size={12} /> Type
                    </button>
                    <button
                        onClick={() => setSignatureType('DRAW')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${signatureType === 'DRAW' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <PenTool size={12} /> Draw
                    </button>
                </div>

                <div className="border border-slate-200 rounded-xl h-32 flex items-center justify-center bg-white relative overflow-hidden mb-4 group">
                    {signatureType === 'TYPE' ? (
                        <input
                            type="text"
                            placeholder="Type your full name"
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            className="text-center text-2xl font-cursive text-slate-800 focus:outline-none w-full bg-transparent font-bold placeholder:font-sans placeholder:text-slate-300 placeholder:font-normal"
                            style={{ fontFamily: '"Brush Script MT", cursive' }}
                            autoFocus
                        />
                    ) : (
                        <div className="text-slate-300 text-xs flex flex-col items-center">
                            <PenTool size={20} className="mb-1" />
                            <span>Draw here</span>
                        </div>
                    )}
                    <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center mb-4 leading-relaxed">
                    By clicking "Adopt & Sign", I agree that the signature and initials will be the electronic representation of my signature and initials for all purposes when I use them on documents, including legally binding contracts.
                </p>

                <div className="flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors">Cancel</button>
                    <button
                        onClick={handleSign}
                        disabled={signatureType === 'TYPE' && !typedName}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-colors flex items-center gap-2"
                    >
                        {isSigning ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {isSigning ? 'Signing...' : 'Adopt & Sign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddNoteModal: React.FC<{ onClose: () => void; onSave: (note: string) => void }> = ({ onClose, onSave }) => {
    const [note, setNote] = useState('');
    return (
        <div className="absolute inset-0 z-[80] flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-1.5 bg-sky-100 text-sky-600 rounded-md"><MessageSquare size={14} /></div>
                        Add Internal Note
                    </h4>
                    <button onClick={onClose}><X size={16} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <textarea
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none h-32 shadow-sm"
                    placeholder="Type your note here... (Visible only to admins)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    autoFocus
                ></textarea>
                <div className="flex gap-2 mt-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors">Cancel</button>
                    <button onClick={() => onSave(note)} disabled={!note.trim()} className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 shadow-sm transition-colors">Save Note</button>
                </div>
            </div>
        </div>
    );
};

const RegenerateModal: React.FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleConfirm = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onConfirm();
        }, 2000);
    };

    return (
        <div className="absolute inset-0 z-[80] flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs text-center">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                    <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{isLoading ? 'Regenerating...' : 'Regenerate Document?'}</h4>
                {!isLoading && (
                    <>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed px-2">
                            This will create a new version (v2) using the latest employee data. The current version will be archived automatically.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-colors">Confirm</button>
                        </div>
                    </>
                )}
                {isLoading && <p className="text-xs text-slate-400">Processing template variables...</p>}
            </div>
        </div>
    );
};

const ESignModal: React.FC<{ onClose: () => void; onAction: (type: 'REQUEST' | 'SIGN') => void }> = ({ onClose, onAction }) => {
    return (
        <div className="absolute inset-0 z-[80] flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md"><PenTool size={14} /></div>
                        e-Signature Options
                    </h4>
                    <button onClick={onClose}><X size={16} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => onAction('REQUEST')}
                        className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group text-left shadow-sm"
                    >
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200 transition-colors"><Mail size={20} /></div>
                        <div>
                            <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-800">Request from Employee</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Send an email link to sign document</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onAction('SIGN')}
                        className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-left shadow-sm"
                    >
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full group-hover:bg-emerald-200 transition-colors"><PenTool size={20} /></div>
                        <div>
                            <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-800">Sign Now (Admin)</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Apply your digital signature immediately</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

const DocumentDetailsModal: React.FC<{ doc: DocumentItem; onClose: () => void }> = ({ doc: initialDoc, onClose }) => {
    const [doc, setDoc] = useState<DocumentItem>(initialDoc);
    const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'NOTE' | 'REGENERATE' | 'ESIGN' | 'EMAIL' | 'SIGNING'>('NONE');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'PREVIEW' | 'HISTORY'>('PREVIEW');

    if (!doc) return null;

    const handleDownload = () => {
        const dummyContent = `
Document: ${doc.title}
Employee: ${doc?.employee_name || 'N/A'} (${doc?.employee_id || 'N/A'})
Date: ${doc?.generated_date || 'N/A'}
Generated By: ${doc?.generated_by || 'N/A'}

This is a placeholder file generated for demonstration purposes.
    `;
        const blob = new Blob([dummyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${doc?.employee_id || 'N/A'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleActionComplete = (msg: string) => {
        setActiveOverlay('NONE');
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const addNote = (text: string) => {
        const newNote: Note = {
            id: Date.now().toString(),
            text,
            author: 'You (Admin)',
            timestamp: 'Just now',
            type: 'NOTE'
        };
        setDoc(prev => ({
            ...prev,
            history: [newNote, ...(prev.history || [])]
        }));
        setActiveTab('HISTORY');
        handleActionComplete('Note added successfully');
    };

    const handleAdminSign = () => {
        const signEvent: Note = {
            id: Date.now().toString(),
            text: 'Document digitally signed by Admin',
            author: 'System',
            timestamp: 'Just now',
            type: 'SYSTEM'
        };
        setDoc(prev => ({
            ...prev,
            status: 'Signed',
            history: [signEvent, ...(prev.history || [])]
        }));
        setActiveTab('HISTORY');
        handleActionComplete('Document signed successfully');
    };

    const handleEmailSent = () => {
        const emailEvent: Note = {
            id: Date.now().toString(),
            text: `Document emailed to ${doc?.employee_name || 'N/A'}`,
            author: 'System',
            timestamp: 'Just now',
            type: 'SYSTEM'
        };
        setDoc(prev => ({
            ...prev,
            status: 'Sent',
            history: [emailEvent, ...(prev.history || [])]
        }));
        setActiveTab('HISTORY');
        handleActionComplete('Email sent successfully');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all relative min-h-[550px]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight pr-4">{doc.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">Generated by {doc?.generated_by || 'N/A'}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 border border-slate-200 shadow-sm"><X size={18} /></button>
                </div>

                {/* Success Toast inside modal */}
                {successMessage && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <Check size={12} /> {successMessage}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('PREVIEW')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === 'PREVIEW' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === 'HISTORY' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Activity & Notes
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-50/30 overflow-y-auto relative">

                    {activeTab === 'PREVIEW' && (
                        <div className="p-8 flex flex-col items-center justify-center h-full animate-in fade-in">
                            <div className="w-48 aspect-[1/1.4] bg-white shadow-md border border-slate-200 p-5 relative group cursor-pointer transition-transform hover:scale-[1.02]">
                                <div className="space-y-3 opacity-60">
                                    <div className="h-2 bg-slate-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-1.5 bg-slate-100 rounded w-full"></div>
                                    <div className="h-1.5 bg-slate-100 rounded w-full"></div>
                                    <div className="h-1.5 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-16 bg-purple-50 rounded border border-purple-100 mt-6"></div>
                                </div>
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <Eye size={12} /> Preview
                                    </div>
                                </div>
                                {doc.status === 'Signed' && (
                                    <div className="absolute bottom-4 right-4 text-emerald-600 bg-white/90 backdrop-blur p-1 rounded-full shadow-sm border border-emerald-100" title="Signed">
                                        <PenTool size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 w-full px-6 grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Template</p>
                                    <p className="font-semibold text-slate-700 text-xs mt-0.5">{doc?.template_used || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Version</p>
                                    <p className="font-semibold text-slate-700 text-xs mt-0.5">v{doc.version} ({doc.size})</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'HISTORY' && (
                        <div className="p-6 h-full animate-in fade-in">
                            {(!doc.history || doc.history.length === 0) && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <MessageSquare size={24} className="mb-2 opacity-50" />
                                    <p className="text-xs">No activity recorded yet.</p>
                                </div>
                            )}
                            <div className="space-y-4">
                                {doc.history?.map((item, i) => (
                                    <div key={i} className="flex gap-3 relative">
                                        {/* Timeline Line */}
                                        {i !== (doc.history?.length || 0) - 1 && <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-100"></div>}

                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${item.type === 'NOTE' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.type === 'NOTE' ? <MessageSquare size={12} /> : <Clock size={12} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-slate-700">{item.author}</span>
                                                <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                                            </div>
                                            <div className={`mt-1 text-xs p-2 rounded-lg ${item.type === 'NOTE' ? 'bg-sky-50 text-sky-800' : 'text-slate-600'}`}>
                                                {item.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-100 flex flex-col gap-4 bg-slate-50/50">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveOverlay('EMAIL')}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
                        >
                            <Mail size={16} /> Email
                        </button>
                        <button onClick={handleDownload} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-all shadow-sm">
                            <Download size={16} /> Download
                        </button>
                    </div>
                    <div className="flex justify-between px-4 pt-2">
                        <button
                            onClick={() => setActiveOverlay('REGENERATE')}
                            className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[10px] font-bold transition-colors group"
                        >
                            <div className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-slate-300 shadow-sm"><RefreshCw size={14} /></div>
                            Regenerate
                        </button>
                        <button
                            onClick={() => setActiveOverlay('ESIGN')}
                            className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-[10px] font-bold transition-colors group"
                        >
                            <div className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-indigo-200 group-hover:text-indigo-600 shadow-sm"><PenTool size={14} /></div>
                            e-Sign
                        </button>
                        <button
                            onClick={() => setActiveOverlay('NOTE')}
                            className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-sky-600 text-[10px] font-bold transition-colors group"
                        >
                            <div className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-sky-200 group-hover:text-sky-600 shadow-sm"><MessageSquare size={14} /></div>
                            Note
                        </button>
                    </div>
                </div>

                {/* Overlays */}
                {activeOverlay === 'NOTE' && (
                    <AddNoteModal
                        onClose={() => setActiveOverlay('NONE')}
                        onSave={addNote}
                    />
                )}
                {activeOverlay === 'REGENERATE' && (
                    <RegenerateModal
                        onClose={() => setActiveOverlay('NONE')}
                        onConfirm={() => handleActionComplete('Document regenerated (v2 created)')}
                    />
                )}
                {activeOverlay === 'ESIGN' && (
                    <ESignModal
                        onClose={() => setActiveOverlay('NONE')}
                        onAction={(type) => {
                            if (type === 'SIGN') {
                                setActiveOverlay('SIGNING');
                            } else {
                                handleActionComplete('Signature request sent');
                            }
                        }}
                    />
                )}
                {activeOverlay === 'EMAIL' && (
                    <EmailDocumentModal
                        doc={doc}
                        onClose={() => setActiveOverlay('NONE')}
                        onSend={handleEmailSent}
                    />
                )}
                {activeOverlay === 'SIGNING' && (
                    <AdminSigningModal
                        onClose={() => setActiveOverlay('NONE')}
                        onSign={handleAdminSign}
                    />
                )}
            </div>
        </div>
    )
}

const GenerateDocumentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const docTypes = [
        { id: 'offer', label: 'Offer Letter', icon: <Briefcase size={20} />, desc: 'For new candidates' },
        { id: 'increment', label: 'Increment Letter', icon: <Receipt size={20} />, desc: 'Salary revision & hikes' },
        { id: 'relieving', label: 'Relieving Letter', icon: <XCircle size={20} />, desc: 'Exit formalities' },
        { id: 'experience', label: 'Experience Certificate', icon: <FileBadge size={20} />, desc: 'Proof of employment' },
        { id: 'bonafide', label: 'Bonafide Certificate', icon: <FileText size={20} />, desc: 'Address/Employment proof' },
        { id: 'showcause', label: 'Show Cause Notice', icon: <AlertTriangle size={20} />, desc: 'Disciplinary action' },
    ];

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Generate New Document</h3>
                        <p className="text-xs text-slate-500">Create official documents from templates</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Document Type Grid */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">1. Select Document Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {docTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`flex flex-col items-start p-3 border rounded-xl transition-all text-left group ${selectedType === type.id ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600' : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-sm'}`}
                                >
                                    <div className={`p-2 rounded-lg mb-2 ${selectedType === type.id ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600'}`}>
                                        {type.icon}
                                    </div>
                                    <span className={`text-sm font-bold ${selectedType === type.id ? 'text-purple-900' : 'text-slate-700'}`}>{type.label}</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">{type.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Details */}
                    {selectedType && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 pt-4 border-t border-slate-100">2. Document Details</label>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Employee</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="Search by name or ID..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Template</label>
                                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                                        <option>Standard Format v2</option>
                                        <option>Executive Format</option>
                                        <option>Simple Format</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Issue</label>
                                    <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                                </div>
                                {selectedType === 'increment' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Effective Date</label>
                                        <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Remarks</label>
                                <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none h-20" placeholder="Any specific notes to include..."></textarea>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm text-slate-600">Email to employee immediately</span>
                    </label>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button
                            onClick={handleGenerate}
                            disabled={!selectedType || isGenerating}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 transition-all"
                        >
                            {isGenerating ? (
                                <><Loader2 size={16} className="animate-spin" /> Generating...</>
                            ) : (
                                <><Plus size={16} /> Generate</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DocumentsManager: React.FC = () => {
    const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentView, setCurrentView] = useState<'LIST' | 'FORMS_16_VIEW' | 'PROOF_PENDING_VIEW'>('LIST');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Sent': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Downloaded': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Viewed': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'Pending Signature': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'Expired': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const getDocIcon = (type: string) => {
        switch (type) {
            case 'Form 16':
            case 'F&F':
            case 'Reimbursement':
                return <FileText size={18} className="text-rose-500" />;
            case 'Offer Letter':
            case 'Relieving Letter':
                return <FileBadge size={18} className="text-purple-500" />;
            case 'Salary Revision':
            case 'Bonus Letter':
                return <Receipt size={18} className="text-emerald-500" />;
            default:
                return <File size={18} className="text-sky-500" />;
        }
    };

    const handleDownload = (doc: DocumentItem) => {
        const dummyContent = `
Document: ${doc.title}
Employee: ${doc?.employee_name || 'N/A'} (${doc?.employee_id || 'N/A'})
Date: ${doc?.generated_date || 'N/A'}
Generated By: ${doc?.generated_by || 'N/A'}

This is a placeholder file generated for demonstration purposes.
    `;
        const blob = new Blob([dummyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${doc?.employee_id || 'N/A'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const filteredDocs = (MOCK_DOCUMENTS || []).filter(doc =>
        (doc?.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc?.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDER: Forms 16 View ---
    if (currentView === 'FORMS_16_VIEW') {
        return (
            <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 h-[calc(100vh-64px)] flex flex-col">
                <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setCurrentView('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Form 16 Issued</h1>
                        <p className="text-sm text-slate-500">Financial Year 2024-25</p>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">1,842 Documents</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 text-xs font-medium shadow-sm flex items-center gap-1.5">
                                <Mail size={14} /> Resend All Unopened
                            </button>
                            <button className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 shadow-sm flex items-center gap-1.5">
                                <Download size={14} /> Download Bulk ZIP
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Document</th>
                                    <th className="px-6 py-4">Date Issued</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MOCK_FORMS_16.map((doc, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{doc?.employee_name || 'N/A'}</div>
                                            <div className="text-xs text-slate-400 font-mono">{doc?.employee_id || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">{doc.title}</td>
                                        <td className="px-6 py-4">{doc?.generated_date || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(doc.status as any)}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button className="text-sky-600 hover:text-sky-800 font-medium text-xs">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: Proof Pending View ---
    if (currentView === 'PROOF_PENDING_VIEW') {
        return (
            <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 h-[calc(100vh-64px)] flex flex-col">
                <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setCurrentView('LIST')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Pending Proof Verification</h1>
                        <p className="text-sm text-slate-500">Employee submissions requiring HR approval</p>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle size={18} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800">68 Pending Requests</h3>
                            <p className="text-xs text-slate-500">Please clear these before 20th of the month to reflect in payroll.</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Proof Type</th>
                                    <th className="px-6 py-4">Submission Date</th>
                                    <th className="px-6 py-4">Attachment</th>
                                    <th className="px-4 py-4 text-right">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MOCK_PENDING_PROOFS.map((doc, i) => (
                                    <tr key={i} className="hover:bg-slate-50 group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{doc?.employee_name || 'N/A'}</div>
                                            <div className="text-xs text-slate-400 font-mono">{doc?.employee_id || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">{doc.title}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            {doc?.generated_date || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sky-600 cursor-pointer hover:underline">
                                                <FileText size={14} /> View File
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded border border-rose-200 transition-colors" title="Reject">
                                                    <ThumbsDown size={14} />
                                                </button>
                                                <button className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors" title="Approve">
                                                    <ThumbsUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedDoc(doc)}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50 text-xs font-medium"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {selectedDoc && <DocumentDetailsModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
            </div>
        );
    }

    // --- RENDER: Default Dashboard List ---
    return (
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 h-[calc(100vh-64px)] flex flex-col">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Documents Manager
                    </h1>
                    <p className="text-slate-500 mt-1">Generate, track and manage employee documentation.</p>
                </div>
            </div>

            {/* Summary Cards - Small Compact Size */}
            <div className="flex flex-wrap gap-4 shrink-0">
                <div className="bg-white pl-4 pr-3 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between w-72 transition-shadow hover:shadow-md group relative">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forms 16 Issued</p>
                        <p className="text-2xl font-bold text-slate-800 mt-0.5">1,842</p>
                    </div>
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle size={20} /></div>

                    {/* View Icon */}
                    <button
                        onClick={() => setCurrentView('FORMS_16_VIEW')}
                        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="View All"
                    >
                        <Eye size={16} />
                    </button>
                </div>

                <div className="bg-white pl-4 pr-3 py-3 rounded-xl border border-rose-100 bg-rose-50/10 shadow-sm flex items-center justify-between w-72 transition-shadow hover:shadow-md group relative">
                    <div>
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Proof Pending</p>
                        <p className="text-2xl font-bold text-rose-700 mt-0.5">68</p>
                    </div>
                    <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center"><AlertTriangle size={20} /></div>

                    {/* View Icon */}
                    <button
                        onClick={() => setCurrentView('PROOF_PENDING_VIEW')}
                        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                        title="Review Pending"
                    >
                        <Eye size={16} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, document type..."
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                            />
                        </div>
                        <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 shadow-sm">
                            <Filter size={16} /> Filter
                        </button>
                    </div>

                    <div className="relative group">
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-bold shadow-sm flex items-center gap-2 transition-all"
                        >
                            <Plus size={16} /> Generate Document <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Document Type</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocs.map((doc) => (
                                <tr
                                    key={doc.id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className="cursor-pointer transition-colors hover:bg-slate-50 group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{doc?.employee_name || 'N/A'}</div>
                                        <div className="text-xs text-slate-400 font-mono">{doc?.employee_id || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-white border border-slate-200 rounded shadow-sm group-hover:border-purple-200 transition-colors">
                                                {getDocIcon(doc.type)}
                                            </div>
                                            <span className="text-slate-700 font-medium">{doc.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{doc.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{doc?.generated_date || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{doc?.last_activity || 'N/A'}</td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors" title="View"><Eye size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDownload(doc); }} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Download"><Download size={16} /></button>
                                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedDoc && <DocumentDetailsModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}

            {/* Generate Document Modal */}
            {showGenerateModal && <GenerateDocumentModal onClose={() => setShowGenerateModal(false)} />}
        </div>
    );
};

export default DocumentsManager;