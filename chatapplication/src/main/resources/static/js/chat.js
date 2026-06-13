/**
 * chat.js — Chat Application Dashboard
 * Complete rewrite of the Conversation panel:
 *   - Auto-loads conversation list via GET /conversations/{email}
 *   - Click-to-open chat via POST /conversation
 *   - Inline compose bar replaces the separate Send page
 *   - All original IDs, modals, auth guard, inbox, toasts preserved
 */

'use strict';

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const API = {
  SEND:          'http://localhost:8080/send',
  CONVERSATION:  'http://localhost:8080/conversation',
  CONVERSATIONS: 'http://localhost:8080/conversations',
  INBOX:         'http://localhost:8080/inbox',
  UPDATE:        'http://localhost:8080/update',
  DELETE:        'http://localhost:8080/message',
};

/* ─────────────────────────────────────────────
   AUTH GUARD
───────────────────────────────────────────── */
const currentUserEmail = localStorage.getItem('chat_user_email');
const currentUserName  = localStorage.getItem('chat_user_name');

if (!currentUserEmail) {
  window.location.replace('login.html');
}

/* ─────────────────────────────────────────────
   DOM — preserved IDs
───────────────────────────────────────────── */
const sidebar          = document.getElementById('sidebar');
const sidebarOverlay   = document.getElementById('sidebarOverlay');
const menuToggle       = document.getElementById('menuToggle');
const logoutBtn        = document.getElementById('logoutBtn');
const navItems         = document.querySelectorAll('.nav-item');
const panels           = document.querySelectorAll('.panel');

const sidebarUserName  = document.getElementById('sidebarUserName');
const sidebarUserEmail = document.getElementById('sidebarUserEmail');
const userAvatar       = document.getElementById('userAvatar');
const topbarAvatar     = document.getElementById('topbarAvatar');
const topbarTitle      = document.getElementById('topbarTitle');

// Conversation list (new)
const convList         = document.getElementById('convList');
const convListEmpty    = document.getElementById('convListEmpty');
const convSearch       = document.getElementById('convSearch');
const refreshConvsBtn  = document.getElementById('refreshConvsBtn');

// Chat window (same IDs as before)
const chatPlaceholder  = document.getElementById('chatPlaceholder');
const chatActive       = document.getElementById('chatActive');
const chatPeerAvatar   = document.getElementById('chatPeerAvatar');
const chatPeerName     = document.getElementById('chatPeerName');
const chatPeerEmail    = document.getElementById('chatPeerEmail');
const chatWindow       = document.getElementById('chatWindow');
const chatEmpty        = document.getElementById('chatEmpty');
const chatMessages     = document.getElementById('chatMessages');
const reloadChatBtn    = document.getElementById('reloadChatBtn');
const chatBackBtn      = document.getElementById('chatBackBtn');

// Compose bar (new — replaces separate send panel)
const composeInput     = document.getElementById('composeInput');
const composeSendBtn   = document.getElementById('composeSendBtn');

// Inbox (same IDs as before)
const loadInboxBtn     = document.getElementById('loadInboxBtn');
const inboxEmpty       = document.getElementById('inboxEmpty');
const inboxMessages    = document.getElementById('inboxMessages');

// Edit modal (same IDs as before)
const editModalBackdrop  = document.getElementById('editModalBackdrop');
const editContent        = document.getElementById('editContent');
const editContentError   = document.getElementById('editContentError');
const updateMsgBtn       = document.getElementById('updateMsgBtn');
const modalCloseBtn      = document.getElementById('modalCloseBtn');
const modalCancelBtn     = document.getElementById('modalCancelBtn');

// Delete modal (same IDs as before)
const deleteModalBackdrop = document.getElementById('deleteModalBackdrop');
const deleteModalCloseBtn = document.getElementById('deleteModalCloseBtn');
const deleteCancelBtn     = document.getElementById('deleteCancelBtn');
const confirmDeleteBtn    = document.getElementById('confirmDeleteBtn');

const toastContainer = document.getElementById('toastContainer');

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
let currentConvEmail  = null;   // currently open chat
let editingMessageId  = null;
let deletingMessageId = null;
let allConversations  = [];     // cached list for search filter

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
function init() {
  initUserInfo();
  loadConversationList();
}

