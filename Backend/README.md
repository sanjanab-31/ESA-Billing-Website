# ESA Billing Backend

Secure Node.js/Express backend for ESA Billing Website using Firebase Admin SDK.

## Features

- 🔒 **Secure Firebase Integration**: All Firebase credentials stored server-side
- 🚀 **RESTful API**: Clean API endpoints for all operations
- 🛡️ **Security**: Helmet, CORS, Rate Limiting
- 📊 **Complete CRUD**: Customers, Invoices, Payments, Products, Settings
- 📈 **Dashboard Analytics**: Real-time statistics and insights
- 🔐 **Authentication**: Firebase Auth integration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in the Backend directory

### 3. Environment Configuration

Create a `.env` file in the Backend directory:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_NAME=esabilling
SESSION_SECRET=your-random-secret-key-here
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase ID token
- `GET /api/auth/user/:uid` - Get user by UID
- `POST /api/auth/user` - Create user
- `PUT /api/auth/user/:uid` - Update user
- `DELETE /api/auth/user/:uid` - Delete user

### Customers
- `GET /api/customers` - Get all customers (with filtering)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - Get all invoices (with filtering)
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments?invoiceId=xxx` - Get payments by invoice
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update setting

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Query Parameters

Most GET endpoints support:
- `search` - Search term
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Field to sort by
- `sortDirection` - 'asc' or 'desc'
- `status` - Filter by status

## Security Features

1. **Helmet**: Sets security headers
2. **CORS**: Configured for frontend origin only
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Input Validation**: Request body size limits
5. **Environment Variables**: Sensitive data in .env

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

## Health Check

```bash
GET /health
```

Returns server status and timestamp.

## Development

The server uses nodemon for auto-reload during development. Any changes to `.js` files will automatically restart the server.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name esa-billing-backend
   ```

## Troubleshooting

### Firebase Connection Issues
- Verify `serviceAccountKey.json` is in the correct location
- Check Firebase project ID in `.env`
- Ensure Firebase Admin SDK is properly initialized

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Check that credentials are enabled in CORS config

### Rate Limiting
- Adjust limits in `server.js` if needed
- Consider IP whitelisting for trusted sources

## License

ISC
