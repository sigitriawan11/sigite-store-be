export const ROLES = {
  SUPER_ADMIN: {
    id: "40463aa4-1c77-4358-b4e8-02f42b414184",
    name: "Super Admin",
  },
  USER: {
    id: "c788c670-2d0d-42f2-9c56-a60fcb78d859",
    name: "User",
  },
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES]["name"];