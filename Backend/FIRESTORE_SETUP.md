# ⚠️ Firebase Setup Issue - NOT_FOUND Error

## Problem

You're getting a `5 NOT_FOUND` error when trying to connect to Firestore. This typically means:

1. **Firestore is not enabled** in your Firebase project, OR
2. **The service account doesn't have permission** to access Firestore

## Solution

### Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **esa-billing**
3. Click on **"Firestore Database"** in the left sidebar
4. If you see a **"Create database"** button, click it:
   - Choose **"Start in production mode"** or **"Start in test mode"**
   - Select a location (e.g., `us-central` or closest to you)
   - Click **"Enable"**

### Step 2: Verify Firestore is Active

After enabling, you should see the Firestore console with tabs like:
- Data
- Rules
- Indexes
- Usage

### Step 3: Check Service Account Permissions

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Service Accounts** tab
3. Your service account should have **"Firebase Admin SDK"** role
4. If you just generated the key, it should have full permissions

### Step 4: Test Again

```bash
cd Backend
npm run setup-db
```

## Alternative: Use Test Mode (Temporary)

If you want to quickly test, you can set Firestore to test mode:

1. Go to Firestore Database → **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // WARNING: Insecure! Only for testing
    }
  }
}
```

3. Click **"Publish"**

⚠️ **Important**: This makes your database publicly accessible! Only use for testing, then set proper security rules.

## Proper Security Rules (After Testing)

Once everything works, update your Firestore rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Still Having Issues?

### Check if Firestore is enabled:
```bash
# The test script will show more details
node test-firebase.js
```

### Verify your service account key:
- Make sure `serviceAccountKey.json` is from the correct project
- The file should contain `"project_id": "esa-billing"`
- Check that it's a valid JSON file

### Check Firebase project:
- Project ID in `.env` matches your Firebase project
- Firestore Database is enabled (not Realtime Database)
- Service account has admin permissions

---

**Next Steps:**
1. Enable Firestore in Firebase Console
2. Run `npm run setup-db` again
3. If successful, start the server with `npm run dev`
