import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Mail, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Member {
  id: string;
  full_name: string;
  avatar_url: string | null;
  committee: string | null;
  status: 'active' | 'embesa' | 'banned';
  total_points: number;
  created_at: string;
}

interface MemberWithRole extends Member {
  role?: string;
  email?: string;
}

const committees = ['Tous', 'Bureau', 'Media', 'Event', 'Communication', 'Technique', 'Sponsoring'];
const statuses = ['Tous', 'Actif', 'Embesa'];
const committeeOptions = ['Sponsoring', 'Communication', 'Event', 'Technique', 'Media', 'Bureau'];
const roleOptions = ['member', 'respo', 'admin', 'bureau', 'embesa'];

export default function Members() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { hasElevatedRole, role: userRole } = useAuth();
  const [search, setSearch] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberWithRole | null>(null);
  const [editCommittee, setEditCommittee] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = userRole === 'bureau' || userRole === 'admin';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Fetch roles for all users (if we have permission)
      let rolesMap: Record<string, string> = {};
      if (hasElevatedRole) {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role');
        
        if (rolesData) {
          rolesMap = rolesData.reduce((acc, r) => ({ ...acc, [r.user_id]: r.role }), {});
        }
      }

      const membersWithRoles = (profilesData || []).map(p => ({
        ...p,
        role: rolesMap[p.id] || 'member',
      })) as MemberWithRole[];

      setMembers(membersWithRoles);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les membres',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesCommittee = committeeFilter === 'Tous' || member.committee === committeeFilter;
    const matchesStatus = statusFilter === 'Tous' || 
                          (statusFilter === 'Actif' && member.status === 'active') ||
                          (statusFilter === 'Embesa' && member.status === 'embesa');
    return matchesSearch && matchesCommittee && matchesStatus;
  });

  const openEditDialog = (member: MemberWithRole) => {
    setEditingMember(member);
    setEditCommittee(member.committee || '');
    setEditRole(member.role || 'member');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;

    setIsSaving(true);
    try {
      // Update profile (committee)
      const committeeValue = editCommittee === '' ? null : editCommittee as 'Sponsoring' | 'Communication' | 'Event' | 'Technique' | 'Media' | 'Bureau';
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          committee: committeeValue,
        })
        .eq('id', editingMember.id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: editRole as 'bureau' | 'admin' | 'respo' | 'member' | 'embesa' })
        .eq('user_id', editingMember.id);

      if (roleError) throw roleError;

      toast({
        title: 'Mis à jour!',
        description: 'Le profil a été mis à jour avec succès.',
      });

      setEditDialogOpen(false);
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      bureau: 'Bureau',
      admin: 'Admin',
      respo: 'Responsable',
      member: 'Membre',
      embesa: 'Embesa',
    };
    return labels[role] || 'Membre';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.members')}</h1>
          <p className="text-muted-foreground">Annuaire des membres du club</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.members')}</h1>
        <p className="text-muted-foreground">Annuaire des membres du club</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Comité" />
          </SelectTrigger>
          <SelectContent>
            {committees.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className={member.status === 'embesa' ? 'opacity-75' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{member.full_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant={member.status === 'embesa' ? 'outline' : 'secondary'} className="text-xs">
                      {getRoleLabel(member.role || 'member')}
                    </Badge>
                    {member.status === 'embesa' && (
                      <Badge variant="outline" className="text-xs bg-muted">Embesa</Badge>
                    )}
                  </CardDescription>
                </div>
                {canEdit && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{member.committee || 'Non assigné'}</Badge>
                  {member.total_points > 0 && (
                    <span className="text-sm font-medium text-primary">{member.total_points} pts</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun membre trouvé</p>
        </div>
      )}

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le membre</DialogTitle>
            <DialogDescription>
              Modifier le comité et le rôle de {editingMember?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="committee">Comité</Label>
              <Select value={editCommittee || 'none'} onValueChange={(v) => setEditCommittee(v === 'none' ? '' : v)}>
                <SelectTrigger id="committee">
                  <SelectValue placeholder="Sélectionner un comité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {committeeOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>{getRoleLabel(r)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