/* ─────────────────────────────────────────────
   USER INFO
───────────────────────────────────────────── */
function initUserInfo() {
  const displayName = currentUserName || emailToName(currentUserEmail);
  const initials    = getInitials(displayName);
  sidebarUserName.textContent  = displayName;
  sidebarUserEmail.textContent = currentUserEmail;
  userAvatar.textContent       = initials;
  topbarAvatar.textContent     = initials;
}

function emailToName(email) {
  if (!email) return 'User';
  return email.split('@')[0];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
function activatePanel(panelName) {
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.panel === panelName);
  });
  panels.forEach(panel => {
    panel.classList.toggle('hidden', panel.dataset.panel !== panelName);
  });
  topbarTitle.textContent = panelName === 'chat' ? 'Messages' : 'Inbox';
  closeSidebar();
}

navItems.forEach(item => {
  item.addEventListener('click', () => activatePanel(item.dataset.panel));
});

/* Mobile sidebar */
function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarOverlay.addEventListener('click', closeSidebar);

/* Mobile back: go from chat window → conversation list */
chatBackBtn.addEventListener('click', () => {
  document.getElementById('convListCol').classList.remove('mobile-hidden');
  document.getElementById('chatCol').classList.remove('mobile-visible');
});

/* ─────────────────────────────────────────────
   LOGOUT
───────────────────────────────────────────── */
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('chat_user_email');
  localStorage.removeItem('chat_user_name');
  localStorage.removeItem('chat_token');
  window.location.href = 'login.html';
});

/* ─────────────────────────────────────────────
   TOAST SYSTEM (unchanged)
───────────────────────────────────────────── */
const TOAST_ICONS = {
  success: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warning: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
};

function showToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type]}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  toastContainer.appendChild(toast);
  const timer = setTimeout(() => removeToast(toast), duration);
  toast._timer = timer;
}

function removeToast(toast) {
  clearTimeout(toast._timer);
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* ─────────────────────────────────────────────
   UTILITIES (unchanged)
───────────────────────────────────────────── */
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  let data = null;
  const ct = response.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) {
    try { data = await response.json(); } catch (_) {}
  }
  return { ok: response.ok, status: response.status, data };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    if (isNaN(d)) return '';
    // If today, show time only; else show short date + time
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) { return ''; }
}

function formatTimeFull(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    if (isNaN(d)) return '';
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ''; }
}

function setLoading(btn, active) {
  btn.disabled = active;
  btn.classList.toggle('loading', active);
}

function showFieldErr(el, msg) {
  el.querySelector('.field-error-msg').textContent = msg;
  el.classList.add('visible');
}
function clearFieldErr(el) { el.classList.remove('visible'); }

function validateContent(value, errorEl, inputEl) {
  if (!value.trim()) {
    showFieldErr(errorEl, 'Message cannot be empty.');
    inputEl?.classList.add('is-invalid');
    return false;
  }
  clearFieldErr(errorEl);
  inputEl?.classList.remove('is-invalid');
  return true;
}

/* ─────────────────────────────────────────────
   CONVERSATION LIST — GET /conversations/{email}
───────────────────────────────────────────── */
refreshConvsBtn.addEventListener('click', loadConversationList);

async function loadConversationList() {
  refreshConvsBtn.classList.add('spinning');

  try {
    const url = `${API.CONVERSATIONS}/${encodeURIComponent(currentUserEmail)}`;
    const { ok, status, data } = await apiRequest(url, { method: 'GET' });

    if (ok) {
      // Support both array response and {conversations:[]} shape
      const convs = Array.isArray(data)
        ? data
        : (data?.conversations || data?.data || data?.users || []);
      allConversations = convs;
      renderConversationList(convs);
    } else if (status === 404) {
      allConversations = [];
      renderConversationList([]);
    } else {
      showToast('Failed to load conversations.', 'error');
    }
  } catch (err) {
    showToast(
      err instanceof TypeError ? 'Cannot connect to the server.' : 'Unexpected error.',
      'error'
    );
  } finally {
    refreshConvsBtn.classList.remove('spinning');
  }
}

