export const convertYearLevel = (code: string) => {
  if (code === "first_year") return "1st year";
  else if (code === "second_year") return "2nd year";
  else if (code === "third_year") return "3rd year";
  else if (code === "fourth_year") return "4th year";
  else return "";
};
