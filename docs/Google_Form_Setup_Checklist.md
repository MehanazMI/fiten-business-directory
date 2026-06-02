# FiTEN Google Form Setup Checklist

## Form Title & Description

**Form Title:** Add Your Business to FiTEN

**Form Description:**
> The FiTEN Tamil Business Directory connects Tamil entrepreneurs and businesses globally. Get listed today to reach thousands of community members searching for your services.
>
> **What happens next?** We'll verify your email and send a confirmation code to your phone. Once verified, your listing goes live immediately.

---

## Form Settings

**Before adding fields, configure these settings:**

- [ ] **General → Collect email addresses:** ON ⭐ (REQUIRED - users must sign into Google to submit)
- [ ] **General → Response receipts:** Send responders a copy of their response
- [ ] **Responses → Limit to 1 response:** ON (prevents duplicate submissions from same user)
- [ ] **Presentation → Show progress bar:** ON (helps users see how many fields left)
- [ ] **Presentation → Shuffle question order:** OFF (keep logical flow)

**⚠️ Important:** With "Collect email addresses" enabled, users MUST sign into their Google account to submit. This prevents spam and gives you verified emails automatically.

---

## Form Fields (In Order)

### 1. Business Name
- **Field type:** Short answer
- **Question:** Business name
- **Help text:** What is your business officially called?
- **Required:** YES
- **Validation:** None needed

### 2. Category
- **Field type:** Multiple choice (dropdown preferred)
- **Question:** What category best describes your business?
- **Options:**
  - Health & Wellness
  - Professional Services
  - Technology & IT
  - Transportation & Logistics
  - Grocery & Food Retail
  - Cooking Services & Catering
  - Restaurants & Food
  - Real Estate
  - Education & Tutoring
  - Childcare & Nanny Services
  - Beauty & Personal Care
  - Financial Services
  - Entertainment & Culture
  - Manufacturing & Industrial
  - Home Services
  - Other
- **Required:** YES
- **Validation:** None needed

### 3. Email Address (OPTIONAL - For Confirmation Only)
- **Field type:** Short answer
- **Question:** Confirm your email
- **Help text:** Your email is automatically captured from your Google account. Confirm it here if needed.
- **Required:** NO
- **Validation:** None
- **Note:** Since "Collect email addresses" is enabled in settings, the user's email is automatically saved. This field is just for user confirmation/awareness.

### 4. Phone Number
- **Field type:** Short answer
- **Question:** Phone number
- **Help text:** We'll send a verification code here via SMS (international format: +1 555 000 0000)
- **Required:** YES
- **Validation:**
  - Regular expression: `^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$`
  - Error message: "Please enter a valid phone number"

### 5. City/Location
- **Field type:** Short answer
- **Question:** City or neighborhood where your business operates
- **Help text:** Where are you primarily located?
- **Required:** YES
- **Validation:** None needed

### 6. Business Description
- **Field type:** Paragraph text
- **Question:** Tell us about your business
- **Help text:** What do you do? Who do you serve? (50-300 characters recommended)
- **Required:** YES
- **Validation:** None (but note character count in help text)

### 7. Website (Optional)
- **Field type:** Short answer
- **Question:** Website or social media
- **Help text:** Leave blank if you don't have one (e.g., https://www.example.com or Instagram: @yourprofile)
- **Required:** NO
- **Validation:** None needed

### 8. Agreement
- **Field type:** Multiple choice (checkbox)
- **Question:** I agree to the following:
- **Options:**
  - My business information will be published on fiten.org after email and phone verification
- **Required:** YES
- **Validation:** None needed

---

## Confirmation & Response Settings

### Confirmation Message
**After submission, show:**
> **Your listing request received!**
>
> Thank you for joining FiTEN. Here's what happens next:
>
> 1. **Check your email** — Look for a verification link (check spam folder)
> 2. **Verify your phone** — You'll receive an SMS code
> 3. **Go live** — Your listing appears on fiten.org immediately after verification
>
> Questions? Reply to the confirmation email.

---

## Google Form Link Setup

- [ ] Create the form (make it public, allow anyone with link to view)
- [ ] Get the share link: `https://forms.gle/[your-code]`
- [ ] Copy link to clipboard
- [ ] Create short link: use bit.ly or goo.gl → `bit.ly/fitenbusiness` (shorter for marketing)

---

## After Form Submission (Manual Process)

**When you receive a response:**

1. ✅ **Check the response** — Verify data looks legitimate
2. ✅ **Send email verification** — Email them a unique verification link/code
3. ✅ **Send SMS code** — Text them a 6-digit code
4. ✅ **Wait for confirmations** — Once both verified, mark as "approved" in your spreadsheet
5. ✅ **Publish listing** — Add to the directory (when your website is ready, this becomes automatic)

**Optional:** Add a helper column in Google Sheets
- Email Verified? (Yes/No)
- Phone Verified? (Yes/No)
- Status (Pending / Approved / Published)
- Notes

---

## Marketing Your Form Link

**Use these in your marketing:**
- Email: "List your business: [link]"
- Social media: "Add your business to FiTEN 👉 [link]"
- Website: "Add Your Business" button linking to form

---

## Transition Plan (When Real Website Ready)

1. **Keep collecting** via Google Form while building website
2. **Export responses** from Google Sheets → CSV
3. **Migrate data** to new website database
4. **Notify users** that the new form is live
5. **Keep Google Form** as fallback option (optional)

