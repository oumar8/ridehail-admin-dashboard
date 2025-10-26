'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Driver } from '@/lib/types';

interface MapViewProps {
  drivers: Driver[];
}

export default function MapView({ drivers }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Fix for default markers in Leaflet - only run on client side
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setIsMounted(true);
    }
  }, []);

  // Don't render map until client-side is ready
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // Default center (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];

  // Get center from drivers if available
  const center: [number, number] =
    drivers.length > 0 && drivers[0].currentLocation
      ? [drivers[0].currentLocation.latitude, drivers[0].currentLocation.longitude]
      : defaultCenter;

  // Create custom icons based on driver status
  const createDriverIcon = (driver: Driver) => {
    const color = !driver.isOnline
      ? '#6B7280'
      : driver.isAvailable
      ? '#10B981'
      : '#F59E0B';

    return L.divIcon({
      className: 'custom-driver-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {drivers.map((driver) => {
        if (!driver.currentLocation) return null;
        return (
          <Marker
            key={driver.id}
            position={[driver.currentLocation.latitude, driver.currentLocation.longitude]}
            icon={createDriverIcon(driver)}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">
                  {driver.firstName} {driver.lastName}
                </p>
                <p className="text-sm text-gray-600">{driver.phone}</p>
                <p className="text-sm">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      driver.isAvailable ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {driver.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </p>
                {driver.vehicle && (
                  <p className="text-sm text-gray-600">
                    {driver.vehicle.make} {driver.vehicle.model} - {driver.vehicle.licensePlate}
                  </p>
                )}
                <p className="text-sm">Rating: ⭐ {Number(driver.rating).toFixed(1)}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

