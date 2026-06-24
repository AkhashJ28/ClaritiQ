import React, { useEffect, useState } from 'react';
import { Search, ClipboardList } from 'lucide-react';

interface AuditLog {
  _id: string;
  action: string;
  tokenNumber?: number;
  actor: string;
  details: string;
  createdAt: string;
}

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
      <header className="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track all system activities and queue changes.</p>
        </div>
      </header>

      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden animate-fade-in-up" style={{animationDelay: '100ms'}}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="relative w-72">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by action, details, or actor..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-sm" 
             />
          </div>
        </div>
        
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="text-sm text-slate-500 font-medium">Loading logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Token</th>
                  <th className="px-6 py-4 font-semibold">Actor</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 stagger-children">
                {filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs font-medium">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {log.tokenNumber ? `#${log.tokenNumber}` : <span className="text-slate-400 font-normal">--</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {log.actor.charAt(0).toUpperCase()}
                      </div>
                      {log.actor.split('@')[0]}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{log.details}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500 bg-white">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList className="w-10 h-10 text-slate-300" />
                        <span className="font-medium">No logs found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
