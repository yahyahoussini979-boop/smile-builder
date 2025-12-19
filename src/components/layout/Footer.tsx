import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.png';

export function Footer() {
  const { t } = useLanguage();

  const partners = [
    'AMFEC',
    'Géoparc M\'Goun',
    'FST Béni Mellal',
    'AIESEC',
    'Rotaract'
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Slogan */}
          <div className="flex flex-col items-start gap-4">
            <img src={logo} alt="Mohandiss Al Basma" className="h-12 w-auto brightness-0 invert" />
            <p className="text-sm opacity-90">{t('hero.subtitle')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.links')}</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="/" className="hover:opacity-100 transition-opacity">{t('nav.home')}</a></li>
              <li><a href="/about" className="hover:opacity-100 transition-opacity">{t('nav.about')}</a></li>
              <li><a href="/contact" className="hover:opacity-100 transition-opacity">{t('nav.contact')}</a></li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.partners')}</h4>
            <ul className="space-y-2 text-sm opacity-90">
              {partners.map((partner) => (
                <li key={partner}>{partner}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-75">
          © {new Date().getFullYear()} Mohandiss Al Basma. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
}
