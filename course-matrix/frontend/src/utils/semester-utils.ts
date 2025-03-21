export function getSemesterStartAndEndDates(semester: string) {
  return {
    start:
      semester === "Summer 2025"
        ? "2025-05-02"
        : semester === "Fall 2025"
          ? "2025-09-02"
          : "2026-01-05",
    end:
      semester === "Summer 2025"
        ? "2025-08-07"
        : semester === "Fall 2025"
          ? "2025-12-02"
          : "2026-04-06",
  };
}


export function getSemesterStartAndEndDatesPlusOneWeek(semester: string) {
  // Note: We make the start date 1 week after actual in order to not trunacte first week of calendar
  return {
    start:
      semester === "Summer 2025"
        ? "2025-05-09"
        : semester === "Fall 2025"
          ? "2025-09-09"
          : "2026-01-12",
    end:
      semester === "Summer 2025"
        ? "2025-08-07"
        : semester === "Fall 2025"
          ? "2025-12-02"
          : "2026-04-06",
  };
}
