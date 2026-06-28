export default function Notebook() {
  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Notebook
        </h1>
        <button className="bg-brand text-slate-900 dark:text-slate-900 font-bold px-4 py-2 rounded-xl text-sm">
          New Note
        </button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-3xl border border-yellow-200 dark:border-yellow-700/50"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Important Concepts - Chapter {i}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Last edited 2 days ago
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
