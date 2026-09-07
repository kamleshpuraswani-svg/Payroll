const fs = require('fs');

const file = 'd:/Payroll/Payroll/components/ChallanSettings.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import 'jspdf-autotable';")) {
    content = content.replace("import { jsPDF } from 'jspdf';", "import { jsPDF } from 'jspdf';\nimport 'jspdf-autotable';");
}

const newPDF = `
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
                    { content: 'Employees whose\\nmonthly salaries or\\nwages are', styles: { halign: 'center' } },
                    { content: 'No of\\nemployees', styles: { halign: 'center' } },
                    { content: 'Number of\\nemployees for\\nwhom no tax is\\npayable under\\nprovison to', styles: { halign: 'center' } },
                    { content: 'Number of\\nemployees in\\nrespect of whom\\ntax is payable (i. e.\\nCol.2 minus)', styles: { halign: 'center' } },
                    { content: 'Rate of tax per\\nmonth per\\nemployees', styles: { halign: 'center' } },
                    { content: 'Amount of Tax\\nDeducted', styles: { halign: 'center' } }
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
                    { content: 'Number of employees\\nliable to tax at\\nenhanced rate to be\\nshown separately\\naccording to column 4\\nand column 5', rowSpan: 2, styles: { halign: 'center' } },
                    { content: 'RATE ON TAX', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Difference of Rate\\n(Col. 2 minus Col.\\n3)', rowSpan: 2, styles: { halign: 'center' } },
                    { content: 'No. of months for\\nwhich arrears is\\npaid col. 5)', rowSpan: 2, styles: { halign: 'center' } },
                    { content: 'Additional tax\\npayable (Col. 1. col.\\n4 and', rowSpan: 2, styles: { halign: 'center' } }
                ],
                [
                    { content: 'payable on\\naccount of\\narrears salaries\\nand wages', styles: { halign: 'center' } },
                    { content: 'At which tax was\\npaid', styles: { halign: 'center' } }
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
    };`;

const newWord = `
    const downloadWord = () => {
        const buName = selectedTarget.replace('bu:', '');
        const monthYear = selectedMonthForRsp.toUpperCase();
        
        const htmlContent = \`
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
                        <td>: <strong>\${monthYear}</strong></td>
                    </tr>
                    <tr>
                        <td>NAME OF THE EMPLOYER</td>
                        <td>: <strong>\${buName}</strong></td>
                    </tr>
                    <tr>
                        <td valign="top">ADDRESS</td>
                        <td>: 1st Floor, 105, Hill Town Plaza, Near Amar<br/>Jawan Circle S.P.Ring Road, Nikol,<br/>Ahmedabad - 380009</td>
                    </tr>
                </table>
                <br/>
                
                <p style="font-size: 10pt;">Details of employees during the month in respect of whom tax is payable are as under:</p>
                <p style="font-size: 10pt;">I Details for tax calculation for tax payable in respect of salary for the month ending on <strong>\${monthYear}</strong></p>
                
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
                <p class="bold" style="font-size: 12pt;">\${buName}</p>
                <br/><br/>
                <p class="bold">Authorized Signature</p>
            </body>
            </html>
        \`;
        const blob = new Blob(['\\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Form_5_Professional_Tax.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowGenerateDropdown(false);
    };`;

content = content.replace(/const downloadPDF = \(\) => \{[\s\S]*?setShowGenerateDropdown\(false\);\r?\n    \};/, newPDF);
content = content.replace(/const downloadWord = \(\) => \{[\s\S]*?setShowGenerateDropdown\(false\);\r?\n    \};/, newWord);

fs.writeFileSync(file, content, 'utf8');
