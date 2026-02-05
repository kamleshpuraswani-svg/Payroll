
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Plus,
  Sigma,
  ChevronDown,
  X,
  CheckCircle,
  Briefcase,
  Users,
  Clock,
  UserCheck,
  Upload,
  Calendar,
  Info,
  Trash2
} from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';

const AddEmployeeForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-20 absolute inset-0 z-50 overflow-y-auto">
      {/* Sticky Header */}
      <div className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Add Employee</h2>
        <div className="flex gap-3">
            <button onClick={onCancel} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors text-slate-600">Cancel</button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">Submit</button>
        </div>
      </div>
      
      <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        
        {/* Personal Information */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
                <p className="text-xs text-slate-500 mt-1">Employee basic profile details.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors group">
                            <UserPlus size={32} className="mb-2 opacity-50 group-hover:opacity-100" />
                            <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 absolute bottom-0 right-0">
                                <Upload size={14} className="text-slate-600" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-6">
                        <div>
                             <h4 className="text-sm font-bold text-slate-800 mb-1">Profile Picture</h4>
                             <p className="text-xs text-slate-500">Upload Png, Jpg/Jpeg or Webp (max. 1 MB)</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">First Name <span className="text-rose-500">*</span></label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Middle Name</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Last Name <span className="text-rose-500">*</span></label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Gender <span className="text-rose-500">*</span></label>
                                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                                    <option>Select</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Date of Birth <span className="text-rose-500">*</span></label>
                                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Blood Group</label>
                                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                                    <option>Select</option>
                                    <option>A+</option>
                                    <option>O+</option>
                                    <option>B+</option>
                                    <option>AB+</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-500">About</label>
                                <span className="text-xs text-slate-400">0/255</span>
                            </div>
                            <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-20 resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Employee Information */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Employee Information</h3>
                <p className="text-xs text-slate-500 mt-1">Workplace identity of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Status <span className="text-rose-500">*</span></label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>Select</option>
                            <option>Active</option>
                            <option>Probation</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Business Unit <span className="text-rose-500">*</span></label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>CollabCRM Demo Account</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Employee Code <span className="text-rose-500">*</span></label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">CO-</span>
                            <input type="text" defaultValue="052" className="w-full px-3 py-2 border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Department <span className="text-rose-500">*</span></label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>Select</option>
                            <option>Engineering</option>
                            <option>Sales</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Designation <span className="text-rose-500">*</span></label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>Select</option>
                            <option>Senior Engineer</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Reporting to <span className="text-rose-500">*</span></label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>Select</option>
                            <option>Manager Name</option>
                        </select>
                     </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">Biometric ID <span className="text-rose-500">*</span> <Info size={12}/></label>
                        <input type="text" defaultValue="CO-052" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                     <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">Employee Type <span className="text-rose-500">*</span> <Info size={12}/></label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="empType" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700">Technical</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="empType" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700">Non-Technical</span>
                            </label>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Employee Role Information */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Employee Role Information</h3>
                <p className="text-xs text-slate-500 mt-1">Roles assigned to the employee based on which the permissions would be granted.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Employee Role <span className="text-rose-500">*</span></label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>Select</option>
                            <option>Admin</option>
                            <option>Employee</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">Expiry Date <Info size={12}/></label>
                        <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-600" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Remark</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                </div>
                <div className="pt-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                        <Plus size={16} /> Add
                    </button>
                </div>
            </div>
        </div>

        {/* Company Contact Information */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Company Contact Information</h3>
                <p className="text-xs text-slate-500 mt-1">Company contact information details of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Company Email Address <span className="text-rose-500">*</span></label>
                        <div className="flex">
                            <input type="text" className="w-full px-3 py-2 border border-r-0 border-slate-200 rounded-l-lg text-sm focus:outline-none focus:border-indigo-500" />
                            <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-r-lg text-sm text-slate-500">@collabcrm.com</span>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Company Mobile Number</label>
                        <div className="flex">
                             <div className="px-3 py-2 bg-white border border-r-0 border-slate-200 rounded-l-lg flex items-center gap-1">
                                <span className="text-sm">🇮🇳</span>
                                <ChevronDown size={12} className="text-slate-400" />
                             </div>
                             <input type="text" defaultValue="+91" className="w-16 px-2 py-2 border border-x-0 border-slate-200 text-sm bg-white" />
                             <input type="text" className="w-full px-3 py-2 border border-l-0 border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Seating Location</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Extension Number</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                </div>
            </div>
        </div>

        {/* Personal Contact Information */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Personal Contact Information</h3>
                <p className="text-xs text-slate-500 mt-1">Personal contact information details of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Personal Email Address</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                     <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Personal Mobile Number <span className="text-rose-500">*</span></label>
                        <div className="flex">
                             <div className="px-3 py-2 bg-white border border-r-0 border-slate-200 rounded-l-lg flex items-center gap-1">
                                <span className="text-sm">🇮🇳</span>
                                <ChevronDown size={12} className="text-slate-400" />
                             </div>
                             <input type="text" defaultValue="+91" className="w-full px-3 py-2 border border-l-0 border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                     <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Alternate Mobile Number</label>
                        <div className="flex">
                             <div className="px-3 py-2 bg-white border border-r-0 border-slate-200 rounded-l-lg flex items-center gap-1">
                                <span className="text-sm">🇮🇳</span>
                                <ChevronDown size={12} className="text-slate-400" />
                             </div>
                             <input type="text" defaultValue="+91" className="w-full px-3 py-2 border border-l-0 border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Experience */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Experience</h3>
                <p className="text-xs text-slate-500 mt-1">Total work experience of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Joining Date <span className="text-rose-500">*</span></label>
                        <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-600" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">Confirmation Date <span className="text-rose-500">*</span> <Info size={12}/></label>
                        <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-600" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Experience @ CollabCRM Demo Account</label>
                        <input type="text" disabled className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm cursor-not-allowed" />
                     </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1.5">Previous Experience <span className="text-rose-500">*</span></label>
                         <div className="flex gap-2">
                             <div className="flex-1 flex border border-slate-200 rounded-lg overflow-hidden">
                                 <input type="number" className="w-full px-3 py-2 text-sm focus:outline-none" />
                                 <div className="bg-slate-100 px-3 py-2 text-sm text-slate-500 border-l border-slate-200">Y</div>
                             </div>
                             <div className="flex-1 flex border border-slate-200 rounded-lg overflow-hidden">
                                 <input type="number" className="w-full px-3 py-2 text-sm focus:outline-none" />
                                 <div className="bg-slate-100 px-3 py-2 text-sm text-slate-500 border-l border-slate-200">M</div>
                             </div>
                         </div>
                     </div>
                     <div className="mb-2.5">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                             <span className="text-sm text-slate-700">Fresher</span>
                         </label>
                     </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Previous Organizations</h4>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                        <Plus size={16} /> Add
                    </button>
                </div>
            </div>
        </div>

        {/* Family Details */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Family Details</h3>
                <p className="text-xs text-slate-500 mt-1">Immediate family members of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Father's Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Mother's Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                </div>
                
                <div>
                     <label className="block text-xs font-bold text-slate-500 mb-2">Marital Status <span className="text-rose-500">*</span></label>
                     <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="marital" defaultChecked className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-700">Single</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="marital" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-700">Married</span>
                        </label>
                     </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Children</h4>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                        <Plus size={16} /> Add
                    </button>
                </div>
            </div>
        </div>

        {/* Address */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Address</h3>
                <p className="text-xs text-slate-500 mt-1">Residential address of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4">Present Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                             <label className="block text-xs font-bold text-slate-500 mb-1.5">Address <span className="text-rose-500">*</span></label>
                             <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="sm:col-span-2">
                             <label className="block text-xs font-bold text-slate-500 mb-1.5">Country <span className="text-rose-500">*</span></label>
                             <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                                <option>Select</option>
                                <option>India</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1.5">State <span className="text-rose-500">*</span></label>
                             <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                                <option>Select</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1.5">Town/City <span className="text-rose-500">*</span></label>
                             <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1.5">Zip/Postal Code <span className="text-rose-500">*</span></label>
                             <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Permanent Address</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-slate-700">Same as present address</span>
                    </label>
                </div>
            </div>
        </div>

        {/* Documents */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Documents</h3>
                <p className="text-xs text-slate-500 mt-1">Important documents of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                    <Plus size={16} /> Add
                </button>
            </div>
        </div>

        {/* Health Insurance */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Health Insurance</h3>
                <p className="text-xs text-slate-500 mt-1">Health insurance details of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5" />
                    <span className="text-sm font-medium text-slate-700">Employee is insured</span>
                </label>
            </div>
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Emergency Contact</h3>
                <p className="text-xs text-slate-500 mt-1">Emergency contact information of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Name <span className="text-rose-500">*</span></label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Contact Number <span className="text-rose-500">*</span></label>
                        <div className="flex">
                             <div className="px-3 py-2 bg-white border border-r-0 border-slate-200 rounded-l-lg flex items-center gap-1">
                                <span className="text-sm">🇮🇳</span>
                                <ChevronDown size={12} className="text-slate-400" />
                             </div>
                             <input type="text" defaultValue="+91" className="w-full px-3 py-2 border border-l-0 border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Relation <span className="text-rose-500">*</span></label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>Select</option>
                            <option>Parent</option>
                            <option>Spouse</option>
                            <option>Sibling</option>
                        </select>
                     </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                        <Plus size={16} /> Add
                    </button>
                </div>
            </div>
        </div>

        {/* Social Media Links */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Social Media Links</h3>
                <p className="text-xs text-slate-500 mt-1">Online presence of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                    <Plus size={16} /> Add
                </button>
            </div>
        </div>

        {/* Timesheet Filling */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Timesheet Filling</h3>
                <p className="text-xs text-slate-500 mt-1">Daily timesheet filling requirement of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                 <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <div>
                     <span className="text-sm font-bold text-slate-800 block">Timesheet filling required</span>
                     <span className="text-sm text-slate-600">When turned on, the employee is required to fill daily timesheet.</span>
                </div>
            </div>
        </div>

        {/* Source of Hire */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Source of Hire</h3>
                <p className="text-xs text-slate-500 mt-1">Source of hiring of the employee.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Source</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white">
                            <option>Select</option>
                            <option>LinkedIn</option>
                            <option>Referral</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Remark</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                     </div>
                </div>
            </div>
        </div>

        {/* Employer Remarks */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Employer Remarks</h3>
                <p className="text-xs text-slate-500 mt-1">Put employer remarks if any. This is not visible to others.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Remark</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
        </div>

        {/* Account Status */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Account Status</h3>
                <p className="text-xs text-slate-500 mt-1">If disabled, the employee will not be able to login to the portal.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-sm font-bold text-slate-800">Account Status</span>
            </div>
        </div>

        {/* Invite Employee */}
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
                <h3 className="text-sm font-bold text-slate-800">Invite Employee</h3>
                <p className="text-xs text-slate-500 mt-1">If turned on, employee will receive a welcome email with the instructions to create their password for the portal.</p>
            </div>
            <div className="col-span-12 md:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-sm font-bold text-slate-800">Invite Employee</span>
            </div>
        </div>

      </div>
    </div>
  )
}

const PeopleEmployeeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees] = useState(MOCK_EMPLOYEES);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');

  // Filter state for visual demonstration of "Status Is not Relieved"
  const [activeFilters, setActiveFilters] = useState([
    { id: 'f1', field: 'Status', operator: 'Is not', value: 'Relieved' }
  ]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const summaryCards = [
    { title: 'Active Employees', count: 88, icon: <Users size={18} className="text-emerald-600"/>, actionIcon: <Plus size={18} />, actionClass: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
    { title: 'On Probation', count: 12, icon: <UserCheck size={18} className="text-amber-600"/>, actionIcon: <Eye size={18} />, actionClass: 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50' },
    { title: 'On Notice Period', count: 5, icon: <Clock size={18} className="text-rose-600"/>, actionIcon: <Eye size={18} />, actionClass: 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50' },
    { title: 'Joining Soon', count: 45, icon: <UserPlus size={18} className="text-sky-600"/>, actionIcon: <Eye size={18} />, actionClass: 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50' },
  ];

  const removeFilter = (id: string) => {
      setActiveFilters(prev => prev.filter(f => f.id !== id));
  };

  if (view === 'ADD') {
      return <AddEmployeeForm onCancel={() => setView('LIST')} />;
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
             <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                People
                <span className="px-2 py-0.5 rounded bg-amber-400 text-white text-[10px] font-bold uppercase tracking-wider">Beta</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-3 items-center">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search people by name, email, code..." 
                    className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
            </div>
            
            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm hover:bg-indigo-100">
                New <ChevronDown size={16} />
            </button>

            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <CheckCircle size={20} />
            </button>
             <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors relative">
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                <Clock size={20} />
            </button>
        </div>
      </div>
      
      {/* Breadcrumb style nav */}
      <div className="flex items-center gap-2 text-sm text-slate-500 -mt-2">
         <span className="hover:text-indigo-600 cursor-pointer"><Briefcase size={16} /></span>
         <ChevronDown size={14} className="-rotate-90" />
         <span className="font-medium text-indigo-600">Employees</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
            <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start z-10">
                    <span className="text-sm font-medium text-slate-500">{card.title}</span>
                </div>
                <div className="flex justify-between items-end z-10">
                    <span className="text-4xl font-bold text-slate-800">{card.count}</span>
                    <button className={`p-2 rounded-lg transition-colors ${card.actionClass}`}>
                        {card.actionIcon}
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
         
         <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-slate-800">Employees</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    1 - 10 of 88 Employees
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setView('ADD')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                    Add Employee
                </button>
                <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Upload size={18} />
                </button>
                 <button className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                    <MoreVertical size={18} className="rotate-45" /> {/* Using rotate to simulate expand icon or similar */}
                </button>
                 <button className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                    <MoreVertical size={18} />
                </button>
            </div>
         </div>
         
         {/* Filter Bar */}
         <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-2 items-center">
             <div className="relative">
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm"
                >
                    <Sigma size={18} />
                    <ChevronDown size={14} className="text-slate-400" />
                </button>
                 {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Name</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Department</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Location</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Status</button>
                    </div>
                )}
             </div>

             {/* Active Filter Chips */}
             {activeFilters.map(filter => (
                 <div key={filter.id} className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden group">
                     <div className="px-2 py-1.5 bg-slate-50 border-r border-slate-200 flex items-center justify-center text-slate-500">
                         <CheckCircle size={14} />
                     </div>
                     <div className="px-3 py-1.5 text-sm font-medium text-slate-700 flex items-center gap-2">
                         <span className="font-bold">{filter.field}</span>
                         <span className="text-slate-400 text-xs uppercase font-bold">{filter.operator}</span>
                         <span className="bg-slate-100 px-1.5 rounded text-slate-800">{filter.value}</span>
                     </div>
                     <button 
                        onClick={() => removeFilter(filter.id)}
                        className="px-2 py-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border-l border-slate-200 transition-colors"
                    >
                         <X size={14} />
                     </button>
                 </div>
             ))}

             <button className="p-2 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors">
                 <Plus size={16} />
             </button>

             <div className="flex-1"></div>

             <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">
                 Filter
             </button>
         </div>

         {/* List View */}
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                    <th className="px-6 py-4 w-16 text-center">No.</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                        <div className="flex items-center gap-1">Code <ChevronDown size={12} className="opacity-0 group-hover:opacity-100"/></div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                        <div className="flex items-center gap-1">Name <ChevronDown size={12} className="opacity-0 group-hover:opacity-100"/></div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                        <div className="flex items-center gap-1">Department <ChevronDown size={12} className="opacity-0 group-hover:opacity-100"/></div>
                    </th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                        <div className="flex items-center gap-1">Status <ChevronDown size={12} className="opacity-0 group-hover:opacity-100"/></div>
                    </th>
                    <th className="px-6 py-4">Reporting to</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-center text-slate-400">{index + 1}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{emp.eid}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={emp.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover" />
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{emp.name}</div>
                                    <div className="text-[10px] text-slate-400">Senior Engineer</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                                {emp.department}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5 text-xs">
                                <span className="text-slate-600">{emp.name.toLowerCase().replace(' ', '')}01@collabcrm.com</span>
                                <span className="text-slate-400">+91 98765 43210</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {emp.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">JD</div>
                                <span className="text-xs text-slate-600">John Doe</span>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Eye size={16} /></button>
                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><MoreVertical size={16} /></button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
         </div>
         
         {/* Simple Pagination */}
         <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end">
             <div className="flex gap-2">
                 <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-xs font-medium text-slate-600">Prev</button>
                 <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium">1</button>
                 <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-xs font-medium text-slate-600">2</button>
                 <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-xs font-medium text-slate-600">3</button>
                 <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-xs font-medium text-slate-600">Next</button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default PeopleEmployeeList;
