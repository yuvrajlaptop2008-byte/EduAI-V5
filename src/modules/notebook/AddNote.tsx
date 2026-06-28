import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { addNote } from "../../utils/firestoreNotesDB";
import { useUser } from "../../context/UserContext";
import MarkdownEditor from "../../components/MarkdownEditor";
import { toast } from "sonner";

const AddNote = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title || !content || !subject || !chapter) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!user?.uid) return;

    setSaving(true);
    try {
      await addNote(user.uid, { subject, chapter, title, content, tags });
      toast.success("Note saved!");
      navigate("/app/notebook");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Add Note</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand text-slate-900 px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-brand/20 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save"}
        </button>
      </header>

      <main className="px-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics"
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/10 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:border-brand/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Chapter
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Mechanics"
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/10 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:border-brand/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Work Energy Concept"
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/10 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:border-brand/50 transition-colors font-bold text-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Tags
            </label>
            <div className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/10 dark:border-white/10 rounded-2xl p-4 flex flex-wrap gap-2 items-center focus-within:border-brand/50 transition-colors">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-brand/20 text-brand px-2 py-1 rounded-md text-xs font-bold"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={
                  tags.length === 0 ?"Add tags (press Enter)..." :""
                }
                className="bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-400 focus:outline-none flex-1 min-w-[120px] text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Content
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Write your notes here using Markdown..."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddNote;
