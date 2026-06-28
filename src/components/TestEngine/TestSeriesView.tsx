import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Star,
  BookOpen,
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Coins,
  CreditCard,
  QrCode,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw,
  Play
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getTestReports, TestReport } from "../../utils/analysis";

interface TestSeriesViewProps {
  seriesId: string;
  onBack: () => void;
  onAttemptTest: (test: any) => void;
  onViewAnalysis: (test: any) => void;
}

interface SeriesInfo {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  coinsPrice: number;
  rating: number;
  reviewsCount: string;
  image: string;
  students: string;
  exam: string;
  description: string;
  features: string[];
  syllabus: {
    Physics: string[];
    Chemistry: string[];
    Mathematics?: string[];
    Biology?: string[];
  };
  tests: {
    id: string;
    name: string;
    duration: number; // minutes
    questionCount: number;
    subjects: string[];
    chapters: string[];
  }[];
}

const testSeriesDetails: Record<string, SeriesInfo> = {
  "1": {
    id: "1",
    title: "JEE Main 2024 Full Mock Series",
    subtitle: "15 Full Length Tests with detailed analysis",
    price: 499,
    originalPrice: 1999,
    coinsPrice: 499,
    rating: 4.8,
    reviewsCount: "2,420",
    image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop",
    students: "12k+",
    exam: "JEE Main",
    description: "Prepare for JEE Main 2024 with 15 elite full-syllabus mock tests designed by top educators. Every test simulates the exact NTA exam environment and provides comprehensive percentile predictions, time distribution analyses, and complete solutions.",
    features: [
      "15 Full Length NTA-pattern Tests",
      "All-India Percentile & Rank Predictor",
      "Detailed step-by-step video & text solutions",
      "Topic-wise strength & weakness analysis"
    ],
    syllabus: {
      Physics: ["Kinematics & Dynamics", "Laws of Motion", "Work, Power & Energy", "Rotational Motion", "Thermodynamics", "Electrostatics & Current Electricity", "Modern Physics"],
      Chemistry: ["Chemical Bonding", "Chemical Equilibrium", "Coordination Compounds", "General Organic Chemistry", "Carbonyl Compounds", "Thermodynamics & Kinetics"],
      Mathematics: ["Calculus & Integrals", "Coordinate Geometry", "Vectors & 3D Geometry", "Matrices & Determinants", "Sequence & Series", "Probability"]
    },
    tests: [
      {
        id: "ts-1-mock1",
        name: "JEE Main Full Mock Test 1",
        duration: 180,
        questionCount: 90,
        subjects: ["Physics", "Chemistry", "Mathematics"],
        chapters: []
      },
      {
        id: "ts-1-mock2",
        name: "JEE Main Full Mock Test 2",
        duration: 180,
        questionCount: 90,
        subjects: ["Physics", "Chemistry", "Mathematics"],
        chapters: []
      },
      {
        id: "ts-1-physics",
        name: "Physics Focus Syllabus Mock",
        duration: 60,
        questionCount: 30,
        subjects: ["Physics"],
        chapters: []
      },
      {
        id: "ts-1-chem",
        name: "Chemistry Focus Syllabus Mock",
        duration: 60,
        questionCount: 30,
        subjects: ["Chemistry"],
        chapters: []
      },
      {
        id: "ts-1-math",
        name: "Mathematics Focus Syllabus Mock",
        duration: 60,
        questionCount: 30,
        subjects: ["Mathematics"],
        chapters: []
      }
    ]
  },
  "2": {
    id: "2",
    title: "Chapter-wise PYQ Series (2019-2023)",
    subtitle: "Topic-wise sorted previous year questions",
    price: 299,
    originalPrice: 1199,
    coinsPrice: 299,
    rating: 4.9,
    reviewsCount: "4,850",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    students: "45k+",
    exam: "JEE Main",
    description: "Revise using real previous year questions from the last 5 years (2019-2023), sorted topic-wise. Perfect for tracking key questions and understanding exactly what concepts are most frequently tested in the main exam.",
    features: [
      "1,500+ High-Yield real exam questions",
      "Categorized by subjects and specific chapters",
      "Detailed explanation and shortcut tips for each question",
      "Interactive revision tracker & progress report"
    ],
    syllabus: {
      Physics: ["Mechanics", "Waves & Oscillations", "Electrodynamics", "Optics", "Modern Physics"],
      Chemistry: ["Physical Chemistry", "Inorganic Chemistry", "Organic Chemistry Basics", "Biomolecules & Polymers"],
      Mathematics: ["Algebra & Trigonometry", "Calculus", "Coordinate Geometry", "Vectors & 3D"]
    },
    tests: [
      {
        id: "ts-2-mech",
        name: "Mechanics PYQ Practice Set",
        duration: 60,
        questionCount: 25,
        subjects: ["Physics"],
        chapters: ["Kinematics", "Laws of Motion"]
      },
      {
        id: "ts-2-org",
        name: "Organic Chemistry PYQ Practice Set",
        duration: 60,
        questionCount: 25,
        subjects: ["Chemistry"],
        chapters: ["Organic Chemistry Basics"]
      },
      {
        id: "ts-2-calc",
        name: "Calculus PYQ Practice Set",
        duration: 60,
        questionCount: 25,
        subjects: ["Mathematics"],
        chapters: ["Continuity and Differentiability"]
      },
      {
        id: "ts-2-electro",
        name: "Electrostatics & Current PYQs",
        duration: 60,
        questionCount: 25,
        subjects: ["Physics"],
        chapters: ["Electrostatics", "Current Electricity"]
      }
    ]
  },
  "3": {
    id: "3",
    title: "Advanced Level Problem Set",
    subtitle: "Challenging problems for JEE Advanced prep",
    price: 599,
    originalPrice: 2499,
    coinsPrice: 599,
    rating: 4.7,
    reviewsCount: "1,110",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    students: "8k+",
    exam: "JEE Advanced",
    description: "Designed for high-scoring students targeting the IITs. Contains multi-correct, integer response, and paragraph-type questions that mirror the structural complexity of the JEE Advanced examination.",
    features: [
      "5 Advanced Integrated Mock Papers",
      "Multi-correct, Numerical & Match Matrix types",
      "Conceptual depth mapping and structural analysis",
      "Curated by senior IIT coaching directors"
    ],
    syllabus: {
      Physics: ["Rotational Mechanics", "Thermodynamics & Kinetic Theory", "Electromagnetic Induction", "Wave Optics & Modern Physics"],
      Chemistry: ["Coordination Compounds & Qualitative Analysis", "Reaction Mechanism in Organic Chemistry", "Thermodynamics & Ionic Equilibrium"],
      Mathematics: ["Differential Equations & Integrals", "Complex Numbers & Matrices", "Probability & Permutations"]
    },
    tests: [
      {
        id: "ts-3-advphy",
        name: "Advanced Physics Challenge",
        duration: 90,
        questionCount: 15,
        subjects: ["Physics"],
        chapters: []
      },
      {
        id: "ts-3-advchem",
        name: "Advanced Chemistry Challenge",
        duration: 90,
        questionCount: 15,
        subjects: ["Chemistry"],
        chapters: []
      },
      {
        id: "ts-3-advmath",
        name: "Advanced Mathematics Challenge",
        duration: 90,
        questionCount: 15,
        subjects: ["Mathematics"],
        chapters: []
      },
      {
        id: "ts-3-advmock",
        name: "Advanced Integrated Syllabus Mock",
        duration: 180,
        questionCount: 45,
        subjects: ["Physics", "Chemistry", "Mathematics"],
        chapters: []
      }
    ]
  }
};

