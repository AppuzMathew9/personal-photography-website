# 🌍 How to Publish Your Website (The Easy Way)

Since you don't have complex software installed on your computer, the fastest way to publish is using **Netlify Drop**. It is free, fast, and works perfectly for portfolio sites.

---

## 🚀 Valid Option: Netlify Drop (Recommended)

### Step 1: Drag & Drop
1.  Open [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Open your File Explorer to `Downloads`.
3.  **Drag and Drop** the entire folder `Photography Site` into the browser window.
4.  Netlify will instantly upload and publish it.
5.  It will give you a random link like `https://funny-panda-123456.netlify.app`.

### Step 2: Fix the Login (Critical!)
Because you are using Firebase Authentication, Google will block the login from this new weird URL unless you whitelist it.

1.  Copy your new Netlify URL (e.g., `https://funny-panda-123456.netlify.app`).
2.  Go to **[Firebase Console > Authentication > Settings](https://console.firebase.google.com/project/mathew-portfolio/authentication/settings)**.
3.  Click the **Authorized Domains** tab.
4.  Click **Add Domain**.
5.  Paste your specific Netlify URL (without `https://` and `/`).
6.  Click **Add**.

**Now you can visit your Netlify link, log in to Admin, and everything will work!**

---

## 📦 Advanced Option: Firebase Hosting
(Only use this if you are comfortable with Command Line and installing Node.js)

**Note for Windows Users:** If `firebase` command fails, put `npx` before it.

1.  Install Node.js from [nodejs.org](https://nodejs.org).
2.  Run `npm install -g firebase-tools` in your terminal.
3.  Run `npx firebase login`.
4.  Run `npx firebase init`.
    - Select **Hosting**.
    - Choose **Use an existing project** -> `mathew-portfolio`.
    - Public directory: `.` (Just type dot and Enter, or type `./` per the defaults).
    - Configure as a single-page app? **No**.
    - Set up automatic builds and deploys with GitHub? **No**.
    - Overwrite index.html? **NO** (Very Important! Say N).
5.  Run `npx firebase deploy`.

**Recommendation: Use Netlify Drop (Option 1). It takes 30 seconds.**
