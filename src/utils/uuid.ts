const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Injected so tests do not depend on the platform's generator. */
export type UuidSource = () => string;

const platformUuid: UuidSource = () => crypto.randomUUID();

export function generateUuids(
  count: number,
  source: UuidSource = platformUuid,
): string[] {
  const amount = Math.min(Math.max(1, Math.trunc(count)), 500);
  return Array.from({ length: amount }, source);
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

/** The version digit of a valid UUID, or null when it is not one. */
export function uuidVersion(value: string): number | null {
  const match = UUID_PATTERN.exec(value.trim());
  return match ? Number(match[1]) : null;
}
