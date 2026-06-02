# FiTEN Business Directory

A Tamil business network directory connecting entrepreneurs and businesses globally.

**Live Site:** https://fiten.org

---

## 📁 Folder Structure

```
├── index.html                  Main homepage (v4 complete mockup)
├── form.html                   Business signup form
├── public/
│   └── assets/                 Static assets (images, etc.)
├── docs/                       Design documentation
│   ├── DESIGN_SYSTEM.md
│   ├── V4_SUMMARY.md
│   ├── Google_Form_Setup_Checklist.md
│   └── ...
├── archive/                    Historical versions
│   ├── mockups/               Previous mockup versions (v1-v3)
│   └── proposals/             Old proposal documents
├── vercel.json                Vercel deployment config
├── .gitignore                 Git ignore rules
└── README.md                  This file
```

---

## 🚀 Deployment

### Vercel
This project is optimized for Vercel static hosting.

```bash
# Push to GitHub, Vercel auto-deploys
git push origin master
```

**Vercel will:**
- Detect static HTML site
- Deploy instantly (no build needed)
- Serve from our domain at fiten.org
- Provide HTTPS & CDN automatically

---

## 📄 Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main directory homepage |
| `form.html` | Business signup form |
| `docs/DESIGN_SYSTEM.md` | Complete design specification |
| `docs/V4_SUMMARY.md` | Project overview & features |
| `archive/` | Historical mockups & proposals |

---

## ✨ Features (v4)

- Clean, modern interface
- Business card grid with filters
- Search & category browsing
- B2B signals (hiring, partnerships, investment, clients)
- Verified badge system
- Bilingual support (English / Tamil)
- Responsive mobile design
- Dark mode support
- Business detail pages
- Signup/claim business forms

---

## 🔄 Routing

- `/` → index.html (homepage)
- `/form` → form.html (signup)
- All other routes → index.html (for future SPA expansion)

---

## 📝 Next Steps

1. **Verify on Vercel** — Domain should point to fiten.org
2. **Google Form** — Set up data collection using form.html
3. **Database** — Connect to backend for business listings
4. **Migrate to Framework** — Convert to Next.js for dynamic content
5. **Add API** — Build admin panel for business management

---

## 👤 Author

Built for FiTEN Tamil Business Network

---

## 📖 More Info

See `docs/` folder for detailed design specifications and setup guides.