function renderConversationList(convs) {
  convList.innerHTML = '';

  if (!convs || convs.length === 0) {
    convListEmpty.style.display = 'flex';
    return;
  }
  convListEmpty.style.display = 'none';

  convs.forEach(conv => {
    // Support various response shapes from different backends
    const email       = conv.email || conv.receiverEmail || conv.senderEmail || conv.userEmail || conv.user || String(conv);
	const lastMsg = conv.lastMessage || 'Tap to open chat';
    const lastTime    = conv.lastTimestamp || conv.timestamp  || conv.sentAt   || conv.createdAt || null;
    const unreadCount = conv.unreadCount   || conv.unread     || 0;

    const initials = getInitials(emailToName(email));
    const isActive = email === currentConvEmail;

    const item = document.createElement('div');
    item.className = `conv-item${isActive ? ' active' : ''}`;
    item.dataset.email = email;

    item.innerHTML = `
      <div class="conv-item-avatar">${escapeHtml(initials)}</div>
      <div class="conv-item-body">
        <div class="conv-item-top">
          <span class="conv-item-email">${escapeHtml(email)}</span>
          ${lastTime ? `<span class="conv-item-time">${escapeHtml(formatTime(lastTime))}</span>` : ''}
        </div>
        <div class="conv-item-bottom">
          <span class="conv-item-preview">${escapeHtml(lastMsg ? lastMsg.substring(0, 55) + (lastMsg.length > 55 ? '…' : '') : 'No messages yet')}</span>
          ${unreadCount > 0 ? `<span class="conv-item-badge">${unreadCount}</span>` : ''}
        </div>
      </div>
    `;

    item.addEventListener('click', () => selectConversation(email));
    convList.appendChild(item);
  });
}

/* Conversation search filter */
convSearch.addEventListener('input', () => {
  const q = convSearch.value.trim().toLowerCase();
  if (!q) {
    renderConversationList(allConversations);
    return;
  }
  const filtered = allConversations.filter(conv => {
    const email = conv.email || conv.receiverEmail || conv.senderEmail || conv.userEmail || conv.user || String(conv);
    return email.toLowerCase().includes(q);
  });
  renderConversationList(filtered);
  // Re-highlight active
  if (currentConvEmail) {
    convList.querySelectorAll('.conv-item').forEach(item => {
      item.classList.toggle('active', item.dataset.email === currentConvEmail);
    });
  }
});

/* ─────────────────────────────────────────────
   SELECT CONVERSATION → load messages
───────────────────────────────────────────── */
async function selectConversation(email) {
  currentConvEmail = email;

  // Highlight in list
  convList.querySelectorAll('.conv-item').forEach(item => {
    item.classList.toggle('active', item.dataset.email === email);
  });

  // Update chat header
  const initials = getInitials(emailToName(email));
  chatPeerAvatar.textContent = initials;
  chatPeerName.textContent   = emailToName(email);
  chatPeerEmail.textContent  = email;

  // Show chat area, hide placeholder
  chatPlaceholder.classList.add('hidden');
  chatActive.classList.remove('hidden');

  // Mobile: show chat col, hide list col
  document.getElementById('convListCol').classList.add('mobile-hidden');
  document.getElementById('chatCol').classList.add('mobile-visible');

  // Focus compose
  composeInput.focus();

  await loadChatMessages();
}

/* ─────────────────────────────────────────────
   LOAD CHAT MESSAGES — POST /conversation
───────────────────────────────────────────── */
reloadChatBtn.addEventListener('click', loadChatMessages);

async function loadChatMessages() {
  if (!currentConvEmail) return;

  reloadChatBtn.classList.add('spinning');

  try {
    const { ok, status, data } = await apiRequest(API.CONVERSATION, {
      method: 'POST',
      body: JSON.stringify({
        senderEmail:   currentUserEmail,
        receiverEmail: currentConvEmail,
      }),
    });

    if (ok) {
      const messages = Array.isArray(data) ? data : (data?.messages || data?.data || []);
      renderMessages(messages);
    } else if (status === 404) {
      renderMessages([]);
    } else {
      const msg = data?.message || data?.error || 'Failed to load messages.';
      showToast(msg, 'error');
    }
  } catch (err) {
    showToast(
      err instanceof TypeError ? 'Cannot connect to the server.' : 'Unexpected error.',
      'error'
    );
  } finally {
    reloadChatBtn.classList.remove('spinning');
  }
}

