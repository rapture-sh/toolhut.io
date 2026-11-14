import { describe, expect, it } from "vitest";
import { CsvParseError, csvToJson, jsonToCsv } from "~/utils/csv-to-json";

const AUTO = { delimiter: "auto" } as const;

describe("csvToJson", () => {
  it("should use the header row as the keys", () => {
    const json = csvToJson("name,age\nalice,31\nbob,42", {
      header: true,
      ...AUTO,
    });

    expect(JSON.parse(json)).toEqual([
      { name: "alice", age: 31 },
      { name: "bob", age: 42 },
    ]);
  });

  it("should give a row per array when the first row is data", () => {
    const json = csvToJson("a,b\n1,2", { header: false, ...AUTO });

    expect(JSON.parse(json)).toEqual([
      ["a", "b"],
      [1, 2],
    ]);
  });

  it("should find a semicolon on its own", () => {
    const json = csvToJson("a;b\n1;2", { header: true, ...AUTO });

    expect(JSON.parse(json)).toEqual([{ a: 1, b: 2 }]);
  });

  it("should take the delimiter it is given", () => {
    const json = csvToJson("a\tb\n1\t2", { header: true, delimiter: "\t" });

    expect(JSON.parse(json)).toEqual([{ a: 1, b: 2 }]);
  });

  it("should keep a quoted field that holds the delimiter", () => {
    const json = csvToJson('name,note\nalice,"hello, world"', {
      header: true,
      ...AUTO,
    });

    expect(JSON.parse(json)).toEqual([{ name: "alice", note: "hello, world" }]);
  });

  it("should read a single column file", () => {
    const json = csvToJson("name\nalice\nbob", { header: true, ...AUTO });

    expect(JSON.parse(json)).toEqual([{ name: "alice" }, { name: "bob" }]);
  });

  it("should return an empty string for blank input", () => {
    expect(csvToJson("  \n ", { header: true, ...AUTO })).toBe("");
  });

  it("should reject a quoted field that is never closed", () => {
    expect(() => csvToJson('a,b\n"1,2', { header: true, ...AUTO })).toThrow(
      CsvParseError,
    );
  });

  it("should say which row has too many fields", () => {
    expect(() => csvToJson("a,b\n1,2,3", { header: true, ...AUTO })).toThrow(
      /Row 1/,
    );
  });
});

describe("jsonToCsv", () => {
  it("should write a header row and quote a field holding the delimiter", () => {
    const csv = jsonToCsv('[{"name":"alice","note":"hello, world"}]', AUTO);

    expect(csv).toBe('name,note\nalice,"hello, world"');
  });

  it("should keep a column only a later row has", () => {
    expect(jsonToCsv('[{"a":1},{"b":2}]', AUTO)).toBe("a,b\n1,\n,2");
  });

  it("should write a single object as one row", () => {
    expect(jsonToCsv('{"a":1,"b":2}', AUTO)).toBe("a,b\n1,2");
  });

  it("should write arrays without a header row", () => {
    expect(jsonToCsv("[[1,2],[3,4]]", { delimiter: ";" })).toBe("1;2\n3;4");
  });

  it("should return an empty string for blank input and for an empty array", () => {
    expect(jsonToCsv("", AUTO)).toBe("");
    expect(jsonToCsv("[]", AUTO)).toBe("");
  });

  it("should reject text that is not JSON", () => {
    expect(() => jsonToCsv("{nope}", AUTO)).toThrow(CsvParseError);
  });

  it("should reject a cell holding an object", () => {
    expect(() => jsonToCsv('[{"a":{"b":1}}]', AUTO)).toThrow(
      /Row 1, column "a"/,
    );
  });

  it("should reject a row that is a bare value", () => {
    expect(() => jsonToCsv('["just text"]', AUTO)).toThrow(CsvParseError);
  });

  it("should round-trip a file with a quoted delimiter in it", () => {
    const csv = 'name,note\nalice,"hello, world"\nbob,plain';

    expect(jsonToCsv(csvToJson(csv, { header: true, ...AUTO }), AUTO)).toBe(
      csv,
    );
  });
});
