/**
 * Tests for the changed behaviour in src/constants/index.tsx.
 *
 * The PR removed default fallback values from ACCESS_TOKEN_KEY and
 * REFRESH_TOKEN_KEY.  Previously they fell back to "access_token" and
 * "refresh_token" respectively; now they are simply undefined when the
 * corresponding environment variables are not set.
 *
 * Because the module evaluates import.meta.env at load time we use
 * vi.stubEnv + vi.resetModules + dynamic import to exercise the module
 * under different environment configurations in the same test file.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Ensure a minimal required env so the module doesn't throw on BACKEND_BASE_URL
const REQUIRED_ENV = {
  VITE_BACKEND_BASE_URL: "https://api.example.com",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadConstants() {
  return import("../index");
}

describe("ACCESS_TOKEN_KEY", () => {
  it("returns the env var value when VITE_ACCESS_TOKEN_KEY is set", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.stubEnv("VITE_ACCESS_TOKEN_KEY", "my_custom_access_token");
    vi.resetModules();
    const { ACCESS_TOKEN_KEY } = await loadConstants();
    expect(ACCESS_TOKEN_KEY).toBe("my_custom_access_token");
  });

  it("returns undefined when VITE_ACCESS_TOKEN_KEY is NOT set (no default fallback)", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    // Do NOT stub VITE_ACCESS_TOKEN_KEY
    vi.resetModules();
    const { ACCESS_TOKEN_KEY } = await loadConstants();
    // After the PR the value is undefined, not "access_token"
    expect(ACCESS_TOKEN_KEY).toBeUndefined();
  });

  it("is NOT equal to the old default 'access_token' when env var is absent", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.resetModules();
    const { ACCESS_TOKEN_KEY } = await loadConstants();
    expect(ACCESS_TOKEN_KEY).not.toBe("access_token");
  });
});

describe("REFRESH_TOKEN_KEY", () => {
  it("returns the env var value when VITE_REFRESH_TOKEN_KEY is set", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.stubEnv("VITE_REFRESH_TOKEN_KEY", "my_custom_refresh_token");
    vi.resetModules();
    const { REFRESH_TOKEN_KEY } = await loadConstants();
    expect(REFRESH_TOKEN_KEY).toBe("my_custom_refresh_token");
  });

  it("returns undefined when VITE_REFRESH_TOKEN_KEY is NOT set (no default fallback)", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.resetModules();
    const { REFRESH_TOKEN_KEY } = await loadConstants();
    expect(REFRESH_TOKEN_KEY).toBeUndefined();
  });

  it("is NOT equal to the old default 'refresh_token' when env var is absent", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.resetModules();
    const { REFRESH_TOKEN_KEY } = await loadConstants();
    expect(REFRESH_TOKEN_KEY).not.toBe("refresh_token");
  });
});

describe("BASE_URL", () => {
  it("equals the VITE_API_URL env var when provided", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.stubEnv("VITE_API_URL", "https://api.myapp.com");
    vi.resetModules();
    const { BASE_URL } = await loadConstants();
    expect(BASE_URL).toBe("https://api.myapp.com");
  });

  it("is undefined when VITE_API_URL is not set", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.resetModules();
    const { BASE_URL } = await loadConstants();
    expect(BASE_URL).toBeUndefined();
  });
});

describe("CLOUDINARY constants", () => {
  it("returns the CLOUDINARY_CLOUD_NAME from env", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "demo-cloud");
    vi.resetModules();
    const { CLOUDINARY_CLOUD_NAME } = await loadConstants();
    expect(CLOUDINARY_CLOUD_NAME).toBe("demo-cloud");
  });

  it("returns empty string for CLOUDINARY_CLOUD_NAME when env var absent (optional with default '')", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.resetModules();
    const { CLOUDINARY_CLOUD_NAME } = await loadConstants();
    expect(CLOUDINARY_CLOUD_NAME).toBe("");
  });

  it("returns the CLOUDINARY_UPLOAD_PRESET from env", async () => {
    vi.stubEnv("VITE_BACKEND_BASE_URL", REQUIRED_ENV.VITE_BACKEND_BASE_URL);
    vi.stubEnv("VITE_CLOUDINARY_UPLOAD_PRESET", "my-preset");
    vi.resetModules();
    const { CLOUDINARY_UPLOAD_PRESET } = await loadConstants();
    expect(CLOUDINARY_UPLOAD_PRESET).toBe("my-preset");
  });
});