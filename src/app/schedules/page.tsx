'use client';
import { useEffect, useState } from 'react';

const formatDateTime = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  return { dateStr, timeStr };
};

export default function AllSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('http://localhost:8000/schedules');
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSchedules(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Global Schedule Board</h1>
          <p className="text-gray-500 mt-2">View all upcoming meetings and activities across the platform.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
            <div className="text-4xl mb-3">🔌</div>
            <h2 className="text-xl text-red-700 font-bold">Schedule Service is Offline</h2>
            <p className="text-red-500 mt-1">Our engineers are working to restore the connection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((s) => {
              const { dateStr, timeStr } = formatDateTime(s.time_start, s.time_end);
              return (
                <div key={s.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full">
                  
                  {/* Top Badge (Date) */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                      {dateStr}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="flex-grow">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{s.title}</h2>
                    <p className="text-gray-500 mt-2 text-sm line-clamp-2">{s.description}</p>
                  </div>

                  {/* Divider */}
                  <hr className="my-5 border-gray-100" />

                  {/* Time & Participants */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="font-medium">{timeStr}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Participant 1</span>
                        <span className="font-bold text-gray-900">{s.username1}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Participant 2</span>
                        <span className="font-bold text-gray-900">{s.username2}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}