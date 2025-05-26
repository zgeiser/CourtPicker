import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CourtCard from '../components/courts/CourtCard';
import { supabase } from '../lib/supabase';
import { Venue, Court } from '../types';
import { MapPin, Mail, Phone, Clock, Globe, ChevronLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) return;
    
    async function fetchVenueAndCourts() {
      try {
        setLoading(true);
        
        // Fetch venue details
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', venueId)
          .single();
        
        if (venueError) throw venueError;
        
        // Fetch courts with ratings
        const { data: courtsData, error: courtsError } = await supabase
          .from('courts')
          .select(`
            *,
            ratings (
              id,
              overall_rating
            )
          `)
          .eq('venue_id', venueId)
          .order('court_number');
        
        if (courtsError) throw courtsError;
        
        // Process venue data
        setVenue({
          id: venueData.id,
          name: venueData.name,
          address: venueData.address,
          city: venueData.city,
          state: venueData.state,
          zip: venueData.zip,
          imageUrl: venueData.image_url,
          description: venueData.description,
        });
        
        // Process courts data
        const processedCourts = courtsData.map((court: any) => {
          const ratingsCount = court.ratings.length;
          const avgRating = court.ratings.length > 0
            ? court.ratings.reduce((sum: number, rating: any) => sum + rating.overall_rating, 0) / court.ratings.length
            : undefined;
          
          return {
            id: court.id,
            venueId: court.venue_id,
            courtNumber: court.court_number,
            courtType: court.court_type,
            isIndoor: court.is_indoor,
            amenities: court.amenities,
            imageUrl: court.image_url,
            ratingsCount,
            avgRating: avgRating ? Number(avgRating.toFixed(1)) : undefined
          };
        });
        
        setCourts(processedCourts);
      } catch (err: any) {
        console.error('Error fetching venue:', err);
        setError('Failed to load venue details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVenueAndCourts();
  }, [venueId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !venue) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error || 'Venue not found'}</p>
            <Link 
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <ChevronLeft size={16} className="mr-1" /> Back to Venues
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 pb-6">
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-center bg-cover opacity-20" 
            style={{ backgroundImage: venue.imageUrl ? `url(${venue.imageUrl})` : 'url(https://images.pexels.com/photos/6511705/pexels-photo-6511705.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260)' }}
          ></div>
        </div>
        
        <div className="relative container mx-auto px-4 pt-24 pb-12">
          <Link
            to="/"
            className="inline-flex items-center text-blue-100 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={16} className="mr-1" /> Back to all venues
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{venue.name}</h1>
          
          <div className="flex items-center text-blue-100 mb-4">
            <MapPin size={18} className="mr-1 flex-shrink-0" />
            <span>{venue.address}, {venue.city}, {venue.state} {venue.zip}</span>
          </div>
          
          {venue.description && (
            <p className="text-blue-100 max-w-2xl">{venue.description}</p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 -mt-8">
          <div className="flex flex-wrap gap-6 text-sm border-b border-gray-200 pb-6">
            <div className="flex items-center">
              <Phone size={18} className="text-gray-500 mr-2" />
              <span>(555) 123-4567</span>
            </div>
            
            <div className="flex items-center">
              <Mail size={18} className="text-gray-500 mr-2" />
              <a href="#" className="text-blue-600 hover:underline">contact@example.com</a>
            </div>
            
            <div className="flex items-center">
              <Globe size={18} className="text-gray-500 mr-2" />
              <a href="#" className="text-blue-600 hover:underline">www.example.com</a>
            </div>
            
            <div className="flex items-center">
              <Clock size={18} className="text-gray-500 mr-2" />
              <span>Open 6:00AM - 10:00PM</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Courts ({courts.length})</h2>
          
          {courts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No courts have been added to this venue yet.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {courts.map((court) => (
                <CourtCard 
                  key={court.id} 
                  court={court} 
                  onClick={() => window.location.href = `/venues/${venueId}/courts/${court.id}`}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}