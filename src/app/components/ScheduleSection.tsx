'use client';
import { useEffect, useState } from 'react';

// Helper to format the ISO date string into a readable format
const formatDateTime = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const dateStr = startDate.toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
  });
  const timeStartStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const timeEndStr = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return { dateStr, timeStr: `${timeStartStr} - ${timeEndStr}` };
};

export default function ScheduleSection({ userId }: { userId: string | undefined }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchSchedules() {
      try {
        const res = await fetch('http://localhost:8000/schedules');
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        const mySchedules = data.filter((s: any) => s.userId1 === userId || s.userId2 === userId);
        setSchedules(mySchedules);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [userId]);

  if (loading) return (
    <div className="mt-8 p-8 flex justify-center border border-gray-100 rounded-xl bg-white shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
      <div className="text-red-500 text-3xl">⚠️</div>
      <div>
        <h2 className="text-lg text-red-700 font-bold">Schedule Service is Unavailable</h2>
        <p className="text-red-500 text-sm">We couldn't load your meetings. Please try again later.</p>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Meetings</h2>
      
      {schedules.length === 0 ? (
        <div className="p-8 bg-white border border-gray-200 rounded-xl text-center text-gray-500 shadow-sm">
          You have no upcoming schedules.
        </div>
      ) : (
        <ul className="space-y-4">
          {schedules.map((s) => {
            const { dateStr, timeStr } = formatDateTime(s.time_start, s.time_end);
            const otherUser = s.userId1 === userId ? s.username2 : s.username1;

            return (
              <li key={s.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                    <p className="text-gray-500 mt-1 text-sm">{s.description}</p>
                  </div>
                  <span className="shrink-0 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100">
                    {dateStr}
                  </span>
                </div>
                
                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="font-medium">{timeStr}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span>Meeting with: <strong className="text-gray-900">{otherUser}</strong></span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}