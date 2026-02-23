import { useAuth } from "../context/AuthContext";
import { permissions } from "../auth/permissions";

export function usePermission(feature: keyof typeof permissions) {
  const { user } = useAuth();

  if (!user) return false;

  return permissions[feature].includes(user.role as any);
}
