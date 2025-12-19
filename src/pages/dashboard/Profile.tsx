import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Edit, Mail, Calendar, Trophy, FileText, Lock, Plus } from 'lucide-react';
import { useState } from 'react';

// Sample user profile
const userProfile = {
  name: 'Sara Amrani',
  email: 'sara.amrani@example.com',
  role: 'Respo Media',
  committee: 'Media',
  status: 'active',
  joinDate: '2022-09-01',
  totalPoints: 156,
  tasksCompleted: 23,
  avatar: '',
};

// Sample shared notes
const sharedNotes = [
  { id: 1, content: 'Disponible pour aider avec le montage vidéo cette semaine!', date: '2024-01-15' },
  { id: 2, content: 'J\'ai des contacts chez Radio Plus pour l\'interview.', date: '2024-01-10' },
];

// Sample admin notes (visible only to user + admins)
const adminNotes = [
  { id: 1, content: 'Excellent travail sur la dernière campagne média! Continue comme ça.', author: 'Ahmed Benali', date: '2024-01-12' },
];

export default function Profile() {
  const { t } = useLanguage();
  const [newNote, setNewNote] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.profile')}</h1>
        <p className="text-muted-foreground">Gérez votre profil et vos notes</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={userProfile.avatar} />
              <AvatarFallback className="text-2xl">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{userProfile.name}</CardTitle>
            <CardDescription className="flex flex-col items-center gap-2">
              <Badge>{userProfile.role}</Badge>
              <span>{userProfile.committee}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {userProfile.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Membre depuis {new Date(userProfile.joinDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{userProfile.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProfile.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tâches</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Edit className="h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="shared">
            <TabsList>
              <TabsTrigger value="shared" className="gap-2">
                <FileText className="h-4 w-4" />
                Notes partagées
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <Lock className="h-4 w-4" />
                Notes admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shared" className="space-y-4 mt-4">
              {/* Add new note */}
              <Card>
                <CardContent className="pt-6">
                  <Textarea
                    placeholder="Ajoutez une note visible par tous les membres..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button disabled={!newNote.trim()} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Publier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing notes */}
              {sharedNotes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="py-4">
                    <p className="text-foreground">{note.content}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(note.date).toLocaleDateString('fr-FR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-4">
              <Card className="bg-muted/50 border-dashed">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Notes privées
                  </CardTitle>
                  <CardDescription>
                    Ces notes sont visibles uniquement par vous et les administrateurs.
                  </CardDescription>
                </CardHeader>
              </Card>

              {adminNotes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="py-4">
                    <p className="text-foreground">{note.content}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Par {note.author} • {new Date(note.date).toLocaleDateString('fr-FR')}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {adminNotes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune note admin pour le moment.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
