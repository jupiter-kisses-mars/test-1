import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Tag, Link2, FileText, CheckCircle2, Bookmark } from 'lucide-react';

const CATEGORIES = ['Food', 'Tourist', 'Shopping', 'Activities'];
const STATUSES = ['Want to Visit', 'Visited'];

export default function AddEditPlaceModal({
  isOpen,
  onClose,
  onSave,
  placeToEdit = null,
  tripId = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    location: '',
    rating: null,
    status: 'Want to Visit',
    notes: '',
    maps_url: '',
    trip_id: tripId || null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (placeToEdit) {
      setFormData({
        name: placeToEdit.name || '',
        category: placeToEdit.category || 'Food',
        location: placeToEdit.location || '',
        rating: placeToEdit.rating ?? null,
        status: placeToEdit.status || 'Want to Visit',
        notes: placeToEdit.notes || '',
        maps_url: placeToEdit.maps_url || '',
        trip_id: placeToEdit.trip_id || tripId || null,
      });
    } else {
      setFormData({
        name: '',
        category: 'Food',
        location: '',
        rating: null,
        status: 'Want to Visit',
        notes: '',
        maps_url: '',
        trip_id: tripId || null,
      });
    }
    setError('');
  }, [placeToEdit, isOpen, tripId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter place name');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please enter location');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        location: formData.location.trim(),
        status: formData.status,
        notes: formData.notes?.trim() || null,
        maps_url: formData.maps_url?.trim() || null,
        trip_id: formData.trip_id ? parseInt(formData.trip_id, 10) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      };

      await onSave(payload, placeToEdit?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save place');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <MapPin className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {placeToEdit ? 'Edit Place' : 'Add New Place'}
              </h2>
              <p className="text-xs text-teal-100">
                {placeToEdit ? 'Update details & rating' : 'Save places, food spots & tourist destinations'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Place Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Place Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Fisherman's Wharf, Baga Beach, Anjuna Flea Market"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Category *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium bg-white cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'Food' && '🍔 '}
                      {cat === 'Tourist' && '🏛 '}
                      {cat === 'Shopping' && '🛍 '}
                      {cat === 'Activities' && '🎯 '}
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Status *
              </label>
              <div className="relative">
                {formData.status === 'Visited' ? (
                  <CheckCircle2 className="absolute left-3 top-3 w-4 h-4 text-emerald-600" />
                ) : (
                  <Bookmark className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                )}
                <select
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium bg-white cursor-pointer"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st === 'Visited' ? '🟢 Visited' : '🟡 Want to Visit'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Location / Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Candolim Beach Road, North Goa"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Rating (1 to 5 stars) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rating {formData.status !== 'Visited' && <span className="normal-case font-normal text-slate-400">(Optional until visited)</span>}
              </label>
              {formData.rating && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: null })}
                  className="text-[11px] text-slate-400 hover:text-rose-500"
                >
                  Clear Rating
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isSelected = formData.rating && formData.rating >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: starValue })}
                    className="p-1 hover:scale-125 transition-transform"
                    title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        isSelected
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {formData.rating ? `${formData.rating}.0 / 5` : 'Not Rated'}
              </span>
            </div>
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Google Maps URL <span className="normal-case font-normal text-slate-400">(Optional — auto-generated if blank)</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                value={formData.maps_url}
                onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Personal Notes / Tips (Optional)
            </label>
            <div className="relative">
              <textarea
                rows={2}
                placeholder="e.g. Try the seafood curry, best sunset view from 5:30 PM, closed on Mondays..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none font-medium"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : placeToEdit ? 'Update Place' : 'Add Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
