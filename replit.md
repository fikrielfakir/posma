# StockFlow ERP - Multi-Tenant Enterprise Resource Planning System

## Overview

StockFlow ERP is a comprehensive multi-tenant enterprise resource planning system designed for Moroccan businesses. It provides complete inventory management, purchasing, sales, and AI-powered business intelligence features with full Moroccan fiscal compliance (TVA, ICE, IF, CNSS). The system supports multilingual interfaces (French, Arabic, Darija) with RTL layout support, multi-currency operations (MAD, EUR, USD), and is optimized for tablet/touch-first interactions following Microsoft Fluent Design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, React Context for app-wide state (language, currency, theme, warehouse selection)
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Design System**: Microsoft Fluent Design approach optimized for information-dense enterprise UIs with touch-friendly interactions
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **Charts**: Recharts for data visualization in dashboards and analytics
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses, all routes prefixed with `/api/`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod
- **Build Process**: Custom esbuild script for production bundling with selective dependency bundling for cold start optimization

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: Multi-tenant architecture with tenant isolation via `tenantId` foreign keys on all business entities
- **Key Entities**: Tenants, Users, Roles (with permissions JSONB), Warehouses, Product hierarchies (Family > Category > Subcategory > Product), Suppliers, Customers, Stock, Stock Movements, Purchase Orders, Sales, Inventory Sessions

### Multi-Tenancy Approach
- Each tenant has isolated data through `tenantId` references
- Tenant-specific settings include default currency, language, timezone, and Moroccan fiscal identifiers
- Role-based access control with granular permissions stored as JSONB arrays

### Internationalization
- Three language support: French (fr), Arabic (ar), Darija (darija)
- RTL layout support for Arabic/Darija with `dir` attribute
- Translation keys managed in `client/src/lib/i18n.ts`
- Currency formatting with position-aware symbols (MAD after, EUR/USD before)

### AI Features (Planned/Documented)
- Demand forecasting with LSTM models
- ABC/XYZ classification with Random Forest
- Customer churn prediction with XGBoost
- Semantic search with BERT embeddings
- Conversational chatbot with GPT-4 fine-tuning
- Computer vision for product recognition and inventory counting

## External Dependencies

### Database
- PostgreSQL (provisioned via Replit, connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations
- `connect-pg-simple` for session storage

### UI Framework
- Radix UI primitives (dialog, dropdown, select, tabs, etc.)
- shadcn/ui components configured via `components.json`
- Tailwind CSS with custom theme configuration
- Lucide React for icons
- Recharts for charting

### Build & Development Tools
- Vite for frontend development and bundling
- esbuild for server-side bundling
- TypeScript for type safety across the stack
- Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)

### Fonts
- Inter (primary font via Google Fonts CDN)
- IBM Plex Mono (monospace)

### Form Handling
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration

### Date/Time
- date-fns for date manipulation
- Timezone support configured for Morocco (Africa/Casablanca, GMT+1)