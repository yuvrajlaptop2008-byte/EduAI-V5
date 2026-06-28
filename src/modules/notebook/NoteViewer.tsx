import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Tag as TagIcon,
} from "lucide-react";
import { getNoteById, deleteNote, Note } from "../../utils/firestoreNotesDB";
import { useUser } from "../../context/UserContext";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

const NoteViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [note, setNote] = useState<Note | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user?.uid) {
      loadNote();
    }
  }, [id, user?.uid]);

  const loadNote = async () => {
    if (!id || !user?.uid) return;
    setLoading(true);
    try {
      const found = await getNoteById(user.uid, id);
      if (found) setNote(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !user?.uid) return;
    try {
      await deleteNote(user.uid, id);
      toast.success("Note deleted");
      navigate("/app/notebook");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete note.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-center">
        <p>Note not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/notebook")}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/notebook/${note.id}/edit`)}
            className="p-2 bg-slate-50 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex gap-2 items-center mb-4 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-3 py-1.5 rounded-lg">
              {note.subject}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              {note.chapter}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium ml-auto">
              {note.date}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {note.title}
          </h1>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md flex items-center gap-1"
                >
                  <TagIcon size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="bg-slate-50/40 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-900/5 dark:border-white/5 mt-8 overflow-x-auto">
            <div className="prose prose-invert prose-slate prose-a:text-brand max-w-none text-slate-600 dark:text-slate-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Delete Note?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Are you sure you want to delete this note? This action cannot be
                undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-900 dark:text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteViewer;
