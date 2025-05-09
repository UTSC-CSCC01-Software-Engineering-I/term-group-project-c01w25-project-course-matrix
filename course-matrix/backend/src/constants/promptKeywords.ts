// Keywords related to each namespace
export const NAMESPACE_KEYWORDS = {
  courses_v3: [
    "course",
    "class",
    "description",
    "about",
    "info",
    "tell me about",
    "syllabus",
    "overview",
    "details",
  ],
  offerings: [
    "offering",
    "schedule",
    "timetable",
    "when",
    "time",
    "section",
    "professor",
    "prof",
    "teach",
    "instructor",
    "taught by",
    "lecture",
    "lab",
    "tutorial",
    "exam",
    "online",
    "synchronous",
    "asynchronous",
    "delivery mode",
    "in person",
    "summer",
    "spring",
    "fall",
    "winter",
    "semester",
  ],
  prerequisites: [
    "prerequisite",
    "prereq",
    "required",
    "before",
    "prior",
    "need to take",
    "eligible",
    "must complete",
    "requirement",
  ],
  corequisites: [
    "corequisite",
    "coreq",
    "together with",
    "simultaneously",
    "concurrent",
    "co-enroll",
  ],
  departments: ["department", "faculty", "division"],
  programs: ["program", "major", "minor", "specialist", "degree", "stream"],
};

export const BREADTH_REQUIREMENT_KEYWORDS = {
  ART_LIT_LANG: [
    "art_lit_lang",
    "art literature",
    "arts literature",
    "art language",
    "arts language",
    "literature language",
    "art literature language",
    "arts literature language",
  ],
  HIS_PHIL_CUL: [
    "his_phil_cul",
    "history philosophy culture",
    "history, philosophy, culture",
    "history, philosophy, and culture",
    "history, philosophy",
    "history philosophy",
    "philosophy culture",
    "philosophy, culture",
    "history culture",
    "History, Philosophy and Cultural Studies",
  ],
  SOCIAL_SCI: ["social_sci", "social science", "social sciences"],
  NAT_SCI: ["nat_sci", "natural science", "natural sciences"],
  QUANT: ["quant", "quantitative reasoning", "quantitative"],
};

export const YEAR_LEVEL_KEYWORDS = {
  first_year: ["first year", "first-year", "a-level", "a level", "1st year"],
  second_year: ["second year", "second-year", "b-level", "b level", "2nd year"],
  third_year: ["third year", "third-year", "c-level", "c level", "3rd year"],
  fourth_year: ["fourth year", "fourth-year", "d-level", "d level", "4th year"],
};

// General academic terms that might indicate a search is needed
export const GENERAL_ACADEMIC_TERMS = ["credit", "enroll", "drop"];

// department codes
export const DEPARTMENT_CODES = [
  "afs",
  "ant",
  "vph",
  "cop",
  "acm",
  "vpa",
  "ast",
  "bio",
  "chm",
  "cit",
  "cla",
  "csc",
  "crt",
  "dts",
  "mge",
  "eng",
  "ees",
  "fst",
  "fre",
  "ggr",
  "gas",
  "glb",
  "hlt",
  "hcs",
  "his",
  "ids",
  "jou",
  "ect",
  "lin",
  "mga",
  "mgf",
  "mgh",
  "mgi",
  "mgm",
  "mgo",
  "mgs",
  "mgt",
  "mat",
  "mds",
  "muz",
  "mbt",
  "mro",
  "nme",
  "pmd",
  "phl",
  "psc",
  "phy",
  "pol",
  "psy",
  "rlg",
  "soc",
  "sta",
  "vps",
  "ctl",
  "thr",
  "wst",
];

// To filter out queries about the assistant itself
export const ASSISTANT_TERMS = [
  "you",
  "your",
  "yourself",
  "who are you",
  "what can you do",
  "your name",
  "what is your",
  "morpheus",
  "ai",
  "chatbot",
  "assistant",
  "matrix",
];

export const USEFUL_INFO = `
### Course code tips:
1. The 4th letter of a course code indicates the year level, with A, B, C, D being mapped to years 1, 2, 3, 4. (Eg. CSCA08H3 is a first year course because it's 4th letter is 'A')
2. The 2nd last letter of a course code indicates the credit weight and length of the course, with H being 0.5 credits and 1 semester in duration, and Y being 1 credits and 2 semesters in duration
3. The first 3 letters of a course code indicates the department.

### Offerings
1. Offerings are characterized by meeting_section (which can be LEC, TUT, or PRAC) and the day/time it occurs.
2. A given course can have more than 1 offering for a meeting_section. For example there can be two lectures for section LEC01, happening on different days. This means those enrolled in LEC01 should know about both offerings since they must attend both each week.
3. A course typically offers multiple lecture (LEC) sections and tutorial (TUT) / practical (PRAC) sections. Students are typically meant to enroll in a LEC section and one TUT/PRAC section for any given course, although some courses only have LEC sections.   
`;
