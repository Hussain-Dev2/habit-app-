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
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
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
                    <td className="py-3 px-4 text-white">{user.email}</td>
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
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setPointsModal({ userId: user.id, points: user.points });
                          setPointsInput('');
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors"
                      >
                        ➕ Points
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
    </div>
  );
}
