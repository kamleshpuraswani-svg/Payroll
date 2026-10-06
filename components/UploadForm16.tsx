import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileArchive,
  Calendar,
  Building,
  Loader2,
  Users,
  CheckSquare,
  Info,
  FileUp,
  ArrowLeft,
  RotateCcw,
  Send
} from 'lucide-react';
import {
  downloadForm16PartA,
  downloadForm16PartB,
  downloadForm16BothZip
} from './form16PdfGenerator';

interface Form16Record {
  id: string;
  empId: string;
  empName: string;
  department: string;
  pan: string;
  financialYear: string;
  assessmentYear: string;
  status: 'Uploaded' | 'Pending';
  partAFileName?: string;
  partBFileName?: string;
  grossSalary: number;
  tdsDeducted: number;
  uploadedAt: string;
  uploadedBy: string;
}

const INITIAL_RECORDS: Form16Record[] = [
  // FY 2024-25 Records
  {
    id: 'F16-001',
    empId: 'TF00912',
    empName: 'Priya Sharma',
    department: 'Engineering',
    pan: 'ABCPS1234F',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_ABCPS1234F_2024-25.pdf',
    partBFileName: 'Form16_PartB_ABCPS1234F_2024-25.pdf',
    grossSalary: 1850000,
    tdsDeducted: 145000,
    uploadedAt: '12 Jun 2025, 11:30 AM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-002',
    empId: 'AC94567',
    empName: 'Arjun Mehta',
    department: 'Product',
    pan: 'BCDAM5678G',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_BCDAM5678G_2024-25.pdf',
    partBFileName: 'Form16_PartB_BCDAM5678G_2024-25.pdf',
    grossSalary: 2400000,
    tdsDeducted: 275000,
    uploadedAt: '12 Jun 2025, 11:32 AM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-003',
    empId: 'SU00234',
    empName: 'Neha Kapoor',
    department: 'Design',
    pan: 'CDENK9012H',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Pending',
    partAFileName: 'Form16_PartA_CDENK9012H_2024-25.pdf',
    grossSalary: 1200000,
    tdsDeducted: 68000,
    uploadedAt: '14 Jun 2025, 03:15 PM',
    uploadedBy: 'System'
  },
  {
    id: 'F16-004',
    empId: 'GL87890',
    empName: 'Rohan Desai',
    department: 'Marketing',
    pan: 'DERD3456J',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_DERD3456J_2024-25.pdf',
    partBFileName: 'Form16_PartB_DERD3456J_2024-25.pdf',
    grossSalary: 1550000,
    tdsDeducted: 102000,
    uploadedAt: '12 Jun 2025, 11:40 AM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-005',
    empId: 'TF00145',
    empName: 'Ananya Patel',
    department: 'Finance',
    pan: 'EFAP7890K',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Pending',
    partBFileName: 'Form16_PartB_EFAP7890K_2024-25.pdf',
    grossSalary: 950000,
    tdsDeducted: 32000,
    uploadedAt: '15 Jun 2025, 10:20 AM',
    uploadedBy: 'System'
  },
  {
    id: 'F16-006',
    empId: 'AC99367',
    empName: 'Vikram Singh',
    department: 'Sales',
    pan: 'FGVS2345L',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_FGVS2345L_2024-25.pdf',
    partBFileName: 'Form16_PartB_FGVS2345L_2024-25.pdf',
    grossSalary: 2100000,
    tdsDeducted: 215000,
    uploadedAt: '12 Jun 2025, 11:45 AM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-007',
    empId: 'TF00882',
    empName: 'Kavita Iyer',
    department: 'Human Resources',
    pan: 'GHKI6789M',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Pending',
    grossSalary: 1100000,
    tdsDeducted: 54000,
    uploadedAt: '-',
    uploadedBy: '-'
  },
  {
    id: 'F16-008',
    empId: 'TF00561',
    empName: 'Siddharth Rao',
    department: 'Engineering',
    pan: 'HJSR0123N',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_HJSR0123N_2024-25.pdf',
    partBFileName: 'Form16_PartB_HJSR0123N_2024-25.pdf',
    grossSalary: 2800000,
    tdsDeducted: 360000,
    uploadedAt: '16 Jun 2025, 02:10 PM',
    uploadedBy: 'HR Admin'
  },

  // FY 2023-24 Records
  {
    id: 'F16-009',
    empId: 'TF00912',
    empName: 'Priya Sharma',
    department: 'Engineering',
    pan: 'ABCPS1234F',
    financialYear: '2023-24',
    assessmentYear: '2024-25',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_ABCPS1234F_2023-24.pdf',
    partBFileName: 'Form16_PartB_ABCPS1234F_2023-24.pdf',
    grossSalary: 1600000,
    tdsDeducted: 120000,
    uploadedAt: '10 Jun 2024, 02:15 PM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-010',
    empId: 'AC94567',
    empName: 'Arjun Mehta',
    department: 'Product',
    pan: 'BCDAM5678G',
    financialYear: '2023-24',
    assessmentYear: '2024-25',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_BCDAM5678G_2023-24.pdf',
    partBFileName: 'Form16_PartB_BCDAM5678G_2023-24.pdf',
    grossSalary: 2100000,
    tdsDeducted: 230000,
    uploadedAt: '10 Jun 2024, 02:20 PM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-011',
    empId: 'SU00234',
    empName: 'Neha Kapoor',
    department: 'Design',
    pan: 'CDENK9012H',
    financialYear: '2023-24',
    assessmentYear: '2024-25',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_CDENK9012H_2023-24.pdf',
    partBFileName: 'Form16_PartB_CDENK9012H_2023-24.pdf',
    grossSalary: 1050000,
    tdsDeducted: 52000,
    uploadedAt: '11 Jun 2024, 11:10 AM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-012',
    empId: 'GL87890',
    empName: 'Rohan Desai',
    department: 'Marketing',
    pan: 'DERD3456J',
    financialYear: '2023-24',
    assessmentYear: '2024-25',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_DERD3456J_2023-24.pdf',
    partBFileName: 'Form16_PartB_DERD3456J_2023-24.pdf',
    grossSalary: 1400000,
    tdsDeducted: 88000,
    uploadedAt: '10 Jun 2024, 02:30 PM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-013',
    empId: 'TF00145',
    empName: 'Ananya Patel',
    department: 'Finance',
    pan: 'EFAP7890K',
    financialYear: '2023-24',
    assessmentYear: '2024-25',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_EFAP7890K_2023-24.pdf',
    partBFileName: 'Form16_PartB_EFAP7890K_2023-24.pdf',
    grossSalary: 850000,
    tdsDeducted: 24000,
    uploadedAt: '10 Jun 2024, 02:35 PM',
    uploadedBy: 'HR Admin'
  },

  // FY 2022-23 Records
  {
    id: 'F16-014',
    empId: 'TF00912',
    empName: 'Priya Sharma',
    department: 'Engineering',
    pan: 'ABCPS1234F',
    financialYear: '2022-23',
    assessmentYear: '2023-24',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_ABCPS1234F_2022-23.pdf',
    partBFileName: 'Form16_PartB_ABCPS1234F_2022-23.pdf',
    grossSalary: 1350000,
    tdsDeducted: 95000,
    uploadedAt: '08 Jun 2023, 10:00 AM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-015',
    empId: 'AC94567',
    empName: 'Arjun Mehta',
    department: 'Product',
    pan: 'BCDAM5678G',
    financialYear: '2022-23',
    assessmentYear: '2023-24',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_BCDAM5678G_2022-23.pdf',
    partBFileName: 'Form16_PartB_BCDAM5678G_2022-23.pdf',
    grossSalary: 1800000,
    tdsDeducted: 185000,
    uploadedAt: '08 Jun 2023, 10:15 AM',
    uploadedBy: 'HR Admin'
  },
  {
    id: 'F16-016',
    empId: 'TF00561',
    empName: 'Siddharth Rao',
    department: 'Engineering',
    pan: 'HJSR0123N',
    financialYear: '2022-23',
    assessmentYear: '2023-24',
    status: 'Uploaded',
    partAFileName: 'Form16_PartA_HJSR0123N_2022-23.pdf',
    partBFileName: 'Form16_PartB_HJSR0123N_2022-23.pdf',
    grossSalary: 2300000,
    tdsDeducted: 290000,
    uploadedAt: '09 Jun 2023, 03:45 PM',
    uploadedBy: 'HR Admin'
  }
];

