# Backend API Integration Guide

This guide explains how to integrate the secure backend API with your frontend.

## Overview

All Firebase operations have been moved to the backend for security. The frontend now communicates with the backend via REST API instead of directly with Firebase.

## Setup Steps

### 1. Backend Setup

#### Install Dependencies
```bash
cd Backend
npm install
```

#### Configure Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the file as `serviceAccountKey.json` in the `Backend` directory

#### Configure Environment Variables

Create `Backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_NAME=esabilling
SESSION_SECRET=your-random-secret-key-here
```

Replace `your-project-id` with your actual Firebase project ID.

#### Test Backend Setup

```bash
npm run setup-db
```

This will verify Firebase connection and create default settings.

#### Start Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

#### Update Environment Variables

Add to your `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Keep your existing Firebase config variables - they're still needed for client-side authentication.

#### Update Service Imports

The frontend now has two service implementations:

1. **Old (Direct Firebase)**: `src/lib/firestore/services.js`
2. **New (Backend API)**: `src/lib/api/services.js`

To switch to the backend API, update your imports in `src/hooks/useFirestore.js`:

**Change from:**
```javascript
import {
  dashboardService,
  customerService,
  invoiceService,
  paymentService,
  productService,
  settingsService,
  subscribeToCollection,
} from "../lib/firestore/services";
```

**To:**
```javascript
import {
  dashboardService,
  customerService,
  invoiceService,
  paymentService,
  productService,
  settingsService,
  subscribeToCollection,
} from "../lib/api/services";
```

## What Changed?

### Security Improvements

✅ **Before**: Firebase credentials exposed in frontend code  
✅ **After**: All credentials secured on backend server

✅ **Before**: API keys visible in network tab  
✅ **After**: Only backend API calls visible, no Firebase keys

✅ **Before**: Direct database access from client  
✅ **After**: Controlled access through REST API with rate limiting

### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Frontend  │ ──────> │   Backend   │ ──────> │   Firebase   │
│  (React)    │  HTTP   │  (Express)  │  Admin  │  (Firestore) │
└─────────────┘         └─────────────┘   SDK   └──────────────┘
```

### API Endpoints

All endpoints are prefixed with `/api`:

- **Customers**: `/api/customers`
- **Invoices**: `/api/invoices`
- **Payments**: `/api/payments`
- **Products**: `/api/products`
- **Settings**: `/api/settings`
- **Dashboard**: `/api/dashboard/stats`
- **Auth**: `/api/auth/*`

### Real-time Updates

⚠️ **Important**: Real-time subscriptions (`subscribeToCollection`) are not yet implemented with the backend API.

**Options to implement:**

1. **WebSocket**: Add Socket.io for real-time updates
2. **Polling**: Use `setInterval` to fetch data periodically
3. **SSE**: Server-Sent Events for one-way real-time updates

For now, the subscription function returns a no-op. You can:
- Remove real-time listeners temporarily
- Implement polling in `useFirestore.js`
- Add WebSocket support to the backend

## Testing

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Get customers (requires auth)
curl http://localhost:5000/api/customers
```

### 2. Test Frontend Integration

1. Start backend: `cd Backend && npm run dev`
2. Start frontend: `cd Frontend && npm run dev`
3. Login to the application
4. Verify data loads correctly
5. Check browser Network tab - you should see calls to `localhost:5000/api` instead of Firebase

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Verify `FRONTEND_URL` in `Backend/.env` matches your frontend URL
2. Check that both servers are running
3. Clear browser cache

### Authentication Errors

If you see 401 errors:
1. Ensure you're logged in
2. Check that Firebase Auth is still configured in frontend
3. Verify the auth token is being sent in request headers

### Data Not Loading

1. Check backend console for errors
2. Verify Firebase service account key is valid
3. Check database name in backend `.env`
4. Ensure collections exist in Firestore

### Real-time Updates Not Working

This is expected - real-time subscriptions need to be implemented separately. For now:
1. Use manual refresh
2. Implement polling
3. Add WebSocket support

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use a process manager (PM2)
3. Set up HTTPS
4. Configure firewall rules
5. Use environment-specific `.env` files

### Frontend

1. Update `VITE_API_URL` to production backend URL
2. Build: `npm run build`
3. Deploy to hosting service
4. Ensure CORS is configured for production domain

## Next Steps

1. ✅ Backend API created
2. ✅ Frontend API client created
3. ⏳ Update service imports in hooks
4. ⏳ Test all functionality
5. ⏳ Implement real-time updates (optional)
6. ⏳ Deploy to production

## Support

For issues or questions:
1. Check backend logs: `Backend/` directory
2. Check frontend console
3. Verify environment variables
4. Review API documentation in `Backend/README.md`
