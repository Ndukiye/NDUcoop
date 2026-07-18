import { useAuthStore } from "../store/auth";
import { roleLabel } from "./roles";

/**
 * Admin actions are attributed to the office (President, Treasurer, ...)
 * rather than the person holding it — offices are stable across tenures and
 * are what the cooperative's records should reference.
 */
export function currentActorOffice(): string {
  const user = useAuthStore.getState().user;
  return user ? roleLabel(user.role) : "Admin";
}