interface Form16MappingItem {
  id: string;
  empCode: string;
  empName: string;
  panProfile: string;
  panForm16: string;
  matchedFiles: string[];
  status: 'MATCHED' | 'PAN_MISSING_PROFILE' | 'PAN_MISSING_FILE' | 'UNMATCHED';
}

const MOCK_MAPPING_DATA: Form16MappingItem[] = [
  {
    id: 'M-01',
    empCode: 'TF00912',
    empName: 'Priya Sharma',
    panProfile: 'ABCPS1234F',
    panForm16: 'ABCPS1234F',
    matchedFiles: ['ABCPS1234F_PartA.pdf', 'ABCPS1234F_PartB.pdf'],
    status: 'MATCHED'
  },
  {
    id: 'M-02',
    empCode: 'AC94567',
    empName: 'Arjun Mehta',
    panProfile: 'BCDAM5678G',
    panForm16: 'BCDAM5678G',
    matchedFiles: ['BCDAM5678G_PartA.pdf', 'BCDAM5678G_PartB.pdf'],
    status: 'MATCHED'
  },
  {
    id: 'M-03',
    empCode: 'GL87890',
    empName: 'Rohan Desai',
    panProfile: 'DERD3456J',
    panForm16: 'DERD3456J',
    matchedFiles: ['DERD3456J_PartA.pdf', 'DERD3456J_PartB.pdf'],
    status: 'MATCHED'
  },
  {
    id: 'M-04',
    empCode: 'TF00145',
    empName: 'Ananya Patel',
    panProfile: 'EFAP7890K',
    panForm16: 'EFAP7890K',
    matchedFiles: ['EFAP7890K_PartA.pdf', 'EFAP7890K_PartB.pdf'],
    status: 'MATCHED'
  },
  {
    id: 'M-05',
    empCode: 'TF00882',
    empName: 'Kavita Iyer',
    panProfile: '', // Missing in Profile
    panForm16: '',
    matchedFiles: [],
    status: 'PAN_MISSING_PROFILE'
  },
  {
    id: 'M-06',
    empCode: 'SU00234',
    empName: 'Neha Kapoor',
    panProfile: 'CDENK9012H',
    panForm16: '', // Missing in File
    matchedFiles: [],
    status: 'PAN_MISSING_FILE'
  },
  {
    id: 'M-07',
    empCode: 'AC99367',
    empName: 'Vikram Singh',
    panProfile: 'FGVS2345L',
    panForm16: '',
    matchedFiles: [],
    status: 'UNMATCHED'
  }
];

const FY_OPTIONS = ['2024-25', '2023-24', '2022-23', '2021-22'];

