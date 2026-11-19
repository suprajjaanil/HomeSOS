import React, { useState } from 'react';
import { User, LogIn, UserPlus, LogOut, X, MapPin, Phone, Mail, Sparkles, Check } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  currentUser: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: UserType | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUserChange,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('BTM Layout');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login('priya@example.com', 'password123');
      onUserChange(res.user);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(email.trim(), password);
      onUserChange(res.user);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        locality,
        address: address.trim(),
      });
      onUserChange(res.user);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    onUserChange(null);
    onClose();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const updated = await api.updateProfile({
        name: name || currentUser?.name,
        phone: phone || currentUser?.phone,
        locality: locality || currentUser?.locality,
        address: address || currentUser?.address || '',
      });
      onUserChange(updated);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-900">
                {currentUser
                  ? 'Customer Account & Profile'
                  : mode === 'login'
                  ? 'Sign In to HomeSOS'
                  : 'Create Customer Account'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentUser
                  ? 'Manage your Bengaluru address and saved bookings'
                  : 'Access your persistent service memory & fast dispatch'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-navy-900 text-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PROFILE VIEW (If logged in) */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900">{currentUser.name}</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  Logged In
                </span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.phone}</span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-coral-500" />
                <span>{currentUser.locality}, Bengaluru</span>
              </div>
              {currentUser.address && (
                <p className="text-[11px] text-slate-500 pl-5 pt-1">
                  {currentUser.address}
                </p>
              )}
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                Update Dispatch Address & Phone
              </h4>
              <input
                type="text"
                placeholder="Phone Number"
                defaultValue={currentUser.phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Locality (e.g. BTM Layout, Koramangala)"
                defaultValue={currentUser.locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Full Street / Apartment Address"
                defaultValue={currentUser.address || ''}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-navy-900 font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                Save Profile Changes
              </button>
            </form>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          /* LOGIN OR REGISTER FORMS */
          <div className="space-y-4">
            
            {/* Quick Demo Login Pill for Hackathon Evaluators */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-teal-900 block mb-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Hackathon Judge One-Click Login
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡ Instant Login as Priya Sharma (Demo)</span>
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  mode === 'login' ? 'border-teal-500 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                  mode === 'register' ? 'border-teal-500 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
                }`}
              >
                Register
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya@example.com"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs text-navy-900"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs text-navy-900"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number (e.g. +91 98450 12345)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs text-navy-900"
                />
                <input
                  type="password"
                  required
                  placeholder="Password (minimum 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs text-navy-900"
                />
                <input
                  type="text"
                  placeholder="Bengaluru Locality (e.g. BTM Layout)"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs text-navy-900"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-navy-900 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
