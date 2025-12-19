import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === 'fr' ? 'العربية' : 'Français'}</span>
    </Button>
  );
}
