import { useState, useEffect } from 'react';
import { Venue } from '../../types';
import VenueCard from './VenueCard';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { MapPin, Loader } from 'lucide-react';

export default function VenueList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoading(true);
        
        // First, fetch venues with their courts
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select(`
            *,
            courts(
              id,
              court_number,
              ratings(overall_rating)
            )
          `)
          .order('name');
        
        if (venuesError) throw venuesError;
        
        // Process the data to calculate counts and averages
        const processedVenues = venuesData.map((venue: any) => {
          const courts = venue.courts || [];
          const courtsCount = courts.length;
          
          // Calculate average rating across all courts
          let totalRating = 0;
          let ratingCount = 0;
          
          courts.forEach((court: any) => {
            const courtRatings = court.ratings || [];
            const courtRatingSum = courtRatings.reduce((sum: number, rating: any) => 
              sum + (rating.overall_rating || 0), 0);
            
            if (courtRatings.length > 0) {
              totalRating += courtRatingSum;
              ratingCount += courtRatings.length;
            }
          });
          
          const avgRating = ratingCount > 0 ? totalRating / ratingCount : undefined;
          
          return {
            id: venue.id,
            name: venue.name,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            zip: venue.zip,
            imageUrl: venue.image_url,
            description: venue.description,
            courtsCount,
            avgRating: avgRating ? Number(avgRating.toFixed(1)) : undefined
          };
        });
        
        setVenues(processedVenues);
      } catch (err: any) {
        console.error('Error fetching venues:', err);
        setError('Failed to load venues. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVenues();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Venues Found</h3>
        <p className="text-gray-600 mb-6">There are no pickleball venues in our database yet.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </motion.div>
  );
}