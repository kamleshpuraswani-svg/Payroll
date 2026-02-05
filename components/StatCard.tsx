import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye } from 'lucide-react';
import { StatMetric } from '../types';

interface StatCardProps {
  stat: StatMetric;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={stat.onClick}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 group relative overflow-visible ${stat.onClick ? 'cursor-pointer hover:shadow-md hover:border-purple-200' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${stat.colorClass} bg-opacity-10`}>
          {React.isValidElement(stat.icon) && React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
        </div>

        <div className="flex items-center gap-1">
          {/* Info/View Details Action */}
          {stat.onInfoClick && (
            <button
              onClick={(e) => { e.stopPropagation(); stat.onInfoClick?.(); }}
              className="text-slate-400 hover:text-sky-600 p-1.5 rounded-md hover:bg-slate-50 transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          )}

          {/* Dropdown Menu Container */}
          {stat.actions && stat.actions.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuClick}
                className="text-slate-300 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                  {stat.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleActionClick(e, action.onClick)}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
          <span className={`flex items-center text-xs font-semibold ${stat.trendUp ? 'text-emerald-600' : stat.trend === 'Due within 3 days' ? 'text-rose-600' : 'text-slate-500'}`}>
            {stat.trendUp && <ArrowUpRight size={14} />}
            {!stat.trendUp && stat.trend.includes('%') && <ArrowDownRight size={14} />}
            {stat.trend}
          </span>
        </div>
      </div>

      {stat.extraDetails && stat.extraDetails.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
          {stat.extraDetails.map((detail, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">{detail.label}</span>
              <span className={`font-bold ${detail.color ? detail.color : 'text-slate-700'}`}>{detail.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Decorative accent line at bottom */}
      <div className={`h-1 w-0 group-hover:w-full transition-all duration-500 mt-4 rounded-full ${stat.colorClass.replace('text', 'bg').replace('bg-opacity-10', '')}`}></div>
    </div>
  );
};

export default StatCard;