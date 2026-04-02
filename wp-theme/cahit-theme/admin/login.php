<?php
if (defined('ABSPATH')) {
    if (is_user_logged_in() && current_user_can('manage_options')) {
        wp_redirect(home_url('/admin'));
        exit;
    }
} elseif (php_sapi_name() !== 'cli' && !defined('CAHIT_PREVIEW_MODE')) {
    http_response_code(403);
    exit('Direct access not allowed.');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Login - Cahit CRM</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif;background:#0f172a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .login-wrapper{width:100%;max-width:420px}
    .login-brand{text-align:center;margin-bottom:32px}
    .login-brand-icon{width:56px;height:56px;background:#0ea5e9;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:24px;color:#fff;margin-bottom:16px}
    .login-brand h1{color:#fff;font-size:24px;font-weight:600;margin-bottom:4px}
    .login-brand p{color:#94a3b8;font-size:14px}
    .login-card{background:#fff;border-radius:12px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
    .login-card h2{font-size:20px;font-weight:600;margin-bottom:4px;color:#0f172a}
    .login-card .subtitle{font-size:14px;color:#64748b;margin-bottom:24px}
    .form-group{margin-bottom:16px}
    .form-label{display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:#334155}
    .form-input{width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border-color .15s;background:#fff;color:#0f172a}
    .form-input:focus{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.1)}
    .form-input.error{border-color:#ef4444}
    .input-wrapper{position:relative}
    .toggle-password{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8;padding:0}
    .toggle-password:hover{color:#64748b}
    .remember-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
    .remember-label{display:flex;align-items:center;gap:8px;font-size:13px;color:#64748b;cursor:pointer}
    .remember-label input{width:16px;height:16px;accent-color:#0ea5e9}
    .forgot-link{font-size:13px;color:#0ea5e9;text-decoration:none}
    .forgot-link:hover{text-decoration:underline}
    .btn-login{width:100%;padding:12px;background:#0ea5e9;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;transition:background .15s;font-family:inherit}
    .btn-login:hover{background:#0284c7}
    .btn-login:disabled{opacity:.6;cursor:not-allowed}
    .error-msg{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:16px;display:none}
    .error-msg.show{display:block}
    .login-footer{text-align:center;margin-top:24px}
    .login-footer a{color:#94a3b8;font-size:13px;text-decoration:none}
    .login-footer a:hover{color:#fff}
  </style>
</head>
<body>
  <div class="login-wrapper">
    <div class="login-brand">
      <div class="login-brand-icon">C</div>
      <h1>Cahit Admin</h1>
      <p>Admin Dashboard</p>
    </div>
    <div class="login-card">
      <h2>Welcome back</h2>
      <p class="subtitle">Sign in to your admin account</p>
      <div class="error-msg" id="errorMsg" data-testid="text-login-error"></div>
      <form id="loginForm" autocomplete="on">
        <div class="form-group">
          <label class="form-label" for="username">Username or Email</label>
          <input class="form-input" type="text" id="username" name="username" placeholder="admin@cahitcontracting.com" required autocomplete="username" data-testid="input-username" />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <div class="input-wrapper">
            <input class="form-input" type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password" data-testid="input-password" />
            <button type="button" class="toggle-password" id="togglePw" data-testid="button-toggle-password">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="remember-row">
          <label class="remember-label">
            <input type="checkbox" id="remember" data-testid="input-remember" />
            Remember me
          </label>
        </div>
        <button type="submit" class="btn-login" id="loginBtn" data-testid="button-login">Sign In</button>
      </form>
    </div>
    <div class="login-footer">
      <a href="<?php echo defined('ABSPATH') ? esc_url(home_url('/')) : '/'; ?>">&larr; Back to website</a>
    </div>
  </div>

  <script>
  (function() {
    var form = document.getElementById('loginForm');
    var errorMsg = document.getElementById('errorMsg');
    var togglePw = document.getElementById('togglePw');
    var pwField = document.getElementById('password');

    if (sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token')) {
      window.location.href = '/admin';
    }

    togglePw.addEventListener('click', function() {
      var type = pwField.type === 'password' ? 'text' : 'password';
      pwField.type = type;
      this.innerHTML = type === 'password'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var username = document.getElementById('username').value.trim();
      var password = document.getElementById('password').value;
      var remember = document.getElementById('remember').checked;
      var btn = document.getElementById('loginBtn');

      errorMsg.classList.remove('show');
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      fetch('/admin/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          var storage = remember ? localStorage : sessionStorage;
          storage.setItem('cahit_admin_token', data.token);
          window.location.href = '/admin';
        } else {
          errorMsg.textContent = data.message || 'Invalid credentials';
          errorMsg.classList.add('show');
          document.getElementById('password').classList.add('error');
          btn.disabled = false;
          btn.textContent = 'Sign In';
        }
      })
      .catch(function() {
        errorMsg.textContent = 'Connection error. Please try again.';
        errorMsg.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Sign In';
      });
    });
  })();
  </script>
</body>
</html>
