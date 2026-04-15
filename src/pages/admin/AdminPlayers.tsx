import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Trash2, User, Hash, Shield, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

const AdminPlayers = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('Defender');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('number', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !number) return;

    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `players/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'players'), {
        name,
        number: parseInt(number),
        position,
        image: imageUrl || `https://picsum.photos/seed/${name}/600/800`,
        createdAt: new Date().toISOString()
      });
      toast.success('Player added to squad!');
      setShowForm(false);
      setName('');
      setNumber('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add player');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove player from squad?')) return;
    try {
      await deleteDoc(doc(db, 'players', id));
      toast.success('Player removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove player');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Manage Squad</h1>
          <p className="text-slate-gray font-bold uppercase tracking-widest text-xs">Add and remove club players</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest rounded-md"
        >
          {showForm ? 'Cancel' : 'Add Player'}
          {!showForm && <Plus size={18} className="ml-2" />}
        </Button>
      </div>

      {showForm && (
        <Card className="card-geometric animate-in fade-in slide-in-from-top-4">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="label-tiny">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray/30" size={18} />
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Player Name"
                      className="bg-off-white border-border-color h-12 pl-10 rounded-md focus-visible:ring-primary-green"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-tiny">Jersey Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray/30" size={18} />
                    <Input 
                      type="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="10"
                      className="bg-off-white border-border-color h-12 pl-10 rounded-md focus-visible:ring-primary-green"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-tiny">Position</label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger className="bg-off-white border-border-color h-12 rounded-md">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="bg-pure-white border-border-color">
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-tiny">Player Photo</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      id="player-image" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label 
                      htmlFor="player-image"
                      className="flex items-center gap-2 bg-off-white border border-border-color hover:border-primary-green rounded-md px-4 py-3 cursor-pointer transition-all text-sm font-bold uppercase tracking-widest text-slate-gray"
                    >
                      <ImageIcon size={20} />
                      {imageFile ? imageFile.name : 'Upload Photo'}
                    </label>
                    {imagePreview && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-red-500 hover:bg-red-50 rounded-md"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                      >
                        <X size={18} className="mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="relative w-24 h-32 rounded-md overflow-hidden border border-border-color">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest h-12 rounded-md"
                disabled={submitting}
              >
                {submitting ? 'Registering...' : 'Register Player'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <Card key={player.id} className="card-geometric group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-off-white flex-shrink-0 border border-border-color">
                  <img 
                    src={player.image || "https://picsum.photos/seed/player/100/100"} 
                    alt="" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">{player.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary-green">#{player.number}</span>
                    <span className="text-[10px] font-bold text-slate-gray/40 uppercase tracking-widest">{player.position}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-gray hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(player.id)}
              >
                <Trash2 size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPlayers;
