// Safe initialization for Telegram WebApp
let tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg && tg.expand) {
    tg.expand();
}

let score = 0;
let energy = 1000;
const maxEnergy = 1000;

// 1. Sabse pehle DOM Elements ko define karein (Taaki undefined ki error na aaye)
const scoreDisplay = document.getElementById('score');
const energyText = document.getElementById('energyText');
const energyFill = document.getElementById('energyFill');
const coinWrapper = document.getElementById('coinWrapper');
const coin = document.getElementById('coin');

// --- LocalStorage Functions (Zero Cost Score Saving) ---
function loadScore(callback) {
    try {
        const value = localStorage.getItem('arwin_coins');
        if (value !== null) {
            callback(parseInt(value, 10));
        } else {
            callback(0);
        }
    } catch (err) {
        callback(0);
    }
}

function saveScore(coins) {
    try {
        localStorage.setItem('arwin_coins', coins.toString());
    } catch (err) {
        console.log('Failed to save score:', err);
    }
}

// Update Score and Energy Bar (Upar define karna zaroori hai taaki loadScore me call ho sake)
function updateUI() {
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (energyText) energyText.textContent = `${energy} / ${maxEnergy}`;
    if (energyFill) energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
}

// 2. Ab LocalStorage se saved score fetch karein
loadScore((savedScore) => {
    score = savedScore;
    updateUI();
});

// Handle Tapping (Multi-touch & Mouse support)
function handleTap(clientX, clientY) {
    if (energy <= 0) return;

    // Deduct Energy & Increase Score
    energy -= 1;
    score += 1;
    updateUI();
    saveScore(score); // Har tap par score save hota rahega

    // Haptic Feedback (Only runs inside Telegram)
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    // Floating +1 Animation
    createFloatingText(clientX, clientY);

    // 3D Tilt Effect on Tap Point
    if (coinWrapper && coin) {
        const rect = coinWrapper.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;

        const tiltX = (y / (rect.height / 2)) * -25;
        const tiltY = (x / (rect.width / 2)) * 25;

        coin.style.transform = `scale(0.93) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

        setTimeout(() => {
            coin.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
        }, 120);
    }

    // Mini Burst Effect
    triggerParticles(clientX, clientY);
}

// Touch Event (for Mobile Multi-touch)
if (coinWrapper) {
    coinWrapper.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            handleTap(touch.clientX, touch.clientY);
        }
    });

    // Click Event (for PC Browser Testing)
    coinWrapper.addEventListener('mousedown', (e) => {
        handleTap(e.clientX, e.clientY);
    });
}

// Floating Text Creation
function createFloatingText(x, y) {
    const el = document.createElement('div');
    el.className = 'floating-num';
    el.textContent = '+1';
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = '#facc15';
    el.style.fontWeight = 'bold';
    el.style.pointerEvents = 'none';

    document.body.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 700);
}

// Particle Burst Effect using Confetti SDK
function triggerParticles(x, y) {
    if (window.confetti) {
        confetti({
            particleCount: 5,
            spread: 40,
            startVelocity: 15,
            origin: {
                x: x / window.innerWidth,
                y: y / window.innerHeight
            },
            colors: ['#facc15', '#fbbf24', '#ffffff'],
            disableForReducedMotion: true
        });
    }
}

// Energy Regeneration Logic (Regenerates 2 energy per second)
setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + 2);
        updateUI();
    }
}, 1000);