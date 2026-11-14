import { describe, expect, it } from "vitest";
import {
  EMPTY_QR_FIELDS,
  escapeWifiValue,
  isTooLong,
  QrInputError,
  qrCapacity,
  qrFieldsEmpty,
  qrInputFor,
  qrMatrix,
  qrPath,
  qrSvg,
} from "~/utils/qr-code";

function fields(overrides: Partial<typeof EMPTY_QR_FIELDS> = {}) {
  return { ...EMPTY_QR_FIELDS, ...overrides };
}

describe("qrInputFor", () => {
  it("passes plain text through untouched", () => {
    expect(qrInputFor("text", fields({ text: "hello toolhut" }))).toBe(
      "hello toolhut",
    );
  });

  it("adds https to a bare domain", () => {
    expect(qrInputFor("url", fields({ url: "toolhut.io/tools" }))).toBe(
      "https://toolhut.io/tools",
    );
  });

  it("keeps a scheme that is already there", () => {
    expect(qrInputFor("url", fields({ url: "http://toolhut.io/" }))).toBe(
      "http://toolhut.io/",
    );
  });

  it("rejects something that is not a web address", () => {
    expect(() => qrInputFor("url", fields({ url: "not a link" }))).toThrow(
      QrInputError,
    );
  });

  it("builds a wifi payload", () => {
    expect(
      qrInputFor("wifi", fields({ ssid: "Coffee", password: "beans123" })),
    ).toBe("WIFI:T:WPA;S:Coffee;P:beans123;;");
  });

  it("escapes the separators a wifi value may contain", () => {
    expect(
      qrInputFor(
        "wifi",
        fields({ ssid: "Bar;Grill", password: 'a\\b;c,d:e"f' }),
      ),
    ).toBe('WIFI:T:WPA;S:Bar\\;Grill;P:a\\\\b\\;c\\,d\\:e\\"f;;');
  });

  it("drops the password when the network is open", () => {
    expect(
      qrInputFor("wifi", fields({ ssid: "Free", security: "nopass" })),
    ).toBe("WIFI:T:nopass;S:Free;;");
  });

  it("marks a hidden network", () => {
    expect(
      qrInputFor(
        "wifi",
        fields({ ssid: "Quiet", password: "shh", hidden: true }),
      ),
    ).toBe("WIFI:T:WPA;S:Quiet;P:shh;H:true;;");
  });

  it("asks for a password on a secured network", () => {
    expect(() => qrInputFor("wifi", fields({ ssid: "Coffee" }))).toThrow(
      QrInputError,
    );
  });

  it("builds a mailto with a subject and a body", () => {
    expect(
      qrInputFor(
        "email",
        fields({
          address: "hello@toolhut.io",
          subject: "A hello",
          body: "two words",
        }),
      ),
    ).toBe("mailto:hello@toolhut.io?subject=A%20hello&body=two%20words");
  });

  it("rejects an address that is not one", () => {
    expect(() => qrInputFor("email", fields({ address: "hello" }))).toThrow(
      QrInputError,
    );
  });

  it("explains an empty field rather than encoding nothing", () => {
    expect(() => qrInputFor("text", EMPTY_QR_FIELDS)).toThrow(
      "Type something to turn into a QR code.",
    );
  });
});

describe("escapeWifiValue", () => {
  it("leaves an ordinary password alone", () => {
    expect(escapeWifiValue("hunter2")).toBe("hunter2");
  });

  it("escapes a backslash before anything else", () => {
    expect(escapeWifiValue("a\\;b")).toBe("a\\\\\\;b");
  });
});

describe("qrFieldsEmpty", () => {
  it("is true for untouched fields", () => {
    expect(qrFieldsEmpty("text", EMPTY_QR_FIELDS)).toBe(true);
  });

  it("treats whitespace as empty", () => {
    expect(qrFieldsEmpty("url", fields({ url: "   " }))).toBe(true);
  });

  it("only looks at the fields of the chosen kind", () => {
    expect(qrFieldsEmpty("wifi", fields({ text: "ignored" }))).toBe(true);
    expect(qrFieldsEmpty("wifi", fields({ ssid: "Coffee" }))).toBe(false);
  });
});

describe("isTooLong", () => {
  it("accepts a payload that fits", () => {
    expect(isTooLong("x".repeat(qrCapacity("H")), "H")).toBe(false);
  });

  it("rejects one byte past the capacity", () => {
    expect(isTooLong("x".repeat(qrCapacity("H") + 1), "H")).toBe(true);
  });

  it("counts UTF-8 bytes rather than characters", () => {
    expect(isTooLong("x".repeat(319), "H")).toBe(false);
    expect(isTooLong("👋".repeat(319), "H")).toBe(true);
  });
});

describe("qrMatrix", () => {
  it("returns a square grid with the border included", () => {
    const matrix = qrMatrix("hello", { level: "M", border: 2 });

    expect(matrix.size).toBe(25);
    expect(matrix.modules).toHaveLength(25);
    expect(matrix.modules.every((row) => row.length === 25)).toBe(true);
  });

  it("keeps the quiet border light", () => {
    const { modules } = qrMatrix("hello", { level: "M", border: 2 });

    expect(modules[0]?.some((dark) => dark)).toBe(false);
  });

  it("refuses an empty payload", () => {
    expect(() => qrMatrix("", { level: "L" })).toThrow(QrInputError);
  });

  it("refuses a payload past the capacity of the level", () => {
    expect(() => qrMatrix("x".repeat(3000), { level: "L" })).toThrow(
      QrInputError,
    );
  });
});

describe("qrPath", () => {
  it("draws one square per dark module", () => {
    const matrix = {
      size: 2,
      modules: [
        [true, false],
        [false, true],
      ],
    };

    expect(qrPath(matrix)).toBe("M0,0h1v1h-1zM1,1h1v1h-1z");
  });

  it("is empty when nothing is dark", () => {
    expect(qrPath({ size: 1, modules: [[false]] })).toBe("");
  });
});

describe("qrSvg", () => {
  it("writes a sized box around the module grid", () => {
    const svg = qrSvg("hello", { level: "M", border: 2, size: 320 });

    expect(svg).toContain('width="320" height="320"');
    expect(svg).toContain('viewBox="0 0 25 25"');
    expect(svg).toContain('fill="white"');
    expect(svg.endsWith("</svg>")).toBe(true);
  });

  it("refuses a payload it cannot encode", () => {
    expect(() => qrSvg("", { level: "M", size: 320 })).toThrow(QrInputError);
  });
});
