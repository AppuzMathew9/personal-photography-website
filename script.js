// Initialize Firebase
let db, storage, auth;
let useFirebase = false;

if (typeof firebase !== 'undefined' && typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY") {
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        storage = firebase.storage();
        useFirebase = true;
        console.log("Firebase initialized");
    } catch (e) {
        console.error("Firebase init failed:", e);
    }
}

// Global DOM Elements & State
const tipAmountBtns = document.querySelectorAll('.tip-amount');
const customAmountInput = document.getElementById('customAmount');
const tipMessage = document.getElementById('tipMessage');
const tipSubmitBtn = document.getElementById('tipSubmitBtn');
let selectedTipAmount = null;

// Modal Elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const exifData = document.getElementById('exifData');

// Navigation Elements
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryGrid = document.getElementById('galleryGrid');
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// Data State
let galleryData = [];
let filteredGalleryItems = [];
let currentImageIndex = 0;
let likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '{}');
const aboutPhotoFallback = 'about-photo.jpg';

// Load gallery data
async function getGalleryData() {
    if (useFirebase) {
        try {
            // Priority: createdAt (new uploads), then Fallback to id (old migrated data or if createdAt is missing)
            let snapshot;
            try {
                snapshot = await db.collection('photos').orderBy('createdAt', 'desc').get();
            } catch (sortError) {
                console.warn("Sorting by createdAt failed (index might be building), falling back to id", sortError);
                snapshot = await db.collection('photos').orderBy('id', 'desc').get();
            }

            return snapshot.docs.map(doc => doc.data());
        } catch (e) {
            console.error("Error fetching from Firebase:", e);
            return [];
        }
    } else {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('galleryPhotos') || '[]');
    }
}

// Load global settings (Profile & Payment)
async function loadGlobalSettings() {
    if (!useFirebase) return;

    try {
        // 1. Profile Photo
        db.collection('settings').doc('profile').get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (data.image) {
                    localStorage.setItem('aboutPhoto', data.image);
                    const img = document.getElementById('aboutPhoto');
                    if (img) img.src = data.image; // Live update
                }
            }
        }).catch(e => console.warn("Profile fetch failed:", e));

        // 2. Payment Config
        db.collection('settings').doc('payment').get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                const config = {
                    upiId: data.upiId || '',
                    qrImage: data.qrImage || ''
                };
                localStorage.setItem('paymentConfig', JSON.stringify(config));
            }
        }).catch(e => console.warn("Payment fetch failed:", e));

    } catch (e) {
        console.warn("Global Settings Sync Error:", e);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    galleryData = await getGalleryData();
    renderGallery();
    initializeEventListeners();
    initializeNavigation();
    initializeTipForm();
    loadAboutPhoto();
    // Fetch latest settings from cloud
    loadGlobalSettings();
    initializeCustomCursor();
    initializeScrollAnimations();
});

// Custom Cursor Logic
function initializeCustomCursor() {
    if (!cursorDot || !cursorOutline) return;

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows immediately
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with slight delay (animation handled by CSS transition)
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover effect for links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .gallery-item, input, textarea, select, .modal-nav-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('.section-title, .section-subtitle, .about-content, .support-card, .gallery-item');
    animatedElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
        observer.observe(el);
    });
}

// Load about photo with fallback
// Old loadAboutPhoto removed to avoid duplicate
// (Logic moved to bottom of file in previous edit)

// Check if image exists, use fallback if not
function getImageSrc(item) {
    return new Promise((resolve) => {
        // If image is base64 (uploaded via admin), use it directly
        if (item.image && item.image.startsWith('data:image')) {
            resolve(item.image);
            return;
        }

        // Otherwise try to load the image file
        const img = new Image();
        img.onload = () => resolve(item.image);
        img.onerror = () => resolve(item.fallback || item.image);
        img.src = item.image;
    });
}

