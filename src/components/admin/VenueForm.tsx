import { useState, useEffect } from 'react';
import { Venue } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Loader, AlertCircle, Plus, Minus } from 'lucide-react';

interface VenueFormProps {
  venue?: Venue;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Court {
  number: string;
  type: 'outdoor_surface' | 'gym' | 'sport_court' | 'other';
  isIndoor: boolean;
}

export default function VenueForm({ venue, onSuccess, onCancel }: VenueFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: venue?.name || '',
    address: venue?.address || '',
    city: venue?.city || '',
    state: venue?.state || '',
    zip: venue?.zip || '',
    description: venue?.description || '',
    indoorCourts: [] as Court[],
    outdoorCourts: [] as Court[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing courts when editing a venue
  useEffect(() => {
    if (!venue) return;

    async function fetchCourts() {
      try {
        const { data: courts, error: courtsError } = await supabase
          .from('courts')
          .select('*')
          .eq('venue_id', venue.id)
          .order('court_number');

        if (courtsError) throw courtsError;

        const indoorCourts: Court[] = [];
        const outdoorCourts: Court[] = [];

        courts?.forEach(court => {
          const courtData: Court = {
            number: court.court_number.toString(),
            type: court.court_type || 'outdoor_surface',
            isIndoor: court.is_indoor
          };

          if (court.is_indoor) {
            indoorCourts.push(courtData);
          } else {
            outdoorCourts.push(courtData);
          }
        });

        setFormData(prev => ({
          ...prev,
          indoorCourts,
          outdoorCourts
        }));
      } catch (err) {
        console.error('Error fetching courts:', err);
        setError('Failed to load court information');
      }
    }

    fetchCourts();
  }, [venue]);

  const validateCourts = () => {
    const allCourts = [...formData.indoorCourts, ...formData.outdoorCourts];
    
    // Check if any court numbers are empty
    if (allCourts.some(court => !court.number.trim())) {
      throw new Error('All courts must have a number');
    }

    // Check if all court numbers are positive integers
    if (allCourts.some(court => !Number.isInteger(Number(court.number)) || Number(court.number) <= 0)) {
      throw new Error('Court numbers must be positive integers');
    }

    // Check for duplicate court numbers
    const courtNumbers = allCourts.map(court => Number(court.number));
    const uniqueNumbers = new Set(courtNumbers);
    if (uniqueNumbers.size !== courtNumbers.length) {
      throw new Error('Each court must have a unique number');
    }

    return courtNumbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Validate courts before proceeding
      validateCourts();

      const venueData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        description: formData.description,
        user_id: user.id
      };

      let venueId: string;

      if (venue) {
        // Update existing venue
        const { error: updateError } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', venue.id);

        if (updateError) throw updateError;
        venueId = venue.id;

        // Delete existing courts
        const { error: deleteError } = await supabase
          .from('courts')
          .delete()
          .eq('venue_id', venue.id);

        if (deleteError) throw deleteError;
      } else {
        // Create new venue
        const { data: newVenue, error: insertError } = await supabase
          .from('venues')
          .insert([venueData])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newVenue) throw new Error('Failed to create venue');
        venueId = newVenue.id;
      }

      // Prepare courts data
      const courts = [
        ...formData.indoorCourts.map(court => ({
          venue_id: venueId,
          court_number: parseInt(court.number),
          court_type: court.type,
          is_indoor: true
        })),
        ...formData.outdoorCourts.map(court => ({
          venue_id: venueId,
          court_number: parseInt(court.number),
          court_type: court.type,
          is_indoor: false
        }))
      ];

      // Insert courts one by one to prevent batch insert issues
      for (const court of courts) {
        const { error: courtError } = await supabase
          .from('courts')
          .insert([court]);

        if (courtError) {
          throw new Error(`Failed to create court ${court.court_number}: ${courtError.message}`);
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCourt = (type: 'indoor' | 'outdoor') => {
    const courts = type === 'indoor' ? formData.indoorCourts : formData.outdoorCourts;
    const newCourt: Court = {
      number: '',
      type: 'outdoor_surface',
      isIndoor: type === 'indoor'
    };
    
    setFormData({
      ...formData,
      [type === 'indoor' ? 'indoorCourts' : 'outdoorCourts']: [...courts, newCourt]
    });
  };

  const removeCourt = (type: 'indoor' | 'outdoor', index: number) => {
    const courts = type === 'indoor' ? formData.indoorCourts : formData.outdoorCourts;
    setFormData({
      ...formData,
      [type === 'indoor' ? 'indoorCourts' : 'outdoorCourts']: courts.filter((_, i) => i !== index)
    });
  };

  const updateCourt = (type: 'indoor' | 'outdoor', index: number, updates: Partial<Court>) => {
    const courts = type === 'indoor' ? formData.indoorCourts : formData.outdoorCourts;
    const updatedCourts = courts.map((court, i) => 
      i === index ? { ...court, ...updates } : court
    );
    
    setFormData({
      ...formData,
      [type === 'indoor' ? 'indoorCourts' : 'outdoorCourts']: updatedCourts
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">
        {venue ? 'Edit Venue' : 'Add New Venue'}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Venue Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              required
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Indoor Courts</h3>
              <button
                type="button"
                onClick={() => addCourt('indoor')}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} className="mr-1" /> Add Court
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.indoorCourts.map((court, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                  <input
                    type="number"
                    value={court.number}
                    onChange={(e) => updateCourt('indoor', index, { number: e.target.value })}
                    placeholder="Court #"
                    className="w-24 rounded-lg border-gray-300"
                    min="1"
                    required
                  />
                  <select
                    value={court.type}
                    onChange={(e) => updateCourt('indoor', index, { 
                      type: e.target.value as Court['type']
                    })}
                    className="rounded-lg border-gray-300"
                  >
                    <option value="outdoor_surface">Outdoor Surface</option>
                    <option value="gym">Gym</option>
                    <option value="sport_court">Sport Court</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCourt('indoor', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Outdoor Courts</h3>
              <button
                type="button"
                onClick={() => addCourt('outdoor')}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} className="mr-1" /> Add Court
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.outdoorCourts.map((court, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                  <input
                    type="number"
                    value={court.number}
                    onChange={(e) => updateCourt('outdoor', index, { number: e.target.value })}
                    placeholder="Court #"
                    className="w-24 rounded-lg border-gray-300"
                    min="1"
                    required
                  />
                  <select
                    value={court.type}
                    onChange={(e) => updateCourt('outdoor', index, { 
                      type: e.target.value as Court['type']
                    })}
                    className="rounded-lg border-gray-300"
                  >
                    <option value="outdoor_surface">Outdoor Surface</option>
                    <option value="gym">Gym</option>
                    <option value="sport_court">Sport Court</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCourt('outdoor', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : venue ? (
              'Update Venue'
            ) : (
              'Create Venue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}