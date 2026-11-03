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
        // Telegram WebApp se direct user object uthao
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        let uid = localStorage.getItem('arwin_uid');
        
        if (tgUser && tgUser.id) {
            // Agar Telegram ki real ID mil gayi, toh wahi permanent hogi chahe koi bhi device ho
            uid = `TG_${tgUser.id}`;
            localStorage.setItem('arwin_uid', uid);
        } else if (!uid) {
            // Fallback sirf tab jab browser me khola jaye
            uid = 'ARWIN_MASTER_DEV';
            localStorage.setItem('arwin_uid', uid);
        }
        return uid;
    },

    initProfile: function() {
        const profileData = {
            userId: this.getUserId(),
            emoji: this.getEmoji()
        };
        
        const userIdTextEl = document.getElementById('userIdText');
        const userEmojiEl = document.getElementById('userEmoji');
        
        if (userIdTextEl) userIdTextEl.innerText = profileData.userId;
        if (userEmojiEl) userEmojiEl.innerText = profileData.emoji;

        return profileData;
    }
};

window.UserProfile = UserProfile;