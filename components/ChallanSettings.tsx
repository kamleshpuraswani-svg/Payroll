import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../services/supabaseClient';
import { Save, Edit2, FileText, ChevronDown, ChevronUp, Check, AlertCircle, Info, Landmark, User, CreditCard, Shield, Activity, Briefcase, Building2 } from 'lucide-react';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const ChallanSettings: React.FC = () => {
    // Target state
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    // Tabs state
    const [activeTab, setActiveTab] = useState('Professional Tax');
    const TABS = ['Professional Tax', 'ESI', 'Provident Fund', 'TDS'];
    
    // RSP state
    const [isRspOpen, setIsRspOpen] = useState(false);
    const [selectedMonthForRsp, setSelectedMonthForRsp] = useState('');
    const [tdsStep, setTdsStep] = useState(1);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);

    const [tdsForm, setTdsForm] = useState({
        challanAlias: '',
        natureOfPayment: 'Select Option',
        challanNumber: '',
        paymentMode: 'Select Option',
        bank: 'Select Bank',
        branch: 'Select Branch',
        bsrCode: '',
        challanDate: '',
        penaltyPaid: '0'
    });
    
    const autoFillTdsForm = () => {
        setTdsForm({
            challanAlias: 'TDS_APR_2025',
            natureOfPayment: '92B - Salary',
            challanNumber: 'CHL9988776655',
            paymentMode: 'Net Banking',
            bank: 'HDFC Bank',
            branch: 'Main Branch',
            bsrCode: '0001234',
            challanDate: '2025-04-15',
            penaltyPaid: '150'
        });
    };

    
    const dummyMonths = [
        'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025',
        'October 2025', 'November 2025', 'December 2025', 'January 2026', 'February 2026', 'March 2026'
    ];
    
    // Global edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Configurations state
    // PF
    const [pfEnabled, setPfEnabled] = useState(true);
    const [autoPfChallan, setAutoPfChallan] = useState(true);
    const [pfPaymentMode, setPfPaymentMode] = useState('Direct Debit');
    const [pfAuthorizedSignatory, setPfAuthorizedSignatory] = useState('');
    const [pfBankName, setPfBankName] = useState('HDFC Bank');
    const [pfAccountNumber, setPfAccountNumber] = useState('');
    const [pfCompanyName, setPfCompanyName] = useState('TechFlow Systems Pvt Ltd');
    const [pfResponsiblePerson, setPfResponsiblePerson] = useState('');
    const [pfNumber, setPfNumber] = useState('');
    const [pfRegisteredAddress, setPfRegisteredAddress] = useState('');

    // ESI
    const [esiEnabled, setEsiEnabled] = useState(true);
    const [autoEsiChallan, setAutoEsiChallan] = useState(true);
    const [esiPaymentMode, setEsiPaymentMode] = useState('Direct Debit');
    const [esiAuthorizedSignatory, setEsiAuthorizedSignatory] = useState('');
    const [esiBankName, setEsiBankName] = useState('HDFC Bank');
    const [esiAccountNumber, setEsiAccountNumber] = useState('');

    // LWF
    const [lwfEnabled, setLwfEnabled] = useState(false);
    const [autoLwfChallan, setAutoLwfChallan] = useState(false);
    const [lwfPaymentMode, setLwfPaymentMode] = useState('Direct Debit');
    const [lwfAuthorizedSignatory, setLwfAuthorizedSignatory] = useState('');
    const [lwfBankName, setLwfBankName] = useState('HDFC Bank');
    const [lwfAccountNumber, setLwfAccountNumber] = useState('');

    // PT
    const [ptEnabled, setPtEnabled] = useState(false);
    const [autoPtChallan, setAutoPtChallan] = useState(false);
    const [ptPaymentMode, setPtPaymentMode] = useState('Direct Debit');
    const [ptAuthorizedSignatory, setPtAuthorizedSignatory] = useState('');
    const [ptBankName, setPtBankName] = useState('HDFC Bank');
    const [ptAccountNumber, setPtAccountNumber] = useState('');

    // Expanded sections state
    const [expandedSections, setExpandedSections] = useState({
        pf: true,
        esi: true,
        lwf: true,
        pt: true
    });
    
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Backup state for cancel
    const [backupState, setBackupState] = useState<any>(null);

    // List of active employees for Signatory dropdowns
    const [employees, setEmployees] = useState<string[]>([]);
    
    const fetchEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('name')
                .eq('status', 'Active');
            if (error) throw error;
            if (data) {
                setEmployees(data.map((e: any) => e.name).filter(Boolean).sort());
            }
        } catch (err) {
            console.error('Error fetching employees for Challan settings:', err);
        }
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', `challan_settings:${selectedTarget}`)
                .single();
                
            if (!error && data?.config_value) {
                const config = data.config_value;
                
                // PF settings
                setPfEnabled(config.pfEnabled ?? true);
                setAutoPfChallan(config.autoPfChallan ?? true);
                setPfPaymentMode(config.pfPaymentMode ?? 'Direct Debit');
                setPfAuthorizedSignatory(config.pfAuthorizedSignatory ?? '');
                setPfBankName(config.pfBankName ?? 'HDFC Bank');
                setPfAccountNumber(config.pfAccountNumber ?? '');

                // ESI settings
                setEsiEnabled(config.esiEnabled ?? true);
                setAutoEsiChallan(config.autoEsiChallan ?? true);
                setEsiPaymentMode(config.esiPaymentMode ?? 'Direct Debit');
                setEsiAuthorizedSignatory(config.esiAuthorizedSignatory ?? '');
                setEsiBankName(config.esiBankName ?? 'HDFC Bank');
                setEsiAccountNumber(config.esiAccountNumber ?? '');

                // LWF settings
                setLwfEnabled(config.lwfEnabled ?? false);
                setAutoLwfChallan(config.autoLwfChallan ?? false);
                setLwfPaymentMode(config.lwfPaymentMode ?? 'Direct Debit');
                setLwfAuthorizedSignatory(config.lwfAuthorizedSignatory ?? '');
                setLwfBankName(config.lwfBankName ?? 'HDFC Bank');
                setLwfAccountNumber(config.lwfAccountNumber ?? '');

                // PT settings
                setPtEnabled(config.ptEnabled ?? false);
                setAutoPtChallan(config.autoPtChallan ?? false);
                setPtPaymentMode(config.ptPaymentMode ?? 'Direct Debit');
                setPtAuthorizedSignatory(config.ptAuthorizedSignatory ?? '');
                setPtBankName(config.ptBankName ?? 'HDFC Bank');
                setPtAccountNumber(config.ptAccountNumber ?? '');
            } else {
                // Reset to default
                setPfEnabled(true);
                setAutoPfChallan(true);
                setPfPaymentMode('Direct Debit');
                setPfAuthorizedSignatory('');
                setPfBankName('HDFC Bank');
                setPfAccountNumber('');

                setEsiEnabled(true);
                setAutoEsiChallan(true);
                setEsiPaymentMode('Direct Debit');
                setEsiAuthorizedSignatory('');
                setEsiBankName('HDFC Bank');
                setEsiAccountNumber('');

                setLwfEnabled(false);
                setAutoLwfChallan(false);
                setLwfPaymentMode('Direct Debit');
                setLwfAuthorizedSignatory('');
                setLwfBankName('HDFC Bank');
                setLwfAccountNumber('');

                setPtEnabled(false);
                setAutoPtChallan(false);
                setPtPaymentMode('Direct Debit');
                setPtAuthorizedSignatory('');
                setPtBankName('HDFC Bank');
                setPtAccountNumber('');
            }

            // Fetch pre-fill data for read-only fields
            try {
                // Fetch pfNumber
                const { data: pfData } = await supabase.from('operational_config').select('config_value').eq('config_key', `pf_settings:${selectedTarget}`).single();
                if (pfData?.config_value) {
                    setPfNumber(pfData.config_value.pfNumber || 'Not configured');
                } else {
                    setPfNumber('Not configured');
                }

                // Fetch respName
                const { data: tdsData } = await supabase.from('operational_config').select('config_value').eq('config_key', `tds_settings:${selectedTarget}`).single();
                if (tdsData?.config_value) {
                    setPfResponsiblePerson(tdsData.config_value.respName || 'Not configured');
                } else {
                    setPfResponsiblePerson('Not configured');
                }

                // Fetch address
                const { data: orgData } = await supabase.from('operational_config').select('config_value').eq('config_key', 'organization_tax_details').single();
                if (orgData?.config_value) {
                    const buName = selectedTarget.replace('bu:', '');
                    const orgConfig = orgData.config_value[buName];
                    if (orgConfig) {
                        setPfRegisteredAddress(orgConfig.address || 'Not configured');
                    } else {
                        setPfRegisteredAddress('Not configured');
                    }
                } else {
                    setPfRegisteredAddress('Not configured');
                }
            } catch (err) {
                console.error("Error fetching pre-fill data:", err);
            }
        } catch (err) {
            console.error('Error fetching Challan settings:', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchSettings();
        setIsEditing(false);
    }, [selectedTarget]);

    const handleEdit = () => {
        setBackupState({
            pfEnabled, autoPfChallan, pfPaymentMode, pfAuthorizedSignatory, pfBankName, pfAccountNumber,
            esiEnabled, autoEsiChallan, esiPaymentMode, esiAuthorizedSignatory, esiBankName, esiAccountNumber,
            lwfEnabled, autoLwfChallan, lwfPaymentMode, lwfAuthorizedSignatory, lwfBankName, lwfAccountNumber,
            ptEnabled, autoPtChallan, ptPaymentMode, ptAuthorizedSignatory, ptBankName, ptAccountNumber
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (backupState) {
            setPfEnabled(backupState.pfEnabled);
            setAutoPfChallan(backupState.autoPfChallan);
            setPfPaymentMode(backupState.pfPaymentMode);
            setPfAuthorizedSignatory(backupState.pfAuthorizedSignatory);
            setPfBankName(backupState.pfBankName);
            setPfAccountNumber(backupState.pfAccountNumber);

            setEsiEnabled(backupState.esiEnabled);
            setAutoEsiChallan(backupState.autoEsiChallan);
            setEsiPaymentMode(backupState.esiPaymentMode);
            setEsiAuthorizedSignatory(backupState.esiAuthorizedSignatory);
            setEsiBankName(backupState.esiBankName);
            setEsiAccountNumber(backupState.esiAccountNumber);

            setLwfEnabled(backupState.lwfEnabled);
            setAutoLwfChallan(backupState.autoLwfChallan);
            setLwfPaymentMode(backupState.lwfPaymentMode);
            setLwfAuthorizedSignatory(backupState.lwfAuthorizedSignatory);
            setLwfBankName(backupState.lwfBankName);
            setLwfAccountNumber(backupState.lwfAccountNumber);

            setPtEnabled(backupState.ptEnabled);
            setAutoPtChallan(backupState.autoPtChallan);
            setPtPaymentMode(backupState.ptPaymentMode);
            setPtAuthorizedSignatory(backupState.ptAuthorizedSignatory);
            setPtBankName(backupState.ptBankName);
            setPtAccountNumber(backupState.ptAccountNumber);
        }
        setIsEditing(false);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const downloadExcel = () => {
        const headers = ['Employee Code', 'Employee Name', 'Designation', 'Father Name', 'Date of Joining', 'Date of Leaving', 'Professional Tax', 'Gross Amount'];
        const dummyData = [
            ['EMP001', 'John Doe 1', 'Software Engineer', 'Robert Doe', '01-Jan-2023', '', '200', '85000'],
            ['EMP002', 'John Doe 2', 'Product Manager', 'Michael Doe', '15-Mar-2022', '', '200', '95000'],
            ['EMP003', 'John Doe 3', 'Designer', 'William Doe', '10-Aug-2024', '', '200', '75000'],
        ];
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Professional Tax");
        XLSX.writeFile(wb, "Professional_Tax_Report.xlsx");
        setShowGenerateDropdown(false);
    };

    const downloadEsiExcel = () => {
        const headers = [
            'IP Number (10 digits)', 
            'IP Name (Only alphabets and space)', 
            'No of Days for which wages paid/payable during the month', 
            'Total Monthly Wages', 
            'Reason Code for Zero workings days (numeric only; provide 0 for all other reasons- Click on the link for reference)', 
            'Last Working Day', 
            'Employer Code'
        ];
        const dummyData = [
            ['1234567890', 'John Doe', '30', '85000', '0', '', 'EMP998877'],
            ['0987654321', 'Jane Smith', '30', '95000', '0', '', 'EMP998877'],
            ['1122334455', 'William Robert', '30', '75000', '0', '', 'EMP998877'],
        ];
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ESI Return");
        XLSX.writeFile(wb, "ESI_Return_Report.xlsx");
        setIsRspOpen(false);
    };

    const downloadPfExcel = () => {
        const headers = [
            'Employee Code', 'UAN', 'Name', 'Gross Wages', 'EPF Wages', 'EPS Wages', 'EDLI Wages',
            'EE Share Remitted', 'EPS Contribution Remitted', 'ER Share Remitted', 'NCP Days',
            'Refunds', 'Date of Birth', 'Gender', 'Date of Joining', 'Date of Joining EPS', 'Date of Exit from EPS'
        ];
        const dummyData = [
            ['EMP001', '100000000001', 'John Doe', '85000', '15000', '15000', '15000', '1800', '1250', '550', '0', '0', '01-Jan-1990', 'Male', '01-Jan-2023', '01-Jan-2023', ''],
            ['EMP002', '100000000002', 'Jane Smith', '95000', '15000', '15000', '15000', '1800', '1250', '550', '0', '0', '15-Mar-1992', 'Female', '15-Mar-2022', '15-Mar-2022', ''],
            ['EMP003', '100000000003', 'William Robert', '75000', '15000', '15000', '15000', '1800', '1250', '550', '0', '0', '20-Oct-1995', 'Male', '10-Aug-2024', '10-Aug-2024', ''],
        ];
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Provident Fund");
        XLSX.writeFile(wb, "Provident_Fund_Report.xlsx");
        setShowGenerateDropdown(false);
    };

    const downloadPfText = () => {
        const dummyTextContent = "100526116553#~#Kamlesh Pradeep Puraswani#~#106383#~#15000#~#0#~#15000#~#1800#~#0#~#1800#~#0#~#0\n" +
                                 "100526116554#~#John Doe#~#106384#~#15000#~#0#~#15000#~#1800#~#0#~#1800#~#0#~#0\n" +
                                 "100526116555#~#Jane Smith#~#106385#~#15000#~#0#~#15000#~#1800#~#0#~#1800#~#0#~#0";
        
        const blob = new Blob([dummyTextContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Provident_Fund_Report.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowGenerateDropdown(false);
    };

    const downloadTdsExcel = () => {
        const headers = [
            'EMPCODE', 'EMPNAME', 'BRANCH', 'STATE', 'IS AADHAR AND PAN NUMBER LINKED', 
            'MONTH', 'YEAR', 'PAN', 'SALARY', 'IT', 'SURCHARGE', 'EDUCATION CESS CHARGE',
            'PERQAMOUNT', 'PERQTDS', 'PERQECESS', 'EFFECTIVEDATE'
        ];
        const monthParts = selectedMonthForRsp.split(' ');
        const monthName = monthParts[0] || 'April';
        const yearStr = monthParts[1] || '2025';
        
        const dummyData = selectedEmployees.map(num => [
            `EMP00${num}`, 
            `John Doe ${num}`, 
            'Main Branch', 
            'Gujarat', 
            'Yes', 
            monthName, 
            yearStr, 
            `ABCDE1234${num}`, 
            '85000', 
            (num * 1500).toString(), 
            '0', 
            (num * 60).toString(), 
            '0', 
            '0', 
            '0', 
            `01-${monthName.substring(0,3)}-${yearStr}`
        ]);
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "TDS Return");
        XLSX.writeFile(wb, "TDS_Return_Report.xlsx");
        setIsRspOpen(false);
        setTdsStep(1);
        setSelectedEmployees([]);
    };

    
    const downloadPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("FORM 5", 105, 15, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Return of tax payable by employer under Sub-section (1) of Section 6 of the", 105, 22, { align: "center" });
        doc.text("Gujarat State, Tax on Professions, Trades, Callings and Employments Act, 1976.", 105, 27, { align: "center" });
        doc.text("(See Rule 11)", 105, 32, { align: "center" });
        
        doc.setFontSize(11);
        doc.text("PRC NO", 14, 45);
        doc.text(":  P R C 0 1 0 4 4 9 0 0 0 4 0 4", 70, 45);
        
        doc.text("END DATE OF THE MONTH", 14, 52);
        doc.text(":  " + selectedMonthForRsp.toUpperCase(), 70, 52);
        
        const buName = selectedTarget.replace('bu:', '');
        doc.text("NAME OF THE EMPLOYER", 14, 59);
        doc.setFont("helvetica", "bold");
        doc.text(":  " + buName, 70, 59);
        doc.setFont("helvetica", "normal");
        
        doc.text("ADDRESS", 14, 66);
        doc.text(":  1st Floor, 105, Hill Town Plaza, Near Amar", 70, 66);
        doc.text("   Jawan Circle S.P.Ring Road, Nikol,", 70, 71);
        doc.text("   Ahmedabad - 380009", 70, 76);
        
        doc.setFontSize(9);
        doc.text("Details of employees during the month in respect of whom tax is payable are as under:", 14, 88);
        doc.text("I Details for tax calculation for tax payable in respect of salary for the month ending on " + selectedMonthForRsp.toUpperCase(), 14, 93);
        
        (doc as any).autoTable({
            startY: 96,
            head: [
                [
                    { content: 'Employees whose\nmonthly salaries or\nwages are', styles: { halign: 'center' } },
                    { content: 'No of\nemployees', styles: { halign: 'center' } },
                    { content: 'Number of\nemployees for\nwhom no tax is\npayable under\nprovison to', styles: { halign: 'center' } },
                    { content: 'Number of\nemployees in\nrespect of whom\ntax is payable (i. e.\nCol.2 minus)', styles: { halign: 'center' } },
                    { content: 'Rate of tax per\nmonth per\nemployees', styles: { halign: 'center' } },
                    { content: 'Amount of Tax\nDeducted', styles: { halign: 'center' } }
                ],
                ['1', '2', '3', '4', '5', '6']
            ],
            body: [
                ['0-12000', '0', '', '', '', '0'],
                ['12001 and Above', '12', '', '', '200', '2400.00'],
                [
                    { content: 'TOTAL A RS.', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fillColor: [200, 200, 200] } },
                    { content: '2400.00', styles: { fontStyle: 'bold', fillColor: [200, 200, 200] } }
                ]
            ],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: [0, 0, 0], lineWidth: 0.1 },
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold' },
            columnStyles: { 0: { cellWidth: 35 }, 5: { halign: 'right' } }
        });
        
        let finalY = (doc as any).lastAutoTable.finalY || 96;
        
        doc.text("Details of employees in respect of whom tax is payable at the enhanced rate for previous period on account of arrears salaries or wages", 14, finalY + 6);
        doc.text("paid during the month.", 14, finalY + 10);
        
        (doc as any).autoTable({
            startY: finalY + 13,
            head: [
                [
                    { content: 'Number of employees\nliable to tax at\nenhanced rate to be\nshown separately\naccording to column 4\nand column 5', rowSpan: 2, styles: { halign: 'center' } },
                    { content: 'RATE ON TAX', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Difference of Rate\n(Col. 2 minus Col.\n3)', rowSpan: 2, styles: { halign: 'center' } },
                    { content: 'No. of months for\nwhich arrears is\npaid col. 5)', rowSpan: 2, styles: { halign: 'center' } },
                    { content: 'Additional tax\npayable (Col. 1. col.\n4 and', rowSpan: 2, styles: { halign: 'center' } }
                ],
                [
                    { content: 'payable on\naccount of\narrears salaries\nand wages', styles: { halign: 'center' } },
                    { content: 'At which tax was\npaid', styles: { halign: 'center' } }
                ],
                ['1', '2', '3', '4', '5', '6']
            ],
            body: [
                ['', '', '', '', '', ''],
                [
                    { content: 'TOTAL B RS.', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fillColor: [200, 200, 200] } },
                    { content: '', styles: { fontStyle: 'bold', fillColor: [200, 200, 200] } }
                ]
            ],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: [0, 0, 0], lineWidth: 0.1 },
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold' }
        });
        
        finalY = (doc as any).lastAutoTable.finalY || finalY + 30;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Total Tax payable i.e. Total A + B = ", 14, finalY + 8);
        doc.text("Rs.2400.00", 140, finalY + 8);
        
        doc.setFont("helvetica", "normal");
        doc.text("Add. Simple interest payable (if any )on the above amount at", 14, finalY + 14);
        doc.text("*[one and a half percent] per month or part thereof", 14, finalY + 19);
        doc.text("(vide section 9 (2) of the Act,)", 14, finalY + 24);
        doc.text("Rs._______________________", 140, finalY + 24);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Total Tax and Interest Payable", 14, finalY + 34);
        doc.text("Rs.2400.00", 140, finalY + 34);
        doc.line(140, finalY + 35, 196, finalY + 35);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Amount Paid by Receipt No. :-......................................................Dated.............................", 14, finalY + 44);
        
        doc.text("I certify that all the employees who are liable to pay the tax in my employ during the period of return have been", 14, finalY + 54);
        doc.text("covered by the foregoing particulars. I also certify that the necessary revision in the amount of the tax", 14, finalY + 59);
        doc.text("deductible from the salary or wages of the employees on account of variation in the salary or wages by them has", 14, finalY + 64);
        doc.text("been made where necessary.", 14, finalY + 69);
        
        doc.text("I. Shri ALPESH ISHWARBHAI BHAVSAR solemnly declare that the above statements are true to the best of my knowledge and", 14, finalY + 79);
        doc.text("belief.", 14, finalY + 84);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(buName, 14, finalY + 92);
        
        doc.setFontSize(10);
        doc.text("Authorized Signature", 14, finalY + 110);
        
        doc.save("Form_5_Professional_Tax.pdf");
        setShowGenerateDropdown(false);
    };

    
    const downloadWord = () => {
        const buName = selectedTarget.replace('bu:', '');
        const monthYear = selectedMonthForRsp.toUpperCase();
        
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Form 5</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11pt; }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    table, th, td { border: 1px solid black; }
                    th, td { padding: 5px; font-size: 10pt; text-align: center; }
                    .no-border { border: none; }
                    .no-border td { border: none; text-align: left; padding: 2px; }
                </style>
            </head>
            <body>
                <h1 class="center bold" style="font-size: 16pt;">FORM 5</h1>
                <p class="center" style="margin: 0; font-size: 11pt;">Return of tax payable by employer under Sub-section (1) of Section 6 of the</p>
                <p class="center" style="margin: 0; font-size: 11pt;">Gujarat State, Tax on Professions, Trades, Callings and Employments Act, 1976.</p>
                <p class="center" style="margin: 0; font-size: 11pt;">(See Rule 11)</p>
                <br/>
                
                <table class="no-border">
                    <tr>
                        <td width="30%">PRC NO</td>
                        <td>: <strong>P R C 0 1 0 4 4 9 0 0 0 4 0 4</strong></td>
                    </tr>
                    <tr>
                        <td>END DATE OF THE MONTH</td>
                        <td>: <strong>${monthYear}</strong></td>
                    </tr>
                    <tr>
                        <td>NAME OF THE EMPLOYER</td>
                        <td>: <strong>${buName}</strong></td>
                    </tr>
                    <tr>
                        <td valign="top">ADDRESS</td>
                        <td>: 1st Floor, 105, Hill Town Plaza, Near Amar<br/>Jawan Circle S.P.Ring Road, Nikol,<br/>Ahmedabad - 380009</td>
                    </tr>
                </table>
                <br/>
                
                <p style="font-size: 10pt;">Details of employees during the month in respect of whom tax is payable are as under:</p>
                <p style="font-size: 10pt;">I Details for tax calculation for tax payable in respect of salary for the month ending on <strong>${monthYear}</strong></p>
                
                <table>
                    <tr class="bold">
                        <th>Employees whose monthly salaries or wages are</th>
                        <th>No of employees</th>
                        <th>Number of employees for whom no tax is payable under provison to</th>
                        <th>Number of employees in respect of whom tax is payable (i. e. Col.2 minus)</th>
                        <th>Rate of tax per month per employees</th>
                        <th>Amount of Tax Deducted</th>
                    </tr>
                    <tr class="bold">
                        <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
                    </tr>
                    <tr>
                        <td>0-12000</td><td>0</td><td></td><td></td><td></td><td>0</td>
                    </tr>
                    <tr>
                        <td>12001 and Above</td><td>12</td><td></td><td></td><td>200</td><td>2400.00</td>
                    </tr>
                    <tr style="background-color: #e0e0e0;" class="bold">
                        <td colspan="5" style="text-align: right;">TOTAL A RS.</td>
                        <td>2400.00</td>
                    </tr>
                </table>
                
                <p style="font-size: 10pt;">Details of employees in respect of whom tax is payable at the enhanced rate for previous period on account of arrears salaries or wages paid during the month.</p>
                
                <table>
                    <tr class="bold">
                        <th rowspan="2">Number of employees liable to tax at enhanced rate to be shown separately according to column 4 and column 5</th>
                        <th colspan="2">RATE ON TAX</th>
                        <th rowspan="2">Difference of Rate (Col. 2 minus Col. 3)</th>
                        <th rowspan="2">No. of months for which arrears is paid col. 5)</th>
                        <th rowspan="2">Additional tax payable (Col. 1. col. 4 and</th>
                    </tr>
                    <tr class="bold">
                        <th>payable on account of arrears salaries and wages</th>
                        <th>At which tax was paid</th>
                    </tr>
                    <tr class="bold">
                        <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
                    </tr>
                    <tr>
                        <td><br/></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr style="background-color: #e0e0e0;" class="bold">
                        <td colspan="5" style="text-align: right;">TOTAL B RS.</td>
                        <td></td>
                    </tr>
                </table>
                <br/>
                
                <table class="no-border">
                    <tr>
                        <td class="bold">Total Tax payable i.e. Total A + B =</td>
                        <td class="bold">Rs.2400.00</td>
                    </tr>
                    <tr>
                        <td>Add. Simple interest payable (if any )on the above amount at<br/>*[one and a half percent] per month or part thereof<br/>(vide section 9 (2) of the Act,)</td>
                        <td>Rs._______________________</td>
                    </tr>
                </table>
                <br/>
                <table class="no-border">
                    <tr>
                        <td class="bold" style="font-size: 12pt;">Total Tax and Interest Payable</td>
                        <td class="bold" style="font-size: 12pt; border-bottom: 1px solid black;">Rs.2400.00</td>
                    </tr>
                </table>
                <br/>
                <p>Amount Paid by Receipt No. :-......................................................Dated.............................</p>
                <br/>
                <p>I certify that all the employees who are liable to pay the tax in my employ during the period of return have been covered by the foregoing particulars. I also certify that the necessary revision in the amount of the tax deductible from the salary or wages of the employees on account of variation in the salary or wages by them has been made where necessary.</p>
                <br/>
                <p>I. Shri <u>ALPESH ISHWARBHAI BHAVSAR</u> solemnly declare that the above statements are true to the best of my knowledge and belief.</p>
                <br/>
                <p class="bold" style="font-size: 12pt;">${buName}</p>
                <br/><br/>
                <p class="bold">Authorized Signature</p>
            </body>
            </html>
        `;
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Form_5_Professional_Tax.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowGenerateDropdown(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const configValue = {
                pfEnabled, autoPfChallan, pfPaymentMode, pfAuthorizedSignatory, pfBankName, pfAccountNumber,
                esiEnabled, autoEsiChallan, esiPaymentMode, esiAuthorizedSignatory, esiBankName, esiAccountNumber,
                lwfEnabled, autoLwfChallan, lwfPaymentMode, lwfAuthorizedSignatory, lwfBankName, lwfAccountNumber,
                ptEnabled, autoPtChallan, ptPaymentMode, ptAuthorizedSignatory, ptBankName, ptAccountNumber
            };

            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `challan_settings:${selectedTarget}`,
                    config_value: configValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving Challan settings:', err);
            alert('Failed to save Challan settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-6 w-full space-y-6 bg-slate-50 min-h-screen pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Challan</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* Edit settings removed as requested */}
                </div>
            </div>

            {/* Business Unit Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <select
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                            disabled={isSaving || isEditing}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {BUSINESS_UNITS.map(bu => (
                                <option key={bu} value={`bu:${bu}`}>{bu}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Container */}
            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="w-full bg-white border-b border-slate-200 px-4 lg:px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                                    activeTab === tab
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {/* Edit Deal button removed */}
                </div>

                <div className="p-4 lg:p-6 w-full min-h-[400px]">
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">No.</th>
                                    <th className="px-6 py-4">Month</th>
                                    <th className="px-6 py-4">Created By</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {dummyMonths.map((month, index) => (
                                    <tr key={month} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4">{month}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-700">John Doe</span>
                                                <span className="text-xs text-slate-400">12 Aug 2025, 10:30 AM</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => {
                                                    setSelectedMonthForRsp(month);
                                                    setIsRspOpen(true);
                                                }}
                                                style={{ backgroundColor: '#444CE7' }}
                                                className="hover:opacity-90 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-sm"
                                            >
                                                Generate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            
            {/* Right Side Panel (RSP) */}
            {isRspOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-slate-900 bg-opacity-25 transition-opacity" onClick={() => setIsRspOpen(false)} aria-hidden="true"></div>
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <div className="pointer-events-auto w-screen max-w-5xl transform transition-all ease-in-out duration-300 sm:duration-500 translate-x-0">
                                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                    <div className="px-6 py-6 border-b border-slate-200">
                                        <div className="flex items-start justify-between">
                                            <h2 className="text-xl font-bold text-slate-800" id="slide-over-title">{selectedTarget.replace('bu:', '')}</h2>
                                            <div className="ml-3 flex h-7 items-center">
                                                <button type="button" className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2" onClick={() => { setIsRspOpen(false); setTdsStep(1); setSelectedEmployees([]); setShowGenerateDropdown(false); }}>
                                                    <span className="sr-only">Close panel</span>
                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">For the month of {selectedMonthForRsp}</p>
                                    </div>
                                    <div className="relative flex-1 px-6 py-6 space-y-6">
                                        {/* RSP Fields */}
                                        {activeTab === 'Professional Tax' && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Number of subscribers (Employees)</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="150" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total Gross Amount</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 45,00,000.00" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total Professional Tax</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 30,000.00" />
                                                </div>
                                            </>
                                        )}

                                        {activeTab === 'ESI' && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Number of Subscribers (employees)</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="120" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total Employee's ESI Contribution</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 15,400.00" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total Employer's ESI Contribution</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 66,300.00" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total Monthly wages</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 20,50,000.00" />
                                                </div>
                                            </>
                                        )}
                                        
                                        {activeTab === 'Provident Fund' && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Number of Subscribers (employees)</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="135" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total PF Gross</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 22,10,000.00" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total Pension Wages</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 19,50,000.00" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Total EDLI Wages</label>
                                                    <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 19,50,000.00" />
                                                </div>

                                                {/* Employee Contribution Section */}
                                                <div className="pt-4 border-t border-slate-200">
                                                    <h3 className="text-md font-bold text-slate-800 mb-3">Employee Contribution</h3>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700">Employee's Contribution (Account 1)</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 2,65,200.00" />
                                                    </div>
                                                </div>

                                                {/* Employer's Contribution Section */}
                                                <div className="pt-4 border-t border-slate-200 space-y-4">
                                                    <h3 className="text-md font-bold text-slate-800 mb-3">Employer's Contribution</h3>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700">Employees' Provident Fund (Account 1)</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 1,02,800.00" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700">PF Admin Charges (Account 2)</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 11,050.00" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700">Employees' Pension Scheme (Account 10)</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 1,62,400.00" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700">EDLI Contribution (Account 21)</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 9,750.00" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700">EDLI Admin Charges (Account 22)</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 0.00" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        
                                        {activeTab === 'TDS' && tdsStep === 1 && (
                                            <div className="space-y-4">
                                                <h3 className="text-md font-bold text-slate-800">Step 1: Employee List</h3>
                                                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                                                    <table className="w-full text-left text-sm text-slate-600">
                                                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] sm:text-xs tracking-wider">
                                                            <tr>
                                                                <th className="px-2 py-3 text-center">
                                                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600" 
                                                                        checked={selectedEmployees.length === 5}
                                                                        onChange={(e) => setSelectedEmployees(e.target.checked ? [1, 2, 3, 4, 5] : [])}
                                                                    />
                                                                </th>
                                                                <th className="px-2 py-3">Employee Code</th>
                                                                <th className="px-2 py-3">Employee Name</th>
                                                                <th className="px-2 py-3">PAN Number</th>
                                                                <th className="px-2 py-3">Salary Processed Date</th>
                                                                <th className="px-2 py-3">Gross Salary</th>
                                                                <th className="px-2 py-3">Income Tax</th>
                                                                <th className="px-2 py-3">Surcharge</th>
                                                                <th className="px-2 py-3">ECess</th>
                                                                <th className="px-2 py-3">Total Tax</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white">
                                                            {[1, 2, 3, 4, 5].map((num) => (
                                                                <tr key={num} className="hover:bg-slate-50/50">
                                                                    <td className="px-2 py-3 text-center">
                                                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600" 
                                                                            checked={selectedEmployees.includes(num)}
                                                                            onChange={(e) => {
                                                                                if (e.target.checked) {
                                                                                    setSelectedEmployees([...selectedEmployees, num]);
                                                                                } else {
                                                                                    setSelectedEmployees(selectedEmployees.filter(id => id !== num));
                                                                                }
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-2 py-3 font-medium">EMP00{num}</td>
                                                                    <td className="px-2 py-3 truncate max-w-[100px]" title={`John Doe ${num}`}>John Doe {num}</td>
                                                                    <td className="px-2 py-3">ABCDE1234{num}</td>
                                                                    <td className="px-2 py-3">01 Aug 2025</td>
                                                                    <td className="px-2 py-3">₹ 85,000.00</td>
                                                                    <td className="px-2 py-3">₹ {(num * 1500).toFixed(2)}</td>
                                                                    <td className="px-2 py-3">₹ 0.00</td>
                                                                    <td className="px-2 py-3">₹ {(num * 60).toFixed(2)}</td>
                                                                    <td className="px-2 py-3 font-semibold text-slate-800">₹ {(num * 1560).toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'TDS' && tdsStep === 2 && (
                                            <div className="space-y-4">
                                                
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-md font-bold text-slate-800">Step 2: Challan Details</h3>
                                                    <button type="button" onClick={autoFillTdsForm} className="text-xs px-3 py-1 bg-sky-50 text-sky-600 rounded-full font-semibold hover:bg-sky-100 transition-colors border border-sky-100">Auto-fill Dummy Data</button>
                                                </div>

                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Challan Alias</label>
                                                        <input type="text" value={tdsForm.challanAlias} onChange={(e) => setTdsForm({...tdsForm, challanAlias: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter alias" />
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Nature of Payment</label>
                                                        <select value={tdsForm.natureOfPayment} onChange={(e) => setTdsForm({...tdsForm, natureOfPayment: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">
                                                            <option>Select Option</option>
                                                            <option>92B - Salary</option>
                                                            <option>94J - Professional Services</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Challan Number</label>
                                                        <input type="text" value={tdsForm.challanNumber} onChange={(e) => setTdsForm({...tdsForm, challanNumber: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter challan no" />
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Payment Mode</label>
                                                        <select value={tdsForm.paymentMode} onChange={(e) => setTdsForm({...tdsForm, paymentMode: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">
                                                            <option>Select Option</option>
                                                            <option>Net Banking</option>
                                                            <option>Debit Card</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Bank</label>
                                                        <select value={tdsForm.bank} onChange={(e) => setTdsForm({...tdsForm, bank: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">
                                                            <option>Select Bank</option>
                                                            <option>HDFC Bank</option>
                                                            <option>State Bank of India</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Branch</label>
                                                        <select value={tdsForm.branch} onChange={(e) => setTdsForm({...tdsForm, branch: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">
                                                            <option>Select Branch</option>
                                                            <option>Main Branch</option>
                                                            <option>City Center</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">BSR Code</label>
                                                        <input type="text" value={tdsForm.bsrCode} onChange={(e) => setTdsForm({...tdsForm, bsrCode: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter BSR code" />
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Challan Date</label>
                                                        <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                                                    </div>
                                                </div>

                                                <div className="pt-4 mt-2 border-t border-slate-200 grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Total Income Tax</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 45,000.00" />
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Total Surcharge</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 0.00" />
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Total ECess</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 1,800.00" />
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Penalty Paid</label>
                                                        <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="₹ 0.00" defaultValue="0" />
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                                        <label className="text-sm font-semibold text-slate-700">Total Amount</label>
                                                        <input readOnly type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none" value="₹ 46,800.00" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-shrink-0 justify-end px-6 py-4 border-t border-slate-200 gap-3">
                                        <button type="button" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50" onClick={() => { setIsRspOpen(false); setTdsStep(1); setSelectedEmployees([]); setShowGenerateDropdown(false); }}>
                                            Cancel
                                        </button>
                                        
                                        {activeTab === 'TDS' && tdsStep === 1 && (
                                            <button type="button" style={{ backgroundColor: '#444CE7' }} className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90" onClick={() => setTdsStep(2)}>
                                                Next
                                            </button>
                                        )}
                                        
                                        {activeTab === 'TDS' && tdsStep === 2 && (
                                            <>
                                                <button type="button" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50" onClick={() => setTdsStep(1)}>
                                                    Back
                                                </button>
                                                <button type="button" onClick={downloadTdsExcel} style={{ backgroundColor: '#444CE7' }} className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                                                    Generate
                                                </button>
                                            </>
                                        )}

                                        {activeTab === 'Professional Tax' && (
                                            <div className="relative inline-block text-left">
                                                <button type="button" onClick={() => setShowGenerateDropdown(!showGenerateDropdown)} style={{ backgroundColor: '#444CE7' }} className="inline-flex justify-center items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                                                    Generate
                                                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                {showGenerateDropdown && (
                                                    <div className="absolute right-0 bottom-full mb-2 z-10 w-40 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <div className="py-1">
                                                            <button className="text-slate-700 block px-4 py-2 text-sm w-full text-left hover:bg-slate-100" onClick={downloadPDF}>Form-5 (PDF)</button>
                                                            <button className="text-slate-700 block px-4 py-2 text-sm w-full text-left hover:bg-slate-100" onClick={downloadWord}>Form-5 (Word)</button>
                                                            <button className="text-slate-700 block px-4 py-2 text-sm w-full text-left hover:bg-slate-100" onClick={downloadExcel}>Excel</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'ESI' && (
                                            <button type="button" onClick={downloadEsiExcel} style={{ backgroundColor: '#444CE7' }} className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                                                Generate
                                            </button>
                                        )}

                                        {activeTab === 'Provident Fund' && (
                                            <div className="relative inline-block text-left">
                                                <button type="button" onClick={() => setShowGenerateDropdown(!showGenerateDropdown)} style={{ backgroundColor: '#444CE7' }} className="inline-flex justify-center items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                                                    Generate
                                                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                {showGenerateDropdown && (
                                                    <div className="absolute right-0 bottom-full mb-2 z-10 w-40 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <div className="py-1">
                                                            <button className="text-slate-700 block px-4 py-2 text-sm w-full text-left hover:bg-slate-100" onClick={downloadPfExcel}>Excel</button>
                                                            <button className="text-slate-700 block px-4 py-2 text-sm w-full text-left hover:bg-slate-100" onClick={downloadPfText}>Text</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default ChallanSettings;