import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Comment, UserProfile } from '../types';
import { firebaseService } from '../firebaseService';
import { 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ThumbsUp, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface CommentSectionProps {
  articleId: string;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

// Simple academic filter
const PROFANITY_WORDS = ['idiot', 'stupid', 'dumb', 'jerk', 'spam', 'hate', 'fudge', 'crap'];

export default function CommentSection({ articleId, currentUser, onOpenAuth }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'top'>('top');

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      const fetched = await firebaseService.getComments(articleId);
      setComments(fetched);
    } catch (err) {
      console.error("Failed loading comments:", err);
    }
  };

  const handleModerationCheck = (text: string): boolean => {
    const lower = text.toLowerCase();
    const hasProfanity = PROFANITY_WORDS.some(word => lower.includes(word));
    if (hasProfanity) {
      setErrorMsg("⚠️ Safety Filter: Your comment contains words that violate classroom guidelines. Please keep discussions kind and scholarly.");
      setTimeout(() => setErrorMsg(null), 6000);
      return false;
    }
    return true;
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newCommentText.trim()) return;

    if (!handleModerationCheck(newCommentText)) return;

    setLoading(true);
    setErrorMsg(null);

    const commentId = 'com-' + Date.now();
    const newComment: Comment = {
      id: commentId,
      articleId,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorSchool: currentUser.school,
      authorCountry: currentUser.country,
      content: newCommentText.trim(),
      createdAt: Date.now(),
      reportsCount: 0,
      isHidden: false,
      likesCount: 0,
      likedBy: []
    };

    try {
      await firebaseService.addComment(newComment);
      setComments(prev => [newComment, ...prev]);
      setNewCommentText('');
      setSuccessMsg("✏️ Note posted successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const likedBy = Array.isArray(c.likedBy) ? [...c.likedBy] : [];
      const userIndex = likedBy.indexOf(currentUser.uid);
      let newLikedBy: string[];
      let newCount: number;
      if (userIndex >= 0) {
        newLikedBy = likedBy.filter(id => id !== currentUser.uid);
        newCount = Math.max(0, (c.likesCount || likedBy.length) - 1);
      } else {
        newLikedBy = [...likedBy, currentUser.uid];
        newCount = (c.likesCount || likedBy.length) + 1;
      }
      return {
        ...c,
        likedBy: newLikedBy,
        likesCount: newCount
      };
    }));

    try {
      const res = await firebaseService.toggleCommentLike(commentId, currentUser.uid);
      setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        const currentLikedBy = Array.isArray(c.likedBy) ? [...c.likedBy] : [];
        let updatedLikedBy = currentLikedBy;
        if (res.liked && !currentLikedBy.includes(currentUser.uid)) {
          updatedLikedBy = [...currentLikedBy, currentUser.uid];
        } else if (!res.liked && currentLikedBy.includes(currentUser.uid)) {
          updatedLikedBy = currentLikedBy.filter(id => id !== currentUser.uid);
        }
        return {
          ...c,
          likesCount: res.likesCount,
          likedBy: updatedLikedBy
        };
      }));
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
      loadComments();
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (reportedIds.includes(commentId)) return;
    try {
      await firebaseService.reportComment(commentId);
      setReportedIds(prev => [...prev, commentId]);
      setSuccessMsg("🚩 This comment has been flagged for admin review. Thank you for keeping discussions safe!");
      setTimeout(() => setSuccessMsg(null), 5000);
      loadComments();
    } catch (err) {
      console.error("Reporting error:", err);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') {
      const aLikes = a.likesCount ?? (a.likedBy?.length || 0);
      const bLikes = b.likesCount ?? (b.likedBy?.length || 0);
      if (bLikes !== aLikes) return bLikes - aLikes;
    }
    return b.createdAt - a.createdAt;
  });

  const maxLikesInThread = Math.max(...comments.map(c => c.likesCount || (c.likedBy?.length || 0)), 0);

  return (
    <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-6 shadow-xs mt-8">
      
      {/* Thread Title & Sorting Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-700" />
          <h3 className="font-display font-semibold text-stone-900">
            Classroom Discussion ({comments.length})
          </h3>
        </div>

        {comments.length > 1 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100/90 border border-stone-200/80 p-1 rounded-lg text-xs">
            <span className="text-[11px] font-mono text-stone-400 px-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortBy('top')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                sortBy === 'top'
                  ? 'bg-white text-amber-900 font-semibold shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Most Helpful</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                sortBy === 'newest'
                  ? 'bg-white text-amber-900 font-semibold shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Latest
            </button>
          </div>
        )}
      </div>

      {/* Messages / Notifications alerts */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-sans font-semibold flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
        
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-sans font-semibold flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post a Comment Section */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-800 font-display">
              {currentUser.displayName.charAt(0)}
            </div>
            
            <div className="flex-1">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Join the discussion... Share peer feedback, constructive questions, or academic perspectives!"
                rows={3}
                className="w-full bg-white border border-stone-200 rounded-lg p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-stone-800 placeholder-stone-400 shadow-inner"
              />
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-stone-500 font-sans">
                  Posting as <span className="font-semibold text-stone-800">{currentUser.displayName}</span> ({currentUser.school})
                </span>
                <button
                  type="submit"
                  disabled={loading || !newCommentText.trim()}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Post note</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-lg text-center">
          <p className="text-stone-700 text-sm font-sans mb-3">
            Only registered student authors or teachers can participate in the discussion.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            Create Student Profile to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => {
            const hasBeenReported = reportedIds.includes(comment.id);
            const likes = comment.likesCount ?? (comment.likedBy?.length || 0);
            const isLikedByCurrentUser = currentUser ? !!comment.likedBy?.includes(currentUser.uid) : false;
            const isHighlightWorthy = likes >= 3 || (maxLikesInThread >= 2 && likes === maxLikesInThread);

            return (
              <motion.div 
                key={comment.id}
                layout
                className={`bg-white border rounded-xl p-4 shadow-xs relative transition-all ${
                  isLikedByCurrentUser
                    ? 'border-amber-400/80 bg-amber-50/20'
                    : 'border-stone-200/80 hover:border-amber-500/30'
                }`}
              >
                {/* Header with info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-xs text-stone-800">
                      {comment.authorName}
                    </span>
                    <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                      {comment.authorSchool}
                    </span>
                    <span className="text-[9px] text-amber-800 font-semibold font-display">
                      {comment.authorCountry}
                    </span>

                    {/* Constructive / Highlighted Feedback Badge */}
                    {isHighlightWorthy && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 border border-amber-300/80 px-1.5 py-0.5 rounded-sm shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        Constructive Feedback
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {formatDate(comment.createdAt)}
                    </span>
                    
                    {/* Report action */}
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      disabled={hasBeenReported}
                      className={`p-1 rounded-sm hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer ${hasBeenReported ? 'text-red-500 cursor-not-allowed' : ''}`}
                      title="Flag this comment for review"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-stone-700 text-xs leading-relaxed pl-0.5 mb-3 whitespace-pre-line">
                  {comment.content}
                </p>

                {/* Action Bar: Like Button & Helpful Counter */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id)}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                        isLikedByCurrentUser
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold shadow-2xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-amber-800 border border-stone-200/80'
                      }`}
                      title={currentUser ? (isLikedByCurrentUser ? "Undo helpful endorsement" : "Mark as constructive & helpful") : "Sign in to endorse this note"}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 transition-transform ${isLikedByCurrentUser ? 'text-amber-700 fill-amber-600/30 scale-110' : 'text-stone-400 group-hover:text-amber-600'}`} />
                      <span className="text-[11px]">
                        {isLikedByCurrentUser ? 'Helpful' : 'Helpful'}
                      </span>
                      {likes > 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          isLikedByCurrentUser ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {likes}
                        </span>
                      )}
                    </button>

                    {likes > 0 && (
                      <span className="text-[10px] text-stone-400 font-sans hidden sm:inline">
                        {likes === 1 ? '1 student found this constructive' : `${likes} students found this constructive`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Report status tag on card */}
                {hasBeenReported && (
                  <div className="absolute top-1 right-8 px-2 py-0.5 bg-red-100 text-red-800 text-[8px] font-bold rounded flex items-center gap-1 shadow-2xs">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    <span>FLAGGED</span>
                  </div>
                )}

              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 text-stone-400 text-xs font-sans">
            💬 No classroom notes have been pinned yet. Be the first to share your thoughts!
          </div>
        )}
      </div>

    </div>
  );
}
