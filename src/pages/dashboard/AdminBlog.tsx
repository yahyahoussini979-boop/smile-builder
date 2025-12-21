import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, ImagePlus, X, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  visibility: 'public' | 'internal_all' | 'committee_only' | 'admin_only';
  committee_tag: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const visibilityOptions = [
  { value: 'public', label: 'Public (visible par tous)' },
  { value: 'internal_all', label: 'Interne (membres uniquement)' },
  { value: 'committee_only', label: 'Comité uniquement' },
  { value: 'admin_only', label: 'Administration uniquement' },
];

const committeeOptions = ['Sponsoring', 'Communication', 'Event', 'Technique', 'Media', 'Bureau'];

export default function AdminBlog() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, hasElevatedRole } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<string>('internal_all');
  const [committeeTag, setCommitteeTag] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

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
          visibility,
          committee_tag,
          created_at,
          profiles!posts_author_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data as unknown as Post[] || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les articles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setVisibility('internal_all');
    setCommitteeTag('');
    setSelectedImage(null);
    setImagePreview(null);
    setEditingPost(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setVisibility(post.visibility);
    setCommitteeTag(post.committee_tag || '');
    setImagePreview(post.image_url);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'La taille maximale est de 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview && !editingPost?.image_url) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${user!.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('club_assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('club_assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      let imageUrl = editingPost?.image_url || null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      } else if (!imagePreview && editingPost?.image_url) {
        imageUrl = null;
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        visibility: visibility as 'public' | 'internal_all' | 'committee_only' | 'admin_only',
        committee_tag: visibility === 'committee_only' && committeeTag ? committeeTag as 'Sponsoring' | 'Communication' | 'Event' | 'Technique' | 'Media' | 'Bureau' : null,
        image_url: imageUrl,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: 'Mis à jour!',
          description: 'L\'article a été mis à jour.',
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert({
            ...postData,
            author_id: user.id,
          });

        if (error) throw error;

        toast({
          title: 'Publié!',
          description: 'L\'article a été créé.',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'article',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Supprimé!',
        description: 'L\'article a été supprimé.',
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'article',
        variant: 'destructive',
      });
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Badge variant="default">Public</Badge>;
      case 'internal_all':
        return <Badge variant="secondary">Interne</Badge>;
      case 'committee_only':
        return <Badge variant="outline">Comité</Badge>;
      case 'admin_only':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return null;
    }
  };

  // Filter posts based on search and visibility
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = visibilityFilter === 'all' || post.visibility === visibilityFilter;
    return matchesSearch && matchesVisibility;
  });

  if (!hasElevatedRole) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Gestion des Articles</h1>
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des Articles</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Articles</h1>
          <p className="text-muted-foreground">Créez et gérez les articles du blog</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 me-2" />
          Nouvel Article
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrer par visibilité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les visibilités</SelectItem>
            {visibilityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            {posts.length === 0 
              ? "Aucun article pour le moment. Créez votre premier article!"
              : "Aucun article ne correspond à votre recherche."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg truncate">{post.title}</CardTitle>
                      {getVisibilityBadge(post.visibility)}
                      {post.committee_tag && (
                        <Badge variant="outline" className="text-xs">{post.committee_tag}</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Par {post.profiles?.full_name || 'Inconnu'} • {new Date(post.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="mt-3 rounded-lg max-h-32 object-cover"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
            <DialogDescription>
              {editingPost ? 'Modifiez les informations de l\'article' : 'Créez un nouvel article pour le blog'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'article"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenu de l'article..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilité</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {visibility === 'committee_only' && (
                <div className="space-y-2">
                  <Label htmlFor="committee">Comité</Label>
                  <Select value={committeeTag || 'none'} onValueChange={(v) => setCommitteeTag(v === 'none' ? '' : v)}>
                    <SelectTrigger id="committee">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sélectionner</SelectItem>
                      {committeeOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image (optionnel)</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="max-h-48 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="post-image"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4 me-2" />
                    Ajouter une image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : editingPost ? 'Mettre à jour' : 'Publier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
