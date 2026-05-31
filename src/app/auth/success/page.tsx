'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Grab the token from the URL: ?token=eyJhbGci...
    const token = searchParams.get('token');

    if (token) {
      // 2. Save it securely to LocalStorage
      localStorage.setItem('strade_token', token);
      
      // 3. Send the user to the protected profile page
      router.push('/profile');
    } else {
      // If something went wrong, send them back to login
      router.push('/login?error=NoTokenProvided');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Authenticating...</p>
      </div>
    </div>
  );
}