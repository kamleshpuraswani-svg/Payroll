import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const HRTaxSlipTemplate: React.FC = () => {
    return (
        <div className="w-full min-h-full bg-slate-50 flex justify-center p-4 lg:p-8 pb-48">
            <div className="max-w-[1075px] w-full bg-white shadow-sm border border-slate-200 flex flex-col rounded-xl overflow-hidden mb-16 h-fit shrink-0">
                <div className="p-2 bg-slate-50 border-b border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    TAX SLIP CANVAS
                </div>

                <div className="p-6 md:p-8 space-y-5">
                    {/* Header Block */}
                    <div className="relative border border-slate-100 rounded-xl p-6 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 mb-4 sm:mb-0">
                                <ImageIcon size={24} />
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-lg text-slate-800">Mind Inventory</h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    801-808, City Centre 2, Science City Road, Sola, Ahmedabad, Gujarat- 380060
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-6 border-b border-slate-100 pb-4 mb-4">
                            <h3 className="font-bold text-slate-700 text-base">
                                Tax Slip <span className="font-normal text-slate-400">Nov 2025</span>
                            </h3>
                        </div>

                        {/* Employee Details Table */}
                        <table className="w-full text-sm text-slate-600 border-collapse border border-slate-200">
                            <tbody>
                                <tr>
                                    <td className="py-2 px-3 align-top whitespace-nowrap border border-slate-200 bg-slate-50/50">Employee Name</td>
                                    <td className="py-2 px-3 align-top font-semibold text-slate-800 border border-slate-200">Priya Sharma</td>
                                    <td className="py-2 px-3 align-top whitespace-nowrap border border-slate-200 bg-slate-50/50">Employee ID</td>
                                    <td className="py-2 px-3 align-top font-semibold text-slate-800 border border-slate-200">TF00123</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 align-top whitespace-nowrap border border-slate-200 bg-slate-50/50">Designation</td>
                                    <td className="py-2 px-3 align-top font-semibold text-slate-800 border border-slate-200">Senior Engineer</td>
                                    <td className="py-2 px-3 align-top whitespace-nowrap border border-slate-200 bg-slate-50/50">Date of Joining</td>
                                    <td className="py-2 px-3 align-top font-semibold text-slate-800 border border-slate-200">12 Jan 2023</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 align-top whitespace-nowrap border border-slate-200 bg-slate-50/50">PAN</td>
                                    <td className="py-2 px-3 align-top font-semibold text-slate-800 border border-slate-200">ABCDE1234F</td>
                                    <td className="py-2 px-3 align-top whitespace-nowrap border border-slate-200 bg-slate-50/50">Tax Regime</td>
                                    <td className="py-2 px-3 align-top font-semibold text-slate-800 border border-slate-200">Old Regime</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 align-top whitespace-nowrap border border-slate-200 bg-slate-50/50">Gender</td>
                                    <td colSpan={3} className="py-2 px-3 align-top font-semibold text-slate-800 border border-slate-200">Female</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Income Under Salary Heads Table */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr>
                                <th colSpan={5} className="border border-slate-200 px-4 py-2.5 text-left text-xs font-bold uppercase bg-slate-900 text-white">
                                    A. INCOME UNDER SALARY HEADS
                                </th>
                            </tr>
                            <tr>
                                <th className="border border-slate-200 px-4 py-2 text-left text-xs font-bold uppercase text-slate-600 bg-slate-100">Components</th>
                                <th className="border border-slate-200 px-4 py-2 text-right text-xs font-bold uppercase text-slate-600 bg-slate-100">Earnings YTD</th>
                                <th className="border border-slate-200 px-4 py-2 text-right text-xs font-bold uppercase text-slate-600 bg-slate-100">Projected Annual Earnings</th>
                                <th className="border border-slate-200 px-4 py-2 text-right text-xs font-bold uppercase text-slate-600 bg-slate-100">Exempted Income</th>
                                <th className="border border-slate-200 px-4 py-2 text-right text-xs font-bold uppercase text-slate-600 bg-slate-100">Taxable Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 font-medium">Basic Salary</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">4,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">6,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">0.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">6,00,000.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 font-medium">House Rent Allowance</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">2,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">3,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">1,20,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">1,80,000.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 font-medium">Special Allowance</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">2,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">3,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-700">0.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">3,00,000.00</td>
                            </tr>
                            <tr className="font-bold bg-slate-50">
                                <td className="border border-slate-200 px-4 py-2 text-slate-900">Total</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-900">8,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-900">12,00,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-900">1,20,000.00</td>
                                <td className="border border-slate-200 px-4 py-2 text-right text-slate-900 font-bold">10,80,000.00</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* B. PREVIOUS EMPLOYER INCOME */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    B. PREVIOUS EMPLOYER INCOME
                                </th>
                                <th className="border border-slate-700 px-4 py-2.5 text-right text-xs font-bold w-48">
                                    1,20,000.00
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">
                                    Gross salary received from previous employer (Form 12B)
                                </td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                                    1,20,000.00
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* C. OTHER INCOME/ LOSS */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    C. OTHER INCOME/ LOSS
                                </th>
                                <th className="border border-slate-700 px-4 py-2.5 text-right text-xs font-bold w-48">
                                    25,000.00
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">
                                    Interest Income from Savings Accounts & Fixed Deposits
                                </td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                                    25,000.00
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* D. GROSS TOTAL INCOME (A+B+C) */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    D. GROSS TOTAL INCOME (A+B+C)
                                </th>
                                <th className="border border-slate-700 px-4 py-2.5 text-right text-xs font-bold w-48">
                                    12,25,000.00
                                </th>
                            </tr>
                        </thead>
                    </table>

                    {/* E. STANDARD DEDUCTION */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    E. STANDARD DEDUCTION
                                </th>
                                <th className="border border-slate-700 px-4 py-2.5 text-right text-xs font-bold w-48">
                                    50,000.00
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">
                                    Standard deduction under section 16(ia)
                                </td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                                    50,000.00
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* F. DEDUCTION UNDER SECTION 80 C */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    F. DEDUCTION UNDER SECTION 80 C
                                </th>
                                <th className="border border-slate-700 px-4 py-2.5 text-right text-xs font-bold w-48">
                                    1,50,000.00
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">
                                    Section 80C: Life Insurance, EPF, PPF, ELSS, Children Tuition Fees
                                </td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                                    1,50,000.00
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* G. DEDUCTION UNDER CHAPTER SECTION VIA */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    G. DEDUCTION UNDER CHAPTER SECTION VIA
                                </th>
                                <th className="border border-slate-700 px-4 py-2.5 text-right text-xs font-bold w-48">
                                    50,000.00
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">
                                    Section 80CCD(2): Employer's contribution to NPS account, deducted from salary
                                </td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">
                                    50,000.00
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* NET TAX */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th colSpan={2} className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    NET TAX
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Net Taxable Income (D-E-F-G)</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900 w-48">9,75,000.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">PFPERQ_Taxable_Amount</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">0.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">PFPERQ_Interest_Amount</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">0.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Tax on Total Income</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">1,07,500.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Professional Tax</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">0.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Sur Charge</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">0.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Marginal Relief</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">0.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Ecess</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">4,300.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Tax</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">1,11,800.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Rebate under Section 87 A</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">0.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">TDS deducted (Previous Employment)</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">10,000.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Additional Tax</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">0.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50 font-bold">Net Tax</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-bold text-slate-900">1,01,800.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">TDS till Month</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">67,867.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50">Tax deducted from previous employer</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-semibold text-slate-900">10,000.00</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-200 px-4 py-2 text-slate-700 bg-slate-50/50 font-bold">TDS to be deducted</td>
                                <td className="border border-slate-200 px-4 py-2 text-right font-bold text-slate-900">33,933.00</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* MONTH WISE TDS */}
                    <table className="w-full border-collapse text-sm rounded-xl overflow-hidden border border-slate-200">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th colSpan={12} className="border border-slate-700 px-4 py-2.5 text-left text-xs font-bold uppercase">
                                    MONTH WISE TDS
                                </th>
                            </tr>
                            <tr className="bg-slate-100 text-slate-700 font-bold text-xs text-center">
                                <th className="border border-slate-200 px-2 py-2">Apr</th>
                                <th className="border border-slate-200 px-2 py-2">May</th>
                                <th className="border border-slate-200 px-2 py-2">Jun</th>
                                <th className="border border-slate-200 px-2 py-2">Jul</th>
                                <th className="border border-slate-200 px-2 py-2">Aug</th>
                                <th className="border border-slate-200 px-2 py-2">Sep</th>
                                <th className="border border-slate-200 px-2 py-2">Oct</th>
                                <th className="border border-slate-200 px-2 py-2">Nov</th>
                                <th className="border border-slate-200 px-2 py-2">Dec</th>
                                <th className="border border-slate-200 px-2 py-2">Jan</th>
                                <th className="border border-slate-200 px-2 py-2">Feb</th>
                                <th className="border border-slate-200 px-2 py-2">Mar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center text-xs text-slate-700 font-medium">
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,486.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,483.00</td>
                                <td className="border border-slate-200 px-2 py-2.5">8,484.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HRTaxSlipTemplate;
