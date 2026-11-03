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

// 4. Cloud Database Real-time Sync (Listening to changes)
function initRealtimeSync(onStateUpdate) {
    userDocRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            console.log("Cloud sync updated:", data);
            
            // Local game state update karein
            if (typeof onStateUpdate === 'function') {
                onStateUpdate(data);
            }
        } else {
            // First-time user defaults setup
            const initialData = {
                coins: 0,
                energy: 1000,
                maxEnergy: 1000,
                level: 1,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };
            userDocRef.set(initialData);
        }
    }, (error) => {
        console.error("Firestore Listen Error:", error);
    });
}

// 5. Save Data to Cloud (Direct Call)
function saveProgressToCloud(gameState) {
    userDocRef.set({
        coins: gameState.coins,
        energy: gameState.energy,
        maxEnergy: gameState.maxEnergy || 1000,
        level: gameState.level || 1,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .catch((err) => console.error("Cloud Save Failed:", err));
}

import { UserProfile } from './userProfile.js';
import { LevelSystem } from './levelSystem.js';

// Profile initialize karein aur console me check karne ke liye
const myProfile = UserProfile.initProfile();
LevelSystem.init();

// Unique keys based on User ID for complete isolation
const USER_COIN_KEY = `arwin_coins_${myProfile.userId}`;
const USER_ENERGY_KEY = `arwin_energy_${myProfile.userId}`;

// Profile aur Level UI Elements ko update karne ke liye
const userEmojiEl = document.getElementById('userEmoji');
const userIdTextEl = document.getElementById('userIdText');
const currentLevelNumEl = document.getElementById('currentLevelNum');

if (userEmojiEl) userEmojiEl.textContent = myProfile.emoji;
if (userIdTextEl) userIdTextEl.textContent = CURRENT_USER_ID; // Telegram ID display
if (currentLevelNumEl) currentLevelNumEl.textContent = LevelSystem.currentLevel;

// Safe initialization for Telegram WebApp
let tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg && tg.expand) {
    tg.expand();
}

let score = 0;
let energy = 1000;
const maxEnergy = 1000;

// 1. Sabse pehle DOM Elements ko define karein
const scoreDisplay = document.getElementById('score');
const energyText = document.getElementById('energyText');
const energyFill = document.getElementById('energyFill');
const coinWrapper = document.getElementById('coinWrapper');
const coin = document.getElementById('coin');

// Update Score and Energy Bar
function updateUI() {
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (energyText) energyText.textContent = `${energy} / ${maxEnergy}`;
    if (energyFill) energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
}

// 2. Real-time Firebase Sync Initialize Karein (Cloud se data aate hi UI update hoga)
initRealtimeSync((cloudData) => {
    score = cloudData.coins || 0;
    energy = cloudData.energy || 1000;
    if (cloudData.level && LevelSystem) {
        LevelSystem.currentLevel = cloudData.level;
    }
    updateUI();
});

// Handle Tapping (Multi-touch & Mouse support)
function handleTap(clientX, clientY) {
    const tapPower = LevelSystem.getTapPower(); 
    if (energy < tapPower) return;

    // Deduct Energy & Increase Score
    energy -= tapPower;
    score += tapPower;

    // Score update ke sath hi automatic level check bhi ho jayega
    LevelSystem.checkAutoUpgrade(score);
    updateUI();

    // Local & Cloud Save
    saveScore(score); 
    saveEnergy();     
    saveProgressToCloud({
        coins: score,
        energy: energy,
        maxEnergy: maxEnergy,
        level: LevelSystem.currentLevel
    });

    // Haptic Feedback (Only runs inside Telegram)
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    // Floating Animation
    createFloatingText(clientX, clientY, `+${tapPower}`);

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

function loadScore(callback) {
    try {
        const value = localStorage.getItem(USER_COIN_KEY);
        callback(value !== null ? parseInt(value, 10) : 0);
    } catch (err) {
        callback(0);
    }
}

function saveScore(coins) {
    try {
        localStorage.setItem(USER_COIN_KEY, coins.toString());
    } catch (err) {}
}

function loadEnergy() {
    try {
        const savedEnergy = localStorage.getItem(USER_ENERGY_KEY);
        if (savedEnergy !== null) energy = parseInt(savedEnergy, 10);
    } catch (err) {}
}

function saveEnergy() {
    try {
        localStorage.setItem(USER_ENERGY_KEY, energy.toString());
    } catch (err) {}
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
        saveEnergy();
        saveProgressToCloud({
            coins: score,
            energy: energy,
            maxEnergy: maxEnergy,
            level: LevelSystem.currentLevel
        });
    }
}, 1000);

// Level Badge Click Event Listener for Ad Upgrade
const levelBadgeBtn = document.getElementById('levelBadge');
if (levelBadgeBtn) {
    levelBadgeBtn.addEventListener('click', () => {
        LevelSystem.watchAdToUpgrade(() => {
            console.log("Level upgraded successfully!");
            saveProgressToCloud({
                coins: score,
                energy: energy,
                maxEnergy: maxEnergy,
                level: LevelSystem.currentLevel
            });
        });
    });
}