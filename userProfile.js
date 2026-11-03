// Unique User Profile & Emoji setup for ARWIN with Permanent Cross-Device ID
export const UserProfile = {
    getEmoji: function() {
        const emojis = ['🦁', '🐯', '🦊', '🐼', '🦄', '🚀', '⚡', '🔥', '💎', '👑'];
        let savedEmoji = localStorage.getItem('arwin_user_emoji');
        if (!savedEmoji) {
            savedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            localStorage.setItem('arwin_user_emoji', savedEmoji);
        }
        return savedEmoji;
    },

    getUserId: function() {
        let uid = localStorage.getItem('arwin_uid');
        
        // 1. Pehle check karo ki kya Telegram WebApp user data available hai
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (tgUser && tgUser.id) {
            uid = `TG_${tgUser.id}`;
        } else if (!uid) {
            // 2. Agar pehle se koi UID localStorage me nahi hai aur Telegram data bhi nahi mila,
            // toh random generate karne ki jagah ek fixed Master ID use karo taaki phone aur PC par same rahe!
            uid = 'ARWIN_PLAYER_PRO';
        }
        
        localStorage.setItem('arwin_uid', uid);
        return uid;
    },

    initProfile: function() {
        const profileData = {
            userId: this.getUserId(),
            emoji: this.getEmoji()
        };
        console.log(`ARWIN Profile Loaded: ID -> ${profileData.userId}, Emoji -> ${profileData.emoji}`);
        
        const userIdTextEl = document.getElementById('userIdText');
        const userEmojiEl = document.getElementById('userEmoji');
        
        if (userIdTextEl) {
            userIdTextEl.innerText = profileData.userId;
        }
        if (userEmojiEl) {
            userEmojiEl.innerText = profileData.emoji;
        }

        return profileData;
    }
};

window.UserProfile = UserProfile;