'use client';
import { useEffect, useState } from 'react';

export default function AllSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('http://localhost:8000/schedules');
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSchedules(data);
      } catch (err) {
        setError(true);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Global Schedule Board</h1>
      
      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg font-bold">
          Schedule Service is Unavailable
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((s) => (
            <div key={s.id} className="p-5 border rounded-lg shadow-sm">
              <h2 className="text-xl font-bold">{s.title}</h2>
              <p className="text-gray-600 mb-4">{s.description}</p>
              <div className="bg-blue-50 p-3 rounded text-sm">
                <p><strong>Participant 1:</strong> {s.username1}</p>
                <p><strong>Participant 2:</strong> {s.username2}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}