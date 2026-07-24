import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import apiClient from '../../api/client';
import { realtimeService } from '../../services/realtimeService';

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    const subscription = realtimeService.subscribeToAdminUsers(() => {
        fetchUsers();
    });

    return () => {
      realtimeService.unsubscribe(subscription);
    };
  }, []);

  const handleToggleBlock = async (userId, currentBlockedStatus) => {
    const newStatus = !currentBlockedStatus;
    
    // Optimistic UI update
    setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: newStatus } : u));

    try {
      await apiClient.put(`/users/${userId}`, { is_blocked: newStatus });
    } catch (err) {
      alert('Failed to update user block status.');
      fetchUsers(); // revert
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    const newStatus = !currentAdminStatus;
    
    // Optimistic UI update
    setUsers(users.map(u => u.id === userId ? { ...u, is_admin: newStatus } : u));

    try {
      await apiClient.put(`/users/${userId}`, { is_admin: newStatus, role: newStatus ? 'Admin' : 'Member' });
    } catch (err) {
      alert('Failed to update admin status.');
      fetchUsers(); // revert
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-12 text-[var(--color-text-secondary)] font-bold">Loading users...</div>;

  return (
    <div className="flex flex-col gap-6 font-sans text-[var(--color-text-primary)]">
      <div className="card-standard p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-h2">Manage Users</h2>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">search</span>
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-standard pl-12 h-12"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-background)] border-b border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => navigate(`/user/${user.id}`)}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="font-bold text-[var(--color-text-primary)] text-base mb-1">{user.name || user.email || 'Unknown User'}</div>
                    <div className="text-sm font-semibold text-[var(--color-text-secondary)]">{user.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1.5 bg-[var(--color-background)] text-[var(--color-text-secondary)] font-bold rounded-md text-xs border border-[var(--color-border)] shadow-sm">
                      {user.is_admin ? 'Admin' : (user.role || 'Member')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {user.is_blocked ? (
                      <span className="text-[var(--color-danger)] font-bold flex items-center gap-1.5 text-sm bg-[var(--color-danger)]/10 w-fit px-3 py-1 rounded-full border border-[var(--color-danger)]/20 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">block</span> Blocked
                      </span>
                    ) : (
                      <span className="text-[var(--color-success)] font-bold flex items-center gap-1.5 text-sm bg-[var(--color-success)]/10 w-fit px-3 py-1 rounded-full border border-[var(--color-success)]/20 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-[var(--color-text-secondary)]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleAdmin(user.id, user.is_admin); }}
                        className={`btn-outline px-4 py-2 text-xs shadow-sm bg-white ${user.is_admin ? 'hover:bg-[var(--color-background)]' : 'text-[var(--color-primary)] border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]'}`}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleBlock(user.id, user.is_blocked); }}
                        className={`btn-outline px-4 py-2 text-xs shadow-sm bg-white ${user.is_blocked ? 'hover:bg-[var(--color-background)]' : 'text-[var(--color-danger)] border-[var(--color-danger)]/50 hover:bg-[var(--color-danger)]/10 hover:border-[var(--color-danger)]'}`}
                      >
                        {user.is_blocked ? 'Unblock' : 'Block User'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[var(--color-text-secondary)] font-bold text-lg">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
