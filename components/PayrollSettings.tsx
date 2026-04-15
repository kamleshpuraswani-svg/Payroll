
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, X, Search, Info, HelpCircle, ChevronDown, ChevronLeft, ChevronRight, Loader2, Building2, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ChangeHistory {
    id: string;
    timestamp: string;
    changedBy: string;
    field: string;
    oldValue: string;
    newValue: string;
}

interface PaySchedule {
    id: string;
    name: string;
    frequency: 'Monthly' | 'Weekly' | 'Semi-Monthly';
    payPeriodStart: string;
    payPeriodEnd: string;
    payDate: string;
    status: 'Active' | 'Inactive';
    effectiveDate?: string;
    targetType?: 'Paygroup' | 'BusinessUnit';
    targetId?: string;
    created_by?: string;
    last_modified_by?: string;
    processingDate?: string;
    firstPayDate?: string;
    startMonthStr?: string;
    excludeWeekOffs?: boolean;
    excludeHolidays?: boolean;
    history?: ChangeHistory[];
    // Extended config fields for full sync
    smFirstType?: '15th' | 'custom';
    smFirstCustomDay?: string;
    smSecondType?: 'last' | 'custom';
    smSecondCustomDay?: string;
    payDateDay?: string;
    payDateMonthType?: 'same' | 'following';
    calcBase?: string;
    payPeriodEndDate?: string;
    weeklyPayDay?: string;
    smSecondStandardDay?: string;
    attendanceStartDay?: string;
    attendanceEndDay?: string;
    payrollEndDay?: string;
}

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

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
        status: 'Active',
        created_by: 'System',
        last_modified_by: 'Admin'
    }
];

// --- Calendar Helper Constants & Functions ---
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    // Generate for the next 24 months
    for (let i = 0; i < 24; i++) {
        options.push(`${MONTHS[currentMonth]} ${currentYear}`);
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }
    return options;
};

interface AddPayScheduleModalProps {
    onClose: () => void;
    onSave: (schedule: Partial<PaySchedule>, targetInfo: { targetId: string; targetType: 'Paygroup' | 'BusinessUnit' }) => void;
    initialData?: PaySchedule | null;
    userRole?: string;
    isSaving?: boolean;
    paygroups: any[];
    selectedTarget: string;
}

