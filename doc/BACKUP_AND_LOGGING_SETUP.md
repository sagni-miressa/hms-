# Automated Backups & Centralized Logging Setup

This guide explains how to configure automated backups and centralized logging for the Hiring Management System.

---

## 🔄 Automated Backup Scheduling

### Overview

The system includes automated backup scheduling using `node-cron` to:

- Backup PostgreSQL database daily
- Backup Redis data daily
- Clean old backups based on retention policy
- Upload backups to S3 (optional)
- Send alerts on backup failures

### Configuration

Add to `backend/.env`:

```env
# ============================================================================
# BACKUP CONFIGURATION
# ============================================================================

# Enable automated backups
BACKUP_ENABLED=true

# Backup directory (default: ./backups)
BACKUP_DIR=./backups

# Retention policy (days)
BACKUP_RETENTION_DAYS=30

# Database backup settings
BACKUP_DATABASE_ENABLED=true
BACKUP_DATABASE_SCHEDULE=0 2 * * *  # Daily at 2 AM (cron format)
POSTGRES_CONTAINER_NAME=hiring_postgres  # If using Docker

# Redis backup settings
BACKUP_REDIS_ENABLED=true
BACKUP_REDIS_SCHEDULE=0 3 * * *  # Daily at 3 AM (cron format)
REDIS_CONTAINER_NAME=hiring_redis  # If using Docker

# S3 Backup (optional)
BACKUP_S3_ENABLED=false
BACKUP_S3_BUCKET=your-backup-bucket
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ACCESS_KEY_ID=your-access-key
BACKUP_S3_SECRET_ACCESS_KEY=your-secret-key
```

### Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**

- `0 2 * * *` - Daily at 2:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 0 1 * *` - Monthly on the 1st at midnight

### Manual Backup Commands

```bash
# Backup database only
npm run backup:db -w backend

# Backup Redis only
npm run backup:redis -w backend

# Backup everything
npm run backup:all -w backend
```

### Backup Location

Backups are stored in:

```
backend/backups/
├── database/
│   ├── database-2025-12-19-02-00-00.sql
│   └── database-2025-12-20-02-00-00.sql
└── redis/
    ├── redis-2025-12-19-03-00-00.rdb
    └── redis-2025-12-20-03-00-00.rdb
```

### Backup Verification

Backups are automatically verified:

- File size check (must be > 0)
- Format validation (PostgreSQL dump or Redis RDB format)
- Integrity checks

### Retention Policy

Old backups are automatically deleted based on `BACKUP_RETENTION_DAYS`:

- Default: 30 days
- Configurable per environment
- Logs deletion events

### S3 Backup (Optional)

To enable S3 backups:

1. **Create S3 Bucket:**

   ```bash
   aws s3 mb s3://your-backup-bucket --region us-east-1
   ```

2. **Configure IAM Policy:**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject"],
         "Resource": "arn:aws:s3:::your-backup-bucket/*"
       }
     ]
   }
   ```

3. **Set Environment Variables:**
   ```env
   BACKUP_S3_ENABLED=true
   BACKUP_S3_BUCKET=your-backup-bucket
   BACKUP_S3_REGION=us-east-1
   BACKUP_S3_ACCESS_KEY_ID=your-access-key
   BACKUP_S3_SECRET_ACCESS_KEY=your-secret-key
   ```

### Backup API Endpoints

**Get Backup Status** (Admin only):

```bash
GET /api/v1/system/backup/status
Authorization: Bearer <token>
```

**Trigger Database Backup** (Admin only):

```bash
POST /api/v1/system/backup/database
Authorization: Bearer <token>
```

**Trigger Redis Backup** (Admin only):

```bash
POST /api/v1/system/backup/redis
Authorization: Bearer <token>
```

### Monitoring

- Backup failures trigger email alerts
- Backup status available via API
- All backup operations logged in audit trail
- Scheduler status tracked

---

## 📊 Centralized Logging Integration

