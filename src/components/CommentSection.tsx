import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Comment, UserProfile } from '../types';
import { firebaseService } from '../firebaseService';
import { MessageSquare, Send, AlertTriangle, CornerDownRight, CheckCircle, ShieldAlert } from 'lucide-react';

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
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);

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
      isHidden: false
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

  const handleReportComment = async (commentId: string) => {
    if (reportedIds.includes(commentId)) return;
    try {
      await firebaseService.reportComment(commentId);
      setReportedIds(prev => [...prev, commentId]);
      alert("This comment has been flagged for admin review. Thank you for keeping impactED safe!");
      // reload or filter
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

  return (
    <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-6 shadow-sm mt-8">
      
      {/* Thread Title */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200/80 pb-3">
        <MessageSquare className="w-5 h-5 text-amber-700" />
        <h3 className="font-display font-semibold text-stone-900">
          Classroom Discussion ({comments.length})
        </h3>
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
                placeholder="Join the discussion... Be respectful, academic, and supportive!"
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
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
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
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow hover:shadow-md transition-all"
          >
            Create Student Profile to Comment
          </button>
        </div>
      )}

      {/* Comments List (Notebook Paper Style) */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const hasBeenReported = reportedIds.includes(comment.id);
            return (
              <motion.div 
                key={comment.id}
                layout
                className="bg-white border border-stone-200/60 rounded-xl p-4 shadow-xs relative hover:border-amber-500/20 transition-colors"
              >
                
                {/* Header with info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-xs text-stone-800">
                      {comment.authorName}
                    </span>
                    <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                      {comment.authorSchool}
                    </span>
                    <span className="text-[9px] text-amber-800 font-semibold font-display">
                      {comment.authorCountry}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400">
                      {formatDate(comment.createdAt)}
                    </span>
                    
                    {/* Report action */}
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      disabled={hasBeenReported}
                      className={`p-1 rounded-sm hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors ${hasBeenReported ? 'text-red-500 cursor-not-allowed' : ''}`}
                      title="Flag this comment for review"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-stone-700 text-xs leading-relaxed pl-1">
                  {comment.content}
                </p>

                {/* Report status tag on card */}
                {hasBeenReported && (
                  <div className="absolute top-1 right-8 px-2 py-0.5 bg-red-100 text-red-800 text-[8px] font-bold rounded flex items-center gap-1 shadow-sm">
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
