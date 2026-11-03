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
        // Sabse pehle check karo ki kya Telegram WebApp ka user object mojood hai
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        let uid;
        if (tgUser && tgUser.id) {
            // Telegram ki real ID ko hi hamesha base banayenge (Chahe phone ho ya laptop)
            uid = `TG_${tgUser.id}`;
            localStorage.setItem('arwin_uid', uid);
        } else {
            // Agar Telegram object nahi mila (jaise normal PC browser), tab localStorage check karo
            uid = localStorage.getItem('arwin_uid');
            if (!uid) {
                uid = 'ARWIN_PLAYER_PRO';
                localStorage.setItem('arwin_uid', uid);
            }
        }
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