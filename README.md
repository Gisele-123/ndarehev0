# NDAREHE.COM - Accommodation & Local Experience Booking Platform

A comprehensive digital platform connecting people with affordable accommodation options across Rwanda, focusing on both urban and rural areas.

**Backend Developer**: Assia Teta

## 🏗️ Project Structure

```
NDAREHE/
├── backend/           # Backend API (Node.js + TypeScript)
│   ├── src/          # Source code
│   ├── prisma/       # Database schema and migrations
│   ├── package.json  # Backend dependencies
│   └── .env         # Backend environment variables
├── frontend/         # Frontend application (Future)
└── README.md        # This file
```

## 🚀 Quick Start

### Backend Development

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Access the API:**
   - **API Server**: http://localhost:5000
   - **Swagger Documentation**: http://localhost:5000/api-docs
   - **Health Check**: http://localhost:5000/health

## 📚 Documentation

- **Backend API Documentation**: See `backend/README.md` for detailed API documentation
- **Integration Status**: See `backend/INTEGRATION_STATUS.md` for email, SMS, and payment integration details
- **Swagger UI**: Interactive API documentation at http://localhost:5000/api-docs

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Email**: Nodemailer
- **SMS**: Twilio
- **Payments**: Stripe
- **Documentation**: Swagger/OpenAPI 3.0

### Frontend (Future)
- **Framework**: React/Next.js
- **Styling**: Tailwind CSS
- **State Management**: Redux/Zustand
- **UI Components**: Headless UI/Radix UI

## 🌟 Features

### Accommodation Booking
- Hotels, guesthouses, apartments, villas, hostels, camping, homestays
- Advanced filtering and search
- Real-time availability
- Instant booking confirmation

### Transportation Services
- Airport pickups
- City transport
- Private transportation
- Vehicle type selection

### Tours & Experiences
- Cultural tours
- Adventure tours
- Food tours
- Educational tours
- Custom tour planning

### Trip Planning
- Personalized recommendations
- Budget planning
- Multi-day itineraries
- Local expert consultation

### Payment Integration
- Multiple payment methods
- Secure payment processing
- Mobile money support
- International cards

### Communication
- Email notifications
- SMS alerts
- Real-time updates
- Multi-language support

