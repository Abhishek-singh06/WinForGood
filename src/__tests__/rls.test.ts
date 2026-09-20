import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Row Level Security Policy Verification (BR-142)", () => {
  const migrationPath = path.resolve(
    __dirname,
    "../../supabase/migrations/20260920000001_initial_schema.sql"
  );
  const sql = fs.readFileSync(migrationPath, "utf-8");

  it("should enable RLS on the profiles table", () => {
    expect(sql).toContain("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;");
  });

  it("should enforce own profile read policy using auth.uid() = id", () => {
    expect(sql).toContain('CREATE POLICY "profiles_select_own"');
    expect(sql).toContain("USING (auth.uid() = id);");
  });

  it("should restrict admin-wide selection using public.is_admin()", () => {
    expect(sql).toContain('CREATE POLICY "profiles_select_admin"');
    expect(sql).toContain("USING (public.is_admin());");
  });

  it("should prevent subscribers from elevating their own role during updates", () => {
    expect(sql).toContain('CREATE POLICY "profiles_update_own"');
    // Checks that the updated role must match their current role in the database
    expect(sql).toContain("AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())");
  });

  it("should define handle_new_user trigger strictly forcing 'subscriber' role", () => {
    expect(sql).toContain("FUNCTION public.handle_new_user()");
    expect(sql).toContain("'subscriber'");
    expect(sql).toContain("AFTER INSERT ON auth.users");
  });

  it("should prevent User A from modifying User B's profile via USING (auth.uid() = id)", () => {
    expect(sql).toContain('CREATE POLICY "profiles_update_own"');
    expect(sql).toContain("USING (auth.uid() = id)");
  });

  it("should strictly ignore user metadata role on insert and force 'subscriber'", () => {
    // Verifies that NEW.raw_user_meta_data->>'role' is NEVER read by the trigger
    expect(sql).not.toContain("NEW.raw_user_meta_data->>'role'");
    expect(sql).toContain("'subscriber' -- Strictly forced: Client cannot specify 'admin' role");
  });

  it("should NOT contain any wildcard public select policy", () => {
    expect(sql).not.toContain("FOR SELECT USING (true);");
    expect(sql).not.toContain("FOR ALL USING (true);");
  });
});
