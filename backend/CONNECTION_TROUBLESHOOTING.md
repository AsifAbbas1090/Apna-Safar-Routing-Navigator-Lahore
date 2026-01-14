# Connection Troubleshooting

## Current Status

✅ **Prisma Configuration Fixed**: The `prisma.config.ts` is now correct with:
- Top-level `datasource.url` (required for `prisma db push`)
- `migrate.datasourceUrl` (for migrations)
- `db.adapter.url` (for runtime)

✅ **Password Encoding**: Password with space is now URL-encoded (`Muhammad%20pbuh1090`)

❌ **Connection Error**: Still getting `P1001: Can't reach database server`

## Possible Issues

### 1. Supabase Connection Pooler Required

According to your Supabase dashboard, it says:
> "Not IPv4 compatible Use Session Pooler if on a IPv4 network"

**Solution**: Try using the connection pooler instead of direct connection.

The pooler connection string format:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Instead of:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 2. Network/Firewall

- Check if your network allows outbound connections to port 5432
- Some corporate networks block PostgreSQL ports
- Try from a different network (mobile hotspot)

### 3. Supabase Database Status

- Check Supabase dashboard to ensure database is active (not paused)
- Verify the project is not in sleep mode

### 4. Connection String Format

Current format in `.env`:
```
DATABASE_URL="postgresql://postgres:Muhammad%20pbuh1090@db.rkfnimpgxmkmqxlkzxur.supabase.co:5432/postgres"
```

**Try these alternatives:**

**Option A: Without quotes (sometimes needed)**
```
DATABASE_URL=postgresql://postgres:Muhammad%20pbuh1090@db.rkfnimpgxmkmqxlkzxur.supabase.co:5432/postgres
```

**Option B: Using connection pooler (port 6543)**
```
DATABASE_URL="postgresql://postgres.rkfnimpgxmkmqxlkzxur:Muhammad%20pbuh1090@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Option C: Direct connection with IPv4**
If you have IPv4 add-on, use the IPv4 connection string from Supabase dashboard.

## Next Steps

1. **Check Supabase Dashboard**:
   - Go to Settings → Database
   - Copy the connection string from there
   - Make sure to use the correct format (Direct connection vs Pooler)

2. **Test Connection Manually**:
   ```bash
   # Test if you can reach the server
   telnet db.rkfnimpgxmkmqxlkzxur.supabase.co 5432
   ```

3. **Try Connection Pooler**:
   - Use port 6543 instead of 5432
   - Format: `postgres.[PROJECT-REF]` instead of `postgres`

4. **Verify Password**:
   - Make sure the password is correct
   - Try resetting the database password in Supabase dashboard

## Quick Fix to Try

Update `.env` to use connection pooler:

```env
DATABASE_URL="postgresql://postgres.rkfnimpgxmkmqxlkzxur:Muhammad%20pbuh1090@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Replace `[REGION]` with your Supabase region (e.g., `us-east-1`, `ap-south-1`).

You can find the exact pooler connection string in your Supabase dashboard under Settings → Database → Connection Pooling.

