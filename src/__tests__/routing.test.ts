import { describe, it, expect } from "vitest";

describe("Protected Routing & Middleware Decision Matrix (Step 6 & Step 8)", () => {
  interface RouteDecisionParams {
    pathname: string;
    isAuthenticated: boolean;
    role?: "subscriber" | "admin";
  }

  interface RouteDecisionResult {
    action: "allow" | "redirect";
    targetUrl?: string;
  }

  function resolveMiddlewareRouting({
    pathname,
    isAuthenticated,
    role,
  }: RouteDecisionParams): RouteDecisionResult {
    if (pathname.startsWith("/dashboard")) {
      if (!isAuthenticated) {
        return { action: "redirect", targetUrl: `/login?next=${pathname}` };
      }
      return { action: "allow" };
    }

    if (pathname.startsWith("/admin")) {
      if (!isAuthenticated) {
        return { action: "redirect", targetUrl: `/login?next=${pathname}` };
      }
      if (role !== "admin") {
        return {
          action: "redirect",
          targetUrl: "/dashboard?forbidden=admin_required",
        };
      }
      return { action: "allow" };
    }

    if (pathname === "/login" || pathname === "/signup") {
      if (isAuthenticated) {
        const target = role === "admin" ? "/admin" : "/dashboard";
        return { action: "redirect", targetUrl: target };
      }
      return { action: "allow" };
    }

    return { action: "allow" };
  }

  // Behavior 1: Unauthenticated user -> /dashboard
  it("1. should redirect unauthenticated user from /dashboard to /login?next=/dashboard", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/dashboard",
      isAuthenticated: false,
    });
    expect(res.action).toBe("redirect");
    expect(res.targetUrl).toBe("/login?next=/dashboard");
  });

  // Behavior 2: Unauthenticated user -> /dashboard/scores
  it("2. should redirect unauthenticated user from /dashboard/scores to /login?next=/dashboard/scores", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/dashboard/scores",
      isAuthenticated: false,
    });
    expect(res.action).toBe("redirect");
    expect(res.targetUrl).toBe("/login?next=/dashboard/scores");
  });

  // Behavior 3: Unauthenticated user -> /admin
  it("3. should redirect unauthenticated user from /admin to /login?next=/admin", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/admin",
      isAuthenticated: false,
    });
    expect(res.action).toBe("redirect");
    expect(res.targetUrl).toBe("/login?next=/admin");
  });

  // Behavior 4: Authenticated subscriber -> /dashboard
  it("4. should allow authenticated subscriber to access /dashboard", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/dashboard",
      isAuthenticated: true,
      role: "subscriber",
    });
    expect(res.action).toBe("allow");
  });

  // Behavior 5: Authenticated subscriber -> /dashboard/scores
  it("5. should allow authenticated subscriber to access /dashboard/scores", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/dashboard/scores",
      isAuthenticated: true,
      role: "subscriber",
    });
    expect(res.action).toBe("allow");
  });

  // Behavior 6: Authenticated subscriber -> /admin
  it("6. should deny authenticated subscriber from /admin and redirect to /dashboard?forbidden=admin_required", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/admin",
      isAuthenticated: true,
      role: "subscriber",
    });
    expect(res.action).toBe("redirect");
    expect(res.targetUrl).toBe("/dashboard?forbidden=admin_required");
  });

  // Behavior 7: Authenticated subscriber -> /admin/users
  it("7. should deny authenticated subscriber from /admin/users and redirect to /dashboard?forbidden=admin_required", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/admin/users",
      isAuthenticated: true,
      role: "subscriber",
    });
    expect(res.action).toBe("redirect");
    expect(res.targetUrl).toBe("/dashboard?forbidden=admin_required");
  });

  // Behavior 8: Authenticated admin -> /admin
  it("8. should allow authenticated administrator to access /admin", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/admin",
      isAuthenticated: true,
      role: "admin",
    });
    expect(res.action).toBe("allow");
  });

  // Behavior 9: Authenticated admin -> /admin/users
  it("9. should allow authenticated administrator to access /admin/users", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/admin/users",
      isAuthenticated: true,
      role: "admin",
    });
    expect(res.action).toBe("allow");
  });

  // Behavior 10: Authenticated admin -> /dashboard
  it("10. should allow authenticated administrator to access /dashboard", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/dashboard",
      isAuthenticated: true,
      role: "admin",
    });
    expect(res.action).toBe("allow");
  });

  it("should redirect authenticated subscribers away from /login to /dashboard", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/login",
      isAuthenticated: true,
      role: "subscriber",
    });
    expect(res.action).toBe("redirect");
    expect(res.targetUrl).toBe("/dashboard");
  });

  it("should redirect authenticated admins away from /login to /admin", () => {
    const res = resolveMiddlewareRouting({
      pathname: "/login",
      isAuthenticated: true,
      role: "admin",
    });
    expect(res.action).toBe("redirect");
    expect(res.targetUrl).toBe("/admin");
  });
});
