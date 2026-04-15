import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, User, Share2, Heart, MessageSquare, Send } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';

const NewsDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const docSnap = await getDoc(doc(db, 'posts', id));
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchPost();

    if (id) {
      const q = query(collection(db, `posts/${id}/comments`), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleLike = async () => {
    if (!user || !post) {
      toast.error('Please login to like');
      return;
    }
    const isLiked = post.likedBy?.includes(user.uid);
    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        likesCount: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
      // Update local state
      setPost((prev: any) => ({
        ...prev,
        likesCount: prev.likesCount + (isLiked ? -1 : 1),
        likedBy: isLiked ? prev.likedBy.filter((uid: string) => uid !== user.uid) : [...(prev.likedBy || []), user.uid]
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !commentText.trim()) return;

    try {
      const commentData = {
        authorId: user.uid,
        authorName: profile?.name || user.displayName || 'Fan',
        authorImage: profile?.profileImage || user.photoURL || '',
        content: commentText,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, `posts/${id}/comments`), commentData);
      await updateDoc(doc(db, 'posts', id), {
        commentsCount: increment(1)
      });
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="px-4 md:px-16 py-12 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-10 w-32 bg-zinc-200" />
        <Skeleton className="h-[400px] w-full rounded-3xl bg-zinc-200" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full bg-zinc-200" />
          <Skeleton className="h-6 w-full bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight opacity-20">Post Not Found</h1>
        <Link to="/">
          <Button variant="outline" className="rounded-md uppercase font-bold tracking-widest">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-16 py-12 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-gray hover:text-primary-green transition-colors font-bold uppercase text-xs tracking-widest mb-12">
        <ArrowLeft size={16} />
        Back to News
      </Link>

      <article className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary-green text-pure-white uppercase font-bold tracking-widest rounded-md">{post.type}</Badge>
            <div className="flex items-center gap-2 text-slate-gray/40 text-xs font-bold uppercase tracking-widest">
              <Calendar size={14} />
              {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[0.9] text-deep-black">
            {post.title}
          </h1>
          <div className="flex items-center justify-between py-6 border-y border-border-color">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-off-white rounded-md flex items-center justify-center font-extrabold text-xs text-deep-black border border-border-color">
                {post.authorName?.substring(0, 2).toUpperCase() || 'SU'}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-gray/40">Written by</div>
                <div className="text-sm font-extrabold uppercase tracking-tight text-deep-black">{post.authorName || 'Official Club Media'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className={post.likedBy?.includes(user?.uid) ? "text-primary-green" : "text-slate-gray"}
                onClick={handleLike}
              >
                <Heart size={20} className={post.likedBy?.includes(user?.uid) ? "fill-primary-green mr-2" : "mr-2"} />
                {post.likesCount || 0}
              </Button>
              <Button variant="ghost" className="text-slate-gray" onClick={() => setShowComments(!showComments)}>
                <MessageSquare size={20} className="mr-2" />
                {comments.length}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-md hover:bg-off-white text-slate-gray">
                <Share2 size={20} />
              </Button>
            </div>
          </div>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-md border border-border-color">
          <img 
            src={post.image || "https://picsum.photos/seed/football/1200/800"} 
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-xl text-slate-gray leading-relaxed whitespace-pre-wrap font-medium">
            {post.content}
          </p>
        </div>

        {/* Comments Section */}
        <section className="pt-12 border-t border-border-color space-y-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-deep-black">Comments ({comments.length})</h2>
          
          {user ? (
            <form onSubmit={handleComment} className="flex gap-4">
              <Avatar className="w-10 h-10 border border-border-color">
                <AvatarImage src={profile?.profileImage || user.photoURL || ''} />
                <AvatarFallback>{profile?.name?.substring(0, 2) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input 
                  placeholder="Share your thoughts..." 
                  className="bg-off-white border-border-color h-10 rounded-md"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button type="submit" className="bg-deep-black text-pure-white rounded-md h-10 px-6">
                  <Send size={16} />
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-off-white p-6 rounded-md text-center">
              <p className="text-sm text-slate-gray font-bold uppercase tracking-widest mb-4">Login to join the conversation</p>
              <Link to="/login">
                <Button className="bg-deep-black text-pure-white rounded-md font-bold uppercase tracking-widest px-8">Login</Button>
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="w-10 h-10 border border-border-color">
                  <AvatarImage src={comment.authorImage} />
                  <AvatarFallback>{comment.authorName?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-off-white p-4 rounded-md border border-border-color">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-extrabold text-sm text-deep-black">{comment.authorName}</span>
                    <span className="text-[10px] font-bold text-slate-gray/40 uppercase tracking-widest">
                      {format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-gray leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};

export default NewsDetail;
