import { describe, it, expect } from "vitest";
import { csvCell } from "./utils";

describe("csvCell", () => {
  it("wraps plain text in quotes", () => {
    expect(csvCell("hello")).toBe('"hello"');
  });

  it("escapes embedded double quotes", () => {
    expect(csvCell('he said "hi"')).toBe('"he said ""hi"""');
  });

  it("neutralizes spreadsheet formula triggers with a leading quote", () => {
    expect(csvCell("=1+1")).toBe(`"'=1+1"`);
    expect(csvCell("+cmd")).toBe(`"'+cmd"`);
    expect(csvCell("-cmd")).toBe(`"'-cmd"`);
    expect(csvCell("@cmd")).toBe(`"'@cmd"`);
  });

  it("handles empty values", () => {
    expect(csvCell("")).toBe('""');
  });
});
