"""
AgroVerse Pitch Deck — PDF profesional
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, Image as RLImage
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import Flowable
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.lib.utils import ImageReader
import os

W, H = A4

# ── Paleta ────────────────────────────────────────────────────────────────────
G_DARK    = colors.HexColor("#1b5e20")
G_MID     = colors.HexColor("#2e7d32")
G_LIGHT   = colors.HexColor("#a5d6a7")
AMBER     = colors.HexColor("#f59e0b")
AMBER_BG  = colors.HexColor("#fffbf0")
AMBER_LT  = colors.HexColor("#fde68a")
CREAM     = colors.HexColor("#fef9f0")
WHITE     = colors.white
DARK      = colors.HexColor("#1a1a1a")
MID_GRAY  = colors.HexColor("#555555")
LIGHT_GRAY= colors.HexColor("#f4f4f4")
RULE      = colors.HexColor("#e0e0e0")
GOLD      = colors.HexColor("#d4a017")

LOGO_PATH = "/Users/users/Documents/HACKATHON/agroverse/public/assets/logo.png"
BG_PATH   = "/Users/users/Documents/HACKATHON/agroverse/public/assets/sprites/farm-background.png"

# ── Helper de estilo ──────────────────────────────────────────────────────────
def S(name, **kw):
    return ParagraphStyle(name, **kw)

# ── Canvas con header/footer en cada página ───────────────────────────────────
class PageTemplate:
    def __init__(self, logo_path):
        self.logo_path = logo_path

    def __call__(self, canv, doc):
        canv.saveState()
        pw = doc.pagesize[0]
        ph = doc.pagesize[1]
        ml = doc.leftMargin
        mr = doc.rightMargin
        content_w = pw - ml - mr

        # ── Header membrete ───────────────────────────────────────────────
        # Línea verde superior
        canv.setFillColor(G_MID)
        canv.rect(0, ph - 1.15*cm, pw, 1.15*cm, fill=1, stroke=0)

        # Logo en el header (si existe)
        if os.path.exists(self.logo_path):
            canv.drawImage(
                self.logo_path,
                ml, ph - 1.0*cm,
                width=0.85*cm, height=0.85*cm,
                preserveAspectRatio=True, mask="auto"
            )

        # Nombre en header
        canv.setFont("Helvetica-Bold", 11)
        canv.setFillColor(WHITE)
        canv.drawString(ml + 1.1*cm, ph - 0.78*cm, "AgroVerse")

        # Tagline header derecha
        canv.setFont("Helvetica", 8)
        canv.setFillColor(colors.HexColor("#c8e6c9"))
        tag = "Cultiva · Compite · Gana"
        canv.drawRightString(pw - mr, ph - 0.78*cm, tag)

        # ── Footer ────────────────────────────────────────────────────────
        # Línea dorada
        canv.setStrokeColor(GOLD)
        canv.setLineWidth(1.2)
        canv.line(ml, 1.4*cm, pw - mr, 1.4*cm)

        # Logo pequeño footer
        if os.path.exists(self.logo_path):
            canv.drawImage(
                self.logo_path,
                ml, 0.35*cm,
                width=0.7*cm, height=0.7*cm,
                preserveAspectRatio=True, mask="auto"
            )

        canv.setFont("Helvetica", 7.5)
        canv.setFillColor(MID_GRAY)
        canv.drawString(ml + 0.9*cm, 0.62*cm, "AgroVerse MVP v0.1 · Celo Mainnet · MiniPay · Colombia Season 1 · Junio 2026")

        # Número de página derecha
        canv.setFont("Helvetica-Bold", 8)
        canv.setFillColor(G_MID)
        canv.drawRightString(pw - mr, 0.62*cm, f"Pág. {doc.page}")

        canv.restoreState()


# ── Bloque de color (fondo de sección) ───────────────────────────────────────
class ColorRect(Flowable):
    def __init__(self, w, h, fill, stroke=None, sw=0):
        super().__init__()
        self.width  = w
        self.height = h
        self.fill   = fill
        self.stroke = stroke
        self.sw     = sw

    def draw(self):
        self.canv.setFillColor(self.fill)
        if self.stroke:
            self.canv.setStrokeColor(self.stroke)
            self.canv.setLineWidth(self.sw)
        self.canv.roundRect(0, 0, self.width, self.height, 6,
                            fill=1, stroke=1 if self.stroke else 0)


# ── Portada con imagen de fondo ───────────────────────────────────────────────
class CoverPage(Flowable):
    """Banner portada: imagen de finca + overlay + logo + textos."""
    def __init__(self, width, height, logo_path, bg_path):
        super().__init__()
        self.width    = width
        self.height   = height
        self.logo     = logo_path
        self.bg       = bg_path

    def draw(self):
        c = self.canv
        w, h = self.width, self.height

        # Fondo de imagen de finca
        if os.path.exists(self.bg):
            c.drawImage(self.bg, 0, 0, width=w, height=h,
                        preserveAspectRatio=False, mask=None)

        # Overlay oscuro degradado (simular con capas semitransparentes)
        c.setFillColor(colors.Color(0, 0, 0, alpha=0.55))
        c.rect(0, 0, w, h, fill=1, stroke=0)

        # Franja verde oscura en la parte inferior del banner
        c.setFillColor(colors.Color(0.07, 0.37, 0.07, alpha=0.82))
        c.rect(0, 0, w, h * 0.38, fill=1, stroke=0)

        # Logo centrado en el banner
        if os.path.exists(self.logo):
            logo_s = 1.8*cm
            c.drawImage(self.logo,
                        w/2 - logo_s/2, h * 0.62,
                        width=logo_s, height=logo_s,
                        preserveAspectRatio=True, mask="auto")

        # Título principal
        c.setFont("Helvetica-Bold", 30)
        c.setFillColor(WHITE)
        c.drawCentredString(w/2, h * 0.50, "AgroVerse")

        # Subtítulo
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.HexColor("#ccffcc"))
        c.drawCentredString(w/2, h * 0.42,
            "El juego de agricultura colombiana con economia real en blockchain")

        # Tags en la franja verde
        tags = ["🎮 GameFi", "🌎 LATAM", "⛓ Celo L2", "💵 USDT"]
        tag_w = w / len(tags)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(colors.HexColor("#aaffaa"))
        for i, tag in enumerate(tags):
            c.drawCentredString(tag_w * i + tag_w/2, h * 0.14, tag)

        # Línea dorada separadora encima de los tags
        c.setStrokeColor(GOLD)
        c.setLineWidth(1)
        c.line(w * 0.05, h * 0.38, w * 0.95, h * 0.38)


def build_pdf():
    path = "/Users/users/Documents/HACKATHON/celo-project/agroverse/AgroVerse_Pitch.pdf"

    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=1.8*cm, rightMargin=1.8*cm,
        topMargin=1.6*cm, bottomMargin=1.8*cm,
    )

    PW   = doc.width
    tmpl = PageTemplate(LOGO_PATH)

    # ── Estilos ───────────────────────────────────────────────────────────────
    sH1 = S("sH1",
        fontSize=13, textColor=G_DARK, fontName="Helvetica-Bold",
        spaceBefore=16, spaceAfter=4)

    sBody = S("sBody",
        fontSize=9.5, textColor=MID_GRAY, fontName="Helvetica",
        leading=15, spaceAfter=4)

    sBold = S("sBold",
        fontSize=9.5, textColor=DARK, fontName="Helvetica-Bold", leading=15)

    sSmall = S("sSmall",
        fontSize=8.5, textColor=MID_GRAY, fontName="Helvetica", leading=13)

    sTag = S("sTag",
        fontSize=8.5, textColor=WHITE, fontName="Helvetica-Bold",
        alignment=TA_CENTER)

    sCenter = S("sCenter",
        fontSize=9, textColor=MID_GRAY, fontName="Helvetica",
        alignment=TA_CENTER, leading=13)

    sCenterBold = S("sCenterBold",
        fontSize=10, textColor=G_DARK, fontName="Helvetica-Bold",
        alignment=TA_CENTER)

    sCallout = S("sCallout",
        fontSize=10, textColor=G_DARK, fontName="Helvetica-Bold",
        backColor=colors.HexColor("#e8f5e9"), leading=16,
        borderPad=6, spaceAfter=6)

    story = []

    # ══════════════════════════════════════════════════════════════════════════
    # PORTADA — banner imagen completo
    # ══════════════════════════════════════════════════════════════════════════
    story.append(CoverPage(PW, 8.5*cm, LOGO_PATH, BG_PATH))
    story.append(Spacer(1, 0.5*cm))

    # Metadata debajo del banner
    meta = [
        ["Versión",          "MVP v0.2 — Junio 2026"],
        ["Mercado",          "Colombia Season 1 → Brasil S2 → México S3"],
        ["Plataforma",       "MiniPay (Opera) · Progressive Web App"],
        ["Blockchain",       "Celo Mainnet · Chain ID 42220 · OP Stack L2"],
        ["Tokens",           "USDT · USDC · USDm (Mento)"],
    ]
    mt = Table(meta, colWidths=[3.8*cm, PW - 3.8*cm])
    mt.setStyle(TableStyle([
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("TEXTCOLOR",     (0,0), (0,-1), G_MID),
        ("TEXTCOLOR",     (1,0), (1,-1), MID_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("BACKGROUND",    (0,0), (-1,-1), CREAM),
        ("LINEBELOW",     (0,0), (-1,-2), 0.3, RULE),
    ]))
    story.append(mt)
    story.append(Spacer(1, 0.6*cm))

    # ── Sección helper ────────────────────────────────────────────────────────
    def section(title):
        story.append(KeepTogether([
            Paragraph(title, sH1),
            HRFlowable(width=PW, color=G_LIGHT, thickness=1.5, spaceAfter=6),
        ]))

    # ══════════════════════════════════════════════════════════════════════════
    # 1. QUÉ ES AGROVERSE
    # ══════════════════════════════════════════════════════════════════════════
    section("1.  ¿Qué es AgroVerse?")

    story.append(Paragraph(
        "AgroVerse es una <b>Mini App de simulación agrícola colombiana</b> para MiniPay, "
        "la wallet estable con 14M+ usuarios en 60+ países. Los jugadores cultivan productos "
        "locales, compiten en ranking nacional y convierten sus cosechas en <b>USDT real</b> "
        "— sin banco, sin intermediario.", sBody))

    story.append(Spacer(1, 0.3*cm))

    pilares = [
        ["🌾", "Cultiva",     "Elige tu región: Eje Cafetero, Cundinamarca o Valle del Cauca. Siembra café, flores o caña y cosecha cada día."],
        ["🏆", "Compite",     "Ranking nacional en tiempo real. Top agricultores ganan USDT + 1 libra de café colombiano real al mes."],
        ["💵", "Gana",        "Puntos convertibles a USDT directamente a tu wallet MiniPay. Gas gratis con fee abstraction de Celo."],
        ["🎨", "Colecciona",  "Marketplace de skins creadas por ilustradores colombianos. Compra, vende y personaliza tu campesino."],
    ]

    p_rows = []
    for icon, title, desc in pilares:
        p_rows.append([
            Paragraph(icon, S("pi", fontSize=18, alignment=TA_CENTER)),
            Paragraph(f"<b>{title}</b>", S("pt", fontSize=10, textColor=G_DARK, fontName="Helvetica-Bold")),
            Paragraph(desc, S("pd", fontSize=9, textColor=MID_GRAY, leading=13)),
        ])

    pt = Table(p_rows, colWidths=[1*cm, 2.8*cm, PW - 3.8*cm])
    pt.setStyle(TableStyle([
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
        ("ROWBACKGROUNDS",(0,0), (-1,-1), [CREAM, WHITE]),
        ("LINEBELOW",     (0,0), (-1,-2), 0.3, RULE),
    ]))
    story.append(pt)
    story.append(Spacer(1, 0.5*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # 2. OPORTUNIDAD
    # ══════════════════════════════════════════════════════════════════════════
    section("2.  Oportunidad de Mercado — LATAM")

    story.append(Paragraph(
        "MiniPay se expande activamente en LATAM. <b>Ninguna app del catálogo actual tiene "
        "LATAM como mercado objetivo explícito.</b> AgroVerse es la primera propuesta con "
        "identidad cultural colombiana y mecánicas de retención diaria.", sBody))

    story.append(Spacer(1, 0.25*cm))

    kpis = [
        ["14 M+",      "300 M+",            "0",                   "60+"],
        ["Wallets\nMiniPay", "Txs stablecoin\nrealizadas", "Apps enfocadas\nen LATAM hoy", "Países\ndisponibles"],
    ]
    kt = Table(kpis, colWidths=[PW/4]*4)
    kt.setStyle(TableStyle([
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0), 18),
        ("TEXTCOLOR",     (0,0), (-1,0), G_DARK),
        ("TEXTCOLOR",     (2,0), (2,0), colors.HexColor("#c62828")),
        ("FONTSIZE",      (0,1), (-1,1), 8),
        ("TEXTCOLOR",     (0,1), (-1,1), MID_GRAY),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("BACKGROUND",    (0,0), (-1,-1), AMBER_BG),
        ("BOX",           (0,0), (-1,-1), 1, colors.HexColor("#ffe0b2")),
        ("LINEAFTER",     (0,0), (2,1),   0.5, RULE),
    ]))
    story.append(kt)
    story.append(Spacer(1, 0.5*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # 3. CELO BLOCKCHAIN
    # ══════════════════════════════════════════════════════════════════════════
    section("3.  Relación con Celo Blockchain")

    story.append(Paragraph(
        "Celo es un <b>Ethereum L2</b> (OP Stack + EigenDA) diseñado para pagos en "
        "stablecoins en mercados emergentes. AgroVerse aprovecha ventajas únicas que "
        "hacen imposible este modelo en otras redes:", sBody))

    story.append(Spacer(1, 0.2*cm))

    celo = [
        ["⚡ Velocidad",        "~1 segundo/bloque",      "Cosecha instantánea, sin esperas frustrantes para el jugador."],
        ["💸 Costo mínimo",     "$0.0005 por tx",         "Las micro-recompensas de $0.01 son viables. En Ethereum costarían $5."],
        ["🪙 Fee Abstraction",  "CIP-64 · USDT como gas", "El jugador paga gas con USDT. Nunca necesita comprar CELO."],
        ["📱 MiniPay nativo",   "14M+ wallets listas",    "Distribución masiva sin fricción. El usuario ya tiene la wallet instalada."],
        ["🌐 Stablecoins",      "USDT · USDC · USDm",     "Sin volatilidad. El jugador sabe exactamente cuánto vale su cosecha."],
    ]

    ct = Table(celo, colWidths=[3.2*cm, 3*cm, PW - 6.2*cm])
    ct.setStyle(TableStyle([
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME",      (1,0), (1,-1), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("TEXTCOLOR",     (0,0), (0,-1), G_MID),
        ("TEXTCOLOR",     (1,0), (1,-1), DARK),
        ("TEXTCOLOR",     (2,0), (2,-1), MID_GRAY),
        ("ROWBACKGROUNDS",(0,0), (-1,-1), [LIGHT_GRAY, WHITE]),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("LINEBELOW",     (0,0), (-1,-2), 0.3, RULE),
    ]))
    story.append(ct)
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph(
        "Contratos on-chain: USDT <font color='#1565c0'>0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e</font>  ·  "
        "USDT Adapter <font color='#1565c0'>0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72</font>  ·  "
        "USDm <font color='#1565c0'>0x765DE816845861e75A25fCA122bb6898B8B1282a</font>",
        S("addr", fontSize=7, textColor=MID_GRAY, leading=11)))
    story.append(Spacer(1, 0.5*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # 4. TRANSACCIONALIDAD
    # ══════════════════════════════════════════════════════════════════════════
    section("4.  Modelo de Transaccionalidad")

    story.append(Paragraph(
        "AgroVerse genera <b>alta frecuencia de micro-transacciones</b> — el modelo ideal para "
        "Celo donde el gas es casi cero. Cada acción del jugador es una transacción on-chain:", sBody))

    story.append(Spacer(1, 0.2*cm))

    txs = [
        ["Acción del jugador",       "Tipo",              "Valor",         "Frecuencia"],
        ["Comprar semilla premium",  "USDT → Contrato",   "$0.05–$0.10",   "1–3x / día"],
        ["Cosechar → recibir puntos","Contrato → Wallet", "$0.01–$0.50",   "1–3x / día"],
        ["Comprar skin en tienda",   "USDT → Contrato",   "$0.50–$2.00",   "Semanal"],
        ["Vender skin P2P",          "USDT → Usuario",    "Variable",      "Libre"],
        ["Canjear puntos a USDT",    "Contrato → Wallet", ">$0.50 mínimo", "Semanal"],
        ["Fee de plataforma (5%)",   "USDT → Tesorería",  "5% del valor",  "Por tx"],
    ]

    txt = Table(txs, colWidths=[5.2*cm, 3.4*cm, 2.4*cm, 2.5*cm])
    txt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), G_DARK),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, CREAM]),
        ("ALIGN",         (1,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("GRID",          (0,0), (-1,-1), 0.3, RULE),
    ]))
    story.append(txt)

    story.append(Spacer(1, 0.3*cm))

    proy = [
        ["Usuarios activos", "TX / día",    "TX / mes",   "Volumen mensual"],
        ["500 jugadores",    "~2,500",       "~75,000",    "~$15,000 USDT"],
        ["1,000 jugadores",  "~5,000",       "~150,000",   "~$30,000 USDT"],
        ["5,000 jugadores",  "~25,000",      "~750,000",   "~$150,000 USDT"],
    ]
    pryt = Table(proy, colWidths=[PW/4]*4)
    pryt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), G_MID),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [LIGHT_GRAY, WHITE]),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("GRID",          (0,0), (-1,-1), 0.3, RULE),
    ]))
    story.append(Paragraph("<b>Proyección de crecimiento:</b>", sSmall))
    story.append(Spacer(1, 0.15*cm))
    story.append(pryt)
    story.append(Spacer(1, 0.5*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # 5. MODELO DE NEGOCIO
    # ══════════════════════════════════════════════════════════════════════════
    section("5.  Modelo de Negocio")

    rev = [
        ["Fuente de ingreso",           "Mecánica",                                  "Margen"],
        ["Fee de marketplace",          "5% sobre compra/venta de skins P2P",        "5%"],
        ["Semillas premium",            "Cultivos con mejor yield — $0.05–$0.10",    "100%"],
        ["Patrocinios de marca",        "Marcas cafeteras patrocinan ranking mensual","Fijo/mes"],
        ["Comisión a ilustradores",     "10% sobre ventas de skins de creadores",    "10%"],
        ["Spread de puntos→USDT",       "Tasa de conversión con margen del 2–3%",    "2–3%"],
    ]
    revt = Table(rev, colWidths=[4.8*cm, 6*cm, PW - 10.8*cm])
    revt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), G_MID),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, AMBER_BG]),
        ("ALIGN",         (2,0), (2,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("GRID",          (0,0), (-1,-1), 0.3, RULE),
    ]))
    story.append(revt)

    story.append(Spacer(1, 0.3*cm))

    be = [
        ["Break-even estimado",    "500 usuarios activos + 2 patrocinios / mes"],
        ["Ingreso target mensual", "$3,000 – $5,000 USDT (fees + semillas + patrocinios)"],
        ["Costo infraestructura",  "~$150 / mes (Vercel + Supabase + RPC Celo)"],
    ]
    bet = Table(be, colWidths=[5*cm, PW - 5*cm])
    bet.setStyle(TableStyle([
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("TEXTCOLOR",     (0,0), (0,-1), G_DARK),
        ("TEXTCOLOR",     (1,0), (1,-1), MID_GRAY),
        ("BACKGROUND",    (0,0), (-1,-1), AMBER_BG),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e0d0a0")),
    ]))
    story.append(bet)
    story.append(Spacer(1, 0.5*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # 6. STACK
    # ══════════════════════════════════════════════════════════════════════════
    section("6.  Stack Tecnológico")

    stack = [
        ["Frontend",      "Next.js 14 + React + TypeScript + Tailwind CSS"],
        ["Juego",         "Phaser.js — motor 2D, sprites pixel art generados con IA"],
        ["Blockchain",    "Viem v2 · Celo Mainnet (Chain ID 42220) · fee abstraction CIP-64"],
        ["Wallet",        "MiniPay (Opera) — auto-connect sin botón de conexión"],
        ["Contratos",     "Solidity — puntos, rewards, marketplace (pendiente deploy testnet)"],
        ["Base de datos", "Supabase — estado del juego, ranking, sesiones (pendiente)"],
        ["Deploy",        "Vercel — CDN global, HTTPS, dominio custom"],
        ["Arte",          "Gemini AI — sprites pixel art 2D · 3 mapas únicos por región colombiana (Eje Cafetero, Cundinamarca, Valle del Cauca)"],
    ]
    stkt = Table(stack, colWidths=[3.5*cm, PW - 3.5*cm])
    stkt.setStyle(TableStyle([
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("TEXTCOLOR",     (0,0), (0,-1), G_MID),
        ("TEXTCOLOR",     (1,0), (1,-1), MID_GRAY),
        ("ROWBACKGROUNDS",(0,0), (-1,-1), [LIGHT_GRAY, WHITE]),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("LINEBELOW",     (0,0), (-1,-2), 0.3, RULE),
    ]))
    story.append(stkt)
    story.append(Spacer(1, 0.5*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # 7. GRANTS
    # ══════════════════════════════════════════════════════════════════════════
    section("7.  Grants y Financiamiento Disponible")

    grants = [
        ["Programa",              "Monto",           "Cierre",       "Requisito"],
        ["Proof of Ship S2",      "Hasta $2,000 USDT","30 Jun 2026", "MVP live + GitHub"],
        ["Prezenti Anchor Round", "Hasta $25,000 USD","30 Jun 2026", "anchor.prezenti.xyz"],
        ["Celo Builder Fund",     "$25,000 USD SAFE", "Dic 2026",    "1K MAU o 500 tx/dia"],
    ]
    gt = Table(grants, colWidths=[4.2*cm, 3.2*cm, 2.8*cm, PW - 10.2*cm])
    gt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), G_DARK),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [AMBER_BG, WHITE]),
        ("ALIGN",         (1,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("GRID",          (0,0), (-1,-1), 0.3, RULE),
    ]))
    story.append(gt)

    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(
        "Potencial total disponible: <b>$52,000 USD</b> combinando los 3 programas activos de Celo.",
        S("cta", fontSize=10, textColor=G_DARK, fontName="Helvetica-Bold",
          backColor=colors.HexColor("#e8f5e9"), borderPad=8, leading=16)))
    story.append(Spacer(1, 0.5*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # 8. ROADMAP
    # ══════════════════════════════════════════════════════════════════════════
    section("8.  Roadmap")

    rm = [
        ["✅  Completado",         "MVP: Next.js + Phaser · Onboarding 4 slides · 3 zonas Colombia con mapas pixel art únicos · Semillas básicas y premium (demo) · Ranking · Marketplace skins · Perfil · Logo · Barra fija con puntos en tiempo real · Modo demo sin wallet"],
        ["🔄  Sprint 2 — Jun 2026","Smart contracts Celo Sepolia · Supabase persistencia · ngrok MiniPay físico · Aplicar Proof of Ship S2"],
        ["🚀  Sprint 3 — Jul 2026","Deploy Mainnet · Primera alianza cafetera colombiana · Ranking con premio real en USDT"],
        ["📈  Sprint 4 — Ago 2026","Brasil Season 2 · Marketplace ilustradores live · Aplicar Celo Builder Fund $25K"],
        ["🌎  Sprint 5 — Sep 2026","México Season 3 · Token de gobernanza · Prezenti Anchor $25K"],
    ]
    rmt = Table(rm, colWidths=[3.8*cm, PW - 3.8*cm])
    rmt.setStyle(TableStyle([
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("TEXTCOLOR",     (0,0), (0,-1), G_DARK),
        ("TEXTCOLOR",     (1,0), (1,-1), MID_GRAY),
        ("ROWBACKGROUNDS",(0,0), (-1,-1), [colors.HexColor("#f1f8f1"), WHITE]),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("LINEBELOW",     (0,0), (-1,-2), 0.3, colors.HexColor("#c8e6c9")),
    ]))
    story.append(rmt)
    story.append(Spacer(1, 0.8*cm))

    # ══════════════════════════════════════════════════════════════════════════
    # CIERRE — sin bloque de color, solo línea dorada + texto elegante
    # ══════════════════════════════════════════════════════════════════════════
    story.append(HRFlowable(width=PW, color=GOLD, thickness=1.5, spaceAfter=12))

    cierre = Table([[
        Paragraph("🌾", S("ci", fontSize=28, alignment=TA_CENTER)),
        Paragraph(
            "<b>AgroVerse</b><br/>"
            "<font color='#2e7d32'>Cultiva · Compite · Gana</font><br/>"
            "<font size=8 color='#888888'>MVP disponible · Celo Mainnet · MiniPay · Junio 2026</font>",
            S("cc", fontSize=11, textColor=DARK, fontName="Helvetica-Bold", leading=18)),
        Paragraph(
            "<font color='#888888'>Contacto</font><br/>"
            "<b>agroverse.app</b><br/>"
            "<font size=8 color='#888888'>Colombia Season 1</font>",
            S("cr", fontSize=9, textColor=DARK, fontName="Helvetica", alignment=TA_RIGHT, leading=15)),
    ]], colWidths=[1.2*cm, PW - 5*cm, 3.8*cm])

    cierre.setStyle(TableStyle([
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (1,0), (1,0), 10),
    ]))
    story.append(cierre)

    # Build
    doc.build(story, onFirstPage=tmpl, onLaterPages=tmpl)
    print(f"PDF generado: {path}")


if __name__ == "__main__":
    build_pdf()
