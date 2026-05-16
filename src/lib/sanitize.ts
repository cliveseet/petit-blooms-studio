const ANGLE_BRACKETS = /[<>]/g;
const SPACES = /[ \t]{2,}/g;

function removeControlChars(value: string) {
  return Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    return (code >= 0 && code <= 8) ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31) ||
      code === 127
      ? " "
      : char;
  }).join("");
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength).trim() : value;
}

export function sanitizeText(value: unknown, maxLength = 255) {
  return truncate(
    removeControlChars(String(value ?? "").normalize("NFKC"))
      .replace(ANGLE_BRACKETS, "")
      .replace(/\s+/g, " ")
      .trim(),
    maxLength,
  );
}

export function sanitizeMultiline(value: unknown, maxLength = 1200) {
  return truncate(
    removeControlChars(String(value ?? "").normalize("NFKC"))
      .replace(ANGLE_BRACKETS, "")
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.replace(SPACES, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    maxLength,
  );
}

export function sanitizeEmail(value: unknown) {
  return sanitizeText(value, 254).toLowerCase();
}

export function sanitizeCode(value: unknown, maxLength = 32) {
  return sanitizeText(value, maxLength)
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}
