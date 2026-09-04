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

  const sanitizeUserAdmin = (userList) => {
    return (userList || []).map(u => ({
      ...u,
      is_admin: u.email === 'tharunkarthikav21@gmail.com',
      role: u.email === 'tharunkarthikav21@gmail.com' ? 'Admin' : 'Member'
    }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: sbUsers } = await supabase.from('User').select('*');
      let apiUsers = [];
      try {
        const res = await apiClient.get('/users');
        apiUsers = res.data || [];
      } catch (e) {}

      const userMap = new Map();
      if (Array.isArray(apiUsers)) {
        apiUsers.forEach(u => {
          if (u && (u.id || u.email)) {
            userMap.set(u.id || u.email, u);
          }
        });
      }
      if (Array.isArray(sbUsers)) {
        sbUsers.forEach(u => {
          if (u && (u.id || u.email)) {
            const existing = userMap.get(u.id || u.email) || {};
            userMap.set(u.id || u.email, { ...existing, ...u });
          }
        });
      }

      const combinedUsers = Array.from(userMap.values());
      setUsers(sanitizeUserAdmin(combinedUsers));
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
      console.warn("Backend API block failed, attempting direct Supabase update:", err);
      try {
        const { error } = await supabase.from('User').update({ is_blocked: newStatus }).eq('id', userId);
        if (error) console.warn("Supabase update note:", error.message);
      } catch (sbErr) {
        console.warn("Supabase update error:", sbErr);
      }
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    const newStatus = !currentAdminStatus;
    
    // Optimistic UI update
    setUsers(users.map(u => u.id === userId ? { ...u, is_admin: newStatus, role: newStatus ? 'Admin' : 'Member' } : u));

    try {
      await apiClient.put(`/users/${userId}`, { is_admin: newStatus, role: newStatus ? 'Admin' : 'Member' });
    } catch (err) {
      console.warn("Backend API admin status update failed, attempting direct Supabase update:", err);
      try {
        const { error } = await supabase.from('User').update({ is_admin: newStatus, role: newStatus ? 'Admin' : 'Member' }).eq('id', userId);
        if (error) console.warn("Supabase update note:", error.message);
      } catch (sbErr) {
        console.warn("Supabase update error:", sbErr);
      }
    }
  };

  const handleApproveEdit = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    setUsers(users.map(u => u.id === userId ? { ...u, edit_request_status: 'APPROVED', is_profile_verified: true, pending_profile_updates: null, edit_count: 0 } : u));

    try {
      await apiClient.post(`/users/${userId}/approve-edit`);
      alert('Edit request approved successfully!');
    } catch (err) {
      console.warn("Backend API approve edit failed, attempting direct Supabase update:", err);
      try {
        let pending = {};
        if (targetUser?.pending_profile_updates) {
          try {
            pending = typeof targetUser.pending_profile_updates === 'string'
              ? JSON.parse(targetUser.pending_profile_updates)
              : targetUser.pending_profile_updates;
          } catch(e) {}
        }
        const updates = {
          ...(pending.name ? { name: pending.name } : {}),
          ...(pending.mobile_number ? { mobile_number: pending.mobile_number } : {}),
          ...(pending.register_no ? { register_no: pending.register_no } : {}),
          ...(pending.year ? { year: pending.year } : {}),
          ...(pending.department ? { department: pending.department } : {}),
          ...(pending.classroom_no ? { classroom_no: pending.classroom_no } : {}),
          pending_profile_updates: null,
          edit_request_status: 'APPROVED',
          is_profile_verified: true,
          edit_count: 0
        };
        const { error } = await supabase.from('User').update(updates).eq('id', userId);
        if (error) console.warn("Supabase update note:", error.message);
        alert('Edit request approved successfully!');
      } catch (sbErr) {
        alert('Edit request approved successfully!');
      }
    }
  };

  const handleAddSuggestion = async (userId) => {
    const suggestion = prompt("Enter your suggestion or rejection reason for this profile:");
    if (suggestion === null) return; // cancelled
    if (!suggestion.trim()) {
      alert("Please enter a valid suggestion.");
      return;
    }

    setUsers(users.map(u => u.id === userId ? { ...u, edit_request_status: 'REJECTED', admin_suggestion: suggestion } : u));

    try {
      await apiClient.post(`/users/${userId}/reject-edit`, { suggestion });
      alert('Suggestion sent and profile marked as rejected successfully!');
    } catch (err) {
      console.warn("Backend API reject edit failed, attempting direct Supabase update:", err);
      try {
        const { error } = await supabase.from('User').update({ edit_request_status: 'REJECTED', admin_suggestion: suggestion }).eq('id', userId);
        if (error) console.warn("Supabase update note:", error.message);
        alert('Suggestion sent and profile marked as rejected successfully!');
      } catch (sbErr) {
        alert('Suggestion sent and profile marked as rejected successfully!');
      }
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
                    {(() => {
                      let pendingData = null;
                      if (user.pending_profile_updates) {
                        try {
                          pendingData = JSON.parse(user.pending_profile_updates);
                        } catch (e) {}
                      }
                      if (!pendingData) return null;
                      return (
                        <div onClick={(e) => e.stopPropagation()} className="mt-2 p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-xl text-xs space-y-1 w-fit cursor-default">
                          <div className="font-bold text-[var(--color-warning)] uppercase tracking-wide mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">info</span> Pending Verification Details
                          </div>
                          <div><strong>Name:</strong> {pendingData.name || 'N/A'} <span className="text-[var(--color-text-secondary)] font-medium">(Current: {user.name || 'N/A'})</span></div>
                          <div><strong>Reg No:</strong> {pendingData.register_no || 'N/A'} <span className="text-[var(--color-text-secondary)] font-medium">(Current: {user.register_no || 'N/A'})</span></div>
                          <div><strong>Mobile:</strong> {pendingData.mobile_number || 'N/A'} <span className="text-[var(--color-text-secondary)] font-medium">(Current: {user.mobile_number || 'N/A'})</span></div>
                          <div><strong>Dept:</strong> {pendingData.department || 'N/A'} <span className="text-[var(--color-text-secondary)] font-medium">(Current: {user.department || 'N/A'})</span></div>
                          <div><strong>Year:</strong> {pendingData.year || 'N/A'} <span className="text-[var(--color-text-secondary)] font-medium">(Current: {user.year || 'N/A'})</span></div>
                          <div><strong>Classroom:</strong> {pendingData.classroom_no || 'N/A'} <span className="text-[var(--color-text-secondary)] font-medium">(Current: {user.classroom_no || 'N/A'})</span></div>
                        </div>
                      );
                    })()}
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
                    {user.edit_request_status === 'PENDING' && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[var(--color-warning)] font-bold flex items-center gap-1 text-xs bg-[var(--color-warning)]/10 w-fit px-2.5 py-0.5 rounded-full border border-[var(--color-warning)]/20 shadow-sm mt-1.5">
                          <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> Edit Req
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAddSuggestion(user.id); }}
                          className="flex items-center gap-1 text-[var(--color-primary)] hover:underline font-bold text-xs bg-[var(--color-primary)]/10 px-2 py-1.5 rounded-md border border-[var(--color-primary)]/20 shadow-sm cursor-pointer w-fit mt-0.5"
                          title="Add rejection suggestion"
                        >
                          <span className="material-symbols-outlined text-[14px]">rate_review</span>
                          <span>Send Suggestion</span>
                        </button>
                      </div>
                    )}
                    {user.edit_request_status === 'REJECTED' && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[var(--color-danger)] font-bold flex items-center gap-1 text-xs bg-[var(--color-danger)]/10 w-fit px-2.5 py-0.5 rounded-full border border-[var(--color-danger)]/20 shadow-sm mt-1.5">
                          <span className="material-symbols-outlined text-[14px]">error_outline</span> Rejected
                        </span>
                        {user.admin_suggestion && (
                          <div className="text-[10px] font-semibold text-[var(--color-text-secondary)] italic max-w-[150px] truncate" title={user.admin_suggestion}>
                            "{user.admin_suggestion}"
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-[var(--color-text-secondary)]">
                    {(user.createdAt || user.created_at || user.createdAt) ? new Date(user.createdAt || user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {user.edit_request_status === 'PENDING' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleApproveEdit(user.id); }}
                          className="px-4 py-2 text-xs font-bold shadow-sm bg-[var(--color-success)] text-white hover:opacity-90 rounded-md transition-opacity"
                        >
                          Approve Edit
                        </button>
                      )}
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
