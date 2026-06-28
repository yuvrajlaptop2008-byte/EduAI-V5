import React, { useRef } from"react";
import { Bold, Italic, List, ListOrdered } from"lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string ="") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;

    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;

    onChange(text.substring(0, start) + replacement + text.substring(end));

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + before.length,
          end + before.length,
        );
      }
    }, 0);
  };

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/10 dark:border-white/10 rounded-2xl overflow-hidden focus-within:border-brand/50 transition-colors">
      <div className="flex items-center gap-2 p-2 border-b border-slate-900/10 dark:border-white/10 bg-white/5 dark:bg-slate-900/50">
        <button
          type="button"
          onClick={() => insertText("**","**")}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertText("*","*")}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-4 bg-white/10 dark:bg-slate-900/10 mx-1" />
        <button
          type="button"
          onClick={() => insertText("-")}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          title="Bulleted List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertText("1.")}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className="w-full p-4 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-400 focus:outline-none resize-none"
      />
    </div>
  );
};

export default MarkdownEditor;
