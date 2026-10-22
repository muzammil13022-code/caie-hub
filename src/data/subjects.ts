// ---------------------------------------------------------------------------
// Subject definitions — edit this file to add/rename subjects or retune dates.
// syllabusStart = first exam year of the syllabus version that is current
// (papers before it use a superseded syllabus and are not shown).
// ---------------------------------------------------------------------------

export interface Subject {
  code: string;
  name: string;
  short: string;
  color: string;
  /** first exam year of the currently-examinable syllabus version */
  syllabusStart: number;
  /** paper number -> plain-language title for the current syllabus */
  paperTitles: Record<number, string>;
  /** official Cambridge qualification-page slug */
  officialSlug: string;
}

export const SUBJECTS: Subject[] = [
  {
    code: "9709",
    name: "Mathematics",
    short: "Maths",
    color: "#7C9EF5",
    syllabusStart: 2020,
    paperTitles: {
      1: "Pure Mathematics 1",
      2: "Pure Mathematics 2",
      3: "Pure Mathematics 3",
      4: "Mechanics",
      5: "Probability & Statistics 1",
      6: "Probability & Statistics 2",
      7: "Probability & Statistics 2",
    },
    officialSlug: "cambridge-international-as-and-a-level-mathematics-9709",
  },
  {
    code: "9702",
    name: "Physics",
    short: "Physics",
    color: "#A78BFA",
    syllabusStart: 2022,
    paperTitles: {
      1: "Multiple Choice (AS)",
      2: "AS Structured Questions",
      3: "Advanced Practical Skills",
      4: "A Level Structured Questions",
      5: "Planning, Analysis & Evaluation",
    },
    officialSlug: "cambridge-international-as-and-a-level-physics-9702",
  },
  {
    code: "9701",
    name: "Chemistry",
    short: "Chemistry",
    color: "#34C2A9",
    syllabusStart: 2022,
    paperTitles: {
      1: "Multiple Choice (AS)",
      2: "AS Structured Questions",
      3: "Advanced Practical Skills",
      4: "A Level Structured Questions",
      5: "Planning, Analysis & Evaluation",
    },
    officialSlug: "cambridge-international-as-and-a-level-chemistry-9701",
  },
  {
    code: "9700",
    name: "Biology",
    short: "Biology",
    color: "#5FBF7A",
    syllabusStart: 2022,
    paperTitles: {
      1: "Multiple Choice (AS)",
      2: "AS Structured Questions",
      3: "Advanced Practical Skills",
      4: "A Level Structured Questions",
      5: "Planning, Analysis & Evaluation",
    },
    officialSlug: "cambridge-international-as-and-a-level-biology-9700",
  },
  {
    code: "9618",
    name: "Computer Science",
    short: "CS",
    color: "#E2A64F",
    syllabusStart: 2021,
    paperTitles: {
      1: "Theory Fundamentals (AS)",
      2: "Fundamental Problem-solving & Programming (AS)",
      3: "Advanced Theory",
      4: "Practical",
    },
    officialSlug: "cambridge-international-as-and-a-level-computer-science-9618",
  },
  {
    code: "9626",
    name: "Information Technology",
    short: "IT",
    color: "#D97FB0",
    syllabusStart: 2020,
    paperTitles: {
      1: "Written Paper (AS)",
      2: "Source-based Paper (AS)",
      3: "Written Paper (A2)",
      4: "Practical (A2)",
    },
    officialSlug: "cambridge-international-as-and-a-level-information-technology-9626",
  },
  {
    code: "9990",
    name: "Psychology",
    short: "Psychology",
    color: "#E07A5F",
    syllabusStart: 2020,
    paperTitles: {
      1: "Approaches, Issues & Debates",
      2: "Research Methods",
      3: "Specialist Options",
      4: "Applications & Research Analysis",
    },
    officialSlug: "cambridge-international-as-and-a-level-psychology-9990",
  },
  {
    code: "9609",
    name: "Business",
    short: "Business",
    color: "#C9A227",
    syllabusStart: 2023,
    paperTitles: {
      1: "Business Concepts 1 (AS)",
      2: "Business Concepts 2 (AS)",
      3: "Business Decision-making (A2)",
      4: "Business Strategy (A2)",
    },
    officialSlug: "cambridge-international-as-and-a-level-business-9609",
  },
  {
    code: "9706",
    name: "Accounting",
    short: "Accounting",
    color: "#63B3E0",
    syllabusStart: 2023,
    paperTitles: {
      1: "Multiple Choice (AS)",
      2: "AS Structured Questions",
      3: "A Level Structured Questions",
    },
    officialSlug: "cambridge-international-as-and-a-level-accounting-9706",
  },
  {
    code: "9708",
    name: "Economics",
    short: "Economics",
    color: "#57A99A",
    syllabusStart: 2023,
    paperTitles: {
      1: "Multiple Choice (AS)",
      2: "Data Response & Essay (AS)",
      3: "Multiple Choice (A2)",
      4: "Data Response & Essay (A2)",
    },
    officialSlug: "cambridge-international-as-and-a-level-economics-9708",
  },
];

export const SESSION_NAMES: Record<string, string> = {
  m: "February / March",
  s: "May / June",
  w: "October / November",
};

export function subjectByCode(code: string): Subject | undefined {
  return SUBJECTS.find((s) => s.code === code);
}

export function subjectBySlug(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.code === slug);
}

export const siteTitle = "Paperline";
export const siteTagline = "CAIE AS & A Level past papers and topical practice, current syllabus only.";
