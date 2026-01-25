import { describe, expect, it } from "vitest";

describe("Example Test Suite", () => {
  it("should pass a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should work with strings", () => {
    const greeting = "Hello World";
    expect(greeting).toContain("World");
  });

  it("should handle arrays", () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
  });
});
