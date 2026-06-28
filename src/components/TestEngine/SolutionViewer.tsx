import React, { useState } from"react";
import { motion, AnimatePresence } from"motion/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Info,
  BookOpen,
  LayoutGrid,
  X,
  BookMarked,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Flag,
  Share2,
  BadgeCheck,
  Tag,
  Image as ImageIcon,
  Bookmark,
  Search,
  PenTool,
} from"lucide-react";
import { addNote } from "../../utils/firestoreNotesDB";
import { useUser } from"../../context/UserContext";
import { db } from"../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  increment,
  getDocs,
  deleteDoc,
  getDoc,
  addDoc,
} from"firebase/firestore";
import Scratchpad from"../Scratchpad";

interface SolutionViewerProps {
  results: any;
  onBack: () => void;
}

const SolutionViewer: React.FC<SolutionViewerProps> = ({ results, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNavModal, setShowNavModal] = useState(false);
  const [savedToNotebook, setSavedToNotebook] = useState<
    Record<string, boolean>
  >({});
  const [communitySolutions, setCommunitySolutions] = useState<
    Record<string, any[]>
  >({});
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [showAddSolution, setShowAddSolution] = useState(false);
  const [newSolutionText, setNewSolutionText] = useState("");
  const [newSolutionImage, setNewSolutionImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("Detailed Method");
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(
    null,
  );
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [sortBy, setSortBy] = useState<"top" |"newest">("top");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const questions = results.questions;
  const currentQuestion = questions[currentIndex];
  const userAnswer = results.answers[currentQuestion.id];
  const isCorrect =
    String(userAnswer) === String(currentQuestion.correctAnswer);
  const isUnattempted = userAnswer === undefined;

  const currentSolutions = communitySolutions[String(currentQuestion.id)] || [];
  const filteredSolutions = selectedFilterTag
    ? currentSolutions.filter((sol) => sol.tag === selectedFilterTag)
    : currentSolutions;

  const searchedSolutions = searchQuery
    ? filteredSolutions.filter(
        (sol) =>
          sol.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sol.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredSolutions;

  const sortedSolutions = [...searchedSolutions].sort((a, b) => {
    if (sortBy ==="top") {
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });
  const solutionTags = ["Detailed Method","Short Trick","Formula Based","Elimination",
  ];

  React.useEffect(() => {
    if (!currentQuestion?.id || !user || user.uid ==="demo") {
      setLoadingSolutions(false);
      return;
    }

    setLoadingSolutions(true);
    const q = query(
      collection(db,"solutions"),
      where("questionId","==", String(currentQuestion.id)),
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        let solutionsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();

            // Fetch replies
            const repliesQuery = query(
              collection(db, `solutions/${docSnapshot.id}/replies`),
            );
            const repliesSnapshot = await getDocs(repliesQuery);
            const replies = repliesSnapshot.docs
              .map((r) => ({ id: r.id, ...r.data() }))
              .sort((a: any, b: any) => {
                return (
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
                );
              });

            // Fetch user's vote
            let userVote = null;
            if (user?.uid && user.uid !=="demo") {
              const voteDoc = await getDoc(
                doc(db, `solutions/${docSnapshot.id}/votes/${user.uid}`),
              );
              if (voteDoc.exists()) {
                userVote = voteDoc.data().type;
              }
            }

            return {
              id: docSnapshot.id,
              ...data,
              replies,
              userVote,
            };
          }),
        );

        // Sort by upvotes descending
        solutionsData.sort(
          (a: any, b: any) => (b.upvotes || 0) - (a.upvotes || 0),
        );

        setCommunitySolutions((prev) => ({
          ...prev,
          [String(currentQuestion.id)]: solutionsData,
        }));
        setLoadingSolutions(false);
      },
      (error) => {
        console.error("Error fetching solutions:", error);
        setLoadingSolutions(false);
      },
    );

    return () => unsubscribe();
  }, [currentQuestion?.id, user?.uid]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality to ensure it fits in Firestore (1MB limit)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setNewSolutionImage(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSolution = async () => {
    if (!newSolutionText.trim() && !newSolutionImage) return;
    if (!user || user.uid ==="demo") {
      alert("Please log in to add a solution.");
      return;
    }

    setIsUploading(true);
    try {
      // Use the compressed base64 image directly to avoid Firebase Storage setup requirements
      const imageUrl = newSolutionImage;

      const newId = Date.now().toString();
      const newSolution = {
        id: newId,
        questionId: String(currentQuestion.id),
        authorId: user.uid,
        author: user.name ||"Anonymous Student",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        text: newSolutionText,
        imageUrl: imageUrl,
        tag: selectedTag,
        isVerified: false,
        upvotes: 0,
        downvotes: 0,
        repliesCount: 0,
        date: new Date().toLocaleDateString(),
        createdAt: Date.now(),
      };

      await setDoc(doc(db,"solutions", newId), newSolution);

      setNewSolutionText("");
      setNewSolutionImage(null);
      setSelectedTag("Detailed Method");
      setShowAddSolution(false);
    } catch (error) {
      console.error("Error adding solution:", error);
      alert("Failed to add solution. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddReply = async (solutionId: string) => {
    const text = replyText[solutionId as any];
    if (!text?.trim() || !user) return;
    if (user.uid ==="demo") {
      alert("Please log in to reply to solutions.");
      return;
    }

    try {
      const newId = Date.now().toString();
      const newReply = {
        id: newId,
        solutionId: solutionId,
        authorId: user.uid,
        author: user.name ||"Anonymous Student",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        text: text,
        date: new Date().toLocaleDateString(),
        createdAt: Date.now(),
      };

      await setDoc(doc(db, `solutions/${solutionId}/replies`, newId), newReply);
      await updateDoc(doc(db,"solutions", solutionId), {
        repliesCount: increment(1),
      });

      setReplyText((prev) => ({ ...prev, [solutionId as any]:"" }));
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to add reply.");
    }
  };

  const toggleReplies = (solutionId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [solutionId as any]: !prev[solutionId as any],
    }));
  };

  const handleVote = async (solutionId: string, type:"up" |"down") => {
    if (!user || user.uid ==="demo") {
      alert("Please log in to vote.");
      return;
    }

    try {
      const voteRef = doc(db, `solutions/${solutionId}/votes/${user.uid}`);
      const voteDoc = await getDoc(voteRef);
      const solutionRef = doc(db,"solutions", solutionId);

      if (voteDoc.exists()) {
        const currentVote = voteDoc.data().type;
        if (currentVote === type) {
          // Remove vote
          await deleteDoc(voteRef);
          await updateDoc(solutionRef, {
            [type ==="up" ?"upvotes" :"downvotes"]: increment(-1),
          });
        } else {
          // Switch vote
          await setDoc(voteRef, {
            type,
            userId: user.uid,
            solutionId: solutionId,
          });
          await updateDoc(solutionRef, {
            [type ==="up" ?"upvotes" :"downvotes"]: increment(1),
            [currentVote ==="up" ?"upvotes" :"downvotes"]: increment(-1),
          });
        }
      } else {
        // New vote
        await setDoc(voteRef, {
          type,
          userId: user.uid,
          solutionId: solutionId,
        });
        await updateDoc(solutionRef, {
          [type ==="up" ?"upvotes" :"downvotes"]: increment(1),
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to record vote.");
    }
  };

  const handleShareSolution = (solutionId: string) => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleSaveSolution = async (solutionId: string) => {
    if (!user || user.uid ==="demo") {
      alert("Please log in to save solutions.");
      return;
    }
    try {
      await addDoc(collection(db,"savedSolutions"), {
        userId: user.uid,
        solutionId,
        savedAt: Date.now(),
      });
      alert("Solution saved successfully!");
    } catch (error) {
      console.error("Error saving solution:", error);
      alert("Failed to save solution.");
    }
  };

  const handleReportSolution = async (solutionId: string) => {
    if (!user || user.uid ==="demo") {
      alert("Please log in to report solutions.");
      return;
    }
    try {
      await addDoc(collection(db,"reports"), {
        solutionId,
        reporterId: user.uid,
        createdAt: Date.now(),
        status:"pending",
      });
      alert("Thank you for reporting. Our team will review this solution.");
    } catch (error) {
      console.error("Error reporting solution:", error);
      alert("Failed to report solution.");
    }
  };

  const handleDeleteSolution = async (solutionId: string) => {
    if (!user || user.uid ==="demo") return;
    // We can't use window.confirm easily in iframe, but we can use a custom modal or just delete.
    // For now, we'll just delete it.
    try {
      await deleteDoc(doc(db,"solutions", solutionId));
    } catch (error) {
      console.error("Error deleting solution:", error);
      alert("Failed to delete solution.");
    }
  };

  const handleDeleteReply = async (solutionId: string, replyId: string) => {
    if (!user || user.uid ==="demo") return;
    try {
      await deleteDoc(doc(db, `solutions/${solutionId}/replies`, replyId));
      await updateDoc(doc(db,"solutions", solutionId), {
        repliesCount: increment(-1),
      });
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert("Failed to delete reply.");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSaveToNotebook = () => {
    if (savedToNotebook[String(currentQuestion.id)]) return;
    if (!user?.uid) return;

    addNote(user.uid, {
      subject: currentQuestion.subject || "General",
      chapter: currentQuestion.chapter || "Mistakes",
      title: `Mistake - Q${currentIndex + 1}`,
      content: `Question:\n${currentQuestion.text}\n\nMistake:\n${isUnattempted ? "Not Attempted" : "Incorrect Answer"}\n\nCorrect Concept:\n${currentQuestion.explanation || "See solution for details."}`,
      tags: [],
    }).then(() => {
      setSavedToNotebook((prev) => ({
        ...prev,
        [String(currentQuestion.id)]: true,
      }));
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-40 border-b border-slate-900/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Solutions</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Q{currentIndex + 1} • {currentQuestion.subject}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`p-2 rounded-xl border transition-colors ${showScratchpad ?"bg-brand/20 border-brand/50 text-brand" :"bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-brand"}`}
            title="Scratchpad"
          >
            <PenTool size={20} />
          </button>
          <button
            onClick={() => setShowNavModal(true)}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-900/5 dark:border-white/5"
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border ${
            isUnattempted
              ?"bg-slate-50/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              : isCorrect
                ?"bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                :"bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {isUnattempted ? (
            <Info size={20} />
          ) : isCorrect ? (
            <CheckCircle2 size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span className="text-sm font-bold">
            {isUnattempted
              ?"Not Attempted"
              : isCorrect
                ?"Correct Answer"
                :"Incorrect Answer"}
          </span>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
            {currentQuestion.text}
          </div>
          {currentQuestion.options ? (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option: string, i: number) => {
                const isCorrectOption =
                  String(option) === String(currentQuestion.correctAnswer);
                const isUserOption = String(option) === String(userAnswer);

                return (
                  <div
                    key={i}
                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
                      isCorrectOption
                        ?"bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10"
                        : isUserOption
                          ?"bg-red-500/10 border-red-500"
                          :"bg-slate-50/40 dark:bg-slate-800/40 border-slate-900/5 dark:border-white/5"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        isCorrectOption
                          ?"bg-emerald-500 border-emerald-500 text-white"
                          : isUserOption
                            ?"bg-red-500 border-red-500 text-white"
                            :"border-slate-600 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span
                      className={`text-sm ${isCorrectOption ?"text-emerald-500 font-bold" : isUserOption ?"text-red-500 font-bold" :"text-slate-500 dark:text-slate-400"}`}
                    >
                      {option}
                    </span>
                    {isCorrectOption && (
                      <CheckCircle2
                        size={18}
                        className="ml-auto text-emerald-500"
                      />
                    )}
                    {isUserOption && !isCorrectOption && (
                      <XCircle size={18} className="ml-auto text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 rounded-2xl border-2 bg-slate-50/40 dark:bg-slate-800/40 border-slate-900/5 dark:border-white/5">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Your Answer
              </span>
              <span
                className={`text-lg font-bold ${isCorrect ?"text-emerald-500" : isUnattempted ?"text-slate-500 dark:text-slate-400" :"text-red-500"}`}
              >
                {isUnattempted ?"Not Attempted" : userAnswer}
              </span>
            </div>
          )}
        </div>

        {/* Solution Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand">
              <BookOpen size={20} />
              <h3 className="font-bold">Detailed Solution</h3>
            </div>
            {!isCorrect && (
              <button
                onClick={handleSaveToNotebook}
                disabled={savedToNotebook[String(currentQuestion.id)]}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  savedToNotebook[String(currentQuestion.id)]
                    ?"bg-emerald-500/20 text-emerald-500"
                    :"bg-brand/20 text-brand hover:bg-brand/30"
                }`}
              >
                {savedToNotebook[String(currentQuestion.id)] ? (
                  <>
                    <CheckCircle2 size={14} />
                    Saved
                  </>
                ) : (
                  <>
                    <BookMarked size={14} />
                    Save to Notebook
                  </>
                )}
              </button>
            )}
          </div>
          <div className="bg-slate-50/40 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-900/5 dark:border-white/5 space-y-4">
            <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Correct Answer
              </span>
              <span className="text-lg font-bold text-emerald-500">
                {currentQuestion.correctAnswer}
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentQuestion.explanation}
              <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-900/5 dark:border-white/5 font-mono text-xs text-slate-500 dark:text-slate-400">
                // Formula used: F = ma // Given: m = 10kg, a = 5m/s² //
                Calculation: 10 * 5 = 50N
              </div>
            </div>
          </div>
        </div>

        {/* Community Solutions Section */}
        <div className="space-y-4 pt-8 border-t border-slate-900/5 dark:border-white/5 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <Users size={20} />
              <h3 className="font-bold">Community Solutions</h3>
            </div>
            <button
              onClick={() => setShowAddSolution(!showAddSolution)}
              className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-bold transition-colors"
            >
              {showAddSolution ?"Cancel" :"Add Solution"}
            </button>
          </div>

          <AnimatePresence>
            {showAddSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height:"auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50/40 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5 rounded-2xl p-4 space-y-4 mt-4">
                  {newSolutionImage && (
                    <div className="relative inline-block">
                      <img
                        src={newSolutionImage}
                        alt="Solution preview"
                        className="max-h-48 rounded-lg border border-slate-900/10 dark:border-white/10"
                      />
                      <button
                        onClick={() => setNewSolutionImage(null)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <textarea
                    value={newSolutionText}
                    onChange={(e) => setNewSolutionText(e.target.value)}
                    placeholder="Explain how you solved this question..."
                    className="w-full bg-white/5 dark:bg-slate-900/50 border border-slate-900/10 dark:border-white/10 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:border-blue-500/50 min-h-[120px] resize-none"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 bg-white/5 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-900/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300">
                        <ImageIcon size={14} />
                        Add Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <div className="w-px h-6 bg-white/10 dark:bg-slate-900/10 mx-1 self-center"></div>
                      {solutionTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                            selectedTag === tag
                              ?"bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              :"bg-white/5 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-900/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Tag size={12} />
                          {tag}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleAddSolution}
                      disabled={
                        (!newSolutionText.trim() && !newSolutionImage) ||
                        isUploading
                      }
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={16} />
                      )}
                      {isUploading ?"Posting..." :"Post Solution"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {currentSolutions.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search solutions by text or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:border-blue-500/50"
                />
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedFilterTag(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedFilterTag === null
                        ?"bg-brand text-slate-900"
                        :"bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    All
                  </button>
                  {solutionTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedFilterTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        selectedFilterTag === tag
                          ?"bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          :"bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      <Tag size={12} />
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-900/5 dark:border-white/5">
                  <button
                    onClick={() => setSortBy("top")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                      sortBy ==="top"
                        ?"bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                        :"text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => setSortBy("newest")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                      sortBy ==="newest"
                        ?"bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                        :"text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Newest
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingSolutions ? (
            <div className="bg-slate-50/20 dark:bg-slate-800/20 border border-slate-900/5 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center mt-4">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Loading community solutions...
              </p>
            </div>
          ) : currentSolutions.length === 0 ? (
            <div className="bg-slate-50/20 dark:bg-slate-800/20 border border-slate-900/5 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center mt-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-900/5 dark:border-white/5">
                <MessageSquare
                  size={24}
                  className="text-slate-500 dark:text-slate-400"
                />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">
                No community solutions yet.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Be the first to add one!
              </p>
            </div>
          ) : sortedSolutions.length === 0 ? (
            <div className="bg-slate-50/20 dark:bg-slate-800/20 border border-slate-900/5 dark:border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center mt-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-900/5 dark:border-white/5">
                <MessageSquare
                  size={24}
                  className="text-slate-500 dark:text-slate-400"
                />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">
                No solutions found for this tag.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {sortedSolutions.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-slate-50/40 dark:bg-slate-800/40 border border-slate-900/5 dark:border-white/5 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={sol.avatar}
                        alt={sol.author}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {sol.author}
                          </div>
                          {sol.isVerified && (
                            <BadgeCheck size={14} className="text-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {sol.date}
                          </div>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-600"></span>
                          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded">
                            {sol.tag ||"Detailed Method"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user && sol.authorId === user.uid && (
                        <button
                          onClick={() => handleDeleteSolution(sol.id)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete Solution"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleShareSolution(sol.id)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Share Solution"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-4">
                    {sol.text}
                    {sol.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={sol.imageUrl}
                          alt="Solution attachment"
                          className="max-h-64 rounded-xl border border-slate-900/10 dark:border-white/10 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-900/5 dark:border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleVote(sol.id,"up")}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${sol.userVote ==="up" ?"text-emerald-500" :"text-slate-500 dark:text-slate-400 hover:text-emerald-400"}`}
                      >
                        <ThumbsUp
                          size={16}
                          className={
                            sol.userVote ==="up" ?"fill-current" :""
                          }
                        />
                        {sol.upvotes}
                      </button>
                      <button
                        onClick={() => handleVote(sol.id,"down")}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${sol.userVote ==="down" ?"text-red-500" :"text-slate-500 dark:text-slate-400 hover:text-red-400"}`}
                      >
                        <ThumbsDown
                          size={16}
                          className={
                            sol.userVote ==="down" ?"fill-current" :""
                          }
                        />
                        {sol.downvotes}
                      </button>
                      <button
                        onClick={() => toggleReplies(sol.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-400 transition-colors ml-2"
                      >
                        <MessageSquare size={16} />
                        {sol.repliesCount}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSaveSolution(sol.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        <Bookmark size={14} />
                        Save
                      </button>
                      <button
                        onClick={() => handleReportSolution(sol.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Flag size={14} />
                        Report
                      </button>
                    </div>
                  </div>

                  {/* Replies Section */}
                  <AnimatePresence>
                    {expandedReplies[sol.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height:"auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-slate-900/5 dark:border-white/5 space-y-4">
                          {sol.replies?.map((reply: any) => (
                            <div
                              key={reply.id}
                              className="flex gap-3 pl-4 border-l-2 border-slate-900/5 dark:border-white/5 group"
                            >
                              <img
                                src={reply.avatar}
                                alt={reply.author}
                                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                      {reply.author}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                      {reply.date}
                                    </span>
                                  </div>
                                  {user && reply.authorId === user.uid && (
                                    <button
                                      onClick={() =>
                                        handleDeleteReply(sol.id, reply.id)
                                      }
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 dark:text-slate-400 hover:text-red-400 transition-all"
                                      title="Delete Reply"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-3 pt-2">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name ||"user"}`}
                              alt="You"
                              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700"
                            />
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={replyText[sol.id] ||""}
                                onChange={(e) =>
                                  setReplyText((prev) => ({
                                    ...prev,
                                    [sol.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add a reply..."
                                className="flex-1 bg-white/5 dark:bg-slate-900/50 border border-slate-900/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:text-slate-400 focus:outline-none focus:border-blue-500/50"
                                onKeyDown={(e) => {
                                  if (e.key ==="Enter") handleAddReply(sol.id);
                                }}
                              />
                              <button
                                onClick={() => handleAddReply(sol.id)}
                                disabled={!replyText[sol.id]?.trim()}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="p-6 bg-white dark:bg-slate-900 border-t border-slate-900/5 dark:border-white/5 flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
            currentIndex === 0
              ?"opacity-30 cursor-not-allowed"
              :"bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          }`}
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
            currentIndex === questions.length - 1
              ?"opacity-30 cursor-not-allowed"
              :"bg-brand text-slate-900 shadow-xl shadow-brand/30"
          }`}
        >
          Next
          <ChevronRight size={20} />
        </button>
      </footer>

      {/* Nav Modal */}
      <AnimatePresence>
        {showNavModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-6 flex items-end"
          >
            <motion.div
              initial={{ y:"100%" }}
              animate={{ y: 0 }}
              exit={{ y:"100%" }}
              className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Jump to Question</h3>
                <button
                  onClick={() => setShowNavModal(false)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {questions.map((q: any, i: number) => {
                  const ans = results.answers[q.id];
                  const correct =
                    ans !== undefined &&
                    String(ans) === String(q.correctAnswer);
                  const unattempted = ans === undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(i);
                        setShowNavModal(false);
                      }}
                      className={`h-12 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                        i === currentIndex
                          ?"border-brand ring-2 ring-brand ring-offset-2 ring-offset-slate-900"
                          : unattempted
                            ?"bg-slate-50 dark:bg-slate-800 border-slate-900/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                            : correct
                              ?"bg-emerald-500 border-emerald-500 text-white"
                              :"bg-red-500 border-red-500 text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SolutionViewer;
