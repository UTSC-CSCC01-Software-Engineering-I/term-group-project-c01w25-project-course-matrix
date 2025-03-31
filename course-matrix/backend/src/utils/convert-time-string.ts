export function convertTimeStringToDate(timeString: string): Date {
  // Validate the timeString format (HH:mm:ss)
  const isValidFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
    timeString,
  );
  if (!isValidFormat) {
    throw new Error("Invalid time format. Expected HH:mm:ss");
  }

  const date = new Date();

  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);
  date.setMilliseconds(0);

  // Convert to EDT (GMT-4)
  // First get the UTC time by adding the local timezone offset
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

  // Then subtract 4 hours for EDT
  const edtOffset = -4 * 60 * 60000;
  const edtDate = new Date(utcDate.getTime() + edtOffset);

  console.log("Original date:", date);
  console.log("EDT date:", edtDate);

  return edtDate;
}
