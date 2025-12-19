import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';

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

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
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
        .eq('id', id)
        .eq('visibility', 'public')
        .single();

      if (error) throw error;
      setPost(data as unknown as BlogPost);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📰</div>
        <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
        <Link to="/blog" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero with image */}
      <section className="relative">
        {post.image_url ? (
          <div className="h-64 md:h-96 w-full">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        ) : (
          <div className="h-32 md:h-48 gradient-primary" />
        )}
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="text-primary font-medium hover:underline inline-flex items-center gap-1 mb-8">
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground mb-8 border-b pb-6">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.profiles?.full_name || 'Admin'}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
