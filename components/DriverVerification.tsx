'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, XCircle, RefreshCw, User, AlertCircle, Car, Mail, Phone, CreditCard, Calendar, Star, TrendingUp } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  features?: string[];
}

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
  vehicles?: Vehicle[];
}

export default function DriverVerification() {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await axios.get(`${API_BASE_URL}/admin/drivers/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure response.data is an array
      const driversData = Array.isArray(response.data) ? response.data : [];
      
      // Transform the data to match the expected format
      const transformedDrivers: Driver[] = driversData.map((driver: any) => {
        // Transform vehicles array
        const vehicles: Vehicle[] = (driver.vehicles || []).map((vehicle: any) => ({
          id: vehicle.id || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          year: vehicle.year ? Number(vehicle.year) : 0,
          color: vehicle.color || '',
          licensePlate: vehicle.licensePlate || vehicle.license_plate || '',
          vehicleType: vehicle.vehicleType || vehicle.vehicle_type || 'ECONOMY',
          insuranceCompany: vehicle.insuranceCompany || vehicle.insurance_company || undefined,
          insurancePolicyNumber: vehicle.insurancePolicyNumber || vehicle.insurance_policy_number || undefined,
          insuranceExpiry: vehicle.insuranceExpiry ? (typeof vehicle.insuranceExpiry === 'string' ? vehicle.insuranceExpiry : vehicle.insuranceExpiry.toISOString().split('T')[0]) : undefined,
          features: vehicle.features || [],
        }));

        return {
          id: driver.id,
          email: driver.email || '',
          phone: driver.phone || '',
          firstName: driver.firstName || driver.first_name || '',
          lastName: driver.lastName || driver.last_name || '',
          licenseNumber: driver.licenseNumber || driver.license_number || '',
          licenseExpiry: driver.licenseExpiry ? (typeof driver.licenseExpiry === 'string' ? driver.licenseExpiry : driver.licenseExpiry.toISOString().split('T')[0]) : '',
          status: driver.status || driver.driver_status || 'PENDING_VERIFICATION',
          isVerified: driver.isVerified || driver.is_verified || false,
          rating: driver.rating ? Number(driver.rating) : 0,
          totalRides: driver.totalRides || driver.total_rides || 0,
          createdAt: driver.createdAt ? (typeof driver.createdAt === 'string' ? driver.createdAt : driver.createdAt.toISOString()) : '',
          vehicles: vehicles,
        };
      });

      setDrivers(transformedDrivers);
    } catch (error: any) {
      console.error('Error fetching pending drivers:', error);
      
      let errorMessage = 'Failed to fetch pending drivers.';
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to access this resource.';
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check the server configuration.';
        } else {
          errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection and ensure the backend is running.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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

      {/* Error State */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <AlertCircle size={20} className="me-2" />
          <strong>Error:</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

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
      {!loading && !error && drivers.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <CheckCircle size={64} className="text-success opacity-50" />
          </div>
          <h5 className="text-muted">{t('verification.noPending')}</h5>
          <p className="text-muted">{t('verification.noPendingDesc')}</p>
        </div>
      )}

      {/* Drivers Grid */}
      {!loading && !error && drivers.length > 0 && (
        <div className="row g-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="col-12 col-xl-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  {/* Driver Header */}
                  <div className="d-flex align-items-start justify-content-between mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                          <User size={28} className="text-primary" />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h5 className="mb-1 fw-bold text-dark">
                          {driver.firstName} {driver.lastName}
                        </h5>
                        <span className={`badge ${getStatusBadgeClass(driver.status)} mb-2`}>
                          {getStatusText(driver.status)}
                        </span>
                        <div className="d-flex align-items-center gap-3 mt-2 text-muted small">
                          <span className="d-flex align-items-center gap-1">
                            <Star size={14} className="text-warning" />
                            {Number(driver.rating).toFixed(1)}
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <TrendingUp size={14} />
                            {driver.totalRides || 0} rides
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Contact Info */}
                  <div className="mb-4">
                    <h6 className="text-muted text-uppercase small fw-bold mb-3">Contact Information</h6>
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-start gap-2">
                          <Mail size={16} className="text-muted mt-1 flex-shrink-0" />
                          <div className="flex-grow-1">
                            <div className="small text-muted">Email</div>
                            <div className="fw-semibold">{driver.email || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-start gap-2">
                          <Phone size={16} className="text-muted mt-1 flex-shrink-0" />
                          <div className="flex-grow-1">
                            <div className="small text-muted">Phone</div>
                            <div className="fw-semibold">{driver.phone || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver License Info */}
                  <div className="mb-4">
                    <h6 className="text-muted text-uppercase small fw-bold mb-3">Driver License</h6>
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-start gap-2">
                          <CreditCard size={16} className="text-muted mt-1 flex-shrink-0" />
                          <div className="flex-grow-1">
                            <div className="small text-muted">License Number</div>
                            <div className="fw-semibold">{driver.licenseNumber || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-start gap-2">
                          <Calendar size={16} className="text-muted mt-1 flex-shrink-0" />
                          <div className="flex-grow-1">
                            <div className="small text-muted">License Expiry</div>
                            <div className="fw-semibold">
                              {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  {driver.vehicles && driver.vehicles.length > 0 ? (
                    <div className="mb-4">
                      <h6 className="text-muted text-uppercase small fw-bold mb-3 d-flex align-items-center gap-2">
                        <Car size={16} />
                        Vehicle Information {driver.vehicles.length > 1 && `(${driver.vehicles.length})`}
                      </h6>
                      {driver.vehicles.map((vehicle, idx) => (
                        <div key={vehicle.id || idx} className="bg-light rounded p-3 mb-3">
                          <div className="row g-2 mb-2">
                            <div className="col-6">
                              <div className="small text-muted">Make & Model</div>
                              <div className="fw-semibold">{vehicle.make} {vehicle.model}</div>
                            </div>
                            <div className="col-6">
                              <div className="small text-muted">Year</div>
                              <div className="fw-semibold">{vehicle.year || 'N/A'}</div>
                            </div>
                            <div className="col-6">
                              <div className="small text-muted">Color</div>
                              <div className="fw-semibold">{vehicle.color || 'N/A'}</div>
                            </div>
                            <div className="col-6">
                              <div className="small text-muted">License Plate</div>
                              <div className="fw-semibold">{vehicle.licensePlate || 'N/A'}</div>
                            </div>
                            <div className="col-6">
                              <div className="small text-muted">Vehicle Type</div>
                              <div className="fw-semibold">
                                <span className="badge bg-info">{vehicle.vehicleType || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          {(vehicle.insuranceCompany || vehicle.insurancePolicyNumber) && (
                            <div className="border-top pt-2 mt-2">
                              <div className="small text-muted mb-2">Insurance Information</div>
                              <div className="row g-2">
                                {vehicle.insuranceCompany && (
                                  <div className="col-12">
                                    <div className="small text-muted">Company</div>
                                    <div className="fw-semibold">{vehicle.insuranceCompany}</div>
                                  </div>
                                )}
                                {vehicle.insurancePolicyNumber && (
                                  <div className="col-12">
                                    <div className="small text-muted">Policy Number</div>
                                    <div className="fw-semibold">{vehicle.insurancePolicyNumber}</div>
                                  </div>
                                )}
                                {vehicle.insuranceExpiry && (
                                  <div className="col-12">
                                    <div className="small text-muted">Expiry Date</div>
                                    <div className="fw-semibold">
                                      {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="alert alert-warning mb-0 d-flex align-items-center gap-2">
                        <AlertCircle size={16} />
                        <span className="small">No vehicle information provided</span>
                      </div>
                    </div>
                  )}

                  {/* Status Update Section */}
                  <div className="border-top pt-4 mt-4">
                    <label className="form-label fw-semibold mb-3">{t('verification.updateStatus')}</label>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => updateDriverStatus(driver.id, 'ACTIVE')}
                        disabled={processingId === driver.id}
                        className="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-2"
                      >
                        <CheckCircle size={16} />
                        <span>
                          {processingId === driver.id
                            ? t('verification.processing')
                            : t('verification.approve')}
                        </span>
                      </button>
                      <button
                        onClick={() => updateDriverStatus(driver.id, 'SUSPENDED')}
                        disabled={processingId === driver.id}
                        className="btn btn-danger flex-fill d-flex align-items-center justify-content-center gap-2"
                      >
                        <XCircle size={16} />
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

