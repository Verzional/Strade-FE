'use client';
import { useEffect, useState } from 'react';

export default function ScheduleSection({ userId }: { userId: string | undefined }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchSchedules() {
      try {
        // Hitting your gateway/schedule service directly, NOT the database!
        const res = await fetch('http://localhost:8000/schedules');
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        // Filter to only show schedules where this user is involved
        const mySchedules = data.filter((s: any) => s.userId1 === userId || s.userId2 === userId);
        setSchedules(mySchedules);
      } catch (err) {
        // If the Schedule service is down, the fetch fails and triggers this error
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [userId]);

  if (loading) return <div className="mt-8 p-4">Loading schedules...</div>;
  
  // REQUIREMENT MET: Graceful error if Schedule Service is offline
  if (error) return (
    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
      <h2 className="text-xl text-red-600 font-bold">Schedule Service is Unavailable</h2>
      <p className="text-red-400 text-sm">Please try again later.</p>
    </div>
  );

  return (
    <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">My Schedules</h2>
      {schedules.length === 0 ? (
        <p className="text-gray-500">You have no upcoming schedules.</p>
      ) : (
        <ul className="space-y-4">
          {schedules.map((s) => (
            <li key={s.id} className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-lg">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.description}</p>
              <div className="mt-2 text-sm text-blue-600 font-medium">
                Meeting with: {s.userId1 === userId ? s.username2 : s.username1}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}