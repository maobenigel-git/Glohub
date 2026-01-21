// Enhanced Avatar Customization with Bratz Doll System
// Integrates with Supabase database

const avatarConfig = {
    dollId: 1,
    vibeColor: '#ff69b4',
    brightness: 100
};

const vibes = [
    { name: 'Cute Pink', color: '#ff69b4', gradient: 'linear-gradient(135deg, #ff69b4, #ffb6d9)' },
    { name: 'Queen Gold', color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #fff4cc)' },
    { name: 'Purple Dream', color: '#da70d6', gradient: 'linear-gradient(135deg, #da70d6, #f0d6f0)' },
    { name: 'Sweet Peach', color: '#ffb3ba', gradient: 'linear-gradient(135deg, #ffb3ba, #ffe5e7)' },
    { name: 'Mint Fresh', color: '#98fb98', gradient: 'linear-gradient(135deg, #98fb98, #e0ffe0)' },
    { name: 'Sky Blue', color: '#87ceeb', gradient: 'linear-gradient(135deg, #87ceeb, #e0f6ff)' },
    { name: 'Sunset Orange', color: '#ff8c42', gradient: 'linear-gradient(135deg, #ff8c42, #ffd3b6)' },
    { name: 'Lavender Love', color: '#b19cd9', gradient: 'linear-gradient(135deg, #b19cd9, #e8dff5)' },
    { name: 'Hot Pink', color: '#ff1493', gradient: 'linear-gradient(135deg, #ff1493, #ff69b4)' },
    { name: 'Coral Crush', color: '#ff7f50', gradient: 'linear-gradient(135deg, #ff7f50, #ffa07a)' }
];

const cuteMessages = [
    "Yesss girl, looking cute! 💅",
    "Okay gorgeous, let's win this! ✨",
    "Absolutely stunning! 🌟",
    "You look amazing! 💖",
    "Serving looks! 👑",
    "Queen energy! 💃",
    "So pretty! 🦋",
    "Love this vibe! 💕",
    "Clock it, bestie! 💯",
    "Slay squad ready! 🔥",
    "Main character energy! ⭐",
    "Boss babe unlocked! 💪",
    "Bestie vibes only! 😌",
    "Hot girl energy! 💋",
    "Galentine's glam! 💄",
    "Hearts and heels! 👠"
];

const loadingPhrases = [
    "Clock it, bestie… the glow‑up is real! 💅",
    "Yurr girl is about to slay… ✨",
    "Main character energy loading… ⭐",
    "Hot girl brainwaves syncing… 🧠",
    "Besties before the resties, duh… 👯",
    "Pretty in pink, smarter than you think… 🌸",
    "Sip the tea, spill the answers… ☕",
    "Slay squad assembling… 👑",
    "Galentine's glam check… 💄",
    "Boss babe aura unlocked… 💪",
    "Cute but make it competitive… 🏆",
    "Hearts, heels, and high scores… 👠",
    "Lip gloss poppin', answers droppin'… 💋",
    "Glow‑up goals incoming… ✨",
    "Bestie vibes only, no stress… 😌",
    "Love letters & leaderboard flex… 💌",
    "Sparkle season, quiz reason… ⭐",
    "Slay or nay? You decide… 💁",
    "Pink skies, right answers… 🌅",
    "Galentine's gang, let's gooo… 🚀"
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const session = checkPlayerSession();
    if (!session) return;
    
    renderDollGrid();
    renderVibeGrid();
    updateAvatar();
    
    // Load saved avatar if exists
    const savedAvatar = sessionStorage.getItem('avatarConfig');
    if (savedAvatar) {
        const saved = JSON.parse(savedAvatar);
        avatarConfig.dollId = saved.dollId || 1;
        avatarConfig.vibeColor = saved.vibeColor || '#ff69b4';
        avatarConfig.brightness = saved.brightness || 100;
        updateAvatar();
    }
});

function renderDollGrid() {
    const grid = document.getElementById('dollGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const option = document.createElement('div');
        option.className = `doll-option ${i === avatarConfig.dollId ? 'active' : ''}`;
        option.innerHTML = createBratzDollSVG(i, false);
        option.onclick = () => selectDoll(i);
        grid.appendChild(option);
    }
}

function renderVibeGrid() {
    const grid = document.getElementById('vibeGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    vibes.forEach((vibe, index) => {
        const option = document.createElement('div');
        option.className = `vibe-option ${vibe.color === avatarConfig.vibeColor ? 'active' : ''}`;
        option.innerHTML = `
            <div class="vibe-preview" style="background: ${vibe.gradient}"></div>
            <div class="vibe-name">${vibe.name}</div>
        `;
        option.onclick = () => selectVibe(vibe.color, index);
        grid.appendChild(option);
    });
}

