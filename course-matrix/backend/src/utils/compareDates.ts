export const compareDates = (date1: Date, date2: Date) => {
  if (date1 < date2) {
    return -1;
  } else if (date1 > date2) {
    return 1;
  } else {
    return 0;
  }
};

export const isDateBetween = (date: Date, start: Date, end: Date): boolean => {
  return compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
};
