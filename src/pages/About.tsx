import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Award } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  const committees = [
    { name: t('committee.sponsoring'), color: 'bg-blue-500' },
    { name: t('committee.communication'), color: 'bg-purple-500' },
    { name: t('committee.event'), color: 'bg-orange-500' },
    { name: t('committee.technique'), color: 'bg-cyan-500' },
    { name: t('committee.media'), color: 'bg-pink-500' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Solidarité',
      description: 'Nous croyons en l\'entraide et la compassion envers les plus démunis.',
    },
    {
      icon: Users,
      title: 'Travail d\'équipe',
      description: 'Ensemble, nous sommes plus forts pour accomplir notre mission.',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Nous visons toujours l\'excellence dans toutes nos actions.',
    },
    {
      icon: Award,
      title: 'Engagement',
      description: 'Notre engagement envers la communauté est notre plus grande fierté.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Découvrez qui nous sommes et notre engagement pour un avenir meilleur.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('about.mission')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.mission.text')}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <value.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Committees */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Comités</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {committees.map((committee, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border shadow-sm"
              >
                <div className={`w-3 h-3 rounded-full ${committee.color}`}></div>
                <span className="font-medium">{committee.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Notre Structure</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Bureau Exécutif</CardTitle>
                  <CardDescription>Les piliers du club</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Président(e)</li>
                    <li>• Vice-Président(e)</li>
                    <li>• Secrétaire Général(e)</li>
                    <li>• Trésorier(ère)</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Responsables de Comités</CardTitle>
                  <CardDescription>Les leaders des équipes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Respo Événements</li>
                    <li>• Respo Média</li>
                    <li>• Respo Communication</li>
                    <li>• Respo Technique</li>
                    <li>• Respo Sponsoring</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
