import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Star,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Bookmark,
  Sparkles,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Utensils,
  Landmark,
  ShoppingBag,
  Compass,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  fetchPlaces,
  fetchPlacesSummary,
  createPlace,
  updatePlace,
  updatePlaceStatus,
  updatePlaceRating,
  deletePlace
} from '../../api/places';
import AddEditPlaceModal from './AddEditPlaceModal';

const CATEGORIES = ['All', 'Food', 'Tourist', 'Shopping', 'Activities'];
const STATUS_OPTIONS = ['All', 'Want to Visit', 'Visited'];
const SORT_OPTIONS = [
  { id: 'recently_added', label: 'Recently Added' },
  { id: 'name', label: 'Place Name (A-Z)' },
  { id: 'rating', label: 'Rating (Highest)' },
];

const CATEGORY_CONFIG = {
  Food: {
    icon: Utensils,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    emoji: '🍔',
  },
  Tourist: {
    icon: Landmark,
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    emoji: '🏛',
  },
  Shopping: {
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    emoji: '🛍',
  },
  Activities: {
    icon: Compass,
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    emoji: '🎯',
  },
};

// Curated suggestion seed templates matching destinations/categories
const SUGGESTION_TEMPLATES = [
  {
    name: 'Seafood Beach Shack',
    category: 'Food',
    location: 'Coastal Beachfront',
    notes: 'Famous for fresh butter garlic prawns and sunset views',
    status: 'Want to Visit',
  },
  {
    name: 'Historic Hilltop Fort & Lighthouse',
    category: 'Tourist',
    location: 'Old Town / Coastline',
    notes: 'Panoramic 360-degree ocean view and Portuguese architecture',
    status: 'Want to Visit',
  },
  {
    name: 'Night Flea Market & Live Music',
    category: 'Shopping',
    location: 'Town Square / Beach Road',
    notes: 'Handmade crafts, spices, boho clothes, and street food stalls',
    status: 'Want to Visit',
  },
  {
    name: 'Island Scuba & Snorkeling Safari',
    category: 'Activities',
    location: 'Harbor Pier',
    notes: 'Guided marine life exploration, coral reef diving with gear included',
    status: 'Want to Visit',
  },
  {
    name: 'Traditional Spice Plantation Tour',
    category: 'Activities',
    location: 'Valley Farm Estate',
    notes: 'Organic spice tasting, elephant showers, and authentic local buffet lunch',
    status: 'Want to Visit',
  },
  {
    name: 'Artisan Cafe & Bakery',
    category: 'Food',
    location: 'Heritage Quarter',
    notes: 'Specialty pour-over coffee, sourdough pizza, and homemade gelato',
    status: 'Want to Visit',
  },
];

