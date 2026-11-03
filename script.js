// 1. Firebase Config Setup
const firebaseConfig = {
    apiKey: "AIzaSyABQ5xvxqFkDIfaaNsC6XYSrBKK_s1NDhk",
    authDomain: "arwintapgame.firebaseapp.com",
    projectId: "arwintapgame",
    storageBucket: "arwintapgame.firebasestorage.app",
    messagingSenderId: "370905895031",
    appId: "1:370905895031:web:ec60e3f6c1fc089a2cf672"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 2. Persistent Unique User ID Fetch
function getTelegramUserId() {
    let userId = null;
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
            userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        }
    } catch (e) {}

    if (!userId) {
        userId = localStorage.getItem('arwin_game_uid');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('arwin_game_uid', userId);
        }
    }
    return userId;
}

const CURRENT_USER_ID = getTelegramUserId();
const userDocRef = db.collection('users').doc(CURRENT_USER_ID);

import { UserProfile } from './userProfile.js';
import { LevelSystem } from './levelSystem.js';

const myProfile = UserProfile.initProfile();
LevelSystem.init();

const USER_COIN_KEY = `arwin_coins_${myProfile.userId}`;
const USER_ENERGY_KEY = `arwin_energy_${myProfile.userId}`;

// UI Elements
const userEmojiEl = document.getElementById('userEmoji');
const userIdTextEl = document.getElementById('userIdText');
const currentLevelNumEl = document.getElementById('currentLevelNum');

if (userEmojiEl) userEmojiEl.textContent = myProfile.emoji;
if (userIdTextEl) userIdTextEl.textContent = CURRENT_USER_ID;
if (currentLevelNumEl) currentLevelNumEl.textContent = LevelSystem.currentLevel;

let tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg && tg.expand) {
    tg.expand();
}

let score = 0;
let energy = 1000;
const maxEnergy = 1000;

const scoreDisplay = document.getElementById('score');
const energyText = document.getElementById('energyText');
const energyFill = document.getElementById('energyFill');
const coinWrapper = document.getElementById('coinWrapper');
const coin = document.getElementById('coin');

function updateUI() {
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (energyText) energyText.textContent = `${energy} / ${maxEnergy}`;
    if (energyFill) energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
}

// 3. Initial Load: LocalStorage + One-time Cloud Fetch (Strictly UserId & Coins)
function initUserProgress() {
    const savedScore = localStorage.getItem(USER_COIN_KEY);
    if (savedScore !== null) {
        score = parseInt(savedScore, 10);
    }
    
    const savedEnergy = localStorage.getItem(USER_ENERGY_KEY);
    if (savedEnergy !== null) {
        energy = parseInt(savedEnergy, 10);
    }
    updateUI();

    userDocRef.get().then((doc) => {
        if (doc.exists) {
            const cloudData = doc.data();
            if (cloudData.coins && cloudData.coins > score) {
                score = cloudData.coins;
                localStorage.setItem(USER_COIN_KEY, score.toString());
                updateUI();
            }
        } else {
            // First time user: Save ONLY userId and coins
            userDocRef.set({
                userId: CURRENT_USER_ID,
                coins: score,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }).catch((err) => console.log("Cloud Fetch Error:", err));
}

initUserProgress();

// 4. Lightweight Cloud Save (ONLY userId and coins)
function saveCoinsToCloud() {
    userDocRef.set({
        userId: CURRENT_USER_ID,
        coins: score,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .catch((err) => console.error("Cloud Save Failed:", err));
}

// 5. 12 Hours Interval Sync (12 * 60 * 60 * 1000 ms)
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
setInterval(() => {
    saveCoinsToCloud();
}, TWELVE_HOURS_MS);

// App minimize / visibility hidden hone par cloud sync
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        saveCoinsToCloud();
    }
});

// Handle Tapping (Fast Local Storage, NO Firebase Hits)
function handleTap(clientX, clientY) {
    const tapPower = LevelSystem.getTapPower(); 
    if (energy < tapPower) return;

    energy -= tapPower;
    score += tapPower;

    LevelSystem.checkAutoUpgrade(score);
    updateUI();

    // Save locally only
    localStorage.setItem(USER_COIN_KEY, score.toString());
    localStorage.setItem(USER_ENERGY_KEY, energy.toString());

    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    createFloatingText(clientX, clientY, `+${tapPower}`);

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

    triggerParticles(clientX, clientY);
}

if (coinWrapper) {
    coinWrapper.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            handleTap(touch.clientX, touch.clientY);
        }
    });

    coinWrapper.addEventListener('mousedown', (e) => {
        handleTap(e.clientX, e.clientY);
    });
}

function createFloatingText(x, y, text = '+1') {
    const el = document.createElement('div');
    el.className = 'floating-num';
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = '#facc15';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '20px';
    el.style.pointerEvents = 'none';

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
}

function triggerParticles(x, y) {
    if (window.confetti) {
        confetti({
            particleCount: 5,
            spread: 40,
            startVelocity: 15,
            origin: { x: x / window.innerWidth, y: y / window.innerHeight },
            colors: ['#facc15', '#fbbf24', '#ffffff'],
            disableForReducedMotion: true
        });
    }
}

// Energy Regeneration Logic (Local Only, NO Cloud Hits)
setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + 2);
        updateUI();
        localStorage.setItem(USER_ENERGY_KEY, energy.toString());
    }
}, 1000);

// Level Badge Click Event Listener for Ad Upgrade
const levelBadgeBtn = document.getElementById('levelBadge');
if (levelBadgeBtn) {
    levelBadgeBtn.addEventListener('click', () => {
        LevelSystem.watchAdToUpgrade(() => {
            console.log("Level upgraded successfully!");
            saveCoinsToCloud(); // Upgrade par sync hoga
        });
    });
}