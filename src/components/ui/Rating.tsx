import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export default function Rating({ 
  value, 
  max = 5, 
  size = 'md', 
  onChange,
  readonly = false
}: RatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (newValue: number) => {
    if (readonly) return;
    if (onChange) onChange(newValue);
  };
  
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= value;
        
        return (
          <motion.button
            key={i}
            whileTap={!readonly ? { scale: 0.85 } : {}}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none mr-1`}
            onClick={() => handleClick(starValue)}
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-300'
              } transition-colors`}
              strokeWidth={1.5}
            />
          </motion.button>
        );
      })}
    </div>
  );
}