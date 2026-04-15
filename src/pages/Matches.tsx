import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const upcomingMatches = matches.filter(m => m.status === 'upcoming').reverse();
  const pastMatches = matches.filter(m => m.status === 'finished');
  const liveMatches = matches.filter(m => m.status === 'live');

  const MatchCard = ({ match }: { match: any; key?: string }) => (
    <Card className="card-geometric mb-6">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 md:gap-12 flex-1 justify-center md:justify-start">
            <div className="flex flex-col items-center gap-2 w-24">
              <div className="w-16 h-16 bg-off-white rounded-full flex items-center justify-center text-xl font-extrabold text-deep-black border border-border-color shadow-inner">SU</div>
              <span className="font-bold text-xs uppercase text-center tracking-tight">Sebleni Utd</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              {match.status === 'finished' ? (
                <div className="text-4xl font-extrabold tracking-tighter flex items-center gap-4 text-deep-black">
                  <span>{match.homeScore}</span>
                  <span className="text-slate-gray/20">-</span>
                  <span>{match.awayScore}</span>
                </div>
              ) : match.status === 'live' ? (
                <div className="flex flex-col items-center gap-2">
                  <Badge className="bg-primary-green text-pure-white animate-pulse uppercase text-[10px] tracking-widest rounded-md">Live</Badge>
                  <div className="text-4xl font-extrabold tracking-tighter flex items-center gap-4 text-deep-black">
                    <span>{match.homeScore}</span>
                    <span className="text-slate-gray/20">-</span>
                    <span>{match.awayScore}</span>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-extrabold text-slate-gray/20 italic uppercase tracking-widest">VS</div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 w-24">
              <div className="w-16 h-16 bg-off-white rounded-full flex items-center justify-center text-xl font-extrabold text-slate-gray/50 border border-border-color shadow-inner">
                {match.opponent.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-xs uppercase text-center tracking-tight">{match.opponent}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-center md:text-right md:border-l border-border-color md:pl-12 min-w-[200px]">
            <div className="flex items-center justify-center md:justify-end gap-2 text-slate-gray">
              <Calendar size={16} className="text-primary-green" />
              <span className="text-sm font-semibold">{format(new Date(match.date), 'PPP p')}</span>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2 text-slate-gray">
              <MapPin size={16} className="text-primary-green" />
              <span className="text-sm font-semibold">{match.stadium}</span>
            </div>
            <Badge variant="outline" className="w-fit mx-auto md:ml-auto border-border-color text-slate-gray uppercase text-[10px] tracking-widest rounded-md">
              {match.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="px-4 md:px-16 py-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">Match Center</h1>
          <p className="text-white/50 font-medium uppercase tracking-widest text-xs mt-2">Schedule, Results & Live Updates</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border border-white/5">
          <Trophy className="text-green-500" size={32} />
          <div>
            <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">League Standing</div>
            <div className="text-xl font-black uppercase tracking-tighter">1st Place</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-zinc-900 border border-white/5 p-1 rounded-full mb-12 h-14 w-full md:w-fit">
          <TabsTrigger value="upcoming" className="rounded-full px-8 h-full data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold uppercase text-xs tracking-widest">Upcoming</TabsTrigger>
          <TabsTrigger value="live" className="rounded-full px-8 h-full data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold uppercase text-xs tracking-widest">Live</TabsTrigger>
          <TabsTrigger value="results" className="rounded-full px-8 h-full data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold uppercase text-xs tracking-widest">Results</TabsTrigger>
          <TabsTrigger value="standings" className="rounded-full px-8 h-full data-[state=active]:bg-green-500 data-[state=active]:text-black font-bold uppercase text-xs tracking-widest">Standings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map(match => <MatchCard key={match.id} match={match} />)
          ) : (
            <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-white/10">
              <Calendar className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/30 font-bold uppercase tracking-widest">No upcoming matches scheduled</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="live">
          {liveMatches.length > 0 ? (
            liveMatches.map(match => <MatchCard key={match.id} match={match} />)
          ) : (
            <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 bg-white/20 rounded-full" />
              </div>
              <p className="text-white/30 font-bold uppercase tracking-widest">No matches currently live</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="results">
          {pastMatches.length > 0 ? (
            pastMatches.map(match => <MatchCard key={match.id} match={match} />)
          ) : (
            <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-white/10">
              <Trophy className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/30 font-bold uppercase tracking-widest">No match results available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="standings">
          <Card className="bg-zinc-900 border-white/5 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                      <th className="px-6 py-4">Pos</th>
                      <th className="px-6 py-4">Team</th>
                      <th className="px-6 py-4 text-center">P</th>
                      <th className="px-6 py-4 text-center">W</th>
                      <th className="px-6 py-4 text-center">D</th>
                      <th className="px-6 py-4 text-center">L</th>
                      <th className="px-6 py-4 text-center">GD</th>
                      <th className="px-6 py-4 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { pos: 1, name: 'Sebleni United', p: 12, w: 10, d: 1, l: 1, gd: 24, pts: 31 },
                      { pos: 2, name: 'City Rivals', p: 12, w: 8, d: 2, l: 2, gd: 15, pts: 26 },
                      { pos: 3, name: 'Mountain FC', p: 12, w: 7, d: 3, l: 2, gd: 10, pts: 24 },
                      { pos: 4, name: 'Coastal Stars', p: 12, w: 6, d: 2, l: 4, gd: 5, pts: 20 },
                      { pos: 5, name: 'Valley Rangers', p: 12, w: 5, d: 3, l: 4, gd: 2, pts: 18 },
                    ].map((team) => (
                      <tr key={team.name} className={cn("hover:bg-white/5 transition-colors", team.name === 'Sebleni United' && "bg-green-500/10")}>
                        <td className="px-6 py-4 font-black italic">{team.pos}</td>
                        <td className="px-6 py-4 font-bold uppercase tracking-tight">{team.name}</td>
                        <td className="px-6 py-4 text-center font-medium">{team.p}</td>
                        <td className="px-6 py-4 text-center font-medium">{team.w}</td>
                        <td className="px-6 py-4 text-center font-medium">{team.d}</td>
                        <td className="px-6 py-4 text-center font-medium">{team.l}</td>
                        <td className="px-6 py-4 text-center font-medium">{team.gd}</td>
                        <td className="px-6 py-4 text-center font-black text-green-500">{team.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Matches;
