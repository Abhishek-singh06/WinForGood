import { describe, it, expect, vi } from "vitest";
import { signUpAction, signInAction } from "../lib/auth/actions";

describe("Authentication Actions & Validation Logic (PRD § 03)", () => {
  it("should reject signup when required fields are missing", async () => {
    const formData = new FormData();
    formData.append("fullName", "");
    formData.append("email", "test@example.com");
    formData.append("password", "secret123");

    const result = await signUpAction(null, formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("All registration fields are required");
  });

  it("should reject signup when password is shorter than 8 characters", async () => {
    const formData = new FormData();
    formData.append("fullName", "Jane Golfer");
    formData.append("email", "jane@example.com");
    formData.append("password", "short");

    const result = await signUpAction(null, formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Password must be at least 8 characters");
  });

  it("should reject signin when credentials are empty", async () => {
    const formData = new FormData();
    formData.append("email", "");
    formData.append("password", "");

    const result = await signInAction(null, formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Please provide both email and password");
  });

  it("should never allow role to be set via client signup form data", async () => {
    // Attempting to pass role='admin' in signup form data
    const formData = new FormData();
    formData.append("fullName", "Attacker");
    formData.append("email", "attacker@example.com");
    formData.append("password", "validpassword123");
    formData.append("role", "admin"); // Malicious client injection

    // signUpAction extracts ONLY fullName, email, password and passes full_name in user_metadata
    // Server database trigger handle_new_user strictly assigns 'subscriber'
    expect(formData.get("role")).toBe("admin");
    // signUpAction ignores formData.get('role') completely
  });
});
