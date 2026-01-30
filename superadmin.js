// Super Admin Dashboard Logic

// Supabase Configuration
const SUPABASE_URL = 'https://uceacvdgglhjmljqfkou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWFjdmRnZ2xoam1sanFma291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODExMzgsImV4cCI6MjA4NTE1NzEzOH0.jQ3kgK2jy9_NyivP5scW3wQH9u-Hfl-NBjEw0SIcWIM';

// Prefer the global supabase/client from supabase.js (mock or real). Fallback to local client.
let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase) {
    supabaseClient = supabase;
} else if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        supabaseClient = window.supabase;
    }
}

let isAuthenticated = false;
// Use db as the supabase client (prefers global/mock if available)
const db = supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);

document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    setupNavigation();
});

function setupLogin() {
    const loginForm = document.getElementById('superAdminLoginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('superAdminPassword').value;
        
        try {
            // Try to authenticate against Supabase super_admins table
            const client = supabaseClient || (typeof supabase !== 'undefined' ? supabase : null);
            if (!client) throw new Error('Supabase not available');

            const { data: superAdmin, error } = await client
                .from('super_admins')
                .select('*')
                .eq('password', password)
                .eq('is_active', true)
                .single();

            if (superAdmin && superAdmin.id) {
                isAuthenticated = true;
                document.getElementById('superAdminLogin').style.display = 'none';
                document.getElementById('superAdminDashboard').style.display = 'grid';

                // store session hints
                sessionStorage.setItem('isSuperAdmin', 'true');
                sessionStorage.setItem('superAdminId', superAdmin.id);
                sessionStorage.setItem('superAdminName', superAdmin.name || 'Super Admin');
                sessionStorage.setItem('superAdminCode', superAdmin.super_code || '');

                await loadDashboard();
                return;
            }

            // Fallback: if no record found, fail with message
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = 'Invalid password or not authorized';
            errorDiv.style.display = 'block';
        } catch (err) {
            console.error('Super admin login error:', err);
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
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

async function loadDashboard() {
    await loadOverview();
}

async function loadOverview() {
    try {
        // Total clients
        const { count: clientsCount } = await db
            .from('clients')
            .select('*', { count: 'exact', head: true });
        
        document.getElementById('totalClients').textContent = clientsCount || 0;
        
        // Total revenue
        const { data: payments } = await db
            .from('payments')
            .select('amount')
            .eq('status', 'completed');
        
        const totalRevenue = payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
        document.getElementById('totalRevenue').textContent = `KES ${totalRevenue.toLocaleString()}`;
        
        // Active sessions (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: activeCount } = await db
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yesterday);
        
        document.getElementById('activeSessions').textContent = activeCount || 0;
        
        // Total users
        const { count: usersCount } = await db
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        document.getElementById('totalUsers').textContent = usersCount || 0;
        
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

async function loadTabData(tabName) {
    if (!isAuthenticated) return;
    
    switch(tabName) {
        case 'clients':
            await loadClients();
            break;
        case 'payments':
            await loadPayments();
            break;
        case 'analytics':
            await loadAnalytics();
            break;
    }
}

async function loadClients() {
    try {
        const { data: clients } = await db
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
        
        const tbody = document.getElementById('clientsTable');
        
        if (!clients || clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No clients yet</td></tr>';
            return;
        }
        
        // Get session counts for each client
        const clientsWithStats = await Promise.all(
            clients.map(async (client) => {
                const { count } = await db
                    .from('sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('client_id', client.id);
                
                return { ...client, sessionCount: count || 0 };
            })
        );
        
        tbody.innerHTML = clientsWithStats.map(client => `
            <tr>
                <td>${client.admin_email}</td>
                <td><code>${client.admin_code}</code></td>
                <td>${formatDate(client.created_at)}</td>
                <td>${client.sessionCount}</td>
                <td>
                    <button class="btn-secondary" onclick="resetClient('${client.id}')">Reset</button>
                    <button class="btn-secondary" style="background: #f44336; color: white;" 
                            onclick="revokeAccess('${client.id}')">Revoke</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

async function loadPayments() {
    try {
        const { data: payments } = await db
            .from('payments')
            .select('*, clients(admin_email)')
            .order('timestamp', { ascending: false });
        
        const tbody = document.getElementById('paymentsTable');
        
        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No payments yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.clients?.admin_email || 'N/A'}</td>
                <td>KES ${payment.amount.toLocaleString()}</td>
                <td>
                    <span style="background: ${payment.status === 'completed' ? '#4caf50' : '#ff9800'}; 
                                 color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                        ${payment.status}
                    </span>
                </td>
                <td>${formatDate(payment.timestamp)} ${formatTime(payment.timestamp)}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

async function loadAnalytics() {
    try {
        const analyticsDiv = document.getElementById('analyticsContent');
        
        // Get client-by-client breakdown
        const { data: clients } = await db
            .from('clients')
            .select('*');
        
        if (!clients || clients.length === 0) {
            analyticsDiv.innerHTML = '<p>No data available yet</p>';
            return;
        }
        
        const analyticsData = await Promise.all(
            clients.map(async (client) => {
                const { count: sessions } = await db
                    .from('sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('client_id', client.id);
                
                const { count: questions } = await db
                    .from('questions')
                    .select('*', { count: 'exact', head: true })
                    .eq('client_id', client.id);
                
                return {
                    email: client.admin_email,
                    sessions: sessions || 0,
                    questions: questions || 0,
                    joined: formatDate(client.created_at)
                };
            })
        );
        
        analyticsDiv.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Sessions Created</th>
                            <th>Questions Added</th>
                            <th>Member Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${analyticsData.map(data => `
                            <tr>
                                <td>${data.email}</td>
                                <td>${data.sessions}</td>
                                <td>${data.questions}</td>
                                <td>${data.joined}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

async function resetClient(clientId) {
    if (!confirm('Are you sure you want to reset this client? This will delete all their sessions and questions.')) {
        return;
    }
    
    try {
        // Delete sessions
        await db
            .from('sessions')
            .delete()
            .eq('client_id', clientId);
        
        // Delete questions
        await db
            .from('questions')
            .delete()
            .eq('client_id', clientId);
        
        showNotification('Client reset successfully', 'success');
        await loadClients();
        await loadOverview();
        
    } catch (error) {
        console.error('Error resetting client:', error);
        showNotification('Failed to reset client', 'error');
    }
}

async function revokeAccess(clientId) {
    if (!confirm('Are you sure you want to permanently revoke access for this client? This cannot be undone.')) {
        return;
    }
    
    try {
        // Delete all related data
        await db
            .from('sessions')
            .delete()
            .eq('client_id', clientId);
        
        await db
            .from('questions')
            .delete()
            .eq('client_id', clientId);
        
        // Delete client
        await db
            .from('clients')
            .delete()
            .eq('id', clientId);
        
        showNotification('Access revoked successfully', 'success');
        await loadClients();
        await loadOverview();
        
    } catch (error) {
        console.error('Error revoking access:', error);
        showNotification('Failed to revoke access', 'error');
    }
}

function logout() {
    isAuthenticated = false;
    document.getElementById('superAdminLogin').style.display = 'flex';
    document.getElementById('superAdminDashboard').style.display = 'none';
    document.getElementById('superAdminPassword').value = '';
}