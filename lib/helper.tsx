export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
};

export const generateBoardPrefix = (boardName: string) => {
  const words = boardName.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "TASK";
  }

  const prefix = words.map((word) => word.charAt(0).toUpperCase()).join("");

  return prefix.slice(0, 7);
};

export const getPasswordStrength = (password: string) => {
  if (!password) return "none";

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z\d]/.test(password);
  const passwordLongEnough = password.length > 7;

  const score = [
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    passwordLongEnough,
  ].filter(Boolean).length;

  if (score <= 1) return "weak";
  if (score <= 4) return "medium";
  return "strong";
};

export const getConfirmStatus = (password: string, confirm: string) => {
  if (!confirm) return "none";
  return password === confirm ? "match" : "mismatch";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeContent = (content: any) => {
  if (!content) {
    return [
      {
        type: "p",
        children: [{ text: "" }],
      },
    ];
  }

  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      return [
        {
          type: "p",
          children: [{ text: content }],
        },
      ];
    }
  }

  if (Array.isArray(content)) return content;

  return [
    {
      type: "p",
      children: [{ text: "" }],
    },
  ];
};
