import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Rating from '../ui/Rating';
import { motion } from 'framer-motion';

interface CourtRatingFormProps {
  courtId: string;
  onSubmit: (rating: {
    courtId: string;
    userId: string;
    overallRating: number;
    surfaceRating?: number;
    netRating?: number;
    lightingRating?: number;
    comment?: string;
  }) => Promise<void>;
}

export default function CourtRatingForm({ courtId, onSubmit }: CourtRatingFormProps) {
  const { user } = useAuth();
  const [overallRating, setOverallRating] = useState(0);
  const [surfaceRating, setSurfaceRating] = useState(0);
  const [netRating, setNetRating] = useState(0);
  const [lightingRating, setLightingRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a rating');
      return;
    }
    
    if (overallRating === 0) {
      setError('Please provide an overall rating');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await onSubmit({
        courtId,
        userId: user.id,
        overallRating,
        surfaceRating: surfaceRating || undefined,
        netRating: netRating || undefined,
        lightingRating: lightingRating || undefined,
        comment: comment.trim() || undefined,
      });
      
      // Reset form
      setOverallRating(0);
      setSurfaceRating(0);
      setNetRating(0);
      setLightingRating(0);
      setComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-50 p-6 rounded-lg"
    >
      <h3 className="text-lg font-medium mb-4">Rate this court</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <Rating value={overallRating} onChange={setOverallRating} size="lg" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface Quality
            </label>
            <Rating value={surfaceRating} onChange={setSurfaceRating} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Net Condition
            </label>
            <Rating value={netRating} onChange={setNetRating} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lighting
            </label>
            <Rating value={lightingRating} onChange={setLightingRating} />
          </div>
        </div>
        
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comments
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this court..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || overallRating === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}