### Overview

The system supports multiple centralized logging transports:

- **Logstash/ELK Stack** - For Elasticsearch, Logstash, Kibana
- **AWS CloudWatch** - For AWS-hosted applications
- **HTTP Webhook** - For custom log aggregation services
- **Syslog** - For system-level logging

### Logstash/ELK Stack

#### Setup

1. **Install Winston Logstash Transport** (optional):

   ```bash
   cd backend
   npm install winston-logstash
   ```

2. **Configure Environment Variables:**

   ```env
   LOGSTASH_ENABLED=true
   LOGSTASH_HOST=logstash.example.com
   LOGSTASH_PORT=5000
   LOGSTASH_PROTOCOL=tcp  # or 'udp'
   LOGSTASH_NODE_NAME=hiring-api-1
   ```

3. **Logstash Configuration** (`logstash.conf`):

   ```ruby
   input {
     tcp {
       port => 5000
       codec => json
     }
   }

   filter {
     # Add any filters here
   }

   output {
     elasticsearch {
       hosts => ["elasticsearch:9200"]
       index => "hiring-api-%{+YYYY.MM.dd}"
     }
   }
   ```

#### Log Format

Logs are sent as JSON with:

- `level` - Log level (info, warn, error, etc.)
- `message` - Log message
- `timestamp` - ISO timestamp
- `service` - Service name (hiring-api)
- `environment` - Environment (development/production)
- All metadata fields

---

### AWS CloudWatch Logs

#### Setup

1. **Install Winston CloudWatch Transport** (optional):

   ```bash
   cd backend
   npm install winston-cloudwatch
   ```

2. **Create CloudWatch Log Group:**

   ```bash
   aws logs create-log-group --log-group-name /aws/hiring-api
   ```

3. **Configure Environment Variables:**

   ```env
   CLOUDWATCH_ENABLED=true
   CLOUDWATCH_GROUP_NAME=/aws/hiring-api
   CLOUDWATCH_STREAM_NAME=hiring-api-production
   CLOUDWATCH_REGION=us-east-1
   CLOUDWATCH_ACCESS_KEY_ID=your-access-key
   CLOUDWATCH_SECRET_ACCESS_KEY=your-secret-key
   ```

4. **IAM Policy Required:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "logs:CreateLogGroup",
           "logs:CreateLogStream",
           "logs:PutLogEvents"
         ],
         "Resource": "arn:aws:logs:*:*:*"
       }
     ]
   }
   ```

---

### HTTP Webhook (Custom Log Aggregation)

#### Setup

1. **Configure Environment Variables:**

   ```env
   LOG_WEBHOOK_ENABLED=true
   LOG_WEBHOOK_URL=https://logs.example.com/api/logs
   LOG_WEBHOOK_USERNAME=api-user  # Optional
   LOG_WEBHOOK_PASSWORD=api-password  # Optional
   ```

2. **Webhook Format:**
   - Method: POST
   - Content-Type: application/json
   - Headers: X-Service, X-Environment
   - Body: JSON log entry

---

### Syslog

#### Setup

1. **Configure Environment Variables:**

   ```env
   SYSLOG_ENABLED=true
   SYSLOG_HOST=syslog.example.com
   SYSLOG_PORT=514
   SYSLOG_PROTOCOL=udp  # or 'tcp'
   SYSLOG_LOCALHOST=hiring-api
   ```

2. **Syslog Server Configuration:**
   - Ensure syslog server is listening on specified port
   - Configure firewall rules if needed

---

### Log Format

All centralized logs include:

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2025-12-19T12:50:37.231Z",
  "service": "hiring-api",
  "environment": "production",
  "type": "audit",
  "userId": "user-id-123",
  "action": "LOGIN_SUCCESS",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "requestId": "xwQ-vrCFVrT6JzOPWE1M_"
}
```

### Log Levels

