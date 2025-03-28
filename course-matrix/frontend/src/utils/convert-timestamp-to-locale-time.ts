export function convertTimestampToLocaleTime(
  timestampz: string | number,
): string {
  const date = new Date(timestampz);
  return date.toLocaleString(); // Uses system's default locale
}
