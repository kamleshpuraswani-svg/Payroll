import React from 'react';

export const formatAuditDateTime = (dateStr?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${day}-${month}-${year}, ${hoursStr}:${minutes} ${ampm}`;
};

export const formatAuditUser = (userName: string | undefined, timestampStr: string | undefined): React.ReactNode => {
    if (!userName) return '-';
    if (userName.includes('\n') || userName.includes('At ')) {
        const cleanName = userName.replace(/^By\s+/, '').replace(/\n.*/s, '');
        const timePart = userName.substring(userName.indexOf('\n') + 1);
        return (
            <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-700">{cleanName}</span>
                <span className="text-slate-400 text-[10px]">{timePart.replace(/^At\s+/, '')}</span>
            </div>
        );
    }
    if (!timestampStr) {
        return <div className="font-semibold text-slate-700">{userName}</div>;
    }
    const formattedDate = formatAuditDateTime(timestampStr);
    const displayTime = formattedDate || timestampStr;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-700">{userName}</span>
            {displayTime && <span className="text-slate-400 text-[10px]">{displayTime}</span>}
        </div>
    );
};
