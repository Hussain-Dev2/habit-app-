'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  points: number;
  clicks: number;
  isAdmin: boolean;
  createdAt: string;
  isBanned: boolean;
  isChatBlocked: boolean;
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [banModal, setBanModal] = useState<{ userId: string; name: string; isBanned: boolean; isChatBlocked: boolean } | null>(null);
  const [banType, setBanType] = useState<'ban_app' | 'block_chat' | 'lift_ban' | 'lift_block'>('block_chat');
  const [banDuration, setBanDuration] = useState<string>('24h');
  const [pointsModal, setPointsModal] = useState<{ userId: string; points: number } | null>(null);
  const [pointsInput, setPointsInput] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<User[]>('/admin/users', { method: 'GET' });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isAdmin: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleBan = async () => {
    if (!banModal) return;

    try {
    try {
        if (banType === 'lift_ban' || banType === 'lift_block') {
             await apiFetch(`/admin/users/${banModal.userId}/ban?type=${banType === 'lift_ban' ? 'ban_app' : 'block_chat'}`, {
                method: 'DELETE'
            });
        } else {
            await apiFetch(`/admin/users/${banModal.userId}/ban`, {
                method: 'POST',
                body: JSON.stringify({ type: banType, duration: banDuration })
            });
        }
        
        // Refresh users locally to reflect change
        setUsers(users.map(u => {
            if (u.id === banModal.userId) {
                if (banType === 'ban_app') return { ...u, isBanned: true };
                if (banType === 'block_chat') return { ...u, isChatBlocked: true };
                if (banType === 'lift_ban') return { ...u, isBanned: false };
                if (banType === 'lift_block') return { ...u, isChatBlocked: false };
            }
            return u;
        }));

        setBanModal(null);
    } catch (e) {
        console.error('Failed to update ban status', e);
    }
        setBanModal(null);
        // ideally fetch users again or show toast
    } catch (e) {
        console.error('Failed to ban user', e);
    }
  };

  const addPoints = async () => {
    if (!pointsModal || !pointsInput) return;

    try {
      const points = parseInt(pointsInput);
      await apiFetch(`/admin/users/${pointsModal.userId}/points`, {
        method: 'POST',
        body: JSON.stringify({ points }),
      });

      setUsers(
        users.map((user) =>
          user.id === pointsModal.userId
            ? { ...user, points: user.points + points }
            : user
        )
      );
      setPointsModal(null);
      setPointsInput('');
    } catch (error) {
      console.error('Failed to add points:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      !searchEmail ||
      user.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <input
          type="email"
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          👥 Users ({filteredUsers.length})
        </h2>

        {loading ? (
          <div className="text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-slate-400 py-8 text-center">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Points</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Clicks</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Joined</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Admin</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-white">
                        {user.email}
                        <div className="flex gap-1 mt-1">
                            {user.isBanned && <span className="text-[10px] bg-red-900 text-red-100 px-1 py-0.5 rounded border border-red-700">APP BANNED</span>}
                            {user.isChatBlocked && <span className="text-[10px] bg-orange-900 text-orange-100 px-1 py-0.5 rounded border border-orange-700">CHAT BLOCKED</span>}
                        </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{user.name || '-'}</td>
                    <td className="py-3 px-4 text-yellow-400 font-semibold">{user.points}</td>
                    <td className="py-3 px-4 text-blue-400">{user.clicks}</td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleAdmin(user.id, user.isAdmin)}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                          user.isAdmin
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                        }`}
                      >
                        {user.isAdmin ? '⭐ Admin' : 'User'}
                      </button>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => {
                          setPointsModal({ userId: user.id, points: user.points });
                          setPointsInput('');
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors"
                      >
                        ➕ Points
                      </button>
                      <button
                        onClick={() => setBanModal({ 
                            userId: user.id, 
                            name: user.name || user.email || 'User',
                            isBanned: user.isBanned,
                            isChatBlocked: user.isChatBlocked
                        })}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors"
                      >
                        {user.isBanned || user.isChatBlocked ? '⚠️ Manage' : '🚫 Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Points Modal */}
      {pointsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">➕ Add Points</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  User ID: {pointsModal.userId}
                </label>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Points: {pointsModal.points}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Points to Add
                </label>
                <input
                  type="number"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addPoints}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  ✓ Add
                </button>
                <button
                  onClick={() => setPointsModal(null)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-red-900/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🚫</span> Restrict User
            </h3>
            <p className="text-slate-400 mb-6">User: <span className="text-white font-semibold">{banModal.name}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Restriction Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {!banModal.isChatBlocked ? (
                        <button
                            onClick={() => setBanType('block_chat')}
                            className={`p-3 rounded-lg border ${banType === 'block_chat' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                        >
                            Block Chat
                        </button>
                    ) : (
                        <button
                            onClick={() => setBanType('lift_block')}
                             className={`p-3 rounded-lg border ${banType === 'lift_block' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                        >
                            Unblock Chat
                        </button>
                    )}

                    {!banModal.isBanned ? (
                        <button
                            onClick={() => setBanType('ban_app')}
                            className={`p-3 rounded-lg border ${banType === 'ban_app' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                        >
                            Ban Account
                        </button>
                    ) : (
                        <button
                            onClick={() => setBanType('lift_ban')}
                            className={`p-3 rounded-lg border ${banType === 'lift_ban' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                        >
                            Lift App Ban
                        </button>
                    )}
                </div>
              </div>

               {(banType === 'ban_app' || banType === 'block_chat') && (
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                <select 
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="permanent">Permanent</option>
                </select>
              </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBan}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                >
                  Confirm Restriction
                </button>
                <button
                  onClick={() => setBanModal(null)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
