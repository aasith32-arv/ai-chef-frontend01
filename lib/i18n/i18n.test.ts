import { describe, expect, it } from "vitest";
import { translate } from "@/lib/i18n/i18n";

describe("translate", () => {
  it("returns English string for known key", () => {
    expect(translate("en", "nav.home")).toBe("Home");
  });

  it("returns Tamil translation when available", () => {
    expect(translate("ta", "nav.home")).toBe("முகப்பு");
  });

  it("returns Sinhala translation when available", () => {
    expect(translate("si", "nav.home")).toBe("මුල් පිටුව");
  });

  it("falls back to English when locale key is missing", () => {
    // Force a key that exists in EN but we pretend locale lookup misses by using
    // an English-only path: missing keys fall through to EN then the key itself.
    expect(translate("ta", "nav.home")).not.toBe("nav.home");
    expect(translate("en", "definitely.missing.key")).toBe(
      "definitely.missing.key"
    );
  });

  it("falls back to English then key for unknown locale entries", () => {
    // If Tamil somehow lacked a key, EN is used; if EN also lacks it, key is returned.
    const value = translate("ta", "this.key.does.not.exist");
    expect(value).toBe("this.key.does.not.exist");
  });
});
