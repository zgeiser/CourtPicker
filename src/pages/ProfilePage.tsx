import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Rating } from '../types';
import { User, Star, Edit2, Trash2 } from 'lucide-react';
import SubscriptionInfo from '../components/profile/SubscriptionInfo';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myRatings, setMyRatings] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        
        // First check if profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        // If no profile exists, create one
        if (!existingProfile) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0],
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          setProfile(existingProfile);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    
    fetchProfile();
  }, [user]);
  
  useEffect(() => {
    if (!user) return;
    
    async function fetchMyRatings() {
      try {
        setLoadingRatings(true);
        
        const { data, error } = await supabase
          .from('ratings')
          .select(`
            *,
            courts:courts(
              court_number,
              venues:venues(
                id,
                name
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setMyRatings(data || []);
      } catch (err) {
        console.error('Error fetching ratings:', err);
      } finally {
        setLoadingRatings(false);
      }
    }
    
    fetchMyRatings();
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 sm:h-48"></div>
          
          <div className="relative px-4 sm:px-6 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 mb-6 sm:mb-8 sm:space-x-5">
              <div className="bg-white p-2 rounded-full shadow-md mb-4 sm:mb-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username || 'User'}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full"
                  />
                ) : (
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                    <User size={40} />
                  </div>
                )}
              </div>
              
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {profile?.username || user.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">My Ratings</h2>
            
            {loadingRatings ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myRatings.length === 0 ? (
              <div className="bg-gray-50 rounded-xl py-12 text-center">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Ratings Yet</h3>
                <p className="text-gray-500 mb-6">
                  You haven't rated any courts yet. Start exploring venues to add ratings!
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore Venues
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Venue & Court
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myRatings.map((rating: any) => {
                      const venueName = rating.courts.venues.name;
                      const courtNumber = rating.courts.court_number;
                      const venueId = rating.courts.venues.id;
                      const courtId = rating.court_id;
                      const date = new Date(rating.created_at).toLocaleDateString();
                      
                      return (
                        <tr key={rating.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a 
                              href={`/venues/${venueId}/courts/${courtId}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {venueName} - Court {courtNumber}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    size={16} 
                                    className={i < rating.overall_rating 
                                      ? "text-yellow-400 fill-yellow-400" 
                                      : "text-gray-300 fill-gray-300"}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-gray-700">{rating.overall_rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <a 
                              href={`/venues/${venueId}/courts/${courtId}`}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <Edit2 size={16} className="inline" />
                            </a>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 size={16} className="inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div>
            <SubscriptionInfo />
          </div>
        </div>
      </div>
    </Layout>
  );
}