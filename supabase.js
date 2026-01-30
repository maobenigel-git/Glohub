// Supabase Client Initialization
// Replace with your actual Supabase project credentials

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client (real or mock fallback)
let supabase;
try {
    if (window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        // Use mock implementation when no real Supabase configured
        supabase = createMockSupabase();
    }
} catch (err) {
    // Fallback to mock if any error occurs
    supabase = createMockSupabase();
}

// Utility functions
const generateRandomCode = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

// Check authentication helper
const checkAuth = (redirectUrl = 'admin-login.html') => {
    const adminCode = sessionStorage.getItem('adminCode');
    const clientId = sessionStorage.getItem('clientId');
    
    if (!adminCode || !clientId) {
        window.location.href = redirectUrl;
        return null;
    }
    
    return { adminCode, clientId };
};

// Check player session
const checkPlayerSession = (redirectUrl = 'join-game.html') => {
    const sessionId = sessionStorage.getItem('sessionId');
    const username = sessionStorage.getItem('username');
    const userId = sessionStorage.getItem('userId');
    
    if (!sessionId || !username) {
        window.location.href = redirectUrl;
        return null;
    }
    
    return { sessionId, username, userId };
};

// Email sending function (mock for now)
const sendEmail = async (to, subject, body) => {
    console.log('Email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    // In production, integrate with a service like SendGrid, Mailgun, or Supabase Edge Functions
    // For now, we'll just log it
    return { success: true };
};

// Show notification helper
const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Add animation styles
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
`;
document.head.appendChild(style);

// --- Mock Supabase Implementation ---
function createMockSupabase() {
    const STORAGE_KEY = 'galentinehub_db_v1';

    const defaultDB = {
        clients: [],
        sessions: [],
        questions: [],
        users: [],
        payments: [],
        responses: []
    };

    function loadDB() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return JSON.parse(JSON.stringify(defaultDB));
            return JSON.parse(raw);
        } catch (e) {
            return JSON.parse(JSON.stringify(defaultDB));
        }
    }

    function saveDB(db) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }

    function generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    }

    function applyFilters(arr, filters) {
        return arr.filter(item => filters.every(fn => fn(item)));
    }

    function Query(table) {
        this.table = table;
        this._filters = [];
        this._order = null;
        this._in = null;
    }

    Query.prototype.eq = function(field, value) {
        this._filters.push(item => item[field] == value);
        return this;
    };

    Query.prototype.in = function(field, values) {
        this._filters.push(item => values.includes(item[field]));
        return this;
    };

    Query.prototype.order = function(field, opts) {
        this._order = { field, opts };
        return this;
    };

    Query.prototype._getTableArray = function() {
        const db = loadDB();
        if (!db[this.table]) db[this.table] = [];
        return db[this.table];
    };

    Query.prototype.select = function(columns = '*', opts = {}) {
        this._op = 'select';
        this._selectColumns = columns;
        this._selectOpts = opts || {};
        return this;
    };

    Query.prototype.then = function(resolve, reject) {
        // Execute select when query is awaited
        if (this._op === 'select') {
            const arr = this._getTableArray();
            let result = applyFilters(arr, this._filters);

            if (this._order && result.length > 0) {
                const f = this._order.field;
                const asc = this._order.opts && this._order.opts.ascending !== false;
                result = result.sort((a,b) => {
                    if (a[f] < b[f]) return asc ? -1 : 1;
                    if (a[f] > b[f]) return asc ? 1 : -1;
                    return 0;
                });
            }

            if (this._selectOpts && this._selectOpts.head) {
                return Promise.resolve({ count: result.length }).then(resolve, reject);
            }

            // Support simple join pattern '*, clients(*)' used in sessions select
            if (typeof this._selectColumns === 'string' && this._selectColumns.includes('clients(*)') && this.table === 'sessions') {
                const db = loadDB();
                result = result.map(sess => {
                    const client = (db.clients || []).find(c => c.id === sess.client_id) || null;
                    return Object.assign({}, sess, { clients: client });
                });
            }

            return Promise.resolve({ data: JSON.parse(JSON.stringify(result)), error: null }).then(resolve, reject);
        }

        // Default resolution
        return Promise.resolve({ data: [], error: null }).then(resolve, reject);
    };

    Query.prototype.catch = function(fn) {
        // allow promise-style catch chaining
        return this.then(undefined, fn);
    };

    Query.prototype.single = function() {
        const arr = this._getTableArray();
        const result = applyFilters(arr, this._filters);
        const item = result.length > 0 ? JSON.parse(JSON.stringify(result[0])) : null;
        return Promise.resolve({ data: item, error: item ? null : null });
    };

    Query.prototype.insert = function(items) {
        const db = loadDB();
        const tableArr = db[this.table] || (db[this.table] = []);
        const toInsert = items.map(it => {
            const copy = Object.assign({}, it);
            if (!copy.id) copy.id = generateId();
            copy.created_at = new Date().toISOString();
            tableArr.push(copy);
            return copy;
        });
        saveDB(db);

        return {
            select: () => ({
                single: () => Promise.resolve({ data: JSON.parse(JSON.stringify(toInsert[0])), error: null })
            })
        };
    };

    Query.prototype.update = function(obj) {
        const db = loadDB();
        const tableArr = db[this.table] || (db[this.table] = []);
        let updated = [];
        for (let i = 0; i < tableArr.length; i++) {
            const item = tableArr[i];
            if (this._filters.every(fn => fn(item))) {
                tableArr[i] = Object.assign({}, item, obj);
                updated.push(tableArr[i]);
            }
        }
        saveDB(db);
        return Promise.resolve({ data: updated, error: null });
    };

    Query.prototype.delete = function() {
        const db = loadDB();
        const tableArr = db[this.table] || (db[this.table] = []);
        const remaining = tableArr.filter(item => !this._filters.every(fn => fn(item)));
        const deleted = tableArr.filter(item => this._filters.every(fn => fn(item)));
        db[this.table] = remaining;
        saveDB(db);
        return Promise.resolve({ data: deleted, error: null });
    };

    // Seed demo data if database is empty
    function seedDemoDataIfEmpty() {
        const db = loadDB();
        const hasData = (db.clients && db.clients.length) || (db.sessions && db.sessions.length) || (db.questions && db.questions.length) || (db.super_admins && db.super_admins.length);
        if (hasData) return;

        const now = new Date().toISOString();

        db.clients = [
            {
                id: 'client_demo',
                admin_email: 'demo@example.com',
                admin_code: 'DEMOADMIN',
                theme_config: { primary: '#ff69b4', secondary: '#ffb6d9', accent: '#ff1493' },
                created_at: now
            }
        ];

        db.sessions = [
            {
                id: 'session_demo',
                client_id: 'client_demo',
                join_code: 'DEMO01',
                created_at: now
            }
        ];

        db.questions = [
            {
                id: 'q_demo_1',
                client_id: 'client_demo',
                question_text: 'What is 2 + 2?',
                options: ['1','2','4','3'],
                correct_answer: 2,
                created_at: now
            },
            {
                id: 'q_demo_2',
                client_id: 'client_demo',
                question_text: 'Which color is associated with roses?',
                options: ['Blue','Red','Yellow','Black'],
                correct_answer: 1,
                created_at: now
            }
        ];

        db.payments = [
            {
                id: 'pay_demo_1',
                client_id: 'client_demo',
                amount: 649,
                status: 'completed',
                created_at: now
            }
        ];

        // Seed a default super admin for local/mock use
        db.super_admins = [
            {
                id: 'super_demo_1',
                name: 'GloHub Super',
                super_code: 'SUPERADMIN',
                // NOTE: In production passwords should be hashed. This is plaintext for local demo only.
                password: 'superpass',
                is_active: true,
                created_at: now
            }
        ];

        saveDB(db);
    }

    // Seed now for immediate demo use
    try { seedDemoDataIfEmpty(); } catch (e) { /* noop */ }

    return {
        from: function(table) {
            return new Query(table);
        },
        // expose helper to reset mock DB in dev
        _reset: function() {
            saveDB(JSON.parse(JSON.stringify(defaultDB)));
        },
        _load: loadDB
    };
}