/**
 * seedDemoData — call once from Admin → Settings to populate a fresh Firebase
 * project with a working demo: 1 institute, 4 exam groups, 20 questions across
 * Physics/Chemistry/Maths, 2 sample teachers, 5 sample students.
 *
 * Safe to run multiple times (uses fixed IDs, so no duplicates created).
 */
import { doc, setDoc, writeBatch, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const DEMO_INSTITUTE_ID = "demo-institute-1";
const DEMO_GROUPS = [
  { id: "group-jee-main",  name: "JEE Main",     type: "JEE"     },
  { id: "group-jee-adv",   name: "JEE Advanced", type: "JEE_ADV" },
  { id: "group-neet",      name: "NEET",         type: "NEET"    },
  { id: "group-school",    name: "School",       type: "School"  },
] as const;

const SAMPLE_QUESTIONS = [
  // Physics
  { id: 10001, subject: "Physics", chapter: "Kinematics", difficulty: "Easy", exam: "JEE_MAIN",
    text: "A particle moves in a straight line with constant acceleration. If its velocity changes from 10 m/s to 30 m/s in 5 seconds, what is the acceleration?",
    options: ["2 m/s²", "4 m/s²", "6 m/s²", "8 m/s²"], correctAnswer: 1,
    solution: "a = (v-u)/t = (30-10)/5 = 4 m/s²" },
  { id: 10002, subject: "Physics", chapter: "Laws of Motion", difficulty: "Medium", exam: "JEE_MAIN",
    text: "A block of mass 5 kg is placed on a frictionless surface. A force of 20 N acts on it horizontally. What is the acceleration?",
    options: ["2 m/s²", "4 m/s²", "10 m/s²", "100 m/s²"], correctAnswer: 1,
    solution: "F = ma → a = F/m = 20/5 = 4 m/s²" },
  { id: 10003, subject: "Physics", chapter: "Work and Energy", difficulty: "Medium", exam: "JEE_MAIN",
    text: "A body of mass 2 kg is moved through a height of 10 m against gravity (g=10 m/s²). Work done is:",
    options: ["100 J", "200 J", "400 J", "500 J"], correctAnswer: 1,
    solution: "W = mgh = 2 × 10 × 10 = 200 J" },
  { id: 10004, subject: "Physics", chapter: "Gravitation", difficulty: "Hard", exam: "JEE_ADV",
    text: "The orbital velocity of a satellite at height h above Earth's surface (radius R, mass M) is:",
    options: ["√(GM/R+h)", "√(GM/(R+h))", "√(2GM/(R+h))", "GM/(R+h)"], correctAnswer: 1,
    solution: "v = √(GM/(R+h)) from centripetal force balance" },
  { id: 10005, subject: "Physics", chapter: "Thermodynamics", difficulty: "Hard", exam: "NEET",
    text: "In an isothermal process, the internal energy of an ideal gas:",
    options: ["Increases", "Decreases", "Remains constant", "Becomes zero"], correctAnswer: 2,
    solution: "Internal energy of an ideal gas depends only on temperature. Isothermal means constant T, so ΔU = 0." },
  // Chemistry
  { id: 10006, subject: "Chemistry", chapter: "Periodic Table", difficulty: "Easy", exam: "NEET",
    text: "The element with atomic number 17 belongs to which group?",
    options: ["Group 1", "Group 16", "Group 17", "Group 18"], correctAnswer: 2,
    solution: "Atomic number 17 is Chlorine, which belongs to Group 17 (halogens)." },
  { id: 10007, subject: "Chemistry", chapter: "Chemical Bonding", difficulty: "Medium", exam: "JEE_MAIN",
    text: "Which of the following has the highest bond order?",
    options: ["N₂", "O₂", "F₂", "Cl₂"], correctAnswer: 0,
    solution: "N₂ has a triple bond (bond order 3), highest among the options." },
  { id: 10008, subject: "Chemistry", chapter: "Equilibrium", difficulty: "Medium", exam: "JEE_MAIN",
    text: "For the reaction N₂ + 3H₂ ⇌ 2NH₃, increasing pressure will:",
    options: ["Shift equilibrium to left", "Shift equilibrium to right", "No change", "Increase temperature"],
    correctAnswer: 1,
    solution: "Increasing pressure shifts equilibrium to the side with fewer moles of gas. Right side has 2 moles vs 4 on left." },
  { id: 10009, subject: "Chemistry", chapter: "Organic Chemistry", difficulty: "Hard", exam: "JEE_ADV",
    text: "Which reagent converts a primary alcohol to an aldehyde?",
    options: ["KMnO₄", "K₂Cr₂O₇/H₂SO₄", "PCC", "LiAlH₄"], correctAnswer: 2,
    solution: "PCC (Pyridinium chlorochromate) oxidizes primary alcohols to aldehydes without over-oxidizing to carboxylic acids." },
  { id: 10010, subject: "Chemistry", chapter: "Electrochemistry", difficulty: "Medium", exam: "NEET",
    text: "The standard electrode potential of hydrogen electrode is:",
    options: ["+1.23 V", "0.00 V", "-0.76 V", "+0.34 V"], correctAnswer: 1,
    solution: "By definition, the standard hydrogen electrode (SHE) has E° = 0.00 V." },
  // Maths
  { id: 10011, subject: "Maths", chapter: "Quadratic Equations", difficulty: "Easy", exam: "JEE_MAIN",
    text: "The sum of roots of 2x² - 5x + 3 = 0 is:",
    options: ["5/2", "-5/2", "3/2", "-3/2"], correctAnswer: 0,
    solution: "Sum of roots = -b/a = -(-5)/2 = 5/2" },
  { id: 10012, subject: "Maths", chapter: "Calculus", difficulty: "Medium", exam: "JEE_MAIN",
    text: "d/dx(sin x) at x = π/2 is:",
    options: ["1", "0", "-1", "π/2"], correctAnswer: 1,
    solution: "d/dx(sin x) = cos x. At x = π/2, cos(π/2) = 0." },
  { id: 10013, subject: "Maths", chapter: "Integration", difficulty: "Hard", exam: "JEE_ADV",
    text: "∫₀¹ x² dx equals:",
    options: ["1/2", "1/3", "2/3", "1"], correctAnswer: 1,
    solution: "∫x² dx = x³/3. Evaluating from 0 to 1: 1/3 - 0 = 1/3." },
  { id: 10014, subject: "Maths", chapter: "Permutations and Combinations", difficulty: "Medium", exam: "JEE_MAIN",
    text: "Number of ways to arrange 5 books on a shelf:",
    options: ["25", "60", "120", "720"], correctAnswer: 2,
    solution: "5! = 5 × 4 × 3 × 2 × 1 = 120" },
  { id: 10015, subject: "Maths", chapter: "Probability", difficulty: "Medium", exam: "NEET",
    text: "A die is rolled once. Probability of getting an even number:",
    options: ["1/6", "1/3", "1/2", "2/3"], correctAnswer: 2,
    solution: "Even numbers: {2,4,6} → 3 favourable out of 6 → P = 3/6 = 1/2" },
  // Biology (NEET)
  { id: 10016, subject: "Biology", chapter: "Cell Biology", difficulty: "Easy", exam: "NEET",
    text: "Which organelle is called the 'powerhouse of the cell'?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], correctAnswer: 2,
    solution: "Mitochondria produce ATP via cellular respiration, earning the nickname 'powerhouse of the cell'." },
  { id: 10017, subject: "Biology", chapter: "Genetics", difficulty: "Medium", exam: "NEET",
    text: "In a monohybrid cross Tt × Tt, what fraction of offspring will be homozygous recessive?",
    options: ["1/4", "1/2", "3/4", "0"], correctAnswer: 0,
    solution: "TT : Tt : tt = 1:2:1. So tt (homozygous recessive) = 1/4." },
  { id: 10018, subject: "Biology", chapter: "Ecology", difficulty: "Medium", exam: "NEET",
    text: "Which trophic level has the maximum energy in an ecosystem?",
    options: ["Tertiary consumers", "Secondary consumers", "Primary consumers", "Producers"], correctAnswer: 3,
    solution: "Energy decreases at each trophic level (~10% rule). Producers (plants) have maximum energy." },
  { id: 10019, subject: "Biology", chapter: "Human Physiology", difficulty: "Hard", exam: "NEET",
    text: "Which enzyme converts fibrinogen to fibrin during blood clotting?",
    options: ["Thrombin", "Prothrombin", "Fibrinase", "Plasmin"], correctAnswer: 0,
    solution: "Thrombin (activated from prothrombin) converts soluble fibrinogen to insoluble fibrin threads." },
  { id: 10020, subject: "Biology", chapter: "Plant Kingdom", difficulty: "Easy", exam: "NEET",
    text: "Chlorophyll is found in which part of the chloroplast?",
    options: ["Stroma", "Outer membrane", "Thylakoid membrane", "Inner membrane"], correctAnswer: 2,
    solution: "Chlorophyll is embedded in the thylakoid membranes where light-dependent reactions occur." },
];

const SAMPLE_TEACHERS = [
  { uid: "demo-teacher-1", name: "Rajesh Kumar", email: "teacher1@demo.eduai.app", role: "teacher", instituteId: DEMO_INSTITUTE_ID, examGroupId: null, points: 0, streak: 0, rank: 1000, onboarded: true },
  { uid: "demo-teacher-2", name: "Priya Sharma", email: "teacher2@demo.eduai.app", role: "teacher", instituteId: DEMO_INSTITUTE_ID, examGroupId: null, points: 0, streak: 0, rank: 1000, onboarded: true },
];

const SAMPLE_STUDENTS = [
  { uid: "demo-student-1", name: "Aryan Singh", email: "student1@demo.eduai.app", role: "user", instituteId: DEMO_INSTITUTE_ID, examGroupId: "group-jee-main", points: 2400, streak: 7, rank: 14, onboarded: true },
  { uid: "demo-student-2", name: "Kavya Reddy", email: "student2@demo.eduai.app", role: "user", instituteId: DEMO_INSTITUTE_ID, examGroupId: "group-jee-main", points: 1800, streak: 3, rank: 22, onboarded: true },
  { uid: "demo-student-3", name: "Rohan Mehta", email: "student3@demo.eduai.app", role: "user", instituteId: DEMO_INSTITUTE_ID, examGroupId: "group-neet", points: 3100, streak: 12, rank: 8, onboarded: true },
  { uid: "demo-student-4", name: "Ananya Iyer", email: "student4@demo.eduai.app", role: "user", instituteId: DEMO_INSTITUTE_ID, examGroupId: "group-neet", points: 950, streak: 1, rank: 45, onboarded: true },
  { uid: "demo-student-5", name: "Dev Patel", email: "student5@demo.eduai.app", role: "user", instituteId: DEMO_INSTITUTE_ID, examGroupId: "group-jee-adv", points: 4200, streak: 21, rank: 3, onboarded: true },
];

export async function seedDemoData(adminUid: string, adminName: string): Promise<{ created: number; skipped: number }> {
  const alreadySeeded = await getDoc(doc(db, "institutes", DEMO_INSTITUTE_ID));
  if (alreadySeeded.exists()) return { created: 0, skipped: 1 };

  const batch = writeBatch(db);
  let created = 0;

  // Institute
  batch.set(doc(db, "institutes", DEMO_INSTITUTE_ID), {
    id: DEMO_INSTITUTE_ID, name: "EduAI Demo Institute",
    logoURL: "", primaryColor: "#ff6b00",
    tagline: "Excellence in Every Rank", createdAt: Date.now(), createdBy: adminUid,
  });
  created++;

  // Exam groups
  DEMO_GROUPS.forEach((g) => {
    const studentIds = SAMPLE_STUDENTS.filter((s) => s.examGroupId === g.id).map((s) => s.uid);
    batch.set(doc(db, "examGroups", g.id), { ...g, instituteId: DEMO_INSTITUTE_ID, studentIds, createdAt: Date.now() });
    created++;
  });

  // Teachers
  SAMPLE_TEACHERS.forEach((t) => { batch.set(doc(db, "users", t.uid), t); created++; });

  // Students
  SAMPLE_STUDENTS.forEach((s) => { batch.set(doc(db, "users", s.uid), s); created++; });

  // Questions
  SAMPLE_QUESTIONS.forEach((q) => {
    batch.set(doc(db, "custom_questions", String(q.id)), { ...q, communitySolutions: [], status: "active", uploadedBy: adminUid, uploadedByName: adminName });
    created++;
  });

  // Platform config
  batch.set(doc(db, "platform", "config"), {
    announcement: "🎉 Welcome to EduAI Demo! Explore all features freely.",
    maintenanceMode: false,
    requireQuestionReview: false,
  }, { merge: true });

  await batch.commit();
  return { created, skipped: 0 };
}

// Seed leaderboard entries from existing attempts (idempotent helper)
export async function seedLeaderboardFromAttempts() {
  const { getDocs, collection, query, orderBy, setDoc, doc, writeBatch } = await import("firebase/firestore");
  const { db } = await import("../firebase");
  const snap = await getDocs(query(collection(db,"groupTestAttempts"), orderBy("score","desc")));
  const byStudent = new Map<string,{name:string;totalScore:number;count:number;attempts:number;examGroupId:string;instituteId:string}>();
  snap.forEach(d=>{
    const a = d.data() as any;
    const prev = byStudent.get(a.studentId)||{name:a.studentName||"Student",totalScore:0,count:0,attempts:0,examGroupId:a.examGroupId||"",instituteId:a.instituteId||""};
    byStudent.set(a.studentId,{...prev,totalScore:prev.totalScore+a.score,count:prev.count+1,attempts:prev.attempts+1});
  });
  const sorted = Array.from(byStudent.entries()).sort((a,b)=>b[1].totalScore-a[1].totalScore);
  const b = writeBatch(db);
  sorted.forEach(([uid,d],i)=>{
    b.set(doc(db,"leaderboard",uid),{
      uid,name:d.name,score:d.totalScore,rank:i+1,
      accuracy:d.count?Math.round((d.totalScore/(d.count*100))*100):0,
      examGroupId:d.examGroupId,instituteId:d.instituteId,period:"all",updatedAt:Date.now()
    });
  });
  if (!sorted.length) return 0;
  await b.commit();
  return sorted.length;
}
