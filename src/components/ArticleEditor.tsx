import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, CATEGORIES, UserProfile } from '../types';
import { firebaseService } from '../firebaseService';
import { calculateReadingTime, DEFAULT_WORDS_PER_MINUTE } from '../utils/readingTime';
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Plus, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Tag, 
  Undo2, 
  Sparkles, 
  FileText, 
  ChevronDown, 
  Layers, 
  School, 
  Globe,
  RotateCcw,
  Check
} from 'lucide-react';

interface ArticleEditorProps {
  currentUser: UserProfile;
  editingArticle: Article | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const PRESET_COVERS = [
  { name: 'Abstract Fractal (Science)', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
  { name: 'Warm Library (Lit)', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Emerald Forest (Nature)', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Historic Atlas (Global)', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80' },
];

export default function ArticleEditor({ 
  currentUser, 
  editingArticle, 
  onClose, 
  onSubmitSuccess
}: ArticleEditorProps) {
  const [draftIdState, setDraftIdState] = useState<string>(
    editingArticle?.id || 'draft-' + Date.now()
  );

  const [title, setTitle] = useState(editingArticle?.title || '');
  const [summary, setSummary] = useState(editingArticle?.summary || '');
  const [content, setContent] = useState(editingArticle?.content || '');
  const [category, setCategory] = useState(
    editingArticle?.category || CATEGORIES[0]
  );
  const [type, setType] = useState<'blog' | 'essay' | 'article'>(
    editingArticle?.type || 'blog'
  );
  const [tagInput, setTagInput] = useState(
    editingArticle?.tags ? editingArticle.tags.join(', ') : ''
  );
  const [coverImage, setCoverImage] = useState(editingArticle?.coverImage || PRESET_COVERS[0].url);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Archival and attribution fields
  const [manuscriptId] = useState<string>(
    editingArticle?.id ? `IMP-${editingArticle.id.slice(-6).toUpperCase()}` : `IMP-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [targetLevel, setTargetLevel] = useState('High School (Grades 9-12)');
  const [schoolAffiliation, setSchoolAffiliation] = useState(currentUser.school || '');
  const [authorCountry, setAuthorCountry] = useState(currentUser.country || '');
  const [reviewTrack, setReviewTrack] = useState('Standard Academic Peer Review');

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Honor Checklist
  const [pledgeOriginal, setPledgeOriginal] = useState(false);
  const [pledgeGuidelines, setPledgeGuidelines] = useState(false);
  const [pledgeCite, setPledgeCite] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');

  // Notifications
  const [editorNotification, setEditorNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showEditorNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setEditorNotification({ message, type });
    setTimeout(() => {
      setEditorNotification(prev => prev?.message === message ? null : prev);
    }, 6000);
  };

  // Real-time Reading Time & Word Count Utility calculation as student writes
  const readingStats = useMemo(() => {
    return calculateReadingTime(content, DEFAULT_WORDS_PER_MINUTE);
  }, [content]);

  const getWordCount = () => readingStats.wordCount;
  const getReadingTime = () => readingStats.minutes;

  const compressAndSetImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    
    setUploadError(null);
    setIsUploading(true);

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
            setCoverImage(dataUrl);
          } catch (err) {
            console.error("Canvas toDataURL failed, using original size", err);
            setCoverImage(e.target?.result as string);
          }
        } else {
          setCoverImage(e.target?.result as string);
        }
        setIsUploading(false);
      };
      img.onerror = () => {
        setUploadError('Failed to load image file. It might be corrupted.');
        setIsUploading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      compressAndSetImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      compressAndSetImage(e.target.files[0]);
    }
  };

  // Autosave setup
  useEffect(() => {
    const interval = setInterval(() => {
      handleAutosave();
    }, 20000);
    return () => clearInterval(interval);
  }, [title, summary, content, category, tagInput, coverImage, draftIdState, type]);

  const handleAutosave = async () => {
    try {
      if (!title.trim() && !content.trim()) return;
      setSaveStatus('saving');
      
      const actualDraftId = editingArticle?.id || draftIdState;
      const draftData: Article = {
        id: actualDraftId,
        title: title || 'Untitled Draft',
        summary: summary || 'No summary yet.',
        content: content || '',
        category,
        tags: parseTags(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
        authorSchool: schoolAffiliation || currentUser.school || '',
        authorCountry: authorCountry || currentUser.country || '',
        status: 'Draft',
        type,
        coverImage,
        reactions: editingArticle?.reactions || { great: 0, like: 0, heart: 0, wow: 0 },
        createdAt: editingArticle?.createdAt || Date.now(),
        readingTime: getReadingTime(),
        wordCount: getWordCount(),
        commentsCount: editingArticle?.commentsCount || 0
      };

      try {
        localStorage.setItem(`impactED_draft_${currentUser.uid}`, JSON.stringify(draftData));
      } catch (lsErr) {
        console.warn("localStorage is blocked or unavailable:", lsErr);
      }
      
      setTimeout(() => {
        setSaveStatus('saved');
      }, 1000);
    } catch (err) {
      console.error("Autosave failed:", err);
    }
  };

  const loadSavedDraft = () => {
    try {
      const saved = localStorage.getItem(`impactED_draft_${currentUser.uid}`);
      if (saved) {
        const draft = JSON.parse(saved) as Article;
        setTitle(draft.title || '');
        setSummary(draft.summary || '');
        setContent(draft.content || '');
        setCategory(draft.category || CATEGORIES[0]);
        setType(draft.type || 'blog');
        setTagInput(draft.tags ? draft.tags.join(', ') : '');
        setCoverImage(draft.coverImage || PRESET_COVERS[0].url);
        if (draft.id) setDraftIdState(draft.id);
        if (draft.authorSchool) setSchoolAffiliation(draft.authorSchool);
        if (draft.authorCountry) setAuthorCountry(draft.authorCountry);
        showEditorNotification("Your autosaved draft has been successfully restored!", "success");
      } else {
        showEditorNotification("No draft was found in local storage.", "info");
      }
    } catch (e) {
      console.warn("Failed to load saved draft:", e);
      showEditorNotification("Local storage is blocked or unavailable in this browser environment.", "error");
    }
  };

  const parseTags = (): string[] => {
    return (tagInput || '')
      .split(',')
      .map(t => t.trim().replace('#', ''))
      .filter(t => t.length > 0)
      .slice(0, 4);
  };

  const handleManualSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      showEditorNotification("Please enter a Title or Content before saving your draft.", "error");
      return;
    }

    setSaving(true);
    setSaveStatus('saving');

    const actualDraftId = editingArticle?.id || draftIdState;
    const draftData: Article = {
      id: actualDraftId,
      title: title.trim() || 'Untitled Draft',
      summary: summary.trim() || 'No summary yet.',
      content: content.trim() || '',
      category,
      tags: parseTags(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorSchool: schoolAffiliation || currentUser.school || '',
      authorCountry: authorCountry || currentUser.country || '',
      status: 'Draft',
      type,
      coverImage,
      reactions: editingArticle?.reactions || { great: 0, like: 0, heart: 0, wow: 0 },
      createdAt: editingArticle?.createdAt || Date.now(),
      readingTime: getReadingTime(),
      wordCount: getWordCount(),
      commentsCount: editingArticle?.commentsCount || 0
    };

    try {
      try {
        localStorage.setItem(`impactED_draft_${currentUser.uid}`, JSON.stringify(draftData));
      } catch (lsErr) {
        console.warn("localStorage is blocked or unavailable:", lsErr);
      }

      await firebaseService.saveArticle(draftData);
      setSaveStatus('saved');
      showEditorNotification(`Your draft "${draftData.title}" has been saved to your portfolio.`, "success");
      onSubmitSuccess();
    } catch (err) {
      console.error("Failed to save draft to database:", err);
      showEditorNotification("Failed to save draft to database. Please check your connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showEditorNotification("Please complete the Title and Content fields before submitting.", "error");
      return;
    }

    if (!pledgeOriginal || !pledgeGuidelines || !pledgeCite) {
      showEditorNotification("Please confirm all Honor Pledge checkboxes before submitting.", "error");
      return;
    }

    setSaving(true);

    const articleId = editingArticle?.id || draftIdState;
    // Derive summary from content if not explicitly set
    const fallbackSummary = content.replace(/^[#*`>\s-]+/gm, '').trim().slice(0, 220);
    const finalArticle: Article = {
      id: articleId,
      title: title.trim(),
      summary: summary.trim() || fallbackSummary || 'Scholastic research manuscript.',
      content: content.trim(),
      category,
      tags: parseTags(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorSchool: schoolAffiliation || currentUser.school || '',
      authorCountry: authorCountry || currentUser.country || '',
      status: 'Submitted',
      type,
      coverImage,
      reactions: editingArticle?.reactions || { great: 0, like: 0, heart: 0, wow: 0 },
      createdAt: editingArticle?.createdAt || Date.now(),
      readingTime: getReadingTime(),
      wordCount: getWordCount(),
      commentsCount: editingArticle?.commentsCount || 0
    };

    try {
      await firebaseService.saveArticle(finalArticle);
      try {
        localStorage.removeItem(`impactED_draft_${currentUser.uid}`);
      } catch (lsErr) {
        // ignore
      }
      showEditorNotification("Your manuscript has been submitted for peer review and editorial moderation.", "success");
      onSubmitSuccess();
    } catch (err) {
      console.error(err);
      showEditorNotification("Failed to submit manuscript. Please verify your connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto font-productsans">
      
      {/* Top Header Section matching the image header layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-2.5 mb-6 pb-2">
        <div className="pl-6">
          <h1 className="font-productsans flex flex-wrap items-baseline gap-x-1.5 text-[17px]">
            <span className="font-bold text-gray-900">
              {editingArticle ? 'Revise a' : 'Draft a'}
            </span>
            <span className="text-gray-500 font-normal pl-0 mt-3">
              {editingArticle
                ? 'manuscript details and submit for re-evaluation'
                : 'new manuscript and academic research for student peer review'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-200/70 transition-colors shadow-2xs font-productsans cursor-pointer"
          >
            <span>Back to Library</span>
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Notification Banner */}
      <AnimatePresence>
        {editorNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 border rounded-2xl flex items-center justify-between gap-3 text-sm font-productsans mb-6 shadow-2xs ${
              editorNotification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : editorNotification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {editorNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : editorNotification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-gray-600 shrink-0" />
              )}
              <span>{editorNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setEditorNotification(null)}
              className="text-gray-400 hover:text-gray-600 font-medium px-1 text-sm cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handlePublishSubmit}>
        
        {/* Main 2-Column Grid matching the screenshot */}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Quantum Computing Divide in Modern Education"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-productsans font-medium"
                />
              </div>

              {/* Manuscript Body Content */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider font-productsans">
                    Full Manuscript Content <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2.5 text-xs font-productsans">
                    {/* Live Reading Time Utility Pill */}
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-medium text-xs shadow-2xs transition-all"
                      title={`Estimated based on ${readingStats.wordCount} words at ~${DEFAULT_WORDS_PER_MINUTE} words/min`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{readingStats.displayString}</span>
                      <span className="text-emerald-300">•</span>
                      <span className="font-semibold text-emerald-900">{readingStats.wordCount.toLocaleString()} {readingStats.wordCount === 1 ? 'word' : 'words'}</span>
                    </div>

                    {saveStatus === 'saved' && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                        <Check className="w-3 h-3" /> Autosaved
                      </span>
                    )}
                    {saveStatus === 'saving' && (
                      <span className="text-gray-400 text-xs">Saving...</span>
                    )}
                  </div>
                </div>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`# Introduction\nPresent your main scholarly question...\n\n## Research & Analysis\nDetail your key arguments, historical evidence, or scientific experimentation...\n\n## Conclusion & References\nSummarize findings and attribute sources.`}
                  rows={13}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-productsans leading-relaxed resize-y min-h-[260px]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 mt-2 font-productsans">
                  <span>Markdown supported: Use # for headers, ## for subheadings, **bold**, and *lists.</span>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-100">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{readingStats.readCategory}</span>
                    </span>
                    <span>•</span>
                    <span>Est: <strong className="text-gray-700 font-semibold">{readingStats.minutes} {readingStats.minutes === 1 ? 'min' : 'mins'} ({readingStats.seconds}s total)</strong></span>
                  </div>
                </div>
              </div>

            </div>

            {/* CARD 2: Publication Image (matching Menu Image in screenshot) */}
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
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('publication-file-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px] ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                      : 'border-emerald-400/80 bg-emerald-50/30 hover:bg-emerald-50/60 hover:border-emerald-500'
                  }`}
                >
                  <input
                    id="publication-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {isUploading ? (
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

                {/* Right: Clean Image Preview Container matching the coffee cup in screenshot */}
                <div className="w-full h-full min-h-[160px] rounded-2xl border border-gray-200/90 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
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
                        setShowUrlInput(!showUrlInput);
                      }}
                      className="text-[10px] bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2 py-0.5 rounded font-productsans transition-colors cursor-pointer"
                    >
                      {showUrlInput ? 'Hide URL' : 'Custom URL'}
                    </button>
                  </div>
                </div>

              </div>

              {uploadError && (
                <p className="text-xs text-rose-600 font-medium font-productsans flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{uploadError}</span>
                </p>
              )}

              {/* Optional direct URL input */}
              {showUrlInput && (
                <div className="pt-2">
                  <label className="block text-[11px] font-medium text-gray-500 font-productsans mb-1">
                    Image Source URL
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
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
                        setCoverImage(preset.url);
                        setUploadError(null);
                      }}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden border transition-all text-left group cursor-pointer ${
                        coverImage === preset.url 
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
            
            {/* CARD 1: Category (matching Category in screenshot) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                Category
              </h2>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                  Academic Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none font-productsans font-medium cursor-pointer pr-10"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Sub-Category / Format Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                  Publication Format
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'blog' | 'essay' | 'article')}
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

            {/* CARD 2: Manage Archival Details (matching Manage Stock in screenshot) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                Manage Archival Details
              </h2>

              {/* Stock Keeping Item / Manuscript Reference ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                  Archival Manuscript Reference (DOI)
                </label>
                <input
                  type="text"
                  readOnly
                  value={manuscriptId}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-mono focus:outline-none cursor-default font-semibold"
                />
              </div>

              {/* Grid with 2 inputs: Reading Time & Target Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider font-productsans">
                      Reading Time
                    </label>
                    <span className="text-[10px] text-emerald-700 font-medium font-productsans">
                      {readingStats.wordCount} words
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={readingStats.wordCount > 0 ? `${readingStats.minutes} ${readingStats.minutes === 1 ? 'Min' : 'Mins'} (~${readingStats.seconds}s)` : '0 Mins'}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-productsans font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                    Target Level
                  </label>
                  <div className="relative">
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none font-productsans font-medium cursor-pointer pr-8 truncate"
                    >
                      <option value="High School (Grades 9-12)">High School (9-12)</option>
                      <option value="Middle School (Grades 6-8)">Middle School (6-8)</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="General Academic">General Academic</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>

            {/* CARD 3: Attribution & Indexing (matching Menu Pricing in screenshot) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 font-productsans tracking-tight">
                Attribution & Indexing
              </h2>

              {/* 2x2 Field Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                    Keywords / Tags
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="AI, Ethics, Science"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-productsans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                    School Affiliation
                  </label>
                  <input
                    type="text"
                    value={schoolAffiliation}
                    onChange={(e) => setSchoolAffiliation(e.target.value)}
                    placeholder="e.g. Stanford / Boston Latin"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-productsans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                    Author Region
                  </label>
                  <input
                    type="text"
                    value={authorCountry}
                    onChange={(e) => setAuthorCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-productsans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 font-productsans">
                    Review Priority
                  </label>
                  <div className="relative">
                    <select
                      value={reviewTrack}
                      onChange={(e) => setReviewTrack(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 appearance-none font-productsans font-medium cursor-pointer pr-7 truncate"
                    >
                      <option value="Standard Academic Peer Review">Standard Track</option>
                      <option value="Honors Showcase Priority">Honors Showcase</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>

            {/* CARD 4: Honor Code & Academic Integrity */}
            <div className="bg-white rounded-2xl border border-emerald-500/20 shadow-2xs p-5 space-y-3 bg-gradient-to-b from-emerald-50/20 to-transparent">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-productsans">
                  Academic Honor Pledge
                </h3>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 font-productsans leading-relaxed">
                  <input
                    type="checkbox"
                    checked={pledgeOriginal}
                    onChange={(e) => setPledgeOriginal(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Original research & authentic student scholarship.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 font-productsans leading-relaxed">
                  <input
                    type="checkbox"
                    checked={pledgeCite}
                    onChange={(e) => setPledgeCite(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Attributed statistics, quotations, and academic citations.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 font-productsans leading-relaxed">
                  <input
                    type="checkbox"
                    checked={pledgeGuidelines}
                    onChange={(e) => setPledgeGuidelines(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Respectful discourse upholding child safety & peer guidelines.</span>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM ACTION BAR matching the screenshot buttons layout */}
        <div className="mt-8 pt-6 border-t border-gray-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-productsans">
          
          {/* Left: Save Draft button */}
          <div>
            <button
              type="button"
              onClick={handleManualSaveDraft}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-productsans"
            >
              <Save className="w-4 h-4 text-gray-500" />
              <span>Save Draft</span>
            </button>
          </div>

          {/* Right: Load Autosave & Submit Buttons */}
          <div className="flex items-center gap-3 font-productsans">
            {!editingArticle && (
              <button
                type="button"
                onClick={loadSavedDraft}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-xl border border-emerald-200/60 shadow-2xs transition-all active:scale-95 cursor-pointer font-productsans"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Restore Draft</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50 font-productsans"
            >
              <span>{saving ? 'Submitting...' : editingArticle ? 'Update Publication' : 'Add Publication'}</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
