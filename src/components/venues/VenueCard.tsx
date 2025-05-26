import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Venue } from '../../types';

interface VenueCardProps {
  venue: Venue;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const defaultImage = "https://images.pexels.com/photos/6883828/pexels-photo-6883828.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <Link to={`/venues/${venue.id}`}>
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={venue.imageUrl || defaultImage}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{venue.name}</h3>
          
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <MapPin size={16} className="mr-1 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-1">{venue.city}, {venue.state}</span>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm font-medium">
                {venue.avgRating ? venue.avgRating.toFixed(1) : 'New'}
              </span>
            </div>
            
            <span className="text-sm text-gray-600">
              {venue.courtsCount || 0} {venue.courtsCount === 1 ? 'court' : 'courts'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}