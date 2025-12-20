# Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites

- Node.js 20+ installed
- Docker & Docker Compose installed
- Git installed

### Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd ATS

# Install all dependencies
npm install
```

### Step 2: Start Services

```bash
# Start PostgreSQL, Redis, MinIO
docker-compose up -d

# Wait for services (about 30 seconds)
docker-compose ps
```

### Step 3: Setup Database

```bash
# Generate Prisma Client
cd backend
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed with test data
npm run seed
cd ..
```

### Step 4: Configure Environment

The project includes a working `.env.example`. For local development, you can use it as-is or copy it:

```bash
# Optional: Copy and customize
cp backend/.env.example backend/.env
```

Default configuration works with Docker services.

### Step 5: Start Development Servers

```bash
# From project root, start both backend and frontend
npm run dev
```

**Backend**: http://localhost:3000  
**Frontend**: http://localhost:5173  
**Health Check**: http://localhost:3000/health

## 🔐 Test Credentials

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hiring-system.com | Admin@123456 |
| **HR Manager** | hr@hiring-system.com | HRManager@123 |
| **Recruiter** | recruiter@hiring-system.com | Recruiter@123 |
| **Interviewer** | interviewer@hiring-system.com | Interviewer@123 |
| **Applicant** | applicant@example.com | Applicant@123 |

## 📋 Verification Checklist

- [ ] Docker services running (`docker-compose ps`)
- [ ] Backend health check returns 200 (`curl http://localhost:3000/health`)
- [ ] Frontend loads at http://localhost:5173
- [ ] Can login with test credentials
- [ ] Database has seed data (check Prisma Studio: `npx prisma studio`)

## 🧪 Testing the System

### 1. Login as Applicant

```
Email: applicant@example.com
Password: Applicant@123
```

- View available jobs
- Apply to jobs
- View own applications

### 2. Login as Recruiter

```
Email: recruiter@hiring-system.com
Password: Recruiter@123
```

- Create new jobs
- View applications
- Change application status
- View department-specific data

### 3. Login as Admin

```
Email: admin@hiring-system.com
Password: Admin@123456
```

- Full system access
- View all departments
- Access audit logs
- Manage users

## 🛠️ Development Tools

### Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555

### API Testing

Use the included test credentials with tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code)

### Logs

```bash
# Backend logs
cd backend
tail -f logs/combined-$(date +%Y-%m-%d).log

# Docker logs
docker-compose logs -f
```

## 🔧 Common Issues

### Port Already in Use

```bash
# Check what's using ports
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill process or change ports in .env
```

### Database Connection Error

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres pg_isready -U hiring_user
```

### Redis Connection Error

```bash
# Restart Redis
docker-compose restart redis

# Test connection
docker-compose exec redis redis-cli ping
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

## 📚 Next Steps

1. **Read Documentation**
   - [README.md](./README.md) - System overview
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
   - API documentation at `/api-docs` (when backend runs)

2. **Explore Features**
   - Multi-factor authentication setup
   - Permission-based access control
   - Audit log tracking
   - Application workflow

3. **Customize**
   - Update branding in frontend
   - Configure email templates
   - Add custom job fields
   - Extend user roles

## 🔒 Security Notes

- **Change default passwords** before production
- **Generate new JWT secrets** (see DEPLOYMENT.md)
- **Configure CORS** for your domain
- **Enable HTTPS** in production
- **Set up backup procedures**

## 💡 Tips

- Use **Prisma Studio** to inspect database
- Check **audit logs** to understand authorization flow
- Review **middleware order** in `backend/src/app.ts`
- Explore **permission caching** in Redis
- Test with **different user roles** to see authorization in action

## 🆘 Getting Help

1. Check health endpoints: `/health` and `/health/ready`
2. Review logs in `backend/logs/`
3. Inspect Docker container logs
4. Check Prisma schema for data structure
5. Review middleware pipeline for request flow

---

**Ready to build! This is a production-grade system. Treat it with the security and rigor it deserves. 🚀**