const TestSeriesView: React.FC<TestSeriesViewProps> = ({
  seriesId,
  onBack,
  onAttemptTest,
  onViewAnalysis
}) => {
  const { user, pointsEarned, setPointsEarned, updateUserProfile } = useUser();
  const series = testSeriesDetails[seriesId] || testSeriesDetails["1"];

  const [activeTab, setActiveTab] = useState<"overview" | "tests">("overview");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "processing" | "success">("select");
  
  // Card Payment States
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // UPI States
  const [upiId, setUpiId] = useState("");
  
  // Local attempts state
  const [testReports, setTestReports] = useState<TestReport[]>([]);

  // Load purchase state and test reports
  useEffect(() => {
    // Load reports
    const reports = getTestReports();
    setTestReports(reports);

    // Load purchase state from localStorage & Firestore
    const checkPurchaseState = async () => {
      const localPurchased = localStorage.getItem(`purchased_series_${seriesId}`);
      if (localPurchased === "true") {
        setIsUnlocked(true);
        return;
      }

      if (user && user.uid !== "demo") {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const purchasedList = data.purchasedTestSeries || [];
            if (purchasedList.includes(seriesId)) {
              setIsUnlocked(true);
              localStorage.setItem(`purchased_series_${seriesId}`, "true");
            }
          }
        } catch (e) {
          console.error("Failed to fetch purchase status:", e);
        }
      }
    };

    checkPurchaseState();
  }, [seriesId, user]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.substring(0, 16);
    // Format spacing: XXXX XXXX XXXX XXXX
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      val = val.substring(0, 2) + "/" + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 3) val = val.substring(0, 3);
    setCardCvv(val);
  };

  const handleUnlock = async () => {
    setPaymentStep("processing");
    setLoadingPayment(true);

    // Simulated network processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Persist purchase
    setIsUnlocked(true);
    localStorage.setItem(`purchased_series_${seriesId}`, "true");

    if (user && user.uid !== "demo") {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        let purchasedList = [];
        if (userDoc.exists()) {
          purchasedList = userDoc.data().purchasedTestSeries || [];
        }
        if (!purchasedList.includes(seriesId)) {
          purchasedList.push(seriesId);
          await setDoc(userDocRef, { purchasedTestSeries: purchasedList }, { merge: true });
        }
      } catch (err) {
        console.error("Failed to save purchase to Firestore:", err);
      }
    }

    setLoadingPayment(false);
    setPaymentStep("success");
  };

  const closeCheckout = () => {
    setShowCheckoutModal(false);
    setPaymentStep("select");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setUpiId("");
  };

  // Helper to enrich test object for launch
  const handleLaunchTest = (test: any) => {
    const launchData = {
      ...test,
      exam: series.exam,
      status: "Not Attempted"
    };
    onAttemptTest(launchData);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-24">
      {/* Header Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={series.image}
          alt={series.title}
          className="w-full h-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Navigation / Actions on Banner */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="p-3 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 bg-brand/90 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow-lg shadow-brand/20">
              {series.exam}
            </span>
            {isUnlocked ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full">
                <Unlock size={12} /> Unlocked
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-slate-900/60 text-slate-300 border border-white/10 text-xs font-bold rounded-full backdrop-blur-md">
                <Lock size={12} /> Premium
              </span>
            )}
          </div>
        </div>

        {/* Course Info on Banner */}
        <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
            {series.title}
          </h1>
          <p className="text-sm md:text-base text-slate-300 font-medium max-w-2xl">
            {series.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Star size={14} fill="#eab308" className="text-yellow-500" />
              {series.rating} ({series.reviewsCount} reviews)
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>{series.students} enrolled students</span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Overview & Syllabus or Test Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all relative ${
                activeTab === "overview"
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Overview & Syllabus
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all relative flex items-center gap-2 ${
                activeTab === "tests"
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Mock Tests
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[11px] rounded-full">
                {series.tests.length}
              </span>
            </button>
          </div>

          {activeTab === "overview" ? (
            <div className="space-y-6">
              {/* Description */}
              <div className="p-6 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-3">About this Series</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {series.description}
                </p>
              </div>

              {/* Key Features */}
              <div className="p-6 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-brand" /> Why enroll in this Series?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {series.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 mt-0.5 shrink-0">
                        <CheckCircle size={12} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus Breakdown */}
              <div className="p-6 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-brand" /> Complete Syllabus Covered
                </h3>
                <div className="space-y-4">
                  {Object.entries(series.syllabus).map(([subject, topics]) => (
                    <div key={subject} className="border-b border-slate-100 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                      <h4 className="text-sm font-bold text-brand uppercase tracking-wider mb-2">
                        {subject}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {series.tests.map((test, index) => {
                const report = testReports.find((r) => r.testId === test.id);
                const isAttempted = !!report;

                return (
                  <div
                    key={test.id}
                    className="p-6 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand/10 border border-brand/20 text-brand rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-white leading-snug">
                          {test.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {test.duration} mins
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          <span>{test.questionCount} Questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center">
                      {!isUnlocked ? (
                        <button
                          onClick={() => setShowCheckoutModal(true)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                        >
                          <Lock size={12} /> Locked
                        </button>
                      ) : isAttempted ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
                            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                              Score
                            </div>
                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              {report.score} <span className="text-[10px] font-normal text-emerald-500/60">/ {test.questionCount * 4}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              // Re-create results structure expected by onViewAnalysis
                              const mockResults = {
                                name: test.name,
                                questions: Array(test.questionCount).fill(null).map((_, i) => ({ id: `q-${i}`, subject: test.subjects[0] || "Physics" })),
                                answers: {},
                                timeSpent: report.timeTaken,
                                score: report.score,
                                correct: report.correct,
                                wrong: report.wrong,
                                skipped: report.skipped,
                                total: report.total,
                              };
                              const enrichedTest = {
                                ...test,
                                status: "Attempted",
                                _storedResults: mockResults
                              };
                              onViewAnalysis(enrichedTest);
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
                          >
                            Analysis
                          </button>
                          <button
                            onClick={() => handleLaunchTest(test)}
                            className="px-4 py-2.5 bg-brand text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1 hover:opacity-90"
                          >
                            <RefreshCw size={12} /> Retake
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLaunchTest(test)}
                          className="px-5 py-2.5 bg-brand text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 shadow-md shadow-brand/10"
                        >
                          <Play size={12} fill="currentColor" /> Start Test
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side Card: Price, Buy and Test Series Badges */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between sticky top-24">
            {!isUnlocked ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{series.price}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{series.originalPrice}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {Math.round(((series.originalPrice - series.price) / series.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    One-time payment for lifetime access.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-4 bg-brand text-slate-955 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand/20 hover:opacity-95 active:scale-[0.99] transition-all"
                  >
                    Unlock Series Now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Successfully Enrolled</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
                    You have full access to all mock tests in this premium series.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("tests")}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  Start Practicing
                </button>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-700/50 my-6 pt-6 space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <Award className="text-brand shrink-0" size={16} />
                <span>All India Rank & Percentile Prediction</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <TrendingUp className="text-brand shrink-0" size={16} />
                <span>Personalized Analysis Dashboard</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <Calendar className="text-brand shrink-0" size={16} />
                <span>NTA 2024 Exam Aligned Syllabus</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              {/* Back / Close button */}
              {paymentStep !== "processing" && (
                <button
                  onClick={closeCheckout}
                  className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 z-10 transition-colors"
                >
                  <ArrowLeft size={16} className="rotate-45" />
                </button>
              )}

              {paymentStep === "select" && (
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="text-brand" size={20} /> Checkout Order
                  </h3>

                  {/* Order Summary */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-sm leading-snug">{series.title}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Syllabus Mock Series</p>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg text-slate-800 dark:text-white">
                        ₹{series.price}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Switcher */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`py-3.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === "card"
                          ? "bg-brand/10 border-brand text-brand font-bold"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500"
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[11px] font-bold">Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`py-3.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === "upi"
                          ? "bg-brand/10 border-brand text-brand font-bold"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500"
                      }`}
                    >
                      <QrCode size={18} />
                      <span className="text-[11px] font-bold">UPI</span>
                    </button>
                  </div>

                  {/* Card Section */}
                  {paymentMethod === "card" && (
                    <div className="space-y-6">
                      {/* Interactive Credit Card flipping */}
                      <div className="w-full h-44 md:h-48 relative mx-auto mb-4" style={{ perspective: "1000px" }}>
                        <motion.div
                          className="w-full h-full relative transition-all duration-700"
                          style={{ transformStyle: "preserve-3d" }}
                          animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                        >
                          {/* Card Front */}
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-brand text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg border border-white/10 overflow-hidden"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-x-12 -translate-y-12" />
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black tracking-widest text-white/70">MARKS PREP</span>
                              <div className="w-10 h-7 bg-amber-400/20 border border-amber-400/40 rounded-md flex items-center justify-center overflow-hidden">
                                <div className="w-4 h-full bg-amber-400/30 border-r border-amber-400/20" />
                              </div>
                            </div>
                            <div className="text-lg md:text-xl font-mono tracking-[0.18em] py-2">
                              {cardNumber || "•••• •••• •••• ••••"}
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="space-y-0.5">
                                <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Card Holder</div>
                                <div className="text-xs font-mono tracking-wider truncate max-w-[150px]">
                                  {cardName.toUpperCase() || "YOUR NAME"}
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Expires</div>
                                <div className="text-xs font-mono tracking-wider">{cardExpiry || "MM/YY"}</div>
                              </div>
                            </div>
                          </div>

                          {/* Card Back */}
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg border border-white/10 overflow-hidden"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          >
                            <div className="h-10 bg-slate-950 -mx-6 mt-1" />
                            <div className="space-y-2">
                              <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Signature Bar</div>
                              <div className="h-9 bg-white/20 rounded-md flex items-center justify-end px-3">
                                <span className="font-mono text-slate-800 bg-white px-2 py-0.5 rounded text-xs font-black tracking-wider">
                                  {cardCvv || "•••"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-white/40">
                              <span>This is a simulated secure transaction card.</span>
                              <span className="font-bold">MARKS</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Card Inputs */}
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 gap-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card Number</label>
                          <input
                            type="text"
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            onFocus={() => setIsCardFlipped(false)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-brand font-mono text-sm"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            onFocus={() => setIsCardFlipped(false)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-brand font-semibold text-sm"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              onFocus={() => setIsCardFlipped(false)}
                              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-brand font-mono text-sm"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CVV Code</label>
                            <input
                              type="password"
                              placeholder="123"
                              value={cardCvv}
                              onChange={handleCvvChange}
                              onFocus={() => setIsCardFlipped(true)}
                              onBlur={() => setIsCardFlipped(false)}
                              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-brand font-mono text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Section */}
                  {paymentMethod === "upi" && (
                    <div className="space-y-6 flex flex-col items-center">
                      {/* Pulse scanning QR Code */}
                      <div className="w-44 h-44 bg-slate-100 dark:bg-slate-800 rounded-3xl p-4 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 relative overflow-hidden group shadow-inner">
                        {/* Scanning green line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_#10b981] animate-bounce top-2" />
                        <div className="grid grid-cols-6 gap-1 w-full h-full opacity-80">
                          {Array.from({ length: 36 }).map((_, i) => {
                            const isMarker = i < 6 || i % 6 === 0 || i % 6 === 5 || i > 29 || (i >= 8 && i <= 10) || (i >= 14 && i <= 16);
                            return (
                              <div
                                key={i}
                                className={`rounded-sm transition-colors duration-500 ${
                                  isMarker || Math.random() > 0.45
                                    ? "bg-slate-900 dark:bg-white"
                                    : "bg-transparent"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">
                        Scan QR code with any UPI app to pay
                      </p>
                      
                      <div className="w-full border-t border-slate-100 dark:border-slate-800/50 pt-4 text-center">
                        <span className="text-xs font-bold text-slate-400">OR ENTER UPI ID</span>
                      </div>

                      <input
                        type="text"
                        placeholder="username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-brand font-semibold text-sm text-center"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={closeCheckout}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnlock}
                      disabled={
                        (paymentMethod === "card" && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) ||
                        (paymentMethod === "upi" && !upiId)
                      }
                      className="flex-[2] py-4 bg-brand text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-brand/20 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95"
                    >
                      Pay ₹{series.price}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === "processing" && (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mb-6" />
                  <h3 className="text-xl font-bold mb-2">Processing Secure Payment</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed animate-pulse">
                    Please do not close this window or refresh the page. Connecting to banking portal...
                  </p>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="p-10 text-center flex flex-col items-center">
                  {/* Rotating visual elements */}
                  <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10 relative">
                    <CheckCircle size={40} className="scale-110" />
                    <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
                    Welcome to the Elite club! Your purchased Test Series is fully unlocked.
                  </p>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl w-full text-left space-y-1.5 mb-8 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">TXN_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Unlocked Product</span>
                      <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{series.title}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeCheckout();
                      setActiveTab("tests");
                    }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    Go to Tests
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestSeriesView;
