import React, { useEffect, useState } from 'react';
import { Search, FileText } from 'lucide-react';

interface ConsultationLog {
  _id: string;
  tokenNumber: number;
  patientId: any;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export const ConsultationLogs = () => {
  const [logs, setLogs] = useState<ConsultationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/consultations');
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
    log.tokenNumber.toString().includes(searchTerm) || 
    (log.patientId?.name && log.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
      <header className="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Consultation Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review past patient consultations and durations.</p>
        </div>
      </header>

      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden animate-fade-in-up" style={{animationDelay: '100ms'}}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="relative w-72">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by token or patient name..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-sm" 
             />
          </div>
        </div>
        
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="text-sm text-slate-500 font-medium">Loading consultations...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Token</th>
                  <th className="px-6 py-4 font-semibold">Patient Name</th>
                  <th className="px-6 py-4 font-semibold">Start Time</th>
                  <th className="px-6 py-4 font-semibold">End Time</th>
                  <th className="px-6 py-4 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 stagger-children">
                {filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-200">
                        {log.tokenNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {log.patientId?.name || <span className="text-slate-400 font-normal italic">Unknown</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(log.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(log.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {log.durationMinutes} mins
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500 bg-white">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-10 h-10 text-slate-300" />
                        <span className="font-medium">No consultations found</span>
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
