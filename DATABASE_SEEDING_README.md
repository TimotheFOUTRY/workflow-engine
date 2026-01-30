# 🌱 Database Seeding - Complete

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tested](https://img.shields.io/badge/tested-passing-success)

## Quick Start

```bash
make seed-test
```

That's it! Your database is now filled with test data.

## What You Get

### 👥 5 Test Users

- **Admin**: `admin@workflow.com` / `admin123`
- **Manager**: `bob.manager@workflow.com` / `password123`  
- **User 1**: `john.doe@workflow.com` / `password123`
- **User 2**: `jane.smith@workflow.com` / `password123`
- **Pending**: `alice.pending@workflow.com` / `password123`

### 📝 2 Ready-to-Use Forms

- **Leave Request** - Complete form with dates, type, and reason
- **Purchase Request** - Form with item, quantity, cost, and urgency

### 🔄 2 Functional Workflows

- **Leave Validation Workflow** - Full approval process
- **Purchase Workflow** - Multi-level approval with conditions

### 📋 Sample Instances & Tasks

- 1 running instance with a pending task
- 1 completed instance with full history

## Full Workflow (First Time)

```bash
# Start services
make dev-d

# Wait for services to be ready
sleep 10

# Run migrations
make migrate

# Fill database
make seed-test
```

## Login

Go to http://localhost:3000 and login with:

```
Email: admin@workflow.com
Password: admin123
```

## Verification

### Check Users
```bash
make db-shell
SELECT email, role, status FROM users;
```

### API Test
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@workflow.com", "password": "admin123"}'
```

## Features

✅ **Idempotent** - Can be run multiple times safely  
✅ **Complete** - Users, forms, workflows, instances, tasks  
✅ **Realistic** - Real-world scenarios for testing  
✅ **Well Documented** - Comprehensive guides included  
✅ **Production Safe** - Clear warnings about security  

## Other Commands

```bash
make seed         # Create admin only
make db-reset     # Reset database completely
make db-shell     # Open PostgreSQL shell
make backup-db    # Backup database
make help         # See all commands
```

## Documentation

- [QUICK_START.md](QUICK_START.md) - 4-step startup guide
- [docs/DATABASE_SEEDING.md](docs/DATABASE_SEEDING.md) - Complete guide
- [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md) - Quick credentials reference
- [SEED_IMPLEMENTATION_SUMMARY.md](SEED_IMPLEMENTATION_SUMMARY.md) - Technical details

## Security Warning

⚠️ **These credentials are for DEVELOPMENT ONLY**

**NEVER use these passwords in production!**

- Don't use `make seed-test` in production
- Create users manually with strong passwords
- Use environment variables for credentials
- Enable 2FA when available

## Tested & Verified

| Test | Status |
|------|--------|
| Script execution | ✅ Pass |
| Database creation | ✅ 5 users, 2 workflows, 2 tasks |
| Admin login | ✅ Token generated |
| User login | ✅ Success |
| Workflows API | ✅ 2 workflows returned |
| Manager tasks | ✅ 2 tasks (1 pending, 1 completed) |
| DB verification | ✅ All data present |

## Files Added

- `backend/src/migrations/seed-test-data.js` - Main seed script
- `docs/DATABASE_SEEDING.md` - Complete documentation
- `QUICK_START.md` - Fast startup guide
- `TEST_CREDENTIALS.md` - Credentials list
- Updated `Makefile` with `seed-test` command
- Updated `backend/package.json` with npm script
- Updated `README.md` with seed instructions

## Support

Having issues? Check:

1. Services are running: `make status`
2. Migrations are done: `make migrate`
3. Full reset if needed: `make db-reset && make seed-test`

---

**Ready to develop!** 🚀

Your Workflow Engine is now 100% operational with test data.

*Created: January 29, 2026*
