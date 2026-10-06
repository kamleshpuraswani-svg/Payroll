import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';

export interface Form16RecordData {
  id: string;
  empId: string;
  empName: string;
  department: string;
  pan: string;
  financialYear: string;
  assessmentYear: string;
  status?: string;
  partAFileName?: string;
  partBFileName?: string;
  grossSalary: number;
  tdsDeducted: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

/**
 * Generate Form-16 Part A jsPDF Document (TRACES Format)
 */
export const generateForm16PartADoc = (record: Form16RecordData): jsPDF => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt

  // Colors
  const darkIndigo = [68, 76, 231]; // #444CE7
  const borderGrey = [200, 205, 215];

  // Document Outer Border
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.setLineWidth(1);
  doc.rect(30, 30, pageWidth - 60, 782);

  // Top Header Banner
  doc.setFillColor(248, 250, 252);
  doc.rect(31, 31, pageWidth - 62, 58, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('FORM NO. 16', pageWidth / 2, 52, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('[See rule 31(1)(a)]', pageWidth / 2, 65, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
  doc.text('PART A', pageWidth / 2, 79, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary',
    pageWidth / 2,
    100,
    { align: 'center' }
  );

  // Certificate ID & FY Info Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(40, 108, pageWidth - 80, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, 108, pageWidth - 80, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Certificate No: TRACES-${record.pan.substring(0, 5)}-${record.financialYear.replace('-', '')}-A`, 48, 122);
  doc.text(`Financial Year: ${record.financialYear} | Assessment Year: ${record.assessmentYear}`, pageWidth - 48, 122, { align: 'right' });

  // Table 1: Deductor & Employee Details
  autoTable(doc, {
    startY: 136,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 6,
      lineColor: [203, 213, 225],
      lineWidth: 0.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 130 },
      1: { cellWidth: 135 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 120 },
      3: { cellWidth: 130 },
    },
    body: [
      [
        'Name and Address of Employer (Deductor):',
        'CollabCRM Technologies Pvt. Ltd.\n801-808, City Centre 2, Science City Road, Sola, Ahmedabad, Gujarat - 380060',
        'Name and Address of Employee (Deductee):',
        `${record.empName}\nEmp ID: ${record.empId}\nDept: ${record.department}`
      ],
      [
        'PAN of the Deductor:',
        'AABCC1234F',
        'PAN of the Employee:',
        record.pan
      ],
      [
        'TAN of the Deductor:',
        'AHMC01234D',
        'Employee Reference No:',
        record.empId
      ],
      [
        'CIT (TDS) Jurisdiction:',
        'CIT (TDS), Ahmedabad',
        'Period with Employer:',
        `01-Apr-${record.financialYear.split('-')[0]} to 31-Mar-20${record.financialYear.split('-')[1]}`
      ],
    ],
    margin: { left: 40, right: 40 }
  });

  // Table 2: Summary of Tax Deducted and Deposited
  const currentY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Summary of Amount Paid / Credited and Tax Deducted at Source (Quarterly):', 40, currentY);

  const qGross = Math.round(record.grossSalary / 4);
  const qTds = Math.round(record.tdsDeducted / 4);
  const qTdsLast = record.tdsDeducted - (qTds * 3);

  autoTable(doc, {
    startY: currentY + 6,
    theme: 'grid',
    headStyles: {
      fillColor: [68, 76, 231],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 5,
      halign: 'center'
    },
    styles: {
      fontSize: 8,
      cellPadding: 5,
      lineColor: [203, 213, 225],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 50 },
      1: { halign: 'center', cellWidth: 100 },
      2: { halign: 'right', cellWidth: 90 },
      3: { halign: 'right', cellWidth: 85 },
      4: { halign: 'right', cellWidth: 85 },
      5: { halign: 'center', cellWidth: 105 },
    },
    head: [
      ['Quarter', 'TDS Receipt No.', 'Amount Paid (Rs.)', 'Tax Deducted (Rs.)', 'Tax Deposited (Rs.)', 'Challan BSR / Date']
    ],
    body: [
      ['Q1', '24589012301', qGross.toLocaleString('en-IN'), qTds.toLocaleString('en-IN'), qTds.toLocaleString('en-IN'), '0210045 / 05-Jul-2024'],
      ['Q2', '24589012302', qGross.toLocaleString('en-IN'), qTds.toLocaleString('en-IN'), qTds.toLocaleString('en-IN'), '0210045 / 06-Oct-2024'],
      ['Q3', '24589012303', qGross.toLocaleString('en-IN'), qTds.toLocaleString('en-IN'), qTds.toLocaleString('en-IN'), '0210045 / 07-Jan-2025'],
      ['Q4', '24589012304', (record.grossSalary - (qGross * 3)).toLocaleString('en-IN'), qTdsLast.toLocaleString('en-IN'), qTdsLast.toLocaleString('en-IN'), '0210045 / 15-Apr-2025'],
      [
        { content: 'Total', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center', fillColor: [241, 245, 249] } },
        { content: record.grossSalary.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
        { content: record.tdsDeducted.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
        { content: record.tdsDeducted.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
        { content: 'Matched & Booked', styles: { fontStyle: 'bold', halign: 'center', fillColor: [241, 245, 249], textColor: [22, 101, 52] } }
      ]
    ],
    margin: { left: 40, right: 40 }
  });

  // Verification Box
  const verifyY = (doc as any).lastAutoTable.finalY + 15;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(40, verifyY, pageWidth - 80, 115, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Verification & Certification', 50, verifyY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const certText = `I, Authorized Signatory, working in the capacity of Finance & Accounts Manager, do hereby certify that a sum of Rs. ${record.tdsDeducted.toLocaleString('en-IN')} [Rupees only] has been deducted at source and deposited to the credit of the Central Government. I further certify that the information given above is complete, true and correct and based on the books of account, documents and TRACES TDS statements.`;
  doc.text(doc.splitTextToSize(certText, pageWidth - 100), 50, verifyY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Place: Ahmedabad', 50, verifyY + 90);
  doc.text('Date: 12-Jun-2025', 50, verifyY + 102);

  // Digital Signature Badge
  doc.setDrawColor(68, 76, 231);
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(pageWidth - 210, verifyY + 68, 160, 40, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 76, 231);
  doc.text('Digitally Signed by:', pageWidth - 202, verifyY + 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('CollabCRM Payroll Authority', pageWidth - 202, verifyY + 91);
  doc.text(`TRACES Verified • FY ${record.financialYear}`, pageWidth - 202, verifyY + 101);

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated Form-16 Part A document downloaded from CollabCRM Payroll.', pageWidth / 2, 795, { align: 'center' });

  return doc;
};

/**
 * Generate Form-16 Part B jsPDF Document (Salary Computation & Tax Annexure)
 */
export const generateForm16PartBDoc = (record: Form16RecordData): jsPDF => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const darkIndigo = [68, 76, 231];
  const borderGrey = [200, 205, 215];

  // Document Outer Border
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.setLineWidth(1);
  doc.rect(30, 30, pageWidth - 60, 782);

  // Top Header Banner
  doc.setFillColor(248, 250, 252);
  doc.rect(31, 31, pageWidth - 62, 58, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('FORM NO. 16', pageWidth / 2, 52, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
  doc.text('PART B (Annexure)', pageWidth / 2, 67, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Details of Salary paid and any other income and tax deducted (See rule 31(1)(a))',
    pageWidth / 2,
    81,
    { align: 'center' }
  );

  // Employee Information Ribbon
  doc.setFillColor(241, 245, 249);
  doc.rect(40, 93, pageWidth - 80, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, 93, pageWidth - 80, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Employee: ${record.empName} (${record.empId})`, 48, 108);
  doc.text(`PAN: ${record.pan}`, 260, 108);
  doc.text(`FY: ${record.financialYear} | AY: ${record.assessmentYear}`, pageWidth - 48, 108, { align: 'right' });

  // Breakdown calculations based on grossSalary and tdsDeducted
  const gross = record.grossSalary;
  const exemptHra = Math.min(120000, Math.round(gross * 0.1));
  const exemptLta = Math.min(25000, Math.round(gross * 0.02));
  const totalExemptSec10 = exemptHra + exemptLta;
  const balanceAfter10 = gross - totalExemptSec10;

  const standardDeduction = 50000;
  const professionalTax = 2400;
  const totalSec16 = standardDeduction + professionalTax;
  const incomeSalaries = balanceAfter10 - totalSec16;

  const sec80C = Math.min(150000, Math.round(gross * 0.12));
  const sec80D = 25000;
  const sec80CCD = 50000;
  const totalChapterVIA = sec80C + sec80D + sec80CCD;

  const totalTaxableIncome = Math.max(0, incomeSalaries - totalChapterVIA);
  const totalTax = record.tdsDeducted;
  const basicTax = Math.round(totalTax / 1.04);
  const cess = totalTax - basicTax;

  // Table: Detailed Computation of Taxable Salary
  autoTable(doc, {
    startY: 124,
    theme: 'grid',
    headStyles: {
      fillColor: [68, 76, 231],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 4,
      halign: 'center'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 35, halign: 'center' },
      1: { cellWidth: 260 },
      2: { cellWidth: 105, halign: 'right' },
      3: { cellWidth: 115, halign: 'right', fontStyle: 'bold' }
    },
    head: [
      ['No.', 'Particulars of Income / Deductions', 'Sub-Amount (Rs.)', 'Total Amount (Rs.)']
    ],
    body: [
      ['1.', 'Gross Salary as per provisions contained in sec. 17(1)', '', gross.toLocaleString('en-IN')],
      ['', '  (a) Salary as per section 17(1)', gross.toLocaleString('en-IN'), ''],
      ['', '  (b) Value of perquisites u/s 17(2)', '0', ''],
      ['', '  (c) Profits in lieu of salary u/s 17(3)', '0', ''],
      ['2.', 'Less: Allowances to the extent exempt under section 10', '', totalExemptSec10.toLocaleString('en-IN')],
      ['', '  (a) House Rent Allowance u/s 10(13A)', exemptHra.toLocaleString('en-IN'), ''],
      ['', '  (b) Leave Travel Assistance u/s 10(5)', exemptLta.toLocaleString('en-IN'), ''],
      ['3.', 'Balance (1 - 2)', '', balanceAfter10.toLocaleString('en-IN')],
      ['4.', 'Less: Deductions under section 16', '', totalSec16.toLocaleString('en-IN')],
      ['', '  (a) Standard Deduction u/s 16(ia)', standardDeduction.toLocaleString('en-IN'), ''],
      ['', '  (b) Tax on Employment (Professional Tax) u/s 16(iii)', professionalTax.toLocaleString('en-IN'), ''],
      ['5.', 'Income Chargeable under head "Salaries" (3 - 4)', '', incomeSalaries.toLocaleString('en-IN')],
      ['6.', 'Less: Deductions under Chapter VI-A', '', totalChapterVIA.toLocaleString('en-IN')],
      ['', '  (a) Section 80C (EPF, PPF, Life Insurance)', sec80C.toLocaleString('en-IN'), ''],
      ['', '  (b) Section 80D (Medical Insurance Premium)', sec80D.toLocaleString('en-IN'), ''],
      ['', '  (c) Section 80CCD(1B) (National Pension Scheme)', sec80CCD.toLocaleString('en-IN'), ''],
      ['7.', 'Total Taxable Income (Rounded off u/s 288A)', '', totalTaxableIncome.toLocaleString('en-IN')],
      ['8.', 'Tax on Total Income', basicTax.toLocaleString('en-IN'), ''],
      ['9.', 'Health and Education Cess @ 4%', cess.toLocaleString('en-IN'), ''],
      ['10.', 'Total Tax Payable (8 + 9)', '', totalTax.toLocaleString('en-IN')],
      ['11.', 'Less: Tax Deducted at Source (TDS) u/s 192(1)', '', totalTax.toLocaleString('en-IN')],
      ['12.', 'Tax Payable / (Refundable) (10 - 11)', '', '0']
    ],
    margin: { left: 40, right: 40 }
  });

  // Verification Box
  const verifyY = (doc as any).lastAutoTable.finalY + 10;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(40, verifyY, pageWidth - 80, 75, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Verification by Employer', 50, verifyY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  const verifyText = `I, Authorized Signatory, do hereby certify that the salary paid / credited and all other particulars furnished above in Part B are true, correct and complete in accordance with the books of account and salary registers maintained by the company.`;
  doc.text(doc.splitTextToSize(verifyText, pageWidth - 100), 50, verifyY + 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Place: Ahmedabad | Date: 12-Jun-2025', 50, verifyY + 62);

  // Digital Signature Stamp
  doc.setDrawColor(68, 76, 231);
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(pageWidth - 210, verifyY + 38, 160, 30, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 76, 231);
  doc.text('Certified & Verified by:', pageWidth - 202, verifyY + 49);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('CollabCRM Payroll Authority', pageWidth - 202, verifyY + 60);

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated Form-16 Part B Annexure downloaded from CollabCRM Payroll.', pageWidth / 2, 795, { align: 'center' });

  return doc;
};

/**
 * Trigger immediate download of Form-16 Part A PDF
 */
export const downloadForm16PartA = (record: Form16RecordData) => {
  const doc = generateForm16PartADoc(record);
  const fileName = record.partAFileName || `Form16_PartA_${record.pan}_${record.financialYear}.pdf`;
  doc.save(fileName);
};

/**
 * Trigger immediate download of Form-16 Part B PDF
 */
export const downloadForm16PartB = (record: Form16RecordData) => {
  const doc = generateForm16PartBDoc(record);
  const fileName = record.partBFileName || `Form16_PartB_${record.pan}_${record.financialYear}.pdf`;
  doc.save(fileName);
};

/**
 * Trigger download of ZIP archive containing both Part A & Part B PDFs
 */
export const downloadForm16BothZip = async (record: Form16RecordData) => {
  const zip = new JSZip();

  const partADoc = generateForm16PartADoc(record);
  const partBDoc = generateForm16PartBDoc(record);

  const partAFileName = record.partAFileName || `Form16_PartA_${record.pan}_${record.financialYear}.pdf`;
  const partBFileName = record.partBFileName || `Form16_PartB_${record.pan}_${record.financialYear}.pdf`;

  const partABlob = partADoc.output('blob');
  const partBBlob = partBDoc.output('blob');

  zip.file(partAFileName, partABlob);
  zip.file(partBFileName, partBBlob);

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const cleanName = record.empName.replace(/[^a-zA-Z0-9]/g, '_');
  const zipFileName = `Form16_${cleanName}_${record.pan}_FY${record.financialYear}.zip`;

  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
