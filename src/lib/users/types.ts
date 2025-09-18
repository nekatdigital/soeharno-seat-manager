export type UserRole = 'owner' | 'staff';
export interface AppUser {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // sha-256 hex
  role: UserRole;
  createdAt: string;
}
