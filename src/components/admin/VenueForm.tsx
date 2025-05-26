import { useState } from 'react';
import { Venue } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Loader, AlertCircle, Plus, Minus } from 'lucide-react';

interface VenueFormProps {
  venue?: Venue;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CourtConfig {
  count: number;
  type: 'outdoor_surface' | 'gym' | 'sport_court' | 'other';
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
    indoorCourts: { count: 0, type: 'outdoor_surface' as const },
    outdoorCourts: { count: 0, type: 'outdoor_surface' as const }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      console.log('Starting venue submission process...', { isUpdate: !!venue });
      setLoading(true);
      setError(null);

      const venueData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        description: formData.description,
        user_id: user.id
      };

      console.log('Prepared venue data:', venueData);
      let venueId: string;

      if (venue) {
        console.log('Updating existing venue:', venue.id);
        
        // First, delete all existing courts
        console.log('Deleting existing courts for venue:', venue.id);
        const { error: deleteError } = await supabase
          .from('courts')
          .delete()
          .eq('venue_id', venue.id);

        if (deleteError) {
          console.error('Error deleting existing courts:', deleteError);
          throw deleteError;
        }
        console.log('Successfully deleted existing courts');

        // Then update the venue
        const { error: updateError } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', venue.id);

        if (updateError) throw updateError;
        venueId = venue.id;
      } else {
        console.log('Creating new venue');
        const { data: newVenue, error: insertError } = await supabase
          .from('venues')
          .insert([venueData])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newVenue) throw new Error('Failed to create venue');
        venueId = newVenue.id;
        console.log('New venue created with ID:', venueId);
      }

      // Create courts array
      const courts = [];
      let courtNumber = 1;

      console.log('Preparing courts data:', {
        indoorCourts: formData.indoorCourts,
        outdoorCourts: formData.outdoorCourts
      });

      // Add indoor courts
      for (let i = 0; i < formData.indoorCourts.count; i++) {
        courts.push({
          venue_id: venueId,
          court_number: courtNumber++,
          court_type: formData.indoorCourts.type,
          is_indoor: true
        });
      }

      // Add outdoor courts
      for (let i = 0; i < formData.outdoorCourts.count; i++) {
        courts.push({
          venue_id: venueId,
          court_number: courtNumber++,
          court_type: formData.outdoorCourts.type,
          is_indoor: false
        });
      }

      // Insert courts if there are any
      if (courts.length > 0) {
        console.log('Inserting courts:', courts);
        const { error: courtsError } = await supabase
          .from('courts')
          .insert(courts);

        if (courtsError) {
          console.error('Error inserting courts:', courtsError);
          throw courtsError;
        }
        console.log('Successfully inserted courts');
      }

      console.log('Venue and courts saved successfully');
      onSuccess();
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCourtCount = (type: 'indoor' | 'outdoor', increment: boolean) => {
    const field = type === 'indoor' ? 'indoorCourts' : 'outdoorCourts';
    const currentCount = formData[field].count;
    const newCount = increment 
      ? Math.min(currentCount + 1, 99)
      : Math.max(currentCount - 1, 0);

    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        count: newCount
      }
    });
  };

  const courtTypeOptions = [
    { value: 'outdoor_surface', label: 'Outdoor Surface' },
    { value: 'gym', label: 'Gym' },
    { value: 'sport_court', label: 'Sport Court' },
    { value: 'other', label: 'Other' }
  ];

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
            <h3 className="text-lg font-medium mb-4">Indoor Courts</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => updateCourtCount('indoor', false)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center font-medium">{formData.indoorCourts.count}</span>
                <button
                  type="button"
                  onClick={() => updateCourtCount('indoor', true)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Plus size={20} />
                </button>
              </div>
              <select
                value={formData.indoorCourts.type}
                onChange={(e) => setFormData({
                  ...formData,
                  indoorCourts: {
                    ...formData.indoorCourts,
                    type: e.target.value as CourtConfig['type']
                  }
                })}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {courtTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Outdoor Courts</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => updateCourtCount('outdoor', false)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center font-medium">{formData.outdoorCourts.count}</span>
                <button
                  type="button"
                  onClick={() => updateCourtCount('outdoor', true)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Plus size={20} />
                </button>
              </div>
              <select
                value={formData.outdoorCourts.type}
                onChange={(e) => setFormData({
                  ...formData,
                  outdoorCourts: {
                    ...formData.outdoorCourts,
                    type: e.target.value as CourtConfig['type']
                  }
                })}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {courtTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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