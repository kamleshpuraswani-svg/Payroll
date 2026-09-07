const fs = require('fs');
const file = 'd:/Payroll/Payroll/components/ChallanSettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
const stateToAdd = `
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
`;
if (!content.includes('const [tdsForm, setTdsForm]')) {
    content = content.replace("const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);", "const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);\n" + stateToAdd);
}

// Update the header of step 2
const oldHeader = `<h3 className="text-md font-bold text-slate-800 mb-4">Step 2: Challan Details</h3>`;
const newHeader = `
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-md font-bold text-slate-800">Step 2: Challan Details</h3>
                                                    <button type="button" onClick={autoFillTdsForm} className="text-xs px-3 py-1 bg-sky-50 text-sky-600 rounded-full font-semibold hover:bg-sky-100 transition-colors border border-sky-100">Auto-fill Dummy Data</button>
                                                </div>
`;
content = content.replace(oldHeader, newHeader);

// Bind inputs
content = content.replace(
    `<input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter alias" />`,
    `<input type="text" value={tdsForm.challanAlias} onChange={(e) => setTdsForm({...tdsForm, challanAlias: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter alias" />`
);

content = content.replace(
    `<select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Option</option>\n                                                            <option>92B - Salary</option>\n                                                            <option>94J - Professional Services</option>\n                                                        </select>`,
    `<select value={tdsForm.natureOfPayment} onChange={(e) => setTdsForm({...tdsForm, natureOfPayment: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Option</option>\n                                                            <option>92B - Salary</option>\n                                                            <option>94J - Professional Services</option>\n                                                        </select>`
);

content = content.replace(
    `<input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter challan no" />`,
    `<input type="text" value={tdsForm.challanNumber} onChange={(e) => setTdsForm({...tdsForm, challanNumber: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter challan no" />`
);

content = content.replace(
    `<select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Option</option>\n                                                            <option>Net Banking</option>\n                                                            <option>Debit Card</option>\n                                                        </select>`,
    `<select value={tdsForm.paymentMode} onChange={(e) => setTdsForm({...tdsForm, paymentMode: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Option</option>\n                                                            <option>Net Banking</option>\n                                                            <option>Debit Card</option>\n                                                        </select>`
);

content = content.replace(
    `<select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Bank</option>\n                                                            <option>HDFC Bank</option>\n                                                            <option>State Bank of India</option>\n                                                        </select>`,
    `<select value={tdsForm.bank} onChange={(e) => setTdsForm({...tdsForm, bank: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Bank</option>\n                                                            <option>HDFC Bank</option>\n                                                            <option>State Bank of India</option>\n                                                        </select>`
);

content = content.replace(
    `<select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Branch</option>\n                                                            <option>Main Branch</option>\n                                                            <option>City Center</option>\n                                                        </select>`,
    `<select value={tdsForm.branch} onChange={(e) => setTdsForm({...tdsForm, branch: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white">\n                                                            <option>Select Branch</option>\n                                                            <option>Main Branch</option>\n                                                            <option>City Center</option>\n                                                        </select>`
);

content = content.replace(
    `<input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter BSR code" />`,
    `<input type="text" value={tdsForm.bsrCode} onChange={(e) => setTdsForm({...tdsForm, bsrCode: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" placeholder="Enter BSR code" />`
);

content = content.replace(
    `<input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-slate-500" />`,
    `<input type="date" value={tdsForm.challanDate} onChange={(e) => setTdsForm({...tdsForm, challanDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-slate-500" />`
);

content = content.replace(
    `<input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-slate-50 text-slate-600" defaultValue="0" />`,
    `<input type="text" value={tdsForm.penaltyPaid} onChange={(e) => setTdsForm({...tdsForm, penaltyPaid: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 text-slate-600" />`
);

fs.writeFileSync(file, content, 'utf8');
