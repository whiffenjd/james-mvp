export type Role = "admin" | "investor" | "fundManager";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  // Add other fields as needed
}
