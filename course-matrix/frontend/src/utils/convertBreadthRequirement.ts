export const convertBreadthRequirement = (code: string) => {
  if (code === "ART_LIT_LANG") return "Arts, Literature and Language"
  else if (code === "HIS_PHIL_CUL") return "History, Philosophy and Cultural Studies "
  else if (code === "SOCIAL_SCI") return "Social and Behavioral Sciences"
  else if (code === "NAT_SCI") return "Natural Sciences"
  else if (code === "QUANT") return "Quantitative Reasoning"
  else return ""
} 