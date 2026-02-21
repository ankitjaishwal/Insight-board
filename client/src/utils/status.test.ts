import { describe, it, expect } from "vitest";
import { statusToParam, paramToStatus } from "./status";
import { Status } from "../types/transaction";

describe("status - mappings", () => {
  // Happy Path
  describe("happy path", () => {
    it("should map all statuses to params", () => {
      expect(statusToParam[Status.Completed]).toBe("completed");
      expect(statusToParam[Status.Pending]).toBe("pending");
      expect(statusToParam[Status.Failed]).toBe("failed");
    });

    it("should map all params to statuses", () => {
      expect(paramToStatus["completed"]).toBe(Status.Completed);
      expect(paramToStatus["pending"]).toBe(Status.Pending);
      expect(paramToStatus["failed"]).toBe(Status.Failed);
    });

    it("should have complete bidirectional mapping", () => {
      Object.entries(statusToParam).forEach(([status, param]) => {
        expect(paramToStatus[param]).toBe(status);
      });
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle all enum values", () => {
      const allStatuses = Object.values(Status);
      allStatuses.forEach((status) => {
        expect(statusToParam[status]).toBeDefined();
      });
    });

    it("should use lowercase param strings", () => {
      Object.values(statusToParam).forEach((param) => {
        expect(param).toBe(param.toLowerCase());
      });
    });
  });
});
