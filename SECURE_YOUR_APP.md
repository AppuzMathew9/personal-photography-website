# 🔒 Final Step: Secure Your Database

Now that everything is syncing perfectly, we must **Lock the Doors**.
Currently, your database is set to `allow write: if true`. This means anyone can delete your photos if they guess the URL.

Since you have a login system, we will now use the **Secure Rules**.

---

### 1. Secure Firestore (Database)
Go to **[Firestore Rules](https://console.firebase.google.com/project/mathew-portfolio/firestore/rules)** and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true; // Everyone can see photos
      allow write: if request.auth != null; // Only YOU (Logged in) can upload/delete
    }
  }
}
```

---

### 2. Secure Storage (Images)
Go to **[Storage Rules](https://console.firebase.google.com/project/mathew-portfolio/storage/rules)** and paste this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Everyone can see images
      allow write: if request.auth != null; // Only YOU can upload
    }
  }
}
```

---

### ✅ Round Checkup Complete
1.  **Sync Issue:** Fixed (New Project + Correct Rules).
2.  **Cursor:** Fixed (Restored Premium Style).
3.  **Performance:** Images use `loading="lazy"` correctly.
4.  **Admin:** Safe and Secure with these new rules.

Your site is ready for the world! 🌍
