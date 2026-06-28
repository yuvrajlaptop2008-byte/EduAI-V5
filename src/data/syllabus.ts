import { Chapter, ExamType, SubjectType } from"../components/TestEngine/types";

export const syllabusData: Record<
  ExamType,
  Record<SubjectType, string[]> | Partial<Record<SubjectType, string[]>>
> = {"JEE Main": {
    Physics: ["Units & Measurements","Kinematics","Laws of Motion","Work, Energy & Power","Rotational Motion","Gravitation","Properties of Solids & Liquids","Thermodynamics","Kinetic Theory of Gases","Oscillations","Waves","Electrostatics","Capacitors","Current Electricity","Magnetic Effects of Current","Magnetism & Matter","Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics","Wave Optics","Dual Nature of Radiation & Matter","Atoms","Nuclei","Semiconductor Electronics","Experimental Skills",
    ],
    Chemistry: ["Some Basic Concepts of Chemistry","Atomic Structure","Chemical Bonding & Molecular Structure","States of Matter","Thermodynamics","Equilibrium","Redox Reactions","Solutions","Electrochemistry","Chemical Kinetics","Surface Chemistry","Classification of Elements & Periodicity","Hydrogen","s-Block Elements","p-Block Elements","d- & f-Block Elements","Coordination Compounds","Environmental Chemistry","General Principles of Metallurgy","General Organic Chemistry","Hydrocarbons","Haloalkanes & Haloarenes","Alcohols, Phenols & Ethers","Aldehydes, Ketones & Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life",
    ],
    Mathematics: ["Sets","Relations & Functions","Complex Numbers","Quadratic Equations","Matrices","Determinants","Permutations & Combinations","Binomial Theorem","Sequences & Series","Limits","Continuity & Differentiability","Applications of Derivatives","Indefinite Integrals","Definite Integrals","Differential Equations","Coordinate Geometry","Three-Dimensional Geometry","Vector Algebra","Statistics","Probability","Trigonometric Functions","Inverse Trigonometric Functions",
    ],
  },"JEE Advanced": {
    Physics: ["Mechanics","Fluid Mechanics","Elasticity","Thermodynamics","Kinetic Theory","Oscillations & Waves","Electrostatics","Current Electricity","Magnetostatics","EMI & AC","Optics","Modern Physics","Experimental Physics",
    ],
    Chemistry: ["Physical Chemistry","Inorganic Chemistry","Organic Chemistry",
    ],
    Mathematics: ["Algebra","Trigonometry","Analytical Geometry (2D & 3D)","Differential Calculus","Integral Calculus","Differential Equations","Probability",
    ],
  },
  BITSAT: {
    Physics: ["Units & Measurement","Laws of Motion","Work & Energy","Rotational Motion","Gravitation","Thermodynamics","Oscillations & Waves","Electrostatics","Current Electricity","Magnetism","EMI & AC","Optics","Modern Physics",
    ],
    Chemistry: ["Atomic Structure","Chemical Bonding","Thermodynamics","Equilibrium","Electrochemistry","Chemical Kinetics","Organic Chemistry","Inorganic Chemistry",
    ],
    Mathematics: ["Algebra","Trigonometry","Coordinate Geometry","Calculus","Vectors","Probability",
    ],"English Proficiency": ["Grammar","Vocabulary","Reading Comprehension"],"Logical Reasoning": ["Verbal Reasoning","Non-Verbal Reasoning","Logical Sequences","Puzzle Tests",
    ],
  },"MHT-CET": {
    Physics: ["Motion","Laws of Motion","Gravitation","Thermal Properties","Waves","Electrostatics","Current Electricity","Magnetism","Optics","Modern Physics",
    ],
    Chemistry: ["Some Basic Concepts","Structure of Atom","Chemical Bonding","Thermodynamics","Electrochemistry","Organic Chemistry","Inorganic Chemistry",
    ],
    Mathematics: ["Algebra","Trigonometry","Coordinate Geometry","Calculus","Probability","Vectors",
    ],
  },
  NDA: {
    Mathematics: ["Algebra","Matrices & Determinants","Trigonometry","Analytical Geometry","Differential Calculus","Integral Calculus","Differential Equations","Vector Algebra","Statistics","Probability",
    ],"General Ability Test": ["English","General Knowledge"],
  },
  VITEEE: {
    Physics: ["Mechanics","Heat & Thermodynamics","Oscillations & Waves","Electrostatics","Magnetism","Optics","Modern Physics",
    ],
    Chemistry: ["Physical Chemistry","Organic Chemistry","Inorganic Chemistry",
    ],
    Mathematics: ["Algebra","Trigonometry","Coordinate Geometry","Calculus","Vectors",
    ],
    Biology: ["Taxonomy","Cell and Molecular Biology","Reproduction","Genetics and Evolution","Human Health and Diseases","Plant Physiology","Human Physiology",
    ],
    English: ["Grammar","Comprehension"],
    Aptitude: ["Data Interpretation","Logical Thinking","Quantitative Ability",
    ],
  },
  NEST: {
    Physics: ["Mechanics","Electricity & Magnetism","Thermodynamics","Modern Physics",
    ],
    Chemistry: ["Physical Chemistry","Organic Chemistry","Inorganic Chemistry",
    ],
    Mathematics: ["Algebra","Calculus","Coordinate Geometry","Probability"],
    Biology: ["Cell Biology","Genetics","Evolution","Ecology","Plant Physiology","Human Physiology",
    ],
  },
  COMEDK: {
    Physics: ["Mechanics","Thermodynamics","Electricity","Magnetism","Optics","Modern Physics",
    ],
    Chemistry: ["Physical Chemistry","Organic Chemistry","Inorganic Chemistry",
    ],
    Mathematics: ["Algebra","Trigonometry","Calculus","Coordinate Geometry","Probability",
    ],
  },
  NEET: {
    Physics: ["Units and Measurements","Kinematics","Laws of Motion","Work, Energy and Power","Rotational Motion","Gravitation","Properties of Matter (Solids & Fluids)","Thermodynamics","Kinetic Theory","Oscillations and Waves","Electrostatics","Current Electricity","Magnetism and Moving Charges","Electromagnetic Induction","Alternating Current","Optics (Ray + Wave)","Dual Nature of Matter","Atoms and Nuclei","Semiconductor Electronics",
    ],
    Chemistry: ["Some Basic Concepts of Chemistry","Atomic Structure","Periodicity","Chemical Bonding","Thermodynamics","Equilibrium","Redox Reactions","States of Matter","Hydrogen","s-Block","p-Block (11th + 12th)","d and f Block","Coordination Compounds","Organic Chemistry Basics","Hydrocarbons","Haloalkanes & Haloarenes","Alcohols, Phenols, Ethers","Aldehydes, Ketones, Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life","Solid State","Solutions","Electrochemistry","Chemical Kinetics",
    ],
    Biology: ["Diversity in Living World","Structural Organisation in Plants & Animals","Cell Structure and Function","Plant Physiology","Human Physiology","Reproduction","Genetics and Evolution","Biology and Human Welfare","Biotechnology","Ecology and Environment",
    ],
  },"NEET NTA": {
    Physics: ["Units and Measurements","Kinematics","Laws of Motion","Work, Energy and Power","Rotational Motion","Gravitation","Properties of Matter (Solids & Fluids)","Thermodynamics","Kinetic Theory","Oscillations and Waves","Electrostatics","Current Electricity","Magnetism and Moving Charges","Electromagnetic Induction","Alternating Current","Optics (Ray + Wave)","Dual Nature of Matter","Atoms and Nuclei","Semiconductor Electronics",
    ],
    Chemistry: ["Some Basic Concepts of Chemistry","Atomic Structure","Periodicity","Chemical Bonding","Thermodynamics","Equilibrium","Redox Reactions","States of Matter","Hydrogen","s-Block","p-Block (11th + 12th)","d and f Block","Coordination Compounds","Organic Chemistry Basics","Hydrocarbons","Haloalkanes & Haloarenes","Alcohols, Phenols, Ethers","Aldehydes, Ketones, Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life","Solid State","Solutions","Electrochemistry","Chemical Kinetics",
    ],
    Biology: ["Diversity in Living World","Structural Organisation in Plants & Animals","Cell Structure and Function","Plant Physiology","Human Physiology","Reproduction","Genetics and Evolution","Biology and Human Welfare","Biotechnology","Ecology and Environment",
    ],
  },
  AIIMS: {
    Physics: ["Units and Measurements","Kinematics","Laws of Motion","Work, Energy and Power","Rotational Motion","Gravitation","Properties of Matter (Solids & Fluids)","Thermodynamics","Kinetic Theory","Oscillations and Waves","Electrostatics","Current Electricity","Magnetism and Moving Charges","Electromagnetic Induction","Alternating Current","Optics (Ray + Wave)","Dual Nature of Matter","Atoms and Nuclei","Semiconductor Electronics",
    ],
    Chemistry: ["Some Basic Concepts of Chemistry","Atomic Structure","Periodicity","Chemical Bonding","Thermodynamics","Equilibrium","Redox Reactions","States of Matter","Hydrogen","s-Block","p-Block (11th + 12th)","d and f Block","Coordination Compounds","Organic Chemistry Basics","Hydrocarbons","Haloalkanes & Haloarenes","Alcohols, Phenols, Ethers","Aldehydes, Ketones, Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life","Solid State","Solutions","Electrochemistry","Chemical Kinetics",
    ],
    Biology: ["Diversity in Living World","Structural Organisation in Plants & Animals","Cell Structure and Function","Plant Physiology","Human Physiology","Reproduction","Genetics and Evolution","Biology and Human Welfare","Biotechnology","Ecology and Environment",
    ],"General Knowledge": ["Basic General Knowledge (Science + Current Affairs)",
    ],"Logical Reasoning": ["Assertion–Reasoning based concepts","Logical reasoning (patterns, coding-decoding, etc.)",
    ],
  },
  JIPMER: {
    Physics: ["Units and Measurements","Kinematics","Laws of Motion","Work, Energy and Power","Rotational Motion","Gravitation","Properties of Matter (Solids & Fluids)","Thermodynamics","Kinetic Theory","Oscillations and Waves","Electrostatics","Current Electricity","Magnetism and Moving Charges","Electromagnetic Induction","Alternating Current","Optics (Ray + Wave)","Dual Nature of Matter","Atoms and Nuclei","Semiconductor Electronics",
    ],
    Chemistry: ["Some Basic Concepts of Chemistry","Atomic Structure","Periodicity","Chemical Bonding","Thermodynamics","Equilibrium","Redox Reactions","States of Matter","Hydrogen","s-Block","p-Block (11th + 12th)","d and f Block","Coordination Compounds","Organic Chemistry Basics","Hydrocarbons","Haloalkanes & Haloarenes","Alcohols, Phenols, Ethers","Aldehydes, Ketones, Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life","Solid State","Solutions","Electrochemistry","Chemical Kinetics",
    ],
    Biology: ["Diversity in Living World","Structural Organisation in Plants & Animals","Cell Structure and Function","Plant Physiology","Human Physiology","Reproduction","Genetics and Evolution","Biology and Human Welfare","Biotechnology","Ecology and Environment",
    ],
    English: ["English comprehension","Grammar basics"],"Logical Reasoning": ["Logical puzzles"],
  },"INI-CET": {"All MBBS Subjects": ["Anatomy","Physiology","Biochemistry","Pathology","Pharmacology","Microbiology","Forensic Medicine","Community Medicine","Medicine","Surgery","Obstetrics & Gynecology","Pediatrics","Orthopedics","Dermatology","Psychiatry","Radiology","Anesthesia",
    ],
  },"MHT-CET (PCB)": {
    Physics: ["Units and Measurements","Kinematics","Laws of Motion","Work, Energy and Power","Rotational Motion","Gravitation","Properties of Matter (Solids & Fluids)","Thermodynamics","Kinetic Theory","Oscillations and Waves","Electrostatics","Current Electricity","Magnetism and Moving Charges","Electromagnetic Induction","Alternating Current","Optics (Ray + Wave)","Dual Nature of Matter","Atoms and Nuclei","Semiconductor Electronics","Communication Systems","Class 12 Physics (More Weight)",
    ],
    Chemistry: ["Some Basic Concepts of Chemistry","Atomic Structure","Periodicity","Chemical Bonding","Thermodynamics","Equilibrium","Redox Reactions","States of Matter","Hydrogen","s-Block","p-Block (11th + 12th)","d and f Block","Coordination Compounds","Organic Chemistry Basics","Hydrocarbons","Haloalkanes & Haloarenes","Alcohols, Phenols, Ethers","Aldehydes, Ketones, Carboxylic Acids","Amines","Biomolecules","Polymers","Chemistry in Everyday Life","Solid State","Solutions","Electrochemistry","Chemical Kinetics","Physical Chemistry numericals (Focus)","State board aligned Inorganic theory",
    ],
    Biology: ["Diversity in Living World","Structural Organisation in Plants & Animals","Cell Structure and Function","Plant Physiology","Human Physiology","Reproduction","Genetics and Evolution","Biology and Human Welfare","Biotechnology","Ecology and Environment","State board alignment variations",
    ],
  },"KCET (Med)": {
    Physics: ["NCERT (NEET level)","Class 11 & 12 Equal Weight","Concept-based variations",
    ],
    Chemistry: ["NCERT (NEET level)","Class 11 & 12 Equal Weight","Concept-based variations",
    ],
    Biology: ["NCERT (NEET level)","Class 11 & 12 Equal Weight","Concept-based variations",
    ],
  },"AP EAMCET": {
    Physics: ["NCERT (NEET level)","Formula-based Physics"],
    Chemistry: ["NCERT (NEET level)","Physical + Inorganic focus"],
    Biology: ["NCERT direct focus"],
  },
};

export const getChaptersForExam = (exam: ExamType): Chapter[] => {
  const examData = syllabusData[exam];
  if (!examData) return [];

  const chapters: Chapter[] = [];
  let idCounter = 1;

  Object.entries(examData).forEach(([subject, subjectChapters]) => {
    (subjectChapters as string[]).forEach((chapterName) => {
      chapters.push({
        id: `${exam.replace(/\s+/g,"")}-${subject}-${idCounter++}`,
        name: chapterName,
        subject: subject as SubjectType,
      });
    });
  });

  return chapters;
};
