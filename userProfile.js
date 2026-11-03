// Unique User Profile & Emoji setup for ARWIN with Telegram Integration
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
        
        // Telegram WebApp ka user data check karo
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (tgUser && tgUser.id) {
            // Agar Telegram user ID milti hai, toh hamesha permanent Telegram ID hi use hogi (chahe phone ho ya laptop)
            uid = `TG_${tgUser.id}`;
        } else if (!uid) {
            // Agar Telegram data bilkul na mile (jaise normal PC browser me), tabhi random fallback banega
            uid = 'ARWIN_' + Math.floor(100000 + Math.random() * 900000);
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
        
        // DOM elements update karna taaki UI par real ID aur emoji dikhe
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

// Global scope me attach karna taaki doosri files easily access kar sakein
window.UserProfile = UserProfile;