// Admin Dashboard Logic with Super Admin Support

let currentClientId = null;
let currentTheme = {};

// ==========================================
// SUPER ADMIN FUNCTIONS
// ==========================================
function isSuperAdmin() {
    return sessionStorage.getItem('isSuperAdmin') === 'true';
}

function getSuperAdminInfo() {
    return {
        isSuperAdmin: isSuperAdmin(),
        superAdminCode: sessionStorage.getItem('superAdminCode'),
        superAdminId: sessionStorage.getItem('superAdminId'),
        superAdminName: sessionStorage.getItem('superAdminName') || 'Super Admin'
    };
}

// ==========================================
// AUTHENTICATION CHECK (Enhanced for Super Admin)
// ==========================================
function checkAuth() {
    // Check if super admin
    if (isSuperAdmin()) {
        const superAdminCode = sessionStorage.getItem('superAdminCode');
        const superAdminId = sessionStorage.getItem('superAdminId');
        
        if (!superAdminCode || !superAdminId) {
            window.location.href = 'admin-login.html';
            return null;
        }
        
        console.log('✅ Super Admin authenticated:', getSuperAdminInfo());
        
        return {
            adminCode: superAdminCode,
            clientId: 'super-admin-global',
            isSuperAdmin: true,
            superAdminId: superAdminId
        };
    }
    
    // Check for regular admin code in sessionStorage
    const adminCode = sessionStorage.getItem('adminCode');
    const clientId = sessionStorage.getItem('clientId');
    
    if (!adminCode || !clientId) {
        // No session found, redirect to login
        window.location.href = 'admin-login.html';
        return null;
    }
    
    return {
        adminCode: adminCode,
        clientId: clientId,
        isSuperAdmin: false
    };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#4caf50' : type === 'super' ? 'linear-gradient(135deg, gold, #ffd700)' : '#f44336';
    const textColor = type === 'super' ? '#000' : 'white';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${bgColor};
        color: ${textColor};
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: ${type === 'super' ? '700' : '500'};
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add these CSS animations to your styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    /* Super Admin Badge */
    .super-admin-badge {
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, gold, #ffd700);
        color: #000;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 5px 20px rgba(255, 215, 0, 0.5);
        z-index: 9999;
        animation: superAdminPulse 2s ease-in-out infinite;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    @keyframes superAdminPulse {
        0%, 100% {
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.5);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.8);
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// MAIN INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const auth = checkAuth();
    if (!auth) return;
    
    currentClientId = auth.clientId;
    
    // Show super admin badge if applicable
    if (isSuperAdmin()) {
        showSuperAdminBadge();
    }
    
    // Setup navigation
    setupNavigation();
    
    // Load dashboard data
    await loadDashboardData();

    // Initialize session cards navigation
    initializeSessionCards();
    
    // Setup forms
    setupThemeForm();
    setupQuestionForm();
    setupAdminJoinGame();
});

function showSuperAdminBadge() {
    const badge = document.createElement('div');
    badge.className = 'super-admin-badge';
    badge.innerHTML = '👑 SUPER ADMIN MODE';
    document.body.appendChild(badge);
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Load specific tab data
    loadTabData(tabName);
}

