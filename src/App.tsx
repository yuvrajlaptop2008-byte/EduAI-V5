import { useEffect, lazy, Suspense } from "react";
import { syncQuestionsFromFirestore } from "./utils/questionBank";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import PlatformBanner from "./components/PlatformBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import { Landing } from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { useUser } from "./context/UserContext";
import { normalizeRole, ROLE_HOME } from "./utils/roles";

// Route-level code splitting — these are not needed on first paint.
const Tests = lazy(() => import("./pages/Tests"));
const NotebookHome = lazy(() => import("./modules/notebook/NotebookHome"));
const AddNote = lazy(() => import("./modules/notebook/AddNote"));
const EditNote = lazy(() => import("./modules/notebook/EditNote"));
const NoteViewer = lazy(() => import("./modules/notebook/NoteViewer"));
const Formulas = lazy(() => import("./pages/Formulas"));
const Profile = lazy(() => import("./pages/Profile"));
const ExamDashboard = lazy(() => import("./pages/ExamDashboard"));
const DPPDashboard = lazy(() => import("./pages/DPPDashboard"));
const DPPChapter = lazy(() => import("./pages/DPPChapter"));
const DPPAssignment = lazy(() => import("./pages/DPPAssignment"));
const PracticeMCQScreen = lazy(() => import("./pages/PracticeMCQScreen"));
const AvatarEditor = lazy(() => import("./pages/AvatarEditor"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AnalysisDashboard = lazy(() => import("./pages/AnalysisDashboard"));
const FormulaSubject = lazy(() => import("./pages/FormulaSubject"));
const FormulaChapter = lazy(() => import("./pages/FormulaChapter"));
const FormulaViewer = lazy(() => import("./pages/FormulaViewer"));
const CreateFormula = lazy(() => import("./pages/CreateFormula"));
const TeacherLayout = lazy(() => import("./components/layout/TeacherLayout"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const UploadQuestions = lazy(() => import("./pages/teacher/UploadQuestions"));
const CreateGroupTest = lazy(() => import("./pages/teacher/CreateGroupTest"));
const MyTests = lazy(() => import("./pages/teacher/MyTests"));
const TeacherTestResults = lazy(() => import("./pages/teacher/TestResults"));
const TeacherAttendance = lazy(() => import("./pages/teacher/Attendance"));
const TeacherRemarks = lazy(() => import("./pages/teacher/Remarks"));
const TeacherAttendanceTrends = lazy(() => import("./pages/teacher/AttendanceTrends"));
const TeacherStudents = lazy(() => import("./pages/teacher/Students"));
const TeacherStudentDetail = lazy(() => import("./pages/teacher/StudentDetail"));
const AdminBranches = lazy(() => import("./pages/admin/Branches"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Institutes = lazy(() => import("./pages/admin/Institutes"));
const InstituteDetail = lazy(() => import("./pages/admin/InstituteDetail"));
const AdminQuestionBank = lazy(() => import("./pages/admin/QuestionBank"));
const AdminImportQuestions = lazy(() => import("./pages/admin/ImportQuestions"));
const AdminPdfImport = lazy(() => import("./pages/admin/PdfImport"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const ParentLayout = lazy(() => import("./components/layout/ParentLayout"));
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const ParentProgress = lazy(() => import("./pages/parent/Progress"));
const ParentAttendance = lazy(() => import("./pages/parent/ParentAttendance"));
const ParentRemarks = lazy(() => import("./pages/parent/ParentRemarks"));
const ParentNotifications = lazy(() => import("./pages/parent/ParentNotifications"));
const ParentReports = lazy(() => import("./pages/parent/ParentReports"));
const StudentAnalyticsPage = lazy(() => import("./pages/StudentAnalytics"));

// Teacher

// Admin

// Parent

// ─── Protected Route Guard ────────────────────────────────────────────────────
function ProtectedRoute() {
  const { user, loading, onboarded } = useUser();
  const location = useLocation();

  if (loading) {
    // Full-screen loading spinner while Firebase resolves auth state
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);
  // Onboarding (avatar/exam target picker) is a student-only flow.
  if (role === "student") {
    if (!onboarded && location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    if (onboarded && location.pathname === "/onboarding") {
      return <Navigate to="/app" replace />;
    }
  } else if (location.pathname === "/onboarding") {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }

  return <Outlet />;
}

/** Gate a whole route subtree to a single role — redirects everyone else to their own home. */
function RoleRoute({ role }: { role: "student" | "teacher" | "admin" | "parent" }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  const actual = normalizeRole(user.role);
  if (actual !== role) return <Navigate to={ROLE_HOME[actual]} replace />;
  return <Outlet />;
}

// ─── Public Route Guard — redirects logged-in users away from auth pages ──────
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (user) return <Navigate to={ROLE_HOME[normalizeRole(user.role)]} replace />;
  return <>{children}</>;
}

// ─── App Layout ───────────────────────────────────────────────────────────────
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app");

  return (
    <div
      className={`min-h-screen font-sans ${isAppRoute ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-900"}`}
    >
      <Toaster theme="dark" position="top-center" />
      <PlatformBanner />
      <Outlet />
      {isAppRoute && <BottomNav />}
    </div>
  );
}

function App() {
  useEffect(() => {
    syncQuestionsFromFirestore();
  }, []);

  return (
    <ErrorBoundary>
    <Router>
      <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
           <Route element={<RoleRoute role="student" />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app" element={<Home />} />
            <Route path="/app/tests" element={<Tests />} />

            <Route path="/app/notebook" element={<NotebookHome />} />
            <Route path="/app/notebook/add" element={<AddNote />} />
            <Route path="/app/notebook/:id" element={<NoteViewer />} />
            <Route path="/app/notebook/:id/edit" element={<EditNote />} />

            <Route path="/app/formulas" element={<Formulas />} />
            <Route path="/app/profile" element={<Profile />} />

            <Route path="/app/exam/:examId" element={<ExamDashboard />} />
            <Route path="/app/dpp" element={<DPPDashboard />} />
            <Route path="/app/dpp/:examId" element={<DPPDashboard />} />
            <Route
              path="/app/dpp/chapter/:subject/:chapterId"
              element={<DPPChapter />}
            />
            <Route
              path="/app/dpp/assignment/:dppId"
              element={<DPPAssignment />}
            />
            <Route path="/app/practice" element={<PracticeMCQScreen />} />
            <Route path="/app/avatar-editor" element={<AvatarEditor />} />
            <Route path="/app/leaderboard" element={<Leaderboard />} />
            <Route path="/app/analytics" element={<StudentAnalyticsPage />} />
            <Route path="/app/analysis" element={<AnalysisDashboard />} />

            <Route path="/app/formulas/create" element={<CreateFormula />} />
            <Route
              path="/app/formulas/:subjectId/:chapterId"
              element={<FormulaChapter />}
            />
            <Route
              path="/app/formulas/:subjectId/:chapterId/:topicId"
              element={<FormulaViewer />}
            />
            <Route path="/app/formulas/:subjectId" element={<FormulaSubject />} />
           </Route>
          </Route>

          {/* Teacher */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute role="teacher" />}>
              <Route element={<TeacherLayout />}>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/upload" element={<UploadQuestions />} />
                <Route path="/teacher/create-test" element={<CreateGroupTest />} />
                <Route path="/teacher/tests" element={<MyTests />} />
                <Route path="/teacher/tests/:testId/results" element={<TeacherTestResults />} />
                <Route path="/teacher/attendance" element={<TeacherAttendance />} />
                <Route path="/teacher/attendance/trends" element={<TeacherAttendanceTrends />} />
                <Route path="/teacher/students" element={<TeacherStudents />} />
                <Route path="/teacher/students/:studentId" element={<TeacherStudentDetail />} />
                <Route path="/teacher/remarks" element={<TeacherRemarks />} />
              </Route>
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute role="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/institutes" element={<Institutes />} />
                <Route path="/admin/institutes/:instituteId" element={<InstituteDetail />} />
                <Route path="/admin/questions" element={<AdminQuestionBank />} />
                <Route path="/admin/import" element={<AdminImportQuestions />} />
                <Route path="/admin/import/pdf" element={<AdminPdfImport />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/institutes/:instituteId/branches" element={<AdminBranches />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
              </Route>
            </Route>
          </Route>

          {/* Parent */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute role="parent" />}>
              <Route element={<ParentLayout />}>
                <Route path="/parent" element={<ParentDashboard />} />
                <Route path="/parent/progress" element={<ParentProgress />} />
                <Route path="/parent/attendance" element={<ParentAttendance />} />
                <Route path="/parent/remarks" element={<ParentRemarks />} />
                <Route path="/parent/notifications" element={<ParentNotifications />} />
                <Route path="/parent/reports" element={<ParentReports />} />
              </Route>
            </Route>
          </Route>

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
