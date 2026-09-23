import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAppUrl, getSafeRedirectPath, getAuthCallbackUrl } from "../lib/auth/url";
import { signUpAction, signInAction } from "../lib/auth/actions";
import { GET } from "../app/auth/callback/route";
import { NextRequest } from "next/server";

// Mock Supabase server client
const mockSignUp = vi.fn();
const mockExchangeCodeForSession = vi.fn();
const mockGetUser = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

const mockSignInWithPassword = vi.fn();
const mockUpdateUserById = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: vi.fn(),
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        updateUserById: mockUpdateUserById,
      },
    },
  })),
}));

// Mock @supabase/ssr for route handler
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Authentication Redirect & URL Security (Production Bug Fix)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("1. Canonical Application URL Resolution (getAppUrl)", () => {
    it("should fallback to http://localhost:3000 when NEXT_PUBLIC_APP_URL is not set", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      expect(getAppUrl()).toBe("http://localhost:3000");
    });

    it("should return the configured production URL without trailing slashes", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      expect(getAppUrl()).toBe("https://win-for-good.vercel.app");

      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app/";
      expect(getAppUrl()).toBe("https://win-for-good.vercel.app");

      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app///";
      expect(getAppUrl()).toBe("https://win-for-good.vercel.app");
    });

    it("should never contain localhost when production URL is set", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      const appUrl = getAppUrl();
      expect(appUrl).not.toContain("localhost");
      expect(appUrl).toBe("https://win-for-good.vercel.app");
    });
  });

  describe("2. Open-Redirect Prevention (getSafeRedirectPath)", () => {
    it("should accept valid internal relative paths", () => {
      expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
      expect(getSafeRedirectPath("/admin/draws")).toBe("/admin/draws");
      expect(getSafeRedirectPath("/dashboard/scores?tab=recent")).toBe("/dashboard/scores?tab=recent");
    });

    it("should sanitize and reject protocol-relative URLs (//attacker.com)", () => {
      expect(getSafeRedirectPath("//attacker.com")).toBe("/dashboard");
      expect(getSafeRedirectPath("//evil.com/phish")).toBe("/dashboard");
    });

    it("should reject absolute external URLs", () => {
      expect(getSafeRedirectPath("https://attacker.com")).toBe("/dashboard");
      expect(getSafeRedirectPath("http://localhost:3000")).toBe("/dashboard");
      expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
      expect(getSafeRedirectPath("data:text/html,evil")).toBe("/dashboard");
    });

    it("should reject paths containing backslashes", () => {
      expect(getSafeRedirectPath("/\\attacker.com")).toBe("/dashboard");
      expect(getSafeRedirectPath("/dashboard\\nested")).toBe("/dashboard");
    });

    it("should fallback safely for null, undefined, or empty values", () => {
      expect(getSafeRedirectPath(null)).toBe("/dashboard");
      expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
      expect(getSafeRedirectPath("   ")).toBe("/dashboard");
      expect(getSafeRedirectPath(null, "/custom-fallback")).toBe("/custom-fallback");
    });
  });

  describe("3. Supabase Auth Callback URL Construction (getAuthCallbackUrl)", () => {
    it("should generate localhost callback for local development", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const callbackUrl = getAuthCallbackUrl();
      expect(callbackUrl).toBe("http://localhost:3000/auth/callback");
    });

    it("should generate production callback for production environment", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      const callbackUrl = getAuthCallbackUrl();
      expect(callbackUrl).toBe("https://win-for-good.vercel.app/auth/callback");
      expect(callbackUrl).not.toContain("localhost");
    });

    it("should append sanitized next parameter when specified", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      const callbackUrl = getAuthCallbackUrl("/dashboard/draws");
      expect(callbackUrl).toBe("https://win-for-good.vercel.app/auth/callback?next=%2Fdashboard%2Fdraws");
    });

    it("should sanitize open redirect attempt in next parameter", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      const callbackUrl = getAuthCallbackUrl("//evil.com");
      // Sanitized //evil.com becomes /dashboard, which is default and not appended
      expect(callbackUrl).toBe("https://win-for-good.vercel.app/auth/callback");
    });
  });

  describe("4. Signup Email Redirect Generation & Demo/Test UX (signUpAction)", () => {
    it("should auto-confirm and redirect to login?registered=true in demo/test mode", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: "test-user-id" }, session: null },
        error: null,
      });

      const formData = new FormData();
      formData.append("fullName", "Demo Reviewer");
      formData.append("email", "reviewer@winforgood.org");
      formData.append("password", "strongpassword123");

      const result = await signUpAction(null, formData);

      expect(mockSignUp).toHaveBeenCalledTimes(1);
      const callArgs = mockSignUp.mock.calls[0][0];

      // Verification of canonical production callback URL
      expect(callArgs.options).toBeDefined();
      expect(callArgs.options.emailRedirectTo).toBe("https://win-for-good.vercel.app/auth/callback");
      expect(callArgs.options.emailRedirectTo).not.toContain("localhost");

      // Verification of service-role auto-confirm
      expect(mockUpdateUserById).toHaveBeenCalledWith("test-user-id", {
        email_confirm: true,
      });

      // Verification of immediate login redirect without email verification gate
      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe("/login?registered=true&email=reviewer%40winforgood.org");
    });

    it("should preserve strict pending confirmation when AUTH_REQUIRE_EMAIL_CONFIRMATION is true", async () => {
      process.env.AUTH_REQUIRE_EMAIL_CONFIRMATION = "true";
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";

      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: "strict-user-id" }, session: null },
        error: null,
      });

      const formData = new FormData();
      formData.append("fullName", "Strict User");
      formData.append("email", "strict@winforgood.org");
      formData.append("password", "strongpassword123");

      const result = await signUpAction(null, formData);

      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe("/login?confirmed=pending");
      expect(mockUpdateUserById).not.toHaveBeenCalled();
    });

    it("should reject signup when duplicate email is provided", async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "User already registered" },
      });

      const formData = new FormData();
      formData.append("fullName", "Existing User");
      formData.append("email", "existing@winforgood.org");
      formData.append("password", "strongpassword123");

      const result = await signUpAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("User already registered");
    });

    it("should pass local emailRedirectTo when running locally", async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: "test-user-local" }, session: null },
        error: null,
      });

      const formData = new FormData();
      formData.append("fullName", "Local User");
      formData.append("email", "local@winforgood.org");
      formData.append("password", "strongpassword123");

      await signUpAction(null, formData);

      const callArgs = mockSignUp.mock.calls[0][0];
      expect(callArgs.options.emailRedirectTo).toBe("http://localhost:3000/auth/callback");
    });
  });

  describe("5. Auth Callback Route Handler (/auth/callback)", () => {
    it("should exchange code for session and redirect to /dashboard in production", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: { user: { id: "user-123" } },
        error: null,
      });
      mockSingle.mockResolvedValueOnce({
        data: { role: "subscriber" },
      });

      const request = new NextRequest("https://win-for-good.vercel.app/auth/callback?code=valid-code-123");
      const response = await GET(request);

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith("valid-code-123");
      expect(response.status).toBe(307); // NextResponse.redirect default
      expect(response.headers.get("location")).toBe("https://win-for-good.vercel.app/dashboard");
      expect(response.headers.get("location")).not.toContain("localhost");
    });

    it("should redirect admin to /admin console after email verification", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: { user: { id: "admin-456" } },
        error: null,
      });
      mockSingle.mockResolvedValueOnce({
        data: { role: "admin" },
      });

      const request = new NextRequest("https://win-for-good.vercel.app/auth/callback?code=admin-code");
      const response = await GET(request);

      expect(response.headers.get("location")).toBe("https://win-for-good.vercel.app/admin");
    });

    it("should sanitize next parameter and prevent open redirect during callback", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: { user: { id: "user-123" } },
        error: null,
      });

      // Malicious attempt to redirect out of application
      const request = new NextRequest(
        "https://win-for-good.vercel.app/auth/callback?code=valid-code&next=https://attacker.com"
      );
      const response = await GET(request);

      expect(response.headers.get("location")).toBe("https://win-for-good.vercel.app/dashboard");
      expect(response.headers.get("location")).not.toContain("attacker.com");
    });

    it("should redirect to login with error parameter when code exchange fails", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid or expired token" },
      });

      const request = new NextRequest("https://win-for-good.vercel.app/auth/callback?code=expired-code");
      const response = await GET(request);

      expect(response.headers.get("location")).toBe(
        "https://win-for-good.vercel.app/login?error=verification_failed"
      );
    });

    it("should redirect to login with error parameter when code is completely missing", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";

      const request = new NextRequest("https://win-for-good.vercel.app/auth/callback");
      const response = await GET(request);

      expect(response.headers.get("location")).toBe(
        "https://win-for-good.vercel.app/login?error=verification_failed"
      );
    });

    it("should redirect to login with error description when Supabase provides error query parameters", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://win-for-good.vercel.app";

      const request = new NextRequest(
        "https://win-for-good.vercel.app/auth/callback?error=access_denied&error_description=Email+link+is+invalid+or+has+expired"
      );
      const response = await GET(request);

      expect(response.headers.get("location")).toBe(
        "https://win-for-good.vercel.app/login?error=Email+link+is+invalid+or+has+expired"
      );
    });
  });

  describe("6. Immediate Login & Role Isolation (signInAction & Role Guarding)", () => {
    it("should allow immediate login with valid credentials following registration", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: { id: "new-user-123" } },
        error: null,
      });
      mockSingle.mockResolvedValueOnce({
        data: { role: "subscriber" },
      });

      const formData = new FormData();
      formData.append("email", "reviewer@winforgood.org");
      formData.append("password", "strongpassword123");

      await expect(signInAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");
    });

    it("should reject signin with invalid credentials", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      });

      const formData = new FormData();
      formData.append("email", "reviewer@winforgood.org");
      formData.append("password", "wrongpassword");

      const result = await signInAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid login credentials");
    });

    it("should reject signin when required fields are empty", async () => {
      const formData = new FormData();
      formData.append("email", "");
      formData.append("password", "");

      const result = await signInAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Please provide both email and password");
    });

    it("should redirect admin to /admin and subscriber to /dashboard on sign in", async () => {
      // Admin user
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: { id: "admin-user" } },
        error: null,
      });
      mockSingle.mockResolvedValueOnce({
        data: { role: "admin" },
      });

      const adminFormData = new FormData();
      adminFormData.append("email", "admin@winforgood.org");
      adminFormData.append("password", "adminpassword123");

      await expect(signInAction(null, adminFormData)).rejects.toThrow("NEXT_REDIRECT");
    });

    it("should strictly enforce subscriber role and ignore client role injection", async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: "attacker-id" }, session: null },
        error: null,
      });

      const formData = new FormData();
      formData.append("fullName", "Malicious User");
      formData.append("email", "attacker@winforgood.org");
      formData.append("password", "password123");
      formData.append("role", "admin"); // Malicious injection attempt

      await signUpAction(null, formData);

      const callArgs = mockSignUp.mock.calls[0][0];
      // Role MUST NOT be present in options.data
      expect(callArgs.options.data.role).toBeUndefined();
      expect(callArgs.options.data.full_name).toBe("Malicious User");
    });
  });
});