async function loadDashboardData() {
    try {
        if (!isSuperAdmin()) {
            // Load client info for regular admins
            const { data: client } = await supabase
                .from('clients')
                .select('*')
                .eq('id', currentClientId)
                .single();
            
            if (client && client.theme_config) {
                currentTheme = client.theme_config;
            }
        }
        
        // Load stats
        await loadStats();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadStats() {
    try {
        if (isSuperAdmin()) {
            // SUPER ADMIN: See ALL stats across all clients
            
            // Total sessions
            const { count: sessionsCount } = await supabase
                .from('game_sessions')
                .select('*', { count: 'exact', head: true });
            
            document.getElementById('totalSessions').textContent = sessionsCount || 0;
            
            // Total players
            const { count: playersCount } = await supabase
                .from('players')
                .select('*', { count: 'exact', head: true });
            
            document.getElementById('totalPlayers').textContent = playersCount || 0;
            
            // Total questions
            const { count: questionsCount } = await supabase
                .from('quiz_questions')
                .select('*', { count: 'exact', head: true });
            
            document.getElementById('totalQuestions').textContent = questionsCount || 0;
            
            // Active sessions
            const { count: activeCount } = await supabase
                .from('game_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            
            document.getElementById('activeSessions').textContent = activeCount || 0;
            
            console.log('✅ Super Admin Stats Loaded');
            return;
        }
        
        // REGULAR ADMIN: See only their stats
        const { count: sessionsCount } = await supabase
            .from('game_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', currentClientId);
        
        document.getElementById('totalSessions').textContent = sessionsCount || 0;
        
        const { data: sessions } = await supabase
            .from('game_sessions')
            .select('id')
            .eq('client_id', currentClientId);
        
        if (sessions && sessions.length > 0) {
            const sessionIds = sessions.map(s => s.id);
            const { count: playersCount } = await supabase
                .from('players')
                .select('*', { count: 'exact', head: true })
                .in('session_id', sessionIds);
            
            document.getElementById('totalPlayers').textContent = playersCount || 0;
        } else {
            document.getElementById('totalPlayers').textContent = 0;
        }
        
        const { count: questionsCount } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', currentClientId);
        
        document.getElementById('totalQuestions').textContent = questionsCount || 0;
        
        const { count: activeCount } = await supabase
            .from('game_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', currentClientId)
            .eq('is_active', true);
        
        document.getElementById('activeSessions').textContent = activeCount || 0;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadTabData(tabName) {
    switch(tabName) {
        case 'theme':
            loadThemeSettings();
            break;
        case 'questions':
            await loadQuestions();
            break;
        case 'sessions':
            await loadSessions();
            break;
        case 'players':
            await loadPlayers();
            break;
    }
}

function setupThemeForm() {
    const form = document.getElementById('themeForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSuperAdmin()) {
            showNotification('Super Admins cannot modify client themes', 'error');
            return;
        }
        
        const primaryColor = document.getElementById('primaryColor').value;
        const secondaryColor = document.getElementById('secondaryColor').value;
        const accentColor = document.getElementById('accentColor').value;
        
        try {
            await supabase
                .from('clients')
                .update({ 
                    theme_primary_color: primaryColor,
                    theme_secondary_color: secondaryColor,
                    theme_accent_color: accentColor
                })
                .eq('id', currentClientId);
            
            currentTheme = { primaryColor, secondaryColor, accentColor };
            showNotification('Theme updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error updating theme:', error);
            showNotification('Failed to update theme', 'error');
        }
    });
}

function loadThemeSettings() {
    if (isSuperAdmin()) {
        document.getElementById('primaryColor').value = '#ff69b4';
        document.getElementById('secondaryColor').value = '#ffb6d9';
        document.getElementById('accentColor').value = '#ff1493';
        return;
    }
    
    supabase
        .from('clients')
        .select('theme_primary_color, theme_secondary_color, theme_accent_color')
        .eq('id', currentClientId)
        .single()
        .then(({ data }) => {
            if (data) {
                document.getElementById('primaryColor').value = data.theme_primary_color || '#ff69b4';
                document.getElementById('secondaryColor').value = data.theme_secondary_color || '#ffb6d9';
                document.getElementById('accentColor').value = data.theme_accent_color || '#ff1493';
            }
        });
}

function showAddQuestion() {
    document.getElementById('addQuestionForm').style.display = 'block';
}

function hideAddQuestion() {
    document.getElementById('addQuestionForm').style.display = 'none';
    document.getElementById('questionForm').reset();
}

function setupQuestionForm() {
    const form = document.getElementById('questionForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Super admin needs to specify a client
        let questionClientId = currentClientId;
        
        if (isSuperAdmin()) {
            // For now, create under a super admin client
            const { data: superClient } = await supabase
                .from('clients')
                .select('id')
                .eq('email', 'superadmin@glohub.com')
                .single();
            
            if (superClient) {
                questionClientId = superClient.id;
            } else {
                showNotification('Cannot add questions as super admin without a client', 'error');
                return;
            }
        }
        
        const question = {
            client_id: questionClientId,
            question_text: document.getElementById('questionText').value,
            option_1: document.getElementById('option1').value,
            option_2: document.getElementById('option2').value,
            option_3: document.getElementById('option3').value,
            option_4: document.getElementById('option4').value,
            correct_answer: parseInt(document.getElementById('correctAnswer').value)
        };
        
        try {
            await supabase
                .from('quiz_questions')
                .insert([question]);
            
            showNotification('Question added successfully!', 'success');
            hideAddQuestion();
            await loadQuestions();
            await loadStats();
            
        } catch (error) {
            console.error('Error adding question:', error);
            showNotification('Failed to add question', 'error');
        }
    });
}

async function loadQuestions() {
    try {
        let query = supabase
            .from('quiz_questions')
            .select('*')
            .order('created_at', { ascending: false });
        
        // Super admin sees all questions, regular admin sees only their own
        if (!isSuperAdmin()) {
            query = query.eq('client_id', currentClientId);
        }
        
        const { data: questions } = await query;
        
        const list = document.getElementById('questionsList');
        if (!questions || questions.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666;">No questions yet. Add your first question!</p>';
            return;
        }
        
        list.innerHTML = questions.map((q, index) => {
            const options = [q.option_1, q.option_2, q.option_3, q.option_4];
            return `
                <div class="question-item">
                    <div>
                        <strong>Q${index + 1}:</strong> ${q.question_text}
                        ${isSuperAdmin() ? `<br><small style="color: #999; font-size: 12px;">Client ID: ${q.client_id}</small>` : ''}
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">
                            Correct: ${options[q.correct_answer - 1]}
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="deleteQuestion('${q.id}')">Delete</button>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
        await supabase
            .from('quiz_questions')
            .delete()
            .eq('id', questionId);
        
        showNotification('Question deleted', 'success');
        await loadQuestions();
        await loadStats();
        
    } catch (error) {
        console.error('Error deleting question:', error);
        showNotification('Failed to delete question', 'error');
    }
}

async function createNewSession() {
    try {
        // Generate unique join code
        let joinCode;
        let codeExists = true;
        
        while (codeExists) {
            joinCode = generateRandomCode(6);
            const { data } = await supabase
                .from('game_sessions')
                .select('session_code')
                .eq('session_code', joinCode);
            codeExists = data && data.length > 0;
        }
        
        // For super admin, create or use a super admin client
        let sessionClientId = currentClientId;
        
        if (isSuperAdmin()) {
            const { data: superClient } = await supabase
                .from('clients')
                .select('id')
                .eq('email', 'superadmin@glohub.com')
                .single();
            
            if (!superClient) {
                const { data: newClient } = await supabase
                    .from('clients')
                    .insert([{
                        email: 'superadmin@glohub.com',
                        admin_code: 'SUPER-ADMIN-CLIENT',
                        is_active: true
                    }])
                    .select()
                    .single();
                
                sessionClientId = newClient.id;
            } else {
                sessionClientId = superClient.id;
            }
        }
        
        // Create session
        const { data: session, error } = await supabase
            .from('game_sessions')
            .insert([
                {
                    client_id: sessionClientId,
                    session_code: joinCode,
                    is_active: true
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        showNotification(`Session created! Join code: ${joinCode}`, isSuperAdmin() ? 'super' : 'success');
        await loadSessions();
        await loadStats();
        
    } catch (error) {
        console.error('Error creating session:', error);
        showNotification('Failed to create session', 'error');
    }
}

// Initialize session cards with navigation
function initializeSessionCards() {
    const container = document.getElementById('sessionsCardsContainer');
    const prevBtn = document.getElementById('prevCard');
    const nextBtn = document.getElementById('nextCard');
    
    if (!container || !prevBtn || !nextBtn) return;
    
    // Navigation handlers
    prevBtn.addEventListener('click', () => {
        const scrollAmount = container.offsetWidth * 0.8;
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        const scrollAmount = container.offsetWidth * 0.8;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Update button states
    function updateNavButtons() {
        const isAtStart = container.scrollLeft <= 10;
        const isAtEnd = container.scrollLeft >= container.scrollWidth - container.offsetWidth - 10;
        
        prevBtn.disabled = isAtStart;
        nextBtn.disabled = isAtEnd;
    }
    
    container.addEventListener('scroll', updateNavButtons);
    updateNavButtons();
    
    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            nextBtn.click();
        }
        if (touchEndX - touchStartX > 50) {
            prevBtn.click();
        }
    }
}

async function loadSessions() {
    try {
        let query = supabase
            .from('game_sessions')
            .select('*')
            .order('created_at', { ascending: false });
        
        // Super admin sees all sessions, regular admin sees only their own
        if (!isSuperAdmin()) {
            query = query.eq('client_id', currentClientId);
        }
        
        const { data: sessions } = await query;
        
        // Populate cards container
        const cardsContainer = document.getElementById('sessionsCardsContainer');
        if (cardsContainer) {
            if (!sessions || sessions.length === 0) {
                cardsContainer.innerHTML = `
                    <div class="session-card" style="flex: 0 0 100%; min-height: 400px; display: flex; align-items: center; justify-content: center;">
                        <p style="text-align: center; color: #666;">No events yet. Create your first one!</p>
                    </div>
                `;
            } else {
                const recentSessions = sessions.slice(0, 6);
                cardsContainer.innerHTML = recentSessions.map((s, index) => `
                    <div class="session-card" style="position: relative;">
                        ${isSuperAdmin() ? '<span class="session-card-badge" style="background: gold; color: #000; top: 15px; left: 15px;">👑 Super View</span>' : ''}
                        <span class="session-card-badge" style="${isSuperAdmin() ? 'top: 50px;' : ''}">${s.is_active ? 'Active' : 'Ended'}</span>
                        <img src="https://images.unsplash.com/photo-${1517457373958 + index * 1000}-3f3c69d1d4a4?w=400&h=600&fit=crop" 
                             alt="Event ${index + 1}" 
                             class="session-card-image"
                             onerror="this.src='https://via.placeholder.com/400x600/ffb6d9/ffffff?text=Event+${index + 1}'">
                        <div class="session-card-content">
                            <div class="session-card-title">Event ${s.session_code}</div>
                            <div class="session-card-meta">
                                <span>${formatDate(s.created_at)}</span>
                                <span>${formatTime(s.created_at)}</span>
                                ${isSuperAdmin() ? `<br><small style="font-size: 10px; opacity: 0.7;">Client: ${s.client_id.substring(0, 8)}...</small>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            setTimeout(initializeSessionCards, 100);
        }
        
        // Populate sessions list
        const list = document.getElementById('sessionsList');
        if (list) {
            if (!sessions || sessions.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No sessions yet.</p>';
                return;
            }
            
            list.innerHTML = '<h3 style="margin: 40px 0 20px; color: var(--primary);">All Sessions</h3>' +
                sessions.map(s => `
                <div class="session-item">
                    <div>
                        <strong>Join Code: ${s.session_code}</strong>
                        ${isSuperAdmin() ? `<br><small style="color: #999;">Client: ${s.client_id}</small>` : ''}
                        <div style="font-size: 14px; color: #666;">
                            Created: ${formatDate(s.created_at)} at ${formatTime(s.created_at)}
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="deleteSession('${s.id}')">Delete</button>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
        await supabase
            .from('game_sessions')
            .delete()
            .eq('id', sessionId);
        
        showNotification('Session deleted', 'success');
        await loadSessions();
        await loadStats();
        
    } catch (error) {
        console.error('Error deleting session:', error);
        showNotification('Failed to delete session', 'error');
    }
}

async function loadPlayers() {
    try {
        let query;
        
        if (isSuperAdmin()) {
            // Super admin sees ALL players
            query = supabase
                .from('players')
                .select('*')
                .order('joined_at', { ascending: false });
        } else {
            // Regular admin sees only their players
            const { data: sessions } = await supabase
                .from('game_sessions')
                .select('id')
                .eq('client_id', currentClientId);
            
            if (!sessions || sessions.length === 0) {
                document.getElementById('playersList').innerHTML = 
                    '<p style="text-align: center; color: #666;">No players yet. Create a session first!</p>';
                return;
            }
            
            const sessionIds = sessions.map(s => s.id);
            query = supabase
                .from('players')
                .select('*')
                .in('session_id', sessionIds)
                .order('joined_at', { ascending: false });
        }
        
        const { data: players } = await query;
        
        const list = document.getElementById('playersList');
        if (!players || players.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666;">No players yet!</p>';
            return;
        }
        
        list.innerHTML = players.map(p => `
            <div class="player-item">
                <div>
                    <strong>${p.username}</strong>
                    ${isSuperAdmin() ? `<br><small style="color: #999;">Session: ${p.session_id.substring(0, 8)}...</small>` : ''}
                    <div style="font-size: 14px; color: #666;">
                        Joined: ${formatDate(p.joined_at)}
                    </div>
                </div>
                <button class="btn-secondary" onclick="deletePlayer('${p.id}')">Remove</button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

async function deletePlayer(playerId) {
    if (!confirm('Are you sure you want to remove this player?')) return;
    
    try {
        await supabase
            .from('players')
            .delete()
            .eq('id', playerId);
        
        showNotification('Player removed', 'success');
        await loadPlayers();
        await loadStats();
        
    } catch (error) {
        console.error('Error removing player:', error);
        showNotification('Failed to remove player', 'error');
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function setupAdminJoinGame() {
    const form = document.getElementById('adminJoinForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const code = document.getElementById('adminJoinCode').value.trim().toUpperCase();
        const username = document.getElementById('adminUsername').value.trim();
        const errorDiv = document.getElementById('adminJoinError');
        
        try {
            const { data: session, error } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('session_code', code)
                .single();

            if (error || !session) {
                errorDiv.textContent = 'Invalid game code. Please check and try again.';
                errorDiv.style.display = 'block';
                return;
            }

            sessionStorage.setItem('sessionId', session.id);
            sessionStorage.setItem('joinCode', code);
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('isAdminPlayer', 'true');
            
            window.location.href = 'avatar-customizer.html';
            
        } catch (err) {
            console.error('Admin join error:', err);
            errorDiv.textContent = 'Failed to join game. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
    
    const codeInput = document.getElementById('adminJoinCode');
    if (codeInput) {
        codeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            document.getElementById('adminJoinError').style.display = 'none';
        });
    }
}