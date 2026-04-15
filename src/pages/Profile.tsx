import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { LogOut, User, Camera, Shield, Star, Heart } from 'lucide-react';

const Profile = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [favoritePlayer, setFavoritePlayer] = useState(profile?.favoritePlayer || '');
  const [profileImage, setProfileImage] = useState(profile?.profileImage || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const publicRef = doc(db, 'users_public', user.uid);
      
      const updates = {
        name,
        bio,
        favoritePlayer,
        profileImage: profileImage || user.photoURL || '',
      };
      
      await updateDoc(userRef, updates);
      await updateDoc(publicRef, {
        name,
        profileImage: updates.profileImage
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Logout failed');
    }
  };

  return (
    <div className="px-4 md:px-16 py-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Side: Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="card-geometric overflow-hidden">
            <div className="h-24 bg-primary-green" />
            <CardContent className="p-8 pt-0 -mt-12 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-pure-white shadow-xl">
                  <AvatarImage src={profileImage || user?.photoURL || ''} />
                  <AvatarFallback className="bg-off-white text-slate-gray text-2xl font-extrabold">
                    {profile?.name?.substring(0, 2).toUpperCase() || 'F'}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-primary-green rounded-full text-pure-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={16} />
                </button>
              </div>
              
              <div className="mt-4">
                <h2 className="text-2xl font-extrabold tracking-tight">{profile?.name || 'Official Fan'}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-green">{profile?.role || 'Fan'}</span>
                  {isAdmin && <Shield size={12} className="text-primary-green" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-off-white">
                <div>
                  <div className="text-xl font-extrabold">12</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">Posts</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold">48</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">Likes</div>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full mt-8 text-slate-gray hover:text-primary-green hover:bg-off-white rounded-md font-bold uppercase tracking-widest text-xs"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Link to="/admin" className="block">
              <Button className="w-full bg-white text-black hover:bg-green-500 hover:text-black font-black uppercase tracking-widest h-14 rounded-2xl transition-all">
                <Shield size={20} className="mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Right Side: Edit Form */}
        <div className="flex-1">
          <Card className="card-geometric">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-gray">Display Name</Label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-off-white border-border-color h-12 rounded-md focus-visible:ring-primary-green"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-gray">Favorite Player</Label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray/30" size={18} />
                    <Input 
                      value={favoritePlayer}
                      onChange={(e) => setFavoritePlayer(e.target.value)}
                      placeholder="e.g. Sebleni Legend"
                      className="bg-off-white border-border-color h-12 pl-10 rounded-md focus-visible:ring-primary-green"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-gray">Bio</Label>
                  <Textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your passion for Sebleni United..."
                    className="bg-off-white border-border-color min-h-[120px] resize-none rounded-md focus-visible:ring-primary-green"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-gray">Profile Image URL</Label>
                  <Input 
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-off-white border-border-color h-12 rounded-md focus-visible:ring-primary-green"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest h-12 rounded-md transition-all"
                  disabled={loading}
                >
                  {loading ? 'Saving Changes...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

import { Link } from 'react-router-dom';
export default Profile;
