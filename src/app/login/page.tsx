'use client';

import { getGoogleAuthUrl } from "../../../lib/api";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to Strade</h1>
        <p className="text-gray-600 mb-8">Sign in to access your dashboard</p>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-5 h-5" 
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}