/* ─────────────────────────────────────────────
   RENDER MESSAGES (chat bubbles)
───────────────────────────────────────────── */
function renderMessages(messages) {
  chatMessages.innerHTML = '';

  messages.sort((a,b) => new Date(a.sentTime) - new Date(b.sentTime));
  
  if (!messages || messages.length === 0) {
    chatEmpty.style.display = 'flex';
    return;
  }
  chatEmpty.style.display = 'none';

  messages.forEach(msg => {
    const isSent = Number(msg.senderId) === Number(localStorage.getItem('chat_user_id'));
    const id      = msg.id || msg.messageId || msg._id || null;
    const content = msg.content || msg.message || msg.text || '';
    const time = formatTimeFull(msg.sentTime);

    const row = document.createElement('div');
    row.className = `bubble-row ${isSent ? 'sent' : 'received'}`;
    row.dataset.id = id || '';

    row.innerHTML = `
      <div class="bubble-meta">${escapeHtml(isSent ? 'You' : (msg.senderEmail || msg.sender || 'Them'))}${time ? ' · ' + time : ''}</div>
      <div class="bubble">${escapeHtml(content)}</div>
      ${isSent && id ? `
        <div class="bubble-actions">
          <button class="btn-icon edit-btn" data-id="${escapeHtml(String(id))}" data-content="${escapeHtml(content)}" title="Edit">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger delete-btn" data-id="${escapeHtml(String(id))}" title="Delete">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      ` : ''}
    `;

    chatMessages.appendChild(row);
  });

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Bind action buttons
  chatMessages.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => openEditModal(btn.dataset.id, btn.dataset.content))
  );
  chatMessages.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id))
  );
}

/* ─────────────────────────────────────────────
   COMPOSE & SEND — POST /send
───────────────────────────────────────────── */

// Auto-resize textarea
composeInput.addEventListener('input', () => {
  composeInput.style.height = 'auto';
  composeInput.style.height = Math.min(composeInput.scrollHeight, 120) + 'px';
});

// Send on Enter (Shift+Enter = newline)
composeInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

composeSendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
  if (!currentConvEmail) {
    showToast('Select a conversation first.', 'warning');
    return;
  }

  const content = composeInput.value.trim();
  if (!content) {
    composeInput.classList.add('is-invalid');
    setTimeout(() => composeInput.classList.remove('is-invalid'), 1200);
    return;
  }

  composeSendBtn.disabled = true;
  composeSendBtn.classList.add('sending');

  try {
    const { ok, status, data } = await apiRequest(API.SEND, {
      method: 'POST',
      body: JSON.stringify({
        senderEmail:   currentUserEmail,
        receiverEmail: currentConvEmail,
        content,
      }),
    });

    if (ok) {
      composeInput.value = '';
      composeInput.style.height = 'auto';
      // Reload messages & refresh list for updated preview
      await loadChatMessages();
      await loadConversationList();
      // Re-highlight selected
      convList.querySelectorAll('.conv-item').forEach(item =>
        item.classList.toggle('active', item.dataset.email === currentConvEmail)
      );
    } else if (status === 404) {
      showToast('User not found.', 'error');
    } else {
      const msg = data?.message || data?.error || 'Failed to send.';
      showToast(msg, 'error');
    }
  } catch (err) {
    showToast(
      err instanceof TypeError ? 'Cannot connect to the server.' : 'Unexpected error.',
      'error'
    );
  } finally {
    composeSendBtn.disabled = false;
    composeSendBtn.classList.remove('sending');
    composeInput.focus();
  }
}

/* ─────────────────────────────────────────────
   INBOX — unchanged logic
───────────────────────────────────────────── */
loadInboxBtn.addEventListener('click', loadInbox);

async function loadInbox() {
  setLoading(loadInboxBtn, true);
  try {
    const url = `${API.INBOX}/${encodeURIComponent(currentUserEmail)}`;
    const { ok, status, data } = await apiRequest(url, { method: 'GET' });

    if (ok) {
      const messages = Array.isArray(data) ? data : (data?.messages || data?.data || []);
      renderInbox(messages);
    } else if (status === 404) {
      renderInbox([]);
    } else {
      showToast(data?.message || 'Failed to load inbox.', 'error');
    }
  } catch (err) {
    showToast(err instanceof TypeError ? 'Cannot connect to the server.' : 'Unexpected error.', 'error');
  } finally {
    setLoading(loadInboxBtn, false);
  }
}

function renderInbox(messages) {
  inboxMessages.innerHTML = '';
  if (!messages || messages.length === 0) {
    inboxEmpty.style.display = 'flex';
    inboxEmpty.querySelector('p').textContent = 'Your inbox is empty.';
    return;
  }
  inboxEmpty.style.display = 'none';

  messages.forEach(msg => {
    const sender   = msg.senderEmail || msg.sender || 'Unknown';
    const content  = msg.content || msg.message || msg.text || '';
    const time     = formatTimeFull(msg.timestamp || msg.createdAt || msg.sentAt || null);
    const initials = getInitials(emailToName(sender));

    const card = document.createElement('div');
    card.className = 'inbox-card';
    card.innerHTML = `
      <div class="inbox-sender-avatar">${escapeHtml(initials)}</div>
      <div class="inbox-card-body">
        <p class="inbox-sender">${escapeHtml(sender)}</p>
        <p class="inbox-text">${escapeHtml(content)}</p>
        ${time ? `<p class="inbox-time">${escapeHtml(time)}</p>` : ''}
      </div>
    `;
    inboxMessages.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   EDIT MODAL — unchanged logic
───────────────────────────────────────────── */
function openEditModal(messageId, currentContent) {
  editingMessageId  = messageId;
  editContent.value = currentContent || '';
  editContent.classList.remove('is-invalid');
  clearFieldErr(editContentError);
  editModalBackdrop.classList.add('open');
  setTimeout(() => editContent.focus(), 80);
}
function closeEditModal() {
  editModalBackdrop.classList.remove('open');
  editingMessageId = null;
}

modalCloseBtn.addEventListener('click',  closeEditModal);
modalCancelBtn.addEventListener('click', closeEditModal);
editModalBackdrop.addEventListener('click', e => { if (e.target === editModalBackdrop) closeEditModal(); });
editContent.addEventListener('input', () => { clearFieldErr(editContentError); editContent.classList.remove('is-invalid'); });

updateMsgBtn.addEventListener('click', async () => {
  const content = editContent.value;
  if (!validateContent(content, editContentError, editContent)) return;
  if (!editingMessageId) return;

  setLoading(updateMsgBtn, true);
  try {
    const { ok, data } = await apiRequest(API.UPDATE, {
      method: 'PUT',
      body: JSON.stringify({ messageId: editingMessageId, content: content.trim() }),
    });
    if (ok) {
      showToast('Message updated.', 'success');
      closeEditModal();
      if (currentConvEmail) await loadChatMessages();
    } else {
      showToast(data?.message || 'Failed to update.', 'error');
    }
  } catch (err) {
    showToast(err instanceof TypeError ? 'Cannot connect.' : 'Unexpected error.', 'error');
  } finally {
    setLoading(updateMsgBtn, false);
  }
});

/* ─────────────────────────────────────────────
   DELETE MODAL — unchanged logic
───────────────────────────────────────────── */
function openDeleteModal(messageId) {
  deletingMessageId = messageId;
  deleteModalBackdrop.classList.add('open');
}
function closeDeleteModal() {
  deleteModalBackdrop.classList.remove('open');
  deletingMessageId = null;
}

deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
deleteCancelBtn.addEventListener('click',     closeDeleteModal);
deleteModalBackdrop.addEventListener('click', e => { if (e.target === deleteModalBackdrop) closeDeleteModal(); });

confirmDeleteBtn.addEventListener('click', async () => {
  if (!deletingMessageId) return;
  setLoading(confirmDeleteBtn, true);
  try {
    const url = `${API.DELETE}/${encodeURIComponent(deletingMessageId)}`;
    const { ok, data } = await apiRequest(url, { method: 'DELETE' });
    if (ok) {
      showToast('Message deleted.', 'success');
      closeDeleteModal();
      if (currentConvEmail) {
        await loadChatMessages();
        await loadConversationList();
        convList.querySelectorAll('.conv-item').forEach(item =>
          item.classList.toggle('active', item.dataset.email === currentConvEmail)
        );
      }
    } else {
      showToast(data?.message || 'Failed to delete.', 'error');
    }
  } catch (err) {
    showToast(err instanceof TypeError ? 'Cannot connect.' : 'Unexpected error.', 'error');
  } finally {
    setLoading(confirmDeleteBtn, false);
  }
});

/* ─────────────────────────────────────────────
   KEYBOARD
───────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (editModalBackdrop.classList.contains('open'))   closeEditModal();
    if (deleteModalBackdrop.classList.contains('open')) closeDeleteModal();
    if (sidebar.classList.contains('open'))             closeSidebar();
  }
});

/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */
init();