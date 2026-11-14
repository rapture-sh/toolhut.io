import { describe, expect, it } from "vitest";
import {
  decodeJwt,
  describeClaims,
  isExpired,
  JwtDecodeError,
  tokenValidity,
} from "~/utils/jwt-decoder";

const HEADER = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
const PAYLOAD =
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaXNzIjoidG9vbGh1dCIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ";
const SIGNATURE = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const TOKEN = `${HEADER}.${PAYLOAD}.${SIGNATURE}`;

const ISSUED_AT = 1516239022000;
const EXPIRES_AT = 1516242622000;

describe("decodeJwt", () => {
  it("reads the header, the payload and the untouched signature", () => {
    const decoded = decodeJwt(TOKEN);

    expect(decoded.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(decoded.payload).toEqual({
      sub: "1234567890",
      name: "Jane Doe",
      iss: "toolhut",
      iat: 1516239022,
      exp: 1516242622,
    });
    expect(decoded.signature).toBe(SIGNATURE);
    expect(decoded.raw).toBe(TOKEN);
  });

  it("ignores a Bearer prefix and any wrapped whitespace", () => {
    const decoded = decodeJwt(`  Bearer ${HEADER}.${PAYLOAD}\n.${SIGNATURE} `);

    expect(decoded.raw).toBe(TOKEN);
    expect(decoded.header).toEqual({ alg: "HS256", typ: "JWT" });
  });

  it("decodes the url safe alphabet without padding", () => {
    const decoded = decodeJwt(`${HEADER}.eyJuYW1lIjoiw6Q_w7Y-In0.${SIGNATURE}`);

    expect(decoded.payload).toEqual({ name: "ä?ö>" });
  });

  it("accepts an empty signature, which an unsigned token has", () => {
    const decoded = decodeJwt(`${HEADER}.${PAYLOAD}.`);

    expect(decoded.signature).toBe("");
  });

  it("rejects a token that is not three parts", () => {
    expect(() => decodeJwt(`${HEADER}.${PAYLOAD}`)).toThrow(JwtDecodeError);
    expect(() => decodeJwt(`${HEADER}.${PAYLOAD}`)).toThrow(
      "A JSON web token has three parts separated by dots. This one has 2.",
    );
  });

  it("rejects an empty input", () => {
    expect(() => decodeJwt("   ")).toThrow(JwtDecodeError);
  });

  it("rejects a part that is not base64url", () => {
    expect(() => decodeJwt(`${HEADER}.pay!load.${SIGNATURE}`)).toThrow(
      "The payload of this token is not base64url text, so it cannot be decoded.",
    );
  });

  it("rejects a part that decodes to something other than a JSON object", () => {
    const text = "aGVsbG8";
    const array = "WzEsMl0";

    expect(() => decodeJwt(`${HEADER}.${text}.${SIGNATURE}`)).toThrow(
      "The payload of this token is not JSON.",
    );
    expect(() => decodeJwt(`${HEADER}.${array}.${SIGNATURE}`)).toThrow(
      "The payload of this token is JSON, but not a JSON object.",
    );
  });

  it("rejects an empty header", () => {
    expect(() => decodeJwt(`.${PAYLOAD}.${SIGNATURE}`)).toThrow(
      "The header of this token is empty.",
    );
  });
});

describe("isExpired", () => {
  it("reads exp against the time it is given", () => {
    const { payload } = decodeJwt(TOKEN);

    expect(isExpired(payload, EXPIRES_AT - 1)).toBe(false);
    expect(isExpired(payload, EXPIRES_AT)).toBe(true);
    expect(isExpired(payload, EXPIRES_AT + 86_400_000)).toBe(true);
  });

  it("is false for a token that never expires", () => {
    expect(isExpired({ sub: "abc" }, EXPIRES_AT)).toBe(false);
  });
});

describe("tokenValidity", () => {
  it("separates valid, expired, early and unknown", () => {
    expect(tokenValidity({ exp: 1516242622 }, ISSUED_AT)).toBe("valid");
    expect(tokenValidity({ exp: 1516242622 }, EXPIRES_AT + 1000)).toBe(
      "expired",
    );
    expect(tokenValidity({ nbf: 1516242622 }, ISSUED_AT)).toBe("early");
    expect(tokenValidity({ sub: "abc" }, ISSUED_AT)).toBe("unknown");
  });
});

describe("describeClaims", () => {
  it("names the claims and says how long is left", () => {
    const { payload } = decodeJwt(TOKEN);
    const rows = describeClaims(payload, ISSUED_AT);

    expect(rows.map((row) => row.claim)).toEqual(["iss", "sub", "iat", "exp"]);
    expect(rows).toContainEqual({
      claim: "exp",
      label: "Expires",
      value: "2018-01-18 02:30:22 UTC",
      note: "1 hour left",
      problem: false,
    });
    expect(rows).toContainEqual({
      claim: "iss",
      label: "Issuer",
      value: "toolhut",
      problem: false,
    });
  });

  it("marks an expired token as the problem", () => {
    const { payload } = decodeJwt(TOKEN);
    const expiry = describeClaims(payload, EXPIRES_AT + 7_200_000).find(
      (row) => row.claim === "exp",
    );

    expect(expiry?.note).toBe("expired 2 hours ago");
    expect(expiry?.problem).toBe(true);
  });

  it("marks a token that is not valid yet", () => {
    const rows = describeClaims({ nbf: 1516242622 }, ISSUED_AT);

    expect(rows).toEqual([
      {
        claim: "nbf",
        label: "Not valid before",
        value: "2018-01-18 02:30:22 UTC",
        note: "not valid for another 1 hour",
        problem: true,
      },
    ]);
  });

  it("joins a list of audiences", () => {
    const rows = describeClaims({ aud: ["one", "two"] }, ISSUED_AT);

    expect(rows[0].value).toBe("one, two");
  });

  it("returns nothing for a payload with none of the known claims", () => {
    expect(describeClaims({ custom: true }, ISSUED_AT)).toEqual([]);
  });

  it("says so when a time claim is not a number", () => {
    const rows = describeClaims({ exp: "soon" }, ISSUED_AT);

    expect(rows[0].problem).toBe(true);
    expect(rows[0].value).toBe("soon");
  });
});