- **error** - Application errors
- **warn** - Security events, warnings
- **info** - General information, audit logs
- **debug** - Detailed debugging (development only)
- **http** - HTTP request logs

### Sensitive Data Masking

The logger automatically:

- **Removes** sensitive fields: passwords, tokens, secrets
- **Masks** PII fields: emails, IPs, phone numbers
- **Encrypts** sensitive audit log data

---

## 🔧 Installation

### Install Dependencies

```bash
cd backend
npm install
```

**Optional Dependencies** (install only if using):

```bash
# For Logstash
npm install winston-logstash

# For CloudWatch
npm install winston-cloudwatch
```

### Verify Setup

1. **Check Backup Status:**

   ```bash
   curl http://localhost:5000/api/v1/system/backup/status \
     -H "Authorization: Bearer <admin-token>"
   ```

2. **Test Manual Backup:**

   ```bash
   npm run backup:all -w backend
   ```

3. **Check Logs:**
   ```bash
   # Check if centralized logging is working
   tail -f backend/logs/combined-$(date +%Y-%m-%d).log
   ```

---

## 📋 Environment Variables Summary

### Backup Configuration

```env
BACKUP_ENABLED=true
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
BACKUP_DATABASE_ENABLED=true
BACKUP_DATABASE_SCHEDULE=0 2 * * *
BACKUP_REDIS_ENABLED=true
BACKUP_REDIS_SCHEDULE=0 3 * * *
POSTGRES_CONTAINER_NAME=hiring_postgres
REDIS_CONTAINER_NAME=hiring_redis
BACKUP_S3_ENABLED=false
BACKUP_S3_BUCKET=
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ACCESS_KEY_ID=
BACKUP_S3_SECRET_ACCESS_KEY=
```

### Centralized Logging Configuration

```env
# Logstash
LOGSTASH_ENABLED=false
LOGSTASH_HOST=
LOGSTASH_PORT=5000
LOGSTASH_PROTOCOL=tcp
LOGSTASH_NODE_NAME=hiring-api

# CloudWatch
CLOUDWATCH_ENABLED=false
CLOUDWATCH_GROUP_NAME=
CLOUDWATCH_STREAM_NAME=
CLOUDWATCH_REGION=us-east-1
CLOUDWATCH_ACCESS_KEY_ID=
CLOUDWATCH_SECRET_ACCESS_KEY=

# HTTP Webhook
LOG_WEBHOOK_ENABLED=false
LOG_WEBHOOK_URL=
LOG_WEBHOOK_USERNAME=
LOG_WEBHOOK_PASSWORD=

# Syslog
SYSLOG_ENABLED=false
SYSLOG_HOST=
SYSLOG_PORT=514
SYSLOG_PROTOCOL=udp
SYSLOG_LOCALHOST=hiring-api
```

---

## 🚨 Troubleshooting

### Backup Issues

**Backup fails with "command not found":**

- Ensure `pg_dump` and `redis-cli` are installed
- Or use Docker container names for containerized deployments

**Backup file is empty:**

- Check database/Redis connection
- Verify permissions on backup directory
- Check disk space

**Scheduler not running:**

- Verify `BACKUP_ENABLED=true`
- Check cron schedule format
- Review server logs for errors

### Logging Issues

**Logs not reaching centralized service:**

- Verify transport is enabled in environment
- Check network connectivity
- Review transport-specific configuration
- Check if optional package is installed

**Too many logs:**

- Adjust `LOG_LEVEL` environment variable
- Configure log filtering in centralized service
- Review log retention policies

---

## ✅ Verification Checklist

- [ ] Backups enabled and scheduled
- [ ] Backup directory created and writable
- [ ] Manual backup test successful
- [ ] Retention policy configured
- [ ] S3 backup configured (if using)
- [ ] Centralized logging transport configured
- [ ] Logs reaching centralized service
- [ ] Backup status API accessible
- [ ] Alerts configured for backup failures

---

**Last Updated**: December 2025  
**Version**: 1.0
