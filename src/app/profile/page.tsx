'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../../lib/api';
import ScheduleSection from '../components/ScheduleSection';
import ReviewSection from '../components/ReviewSection';

// This interface matches exactly what your Node.js backend returns
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Create a state variable for the token, initially null
  const [token, setToken] = useState<string | null>(null);

  // 2. Fetch the token inside a useEffect (which only runs on the browser)
  useEffect(() => {
    setToken(localStorage.getItem('strade_token'));
  }, []);



 useEffect(() => {
    const loadProfile = async () => {
      console.log('Fetching profile');
      // Ensure we show loading only when genuinely fetching
      setIsLoading(true);
      setError('');

      try {
        const response = await fetchWithAuth('/api/users/profile', {
          // This stops the browser from caching the raw HTTP request
          cache: 'no-store' 
        });
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        console.log('Profile loaded', data);

        setUser(data);
        
      } catch (err: any) {
        console.error(err);
        if (err.message === 'Unauthorized') {
          localStorage.removeItem('strade_token');
          router.replace('/login');
        } else {
          setError('Could not connect to the server. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    // Delete the token from the browser and redirect
    localStorage.removeItem('strade_token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Profile Picture */}
            <div className="relative">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  referrerPolicy="no-referrer" // Important for Google profile images
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online Status Indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 font-medium mt-1">{user.email}</p>
              {/* <p className="text-xs text-gray-400 font-mono mt-2 break-all">{token}</p> */}
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                Verified Account
              </div>
            </div>
            
            <div className="sm:ml-auto mt-4 sm:mt-0">
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="bg-white rounded-b-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-2">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
              <p className="text-gray-900 font-mono text-sm break-all">{user.id}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Authentication Method</p>
              <p className="text-gray-900 flex items-center gap-2">
                {user.image ? 'Google OAuth' : 'Standard Email'}
              </p>
            </div>
          </div>
        </div>

    
        <ScheduleSection userId={user.id} />
        <ReviewSection userId={user.id} />

      </div>
    </div>
  );
}