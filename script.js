// Global variables
let isMusicPlaying = false;
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const mainContainer = document.getElementById('mainContainer');
const bottomNav = document.getElementById('bottomNav');
const progressBar = document.getElementById('progressBar');

// 1. Personalized Guest Name from URL
function getGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        const cleanName = decodeURIComponent(guestName.replace(/\+/g, ' '));
        // Also inject into custom welcoming text if needed
        const welcomeMessage = document.querySelector('.invitation-quote');
        if (welcomeMessage) {
            welcomeMessage.innerHTML = `Hallo <strong>${cleanName}</strong>, you are invited to the wedding of`;
        }
    }
}

// 2. Mock Status Bar Time Updater (Android / iOS Style Clock)
function updateMockTime() {
    const timeEl = document.getElementById('mockTime');
    if (!timeEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.innerText = `${hours}:${minutes}`;
}

// 3. Audio Activator on First Interaction (Standard bypass for browser autoplay policies)
function initAudioAutoplay() {
    const startAudio = () => {
        if (isMusicPlaying) return; // Already running
        
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                musicBtn.classList.add('playing');
                // Remove listeners once active
                removeListeners();
            }).catch((error) => {
                console.log("Audio play deferred for next click: ", error);
            });
        } else {
            isMusicPlaying = true;
            musicBtn.classList.add('playing');
            removeListeners();
        }
    };

    const removeListeners = () => {
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
        mainContainer.removeEventListener('scroll', startAudio);
        window.removeEventListener('wheel', startAudio);
    };

    // Attach interaction triggers
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);
    mainContainer.addEventListener('scroll', startAudio);
    window.addEventListener('wheel', startAudio);
}

// Manual Toggle Music Controller
function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
        musicBtn.classList.remove('playing');
    } else {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            musicBtn.classList.add('playing');
        }).catch(err => {
            console.log("Music play blocked: ", err);
        });
    }
}

// 4. Countdown Timer to June 4, 2026
function initCountdown() {
    const weddingDate = new Date('June 4, 2026 09:00:00 GMT+0800').getTime();

    const interval = setInterval(function() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(interval);
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('mins').innerText = "00";
            document.getElementById('secs').innerText = "00";
        } else {
            document.getElementById('days').innerText = String(days).padStart(2, '0');
            document.getElementById('hours').innerText = String(hours).padStart(2, '0');
            document.getElementById('mins').innerText = String(minutes).padStart(2, '0');
            document.getElementById('secs').innerText = String(seconds).padStart(2, '0');
        }
    }, 1000);
}

// 5. Scroll Progress Bar & Bottom Navigation Highlighting
function handleScroll() {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Progress bar calculation
    const scrollTop = mainContainer.scrollTop;
    const scrollHeight = mainContainer.scrollHeight - mainContainer.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = scrollPercent + '%';

    // Section highlighting
    let currentSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollTop >= (sectionTop - sectionHeight / 3)) {
            currentSectionId = section.getAttribute('id');
        }
    });

    if (currentSectionId) {
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    }
}

// Smooth scroll to a section inside the scrollable phone container
function scrollToSection(id, event) {
    if (event) {
        event.preventDefault();
    }
    const targetSection = document.getElementById(id);
    if (targetSection) {
        mainContainer.scrollTo({
            top: targetSection.offsetTop,
            behavior: 'smooth'
        });
    }
}

// 6. CINEMATIC SCROLL REVEAL OBSERVER
function initCinematicObserver() {
    const animatedElements = document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-left, .reveal-right');
    
    const options = {
        root: mainContainer,
        rootMargin: '0px',
        threshold: 0.12 // Trigger when 12% of the card is visible in the container viewport
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                // Once visible, we unobserve to preserve memory and stop redundant calculations
                observer.unobserve(entry.target);
            }
        });
    }, options);

    animatedElements.forEach(el => {
        revealObserver.observe(el);
    });
}

// 7. High-Performance Video Playback Control (IntersectionObserver)
let videoObserver;
function initVideoObserver() {
    const videoContainers = document.querySelectorAll('.section');
    
    const options = {
        root: mainContainer,
        rootMargin: '0px',
        threshold: 0.35
    };

    videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('.bg-video');
            if (!video) return;

            if (entry.isIntersecting) {
                // Play visible video
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {});
                }
            } else {
                // Pause non-visible video
                video.pause();
            }
        });
    }, options);

    videoContainers.forEach(container => {
        videoObserver.observe(container);
    });
}

