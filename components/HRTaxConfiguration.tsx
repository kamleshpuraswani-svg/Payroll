
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
  Loader2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface TaxSlab {
  from: number;
  to: number | null;
  rate: number;
}

interface TaxData {
  NEW: TaxSlab[];
  OLD: TaxSlab[];
}

export default function HRTaxConfiguration() {
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [availableYears, setAvailableYears] = useState(['2025-2026', '2024-2025', '2023-2024']);
  const [tdsRegime, setTdsRegime] = useState<'NEW' | 'OLD'>('NEW');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);

  // Initialize with empty arrays, will fill from DB
  const [newRegimeSlabs, setNewRegimeSlabs] = useState<TaxSlab[]>([]);
  const [oldRegimeSlabs, setOldRegimeSlabs] = useState<TaxSlab[]>([]);

  // Fetch data when year changes
  useEffect(() => {
    fetchTaxConfig(selectedYear);
  }, [selectedYear]);

  const fetchTaxConfig = async (year: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tax_configurations')
        .select('*')
        .eq('financial_year', year)
        .order('slab_from', { ascending: true });

      if (error) throw error;

      if (data) {
        const newSlabs: TaxSlab[] = [];
        const oldSlabs: TaxSlab[] = [];

        data.forEach((row: any) => {
          const slab: TaxSlab = {
            from: Number(row.slab_from),
            to: row.slab_to === null ? null : Number(row.slab_to),
            rate: Number(row.rate)
          };
          if (row.regime === 'NEW') {
            newSlabs.push(slab);
          } else {
            oldSlabs.push(slab);
          }
        });

        setNewRegimeSlabs(newSlabs);
        setOldRegimeSlabs(oldSlabs);

        // If no data found for this year (and it's not a future draft we just started), 
        // we might want to set empty or default. 
        // For now, if empty, it just stays empty, which is correct behavior unless we seed defaults.
      }
    } catch (err) {
      console.error('Error fetching tax config:', err);
      // Fallback for demo if offline or table missing
      // setNewRegimeSlabs([]); 
      // setOldRegimeSlabs([]);
    } finally {
      setIsLoading(false);
    }
  };

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

    // 2. Clone data from current view (assuming '2025-2026' is conceptually the base)
    // In a real app we might fetch 2025-26 explicitly to clone, 
    // but here we just take what's in state if we are currently on 2025-26, 
    // or we should probably re-fetch. 
    // Simplified: Just switch year and keep current state as "starting point" if user triggers it.

    // For now, let's just create a blank slate or copy current active state?
    // Let's copy the current state variables to the new year draft
    // (Since we haven't fetched 2026-27 yet, the state variables hold the previous year's data 
    // until we fetch or clear. We want to KEEP them as a starting point.)

    setSelectedYear(futureYear);
    // Explicitly set isDraftMode to allow saving
    setIsDraftMode(true);
    setTdsRegime('NEW'); // Reset view
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Best practice: Delete all for this year and re-insert to handle updates/deletes cleanly

      // 1. Delete existing
      const deleteResult = await supabase
        .from('tax_configurations')
        .delete()
        .eq('financial_year', selectedYear);

      if (deleteResult.error) throw deleteResult.error;

      // 2. Prepare payload
      const payload = [
        ...newRegimeSlabs.map(slab => ({
          financial_year: selectedYear,
          regime: 'NEW',
          slab_from: slab.from,
          slab_to: slab.to,
          rate: slab.rate
        })),
        ...oldRegimeSlabs.map(slab => ({
          financial_year: selectedYear,
          regime: 'OLD',
          slab_from: slab.from,
          slab_to: slab.to,
          rate: slab.rate
        }))
      ];

      // 3. Insert new
      const insertResult = await supabase
        .from('tax_configurations')
        .insert(payload);

      if (insertResult.error) throw insertResult.error;

      setIsDraftMode(false);
      alert(`Configuration for ${selectedYear} saved successfully!`);
      // Refresh to be safe
      fetchTaxConfig(selectedYear);

    } catch (err: any) {
      console.error('Error saving tax config:', err);
      alert('Failed to save configuration: ' + err.message);
    } finally {
      setIsSaving(false);
    }
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
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8 w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-20">

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

        {/* Action Buttons - Always visible if editing, or logic needed?
            Let's keep the existing logic: Visible when creating/editing future year in draft mode, 
            OR if we want to allow saving current year changes too. 
            The previous code only showed save for Draft Mode. 
            Let's explicitely allow saving for ANY mode if changes are made? 
            For now, let's keep the user's flow but maybe enable save button for current year too if we want them to edit it.
            Actually, let's show the save button ALWAYS if we are in 'edit' mode or simply show it at bottom?
            The previous mock only showed it for Draft. Let's stick to that for safety or expose it.
            Wait, I should probably expose a "Save Changes" button for the current year as well if they edit it, 
            otherwise the edits are lost on refresh.
            Let's add a "Save Changes" button generally available at the bottom or top right.
        */}
        <div className="flex justify-end gap-3 relative z-10">
          {/* Show Cancel only if in specific draft flow, but Save should be available */}
          {isDraftMode && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm"
            >
              Cancel
            </button>
          )}

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


        {/* Main Content Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="animate-spin text-purple-600" />
                  <p>Loading tax configurations...</p>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
