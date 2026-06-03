'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { create } from 'domain';

// Helper to format the ISO date string into a readable format
const formatDateTime = (date: string) => {
  const rawDate = new Date(date);
  
  const dateStr = rawDate.toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
  });

  return { dateStr};
};

export default function ReviewSection({ userId }: { userId: string | undefined }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isServiceDown, setIsServiceDown] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        // Fetching from the Go Gateway
        const response = await fetchWithAuth('/api/reviews');
        
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
        setReviews(data);

      } catch (err: any) {
        setGeneralError('Could not connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [router]);

  if (loading) return (
    <div className="mt-8 p-8 flex justify-center border border-gray-100 rounded-xl bg-white shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isServiceDown) return (
    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
      <div className="text-4xl mb-3">🔌</div>
            <h2 className="text-xl text-red-700 font-bold">Review Service is Offline</h2>
            <p className="text-red-500 mt-1">Our engineers are working to restore the connection.</p>
    </div>
  );

  if (isEmpty) return (
    <div className="mt-8 p-8 flex-col items-center flex justify-center border border-gray-100 rounded-xl bg-white shadow-sm">
                  <div className="text-4xl mb-3">📅</div>
            <h2 className="text-xl text-gray-700 font-bold">No Reviews yet</h2>
            <p className="text-gray-500 mt-1">You don't have any reviews right now.</p>
    </div>
  );
  
  if (error) return (
    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
      <div className="text-red-500 text-3xl">⚠️</div>
      <div>
        <h2 className="text-lg text-red-700 font-bold">Review Service is Unavailable</h2>
        <p className="text-red-500 text-sm">We couldn't load your reviews. Please try again later.</p>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
      
      {reviews.length === 0 ? (
        <div className="p-8 bg-white border border-gray-200 rounded-xl text-center text-gray-500 shadow-sm">
          You have no reviews.
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((s) => {
            const createdAt = formatDateTime(s.createdAt);
            const otherUser = s.receiverId === userId;

            return (
              <li key={s.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{s.author_name}</h3>
                    <p className="text-gray-8500 mt-1 text-md">{createdAt.dateStr}</p>
                    <div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            viewBox="0 0 24 24"
                            /* If the index is less than the rating, make it Gold. Otherwise, make it Gray */
                            fill={index < s.rating ? "#FBBF24" : "#E5E7EB"} 
                            style={{ width: '24px', height: '24px' }}
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-800 mt-1 text-sm">{s.description}</p>
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