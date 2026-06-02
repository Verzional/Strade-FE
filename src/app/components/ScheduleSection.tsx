'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isServiceDown, setIsServiceDown] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        // Fetching from the Go Gateway
        const response = await fetchWithAuth('/api/schedules');
        
        // 1. Handle Token Expiration
        if (response.status === 401) {
          localStorage.removeItem('strade_token');
          router.push('/login');
          return;
        }

        // 2. Handle Gateway 503 (Python Container is stopped/crashed)
        if (response.status === 503) {
          setIsServiceDown(true);
          setLoading(false);
          return;
        }

        // 3. Handle Python 404 (Database is empty)
        if (response.status === 404) {
          setIsEmpty(true);
          setLoading(false);
          return;
        }

        // 4. Handle other unexpected errors
        if (!response.ok) {
          throw new Error('Failed to fetch schedules');
        }

        // 5. Success! Parse the array of schedules
        const data = await response.json();
        setSchedules(data);

      } catch (err: any) {
        setGeneralError('Could not connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [router]);

  if (loading) return (
    <div className="mt-8 p-8 flex justify-center border border-gray-100 rounded-xl bg-white shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isServiceDown) return (
    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
      <div className="text-4xl mb-3">🔌</div>
            <h2 className="text-xl text-red-700 font-bold">Schedule Service is Offline</h2>
            <p className="text-red-500 mt-1">Our engineers are working to restore the connection.</p>
    </div>
  );

  if (isEmpty) return (
    <div className="mt-8 p-8 flex-col items-center flex justify-center border border-gray-100 rounded-xl bg-white shadow-sm">
                  <div className="text-4xl mb-3">📅</div>
            <h2 className="text-xl text-gray-700 font-bold">No schedules yet</h2>
            <p className="text-gray-500 mt-1">You don't have any upcoming meetings or schedules right now.</p>
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