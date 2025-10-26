'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.login(email, password);
      
      // Check if user is admin
      if (response.user?.role !== 'ADMIN') {
        setError(t('login.accessDenied'));
        apiService.logout();
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.loginFailed'));
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }} dir={dir}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }}></div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            {/* Language Selector */}
            <div className="d-flex justify-content-end mb-3">
              <LanguageSelector />
            </div>
            
            {/* Main Card */}
            <div className="card shadow-lg border-0" style={{
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-5">
                {/* Logo/Icon */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                  }}>
                    <i className="bi bi-car-front-fill text-white" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">{t('login.title')}</h2>
                  <p className="text-muted mb-0">{t('login.subtitle')}</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div className="flex-grow-1">{error}</div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      <i className="bi bi-envelope me-2"></i>{t('login.emailLabel')}
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      placeholder={t('login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e0e0e0',
                        padding: '12px 16px'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      <i className="bi bi-lock me-2"></i>{t('login.passwordLabel')}
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg"
                        id="password"
                        placeholder={t('login.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          borderRadius: '12px 0 0 12px',
                          border: '2px solid #e0e0e0',
                          borderRight: 'none',
                          padding: '12px 16px'
                        }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          borderRadius: '0 12px 12px 0',
                          border: '2px solid #e0e0e0',
                          borderLeft: 'none'
                        }}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 text-white fw-bold"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      padding: '14px',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t('login.signingIn')}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        {t('login.signIn')}
                      </>
                    )}
                  </button>
                </form>

                {/* Help Text */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    <i className="bi bi-shield-lock me-1"></i>
                    {t('login.secureAccess')}
                  </small>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-white mb-1">
                <small>{t('login.copyright')}</small>
              </p>
              <p className="text-white opacity-75 mb-0">
                <small>{t('login.rights')}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
