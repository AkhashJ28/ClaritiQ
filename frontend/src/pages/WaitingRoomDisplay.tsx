import React, { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';

export const WaitingRoomDisplay = () => {
  const { queueState } = useQueue();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upNext = queueState.queue.slice(0, 5);

  const hasCritical = queueState.queue.some(p => p.priorityLevel === 'CRITICAL');

  return (
    <div className="bg-brand-bg text-brand-text h-screen overflow-hidden flex flex-col selection:bg-brand-primary selection:text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 bg-brand-surface/50 border-b border-white/10 glass-dark">
        <div className="flex items-center gap-4 animate-fade-in-up">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-wide">QueueCure Clinic</h1>
        </div>
        <div className="text-2xl font-medium tracking-wide flex items-center gap-6 animate-fade-in-up" style={{animationDelay:'150ms'}}>
          <span>{time.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="w-px h-6 bg-white/20"></span>
          <span className="tabular-nums">{time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex p-8 gap-8 min-h-0">
        {/* Left Column: Now Serving */}
        <section className="flex-1 flex flex-col justify-center items-center bg-brand-surface rounded-3xl relative overflow-hidden shadow-2xl border border-white/5 animate-fade-in-up" style={{animationDelay:'100ms'}}>
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/20 via-brand-primary/5 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="z-10 flex flex-col items-center">
            <h2 className="text-4xl font-semibold text-brand-text-muted mb-8 tracking-[0.3em] uppercase">Now Serving</h2>
            <div className="text-[14rem] font-extrabold leading-none mb-12 text-white animate-token-pulse" style={{textShadow: '0 0 80px rgba(59,130,246,0.4), 0 0 160px rgba(59,130,246,0.1)'}}>
              {queueState.currentToken || '--'}
            </div>
            <div className="flex items-center gap-6 bg-brand-bg/60 px-8 py-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <svg className="h-10 w-10 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <div>
                <div className="text-lg text-brand-text-muted uppercase tracking-wider mb-0.5">Average Wait Time</div>
                <div className="text-4xl font-bold text-amber-400 tabular-nums">{queueState.averageWaitTime} <span className="text-xl text-brand-text-muted font-normal">min</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Up Next */}
        <section className="w-[30%] bg-brand-surface rounded-3xl flex flex-col shadow-2xl border border-white/5 animate-fade-in-up" style={{animationDelay:'250ms'}}>
          <div className="p-8 border-b border-white/10 text-center">
            <h2 className="text-2xl font-semibold text-brand-text-muted tracking-[0.3em] uppercase">Up Next</h2>
          </div>
          <div className="flex-1 flex flex-col">
            {upNext.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-3xl font-medium text-brand-text-muted/40">No one waiting</div>
            ) : (
              upNext.map((patient, index) => {
                const sizes = [
                  'text-8xl font-extrabold text-white',
                  'text-6xl font-bold text-brand-text-muted/90',
                  'text-5xl font-semibold text-brand-text-muted/70',
                  'text-4xl font-medium text-brand-text-muted/50',
                  'text-3xl text-brand-text-muted/35'
                ];

                return (
                  <div key={patient._id} className={`flex-1 flex items-center justify-center border-b border-white/5 last:border-0 relative ${sizes[index] || sizes[4]}`}>
                    {patient.tokenNumber}
                    {patient.priorityLevel === 'CRITICAL' && (
                      <span className="absolute top-3 right-4 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-wider">Critical</span>
                    )}
                    {patient.priorityLevel === 'PRIORITY' && (
                      <span className="absolute top-3 right-4 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">Priority</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Priority Alert Banner */}
      {hasCritical && (
        <div className="px-8 pb-6 animate-fade-in-up">
          <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 rounded-2xl p-5 flex items-center gap-6 border border-red-500/30 shadow-lg shadow-red-500/10">
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">Priority Case in Queue</h3>
              <p className="text-lg text-red-100/80">A critical patient is waiting. Expected delays may occur.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-10 py-5 bg-brand-surface/50 border-t border-white/10 flex justify-between items-center text-brand-text-muted text-base glass-dark">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          Thank you for your patience.
        </div>
        <div>We are here to care for you.</div>
      </footer>
    </div>
  );
};
