'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../../lib/api';

interface Skill {
  id: string;
  skillName: string;
}

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  is_teaching: boolean;
  skillName: string;
  image?: string | null;
}

export default function SkillMatchingPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [intent, setIntent] = useState<'learn' | 'teach'>('learn');
  const [matchedUsers, setMatchedUsers] = useState<DisplayUser[]>([]);
  
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [skillServiceError, setSkillServiceError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Fetch the list of all skills from /api/skills on mount
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetchWithAuth('/api/skills');
        if (response.status === 401) {
          localStorage.removeItem('strade_token');
          router.push('/login');
          return;
        }
        if (!response.ok) {
          throw new Error('SkillService is unreachable');
        }
        const data = await response.json();
        setSkills(data);
        if (data.length > 0) {
          setSelectedSkillId(data[0].id);
        }
      } catch (err: any) {
        console.warn('SkillService load error:', err.message);
        setSkillServiceError('Skill Service is currently unavailable.');
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkills();
  }, [router]);

  // Handle the Match action
  const handleMatch = async () => {
    if (!selectedSkillId) return;

    setIsMatching(true);
    setHasSearched(true);
    setSkillServiceError('');
    setMatchedUsers([]);

    try {
      // 2. Fetch matched users from SkillService
      const matchResponse = await fetchWithAuth(
        `/api/skills/match?skill_id=${selectedSkillId}&intent=${intent}`
      );
      
      if (!matchResponse.ok) {
        throw new Error('SkillService matching failed');
      }
      
      const matchedData: any[] = await matchResponse.json();

      // 3. For each matched user, attempt to fetch their up-to-date profile from UserService in parallel
      const enrichedUsers = await Promise.all(
        matchedData.map(async (u) => {
          let imageUrl = undefined;
          
          try {
            // This is the fallback test: If UserService is down, we catch the error 
            // and the image URL remains undefined. Assumes /api/users/${user_id} exists.
            const profileRes = await fetchWithAuth(`/api/users/${u.user_id}`);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              imageUrl = profileData.image;
            }
          } catch (profileErr) {
            // UserService is dead or request failed. Swallow the error.
            console.warn(`UserService fallback: couldn't fetch profile for ${u.user_id}`);
          }

          return {
            id: u.user_id,
            name: u.username,      // Redundancy from SkillService goes here
            email: u.email,
            is_teaching: u.is_teaching,
            skillName: u.skillName,
            image: imageUrl        // Might be undefined if UserService failed
          };
        })
      );

      setMatchedUsers(enrichedUsers);
    } catch (err: any) {
      console.warn('SkillService matching error:', err.message);
      setSkillServiceError('Skill Service is currently unavailable.');
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoadingSkills) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header / Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Matching</h1>
              <p className="text-gray-500">Find users to learn from or teach your skills to.</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div>
              <label htmlFor="intent" className="block text-sm font-medium text-gray-700 mb-2">
                I want to:
              </label>
              <select
                id="intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value as 'learn' | 'teach')}
                className="block w-full rounded-md border-gray-300 border p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="learn">Learn a skill</option>
                <option value="teach">Teach a skill</option>
              </select>
            </div>

            <div>
              <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-2">
                Select Skill:
              </label>
              <select
                id="skill"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="block w-full rounded-md border-gray-300 border p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              >
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.skillName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleMatch}
              disabled={isMatching || skills.length === 0}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMatching ? 'Matching...' : 'Find Matches'}
            </button>
          </div>
        </div>

        {/* Error Section */}
        {skillServiceError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="font-medium">{skillServiceError}</p>
          </div>
        )}

        {/* Results Section */}
        {matchedUsers.length > 0 && !skillServiceError && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Matches Found ({matchedUsers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchedUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                  {/* UserService Falback profile picture testing */}
                  <div className="shrink-0">
                     {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-gray-400 to-gray-500 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate mb-1">
                      {user.email}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_teaching 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.is_teaching ? `Can teach ${user.skillName}` : `Wants to learn ${user.skillName}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Empty State */}
        {matchedUsers.length === 0 && !isMatching && !skillServiceError && hasSearched && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
             <div className="text-4xl mb-4">🔍</div>
             <h3 className="text-lg font-medium text-gray-900 mb-1">No matches found</h3>
             <p className="text-gray-500">We couldn't find any users matching your criteria.</p>
           </div>
        )}

        {/* Initial Empty State */}
        {!hasSearched && !skillServiceError && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
             <div className="text-4xl mb-4">🤝</div>
             <h3 className="text-lg font-medium text-gray-900 mb-1">Ready to find a match?</h3>
             <p className="text-gray-500">Select a skill and intent, then click 'Find Matches' to discover users.</p>
           </div>
        )}
      </div>
    </div>
  );
}
