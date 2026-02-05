
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  Info,
  Edit2,
  Check,
  Calendar,
  Save,
  Copy,
  Loader2
} from 'lucide-react';

// Mock Data for Tax Slabs across different Financial Years
const HISTORICAL_TAX_DATA: Record<string, { NEW: any[], OLD: any[] }> = {
  '2025-2026': {
    NEW: [
      { from: 0, to: 400000, rate: 0 },
      { from: 400001, to: 800000, rate: 5 },
      { from: 800001, to: 1200000, rate: 10 },
      { from: 1200001, to: 1500000, rate: 15 },
      { from: 1500001, to: 2000000, rate: 20 },
      { from: 2000001, to: null, rate: 30 },
    ],
    OLD: [
      { from: 0, to: 250000, rate: 0 },
      { from: 250001, to: 500000, rate: 5 },
      { from: 500001, to: 1000000, rate: 20 },
      { from: 1000001, to: null, rate: 30 },
    ]
  },
  '2024-2025': {
    NEW: [
      { from: 0, to: 300000, rate: 0 },
      { from: 300001, to: 600000, rate: 5 },
      { from: 600001, to: 900000, rate: 10 },
      { from: 900001, to: 1200000, rate: 15 },
      { from: 1200001, to: 1500000, rate: 20 },
      { from: 1500001, to: null, rate: 30 },
    ],
    OLD: [
      { from: 0, to: 250000, rate: 0 },
      { from: 250001, to: 500000, rate: 5 },
      { from: 500001, to: 1000000, rate: 20 },
      { from: 1000001, to: null, rate: 30 },
    ]
  },
  '2023-2024': {
    NEW: [
      { from: 0, to: 250000, rate: 0 },
      { from: 250001, to: 500000, rate: 5 },
      { from: 500001, to: 750000, rate: 10 },
      { from: 750001, to: 1000000, rate: 15 },
      { from: 1000001, to: 1250000, rate: 20 },
      { from: 1250001, to: 1500000, rate: 25 },
      { from: 1500001, to: null, rate: 30 },
    ],
    OLD: [
      { from: 0, to: 250000, rate: 0 },
      { from: 250001, to: 500000, rate: 5 },
      { from: 500001, to: 750000, rate: 10 },
      { from: 750001, to: 1000000, rate: 15 },
      { from: 1000001, to: 1250000, rate: 20 },
      { from: 1250001, to: 1500000, rate: 25 },
      { from: 1500001, to: null, rate: 30 },
    ]
  }
};

