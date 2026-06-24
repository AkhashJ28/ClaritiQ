import React, { useState } from 'react';
import { Save } from 'lucide-react';

export const Settings = () => {
  const [clinicName, setClinicName] = useState('QueueCure Clinic');
  const [defaultWaitTime, setDefaultWaitTime] = useState(8);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Configure global system settings.</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Default Consultation Time (minutes)</label>
            <input
              type="number"
              value={defaultWaitTime}
              onChange={(e) => setDefaultWaitTime(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Used to estimate wait times for the queue.</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};
