import React from 'react';
import { motion } from 'framer-motion';
import Rating from '../ui/Rating';
import { Court } from '../../types';

interface CourtCardProps {
  court: Court;
  onClick?: () => void;
}

export default function CourtCard({ court, onClick }: CourtCardProps) {
  const defaultImage = "https://images.pexels.com/photos/3689177/pexels-photo-3689177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={court.imageUrl || defaultImage}
          alt={`Court ${court.courtNumber}`}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">Court {court.courtNumber}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            court.isIndoor ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {court.isIndoor ? 'Indoor' : 'Outdoor'}
          </span>
        </div>

        {court.courtType && (
          <p className="text-sm text-gray-600 mb-3">
            {court.courtType}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Rating value={court.avgRating || 0} readonly size="sm" />
            <span className="ml-2 text-sm font-medium">
              {court.avgRating ? court.avgRating.toFixed(1) : 'No ratings'}
            </span>
          </div>
          
          <span className="text-xs text-gray-500">
            {court.ratingsCount || 0} {court.ratingsCount === 1 ? 'rating' : 'ratings'}
          </span>
        </div>
        
        {court.amenities && court.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {court.amenities.map((amenity, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}