import { useState } from 'react';
import { Venue } from '../../types';
import { supabase } from '../../lib/supabase';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import VenueForm from './VenueForm';

interface AdminVenueListProps {
  venues: Venue[];
  onVenueUpdated: () => void;
}

export default function AdminVenueList({ venues, onVenueUpdated }: AdminVenueListProps) {
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);

      if (deleteError) throw deleteError;

      onVenueUpdated();
    } catch (err: any) {
      console.error('Error deleting venue:', err);
      setError('Failed to delete venue');
    }
  };

  if (venues.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-600">No venues found. Add your first venue to get started!</p>
      </div>
    );
  }

  if (editingVenue) {
    return (
      <VenueForm
        venue={editingVenue}
        onSuccess={() => {
          setEditingVenue(null);
          onVenueUpdated();
        }}
        onCancel={() => setEditingVenue(null)}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {venues.map((venue) => (
              <tr key={venue.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {venue.city}, {venue.state}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingVenue(venue)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(venue.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}