// Render gallery
async function renderGallery(filter = 'all') {
    filteredGalleryItems = filter === 'all'
        ? galleryData
        : galleryData.filter(item => item.category === filter);

    // Create gallery items with fallback support
    const galleryItems = await Promise.all(filteredGalleryItems.map(async (item) => {
        const imgSrc = await getImageSrc(item);
        const isLiked = likedPhotos[item.id];

        return `
            <div class="gallery-item" data-id="${item.id}" data-category="${item.category}">
                <div class="gallery-item-inner">
                    <img src="${imgSrc}" alt="${item.title}" class="gallery-image" loading="lazy">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(event, ${item.id})">
                        ${isLiked ? '❤️' : '🤍'}
                    </button>
                    <div class="gallery-overlay">
                        <div class="gallery-title">${item.title}</div>
                        <div class="gallery-category">${capitalizeFirst(item.category)}</div>
                    </div>
                </div>
            </div>
        `;
    }));

    if (galleryItems.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <p style="font-size: 1.2rem;">No photos found in this category yet.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">(Check back soon or visit Admin to upload!)</p>
            </div>
        `;
    } else {
        galleryGrid.innerHTML = galleryItems.join('');
    }

    // Re-initialize scroll animations for new items
    initializeScrollAnimations();
    initialize3DTilt();

    // Add click listeners to gallery items (excluding like button)
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.like-btn')) {
                const id = parseInt(item.dataset.id);
                openModal(id);
            }
        });

        // Add hover effect for cursor
        item.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        item.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// 3D Tilt Effect Logic
function initialize3DTilt() {
    const items = document.querySelectorAll('.gallery-item');

    items.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Toggle Like
window.toggleLike = function (event, id) {
    event.stopPropagation(); // Prevent modal opening

    const btn = event.currentTarget;
    const isLiked = likedPhotos[id];
    let countSpan = btn.querySelector('.like-count');

    if (!countSpan) {
        countSpan = document.createElement('span');
        countSpan.className = 'like-count';
        btn.appendChild(countSpan);
    }

    if (isLiked) {
        delete likedPhotos[id];
        btn.classList.remove('liked');
        btn.innerHTML = '🤍';
        // Remove count span if unliked (or set to 0)
    } else {
        likedPhotos[id] = true;
        btn.classList.add('liked');
        btn.innerHTML = '❤️ <span class="like-count">1</span>';

        // Pulse animation
        btn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.4)' },
            { transform: 'scale(1)' }
        ], { duration: 300 });
    }

    localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
};

// Filter gallery
function filterGallery(category) {
    currentFilter = category;
    renderGallery(category);

    // Update active filter button
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
}

// Open modal with image details
async function openModal(id) {
    // Find index in currently filtered items
    currentImageIndex = filteredGalleryItems.findIndex(img => img.id === id);
    if (currentImageIndex === -1) return;

    updateModalContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Update modal content based on current index
async function updateModalContent() {
    const item = filteredGalleryItems[currentImageIndex];
    if (!item) return;

    const imgSrc = await getImageSrc(item);

    modalImage.src = imgSrc;
    modalImage.alt = item.title;
    modalTitle.textContent = item.title;

    // Populate EXIF data
    exifData.innerHTML = `
        <div class="exif-item">
            <div class="exif-label">Camera</div>
            <div class="exif-value">${item.exif.camera}</div>
        </div>
        <div class="exif-item">
            <div class="exif-label">Lens</div>
            <div class="exif-value">${item.exif.lens}</div>
        </div>
        <div class="exif-item">
            <div class="exif-label">Aperture</div>
            <div class="exif-value">${item.exif.aperture}</div>
        </div>
        <div class="exif-item">
            <div class="exif-label">Shutter Speed</div>
            <div class="exif-value">${item.exif.shutter}</div>
        </div>
        <div class="exif-item">
            <div class="exif-label">ISO</div>
            <div class="exif-value">${item.exif.iso}</div>
        </div>
        <div class="exif-item">
            <div class="exif-label">Focal Length</div>
            <div class="exif-value">${item.exif.focalLength}</div>
        </div>
        <div class="exif-item">
            <div class="exif-label">Date Taken</div>
            <div class="exif-value">${item.exif.date}</div>
        </div>
    `;
}

// Next Image
function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % filteredGalleryItems.length;
    updateModalContent();
}

// Previous Image
function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + filteredGalleryItems.length) % filteredGalleryItems.length;
    updateModalContent();
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterGallery(btn.dataset.filter);
        });
    });

    // Modal close
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Modal Navigation Buttons
    // Create buttons if they don't exist
    if (!document.querySelector('.prev-btn')) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'modal-nav-btn prev-btn';
        prevBtn.innerHTML = '&#10094;'; // Left arrow
        prevBtn.onclick = (e) => { e.stopPropagation(); prevImage(); };
        document.querySelector('.modal-content').appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'modal-nav-btn next-btn';
        nextBtn.innerHTML = '&#10095;'; // Right arrow
        nextBtn.onclick = (e) => { e.stopPropagation(); nextImage(); };
        document.querySelector('.modal-content').appendChild(nextBtn);
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');

            // Animate hamburger
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

// Navigation
function initializeNavigation() {
    // Smooth scroll and active link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');

            // Handle external links (like admin.html)
            if (!targetId.startsWith('#')) {
                window.location.href = targetId;
                return;
            }

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Close mobile menu
                navMenu.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active link on scroll
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize tip form
function initializeTipForm() {
    if (!tipSubmitBtn || !customAmountInput) return;

    // Tip amount buttons
    if (tipAmountBtns) {
        tipAmountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tipAmountBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTipAmount = parseInt(btn.dataset.amount);
                customAmountInput.value = '';
            });
        });
    }

    // Custom amount input
    customAmountInput.addEventListener('input', () => {
        tipAmountBtns.forEach(b => b.classList.remove('selected'));
        selectedTipAmount = parseInt(customAmountInput.value) || null;
    });

    // Submit tip
    tipSubmitBtn.addEventListener('click', handleTipSubmit);
}

// Handle tip submission
function handleTipSubmit() {
    const amount = selectedTipAmount || parseInt(customAmountInput.value);
    const message = tipMessage.value.trim();

    if (!amount || amount < 1) {
        alert('Please enter a valid amount');
        return;
    }

    // Check for UPI/QR Configuration
    const paymentConfig = JSON.parse(localStorage.getItem('paymentConfig') || '{}');

    if (!paymentConfig.upiId && !paymentConfig.qrImage) {
        alert("Payment details not set up yet. (Please configure in Admin Panel)");
        return;
    }

    // Create Payment Modal content
    const upiLink = paymentConfig.upiId ?
        `upi://pay?pa=${paymentConfig.upiId}&pn=PhotoFolio&am=${amount}&tn=${encodeURIComponent(message || 'Appreciation')}` : '#';

    const qrSrc = paymentConfig.qrImage || `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=200x200`;

    // Reuse the existing modal structure for Payment
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const exifData = document.getElementById('exifData');

    // Temporarily repurpose modal for payment
    // We backup original close handler to restore later if needed, 
    // but here we just set content.

    modalImage.style.display = 'none'; // Hide main image slot

    // Create custom content container if it doesn't exist
    let paymentContainer = document.getElementById('paymentContainer');
    if (!paymentContainer) {
        paymentContainer = document.createElement('div');
        paymentContainer.id = 'paymentContainer';
        paymentContainer.style.textAlign = 'center';
        paymentContainer.style.padding = '2rem';
        document.querySelector('.modal-image-container').appendChild(paymentContainer);
    }
    paymentContainer.style.display = 'block';

    paymentContainer.innerHTML = `
        <h2 style="color:white; margin-bottom:1rem;">Scan to Pay ₹${amount}</h2>
        <div style="background:white; padding:1rem; display:inline-block; border-radius:10px;">
            <img src="${qrSrc}" style="width:250px; height:250px; display:block;" alt="Payment QR">
        </div>
        <p style="color:#aaa; margin-top:1rem;">UPI ID: <span style="color:white; user-select:all;">${paymentConfig.upiId || 'N/A'}</span></p>
        
        <div style="margin-top:2rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <a href="${upiLink}" class="tip-submit-btn" style="display:inline-block; text-decoration:none; color:black; width: auto; padding: 0.8rem 2rem;">
                Open in Payment App
            </a>
            
            <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; width: 100%;">
                <p style="font-size: 0.9rem; color: #888; margin-bottom: 0.5rem;">After payment, click below:</p>
                <button id="confirmPaymentBtn" style="background: #22c55e; color: white; border: none; padding: 0.8rem 2rem; border-radius: 100px; font-weight: bold; cursor: pointer; transition: transform 0.2s;">
                    I Have Made the Payment
                </button>
            </div>
        </div>
    `;
    // Hide standard Info section
    document.querySelector('.modal-info').style.display = 'none';
    document.querySelector('.modal-content').style.gridTemplateColumns = '1fr'; // Full width

    // Explicitly hide arrows
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    if (prevBtn) prevBtn.style.setProperty('display', 'none', 'important');
    if (nextBtn) nextBtn.style.setProperty('display', 'none', 'important');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Hook close button to reset modal state
    const closeBtn = document.getElementById('modalClose');

    // Define cleanup function
    const cleanup = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Restore Modal State for Gallery
        modalImage.style.display = 'block';
        if (paymentContainer) paymentContainer.style.display = 'none';
        document.querySelector('.modal-info').style.display = 'block';
        document.querySelector('.modal-content').style.gridTemplateColumns = ''; // Reset grid

        // RESTORE ARROWS
        if (prevBtn) prevBtn.style.display = '';
        if (nextBtn) nextBtn.style.display = '';

        resetTipForm();

        // Remove listeners
        closeBtn.removeEventListener('click', cleanup);
        document.getElementById('modalOverlay').removeEventListener('click', cleanup);
    };

    // Handle Payment Confirmation
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            alert("Thank you for your support! ❤️\n\nYour transaction has been noted.");
            cleanup();
        };
    }

    closeBtn.addEventListener('click', cleanup);
    document.getElementById('modalOverlay').addEventListener('click', cleanup);
}

// Load about photo
function loadAboutPhoto() {
    const aboutPhoto = document.getElementById('aboutPhoto');
    if (!aboutPhoto) return;

    // Check localStorage first (User uploaded)
    const uploadedAbout = localStorage.getItem('aboutPhoto');
    if (uploadedAbout) {
        aboutPhoto.src = uploadedAbout;
    } else {
        // Fallback or static
        aboutPhoto.src = 'about-photo.jpg'; // Expects file in root
        aboutPhoto.onerror = () => {
            aboutPhoto.src = aboutPhotoFallback;
        };
    }
}

// Reset tip form
function resetTipForm() {
    tipAmountBtns.forEach(b => b.classList.remove('selected'));
    customAmountInput.value = '';
    tipMessage.value = '';
    selectedTipAmount = null;
}

// Utility function
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    if (hero && scrolled < window.innerHeight) {
        // Parallax background
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;

        // Parallax content
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    }
});
