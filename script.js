// Global Elements
let isMusicPlaying = false;
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const mainContainer = document.getElementById('mainContainer');
const progressBar = document.getElementById('progressBar');

// Background Switching Elements
let currentBgSource = 'bg2.mp4';
const bgVideo1 = document.getElementById('bgVideo1');
const bgVideo2 = document.getElementById('bgVideo2');
let activeVideoElement = bgVideo1;

// ========== COVER SCREEN LOGIC ==========

// Create floating particles on cover
function createParticles() {
    const container = document.getElementById('coverParticles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = (60 + Math.random() * 40) + '%';
        p.style.width = (2 + Math.random() * 4) + 'px';
        p.style.height = p.style.width;
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (4 + Math.random() * 4) + 's';
        container.appendChild(p);
    }
}

// Animate cover elements with zoom-in
function animateCover() {
    setTimeout(() => {
        document.querySelectorAll('.reveal-cover').forEach(el => {
            el.classList.add('active');
        });
    }, 200);
}

// Read guest name from URL ?to=NamaTamu
function getGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        const cleanName = decodeURIComponent(guestName.replace(/\+/g, ' '));
        const el = document.getElementById('guestNameDisplay');
        if (el) el.textContent = cleanName;
    }
}

// Open invitation - hide cover, show main content, start music
function openInvitation() {
    const cover = document.getElementById('coverScreen');
    const wrapper = document.getElementById('invitationWrapper');

    cover.classList.add('hidden');
    wrapper.classList.add('open');

    // Start music
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicBtn.classList.add('playing');
    }).catch(e => console.log('Music autoplay blocked:', e));

    // Ensure initial fixed bg video plays
    if (bgVideo1) {
        bgVideo1.play().catch(e => console.log('Fixed background play blocked:', e));
    }

    // Remove cover from DOM after transition
    setTimeout(() => {
        cover.style.display = 'none';
        // Init observers after content is visible
        initCinematicObserver();
        handleScroll(); // Trigger initial scroll check to set active nav and correct video bg
    }, 1000);
}

// ========== MUSIC CONTROL ==========
function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
        musicBtn.classList.remove('playing');
    } else {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            musicBtn.classList.add('playing');
        }).catch(err => console.log('Music play blocked:', err));
    }
}

// ========== COUNTDOWN ==========
function initCountdown() {
    const weddingDate = new Date('June 4, 2026 09:00:00 GMT+0800').getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const d = weddingDate - now;
        if (d < 0) {
            ['days','hours','mins','secs'].forEach(id => document.getElementById(id).innerText = '00');
            return;
        }
        document.getElementById('days').innerText = String(Math.floor(d / 86400000)).padStart(2, '0');
        document.getElementById('hours').innerText = String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0');
        document.getElementById('mins').innerText = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
        document.getElementById('secs').innerText = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
    }, 1000);
}

// ========== CINEMATIC BACKGROUND SWITCHER ==========
function changeBackground(newSource) {
    if (!newSource || newSource === currentBgSource) return;

    const inactiveVideoElement = (activeVideoElement === bgVideo1) ? bgVideo2 : bgVideo1;

    // Load new background video source
    inactiveVideoElement.src = newSource;
    inactiveVideoElement.load();

    const doTransition = () => {
        // Set z-indexes: new video goes on top, old video goes behind but remains visible
        inactiveVideoElement.style.zIndex = '2';
        activeVideoElement.style.zIndex = '1';

        // Smoothly fade in the new video on top
        inactiveVideoElement.classList.add('active');

        const oldActive = activeVideoElement;
        activeVideoElement = inactiveVideoElement;
        currentBgSource = newSource;

        // Safely turn off the old video behind the new one after transition finishes
        setTimeout(() => {
            if (activeVideoElement !== oldActive) {
                oldActive.classList.remove('active');
            }
        }, 1800);
    };

    // Ensure new video is actually rendering frames before fading to prevent black flicker
    let transitioned = false;
    inactiveVideoElement.onplaying = () => {
        if (!transitioned) {
            transitioned = true;
            doTransition();
        }
        inactiveVideoElement.onplaying = null;
        inactiveVideoElement.ontimeupdate = null;
    };
    
    inactiveVideoElement.ontimeupdate = () => {
        if (inactiveVideoElement.currentTime > 0 && !transitioned) {
            transitioned = true;
            doTransition();
            inactiveVideoElement.onplaying = null;
            inactiveVideoElement.ontimeupdate = null;
        }
    };

    inactiveVideoElement.play().catch(err => {
        console.log("Cinematic background play failed, forcing active source:", err);
        // Fallback
        activeVideoElement.src = newSource;
        activeVideoElement.load();
        activeVideoElement.play().catch(e => console.log(e));
        currentBgSource = newSource;
    });
}

