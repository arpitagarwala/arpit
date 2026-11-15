// Rewrite former public contact addresses in saved content without changing owner credentials.
export const PROFESSIONAL_EMAIL = "connect@arpitagarwala.com";
export function professionalContactText(value: string): string {
  return value.replace(/(?<![\w.+@%\x2d])(?:arpitagarwalms(?:@|%40)gmail\.com|contact(?:@|%40)arpitagarwala\.com)(?![\w@\x2d]|\.[a-z])/gi,
    match => match.includes("%40") ? PROFESSIONAL_EMAIL.replace("@", "%40") : PROFESSIONAL_EMAIL);
}
export function publicContact<T>(value: T): T {
  const json = JSON.stringify(value);
  return json === undefined ? value : JSON.parse(professionalContactText(json));
}
