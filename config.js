/* 
 * CONFIGURATION FILE
 * Update these settings to customize your photography portfolio
 */

// PASTE YOUR FIREBASE CONFIG HERE
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAR99iskOS2wnxZbDw5OLmhJnEhIXxxxxx",
    authDomain: "mathew-portfolio.firebaseapp.com",
    projectId: "mathew-portfolio",
    storageBucket: "mathew-portfolio.firebasestorage.app",
    messagingSenderId: "1031256034202",
    appId: "1:1031259393202:web:94b4fec526d824d656c823"
};

const SITE_INFO = {
    siteName: 'PhotoFolio',
    tagline: 'Capturing Life\'s Beautiful Moments',
    subtitle: 'Through the lens of passion and precision',
    email: 'appuzmathew9@gmail.com',

    // Social Media Links
    social: {
        instagram: 'https://instagram.com/a_p_z.mt',
        facebook: 'https://facebook.com/sijomathew'
    }
};

// ===== ABOUT SECTION =====
const ABOUT_INFO = {
    introText: 'Hello! I\'m a working professional who discovered the magic of photography and turned it into a passionate pursuit.',

    mainText: [
        'By day, I navigate the corporate world, but when I pick up my camera, I enter a realm where creativity knows no bounds. Photography isn\'t just a hobby for me—it\'s a way to see the world differently, to capture fleeting moments that tell stories words cannot.',
        'Every photograph in my portfolio represents a moment of connection—with nature, with people, with light and shadow. I believe that great photography comes from the heart, and I pour mine into every shot I take.'
    ],

    stats: {
        photosCaptured: '500+',
        locationsExplored: '50+',
        yearsExperience: '3+'
    },

    equipment: [
        { icon: '📸', name: 'Professional DSLR/Mirrorless Camera' },
        { icon: '🔭', name: 'Multiple Prime & Zoom Lenses' },
        { icon: '💡', name: 'Professional Lighting Equipment' }
    ]
};

// ===== GALLERY CATEGORIES =====
const CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'landscape', name: 'Landscape' },
    { id: 'portrait', name: 'Portrait' },
    { id: 'street', name: 'Street' },
    { id: 'nature', name: 'Nature' }
];

// ===== TIP AMOUNTS =====
const TIP_AMOUNTS = [50, 100, 200, 500]; // In INR

// Export configuration (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FIREBASE_CONFIG,
        SITE_INFO,
        ABOUT_INFO,
        CATEGORIES,
        TIP_AMOUNTS
    };
}
