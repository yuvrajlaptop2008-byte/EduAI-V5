import React, { useMemo } from"react";
import { motion } from"motion/react";
import { Link, useNavigate, useParams } from"react-router-dom";
import {
  ChevronLeft,
  List,
  ThumbsDown,
  Bookmark,
  EyeOff,
  FileText,
  Zap,
} from"lucide-react";
import { formulasData } from"../data/formulas";
import { getCustomFormulas, getFormulaStatuses } from "../utils/firestoreFormulasDB";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";

const FormulaChapter = () => {
  const navigate = useNavigate();
  const { subjectId, chapterId } = useParams();
  const { user } = useUser();
  const [customFormulas, setCustomFormulas] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});

  const subjectKey = useMemo(() => {
    if (!subjectId) return"Physics";
    const normalized = subjectId.toLowerCase();
    if (normalized ==="physics") return"Physics";
    if (normalized ==="chemistry") return"Chemistry";
    if (normalized ==="maths" || normalized ==="mathematics")
      return"Mathematics";
    return"Physics";
  }, [subjectId]);

  const chapterKey = decodeURIComponent(chapterId ||"");

  useEffect(() => {
    if (user?.uid) {
      getCustomFormulas(user.uid).then((fetched) => {
        setCustomFormulas(
          fetched.filter(
            (f) => f.subjectKey === subjectKey && f.chapterKey === chapterKey,
          ),
        );
      });
      getFormulaStatuses(user.uid).then((fetched) => {
        setStatuses(fetched || {});
      });
    }
  }, [user?.uid, subjectKey, chapterKey]);

  const chapterData = useMemo(() => {
    const data = JSON.parse(
      JSON.stringify(
        formulasData[subjectKey]?.chapters[chapterKey] || { topics: {} },
      ),
    );

    // Merge standard formula statuses
    Object.values(data.topics).forEach((topic: any) => {
      topic.cards.forEach((card: any) => {
        if (statuses[card.id]) {
          card.status = { ...card.status, ...statuses[card.id] };
        }
      });
    });

    customFormulas.forEach((f) => {
      const cardStatus = statuses[f.id] || f.status || {
        not_seen: true,
        memorized: false,
        bookmarked: false,
        need_revision: false,
      };
      const cardWithStatus = {
        ...f,
        status: cardStatus,
      };

      if (!data.topics[f.topicKey]) {
        data.topics[f.topicKey] = { total_cards: 0, cards: [] };
      }
      data.topics[f.topicKey].cards.push(cardWithStatus);
      data.topics[f.topicKey].total_cards += 1;
    });

    return data;
  }, [subjectKey, chapterKey, customFormulas, statuses]);

  const topics = Object.keys(chapterData.topics);

  let totalCards = 0;
  let notSeen = 0;
  let bookmarked = 0;
  let needRevision = 0;
  let memorized = 0;

  Object.values(chapterData.topics).forEach((topic: any) => {
    totalCards += topic.cards.length;
    topic.cards.forEach((card: any) => {
      if (card.status.not_seen) notSeen++;
      if (card.status.bookmarked) bookmarked++;
      if (card.status.need_revision) needRevision++;
      if (card.status.memorized) memorized++;
    });
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg z-40 border-b border-slate-900/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{chapterKey}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {totalCards} Formula Cards
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">
        {/* Stats Circles */}
        <section className="flex justify-between items-center px-2">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <List size={28} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                All Formulae
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalCards} Cards
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <ThumbsDown size={28} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Need Revision
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {needRevision} Cards
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bookmark size={28} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Bookmarks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {bookmarked} Cards
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <EyeOff size={28} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Not Seen
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {notSeen} Cards
              </p>
            </div>
          </div>
        </section>

        {/* All Topics */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
              All Topics
            </h2>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {topics.length} Topics
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {topics.map((topic, index) => {
              const topicData = chapterData.topics[topic];
              return (
                <Link
                  key={topic}
                  to={`/app/formulas/${subjectId}/${encodeURIComponent(chapterKey)}/${encodeURIComponent(topic)}`}
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 h-64 flex flex-col justify-between relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                      {/* Placeholder for formula image */}
                      <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="text-slate-500 dark:text-slate-400 opacity-50">
                          <FileText size={48} />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight text-center w-full">
                        {topic}
                      </h3>
                    </div>
                    <div className="relative z-10 mt-auto pt-2 border-t border-slate-200 dark:border-slate-800 w-full">
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {topicData.cards.length} Cards
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FormulaChapter;
