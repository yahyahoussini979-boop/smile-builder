import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Calendar, Award, ArrowRight, Smile, BookOpen, Stethoscope } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Home() {
  const { t } = useLanguage();

  const activities = [
    {
      icon: Stethoscope,
      title: t('activities.caravanes'),
      description: t('activities.caravanes.desc'),
    },
    {
      icon: Smile,
      title: t('activities.bahja'),
      description: t('activities.bahja.desc'),
    },
    {
      icon: BookOpen,
      title: t('activities.forum'),
      description: t('activities.forum.desc'),
    },
  ];

  const stats = [
    { icon: Users, value: '100+', label: 'Membres actifs' },
    { icon: Heart, value: '50+', label: 'Actions humanitaires' },
    { icon: Calendar, value: '10+', label: 'Années d\'expérience' },
    { icon: Award, value: '5', label: 'Comités spécialisés' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <img src={logo} alt="Mohandiss Al Basma" className="h-24 md:h-32 w-auto mx-auto mb-8 brightness-0 invert" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link to="/about" className="gap-2">
                  {t('hero.cta')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/auth">{t('hero.join')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('activities.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos différentes initiatives pour créer un impact positif dans notre communauté.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <activity.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription>{activity.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/about" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                    En savoir plus <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Rejoignez notre mission</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Ensemble, nous pouvons créer un avenir meilleur. Devenez membre de Mohandiss Al Basma et contribuez au changement.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">{t('hero.join')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
