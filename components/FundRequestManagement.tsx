'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FundRequest {
  id: string;
  driverId: string;
  amount: number;
  paymentMethod: string;
  phoneNumber?: string;
  passCode?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fund: number;
  };
}

export default function FundRequestManagement() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchFundRequests();
  }, []);

  const fetchFundRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('No authentication token found');
        console.error('No token found in localStorage');
        return;
      }

      const endpoint = `${API_BASE_URL}/admin/fund-requests`;

      console.log('Fetching fund requests from:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch fund requests: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fund requests data:', data);
      console.log('Number of requests:', data.length);
      
      // Filter to show only requests from last 2 hours
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
      
      const recentRequests = data.filter((request: FundRequest) => {
        const createdAt = new Date(request.createdAt);
        return createdAt >= twoHoursAgo;
      });
      
      console.log('Requests in last 2 hours:', recentRequests.length);
      
      setRequests(recentRequests);
      console.log('Set requests:', recentRequests.length);
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error fetching fund requests:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      const token = localStorage.getItem('admin_token');

      const response = await fetch(
        `${API_BASE_URL}/admin/fund-requests/${requestId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: notes[requestId] || '',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      // Refresh the list
      await fetchFundRequests();
      setNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const rejectionNotes = notes[requestId];
    
    if (!rejectionNotes || rejectionNotes.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      setProcessingId(requestId);
      const token = localStorage.getItem('admin_token');

      const response = await fetch(
        `${API_BASE_URL}/admin/fund-requests/${requestId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: rejectionNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      // Refresh the list
      await fetchFundRequests();
      setNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  // Count by status
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0 fw-bold text-dark">{t('funds.title')}</h2>
        <button
          onClick={fetchFundRequests}
          disabled={loading}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ flexShrink: 0 }} />
          <span>{t('funds.refresh')}</span>
        </button>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
        <i className="bi bi-clock-history me-2"></i>
        <div className="small">
          {t('funds.showing')}
          {pendingCount > 0 && (
            <span className="badge bg-danger ms-2">
              {pendingCount} {t('funds.pending')}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Fund Requests Grid */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <p className="text-muted mt-3">{t('funds.noRequests')}</p>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {requests.map((request) => (
            <div key={request.id} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100 shadow-sm">
                {/* Card Header */}
                <div className={`card-header ${
                  request.status === 'PENDING' ? 'bg-warning' : 
                  request.status === 'APPROVED' ? 'bg-success' : 
                  'bg-danger'
                } bg-gradient text-white`}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center fw-bold" 
                         style={{ 
                           width: '48px', 
                           height: '48px', 
                           flexShrink: 0, 
                           color: request.status === 'PENDING' ? '#ffc107' : request.status === 'APPROVED' ? '#198754' : '#dc3545' 
                         }}>
                      {request.driver.firstName[0]}{request.driver.lastName[0]}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h5 className="card-title mb-1 text-white text-truncate">
                        {request.driver.firstName} {request.driver.lastName}
                      </h5>
                      <span className={`badge ${
                        request.status === 'PENDING' ? 'bg-light text-warning' : 
                        request.status === 'APPROVED' ? 'bg-light text-success' : 
                        'bg-light text-danger'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {/* Contact Info */}
                  <div className="d-flex align-items-center gap-2 mb-2 small">
                    <i className="bi bi-envelope" style={{ width: '16px', flexShrink: 0 }}></i>
                    <span className="text-truncate text-muted">{request.driver.email}</span>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2 mb-2 small">
                    <i className="bi bi-telephone" style={{ width: '16px', flexShrink: 0 }}></i>
                    <span className="text-muted">{request.driver.phone}</span>
                  </div>

                  {/* Fund Request Details */}
                  <div className="border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">{t('funds.amount')}</span>
                      <span className="fw-bold text-success fs-5">
                        {Number(request.amount).toFixed(2)} {t('common.currency')}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">{t('funds.paymentMethod')}</span>
                      <span className={`badge ${
                        request.paymentMethod.toLowerCase() === 'bankily' ? 'bg-primary' : 'bg-success'
                      }`}>
                        {request.paymentMethod}
                      </span>
                    </div>

                    {request.passCode && (
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">{t('funds.passCode')}</span>
                        <code className="bg-light px-2 py-1 rounded">{request.passCode}</code>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">{t('funds.currentFund')}</span>
                      <span className="fw-semibold text-primary">
                        {Number(request.driver.fund).toFixed(2)} {t('common.currency')}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2 small">
                      <span className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {t('funds.created')}
                      </span>
                      <span className="text-dark">
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {request.adminNotes && (
                      <div className="border-top pt-2 mt-2">
                        <p className="text-muted small mb-1">{t('funds.adminNotes')}:</p>
                        <p className="small text-dark fst-italic mb-0">{request.adminNotes}</p>
                      </div>
                    )}

                    {/* Notes Input for Pending */}
                    {request.status === 'PENDING' && (
                      <div className="mt-3">
                        <label className="form-label small">{t('funds.adminNotes')} (optional)</label>
                        <textarea
                          value={notes[request.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [request.id]: e.target.value })}
                          placeholder="Add notes..."
                          className="form-control form-control-sm"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer - Actions */}
                {request.status === 'PENDING' && (
                  <div className="card-footer bg-light d-flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="btn btn-success btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    >
                      <CheckCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{processingId === request.id ? t('funds.processing') : t('funds.approve')}</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="btn btn-danger btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    >
                      <XCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{t('funds.reject')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="alert alert-secondary d-flex align-items-center" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <div>
          <strong>{t('funds.totalRequests')}</strong> {requests.length} |{' '}
          <strong className="text-warning">{t('funds.pending')}:</strong> {pendingCount} |{' '}
          <strong className="text-success">{t('funds.approved')}</strong> {approvedCount} |{' '}
          <strong className="text-danger">{t('funds.rejected')}</strong> {rejectedCount}
        </div>
      </div>
    </div>
  );
}
