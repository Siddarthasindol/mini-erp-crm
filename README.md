# Mini ERP + CRM Operations Portal

A complete, production-quality Full Stack Developer Operations & Inventory Management Portal built from scratch for wholesale and distribution enterprises.

---

## 1. Project Overview & Business Problem

Wholesale and distribution companies manage high-volume B2B operations involving multiple stakeholders: Sales Teams (tracking leads & client follow-ups), Warehouse Personnel (managing physical stock & locations), and Accounts Officers (verifying invoices & delivery notes).

A frequent critical issue in traditional systems is **uncontrolled stock deduction** where sales drafts accidentally reduce inventory or partial stock deductions leave orders half-fulfilled, causing negative stock levels, phantom stock, and shipping delays.

**Mini ERP + CRM Operations Portal** solves this problem by providing:
- **Strict Role-Based Authorization** (Admin, Sales, Warehouse, Accounts).
- **CRM Customer Pipeline & Follow-up Tracking**.
- **Real-Time Inventory Management** with low-stock alerts and location tracking.
- **Transactional Sales Delivery Challans**: Saving a challan as `DRAFT` does **NOT** touch inventory. Confirmation executes an **atomic database transaction** verifying stock for every product line before deducting stock and logging `OUT` stock movement audit records. If any item is out of stock, the entire confirmation fails and rolls back.

---

## 2. Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, Axios, Lucide Icons, Custom CSS Design System.
- **Backend**: Node.js, TypeScript, Express.js, JWT Authentication, bcryptjs password hashing.
- **Database & ORM**: PostgreSQL, Prisma ORM.
- **Deployment Ready**: Vercel/Netlify (Frontend), Render/Railway (Backend), Neon/Supabase/Render (PostgreSQL).

---

## 3. Architecture & Control Flow

### System Architecture Diagram

```
React (TypeScript + Vite)
       │
       ▼ (HTTP REST APIs with JWT Bearer Header)
Express REST API Server (Node.js + TypeScript)
       │
   Middleware (helmet, cors, authMiddleware, roleMiddleware, errorHandler)
       │
   Controllers (auth, customer, product, stock, challan, dashboard)
       │
   Services (Business Logic & Database Transactions)
       │
   Prisma ORM (Schema & Client)
       │
   PostgreSQL Database
```

### Authentication Flow

```
React (Login Page) ──(POST /api/auth/login)──> Express Controller
                                                    │
                                         verify bcrypt password
                                                    │
                                          generate signed JWT
                                                    │
React LocalStorage <───(token + user)───────────────┘
       │
   Attach Authorization: Bearer <token>
       │
   Protected Route / Controller API Call ──> Auth Middleware (Verify Token)
                                                   │
                                            Role Middleware (Check RBAC)
                                                   │
                                            Protected Business Logic
```

---

## 4. Folder Structure

