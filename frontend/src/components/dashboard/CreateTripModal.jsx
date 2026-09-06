import React, { useState } from 'react';
import { X, Calendar, MapPin, Image as ImageIcon, UserPlus, Sparkles } from 'lucide-react';

const COVER_OPTIONS = [
  { id: 'beach', name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { id: 'mountain', name: 'Mountain Adventure', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 'city', name: 'City Exploration', url: 'https://images.unsplash.com/photo-1477959858617-67f30ac72604?auto=format&fit=crop&w=800&q=80' },
  { id: 'roadtrip', name: 'Scenic Roadtrip', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80' },
];

export default function CreateTripModal({ isOpen, onClose, onCreateTrip }) {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
    cover_image: COVER_OPTIONS[0].url,
    invite_emails_str: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.destination || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields (Title, Destination, Dates).');
      return;
    }

    // Parse emails split by comma or newline with email pattern validation
    const invite_emails = formData.invite_emails_str
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && /\S+@\S+\.\S+/.test(e));


    setLoading(true);
    try {
      await onCreateTrip({
        title: formData.title,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description,
        cover_image: formData.cover_image,
        invite_emails: invite_emails,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <h2 className="text-lg font-bold text-slate-900">Create a New Trip</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-900">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Trip Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Goa Beach Vacation 2026"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Destination *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Goa, India"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm text-slate-900"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm text-slate-900"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Select Cover Image Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COVER_OPTIONS.map((cover) => (
                <div
                  key={cover.id}
                  onClick={() => setFormData({ ...formData, cover_image: cover.url })}
                  className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    formData.cover_image === cover.url
                      ? 'border-teal-700 ring-2 ring-teal-200'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {cover.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Invite Friends (Emails separated by comma)
            </label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="friend1@example.com, friend2@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                value={formData.invite_emails_str}
                onChange={(e) => setFormData({ ...formData, invite_emails_str: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What is the plan for this trip?"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
