import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, increment, arrayUnion, arrayRemove, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Send, Trash2, Image as ImageIcon, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

interface CommunityFeedProps {
  limitCount?: number;
  showCreate?: boolean;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ limitCount, showCreate = true }) => {
  const { user, profile, isAdmin } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    if (limitCount) {
      q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(limitCount));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [limitCount]);

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

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post');
      return;
    }
    if (!newPost.trim() && !imageFile) return;

    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'posts'), {
        title: 'Community Post',
        content: newPost,
        authorId: user.uid,
        authorName: profile?.name || user.displayName || 'Fan',
        authorImage: profile?.profileImage || user.photoURL || '',
        type: 'community',
        image: imageUrl,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: [],
        commentsCount: 0,
      });
      setNewPost('');
      setImageFile(null);
      setImagePreview(null);
      toast.success('Post shared with the community!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to share post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string, likedBy: string[] = []) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    const isLiked = likedBy.includes(user.uid);
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likesCount: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!commentText.trim()) return;

    try {
      const commentData = {
        postId,
        authorId: user.uid,
        authorName: profile?.name || user.displayName || 'Fan',
        authorImage: profile?.profileImage || user.photoURL || '',
        content: commentText,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, `posts/${postId}/comments`), commentData);
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(1)
      });
      setCommentText('');
      setCommentingOn(null);
      toast.success('Comment added');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="space-y-8">
      {/* Post Creation */}
      {showCreate && (
        <Card className="card-geometric overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handlePost} className="space-y-4">
              <div className="flex gap-4">
                <Avatar className="w-12 h-12 border-2 border-primary-green">
                  <AvatarImage src={profile?.profileImage || user?.photoURL || ''} />
                  <AvatarFallback className="bg-off-white text-slate-gray"><User size={20} /></AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea 
                    placeholder="What's on your mind, Fan?" 
                    className="bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 min-h-[100px] text-deep-black placeholder:text-slate-gray/40"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                  />
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl border border-border-color" />
                      <button 
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-off-white">
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    id="post-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label 
                    htmlFor="post-image"
                    className="flex items-center gap-2 text-slate-gray hover:text-primary-green hover:bg-off-white rounded-md px-3 py-2 cursor-pointer transition-colors text-sm font-bold uppercase tracking-widest"
                  >
                    <ImageIcon size={20} />
                    Add Image
                  </label>
                </div>
                <Button 
                  type="submit" 
                  className="bg-deep-black text-pure-white hover:bg-slate-gray font-bold uppercase tracking-widest rounded-md px-8"
                  disabled={submitting || (!newPost.trim() && !imageFile)}
                >
                  {submitting ? 'Posting...' : 'Post'}
                  <Send size={16} className="ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feed */}
      <div className="space-y-8">
        <AnimatePresence>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="card-geometric h-48 animate-pulse" />
            ))
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="card-geometric overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border-color">
                        <AvatarImage src={post.authorImage} />
                        <AvatarFallback className="bg-off-white text-slate-gray text-[10px] font-bold uppercase">
                          {post.authorName?.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-extrabold text-sm tracking-tight">{post.authorName}</div>
                        <div className="text-[10px] text-slate-gray uppercase font-bold tracking-widest">
                          {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, HH:mm') : 'Just now'}
                        </div>
                      </div>
                    </div>
                    {(isAdmin || (user && post.authorId === user.uid)) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-gray hover:text-red-500 hover:bg-red-50 rounded-md"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <p className="text-sm text-slate-gray leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.image && (
                      <img 
                        src={post.image} 
                        alt="Post content" 
                        className="mt-4 rounded-xl w-full object-cover max-h-96 border border-border-color"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex flex-col gap-4 border-t border-off-white pt-4">
                    <div className="flex items-center gap-6 w-full">
                      <button 
                        onClick={() => handleLike(post.id, post.likedBy)}
                        className="flex items-center gap-2 text-slate-gray hover:text-primary-green transition-colors group"
                      >
                        <Heart size={20} className={post.likedBy?.includes(user?.uid) ? "fill-primary-green text-primary-green" : "group-hover:scale-110 transition-transform"} />
                        <span className="text-sm font-bold">{post.likesCount || 0}</span>
                      </button>
                      <button 
                        onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                        className="flex items-center gap-2 text-slate-gray hover:text-primary-green transition-colors group"
                      >
                        <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">{post.commentsCount || 0}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {commentingOn === post.id && (
                      <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Write a comment..." 
                            className="bg-off-white border-border-color rounded-md h-10 text-sm"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          />
                          <Button 
                            size="icon" 
                            className="bg-deep-black text-pure-white h-10 w-10 rounded-md shrink-0"
                            onClick={() => handleComment(post.id)}
                          >
                            <Send size={16} />
                          </Button>
                        </div>
                        
                        {/* Comments List (Simplified for feed) */}
                        <CommentsList postId={post.id} />
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CommentsList: React.FC<{ postId: string }> = ({ postId }) => {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, `posts/${postId}/comments`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [postId]);

  if (comments.length === 0) return null;

  return (
    <div className="space-y-3 pl-4 border-l-2 border-off-white">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <Avatar className="w-6 h-6 border border-border-color">
            <AvatarImage src={comment.authorImage} />
            <AvatarFallback className="text-[8px]">{comment.authorName?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-off-white p-2 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-extrabold">{comment.authorName}</span>
              <span className="text-[8px] text-slate-gray">{format(new Date(comment.createdAt), 'HH:mm')}</span>
            </div>
            <p className="text-xs text-slate-gray">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityFeed;
