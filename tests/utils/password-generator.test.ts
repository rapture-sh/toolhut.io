import { describe, expect, it } from "vitest";
import {
  generatePassword,
  type PasswordOptions,
  PasswordOptionsError,
  passwordStrength,
  SYMBOLS,
} from "~/utils/password-generator";

const options = (over: Partial<PasswordOptions> = {}): PasswordOptions => ({
  length: 16,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  avoidAmbiguous: false,
  ...over,
});

/** Counts up without repeating, so the bytes handed out are predictable. */
const counting = () => {
  let offset = 0;
  return (length: number) => {
    const bytes = new Uint8Array(
      Array.from({ length }, (_, index) => (offset + index) % 256),
    );
    offset += length;
    return bytes;
  };
};

const fixed = (values: number[]) => {
  let index = 0;
  return (length: number) =>
    new Uint8Array(
      Array.from({ length }, () => {
        const value = values[index] ?? 0;
        index += 1;
        return value;
      }),
    );
};

describe("generatePassword", () => {
  it("should include a character from every set that is on", () => {
    const password = generatePassword(options({ length: 24 }));

    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()\-_=+[\]{};:,.?/]/);
  });

  it("should use only the sets that are on", () => {
    const password = generatePassword(
      options({ length: 40, uppercase: false, digits: false, symbols: false }),
    );

    expect(password).toMatch(/^[a-z]+$/);
  });

  it("should honour the length, at both ends of the slider", () => {
    expect(generatePassword(options({ length: 8 }))).toHaveLength(8);
    expect(generatePassword(options({ length: 128 }))).toHaveLength(128);
  });

  it("should leave out lookalike characters when asked", () => {
    const password = generatePassword(
      options({ length: 200, avoidAmbiguous: true }),
    );

    expect(password).not.toMatch(/[iIlLoO01]/);
    expect(password).toHaveLength(200);
  });

  it("should draw every character from the injected bytes, in order", () => {
    const password = generatePassword(
      options({
        length: 10,
        lowercase: false,
        uppercase: false,
        symbols: false,
      }),
      counting(),
    );

    expect([...password].sort().join("")).toBe("0123456789");
  });

  it("should throw away a byte that would bias the alphabet", () => {
    const password = generatePassword(
      options({
        length: 1,
        uppercase: false,
        digits: false,
        symbols: false,
      }),
      fixed([250]),
    );

    expect(password).toBe("a");
  });

  it("should refuse a combination it cannot satisfy", () => {
    expect(() => generatePassword(options({ length: 3 }))).toThrow(
      PasswordOptionsError,
    );
    expect(() => generatePassword(options({ length: 3 }))).toThrow(
      /at least|or more/,
    );
  });

  it("should refuse to generate with every set off", () => {
    expect(() =>
      generatePassword(
        options({
          lowercase: false,
          uppercase: false,
          digits: false,
          symbols: false,
        }),
      ),
    ).toThrow(PasswordOptionsError);
  });

  it("should refuse a length that is not a usable number", () => {
    expect(() => generatePassword(options({ length: 0 }))).toThrow(
      PasswordOptionsError,
    );
    expect(() => generatePassword(options({ length: 12.5 }))).toThrow(
      PasswordOptionsError,
    );
    expect(() => generatePassword(options({ length: 5000 }))).toThrow(
      PasswordOptionsError,
    );
  });

  it("should not repeat itself on the platform generator", () => {
    expect(generatePassword(options())).not.toBe(generatePassword(options()));
  });
});

describe("passwordStrength", () => {
  it("should count only the sets the password actually uses", () => {
    expect(passwordStrength("abcdefgh").alphabet).toBe(26);
    expect(passwordStrength("abcdEFGH").alphabet).toBe(52);
    expect(passwordStrength("abcdEF12").alphabet).toBe(62);
    expect(passwordStrength("abcdEF12!").alphabet).toBe(62 + SYMBOLS.length);
  });

  it("should read entropy as length times the bits per character", () => {
    expect(passwordStrength("abcd").bits).toBeCloseTo(4 * Math.log2(26), 1);
  });

  it("should rise with length", () => {
    const short = passwordStrength("aB3!aB3!");
    const long = passwordStrength("aB3!aB3!aB3!aB3!aB3!");

    expect(long.bits).toBeGreaterThan(short.bits);
  });

  it("should label an empty password as weak with no entropy", () => {
    expect(passwordStrength("")).toEqual({
      alphabet: 0,
      bits: 0,
      label: "weak",
    });
  });

  it("should move through the labels as the password grows", () => {
    expect(passwordStrength("aB3!aB").label).toBe("weak");
    expect(passwordStrength("aB3!aB3!a").label).toBe("fair");
    expect(passwordStrength("aB3!aB3!aB3!").label).toBe("strong");
    expect(passwordStrength("aB3!aB3!aB3!aB3!").label).toBe("very strong");
  });
});
