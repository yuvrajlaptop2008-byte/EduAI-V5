import mongoose from "mongoose";
import { Question } from "../models/Question.js";
import { Exam } from "../models/Exam.js";
import { connectMongoDB } from "../db/mongo.js";

export const SAMPLE_QUESTIONS = [
  // ─── PHYSICS ───────────────────────────────────────────────────────────────
  {
    text: "A particle is projected with velocity $u$ at an angle $\\theta$ with the horizontal. The radius of curvature of its trajectory at the highest point is:",
    options: [
      { text: "$\\frac{u^2 \\cos^2\\theta}{g}$" },
      { text: "$\\frac{u^2 \\sin^2\\theta}{g}$" },
      { text: "$\\frac{u^2}{g}$" },
      { text: "$\\frac{u^2 \\cos\\theta}{g}$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Projectile Motion",
    difficulty: "Medium",
    exam: "JEE_MAIN",
    year: 2024,
    solution: "At the highest point, the velocity of the projectile is purely horizontal, given by $v = u \\cos\\theta$. The normal component of acceleration is the acceleration due to gravity $a_n = g$. Using the radius of curvature formula $\\rho = \\frac{v^2}{a_n}$, we get $\\rho = \\frac{(u \\cos\\theta)^2}{g} = \\frac{u^2 \\cos^2\\theta}{g}$.",
    tags: ["kinematics", "projectile", "radius-of-curvature"],
  },
  {
    text: "In an electromagnetic wave, the electric field is given by $E = 50 \\sin(\\omega t - kx)$ V/m. The average energy density of the electromagnetic wave in vacuum is: (Take $\\varepsilon_0 = 8.85 \\times 10^{-12}$ F/m)",
    options: [
      { text: "$1.1 \\times 10^{-8}\\text{ J/m}^3$" },
      { text: "$2.2 \\times 10^{-8}\\text{ J/m}^3$" },
      { text: "$5.5 \\times 10^{-9}\\text{ J/m}^3$" },
      { text: "$4.4 \\times 10^{-8}\\text{ J/m}^3$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Physics",
    chapter: "Electromagnetic Waves",
    topic: "Energy Density",
    difficulty: "Medium",
    exam: "JEE_MAIN",
    year: 2024,
    solution: "The average energy density of an EM wave is given by $u_{avg} = \\frac{1}{2} \\varepsilon_0 E_0^2$. Here $E_0 = 50\\text{ V/m}$, so $u_{avg} = \\frac{1}{2} \\times (8.85 \\times 10^{-12}) \\times (50)^2 = \\frac{1}{2} \\times 8.85 \\times 10^{-12} \\times 2500 \\approx 1.1 \\times 10^{-8}\\text{ J/m}^3$.",
    tags: ["em-waves", "energy-density"],
  },
  {
    text: "An ideal gas undergoes a cyclic process consisting of an isothermal expansion, an isochoric cooling, and an isobaric compression. If the temperature during isothermal expansion is $T_1 = 400\\text{ K}$ and the volume doubles, the total work done by $1\\text{ mol}$ of gas during the isothermal process is:",
    options: [
      { text: "$400 R \\ln 2$" },
      { text: "$200 R \\ln 2$" },
      { text: "$400 R$" },
      { text: "$800 R \\ln 2$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Physics",
    chapter: "Thermodynamics",
    topic: "Work in Thermodynamic Processes",
    difficulty: "Easy",
    exam: "JEE_MAIN",
    year: 2023,
    solution: "For an isothermal process, work done $W = n R T \\ln\\left(\\frac{V_2}{V_1}\\right)$. With $n = 1\\text{ mol}$, $T = 400\\text{ K}$, and $\\frac{V_2}{V_1} = 2$, we have $W = (1) R (400) \\ln 2 = 400 R \\ln 2$.",
    tags: ["thermodynamics", "isothermal-work"],
  },
  {
    text: "The de Broglie wavelength of an electron accelerated from rest through a potential difference of $V$ volts is approximately given by:",
    options: [
      { text: "$\\lambda = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$" },
      { text: "$\\lambda = \\frac{0.286}{\\sqrt{V}}\\text{ \\AA}$" },
      { text: "$\\lambda = \\frac{1.227}{\\sqrt{V}}\\text{ \\AA}$" },
      { text: "$\\lambda = \\frac{122.7}{\\sqrt{V}}\\text{ \\AA}$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Physics",
    chapter: "Dual Nature of Matter",
    topic: "de Broglie Wavelength",
    difficulty: "Easy",
    exam: "JEE_MAIN",
    year: 2023,
    solution: "The de Broglie wavelength is $\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2m e V}}$. Substituting constants $h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$, $m = 9.1 \\times 10^{-31}\\text{ kg}$, $e = 1.6 \\times 10^{-19}\\text{ C}$ gives $\\lambda = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$.",
    tags: ["modern-physics", "de-broglie"],
  },

  // ─── CHEMISTRY ─────────────────────────────────────────────────────────────
  {
    text: "Which of the following complex ions is diamagnetic and has an octahedral geometry according to Valence Bond Theory?",
    options: [
      { text: "$[\\text{Co}(\\text{NH}_3)_6]^{3+}$" },
      { text: "$[\\text{CoF}_6]^{3-}$" },
      { text: "$[\\text{Fe}(\\text{H}_2\\text{O})_6]^{2+}$" },
      { text: "$[\\text{NiCl}_4]^{2-}$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Chemistry",
    chapter: "Coordination Compounds",
    topic: "Valence Bond Theory and Magnetism",
    difficulty: "Medium",
    exam: "JEE_MAIN",
    year: 2024,
    solution: "In $[\\text{Co}(\\text{NH}_3)_6]^{3+}$, Cobalt is in the $+3$ oxidation state ($3d^6$). $\\text{NH}_3$ is a strong field ligand which causes pairing of electrons in the $3d$ subshell: $t_{2g}^6 e_g^0$. All electrons are paired, so the complex is diamagnetic with inner orbital hybridization $d^2sp^3$.",
    tags: ["coordination-compounds", "diamagnetic", "hybridization"],
  },
  {
    text: "For the reaction $2\\text{SO}_2(g) + \\text{O}_2(g) \\rightleftharpoons 2\\text{SO}_3(g)$, the relation between $K_p$ and $K_c$ is:",
    options: [
      { text: "$K_p = K_c (RT)^{-1}$" },
      { text: "$K_p = K_c (RT)^1$" },
      { text: "$K_p = K_c (RT)^{-2}$" },
      { text: "$K_p = K_c$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Chemistry",
    chapter: "Chemical Equilibrium",
    topic: "Kp and Kc Relationship",
    difficulty: "Easy",
    exam: "JEE_MAIN",
    year: 2024,
    solution: "The relation between $K_p$ and $K_c$ is $K_p = K_c (RT)^{\\Delta n_g}$. For the reaction, $\\Delta n_g = n_p - n_r = 2 - (2 + 1) = -1$. Therefore, $K_p = K_c (RT)^{-1}$.",
    tags: ["equilibrium", "kp-kc"],
  },
  {
    text: "The major product obtained in the reaction of 2-bromopentane with alcoholic $\\text{KOH}$ upon heating is:",
    options: [
      { text: "Pent-2-ene" },
      { text: "Pent-1-ene" },
      { text: "Pentane-2-ol" },
      { text: "2-ethoxypentane" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Chemistry",
    chapter: "Haloalkanes and Haloarenes",
    topic: "Elimination Reactions (Saytzeff's Rule)",
    difficulty: "Easy",
    exam: "JEE_MAIN",
    year: 2023,
    solution: "Dehydrohalogenation of 2-bromopentane with alc. KOH follows Saytzeff's rule. The more substituted, more stable alkene is the major product: Pent-2-ene (major, more alkyl groups on the double bond) vs Pent-1-ene (minor).",
    tags: ["organic-chemistry", "elimination", "saytzeff"],
  },

  // ─── MATHEMATICS ───────────────────────────────────────────────────────────
  {
    text: "The value of the definite integral $\\int_{-\\pi/2}^{\\pi/2} \\frac{\\cos x}{1 + e^x} dx$ is:",
    options: [
      { text: "$1$" },
      { text: "$2$" },
      { text: "$\\frac{\\pi}{2}$" },
      { text: "$0$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Mathematics",
    chapter: "Definite Integrals",
    topic: "Properties of Definite Integrals",
    difficulty: "Medium",
    exam: "JEE_MAIN",
    year: 2024,
    solution: "Let $I = \\int_{-\\pi/2}^{\\pi/2} \\frac{\\cos x}{1 + e^x} dx$. Using property $\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx$, here $a+b-x = -x$. Since $\\cos(-x) = \\cos x$, $I = \\int_{-\\pi/2}^{\\pi/2} \\frac{\\cos x}{1 + e^{-x}} dx = \\int_{-\\pi/2}^{\\pi/2} \\frac{e^x \\cos x}{1 + e^x} dx$. Adding the two integrals: $2I = \\int_{-\\pi/2}^{\\pi/2} \\cos x \\left( \\frac{1 + e^x}{1 + e^x} \\right) dx = \\int_{-\\pi/2}^{\\pi/2} \\cos x dx = [\\sin x]_{-\\pi/2}^{\\pi/2} = 1 - (-1) = 2$. Thus, $I = 1$.",
    tags: ["calculus", "definite-integrals", "king-property"],
  },
  {
    text: "If $A = \\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix}$, then the matrix $A^n$ for any positive integer $n$ is equal to:",
    options: [
      { text: "$\\begin{pmatrix} 1 & 2n \\\\ 0 & 1 \\end{pmatrix}$" },
      { text: "$\\begin{pmatrix} 1 & 2^n \\\\ 0 & 1 \\end{pmatrix}$" },
      { text: "$\\begin{pmatrix} n & 2n \\\\ 0 & n \\end{pmatrix}$" },
      { text: "$\\begin{pmatrix} 1 & n^2 \\\\ 0 & 1 \\end{pmatrix}$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Mathematics",
    chapter: "Matrices and Determinants",
    topic: "Powers of Matrices",
    difficulty: "Easy",
    exam: "JEE_MAIN",
    year: 2024,
    solution: "We can write $A = I + B$, where $B = \\begin{pmatrix} 0 & 2 \\\\ 0 & 0 \\end{pmatrix}$. Note that $B^2 = \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix} = O$. By binomial expansion: $A^n = (I + B)^n = I + n B + \\frac{n(n-1)}{2} B^2 + \\dots = I + n B = \\begin{pmatrix} 1 & 2n \\\\ 0 & 1 \\end{pmatrix}$.",
    tags: ["algebra", "matrices", "nilpotent"],
  },
  {
    text: "The shortest distance between the lines $\\frac{x - 1}{2} = \\frac{y - 2}{3} = \\frac{z - 3}{4}$ and $\\frac{x - 2}{3} = \\frac{y - 4}{4} = \\frac{z - 5}{5}$ is:",
    options: [
      { text: "$\\frac{1}{\\sqrt{6}}$" },
      { text: "$\\frac{1}{\\sqrt{3}}$" },
      { text: "$\\frac{2}{\\sqrt{6}}$" },
      { text: "$0$" },
    ],
    correctAnswer: 0,
    type: "single",
    subject: "Mathematics",
    chapter: "Three Dimensional Geometry",
    topic: "Shortest Distance between Skew Lines",
    difficulty: "Medium",
    exam: "JEE_MAIN",
    year: 2023,
    solution: "The lines pass through points $A(1,2,3)$ and $B(2,4,5)$ with direction vectors $\\vec{b}_1 = \\langle 2, 3, 4 \\rangle$ and $\\vec{b}_2 = \\langle 3, 4, 5 \\rangle$. Vector $\\vec{AB} = \\langle 1, 2, 2 \\rangle$. $\\vec{b}_1 \\times \\vec{b}_2 = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 2 & 3 & 4 \\\\ 3 & 4 & 5 \\end{vmatrix} = \\hat{i}(15-16) - \\hat{j}(10-12) + \\hat{k}(8-9) = \\langle -1, 2, -1 \\rangle$. Magnitude $|\\vec{b}_1 \\times \\vec{b}_2| = \\sqrt{(-1)^2 + 2^2 + (-1)^2} = \\sqrt{6}$. Shortest distance $d = \\frac{|\\vec{AB} \\cdot (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|} = \\frac{|(1)(-1) + (2)(2) + (2)(-1)|}{\\sqrt{6}} = \\frac{|-1 + 4 - 2|}{\\sqrt{6}} = \\frac{1}{\\sqrt{6}}$.",
    tags: ["3d-geometry", "skew-lines", "vectors"],
  },
];

export async function runSeed() {
  console.log("[Seed] Checking MongoDB connection...");
  const isMongo = await connectMongoDB();
  if (!isMongo) {
    throw new Error("Cannot seed: MongoDB connection is not active.");
  }

  console.log(`[Seed] Inserting/updating ${SAMPLE_QUESTIONS.length} curated questions...`);
  const insertedQuestions: any[] = [];

  for (const q of SAMPLE_QUESTIONS) {
    const existing = await Question.findOne({ text: q.text });
    if (!existing) {
      const created = await Question.create(q);
      insertedQuestions.push(created);
    } else {
      insertedQuestions.push(existing);
    }
  }

  console.log(`[Seed] Total questions in database: ${await Question.countDocuments()}`);

  // Create standard Full Mock Test
  const existingExam = await Exam.findOne({ title: "JEE Main 2026 Official Full Mock #1" });
  if (!existingExam) {
    const physicsQ = insertedQuestions.filter((q) => q.subject === "Physics").map((q) => q._id);
    const chemQ = insertedQuestions.filter((q) => q.subject === "Chemistry").map((q) => q._id);
    const mathQ = insertedQuestions.filter((q) => q.subject === "Mathematics").map((q) => q._id);

    const mockExam = await Exam.create({
      title: "JEE Main 2026 Official Full Mock #1",
      description: "Comprehensive 3-hour computer-based test following latest NTA pattern with Physics, Chemistry, and Mathematics.",
      examType: "JEE_MAIN",
      durationMinutes: 180,
      totalMarks: 300,
      isPublished: true,
      sections: [
        {
          name: "Physics - Section A",
          subject: "Physics",
          questionIds: physicsQ,
          totalQuestions: physicsQ.length,
          marksPerCorrect: 4,
          negativeMarks: -1,
        },
        {
          name: "Chemistry - Section A",
          subject: "Chemistry",
          questionIds: chemQ,
          totalQuestions: chemQ.length,
          marksPerCorrect: 4,
          negativeMarks: -1,
        },
        {
          name: "Mathematics - Section A",
          subject: "Mathematics",
          questionIds: mathQ,
          totalQuestions: mathQ.length,
          marksPerCorrect: 4,
          negativeMarks: -1,
        },
      ],
    });
    console.log(`[Seed] Created Mock Exam: "${mockExam.title}" (ID: ${mockExam._id})`);
  }

  return {
    questionsCount: await Question.countDocuments(),
    examsCount: await Exam.countDocuments(),
  };
}

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  runSeed()
    .then((res) => {
      console.log("✅ Seed completed:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed failed:", err.message);
      process.exit(1);
    });
}
