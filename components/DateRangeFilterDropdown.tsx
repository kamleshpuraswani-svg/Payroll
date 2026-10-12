import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export const DateRangeFilterDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
  presets?: string[];
}> = ({
  value,
  onChange,
  presets = ['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(value);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedPreset(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    setStartDate('');
    setEndDate('');
    onChange(preset);
    setIsOpen(false);
  };

  const formatMonthYearStr = (ym: string) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    if (!y || !m) return ym;
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      const formatted = startDate === endDate
        ? formatMonthYearStr(startDate)
        : `${formatMonthYearStr(startDate)} - ${formatMonthYearStr(endDate)}`;
      setSelectedPreset(formatted);
      onChange(formatted);
    } else if (startDate) {
      const formatted = formatMonthYearStr(startDate);
      setSelectedPreset(formatted);
      onChange(formatted);
    } else if (endDate) {
      const formatted = `Up to ${formatMonthYearStr(endDate)}`;
      setSelectedPreset(formatted);
      onChange(formatted);
    } else {
      setSelectedPreset('Custom Range');
      onChange('Custom Range');
    }
    setIsOpen(false);
  };

  const isCustomActive = !presets.includes(selectedPreset);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`bg-white border text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all shadow-2xs cursor-pointer ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-100 bg-slate-50/50' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <Calendar size={13} className="text-indigo-600 shrink-0" />
        <span className="font-semibold text-slate-800 text-xs truncate max-w-[150px] sm:max-w-none">{value}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[310px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Date Range</p>

          <div className={`grid ${presets.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 mb-3`}>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                  selectedPreset === preset && !isCustomActive
                    ? 'bg-[#3e49e2] border-[#3e49e2] text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isCustomActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                Custom Date Range
              </span>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">From</label>
                <input
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">To</label>
                <input
                  type="month"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCustomApply}
              className="w-full py-2 px-3 bg-[#3e49e2] hover:bg-[#323bc0] text-white font-bold text-xs rounded-lg transition-all text-center cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check size={13} />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilterDropdown;
