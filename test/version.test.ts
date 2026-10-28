import { describe, it, expect } from "vitest";
import pkg from "../package.json";
describe("version", () => { it("build-time version matches package.json", () => { expect(__APP_VERSION__).toBe(pkg.version); expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/); }); });