## 🔐 Security Features

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email` - Email verification

### Accommodations
- `GET /api/accommodations` - List accommodations
- `GET /api/accommodations/:id` - Get accommodation details
- `POST /api/accommodations` - Create accommodation (Admin/Provider)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get payment history

### And many more... See Swagger documentation for complete list.

## 🚀 Deployment

### Backend Deployment
1. Navigate to backend directory
2. Set production environment variables
3. Run `npm run build`
4. Start with `npm start`

### Environment Variables
See `backend/.env.example` for all required environment variables.

## 👨‍💻 Development Team

- **Backend Developer**: Assia Teta
- **Project**: NDAREHE.COM Backend API
- **Technologies**: Node.js, TypeScript, Express, PostgreSQL, Prisma

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: info@ndarehe.com
- Phone: +250 788 123 456
- **Backend Developer**: Assia Teta

## 📝 License

This project is licensed under the MIT License.

---

**NDAREHE.COM** - Where to stay in Rwanda 🇷🇼 #   n d a r e h e 
 
 

->

# 🏠 NDAREHE.COM - Rwanda's Premier Booking Platform

<div align="center">

![NDAREHE Logo](https://img.shields.io/badge/NDAREHE-Rwanda's%20Travel%20Platform-green?style=for-the-badge&logo=home)

**Where to stay and what to explore in Rwanda** 🇷🇼

[![Backend](https://img.shields.io/badge/Backend-Node.js%20+%20TypeScript-blue)](./backend)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-cyan)](./frontend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)](https://postgresql.org)
[![Payments](https://img.shields.io/badge/Payments-Stripe%20+%20Flutterwave-success)](./backend/FLUTTERWAVE_SETUP.md)

</div>

---

## 📖 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Technology Stack](#️-technology-stack)
- [🔧 Development](#-development)
- [🌐 API Documentation](#-api-documentation)
- [💳 Payment Integration](#-payment-integration)
- [🚀 Deployment](#-deployment)
- [👥 Team](#-team)
- [📞 Support](#-support)

---

## 🎯 Overview

**NDAREHE.COM** is a comprehensive digital platform that connects travelers with authentic accommodation options and local experiences across Rwanda. Our mission is to make Rwanda more accessible to both local and international visitors while supporting local communities.

### 🌟 Why NDAREHE?

- **🏡 Diverse Accommodations**: From luxury hotels to cozy homestays
- **🚗 Complete Transportation**: Airport pickups, city transport, private vehicles
- **🎭 Local Experiences**: Cultural tours, adventure activities, educational programs
- **💰 Affordable Options**: Budget-friendly choices for every traveler
- **📱 Easy Booking**: Seamless booking experience with instant confirmation
- **🔒 Secure Payments**: Multiple payment methods including mobile money

---

## ✨ Features

<table>
  <tr>
    <td>

### 🏨 Accommodation Booking
- **Hotels & Guesthouses**
- **Apartments & Villas**
- **Hostels & Camping**
- **Homestays & Rural Lodges**
- **Real-time availability**
- **Instant confirmation**

    </td>
    <td>

### 🚗 Transportation Services
- **Airport pickup/drop-off**
- **City transportation**
- **Private vehicle hire**
- **Tour transport**
- **Multiple vehicle types**
- **Professional drivers**

    </td>
  </tr>
  <tr>
    <td>

### 🎭 Tours & Experiences
- **Cultural heritage tours**
- **Adventure activities**
- **Food & culinary tours**
- **Educational programs**
- **Custom itineraries**
- **Local expert guides**

    </td>
    <td>

### 📱 Smart Features
- **AI-powered recommendations**
- **Multi-language support**
- **Mobile-responsive design**
- **Real-time notifications**
- **Trip planning tools**
- **24/7 customer support**

    </td>
  </tr>
</table>

---

## 🏗️ Architecture

```mermaid
graph TB
    A[Frontend - React + TypeScript] --> B[API Gateway - Express.js]
    B --> C[Authentication Service - JWT]
    B --> D[Booking Service]
    B --> E[Payment Service]
    B --> F[Notification Service]
    
    D --> G[PostgreSQL Database]
    E --> H[Stripe Payment Gateway]
    E --> I[Flutterwave Payment Gateway]
    F --> J[Email Service - Nodemailer]
    F --> K[SMS Service - Twilio]
```

### 📁 Project Structure

```
NDAREHE/
├── 🗂️ backend/                 # Backend API (Node.js + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 config/          # Database, Swagger configuration
│   │   ├── 📁 middleware/      # Auth, validation, error handling
│   │   ├── 📁 routes/          # API endpoints
│   │   ├── 📁 utils/           # Utilities (email, SMS, payments)
│   │   └── 📄 server.ts        # Entry point
│   ├── 📁 prisma/              # Database schema & migrations
│   └── 📄 package.json         # Dependencies
│
├── 🗂️ frontend/                # Frontend App (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/           # Application pages
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 lib/             # Utilities & API client
│   │   └── 📄 main.tsx         # Entry point
│   └── 📄 package.json         # Dependencies
│
└── 📄 README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ 
- **PostgreSQL** v13+
- **npm** or **yarn**

### 🔧 Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:seed         # Seed initial data

# 5. Start development server
npm run dev
```

### 🎨 Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### 🌐 Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:5000 | API server |
| **API Docs** | http://localhost:5000/api-docs | Swagger documentation |
| **Health Check** | http://localhost:5000/health | Server status |

---

## 🛠️ Technology Stack

<div align="center">

### Backend Technologies
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)

### Frontend Technologies
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

### Integrations
[![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://twilio.com)

</div>

---

## 🔧 Development

### 📝 Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend `.env`:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ndarehe"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Payment Gateways
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
FLW_PUBLIC_KEY="FLWPUBK_TEST-your-flutterwave-public-key"
FLW_SECRET_KEY="FLWSECK_TEST-your-flutterwave-secret-key"

# Email Service
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# SMS Service
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Server Configuration
PORT=5000
NODE_ENV="development"
BACKEND_URL="http://localhost:5000"
```

