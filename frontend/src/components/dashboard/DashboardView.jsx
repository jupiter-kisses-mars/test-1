import React, { useState, useEffect } from 'react';
import { Plus, Compass, LogOut, User, RefreshCw, DollarSign, Map } from 'lucide-react';
import { fetchTrips, createTrip, deleteTrip } from '../../api/trips';
import TripCard from './TripCard';
import CreateTripModal from './CreateTripModal';
import TripDetailsView from './TripDetailsView';
import ExpenseCalculatorView from './ExpenseCalculatorView';

export default function DashboardView({ user, onLogout }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewTab, setViewTab] = useState('trips'); // 'trips' | 'expenses'

  const loadTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTrips();
      setTrips(data);
    } catch (err) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleCreateTrip = async (tripData) => {
    const newTrip = await createTrip(tripData);
    setTrips([newTrip, ...trips]);
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTrip(tripId);
      setTrips(trips.filter((t) => t.id !== tripId));
      if (selectedTrip?.id === tripId) setSelectedTrip(null);
    } catch (err) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleUpdateTrip = (updatedTrip) => {
    setTrips(trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    if (selectedTrip?.id === updatedTrip.id) {
      setSelectedTrip(updatedTrip);
    }
  };

  if (selectedTrip) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <TripDetailsView
            trip={selectedTrip}
            currentUser={user}
            onBack={() => setSelectedTrip(null)}
            onUpdateTrip={handleUpdateTrip}
          />

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                TripMate
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-2xl">
              <button
                onClick={() => setViewTab('trips')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewTab === 'trips'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-teal-600" />
                <span>Group Trips</span>
              </button>

              <button
                onClick={() => setViewTab('expenses')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewTab === 'expenses'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Expense Calculator</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>{user?.full_name || user?.email}</span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Hero & Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8 space-y-8">
        {viewTab === 'expenses' ? (
          <ExpenseCalculatorView />
        ) : (
          <>
            {/* Banner Section */}
            <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-xl z-10">
                <span className="text-xs uppercase font-bold tracking-widest text-teal-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  Dashboard
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Ready for your next adventure?
                </h1>
                <p className="text-teal-100 text-sm leading-relaxed">
                  Create a group trip, invite your friends, and seamlessly plan itineraries, split expenses, and bookmark places together.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="z-10 flex items-center space-x-2 bg-white text-teal-800 hover:bg-teal-50 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 text-teal-600" />
                <span>Create New Trip</span>
              </button>
            </div>

            {/* Trips Grid Header */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-800">Your Trips</h2>
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {trips.length}
                </span>
              </div>

              <button
                onClick={loadTrips}
                title="Refresh trips"
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-teal-600 font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl">
                {error}
              </div>
            )}

            {/* Trips Grid / Empty State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-200 rounded-3xl h-72"></div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No trips planned yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't created or joined any group trips yet. Click below to start planning your first trip!
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Trip</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onSelectTrip={setSelectedTrip}
                    onDeleteTrip={handleDeleteTrip}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <CreateTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTrip={handleCreateTrip}
      />
    </div>
  );
}
