import { describe, expect, it } from "vitest";
import {
  formatSql,
  minifySql,
  SQL_DIALECTS,
  SqlFormatError,
} from "~/utils/sql-formatter";

const STANDARD = {
  dialect: "sql",
  keywordCase: "upper",
  tabWidth: 2,
} as const;

describe("formatSql", () => {
  it("should break a query into lines and upper-cases the keywords", () => {
    expect(formatSql("select a,b from t where x=1", STANDARD)).toBe(
      "SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1",
    );
  });

  it("should leave keywords alone when asked to", () => {
    expect(
      formatSql("select a from t", { ...STANDARD, keywordCase: "preserve" }),
    ).toBe("select\n  a\nfrom\n  t");
  });

  it("should indent by the tab width it is given", () => {
    expect(formatSql("select a from t", { ...STANDARD, tabWidth: 4 })).toBe(
      "SELECT\n    a\nFROM\n    t",
    );
  });

  it("should format dialect-only syntax for that dialect", () => {
    expect(
      formatSql("select top 1 * from t", {
        ...STANDARD,
        dialect: "transactsql",
      }),
    ).toContain("TOP 1");
  });

  it("should return an empty string for blank input", () => {
    expect(formatSql("   \n", STANDARD)).toBe("");
  });

  it("should explain where a query stops making sense", () => {
    expect(() => formatSql("select 'abc", STANDARD)).toThrow(SqlFormatError);
    expect(() => formatSql("select 'abc", STANDARD)).toThrow(/line 1 column 8/);
  });

  it("should offer every dialect under a name sql-formatter accepts", () => {
    for (const { value } of SQL_DIALECTS) {
      expect(formatSql("select 1", { ...STANDARD, dialect: value })).toBe(
        "SELECT\n  1",
      );
    }
  });
});

describe("minifySql", () => {
  it("should put a formatted query back on one line", () => {
    expect(minifySql("SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1")).toBe(
      "SELECT a, b FROM t WHERE x = 1",
    );
  });

  it("should drop a line comment and a block comment", () => {
    expect(minifySql("select a -- the a\nfrom /* table */ t")).toBe(
      "select a from t",
    );
  });

  it("should leave whitespace inside a string alone", () => {
    expect(minifySql("select  'a  b,  c'  from t")).toBe(
      "select 'a  b,  c' from t",
    );
  });

  it("should keep a doubled quote inside a string", () => {
    expect(minifySql("select 'it''s   fine'")).toBe("select 'it''s   fine'");
  });

  it("should tighten brackets without gluing words together", () => {
    expect(minifySql("select count( * ) from t where x in ( 1 , 2 ) ;")).toBe(
      "select count(*) from t where x in (1, 2);",
    );
  });

  it("should return an empty string for blank input", () => {
    expect(minifySql("   \n  ")).toBe("");
  });

  it("should say where a string is left open", () => {
    expect(() => minifySql("select 'abc")).toThrow(SqlFormatError);
    expect(() => minifySql("select 'abc")).toThrow(/line 1, column 8/);
  });

  it("should say where a comment is left open", () => {
    expect(() => minifySql("select 1\n/* hm")).toThrow(/line 2, column 1/);
  });

  it("should round-trip a one-line query through the formatter", () => {
    const query = "select a, b from t where x in (1, 2)";
    const pretty = formatSql(query, { ...STANDARD, keywordCase: "preserve" });

    expect(minifySql(pretty)).toBe(query);
  });
});
