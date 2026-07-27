import React, { useState } from 'react';
import { User, db } from '../lib/mockDb';
import { User as UserIcon, Lock, LogOut, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface UserAccountProps {
  user: User;
  onLogout: () => void;
}

export default function UserAccount({ user, onLogout }: UserAccountProps) {
  const [activeTab, setActiveTab] = useState<'profile'>('profile');
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Name change state
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState(user.name || user.email.split('@')[0]);
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!userName.trim()) return;
    setIsSavingName(true);
    try {
      await db.updateUserName(user.id, userName.trim());
      setIsEditingName(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update username:', error);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLogout = async () => {
    await db.signOut();
    onLogout();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await db.changePassword(user.id, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif mb-8">My Account</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide border-b lg:border-b-0 border-white/10 lg:border-r pr-0 lg:pr-6">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Shield className="w-4 h-4" />
                <span>Profile & Security</span>
              </button>

            </div>
            
            <div className="mt-8 hidden lg:block pr-6">
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  {/* Personal Info */}
                  <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-xl font-medium mb-6 flex items-center space-x-2">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span>Personal Information</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs uppercase tracking-widest text-gray-500">Username</label>
                          {!isEditingName ? (
                            <button onClick={() => setIsEditingName(true)} className="text-xs text-gray-400 hover:text-white transition-colors">Edit</button>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={handleSaveName}
                                disabled={isSavingName || !userName.trim()}
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors disabled:opacity-50"
                              >
                                {isSavingName ? 'Saving...' : 'Save'}
                              </button>
                              <button 
                                onClick={() => { setIsEditingName(false); setUserName(user.name || user.email.split('@')[0]); }}
                                disabled={isSavingName}
                                className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditingName ? (
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={isSavingName}
                            autoFocus
                            className="w-full px-4 py-3 bg-[#0a0a0a] rounded-xl text-white font-medium border border-white/30 focus:outline-none focus:border-white transition-colors"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-[#0a0a0a] rounded-xl text-white font-medium border border-white/5 capitalize">
                            {user.name || user.email.split('@')[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
                        <div className="px-4 py-3 bg-[#0a0a0a] rounded-xl text-white font-medium border border-white/5">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security / Password */}
                  <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-xl font-medium mb-6 flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <span>Security</span>
                    </h2>
                    
                    {!user.password ? (
                      <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-sm">
                          You signed in with Google. Password changes are handled by your Google account settings.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">New Password</label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                          />
                        </div>
                        
                        {passwordMessage.text && (
                          <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {passwordMessage.text}
                          </div>
                        )}
                        
                        <button
                          type="submit"
                          disabled={isChangingPassword || !newPassword || !confirmPassword}
                          className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
            
            {/* Mobile Logout */}
            <div className="mt-8 lg:hidden">
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center space-x-3 px-4 py-3 rounded-xl w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
