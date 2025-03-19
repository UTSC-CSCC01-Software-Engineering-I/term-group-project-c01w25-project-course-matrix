export function getSemesterStartAndEndDates(semester: string) {
    return {
      start:
        semester === "Summer 2025"
          ? "2025-05-02"
          : semester === "Fall 2025"
            ? "2025-09-03"
            : "2026-01-06",
      end:
        semester === "Summer 2025"
          ? "2025-08-07"
          : semester === "Fall 2025"
            ? "2025-12-03"
            : "2026-04-04",
    };
  }