export const MIN_PASSWORD_LENGTH = 12;
export const PASSWORD_POLICY_DESCRIPTION = `Au moins ${MIN_PASSWORD_LENGTH} caractères, avec une minuscule, une majuscule, un chiffre et un symbole.`;

export function meetsPasswordPolicy(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9\s]/.test(password);
}
