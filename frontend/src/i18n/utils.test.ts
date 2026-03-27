import { describe, expect, it } from "vitest";

import { getDefaultLocale, getDirection, isSupportedLocale } from "./utils";

describe("i18n utils", () => {
  it("recognizes supported locales", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("ar")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
  });

  it("maps RTL locales correctly", () => {
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
  });

  it("falls back to english when no env override is set", () => {
    expect(getDefaultLocale()).toBe("en");
  });
});
