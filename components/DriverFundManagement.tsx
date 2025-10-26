'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { RefreshCw, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Driver {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  fund: number;
  earnings: number;
  totalRides: number;
  status: string;
  isOnline: boolean;
}

export default function DriverFundManagement() {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getDriversWithFunds();
      setDrivers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${Number(amount).toFixed(2)} ${t('common.currency')}`;
  };

  const getFundStatusColor = (fund: number) => {
    if (fund <= 0) return 'text-danger';
    if (fund < 50) return 'text-warning';
    return 'text-success';
  };

  const getFundStatusBadge = (fund: number) => {
    if (fund <= 0) return 'badge bg-danger';
    if (fund < 50) return 'badge bg-warning';
    return 'badge bg-success';
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">{t('driverFunds.title')}</h2>
          <p className="text-muted mb-0">{t('driverFunds.description')}</p>
        </div>
        <button
          onClick={fetchDrivers}
          disabled={loading}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'spinner-border spinner-border-sm' : ''} />
          {t('common.refresh')}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p className="text-muted mt-3">{t('common.loading')}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <Wallet size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-muted mb-1 small">{t('driverFunds.totalDrivers')}</p>
                      <h4 className="mb-0 fw-bold">{drivers.length}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded">
                      <DollarSign size={24} className="text-success" />
                    </div>
                    <div>
                      <p className="text-muted mb-1 small">{t('driverFunds.totalFunds')}</p>
                      <h4 className="mb-0 fw-bold">
                        {formatCurrency(drivers.reduce((sum, d) => sum + Number(d.fund), 0))}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-info bg-opacity-10 p-3 rounded">
                      <TrendingUp size={24} className="text-info" />
                    </div>
                    <div>
                      <p className="text-muted mb-1 small">{t('driverFunds.totalEarnings')}</p>
                      <h4 className="mb-0 fw-bold">
                        {formatCurrency(drivers.reduce((sum, d) => sum + Number(d.earnings), 0))}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger bg-opacity-10 p-3 rounded">
                      <Wallet size={24} className="text-danger" />
                    </div>
                    <div>
                      <p className="text-muted mb-1 small">{t('driverFunds.lowFunds')}</p>
                      <h4 className="mb-0 fw-bold">
                        {drivers.filter(d => Number(d.fund) <= 0).length}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drivers Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>{t('rides.driver')}</th>
                      <th>{t('common.email')}</th>
                      <th>{t('common.phone')}</th>
                      <th>{t('driverFunds.status')}</th>
                      <th className="text-end">{t('driverFunds.availableFund')}</th>
                      <th className="text-end">{t('driverFunds.totalEarnings')}</th>
                      <th className="text-center">{t('driverFunds.totalRides')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          {t('driverFunds.noDrivers')}
                        </td>
                      </tr>
                    ) : (
                      drivers.map((driver) => (
                        <tr key={driver.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className={`rounded-circle ${driver.isOnline ? 'bg-success' : 'bg-secondary'}`}
                                style={{ width: '10px', height: '10px' }}
                              ></div>
                              <div>
                                <div className="fw-semibold">
                                  {driver.firstName} {driver.lastName}
                                </div>
                                <small className="text-muted">{driver.id.slice(0, 8)}...</small>
                              </div>
                            </div>
                          </td>
                          <td>{driver.email}</td>
                          <td>{driver.phone || t('common.na')}</td>
                          <td>
                            <span className={`badge bg-${driver.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                              {driver.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <span className={`fw-bold ${getFundStatusColor(Number(driver.fund))}`}>
                              {formatCurrency(Number(driver.fund))}
                            </span>
                            {Number(driver.fund) <= 0 && (
                              <span className="badge bg-danger ms-2">{t('driverFunds.depleted')}</span>
                            )}
                          </td>
                          <td className="text-end fw-semibold">{formatCurrency(Number(driver.earnings))}</td>
                          <td className="text-center">{driver.totalRides}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Note: Fund management is now handled through Fund Request Management */}
      {/* Admins can only approve/reject driver fund requests, not manually add funds */}
    </div>
  );
}

