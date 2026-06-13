/**
 * login.js — Chat Application
 * Handles form validation, authentication API call,
 * local storage persistence, and redirect on success.
 */

'use strict';

/* ------------------------------------------------------------------ */
/*  DOM references                                                      */
/* ------------------------------------------------------------------ */
const form           = document.getElementById('loginForm');
const loginBtn       = document.getElementById('loginBtn');
const globalError    = document.getElementById('globalError');
const globalErrorMsg = document.getElementById('globalErrorMsg');
const formWrapper    = document.getElementById('formWrapper');
const successOverlay = document.getElementById('successOverlay');
const successSubtitle = document.getElementById('successSubtitle');
const redirectProgress = document.getElementById('redirectProgress');

const fields = {
  email:    document.getElementById('email'),
  password: document.getElementById('password'),
};

const errors = {
  email:    document.getElementById('emailError'),
  password: document.getElementById('passwordError'),
};

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */
const API_URL       = 'http://localhost:8080/login';
const REDIRECT_URL  = 'chat.html';
const REDIRECT_DELAY_MS = 1600; // ms before redirect fires

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                      */
/* ------------------------------------------------------------------ */

function showFieldError(field, message) {
  fields[field].classList.add('is-invalid');
  errors[field].querySelector('.field-error-msg').textContent = message;
  errors[field].classList.add('visible');
}

function clearFieldError(field) {
  fields[field].classList.remove('is-invalid');
  errors[field].classList.remove('visible');
}

function showGlobalError(message) {
  globalErrorMsg.textContent = message;
  globalError.classList.add('visible');
}

function clearGlobalError() {
  globalError.classList.remove('visible');
}

function setLoading(active) {
  loginBtn.disabled = active;
  loginBtn.classList.toggle('loading', active);
}

function showSuccess(userName) {
  formWrapper.style.display = 'none';
  successOverlay.classList.add('visible');

  if (userName) {
    successSubtitle.textContent = `Welcome back, ${userName}! Redirecting you now…`;
  }

  // Animate progress bar then redirect
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      redirectProgress.style.width = '100%';
    });
  });

  setTimeout(() => {
    window.location.href = REDIRECT_URL;
  }, REDIRECT_DELAY_MS);
}

/* ------------------------------------------------------------------ */
/*  Validation                                                          */
/* ------------------------------------------------------------------ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value) {
  if (!value.trim())               return 'Email address is required.';
  if (!EMAIL_RE.test(value.trim())) return 'Please enter a valid email address.';
  return null;
}

function validatePassword(value) {
  if (!value) return 'Password is required.';
  return null;
}

function validateAll() {
  let valid = true;

  const emailErr = validateEmail(fields.email.value);
  if (emailErr) { showFieldError('email', emailErr); valid = false; }
  else clearFieldError('email');

  const passErr = validatePassword(fields.password.value);
  if (passErr) { showFieldError('password', passErr); valid = false; }
  else clearFieldError('password');

  return valid;
}

/* ------------------------------------------------------------------ */
/*  Live / blur validation                                              */
/* ------------------------------------------------------------------ */
fields.email.addEventListener('blur', () => {
  const err = validateEmail(fields.email.value);
  if (err) showFieldError('email', err);
  else     clearFieldError('email');
});

fields.password.addEventListener('blur', () => {
  const err = validatePassword(fields.password.value);
  if (err) showFieldError('password', err);
  else     clearFieldError('password');
});

/* Clear global error as user edits fields */
Object.values(fields).forEach(input => {
  input.addEventListener('input', clearGlobalError);
});

/* ------------------------------------------------------------------ */
/*  Password visibility toggle                                          */
/* ------------------------------------------------------------------ */
const EYE_OPEN = `
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>
`.trim();

const EYE_CLOSE = `
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
`.trim();

const toggleBtn  = document.getElementById('togglePassword');
const eyeIcon    = document.getElementById('eyeIcon');
const passwordInput = fields.password;

toggleBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  eyeIcon.innerHTML  = isHidden ? EYE_CLOSE : EYE_OPEN;
  toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

/* ------------------------------------------------------------------ */
/*  API — Login request                                                 */
/* ------------------------------------------------------------------ */

/**
 * Maps API response status / body to a user-facing error message.
 * Resolves to null on success.
 */
async function callLoginAPI(email, password) {
  const payload = { email: email.trim(), password };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    // Parse body for user data to persist
    let data = null;
    try { data = await response.json(); } catch (_) { /* no body */ }
    return { success: true, data };
  }

  // Handle known HTTP error codes
  let message = 'Login failed. Please try again.';

  if (response.status === 401) {
    message = 'Incorrect email or password. Please try again.';
  } else if (response.status === 404) {
    message = 'No account found with that email address.';
    showFieldError('email', 'No account with this email exists.');
  } else if (response.status === 400) {
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch (_) { /* use default */ }
  } else if (response.status >= 500) {
    message = 'Server error. Please try again in a moment.';
  }

  return { success: false, message };
}

/* ------------------------------------------------------------------ */
/*  Persist user data to localStorage                                   */
/* ------------------------------------------------------------------ */
function persistUser(email, data) {
  try {
    localStorage.setItem('chat_user_email', email.trim());

    // Attempt to extract user name from various common response shapes
    const userName =
      data?.userName   ||
      data?.username   ||
      data?.name       ||
      data?.user?.name ||
      data?.user?.userName ||
      null;

    if (userName) {
      localStorage.setItem('chat_user_name', userName);
    } else {
      localStorage.removeItem('chat_user_name');
    }

    // Persist token if returned
    const token =
      data?.token        ||
      data?.accessToken  ||
      data?.access_token ||
      null;

    if (token) {
      localStorage.setItem('chat_token', token);
    }

    return userName;
  } catch (_) {
    // localStorage unavailable (private mode, etc.) — degrade gracefully
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Form submission                                                      */
/* ------------------------------------------------------------------ */
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearGlobalError();

  if (!validateAll()) {
    const firstInvalid = form.querySelector('.is-invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  setLoading(true);

  try {
    const result = await callLoginAPI(fields.email.value, fields.password.value);

    if (result.success) {
      const displayName = persistUser(fields.email.value, result.data);
      showSuccess(displayName);
    } else {
      showGlobalError(result.message);
    }
  } catch (err) {
    if (err instanceof TypeError) {
      // Network failure — fetch throws TypeError on connection refused / offline
      showGlobalError('Unable to connect to the server. Please check your connection and try again.');
    } else {
      showGlobalError('An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
});