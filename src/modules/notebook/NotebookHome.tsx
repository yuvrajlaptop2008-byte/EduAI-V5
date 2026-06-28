import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Book, Tag as TagIcon, X } from "lucide-react";
import { getNotes, Note } from "../../utils/firestoreNotesDB";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const NotebookHome = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      loadNotes();
    }
  }, [user?.uid]);

  const loadNotes = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const fetched = await getNotes(user.uid);
    setNotes(fetched);
    setLoading(false);
  };

  const subjects = ["All", ...Array.from(new Set(notes.map((n) => n.subject)))];

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesSubject =
      filterSubject === "All" || n.subject === filterSubject;
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => (n.tags || []).includes(tag));

    return matchesSearch && matchesSubject && matchesTags;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40 border-b border-slate-900/5 dark:border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">
              Notebook
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Your personal revision system
            </p>
          </div>
          <button
            onClick={() => navigate("/app/notebook/add")}
            className="w-10 h-10 bg-brand text-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-brand/20 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/10 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-slate-900/5 dark:border-white/5">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setFilterSubject(subject)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filterSubject === subject
                  ? "bg-brand text-slate-900 shadow-lg shadow-brand/20"
                  : "bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 items-center">
            <TagIcon
              size={14}
              className="text-slate-500 dark:text-slate-400 shrink-0 mr-1"
            />
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                    isSelected
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-slate-50/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border border-slate-900/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {tag}
                  {isSelected && <X size={12} className="ml-0.5" />}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main className="px-6 pt-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <Book className="mx-auto text-slate-600 dark:text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
              No notes found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Create a note or save a mistake from a test.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/app/notebook/${note.id}`)}
                className="bg-slate-50/40 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-900/5 dark:border-white/5 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-1 rounded-md">
                      {note.subject}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {note.chapter}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-2">
                    {note.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                  {note.title}
                </h3>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        <TagIcon size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                  {note.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default NotebookHome;
