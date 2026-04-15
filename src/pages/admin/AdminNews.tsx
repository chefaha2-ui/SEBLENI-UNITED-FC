import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Trash2, Newspaper, Edit, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminNews = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('news');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      where('type', 'in', ['news', 'announcement', 'transfer']),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
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
    if (!title || !content) return;

    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `news/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'posts'), {
        title,
        content,
        type,
        image: imageUrl || `https://picsum.photos/seed/${title}/1200/800`,
        authorId: user?.uid,
        authorName: 'Admin',
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: [],
        commentsCount: 0
      });
      toast.success('Post created successfully!');
      setShowForm(false);
      setTitle('');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      toast.success('Post deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Manage News</h1>
          <p className="text-slate-gray font-bold uppercase tracking-widest text-xs">Create and edit club announcements</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest rounded-md"
        >
          {showForm ? 'Cancel' : 'New Post'}
          {!showForm && <Plus size={18} className="ml-2" />}
        </Button>
      </div>

      {showForm && (
        <Card className="card-geometric animate-in fade-in slide-in-from-top-4">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-tiny">Title</label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title"
                    className="bg-off-white border-border-color h-12 rounded-md focus-visible:ring-primary-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-tiny">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-off-white border-border-color h-12 rounded-md">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-pure-white border-border-color">
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-tiny">Post Image</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      id="news-image" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label 
                      htmlFor="news-image"
                      className="flex items-center gap-2 bg-off-white border border-border-color hover:border-primary-green rounded-md px-4 py-3 cursor-pointer transition-all text-sm font-bold uppercase tracking-widest text-slate-gray"
                    >
                      <ImageIcon size={20} />
                      {imageFile ? imageFile.name : 'Upload Image'}
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
                    <div className="relative w-full max-w-md aspect-video rounded-md overflow-hidden border border-border-color">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-tiny">Content</label>
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the post content here..."
                  className="bg-off-white border-border-color min-h-[200px] resize-none rounded-md focus-visible:ring-primary-green"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest h-12 rounded-md"
                disabled={submitting}
              >
                {submitting ? 'Publishing...' : 'Publish Post'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="card-geometric group">
            <CardContent className="p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-off-white flex-shrink-0 border border-border-color">
                  <img 
                    src={post.image || "https://picsum.photos/seed/football/200/200"} 
                    alt="" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-green">{post.type}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray/20">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">{format(new Date(post.createdAt), 'PP')}</span>
                  </div>
                  <h3 className="font-extrabold text-lg tracking-tight">{post.title}</h3>
                  <p className="text-slate-gray text-xs line-clamp-1 max-w-md">{post.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="text-slate-gray hover:text-primary-green hover:bg-off-white rounded-md">
                  <Edit size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-gray hover:text-red-500 hover:bg-red-50 rounded-md"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminNews;
