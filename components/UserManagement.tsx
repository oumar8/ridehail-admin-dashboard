'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { User } from '@/lib/types';
import { RefreshCw, Ban, Unlock, Trash2, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserManagement() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
      setFilteredUsers(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    
    try {
      setActionLoading(userId);
      await apiService.blockUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to block user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await apiService.unblockUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unblock user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    try {
      setActionLoading(userId);
      await apiService.deleteUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0 fw-bold text-dark">{t('users.title')}</h2>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ flexShrink: 0 }} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <Search size={18} style={{ flexShrink: 0 }} />
            </span>
            <input
              type="text"
              placeholder={t('users.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {/* User Header */}
                <div className="card-header bg-primary bg-gradient text-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="card-title mb-1 text-white">
                        {user.firstName} {user.lastName}
                      </h5>
                      <span className={`badge ${user.isBlocked ? 'bg-danger' : 'bg-success'}`}>
                        {user.isBlocked ? `🚫 ${t('users.status.blocked')}` : `✓ ${t('users.status.active')}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2 small">
                    <i className="bi bi-envelope" style={{ width: '16px', flexShrink: 0 }}></i>
                    <span className="text-truncate text-muted">{user.email}</span>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2 mb-2 small">
                    <i className="bi bi-telephone" style={{ width: '16px', flexShrink: 0 }}></i>
                    <span className="text-muted">{user.phone}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top small">
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <i className="bi bi-calendar" style={{ width: '16px', flexShrink: 0 }}></i>
                      <span>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-primary fw-semibold">
                      <i className="bi bi-arrow-left-right me-1" style={{ fontSize: '14px' }}></i>
                      {user.totalRides || 0} {t('users.rides')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-footer bg-light d-flex gap-2">
                  {user.isBlocked ? (
                    <button
                      onClick={() => handleUnblockUser(user.id)}
                      disabled={actionLoading === user.id}
                      className="btn btn-success btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    >
                      <Unlock size={14} style={{ flexShrink: 0 }} />
                      <span>{t('users.unblock')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlockUser(user.id)}
                      disabled={actionLoading === user.id}
                      className="btn btn-warning btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    >
                      <Ban size={14} style={{ flexShrink: 0 }} />
                      <span>{t('users.block')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={actionLoading === user.id}
                    className="btn btn-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                    style={{ minWidth: '80px' }}
                  >
                    <Trash2 size={14} style={{ flexShrink: 0 }} />
                    <span>{t('users.delete')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <p className="text-muted mt-3">{t('users.noUsers')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="alert alert-info d-flex align-items-center" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <div>
          <strong>{t('users.total')}</strong> {users.length} |{' '}
          <strong>{t('users.active')}</strong> {users.filter((u) => !u.isBlocked).length} |{' '}
          <strong>{t('users.blocked')}</strong> {users.filter((u) => u.isBlocked).length}
        </div>
      </div>
    </div>
  );
}
