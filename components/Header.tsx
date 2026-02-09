
import React, { useState } from 'react';
import { Search, Bell, Menu, Sparkles, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { UserRole } from '../types';

interface HeaderProps {
  toggleSidebar: () => void;
  onAiClick: () => void;
  userRole: UserRole;
  onRoleSwitch: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, onAiClick, userRole, onRoleSwitch }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <h1 className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            CollabCRM <span className="font-medium text-slate-400 text-sm ml-1">
              {userRole === 'SUPER_ADMIN' ? 'Admin Panel' : userRole === 'HR_MANAGER' ? 'HR Manager' : 'Employee'}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4 lg:mx-12 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all sm:text-sm"
            placeholder={userRole === 'SUPER_ADMIN' ? "Search companies, tax codes..." : "Search..."}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {userRole !== 'SUPER_ADMIN' && (
          <button
            onClick={onAiClick}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-semibold hover:from-cyan-100 hover:to-purple-100 transition-all shadow-sm"
          >
            <Sparkles size={14} className="text-yellow-500" />
            <span>CollabAI</span>
          </button>
        )}

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 p-[2px] cursor-pointer"
          >
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img
                src={userRole === 'SUPER_ADMIN' ? "https://picsum.photos/100/100" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-50">
                  <p className="text-sm font-bold text-slate-800">
                    {userRole === 'SUPER_ADMIN' ? 'Super Admin' : userRole === 'HR_MANAGER' ? 'Amit Verma' : 'Priya Sharma'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userRole === 'SUPER_ADMIN' ? 'System Administrator' : userRole === 'HR_MANAGER' ? 'HR Manager' : 'Employee ID: TF00912'}
                  </p>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <UserCircle size={16} /> Profile Settings
                  </button>

                  {/* Role Switcher for Demo */}
                  <div className="border-t border-slate-100 my-1 pt-1">
                    <p className="px-4 py-1 text-[10px] uppercase font-bold text-slate-400">Switch Role (Demo)</p>
                    <button
                      onClick={() => { onRoleSwitch('SUPER_ADMIN'); setIsProfileOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${userRole === 'SUPER_ADMIN' ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-sky-500"></div> Super Admin
                    </button>
                    <button
                      onClick={() => { onRoleSwitch('HR_MANAGER'); setIsProfileOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${userRole === 'HR_MANAGER' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div> HR Manager
                    </button>
                    <button
                      onClick={() => { onRoleSwitch('EMPLOYEE'); setIsProfileOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${userRole === 'EMPLOYEE' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div> Employee
                    </button>
                  </div>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
