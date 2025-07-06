// Format the date to a string
export function formatDate(date: Date): string {
  return new Date(date).toDateString();
}

// Capitalize the first letter
export function capitalize(str: string): string {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}