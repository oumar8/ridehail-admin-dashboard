'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Header & Navigation
    'header.title': 'Admin Dashboard',
    'header.logout': 'Logout',
    
    // Login Page
    'login.title': 'Admin Portal',
    'login.subtitle': 'Ride Hail Management System',
    'login.emailLabel': 'Email Address',
    'login.emailPlaceholder': 'admin@ridehail.com',
    'login.passwordLabel': 'Password',
    'login.passwordPlaceholder': 'Enter your password',
    'login.signIn': 'Sign In',
    'login.signingIn': 'Signing in...',
    'login.secureAccess': 'Secure admin access only',
    'login.copyright': '© 2025 Ride Hail Platform',
    'login.rights': 'All rights reserved',
    'login.accessDenied': 'Access denied. Admin role required.',
    'login.loginFailed': 'Login failed. Please try again.',
    
    // Tabs
    'tab.drivers': 'Active Drivers',
    'tab.users': 'User Management',
    'tab.rides': 'Active Rides',
    'tab.funds': 'Driver Funds',
    'tab.pendingFunds': 'Pending Driver Funds',
    'tab.verification': 'Driver Verification',
    'tab.config': 'Configuration',
    
    // Pending Funds
    'funds.title': 'Pending Driver Funds',
    'funds.refresh': 'Refresh',
    'funds.showing': 'Showing requests from last 2 hours',
    'funds.pending': 'pending',
    'funds.noRequests': 'No fund requests found in the last 2 hours',
    'funds.amount': 'Amount Requested:',
    'funds.paymentMethod': 'Payment Method:',
    'funds.passCode': 'PassCode:',
    'funds.currentFund': 'Current Fund:',
    'funds.created': 'Created:',
    'funds.adminNotes': 'Admin Notes',
    'funds.approve': 'Approve',
    'funds.reject': 'Reject',
    'funds.processing': 'Processing...',
    'funds.totalRequests': 'Total Requests:',
    'funds.approved': 'Approved:',
    'funds.rejected': 'Rejected:',
    'funds.status.pending': 'PENDING',
    'funds.status.approved': 'APPROVED',
    'funds.status.rejected': 'REJECTED',
    
    // Driver Verification
    'verification.title': 'Driver Verification',
    'verification.description': 'Review and approve pending driver applications',
    'verification.pendingCount': 'Pending Verifications',
    'verification.noPending': 'No pending verifications',
    'verification.noPendingDesc': 'All driver applications have been processed',
    'verification.email': 'Email',
    'verification.phone': 'Phone',
    'verification.license': 'License',
    'verification.expiry': 'Expiry',
    'verification.rating': 'Rating',
    'verification.totalRides': 'Total Rides',
    'verification.updateStatus': 'Update Status',
    'verification.approve': 'Approve',
    'verification.suspend': 'Suspend',
    'verification.processing': 'Processing...',
    'verification.statusUpdated': 'Driver status updated successfully!',
    'verification.active': 'Active',
    'verification.suspended': 'Suspended',
    'verification.pending': 'Pending Verification',
    
    // User Management
    'users.title': 'User Management',
    'users.search': 'Search users by name, email, or phone...',
    'users.total': 'Total Users:',
    'users.active': 'Active:',
    'users.blocked': 'Blocked:',
    'users.block': 'Block',
    'users.unblock': 'Unblock',
    'users.delete': 'Delete',
    'users.noUsers': 'No users found',
    'users.rides': 'rides',
    'users.status.active': 'Active',
    'users.status.blocked': 'Blocked',
    
    // Drivers Map
    'drivers.title': 'Active Drivers Map',
    'drivers.listTitle': 'Active Drivers',
    'drivers.noDrivers': 'No active drivers',
    'drivers.online': 'Online',
    'drivers.offline': 'Offline',
    
    // Active Rides
    'rides.title': 'Active Rides',
    'rides.noRides': 'No active rides',
    'rides.status': 'Status',
    'rides.pickup': 'Pickup',
    'rides.dropoff': 'Dropoff',
    'rides.distance': 'Distance',
    'rides.fare': 'Fare',
    'rides.driver': 'Driver',
    'rides.passenger': 'Passenger',
    'rides.totalActive': 'Total Active',
    'rides.requested': 'Requested',
    'rides.accepted': 'Accepted',
    'rides.inProgress': 'In Progress',
    'rides.rideId': 'Ride ID',
    'rides.locations': 'Locations',
    'rides.details': 'Details',
    'rides.time': 'Time',
    'rides.searching': 'Searching...',
    
    // Driver Fund Management
    'driverFunds.title': 'Driver Fund Management',
    'driverFunds.description': 'Manage driver account funds and view earnings',
    'driverFunds.availableFund': 'Available Fund',
    'driverFunds.totalEarnings': 'Total Earnings',
    'driverFunds.totalRides': 'Total Rides',
    'driverFunds.status': 'Status',
    'driverFunds.lowFund': 'Low Fund',
    'driverFunds.lowFunds': 'Low Funds',
    'driverFunds.depleted': 'Depleted',
    'driverFunds.summary': 'Fund Summary',
    'driverFunds.totalDrivers': 'Total Drivers',
    'driverFunds.totalFunds': 'Total Funds',
    'driverFunds.avgFund': 'Average Fund',
    'driverFunds.noDrivers': 'No drivers found',
    
    // Configuration
    'config.title': 'System Configuration',
    'config.save': 'Save Changes',
    'config.saved': 'Configuration saved successfully',
    'config.error': 'Failed to save configuration',
    'config.baseFare': 'Base Fare',
    'config.perKmRate': 'Per Kilometer Rate',
    'config.perMinuteRate': 'Per Minute Rate',
    'config.minimumFare': 'Minimum Fare',
    'config.commissionRate': 'Commission Rate',
    'config.currency': 'Currency',
    'config.description': 'Manage system-wide settings',
    
    // Common
    'common.loading': 'Loading...',
    'common.email': 'Email:',
    'common.phone': 'Phone:',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.refresh': 'Refresh',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.currency': 'MRU',
    'common.na': 'N/A',
    'common.km': 'km',
    'common.min': 'min',
    
    // Error Messages
    'error.generic': 'An error occurred. Please try again.',
    'error.network': 'Network error. Please check your connection.',
    'error.unauthorized': 'Unauthorized. Please login again.',
    'error.notFound': 'Resource not found.',
    'error.serverError': 'Server error. Please try again later.',
  },
  
  ar: {
    // Header & Navigation
    'header.title': 'لوحة التحكم',
    'header.logout': 'تسجيل الخروج',
    
    // Login Page
    'login.title': 'بوابة المسؤول',
    'login.subtitle': 'نظام إدارة خدمة النقل',
    'login.emailLabel': 'البريد الإلكتروني',
    'login.emailPlaceholder': 'admin@ridehail.com',
    'login.passwordLabel': 'كلمة المرور',
    'login.passwordPlaceholder': 'أدخل كلمة المرور',
    'login.signIn': 'تسجيل الدخول',
    'login.signingIn': 'جاري تسجيل الدخول...',
    'login.secureAccess': 'وصول آمن للمسؤولين فقط',
    'login.copyright': '© 2025 منصة خدمة النقل',
    'login.rights': 'جميع الحقوق محفوظة',
    'login.accessDenied': 'تم رفض الوصول. مطلوب دور المسؤول.',
    'login.loginFailed': 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    
    // Tabs
    'tab.drivers': 'السائقون النشطون',
    'tab.users': 'إدارة المستخدمين',
    'tab.rides': 'الرحلات النشطة',
    'tab.funds': 'أموال السائقين',
    'tab.pendingFunds': 'طلبات تمويل السائقين',
    'tab.verification': 'التحقق من السائقين',
    'tab.config': 'الإعدادات',
    
    // Pending Funds
    'funds.title': 'طلبات تمويل السائقين',
    'funds.refresh': 'تحديث',
    'funds.showing': 'عرض الطلبات من آخر ساعتين',
    'funds.pending': 'قيد الانتظار',
    'funds.noRequests': 'لا توجد طلبات تمويل في آخر ساعتين',
    'funds.amount': 'المبلغ المطلوب:',
    'funds.paymentMethod': 'طريقة الدفع:',
    'funds.passCode': 'الرمز السري:',
    'funds.currentFund': 'الرصيد الحالي:',
    'funds.created': 'تاريخ الإنشاء:',
    'funds.adminNotes': 'ملاحظات المسؤول',
    'funds.approve': 'موافقة',
    'funds.reject': 'رفض',
    'funds.processing': 'جاري المعالجة...',
    'funds.totalRequests': 'إجمالي الطلبات:',
    'funds.approved': 'موافق عليها:',
    'funds.rejected': 'مرفوضة:',
    'funds.status.pending': 'قيد الانتظار',
    'funds.status.approved': 'موافق عليها',
    'funds.status.rejected': 'مرفوضة',
    
    // Driver Verification
    'verification.title': 'التحقق من السائقين',
    'verification.description': 'مراجعة والموافقة على طلبات السائقين المعلقة',
    'verification.pendingCount': 'التحققات المعلقة',
    'verification.noPending': 'لا توجد تحققات معلقة',
    'verification.noPendingDesc': 'تم معالجة جميع طلبات السائقين',
    'verification.email': 'البريد الإلكتروني',
    'verification.phone': 'الهاتف',
    'verification.license': 'الترخيص',
    'verification.expiry': 'تاريخ الانتهاء',
    'verification.rating': 'التقييم',
    'verification.totalRides': 'إجمالي الرحلات',
    'verification.updateStatus': 'تحديث الحالة',
    'verification.approve': 'موافقة',
    'verification.suspend': 'تعليق',
    'verification.processing': 'جاري المعالجة...',
    'verification.statusUpdated': 'تم تحديث حالة السائق بنجاح!',
    'verification.active': 'نشط',
    'verification.suspended': 'معلق',
    'verification.pending': 'قيد التحقق',
    
    // User Management
    'users.title': 'إدارة المستخدمين',
    'users.search': 'البحث عن المستخدمين بالاسم أو البريد الإلكتروني أو الهاتف...',
    'users.total': 'إجمالي المستخدمين:',
    'users.active': 'نشط:',
    'users.blocked': 'محظور:',
    'users.block': 'حظر',
    'users.unblock': 'إلغاء الحظر',
    'users.delete': 'حذف',
    'users.noUsers': 'لم يتم العثور على مستخدمين',
    'users.rides': 'رحلة',
    'users.status.active': 'نشط',
    'users.status.blocked': 'محظور',
    
    // Drivers Map
    'drivers.title': 'خريطة السائقين النشطين',
    'drivers.listTitle': 'السائقون النشطون',
    'drivers.noDrivers': 'لا يوجد سائقون نشطون',
    'drivers.online': 'متصل',
    'drivers.offline': 'غير متصل',
    
    // Active Rides
    'rides.title': 'الرحلات النشطة',
    'rides.noRides': 'لا توجد رحلات نشطة',
    'rides.status': 'الحالة',
    'rides.pickup': 'نقطة الانطلاق',
    'rides.dropoff': 'الوجهة',
    'rides.distance': 'المسافة',
    'rides.fare': 'الأجرة',
    'rides.driver': 'السائق',
    'rides.passenger': 'الراكب',
    'rides.totalActive': 'إجمالي النشطة',
    'rides.requested': 'مطلوبة',
    'rides.accepted': 'مقبولة',
    'rides.inProgress': 'قيد التنفيذ',
    'rides.rideId': 'معرف الرحلة',
    'rides.locations': 'المواقع',
    'rides.details': 'التفاصيل',
    'rides.time': 'الوقت',
    'rides.searching': 'جاري البحث...',
    
    // Driver Fund Management
    'driverFunds.title': 'إدارة أموال السائقين',
    'driverFunds.description': 'إدارة أرصدة حسابات السائقين ومشاهدة الأرباح',
    'driverFunds.availableFund': 'الرصيد المتاح',
    'driverFunds.totalEarnings': 'إجمالي الأرباح',
    'driverFunds.totalRides': 'إجمالي الرحلات',
    'driverFunds.status': 'الحالة',
    'driverFunds.lowFund': 'رصيد منخفض',
    'driverFunds.lowFunds': 'أرصدة منخفضة',
    'driverFunds.depleted': 'نفد الرصيد',
    'driverFunds.summary': 'ملخص الأموال',
    'driverFunds.totalDrivers': 'إجمالي السائقين',
    'driverFunds.totalFunds': 'إجمالي الأموال',
    'driverFunds.avgFund': 'متوسط الرصيد',
    'driverFunds.noDrivers': 'لم يتم العثور على سائقين',
    
    // Configuration
    'config.title': 'إعدادات النظام',
    'config.save': 'حفظ التغييرات',
    'config.saved': 'تم حفظ الإعدادات بنجاح',
    'config.error': 'فشل حفظ الإعدادات',
    'config.baseFare': 'الأجرة الأساسية',
    'config.perKmRate': 'سعر الكيلومتر',
    'config.perMinuteRate': 'سعر الدقيقة',
    'config.minimumFare': 'الحد الأدنى للأجرة',
    'config.commissionRate': 'نسبة العمولة',
    'config.currency': 'العملة',
    'config.description': 'إدارة إعدادات النظام',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.email': 'البريد الإلكتروني:',
    'common.phone': 'الهاتف:',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.refresh': 'تحديث',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.currency': 'أوقية',
    'common.na': 'غير متاح',
    'common.km': 'كم',
    'common.min': 'دقيقة',
    
    // Error Messages
    'error.generic': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    'error.network': 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
    'error.unauthorized': 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.',
    'error.notFound': 'المورد غير موجود.',
    'error.serverError': 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
  },
  
  fr: {
    // Header & Navigation
    'header.title': 'Tableau de Bord Admin',
    'header.logout': 'Déconnexion',
    
    // Login Page
    'login.title': 'Portail Administrateur',
    'login.subtitle': 'Système de Gestion de Covoiturage',
    'login.emailLabel': 'Adresse Email',
    'login.emailPlaceholder': 'admin@ridehail.com',
    'login.passwordLabel': 'Mot de Passe',
    'login.passwordPlaceholder': 'Entrez votre mot de passe',
    'login.signIn': 'Se Connecter',
    'login.signingIn': 'Connexion en cours...',
    'login.secureAccess': 'Accès sécurisé administrateurs uniquement',
    'login.copyright': '© 2025 Plateforme de Covoiturage',
    'login.rights': 'Tous droits réservés',
    'login.accessDenied': 'Accès refusé. Rôle administrateur requis.',
    'login.loginFailed': 'Échec de la connexion. Veuillez réessayer.',
    
    // Tabs
    'tab.drivers': 'Chauffeurs Actifs',
    'tab.users': 'Gestion des Utilisateurs',
    'tab.rides': 'Courses Actives',
    'tab.funds': 'Fonds des Chauffeurs',
    'tab.pendingFunds': 'Demandes de Fonds en Attente',
    'tab.verification': 'Vérification des Chauffeurs',
    'tab.config': 'Configuration',
    
    // Pending Funds
    'funds.title': 'Demandes de Fonds en Attente',
    'funds.refresh': 'Actualiser',
    'funds.showing': 'Affichage des demandes des 2 dernières heures',
    'funds.pending': 'en attente',
    'funds.noRequests': 'Aucune demande de fonds trouvée dans les 2 dernières heures',
    'funds.amount': 'Montant Demandé:',
    'funds.paymentMethod': 'Méthode de Paiement:',
    'funds.passCode': 'Code d\'Accès:',
    'funds.currentFund': 'Fonds Actuel:',
    'funds.created': 'Créé:',
    'funds.adminNotes': 'Notes Admin',
    'funds.approve': 'Approuver',
    'funds.reject': 'Rejeter',
    'funds.processing': 'Traitement...',
    'funds.totalRequests': 'Total Demandes:',
    'funds.approved': 'Approuvées:',
    'funds.rejected': 'Rejetées:',
    'funds.status.pending': 'EN ATTENTE',
    'funds.status.approved': 'APPROUVÉE',
    'funds.status.rejected': 'REJETÉE',
    
    // Driver Verification
    'verification.title': 'Vérification des Chauffeurs',
    'verification.description': 'Examiner et approuver les demandes de chauffeurs en attente',
    'verification.pendingCount': 'Vérifications en Attente',
    'verification.noPending': 'Aucune vérification en attente',
    'verification.noPendingDesc': 'Toutes les demandes de chauffeurs ont été traitées',
    'verification.email': 'Email',
    'verification.phone': 'Téléphone',
    'verification.license': 'Permis',
    'verification.expiry': 'Expiration',
    'verification.rating': 'Note',
    'verification.totalRides': 'Total de Courses',
    'verification.updateStatus': 'Mettre à Jour le Statut',
    'verification.approve': 'Approuver',
    'verification.suspend': 'Suspendre',
    'verification.processing': 'Traitement...',
    'verification.statusUpdated': 'Statut du chauffeur mis à jour avec succès!',
    'verification.active': 'Actif',
    'verification.suspended': 'Suspendu',
    'verification.pending': 'Vérification en Attente',
    
    // User Management
    'users.title': 'Gestion des Utilisateurs',
    'users.search': 'Rechercher par nom, email ou téléphone...',
    'users.total': 'Total Utilisateurs:',
    'users.active': 'Actifs:',
    'users.blocked': 'Bloqués:',
    'users.block': 'Bloquer',
    'users.unblock': 'Débloquer',
    'users.delete': 'Supprimer',
    'users.noUsers': 'Aucun utilisateur trouvé',
    'users.rides': 'courses',
    'users.status.active': 'Actif',
    'users.status.blocked': 'Bloqué',
    
    // Drivers Map
    'drivers.title': 'Carte des Chauffeurs Actifs',
    'drivers.listTitle': 'Chauffeurs Actifs',
    'drivers.noDrivers': 'Aucun chauffeur actif',
    'drivers.online': 'En ligne',
    'drivers.offline': 'Hors ligne',
    
    // Active Rides
    'rides.title': 'Courses Actives',
    'rides.noRides': 'Aucune course active',
    'rides.status': 'Statut',
    'rides.pickup': 'Point de départ',
    'rides.dropoff': 'Destination',
    'rides.distance': 'Distance',
    'rides.fare': 'Tarif',
    'rides.driver': 'Chauffeur',
    'rides.passenger': 'Passager',
    'rides.totalActive': 'Total Actives',
    'rides.requested': 'Demandées',
    'rides.accepted': 'Acceptées',
    'rides.inProgress': 'En Cours',
    'rides.rideId': 'ID Course',
    'rides.locations': 'Emplacements',
    'rides.details': 'Détails',
    'rides.time': 'Heure',
    'rides.searching': 'Recherche...',
    
    // Driver Fund Management
    'driverFunds.title': 'Gestion des Fonds des Chauffeurs',
    'driverFunds.description': 'Gérer les fonds des comptes des chauffeurs et voir les gains',
    'driverFunds.availableFund': 'Fonds Disponible',
    'driverFunds.totalEarnings': 'Gains Totaux',
    'driverFunds.totalRides': 'Courses Totales',
    'driverFunds.status': 'Statut',
    'driverFunds.lowFund': 'Fonds Faible',
    'driverFunds.lowFunds': 'Fonds Faibles',
    'driverFunds.depleted': 'Épuisé',
    'driverFunds.summary': 'Résumé des Fonds',
    'driverFunds.totalDrivers': 'Total Chauffeurs',
    'driverFunds.totalFunds': 'Total Fonds',
    'driverFunds.avgFund': 'Fonds Moyen',
    'driverFunds.noDrivers': 'Aucun chauffeur trouvé',
    
    // Configuration
    'config.title': 'Configuration du Système',
    'config.save': 'Enregistrer',
    'config.saved': 'Configuration enregistrée avec succès',
    'config.error': 'Échec de l\'enregistrement',
    'config.baseFare': 'Tarif de Base',
    'config.perKmRate': 'Tarif par Kilomètre',
    'config.perMinuteRate': 'Tarif par Minute',
    'config.minimumFare': 'Tarif Minimum',
    'config.commissionRate': 'Taux de Commission',
    'config.currency': 'Devise',
    'config.description': 'Gérer les paramètres du système',
    
    // Common
    'common.loading': 'Chargement...',
    'common.email': 'Email:',
    'common.phone': 'Téléphone:',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.refresh': 'Actualiser',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher',
    'common.currency': 'MRU',
    'common.na': 'N/D',
    'common.km': 'km',
    'common.min': 'min',
    
    // Error Messages
    'error.generic': 'Une erreur s\'est produite. Veuillez réessayer.',
    'error.network': 'Erreur réseau. Vérifiez votre connexion.',
    'error.unauthorized': 'Non autorisé. Reconnectez-vous.',
    'error.notFound': 'Ressource non trouvée.',
    'error.serverError': 'Erreur serveur. Réessayez plus tard.',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('adminLanguage') as Language;
    if (saved && ['en', 'ar', 'fr'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  // Update HTML dir attribute for RTL support
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('adminLanguage', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

