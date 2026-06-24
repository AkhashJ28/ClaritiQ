import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { User, Clock, MapPin, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PatientTracking = () => {
  const { tokenId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/patient/${tokenId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    const socket = io('http://localhost:5000');
    socket.on('QUEUE_UPDATED', () => {
      fetchStatus();
    });

    return () => {
      socket.disconnect();
    };
  }, [tokenId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 font-medium">Loading your queue status...</span>
        </div>
      </div>
    );
  }

  if (error || !data || !data.patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Token Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">This token may have expired or does not exist. Please check with the reception desk.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            <RefreshCw className="w-4 h-4 inline mr-1" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const { patient, patientsAhead, estimatedWait, currentToken } = data;

  let progressPercent = 0;
  let statusColor = 'text-amber-500';
  let statusBg = 'bg-amber-50';
  let statusLabel = 'Waiting';

  if (patient.status === 'COMPLETED') {
    progressPercent = 100;
    statusColor = 'text-slate-500';
    statusBg = 'bg-slate-50';
    statusLabel = 'Completed';
  } else if (patient.status === 'SERVING') {
    progressPercent = 90;
    statusColor = 'text-emerald-600';
    statusBg = 'bg-emerald-50';
    statusLabel = 'Your Turn!';
  } else if (patient.status === 'NO_SHOW') {
    progressPercent = 0;
    statusColor = 'text-red-500';
    statusBg = 'bg-red-50';
    statusLabel = 'No Show';
  } else {
    progressPercent = Math.max(10, Math.min(80, 80 - (patientsAhead * 12)));
    statusLabel = 'Waiting';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white p-5 shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-indigo-600">QueueCure</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <MapPin size={14} className="text-slate-400" />
          QueueCure Clinic
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 flex flex-col max-w-md mx-auto w-full">
        {/* Greeting */}
        <div className="text-center mb-6 animate-fade-in-up">
          <p className="text-slate-500 text-sm">Hello, <span className="font-semibold text-slate-800">{patient.name}</span> 👋</p>
        </div>

        {/* Token Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 animate-fade-in-up" style={{animationDelay:'100ms'}}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] text-center mb-3">Your Token</h2>
          <div className="text-7xl font-extrabold text-indigo-600 text-center animate-token-pulse">{patient.tokenNumber}</div>

          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1">Currently Serving</div>
              <div className="text-2xl font-bold text-slate-800 tabular-nums">{currentToken || '--'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium mb-1">Status</div>
              <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${statusBg} ${statusColor}`}>
                {patient.status === 'SERVING' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {patient.status === 'WAITING' && (
          <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in-up" style={{animationDelay:'200ms'}}>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
                <User className="text-amber-500 w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Ahead of You</span>
              <span className="text-3xl font-bold text-slate-800 tabular-nums mt-1">{patientsAhead}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-2">
                <Clock className="text-indigo-500 w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Est. Wait</span>
              <span className="text-3xl font-bold text-slate-800 tabular-nums mt-1">~{estimatedWait}<span className="text-sm font-normal text-slate-400 ml-0.5">m</span></span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 animate-fade-in-up" style={{animationDelay:'300ms'}}>
          <h3 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">Queue Progress</h3>
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2.5 font-bold uppercase tracking-widest">
            <span>Joined</span>
            <span>Serving</span>
            <span>Done</span>
          </div>
        </div>

        {/* Status Alerts */}
        {patient.status === 'WAITING' && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-blue-700 text-center text-sm font-medium mt-auto mb-4 animate-fade-in-up" style={{animationDelay:'400ms'}}>
            <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Updates are live — no need to refresh. Please stay nearby.
          </div>
        )}

        {patient.status === 'SERVING' && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-800 text-center font-semibold mt-auto mb-4 animate-fade-in-up animate-pulse-glow">
            <CheckCircle2 className="w-5 h-5 inline mr-2 -mt-0.5" />
            It's your turn! Please proceed to the consultation room.
          </div>
        )}

        {patient.status === 'COMPLETED' && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-600 text-center text-sm font-medium mt-auto mb-4 animate-fade-in-up">
            <CheckCircle2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Your consultation is complete. Thank you for visiting!
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400">
        Powered by <span className="font-semibold text-indigo-500">QueueCure</span>
      </footer>
    </div>
  );
};
