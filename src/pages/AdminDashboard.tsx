import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Newspaper, Users, Calendar, Settings, Plus, Trash2, Edit } from 'lucide-react';
import { cn } from '../lib/utils';
import AdminNews from './admin/AdminNews';
import AdminPlayers from './admin/AdminPlayers';
import AdminMatches from './admin/AdminMatches';
import AdminStats from './admin/AdminStats';

const AdminDashboard = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage News', path: '/admin/news', icon: Newspaper },
    { name: 'Manage Players', path: '/admin/players', icon: Users },
    { name: 'Manage Matches', path: '/admin/matches', icon: Calendar },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-off-white">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-pure-white border-r border-border-color p-6 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary-green rounded-md flex items-center justify-center font-extrabold text-pure-white">A</div>
          <span className="font-extrabold uppercase tracking-tight text-lg text-deep-black">Admin Panel</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-all",
                location.pathname === item.path 
                  ? "bg-deep-black text-pure-white shadow-lg" 
                  : "text-slate-gray hover:bg-off-white hover:text-deep-black"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/news" element={<AdminNews />} />
          <Route path="/players" element={<AdminPlayers />} />
          <Route path="/matches" element={<AdminMatches />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
