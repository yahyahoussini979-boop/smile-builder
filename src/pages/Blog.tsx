import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample blog posts data
const posts = [
  {
    id: 1,
    title: 'Caravane médicale à Azilal',
    excerpt: 'Notre dernière caravane médicale a permis de servir plus de 500 personnes dans la région d\'Azilal...',
    author: 'Ahmed Benali',
    date: '2024-01-15',
    image: null,
    category: 'Caravanes',
  },
  {
    id: 2,
    title: 'Forum du Savoir 2024',
    excerpt: 'Le Forum du Savoir revient cette année avec des ateliers passionnants sur l\'intelligence artificielle...',
    author: 'Sara Amrani',
    date: '2024-01-10',
    image: null,
    category: 'Événements',
  },
  {
    id: 3,
    title: 'Visite à l\'orphelinat de Fqih Ben Saleh',
    excerpt: 'Une journée remplie de joie et de sourires avec les enfants de l\'orphelinat...',
    author: 'Youssef Elhadi',
    date: '2024-01-05',
    image: null,
    category: 'Bahja',
  },
];

export default function Blog() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('nav.blog')}</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Découvrez nos dernières actualités et actions humanitaires.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 flex flex-col">
                {/* Image placeholder */}
                <div className="h-48 bg-muted rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl">📰</span>
                  </div>
                </div>
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Empty state for more posts */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Plus d'articles à venir bientôt...</p>
            <Link to="/" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Retour à l'accueil <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
