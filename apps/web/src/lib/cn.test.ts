import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn()", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", false && "c", "d")).toBe("a b d");
  });

  it("dedupes conflicting tailwind utilities via tailwind-merge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles arrays and objects from clsx", () => {
    expect(cn(["a", { b: true, c: false }], "d")).toBe("a b d");
  });
});
