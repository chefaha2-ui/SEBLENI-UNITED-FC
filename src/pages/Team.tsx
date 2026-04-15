import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

const Team = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('number', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  return (
    <div className="px-4 md:px-16 py-12 max-w-7xl mx-auto">
      <div className="mb-16">
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">The Squad</h1>
        <p className="text-white/50 font-medium uppercase tracking-widest text-xs mt-4 max-w-2xl">
          Meet the warriors of Sebleni United FC. A team built on passion, discipline, and the pursuit of excellence on and off the pitch.
        </p>
      </div>

      {positions.map((pos) => {
        const posPlayers = players.filter(p => p.position === pos);
        if (posPlayers.length === 0 && !loading) return null;

        return (
          <div key={pos} className="mb-20">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-black uppercase tracking-widest italic text-green-500">{pos}s</h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-zinc-900" />
                    <Skeleton className="h-6 w-3/4 bg-zinc-900" />
                    <Skeleton className="h-4 w-1/4 bg-zinc-900" />
                  </div>
                ))
              ) : (
                posPlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <Card className="card-geometric h-full relative">
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img 
                          src={player.image || `https://picsum.photos/seed/${player.name}/600/800`} 
                          alt={player.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 right-4 w-10 h-10 bg-primary-green rounded-md flex items-center justify-center text-pure-white font-extrabold text-lg shadow-xl">
                          {player.number}
                        </div>
                      </div>
                      <CardContent className="p-6 text-center">
                        <h3 className="text-xl font-extrabold uppercase tracking-tight mb-1 group-hover:text-primary-green transition-colors">
                          {player.name}
                        </h3>
                        <Badge variant="outline" className="border-border-color text-slate-gray uppercase text-[10px] tracking-widest rounded-md">
                          {player.position}
                        </Badge>
                        {player.bio && (
                          <p className="text-slate-gray/60 text-xs mt-4 line-clamp-2 italic">
                            "{player.bio}"
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Team;
