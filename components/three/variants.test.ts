import { describe, expect, it } from "vitest";

import {
  INNER_PAGE_SHAPE_OPACITY,
  SHAPE_IDS,
  variantMapping,
  type VariantName,
} from "./types";

const INNER_PAGES: VariantName[] = [
  "work",
  "projectDetail",
  "about",
  "contact",
];

describe("variant shape opacity", () => {
  it.each(INNER_PAGES)(
    "keeps the visible shapes of %s softer than full strength",
    (name) => {
      const visible = SHAPE_IDS.map((id) => variantMapping[name][id].opacity)
        .filter((opacity): opacity is number => typeof opacity === "number")
        .filter((opacity) => opacity > 0);

      expect(visible.length).toBeGreaterThan(0);
      visible.forEach((opacity) => {
        expect(opacity).toBe(INNER_PAGE_SHAPE_OPACITY);
        expect(opacity).toBeLessThan(1);
      });
    },
  );

  it("leaves the Home shapes at full strength", () => {
    SHAPE_IDS.forEach((id) => {
      expect(variantMapping.home[id].opacity).toBe(1);
    });
  });
});
