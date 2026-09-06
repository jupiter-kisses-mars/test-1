import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Plus, DollarSign, Map, MessageSquare, Compass } from 'lucide-react';
import { addTripMember } from '../../api/trips';
import ExpenseCalculatorView from './ExpenseCalculatorView';
import PlacesView from './PlacesView';
import ItineraryView from './ItineraryView';
import ChatView from './ChatView';

export default function TripDetailsView({ trip, currentUser, onBack, onUpdateTrip }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberMessage, setMemberMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('overview');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setAddingMember(true);
    setMemberMessage({ type: '', text: '' });

    try {
      const updatedTrip = await addTripMember(trip.id, inviteEmail);
      onUpdateTrip(updatedTrip);
      setInviteEmail('');
      setMemberMessage({ type: 'success', text: 'Friend added to trip successfully!' });
    } catch (err) {
      setMemberMessage({ type: 'error', text: err.message || 'Failed to add friend' });
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-xl overflow-hidden shadow-sm bg-slate-900 min-h-[220px] flex flex-col justify-between p-6 md:p-8 text-white border border-slate-200">
        <img
          src={trip.cover_image && trip.cover_image !== 'default' ? trip.cover_image : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        {/* Top Controls */}
        <div className="relative z-10 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Trip Meta Header */}
        <div className="relative z-10 mt-6 space-y-2">
          <div className="flex items-center space-x-2 text-teal-300 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.title}</h1>
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>{trip.start_date} - {trip.end_date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Compass },
          { id: 'places', label: 'Places', icon: MapPin },
          { id: 'expenses', label: 'Expenses', icon: DollarSign },
          { id: 'itinerary', label: 'Itinerary', icon: Map },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Display */}
      {activeTab === 'places' ? (
        <div className="w-full pt-2">
          <PlacesView tripId={trip.id} tripTitle={trip.title} />
        </div>
      ) : activeTab === 'expenses' ? (
        <div className="w-full pt-2">
          <ExpenseCalculatorView tripId={trip.id} />
        </div>
      ) : activeTab === 'itinerary' ? (
        <div className="w-full pt-2">
          <ItineraryView trip={trip} />
        </div>
      ) : activeTab === 'chat' ? (
        <div className="w-full pt-2">
          <ChatView trip={trip} currentUser={currentUser} />
        </div>
      ) : (
        /* Grid Content Layout for Overview & Other Tabs */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Trip Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTab('places')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="p-2.5 bg-slate-50 text-teal-700 rounded-lg inline-block mb-3 group-hover:bg-teal-50 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">Places</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Bookmark spots, rate places, and view recommendations.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('expenses')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="p-2.5 bg-slate-50 text-teal-700 rounded-lg inline-block mb-3 group-hover:bg-teal-50 transition-colors">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">Expenses</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage budgets, add expenses, and calculate settlements.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('itinerary')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="p-2.5 bg-slate-50 text-teal-700 rounded-lg inline-block mb-3 group-hover:bg-teal-50 transition-colors">
                    <Map className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">Itinerary</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Organize activities by day and plan your schedule.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('chat')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="p-2.5 bg-slate-50 text-teal-700 rounded-lg inline-block mb-3 group-hover:bg-teal-50 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">Chat</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Real-time group conversation and notes for the trip.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Collaborators & Invites */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-teal-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Collaborators</h3>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full">
                  {trip.members?.length || 1}
                </span>
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {trip.members && trip.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-medium text-xs flex items-center justify-center">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{member.full_name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div>
                      {member.status === 'pending' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-100 text-slate-600">
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invite Form */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Invite someone</h4>
                <form onSubmit={handleAddMember} className="space-y-2">
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-900 bg-white placeholder-slate-400"
                    required
                  />

                  <button
                    type="submit"
                    disabled={addingMember}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{addingMember ? 'Sending Invite...' : 'Send Invite'}</span>
                  </button>
                </form>

                {memberMessage.text && (
                  <p className={`text-xs mt-2 ${
                    memberMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {memberMessage.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
