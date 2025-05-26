import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Venue } from '../types';
import { Plus, Loader, AlertCircle } from 'lucide-react';
import AdminVenueList from '../components/admin/AdminVenueList';
import VenueForm from '../components/admin/VenueForm';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchVenues();
  }, [user, navigate]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (venuesError) throw venuesError;

      setVenues(data || []);
    } catch (err: any) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueCreated = () => {
    setShowForm(false);
    fetchVenues();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manage Venues</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Venue
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {showForm ? (
          <VenueForm onSuccess={handleVenueCreated} onCancel={() => setShowForm(false)} />
        ) : (
          <AdminVenueList venues={venues} onVenueUpdated={fetchVenues} />
        )}
      </div>
    </Layout>
  );
}