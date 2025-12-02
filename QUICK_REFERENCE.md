# 🚀 Quick Reference - Backend API

## Setup Commands

```bash
# Backend Setup
cd Backend
npm install
cp .env.example .env
# Edit .env with your Firebase project details
# Download serviceAccountKey.json from Firebase Console
npm run setup-db
npm run dev

# Frontend Setup
cd Frontend
# Add to .env: VITE_API_URL=http://localhost:5000/api
npm run dev
```

## API Endpoints Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Customers
```http
GET    /api/customers              # List all
GET    /api/customers/:id          # Get one
POST   /api/customers              # Create
PUT    /api/customers/:id          # Update
DELETE /api/customers/:id          # Delete
```

### Invoices
```http
GET    /api/invoices               # List all
GET    /api/invoices/:id           # Get one
POST   /api/invoices               # Create
PUT    /api/invoices/:id           # Update
DELETE /api/invoices/:id           # Delete
```

### Payments
```http
GET    /api/payments               # List all
GET    /api/payments?invoiceId=X   # By invoice
POST   /api/payments               # Create
PUT    /api/payments/:id           # Update
DELETE /api/payments/:id           # Delete
```

### Products
```http
GET    /api/products               # List all
GET    /api/products/:id           # Get one
POST   /api/products               # Create
PUT    /api/products/:id           # Update
DELETE /api/products/:id           # Delete
```

### Settings
```http
GET    /api/settings               # Get all
PUT    /api/settings/:key          # Update one
```

### Dashboard
```http
GET    /api/dashboard/stats        # Get statistics
```

### Auth
```http
POST   /api/auth/verify            # Verify token
GET    /api/auth/user/:uid         # Get user
POST   /api/auth/user              # Create user
PUT    /api/auth/user/:uid         # Update user
DELETE /api/auth/user/:uid         # Delete user
```

## Query Parameters

```
?search=term          # Search filter
?page=1               # Page number
?limit=20             # Items per page
?status=active        # Status filter
?sortBy=createdAt     # Sort field
?sortDirection=desc   # Sort direction
?customerId=xxx       # Filter by customer
?invoiceId=xxx        # Filter by invoice
```

## Example Requests

### Get Customers (with search)
```bash
curl "http://localhost:5000/api/customers?search=john&page=1&limit=10"
```

### Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }'
```

### Update Invoice
```bash
curl -X PUT http://localhost:5000/api/invoices/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "paid"
  }'
```

## Frontend Integration

### Update useFirestore.js
```javascript
// Change this:
import { ... } from "../lib/firestore/services";

// To this:
import { ... } from "../lib/api/services";
```

### Add to Frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
```

## Common Issues & Fixes

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Check `FRONTEND_URL` in `Backend/.env` matches your frontend URL

### 401 Unauthorized
```
Error: 401 Unauthorized
```
**Fix:** Ensure you're logged in and token is being sent

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Fix:** Start the backend server with `npm run dev`

### Firebase Not Initialized
```
Error: Firebase not initialized
```
**Fix:** 
1. Check `serviceAccountKey.json` exists
2. Verify `FIREBASE_PROJECT_ID` in `.env`
3. Run `npm run setup-db`

## File Locations

```
Backend/
├── .env                          # Environment config
├── serviceAccountKey.json        # Firebase credentials
├── server.js                     # Main server
└── setup-db.js                   # Setup script

Frontend/
├── .env                          # Add VITE_API_URL here
└── src/
    ├── hooks/
    │   └── useFirestore.js       # Update imports here
    └── lib/
        └── api/
            ├── client.js         # API client
            └── services.js       # Backend services
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] `http://localhost:5000/health` returns OK
- [ ] Frontend connects to backend
- [ ] Login works
- [ ] Can view customers
- [ ] Can create customer
- [ ] Can update customer
- [ ] Can delete customer
- [ ] Dashboard shows stats
- [ ] Network tab shows no Firebase URLs

## Production Deployment

### Backend
```bash
# Set environment
NODE_ENV=production

# Use PM2
npm install -g pm2
pm2 start server.js --name esa-billing-backend

# Or use Docker
docker build -t esa-billing-backend .
docker run -p 5000:5000 esa-billing-backend
```

### Frontend
```bash
# Update .env
VITE_API_URL=https://your-backend-domain.com/api

# Build
npm run build

# Deploy dist/ folder to hosting
```

## Security Checklist

- [x] ✅ Firebase credentials on server only
- [x] ✅ Rate limiting enabled (100/15min)
- [x] ✅ CORS configured
- [x] ✅ Helmet security headers
- [x] ✅ Input validation
- [x] ✅ JWT authentication
- [ ] ⏳ HTTPS in production
- [ ] ⏳ Environment-specific configs
- [ ] ⏳ Logging and monitoring

## Support

📚 **Documentation:**
- Backend API: `Backend/README.md`
- Integration Guide: `BACKEND_INTEGRATION_GUIDE.md`
- Architecture: `ARCHITECTURE.md`
- Setup Summary: `BACKEND_SETUP_SUMMARY.md`

🔧 **Troubleshooting:**
1. Check backend console for errors
2. Check frontend console for errors
3. Verify environment variables
4. Check Network tab in browser
5. Review error messages carefully

## Quick Commands

```bash
# Start backend
cd Backend && npm run dev

# Start frontend  
cd Frontend && npm run dev

# Test backend health
curl http://localhost:5000/health

# View backend logs
cd Backend && npm run dev

# Setup database
cd Backend && npm run setup-db
```

---
**Last Updated:** 2025-12-02
