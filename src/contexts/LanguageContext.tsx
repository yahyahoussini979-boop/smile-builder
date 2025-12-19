import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface Translations {
  [key: string]: {
    fr: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { fr: 'Accueil', ar: 'الرئيسية' },
  'nav.about': { fr: 'À propos', ar: 'من نحن' },
  'nav.contact': { fr: 'Contact', ar: 'اتصل بنا' },
  'nav.blog': { fr: 'Blog', ar: 'المدونة' },
  'nav.login': { fr: 'Connexion', ar: 'تسجيل الدخول' },
  'nav.dashboard': { fr: 'Tableau de bord', ar: 'لوحة التحكم' },
  
  // Hero
  'hero.title': { fr: 'Mohandiss Al Basma', ar: 'مهندس البسمة' },
  'hero.subtitle': { fr: 'Tous pour un avenir étincelant', ar: 'الكل من أجل مستقبل مشرق' },
  'hero.cta': { fr: 'Découvrir nos actions', ar: 'اكتشف أعمالنا' },
  'hero.join': { fr: 'Rejoindre le club', ar: 'انضم للنادي' },
  
  // About
  'about.title': { fr: 'À propos de nous', ar: 'من نحن' },
  'about.mission': { fr: 'Notre Mission', ar: 'مهمتنا' },
  'about.mission.text': { 
    fr: 'Mohandiss Al Basma est un club humanitaire estudiantin basé à la FST Béni Mellal. Nous œuvrons pour créer des sourires et apporter de l\'espoir aux communautés dans le besoin.',
    ar: 'مهندس البسمة هو نادي إنساني طلابي مقره في كلية العلوم والتقنيات ببني ملال. نعمل على خلق الابتسامات وجلب الأمل للمجتمعات المحتاجة.'
  },
  
  // Activities
  'activities.title': { fr: 'Nos Activités', ar: 'أنشطتنا' },
  'activities.caravanes': { fr: 'Caravanes Al Bassma', ar: 'قوافل البسمة' },
  'activities.caravanes.desc': { fr: 'Caravanes médicales et sociales', ar: 'قوافل طبية واجتماعية' },
  'activities.bahja': { fr: 'Bahja Actions', ar: 'أعمال البهجة' },
  'activities.bahja.desc': { fr: 'Visites aux orphelinats', ar: 'زيارات دور الأيتام' },
  'activities.forum': { fr: 'Forum du Savoir', ar: 'منتدى المعرفة' },
  'activities.forum.desc': { fr: 'Ateliers techniques', ar: 'ورشات تقنية' },
  
  // Contact
  'contact.title': { fr: 'Contactez-nous', ar: 'تواصل معنا' },
  'contact.name': { fr: 'Nom complet', ar: 'الاسم الكامل' },
  'contact.email': { fr: 'Email', ar: 'البريد الإلكتروني' },
  'contact.message': { fr: 'Message', ar: 'الرسالة' },
  'contact.send': { fr: 'Envoyer', ar: 'إرسال' },
  
  // Footer
  'footer.rights': { fr: 'Tous droits réservés', ar: 'جميع الحقوق محفوظة' },
  'footer.partners': { fr: 'Nos Partenaires', ar: 'شركاؤنا' },
  
  // Dashboard
  'dashboard.feed': { fr: 'Fil d\'actualité', ar: 'آخر الأخبار' },
  'dashboard.leaderboard': { fr: 'Classement', ar: 'الترتيب' },
  'dashboard.members': { fr: 'Membres', ar: 'الأعضاء' },
  'dashboard.meetings': { fr: 'Réunions', ar: 'الاجتماعات' },
  'dashboard.points': { fr: 'Points', ar: 'النقاط' },
  'dashboard.profile': { fr: 'Profil', ar: 'الملف الشخصي' },
  'dashboard.logout': { fr: 'Déconnexion', ar: 'تسجيل الخروج' },
  'dashboard.myCommittee': { fr: 'Mon Comité', ar: 'لجنتي' },
  'dashboard.allClub': { fr: 'Tout le Club', ar: 'كل النادي' },
  
  // Auth
  'auth.login': { fr: 'Connexion', ar: 'تسجيل الدخول' },
  'auth.signup': { fr: 'Inscription', ar: 'إنشاء حساب' },
  'auth.email': { fr: 'Email', ar: 'البريد الإلكتروني' },
  'auth.password': { fr: 'Mot de passe', ar: 'كلمة المرور' },
  'auth.forgotPassword': { fr: 'Mot de passe oublié?', ar: 'نسيت كلمة المرور؟' },
  'auth.noAccount': { fr: 'Pas de compte?', ar: 'ليس لديك حساب؟' },
  'auth.hasAccount': { fr: 'Déjà un compte?', ar: 'لديك حساب بالفعل؟' },
  
  // Committees
  'committee.sponsoring': { fr: 'Sponsoring', ar: 'الرعاية' },
  'committee.communication': { fr: 'Communication', ar: 'التواصل' },
  'committee.event': { fr: 'Événements', ar: 'الفعاليات' },
  'committee.technique': { fr: 'Technique', ar: 'التقنية' },
  'committee.media': { fr: 'Média', ar: 'الإعلام' },
  
  // Blog
  'blog.readMore': { fr: 'Lire la suite', ar: 'اقرأ المزيد' },
  'blog.postedBy': { fr: 'Publié par', ar: 'نشر بواسطة' },
  'blog.on': { fr: 'le', ar: 'في' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
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
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
