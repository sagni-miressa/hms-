# Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 15+
- Redis 7+
- Node.js 20+
- Domain with SSL certificate (for production)

## Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Setup Environment

```bash
# Copy environment example
cp .env.example .env

# Edit .env with your local values
nano .env
```

### 3. Start Services with Docker

```bash
# Start PostgreSQL, Redis, MinIO
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### 4. Setup Database

```bash
# Run migrations
npm run migrate -w backend

# Seed database with test data
npm run seed -w backend
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev -w backend
npm run dev -w frontend
```

- Backend: http://localhost:3000
- Frontend: http://localhost:3005
- API Docs: http://localhost:3000/api/v1

## Production Deployment

### Option 1: Docker Compose (Recommended)

#### 1. Prepare Production Environment

```bash
# Copy production environment template
cp .env.production.example .env.production

# Generate JWT secrets
openssl rand -base64 64  # For JWT_ACCESS_SECRET
openssl rand -base64 64  # For JWT_REFRESH_SECRET

# Edit with production values
nano .env.production
```

#### 2. Build Images

```bash
# Build backend
docker build -f Dockerfile.backend -t hiring-system-backend:latest .

# Build frontend
docker build -f Dockerfile.frontend -t hiring-system-frontend:latest .
```

#### 3. Deploy

```bash
# Load environment
export $(cat .env.production | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Check health
docker-compose -f docker-compose.prod.yml ps
curl http://localhost/health
```

### Option 2: Manual Deployment

#### Backend

```bash
cd backend

# Install production dependencies
npm ci --only=production

# Build
npm run build

# Run migrations
npm run migrate:prod

# Start with PM2
pm2 start dist/server.js --name hiring-api -i max
pm2 save
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build
npm run build

# Serve with nginx
# Copy dist/ to /var/www/hiring-system
```

## Environment Variables (Critical)

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_ACCESS_SECRET` - Access token secret (min 64 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (min 64 chars)

### Security

- `BCRYPT_ROUNDS` - Password hashing rounds (12 recommended)
- `SESSION_SECRET` - Session encryption secret
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)
- `ADMIN_IP_WHITELIST` - Admin IP whitelist (comma-separated)

### Optional

- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` - File storage
- `SMTP_*` - Email configuration
- `SENTRY_DSN` - Error tracking
- `RECAPTCHA_SECRET_KEY` - Bot protection

## Health Checks

### Backend

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
```

### Database

```bash
docker-compose exec postgres pg_isready -U hiring_user
```

### Redis

```bash
docker-compose exec redis redis-cli ping
```

## Monitoring

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# All services
docker-compose logs -f

# Tail specific log file
tail -f backend/logs/combined-$(date +%Y-%m-%d).log
```

### Metrics

- Health endpoint: `/health`
- Ready endpoint: `/health/ready`
- Prometheus metrics: `/metrics` (if enabled)

## Backup & Recovery

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U hiring_user hiring_system > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U hiring_user hiring_system < backup_20231218.sql
```

### Redis Backup

```bash
# Backup (Redis persistence enabled by default)
docker-compose exec redis redis-cli BGSAVE

# Copy dump.rdb
docker cp hiring_redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (64+ chars)
- [ ] Enable SSL/TLS (Let's Encrypt recommended)
- [ ] Configure firewall rules
- [ ] Set up fail2ban for brute force protection
- [ ] Enable Redis password authentication
- [ ] Restrict database access to backend only
- [ ] Configure CORS properly
- [ ] Set up admin IP whitelist
- [ ] Enable MFA for privileged accounts
- [ ] Review and test backup procedures
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation
- [ ] Review Prisma migrations
- [ ] Test rate limiting
- [ ] Verify audit logging

## Scaling

### Horizontal Scaling (Multiple API Nodes)

1. Run multiple backend containers
2. Use nginx/HAProxy for load balancing
3. Ensure Redis session storage is used
4. Consider read replicas for database

### Vertical Scaling

1. Increase container resources
2. Optimize database indexes
3. Tune connection pool sizes
4. Enable Redis caching aggressively

## Troubleshooting

### Backend won't start

- Check environment variables
- Verify database connection
- Check Redis connection
- Review logs: `docker-compose logs backend`

### Database connection issues

- Verify DATABASE_URL format
- Check database is running: `docker-compose ps postgres`
- Test connection: `docker-compose exec postgres pg_isready`

### Redis connection issues

- Verify REDIS_URL format
- Check Redis is running: `docker-compose ps redis`
- Test connection: `docker-compose exec redis redis-cli ping`

### Permission errors

- Check file ownership
- Verify user has correct permissions
- Review Docker user configuration

## Support

For issues, consult:

- README.md - Project overview
- Architecture diagrams
- Prisma schema documentation
- API endpoint documentation

---

**Remember: Security is paramount. This system handles sensitive hiring data. Follow all security guidelines.**
