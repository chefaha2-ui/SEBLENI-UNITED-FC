import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Trash2, Calendar, MapPin, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminMatches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [stadium, setStadium] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent || !date || !stadium) return;

    try {
      await addDoc(collection(db, 'matches'), {
        opponent,
        date: new Date(date).toISOString(),
        stadium,
        status,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        isHome: true,
        createdAt: new Date().toISOString()
      });
      toast.success('Match scheduled!');
      setShowForm(false);
      setOpponent('');
      setDate('');
      setStadium('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule match');
    }
  };

  const handleUpdateScore = async (id: string, h: string, a: string, s: string) => {
    try {
      await updateDoc(doc(db, 'matches', id), {
        homeScore: parseInt(h),
        awayScore: parseInt(a),
        status: s
      });
      toast.success('Match updated');
    } catch (error) {
      console.error(error);
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this match?')) return;
    try {
      await deleteDoc(doc(db, 'matches', id));
      toast.success('Match deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete match');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Manage Matches</h1>
          <p className="text-slate-gray font-bold uppercase tracking-widest text-xs">Schedule fixtures and update scores</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest rounded-md"
        >
          {showForm ? 'Cancel' : 'Schedule Match'}
          {!showForm && <Plus size={18} className="ml-2" />}
        </Button>
      </div>

      {showForm && (
        <Card className="card-geometric animate-in fade-in slide-in-from-top-4">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-tiny">Opponent</label>
                  <Input 
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="Opponent Team Name"
                    className="bg-off-white border-border-color h-12 rounded-md focus-visible:ring-primary-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-tiny">Match Date & Time</label>
                  <Input 
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-off-white border-border-color h-12 rounded-md focus-visible:ring-primary-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-tiny">Stadium</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray/30" size={18} />
                    <Input 
                      value={stadium}
                      onChange={(e) => setStadium(e.target.value)}
                      placeholder="Stadium Name"
                      className="bg-off-white border-border-color h-12 pl-10 rounded-md focus-visible:ring-primary-green"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-tiny">Initial Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-off-white border-border-color h-12 rounded-md">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-pure-white border-border-color">
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest h-12 rounded-md">
                Schedule Fixture
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="card-geometric group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                  <div className="text-center">
                    <div className="text-[10px] font-bold uppercase text-slate-gray/40 mb-1">{format(new Date(match.date), 'MMM dd')}</div>
                    <div className="text-xl font-extrabold tracking-tight">{format(new Date(match.date), 'HH:mm')}</div>
                  </div>
                  <div className="h-10 w-px bg-border-color" />
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold uppercase tracking-tight text-deep-black">Sebleni Utd</span>
                    <div className="flex items-center gap-2 bg-off-white px-4 py-2 rounded-md border border-border-color">
                      <input 
                        type="number" 
                        value={match.homeScore} 
                        onChange={(e) => handleUpdateScore(match.id, e.target.value, match.awayScore.toString(), match.status)}
                        className="w-8 bg-transparent text-center font-extrabold text-primary-green focus:outline-none"
                      />
                      <span className="text-slate-gray/20 font-extrabold">-</span>
                      <input 
                        type="number" 
                        value={match.awayScore} 
                        onChange={(e) => handleUpdateScore(match.id, match.homeScore.toString(), e.target.value, match.status)}
                        className="w-8 bg-transparent text-center font-extrabold text-deep-black focus:outline-none"
                      />
                    </div>
                    <span className="font-extrabold uppercase tracking-tight text-slate-gray">{match.opponent}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select 
                    value={match.status} 
                    onValueChange={(val) => handleUpdateScore(match.id, match.homeScore.toString(), match.awayScore.toString(), val)}
                  >
                    <SelectTrigger className="w-32 bg-off-white border-border-color h-10 text-[10px] font-bold uppercase tracking-widest rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-pure-white border-border-color">
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-gray hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(match.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminMatches;
