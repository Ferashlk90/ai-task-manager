import { describe, it, expect } from "vitest";
import { sanitizeOrganized } from "./sanitize";
import type { Company, Category } from "@/lib/types";

const companies: Company[] = [
  { id: "c1", name: "Acme", color: "#000000", sortOrder: 0 },
];
const categories: Category[] = [
  { id: "k1", name: "Dev", color: "#000000", sortOrder: 0 },
];

describe("sanitizeOrganized", () => {
  it("trims text and drops hallucinated ids", () => {
    const out = sanitizeOrganized(
      [
        {
          title: "  build feature  ",
          titleEn: "  build feature  ",
          description: "  details  ",
          descriptionEn: "",
          companyId: "does-not-exist",
          categoryId: "k1",
          priority: "high",
          aiAssist: true,
        },
      ],
      companies,
      categories,
    );
    expect(out[0]).toEqual({
      title: "build feature",
      titleEn: "build feature",
      description: "details",
      descriptionEn: "",
      companyId: null, // invalid id dropped
      categoryId: "k1", // valid id kept
      priority: "high",
      aiAssist: true,
    });
  });

  it("keeps a valid company id and defaults missing text to empty strings", () => {
    const out = sanitizeOrganized(
      [
        {
          title: "x",
          companyId: "c1",
          categoryId: null,
          priority: "low",
          aiAssist: false,
        },
      ],
      companies,
      categories,
    );
    expect(out[0].companyId).toBe("c1");
    expect(out[0].categoryId).toBeNull();
    expect(out[0].titleEn).toBe("");
    expect(out[0].descriptionEn).toBe("");
  });
});
