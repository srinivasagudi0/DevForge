import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  value: () => undefined,
  writable: true
});

Object.defineProperty(window, "scrollTo", {
  value: () => undefined,
  writable: true
});

Object.assign(navigator, {
  clipboard: {
    writeText: async () => undefined
  }
});
