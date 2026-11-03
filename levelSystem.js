// Level System, Multipliers & Ad-Watch Management for ARWIN
export const LevelSystem = {
    currentLevel: 1,
    adsWatchedForLevel: 0,

    init: function() {
        const savedLevel = localStorage.getItem('arwin_level');
        const savedAds = localStorage.getItem('arwin_ads_watched');
        if (savedLevel !== null) this.currentLevel = parseInt(savedLevel, 10);
        if (savedAds !== null) this.adsWatchedForLevel = parseInt(savedAds, 10);
    },

    save: function() {
        localStorage.setItem('arwin_level', this.currentLevel.toString());
        localStorage.setItem('arwin_ads_watched', this.adsWatchedForLevel.toString());
    },

    // Return coins per tap based on current level
    getTapPower: function() {
        if (this.currentLevel === 1) return 1;
        if (this.currentLevel === 2) return 7;
        if (this.currentLevel === 3) return 15;
        return 1;
    },

    // Check automatic upgrade when score reaches threshold (e.g. 1,00,000 for Level 1 completion)
    checkAutoUpgrade: function(score) {
        if (this.currentLevel === 1 && score >= 100000) {
            this.currentLevel = 2;
            this.adsWatchedForLevel = 0;
            this.save();
            alert('Badhai ho! Aapne Level 1 complete kar liya aur ab aap Level 2 par hain! (7 Coins per tap)');
            return true;
        } else if (this.currentLevel === 2 && score >= 500000) {
            this.currentLevel = 3;
            this.adsWatchedForLevel = 0;
            this.save();
            alert('Fantastic! Aap Level 3 par upgrade ho gaye hain! (15 Coins per tap)');
            return true;
        }
        return false;
    },

    // Watch 3 full-screen ads to complete level early
    watchAdToUpgrade: function(onUpgradeCallback) {
        if (this.currentLevel >= 3) {
            alert('Aap already max level (Level 3) par hain!');
            return;
        }

        alert('Ad playing... Kripya 5 seconds ad dekhein.');
        setTimeout(() => {
            this.adsWatchedForLevel += 1;
            alert(`Ad dekha gaya! (${this.adsWatchedForLevel}/3 ads completed for current level)`);

            if (this.adsWatchedForLevel >= 3) {
                this.currentLevel += 1;
                this.adsWatchedForLevel = 0;
                alert(`Badhai ho! 3 ads dekh kar aapne successfully upgrade kar liya hai to Level ${this.currentLevel}!`);
            }
            this.save();
            if (onUpgradeCallback) onUpgradeCallback();
        }, 2000);
    }
};

// Is line ko levelSystem.js ke bilkul aakhir me add kar dein:
window.LevelSystem = LevelSystem;