// ========== SCROLL PROGRESS ==========
function handleScroll() {
    const scrollTop = mainContainer.scrollTop;
    const scrollHeight = mainContainer.scrollHeight - mainContainer.clientHeight;
    progressBar.style.width = (scrollTop / scrollHeight * 100) + '%';

    const sections = document.querySelectorAll('.section');
    let currentId = '';
    
    sections.forEach(s => {
        if (scrollTop >= s.offsetTop - s.clientHeight / 3) currentId = s.id;
    });
    
    if (currentId) {
        // Trigger cinematic background change for the current section
        const activeSection = document.getElementById(currentId);
        if (activeSection) {
            const newBg = activeSection.getAttribute('data-bg');
            if (newBg) {
                changeBackground(newBg);
            }
        }
    }
}

// ========== CINEMATIC SCROLL REVEAL ==========
function initCinematicObserver() {
    const els = document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                obs.unobserve(entry.target);
            }
        });
    }, { root: mainContainer, threshold: 0.12 });
    els.forEach(el => observer.observe(el));
}

// ========== CLIPBOARD ==========
function copyToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => {
        const el = document.createElement('textarea');
        el.value = text; document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
        showToast(msg);
    });
}

// ========== TOAST NOTICE ==========
function showToast(message) {
    const toast = document.getElementById('toastNotice');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ========== LIGHTBOX ==========
function openLightbox(src) {
    const lb = document.getElementById('lightboxModal');
    document.getElementById('lightboxImg').src = src;
    lb.classList.add('active');
}
function closeLightbox() {
    document.getElementById('lightboxModal').classList.remove('active');
}

// ========== RSVP / WISHES ==========
const DEFAULT_WISHES = [
    { name: "Ahmad & Keluarga", status: "Hadir", message: "Barakallahu lakuma wa baraka 'alaikuma. Selamat menempuh hidup baru Mirna & Andri! Semoga sakinah, mawaddah, warahmah." },
    { name: "Siti Rahma", status: "Hadir", message: "Selamat Mirna sayang! Semoga acaranya lancar, aamiin ya rabbal alamin." },
    { name: "Budi Santoso", status: "Tidak Hadir", message: "Mohon maaf tidak bisa hadir. Selamat menempuh bahtera rumah tangga baru!" }
];

function initWishesBoard() {
    let wishes = JSON.parse(localStorage.getItem('wedding_wishes_mirna_andri'));
    if (!wishes || !wishes.length) {
        wishes = DEFAULT_WISHES;
        localStorage.setItem('wedding_wishes_mirna_andri', JSON.stringify(wishes));
    }
    renderWishes(wishes);
}

function renderWishes(wishes) {
    const board = document.getElementById('wishesBoard');
    board.innerHTML = '';
    wishes.slice().reverse().forEach(w => {
        const item = document.createElement('div');
        item.className = 'wish-item';
        const bc = w.status === 'Hadir' ? 'hadir' : 'tidak-hadir';
        item.innerHTML = `<div class="wish-item-header"><span class="wish-sender">${escapeHtml(w.name)}</span><span class="wish-badge ${bc}">${w.status}</span></div><p class="wish-text">${escapeHtml(w.message)}</p>`;
        board.appendChild(item);
    });
}

function submitWish(event) {
    event.preventDefault();
    const n = document.getElementById('inputName');
    const s = document.getElementById('inputStatus');
    const m = document.getElementById('inputMessage');
    if (!n.value.trim() || !m.value.trim()) return;
    let wishes = JSON.parse(localStorage.getItem('wedding_wishes_mirna_andri')) || [];
    wishes.push({ name: n.value.trim(), status: s.value, message: m.value.trim() });
    localStorage.setItem('wedding_wishes_mirna_andri', JSON.stringify(wishes));
    renderWishes(wishes);
    n.value = ''; m.value = '';
    showToast('Ucapan Anda berhasil dikirim!');
}

function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ========== SHARE ==========
function shareVia(platform) {
    const text = encodeURIComponent('Undangan Pernikahan Digital Mirna & Andri: ' + window.location.href);
    if (platform === 'whatsapp') window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
    else if (platform === 'facebook') window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
    else showToast('Salin tautan untuk dibagikan di Bio Instagram!');
}

// ========== INIT ==========
window.addEventListener('DOMContentLoaded', () => {
    getGuestName();
    createParticles();
    animateCover();
    initCountdown();
    initWishesBoard();
    mainContainer.addEventListener('scroll', handleScroll);
});
