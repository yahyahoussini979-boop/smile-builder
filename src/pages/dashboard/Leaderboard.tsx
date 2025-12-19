import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';

// Sample leaderboard data
const leaderboardData = [
  { rank: 1, name: 'Sara Amrani', committee: 'Media', points: 156, tasksCompleted: 23 },
  { rank: 2, name: 'Karim Idrissi', committee: 'Event', points: 142, tasksCompleted: 21 },
  { rank: 3, name: 'Fatima Zohra', committee: 'Communication', points: 128, tasksCompleted: 19 },
  { rank: 4, name: 'Omar Benjelloun', committee: 'Technique', points: 115, tasksCompleted: 17 },
  { rank: 5, name: 'Leila Haddaoui', committee: 'Sponsoring', points: 98, tasksCompleted: 15 },
  { rank: 6, name: 'Mehdi Alaoui', committee: 'Event', points: 92, tasksCompleted: 14 },
  { rank: 7, name: 'Nadia Bennani', committee: 'Media', points: 87, tasksCompleted: 13 },
  { rank: 8, name: 'Hassan Tazi', committee: 'Technique', points: 81, tasksCompleted: 12 },
  { rank: 9, name: 'Imane Chraibi', committee: 'Communication', points: 76, tasksCompleted: 11 },
  { rank: 10, name: 'Youssef Elhadi', committee: 'Event', points: 70, tasksCompleted: 10 },
];

const committees = ['Tous', 'Media', 'Event', 'Communication', 'Technique', 'Sponsoring'];

export default function Leaderboard() {
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState('month');
  const [committeeFilter, setCommitteeFilter] = useState('Tous');

  const filteredData = committeeFilter === 'Tous' 
    ? leaderboardData 
    : leaderboardData.filter(m => m.committee === committeeFilter);

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

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4">
        {filteredData.slice(0, 3).map((member, index) => (
          <Card key={member.name} className={`${getRankBg(member.rank)} border-2`}>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2">
                {getRankIcon(member.rank)}
              </div>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <CardDescription>
                <Badge variant="outline">{member.committee}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary">{member.points}</div>
              <p className="text-sm text-muted-foreground">points</p>
              <p className="text-xs text-muted-foreground mt-2">
                {member.tasksCompleted} tâches complétées
              </p>
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
            {filteredData.map((member) => (
              <div
                key={member.name}
                className={`flex items-center gap-4 p-3 rounded-lg ${getRankBg(member.rank)} border`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(member.rank)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.committee}</p>
                </div>
                <div className="text-end">
                  <p className="font-bold text-primary">{member.points} pts</p>
                  <p className="text-xs text-muted-foreground">{member.tasksCompleted} tâches</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
