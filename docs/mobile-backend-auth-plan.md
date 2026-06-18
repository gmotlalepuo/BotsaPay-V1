# BotsaPay Mobile Backend Auth Plan

The Expo app authenticates with Supabase directly and sends the current access token to the existing Next.js API:

```http
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

The current web backend is documented as cookie-auth-first. Before wallet, transfer, QR, payment, notification, and complaint routes can work from Android, the Next.js API must also accept bearer tokens.

## Required Backend Work

1. Add an auth helper that reads the request `Authorization` header.
2. If a bearer token exists, verify it with Supabase using `supabase.auth.getUser(token)`.
3. Create a Supabase server client scoped to that user's JWT for RLS-safe reads and writes.
4. Keep the existing web cookie flow so the web app continues to work.
5. Update protected API routes to use the shared helper.
6. Return `401` for missing/invalid tokens and `403` for valid users without access.

## Routes Needed By Mobile

- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/wallets`
- `POST /api/wallets`
- `GET /api/wallets/[id]`
- `PATCH /api/wallets/[id]`
- `POST /api/transfers`
- `GET /api/transfers`
- `POST /api/qr-codes`
- `GET /api/qr-codes`
- `PATCH /api/qr-codes/[id]`
- `GET /api/qr-codes/resolve/[token]`
- `POST /api/qr-codes/card-checkout`
- `POST /api/payments/create-checkout`
- `GET /api/notifications`
- `PATCH /api/notifications`
- `DELETE /api/notifications`
- `POST /api/complaints`
- `GET /api/complaints`

## Mobile Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_BASE_URL=https://your-botsapay-web-domain.com
```

Never add service role keys, Stripe secret keys, database passwords, or webhook secrets to the mobile app.
