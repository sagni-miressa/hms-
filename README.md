# Hiring Management System

**Enterprise-grade Applicant Tracking System with Military-Grade Security**

Built by a 10+ year Senior Full-Stack Developer following zero-trust architecture principles.

## 🔐 Security Features

- **Multi-Layer Authorization**: RBAC, MAC, DAC, ABAC, RuBAC
- **Zero-Trust Architecture**: Every request authenticated & authorized
- **Comprehensive Audit Logging**: Immutable, non-repudiable audit trails
- **MFA Support**: TOTP-based two-factor authentication
- **Advanced Rate Limiting**: Redis-backed, per-IP and per-user
- **Secure File Handling**: Virus scanning, isolated storage, presigned URLs
- **TLS 1.3**: Modern transport security with HSTS
- **Input Validation**: Zod schemas at every layer
- **OWASP Compliance**: Protection against top 10 vulnerabilities

## 🏗️ Architecture

### Backend Stack

- **Runtime**: Node.js 20+ with TypeScript (strict mode)
- **Framework**: Express with comprehensive middleware pipeline
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for permissions, rate limits, sessions
- **Authentication**: JWT (RS256) with refresh tokens
- **File Storage**: S3-compatible object storage
- **Logging**: Winston with structured JSON + ELK integration
- **Monitoring**: Prometheus metrics + Sentry error tracking

### Frontend Stack

- **Build Tool**: Vite
- **Framework**: React 18 with TypeScript
- **Routing**: TanStack Router
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod validation
- **UI**: Tailwind CSS + Headless UI
- **Testing**: Vitest + Playwright

## 📁 Project Structure

```
hiring-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration & constants
│   │   ├── middleware/      # Express middleware (auth, validation, etc.)
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Prisma models
│   │   ├── utils/           # Helper functions
│   │   ├── types/           # TypeScript definitions
│   │   └── app.ts           # Express app setup
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── tests/               # Integration & unit tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── features/        # Feature-sliced architecture
│   │   ├── components/      # Shared components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities
│   │   ├── services/        # API clients
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml       # Local development environment
└── package.json             # Workspace root
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for local services)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd hiring-management-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start services with Docker** (optional)

```bash
docker-compose up -d
```

5. **Run database migrations**

```bash
npm run migrate -w backend
```

6. **Seed initial data** (optional)

```bash
npm run seed -w backend
```

7. **Start development servers**

```bash
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## 🔑 User Roles

| Role         | Clearance    | Permissions                                   |
| ------------ | ------------ | --------------------------------------------- |
| APPLICANT    | PUBLIC       | Apply to jobs, view own applications          |
| RECRUITER    | INTERNAL     | Create jobs, review applications              |
| INTERVIEWER  | INTERNAL     | View assigned candidates, submit feedback     |
| HR_MANAGER   | CONFIDENTIAL | All recruiter + approve offers, view salaries |
| AUDITOR      | CONFIDENTIAL | Read-only access to all audit logs            |
| SYSTEM_ADMIN | RESTRICTED   | Full system access, manage users              |

## 📚 Documentation

### Authentication & Security

- **[Complete Authentication Guide](doc/AUTHENTICATION_COMPLETE_GUIDE.md)** - Comprehensive guide covering:

  - Authentication setup and configuration
  - End-to-end authentication flow
  - Token management and refresh
  - Frontend integration
  - Security features and best practices
  - Troubleshooting guide

- **[Authentication Flow](doc/AUTHENTICATION_FLOW.md)** - Detailed technical flow documentation

- **[Security Architecture](doc/SECURITY.md)** - Security architecture and guidelines

- **[Environment Setup](doc/ENVIRONMENT_SETUP.md)** - Environment variables and configuration

- **[Backup & Logging Setup](doc/BACKUP_AND_LOGGING_SETUP.md)** - Automated backups and centralized logging configuration

- **[Testing Guide](doc/TESTING_GUIDE.md)** - Comprehensive step-by-step testing guide for all features and security requirements

### API Documentation

API documentation available at:

- Development: http://localhost:3000/api-docs
- OpenAPI spec: http://localhost:3000/api-docs/openapi.json

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit -w backend

# Integration tests
npm run test:integration -w backend

# E2E tests
npm run test:e2e -w frontend

# Security scans
npm run test:security -w backend
```

## 🔒 Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate JWT secrets** - Regularly update production secrets
3. **Monitor audit logs** - Set up alerts for suspicious activity
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use MFA in production** - Enforce for privileged roles
6. **Rate limit aggressively** - Protect against brute force
7. **Validate all inputs** - Trust nothing from clients
8. **Log everything** - But never log sensitive data

## 📈 Performance Optimization

- **Permission caching**: 10-minute Redis cache with instant invalidation
- **Database indexes**: Optimized for common queries
- **Connection pooling**: Reuse database connections
- **Read replicas**: Scale reads separately from writes
- **CDN for static assets**: Serve frontend from edge locations

## 🐳 Deployment

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Enable TLS 1.3 with HSTS
- [ ] Configure firewall rules
- [ ] Setup database backups
- [ ] Enable Redis persistence
- [ ] Configure log aggregation
- [ ] Setup monitoring & alerts
- [ ] Run security audit
- [ ] Load test critical paths
- [ ] Document rollback procedures

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

See `k8s/` directory for manifests.

## 📝 License

Proprietary - All Rights Reserved

## 👨‍💻 Author

Senior Full-Stack Developer with 10+ years experience
December 18, 2025

---

**"This system protects people's careers and company reputation. Build it with paranoia, test it with malice, and maintain it with discipline."**

# hms
