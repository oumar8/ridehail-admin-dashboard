'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { Ride } from '@/lib/types';
import { RefreshCw, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ActiveRides() {
  const { t } = useLanguage();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to safely format numbers that might be strings
  const formatNumber = (value: any, decimals: number = 2): string => {
    if (value == null) return '0.' + '0'.repeat(decimals);
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.' + '0'.repeat(decimals) : num.toFixed(decimals);
  };

  const fetchRides = async () => {
    try {
      setLoading(true);
      const data = await apiService.getActiveRides();
      setRides(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
    // No auto-refresh - only load on mount or manual refresh
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'PICKUP':
        return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('rides.title')}</h2>
        <button
          onClick={fetchRides}
          disabled={loading}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">{t('rides.totalActive')}</p>
          <p className="text-2xl font-bold text-gray-900">{rides.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-yellow-600">{t('rides.requested')}</p>
          <p className="text-2xl font-bold text-yellow-900">
            {rides.filter((r) => r.status === 'REQUESTED').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-blue-600">{t('rides.accepted')}</p>
          <p className="text-2xl font-bold text-blue-900">
            {rides.filter((r) => r.status === 'ACCEPTED' || r.status === 'PICKUP').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-green-600">{t('rides.inProgress')}</p>
          <p className="text-2xl font-bold text-green-900">
            {rides.filter((r) => r.status === 'IN_PROGRESS').length}
          </p>
        </div>
      </div>

      {/* Rides List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading && rides.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rides.rideId')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rides.passenger')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rides.driver')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rides.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rides.locations')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rides.details')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('rides.time')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono text-gray-900">
                        {ride.id.substring(0, 8)}...
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ride.user ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {ride.user.firstName} {ride.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{ride.user.phone}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t('common.na')}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ride.driver ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {ride.driver.firstName} {ride.driver.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{ride.driver.phone}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t('rides.searching')}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          ride.status
                        )}`}
                      >
                        {formatStatus(ride.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 max-w-xs">
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-900">
                            {ride.pickupLocation.address}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Navigation size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-900">
                            {ride.dropoffLocation.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">
                          {formatNumber(ride.estimatedFare, 2)} {t('common.currency')}
                        </p>
                        <p className="text-gray-500">
                          {formatNumber(ride.distance, 1)} {t('common.km')} • {Math.round(typeof ride.duration === 'string' ? parseFloat(ride.duration) : ride.duration)} {t('common.min')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ride.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rides.length === 0 && (
              <p className="text-center text-gray-500 py-8">{t('rides.noRides')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

