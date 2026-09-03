import React, { useState } from 'react';
import { 
  Compass, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Sparkles, 
  Globe, 
  Receipt,
  MessageSquare
} from 'lucide-react';
import { registerUser, loginUser } from '../api/auth';

export default function AuthPage({ onAuthSuccess }) {

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    rememberMe: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name] || errors.api) {
      setErrors((prev) => ({ ...prev, [name]: '', api: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the Terms of Service';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // Call FastAPI Login API
        await loginUser({
          email: formData.email,
          password: formData.password
        });
        setCurrentUser({ email: formData.email });
      } else {
        // Call FastAPI Register API
        const user = await registerUser({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        });
        setCurrentUser(user);
      }
      setSubmitted(true);
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err) {

      setErrors({ api: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Dynamic Background Blur Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Branding & Visual Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950 p-8 lg:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Logo Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Compass className="w-7 h-7 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  TripMate
                </h1>
                <p className="text-xs text-indigo-300 font-medium tracking-wide uppercase">Group Trip Planner</p>
              </div>
            </div>

            {/* Main Catchphrase */}
            <div className="space-y-4 mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Collaborative Travel
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
                Plan adventures with your favorite people.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Organize itineraries, split group expenses effortlessly, bookmark top locations, and chat in real-time.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3.5">
              {[
                { icon: MapPin, title: 'Itinerary Builder', desc: 'Drag & reorder daily activities', color: 'text-emerald-400' },
                { icon: Receipt, title: 'Expense Splitter', desc: 'Instant "who owes whom" math', color: 'text-teal-400' },
                { icon: Users, title: 'Places & Ratings', desc: 'Curate bucket-lists together', color: 'text-indigo-400' },
                { icon: MessageSquare, title: 'Group Chat', desc: 'Sync decisions in real-time', color: 'text-purple-400' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/70 transition-all duration-200">
                  <div className={`p-2 rounded-lg bg-slate-900 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">{item.title}</h3>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Over 10k+ trips planned
              </span>
              <span className="text-slate-500">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/60">
          {/* Header Switcher */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isLogin 
                  ? 'Sign in to access your planned group trips' 
                  : 'Start planning your next group trip in minutes'}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="bg-slate-800/80 p-1 rounded-xl flex border border-slate-700/60">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setSubmitted(false); setErrors({}); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isLogin 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setSubmitted(false); setErrors({}); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !isLogin 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Submitted Banner */}
          {submitted ? (
            <div className="p-6 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isLogin ? 'Logged in successfully!' : 'Account created successfully!'}
              </h3>
              <p className="text-sm text-slate-300">
                Welcome to <span className="font-semibold text-indigo-300">TripMate</span>
                {currentUser?.full_name && `, ${currentUser.full_name}`}! Redirecting to your trip dashboard...
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
              >
                Back to Auth Demo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* API Error Banner */}
              {errors.api && (
                <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-300 text-center font-medium">
                  {errors.api}
                </div>
              )}
              



              {/* Full Name field (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Alex Morgan"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border transition-all focus:outline-none ${
                        errors.fullName 
                          ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>}
                </div>
              )}

              {/* Email address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border transition-all focus:outline-none ${
                      errors.email 
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  {isLogin && (
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-indigo-400 hover:underline font-medium">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border transition-all focus:outline-none ${
                      errors.password 
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border transition-all focus:outline-none ${
                        errors.confirmPassword 
                          ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Checkboxes */}
              <div className="pt-1">
                {isLogin ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-xs text-slate-400">Remember this device for 30 days</span>
                  </label>
                ) : (
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-xs text-slate-400 leading-tight">
                        I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} className="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-indigo-400 hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-rose-400 mt-1">{errors.agreeTerms}</p>}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to TripMate' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer switcher text */}
          <p className="text-center text-xs text-slate-400 mt-6">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setSubmitted(false); setErrors({}); }}
              className="text-indigo-400 hover:underline font-semibold"
            >
              {isLogin ? 'Sign up for free' : 'Log in here'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
