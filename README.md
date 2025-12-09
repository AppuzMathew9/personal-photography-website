# Professional Photography Portfolio

A premium, high-performance photography portfolio website featuring a dynamic gallery, admin panel for content management, and integrated support/appreciation system.

## ✨ Features

**🎨 Stunning Visuals**
- Masonry-style responsive gallery
- Premium aesthetic with dark glassmorphism design
- Custom interactive cursor (Desktop only)
- Smooth animations and transitions

**⚙️ Powerful Admin Panel (`admin.html`)**
- **Upload Photos:** Drag & drop interface to add new photos.
- **Cloud Sync:** One-click synchronization with Firebase.
- **Auto-Image Optimization:** Automatic resizing logic for performance.
- **Payment Config:** Set up your UPI ID and QR Code easily.

**🌥️ Smart Cloud Integration**
- Built on **Firebase Storage** & **Firestore Database**.
- Hybrid Mode: Works offline (Local Storage) and Online (Cloud).
- Secure: Authenticated admin access only.

**📸 Detail-Oriented Modal**
- View full-screen images.
- Automatic **EXIF Data** handling (Camera, ISO, Shutter, etc.).
- "Send Appreciation" feature with UPI/QR code integration.

## 🚀 Getting Started

### 1. Admin Setup
1. Open `admin.html` in your browser.
2. Log in using your configured Firebase credentials.
3. Use the **Upload Photo** form to add your images.
   - Enter Title, Category, and Phone Model.
   - The system automatically handles thumbnail generation.

### 2. Deployment (Firebase)
To run this site on the internet:
1. Ensure your `config.js` has your Firebase keys.
2. Run `firebase deploy` if you have the CLI installed, or simply host these files on GitHub Pages / Netlify.
3. **Important Check:** Read `SECURE_YOUR_APP.md` to ensure your database is locked against strangers.

## 💳 Setting Up Payments
1. Go to **Admin Panel** > **Payment Settings**.
2. Enter your **UPI ID** (e.g., `you@okhdfcbank`).
3. Upload your **QR Code** image.
4. Click Save. The "Send Appreciation" button in the gallery will now show your payment details automatically.

## 📱 Responsiveness
- **Desktop:** Full experience with custom cursor and advanced hover effects.
- **Tablet:** Adaptive 2-column grid layout.
- **Mobile:** Optimized 1-column view, native touch controls, hidden custom cursor for usability.

## 🛠 Tech Stack
- **Frontend:** HTML5, Modern CSS3 (Variables, Grid, Flexbox), Vanilla JavaScript (ES6+).
- **Backend:** Firebase (Firestore + Storage).
- **No external frameworks** (React/Vue) used - ensuring maximum speed and easy editing.

---

*Created for photographers who want full control over their portfolio.*
