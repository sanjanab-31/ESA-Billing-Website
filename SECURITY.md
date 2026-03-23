# Security Overview

This app uses **Firebase** as the backend (Auth, Firestore, Storage). All security is enforced **server-side** via Firebase Security Rules; the client is never trusted.

## Backend = Firebase

- **Auth**: Firebase Authentication (email/password). Session persistence is browser session.
- **Database**: Firestore. All user data lives under `users/{userId}/...` (per-user isolation).
- **Storage**: Firebase Storage. Company logos under `logos/{userId}/{fileName}`.

## Security Principles

1. **Never trust the client**  
   Every Firestore and Storage request is validated by Firebase rules. The client cannot read or write another user’s data, even if it tries.

2. **UID only from Auth**  
   The app uses `request.auth.uid` (from the Firebase Auth token) for all data paths. UID is never taken from URL params, localStorage, or user input for backend calls.

3. **Least privilege**  
   Rules are deny-by-default. Only explicitly allowed paths are readable/writable, and only for the authenticated owner.

4. **Input validation**  
   - **Firestore**: User profile document (`users/{userId}`) allows only a fixed set of fields and max lengths.  
   - **Storage**: Logo uploads restricted to type `image/*` and size &lt; 2 MB.

## Firestore Rules (summary)

- `users/{userId}`: read/write only if `request.auth.uid == userId`. Profile writes allowed only with validated fields and lengths.
- `users/{userId}/customers|products|invoices|payments|settings`: read/write only if `request.auth.uid == userId`.
- All other paths: **deny**.

## Storage Rules (summary)

- `logos/{userId}/{fileName}`: write only if authenticated as that user, file is image, size &lt; 2 MB. Read allowed (tokenized URLs).
- All other paths: **deny**.

## Deployment Checklist

1. **Environment**  
   Set all `VITE_FIREBASE_*` variables in `.env` (see `.env.example`). In production, missing config will throw at startup.

2. **Deploy rules**  
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

3. **Auth domain**  
   In Firebase Console → Authentication → Settings, ensure your app’s domain is in the authorized list.

4. **No secrets in client**  
   Firebase client config (apiKey, etc.) is safe to ship; security is enforced by rules. Do not put Admin SDK keys or other secrets in the frontend.

## Connections to Backend

- **useFirestore.js**: All Firestore access uses `users/{uid}/...` with `uid` from `AuthContext` only.
- **CompanyProfileContext**: Reads `users/{uid}` with `uid` from `AuthContext`.
- **SignUp**: Writes `users/{uid}` and Storage `logos/{uid}/company_logo` only after `createUserWithEmailAndPassword` (so `uid` is from Auth).
- **ClearAndReseed**: Deletes only under `users/{user.uid}/...` with `user` from `AuthContext`.

All of these paths are protected by the rules above; incorrect or malicious client requests are rejected by Firebase.