function selectDoll(dollId) {
    avatarConfig.dollId = dollId;
    
    // Update active states
    document.querySelectorAll('.doll-option').forEach((el, i) => {
        el.classList.toggle('active', i === dollId - 1);
    });
    
    updateAvatar();
    showRandomMessage();
}

function selectVibe(color, index) {
    avatarConfig.vibeColor = color;
    document.documentElement.style.setProperty('--avatar-vibe-color', color);
    
    // Update active states
    document.querySelectorAll('.vibe-option').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
    
    updateAvatar();
    showRandomMessage();
}

function updateBrightness(value) {
    avatarConfig.brightness = parseInt(value);
    document.documentElement.style.setProperty('--avatar-brightness', `${value}%`);
    updateAvatar();
}

function updateAvatar() {
    const display = document.getElementById('avatarDisplay');
    if (!display) return;
    
    display.innerHTML = createBratzDollSVG(avatarConfig.dollId, true);
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

function showRandomMessage() {
    const message = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
    const messageEl = document.getElementById('avatarMessage');
    
    if (!messageEl) return;
    
    messageEl.style.opacity = '0';
    setTimeout(() => {
        messageEl.textContent = message;
        messageEl.style.transition = 'opacity 0.3s';
        messageEl.style.opacity = '1';
    }, 150);
}

function playRandomAnimation() {
    const animations = ['starJump', 'spin', 'bounce', 'wave'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    const doll = document.querySelector('.bratz-doll');
    
    if (doll) {
        doll.style.animation = `${randomAnim} 1s ease`;
        setTimeout(() => {
            doll.style.animation = '';
        }, 1000);
    }
    
    showRandomMessage();
}

// Create Bratz Doll SVG with variations
function createBratzDollSVG(dollId, isMain) {
    const size = isMain ? 280 : 100;
    const color = avatarConfig.vibeColor;
    const brightness = `brightness(${avatarConfig.brightness}%)`;
    
    const skinTones = ['#ffd6cc', '#f4c2a5', '#d9a574', '#c68553', '#8d5524', '#5c3a21'];
    const hairColors = ['#2c1810', '#8b4513', '#d4a574', '#ff6b9d', '#6a4c93', '#000000'];
    
    const dollIndex = (dollId - 1) % 20;
    const skin = skinTones[dollIndex % skinTones.length];
    const hair = hairColors[dollIndex % hairColors.length];
    const hairStyle = dollIndex % 5;
    const outfitStyle = dollIndex % 4;
    
    let svg = `<svg class="bratz-doll" width="${size}" height="${size}" viewBox="0 0 200 280" style="filter: ${brightness}">`;
    
    // Shadow
    svg += `<ellipse cx="100" cy="260" rx="45" ry="12" fill="#00000010"/>`;
    
    // Outfit variations
    if (outfitStyle === 0) {
        // Dress
        svg += `<path d="M70 140 Q50 180 55 250 L85 250 L85 210 L90 250 L110 250 L110 210 L115 250 L145 250 Q150 180 130 140 Z" fill="${color}"/>`;
        svg += `<circle cx="85" cy="175" r="3" fill="#fff" opacity="0.5"/>`;
        svg += `<circle cx="115" cy="175" r="3" fill="#fff" opacity="0.5"/>`;
    } else if (outfitStyle === 1) {
        // Casual top and pants
        svg += `<rect x="75" y="140" width="50" height="45" rx="8" fill="${color}"/>`;
        svg += `<path d="M75 185 L75 250 L95 250 L95 185 Z" fill="#4a5568"/>`;
        svg += `<path d="M105 185 L105 250 L125 250 L125 185 Z" fill="#4a5568"/>`;
    } else if (outfitStyle === 2) {
        // Sporty
        svg += `<rect x="70" y="140" width="60" height="50" rx="10" fill="${color}"/>`;
        svg += `<path d="M70 190 L70 250 L130 250 L130 190 Z" fill="${color}" opacity="0.8"/>`;
        svg += `<line x1="100" y1="190" x2="100" y2="250" stroke="#fff" stroke-width="2"/>`;
    } else {
        // Party dress
        svg += `<path d="M75 140 Q60 160 55 185 Q50 220 55 250 L85 250 Q82 220 85 185 L90 250 L110 250 L115 185 Q118 220 115 250 L145 250 Q150 220 145 185 Q140 160 125 140 Z" fill="${color}"/>`;
        svg += `<path d="M75 140 Q100 150 125 140" stroke="#fff" stroke-width="2" fill="none" opacity="0.5"/>`;
    }
    
    // Arms
    svg += `<path d="M70 140 Q60 150 55 170" stroke="${skin}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    svg += `<path d="M130 140 Q140 150 145 170" stroke="${skin}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    
    // Neck
    svg += `<rect x="90" y="110" width="20" height="30" fill="${skin}"/>`;
    
    // Face
    svg += `<circle cx="100" cy="80" r="38" fill="${skin}"/>`;
    
    // Hair variations
    if (hairStyle === 0) {
        // Long wavy hair
        svg += `<path d="M62 50 Q55 35 65 22 Q100 8 135 22 Q145 35 138 50 Z" fill="${hair}"/>`;
        svg += `<path d="M62 50 Q45 75 48 105 Q50 120 60 125 Q100 135 140 125 Q150 120 152 105 Q155 75 138 50 Z" fill="${hair}"/>`;
        svg += `<path d="M60 80 Q55 95 60 110" stroke="${hair}" stroke-width="2" fill="none" opacity="0.5"/>`;
        svg += `<path d="M140 80 Q145 95 140 110" stroke="${hair}" stroke-width="2" fill="none" opacity="0.5"/>`;
    } else if (hairStyle === 1) {
        // Short bob
        svg += `<path d="M62 58 Q55 45 70 32 Q100 25 130 32 Q145 45 138 58 Q140 88 100 98 Q60 88 62 58 Z" fill="${hair}"/>`;
        svg += `<path d="M70 70 Q75 80 70 90" stroke="${hair}" stroke-width="1.5" fill="none" opacity="0.3"/>`;
        svg += `<path d="M130 70 Q125 80 130 90" stroke="${hair}" stroke-width="1.5" fill="none" opacity="0.3"/>`;
    } else if (hairStyle === 2) {
        // Ponytail
        svg += `<ellipse cx="145" cy="55" rx="28" ry="55" fill="${hair}"/>`;
        svg += `<circle cx="145" cy="35" r="18" fill="${hair}"/>`;
        svg += `<path d="M65 52 Q100 38 135 52 L135 75 Q100 88 65 75 Z" fill="${hair}"/>`;
        svg += `<circle cx="135" cy="52" r="8" fill="${color}" opacity="0.8"/>`;
    } else if (hairStyle === 3) {
        // Curly
        svg += `<circle cx="68" cy="58" r="22" fill="${hair}"/>`;
        svg += `<circle cx="78" cy="42" r="20" fill="${hair}"/>`;
        svg += `<circle cx="100" cy="35" r="24" fill="${hair}"/>`;
        svg += `<circle cx="122" cy="42" r="20" fill="${hair}"/>`;
        svg += `<circle cx="132" cy="58" r="22" fill="${hair}"/>`;
        svg += `<circle cx="85" cy="55" r="18" fill="${hair}"/>`;
        svg += `<circle cx="115" cy="55" r="18" fill="${hair}"/>`;
    } else {
        // Bun
        svg += `<circle cx="100" cy="35" r="28" fill="${hair}"/>`;
        svg += `<ellipse cx="100" cy="35" rx="32" ry="25" fill="${hair}" opacity="0.7"/>`;
        svg += `<path d="M65 52 Q100 42 135 52" fill="${hair}"/>`;
        svg += `<circle cx="100" cy="35" r="6" fill="${color}" opacity="0.6"/>`;
    }
    
    // Face features
    // Eyes
    svg += `<ellipse cx="82" cy="78" rx="6" ry="8" fill="#fff"/>`;
    svg += `<ellipse cx="118" cy="78" rx="6" ry="8" fill="#fff"/>`;
    svg += `<circle cx="82" cy="80" r="5" fill="#000"/>`;
    svg += `<circle cx="118" cy="80" r="5" fill="#000"/>`;
    svg += `<circle cx="80" cy="77" r="2" fill="#fff"/>`;
    svg += `<circle cx="116" cy="77" r="2" fill="#fff"/>`;
    
    // Eyebrows
    svg += `<path d="M70 65 Q80 62 90 65" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    svg += `<path d="M110 65 Q120 62 130 65" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    
    // Eyelashes
    svg += `<path d="M76 75 Q74 72 76 70" stroke="#000" stroke-width="1" fill="none"/>`;
    svg += `<path d="M88 75 Q90 72 88 70" stroke="#000" stroke-width="1" fill="none"/>`;
    svg += `<path d="M112 75 Q110 72 112 70" stroke="#000" stroke-width="1" fill="none"/>`;
    svg += `<path d="M124 75 Q126 72 124 70" stroke="#000" stroke-width="1" fill="none"/>`;
    
    // Blush
    svg += `<ellipse cx="70" cy="88" rx="8" ry="5" fill="#ff69b4" opacity="0.3"/>`;
    svg += `<ellipse cx="130" cy="88" rx="8" ry="5" fill="#ff69b4" opacity="0.3"/>`;
    
    // Nose
    svg += `<path d="M98 85 Q100 90 102 85" stroke="#000" stroke-width="1" fill="none" opacity="0.3"/>`;
    
    // Lips
    svg += `<path d="M85 98 Q100 105 115 98" stroke="#ff69b4" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    svg += `<path d="M85 98 Q100 102 115 98" fill="#ff1493" opacity="0.3"/>`;
    
    // Accessories based on doll ID
    if (dollIndex % 7 === 0) {
        // Crown
        svg += `<path d="M80 40 L85 30 L90 40 L95 28 L100 40 L105 28 L110 40 L115 30 L120 40 L100 45 Z" fill="#ffd700"/>`;
        svg += `<circle cx="100" cy="32" r="3" fill="#ff1493"/>`;
    } else if (dollIndex % 7 === 1) {
        // Bow
        svg += `<path d="M95 38 Q90 35 90 40 Q90 45 95 42 Z" fill="${color}"/>`;
        svg += `<path d="M105 38 Q110 35 110 40 Q110 45 105 42 Z" fill="${color}"/>`;
        svg += `<circle cx="100" cy="40" r="3" fill="${color}"/>`;
    } else if (dollIndex % 7 === 2) {
        // Headband
        svg += `<ellipse cx="100" cy="50" rx="42" ry="8" fill="${color}" opacity="0.8"/>`;
        svg += `<circle cx="100" cy="50" r="4" fill="#fff" opacity="0.8"/>`;
    } else if (dollIndex % 7 === 3) {
        // Glasses
        svg += `<circle cx="82" cy="78" r="10" stroke="#000" stroke-width="2" fill="none" opacity="0.6"/>`;
        svg += `<circle cx="118" cy="78" r="10" stroke="#000" stroke-width="2" fill="none" opacity="0.6"/>`;
        svg += `<line x1="92" y1="78" x2="108" y2="78" stroke="#000" stroke-width="2" opacity="0.6"/>`;
    } else if (dollIndex % 7 === 4) {
        // Earrings
        svg += `<circle cx="62" cy="95" r="4" fill="#ffd700"/>`;
        svg += `<circle cx="138" cy="95" r="4" fill="#ffd700"/>`;
    } else if (dollIndex % 7 === 5) {
        // Necklace
        svg += `<path d="M85 110 Q100 115 115 110" stroke="#ffd700" stroke-width="2" fill="none"/>`;
        svg += `<circle cx="100" cy="115" r="3" fill="#ff1493"/>`;
    }
    
    svg += `</svg>`;
    
    return svg;
}

async function saveAvatarAndProceed() {
    const session = checkPlayerSession();
    if (!session) return;
    
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Save to session storage first
        sessionStorage.setItem('avatarConfig', JSON.stringify(avatarConfig));
        
        // Create or update user in database
        const { data: user, error } = await supabase
            .from('users')
            .upsert([
                {
                    username: session.username,
                    avatar_config: avatarConfig,
                    role: 'player',
                    session_id: session.sessionId
                }
            ], {
                onConflict: 'id',
                ignoreDuplicates: false
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error saving avatar:', error);
            hideLoadingScreen();
            showNotification('Failed to save avatar. Please try again.', 'error');
            return;
        }
        
        // Store user ID
        sessionStorage.setItem('userId', user.id);
        
        // Redirect to game after animation
        setTimeout(() => {
            window.location.href = 'quiz-game.html';
        }, 3000);
        
    } catch (error) {
        console.error('Error saving avatar:', error);
        hideLoadingScreen();
        showNotification('Failed to save avatar. Please try again.', 'error');
    }
}

function showLoadingScreen() {
    const phrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
    
    const loadingHTML = `
        <div id="loadingScreen" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #ff69b4, #ffb6d9, #fff5f8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        ">
            <div style="text-align: center; max-width: 90%; padding: 20px;">
                <div id="loadingAvatar" style="font-size: clamp(100px, 15vw, 160px); margin-bottom: 30px; animation: bounce 1s infinite;">
                    ${createBratzDollSVG(avatarConfig.dollId, true)}
                </div>
                <h2 style="
                    color: white;
                    font-size: clamp(20px, 4vw, 32px);
                    margin: 20px 0;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    animation: fadeIn 1s ease;
                    font-weight: 700;
                    line-height: 1.4;
                ">
                    ${phrase}
                </h2>
                <div style="display: flex; justify-content: center; gap: 12px; margin-top: 30px;">
                    <div style="width: 16px; height: 16px; background: white; border-radius: 50%; animation: bounce 0.6s infinite; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>
                    <div style="width: 16px; height: 16px; background: white; border-radius: 50%; animation: bounce 0.6s infinite 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>
                    <div style="width: 16px; height: 16px; background: white; border-radius: 50%; animation: bounce 0.6s infinite 0.4s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hideLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    if (screen) {
        screen.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => screen.remove(), 300);
    }
}