import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";

export enum OperationType {
  CREATE ="create",
  UPDATE ="update",
  DELETE ="delete",
  LIST ="list",
  GET ="get",
  WRITE ="write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface NotificationPrefs {
  push: boolean;
  emails: boolean;
  testReminders: boolean;
  newContent: boolean;
  marketing: boolean;
}

export interface ChapterProgress {
  [chapterId: string]: {
    completed: boolean;
    accuracy: number;
    score: number;
    questionsSolved: number;
  };
}

export interface DailyTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface AvatarConfig {
  seed: string;
  backgroundColor: string[];
  skinColor: string[];
  hairColor: string[];
  facialHairColor: string[];
  clothesColor: string[];
  eyes: string[];
  eyebrows: string[];
  mouth: string[];
  top: string[];
  accessories: string[];
  facialHair: string[];
  clothing: string[];
  clothingGraphic: string[];
}

interface UserContextType {
  dailyGoal: number;
  setDailyGoal: (goal: number) => void;
  currentQs: number;
  setCurrentQs: (qs: number | ((prev: number) => number)) => void;
  pointsEarned: number;
  setPointsEarned: (points: number | ((prev: number) => number)) => void;
  dailyPoints: number;
  setDailyPoints: (points: number | ((prev: number) => number)) => void;
  streak: number;
  setStreak: (streak: number) => void;
  userRank: number;
  user: {
    uid: string;
    email: string;
    name: string;
    role: string;
    instituteId?: string | null;
    examGroupId?: string | null;
    linkedStudentIds?: string[];
  } | null;
  loading: boolean;
  theme:"light" |"dark" |"system";
  setTheme: (theme:"light" |"dark" |"system") => void;
  notifications: NotificationPrefs;
  setNotifications: (prefs: NotificationPrefs) => void;
  profilePic: string | null;
  setProfilePic: (url: string | null) => void;
  avatarConfig: AvatarConfig | null;
  setAvatarConfig: (config: AvatarConfig | null) => void;
  chapterProgress: ChapterProgress;
  setChapterProgress: (progress: ChapterProgress) => void;
  activityHistory: string[];
  tasks: DailyTask[];
  setTasks: (tasks: DailyTask[]) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, chosenRole?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  loginAnonymously: (asRole?: string) => Promise<void>;

