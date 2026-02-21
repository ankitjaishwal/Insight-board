import { describe, it, expect } from "vitest";
import { formatDate } from "./utils/formatters";

describe("formatDate", () => {
  it("should format date correctly", () => {
    const formattedDate = formatDate("2026-01-15");
    expect(formattedDate).toBe("15 Jan 2026");
  });

  it("should handle single digit days and months", () => {
    const formattedDate = formatDate("2026-03-05");
    expect(formattedDate).toBe("5 Mar 2026");
  });

  it("should handle end of month dates", () => {
    const formattedDate = formatDate("2026-02-28");
    expect(formattedDate).toBe("28 Feb 2026");
  });
});
