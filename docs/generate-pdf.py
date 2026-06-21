"""
Generates FiTEN Business Directory — Product Launch 2026 PDF
A clean, readable 5-page pitch document (not a slide deck).
Run: py generate-pdf.py
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

# ── COLOURS ──────────────────────────────────────────────────
NAVY   = colors.HexColor("#0D2340")
GOLD   = colors.HexColor("#C8972A")
GOLD_L = colors.HexColor("#F5E9CC")
MUTED  = colors.HexColor("#6B7280")
BG     = colors.HexColor("#F8FAFC")
GREEN  = colors.HexColor("#10B981")
RED    = colors.HexColor("#EF4444")
WHITE  = colors.white
TEXT   = colors.HexColor("#111827")

# ── STYLES ───────────────────────────────────────────────────
def styles():
    return {
        "eyebrow": ParagraphStyle("eyebrow",
            fontName="Helvetica-Bold", fontSize=9,
            textColor=GOLD, spaceAfter=6, leading=12,
            letterSpacing=1.5),

        "h1": ParagraphStyle("h1",
            fontName="Helvetica-Bold", fontSize=28,
            textColor=NAVY, spaceAfter=6, leading=32),

        "h1_gold": ParagraphStyle("h1_gold",
            fontName="Helvetica-Bold", fontSize=28,
            textColor=GOLD, spaceAfter=6, leading=32),

        "tagline": ParagraphStyle("tagline",
            fontName="Helvetica", fontSize=13,
            textColor=MUTED, spaceAfter=16, leading=18),

        "section_label": ParagraphStyle("section_label",
            fontName="Helvetica-Bold", fontSize=9,
            textColor=GOLD, spaceAfter=8, leading=12,
            letterSpacing=1.5),

        "h2": ParagraphStyle("h2",
            fontName="Helvetica-Bold", fontSize=18,
            textColor=NAVY, spaceAfter=4, leading=22),

        "h3": ParagraphStyle("h3",
            fontName="Helvetica-Bold", fontSize=13,
            textColor=NAVY, spaceAfter=3, leading=17),

        "body": ParagraphStyle("body",
            fontName="Helvetica", fontSize=11,
            textColor=TEXT, spaceAfter=10, leading=17,
            alignment=TA_JUSTIFY),

        "body_muted": ParagraphStyle("body_muted",
            fontName="Helvetica", fontSize=11,
            textColor=MUTED, spaceAfter=8, leading=16),

        "quote": ParagraphStyle("quote",
            fontName="Helvetica-Oblique", fontSize=12,
            textColor=NAVY, spaceAfter=12, leading=18,
            leftIndent=14, borderPad=10),

        "bullet": ParagraphStyle("bullet",
            fontName="Helvetica", fontSize=11,
            textColor=TEXT, spaceAfter=5, leading=16,
            leftIndent=16, bulletIndent=0),

        "small": ParagraphStyle("small",
            fontName="Helvetica", fontSize=9,
            textColor=MUTED, spaceAfter=4, leading=13),

        "footer": ParagraphStyle("footer",
            fontName="Helvetica", fontSize=8,
            textColor=MUTED, leading=11),

        "center": ParagraphStyle("center",
            fontName="Helvetica", fontSize=11,
            textColor=TEXT, spaceAfter=8, leading=16,
            alignment=TA_CENTER),

        "stat_num": ParagraphStyle("stat_num",
            fontName="Helvetica-Bold", fontSize=22,
            textColor=GOLD, spaceAfter=2, leading=26,
            alignment=TA_CENTER),

        "stat_label": ParagraphStyle("stat_label",
            fontName="Helvetica", fontSize=9,
            textColor=WHITE, spaceAfter=0, leading=13,
            alignment=TA_CENTER),

        "stat_src": ParagraphStyle("stat_src",
            fontName="Helvetica-Oblique", fontSize=8,
            textColor=colors.HexColor("#9CA3AF"), spaceAfter=0, leading=11,
            alignment=TA_CENTER),

        "card_title": ParagraphStyle("card_title",
            fontName="Helvetica-Bold", fontSize=12,
            textColor=NAVY, spaceAfter=3, leading=15),

        "card_body": ParagraphStyle("card_body",
            fontName="Helvetica", fontSize=10.5,
            textColor=MUTED, spaceAfter=0, leading=15),
    }

S = styles()

# ── HELPERS ──────────────────────────────────────────────────
def rule(color=GOLD, thickness=1.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=12, spaceBefore=0)

def top_bar():
    return Table([[""]], colWidths=["100%"], rowHeights=[5],
        style=TableStyle([("BACKGROUND", (0,0), (-1,-1), NAVY),
                          ("LINEABOVE", (0,0), (-1,-1), 2, GOLD)]))

def stat_block(num, label, src):
    data = [
        [Paragraph(num,   S["stat_num"])],
        [Paragraph(label, S["stat_label"])],
        [Paragraph(src,   S["stat_src"])],
    ]
    t = Table(data, colWidths=["100%"])
    t.setStyle(TableStyle([
        ("BACKGROUND",  (0,0), (-1,-1), NAVY),
        ("ROUNDEDCORNERS", [8]),
        ("TOPPADDING",  (0,0), (-1,-1), 12),
        ("BOTTOMPADDING",(0,0),(-1,-1), 12),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING",(0,0), (-1,-1), 8),
    ]))
    return t

def card(icon, title, desc, bar_color=GOLD):
    inner = Table([
        [Paragraph(f"<b>{title}</b>", S["card_title"])],
        [Paragraph(desc, S["card_body"])],
    ], colWidths=["100%"])
    inner.setStyle(TableStyle([
        ("TOPPADDING",   (0,0),(-1,-1), 0),
        ("BOTTOMPADDING",(0,0),(-1,-1), 0),
        ("LEFTPADDING",  (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 0),
    ]))
    row = Table([[icon, inner]], colWidths=[0.35*inch, None])
    row.setStyle(TableStyle([
        ("VALIGN",       (0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",  (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 0),
        ("TOPPADDING",   (0,0),(-1,-1), 0),
        ("BOTTOMPADDING",(0,0),(-1,-1), 0),
    ]))
    outer = Table([[row]], colWidths=["100%"])
    outer.setStyle(TableStyle([
        ("BACKGROUND",   (0,0),(-1,-1), BG),
        ("ROUNDEDCORNERS",[8]),
        ("TOPPADDING",   (0,0),(-1,-1), 10),
        ("BOTTOMPADDING",(0,0),(-1,-1), 10),
        ("LEFTPADDING",  (0,0),(-1,-1), 12),
        ("RIGHTPADDING", (0,0),(-1,-1), 12),
        ("LINEBEFORE",   (0,0),(0,-1),  4, bar_color),
    ]))
    return outer

def check_row(text):
    return Table(
        [[Paragraph("✓", ParagraphStyle("ck", fontName="Helvetica-Bold", fontSize=11,
                                         textColor=WHITE, alignment=TA_CENTER, leading=14)),
          Paragraph(text, S["body"])]],
        colWidths=[0.28*inch, None],
        style=TableStyle([
            ("BACKGROUND",   (0,0),(0,-1), GREEN),
            ("ROUNDEDCORNERS",[12]),
            ("VALIGN",       (0,0),(-1,-1),"MIDDLE"),
            ("TOPPADDING",   (0,0),(-1,-1), 3),
            ("BOTTOMPADDING",(0,0),(-1,-1), 3),
            ("LEFTPADDING",  (0,0),(0,-1),  3),
            ("RIGHTPADDING", (0,0),(0,-1),  3),
            ("LEFTPADDING",  (1,0),(1,-1), 10),
        ])
    )

def highlight_box(label, text):
    content = Table([
        [Paragraph(label.upper(), S["section_label"])],
        [Paragraph(text, S["body"])],
    ], colWidths=["100%"])
    content.setStyle(TableStyle([
        ("TOPPADDING",   (0,0),(-1,-1), 0),
        ("BOTTOMPADDING",(0,0),(-1,-1), 0),
        ("LEFTPADDING",  (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 0),
    ]))
    outer = Table([[content]], colWidths=["100%"])
    outer.setStyle(TableStyle([
        ("BACKGROUND",   (0,0),(-1,-1), GOLD_L),
        ("ROUNDEDCORNERS",[8]),
        ("TOPPADDING",   (0,0),(-1,-1), 14),
        ("BOTTOMPADDING",(0,0),(-1,-1), 14),
        ("LEFTPADDING",  (0,0),(-1,-1), 16),
        ("RIGHTPADDING", (0,0),(-1,-1), 16),
        ("LINEBEFORE",   (0,0),(0,-1),  4, GOLD),
    ]))
    return outer

def vision_box(label, text):
    content = Table([
        [Paragraph(label.upper(), ParagraphStyle("vl", fontName="Helvetica-Bold", fontSize=9,
                                                  textColor=GOLD, spaceAfter=6, leading=12, letterSpacing=1.5))],
        [Paragraph(text, ParagraphStyle("vb", fontName="Helvetica", fontSize=11,
                                         textColor=colors.HexColor("#E5E7EB"), spaceAfter=0, leading=17,
                                         alignment=TA_JUSTIFY))],
    ], colWidths=["100%"])
    content.setStyle(TableStyle([
        ("TOPPADDING",   (0,0),(-1,-1), 0),
        ("BOTTOMPADDING",(0,0),(-1,-1), 0),
        ("LEFTPADDING",  (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 0),
    ]))
    outer = Table([[content]], colWidths=["100%"])
    outer.setStyle(TableStyle([
        ("BACKGROUND",   (0,0),(-1,-1), NAVY),
        ("ROUNDEDCORNERS",[10]),
        ("TOPPADDING",   (0,0),(-1,-1), 16),
        ("BOTTOMPADDING",(0,0),(-1,-1), 16),
        ("LEFTPADDING",  (0,0),(-1,-1), 20),
        ("RIGHTPADDING", (0,0),(-1,-1), 20),
    ]))
    return outer

def page_header(num, label, title, subtitle):
    return [
        Table([[
            Paragraph(f"<font color='#C8972A'><b>{num}</b></font>", S["section_label"]),
            Paragraph(f"&nbsp;&nbsp;|&nbsp;&nbsp;{label}", S["section_label"]),
        ]], colWidths=[0.35*inch, None],
        style=TableStyle([
            ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
        ])),
        Paragraph(title, S["h2"]),
        Paragraph(subtitle, S["body_muted"]),
        rule(),
    ]

# ── DOCUMENT ─────────────────────────────────────────────────
OUT = r"C:\Users\rashe\Documents\Claude\Projects\Fiten-business-directory\docs\FiTEN-BusinessDirectory-ProductLaunch-2026.pdf"

doc = SimpleDocTemplate(
    OUT,
    pagesize=letter,
    leftMargin=0.85*inch,
    rightMargin=0.85*inch,
    topMargin=0.7*inch,
    bottomMargin=0.65*inch,
)

W = letter[0] - 1.7*inch   # usable width

story = []

# ══════════════════════════════════════════════════════════════
# PAGE 1 — COVER
# ══════════════════════════════════════════════════════════════
story.append(Paragraph("FITEN PRODUCT LAUNCH · EDISON 2026", S["eyebrow"]))
story.append(Spacer(1, 4))

# Big title block
title_table = Table([[
    Paragraph("<b>Fi</b>", ParagraphStyle("t1", fontName="Helvetica-Bold",
        fontSize=40, textColor=NAVY, leading=44, spaceAfter=0)),
    Paragraph("<b>TEN</b>", ParagraphStyle("t2", fontName="Helvetica-Bold",
        fontSize=40, textColor=GOLD, leading=44, spaceAfter=0)),
    Paragraph(" Business Directory", ParagraphStyle("t3", fontName="Helvetica-Bold",
        fontSize=40, textColor=NAVY, leading=44, spaceAfter=0)),
]], colWidths=[0.55*inch, 0.85*inch, None])
title_table.setStyle(TableStyle([
    ("VALIGN",(0,0),(-1,-1),"BOTTOM"),
    ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
    ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
]))
story.append(title_table)
story.append(Spacer(1, 8))
story.append(Paragraph("Connecting Tamil Entrepreneurs. Powering Community Growth.", S["tagline"]))
story.append(Spacer(1, 4))

# One-liner quote
story.append(highlight_box("",
    "A real-time, bilingual business directory built for the global Tamil diaspora — "
    "making it effortless to discover partners, clients, investors, and talent "
    "within our community. Live today at fiten-directory.vercel.app."
))
story.append(Spacer(1, 18))

# Stats row
stats = Table([
    [stat_block("600K+", "Tamil people in\nUS & Canada",   "US & Canadian Census"),
     stat_block("71",    "Member Tamil\nSangams in FeTNA", "FeTNA.org verified"),
     stat_block("3,000+","FeTNA convention\nattendees",    "South Asian Herald 2025"),
     stat_block("40 yrs","FeTNA community\ntrust",         "Est. 1988")],
], colWidths=[W/4]*4)
stats.setStyle(TableStyle([
    ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
    ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
]))
story.append(stats)
story.append(Spacer(1, 22))

# Footer meta
meta = Table([[
    Paragraph("Presented by <b>Mehanaz MI</b>", S["small"]),
    Paragraph("fiten-directory.vercel.app", S["small"]),
    Paragraph("July 2, 2026 · Edison, New Jersey", S["small"]),
]], colWidths=[W/3]*3)
meta.setStyle(TableStyle([
    ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
    ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
    ("ALIGN",(0,0),(0,-1),"LEFT"),
    ("ALIGN",(1,0),(1,-1),"CENTER"),
    ("ALIGN",(2,0),(2,-1),"RIGHT"),
    ("LINEABOVE",(0,0),(-1,0),0.5,MUTED),
    ("TOPPADDING",(0,0),(-1,-1),8),
]))
story.append(meta)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# PAGE 2 — PROBLEM → SOLUTION
# ══════════════════════════════════════════════════════════════
story += page_header("02", "PROBLEM · SOLUTION", "The Gap We're Closing",
    "FiTEN has spent 40 years building one of the most connected Tamil entrepreneur networks — "
    "but that network lives in event halls, not online.")

story.append(Paragraph("The Problem", S["section_label"]))

problems = [
    ("🔍", "No Discoverability",
     "A Tamil founder in New Jersey has no way to find a Tamil software agency in Chennai. "
     "The platform simply doesn't exist. Tamil businesses are invisible to each other across borders."),
    ("🌐", "No Community Context",
     "Google, LinkedIn, and Yelp carry no Tamil identity, cultural trust, or diaspora relevance. "
     "For high-stakes B2B decisions — legal, financial, tech — community trust is everything."),
    ("📡", "No B2B Signaling",
     "There is no way to broadcast 'I am looking for a partner, investor, or client' "
     "within the Tamil entrepreneur network. Intent stays invisible."),
]
for icon, title, desc in problems:
    story.append(card(icon, title, desc, RED))
    story.append(Spacer(1, 6))

story.append(Spacer(1, 8))
story.append(Paragraph("The Solution", S["section_label"]))

solutions = [
    ("⚡", "List in Minutes, Visible Globally",
     "Any Tamil business submits once and appears in real time — searchable across cities, sectors, and continents."),
    ("🤝", "Active B2B Signals",
     "Businesses flag exactly what they need right now: Partner · Client · Investment · Hiring. Real intent, not just a profile."),
    ("🏅", "Community Trust Layer",
     "FeTNA Sponsors, Women-Led, Conference Speakers — curated identities backed by 40 years of FeTNA credibility."),
    ("🌐", "Bilingual — English + Tamil",
     "Full English and Tamil-script interface. Built for the diaspora, not just translated."),
]
for icon, title, desc in solutions:
    story.append(card(icon, title, desc, GOLD))
    story.append(Spacer(1, 6))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# PAGE 3 — AUDIENCE & MARKET
# ══════════════════════════════════════════════════════════════
story += page_header("03", "AUDIENCE · MARKET", "A Network Already Built",
    "No cold-start problem. No user acquisition cost. The community is already here — "
    "it just needs a digital backbone.")

story.append(Paragraph("Who It Serves", S["section_label"]))

audiences = [
    ("Tamil Business Owners",
     "Seeking community visibility, trusted partners, and clients they can work with confidently — "
     "filtered by sector, city, and B2B intent."),
    ("Tamil Investors & Professionals",
     "Discovering vetted, community-aligned businesses for deals, partnerships, and collaboration — "
     "with structured signals they can act on."),
    ("FeTNA Convention Attendees",
     "Connecting with peers before, during, and long after each annual event — "
     "year-round, not just for a single weekend in July."),
]
for title, desc in audiences:
    inner = Table([
        [Paragraph(f"<b>{title}</b>", S["card_title"])],
        [Paragraph(desc, S["card_body"])],
    ], colWidths=["100%"])
    inner.setStyle(TableStyle([
        ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
    ]))
    outer = Table([[inner]], colWidths=["100%"])
    outer.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),BG),
        ("ROUNDEDCORNERS",[8]),
        ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
        ("LEFTPADDING",(0,0),(-1,-1),14),("RIGHTPADDING",(0,0),(-1,-1),14),
        ("LINEBEFORE",(0,0),(0,-1),4,NAVY),
    ]))
    story.append(outer)
    story.append(Spacer(1, 7))

story.append(Spacer(1, 10))
story.append(highlight_box("Why Now",
    "FeTNA has connected Tamils for 38 years. For the first time, there is a real-time digital layer — "
    "turning that trusted offline network into an active, searchable business marketplace "
    "available 365 days a year. Tamil diaspora entrepreneurship is accelerating and FiTEN is "
    "already at the centre of this network. The directory gives it a permanent home online."))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# PAGE 4 — LIVE PRODUCT
# ══════════════════════════════════════════════════════════════
story += page_header("04", "LIVE PRODUCT", "It's Live — Right Now",
    "A fully deployed, production-grade product. No prototype. No staging environment.")

# URL highlight
url_content = Table([
    [Paragraph("LIVE AT", ParagraphStyle("ul", fontName="Helvetica-Bold", fontSize=9,
                                          textColor=colors.HexColor("#9CA3AF"), letterSpacing=2, leading=12))],
    [Paragraph("fiten-directory.vercel.app", ParagraphStyle("uv", fontName="Helvetica-Bold",
                                                              fontSize=20, textColor=GOLD, leading=24))],
], colWidths=["100%"])
url_content.setStyle(TableStyle([
    ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
    ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
]))
url_box = Table([[url_content]], colWidths=["100%"])
url_box.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,-1),NAVY),
    ("ROUNDEDCORNERS",[10]),
    ("TOPPADDING",(0,0),(-1,-1),14),("BOTTOMPADDING",(0,0),(-1,-1),14),
    ("LEFTPADDING",(0,0),(-1,-1),22),("RIGHTPADDING",(0,0),(-1,-1),22),
]))
story.append(url_box)
story.append(Spacer(1, 14))

story.append(Paragraph("Demo Walkthrough", S["section_label"]))

steps = [
    ("1", "Search & Browse", "Find businesses by name, keyword, or any of 10+ industry categories — instantly, no login required."),
    ("2", "Filter by B2B Signal", "Partner · Hiring · Seeking Investment · Seeking Clients — filter by active business intent, not just sector."),
    ("3", "View Business Profile", "Full contact details, website, Tamil business name, sector, Women-Led badge, and FeTNA Sponsor status."),
    ("4", "Add Your Business", "Submit at /form — appears live in the directory within seconds via real-time Firebase sync."),
]
for num, title, desc in steps:
    num_cell = Paragraph(f"<b>{num}</b>", ParagraphStyle("sn", fontName="Helvetica-Bold",
        fontSize=12, textColor=WHITE, alignment=TA_CENTER, leading=16))
    num_box = Table([[num_cell]], colWidths=[0.28*inch], rowHeights=[0.28*inch])
    num_box.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),NAVY),
        ("ROUNDEDCORNERS",[14]),
        ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),
        ("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))
    content = Table([
        [Paragraph(f"<b>{title}</b>", S["card_title"])],
        [Paragraph(desc, S["card_body"])],
    ], colWidths=["100%"])
    content.setStyle(TableStyle([
        ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
    ]))
    row = Table([[num_box, content]], colWidths=[0.45*inch, None])
    row.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0),
    ]))
    outer = Table([[row]], colWidths=["100%"])
    outer.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),BG),
        ("ROUNDEDCORNERS",[8]),
        ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
        ("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),
    ]))
    story.append(outer)
    story.append(Spacer(1, 7))

story.append(Spacer(1, 10))
story.append(Paragraph("Built With", S["section_label"]))

tags_data = [["Next.js 16", "Firebase / Firestore", "Vercel", "TypeScript"]]
tags = Table(tags_data, colWidths=[W/4]*4)
tags.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,-1),BG),
    ("BOX",(0,0),(-1,-1),0.5,colors.HexColor("#E5E7EB")),
    ("FONTNAME",(0,0),(-1,-1),"Helvetica"),
    ("FONTSIZE",(0,0),(-1,-1),10),
    ("TEXTCOLOR",(0,0),(-1,-1),MUTED),
    ("ALIGN",(0,0),(-1,-1),"CENTER"),
    ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),
    ("ROUNDEDCORNERS",[8]),
]))
story.append(tags)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# PAGE 5 — IMPACT & VISION
# ══════════════════════════════════════════════════════════════
story += page_header("05", "IMPACT · VISION", "Today's Product. Tomorrow's Platform.",
    "A proven foundation with a clear path to broader community impact.")

# What exists today
story.append(Paragraph("What Exists Today", S["section_label"]))

checks = [
    "Live, deployed product — zero downtime, real users",
    "Real Tamil businesses listed across multiple cities and sectors",
    "Official FiTEN / FeTNA affiliation and branding",
    "Free to list — open to any Tamil entrepreneur, takes 2 minutes",
    "Bilingual (English + Tamil), mobile-ready, SEO-indexed on Google",
]
for c in checks:
    story.append(check_row(c))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 10))

# Growth potential inline stats
growth = Table([
    [Paragraph("<b>500+</b>", ParagraphStyle("gn", fontName="Helvetica-Bold", fontSize=20,
                                              textColor=NAVY, alignment=TA_CENTER, leading=24)),
     Paragraph("<b>10,000+</b>", ParagraphStyle("gn2", fontName="Helvetica-Bold", fontSize=20,
                                                  textColor=NAVY, alignment=TA_CENTER, leading=24)),
     Paragraph("<b>50+</b>", ParagraphStyle("gn3", fontName="Helvetica-Bold", fontSize=20,
                                              textColor=NAVY, alignment=TA_CENTER, leading=24))],
    [Paragraph("Businesses listed\nin 12 months", S["stat_src"]),
     Paragraph("Monthly visitors\nprojected", S["stat_src"]),
     Paragraph("Cities covered\nglobally", S["stat_src"])],
], colWidths=[W/3]*3)
growth.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,-1),BG),
    ("ROUNDEDCORNERS",[8]),
    ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
    ("TEXTCOLOR",(0,1),(-1,1),MUTED),
    ("FONTSIZE",(0,1),(-1,1),9),
    ("ALIGN",(0,0),(-1,-1),"CENTER"),
    ("LINEAFTER",(0,0),(1,-1),0.5,colors.HexColor("#E5E7EB")),
]))
story.append(growth)
story.append(Spacer(1, 16))

# Vision
story.append(vision_box("White-Label Platform — Next Phase",
    "FiTEN Business Directory is the proof of concept. The next step: offer this as a "
    "premium white-label platform for any diaspora, alumni, or cultural organization "
    "to launch their own branded business directory — powered by the same engine. "
    "Any community. Their brand. Their domain. Their network."))
story.append(Spacer(1, 10))

# Phase row
phase_data = [
    [Paragraph("🏗", ParagraphStyle("pi", fontSize=18, alignment=TA_CENTER, leading=22)),
     Paragraph("🌐", ParagraphStyle("pi2", fontSize=18, alignment=TA_CENTER, leading=22)),
     Paragraph("🚀", ParagraphStyle("pi3", fontSize=18, alignment=TA_CENTER, leading=22))],
    [Paragraph("<b>Phase 1</b>", ParagraphStyle("pt", fontName="Helvetica-Bold", fontSize=11,
                                                  textColor=NAVY, alignment=TA_CENTER, leading=14)),
     Paragraph("<b>Phase 2</b>", ParagraphStyle("pt2", fontName="Helvetica-Bold", fontSize=11,
                                                   textColor=NAVY, alignment=TA_CENTER, leading=14)),
     Paragraph("<b>Phase 3</b>", ParagraphStyle("pt3", fontName="Helvetica-Bold", fontSize=11,
                                                   textColor=NAVY, alignment=TA_CENTER, leading=14))],
    [Paragraph("FiTEN Tamil Directory\nlive & growing", S["small"]),
     Paragraph("White-label for diaspora\norgs worldwide", S["small"]),
     Paragraph("Multi-community\nSaaS platform", S["small"])],
]
phases = Table(phase_data, colWidths=[W/3]*3)
phases.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,-1),BG),
    ("ROUNDEDCORNERS",[8]),
    ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
    ("ALIGN",(0,0),(-1,-1),"CENTER"),
    ("LINEAFTER",(0,0),(1,-1),0.5,colors.HexColor("#E5E7EB")),
    ("LINEABOVE",(0,0),(-1,0),3,GOLD),
]))
story.append(phases)
story.append(Spacer(1, 12))

story.append(highlight_box("The Ask",
    "FeTNA's endorsement and community mobilization to onboard Tamil businesses globally — "
    "and validate the foundation for a platform that can serve every diaspora community in the world."))

# ── BUILD ─────────────────────────────────────────────────────
doc.build(story)
print(f"PDF saved: {OUT}")
