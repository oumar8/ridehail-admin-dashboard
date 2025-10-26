'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { Config, ConfigUpdate } from '@/lib/types';
import { Save, RefreshCw, DollarSign, MapPin, Car } from 'lucide-react';

export default function ConfigManagement() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllConfig();
      setConfigs(data);
      
      // Initialize edited values
      const initialValues: Record<string, string> = {};
      data.forEach((config: Config) => {
        initialValues[config.name] = config.value;
      });
      setEditedValues(initialValues);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      setSaving(true);
      
      // Prepare updates for changed values
      const updates: ConfigUpdate[] = [];
      configs.forEach((config) => {
        if (editedValues[config.name] !== config.value) {
          updates.push({
            name: config.name,
            value: editedValues[config.name],
          });
        }
      });

      if (updates.length === 0) {
        setSuccess('No changes to save');
        setTimeout(() => setSuccess(''), 3000);
        return;
      }

      await apiService.bulkUpdateConfig(updates);
      setSuccess(`Successfully updated ${updates.length} configuration(s)!`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh to get updated values
      await fetchConfig();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getConfigIcon = (name: string) => {
    if (name.includes('fare') || name.includes('rate') || name.includes('commission')) return DollarSign;
    if (name.includes('radius')) return MapPin;
    return Car;
  };

  const getConfigCategory = (name: string) => {
    if (name === 'base_fare' || name === 'commission_percentage') return 'general';
    if (name === 'driver_search_radius') return 'driver';
    if (name.includes('per_km_rate')) return 'rates';
    if (name.includes('minimum_fare')) return 'minimum';
    return 'other';
  };

  const formatLabel = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categorizedConfigs = {
    general: configs.filter(c => getConfigCategory(c.name) === 'general'),
    driver: configs.filter(c => getConfigCategory(c.name) === 'driver'),
    rates: configs.filter(c => getConfigCategory(c.name) === 'rates'),
    minimum: configs.filter(c => getConfigCategory(c.name) === 'minimum'),
    other: configs.filter(c => getConfigCategory(c.name) === 'other'),
  };

  return (
    <div className="space-y-6">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <button
          onClick={fetchConfig}
          disabled={loading}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        {categorizedConfigs.general.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              General Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorizedConfigs.general.map((config) => {
                const Icon = getConfigIcon(config.name);
                return (
                  <div key={config.id} className="bg-white rounded-lg shadow-md p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Icon size={16} className="text-gray-500" />
                      {formatLabel(config.name)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedValues[config.name] || ''}
                      onChange={(e) => handleChange(config.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    {config.description && (
                      <p className="mt-1 text-xs text-gray-500">{config.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Driver Settings */}
        {categorizedConfigs.driver.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Driver Matching
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorizedConfigs.driver.map((config) => {
                const Icon = getConfigIcon(config.name);
                return (
                  <div key={config.id} className="bg-white rounded-lg shadow-md p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Icon size={16} className="text-gray-500" />
                      {formatLabel(config.name)}
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={editedValues[config.name] || ''}
                      onChange={(e) => handleChange(config.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    {config.description && (
                      <p className="mt-1 text-xs text-gray-500">{config.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Per KM Rates */}
        {categorizedConfigs.rates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Car size={20} className="text-purple-600" />
              Per Kilometer Rates by Vehicle Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorizedConfigs.rates.map((config) => {
                const Icon = getConfigIcon(config.name);
                return (
                  <div key={config.id} className="bg-white rounded-lg shadow-md p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Icon size={16} className="text-gray-500" />
                      {formatLabel(config.name)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedValues[config.name] || ''}
                      onChange={(e) => handleChange(config.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    {config.description && (
                      <p className="mt-1 text-xs text-gray-500">{config.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimum Fares */}
        {categorizedConfigs.minimum.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign size={20} className="text-orange-600" />
              Minimum Fares by Vehicle Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorizedConfigs.minimum.map((config) => {
                const Icon = getConfigIcon(config.name);
                return (
                  <div key={config.id} className="bg-white rounded-lg shadow-md p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Icon size={16} className="text-gray-500" />
                      {formatLabel(config.name)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedValues[config.name] || ''}
                      onChange={(e) => handleChange(config.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    {config.description && (
                      <p className="mt-1 text-xs text-gray-500">{config.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fare Calculation Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Fare Calculation Formula</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Total Fare =</strong> Base Fare + (Distance × Per KM Rate)
            </p>
            <p className="mt-4">
              <strong>Example for Economy, 5 km:</strong>
            </p>
            <p className="ml-4">
              ${editedValues['base_fare'] || '0.00'} + (5 × ${editedValues['per_km_rate_economy'] || '0.00'})
              {' = $'}
              {(
                parseFloat(editedValues['base_fare'] || '0') +
                5 * parseFloat(editedValues['per_km_rate_economy'] || '0')
              ).toFixed(2)}
            </p>
            <p className="mt-2 text-blue-700">
              * Minimum fare of ${editedValues['minimum_fare_economy'] || '0.00'} will be applied if calculation is lower
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="d-flex justify-content-end gap-3">
          <button
            type="button"
            onClick={fetchConfig}
            disabled={saving}
            className="btn btn-secondary px-4 py-2"
          >
            Reset Changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-success d-flex align-items-center gap-2 px-4 py-2"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> Changes to configuration will affect all new ride estimates immediately. The cache is automatically updated when you save.
        </p>
      </div>
    </div>
  );
}

