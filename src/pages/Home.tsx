import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Calendar, Trophy, ArrowRight, Bell, Search, Settings } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';

import CommunityFeed from '../components/CommunityFeed';

const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch featured news
    const newsQuery = query(
      collection(db, 'posts'),
      where('type', '==', 'news'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeNews = onSnapshot(newsQuery, (snapshot) => {
      setFeaturedPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch next match
    const matchQuery = query(
      collection(db, 'matches'),
      where('status', '==', 'upcoming'),
      orderBy('date', 'asc'),
      limit(1)
    );

    const unsubscribeMatch = onSnapshot(matchQuery, (snapshot) => {
      if (!snapshot.empty) {
        setNextMatch({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });

    // Fetch key squad members
    const playersQuery = query(collection(db, 'players'), limit(4));
    const unsubscribePlayers = onSnapshot(playersQuery, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeNews();
      unsubscribeMatch();
      unsubscribePlayers();
    };
  }, []);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Matchday Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hero News Section */}
        <section className="lg:col-span-2 space-y-8">
          {loading ? (
            <Skeleton className="h-[400px] w-full rounded-2xl bg-zinc-200" />
          ) : featuredPosts.length > 0 ? (
            <Link to={`/news/${featuredPosts[0].id}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[400px] rounded-2xl overflow-hidden bg-deep-black group"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ 
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9), transparent), url(${featuredPosts[0].image || 'https://picsum.photos/seed/football/1200/800'})`,
                    backgroundBlendMode: 'multiply'
                  }}
                />
                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 2px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                
                <div className="absolute bottom-0 p-8 w-full">
                  <Badge className="bg-primary-green text-pure-white border-none rounded-md px-3 py-1 text-[10px] font-bold uppercase mb-4">
                    Latest News
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-pure-white mb-4 leading-tight">
                    {featuredPosts[0].title}
                  </h2>
                  <p className="text-pure-white/70 line-clamp-2 max-w-2xl text-sm">
                    {featuredPosts[0].content}
                  </p>
                </div>
              </motion.div>
            </Link>
          ) : (
            <div className="h-[400px] rounded-2xl bg-deep-black flex items-center justify-center text-pure-white/20 font-bold uppercase tracking-widest border border-white/5">
              No featured news available
            </div>
          )}

          {/* Community Feed Section on Home Page */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Fan Feed</h2>
              <Link to="/community" className="text-xs font-bold uppercase tracking-widest text-primary-green hover:underline">View All</Link>
            </div>
            <CommunityFeed limitCount={3} />
          </div>
        </section>

        {/* Sidebar Sections */}
        <section className="lg:col-span-1 space-y-8">
          {/* Match Center */}
          <Card className="card-geometric flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <span className="label-tiny">Next Fixture</span>
                <span className="label-tiny text-primary-green">Upcoming</span>
              </div>

              {nextMatch ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-8 py-4 border-t border-off-white">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-off-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-inner border border-border-color">
                      SU
                    </div>
                    <div className="text-2xl font-extrabold text-slate-gray">VS</div>
                    <div className="w-16 h-16 bg-off-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-inner border border-border-color">
                      {nextMatch.opponent?.substring(0, 2).toUpperCase() || 'OP'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-deep-black mb-1">{nextMatch.opponent}</div>
                    <div className="text-sm text-slate-gray mb-1">{nextMatch.venue || 'Sebleni Memorial Stadium'}</div>
                    <div className="text-sm font-semibold text-slate-gray">
                      {new Date(nextMatch.date).toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <Button className="w-full bg-deep-black hover:bg-slate-gray text-pure-white py-6 rounded-lg font-bold transition-all mt-4">
                    Buy Tickets
                  </Button>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-gray/30 py-12">
                  <Calendar size={48} className="mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No upcoming fixtures</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Squad Members */}
          <Card className="card-geometric">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="label-tiny">Key Squad Members</span>
              </div>
              <div className="space-y-4">
                {players.length > 0 ? players.map((player, idx) => (
                  <div key={player.id} className="flex items-center gap-4 pb-4 border-b border-off-white last:border-0">
                    <span className="font-extrabold text-primary-green w-6">0{idx + 1}</span>
                    <span className="font-semibold text-sm">{player.name}</span>
                    <span className="label-tiny ml-auto">{player.position}</span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-gray/50 italic">Loading squad...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Club Status */}
          <Card className="card-geometric">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="label-tiny">Club Status</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-primary-green mb-4">
                <div className="w-2 h-2 bg-primary-green rounded-full animate-pulse" />
                Training Session Live
              </div>
              <div className="bg-off-white p-6 rounded-xl text-center">
                <div className="text-4xl font-extrabold mb-1">4th</div>
                <div className="label-tiny">League Position</div>
                <div className="my-4 h-px bg-border-color" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-[11px]">
                    <div className="font-extrabold">12</div>
                    <div className="opacity-60">Played</div>
                  </div>
                  <div className="text-[11px]">
                    <div className="font-extrabold">8</div>
                    <div className="opacity-60">Wins</div>
                  </div>
                  <div className="text-[11px]">
                    <div className="font-extrabold">26</div>
                    <div className="opacity-60">Pts</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Home;
