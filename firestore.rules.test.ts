/**
 * Security Rule Payload Verification Matrix ("Dirty Dozen" Tests)
 * Documents the 12 adversarial cases verified against firestore.rules.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: "users" | "leaderboard";
  operation: "get" | "list" | "create" | "update";
  expectedResult: "PERMISSION_DENIED";
  reason: string;
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: "Unauthenticated Write",
    collection: "users",
    operation: "create",
    expectedResult: "PERMISSION_DENIED",
    reason: "isVerifiedUser() requires request.auth != null",
  },
  {
    id: 2,
    name: "Unverified Email Write",
    collection: "users",
    operation: "create",
    expectedResult: "PERMISSION_DENIED",
    reason: "isVerifiedUser() requires request.auth.token.email_verified == true",
  },
  {
    id: 3,
    name: "Cross-User Read (PII Leak)",
    collection: "users",
    operation: "get",
    expectedResult: "PERMISSION_DENIED",
    reason: "allow get requires request.auth.uid == userId",
  },
  {
    id: 4,
    name: "Users Collection Scrape",
    collection: "users",
    operation: "list",
    expectedResult: "PERMISSION_DENIED",
    reason: "allow list is explicitly false on /users",
  },
  {
    id: 5,
    name: "Identity Spoofing on Create",
    collection: "users",
    operation: "create",
    expectedResult: "PERMISSION_DENIED",
    reason: "isValidUserProfile enforces data.id == request.auth.uid",
  },
  {
    id: 6,
    name: "Shadow Ghost Field Injection",
    collection: "users",
    operation: "create",
    expectedResult: "PERMISSION_DENIED",
    reason: "data.keys().hasOnly(...) rejects unknown keys like isAdmin",
  },
  {
    id: 7,
    name: "Path ID Poisoning",
    collection: "users",
    operation: "create",
    expectedResult: "PERMISSION_DENIED",
    reason: "isValidId(userId) enforces <= 128 chars and ^[a-zA-Z0-9_\\-]+$",
  },
  {
    id: 8,
    name: "Client Timestamp Forgery",
    collection: "users",
    operation: "create",
    expectedResult: "PERMISSION_DENIED",
    reason: "createdAt and updatedAt must strictly equal request.time",
  },
  {
    id: 9,
    name: "Immutable Field Tampering",
    collection: "users",
    operation: "update",
    expectedResult: "PERMISSION_DENIED",
    reason: "incoming().id == existing().id and incoming().createdAt == existing().createdAt",
  },
  {
    id: 10,
    name: "Value / Type Poisoning",
    collection: "users",
    operation: "update",
    expectedResult: "PERMISSION_DENIED",
    reason: "isValidUserProfile wraps update and enforces types and max lengths",
  },
  {
    id: 11,
    name: "Array Exhaustion",
    collection: "users",
    operation: "update",
    expectedResult: "PERMISSION_DENIED",
    reason: "isValidStringList enforces bounded list size <= 200",
  },
  {
    id: 12,
    name: "PII Leak into Public Leaderboard",
    collection: "leaderboard",
    operation: "create",
    expectedResult: "PERMISSION_DENIED",
    reason: "isValidLeaderboardEntry rejects email/age via hasOnly",
  },
];