  logout: () => Promise<void>;
  saveActivity: (
    questionsSolved: number,
    accuracy: number,
    timeSpent: number,
    points: number,
    chapterId?: string,
    isCorrect?: boolean,
    isReattempt?: boolean,
    wasPreviouslyCorrect?: boolean,
    dppTotalQuestions?: number,
    dppCorrectQuestions?: number,
  ) => Promise<void>;
  recordQuestionAttempt: (
    questionId: string,
    isCorrect: boolean,
    timeSpent: number,
    chapterId?: string,
  ) => Promise<{ points: number; attemptNumber: number }>;
  getQuestionAttemptsToday: (questionId: string) => boolean[];
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number;
  updateUserProfile: (
    data: Partial<{
      theme: string;
      notifications: NotificationPrefs;
      profilePic: string | null;
      avatarConfig: AvatarConfig | null;
      dailyGoal: number;
      dailyTasks: DailyTask[];
      tasksDate: string;
      field: string;
      name: string;
      email: string;
      phone: string;
      dob: string;
      gender: string;
      targetExam: string;
      language: string;
      videoQuality: string;
      onboarded: boolean;
    }>,
  ) => Promise<void>;
  field: string;
  setField: (field: string) => void;
  onboarded: boolean;
  setOnboarded: (onboarded: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dailyGoal, setDailyGoalLocal] = useState(() => {
    const saved = localStorage.getItem("dailyGoal");
    return saved ? parseInt(saved) : 50;
  });
  const [field, setFieldState] = useState(() => {
    const saved = localStorage.getItem("userField");
    return saved ? saved :"Engineering";
  });
  const [onboarded, setOnboardedState] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem("dailyGoal", dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("userField", field);
  }, [field]);

  const [tasks, setTasksState] = useState<DailyTask[]>([]);

  const setDailyGoal = (goal: number) => {
    setDailyGoalLocal(goal);
    updateUserProfile({ dailyGoal: goal });
  };

  const setField = (newField: string) => {
    setFieldState(newField);
    updateUserProfile({ field: newField });
  };

  const setTasks = (newTasks: DailyTask[]) => {
    setTasksState(newTasks);
    const today = new Date().toISOString().split("T")[0];
    updateUserProfile({ dailyTasks: newTasks, tasksDate: today });
  };

  const [currentQs, setCurrentQs] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userRank, setUserRank] = useState(1000);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const [todayAttemptsState, setTodayAttemptsState] = useState<Record<string, boolean[]>>(() => {
    const saved = localStorage.getItem("mark_daily_attempts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().split("T")[0];
        if (parsed.date === todayStr) {
          return parsed.attempts || {};
        }
      } catch (e) {
        console.error("Error parsing daily attempts from localStorage:", e);
      }
    }
    return {};
  });

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem("mark_daily_attempts", JSON.stringify({
      date: todayStr,
      attempts: todayAttemptsState,
    }));
  }, [todayAttemptsState]);

  const [user, setUser] = useState<{
    uid: string;
    email: string;
    name: string;
    role: string;
    instituteId?: string | null;
    examGroupId?: string | null;
    linkedStudentIds?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<"light" |"dark" |"system">(() => {
    const saved = localStorage.getItem("theme");
    if (saved ==="light" || saved ==="dark" || saved ==="system")
      return saved;
    return"system";
  });
  const [notifications, setNotificationsState] = useState<NotificationPrefs>({
    push: true,
    emails: true,
    testReminders: true,
    newContent: true,
    marketing: false,
  });
  const [profilePic, setProfilePicState] = useState<string | null>(null);
  const [avatarConfig, setAvatarConfigState] = useState<AvatarConfig | null>(
    null,
  );
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress>({});
  const [activityHistory, setActivityHistory] = useState<string[]>([]);

  useEffect(() => {
    // Check for redirect result on mount to complete login after redirection
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const session_id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("mark_session_id", session_id);
        await setDoc(doc(db, "users", result.user.uid), { sessionId: session_id }, { merge: true });
      }
    }).catch((error) => {
      console.error("Error with redirect login:", error);
    });
  }, []);

  const sendPushNotification = useCallback(
    (title: string, body: string) => {
      if (
        notifications.push &&"Notification" in window &&
        Notification.permission ==="granted"
      ) {
        new Notification(title, { body, icon:"/vite.svg" });
      }
    },
    [notifications.push],
  );

  const [goalNotified, setGoalNotified] = useState(false);

  useEffect(() => {
    if (currentQs >= dailyGoal && currentQs > 0 && !goalNotified) {
      sendPushNotification("Daily Goal Reached! 🎉",
        `Awesome job! You've solved ${currentQs} questions today.`,
      );
      setGoalNotified(true);
    } else if (currentQs < dailyGoal) {
      setGoalNotified(false);
    }
  }, [currentQs, dailyGoal, goalNotified, sendPushNotification]);

  useEffect(() => {
    if (user && streak > 0) {
      const streakNotified = sessionStorage.getItem("streakNotified");
      if (!streakNotified) {
        sendPushNotification("Keep it up! 🔥",
          `You're on a ${streak}-day study streak!`,
        );
        sessionStorage.setItem("streakNotified","true");
      }
    }
  }, [user, streak, sendPushNotification]);

  useEffect(() => {
    if (user) {
      const testNotified = sessionStorage.getItem("testNotified");
      if (!testNotified) {
        setTimeout(() => {
          sendPushNotification("Upcoming Test Reminder 📝","Your JEE Mock Test starts in 2 hours. Get ready!",
          );
        }, 5000);
        sessionStorage.setItem("testNotified","true");
      }
    }
  }, [user, sendPushNotification]);

  const updateUserProfile = async (
    data: Partial<{
      theme: string;
      notifications: NotificationPrefs;
      profilePic: string | null;
      avatarConfig: AvatarConfig | null;
      dailyGoal: number;
      dailyTasks: DailyTask[];
      tasksDate: string;
      field: string;
      name: string;
      email: string;
      phone: string;
      dob: string;
      gender: string;
      targetExam: string;
      language: string;
      videoQuality: string;
      onboarded: boolean;
    }>,
  ) => {
    if (!user) return;
    try {
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }
      // Note: updating email would require re-auth and updateEmail(), skip for now or implement if requested.
      
      await setDoc(doc(db,"users", user.uid), data, { merge: true });
      if (data.profilePic !== undefined || data.name !== undefined) {
        const publicUpdates: any = {};
        if (data.profilePic !== undefined) publicUpdates.profilePic = data.profilePic;
        if (data.name !== undefined) publicUpdates.name = data.name;
        
        await setDoc(
          doc(db,"users_public", user.uid),
          publicUpdates,
          { merge: true },
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const setTheme = (newTheme:"light" |"dark" |"system") => {
    setThemeState(newTheme);
    updateUserProfile({ theme: newTheme });
  };

  const setNotifications = async (prefs: NotificationPrefs) => {
    setNotificationsState(prefs);
    updateUserProfile({ notifications: prefs });

    if (prefs.push &&"Notification" in window) {
      if (
        Notification.permission !=="granted" &&
        Notification.permission !=="denied"
      ) {
        await Notification.requestPermission();
      }
    }
  };

  const setProfilePic = (url: string | null) => {
    setProfilePicState(url);
    updateUserProfile({ profilePic: url });
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    root.classList.remove("light","dark");

    if (theme ==="system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ?"dark"
        :"light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme ==="system") {
        const root = window.document.documentElement;
        root.classList.remove("light","dark");
        root.classList.add(mediaQuery.matches ?"dark" :"light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    // Test connection
    const testConnection = async () => {
      try {
        await getDoc(doc(db,"test","connection"));
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("the client is offline")
        ) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    let unsubDoc: (() => void) | null = null;
    let unsubActivity: (() => void) | null = null;
    let unsubHistory: (() => void) | null = null;
    let unsubAttempts: (() => void) | null = null;

    const cleanupListeners = () => {
      if (unsubDoc) unsubDoc();
      if (unsubActivity) unsubActivity();
      if (unsubHistory) unsubHistory();
      if (unsubAttempts) unsubAttempts();
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      cleanupListeners();

      // Removed demo admin auto-login

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let userDocSnap;
          try {
            userDocSnap = await getDoc(userDocRef);
          } catch (docErr) {
            console.warn("Could not get user doc from Firestore:", docErr);
          }

          const guestRoleOverride = firebaseUser.isAnonymous ? (localStorage.getItem("eduai_guest_role") || "student") : null;
          let currentRole = guestRoleOverride || "user";
          let currentName = firebaseUser.displayName || (firebaseUser.isAnonymous ? (guestRoleOverride === "admin" ? "Guest Admin" : "Guest Student") : "Student");
          let currentEmail = firebaseUser.email || (firebaseUser.isAnonymous ? "guest@eduai.app" : "no-email@example.com");

          if (!userDocSnap || !userDocSnap.exists()) {
            const localSessionId = localStorage.getItem("mark_session_id") || Math.random().toString(36).substring(2) + Date.now().toString(36);
            if (!localStorage.getItem("mark_session_id")) {
              localStorage.setItem("mark_session_id", localSessionId);
            }
            let invite: import("../services/invitesDB").Invite | null = null;
            try {
              const { consumeInviteForEmail } = await import("../services/invitesDB");
              invite = await consumeInviteForEmail(firebaseUser.email || "");
            } catch {
              // No invite system reachable yet
            }
            currentRole = guestRoleOverride || invite?.role || "user";
            const newUser = {
              uid: firebaseUser.uid,
              email: currentEmail,
              name: currentName,
              rank: 1000,
              points: 0,
              streak: 0,
              role: currentRole,
              instituteId: invite?.instituteId || null,
              examGroupId: invite?.examGroupId || null,
              linkedStudentIds: invite?.linkedStudentIds || [],
              onboarded: false,
              sessionId: localSessionId,
            };
            try {
              await setDoc(userDocRef, newUser);
              await setDoc(doc(db, "users_public", firebaseUser.uid), {
                uid: firebaseUser.uid,
                name: newUser.name,
                points: newUser.points,
                rank: newUser.rank,
              });
            } catch (createErr) {
              console.warn("Could not write new user doc to Firestore:", createErr);
            }

            setUser({
              uid: newUser.uid,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              instituteId: newUser.instituteId,
              examGroupId: newUser.examGroupId,
              linkedStudentIds: newUser.linkedStudentIds,
            });
            setLoading(false);
          } else {
            const data = userDocSnap.data();
            currentRole = guestRoleOverride || data.role || "user";
            currentName = data.name || currentName;
            currentEmail = data.email || currentEmail;

            // Single login single device check
            if (!firebaseUser.isAnonymous) {
              const localSessionId = localStorage.getItem("mark_session_id");
              if (data.sessionId) {
                if (localSessionId && data.sessionId !== localSessionId) {
                  localStorage.removeItem("mark_session_id");
                  await signOut(auth);
                  setUser(null);
                  setLoading(false);
                  toast.error("You have been logged out because another device logged into this account.");
                  return;
                } else if (!localSessionId) {
                  localStorage.setItem("mark_session_id", data.sessionId);
                }
              } else {
                const newSessionId = localSessionId || Math.random().toString(36).substring(2) + Date.now().toString(36);
                if (!localSessionId) {
                  localStorage.setItem("mark_session_id", newSessionId);
                }
                try {
                  await setDoc(userDocRef, { sessionId: newSessionId }, { merge: true });
                } catch (sessErr) {
                  console.warn("Could not save session ID to Firestore:", sessErr);
                }
              }
            }

            const todayStr = new Date().toISOString().split("T")[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (
              data.streak > 0 &&
              data.lastCompletedDate !== todayStr &&
              data.lastCompletedDate !== yesterdayStr
            ) {
              // Streak broken
              try {
                await setDoc(userDocRef, { streak: 0 }, { merge: true });
              } catch (stkErr) {
                console.warn("Could not reset streak:", stkErr);
              }
            }

            setUser({
              uid: data.uid || firebaseUser.uid,
              email: currentEmail,
              name: currentName,
              role: currentRole,
              instituteId: data.instituteId || null,
              examGroupId: data.examGroupId || null,
              linkedStudentIds: data.linkedStudentIds || [],
            });
            setPointsEarned(data.points || 0);
            setStreak(data.streak || 0);
            setUserRank(data.rank !== undefined ? data.rank : 1000);
            setAccuracy(data.accuracy || 0);
            setTotalAttempts(data.totalAttempts || 0);
            setTotalCorrect(data.totalCorrect || 0);
            if (data.theme) setThemeState(data.theme);
            if (data.notifications) setNotificationsState(data.notifications);
            if (data.profilePic) setProfilePicState(data.profilePic);
            if (data.chapterProgress) setChapterProgress(data.chapterProgress);
            if (data.dailyGoal) setDailyGoalLocal(data.dailyGoal);
            if (data.field) setFieldState(data.field);
            setOnboardedState(data.onboarded ?? true);
            setLoading(false);
          }

          // Listen to user document changes
          unsubDoc = onSnapshot(
            userDocRef,
            async (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();

                // Single login single device check
                if (firebaseUser && !firebaseUser.isAnonymous) {
                  const localSessionId = localStorage.getItem("mark_session_id");
                  if (data.sessionId) {
                    if (localSessionId && data.sessionId !== localSessionId) {
                      localStorage.removeItem("mark_session_id");
                      cleanupListeners();
                      await signOut(auth);
                      setUser(null);
                      toast.error("You have been logged out because another device logged into this account.");
                      return;
                    } else if (!localSessionId) {
                      localStorage.setItem("mark_session_id", data.sessionId);
                    }
                  } else {
                    const newSessionId = localSessionId || Math.random().toString(36).substring(2) + Date.now().toString(36);
                    if (!localSessionId) {
                      localStorage.setItem("mark_session_id", newSessionId);
                    }
                    await setDoc(userDocRef, { sessionId: newSessionId }, { merge: true });
                  }
                }

                setUser({
                  uid: data.uid,
                  email: data.email,
                  name: data.name,
                  role: data.role || "user",
                  instituteId: data.instituteId || null,
                  examGroupId: data.examGroupId || null,
                  linkedStudentIds: data.linkedStudentIds || [],
                });
                setPointsEarned(data.points || 0);
                setStreak(data.streak || 0);
                setUserRank(data.rank || 1000);
                setAccuracy(data.accuracy || 0);
                setTotalAttempts(data.totalAttempts || 0);
                setTotalCorrect(data.totalCorrect || 0);
                if (data.theme) setThemeState(data.theme);
                if (data.notifications)
                  setNotificationsState(data.notifications);
                if (data.profilePic) setProfilePicState(data.profilePic);
                if (data.chapterProgress)
                  setChapterProgress(data.chapterProgress);
                if (data.dailyGoal) setDailyGoalLocal(data.dailyGoal);
                if (data.field) setFieldState(data.field);
                setOnboardedState(data.onboarded ?? true);

                const todayStr = new Date().toISOString().split("T")[0];
                if (data.tasksDate === todayStr && data.dailyTasks) {
                  setTasksState(data.dailyTasks);
                } else {
                  setTasksState([]); // Reset tasks for a new day
                }
              }
            },
            (error) => {
              console.warn("User doc snapshot error:", error);
            },
          );

          // Fetch today's activity
          const today = new Date();
          const dateStr = today.toISOString().split("T")[0];
          const activityRef = doc(
            db,
            `users/${firebaseUser.uid}/activity`,
            dateStr,
          );
          unsubActivity = onSnapshot(
            activityRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setCurrentQs(data.questionsSolved || 0);
                setDailyPoints(data.pointsEarned || 0);
              } else {
                setCurrentQs(0);
                setDailyPoints(0);
              }
            },
            (error) => {
              console.warn("Activity snapshot error:", error);
            },
          );

          // Fetch today's question attempts
          const attemptsRef = doc(
            db,
            `users/${firebaseUser.uid}/attempts`,
            dateStr,
          );
          unsubAttempts = onSnapshot(
            attemptsRef,
            (docSnap) => {
              if (docSnap.exists()) {
                setTodayAttemptsState(docSnap.data().attempts || {});
              }
            },
            (error) => {
              console.warn("Error listening to attempts:", error);
            }
          );

          // Fetch activity history for the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

          try {
            const { collection, query, where } =
              await import("firebase/firestore");
            const activityQuery = query(
              collection(db, `users/${firebaseUser.uid}/activity`),
              where("date", ">=", thirtyDaysAgoStr),
            );

            unsubHistory = onSnapshot(
              activityQuery,
              (snapshot) => {
                const history: string[] = [];
                snapshot.forEach((doc) => {
                  const data = doc.data();
                  if (data.questionsSolved > 0) {
                    history.push(data.date);
                  }
                });
                setActivityHistory(history);
              },
              (error) => {
                console.warn("Activity history snapshot error:", error);
              },
            );
          } catch (histErr) {
            console.warn("Could not query activity history:", histErr);
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data, setting fallback authenticated user:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || (firebaseUser.isAnonymous ? "guest@eduai.app" : "student@eduai.app"),
            name: firebaseUser.displayName || (firebaseUser.isAnonymous ? "Guest Student" : "Student"),
            role: "user",
            instituteId: null,
            examGroupId: null,
            linkedStudentIds: [],
          });
          setLoading(false);
        }
      } else {
        if (localStorage.getItem("eduai_guest_mode") === "true") {
          const guestUid = localStorage.getItem("eduai_guest_uid") || "guest_demo";
          setUser({
            uid: guestUid,
            email: "guest@eduai.app",
            name: "Guest Student",
            role: "user",
            instituteId: null,
            examGroupId: null,
            linkedStudentIds: [],
          });
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      cleanupListeners();
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    try {
      await signInWithPopup(auth, provider);
      const session_id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("mark_session_id", session_id);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/network-request-failed" ||
        error.code === "auth/internal-error"
      ) {
        console.log("Falling back to signInWithRedirect due to popup restrictions...");
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      const session_id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("mark_session_id", session_id);
    } catch (error: any) {
      if (error.code === "auth/operation-not-allowed") {
        throw new Error("Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.",
        );
      }
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, chosenRole: string = "student") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass,
      );
      await updateProfile(userCredential.user, { displayName: name });

      const session_id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("mark_session_id", session_id);

      // Create user doc immediately to avoid race condition with onAuthStateChanged
      const userDocRef = doc(db, "users", userCredential.user.uid);
      // Try the server-verified assignRole Cloud Function first (deployed).
      // Falls back to client-side invite consumption if Functions not yet deployed.
      let roleFields = { role: chosenRole, instituteId: null as string | null, examGroupId: null as string | null, linkedStudentIds: [] as string[] };
      try {
        const { httpsCallable } = await import("firebase/functions");
        const { functions } = await import("../firebase");
        const assignRole = httpsCallable(functions, "assignRole");
        const result = await assignRole({}) as any;
        if (result.data?.role) roleFields = { role: result.data.role, instituteId: result.data.instituteId || null, examGroupId: result.data.examGroupId || null, linkedStudentIds: result.data.linkedStudentIds || [] };
      } catch {
        try {
          const { consumeInviteForEmail } = await import("../services/invitesDB");
          const invite = await consumeInviteForEmail(email);
          if (invite) roleFields = { role: invite.role, instituteId: invite.instituteId, examGroupId: invite.examGroupId, linkedStudentIds: invite.linkedStudentIds };
        } catch { /* offline or no invite — keeps chosenRole */ }
      }
      const newUser = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        rank: 1000,
        points: 0,
        streak: 0,
        ...roleFields,
        onboarded: false,
        sessionId: session_id,
      };
      await setDoc(userDocRef, newUser);
      await setDoc(doc(db, "users_public", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        points: 0,
        rank: 1000,
      });
    } catch (error: any) {
      if (error.code === "auth/operation-not-allowed") {
        throw new Error("Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.",
        );
      }
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email", error);
      throw error;
    }
  };

  const loginAnonymously = async (asRole: string = "student") => {
    localStorage.setItem("eduai_guest_role", asRole);
    try {
      await signInAnonymously(auth);
      localStorage.removeItem("eduai_guest_mode");
      localStorage.removeItem("eduai_guest_uid");
    } catch (error: any) {
      if (
        error.code === "auth/admin-restricted-operation" ||
        error.code === "auth/operation-not-allowed" ||
        error.code === "auth/configuration-not-found"
      ) {
        console.warn("Firebase Anonymous Auth restricted; activating local Guest session...");
        const guestUid = "guest_" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem("eduai_guest_mode", "true");
        localStorage.setItem("eduai_guest_uid", guestUid);
        setUser({
          uid: guestUid,
          email: "guest@eduai.app",
          name: asRole === "admin" ? "Guest Admin" : asRole === "teacher" ? "Guest Teacher" : "Guest Student",
          role: asRole,
          instituteId: null,
          examGroupId: null,
          linkedStudentIds: [],
        });
        setLoading(false);
        return;
      }
      console.error("Error signing in anonymously:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("mark_session_id");
      localStorage.removeItem("eduai_guest_mode");
      localStorage.removeItem("eduai_guest_uid");
      localStorage.removeItem("eduai_guest_role");
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
      setUser(null);
    }
  };

  const saveActivity = async (
    questionsSolved: number,
    accuracy: number,
    timeSpent: number,
    points: number,
    chapterId?: string,
    isCorrect?: boolean,
    isReattempt?: boolean,
    wasPreviouslyCorrect?: boolean,
    dppTotalQuestions?: number,
    dppCorrectQuestions?: number,
  ) => {
    if (!user) return;

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    try {
      const activityRef = doc(db, `users/${user.uid}/activity`, dateStr);
      const activityDoc = await getDoc(activityRef);

      let prevQs = 0;
      let newQs = questionsSolved;

      if (activityDoc.exists()) {
        const data = activityDoc.data();
        prevQs = data.questionsSolved || 0;
        const prevAcc = data.accuracy || 0;
        const prevTime = data.timeSpent || 0;
        const prevPoints = data.pointsEarned || 0;

        newQs = prevQs + questionsSolved;
        const newAcc =
          newQs === 0
            ? 0
            : Math.round(
                (prevAcc * prevQs + accuracy * questionsSolved) / newQs,
              );

        await setDoc(
          activityRef,
          {
            userId: user.uid,
            date: dateStr,
            questionsSolved: newQs,
            accuracy: newAcc,
            timeSpent: prevTime + timeSpent,
            pointsEarned: prevPoints + points,
          },
          { merge: true },
        );
      } else {
        await setDoc(activityRef, {
          userId: user.uid,
          date: dateStr,
          questionsSolved,
          accuracy,
          timeSpent,
          pointsEarned: points,
        });
      }

      // Update user points and chapter progress
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newPoints = (userData.points || 0) + points;

        let attemptsIncrement = 0;
        let correctIncrement = 0;

        if (dppTotalQuestions !== undefined && dppCorrectQuestions !== undefined) {
          attemptsIncrement = dppTotalQuestions;
          correctIncrement = dppCorrectQuestions;
        } else if (isCorrect !== undefined) {
          if (!isReattempt) {
            attemptsIncrement = 1;
            correctIncrement = isCorrect ? 1 : 0;
          }
        }

        const newAttempts = (userData.totalAttempts || 0) + attemptsIncrement;
        const newCorrect = (userData.totalCorrect || 0) + correctIncrement;
        const newAccuracy = newAttempts > 0 ? Math.round((newCorrect / newAttempts) * 100) : 0;

        // Set local state directly to ensure instant updates in Guest/Offline modes
        setPointsEarned(newPoints);
        setTotalAttempts(newAttempts);
        setTotalCorrect(newCorrect);
        setAccuracy(newAccuracy);

        let newChapterProgress = userData.chapterProgress || {};
        if (chapterId) {
          const currentChapter = newChapterProgress[chapterId] || {
            completed: false,
            accuracy: 0,
            score: 0,
            questionsSolved: 0,
          };
          const newChapQs = currentChapter.questionsSolved + questionsSolved;
          const newChapAcc =
            newChapQs === 0
              ? 0
              : Math.round(
                  (currentChapter.accuracy * currentChapter.questionsSolved +
                    accuracy * questionsSolved) /
                    newChapQs,
                );

          newChapterProgress = {
            ...newChapterProgress,
            [chapterId]: {
              ...currentChapter,
              questionsSolved: newChapQs,
              accuracy: newChapAcc,
              score: currentChapter.score + points,
              completed: newChapQs >= 5, // Example threshold for completion
            },
          };
        }

        let newStreak = userData.streak || 0;
        let lastCompletedDate = userData.lastCompletedDate;

        if (newQs >= dailyGoal && prevQs < dailyGoal) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastCompletedDate === yesterdayStr) {
            newStreak += 1;
          } else if (lastCompletedDate !== dateStr) {
            newStreak = 1;
          }
          lastCompletedDate = dateStr;
        }

        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: userData.email || user.email,
            name: userData.name || user.name,
            points: newPoints,
            streak: newStreak,
            lastCompletedDate: lastCompletedDate || null,
            role: userData.role || "user",
            rank: userData.rank !== undefined ? userData.rank : 1000,
            chapterProgress: newChapterProgress,
            totalAttempts: newAttempts,
            totalCorrect: newCorrect,
            accuracy: newAccuracy,
          },
          { merge: true },
        );

        // Update public profile
        await setDoc(
          doc(db, "users_public", user.uid),
          {
            uid: user.uid,
            name: userData.name || user.name,
            points: newPoints,
            rank: userData.rank !== undefined ? userData.rank : 1000,
            accuracy: newAccuracy,
            totalAttempts: newAttempts,
            totalCorrect: newCorrect,
            ...(userData.profilePic ? { profilePic: userData.profilePic } : {}),
          },
          { merge: true },
        );
      }
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `users/${user.uid}/activity/${dateStr}`,
      );
    }
  };

  const getQuestionAttemptsToday = useCallback((questionId: string) => {
    return todayAttemptsState[String(questionId)] || [];
  }, [todayAttemptsState]);

  const recordQuestionAttempt = useCallback(async (
    questionId: string,
    isCorrect: boolean,
    timeSpent: number,
    chapterId?: string,
  ) => {
    const qIdStr = String(questionId);
    const todayStr = new Date().toISOString().split("T")[0];
    const currentAttempts = todayAttemptsState[qIdStr] || [];
    const attemptNumber = currentAttempts.length + 1;
    const wasPreviouslyCorrect = currentAttempts.includes(true);

    let points = 0;
    if (isCorrect) {
      if (attemptNumber === 1) {
        points = 10;
      } else if (attemptNumber === 2 && !wasPreviouslyCorrect) {
        points = 5;
      }
    }

    const newAttempts = [...currentAttempts, isCorrect];
    const updatedAttemptsState = {
      ...todayAttemptsState,
      [qIdStr]: newAttempts,
    };

    setTodayAttemptsState(updatedAttemptsState);

    // Save to Firestore attempts collection
    if (auth.currentUser && auth.currentUser.uid !== "demo") {
      try {
        const attemptsRef = doc(db, `users/${auth.currentUser.uid}/attempts`, todayStr);
        await setDoc(attemptsRef, {
          attempts: updatedAttemptsState,
          date: todayStr,
        }, { merge: true });
      } catch (err) {
        console.error("Error saving attempts to Firestore:", err);
      }
    }

    // Call saveActivity
    const timeInMinutes = Math.round(timeSpent / 60) || 0;
    const qsCount = attemptNumber === 1 ? 1 : 0;
    await saveActivity(
      qsCount,
      isCorrect ? 100 : 0,
      timeInMinutes,
      points,
      chapterId,
      isCorrect,
      attemptNumber > 1,
      wasPreviouslyCorrect,
    );

    return { points, attemptNumber };
  }, [todayAttemptsState, saveActivity]);

  const setAvatarConfig = (config: AvatarConfig | null) => {
    setAvatarConfigState(config);
    updateUserProfile({ avatarConfig: config });
  };

  const changePassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    try {
      const { updatePassword } = await import("firebase/auth");
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  const setOnboarded = (value: boolean) => {
    setOnboardedState(value);
    updateUserProfile({ onboarded: value });
  };

  return (
    <UserContext.Provider
      value={{
        dailyGoal,
        setDailyGoal,
        currentQs,
        setCurrentQs,
        pointsEarned,
        setPointsEarned,
        dailyPoints,
        setDailyPoints,
        streak,
        setStreak,
        userRank,
        user,
        loading,
        theme,
        setTheme,
        notifications,
        setNotifications,
        profilePic,
        setProfilePic,
        avatarConfig,
        setAvatarConfig,
        chapterProgress,
        setChapterProgress,
        activityHistory,
        tasks,
        setTasks,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        forgotPassword,
        changePassword,
        loginAnonymously,
        logout,
        saveActivity,
        updateUserProfile,
        field,
        setField,
        onboarded,
        setOnboarded,
        accuracy,
        totalAttempts,
        totalCorrect,
        getQuestionAttemptsToday,
        recordQuestionAttempt,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