export const UploadForm16: React.FC = () => {
  const [records, setRecords] = useState<Form16Record[]>(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');

  // Financial Year Filter Dropdown State (like Business Unit dropdown)
  const [selectedFYs, setSelectedFYs] = useState<string[]>(['2024-25']);
  const [fyDropdownOpen, setFyDropdownOpen] = useState(false);
  const [fySearchQuery, setFySearchQuery] = useState('');
  const fyDropdownRef = useRef<HTMLDivElement>(null);

  // Modals & Toast State
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isSingleUploadModalOpen, setIsSingleUploadModalOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<Form16Record | null>(null);
  const [downloadRecord, setDownloadRecord] = useState<Form16Record | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bulk Upload State
  const [bulkModalStep, setBulkModalStep] = useState<1 | 2 | 3>(1);
  const [bulkUploadType, setBulkUploadType] = useState<'ZIP' | 'TRACES_MERGED'>('ZIP');
  const [bulkFY, setBulkFY] = useState('2024-25');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const processingTimersRef = useRef<NodeJS.Timeout[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSign, setAutoSign] = useState(true);
  const [autoPublish, setAutoPublish] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [bulkTargetScope, setBulkTargetScope] = useState<'ALL' | 'PENDING'>('ALL');

  useEffect(() => {
    return () => {
      processingTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Mapping Preview State (Step 2)
  const [mappingRecords, setMappingRecords] = useState<Form16MappingItem[]>(MOCK_MAPPING_DATA);
  const [mappingFilter, setMappingFilter] = useState<'ALL' | 'MATCHED' | 'ERRORS'>('ALL');
  const [mappingSearch, setMappingSearch] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [simulateAllFail, setSimulateAllFail] = useState(false);

  // Single Upload State
  const [singleEmpId, setSingleEmpId] = useState('');
  const [singlePartAFile, setSinglePartAFile] = useState<File | null>(null);
  const [singlePartBFile, setSinglePartBFile] = useState<File | null>(null);
  const [singleZipFile, setSingleZipFile] = useState<File | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Dynamic Lookup Filter States (Same as Employees Compensation) ---
  const FIELDS = [
    { name: 'Status', icon: CheckSquare },
    { name: 'Department', icon: Building },
    { name: 'Employee', icon: Users }
  ];

  const [completedFilters, setCompletedFilters] = useState<any[]>([]);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [currentOperator, setCurrentOperator] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<string[]>([]);
  const [tempContainsText, setTempContainsText] = useState('');
  const [valSearchQuery, setValSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Click outside hook for filter dropdown & FY dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (fyDropdownRef.current && !fyDropdownRef.current.contains(event.target as Node)) {
        setFyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFY = (fy: string) => {
    setSelectedFYs((prev) =>
      prev.includes(fy) ? prev.filter((item) => item !== fy) : [...prev, fy]
    );
    setCurrentPage(1);
  };

  const filteredFyOptions = useMemo(() => {
    return FY_OPTIONS.filter((fy) =>
      fy.toLowerCase().includes(fySearchQuery.toLowerCase())
    );
  }, [fySearchQuery]);

  const getOptionsForField = (field: string) => {
    if (field === 'Status') {
      return ['Uploaded', 'Pending'];
    }
    if (field === 'Financial Year') {
      return ['2024-25', '2023-24', '2022-23', '2021-22'];
    }
    if (field === 'Assessment Year') {
      return ['2025-26', '2024-25', '2023-24', '2022-23'];
    }

    const uniqueValues = new Set<string>();
    records.forEach((r) => {
      if (field === 'Department' && r.department) uniqueValues.add(r.department);
      if (field === 'Employee') uniqueValues.add(r.empName);
    });

    return Array.from(uniqueValues).filter(Boolean).sort();
  };

  const selectField = (field: string) => {
    setCurrentField(field);
    setCurrentOperator(null);
    setTempValues([]);
    setValSearchQuery('');
  };

  const selectOperator = (operator: string) => {
    setCurrentOperator(operator);
    setTempValues([]);
    setValSearchQuery('');
  };

  const toggleTempValue = (val: string) => {
    setTempValues((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const applyCurrentFilter = () => {
    if (currentField && currentOperator) {
      const vals = currentOperator === 'Contains' ? [tempContainsText] : tempValues;
      if (vals.length > 0 && (currentOperator !== 'Contains' || vals[0].trim() !== '')) {
        setCompletedFilters((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            field: currentField,
            operator: currentOperator,
            values: vals
          }
        ]);
        setCurrentField(null);
        setCurrentOperator(null);
        setTempValues([]);
        setTempContainsText('');
        setValSearchQuery('');
        setDropdownOpen(false);
      }
    }
  };

  const cancelCurrentFilter = () => {
    setCurrentField(null);
    setCurrentOperator(null);
    setTempValues([]);
    setTempContainsText('');
    setValSearchQuery('');
    setDropdownOpen(false);
  };

  const removeFilter = (id: string) => {
    setCompletedFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAllFilters = () => {
    setCompletedFilters([]);
    cancelCurrentFilter();
    setSearchTerm('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Records based on FY Dropdown + text search + dynamic filter chips
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Financial Year selection filter
      const matchesFY = selectedFYs.length === 0 || selectedFYs.includes(r.financialYear);
      if (!matchesFY) return false;

      // 2. Text search
      const matchesSearch = searchTerm
        ? r.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.financialYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.assessmentYear.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      if (!matchesSearch) return false;

      // 3. Dynamic lookup filter pills
      for (const filter of completedFilters) {
        let recValue = '';
        if (filter.field === 'Status') recValue = r.status || '';
        else if (filter.field === 'Financial Year') recValue = r.financialYear || '';
        else if (filter.field === 'Assessment Year') recValue = r.assessmentYear || '';
        else if (filter.field === 'Department') recValue = r.department || '';
        else if (filter.field === 'Employee') recValue = r.empName || '';

        const isMatch =
          filter.operator === 'Contains'
            ? recValue.toLowerCase().includes(filter.values[0].toLowerCase())
            : filter.values.some((val: string) => val.toLowerCase() === recValue.toLowerCase());

        if (filter.operator === 'Is' || filter.operator === 'Contains') {
          if (!isMatch) return false;
        } else {
          // 'Is not'
          if (isMatch) return false;
        }
      }

      return true;
    });
  }, [records, selectedFYs, searchTerm, completedFilters]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Statistics Calculations (3 Cards)
  const stats = useMemo(() => {
    const total = 1842;
    const uploadedCount = 1633;
    const pendingCount = 209;

    return {
      totalEmployees: total,
      uploadedCount: uploadedCount,
      pendingCount: pendingCount
    };
  }, []);

  const filteredMappingRecords = useMemo(() => {
    if (!mappingSearch.trim()) return mappingRecords;
    const q = mappingSearch.toLowerCase();
    return mappingRecords.filter((item) => {
      const matchesName = item.empName.toLowerCase().includes(q);
      const matchesCode = item.empCode.toLowerCase().includes(q);
      const matchesPanProfile = item.panProfile.toLowerCase().includes(q);
      const matchesPanForm16 = item.panForm16.toLowerCase().includes(q);
      const matchesFiles = item.matchedFiles.some((f) => f.toLowerCase().includes(q));
      return matchesName || matchesCode || matchesPanProfile || matchesPanForm16 || matchesFiles;
    });
  }, [mappingRecords, mappingSearch]);

  const mappingStats = useMemo(() => {
    const total = mappingRecords.length;
    const matched = mappingRecords.filter((m) => m.status === 'MATCHED').length;
    const missingProfile = mappingRecords.filter((m) => m.status === 'PAN_MISSING_PROFILE').length;
    const missingFile = mappingRecords.filter((m) => m.status === 'PAN_MISSING_FILE').length;
    const unmatched = mappingRecords.filter((m) => m.status === 'UNMATCHED').length;
    return {
      total,
      matched,
      missingProfile,
      missingFile,
      unmatched,
      errorsTotal: missingProfile + missingFile + unmatched
    };
  }, [mappingRecords]);

  const existingUploadedEmpCodes = useMemo(() => {
    return new Set(
      records
        .filter((r) => r.financialYear === bulkFY && r.status === 'Uploaded')
        .map((r) => r.empId)
    );
  }, [records, bulkFY]);

  const handleBulkUploadSubmit = () => {
    setIsProcessing(true);
    setUploadProgress(15);
    
    // Clear any previous running timers
    processingTimersRef.current.forEach(clearTimeout);
    processingTimersRef.current = [];

    const timer1 = setTimeout(() => setUploadProgress(45), 600);
    const timer2 = setTimeout(() => setUploadProgress(85), 1300);
    const timer3 = setTimeout(() => {
      setUploadProgress(100);
      setIsProcessing(false);
      setBulkModalStep(2);
      setUploadProgress(0);
    }, 2200);

    processingTimersRef.current.push(timer1, timer2, timer3);
  };

  const importSummary = useMemo(() => {
    const failedList = mappingRecords.filter((m) => m.status !== 'MATCHED');
    const matchedList = mappingRecords.filter((m) => m.status === 'MATCHED');

    const newlyImported = matchedList.filter((m) => !existingUploadedEmpCodes.has(m.empCode));
    const successCount = overrideExisting
      ? matchedList.length
      : newlyImported.length > 0
      ? newlyImported.length
      : matchedList.length > 0
      ? 1
      : 0;

    const failureCount = failedList.length;

    return {
      successCount: matchedList.length === 0 ? 0 : successCount,
      failureCount,
      failedList,
      matchedList
    };
  }, [mappingRecords, existingUploadedEmpCodes, overrideExisting]);

  const handleStep2ConfirmAndUpload = () => {
    setBulkModalStep(3);
  };

  const handleDownloadFailedRecords = () => {
    const failedList = mappingRecords.filter((m) => m.status !== 'MATCHED');
    if (failedList.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Employee Code,Employee Name,PAN (Profile),PAN (Form-16),Error Reason']
        .concat(
          failedList.map(
            (m) =>
              `"${m.empCode}","${m.empName}","${m.panProfile}","${m.panForm16}","${
                m.status === 'PAN_MISSING_PROFILE'
                  ? 'Error: PAN missing in profile'
                  : m.status === 'PAN_MISSING_FILE'
                  ? 'Error: No file found for this PAN number'
                  : 'Error: PAN not matching with the profile'
              }"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `failed_form16_records_${bulkFY}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded failed records CSV');
  };

  const handleConfirmMappingUpload = () => {
    setIsBulkUploadModalOpen(false);
    setBulkModalStep(1);
    setBulkFile(null);

    setRecords((prev) =>
      prev.map((r) => {
        if (r.financialYear !== bulkFY) return r;

        const mappedItem = mappingRecords.find((m) => m.empCode === r.empId);
        if (mappedItem) {
          const alreadyHasForm16 = r.status === 'Uploaded';

          if (mappedItem.status === 'MATCHED') {
            if (alreadyHasForm16 && !overrideExisting) {
              // Form-16 already exists and override is NOT enabled -> keep existing record unchanged!
              return r;
            } else {
              return {
                ...r,
                status: 'Uploaded' as const,
                uploadedAt: 'Just now',
                uploadedBy: 'HR Admin (Bulk)'
              };
            }
          } else {
            // Error in mapping
            if (!alreadyHasForm16) {
              return {
                ...r,
                status: 'Pending' as const,
                uploadedAt: r.uploadedAt === '-' || !r.uploadedAt ? 'Pending Upload' : r.uploadedAt,
                uploadedBy: r.uploadedBy === '-' || !r.uploadedBy ? 'System' : r.uploadedBy
              };
            }
            return r;
          }
        }
        return r;
      })
    );

    const successCount = mappingRecords.filter((m) => m.status === 'MATCHED').length;
    showToast(`Form-16 successfully pushed to ${successCount} employees' accounts!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-100">
            <UploadCloud size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Form-16</h1>
          </div>
        </div>

        {/* 3 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* Card 1: Total Employees */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4 rounded-2xl border border-blue-100/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700/80">Total Employees</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalEmployees.toLocaleString()}</p>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Eligible for Form-16</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Form-16 Uploaded */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/80">Form-16 Uploaded</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.uploadedCount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 size={22} />
            </div>
          </div>

          {/* Card 3: Pending Uploads */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-4 rounded-2xl border border-amber-100/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700/80">Pending Uploads</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.pendingCount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 flex-1 flex flex-col space-y-4">
        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Table Header / Title with FY Dropdown and Action Buttons on Top of Filter */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div>
              <h2 className="text-base font-bold text-slate-800">Employees Form-16 Records</h2>
            </div>

            {/* Action Buttons with Financial Year Dropdown to the left */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Financial Year Dropdown (Styled like BU dropdown) */}
              <div className="relative" ref={fyDropdownRef}>
                <button
                  type="button"
                  onClick={() => setFyDropdownOpen((prev) => !prev)}
                  className={`px-3.5 py-2 min-w-[170px] bg-white border text-left text-xs font-semibold rounded-lg flex items-center justify-between gap-2 shadow-sm transition-all ${
                    fyDropdownOpen
                      ? 'border-purple-400 ring-2 ring-purple-100 text-slate-800'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="truncate">
                    {selectedFYs.length === 0
                      ? 'Select Financial Year...'
                      : selectedFYs.length === 1
                      ? selectedFYs[0]
                      : `${selectedFYs.length} Selected`}
                  </span>
                  {fyDropdownOpen ? (
                    <ChevronUp size={14} className="text-purple-600 shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Dropdown Panel with Search and Checkboxes */}
                {fyDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Search Input */}
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={fySearchQuery}
                        onChange={(e) => setFySearchQuery(e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        autoFocus
                      />
                      <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Options List with Checkboxes */}
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredFyOptions.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400 italic">No years found</div>
                      ) : (
                        filteredFyOptions.map((fy) => {
                          const isChecked = selectedFYs.includes(fy);
                          return (
                            <label
                              key={fy}
                              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFY(fy)}
                                className="w-3.5 h-3.5 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                              />
                              <span className="truncate">{fy}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Upload Form-16 */}
              <button
                onClick={() => {
                  if (selectedFYs.length > 0) {
                    setBulkFY(selectedFYs[0]);
                  }
                  setIsBulkUploadModalOpen(true);
                }}
                className="px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
              >
                <FileArchive size={17} />
                Upload Form-16
              </button>
            </div>
          </div>

          {/* Dynamic Filter Bar (Matching Employees Compensation) */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center relative">
            <div className="flex items-center gap-2 w-full flex-1">
              <div className="relative flex-1" ref={dropdownRef}>
                {/* Input-like container */}
                <div
                  onClick={() => {
                    setDropdownOpen(true);
                    inputRef.current?.focus();
                  }}
                  className="w-full flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[40px] focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all cursor-text pr-10"
                >
                  {/* Search icon */}
                  {completedFilters.length === 0 && !currentField && (
                    <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  )}

                  {/* 1. Completed Filters Chips */}
                  {completedFilters.map((filter) => {
                    const fObj = FIELDS.find((f) => f.name === filter.field);
                    const FIcon = fObj?.icon;
                    return (
                      <div
                        key={filter.id}
                        className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                      >
                        {FIcon && <FIcon size={12} className="text-slate-500" />}
                        <span>{filter.field}</span>
                        <span className="text-slate-400 font-bold lowercase text-[10px]">{filter.operator}</span>
                        <span className="bg-slate-200/60 px-1 rounded text-slate-800 max-w-[120px] truncate">
                          {filter.values.join(', ')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFilter(filter.id);
                          }}
                          className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {/* 2. In-Progress Filter Pills */}
                  {currentField && (
                    <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700">
                      {(() => {
                        const fObj = FIELDS.find((f) => f.name === currentField);
                        const FIcon = fObj?.icon;
                        return FIcon ? <FIcon size={12} className="text-slate-500" /> : null;
                      })()}
                      <span>{currentField}</span>
                    </div>
                  )}

                  {currentOperator && (
                    <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-600">
                      <span>{currentOperator}</span>
                    </div>
                  )}

                  {/* 3. Text Input / Placeholder */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentField && currentOperator ? valSearchQuery : searchTerm}
                    onChange={(e) => {
                      if (currentField && currentOperator) {
                        setValSearchQuery(e.target.value);
                      } else {
                        setSearchTerm(e.target.value);
                        setDropdownOpen(false);
                      }
                    }}
                    placeholder={
                      completedFilters.length === 0 && !currentField
                        ? 'Filter Results...'
                        : currentField && currentOperator
                        ? 'Select...'
                        : ''
                    }
                    className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-slate-800 text-sm py-0.5 placeholder-slate-400 focus:ring-0 p-0"
                  />

                  {/* 4. Clear/Reset Button */}
                  {(completedFilters.length > 0 || currentField || searchTerm) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllFilters();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {!currentField && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Field
                        </div>
                        {FIELDS.map((f) => (
                          <button
                            key={f.name}
                            onClick={() => selectField(f.name)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                          >
                            <f.icon size={14} className="text-slate-400" />
                            <span>{f.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {currentField && !currentOperator && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Condition
                        </div>
                        {(() => {
                          let ops = ['Is', 'Is not'];
                          if (currentField === 'Employee') {
                            ops = ['Is', 'Contains'];
                          }
                          return ops;
                        })().map((op) => (
                          <button
                            key={op}
                            onClick={() => selectOperator(op)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                          >
                            <div className="w-4 h-4 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                              {op === 'Is' ? '=' : op === 'Contains' ? '⊃' : '!='}
                            </div>
                            <span>{op}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {currentField && currentOperator && (
                      <div className="flex flex-col max-h-[300px]">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                          Select values for {currentField}
                        </div>
                        {currentOperator === 'Contains' ? (
                          <div className="p-3">
                            <input
                              type="text"
                              placeholder="Type employee name..."
                              value={tempContainsText}
                              onChange={(e) => setTempContainsText(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <>
                            <div className="p-2 border-b border-slate-100">
                              <input
                                type="text"
                                placeholder="Search values..."
                                value={valSearchQuery}
                                onChange={(e) => setValSearchQuery(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div className="overflow-y-auto flex-1 py-1 max-h-[160px]">
                              {(() => {
                                const opts = getOptionsForField(currentField);
                                const filteredOpts = opts.filter((opt) =>
                                  opt.toLowerCase().includes(valSearchQuery.toLowerCase())
                                );
                                if (filteredOpts.length === 0) {
                                  return (
                                    <div className="px-3 py-2 text-xs text-slate-400 italic">No values found</div>
                                  );
                                }
                                return filteredOpts.map((opt) => {
                                  const isChecked = tempValues.includes(opt);
                                  return (
                                    <label
                                      key={opt}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleTempValue(opt)}
                                        className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  );
                                });
                              })()}
                            </div>
                          </>
                        )}
                        <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                          <button
                            onClick={cancelCurrentFilter}
                            className="px-2.5 py-1 text-[10px] text-slate-500 font-bold hover:text-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={applyCurrentFilter}
                            disabled={
                              currentOperator === 'Contains'
                                ? tempContainsText.trim() === ''
                                : tempValues.length === 0
                            }
                            className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setDropdownOpen((prev) => !prev);
                  if (!dropdownOpen) inputRef.current?.focus();
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              >
                <Filter size={14} className="text-slate-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-4">Financial Year</th>
                  <th className="py-4 px-4">Assessment Year</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4">Last Modified by</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText size={36} className="text-slate-300" />
                        <p className="font-bold text-sm text-slate-600">No Form-16 records found</p>
                        <p className="text-xs text-slate-400">Try adjusting your filters or selected financial years</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Employee Info (Name & ID only) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {row.empName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{row.empName}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{row.empId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Financial Year */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 text-xs">{row.financialYear}</span>
                      </td>

                      {/* Assessment Year */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-700 text-xs">{row.assessmentYear}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {row.status === 'Uploaded' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[11px]">
                            <AlertCircle size={13} className="text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-700 text-[11px]">{row.uploadedAt}</p>
                        <p className="text-[10px] text-slate-400 font-medium">By {row.uploadedBy}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDownloadRecord(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Download Form-16 (Part A / Part B)"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSingleEmpId(row.empId);
                              setIsSingleUploadModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Upload / Replace Form-16"
                          >
                            <Upload size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <p>
              Showing <span className="text-slate-800 font-bold">{paginatedRecords.length}</span> of{' '}
              <span className="text-slate-800 font-bold">{filteredRecords.length}</span> employees
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Bulk Upload Form-16 (Step 1: Upload & Step 2: Mapping Preview) */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div
            className={`bg-white rounded-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-200 ${
              bulkModalStep >= 2 || isProcessing ? 'w-full sm:w-[92vw] lg:w-[1024px] max-w-5xl' : 'max-w-3xl'
            }`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shrink-0">
                  <FileArchive size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">
                      {isProcessing
                        ? 'Bulk Upload Form-16'
                        : bulkModalStep === 1
                        ? 'Bulk Upload Form-16'
                        : bulkModalStep === 2
                        ? 'Form-16 File & PAN Mapping Preview'
                        : 'Bulk Upload Form-16'}
                    </h3>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                      {isProcessing || bulkModalStep === 3
                        ? 'Step 2 of 2'
                        : `Step ${bulkModalStep} of 3`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isProcessing || bulkModalStep === 3
                      ? 'Review the results of your import and download any failed records.'
                      : bulkModalStep === 1
                      ? 'Upload multiple Form-16 PDFs (Part A & Part B) in bulk'
                      : `Review employee PAN mappings and matched files for FY ${bulkFY}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isProcessing) {
                    processingTimersRef.current.forEach(clearTimeout);
                    processingTimersRef.current = [];
                    setIsProcessing(false);
                    setIsBulkUploadModalOpen(false);
                    setBulkModalStep(1);
                    setBulkFile(null);
                  }
                }}
                disabled={isProcessing}
                className={`text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                  isProcessing ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {bulkModalStep === 1 ? (
              isProcessing ? (
                // ================= STEP 1: PROCESSING / LOADING SCREEN (MATCHING SCREENSHOT 2) =================
                <>
                  {/* Stepper matching Screenshot 2 */}
                  <div className="border-b border-slate-100 py-5 bg-white select-none">
                    <div className="flex items-center justify-between max-w-2xl mx-auto px-6 relative">
                      {/* Connecting Line */}
                      <div className="absolute left-8 right-8 top-3 h-[2px] bg-slate-100 -translate-y-1/2 -z-0">
                        <div className="h-full bg-[#444CE7] w-full transition-all duration-300" />
                      </div>

                      {/* Step 1: Upload File (Completed) */}
                      <div className="flex flex-col items-center relative z-10">
                        <div className="w-6 h-6 rounded-full border-2 border-[#444CE7] flex items-center justify-center bg-white text-[#444CE7]">
                          <Check size={12} strokeWidth={3} className="text-[#444CE7]" />
                        </div>
                        <span className="text-[11px] mt-2 font-bold text-slate-400">
                          Upload File
                        </span>
                      </div>

                      {/* Step 2: Import Results (Active) */}
                      <div className="flex flex-col items-center relative z-10">
                        <div className="w-6 h-6 rounded-full border-2 border-[#444CE7] flex items-center justify-center bg-white text-[#444CE7]">
                          <div className="w-2.5 h-2.5 bg-[#444CE7] rounded-full" />
                        </div>
                        <span className="text-[11px] mt-2 font-bold text-[#444CE7]">
                          Import Results
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body: Centered Loader & Status Message */}
                  <div className="p-8 flex-grow overflow-y-auto min-h-[350px] bg-white flex flex-col justify-center items-center">
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] animate-in fade-in duration-200 space-y-4">
                      {/* Circular loader with document icon */}
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        {/* Outer circle */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
                        {/* Spinning arc */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-t-[#444CE7] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                        {/* Document icon */}
                        <FileUp size={20} className="text-[#444CE7]" />
                      </div>

                      {/* Status message */}
                      <div className="text-center space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-800">Processing your import...</h4>
                        <p className="text-xs text-slate-400 font-semibold">This may take a moment. Please do not close this window.</p>
                      </div>

                      {/* Bouncing dots loading indicator */}
                      <div className="flex gap-1.5 justify-center pt-2">
                        <div className="w-2 h-2 bg-[#444CE7] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-[#444CE7] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-[#444CE7] rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>

                  {/* Footer matching screenshot 2: Disabled Done button */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                    <button
                      type="button"
                      disabled
                      className="px-6 py-2 bg-indigo-200 text-white font-bold text-xs rounded-lg cursor-not-allowed select-none opacity-80"
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                // ================= STEP 1: UPLOAD SCREEN =================
                <>
                  <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Financial Year Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Financial Year
                    </label>
                    <select
                      value={bulkFY}
                      onChange={(e) => setBulkFY(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                    >
                      {FY_OPTIONS.map((fy) => {
                        const startYear = parseInt(fy.split('-')[0], 10);
                        const ay = `${startYear + 1}-${(startYear + 2).toString().slice(-2)}`;
                        return (
                          <option key={fy} value={fy}>
                            FY {fy} (AY {ay})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Helper Notice Box (Yellow/Amber Border & Background) */}
                  <div className="border border-amber-300 bg-amber-50/60 rounded-lg p-3.5 flex items-start gap-3">
                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      Upload a ZIP with separate Part A and Part B PDFs per employee, named using their PAN.
                    </p>
                  </div>

                  {/* Upload Scope Block: Radio Buttons */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 sm:px-4 flex flex-wrap items-center gap-6 sm:gap-8">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="bulkTargetScope"
                        value="ALL"
                        checked={bulkTargetScope === 'ALL'}
                        onChange={() => setBulkTargetScope('ALL')}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Upload for all employees
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="bulkTargetScope"
                        value="PENDING"
                        checked={bulkTargetScope === 'PENDING'}
                        onChange={() => setBulkTargetScope('PENDING')}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Upload for pending employees
                      </span>
                    </label>
                  </div>

                  {/* Two-Column Layout: Dropzone (Left) & Instructions (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {/* Left: Redesigned File Selection Block */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          setBulkFile(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[220px] ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-blue-200 hover:border-blue-400 bg-blue-50/10 hover:bg-blue-50/20'
                      }`}
                    >
                      <input
                        type="file"
                        ref={bulkFileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setBulkFile(e.target.files[0]);
                          }
                        }}
                        accept=".zip,.pdf"
                        className="hidden"
                      />

                      {bulkFile ? (
                        <div className="w-full flex flex-col items-center">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2.5 border border-emerald-100">
                            <CheckCircle2 size={24} />
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={bulkFile.name}>
                            {bulkFile.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mb-3">
                            {(bulkFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => bulkFileInputRef.current?.click()}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold text-xs rounded-lg transition-all"
                            >
                              Change File
                            </button>
                            <button
                              type="button"
                              onClick={() => setBulkFile(null)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Remove file"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 border border-blue-100/60 shadow-xs">
                            <FileUp size={22} className="text-indigo-600" />
                          </div>
                          <p className="text-xs md:text-sm font-bold text-slate-800 mb-1">
                            Drag & drop your file here
                          </p>
                          <p className="text-[11px] text-slate-400 mb-4">
                            or click the button below to browse from your computer
                          </p>
                          <button
                            type="button"
                            onClick={() => bulkFileInputRef.current?.click()}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            Browse Files
                          </button>
                          <p className="text-[10.5px] text-amber-900/80 font-medium mt-4">
                            Max file size: 250 MB. Accepted formats: .zip and .pdf.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Right: Instructions Block & Override Checkbox */}
                    <div className="flex flex-col gap-3">
                      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-start flex-1">
                        <h4 className="text-sm font-bold text-slate-900 mb-4">Instructions</h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Do not change the file naming format provided for Part A and Part B PDFs.
                            </p>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              PDF files must be named using the employee's valid <span className="text-red-500 font-semibold">PAN number</span>.
                            </p>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Once the import is complete, verify that the data has been accurately imported. Cross-check a few records to ensure consistency.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Override Checkbox (Hidden if Upload for pending employees is selected) */}
                      {bulkTargetScope !== 'PENDING' && (
                        <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-all select-none">
                          <input
                            type="checkbox"
                            checked={overrideExisting}
                            onChange={(e) => setOverrideExisting(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-700">
                            Override existing file if any.
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      processingTimersRef.current.forEach(clearTimeout);
                      processingTimersRef.current = [];
                      setIsProcessing(false);
                      setIsBulkUploadModalOpen(false);
                      setBulkFile(null);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkUploadSubmit}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload size={14} /> Upload
                  </button>
                </div>
              </>
            )
            ) : bulkModalStep === 2 ? (
              // ================= STEP 2: MAPPING PREVIEW SCREEN =================
              <>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-140px)]">
                  {/* Notice Banner if Override is NOT selected */}
                  {!overrideExisting && (
                    <div className="border border-sky-200 bg-sky-50/70 rounded-lg p-3 flex items-start gap-2.5">
                      <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-sky-900 leading-relaxed font-medium">
                        Form-16 is already present in some employee profiles. Since <span className="font-bold">"Override existing file if any"</span> was not selected, no changes will be made to their existing files.
                      </p>
                    </div>
                  )}

                  {/* Simulation Toggle & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Test Scenario:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (simulateAllFail) {
                            setMappingRecords(MOCK_MAPPING_DATA);
                            setSimulateAllFail(false);
                          } else {
                            setMappingRecords(
                              MOCK_MAPPING_DATA.map((item) => ({
                                ...item,
                                status: item.status === 'MATCHED' ? 'UNMATCHED' : item.status
                              }))
                            );
                            setSimulateAllFail(true);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                          simulateAllFail
                            ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                        }`}
                        title="Click to switch between Partial Failure (Image 2) and All Failed (Image 3)"
                      >
                        {simulateAllFail ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            Simulating: All Failed (Image 3)
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Simulating: Partial Success (Image 2)
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="Search employee, PAN, file name..."
                        value={mappingSearch}
                        onChange={(e) => setMappingSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      {mappingSearch && (
                        <button
                          onClick={() => setMappingSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mapping Details Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-4">Employee Code</th>
                            <th className="py-3 px-4">Employee Name</th>
                            <th className="py-3 px-4">PAN Number (Profile)</th>
                            <th className="py-3 px-4">PAN Number (Form-16)</th>
                            <th className="py-3 px-4">Matched File Name</th>
                            <th className="py-3 px-4 text-right">Mapping Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredMappingRecords.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                                No records matching your search/filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredMappingRecords.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                {/* Employee Code */}
                                <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                                  {item.empCode}
                                </td>

                                {/* Employee Name */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                      {item.empName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </div>
                                    <span className="font-bold text-slate-800 text-xs">{item.empName}</span>
                                  </div>
                                </td>

                                {/* PAN Number (Profile) */}
                                <td className="py-3 px-4">
                                  {item.panProfile ? (
                                    <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded font-mono font-bold text-xs tracking-wider">
                                      {item.panProfile}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[11px] font-semibold">
                                      <AlertCircle size={12} className="text-rose-600 shrink-0" />
                                      Missing in Profile
                                    </span>
                                  )}
                                </td>

                                {/* PAN Number (Form-16) */}
                                <td className="py-3 px-4">
                                  {!item.panProfile || item.status === 'UNMATCHED' ? (
                                    <span className="text-slate-400 font-bold text-sm tracking-wider">--</span>
                                  ) : item.panForm16 ? (
                                    <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded font-mono font-bold text-xs tracking-wider">
                                      {item.panForm16}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[11px] font-semibold">
                                      <AlertCircle size={12} className="text-amber-600 shrink-0" />
                                      File not found
                                    </span>
                                  )}
                                </td>

                                {/* Matched File */}
                                <td className="py-3 px-4">
                                  {!item.panProfile || item.status === 'UNMATCHED' || item.matchedFiles.length === 0 ? (
                                    <span className="text-slate-400 font-bold text-sm tracking-wider">--</span>
                                  ) : (
                                    <div className="flex flex-col gap-1 max-w-[220px]">
                                      {item.matchedFiles.map((file, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] font-mono"
                                          title={file}
                                        >
                                          <FileText size={12} className="text-rose-500 shrink-0" />
                                          <span className="truncate">{file}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>

                                {/* Mapping Status */}
                                <td className="py-3 px-4 text-right">
                                  {item.status === 'MATCHED' && (
                                    existingUploadedEmpCodes.has(item.empCode) ? (
                                      !overrideExisting ? (
                                        <span
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full font-semibold text-[11px]"
                                          title="Form-16 is already present in employee profile. No changes made because override is disabled."
                                        >
                                          <Info size={13} className="text-sky-600" />
                                          Skipped (File Exists)
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">
                                          <CheckCircle2 size={13} className="text-emerald-600" />
                                          Success (Override)
                                        </span>
                                      )
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">
                                        <CheckCircle2 size={13} className="text-emerald-600" />
                                        Success
                                      </span>
                                    )
                                  )}
                                  {item.status === 'PAN_MISSING_PROFILE' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[11px]">
                                      <AlertCircle size={13} className="text-rose-600" />
                                      Error: PAN missing in profile
                                    </span>
                                  )}
                                  {item.status === 'PAN_MISSING_FILE' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[11px]">
                                      <AlertCircle size={13} className="text-amber-600" />
                                      Error: No file found for this PAN number.
                                    </span>
                                  )}
                                  {item.status === 'UNMATCHED' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[11px]">
                                      <AlertCircle size={13} className="text-rose-600" />
                                      Error: PAN not matching with the profile.
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Step 2 Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-medium">
                    <span className="font-bold text-slate-800">{mappingStats.matched}</span> of{' '}
                    <span className="font-bold text-slate-800">{mappingStats.total}</span> files matched successfully
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBulkModalStep(1);
                        setBulkFile(null);
                      }}
                      className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <RotateCcw size={15} /> Start Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkUploadModalOpen(false);
                        setBulkModalStep(1);
                        setBulkFile(null);
                      }}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-white transition-all cursor-pointer shadow-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2ConfirmAndUpload}
                      style={{ backgroundColor: '#444CE7' }}
                      className="px-6 py-2.5 bg-[#444CE7] hover:bg-[#3538CD] text-white font-bold text-sm rounded-lg shadow-md shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={16} /> Confirm & Upload
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // ================= STEP 3: IMPORT RESULTS SCREEN (MATCHING SCREENSHOT 2 & 3) =================
              <>
                {/* Stepper Bar across top matching Screenshot 2 & 3 */}
                <div className="border-b border-slate-100 py-5 bg-white select-none">
                  <div className="flex items-center justify-between max-w-2xl mx-auto px-6 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-8 right-8 top-3 h-[2px] bg-slate-100 -translate-y-1/2 -z-0">
                      <div className="h-full bg-[#444CE7] w-full transition-all duration-300" />
                    </div>

                    {/* Step 1: Upload File (Completed) */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-6 h-6 rounded-full border-2 border-[#444CE7] flex items-center justify-center bg-white text-[#444CE7]">
                        <Check size={12} strokeWidth={3} className="text-[#444CE7]" />
                      </div>
                      <span className="text-[11px] mt-2 font-bold text-slate-400">
                        Upload File
                      </span>
                    </div>

                    {/* Step 2: Import Results (Active) */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-6 h-6 rounded-full border-2 border-[#444CE7] flex items-center justify-center bg-white text-[#444CE7]">
                        <div className="w-2.5 h-2.5 bg-[#444CE7] rounded-full" />
                      </div>
                      <span className="text-[11px] mt-2 font-bold text-[#444CE7]">
                        Import Results
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-8 space-y-6 overflow-y-auto flex-grow flex flex-col justify-center min-h-[380px] bg-slate-50/20">
                  {importSummary.failureCount > 0 && importSummary.successCount === 0 ? (
                    // ---------------- CASE 2: ALL RECORDS FAILED (SCREENSHOT 3) ----------------
                    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
                      {/* Red Alert Banner */}
                      <div className="w-full bg-rose-50/70 border border-rose-200/80 rounded-md p-3.5 flex items-center gap-3 shadow-xs">
                        <div className="p-1 bg-rose-100 rounded-full text-rose-600 shrink-0">
                          <AlertCircle size={16} />
                        </div>
                        <span className="text-xs font-semibold text-rose-900">
                          All records failed to import. Please review your file, correct the errors, and re-upload.
                        </span>
                      </div>

                      {/* Single Centered Failure Card */}
                      <div className="max-w-lg mx-auto w-full">
                        <div className="border border-rose-100 bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 border border-rose-100 shrink-0">
                              <X size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                              <div className="text-3xl font-black text-slate-800 leading-none">
                                {importSummary.failureCount}
                              </div>
                              <div className="text-xs text-slate-500 font-semibold mt-1">
                                Record(s) failed to import
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-6">
                            <button
                              type="button"
                              onClick={handleDownloadFailedRecords}
                              style={{ backgroundColor: '#444CE7' }}
                              className="flex-1 py-2.5 px-4 bg-[#444CE7] hover:bg-[#3538CD] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Download size={13} /> Download Failed Records
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowErrorModal(true)}
                              className="py-2.5 px-4 bg-indigo-50/70 hover:bg-indigo-100 text-[#444CE7] border border-indigo-100 text-xs font-bold rounded-lg transition-all cursor-pointer text-center whitespace-nowrap"
                            >
                              View Error Messages
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : importSummary.failureCount > 0 ? (
                    // ---------------- CASE 1: PARTIAL FAILED & PARTIAL SUCCESS (SCREENSHOT 2) ----------------
                    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
                      {/* Amber Alert Banner */}
                      <div className="w-full bg-amber-50/60 border border-amber-200/80 rounded-md p-3.5 flex items-center gap-3 shadow-xs">
                        <div className="p-1 bg-amber-100 rounded-full text-amber-600 shrink-0">
                          <AlertTriangle size={16} />
                        </div>
                        <span className="text-xs font-semibold text-amber-900">
                          Some records failed to import. Please review and correct them, then re-upload.
                        </span>
                      </div>

                      {/* 2 Summary Cards Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        {/* Success Card */}
                        <div className="border border-slate-200 bg-white rounded-xl p-6 flex items-center gap-5 shadow-xs">
                          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100/60 shrink-0">
                            <Check size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div className="text-3xl font-black text-slate-800 leading-none">
                              {importSummary.successCount}
                            </div>
                            <div className="text-xs text-slate-500 font-semibold mt-1">
                              Record(s) imported successfully
                            </div>
                          </div>
                        </div>

                        {/* Failure Card */}
                        <div className="border border-rose-100 bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 border border-rose-100 shrink-0">
                              <X size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                              <div className="text-2xl font-black text-slate-800 leading-none">
                                {importSummary.failureCount}
                              </div>
                              <div className="text-xs text-slate-500 font-semibold mt-1">
                                Record(s) failed to import
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mt-4">
                            <button
                              type="button"
                              onClick={handleDownloadFailedRecords}
                              style={{ backgroundColor: '#444CE7' }}
                              className="w-full py-2 px-3 bg-[#444CE7] hover:bg-[#3538CD] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Download size={13} /> Download Failed Records
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowErrorModal(true)}
                              className="w-full py-2 px-3 bg-indigo-50/70 hover:bg-indigo-100 text-[#444CE7] border border-indigo-100 text-xs font-bold rounded-lg transition-all cursor-pointer text-center"
                            >
                              View Error Messages
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // ---------------- CASE 3: ALL RECORDS SUCCESSFUL ----------------
                    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
                      {/* Green Alert Banner */}
                      <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-md p-3.5 flex items-center gap-3 shadow-xs">
                        <div className="p-1 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className="text-xs font-semibold text-emerald-900">
                          All records imported successfully!
                        </span>
                      </div>

                      {/* Centered Success Card */}
                      <div className="max-w-md mx-auto w-full pt-2">
                        <div className="border border-slate-200 bg-white rounded-xl p-6 flex items-center gap-5 shadow-xs">
                          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100/60 shrink-0">
                            <Check size={26} strokeWidth={3} />
                          </div>
                          <div>
                            <div className="text-3xl font-black text-slate-800 leading-none">
                              {importSummary.successCount}
                            </div>
                            <div className="text-xs text-slate-500 font-semibold mt-1.5">
                              Record(s) imported successfully
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3 Footer: Restored Original Buttons */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkUploadModalOpen(false);
                        setBulkModalStep(1);
                        setBulkFile(null);
                        setSimulateAllFail(false);
                        setMappingRecords(MOCK_MAPPING_DATA);
                      }}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-white transition-all cursor-pointer shadow-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkModalStep(1);
                        setBulkFile(null);
                        setSimulateAllFail(false);
                        setMappingRecords(MOCK_MAPPING_DATA);
                      }}
                      className="px-5 py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <RotateCcw size={15} /> Re-upload
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmMappingUpload}
                      className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send size={15} /> Push to Employee's account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Messages Modal from "View Error Messages" */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Import Error Messages</h4>
                  <p className="text-[11px] text-slate-500">Details of Form-16 records that failed to import</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Emp Code</th>
                      <th className="py-2.5 px-3">Employee Name</th>
                      <th className="py-2.5 px-3">Error Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importSummary.failedList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{item.empCode}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{item.empName}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            <AlertCircle size={12} className="shrink-0" />
                            {item.status === 'PAN_MISSING_PROFILE'
                              ? 'PAN missing in profile'
                              : item.status === 'PAN_MISSING_FILE'
                              ? 'No file found for this PAN number'
                              : 'PAN not matching with profile'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Download Form-16 Selection (Part A / Part B) */}
      {downloadRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Download Form-16</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {downloadRecord.empName} ({downloadRecord.empId}) • FY {downloadRecord.financialYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDownloadRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3.5">
              <p className="text-xs text-slate-600 font-medium mb-1">
                Please select which Form-16 part you want to download:
              </p>

              {/* Option 1: Part A */}
              <div className="border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl p-4 transition-all flex items-center justify-between group">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-100/80 text-indigo-700 rounded-lg shrink-0 mt-0.5 border border-indigo-200">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                      Form-16 (Part A)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      TRACES TDS Certificate & Tax Deduction Details
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                      {downloadRecord.partAFileName || `Form16_PartA_${downloadRecord.pan}_${downloadRecord.financialYear}.pdf`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const emp = downloadRecord.empName;
                    downloadForm16PartA(downloadRecord);
                    setDownloadRecord(null);
                    showToast(`Downloaded Form-16 Part A PDF for ${emp}`);
                  }}
                  style={{ backgroundColor: '#444CE7' }}
                  className="px-3.5 py-1.5 bg-[#444CE7] hover:bg-[#3538CD] text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download size={13} /> Part A
                </button>
              </div>

              {/* Option 2: Part B */}
              <div className="border border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-purple-50/30 rounded-xl p-4 transition-all flex items-center justify-between group">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-100/80 text-purple-700 rounded-lg shrink-0 mt-0.5 border border-purple-200">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-900">
                      Form-16 (Part B)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Salary Breakdown, Exemptions & Tax Computations
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                      {downloadRecord.partBFileName || `Form16_PartB_${downloadRecord.pan}_${downloadRecord.financialYear}.pdf`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const emp = downloadRecord.empName;
                    downloadForm16PartB(downloadRecord);
                    setDownloadRecord(null);
                    showToast(`Downloaded Form-16 Part B PDF for ${emp}`);
                  }}
                  style={{ backgroundColor: '#444CE7' }}
                  className="px-3.5 py-1.5 bg-[#444CE7] hover:bg-[#3538CD] text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download size={13} /> Part B
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDownloadRecord(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const emp = downloadRecord.empName;
                  await downloadForm16BothZip(downloadRecord);
                  setDownloadRecord(null);
                  showToast(`Downloaded Form-16 (Part A & B) ZIP for ${emp}`);
                }}
                style={{ backgroundColor: '#444CE7' }}
                className="px-4 py-2 bg-[#444CE7] hover:bg-[#3538CD] text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} /> Download Both (Part A & B)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Single Employee Form-16 Upload */}
      {isSingleUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Upload Form-16 - {records.find((r) => r.empId === singleEmpId)?.empName || 'Employee'}
                  </h3>
                  <p className="text-xs text-slate-500">Upload Part A (TRACES) and Part B (Salary breakdown)</p>
                </div>
              </div>
              <button
                onClick={() => setIsSingleUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Select Employee Dropdown (Hidden as specific employee is selected from row) */}
              <div className="hidden">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Employee
                </label>
                <select
                  value={singleEmpId}
                  onChange={(e) => setSingleEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {records.map((r) => (
                    <option key={r.id} value={r.empId}>
                      {r.empName} ({r.empId}) - {r.pan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Part A (TRACES Certificate)</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSinglePartAFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Supported format: .PDF • Max file size: 2MB
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Part B (Annexure & Computations)</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSinglePartBFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Supported format: .PDF • Max file size: 2MB
                </p>
              </div>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  OR
                </span>
              </div>

              {/* Upload ZIP Block */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Form-16 (ZIP File)</span>
                </div>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setSingleZipFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Supported format: .ZIP • Max file size: 5MB
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSingleUploadModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-md hover:bg-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!singleEmpId) {
                    alert('Please select an employee');
                    return;
                  }
                  setRecords((prev) =>
                    prev.map((r) =>
                      r.empId === singleEmpId
                        ? {
                            ...r,
                            status: 'Uploaded',
                            uploadedAt: 'Just now',
                            uploadedBy: 'HR Admin'
                          }
                        : r
                    )
                  );
                  setIsSingleUploadModalOpen(false);
                  showToast('Form-16 uploaded successfully for employee!');
                }}
                style={{ backgroundColor: '#444CE7' }}
                className="px-6 py-2 bg-[#444CE7] hover:bg-[#3538CD] text-white font-bold text-xs rounded-md shadow-md shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload size={14} /> Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Preview Form-16 Summary */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Form-16 Details • {previewRecord.empName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewRecord.empId} • FY {previewRecord.financialYear} • AY {previewRecord.assessmentYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assessment Year</span>
                  <p className="text-sm font-black text-slate-800">{previewRecord.assessmentYear}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Salary</span>
                  <p className="text-sm font-black text-indigo-700">₹{previewRecord.grossSalary.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total TDS Deposited</span>
                  <p className="text-sm font-black text-emerald-600">₹{previewRecord.tdsDeducted.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Status</h4>
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Employee Profile Form-16 Document</p>
                      <p className="text-[11px] text-slate-400">Available on Employee Portal</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      previewRecord.status === 'Uploaded'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {previewRecord.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">
                Uploaded: {previewRecord.uploadedAt} by {previewRecord.uploadedBy}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewRecord(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Downloading Form-16 for ${previewRecord.empName}`);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm16;
