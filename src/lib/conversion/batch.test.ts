import { describe, expect, it } from "vitest";
import { stripOptions, uniqueName } from "./batch";

describe("stripOptions", () => {
  it("strips everything when nothing is kept", () => {
    expect(Object.values(stripOptions(new Set())).every(Boolean)).toBe(true);
  });

  it("keeps only the chosen categories", () => {
    const o = stripOptions(new Set(["gps", "dates"]));
    expect(o.gps).toBe(false);
    expect(o.dates).toBe(false);
    expect(o.device).toBe(true);
    expect(o.software && o.author && o.ai && o.copyright && o.comments && o.custom).toBe(true);
  });
});

describe("uniqueName", () => {
  it("leaves the first of a name alone and numbers the rest", () => {
    const taken = new Set<string>();
    expect(uniqueName("IMG_1.jpg", taken)).toBe("IMG_1.jpg");
    expect(uniqueName("IMG_1.jpg", taken)).toBe("IMG_1 (2).jpg");
    expect(uniqueName("img_1.JPG", taken)).toBe("img_1 (3).JPG");
    expect(uniqueName("IMG_2.jpg", taken)).toBe("IMG_2.jpg");
  });

  it("skips a number already taken by a real file", () => {
    const taken = new Set<string>();
    uniqueName("a (2).jpg", taken);
    uniqueName("a.jpg", taken);
    expect(uniqueName("a.jpg", taken)).toBe("a (3).jpg");
  });
});
