import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateTaxSlipPDF = (month: string) => {
    const doc = new jsPDF('p', 'pt', 'a4');

    // Header - Company Logo and Info
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 20, 60); // Reddish color for 'mi'
    doc.text('mi', 40, 50);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('mind', 75, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('inventory', 75, 58);

    // Company Address (Right aligned)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Mind Inventory', 555, 40, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('801-808, City Centre 2, Near Heer Party Plot,', 555, 55, { align: 'right' });
    doc.text('Science City Road, Sola, Ahmedabad,', 555, 70, { align: 'right' });
    doc.text('Gujarat- 380060', 555, 85, { align: 'right' });

    // Black Banner - TAX SLIP FOR <MONTH>
    doc.setFillColor(0, 0, 0);
    doc.rect(40, 110, 515, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TAX SLIP FOR ${month.toUpperCase()}`, 297.5, 127, { align: 'center' });

    // Employee Info Table
    autoTable(doc, {
        startY: 135,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 6,
            lineColor: [180, 180, 180],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 120 },
            1: { fillColor: [255, 255, 255], cellWidth: 160 },
            2: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 100 },
            3: { fillColor: [255, 255, 255], cellWidth: 135 },
        },
        body: [
            ['Name', 'John Smith Doe', 'PAN', 'ABCD1234E'],
            ['Employee Code', 'EMP-425', 'Sex', 'Male'],
            ['Designation', 'Senior Software Engineer', 'Joining Date', '01/04/2023'],
            ['Location', 'Mumbai', 'Tax Regime', 'OLD']
        ],
        margin: { left: 40, right: 40 }
    });

    const colWidths = [185, 85, 85, 80, 80]; // Total 515
    // Income Under Salary Heads Banner
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(0, 0, 0);
    doc.rect(40, currentY, 515, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('A. INCOME UNDER SALARY HEADS', 45, currentY + 14);
    doc.text('1245000.00', 550, currentY + 14, { align: 'right' });

    // Earnings Table
    autoTable(doc, {
        startY: currentY + 20,
        theme: 'grid',
        headStyles: {
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 4,
            lineColor: [150, 150, 150],
            lineWidth: 0.5,
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [150, 150, 150],
            lineWidth: 0.5,
        },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: colWidths[0] },
            1: { halign: 'right', cellWidth: colWidths[1] },
            2: { halign: 'right', cellWidth: colWidths[2] },
            3: { halign: 'right', cellWidth: colWidths[3] },
            4: { halign: 'right', cellWidth: colWidths[4] }
        },
        head: [['COMPONENTS', 'EARNING YTD', 'PROJECTED ANNUAL\nEARNING', 'EXEMPTED INCOME', 'TAXABLE INCOME']],
        body: [
            ['Basic', '450000.00', '900000.00', '0.00', '900000.00'],
            ['HRA', '180000.00', '360000.00', '50000.00', '310000.00'],
            ['Special Allowance', '60000.00', '120000.00', '0.00', '120000.00'],
            ['Conveyance Allowance', '12000.00', '24000.00', '0.00', '24000.00'],
            ['Medical Allowance', '15000.00', '30000.00', '15000.00', '15000.00'],
            ['Bonus', '0.00', '50000.00', '0.00', '50000.00']
        ],
        margin: { left: 40, right: 40 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    const addSection = (title: string, value?: string, subRows: string[][] = []) => {
        const bodyRow = value !== undefined ? [title, '', '', '', value] : [title, '', '', '', ''];
        autoTable(doc, {
            startY: currentY,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 4, lineColor: [150, 150, 150], lineWidth: 0.5 },
            columnStyles: {
                0: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', cellWidth: colWidths[0] },
                1: { fillColor: [0, 0, 0], cellWidth: colWidths[1] },
                2: { fillColor: [0, 0, 0], cellWidth: colWidths[2] },
                3: { fillColor: [0, 0, 0], cellWidth: colWidths[3] },
                4: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'right', cellWidth: colWidths[4] }
            },
            body: [bodyRow],
            margin: { left: 40, right: 40 }
        });

        currentY = (doc as any).lastAutoTable.finalY;

        if (subRows.length > 0) {
            autoTable(doc, {
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 4, lineColor: [150, 150, 150], lineWidth: 0.5 },
                columnStyles: {
                    0: { cellWidth: colWidths[0] },
                    1: { cellWidth: colWidths[1] },
                    2: { cellWidth: colWidths[2] },
                    3: { cellWidth: colWidths[3] },
                    4: { halign: 'right', cellWidth: colWidths[4] }
                },
                body: subRows.map(row => [
                    { content: row[0], colSpan: 4, styles: { fillColor: [240, 240, 240] } },
                    row[1]
                ]),
                margin: { left: 40, right: 40 }
            });
            currentY = (doc as any).lastAutoTable.finalY;
        }

        currentY += 10;
    };

    addSection('B. PREVIOUS EMPLOYER INCOME', '0.00');
    addSection('C. OTHER INCOME/ LOSS', '0.00');
    addSection('D. GROSS TOTAL INCOME (A+B+C)', '1245000.00');
    addSection('E. STANDARD DEDUCTION', '50000.00');
    addSection('F. DEDUCTION UNDER SECTION 80 C', '0.00');
    addSection('G. DEDUCTION UNDER CHAPTER\nSECTION VIA', '50000.00', [
        ["Section 124(2): Employer's contribution to NPS account, deducted from salary", "50000.00"]
    ]);
    addSection('NET TAX', undefined, [
        ['Net Taxable Income (D-E-F-G)', '1500500.00'],
        ['PFPERQ_Taxable_Amount', '0'],
        ['PFPERQ_Interest_Amount', '0'],
        ['Tax on Total Income', '120500.00'],
        ['Professional Tax', '2500.00'],
        ['Sur Charge', '500.00'],
        ['Marginal Relief', '0.00'],
        ['Ecess', '4820.00'],
        ['Tax', '125820.00'],
        ['Rebate under Section 87 A', '0.00'],
        ['TDS deducted outside HROne', '15000.00'],
        ['Additional Tax', '2000.00'],
        ['Net Tax', '112820.00'],
        ['TDS till Month', '45000.00'],
        ['Tax deducted from previous employer', '10000.00'],
        ['TDS to be deducted', '57820.00']
    ]);

    // Month wise TDS banner
    autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, lineColor: [150, 150, 150], lineWidth: 0.5 },
        columnStyles: {
            0: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' }
        },
        body: [['MONTH WISE TDS']],
        margin: { left: 40, right: 40 }
    });
    currentY = (doc as any).lastAutoTable.finalY;

    // Month wise TDS data
    autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        headStyles: {
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 4,
            lineColor: [150, 150, 150],
            lineWidth: 0.5,
            halign: 'center'
        },
        styles: { fontSize: 9, cellPadding: 4, lineColor: [150, 150, 150], lineWidth: 0.5, halign: 'center' },
        head: [['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']],
        body: [
            ['4500.00', '4500.00', '4500.00', '4500.00', '4500.00', '4500.00', '4500.00', '4500.00', '4500.00', '4500.00', '6410.00', '6410.00']
        ],
        margin: { left: 40, right: 40 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;

    // HRA Exemption Banner
    autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, lineColor: [150, 150, 150], lineWidth: 0.5 },
        columnStyles: {
            0: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', cellWidth: colWidths[0] },
            1: { fillColor: [0, 0, 0], cellWidth: colWidths[1] },
            2: { fillColor: [0, 0, 0], cellWidth: colWidths[2] },
            3: { fillColor: [0, 0, 0], cellWidth: colWidths[3] },
            4: { fillColor: [0, 0, 0], cellWidth: colWidths[4] }
        },
        body: [['HRA EXEMPTION', '', '', '', '']],
        margin: { left: 40, right: 40 }
    });
    currentY = (doc as any).lastAutoTable.finalY;

    // HRA Exemption Data
    autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, lineColor: [150, 150, 150], lineWidth: 0.5 },
        columnStyles: {
            0: { cellWidth: colWidths[0] },
            1: { cellWidth: colWidths[1] },
            2: { cellWidth: colWidths[2] },
            3: { cellWidth: colWidths[3] },
            4: { halign: 'right', cellWidth: colWidths[4] }
        },
        body: [
            [{ content: '', colSpan: 4, styles: { fillColor: [240, 240, 240] } }, { content: 'TOTAL', styles: { halign: 'center', fontStyle: 'bold', fillColor: [240, 240, 240] } }],
            [{ content: 'Actual Rent Paid', colSpan: 4, styles: { fillColor: [240, 240, 240] } }, '150000.00'],
            [{ content: 'X. HRA', colSpan: 4, styles: { fillColor: [240, 240, 240] } }, '180000.00'],
            [{ content: 'Y. 50% of Basic', colSpan: 4, styles: { fillColor: [240, 240, 240] } }, '450000.00'],
            [{ content: 'Z. Actual rent paid- 10% of Basic', colSpan: 4, styles: { fillColor: [240, 240, 240] } }, '60000.00'],
            [{ content: 'Min of X, Y & Z', colSpan: 4, styles: { fillColor: [240, 240, 240] } }, '60000.00']
        ],
        margin: { left: 40, right: 40 }
    });

    doc.save(`Tax_Slip_${month.replace(' ', '_')}.pdf`);
};
