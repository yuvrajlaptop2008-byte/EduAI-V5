export type Difficulty ="Easy" |"Medium" |"Hard";

export type ChapterStatus ="locked" |"unlocked" |"completed";

export interface Chapter {
  id: string;
  name: string;
  difficulty: Difficulty;
  questionCount: number;
  status: ChapterStatus;
}

export interface SubjectData {
  name: string;
  chapters: Chapter[];
}

export interface ExamData {
  examName: string;
  subjects: {
    [subjectName: string]: SubjectData;
  };
}

export interface DPPDataStructure {
  [examId: string]: ExamData;
}

export const DPP_DATA: DPPDataStructure = {"jee-main": {
    examName:"JEE Main",
    subjects: {
      Physics: {
        name:"Physics",
        chapters: [
          {
            id:"phy-1",
            name:"Units and Measurements",
            difficulty:"Easy",
            questionCount: 20,
            status:"completed",
          },
          {
            id:"phy-2",
            name:"Kinematics",
            difficulty:"Medium",
            questionCount: 25,
            status:"unlocked",
          },
          {
            id:"phy-3",
            name:"Laws of Motion",
            difficulty:"Hard",
            questionCount: 30,
            status:"locked",
          },
          {
            id:"phy-4",
            name:"Work, Energy and Power",
            difficulty:"Medium",
            questionCount: 20,
            status:"locked",
          },
          {
            id:"phy-5",
            name:"Rotational Motion",
            difficulty:"Hard",
            questionCount: 35,
            status:"locked",
          },
        ],
      },
      Chemistry: {
        name:"Chemistry",
        chapters: [
          {
            id:"chem-1",
            name:"Some Basic Concepts of Chemistry",
            difficulty:"Easy",
            questionCount: 15,
            status:"unlocked",
          },
          {
            id:"chem-2",
            name:"Structure of Atom",
            difficulty:"Medium",
            questionCount: 20,
            status:"unlocked",
          },
          {
            id:"chem-3",
            name:"Chemical Bonding",
            difficulty:"Hard",
            questionCount: 25,
            status:"locked",
          },
          {
            id:"chem-4",
            name:"Thermodynamics",
            difficulty:"Hard",
            questionCount: 30,
            status:"locked",
          },
        ],
      },
      Mathematics: {
        name:"Mathematics",
        chapters: [
          {
            id:"math-1",
            name:"Sets, Relations and Functions",
            difficulty:"Medium",
            questionCount: 25,
            status:"completed",
          },
          {
            id:"math-2",
            name:"Complex Numbers",
            difficulty:"Medium",
            questionCount: 20,
            status:"unlocked",
          },
          {
            id:"math-3",
            name:"Matrices and Determinants",
            difficulty:"Easy",
            questionCount: 30,
            status:"locked",
          },
          {
            id:"math-4",
            name:"Calculus",
            difficulty:"Hard",
            questionCount: 40,
            status:"locked",
          },
        ],
      },
    },
  },
  neet: {
    examName:"NEET",
    subjects: {
      Physics: {
        name:"Physics",
        chapters: [
          {
            id:"neet-phy-1",
            name:"Physical World and Measurement",
            difficulty:"Easy",
            questionCount: 15,
            status:"completed",
          },
          {
            id:"neet-phy-2",
            name:"Kinematics",
            difficulty:"Medium",
            questionCount: 25,
            status:"unlocked",
          },
          {
            id:"neet-phy-3",
            name:"Laws of Motion",
            difficulty:"Medium",
            questionCount: 20,
            status:"locked",
          },
        ],
      },
      Chemistry: {
        name:"Chemistry",
        chapters: [
          {
            id:"neet-chem-1",
            name:"Structure of Atom",
            difficulty:"Easy",
            questionCount: 20,
            status:"unlocked",
          },
          {
            id:"neet-chem-2",
            name:"Chemical Bonding",
            difficulty:"Medium",
            questionCount: 25,
            status:"locked",
          },
        ],
      },
      Biology: {
        name:"Biology",
        chapters: [
          {
            id:"bio-1",
            name:"Diversity in Living World",
            difficulty:"Easy",
            questionCount: 30,
            status:"unlocked",
          },
          {
            id:"bio-2",
            name:"Structural Organisation in Animals and Plants",
            difficulty:"Medium",
            questionCount: 25,
            status:"locked",
          },
          {
            id:"bio-3",
            name:"Cell Structure and Function",
            difficulty:"Medium",
            questionCount: 35,
            status:"locked",
          },
          {
            id:"bio-4",
            name:"Human Physiology",
            difficulty:"Hard",
            questionCount: 40,
            status:"locked",
          },
        ],
      },
    },
  },
};
