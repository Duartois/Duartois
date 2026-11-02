import { describe, expect, it } from "vitest";

import { getFallItemStyle } from "./fallAnimation";

describe("getFallItemStyle", () => {
  it("leaves no filter or 3D transform behind once an item is in place", () => {
    const style = getFallItemStyle(true, 0, 4, { variant: "work" });

    expect(style.opacity).toBe(1);
    expect(style.filter).toBe("none");
    expect(style.transform).toBe("none");
  });

  it("still blurs and lifts items that are waiting to fall in", () => {
    const style = getFallItemStyle(false, 0, 4, { variant: "work" });

    expect(style.opacity).toBe(0);
    expect(style.filter).toBe("blur(6px)");
    expect(style.transform).toContain("translate3d");
  });

  it("drops the blur and the permanent will-change on the light preset", () => {
    const style = getFallItemStyle(false, 0, 4, {
      variant: "work",
      lowQuality: true,
    });

    expect(style.filter).toBe("none");
    expect(style.willChange).toBeUndefined();
  });

  it("only keeps compositor-friendly properties in will-change", () => {
    const style = getFallItemStyle(true, 0, 4, { variant: "work" });

    expect(style.willChange).toBe("transform, opacity");
  });

  it("disables everything when motion is reduced", () => {
    expect(getFallItemStyle(false, 0, 4, { disable: true })).toEqual({
      opacity: 1,
      transform: "none",
      transition: "none",
      filter: "none",
    });
  });
});
