# FiTEN Business Directory — Security & GDPR Compliance

*Last updated: June 2026*

---

## Overview

The FiTEN Business Directory is built with privacy and security as first-class concerns. This document summarises the technical controls in place, suitable for use in product launch materials, due diligence reviews, or partner onboarding.

---

## GDPR Compliance

### Legal Basis for Processing

Business listings are collected under two lawful bases:

- **Consent** — submitters tick an explicit GDPR consent checkbox before submitting. The consent timestamp is stored alongside the submission in Firestore.
- **Legitimate interest** — a public business directory serves the legitimate interest of connecting the global Tamil business community (US, Canada, UK, India, Singapore, and beyond), with minimal intrusion into personal life.

### Data Minimisation

Only data necessary for a business directory is collected:

| Field | Purpose |
|---|---|
| Business name, category, city | Directory display and filtering |
| Email | Email verification, owner contact |
| Phone, website | Optional contact methods |
| Description | Business context |

No tracking pixels, no behavioural profiling, no third-party ad networks.

### Email Verification (Proof of Ownership)

Every listing submission triggers a **cryptographic email verification flow**:

1. A 256-bit random token (`crypto.randomBytes(32)`) is generated at submission time.
2. A verification link containing the token is emailed to the submitter.
3. The link expires in **48 hours**.
4. On click, the token is matched server-side; the listing is activated only after verification.
5. Unverified listings remain in `pending` status and are never shown publicly.

This ensures the email address in every live listing is genuinely controlled by the submitter.

### Right to Erasure (Article 17)

Admins can **permanently delete** any listing from the admin panel. Hard delete removes the Firestore document entirely — data is not merely flagged or hidden, it is gone.

Every hard delete is recorded in the `gdpr_log` audit collection (see below).

### Admin Edit Controls

Admins can correct inaccurate data in any listing (Article 5(1)(d) — accuracy principle). All edits are logged with a record of which fields were changed.

### GDPR Audit Log

A dedicated `gdpr_log` Firestore collection records every admin action that touches personal data:

```
{
  action:        "hard_delete" | "admin_edit"
  businessId:    string
  businessName:  string
  email:         string       // data subject identifier
  adminUid:      string       // who performed the action
  adminEmail:    string
  changedFields: string[]     // (edit only) which fields were modified
  timestamp:     Firestore ServerTimestamp
}
```

This log provides an auditable trail to demonstrate compliance with Right to Erasure requests and data accuracy obligations.

**Access:** The `gdpr_log` collection is protected by Firestore security rules — readable and writable only by authenticated admin accounts. No public access.

### Privacy Policy & Terms

Full Privacy Policy and Terms of Service are published at `/privacy` and `/terms` respectively, covering:
- What data is collected and why
- How long it is retained
- User rights (access, correction, erasure, portability)
- Contact information for data subject requests

---

## Security Controls

### Input Sanitisation

All user-submitted strings are sanitised before being written to Firestore:

- **HTML tag stripping** — `<script>`, `<img>`, and all other tags are removed, preventing stored XSS.
- **URL validation** — website and logo URL fields are parsed with the native `URL` constructor; only `http://` and `https://` protocols are accepted.
- **Email format validation** — RFC-compliant regex plus a 254-character length cap.
- **Field length limits** — business name capped at 120 characters, description at 1,000 characters.
- **Enum allowlisting** — `category` is validated against a fixed allowlist of 19 values; `looking` array values are filtered to the four permitted options.

### Rate Limiting

All write and verification endpoints are rate-limited per IP address:

| Endpoint | Limit |
|---|---|
| `POST /api/submit-business` | 5 requests / 60 seconds |
| `POST /api/submit-claim` | 5 requests / 60 seconds |
| `GET /api/verify-listing` | 10 requests / 60 seconds |

Rate limiting prevents spam submissions, brute-force token guessing on verification links, and basic denial-of-service against the API.

### Bot Protection (reCAPTCHA v3)

The business submission form is protected by **Google reCAPTCHA v3**, which runs invisibly in the background and scores submissions for bot-like behaviour. Submissions from preview deployments bypass reCAPTCHA automatically (safe — preview writes are blocked at the Firestore rules level).

### Firestore Security Rules

All database access is governed by server-enforced Firestore security rules:

- **Public listings** — read-only, no authentication required.
- **New submissions** — require authentication; `status` must be `pending`; `verified` and `verificationStatus` fields cannot be set by the client.
- **Updates** — admin: full update rights. Listing owner: can edit own listing but cannot change `status`, `verified`, `verificationStatus`, or `pro`. Anyone: can increment the `views` counter only.
- **Deletions** — admin only.
- **`gdpr_log`** — admin read/write only.
- **`rate_limits`** — admin read/write only.
- **`claims`** — authenticated users can create; admin can read and update.

### Authentication

Admin access uses **Firebase Authentication with Google Sign-In** combined with **Firebase Custom Claims**. Admin status (`admin: true`) is set server-side via the Firebase Admin SDK and embedded in the JWT — it cannot be self-granted by any client.

Admin identity is verified on every admin API call by decoding the Firebase ID token using Google's public JWKS endpoint (`jose` library), with issuer and audience validation.

### Claim Verification Flow

When a user claims an existing listing:

1. A claim document is created in Firestore with a 256-bit token and 48-hour expiry.
2. A verification email is sent to the email address on the listing.
3. Only after the link is clicked does the claim become verifiable by an admin.

This prevents anyone from fraudulently claiming a listing belonging to someone else.

### Domain Trust Signals

At submission time, the system checks whether the submitter's email domain matches their stated website domain (e.g. `alice@acme.ca` + `https://acme.ca`). Matches are stored as `domainVerified: true` and displayed as a trust badge in the admin panel, helping admins prioritise review.

### Data in Transit

All traffic is served over HTTPS (enforced by Vercel). Firestore connections use TLS. Verification tokens are never logged or exposed in URLs beyond the single-use email link.

### Preview Deployment Write Guard

Every non-production (preview) deployment blocks all form submissions at the application layer:

- Submission forms display "Form submissions are disabled on preview deployments."
- The amber preview banner at the top of every page identifies the environment.

This ensures test activity can never pollute the production Firestore database.

---

## Infrastructure

| Layer | Provider |
|---|---|
| Hosting & serverless functions | Vercel (Canada/US edge) |
| Database | Google Cloud Firestore (multi-region) |
| Authentication | Firebase Authentication |
| Transactional email | Resend |
| Bot protection | Google reCAPTCHA v3 |

---

## Contact

For data subject requests (access, correction, erasure) or security disclosures, contact the FiTEN directory administrator at the address published in the Privacy Policy.
