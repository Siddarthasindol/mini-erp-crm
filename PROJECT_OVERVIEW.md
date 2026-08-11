# Mini ERP + CRM Operations Portal

A professional overview of the Mini ERP + CRM project, ready to share as a document link.

## Repository
- GitHub: https://github.com/Siddarthasindol/mini-erp-crm

## Project Summary
Mini ERP + CRM is a full-stack enterprise-grade operations portal designed for wholesale distribution businesses. It combines customer relationship management (CRM) features with inventory and stock control to provide a single platform for sales, warehouse, and accounts teams.

## Key Capabilities
- Role-based access control for Admin, Sales, Warehouse, and Accounts
- Customer pipeline and follow-up tracking
- Delivery challan creation with draft and confirmation workflows
- Atomic stock adjustment and audit trail for inventory movements
- Low-stock monitoring and product management
- Secure authentication with JWT and encrypted passwords

## Technical Architecture
- Frontend: React 18, TypeScript, Vite, React Router v6
- Backend: Node.js, Express, TypeScript, Prisma
- Database: PostgreSQL (Prisma ORM)
- Deployment-ready architecture for modern cloud platforms

## Repository Structure
- `frontend/`: UI code, routing, API service layer, and components
- `backend/`: API controllers, service layer, middleware, Prisma schema, and server entrypoint
- `postman/`: API collection for testing endpoints
- `docker-compose.yml`: local development environment setup
- `.env.example`: environment variable template

## Developer Workflow
1. Clone the repository
2. Configure environment variables from `.env.example`
3. Install backend dependencies and run the server
4. Install frontend dependencies and run the Vite development server

## CI / Build
A GitHub Actions workflow is configured at `.github/workflows/ci.yml` to build both backend and frontend on push and pull requests.

## Shareable Document Link
Use this GitHub file URL in your Google Form:

https://github.com/Siddarthasindol/mini-erp-crm/blob/master/PROJECT_OVERVIEW.md

---

If you want, I can also generate a second document for stakeholder-facing release notes or deployment instructions.