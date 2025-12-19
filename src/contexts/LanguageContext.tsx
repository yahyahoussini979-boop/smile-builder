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
  'hero.join': { fr: 'Rejoindre la famille', ar: 'انضم للعائلة' },
  
  // About
  'about.title': { fr: 'À propos de nous', ar: 'من نحن' },
  'about.mission': { fr: 'Notre Mission', ar: 'مهمتنا' },
  'about.mission.text': { 
    fr: 'Créé en septembre 2018 par des étudiants ingénieurs de la FST de Béni Mellal, Mohandiss Al Basma se distingue par des actions destinées aux personnes en situation défavorisée ou précaire. Nous œuvrons pour créer des sourires et apporter de l\'espoir aux communautés dans le besoin.',
    ar: 'تأسس في سبتمبر 2018 من قبل طلاب مهندسين من كلية العلوم والتقنيات ببني ملال. مهندس البسمة يتميز بأعمال موجهة للأشخاص في وضعية صعبة أو هشة. نعمل على خلق الابتسامات وجلب الأمل للمجتمعات المحتاجة.'
  },
  'about.history': {
    fr: 'Créé en septembre 2018 par des étudiants ingénieurs de la FST de Béni Mellal.',
    ar: 'تأسس في سبتمبر 2018 من قبل طلاب مهندسين من كلية العلوم والتقنيات ببني ملال.'
  },
  
  // Activities
  'activities.title': { fr: 'Nos Actions', ar: 'أعمالنا' },
  'activities.subtitle': { fr: 'Découvrez nos différentes initiatives pour créer un impact positif dans notre communauté.', ar: 'اكتشف مبادراتنا المختلفة لخلق تأثير إيجابي في مجتمعنا.' },
  'activities.caravanes': { fr: 'Caravanes Al Bassma', ar: 'قوافل البسمة' },
  'activities.caravanes.desc': { fr: 'Aide médicale et sociale dans les montagnes rurales. Nous apportons des soins de santé et du soutien aux communautés isolées.', ar: 'مساعدة طبية واجتماعية في المناطق الجبلية الريفية. نقدم الرعاية الصحية والدعم للمجتمعات المعزولة.' },
  'activities.bahja': { fr: 'Bahja Actions', ar: 'أعمال البهجة' },
  'activities.bahja.desc': { fr: 'Visites aux orphelinats et aux centres pour personnes âgées. Nous partageons des moments de joie et de bonheur avec ceux qui en ont besoin.', ar: 'زيارات دور الأيتام ومراكز كبار السن. نشارك لحظات الفرح والسعادة مع من يحتاجون إليها.' },
  'activities.forum': { fr: 'Forum du Savoir', ar: 'منتدى المعرفة' },
  'activities.forum.desc': { fr: 'Formations techniques et orientation pour les étudiants. Nous aidons les jeunes à développer leurs compétences et à planifier leur avenir.', ar: 'تدريبات تقنية وتوجيه للطلاب. نساعد الشباب على تطوير مهاراتهم والتخطيط لمستقبلهم.' },
  'activities.learnMore': { fr: 'En savoir plus', ar: 'اقرأ المزيد' },
  
  // Values
  'values.title': { fr: 'Nos Valeurs', ar: 'قيمنا' },
  'values.partage': { fr: 'Partage', ar: 'المشاركة' },
  'values.partage.desc': { fr: 'Nous croyons que le partage est la clé d\'une société plus juste et équitable.', ar: 'نؤمن أن المشاركة هي مفتاح مجتمع أكثر عدلاً وإنصافاً.' },
  'values.devouement': { fr: 'Dévouement', ar: 'التفاني' },
  'values.devouement.desc': { fr: 'Notre engagement total envers notre mission et les communautés que nous servons.', ar: 'التزامنا الكامل بمهمتنا والمجتمعات التي نخدمها.' },
  'values.solidarite': { fr: 'Solidarité', ar: 'التضامن' },
  'values.solidarite.desc': { fr: 'Ensemble, nous sommes plus forts pour accomplir notre mission humanitaire.', ar: 'معاً، نحن أقوى لإنجاز مهمتنا الإنسانية.' },
  'values.altruisme': { fr: 'Altruisme', ar: 'الإيثار' },
  'values.altruisme.desc': { fr: 'Nous plaçons le bien-être des autres au cœur de toutes nos actions.', ar: 'نضع رفاهية الآخرين في قلب جميع أعمالنا.' },
  
  // Contact
  'contact.title': { fr: 'Contactez-nous', ar: 'تواصل معنا' },
  'contact.name': { fr: 'Nom complet', ar: 'الاسم الكامل' },
  'contact.email': { fr: 'Email', ar: 'البريد الإلكتروني' },
  'contact.message': { fr: 'Message', ar: 'الرسالة' },
  'contact.send': { fr: 'Envoyer', ar: 'إرسال' },
  
  // Footer
  'footer.rights': { fr: 'Tous droits réservés', ar: 'جميع الحقوق محفوظة' },
  'footer.partners': { fr: 'Ils nous font confiance', ar: 'يثقون بنا' },
  'footer.links': { fr: 'Liens rapides', ar: 'روابط سريعة' },
  
  // CTA Section
  'cta.title': { fr: 'Rejoignez notre mission', ar: 'انضم إلى مهمتنا' },
  'cta.text': { fr: 'Ensemble, nous pouvons créer un avenir meilleur. Devenez membre de Mohandiss Al Basma et contribuez au changement.', ar: 'معاً، يمكننا خلق مستقبل أفضل. كن عضواً في مهندس البسمة وساهم في التغيير.' },
  
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
  
  // Stats
  'stats.members': { fr: 'Membres actifs', ar: 'أعضاء نشطين' },
  'stats.actions': { fr: 'Actions humanitaires', ar: 'أعمال إنسانية' },
  'stats.years': { fr: 'Années d\'expérience', ar: 'سنوات من الخبرة' },
  'stats.committees': { fr: 'Comités spécialisés', ar: 'لجان متخصصة' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'mab-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (stored === 'fr' || stored === 'ar') ? stored : 'fr';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
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
