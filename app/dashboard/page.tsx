'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MapPin, Car, Settings, LogOut, Wallet, DollarSign, UserCheck, Trash2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import DriversMap from '@/components/DriversMap';
import UserManagement from '@/components/UserManagement';
import ActiveRides from '@/components/ActiveRides';
import ConfigManagement from '@/components/ConfigManagement';
import DriverFundManagement from '@/components/DriverFundManagement';
import FundRequestManagement from '@/components/FundRequestManagement';
import DriverVerification from '@/components/DriverVerification';
import RideCleanup from '@/components/RideCleanup';

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('drivers');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  const handleLogout = () => {
    apiService.logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'drivers', label: t('tab.drivers'), icon: MapPin },
    { id: 'users', label: t('tab.users'), icon: Users },
    { id: 'rides', label: t('tab.rides'), icon: Car },
    { id: 'cleanup', label: 'Ride Cleanup', icon: Trash2 },
    { id: 'funds', label: t('tab.funds'), icon: Wallet },
    { id: 'pending-funds', label: t('tab.pendingFunds'), icon: DollarSign },
    { id: 'verification', label: t('tab.verification'), icon: UserCheck },
    { id: 'config', label: t('tab.config'), icon: Settings },
  ];

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center py-3">
            <h1 className="h3 mb-0 fw-bold text-dark">
              <i className="bi bi-speedometer2 me-2"></i>
              {t('header.title')}
            </h1>
            <div className="d-flex align-items-center gap-2">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="btn btn-danger d-flex align-items-center gap-2"
              >
                <LogOut size={18} />
                <span>{t('header.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-bottom">
        <div className="container-fluid px-4">
          <ul className="nav nav-tabs border-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li className="nav-item" key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-link border-0 d-flex align-items-center gap-2 px-3 py-3 ${
                      activeTab === tab.id
                        ? 'active text-primary border-bottom border-primary border-3'
                        : 'text-secondary'
                    }`}
                    style={{
                      borderRadius: '0',
                      background: 'transparent',
                      fontWeight: activeTab === tab.id ? '600' : '400'
                    }}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Content */}
      <main className="container-fluid px-4 py-4">
        {activeTab === 'drivers' && <DriversMap />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'rides' && <ActiveRides />}
        {activeTab === 'cleanup' && <RideCleanup />}
        {activeTab === 'funds' && <DriverFundManagement />}
        {activeTab === 'pending-funds' && <FundRequestManagement />}
        {activeTab === 'verification' && <DriverVerification />}
        {activeTab === 'config' && <ConfigManagement />}
      </main>
    </div>
  );
}

