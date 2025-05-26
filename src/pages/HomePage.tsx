import Layout from '../components/layout/Layout';
import VenueList from '../components/venues/VenueList';
import { Search, Map, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <Layout>
      <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 pb-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6511705/pexels-photo-6511705.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260')] bg-center bg-cover opacity-10"></div>
        </div>
        
        <div className="relative container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Find and Rate the Best Pickleball Courts
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Know which courts are worth playing on before you book your next game.
            </p>
            
            <form className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for venues by name or location..."
                className="w-full px-5 py-4 rounded-full border-0 focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
              >
                <Search size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <Map className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Find Courts</h3>
            <p className="text-gray-600">
              Discover pickleball courts in your area and read detailed information about each venue.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rate Courts</h3>
            <p className="text-gray-600">
              Share your experience by rating courts based on surface, net condition, lighting and more.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <Search className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Make Better Decisions</h3>
            <p className="text-gray-600">
              Book with confidence knowing which courts are worth your time and money.
            </p>
          </motion.div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Popular Venues</h2>
        
        <VenueList />
      </div>
    </Layout>
  );
}