import React from 'react';
import { Calendar, MapPin, Users, Clock, Trash2, ArrowRight } from 'lucide-react';

export default function TripCard({ trip, onSelectTrip, onDeleteTrip, currentUserId }) {
  // Calculate countdown days
  const getCountdown = (startDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDateStr);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} days away`;
    if (diffDays === 0) return `Starts today! 🎉`;
    return `Completed`;
  };

  const countdownText = getCountdown(trip.start_date);
  const isOwner = trip.owner_id === currentUserId;

  return (
    <div
      onClick={() => onSelectTrip(trip)}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      {/* Cover Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={trip.cover_image && trip.cover_image !== 'default' ? trip.cover_image : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Countdown Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-teal-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>{countdownText}</span>
        </div>

        {/* Delete button (Owner only) */}
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTrip(trip.id);
            }}
            title="Delete trip"
            className="absolute top-3 right-3 p-2 bg-slate-900/40 hover:bg-rose-600 text-white/80 hover:text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Trip Title & Destination */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="text-xl font-bold line-clamp-1 leading-tight group-hover:text-teal-200 transition-colors">
            {trip.title}
          </h3>
          <div className="flex items-center space-x-1 text-slate-300 text-xs mt-1">
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>
        </div>
      </div>

      {/* Card Body & Collaborators */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center text-xs text-slate-500 space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {trip.start_date} to {trip.end_date}
            </span>
          </div>

          {trip.description && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
              "{trip.description}"
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {/* Member Avatars */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2 overflow-hidden">
              {trip.members && trip.members.slice(0, 4).map((m, idx) => (
                <div
                  key={m.id || idx}
                  title={m.full_name}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold text-xs flex items-center justify-center shadow-sm"
                >
                  {m.full_name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {trip.members?.length || 1} friend{(trip.members?.length || 1) > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center text-teal-600 font-semibold text-xs group-hover:translate-x-1 transition-transform">
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
