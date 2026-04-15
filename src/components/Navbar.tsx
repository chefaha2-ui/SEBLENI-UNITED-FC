import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, MessageSquare, User, Shield, Bell, Search, Settings } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  extraClass?: string;
}

const Navbar = () => {
  const location = useLocation();
  const { user, profile, isAdmin } = useAuth();

  const navItems: NavItem[] = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Match Center', path: '/matches', icon: Calendar },
    { name: 'First Team', path: '/team', icon: Users },
    { name: 'Fan Community', path: '/community', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Dashboard', path: '/admin', icon: Shield, extraClass: 'text-accent-gold mt-6' });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-[240px] bg-deep-black text-pure-white flex-col py-8 border-r-4 border-primary-green z-50">
        <div className="px-8 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-green to-[#00A34D] border-2 border-pure-white shadow-lg" />
          <div className="font-extrabold text-lg tracking-tighter leading-none">
            SEBLENI<br />UNITED
          </div>
        </div>

        <ul className="flex-grow list-none">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-8 py-3.5 text-sm font-semibold transition-all border-l-4",
                  location.pathname === item.path 
                    ? "text-pure-white bg-pure-white/5 border-primary-green" 
                    : "text-pure-white/60 border-transparent hover:text-pure-white hover:bg-pure-white/5",
                  item.extraClass
                )}
              >
                <item.icon size={18} className={cn(location.pathname === item.path ? "opacity-100" : "opacity-60")} />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {user && (
          <div className="mt-auto px-8 py-6 border-t border-pure-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-gray border border-primary-green overflow-hidden">
              <img src={profile?.profileImage || user.photoURL || ''} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate">{profile?.name || user.displayName}</div>
              <div className="text-[11px] opacity-60 uppercase tracking-wider font-bold">Member</div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-deep-black border-t border-pure-white/10 z-50 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              location.pathname === item.path ? "text-primary-green" : "text-pure-white/40"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.name.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Header Actions (Floating) */}
      <div className="hidden md:flex fixed top-8 right-8 z-40 gap-4">
        <button className="w-10 h-10 rounded-lg border border-border-color bg-pure-white flex items-center justify-center text-deep-black hover:bg-off-white transition-colors shadow-sm">
          <Bell size={18} />
        </button>
        <button className="w-10 h-10 rounded-lg border border-border-color bg-pure-white flex items-center justify-center text-deep-black hover:bg-off-white transition-colors shadow-sm">
          <Search size={18} />
        </button>
        <button className="w-10 h-10 rounded-lg border border-border-color bg-pure-white flex items-center justify-center text-deep-black hover:bg-off-white transition-colors shadow-sm">
          <Settings size={18} />
        </button>
      </div>
    </>
  );
};

export default Navbar;
