# Admin Lockout Prevention — What Was Built

**Site:** cahitcontracting.com (admin panel at `/admin`)
**Date:** 19 May 2026
**Goal:** Make sure the admin (you) can always get back into the dashboard, even if a password is forgotten, without needing to wait on a developer.

---

## 1. Self-serve "Forgot password?" on the login screen

A **Forgot password?** link now sits right under the password field on the admin login page.

**How it works for you:**
1. Go to `https://cahitcontracting.com/admin/login`.
2. Click **Forgot password?**.
3. Type your username (or your email) and press **Send reset link**.
4. A one-time reset link is emailed to the recovery address(es) on file.
5. Open the email, click the link, choose a new password.
6. You're back in immediately.

**Key guarantees:**
- The reset link is valid for **1 hour** only, then expires automatically.
- The link can be used **only once**. After you set a new password, that link is dead.
- As soon as you reset the password, **all other devices that were signed in are signed out**. If someone else had your account open, they lose access.

---

## 2. Recovery emails — who gets the reset link

By default, every reset link is sent to **both** of these addresses at the same time:

- `ctc@cahitcontracting.com` (primary company inbox)
- `twolf.om@gmail.com` (personal backup)

This way, even if one mailbox is unreachable (server problem, password change, holiday), the link still arrives at the other one.

**You can change these addresses yourself** at any time:

1. Sign in to `/admin`.
2. Go to **Settings**.
3. Find the **"Password Recovery Emails"** section.
4. Enter one or more email addresses separated by commas.
5. Click **Save recovery emails**.

> Tip: keep at least two addresses listed — ideally one company email and one personal email you control. Never list only one.

---

## 3. Multiple admin accounts — backup recovery path

The dashboard now supports more than one admin user. If you ever can't access the reset email for some reason, a **second admin** can sign in and reset your password directly from inside the dashboard.

- **Settings → Admin Users & Recovery** lists every admin account.
- A second admin types in their own current password (to confirm it's really them), then sets a new password for the locked-out admin.
- The locked-out admin is signed out of all devices, then signs in with the new password.

This means there are now **three independent ways back into the account**:
1. You remember your password — sign in normally.
2. You forgot your password — use **Forgot password?** to email yourself a reset link.
3. Email is also unreachable — ask the second admin to reset your password from inside the dashboard.

---

## 4. Two admins on the same screen — live "Follow" mode

When more than one admin is signed in at the same time, the dashboard now shows you in real time. This is useful when you want a developer or a colleague to watch what you're doing — for training, troubleshooting, or just so they can see exactly which page you're stuck on.

**What you'll see:**
- A small **green pill at the top of the dashboard** showing who else is online right now (e.g. *"Tahir — editing Home page"*).
- Next to each other admin's name, three buttons:
  - **Follow** — your screen automatically jumps to the same page/section they're looking at. As they move around, your view moves with them.
  - **Stop** — stops following.
  - **Switch** — jump to their screen once, but don't keep following.

**What this means in practice:**
- You can call the developer, say "I'm stuck on this page", and they hit **Follow** — now they see exactly what you see, live, without needing screen-share software, Zoom, or screenshots.
- It works the other way too: if the developer is fixing something, you can hit **Follow** on their name and watch them work.
- There's also a **"View each other's screen — how it works"** help button in the dashboard header that explains this to anyone new.

**Privacy note:** Follow mode only shows which **admin page/section** the other person is viewing — it does not share keystrokes, mouse clicks, or anything they type. It's a "look over the shoulder" view, not full remote control.

---

## 5. Security — making sure only you (not an attacker) can use this

The reset feature is a popular target for attackers, so it was hardened before going live:

- **Reset links can only point to the real site** (`cahitcontracting.com`). An attacker cannot trick the system into sending a link that points to a fake lookalike domain.
- **Rate limiting:** the system blocks abuse if someone tries to spam reset requests (max 8 attempts per IP and 4 per username every 15 minutes).
- **No information leak:** the page always shows the same "If that account exists, a reset link has been sent" message. An outsider cannot use this form to figure out which usernames or emails exist on your system.
- **One-time tokens:** each reset link is unique, expires after 1 hour, and stops working the moment it's used.
- **Automatic sign-out after reset:** when a password is changed, every active session for that account is killed. If anyone was already signed in on another device, they lose access immediately.
- **Resend** (a reputable transactional email service) is used to deliver the reset emails — they arrive reliably and look professional.

---

## 6. Quick reference card (print or save this)

| If you... | Do this |
|---|---|
| Forgot your password | `/admin/login` → **Forgot password?** → check `ctc@cahitcontracting.com` or `twolf.om@gmail.com` |
| Want to change which emails receive reset links | Sign in → **Settings → Password Recovery Emails** |
| Want to add a second admin who can reset you | Sign in → **Settings → Admin Users & Recovery** |
| Lost access to BOTH recovery emails | Ask the second admin to reset your password from inside `/admin` |
| Want a developer to see your screen live | They sign in to `/admin`, click **Follow** next to your name in the green pill at the top |
| Want to watch what the developer is doing | Click **Follow** next to their name in the green pill at the top |
| Need to sign out a stolen/forgotten device | **Settings → Active Sessions** → revoke that device |

---

## 7. What you should do once

To make sure this is fully in place for you:

1. Sign in to `/admin` at least once and confirm the password works (`admin` / `cahit2024` unless you've already changed it).
2. **Change the default password** to something only you know — **Settings → Account Security**.
3. Open **Settings → Password Recovery Emails** and confirm both `ctc@cahitcontracting.com` and `twolf.om@gmail.com` are listed. Add a third address if you want extra safety.
4. Do **one test run**: log out, click **Forgot password?**, and confirm the email arrives. (You don't have to actually reset — just confirm the email lands.)

After that, you're protected. You will never need to wait for a developer to recover your account again.

---

**Contact for anything not covered:** the developer (Tahir) can be reached at `twolf.om@gmail.com`.
