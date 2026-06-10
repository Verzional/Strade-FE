'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';

// Helper to format the ISO date string into a readable format
const formatDateTime = (date: string) => {
  const rawDate = new Date(date);
  const dateStr = rawDate.toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
  });
  return { dateStr };
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
      if (!userId) return;

      try {
        const response = await fetchWithAuth(`/api/reviews/receiver/${userId}`);
        
        if (response.status === 401) {
          localStorage.removeItem('strade_token');
          router.push('/login');
          return;
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
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        
        if (data.length === 0) {
          setIsEmpty(true);
        } else {
          setReviews(data);
        }

      } catch (err: any) {
        setError(true);
        setGeneralError('Could not connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [router, userId]);

  if (loading) return (
    <div className="mt-8 p-8 flex justify-center border border-gray-100 rounded-xl bg-white shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isServiceDown) return (
    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
      <div className="text-4xl mb-3">🔌</div>
      <div>
        <h2 className="text-xl text-red-700 font-bold">Review Service is Offline</h2>
        <p className="text-red-500 mt-1">Our engineers are working to restore the connection.</p>
      </div>
    </div>
  );

  if (isEmpty) return (
    <div className="mt-8 p-8 flex-col items-center flex justify-center border border-gray-100 rounded-xl bg-white shadow-sm">
      <div className="text-4xl mb-3">⭐</div>
      <h2 className="text-xl text-gray-700 font-bold">No Reviews yet</h2>
      <p className="text-gray-500 mt-1">You haven't received any reviews right now.</p>
    </div>
  );
  
  if (error) return (
    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
      <div className="text-red-500 text-3xl">⚠️</div>
      <div>
        <h2 className="text-lg text-red-700 font-bold">Review Service is Unavailable</h2>
        <p className="text-red-500 text-sm">{generalError}</p>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Received Reviews</h2>
      
      <ul className="space-y-4">
        {reviews.map((s) => {
          const createdAt = formatDateTime(s.createdAt);
          
          // Safely check if the image exists nested inside the author object
          const authorImage = s.author?.image;

          return (
            <li key={s.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                
                {/* --- AVATAR SECTION --- */}
                <div className="flex-shrink-0">
                  {authorImage ? (
                    <img 
                      src={authorImage} 
                      alt={s.author_name} 
                      className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 border border-gray-300 shadow-sm flex items-center justify-center text-gray-500 font-bold text-xl">
                      {s.author_name ? s.author_name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                {/* ---------------------- */}

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                      {s.author_name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 sm:mt-0">{createdAt.dateStr}</p>
                  </div>
                  
                  <div className="mt-2 mb-3">
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <svg
                          key={index}
                          viewBox="0 0 24 24"
                          fill={index < s.rating ? "#FBBF24" : "#E5E7EB"} 
                          style={{ width: '18px', height: '18px' }}
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-md leading-relaxed">{s.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}