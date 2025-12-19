import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

// Sample members data
const membersData = [
  { id: 1, name: 'Ahmed Benali', role: 'Président', committee: 'Bureau', status: 'active', email: 'ahmed@example.com', points: 0 },
  { id: 2, name: 'Laila Mansouri', role: 'Vice-Présidente', committee: 'Bureau', status: 'active', email: 'laila@example.com', points: 0 },
  { id: 3, name: 'Sara Amrani', role: 'Respo Media', committee: 'Media', status: 'active', email: 'sara@example.com', points: 156 },
  { id: 4, name: 'Karim Idrissi', role: 'Respo Event', committee: 'Event', status: 'active', email: 'karim@example.com', points: 142 },
  { id: 5, name: 'Fatima Zohra', role: 'Respo Communication', committee: 'Communication', status: 'active', email: 'fatima@example.com', points: 128 },
  { id: 6, name: 'Omar Benjelloun', role: 'Respo Technique', committee: 'Technique', status: 'active', email: 'omar@example.com', points: 115 },
  { id: 7, name: 'Nadia Bennani', role: 'Membre', committee: 'Media', status: 'active', email: 'nadia@example.com', points: 87 },
  { id: 8, name: 'Hassan Tazi', role: 'Membre', committee: 'Technique', status: 'active', email: 'hassan@example.com', points: 81 },
  { id: 9, name: 'Mounir Alami', role: 'Ancien membre', committee: 'Event', status: 'embesa', email: 'mounir@example.com', points: 200 },
];

const committees = ['Tous', 'Bureau', 'Media', 'Event', 'Communication', 'Technique', 'Sponsoring'];
const statuses = ['Tous', 'Actif', 'Embesa'];

export default function Members() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');

  const filteredMembers = membersData.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                          member.email.toLowerCase().includes(search.toLowerCase());
    const matchesCommittee = committeeFilter === 'Tous' || member.committee === committeeFilter;
    const matchesStatus = statusFilter === 'Tous' || 
                          (statusFilter === 'Actif' && member.status === 'active') ||
                          (statusFilter === 'Embesa' && member.status === 'embesa');
    return matchesSearch && matchesCommittee && matchesStatus;
  });

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
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{member.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant={member.status === 'embesa' ? 'outline' : 'secondary'} className="text-xs">
                      {member.role}
                    </Badge>
                    {member.status === 'embesa' && (
                      <Badge variant="outline" className="text-xs bg-muted">Embesa</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{member.committee}</Badge>
                  {member.points > 0 && (
                    <span className="text-sm font-medium text-primary">{member.points} pts</span>
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
    </div>
  );
}