// Fallback to trigger video plays
function playVisibleVideos() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const video = section.querySelector('.bg-video');
        if (video && rect.top >= 0 && rect.bottom <= window.innerHeight) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {});
            }
        }
    });
}

// 8. Clipboard Copy Utility
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage);
    }).catch(err => {
        // Fallback
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast(successMessage);
    });
}

function showToast(message) {
    const toast = document.getElementById('toastNotice');
    toast.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// 9. Image Lightbox Zoom
function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightboxModal');
    lightbox.classList.remove('active');
}

// 10. RSVP & Wishes Board with localStorage
const DEFAULT_WISHES = [
    { name: "Ahmad & Keluarga", status: "Hadir", message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. Selamat menempuh hidup baru Mirna & Andri! Semoga menjadi keluarga sakinah, mawaddah, warahmah." },
    { name: "Siti Rahma", status: "Hadir", message: "Sangat senang mendengarnya! Selamat Mirna sayang, akhirnya hari bahagia ini tiba juga. Semoga acaranya lancar sampai hari-H ya, aamiin ya rabbal alamin." },
    { name: "Budi Santoso", status: "Tidak Hadir", message: "Mohon maaf yang sebesar-besarnya tidak bisa hadir langsung karena sedang bertugas di luar kota. Selamat menempuh bahtera rumah tangga baru, semoga berkah dunia akhirat!" }
];

function initWishesBoard() {
    let wishes = JSON.parse(localStorage.getItem('wedding_wishes_mirna_andri'));
    
    if (!wishes || wishes.length === 0) {
        wishes = DEFAULT_WISHES;
        localStorage.setItem('wedding_wishes_mirna_andri', JSON.stringify(wishes));
    }
    
    renderWishes(wishes);
}

function renderWishes(wishes) {
    const board = document.getElementById('wishesBoard');
    board.innerHTML = '';
    
    wishes.slice().reverse().forEach(wish => {
        const item = document.createElement('div');
        item.className = 'wish-item';
        
        const badgeClass = wish.status === 'Hadir' ? 'hadir' : 'tidak-hadir';
        
        item.innerHTML = `
            <div class="wish-item-header">
                <span class="wish-sender">${escapeHtml(wish.name)}</span>
                <span class="wish-badge ${badgeClass}">${wish.status}</span>
            </div>
            <p class="wish-text">${escapeHtml(wish.message)}</p>
        `;
        board.appendChild(item);
    });
}

function submitWish(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('inputName');
    const statusInput = document.getElementById('inputStatus');
    const messageInput = document.getElementById('inputMessage');
    
    const newWish = {
        name: nameInput.value.trim(),
        status: statusInput.value,
        message: messageInput.value.trim()
    };
    
    if (!newWish.name || !newWish.message) return;
    
    let wishes = JSON.parse(localStorage.getItem('wedding_wishes_mirna_andri')) || [];
    wishes.push(newWish);
    localStorage.setItem('wedding_wishes_mirna_andri', JSON.stringify(wishes));
    
    renderWishes(wishes);
    
    // Clear inputs
    nameInput.value = '';
    messageInput.value = '';
    
    showToast('Ucapan Anda berhasil dikirim!');
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 11. Social Media Sharing Handler
function shareVia(platform) {
    const text = encodeURIComponent("Halo! Saya mengundang Anda untuk menyaksikan hari bahagia kami melalui undangan pernikahan digital Mirna & Andri di link berikut: " + window.location.href);
    let url = '';
    
    switch(platform) {
        case 'whatsapp':
            url = `https://api.whatsapp.com/send?text=${text}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
            break;
        case 'instagram':
            showToast('Salin tautan untuk dibagikan di Bio Instagram!');
            return;
    }
    
    window.open(url, '_blank');
}

// Initialize Everything on Load
window.addEventListener('DOMContentLoaded', () => {
    getGuestName();
    initCountdown();
    initWishesBoard();
    
    // Custom container scroll events
    mainContainer.addEventListener('scroll', handleScroll);
    
    // Initialize High performance background video controller
    initVideoObserver();
    
    // Initialize Cinematic Scroll Animation Engine
    initCinematicObserver();
    
    // Initialize Audio Autoplay Interaction Watcher
    initAudioAutoplay();
    
    // Setup Mock Status Bar Running Clock
    setInterval(updateMockTime, 1000);
    updateMockTime();
    
    // Trigger video play fallbacks
    playVisibleVideos();
});