### 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### 🛠️ Useful Commands

```bash
# Database operations
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio
npm run db:migrate       # Create new migration

# Code quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript check

# Build for production
npm run build           # Build application
npm run preview         # Preview production build
```

---

## 🌐 API Documentation

### 📊 Core Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | User registration | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `GET` | `/api/accommodations` | List accommodations | ❌ |
| `GET` | `/api/accommodations/:id` | Get accommodation details | ❌ |
| `POST` | `/api/bookings` | Create booking | ✅ |
| `GET` | `/api/bookings` | Get user bookings | ✅ |
| `POST` | `/api/payments/stripe` | Process Stripe payment | ✅ |
| `POST` | `/api/payments/flutterwave` | Process Flutterwave payment | ✅ |

### 📖 Complete Documentation

- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Integration Guide**: [backend/INTEGRATION_STATUS.md](./backend/INTEGRATION_STATUS.md)
- **Payment Setup**: [backend/FLUTTERWAVE_SETUP.md](./backend/FLUTTERWAVE_SETUP.md)

---

## 💳 Payment Integration

NDAREHE supports multiple payment methods to cater to both local and international users:

### 🌍 International Payments
- **Stripe**: Credit/debit cards worldwide
- **PayPal**: Global payment solution

### 🇷🇼 Local Payments (Rwanda)
- **Mobile Money**: MTN MoMo, Airtel Money
- **Bank Transfers**: Local Rwandan banks
- **Flutterwave**: Pan-African payment gateway

### 🔐 Security Features
- PCI DSS compliant
- End-to-end encryption
- Fraud detection
- 3D Secure authentication

---

## 🚀 Deployment

### 🌐 Production Deployment

#### Backend (Node.js)
```bash
# Build the application
npm run build

# Start production server
npm start

# Using PM2 (recommended)
pm2 start ecosystem.config.js
```

#### Frontend (React)
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

### ☁️ Cloud Deployment Options

| Platform | Backend | Frontend | Database |
|----------|---------|----------|----------|
| **Vercel** | ✅ | ✅ | ❌ |
| **Netlify** | ❌ | ✅ | ❌ |
| **Railway** | ✅ | ✅ | ✅ |
| **Render** | ✅ | ✅ | ✅ |
| **Heroku** | ✅ | ❌ | ✅ |

### 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

---

## 👥 Team

<div align="center">

### 🧑‍💻 Development Team

| Role | Name | Contact |
|------|------|---------|
| **Backend Developer** | Assia Teta | assia@ndarehe.com |
| **Frontend Developer** | [Your Name] | [your-email] |
| **Project Manager** | [PM Name] | [pm-email] |

</div>

---

## 📞 Support

<div align="center">

### 🤝 Get Help

[![Email](https://img.shields.io/badge/Email-info@ndarehe.com-red?style=for-the-badge&logo=gmail)](mailto:info@ndarehe.com)
[![Phone](https://img.shields.io/badge/Phone-+250_788_123_456-green?style=for-the-badge&logo=phone)](tel:+250788123456)
[![Website](https://img.shields.io/badge/Website-ndarehe.com-blue?style=for-the-badge&logo=google-chrome)](https://ndarehe.com)

### 🐛 Found a Bug?

1. Check existing [issues](../../issues)
2. Create a [new issue](../../issues/new)
3. Provide detailed description
4. Include steps to reproduce

### 💡 Feature Requests

We'd love to hear your ideas! Open an issue with the `enhancement` label.

</div>

---

<div align="center">

### 🎉 Thank You for Using NDAREHE!

**Made with ❤️ in Rwanda** 🇷🇼

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](package.json)

---

**"Ndarehe mu Rwanda"** - *Where to stay in Rwanda*

</div>