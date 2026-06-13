	const form           = document.getElementById('registerForm');
    const registerBtn    = document.getElementById('registerBtn');
    const globalError    = document.getElementById('globalError');
    const globalErrorMsg = document.getElementById('globalErrorMsg');
    const formWrapper    = document.getElementById('formWrapper');
    const successOverlay = document.getElementById('successOverlay');
    const strengthBar    = document.getElementById('strengthBar');

    const fields = {
      username:        document.getElementById('username'),
      email:           document.getElementById('email'),
      password:        document.getElementById('password'),
      confirmPassword: document.getElementById('confirmPassword'),
    };

    const errors = {
      username:        document.getElementById('usernameError'),
      email:           document.getElementById('emailError'),
      password:        document.getElementById('passwordError'),
      confirmPassword: document.getElementById('confirmError'),
    };

    /* ---- Helpers ---- */
    function showFieldError(field, msg) {
      fields[field].classList.add('is-invalid');
      errors[field].querySelector('.field-error-msg').textContent = msg;
      errors[field].classList.add('visible');
    }
    function clearFieldError(field) {
      fields[field].classList.remove('is-invalid');
      errors[field].classList.remove('visible');
    }
    function showGlobalError(msg) { globalErrorMsg.textContent = msg; globalError.classList.add('visible'); }
    function clearGlobalError()   { globalError.classList.remove('visible'); }
    function setLoading(on)       { registerBtn.disabled = on; registerBtn.classList.toggle('loading', on); }
    function showSuccess()        { formWrapper.style.display = 'none'; successOverlay.classList.add('visible'); }

    /* ---- Validation ---- */
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateUsername(v) {
      if (!v.trim())               return 'Username is required.';
      if (v.trim().length < 3)     return 'Username must be at least 3 characters.';
      if (v.trim().length > 30)    return 'Username must not exceed 30 characters.';
      if (!/^[a-zA-Z0-9_.-]+$/.test(v.trim())) return 'Only letters, numbers, _ . and - are allowed.';
      return null;
    }
    function validateEmail(v) {
      if (!v.trim())              return 'Email address is required.';
      if (!EMAIL_RE.test(v.trim())) return 'Please enter a valid email address.';
      return null;
    }
    function validatePassword(v) {
      if (!v)           return 'Password is required.';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      return null;
    }
    function validateConfirm(v, pw) {
      if (!v)       return 'Please confirm your password.';
      if (v !== pw) return 'Passwords do not match.';
      return null;
    }
    function validateAll() {
      let ok = true;
      const checks = [
        ['username', validateUsername(fields.username.value)],
        ['email',    validateEmail(fields.email.value)],
        ['password', validatePassword(fields.password.value)],
        ['confirmPassword', validateConfirm(fields.confirmPassword.value, fields.password.value)],
      ];
      checks.forEach(([f, err]) => {
        if (err) { showFieldError(f, err); ok = false; } else clearFieldError(f);
      });
      return ok;
    }

    /* ---- Strength meter ---- */
    function getStrength(pw) {
      let s = 0;
      if (pw.length >= 8)  s++;
      if (pw.length >= 12) s++;
      if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
      if (/\d/.test(pw))    s++;
      if (/[^A-Za-z0-9]/.test(pw)) s++;
      return Math.min(4, Math.max(1, s <= 1 ? 1 : s === 2 ? 2 : s === 3 ? 3 : 4));
    }

    fields.password.addEventListener('input', () => {
      const v = fields.password.value;
      if (!v) { strengthBar.className = 'strength-bar'; return; }
      strengthBar.className = 'strength-bar visible strength-' + getStrength(v);
      clearFieldError('password');
    });

    /* ---- Blur validation ---- */
    fields.username.addEventListener('blur', () => { const e = validateUsername(fields.username.value); e ? showFieldError('username',e) : clearFieldError('username'); });
    fields.email.addEventListener('blur',    () => { const e = validateEmail(fields.email.value); e ? showFieldError('email',e) : clearFieldError('email'); });
    fields.password.addEventListener('blur', () => { const e = validatePassword(fields.password.value); e ? showFieldError('password',e) : clearFieldError('password'); });
    fields.confirmPassword.addEventListener('blur', () => { const e = validateConfirm(fields.confirmPassword.value, fields.password.value); e ? showFieldError('confirmPassword',e) : clearFieldError('confirmPassword'); });
    fields.confirmPassword.addEventListener('input', () => { if (fields.confirmPassword.value === fields.password.value) clearFieldError('confirmPassword'); });

    /* ---- Password toggles ---- */
    const EYE_OPEN  = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    const EYE_CLOSE = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

    function bindToggle(btnId, inputId, iconId) {
      const btn = document.getElementById(btnId);
      const inp = document.getElementById(inputId);
      const ico = document.getElementById(iconId);
      btn.addEventListener('click', () => {
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        ico.innerHTML = show ? EYE_CLOSE : EYE_OPEN;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    }
    bindToggle('togglePassword', 'password', 'eyeIconPassword');
    bindToggle('toggleConfirm', 'confirmPassword', 'eyeIconConfirm');

    /* ---- Submit ---- */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearGlobalError();
      if (!validateAll()) {
        const first = form.querySelector('.is-invalid');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const payload = {
        userName: fields.username.value.trim(),
        email:    fields.email.value.trim(),
        password: fields.password.value,
      };

      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) { showSuccess(); return; }

        let msg = 'Registration failed. Please try again.';
        if (res.status === 409) {
          msg = 'An account with this email already exists.';
          showFieldError('email', 'This email is already registered.');
        } else if (res.status === 400) {
          try { const b = await res.json(); msg = b.message || b.error || msg; } catch(_) {}
        } else if (res.status >= 500) {
          msg = 'Server error. Please try again in a moment.';
        }
        showGlobalError(msg);
      } catch (err) {
        showGlobalError(err instanceof TypeError
          ? 'Unable to connect to the server. Please check your connection.'
          : 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    Object.values(fields).forEach(inp => inp.addEventListener('input', clearGlobalError));

    document.getElementById('goToLoginBtn').addEventListener('click', () => {
      window.location.href = 'login.html';
    });