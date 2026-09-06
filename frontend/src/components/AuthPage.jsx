import React, { useState } from 'react';
import { 
  Compass, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, MapPin, Receipt, MessageSquare, AlertCircle
} from 'lucide-react';
import { registerUser, loginUser } from '../api/auth';

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', agreeTerms: false, rememberMe: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name] || errors.api) {
      setErrors((prev) => ({ ...prev, [name]: '', api: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email address (e.g., name@example.com)';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!isLogin) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Service';
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
        await loginUser({ email: formData.email, password: formData.password });
        setCurrentUser({ email: formData.email });
      } else {
        const user = await registerUser({
          full_name: formData.fullName, email: formData.email, password: formData.password, confirm_password: formData.confirmPassword
        });
        setCurrentUser(user);
      }
      setSubmitted(true);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setErrors({ api: err.message || 'We could not connect to the server. Check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Branding */}
        <div className="lg:col-span-5 bg-slate-100 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-teal-700 rounded-xl">
                <Compass className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                TripMate
              </h1>
            </div>

            <div className="space-y-4 mb-10">
              <h2 className="text-3xl font-extrabold leading-tight text-slate-900">
                Plan adventures with your favorite people.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Organize itineraries, split group expenses effortlessly, bookmark top locations, and chat in real-time.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: MapPin, title: 'Itinerary Builder', desc: 'Drag & reorder daily activities' },
                { icon: Receipt, title: 'Expense Splitter', desc: 'Instant "who owes whom" math' },
                { icon: MessageSquare, title: 'Group Chat', desc: 'Sync decisions in real-time' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Log In' : 'Create an Account'}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {isLogin 
                ? 'Welcome back. Please enter your details.' 
                : 'Start planning your next group trip in minutes.'}
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-4">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isLogin ? 'Logged in successfully' : 'Account created successfully'}
              </h3>
              <p className="text-sm text-slate-600">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.api && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errors.api}</span>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white text-sm text-slate-900 rounded-lg border transition-all focus:outline-none ${
                      errors.fullName ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
                    }`}
                  />
                  {errors.fullName && <p className="text-sm text-rose-600 mt-1">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full px-4 py-2.5 bg-white text-sm text-slate-900 rounded-lg border transition-all focus:outline-none ${
                    errors.email ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
                  }`}
                />
                {errors.email && <p className="text-sm text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-10 py-2.5 bg-white text-sm text-slate-900 rounded-lg border transition-all focus:outline-none ${
                      errors.password ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-rose-600 mt-1">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white text-sm text-slate-900 rounded-lg border transition-all focus:outline-none ${
                      errors.confirmPassword ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-sm text-rose-600 mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              <div className="pt-2">
                {isLogin ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                    />
                    <span className="text-sm text-slate-700">Remember this device for 30 days</span>
                  </label>
                ) : (
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                      />
                      <span className="text-sm text-slate-700">
                        I agree to the Terms of Service and Privacy Policy.
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-sm text-rose-600 mt-1">{errors.agreeTerms}</p>}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-600 mt-6">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setSubmitted(false); setErrors({}); }}
              className="text-teal-700 hover:underline font-semibold"
            >
              {isLogin ? 'Create an account' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
