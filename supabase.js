// supabase.js
// PRODUCTION Supabase Client Initialization

const SUPABASE_URL = 'https://uceacvdgglhjmljqfkou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWFjdmRnZ2xoam1sanFma291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODExMzgsImV4cCI6MjA4NTE1NzEzOH0.jQ3kgK2jy9_NyivP5scW3wQH9u-Hfl-NBjEw0SIcWIM';

// Create Supabase client (REAL ONLY)
window.supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ---------- Utility helpers ----------

const generateRandomCode = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; is < length; i++) {
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

// ---------- Auth helpers ----------

const checkAuth = (redirectUrl = 'admin-login.html') => {
  const adminSession = sessionStorage.getItem('adminSession');

  if (!adminSession) {
    window.location.href = redirectUrl;
    return null;
  }

  return JSON.parse(adminSession);
};

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

// ---------- Notifications ----------

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

// Animation styles
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(400px); opacity: 0; }
}
`;
document.head.appendChild(style);

// Export globally
window.supabaseClient = supabase;
