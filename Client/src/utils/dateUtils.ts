// src/utils/dateUtils.ts

/**
 * Formats a date string (e.g., "2025-05-29 11:49:32.479378") to "DD/MM/YYYY"
 */
export function formatDateToDDMMYYYY(dateInput: string | Date): string {
  const date =
    typeof dateInput === "string"
      ? new Date(dateInput.replace(" ", "T")) // Ensure ISO format for parsing
      : dateInput;

  if (isNaN(date.getTime())) return "-";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
