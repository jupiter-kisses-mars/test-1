import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Plus, DollarSign, Map, MessageSquare, Compass } from 'lucide-react';
import { addTripMember } from '../../api/trips';
import ExpenseCalculatorView from './ExpenseCalculatorView';
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
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 min-h-[220px] flex flex-col justify-between p-6 md:p-8 text-white">
        <img
          src={trip.cover_image && trip.cover_image !== 'default' ? trip.cover_image : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Controls */}
        <div className="relative z-10 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <span className="bg-teal-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-teal-400/30">
            Trip Workspace
          </span>
        </div>

        {/* Trip Meta Header */}
        <div className="relative z-10 mt-6 space-y-2">
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-medium tracking-wide uppercase">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{trip.title}</h1>
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <div className="flex items-center space-x-1">
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
          { id: 'expenses', label: 'Expense Calculator', icon: DollarSign, badge: 'Live' },
          { id: 'itinerary', label: 'Itinerary Planner', icon: Map, badge: 'Live' },
          { id: 'places', label: 'Places (Feature 4)', icon: MapPin, badge: 'Next' },
          { id: 'chat', label: 'Group Chat', icon: MessageSquare, badge: 'Live' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md'
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
      {activeTab === 'expenses' ? (
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
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Feature Modules Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setActiveTab('expenses')}
                    className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Live & Connected
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Expense Calculator</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage members, add expenses, equal/custom split, preview calculations, balances & settlements.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('itinerary')}
                    className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                        <Map className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Live & Active
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">2. Itinerary Planner</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Organize activities by day, timeslots, locations & reorder timeline schedules.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Coming Next
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">4. Places & Suggestions</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Bookmark food spots, activities, shopping centers & give ratings.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('chat')}
                    className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Live & Connected
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">5. Trip Collaboration Chat</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Real-time group conversation & notes for fast decision making.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                <div className="inline-block p-3 bg-teal-100 text-teal-700 rounded-2xl">
                  <Compass className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg capitalize">{activeTab} Module</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This module is queued as the next collaboration step for TripMate! Dashboard functionality is active.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar: Collaborators & Invites */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Trip Collaborators</h3>
                </div>
                <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full">
                  {trip.members?.length || 1}
                </span>
              </div>

              {/* Members List */}
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {trip.members && trip.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{member.full_name}</p>
                        <p className="text-[10px] text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      member.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Invite Form */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-2">Invite a Friend</p>
                <form onSubmit={handleAddMember} className="space-y-2">
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white placeholder-slate-400 font-medium"
                    required
                  />
                  <button
                    type="submit"
                    disabled={addingMember}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{addingMember ? 'Adding...' : 'Add Friend'}</span>
                  </button>
                </form>

                {memberMessage.text && (
                  <p className={`text-[11px] mt-2 ${
                    memberMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
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
