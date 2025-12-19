import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function Blog() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          image_url,
          created_at,
          profiles!posts_author_id_fkey(full_name)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data as unknown as BlogPost[] || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h2 className="text-2xl font-bold mb-2">Aucun article pour le moment</h2>
              <p className="text-muted-foreground mb-6">
                Nos actualités seront bientôt disponibles.
              </p>
              <Link to="/" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                Retour à l'accueil <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer">
                      {/* Image placeholder */}
                      <div className="h-48 bg-muted rounded-t-lg overflow-hidden">
                        {post.image_url ? (
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-4xl">📰</span>
                          </div>
                        )}
                      </div>
                      <CardHeader className="flex-1">
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.content}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.profiles?.full_name || 'Admin'}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(post.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-16 text-center">
                <Link to="/" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Retour à l'accueil <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