```
mini-erp-crm/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Button, Input, Modal, Badge, Card, Pagination, Loader, ConfirmDialog
│   │   │   ├── layout/       # Sidebar, Navbar, MainLayout
│   │   │   ├── customers/    # CustomerFormModal, FollowUpModal
│   │   │   ├── products/     # ProductFormModal, LowStockBadge
│   │   │   ├── stock/        # StockMovementModal
│   │   │   └── challans/     # Delivery Note details & line items
│   │   ├── pages/            # Login, Dashboard, Customers, CustomerDetail, Products, StockMovements, Challans, CreateChallan, ChallanDetail
│   │   ├── services/         # api.ts, authService, customerService, productService, stockService, challanService, dashboardService
│   │   ├── context/          # AuthContext.tsx, ToastContext.tsx
│   │   ├── hooks/            # useAuth.ts, useToast.ts
│   │   ├── routes/           # AppRoutes.tsx, ProtectedRoute.tsx
│   │   ├── types/            # index.ts (Full TypeScript data interfaces)
│   │   ├── utils/            # formatters.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/      # auth, customer, product, stock, challan, dashboard controllers
│   │   ├── services/         # Business logic layer & database transactions
│   │   ├── routes/           # Express router endpoints
│   │   ├── middleware/       # auth, role authorization, validation, error handler
│   │   ├── utils/            # jwt, password, response formatters, errors, challan number generator
│   │   ├── validators/       # Request input validation rules
│   │   ├── config/           # env configuration & Prisma client instance
│   │   └── server.ts         # Express server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Production PostgreSQL schema
│   │   └── seed.ts           # Seeding script with realistic Indian wholesale data
│   ├── package.json
│   └── tsconfig.json
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Database Schema & Models

- **User**: System user accounts (`id`, `name`, `email` [unique], `password` [hashed], `role` [ADMIN, SALES, WAREHOUSE, ACCOUNTS], timestamps).
- **Customer**: B2B customer accounts (`id`, `name`, `mobile`, `email`, `businessName`, `gstNumber`, `customerType` [RETAIL, WHOLESALE, DISTRIBUTOR], `address`, `status` [LEAD, ACTIVE, INACTIVE], `followUpDate`, `notes`, timestamps).
- **CustomerFollowUp**: CRM follow-up audit trail (`id`, `customerId`, `note`, `followUpDate`, `createdBy`, `createdAt`).
- **Product**: Inventory items (`id`, `name`, `sku` [unique], `category`, `unitPrice`, `currentStock`, `minimumStock`, `warehouseLocation`, timestamps).
- **StockMovement**: Direct IN/OUT inventory audit logs (`id`, `productId`, `quantity`, `movementType` [IN, OUT], `reason`, `createdBy`, `createdAt`).
- **Challan**: Delivery Challan header (`id`, `challanNumber` [unique, CH-XXXXX], `customerId`, `totalQuantity`, `status` [DRAFT, CONFIRMED, CANCELLED], `createdBy`, timestamps).
- **ChallanItem**: Delivery Line items (`id`, `challanId`, `productId`, `productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`, `quantity`). *Contains historical snapshot data to preserve line records even if product details change later.*

---

## 6. Business Logic & Critical Challan Transaction Rules

1. **SKU & Email Uniqueness**: SKU codes and User emails are unique constraints in the database.
2. **Non-Negative Constraints**: Product prices, stock levels, and minimum stock thresholds cannot be negative.
3. **Low-Stock Alert Rule**: A product is flagged as Low Stock when `currentStock <= minimumStock`.
4. **Draft Sales Challans**:
   - Creating or editing a `DRAFT` challan **NEVER** reduces product stock.
   - Product snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) are stored in `ChallanItem`.
5. **Atomic Confirmation Transaction (`$transaction`)**:
   - When `POST /api/challans/:id/confirm` is invoked:
     1. Verifies challan exists and is currently in `DRAFT` status.
     2. Loads all line items and checks `currentStock` for every requested product.
     3. **Insufficient Stock Rejection**: If any product has `currentStock < requestedQuantity`, the request immediately fails with HTTP 400: `"Insufficient stock for [Product Name]. Available: [X], Requested: [Y]"`. No partial updates occur.
     4. Performs atomic stock updates: deducts `currentStock` for all items, creates an `OUT` `StockMovement` audit record for each item, and sets status to `CONFIRMED`.
6. **Stock Movement Rules**:
   - Direct `IN` increases stock.
   - Direct `OUT` decreases stock (fails if stock insufficient).

---

## 7. Role-Based Access Control (RBAC Matrix)

| Module / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| Login / Profile | ✅ | ✅ | ✅ | ✅ |
| Dashboard Stats | ✅ | ✅ | ✅ | ✅ |
| View Customers | ✅ | ✅ | ✅ | ✅ |
| Create / Edit Customers | ✅ | ✅ | ❌ | ✅ |
| Delete Customers | ✅ | ❌ | ❌ | ❌ |
| Add CRM Follow-up | ✅ | ✅ | ❌ | ✅ |
| View Products | ✅ | ✅ | ✅ | ✅ |
| Create / Edit / Delete Products | ✅ | ❌ | ✅ | ❌ |
| View Stock Movements | ✅ | ❌ | ✅ | ❌ |
| Record Stock Movement (IN/OUT) | ✅ | ❌ | ✅ | ❌ |
| View Sales Challans | ✅ | ✅ | ✅ | ✅ |
| Create / Edit Draft Challans | ✅ | ✅ | ❌ | ❌ |
| Confirm Sales Challans | ✅ | ✅ | ✅ | ✅ |
| Cancel Challans | ✅ | ✅ | ❌ | ❌ |

---

## 8. Test Credentials

The database seed script populates 4 ready-to-use role accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@test.com` | `Admin@123` |
| **SALES** | `sales@test.com` | `Sales@123` |
| **WAREHOUSE** | `warehouse@test.com` | `Warehouse@123` |
| **ACCOUNTS** | `accounts@test.com` | `Accounts@123` |

