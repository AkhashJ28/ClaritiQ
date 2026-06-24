import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Copy, Download, Printer, ShieldAlert } from 'lucide-react';

export const AddPatient = () => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('NORMAL');
  const [generatedToken, setGeneratedToken] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pre-fill query param for priority if navigated from dashboard quick action
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('priority') === 'true') {
      setPriorityLevel('CRITICAL');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/queue/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'admin@queuecure.com'
        },
        body: JSON.stringify({ name, mobileNumber, priorityLevel })
      });
      if (res.ok) {
        const patient = await res.json();
        setGeneratedToken(patient);
      } else {
        alert('Failed to add patient');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const trackingUrl = generatedToken ? `${window.location.origin}/track/${generatedToken.tokenNumber}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    alert('Tracking link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
      <header className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Add New Patient
        </h1>
        <p className="text-slate-500 text-sm mt-1">Register a patient and generate their digital tracking token.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-children">
        {/* Form Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Patient Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Enter patient full name"
                disabled={!!generatedToken || loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Enter mobile number for SMS alerts"
                disabled={!!generatedToken || loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority Level <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none pr-10"
                  disabled={!!generatedToken || loading}
                >
                  <option value="NORMAL">Normal — Standard Queue</option>
                  <option value="PRIORITY">Priority — Senior Citizens / Children</option>
                  <option value="CRITICAL">Critical — Emergency / Immediate Action</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {priorityLevel === 'CRITICAL' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <span className="font-semibold block mb-1">Emergency Protocol</span>
                  This patient will bypass the normal queue and be placed at the very front. Please ensure this is an actual emergency.
                </div>
              </div>
            )}

            {!generatedToken && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Generate Digital Token
                  </>
                )}
              </button>
            )}

            {generatedToken && (
              <button
                type="button"
                onClick={() => {
                  setGeneratedToken(null);
                  setName('');
                  setMobileNumber('');
                  setPriorityLevel('NORMAL');
                }}
                className="w-full py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                Add Another Patient
              </button>
            )}
          </form>
        </div>

        {/* QR Code Section */}
        {generatedToken && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center animate-fade-in-up print:shadow-none print:border-none print:p-0 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none print:hidden"></div>
            
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2 print:hidden z-10">Token Generated!</h2>
            <div className="text-sm text-slate-500 mb-8 print:hidden z-10 text-center max-w-xs">Ask the patient to scan this QR code to track their live queue position on their phone.</div>
            
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center mb-8 print:p-0 print:border-none print:bg-white z-10 w-full max-w-sm relative">
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Token Number</span>
               <span className="text-7xl font-black text-indigo-600 mb-8 tracking-tighter drop-shadow-sm">{generatedToken.tokenNumber}</span>
               
               <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 w-full flex justify-center items-center group relative overflow-hidden">
                 {/* Scanning laser animation effect */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] translate-y-[-100%] animate-[scan_3s_ease-in-out_infinite] print:hidden"></div>
                 <QRCodeSVG value={trackingUrl} size={200} level="H" includeMargin={false} />
               </div>
               
               <style>{`
                 @keyframes scan {
                   0% { transform: translateY(-100%); opacity: 0; }
                   10% { opacity: 1; }
                   90% { opacity: 1; }
                   100% { transform: translateY(240px); opacity: 0; }
                 }
               `}</style>
            </div>

            <div className="flex items-center gap-4 w-full max-w-sm print:hidden z-10">
              <button onClick={copyLink} className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-sm active:scale-[0.98]">
                <Copy size={18} /> Copy Link
              </button>
              <button onClick={handlePrint} className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors text-sm active:scale-[0.98]">
                <Printer size={18} /> Print QR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
