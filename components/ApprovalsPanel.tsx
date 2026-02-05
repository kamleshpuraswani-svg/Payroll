import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Briefcase, 
  FileText, 
  Landmark, 
  FileBarChart,
  Download,
  Calendar,
  DollarSign,
  ChevronRight,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { ApprovalItem } from '../types';

interface ApprovalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  approvals: ApprovalItem[];
}

// --- Sub-Modals ---

const ViewRequestDetails: React.FC<{ 
  item: ApprovalItem; 
  onClose: () => void; 
  onApprove: () => void; 
  onReject: () => void; 
}> = ({ item, onClose, onApprove, onReject }) => {

  const handleDownload = () => {
    // Create a dummy Blob to simulate a PDF download
    const dummyContent = `
      RECEIPT DOCUMENT - ${item.id}
      --------------------------------
      Employee: ${item.employeeName}
      Company: ${item.companyName}
      Type: ${item.type}
      Amount: ${item.amount || 'N/A'}
      Date Submitted: ${new Date().toLocaleDateString()}
      
      This is a placeholder document generated for demonstration purposes.
    `;
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger click
    const link = document.createElement('a');
    link.href = url;
    link.download = `Document_${item.id}_${item.employeeName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Request Details</h3>
            <p className="text-xs text-slate-500">ID: {item.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Employee Header */}
          <div className="flex items-center gap-4 mb-6 p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <img src={item.avatarUrl} alt={item.employeeName} className="w-14 h-14 rounded-full object-cover" />
            <div>
              <h4 className="font-bold text-slate-800 text-lg">{item.employeeName}</h4>
              <p className="text-sm text-slate-500">{item.companyName} • Product Designer</p>
            </div>
            <div className="ml-auto text-right">
               <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                 {item.type}
               </span>
               <p className="text-xs text-slate-400 mt-1">{item.submittedTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Claim Amount</p>
                <p className="text-2xl font-bold text-slate-800">{item.amount || 'N/A'}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Category / Section</p>
                <p className="text-lg font-semibold text-slate-700">{item.details}</p>
             </div>
          </div>

          {/* Description / Notes */}
          <div className="mb-6">
             <h5 className="text-sm font-bold text-slate-700 mb-2">Employee Remarks</h5>
             <p className="text-sm text-slate-600 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed">
               "Please find attached the receipt for the specialized design course I completed last month. This falls under the professional development allowance."
             </p>
          </div>

          {/* Document Preview Placeholder */}
          <div>
             <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-bold text-slate-700">Attachments (1)</h5>
                <button 
                  onClick={handleDownload}
                  className="text-xs font-medium text-sky-600 flex items-center gap-1 hover:underline px-2 py-1 rounded hover:bg-sky-50 transition-colors"
                >
                   <Download size={14} /> Download All
                </button>
             </div>
             <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 h-48 flex items-center justify-center relative group cursor-pointer">
                {/* Simulated Document Preview */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                <div className="text-center z-10">
                   <FileText size={40} className="mx-auto text-slate-400 mb-2" />
                   <p className="text-sm font-medium text-slate-500">receipt_nov_2025.pdf</p>
                   <p className="text-xs text-slate-400">1.2 MB</p>
                </div>
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                   <button onClick={handleDownload} className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg shadow-sm font-medium text-sm text-slate-700 transition-opacity flex items-center gap-2">
                      <Eye size={14} /> Preview
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
           <button onClick={onReject} className="px-6 py-2.5 border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <XCircle size={16} /> Reject
           </button>
           <button onClick={onApprove} className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
              <CheckCircle size={16} /> Approve Request
           </button>
        </div>
      </div>
    </div>
  );
};

const ApproveConfirmation: React.FC<{ 
  item: ApprovalItem; 
  onClose: () => void; 
  onConfirm: () => void; 
}> = ({ item, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
         <div className="p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
               <CheckCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Approve Request?</h3>
            <p className="text-sm text-slate-500 mb-6">
               You are about to approve <strong>{item.amount}</strong> for <strong>{item.employeeName}</strong>. This will be reflected in the November 2025 payroll.
            </p>
            <div className="flex gap-3">
               <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancel</button>
               <button onClick={onConfirm} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm shadow-sm">Confirm Approval</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const RejectReasonModal: React.FC<{ 
  item: ApprovalItem; 
  onClose: () => void; 
  onConfirm: () => void; 
}> = ({ item, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
            <div className="flex items-center gap-2 text-rose-700">
               <AlertCircle size={20} />
               <h3 className="font-bold">Reject Request</h3>
            </div>
            <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-600"/></button>
         </div>
         <div className="p-6">
            <p className="text-sm text-slate-600 mb-4">
               Please provide a reason for rejecting <strong>{item.employeeName}'s</strong> request. This will be sent to the employee.
            </p>
            <div className="mb-4">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Rejection Remarks <span className="text-rose-500">*</span></label>
               <textarea 
                 value={reason}
                 onChange={(e) => setReason(e.target.value)}
                 className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                 placeholder="e.g. Insufficient proof attached..."
               ></textarea>
            </div>
            <div className="flex gap-3 justify-end">
               <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm">Cancel</button>
               <button 
                 onClick={onConfirm} 
                 disabled={!reason.trim()}
                 className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Reject Request
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const ApprovalsPanel: React.FC<ApprovalsPanelProps> = ({ isOpen, onClose, approvals }) => {
  const [localApprovals, setLocalApprovals] = useState<ApprovalItem[]>(approvals);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [activeAction, setActiveAction] = useState<'VIEW' | 'APPROVE' | 'REJECT' | null>(null);
  
  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Sync with props
  useEffect(() => {
    setLocalApprovals(approvals);
  }, [approvals]);

  const handleOpenAction = (item: ApprovalItem, action: 'VIEW' | 'APPROVE' | 'REJECT') => {
    setSelectedItem(item);
    setActiveAction(action);
  };

  const closeActionModal = () => {
    setActiveAction(null);
    setSelectedItem(null);
  };

  const handleConfirmAction = (id: string, actionType: 'APPROVED' | 'REJECTED') => {
    // Simulate API call and remove item from list
    setLocalApprovals(prev => prev.filter(item => item.id !== id));
    closeActionModal();
    
    // Show notification
    setNotification({
        message: actionType === 'APPROVED' ? 'Request has been approved.' : 'Request has been rejected.',
        type: actionType === 'APPROVED' ? 'success' : 'error'
    });

    // Auto-dismiss notification
    setTimeout(() => {
        setNotification(null);
    }, 3000);
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Investment Declaration':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Reimbursement Claim':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-100';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Investment Declaration': return <FileBarChart size={14} />;
      case 'Reimbursement Claim': return <FileText size={14} />;
      case 'Tax Regime Change': return <Landmark size={14} />;
      default: return <Briefcase size={14} />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div 
        className={`
          fixed inset-y-0 right-0 z-40 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <FileText size={18} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-800">Pending Approvals</h2>
                <p className="text-xs text-slate-500">Review and action employee requests</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employee or company..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={14} />
            <span>All Types</span>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Notification Toast */}
          {notification && (
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {notification.message}
              </div>
          )}

          {localApprovals.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <CheckCircle size={48} className="mb-4 text-slate-200" />
                <p>All caught up! No pending approvals.</p>
             </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {localApprovals.map((item) => (
                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-start gap-4">
                      <img 
                        src={item.avatarUrl} 
                        alt={item.employeeName} 
                        className="w-12 h-12 rounded-full border border-slate-200 bg-white object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{item.employeeName}</h3>
                          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-sm text-slate-500">{item.companyName}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getBadgeStyle(item.type)}`}>
                            {getIcon(item.type)}
                            {item.type}
                          </span>
                          <span className="text-xs text-slate-400">• Submitted {item.submittedTime}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                           {item.amount && <span className="font-semibold mr-2 text-slate-800">{item.amount}</span>}
                           <span className="text-slate-500">{item.details}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pl-16 sm:pl-0">
                      <button 
                        onClick={() => handleOpenAction(item, 'VIEW')}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button 
                        onClick={() => handleOpenAction(item, 'APPROVE')}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleOpenAction(item, 'REJECT')}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-500 flex justify-between items-center">
           <span>{localApprovals.length} items pending action</span>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* View Modal */}
      {selectedItem && activeAction === 'VIEW' && (
        <ViewRequestDetails 
          item={selectedItem}
          onClose={closeActionModal}
          onApprove={() => setActiveAction('APPROVE')}
          onReject={() => setActiveAction('REJECT')}
        />
      )}

      {/* Approve Modal */}
      {selectedItem && activeAction === 'APPROVE' && (
        <ApproveConfirmation 
          item={selectedItem}
          onClose={closeActionModal}
          onConfirm={() => handleConfirmAction(selectedItem.id, 'APPROVED')}
        />
      )}

      {/* Reject Modal */}
      {selectedItem && activeAction === 'REJECT' && (
        <RejectReasonModal 
          item={selectedItem}
          onClose={closeActionModal}
          onConfirm={() => handleConfirmAction(selectedItem.id, 'REJECTED')}
        />
      )}

    </>
  );
};

export default ApprovalsPanel;