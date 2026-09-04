import { Session } from "next-auth";

/**
 * Returns the effective user ID to use for data scoping.
 * Sub-accounts (CLIENT users with a parentUserId) inherit the parent
 * account's data, so we resolve to the parent's ID for all reads.
 */
export function getEffectiveUserId(session: Session): string {
  return session.user.parentUserId ?? session.user.id;
}
