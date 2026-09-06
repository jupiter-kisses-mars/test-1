import React, { useState, useEffect } from 'react';
import { Plus, Compass, LogOut, User, RefreshCw, DollarSign, Map, Check, X, Clock, MapPin } from 'lucide-react';
import { fetchTrips, createTrip, deleteTrip, respondToTripInvitation } from '../../api/trips';
import TripCard from './TripCard';
import CreateTripModal from './CreateTripModal';
import TripDetailsView from './TripDetailsView';
import ExpenseCalculatorView from './ExpenseCalculatorView';
import PlacesView from './PlacesView';

export default function DashboardView({ user, onLogout }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewTab, setViewTab] = useState('trips'); // 'trips' | 'expenses' | 'places'
  const [actionLoading, setActionLoading] = useState(null);

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

  const handleRespondInvitation = async (tripId, status) => {
    setActionLoading(tripId);
    try {
      await respondToTripInvitation(tripId, status);
      await loadTrips();
    } catch (err) {
      alert(err.message || 'Failed to respond to invitation');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter pending invitations for current user
  const pendingInvitations = trips.filter((t) => {
    const myMemberRecord = t.members?.find((m) => m.id === user?.id || m.email === user?.email);
    return myMemberRecord && myMemberRecord.status === 'pending' && t.owner_id !== user?.id;
  });

  if (selectedTrip) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <TripDetailsView
            trip={selectedTrip}
            currentUser={user}
            onBack={() => setSelectedTrip(null)}
            onUpdateTrip={handleUpdateTrip}
            currentUserId={user?.id}
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
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewTab('trips')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewTab === 'trips'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className={`w-4 h-4 ${viewTab === 'trips' ? 'text-teal-700' : ''}`} />
                <span>Trips</span>
              </button>

              <button
                onClick={() => setViewTab('places')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewTab === 'places'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className={`w-4 h-4 ${viewTab === 'places' ? 'text-teal-700' : ''}`} />
                <span>Places</span>
              </button>

              <button
                onClick={() => setViewTab('expenses')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewTab === 'expenses'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className={`w-4 h-4 ${viewTab === 'expenses' ? 'text-teal-700' : ''}`} />
                <span>Expenses</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4 text-slate-500" />
              <span>{user?.full_name || user?.email}</span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-slate-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Hero & Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8 space-y-8">
        {viewTab === 'expenses' ? (
          <ExpenseCalculatorView />
        ) : viewTab === 'places' ? (
          <PlacesView />
        ) : (
          <>
            {/* Pending Invitations Section */}
            {pendingInvitations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-semibold text-sm">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span>Pending Trip Invitations ({pendingInvitations.length})</span>
                </div>
                <p className="text-sm text-blue-800">
                  You have been invited to collaborate on the following trip(s).
                </p>
                <div className="space-y-2">
                  {pendingInvitations.map((invTrip) => {
                    const ownerMember = invTrip.members?.find((m) => m.role === 'owner');
                    return (
                      <div
                        key={invTrip.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg border border-blue-100 shadow-sm gap-4"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-900">{invTrip.title}</h4>
                          <p className="text-sm text-slate-600">
                            Destination: <span className="font-medium text-slate-800">{invTrip.destination}</span> • Invited by:{' '}
                            <span className="font-medium text-slate-800">
                              {ownerMember?.full_name || 'Trip Owner'}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRespondInvitation(invTrip.id, 'accepted')}
                            disabled={actionLoading === invTrip.id}
                            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium text-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRespondInvitation(invTrip.id, 'rejected')}
                            disabled={actionLoading === invTrip.id}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Banner Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              <div className="space-y-1.5 max-w-xl">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Plan your next trip
                </h1>
                <p className="text-slate-600 text-sm">
                  Create a new group trip to manage itineraries, expenses, and places together.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Trip</span>
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
                  <div key={i} className="bg-slate-200 rounded-xl h-72"></div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">No trips yet</h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto mt-1">
                    You haven't created or joined any group trips yet. Start planning your first trip!
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center space-x-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Trip</span>
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
