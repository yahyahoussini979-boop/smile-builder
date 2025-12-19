import { useLanguage } from '@/contexts/LanguageContext';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

interface MemberProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  committee: string | null;
  status: string;
  total_points: number;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Anouar ROUZANI',
    role: 'Président',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Sif Eddine FEKKAR',
    role: 'Secrétaire Général',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Majda RAHMOUNE',
    role: 'Vice Présidente',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '4',
    name: 'Imane RABYA',
    role: 'Encadrante',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '5',
    name: 'MARRADO ABDERAZZAQ',
    role: 'Chef comité Technique',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '6',
    name: 'ELKHALFI IHSSANE',
    role: 'Cheffe comité Communication',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '7',
    name: 'Sarah BENALI',
    role: 'Cheffe comité Sponsoring',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '8',
    name: 'Oumaima AIT',
    role: 'Trésorière',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
  },
];

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-3xl border-4 border-primary shadow-lg transition-transform duration-300 group-hover:scale-105">
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full aspect-square object-cover"
        />
        {/* Role badge */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground p-3 text-center">
          <p className="text-xs font-medium opacity-90">{member.role} :</p>
          <p className="text-sm font-bold">{member.name}</p>
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: MemberProfile }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 border-4 border-primary mb-3">
          <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {getInitials(member.full_name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-foreground">{member.full_name}</h3>
        {member.committee && (
          <Badge variant="secondary" className="mt-2">
            {member.committee}
          </Badge>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {member.total_points} points
        </p>
      </CardContent>
    </Card>
  );
}

export default function Team() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .order('total_points', { ascending: false });

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  // Split members for the layout
  const president = teamMembers[0];
  const vicePresident = teamMembers[2];
  const topRow = [teamMembers[1], teamMembers[3]]; // Secretary, Encadrante
  const middleRow = [teamMembers[4], teamMembers[5], teamMembers[6]]; // Committee heads
  const bottomRow = [teamMembers[7]]; // Treasurer

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Notre Équipe</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les membres talentueux qui font vivre notre club et portent nos valeurs au quotidien.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* President at top center */}
          <div className="flex justify-center mb-8">
            <div className="w-48 md:w-56">
              <TeamMemberCard member={president} />
            </div>
          </div>

          {/* Top row - Secretary & Encadrante with VP in center */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8">
            <div className="w-40 md:w-48">
              <TeamMemberCard member={topRow[0]} />
            </div>
            <div className="w-48 md:w-56">
              <TeamMemberCard member={vicePresident} />
            </div>
            <div className="w-40 md:w-48">
              <TeamMemberCard member={topRow[1]} />
            </div>
          </div>

          {/* Middle row - Committee heads */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8">
            {middleRow.map((member) => (
              <div key={member.id} className="w-40 md:w-48">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>

          {/* Bottom row - Treasurer */}
          <div className="flex justify-center">
            <div className="w-40 md:w-48">
              <TeamMemberCard member={bottomRow[0]} />
            </div>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nos Membres</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tous les membres actifs de notre club qui contribuent chaque jour à nos actions.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center">
                    <Skeleton className="h-24 w-24 rounded-full mb-3" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : members.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Aucun membre pour le moment.</p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Rejoignez notre équipe !
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Vous souhaitez faire partie de l'aventure ? Contactez-nous pour découvrir comment rejoindre Mohandiss Al Basma.
          </p>
        </div>
      </section>
    </div>
  );
}
