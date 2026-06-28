import React, { useState, useEffect, useRef } from"react";
import { motion, AnimatePresence } from"motion/react";
import {
  User,
  Settings,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Star,
  ArrowLeft,
  CheckCircle2,
  Smartphone,
  Monitor,
  Globe,
  Trash2,
  X,
  Camera,
  BookOpen,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from"react-router-dom";
import {
  useUser,
  handleFirestoreError,
  OperationType,
} from"../context/UserContext";
import { db, auth } from"../firebase";
import { collection, query, getDocs } from"firebase/firestore";

const ExamUpdatesView = () => {
  const { field } = useUser();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const updates = [
    {
      title:"JEE Main 2026 Session 1 Registration",
      date:"Upcoming",
      label:"Important",
      isNew: true,
      target:"Engineering",
      details:"The National Testing Agency (NTA) will soon release the notification for JEE Main 2026 Session 1. Expected registration to start in November 2025. Keep your documents like Aadhaar, category certificate, and photographs ready.",
      link:"https://jeemain.nta.ac.in/",
    },
    {
      title:"CBSE Class 12 Syllabus Update",
      date:"2 days ago",
      label:"Syllabus",
      isNew: true,
      target:"Both",
      details:"CBSE has released the updated rationalized syllabus for the academic year 2025-26. Check the official website for subject-wise curriculum changes, marking schemes, and deleted topics.",
      link:"https://cbseacademic.nic.in/",
    },
    {
      title:"NEET UG 2025 Correction Window",
      date:"1 week ago",
      label:"Updates",
      isNew: false,
      target:"Medical",
      details:"The correction window for NEET UG 2025 application form is now open. Candidates can edit their details such as exam city preference, category, and uploaded documents for a limited time.",
      link:"https://neet.nta.nic.in/",
    },
    {
      title:"JEE Main Advanced Information Brochure",
      date:"2 weeks ago",
      label:"Important",
      isNew: false,
      target:"Engineering",
      details:"IIT Kanpur has released the information brochure for JEE Advanced 2025. Read through the eligibility criteria, changes in the syllabus (if any), and registration timeline.",
      link:"https://jeeadv.ac.in/",
    },
  ].filter(
    (u) =>
      u.target ==="Both" ||
      u.target === field ||
      (field !=="Medical" && field !=="Engineering"),
  );

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 mb-6 text-center">
        <AlertCircle size={32} className="text-purple-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Stay Updated
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get the latest notifications, syllabus changes, and form dates for
          your target exams right here.
        </p>
      </div>

      <div className="space-y-3">
        {updates.map((update, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <motion.div
              key={i}
              layout
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-900/5 dark:border-white/5 flex flex-col gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  {update.title}
                </h4>
                {update.isNew && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold tracking-wider uppercase shrink-0">
                    New
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {update.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {update.date}
                </span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height:"auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {update.details}
                      </p>

                      <a
                        href={update.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors"
                      >
                        <Globe size={16} />
                        Visit Official Website
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pointsEarned,
    userRank,
    streak,
    user,
    logout,
    theme,
    setTheme,
    notifications,
    setNotifications,
    profilePic,
    setProfilePic,
    activityHistory,
    dailyGoal,
    updateUserProfile,
  } = useUser();
  const [activeView, setActiveView] = useState<string | null>(
    location.state?.activeView || null,
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfilePicOptions, setShowProfilePicOptions] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheClearMessage, setCacheClearMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const todayForCal = new Date();
  const startDayOfWeek = new Date(todayForCal.getFullYear(), todayForCal.getMonth(), 1).getDay();

  const handleClearCache = async () => {
    setClearingCache(true);
    // Calculate actual cache size
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalSize += (localStorage.getItem(key) || "").length * 2; // UTF-16 = 2 bytes per char
      }
    }
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    // Clear app-specific localStorage keys
    const keysToKeep = ["theme", "userField", "dailyGoal"];
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    await new Promise((resolve) => setTimeout(resolve, 800));
    setClearingCache(false);
    setCacheClearMessage(`Cleared ${sizeMB} MB of local app cache successfully!`);
    setTimeout(() => {
      setCacheClearMessage(null);
    }, 3000);
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setDeletingAccount(true);
    await new Promise((resolve) => setTimeout(resolve, 2200));
    try {
      if (user && user.uid !=="demo") {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db,"users", user.uid));
        if (auth.currentUser) {
          await auth.currentUser.delete();
        }
      }
    } catch (err) {
      console.warn("Graceful deletion warning:", err);
    } finally {
      setDeletingAccount(false);
      await logout();
      navigate("/");
    }
  };

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
      // Consume state so it does not persist across back/forward navigation
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const AVATAR_SEEDS = ["Felix","Aneka","Mimi","Jack","Oliver","Sophie","Leo","Mia","Max","Luna","Charlie","Bella",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
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

          // Compress the image to JPEG with 0.7 quality to keep it well under 1MB
          const base64String = canvas.toDataURL("image/jpeg", 0.7);
          setProfilePic(base64String);
          setShowProfilePicOptions(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAvatar = (seed: string) => {
    const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
    setProfilePic(avatarUrl);
    setShowAvatarSelection(false);
    setShowProfilePicOptions(false);
  };

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      try {
        const q = query(collection(db, `users/${user.uid}/activity`));
        const querySnapshot = await getDocs(q);
        const activities: Record<string, any> = {};
        querySnapshot.forEach((doc) => {
          activities[doc.id] = doc.data();
        });

        const newActivityData = Array.from({ length: daysInMonth }).map(
          (_, i) => {
            const d = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const dayData = activities[dateStr];

            if (dayData) {
              let level = 0;
              if (dayData.questionsSolved >= dailyGoal)
                level = 4; // Goal completed
              else if (dayData.questionsSolved >= dailyGoal * 0.75) level = 3;
              else if (dayData.questionsSolved >= dailyGoal * 0.5) level = 2;
              else if (dayData.questionsSolved > 0) level = 1;

              return {
                day: d,
                level,
                questionsSolved: dayData.questionsSolved,
                accuracy: dayData.accuracy,
                timeSpent: dayData.timeSpent,
                pointsEarned: dayData.pointsEarned || 0,
                dateStr,
                goalCompleted: dayData.questionsSolved >= dailyGoal,
              };
            }

            return {
              day: d,
              level: 0,
              questionsSolved: 0,
              accuracy: 0,
              timeSpent: 0,
              pointsEarned: 0,
              dateStr,
              goalCompleted: false,
            };
          },
        );
        setActivityData(newActivityData);
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.GET,
          `users/${user.uid}/activity`,
        );
      }
    };

    fetchActivity();
  }, [user, dailyGoal]);

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name ||"Student Name",
    email: user?.email ||"student@example.com",
    phone:"",
    dob:"",
    gender:"Male",
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: (user as any).phone ||"",
        dob: (user as any).dob ||"",
        gender: (user as any).gender ||"Male",
      }));
      setSettings({
        targetExam: (user as any).targetExam ||"JEE Main",
        language: (user as any).language ||"English",
        videoQuality: (user as any).videoQuality ||"Auto",
      });
    }
  }, [user]);

  // Settings State
  const [settings, setSettings] = useState({
    targetExam:"JEE Main",
    language:"English",
    videoQuality:"Auto",
  });

  const menuItems = [
    {
      id:"personal",
      icon: <User size={20} />,
      label:"Personal Info",
      color:"text-blue-500",
    },
    {
      id:"exam_updates",
      icon: <BookOpen size={20} />,
      label:"Exam Updates",
      color:"text-purple-500",
    },
    {
      id:"notifications",
      icon: <Bell size={20} />,
      label:"Notifications",
      color:"text-orange-500",
    },
    {
      id:"settings",
      icon: <Settings size={20} />,
      label:"Settings",
      color:"text-slate-500 dark:text-slate-400",
    },
  ];

  const handleSave = async () => {
    if (activeView ==="personal") {
      await updateUserProfile({
        name: personalInfo.name,
        phone: personalInfo.phone,
        dob: personalInfo.dob,
        gender: personalInfo.gender,
      });
    } else if (activeView ==="settings") {
      await updateUserProfile({
        targetExam: settings.targetExam,
        language: settings.language,
        videoQuality: settings.videoQuality,
      });
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const renderView = () => {
    switch (activeView) {
      case"personal":
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-2">
                <div
                  className="w-24 h-24 rounded-full border-4 border-brand p-1 relative group cursor-pointer overflow-hidden"
                  onClick={() => setShowProfilePicOptions(true)}
                >
                  <img
                    src={
                      profilePic ||
                      `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || "user"}`
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera
                      size={24}
                      className="text-slate-900 dark:text-white"
                    />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap to change profile picture
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={personalInfo.name}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, name: e.target.value })
                }
                className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, email: e.target.value })
                }
                className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Phone
              </label>
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, phone: e.target.value })
                }
                className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={personalInfo.dob}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, dob: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={personalInfo.gender}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, gender: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors appearance-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full py-4 bg-brand text-slate-900 font-bold rounded-2xl mt-4 flex items-center justify-center gap-2"
            >
              {showSuccess ? <CheckCircle2 size={20} /> : null}
              {showSuccess ?"Saved Successfully" :"Save Changes"}
            </button>
          </div>
        );
      case"exam_updates":
        return <ExamUpdatesView />;
      case"notifications":
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  id:"push",
                  title:"Push Notifications",
                  desc:"Receive alerts on your device",
                },
                {
                  id:"emails",
                  title:"Email Updates",
                  desc:"Weekly progress reports",
                },
                {
                  id:"testReminders",
                  title:"Test Reminders",
                  desc:"Alerts before scheduled tests",
                },
                {
                  id:"newContent",
                  title:"New Content",
                  desc:"When new PYQs are added",
                },
                {
                  id:"marketing",
                  title:"Offers & Promotions",
                  desc:"Special discounts and offers",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-900/5 dark:border-white/5"
                >
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                  <div
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.id]:
                          !notifications[item.id as keyof typeof notifications],
                      })
                    }
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications[item.id as keyof typeof notifications] ?"bg-brand" :"bg-slate-100 dark:bg-slate-700"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-all ${notifications[item.id as keyof typeof notifications] ?"right-1" :"left-1"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="w-full py-4 bg-brand text-slate-900 font-bold rounded-2xl mt-4 flex items-center justify-center gap-2"
            >
              {showSuccess ? <CheckCircle2 size={20} /> : null}
              {showSuccess ?"Preferences Saved" :"Save Preferences"}
            </button>
          </div>
        );
      case"settings":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  App Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) =>
                    setTheme(e.target.value as"light" |"dark" |"system")
                  }
                  className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors appearance-none"
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Target Exam
                </label>
                <select
                  value={settings.targetExam}
                  onChange={(e) =>
                    setSettings({ ...settings, targetExam: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors appearance-none"
                >
                  <option>JEE Main</option>
                  <option>NEET</option>
                  <option>JEE Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors appearance-none"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Hinglish</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Video Quality
                </label>
                <select
                  value={settings.videoQuality}
                  onChange={(e) =>
                    setSettings({ ...settings, videoQuality: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-900/5 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-brand transition-colors appearance-none"
                >
                  <option>Auto</option>
                  <option>1080p</option>
                  <option>720p</option>
                  <option>480p</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 bg-brand text-slate-900 font-bold rounded-2xl mt-4 flex items-center justify-center gap-2"
            >
              {showSuccess ? <CheckCircle2 size={20} /> : null}
              {showSuccess ?"Preferences Saved" :"Save Preferences"}
            </button>

            <div className="pt-6 border-t border-slate-900/5 dark:border-white/5 space-y-4">
              <h3 className="font-bold text-lg text-rose-500">Danger Zone</h3>
              <button 
                onClick={handleClearCache}
                className="w-full py-4 bg-slate-50 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-900/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 transition-colors"
                id="clear-app-cache-btn"
              >
                Clear App Cache
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-4 bg-rose-500/10 text-rose-500 font-bold rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                id="delete-account-btn"
              >
                <Trash2 size={20} />
                Delete Account
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
      <AnimatePresence mode="wait">
        {activeView ? (
          <motion.div
            key="subview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-white dark:bg-slate-900"
          >
            <header className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-40">
              <button
                onClick={() => setActiveView(null)}
                className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-bold">
                {menuItems.find((m) => m.id === activeView)?.label}
              </h1>
            </header>
            <main className="px-6 pt-4">{renderView()}</main>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <header className="px-6 pt-12 pb-8 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div
                  className="w-24 h-24 rounded-full border-4 border-brand p-1 relative group cursor-pointer"
                  onClick={() => setShowProfilePicOptions(true)}
                >
                  <img
                    src={
                      profilePic ||
                      `https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || "user"}`
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera
                      size={24}
                      className="text-slate-900 dark:text-white"
                    />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand rounded-full flex items-center justify-center border-4 border-[#0f172a]">
                  <Star size={14} fill="white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">
                {user?.name ||"Student Name"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {user?.email ||"JEE 2026 Aspirant"}
              </p>

              <div className="mt-6 flex gap-4 w-full max-w-xs">
                <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-900/5 dark:border-white/5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Rank
                  </p>
                  <p className="text-lg font-bold text-brand">#{userRank}</p>
                </div>
                <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-900/5 dark:border-white/5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Points
                  </p>
                  <p className="text-lg font-bold text-emerald-500">
                    {pointsEarned}
                  </p>
                </div>
              </div>
            </header>

            <main className="px-6 space-y-6">
              {/* Activity Calendar */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-900/5 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                    Activity Map
                  </h3>
                  <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded-lg">
                    {streak} Day Streak! 🔥
                  </span>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-900/5 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Total Qs
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {activityData.reduce(
                        (acc, curr) => acc + curr.questionsSolved,
                        0,
                      )}
                    </p>
                  </div>
                  <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-900/5 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Avg Acc
                    </p>
                    <p className="text-xl font-black text-emerald-500">
                      {activityData.filter((d) => d.level > 0).length > 0
                        ? Math.round(
                            activityData.reduce(
                              (acc, curr) => acc + curr.accuracy,
                              0,
                            ) / activityData.filter((d) => d.level > 0).length,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-900/5 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Hours
                    </p>
                    <p className="text-xl font-black text-blue-500">
                      {Math.round(
                        activityData.reduce(
                          (acc, curr) => acc + curr.timeSpent,
                          0,
                        ) / 60,
                      )}
                      h
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {["S","M","T","W","T","F","S"].map((d, i) => (
                    <div
                      key={i}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`blank-${i}`} />
                  ))}
                  {activityData.map((data) => {
                    let colorClass = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500";
                    if (data.level === 1) colorClass = "bg-brand/10 text-brand";
                    if (data.level === 2) colorClass = "bg-brand/30 text-brand";
                    if (data.level === 3) colorClass = "bg-brand/70 text-slate-900";
                    if (data.level === 4) colorClass = "bg-brand text-slate-900";

                    return (
                      <button
                        key={data.day}
                        onClick={() =>
                          setSelectedDay(
                            selectedDay === data.day ? null : data.day,
                          )
                        }
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all relative ${colorClass} ${selectedDay === data.day ?"ring-2 ring-slate-900 dark:ring-white scale-110 z-10" :"hover:scale-105"}`}
                      >
                        {data.day}
                        {data.goalCompleted && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {selectedDay !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height:"auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-900/10 dark:border-white/10 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          Day {selectedDay} Activity
                        </h4>
                        <button
                          onClick={() => setSelectedDay(null)}
                          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {(() => {
                        const data = activityData.find(
                          (d) => d.day === selectedDay,
                        );
                        if (!data || data.level === 0) {
                          return (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              No activity recorded on this day.
                            </p>
                          );
                        }
                        return (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 dark:bg-slate-900/50 p-3 rounded-lg text-center">
                              <div className="text-lg font-black text-brand">
                                {data.questionsSolved}
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Qs Solved
                              </div>
                            </div>
                            <div className="bg-white/5 dark:bg-slate-900/50 p-3 rounded-lg text-center">
                              <div className="text-lg font-black text-emerald-500">
                                {data.accuracy}%
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Accuracy
                              </div>
                            </div>
                            <div className="bg-white/5 dark:bg-slate-900/50 p-3 rounded-lg text-center">
                              <div className="text-lg font-black text-blue-500">
                                {data.timeSpent}m
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Time
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-slate-800" />
                      <div className="w-4 h-4 rounded-sm bg-brand/10" />
                      <div className="w-4 h-4 rounded-sm bg-brand/30" />
                      <div className="w-4 h-4 rounded-sm bg-brand/70" />
                      <div className="w-4 h-4 rounded-sm bg-brand" />
                    </div>
                    <span>More</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span>Goal Completed</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-900/5 dark:border-white/5 overflow-hidden">
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${i !== menuItems.length - 1 ?"border-b border-slate-900/5 dark:border-white/5" :""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${item.color} opacity-80`}>
                        {item.icon}
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                  </button>
                ))}
              </div>

              <button
                onClick={async () => {
                  try {
                    await logout();
                    navigate("/");
                  } catch (err) {
                    console.error("Failed to log out", err);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 p-5 bg-rose-500/10 text-rose-500 rounded-2xl font-bold hover:bg-rose-500/20 transition-all mt-8"
              >
                <LogOut size={20} />
                Log Out
              </button>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Picture Options Modal */}
      <AnimatePresence>
        {showProfilePicOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 pb-8"
            onClick={() => setShowProfilePicOptions(false)}
          >
            <motion.div
              initial={{ y:"100%" }}
              animate={{ y: 0 }}
              exit={{ y:"100%" }}
              transition={{ type:"spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-slate-50 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-900/10 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-6">
                  Change Profile Picture
                </h3>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 rounded-2xl transition-colors text-slate-900 dark:text-white font-medium"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Camera size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Photo Gallery</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Upload a photo from your device
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowProfilePicOptions(false);
                    navigate("/app/avatar-editor");
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 rounded-2xl transition-colors text-slate-900 dark:text-white font-medium shadow-lg shadow-yellow-500/5"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-yellow-500 dark:text-yellow-400">Customize 3D Avatar</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Design your own custom Bitmoji-style avatar
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowProfilePicOptions(false);
                    setShowAvatarSelection(true);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-700 rounded-2xl transition-colors text-slate-900 dark:text-white font-medium"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <User size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Choose Preset Avatar</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Select a fun pre-made character
                    </div>
                  </div>
                </button>

                {profilePic && (
                  <button
                    onClick={() => {
                      setProfilePic(null);
                      setShowProfilePicOptions(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors text-rose-500 font-medium"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                      <Trash2 size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Remove Photo</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => setShowProfilePicOptions(false)}
                  className="w-full p-4 mt-2 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-50 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-900/10 dark:border-white/10 flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-900/10 dark:border-white/10 flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Choose Avatar
                </h3>
                <button
                  onClick={() => setShowAvatarSelection(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-3 gap-4">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => handleSelectAvatar(seed)}
                      className="aspect-square rounded-2xl bg-slate-100/50 dark:bg-slate-700/50 border-2 border-transparent hover:border-brand p-2 transition-all hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                      <img
                        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`}
                        alt={seed}
                        className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800"
                      />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {seed}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cache Clearing progress overlay */}
      <AnimatePresence>
        {clearingCache && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            id="cache-clearing-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-800 p-6 rounded-3xl overflow-hidden shadow-2xl border border-slate-900/10 dark:border-white/10 text-center flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand animate-pulse">
                <Settings className="animate-spin text-brand" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Clearing Cache Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Cleaning up study pools storage, media fragments and local state database...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cache Cleared success toast */}
      <AnimatePresence>
        {cacheClearMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:max-w-sm bg-emerald-500 text-white rounded-2xl p-4 shadow-xl z-[90] flex items-center gap-3 border border-emerald-400"
            id="cache-cleared-toast"
          >
            <CheckCircle2 size={24} className="shrink-0" />
            <div className="text-left">
              <div className="font-bold text-sm">Success</div>
              <div className="text-xs opacity-90">{cacheClearMessage}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            id="delete-account-confirm-modal"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-800 p-6 rounded-3xl overflow-hidden shadow-2xl border border-slate-900/10 dark:border-white/10"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 mx-auto flex items-center justify-center text-rose-500">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-lg font-black text-rose-500 dark:text-rose-400">
                  Delete Account Permanently?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you absolutely sure you want to completely erase your account? This will wipe your study records, DPP checkpoints, and lead to irreversible logout.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    id="cancel-delete-btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition-colors"
                    id="confirm-delete-btn"
                  >
                    Delete Irreversibly
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Deletion in Progress blocker */}
      <AnimatePresence>
        {deletingAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            id="account-deletion-progress-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-800 p-6 rounded-3xl overflow-hidden shadow-2xl border border-rose-500/20 text-center flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 animate-pulse">
                <Trash2 className="animate-spin text-rose-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-rose-500">
                Processing Termination Request
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlinking credentials, erasing Firestore state maps and terminating authorization session...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