---

## 9. Local Setup & Running Instructions

### Prerequisites
- Node.js v18+ and npm installed.
- PostgreSQL running locally OR Docker Desktop OR cloud PostgreSQL (Neon / Supabase).

### Environment Setup

1. Copy `.env.example` to `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minierp_db?schema=public"
   JWT_SECRET=super_secret_jwt_key_mini_erp_crm_2026
   FRONTEND_URL=http://localhost:5173
   ```

2. Copy `.env.example` to `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running with Local PostgreSQL / Docker

1. **Start PostgreSQL with Docker** (Optional):
   ```bash
   docker-compose up -d
   ```

2. **Install & Run Backend**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run seed
   npm run dev
   ```
   Backend will start on `http://localhost:5000/api`.

3. **Install & Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`.

---

## 10. Postman Collection

A complete Postman collection is included at `postman/Mini-ERP-CRM.postman_collection.json`.

- Import into Postman.
- Set collection variable `baseUrl` to `http://localhost:5000/api`.
- Run **Login Admin** request. The test script automatically stores the JWT token into `{{token}}` for all subsequent requests.

---

## 11. Deployment Instructions

### Database (Neon / Supabase / Render PostgreSQL)
1. Create a free PostgreSQL instance on Neon.tech, Supabase, or Render.
2. Obtain connection string `postgresql://user:password@host/dbname?sslmode=require`.

### Backend (Render / Railway)
1. Deploy `backend` directory.
2. Set Environment Variables:
   - `DATABASE_URL`: Cloud PostgreSQL string
   - `JWT_SECRET`: Random secure string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Deployed Vercel URL
3. Build Command: `npm install && npm run prisma:generate && npm run build`
4. Start Command: `npm start`
5. Database Push / Seed: `npx prisma db push && npm run seed`

### Frontend (Vercel / Netlify)
1. Deploy `frontend` directory.
2. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`
3. Build Command: `npm run build`
4. Output Directory: `dist`

---

## 12. Git Commit Sequence Recommendation

```bash
git init
git add .
git commit -m "Initial commit: Modular structure & configuration"
git commit -m "Setup Prisma ORM schema and database models"
git commit -m "Implement JWT authentication & role-based middleware"
git commit -m "Implement Customer CRM endpoints & follow-up tracking"
git commit -m "Implement Inventory Products & low-stock alerts"
git commit -m "Implement Stock Movements audit logs & validation"
git commit -m "Implement Sales Challan transactional stock logic"
git commit -m "Build React TypeScript frontend dashboard & components"
git commit -m "Connect frontend services with backend REST API"
git commit -m "Add Postman collection, seed data, and documentation"
```

---

## 13. Known Limitations & Future Improvements

- **Print & PDF Export**: Currently uses native browser print stylesheets for delivery notes; can be upgraded to PDF generation (`pdfmake` or `react-pdf`).
- **Batch / Serial Number Tracking**: Can add serial number tracking per ChallanItem for high-value machinery.
- **Multilingual Support**: Can add i18n translation for multi-region Indian operations.
