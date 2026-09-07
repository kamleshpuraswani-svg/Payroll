const fs = require('fs');

const file = 'd:/Payroll/Payroll/components/ChallanSettings.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('downloadTdsExcel')) {
    const tdsFunction = `
    const downloadTdsExcel = () => {
        const headers = [
            'EMPCODE', 'EMPNAME', 'BRANCH', 'STATE', 'IS AADHAR AND PAN NUMBER LINKED', 
            'MONTH', 'YEAR', 'PAN', 'SALARY', 'IT', 'SURCHARGE', 'EDUCATION CESS CHARGE',
            'PERQAMOUNT', 'PERQTDS', 'PERQECESS', 'EFFECTIVEDATE'
        ];
        const dummyData = [
            ['EMP001', 'John Doe 1', 'Main Branch', 'Gujarat', 'Yes', 'April', '2025', 'ABCDE12341', '85000', '1500', '0', '60', '0', '0', '0', '01-Apr-2025'],
            ['EMP002', 'John Doe 2', 'Main Branch', 'Gujarat', 'Yes', 'April', '2025', 'ABCDE12342', '85000', '3000', '0', '120', '0', '0', '0', '01-Apr-2025'],
            ['EMP003', 'John Doe 3', 'Main Branch', 'Gujarat', 'Yes', 'April', '2025', 'ABCDE12343', '85000', '4500', '0', '180', '0', '0', '0', '01-Apr-2025'],
        ];
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "TDS Return");
        XLSX.writeFile(wb, "TDS_Return_Report.xlsx");
        setIsRspOpen(false);
        setTdsStep(1);
        setSelectedEmployees([]);
    };
`;
    // Insert it right after downloadPfText
    content = content.replace(/setShowGenerateDropdown\(false\);\r?\n    \};/, 'setShowGenerateDropdown(false);\n    };\n' + tdsFunction);
}

// Bind it to the button
content = content.replace(
    /{activeTab === 'TDS' && tdsStep === 2 && \(\s*<button type="button" style=\{\{ backgroundColor: '#444CE7' \}\} className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">\s*Generate\s*<\/button>\s*\)}/,
    `{activeTab === 'TDS' && tdsStep === 2 && (
                                            <button type="button" onClick={downloadTdsExcel} style={{ backgroundColor: '#444CE7' }} className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                                                Generate
                                            </button>
                                        )}`
);

fs.writeFileSync(file, content, 'utf8');
