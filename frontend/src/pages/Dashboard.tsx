import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../hooks/useQueue';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, AlertCircle, Undo2, TrendingUp, Clock, Users, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { queueState, loading, callNext, undoLastCall } = useQueue();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 font-medium">Loading queue data...</span>
        </div>
      </div>
    );
  }

  const nextPatientInQueue = queueState.queue[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {greeting}, {user?.name.split(' ')[0]}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening in the clinic today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Live</span>
          </div>
          <button className="relative p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors group">
            <Bell className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Metrics Cards */}
      <section className="grid grid-cols-4 gap-5 mb-8 stagger-children">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-indigo-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Current Token</span>
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <span className="text-4xl font-bold text-indigo-600 animate-token-pulse">{queueState.currentToken || '--'}</span>
          <span className="text-xs font-medium text-emerald-500 mt-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            {queueState.currentToken ? 'Now Consulting' : 'No Active Session'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-emerald-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Patients Waiting</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <span className="text-4xl font-bold text-emerald-600">{queueState.patientsWaiting}</span>
          <span className="text-xs font-medium text-slate-400 mt-2">In Queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-amber-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Avg. Wait Time</span>
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-800">{queueState.averageWaitTime}</span>
            <span className="text-sm font-medium text-slate-400">min</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-2">Live Estimate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-purple-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Total in Queue</span>
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <span className="text-4xl font-bold text-slate-800">
            {queueState.patientsWaiting + (queueState.currentToken ? 1 : 0)}
          </span>
          <span className="text-xs font-medium text-slate-400 mt-2">Including Serving</span>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-4">
        {/* Left Column: Current Queue */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[500px] animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white z-10">
            <h2 className="text-lg font-bold text-slate-800">Current Queue</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{queueState.patientsWaiting} waiting</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
            {queueState.queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Users className="w-12 h-12 text-slate-200" />
                <span className="text-sm">No patients in queue</span>
              </div>
            ) : (
              <div className="stagger-children">
                {queueState.queue.map((patient, index) => (
                  <div key={patient._id} className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-all duration-200 group rounded-xl px-3 -mx-1">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                        patient.priorityLevel === 'CRITICAL' ? 'bg-red-500 text-white' :
                        patient.priorityLevel === 'PRIORITY' ? 'bg-amber-500 text-white' :
                        'bg-slate-100 text-slate-700 group-hover:bg-indigo-500 group-hover:text-white'
                      } transition-all duration-200`}>
                        {patient.tokenNumber}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{patient.name}</span>
                        {patient.priorityLevel !== 'NORMAL' && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            patient.priorityLevel === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                          }`}>
                            {patient.priorityLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full group-hover:bg-slate-100 transition-colors">
                        ~{(index + 1) * queueState.averageWaitTime} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-1 flex flex-col h-[500px] animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Quick Actions</h2>
          <div className="flex flex-col gap-3 flex-1">

            <button
              onClick={callNext}
              disabled={!nextPatientInQueue}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97] shadow-lg shadow-emerald-500/20 flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[15px]">Call Next</div>
                <div className="text-sm text-white/80">
                  {nextPatientInQueue ? `Token #${nextPatientInQueue.tokenNumber} — ${nextPatientInQueue.name}` : 'Queue empty'}
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/add-patient')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 hover:from-amber-500 hover:to-amber-600 transition-all active:scale-[0.97] shadow-lg shadow-amber-400/20 flex-1 group"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-900/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-900/15 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[15px]">Add Patient</div>
                <div className="text-sm opacity-80">Generate New Token</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/add-patient?priority=true')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-400 to-rose-500 text-white hover:from-red-500 hover:to-rose-600 transition-all active:scale-[0.97] shadow-lg shadow-red-400/20 flex-1 group"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[15px]">Priority / Emergency</div>
                <div className="text-sm text-white/80">Skip Queue for Critical Cases</div>
              </div>
            </button>

            <button
              onClick={undoLastCall}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-400 to-purple-500 text-white hover:from-violet-500 hover:to-purple-600 transition-all active:scale-[0.97] shadow-lg shadow-violet-400/20 flex-1 group"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <Undo2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[15px]">Undo Last Call</div>
                <div className="text-sm text-white/80">Revert Last Called Token</div>
              </div>
            </button>

          </div>
        </div>
      </section>
    </div>
  );
};
