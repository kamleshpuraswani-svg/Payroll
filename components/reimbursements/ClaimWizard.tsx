
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Send, CheckCircle, Plus, Paperclip, FileText, Trash2, 
  Plane, UtensilsCrossed, Smartphone, Wifi, Briefcase, Layers, X, Info, ShieldCheck, Save, AlertTriangle, Edit2, Download, Eye
} from 'lucide-react';
import { ReimbursementCategory } from '../../types';

export const ClaimWizard = ({ onCancel, onSubmit, initialData, readOnly = false, onEdit }: any) => {
  const [category, setCategory] = useState<ReimbursementCategory>(initialData?.category || ReimbursementCategory.TRAVEL);
  const [reportMeta, setReportMeta] = useState({ 
    name: initialData?.name || '', 
    otherType: initialData?.otherType || '',
    project: initialData?.project || '', 
    startDate: initialData?.startDate || '', 
    endDate: initialData?.endDate || '',
    mealDays: initialData?.mealDays || '',
    billingCycle: 'Quarterly'
  });
  const [items, setItems] = useState<any[]>(initialData?.items || []);
  const [currentLine, setCurrentLine] = useState({ 
    merchant: '', 
    amount: 0, 
    date: new Date().toISOString().split('T')[0],
    hasReceipt: false, 
    fileName: '',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditable = initialData?.status !== 'approved' && initialData?.status !== 'settled';

  const handleAddLine = () => {
    setError(null);
    if (!currentLine.amount || !currentLine.date || !currentLine.notes) {
        setError("Please fill in Amount, Date of Expense, and Description to add a line item.");
        return;
    }
    // Merchant is optional now

    setItems([...items, { ...currentLine, id: Date.now().toString() }]);
    setCurrentLine({ merchant: '', amount: 0, date: new Date().toISOString().split('T')[0], hasReceipt: false, fileName: '', notes: '' });
  };
  
  const handleSubmit = () => {
    setError(null);
    if (!category) {
        setError("Please select a Category.");
        return;
    }
    if (items.length === 0) {
         setError("Please add at least one expense item line before submitting.");
         return;
    }
    
    onSubmit({ ...reportMeta, category, items, status: 'pending', id: initialData?.id || 'CLM-'+Date.now() });
  };

  const downloadReceipt = (item: any) => {
    // Create a dummy text file for demo purposes
    const element = document.createElement("a");
    const file = new Blob([`Receipt for ${item.merchant || 'Expense'} - ${item.amount}\nDate: ${item.date}\nDescription: ${item.notes}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Receipt-${item.id || Date.now()}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  const calculateTotal = () => items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in-up pb-20 relative">
      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 0.5rem; }
        .input-field { width: 100%; padding: 0.75rem 1rem; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #0f172a; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); background-color: #ffffff; }
        .input-field:disabled { background-color: #f1f5f9; color: #64748b; cursor: not-allowed; border-color: #e2e8f0; }
      `}</style>
      
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-3 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <ArrowLeft size={20}/>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {readOnly ? 'View Claim Details' : (initialData ? 'Edit Claim Report' : 'Add New Claim')}
              </h2>
              {readOnly && initialData?.settledDate && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                  Settled in: {initialData.settledDate}
                </span>
              )}
            </div>
          </div>
        </div>
        {!readOnly ? (
          <div className="flex gap-4">
            <button onClick={onCancel} className="px-4 h-12 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-2">
               <X size={16}/> Cancel
            </button>
            <button onClick={() => onSubmit({...initialData, items, status: 'draft'})} className="px-6 h-12 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
              <Save size={14}/> Save as Draft
            </button>
            <button 
              onClick={handleSubmit} 
              className="bg-blue-600 text-white px-8 h-12 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Send size={14}/> Submit
            </button>
          </div>
        ) : (
          isEditable && (
            <div className="flex gap-4">
                <button 
                    onClick={onEdit} 
                    className="px-6 h-12 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200 hover:border-slate-300"
                >
                    <Edit2 size={14}/> Edit Claim
                </button>
            </div>
          )
        )}
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-bold flex items-center gap-2 border border-red-100 shadow-sm">
            <AlertTriangle size={18}/> {error}
        </div>
      )}

      {/* Unified Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Action Required Banner */}
        {initialData?.status === 'action_required' && (
            <div className="bg-red-50 border-b border-red-100 p-6 flex items-start gap-4">
                <div className="p-2 bg-white rounded-full text-red-600 shadow-sm border border-red-100 shrink-0">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-1">Action Required</h3>
                    <p className="text-sm text-red-800 font-medium leading-relaxed">
                        {initialData.actionNote || "Please review the comments in the approval history and update the claim accordingly."}
                    </p>
                </div>
            </div>
        )}

        {/* Step 1: Classification */}
        <div className="p-8 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Step 1: Select Category</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
              {[
                { id: ReimbursementCategory.TRAVEL, label: 'Travel', icon: <Plane size={18}/> },
                { id: ReimbursementCategory.MEAL, label: 'Meal', icon: <UtensilsCrossed size={18}/> },
                { id: ReimbursementCategory.MOBILE, label: 'Mobile', icon: <Smartphone size={18}/> },
                { id: ReimbursementCategory.BROADBAND, label: 'Broadband', icon: <Wifi size={18}/> },
                { id: ReimbursementCategory.LEARNING, label: 'Learning', icon: <Briefcase size={18}/> },
                { id: ReimbursementCategory.OTHER, label: 'Other', icon: <Layers size={18}/> },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => !readOnly && setCategory(cat.id)}
                  disabled={readOnly}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all gap-2
                    ${category === cat.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-100'}
                    ${readOnly ? 'cursor-default opacity-80' : ''}
                  `}
                >
                  {cat.icon}
                  <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {category === ReimbursementCategory.OTHER && (
                 <div className="xl:col-span-1">
                   <label className="label">Enter Claim Type</label>
                   <input 
                     type="text" className="input-field" placeholder="e.g. Home Office Chair" 
                     value={reportMeta.otherType} onChange={e => setReportMeta({...reportMeta, otherType: e.target.value})} 
                     disabled={readOnly}
                   />
                 </div>
               )}
            </div>
        </div>

        {/* Step 2: Line Items */}
        <div className="p-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Step 2: Add Expense details</h3>
             
             <div className="flex flex-col lg:flex-row gap-8 items-start">
                 {!readOnly && (
                   <div className="w-full lg:w-1/3 shrink-0 bg-slate-50 border border-slate-100 p-6 rounded-xl sticky top-6">
                      <div className="space-y-5">
                          <div>
                             <label className="label">Merchant / Payee <span className="text-slate-400 font-normal normal-case">(Optional)</span></label>
                             <input type="text" className="input-field" placeholder="Uber, Airtel, etc." value={currentLine.merchant} onChange={e => setCurrentLine({...currentLine, merchant: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="label">Amount <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input type="number" className="input-field pl-7 font-bold" placeholder="0" value={currentLine.amount || ''} onChange={e => setCurrentLine({...currentLine, amount: Number(e.target.value)})} />
                                </div>
                             </div>
                             <div>
                                <label className="label">Date <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    max={new Date().toISOString().split('T')[0]} 
                                    className="input-field" 
                                    value={currentLine.date} 
                                    onChange={e => setCurrentLine({...currentLine, date: e.target.value})} 
                                />
                             </div>
                          </div>
                          <div>
                             <label className="label">Description <span className="text-red-500">*</span></label>
                             <textarea 
                                className="input-field min-h-[80px] resize-none" 
                                placeholder="Business purpose..." 
                                value={currentLine.notes} 
                                onChange={e => setCurrentLine({...currentLine, notes: e.target.value})} 
                             />
                          </div>
                          <div>
                             <label className="label">Receipt</label>
                             <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
                               if(e.target.files?.[0]) setCurrentLine({...currentLine, hasReceipt: true, fileName: e.target.files[0].name});
                             }} />
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full h-11 rounded-lg flex items-center justify-center border-2 border-dashed transition-all gap-2 text-sm font-medium
                                  ${currentLine.hasReceipt ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'}
                                `}
                                title={currentLine.fileName || "Upload Receipt"}
                             >
                                {currentLine.hasReceipt ? <><CheckCircle size={16}/> {currentLine.fileName}</> : <><Paperclip size={16}/> Upload Receipt</>}
                             </button>
                          </div>
                          <button 
                              onClick={handleAddLine}
                              className="w-full h-12 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg mt-2"
                          >
                              <Plus size={14}/> Add
                          </button>
                      </div>
                   </div>
                 )}

                 {/* Items Table */}
                 <div className="flex-1 w-full border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <tr>
                             <th className="px-6 py-4">Expense Details</th>
                             <th className="px-6 py-4 text-center">Date</th>
                             <th className="px-6 py-4 text-right">Amount</th>
                             <th className="px-6 py-4 text-center">Receipt</th>
                             {!readOnly && <th className="px-6 py-4"></th>}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-900">{item.merchant || <span className="text-slate-400 italic font-normal">No Merchant</span>}</p>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.notes}</p>
                               </td>
                               <td className="px-6 py-4 text-center">
                                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{item.date}</span>
                               </td>
                               <td className="px-6 py-4 text-right font-black text-slate-900">₹{item.amount.toLocaleString()}</td>
                               <td className="px-6 py-4 text-center">
                                  {item.hasReceipt ? (
                                      <div className="flex items-center justify-center gap-2">
                                          <button 
                                              onClick={() => setViewingReceipt(item.fileName)}
                                              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                                          >
                                              <Eye size={12} /> View
                                          </button>
                                          <button 
                                              onClick={() => downloadReceipt(item)}
                                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                          >
                                              <Download size={12} /> Download
                                          </button>
                                      </div>
                                  ) : (
                                      <span className="text-[10px] text-slate-300 font-bold uppercase">MISSING</span>
                                  )}
                               </td>
                               {!readOnly && (
                                 <td className="px-6 py-4 text-right">
                                    <button onClick={() => setItems(prev => prev.filter(p => p.id !== item.id))} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                                 </td>
                               )}
                            </tr>
                          ))}
                          {items.length === 0 && (
                            <tr>
                               <td colSpan={readOnly ? 4 : 5} className="px-6 py-12 text-center text-slate-400">
                                 <div className="flex flex-col items-center gap-3">
                                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                        <Plus size={24} />
                                     </div>
                                     <p className="text-sm font-medium">No expense items added yet.</p>
                                     {!readOnly && <p className="text-xs">Use the form on the left to add items.</p>}
                                 </div>
                               </td>
                            </tr>
                          )}
                       </tbody>
                       {items.length > 0 && (
                           <tfoot className="bg-slate-50 border-t border-slate-200">
                               <tr>
                                   <td colSpan={2} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total Amount</td>
                                   <td className="px-6 py-4 text-right text-lg font-black text-slate-900">₹{calculateTotal().toLocaleString()}</td>
                                   <td colSpan={readOnly ? 1 : 2}></td>
                               </tr>
                           </tfoot>
                       )}
                    </table>
                 </div>
             </div>
        </div>

        {/* Approval History Footer */}
        {readOnly && initialData?.approvalHistory && (
            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Approval History</h3>
                <div className="space-y-6 relative pl-4 border-l-2 border-slate-200 ml-3">
                     {initialData.approvalHistory.map((historyItem: any, idx: number) => (
                         <div key={idx} className="relative pl-6">
                             <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                 <div>
                                     <p className="text-sm font-bold text-slate-800">{historyItem.action}</p>
                                     <p className="text-xs text-slate-500 font-medium">{historyItem.actor}</p>
                                     {historyItem.comment && <p className="text-xs text-slate-600 mt-1 bg-white p-2 rounded border border-slate-100 inline-block">"{historyItem.comment}"</p>}
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{historyItem.date}</span>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        )}

      </div>
      
      {/* Receipt View Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingReceipt(null)}>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg w-full animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800">Receipt Preview</h3>
                     <button onClick={() => setViewingReceipt(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
                 </div>
                 <div className="p-8 flex flex-col items-center justify-center bg-slate-50 min-h-[300px]">
                     <FileText size={64} className="text-slate-300 mb-4" />
                     <p className="text-sm font-medium text-slate-600">Preview for {viewingReceipt}</p>
                     <p className="text-xs text-slate-400 mt-2 text-center max-w-xs">This is a placeholder for the receipt image or PDF preview. In a real app, the actual file content would be rendered here.</p>
                 </div>
                 <div className="p-4 border-t border-slate-100 flex justify-end">
                     <button onClick={() => setViewingReceipt(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900">Close</button>
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};
