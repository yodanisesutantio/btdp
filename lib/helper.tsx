export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
};

export const getPasswordStrength = (password: string) => {
  if (!password) return "none";

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z\d]/.test(password);

  const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(
    Boolean,
  ).length;

  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
};

export const getConfirmStatus = (password: string, confirm: string) => {
  if (!confirm) return "none";
  return password === confirm ? "match" : "mismatch";
};