const TaxConfiguration: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [availableYears, setAvailableYears] = useState(['2025-2026', '2024-2025', '2023-2024']);
  const [tdsRegime, setTdsRegime] = useState<'NEW' | 'OLD'>('NEW');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);

  // Initialize with selected year data
  const [newRegimeSlabs, setNewRegimeSlabs] = useState(HISTORICAL_TAX_DATA['2025-2026'].NEW);
  const [oldRegimeSlabs, setOldRegimeSlabs] = useState(HISTORICAL_TAX_DATA['2025-2026'].OLD);

  // Reset editing state and update slabs when switching year or regime
  useEffect(() => {
    setEditingRowIndex(null);
    // Only update from historical data if it exists. 
    // For new draft years (like 2026-27), we preserve the current state (which is populated on creation).
    if (HISTORICAL_TAX_DATA[selectedYear]) {
        setNewRegimeSlabs(HISTORICAL_TAX_DATA[selectedYear].NEW);
        setOldRegimeSlabs(HISTORICAL_TAX_DATA[selectedYear].OLD);
    }
  }, [selectedYear]);

  // Helper to format currency
  const formatCurrency = (val: number | null) => {
    if (val === null) return '';
    return val.toLocaleString('en-IN');
  };

  const activeSlabs = tdsRegime === 'NEW' ? newRegimeSlabs : oldRegimeSlabs;

  const updateSlab = (index: number, field: 'from' | 'to' | 'rate', value: string) => {
    const numValue = value === '' ? null : Number(value);
    const isNew = tdsRegime === 'NEW';
    const setter = isNew ? setNewRegimeSlabs : setOldRegimeSlabs;

    setter(prev => {
      const newSlabs = [...prev];
      newSlabs[index] = { ...newSlabs[index], [field]: numValue };
      return newSlabs;
    });
  };

  const handleAddRow = () => {
    const isNew = tdsRegime === 'NEW';
    const setter = isNew ? setNewRegimeSlabs : setOldRegimeSlabs;
    const currentSlabs = isNew ? newRegimeSlabs : oldRegimeSlabs;
    
    // Auto-calculate start based on previous end
    const lastSlab = currentSlabs[currentSlabs.length - 1];
    const newFrom = lastSlab && lastSlab.to ? lastSlab.to + 1 : 0;

    const newSlab = { from: newFrom, to: null, rate: 0 };
    setter([...currentSlabs, newSlab]);
    setEditingRowIndex(currentSlabs.length); // Set the new row to edit mode
  };

  const handleDeleteRow = (index: number) => {
    const isNew = tdsRegime === 'NEW';
    const setter = isNew ? setNewRegimeSlabs : setOldRegimeSlabs;
    setter(prev => prev.filter((_, i) => i !== index));
    if (editingRowIndex === index) setEditingRowIndex(null);
  };

  const handleCreateNewFY = () => {
      const futureYear = '2026-2027';
      // 1. Add to dropdown if not present
      if (!availableYears.includes(futureYear)) {
          setAvailableYears(prev => [futureYear, ...prev]);
      }
      
      // 2. Clone data from current year (2025-26) as base
      // Using JSON parse/stringify for deep copy to avoid reference issues
      const clonedNew = JSON.parse(JSON.stringify(HISTORICAL_TAX_DATA['2025-2026'].NEW));
      const clonedOld = JSON.parse(JSON.stringify(HISTORICAL_TAX_DATA['2025-2026'].OLD));
      
      // 3. Switch context
      setSelectedYear(futureYear);
      setNewRegimeSlabs(clonedNew);
      setOldRegimeSlabs(clonedOld);
      
      // Reset view to default regime
      setTdsRegime('NEW');
      setIsDraftMode(true);
  };

  const handleSaveConfiguration = () => {
      setIsSaving(true);
      
      // Simulate network request
      setTimeout(() => {
          // Save the current state to the historical data object (in-memory persistence)
          HISTORICAL_TAX_DATA[selectedYear] = {
              NEW: newRegimeSlabs,
              OLD: oldRegimeSlabs
          };
          
          setIsSaving(false);
          setIsDraftMode(false);
          alert(`Configuration for ${selectedYear} saved successfully!`);
      }, 500);
  };

  const handleCancel = () => {
      const futureYear = '2026-2027';
      // Switch back to current active year
      setSelectedYear('2025-2026');
      
      // Remove the draft year from dropdown if it was added
      if (availableYears.includes(futureYear)) {
          setAvailableYears(prev => prev.filter(y => y !== futureYear));
      }
      setIsDraftMode(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             Tax Regime Configuration
          </h1>
          <p className="text-slate-500 mt-1">Manage Income Tax (TDS) slabs and regimes for the selected financial year.</p>
        </div>

        {/* Year Selector & New FY Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm h-10">
              <Calendar size={16} className="text-slate-400 ml-2" />
              <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-700 py-1.5 pr-8 pl-2 outline-none cursor-pointer focus:ring-0"
              >
                  {availableYears.map(year => (
                      <option key={year} value={year}>FY {year.replace('-', '-')}</option>
                  ))}
              </select>
          </div>
          <button 
            type="button"
            onClick={handleCreateNewFY}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg text-sm hover:bg-purple-700 shadow-sm h-10 transition-colors"
          >
              <Plus size={16} /> Create New FY 2026–27
          </button>
        </div>
      </div>

      {/* Compliance Alert - Only for Current Year */}
      {selectedYear === '2025-2026' && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
           <AlertCircle className="text-blue-600 mt-0.5 shrink-0" size={20} />
           <div>
              <h3 className="text-sm font-bold text-blue-900">FY 2025–26 Compliance Updates Available</h3>
              <p className="text-xs text-blue-700 mt-1">
                New tax slabs auto-populated from latest budget. Review before saving.
              </p>
           </div>
        </div>
      )}

      {/* Draft Alert - For Future Year */}
      {selectedYear === '2026-2027' && isDraftMode && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 relative z-0">
           <div className="p-1 bg-amber-100 rounded text-amber-600 mt-0.5 shrink-0"><Edit2 size={16} /></div>
           <div>
              <h3 className="text-sm font-bold text-amber-900">Configuring future year – FY 2026–27 (Draft)</h3>
              <p className="text-xs text-amber-700 mt-1">
                You are editing a future financial year. Changes are saved as a draft until published. Data copied from FY 2025-26.
              </p>
           </div>
        </div>
      )}

      {/* Action Buttons - Visible Only When Creating/Editing Future Year AND in Draft Mode */}
      {selectedYear === '2026-2027' && isDraftMode && (
          <div className="flex justify-end gap-3 relative z-10">
              <button 
                 type="button"
                 onClick={handleCancel}
                 className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm"
              >
                 Cancel
              </button>
              <button 
                 type="button"
                 onClick={handleSaveConfiguration}
                 disabled={isSaving}
                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                 {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
          </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6">
            <div className="space-y-6">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                     <button 
                       onClick={() => setTdsRegime('NEW')}
                       className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${tdsRegime === 'NEW' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       New Regime (Default)
                     </button>
                     <button 
                       onClick={() => setTdsRegime('OLD')}
                       className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${tdsRegime === 'OLD' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       Old Regime
                     </button>
                  </div>
                  <div className="text-xs text-slate-600 bg-purple-50 border border-purple-100 px-3 py-2 rounded-lg flex items-center gap-2">
                     <Info size={14} className="text-purple-600" />
                     <span className="font-medium">Surcharge & Health/Education Cess (4%) applies automatically.</span>
                  </div>
               </div>

               <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
                        <tr>
                           <th className="px-6 py-4 w-16 text-center">#</th>
                           <th className="px-6 py-4">Income Range (₹)</th>
                           <th className="px-6 py-4">Tax Rate (%)</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 bg-white">
                        {activeSlabs.map((slab, index) => {
                           const isEditing = editingRowIndex === index;
                           return (
                             <tr key={index} className="group hover:bg-purple-50/30 transition-colors">
                                <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      {isEditing ? (
                                        <>
                                          <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                            <input 
                                              type="number" 
                                              value={slab.from} 
                                              onChange={(e) => updateSlab(index, 'from', e.target.value)}
                                              className="w-36 pl-6 pr-3 py-1.5 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                              placeholder="From"
                                            />
                                          </div>
                                          <span className="text-slate-400 font-medium">–</span>
                                          <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                            <input 
                                              type="number" 
                                              value={slab.to ?? ''} 
                                              onChange={(e) => updateSlab(index, 'to', e.target.value)}
                                              className="w-36 pl-6 pr-3 py-1.5 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                              placeholder="and above"
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        // View Mode
                                        <div className="flex items-center gap-2 font-medium text-slate-700">
                                          <span>₹ {formatCurrency(slab.from)}</span>
                                          <span className="text-slate-400">–</span>
                                          {slab.to === null ? (
                                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">and above</span>
                                          ) : (
                                            <span>₹ {formatCurrency(slab.to)}</span>
                                          )}
                                        </div>
                                      )}
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                  {isEditing ? (
                                    <div className="relative w-28">
                                        <input 
                                          type="number" 
                                          value={slab.rate} 
                                          onChange={(e) => updateSlab(index, 'rate', e.target.value)}
                                          className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                                    </div>
                                  ) : (
                                    <span className="font-bold text-slate-700 bg-purple-50 text-purple-700 px-2 py-1 rounded-md">{slab.rate}%</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex items-center justify-end gap-2">
                                      {isEditing ? (
                                        <button 
                                          onClick={() => setEditingRowIndex(null)}
                                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all shadow-sm"
                                          title="Save Row"
                                        >
                                           <Check size={16} />
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => setEditingRowIndex(index)}
                                          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all"
                                          title="Edit Row"
                                        >
                                           <Edit2 size={16} />
                                        </button>
                                      )}
                                      
                                      <button 
                                        onClick={() => handleDeleteRow(index)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                                        title="Delete Row"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                           );
                        })}
                     </tbody>
                  </table>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                     <button 
                       onClick={handleAddRow}
                       className="text-sm font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Plus size={16} /> Add Slab Row
                     </button>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaxConfiguration;
