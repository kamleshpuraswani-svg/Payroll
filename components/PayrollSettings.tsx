
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, X, Search, Info, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaySchedule {
  id: string;
  name: string;
  frequency: 'Monthly' | 'Weekly' | 'Semi-Monthly';
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  status: 'Active' | 'Inactive';
}

const MOCK_SCHEDULES: PaySchedule[] = [
  { 
    id: '1', 
    name: 'Monthly', 
    frequency: 'Monthly', 
    payPeriodStart: '1st of the month', 
    payPeriodEnd: 'Last day of the month', 
    payDate: 'Last working day', 
    status: 'Active' 
  },
  { 
    id: '2', 
    name: 'Weekly', 
    frequency: 'Weekly', 
    payPeriodStart: 'Monday', 
    payPeriodEnd: 'Sunday', 
    payDate: 'Every Friday', 
    status: 'Active' 
  },
  { 
    id: '3', 
    name: 'Semi-Monthly', 
    frequency: 'Semi-Monthly', 
    payPeriodStart: '1st & 16th', 
    payPeriodEnd: '15th & Last Day', 
    payDate: '15th & Last', 
    status: 'Active' 
  }
];

// --- Calendar Helper Constants & Functions ---
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthOptions = () => {
    const options = [];
    let currentYear = 2025;
    let currentMonth = 11; // December (0-indexed)
    
    // Generate from Dec 2025 to Dec 2026
    while (currentYear < 2027 || (currentYear === 2026 && currentMonth <= 11)) {
        options.push(`${MONTHS[currentMonth]} ${currentYear}`);
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        if (currentYear === 2027) break;
    }
    return options;
};

interface AddPayScheduleModalProps {
  onClose: () => void;
  onSave: (schedule: Partial<PaySchedule>) => void;
  initialData?: PaySchedule | null;
}

