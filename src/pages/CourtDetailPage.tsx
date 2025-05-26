import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { Court } from '../types';
import { Loader } from 'lucide-react';

export default function CourtDetailPage() {
  const { venueId, courtId } = useParams<{ venueId: string; courtId: string }>();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!courtId) return;
    
    async function fetchCourt() {
      try {
        setLoading(true);
        
        const { data: courtData, error: courtError } = await supabase
          .from('courts')
          .select('*')
          .eq('id', courtId)
          .single();
        
        if (courtError) throw courtError;
        
        setCourt({
          id: courtData.id,
          venueId: courtData.venue_id,
          courtNumber: courtData.court_number,
          courtType: courtData.court_type,
          isIndoor: courtData.is_indoor,
          imageUrl: courtData.image_url,
        });
      } catch (err: any) {
        console.error('Error fetching court:', err);
        setError('Failed to load court details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourt();
  }, [courtId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !court) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error || 'Court not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const defaultImage = "https://images.pexels.com/photos/3689177/pexels-photo-3689177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-blue-600"
          >
            <span className="mr-1">←</span> Back to venue
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative h-56 md:h-64 lg:h-80 overflow-hidden">
            <img
              src={court.imageUrl || defaultImage}
              alt={`Court ${court.courtNumber}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Court {court.courtNumber}
              </h1>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                court.isIndoor ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {court.isIndoor ? 'Indoor' : 'Outdoor'}
              </span>
              
              {court.courtType && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {court.courtType}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}