const AddPayScheduleModal: React.FC<AddPayScheduleModalProps> = ({ onClose, onSave, initialData, userRole, isSaving, paygroups, selectedTarget }) => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'Configuration' | 'History'>('Configuration');

    // Form State
    const [frequency, setFrequency] = useState<'Monthly' | 'Weekly' | 'Semi-Monthly'>(initialData?.frequency || 'Weekly');
    const [weeklyPayDay, setWeeklyPayDay] = useState(() => {
        if (initialData?.weeklyPayDay) return initialData.weeklyPayDay;
        if (initialData?.frequency === 'Weekly' && initialData?.payDate?.startsWith('Every ')) {
            return initialData.payDate.replace('Every ', '').substring(0, 3);
        }
        return 'Fri';
    });
    const [calcBase, setCalcBase] = useState(() => {
        if (initialData?.calcBase) return initialData.calcBase;
        return initialData?.payPeriodStart === 'Organisation working days' ? 'Organisation working days' : 'Actual days in a month';
    });
    const [startMonthStr, setStartMonthStr] = useState(initialData?.startMonthStr || 'December 2025');
    const [firstPayDate, setFirstPayDate] = useState(() => {
        if (!initialData?.firstPayDate) return '';
        
        // Format recovery logic for date picker
        if (initialData.firstPayDate.includes(' ') && !initialData.firstPayDate.includes('-')) {
            try {
                const d = new Date(initialData.firstPayDate);
                if (!isNaN(d.getTime())) {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                }
            } catch (e) {
                console.error('Error recovering date:', e);
            }
        }
        return initialData.firstPayDate;
    });
    const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || '');
    const [excludeWeekOffs, setExcludeWeekOffs] = useState(initialData?.excludeWeekOffs || false);
    const [excludeHolidays, setExcludeHolidays] = useState(initialData?.excludeHolidays || false);
    const [localSelectedTarget, setLocalSelectedTarget] = useState(() => {
        if (initialData?.targetId && initialData?.targetType) {
            const prefix = initialData.targetType === 'Paygroup' ? 'pg' : 'bu';
            return `${prefix}:${initialData.targetId}`;
        }
        return selectedTarget === 'all' ? '' : selectedTarget;
    });

    // Semi-Monthly Specific State
    const [smFirstType, setSmFirstType] = useState<'15th' | 'custom'>(() => initialData?.smFirstType || '15th');
    const [smFirstCustomDay, setSmFirstCustomDay] = useState(() => initialData?.smFirstCustomDay || '15');
    const [payDateDay, setPayDateDay] = useState(() => {
        if (initialData?.payDateDay) return initialData.payDateDay;
        if (initialData?.frequency === 'Monthly' && initialData?.payDate) {
            const match = initialData.payDate.match(/^(\d+)/);
            return match ? match[1] : '7';
        }
        return '7';
    });
    const [payDateMonthType, setPayDateMonthType] = useState<'same' | 'following'>(() => {
        if (initialData?.payDateMonthType) return initialData.payDateMonthType;
        if (initialData?.frequency === 'Monthly' && initialData?.payDate) {
            return initialData.payDate.includes('following month') ? 'following' : 'same';
        }
        return 'same';
    });

    const [processingDate, setProcessingDate] = useState(() => initialData?.processingDate || '7');
    const [payPeriodEndDate, setPayPeriodEndDate] = useState(() => {
        if (initialData?.payPeriodEndDate) return initialData.payPeriodEndDate;
        // Default logic for backward compatibility
        if (initialData?.payPeriodEnd) {
            const match = initialData.payPeriodEnd.match(/^\d+/);
            return match ? match[0] : '28';
        }
        return '28';
    });

    const [smSecondType, setSmSecondType] = useState<'last' | 'custom'>(() => initialData?.smSecondType || 'last');
    const [smSecondStandardDay, setSmSecondStandardDay] = useState(() => initialData?.smSecondStandardDay || '31');
    const [smSecondCustomDay, setSmSecondCustomDay] = useState(() => initialData?.smSecondCustomDay || '16');

    // Attendance & Payroll Period State
    const [attendanceStartDay, setAttendanceStartDay] = useState(() => initialData?.attendanceStartDay || '26');
    const [attendanceEndDay, setAttendanceEndDay] = useState(() => initialData?.attendanceEndDay || '25');
    const [payrollStartDay, setPayrollStartDay] = useState(() => initialData?.payrollStartDay || '1');
    const [payrollEndDay, setPayrollEndDay] = useState(() => initialData?.payrollEndDay || '31');

    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [showAttendanceCalcModal, setShowAttendanceCalcModal] = useState(false);

    // Validation State
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Initialization logic removed as it's now in useState initializers
    
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

    // Reset processing date if it exceeds current month's days
    useEffect(() => {
        if (parseInt(processingDate) > daysInSelectedMonth) {
            setProcessingDate(daysInSelectedMonth.toString());
        }
    }, [daysInSelectedMonth]);

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
                // Now representing 1st of following month
                let nextMonthIndex = selectedMonthIndex + 1;
                let nextYear = selectedYear;
                if (nextMonthIndex > 11) {
                    nextMonthIndex = 0;
                    nextYear++;
                }
                date2Text = `01 ${MONTHS[nextMonthIndex]} ${nextYear}`;
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

    // Helper to calculate date range for attendance/payroll
    const getPeriodRange = (endDay: string, isAttendance: boolean = false, customStartDay?: string) => {
        if (!startMonthStr) return '';
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const [monthName, yearStr] = startMonthStr.split(' ');
        const monthIdx = months.indexOf(monthName);
        const year = parseInt(yearStr);

        let endDate: Date;
        if (endDay === '31' || endDay === 'last') {
            endDate = new Date(year, monthIdx + 1, 0);
        } else {
            endDate = new Date(year, monthIdx, parseInt(endDay));
        }

        let startDate: Date;
        if (customStartDay) {
            if (isAttendance) {
                // Attendance usually starts in the previous month
                startDate = new Date(year, monthIdx - 1, parseInt(customStartDay));
            } else {
                // Payroll usually starts in the current month
                startDate = new Date(year, monthIdx, parseInt(customStartDay));
            }
        } else {
            startDate = new Date(endDate);
            startDate.setDate(1); // Standard starts at 1st
        }

        const format = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + (d.getFullYear() !== year ? ` ${d.getFullYear()}` : '');
        const formatFull = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        return `${format(startDate)} – ${formatFull(endDate)}`;
    };

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

    const history = initialData?.history || [];

    const handleSave = () => {
        const newErrors: { [key: string]: string } = {};

        // Validate Frequency
        if (!frequency) newErrors.frequency = "Frequency is required";

        // Validate Weekly
        if (frequency === 'Weekly' && !weeklyPayDay) newErrors.weeklyPayDay = "Pay day is required";

        // Validate Common Fields
        if (!startMonthStr) newErrors.startMonth = "Start month is required";
        if (!firstPayDate) newErrors.firstPayDate = "Pay date is required";

        // Determine final pay date description
        let payDateDesc = '';
        let newFirstPayDate = firstPayDate;

        if (frequency === 'Weekly') payDateDesc = `Every ${weeklyPayDay}`;
        else if (frequency === 'Monthly') {
            const suffix = (day: string) => {
                const n = parseInt(day);
                if (n >= 11 && n <= 13) return 'th';
                switch (n % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                }
            };
            payDateDesc = `${payDateDay}${suffix(payDateDay)} of ${payDateMonthType === 'same' ? 'same month' : 'following month'}`;
            
            // Auto-calculate firstPayDate for Monthly
            if (startMonthStr) {
                const [monthName, year] = startMonthStr.split(' ');
                const monthIdx = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(monthName);
                if (monthIdx !== -1) {
                    const date = new Date(parseInt(year), monthIdx + (payDateMonthType === 'following' ? 1 : 0), parseInt(payDateDay));
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    newFirstPayDate = `${yyyy}-${mm}-${dd}`;
                    setFirstPayDate(newFirstPayDate);
                }
            }
        }
        else if (frequency === 'Semi-Monthly') payDateDesc = smSecondType === 'last' ? '15th & Last Day' : `15th & ${smSecondCustomDay}th`;

        const [targetTypeRaw, targetId] = localSelectedTarget.split(':');
        const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';

        // Change Detection for History
        const newHistoryRecords: ChangeHistory[] = [];
        const timestamp = new Date().toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
        const changedBy = userRole === 'HR_MANAGER' ? 'HR Manager' : 'Admin';

        const addHistory = (field: string, oldVal: string, newVal: string) => {
            if (oldVal !== newVal) {
                newHistoryRecords.push({
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp,
                    changedBy,
                    field,
                    oldValue: oldVal || 'Not set',
                    newValue: newVal || 'Not set'
                });
            }
        };

        let hasChanged = false;
        if (!initialData) {
            hasChanged = true;
        } else {
            const initialTarget = initialData.targetType === 'Paygroup' ? `pg:${initialData.targetId}` : `bu:${initialData.targetId}`;
            
            if (initialData.frequency !== frequency) {
                addHistory('Frequency', initialData.frequency, frequency);
                hasChanged = true;
            }
            // Normalize Pay Date for comparison (e.g., "Every Friday" vs "Every Fri")
            const normalizePayDate = (val: string) => {
                if (val.startsWith('Every ')) {
                    return val.substring(0, 9); // "Every Fri"
                }
                return val;
            };

            if (normalizePayDate(initialData.payDate) !== normalizePayDate(payDateDesc)) {
                addHistory('Pay Date', initialData.payDate, payDateDesc);
                hasChanged = true;
            }
            if (initialData.processingDate !== (frequency === 'Monthly' ? processingDate : undefined)) {
                addHistory('Salary Processing Date', initialData.processingDate || 'None', processingDate || 'None');
                hasChanged = true;
            }
            if (initialTarget !== localSelectedTarget) {
                const oldTargetName = initialData.targetType === 'Paygroup' ? paygroups.find(pg => pg.id === initialData.targetId)?.name : initialData.targetId;
                const [newType, newId] = localSelectedTarget.split(':');
                const newTargetName = newType === 'pg' ? paygroups.find(pg => pg.id === newId)?.name : newId;
                addHistory('Target', oldTargetName || 'Unknown', newTargetName || 'Unknown');
                hasChanged = true;
            }
            // Normalize Dates for comparison (ISO vs Display)
            const getTimestamp = (val: string) => {
                if (!val) return 0;
                const d = new Date(val);
                return isNaN(d.getTime()) ? 0 : d.setHours(0, 0, 0, 0);
            };

            if (getTimestamp(initialData.firstPayDate) !== getTimestamp(newFirstPayDate)) {
                addHistory('First Payroll Date', initialData.firstPayDate, newFirstPayDate);
                hasChanged = true;
            }
            if (initialData.startMonthStr !== startMonthStr) {
                addHistory('Start Month', initialData.startMonthStr, startMonthStr);
                hasChanged = true;
            }
            if (frequency === 'Monthly' && initialData.payPeriodEnd !== `${payPeriodEndDate}th`) {
                addHistory('Pay Period End', initialData.payPeriodEnd || 'Not set', `${payPeriodEndDate}th`);
                hasChanged = true;
            }
            const initialCalcBase = initialData.payPeriodStart === 'Organisation working days' ? 'Organisation working days' : 'Actual days in a month';
            if (initialCalcBase !== calcBase) {
                addHistory('Calculation Base', initialCalcBase, calcBase);
                hasChanged = true;
            }
            if (initialData.effectiveDate !== effectiveDate) {
                addHistory('Effective Month', initialData.effectiveDate || 'None', effectiveDate || 'None');
                // Note: Changing ONLY the effective month does NOT set hasChanged to true 
                // to avoid triggering the mandatory validation error on itself.
            }
        }

        // Validate Effective Month for HR Manager
        if (userRole === 'HR_MANAGER' && !effectiveDate) {
            newErrors.effectiveDate = "Effective month is mandatory.";
        }

        if (!localSelectedTarget) {
            newErrors.target = "Business Unit is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setActiveTab('Configuration'); // Switch back to see errors
            return;
        }

        const updatedHistory = [...newHistoryRecords, ...(initialData?.history || [])];

        onSave({
            ...initialData,
            frequency,
            targetId,
            targetType,
            payDate: payDateDesc,
            payPeriodStart: frequency === 'Monthly' ? (() => {
                const endDay = parseInt(payPeriodEndDate);
                const currentM = startMonthStr.split(' ')[0];
                const currentY = parseInt(startMonthStr.split(' ')[1]);
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const mIdx = months.indexOf(currentM);
                const endDateObj = new Date(currentY, mIdx, endDay);
                const startDateObj = new Date(endDateObj);
                startDateObj.setDate(startDateObj.getDate() - 30);
                return startDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            })() : (calcBase === 'Organisation working days' ? 'Organisation working days' : 'Actual days in a month'),
            payPeriodEnd: frequency === 'Monthly' ? `${payPeriodEndDate}th` : (initialData?.payPeriodEnd || 'Last'),
            firstPayDate: newFirstPayDate,
            startMonthStr,
            processingDate: frequency === 'Semi-Monthly' ? processingDate : undefined,
            effectiveDate: userRole === 'HR_MANAGER' ? effectiveDate : initialData?.effectiveDate,
            excludeWeekOffs: calcBase === 'Organisation working days' ? excludeWeekOffs : undefined,
            excludeHolidays: calcBase === 'Organisation working days' ? excludeHolidays : undefined,
            // New sync fields
            smFirstType,
            smFirstCustomDay,
            smSecondType,
            smSecondCustomDay,
            payDateDay,
            payDateMonthType,
            calcBase,
            payPeriodEndDate,
            weeklyPayDay,
            smSecondStandardDay,
            attendanceStartDay,
            attendanceEndDay,
            payrollEndDay,
            history: [...(initialData?.history || []), ...newHistoryRecords]
        }, { targetId, targetType });
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
                if (d === parseInt(payDateDay)) {
                    isPayDay = true;
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
                    <CalendarIcon size={16} className="text-sky-400" />
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full animate-in slide-in-from-right-2 duration-300">
            <div className="bg-slate-50 border-b border-slate-200">
                {/* Header with Back Button */}
                <div className="flex justify-between items-center px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => {
                                if (activeTab === 'History') {
                                    setActiveTab('Configuration');
                                } else {
                                    onClose();
                                }
                            }} 
                            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all group border border-slate-200 bg-white"
                            title={activeTab === 'History' ? 'Back to Config' : 'Back to List'}
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                {activeTab === 'History' ? 'Audit History' : (initialData ? `Edit ${frequency} Pay Schedule` : 'Create New Pay Schedule')}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {activeTab === 'History' ? '' : 'Configure payment cycles and processing rules'}
                            </p>
                        </div>
                    </div>

                    {/* Audit History Button (only in Config tab and for HR_MANAGER/ADMIN) */}
                    {activeTab === 'Configuration' && initialData && (
                        <button
                            onClick={() => setActiveTab('History')}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 rounded-lg transition-all bg-white shadow-sm"
                        >
                            <Clock size={16} /> Audit History
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-8">
                    {activeTab === 'Configuration' ? (
                        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-left-2 duration-300">

                        <div className="flex-1">
                            <div className="space-y-8">
                                {/* Target Selection */}
                                <div className="w-full lg:w-1/2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Business Unit <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            disabled={userRole === 'HR_MANAGER'}
                                            value={localSelectedTarget}
                                            onChange={(e) => setLocalSelectedTarget(e.target.value)}
                                            className={`w-full border rounded-lg pl-4 pr-10 py-2.5 text-sm bg-white text-slate-700 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 ${errors.target ? 'border-rose-500' : 'border-slate-200'} ${userRole === 'HR_MANAGER' ? 'bg-slate-50 opacity-80 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">Select a unit or paygroup</option>
                                            <optgroup label="Business Units">
                                                {BUSINESS_UNITS.map(bu => (
                                                    <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                    {errors.target && <p className="text-xs text-rose-500 mt-1">{errors.target}</p>}
                                </div>

                                {/* Frequency */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Pay Schedule <span className="text-rose-500">*</span></label>
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
                                    {initialData && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><Info size={12} /> Pay frequency cannot be changed once created.</p>}
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
                                                            {Array.from({ length: 16 }, (_, i) => i + 1).map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                        <span className="text-sm text-slate-500">of same month</span>
                                                    </div>
                                                </label>
                                            </div>
                                            <p className="text-[11px] text-sky-600 font-medium italic mt-2.5 bg-sky-50/50 px-3 py-1.5 rounded-lg border border-sky-100/50 w-fit">
                                                Salary will be processed on {smFirstType === '15th' ? '15th' : (() => {
                                                    const n = parseInt(smFirstCustomDay);
                                                    const j = n % 10, k = n % 100;
                                                    if (j === 1 && k !== 11) return n + "st";
                                                    if (j === 2 && k !== 12) return n + "nd";
                                                    if (j === 3 && k !== 13) return n + "rd";
                                                    return n + "th";
                                                })()} of every month.
                                            </p>
                                        </div>

                                        {/* 2nd Period Config - Restored radios */}
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 mb-3">Pay Schedule for 16th to the end of month:</p>
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${smSecondType === 'last' ? 'border-sky-600 ring-4 ring-sky-50' : 'border-slate-300 group-hover:border-sky-300'}`}>
                                                        {smSecondType === 'last' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-in zoom-in-50" />}
                                                    </div>
                                                    <input type="radio" name="semi2" checked={smSecondType === 'last'} onChange={() => setSmSecondType('last')} className="hidden" />
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <select
                                                                value={smSecondStandardDay}
                                                                onChange={(e) => {
                                                                    setSmSecondStandardDay(e.target.value);
                                                                    setSmSecondType('last');
                                                                }}
                                                                className={`w-24 pl-3 pr-8 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-bold ${smSecondType === 'last' ? 'border-sky-500 text-sky-700' : 'border-slate-200 text-slate-400'}`}
                                                            >
                                                                {Array.from({ length: 16 }, (_, i) => i + 16).map(d => (
                                                                    <option key={d} value={d}>{d}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                        </div>
                                                        <span className={`text-sm transition-colors ${smSecondType === 'last' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>of same month</span>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${smSecondType === 'custom' ? 'border-sky-600 ring-4 ring-sky-50' : 'border-slate-300 group-hover:border-sky-300'}`}>
                                                        {smSecondType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-in zoom-in-50" />}
                                                    </div>
                                                    <input type="radio" name="semi2" checked={smSecondType === 'custom'} onChange={() => setSmSecondType('custom')} className="hidden" />
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <select
                                                                value={smSecondCustomDay}
                                                                onChange={(e) => {
                                                                    setSmSecondCustomDay(e.target.value);
                                                                    setSmSecondType('custom');
                                                                }}
                                                                className={`w-24 pl-3 pr-8 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-bold ${smSecondType === 'custom' ? 'border-sky-500 text-sky-700' : 'border-slate-200 text-slate-400'}`}
                                                            >
                                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                                    <option key={d} value={d}>{d}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                        </div>
                                                        <span className={`text-sm transition-colors ${smSecondType === 'custom' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>of following month</span>
                                                    </div>
                                                </label>
                                            </div>
                                            <p className="text-[11px] text-sky-600 font-medium italic mt-2.5 bg-sky-50/50 px-3 py-1.5 rounded-lg border border-sky-100/50 w-fit">
                                                Salary will be processed on {smSecondType === 'last' ? (() => {
                                                    const n = parseInt(smSecondStandardDay);
                                                    const j = n % 10, k = n % 100;
                                                    const suffix = (j === 1 && k !== 11) ? "st" : (j === 2 && k !== 12) ? "nd" : (j === 3 && k !== 13) ? "rd" : "th";
                                                    return n + suffix + " of every month";
                                                })() : (() => {
                                                    const n = parseInt(smSecondCustomDay);
                                                    const j = n % 10, k = n % 100;
                                                    const suffix = (j === 1 && k !== 11) ? "st" : (j === 2 && k !== 12) ? "nd" : (j === 3 && k !== 13) ? "rd" : "th";
                                                    return n + suffix + " of every following month";
                                                })()}.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Config Fields Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mt-4">
                                    {/* Column 1 */}
                                    <div className="space-y-8">
                                        {/* Calculate salary based on? */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                Calculate salary based on? <span className="text-rose-500">*</span>
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
                                                    <span className="text-sm text-slate-700">{frequency === 'Weekly' ? 'Actual days in a week' : 'Actual days in a month'}</span>
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
                                                    <span className="text-sm text-slate-700">Organisation working days (per {frequency === 'Weekly' ? 'week' : 'month'})</span>
                                                    <div className="group relative ml-1 inline-block align-middle">
                                                        <Info size={14} className="text-slate-400 cursor-help" />
                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-pre-wrap w-48 pointer-events-none z-50 text-center">
                                                            Based on configured company calendar excluding selected week-offs and holidays.
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Row 2, Col 1: First Pay Date (For Weekly) */}
                                        {frequency === 'Weekly' && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">First Pay Date <span className="text-rose-500">*</span></label>
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
                                                    <select
                                                        value={firstPayDate}
                                                        onChange={(e) => setFirstPayDate(e.target.value)}
                                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-bold text-sky-700 ${errors.firstPayDate ? 'border-rose-500' : 'border-slate-200'}`}
                                                    >
                                                        <option value="">Select pay date</option>
                                                        {payDateOptions.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                                {errors.firstPayDate && <p className="text-rose-500 text-[11px] mt-1.5 font-bold flex items-center gap-1"><Info size={12} /> {errors.firstPayDate}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-8">
                                        {/* First Payroll Month */}
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">First Payroll Month <span className="text-rose-500">*</span></label>
                                            <p className="text-[11px] text-slate-500 mb-2 -mt-1 font-medium italic">Defines the starting month for payroll processing.</p>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <select
                                                    value={startMonthStr}
                                                    onChange={(e) => setStartMonthStr(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-medium text-slate-700"
                                                >
                                                    <option value="">Select start month</option>
                                                    {Array.from({ length: 12 }, (_, i) => {
                                                        const d = new Date();
                                                        d.setMonth(d.getMonth() + i);
                                                        const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                                                        return <option key={label} value={label}>{label}</option>;
                                                    })}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                            {errors.startMonthStr && <p className="text-rose-500 text-[11px] mt-1.5 font-bold flex items-center gap-1"><Info size={12} /> {errors.startMonthStr}</p>}
                                        </div>

                                        {/* Effective Month — shown for Weekly & Semi-Monthly (Monthly has it in Pay Schedule Period row) */}
                                        {userRole === 'HR_MANAGER' && frequency !== 'Monthly' && (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                    Effective Month <span className="text-rose-500">*</span>
                                                    <div className="group relative">
                                                        <Info size={14} className="text-slate-400 cursor-help" />
                                                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-pre-wrap w-56 pointer-events-none z-[100] text-center shadow-xl border border-slate-700/50 backdrop-blur-sm">
                                                            <div className="relative z-10">The month from which this pay schedule configuration will be applied.</div>
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700/50"></div>
                                                        </div>
                                                    </div>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={effectiveDate}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEffectiveDate(e.target.value)}
                                                        className={`w-full border rounded-lg pl-4 pr-10 py-2.5 text-sm bg-white text-slate-700 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 ${errors.effectiveDate ? 'border-rose-500' : 'border-slate-200'}`}
                                                    >
                                                        <option value="">Select effective month</option>
                                                        {monthOptions.map((m: string) => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                                {errors.effectiveDate && <p className="text-xs text-rose-500 mt-1">{errors.effectiveDate}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                    {frequency === 'Monthly' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 col-span-full">
                                            {/* Monthly Salary Processing Date - Full Width Row */}
                                            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                                <label className="block text-sm font-bold text-slate-700 mb-4">Monthly Salary Processing Date <span className="text-rose-500">*</span></label>
                                                <div className="flex flex-wrap items-center gap-8">
                                                    <div className="relative w-24">
                                                        <select
                                                            value={payDateDay}
                                                            onChange={(e) => setPayDateDay(e.target.value)}
                                                            className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-bold text-sky-700 text-center shadow-sm"
                                                        >
                                                            {Array.from({ length: daysInSelectedMonth }, (_, i) => (
                                                                <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-8">
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payDateMonthType === 'same' ? 'border-sky-600 ring-4 ring-sky-50' : 'border-slate-300 group-hover:border-sky-300'}`}>
                                                                {payDateMonthType === 'same' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-in zoom-in-50" />}
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                className="hidden"
                                                                name="payDateMonthType"
                                                                checked={payDateMonthType === 'same'}
                                                                onChange={() => setPayDateMonthType('same')}
                                                            />
                                                            <span className={`text-sm ${payDateMonthType === 'same' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Same month</span>
                                                        </label>
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payDateMonthType === 'following' ? 'border-sky-600 ring-4 ring-sky-50' : 'border-slate-300 group-hover:border-sky-300'}`}>
                                                                {payDateMonthType === 'following' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-in zoom-in-50" />}
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                className="hidden"
                                                                name="payDateMonthType"
                                                                checked={payDateMonthType === 'following'}
                                                                onChange={() => setPayDateMonthType('following')}
                                                            />
                                                            <span className={`text-sm ${payDateMonthType === 'following' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Following month</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                {startMonthStr && payDateDay && (
                                                    <p className="text-[11px] text-sky-600/70 font-medium italic mt-3 bg-white/50 px-3 py-1.5 rounded-lg border border-sky-100/30 w-fit">
                                                        {(() => {
                                                            const currentM = startMonthStr.split(' ')[0];
                                                            const getNextMonth = (s: string) => {
                                                                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                                                const idx = months.indexOf(s);
                                                                return idx === -1 ? "Next month" : months[(idx + 1) % 12];
                                                            };
                                                            const getOrd = (d: string) => {
                                                                const n = parseInt(d);
                                                                const j = n % 10, k = n % 100;
                                                                if (j === 1 && k !== 11) return n + "st";
                                                                if (j === 2 && k !== 12) return n + "nd";
                                                                if (j === 3 && k !== 13) return n + "rd";
                                                                return n + "th";
                                                            };
                                                            const nxtM = getNextMonth(currentM);
                                                            const ordDay = getOrd(payDateDay);
                                                            return `Salary will be processed on the ${ordDay} of the ${payDateMonthType === 'same' ? 'same month' : 'following month'} every month.`;
                                                        })()}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    )}


                                    {frequency === 'Monthly' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 col-span-full mt-6">
                                            {/* Attendance Period Section */}
                                            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                        Attendance Period <span className="text-rose-500">*</span>
                                                        <div className="group relative">
                                                            <Info size={14} className="text-slate-400 cursor-help" />
                                                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[100]">
                                                                Define the attendance cycle for calculation
                                                            </div>
                                                        </div>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAttendanceCalcModal(true)}
                                                        className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 transition-colors"
                                                    >
                                                        <Info size={12} />
                                                        Attendance Period Calculation
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <div className="relative w-24">
                                                        <select
                                                            value={attendanceEndDay}
                                                            onChange={(e) => {
                                                                const newEnd = e.target.value;
                                                                setAttendanceEndDay(newEnd);
                                                                // Automatically set start day as (End + 1) of previous month
                                                                const startDay = (parseInt(newEnd) % 31) + 1;
                                                                setAttendanceStartDay(String(startDay));
                                                            }}
                                                            className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-sky-500/20 outline-none shadow-sm"
                                                        >
                                                            {Array.from({ length: 31 }, (_, i) => (
                                                                <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500">End Day of month</span>
                                                </div>
                                                <div className="mt-4 bg-emerald-50 border border-emerald-100/50 rounded-xl px-4 py-2.5 flex items-center gap-2.5 w-fit">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                                    <span className="text-[11px] font-bold text-emerald-700">Attendance counted: {getPeriodRange(attendanceEndDay, true, attendanceStartDay)}</span>
                                                </div>
                                            </div>

                                            {/* Payroll Period Section */}
                                            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                    Payroll Period <span className="text-rose-500">*</span>
                                                    <div className="group relative">
                                                        <HelpCircle size={14} className="text-slate-400 cursor-help" />
                                                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[100]">
                                                            The period for which salary is released
                                                        </div>
                                                    </div>
                                                </label>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <div className="relative w-24">
                                                        <select
                                                            value={payrollStartDay}
                                                            onChange={(e) => setPayrollStartDay(e.target.value)}
                                                            className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-sky-500/20 outline-none shadow-sm"
                                                        >
                                                            {Array.from({ length: 31 }, (_, i) => (
                                                                <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500">of current month</span>
                                                    <span className="text-slate-400 text-xs font-bold px-2">TO</span>
                                                    <div className="relative w-24">
                                                        <select
                                                            value={payrollEndDay}
                                                            onChange={(e) => setPayrollEndDay(e.target.value)}
                                                            className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-sky-500/20 outline-none shadow-sm"
                                                        >
                                                            <option value="31">31</option>
                                                            {Array.from({ length: 30 }, (_, i) => (
                                                                <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500">of current month</span>
                                                </div>
                                                <div className="mt-4 bg-orange-50 border border-orange-100/50 rounded-xl px-4 py-2.5 flex items-center gap-2.5 w-fit">
                                                    <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                                                    <span className="text-[11px] font-bold text-orange-700">Payroll released: {getPeriodRange(payrollEndDay, false, payrollStartDay)}</span>
                                                </div>
                                            </div>

                                            {userRole === 'HR_MANAGER' && (
                                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                        Effective Month <span className="text-rose-500">*</span>
                                                        <div className="group relative">
                                                            <Info size={14} className="text-slate-400 cursor-help" />
                                                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-pre-wrap w-56 pointer-events-none z-[100] text-center shadow-xl border border-slate-700/50 backdrop-blur-sm">
                                                                <div className="relative z-10">The month from which this pay schedule configuration will be applied.</div>
                                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700/50"></div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    <div className="relative max-w-sm">
                                                        <select
                                                            value={effectiveDate}
                                                            onChange={(e) => setEffectiveDate(e.target.value)}
                                                            className={`w-full border rounded-lg pl-4 pr-10 py-2.5 text-sm bg-white text-slate-700 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 ${errors.effectiveDate ? 'border-rose-500' : 'border-slate-200'}`}
                                                        >
                                                            <option value="">Select effective month</option>
                                                            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                    </div>
                                                    {errors.effectiveDate && <p className="text-xs text-rose-500 mt-1">{errors.effectiveDate}</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}

                            <div className="text-sm text-slate-500 pt-8 border-t border-slate-100 mt-8 space-y-2">
                                <div>
                                    Pay Period: <span className="font-medium text-sky-600">
                                        {frequency === 'Monthly' && userRole === 'HR_MANAGER' && payPeriodEndDate ? (
                                            (() => {
                                                const endDay = parseInt(payPeriodEndDate);
                                                const currentM = startMonthStr.split(' ')[0];
                                                const currentY = parseInt(startMonthStr.split(' ')[1]);
                                                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                                const mIdx = months.indexOf(currentM);
                                                const endDateObj = new Date(currentY, mIdx, endDay);
                                                const startDateObj = new Date(endDateObj);
                                                startDateObj.setDate(startDateObj.getDate() - 30);
                                                const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                                return `${fmt(startDateObj)} - ${fmt(endDateObj)}`;
                                            })()
                                        ) : (
                                            <>01 {startMonthStr.split(' ')[0]} {selectedYear} - {new Date(selectedYear, selectedMonthIndex + 1, 0).getDate()} {startMonthStr.split(' ')[0]} {selectedYear}</>
                                        )}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 italic">
                                    If the pay date falls on a holiday or Sunday, payroll will be processed on the previous working day.
                                </p>
                            </div>

                            {/* Payroll Summary Section for Monthly */}
                            {frequency === 'Monthly' && (
                                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-emerald-500" />
                                        Payroll Summary
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Period</p>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {getPeriodRange(attendanceEndDay, true, attendanceStartDay)}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payroll Period</p>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {getPeriodRange(payrollEndDay, false, payrollStartDay)}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payout Date</p>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {payDateDay || '—'} {payDateMonthType === 'same' ? startMonthStr.split(' ')[0] : (() => {
                                                    const mIdx = MONTHS.indexOf(startMonthStr.split(' ')[0]);
                                                    return MONTHS[(mIdx + 1) % 12];
                                                })()}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calculation Base</p>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {calcBase === 'Organisation working days' ? 'Working Days' : 'Actual Days'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Calendar Preview Section */}
                    <div className="w-full lg:w-80 shrink-0">
                        {renderCalendar()}
                    </div>
                </div>
                    ) : (
                        /* History View - Redesigned with Sidebar */
                        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex flex-col lg:flex-row gap-0 border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm min-h-[500px]">
                                {/* Main Content: Configuration Detail (Left) */}
                                <div className="flex-1 p-8 bg-white border-r border-slate-100">
                                    <div className="mb-8">
                                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            Configuration Details
                                            {(!selectedRecordId || selectedRecordId === (history[0]?.id)) && (
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded border border-emerald-100">Current Version</span>
                                            )}
                                        </h4>
                                    </div>

                                    {history.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 mb-4">
                                                <Clock size={40} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-slate-800 font-bold text-lg">No history available</p>
                                            <p className="text-slate-500 text-sm max-w-xs mt-2">Changes are recorded only when you save updates to an existing configuration.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            {/* Logic to reconstruct historical state */}
                                            {(() => {
                                                const selectedIndex = selectedRecordId ? history.findIndex(r => r.id === selectedRecordId) : 0;
                                                
                                                // Start with current simplified state
                                                // Map old labels to new ones if they appear in history
                                                const histState: any = {
                                                    'Pay Schedule': frequency,
                                                    'Business Unit': paygroups.find(pg => pg.id === initialData?.targetId)?.name || initialData?.targetId || 'Not set',
                                                    'Monthly Salary Processing Date': initialData?.payDate || 'Not set',
                                                    'First Payroll Month': startMonthStr,
                                                    'Effective Month': effectiveDate || 'Not set',
                                                    'Calculate salary based on?': calcBase,
                                                    'Pay Schedule Period': initialData?.payPeriodEnd || 'Not set'
                                                };

                                                // Replay history backwards from current to selected
                                                if (selectedIndex > 0) {
                                                    for (let i = 0; i < selectedIndex; i++) {
                                                        const record = history[i];
                                                        // Map legacy history field names to new labels
                                                        let label = record.field;
                                                        if (label === 'Frequency') label = 'Pay Schedule';
                                                        if (label === 'Target') label = 'Business Unit';
                                                        if (label === 'Pay Date') label = 'Monthly Salary Processing Date';
                                                        if (label === 'Start Month') label = 'First Payroll Month';
                                                        if (label === 'First Payroll Date') label = 'Effective Month';
                                                        if (label === 'Calculation Base') label = 'Calculate salary based on?';
                                                        if (label === 'Pay Period End') label = 'Pay Schedule Period';

                                                        histState[label] = record.oldValue;
                                                    }
                                                }

                                                const renderField = (label: string) => {
                                                    // Map current label back to what might be in the selected record's 'field' property
                                                    const recordField = history[selectedIndex]?.field;
                                                    const isModifiedInThisVersion = selectedRecordId ? (
                                                        recordField === label || 
                                                        (label === 'Pay Schedule' && recordField === 'Frequency') ||
                                                        (label === 'Business Unit' && recordField === 'Target') ||
                                                        (label === 'Monthly Salary Processing Date' && recordField === 'Pay Date') ||
                                                        (label === 'First Payroll Month' && recordField === 'Start Month') ||
                                                        (label === 'Effective Month' && recordField === 'First Payroll Date') ||
                                                        (label === 'Calculate salary based on?' && recordField === 'Calculation Base') ||
                                                        (label === 'Pay Schedule Period' && recordField === 'Pay Period End')
                                                    ) : (selectedIndex === 0 && history.length > 0 && (
                                                        history[0].field === label ||
                                                        (label === 'Pay Schedule' && history[0].field === 'Frequency') ||
                                                        (label === 'Business Unit' && history[0].field === 'Target') ||
                                                        (label === 'Monthly Salary Processing Date' && history[0].field === 'Pay Date') ||
                                                        (label === 'First Payroll Month' && history[0].field === 'Start Month') ||
                                                        (label === 'Effective Month' && history[0].field === 'First Payroll Date') ||
                                                        (label === 'Calculate salary based on?' && history[0].field === 'Calculation Base') ||
                                                        (label === 'Pay Schedule Period' && history[0].field === 'Pay Period End')
                                                    ));

                                                    const value = histState[label];

                                                    return (
                                                        <div className="space-y-1.5">
                                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                                                            <div className={`text-sm font-medium p-3 rounded-xl border ${isModifiedInThisVersion ? 'bg-sky-50/50 border-sky-100 text-sky-900 shadow-sm' : 'bg-slate-50/30 border-slate-100 text-slate-700'}`}>
                                                                {value || 'Not set'}
                                                                {isModifiedInThisVersion && <span className="ml-2 text-[10px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded font-bold">CHANGED</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                };

                                                return (
                                                    <>
                                                        {renderField('Pay Schedule')}
                                                        {renderField('Business Unit')}
                                                        {renderField('Monthly Salary Processing Date')}
                                                        {renderField('First Payroll Month')}
                                                        {renderField('Effective Month')}
                                                        {renderField('Calculate salary based on?')}
                                                        {renderField('Pay Schedule Period')}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Removed Historical View Box */}
                                </div>

                                {/* Sidebar: Version History (Right) */}
                                <div className="w-full lg:w-[320px] bg-slate-50 p-6 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                    <div className="mb-6">
                                        <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Version History</h4>
                                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">View previous of pay schedules.</p>
                                    </div>

                                    <div className="space-y-3">
                                        {history.length === 0 ? (
                                            <div className="py-12 text-center text-slate-400 text-xs italic">No versions recorded.</div>
                                        ) : (
                                            history.map((record, index) => (
                                                <button
                                                    key={record.id}
                                                    onClick={() => setSelectedRecordId(record.id)}
                                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative
                                                        ${(selectedRecordId === record.id || (!selectedRecordId && index === 0))
                                                            ? 'bg-white border-sky-200 shadow-md ring-1 ring-sky-100' 
                                                            : 'bg-transparent border-slate-200/60 hover:bg-white hover:border-slate-300'}
                                                    `}
                                                >
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex flex-col">
                                                                <span className={`text-[13px] font-bold ${(selectedRecordId === record.id || (!selectedRecordId && index === 0)) ? 'text-slate-900' : 'text-slate-700'}`}>
                                                                    {record.timestamp.split(', ')[0]}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                                    {record.timestamp.split(', ')[1]}
                                                                </span>
                                                            </div>
                                                            {index === 0 && (
                                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded uppercase border border-emerald-100 shadow-sm shrink-0">Current</span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                                                {record.changedBy.charAt(0)}
                                                            </div>
                                                            <span className="text-[11px] font-bold text-slate-500">{record.changedBy}</span>
                                                        </div>
                                                    </div>

                                                    {(selectedRecordId === record.id || (!selectedRecordId && index === 0)) && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-sky-500 rounded-full blur-[2px] opacity-20"></div>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'Configuration' && (
                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-start gap-4">
                        <button onClick={onClose} disabled={isSaving} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-bold hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {isSaving && <Loader2 size={16} className="animate-spin" />}
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {/* Attendance Period Calculation Modal */}
            {showAttendanceCalcModal && (() => {
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const [curMonthName, curYearStr] = startMonthStr.split(' ');
                const curMonthIdx = months.indexOf(curMonthName);
                const curYear = parseInt(curYearStr);

                const prevMonthIdx = curMonthIdx === 0 ? 11 : curMonthIdx - 1;
                const nextMonthIdx = curMonthIdx === 11 ? 0 : curMonthIdx + 1;

                const prevMonthName = months[prevMonthIdx];
                const nextMonthName = months[nextMonthIdx];

                const attStart = parseInt(attendanceStartDay);
                const attEnd = parseInt(attendanceEndDay);
                const payStart = parseInt(payrollStartDay);
                const payEnd = payrollEndDay === '31' ? new Date(curYear, curMonthIdx + 1, 0).getDate() : parseInt(payrollEndDay);
                const payoutDay = parseInt(payDateDay);
                const payoutMonth = payDateMonthType === 'same' ? curMonthName : nextMonthName;

                const getOrd = (n: number) => {
                    const j = n % 10, k = n % 100;
                    if (j === 1 && k !== 11) return `${n}st`;
                    if (j === 2 && k !== 12) return `${n}nd`;
                    if (j === 3 && k !== 13) return `${n}rd`;
                    return `${n}th`;
                };

                const attStartLabel = `${attStart} ${prevMonthName.slice(0, 3)}`;
                const attEndLabel = `${attEnd} ${curMonthName.slice(0, 3)}`;
                const payStartLabel = `${payStart} ${curMonthName.slice(0, 3)}`;
                const payEndLabel = `${payEnd} ${curMonthName.slice(0, 3)}`;
                const payoutLabel = `${payoutDay} ${payoutMonth.slice(0, 3)}`;

                return (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setShowAttendanceCalcModal(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <h3 className="text-base font-bold text-slate-800">Attendance Period — explained</h3>
                                <button
                                    onClick={() => setShowAttendanceCalcModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="overflow-y-auto flex-1">
                            {/* Diagram */}
                            <div className="px-6 pt-6 pb-4">
                                {/* Month Headers */}
                                <div className="grid grid-cols-3 mb-3">
                                    {[prevMonthName, curMonthName, nextMonthName].map((m) => (
                                        <div key={m} className="text-center text-xs font-bold text-slate-500">{m}</div>
                                    ))}
                                </div>

                                {/* Vertical separators + rows */}
                                <div className="relative border border-slate-200 rounded-xl overflow-hidden">
                                    {/* Column dividers */}
                                    <div className="absolute inset-0 pointer-events-none flex">
                                        <div className="w-1/3 border-r border-dashed border-slate-200" />
                                        <div className="w-1/3 border-r border-dashed border-slate-200" />
                                        <div className="w-1/3" />
                                    </div>

                                    <div className="relative z-10 py-4 px-3 space-y-5">
                                        {/* Attendance Row */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide w-16 shrink-0 text-right">Attendance</span>
                                            <div className="flex-1 relative h-8">
                                                {/* Bar spanning ~col1-right to ~col2-right */}
                                                <div className="absolute inset-y-0 left-[8%] right-[5%] bg-teal-100 border border-teal-300 rounded-lg flex items-center justify-between px-2">
                                                    <span className="text-[10px] font-bold text-teal-700">{attStartLabel}</span>
                                                    <span className="text-[10px] font-semibold text-teal-600 hidden sm:block">Attendance feeds salary calculation</span>
                                                    <span className="text-[10px] font-bold text-teal-700">{attEndLabel}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payroll Period Row */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide w-16 shrink-0 text-right leading-tight">Payroll<br/>period</span>
                                            <div className="flex-1 relative h-8">
                                                {/* Bar spanning col2 */}
                                                <div className="absolute inset-y-0 left-[33%] right-[33%] bg-violet-100 border border-violet-300 rounded-lg flex items-center justify-between px-2">
                                                    <span className="text-[10px] font-bold text-violet-700">{payStartLabel}</span>
                                                    <span className="text-[10px] font-bold text-violet-700">{payEndLabel}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payout Row */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide w-16 shrink-0 text-right">Payout</span>
                                            <div className="flex-1 relative h-8 flex items-center">
                                                {/* Arrow pointing to payout date */}
                                                <div
                                                    className="absolute flex flex-col items-center"
                                                    style={{ left: payDateMonthType === 'same' ? '55%' : '88%' }}
                                                >
                                                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                                                        <line x1="10" y1="0" x2="10" y2="18" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,2"/>
                                                        <path d="M5 16 L10 22 L15 16" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5 mt-0.5 whitespace-nowrap">{payoutLabel}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Text */}
                            <div className="mx-6 mb-5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    Attendance cutoff = {getOrd(attEnd)}. So{' '}
                                    <span className="font-semibold text-slate-800">{curMonthName}</span> salary is counted from{' '}
                                    <span className="font-semibold text-teal-700">{attStartLabel} to {attEndLabel} {curYear}</span>, processed across the{' '}
                                    <span className="font-semibold text-violet-700">{payStart}–{payEnd} {curMonthName.slice(0, 3)}</span> payroll window, and paid out on{' '}
                                    <span className="font-semibold text-amber-700">{payoutDay} {payoutMonth}</span>.
                                </p>
                            </div>

                            {/* Monthly Breakdown Table */}
                            <div className="mx-6 mb-6 border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-[11px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-left px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wide">Salary Month</th>
                                            <th className="text-left px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wide">Attendance Period</th>
                                            <th className="text-left px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Days in<br/>Period</th>
                                            <th className="text-left px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wide">Month Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: 8 }, (_, i) => {
                                            const mIdx = (curMonthIdx + i) % 12;
                                            const mYear = curYear + Math.floor((curMonthIdx + i) / 12);
                                            const prevMIdx = mIdx === 0 ? 11 : mIdx - 1;
                                            const prevMYear = mIdx === 0 ? mYear - 1 : mYear;
                                            const daysInPrevMonth = new Date(prevMYear, prevMIdx + 1, 0).getDate();
                                            const partialPrevDays = daysInPrevMonth - attStart + 1;
                                            const totalDays = partialPrevDays + attEnd;
                                            const prevMonthShort = months[prevMIdx].slice(0, 3);
                                            const curMonthShort = months[mIdx].slice(0, 3);
                                            const isPrevFebShort = prevMIdx === 1 && daysInPrevMonth === 28;
                                            const isPrevFebLeap = prevMIdx === 1 && daysInPrevMonth === 29;
                                            const isFebSalaryMonth = mIdx === 1;
                                            let note = '';
                                            if (isPrevFebShort) note = ' (Feb is short!)';
                                            else if (isPrevFebLeap) note = ' (Feb leap year)';
                                            else if (isFebSalaryMonth) note = ' (Feb length irrelevant!)';
                                            const explanation = `${prevMonthShort} ${attStart}\u2013${daysInPrevMonth} = ${partialPrevDays} days + ${curMonthShort} 1\u2013${attEnd} = ${attEnd} \u2192 ${totalDays}${note}`;
                                            const isShort = totalDays <= 28;
                                            const isThirty = totalDays === 30;
                                            const isCurrent = i === 0;
                                            const rowBg = isCurrent ? 'bg-sky-50/60' : isFebSalaryMonth ? 'bg-rose-50/50' : isShort ? 'bg-amber-50/40' : 'bg-white';
                                            const mColor = isCurrent ? 'text-sky-700' : isFebSalaryMonth ? 'text-rose-600' : isShort ? 'text-amber-700' : isThirty ? 'text-teal-700' : 'text-slate-700';
                                            const pColor = isCurrent ? 'text-sky-600' : isFebSalaryMonth ? 'text-rose-500' : isShort ? 'text-amber-600' : isThirty ? 'text-teal-600' : 'text-slate-500';
                                            const badge = isFebSalaryMonth ? 'bg-rose-100 text-rose-700' : isShort ? 'bg-amber-100 text-amber-700' : isThirty ? 'bg-teal-100 text-teal-700' : 'bg-emerald-100 text-emerald-700';
                                            return (
                                                <tr key={i} className={`border-b border-slate-100 last:border-0 ${rowBg}`}>
                                                    <td className="px-3 py-3"><span className={`font-bold ${mColor}`}>{months[mIdx]} {mYear}</span></td>
                                                    <td className="px-3 py-3"><span className={`font-semibold ${pColor}`}>{attStart} {prevMonthShort} \u2192 {attEnd} {curMonthShort}</span></td>
                                                    <td className="px-3 py-3"><span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md font-bold text-[11px] ${badge}`}>{totalDays} days</span></td>
                                                    <td className="px-3 py-3 text-slate-500 leading-snug">{explanation}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

const PayrollSettings: React.FC<{ userRole?: string }> = ({ userRole }) => {
    const [schedules, setSchedules] = useState<PaySchedule[]>([]);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<PaySchedule | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<string>(`bu:${BUSINESS_UNITS[0]}`);
    const [deactivatingSchedule, setDeactivatingSchedule] = useState<PaySchedule | null>(null);

    const filteredSchedules = useMemo(() => {
        if (selectedTarget === 'all') return schedules;

        const [type, id] = selectedTarget.split(':');
        const targetType = type === 'pg' ? 'Paygroup' : 'BusinessUnit';
        
        const savedForTarget = schedules.filter(s => s.targetType === targetType && s.targetId === id);

        if (userRole === 'HR_MANAGER') {
            return MOCK_SCHEDULES.map(mock => {
                const saved = savedForTarget.find(s => s.frequency === mock.frequency);
                return saved ? { ...saved } : { ...mock, id: `mock-${mock.frequency}-${id}`, status: 'Inactive' as const, targetId: id, targetType };
            });
        }

        return savedForTarget;
    }, [schedules, selectedTarget, userRole]);

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            // Fetch Pay Schedules
            const { data: scheduleData, error: scheduleError } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', 'pay_schedules')
                .single();

            if (scheduleError && scheduleError.code !== 'PGRST116') {
                console.error('Error fetching schedules:', scheduleError);
            } else if (scheduleData && scheduleData.config_value) {
                setSchedules(scheduleData.config_value as PaySchedule[]);
            } else {
                setSchedules(MOCK_SCHEDULES);
            }

            // Fetch Paygroups
            const { data: pgData, error: pgError } = await supabase
                .from('paygroups')
                .select('*')
                .order('name');

            if (pgError) {
                console.error('Error fetching paygroups:', pgError);
            } else {
                setPaygroups(pgData || []);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setSchedules(MOCK_SCHEDULES);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleStatusToggle = (id: string) => {
        const scheduleToToggle = filteredSchedules.find(s => s.id === id);
        if (!scheduleToToggle) return;

        const isActivating = scheduleToToggle.status === 'Inactive' || !scheduleToToggle.status;
        
        if (!isActivating) {
            setDeactivatingSchedule(scheduleToToggle);
            return;
        }

        processStatusToggle(id, isActivating);
    };

    const processStatusToggle = async (id: string, isActivating: boolean) => {
        const scheduleToToggle = filteredSchedules.find(s => s.id === id);
        if (!scheduleToToggle) return;
        
        if (isActivating) {
            // Check if any other schedule for the same target is already active
            const otherActive = schedules.find(s => 
                s.id !== id && 
                s.targetId === scheduleToToggle.targetId && 
                s.targetType === scheduleToToggle.targetType && 
                s.status === 'Active'
            );

            if (otherActive) {
                alert(`Only one pay schedule should be active at a time for this ${scheduleToToggle.targetType === 'Paygroup' ? 'Paygroup' : 'Business Unit'}.`);
                return;
            }
        }

        const isMock = id.startsWith('mock-');
        let updatedSchedules;

        if (isMock) {
            const newSchedule = {
                ...scheduleToToggle,
                id: Date.now().toString(),
                status: isActivating ? 'Active' : 'Inactive'
            };
            updatedSchedules = [...schedules, newSchedule as PaySchedule];
        } else {
            updatedSchedules = schedules.map(s => 
                s.id === id ? { ...s, status: (isActivating ? 'Active' : 'Inactive') as 'Active' | 'Inactive' } : s
            );
        }

        try {
            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: 'pay_schedules',
                    config_value: updatedSchedules,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setSchedules(updatedSchedules);
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status.');
        }
    };

    const handleAddNew = () => {
        setEditingSchedule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (schedule: PaySchedule) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleSave = async (scheduleData: Partial<PaySchedule>, targetInfo: { targetId: string; targetType: 'Paygroup' | 'BusinessUnit' }) => {
        const { targetId, targetType } = targetInfo;

        // If saving as active, check if another is active
        if (scheduleData.status === 'Active') {
            const otherActive = schedules.find(s => 
                s.id !== (editingSchedule?.id || '') && 
                s.targetId === targetId && 
                s.targetType === targetType && 
                s.status === 'Active'
            );

            if (otherActive) {
                alert(`Only one pay schedule should be active at a time for this ${targetType === 'Paygroup' ? 'Paygroup' : 'Business Unit'}.`);
                return;
            }
        }

        setIsSaving(true);
        let updatedSchedules: PaySchedule[];

        if (editingSchedule && !editingSchedule.id.startsWith('mock-')) {
            updatedSchedules = schedules.map(s => s.id === editingSchedule.id ? { ...s, ...scheduleData } : s);
        } else {
            const newSchedule = {
                id: Date.now().toString(),
                name: scheduleData.name || (scheduleData.frequency === 'Monthly' ? 'Monthly Schedule' : `${scheduleData.frequency} Schedule`),
                frequency: scheduleData.frequency || 'Monthly',
                payPeriodStart: '1st',
                payPeriodEnd: 'Last',
                payDate: 'Last Working Day',
                status: scheduleData.status || 'Active',
                targetId,
                targetType,
                ...scheduleData
            };
            updatedSchedules = [...schedules, newSchedule as PaySchedule];
        }

        try {
            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: 'pay_schedules',
                    config_value: updatedSchedules,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;

            setSchedules(updatedSchedules);
            setIsModalOpen(false);
            setEditingSchedule(null);
        } catch (error) {
            console.error('Error saving schedules:', error);
            alert('Failed to save pay schedule.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this pay schedule?')) return;

        const updatedSchedules = schedules.filter(s => s.id !== id);
        
        try {
            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: 'pay_schedules',
                    config_value: updatedSchedules,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setSchedules(updatedSchedules);
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Failed to delete pay schedule.');
        }
    };

    if (isModalOpen) {
        return (
            <div className="p-4 lg:p-6 w-full space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <button 
                        onClick={() => {
                            setIsModalOpen(false);
                            setEditingSchedule(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Pay Schedule Configuration
                    </button>
                    <ChevronDown className="text-slate-300 -rotate-90" size={16} />
                    <span className="text-slate-800 font-bold">{editingSchedule ? 'Edit Schedule' : 'Create New'}</span>
                </div>
                <AddPayScheduleModal
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSchedule(null);
                    }}
                    onSave={handleSave}
                    initialData={editingSchedule}
                    userRole={userRole || 'ADMIN'}
                    isSaving={isSaving}
                    paygroups={paygroups}
                    selectedTarget={selectedTarget}
                />
            </div>
        );
    }
    return (
        <div className="p-4 lg:p-6 w-full space-y-6 animate-in fade-in duration-300 pb-20">
            {/* List Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pay Schedule Configuration</h1>
                    <p className="text-slate-500 mt-1">Set up and manage payroll cycles and payment frequencies for your organization.</p>
                </div>
                {/* ... (rest of the header) */}
                <div className="flex items-center gap-3">
                    {userRole === 'HR_MANAGER' && (
                        <div className="relative">
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none"
                            >
                                <optgroup label="Business Units">
                                    {BUSINESS_UNITS.map(bu => (
                                        <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                    ))}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    )}
                    {userRole !== 'HR_MANAGER' && (
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-bold text-sm shadow-sm h-10"
                        >
                            <Plus size={18} /> Add Pay Schedule
                        </button>
                    )}
                </div>
            </div>

            {/* Paygroup Associated BUs Info */}
            {selectedTarget.startsWith('pg:') && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-sky-600 shadow-sm border border-sky-100">
                            <Building2 size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-sky-900 uppercase tracking-wider">Associated Business Units</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {paygroups.find(pg => `pg:${pg.id}` === selectedTarget)?.business_units?.map((bu: string) => (
                                    <span key={bu} className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md text-[10px] font-bold border border-sky-200 uppercase">
                                        {bu}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-lg text-slate-800">Pay Schedules</h3>

                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Schedule Name</th>
                                <th className="px-4 py-3">Pay Day</th>
                                <th className="px-4 py-3">Created By</th>
                                <th className="px-4 py-3">Last Modified By</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Loading pay schedules...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : schedules.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No pay schedules configured for this selection. Click "Add Pay Schedule" to create one.
                                    </td>
                                </tr>
                            ) : filteredSchedules.map((schedule) => (
                                <tr key={schedule.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold w-fit">
                                            <CalendarIcon size={12} /> {schedule.frequency}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{schedule.payDate}</td>
                                    <td className="px-4 py-3 text-slate-500 font-medium">{schedule.created_by || 'Admin'}</td>
                                    <td className="px-4 py-3 text-slate-500 font-medium">{schedule.last_modified_by || 'System'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {userRole === 'HR_MANAGER' && (
                                                <button
                                                    onClick={() => handleStatusToggle(schedule.id)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${schedule.status === 'Active' ? 'bg-sky-500' : 'bg-slate-200'}`}
                                                    title={schedule.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${schedule.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                title="Edit Schedule"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            {/* Deactivation Confirmation Modal */}
            {deactivatingSchedule && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-shrink-0 w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
                                    <AlertCircle size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Deactivate Pay Schedule?</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-1">Status: <span className="text-rose-600 font-bold uppercase tracking-wider text-[10px]">Deactivation Pending</span></p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Are you sure you want to deactivate the <span className="font-bold text-slate-900">{deactivatingSchedule.frequency}</span> pay schedule? This will remove all its settings and configuration. <span className="text-rose-600 font-bold">This action cannot be undone.</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDeactivatingSchedule(null)}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        processStatusToggle(deactivatingSchedule.id, false);
                                        setDeactivatingSchedule(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-200"
                                >
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default PayrollSettings;
