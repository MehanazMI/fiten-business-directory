# FiTEN Business Directory — Manual Setup Guide

This document covers every manual step needed to run this project from scratch.
Follow it top to bottom when setting up a new Firebase project, new domain, or new Vercel project.

---

## 1. Firebase Console

### 1A. Create or select a project
- Go to [console.firebase.google.com](https://console.firebase.google.com)
- Create a new project (or select existing: **fiten-business-directory**)
- Note the **Project ID** — used in all env vars below

### 1B. Register a Web App
- Project Overview → Add App → Web
- Give it a name (e.g. "FiTEN Web")
- Copy the config values — you'll need these 4:
  ```
  apiKey, authDomain, projectId, appId
  ```

### 1C. Enable Firestore
- Build → Firestore Database → Create database
- Choose **production mode** (rules deployed separately)
- Region: `us-central` (or nearest)

### 1D. Deploy Firestore security rules
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```
Rules live in `firestore.rules`. Re-deploy after every rule change.

### 1E. Enable Firebase Authentication
- Build → Authentication → Get started
- Sign-in method → Enable **Google**
- Set Project support email (your admin email)

### 1F. Add authorized domains for Auth
- Authentication → Settings → Authorized domains
- Add every domain where Google sign-in runs:
  ```
  fiten-directory.vercel.app
  fiten-business-directory.vercel.app
  fiten-directory.com          ← add when custom domain is live
  localhost                    ← already there by default
  ```
- **When switching domains:** add the new domain here BEFORE deploying. Removing the old domain is optional but keeps the list clean.

### 1G. Enable Firebase Storage
- Build → Storage → Get started
- Choose production mode
- Region: same as Firestore
- Deploy storage rules if you have a `storage.rules` file:
  ```bash
  firebase deploy --only storage:rules
  ```

### 1H. Create a Service Account (for Admin SDK)
- Project Settings (⚙️) → Service accounts
- Firebase Admin SDK → Generate new private key
- Download the JSON file
- **Extract these 3 values** and add to env vars (see Section 3):
  - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
  - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`
- **Delete the JSON file immediately** after extracting — never commit it

### 1I. Grant admin custom claim to a user
Run once per admin user (requires service account set up):
```bash
npm run set-admin rasheed.comm@gmail.com
```
This sets `{ admin: true }` as a custom claim on the Firebase Auth token.
The user must sign out and back in for the claim to take effect.

---

## 2. Google reCAPTCHA v3 (Classic)

Use the **classic reCAPTCHA v3** — it's free with no usage limits. Do not use reCAPTCHA Enterprise (it requires billing and charges above 10k assessments/month).

- Go to [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
- Click **+** to create a new site:
  - Type: **reCAPTCHA v3**
  - Domains: add all your domains:
    ```
    localhost
    fiten-directory.vercel.app
    fiten-business-directory.vercel.app
    fiten-directory.com          ← add when live
    ```
- Copy the **Site Key** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Copy the **Secret Key** → `RECAPTCHA_SECRET_KEY`
- **When switching domains:** add the new domain here. Keys stay the same.
- **Rotate secret key** if it was ever exposed: reCAPTCHA admin → your site → Settings → Rotate secret key → update `RECAPTCHA_SECRET_KEY` in Vercel

---

## 3. Environment Variables

### 3A. Local development (`.env.local`)
Copy this template and fill in the values:
```bash
# Firebase client SDK (from Firebase Console → Project Settings → Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# reCAPTCHA v3 classic (from google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Firebase Admin SDK (from service account JSON — server-only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Uncomment to run against local Firestore emulator:
# NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
```

### 3B. Vercel (production + preview)
Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Environments | Notes |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Production, Preview, Development | Public — safe in browser |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production, Preview, Development | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production, Preview, Development | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Production, Preview, Development | |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Production, Preview | Public — safe in browser |
| `RECAPTCHA_SECRET_KEY` | Production only | Server secret — never `NEXT_PUBLIC_` |
| `FIREBASE_ADMIN_PROJECT_ID` | Production only | Server secret |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Production only | Server secret |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Production only | Paste the full `-----BEGIN PRIVATE KEY-----...` string |

Via CLI (from repo root, after `vercel link`):
```bash
vercel env add RECAPTCHA_SECRET_KEY production --value "YOUR_VALUE" --yes
vercel env add FIREBASE_ADMIN_PROJECT_ID production --value "YOUR_PROJECT_ID" --yes
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production --value "YOUR_EMAIL" --yes
# For private key — pipe via stdin to avoid shell escaping issues:
echo "YOUR_PRIVATE_KEY" | vercel env add FIREBASE_ADMIN_PRIVATE_KEY production --yes
```

---

## 4. Vercel Project Setup

### 4A. Link repo
- Go to [vercel.com](https://vercel.com) → New Project → Import Git Repository
- Select `MehanazMI/fiten-business-directory`
- Framework: **Next.js** (auto-detected)
- Root directory: `/` (repo root)

### 4B. Link CLI
```bash
npm i -g vercel
vercel login
vercel link --project fiten-business-directory --scope mehanazmis-projects
```

### 4C. Domain configuration
- Vercel → Project → Settings → Domains
- Add custom domain and configure DNS (CNAME/A records per Vercel instructions)
- After adding domain: go back to Firebase → Authentication → Authorized domains and add it (Section 1F)
- Also add to reCAPTCHA admin panel (Section 2)

---

## 5. When Switching Firebase Projects

1. Create new Firebase project (Section 1A–1H)
2. Update `.env.local` with new project's values
3. Update Vercel env vars (Section 3B) with new values
4. Re-deploy Firestore rules to new project: `firebase use NEW_PROJECT_ID && firebase deploy --only firestore:rules`
5. Re-run admin claim script for each admin user (Section 1I)
6. Update reCAPTCHA domains if project URL changes (Section 2)

---

## 6. When Switching Domains

1. Add new domain to Vercel (Section 4C)
2. Add new domain to Firebase Auth → Authorized domains (Section 1F)
3. Add new domain to reCAPTCHA admin panel (Section 2)
4. Update reCAPTCHA site registration domains if not using wildcard
5. No env var changes needed (domain is not stored in env vars)

---

## 7. Current Configuration

| Setting | Value |
|---|---|
| Firebase project | `fiten-business-directory` |
| Vercel project | `fiten-business-directory` (under `mehanazmis-projects`) |
| Production URL | `fiten-directory.vercel.app` |
| Preview URL pattern | `fiten-business-directory-git-<branch>-mehanazmis-projects.vercel.app` |
| reCAPTCHA site | Registered for `*.vercel.app` + `localhost` |
| Admin user | `rasheed.comm@gmail.com` |
| Firebase Auth domain | `fiten-business-directory.firebaseapp.com` |
| Authorized domains | `fiten-directory.vercel.app`, `fiten-business-directory.vercel.app`, `localhost` |
