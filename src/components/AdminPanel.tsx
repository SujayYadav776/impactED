import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, Comment, UserProfile, CATEGORIES, COUNTRIES, AuditLog, SiteStats } from '../types';
import { firebaseService } from '../firebaseService';
import { calculateReadingTime } from '../utils/readingTime';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  FileText, 
  Flag, 
  EyeOff, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  Award,
  TrendingUp,
  BarChart2,
  Send,
  PlusCircle,
  BookOpen,
  Calendar,
  Users,
  Clock,
  ArrowUpRight,
  Play,
  Pause,
  Video,
  Plus,
  Search,
  History,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Check,
  Undo2
} from 'lucide-react';

const PRESET_COVERS = [
  { name: 'Abstract Fractal (Science)', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
  { name: 'Warm Library (Lit)', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Emerald Forest (Nature)', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Historic Atlas (Global)', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80' },
];

interface AdminPanelProps {
  currentUser: UserProfile;
  onRefreshFeed: () => void;
  siteStats?: SiteStats;
}

export default function AdminPanel({ currentUser, onRefreshFeed, siteStats }: AdminPanelProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [reportedComments, setReportedComments] = useState<Comment[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Decision Form States
  const [decisionNotes, setDecisionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Low Quality');
  const [recentlyDeleted, setRecentlyDeleted] = useState<Article | null>(null);
  const [adminSelectedCategory, setAdminSelectedCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    if (selectedArticle) {
      setAdminSelectedCategory(
        selectedArticle.category && selectedArticle.category !== 'Unassigned'
          ? selectedArticle.category
          : CATEGORIES[0]
      );
    }
  }, [selectedArticle]);

  // Safe notification and delete confirmation states for iframe environment
  const [adminNotification, setAdminNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showAdminNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAdminNotification({ message, type });
    setTimeout(() => {
      setAdminNotification(prev => prev?.message === message ? null : prev);
    }, 6000);
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'submissions' | 'comments' | 'metrics' | 'direct-submit' | 'published' | 'audit'>('dashboard');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [actionLogFilter, setActionLogFilter] = useState('all');

  // Published Works Tab Filter States
  const [adminPublishTypeFilter, setAdminPublishTypeFilter] = useState<'all' | 'essay' | 'blog' | 'article'>('all');
  const [adminPublishCategoryFilter, setAdminPublishCategoryFilter] = useState<string>('all');
  const [adminPublishSearchQuery, setAdminPublishSearchQuery] = useState('');

  // Editing Published Article Modal States
  const [editingPublishedArticle, setEditingPublishedArticle] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState(CATEGORIES[0]);
  const [editType, setEditType] = useState<'essay' | 'blog' | 'article'>('article');
  const [editTags, setEditTags] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editAuthorSchool, setEditAuthorSchool] = useState('');
  const [editAuthorCountry, setEditAuthorCountry] = useState(COUNTRIES[0].name);
  const [editIsUploading, setEditIsUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const [editIsDragging, setEditIsDragging] = useState(false);

  const handleOpenEditModal = (art: Article) => {
    setEditingPublishedArticle(art);
    setEditTitle(art.title || '');
    setEditSummary(art.summary || '');
    setEditContent(art.content || '');
    setEditCategory(art.category || CATEGORIES[0]);
    setEditType(art.type || 'article');
    setEditTags(art.tags ? art.tags.join(', ') : '');
    setEditCoverImage(art.coverImage || PRESET_COVERS[0].url);
    setEditAuthorName(art.authorName || '');
    setEditAuthorSchool(art.authorSchool || '');
    setEditAuthorCountry(art.authorCountry || COUNTRIES[0].name);
    setEditUploadError(null);
    setEditIsUploading(false);
    setEditIsDragging(false);
  };

  const compressAndSetEditImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setEditUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    
    setEditUploadError(null);
    setEditIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setEditCoverImage(dataUrl);
          } catch (err) {
            console.error("Canvas toDataURL failed", err);
            setEditCoverImage(e.target?.result as string);
          }
        } else {
          setEditCoverImage(e.target?.result as string);
        }
        setEditIsUploading(false);
      };
      img.onerror = () => {
        setEditUploadError('Failed to load image file.');
        setEditIsUploading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setEditUploadError('Failed to read image file.');
      setEditIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setEditIsDragging(true);
  };

  const handleEditDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setEditIsDragging(false);
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setEditIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      compressAndSetEditImage(e.dataTransfer.files[0]);
    }
  };

  const handleEditFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      compressAndSetEditImage(e.target.files[0]);
    }
  };

  const handleSaveEditedArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPublishedArticle) return;

    if (!editTitle.trim() || !editSummary.trim() || !editContent.trim()) {
      showAdminNotification('Please fill in Title, Summary, and Content.', 'error');
      return;
    }

    const words = editContent.trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    const updatedArt: Article = {
      ...editingPublishedArticle,
      title: editTitle.trim(),
      summary: editSummary.trim(),
      content: editContent.trim(),
      category: editCategory,
      type: editType,
      tags: editTags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean),
      coverImage: editCoverImage.trim() || PRESET_COVERS[0].url,
      authorName: editAuthorName.trim() || editingPublishedArticle.authorName || 'Anonymous',
      authorSchool: editAuthorSchool.trim() || editingPublishedArticle.authorSchool || 'Student',
      authorCountry: editAuthorCountry || editingPublishedArticle.authorCountry || 'Global',
      wordCount: words,
      readingTime: readTime,
    };

    try {
      await firebaseService.saveArticle(updatedArt);
      setArticles(prev => prev.map(a => a.id === updatedArt.id ? updatedArt : a));
      
      await firebaseService.createAuditLog({
        adminId: currentUser.uid,
        adminName: currentUser.displayName,
        adminEmail: currentUser.email,
        action: 'approve',
        targetId: updatedArt.id,
        targetTitle: updatedArt.title,
        targetAuthorName: updatedArt.authorName,
        details: `Edited published manuscript details. Title: "${updatedArt.title}"`,
        timestamp: Date.now()
      });

      showAdminNotification('Publication updated successfully!', 'success');
      onRefreshFeed();
      setEditingPublishedArticle(null);
    } catch (err) {
      console.error('Error saving updated article:', err);
      showAdminNotification('Failed to update publication. Please try again.', 'error');
    }
  };

  // Direct Submission Form States
  const [dsTitle, setDsTitle] = useState('');
  const [dsSummary, setDsSummary] = useState('');
  const [dsContent, setDsContent] = useState('');
  const [dsCategory, setDsCategory] = useState(CATEGORIES[0]);
  const [dsType, setDsType] = useState<'essay' | 'blog' | 'article'>('blog');
  const [dsTags, setDsTags] = useState('');
  const [dsCover, setDsCover] = useState(PRESET_COVERS[0].url);
  const [dsIsUploading, setDsIsUploading] = useState(false);
  const [dsUploadError, setDsUploadError] = useState<string | null>(null);
  const [dsIsDragging, setDsIsDragging] = useState(false);

  const compressAndSetDsImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setDsUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    
    setDsUploadError(null);
    setDsIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setDsCover(dataUrl);
          } catch (err) {
            console.error("Canvas toDataURL failed, using original size", err);
            setDsCover(e.target?.result as string);
          }
        } else {
          setDsCover(e.target?.result as string);
        }
        setDsIsUploading(false);
      };
      img.onerror = () => {
        setDsUploadError('Failed to load image file. It might be corrupted.');
        setDsIsUploading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setDsUploadError('Failed to read image file.');
      setDsIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDsDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDsIsDragging(true);
  };

  const handleDsDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDsIsDragging(false);
  };

  const handleDsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDsIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      compressAndSetDsImage(e.dataTransfer.files[0]);
    }
  };

  const handleDsFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      compressAndSetDsImage(e.target.files[0]);
    }
  };
  const [dsAuthorName, setDsAuthorName] = useState('');
  const [dsAuthorSchool, setDsAuthorSchool] = useState('');
  const [dsAuthorCountry, setDsAuthorCountry] = useState(COUNTRIES[0].name);
  const [dsStatus, setDsStatus] = useState<'Published' | 'Submitted'>('Published');
  const [dsSaving, setDsSaving] = useState(false);
  const [dsShowUrlInput, setDsShowUrlInput] = useState(false);
  const [dsTargetLevel, setDsTargetLevel] = useState('High School (Grades 9-12)');
  const [dsPledgeOriginal, setDsPledgeOriginal] = useState(true);
  const [dsPledgeGuidelines, setDsPledgeGuidelines] = useState(true);
  const [dsPledgeCite, setDsPledgeCite] = useState(true);

  const handleResetDsForm = () => {
    setDsTitle('');
    setDsSummary('');
    setDsContent('');
    setDsCategory(CATEGORIES[0]);
    setDsType('blog');
    setDsTags('');
    setDsCover(PRESET_COVERS[0].url);
    setDsAuthorName('');
    setDsAuthorSchool('');
    setDsAuthorCountry(COUNTRIES[0].name);
    setDsStatus('Published');
    setDsUploadError(null);
    setDsShowUrlInput(false);
    showAdminNotification('Direct submission intake form reset.', 'info');
  };

  // SLA Live Stop Watch Clock States (Donezo "Time Tracker" replica)
  const [timerTime, setTimerTime] = useState(84 * 60 + 8); // 01:24:08 initially in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimerTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Weekly Publication Timeline calculation
  const getPublicationsByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: { [key: string]: number } = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    // Process real articles
    articles.forEach(art => {
      if (art.status === 'Published' && art.createdAt) {
        const date = new Date(art.createdAt);
        const dayName = days[date.getDay()];
        counts[dayName] = (counts[dayName] || 0) + 1;
      }
    });

    const baseCounts: { [key: string]: number } = { Sun: 1, Mon: 3, Tue: 2, Wed: 4, Thu: 1, Fri: 2, Sat: 1 };
    
    return days.map(day => {
      const realVal = counts[day];
      const displayVal = realVal > 0 ? realVal : baseCounts[day];
      return {
        day,
        count: displayVal,
        isReal: realVal > 0
      };
    });
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const allArts = await firebaseService.getAllArticles();
      setArticles(allArts);
      const reported = await firebaseService.getReportedComments();
      setReportedComments(reported);
      try {
        const logs = await firebaseService.getAuditLogs();
        setAuditLogs(logs);
      } catch (logErr) {
        console.error("Failed to load audit logs:", logErr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logAdminAction = async (action: string, targetId: string, targetTitle?: string, targetAuthorName?: string, details?: string) => {
    try {
      await firebaseService.createAuditLog({
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        adminName: currentUser.displayName,
        action,
        targetId,
        targetTitle,
        targetAuthorName,
        timestamp: Date.now(),
        details
      });
      // Refresh logs
      const logs = await firebaseService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  };

  const handleReviewDecision = async (status: 'Published' | 'Revision Requested' | 'Rejected') => {
    if (!selectedArticle) return;

    const updatedArticle: Article = {
      ...selectedArticle,
      status,
      category: adminSelectedCategory,
      rejectionReason: status !== 'Published' ? `${rejectionReason}: ${decisionNotes}` : undefined
    };

    try {
      await firebaseService.saveArticle(updatedArticle);
      showAdminNotification(`Article status updated successfully to: ${status}!`, "success");
      
      let actionType = 'approve';
      let details = 'Approved and published to public feed.';
      if (status === 'Revision Requested') {
        actionType = 'revision_request';
        details = `Revision requested. Reason: ${rejectionReason}. Notes: ${decisionNotes}`;
      } else if (status === 'Rejected') {
        actionType = 'reject';
        details = `Submission rejected. Reason: ${rejectionReason}. Notes: ${decisionNotes}`;
      }

      await logAdminAction(
        actionType,
        selectedArticle.id,
        selectedArticle.title,
        selectedArticle.authorName,
        details
      );
      
      // Clear forms
      setSelectedArticle(null);
      setDecisionNotes('');
      
      // Reload feeds
      loadAdminData();
      onRefreshFeed();
    } catch (err) {
      console.error(err);
      showAdminNotification("Failed updating article status.", "error");
    }
  };

  const handleDirectApprove = async (art: Article) => {
    const updatedArticle: Article = {
      ...art,
      status: 'Published',
      rejectionReason: undefined
    };

    try {
      await firebaseService.saveArticle(updatedArticle);
      showAdminNotification(`Article "${art.title}" approved and published successfully to public feed!`, "success");
      
      await logAdminAction(
        'approve',
        art.id,
        art.title,
        art.authorName,
        'Approved and published to public feed directly from list.'
      );
      
      if (selectedArticle?.id === art.id) {
        setSelectedArticle(null);
      }
      
      loadAdminData();
      onRefreshFeed();
    } catch (err) {
      console.error(err);
      showAdminNotification("Failed to directly approve and publish article.", "error");
    }
  };

  const handleCommentModeration = async (commentId: string, isHidden: boolean) => {
    try {
      const targetComment = reportedComments.find(c => c.id === commentId);
      await firebaseService.updateCommentModeration(commentId, isHidden);
      showAdminNotification(isHidden ? "Comment hidden from public board." : "Comment reports cleared.", "success");
      
      await logAdminAction(
        isHidden ? 'hide_comment' : 'approve_comment',
        commentId,
        targetComment?.content ? (targetComment.content.length > 60 ? targetComment.content.substring(0, 60) + '...' : targetComment.content) : 'Comment Content',
        targetComment?.authorName || 'Unknown Student',
        isHidden ? 'Moderated and hidden comment' : 'Approved comment and cleared reports'
      );

      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArticle = (articleId: string) => {
    setDeleteConfirmId(articleId);
  };

  const executeDeleteArticle = async (articleId: string) => {
    const articleToDelete = articles.find(a => a.id === articleId);
    if (!articleToDelete) return;

    try {
      await firebaseService.deleteArticle(articleId);
      setDeleteConfirmId(null);
      
      await logAdminAction(
        'delete',
        articleId,
        articleToDelete.title,
        articleToDelete.authorName,
        `Deleted publication of type ${articleToDelete.type}`
      );

      if (articleToDelete.status === 'Published') {
        setRecentlyDeleted(articleToDelete);
        // Automatically dismiss after 10 seconds
        setTimeout(() => {
          setRecentlyDeleted(prev => {
            if (prev?.id === articleToDelete.id) {
              return null;
            }
            return prev;
          });
        }, 10000);
      } else {
        showAdminNotification("🎉 Publication removed successfully!", "success");
      }
      
      loadAdminData();
      onRefreshFeed();
    } catch (err) {
      console.error("Failed to delete article:", err);
      showAdminNotification("Failed to delete article. Please try again.", "error");
    }
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeleted) return;
    try {
      await firebaseService.saveArticle(recentlyDeleted);
      
      await logAdminAction(
        'restore',
        recentlyDeleted.id,
        recentlyDeleted.title,
        recentlyDeleted.authorName,
        'Undid delete operation and restored publication'
      );

      setRecentlyDeleted(null);
      loadAdminData();
      onRefreshFeed();
      showAdminNotification("Publication restored successfully!", 'success');
    } catch (err) {
      console.error("Failed to restore article:", err);
      showAdminNotification("Failed to restore article. Please try again.", 'error');
    }
  };

  // Helper methods for Direct Submission
  const parseDsTags = (): string[] => {
    return dsTags
      .split(',')
      .map(t => t.trim().replace('#', ''))
      .filter(t => t.length > 0)
      .slice(0, 3);
  };

  const getDsWordCount = () => {
    return calculateReadingTime(dsContent).wordCount;
  };

  const getDsReadingTime = () => {
    return calculateReadingTime(dsContent).minutes;
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dsTitle.trim() || !dsContent.trim() || !dsAuthorName.trim() || !dsAuthorSchool.trim()) {
      showAdminNotification("Please fill in Title, Content, Student Name, and School Affiliation (*).", "error");
      return;
    }

    if (!dsPledgeOriginal || !dsPledgeGuidelines || !dsPledgeCite) {
      showAdminNotification("Please confirm the Editorial Verification & Honor Check items before intake.", "error");
      return;
    }

    setDsSaving(true);

    const articleId = 'art-direct-' + Date.now();
    const fallbackSummary = dsContent.replace(/^[#*`>\s-]+/gm, '').trim().slice(0, 220);
    const newArticle: Article = {
      id: articleId,
      title: dsTitle.trim(),
      summary: dsSummary.trim() || fallbackSummary || 'Scholastic research manuscript.',
      content: dsContent.trim(),
      category: dsCategory,
      type: dsType,
      tags: parseDsTags(),
      authorId: 'direct-sub-' + Date.now(),
      authorName: dsAuthorName.trim(),
      authorSchool: dsAuthorSchool.trim(),
      authorCountry: dsAuthorCountry,
      status: dsStatus,
      coverImage: dsCover,
      reactions: { great: 0, like: 0, heart: 0, wow: 0 },
      createdAt: Date.now(),
      readingTime: getDsReadingTime(),
      wordCount: getDsWordCount(),
      commentsCount: 0
    };

    try {
      await firebaseService.saveArticle(newArticle);
      showAdminNotification(`Article "${dsTitle.trim()}" successfully uploaded and set to "${dsStatus}"!`, "success");
      
      await logAdminAction(
        dsStatus === 'Published' ? 'direct_publish' : 'direct_submit',
        articleId,
        newArticle.title,
        newArticle.authorName,
        `Directly submitted/published article as administrator`
      );

      // Reset form
      handleResetDsForm();
      
      // Refresh
      loadAdminData();
      onRefreshFeed();
      setActiveTab('submissions');
    } catch (err) {
      console.error(err);
      showAdminNotification("Failed to submit article directly. Please try again.", "error");
    } finally {
      setDsSaving(false);
    }
  };

  // Filter lists based on status
  const pendingArticles = articles.filter(a => a.status === 'Submitted' || a.status === 'In Review');
  const moderatedArticles = articles.filter(a => a.status === 'Published' || a.status === 'Rejected' || a.status === 'Revision Requested');

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xl p-6 sm:p-8 max-w-6xl mx-auto">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-bold uppercase tracking-wider">
              Staff Portal
            </span>
            <h2 className="font-display font-bold text-xl text-stone-900">
              impactED Moderation Desk
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review submissions, manage flagged comments, and monitor academic publishing metrics.
          </p>
        </div>
        
        <div className="text-right text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-100">
          <span className="text-stone-500 font-sans block">Moderator on Duty:</span>
          <span className="font-semibold text-stone-800">{currentUser.displayName}</span>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex border-b border-stone-100 gap-2 mb-6 overflow-x-auto select-none scrollbar-none">
        <button
          onClick={() => { setActiveTab('dashboard'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => { setActiveTab('submissions'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'submissions' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Review Submissions ({pendingArticles.length})
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'comments' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Comment Reports ({reportedComments.length})
        </button>

        <button
          onClick={() => { setActiveTab('published'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'published' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-700" />
          <span>Published Works ({articles.filter(a => a.status === 'Published').length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('direct-submit'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'direct-submit' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>Direct Submission</span>
        </button>

        <button
          onClick={() => { setActiveTab('audit'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'audit' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <History className="w-3.5 h-3.5 text-emerald-700" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Dashboard Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50 border border-stone-200/60 p-5 rounded-2xl">
            <div>
              <h3 className="font-productsans font-black text-2xl text-stone-900 tracking-tight">
                Dashboard Overview
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 font-productsans">
                Plan, prioritize, and curate scholarly student articles with ease.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('direct-submit')}
                className="w-full md:w-auto bg-[#523624] hover:bg-[#3d2517] text-white rounded-lg flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Article</span>
              </button>
            </div>
          </div>

          {/* FIRST ROW: STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Total Visits */}
            <div className="bg-[#523624] text-[#f4faf7] rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] border border-[#3d2517] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-emerald-200/90 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Total Visits
                </span>
                <span className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs group-hover:scale-110 transition-transform">
                  ↗
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight block">
                  {siteStats?.totalVisits !== undefined ? siteStats.totalVisits.toLocaleString() : '0'}
                </strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-emerald-100 font-semibold mt-1 font-productsans">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                <span>Real-time website visits</span>
              </div>
            </div>

            {/* 2. Total Articles */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-stone-400">Total Articles</span>
                <span className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs group-hover:scale-110 transition-transform">
                  ↗
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight text-stone-900 block">{articles.length}</strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-stone-500 font-semibold mt-1 font-productsans">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>+5 new submissions this week</span>
              </div>
            </div>

            {/* 3. Under Peer Review */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-stone-400">Active Review Queue</span>
                <span className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs group-hover:scale-110 transition-transform">
                  ↗
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight text-stone-900 block">
                  {articles.filter(a => a.status === 'Submitted' || a.status === 'In Review').length}
                </strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-amber-700 font-semibold mt-1 font-productsans">
                <Clock className="w-3.5 h-3.5" />
                <span>Awaiting moderator grading stamp</span>
              </div>
            </div>

            {/* 4. Approved Publications */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-stone-400">Approved Articles</span>
                <span className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs group-hover:scale-110 transition-transform">
                  ↗
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight text-stone-900 block">
                  {articles.filter(a => a.status === 'Published').length}
                </strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-emerald-700 font-semibold mt-1 font-productsans">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live in archive publication database</span>
              </div>
            </div>
          </div>

          {/* SECOND ROW: TIMELINE & GAUGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDE: PUBLICATION TIMELINE (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-white border border-stone-200 rounded-2xl p-5 shadow-xs min-h-[240px]">
              <div>
                <div className="flex justify-between items-start border-b border-stone-100 pb-2 mb-4">
                  <div>
                    <h4 className="font-productsans font-black text-sm text-stone-950 uppercase tracking-wider">
                      Article Upload Frequency
                    </h4>
                    <p className="text-[10px] text-stone-400 font-sans mt-0.5 font-productsans">
                      Weekly volume of scholarly articles curated and uploaded daily
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-productsans font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    74% conversion target met
                  </span>
                </div>

                {/* Compact Highly Stylized SVG Frequency Chart mimicking reference image */}
                <div className="w-full h-[150px] bg-white border border-stone-150/85 rounded-xl px-2 py-1 select-none relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 520 160" preserveAspectRatio="none">
                    <defs>
                      {/* Diagonal stripe pattern */}
                      <pattern id="diagonal-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="10" stroke="#523624" strokeWidth="2.5" opacity="0.85" />
                        <rect width="10" height="10" fill="#523624" opacity="0.1" />
                      </pattern>
                      {/* Highlight vertical gradient */}
                      <linearGradient id="highlight-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#523624" stopOpacity="0.08" />
                        <stop offset="50%" stopColor="#523624" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="#523624" stopOpacity="0.0" />
                      </linearGradient>
                      {/* Bar solid gradient overlay to blend */}
                      <linearGradient id="bar-overlay-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#523624" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {/* Y Axis Grid Lines */}
                    {[0, 1, 2, 3, 4, 5].map((yVal, i) => {
                      const percentVal = yVal * 20;
                      const yPos = 135 - (percentVal * 1.1);
                      return (
                        <g key={yVal}>
                          <line 
                            x1="30" 
                            y1={yPos} 
                            x2="510" 
                            y2={yPos} 
                            stroke="#f1f1f0" 
                            strokeWidth="1" 
                          />
                          <text 
                            x="22" 
                            y={yPos + 3} 
                            fill="#a8a29e" 
                            fontSize="8" 
                            textAnchor="end" 
                            className="font-mono font-medium"
                          >
                            {yVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Render Columns */}
                    {getPublicationsByDay().map((item, idx) => {
                      const colWidth = 475 / 7;
                      const colX = 35 + (idx * colWidth);
                      const maxVal = 5;
                      const itemHeight = (item.count / maxVal) * 100; // 0 to 100
                      const barY = 135 - (itemHeight * 1.1);
                      const barHeight = itemHeight * 1.1;
                      const isHighlighted = item.day === 'Wed'; // Match Peak day
                      const colCenterX = colX + (colWidth / 2);

                      return (
                        <g key={item.day} className="group cursor-pointer">
                          {/* Vertical Section Divider */}
                          {idx > 0 && (
                            <line 
                              x1={colX} 
                              y1="10" 
                              x2={colX} 
                              y2="135" 
                              stroke="#e7e5e4" 
                              strokeWidth="0.75" 
                              strokeDasharray="2 2" 
                            />
                          )}

                          {/* Bar Fill Striped */}
                          <rect 
                            x={colX + 3} 
                            y={barY} 
                            width={colWidth - 6} 
                            height={barHeight} 
                            fill="url(#diagonal-stripes)" 
                            className="transition-all duration-500 group-hover:opacity-90"
                          />

                          {/* Bar Overlay Gradient */}
                          <rect 
                            x={colX + 3} 
                            y={barY} 
                            width={colWidth - 6} 
                            height={barHeight} 
                            fill="url(#bar-overlay-grad)" 
                            pointerEvents="none"
                          />

                          {/* Floating Pill Accent Cap */}
                          <rect 
                            x={colCenterX - 8} 
                            y={barY - 6} 
                            width="16" 
                            height="2.5" 
                            rx="1.25" 
                            fill={isHighlighted ? '#062e16' : '#14b8a6'} 
                            opacity={isHighlighted ? 1 : 0.8}
                          />

                          {/* X Axis Day Label */}
                          <text 
                            x={colCenterX} 
                            y="150" 
                            fill={isHighlighted ? '#523624' : '#78716c'} 
                            fontSize="9" 
                            textAnchor="middle" 
                            className={`font-productsans font-bold ${isHighlighted ? 'font-black' : ''}`}
                          >
                            {item.day}
                          </text>

                          {/* Mini Hover Tooltip */}
                          <title>{item.count} articles uploaded on {item.day}</title>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: CONVERSION GAUGE (4 cols) */}
            <div className="lg:col-span-4">
              {(() => {
                const publishedCount = articles.filter(a => a.status === 'Published').length;
                const totalCount = articles.length || 1;
                const curationRate = Math.round((publishedCount / totalCount) * 100);

                return (
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-h-[240px] text-center">
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                        <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block text-left">
                          Curation Progress
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-productsans font-bold px-1.5 py-0.5 rounded">
                          Target 70%
                        </span>
                      </div>

                      {/* Gauge graphic */}
                      <div className="flex flex-col items-center pt-2 pb-1 space-y-2">
                        <div className="relative w-full max-w-[120px]">
                          <svg viewBox="0 0 100 55" className="w-full">
                            {/* Background Arc */}
                            <path
                              d="M 10 50 A 40 40 0 0 1 90 50"
                              fill="none"
                              stroke="#f3f4f6"
                              strokeWidth="10"
                              strokeLinecap="round"
                            />
                            {/* Foreground Colored Arc */}
                            <path
                              d="M 10 50 A 40 40 0 0 1 90 50"
                              fill="none"
                              stroke="#523624"
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray="125"
                              strokeDashoffset={125 - (125 * curationRate) / 100}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                        </div>
                        
                        {/* Core percentage display clearly underneath */}
                        <div className="text-center">
                          <strong className="text-2xl font-productsans font-black text-stone-900 block leading-none">{curationRate}%</strong>
                          <span className="text-[9.5px] font-productsans font-semibold text-stone-450 block uppercase tracking-wider mt-1">Curation Rate</span>
                        </div>
                      </div>
                    </div>

                    {/* Legend stats exactly like Donezo */}
                    <div className="grid grid-cols-3 gap-1 border-t border-stone-100 pt-3 text-[9.5px]">
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#523624] mr-1" />
                        <span className="text-stone-500 font-medium font-productsans">Published</span>
                        <strong className="block text-stone-900 font-bold font-productsans mt-0.5">
                          {articles.filter(a => a.status === 'Published').length}
                        </strong>
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />
                        <span className="text-stone-500 font-medium font-productsans">Review</span>
                        <strong className="block text-stone-900 font-bold font-productsans mt-0.5">
                          {articles.filter(a => a.status === 'Submitted' || a.status === 'In Review').length}
                        </strong>
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-stone-300 mr-1" />
                        <span className="text-stone-500 font-medium font-productsans">Drafts</span>
                        <strong className="block text-stone-900 font-bold font-productsans mt-0.5">
                          {articles.filter(a => a.status === 'Draft' || a.status === 'Revision Requested').length}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

          {/* THIRD ROW: CONSOLIDATED CLASSROOM & PUBLISHING ANALYTICS (Bento Grid) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-4">
              <div>
                <h4 className="font-productsans font-black text-lg text-stone-900 tracking-tight">
                  Classroom & Publishing Analytics
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 font-productsans">
                  Real-time engagement telemetry, reading distribution, and institutional contribution statistics.
                </p>
              </div>
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 font-productsans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Classroom Portal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Engagement telemetry */}
              <div className="bg-stone-50/55 border border-stone-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block">
                  Engagement telemetry
                </span>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium font-productsans">Total Active Readers</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">
                      {siteStats?.totalActiveReaders !== undefined ? siteStats.totalActiveReaders.toLocaleString() : Math.floor((siteStats?.totalVisits || 0) * 0.12)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium font-productsans">Weekly Reading Hours</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">
                      {siteStats?.weeklyReadingHours ? `${siteStats.weeklyReadingHours}h` : `${Math.round(articles.reduce((sum, a) => sum + (a.readingTime || 2) * (a.viewsCount || 1), 0) / 60) || 32}h`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium font-productsans">Average Review Cycle</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">
                      {(() => {
                        const publishedArts = articles.filter(a => a.status === 'Published');
                        if (publishedArts.length === 0) return '2.1 days';
                        const now = Date.now();
                        const totalDays = publishedArts.reduce((acc, a) => acc + (now - (a.createdAt || now)) / (1000 * 3600 * 24), 0);
                        const avg = (totalDays / publishedArts.length).toFixed(1);
                        return `${Math.max(1.1, Number(avg))} days`;
                      })()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium font-productsans">Comments Moderated</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">
                      {articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0) + reportedComments.length}
                    </strong>
                  </div>
                </div>
                <div className="border-t border-stone-200/50 pt-3 text-[10px] text-stone-500 font-medium font-productsans">
                  📈 Weekly discussion volume updated in real-time.
                </div>
              </div>

              {/* Card 2: Top Contributing High Schools */}
              <div className="bg-stone-50/55 border border-stone-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block">
                  Top School Affiliations
                </span>
                <div className="space-y-3">
                  {(() => {
                    const schoolCounts = articles.reduce((acc: { [key: string]: number }, a) => {
                      if (a.authorSchool && a.authorSchool.trim()) {
                        acc[a.authorSchool] = (acc[a.authorSchool] || 0) + 1;
                      }
                      return acc;
                    }, {});
                    const sortedSchools = Object.entries(schoolCounts)
                      .map(([name, count]) => ({ name, count: Number(count) }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 4);
                    
                    if (sortedSchools.length === 0) {
                      return <p className="text-xs text-stone-400">No school affiliations recorded yet.</p>;
                    }

                    return sortedSchools.map((school, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-productsans">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-[#523624]/10 text-[#523624] rounded-full flex items-center justify-center font-bold text-[10px]">
                            {i + 1}
                          </span>
                          <span className="text-stone-700 font-medium truncate max-w-[150px]">{school.name}</span>
                        </div>
                        <strong className="text-stone-950 font-bold">{school.count} {school.count === 1 ? 'article' : 'articles'}</strong>
                      </div>
                    ));
                  })()}
                </div>
                <div className="border-t border-stone-200/50 pt-3 text-[10px] text-stone-500 font-medium flex justify-between items-center font-productsans">
                  <span>Representative count</span>
                  <span className="text-[#523624] font-bold">
                    {new Set(articles.map(a => a.authorSchool).filter(Boolean)).size} schools live
                  </span>
                </div>
              </div>

              {/* Card 3: Distribution by Academic Category */}
              <div className="bg-stone-50/55 border border-stone-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block">
                  Category Distribution
                </span>
                <div className="space-y-3">
                  {(() => {
                    const totalCount = articles.length || 1;
                    const catCounts = articles.reduce((acc: { [key: string]: number }, a) => {
                      const cat = a.category || 'Unassigned';
                      acc[cat] = (acc[cat] || 0) + 1;
                      return acc;
                    }, {});
                    const catColors: { [key: string]: string } = {
                      'Science & Tech': 'bg-[#523624]',
                      'STEM & Applied Science': 'bg-[#523624]',
                      'Opinion & Editorial': 'bg-emerald-700/70',
                      'Poetry & Creative Writing': 'bg-amber-600/70',
                      'Global Issues': 'bg-stone-500/70',
                      'Arts & Culture': 'bg-amber-700/70'
                    };
                    const sortedCats = Object.entries(catCounts)
                      .map(([name, count]) => ({
                        name,
                        pct: Math.round((Number(count) / totalCount) * 100),
                        color: catColors[name] || 'bg-emerald-800/70'
                      }))
                      .sort((a, b) => b.pct - a.pct)
                      .slice(0, 4);

                    return sortedCats.map((cat, i) => (
                      <div key={i} className="space-y-1 font-productsans">
                        <div className="flex justify-between items-center text-[11px] font-medium text-stone-700">
                          <span>{cat.name}</span>
                          <strong className="font-bold text-stone-900">{cat.pct}%</strong>
                        </div>
                        <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="border-t border-stone-200/50 pt-3 text-[10px] text-stone-500 font-medium flex justify-between items-center font-productsans">
                  <span>Predominant theme</span>
                  <span className="text-[#523624] font-bold">
                    {(() => {
                      const catCounts = articles.reduce((acc: { [key: string]: number }, a) => {
                        const cat = a.category || 'Unassigned';
                        acc[cat] = (acc[cat] || 0) + 1;
                        return acc;
                      }, {});
                      const sorted = Object.entries(catCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
                      return sorted[0]?.[0] || 'Science & Tech';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {/* TAB CONTENTS */}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Submissions Queue List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-2 border-r border-stone-100 lg:pr-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 font-display">
              Submissions Queue
            </h3>

            {pendingArticles.length > 0 ? (
              pendingArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => { setSelectedArticle(art); setDecisionNotes(''); }}
                  className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${selectedArticle?.id === art.id ? 'bg-amber-500/5 border-amber-600 shadow-sm' : 'bg-white border-stone-200 hover:bg-stone-50'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                      {art.category}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {art.readingTime} min read
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-stone-900 text-xs line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2.5">
                    <span>By {art.authorName} ({art.authorCountry})</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectApprove(art);
                      }}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[9.5px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                      title="Directly approve and publish this article"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Approve &amp; Publish Directly</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs font-sans">
                📖 No student drafts are currently in the moderation queue!
              </div>
            )}
          </div>

          {/* Action Decision Detail (7 cols) */}
          <div className="lg:col-span-7">
            {selectedArticle ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                
                {/* Header info */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <span className="text-[9px] text-emerald-800 uppercase tracking-widest font-bold">Currently Reviewing</span>
                  <h3 className="font-bold text-stone-900 text-sm mt-1">{selectedArticle.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs text-stone-600 mt-3 border-t border-stone-200/60 pt-3">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Student Author:</span>
                      <strong className="text-stone-800">{selectedArticle.authorName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">School/Institution:</span>
                      <strong className="text-stone-800">{selectedArticle.authorSchool}</strong>
                    </div>
                  </div>
                </div>

                {/* Body Content Preview Box */}
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Paper Preview:</span>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 max-h-[220px] overflow-y-auto text-[11px] font-mono leading-relaxed text-stone-800">
                    {selectedArticle.content}
                  </div>
                </div>

                {/* Moderation Form Controls */}
                <div className="bg-emerald-500/5 border border-emerald-600/20 p-4 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-900 uppercase block font-display">
                    Select Editorial Action
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleReviewDecision('Published')}
                      className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleReviewDecision('Revision Requested')}
                      className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Request Revision</span>
                    </button>

                    <button
                      onClick={() => handleReviewDecision('Rejected')}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>

                  {/* Form feedback context */}
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1 font-sans">
                        Rejection / Revision Category Note (if not approving):
                      </label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded p-1.5 text-xs text-stone-800"
                      >
                        <option value="Low Word Count">Low Word Count / Too Short</option>
                        <option value="Formatting Issues">Formatting / Citation Issues</option>
                        <option value="Inappropriate Content">Inappropriate Themes</option>
                        <option value="Topic Irrelevant">Off-Topic or Incoherent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1 font-sans">
                        Moderator Editorial Guidelines Feedback (sent to student):
                      </label>
                      <textarea
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="Provide peer feedback detailing what needs editing or correcting..."
                        rows={3}
                        className="w-full bg-white border border-stone-200 rounded p-2 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-inner"
                      />
                    </div>
                  </div>

                </div>

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <FileText className="w-8 h-8 text-stone-300 mb-2" />
                <p className="text-stone-500 text-xs">
                  Select any student paper from the queue list on the left to start the human peer review process.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* COMMENTS REPORT TAB */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 font-display">
            Reported Discussion Notes
          </h3>

          {reportedComments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportedComments.map((comment) => (
                <div key={comment.id} className="bg-red-50/50 border border-red-200 rounded-xl p-4 flex flex-col justify-between relative shadow-xs">
                  
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-red-800 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{comment.reportsCount} User Flags / Reports</span>
                    </div>

                    <p className="text-xs font-bold text-stone-800 mb-1">
                      By {comment.authorName} ({comment.authorSchool})
                    </p>
                    
                    <p className="text-stone-700 text-xs italic bg-white p-2 rounded-lg border border-stone-100 shadow-inner my-2 leading-relaxed">
                      "{comment.content}"
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleCommentModeration(comment.id, false)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Clear Flags</span>
                    </button>

                    <button
                      onClick={() => handleCommentModeration(comment.id, true)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-semibold shadow transition-all flex items-center gap-1"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Comment</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-stone-500 text-xs font-sans">
                Discussion boards are fully clean! No comments are currently flagged.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED WORKS MANAGEMENT TAB */}
      {activeTab === 'published' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl">
            <h3 className="font-productsans font-black text-xl text-stone-900 tracking-tight">
              Manage Published Works
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Browse, search, filter, and moderate live publications in the student repository. Deleting an article will permanently remove it and all associated comments.
            </p>
          </div>

          {/* Search and Filters panel */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-stone-100/50 p-4 rounded-xl border border-stone-200">
            {/* Search */}
            <div className="sm:col-span-8 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by title, abstract, or author name..."
                value={adminPublishSearchQuery}
                onChange={(e) => setAdminPublishSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
              />
            </div>

            {/* Type Filter */}
            <div className="sm:col-span-4">
              <select
                value={adminPublishTypeFilter}
                onChange={(e) => setAdminPublishTypeFilter(e.target.value as any)}
                className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-xs text-stone-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Formats</option>
                <option value="article">Articles Only</option>
                <option value="essay">Essays Only</option>
                <option value="blog">Blogs Only</option>
              </select>
            </div>
          </div>

          {/* Grid list of Published articles */}
          {(() => {
            let list = articles.filter(a => a.status === 'Published');
            
            // Apply Type filter
            if (adminPublishTypeFilter !== 'all') {
              list = list.filter(a => (a.type || 'article') === adminPublishTypeFilter);
            }

            // Apply Category filter
            if (adminPublishCategoryFilter !== 'all') {
              list = list.filter(a => a.category === adminPublishCategoryFilter);
            }

            // Apply Search Query
            if (adminPublishSearchQuery.trim()) {
              const query = adminPublishSearchQuery.toLowerCase();
              list = list.filter(a => 
                a.title.toLowerCase().includes(query) ||
                a.summary.toLowerCase().includes(query) ||
                a.authorName.toLowerCase().includes(query) ||
                a.authorSchool.toLowerCase().includes(query)
              );
            }

            if (list.length === 0) {
              return (
                <div className="text-center py-16 bg-white border border-dashed border-stone-200 rounded-xl">
                  <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-sm font-serif italic text-stone-500">No published publications found matching current filters.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map(art => {
                  const isDemo = art.id.startsWith('art-') && parseInt(art.id.replace('art-', '')) <= 5;
                  return (
                    <div 
                      key={art.id} 
                      onClick={() => handleOpenEditModal(art)}
                      className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col justify-between shadow-2xs hover:border-amber-500/60 hover:shadow-md cursor-pointer transition-all group relative"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-sm tracking-wider ${
                            art.type === 'essay' ? 'bg-amber-100 text-amber-800' :
                            art.type === 'blog' ? 'bg-purple-100 text-purple-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {art.type || 'article'}
                          </span>
                          
                          {isDemo ? (
                            <span className="text-[8px] bg-stone-100 text-stone-500 font-mono font-bold px-1.5 py-0.5 rounded">
                              DEMO TEMPLATE
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-1">
                              <Edit3 className="w-3 h-3" /> Click to Edit
                            </span>
                          )}
                        </div>

                        <h5 className="font-productsans font-bold text-xs text-stone-900 truncate group-hover:text-amber-900 transition-colors">
                          {art.title}
                        </h5>
                        <p className="text-[11px] text-stone-500 font-serif italic line-clamp-1 mt-0.5">
                          "{art.summary}"
                        </p>

                        <div className="flex flex-wrap gap-x-2 text-[9.5px] text-stone-400 mt-2">
                          <span>By <strong className="text-stone-600">{art.authorName}</strong></span>
                          <span>•</span>
                          <span>{art.authorSchool}</span>
                          <span>•</span>
                          <span className="font-semibold text-stone-500">{art.authorCountry}</span>
                        </div>

                        <div className="mt-2.5">
                          <span className="text-[9px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded border border-stone-100">
                            {art.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-3">
                        <span className="text-[9px] text-stone-400 font-mono">
                          {art.wordCount || 0} words • {art.readingTime || 1} min
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(art);
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md transition-all flex items-center gap-1 text-[10px] font-semibold border border-amber-200/60"
                            title="Edit publication"
                          >
                            <Edit3 className="w-3 h-3 text-amber-700" />
                            <span>Edit Manuscript</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteArticle(art.id);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition-all"
                            title="Delete publication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* DIRECT SUBMISSION TAB */}
      {activeTab === 'direct-submit' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 font-productsans"
        >
          {/* Top Header Section matching the student publication page */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-1 mb-6 pb-3 border-b border-gray-100">
            <div className="pl-1">
              <h1 className="font-productsans flex flex-wrap items-baseline gap-x-1.5 text-[17px]">
                <span className="font-bold text-gray-900">Direct Publication & Intake</span>
                <span className="text-gray-500 font-normal pl-0 mt-1">
                  manually publish offline student manuscripts or submitted research papers
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetDsForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-200/70 transition-colors shadow-2xs font-productsans cursor-pointer"
              >
                <span>Reset Fields</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleDirectSubmit}>
            {/* Main 2-Column Grid matching ArticleEditor layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ================= LEFT COLUMN (Col Span 7) ================= */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* CARD 1: Name & Description */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-5">
                  <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                    Name & Description
                  </h2>

                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                      Publication Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={dsTitle}
                      onChange={(e) => setDsTitle(e.target.value)}
                      placeholder="e.g. The Quantum Computing Divide in Modern Education"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-productsans font-medium"
                    />
                  </div>

                  {/* Abstract / Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider font-productsans">
                        Abstract / Summary <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400 font-productsans">
                        {dsSummary.length}/250 characters
                      </span>
                    </div>
                    <textarea
                      required
                      value={dsSummary}
                      onChange={(e) => setDsSummary(e.target.value)}
                      placeholder="Write a brief 1-2 sentence overview/abstract of the paper..."
                      rows={2}
                      maxLength={250}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-productsans leading-relaxed resize-y"
                    />
                  </div>

                  {/* Manuscript Body Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider font-productsans">
                        Full Manuscript Content <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-productsans">
                        <span>Words: <strong className="text-gray-800">{getDsWordCount()}</strong></span>
                        <span>•</span>
                        <span>Est: <strong className="text-gray-800">{getDsReadingTime()} min read</strong></span>
                      </div>
                    </div>
                    <textarea
                      required
                      value={dsContent}
                      onChange={(e) => setDsContent(e.target.value)}
                      placeholder={`# Introduction\nPresent the main scholarly question or hypothesis...\n\n## Research & Evidence\nDetail the student's key arguments, historical evidence, or experimentation...\n\n## Conclusion & References\nSummarize findings and attribute sources.`}
                      rows={13}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-productsans leading-relaxed resize-y min-h-[260px]"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 font-productsans">
                      Markdown supported: Use # for main headers, ## for subheadings, **bold**, and *lists.
                    </p>
                  </div>

                </div>

                {/* CARD 2: Publication Image (matching the student publication page design) */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                      Publication Image
                    </h2>
                    <span className="text-xs text-gray-400 font-productsans">Scholastic Cover Banner</span>
                  </div>

                  {/* Side by side upload & preview matching the screenshot layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                    
                    {/* Left: Dashed Upload Box with Mint Accent */}
                    <div
                      onDragOver={handleDsDragOver}
                      onDragLeave={handleDsDragLeave}
                      onDrop={handleDsDrop}
                      onClick={() => document.getElementById('ds-cover-file-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px] ${
                        dsIsDragging
                          ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                          : 'border-emerald-400/80 bg-emerald-50/30 hover:bg-emerald-50/60 hover:border-emerald-500'
                      }`}
                    >
                      <input
                        id="ds-cover-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleDsFileInputChange}
                        className="hidden"
                      />
                      
                      {dsIsUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium text-gray-600 font-productsans">Optimizing image...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2.5">
                          <div className="w-11 h-11 rounded-xl bg-white border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-2xs">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-emerald-700 font-productsans block">
                              Upload Image
                            </span>
                            <span className="text-[11px] text-gray-400 font-productsans block mt-0.5">
                              Drag & drop or browse (PNG, JPG)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Clean Image Preview Container */}
                    <div className="w-full h-full min-h-[160px] rounded-2xl border border-gray-200/90 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                      {dsCover ? (
                        <img 
                          src={dsCover} 
                          alt="Publication Cover Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center p-4 text-gray-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span className="text-xs font-productsans">No cover image selected</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 flex items-center justify-between text-white text-xs">
                        <span className="truncate text-[11px] font-medium font-productsans">Active Cover</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDsShowUrlInput(!dsShowUrlInput);
                          }}
                          className="text-[10px] bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2 py-0.5 rounded font-productsans transition-colors cursor-pointer"
                        >
                          {dsShowUrlInput ? 'Hide URL' : 'Custom URL'}
                        </button>
                      </div>
                    </div>

                  </div>

                  {dsUploadError && (
                    <p className="text-xs text-rose-600 font-medium font-productsans flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{dsUploadError}</span>
                    </p>
                  )}

                  {/* Optional direct URL input */}
                  {dsShowUrlInput && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-medium text-gray-500 font-productsans mb-1">
                        Image Source URL
                      </label>
                      <input
                        type="url"
                        value={dsCover}
                        onChange={(e) => setDsCover(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-productsans"
                      />
                    </div>
                  )}

                  {/* Quick Preset Covers selection chips */}
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-medium text-gray-500 font-productsans block mb-2">
                      Or choose a scholarly preset theme:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_COVERS.map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setDsCover(preset.url);
                            setDsUploadError(null);
                          }}
                          className={`relative aspect-[16/10] rounded-xl overflow-hidden border transition-all text-left group cursor-pointer ${
                            dsCover === preset.url 
                              ? 'ring-2 ring-emerald-600 border-emerald-600 shadow-2xs' 
                              : 'border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors" />
                          <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-semibold text-white truncate font-productsans drop-shadow-xs">
                            {preset.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* ================= RIGHT COLUMN (Col Span 5) ================= */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* CARD 1: Category & Format */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                  <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                    Category & Format
                  </h2>

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                      Academic Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={dsCategory}
                        onChange={(e) => setDsCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none font-productsans font-medium cursor-pointer pr-10"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Publication Format Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                      Publication Format
                    </label>
                    <div className="relative">
                      <select
                        value={dsType}
                        onChange={(e) => setDsType(e.target.value as 'blog' | 'essay' | 'article')}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none font-productsans font-medium cursor-pointer pr-10"
                      >
                        <option value="blog">Student Blog & Reflection</option>
                        <option value="essay">Academic Research Essay</option>
                        <option value="article">Scholastic Review Article</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {/* CARD 2: Manage Archival Details */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                  <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                    Manage Archival Details
                  </h2>

                  {/* Manuscript Reference DOI */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                      Archival Intake Identifier (DOI)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="IMP-DIRECT-INTAKE"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-mono focus:outline-none cursor-default font-semibold"
                    />
                  </div>

                  {/* Grid: Reading Time & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                        Reading Time
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${getDsReadingTime()} Mins`}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-productsans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                        Intake Status
                      </label>
                      <div className="relative">
                        <select
                          value={dsStatus}
                          onChange={(e) => setDsStatus(e.target.value as 'Published' | 'Submitted')}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none font-productsans font-medium cursor-pointer pr-7 truncate"
                        >
                          <option value="Published">Publish Directly</option>
                          <option value="Submitted">Queue for Review</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* CARD 3: Attribution & Indexing (Student Author Details) */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                  <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                    Attribution & Indexing
                  </h2>

                  {/* 2x2 Field Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                        Student Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={dsAuthorName}
                        onChange={(e) => setDsAuthorName(e.target.value)}
                        placeholder="e.g. Julianne Chen"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-productsans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                        Institution <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={dsAuthorSchool}
                        onChange={(e) => setDsAuthorSchool(e.target.value)}
                        placeholder="e.g. Raffles Institution"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-productsans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                        Student Country <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={dsAuthorCountry}
                          onChange={(e) => setDsAuthorCountry(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none font-productsans font-medium cursor-pointer pr-7 truncate"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                        Keywords / Tags
                      </label>
                      <input
                        type="text"
                        value={dsTags}
                        onChange={(e) => setDsTags(e.target.value)}
                        placeholder="Agriculture, STEM"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-productsans font-medium"
                      />
                    </div>
                  </div>

                </div>

                {/* CARD 4: Editorial Verification & Honor Check */}
                <div className="bg-white rounded-2xl border border-emerald-500/20 shadow-2xs p-5 space-y-3 bg-gradient-to-b from-emerald-50/20 to-transparent">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-productsans">
                      Editorial Verification & Intake Check
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 font-productsans leading-relaxed">
                      <input
                        type="checkbox"
                        checked={dsPledgeOriginal}
                        onChange={(e) => setDsPledgeOriginal(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Original student manuscript received via offline intake / company mail.</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 font-productsans leading-relaxed">
                      <input
                        type="checkbox"
                        checked={dsPledgeCite}
                        onChange={(e) => setDsPledgeCite(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Attributed statistics, quotations, and academic citations confirmed.</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 font-productsans leading-relaxed">
                      <input
                        type="checkbox"
                        checked={dsPledgeGuidelines}
                        onChange={(e) => setDsPledgeGuidelines(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Complies with youth safety, scholastic decency, and editorial guidelines.</span>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            {/* BOTTOM ACTION BAR matching the student publication page buttons layout */}
            <div className="mt-8 pt-6 border-t border-gray-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-productsans">
              
              {/* Left: Reset / Clear Form */}
              <div>
                <button
                  type="button"
                  onClick={handleResetDsForm}
                  disabled={dsSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-productsans"
                >
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                  <span>Clear Form</span>
                </button>
              </div>

              {/* Right: Submit Button */}
              <div className="flex items-center gap-3 font-productsans">
                <button
                  type="submit"
                  disabled={dsSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50 font-productsans"
                >
                  <span>
                    {dsSaving 
                      ? 'Uploading Intake...' 
                      : dsStatus === 'Published' 
                        ? 'Directly Publish Publication' 
                        : 'Queue for Review'}
                  </span>
                  <Plus className="w-4 h-4" />
                </button>
              </div>

            </div>

          </form>
        </motion.div>
      )}

      {/* SYSTEM AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-left">
                <h3 className="font-productsans font-black text-2xl text-stone-900 tracking-tight flex items-center gap-2">
                  <History className="w-6 h-6 text-emerald-800" />
                  Administrative Audit Logs
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 font-productsans">
                  A high-fidelity ledger recording actions taken on student submissions, comments, and database states.
                </p>
              </div>
              <button
                onClick={loadAdminData}
                className="text-xs font-semibold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors border border-stone-200 cursor-pointer"
              >
                Refresh Logs
              </button>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
            <div className="sm:col-span-2 relative text-left">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Admin, Student, Action, or Title..."
                value={searchLogQuery}
                onChange={(e) => setSearchLogQuery(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <div className="text-left">
              <select
                value={actionLogFilter}
                onChange={(e) => setActionLogFilter(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs text-stone-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Action Types</option>
                <option value="approve">Approvals</option>
                <option value="reject">Rejections</option>
                <option value="revision_request">Revision Requests</option>
                <option value="delete">Deletions</option>
                <option value="restore">Restorations</option>
                <option value="hide_comment">Comment Hiding</option>
                <option value="approve_comment">Comment Approvals</option>
                <option value="direct_publish">Direct Publications</option>
                <option value="direct_submit">Direct Submissions</option>
              </select>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            {(() => {
              const filteredLogs = auditLogs.filter(log => {
                const matchSearch = 
                  (log.adminName || '').toLowerCase().includes(searchLogQuery.toLowerCase()) ||
                  (log.adminEmail || '').toLowerCase().includes(searchLogQuery.toLowerCase()) ||
                  (log.targetTitle || '').toLowerCase().includes(searchLogQuery.toLowerCase()) ||
                  (log.targetAuthorName || '').toLowerCase().includes(searchLogQuery.toLowerCase()) ||
                  (log.details || '').toLowerCase().includes(searchLogQuery.toLowerCase()) ||
                  (log.action || '').toLowerCase().includes(searchLogQuery.toLowerCase());
                
                if (actionLogFilter === 'all') return matchSearch;
                return log.action === actionLogFilter && matchSearch;
              });

              if (filteredLogs.length === 0) {
                return (
                  <div className="p-12 text-center text-stone-400 space-y-2">
                    <History className="w-8 h-8 mx-auto text-stone-300 stroke-1" />
                    <p className="text-xs font-semibold">No matching administrative logs found.</p>
                    <p className="text-[10px] text-stone-400">Perform changes on submissions or comments to seed audit records.</p>
                  </div>
                );
              }

              return (
                <div className="divide-y divide-stone-100">
                  {filteredLogs.map((log) => {
                    let actionBadgeColor = 'bg-stone-50 text-stone-700 border-stone-200';
                    let actionLabel = log.action;

                    switch (log.action) {
                      case 'approve':
                        actionBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        actionLabel = 'Approve Publication';
                        break;
                      case 'reject':
                        actionBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                        actionLabel = 'Reject Publication';
                        break;
                      case 'revision_request':
                        actionBadgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
                        actionLabel = 'Request Revision';
                        break;
                      case 'delete':
                        actionBadgeColor = 'bg-red-50 text-red-700 border-red-200/60';
                        actionLabel = 'Permanent Delete';
                        break;
                      case 'restore':
                        actionBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                        actionLabel = 'Restore Publication';
                        break;
                      case 'hide_comment':
                        actionBadgeColor = 'bg-stone-100 text-stone-700 border-stone-300';
                        actionLabel = 'Hide Comment';
                        break;
                      case 'approve_comment':
                        actionBadgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
                        actionLabel = 'Approve Comment';
                        break;
                      case 'direct_publish':
                        actionBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                        actionLabel = 'Directly Publish';
                        break;
                      case 'direct_submit':
                        actionBadgeColor = 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
                        actionLabel = 'Directly Submit';
                        break;
                    }

                    return (
                      <div key={log.id} className="p-4 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${actionBadgeColor}`}>
                              {actionLabel}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              ID: {log.id}
                            </span>
                          </div>

                          <div className="text-xs text-stone-800 font-semibold flex items-center flex-wrap gap-1">
                            <span className="text-stone-900 font-bold">{log.adminName}</span>
                            <span className="text-stone-400 font-normal">({log.adminEmail})</span>
                            <span className="text-stone-400 font-normal">acted on</span>
                            <span className="text-emerald-950 font-bold italic truncate max-w-xs">"{log.targetTitle}"</span>
                            {log.targetAuthorName && (
                              <>
                                <span className="text-stone-400 font-normal">by</span>
                                <span className="text-stone-700 font-bold">{log.targetAuthorName}</span>
                              </>
                            )}
                          </div>

                          {log.details && (
                            <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-mono break-all whitespace-pre-wrap">
                              {log.details}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex md:flex-col items-end justify-between md:justify-start gap-1 text-[10px] text-stone-400 font-mono">
                          <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Undo Delete Toast Popup */}
      <AnimatePresence>
        {recentlyDeleted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[200] bg-stone-900 border border-stone-800 text-stone-100 px-5 py-4 shadow-2xl flex items-center gap-4 rounded-xl max-w-sm"
          >
            <div className="flex-1 text-left">
              <p className="text-xs font-mono uppercase font-bold tracking-wider text-emerald-500">Published Work Deleted</p>
              <p className="text-xs font-semibold truncate mt-1 text-stone-300">"{recentlyDeleted.title}"</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleUndoDelete}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold uppercase rounded-md shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>Undo</span>
              </button>
              <button
                onClick={() => setRecentlyDeleted(null)}
                className="text-stone-500 hover:text-stone-300 p-1 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Published Manuscript Modal */}
      <AnimatePresence>
        {editingPublishedArticle && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPublishedArticle(null)}
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-[#d1cfc0] rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col my-auto text-left z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100/70 rounded-xl text-amber-800">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-productsans font-bold text-base text-stone-900">
                      Edit Live Publication
                    </h3>
                    <p className="text-[11px] text-stone-500 font-sans">
                      ID: {editingPublishedArticle.id} • Update manuscript details, metadata, and cover image.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPublishedArticle(null)}
                  className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveEditedArticle} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                    Manuscript Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2.5 text-xs text-stone-900 font-semibold transition-all outline-none"
                    placeholder="Enter article title..."
                  />
                </div>

                {/* Abstract / Summary */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                    Abstract / Summary *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2.5 text-xs text-stone-900 transition-all outline-none"
                    placeholder="Brief summary..."
                  />
                </div>

                {/* Main Content */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                    Full Content (Markdown supported) *
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2.5 text-xs text-stone-900 transition-all outline-none font-mono"
                    placeholder="Write or edit content..."
                  />
                </div>

                {/* Grid for Category, Format Type, Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2 text-xs text-stone-800 font-semibold transition-all outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                      Format Type
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2 text-xs text-stone-800 font-semibold transition-all outline-none"
                    >
                      <option value="article">Academic Article</option>
                      <option value="essay">Student Essay</option>
                      <option value="blog">Creative Blog</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                      Tags (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="e.g. Physics, Ethics"
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2 text-xs text-stone-900 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Author Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={editAuthorName}
                      onChange={(e) => setEditAuthorName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2 text-xs text-stone-900 transition-all outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                      School / Academy
                    </label>
                    <input
                      type="text"
                      value={editAuthorSchool}
                      onChange={(e) => setEditAuthorSchool(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2 text-xs text-stone-900 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-display">
                      Author Country
                    </label>
                    <select
                      value={editAuthorCountry}
                      onChange={(e) => setEditAuthorCountry(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2 text-xs text-stone-800 transition-all outline-none font-semibold"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cover Image Selection & Drag Drop Upload */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider font-display">
                    Cover Image
                  </label>
                  
                  {/* Preset Covers Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COVERS.map(cover => (
                      <button
                        key={cover.url}
                        type="button"
                        onClick={() => setEditCoverImage(cover.url)}
                        className={`relative rounded-lg overflow-hidden border-2 h-12 transition-all ${
                          editCoverImage === cover.url ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Drag & Drop Upload */}
                  <div
                    onDragOver={handleEditDragOver}
                    onDragLeave={handleEditDragLeave}
                    onDrop={handleEditDrop}
                    className={`border-2 border-dashed rounded-lg p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[80px] ${
                      editIsDragging
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-stone-200 bg-white hover:border-amber-400 hover:bg-stone-50/50'
                    }`}
                    onClick={() => document.getElementById('edit-cover-file-input')?.click()}
                  >
                    <input
                      id="edit-cover-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileInputChange}
                      className="hidden"
                    />
                    
                    {editIsUploading ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-stone-500">Processing image...</span>
                      </div>
                    ) : editCoverImage.startsWith('data:image/') ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative w-12 h-9 rounded overflow-hidden border border-stone-200">
                          <img src={editCoverImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] text-amber-700 font-bold flex items-center gap-1">
                          ✓ Custom Uploaded Cover Image Active
                        </span>
                        <span className="text-[8px] text-stone-400">Click or drag new to replace</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="w-4 h-4 text-stone-400" />
                        <span className="text-[10px] text-stone-600 font-medium">Upload custom cover image (PNG, JPG)</span>
                      </div>
                    )}
                  </div>

                  {editUploadError && (
                    <p className="text-[9px] text-red-600 font-medium">⚠️ {editUploadError}</p>
                  )}

                  {/* Custom URL */}
                  <input
                    type="text"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-lg p-2 text-xs text-stone-800 transition-all outline-none"
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingPublishedArticle(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white border border-[#d1cfc0] rounded-2xl shadow-2xl p-6 max-w-md w-full text-left"
            >
              <h3 className="font-sans font-bold text-base text-stone-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span>Confirm Permanent Deletion</span>
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Are you sure you want to permanently delete this publication? This action cannot be undone and will completely remove the manuscript from all databases.
              </p>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmId) {
                      executeDeleteArticle(deleteConfirmId);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Panel Notification Toast */}
      <AnimatePresence>
        {adminNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-6 z-[200] border p-4 shadow-2xl flex items-center gap-3 rounded-xl max-w-sm ${
              adminNotification.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-900' 
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            <div className="flex-1 text-left">
              <p className="text-[11px] font-semibold leading-relaxed">{adminNotification.message}</p>
            </div>
            <button
              onClick={() => setAdminNotification(null)}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold font-sans px-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
