'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';

const formatDateTime = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  return { dateStr, timeStr };
};

export default function AllSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  // NEW: State to hold user profile data mapped by their ID
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isServiceDown, setIsServiceDown] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const loadSchedulesAndUsers = async () => {
      try {
        // 1. Fetch the raw schedules
        const response = await fetchWithAuth('/api/schedules');
        
         if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (response.status === 503) {
          setIsServiceDown(true);
          setLoading(false);
          return;
        }

        if (response.status === 404) {
          setIsEmpty(true);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch schedules');
        }

        const scheduleData = await response.json();
        
        if (scheduleData.length === 0) {
          setIsEmpty(true);
          setLoading(false);
          return;
        }

        // 2. Extract all unique user IDs from the schedules
        const uniqueUserIds = Array.from(
          new Set(scheduleData.flatMap((s: any) => [s.userId1, s.userId2]))
        ).filter(Boolean); // Removes null/undefined

        // 3. Fetch all user profiles concurrently from the frontend
        const profilesMap: Record<string, any> = {};
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              // Calls the new route we built in the User Service!
              const userRes = await fetchWithAuth(`/api/users/${uid}`);
              if (userRes.ok) {
                profilesMap[uid as string] = await userRes.json();
              }
            } catch (err) {
              console.error(`Failed to load profile for ${uid}`, err);
              // We intentionally don't throw here so the schedule still loads even if one image fails
            }
          })
        );

        // 4. Save everything to state
        setUserProfiles(profilesMap);
        setSchedules(scheduleData);

      } catch (err: any) {
                console.error(err);
        if (err.message === 'Unauthorized') {
          localStorage.removeItem('strade_token');
          router.replace('/login');
        } else {
          setGeneralError('Could not connect to the server. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadSchedulesAndUsers();
  }, [router]);

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
        ) : isServiceDown ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
            <div className="text-4xl mb-3">🔌</div>
            <h2 className="text-xl text-red-700 font-bold">Schedule Service is Offline</h2>
            <p className="text-red-500 mt-1">Our engineers are working to restore the connection.</p>
          </div>
        ) : generalError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl text-red-700 font-bold">Error</h2>
            <p className="text-red-500 mt-1">{generalError}</p>
          </div>
        ) : isEmpty ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center shadow-sm">
            <div className="text-4xl mb-3">📅</div>
            <h2 className="text-xl text-gray-700 font-bold">No schedules yet</h2>
            <p className="text-gray-500 mt-1">There are no upcoming meetings or schedules right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((s) => {
              const { dateStr, timeStr } = formatDateTime(s.time_start, s.time_end);
              
              // NEW: Look up the cached profiles we just fetched!
              const user1Profile = userProfiles[s.userId1];
              const user2Profile = userProfiles[s.userId2];

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
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="font-medium">{timeStr}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                      
                      {/* Participant 1 */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Participant 1</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{s.username1}</span>
                          {user1Profile?.image ? (
                            <img src={user1Profile.image} alt={s.username1} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
                              {s.username1 ? s.username1.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="h-px bg-gray-200 w-full"></div>

                      {/* Participant 2 */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Participant 2</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{s.username2}</span>
                          {user2Profile?.image ? (
                            <img src={user2Profile.image} alt={s.username2} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">
                              {s.username2 ? s.username2.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                        </div>
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