export default function PlacesView({ tripId = null, tripTitle = null }) {
  const [places, setPlaces] = useState([]);
  const [summary, setSummary] = useState({
    total_places: 0,
    total_visited: 0,
    total_want_to_visit: 0,
    average_rating: 0,
    category_counts: { Food: 0, Tourist: 0, Shopping: 0, Activities: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recently_added');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placeToEdit, setPlaceToEdit] = useState(null);

  // Load places and summary
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [placesData, summaryData] = await Promise.all([
        fetchPlaces({
          search: searchQuery,
          category: selectedCategory,
          status: selectedStatus,
          tripId: tripId,
          sortBy: sortBy,
        }),
        fetchPlacesSummary(tripId),
      ]);
      setPlaces(placesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message || 'Failed to load places data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, tripId]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Add or Edit Place handler
  const handleSavePlace = async (payload, editId) => {
    try {
      if (editId) {
        await updatePlace(editId, payload);
        showSuccess(`Place "${payload.name}" updated successfully!`);
      } else {
        await createPlace(payload);
        showSuccess(`Place "${payload.name}" added to your saved list!`);
      }
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  // Toggle status (Visited <-> Want to Visit)
  const handleToggleStatus = async (place, e) => {
    e.stopPropagation();
    const newStatus = place.status === 'Visited' ? 'Want to Visit' : 'Visited';
    try {
      await updatePlaceStatus(place.id, newStatus);
      showSuccess(`Marked "${place.name}" as ${newStatus}`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update place status');
    }
  };

  // Quick rate place
  const handleQuickRate = async (place, newRating, e) => {
    e.stopPropagation();
    try {
      const finalRating = place.rating === newRating ? null : newRating;
      await updatePlaceRating(place.id, finalRating);
      showSuccess(
        finalRating
          ? `Rated "${place.name}" ${finalRating} stars ⭐`
          : `Removed rating for "${place.name}"`
      );
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update rating');
    }
  };

  // Delete Place
  const handleDeletePlace = async (place, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${place.name}"?`)) return;
    try {
      await deletePlace(place.id);
      showSuccess(`Deleted "${place.name}"`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete place');
    }
  };

  // Add from suggestions
  const handleAddSuggestion = async (suggestion) => {
    try {
      await createPlace({
        ...suggestion,
        trip_id: tripId,
      });
      showSuccess(`Added "${suggestion.name}" to your places!`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to add suggestion');
    }
  };

  // Filter dynamic suggestions: hide suggestions that user has already added
  const availableSuggestions = useMemo(() => {
    const existingNames = new Set(places.map((p) => p.name.toLowerCase()));
    return SUGGESTION_TEMPLATES.filter((s) => !existingNames.has(s.name.toLowerCase()));
  }, [places]);

  return (
    <div className="space-y-8 font-sans text-slate-800 animate-fadeIn">
      {/* Top Header & Add Place Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-2xl shadow-md">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Places & Suggestions
              </h1>
              <p className="text-xs text-slate-500">
                {tripTitle ? `Curated bookmarks & places for ${tripTitle}` : 'Explore, bookmark, rate and organize your favorite spots'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={loadData}
            title="Refresh Places"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setPlaceToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Place</span>
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

      {/* Dashboard Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Places */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Places</p>
            <p className="text-2xl font-extrabold text-slate-800">{summary.total_places}</p>
          </div>
        </div>

        {/* Visited Places */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visited</p>
            <p className="text-2xl font-extrabold text-emerald-600">{summary.total_visited}</p>
          </div>
        </div>

        {/* Want to Visit */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Want to Visit</p>
            <p className="text-2xl font-extrabold text-amber-600">{summary.total_want_to_visit}</p>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Rating</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {summary.average_rating > 0 ? `${summary.average_rating} ⭐` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Counts Pill Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Food', 'Tourist', 'Shopping', 'Activities'].map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const count = summary.category_counts[cat] || 0;
          return (
            <div
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedCategory === cat
                  ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-200'
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{cfg.emoji}</span>
                <span className="text-xs font-bold text-slate-700">{cat}</span>
              </div>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Search, Category Filters, Status Filters, & Sort Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        {/* Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search places by name, location, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/60 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-bold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Badges: Category & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat !== 'All' && `${CATEGORY_CONFIG[cat]?.emoji} `}
                {cat}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'Visited' && '🟢 '}
                {st === 'Want to Visit' && '🟡 '}
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Places Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800">Saved Places</h2>
            <span className="bg-teal-100 text-teal-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {places.length}
            </span>
          </div>

          {(selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-200 rounded-3xl h-56"></div>
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No places match your search or filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the button below to add your first destination or clear your filters to view all places.
            </p>
            <button
              onClick={() => {
                setPlaceToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add a Place</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => {
              const catCfg = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.Tourist;
              const isVisited = place.status === 'Visited';

              return (
                <div
                  key={place.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
                >
                  {/* Top Bar: Category Pill, Status Toggle, Action Buttons */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      {/* Category Badge */}
                      <span className={`inline-flex items-center space-x-1 text-[11px] font-extrabold px-3 py-1 rounded-full ${catCfg.bg} ${catCfg.text}`}>
                        <span>{catCfg.emoji}</span>
                        <span>{place.category}</span>
                      </span>

                      {/* Edit & Delete Controls */}
                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setPlaceToEdit(place);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Place"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePlace(place, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Place"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Place Name & Location */}
                    <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-teal-700 transition-colors">
                      {place.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{place.location}</span>
                    </div>

                    {/* Personal Notes */}
                    {place.notes && (
                      <p className="text-xs text-slate-600 mt-3 p-3 bg-slate-50 rounded-2xl italic line-clamp-2 border border-slate-100">
                        "{place.notes}"
                      </p>
                    )}
                  </div>

                  {/* Rating Stars & Interactive Status Toggle */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Interactive Stars Rating */}
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isFilled = place.rating && place.rating >= starVal;
                          return (
                            <button
                              key={starVal}
                              onClick={(e) => handleQuickRate(place, starVal, e)}
                              className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              title={`Rate ${starVal} Stars`}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isFilled
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                        <span className="text-[11px] font-bold text-slate-600 ml-1.5">
                          {place.rating ? `${place.rating}.0` : <span className="text-slate-400 text-[10px]">Unrated</span>}
                        </span>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        onClick={(e) => handleToggleStatus(place, e)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          isVisited
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {isVisited ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Visited</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                            <span>Want to Visit</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Google Maps Link */}
                    {place.maps_url && (
                      <a
                        href={place.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline pt-1"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✨ Suggestions Section */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 rounded-3xl p-6 md:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">✨ Suggestions</h3>
            <p className="text-xs text-teal-200">
              Recommended places you may want to add to your trip bookmarks
            </p>
          </div>
        </div>

        {availableSuggestions.length === 0 ? (
          <p className="text-xs text-teal-200 italic">
            You have added all suggested spots to your saved list! Fantastic exploration!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSuggestions.map((sug, idx) => {
              const catCfg = CATEGORY_CONFIG[sug.category] || CATEGORY_CONFIG.Tourist;
              return (
                <div
                  key={idx}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-teal-100">
                        {catCfg.emoji} {sug.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{sug.name}</h4>
                    <p className="text-[11px] text-teal-200 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>{sug.location}</span>
                    </p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 italic">
                      "{sug.notes}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddSuggestion(sug)}
                    className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to My Places</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Place Modal */}
      <AddEditPlaceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPlaceToEdit(null);
        }}
        onSave={handleSavePlace}
        placeToEdit={placeToEdit}
        tripId={tripId}
      />
    </div>
  );
}
