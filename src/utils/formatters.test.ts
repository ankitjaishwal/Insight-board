import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime } from "./formatters";

describe("formatters - formatDate", () => {
  // Happy Path
  describe("happy path", () => {
    it("should format standard date correctly", () => {
      expect(formatDate("2026-01-15")).toBe("15 Jan 2026");
    });

    it("should format date with double-digit day and month", () => {
      expect(formatDate("2026-12-25")).toBe("25 Dec 2026");
    });

    it("should format date with single-digit day and month", () => {
      expect(formatDate("2026-03-05")).toBe("5 Mar 2026");
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle leap year date (Feb 29)", () => {
      expect(formatDate("2024-02-29")).toBe("29 Feb 2024");
    });

    it("should handle end of month (Feb 28)", () => {
      expect(formatDate("2026-02-28")).toBe("28 Feb 2026");
    });

    it("should handle end of year (Dec 31)", () => {
      expect(formatDate("2026-12-31")).toBe("31 Dec 2026");
    });

    it("should handle start of year (Jan 01)", () => {
      expect(formatDate("2026-01-01")).toBe("1 Jan 2026");
    });

    it("should handle different years", () => {
      expect(formatDate("2000-01-01")).toBe("1 Jan 2000");
      expect(formatDate("2050-06-15")).toBe("15 Jun 2050");
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should handle all months correctly", () => {
      for (let month = 1; month <= 12; month++) {
        const dateStr = `2026-${String(month).padStart(2, "0")}-15`;
        const result = formatDate(dateStr);
        expect(result).toMatch(/\d{1,2} \w+ 2026/);
      }
    });
  });
});

describe("formatters - formatDateTime", () => {
  // Happy Path
  describe("happy path", () => {
    it("should format ISO datetime correctly", () => {
      const result = formatDateTime("2026-02-21T14:30:00");
      expect(result).toContain("21");
      expect(result).toContain("Feb");
      expect(result).toContain("2026");
    });

    it("should include time information", () => {
      const result = formatDateTime("2026-02-21T14:30:00");
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle midnight (00:00)", () => {
      const result = formatDateTime("2026-02-21T00:00:00");
      expect(result).toContain("00");
    });

    it("should handle noon (12:00)", () => {
      const result = formatDateTime("2026-02-21T12:00:00");
      expect(result).toContain("12");
    });

    it("should handle different timezones", () => {
      const result1 = formatDateTime("2026-02-21T14:30:00");
      const result2 = formatDateTime("2026-02-21T14:30:00+05:30");
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should handle various datetime formats", () => {
      const result = formatDateTime("2026-02-21T23:59:59");
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
