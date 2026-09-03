import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import {
  fetchItinerary,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem
} from '../../api/itinerary';

export default function ItineraryView({ trip }) {
  const [items, setItems] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    day_number: 1,
    title: '',
    start_time: '10:00 AM',
    end_time: '12:00 PM',
    location: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Compute total trip days
  const calculateDays = () => {
    if (!trip.start_date || !trip.end_date) return [1, 2, 3];
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const daysCount = isNaN(diffDays) || diffDays <= 0 ? 3 : Math.min(diffDays, 14);
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  const dayList = calculateDays();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchItinerary(trip.id);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load itinerary activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      loadData();
    }
  }, [trip?.id]);

  const openAddModal = (dayNum = selectedDay) => {
    setEditingItem(null);
    setFormData({
      day_number: dayNum,
      title: '',
      start_time: '10:00 AM',
      end_time: '12:00 PM',
      location: '',
      notes: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      day_number: item.day_number,
      title: item.title,
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      location: item.location || '',
      notes: item.notes || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setError('Activity title is required.');

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingItem) {
        await updateItineraryItem(trip.id, editingItem.id, {
          day_number: parseInt(formData.day_number, 10),
          title: formData.title.trim(),
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location.trim(),
          notes: formData.notes.trim(),
        });
        setSuccessMsg('Activity updated successfully!');
      } else {
        await createItineraryItem(trip.id, {
          day_number: parseInt(formData.day_number, 10),
          title: formData.title.trim(),
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location.trim(),
          notes: formData.notes.trim(),
          order_index: items.filter((i) => i.day_number === formData.day_number).length,
        });
        setSuccessMsg('New activity added to itinerary!');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this activity?')) return;
    try {
      await deleteItineraryItem(trip.id, itemId);
      setSuccessMsg('Activity removed.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete activity');
    }
  };

  const handleMoveOrder = async (item, direction) => {
    const dayItems = items.filter((i) => i.day_number === item.day_number);
    const currentIndex = dayItems.findIndex((i) => i.id === item.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= dayItems.length) return;

    const targetItem = dayItems[targetIndex];
    try {
      await Promise.all([
        updateItineraryItem(trip.id, item.id, { order_index: targetIndex }),
        updateItineraryItem(trip.id, targetItem.id, { order_index: currentIndex }),
      ]);
      await loadData();
    } catch (err) {
      setError('Failed to reorder items');
    }
  };

  const filteredItems = selectedDay === 'all'
    ? items
    : items.filter((item) => item.day_number === selectedDay);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Itinerary Schedule</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {trip.title} Itinerary
          </h2>
          <p className="text-teal-100 text-xs">
            Organize daily sight-seeing, activities, meals, and times for {trip.destination}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            title="Refresh Itinerary"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => openAddModal(selectedDay === 'all' ? 1 : selectedDay)}
            className="flex items-center space-x-2 bg-white text-teal-800 hover:bg-teal-50 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs overflow-x-auto">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedDay === 'all'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Days ({items.length})
        </button>

        {dayList.map((dayNum) => {
          const dayCount = items.filter((i) => i.day_number === dayNum).length;
          const isSelected = selectedDay === dayNum;
          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDay(dayNum)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {dayNum}</span>
              {dayCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white text-teal-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {dayCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Activities Timeline / Cards List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {selectedDay === 'all' ? 'Complete Trip Schedule' : `Day ${selectedDay} Plan`}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredItems.length} Activity{filteredItems.length !== 1 ? 'ies' : ''}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-slate-100 rounded-2xl"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No activities scheduled yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click below to add your first activity for {selectedDay === 'all' ? 'Day 1' : `Day ${selectedDay}`}!
            </p>
            <button
              onClick={() => openAddModal(selectedDay === 'all' ? 1 : selectedDay)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Activity</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="relative pl-10 p-4 rounded-2xl border border-slate-100 hover:border-teal-200 transition-all bg-slate-50/50 hover:bg-white hover:shadow-md group space-y-2"
              >
                {/* Timeline Node Dot */}
                <div className="absolute left-2.5 top-5 w-3.5 h-3.5 rounded-full bg-teal-500 ring-4 ring-teal-100 group-hover:scale-110 transition-transform"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md uppercase">
                        Day {item.day_number}
                      </span>

                      {(item.start_time || item.end_time) && (
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-teal-600" />
                          {item.start_time} {item.end_time ? `- ${item.end_time}` : ''}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-base">{item.title}</h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMoveOrder(item, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30 rounded cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(item, 'down')}
                      disabled={idx === filteredItems.length - 1}
                      className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30 rounded cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Edit Activity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.location && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                )}

                {item.notes && (
                  <div className="flex items-start space-x-1.5 text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{item.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {editingItem ? 'Edit Activity' : 'Add Activity to Itinerary'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Day *</label>
                <select
                  value={formData.day_number}
                  onChange={(e) => setFormData({ ...formData, day_number: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 bg-white font-bold text-slate-800"
                >
                  {dayList.map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Activity Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Scuba Diving, Dinner at Beach Shack"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white placeholder-slate-400 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white placeholder-slate-400 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 01:00 PM"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Island, Goa"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wear swimwear, carry extra cash..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white placeholder-slate-400 font-medium resize-none"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
