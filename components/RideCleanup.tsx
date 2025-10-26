'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StuckRide {
  id: string;
  status: string;
  userId: string;
  userEmail: string;
  driverId?: string;
  driverName?: string;
  requestedAt: string;
  matchedAt?: string;
  startedAt?: string;
  ageMinutes: number;
  pickupAddress?: string;
  dropoffAddress?: string;
}

interface CleanupStats {
  stuckRides: {
    requested: number;
    matched: number;
    inProgress: number;
    total: number;
  };
  oldRequests: number;
  lastChecked: string;
}

export default function RideCleanup() {
  const { t } = useLanguage();
  const [stuckRides, setStuckRides] = useState<StuckRide[]>([]);
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ridesData, statsData] = await Promise.all([
        apiService.getStuckRides(),
        apiService.getCleanupStats(),
      ]);
      setStuckRides(ridesData);
      setStats(statsData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch cleanup data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to cleanup stuck rides? This will cancel all rides that have exceeded their time limits.')) {
      return;
    }

    try {
      setCleaning(true);
      const result = await apiService.manualCleanup();
      setSuccess(`Cleanup completed: ${result.cancelled} rides cancelled, ${result.expired} requests expired`);
      setError('');
      // Refresh data after cleanup
      await fetchData();
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cleanup rides');
      setSuccess('');
    } finally {
      setCleaning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'MATCHED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PICKUP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatAge = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ride Cleanup Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor and cleanup stuck rides
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCleanup}
            disabled={cleaning || loading || stuckRides.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className={`w-4 h-4 ${cleaning ? 'animate-spin' : ''}`} />
            Cleanup Now
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">Success</p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Stuck Rides
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.stuckRides.total}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Requested
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {stats.stuckRides.requested}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">&gt;10 minutes</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Matched
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {stats.stuckRides.matched}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">&gt;30 minutes</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.stuckRides.inProgress}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">&gt;2 hours</p>
          </div>
        </div>
      )}

      {/* Stuck Rides Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stuck Rides ({stuckRides.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading...</p>
          </div>
        ) : stuckRides.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-4">
              No stuck rides found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              All rides are within expected timeframes
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ride ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Route
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stuckRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                      {ride.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {ride.userEmail || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {ride.driverName || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        ride.ageMinutes > 120 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        ride.ageMinutes > 30 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {formatAge(ride.ageMinutes)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs truncate">
                        {ride.pickupAddress && (
                          <div className="text-xs">📍 {ride.pickupAddress}</div>
                        )}
                        {ride.dropoffAddress && (
                          <div className="text-xs mt-1">🎯 {ride.dropoffAddress}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

