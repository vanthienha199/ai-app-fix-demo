import { beforeAll, describe, expect, it } from "vitest";
import { createSession, passwordMatches, readSession } from "@/lib/session";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-that-is-long-enough-123456";
  process.env.STAFF_PASSWORD = "correct horse";
});

describe("session cookie", () => {
  it("round trips", () => {
    expect(readSession(createSession("staff"))).toEqual({ u: "staff" });
  });
  it("rejects a tampered payload", () => {
    const [p, s] = createSession("staff").split(".");
    const forged = Buffer.from(JSON.stringify({ u: "owner", exp: 9999999999 })).toString("base64url");
    expect(readSession(`${forged}.${s}`)).toBeNull();
    expect(readSession(`${p}.${s.slice(0, -2)}xx`)).toBeNull();
  });
  it("expires after 8 hours", () => {
    const t = Date.now();
    const token = createSession("staff", t);
    expect(readSession(token, t + 7 * 3600e3)).not.toBeNull();
    expect(readSession(token, t + 9 * 3600e3)).toBeNull();
  });
  it("rejects missing and malformed tokens", () => {
    expect(readSession(undefined)).toBeNull();
    expect(readSession("garbage")).toBeNull();
  });
  it("checks the staff password from the environment", () => {
    expect(passwordMatches("correct horse")).toBe(true);
    expect(passwordMatches("pawsadmin2024")).toBe(false);
  });
});
