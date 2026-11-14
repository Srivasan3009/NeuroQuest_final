# NeuroQuest Firestore Security Specification

## 1. Data Invariants
1. **Identity Isolation**: Every `/users/{userId}` document is strictly owned by `request.auth.uid == userId` and contains PII (`email`, `age`). No other user may `get` or `list` another user's `/users/{userId}` document.
2. **Public Non-PII Leaderboard**: `/leaderboard/{userId}` stores only non-PII public display fields (`uid`, `fullName`, `username`, `avatarUrl`, `sparks`, `xp`, `level`, `completedQuestsCount`, `isPublic`, `createdAt`, `updatedAt`). `list` queries require `isSignedIn()` and `resource.data.isPublic == true`.
3. **Verified Identity & UID Binding**: All writes require `request.auth != null`, `request.auth.token.email_verified == true`, `isValidId(userId)`, and incoming `id == request.auth.uid` (for `users`) or `uid == request.auth.uid` (for `leaderboard`).
4. **Immutable Ownership & Timestamps**: `id`/`uid` and `createdAt` cannot be modified after creation (`incoming().createdAt == existing().createdAt`). `createdAt` (on create) and `updatedAt` (on create & update) must strictly equal `request.time`.
5. **Action-Based Updates & Strict Keys**: Every `create` verifies exact required & allowed keys (`hasAll` + `hasOnly`), and every `update` uses `affectedKeys().hasOnly(...)` paired with the entity validation helper.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: Create `/users/user1` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Create `/users/user1` with `email_verified: false` -> `PERMISSION_DENIED`.
3. **Cross-User Read (PII Leak)**: `get(/users/victimUid)` while signed in as `attackerUid` -> `PERMISSION_DENIED`.
4. **Collection List Scrape**: `list(/users)` as any authenticated user -> `PERMISSION_DENIED`.
5. **Identity Spoofing on Create**: Create `/users/attackerUid` with `{ id: "victimUid", ... }` -> `PERMISSION_DENIED`.
6. **Shadow / Ghost Field Injection**: Create `/users/user1` with extra field `isAdmin: true` -> `PERMISSION_DENIED`.
7. **ID Poisoning Path**: Create `/users/invalid$path..123` -> `PERMISSION_DENIED`.
8. **Timestamp Forgery**: Create `/users/user1` with client-supplied `createdAt` != `request.time` -> `PERMISSION_DENIED`.
9. **Immutable Field Tampering**: Update `/users/user1` changing `createdAt` or `id` -> `PERMISSION_DENIED`.
10. **Value / Type Poisoning**: Update `/users/user1` with `xp: "999999"` (string instead of number) or `fullName` > 100 chars -> `PERMISSION_DENIED`.
11. **Array Exhaustion**: Update `/users/user1` with `completedQuestIds` > 200 entries -> `PERMISSION_DENIED`.
12. **PII Leak into Public Leaderboard**: Create `/leaderboard/user1` with `email: "leak@example.com"` -> `PERMISSION_DENIED`.
