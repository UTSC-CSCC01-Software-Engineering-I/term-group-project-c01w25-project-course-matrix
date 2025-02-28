export const codeToYear = (courseCode: string) => {
  const letter = courseCode.slice(3, 4);
  switch (letter) {
    case "A":
      return 1;
      break;
    case "B":
      return 2;
      break;
    case "C":
      return 3;
      break;
    case "D":
      return 4;
      break;
    default:
      break;
  }
};

export const yearToCode = (year: number) => {
  switch (year) {
    case 1:
      return "A";
      break;
    case 2:
      return "B";
      break;
    case 3:
      return "C";
      break;
    case 4:
      return "D";
      break;
    default:
      break;
  }
};

// Set minimum results wanted for a similarity search on the associated namespace.
export const namespaceToMinResults = new Map();
namespaceToMinResults.set("courses", 5);
namespaceToMinResults.set("offerings", 16); // Typically, more offering info is wanted.
namespaceToMinResults.set("prerequisites", 5);
namespaceToMinResults.set("corequisites", 5);
namespaceToMinResults.set("departments", 5);
