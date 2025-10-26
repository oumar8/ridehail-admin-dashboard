'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, XCircle, RefreshCw, User, AlertCircle } from 'lucide-react';

interface Driver {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  isVerified: boolean;
  rating: number;
  totalRides: number;
  createdAt: string;
}

export default function DriverVerification() {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/admin/drivers/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching pending drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const updateDriverStatus = async (driverId: string, newStatus: string) => {
    setProcessingId(driverId);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.patch(
        `${API_BASE_URL}/admin/drivers/${driverId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the list
      await fetchPendingDrivers();
      
      // Show success message
      alert(t('verification.statusUpdated'));
    } catch (error: any) {
      console.error('Error updating driver status:', error);
      alert(error.response?.data?.message || t('common.error'));
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success';
      case 'SUSPENDED':
        return 'bg-danger';
      case 'PENDING_VERIFICATION':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('verification.active');
      case 'SUSPENDED':
        return t('verification.suspended');
      case 'PENDING_VERIFICATION':
        return t('verification.pending');
      default:
        return status;
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-0 fw-bold text-dark">{t('verification.title')}</h2>
          <p className="text-muted mb-0">{t('verification.description')}</p>
        </div>
        <button
          onClick={fetchPendingDrivers}
          disabled={loading}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ flexShrink: 0 }} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      {/* Stats Card */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <AlertCircle size={24} className="text-warning" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-0">{t('verification.pendingCount')}</h6>
                  <h3 className="mb-0 fw-bold">{drivers.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p className="text-muted mt-3">{t('common.loading')}</p>
        </div>
      )}

      {/* No Pending Drivers */}
      {!loading && drivers.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <CheckCircle size={64} className="text-success opacity-50" />
          </div>
          <h5 className="text-muted">{t('verification.noPending')}</h5>
          <p className="text-muted">{t('verification.noPendingDesc')}</p>
        </div>
      )}

      {/* Drivers Grid */}
      {!loading && drivers.length > 0 && (
        <div className="row g-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="col-12 col-lg-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  {/* Driver Header */}
                  <div className="d-flex align-items-start mb-3">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 p-3 rounded">
                        <User size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="mb-1 fw-bold">
                        {driver.firstName} {driver.lastName}
                      </h5>
                      <span className={`badge ${getStatusBadgeClass(driver.status)}`}>
                        {getStatusText(driver.status)}
                      </span>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">{t('verification.email')}</span>
                      <span className="fw-semibold">{driver.email}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">{t('verification.phone')}</span>
                      <span className="fw-semibold">{driver.phone}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">{t('verification.license')}</span>
                      <span className="fw-semibold">{driver.licenseNumber}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">{t('verification.expiry')}</span>
                      <span className="fw-semibold">
                        {new Date(driver.licenseExpiry).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted">{t('verification.rating')}</span>
                      <span className="fw-semibold">{Number(driver.rating).toFixed(1)} ⭐</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">{t('verification.totalRides')}</span>
                      <span className="fw-semibold">{driver.totalRides || 0}</span>
                    </div>
                  </div>

                  {/* Status Update Section */}
                  <div className="border-top pt-3">
                    <label className="form-label fw-semibold">{t('verification.updateStatus')}</label>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => updateDriverStatus(driver.id, 'ACTIVE')}
                        disabled={processingId === driver.id}
                        className="btn btn-success btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                      >
                        <CheckCircle size={14} />
                        <span>
                          {processingId === driver.id
                            ? t('verification.processing')
                            : t('verification.approve')}
                        </span>
                      </button>
                      <button
                        onClick={() => updateDriverStatus(driver.id, 'SUSPENDED')}
                        disabled={processingId === driver.id}
                        className="btn btn-danger btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                      >
                        <XCircle size={14} />
                        <span>
                          {processingId === driver.id
                            ? t('verification.processing')
                            : t('verification.suspend')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

