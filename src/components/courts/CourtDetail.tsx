import React, { useState } from 'react';
import { Court, Rating } from '../../types';
import RatingStars from '../ui/Rating';
import { motion } from 'framer-motion';
import CourtRatingForm from './CourtRatingForm';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/dateFormat';

interface CourtDetailProps {
  court: Court;
  ratings: Rating[];
  onAddRating: (rating: Omit<Rating, 'id' | 'createdAt' | 'username'>) => Promise<void>;
}

export default function CourtDetail({ court, ratings, onAddRating }: CourtDetailProps) {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [expandedRatings, setExpandedRatings] = useState(false);
  const { user } = useAuth();
  
  const defaultImage = "https://images.pexels.com/photos/3689177/pexels-photo-3689177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
  
  // Show only 3 ratings by default, unless expanded
  const visibleRatings = expandedRatings ? ratings : ratings.slice(0, 3);
  const hasMoreRatings = ratings.length > 3;
  
  // Calculate average ratings
  const avgSurfaceRating = ratings.reduce((acc, rating) => 
    acc + (rating.surfaceRating || 0), 0) / (ratings.length || 1);
  
  const avgNetRating = ratings.reduce((acc, rating) => 
    acc + (rating.netRating || 0), 0) / (ratings.length || 1);
    
  const avgLightingRating = ratings.reduce((acc, rating) => 
    acc + (rating.lightingRating || 0), 0) / (ratings.length || 1);
  
  return (
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
          <div className="mt-2 flex items-center">
            <RatingStars value={court.avgRating || 0} readonly />
            <span className="ml-2 text-white font-medium">
              {court.avgRating?.toFixed(1) || 'No ratings'}
            </span>
            <span className="ml-2 text-white/80 text-sm">
              ({court.ratingsCount || 0} {court.ratingsCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
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
          
          {court.amenities && court.amenities.map((amenity, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
            >
              {amenity}
            </span>
          ))}
        </div>
        
        {ratings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Court Attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Surface</span>
                  <RatingStars value={avgSurfaceRating} readonly size="sm" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(avgSurfaceRating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Net</span>
                  <RatingStars value={avgNetRating} readonly size="sm" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(avgNetRating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Lighting</span>
                  <RatingStars value={avgLightingRating} readonly size="sm" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(avgLightingRating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {user && (
          <div className="mb-8">
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showRatingForm ? 'Cancel Rating' : 'Rate This Court'}
            </button>
            
            {showRatingForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <CourtRatingForm courtId={court.id} onSubmit={onAddRating} />
              </motion.div>
            )}
          </div>
        )}
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          
          {ratings.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No reviews yet. Be the first to rate this court!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleRatings.map((rating) => (
                <div key={rating.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <RatingStars value={rating.overallRating} readonly size="sm" />
                        <span className="ml-2 text-sm font-medium">
                          {rating.overallRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        By {rating.username || 'Anonymous'} • {formatDistanceToNow(rating.createdAt)} ago
                      </p>
                    </div>
                    
                    <button className="text-gray-400 hover:text-gray-600">
                      <ThumbsUp size={16} />
                    </button>
                  </div>
                  
                  {rating.comment && (
                    <p className="mt-3 text-gray-700">{rating.comment}</p>
                  )}
                  
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                    {rating.surfaceRating && (
                      <div>
                        <span className="font-medium">Surface:</span> {rating.surfaceRating}
                      </div>
                    )}
                    
                    {rating.netRating && (
                      <div>
                        <span className="font-medium">Net:</span> {rating.netRating}
                      </div>
                    )}
                    
                    {rating.lightingRating && (
                      <div>
                        <span className="font-medium">Lighting:</span> {rating.lightingRating}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {hasMoreRatings && (
                <button
                  onClick={() => setExpandedRatings(!expandedRatings)}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center focus:outline-none"
                >
                  {expandedRatings ? (
                    <>
                      <ChevronUp size={16} className="mr-1" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="mr-1" /> Show More Reviews ({ratings.length - 3})
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}