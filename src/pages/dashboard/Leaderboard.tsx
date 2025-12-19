import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  committee: string | null;
  total_points: number;
  status: string;
}

const committees = ['Tous', 'Media', 'Event', 'Communication', 'Technique', 'Sponsoring'];

export default function Leaderboard() {
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState('all');
  const [committeeFilter, setCommitteeFilter] = useState('Tous');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [committeeFilter]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, committee, total_points, status')
        .eq('status', 'active')
        .order('total_points', { ascending: false });

      if (committeeFilter !== 'Tous') {
        query = query.eq('committee', committeeFilter as 'Sponsoring' | 'Communication' | 'Event' | 'Technique' | 'Media' | 'Bureau');
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeaderboardData(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-200/50 border-gray-300';
    if (rank === 3) return 'bg-orange-400/10 border-orange-400/30';
    return 'bg-card';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.leaderboard')}</h1>
            <p className="text-muted-foreground">Classement des membres par points</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.leaderboard')}</h1>
          <p className="text-muted-foreground">Classement des membres par points</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {committees.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={timeFilter} onValueChange={setTimeFilter}>
        <TabsList>
          <TabsTrigger value="all">Tout le temps</TabsTrigger>
          <TabsTrigger value="month">Ce mois</TabsTrigger>
          <TabsTrigger value="week">Cette semaine</TabsTrigger>
        </TabsList>
      </Tabs>

      {leaderboardData.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            Aucun membre trouvé pour ce filtre.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-4">
            {leaderboardData.slice(0, 3).map((member, index) => (
              <Card key={member.id} className={`${getRankBg(index + 1)} border-2`}>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2">
                    {getRankIcon(index + 1)}
                  </div>
                  <CardTitle className="text-lg">{member.full_name}</CardTitle>
                  <CardDescription>
                    {member.committee && <Badge variant="outline">{member.committee}</Badge>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-primary">{member.total_points}</div>
                  <p className="text-sm text-muted-foreground">points</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Classement complet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboardData.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${getRankBg(index + 1)} border`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground">{member.committee || 'Non assigné'}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-primary">{member.total_points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
