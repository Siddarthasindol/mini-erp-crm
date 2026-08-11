import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "Mini ERP + CRM Operations Portal — Complete Project Explanation")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
            
        # Footer (all pages)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 36, page_text)
        self.drawString(54, 36, "CONFIDENTIAL — Technical Architecture & Operational Guide")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 8.5 * inch - 54, 48)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    primary_color = colors.HexColor("#1E3A8A")   # Navy
    secondary_color = colors.HexColor("#2563EB") # Blue
    accent_color = colors.HexColor("#0D9488")    # Teal
    dark_text = colors.HexColor("#0F172A")       # Slate dark
    muted_text = colors.HexColor("#475569")      # Slate muted
    light_bg = colors.HexColor("#F8FAFC")        # Soft grey background
    border_color = colors.HexColor("#E2E8F0")    # Border slate

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=muted_text,
        spaceAfter=18
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_text,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=light_bg,
        borderColor=border_color,
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=8,
        spaceBefore=4
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=body_style,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B")
    )

    story = []

    # Title & Subtitle Banner
    story.append(Paragraph("Mini ERP + CRM Operations Portal", title_style))
    story.append(Paragraph("Comprehensive Project Explanation, Technical Architecture & Operational Guide", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=14))

    # Executive Overview Box
    overview_text = Paragraph(
        "<b>Executive Summary:</b> The Mini ERP + CRM Operations Portal is a full-stack, enterprise-grade Operations Management Platform designed specifically for B2B wholesale and distribution companies. It addresses critical operational challenges in inventory control, customer relationship pipelines, order fulfillment, and role-based accountability.",
        callout_style
    )
    overview_table = Table([[overview_text]], colWidths=[7 * inch])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#93C5FD")),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 14))

    # Section 1: Business Problem & Core Objectives
    story.append(Paragraph("1. Business Problem & Solution Objectives", h1_style))
    story.append(Paragraph(
        "Wholesale distribution businesses handle large-volume orders across multiple internal stakeholders: Sales Representatives, Warehouse Supervisors, and Accounts Officers. In traditional systems, two major issues repeatedly disrupt operations:",
        body_style
    ))
    story.append(Paragraph("• <b>Phantom Stock & Uncontrolled Deductions:</b> When sales quotes or draft orders immediately deduct inventory, actual available stock becomes inaccurate, causing valid customer orders to be rejected.", bullet_style))
    story.append(Paragraph("• <b>Over-allocation & Negative Stock:</b> Confirming orders without strict real-time stock checks results in negative inventory, unfulfilled deliveries, and shipping delays.", bullet_style))
    story.append(Paragraph("• <b>Lack of CRM Audit Trail:</b> B2B sales cycles require scheduled follow-ups, interaction logs, and status transitions (LEAD → ACTIVE) which are easily lost without integrated CRM history.", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>System Core Objectives:</b>", body_style))
    story.append(Paragraph("1. Enforce <b>atomic transaction-based inventory deduction</b> only when a Sales Challan is explicitly <code>CONFIRMED</code>.", bullet_style))
    story.append(Paragraph("2. Provide complete <b>Role-Based Access Control (RBAC)</b> for ADMIN, SALES, WAREHOUSE, and ACCOUNTS roles.", bullet_style))
    story.append(Paragraph("3. Store <b>historical product snapshots</b> in delivery line items to preserve historical price and description records.", bullet_style))

    story.append(Spacer(1, 12))

    # Section 2: Technology Stack & Architecture
    story.append(Paragraph("2. Technology Stack & Architecture", h1_style))
    
    tech_data = [
        [Paragraph("<b>Layer</b>", body_style), Paragraph("<b>Technologies Used</b>", body_style), Paragraph("<b>Purpose & Key Libraries</b>", body_style)],
        [Paragraph("Frontend", body_style), Paragraph("React 18, TypeScript, Vite", body_style), Paragraph("Responsive SPA UI, React Router v6, Axios, Lucide Icons", body_style)],
        [Paragraph("Backend API", body_style), Paragraph("Node.js, Express.js, TypeScript", body_style), Paragraph("Modular REST APIs, Controller-Service architecture", body_style)],
        [Paragraph("Security & Auth", body_style), Paragraph("JWT, bcryptjs, Helmet, CORS", body_style), Paragraph("Stateless auth, hashed passwords, RBAC middleware", body_style)],
        [Paragraph("Database & ORM", body_style), Paragraph("PostgreSQL, Prisma ORM", body_style), Paragraph("Relational data modeling, schema migrations, $transaction", body_style)],
        [Paragraph("Deployment", body_style), Paragraph("Render / Vercel / Neon", body_style), Paragraph("Production deployment configuration, Docker compose", body_style)]
    ]
    tech_table = Table(tech_data, colWidths=[1.1 * inch, 2.2 * inch, 3.7 * inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(tech_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>System Flow & Control Architecture:</b>", h2_style))
    arch_box = Paragraph(
        "<b>React Frontend (TypeScript + Vite)</b><br/>"
        "&nbsp;&nbsp;└── Axios Interceptor (Attaches <code>Authorization: Bearer &lt;JWT&gt;</code>)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <b>Express REST API Server</b><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── <i>authMiddleware</i> (JWT Verification)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── <i>roleMiddleware</i> (Role Permission Check)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── <i>Controllers & Services</i> (Business Logic Execution)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <b>Prisma ORM</b> ──(Atomic $transaction)──> <b>PostgreSQL Database</b>",
        code_style
    )
    story.append(arch_box)

    story.append(Spacer(1, 12))

    # Section 3: Database Schema & Entity Relationships
    story.append(Paragraph("3. Database Schema & Data Model Design", h1_style))
    story.append(Paragraph(
        "The relational database schema is modeled in Prisma ORM (mapped to PostgreSQL). Key entity models and relations include:",
        body_style
    ))

    schema_data = [
        [Paragraph("<b>Model Name</b>", body_style), Paragraph("<b>Key Attributes</b>", body_style), Paragraph("<b>Relationships & Constraints</b>", body_style)],
        [Paragraph("<b>User</b>", body_style), Paragraph("id, name, email, password, role", body_style), Paragraph("Email unique. Roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS.", body_style)],
        [Paragraph("<b>Customer</b>", body_style), Paragraph("id, name, mobile, businessName, customerType, status, followUpDate", body_style), Paragraph("Types: RETAIL, WHOLESALE, DISTRIBUTOR. Status: LEAD, ACTIVE, INACTIVE. Has many followUps & challans.", body_style)],
        [Paragraph("<b>CustomerFollowUp</b>", body_style), Paragraph("id, customerId, note, followUpDate, createdBy, createdAt", body_style), Paragraph("Belongs to Customer. Tracks sales CRM notes and next dates.", body_style)],
        [Paragraph("<b>Product</b>", body_style), Paragraph("id, name, sku, category, unitPrice, currentStock, minimumStock, location", body_style), Paragraph("SKU unique. Low stock rule: <code>currentStock <= minimumStock</code>.", body_style)],
        [Paragraph("<b>StockMovement</b>", body_style), Paragraph("id, productId, quantity, movementType, reason, createdBy, createdAt", body_style), Paragraph("MovementType: IN, OUT. Direct audit log of stock changes.", body_style)],
        [Paragraph("<b>Challan</b>", body_style), Paragraph("id, challanNumber, customerId, totalQuantity, status, createdBy", body_style), Paragraph("ChallanNumber unique (CH-00001). Status: DRAFT, CONFIRMED, CANCELLED.", body_style)],
        [Paragraph("<b>ChallanItem</b>", body_style), Paragraph("id, challanId, productId, productNameSnapshot, skuSnapshot, unitPriceSnapshot, quantity", body_style), Paragraph("Belongs to Challan & Product. Contains product snapshot fields.", body_style)]
    ]
    schema_table = Table(schema_data, colWidths=[1.3 * inch, 2.7 * inch, 3.0 * inch])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(schema_table)

    story.append(Spacer(1, 14))

    # Section 4: Critical Challan Stock Transaction Logic
    story.append(Paragraph("4. Critical Challan Stock Transaction Logic", h1_style))
    story.append(Paragraph(
        "The core innovation of the portal is the <b>Transactional Challan Confirmation Engine</b>. It enforces zero stock leakage through an isolated database transaction.",
        body_style
    ))

    logic_steps = [
        ("Step 1: DRAFT Creation", "When a sales representative creates a Challan, status is set to <code>DRAFT</code>. Line item snapshots (name, SKU, price) are stored into <code>ChallanItem</code>. <b>No stock is deducted at this stage.</b>"),
        ("Step 2: Confirmation Trigger", "When authorized staff invokes <code>POST /api/challans/:id/confirm</code>, the service opens a Prisma <code>$transaction</code> block."),
        ("Step 3: Pre-Check Stock Availability", "The transaction fetches all line items and compares <code>product.currentStock</code> against <code>item.quantity</code> for every product in the challan."),
        ("Step 4: Atomic Rejection Rule", "If <b>ANY</b> product has insufficient stock, the transaction immediately throws an error and rolls back completely: <code>Insufficient stock for [Name]. Available: X, Requested: Y</code> (HTTP 400). Zero partial deductions occur."),
        ("Step 5: Atomic Deduction & Audit Log", "If all items pass verification, the transaction deducts stock for every product, creates an <code>OUT</code> <code>StockMovement</code> audit record for each product line, updates Challan status to <code>CONFIRMED</code>, and commits."),
    ]

    for title, desc in logic_steps:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", body_style))

    story.append(Spacer(1, 12))

    # Section 5: Role-Based Access Control (RBAC) Matrix
    story.append(Paragraph("5. Role-Based Access Control (RBAC) Matrix", h1_style))
    
    rbac_data = [
        [Paragraph("<b>Module / Endpoint</b>", body_style), Paragraph("<b>ADMIN</b>", body_style), Paragraph("<b>SALES</b>", body_style), Paragraph("<b>WAREHOUSE</b>", body_style), Paragraph("<b>ACCOUNTS</b>", body_style)],
        [Paragraph("Authentication & Profile", body_style), Paragraph("Full Access", body_style), Paragraph("Full Access", body_style), Paragraph("Full Access", body_style), Paragraph("Full Access", body_style)],
        [Paragraph("Executive Dashboard Stats", body_style), Paragraph("Full Access", body_style), Paragraph("Full Access", body_style), Paragraph("Full Access", body_style), Paragraph("Full Access", body_style)],
        [Paragraph("Customer CRM List & Detail", body_style), Paragraph("Full Access", body_style), Paragraph("Full Access", body_style), Paragraph("View Only", body_style), Paragraph("Full Access", body_style)],
        [Paragraph("Delete Customer Record", body_style), Paragraph("ALLOWED", body_style), Paragraph("FORBIDDEN (403)", body_style), Paragraph("FORBIDDEN (403)", body_style), Paragraph("FORBIDDEN (403)", body_style)],
        [Paragraph("Add CRM Follow-up Note", body_style), Paragraph("ALLOWED", body_style), Paragraph("ALLOWED", body_style), Paragraph("FORBIDDEN (403)", body_style), Paragraph("ALLOWED", body_style)],
        [Paragraph("Product Inventory Catalog", body_style), Paragraph("Full Access", body_style), Paragraph("View Only", body_style), Paragraph("Full Access (CRUD)", body_style), Paragraph("View Only", body_style)],
        [Paragraph("Record Direct Stock IN/OUT", body_style), Paragraph("ALLOWED", body_style), Paragraph("FORBIDDEN (403)", body_style), Paragraph("ALLOWED", body_style), Paragraph("FORBIDDEN (403)", body_style)],
        [Paragraph("Create / Edit Draft Challans", body_style), Paragraph("ALLOWED", body_style), Paragraph("ALLOWED", body_style), Paragraph("FORBIDDEN (403)", body_style), Paragraph("FORBIDDEN (403)", body_style)],
        [Paragraph("Confirm Sales Delivery Challan", body_style), Paragraph("ALLOWED", body_style), Paragraph("ALLOWED", body_style), Paragraph("ALLOWED", body_style), Paragraph("ALLOWED", body_style)]
    ]
    rbac_table = Table(rbac_data, colWidths=[2.2 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch])
    rbac_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(rbac_table)

    story.append(Spacer(1, 14))

    # Section 6: API Endpoint Reference & Testing Credentials
    story.append(Paragraph("6. REST API Reference & System Credentials", h1_style))
    story.append(Paragraph("<b>Base API Endpoint:</b> <code>http://localhost:5000/api</code>", body_style))

    api_data = [
        [Paragraph("<b>HTTP Method & Route</b>", body_style), Paragraph("<b>Protected / Roles</b>", body_style), Paragraph("<b>Description & Functionality</b>", body_style)],
        [Paragraph("<code>POST /api/auth/login</code>", body_style), Paragraph("Public", body_style), Paragraph("Authenticates email/password, returns JWT token & user profile", body_style)],
        [Paragraph("<code>GET /api/auth/me</code>", body_style), Paragraph("Bearer Auth", body_style), Paragraph("Returns current authenticated user details", body_style)],
        [Paragraph("<code>GET /api/customers</code>", body_style), Paragraph("Auth (All Roles)", body_style), Paragraph("Paginated list with ?search=, ?status=, ?customerType=", body_style)],
        [Paragraph("<code>POST /api/customers/:id/followups</code>", body_style), Paragraph("ADMIN, SALES, ACCOUNTS", body_style), Paragraph("Logs CRM client interaction note and updates next date", body_style)],
        [Paragraph("<code>GET /api/products/low-stock</code>", body_style), Paragraph("Auth (All Roles)", body_style), Paragraph("Returns products where currentStock <= minimumStock", body_style)],
        [Paragraph("<code>POST /api/stock-movements</code>", body_style), Paragraph("ADMIN, WAREHOUSE", body_style), Paragraph("Records direct IN/OUT stock movement with audit reason", body_style)],
        [Paragraph("<code>POST /api/challans</code>", body_style), Paragraph("ADMIN, SALES", body_style), Paragraph("Creates DRAFT challan with snapshot items (No stock change)", body_style)],
        [Paragraph("<code>POST /api/challans/:id/confirm</code>", body_style), Paragraph("Auth (All Roles)", body_style), Paragraph("Executes atomic stock deduction transaction ($transaction)", body_style)],
        [Paragraph("<code>GET /api/dashboard/stats</code>", body_style), Paragraph("Auth (All Roles)", body_style), Paragraph("Returns summary metrics, low stock alerts, upcoming follow-ups", body_style)]
    ]
    api_table = Table(api_data, colWidths=[2.2 * inch, 1.6 * inch, 3.2 * inch])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(api_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Pre-Seeded System Test Credentials:</b>", h2_style))

    cred_data = [
        [Paragraph("<b>Role</b>", body_style), Paragraph("<b>Email Address</b>", body_style), Paragraph("<b>Password</b>", body_style), Paragraph("<b>Primary Testing Focus</b>", body_style)],
        [Paragraph("ADMIN", body_style), Paragraph("<code>admin@test.com</code>", body_style), Paragraph("<code>Admin@123</code>", body_style), Paragraph("Full system management, deletion & user role view", body_style)],
        [Paragraph("SALES", body_style), Paragraph("<code>sales@test.com</code>", body_style), Paragraph("<code>Sales@123</code>", body_style), Paragraph("CRM follow-up logs, draft & confirm sales challans", body_style)],
        [Paragraph("WAREHOUSE", body_style), Paragraph("<code>warehouse@test.com</code>", body_style), Paragraph("<code>Warehouse@123</code>", body_style), Paragraph("Product catalog editing & direct IN/OUT stock entry", body_style)],
        [Paragraph("ACCOUNTS", body_style), Paragraph("<code>accounts@test.com</code>", body_style), Paragraph("<code>Accounts@123</code>", body_style), Paragraph("Financial records, customer detail & delivery note verification", body_style)]
    ]
    cred_table = Table(cred_data, colWidths=[1.1 * inch, 1.9 * inch, 1.4 * inch, 2.6 * inch])
    cred_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EFF6FF")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(cred_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF report at: {filename}")

if __name__ == "__main__":
    output_path = sys.argv[1] if len(sys.argv) > 1 else "Mini_ERP_CRM_Project_Explanation.pdf"
    build_pdf(output_path)
