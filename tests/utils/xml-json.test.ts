import { describe, expect, it } from "vitest";
import { jsonToXml, XmlParseError, xmlToJson } from "~/utils/xml-json";

const INDENT = { indent: 2 } as const;

describe("xmlToJson", () => {
  it("keeps attributes behind an @ and repeated tags as a list", () => {
    const json = xmlToJson(
      '<library name="main"><book id="1">Dune</book><book id="2">Emma</book></library>',
      INDENT,
    );

    expect(JSON.parse(json)).toEqual({
      library: {
        "@name": "main",
        book: [
          { "@id": "1", "#text": "Dune" },
          { "@id": "2", "#text": "Emma" },
        ],
      },
    });
  });

  it("leaves a value that looks like a number as text", () => {
    const json = xmlToJson("<zip>01234</zip>", INDENT);

    expect(JSON.parse(json)).toEqual({ zip: "01234" });
  });

  it("indents the JSON by the width it is given", () => {
    expect(xmlToJson("<a>1</a>", { indent: 4 })).toBe('{\n    "a": "1"\n}');
  });

  it("returns an empty string for blank input", () => {
    expect(xmlToJson("  \n ", INDENT)).toBe("");
  });

  it("reports the line and column of a mismatched tag", () => {
    try {
      xmlToJson("<a>\n<b></a>", INDENT);
      expect.unreachable("that XML should not parse");
    } catch (error) {
      expect(error).toBeInstanceOf(XmlParseError);
      if (error instanceof XmlParseError) {
        expect(error.line).toBe(2);
        expect(error.message).toContain("line 2");
      }
    }
  });

  it("rejects text that is not XML at all", () => {
    expect(() => xmlToJson("just text", INDENT)).toThrow(XmlParseError);
  });
});

describe("jsonToXml", () => {
  it("writes attributes back as attributes, indented", () => {
    const xml = jsonToXml('{"book":{"@id":"1","title":"Dune"}}');

    expect(xml).toBe('<book id="1">\n  <title>Dune</title>\n</book>');
  });

  it("returns an empty string for blank input", () => {
    expect(jsonToXml("  ")).toBe("");
  });

  it("rejects text that is not JSON", () => {
    expect(() => jsonToXml("{nope}")).toThrow(XmlParseError);
  });

  it("rejects a list at the top level", () => {
    expect(() => jsonToXml("[1, 2]")).toThrow(/top level/);
  });

  it("round-trips a document with attributes", () => {
    const xml =
      '<library name="main">\n  <book id="1">\n    <title>Dune</title>\n  </book>\n</library>';

    expect(jsonToXml(xmlToJson(xml, INDENT))).toBe(xml);
  });
});
