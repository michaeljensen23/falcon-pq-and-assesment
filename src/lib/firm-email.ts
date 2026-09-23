/** Firm Google Workspace domain. Only these accounts may use the workspace. */
export const FIRM_EMAIL_DOMAIN = "falconwp.com";

export function isFirmEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 1) return false;
  return normalized.slice(at + 1) === FIRM_EMAIL_DOMAIN;
}
