import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Users,
  Calculator,
  ArrowRight,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  PieChart,
  Receipt,
  MapPin,
  Filter
} from 'lucide-react';
import {
  fetchUsers,
  createUser,
  deleteUser,
  fetchExpenses,
  previewCalculateExpense,
  createExpense,
  deleteExpense,
  fetchBalances,
  fetchSettlements,
  fetchDashboardSummary
} from '../../api/expenses';
import { fetchTrips, addTripMember } from '../../api/trips';

export default function ExpenseCalculatorView({ tripId: propTripId = null }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(propTripId || '');
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [addingUser, setAddingUser] = useState(false);

  // Expense Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedParticipants, setSelectedParticipants] = useState({}); // { [userId]: { selected: bool, share: string } }
  const [previewResult, setPreviewResult] = useState(null);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [calculatingPreview, setCalculatingPreview] = useState(false);

  // Member Filter State for view
  const [selectedCollaboratorFilter, setSelectedCollaboratorFilter] = useState('all');

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uData, eData, bData, sData, sumData, tripsData] = await Promise.all([
        fetchUsers(),
        fetchExpenses(),
        fetchBalances(),
        fetchSettlements(),
        fetchDashboardSummary(),
        fetchTrips().catch(() => [])
      ]);

      setUsers(uData);
      setExpenses(eData);
      setBalances(bData.balances || []);
      setSettlements(sData.settlements || []);
      setSummary(sumData);
      setTrips(tripsData);

      // Select default trip (e.g. 'qwer' or first trip) if not set
      if (!selectedTripId && tripsData.length > 0) {
        const qwerTrip = tripsData.find((t) => t.title.toLowerCase() === 'qwer');
        setSelectedTripId(qwerTrip ? qwerTrip.id.toString() : tripsData[0].id.toString());
      }

      // Default paidBy to first user if available and not set
      if (uData.length > 0 && !paidBy) {
        setPaidBy(uData[0].id.toString());
      }
    } catch (err) {
      setError(err.message || 'Failed to load expense calculator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered Collaborators for the selected trip or all users
  const activeTrip = trips.find((t) => t.id.toString() === selectedTripId.toString());
  
  const currentCollaborators = activeTrip?.members?.length > 0
    ? activeTrip.members.map((m) => {
        // Find matching user object or construct from member
        const userObj = users.find((u) => u.id === m.id || u.name === m.full_name);
        return {
          id: userObj ? userObj.id : m.id,
          name: m.full_name || (userObj ? userObj.name : 'Collaborator'),
          email: m.email,
          role: m.role
        };
      })
    : users.map((u) => ({ id: u.id, name: u.name, role: 'member' }));

  // Auto-initialize selected participants when collaborators change
  useEffect(() => {
    if (currentCollaborators.length > 0 && Object.keys(selectedParticipants).length === 0) {
      const initialParts = {};
      currentCollaborators.forEach((c) => {
        initialParts[c.id] = { selected: true, share: '' };
      });
      setSelectedParticipants(initialParts);
      if (!paidBy) setPaidBy(currentCollaborators[0].id.toString());
    }
  }, [currentCollaborators]);

  // Handle participant selection toggle
  const toggleParticipant = (userId) => {
    setSelectedParticipants((prev) => ({
      ...prev,
      [userId]: {
        selected: !prev[userId]?.selected,
        share: prev[userId]?.share || ''
      }
    }));
  };

  // Handle custom share input change
  const handleShareChange = (userId, shareValue) => {
    setSelectedParticipants((prev) => ({
      ...prev,
      [userId]: {
        selected: true,
        share: shareValue
      }
    }));
  };

  const getParticipantsPayload = () => {
    const activeUserIds = Object.keys(selectedParticipants).filter(
      (uid) => selectedParticipants[uid]?.selected
    );
    return activeUserIds.map((uid) => {
      const item = { user_id: parseInt(uid, 10) };
      if (splitType === 'custom') {
        item.share_amount = parseFloat(selectedParticipants[uid]?.share || 0);
      }
      return item;
    });
  };

  // Create User / Member
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setAddingUser(true);
    setError('');
    setSuccessMsg('');
    try {
      const user = await createUser({ name: newMemberName.trim() });
      
      // If a trip is active, also add as trip member if possible
      if (activeTrip && user.email) {
        await addTripMember(activeTrip.id, user.email).catch(() => {});
      }

      setNewMemberName('');
      setSuccessMsg(`Collaborator '${user.name}' added successfully!`);
      await loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setAddingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete collaborator '${name}'? This will remove their expenses.`)) return;
    try {
      await deleteUser(id);
      setSuccessMsg(`Collaborator '${name}' removed.`);
      await loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to delete collaborator');
    }
  };

  // Preview Calculation
  const handlePreviewCalculation = async () => {
    setError('');
    setPreviewResult(null);

    const parts = getParticipantsPayload();
    if (!paidBy) return setError('Please select who paid the expense from the dropdown.');
    if (!amount || parseFloat(amount) <= 0) return setError('Please enter a valid expense amount.');
    if (parts.length === 0) return setError('Please select at least one participant.');

    setCalculatingPreview(true);
    try {
      const res = await previewCalculateExpense({
        amount: parseFloat(amount),
        paid_by: parseInt(paidBy, 10),
        split_type: splitType,
        participants: parts
      });
      setPreviewResult(res);
    } catch (err) {
      setError(err.message || 'Preview calculation failed');
    } finally {
      setCalculatingPreview(false);
    }
  };

  // Submit Expense
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const parts = getParticipantsPayload();
    if (!description.trim()) return setError('Please enter a description.');
    if (!amount || parseFloat(amount) <= 0) return setError('Please enter a valid expense amount.');
    if (!paidBy) return setError('Please select who paid from the dropdown.');
    if (parts.length === 0) return setError('Please select at least one participant.');

    setSubmittingExpense(true);
    try {
      await createExpense({
        description: description.trim(),
        amount: parseFloat(amount),
        paid_by: parseInt(paidBy, 10),
        split_type: splitType,
        participants: parts
      });
      setDescription('');
      setAmount('');
      setPreviewResult(null);
      setSuccessMsg('Expense saved successfully!');
      await loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to create expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      setSuccessMsg('Expense deleted successfully.');
      await loadAllData();
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  // Filtered expenses based on collaborator dropdown filter
  const displayedExpenses = selectedCollaboratorFilter === 'all'
    ? expenses
    : expenses.filter(
        (e) =>
          e.paid_by.toString() === selectedCollaboratorFilter.toString() ||
          e.participants.some((p) => p.user_id.toString() === selectedCollaboratorFilter.toString())
      );

  return (
    <div className="space-y-8 font-sans text-slate-800">
      {/* Trip & Context Selector Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Trip Context</label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="block font-extrabold text-slate-800 text-lg bg-transparent border-none focus:ring-0 cursor-pointer p-0 pr-6"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  Trip: {t.title} ({t.destination})
                </option>
              ))}
              <option value="">All Users / Global Mode</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Trip Collaborators</p>
            <p className="text-sm font-bold text-teal-700">{currentCollaborators.length} Active Members</p>
          </div>
          <button
            onClick={loadAllData}
            title="Refresh All Data"
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Collaborators</p>
            <p className="text-2xl font-bold text-slate-800">{currentCollaborators.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Expenses</p>
            <p className="text-2xl font-bold text-slate-800">{expenses.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Spent</p>
            <p className="text-2xl font-bold text-slate-800">₹{summary?.total_expenses_amount || '0.00'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Backend Engine</p>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
              Active & Connected
            </span>
          </div>
          <PieChart className="w-6 h-6 text-teal-600" />
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

      {/* Main Grid: Group Collaborators & Expense Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Group Members Dropdown & List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Trip Collaborators</h3>
            </div>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full">
              {currentCollaborators.length}
            </span>
          </div>

          {/* Group Members Filter Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Filter Collaborator</label>
            <select
              value={selectedCollaboratorFilter}
              onChange={(e) => setSelectedCollaboratorFilter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 cursor-pointer font-medium"
            >
              <option value="all">Show All Collaborators</option>
              {currentCollaborators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `(${c.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Collaborator Form */}
          <form onSubmit={handleCreateUser} className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-600">Add New Collaborator</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. Vishal, Phoobesh"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <button
                type="submit"
                disabled={addingUser}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{addingUser ? '...' : 'Add'}</span>
              </button>
            </div>
          </form>

          {/* Collaborators List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentCollaborators.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No collaborators found.</p>
            ) : (
              currentCollaborators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{c.name}</p>
                      {c.email && <p className="text-[10px] text-slate-400">{c.email}</p>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(c.id, c.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Add Expense Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Calculator className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">Add Expense & Preview Calculation</h3>
          </div>

          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Hotel Booking, Dinner, Cab Fare"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Paid By (Group Collaborator Dropdown)
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer font-semibold text-slate-800"
                  required
                >
                  <option value="" disabled>Select Payer</option>
                  {currentCollaborators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.email ? `(${c.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Split Type</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSplitType('equal')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      splitType === 'equal'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Equal Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType('custom')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      splitType === 'custom'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Custom Split
                  </button>
                </div>
              </div>
            </div>

            {/* Participants Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">
                Select Participants (Trip Collaborators)
              </label>
              {currentCollaborators.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Please add collaborators first.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                  {currentCollaborators.map((c) => {
                    const isSelected = !!selectedParticipants[c.id]?.selected;
                    return (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-teal-50/60 border-teal-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-800">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleParticipant(c.id)}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <span>{c.name}</span>
                        </label>

                        {splitType === 'custom' && isSelected && (
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Share (₹)"
                            value={selectedParticipants[c.id]?.share || ''}
                            onChange={(e) => handleShareChange(c.id, e.target.value)}
                            className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 text-right"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={handlePreviewCalculation}
                disabled={calculatingPreview}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>{calculatingPreview ? 'Calculating...' : 'Preview Split Shares'}</span>
              </button>

              <button
                type="submit"
                disabled={submittingExpense}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{submittingExpense ? 'Saving Expense...' : 'Save Expense'}</span>
              </button>
            </div>
          </form>

          {/* Live Preview Display */}
          {previewResult && (
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center text-xs font-bold text-teal-900 border-b border-teal-200/60 pb-2">
                <span>Calculation Preview ({previewResult.split_type.toUpperCase()} SPLIT)</span>
                <span>Total: ₹{previewResult.amount}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {previewResult.shares.map((s) => {
                  const participantUser = currentCollaborators.find((c) => c.id === s.user_id);
                  return (
                    <div key={s.user_id} className="bg-white p-2.5 rounded-xl border border-teal-100 text-center shadow-xs">
                      <p className="text-[11px] font-bold text-slate-700">{participantUser?.name || `ID #${s.user_id}`}</p>
                      <p className="text-xs font-extrabold text-teal-700">₹{s.share_amount}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Balances & Simplified Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balances Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Overall User Balances</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Net status per user</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {balances.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No balance data available yet.</p>
            ) : (
              balances.map((b) => {
                const balNum = parseFloat(b.balance);
                const isPositive = balNum > 0;
                const isNegative = balNum < 0;

                return (
                  <div
                    key={b.user_id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {b.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{b.user_name}</p>
                        <p className="text-[10px] text-slate-400">User #{b.user_id}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        isPositive
                          ? 'bg-emerald-100 text-emerald-700'
                          : isNegative
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPositive ? `+₹${b.balance}` : isNegative ? `-₹${Math.abs(balNum).toFixed(2)}` : `₹0.00`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Simplified Settlements Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Simplified "Who Owes Whom"</h3>
            </div>
            <span className="text-xs text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
              Min-Transfers
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {settlements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No settlements needed! Everyone is settled up.</p>
            ) : (
              settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/50 to-emerald-50/50 border border-teal-100/80"
                >
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <span className="font-bold text-slate-900">{s.from_user_name}</span>
                    <span className="text-slate-400">owes</span>
                    <span className="font-bold text-teal-700">{s.to_user_name}</span>
                  </div>

                  <span className="text-xs font-extrabold text-teal-800 bg-white px-3 py-1 rounded-xl shadow-xs border border-teal-100">
                    ₹{s.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Expenses History List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">Expense History</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full">
              {displayedExpenses.length} Filtered
            </span>
          </div>
        </div>

        {displayedExpenses.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">No expenses recorded for this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors space-y-3 bg-slate-50/50"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{exp.description}</h4>
                    <p className="text-[11px] text-slate-500">
                      Paid by <span className="font-bold text-slate-700">{exp.payer_name}</span> • Split:{' '}
                      <span className="uppercase font-semibold text-teal-700">{exp.split_type}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-base font-extrabold text-slate-900">₹{exp.amount}</span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Shares Pill Breakdown */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50">
                  {exp.participants.map((p) => (
                    <span
                      key={p.id}
                      className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                    >
                      {p.user_name}: <strong className="text-teal-700">₹{p.share_amount}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
