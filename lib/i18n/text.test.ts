import { describe, expect, test } from "vitest";
import { pickText } from "./text";

describe("pickText", () => {
  test("returns plain string unchanged", () => {
    expect(pickText("Hello", "kz")).toBe("Hello");
  });

  test("picks the requested locale from i18n dict", () => {
    expect(pickText({ en: "Sofa", kz: "Диван", ru: "Диван" }, "kz")).toBe(
      "Диван",
    );
  });

  test("falls back to en when requested locale absent", () => {
    expect(pickText({ en: "Sofa" }, "kz")).toBe("Sofa");
  });

  test("falls back to first non-empty when neither requested nor en", () => {
    expect(pickText({ ru: "Диван" }, "kz")).toBe("Диван");
  });

  test("ignores empty-string values during fallback", () => {
    expect(pickText({ kz: "", en: "", ru: "Диван" }, "kz")).toBe("Диван");
  });

  test("returns empty string for null/undefined", () => {
    expect(pickText(null, "kz")).toBe("");
    expect(pickText(undefined, "kz")).toBe("");
  });

  test("returns empty string for empty dict", () => {
    expect(pickText({}, "kz")).toBe("");
  });
});