const AddPayScheduleModal: React.FC<AddPayScheduleModalProps> = ({ onClose, onSave, initialData }) => {
  // Form State
  const [frequency, setFrequency] = useState<'Monthly' | 'Weekly' | 'Semi-Monthly'>('Weekly');
  const [weeklyPayDay, setWeeklyPayDay] = useState('Fri');
  const [calcBase, setCalcBase] = useState('Actual days in a month');
  const [startMonthStr, setStartMonthStr] = useState('December 2025');
  const [firstPayDate, setFirstPayDate] = useState('');

  // Semi-Monthly Specific State
  const [smFirstType, setSmFirstType] = useState<'15th' | 'custom'>('15th');
  const [smFirstCustomDay, setSmFirstCustomDay] = useState('15');
  
  const [smSecondType, setSmSecondType] = useState<'last' | 'custom'>('last');
  const [smSecondCustomDay, setSmSecondCustomDay] = useState('16'); // Default to 16th of following month if custom

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize state from initialData if present
  useEffect(() => {
    if (initialData) {
        setFrequency(initialData.frequency);
        // Attempt to parse other fields if they match standard formats
        if (initialData.frequency === 'Weekly' && initialData.payDate.startsWith('Every ')) {
            const day = initialData.payDate.replace('Every ', '').substring(0, 3);
            setWeeklyPayDay(day);
        }
        // Note: For a real app, you would parse other fields like payPeriodStart/End to set smFirstType, etc.
        // For now, we mainly ensure Frequency is set and locked as per requirement.
    }
  }, [initialData]);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  // Derived Date Objects
  const selectedMonthIndex = MONTHS.indexOf(startMonthStr.split(' ')[0]);
  const selectedYear = parseInt(startMonthStr.split(' ')[1]);
  const daysInSelectedMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();

  // Calculate days in next month for dropdown options
  let nextMonthIndexForDropdown = selectedMonthIndex + 1;
  let nextMonthYearForDropdown = selectedYear;
  if (nextMonthIndexForDropdown > 11) {
      nextMonthIndexForDropdown = 0;
      nextMonthYearForDropdown++;
  }
  const daysInNextMonth = new Date(nextMonthYearForDropdown, nextMonthIndexForDropdown + 1, 0).getDate();

  // Generate Pay Date Options based on Frequency & Selections
  const payDateOptions = useMemo(() => {
    const dates: string[] = [];
    
    if (frequency === 'Weekly') {
        const targetDayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weeklyPayDay);
        for (let d = 1; d <= daysInSelectedMonth; d++) {
            const date = new Date(selectedYear, selectedMonthIndex, d);
            if (date.getDay() === targetDayIdx) {
                const dayStr = d.toString().padStart(2, '0');
                dates.push(`${dayStr} ${startMonthStr.split(' ')[0]} ${selectedYear}`);
            }
        }
    } else if (frequency === 'Monthly') {
        // Return empty for Monthly as we use Date Picker
        return []; 
    } else if (frequency === 'Semi-Monthly') {
        // 1st Period Pay Date
        let date1Text = '';
        if (smFirstType === '15th') {
            date1Text = `15 ${startMonthStr.split(' ')[0]} ${selectedYear}`;
        } else {
             // Custom day of same month
             date1Text = `${smFirstCustomDay.toString().padStart(2, '0')} ${startMonthStr.split(' ')[0]} ${selectedYear}`;
        }
        dates.push(date1Text);

        // 2nd Period Pay Date
        let date2Text = '';
        if (smSecondType === 'last') {
            const lastDay = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
            date2Text = `${lastDay} ${startMonthStr.split(' ')[0]} ${selectedYear}`;
        } else {
            // Custom day of following month
            let nextMonthIndex = selectedMonthIndex + 1;
            let nextYear = selectedYear;
            if (nextMonthIndex > 11) {
                nextMonthIndex = 0;
                nextYear++;
            }
            date2Text = `${smSecondCustomDay.toString().padStart(2, '0')} ${MONTHS[nextMonthIndex]} ${nextYear}`;
        }
        dates.push(date2Text);
    }

    return dates;
  }, [frequency, weeklyPayDay, startMonthStr, selectedYear, selectedMonthIndex, daysInSelectedMonth, smFirstType, smFirstCustomDay, smSecondType, smSecondCustomDay]);

  // Reset pay date when options change
  useEffect(() => {
      if (frequency === 'Monthly') return; // Skip auto-select/reset for Monthly date picker

      if (payDateOptions.length > 0) {
          // If previously selected date is still valid, keep it, else default to first option
          if (!firstPayDate || !payDateOptions.includes(firstPayDate)) {
             setFirstPayDate(payDateOptions[0]);
          }
      } else {
          setFirstPayDate('');
      }
  }, [payDateOptions, frequency]);

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate Frequency
    if (!frequency) newErrors.frequency = "Frequency is required";
    
    // Validate Weekly
    if (frequency === 'Weekly' && !weeklyPayDay) newErrors.weeklyPayDay = "Pay day is required";
    
    // Validate Common Fields
    if (!startMonthStr) newErrors.startMonth = "Start month is required";
    if (!firstPayDate) newErrors.firstPayDate = "Pay date is required";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    // Determine final pay date description
    let payDateDesc = '';
    if (frequency === 'Weekly') payDateDesc = `Every ${weeklyPayDay}`;
    else if (frequency === 'Monthly') {
         if(firstPayDate) {
            const d = new Date(firstPayDate);
            payDateDesc = `Monthly on ${d.getDate()}`;
        } else {
            payDateDesc = 'Monthly';
        }
    }
    else if (frequency === 'Semi-Monthly') payDateDesc = smSecondType === 'last' ? '15th & Last Day' : `15th & ${smSecondCustomDay}th`;

    onSave({
        frequency,
        name: initialData?.name || (frequency === 'Monthly' ? 'New Monthly Schedule' : `${frequency} Schedule`),
        status: initialData?.status || 'Active',
        payDate: payDateDesc
    });
  };

  // Calendar Renderer
  const renderCalendar = () => {
    const firstDayOffset = new Date(selectedYear, selectedMonthIndex, 1).getDay(); // 0=Sun
    const days = [];

    // Empty slots for offset (Standard Sun-Sat Grid logic for generation)
    // Note: The visual grid headers in the UI are Mo Tu We Th Fr Sa Su
    // So we need to adjust standard JS getDay() (0=Sun) to match 0=Mon
    
    // JS: 0=Sun, 1=Mon, ... 6=Sat
    // Grid: 0=Mon, ... 6=Sun
    // Conversion: (day + 6) % 7
    const adjustedFirstDayOffset = (firstDayOffset + 6) % 7;

    for (let i = 0; i < adjustedFirstDayOffset; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days
    for (let d = 1; d <= daysInSelectedMonth; d++) {
        const date = new Date(selectedYear, selectedMonthIndex, d);
        let isPayDay = false;

        if (frequency === 'Weekly') {
            if (date.getDay() === ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weeklyPayDay)) {
                isPayDay = true;
            }
        } else if (frequency === 'Monthly') {
             if (firstPayDate) {
                 const [y, m, day] = firstPayDate.split('-').map(Number);
                 if (d === day && selectedMonthIndex === m - 1 && selectedYear === y) {
                     isPayDay = true;
                 }
             }
        } else if (frequency === 'Semi-Monthly') {
             // Logic for Semi-Monthly Highlights
             
             // First Period (1st-15th)
             if (smFirstType === '15th') {
                 if (d === 15) isPayDay = true;
             } else {
                 if (d === parseInt(smFirstCustomDay)) isPayDay = true;
             }

             // Second Period (16th-End)
             if (smSecondType === 'last') {
                 if (d === daysInSelectedMonth) isPayDay = true;
             } else {
                 if (d === parseInt(smSecondCustomDay)) isPayDay = true;
             }
        }

        days.push(
            <div 
                key={d} 
                className={`h-8 w-8 flex items-center justify-center text-xs rounded-lg font-medium transition-colors relative
                    ${isPayDay ? 'bg-sky-100 text-sky-700 font-bold border border-sky-200' : 'text-slate-600 hover:bg-slate-50'}
                `}
            >
                {d}
                {isPayDay && <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full -top-0.5 -right-0.5 border border-white"></div>}
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl mt-6 lg:mt-0">
             <div className="flex items-center gap-2 mb-4">
                 <CalendarIcon size={16} className="text-sky-400"/>
                 <h4 className="font-bold text-sm">How it looks</h4>
             </div>
             <p className="text-xs text-slate-400 mb-4">Projected view for {startMonthStr}</p>
             
             <div className="bg-white rounded-xl p-4 text-slate-800">
                 <h5 className="text-center font-bold mb-4">{startMonthStr}</h5>
                 <div className="grid grid-cols-7 gap-y-2 justify-items-center mb-2">
                     {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                         <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                     ))}
                 </div>
                 <div className="grid grid-cols-7 gap-y-2 justify-items-center">
                     {days}
                 </div>
             </div>
        </div>
    );
  };


  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Pay Schedule' : 'Add Pay Schedule'}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full">
                    <X size={20} />
                </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Section */}
                    <div className="flex-1 space-y-8">
                        {/* Frequency */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">When do you pay your employees? <span className="text-rose-500">*</span></label>
                            <div className="flex gap-6">
                                {['Weekly', 'Semi-Monthly', 'Monthly'].map(f => (
                                    <label key={f} className={`flex items-center gap-2.5 cursor-pointer group ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${frequency === f ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                            {frequency === f && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="freq" 
                                            checked={frequency === f} 
                                            onChange={() => !initialData && setFrequency(f as any)} 
                                            className="hidden" 
                                            disabled={!!initialData}
                                        />
                                        <span className={`text-sm ${frequency === f ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{f}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.frequency && <p className="text-xs text-rose-500 mt-1">{errors.frequency}</p>}
                            {initialData && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><Info size={12}/> Pay frequency cannot be changed once created.</p>}
                        </div>
                        
                        {/* Weekly Specifics */}
                        {frequency === 'Weekly' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Weekly Pay Day <span className="text-rose-500">*</span></label>
                                <div className="flex gap-3 flex-wrap">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <label key={day} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${weeklyPayDay === day ? 'border-sky-600' : 'border-slate-300'}`}>
                                                {weeklyPayDay === day && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="wday" 
                                                className="hidden" 
                                                checked={weeklyPayDay === day} 
                                                onChange={() => setWeeklyPayDay(day)} 
                                            />
                                            <span className="text-sm text-slate-600">{day}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.weeklyPayDay && <p className="text-xs text-rose-500 mt-1">{errors.weeklyPayDay}</p>}
                            </div>
                        )}

                        {/* Semi-Monthly Specifics */}
                        {frequency === 'Semi-Monthly' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-sm font-bold text-sky-600">When would you like to pay? <span className="text-rose-500">*</span></h4>
                                
                                {/* 1st Period Config */}
                                <div>
                                    <p className="text-xs font-bold text-slate-800 mb-3">Pay Schedule for 1st to 15th:</p>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${smFirstType === '15th' ? 'border-sky-600' : 'border-slate-300'}`}>
                                                 {smFirstType === '15th' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                             </div>
                                             <input type="radio" name="semi1" checked={smFirstType === '15th'} onChange={() => setSmFirstType('15th')} className="hidden" />
                                             <span className="text-sm text-slate-700">on 15th of same month</span>
                                         </label>
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${smFirstType === 'custom' ? 'border-sky-600' : 'border-slate-300'}`}>
                                                  {smFirstType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                             </div>
                                             <input type="radio" name="semi1" checked={smFirstType === 'custom'} onChange={() => setSmFirstType('custom')} className="hidden" />
                                             <div className="flex items-center gap-2">
                                                 <select 
                                                    value={smFirstCustomDay} 
                                                    onChange={(e) => setSmFirstCustomDay(e.target.value)}
                                                    disabled={smFirstType !== 'custom'}
                                                    className="border border-slate-300 rounded px-2 py-1 text-sm bg-white text-slate-700 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                                                 >
                                                    {Array.from({length: daysInSelectedMonth}, (_, i) => i + 1).map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                 </select>
                                                 <span className="text-sm text-slate-500">of same month</span>
                                             </div>
                                         </label>
                                    </div>
                                </div>

                                {/* 2nd Period Config */}
                                <div>
                                    <p className="text-xs font-bold text-slate-800 mb-3">Pay Schedule for 16th to the end of month:</p>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${smSecondType === 'last' ? 'border-sky-600' : 'border-slate-300'}`}>
                                                 {smSecondType === 'last' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                             </div>
                                             <input type="radio" name="semi2" checked={smSecondType === 'last'} onChange={() => setSmSecondType('last')} className="hidden" />
                                             <span className="text-sm text-slate-700">on last day of same month</span>
                                         </label>
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${smSecondType === 'custom' ? 'border-sky-600' : 'border-slate-300'}`}>
                                                 {smSecondType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                             </div>
                                             <input type="radio" name="semi2" checked={smSecondType === 'custom'} onChange={() => setSmSecondType('custom')} className="hidden" />
                                             <div className="flex items-center gap-2">
                                                 <select 
                                                    value={smSecondCustomDay} 
                                                    onChange={(e) => setSmSecondCustomDay(e.target.value)}
                                                    disabled={smSecondType !== 'custom'}
                                                    className="border border-slate-300 rounded px-2 py-1 text-sm bg-white text-slate-700 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                                                 >
                                                    {Array.from({length: daysInNextMonth}, (_, i) => i + 1).map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                 </select>
                                                 <span className="text-sm text-slate-500">of following month</span>
                                             </div>
                                         </label>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Common Bottom Fields */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                Calculate monthly salary based on? <span className="text-rose-500">*</span>
                                <Info size={14} className="text-slate-400 cursor-help" />
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcBase === 'Actual days in a month' ? 'border-sky-600' : 'border-slate-300'}`}>
                                        {calcBase === 'Actual days in a month' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                    </div>
                                    <input 
                                        type="radio" 
                                        name="calcbase" 
                                        checked={calcBase === 'Actual days in a month'} 
                                        onChange={() => setCalcBase('Actual days in a month')}
                                        className="hidden" 
                                    />
                                    <span className="text-sm text-slate-700">Actual days in a month</span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcBase === 'Organisation working days' ? 'border-sky-600' : 'border-slate-300'}`}>
                                        {calcBase === 'Organisation working days' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                    </div>
                                    <input 
                                        type="radio" 
                                        name="calcbase" 
                                        checked={calcBase === 'Organisation working days'}
                                        onChange={() => setCalcBase('Organisation working days')}
                                        className="hidden" 
                                    />
                                    <span className="text-sm text-slate-700">Organisation working days (per month)</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Start your first payroll from <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <select 
                                        value={startMonthStr}
                                        onChange={(e) => setStartMonthStr(e.target.value)}
                                        className={`w-full border rounded-lg pl-4 pr-10 py-2.5 text-sm bg-white text-slate-700 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 ${errors.startMonth ? 'border-rose-500' : 'border-slate-200'}`}
                                    >
                                        {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                {errors.startMonth && <p className="text-xs text-rose-500 mt-1">{errors.startMonth}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Select a pay date for your first payroll <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    {frequency === 'Monthly' ? (
                                         <input 
                                            type="date"
                                            value={firstPayDate}
                                            onChange={(e) => setFirstPayDate(e.target.value)}
                                            className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 ${errors.firstPayDate ? 'border-rose-500' : 'border-slate-200'}`}
                                         />
                                    ) : (
                                        <>
                                            <select 
                                                value={firstPayDate}
                                                onChange={(e) => setFirstPayDate(e.target.value)}
                                                className={`w-full border rounded-lg pl-4 pr-10 py-2.5 text-sm bg-white text-slate-700 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 ${errors.firstPayDate ? 'border-rose-500' : 'border-slate-200'}`}
                                            >
                                                {payDateOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </>
                                    )}
                                </div>
                                {errors.firstPayDate && <p className="text-xs text-rose-500 mt-1">{errors.firstPayDate}</p>}
                            </div>
                        </div>
                        
                        <div className="text-sm text-slate-500 pt-2">
                            Pay Period: <span className="font-medium text-sky-600">01 {startMonthStr.split(' ')[0]} {selectedYear} - {new Date(selectedYear, selectedMonthIndex + 1, 0).getDate()} {startMonthStr.split(' ')[0]} {selectedYear}</span>
                        </div>
                    </div>

                    {/* Calendar Preview Section */}
                    <div className="w-full lg:w-80 shrink-0">
                        {renderCalendar()}
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-start gap-3">
                <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                <button onClick={handleSave} className="px-8 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-bold hover:bg-sky-700 transition-colors shadow-sm">Save</button>
            </div>
        </div>
     </div>
  );
};

const PayrollSettings: React.FC = () => {
  const [schedules, setSchedules] = useState<PaySchedule[]>(MOCK_SCHEDULES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PaySchedule | null>(null);

  const handleAddNew = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: PaySchedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSave = (scheduleData: Partial<PaySchedule>) => {
      if (editingSchedule) {
          // Update existing
          setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? { ...s, ...scheduleData } : s));
      } else {
          // Create new
          const newSchedule = {
            id: Date.now().toString(),
            name: scheduleData.name || 'New Schedule',
            frequency: scheduleData.frequency || 'Monthly',
            payPeriodStart: '1st',
            payPeriodEnd: 'Last',
            payDate: 'Last Working Day',
            status: 'Active' as const,
            ...scheduleData
          };
          setSchedules([...schedules, newSchedule as PaySchedule]);
      }
      setIsModalOpen(false);
      setEditingSchedule(null);
  };

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Pay Schedule Configuration</h1>
            <p className="text-slate-500 mt-1">Define and manage pay frequencies across client companies.</p>
        </div>
        <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-bold text-sm shadow-sm"
        >
            <Plus size={18} /> Add Pay Schedule
        </button>
      </div>

      {/* List Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-lg text-slate-800">Pay Schedules</h3>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search schedules..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
            </div>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                <tr>
                    <th className="px-6 py-4">Schedule Name</th>
                    <th className="px-6 py-4">Frequency</th>
                    <th className="px-6 py-4">Pay Day</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-slate-800">{schedule.name}</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                            <CalendarIcon size={12} /> {schedule.frequency}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{schedule.payDate}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${schedule.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {schedule.status === 'Active' && <CheckCircle size={12}/>}
                            {schedule.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => handleEdit(schedule)}
                                className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={16}/>
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
          <AddPayScheduleModal 
            onClose={() => { setIsModalOpen(false); setEditingSchedule(null); }} 
            onSave={handleSave} 
            initialData={editingSchedule}
          />
      )}
    </div>
  );
};

export default PayrollSettings;
