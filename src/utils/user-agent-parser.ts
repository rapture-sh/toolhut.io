import Bowser from "bowser";

/** Thrown when there is no user agent string to read. */
export class UserAgentError extends Error {
  constructor(message = "Paste a user agent string to read it.") {
    super(message);
    this.name = "UserAgentError";
  }
}

export interface UserAgentRow {
  label: string;
  value: string;
}

/** What a row says when the string does not carry that detail. */
export const NOT_STATED = "not stated";

function present(...parts: (string | undefined)[]): string {
  const value = parts
    .map((part) => part?.trim() ?? "")
    .filter((part) => part !== "")
    .join(" ");

  return value === "" ? NOT_STATED : value;
}

function titleCase(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * The rows are a fixed list in a fixed order, so the table does not jump
 * around as one string is swapped for another.
 */
export function parseUserAgent(input: string): UserAgentRow[] {
  const userAgent = input.trim();

  if (userAgent === "") {
    throw new UserAgentError();
  }

  const { browser, engine, os, platform } = Bowser.parse(userAgent);

  return [
    { label: "Browser", value: present(browser.name) },
    { label: "Browser version", value: present(browser.version) },
    { label: "Engine", value: present(engine.name, engine.version) },
    { label: "Operating system", value: present(os.name) },
    { label: "System version", value: present(os.versionName ?? os.version) },
    { label: "Platform", value: present(titleCase(platform.type)) },
    { label: "Device", value: present(platform.vendor, platform.model) },
  ];
}

/** The rows as plain text, which is what the copy button hands over. */
export function summariseUserAgent(rows: UserAgentRow[]): string {
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
}
