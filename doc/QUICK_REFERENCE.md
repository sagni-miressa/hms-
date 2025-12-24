# 🚀 Quick Reference Card

## Start Development (3 Commands)

```bash
npm install                          # Install dependencies
docker-compose up -d                 # Start services
npm run dev                          # Start servers
```

**Access**:

- Backend: http://localhost:3000
- Frontend: http://localhost:3005
- Health: http://localhost:3000/health

## Test Credentials

```
Admin:      admin@hiring-system.com / Admin@123456
HR:         hr@hiring-system.com / HRManager@123
Recruiter:  recruiter@hiring-system.com / Recruiter@123
Interviewer: interviewer@hiring-system.com / Interviewer@123
Applicant:  applicant@example.com / Applicant@123
```

## Common Commands

```bash
# Database
cd backend
npx prisma generate              # Generate Prisma client
npx prisma migrate dev           # Run migrations
npx prisma studio                # Database GUI (localhost:5555)
npm run seed                     # Seed test data

# Development
npm run dev                      # Start both (root)
npm run dev -w backend           # Backend only
npm run dev -w frontend          # Frontend only

# Docker
docker-compose ps                # Check status
docker-compose logs -f backend   # View logs
docker-compose restart redis     # Restart service
docker-compose down              # Stop all

# Testing
npm run test -w backend          # Backend tests
npm run lint -w backend          # Lint check
npm run format -w backend        # Format code
```

## File Structure

```
backend/
  src/config/         → Constants, DB, Redis
  src/middleware/     → Auth, validation, rate limit
  src/services/       → Business logic
  src/routes/         → API endpoints
  prisma/schema.prisma → Database schema

frontend/
  src/pages/          → Route components
  src/services/       → API clients
  src/stores/         → State management
  src/lib/api.ts      → Axios instance
```

## API Endpoints

```
POST   /api/v1/auth/register      # Register (public)
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/logout         # Logout
POST   /api/v1/auth/refresh        # Refresh token
GET    /api/v1/auth/me             # Current user

GET    /api/v1/jobs                # List jobs
GET    /api/v1/jobs/:id            # Get job
POST   /api/v1/jobs                # Create job (recruiter+)
PATCH  /api/v1/jobs/:id            # Update job
DELETE /api/v1/jobs/:id            # Delete job (HR+)

GET    /api/v1/applications        # List applications
GET    /api/v1/applications/:id   # Get application
POST   /api/v1/applications        # Apply to job
PATCH  /api/v1/applications/:id/status  # Update status (recruiter+)
POST   /api/v1/applications/:id/feedback # Add feedback (interviewer+)
POST   /api/v1/applications/:id/offer    # Make offer (HR+)
```

## Authorization Layers

```
RBAC  → Role-based (6 roles)
MAC   → Clearance-based (4 levels: PUBLIC → RESTRICTED)
DAC   → Resource-specific ACLs
ABAC  → Attribute-based (department, context)
RuBAC → Rule-based (time, location, device)
```

## Roles & Permissions

```
APPLICANT    → Apply to jobs, view own data
RECRUITER    → Manage jobs (dept), review applications
INTERVIEWER  → View assigned, submit feedback
HR_MANAGER   → All recruiter + offers, salaries
AUDITOR      → Read-only audit logs
SYSTEM_ADMIN → Full access
```

## Clearance Levels

```
PUBLIC       → Job listings
INTERNAL     → Application data, internal notes
CONFIDENTIAL → Salaries, offers
RESTRICTED   → System config, admin functions
```

## Environment Variables (Critical)

```env
# Backend (.env)
DATABASE_URL=postgresql://hiring_user:hiring_password_dev@localhost:5432/hiring_system
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=<generate-with-openssl>
JWT_REFRESH_SECRET=<generate-with-openssl>
NODE_ENV=development
PORT=3000

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api/v1
```

## Troubleshooting

```bash
# Port in use?
lsof -i :3000  # Backend
lsof -i :3005  # Frontend

# Database not connecting?
docker-compose ps postgres
docker-compose logs postgres
docker-compose exec postgres pg_isready -U hiring_user

# Redis not connecting?
docker-compose exec redis redis-cli ping

# Clear everything and restart
docker-compose down -v
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
docker-compose up -d
npm run dev
```

## Security Checklist

```
✅ JWT secrets are strong (64+ chars)
✅ Passwords hashed with bcrypt (12 rounds)
✅ MFA enabled for admins
✅ Rate limiting active
✅ CORS configured
✅ Input validation (Zod)
✅ Audit logging enabled
✅ HTTPS in production
✅ Environment secrets not committed
✅ Database backups configured
```

## Performance Tips

```
✅ Redis caching (10-min TTL)
✅ Database indexes on common queries
✅ Connection pooling
✅ Read replicas for scaling
✅ Gzip compression
✅ Code splitting (frontend)
```

## Deployment

```bash
# Production build
npm run build -w backend
npm run build -w frontend

# Docker production
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Health check
curl http://localhost/health
```

## Monitoring

```bash
# Logs
tail -f backend/logs/combined-$(date +%Y-%m-%d).log
docker-compose logs -f

# Health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/health/ready

# Database queries
cd backend && npx prisma studio
```

## Backup

```bash
# Database
docker-compose exec postgres pg_dump -U hiring_user hiring_system > backup.sql

# Redis
docker-compose exec redis redis-cli BGSAVE
docker cp hiring_redis:/data/dump.rdb ./redis_backup.rdb
```

## Documentation

- **README.md** - System overview
- **SETUP.md** - Quick start (5 min)
- **DEPLOYMENT.md** - Production guide
- **SECURITY.md** - Security deep-dive
- **PROJECT_SUMMARY.md** - Complete implementation details

## Need Help?

1. Check health endpoints
2. Review logs (`docker-compose logs -f`)
3. Verify environment variables
4. Check database/Redis connections
5. Review SETUP.md for detailed steps
6. Check SECURITY.md for security questions

---

**Happy coding! 🚀**

_Last updated: December 18, 2025_
