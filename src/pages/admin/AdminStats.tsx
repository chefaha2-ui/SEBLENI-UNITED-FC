import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Newspaper, Calendar, Heart, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    matches: 0,
    players: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const postsSnap = await getDocs(collection(db, 'posts'));
      const matchesSnap = await getDocs(collection(db, 'matches'));
      const playersSnap = await getDocs(collection(db, 'players'));

      setStats({
        users: usersSnap.size,
        posts: postsSnap.size,
        matches: matchesSnap.size,
        players: playersSnap.size
      });
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Fans', value: stats.users, icon: Users, color: 'text-blue-500' },
    { name: 'News Posts', value: stats.posts, icon: Newspaper, color: 'text-green-500' },
    { name: 'Matches', value: stats.matches, icon: Calendar, color: 'text-orange-500' },
    { name: 'Squad Size', value: stats.players, icon: Trophy, color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-slate-gray font-bold uppercase tracking-widest text-xs">Club Analytics & Quick Stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.name} className="card-geometric">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-md bg-off-white", stat.color)}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="text-4xl font-extrabold tracking-tighter mb-1">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-gray">{stat.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="card-geometric">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold tracking-tight">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-gray/40 text-sm italic py-12 text-center border border-dashed border-border-color rounded-md">
              Activity log coming soon...
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-geometric">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold tracking-tight">Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-gray/40 text-sm italic py-12 text-center border border-dashed border-border-color rounded-md">
              Engagement metrics coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
