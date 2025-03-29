export function convertTimestampToLocaleTime(
    timestampz: string|number,
    ): string {
  const date = new Date(timestampz);
  console.log(timestampz);
  console.log(date);
  console.log(date.toLocaleString());

  return date.toLocaleString();  // Uses system's default locale
}
