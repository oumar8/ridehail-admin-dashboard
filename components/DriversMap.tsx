'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiService } from '@/lib/api';
import { Driver } from '@/lib/types';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Dynamically import map component (client-side only)
const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function DriversMap() {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getActiveDrivers();
      setDrivers(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // No auto-refresh - only load on mount or manual refresh
  }, []);

  const getStatusColor = (driver: Driver) => {
    if (!driver.isOnline) return 'bg-gray-500';
    if (driver.isAvailable) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getStatusText = (driver: Driver) => {
    if (!driver.isOnline) return t('drivers.offline');
    if (driver.isAvailable) return t('drivers.online');
    return 'Busy';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('drivers.title')}</h2>
        <button
          onClick={fetchDrivers}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div style={{ height: '600px' }}>
            {loading && drivers.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <MapView drivers={drivers} />
            )}
          </div>
        </div>

        {/* Driver List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('drivers.listTitle')} ({drivers.length})
          </h3>
          <div className="space-y-3 max-h-[550px] overflow-y-auto">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{driver.phone}</p>
                    {driver.vehicle && (
                      <p className="text-xs text-gray-500 mt-1">
                        {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color})
                      </p>
                    )}
                    {driver.currentLocation && (
                      <p className="text-xs text-gray-500 mt-1">
                        {driver.currentLocation.city}, {driver.currentLocation.state}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                        driver
                      )}`}
                    >
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      {getStatusText(driver)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ⭐ {Number(driver.rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {drivers.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">{t('drivers.noDrivers')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

