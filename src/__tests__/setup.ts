import "@testing-library/jest-dom";
import { vi } from "vitest";

const storage = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string) => {
    return storage.has(key) ? storage.get(key)! : null;
  }),
  setItem: vi.fn((key: string, value: string) => {
    storage.set(key, String(value));
  }),
  removeItem: vi.fn((key: string) => {
    storage.delete(key);
  }),
  clear: vi.fn(() => {
    storage.clear();
  }),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});
