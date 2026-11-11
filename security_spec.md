# Security Specification & Threat Model for OmniLink

## 1. Data Invariants
- Each user can only write and mutate their own `users/{userId}` and `profiles/{userId}` documents where `userId == request.auth.uid`.
- Public visitors can read public `profiles/{profileId}` documents without authentication to display the Bio Link page.
- User email, UID, and authorization status are strictly locked to `request.auth`.
- Sensitive operations on account status (`isPro`, etc.) are protected against unauthorized parameter manipulation.

## 2. Dirty Dozen Threat Test Cases
1. Anonymous user trying to write to `users/someUser`.
2. Authenticated user trying to update another user's `profiles/otherUser`.
3. Malicious payload injecting oversized strings (> 1024 chars) into `avatarUrl`.
4. Identity spoofing attempt setting `userId` to someone else's UID on `profiles`.
5. Unauthenticated read attempt on private user system settings.
6. Malicious write attempting shadow fields not declared in blueprint.
7. Modifying `createdAt` or `uid` on existing `users/{userId}` document.
8. Unverified email write attempt if email verification was mandated.
9. Invalid document ID containing injection payload (`isValidId` check).
10. Rapid wallet balance manipulation injection.
11. Attempting to list all `users` collection without proper constraints.
12. Overwriting `isPro` status directly from non-admin client request.

## 3. Security Rules Policy
- `users/{userId}`: `read, write` if `isSignedIn() && request.auth.uid == userId`.
- `profiles/{profileId}`: `read` allowed for anyone (`allow get, list: if true;`), `write, create, update` allowed if `isSignedIn() && request.auth.uid == profileId` (or matching `resource.data.userId`).
