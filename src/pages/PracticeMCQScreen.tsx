import React, { useState, useEffect } from"react";
import { motion, AnimatePresence } from"motion/react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  PenTool,
  ArrowLeft,
  Bookmark,
  AlertTriangle,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  LayoutGrid,
  X,
  User,
  Clock,
  Send,
  Flag,
  Share2,
  BadgeCheck,
  Tag,
  Image as ImageIcon,
  Search,
  Trophy,
  MinusCircle,
  PauseCircle,
  Flame,
  Edit3,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Scratchpad from "../components/Scratchpad";
import { useUser } from "../context/UserContext";
import { db, handleFirestoreError } from "../firebase";
import { addBookmark, removeBookmark, getBookmarks } from "../utils/firestoreBookmarksDB";
import {
  collection,
  query,
  where,
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

type CommunitySolution = {
  id: string;
  userName: string;
  upvotes: number;
  text: string;
};

type Question = {
  id: number;
  subject: string;
  chapter: string;
  difficulty:"Easy" |"Medium" |"Hard";
  text: string;
  options: string[];
  correctAnswer: number;
  solution: string;
  communitySolutions: CommunitySolution[];
};

const PracticeMCQScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get initial index from location state, fallback to 0
  const initialIndex = location.state?.questionIndex || 0;
  const source = location.state?.source ||"unknown";
  const isChapterWisePYQ = source ==="chapter-wise-pyq";
  const isDppQuiz = source ==="dpp_quiz";
  const isAssignmentMode = source ==="dpp_assignment";
  const [isReviewMode, setIsReviewMode] = useState(false);
  const isQuizActive = isDppQuiz && !isReviewMode;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [questionStates, setQuestionStates] = useState<
    Record<number,"unvisited" |"attempted" |"correct" |"incorrect">
  >({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});

  const [showSolution, setShowSolution] = useState(false);
  const [solutionTab, setSolutionTab] = useState<"official" |"community">("official",
  );
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [correctStreak, setCorrectStreak] = useState(0);
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);

  // Community Solutions State
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
  const [sortBy, setSortBy] = useState<"top" |"newest">("top");
  const [searchQuery, setSearchQuery] = useState("");
  const solutionTags = ["Detailed Method","Short Trick","Formula Based","Elimination",
  ];
  const { user, saveActivity, recordQuestionAttempt, getQuestionAttemptsToday } = useUser();

  // Removed admin question edit modal states and handlers

  useEffect(() => {
    if (questions.length > 0) {
      const initialAttempts: Record<number, number> = {};
      const initialStates: Record<number, "unvisited" | "attempted" | "correct" | "incorrect"> = {};
      
      questions.forEach((q) => {
        const todayAttempts = getQuestionAttemptsToday(q.id);
        initialAttempts[q.id] = todayAttempts.length;
        if (todayAttempts.length > 0) {
          const lastAttemptCorrect = todayAttempts[todayAttempts.length - 1];
          initialStates[q.id] = lastAttemptCorrect ? "correct" : "incorrect";
        } else {
          initialStates[q.id] = "unvisited";
        }
      });
      
      setAttempts(initialAttempts);
      setQuestionStates((prev) => ({
        ...prev,
        ...initialStates
      }));
    }
  }, [questions, getQuestionAttemptsToday]);

  const [showReport, setShowReport] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showQuestionReportModal, setShowQuestionReportModal] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("");
  const [reportComments, setReportComments] = useState("");
  const [dppScore, setDppScore] = useState({
    correct: 0,
    incorrect: 0,
    unattempted: 0,
    totalScore: 0,
    maxStreak: 0,
  });

  const subject = location.state?.subject || "Physics";
  const chapter = location.state?.chapterName || "Laws of Motion";

  useEffect(() => {
    const fetchQuestions = async () => {
      const { getQuestionsForChapter } = await import("../utils/questionBank");
      const list = getQuestionsForChapter(subject, chapter);
      setQuestions(list);
    };
    fetchQuestions();
  }, [subject, chapter]);

  const currentQuestion = questions[currentIndex] || questions[0] || { id: 0, text: "", options: [], correctAnswer: 0, solution: "", communitySolutions: [], subject: "", chapter: "", difficulty: "Easy" };
  const selectedOption = userAnswers[currentQuestion.id] ?? null;
  const isSubmitted =
    isReviewMode ||
    questionStates[currentQuestion.id] ==="correct" ||
    questionStates[currentQuestion.id] ==="incorrect";
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

  useEffect(() => {
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
      handleFirestoreError(error,"create","solutions");
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

  useEffect(() => {
    // Reset solution view when changing questions
    setShowSolution(isSubmitted);

    // Mark as visited if unvisited
    if (!questionStates[currentQuestion.id]) {
      setQuestionStates((prev) => ({
        ...prev,
        [currentQuestion.id]:"unvisited",
      }));
    }
  }, [currentIndex, currentQuestion.id, isSubmitted, questionStates]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (user && user.uid !== "demo") {
        const fetched = await getBookmarks(user.uid);
        const map: Record<number, boolean> = {};
        fetched.forEach(b => {
          if (b.source === source) {
            map[b.questionId] = true;
          }
        });
        setBookmarked(map);
      }
    };
    fetchBookmarks();
  }, [user, source]);

  const isTimerPaused =
    showScratchpad ||
    showPalette ||
    showReport ||
    showSubmitConfirm ||
    showExitConfirm ||
    showAddSolution ||
    showSolution ||
    isSubmitted;
  const [overallTime, setOverallTime] = useState(0);
  const totalDuration = questions.length * 60; // 1 min per question for countdown

  useEffect(() => {
    if (isSubmitted || isTimerPaused) return;

    const timer = setInterval(() => {
      setOverallTime((prev) => {
        const nextTime = prev + 1;
        // Auto-submit if time runs out in DPQuiz mode
        if (isQuizActive && nextTime >= totalDuration && !showReport) {
          handleDppSubmit();
        }
        return nextTime;
      });

      setTimeSpent((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentQuestion.id,
    isSubmitted,
    isTimerPaused,
    isQuizActive,
    showReport,
  ]);

  const formatOverallTime = () => {
    let secondsRemaining = overallTime;
    if (isQuizActive) {
      secondsRemaining = Math.max(0, totalDuration - overallTime);
    }
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
  };

  const handleOptionSelect = (index: number) => {
    if (isSubmitted && !isQuizActive) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }));
    if (isQuizActive) {
      setQuestionStates((prev) => ({
        ...prev,
        [currentQuestion.id]:"attempted",
      }));
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setQuestionStates((prev) => ({
      ...prev,
      [currentQuestion.id]: isCorrect ? "correct" : "incorrect",
    }));
    setShowSolution(true);

    if (isCorrect) {
      if (isChapterWisePYQ) {
        setCorrectStreak((prev) => {
          const newStreak = prev + 1;
          // Streak will be in odd format like 3, 5, 7, 9...
          if (newStreak >= 3 && newStreak % 2 !== 0) {
            setStreakMilestone(newStreak);
          }
          return newStreak;
        });
      }
    } else {
      if (isChapterWisePYQ) {
        setCorrectStreak(0);
      }
    }

    // Record attempt, calculate points and save activity via user context
    const timeSpentSeconds = timeSpent[currentQuestion.id] || 0;
    const chapterId = location.state?.chapterId;
    const result = await recordQuestionAttempt(
      String(currentQuestion.id),
      isCorrect,
      timeSpentSeconds,
      chapterId
    );

    // Update attempts local state
    setAttempts((prev) => ({
      ...prev,
      [currentQuestion.id]: result.attemptNumber,
    }));
  };

  const handleDppSubmit = async () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const newQuestionStates = { ...questionStates };

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.correctAnswer) {
        correct++;
        newQuestionStates[q.id] ="correct";
      } else {
        incorrect++;
        newQuestionStates[q.id] ="incorrect";
      }
    });

    let maxStreak = 0;
    if (isChapterWisePYQ) {
      let tempStreak = 0;
      questions.forEach((q) => {
        const state = newQuestionStates[q.id];
        if (state === "correct") {
          tempStreak++;
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      });
    }

    setQuestionStates(newQuestionStates);
    const totalScore = correct * 4 - incorrect * 1;
    setDppScore({
      correct,
      incorrect,
      unattempted,
      totalScore,
      maxStreak,
    });

    const totalTimeSeconds = Object.values(timeSpent).reduce(
      (a, b) => a + b,
      0,
    );
    const attemptedCount = correct + incorrect;
    const totalTimeMinutes = Math.round(totalTimeSeconds / 60);
    await saveActivity(
      correct,
      attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0,
      totalTimeMinutes,
      totalScore,
      location.state?.chapterId,
      undefined,
      undefined,
      undefined,
      attemptedCount,
      correct
    );

    // Save to Firestore DPP progress
    const dppId = location.state?.dppId;
    const chapterId = location.state?.chapterId;
    if (user && user.uid !== "demo" && chapterId && dppId) {
      try {
        const { saveDppAttempt } = await import("../utils/firestoreDppDB");
        await saveDppAttempt(user.uid, chapterId, dppId, correct, questions.length);
      } catch (err) {
        console.error("Failed to save DPP progress:", err);
      }
    }

    setShowSubmitConfirm(false);
    setShowReport(true);
  };

  const handleClear = () => {
    setUserAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };

  const toggleBookmark = async (id: number) => {
    const isCurrentlyBookmarked = bookmarked[id];
    const question = questions.find(q => q.id === id);
    if (!question) return;

    setBookmarked((prev) => ({ ...prev, [id]: !isCurrentlyBookmarked }));

    if (user && user.uid !== "demo") {
      const bookmarkId = `${source}_${id}`;
      if (isCurrentlyBookmarked) {
        try {
          await removeBookmark(user.uid, bookmarkId);
        } catch (err) {
          console.error("Failed to remove bookmark:", err);
        }
      } else {
        try {
          await addBookmark(user.uid, {
            id: bookmarkId,
            questionId: id,
            subject: question.subject,
            chapter: question.chapter,
            difficulty: question.difficulty,
            text: question.text,
            options: question.options,
            correctAnswer: question.correctAnswer,
            solution: question.solution,
            source
          });
        } catch (err) {
          console.error("Failed to add bookmark:", err);
        }
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (showReport) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-900/10 dark:border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand to-blue-500"></div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-brand/30">
              <Trophy size={40} className="text-brand" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {isAssignmentMode ?"Assignment Completed!" :"Quiz Completed!"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Here's your performance report
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white/5 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-slate-900/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Correct
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-500">
                {dppScore.correct}
              </span>
            </div>

            {isChapterWisePYQ && dppScore.maxStreak >= 3 && (
              <div className="bg-white/5 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-slate-900/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Flame size={20} className="text-orange-500 fill-orange-500" />
                  </div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Max Streak
                  </span>
                </div>
                <span className="text-xl font-bold text-orange-500 flex items-center gap-1">
                  {dppScore.maxStreak % 2 === 0 ? dppScore.maxStreak - 1 : dppScore.maxStreak} 🔥
                </span>
              </div>
            )}

            <div className="bg-white/5 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-slate-900/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <XCircle size={20} className="text-rose-500" />
                </div>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Incorrect
                </span>
              </div>
              <span className="text-xl font-bold text-rose-500">
                {dppScore.incorrect}
              </span>
            </div>

            <div className="bg-white/5 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-slate-900/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <MinusCircle
                    size={20}
                    className="text-slate-500 dark:text-slate-400"
                  />
                </div>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Unattempted
                </span>
              </div>
              <span className="text-xl font-bold text-slate-500 dark:text-slate-400">
                {dppScore.unattempted}
              </span>
            </div>
          </div>

          <div className="bg-brand/10 border border-brand/20 rounded-2xl p-6 text-center mb-8">
            <p className="text-brand font-bold text-sm uppercase tracking-wider mb-1">
              Total Score
            </p>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {dppScore.totalScore}{""}
              <span className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                / {questions.length * 4}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Back to DPPs
              </button>
              <button
                onClick={() => {
                  setShowReport(false);
                  setIsReviewMode(true);
                  setCurrentIndex(0);
                }}
                className="flex-1 py-3.5 bg-brand text-slate-900 rounded-xl font-bold hover:bg-brand-light transition-colors shadow-lg shadow-brand/20"
              >
                Review Answers
              </button>
            </div>
            <button
              onClick={() => {
                setUserAnswers({});
                setQuestionStates({});
                setTimeSpent({});
                setOverallTime(0);
                setAttempts({});
                setCurrentIndex(0);
                setShowReport(false);
                setIsReviewMode(false);
                setShowSolution(false);
                setCorrectStreak(0);
                setStreakMilestone(null);
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              Reattempt Practice
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-slate-900/5 dark:border-white/5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => {
              if (!isSubmitted && !isReviewMode) {
                setShowExitConfirm(true);
              } else {
                navigate(-1);
              }
            }}
            className="p-1 md:p-2 -ml-1 md:-ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
          >
            <X size={24} />
          </button>
          <div className="font-bold text-xs sm:text-sm md:text-base flex flex-wrap items-center gap-2 md:gap-3">
            <span className="whitespace-nowrap">
              Question {currentIndex + 1}{""}
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                / {questions.length}
              </span>
            </span>
            {isChapterWisePYQ && correctStreak >= 2 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 md:gap-1.5 text-orange-500 bg-orange-500/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap border border-orange-500/20"
              >
                <Flame size={14} className="fill-orange-500 animate-pulse" />
                <span>{correctStreak} Streak</span>
              </motion.div>
            )}
            {isQuizActive && (
              <div className="flex items-center gap-1 md:gap-1.5 text-orange-400 bg-orange-400/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap">
                <span>{formatOverallTime()} left</span>
              </div>
            )}
            {!isQuizActive && !isReviewMode && (
              <div className="flex items-center gap-1 md:gap-1.5 text-blue-400 bg-blue-400/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap">
                <span>{isAssignmentMode ?"Total Time:" :"Quiz Time:"} {formatOverallTime()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setShowPalette(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand hover:bg-brand/10 rounded-full transition-colors"
            title="Question Palette"
          >
            <LayoutGrid size={20} />
          </button>
          {isQuizActive && (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="mr-2 px-3 py-1.5 bg-brand text-slate-900 rounded-lg text-sm font-bold hover:bg-brand-light transition-colors shadow-lg shadow-brand/20 hidden sm:block"
            >
              Submit
            </button>
          )}
          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`p-2 rounded-full transition-colors ${showScratchpad ?"text-brand bg-brand/10" :"text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            title="Scratchpad"
          >
            <PenTool size={20} />
          </button>
          <button
            onClick={() => toggleBookmark(currentQuestion.id)}
            className={`p-2 rounded-full transition-colors ${bookmarked[currentQuestion.id] ?"text-yellow-500 bg-yellow-500/10" :"text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            title="Bookmark"
          >
            <Bookmark
              size={20}
              fill={bookmarked[currentQuestion.id] ?"currentColor" :"none"}
            />
          </button>
          {/* Removed admin question edit button */}
          <button
            onClick={() => setShowQuestionReportModal(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
            title="Report"
          >
            <AlertTriangle size={20} />
          </button>
          <button
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden md:block"
            title="Menu"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Scratchpad Overlay */}
      <AnimatePresence>
        {showScratchpad && (
          <Scratchpad onClose={() => setShowScratchpad(false)} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col pb-32">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl p-5 md:p-6 mb-6"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-md">
              {currentQuestion.subject}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">
              {currentQuestion.chapter}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                currentQuestion.difficulty ==="Easy"
                  ?"text-emerald-400 bg-emerald-400/10"
                  : currentQuestion.difficulty ==="Medium"
                    ?"text-amber-400 bg-amber-400/10"
                    :"text-rose-400 bg-rose-400/10"
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-base md:text-lg font-medium leading-relaxed mb-6 break-words whitespace-pre-wrap">
            {currentQuestion.text}
          </h2>

          {/* Question Diagram/Image Attachment */}
          {currentQuestion.imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-900/10 dark:border-white/10 bg-slate-950/40 p-2 max-h-[300px] flex items-center justify-center cursor-zoom-in group relative shadow-inner">
              <img
                src={currentQuestion.imageUrl}
                alt="Question Diagram"
                className="max-h-[280px] max-w-full object-contain rounded-xl transition-transform group-hover:scale-[1.01] duration-300"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = selectedOption === index;
              const isCorrect = currentQuestion.correctAnswer === index;

              let optionClass ="bg-slate-50 dark:bg-slate-800 border-slate-900/10 dark:border-white/10 hover:border-brand/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/80";
              let icon = null;

              if (isSubmitted && !isQuizActive) {
                if (isCorrect) {
                  optionClass ="bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
                  icon = (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  );
                } else if (isSelected) {
                  optionClass ="bg-rose-500/10 border-rose-500/50 text-rose-400";
                  icon = <XCircle size={20} className="text-rose-500" />;
                } else {
                  optionClass ="bg-slate-50/50 dark:bg-slate-800/50 border-slate-900/5 dark:border-white/5 opacity-50";
                }
              } else if (isSelected) {
                optionClass ="bg-brand/10 border-brand text-brand";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={isSubmitted && !isQuizActive}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${optionClass}`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isSubmitted && !isQuizActive && isCorrect
                          ?"bg-emerald-500/20 text-emerald-500"
                          : isSubmitted &&
                              !isQuizActive &&
                              isSelected &&
                              !isCorrect
                            ?"bg-rose-500/20 text-rose-500"
                            : isSelected
                              ?"bg-brand text-slate-900"
                              :"bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium break-words whitespace-pre-wrap">
                      {option}
                    </span>
                  </div>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            {!isQuizActive && (
              <div className="flex flex-wrap gap-3">
                {!isSubmitted ? (
                  <>
                    <button
                      onClick={handleSubmit}
                      disabled={selectedOption === null}
                      className="flex-1 min-w-[120px] py-3 bg-brand text-slate-900 rounded-xl font-bold hover:bg-brand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand/20"
                    >
                      Submit Answer
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={selectedOption === null}
                      className="px-6 py-3 bg-slate-50 text-slate-600 dark:text-slate-300 border border-slate-900/5 dark:border-white/5 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="flex-1 py-3 bg-slate-50 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors"
                    >
                      {showSolution ?"Hide Solution" :"Show Solution"}
                    </button>
                    {questionStates[currentQuestion.id] ==="incorrect" && (
                      <button
                        onClick={() => {
                          setQuestionStates((prev) => {
                            const newStates = { ...prev };
                            delete newStates[currentQuestion.id];
                            return newStates;
                          });
                          setUserAnswers((prev) => {
                            const newAnswers = { ...prev };
                            delete newAnswers[currentQuestion.id];
                            return newAnswers;
                          });
                          setShowSolution(false);
                          setAttempts((prev) => ({
                            ...prev,
                            [currentQuestion.id]:
                              (prev[currentQuestion.id] || 0) + 1,
                          }));
                        }}
                        className="flex-1 py-3 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl font-bold hover:bg-amber-500/30 transition-colors"
                      >
                        Re-attempt
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
            
            {!isQuizActive && (
              <div className="flex gap-3 mt-2">
                 <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {currentIndex === questions.length - 1 ? (
                    <button
                      onClick={() => setShowSubmitConfirm(true)}
                      className="flex-[2] py-3 bg-brand text-slate-900 border border-brand/20 rounded-xl font-bold hover:bg-brand-light transition-colors shadow-lg shadow-brand/20"
                    >
                      Finish Assignment
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex-[2] py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Question
                    </button>
                  )}
              </div>
            )}
            {isQuizActive && (
              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
                >
                  Previous
                </button>
                <button
                  onClick={handleClear}
                  disabled={userAnswers[currentQuestion.id] === undefined}
                  className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="flex-[2] py-3 bg-brand text-slate-900 border border-brand/20 rounded-xl font-bold hover:bg-brand-light transition-colors shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
                  >
                    <span>Submit Quiz</span> <CheckCircle2 size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-[2] py-3 bg-brand text-slate-900 border border-brand/20 rounded-xl font-bold hover:bg-brand-light transition-colors shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
                  >
                    Save & Next
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Solution Section */}
        <AnimatePresence>
          {showSolution && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height:"auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-900/5 dark:border-white/5 rounded-2xl overflow-hidden"
            >
              <div className="flex border-b border-slate-900/5 dark:border-white/5">
                <button
                  onClick={() => setSolutionTab("official")}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${solutionTab ==="official" ?"text-brand border-b-2 border-brand bg-brand/5" :"text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                >
                  Official Solution
                </button>
                <button
                  onClick={() => setSolutionTab("community")}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${solutionTab ==="community" ?"text-brand border-b-2 border-brand bg-brand/5" :"text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                >
                  Community Solutions
                </button>
              </div>

              <div className="p-5 md:p-6">
                {solutionTab ==="official" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {currentQuestion.solution}
                    </div>

                    <div className="pt-6 border-t border-slate-900/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Was this solution helpful?
                      </span>
                      <div className="flex gap-2">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-900/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-sm font-bold">
                          <ThumbsUp size={16} /> Yes
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-900/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all text-sm font-bold">
                          <ThumbsDown size={16} /> No
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-400">
                        <User size={20} />
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
                              onChange={(e) =>
                                setNewSolutionText(e.target.value)
                              }
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
                                  (!newSolutionText.trim() &&
                                    !newSolutionImage) ||
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
                                      <BadgeCheck
                                        size={14}
                                        className="text-blue-400"
                                      />
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
                                      sol.userVote ==="up"
                                        ?"fill-current"
                                        :""
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
                                      sol.userVote ==="down"
                                        ?"fill-current"
                                        :""
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
                                            {user &&
                                              reply.authorId === user.uid && (
                                                <button
                                                  onClick={() =>
                                                    handleDeleteReply(
                                                      sol.id,
                                                      reply.id,
                                                    )
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
                                            if (e.key ==="Enter")
                                              handleAddReply(sol.id);
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
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Question Navigation Bar (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-900/5 dark:border-white/5 p-3 md:p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setShowPalette(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold transition-colors border border-slate-900/10 dark:border-white/10 shrink-0"
          >
            <LayoutGrid size={20} className="text-brand" />
            <span className="hidden sm:inline">All Questions</span>
          </button>

          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 md:justify-center px-2 py-1 mask-linear-fade">
            {questions.map((q, idx) => {
              const state = questionStates[q.id] ||"unvisited";
              const isCurrent = idx === currentIndex;
              const isBookmarked = bookmarked[q.id];

              let bgColor ="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-200";
              let borderColor ="border-slate-900/5 dark:border-white/5";

              if (state ==="correct") {
                bgColor ="bg-emerald-500/20 text-emerald-400";
                borderColor ="border-emerald-500/30";
              } else if (state ==="incorrect") {
                bgColor ="bg-rose-500/20 text-rose-400";
                borderColor ="border-rose-500/30";
              } else if (state ==="attempted") {
                bgColor ="bg-blue-500/20 text-blue-400";
                borderColor ="border-blue-500/30";
              }

              if (isCurrent) {
                borderColor ="border-brand ring-2 ring-brand/20";
                bgColor =
                  state ==="unvisited" ?"bg-brand/10 text-brand" : bgColor;
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full font-bold text-sm flex items-center justify-center transition-all shrink-0 border ${bgColor} ${borderColor}`}
                >
                  {idx + 1}
                  {isBookmarked && (
                    <div className="absolute -top-0 -right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-slate-900" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 md:px-4 md:py-2 bg-slate-50 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-900/5 dark:border-white/5 flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="p-2 md:px-4 md:py-2 bg-slate-50 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-900/5 dark:border-white/5 flex items-center gap-2"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PauseCircle size={32} className="text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {isQuizActive ?"Pause Quiz?" :"Pause Practice?"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isQuizActive ?"Are you sure you want to pause and exit? Your progress and timer will be paused." :"Are you sure you want to pause and exit? Your progress will be saved."}
                </p>

                <div className="mt-4 flex justify-center gap-4 text-sm">
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {Object.keys(userAnswers).length}
                    </span>{""}
                    / {questions.length} Attempted
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 bg-slate-50 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-brand" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {isAssignmentMode ?"Finish Assignment?" :"Submit Quiz?"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isAssignmentMode 
                    ?"Are you sure you want to finish the assignment and view your report?" 
                    :"Are you sure you want to submit your quiz? You won't be able to change your answers after submission."}
                </p>

                <div className="mt-4 flex justify-center gap-4 text-sm">
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {Object.keys(userAnswers).length}
                    </span>{""}
                    / {questions.length} Attempted
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 bg-slate-50 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDppSubmit}
                  className="flex-1 py-3 bg-brand text-slate-900 rounded-xl font-bold hover:bg-brand-light transition-colors shadow-lg shadow-brand/20"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Palette Modal */}
      <AnimatePresence>
        {showPalette && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y:"100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y:"100%" }}
              transition={{ type:"spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Question Palette
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Jump directly to any question
                  </p>
                </div>
                <button
                  onClick={() => setShowPalette(false)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 rounded-full transition-colors self-start"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Legends */}
              <div className="mb-6 flex flex-wrap gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-900/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-900/10 dark:border-white/10"></div>{""}
                  Unvisited
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/50">
                    <div className="w-full h-full text-blue-400 flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  </div>{""}
                  Attempted
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>{""}
                  Correct
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-500/50"></div>{""}
                  Incorrect
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-yellow-500">
                    <Bookmark
                      size={10}
                      className="text-slate-900 dark:text-white fill-slate-900"
                    />
                  </div>{""}
                  Bookmarked
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-3 overflow-y-auto p-1 pr-2 custom-scrollbar">
                {questions.map((q, idx) => {
                  const state = questionStates[q.id] ||"unvisited";
                  const isCurrent = idx === currentIndex;
                  const isBookmarked = bookmarked[q.id];

                  let bgColor ="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 border-slate-900/5 dark:border-white/5 hover:text-slate-900 dark:hover:text-white";
                  if (state ==="correct")
                    bgColor ="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30";
                  else if (state ==="incorrect")
                    bgColor ="bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30";
                  else if (state ==="attempted")
                    bgColor ="bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30";

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowPalette(false);
                      }}
                      className={`relative aspect-square rounded-full font-bold text-sm md:text-base flex items-center justify-center transition-all border ${bgColor} ${isCurrent ?"ring-4 ring-brand/30 border-brand text-slate-900 dark:text-white" :""} ${state ==="unvisited" && isCurrent ?"bg-brand text-slate-900 border-brand" :""}`}
                    >
                      {idx + 1}
                      {isBookmarked && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-sm">
                          <Bookmark
                            size={8}
                            className="text-slate-900 dark:text-white fill-slate-900"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Report Modal */}
      <AnimatePresence>
        {showQuestionReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertTriangle size={24} />
                  <h3 className="text-xl font-bold">Report Question</h3>
                </div>
                <button
                  onClick={() => {
                    setShowQuestionReportModal(false);
                    setReportIssueType("");
                    setReportComments("");
                  }}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">
                    What is the issue?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Typo in question",
                      "Wrong answer key",
                      "Bad solution",
                      "Other",
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setReportIssueType(type)}
                        className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                          reportIssueType === type
                            ? "bg-rose-500/10 border-rose-500 text-rose-500"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">
                    Additional Details
                  </label>
                  <textarea
                    rows={4}
                    value={reportComments}
                    onChange={(e) => setReportComments(e.target.value)}
                    placeholder="Describe the issue in detail so we can fix it..."
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionReportModal(false);
                      setReportIssueType("");
                      setReportComments("");
                    }}
                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!reportIssueType) {
                        toast.error("Please select an issue type.");
                        return;
                      }
                      try {
                        await addDoc(collection(db, "reports"), {
                          type: "question",
                          questionId: currentQuestion.id,
                          questionText: currentQuestion.text,
                          issueType: reportIssueType,
                          comments: reportComments,
                          reporterId: user?.uid || "anonymous",
                          createdAt: Date.now(),
                          status: "pending",
                        });
                        toast.success("Report submitted successfully. Thank you for your feedback!");
                        setShowQuestionReportModal(false);
                        setReportIssueType("");
                        setReportComments("");
                      } catch (err) {
                        console.error("Failed to submit report:", err);
                        toast.error("Failed to submit report. Please try again.");
                      }
                    }}
                    className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Streak Celebration Overlay */}
      <AnimatePresence>
        {streakMilestone !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900 border-2 border-orange-500/30 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-orange-500/10 text-center relative overflow-hidden"
            >
              {/* Decorative backgrounds */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
              
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "reverse"
                }}
                className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-500/30"
              >
                <Flame size={54} className="text-orange-500 fill-orange-500" />
              </motion.div>

              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">
                {streakMilestone === 3 && "🔥 ON FIRE!"}
                {streakMilestone === 5 && "⚡ UNSTOPPABLE!"}
                {streakMilestone === 7 && "🚀 GODLIKE!"}
                {streakMilestone === 9 && "👑 LEGENDARY!"}
                {streakMilestone > 9 && "🏆 INSANE!"}
              </h3>
              
              <p className="text-orange-400 font-bold text-lg mb-4">
                {streakMilestone} Correct Answers Row!
              </p>
              
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {streakMilestone === 3 && "You are building momentum! Keep up this amazing performance."}
                {streakMilestone === 5 && "Your concepts are solid. You're cruising through the questions!"}
                {streakMilestone === 7 && "Absolutely brilliant! You're operating at elite accuracy."}
                {streakMilestone === 9 && "Masterclass performance! You've completely mastered this topic."}
                {streakMilestone > 9 && "Simply legendary! There's no stopping you now."}
              </p>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6">
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block mb-1">Streak Bonus Points</span>
                <span className="text-2xl font-black text-white">+{Math.floor(streakMilestone / 2) * 5} PTS</span>
              </div>

              <button
                onClick={() => {
                  // Add bonus points in User Context / Firebase
                  if (user && user.uid !== "demo") {
                    saveActivity(0, 100, 0, Math.floor(streakMilestone / 2) * 5); // Add streak milestone points
                  }
                  setStreakMilestone(null);
                }}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-98"
              >
                Awesome!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Removed admin question edit modal */}
    </div>
  );
};

export default PracticeMCQScreen;
