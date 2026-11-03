// Unique User Profile & Emoji setup for ARWIN
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
        if (!uid) {
            uid = 'ARWIN_' + Math.floor(100000 + Math.random() * 900000);
            localStorage.setItem('arwin_uid', uid);
        }
        return uid;
    },

    initProfile: function() {
        const profileData = {
            userId: this.getUserId(),
            emoji: this.getEmoji()
        };
        console.log(`ARWIN Profile Loaded: ID -> ${profileData.userId}, Emoji -> ${profileData.emoji}`);
        return profileData;
    }
};