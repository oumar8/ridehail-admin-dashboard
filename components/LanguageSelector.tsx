'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="dropdown">
      <button
        className="btn btn-light d-flex align-items-center gap-2"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <Globe size={18} />
        <span>{languages.find(l => l.code === language)?.flag}</span>
        <span className="d-none d-md-inline">
          {languages.find(l => l.code === language)?.name}
        </span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {languages.map((lang) => (
          <li key={lang.code}>
            <button
              className={`dropdown-item d-flex align-items-center gap-2 ${
                language === lang.code ? 'active' : ''
              }`}
              onClick={() => setLanguage(lang.code as any)}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <i className="bi bi-check-lg ms-auto"></i>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

