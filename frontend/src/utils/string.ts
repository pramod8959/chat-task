/**
 * Capitalize the first letter of each word in a string
 * Example: "john doe" -> "John Doe"
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Capitalize only the first letter of a string
 * Example: "john doe" -> "John doe"
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
