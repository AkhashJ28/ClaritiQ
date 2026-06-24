import React, { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import { User, Bell, AlertCircle, XCircle, Search, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const QueueManagement = () => {
  const { queueState, loading, callNext } = useQueue();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const handleNoShow = async (tokenNumber: number) => {
    if (!confirm(`Mark Token #${tokenNumber} as No-Show?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/queue/no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': user?.email || '' },
        body: JSON.stringify({ tokenNumber })
      });
      if (!res.ok) {
        alert('Failed to mark no-show');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-sm text-slate-500 font-medium">Loading queue data...</span>
      </div>
    </div>
  );

  const filteredQueue = queueState.queue.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.tokenNumber.toString().includes(searchTerm)
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
      <header className="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Queue Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage waiting patients, handle exceptions, and advance the queue.</p>
        </div>
        <button 
          onClick={callNext} 
          disabled={queueState.queue.length === 0} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Bell size={18} /> Call Next Patient
        </button>
      </header>

      {/* Active Session Highlight */}
      {queueState.currentToken && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex items-center justify-between mb-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-900">Currently Serving</h2>
              <p className="text-sm text-emerald-700 font-medium mt-0.5">Token #{queueState.currentToken} is inside the consultation room.</p>
            </div>
          </div>
          <div className="text-4xl font-black text-emerald-600 tracking-tighter animate-pulse-glow bg-emerald-100 w-20 h-20 flex items-center justify-center rounded-2xl">
            {queueState.currentToken}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden animate-fade-in-up" style={{animationDelay: '200ms'}}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-800 text-lg">Waiting Patients</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{queueState.patientsWaiting}</span>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or token..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-sm" 
            />
          </div>
        </div>
        
        {queueState.queue.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-4 bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">The queue is currently empty.</p>
              <p className="text-sm mt-1">New patients will appear here automatically.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 stagger-children">
            {filteredQueue.map((patient, index) => (
              <div key={patient._id} className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                    patient.priorityLevel === 'CRITICAL' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : 
                    patient.priorityLevel === 'PRIORITY' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' : 
                    'bg-slate-100 border border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-xl font-bold">{patient.tokenNumber}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                      {patient.name}
                      {patient.priorityLevel !== 'NORMAL' && (
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${patient.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                          {patient.priorityLevel}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Est. Wait: {(index + 1) * queueState.averageWaitTime} mins
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => handleNoShow(patient.tokenNumber)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="Mark No-Show">
                    <XCircle size={18} />
                    <span>No-Show</span>
                  </button>
                </div>
              </div>
            ))}
            
            {filteredQueue.length === 0 && searchTerm && (
              <div className="p-12 text-center text-slate-500">
                No patients match your search "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
