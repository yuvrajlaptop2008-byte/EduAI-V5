import React, { useState } from"react";
import { useNavigate } from"react-router-dom";
import { ChevronLeft, Save, Plus, X } from"lucide-react";
import { addCustomFormula } from "../utils/firestoreFormulasDB";
import { useUser } from"../context/UserContext";
import { toast } from"sonner";

const CreateFormula = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [subjectKey, setSubjectKey] = useState("Physics");
  const [chapterKey, setChapterKey] = useState("");
  const [topicKey, setTopicKey] = useState("");
  const [title, setTitle] = useState("");
  const [definition, setDefinition] = useState("");
  const [formula, setFormula] = useState("");

  const [variables, setVariables] = useState<
    { symbol: string; meaning: string }[]
  >([{ symbol:"", meaning:"" }]);
  const [units, setUnits] = useState<{ symbol: string; unit: string }[]>([
    { symbol:"", unit:"" },
  ]);
  const [importantNotes, setImportantNotes] = useState<string[]>([""]);
  const [commonMistakes, setCommonMistakes] = useState<string[]>([""]);
  const [example, setExample] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" |"Moderate" |"Advanced"
  >("Moderate");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!chapterKey || !topicKey || !title || !formula) {
      toast.error("Please fill in all required fields (Chapter, Topic, Title, Formula)");
      return;
    }
    if (!user?.uid) return;

    const variablesRecord: Record<string, string> = {};
    variables.forEach((v) => {
      if (v.symbol && v.meaning) variablesRecord[v.symbol] = v.meaning;
    });

    const unitsRecord: Record<string, string> = {};
    units.forEach((u) => {
      if (u.symbol && u.unit) unitsRecord[u.symbol] = u.unit;
    });

    setSaving(true);
    try {
      await addCustomFormula(user.uid, {
        subjectKey,
        chapterKey,
        topicKey,
        title,
        definition,
        formula,
        variables: variablesRecord,
        units: unitsRecord,
        important_notes: importantNotes.filter((n) => n.trim() !== ""),
        common_mistakes: commonMistakes.filter((m) => m.trim() !== ""),
        example,
        difficulty,
        exam_relevance: ["Custom"],
      });
      toast.success("Custom formula card created successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save formula. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg z-40 border-b border-slate-900/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Create Formula Card</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand/90 transition-colors disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save"}
        </button>
      </header>

      <main className="px-6 py-6 space-y-6 max-w-2xl mx-auto">
        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-900/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-brand">Classification</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Subject
              </label>
              <select
                value={subjectKey}
                onChange={(e) => setSubjectKey(e.target.value)}
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Chapter *
              </label>
              <input
                type="text"
                value={chapterKey}
                onChange={(e) => setChapterKey(e.target.value)}
                placeholder="e.g. Current Electricity"
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Topic *
              </label>
              <input
                type="text"
                value={topicKey}
                onChange={(e) => setTopicKey(e.target.value)}
                placeholder="e.g. Electric Current"
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-900/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-brand">Formula Details</h2>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ohm's Law"
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Definition
            </label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Explain the formula briefly..."
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Formula (LaTeX) *
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. V = IR or \frac{dq}{dt}"
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand font-mono"
            />
          </div>
        </div>

        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-900/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-brand">Variables & Units</h2>

          <div className="space-y-4">
            {variables.map((v, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={v.symbol}
                  onChange={(e) => {
                    const newVars = [...variables];
                    newVars[i].symbol = e.target.value;
                    setVariables(newVars);

                    // Auto-update units symbol if it exists
                    if (units[i]) {
                      const newUnits = [...units];
                      newUnits[i].symbol = e.target.value;
                      setUnits(newUnits);
                    }
                  }}
                  placeholder="Symbol (e.g. V)"
                  className="w-1/3 p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand font-mono"
                />
                <input
                  type="text"
                  value={v.meaning}
                  onChange={(e) => {
                    const newVars = [...variables];
                    newVars[i].meaning = e.target.value;
                    setVariables(newVars);
                  }}
                  placeholder="Meaning (e.g. Voltage)"
                  className="w-1/3 p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                />
                <input
                  type="text"
                  value={units[i]?.unit ||""}
                  onChange={(e) => {
                    const newUnits = [...units];
                    if (!newUnits[i])
                      newUnits[i] = { symbol: v.symbol, unit:"" };
                    newUnits[i].unit = e.target.value;
                    setUnits(newUnits);
                  }}
                  placeholder="Unit (e.g. Volts)"
                  className="w-1/3 p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                />
                <button
                  onClick={() => {
                    setVariables(variables.filter((_, idx) => idx !== i));
                    setUnits(units.filter((_, idx) => idx !== i));
                  }}
                  className="p-3 bg-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500/30"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setVariables([...variables, { symbol:"", meaning:"" }]);
                setUnits([...units, { symbol:"", unit:"" }]);
              }}
              className="text-sm font-bold text-brand flex items-center gap-1"
            >
              <Plus size={16} /> Add Variable
            </button>
          </div>
        </div>

        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-900/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-brand">Additional Info</h2>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Important Notes
            </label>
            {importantNotes.map((note, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => {
                    const newNotes = [...importantNotes];
                    newNotes[i] = e.target.value;
                    setImportantNotes(newNotes);
                  }}
                  placeholder="Add an important note..."
                  className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                />
                <button
                  onClick={() =>
                    setImportantNotes(
                      importantNotes.filter((_, idx) => idx !== i),
                    )
                  }
                  className="p-3 bg-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500/30"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setImportantNotes([...importantNotes,""])}
              className="text-sm font-bold text-brand flex items-center gap-1"
            >
              <Plus size={16} /> Add Note
            </button>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Common Mistakes
            </label>
            {commonMistakes.map((mistake, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={mistake}
                  onChange={(e) => {
                    const newMistakes = [...commonMistakes];
                    newMistakes[i] = e.target.value;
                    setCommonMistakes(newMistakes);
                  }}
                  placeholder="Add a common mistake..."
                  className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                />
                <button
                  onClick={() =>
                    setCommonMistakes(
                      commonMistakes.filter((_, idx) => idx !== i),
                    )
                  }
                  className="p-3 bg-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500/30"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setCommonMistakes([...commonMistakes,""])}
              className="text-sm font-bold text-brand flex items-center gap-1"
            >
              <Plus size={16} /> Add Mistake
            </button>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Example
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Provide a short example..."
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand min-h-[80px]"
            />
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
            >
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateFormula;
