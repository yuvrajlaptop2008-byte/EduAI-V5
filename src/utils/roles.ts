export type AppRole = "student" | "teacher" | "admin" | "parent";

/** Legacy accounts were created with role "user" — treat that as "student". */
export function normalizeRole(role: string | undefined | null): AppRole {
  if (role === "teacher" || role === "admin" || role === "parent") return role;
  return "student";
}

export const ROLE_HOME: Record<AppRole, string> = {
  student: "/app",
  teacher: "/teacher",
  admin: "/admin",
  parent: "/parent",
};
