export const DEV_ACCOUNT_EMAIL = "tickle1231@naver.com";

let currentUserEmail: string | null = null;

export function normalizeEmail(email?: string | null): string | null {
  const next = email?.trim().toLowerCase();
  return next ? next : null;
}

export function setCurrentUserEmail(email?: string | null) {
  currentUserEmail = normalizeEmail(email);
}

export function isDevAccountEmail(email?: string | null): boolean {
  return normalizeEmail(email) === DEV_ACCOUNT_EMAIL;
}

/** AuthProvider가 세션 이메일을 넣은 뒤에만 true */
export function isDevAccount(): boolean {
  return isDevAccountEmail(currentUserEmail);
}
